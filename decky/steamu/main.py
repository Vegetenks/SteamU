import base64, json, os, pathlib, shutil, sys, threading
import decky

ICI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ICI / "py_modules"))
os.environ.setdefault("PCV_DOSSIER", str(ICI / "donnees"))
TRANCHE_MAX = 4 * 1024 * 1024       
RESSOURCE_MAX = 32 * 1024 * 1024    
IMPORT = threading.Lock()           
FILM_VERROU = threading.Lock()      
PACK = "@steamu/"                   
VISITEURS = "@visiteurs/"           
BIENVENUE = "@bienvenue/"           
MII_DEFAUT = "@mii-defaut/"         
MOTEUR = "mii/moteur/"               
DISPOSITIONS_MAX = 8 * 1024 * 1024  
LARGEUR_VIGNETTE = 728              

def pid_reaper(appid, proc="/proc"):
    trouves = []
    for d in os.listdir(proc):
        if not d.isdigit(): continue
        try:
            a = pathlib.Path(f"{proc}/{d}/cmdline").read_bytes().split(b"\0")
            debut = int(pathlib.Path(f"{proc}/{d}/stat").read_text().rsplit(")", 1)[1].split()[19])
        except Exception: continue
        if a[0].endswith(b"/reaper") and b"SteamLaunch" in a[:3] and f"AppId={appid}".encode() in a[:4]: trouves.append((debut, int(d)))
    return max(trouves)[1] if trouves else 0

def processus_du_jeu(pid, exiles_seuls=False):
    import os
    enfants, porteurs = {}, set()
    try: marque = next((l.split(b"=", 1)[1] for l in open(f"/proc/{int(pid)}/environ", "rb").read().split(b"\0") if l.startswith(b"SteamGameId=")), None)
    except Exception: marque = None
    for d in os.listdir("/proc"):
        if not d.isdigit(): continue
        try:
            enfants.setdefault(int(open(f"/proc/{d}/stat").read().rsplit(")", 1)[1].split()[1]), []).append(int(d))
            if marque and b"SteamOverlayGameId=" + marque in open(f"/proc/{d}/environ", "rb").read().split(b"\0"): porteurs.add(int(d))
        except Exception: pass   
    def descendance(racines):
        vus, file = [], list(racines)
        while file:
            for e in enfants.get(file.pop(), []): vus.append(e); file.append(e)
        return vus
    dedans = set(descendance([int(pid)]))
    exiles = [p for p in porteurs if p not in dedans and p != int(pid)]
    exiles = set(exiles) | set(descendance(exiles))
    return sorted(exiles) if exiles_seuls else sorted(dedans | exiles)

class Plugin:
    async def _main(self):
        if sys.platform != "linux":
            decky.logger.warning("SteamU : système non compatible, aucune injection")
            return
        import asyncio, moteur, reprise
        import paquet
        try: decky.logger.info("SteamU : entrée Decky " + json.dumps(paquet.verifier(ICI)))
        except ValueError as e: decky.logger.error("SteamU : " + str(e))
        v = ".".join(json.loads((ICI / "package.json").read_text())["version"].split(".")[:3])
        notes = ICI / "nouveautes.json"
        moteur.GREFFON_JS += ";window.__pcvGreffon.nouveautes = " + json.dumps({"version": v,
            "notes": json.loads(notes.read_text(encoding="utf-8")).get(v, {}) if notes.exists() else {}})
        try: await asyncio.get_running_loop().run_in_executor(None, lambda: reprise.reprendre(
                decky.DECKY_HOME, moteur.ANCIEN_DOSSIER, pathlib.Path(decky.DECKY_PLUGIN_DIR).name, decky.logger.info))
        except Exception as e: decky.logger.warning(f"reprise de l'ancien greffon manquée : {type(e).__name__}")
        moteur.secours = moteur.Secours(pathlib.Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "secours.json")
        if moteur.secours.pause: decky.logger.warning(f"{moteur.NOM} : en pause ({moteur.secours.pause}), rien n'est posé")
        moteur.secours.au_plantage = lambda: threading.Thread(target=self._rapport_plantage, name="pcv-plantage", daemon=True).start()
        f = ICI / "donnees" / "outils" / "ffmpeg"
        if f.exists() and not shutil.which("ffmpeg"):
            try: f.chmod(0o755); os.environ["PATH"] = f"{os.environ.get('PATH', '/usr/bin:/bin')}:{f.parent}"
            except Exception as e: decky.logger.warning(f"ffmpeg embarqué inutilisable : {e}")
        import film_demarrage
        threading.Thread(target=self._poser_film, args=(self._film_apparence.read_text() if self._film_apparence.exists() else "clair",),
                         name="pcv-film", daemon=True).start()
        moteur.GREFFON_JS += ";window.__pcvGreffon.film = " + json.dumps(film_demarrage.NOTRE) + ";window.__pcvGreffon.image = " + json.dumps(film_demarrage.NOTRE_IMAGE) + ";window.__pcvGreffon.musique = " + json.dumps(film_demarrage.NOTRE_MUSIQUE)
        self.fil = threading.Thread(target=moteur.boucle, args=(pathlib.Path(os.environ["PCV_DOSSIER"]), decky.logger.info), daemon=True)
        self.fil.start()
        decky.logger.info(f"{moteur.NOM} : moteur lancé")
        self.lumiere = None
        threading.Thread(target=self._led, name="pcv-led-attente", daemon=True).start()
        try:
            v = json.loads((ICI / "package.json").read_text()).get("version")
            f = pathlib.Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "conflits.json"
            vue = json.loads(f.read_text()).get("version_vue") if f.exists() else None
            self.conflit_nouveau = vue != v
            f.write_text(json.dumps({"version_vue": v}))
        except Exception as e:
            self.conflit_nouveau = False; decky.logger.warning(f"avis de conflit : version non suivie ({type(e).__name__})")

    @property
    def _film_apparence(self): return pathlib.Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "film-apparence.txt"

    def _poser_film(self, choix):
        import film_demarrage
        apparence, _, haut = choix.partition(" ")
        try: film_demarrage.poser(ICI / "donnees", pathlib.Path(decky.DECKY_USER_HOME) / ".steam/steam/config/uioverrides/movies", apparence,
                                  pathlib.Path(decky.DECKY_PLUGIN_RUNTIME_DIR) / "prive/sons/wiiu/demarrage/demarrage.ogg",
                                  int(haut) if haut.isdigit() else film_demarrage.DEFAUT)
        except Exception as e: decky.logger.warning(f"vidéo de démarrage non copiée : {e}")

    async def film_apparence(self, apparence, largeur=None, hauteur=None):
        import asyncio, film_demarrage
        apparence = apparence if apparence in film_demarrage.APPARENCES else "clair"
        choix = f"{apparence} {film_demarrage.hauteur(largeur, hauteur)}"
        if self._film_apparence.exists() and self._film_apparence.read_text() == choix: return False
        self._film_apparence.write_text(choix)
        await asyncio.get_running_loop().run_in_executor(None, self._poser_film, choix)
        return True

    async def film_demarrage(self, actif):
        import asyncio, film_demarrage
        f = pathlib.Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "film-demarrage.json"
        def un():
            with FILM_VERROU: return film_demarrage.appliquer(f, bool(actif))
        try: return await asyncio.get_running_loop().run_in_executor(None, un)
        except Exception as e: decky.logger.warning(f"vidéo de démarrage non choisie : {type(e).__name__} {e}"); return None

    async def ancien(self):
        import moteur
        return {"actif": moteur.ancien_actif(), "textes": moteur.textes("ancien")}

    def _led(self):
        import time, moteur
        while moteur.ancien_actif() and not moteur.arreter: time.sleep(5)
        if moteur.arreter: return
        try:
            import lumiere
            from ambideck.capture import session_env   
            for k, v in session_env(os.stat(decky.DECKY_USER_HOME).st_uid).items(): os.environ.setdefault(k, v)
            led = lumiere.Lumiere(marque=pathlib.Path(decky.DECKY_PLUGIN_RUNTIME_DIR) / "led-en-main", journal=decky.logger.info,
                                  huesync=pathlib.Path(decky.DECKY_USER_HOME) / "homebrew/settings/HueSync/config.json")
            led.demarrer(); self.lumiere = led
        except Exception as e:
            decky.logger.warning(f"LED : non disponibles ({type(e).__name__})")

    def _dedans(self, chemin):
        if not isinstance(chemin, str) or "\0" in chemin: return None
        prive = pathlib.Path(decky.DECKY_PLUGIN_RUNTIME_DIR) / "prive"
        if chemin.startswith(PACK): racine, chemin = ICI / "donnees/sons-steamu", chemin[len(PACK):]
        elif chemin.startswith(VISITEURS): racine, chemin = ICI / "donnees/visiteurs", chemin[len(VISITEURS):]
        elif chemin.startswith(BIENVENUE): racine, chemin = ICI / "donnees/bienvenue", chemin[len(BIENVENUE):]
        elif chemin.startswith(MII_DEFAUT): racine, chemin = ICI / "donnees/mii-defaut", chemin[len(MII_DEFAUT):]
        elif chemin.startswith(MOTEUR) and not (prive / chemin).is_file(): racine, chemin = ICI / "donnees/mii-moteur", chemin[len(MOTEUR):]
        else: racine = prive
        racine = racine.resolve()
        p = (racine / chemin).resolve()
        return p if p.is_relative_to(racine) else None

    async def liste(self, dossier):
        d = self._dedans(dossier)
        if not d or not d.is_dir(): return []
        return sorted(f.name for f in d.iterdir() if f.is_file())

    async def nintendo(self):
        import importer
        def plein(chemin):   
            d = self._dedans(chemin)
            return bool(d and importer.plein(d))
        r = {appli: importer.manquants(appli, plein) for appli in importer.EXIGE}
        if IMPORT.locked(): r["_import"] = True
        return r

    async def import_depart(self):
        media = pathlib.Path("/run/media")
        try: return str(media) if any(media.iterdir()) else decky.DECKY_USER_HOME
        except OSError: return decky.DECKY_USER_HOME

    async def importer(self, chemin):
        import asyncio, importer
        prive = self._dedans(".")
        if not isinstance(chemin, str) or "\0" in chemin or not prive: return {"erreur": "chemin"}
        if not IMPORT.acquire(blocking=False): return {"erreur": "occupe"}   
        try:
            prive.mkdir(parents=True, exist_ok=True)
            return await asyncio.get_running_loop().run_in_executor(None, importer.importer, chemin, prive)
        except Exception as e:
            decky.logger.warning(f"import : {type(e).__name__} {e}")
            return {"erreur": type(e).__name__}
        finally: IMPORT.release()

    async def import_etat(self):
        import importer
        prive = self._dedans(".")
        return importer.etat(prive) if prive else {}

    async def moteur_installer(self):
        import asyncio, moteur_ffl
        prive = self._dedans(".")
        if not prive: return {"erreur": "ecriture"}
        if not IMPORT.acquire(blocking=False): return {"erreur": "occupe"}
        try: return await asyncio.get_running_loop().run_in_executor(None, moteur_ffl.installer, prive)
        except moteur_ffl.Refus as e: decky.logger.warning(f"moteur des Mii : refusé ({e})"); return {"erreur": str(e)}
        except Exception as e: decky.logger.warning(f"moteur des Mii : {type(e).__name__}"); return {"erreur": "reseau"}
        finally: IMPORT.release()

    async def vider_prive(self):
        import datetime
        base = pathlib.Path(decky.DECKY_PLUGIN_RUNTIME_DIR)
        prive = base / "prive"
        if not prive.exists(): return {"ok": True}
        cible = base / ("prive.corbeille-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
        try:
            shutil.move(str(prive), str(cible))
            decky.logger.info(f"SteamU : fichiers importés déplacés vers {cible.name} (rien n'est supprimé)")
            return {"ok": True}
        except Exception as e:
            decky.logger.warning(f"SteamU : déplacement de prive/ a échoué ({type(e).__name__})")
            return {"erreur": type(e).__name__}

    async def ressource(self, chemin):
        f = self._dedans(chemin)
        if not f or not f.is_file(): return None
        if f.stat().st_size > RESSOURCE_MAX: return None   
        return base64.b64encode(f.read_bytes()).decode()

    async def tranche(self, chemin, debut, taille):
        f = self._dedans(chemin)
        if not f or not f.is_file(): return None
        debut, taille = max(0, int(debut)), min(max(0, int(taille)), TRANCHE_MAX)
        with f.open("rb") as o:
            o.seek(debut)
            return {"taille": os.fstat(o.fileno()).st_size, "b64": base64.b64encode(o.read(taille)).decode()}

    async def led(self, intention, couleur=None):
        return bool(getattr(self, "lumiere", None) and self.lumiere.intention(intention, couleur))

    async def led_reglage(self, mode):
        return bool(getattr(self, "lumiere", None) and self.lumiere.reglage(mode))

    async def lecteurs(self):
        import asyncio, lecteurs
        return await asyncio.get_running_loop().run_in_executor(None, lecteurs.lister)

    async def lecteur(self, nom, action, position=None, piste=None):
        import asyncio, lecteurs
        return await asyncio.get_running_loop().run_in_executor(None, lambda: lecteurs.commander(nom, action, position, piste))

    async def spotpass(self, action, *args):
        import asyncio, spotpass
        f = {"envoyer": spotpass.envoyer, "lot": spotpass.lot, "signaler": spotpass.signaler, "effacer": spotpass.effacer}.get(action)
        if f is None:
            return {"erreur": "action"}
        try:
            return await asyncio.get_running_loop().run_in_executor(None, f, decky.DECKY_PLUGIN_SETTINGS_DIR, *args)
        except Exception as e:
            decky.logger.warning(f"spotpass {action} : {e}")
            return {"erreur": "console"}

    async def paroles(self, artiste, titre, album="", duree=0):
        import asyncio, paroles
        dossier = pathlib.Path(decky.DECKY_PLUGIN_RUNTIME_DIR) / "paroles"
        return await asyncio.get_running_loop().run_in_executor(None, paroles.chercher, artiste, titre, album, duree, dossier)

    async def plein_ecran(self, appid):
        import asyncio, pleinecran
        return await asyncio.get_running_loop().run_in_executor(None, pleinecran.corriger, appid)

    async def batterie(self):
        d = next(iter(sorted(pathlib.Path("/sys/class/power_supply").glob("BAT*"))), pathlib.Path("/sys/class/power_supply/BAT0"))
        def lire(n):
            try: return int((d / n).read_text().strip())
            except Exception: return None
        p, plein, origine = lire("power_now"), lire("energy_full"), lire("energy_full_design")
        capacite = lire("capacity")
        try: statut = (d / "status").read_text().strip()
        except Exception: statut = ""
        present = d.exists() and lire("present") != 0
        etat = {"present": False} if not d.exists() or not present else None
        if present and capacite is not None and 0 <= capacite <= 100 and statut:
            branche = statut in ("Charging", "Full", "Not charging")
            etat = {"present": True, "percent": capacite / 100, "charging": statut == "Charging",
                    "acState": 2 if branche else 1, "batteryState": 3 if statut == "Full" else 1,
                    "secondsRemaining": 0, "confidence": 0}
            reste, debit = (lire("energy_now"), p) if lire("energy_now") is not None else (lire("charge_now"), lire("current_now"))
            if statut == "Discharging" and reste and debit and debit > 0:
                etat.update(secondsRemaining=int(reste / debit * 3600), confidence=1)
        return {"etat": etat, "watts": round(p / 1e6, 1) if p else None, "sante": round(100 * plein / origine) if plein and origine else None,
                "cycles": lire("cycle_count")}

    async def machine(self):
        def lire(p):
            try: return p.read_text().strip()
            except Exception: return ""
        dmi = pathlib.Path("/sys/class/dmi/id")
        sorties = [c for c in pathlib.Path("/sys/class/drm").glob("card*-*") if lire(c / "status") == "connected"]
        externe = any(lire(c / "enabled") == "enabled" for c in sorties if not c.name.split("-", 1)[1].startswith(("eDP", "LVDS", "DSI")))
        systeme = next((l.split("=", 1)[1].strip().strip('"') for l in lire(pathlib.Path("/etc/os-release")).splitlines() if l.startswith("NAME=")), "")
        try: legion = json.loads(pathlib.Path("/run/steamu-controllers/state.json").read_text())
        except Exception: legion = None
        return {**{n: lire(dmi / n) for n in ("sys_vendor", "product_name", "product_version", "board_name")},
                "ecran": ("tele" if externe else "portable") if sorties else None, "legion": legion, "systeme": systeme}

    async def economie(self):
        try: return pathlib.Path("/sys/firmware/acpi/platform_profile").read_text().strip() == "low-power"
        except Exception: return None

    async def instantane(self, appid=0):
        import asyncio, shutil, subprocess, time
        def prendre():
            from session_x import environnement
            f, env = pathlib.Path("/tmp/gamescope.png"), environnement()
            try:
                f.unlink(missing_ok=True)
                subprocess.run(["xprop", "-root", "-f", "GAMESCOPECTRL_DEBUG_REQUEST_SCREENSHOT", "32c", "-set", "GAMESCOPECTRL_DEBUG_REQUEST_SCREENSHOT", "1"],
                               env=env, timeout=2, check=True, capture_output=True)
                avant, fin = -1, time.monotonic() + 2
                while time.monotonic() < fin:   
                    n = f.stat().st_size if f.exists() else 0
                    if n and n == avant: break
                    avant = n; time.sleep(.03)
                if not f.exists() and appid:
                    from apercu import _fenetre
                    cible = _fenetre(int(appid))
                    if not cible:
                        return None
                    affichage, fenetre = cible
                    jpg = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "x11grab", "-draw_mouse", "0", "-window_id", str(fenetre), "-i", affichage,
                                          "-frames:v", "1", "-q:v", "3", "-f", "image2pipe", "-vcodec", "mjpeg", "-"],
                                         env=env, timeout=3, capture_output=True).stdout
                    return "data:image/jpeg;base64," + base64.b64encode(jpg).decode() if jpg else None
                jpg = subprocess.run(["magick", str(f), "-quality", "85", "jpg:-"], env=env, timeout=3, capture_output=True).stdout if shutil.which("magick") else b""
                jpg = jpg or subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(f), "-q:v", "3", "-f", "image2pipe", "-vcodec", "mjpeg", "-"],
                                     env=env, timeout=3, capture_output=True).stdout
                return "data:image/jpeg;base64," + base64.b64encode(jpg).decode() if jpg else None
            except Exception:
                return None
            finally:
                f.unlink(missing_ok=True)
        return await asyncio.get_running_loop().run_in_executor(None, prendre)

    async def pid_jeu(self, appid):
        return pid_reaper(int(appid))

    async def reprendre_jeu(self, pid):
        import os, signal
        repris = 0
        for e in processus_du_jeu(pid):
            try: os.kill(e, signal.SIGCONT); repris += 1
            except Exception: pass
        return repris > 0

    async def figer_exiles(self, pid):
        import os, signal
        figes = 0
        for e in processus_du_jeu(pid, exiles_seuls=True):
            try: os.kill(e, signal.SIGSTOP); figes += 1
            except Exception: pass
        return figes

    async def apercu(self, appid, ips):
        import asyncio, apercu
        return await asyncio.get_running_loop().run_in_executor(None, apercu.debut, appid, LARGEUR_VIGNETTE, ips)

    async def apercu_fin(self, adresse=None):
        import asyncio, apercu
        await asyncio.get_running_loop().run_in_executor(None, apercu.fin, adresse)

    @staticmethod
    def _raison(e):
        import themeplaza, urllib.error
        if isinstance(e, themeplaza.Refus): return str(e)[:160]
        if isinstance(e, (urllib.error.URLError, TimeoutError, OSError)): return "ThemePlaza injoignable"
        return "échec (%s)" % type(e).__name__

    async def themeplaza_recherche(self, texte="", page=1, tri="recents", musique=False):
        import asyncio, themeplaza
        try: return await asyncio.get_running_loop().run_in_executor(None, themeplaza.recherche, texte, page, tri, bool(musique))
        except Exception as e: return {"erreur": self._raison(e), **self._attente(e)}

    @staticmethod
    def _attente(e):
        import themeplaza
        return {"verification": isinstance(e, themeplaza.Verification), "vue": isinstance(e, themeplaza.SansVue)}

    async def themeplaza_apercu(self, numero):
        import asyncio, themeplaza
        try: return await asyncio.get_running_loop().run_in_executor(None, themeplaza.apercu, numero)
        except Exception as e: return self._attente(e)

    async def themeplaza_installer(self, numero):
        import themeplaza
        try:
            num = themeplaza._numero(numero)
            if num not in themeplaza.VUS: return {"erreur": "thème inconnu : cherche-le d'abord"}
            if themeplaza.ETAT.get("etape") not in ("repos", "fini", "erreur"): return {"erreur": "une installation est déjà en cours"}
            dossier = self._dedans("themes")
            if not dossier: return {"erreur": "dossier prive/themes introuvable"}
        except Exception as e: return {"erreur": self._raison(e)}
        themeplaza.ETAT.clear(); themeplaza.ETAT.update(etape="telechargement", pct=0, id=num)
        def fil():
            try: themeplaza.installer(num, dossier); decky.logger.info(f"ThemePlaza : thème {num} installé")
            except Exception as e: themeplaza.ETAT.update(etape="erreur", message=self._raison(e)); decky.logger.warning(f"ThemePlaza : thème {num} non installé ({self._raison(e)})")
        threading.Thread(target=fil, daemon=True).start()
        return {"ok": True}

    _verrou_hd = threading.Lock()

    async def theme_hd(self, nom):
        import asyncio, agrandir
        dossier = self._dedans("themes")
        if not dossier or not dossier.is_dir(): return None
        def fil():
            with self._verrou_hd: return agrandir.preparer(dossier, nom)
        try: return await asyncio.get_running_loop().run_in_executor(None, fil)
        except Exception as e:
            decky.logger.warning(f"Thème HD : {nom!r} non agrandi ({type(e).__name__}: {str(e)[:120]})"); return None

    async def badge_hd(self, nom):
        import asyncio, agrandir
        dossier = self._dedans("badges")
        if not dossier or not dossier.is_dir(): return None
        def fil():
            with self._verrou_hd: return agrandir.preparer_badge(dossier, nom)
        try: return await asyncio.get_running_loop().run_in_executor(None, fil)
        except Exception as e:
            decky.logger.warning(f"Badge HD : {nom!r} non agrandi ({type(e).__name__}: {str(e)[:120]})"); return None

    async def theme_supprimer(self, id):
        import datetime, re
        if not isinstance(id, str) or not re.fullmatch(r"[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+", id): return {"erreur": "identifiant invalide"}   
        dossier = self._dedans("themes")
        if not dossier or not dossier.is_dir(): return {"erreur": "dossier prive/themes introuvable"}
        fichiers = [f for f in dossier.iterdir() if f.is_file() and (f.name.startswith(id + "-") or f.name.startswith(id + "."))]
        hd = dossier / "hd"
        if hd.is_dir(): fichiers += [f for f in hd.iterdir() if f.is_file() and f.name.startswith(id + "-")]
        if not fichiers: return {"erreur": "thème introuvable"}
        cible = dossier / ("corbeille-" + id + "-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
        try:
            cible.mkdir(parents=True, exist_ok=True)
            for f in fichiers:
                if not f.resolve().is_relative_to(dossier.resolve()): continue   
                shutil.move(str(f), str(cible / f.name))
            decky.logger.info(f"Thèmes : « {id} » déplacé vers {cible.name} (rien n'est supprimé)")
            return {"ok": True}
        except Exception as e:
            decky.logger.warning(f"Thèmes : suppression de « {id} » a échoué ({type(e).__name__})")
            return {"erreur": type(e).__name__}

    async def themeplaza_etat(self):
        import themeplaza
        return dict(themeplaza.ETAT)

    async def _themezer(self, fonction, *a):
        import asyncio, themezer
        try: return await asyncio.get_running_loop().run_in_executor(None, getattr(themezer, fonction), *a)
        except Exception as e: return {"erreur": themezer._raison(e)}

    async def themezer_recherche(self, console, texte="", page=1, tri="telecharges"):
        return await self._themezer("recherche", console, texte, page, tri)

    async def themezer_apercu(self, console, ident, ecran=0):
        return await self._themezer("apercu", console, ident, ecran)

    async def themezer_installer(self, console, ident):
        import themezer
        try:
            cle = (themezer._console(console), themezer._ident(ident))
            if cle not in themezer.VUS: return {"erreur": "thème inconnu : cherche-le d'abord"}
            if themezer.ETAT.get("etape") not in ("repos", "fini", "erreur"): return {"erreur": "une installation est déjà en cours"}
            dossier = self._dedans("themes")
            if not dossier: return {"erreur": "dossier prive/themes introuvable"}
        except Exception as e: return {"erreur": themezer._raison(e)}
        themezer.ETAT.clear(); themezer.ETAT.update(etape="telechargement", pct=0, console=cle[0], id=cle[1])
        def fil():
            try: themezer.installer(*cle, dossier); decky.logger.info(f"Themezer : thème {cle} installé")
            except Exception as e: decky.logger.warning(f"Themezer : thème {cle} non installé ({themezer._raison(e)})")
        threading.Thread(target=fil, daemon=True).start()
        return {"ok": True}

    async def themezer_etat(self):
        import themezer
        return dict(themezer.ETAT)

    @staticmethod
    def _raison_infinimii(e):
        import infinimii, urllib.error
        if isinstance(e, infinimii.Refus): return str(e)[:160]
        if isinstance(e, urllib.error.HTTPError): return "introuvable sur InfiniMii" if e.code == 404 else "InfiniMii répond %d" % e.code
        if isinstance(e, (urllib.error.URLError, TimeoutError, OSError)): return "InfiniMii injoignable"
        return "échec (%s)" % type(e).__name__

    async def _infinimii(self, fonction, *a):
        import asyncio, infinimii
        try: return await asyncio.get_running_loop().run_in_executor(None, getattr(infinimii, fonction), *a)
        except Exception as e: return {"erreur": self._raison_infinimii(e)}

    async def infinimii_recherche(self, texte="", page=1):
        return await self._infinimii("recherche", texte, page)

    async def infinimii_miniature(self, ident):
        return await self._infinimii("miniature", ident)

    async def infinimii_qr(self, ident):
        return await self._infinimii("qr", ident)

    SCRIPTS_A_LA_DEMANDE = {"jsqr": "vendor/jsqr.js", "shaka": "vendor/shaka-player.compiled.js"}

    async def script_greffon(self, nom):
        c = self.SCRIPTS_A_LA_DEMANDE.get(nom) if isinstance(nom, str) else None
        if not c: return None
        f = pathlib.Path(os.environ["PCV_DOSSIER"]) / "greffon" / c
        return f.read_text(encoding="utf-8") if f.is_file() else None

    async def fiche_switch(self, appid, langue="fr"):
        import asyncio, fiches_switch

        def fil():
            base = pathlib.Path(decky.DECKY_USER_HOME) / ".local/share/Steam/userdata"
            titleid = fiches_switch.titleid_pour_appid(base, appid)
            if not titleid:
                return None
            dossier_donnees = str(pathlib.Path(decky.DECKY_PLUGIN_RUNTIME_DIR) / "cache")
            fiche = fiches_switch.fiches([titleid], langue, dossier_donnees).get(titleid)
            if not fiche:
                return None
            images = {cle: fiches_switch.image_data(fiche[cle + "_url"], dossier_donnees) for cle in ("icone", "banniere") if fiche.get(cle + "_url")}
            captures = [u for u in (fiches_switch.image_data(c, dossier_donnees) for c in fiche.get("captures_url") or []) if u]
            return {**{k: v for k, v in fiche.items() if not k.endswith("_url")}, **images, "captures": captures, "titleid": titleid}

        try:
            return await asyncio.get_running_loop().run_in_executor(None, fil)
        except Exception as e:
            decky.logger.warning(f"fiche_switch : {type(e).__name__} {e}")
            return None

    async def art_auto_chercher(self, nom):
        import asyncio, art_auto
        try:
            return await asyncio.get_running_loop().run_in_executor(None, art_auto.preparer, nom if isinstance(nom, str) else "")
        except Exception as e:
            decky.logger.warning(f"Art auto : {type(e).__name__} {str(e)[:160]}")
            return {"trouve": False}

    async def fiche_boutique(self, appid, langue="fr"):
        import asyncio, art_auto
        try:
            return await asyncio.get_running_loop().run_in_executor(None, art_auto.fiche_boutique, int(appid), str(langue)[:2])
        except Exception as e:
            decky.logger.warning(f"Fiche boutique : {type(e).__name__} {str(e)[:160]}")
            return {}

    async def eshop_catalogues(self):
        import asyncio, eshop
        return await asyncio.to_thread(eshop.catalogues, pathlib.Path(decky.DECKY_PLUGIN_RUNTIME_DIR) / "cache")

    async def eshop_jeux(self, action, pays, langue, appid=0, terme="", start=0):
        import asyncio, eshop_jeux
        try:
            return await asyncio.to_thread(eshop_jeux.lire,
                pathlib.Path(decky.DECKY_PLUGIN_RUNTIME_DIR) / "cache", action, pays, langue, appid, terme, start)
        except Exception:
            return {"erreur": True}

    async def eshop_image(self, url):
        import asyncio, eshop
        try:
            return await asyncio.to_thread(eshop.image, str(url)[:2048])
        except Exception:
            return {}

    async def eshop_github(self, source):
        import asyncio, eshop
        try:
            return await asyncio.to_thread(eshop.github, str(source)[:400])
        except Exception as e:
            decky.logger.warning(f"eShop GitHub : {type(e).__name__} {str(e)[:160]}")
            return {}

    async def eshop_installes(self):
        import asyncio, eshop
        return await asyncio.to_thread(eshop.installes, decky.DECKY_PLUGIN_DIR)

    async def dispositions_lire(self):
        f = pathlib.Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "dispositions.json"
        try: return {"ok": True, "d": json.loads(f.read_text(encoding="utf-8")) if f.exists() else None}
        except Exception as e:
            decky.logger.warning(f"SteamU : dispositions illisibles ({type(e).__name__})"); return {"ok": False}

    async def dispositions_ecrire(self, d):
        t = json.dumps(d, ensure_ascii=False)
        if not isinstance(d, dict) or len(t) > DISPOSITIONS_MAX: return False
        f = pathlib.Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "dispositions.json"
        try: f.with_suffix(".tmp").write_text(t, encoding="utf-8"); os.replace(f.with_suffix(".tmp"), f); return True
        except Exception as e:
            decky.logger.warning(f"SteamU : dispositions non enregistrées ({type(e).__name__})"); return False

    async def secours_etat(self):
        if sys.platform != "linux":
            import platform
            return {"pause": "incompatible", "systeme": platform.system()}
        import moteur
        return {"pause": moteur.secours.pause}

    async def arret_urgence(self):
        import moteur
        moteur.secours.arreter("urgence"); decky.logger.warning("SteamU : arrêt d'urgence (L3 + R3), plus rien n'est posé jusqu'au prochain redémarrage de Steam")
        return True

    async def pause_manuelle(self):
        import moteur
        moteur.secours.arreter("manuel"); decky.logger.info("SteamU : mis en pause depuis le panneau Decky")
        return True

    async def reprendre(self):
        import moteur
        moteur.secours.reprendre(); decky.logger.info("SteamU : repris depuis le panneau Decky")
        return True

    async def diagnostic(self):
        import asyncio, diagnostic, moteur
        try:
            def imports():   
                try:
                    import importer; prive = self._dedans("."); return importer.etat(prive) if prive else {}
                except Exception as e: return {"erreur": type(e).__name__}
            nom, resume = await asyncio.get_running_loop().run_in_executor(None, lambda: diagnostic.rapport(
                decky.DECKY_USER_HOME, ICI, decky.DECKY_PLUGIN_LOG_DIR, moteur.secours, moteur.etat_scripts, moteur.DEBOGUEUR, moteur.local, imports=imports()))
            decky.logger.info(f"SteamU : rapport de diagnostic écrit ({nom})")
            return {"fichier": nom, "resume": resume}
        except Exception as e:
            decky.logger.warning(f"SteamU : rapport de diagnostic manqué ({type(e).__name__})")
            return {"erreur": type(e).__name__}

    async def enregistrer_capture(self, chemin):
        import diagnostic, shutil
        try:
            src, maison = pathlib.Path(str(chemin)).resolve(), pathlib.Path(decky.DECKY_USER_HOME).resolve()
            if not (src.is_file() and src.is_relative_to(maison) and "760" in src.parts and src.suffix.lower() in (".jpg", ".jpeg", ".png")):
                return {"erreur": "chemin"}
            dest = diagnostic.telechargements(maison) / src.name
            shutil.copyfile(src, dest)
            return {"fichier": dest.name}
        except Exception as e:
            decky.logger.warning(f"SteamU : capture non enregistrée ({type(e).__name__})")
            return {"erreur": type(e).__name__}

    def _rapport_plantage(self):
        import diagnostic, moteur
        try:
            nom, _ = diagnostic.rapport(decky.DECKY_USER_HOME, ICI, decky.DECKY_PLUGIN_LOG_DIR, moteur.secours, moteur.etat_scripts,
                                        moteur.DEBOGUEUR, moteur.local, court=True)
            (pathlib.Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "plantage.json").write_text(json.dumps({"fichier": nom}))
            decky.logger.warning(f"SteamU : rapport de plantage écrit ({nom})")
        except Exception as e:
            decky.logger.warning(f"SteamU : rapport de plantage manqué ({type(e).__name__})")

    async def plantage(self):
        try: return json.loads((pathlib.Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "plantage.json").read_text())
        except Exception: return {}

    async def conflits(self):
        import asyncio, conflits, diagnostic, moteur
        nouveau, self.conflit_nouveau = getattr(self, "conflit_nouveau", False), False
        try:
            actifs = await asyncio.get_running_loop().run_in_executor(
                None, lambda: conflits.conflits(decky.DECKY_USER_HOME, moteur.DEBOGUEUR, moteur.local, diagnostic._evaluer))
        except Exception as e:
            decky.logger.warning(f"SteamU : détection des conflits manquée ({type(e).__name__})"); actifs = {}
        return {"actifs": actifs, "nouveau": nouveau and bool(actifs)}

    async def maj_verifier(self, manifeste=""):
        import asyncio, maj, urllib.error
        garde = getattr(self, "_maj", None)
        if garde and garde[0] == manifeste: return garde[1]
        try:
            v = json.loads((ICI / "package.json").read_text()).get("version", "")
            r = await asyncio.get_running_loop().run_in_executor(None, maj.verifier, v, manifeste)
        except urllib.error.HTTPError as e:   
            decky.logger.info(f"mise à jour : pas de manifeste ({e.code})"); r = {}
        except Exception as e:
            decky.logger.info(f"mise à jour : manifeste illisible ({type(e).__name__} {getattr(e, 'reason', '')})"); return None   
        self._maj = (manifeste, r)
        return r

    async def _uninstall(self):
        if sys.platform != "linux": return
        await self.film_demarrage(False)   
        import film_demarrage
        f = pathlib.Path(decky.DECKY_USER_HOME) / ".steam/steam/config/uioverrides/movies" / film_demarrage.FILM
        try: f.unlink(missing_ok=True); f.with_name(film_demarrage.IMAGE).unlink(missing_ok=True); f.with_name(film_demarrage.MUSIQUE).unlink(missing_ok=True); decky.logger.info("SteamU : vidéo de démarrage retirée")
        except Exception as e: decky.logger.warning(f"vidéo de démarrage non retirée : {e}")

    async def _unload(self):
        if sys.platform != "linux": return
        import moteur
        moteur.arreter = True
        import apercu; apercu.fin()
        if getattr(self, "lumiere", None): self.lumiere.arreter()   
        decky.logger.info("SteamU : moteur arrêté (le thème disparaît au prochain rechargement de Steam)")
