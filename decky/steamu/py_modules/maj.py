import json, re, urllib.parse, urllib.request

MANIFESTE = "https://github.com/Vegetenks/SteamU/raw/main/release/latest.json"
DELAI = 8        
TAILLE_MAX = 64 * 1024

def _nombres(v):
    return tuple(int(n) for n in re.findall(r"\d+", str(v))[:3])

def plus_recente(annoncee, installee):
    return _nombres(annoncee) > _nombres(installee)

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
    if not (_nombres(v) and _origine(url) == _origine(manifeste) and re.fullmatch(r"[0-9a-f]{64}", h)): return {}
    if not plus_recente(v, installee): return {}
    n = m.get("notes") if isinstance(m.get("notes"), dict) else {}
    notes = {k: [str(l)[:400] for l in n[k][:30]] for k in ("fr", "en", "es") if isinstance(n.get(k), list)}
    return {"version": v[:40], "url": url, "sha256": h, "notes": notes}

if __name__ == "__main__":
    assert plus_recente("0.1.8-test", "0.1.7-test") and plus_recente("0.2.0", "0.1.12")
    assert not plus_recente("0.1.7-test", "0.1.7-test") and not plus_recente("0.1.6", "0.1.7-test")
    assert _origine("https://github.com/a/b") == _origine("https://github.com/c")
    print("maj.py : ok")
