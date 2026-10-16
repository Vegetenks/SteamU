import struct

def _diff(d):
    if d[0x100:0x104] != b"DIFF": raise ValueError("pas un conteneur DIFF")
    sec, prim, _, part_off, part_taille = struct.unpack_from("<QQQQQ", d, 0x108)
    table = sec if struct.unpack_from("<I", d, 0x130)[0] else prim
    if d[table:table + 4] != b"DIFI": raise ValueError("table de partition DIFI introuvable")
    ivfc_off, _, dpfs_off, _ = struct.unpack_from("<QQQQ", d, table + 8)
    externe, selecteur = d[table + 0x38], d[table + 0x39]
    ext_off = struct.unpack_from("<Q", d, table + 0x3C)[0]
    iv, dp = table + ivfc_off, table + dpfs_off
    if d[iv:iv + 4] != b"IVFC" or d[dp:dp + 4] != b"DPFS": raise ValueError("descripteurs IVFC/DPFS introuvables")
    n4_off, n4_taille = struct.unpack_from("<QQ", d, iv + 0x58)
    niveaux = [struct.unpack_from("<QQI", d, dp + 8 + k * 0x18) for k in range(3)]
    return part_off, part_taille, n4_off, n4_taille, niveaux, selecteur, (ext_off if externe else None)

def deplier_diff(d):
    part_off, part_taille, n4_off, n4_taille, niveaux, selecteur, externe = _diff(d)
    part = d[part_off:part_off + part_taille]
    lus = lambda o, t: bytes(part[o:o + t]).ljust(t, b"\0")      
    bit = lambda tab, n: struct.unpack_from("<I", tab, n // 32 * 4)[0] >> (31 - n % 32) & 1
    (o1, t1, _), (o2, t2, l2), (o3, t3, l3) = niveaux
    actif, manque = lus(o1 + selecteur * t1, t1), 0
    for niveau, (o, t, lb) in enumerate(((o2, t2, l2), (o3, t3, l3))):
        n, b = bytearray(t), 1 << lb
        for k in range(0, t, b):
            src, taille = o + bit(actif, k // b) * t + k, min(b, t - k)
            n[k:k + taille] = lus(src, taille)
            court = taille - len(part[src:src + taille])
            if court and niveau == 1 and externe is None:    
                manque += max(0, min(k + taille, n4_off + n4_taille) - max(k + taille - court, n4_off))
        actif = n
    if externe is not None:
        return lus(externe, n4_taille), n4_taille - len(part[externe:externe + n4_taille])
    return bytes(actif[n4_off:n4_off + n4_taille]).ljust(n4_taille, b"\0"), manque
