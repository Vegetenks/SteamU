import base64, html, os, re, ssl, threading, time, unicodedata, urllib.parse, urllib.request

HOTE = "infinimii.com"
RACINE = "https://" + HOTE
UA = "SteamU/1.0 (personal Steam theme; Mii Maker catalogue, fetches only on user request)"
ECART_S = 0.35                       
DELAI_S = 20                         
MAX_PAGE = 2 * 1024 * 1024           
MAX_IMAGE = 512 * 1024               
MAX_RESULTATS = 48
DUREE_CACHE = 600
PNG = b"\x89PNG\r\n\x1a\n"
FORME_ID = re.compile(r"[A-Za-z0-9_-]{3,16}")

_verrou_reseau = threading.Lock()
_derniere = 0.0
_cache_pages, _cache_images, _suites = {}, {}, {}
VUS = {}                             

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
        u = urllib.parse.urlsplit(nouvelle)
        if u.scheme != "https" or u.hostname != HOTE or u.port not in (None, 443):
            raise Refus("redirection hors d'InfiniMii refusée")
        return super().redirect_request(req, fp, code, msg, headers, nouvelle)

_ouvreur = None

def _adresse(chemin, params=None):
    assert chemin.startswith("/") and "//" not in chemin and ".." not in chemin and not chemin.startswith("/api/")
    return RACINE + chemin + ("?" + urllib.parse.urlencode(params) if params else "")

def _obtenir(chemin, params, limite, types):
    global _ouvreur, _derniere
    url = _adresse(chemin, params)
    if _ouvreur is None:
        _ouvreur = urllib.request.build_opener(urllib.request.HTTPSHandler(context=_contexte()), _Redirection())
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": ", ".join(types)})
    with _verrou_reseau:
        attente = _derniere + ECART_S - time.monotonic()
        if attente > 0:
            time.sleep(attente)
        _derniere = time.monotonic()
    with _ouvreur.open(req, timeout=DELAI_S) as r:
        if urllib.parse.urlsplit(r.geturl()).hostname != HOTE:
            raise Refus("réponse hors d'InfiniMii")
        genre = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        if genre not in types:
            raise Refus("type de réponse inattendu : " + genre[:40])
        if int(r.headers.get("Content-Length") or 0) > limite:
            raise Refus("réponse trop grosse")
        d = r.read(limite + 1)
        if len(d) > limite:
            raise Refus("réponse trop grosse")
        return d

def _texte(v, n=80):
    if not isinstance(v, str):
        return ""
    v = "".join(c for c in unicodedata.normalize("NFC", re.sub(r"\s", " ", v)) if unicodedata.category(c)[0] != "C" or c == " ")
    return re.sub(r"\s+", " ", v).strip()[:n]

def _sans_balises(fragment):
    return _texte(html.unescape(re.sub(r"<[^>]*>", " ", fragment)), 400)

def _ident(v):
    if not isinstance(v, str) or not FORME_ID.fullmatch(v):
        raise Refus("identifiant de Mii invalide")
    return v

def lire_resultats(page_html):
    mii = []
    for a in re.findall(r"<article\b([^>]*\bclass=\"mii-card\b[^>]*>.*?)</article>", page_html, re.S)[:MAX_RESULTATS]:
        i = re.search(r"\bid=\"([^\"]*)\"", a)
        n = re.search(r"class=\"mii-card-title-link\"[^>]*>(.*?)</a>", a, re.S)
        if not i or not n or not FORME_ID.fullmatch(i.group(1)):
            continue
        b = re.search(r"class=\"mii-card-byline\"[^>]*>(.*?)</p>", a, re.S)
        auteur, source = "", False
        if b:
            lien = re.search(r"<a\b[^>]*>(.*?)</a>", b.group(1), re.S)
            auteur = _texte(_sans_balises(lien.group(1) if lien else b.group(1)), 40)
            source = bool(re.search(r"<span>\s*From\s*</span>", b.group(1)))   
        d = re.search(r"class=\"mii-card-description\"[^>]*>(.*?)</p>", a, re.S)
        mii.append({"id": i.group(1), "nom": _texte(_sans_balises(n.group(1)), 40) or "Mii", "auteur": auteur, "source": source,
                    "description": _texte(_sans_balises(d.group(1)), 200) if d else ""})
    suite = None
    m = re.search(r"href=\"/searchResults\?([^\"]*\bstart=[^\"]*)\"", page_html)
    if m:
        q = urllib.parse.parse_qs(html.unescape(m.group(1)))
        start, curseur = (q.get("start") or [""])[0], (q.get("cursor") or [""])[0]
        if re.fullmatch(r"[0-9]{1,5}", start) and re.fullmatch(r"[A-Za-z0-9._=-]{1,4000}", curseur):
            suite = {"start": start, "cursor": curseur}
    return mii, suite

def recherche(texte="", page=1):
    texte = _texte(texte, 60)
    page = max(1, min(int(page) if isinstance(page, (int, float)) and not isinstance(page, bool) else 1, 200))
    cle = (texte, page)
    if cle in _cache_pages and time.monotonic() - _cache_pages[cle][0] < DUREE_CACHE:
        return _cache_pages[cle][1]
    params = {"q": texte}
    if page > 1:
        s = _suites.get((texte, page - 1))
        if not s:
            raise Refus("page inconnue : refais la recherche")
        params.update(s)
    brut = _obtenir("/searchResults", params, MAX_PAGE, ("text/html",))
    mii, suite = lire_resultats(brut.decode("utf-8", "replace"))
    if len(VUS) > 5000:
        VUS.clear()
    for m in mii:
        VUS[m["id"]] = {"nom": m["nom"], "auteur": m["auteur"]}
    if suite:
        if len(_suites) > 200:
            _suites.clear()
        _suites[(texte, page)] = suite
    sortie = {"texte": texte, "page": page, "suite": bool(suite), "mii": mii}
    if len(_cache_pages) > 40:
        _cache_pages.clear()
    _cache_pages[cle] = (time.monotonic(), sortie)
    return sortie

def _image(gabarit, ident):
    ident = _ident(ident)
    if ident not in VUS:
        raise Refus("Mii inconnu : cherche-le d'abord")
    cle = gabarit % ident
    if cle not in _cache_images:
        png = _obtenir(cle, None, MAX_IMAGE, ("image/png",))
        if not png.startswith(PNG):
            raise Refus("image qui n'est pas un PNG")
        if len(_cache_images) > 96:
            _cache_images.pop(next(iter(_cache_images)))
        _cache_images[cle] = base64.b64encode(png).decode()
    return _cache_images[cle]

def miniature(ident):
    return _image("/miiImgs/%s.png", ident)

def qr(ident):
    return _image("/miiQRs3DS/%s.png", ident)
