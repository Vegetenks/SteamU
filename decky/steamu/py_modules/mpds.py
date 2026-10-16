import math, struct
import sm64ds

CADENCE = 60          
MODELE = ("data/p02_luigi_LZ.bin", 19)
CLIPS = [
    ("mp_defaite", "data/p02_luigi_LZ.bin", 7, False, "défaite : tape du pied, secoue la tête, puis s'affaisse tête basse"),
    ("mp_victoire", "data/p02_luigi_LZ.bin", 6, False, "victoire : deux sauts bras en V, révérence, puis pose poing levé"),
    ("mp_oh_non", "data/p02_luigi_LZ.bin", 9, False, "déception courte : recule mains à la tête"),
    ("mp_joie_bras_croises", "data/p02_luigi_LZ.bin", 10, False, "joie : saut bras levés puis bras croisés"),
    ("mp_joie_saut", "data/bmap_p02motion.bin", 5, False, "saut de joie bras ouverts"),
    ("mp_petit_saut_poing", "data/bmap_p02motion.bin", 1, False, "petit saut poing levé (gain)"),
    ("mp_saut_poing_reverence", "data/bmap_p02motion.bin", 0, False, "saut poing levé puis atterrit penché en avant"),
    ("mp_surprise_chute", "data/bmap_p02motion.bin", 2, False, "surprise : tombe sur les fesses"),
    ("mp_choc_a_plat_ventre", "data/bmap_p02motion.bin", 3, False, "gros choc : tombe à plat ventre"),
    ("mp_peur_tremble", "data/bmap_p02motion.bin", 7, True, "peur : tremble (boucle)"),
    ("mp_attente_inquiete", "data/bmap_p02motion.bin", 4, True, "attente inquiète (boucle)"),
    ("mp_encourager", "data/p02_luigi_LZ.bin", 18, True, "encourager (boucle)"),
    ("mp_lever_la_main", "data/bmap_p02motion.bin", 6, False, "lève une main (bref)"),
    ("mp_attente", "data/p02_luigi_LZ.bin", 0, True, "attente debout (boucle)"),
    ("mp_regarde_autour", "data/p02_luigi_LZ.bin", 16, True, "regarde autour (boucle)"),
    ("mp_marche", "data/p02_luigi_LZ.bin", 1, True, "marche (boucle)"),
    ("mp_course", "data/p02_luigi_LZ.bin", 2, True, "course (boucle)"),
    ("mp_se_retourner", "data/p02_luigi_LZ.bin", 5, False, "pivote pour faire face, bras ouverts"),
    ("mp_saut_de", "data/p02_luigi_LZ.bin", 3, False, "saut pour frapper le dé"),
    ("mp_saut_de_reception", "data/p02_luigi_LZ.bin", 4, False, "retombée après le dé"),
    ("mp_salto", "data/p02_luigi_LZ.bin", 12, False, "salto avant"),
    ("mp_s_asseoir", "data/p02_luigi_LZ.bin", 11, False, "élan puis s'assoit"),
    ("mp_assis", "data/p02_luigi_LZ.bin", 14, True, "assis (boucle)"),
    ("mp_assis_adosse", "data/p02_luigi_LZ.bin", 15, True, "assis adossé (boucle)"),
    ("mp_assis_regarde", "data/p02_luigi_LZ.bin", 17, True, "assis, regarde autour (boucle)"),
    ("mp_se_relever", "data/p02_luigi_LZ.bin", 13, False, "se relève"),
]
COMMUNS = ["skl_root", "spin", "face", "arm_l1", "arm_l2", "wrist_l1", "arm_r1", "arm_r2", "wrist_r1",
           "leg_l1", "leg_l2", "ankle_l1", "leg_r1", "leg_r2", "ankle_r1"]
SM = {"face": "face_1"}
Illisible = sm64ds.Illisible

def paquet(d):
    n, = struct.unpack_from("<I", d, 0)
    if not (0 < n < 4000) or 4 + 8 * n > len(d): raise ValueError("pas un paquet")
    sortie = []
    for i in range(n):
        o, t = struct.unpack_from("<II", d, 4 + 8 * i)
        if o + 4 + t > len(d): raise ValueError("élément hors du paquet")
        x = d[o + 4:o + 4 + t]
        if x[:1] == b"\x10":
            try: x = sm64ds.lz77(x)
            except Exception: pass
        sortie.append(x)
    return sortie

def lire_paquet(cart, chemin):
    d = cart.brut(chemin)
    try: return paquet(d)
    except (ValueError, struct.error): return paquet(sm64ds.lz77(d))

def squelette(m):
    if m[:4] != b"HBDF" or m[8:12] != b"MDLF": raise Illisible("pas un modèle HBDF")
    sb = m.index(b"STRB") + 8
    p, objets = m.index(b"OBJO"), []
    while m[p:p + 4] == b"OBJO" and len(objets) < 256:
        taille, = struct.unpack_from("<I", m, p + 4)
        _, parent, _, nom = struct.unpack_from("<hhII", m, p + 8)
        v = struct.unpack_from("<9i", m, p + 20)
        objets.append({"nom": m[sb + nom:m.index(b"\0", sb + nom)].decode("latin-1"), "parent": parent,
                       "t": [x / 4096 for x in v[:3]], "r": [x / 65536 * 2 * math.pi for x in v[3:6]], "s": [x / 4096 for x in v[6:]]})
        p += 8 + taille
    return objets

def courbe(d, o):
    ty, = struct.unpack_from("<I", d, o)
    if ty == 3: return struct.unpack_from("<i", d, o + 12)[0]
    if ty != 6: raise Illisible(f"courbe de type {ty}")
    cles, p = [], o + 8
    while len(cles) < 10000:
        k, v, m0, m1 = struct.unpack_from("<Hhhh", d, p); p += 8
        if k >> 12 == 0: break
        cles.append((k & 0xFFF, 32 * v, 32 * m0, 32 * m1))
    return cles

def valeur(c, f):
    if isinstance(c, int): return c
    if not c: return 0
    if f <= c[0][0]: return c[0][1]
    for (f0, v0, m0, m1), (f1, v1, _, _) in zip(c, c[1:]):     
        if f <= f1:
            s = (f - f0) / ((f1 - f0) or 1); s2, s3 = s * s, s * s * s
            return (2 * s3 - 3 * s2 + 1) * v0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * v1 + (s3 - s2) * m1
    return c[-1][1]

def animation(d):
    if d[:4] != b"HBDF" or d[8:12] != b"ANMF": raise Illisible("pas une animation HBDF")
    ni, = struct.unpack_from("<I", d, 0x10); nobj, = struct.unpack_from("<I", d, 0x18)
    if ni >> 12 > 5000 or nobj > 256: raise Illisible("animation HBDF abîmée")
    pistes = {}
    for i in range(nobj):
        a, nom = struct.unpack_from("<II", d, 0x20 + 8 * i)
        nom = d[0x20 + nom:d.index(b"\0", 0x20 + nom)].decode("latin-1")
        canaux = {}
        for k in range((a >> 4) & 15):
            pos, _, canal = struct.unpack_from("<HBB", d, 0x20 + 4 * ((a >> 12) + k))
            canaux[canal] = courbe(d, 0x20 + pos)
        pistes[nom] = canaux
    return ni >> 12, pistes

def qmul(a, b):
    ax, ay, az, aw = a; bx, by, bz, bw = b
    return [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx,
            aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz]

def qinv(q): return [-q[0], -q[1], -q[2], q[3]]

def qaxe(axe, a):
    q = [0.0, 0.0, 0.0, math.cos(a / 2)]; q["xyz".index(axe)] = math.sin(a / 2); return q

def qeuler(r):
    q = [0.0, 0.0, 0.0, 1.0]
    for axe in "zyx":            
        q = qmul(q, qaxe(axe, r["xyz".index(axe)]))
    return q

def qrot(q, v):
    return qmul(qmul(q, [v[0], v[1], v[2], 0.0]), qinv(q))[:3]

def poses_mp(objets, ni, pistes):
    images = []
    for f in range(ni):
        monde = {}

        def calc(i, profondeur=0):
            ob = objets[i]
            if ob["nom"] in monde: return monde[ob["nom"]]
            if profondeur > 64: raise Illisible("squelette en boucle")
            c = pistes.get(ob["nom"], {})
            t = [valeur(c[k], f) / 4096 if k in c else ob["t"][k] for k in range(3)]
            r = [valeur(c[k], f) / 65536 * 2 * math.pi if k in c else ob["r"][k - 3] for k in range(3, 6)]
            s = [valeur(c[k], f) / 4096 if k in c else ob["s"][k - 6] for k in range(6, 9)]
            q = qeuler(r)
            if 0 <= ob["parent"] < len(objets):
                pp, pq, _, ps = calc(ob["parent"], profondeur + 1)
                p = [a + b for a, b in zip(pp, qrot(pq, [t[k] * ps[k] for k in range(3)]))]
                qm = qmul(pq, q); sm = [ps[k] * s[k] for k in range(3)]
            else:
                p, qm, sm = t, q, s
            monde[ob["nom"]] = (p, qm, q, sm)
            return monde[ob["nom"]]
        for i in range(len(objets)): calc(i)
        images.append(monde)
    return images

def ajouter_clips(j, binaire, octets):
    cart = sm64ds.NDS(octets)
    objets = squelette(lire_paquet(cart, MODELE[0])[MODELE[1]])
    j["animations"] = [a for a in j.get("animations", []) if not a["name"].startswith("mp_")]
    noeud = {x["name"]: i for i, x in enumerate(j["nodes"])}
    n = j["nodes"]; parent = {c: i for i, x in enumerate(n) for c in x.get("children", [])}
    G = {}

    def g(i):
        if i not in G:
            r = n[i].get("rotation", [0, 0, 0, 1])
            G[i] = qmul(g(parent[i]), r) if i in parent else r
        return G[i]
    repos = {ob["nom"]: ob for ob in objets}
    if any(nom not in repos or SM.get(nom, nom) not in noeud for nom in COMMUNS): raise Illisible("squelettes différents")
    p_mp0 = poses_mp(objets, 1, {})[0]
    k_hanches = j["nodes"][noeud["skl_root"]]["translation"][1] / p_mp0["skl_root"][0][1]

    def accesseur(valeurs, type_):
        while len(binaire) % 4: binaire.append(0)
        plat = [x for v in valeurs for x in (v if isinstance(v, list) else [v])]
        j["bufferViews"].append({"buffer": 0, "byteOffset": len(binaire), "byteLength": 4 * len(plat)})
        binaire.extend(struct.pack("<%df" % len(plat), *plat))
        a = {"bufferView": len(j["bufferViews"]) - 1, "componentType": 5126, "count": len(valeurs), "type": type_}
        if type_ == "SCALAR": a["min"], a["max"] = [min(valeurs)], [max(valeurs)]
        j["accessors"].append(a)
        return len(j["accessors"]) - 1

    cache = {}
    for nom_clip, chemin, indice, boucle, geste in CLIPS:
        if chemin not in cache: cache[chemin] = lire_paquet(cart, chemin)
        ni, pistes = animation(cache[chemin][indice])
        if not ni: raise Illisible(nom_clip)
        poses = poses_mp(objets, ni, pistes)
        temps = accesseur([f / CADENCE for f in range(ni)], "SCALAR")
        canaux, echant = [], []
        for nom in COMMUNS:
            ism = noeud[SM.get(nom, nom)]
            r0 = j["nodes"][ism].get("rotation", [0, 0, 0, 1])
            gp = g(parent[ism])
            rot = []
            for pose in poses:
                if nom == "skl_root": lmp = pose[nom][1]
                else: lmp = qmul(qinv(pose[objets[repos[nom]["parent"]]["nom"]][1]), pose[nom][1])
                q = qmul(qmul(qmul(qinv(gp), lmp), gp), r0)
                if rot and sum(a * b for a, b in zip(q, rot[-1])) < 0: q = [-a for a in q]
                rot.append(q)
            echant.append({"input": temps, "output": accesseur(rot, "VEC4"), "interpolation": "LINEAR"})
            canaux.append({"sampler": len(echant) - 1, "target": {"node": ism, "path": "rotation"}})
        t0 = j["nodes"][noeud["skl_root"]]["translation"]
        trans = [[t0[k] + (pose["skl_root"][0][k] - p_mp0["skl_root"][0][k]) * k_hanches for k in range(3)] for pose in poses]
        echant.append({"input": temps, "output": accesseur(trans, "VEC3"), "interpolation": "LINEAR"})
        canaux.append({"sampler": len(echant) - 1, "target": {"node": noeud["skl_root"], "path": "translation"}})
        j["animations"].append({"name": nom_clip, "channels": canaux, "samplers": echant,
                                "extras": {"source": f"{chemin}#{indice}", "images": ni, "cadence": CADENCE,
                                           "boucle": boucle, "squelette": "Mario Party DS (transposé)", "geste": geste}})
