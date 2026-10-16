import base64, json, os, subprocess, sys, zlib
import numpy as np

FREQUENCE = 32000            
FENETRE, PAS = 4096, 1024    
BINS = 512                   
VOISINS_F, VOISINS_T = 12, 8 
PICS_PAR_SECONDE = 8         
ELAN, ZONE = 3, 63           
DUREE_LUE = 400              
DELAI = 60                   
COMMUNS_MIN = 25             
PART_MIN = 0.03              
BANDE_MIN = 0.62             
BANAL = 64                   
DECALAGE_MAX = 20000         
LISSAGE = 2                  
ECHELLES = np.round(np.arange(0.94, 1.0605, 0.001), 3)
PART_SURE = 0.15
FORMATS = {"mp3", "ogg", "wav", "flac", "mov", "matroska", "aiff", "aac", "bfstm", "brstm"}
DUREE_COURTE = 8             
TRAME_COURTE = 1024          
BANDES_COURTES = 16          
PLAGE_COURTE = 60            
DECALAGE_COURT = 6           
DUREE_RAPPORT = 1.35         
COURT_MIN = 0.90             
MARGE_COURTE = 0.004         
COURT_SUR = 0.985            

def decoder(chemin, format):
    if format not in FORMATS: return None
    args = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-protocol_whitelist", "file",
            "-f", format, "-t", str(DUREE_LUE), "-i", "file:" + os.path.abspath(chemin),
            "-map", "0:a:0", "-vn", "-sn", "-dn", "-ac", "1", "-ar", str(FREQUENCE), "-f", "s16le", "pipe:1"]
    try: p = subprocess.run(args, stdin=subprocess.DEVNULL, capture_output=True, timeout=DELAI,
                            env={**os.environ, "LD_LIBRARY_PATH": ""})
    except (OSError, subprocess.TimeoutExpired): return None
    n = min(len(p.stdout), (DUREE_LUE + 1) * FREQUENCE * 2) // 2
    if p.returncode != 0: return None                       
    return np.frombuffer(p.stdout[:n * 2], dtype="<i2").astype(np.float32) / 32768

def _spectre(x):
    n = 1 + (len(x) - FENETRE) // PAS
    if n < 1: return np.zeros((0, BINS), np.float32), 0
    fen, moyenne, S = np.hanning(FENETRE).astype(np.float32), np.zeros(FENETRE // 2 + 1), np.empty((n, BINS), np.float32)
    for a in range(0, n, 512):
        b = min(n, a + 512)
        trames = np.lib.stride_tricks.as_strided(x[a * PAS:], (b - a, FENETRE), (x.strides[0] * PAS, x.strides[0]))
        P = np.abs(np.fft.rfft(trames * fen, axis=1)) ** 2
        moyenne += P.sum(axis=0)
        S[a:b] = 10 * np.log10(P[:, 1:BINS + 1] + 1e-10)
    db = 10 * np.log10(moyenne / n + 1e-12)
    haut = np.nonzero(db[1:] > db[1:].max() - 70)[0]          
    return S, int((haut[-1] + 1) * FREQUENCE / FENETRE) if len(haut) else 0

def _max_voisin(S, r, axe):
    m = S.copy()
    for k in range(1, r + 1):
        m = np.maximum(m, np.roll(S, k, axe)); m = np.maximum(m, np.roll(S, -k, axe))
    return m

def reperes(x):
    S, bande = _spectre(x)
    if not len(S): return np.zeros(0, np.uint32), np.zeros(0, np.int32), bande
    pic = (S == _max_voisin(_max_voisin(S, VOISINS_F, 1), VOISINS_T, 0)) & (S > S.max() - 70)
    t, f = np.nonzero(pic)
    garde = []                                               
    sec = t * PAS // FREQUENCE
    for s in np.unique(sec):
        i = np.nonzero(sec == s)[0]
        garde.extend(i[np.argsort(-S[t[i], f[i]])[:PICS_PAR_SECONDE]])
    garde = np.sort(np.array(garde, dtype=np.int64))       
    t, f = t[garde], f[garde] // 2                           
    codes, instants, pris = [], [], np.zeros(len(t), np.int32)
    for k in range(1, 4 * PICS_PAR_SECONDE):                 
        if k >= len(t): break
        dt = t[k:] - t[:-k]
        ok = (dt > 0) & (dt <= ZONE) & (pris[:-k] < ELAN)
        pris[:-k] += ok
        codes.append((f[:-k][ok].astype(np.uint32) << 14) | (f[k:][ok].astype(np.uint32) << 6) | dt[ok].astype(np.uint32))
        instants.append(t[:-k][ok])
    if not codes: return np.zeros(0, np.uint32), np.zeros(0, np.int32), bande
    return np.concatenate(codes), np.concatenate(instants).astype(np.int32), bande

def emballer(codes, instants):
    return base64.b64encode(zlib.compress(codes.astype("<u4").tobytes() + instants.astype("<u2").tobytes(), 9)).decode()

def deballer(texte):
    b = zlib.decompress(base64.b64decode(texte)); n = len(b) // 6
    return np.frombuffer(b[:n * 4], "<u4"), np.frombuffer(b[n * 4:], "<u2").astype(np.int32)

def _voter(tq, tr, k, echelle, n_refs):
    dec = tr - np.rint(tq * echelle).astype(np.int64) + DECALAGE_MAX
    ok = (dec >= 0) & (dec < 2 * DECALAGE_MAX)
    votes = np.bincount(k[ok] * 2 * DECALAGE_MAX + dec[ok], minlength=n_refs * 2 * DECALAGE_MAX).reshape(n_refs, 2 * DECALAGE_MAX)
    c = np.cumsum(np.pad(votes, ((0, 0), (LISSAGE + 1, LISSAGE))), axis=1)
    lisse = c[:, 2 * LISSAGE + 1:] - c[:, :-2 * LISSAGE - 1]     
    i = int(lisse.max(axis=1).argmax()); j = int(lisse[i].argmax())
    return i, int(lisse[i, j]), j - DECALAGE_MAX

def comparer(codes, instants, references):
    if not len(codes) or not references: return None
    rc = np.concatenate([c for c, _ in references])
    ri = np.concatenate([i for _, i in references])
    rk = np.concatenate([np.full(len(c), k, np.int64) for k, (c, _) in enumerate(references)])
    ordre = np.argsort(rc, kind="stable"); rc, ri, rk = rc[ordre], ri[ordre], rk[ordre]
    a, b = np.searchsorted(rc, codes), np.searchsorted(rc, codes, "right")
    n = b - a
    n[n > BANAL] = 0                                         
    if not n.sum(): return None
    q = np.repeat(np.arange(len(codes)), n)                  
    r = np.repeat(a - np.r_[0, np.cumsum(n)[:-1]], n) + np.arange(n.sum())   
    tq, tr, k = instants[q].astype(np.float64), ri[r].astype(np.int64), rk[r]
    meilleur = _voter(tq, tr, k, 1.0, len(references)) + (1.0,)
    if meilleur[1] >= PART_SURE * len(codes): return meilleur
    for e in ECHELLES:
        m = _voter(tq, tr, k, e, len(references))
        if m[1] > meilleur[1]: meilleur = m + (float(e),)
    return meilleur

def signature(x):
    if len(x) < 3 * TRAME_COURTE: x = np.pad(x, (0, 3 * TRAME_COURTE - len(x)))
    n = 1 + (len(x) - 2 * TRAME_COURTE) // TRAME_COURTE
    trames = np.lib.stride_tricks.as_strided(x, (n, 2 * TRAME_COURTE), (x.strides[0] * TRAME_COURTE, x.strides[0]))
    P = np.abs(np.fft.rfft(trames * np.hanning(2 * TRAME_COURTE).astype(np.float32), axis=1)) ** 2
    hz = np.fft.rfftfreq(2 * TRAME_COURTE, 1 / FREQUENCE)
    bornes = np.geomspace(150, 8000, BANDES_COURTES + 1)
    E = np.stack([P[:, (hz >= a) & (hz < b)].sum(axis=1) for a, b in zip(bornes[:-1], bornes[1:])], axis=1)
    total = 10 * np.log10(E.sum(axis=1) + 1e-12)
    dbm = 10 * np.log10(P.mean(axis=0) + 1e-12)
    haut = np.nonzero(dbm[1:] > dbm[1:].max() - 70)[0]
    bande = int((haut[-1] + 1) * FREQUENCE / (2 * TRAME_COURTE)) if len(haut) else 0
    actives = np.nonzero(total > total.max() - 45)[0]
    if not len(actives) or total.max() < -100: return np.zeros((0, BANDES_COURTES), np.uint8), bande
    db = 10 * np.log10(E[actives[0]:actives[-1] + 1] + 1e-12)
    return np.clip((db - (db.max() - PLAGE_COURTE)) * 4, 0, 240).astype(np.uint8), bande

def emballer_signature(m):
    return base64.b64encode(zlib.compress(np.ascontiguousarray(m, np.uint8).tobytes(), 9)).decode()

def deballer_signature(texte):
    return np.frombuffer(zlib.decompress(base64.b64decode(texte)), np.uint8).reshape(-1, BANDES_COURTES)

def _centrer(m):
    v = m.astype(np.float32).ravel(); v = v - v.mean()
    return v / (np.sqrt((v * v).sum()) + 1e-9)

def correlation_courte(a, b):
    meilleur = -1.0
    for d in range(-DECALAGE_COURT, DECALAGE_COURT + 1):
        x, y = (a[d:], b) if d >= 0 else (a, b[-d:])
        n = min(len(x), len(y))
        if n < 1 or n < 0.8 * max(len(a), len(b)): continue
        meilleur = max(meilleur, float(_centrer(x[:n]) @ _centrer(y[:n])))
    return meilleur

def comparer_court(sig, references):
    scores = sorted(((correlation_courte(sig, r), k) for k, r in references
                     if len(sig) and len(r) and max(len(sig), len(r)) <= DUREE_RAPPORT * min(len(sig), len(r)) + 2), reverse=True)
    if not scores: return None
    return scores[0][1], scores[0][0], scores[1][0] if len(scores) > 1 else -1.0

class References:
    def __init__(self, fichier_empreintes):
        self.pistes = json.loads(open(fichier_empreintes, encoding="utf-8").read())["pistes"]
        self.pistes = [p for p in self.pistes if isinstance(p, dict) and isinstance(p.get("chemin"), str)]
        self.longues = [(k, deballer(p["empreinte"])) for k, p in enumerate(self.pistes) if p.get("empreinte")]
        self.courtes = [(k, deballer_signature(p["signature"])) for k, p in enumerate(self.pistes) if p.get("signature")]

    def reconnaitre(self, chemin, format):
        x = decoder(chemin, format)
        if x is None: return {"illisible": True}
        codes, instants, bande = reperes(x)
        m = comparer(codes, instants, [r for _, r in self.longues]) if len(codes) and self.longues and len(x) >= DUREE_COURTE * FREQUENCE else None
        if m and m[1] >= COMMUNS_MIN and m[1] >= PART_MIN * len(codes):
            p = self.pistes[self.longues[m[0]][0]]
            return {"piste": p["chemin"], "communs": m[1], "part": round(m[1] / len(codes), 3), "decalage": round(m[2] * PAS / FREQUENCE, 3),
                    "echelle": m[3], "duree": round(len(x) / FREQUENCE, 2), "bande": bande, "bande_ref": p["bande"],
                    "qualite": "mauvaise" if bande < BANDE_MIN * p["bande"] else "bonne"}
        c = None
        if len(x) <= (DUREE_COURTE * DUREE_RAPPORT + 1) * FREQUENCE and self.courtes:
            sig, bande_c = signature(x)
            c = comparer_court(sig, self.courtes)
            if c and c[1] >= COURT_MIN and (c[1] - c[2] >= MARGE_COURTE or c[1] >= COURT_SUR):
                p = self.pistes[c[0]]
                return {"piste": p["chemin"], "correlation": round(c[1], 4), "deuxieme": round(c[2], 4), "decalage": 0.0, "echelle": 1.0,
                        "duree": round(len(x) / FREQUENCE, 2), "bande": bande_c, "bande_ref": p["bande"],
                        "qualite": "mauvaise" if bande_c < BANDE_MIN * p["bande"] else "bonne"}
        return {"inconnu": True, "communs": m[1] if m else 0, "reperes": int(len(codes)), "correlation": round(c[1], 4) if c else None}

def reconnaitre(chemin, format, fichier_empreintes):
    return References(fichier_empreintes).reconnaitre(chemin, format)

def _un(refs, chemin, format):
    try: return refs.reconnaitre(chemin, format)
    except Exception as e: return {"illisible": True, "erreur": type(e).__name__}

if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--lot":
        refs = References(sys.argv[2])
        for ligne in sys.stdin:                              
            chemin, _, format = ligne.rstrip("\n").partition("\t")
            print(json.dumps(_un(refs, chemin, format)), flush=True)
        sys.exit(0)
    if len(sys.argv) != 4: sys.exit(2)
    try: r = reconnaitre(*sys.argv[1:])
    except Exception as e: r = {"illisible": True, "erreur": type(e).__name__}
    print(json.dumps(r))
