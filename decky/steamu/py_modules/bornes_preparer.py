import importlib.util, json, math, os, re, shutil, subprocess, sys, zlib
from pathlib import Path

try:
    import zones_chute
except ImportError:
    zones_chute = None
    _depot = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../outils/badge-arcade/zones-chute.py")
    try:
        _spec = importlib.util.spec_from_file_location("zones_chute", _depot)
        zones_chute = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(zones_chute)
    except (ImportError, OSError, AttributeError) as e:
        zones_chute = None; print(f"zones-chute.py indisponible ({e}) : aucune zone de chute détectée", file=sys.stderr)

GOULOTTE = (320, 400)   
nf = lambda s: re.sub(r"[^A-Za-z0-9_.-]+", "_", s)

def preparer(BOSS, INDEX, SORTIE, toutes=False, vider=False):
    machines = json.load(open(os.path.join(BOSS, "machines.json")))
    objets = json.load(open(os.path.join(BOSS, "objets.json"))) if os.path.exists(os.path.join(BOSS, "objets.json")) else {}
    badges = json.load(open(os.path.join(BOSS, "badges.json")))
    accessoires = json.load(open(os.path.join(BOSS, "accessoires.json"))) if os.path.exists(os.path.join(BOSS, "accessoires.json")) else {}
    index = json.load(open(INDEX))
    nos = {s["id"]: s for s in index["series"]}

    def poser(o, p):
        sw, sh = o["taille"]; a = math.radians(p["rotation"]); ca, sa = math.cos(a), math.sin(a); sx, sy = p["echelle"]
        def f(u, v):
            dx, dy = (u - sw / 2) * sx, (v - sh / 2) * sy
            return (p["x"] + dx * ca - dy * sa, p["y"] + dx * sa + dy * ca)
        return [[f(u, v) for u, v in poly] for poly in o["collision"]]

    def bords(polys):
        cle = lambda a, b: (round(a[0], 1), round(a[1], 1), round(b[0], 1), round(b[1], 1))
        n = {}
        for P in polys:
            for i in range(len(P)):
                a, b = P[i], P[(i + 1) % len(P)]
                if math.dist(a, b) < .5: continue
                k = cle(a, b); r = cle(b, a)
                if r in n: n[r] += 1
                else: n[k] = n.get(k, 0) + 1
        out = []
        for P in polys:
            for i in range(len(P)):
                a, b = P[i], P[(i + 1) % len(P)]
                k = cle(a, b)
                if n.get(k) == 1: out.append([round(a[0], 2), round(a[1], 2), round(b[0], 2), round(b[1], 2)])
        return out

    def goulotte_libre(x):
        for p in x["dans_la_machine"]["objets_fixes"]:
            o = objets.get(x["objets_fixes"][p["index"]])
            if not o: return False
            for P in poser(o, p):
                xs = [q[0] for q in P]
                if max(xs) > GOULOTTE[0] and min(xs) < GOULOTTE[1]: return False
        return True

    def valable(x):   
        d = x["dans_la_machine"]
        return (x["complete"] and x["disponibilite"] == "jeu" and len(d["lots"]) >= 1
                and all(x["objets_fixes"][p["index"]] in objets for p in d["objets_fixes"])
                and all(x["accessoires"][p["index"]] in accessoires for p in d["accessoires"])
                and os.path.exists(os.path.join(BOSS, "fonds", nf(x["fond"]) + ".png")))

    par_serie = {}
    for x in sorted(machines, key=lambda x: x["nom"]):
        if valable(x): par_serie.setdefault(x["serie"], []).append(x)
    def meilleure(l):   
        return sorted(l, key=lambda x: (x["type_pince"] != "standard", not goulotte_libre(x), -len(x["dans_la_machine"]["lots"]), x["nom"]))[0]

    choix, repli = {}, sorted((x for x in par_serie.get("BTCenter", []) if x["type_pince"] == "standard" and goulotte_libre(x)), key=lambda x: x["nom"])
    ancien = {}
    try: ancien = json.load(open(os.path.join(SORTIE, "index.json"))).get("series", {})
    except Exception: pass
    for sid in nos:
        l = par_serie.get(sid)
        if not l: continue
        if toutes: choix[sid] = l; continue
        a = ancien.get(sid); a = a[0] if isinstance(a, list) and len(a) == 1 else a
        choix[sid] = [next((x for x in l if x["nom"] == a), None) or meilleure(l)]
    emprunts = {}
    for sid, s in nos.items():
        if sid in choix: continue
        soeurs = sorted(k for k in choix if nos[k].get("famille") == s.get("famille"))
        if soeurs: emprunts[sid] = choix[soeurs[zlib.crc32(sid.encode()) % len(soeurs)]]
    garde = {x["nom"]: x for l in choix.values() for x in l}
    for x in repli: garde[x["nom"]] = x
    if not repli or not choix: return 0              
    entrainement = meilleure([x for x in repli if not x["dans_la_machine"]["accessoires"]] or repli)

    def badge(nom):
        b = badges.get(nom)
        if not b or not b.get("image_jeu_128") or not b.get("collision"): return None
        src = os.path.join(BOSS, "badges", nf(b["categorie"]), nf(nom) + ".png")
        if not os.path.exists(src): return None
        A = cx = cy = 0
        for P in b["collision"]:   
            for i in range(len(P)):
                (x0, y0), (x1, y1) = P[i], P[(i + 1) % len(P)]; c = x0 * y1 - x1 * y0
                A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c
        A /= 2
        if abs(A) < 1: return None
        return src, {"img": f"badges/{nf(b['categorie'])}/{nf(nom)}.png", "r": round(math.sqrt(abs(A) / math.pi), 2),
                     "c": [round(cx / (6 * A) - 64, 2), round(cy / (6 * A) - 64, 2)],
                     "polys": [[[round(u, 1), round(v, 1)] for u, v in P] for P in b["collision"]]}

    if vider and os.path.isdir(SORTIE): shutil.rmtree(SORTIE)
    os.makedirs(SORTIE, exist_ok=True)
    sortie = {"note": "repère : écran du haut 400 x 240, origine en haut à gauche ; rotation horaire en degrés ; r et c des badges en pixels de leur image 128 x 128",
              "series": {sid: sorted(x["nom"] for x in l) for sid, l in {**choix, **emprunts}.items()}, "propres": sorted(choix), "repli": [x["nom"] for x in repli], "entrainement": entrainement["nom"],
              "machines": {}, "badges": {}}
    copies = set()
    def copier(src, rel):
        if rel in copies: return
        copies.add(rel); dst = os.path.join(SORTIE, rel); os.makedirs(os.path.dirname(dst), exist_ok=True)
        if rel.endswith(".jpg"): subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-protocol_whitelist", "file", "-f", "png_pipe", "-i", "file:" + src,
                                                "-q:v", "3", "file:" + dst], check=True, stdin=subprocess.DEVNULL, timeout=60)
        else: shutil.copyfile(src, dst)

    for nom, x in sorted(garde.items()):
        d = x["dans_la_machine"]; m = {"serie": x["serie"], "type": x["type_pince"], "couleur": [round(c, 3) for c in x["couleur_pince_rgb"]],
                                       "fond": f"fonds/{nf(x['fond'])}.jpg", "noms": {"fr": x["noms"].get("fr"), "en": x["noms"].get("en")}, "objets": [], "lots": []}
        copier(os.path.join(BOSS, "fonds", nf(x["fond"]) + ".png"), m["fond"])
        for p in d["objets_fixes"]:
            on = x["objets_fixes"][p["index"]]; o = objets[on]; rel = f"objets/{nf(on)}.png"
            copier(os.path.join(BOSS, "objets", nf(on) + ".png"), rel)
            m["objets"].append({"img": rel, "w": o["taille"][0], "h": o["taille"][1], "x": round(p["x"], 2), "y": round(p["y"], 2),
                                "sx": round(p["echelle"][0], 4), "sy": round(p["echelle"][1], 4), "rot": round(p["rotation"], 3),
                                "glisse": "Slip" in on, "invisible": "Invisible" in on, "bords": bords(poser(o, p)),
                                "polys": [[[round(u, 2), round(v, 2)] for u, v in P] for P in poser(o, p)],
                                "phys": [round(v, 4) for v in p["inconnus_0x18_0x28"]]})
        for p in d["lots"]:
            bn = x["lots"][p["index"]]; b = badge(bn)
            if b and bn not in sortie["badges"]: copier(b[0], b[1]["img"]); sortie["badges"][bn] = b[1]
            m["lots"].append({"nom": bn, "x": round(p["x"], 2), "y": round(p["y"], 2), "s": round(p["echelle"][0], 4), "rot": round(p["rotation"], 2), "grav": p["gravite_au_depart"],
                             "phys": [round(v, 4) for v in p["inconnus_0x18_0x28"]]})
        m["accessoires"] = []
        for p in d["accessoires"]:
            an = x["accessoires"][p["index"]]; a = accessoires[an]; rel = f"accessoires/{nf(an)}.png"
            copier(os.path.join(BOSS, "accessoires", nf(an) + ".png"), rel)
            m["accessoires"].append({"nom": an, "img": rel, "w": a["taille"][0], "h": a["taille"][1], "x": round(p["x"], 2), "y": round(p["y"], 2),
                                     "sx": round(p["echelle"][0], 4), "sy": round(p["echelle"][1], 4), "rot": round(p["rotation"], 3), "grav": p["gravite_au_depart"],
                                     "invisible": "Invisible" in an, "polys": [[[round(u, 1), round(v, 1)] for u, v in P] for P in a["collision"]],
                                     "phys": [round(v, 4) for v in p["inconnus_0x18_0x28"]]})
        m["accroches"] = [{"acc": b["accessoire"], "lot": b["badge"], "x": round(b["x"], 2), "y": round(b["y"], 2)} for b in x.get("badges_accroches") or []
                          if b["accessoire"] < len(m["accessoires"]) and b["badge"] < len(m["lots"])]
        m["goulotte_libre"] = goulotte_libre(x)
        for o in m["objets"]: o["rebond"] = bool(re.search(r"_J[au]mp", o["img"]))   
        if zones_chute:
            chutes = zones_chute.detecter_chutes(m, Path(SORTIE) / "objets")
            if chutes: m["chutes"] = chutes
        sortie["machines"][nom] = m
    json.dump(sortie, open(os.path.join(SORTIE, "index.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    return len(garde)

