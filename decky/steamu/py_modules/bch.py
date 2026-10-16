import struct

def u8(d, o): return d[o]
def u16(d, o): return struct.unpack_from('<H', d, o)[0]
def s16(d, o): return struct.unpack_from('<h', d, o)[0]
def u32(d, o): return struct.unpack_from('<I', d, o)[0]
def f32(d, o): return struct.unpack_from('<f', d, o)[0]
def vec(d, o, n): return list(struct.unpack_from('<%df' % n, d, o))

def cstr(d, o):
    if not o: return None
    e = d.index(b'\0', o)
    return d[o:e].decode('latin-1')

def yaz0(d):
    import ctr
    return ctr.yaz0(d)

def sarc(d):
    assert d[:4] == b'SARC', d[:4]
    e = '<' if d[6:8] == b'\xff\xfe' else '>'
    hl, bom, fsize, doff = struct.unpack_from(e + 'HHII', d, 4)
    o = hl
    assert d[o:o + 4] == b'SFAT'
    _, n, _ = struct.unpack_from(e + 'HHI', d, o + 4)
    ents = [struct.unpack_from(e + 'IIII', d, o + 12 + 16 * i) for i in range(n)]
    o2 = o + 12 + 16 * n
    assert d[o2:o2 + 4] == b'SFNT'
    nomb = o2 + 8
    out = {}
    for h, attr, a, b in ents:
        if attr & 0x01000000:
            no = nomb + (attr & 0xffff) * 4
            nom = d[no:d.index(b'\0', no)].decode('utf-8')
        else:
            nom = '%08x' % h
        out[nom] = d[doff + a:doff + b]
    return out

def pica_commandes(d, o, mots, aligner=True):
    reg = {}
    uni = {}            
    cur_uni = 0
    fixes = {}; fix_idx = 0; fix_mots = []
    fin = o + mots * 4
    while o < fin:
        param, ent = struct.unpack_from('<II', d, o); o += 8
        rid = ent & 0xffff
        masque = (ent >> 16) & 0xf
        extra = (ent >> 20) & 0x7ff
        consec = (ent >> 31) & 1
        vals = [param] + [u32(d, o + 4 * i) for i in range(extra)]
        o += 4 * extra
        for i, v in enumerate(vals):
            r = rid + (i if consec else 0)
            if masque == 0xf:
                reg[r] = v
            else:
                anc = reg.get(r, 0)
                m = 0
                for k in range(4):
                    if masque & (1 << k): m |= 0xff << (8 * k)
                reg[r] = (anc & ~m) | (v & m)
            if r == 0x232:
                fix_idx = v & 0xf; fix_mots = []
            elif r in (0x233, 0x234, 0x235):
                fix_mots.append(v)
                if len(fix_mots) == 3: fixes[fix_idx] = float24_vec4(fix_mots); fix_mots = []
            if r == 0x2c0:
                cur_uni = v & 0x7fffffff
            elif 0x2c1 <= r <= 0x2c8:
                uni.setdefault(cur_uni, []).append(v)
        if rid == 0x23d: break
        if aligner and (o & 7): o += 4
    reg['_fixes'] = fixes
    return reg, uni

def float24(v):
    v &= 0xffffff
    if not v & 0x7fffff: return 0.0
    m = v & 0xffff; e = (v >> 16) & 0x7f; s = -1 if v >> 23 else 1
    return s * (1 + m / 65536) * 2.0 ** (e - 63)

def float24_vec4(w):
    W = w[0] >> 8
    Z = ((w[0] & 0xff) << 16) | ((w[1] >> 16) & 0xffff)
    Y = ((w[1] & 0xffff) << 8) | ((w[2] >> 24) & 0xff)
    X = w[2] & 0xffffff
    return (float24(X), float24(Y), float24(Z), float24(W))

def mots_en_vec4(mots, f32bits=True):
    fl = [struct.unpack('<f', struct.pack('<I', w))[0] for w in mots]
    out = []
    for i in range(0, len(fl) - 3, 4):
        w, z, y, x = fl[i:i + 4]
        out.append((x, y, z, w))
    return out

_ORDRE = [0, 1, 8, 9, 2, 3, 10, 11, 16, 17, 24, 25, 18, 19, 26, 27, 4, 5, 12, 13, 6, 7, 14, 15, 20, 21, 28, 29, 22, 23, 30, 31,
          32, 33, 40, 41, 34, 35, 42, 43, 48, 49, 56, 57, 50, 51, 58, 59, 36, 37, 44, 45, 38, 39, 46, 47, 52, 53, 60, 61, 54, 55, 62, 63]
_BPP = {0: 32, 1: 24, 2: 16, 3: 16, 4: 16, 5: 16, 6: 16, 7: 8, 8: 8, 9: 8, 10: 4, 11: 4, 12: 4, 13: 8}
FORMATS = {0: 'RGBA8', 1: 'RGB8', 2: 'RGBA5551', 3: 'RGB565', 4: 'RGBA4', 5: 'LA8', 6: 'HILO8', 7: 'L8', 8: 'A8',
           9: 'LA4', 10: 'L4', 11: 'A4', 12: 'ETC1', 13: 'ETC1A4'}
_ETC = [(2, 8), (5, 17), (9, 29), (13, 42), (18, 60), (24, 80), (33, 106), (47, 183)]

def taille_texture(fmt, w, h):
    return w * h * _BPP[fmt] // 8

def _etc1_bloc(blk64):
    hi = blk64 >> 32; lo = blk64 & 0xffffffff
    flip = (hi >> 0) & 1; diff = (hi >> 1) & 1
    if diff:
        def c5(v, dv):
            return v
        r1 = (hi >> 27) & 31; g1 = (hi >> 19) & 31; b1 = (hi >> 11) & 31
        dr = ((hi >> 24) & 7); dg = ((hi >> 16) & 7); db = ((hi >> 8) & 7)
        dr = dr - 8 if dr > 3 else dr; dg = dg - 8 if dg > 3 else dg; db = db - 8 if db > 3 else db
        r2, g2, b2 = r1 + dr, g1 + dg, b1 + db
        e = lambda v: ((v & 31) << 3) | ((v & 31) >> 2)
        c1 = (e(r1), e(g1), e(b1)); c2 = (e(r2), e(g2), e(b2))
    else:
        e = lambda v: (v << 4) | v
        c1 = (e((hi >> 28) & 15), e((hi >> 20) & 15), e((hi >> 12) & 15))
        c2 = (e((hi >> 24) & 15), e((hi >> 16) & 15), e((hi >> 8) & 15))
    t1 = (hi >> 5) & 7; t2 = (hi >> 2) & 7
    px = [None] * 16
    for x in range(4):
        for y in range(4):
            i = x * 4 + y
            sous = (y >= 2) if flip else (x >= 2)
            c = c2 if sous else c1
            t = _ETC[t2 if sous else t1]
            msb = (lo >> (16 + i)) & 1; lsb = (lo >> i) & 1
            m = t[1] if lsb else t[0]
            if msb: m = -m
            px[i] = tuple(max(0, min(255, k + m)) for k in c)
    return px

def decoder_texture(d, o, fmt, w, h):
    out = bytearray(w * h * 4)
    if fmt in (12, 13):
        a4 = fmt == 13
        for ty in range(0, h, 8):
            for tx in range(0, w, 8):
                for sb in range(4):
                    bx = tx + (sb & 1) * 4; by = ty + (sb >> 1) * 4
                    if a4:
                        alpha = struct.unpack_from('<Q', d, o)[0]; o += 8
                    else:
                        alpha = None
                    blk = struct.unpack_from('<Q', d, o)[0]; o += 8
                    px = _etc1_bloc(blk)
                    for x in range(4):
                        for y in range(4):
                            i = x * 4 + y
                            a = 255 if alpha is None else ((alpha >> (i * 4)) & 15) * 17
                            p = ((by + y) * w + bx + x) * 4
                            out[p:p + 4] = bytes((*px[i], a))
        return out
    bpp = _BPP[fmt]
    pos_bits = o * 8
    for ty in range(0, h, 8):
        for tx in range(0, w, 8):
            for k in range(64):
                t = _ORDRE[k]; x = tx + (t & 7); y = ty + (t >> 3)
                p = (y * w + x) * 4
                if bpp == 4:
                    byte = d[pos_bits // 8]; v = (byte >> 4) if (pos_bits & 4) else (byte & 15)
                    pos_bits += 4
                    if fmt == 10: c = (v * 17,) * 3 + (255,)
                    else: c = (255, 255, 255, v * 17)
                else:
                    b = pos_bits // 8; pos_bits += bpp
                    if fmt == 0: c = (d[b + 3], d[b + 2], d[b + 1], d[b])
                    elif fmt == 1: c = (d[b + 2], d[b + 1], d[b], 255)
                    elif fmt == 2:
                        v = u16(d, b); c = (((v >> 11) & 31) * 255 // 31, ((v >> 6) & 31) * 255 // 31, ((v >> 1) & 31) * 255 // 31, 255 * (v & 1))
                    elif fmt == 3:
                        v = u16(d, b); c = (((v >> 11) & 31) * 255 // 31, ((v >> 5) & 63) * 255 // 63, (v & 31) * 255 // 31, 255)
                    elif fmt == 4:
                        v = u16(d, b); c = (((v >> 12) & 15) * 17, ((v >> 8) & 15) * 17, ((v >> 4) & 15) * 17, (v & 15) * 17)
                    elif fmt == 5: c = (d[b + 1],) * 3 + (d[b],)
                    elif fmt == 6: c = (d[b + 1], d[b], 0, 255)
                    elif fmt == 7: c = (d[b],) * 3 + (255,)
                    elif fmt == 8: c = (255, 255, 255, d[b])
                    elif fmt == 9: c = ((d[b] >> 4) * 17,) * 3 + ((d[b] & 15) * 17,)
                out[p:p + 4] = bytes(c)
    return out

def retourner(img, w, h):
    o = bytearray(len(img)); l = w * 4
    for y in range(h): o[y * l:(y + 1) * l] = img[(h - 1 - y) * l:(h - y) * l]
    return o

def png(img, w, h):
    import zlib
    raw = b''.join(b'\0' + bytes(img[y * w * 4:(y + 1) * w * 4]) for y in range(h))
    def bloc(t, c): return struct.pack('>I', len(c)) + t + c + struct.pack('>I', zlib.crc32(t + c) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + bloc(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + \
        bloc(b'IDAT', zlib.compress(raw, 6)) + bloc(b'IEND', b'')

def relocaliser(d):
    d = bytearray(d)
    bc = d[4]
    h = struct.unpack_from('<' + ('6I' if bc >= 0x21 else '5I'), d, 8)
    if bc >= 0x21:
        cont, strs, cmds, raw, rawx, rel = h
        lens = struct.unpack_from('<6I', d, 8 + 24)
    else:
        cont, strs, cmds, raw, rel = h; rawx = 0
        lens = struct.unpack_from('<5I', d, 8 + 20)
    rel_len = lens[-1]
    adr = {0: cont, 1: strs, 2: cmds, 3: cmds, 4: raw, 5: raw, 6: raw, 7: raw | (1 << 31), 8: raw,
           9: rawx, 10: rawx, 11: rawx, 12: rawx | (1 << 31), 13: rawx}
    for i in range(0, rel_len, 4):
        v = u32(d, rel + i)
        ptr = v & 0x1ffffff
        cible = (v >> 25) & 0xf
        source = v >> 29
        if 7 < bc < 0x21 and cible >= 6: cible -= 1
        elif bc < 7 and cible >= 3: cible += 1
        if cible != 1: ptr <<= 2
        a = adr.get(source, 0) + ptr
        struct.pack_into('<I', d, a, (u32(d, a) + adr.get(cible, 0)) & 0xffffffff)
    return bytes(d), dict(contenu=cont, chaines=strs, commandes=cmds, donnees=raw, version=bc)

def dico(d, o):
    return u32(d, o), u32(d, o + 4)

def lire_metadonnees(d, ptr):
    if not ptr: return {}
    tab, n, _ = u32(d, ptr), u32(d, ptr + 4), u32(d, ptr + 8)
    out = {}
    for i in range(n):
        e = tab + i * 12
        nom = cstr(d, u32(d, e)); typ = u16(d, e + 4); cnt = u16(d, e + 6); dp = u32(d, e + 8)
        vals = []
        for k in range(cnt):
            if typ == 0: vals.append(struct.unpack_from('<i', d, dp + 4 * k)[0])
            elif typ == 1: vals.append(f32(d, dp + 4 * k))
            elif typ == 2: vals.append(cstr(d, u32(d, dp + 4 * k)))
            elif typ == 3:
                so = u32(d, dp + 4 * k); e2 = so
                while d[e2:e2 + 2] != b'\0\0': e2 += 2
                vals.append(d[so:e2].decode('utf-16-le'))
            else: vals.append(('?', typ))
        out[nom.lstrip('$') if nom else str(i)] = vals
    return out

def lire_courbe(d, o):
    debut, fin = f32(d, o), f32(d, o + 4)
    pre, post = d[o + 8], d[o + 9]
    interp, quant, n = d[o + 12], d[o + 13], u16(d, o + 14)
    vs, vo, fs, invd = vec(d, o + 16, 4)
    p = u32(d, o + 32)
    cles = []
    for _ in range(n):
        if quant == 0: f, v, i_, o_ = vec(d, p, 4); p += 16
        elif quant == 1:
            fv = u32(d, p); f = fv & 0xfff; v = (fv >> 12) & 0xfffff
            i_ = s16(d, p + 4) / 256; o_ = s16(d, p + 6) / 256; p += 8
        elif quant == 2:
            f = d[p]; v = u16(d, p + 1); sl = d[p + 3] | d[p + 4] << 8 | d[p + 5] << 16
            i_ = (((sl << 20) & 0xffffffff) - ((sl << 20) & 0x80000000) * 2) >> 20
            i_ = ((sl & 0xfff) ^ 0x800) - 0x800; o_ = (((sl >> 12) & 0xfff) ^ 0x800) - 0x800
            i_ /= 32; o_ /= 32; p += 6
        elif quant == 3: f, v, i_ = vec(d, p, 3); o_ = i_; p += 12
        elif quant == 4: f = u16(d, p) / 32; v = u16(d, p + 2); i_ = o_ = s16(d, p + 4) / 256; p += 6
        elif quant == 5:
            f = d[p]; vsl = d[p + 1] | d[p + 2] << 8 | d[p + 3] << 16
            v = vsl & 0xfff; i_ = o_ = ((((vsl >> 12) & 0xfff) ^ 0x800) - 0x800) / 32; p += 4
        elif quant == 6: f, v = vec(d, p, 2); i_ = o_ = 0; p += 8
        elif quant == 7:
            fv = u32(d, p); f = fv & 0xfff; v = (fv >> 12) & 0xfffff; i_ = o_ = 0; p += 4
        else: raise ValueError('quantification %d' % quant)
        cles.append((f * fs + debut, v * vs + vo, i_, o_))   
    return dict(debut=debut, fin=fin, pre=pre, post=post, interp=interp, quant=quant, cles=cles)

def courbe_constante(v):
    return dict(debut=0, fin=0, pre=0, post=0, interp=1, quant=-1, cles=[(0, v, 0, 0)])

def valeur_courbe(c, t):
    k = c['cles']
    if not k: return 0.0
    if len(k) == 1: return k[0][1]
    g, dr = k[0], k[-1]
    for kf in k:
        if kf[0] <= t: g = kf
        if kf[0] >= t and kf[0] < dr[0]: dr = kf
    if g[0] == dr[0]: return g[1]
    diff = t - g[0]; w = diff / (dr[0] - g[0])
    if c['interp'] == 0: return g[1]
    if c['interp'] == 1: return g[1] + (dr[1] - g[1]) * w
    r = g[1] + (g[1] - dr[1]) * (2 * w - 3) * w * w
    r += (diff * (w - 1)) * (g[3] * (w - 1) + dr[2] * w)
    return r

def lire_vecteur_anim(d, o, n):
    fl = u32(d, o); out = []
    for a in range(n):
        p = o + 4 + 4 * a
        if fl & (0x100 << a): out.append(None)
        elif fl & (1 << a): out.append(courbe_constante(f32(d, p)))
        else: out.append(lire_courbe(d, u32(d, p)))
    return out

def lire_animation(d, o, materiau=False):
    nom = cstr(d, u32(d, o))
    drapeaux, typ, ncourbes = d[o + 4], d[o + 5], u16(d, o + 6)
    nimages = f32(d, o + 8)
    tab, n = u32(d, o + 12), u32(d, o + 16)
    meta = u32(d, o + 20)
    elems = []
    for i in range(n):
        e = u32(d, tab + 4 * i)
        en = cstr(d, u32(d, e)); cible = u16(d, e + 4); prim = u16(d, e + 6)
        c = e + 8
        el = dict(nom=en, cible=cible, prim=prim)
        if prim == 4:      
            fl = u32(d, c); comps = []
            cm = 1 << 6; nm = 1 << 16
            for k in range(9):
                p = c + 4 + 4 * k
                if fl & nm: comps.append(None)
                elif fl & cm: comps.append(courbe_constante(f32(d, p)))
                else: comps.append(lire_courbe(d, u32(d, p)))
                cm <<= 1; nm <<= 1
                if cm == 1 << 12: cm <<= 1
            el['echelle'], el['rotation'], el['translation'] = comps[0:3], comps[3:6], comps[6:9]
        elif prim == 7:    
            fl = u32(d, c)
            ad = [u32(d, c + 4), u32(d, c + 8), u32(d, c + 12)]
            el['quat'] = {}
            cm, nm = 1 << 2, 1 << 5
            for k, cle in enumerate(('echelle', 'rotation', 'translation')):
                if not fl & nm:
                    p = ad[k]; cnt = 1; st = 0
                    if not fl & cm:
                        st = f32(d, p); p2 = u32(d, p + 12); cnt = u32(d, p + 16); p = p2
                    taille = 4 if k == 1 else 3
                    el['quat'][cle] = [vec(d, p + 4 * taille * j, taille) for j in range(cnt)]
                cm >>= 1; nm >>= 1
        elif prim == 9:    
            p = u32(d, c + 8 + 0); cnt = u32(d, c + 12)
            el['matrices'] = [vec(d, p + 48 * j, 12) for j in range(cnt)]
        elif prim in (0, 6):
            el['composantes'] = lire_vecteur_anim(d, c, 1)
        elif prim == 2:
            el['composantes'] = lire_vecteur_anim(d, c, 2)
        elif prim == 3:
            el['composantes'] = lire_vecteur_anim(d, c, 3)
        elif prim == 5:
            el['composantes'] = lire_vecteur_anim(d, c, 4)
        elif prim == 8:    
            debut, fin = f32(d, c), f32(d, c + 4)
            p, cnt = u32(d, c + 12), u32(d, c + 16)
            vals = [bool((d[p + j // 8] >> (j % 8)) & 1) for j in range(cnt)]
            el['booleens'] = dict(debut=debut, fin=fin, valeurs=vals)
        elems.append(el)
    a = dict(nom=nom, boucle=bool(drapeaux & 1), type=typ, images=nimages, elements=elems,
             meta=lire_metadonnees(d, meta))
    if materiau:
        tp, tn = u32(d, o + 24), u32(d, o + 28)
        a['textures'] = [cstr(d, u32(d, tp + 4 * j)) for j in range(tn)] if tp else []
    return a

def lire_bch(donnees):
    d, h = relocaliser(donnees)
    C = h['contenu']
    sec = [dico(d, C + 12 * i) for i in range(15)]
    (mod, mat, shd, tex, lut, lum, cam, fog, ask, amt, avi, ali, aca, afo, sce) = sec
    R = dict(version=h['version'], textures={}, modeles=[], anims_squelette=[], anims_materiau=[],
             anims_visibilite=[], lumieres=[], cameras=[], scenes=[], luts=[])

    for i in range(tex[1]):
        o = u32(d, tex[0] + 4 * i)
        c0, n0 = u32(d, o), u32(d, o + 4)
        fmt_b = d[o + 24]; mip = d[o + 25]
        nom = cstr(d, u32(d, o + 28))
        reg, _ = pica_commandes(d, c0, n0)
        taille = reg.get(0x82, 0); w, hh = taille >> 16, taille & 0xffff
        fmt = reg.get(0x8e, fmt_b) & 0xf
        adr = reg.get(0x85, 0)
        R['textures'][nom] = dict(nom=nom, largeur=w, hauteur=hh, format=fmt, adresse=adr, mip=mip,
                                  _img=lambda adr=adr, fmt=fmt, w=w, hh=hh: decoder_texture(d, adr, fmt, w, hh))

    for i in range(lut[1]):
        o = u32(d, lut[0] + 4 * i)
        R['luts'].append(cstr(d, u32(d, o + 8)))

    for mi in range(mod[1]):
        o = u32(d, mod[0] + 4 * mi)
        M = dict()
        M['drapeaux'], M['echelle_os'] = d[o], d[o + 1]
        M['monde'] = vec(d, o + 4, 12)
        q = o + 52
        mat_t, mat_n = u32(d, q), u32(d, q + 4); q += 12
        msh_t, msh_n = u32(d, q), u32(d, q + 4); q += 8
        q += 32 + 8   
        os_t, os_n = u32(d, q), u32(d, q + 4); q += 12
        vis_t, vis_n = u32(d, q), u32(d, q + 4); q += 8
        M['nom'] = cstr(d, u32(d, q)); q += 4
        nnoeuds = u32(d, q); arbre = u32(d, q + 4); q += 8
        q += 4
        M['meta'] = lire_metadonnees(d, u32(d, q))
        noms = []
        if arbre:
            for k in range(nnoeuds):
                noms.append(cstr(d, u32(d, arbre + 12 * (k + 1) + 8)))
        M['noeuds'] = noms
        M['visibilite_noeuds'] = []
        if vis_t:
            M['visibilite_noeuds'] = [bool((u32(d, vis_t + 4 * (k // 32)) >> (k % 32)) & 1) for k in range(vis_n)]
        mats = []
        for k in range(mat_n):
            mo = mat_t + k * 0x2c
            par = u32(d, mo)
            tcmd, tcn = u32(d, mo + 16), u32(d, mo + 20)
            mappers = u32(d, mo + 24)
            t0, t1, t2 = cstr(d, u32(d, mo + 28)), cstr(d, u32(d, mo + 32)), cstr(d, u32(d, mo + 36))
            nom = cstr(d, u32(d, mo + 40))
            m = dict(nom=nom, textures=[t0, t1, t2])
            treg, _ = pica_commandes(d, tcmd, tcn) if tcn else ({}, None)
            cfg = treg.get(0x80, 0)
            m['textures_actives'] = [bool(cfg & 1), bool(cfg & 2), bool(cfg & 4)]
            m['mappers'] = []
            for j in range(3):
                mp = mappers + 20 * j
                m['mappers'].append(dict(wrapU=d[mp + 1], wrapV=d[mp + 2], mag=d[mp + 3], min=d[mp + 4]))
            if par:
                p = par
                m['drapeaux'] = u16(d, p + 4); m['drapeaux_frag'] = d[p + 6]
                tc = []
                for j in range(3):
                    b = p + 12 + 24 * j
                    tc.append(dict(drapeaux=d[b], transfo=d[b + 1], mapping=d[b + 2], camera=struct.unpack_from('b', d, b + 3)[0],
                                   echelle=vec(d, b + 4, 2), rotation=f32(d, b + 12), translation=vec(d, b + 16, 2)))
                m['coords'] = tc
                b = p + 12 + 72
                m['lightset'], m['fog'] = u16(d, b), u16(d, b + 2); b += 4
                coul = {}
                for nomc in ('emission', 'ambiante', 'diffuse', 'speculaire0', 'speculaire1', 'constante0', 'constante1',
                             'constante2', 'constante3', 'constante4', 'constante5', 'melange'):
                    coul[nomc] = tuple(d[b:b + 4]); b += 4
                m['couleurs'] = coul
                m['echelle_couleur'] = f32(d, b); b += 4
                b += 24   
                m['couches'] = d[b]; m['fresnel'] = d[b + 1]; m['bump'] = d[b + 2]; m['bump_tex'] = d[b + 3]; b += 4
                b += 24   
                cc = u32(d, b); b += 4
                m['affect_constantes'] = [(cc >> (4 * j)) & 15 for j in range(6)]
                m['decalage_polygone'] = f32(d, b); b += 4
                fcmd, fcn = u32(d, b), u32(d, b + 4); b += 12
                b += 48
                m['shader'] = cstr(d, u32(d, b)); m['modele_ref'] = cstr(d, u32(d, b + 4))
                freg, _ = pica_commandes(d, fcmd, fcn) if fcn else ({}, None)
                m['frag'] = freg
                tev = []
                for st, base in enumerate((0xc0, 0xc8, 0xd0, 0xd8, 0xf0, 0xf8)):
                    tev.append(dict(source=freg.get(base, 0), operande=freg.get(base + 1, 0), combine=freg.get(base + 2, 0),
                                    constante=freg.get(base + 3, 0), echelle=freg.get(base + 4, 0)))
                m['tev'] = tev
                m['tev_tampon'] = freg.get(0xe0, 0)
                m['melange_cfg'] = freg.get(0x101, 0)
                m['couleur_op'] = freg.get(0x100, 0)
                m['alpha_test'] = freg.get(0x104, 0)
                m['profondeur'] = freg.get(0x107, 0)
                m['culling'] = freg.get(0x40, 0)
            mats.append(m)
        M['materiaux'] = mats
        os_ = []
        for k in range(os_n):
            b = os_t + k * 0x64
            fl = u32(d, b)
            os_.append(dict(drapeaux=fl, panneau=(fl >> 16) & 0xf, parent=s16(d, b + 4),
                            echelle=vec(d, b + 8, 3), rotation=vec(d, b + 20, 3), translation=vec(d, b + 32, 3),
                            inverse=vec(d, b + 44, 12), nom=cstr(d, u32(d, b + 92)), meta=lire_metadonnees(d, u32(d, b + 96))))
        M['os'] = os_
        msh = []
        for k in range(msh_n):
            b = msh_t + k * 0x38
            mat_i = u16(d, b); fl = d[b + 2]; noeud = u16(d, b + 4); cle = u16(d, b + 6)
            ecmd, ecn = u32(d, b + 8), u32(d, b + 12)
            sm_t, sm_n = u32(d, b + 16), u32(d, b + 20)
            centre = vec(d, b + 32, 3)
            reg, uni = pica_commandes(d, ecmd, ecn)
            fmts = reg.get(0x201, 0) | (reg.get(0x202, 0) << 32)
            badr = reg.get(0x203, 0)
            battr = reg.get(0x204, 0) | ((reg.get(0x205, 0) & 0xffff) << 32)
            pas = (reg.get(0x205, 0) >> 16) & 0xff
            nattr_buf = reg.get(0x205, 0) >> 28
            ntot = reg.get(0x242, 0) + 1
            perm = reg.get(0x2bb, 0) | (reg.get(0x2bc, 0) << 32)
            u = {}
            for base, mots in uni.items():
                for j, v4 in enumerate(mots_en_vec4(mots)): u[base + j] = v4
            fixes_idx = {}
            fixed = {}
            attrs = []
            for j in range(ntot):
                if (fmts >> (48 + j)) & 1:
                    fixed[(perm >> (j * 4)) & 0xf] = j
                else:
                    pi = (battr >> (j * 4)) & 0xf
                    nomA = (perm >> (pi * 4)) & 0xf
                    fa = (fmts >> (pi * 4)) & 0xf
                    sc = 1.0
                    if nomA == 0: sc = u.get(7, (1, 1, 1, 1))[0]
                    elif nomA == 1: sc = u.get(7, (1, 1, 1, 1))[1]
                    elif nomA == 2: sc = u.get(7, (1, 1, 1, 1))[2]
                    elif nomA == 3: sc = u.get(7, (1, 1, 1, 1))[3]
                    elif nomA == 4: sc = u.get(8, (1, 1, 1, 1))[0]
                    elif nomA == 5: sc = u.get(8, (1, 1, 1, 1))[1]
                    elif nomA == 6: sc = u.get(8, (1, 1, 1, 1))[2]
                    elif nomA == 8: sc = u.get(8, (1, 1, 1, 1))[3]
                    attrs.append((nomA, fa & 3, (fa >> 2) + 1, sc))
            sms = []
            maxi = 0
            for j in range(sm_n):
                s = sm_t + j * 0x34
                peau = d[s]; nos = u16(d, s + 2)
                osl = [u16(d, s + 4 + 2 * x) for x in range(nos)]
                ccmd, ccn = u32(d, s + 44), u32(d, s + 48)
                r2, _ = pica_commandes(d, ccmd, ccn)
                cfg = r2.get(0x227, 0); cnt = r2.get(0x228, 0)
                adr = cfg & 0x7fffffff; i16 = cfg >> 31
                idx = list(struct.unpack_from('<%dH' % cnt, d, adr)) if i16 else list(d[adr:adr + cnt])
                maxi = max([maxi] + idx)
                prim = (r2.get(0x25e, 0) >> 8) & 3
                sms.append(dict(peau=peau, os=osl, indices=idx, primitive=prim, booleens=r2.get(0x2b0, 0)))
            somm = []
            for vi in range(maxi + 1 if sms else 0):
                p = badr + vi * pas
                v = {}
                for (nomA, fmt, nel, sc) in attrs:
                    al = {0: 1, 1: 1, 2: 2, 3: 4}[fmt]
                    rel = p - badr - vi * pas
                    if rel % al: p += al - rel % al
                    vals = []
                    for e_ in range(nel):
                        if fmt == 0: x = struct.unpack_from('b', d, p)[0]; p += 1
                        elif fmt == 1: x = d[p]; p += 1
                        elif fmt == 2: x = s16(d, p); p += 2
                        else: x = f32(d, p); p += 4
                        vals.append(x * sc)
                    v[nomA] = vals
                somm.append(v)
            pos_dec = u.get(6, (0, 0, 0, 0))
            msh.append(dict(materiau=mat_i, type=fl & 3, peau=(fl >> 2) & 3, noeud=noeud, priorite=cle & 0xff,
                            couche=(cle >> 8) & 3, centre=centre, attributs=attrs, fixes=list(fixed),
                            decalage=pos_dec, sous_maillages=sms, sommets=somm,
                            fixes_valeurs={k: reg['_fixes'].get(j) for k, j in fixed.items()}))
        M['maillages'] = msh
        R['modeles'].append(M)

    for i in range(ask[1]):
        R['anims_squelette'].append(lire_animation(d, u32(d, ask[0] + 4 * i)))
    for i in range(amt[1]):
        R['anims_materiau'].append(lire_animation(d, u32(d, amt[0] + 4 * i), materiau=True))
    for i in range(avi[1]):
        R['anims_visibilite'].append(lire_animation(d, u32(d, avi[0] + 4 * i)))
    for i in range(lum[1]):
        o = u32(d, lum[0] + 4 * i)
        R['lumieres'].append(dict(nom=cstr(d, u32(d, o)), echelle=vec(d, o + 4, 3), rotation=vec(d, o + 16, 3),
                                  translation=vec(d, o + 28, 3), drapeaux=u32(d, o + 40)))
    for i in range(cam[1]):
        o = u32(d, cam[0] + 4 * i)
        R['cameras'].append(dict(nom=cstr(d, u32(d, o)), translation=vec(d, o + 28, 3)))
    for i in range(sce[1]):
        o = u32(d, sce[0] + 4 * i)
        R['scenes'].append(cstr(d, u32(d, o)))
    return R

if __name__ == '__main__':
    import sys, json
    for f in sys.argv[1:]:
        b = open(f, 'rb').read()
        if b[:4] == b'Yaz0': b = yaz0(b)
        R = lire_bch(b)
        print('==', f, 'version 0x%x' % R['version'])
        for t in R['textures'].values():
            print('  texture', t['nom'], t['largeur'], 'x', t['hauteur'], FORMATS.get(t['format']))
        for M in R['modeles']:
            print('  modèle', M['nom'], 'os', [(o['nom'], o['parent']) for o in M['os']])
            print('    nœuds', M['noeuds'], 'visibles', M['visibilite_noeuds'])
            for m in M['materiaux']:
                print('    matériau', m['nom'], m['textures'], m.get('couleurs', {}).get('diffuse'), 'const', m.get('couleurs', {}).get('constante0'))
            for k, s in enumerate(M['maillages']):
                print('    maillage', k, 'mat', s['materiau'], 'type', s['type'], 'nœud', s['noeud'], 'peau', s['peau'],
                      'attrs', [(a[0], a[1], a[2]) for a in s['attributs']], 'fixes', s['fixes'],
                      'sommets', len(s['sommets']), 'sm', [(x['peau'], x['os'], len(x['indices']), x['primitive']) for x in s['sous_maillages']])
        for a in R['anims_squelette'] + R['anims_materiau'] + R['anims_visibilite']:
            print('  anim', a['type'], a['nom'], 'images', a['images'], 'boucle', a['boucle'],
                  [(e['nom'], e['cible'], e['prim']) for e in a['elements']])
