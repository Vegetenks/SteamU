import os, pathlib, re, select, socket, stat, threading, time
import decky

VID, PIDS = 0x17EF, {0x61EB, 0x61EC, 0x61ED, 0x61EE}   
ENTETE_VENDEUR = bytes.fromhex("06a0ff0901")            
STICKS = (0x03, 0x04)                                    
GARDER = 255
MODES = {0, 1, 2, 3, 4, GARDER}
TAILLE = 12
SOCKET = pathlib.Path("/run/steamu-led/led.sock")
ECART_MIN = 1 / 30

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

def valider(m):
    if len(m) != TAILLE: return None
    e = (tuple(m[:6]), tuple(m[6:]))
    if any(s[0] not in MODES or s[4] > 100 or s[5] > 100 for s in e): return None
    return e

def commandes(stick, e):
    mode, r, g, b, lum, vit = e
    if mode == 0: return [bytes([5, 6, 0x70, 2, stick, 0, 1])]
    r, g, b = (x * lum // 100 for x in (r, g, b))      
    return [bytes([5, 0x0C, 0x72, 1, stick, mode, r, g, b, 63, min(63, 64 * (100 - vit) // 100), 3, 1]),
            bytes([5, 6, 0x73, 2, stick, 3, 1]), bytes([5, 6, 0x70, 2, stick, 1, 1])]

class Serveur:
    def __init__(self, uid, gid, chemin=SOCKET, trouver=trouver_vendeur, journal=print):
        self.uid, self.gid, self.chemin, self.trouver, self.journal = uid, gid, pathlib.Path(chemin), trouver, journal
        self.fd, self.attente, self.t, self.fini, self.s, self.fil = None, {}, -1e9, False, None, None

    def demarrer(self):
        d = self.chemin.parent
        d.mkdir(mode=0o755, exist_ok=True)
        st = os.lstat(d)
        if not stat.S_ISDIR(st.st_mode) or st.st_uid != os.geteuid(): raise RuntimeError(f"{d} : pas notre dossier")
        try: self.chemin.unlink()
        except FileNotFoundError: pass
        s = socket.socket(socket.AF_UNIX, socket.SOCK_SEQPACKET)
        s.bind(str(self.chemin))                  
        os.chmod(self.chemin, 0o600); os.chown(self.chemin, self.uid, self.gid)
        s.listen(1); s.settimeout(.5); self.s = s
        self.fil = threading.Thread(target=self._boucle, name="steamu-led", daemon=True); self.fil.start()

    def arreter(self):
        self.fini = True
        if self.fil: self.fil.join(timeout=2)
        if self.s: self.s.close()
        try: self.chemin.unlink()
        except OSError: pass
        if self.fd is not None: os.close(self.fd); self.fd = None
        for p in pathlib.Path("/sys/class/leds").glob("*joystick_rings*/enabled"):
            try: p.write_text("true")
            except OSError as e: self.journal(f"LED du noyau non réactivée ({type(e).__name__})")

    def _boucle(self):
        while not self.fini:
            try: c, _ = self.s.accept()
            except socket.timeout: continue
            except OSError: return
            with c: self._servir(c)
            if self.attente:                          
                time.sleep(max(0., self.t + ECART_MIN - time.monotonic())); self._ecrire()

    def _servir(self, c):
        while not self.fini:
            if select.select([self.s], [], [], 0)[0]: return
            reste = self.t + ECART_MIN - time.monotonic()
            c.settimeout(max(.001, reste) if self.attente else .5)
            try:
                m = c.recv(TAILLE + 1)
                if not m: return                      
                e = valider(m)
                c.send(b"\x01" if e else b"\x00")
                if e: self.attente.update({s: x for s, x in zip(STICKS, e) if x[0] != GARDER})
            except socket.timeout: pass
            except OSError: return
            if self.attente and time.monotonic() - self.t >= ECART_MIN: self._ecrire()

    def _ecrire(self):
        a, self.attente, self.t = self.attente, {}, time.monotonic()
        try:
            if self.fd is None:
                p = self.trouver()
                if p is None: return
                self.fd = os.open(p, os.O_WRONLY | os.O_CLOEXEC)
            for s, e in a.items():
                for r in commandes(s, e): os.write(self.fd, r)
        except OSError as x:                          
            self.journal(f"manette indisponible ({type(x).__name__})")
            if self.fd is not None: os.close(self.fd)
            self.fd = None

class Plugin:
    async def _main(self):
        st = os.stat(decky.DECKY_USER_HOME)
        self.serveur = Serveur(st.st_uid, st.st_gid, journal=decky.logger.info)
        self.serveur.demarrer()

    async def _unload(self):
        if getattr(self, "serveur", None): self.serveur.arreter()
