import json, math, struct, zlib

TAILLE_MAX = 64 * 1024 * 1024      
CADENCE = 30
CROUPIER = "MG/luigi_d.bmd"
JOUEUR = "ARCHIVE/arc0.narc/data/player/luigi_model.bmd"
P0, P1 = "ARCHIVE/arc0.narc/data/player/", "data/player/"
BOUCLES = {"L_wait", "L_walk", "L_run"}        
CLIPS = [("MG/luigi_d_" + n + ".bca", CROUPIER) for n in
         ("wait", "shuffle_start", "shuffle", "deal_start", "deal", "deal_wait", "deal_end", "deal_end2",
          "throw", "win_start", "win", "win_end", "lose")] + \
        [(P0 + n + ".bca", JOUEUR) for n in
         ("L_wait", "L_walk", "L_run", "turn", "brake", "brend", "jump", "jmped", "land", "win", "lose", "star_get",
          "soft_step")] + \
        [(P1 + n + ".bca", JOUEUR) for n in
         ("L_op_nod", "L_op_turn", "L_ed_cap_off", "L_ed_cap_off_wait", "L_ed_amazed", "L_ed_look_mario",
          "L_ed_wait", "L_entry_wait", "L_entry_wait_end", "L_first_change")]
NOMS_MATERIAUX = {"mat_luigi_d_body": "corps", "mat_luigi_d_eri": "col", "mat_luigi_d_eye": "yeux", "mat_ball": "balle", "mat_card": "cartes"}

class Illisible(Exception):
    pass

def crc16(d):
    c = 0xFFFF
    for o in d:
        c ^= o
        for _ in range(8): c = (c >> 1) ^ 0xA001 if c & 1 else c >> 1
    return c

def entete(d):
    if len(d) < 0x160: raise Illisible("trop court")
    return {"titre": d[:12].rstrip(b"\0").decode("latin-1", "replace"), "code": d[12:16].decode("latin-1", "replace"),
            "region": chr(d[15]) if 32 < d[15] < 127 else "?", "version": d[0x1E],
            "crc_ok": crc16(d[:0x15E]) == struct.unpack_from("<H", d, 0x15E)[0]}

def lz77(d):
    if d[:4] == b"LZ77": d = d[4:]
    if not d or d[0] != 0x10: raise Illisible("pas du LZ77")
    n = d[1] | d[2] << 8 | d[3] << 16
    if n > TAILLE_MAX: raise Illisible("trop gros")
    out, i = bytearray(), 4
    while len(out) < n:
        drapeaux = d[i]; i += 1
        for b in range(8):
            if len(out) >= n: break
            if drapeaux & (0x80 >> b):
                x = d[i] << 8 | d[i + 1]; i += 2
                long, dist = (x >> 12) + 3, (x & 0xFFF) + 1
                if dist > len(out): raise Illisible("LZ77 abîmé")
                for _ in range(long): out.append(out[-dist])
            else:
                out.append(d[i]); i += 1
    return bytes(out[:n])

class NDS:
    def __init__(self, octets, prefixe_racine=""):
        self.r, self.base = octets, 0
        if self.r[:4] == b"NARC":   
            p, blocs = 16, {}
            while p + 8 <= len(self.r) and len(blocs) < 8:
                t = struct.unpack_from("<I", self.r, p + 4)[0]
                if t < 8: raise Illisible("NARC abîmé")
                blocs[self.r[p:p + 4]] = p; p += t
            if not {b"BTAF", b"BTNF", b"GMIF"} <= set(blocs): raise Illisible("NARC incomplet")
            n, = struct.unpack_from("<I", self.r, blocs[b"BTAF"] + 8)
            fat, fat_t, fnt, self.base = blocs[b"BTAF"] + 12, 8 * n, blocs[b"BTNF"] + 8, blocs[b"GMIF"] + 8
        else:
            fnt, _, fat, fat_t = struct.unpack_from("<4I", self.r, 0x40)
        if fat_t > len(self.r) or fat + fat_t > len(self.r): raise Illisible("table des fichiers hors du fichier")
        self.fat = [struct.unpack_from("<II", self.r, fat + 8 * i) for i in range(fat_t // 8)]
        self.fichiers, vus = {}, set()

        def dossier(did, prefixe, profondeur):
            if did in vus or profondeur > 16 or len(self.fichiers) > 100000: raise Illisible("dossiers en boucle")
            vus.add(did)
            sous, premier, _ = struct.unpack_from("<IHH", self.r, fnt + 8 * (did & 0xFFF))
            p, fid = fnt + sous, premier
            while True:
                t = self.r[p]; p += 1
                if t == 0: break
                nom = self.r[p:p + (t & 0x7F)].decode("latin-1"); p += t & 0x7F
                if t & 0x80:
                    sid, = struct.unpack_from("<H", self.r, p); p += 2
                    dossier(sid, prefixe + nom + "/", profondeur + 1)
                else:
                    self.fichiers[prefixe + nom] = fid; fid += 1
        dossier(0xF000, prefixe_racine, 0)

    def brut(self, chemin):
        i = self.fichiers.get(chemin)
        if i is None or i >= len(self.fat): raise Illisible("absent : " + chemin)
        debut, fin = self.fat[i]
        if not self.base + debut <= self.base + fin <= len(self.r): raise Illisible("hors du fichier : " + chemin)
        return self.r[self.base + debut:self.base + fin]

    def lire(self, chemin):
        d = self.brut(chemin)
        return lz77(d) if d[:4] == b"LZ77" else d

class Cartouche:
    def __init__(self, octets):
        self.n = NDS(octets)
        self.sous = {c: NDS(self.n.lire(c), c + "/") for c in self.n.fichiers if c.endswith(".narc")}

    def lire(self, c):
        for a, s in self.sous.items():
            if c.startswith(a + "/"): return s.lire(c)
        return self.n.lire(c)

def _cstr(d, o):
    return d[o:d.index(b"\0", o)].decode("latin-1")

def _mat_trs(t, r, s):
    cx, sx, cy, sy, cz, sz = math.cos(r[0]), math.sin(r[0]), math.cos(r[1]), math.sin(r[1]), math.cos(r[2]), math.sin(r[2])
    R = [[cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx],
         [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx],
         [-sy, cy * sx, cy * cx]]
    return [R[0][0] * s[0], R[0][1] * s[1], R[0][2] * s[2], t[0],
            R[1][0] * s[0], R[1][1] * s[1], R[1][2] * s[2], t[1],
            R[2][0] * s[0], R[2][1] * s[1], R[2][2] * s[2], t[2], 0, 0, 0, 1]

def _produit(a, b):
    return [sum(a[i * 4 + k] * b[k * 4 + j] for k in range(4)) for i in range(4) for j in range(4)]

def _inverse(m):
    a, b, c, d, e, f, g, h, i = m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]
    det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)
    if abs(det) < 1e-12: raise Illisible("os sans inverse")
    inv = [(e * i - f * h) / det, (c * h - b * i) / det, (b * f - c * e) / det,
           (f * g - d * i) / det, (a * i - c * g) / det, (c * d - a * f) / det,
           (d * h - e * g) / det, (b * g - a * h) / det, (a * e - b * d) / det]
    t = [m[3], m[7], m[11]]
    tt = [-(inv[0] * t[0] + inv[1] * t[1] + inv[2] * t[2]), -(inv[3] * t[0] + inv[4] * t[1] + inv[5] * t[2]),
          -(inv[6] * t[0] + inv[7] * t[1] + inv[8] * t[2])]
    return inv[0:3] + [tt[0]] + inv[3:6] + [tt[1]] + inv[6:9] + [tt[2]] + [0, 0, 0, 1]

def _quaternion(m):
    cols = [[m[0], m[4], m[8]], [m[1], m[5], m[9]], [m[2], m[6], m[10]]]
    n = [math.sqrt(sum(x * x for x in c)) or 1 for c in cols]
    m00, m10, m20 = (x / n[0] for x in cols[0]); m01, m11, m21 = (x / n[1] for x in cols[1]); m02, m12, m22 = (x / n[2] for x in cols[2])
    tr = m00 + m11 + m22
    if tr > 0:
        s = math.sqrt(tr + 1) * 2; q = ((m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, s / 4)
    elif m00 > m11 and m00 > m22:
        s = math.sqrt(1 + m00 - m11 - m22) * 2; q = (s / 4, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s)
    elif m11 > m22:
        s = math.sqrt(1 + m11 - m00 - m22) * 2; q = ((m01 + m10) / s, s / 4, (m12 + m21) / s, (m02 - m20) / s)
    else:
        s = math.sqrt(1 + m22 - m00 - m11) * 2; q = ((m02 + m20) / s, (m12 + m21) / s, s / 4, (m10 - m01) / s)
    l = math.sqrt(sum(c * c for c in q))
    return [c / l for c in q]

def _rgb555(v):
    return ((v & 31) << 3, (v >> 5 & 31) << 3, (v >> 10 & 31) << 3)

def texture(d, tex, pal):
    w, h, params, o, n = tex["largeur"], tex["hauteur"], tex["params"], tex["donnees"], tex["taille"]
    fmt, transparent = params >> 26 & 7, bool(params >> 29 & 1)
    if w * h > 1024 * 1024 or o + n > len(d): raise Illisible("texture hors du fichier")
    couleurs = [_rgb555(struct.unpack_from("<H", d, pal["donnees"] + 2 * k)[0]) for k in range(pal["taille"] // 2)] if pal else []
    px = bytearray(w * h * 4)

    def poser(i, c, a):
        px[4 * i:4 * i + 4] = bytes((*c, a))

    def couleur(k):
        return couleurs[k] if k < len(couleurs) else (0, 0, 0)
    if fmt in (2, 3, 4):
        bits = {2: 2, 3: 4, 4: 8}[fmt]
        for i in range(w * h):
            k = d[o + i * bits // 8] >> (i * bits % 8) & ((1 << bits) - 1)
            poser(i, couleur(k), 0 if transparent and k == 0 else 255)
    elif fmt in (1, 6):
        ib, ab = (5, 3) if fmt == 1 else (3, 5)
        for i in range(w * h):
            v = d[o + i]; k, a = v & ((1 << ib) - 1), v >> ib
            poser(i, couleur(k), a * 255 // ((1 << ab) - 1))
    elif fmt == 7:
        for i in range(w * h):
            v = struct.unpack_from("<H", d, o + 2 * i)[0]; poser(i, _rgb555(v), 255 if v & 0x8000 else 0)
    else:
        raise Illisible("format de texture %d" % fmt)
    return w, h, bytes(px)

def png(w, h, rgba):
    def bloc(t, c): return struct.pack(">I", len(c)) + t + c + struct.pack(">I", zlib.crc32(t + c) & 0xFFFFFFFF)
    lignes = b"".join(b"\0" + rgba[y * w * 4:(y + 1) * w * 4] for y in range(h))
    return b"\x89PNG\r\n\x1a\n" + bloc(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)) + bloc(b"IDAT", zlib.compress(lignes, 9)) + bloc(b"IEND", b"")

PARAMS_GX = {0x10: 1, 0x11: 0, 0x12: 1, 0x13: 1, 0x14: 1, 0x15: 0, 0x16: 16, 0x17: 12, 0x18: 16, 0x19: 12, 0x1A: 9, 0x1B: 3,
             0x1C: 3, 0x20: 1, 0x21: 1, 0x22: 1, 0x23: 2, 0x24: 1, 0x25: 1, 0x26: 1, 0x27: 1, 0x28: 1, 0x29: 1, 0x2A: 1,
             0x2B: 1, 0x30: 1, 0x31: 1, 0x32: 1, 0x33: 1, 0x34: 32, 0x40: 1, 0x41: 0, 0x50: 1, 0x60: 1, 0x70: 3, 0x71: 2, 0x72: 1}

def _s10(v): return v - 1024 if v & 512 else v

def liste_gx(d, o, n):
    fin, mots = o + n, []
    if fin > len(d): raise Illisible("liste d'affichage hors du fichier")
    while o + 4 <= fin:
        cmds = d[o:o + 4]; o += 4
        for c in cmds:
            if c == 0: continue
            k = PARAMS_GX.get(c)
            if k is None: raise Illisible("commande GX %02x" % c)
            mots.append((c, struct.unpack_from("<%dI" % k, d, o) if k else ())); o += 4 * k
    tris, mtx, nor, uv, pos, prim, bande = [], 0, (0, 1, 0), (0, 0), [0, 0, 0], 0, []

    def sommet():
        bande.append((mtx, tuple(pos), nor, uv))
        n_ = len(bande)
        if prim == 0 and n_ % 3 == 0: tris.append(bande[-3:])
        elif prim == 1 and n_ % 4 == 0: q = bande[-4:]; tris.extend([[q[0], q[1], q[2]], [q[0], q[2], q[3]]])
        elif prim == 2 and n_ >= 3: tris.append(bande[-3:] if n_ % 2 else [bande[-2], bande[-3], bande[-1]])
        elif prim == 3 and n_ >= 4 and n_ % 2 == 0: q = bande[-4:]; tris.extend([[q[0], q[1], q[3]], [q[0], q[3], q[2]]])
    for c, p in mots:
        if c == 0x14: mtx = p[0] & 31
        elif c == 0x21:
            nx, ny, nz = _s10(p[0] & 1023) / 512, _s10(p[0] >> 10 & 1023) / 512, _s10(p[0] >> 20 & 1023) / 512
            nor = (nx, ny, nz)
        elif c == 0x22:
            s_, t_ = struct.unpack("<hh", struct.pack("<I", p[0])); uv = (s_ / 16, t_ / 16)
        elif c == 0x23:
            x, y = struct.unpack("<hh", struct.pack("<I", p[0])); z = struct.unpack("<h", struct.pack("<I", p[1])[:2])[0]
            pos = [x, y, z]; sommet()
        elif c == 0x24: pos = [_s10(p[0] & 1023) << 6, _s10(p[0] >> 10 & 1023) << 6, _s10(p[0] >> 20 & 1023) << 6]; sommet()
        elif c in (0x25, 0x26, 0x27):
            a, b = struct.unpack("<hh", struct.pack("<I", p[0]))
            if c == 0x25: pos = [a, b, pos[2]]
            elif c == 0x26: pos = [a, pos[1], b]
            else: pos = [pos[0], a, b]
            sommet()
        elif c == 0x28:
            pos = [pos[0] + _s10(p[0] & 1023), pos[1] + _s10(p[0] >> 10 & 1023), pos[2] + _s10(p[0] >> 20 & 1023)]; sommet()
        elif c == 0x40: prim, bande = p[0] & 3, []
        elif c == 0x41: bande = []
    return tris

def lire_bmd(d):
    if len(d) < 0x34: raise Illisible("BMD trop court")
    decalage, nb, ob, ndl, odl, nt, ot, npal, opal, nm, om, otr = struct.unpack_from("<12I", d, 0)
    if decalage > 8 or max(nb, ndl, nt, npal, nm) > 512 or max(ob + 0x40 * nb, odl + 8 * ndl, ot + 0x14 * nt, opal + 0x10 * npal, om + 0x30 * nm) > len(d):
        raise Illisible("BMD abîmé")
    os_ = []
    for i in range(nb):
        o = ob + 0x40 * i
        _, no, par = struct.unpack_from("<IIh", d, o)
        s = [x / 4096 for x in struct.unpack_from("<3i", d, o + 0x10)]
        r = [x / 4096 * 2 * math.pi for x in struct.unpack_from("<3h", d, o + 0x1C)]
        t = [x / 4096 for x in struct.unpack_from("<3i", d, o + 0x24)]
        n, omat, odl_ = struct.unpack_from("<3I", d, o + 0x30)
        os_.append({"nom": _cstr(d, no), "parent": i + par if par else None, "t": t, "r": r, "s": s,
                    "paires": list(zip(d[omat:omat + n], d[odl_:odl_ + n]))})
        if os_[-1]["parent"] is not None and not 0 <= os_[-1]["parent"] < i: raise Illisible("parent d'os")
    textures = []
    for i in range(nt):
        no, od, n, w, h, params = struct.unpack_from("<IIIHHI", d, ot + 0x14 * i)
        textures.append({"nom": _cstr(d, no), "donnees": od, "taille": n, "largeur": w, "hauteur": h, "params": params})
    palettes = []
    for i in range(npal):
        no, od, n = struct.unpack_from("<III", d, opal + 0x10 * i)
        palettes.append({"nom": _cstr(d, no), "donnees": od, "taille": min(n, 512)})
    materiaux = []
    for i in range(nm):
        v = struct.unpack_from("<IiiiiHHiiIIII", d, om + 0x30 * i)
        materiaux.append({"nom": _cstr(d, v[0]), "texture": v[1], "palette": v[2], "echelle": (v[3] / 4096, v[4] / 4096),
                          "params": v[9], "polygone": v[10]})
    listes = []
    for i in range(ndl):
        _, oi = struct.unpack_from("<II", d, odl + 8 * i)
        ntr, otr_, taille, odata = struct.unpack_from("<4I", d, oi)
        if ntr > 32: raise Illisible("liste d'affichage")
        os_de = [struct.unpack_from("<H", d, otr + 2 * k)[0] for k in d[otr_:otr_ + ntr]]
        listes.append({"os": os_de, "triangles": liste_gx(d, odata, taille)})
    return {"echelle": 1 << decalage, "os": os_, "textures": textures, "palettes": palettes, "materiaux": materiaux, "listes": listes}

def bmd_vers_glb(d, source):
    M = lire_bmd(d)
    monde = []
    for o in M["os"]:
        m = _mat_trs(o["t"], o["r"], o["s"])
        monde.append(_produit(monde[o["parent"]], m) if o["parent"] is not None else m)
    binaire, vues, accesseurs = bytearray(), [], []

    def vue(octets, cible=None):
        while len(binaire) % 4: binaire.append(0)
        vues.append({"buffer": 0, "byteOffset": len(binaire), "byteLength": len(octets), **({"target": cible} if cible else {})})
        binaire.extend(octets)
        return len(vues) - 1

    def accesseur(valeurs, type_, comp, cible=None, bornes=False):
        n = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}[type_]
        fmt = {5126: "f", 5121: "B", 5123: "H"}[comp]
        plat = [x for v in valeurs for x in (v if n > 1 else [v])]
        a = {"bufferView": vue(struct.pack("<%d%s" % (len(plat), fmt), *plat), cible), "componentType": comp, "count": len(valeurs), "type": type_}
        if bornes: a["min"] = [min(v[i] for v in valeurs) for i in range(n)]; a["max"] = [max(v[i] for v in valeurs) for i in range(n)]
        accesseurs.append(a)
        return len(accesseurs) - 1

    prims, ordre = {}, []
    for o in M["os"]:
        for mi, li in o["paires"]:
            if mi >= len(M["materiaux"]) or li >= len(M["listes"]): raise Illisible("paire matériau / liste")
            if mi not in prims: prims[mi] = []; ordre.append(mi)
            prims[mi].append(M["listes"][li])
    images, gltf_tex, gltf_mat, primitifs, img_de = [], [], [], [], {}
    for mi in ordre:
        mat = M["materiaux"][mi]
        tx = M["textures"][mat["texture"]] if 0 <= mat["texture"] < len(M["textures"]) else None
        if tx is None: raise Illisible("matériau sans texture")
        if tx["nom"] not in img_de:
            pal = M["palettes"][mat["palette"]] if 0 <= mat["palette"] < len(M["palettes"]) else None
            w, h, rgba = texture(d, tx, pal)
            img_de[tx["nom"]] = len(images)
            images.append({"name": tx["nom"] + ".png", "mimeType": "image/png", "bufferView": vue(png(w, h, rgba))})
        miroir = bool(mat["params"] >> 18 & 3)
        gltf_tex.append({"source": img_de[tx["nom"]], "sampler": 1 if miroir else 0})
        gltf_mat.append({"name": NOMS_MATERIAUX.get(mat["nom"], mat["nom"]), "doubleSided": mat["polygone"] >> 6 & 3 == 3,
                         "pbrMetallicRoughness": {"baseColorTexture": {"index": len(gltf_tex) - 1}, "metallicFactor": 0, "roughnessFactor": 1}})
        cles, pos, nor, uv, jt, idx = {}, [], [], [], [], []
        es, et = mat["echelle"]
        for liste in prims[mi]:
            for tri in liste["triangles"]:
                for mtx, p, n_, st in tri:
                    if mtx >= len(liste["os"]) or liste["os"][mtx] >= len(monde): raise Illisible("matrice")
                    b = liste["os"][mtx]; m = monde[b]
                    x, y, z = (v * M["echelle"] / 4096 for v in p)     
                    wp = [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]]
                    wn = [m[0] * n_[0] + m[1] * n_[1] + m[2] * n_[2], m[4] * n_[0] + m[5] * n_[1] + m[6] * n_[2], m[8] * n_[0] + m[9] * n_[1] + m[10] * n_[2]]
                    l = math.sqrt(sum(c * c for c in wn)) or 1
                    s_ = (round(wp[0], 6), round(wp[1], 6), round(wp[2], 6), round(wn[0] / l, 5), round(wn[1] / l, 5), round(wn[2] / l, 5),
                          round(st[0] / tx["largeur"] * es, 6), round(st[1] / tx["hauteur"] * et, 6), b)
                    if s_ not in cles:
                        cles[s_] = len(pos); pos.append(list(s_[0:3])); nor.append(list(s_[3:6])); uv.append(list(s_[6:8])); jt.append([b, 0, 0, 0])
                    idx.append(cles[s_])
        primitifs.append({"attributes": {"POSITION": accesseur(pos, "VEC3", 5126, 34962, True), "NORMAL": accesseur(nor, "VEC3", 5126, 34962),
                                         "TEXCOORD_0": accesseur(uv, "VEC2", 5126, 34962), "JOINTS_0": accesseur(jt, "VEC4", 5121, 34962),
                                         "WEIGHTS_0": accesseur([[1, 0, 0, 0]] * len(pos), "VEC4", 5126, 34962)},
                          "indices": accesseur(idx, "SCALAR", 5123, 34963), "material": len(gltf_mat) - 1})
    noeuds = []
    for i, o in enumerate(M["os"]):
        n = {"name": o["nom"]}
        if o["t"] != [0, 0, 0]: n["translation"] = [round(x, 7) for x in o["t"]]
        q = _quaternion(_mat_trs([0, 0, 0], o["r"], [1, 1, 1]))
        if any(abs(a - b) > 1e-7 for a, b in zip(q, [0, 0, 0, 1])): n["rotation"] = q
        if o["s"] != [1, 1, 1]: n["scale"] = [round(x, 7) for x in o["s"]]
        enfants = [k for k, x in enumerate(M["os"]) if x["parent"] == i]
        if enfants: n["children"] = enfants
        noeuds.append(n)
    racine = next(i for i, o in enumerate(M["os"]) if o["parent"] is None)
    ibm = [[_inverse(m)[r * 4 + c] for c in range(4) for r in range(4)] for m in monde]
    base = len(noeuds)
    noeuds.append({"name": "luigi-croupier", "mesh": 0, "skin": 0})
    noeuds.append({"name": "Luigi", "children": [racine, base]})
    gltf = {
        "asset": {"version": "2.0", "generator": "py_modules/sm64ds.py (SteamU, import)", "extras": {"source": source}},
        "scene": 0, "scenes": [{"name": "Luigi", "nodes": [base + 1]}], "nodes": noeuds,
        "meshes": [{"name": "luigi-croupier", "primitives": primitifs}],
        "skins": [{"name": "squelette", "joints": list(range(len(M["os"]))), "skeleton": racine,
                   "inverseBindMatrices": accesseur(ibm, "MAT4", 5126)}],
        "materials": gltf_mat, "textures": gltf_tex, "images": images,
        "samplers": [{"wrapS": 10497, "wrapT": 10497}, {"wrapS": 33648, "wrapT": 33648}],
        "accessors": accesseurs, "bufferViews": vues, "buffers": [{"byteLength": 0}],
    }
    return gltf, binaire

def os_du_bmd(d):
    _, nb, off = struct.unpack_from("<III", d, 0)
    if nb > 512 or off + 0x40 * nb > len(d): raise Illisible("BMD abîmé")
    return [_cstr(d, struct.unpack_from("<I", d, off + 0x40 * i + 4)[0]) for i in range(nb)]

def decoder_bca(d):
    nb, ni, boucle, o_s, o_r, o_t, o_d = struct.unpack_from("<HHI4I", d, 0)
    if ni > 10000 or nb > 512: raise Illisible("BCA abîmé")
    pistes = []
    for b in range(nb):
        canaux = []
        for c in range(9):
            demi, varie, debut = struct.unpack_from("<BBH", d, o_d + 36 * b + 4 * c)
            if c < 3: lire = lambda i: struct.unpack_from("<i", d, o_s + 4 * i)[0] / 4096
            elif c < 6: lire = lambda i: struct.unpack_from("<h", d, o_r + 2 * i)[0] / 4096 * 2 * math.pi
            else: lire = lambda i: struct.unpack_from("<i", d, o_t + 4 * i)[0] / 4096
            if not varie:
                canaux.append([lire(debut)] * ni); continue
            if not demi:
                canaux.append([lire(debut + f) for f in range(ni)]); continue
            n = (ni + 1) // 2          
            vals = [lire(debut + k) for k in range(n)]
            serie = []
            for f in range(ni):
                k = f >> 1
                if f & 1 and k + 1 < n:
                    a, b2 = vals[k], vals[k + 1]
                    if c in (3, 4, 5):     
                        b2 = a + (b2 - a + math.pi) % (2 * math.pi) - math.pi
                    serie.append((a + b2) / 2)
                else:
                    serie.append(vals[k])
            canaux.append(serie)
        pistes.append(canaux)
    return ni, bool(boucle), pistes

def quat_zyx(rx, ry, rz):
    cx, sx, cy, sy, cz, sz = math.cos(rx / 2), math.sin(rx / 2), math.cos(ry / 2), math.sin(ry / 2), math.cos(rz / 2), math.sin(rz / 2)
    return [sx * cy * cz - cx * sy * sz, cx * sy * cz + sx * cy * sz, cx * cy * sz - sx * sy * cz, cx * cy * cz + sx * sy * sz]

def ajouter_clips(j, binaire, cart):
    noeud = {n["name"]: i for i, n in enumerate(j["nodes"])}
    noms_modele = {m: os_du_bmd(cart.lire(m)) for m in (CROUPIER, JOUEUR)}
    if noms_modele[CROUPIER] != [j["nodes"][i]["name"] for i in j["skins"][0]["joints"]]: raise Illisible("squelette différent du GLB")

    def accesseur(valeurs, type_):
        while len(binaire) % 4: binaire.append(0)
        plat = [x for v in valeurs for x in (v if isinstance(v, list) else [v])]
        j["bufferViews"].append({"buffer": 0, "byteOffset": len(binaire), "byteLength": 4 * len(plat)})
        binaire.extend(struct.pack("<%df" % len(plat), *plat))
        a = {"bufferView": len(j["bufferViews"]) - 1, "componentType": 5126, "count": len(valeurs), "type": type_}
        if type_ == "SCALAR": a["min"], a["max"] = [min(valeurs)], [max(valeurs)]
        j["accessors"].append(a)
        return len(j["accessors"]) - 1

    j["animations"] = []
    for chemin, modele in CLIPS:
        ni, boucle, pistes = decoder_bca(cart.lire(chemin))
        nom_clip = chemin.rsplit("/", 1)[-1][:-4]
        boucle = boucle or nom_clip in BOUCLES
        noms = noms_modele[modele]
        if len(pistes) != len(noms) or not ni: raise Illisible(chemin)
        images = list(range(ni)) + ([ni] if boucle else [])       
        temps_plein, temps_un = accesseur([f / CADENCE for f in images], "SCALAR"), None
        canaux, echant = [], []
        for b, nom in enumerate(noms):
            if nom not in noeud: continue
            p = pistes[b]
            val = lambda c, f: p[c][f % ni]
            series = {"scale": [[val(0, f), val(1, f), val(2, f)] for f in images],
                      "rotation": [quat_zyx(val(3, f), val(4, f), val(5, f)) for f in images],
                      "translation": [[val(6, f), val(7, f), val(8, f)] for f in images]}
            q = series["rotation"]                               
            for k in range(1, len(q)):
                if sum(a * c for a, c in zip(q[k], q[k - 1])) < 0: q[k] = [-a for a in q[k]]
            for chemin_trs, s in series.items():
                if all(max(abs(a - c) for a, c in zip(v, s[0])) < 1e-6 for v in s):   
                    if temps_un is None: temps_un = accesseur([0.0], "SCALAR")
                    entree, s = temps_un, s[:1]
                else:
                    entree = temps_plein
                echant.append({"input": entree, "output": accesseur(s, "VEC4" if chemin_trs == "rotation" else "VEC3"), "interpolation": "LINEAR"})
                canaux.append({"sampler": len(echant) - 1, "target": {"node": noeud[nom], "path": chemin_trs}})
        j["animations"].append({"name": nom_clip, "channels": canaux, "samplers": echant,
                                "extras": {"source": chemin, "images": ni, "cadence": CADENCE, "boucle": boucle,
                                           "squelette": modele.rsplit("/", 1)[-1]}})
    j["asset"]["extras"]["animations"] = "clips du jeu (cartouche de l'utilisateur), 30 i/s"

def glb(j, binaire):
    while len(binaire) % 4: binaire.append(0)
    j["buffers"][0]["byteLength"] = len(binaire)
    js = json.dumps(j, separators=(",", ":"), ensure_ascii=False).encode()
    js += b" " * (-len(js) % 4)
    return (struct.pack("<III", 0x46546C67, 2, 28 + len(js) + len(binaire)) + struct.pack("<II", len(js), 0x4E4F534A)
            + js + struct.pack("<II", len(binaire), 0x004E4942) + bytes(binaire))

def luigi(octets):
    cart = Cartouche(octets)
    j, binaire = bmd_vers_glb(cart.lire(CROUPIER), "Super Mario 64 DS, MG/luigi_d.bmd (cartouche de l'utilisateur) — Nintendo, usage personnel")
    ajouter_clips(j, binaire, cart)
    return glb(j, binaire)
