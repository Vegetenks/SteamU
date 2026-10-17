import ctypes, os, secrets, shutil, subprocess, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pleinecran import AFFICHAGES

QUALITE_JPEG = 6    

_verrou = threading.Lock()
_etat = {"serveur": None, "jeton": None, "cible": None, "ffmpeg": []}

def _du_logiciel(pid, appid):
    cle = f"AppId={appid}".encode()
    while pid > 1:
        try:
            if cle in open(f"/proc/{pid}/cmdline", "rb").read().split(b"\0"): return True
            pid = int(open(f"/proc/{pid}/stat", "rb").read().rsplit(b")", 1)[1].split()[1])
        except (OSError, ValueError, IndexError):
            return False
    return False

class _Attr(ctypes.Structure):   
    _fields_ = [("x", ctypes.c_int), ("y", ctypes.c_int), ("width", ctypes.c_int), ("height", ctypes.c_int), ("border_width", ctypes.c_int),
                ("depth", ctypes.c_int), ("visual", ctypes.c_void_p), ("root", ctypes.c_ulong), ("class_", ctypes.c_int), ("bit_gravity", ctypes.c_int),
                ("win_gravity", ctypes.c_int), ("backing_store", ctypes.c_int), ("backing_planes", ctypes.c_ulong), ("backing_pixel", ctypes.c_ulong),
                ("save_under", ctypes.c_int), ("colormap", ctypes.c_ulong), ("map_installed", ctypes.c_int), ("map_state", ctypes.c_int),
                ("all_event_masks", ctypes.c_long), ("your_event_mask", ctypes.c_long), ("do_not_propagate_mask", ctypes.c_long),
                ("override_redirect", ctypes.c_int), ("screen", ctypes.c_void_p)]

class _Spec(ctypes.Structure):   
    _fields_ = [("client", ctypes.c_ulong), ("mask", ctypes.c_uint)]
class _Id(ctypes.Structure):
    _fields_ = [("spec", _Spec), ("length", ctypes.c_long), ("value", ctypes.c_void_p)]
PID_CLIENT = 2   

_ERREUR = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p)(lambda d, e: 0)   

def _fenetre(appid):
    vus = {}
    X = ctypes.CDLL("libX11.so.6")
    try:
        R = ctypes.CDLL("libXRes.so.1"); R.XResQueryClientIds.argtypes = [ctypes.c_void_p, ctypes.c_long] + [ctypes.c_void_p] * 3
        R.XResGetClientPid.argtypes = [ctypes.c_void_p]; R.XResClientIdsDestroy.argtypes = [ctypes.c_long, ctypes.c_void_p]
    except OSError:
        R = None
    X.XOpenDisplay.restype = ctypes.c_void_p; X.XOpenDisplay.argtypes = [ctypes.c_char_p]
    X.XDefaultRootWindow.restype = ctypes.c_ulong; X.XDefaultRootWindow.argtypes = [ctypes.c_void_p]
    X.XInternAtom.restype = ctypes.c_ulong; X.XInternAtom.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int]
    X.XQueryTree.argtypes = [ctypes.c_void_p, ctypes.c_ulong] + [ctypes.c_void_p] * 4
    X.XGetWindowProperty.argtypes = [ctypes.c_void_p, ctypes.c_ulong, ctypes.c_ulong, ctypes.c_long, ctypes.c_long, ctypes.c_int, ctypes.c_ulong] + [ctypes.c_void_p] * 5
    X.XGetWindowAttributes.argtypes = [ctypes.c_void_p, ctypes.c_ulong, ctypes.c_void_p]
    X.XFree.argtypes = [ctypes.c_void_p]; X.XCloseDisplay.argtypes = [ctypes.c_void_p]
    X.XSetErrorHandler(_ERREUR)
    meilleure, aire = None, 0
    for affichage in AFFICHAGES:
        d = X.XOpenDisplay(affichage.encode())
        if not d: continue
        try:
            atomes = [X.XInternAtom(d, n, 1) for n in (b"_NET_WM_PID", b"STEAM_GAME")]
            def entier(w, atome):
                t, f, n, r, p = ctypes.c_ulong(), ctypes.c_int(), ctypes.c_ulong(), ctypes.c_ulong(), ctypes.POINTER(ctypes.c_ulong)()
                if not atome or X.XGetWindowProperty(d, w, atome, 0, 1, 0, 0, ctypes.byref(t), ctypes.byref(f), ctypes.byref(n), ctypes.byref(r), ctypes.byref(p)) or not p: return None
                v = p[0] if n.value and f.value == 32 else None
                X.XFree(p); return v
            def pid(w):
                s, n, ids = _Spec(w, PID_CLIENT), ctypes.c_long(), ctypes.POINTER(_Id)()
                if not R or R.XResQueryClientIds(d, 1, ctypes.byref(s), ctypes.byref(n), ctypes.byref(ids)) or not n.value: return entier(w, atomes[0])
                v = R.XResGetClientPid(ids); R.XResClientIdsDestroy(n, ids); return v
            pile = [X.XDefaultRootWindow(d)]
            while pile:
                w = pile.pop()
                r, pa, enf, n = ctypes.c_ulong(), ctypes.c_ulong(), ctypes.POINTER(ctypes.c_ulong)(), ctypes.c_uint()
                if X.XQueryTree(d, w, ctypes.byref(r), ctypes.byref(pa), ctypes.byref(enf), ctypes.byref(n)) and enf:
                    pile += enf[:n.value]; X.XFree(enf)
                a = _Attr()
                if not X.XGetWindowAttributes(d, w, ctypes.byref(a)) or a.map_state != 2 or a.width * a.height <= aire: continue   
                p = pid(w)
                if p and p not in vus: vus[p] = _du_logiciel(p, appid)
                if vus.get(p) or entier(w, atomes[1]) == appid:
                    meilleure, aire = (affichage, w), a.width * a.height
        finally:
            X.XCloseDisplay(d)
    return meilleure

class _Flux(BaseHTTPRequestHandler):
    def do_GET(self):
        with _verrou:
            cible, bon = _etat["cible"], self.path == f"/{_etat['jeton']}"
            if not bon or not cible: return self.send_error(404)
            affichage, fenetre, largeur, ips = cible
            p = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-f", "x11grab", "-draw_mouse", "0", "-window_id", str(fenetre), "-framerate", str(ips), "-i", affichage,
                                  "-vf", f"scale={largeur}:-2:flags=fast_bilinear", "-pix_fmt", "yuvj420p", "-q:v", str(QUALITE_JPEG), "-threads", "1", "-f", "mpjpeg", "-"],
                                 stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, env={**os.environ, "LD_LIBRARY_PATH": ""})
            _etat["ffmpeg"].append(p)
        try:
            self.send_response(200)
            for k, v in (("Content-Type", "multipart/x-mixed-replace;boundary=ffmpeg"), ("Cache-Control", "no-store"), ("Access-Control-Allow-Origin", "*")):
                self.send_header(k, v)
            self.end_headers()
            while b := p.stdout.read1(1 << 16):
                self.wfile.write(b)
        except OSError:
            pass   
        finally:
            p.kill(); p.wait()
            with _verrou:
                if p in _etat["ffmpeg"]: _etat["ffmpeg"].remove(p)

    def log_message(self, *a):
        pass

def _adresse():
    return f"http://127.0.0.1:{_etat['serveur'].server_address[1]}/{_etat['jeton']}" if _etat["serveur"] else None

def debut(appid, largeur, ips):
    if not shutil.which("ffmpeg"): return None
    try:
        cible = _fenetre(int(appid))
    except OSError:
        return None   
    if not cible: return None
    with _verrou:
        if not _etat["serveur"]:
            _etat["serveur"] = ThreadingHTTPServer(("127.0.0.1", 0), _Flux); _etat["serveur"].daemon_threads = True
            threading.Thread(target=_etat["serveur"].serve_forever, name="steamu-apercu", daemon=True).start()
        _etat.update(jeton=secrets.token_urlsafe(16), cible=(*cible, int(largeur), max(1, min(60, int(ips)))))
        return _adresse()

def fin(adresse=None):
    with _verrou:
        if adresse and adresse != _adresse(): return
        serveur, l = _etat["serveur"], _etat["ffmpeg"][:]
        _etat.update(serveur=None, jeton=None, cible=None)
    for p in l: p.kill()
    if serveur: serveur.shutdown(); serveur.server_close()
