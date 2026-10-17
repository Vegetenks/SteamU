import hashlib, json, pathlib, re, threading, time, unicodedata, urllib.error, urllib.parse, urllib.request

HOTES = {"lrclib.net"}
API = "https://lrclib.net/api/"
AGENT = "SteamU (plugin Decky ; paroles)"
ECART_S = 2.0                        
DELAI_S = 10
MAX_OCTETS = 512 * 1024
VIDE_JOURS = 7
INTERMEDE_S = 4.0                    
ECART_DUREE_S = 4                    

_verrou = threading.Lock()
_derniere = 0.0

class Refus(Exception):
    pass

def _sure(url):
    u = urllib.parse.urlsplit(url)
    return u.scheme == "https" and u.hostname in HOTES and u.port in (None, 443) and not u.username

class _Redirection(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not _sure(urllib.parse.urljoin(req.full_url, newurl)):
            raise Refus("redirection hors de LRCLIB")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

_ouvreur = None

def _obtenir(chemin, params):
    global _ouvreur, _derniere
    url = API + chemin + "?" + urllib.parse.urlencode(params)
    if not _sure(url):
        raise Refus("adresse hors de LRCLIB")
    if _ouvreur is None:
        from infinimii import _contexte   
        _ouvreur = urllib.request.build_opener(urllib.request.HTTPSHandler(context=_contexte()), _Redirection())
    with _verrou:   
        attente = _derniere + ECART_S - time.monotonic()
        if attente > 0:
            time.sleep(attente)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": AGENT, "Accept": "application/json"})
            with _ouvreur.open(req, timeout=DELAI_S) as r:
                if not _sure(r.geturl()):
                    raise Refus("réponse hors de LRCLIB")
                if int(r.headers.get("Content-Length") or 0) > MAX_OCTETS:
                    raise Refus("réponse trop grosse")
                octets = r.read(MAX_OCTETS + 1)
                if len(octets) > MAX_OCTETS:
                    raise Refus("réponse trop grosse")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            raise
        finally:
            _derniere = time.monotonic()
    try:
        return json.loads(octets)
    except ValueError:
        raise Refus("réponse illisible")

def _texte(v, n=200):
    if not isinstance(v, str):
        return ""
    v = "".join(c for c in unicodedata.normalize("NFC", v) if unicodedata.category(c)[0] != "C" or c == " ")
    return re.sub(r"\s+", " ", v).strip()[:n]

_BRUIT = re.compile(r"\s*[(\[](?:[^)\]]*\b(?:official|officiel|offizielles?|oficial|video|vidéo|clip|audio|lyrics?|paroles|letra|"
                    r"visuali[sz]er|hd|hq|4k|remaster(?:ed)?|live session|mv|feat|ft)\b[^)\]]*)[)\]]", re.I)

def _nettoyer(artiste, titre):
    artiste = re.sub(r"\s*-\s*Topic$|VEVO$", "", _texte(artiste), flags=re.I).strip()
    titre = _BRUIT.sub("", _texte(titre)).strip()
    serre = lambda v: re.sub(r"\W+", "", v).lower()
    if " - " in titre and (not artiste or serre(titre.split(" - ", 1)[0]) == serre(artiste)):
        a, t = titre.split(" - ", 1)
        artiste, titre = a.strip(), t.strip()   
    titre = re.sub(r"\s+(?:ft|feat)\.?\s.*$", "", titre, flags=re.I).strip()
    return artiste, titre

_LIGNE = re.compile(r"\[(\d+):(\d{1,2}(?:[.:]\d{1,3})?)\]")
_MOT = re.compile(r"<(\d+):(\d{1,2}(?:[.:]\d{1,3})?)>")   
_sec = lambda m: int(m.group(1)) * 60 + float(m.group(2).replace(":", "."))

def _mots(reste):
    tags = list(_MOT.finditer(reste))
    if not tags:
        return None
    mots = []
    for k, m in enumerate(tags):
        x = reste[m.end():tags[k + 1].start() if k + 1 < len(tags) else len(reste)]
        x = re.sub(r"\s+", " ", "".join(c for c in x if unicodedata.category(c)[0] != "C" or c == " "))[:200]
        mots.append([round(_sec(m), 2), x.lstrip() if not mots else x])
    if mots[-1][1].strip():
        mots[-1][1] = mots[-1][1].rstrip()
    return mots if any(x.strip() for _, x in mots) else None

_NOTE = re.compile(r"[\s♩♪♫♬🎵🎶.…]+")

def _lrc(texte):
    brut = []
    for ligne in str(texte or "").splitlines()[:2000]:
        tags = list(_LIGNE.finditer(ligne))
        if not tags:
            continue
        reste = ligne[tags[-1].end():]
        mots = _mots(reste)
        x = _texte(_MOT.sub("", reste))
        if not _NOTE.sub("", x):
            x, mots = "", None   
        for m in tags:
            brut.append((_sec(m), x, mots if len(tags) == 1 else None))
    brut.sort(key=lambda l: l[0])
    sortie = []
    for i, (t, x, mots) in enumerate(brut):
        suivant = brut[i + 1][0] if i + 1 < len(brut) else None
        if not x and (suivant is None or suivant - t < INTERMEDE_S):
            continue   
        if sortie and not x and not sortie[-1][1]:
            continue
        sortie.append([round(t, 2), x] + ([mots] if x and mots else []))
    if sortie and sortie[0][0] >= INTERMEDE_S and sortie[0][1]:
        sortie.insert(0, [0, ""])   
    return sortie

def _choisir(reponses, duree):
    for r in reponses if isinstance(reponses, list) else []:
        if isinstance(r, dict) and isinstance(r.get("syncedLyrics"), str) and len(_LIGNE.findall(r["syncedLyrics"])) >= 3 and (not duree or abs((r.get("duration") or 0) - duree) <= ECART_DUREE_S):
            return r
    return None

def chercher(artiste, titre, album, duree, dossier):
    artiste, titre = _nettoyer(artiste, titre)
    album = _texte(album)
    duree = round(duree) if isinstance(duree, (int, float)) and 0 < duree < 6 * 3600 else 0
    if not titre:
        return {"vide": True}
    cache = pathlib.Path(dossier)
    fichier = cache / (hashlib.sha1(json.dumps([artiste.lower(), titre.lower(), album.lower(), duree, "m2"]).encode()).hexdigest() + ".json")
    try:
        d = json.loads(fichier.read_text())
        if d.get("lignes") or time.time() - fichier.stat().st_mtime < VIDE_JOURS * 86400:
            return d
    except (OSError, ValueError, AttributeError):
        pass
    try:
        r = None
        if artiste and album and duree:
            r = _choisir([_obtenir("get", {"artist_name": artiste, "track_name": titre, "album_name": album, "duration": duree})], duree)
        if r is None:
            reponses = _obtenir("search", {"track_name": titre, **({"artist_name": artiste} if artiste else {})})
            r = _choisir(reponses, duree)
            if r is None and duree:   
                r = _choisir(reponses, 0)
    except Exception as e:
        return {"erreur": _raison(e)}
    lignes = _lrc(r["syncedLyrics"]) if r else []
    d = {"lignes": lignes} if any(x for _, x in lignes) else {"vide": True}
    try:
        cache.mkdir(parents=True, exist_ok=True)
        fichier.write_text(json.dumps(d, ensure_ascii=False))
    except OSError:
        pass
    return d

def _raison(e):
    if isinstance(e, Refus):
        return str(e)[:160]
    if isinstance(e, urllib.error.HTTPError):
        return "LRCLIB répond %d" % e.code
    if isinstance(e, (urllib.error.URLError, TimeoutError, OSError)):
        return "LRCLIB injoignable"
    return "échec (%s)" % type(e).__name__
