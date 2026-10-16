import json, os, pathlib, re, socket, threading, time
from ambideck.follower import Follower

OR = (255, 196, 58)          
LUEUR_RATE = (96, 110, 210)  
BLANC = (255, 255, 255)
COULEUR_SANS_HUESYNC = (0, 255, 255)   
REPOS = .45                  
PINCE = (.6, .25)            
PINCE_MAX = 30.              
ECART_MIN = .2               
THEME_REDIT = 2.             

INTENTIONS = frozenset({"theme", "notif", "casino-entree", "casino-sortie", "casino-pince", "casino-pince-fin",
                        "casino-gain", "casino-gain-double", "casino-gain-triple", "casino-perte", "ecran-jeu", "ecran-fin"})
MODES = ("non", "theme", "ecran")   
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
        self.origine = {a: (self.d / a).read_text().strip() for a in ATTRIBUTS_LED}   
        self.etats = {}

    def _ecrire(self, nom, valeur): (self.d / nom).write_text(str(valeur))

    def poser(self, stick, etat):
        if stick not in STICKS: raise ValueError("stick")
        self.etats[stick] = etat
        vus = [e for e in self.etats.values() if e is not None]
        if not vus: self._ecrire("brightness", 0); return
        mode = PULSE if any(e[0] == PULSE for e in vus) else FIXE
        r, g, b = (_pct(sum(e[1][i] for e in vus) / len(vus)) for i in range(3))
        lum, vit = max(e[2] for e in vus), max(e[3] for e in vus)
        self._ecrire("multi_intensity", f"{r} {g} {b}")
        self._ecrire("effect", "breathe" if mode == PULSE else "monocolor")
        if mode == PULSE: self._ecrire("speed", round(min(1., max(0., vit)) * 100))
        self._ecrire("brightness", round(min(1., max(0., lum)) * 100))
        self._ecrire("mode", "custom"); self._ecrire("enabled", "true")

    def restaurer(self):
        for a in ATTRIBUTS_LED: self._ecrire(a, self.origine[a])

    def fermer(self): pass

COMPAGNON = "/run/steamu-led/led.sock"
GARDER = 255                       

class ManetteCompagnon:
    def __init__(self, chemin=COMPAGNON):
        self.s = socket.socket(socket.AF_UNIX, socket.SOCK_SEQPACKET); self.s.settimeout(1.)
        try: self.s.connect(chemin); self._envoyer(bytes([GARDER, 0, 0, 0, 0, 0] * 2))   
        except Exception: self.s.close(); raise

    def _envoyer(self, m):
        self.s.send(m)
        if self.s.recv(1) != b"\x01": raise OSError("compagnon : refusé")

    def poser(self, stick, etat):
        if stick not in STICKS: raise ValueError("stick")
        if etat is None: e = [0] * 6
        else:
            mode, (r, g, b), lum, vit = etat
            e = [mode, _octet(r), _octet(g), _octet(b), round(min(1., max(0., lum)) * 100), round(min(1., max(0., vit)) * 100)]
        g = [GARDER, 0, 0, 0, 0, 0]
        self._envoyer(bytes(e + g if stick == STICKS[0] else g + e))

    def fermer(self): self.s.close()

def _ouvrir_manette():
    try: return ManetteCompagnon()
    except OSError: pass
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

class _Sticks:   
    def __init__(self, show): self.show = show

class Lumiere:
    def __init__(self, ouvrir=None, marque=None, huesync=None, secteur=secteur_branche, horloge=time.monotonic, journal=print, suiveur=None):
        self.ouvrir = ouvrir or _ouvrir_manette
        self.marque = pathlib.Path(marque) if marque else None
        self.huesync = huesync or pathlib.Path.home() / "homebrew/settings/HueSync/config.json"
        self.secteur, self.horloge, self.journal = secteur, horloge, journal
        self.v = threading.Condition()
        self.mode, self.couleur, self.couleur_casino, self.casino = "non", None, None, False
        self.pince, self.effet = None, None
        self.jetons, self.t_jetons, self.attente = float(FREQ_MAX), horloge(), None
        self.manette, self.en_main, self.posees, self.t_ecrit, self.t_theme = None, False, [None, None], -1e9, -1e9
        self.fini, self.fil, self.gen = False, None, 0
        self.suiveur = suiveur or (lambda show: Follower(_capture, _Sticks(show), lambda *a: None))
        self.jeu, self.ecran, self.suit, self.ecran_ko = False, None, None, False
        self.retenu = self.marque.with_name("led-reglage.json") if self.marque else None
        try:
            r = json.loads(self.retenu.read_text())
            if r.get("mode") in MODES: self.mode = r["mode"]
            if isinstance(r.get("couleur"), str) and COULEUR.fullmatch(r["couleur"]): self.couleur = tuple(int(r["couleur"][i:i + 2], 16) for i in (1, 3, 5))
        except Exception: pass

    def _retenir(self):
        try: self.retenu and self.retenu.write_text(json.dumps({"mode": self.mode, "couleur": "#%02x%02x%02x" % self.couleur if self.couleur else None}))
        except Exception: pass

    def reglage(self, mode):
        if not isinstance(mode, str) or mode not in MODES: return False
        with self.v: self.mode, self.casino, self.pince, self.effet, self.ecran_ko = mode, False, None, None, False; self.gen += 1; self.v.notify()
        self._retenir()
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
        if couleur:
            c = tuple(int(couleur[i:i + 2], 16) for i in (1, 3, 5))
            if nom == "theme": self.couleur = c; self._retenir()
            elif nom == "casino-entree": self.couleur_casino = c
        if nom == "theme" and t - self.t_theme >= THEME_REDIT: self.t_theme = t; self.posees = [None, None]   
        if nom == "casino-entree": self.casino = True
        elif nom in ("ecran-jeu", "ecran-fin"): self.jeu = nom == "ecran-jeu"
        elif nom == "casino-sortie": self.casino, self.pince, self.effet = False, None, None
        elif nom == "casino-pince": self.pince = t
        elif nom == "casino-pince-fin": self.pince = None
        elif nom in EFFETS:
            if nom == "casino-perte": self.pince = None
            self.effet = (nom, t)
        if nom.startswith("casino-") and nom != "casino-sortie": self.casino = True

    def _actif(self): return self.mode in ("theme", "ecran") and self._base() is not None
    def _suivre(self): return self.mode == "ecran" and self.jeu
    def _montre_ecran(self): return self._suivre() and self.ecran is not None and not self.casino
    def _base(self): return (self.couleur_casino or self.couleur) if self.casino else self.couleur

    def image(self, t):
        if not self._actif(): return None, None
        base = self._base(); fond = _fixe(base, REPOS); prochain = None
        if self._montre_ecran(): fond = None
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
        if fond is None: return tuple(_fixe(c, 1.) for c in self.ecran), prochain
        return (fond, fond), prochain

    def _zones(self, leds):
        c = (tuple(leds[0]), tuple(leds[2]))
        with self.v:
            if not self._suivre(): return False
            if c == self.ecran: self.posees = [None, None]
            self.ecran = c; self.gen += 1; self.v.notify()
        return True

    def _piloter(self, voulu):
        if voulu and self.suit is None and not self.ecran_ko:
            try: s = self.suiveur(self._zones); s.update(ECRAN); s.start(); self.suit = s; self.journal("LED : suivi de l'écran")
            except Exception as e: self.ecran_ko = True; self.journal(f"LED : écran non suivi ({type(e).__name__})")
        elif voulu and self.suit: self.suit.tick()
        elif not voulu and self.suit:
            s, self.suit = self.suit, None; s.stop()
            with self.v: self.ecran = None

    def demarrer(self):
        if self.marque and self.marque.exists():       
            self.en_main = True; self._rendre()
        self.fil = threading.Thread(target=self._boucle, name="pcv-led", daemon=True); self.fil.start()

    def arreter(self):
        with self.v: self.fini = True; self.gen += 1; self.v.notify()
        if self.fil: self.fil.join(timeout=2)
        if self.suit: self.suit.stop(); self.suit = None
        self._rendre()
        if self.manette: self.manette.fermer(); self.manette = None

    def _ouvrir(self):
        if self.manette is not None and not isinstance(self.manette, ManetteCompagnon) and self.ouvrir is _ouvrir_manette \
                and self.horloge() - getattr(self, "t_compagnon", -1e9) > 20:
            self.t_compagnon = self.horloge()
            try: c = ManetteCompagnon(); self.manette.fermer(); self.manette, self.posees = c, [None, None]
            except OSError: pass
        if self.manette is None: self.manette = self.ouvrir()
        return self.manette is not None

    def _rendre(self):
        if self.en_main:
            e = etat_huesync(self.huesync, self.secteur())
            if e is False:
                if self._ouvrir() and hasattr(self.manette, "restaurer"):
                    try: self.manette.restaurer(); e = "rien"
                    except Exception as x:
                        self.journal(f"LED : état d'origine non restauré ({type(x).__name__})")
                        e = (_fixe(COULEUR_SANS_HUESYNC, 1.),) * 2
                else: e = (_fixe(COULEUR_SANS_HUESYNC, 1.),) * 2
            try:
                if e != "rien" and self._ouvrir():
                    for i, s in enumerate(STICKS): self.manette.poser(s, e[i])
            except Exception as x: self.journal(f"LED : réglage de HueSync non reposé ({type(x).__name__})")
            self.en_main, self.posees = False, [None, None]
        if self.marque:
            try: self.marque.unlink()
            except OSError: pass

    def _poser(self, img, t):
        if img is None: return self._rendre()
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
                ecart = ECART_ECRAN if self._montre_ecran() else ECART_MIN
                change = img is None and self.en_main or img is not None and list(img) != self.posees
                if change and t - self.t_ecrit < ecart:                 
                    attendre = self.t_ecrit + ecart - t
                else: attendre = None
            self._piloter(suivre)
            if change and attendre is None:
                try: self._poser(img, t)
                except Exception as e:                  
                    self.journal(f"LED : manette indisponible ({type(e).__name__})")
                    if self.manette: self.manette.fermer()
                    self.manette, self.posees = None, list(img) if img is not None else self.posees
            with self.v:
                if self.fini: return
                if self.gen != vu: continue
                if attendre is not None: d = attendre
                elif self.attente: d = max(.01, (1 - self.jetons) / FREQ_MAX)
                elif prochain is not None: d = max(.01, prochain - self.horloge())
                else: d = None
                if suivre: d = TIC_ECRAN if d is None else min(d, TIC_ECRAN)
                self.v.wait(d)
