import hashlib, json, os, pathlib, tempfile, urllib.error, urllib.parse, urllib.request
from art_auto import _contexte   

DEPOT = "https://raw.githubusercontent.com/ariankordi/FFL.js/c74d1b94bf4e599fd3a9a16dd346c536dc798391/"   
HOTES = {"raw.githubusercontent.com"}
FICHIERS = {"ffl-emscripten.js": "examples/ffl-emscripten-single-file.cjs",
            "FFLShaderMaterial.browser.js": "dist/materials/FFLShaderMaterial.browser.js",
            "LUTShaderMaterial.browser.js": "dist/materials/LUTShaderMaterial.browser.js"}
DOSSIER = "mii/moteur"               
CORPS_DEPOT = "https://raw.githubusercontent.com/datkat21/mii-creator/b4c5ba19d31a492cbbeefeb94886ba17c9d53822/"   
CORPS = {"miiBodyM_wiiu.glb": "public/assets/models/miiBodyM_wiiu.glb", "miiBodyF_wiiu.glb": "public/assets/models/miiBodyF_wiiu.glb"}
CORPS_DOSSIER = "mii/corps"          
LOGO_DEPOT = "https://upload.wikimedia.org/wikipedia/commons/0/01/"
LOGO = {"mii.svg": "Mii_logo_2010.svg"}
LOGO_DOSSIER = "icones"
LOGO_HOTES = {"upload.wikimedia.org"}
MAX = 1024 * 1024                    
DELAI_S = 30
CONNUS = pathlib.Path(__file__).resolve().parent.parent / "donnees" / "fichiers-connus.json"
AGENT = "SteamU (plugin Decky ; moteur des Mii depuis FFL.js)"

class Refus(Exception):
    pass

def empreintes(connus=CONNUS, dossier=DOSSIER, fichiers=FICHIERS):
    t = {}
    for e in json.loads(pathlib.Path(connus).read_text(encoding="utf-8"))["fichiers"]:
        n = str(e.get("vers", "")).rpartition("/")[2]
        if e.get("vers") == dossier + "/" + n and n in fichiers: t[n] = (e["sha256"], e["taille"])
    if set(t) != set(fichiers): raise Refus("empreinte")
    return t

def _sure(url, hotes=HOTES):
    u = urllib.parse.urlsplit(url)
    return u.scheme == "https" and u.hostname in hotes and u.port in (None, 443) and not u.username

class _Redirection(urllib.request.HTTPRedirectHandler):
    def __init__(self, hotes=HOTES):
        super().__init__()
        self.hotes = hotes

    def redirect_request(self, req, fp, code, msg, headers, nouvelle):
        if not _sure(urllib.parse.urljoin(req.full_url, nouvelle), self.hotes): raise Refus("redirection")
        return super().redirect_request(req, fp, code, msg, headers, nouvelle)

def _ouvreur(hotes=HOTES):
    return urllib.request.build_opener(urllib.request.HTTPSHandler(context=_contexte()), _Redirection(hotes))

def _obtenir(ouvreur, url, hotes=HOTES):
    if not _sure(url, hotes): raise Refus("redirection")
    try:
        with ouvreur.open(urllib.request.Request(url, headers={"User-Agent": AGENT}), timeout=DELAI_S) as r:
            if not _sure(r.geturl(), hotes): raise Refus("redirection")
            if r.status != 200: raise Refus("reseau")
            if int(r.headers.get("Content-Length") or 0) > MAX: raise Refus("taille")
            octets = bytearray()
            while m := r.read(65536):
                octets += m
                if len(octets) > MAX: raise Refus("taille")
    except (urllib.error.URLError, OSError) as e:
        if isinstance(getattr(e, "reason", None), Refus): raise e.reason
        raise Refus("reseau")
    return bytes(octets)

def installe(prive, connus=CONNUS, dossier=DOSSIER, fichiers=FICHIERS):
    try:
        return all(hashlib.sha256((pathlib.Path(prive) / dossier / n).read_bytes()).hexdigest() == s
                   for n, (s, _) in empreintes(connus, dossier, fichiers).items())
    except (OSError, ValueError, KeyError, Refus):
        return False

def installer(prive, ouvreur=None, connus=CONNUS, depot=DEPOT, fichiers=FICHIERS, dossier=DOSSIER, hotes=HOTES):
    attendu = empreintes(connus, dossier, fichiers)
    ouvreur = ouvreur or _ouvreur(hotes)
    recus = {}
    for nom, distant in fichiers.items():
        octets = _obtenir(ouvreur, depot + distant, hotes)
        sha, taille = attendu[nom]
        if len(octets) != taille: raise Refus("taille")
        if hashlib.sha256(octets).hexdigest() != sha: raise Refus("empreinte")
        recus[nom] = octets
    d = pathlib.Path(prive) / dossier
    try:
        d.mkdir(parents=True, exist_ok=True)
        for nom, octets in recus.items():
            fd, tmp = tempfile.mkstemp(dir=d, prefix="." + nom + ".")
            try:
                with os.fdopen(fd, "wb") as f: f.write(octets); f.flush(); os.fsync(f.fileno())
                os.replace(tmp, d / nom)
            except BaseException:
                try: os.unlink(tmp)
                except OSError: pass
                raise
    except OSError: raise Refus("ecriture")
    return {"ok": True}

def installer_corps(prive, ouvreur=None, connus=CONNUS):
    return installer(prive, ouvreur, connus, CORPS_DEPOT, CORPS, CORPS_DOSSIER)

def installer_logo(prive, ouvreur=None, connus=CONNUS):
    return installer(prive, ouvreur, connus, LOGO_DEPOT, LOGO, LOGO_DOSSIER, LOGO_HOTES)
