import base64, hashlib, html, json, os, pathlib, re, ssl, struct, tempfile, threading, time, unicodedata
import urllib.error, urllib.parse, urllib.request

HOTE_DB = "raw.githubusercontent.com"
HOTE_IMG = "img-eshop.cdn.nintendo.net"
UA = "PremiumClearView/1.0 (personal Steam theme; Switch shortcut info, fetched only for the user's own shortcuts)"
ECART_S = 1.0                         
DELAI_IMG_S = 15                      
DELAI_DB_S = 90                       
MAX_DB = 160 * 1024 * 1024            
MAX_IMAGE = 4 * 1024 * 1024           
MAX_CAPTURES = 6
DUREE_CACHE_S = 30 * 24 * 3600        
DUREE_ECHEC_S = 24 * 3600             
LANGUES = {"fr": "FR.fr.json", "es": "ES.es.json", "en": "US.en.json"}
REPLI_ANGLAIS = "US.en.json"

TITLEID_RE = re.compile(r"[\[(]([0-9A-Fa-f]{16})[\])]")   
ROM_RE = re.compile(r"\.(nsp|xci)\b", re.I)
NOM_FICHIER_DB_RE = re.compile(r"[A-Z]{2}\.[a-z]{2}\.json")
TITLEID_VALIDE_RE = re.compile(r"[0-9A-F]{16}")

PNG_SIG, JPEG_SIG, RIFF_SIG, WEBP_SIG = b"\x89PNG\r\n\x1a\n", b"\xff\xd8\xff", b"RIFF", b"WEBP"

_verrou_reseau = threading.Lock()
_verrou_maj = threading.Lock()        
_derniere = 0.0

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
    def __init__(self, hote):
        self.hote = hote

    def redirect_request(self, req, fp, code, msg, headers, nouvelle):
        u = urllib.parse.urlsplit(nouvelle)
        if u.scheme != "https" or u.hostname != self.hote or u.port not in (None, 443):
            raise Refus("redirection hors de %s refusée" % self.hote)
        return super().redirect_request(req, fp, code, msg, headers, nouvelle)

def _attendre():
    global _derniere
    with _verrou_reseau:
        attente = _derniere + ECART_S - time.monotonic()
        if attente > 0:
            time.sleep(attente)
        _derniere = time.monotonic()

def _ouvreur(hote):
    return urllib.request.build_opener(urllib.request.HTTPSHandler(context=_contexte()), _Redirection(hote))

def _texte(v, n=120):
    if not isinstance(v, str):
        return ""
    v = "".join(c for c in unicodedata.normalize("NFC", re.sub(r"\s", " ", v)) if unicodedata.category(c)[0] != "C" or c == " ")
    return re.sub(r"\s+", " ", v).strip()[:n]

def _sans_balises(fragment, n=2000):
    if not isinstance(fragment, str):
        return ""
    return _texte(html.unescape(re.sub(r"<[^>]*>", " ", fragment)), n)

def _date_iso(v):
    import datetime
    if not isinstance(v, int) or isinstance(v, bool):
        return None
    s = str(v)
    if len(s) != 8:
        return None
    try:
        d = datetime.date(int(s[0:4]), int(s[4:6]), int(s[6:8]))
        return d.isoformat()
    except ValueError:
        return None

def _url_image(u):
    if not isinstance(u, str):
        return None
    p = urllib.parse.urlsplit(u)
    return u if p.scheme == "https" and p.hostname == HOTE_IMG and len(u) < 400 else None

def _telecharger_titledb(nom_fichier):
    assert NOM_FICHIER_DB_RE.fullmatch(nom_fichier)
    url = "https://%s/blawar/titledb/master/%s" % (HOTE_DB, nom_fichier)
    _attendre()
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json, text/plain"})
    tmp = tempfile.NamedTemporaryFile(prefix="pcv-titledb-", suffix=".json", dir="/dev/shm", delete=False)
    try:
        with _ouvreur(HOTE_DB).open(req, timeout=DELAI_DB_S) as r:
            if urllib.parse.urlsplit(r.geturl()).hostname != HOTE_DB:
                raise Refus("réponse hors de GitHub")
            genre = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
            if genre not in ("text/plain", "application/json"):
                raise Refus("type de réponse inattendu : " + genre[:40])
            annonce = r.headers.get("Content-Length")
            if annonce and int(annonce) > MAX_DB:
                raise Refus("base titledb trop grosse")
            total = 0
            while True:
                bloc = r.read(256 * 1024)
                if not bloc:
                    break
                total += len(bloc)
                if total > MAX_DB:
                    raise Refus("base titledb trop grosse")
                tmp.write(bloc)
        tmp.close()
        if total < 1024:
            raise Refus("base titledb trop petite, probablement invalide")
        with open(tmp.name, "rb") as f:
            if f.read(1).lstrip() != b"{":
                raise Refus("base titledb : ne commence pas par un objet JSON")
            f.seek(max(0, total - 64))
            if f.read().rstrip()[-1:] != b"}":
                raise Refus("base titledb : fichier tronqué")
        return pathlib.Path(tmp.name)
    except Exception:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass
        raise

_DEBUT_ENTREE = re.compile(r'^ {4}"[^"\\]*": \{\s*$')
_FIN_ENTREE = re.compile(r'^ {4}\},?\s*$')

def _champs_utiles(v):
    genres = [g for g in (_texte(g, 40) for g in (v.get("category") or []) if isinstance(g, str)) if g][:6]
    descripteurs = [d for d in (_texte(d, 40) for d in (v.get("ratingContent") or []) if isinstance(d, str)) if d][:8]
    captures = [u for u in (_url_image(s) for s in (v.get("screenshots") or [])[:MAX_CAPTURES]) if u]
    return {
        "nom": _texte(v.get("name"), 120) or None,
        "description": _sans_balises(v.get("description") or ""),
        "editeur": _texte(v.get("publisher"), 80) or None,
        "date": _date_iso(v.get("releaseDate")),
        "genres": genres,
        "joueurs": v.get("numberOfPlayers") if isinstance(v.get("numberOfPlayers"), int) and not isinstance(v.get("numberOfPlayers"), bool) else None,
        "age": v.get("rating") if isinstance(v.get("rating"), int) and not isinstance(v.get("rating"), bool) else None,
        "descripteurs_age": descripteurs,
        "taille_octets": v.get("size") if isinstance(v.get("size"), int) and not isinstance(v.get("size"), bool) else None,
        "icone_url": _url_image(v.get("iconUrl")),
        "banniere_url": _url_image(v.get("bannerUrl")),
        "captures_url": captures,
    }

def _extraire_titres(chemin, titleids):
    cherches = {t.upper() for t in titleids}
    trouves = {}
    dans, lignes = False, []
    with open(chemin, "r", encoding="utf-8", errors="replace") as f:
        for ligne in f:
            if not dans:
                if _DEBUT_ENTREE.match(ligne):
                    dans, lignes = True, [ligne]
                continue
            lignes.append(ligne)
            if _FIN_ENTREE.match(ligne):
                dans = False
                bloc = "".join(lignes).rstrip()
                if bloc.endswith(","):
                    bloc = bloc[:-1]
                lignes = []
                try:
                    enregistrement = json.loads("{" + bloc + "}")
                except ValueError:
                    continue
                for valeur in enregistrement.values():
                    if not isinstance(valeur, dict):
                        continue
                    tid = _texte(valeur.get("id"), 16).upper()
                    if tid in cherches and tid not in trouves and TITLEID_VALIDE_RE.fullmatch(tid):
                        trouves[tid] = _champs_utiles(valeur)
                if len(trouves) >= len(cherches):
                    break
    return trouves

def _telecharger_et_extraire(fichier_langue, titleids):
    chemin = _telecharger_titledb(fichier_langue)
    try:
        return _extraire_titres(chemin, titleids)
    finally:
        try:
            chemin.unlink()
        except OSError:
            pass

def _dossier_cache(dossier_donnees):
    d = pathlib.Path(dossier_donnees) / "fiches-switch"
    d.mkdir(parents=True, exist_ok=True)
    return d

def _fichier_cache(dossier_donnees):
    return _dossier_cache(dossier_donnees) / "titledb.json"

def _lire_cache(dossier_donnees):
    try:
        d = json.loads(_fichier_cache(dossier_donnees).read_text(encoding="utf-8"))
        return d if isinstance(d, dict) else {}
    except Exception:
        return {}

def _ecrire_cache(dossier_donnees, cache):
    f = _fichier_cache(dossier_donnees)
    tmp = f.with_suffix(".tmp")
    tmp.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
    tmp.replace(f)

def _expiree(entree, maintenant):
    duree = DUREE_ECHEC_S if entree.get("_echec") else DUREE_CACHE_S
    return maintenant - entree.get("_recu", 0) > duree

def fiches(titleids, langue, dossier_donnees):
    demandes = sorted({_texte(t, 16).upper() for t in titleids if TITLEID_VALIDE_RE.fullmatch(_texte(t, 16).upper())})
    if not demandes:
        return {}
    with _verrou_maj:
        cache = _lire_cache(dossier_donnees)
        maintenant = time.time()
        manquants = [t for t in demandes if t not in cache or _expiree(cache[t], maintenant)]
        if manquants:
            fichier_langue = LANGUES.get(langue, LANGUES["fr"])
            try:
                trouves = _telecharger_et_extraire(fichier_langue, manquants)
            except Exception:
                trouves = {}
            for t in manquants:
                if t in trouves:
                    cache[t] = {**trouves[t], "_recu": maintenant, "langue": langue if langue in LANGUES else "fr", "anglais": False}
            encore = [t for t in manquants if t not in trouves]
            if encore and fichier_langue != REPLI_ANGLAIS:
                try:
                    trouves_en = _telecharger_et_extraire(REPLI_ANGLAIS, encore)
                except Exception:
                    trouves_en = {}
                for t in encore:
                    if t in trouves_en:
                        cache[t] = {**trouves_en[t], "_recu": maintenant, "langue": "en", "anglais": True}
                encore = [t for t in encore if t not in trouves_en]
            for t in encore:
                cache[t] = {"_recu": maintenant, "_echec": True}
            _ecrire_cache(dossier_donnees, cache)
    return {t: ({k: v for k, v in cache[t].items() if not k.startswith("_")} if t in cache and not cache[t].get("_echec") else None)
            for t in demandes}

def _type_image(d):
    if d.startswith(PNG_SIG):
        return "image/png", "png"
    if d[:3] == JPEG_SIG:
        return "image/jpeg", "jpg"
    if d[:4] == RIFF_SIG and d[8:12] == WEBP_SIG:
        return "image/webp", "webp"
    return None, None

def _dimensions(d, genre):
    try:
        if genre == "image/png" and len(d) >= 24:
            return struct.unpack(">II", d[16:24])
        if genre == "image/jpeg":
            i = 2
            while i + 9 < len(d):
                if d[i] != 0xFF:
                    break
                marqueur = d[i + 1]
                if marqueur in (0xD8, 0xD9) or 0xD0 <= marqueur <= 0xD7:
                    i += 2
                    continue
                taille = struct.unpack(">H", d[i + 2:i + 4])[0]
                if marqueur in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                    hauteur, largeur = struct.unpack(">HH", d[i + 5:i + 9])
                    return largeur, hauteur
                i += 2 + taille
        elif genre == "image/webp":
            sous = d[12:16]
            if sous == b"VP8X" and len(d) >= 30:
                return 1 + int.from_bytes(d[24:27], "little"), 1 + int.from_bytes(d[27:30], "little")
            if sous == b"VP8 " and len(d) >= 30:
                l, h = struct.unpack("<HH", d[26:30])
                return l & 0x3FFF, h & 0x3FFF
            if sous == b"VP8L" and len(d) >= 25:
                n = int.from_bytes(d[21:25], "little")
                return (n & 0x3FFF) + 1, ((n >> 14) & 0x3FFF) + 1
    except struct.error:
        pass
    return None

def _telecharger_image(url):
    p = urllib.parse.urlsplit(url)
    if p.scheme != "https" or p.hostname != HOTE_IMG:
        raise Refus("hôte d'image hors liste blanche")
    _attendre()
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/jpeg, image/png, image/webp"})
    with _ouvreur(HOTE_IMG).open(req, timeout=DELAI_IMG_S) as r:
        if urllib.parse.urlsplit(r.geturl()).hostname != HOTE_IMG:
            raise Refus("réponse hors de l'hôte d'images")
        genre_annonce = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        if genre_annonce not in ("image/jpeg", "image/png", "image/webp"):
            raise Refus("type de réponse inattendu : " + genre_annonce[:40])
        annonce = r.headers.get("Content-Length")
        if annonce and int(annonce) > MAX_IMAGE:
            raise Refus("image trop grosse")
        d = r.read(MAX_IMAGE + 1)
    if len(d) > MAX_IMAGE:
        raise Refus("image trop grosse")
    genre, ext = _type_image(d)
    if not genre:
        raise Refus("image : signature inconnue (ni PNG, ni JPEG, ni WebP)")
    dims = _dimensions(d, genre)
    if not dims or not (8 <= dims[0] <= 4096 and 8 <= dims[1] <= 4096):
        raise Refus("image : dimensions invalides ou déraisonnables")
    return d, genre, ext

def _dossier_images(dossier_donnees):
    d = _dossier_cache(dossier_donnees) / "images"
    d.mkdir(parents=True, exist_ok=True)
    return d

def image_data(url, dossier_donnees):
    if not isinstance(url, str):
        return None
    p = urllib.parse.urlsplit(url)
    if p.scheme != "https" or p.hostname != HOTE_IMG:
        return None
    nom = hashlib.sha256(url.encode("utf-8")).hexdigest()
    dossier = _dossier_images(dossier_donnees)
    try:
        for f in dossier.glob(nom + ".*"):
            d = f.read_bytes()
            genre, _ = _type_image(d)
            if genre:
                return "data:%s;base64,%s" % (genre, base64.b64encode(d).decode())
    except OSError:
        pass
    try:
        d, genre, ext = _telecharger_image(url)
    except Exception:
        return None
    try:
        (dossier / (nom + "." + ext)).write_bytes(d)
    except OSError:
        pass
    return "data:%s;base64,%s" % (genre, base64.b64encode(d).decode())

def titleid_depuis_raccourci(exe, options):
    texte = " ".join(x for x in (exe, options) if isinstance(x, str))
    if not ROM_RE.search(texte):
        return None
    m = TITLEID_RE.search(texte)
    return m.group(1).upper() if m else None

def _lire_vdf_binaire(data):
    pos = 0

    def chaine():
        nonlocal pos
        fin = data.index(b"\x00", pos)
        s = data[pos:fin].decode("utf-8", "replace")
        pos = fin + 1
        return s

    def objet():
        nonlocal pos
        o = {}
        while pos < len(data):
            genre = data[pos]
            pos += 1
            if genre == 0x08:
                return o
            cle = chaine()
            if genre == 0x00:
                o[cle] = objet()
            elif genre == 0x01:
                o[cle] = chaine()
            elif genre == 0x02:
                o[cle] = int.from_bytes(data[pos:pos + 4], "little", signed=True)
                pos += 4
            else:
                raise ValueError("type VDF binaire inconnu : %d" % genre)
        return o

    return objet()

def _champ(entree, nom):
    for k, v in entree.items():
        if k.lower() == nom.lower():
            return v
    return ""

def raccourcis_utilisateur(dossier_userdata):
    f = pathlib.Path(dossier_userdata) / "config/shortcuts.vdf"
    if not f.is_file():
        return {}
    try:
        racine = _lire_vdf_binaire(f.read_bytes())
    except Exception:
        return {}
    sortie = {}
    for entree in (racine.get("shortcuts") or {}).values():
        if not isinstance(entree, dict):
            continue
        appid = _champ(entree, "appid")
        if not isinstance(appid, int) or isinstance(appid, bool):
            continue
        sortie[appid & 0xFFFFFFFF] = {"exe": _champ(entree, "exe"), "options": _champ(entree, "LaunchOptions")}
    return sortie

def titleid_pour_appid(steam_userdata_dir, appid):
    base = pathlib.Path(steam_userdata_dir)
    if not base.is_dir():
        return None
    try:
        appid = int(appid) & 0xFFFFFFFF
    except (TypeError, ValueError):
        return None
    for dossier in base.iterdir():
        infos = raccourcis_utilisateur(dossier)
        if appid in infos:
            tid = titleid_depuis_raccourci(infos[appid]["exe"], infos[appid]["options"])
            if tid:
                return tid
    return None
