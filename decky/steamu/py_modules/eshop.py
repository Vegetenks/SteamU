import json
import pathlib
import re
import threading
import time
import urllib.parse
import urllib.request

STORE = "https://plugins.deckbrew.xyz/plugins"
EXPLORER = "https://safetzahirovic.github.io/decky-plugins-explorer/data/plugins.json"
MAX_JSON = 16 * 1024 * 1024
UA = "SteamU/1.0 (personal Steam theme; eShop, public Decky plugin catalogues)"
CACHE = 1800
VERROU = threading.Lock()
CATALOGUES = {"plugins.deckbrew.xyz", "safetzahirovic.github.io"}

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

def normaliser(donnees, verifie):
    if isinstance(donnees, dict):
        donnees = donnees.get("plugins", [])
    if not isinstance(donnees, list):
        raise ValueError("catalogue invalide")
    resultat = []
    for p in donnees[:3000]:
        if not isinstance(p, dict):
            continue
        if isinstance(p.get("plugin"), dict):   
            q = p["plugin"]
            sortie = p.get("latest_release") if isinstance(p.get("latest_release"), dict) else {}
            p = {**(q.get("publish") if isinstance(q.get("publish"), dict) else {}), **q, "source": p.get("url"),
                 "version": _texte(sortie.get("tag"), 80).lstrip("vV"), "updated_at": sortie.get("published_at")}
        nom = _texte(p.get("name") or p.get("nom"), 160)
        if not nom:
            continue
        versions = []
        for v in (p.get("versions") or [])[:100]:
            if not isinstance(v, dict):
                continue
            url = v.get("artifact") or v.get("download_url") or v.get("url") or ""
            if verifie and url:
                url = urllib.parse.urljoin(STORE, url)
            versions.append({"version": _texte(v.get("name") or v.get("version"), 80),
                             "url": url if adresse(url) else "", "sha256": _texte(v.get("hash") or v.get("sha256"), 64),
                             "date": _texte(v.get("created") or v.get("date"), 80)})
        if not versions and p.get("version"):
            url = p.get("download_url") or p.get("downloadUrl") or p.get("download") or ""
            versions = [{"version": _texte(p["version"], 80), "url": url if adresse(url) else "",
                         "sha256": _texte(p.get("sha256"), 64), "date": _texte(p.get("updated_at"), 80)}]
        recent = (p.get("versions") or [{}])[0]
        image = p.get("image_url") or p.get("image") or (recent.get("image_url") if isinstance(recent, dict) else "") or ""
        resultat.append({"nom": nom, "auteur": _texte(p.get("author") or p.get("authors"), 400),
                         "description": _texte(p.get("description") or (recent.get("description") if isinstance(recent, dict) else "")), "image": image if adresse(image) else "",
                         "tags": [_texte(t, 80) for t in (p.get("tags") or [])[:30]],
                         "licence": _texte(p.get("license"), 100), "source": _texte(p.get("source") or p.get("repository"), 400),
                         "root": "root" in (p.get("flags") or []) or p.get("root") is True,
                         "versions": versions, "origine": "verifie" if verifie else "non_verifie"})
    return resultat

def _telecharger(fichier, url, verifie):
    brut = _lire_url(url)
    liste = normaliser(brut, verifie)
    temporaire = fichier.with_suffix(".tmp")
    temporaire.write_text(json.dumps(brut))
    temporaire.replace(fichier)
    return liste

def _rafraichir(fichier, url, verifie):
    try:
        with VERROU:
            _telecharger(fichier, url, verifie)
    except Exception:
        pass   
    finally:
        EN_COURS.discard(fichier.name)

EN_COURS = set()

def catalogues(cache):
    dossier = pathlib.Path(cache) / "eshop"
    dossier.mkdir(parents=True, exist_ok=True)
    listes, erreurs = [], []
    with VERROU:
        for nom, url, verifie in (("store", STORE, True), ("explorer", EXPLORER, False)):
            fichier = dossier / (nom + ".json")
            ancien = None
            try:
                if fichier.stat().st_size <= MAX_JSON:
                    ancien = json.loads(fichier.read_text())
            except (OSError, ValueError):
                pass
            if ancien is not None:
                if time.time() - fichier.stat().st_mtime >= CACHE and fichier.name not in EN_COURS:
                    EN_COURS.add(fichier.name)
                    threading.Thread(target=_rafraichir, args=(fichier, url, verifie), daemon=True).start()
                listes.append(normaliser(ancien, verifie))
                continue
            try:
                listes.append(_telecharger(fichier, url, verifie))
            except Exception:
                erreurs.append(nom)
                listes.append([])
    return {"store": listes[0], "explorer": listes[1], "erreurs": erreurs}

def github(source):
    m = re.fullmatch(r"https://github\.com/([\w.-]+)/([\w.-]+?)(?:\.git)?/?", str(source or ""))
    if not m:
        return {}
    r = _lire_url("https://api.github.com/repos/" + m[1] + "/" + m[2] + "/releases/latest", {"api.github.com"})
    for a in (r.get("assets") if isinstance(r, dict) else None) or []:
        url = str(a.get("browser_download_url") or "") if isinstance(a, dict) else ""
        if url.endswith(".zip") and adresse(url, {"github.com"}) and "/releases/download/" in urllib.parse.urlsplit(url).path:
            h = str(a.get("digest") or "")
            return {"version": _texte(r.get("tag_name"), 80).lstrip("vV"), "url": url,
                    "sha256": h[7:] if re.fullmatch(r"sha256:[0-9a-f]{64}", h) else ""}
    return {}

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
                             "root": "root" in p.get("flags", [])})
        except (OSError, ValueError, TypeError):
            continue
    return resultat

HOTES_VIDEOS = {"video.akamai.steamstatic.com", "video.fastly.steamstatic.com", "shared.steamstatic.com",
                "cdn.cloudflare.steamstatic.com", "cdn.fastly.steamstatic.com", "shared.akamai.steamstatic.com",
                "cdn.akamai.steamstatic.com", "shared.fastly.steamstatic.com"}
HOTES_IMAGES = HOTES_VIDEOS | {"plugins.deckbrew.xyz", "raw.githubusercontent.com", "user-images.githubusercontent.com",
                "github.com", "objects.githubusercontent.com", "github-production-user-asset-6210df.s3.amazonaws.com",
                "safetzahirovic.github.io", "cdn.tzatzikiweeb.moe", "opengraph.githubassets.com", "avatars.githubusercontent.com",
                "i.imgur.com", "steamuserimages-a.akamaihd.net", "images.steamusercontent.com"}   
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

def image(url):
    import base64
    from infinimii import _contexte
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
