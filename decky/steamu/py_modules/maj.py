import json, re, urllib.parse, urllib.request

MANIFESTE = "https://github.com/Vegetenks/SteamU/raw/main/release/latest.json"
DELAI = 8        
TAILLE_MAX = 64 * 1024

CANAUX = ("stable", "rc", "beta", "alpha")
VERSION = r"\d{1,4}\.\d{1,4}\.\d{1,4}(?:-(?:rc|beta|alpha)\.\d{1,4})?"

def _cle(v):
    m = re.match(r"(\d+(?:\.\d+){0,3})(?:-(alpha|beta|rc)\.(\d+)$)?", str(v))
    if not m: return ()
    n = tuple(int(x) for x in m[1].split("."))
    return n + (0,) * (4 - len(n)) + ((CANAUX[::-1].index(m[2]), int(m[3])) if m[2] else (len(CANAUX), 0))

def canal_de(v):
    m = re.search(r"-(alpha|beta|rc)\.\d+$", str(v))
    return m[1] if m else "stable"

def plus_recente(annoncee, installee):
    return _cle(annoncee) > _cle(installee)

def _origine(u):
    p = urllib.parse.urlsplit(u)
    return (p.scheme, p.netloc)

def verifier(installee, manifeste=""):
    manifeste = manifeste or MANIFESTE
    if _origine(manifeste)[0] not in ("http", "https"): return {}
    from infinimii import _contexte
    with urllib.request.urlopen(manifeste, timeout=DELAI, context=_contexte()) as r:
        m = json.loads(r.read(TAILLE_MAX))
    v, url, h = str(m.get("version", "")), str(m.get("url", "")), str(m.get("sha256", "")).lower()
    if not (_cle(v) and canal_de(v) == "stable" and _origine(url) == _origine(manifeste) and re.fullmatch(r"[0-9a-f]{64}", h)): return {}
    if not plus_recente(v, installee): return {}
    n = m.get("notes") if isinstance(m.get("notes"), dict) else {}
    notes = {k: [str(l)[:400] for l in n[k][:30]] for k in ("fr", "en", "es") if isinstance(n.get(k), list)}
    return {"version": v[:40], "url": url, "sha256": h, "notes": notes}

DEPOT = "Vegetenks/SteamU"
API_PUBLICATIONS = "https://api.github.com/repos/" + DEPOT + "/releases?per_page=30"
ARCHIVE = "https://github.com/" + DEPOT + "/releases/download/v{v}/SteamU-v{v}.zip"
LISTE_MAX = 1024 * 1024

class _SansRedirection(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        raise ValueError("redirection refusée")

def _publications():
    from infinimii import _contexte
    ouvreur = urllib.request.build_opener(urllib.request.ProxyHandler({}), urllib.request.HTTPSHandler(context=_contexte()), _SansRedirection())
    with ouvreur.open(API_PUBLICATIONS, timeout=DELAI) as r:
        brut = r.read(LISTE_MAX + 1)
    if len(brut) > LISTE_MAX: raise ValueError("liste trop grande")
    l = json.loads(brut)
    return [p for p in map(publication, l if isinstance(l, list) else []) if p]

def _puces(corps):
    l = []
    for ligne in str(corps or "").splitlines():
        if ligne.startswith("- "): l.append(ligne[2:])
        elif ligne.startswith("  ") and l and ligne.strip(): l[-1] += " " + ligne.strip()
    return [x.replace("**", "")[:400] for x in l[:30]]

def publication(r):
    if not isinstance(r, dict) or r.get("draft") or not isinstance(r.get("tag_name"), str): return None
    v = r["tag_name"][1:]
    if r["tag_name"][:1] != "v" or not re.fullmatch(VERSION, v): return None
    canal = canal_de(v)
    if r.get("prerelease") is not (canal != "stable"): return None
    url = ARCHIVE.format(v=v)
    for a in r.get("assets") if isinstance(r.get("assets"), list) else []:
        h = str(a.get("digest") or "") if isinstance(a, dict) else ""
        if h and a.get("name") == "SteamU-v" + v + ".zip" and a.get("browser_download_url") == url and re.fullmatch(r"sha256:[0-9a-f]{64}", h):
            return {"version": v, "url": url, "sha256": h[7:], "canal": canal, "notes": {"en": _puces(r.get("body"))}}
    return None

def choisir(publications, canal, installee):
    rang = CANAUX.index(canal) if canal in CANAUX else 0
    l = [p for p in publications if CANAUX.index(p["canal"]) <= rang]
    p = max(l, key=lambda p: _cle(p["version"]), default=None)
    return p if p and plus_recente(p["version"], installee) else {}

def verifier_canal(installee, canal):
    return choisir(_publications(), canal, installee)

def trouver(version):
    if version and not re.fullmatch(VERSION, str(version)): return {}
    l = _publications()
    return choisir(l, "stable", "") if not version else next((p for p in l if p["version"] == version), {})

def message_annonce(a):
    return b"SteamU annonce preversion v1\n" + json.dumps({k: v for k, v in a.items() if k != "signature"}, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()

def _lignes(d):
    return isinstance(d, dict) and set(d) <= {"fr", "en", "es"} and all(
        isinstance(l, list) and len(l) <= 30 and all(isinstance(x, str) and 0 < len(x) <= 400 and "\u2014" not in x and "\u00b7" not in x for x in l) for l in d.values())

def preversion_bonne(p):
    return (isinstance(p, dict) and set(p) <= {"version", "nouveautes", "defauts"} and isinstance(p.get("version"), str)
            and re.fullmatch(VERSION, p["version"]) is not None and canal_de(p["version"]) != "stable"
            and all(_lignes(p[k]) for k in ("nouveautes", "defauts") if k in p))

def annonces_sures(annonces, installee, cle):
    import base64, spotpass
    garde = []
    for a in annonces if isinstance(annonces, list) else []:
        if isinstance(a, dict) and "preversion" in a:
            try: sig = base64.b64decode(a.get("signature", ""), validate=True)
            except (TypeError, ValueError): continue
            if not (cle and "lien" not in a and preversion_bonne(a["preversion"]) and spotpass.verifier(cle, message_annonce(a), sig)
                    and plus_recente(a["preversion"]["version"], installee)): continue
            a = {k: v for k, v in a.items() if k != "signature"}
        garde.append(a)
    return garde

if __name__ == "__main__":
    assert plus_recente("0.1.8-test", "0.1.7-test") and plus_recente("0.2.0", "0.1.12")
    assert not plus_recente("0.1.7-test", "0.1.7-test") and not plus_recente("0.1.6", "0.1.7-test")
    assert _origine("https://github.com/a/b") == _origine("https://github.com/c")
    assert plus_recente("0.3.0", "0.3.0-rc.1") and plus_recente("0.3.0-rc.1", "0.3.0-beta.2") and plus_recente("0.3.0-beta.10", "0.3.0-beta.9")
    assert plus_recente("0.3.0-alpha.1", "0.2.9") and not plus_recente("0.3.0-rc.1", "0.3.0")
    print("maj.py : ok")
