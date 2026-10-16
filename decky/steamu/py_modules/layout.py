import argparse, glob, json, struct, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bch

FLIM_PICA = {0: 7, 1: 8, 2: 9, 3: 5, 4: 6, 5: 3, 6: 1, 7: 2, 8: 4, 9: 0, 10: 12, 11: 13, 12: 10, 13: 11}

def p2(n):
    v = 8
    while v < n: v *= 2
    return v

def lire_flim(d):
    assert d[-0x28:-0x24] == b'FLIM', d[-0x28:-0x24]
    im = len(d) - 0x14
    assert d[im:im + 4] == b'imag'
    w, h, align = struct.unpack_from('<HHH', d, im + 8)
    fmt, swz = d[im + 14], d[im + 15]
    pf = FLIM_PICA[fmt]
    W, H = p2(w), p2(h)
    taille = bch.taille_texture(pf, W, H)
    if taille > len(d) - 0x28:   
        W2, H2 = W, H
        while bch.taille_texture(pf, W2, H2) > len(d) - 0x28 and H2 > 8: H2 //= 2
        W, H = W2, H2
    if swz in (4, 8):
        src = bch.decoder_texture(d, 0, pf, H, W)
        img = bytearray(W * H * 4)
        for y in range(H):
            for x in range(W):
                img[(y * W + x) * 4:(y * W + x) * 4 + 4] = src[(x * H + y) * 4:(x * H + y) * 4 + 4]
    else:
        img = bch.retourner(bch.decoder_texture(d, 0, pf, W, H), W, H)
    y0 = H - h if swz == 4 else 0
    out = bytearray(w * h * 4)
    for y in range(h):
        out[y * w * 4:(y + 1) * w * 4] = img[(y0 + y) * W * 4:(y0 + y) * W * 4 + w * 4]
    if swz == 4: out = bch.retourner(out, w, h)
    return w, h, out, fmt, swz

def chaine(d, o, n): return d[o:o + n].split(b'\0')[0].decode('latin-1')

def lire_flyt(d):
    assert d[:4] == b'FLYT'
    hs = struct.unpack_from('<H', d, 6)[0]
    nb = struct.unpack_from('<H', d, 0x10)[0]
    o = hs
    volets, textures, materiaux, pile = [], [], [], []
    taille_ecran = None
    for _ in range(nb):
        mag = d[o:o + 4]; t = struct.unpack_from('<I', d, o + 4)[0]
        if mag == b'lyt1':
            taille_ecran = struct.unpack_from('<ff', d, o + 12)
        elif mag == b'txl1':
            n = struct.unpack_from('<H', d, o + 8)[0]
            offs = struct.unpack_from('<%dI' % n, d, o + 12)
            textures = [chaine(d, o + 12 + x, 64) for x in offs]
        elif mag == b'mat1':
            n = struct.unpack_from('<H', d, o + 8)[0]
            offs = struct.unpack_from('<%dI' % n, d, o + 12)
            materiaux = [chaine(d, o + x, 20) for x in offs]
        elif mag in (b'pan1', b'pic1', b'txt1', b'wnd1', b'bnd1', b'prt1'):
            fl, base, alpha = d[o + 8], d[o + 9], d[o + 10]
            nom = chaine(d, o + 12, 24)
            tx, ty, tz, rx, ry, rz, sx, sy, w, h = struct.unpack_from('<10f', d, o + 0x2c)
            v = dict(type=mag[:3].decode(), nom=nom, visible=bool(fl & 1), alpha=alpha, position=[round(tx, 1), round(ty, 1)],
                     rotation=round(rz, 1), echelle=[round(sx, 3), round(sy, 3)], taille=[round(w, 1), round(h, 1)], profondeur=len(pile))
            if mag == b'pic1':
                q = o + 0x54 + 16 + 2
                v['materiau'] = struct.unpack_from('<H', d, o + 0x54 + 16)[0]
            if mag == b'txt1':
                q = o + 0x54
                n_, nmax, mat, font = struct.unpack_from('<HHHH', d, q)
                to = struct.unpack_from('<I', d, q + 0x10)[0]
                ln = struct.unpack_from('<H', d, q + 0x30)[0] if False else n_
                try: v['texte'] = d[o + to:o + to + n_].decode('utf-16-le').rstrip('\0')
                except Exception: pass
            if mag == b'prt1':
                v['partie'] = chaine(d, o + 0x54 + 8 + 8, 24) if False else None
            volets.append(v)
        elif mag == b'pas1': pile.append(1)
        elif mag == b'pae1': pile and pile.pop()
        o += t
    return dict(ecran=taille_ecran, textures=textures, materiaux=materiaux, volets=volets)

def lire_flan(d):
    assert d[:4] == b'FLAN'
    hs = struct.unpack_from('<H', d, 6)[0]
    nb = struct.unpack_from('<H', d, 0x10)[0]
    o = hs; out = dict()
    for _ in range(nb):
        mag = d[o:o + 4]; t = struct.unpack_from('<I', d, o + 4)[0]
        if mag == b'pat1':
            out['ordre'] = struct.unpack_from('<H', d, o + 8)[0]
            out['nom'] = chaine(d, o + struct.unpack_from('<I', d, o + 12)[0], 64)
            out['debut'], out['fin'] = struct.unpack_from('<hh', d, o + 20)
        elif mag == b'pai1':
            out['images'], out['boucle'] = struct.unpack_from('<H', d, o + 8)[0], bool(d[o + 10])
            nt = struct.unpack_from('<H', d, o + 12)[0]; ne = struct.unpack_from('<H', d, o + 14)[0]
            eo = struct.unpack_from('<I', d, o + 16)[0]
            tex_offs = struct.unpack_from('<%dI' % nt, d, o + 20) if nt else []
            out['textures'] = [chaine(d, o + 20 + x, 64) for x in tex_offs]
            offs = struct.unpack_from('<%dI' % ne, d, o + eo)
            cibles = []
            for x in offs:
                e = o + x
                nom = chaine(d, e, 28); nt_ = d[e + 28]; typ = d[e + 29]
                tags = []
                for k in range(nt_):
                    to = struct.unpack_from('<I', d, e + 32 + 4 * k)[0]
                    tags.append(d[e + to:e + to + 4].decode('latin-1'))
                cibles.append(dict(volet=nom, pistes=tags))
            out['cibles'] = cibles
        o += t
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--romfs', default='/dev/shm/ba-romfs/romfs')
    ap.add_argument('--motif', default='MgCr*')
    ap.add_argument('--langue', default='fr', help='version localisée prise dans region_EUR/<langue>/layout quand elle existe')
    ap.add_argument('--sortie', default=str(Path(__file__).resolve().parents[2] / 'ressources-privees/badge-arcade/romfs-eur/layout-png'))
    a = ap.parse_args()
    out = Path(a.sortie); out.mkdir(parents=True, exist_ok=True)
    inv = {}
    langue = Path(a.romfs) / 'region_EUR' / a.langue / 'layout'
    for f in sorted(glob.glob(str(Path(a.romfs) / 'region_common/layout' / (a.motif + '.szs')))):
        nom = Path(f).name[:-4]
        for loc in (langue, Path(a.romfs) / 'region_EUR/common/layout'):
            if (loc / Path(f).name).exists(): f = str(loc / Path(f).name); break
        S = bch.sarc(bch.yaz0(Path(f).read_bytes()))
        dos = out / nom; dos.mkdir(exist_ok=True)
        e = dict(source=str(Path(f).relative_to(a.romfs)), textures={}, mises_en_page={}, animations={})
        for k, v in sorted(S.items()):
            if k.endswith('.bflim'):
                try:
                    w, h, img, fmt, swz = lire_flim(v)
                    (dos / (Path(k).stem + '.png')).write_bytes(bch.png(img, w, h))
                    e['textures'][Path(k).stem] = dict(taille=[w, h], format=fmt, rotation=swz)
                except Exception as x:
                    e['textures'][Path(k).stem] = dict(erreur=str(x))
            elif k.endswith('.bflyt'):
                try: e['mises_en_page'][Path(k).stem] = lire_flyt(v)
                except Exception as x: e['mises_en_page'][Path(k).stem] = dict(erreur=repr(x))
            elif k.endswith('.bflan'):
                try: e['animations'][Path(k).stem] = lire_flan(v)
                except Exception as x: e['animations'][Path(k).stem] = dict(erreur=repr(x))
        inv[nom] = e
        print(nom, len(e['textures']), 'textures', len(e['animations']), 'animations')
    (out / 'inventaire.json').write_text(json.dumps(inv, ensure_ascii=False, indent=1))

if __name__ == '__main__':
    main()
