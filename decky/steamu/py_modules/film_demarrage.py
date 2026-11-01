import json, os, shutil, subprocess, threading, urllib.request
import websocket
import moteur

FILM = "steamu.webm"                
IMAGE = "steamu-fin.jpg"            
APPARENCES = ("clair", "gris", "noir")   
HAUTEURS, RATIO, DEFAUT = (800, 1200, 2400), 16 / 10, 1200
POSE = threading.Lock()             
NOTRE = "/uioverrides/movies/" + FILM   
NOTRE_IMAGE = "/uioverrides/movies/" + IMAGE
STEAM = {"id": "0", "chemin": "", "melange": False}   
CHAMPS = {"id": 16000, "chemin": 16001, "melange": 16002}

LIRE = """(async () => {
  const buf = await new Promise((ok, non) => { const m = setTimeout(() => non("réglages muets"), 5000);
    const h = SteamClient.Settings.RegisterForSettingsArrayChanges((s) => { clearTimeout(m); ok(s); setTimeout(() => h?.unregister?.(), 0); }); });
  const b = new Uint8Array(buf); let i = 0; const r = {};
  const v = () => { let x = 0n, d = 0n, c; do { c = b[i++]; x |= BigInt(c & 127) << d; d += 7n; } while (c & 128); return x; };
  while (i < b.length) { const t = v(), n = Number(t >> 3n), w = Number(t & 7n); let val;
    if (w === 0) val = v(); else if (w === 2) { const l = Number(v()); val = new TextDecoder().decode(b.subarray(i, i + l)); i += l; }
    else if (w === 5) i += 4; else if (w === 1) i += 8; else throw new Error("fil " + w);
    if (n === %(id)d) r.id = String(val); else if (n === %(chemin)d) r.chemin = val; else if (n === %(melange)d) r.melange = !!val; }
  return JSON.stringify(r); })()""" % CHAMPS

def poser_js(valeurs):
    return """(async () => {
  const vi = (n) => { n = BigInt(n); const o = []; while (n > 127n) { o.push(Number(n & 127n) | 128); n >>= 7n; } o.push(Number(n)); return o; };
  const un = (octets) => SteamClient.Settings.SetSetting(btoa(String.fromCharCode(...octets)));
  const s = new TextEncoder().encode(%(chemin)s);
  await un([...vi(%(nid)d * 8), ...vi(%(id)s)]);
  await un([...vi(%(nchemin)d * 8 + 2), ...vi(s.length), ...s]);
  await un([...vi(%(nmelange)d * 8), %(melange)d]);
  return "ok"; })()""" % {"chemin": json.dumps(valeurs["chemin"]), "id": json.dumps(str(int(valeurs["id"] or 0))),
                          "melange": int(bool(valeurs["melange"])), "nid": CHAMPS["id"], "nchemin": CHAMPS["chemin"], "nmelange": CHAMPS["melange"]}

def decider(etat, actuel, actif):
    notre = actuel.get("chemin") == NOTRE and not actuel.get("melange")
    cible = dict(STEAM, chemin=NOTRE)
    if not actif:   
        return {}, (etat["avant"] if etat.get("avant") and notre else None)
    if etat.get("laisse"): return etat, None
    if etat.get("avant"):   
        return (etat, None) if notre else ({"laisse": True}, None)
    avant = STEAM if notre else {k: actuel.get(k, STEAM[k]) for k in STEAM}
    return {"avant": avant}, (None if notre else cible)

def _partage(code):
    c = next(t for t in json.load(urllib.request.urlopen(moteur.DEBOGUEUR, timeout=5)) if t.get("title") == "SharedJSContext")
    ws = websocket.create_connection(moteur.local(c["webSocketDebuggerUrl"]), suppress_origin=True, timeout=10)
    try:
        ws.send(json.dumps({"id": 1, "method": "Runtime.evaluate", "params": {"expression": code, "returnByValue": True, "awaitPromise": True}}))
        while (r := json.loads(ws.recv())).get("id") != 1: pass
    finally: ws.close()
    r = r.get("result", {})
    if r.get("exceptionDetails"): raise RuntimeError(str(r["exceptionDetails"].get("text"))[:200])
    return r.get("result", {}).get("value")

def appliquer(fichier, actif, evaluer=_partage):
    etat = json.loads(fichier.read_text()) if fichier.exists() else {}
    nouveau, poser = decider(etat, json.loads(evaluer(LIRE)), actif)
    fichier.write_text(json.dumps(nouveau))   
    if poser:
        try: evaluer(poser_js(poser))
        except Exception: fichier.write_text(json.dumps(etat)); raise
    return nouveau

def hauteur(largeur, haut):
    try: besoin = max(float(haut), float(largeur) / RATIO)
    except (TypeError, ValueError): return DEFAUT
    return next((h for h in HAUTEURS if h >= besoin - 1), HAUTEURS[-1]) if besoin > 0 else DEFAUT

def source(apparence, ext="webm", haut=DEFAUT):
    return "demarrage-%s-%d.%s" % (apparence if apparence in APPARENCES else "clair", haut if haut in HAUTEURS else DEFAUT, ext)

def poser(donnees, films, apparence, son, haut=DEFAUT):
    films.mkdir(parents=True, exist_ok=True)
    film, tmp = donnees / source(apparence, "webm", haut), films / (FILM + ".tmp")
    with POSE:
        shutil.copy(donnees / source(apparence, "jpg", haut), films / (IMAGE + ".tmp")); os.replace(films / (IMAGE + ".tmp"), films / IMAGE)
        try:
            if not son.is_file(): raise FileNotFoundError(son)
            subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(film), "-i", str(son), "-map", "0:v:0", "-map", "1:a:0",
                            "-c", "copy", "-shortest", "-f", "webm", str(tmp)], check=True, timeout=30, capture_output=True)
        except Exception:
            shutil.copy(film, tmp)
        os.replace(tmp, films / FILM)
