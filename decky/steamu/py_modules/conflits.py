import json, pathlib

RESTYLEURS_CONNUS = {"css loader": "cssloader", "game glance": "gameglance"}

STYLE_JS = (r"(() => Array.from(document.querySelectorAll('style')).some(e => "
            r"e.classList?.contains('css-loader-style') || (e.id || '').startsWith('css-loader')))()")

def greffons_installes(maison):
    r = {}
    for d in pathlib.Path(maison, "homebrew/plugins").glob("*"):
        try:
            nom = json.loads((d / "plugin.json").read_text()).get("name")
        except Exception:
            nom = None
        if nom: r[nom.strip().lower()] = d
    try: coupes = {n.strip().lower() for n in json.loads(pathlib.Path(maison, "homebrew/settings/loader.json").read_text()).get("disabled_plugins") or []}
    except Exception: coupes = set()
    return {n: d for n, d in r.items() if n not in coupes}

def css_loader_actif(maison):
    themes = pathlib.Path(maison, "homebrew/themes")
    if not themes.is_dir(): return False
    for d in themes.glob("*"):
        if not d.is_dir(): continue
        for nom in ("config_USER.json", "config_ROOT.json"):
            try:
                if json.loads((d / nom).read_text()).get("active"): return True
            except Exception: pass
    return False

def styles_injectes(debogueur, local, evaluer):
    try:
        import urllib.request
        cibles = json.load(urllib.request.urlopen(debogueur, timeout=3))
    except Exception:
        return False
    for c in cibles:
        if c.get("type") != "page" or not c.get("url", "").startswith("about:blank"): continue
        try:
            if evaluer(local, c, STYLE_JS): return True
        except Exception: pass
    return False

def conflits(maison, debogueur=None, local=None, evaluer=None):
    installes = greffons_installes(maison)
    r = {}
    for nom_plugin, affiche in (("css loader", "CSS Loader"), ("game glance", "Game Glance")):
        if nom_plugin not in installes: continue
        cle = RESTYLEURS_CONNUS[nom_plugin]
        if nom_plugin == "css loader":
            actif = css_loader_actif(maison) or (bool(debogueur and local and evaluer) and styles_injectes(debogueur, local, evaluer))
        else:
            actif = True
        if actif: r[cle] = affiche
    return r
