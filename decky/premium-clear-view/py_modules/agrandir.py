import math, os, pathlib, re, struct, tempfile, zlib

FACTEUR = 4
MAX_COTE = 512                 
MAX_PNG = 4 * 1024 * 1024
ACCENT = 0.35                  
NOM_HD = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,120}-(haut|bas)\.png")

class Refus(Exception):
    pass

def lire_png(octets, avec_alpha=False):
    if len(octets) > MAX_PNG or not octets.startswith(b"\x89PNG\r\n\x1a\n"):
        raise Refus("pas un PNG")
    p, idat, palette, entete = 8, [], None, None
    while p + 8 <= len(octets):
        n, genre = struct.unpack_from(">I4s", octets, p)
        d = octets[p + 8:p + 8 + n]; p += 12 + n
        if genre == b"IHDR": entete = struct.unpack(">IIBBBBB", d)
        elif genre == b"PLTE": palette = d
        elif genre == b"IDAT": idat.append(d)
        elif genre == b"IEND": break
    if not entete: raise Refus("PNG sans en-tête")
    l, h, prof, couleur, _, _, entrelace = entete
    nc = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}.get(couleur)
    if prof != 8 or entrelace or not nc or not (0 < l <= MAX_COTE and 0 < h <= MAX_COTE) or (couleur == 3 and not palette):
        raise Refus("PNG non pris en charge")
    o = zlib.decompressobj(); brut = o.decompress(b"".join(idat), (l * nc + 1) * h + 1)
    pas = l * nc
    if len(brut) < (pas + 1) * h: raise Refus("PNG tronqué")
    lignes, prec = [], bytearray(pas)
    for y in range(h):
        f, ligne = brut[y * (pas + 1)], bytearray(brut[y * (pas + 1) + 1:(y + 1) * (pas + 1)])
        if f == 1:
            for i in range(nc, pas): ligne[i] = (ligne[i] + ligne[i - nc]) & 255
        elif f == 2:
            ligne = bytearray((a + b) & 255 for a, b in zip(ligne, prec))
        elif f == 3:
            for i in range(pas): ligne[i] = (ligne[i] + ((ligne[i - nc] if i >= nc else 0) + prec[i]) // 2) & 255
        elif f == 4:
            for i in range(pas):
                a = ligne[i - nc] if i >= nc else 0; b = prec[i]; c = prec[i - nc] if i >= nc else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                ligne[i] = (ligne[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        elif f: raise Refus("filtre PNG inconnu")
        lignes.append(ligne); prec = ligne
    tout = b"".join(lignes)
    if couleur == 2: rgb = tout
    elif couleur == 6:
        rgb = bytearray(l * h * 3)
        for c in range(3): rgb[c::3] = tout[c::4]
    elif couleur in (0, 4):
        g = tout[::nc]; rgb = bytearray(l * h * 3)
        for c in range(3): rgb[c::3] = g
    else:
        pal = palette + bytes(768 - len(palette)) if len(palette) < 768 else palette
        rgb = bytearray(l * h * 3)
        for c in range(3): rgb[c::3] = tout.translate(bytes(pal[c::3][:256]))
    if avec_alpha:   
        return l, h, bytes(rgb), (bytes(tout[3::4]) if couleur == 6 else bytes(tout[1::2]) if couleur == 4 else None)
    return l, h, bytes(rgb)

def ecrire_png(l, h, rgb, alpha=None):
    nc = 4 if alpha else 3
    if alpha:
        rgba = bytearray(l * h * 4)
        for c in range(3): rgba[c::4] = rgb[c::3]
        rgba[3::4] = alpha; rgb = rgba
    pas = l * nc
    brut = bytearray((pas + 1) * h)
    for y in range(h): brut[y * (pas + 1) + 1:(y + 1) * (pas + 1)] = rgb[y * pas:(y + 1) * pas]
    bloc = lambda t, x: struct.pack(">I", len(x)) + t + x + struct.pack(">I", zlib.crc32(t + x) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n" + bloc(b"IHDR", struct.pack(">IIBBBBB", l, h, 8, 6 if alpha else 2, 0, 0, 0))
            + bloc(b"IDAT", zlib.compress(bytes(brut), 6)) + bloc(b"IEND", b""))

def _lanczos(x, a=3):
    if x == 0: return 1.0
    if abs(x) >= a: return 0.0
    px = math.pi * x
    return a * math.sin(px) * math.sin(px / a) / (px * px)

def noyau(k=FACTEUR, accent=ACCENT):
    sig = k / 2; g = [math.exp(-m * m / (2 * sig * sig)) for m in range(-2 * k, 2 * k + 1)]; sg = sum(g)
    acc = {m: -accent * g[m + 2 * k] / sg for m in range(-2 * k, 2 * k + 1)}; acc[0] += 1 + accent
    phases = []
    for p in range(k):
        j = 50 * k + p; i0 = j // k; w = {}
        for m, s in acc.items():
            x = (j + m + .5) / k - .5
            for i in range(math.floor(x) - 3, math.floor(x) + 4):
                v = _lanczos(x - i)
                if v: w[i - i0] = w.get(i - i0, 0) + s * v
        tot = sum(w.values()); w = {d: v / tot for d, v in w.items() if abs(v / tot) > 1e-4}
        e = {d: round(v * 256) for d, v in w.items()}
        e[0] += 256 - sum(e.values())
        phases.append(sorted((d, v) for d, v in e.items() if v))
    marge = max(abs(d) for ph in phases for d, _ in ph)
    return marge, phases

_N = noyau()
C = 256                                   

def _motif(n, v, larg=4):
    return int.from_bytes(v.to_bytes(larg, "little") * n, "little")

def _vers_champs(octets):
    b = bytearray(len(octets) * 4); b[0::4] = octets
    return int.from_bytes(b, "little")

def _filtre(sources, poids, n, cache):
    if n not in cache:
        un = _motif(n, 1)
        cache[n] = (un, _motif(n, C * 256 + 128), (1 << 32 * n) - 1, _motif(n, 0xFFFF), _motif(n, C), _motif(n, 255))
    un, biais, tout, m16, mc, m255 = cache[n]
    v = biais
    for s, w in zip(sources, poids): v += w * s
    v = ((v & tout) >> 8) & m16                   
    ge = ((v + (0x8000 - C) * un) >> 15) & un     
    m = ge * 0xFFFFFFFF
    v = ((v & m) | (mc & ~m & tout)) - mc         
    gt = ((v + (0x8000 - 256) * un) >> 15) & un   
    m = gt * 0xFFFFFFFF
    v = (v & ~m & tout) | (m255 & m)
    return v.to_bytes(4 * n, "little")[0::4]

def agrandir(l, h, rgb, k=FACTEUR):
    marge, phases = _N
    cache = {}
    L = k * l; lignes = []
    for y in range(h):
        r = rgb[y * l * 3:(y + 1) * l * 3]
        r = r[:3] * marge + r + r[-3:] * marge
        R = _vers_champs(r)
        sortie = bytearray(L * 3)
        for p, ph in enumerate(phases):
            o = _filtre([R >> 96 * (d + marge) for d, _ in ph], [w for _, w in ph], l * 3, cache)
            for c in range(3): sortie[p * 3 + c::3 * k] = o[c::3]
        lignes.append(sortie)
    E = [_vers_champs(x) for x in lignes]
    E = [E[0]] * marge + E + [E[-1]] * marge
    sortie = bytearray(L * 3 * k * h)
    n = L * 3
    for j in range(k * h):
        i0, ph = divmod(j, k)
        ph = phases[ph]
        sortie[j * n:(j + 1) * n] = _filtre([E[i0 + d + marge] for d, _ in ph], [w for _, w in ph], n, cache)
    return L, k * h, bytes(sortie)

def nom_hd(nom):
    return nom[:-4] + "-hd.png"

def _ecrire_cache(dst, L, H, gros, alpha=None):
    dst.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=".hd-", suffix=".png", dir=dst.parent)
    try:
        with os.fdopen(fd, "wb") as f: f.write(ecrire_png(L, H, gros, alpha))
        os.chmod(tmp, 0o644)
        os.replace(tmp, dst)
    finally:
        if os.path.exists(tmp): os.unlink(tmp)

def preparer(dossier, nom):
    if not isinstance(nom, str) or not NOM_HD.fullmatch(nom):
        raise Refus("nom d'image inattendu")
    dossier = pathlib.Path(dossier)
    src, dst = dossier / nom, dossier / "hd" / nom_hd(nom)
    if not src.is_file(): raise Refus("image introuvable")
    if dst.is_file() and dst.stat().st_mtime >= src.stat().st_mtime: return "hd/" + dst.name
    l, h, rgb = lire_png(src.read_bytes())
    if l > 480 or h > 300: return None            
    L, H, gros = auto(l, h, rgb)
    _ecrire_cache(dst, L, H, gros)
    return "hd/" + dst.name

NOM_BADGE = re.compile(r"(?:[A-Za-z0-9][A-Za-z0-9._-]{0,60}/)?[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.png")

def preparer_badge(dossier, nom):
    if not isinstance(nom, str) or not NOM_BADGE.fullmatch(nom):
        raise Refus("nom de badge inattendu")
    dossier = pathlib.Path(dossier)
    rel = "hd/" + nom_hd(nom)
    src, dst = dossier / nom, dossier / rel
    if not src.is_file(): raise Refus("image introuvable")
    octets = src.read_bytes()
    l, h, rgb, alpha = lire_png(octets, avec_alpha=True)
    if dst.is_file() and dst.stat().st_mtime >= src.stat().st_mtime and (alpha is None or dst.read_bytes()[25:26] == b"\x06"): return rel
    methode = xbr if choisir(l, h, rgb) == "xbr" else agrandir
    L, H, gros = methode(l, h, rgb)
    a = methode(l, h, bytes(v for x in alpha for v in (x, x, x)))[2][::3] if alpha else None
    _ecrire_cache(dst, L, H, gros, a)
    return rel

EGAL = 120                     

def _couverture(k=FACTEUR, fin=8):
    regions = {"45": lambda x, y: x + y > 1.5, "couche": lambda x, y: y > 1 - x / 2, "dresse": lambda x, y: x > 1 - y / 2}
    regions["les2"] = lambda x, y: regions["couche"](x, y) or regions["dresse"](x, y)
    sortie = {}
    for nom, f in regions.items():
        cases = []
        for sy in range(k):
            for sx in range(k):
                n = sum(f((sx + (i + .5) / fin) / k, (sy + (j + .5) / fin) / k) for i in range(fin) for j in range(fin))
                a = round(16 * n / (fin * fin))
                if a: cases.append((sx, sy, a))
        sortie[nom] = cases
    return sortie

_COUV = _couverture()
_ROTATIONS = (((1, 0), (0, 1)), ((0, 1), (-1, 0)), ((-1, 0), (0, -1)), ((0, -1), (1, 0)))   

def xbr(l, h, rgb, k=FACTEUR):
    m = 2; W = l + 2 * m
    pix = []
    lignes = [[rgb[(y * l + x) * 3] << 16 | rgb[(y * l + x) * 3 + 1] << 8 | rgb[(y * l + x) * 3 + 2] for x in range(l)] for y in range(h)]
    for y in range(-m, h + m):
        r = lignes[min(max(y, 0), h - 1)]
        pix += [r[0]] * m + r + [r[-1]] * m
    Y = [(299 * (p >> 16) + 587 * (p >> 8 & 255) + 114 * (p & 255)) // 1000 for p in pix]
    U = [(-169 * (p >> 16) - 331 * (p >> 8 & 255) + 500 * (p & 255)) // 1000 for p in pix]
    V = [(500 * (p >> 16) - 419 * (p >> 8 & 255) - 81 * (p & 255)) // 1000 for p in pix]
    n = len(pix)

    def dist(o):
        o0, o1 = max(0, -o), n - max(0, o)
        d = [48 * abs(a - b) + 7 * abs(c - e) + 6 * abs(f - g) for a, b, c, e, f, g in
             zip(Y[o0:o1], Y[o0 + o:o1 + o], U[o0:o1], U[o0 + o:o1 + o], V[o0:o1], V[o0 + o:o1 + o])]
        return [0] * o0 + d + [0] * (n - o1)
    cache = {}

    def d(a, b):                                 
        if b < 0: a, b = a + b, -b
        if b not in cache: cache[b] = dist(b)
        return cache[b][a]

    L = k * l; pas = L * 3
    sortie = bytearray(pas * k * h)
    for y in range(h):
        r = rgb[y * l * 3:(y + 1) * l * 3]; ligne = bytearray(pas)
        for p in range(k):
            for c in range(3): ligne[p * 3 + c::3 * k] = r[c::3]
        for j in range(k): sortie[(y * k + j) * pas:(y * k + j + 1) * pas] = ligne
    for (rx, ry), (dx, dy) in _ROTATIONS:
        R, D = rx + ry * W, dx + dy * W
        cases = {}
        for nom, cs in _COUV.items():
            t = []
            for sx, sy, a in cs:
                u, v = sx - (k - 1) / 2, sy - (k - 1) / 2
                ax, ay = int(round(u * rx + v * dx + (k - 1) / 2)), int(round(u * ry + v * dy + (k - 1) / 2))
                t.append((ay * pas + ax * 3, a))
            cases[nom] = t
        for d_ in (R, D, R + D, R - D, D - R, 2 * R, 2 * D, R + 2 * D, 2 * R + D, D - 2 * R, R - 2 * D):
            d(0, d_)
        for y in range(h):
            q = (y + m) * W + m
            for x in range(l):
                E = q + x
                F, H = E + R, E + D
                if pix[E] == pix[F] and pix[E] == pix[H]: continue          
                I, C, G, B, Dp = E + R + D, E + R - D, E + D - R, E - D, E - R
                e = d(E, R - D) + d(E, D - R) + d(I, R - D) + d(I, D - R) + 4 * d(H, R - D)
                i = d(H, -R) + d(H, D) + d(F, D) + d(F, -D) + 4 * d(E, R + D)
                if e >= i: continue
                eq = lambda a, b: d(a, b - a) < EGAL
                if not (not eq(F, B) and not eq(H, Dp) or eq(E, I) and not eq(F, I + R) and not eq(H, I + D) or eq(E, G) or eq(E, C)):
                    continue
                px = pix[F] if d(E, R) <= d(E, D) else pix[H]
                ke, ki = d(F, D - 2 * R), d(H, R - 2 * D)
                couche = ke * 2 <= ki and not eq(E, G) and not eq(Dp, G)
                dresse = ki * 2 <= ke and not eq(E, C) and not eq(B, C)
                reg = "les2" if couche and dresse else "couche" if couche else "dresse" if dresse else "45"
                base = y * k * pas + x * k * 3
                pr, pg, pb = px >> 16, px >> 8 & 255, px & 255
                for o, a in cases[reg]:
                    o += base; b = 16 - a
                    sortie[o] = (sortie[o] * b + pr * a + 8) >> 4
                    sortie[o + 1] = (sortie[o + 1] * b + pg * a + 8) >> 4
                    sortie[o + 2] = (sortie[o + 2] * b + pb * a + 8) >> 4
    return L, k * h, bytes(sortie)

def choisir(l, h, rgb):
    Y = [(299 * rgb[i] + 587 * rgb[i + 1] + 114 * rgb[i + 2]) // 1000 for i in range(0, len(rgb), 3)]
    fort = franc = 0
    for o, x0, x1, y0, y1 in ((1, 1, l - 1, 0, h), (l, 0, l, 1, h - 1)):
        for y in range(y0, y1):
            b = y * l
            for i in range(b + x0, b + x1):
                a1 = Y[i] - Y[i - o]; b1 = Y[i + o] - Y[i]; t = a1 + b1
                if (t >= 48 or t <= -48) and (a1 >= 0) == (b1 >= 0):
                    fort += 1
                    if max(abs(a1), abs(b1)) * 5 >= 4 * abs(t): franc += 1
    couleurs = len({rgb[i:i + 3] for i in range(0, len(rgb), 3)})
    if fort and franc * 2 >= fort: return "xbr"
    if couleurs >= 1500 and fort >= .05 * l * h: return "xbr"
    return "lanczos"

def auto(l, h, rgb):
    return (xbr if choisir(l, h, rgb) == "xbr" else agrandir)(l, h, rgb)
