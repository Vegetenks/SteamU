import base64
import cmath
import math
import struct
import zlib
from array import array
from collections import defaultdict, deque
from functools import lru_cache
from empreinte_regles import *

DUREE_PURE = 24

@lru_cache(maxsize=3)
def _plan(n):
    bits = n.bit_length() - 1
    ordre = [int(format(k, '0%db' % bits)[::-1], 2) for k in range(n)]
    tours = []
    m = 2
    while m <= n:
        tours.append([cmath.exp(-2j * math.pi * k / m) for k in range(m // 2)])
        m *= 2
    return ordre, tours, [0.5 - 0.5 * math.cos(2 * math.pi * k / (n - 1)) for k in range(n)]

@lru_cache(maxsize=2)
def _reel(n):
    return [cmath.exp(-2j * math.pi * k / n) for k in range(n // 2 + 1)]

def _puissance(x, debut, n):
    ordre, tours, _ = _plan(n // 2)
    fen = _plan(n)[2]
    a = [complex(x[debut + 2*k] * fen[2*k], x[debut + 2*k + 1] * fen[2*k + 1]) for k in ordre]
    m = 2
    for poids in tours:
        h = m // 2
        for j in range(0, n // 2, m):
            for k, w in enumerate(poids):
                u, v = a[j + k], a[j + k + h] * w
                a[j + k], a[j + k + h] = u + v, u - v
        m *= 2
    puissances = []
    for k, w in enumerate(_reel(n)):
        u, v = a[k % (n // 2)], a[-k % (n // 2)].conjugate()
        z = .5 * (u + v) - .5j * w * (u - v)
        puissances.append(z.real*z.real + z.imag*z.imag)
    return puissances

def _bande(p, n):
    seuil = max(p[1:], default=0) * 1e-7
    return max((k for k in range(1, len(p)) if p[k] > seuil), default=0) * FREQUENCE // n

def _maxima(ligne, rayon):
    n = len(ligne)
    etendue = list(ligne[-rayon:]) + list(ligne) + list(ligne[:rayon])
    file, sortie = deque(), []
    for i, v in enumerate(etendue):
        while file and etendue[file[-1]] <= v: file.pop()
        file.append(i)
        while file and file[0] < i - 2 * rayon: file.popleft()
        if i >= 2 * rayon: sortie.append(etendue[file[0]])
    return sortie[:n]

def reperes(x):
    x = x[:DUREE_PURE * FREQUENCE]
    n = 1 + (len(x) - FENETRE) // PAS
    if n < 1: return [], [], 0
    S, moyenne = [], [0.0] * (FENETRE // 2 + 1)
    for t in range(n):
        p = _puissance(x, t * PAS, FENETRE)
        moyenne = [a + b for a, b in zip(moyenne, p)]
        S.append(array('f', (10 * math.log10(v + 1e-10) for v in p[1:BINS + 1])))
    bande = _bande([v / n + 1e-12 for v in moyenne], FENETRE)
    seuil = max(map(max, S)) - 70
    M = [_maxima(s, VOISINS_F) for s in S]
    for f in range(BINS):
        colonne = _maxima([m[f] for m in M], min(VOISINS_T, n - 1))
        for t, v in enumerate(colonne): M[t][f] = v
    secondes = defaultdict(list)
    for t, ligne in enumerate(S):
        for f, v in enumerate(ligne):
            if v > seuil and v == M[t][f]: secondes[t * PAS // FREQUENCE].append((t, f, v))
    pics = sorted((t, f // 2) for groupe in secondes.values()
                  for t, f, _ in sorted(groupe, key=lambda p: -p[2])[:PICS_PAR_SECONDE])
    codes, instants, pris = [], [], [0] * len(pics)
    for k in range(1, min(4 * PICS_PAR_SECONDE, len(pics))):
        for i, ((t, f), (u, g)) in enumerate(zip(pics, pics[k:])):
            dt = u - t
            if 0 < dt <= ZONE and pris[i] < ELAN:
                pris[i] += 1; codes.append((f << 14) | (g << 6) | dt); instants.append(t)
    return codes, instants, bande

def emballer(codes, instants):
    b = struct.pack('<%dI' % len(codes), *codes) + struct.pack('<%dH' % len(instants), *instants)
    return base64.b64encode(zlib.compress(b, 9)).decode()

def deballer(texte):
    b = zlib.decompress(base64.b64decode(texte)); n = len(b) // 6
    return struct.unpack('<%dI' % n, b[:4 * n]), struct.unpack('<%dH' % n, b[4 * n:])

def comparer(codes, instants, references):
    index = defaultdict(list)
    for k, (rc, ri) in enumerate(references):
        for c, t in zip(rc, ri): index[c].append((k, t))
    paires = [(t, u, k) for c, t in zip(codes, instants) if len(index[c]) <= BANAL for k, u in index[c]]
    if not paires: return None
    def voter(e):
        votes = defaultdict(int)
        for t, u, k in paires:
            d = u - round(t * e)
            if -DECALAGE_MAX <= d < DECALAGE_MAX:
                for delta in range(-LISSAGE, LISSAGE + 1):
                    if -DECALAGE_MAX <= d + delta < DECALAGE_MAX: votes[k, d + delta] += 1
        if not votes: return 0, 0, 0, e
        k, d = min(votes, key=lambda p: (-votes[p], p))
        return k, votes[k, d], d, e
    meilleur = voter(1.0)
    if meilleur[1] >= PART_SURE * len(codes): return meilleur
    for e in ECHELLES:
        v = voter(e)
        if v[1] > meilleur[1]: meilleur = v
    return meilleur

def signature(x):
    nfft = 2 * TRAME_COURTE
    if len(x) < 3 * TRAME_COURTE: x = list(x) + [0.0] * (3 * TRAME_COURTE - len(x))
    n = 1 + (len(x) - nfft) // TRAME_COURTE
    bornes = [150 * (8000 / 150) ** (k / BANDES_COURTES) for k in range(BANDES_COURTES + 1)]
    bandes = [[k for k in range(nfft // 2 + 1) if a <= k * FREQUENCE / nfft < b] for a, b in zip(bornes, bornes[1:])]
    E, total, moyenne = [], [], [0.0] * (nfft // 2 + 1)
    for t in range(n):
        p = _puissance(x, t * TRAME_COURTE, nfft)
        moyenne = [a + b for a, b in zip(moyenne, p)]
        e = [sum(p[k] for k in bande) for bande in bandes]
        E.append(e); total.append(10 * math.log10(sum(e) + 1e-12))
    bande = _bande([v / n + 1e-12 for v in moyenne], nfft)
    fort = max(total)
    actives = [k for k, v in enumerate(total) if v > fort - 45]
    if not actives or fort < -100: return [], bande
    db = [[10 * math.log10(v + 1e-12) for v in e] for e in E[actives[0]:actives[-1] + 1]]
    bas = max(map(max, db)) - PLAGE_COURTE
    return [bytes(max(0, min(240, int((v - bas) * 4))) for v in ligne) for ligne in db], bande

def emballer_signature(m):
    return base64.b64encode(zlib.compress(b''.join(bytes(l) for l in m), 9)).decode()

def deballer_signature(texte):
    b = zlib.decompress(base64.b64decode(texte))
    return [b[k:k + BANDES_COURTES] for k in range(0, len(b), BANDES_COURTES)]

def _correlation(x, y):
    n = len(x)
    sx, sy = sum(x), sum(y)
    den = (sum(v*v for v in x) - sx*sx/n) * (sum(v*v for v in y) - sy*sy/n)
    return (sum(a*b for a, b in zip(x, y)) - sx*sy/n) / math.sqrt(den) if den > 0 else 0.0

def comparer_court(sig, references):
    scores = []
    for k, r in references:
        if not sig or not r or max(len(sig), len(r)) > DUREE_RAPPORT * min(len(sig), len(r)) + 2: continue
        meilleur = -1.0
        for d in range(-DECALAGE_COURT, DECALAGE_COURT + 1):
            x, y = (sig[d:], r) if d >= 0 else (sig, r[-d:])
            n = min(len(x), len(y))
            if n < 1 or n < 0.8 * max(len(sig), len(r)): continue
            meilleur = max(meilleur, _correlation(b''.join(x[:n]), b''.join(y[:n])))
        scores.append((meilleur, k))
    scores.sort(reverse=True)
    return (scores[0][1], scores[0][0], scores[1][0] if len(scores) > 1 else -1.0) if scores else None
