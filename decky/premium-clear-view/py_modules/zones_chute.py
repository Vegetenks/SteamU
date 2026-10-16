import json, math, re, shutil, subprocess, sys
from pathlib import Path

import numpy as np

MOTIF_TROU = re.compile(r"hole", re.I)
MOTIF_EXCLU = re.compile(r"pinhole", re.I)
SEUIL_Y = 70
OPAQUE_MIN = 24  
ECART_FUSION = 15  

def lire_rgba(chemin):
    p = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                         "-of", "csv=p=0", str(chemin)], capture_output=True, text=True, check=True)
    w, h = (int(v) for v in p.stdout.strip().split(","))
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(chemin), "-f", "rawvideo", "-pix_fmt", "rgba", "pipe:1"],
                        capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.uint8).reshape(h, w, 4)

def colonnes_opaques(rgba):
    opaque = rgba[:, :, 3] > 127
    compte = opaque.sum(axis=0)
    xs = np.where(compte >= min(OPAQUE_MIN, opaque.shape[0]))[0]
    if xs.size == 0: return []
    runs, debut = [], xs[0]
    for a, b in zip(xs, xs[1:]):
        if b - a > 1: runs.append((debut, a)); debut = b
    runs.append((debut, xs[-1]))
    out = []
    for x0, x1 in runs:
        bande = opaque[:, x0:x1 + 1]
        ys = np.where(bande.any(axis=1))[0]
        out.append((int(x0), int(x1), int(ys.min()), int(ys.max())))
    return out

def vers_ecran(u, v, o):
    a = math.radians(o["rot"]); ca, sa = math.cos(a), math.sin(a)
    dx, dy = (u - o["w"] / 2) * o["sx"], (v - o["h"] / 2) * o["sy"]
    return o["x"] + dx * ca - dy * sa

def intervalles_objet(o, dossier_objets):
    if not MOTIF_TROU.search(o["img"]) or MOTIF_EXCLU.search(o["img"]) or o["y"] < SEUIL_Y: return []
    chemin = dossier_objets / Path(o["img"]).name
    if not chemin.exists(): return []
    try: rgba = lire_rgba(chemin)
    except Exception: return []
    out = []
    for x0, x1, y0, y1 in colonnes_opaques(rgba):
        xs = [vers_ecran(u, v, o) for u in (x0, x1 + 1) for v in (y0, y1 + 1)]
        out.append((min(xs), max(xs)))
    return out

def fusionner(intervalles):
    if not intervalles: return []
    intervalles = sorted(intervalles)
    out = [list(intervalles[0])]
    for x0, x1 in intervalles[1:]:
        if x0 - out[-1][1] <= ECART_FUSION: out[-1][1] = max(out[-1][1], x1)
        else: out.append([x0, x1])
    bornes = ((round(min(400, max(0, a)), 1), round(min(400, max(0, b)), 1)) for a, b in out)
    return [[a, b] for a, b in bornes if b > a]

def detecter_chutes(m, dossier_objets):
    brut = [iv for o in m.get("objets", []) for iv in intervalles_objet(o, dossier_objets)]
    chutes = fusionner(brut)
    return chutes or None

def enrichir_index(dossier, ecrire):
    dossier = Path(dossier)
    index = json.loads((dossier / "index.json").read_text())
    dossier_objets = dossier / "objets"
    trouve = 0
    for nom, m in index["machines"].items():
        chutes = detecter_chutes(m, dossier_objets)
        if chutes: m["chutes"] = chutes; trouve += 1
        else: m.pop("chutes", None)
    print(f"{trouve}/{len(index['machines'])} machines avec des zones de chute détectées")
    if ecrire:
        ancien = dossier / "index.json.avant-chutes"
        if not ancien.exists(): shutil.copyfile(dossier / "index.json", ancien)
        (dossier / "index.json").write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")))
        print(f"écrit : {dossier / 'index.json'} (ancien sauvegardé : {ancien})")
    return index

def planche_controle(index, dossier, n, sortie):
    dossier = Path(dossier)
    choisies = [(nom, m) for nom, m in index["machines"].items() if m.get("chutes")][:n]
    cases = []
    for nom, m in choisies:
        fond = dossier / m["fond"]
        case = Path(f"/dev/shm/zones-chute/_case_{nom}.png")
        traits = ",".join(f"drawbox=x={x0*2}:y=470:w={(x1-x0)*2}:h=10:color=red@0.85:t=fill"
                           for x0, x1 in m["chutes"])
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(fond),
                         "-vf", f"scale=800:480,{traits},drawtext=text='{nom}':x=8:y=8:fontsize=20:"
                                "fontcolor=white:box=1:boxcolor=black@0.6",
                         str(case)], check=True)
        cases.append(case)
    if not cases: print("aucune machine à zones détectées : pas de planche"); return
    cols = 3
    inputs = [a for c in cases for a in ("-i", str(c))]
    disp = "|".join(f"{(i % cols) * 800}_{(i // cols) * 480}" for i in range(len(cases)))
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex",
                     f"xstack=inputs={len(cases)}:layout={disp}", str(sortie)], check=True)
    for c in cases: c.unlink(missing_ok=True)
    print(f"planche de contrôle ({len(cases)} machines) : {sortie}")

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args: sys.exit(__doc__)
    dossier = args[0]
    ecrire = "--ecrire" in args
    idx = enrichir_index(dossier, ecrire)
    if "--planche" in args:
        i = args.index("--planche")
        planche_controle(idx, dossier, int(args[i + 1]), args[i + 2])
