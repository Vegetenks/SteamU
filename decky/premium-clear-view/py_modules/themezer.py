import base64, json, os, pathlib, re, shutil, tempfile, threading, time, unicodedata, urllib.error, urllib.parse, urllib.request

API = "https://api.themezer.net/graphql"
SITE = "https://themezer.net"
HOTES = {"api.themezer.net", "cdn.themezer.net", "img.themezer.net"}
AGENT = "PremiumClearView (plugin Decky ; themes Themezer)"
ECART_S = 0.35                       
DELAI_S = 25                         
PAR_PAGE = 24
CONSOLES = {"wiiu": "Wii U", "switch": "Switch"}
TRIS = {"telecharges": "Downloads", "recents": "Created", "aimes": "Saves", "tendance": "Trending"}
MAX = {"page": 2 * 1024 * 1024, "apercu": 1024 * 1024, "image": 12 * 1024 * 1024, "musique": 16 * 1024 * 1024, "icone": 256 * 1024}
SIGNATURES = {"png": (b"\x89PNG\r\n\x1a\n",), "jpg": (b"\xff\xd8\xff",), "webp": (b"RIFF",), "ogg": (b"OggS",)}
TYPES = {"png": "image/png", "jpg": "image/jpeg", "webp": "image/webp", "ogg": "audio/ogg"}
ICONES = {"settingsIconUrl": "parametres", "albumIconUrl": "album", "shopIconUrl": "boutique", "controllerIconUrl": "manette",
          "powerIconUrl": "alimentation", "newsIconUrl": "notifications"}
DOSSIER = "themezer"                 

REQUETES = {
    "wiiu": """query($p:PositiveInt!,$n:PositiveInt!,$s:ItemSort,$q:String){wiiu{themes(paginationArgs:{page:$p,limit:$n},sort:$s,order:Desc,isNSFW:false,query:$q){
      pageInfo{page pageCount itemCount} nodes{hexId name description downloadCount saveCount creator{username} bgmPreviewUrl bgmInfo anyAnimation
      launcherBgUrl waraWaraPlazaBgUrl launcherScreenshot{thumbUrl} waraWaraPlazaScreenshot{thumbUrl}}}}}""",
    "switch": """query($p:PositiveInt!,$n:PositiveInt!,$s:ItemSort,$q:String){switch{themes(paginationArgs:{page:$p,limit:$n},sort:$s,order:Desc,isNSFW:false,query:$q,target:ResidentMenu,hasBackgroundImage:true){
      pageInfo{page pageCount itemCount} nodes{hexId name description downloadCount saveCount creator{username} screenshotPreview{thumbUrl}}}}}""",
    "wiiu_theme": """query($h:String!){wiiu{theme(hexId:$h){hexId name creator{username} pageUrl launcherBgUrl waraWaraPlazaBgUrl waraWaraPlazaBgMode
      bgmPreviewUrl bgmPreviewLooppoints bgmInfo}}}""",
    "switch_theme": """query($h:Hexadecimal!){switch{theme(hexId:$h){hexId name creator{username} pageUrl
      assets{backgroundImageUrl settingsIconUrl albumIconUrl shopIconUrl controllerIconUrl powerIconUrl newsIconUrl}}}}""",
}

_verrou_reseau = threading.Lock()
_derniere = 0.0
_cache_pages, _cache_apercus = {}, {}
VUS = {}                             
ETAT = {"etape": "repos"}            
_verrou_install = threading.Lock()

class Refus(Exception):
    pass

def _sure(url):
    if not isinstance(url, str) or len(url) > 2000:
        return None
    u = urllib.parse.urlsplit(url)
    return url if u.scheme == "https" and u.hostname in HOTES and u.port in (None, 443) and not u.username else None

class _Redirection(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not _sure(urllib.parse.urljoin(req.full_url, newurl)):
            raise Refus("redirection hors de Themezer")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

_ouvreur = None

def _ouvrir(req):
    global _ouvreur
    if _ouvreur is None:
        from infinimii import _contexte
        _ouvreur = urllib.request.build_opener(urllib.request.HTTPSHandler(context=_contexte()), _Redirection())
    return _ouvreur.open(req, timeout=DELAI_S)

def _obtenir(url, limite, types, corps=None):
    global _derniere
    if not _sure(url):
        raise Refus("adresse hors de Themezer")
    with _verrou_reseau:
        attente = _derniere + ECART_S - time.monotonic()
        if attente > 0:
            time.sleep(attente)
        _derniere = time.monotonic()
    en_tetes = {"User-Agent": AGENT, "Accept": ", ".join(types)}
    if corps is not None:
        en_tetes["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=corps, headers=en_tetes, method="POST" if corps is not None else "GET")
    with _ouvrir(req) as r:
        if r.status != 200 or not _sure(r.geturl()):
            raise Refus("Themezer a répondu %d" % r.status)
        t = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        if t not in types:
            raise Refus("type de réponse inattendu : " + _texte(t, 40))
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

def _graphql(nom, variables):
    corps = json.dumps({"query": REQUETES[nom], "variables": variables}).encode()
    try:
        d = json.loads(_obtenir(API, MAX["page"], ("application/json",), corps))
    except ValueError:
        raise Refus("réponse de Themezer illisible")
    if not isinstance(d, dict) or not isinstance(d.get("data"), dict):
        raise Refus("Themezer : requête refusée")
    return d["data"]

def _texte(v, n=80):
    if not isinstance(v, str):
        return ""
    v = "".join(c for c in unicodedata.normalize("NFC", v) if unicodedata.category(c)[0] != "C" or c == " ")
    return re.sub(r"\s+", " ", v).strip()[:n]

def _entier(v):
    return v if isinstance(v, int) and not isinstance(v, bool) and 0 <= v < 10 ** 9 else 0

def _console(v):
    if v not in CONSOLES:
        raise Refus("console inconnue")
    return v

def _ident(v):
    v = v if isinstance(v, str) else ""
    if not re.fullmatch(r"[0-9A-F]{1,12}", v):
        raise Refus("identifiant de thème invalide")
    return v

def _dico(d, *cles):
    for c in cles:
        d = d.get(c) if isinstance(d, dict) else None
    return d if isinstance(d, dict) else {}

def recherche(console, texte="", page=1, tri="telecharges"):
    console = _console(console)
    texte = _texte(texte, 60)
    page = max(1, min(int(page) if isinstance(page, (int, float)) else 1, 999))
    v = {"p": page, "n": PAR_PAGE, "s": TRIS.get(tri, "Downloads"), "q": texte or None}
    cle = json.dumps([console, v], sort_keys=True)
    if cle in _cache_pages and time.monotonic() - _cache_pages[cle][0] < 600:
        return _cache_pages[cle][1]
    res = _dico(_graphql(console, v), console, "themes")
    noeuds = res.get("nodes") if isinstance(res.get("nodes"), list) else []
    themes = []
    for n in noeuds[:PAR_PAGE]:
        if not isinstance(n, dict):
            continue
        try:
            ident = _ident(n.get("hexId"))
        except Refus:
            continue
        if console == "wiiu":
            apercus = [_sure(_dico(n, "waraWaraPlazaScreenshot").get("thumbUrl")), _sure(_dico(n, "launcherScreenshot").get("thumbUrl"))]
            musique, images = bool(_sure(n.get("bgmPreviewUrl"))), bool(_sure(n.get("launcherBgUrl")) or _sure(n.get("waraWaraPlazaBgUrl")))
        else:
            apercus, musique, images = [_sure(_dico(n, "screenshotPreview").get("thumbUrl"))], False, True
        apercus = [a for a in apercus if a]
        if not (images or musique):
            continue                 
        t = {"id": ident, "titre": _texte(n.get("name")) or "Thème " + ident, "auteur": _texte(_dico(n, "creator").get("username"), 40),
             "description": _texte(n.get("description"), 240), "telechargements": _entier(n.get("downloadCount")),
             "aimes": _entier(n.get("saveCount")), "musique": musique, "piste": _texte(n.get("bgmInfo"), 80) if musique else "",
             "anime": bool(n.get("anyAnimation")), "ecrans": len(apercus)}
        VUS[(console, ident)] = {"titre": t["titre"], "auteur": t["auteur"], "apercus": apercus}
        themes.append(t)
    info = _dico(res, "pageInfo")
    sortie = {"console": console, "page": page, "pages": _entier(info.get("pageCount")), "total": _entier(info.get("itemCount")), "themes": themes}
    if len(_cache_pages) > 60:
        _cache_pages.clear()
    _cache_pages[cle] = (time.monotonic(), sortie)
    return sortie

def apercu(console, ident, ecran=0):
    cle = (_console(console), _ident(ident))
    vu = VUS.get(cle)
    if not vu:
        raise Refus("thème inconnu : cherche-le d'abord")
    ecran = ecran if isinstance(ecran, int) and not isinstance(ecran, bool) and 0 <= ecran < len(vu["apercus"]) else 0
    if not vu["apercus"]:
        return None
    k = cle + (ecran,)
    if k not in _cache_apercus:
        octets = _obtenir(vu["apercus"][ecran], MAX["apercu"], ("image/webp", "image/jpeg", "image/png"))
        genre = _genre(octets)
        if genre not in ("webp", "jpg", "png"):
            raise Refus("aperçu qui n'est pas une image")
        if len(_cache_apercus) > 150:
            _cache_apercus.pop(next(iter(_cache_apercus)))
        _cache_apercus[k] = {"type": TYPES[genre], "b64": base64.b64encode(octets).decode()}
    return _cache_apercus[k]

def _genre(octets):
    for g, sig in SIGNATURES.items():
        if octets.startswith(sig) and (g != "webp" or octets[8:12] == b"WEBP"):
            return g
    return None

def _fichier(url, max_, genres):
    octets = _obtenir(url, max_, tuple(TYPES[g] for g in genres) + ("application/octet-stream", "binary/octet-stream"))
    g = _genre(octets)
    if g not in genres:
        raise Refus("fichier du thème inattendu")
    return octets, g

def ranger(fichiers, dossier):
    dossier = pathlib.Path(dossier)
    (dossier / DOSSIER).mkdir(parents=True, exist_ok=True)
    tmp = pathlib.Path(tempfile.mkdtemp(prefix=".themezer-", dir=dossier))
    try:
        for n, d in fichiers.items():
            if not re.fullmatch(r"themezer-(wiiu|switch)-[0-9A-F]+(-[a-z]+)?\.(json|png|jpg|webp|ogg|ogg\.boucle)", n):
                raise Refus("nom de fichier inattendu")
            (tmp / n).write_bytes(d)
        for n in sorted(fichiers, key=lambda n: n.endswith(".json")):
            os.replace(tmp / n, (dossier if n.endswith(".json") else dossier / DOSSIER) / n)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

def installer(console, ident, dossier_themes):
    console, ident = _console(console), _ident(ident)
    if (console, ident) not in VUS:
        raise Refus("thème inconnu : cherche-le d'abord")
    if not _verrou_install.acquire(blocking=False):
        raise Refus("une installation est déjà en cours")
    try:
        meta = VUS[(console, ident)]
        nom = "themezer-%s-%s" % (console, ident)
        etape = lambda e, p: ETAT.update(etape=e, pct=round(p, 2))
        ETAT.clear(); ETAT.update(etape="telechargement", pct=0, console=console, id=ident, nom=meta["titre"])
        d = _dico(_graphql(console + "_theme", {"h": ident}), console, "theme")
        if _texte(d.get("hexId"), 12) != ident:
            raise Refus("thème introuvable sur Themezer")
        auteur = _texte(_dico(d, "creator").get("username"), 40) or meta["auteur"]
        lien = d.get("pageUrl") if isinstance(d.get("pageUrl"), str) and d["pageUrl"].startswith(SITE + "/") else SITE
        j = {"nom": _texte(d.get("name")) or meta["titre"], "sous": ("de %s · Themezer %s" % (auteur, CONSOLES[console])) if auteur else "Themezer " + CONSOLES[console],
             "famille": "wiiu", "origine": console, "auteur": auteur, "source": "Themezer", "lien": _texte(lien, 200)}
        sortie = {}
        def prendre(url, champ, suffixe, max_, genres, p):
            if not _sure(url):
                return None
            etape(champ, p)
            octets, g = _fichier(url, max_, genres)
            f = "%s-%s.%s" % (nom, suffixe, g)
            sortie[f] = octets
            j[champ] = DOSSIER + "/" + f
            return f
        if console == "wiiu":
            prendre(d.get("waraWaraPlazaBgUrl"), "tele", "tele", MAX["image"], ("png", "jpg", "webp"), .2)
            if j.get("tele") and d.get("waraWaraPlazaBgMode") == "Tiled":
                j["teleMotif"] = True
            prendre(d.get("launcherBgUrl"), "manette", "manette", MAX["image"], ("png", "jpg", "webp"), .45)
            f = prendre(d.get("bgmPreviewUrl"), "musique", "musique", MAX["musique"], ("ogg",), .7)
            boucle = d.get("bgmPreviewLooppoints")
            if f and isinstance(boucle, list) and len(boucle) == 2 and all(_entier(b) for b in boucle[1:]) and 0 <= _entier(boucle[0]) < boucle[1]:
                sortie[f + ".boucle"] = json.dumps({"debut": _entier(boucle[0]) / 1000, "fin": boucle[1] / 1000, "source": "Themezer"}).encode()
            if _texte(d.get("bgmInfo"), 80):
                j["piste"] = _texte(d.get("bgmInfo"), 80)
        else:
            a = _dico(d, "assets")
            prendre(a.get("backgroundImageUrl"), "tele", "fond", MAX["image"], ("jpg", "png", "webp"), .3)
            for k, appli in ICONES.items():
                if _sure(a.get(k)):
                    etape("icones", .6)
                    octets, g = _fichier(a[k], MAX["icone"], ("png",))
                    f = "%s-%s.%s" % (nom, appli, g)
                    sortie[f] = octets
                    j.setdefault("icones", {})[appli] = DOSSIER + "/" + f
        if not (j.get("tele") or j.get("manette") or j.get("musique")):
            raise Refus("rien d'utilisable dans ce thème")
        sortie[nom + ".json"] = json.dumps(j, ensure_ascii=False, indent=2).encode()
        etape("rangement", .95)
        ranger(sortie, dossier_themes)
        ETAT.update(etape="fini", pct=1, ident=nom)
        return nom
    except Exception as e:
        ETAT.update(etape="erreur", message=_raison(e))
        raise
    finally:
        _verrou_install.release()

def _raison(e):
    if isinstance(e, Refus):
        return str(e)[:160]
    if isinstance(e, urllib.error.HTTPError):
        return "Themezer répond %d" % e.code
    if isinstance(e, (urllib.error.URLError, TimeoutError, OSError)):
        return "Themezer injoignable"
    return "échec (%s)" % type(e).__name__
