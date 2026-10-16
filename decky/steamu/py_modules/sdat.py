import math, struct

FREQUENCE = 32768            
DUREE_MAX = 6.0              
SON_IMAGES = 192             
BASE_TEMPS = 48              
MIXAGE = 0.28                
AMPL_MIN = -92544            
ATTAQUE = (0x00, 0x01, 0x05, 0x0E, 0x1A, 0x26, 0x33, 0x3F, 0x49, 0x54, 0x5C, 0x64, 0x6D, 0x74, 0x7B, 0x7F, 0x84, 0x89, 0x8F)

class Illisible(Exception):
    pass

def _db(v):
    return AMPL_MIN if v <= 0 else max(AMPL_MIN, int(1280 * 40 * math.log10(min(v, 127) / 127)))

def _gain(ampl):
    return 10 ** (ampl / 1280 / 20)

def _chute(v):
    if v >= 0x7F: return 0xFFFF
    if v == 0x7E: return 0x3C00
    return (v << 1) + 1 if v < 0x32 else 0x1E00 // (0x7E - v)

def _attaque(v):
    return ATTAQUE[0x7F - v] if v >= 0x6D else 0xFF - v

class SDAT:
    def __init__(self, d):
        if d[:4] != b"SDAT" or len(d) < 0x40: raise Illisible("pas un SDAT")
        self.d = d
        so, _, io, _, fo, _ = struct.unpack_from("<6I", d, 0x10)
        n, = struct.unpack_from("<I", d, fo + 8)
        if n > 100000 or fo + 12 + 16 * n > len(d): raise Illisible("FAT abîmée")
        self.fat = [struct.unpack_from("<II", d, fo + 12 + 16 * i) for i in range(n)]
        self.info = [struct.unpack_from("<I", d, io + 8 + 4 * k)[0] + io for k in range(8)]
        self.io, self.so = io, so
        self.arcs = self._noms_archives() if so else []

    def fichier(self, i):
        if i >= len(self.fat): raise Illisible("fichier absent")
        o, t = self.fat[i]
        if o + t > len(self.d): raise Illisible("fichier hors du SDAT")
        return self.d[o:o + t]

    def _entree(self, k, i):
        n, = struct.unpack_from("<I", self.d, self.info[k])
        if i >= n: raise Illisible("entrée absente")
        o, = struct.unpack_from("<I", self.d, self.info[k] + 4 + 4 * i)
        if not o: raise Illisible("entrée vide")
        return self.io + o

    def _nom(self, o):
        return self.d[self.so + o:self.d.index(b"\0", self.so + o)].decode("latin-1") if o else None

    def _noms_archives(self):
        d, s = self.d, self.so
        r, = struct.unpack_from("<I", d, s + 8 + 4)
        n, = struct.unpack_from("<I", d, s + r)
        sortie = []
        for i in range(min(n, 4096)):
            no, sous = struct.unpack_from("<II", d, s + r + 4 + 8 * i)
            m, = struct.unpack_from("<I", d, s + sous) if sous else (0,)
            sortie.append((self._nom(no), [self._nom(struct.unpack_from("<I", d, s + sous + 4 + 4 * j)[0]) for j in range(min(m, 4096))]))
        return sortie

    def trouver(self, nom):
        for a, (_, noms) in enumerate(self.arcs):
            if nom in noms: return a, noms.index(nom)
        return None

    def sequence_d_archive(self, a, i):
        fid, = struct.unpack_from("<H", self.d, self._entree(1, a))
        f = self.fichier(fid)
        if f[:4] != b"SSAR": raise Illisible("pas une SSAR")
        base, n = struct.unpack_from("<II", f, 0x18)
        if i >= n: raise Illisible("séquence absente")
        off, banque, vol = struct.unpack_from("<IHB", f, 0x20 + 12 * i)
        return f, base, base + off, banque, vol

    def banque(self, b):
        e = self._entree(2, b)
        fid, = struct.unpack_from("<H", self.d, e)
        ondes = [w for w in struct.unpack_from("<4H", self.d, e + 4)]
        f = self.fichier(fid)
        if f[:4] != b"SBNK": raise Illisible("pas une SBNK")
        n, = struct.unpack_from("<I", f, 0x38)
        instruments = []
        for i in range(min(n, 4096)):
            t, o = struct.unpack_from("<BH", f, 0x3C + 4 * i)
            instruments.append(_instrument(f, t, o))
        return instruments, ondes

    def onde(self, arc_ids, swar, swav, cache):
        cle = (swar, swav)
        if cle not in cache:
            if swar >= 4 or arc_ids[swar] == 0xFFFF: cache[cle] = None; return None
            e = self._entree(3, arc_ids[swar])
            fid, = struct.unpack_from("<I", self.d, e); fid &= 0xFFFFFF
            f = self.fichier(fid)
            if f[:4] != b"SWAR": raise Illisible("pas une SWAR")
            n, = struct.unpack_from("<I", f, 0x38)
            if swav >= n: cache[cle] = None; return None
            o, = struct.unpack_from("<I", f, 0x3C + 4 * swav)
            fin = struct.unpack_from("<I", f, 0x3C + 4 * (swav + 1))[0] if swav + 1 < n else len(f)
            cache[cle] = _swav(f, o, fin)
        return cache[cle]

def _region(f, o):
    swav, swar, cle, a, dc, s, r, pan = struct.unpack_from("<HHBBBBBB", f, o)
    return {"swav": swav, "swar": swar, "cle": cle, "attaque": a, "declin": dc, "maintien": s, "relache": r, "pan": pan}

def _instrument(f, t, o):
    if t in (1, 2, 3): return [(127, t, _region(f, o))]
    if t == 16:
        bas, haut = f[o], f[o + 1]
        return [(k, struct.unpack_from("<H", f, o + 2 + 12 * (k - bas))[0], _region(f, o + 4 + 12 * (k - bas))) for k in range(bas, haut + 1)]
    if t == 17:
        hauts = [x for x in f[o:o + 8] if x]
        return [(h, struct.unpack_from("<H", f, o + 8 + 12 * j)[0], _region(f, o + 10 + 12 * j)) for j, h in enumerate(hauts)]
    return []

IMA_PAS = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130,
           143, 157, 173, 190, 209, 230, 253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963, 1060, 1166, 1282,
           1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327, 3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493,
           10442, 11487, 12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767]
IMA_INDICE = [-1, -1, -1, -1, 2, 4, 6, 8]

def _swav(f, o, fin):
    typ, boucle, freq, _, lb, ll = struct.unpack_from("<BBHHHI", f, o)
    d = f[o + 12:min(fin, o + 12 + 4 * (lb + ll)) if lb + ll else fin]
    if typ == 0: e = [(x - 256 if x > 127 else x) / 128 for x in d]; debut = 4 * lb
    elif typ == 1: e = [x / 32768 for x in struct.unpack("<%dh" % (len(d) // 2), d[:len(d) // 2 * 2])]; debut = 2 * lb
    elif typ == 2:
        v, idx = struct.unpack_from("<hB", d, 0); idx = min(idx, 88); e = []
        for octet in d[4:]:
            for n in (octet & 15, octet >> 4):
                pas = IMA_PAS[idx]; diff = pas >> 3
                if n & 1: diff += pas >> 2
                if n & 2: diff += pas >> 1
                if n & 4: diff += pas
                v = max(-32768, min(32767, v - diff if n & 8 else v + diff))
                idx = max(0, min(88, idx + IMA_INDICE[n & 7]))
                e.append(v / 32768)
        debut = max(0, 8 * lb - 8)
    else: raise Illisible("onde de type %d" % typ)
    return {"echantillons": e, "frequence": freq or 32768, "boucle": bool(boucle) and debut < len(e), "debut_boucle": debut}

def _varint(d, p):
    v = 0
    for _ in range(4):
        b = d[p]; p += 1; v = (v << 7) | (b & 0x7F)
        if not b & 0x80: break
    return v, p

def evenements(d, base, depart, tics_max):
    notes, tempos = [], [(0, 120)]
    pistes = [{"pc": depart, "t": 0}]
    k = 0
    while k < len(pistes) and k < 16:
        P = pistes[k]; k += 1
        P.update(prog=0, transp=0, vol=127, expr=127, pan=64, bend=0, plage=2, attente=True, pile=[], boucles=[],
                 a=-1, dc=-1, s=-1, r=-1)
        garde = 0
        while P["t"] < tics_max and garde < 20000 and 0 <= P["pc"] < len(d):
            garde += 1
            p = P["pc"]; c = d[p]; p += 1
            prefixe = None
            if c in (0xA0, 0xA1, 0xA2):
                prefixe = c; c = d[p]; p += 1

            def arg8(p):
                if prefixe == 0xA0: a, b = struct.unpack_from("<hh", d, p); return (a + b) // 2, p + 4
                if prefixe == 0xA1: return 0, p + 1
                return d[p], p + 1

            def arg16(p):
                if prefixe == 0xA0: a, b = struct.unpack_from("<hh", d, p); return (a + b) // 2, p + 4
                if prefixe == 0xA1: return 0, p + 1
                return struct.unpack_from("<h", d, p)[0], p + 2

            def argvar(p):
                if prefixe == 0xA0: a, b = struct.unpack_from("<hh", d, p); return (a + b) // 2, p + 4
                if prefixe == 0xA1: return 0, p + 1
                return _varint(d, p)
            if c < 0x80:
                vel = d[p]; p += 1
                lon, p = argvar(p)
                notes.append((P["t"], c + P["transp"], vel, lon, P["prog"], P["vol"] * P["expr"] // 127, P["pan"],
                              P["bend"] / 127 * P["plage"], P["a"], P["dc"], P["s"], P["r"]))
                if P["attente"]: P["t"] += lon
            elif c == 0x80: v, p = argvar(p); P["t"] += v
            elif c == 0x81: v, p = argvar(p); P["prog"] = v
            elif c == 0x93:
                no = d[p]; off = d[p + 1] | d[p + 2] << 8 | d[p + 3] << 16; p += 4
                if len(pistes) < 16: pistes.append({"pc": base + off, "t": P["t"]})
            elif c == 0x94:
                off = d[p] | d[p + 1] << 8 | d[p + 2] << 16; p = base + off
            elif c == 0x95:
                off = d[p] | d[p + 1] << 8 | d[p + 2] << 16; P["pile"].append(p + 3); p = base + off
                if len(P["pile"]) > 8: break
            elif 0xB0 <= c <= 0xBD: p += 3 if prefixe != 0xA0 else 5
            elif 0xC0 <= c <= 0xD7:
                v, p = arg8(p)
                if c == 0xC0: P["pan"] = v
                elif c == 0xC1: P["vol"] = v
                elif c == 0xC3: P["transp"] = v - 256 if v > 127 else v
                elif c == 0xC4: P["bend"] = v - 256 if v > 127 else v
                elif c == 0xC5: P["plage"] = v
                elif c == 0xC7: P["attente"] = bool(v)
                elif c == 0xD0: P["a"] = v
                elif c == 0xD1: P["dc"] = v
                elif c == 0xD2: P["s"] = v
                elif c == 0xD3: P["r"] = v
                elif c == 0xD4: P["boucles"].append([p, v])
                elif c == 0xD5: P["expr"] = v
            elif c in (0xE0, 0xE1, 0xE3):
                v, p = arg16(p)
                if c == 0xE1 and v > 0: tempos.append((P["t"], v))
            elif c == 0xFC:
                if P["boucles"]:
                    b = P["boucles"][-1]
                    if b[1] == 0: p = b[0]                       
                    elif b[1] > 1: b[1] -= 1; p = b[0]
                    else: P["boucles"].pop()
            elif c == 0xFD:
                if not P["pile"]: break
                p = P["pile"].pop()
            elif c == 0xFE: p += 2
            elif c == 0xFF: break
            else: break                                          
            P["pc"] = p
    return sorted(notes), sorted(tempos)

def _secondes(tempos):
    def f(t):
        s, t0, bpm = 0.0, 0, 120
        for tt, b in tempos:
            if tt > t: break
            s += (tt - t0) * 60 / (bpm * BASE_TEMPS); t0, bpm = tt, b
        return s + (t - t0) * 60 / (bpm * BASE_TEMPS)
    return f

def rendre(S, nom):
    ou = S.trouver(nom)
    if not ou: return None
    f, base, depart, b, vol_seq = S.sequence_d_archive(*ou)
    instruments, arcs = S.banque(b)
    notes, tempos = evenements(f, base, depart, int(DUREE_MAX * 4 * BASE_TEMPS))
    sec = _secondes(tempos)
    N = int(DUREE_MAX * FREQUENCE)
    G, D, fin, cache = [0.0] * N, [0.0] * N, 0, {}
    for (t, cle, vel, lon, prog, vol, pan, bend, a_, dc_, s_, r_) in notes:
        if prog >= len(instruments): continue
        region = next(((typ, r) for haut, typ, r in instruments[prog] if cle <= haut), None)
        if not region: continue
        typ, r = region
        a = _attaque(a_ if a_ >= 0 else r["attaque"]); dc = _chute(dc_ if dc_ >= 0 else r["declin"])
        sus = _db(s_ if s_ >= 0 else r["maintien"]); rel = _chute(r_ if r_ >= 0 else r["relache"])
        o = S.onde(arcs, r["swar"], r["swav"], cache) if typ == 1 else None
        if typ == 1 and not o: continue
        hauteur = 2 ** ((cle - r["cle"] + bend) / 12)
        pas = (o["frequence"] if o else 0) / FREQUENCE * hauteur
        gain = _gain(_db(vel) + _db(vol) + _db(vol_seq)) * MIXAGE
        pn = max(0, min(127, pan + r["pan"] - 64)) / 127
        gg, gd = gain * math.cos(pn * math.pi / 2) * 1.4, gain * math.sin(pn * math.pi / 2) * 1.4
        debut = int(sec(t) * FREQUENCE); arret = int(sec(t + lon) * FREQUENCE) if lon else None
        if arret is not None and arret <= debut: arret = debut + 1
        src = o["echantillons"] if o else None
        x, i, ampl, phase, etat, image = 0.0, debut, AMPL_MIN, "attaque", 0, FREQUENCE // SON_IMAGES
        bruit, freq_psg = 0x7FFF, 440 * 2 ** ((cle - 69 + bend) / 12)
        while i < N:
            if (i - debut) % image == 0:                   
                if arret is not None and i >= arret and phase != "relache": phase = "relache"
                if phase == "attaque":
                    ampl = (a * ampl) // 255
                    if ampl >= -1 or a == 0: ampl, phase = 0, "declin"
                elif phase == "declin":
                    ampl -= dc
                    if ampl <= sus: ampl, phase = sus, "maintien"
                elif phase == "relache":
                    ampl -= rel
                    if ampl <= AMPL_MIN: break
                g = _gain(ampl)
            if typ == 1:
                if x >= len(src) - 1:
                    if o["boucle"] and len(src) - 1 > o["debut_boucle"]: x = o["debut_boucle"] + (x - (len(src) - 1)) % (len(src) - 1 - o["debut_boucle"])
                    else: break
                k0 = int(x); v = src[k0] + (src[k0 + 1] - src[k0]) * (x - k0); x += pas
            elif typ == 2:                                  
                v = 0.5 if (x % 1) < (min(r["swav"], 7) + 1) / 8 else -0.5; x += freq_psg / FREQUENCE
            else:                                           
                x += freq_psg / FREQUENCE
                while x >= 1:
                    x -= 1; bruit = (bruit >> 1) ^ (0x6000 if bruit & 1 else 0)
                v = 0.5 if bruit & 1 else -0.5
            G[i] += v * gg * g; D[i] += v * gd * g; i += 1
        fin = max(fin, i)
    if not fin: return None
    fin = min(N, fin + int(0.02 * FREQUENCE))
    return G[:fin], D[:fin]

def wav(G, D):
    donnees = b"".join(struct.pack("<hh", int(max(-1, min(1, a)) * 32767), int(max(-1, min(1, b)) * 32767)) for a, b in zip(G, D))
    return (b"RIFF" + struct.pack("<I", 36 + len(donnees)) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, 2, FREQUENCE, FREQUENCE * 4, 4, 16)
            + b"data" + struct.pack("<I", len(donnees)) + donnees)
