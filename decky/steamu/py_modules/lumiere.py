import json, os, pathlib, re, threading, time, math
from ambideck.follower import Follower

OR = (255, 196, 58)          
LUEUR_RATE = (96, 110, 210)  
BLANC = (255, 255, 255)
VERT_SPOTPASS = (0, 255, 60)  
COULEUR_SANS_HUESYNC = (0, 255, 255)   
REPOS = .45                  
RESPIRE_VITESSE = .75        
PINCE = (.6, .25)            
PINCE_MAX = 30.              
ECART_MIN = .2               
THEME_REDIT = 2.             

INTENTIONS = frozenset({"theme", "notif", "spotpass", "spotpass-fin", "casino-entree", "casino-sortie", "casino-pince", "casino-pince-fin",
                        "casino-gain", "casino-gain-double", "casino-gain-triple", "casino-perte", "ecran-jeu", "ecran-fin"})
MODES = ("non", "eteint", "fixe", "theme", "respiration", "arc-en-ciel", "vague", "ecran")   
ECRAN = {"layout": "sides"}         
ECART_ECRAN = Follower.MIN_GAP_S    
TIC_ECRAN = 1.                      
FREQ_MAX = 4
COULEUR = re.compile(r"#[0-9a-fA-F]{6}")

VID, PIDS = 0x17EF, {0x61EB, 0x61EC, 0x61ED, 0x61EE}   
ENTETE_VENDEUR = bytes.fromhex("06a0ff0901")            
STICKS = (0x03, 0x04)                                    
FIXE, PULSE, DYNAMIQUE, SPIRALE = 1, 2, 3, 4

def trouver_vendeur(racine="/sys/class/hidraw"):
    try: noms = sorted(os.listdir(racine))
    except OSError: return None
    for n in noms:
        if not re.fullmatch(r"hidraw\d{1,3}", n): continue
        d = pathlib.Path(racine) / n / "device"
        try:
            ue = dict(l.split("=", 1) for l in (d / "uevent").read_text().splitlines() if "=" in l)
            bus, vid, pid = (int(x, 16) for x in ue.get("HID_ID", "0:0:0").split(":"))
            if bus != 3 or vid != VID or pid not in PIDS: continue
            if (d / "report_descriptor").read_bytes()[:5] == ENTETE_VENDEUR: return "/dev/" + n
        except (OSError, ValueError): continue
    return None

def _octet(x): return min(255, max(0, int(x)))
def commandes(stick, etat):
    if stick not in STICKS: raise ValueError("stick")
    if etat is None: return [bytes([5, 6, 0x70, 2, stick, 0, 1])]
    mode, (r, g, b), lum, vit = etat
    if mode not in (FIXE, PULSE, DYNAMIQUE, SPIRALE): raise ValueError("mode")
    k = min(1., max(0., lum)); r, g, b = (_octet(round(x * k)) for x in (r, g, b))
    return [bytes([5, 0x0C, 0x72, 1, stick, mode, r, g, b, 63, min(63, max(0, int(64 * (1 - vit)))), 3, 1]),
            bytes([5, 6, 0x73, 2, stick, 3, 1]), bytes([5, 6, 0x70, 2, stick, 1, 1])]

class Manette:
    def __init__(self, chemin): self.fd = os.open(chemin, os.O_WRONLY | os.O_CLOEXEC)
    def poser(self, stick, etat):
        for c in commandes(stick, etat): os.write(self.fd, c)
    def fermer(self):
        try: os.close(self.fd)
        except OSError: pass

ATTRIBUTS_LED = ("multi_intensity", "effect", "mode", "profile", "speed", "brightness", "enabled")

def trouver_led(racine="/sys/class/leds"):
    base = pathlib.Path(racine)
    try: noms = sorted(n.name for n in base.iterdir())
    except OSError: return None
    candidats = [n for n in noms if "joystick_rings" in n] or [n for n in noms if "rgb" in n.lower()]
    for n in candidats:
        d = base / n
        if not (d / "multi_intensity").exists(): continue
        try:
            ue = dict(l.split("=", 1) for l in (d / "device/uevent").read_text().splitlines() if "=" in l)
            bus, vid, pid = (int(x, 16) for x in ue.get("HID_ID", "0:0:0").split(":"))
            if vid == VID and pid in PIDS: return d
        except (OSError, ValueError): continue
    return None

def _pct(x): return min(100, max(0, round(x * 100 / 255)))

class ManetteLED:
    def __init__(self, dossier):
        self.d = pathlib.Path(dossier)
        self.origine = {a: (self.d / a).read_text().strip() for a in ATTRIBUTS_LED if (self.d / a).exists()}   
        self.etats = {}
        self.effets_absents = set()

    def _ecrire(self, nom, valeur):
        if (self.d / nom).exists(): (self.d / nom).write_text(str(valeur))

    def poser(self, stick, etat):
        if stick not in STICKS: raise ValueError("stick")
        self.etats[stick] = etat
        vus = [e for e in self.etats.values() if e is not None]
        if not vus: self._ecrire("brightness", 0); return
        mode = vus[0][0]
        r, g, b = (_pct(sum(e[1][i] for e in vus) / len(vus)) for i in range(3))
        lum, vit = max(e[2] for e in vus), max(e[3] for e in vus)
        self._ecrire("multi_intensity", f"{r} {g} {b}")
        try:
            self._ecrire("effect", {PULSE: "breathe", DYNAMIQUE: "rainbow", SPIRALE: "chroma"}.get(mode, "monocolor"))
        except OSError:
            self.effets_absents.add(mode)
            raise
        if mode != FIXE: self._ecrire("speed", round(min(1., max(0., vit)) * 100))
        self._ecrire("brightness", round(min(1., max(0., lum)) * 100))
        self._ecrire("mode", "custom"); self._ecrire("enabled", "true")

    def effet_materiel(self, mode):
        return (self.d / "effect").exists() and mode not in self.effets_absents

    def restaurer(self):
        for a, valeur in self.origine.items(): self._ecrire(a, valeur)

    def fermer(self): pass

def _ouvrir_manette():
    d = trouver_led()
    if d is not None:
        try: return ManetteLED(d)
        except OSError: pass
    c = trouver_vendeur()
    return Manette(c) if c else None

def _hsv(h, s, v):
    h, s, v = h % 360, min(1., max(0., s)), min(1., max(0., v)); c = v * s; x = c * (1 - abs((h / 60) % 2 - 1)); m = v - c
    r, g, b = [(c, x, 0), (x, c, 0), (0, c, x), (0, x, c), (x, 0, c), (c, 0, x)][int(h // 60) % 6]
    return tuple(int(round((k + m) * 255)) for k in (r, g, b))

VITESSES_HUESYNC = {"low": .33, "medium": .66, "high": 1.}
MODES_HUESYNC = {"solid": FIXE, "pulse": PULSE, "rainbow": DYNAMIQUE, "spiral": SPIRALE}

def etat_huesync(config, secteur=None):
    try:
        c = json.loads(pathlib.Path(config).read_text())["huesync_config"]["perApp"]["0"]
        if c.get("acStateOverwrite") and secteur is not None: s = c["acSetting" if secteur else "batSetting"]
        else: s = c["defaultSetting"]
        if not s.get("enableControl", True): return "rien"            
        if not s.get("ledEnabled", True): return None, None
        mode = MODES_HUESYNC.get(s.get("mode"), FIXE)                    
        col = _hsv(float(s.get("hue", 0)), float(s.get("saturation", 100)) / 100, float(s.get("brightness", 100)) / 100)
        e = (mode, col, 1., VITESSES_HUESYNC.get(s.get("speed"), .66))
        return e, e
    except Exception:
        return False

def secteur_branche(racine="/sys/class/power_supply"):
    try:
        for n in os.listdir(racine):
            p = pathlib.Path(racine) / n
            if (p / "type").read_text().strip() == "Mains": return (p / "online").read_text().strip() == "1"
    except OSError: pass
    return None

def _mix(a, b, k): k = min(1., max(0., k)); return tuple(int(round(x + (y - x) * k)) for x, y in zip(a, b))
def _fixe(c, lum): return (FIXE, c, lum, 0.)

def _effet(nom, theme):
    if nom == "notif": return 1.0, [(0, _fixe(_mix(theme, BLANC, .4), .9), None)]
    if nom == "casino-gain": return 1.6, [(0, _fixe(OR, .8), None)]
    if nom == "casino-perte": return .9, [(0, _fixe(LUEUR_RATE, .4), None)]
    if nom == "casino-gain-double":   
        f, d = _fixe(OR, .95), _fixe(OR, .25)
        return 2.0, [(0, f, f), (.4, f, d), (.8, d, f), (1.2, f, d), (1.6, f, f)]
    if nom == "casino-gain-triple":   
        f, d = _fixe(_mix(OR, BLANC, .25), 1.), _fixe(OR, .3)
        return 2.6, [(0, f, f), (.3, f, d), (.6, d, f), (.9, f, d), (1.2, d, f), (1.5, f, d), (1.8, (PULSE, OR, 1., .8), None)]
    raise KeyError(nom)
EFFETS = ("notif", "casino-gain", "casino-gain-double", "casino-gain-triple", "casino-perte")

def _capture(on_frame, on_state, hz):
    from ambideck.capture import GamescopeCapture
    return GamescopeCapture(on_frame, on_state, max_hz=hz)

def concurrents(plugins, settings):
    resultat = []
    for nom in ("HueSync", "Colores"):
        try:
            dossiers = [p for p in pathlib.Path(plugins).iterdir() if p.is_dir() and p.name.lower() == nom.lower()]
        except OSError:
            dossiers = []
        if not dossiers:
            continue
        actif = True
        try:
            c = json.loads((pathlib.Path(settings) / dossiers[0].name / "config.json").read_text())
            if type(c.get("enabled")) is bool:
                actif = c["enabled"]
            if nom == "HueSync" and etat_huesync(pathlib.Path(settings) / dossiers[0].name / "config.json") == "rien":
                actif = False
        except (OSError, ValueError, TypeError):
            pass
        resultat.append({"nom": nom, "actif": actif})
    return resultat

def batterie(racine="/sys/class/power_supply"):
    try:
        for p in pathlib.Path(racine).iterdir():
            if (p / "type").read_text().strip() == "Battery":
                return int((p / "capacity").read_text()), (p / "status").read_text().strip() == "Charging"
    except (OSError, ValueError):
        pass
    return 100, False

REGLAGE_DEFAUT = {"mode": "theme", "couleur": "#00ffff", "luminosite": 45,
                  "batterie_faible": True, "charge": False}

def valider_reglage(raw):
    if type(raw) is not dict or set(raw) != set(REGLAGE_DEFAUT):
        raise ValueError("réglage complet attendu")
    if type(raw["mode"]) is not str or raw["mode"] not in MODES:
        raise ValueError("mode invalide")
    if type(raw["couleur"]) is not str or not COULEUR.fullmatch(raw["couleur"]):
        raise ValueError("couleur invalide")
    if type(raw["luminosite"]) is not int or not 0 <= raw["luminosite"] <= 100:
        raise ValueError("luminosité invalide")
    if any(type(raw[k]) is not bool for k in ("batterie_faible", "charge")):
        raise ValueError("réaction invalide")
    return dict(raw)

class _Sticks:   
    def __init__(self, show): self.show = show

class Lumiere:
    def __init__(self, ouvrir=None, marque=None, huesync=None, secteur=secteur_branche, horloge=time.monotonic, journal=print, suiveur=None, plugins=None, settings=None, alimentation=batterie):
        self.ouvrir = ouvrir or _ouvrir_manette
        self.plugins = pathlib.Path(plugins) if plugins else pathlib.Path.home() / "homebrew/plugins"
        self.settings = pathlib.Path(settings) if settings else pathlib.Path.home() / "homebrew/settings"
        self.alimentation = alimentation
        self.t_alimentation, self.etat_alimentation = -1e9, (100, False)
        self.configuration = dict(REGLAGE_DEFAUT)
        self.par_jeu, self.appid, self.choisi = {}, None, False
        self.marque = pathlib.Path(marque) if marque else None
        self.huesync = huesync or pathlib.Path.home() / "homebrew/settings/HueSync/config.json"
        self.secteur, self.horloge, self.journal = secteur, horloge, journal
        self.v = threading.Condition()
        self.mode, self.couleur, self.couleur_casino, self.casino = "non", None, None, False
        self.pince, self.effet, self.respire = None, None, None
        self.jetons, self.t_jetons, self.attente = float(FREQ_MAX), horloge(), None
        self.manette, self.en_main, self.posees, self.t_ecrit, self.t_theme = None, False, [None, None], -1e9, -1e9
        self.fini, self.fil, self.gen = False, None, 0
        self.suiveur = suiveur or (lambda show: Follower(_capture, _Sticks(show), self._etat_ecran))
        self.jeu, self.ecran, self.suit, self.ecran_ko = False, None, None, False
        self.eco = False   
        self.retenu = self.marque.with_name("led-reglage.json") if self.marque else None
        try:
            r = json.loads(self.retenu.read_text())
            if r.get("mode") in MODES: self.mode = r["mode"]
            if "configuration" in r: self.configuration = valider_reglage(r["configuration"])
            self.par_jeu = {self._appid(k): valider_reglage(v) for k, v in r.get("jeux", {}).items()}
            self.choisi = r.get("choisi") is True
            if isinstance(r.get("couleur"), str) and COULEUR.fullmatch(r["couleur"]): self.couleur = tuple(int(r["couleur"][i:i + 2], 16) for i in (1, 3, 5))
        except Exception: pass

    def _retenir(self):
        try: self.retenu and self.retenu.write_text(json.dumps({"configuration": self.configuration, "jeux": self.par_jeu, "choisi": self.choisi, "mode": self.mode, "couleur": "#%02x%02x%02x" % self.couleur if self.couleur else None}))
        except Exception: pass

    @staticmethod
    def _appid(appid):
        if type(appid) is not str or not re.fullmatch(r"[1-9][0-9]{0,9}", appid) or int(appid) > 4294967295:
            raise ValueError("appid invalide")
        return appid

    def etat(self):
        with self.v:
            return {"reglage": dict(self.configuration, mode=self.mode),
                    "jeux": {k: dict(v) for k, v in self.par_jeu.items()}, "appid": self.appid,
                    "proprietaire": "steamu" if self.choisi else "externe",
                    "concurrents": concurrents(self.plugins, self.settings),
                    "capacites": {"modes": list(MODES),
                                  "anneaux_separes": False, "capture_autorisee": True,
                                  "frequence_max": 5, "materiel_present": trouver_led() is not None or trouver_vendeur() is not None}}

    def appliquer_reglage(self, reglage, appid=None):
        r = valider_reglage(reglage)
        if appid is not None: appid = self._appid(appid)
        with self.v:
            if appid is None:
                self.configuration = r
                self.mode = r["mode"]
            else:
                self.par_jeu[appid] = r
            self.choisi = True
            self.posees = ["?", "?"]
            self.gen += 1
            self.v.notify()
            self._retenir()
        return self.etat()

    def jeu_actif(self, appid=None):
        if appid is not None: appid = self._appid(appid)
        with self.v:
            if appid is not None and (not self.jeu or appid != self.appid): self.ecran_ko = False
            self.appid, self.jeu = appid, appid is not None
            self.ecran = None
            self.gen += 1
            self.v.notify()
        return True

    def _reglage_courant(self):
        return self.par_jeu.get(self.appid, dict(self.configuration, mode=self.mode))

    def _autorise(self):
        return self.choisi or not any(c["actif"] for c in concurrents(self.plugins, self.settings))

    def reglage(self, mode):
        if not isinstance(mode, str) or mode not in MODES: return False
        with self.v: self.choisi = mode != "non"; self.configuration["mode"] = mode; self.mode, self.casino, self.pince, self.effet, self.respire = mode, False, None, None, None; self.gen += 1; self.v.notify()
        self._retenir()
        return True

    def economie(self, on):
        with self.v:
            if self.eco != bool(on): self.eco = bool(on); self.posees = ["?", "?"]; self.gen += 1; self.v.notify()   
        return True

    def intention(self, nom, couleur=None):
        if not isinstance(nom, str) or nom not in INTENTIONS: return False
        if couleur is not None and not (nom in ("theme", "casino-entree") and isinstance(couleur, str) and COULEUR.fullmatch(couleur)): return False
        with self.v:
            t = self.horloge(); self.jetons = min(float(FREQ_MAX), self.jetons + (t - self.t_jetons) * FREQ_MAX); self.t_jetons = t
            if self.jetons >= 1: self.jetons -= 1; self._appliquer(nom, couleur, t)
            else: self.attente = (nom, couleur)
            self.gen += 1; self.v.notify()
        return True

    def _appliquer(self, nom, couleur, t):
        if nom == "spotpass": self.respire = True; return
        if nom == "spotpass-fin": self.respire = None; return
        if couleur:
            c = tuple(int(couleur[i:i + 2], 16) for i in (1, 3, 5))
            if nom == "theme": self.couleur = c; self._retenir()
            elif nom == "casino-entree": self.couleur_casino = c
        if nom == "theme" and t - self.t_theme >= THEME_REDIT: self.t_theme = t; self.posees = [None, None]   
        if nom == "casino-entree": self.casino = True
        elif nom in ("ecran-jeu", "ecran-fin"):
            if nom == "ecran-jeu" and not self.jeu: self.ecran_ko = False
            self.jeu = nom == "ecran-jeu"
        elif nom == "casino-sortie": self.casino, self.pince, self.effet = False, None, None
        elif nom == "casino-pince": self.pince = t
        elif nom == "casino-pince-fin": self.pince = None
        elif nom in EFFETS:
            if nom == "casino-perte": self.pince = None
            self.effet = (nom, t)
        if nom.startswith("casino-") and nom != "casino-sortie": self.casino = True

    def _actif(self): return self._autorise() and self._reglage_courant()["mode"] != "non"
    def _suivre(self): return self._actif() and not self.eco and not self.ecran_ko and self._reglage_courant()["mode"] == "ecran" and self.jeu
    def _montre_ecran(self): return self._suivre() and self.ecran is not None and not self.casino
    def _base(self): return (self.couleur_casino or self.couleur) if self.casino else self.couleur

    def image(self, t):
        if not self._autorise(): return None, None
        if self.eco: return (None, None), None
        if not self._actif(): return None, None
        r = self._reglage_courant(); mode = r["mode"]
        if mode == "eteint": return (None, None), None
        col = tuple(int(r["couleur"][i:i+2], 16) for i in (1, 3, 5))
        base = (self._base() or col) if mode in ("theme", "ecran") or self.casino else col
        fond = _fixe(base, r["luminosite"] / 100); prochain = None; reaction = False
        if not self.casino:
            if mode == "respiration": fond = (PULSE, base, fond[2], .25)
            elif mode in ("arc-en-ciel", "vague"):
                fond = (DYNAMIQUE if mode == "arc-en-ciel" else SPIRALE, base, fond[2], .33)
            if t - self.t_alimentation >= 10:
                self.etat_alimentation = self.alimentation()
                self.t_alimentation = t
            niveau, charge = self.etat_alimentation
            if r["batterie_faible"] and niveau <= 15 and not charge:
                fond = (PULSE, OR, min(fond[2], .4), .15); reaction = True
            elif r["charge"] and charge:
                fond = (PULSE, VERT_SPOTPASS, min(fond[2], .4), .15); reaction = True
        if self._montre_ecran() and not reaction: fond = None
        if self.pince is not None:
            if t - self.pince > PINCE_MAX: self.pince = None
            else: fond = (PULSE, base, PINCE[0], PINCE[1]); prochain = self.pince + PINCE_MAX
        if self.effet:
            nom, t0 = self.effet; duree, cles = _effet(nom, base)
            if t - t0 >= duree: self.effet = None
            else:
                g = d = None
                for k, (dt, eg, ed) in enumerate(cles):
                    if t - t0 >= dt: g, d = eg, (ed if ed is not None else eg)
                    else: prochain = t0 + dt; break
                else: prochain = t0 + duree
                return (g, d), prochain
        if fond is None: return tuple(_fixe(c, r["luminosite"] / 100) for c in self.ecran), prochain
        if self.respire and not self.casino: fond = (PULSE, VERT_SPOTPASS, 1., RESPIRE_VITESSE)   
        return (fond, fond), prochain

    def _etat_ecran(self, *args):
        with self.v: self.gen += 1; self.v.notify()

    def _zones(self, leds):
        c = (tuple(leds[0]), tuple(leds[2]))
        with self.v:
            if not self._suivre(): return False
            if c == self.ecran: self.posees = [None, None]
            self.ecran = c; self.gen += 1; self.v.notify()
        return True

    def _piloter(self, voulu):
        try:
            if voulu and self.suit is None and not self.ecran_ko and not self.fini:
                self.suit = self.suiveur(self._zones)
                self.suit.update(ECRAN)
                s = self.suit
                s.start()
                if self.fini or not self._suivre(): s.stop(); self.suit = None
                else: self.journal("LED : suivi de l'écran")
            elif voulu and self.suit: self.suit.tick()
            elif not voulu and self.suit:
                self.suit.stop(); self.suit = None
                with self.v: self.ecran = None
        except Exception as e:
            if self.suit:
                try: self.suit.stop()
                except Exception: pass
                finally: self.suit = None
            with self.v:
                self.ecran_ko, self.ecran = True, None
                self.gen += 1; self.v.notify()
            self.journal(f"LED : écran non suivi ({type(e).__name__}), retour au thème")

    def demarrer(self):
        if self.marque and self.marque.exists():       
            self.en_main = True; self._rendre()
        self.fil = threading.Thread(target=self._boucle, name="pcv-led", daemon=True); self.fil.start()

    def arreter(self):
        with self.v: self.fini = True; self.gen += 1; self.v.notify()
        if self.fil: self.fil.join(timeout=2)
        s = self.suit
        if s: s.stop(); self.suit = None
        self._rendre()
        if self.manette: self.manette.fermer(); self.manette = None

    def _ouvrir(self):
        if self.manette is None: self.manette = self.ouvrir()
        return self.manette is not None

    def _rendre(self):
        if self.en_main:
            e = etat_huesync(self.huesync, self.secteur())
            if e is False or e == "rien":
                if self._ouvrir() and hasattr(self.manette, "restaurer"):
                    try: self.manette.restaurer(); e = "rien"
                    except Exception as x:
                        self.journal(f"LED : état d'origine non restauré ({type(x).__name__})")
                        e = (_fixe(COULEUR_SANS_HUESYNC, 1.),) * 2
                elif e is False: e = (_fixe(COULEUR_SANS_HUESYNC, 1.),) * 2
            try:
                if e != "rien" and self._ouvrir():
                    for i, s in enumerate(STICKS): self.manette.poser(s, e[i])
            except Exception as x: self.journal(f"LED : réglage de HueSync non reposé ({type(x).__name__})")
            self.en_main, self.posees = False, [None, None]
        if self.marque:
            try: self.marque.unlink()
            except OSError: pass

    def _logiciel(self, img, t):
        resultat = []
        for e in img:
            if e is not None and e[0] != FIXE and isinstance(self.manette, ManetteLED) and not self.manette.effet_materiel(e[0]):
                mode, col, lum, vit = e
                if mode == PULSE: lum *= .15 + .85 * (1 - math.cos(t * math.pi / 2)) / 2
                else: col = _hsv(t * (30 if mode == DYNAMIQUE else 15), 1, 1)
                e = _fixe(col, lum)
            resultat.append(e)
        return tuple(resultat)

    def _poser(self, img, t):
        if img is None: return self._rendre()
        if not self._autorise(): return self._rendre()
        if not self._ouvrir(): self.posees = list(img); return       
        if not self.en_main and self.marque:
            try: self.marque.parent.mkdir(parents=True, exist_ok=True); self.marque.write_text("1")
            except OSError: pass
        self.en_main = True
        for i, s in enumerate(STICKS):
            if img[i] != self.posees[i]: self.manette.poser(s, img[i]); self.posees[i] = img[i]
        self.t_ecrit = t

    def _boucle(self):
        while True:
            with self.v:
                if self.fini: return
                t = self.horloge()
                if self.attente and self.jetons + (t - self.t_jetons) * FREQ_MAX >= 1:
                    self.jetons = min(float(FREQ_MAX), self.jetons + (t - self.t_jetons) * FREQ_MAX) - 1; self.t_jetons = t
                    nom, c = self.attente; self.attente = None; self._appliquer(nom, c, t)
                img, prochain = self.image(t); vu = self.gen; suivre = self._suivre()
                if img is not None:
                    self._ouvrir()
                    logiciel = self._logiciel(img, t)
                    if logiciel != img: prochain = t + ECART_MIN
                    img = logiciel
                ecart = ECART_ECRAN if self._montre_ecran() else ECART_MIN
                change = img is None and self.en_main or img is not None and list(img) != self.posees
                if change and t - self.t_ecrit < ecart:                 
                    attendre = self.t_ecrit + ecart - t
                else: attendre = None
            self._piloter(suivre)
            if suivre and self.ecran_ko: continue  
            if change and attendre is None:
                try: self._poser(img, t)
                except Exception as e:                  
                    self.journal(f"LED : manette indisponible ({type(e).__name__})")
                    if self.manette: self.manette.fermer()
                    if isinstance(self.manette, ManetteLED) and self.manette.effets_absents:
                        self.posees = ["?", "?"]
                        prochain = t + ECART_MIN
                    else:
                        self.manette, self.posees = None, ["?", "?"]
                        prochain = t + 5
            with self.v:
                if self.fini: return
                if self.gen != vu: continue
                if attendre is not None: d = attendre
                elif self.attente: d = max(.01, (1 - self.jetons) / FREQ_MAX)
                elif prochain is not None: d = max(.01, prochain - self.horloge())
                else: d = 10.
                d = 10. if d is None else min(d, 10.)
                if suivre: d = TIC_ECRAN if d is None else min(d, TIC_ECRAN)
                self.v.wait(d)
