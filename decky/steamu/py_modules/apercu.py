import ctypes, itertools, mmap, os, pathlib, secrets, select, socket, struct, subprocess, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pleinecran import AFFICHAGES

NOIR_Y = 32           
ECHANTILLON = 997     

_verrou, _prise = threading.Lock(), threading.Lock()   
_etat = {"serveur": None, "jeton": None, "photo": None}
_numeros = itertools.count()
DOSSIER, IN_CLOSE_WRITE = "/tmp", 0x8   
_libc = ctypes.CDLL(None, use_errno=True)

def _chaine(s):
    b = s.encode() + b"\0"; return struct.pack("I", len(b)) + b + b"\0" * (-len(b) % 4)

class _Gamescope:
    PRIVE = 4   

    def __init__(self, env):
        self.s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM | socket.SOCK_CLOEXEC); self.s.settimeout(1)
        self.s.connect(os.path.join(env["XDG_RUNTIME_DIR"], env.get("GAMESCOPE_WAYLAND_DISPLAY") or "gamescope-0"))
        self.tampon, globaux = b"", {}
        self._envoyer(1, 1, struct.pack("I", 2))   
        self._attendre(3, globaux)
        if "gamescope_private" not in globaux: raise OSError("pas de gamescope_private")
        self._envoyer(2, 0, struct.pack("I", globaux["gamescope_private"]) + _chaine("gamescope_private") + struct.pack("II", 1, self.PRIVE))

    def _envoyer(self, objet, op, a=b""):
        self.s.sendall(struct.pack("II", objet, (8 + len(a)) << 16 | op) + a)

    def _attendre(self, rappel, globaux=None):
        self._envoyer(1, 0, struct.pack("I", rappel))
        while True:
            while len(self.tampon) < 8 or len(self.tampon) < struct.unpack_from("II", self.tampon)[1] >> 16:
                r = self.s.recv(65536)
                if not r: raise OSError("gamescope a fermé")
                self.tampon += r
            objet, t = struct.unpack_from("II", self.tampon); n = t >> 16; a, self.tampon = self.tampon[8:n], self.tampon[n:]
            if objet == 1 and t & 0xffff == 0: raise OSError("erreur Wayland")
            if objet == 2 and globaux is not None:   
                k, = struct.unpack_from("I", a, 4); globaux[a[8:8 + k - 1].decode(errors="replace")] = struct.unpack_from("I", a)[0]
            if objet == rappel: return

    def photo(self, f):
        self._envoyer(self.PRIVE, 1, _chaine("screenshot") + _chaine(f)); self._attendre(5)

    def fermer(self):
        self.s.close()

def _photographier(f, env):
    for _ in range(2):
        try:
            if not _etat.get("wl"): _etat["wl"] = _Gamescope(env)
            return _etat["wl"].photo(f)
        except OSError:
            if _etat.get("wl"): _etat.pop("wl").fermer()
    subprocess.run(["gamescopectl", "screenshot", f], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=1)

def _sorties(racine="/sys/class/drm"):
    tailles = []
    for c in pathlib.Path(racine).glob("card*-*"):
        try:
            if (c / "enabled").read_text().strip() != "enabled": continue
            tailles += [tuple(int(x) for x in m.split("i")[0].split("x")) for m in (c / "modes").read_text().split()]
        except (OSError, ValueError):
            pass
    return tailles

def _ecrans():
    X = ctypes.CDLL("libX11.so.6")
    X.XOpenDisplay.restype = ctypes.c_void_p; X.XOpenDisplay.argtypes = [ctypes.c_char_p]
    for f in (X.XDisplayWidth, X.XDisplayHeight): f.argtypes = [ctypes.c_void_p, ctypes.c_int]
    X.XCloseDisplay.argtypes = [ctypes.c_void_p]
    tailles = []
    for affichage in AFFICHAGES:
        d = X.XOpenDisplay(affichage.encode())
        if d: tailles.append((X.XDisplayWidth(d, 0), X.XDisplayHeight(d, 0))); X.XCloseDisplay(d)
    return tailles

STEAM, BGRX = 769, ".bgrx.bin"   
NOIR_RVB = 16                    

class _Attr(ctypes.Structure):   
    _fields_ = [("x", ctypes.c_int), ("y", ctypes.c_int), ("width", ctypes.c_int), ("height", ctypes.c_int), ("border_width", ctypes.c_int),
                ("depth", ctypes.c_int), ("visual", ctypes.c_void_p), ("root", ctypes.c_ulong), ("class_", ctypes.c_int), ("bit_gravity", ctypes.c_int),
                ("win_gravity", ctypes.c_int), ("backing_store", ctypes.c_int), ("backing_planes", ctypes.c_ulong), ("backing_pixel", ctypes.c_ulong),
                ("save_under", ctypes.c_int), ("colormap", ctypes.c_ulong), ("map_installed", ctypes.c_int), ("map_state", ctypes.c_int),
                ("all_event_masks", ctypes.c_long), ("your_event_mask", ctypes.c_long), ("do_not_propagate_mask", ctypes.c_long),
                ("override_redirect", ctypes.c_int), ("screen", ctypes.c_void_p)]

class _XImage(ctypes.Structure):   
    _fields_ = [("width", ctypes.c_int), ("height", ctypes.c_int), ("xoffset", ctypes.c_int), ("format", ctypes.c_int), ("data", ctypes.c_void_p),
                ("byte_order", ctypes.c_int), ("bitmap_unit", ctypes.c_int), ("bitmap_bit_order", ctypes.c_int), ("bitmap_pad", ctypes.c_int),
                ("depth", ctypes.c_int), ("bytes_per_line", ctypes.c_int), ("bits_per_pixel", ctypes.c_int)]

_ERREUR = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p)(lambda d, e: 0)   

def _x():
    if "X" not in _etat:
        X = ctypes.CDLL("libX11.so.6"); v, ul = ctypes.c_void_p, ctypes.c_ulong
        X.XOpenDisplay.restype = v; X.XOpenDisplay.argtypes = [ctypes.c_char_p]; X.XCloseDisplay.argtypes = [v]
        X.XDefaultRootWindow.restype = ul; X.XDefaultRootWindow.argtypes = [v]
        X.XInternAtom.restype = ul; X.XInternAtom.argtypes = [v, ctypes.c_char_p, ctypes.c_int]
        X.XGetWindowProperty.argtypes = [v, ul, ul, ctypes.c_long, ctypes.c_long, ctypes.c_int, ul] + [v] * 5
        X.XGetWindowAttributes.argtypes = [v, ul, v]
        X.XGetImage.restype = v; X.XGetImage.argtypes = [v, ul, ctypes.c_int, ctypes.c_int, ctypes.c_uint, ctypes.c_uint, ul, ctypes.c_int]
        X.XFree.argtypes = [v]; X.XSetErrorHandler(_ERREUR); _etat["X"] = X
    return _etat["X"]

def _racine(X, d, nom):
    t, f, n, r, p = ctypes.c_ulong(), ctypes.c_int(), ctypes.c_ulong(), ctypes.c_ulong(), ctypes.POINTER(ctypes.c_ulong)()
    a = X.XInternAtom(d, nom, 1)
    if not a or X.XGetWindowProperty(d, X.XDefaultRootWindow(d), a, 0, 64, 0, 0, ctypes.byref(t), ctypes.byref(f), ctypes.byref(n), ctypes.byref(r), ctypes.byref(p)) or not p:
        return []
    v = [p[i] & 0xFFFFFFFF for i in range(n.value)] if f.value == 32 else []   
    X.XFree(p); return v

def _derriere():
    X = _x(); d = X.XOpenDisplay(AFFICHAGES[0].encode())
    if not d: return None
    try:
        f = _racine(X, d, b"GAMESCOPE_FOCUSABLE_WINDOWS")   
        focus = (_racine(X, d, b"GAMESCOPE_FOCUSED_WINDOW") or [0])[0]
    finally:
        X.XCloseDisplay(d)
    fen = [(w, a, p) for w, a, p in zip(f[0::3], f[1::3], f[2::3])]
    derriere = [(w, p) for w, a, p in fen if a not in (0, STEAM)]
    if not derriere or not any(w == focus and a == STEAM for w, a, _ in fen): return None
    return [w for w, p in derriere if not _vulkan(p)]

def _vulkan(pid):
    try:
        with open(f"/proc/{pid}/maps", "rb") as m: return any(b"gamescope_wsi" in l for l in m)
    except OSError:
        return False

def steam_devant():
    try:
        return _derriere() is not None
    except OSError:
        return False

def _fenetre(fenetres, f, noire):
    X, meilleure = _x(), None
    for affichage in AFFICHAGES:
        d = X.XOpenDisplay(affichage.encode())
        if not d: continue
        try:
            for w in fenetres:
                a = _Attr()   
                if X.XGetWindowAttributes(d, w, ctypes.byref(a)) and a.map_state == 2 and (not meilleure or a.width * a.height > meilleure[2] * meilleure[3]):
                    meilleure = (affichage, w, a.width, a.height)
        finally:
            X.XCloseDisplay(d)
    if not meilleure: raise OSError("aucune fenêtre")
    affichage, w, l, h = meilleure; d = X.XOpenDisplay(affichage.encode())
    if not d: raise OSError("X muet")
    try:
        im = X.XGetImage(d, w, 0, 0, l, h, 0xFFFFFFFF, 2)   
        if not im: raise OSError("fenêtre illisible")
        try:
            xi = _XImage.from_address(im)
            if xi.bits_per_pixel != 32: raise OSError("profondeur")
            b, pas = ctypes.string_at(xi.data, xi.bytes_per_line * xi.height), xi.bytes_per_line
        finally:
            X.XFree(xi.data); X.XFree(im)
    finally:
        X.XCloseDisplay(d)
    if not noire and max(max(b[i:i + 3]) for i in range(0, len(b), 4 * ECHANTILLON)) < NOIR_RVB: raise OSError("noire")
    with open(f, "wb") as o: o.write(b)
    return l, h, pas

def image(noire=False):
    nom = f"steamu-apercu-{os.getpid()}-{next(_numeros)}.nv12.bin"; f = os.path.join(DOSSIER, nom)
    env = {**os.environ, "LD_LIBRARY_PATH": "", "XDG_RUNTIME_DIR": os.environ.get("XDG_RUNTIME_DIR") or f"/run/user/{os.getuid()}"}
    try:
        fenetres = _derriere()
        _etat["mode"] = "gamescope (NV12)" if fenetres is None else "fenêtres X (BGRX)" if fenetres else "aucune (jeu Vulkan)"   
        if fenetres is not None:
            f = f[:-len(".nv12.bin")] + BGRX; return (f, *_fenetre(fenetres, f, noire))
        with _prise:
            fd = _libc.inotify_init1(os.O_CLOEXEC | os.O_NONBLOCK)
            if fd < 0 or _libc.inotify_add_watch(fd, DOSSIER.encode(), IN_CLOSE_WRITE) < 0: raise OSError("inotify")
            try:
                _photographier(f, env); fin, prete = time.monotonic() + 1, False
                while not prete and select.select([fd], [], [], max(0, fin - time.monotonic()))[0]:
                    lu, k = os.read(fd, 4096), 0
                    while k < len(lu):
                        t = struct.unpack_from("iIII", lu, k)[3]; prete |= lu[k + 16:k + 16 + t].rstrip(b"\0").decode(errors="replace") == nom; k += 16 + t
            finally:
                os.close(fd)
            if not prete: raise OSError("gamescope muet")
            n = os.path.getsize(f)
        for w, h in _ecrans() + _sorties():   
            pas = n * 2 // (3 * h) if h else 0
            if w <= pas < w + 512 and pas * h * 3 == n * 2: break
        else:
            raise OSError("taille inconnue")
        if not noire:
            with open(f, "rb") as o, mmap.mmap(o.fileno(), 0, prot=mmap.PROT_READ) as m:
                if max(m[0:pas * h:ECHANTILLON]) < NOIR_Y: raise OSError("noire")
        return f, w, h, pas
    except (OSError, subprocess.SubprocessError) as e:
        _etat["echec"] = f"{time.strftime('%H:%M:%S')} {type(e).__name__}: {str(e)[:80]}"
        _effacer(f)
        return None

def reduire(b, w, h, pas, k):
    w2, h2 = (w // k) & ~1, (h // k) & ~1
    y = b"".join(b[r * k * pas:r * k * pas + w2 * k:k] for r in range(h2))
    uv = bytearray(w2 * h2 // 2); o = pas * h
    for r in range(h2 // 2):
        ligne = b[o + r * k * pas:o + r * k * pas + w2 * k]; d = r * w2
        uv[d:d + w2:2] = ligne[0::2 * k]; uv[d + 1:d + w2:2] = ligne[1::2 * k]
    return y + bytes(uv), w2, h2

def reduire_bgrx(b, w, h, pas, k):
    w2, h2, m, p = w // k, h // k, memoryview(b).cast("I"), pas // 4
    return b"".join(m[r * k * p:r * k * p + w2 * k:k].tobytes() for r in range(h2)), w2, h2

def _effacer(f):
    try:
        os.unlink(f)
    except OSError:
        pass

class _Image(BaseHTTPRequestHandler):
    def do_GET(self):
        jeton, _, quoi = self.path[1:].partition("/"); quoi, _, q = quoi.partition("?")
        if jeton != _etat["jeton"]: return self.send_error(404)
        if quoi == "photo":   
            with _verrou: im, _etat["photo"] = _etat["photo"], None
        else:                 
            im = image(noire=True) if quoi == "direct" else image() if quoi == "fixe" else None
        if not im: return self.send_error(404)
        f, w, h, pas = im; fmt = "BGRX" if f.endswith(BGRX) else "NV12"
        try:
            k = max(1, w // int(q[2:])) if quoi == "direct" and q.startswith("l=") and q[2:].isdigit() and int(q[2:]) > 0 else 1
            if k > 1:
                with open(f, "rb") as o: b, w, h = (reduire_bgrx if fmt == "BGRX" else reduire)(o.read(), w, h, pas, k)
                return self._envoyer(b, w, h, fmt)
            with open(f, "rb") as o:
                self.send_response(200)
                for k, v in (("Content-Type", "application/octet-stream"), ("Content-Length", os.fstat(o.fileno()).st_size), ("Cache-Control", "no-store"),
                             ("X-Largeur", w), ("X-Hauteur", h), ("X-Pas", pas), ("X-Format", fmt), ("Access-Control-Allow-Origin", "*"),
                             ("Access-Control-Expose-Headers", "X-Largeur, X-Hauteur, X-Pas, X-Format")):
                    self.send_header(k, str(v))
                self.end_headers(); self.connection.sendfile(o)
        except OSError:
            pass   
        finally:
            _effacer(f)

    def _envoyer(self, b, w, h, fmt):
        self.send_response(200)
        for k, v in (("Content-Type", "application/octet-stream"), ("Content-Length", len(b)), ("Cache-Control", "no-store"),
                     ("X-Largeur", w), ("X-Hauteur", h), ("X-Pas", w * 4 if fmt == "BGRX" else w), ("X-Format", fmt), ("Access-Control-Allow-Origin", "*"),
                     ("Access-Control-Expose-Headers", "X-Largeur, X-Hauteur, X-Pas, X-Format")):
            self.send_header(k, str(v))
        self.end_headers(); self.wfile.write(b)

    def log_message(self, *a):
        pass

def _adresse():
    with _verrou:
        if not _etat["serveur"]:
            s = _etat["serveur"] = ThreadingHTTPServer(("127.0.0.1", 0), _Image); s.daemon_threads = True
            _etat["jeton"] = secrets.token_urlsafe(16)
            threading.Thread(target=s.serve_forever, args=(None,), name="steamu-apercu", daemon=True).start()
        return f"http://127.0.0.1:{_etat['serveur'].server_address[1]}/{_etat['jeton']}"

def photo():
    im = image()
    if not im: return None
    with _verrou: vieille, _etat["photo"] = _etat["photo"], im
    if vieille: _effacer(vieille[0])
    return _adresse() + "/photo"

def direct():
    return _adresse() + "/direct"

def fin():
    with _verrou:
        s, p, _etat["serveur"], _etat["jeton"], _etat["photo"] = _etat["serveur"], _etat["photo"], None, None, None
    if p: _effacer(p[0])
    if s: s.server_close()
    with _prise:
        if _etat.get("wl"): _etat.pop("wl").fermer()
