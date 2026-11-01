import contextlib
import gzip
import hashlib
import html
import json
import pathlib
import re
import threading
import time
import unicodedata
import urllib.parse
import urllib.request
import urllib.error

from eshop import adresse, HOTES_IMAGES, HOTES_VIDEOS

HOTE = "store.steampowered.com"
API = "https://" + HOTE + "/api/"
API_HOTE = "api.steampowered.com"
API_CHEMINS = ("/IStoreQueryService/Query/v1/", "/IStoreBrowseService/GetItems/v1/")
UA = "SteamU/1.0 (public Steam discovery)"
MAX_JSON = 8 * 1024 * 1024
CACHE = 1800
MAX_ENTREES = 256
VERROU = threading.Lock()
RUBRIQUES = ("new_releases", "top_sellers", "coming_soon", "specials")
LANGUES = {"fr": "french", "en": "english", "es": "spanish"}
CATEGORIES = {"solo": ("joueurs", 2), "multi": ("joueurs", 1), "coop": ("joueurs", 9),
              "aventure": ("tags", 21), "rpg": ("tags", 122), "simulation": ("tags", 599)}
TAILLE_PAGE = 50
DEPART_MAX = 2147483647 - TAILLE_PAGE
DELAI_RECHERCHE = 2.0
ESSAIS_RECHERCHE = 4
PROCHAINE_RECHERCHE = 0.0
DESCRIPTEURS = (1, 2, 3, 4, 5)
PAGE_API = 1000
DELAI_API = 1.0
PROCHAINE_API = 0.0
FRAIS_CATALOGUE = 24 * 3600
REFAIRE_CATALOGUE = 30 * 24 * 3600
REESSAI_CATALOGUE = 600
POPULAIRES = 13
PAGES_POPULAIRES = 2
LOT_MAX = 3
LOT_RAPIDE = 2.0
LOT_LENT = 6.0
PUBLIER_TOUTES = 20
GARDER_TOUTES = 5
PAUSE_JEU = 30
VERSION_CATALOGUE = 1
ETATS = {}            
CATALOGUES = {}       
INDEX = {}           
VUS = {}             
VERROU_CATALOGUE = threading.Lock()

def texte(valeur, maximum=4000):
    t = re.sub(r"(?is)<(script|style)\b.*?</\1\s*>", "", str(valeur or "")[:100000])
    t = html.unescape(re.sub(r"<[^>]*>", "", re.sub(r"(?i)<(br|/?p|/?li|h2|h3)\b[^>]*>", "\n", t)))
    return re.sub(r"\n\s*\n+", "\n\n", t).strip()[:maximum].replace("—", ",").replace("·", ",")

def entier(valeur, maximum=2147483647):
    try:
        return max(0, min(maximum, int(valeur)))
    except (ValueError, TypeError, OverflowError):
        return 0

def image(valeur):
    return valeur if isinstance(valeur, str) and len(valeur) <= 2048 and adresse(valeur, HOTES_IMAGES) else ""

def apercu(p):
    return {"id": entier(p.get("id") or p.get("steam_appid")), "nom": texte(p.get("name"), 200),
            "image": image(p.get("header_image") or p.get("large_capsule_image") or p.get("tiny_image"))}

def normaliser_vitrine(brut):
    if not isinstance(brut, dict):
        raise ValueError("vitrine invalide")
    vitrine = {}
    for k in RUBRIQUES:
        rubrique = {}
        for p in brut.get(k, {}).get("items", [])[:60]:
            if isinstance(p, dict) and entier(p.get("id")) and p.get("type", 0) == 0:
                rubrique.setdefault(entier(p.get("id")), apercu(p))
        vitrine[k] = list(rubrique.values())
    return vitrine

def normaliser_categorie(brut, start=0):
    if not isinstance(brut, dict) or not isinstance(brut.get("items"), list):
        raise ValueError("catégorie invalide")
    items = brut["items"][:TAILLE_PAGE]
    jeux = {}
    for p in items:
        if not isinstance(p, dict):
            continue
        url = image(p.get("logo"))
        identifiant = re.search(r"/apps/([1-9][0-9]*)/", urllib.parse.urlsplit(url).path)
        if not identifiant:
            continue
        appid = entier(identifiant[1])
        if str(appid) != identifiant[1]:
            continue
        nom = texte(p.get("name"), 200)
        jeux[appid] = {"id": appid, "nom": nom,
                       "cle": nom, "image": url}
    return {"jeux": list(jeux.values()), "suivant": start + len(items) if items and start + len(items) <= DEPART_MAX else None,
            "total": entier(brut["total_count"]) if brut.get("total_count") is not None else None,
            "noms": [texte(p.get("name"), 200) if isinstance(p, dict) else "" for p in items]}

def tableau(valeur):
    return valeur if isinstance(valeur, list) else []

def objet(valeur):
    return valeur if isinstance(valeur, dict) else {}

def video(m):
    h264 = 'video/mp4; codecs="avc1.42E01E"'
    sources = []
    for format_, mime, codec, extension in (
            ("dash_av1", "application/dash+xml", 'video/mp4; codecs="av01.0.05M.08"', ".mpd"),
            ("webm", "video/webm", 'video/webm; codecs="vp8"', ".webm"),
            ("mp4", "video/mp4", h264, ".mp4"),
            ("dash_h264", "application/dash+xml", h264, ".mpd"),
            ("hls_h264", "application/vnd.apple.mpegurl", h264, ".m3u8")):
        for taille in ("480", "max") if format_ in ("webm", "mp4") else (None,):
            url = objet(m.get(format_)).get(taille) if taille else m.get(format_)
            url = url if isinstance(url, str) and len(url) <= 2048 and adresse(url, HOTES_VIDEOS) else ""
            if url and urllib.parse.urlsplit(url).path.endswith(extension):
                sources.append({"url": url, "type": mime, "codec": codec})
                break
    return {"grande": sources[0]["url"], "petite": image(m.get("thumbnail")), "nom": texte(m.get("name"), 200),
            "sources": sources, "hotes": sorted(HOTES_VIDEOS)} if sources else None

def normaliser_fiche(brut, appid):
    enveloppe = objet(objet(brut).get(str(appid)))
    p = objet(enveloppe.get("data")) if enveloppe.get("success") is True else {}
    if not p:
        return {}
    if p.get("type") and p["type"] not in ("game", "dlc", "demo", "mod", "hardware"):
        return {"exclu": True}
    if not p.get("type") or entier(p.get("steam_appid")) != appid:
        return {}
    prix = objet(p.get("price_overview"))
    return {**apercu(p), "materiel": p["type"] == "hardware", "description": texte(p.get("short_description")),
            "detail": texte(p.get("detailed_description"), 24000),
            "captures": [{"petite": image(s.get("path_thumbnail")), "grande": image(s.get("path_full"))}
                         for s in tableau(p.get("screenshots"))[:12] if isinstance(s, dict) and image(s.get("path_full"))],
            "videos": [v for m in tableau(p.get("movies"))[:12] if isinstance(m, dict) and (v := video(m))],
            "genres": [{"id": str(entier(g.get("id"))), "nom": texte(g.get("description"), 100)}
                       for g in tableau(p.get("genres"))[:20] if isinstance(g, dict)],
            "modes": [{"id": str(entier(g.get("id"))), "nom": texte(g.get("description"), 100)}
                      for g in tableau(p.get("categories"))[:40] if isinstance(g, dict)],
            "date": texte(objet(p.get("release_date")).get("date"), 100),
            "bientot": bool(objet(p.get("release_date")).get("coming_soon")),
            "developpeurs": [texte(n, 160) for n in tableau(p.get("developers"))[:10]],
            "editeurs": [texte(n, 160) for n in tableau(p.get("publishers"))[:10]],
            "note": entier(objet(p.get("metacritic")).get("score"), 100),
            "avis": entier(objet(p.get("recommendations")).get("total")), "gratuit": p.get("is_free") is True or prix.get("final") == 0,   
            "prix": {"actuel": texte(prix.get("final_formatted"), 100),
                     "avant": texte(prix.get("initial_formatted"), 100),
                     "reduction": entier(prix.get("discount_percent"), 100)}}

class Redirections(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not adresse(newurl, {HOTE, API_HOTE}):
            raise ValueError("redirection hors Steam")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def _lire_url(url):
    from infinimii import _contexte
    chemin = urllib.parse.urlsplit(url).path
    boutique = adresse(url, {HOTE}) and (chemin.startswith("/api/") or chemin == "/search/results/")
    if not boutique and not (adresse(url, {API_HOTE}) and chemin in API_CHEMINS):
        raise ValueError("adresse hors API Steam")
    ouvre = urllib.request.build_opener(Redirections(), urllib.request.HTTPSHandler(context=_contexte()))
    with ouvre.open(urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"}), timeout=10) as r:
        b = r.read(MAX_JSON + 1)
    if len(b) > MAX_JSON:
        raise ValueError("réponse Steam trop grande")
    return json.loads(b)

def _demander(url):
    global PROCHAINE_RECHERCHE
    recherche = urllib.parse.urlsplit(url).path == "/search/results/"
    for essai in range(ESSAIS_RECHERCHE if recherche else 1):
        if recherche:
            attente = PROCHAINE_RECHERCHE - time.monotonic()
            if attente > 0:
                time.sleep(attente)
            PROCHAINE_RECHERCHE = time.monotonic() + DELAI_RECHERCHE
        try:
            brut = _lire_url(url)
            if brut is not None:
                return brut
        except urllib.error.HTTPError as erreur:
            if not recherche or erreur.code != 429:
                raise
        if not recherche or essai == ESSAIS_RECHERCHE - 1:
            raise ValueError("réponse Steam refusée ou nulle")
        PROCHAINE_RECHERCHE = time.monotonic() + DELAI_RECHERCHE * 2 ** essai

def lire(cache, action, pays, langue, appid=0, terme="", start=0):
    resultat = _lire(cache, action, pays, langue, appid, terme, start)
    if action == "vitrine":
        try:
            a_venir = _lire(cache, "a_venir", pays, langue)["donnees"]
            if a_venir:
                entetes = images(cache, str(pays).lower(), langue, ",".join(str(p["id"]) for p in a_venir))
                resultat["donnees"]["coming_soon"] = [{**p, "image": entetes.get(str(p["id"])) or p["image"]} for p in a_venir]
        except Exception:
            pass
    if action == "fiche" and langue != "en" and resultat["donnees"].get("id"):
        try:
            anglais = _lire(cache, action, pays, "en", appid)["donnees"]
        except Exception:
            anglais = {}
        d = resultat["donnees"]
        for champ, drapeau in (("description", "description_anglaise"), ("detail", "detail_anglais")):
            d[drapeau] = bool(d.get(champ) and d[champ] == anglais.get(champ))
    return resultat

def fichier_cache(cache, cle):
    dossier = pathlib.Path(cache) / "eshop-jeux"
    dossier.mkdir(parents=True, exist_ok=True)
    return dossier / (hashlib.sha256(cle.encode()).hexdigest() + ".json")

def lire_cache(fichier):
    try:
        if fichier.stat().st_size <= MAX_JSON:
            return json.loads(fichier.read_text())
    except (OSError, ValueError, TypeError):
        pass
    return None

def ecrire_json(fichier, brut):
    temporaire = fichier.with_suffix(".tmp")
    temporaire.write_text(json.dumps(brut), encoding="utf-8")
    temporaire.replace(fichier)

def ecrire_cache(fichier, brut):
    ecrire_json(fichier, brut)
    for f in sorted(fichier.parent.glob("*.json"), key=lambda f: f.stat().st_mtime, reverse=True)[MAX_ENTREES:]:
        f.unlink(missing_ok=True)

def _lire(cache, action, pays, langue, appid=0, terme="", start=0):
    pays = str(pays).lower()
    if not re.fullmatch(r"[a-z]{2}", pays) or langue not in LANGUES:
        raise ValueError("région ou langue indisponible")
    if action == "catalogue":
        return catalogue(cache, pays, langue, terme)
    if action == "images":
        return {"donnees": images(cache, pays, langue, terme), "ancien": False}
    parametres = {"cc": pays, "l": LANGUES[langue]}
    base = API
    if action == "vitrine":
        chemin, normaliser = "featuredcategories", lambda b: marquer(cache, pays, langue, normaliser_vitrine(b))
    elif action == "recherche":
        parametres["term"] = str(terme).strip()[:80]
        if not parametres["term"]:
            return {"donnees": [], "ancien": False}
        parametres.update({"json": 1, "category1": 998, "count": TAILLE_PAGE})
        base, chemin, normaliser = "https://" + HOTE, "/search/results/", lambda b: marquer(cache, pays, langue, {"r": normaliser_categorie(b)["jeux"]})["r"]
    elif action == "a_venir":
        parametres.update({"filter": "popularcomingsoon", "json": 1, "category1": 998, "count": TAILLE_PAGE})
        base, chemin, normaliser = "https://" + HOTE, "/search/results/", lambda b: marquer(cache, pays, langue, {"r": normaliser_categorie(b)["jeux"]})["r"]
    elif action == "fiche":
        appid = entier(appid)
        if not appid:
            raise ValueError("jeu invalide")
        parametres["appids"] = appid
        chemin, normaliser = "appdetails", lambda b: normaliser_fiche(b, appid)
    else:
        raise ValueError("action inconnue")
    url = base + chemin + "?" + urllib.parse.urlencode(parametres)
    fichier = fichier_cache(cache, url)
    with VERROU:
        ancien = lire_cache(fichier)
        try:
            if ancien is not None and time.time() - fichier.stat().st_mtime < CACHE:
                return {"donnees": normaliser(ancien), "ancien": False}
        except (OSError, ValueError, TypeError):
            pass
    try:
        with VERROU if chemin == "/search/results/" else contextlib.nullcontext():
            brut = _demander(url)
        resultat = normaliser(brut)
        with VERROU:
            ecrire_cache(fichier, brut)
        return {"donnees": resultat, "ancien": False}
    except Exception:
        if ancien is not None:
            return {"donnees": normaliser(ancien), "ancien": True}
        raise

def _api(chemin, corps, espacer=True):
    global PROCHAINE_API
    url = "https://" + API_HOTE + chemin + "?" + urllib.parse.urlencode({"input_json": json.dumps(corps)})
    for essai in range(ESSAIS_RECHERCHE):
        attente = PROCHAINE_API - time.monotonic()
        if attente > 0 and (espacer or essai):
            time.sleep(attente)
        if espacer or essai:
            PROCHAINE_API = time.monotonic() + DELAI_API
        try:
            brut = _lire_url(url)
            break
        except urllib.error.HTTPError as erreur:
            if erreur.code != 429 and erreur.code < 500 or essai == ESSAIS_RECHERCHE - 1:
                raise
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if essai == ESSAIS_RECHERCHE - 1:
                raise
        PROCHAINE_API = time.monotonic() + DELAI_API * 2 ** (essai + 1)
    if not isinstance(objet(brut).get("response"), dict):
        raise ValueError("réponse Steam invalide")
    return brut["response"]

def _contexte(pays, langue):
    return {"language": LANGUES[langue], "country_code": pays.upper()}

def _requete(pays, langue, start, filtres=None, fiches=True, tri=2, espacer=True):
    corps = {"query": {"start": start, "count": PAGE_API, "sort": tri,
                       "filters": {"released_only": False, "type_filters": {"include_games": True}, **(filtres or {})}},
             "context": _contexte(pays, langue)}
    if fiches:
        corps["data_request"] = {"include_basic_info": False}
    r = _api(API_CHEMINS[0], corps, espacer)
    total = entier(objet(r.get("metadata")).get("total_matching_records"))
    return total, tableau(r.get("store_items")) if fiches else [entier(objet(i).get("appid")) for i in tableau(r.get("ids"))]

def _tous(pays, langue, filtres=None, fiches=True, suivre=lambda fait, total: None):
    tout, start, total = [], 0, None
    while total is None or start < total:
        total, page = _requete(pays, langue, start, filtres, fiches)
        if not page:
            break
        tout += page
        start += len(page)
        suivre(start, total)
    return tout

def _jeu(item, tags=()):
    item = objet(item)
    appid, nom = entier(item.get("appid")), texte(item.get("name"), 200).replace("\t", " ").replace("\n", " ")
    if not appid or not nom or item.get("success") != 1 or item.get("visible") is False or entier(item.get("type")) != 0:
        return None
    desc = sum(1 << (d - 1) for d in {entier(x) for x in tableau(item.get("content_descriptorids"))} if d in DESCRIPTEURS)
    joueurs = {entier(x) for x in tableau(objet(item.get("categories")).get("supported_player_categoryids"))}
    tags = set(tags) | {entier(x) for x in tableau(item.get("tagids"))}
    cats = sum(1 << i for i, (sorte, ident) in enumerate(CATEGORIES.values()) if ident in (joueurs if sorte == "joueurs" else tags))
    return [appid, nom, desc, cats]

def cle_tri(nom):
    return "".join(c for c in unicodedata.normalize("NFD", nom) if not unicodedata.combining(c)).casefold()

def lettre(nom):
    c = unicodedata.normalize("NFD", nom)[:1].upper()
    return c if "A" <= c <= "Z" else "#"

def fichier_catalogue(cache, pays, langue):
    dossier = pathlib.Path(cache) / "eshop-jeux"
    dossier.mkdir(parents=True, exist_ok=True)
    return dossier / f"catalogue-{pays}-{langue}.json.gz"

def lire_catalogue(cache, pays, langue):
    cle = (pays, langue)
    if cle not in CATALOGUES:
        try:
            with gzip.open(fichier_catalogue(cache, pays, langue), "rt", encoding="utf-8") as f:
                c = json.load(f)
            CATALOGUES[cle] = c if objet(c).get("v") == VERSION_CATALOGUE and isinstance(c.get("jeux"), list) else None
        except (OSError, ValueError, EOFError):
            CATALOGUES[cle] = None
    return CATALOGUES[cle]

def ecrire_catalogue(cache, pays, langue, c):
    c["jeux"].sort(key=lambda j: (lettre(j[1]) != "#", cle_tri(j[1]), j[0]))   
    fichier = fichier_catalogue(cache, pays, langue)
    temporaire = fichier.with_suffix(".tmp")
    with gzip.open(temporaire, "wt", encoding="utf-8", compresslevel=6) as f:
        json.dump(c, f, ensure_ascii=False, separators=(",", ":"))
    temporaire.replace(fichier)
    CATALOGUES[(pays, langue)] = c

def _part(suivre, debut, part):
    return lambda fait, total: suivre(round(debut + part * fait / max(1, total)), 100)

def _genres(pays, langue, suivre, debut, part):
    tags = [ident for sorte, ident in CATEGORIES.values() if sorte == "tags"]
    return {ident: set(_tous(pays, langue, {"tagids_must_match": [{"tagids": [ident]}]}, False, _part(suivre, debut + i * part / len(tags), part / len(tags))))
            for i, ident in enumerate(tags)}

def fichier_partiel(cache, pays, langue):
    return fichier_catalogue(cache, pays, langue).with_name(f"partiel-{pays}-{langue}.json.gz")

def jeu_en_cours():
    for p in pathlib.Path("/proc").iterdir():
        try:
            if p.name.isdigit() and b"SteamLaunch" in (p / "cmdline").read_bytes():
                return True
        except OSError:
            pass
    return False

def _par_lots(starts, faire, suivre=lambda fait, total: None, apres=lambda: None):
    import concurrent.futures
    restants, n, faits, refus = list(starts), 1, 0, 0
    with concurrent.futures.ThreadPoolExecutor(LOT_MAX) as ex:
        while restants:
            while jeu_en_cours():
                time.sleep(PAUSE_JEU)
            lot, t0 = restants[:n], time.monotonic()
            try:
                list(ex.map(faire, lot))
            except Exception:
                refus += 1
                if refus > ESSAIS_RECHERCHE:
                    raise
                n = 1
                time.sleep(DELAI_API * 2 ** refus)
                continue
            refus, duree = 0, time.monotonic() - t0
            del restants[:len(lot)]
            faits += len(lot)
            suivre(faits, faits + len(restants))
            apres()
            n = min(LOT_MAX, n + 1) if duree < LOT_RAPIDE else max(1, n - 1) if duree > LOT_LENT else n
            if duree < DELAI_API:
                time.sleep(DELAI_API - duree)

def construire(cache, pays, langue, suivre=lambda fait, total: None):
    f = fichier_partiel(cache, pays, langue)
    try:
        with gzip.open(f, "rt", encoding="utf-8") as x:
            p = json.load(x)
        p["jeux"] = {int(a): j for a, j in p["jeux"].items()}
    except (OSError, ValueError, EOFError, AttributeError):
        p = None
    tags = [ident for sorte, ident in CATEGORIES.values() if sorte == "tags"]
    verrou = threading.Lock()

    def garder():
        with verrou:
            contenu = json.dumps({**p, "jeux": {str(a): j for a, j in p["jeux"].items()}}, ensure_ascii=False, separators=(",", ":"))
        tmp = f.with_suffix(".tmp")
        with gzip.open(tmp, "wt", encoding="utf-8", compresslevel=3) as x:
            x.write(contenu)
        tmp.replace(f)

    def publier(partiel=True):
        genres = {t: set(p["genres"].get(str(t), [])) for t in tags}
        with verrou:
            jeux = [list(j) for j in p["jeux"].values()]
        for j in jeux:
            j[3] |= sum(1 << i for i, (sorte, ident) in enumerate(CATEGORIES.values()) if sorte == "tags" and j[0] in genres[ident])
        maintenant = time.time()
        ecrire_catalogue(cache, pays, langue, {"v": VERSION_CATALOGUE, "maj": maintenant, "complet": 0 if partiel else maintenant,
                                               "partiel": partiel, "jeux": jeux})

    def ajouter(items):
        with verrou:
            for j in map(_jeu, items):
                if j:
                    p["jeux"][j[0]] = j

    if not p:
        p = {"jeux": {}, "faites": [], "genres": {}, "total": 0, "etape": 1}
        for start in range(0, PAGES_POPULAIRES * PAGE_API, PAGE_API):
            ajouter(_requete(pays, langue, start, tri=POPULAIRES)[1])
        for t in tags:
            p["genres"][str(t)] = _requete(pays, langue, 0, {"tagids_must_match": [{"tagids": [t]}]}, False, POPULAIRES)[1]
        p["total"] = _requete(pays, langue, 0, fiches=False)[0]
        garder()
        publier()
        suivre(5, 100)

    if p["etape"] == 1:
        compte = [0]

        def page(start):
            ajouter(_requete(pays, langue, start, espacer=False)[1])
            with verrou:
                p["faites"].append(start)

        def apres():
            compte[0] += 1
            if compte[0] % GARDER_TOUTES == 0:   
                garder()
            if compte[0] % PUBLIER_TOUTES == 0:
                publier()
        faites = set(p["faites"])
        _par_lots([s for s in range(0, p["total"] + PAGE_API, PAGE_API) if s not in faites], page, _part(suivre, 5, 75), apres)
        p["etape"] = 2
        garder()
        publier()

    for i, t in enumerate(tags):
        ids = set()

        def page(start, t=t):
            ids.update(_requete(pays, langue, start, {"tagids_must_match": [{"tagids": [t]}]}, False, espacer=False)[1])
        total = _requete(pays, langue, 0, {"tagids_must_match": [{"tagids": [t]}]}, False)[0]
        _par_lots(range(0, total + PAGE_API, PAGE_API), page, _part(suivre, 80 + i * 20 / len(tags), 20 / len(tags)))
        p["genres"][str(t)] = list(ids)
    publier(partiel=False)
    f.unlink(missing_ok=True)

def mettre_a_jour(cache, pays, langue, suivre=lambda fait, total: None):
    c = lire_catalogue(cache, pays, langue)
    if not c or c.get("partiel") or time.time() - c.get("complet", 0) > REFAIRE_CATALOGUE:
        return construire(cache, pays, langue, suivre)
    ids = set(_tous(pays, langue, fiches=False, suivre=_part(suivre, 0, 55)))
    if not ids:
        raise ValueError("liste des jeux vide")
    jeux = [j for j in c["jeux"] if j[0] in ids]
    connus = {j[0] for j in jeux}
    nouveaux = sorted(ids - connus)
    for i in range(0, len(nouveaux), 200):
        r = _api(API_CHEMINS[1], {"ids": [{"appid": a} for a in nouveaux[i:i + 200]], "context": _contexte(pays, langue),
                                  "data_request": {"include_tag_count": 20}})
        jeux += [j for j in map(_jeu, tableau(r.get("store_items"))) if j]
    genres = _genres(pays, langue, suivre, 60, 40)
    tags = [(i, ident) for i, (sorte, ident) in enumerate(CATEGORIES.values()) if sorte == "tags"]
    for j in jeux:
        for i, ident in tags:
            j[3] = j[3] | (1 << i) if j[0] in genres[ident] else j[3] & ~(1 << i)
    ecrire_catalogue(cache, pays, langue, {**c, "maj": time.time(), "jeux": jeux})

def lancer(f, *args):
    threading.Thread(target=f, args=args, daemon=True).start()

def _travail(cache, pays, langue):
    etat = ETATS[(pays, langue)]
    try:
        mettre_a_jour(cache, pays, langue, lambda fait, total: etat.update(fait=fait, total=total))
        etat.update(etat="pret")
    except Exception:
        etat.update(etat="erreur", depuis=time.time())

def catalogue(cache, pays, langue, version=""):
    cle = (pays, langue)
    with VERROU_CATALOGUE:
        c = lire_catalogue(cache, pays, langue)
        etat = ETATS.setdefault(cle, {"etat": "pret" if c else "absent", "fait": 0, "total": 0, "depuis": 0})
        perime = not c or c.get("partiel") or time.time() - c.get("maj", 0) > FRAIS_CATALOGUE
        if perime and etat["etat"] != "construction" and not (etat["etat"] == "erreur" and time.time() - etat["depuis"] < REESSAI_CATALOGUE):
            etat.update(etat="construction", fait=0, total=0)
            lancer(_travail, cache, pays, langue)
    reponse = {"etat": etat["etat"], "fait": etat["fait"], "total": etat["total"], "partiel": bool(c and c.get("partiel"))}
    if c:
        reponse["version"] = f"{int(c['maj'])}-{len(c['jeux'])}"
        if reponse["version"] != version:
            reponse["jeux"] = "\n".join(f"{a}\t{lettre(n)}\t{n}\t{d}\t{k}" for a, n, d, k in c["jeux"])
    return {"donnees": reponse, "ancien": False}

def marquer(cache, pays, langue, listes):
    c = lire_catalogue(cache, pays, langue) or {"jeux": []}
    if INDEX.get((pays, langue), (None,))[0] is not c:
        INDEX[(pays, langue)] = (c, {j[0]: j[2] for j in c["jeux"]})
    connus = INDEX[(pays, langue)][1]
    jeux = [p for l in listes.values() for p in l]
    inconnus = sorted({p["id"] for p in jeux if p["id"] not in connus and p["id"] not in VUS})
    for i in range(0, len(inconnus), 200):
        try:
            r = _api(API_CHEMINS[1], {"ids": [{"appid": a} for a in inconnus[i:i + 200]], "context": _contexte(pays, langue)})
            for item in tableau(r.get("store_items")):
                item = objet(item)
                VUS[entier(item.get("appid"))] = sum(1 << (d - 1) for d in {entier(x) for x in tableau(item.get("content_descriptorids"))} if d in DESCRIPTEURS)
        except Exception:
            break   
    for p in jeux:
        d = connus.get(p["id"], VUS.get(p["id"]))
        if d is not None:
            p["d"] = d
    return listes

def images(cache, pays, langue, ids):
    ids = [a for a in (entier(x) for x in str(ids).split(",")[:60]) if a]
    fichier = pathlib.Path(cache) / "eshop-jeux" / "images" / f"{pays}.json"   
    with VERROU_CATALOGUE:
        garde = objet(lire_cache(fichier)) if fichier.exists() else {}
    manque = [a for a in ids if str(a) not in garde]
    if manque:
        r = _api(API_CHEMINS[1], {"ids": [{"appid": a} for a in manque], "context": _contexte(pays, langue), "data_request": {"include_assets": True}})
        for item in tableau(r.get("store_items")):
            a, assets = objet(item).get("appid"), objet(objet(item).get("assets"))
            url = str(assets.get("asset_url_format", "")).replace("${FILENAME}", str(assets.get("header", ""))) if assets.get("header") else ""
            garde[str(entier(a))] = image("https://shared.steamstatic.com/store_item_assets/" + url) if url else ""
        with VERROU_CATALOGUE:
            fichier.parent.mkdir(parents=True, exist_ok=True)
            ecrire_json(fichier, dict(list(garde.items())[-20000:]))
    return {str(a): garde.get(str(a), "") for a in ids}
