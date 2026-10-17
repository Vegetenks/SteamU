import base64, json, os, pathlib, shutil, sys, threading
import decky

ICI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ICI / "py_modules"))
os.environ.setdefault("PCV_DOSSIER", str(ICI / "donnees"))
TRANCHE_MAX = 4 * 1024 * 1024       
RESSOURCE_MAX = 32 * 1024 * 1024    
IMPORT = threading.Lock()           
PACK = "@steamu/"                   
VISITEURS = "@visiteurs/"           
MII_DEFAUT = "@mii-defaut/"         
MOTEUR = "mii/moteur/"               
FILM = "steamu.webm"                
DISPOSITIONS_MAX = 8 * 1024 * 1024  
LARGEUR_VIGNETTE = 728              

class Plugin:
    async def _main(self):
        import asyncio, moteur, reprise
        try: await asyncio.get_running_loop().run_in_executor(None, lambda: reprise.reprendre(
                decky.DECKY_HOME, moteur.ANCIEN_DOSSIER, pathlib.Path(decky.DECKY_PLUGIN_DIR).name, decky.logger.info))
        except Exception as e: decky.logger.warning(f"reprise de l'ancien greffon manquée : {type(e).__name__}")
        moteur.secours = moteur.Secours(pathlib.Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "secours.json")
        if moteur.secours.pause: decky.logger.warning(f"{moteur.NOM} : en pause ({moteur.secours.pause}), rien n'est posé")
        try:
            films = pathlib.Path(decky.DECKY_USER_HOME) / ".steam/steam/config/uioverrides/movies"
            films.mkdir(parents=True, exist_ok=True)
            shutil.copy(ICI / "donnees" / FILM, films / FILM)
        except Exception as e:
            decky.logger.warning(f"vidéo de démarrage non copiée : {e}")
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
        return {appli: [d for d in dossiers if not plein(d)] for appli, dossiers in importer.EXIGE.items()}

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

    async def paroles(self, artiste, titre, album="", duree=0):
        import asyncio, paroles
        dossier = pathlib.Path(decky.DECKY_PLUGIN_RUNTIME_DIR) / "paroles"
        return await asyncio.get_running_loop().run_in_executor(None, paroles.chercher, artiste, titre, album, duree, dossier)

    async def plein_ecran(self, appid):
        import asyncio, pleinecran
        return await asyncio.get_running_loop().run_in_executor(None, pleinecran.corriger, appid)

    async def batterie(self):
        d = pathlib.Path("/sys/class/power_supply/BAT0")
        def lire(n):
            try: return int((d / n).read_text().strip())
            except Exception: return None
        p, plein, origine = lire("power_now"), lire("energy_full"), lire("energy_full_design")
        return {"watts": round(p / 1e6, 1) if p else None, "sante": round(100 * plein / origine) if plein and origine else None,
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

    async def instantane(self):
        import asyncio, shutil, subprocess, time
        def prendre():
            f, env = pathlib.Path("/tmp/gamescope.png"), {**os.environ, "DISPLAY": ":0", "LD_LIBRARY_PATH": ""}
            try:
                f.unlink(missing_ok=True)
                subprocess.run(["xprop", "-root", "-f", "GAMESCOPECTRL_DEBUG_REQUEST_SCREENSHOT", "32c", "-set", "GAMESCOPECTRL_DEBUG_REQUEST_SCREENSHOT", "1"],
                               env=env, timeout=2, check=True, capture_output=True)
                avant, fin = -1, time.monotonic() + 2
                while time.monotonic() < fin:   
                    n = f.stat().st_size if f.exists() else 0
                    if n and n == avant: break
                    avant = n; time.sleep(.03)
                jpg = subprocess.run(["magick", str(f), "-sample", f"{LARGEUR_VIGNETTE}x", "-quality", "82", "jpg:-"], env=env, timeout=3, capture_output=True).stdout if shutil.which("magick") else b""
                jpg = jpg or subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(f), "-vf", f"scale={LARGEUR_VIGNETTE}:-2", "-q:v", "4", "-f", "image2pipe", "-vcodec", "mjpeg", "-"],
                                     env=env, timeout=3, capture_output=True).stdout
                return "data:image/jpeg;base64," + base64.b64encode(jpg).decode() if jpg else None
            except Exception:
                return None
            finally:
                f.unlink(missing_ok=True)
        return await asyncio.get_running_loop().run_in_executor(None, prendre)

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

    SCRIPTS_A_LA_DEMANDE = {"jsqr": "vendor/jsqr.js"}

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
            nom, resume = await asyncio.get_running_loop().run_in_executor(None, lambda: diagnostic.rapport(
                decky.DECKY_USER_HOME, ICI, decky.DECKY_PLUGIN_LOG_DIR, moteur.secours, moteur.etat_scripts, moteur.DEBOGUEUR, moteur.local))
            decky.logger.info(f"SteamU : rapport de diagnostic écrit ({nom})")
            return {"fichier": nom, "resume": resume}
        except Exception as e:
            decky.logger.warning(f"SteamU : rapport de diagnostic manqué ({type(e).__name__})")
            return {"erreur": type(e).__name__}

    async def conflits(self):
        import asyncio, conflits, diagnostic, moteur
        nouveau, self.conflit_nouveau = getattr(self, "conflit_nouveau", False), False
        try:
            actifs = await asyncio.get_running_loop().run_in_executor(
                None, lambda: conflits.conflits(decky.DECKY_USER_HOME, moteur.DEBOGUEUR, moteur.local, diagnostic._evaluer))
        except Exception as e:
            decky.logger.warning(f"SteamU : détection des conflits manquée ({type(e).__name__})"); actifs = {}
        return {"actifs": actifs, "nouveau": nouveau and bool(actifs)}

    async def _uninstall(self):
        f = pathlib.Path(decky.DECKY_USER_HOME) / ".steam/steam/config/uioverrides/movies" / FILM
        try: f.unlink(missing_ok=True); decky.logger.info("SteamU : vidéo de démarrage retirée")
        except Exception as e: decky.logger.warning(f"vidéo de démarrage non retirée : {e}")

    async def _unload(self):
        import moteur
        moteur.arreter = True
        import apercu; apercu.fin()
        if getattr(self, "lumiere", None): self.lumiere.arreter()   
        decky.logger.info("SteamU : moteur arrêté (le thème disparaît au prochain rechargement de Steam)")
