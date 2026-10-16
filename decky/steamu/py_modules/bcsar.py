import argparse, json, math, struct, sys, wave
from pathlib import Path

def u8(d, o): return d[o]
def u16(d, o): return struct.unpack_from('<H', d, o)[0]
def s16(d, o): return struct.unpack_from('<h', d, o)[0]
def u32(d, o): return struct.unpack_from('<I', d, o)[0]
def s32(d, o): return struct.unpack_from('<i', d, o)[0]

def ref(d, o, base):
    t = u16(d, o); off = s32(d, o + 4)
    return t, (None if off == -1 else base + off)

def table_refs(d, o):
    n = u32(d, o)
    return [ref(d, o + 4 + 8 * i, o) for i in range(n)]

def blocs(d):
    nb = u32(d, 0x10)
    return {u16(d, 0x14 + 12 * i): (u32(d, 0x14 + 12 * i + 4), u32(d, 0x14 + 12 * i + 8)) for i in range(nb)}

def dsp_adpcm(d, o, nech, coefs, ps0=0, h1=0, h2=0):
    out = []
    while len(out) < nech:
        ps = d[o]; o += 1
        pred, ech = ps >> 4, 1 << (ps & 15)
        c1, c2 = coefs[2 * pred], coefs[2 * pred + 1]
        for k in range(14):
            if len(out) >= nech: break
            b = d[o + k // 2]
            n = (b >> 4) if k % 2 == 0 else (b & 15)
            if n >= 8: n -= 16
            s = ((n * ech) << 11) + 1024 + c1 * h1 + c2 * h2
            s >>= 11
            s = max(-32768, min(32767, s))
            h2, h1 = h1, s
            out.append(s)
        o += 7
    return out

def lire_cwav(d):
    assert d[:4] == b'CWAV', d[:4]
    B = blocs(d)
    info, _ = B[0x7000]; donnees, _ = B[0x7001]
    i = info + 8
    enc, boucle = d[i], d[i + 1]; freq = u32(d, i + 4); debut_boucle = u32(d, i + 8); fin = u32(d, i + 12)
    canaux = table_refs(d, i + 20)
    pistes = []
    for _, c in canaux:
        t, pech = ref(d, c, donnees + 8)
        t2, padpcm = ref(d, c + 8, c)
        if enc == 2:
            coefs = [s16(d, padpcm + 2 * k) for k in range(16)]
            ps, h1, h2 = u16(d, padpcm + 32), s16(d, padpcm + 34), s16(d, padpcm + 36)
            pistes.append(dsp_adpcm(d, pech, fin, coefs, ps, h1, h2))
        elif enc == 1:
            pistes.append(list(struct.unpack_from('<%dh' % fin, d, pech)))
        elif enc == 0:
            pistes.append([(struct.unpack_from('b', d, pech + k)[0]) * 256 for k in range(fin)])
        else:
            raise ValueError('encodage %d (IMA) non géré' % enc)
    return dict(encodage=enc, boucle=bool(boucle), frequence=freq, debut_boucle=debut_boucle, fin=fin, pistes=pistes)

def ecrire_wav(chemin, onde):
    n = len(onde['pistes']); m = min(len(p) for p in onde['pistes'])
    with wave.open(str(chemin), 'wb') as w:
        w.setnchannels(n); w.setsampwidth(2); w.setframerate(onde['frequence'])
        w.writeframes(b''.join(struct.pack('<%dh' % n, *(p[k] for p in onde['pistes'])) for k in range(m)))

def lire_cwar(d):
    assert d[:4] == b'CWAR'
    B = blocs(d)
    info, _ = B[0x6800]; fich, _ = B[0x6801]
    n = u32(d, info + 8)
    out = []
    for k in range(n):
        t = u16(d, info + 12 + 12 * k); off = s32(d, info + 12 + 12 * k + 4); taille = u32(d, info + 12 + 12 * k + 8)
        out.append(d[fich + 8 + off: fich + 8 + off + taille] if off != -1 else None)
    return out

def lire_cwsd(d):
    assert d[:4] == b'CWSD'
    B = blocs(d)
    info, _ = B[0x6800]
    i = info + 8
    _, p_ids = ref(d, i, i); _, p_ws = ref(d, i + 8, i)
    ids = []
    n = u32(d, p_ids)
    for k in range(n):
        ids.append((u32(d, p_ids + 4 + 8 * k), u32(d, p_ids + 4 + 8 * k + 4)))   
    sons = []
    for _, ws in table_refs(d, p_ws):
        _, p_notes = ref(d, ws + 16, ws)
        idx = []
        if p_notes:
            for _, nt in table_refs(d, p_notes):
                idx.append(u32(d, nt))   
        sons.append(idx)
    return ids, sons

def ondes_cbnk(d):
    assert d[:4] == b'CBNK'
    B = blocs(d)
    info, _ = B[0x5800]
    i = info + 8
    _, p_ids = ref(d, i, i)
    n = u32(d, p_ids)
    return [(u32(d, p_ids + 4 + 8 * k), u32(d, p_ids + 4 + 8 * k + 4)) for k in range(n)]

def lire_csar(d):
    assert d[:4] == b'CSAR'
    B = blocs(d)
    strg, _ = B[0x2000]; info, _ = B[0x2001]; fich, _ = B[0x2002]
    s = strg + 8
    _, p_tab = ref(d, s, s)
    n = u32(d, p_tab); noms = []
    for k in range(n):
        o = s32(d, p_tab + 4 + 12 * k + 4); t = u32(d, p_tab + 4 + 12 * k + 8)
        noms.append(d[p_tab + o:p_tab + o + t - 1].decode())
    i = info + 8
    R = [ref(d, i + 8 * k, i) for k in range(8)]
    fichiers = []
    for _, fo in table_refs(d, R[6][1]):
        t, loc = ref(d, fo, fo)
        if t == 0x220C and loc:
            _, p = ref(d, loc, fich + 8)
            taille = u32(d, loc + 8)
            fichiers.append(d[p:p + taille] if p is not None and taille else None)
        else:
            fichiers.append(None)
    for g in list(fichiers):
        if g is None or g[:4] != b'CGRP': continue
        GB = blocs(g); gi, _ = GB[0x7800]; gf, _ = GB[0x7801]
        for _, e in table_refs(g, gi + 8):
            fid = u32(g, e); off = s32(g, e + 8); taille = u32(g, e + 12)
            if off != -1 and fid < len(fichiers) and fichiers[fid] is None:
                fichiers[fid] = g[gf + 8 + off: gf + 8 + off + taille]
    def nom(flags, o):
        if flags & 1: k = u32(d, o); return noms[k] if k < len(noms) else None
        return None
    sons = []
    for _, so in table_refs(d, R[0][1]):
        fid = u32(d, so); joueur = u32(d, so + 4); vol = d[so + 8]
        t, det = ref(d, so + 12, so)
        fl = u32(d, so + 20)
        sons.append(dict(nom=nom(fl, so + 24), fichier=fid, volume=vol,
                         type={0x2201: 'flux', 0x2202: 'onde', 0x2203: 'sequence'}.get(t, hex(t)), detail=det))
    for s_ in sons:
        if s_['type'] == 'onde': s_['index'] = u32(d, s_['detail'])
        if s_['type'] == 'sequence':
            _, pb = ref(d, s_['detail'], s_['detail'])
            s_['banques'] = [u32(d, pb + 4 + 4 * k) for k in range(u32(d, pb))] if pb else []
            fl_ = u32(d, s_['detail'] + 12)
            s_['debut'] = u32(d, s_['detail'] + 16) if fl_ & 1 else 0   
    banques = []
    for _, bo in table_refs(d, R[2][1]):
        banques.append(dict(fichier=u32(d, bo), nom=nom(u32(d, bo + 16), bo + 20) if False else None))
    archives = []
    for _, ao in table_refs(d, R[3][1]):
        archives.append(dict(fichier=u32(d, ao)))
    jeux = []   
    for _, jo in table_refs(d, R[1][1]):
        jeux.append(dict(premier=u32(d, jo) & 0xffffff, dernier=u32(d, jo + 4) & 0xffffff))
    return dict(noms=noms, sons=sons, fichiers=fichiers, banques=banques, archives=archives, jeux=jeux)

def onde_archive(C, cache, arch, idx):
    if arch not in cache:
        f = C['fichiers'][C['archives'][arch & 0xffffff]['fichier']] if (arch & 0xffffff) < len(C['archives']) else None
        cache[arch] = lire_cwar(f) if f else []
    lst = cache[arch]
    return lire_cwav(lst[idx]) if idx < len(lst) and lst[idx] else None

def _table_regions(d, o):
    t, p = ref(d, o, o)
    if p is None: return []
    if t == 0x6000:
        _, q = ref(d, p, p); return [(127, q)]
    if t == 0x6001:
        n = u32(d, p); bornes = list(d[p + 4:p + 4 + n]); base = p + 4 + ((n + 3) & ~3)
        return [(bornes[k], ref(d, base + 8 * k, p)[1]) for k in range(n)]
    if t == 0x6002:
        mn, mx = d[p], d[p + 1]; base = p + 4
        return [(mn + k, ref(d, base + 8 * k, p)[1]) for k in range(mx - mn + 1)]
    return []

def lire_cbnk(d):
    B = blocs(d); info, _ = B[0x5800]; i = info + 8
    ids = ondes_cbnk(d)
    _, pi = ref(d, i + 8, i)
    instruments = []
    for t, o in table_refs(d, pi):
        if o is None or t != 0x5900: instruments.append(None); continue
        try:
            instruments.append(_instrument(d, o, ids))
        except (struct.error, IndexError, TypeError):
            instruments.append(None)
    return instruments

def _instrument(d, o, ids):
        cles = []
        for khi, kr in _table_regions(d, o):
            vels = []
            if kr is None: continue
            for vhi, vr in _table_regions(d, kr):
                if vr is None: continue
                onde = u32(d, vr); fl = u32(d, vr + 4); q = vr + 8
                r = dict(onde=ids[onde] if onde < len(ids) else None, cle=60, volume=127, pan=64, pitch=1.0, relache=127)
                if fl & 1: r['cle'] = u32(d, q) & 0xff; q += 4
                if fl & 2: r['volume'] = u32(d, q) & 0xff; q += 4
                if fl & 4: r['pan'] = u32(d, q) & 0xff; q += 4
                if fl & 8: r['pitch'] = struct.unpack_from('<f', d, q)[0]; q += 4
                if fl & 16: q += 4
                if fl & 0x100: q += 4
                if fl & 0x200:
                    _, pa = ref(d, vr + u32(d, q), vr + u32(d, q)); q += 4
                    if pa: r['adsr'] = list(d[pa:pa + 5]); r['relache'] = d[pa + 4]
                vels.append((vhi, r))
            cles.append((khi, vels))
        return cles

def labels_cseq(d):
    B = blocs(d); lb = B[0x5001][0]; da = B[0x5000][0]
    out = {}
    for _, o in table_refs(d, lb + 8):
        _, p = ref(d, o, da + 8); n = u32(d, o + 8); out[d[o + 12:o + 12 + n].decode()] = p
    return out, da + 8

def _varint(d, p):
    v = 0
    while True:
        b = d[p]; p += 1; v = (v << 7) | (b & 0x7f)
        if not b & 0x80: return v, p

ARGS1 = set(range(0xB0, 0xE0)) - {0xB3}

def evenements_sequence(d, base, depart, duree_max_tics=96 * 8):
    notes = []; tempo = [120]
    pistes = [dict(pc=depart, t=0, prog=0, transp=0, vol=127, vol2=127, pan=64, attente=True, pile=[], fin=False, id=0)]
    k = 0
    while k < len(pistes):
        P = pistes[k]; k += 1
        garde = 0
        while not P['fin'] and P['t'] < duree_max_tics and garde < 5000:
            garde += 1
            p = P['pc']; c = d[p]; p += 1
            prefixe = None
            if c in (0xA0, 0xA3, 0xA4):
                prefixe = c; c = d[p]; p += 1
            def arg_s16(pp):   
                return struct.unpack_from('>h', d, pp)[0], pp + 2
            if c < 0x80:
                vel = d[p]; p += 1
                if prefixe == 0xA0: a, p = arg_s16(p); b, p = arg_s16(p); lon = (a + b) // 2
                else: lon, p = _varint(d, p)
                if prefixe in (0xA3, 0xA4): p += 2
                notes.append((P['t'], P['id'], P['prog'], c + P['transp'], vel, lon, P['vol'] * P['vol2'] // 127, P['pan']))
                if P['attente']: P['t'] += lon
            elif c == 0x80:
                if prefixe == 0xA0: a, p = arg_s16(p); b, p = arg_s16(p); v = (a + b) // 2
                else: v, p = _varint(d, p)
                P['t'] += v
            elif c == 0x81:
                if prefixe == 0xA0: a, p = arg_s16(p); b, p = arg_s16(p); v = a
                else: v, p = _varint(d, p)
                P['prog'] = v
            elif c == 0x88:
                no = d[p]; off = d[p + 1] << 16 | d[p + 2] << 8 | d[p + 3]; p += 4
                pistes.append(dict(pc=base + off, t=P['t'], prog=0, transp=0, vol=127, vol2=127, pan=64, attente=True, pile=[], fin=False, id=no))
            elif c == 0x89:
                off = d[p] << 16 | d[p + 1] << 8 | d[p + 2]; p = base + off
            elif c == 0x8A:
                off = d[p] << 16 | d[p + 1] << 8 | d[p + 2]; P['pile'].append(p + 3); p = base + off
            elif c == 0xFD:
                if P['pile']: p = P['pile'].pop()
                else: P['fin'] = True
            elif c == 0xFE: p += 2
            elif c in (0xFF,): P['fin'] = True
            elif c == 0xFC: pass
            elif c in (0xE0, 0xE1, 0xE2, 0xE3, 0xE4, 0xE5):
                v = struct.unpack_from('>H', d, p)[0]; p += 2
                if prefixe == 0xA0: p += 2
                if c == 0xE1: tempo[0] = v
            elif c == 0xF0:
                p += 4
            elif c in ARGS1 or c == 0xB3:
                v = d[p]; p += 1 if c != 0xB3 else 2
                if prefixe == 0xA0: p += 3   
                if c == 0xC1: P['vol'] = v
                elif c == 0xD5: P['vol2'] = v if prefixe != 0xA3 else v
                elif c == 0xC0: P['pan'] = v
                elif c == 0xC3: P['transp'] = struct.unpack('b', bytes([v]))[0]
                elif c == 0xC7: P['attente'] = bool(v)
            else:
                P['fin'] = True   
            if prefixe in (0xA3, 0xA4) and c >= 0x80: p += 2
            P['pc'] = p
    return notes, tempo[0]

def rendre_notes(C, notes, tempo, banque, cache, freq_sortie=32728, base_temps=48, max_s=4.0):
    instr = banque
    tic = 60.0 / (tempo * base_temps)
    N = int(max_s * freq_sortie)
    G = [0.0] * N; D = [0.0] * N; fin = 0
    for (t, piste, prog, cle, vel, lon, vol, pan) in notes:
        if prog >= len(instr) or not instr[prog]: continue
        r = None
        for khi, vels in instr[prog]:
            if cle <= khi:
                for vhi, rr in vels:
                    if vel <= vhi: r = rr; break
                break
        if not r or not r['onde']: continue
        arch, idx = r['onde']
        o = onde_archive(C, cache, arch, idx)
        if not o: continue
        src = o['pistes'][0]; srcD = o['pistes'][1] if len(o['pistes']) > 1 else src
        pas = o['frequence'] / freq_sortie * (2 ** ((cle - r['cle']) / 12)) * r['pitch']
        g = vel / 127 * vol / 127 * r['volume'] / 127 / 32768
        pn = max(0, min(127, pan + r['pan'] - 64)) / 127
        gg, gd = g * math.cos(pn * math.pi / 2) * 1.2, g * math.sin(pn * math.pi / 2) * 1.2
        debut = int(t * tic * freq_sortie)
        long_max = int(lon * tic * freq_sortie) if lon else None
        if o['boucle'] and not lon: long_max = int(2.0 * freq_sortie)
        x = 0.0; i = debut; n_src = len(src); lb = o['debut_boucle']
        while i < N:
            if x >= n_src - 1:
                if o['boucle']: x = lb + (x - (n_src - 1))
                else: break
            if long_max is not None and i - debut >= long_max: break
            k0 = int(x); f = x - k0
            a = src[k0] + (src[k0 + 1] - src[k0]) * f; b = srcD[k0] + (srcD[k0 + 1] - srcD[k0]) * f
            G[i] += a * gg; D[i] += b * gd
            x += pas; i += 1
        fin = max(fin, i)
    fin = min(N, fin + int(0.02 * freq_sortie))
    return [(max(-1, min(1, G[k])), max(-1, min(1, D[k]))) for k in range(fin)], freq_sortie

def ecrire_wav_stereo(chemin, ech, freq):
    with wave.open(str(chemin), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(freq)
        w.writeframes(b''.join(struct.pack('<hh', int(a * 32767), int(b * 32767)) for a, b in ech))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bcsar', default='/dev/shm/ba-romfs/romfs/region_common/sound/center.bcsar')
    ap.add_argument('--sortie', default=str(Path(__file__).resolve().parents[2] / 'ressources-privees/sons/badge-arcade/romfs'))
    ap.add_argument('--filtre', default='')
    ap.add_argument('--liste', action='store_true')
    a = ap.parse_args()
    d = Path(a.bcsar).read_bytes()
    C = lire_csar(d)
    if a.liste:
        for k, s in enumerate(C['sons']): print(k, s['nom'], s['type'], 'fichier', s['fichier'], s.get('index', ''), s.get('banques', ''))
        return
    out = Path(a.sortie); out.mkdir(parents=True, exist_ok=True)
    cache = {}; cwsd = {}; faits = []; banques_lues = {}
    for s in C['sons']:
        if not s['nom'] or a.filtre not in s['nom']: continue
        f = C['fichiers'][s['fichier']] if s['fichier'] < len(C['fichiers']) else None
        if s['type'] == 'onde' and f and f[:4] == b'CWSD':
            if s['fichier'] not in cwsd: cwsd[s['fichier']] = lire_cwsd(f)
            ids, ws = cwsd[s['fichier']]
            for j, wi in enumerate(ws[s['index']] if s['index'] < len(ws) else []):
                arch, idx = ids[wi]
                o = onde_archive(C, cache, arch, idx)
                if not o: continue
                nomf = s['nom'] + ('' if j == 0 else '_%d' % j) + '.wav'
                ecrire_wav(out / nomf, o)
                faits.append(dict(son=s['nom'], fichier=nomf, frequence=o['frequence'], duree=round(len(o['pistes'][0]) / o['frequence'], 3),
                                  boucle=o['boucle'], canaux=len(o['pistes']), volume=s['volume'], archive=arch & 0xffffff, onde=idx))
        elif s['type'] == 'sequence' and f and f[:4] == b'CSEQ':
            lab, base = labels_cseq(f)
            depart = base + s['debut']
            try:
                notes, tempo = evenements_sequence(f, base, depart)
            except (struct.error, IndexError) as e:
                print('séquence illisible', s['nom'], e); continue
            b_ = (s.get('banques') or [None])[0]
            if b_ is None or (b_ & 0xffffff) >= len(C['banques']): continue
            bf = C['fichiers'][C['banques'][b_ & 0xffffff]['fichier']]
            if not bf: continue
            if id(bf) not in banques_lues: banques_lues[id(bf)] = lire_cbnk(bf)
            ech, fr = rendre_notes(C, notes, tempo, banques_lues[id(bf)], cache)
            if not ech: continue
            nomf = s['nom'] + '.wav'
            ecrire_wav_stereo(out / nomf, ech, fr)
            ondes = []
            for n_ in notes:
                ins = banques_lues[id(bf)]
                if n_[2] >= len(ins) or not ins[n_[2]]: continue
                rr = next((r for khi, vs in ins[n_[2]] if n_[3] <= khi for vhi, r in vs if n_[4] <= vhi), None)
                if not rr or not rr['onde']: continue
                ar, ix = rr['onde']; nomo = 'ondes/%d_%03d.wav' % (ar & 0xffffff, ix)
                o_ = onde_archive(C, cache, ar, ix)
                if not o_: continue
                if not (out / nomo).exists():
                    (out / 'ondes').mkdir(exist_ok=True); ecrire_wav(out / nomo, o_)
                ondes.append(dict(fichier=nomo, programme=n_[2], cle_origine=rr['cle'], boucle=o_['boucle'],
                                  debut_boucle=o_['debut_boucle'], fin=o_['fin'], frequence=o_['frequence']))
            faits.append(dict(son=s['nom'], fichier=nomf, type='sequence rendue', duree=round(len(ech) / fr, 3), volume=s['volume'],
                              notes=[dict(tic=n[0], piste=n[1], programme=n[2], cle=n[3], velocite=n[4], duree_tics=n[5]) for n in notes], tempo=tempo,
                              ondes=ondes))
    (out / 'index.json').write_text(json.dumps(faits, ensure_ascii=False, indent=1))
    print(len([x for x in faits if 'fichier' in x]), 'ondes écrites dans', out)

if __name__ == '__main__':
    main()
