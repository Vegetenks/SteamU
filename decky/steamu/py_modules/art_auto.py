import base64, json, os, re, ssl, threading, time, unicodedata, urllib.error, urllib.parse, urllib.request

HOTES = {"store.steampowered.com", "shared.steamstatic.com"}
UA = "SteamU/1.0 (personal Steam theme; auto artwork for non-Steam shortcuts, public store search only)"
ECART_S = 1.0                        
DELAI_S = 10
MAX_RECHERCHE = 512 * 1024
MAX_IMAGE = 12 * 1024 * 1024
SIGNATURES = {"jpg": (b"\xff\xd8\xff",), "png": (b"\x89PNG\r\n\x1a\n",)}
ACTIFS = {"grille": ("library_600x900.jpg", "jpg", 0), "header": ("header.jpg", "jpg", 1),
          "hero": ("library_hero.jpg", "jpg", 2), "logo": ("logo.png", "png", 3)}

_verrou_reseau = threading.Lock()
_derniere = 0.0
_ouvreur = None

class Refus(Exception):
    pass

def _contexte():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        pass
    for f in ("/etc/ssl/certs/ca-certificates.crt", "/etc/ca-certificates/extracted/tls-ca-bundle.pem", "/etc/ssl/cert.pem"):
        if os.path.isfile(f):
            return ssl.create_default_context(cafile=f)
    return ssl.create_default_context()

class _Redirection(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, nouvelle):
        u = urllib.parse.urlsplit(urllib.parse.urljoin(req.full_url, nouvelle))
        if u.scheme != "https" or u.hostname not in HOTES or u.port not in (None, 443):
            raise Refus("redirection hors liste blanche")
        return super().redirect_request(req, fp, code, msg, headers, nouvelle)

def _ouvrir(req):
    global _ouvreur
    if _ouvreur is None:
        _ouvreur = urllib.request.build_opener(urllib.request.HTTPSHandler(context=_contexte()), _Redirection())
    return _ouvreur.open(req, timeout=DELAI_S)

def _obtenir(url, limite, types):
    u = urllib.parse.urlsplit(url)
    if u.scheme != "https" or u.hostname not in HOTES or u.port not in (None, 443) or u.username:
        raise Refus("adresse hors liste blanche")
    global _derniere
    with _verrou_reseau:
        attente = _derniere + ECART_S - time.monotonic()
        if attente > 0:
            time.sleep(attente)
        _derniere = time.monotonic()
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": ", ".join(types), "Accept-Language": "en"})
    with _ouvrir(req) as r:
        if r.status != 200 or urllib.parse.urlsplit(r.geturl()).hostname not in HOTES:
            raise Refus("réponse %s" % r.status)
        genre = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        if genre not in types:
            raise Refus("type de réponse inattendu : " + genre[:40])
        if int(r.headers.get("Content-Length") or 0) > limite:
            raise Refus("fichier trop gros")
        octets = bytearray()
        while True:
            m = r.read(65536)
            if not m:
                break
            octets += m
            if len(octets) > limite:
                raise Refus("fichier trop gros")
    return bytes(octets)

_SUFFIXES = re.compile(r"\s*[\(\[][^)\]]*[\)\]]\s*$")          
_PONCT = re.compile(r"[^a-z0-9 ]+")

def _normaliser(nom):
    n = unicodedata.normalize("NFKD", nom or "").encode("ascii", "ignore").decode().lower()
    while True:
        n2 = _SUFFIXES.sub("", n).strip()
        if n2 == n:
            break
        n = n2
    n = _PONCT.sub(" ", n).replace(" the ", " ").strip()
    return re.sub(r"\s+", " ", n).strip()

def _rechercher(nom):
    url = "https://store.steampowered.com/api/storesearch/?" + urllib.parse.urlencode({"term": nom, "cc": "FR", "l": "english"})
    try:
        d = json.loads(_obtenir(url, MAX_RECHERCHE, ("application/json",)))
    except (ValueError, urllib.error.URLError, Refus):
        return []
    if not isinstance(d, dict) or not isinstance(d.get("items"), list):
        return []
    return [{"id": it["id"], "nom": it["name"]} for it in d["items"]
            if isinstance(it, dict) and isinstance(it.get("id"), int) and isinstance(it.get("name"), str)][:10]

def _correspondance(nom, candidats):
    cible = _normaliser(nom)
    if not cible:
        return None
    for c in candidats:
        if _normaliser(c["nom"]) == cible:
            return c
    return None

def _images(appid):
    sorties = {}
    for cle, (fichier, ext, type_art) in ACTIFS.items():
        url = "https://shared.steamstatic.com/store_item_assets/steam/apps/%d/%s" % (appid, fichier)
        try:
            octets = _obtenir(url, MAX_IMAGE, ("image/jpeg", "image/png"))
        except (urllib.error.URLError, Refus):
            continue
        if not any(octets.startswith(s) for s in SIGNATURES[ext]):
            continue
        sorties[cle] = {"base64": base64.b64encode(octets).decode("ascii"), "ext": ext, "assetType": type_art}
    return sorties

def preparer(nom):
    nom = (nom or "").strip()[:200]
    if not nom:
        return {"trouve": False}
    c = _correspondance(nom, _rechercher(nom))
    if not c:
        return {"trouve": False}
    images = _images(c["id"])
    if not images:
        return {"trouve": False}
    return {"trouve": True, "appid": c["id"], "nom": c["nom"], "images": images}
