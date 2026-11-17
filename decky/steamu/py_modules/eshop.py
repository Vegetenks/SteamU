import base64
import json
import pathlib
import re
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

import spotpass

STORE = "https://plugins.deckbrew.xyz/plugins"
MAX_JSON = 16 * 1024 * 1024
UA = "SteamU/1.0 (personal Steam theme; eShop, public Decky plugin catalogues)"
CACHE = 1800
VERROU = threading.Lock()
CATALOGUES = {"plugins.deckbrew.xyz"}
ARCHIVES_STORE = "https://cdn.tzatzikiweeb.moe/file/steam-deck-homebrew/versions/"
DEPOT_DECKYHUB = "https://raw.githubusercontent.com/mazillka/deckyhub-registry/"
DECKYHUB = {"apps": ("https://github.com/mazillka/deckyhub-registry/releases/latest/download/apps.json", DEPOT_DECKYHUB + "main/registry/apps.json"),
            "releases": (DEPOT_DECKYHUB + "release-index/releases.json",), "stats": (DEPOT_DECKYHUB + "release-index/stats.json",),
            "scans": (DEPOT_DECKYHUB + "virus-scans/scans.json",)}
HOTES_DECKYHUB = {"github.com", "release-assets.githubusercontent.com", "objects.githubusercontent.com", "raw.githubusercontent.com"}
SOURCES = spotpass.BASE + "/eshop-sources"
CLE_SOURCES = bytes.fromhex("a1de12f5bbf334150ac663141bb34714376a810183b16f0a6a8be56906a1e064")   
AVERTISSEMENTS = {"blocked", "private-data"}

def adresse(valeur, domaines=None):
    try:
        p = urllib.parse.urlsplit(str(valeur or ""))
        return p.scheme == "https" and bool(p.hostname) and p.port in (None, 443) and not p.username and not p.password and (domaines is None or p.hostname in domaines)
    except ValueError:
        return False

class Redirections(urllib.request.HTTPRedirectHandler):
    def __init__(self, hotes=CATALOGUES):
        self.hotes = hotes

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not adresse(newurl, self.hotes):
            raise ValueError("redirection hors catalogue")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def _lire_url(url, hotes=CATALOGUES):
    from infinimii import _contexte
    ouvre = urllib.request.build_opener(Redirections(hotes), urllib.request.HTTPSHandler(context=_contexte()))
    with ouvre.open(urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"}), timeout=10) as r:
        donnees = r.read(MAX_JSON + 1)
    if len(donnees) > MAX_JSON:
        raise ValueError("catalogue trop grand")
    return json.loads(donnees)

def _texte(v, maximum=4000):
    return str(v or "")[:maximum]

def normaliser(donnees):
    if isinstance(donnees, dict):
        donnees = donnees.get("plugins", [])
    if not isinstance(donnees, list):
        raise ValueError("catalogue invalide")
    resultat, vus = [], set()
    for p in donnees[:3000]:
        if not isinstance(p, dict):
            continue
        nom = _texte(p.get("name") or p.get("nom"), 160)
        if not nom or nom in vus:
            continue
        vus.add(nom)
        versions = []
        for v in (p.get("versions") or [])[:100]:
            if not isinstance(v, dict):
                continue
            url = v.get("artifact") or v.get("download_url") or v.get("url") or ""
            if url:
                url = urllib.parse.urljoin(STORE, url)
            elif re.fullmatch(r"[0-9a-f]{64}", str(v.get("hash") or "")):
                url = ARCHIVES_STORE + v["hash"] + ".zip"
            versions.append({"version": _texte(v.get("name") or v.get("version"), 80),
                             "url": url if adresse(url) else "", "sha256": _texte(v.get("hash") or v.get("sha256"), 64),
                             "date": _texte(v.get("created") or v.get("date"), 80)})
        recent = (p.get("versions") or [{}])[0]
        image = p.get("image_url") or p.get("image") or (recent.get("image_url") if isinstance(recent, dict) else "") or ""
        resultat.append({"nom": nom, "auteur": _texte(p.get("author") or p.get("authors"), 400),
                         "description": _texte(p.get("description") or (recent.get("description") if isinstance(recent, dict) else "")), "image": image if adresse(image) else "",
                         "tags": [_texte(t, 80) for t in (p.get("tags") or [])[:30]],
                         "licence": _texte(p.get("license"), 100), "source": _texte(p.get("source") or p.get("repository"), 400),
                         "root": "root" in (p.get("flags") or []) or "root" in (p.get("tags") or []) or p.get("root") is True,
                         "versions": versions, "origine": "verifie"})
    return resultat

def _allege(nom, d):
    if nom == "apps":
        if d["schemaVersion"] != 1:   
            raise ValueError("format DeckyHub inconnu")
        return [a for a in d["apps"] if isinstance(a, dict)]
    if nom == "releases":
        return {depot: [{k: r.get(k) for k in ("tag_name", "prerelease", "draft", "published_at", "assets", "pluginVersion")} for r in rs if isinstance(r, dict)]
                for depot, rs in d["releases"].items() if isinstance(rs, list)}
    if nom == "stats":
        return {depot: s for depot, s in d["plugins"].items() if isinstance(s, dict)}
    return {url: {"sha256": v.get("sha256"), "clamav": v.get("result"), "yara": v["yara"].get("result") if isinstance(v.get("yara"), dict) else None}
            for url, v in d["files"].items() if isinstance(v, dict)}

def _lire_deckyhub(nom, urls):
    for url in urls[:-1]:
        try:
            return _allege(nom, _lire_url(url, HOTES_DECKYHUB))
        except Exception:
            pass   
    return _allege(nom, _lire_url(urls[-1], HOTES_DECKYHUB))

message_sources = spotpass.message_signe(b"SteamU eshop-sources v1\n")

def _date(fichier):
    try:
        return json.loads(fichier.read_text())["date"]
    except (OSError, ValueError, KeyError, TypeError):
        return 0

def _verifier_sources(f, fichier):
    if not (isinstance(f["date"], int) and f["date"] >= _date(fichier)
            and spotpass.verifier(CLE_SOURCES, message_sources(f["date"], f["donnees"]), base64.b64decode(f["signature"], validate=True))):
        raise ValueError("adresses refusées")

def _adresses(sources):
    d = sources.get("donnees") if isinstance(sources, dict) and isinstance(sources.get("donnees"), dict) else {}
    hub = d.get("deckyhub") if isinstance(d.get("deckyhub"), dict) else {}
    bonnes = lambda urls: isinstance(urls, list) and urls and all(adresse(u, HOTES_DECKYHUB) for u in urls)
    return (d["store"] if adresse(d.get("store"), CATALOGUES) else STORE,
            {nom: tuple(hub[nom]) if bonnes(hub.get(nom)) else urls for nom, urls in DECKYHUB.items()})

def _archive_deckyhub(app, sortie):
    filtre = app.get("asset") if isinstance(app.get("asset"), dict) else {}
    avec, sans = [str(w).lower() for w in filtre.get("include") or []], [str(w).lower() for w in filtre.get("exclude") or []]
    for a in sortie.get("assets") or []:
        n = str(a.get("name") or "").lower() if isinstance(a, dict) else ""
        if n.endswith(".zip") and not any(w in n for w in sans) and all(w in n for w in avec):
            return a
    return None

def deckyhub(d):
    sorties, stats, scans = d.get("releases") or {}, d.get("stats") or {}, d.get("scans") or {}
    resultat = []
    for app in (d.get("apps") or [])[:3000]:
        try:
            resultat += _greffon_deckyhub(app, sorties, stats, scans)
        except (AttributeError, TypeError, ValueError):
            continue
    return resultat

def _greffon_deckyhub(app, sorties, stats, scans):
    depot = _texte(app.get("repo"), 200).lower()
    noms = [_texte(n, 160) for n in ((app.get("detect") or {}).get("names") or []) if n][:10]
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", depot) or not noms:
        return []
    etiquette = str(app.get("releaseTagInclude") or "").lower()
    versions = []
    for r in sorties.get(depot) or []:
        a = _archive_deckyhub(app, r) if isinstance(r, dict) and not r.get("prerelease") and not r.get("draft") and etiquette in str(r.get("tag_name") or r.get("name") or "").lower() else None
        url = str(a.get("browser_download_url") or "") if a else ""
        if not (adresse(url, {"github.com"}) and urllib.parse.urlsplit(url).path.lower().startswith("/" + depot + "/releases/download/")):
            continue
        h, scan = str(a.get("digest") or ""), scans.get(url) if isinstance(scans.get(url), dict) else {}
        sha = h[7:] if re.fullmatch(r"sha256:[0-9a-f]{64}", h) else str(scan.get("sha256") or "") if re.fullmatch(r"[0-9a-f]{64}", str(scan.get("sha256") or "")) else ""
        analyse = "attente" if not sha or scan.get("sha256") != sha else "menace" if "infected" in (scan.get("clamav"), scan.get("yara")) else "propre" if scan.get("clamav") == scan.get("yara") == "clean" else "attente"
        versions.append({"version": _texte(r.get("pluginVersion") if not versions and r.get("pluginVersion") else str(r.get("tag_name") or "").lstrip("vV"), 80),
                         "url": url, "sha256": sha, "date": _texte(r.get("published_at"), 80), "analyse": analyse})
    s = stats.get(depot) if isinstance(stats.get(depot), dict) else {}
    avertissements = sorted(AVERTISSEMENTS & {w for w in s.get("warnings") or [] if isinstance(w, str)})
    if not versions:
        return []
    exclu = versions[0]["analyse"] == "menace" or "blocked" in avertissements
    return [{"nom": noms[0], "noms": noms[1:], "auteur": depot.split("/")[0], "description": _texte(app.get("description")),
             "image": "https://github.com/" + _texte(app.get("repo"), 200), "tags": [_texte(app["category"], 80)] if app.get("category") else [], "licence": "", "source": "https://github.com/" + _texte(app.get("repo"), 200),
             "root": s.get("root") is True, "versions": [] if exclu else versions[:5], "exclu": exclu, "origine": "deckyhub",
             "analyse": versions[0]["analyse"], "avertissements": avertissements,
             "ia": bool(s.get("ai")), "fork": _texte(s.get("fork"), 200),
             "telechargements": s.get("downloads") if isinstance(s.get("downloads"), int) else 0,
             "etoiles": s.get("stars") if isinstance(s.get("stars"), int) else 0}]

def _ecrire(fichier, donnees):
    temporaire = fichier.with_suffix(".tmp")
    temporaire.write_text(json.dumps(donnees))
    temporaire.replace(fichier)

def _telecharger(fichier, lire, valider):
    brut = lire()
    valider(brut)   
    _ecrire(fichier, brut)
    return brut

def _rafraichir(fichier, lire, valider):
    try:
        with VERROU:
            _telecharger(fichier, lire, valider)
    except Exception:
        pass   
    finally:
        EN_COURS.discard(fichier.name)

EN_COURS = set()

def catalogues(cache):
    dossier = pathlib.Path(cache) / "eshop"
    dossier.mkdir(parents=True, exist_ok=True)
    for ancien in ("explorer.json", "archives.json", "deckyhub.json"):
        (dossier / ancien).unlink(missing_ok=True)
    erreurs = []

    def garde(nom, lire, valider, vide, attendre=True):
        fichier = dossier / (nom + ".json")

        def relire():
            if fichier.name not in EN_COURS:
                EN_COURS.add(fichier.name)
                threading.Thread(target=_rafraichir, args=(fichier, lire, valider), daemon=True).start()
        try:
            if fichier.stat().st_size <= MAX_JSON:
                ancien = json.loads(fichier.read_text())
                if time.time() - fichier.stat().st_mtime >= CACHE:
                    relire()
                return ancien
        except (OSError, ValueError):
            pass
        if not attendre:   
            relire()
            return vide
        try:
            return _telecharger(fichier, lire, valider)
        except Exception:
            erreurs.append(nom)
            return vide
    fichier_sources = dossier / "sources.json"
    url_store, urls_hub = _adresses(garde("sources", lambda: _lire_url(SOURCES, {spotpass.HOTE}),
                                          lambda d: _verifier_sources(d, fichier_sources), {}, attendre=False))
    with VERROU:
        store = normaliser(garde("store", lambda: _lire_url(url_store), normaliser, []))
        hub = deckyhub({nom: garde("deckyhub-" + nom, lambda nom=nom: _lire_deckyhub(nom, urls_hub[nom]), lambda d: d, [] if nom == "apps" else {})
                        for nom in DECKYHUB})
    return {"store": store, "deckyhub": hub, "erreurs": erreurs}

def installes(dossier):
    resultat = []
    for d in sorted(pathlib.Path(dossier).parent.iterdir()):
        if not d.is_dir() or d.is_symlink():
            continue
        try:
            f = d / "plugin.json"
            if f.is_symlink() or f.stat().st_size > 65536:
                continue
            p = json.loads(f.read_text())
            version = ""
            paquet = d / "package.json"
            if paquet.is_file() and not paquet.is_symlink() and paquet.stat().st_size <= 65536:
                version = json.loads(paquet.read_text()).get("version", "")
            resultat.append({"nom": _texte(p.get("name") or d.name, 160), "auteur": _texte(p.get("author"), 400),
                             "description": _texte(p.get("description")), "version": _texte(version, 80),
                             "root": "root" in p.get("flags", []), "dossier": _texte(d.name, 160)})
        except (OSError, ValueError, TypeError):
            continue
    return resultat

HOTES_VIDEOS = {"video.akamai.steamstatic.com", "video.fastly.steamstatic.com", "shared.steamstatic.com",
                "cdn.cloudflare.steamstatic.com", "cdn.fastly.steamstatic.com", "shared.akamai.steamstatic.com",
                "cdn.akamai.steamstatic.com", "shared.fastly.steamstatic.com"}
HOTES_IMAGES = HOTES_VIDEOS | {"plugins.deckbrew.xyz", "raw.githubusercontent.com", "user-images.githubusercontent.com",
                "github.com", "objects.githubusercontent.com", "github-production-user-asset-6210df.s3.amazonaws.com",
                "cdn.tzatzikiweeb.moe", "opengraph.githubassets.com", "avatars.githubusercontent.com",
                "i.imgur.com", "steamuserimages-a.akamaihd.net", "images.steamusercontent.com",   
                "repository-images.githubusercontent.com"}   
MAX_IMAGE = 4 * 1024 * 1024

def _dimensions(b):
    import struct
    if b.startswith(b"\x89PNG\r\n\x1a\n") and len(b) >= 24:
        return struct.unpack(">II", b[16:24])
    if b.startswith(b"RIFF") and b[8:12] == b"WEBP":
        if b[12:16] == b"VP8X" and len(b) >= 30:
            return int.from_bytes(b[24:27], "little") + 1, int.from_bytes(b[27:30], "little") + 1
        if b[12:16] == b"VP8 " and b[23:26] == b"\x9d\x01\x2a" and len(b) >= 30:
            w, h = struct.unpack("<HH", b[26:30])
            return w & 16383, h & 16383
        if b[12:16] == b"VP8L" and len(b) >= 25 and b[20] == 47:
            bits = int.from_bytes(b[21:25], "little")
            return (bits & 16383) + 1, ((bits >> 14) & 16383) + 1
    if b.startswith(b"\xff\xd8"):
        i = 2
        while i + 9 < len(b):
            if b[i] != 255:
                break
            marque = b[i + 1]
            if marque == 255:
                i += 1
                continue
            n = int.from_bytes(b[i + 2:i + 4], "big")
            if marque in (192, 193, 194):
                return int.from_bytes(b[i + 7:i + 9], "big"), int.from_bytes(b[i + 5:i + 7], "big")
            if n < 2:
                break
            i += n + 2
    raise ValueError("format de capture inconnu")

class RedirectionsImages(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not adresse(newurl, HOTES_IMAGES):
            raise ValueError("redirection hors images publiques")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

DEPOT_GITHUB = re.compile(r"https://github\.com/([\w.-]+/[\w.-]+)")
GABARIT = "SteamDeckHomebrew"   
DEPOTS = {}

def _lire_page(url, octets=65536):
    from infinimii import _contexte
    ouvre = urllib.request.build_opener(Redirections(HOTES_IMAGES), urllib.request.HTTPSHandler(context=_contexte()))
    with ouvre.open(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=10) as r:
        return r.read(octets).decode("utf-8", "replace")

def _cherche(depot, cle, lire):
    if (depot, cle) not in DEPOTS:
        try:
            DEPOTS[depot, cle] = str(lire() or "")
        except (urllib.error.HTTPError, ValueError, AttributeError, TypeError):
            DEPOTS[depot, cle] = ""
        except OSError:
            return ""
    return DEPOTS[depot, cle]

def candidats(depot):
    base = "https://raw.githubusercontent.com/" + depot + "/HEAD/"
    auteur = _cherche(depot, "auteur", lambda: (json.loads(_lire_page(base + "plugin.json")).get("publish") or {}).get("image"))
    auteur = urllib.parse.urljoin(base, auteur) if auteur else ""   
    if auteur and GABARIT not in auteur and not adresse(auteur, {"opengraph.githubassets.com"}):
        yield auteur
    apercu = _cherche(depot, "apercu", lambda: re.search(r'<meta property="og:image" content="([^"]+)"', _lire_page("https://github.com/" + depot))[1])
    if adresse(apercu, {"repository-images.githubusercontent.com"}):
        yield apercu

def image(url):
    import base64
    from infinimii import _contexte
    depot = DEPOT_GITHUB.fullmatch(str(url))
    if depot:
        for u in candidats(depot[1]):
            try:
                if r := image(u):
                    return r
            except (OSError, ValueError):
                continue
        return {}
    if not adresse(url, HOTES_IMAGES):
        return {}
    debut = time.perf_counter()
    ouvre = urllib.request.build_opener(RedirectionsImages(), urllib.request.HTTPSHandler(context=_contexte()))
    with ouvre.open(urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/png, image/jpeg, image/webp"}), timeout=10) as r:
        genre = r.headers.get_content_type()
        if genre not in ("image/jpeg", "image/png", "image/webp"):
            return {}
        b = r.read(MAX_IMAGE + 1)
    if len(b) > MAX_IMAGE:
        return {}
    w, h = _dimensions(b)
    if not (0 < w <= 4096 and 0 < h <= 4096 and w * h <= 8 * 1024 * 1024):
        return {}
    lecture = time.perf_counter()
    code = base64.b64encode(b).decode("ascii")
    return {"image": "data:" + genre + ";base64," + code,
            "mesures": {"lecture_ms": round((lecture - debut) * 1000, 2),
                        "base64_ms": round((time.perf_counter() - lecture) * 1000, 2),
                        "octets": len(b), "base64_octets": len(code)}}
