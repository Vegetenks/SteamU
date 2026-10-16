import argparse, hashlib, json, re, struct, sys, zlib
from collections import Counter
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
BOSS_DEFAUT = RACINE / "ressources-privees/badge-arcade/source/boss/EUR_allbadge_v131.dat"
SORTIE_DEFAUT = RACINE / "ressources-privees/badge-arcade/boss"

BOOT9_COMPLET = "2f88744feed717856386400a44bba4b9ca62e76a32c715d4f309c399bf28166f"
BOOT9_PROTEGE = "7331f7edece3dd33f2ab4bd0b3a5d607229fd19212c10b734cedcaf78c1a7b98"
LANGUES = ["ja", "en", "fr", "de", "it", "es", "zh", "ko", "nl", "pt", "ru", "tw"]

def cle_boss(boot9: bytes) -> bytes:
    h = hashlib.sha256(boot9).hexdigest()
    if h == BOOT9_COMPLET:
        base = 0x8000 + 0x5860
    elif h == BOOT9_PROTEGE:
        base = 0x5860
    else:
        sys.exit("boot9.bin inattendu (empreinte %s) : il faut le boot9 d'une 3DS de série, copié par GodMode9." % h)
    return boot9[base + 0x370: base + 0x380]

def dechiffrer_boss(donnees: bytes, cle: bytes) -> bytes:
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    if donnees[:4] != b"boss":
        sys.exit("pas un conteneur BOSS")
    iv = donnees[0x1C:0x28] + b"\x00\x00\x00\x01"
    d = Cipher(algorithms.AES(cle), modes.CTR(iv)).decryptor()
    clair = d.update(donnees[0x28:]) + d.finalize()
    i = clair.find(b"SARC", 0, 0x1000)
    if i < 0:
        sys.exit("déchiffrement faux (pas de SARC) : mauvaise clé ?")
    return clair[i:]

def lire_sarc(s: bytes) -> dict:
    assert s[:4] == b"SARC", "pas un SARC"
    e = "<" if s[6:8] == b"\xff\xfe" else ">"
    hlen = struct.unpack_from(e + "H", s, 4)[0]
    debut_donnees = struct.unpack_from(e + "I", s, 0xC)[0]
    p = hlen
    assert s[p:p + 4] == b"SFAT"
    nb = struct.unpack_from(e + "H", s, p + 6)[0]
    noeuds = [struct.unpack_from(e + "IIII", s, p + 0xC + 16 * k) for k in range(nb)]
    q = p + 0xC + 16 * nb
    assert s[q:q + 4] == b"SFNT"
    noms = q + 8
    fichiers = {}
    for k, (hsh, attr, a, b) in enumerate(noeuds):
        if attr >> 24:   
            o = noms + (attr & 0xFFFFFF) * 4
            nom = s[o:s.index(b"\0", o)].decode("utf-8", "replace")
        else:
            nom = "sans-nom/%08x" % hsh
        fichiers[nom] = s[debut_donnees + a: debut_donnees + b]
    return fichiers

def yaz0(d):
    import ctr
    return ctr.yaz0(d)

ETC1_TABLE = [(2, 8), (5, 17), (9, 29), (13, 42), (18, 60), (24, 80), (33, 106), (47, 183)]
BLOCS_TUILE = [(0, 0), (4, 0), (0, 4), (4, 4)]

def _sat(v):
    return 0 if v < 0 else 255 if v > 255 else v

def _bloc_etc1(blk):
    hi, lo = blk >> 32, blk & 0xFFFFFFFF
    flip, diff = hi & 1, (hi >> 1) & 1
    t = (ETC1_TABLE[(hi >> 5) & 7], ETC1_TABLE[(hi >> 2) & 7])
    if diff:
        def s3(v):
            return v - 8 if v & 4 else v
        def e5(v):
            return (v << 3) | (v >> 2)
        r, g, b = (hi >> 27) & 31, (hi >> 19) & 31, (hi >> 11) & 31
        c1 = (e5(r), e5(g), e5(b))
        c2 = (e5((r + s3((hi >> 24) & 7)) & 31), e5((g + s3((hi >> 16) & 7)) & 31), e5((b + s3((hi >> 8) & 7)) & 31))
    else:
        c1 = (((hi >> 28) & 15) * 17, ((hi >> 20) & 15) * 17, ((hi >> 12) & 15) * 17)
        c2 = (((hi >> 24) & 15) * 17, ((hi >> 16) & 15) * 17, ((hi >> 8) & 15) * 17)
    px = []
    for y in range(4):
        for x in range(4):
            sous = (y >= 2) if flip else (x >= 2)
            i = x * 4 + y
            sel = ((lo >> (i + 16)) & 1) << 1 | ((lo >> i) & 1)
            a, b = t[sous]
            m = (a, b, -a, -b)[sel]
            c = c2 if sous else c1
            px.append((x, y, _sat(c[0] + m), _sat(c[1] + m), _sat(c[2] + m)))
    return px

def decoder_etc1(d: bytes, w: int, h: int, alpha: bool, o: int = 0) -> bytearray:
    img = bytearray(w * h * 4)
    for ty in range(0, h, 8):
        for tx in range(0, w, 8):
            for bx, by in BLOCS_TUILE:
                if alpha:
                    a64 = struct.unpack_from("<Q", d, o)[0]; o += 8
                blk = struct.unpack_from("<Q", d, o)[0]; o += 8
                for x, y, r, g, b in _bloc_etc1(blk):
                    X, Y = tx + bx + x, ty + by + y
                    if X < w and Y < h:
                        k = (Y * w + X) * 4
                        img[k:k + 4] = bytes((r, g, b, ((a64 >> ((x * 4 + y) * 4)) & 15) * 17 if alpha else 255))
    return img

def _morton(i):
    x = (i & 1) | ((i & 4) >> 1) | ((i & 16) >> 2)
    y = ((i & 2) >> 1) | ((i & 8) >> 2) | ((i & 32) >> 3)
    return x, y

def decoder_rgb565(d: bytes, w: int, h: int, o: int, a4: int = None) -> bytearray:
    img = bytearray(w * h * 4)
    for i in range(w * h):
        v = struct.unpack_from("<H", d, o + 2 * i)[0]
        r, g, b = (v >> 11) & 31, (v >> 5) & 63, v & 31
        a = 255 if a4 is None else ((d[a4 + i // 2] >> (4 * (i % 2))) & 15) * 17
        tuile, dans = divmod(i, 64)
        x, y = _morton(dans)
        X, Y = 8 * (tuile % (w // 8)) + x, 8 * (tuile // (w // 8)) + y
        k = (Y * w + X) * 4
        img[k:k + 4] = bytes(((r << 3) | (r >> 2), (g << 2) | (g >> 4), (b << 3) | (b >> 2), a))
    return img

def recadrer(img, w, x0, y0, cw, ch):
    out = bytearray()
    for y in range(y0, y0 + ch):
        out += img[(y * w + x0) * 4:(y * w + x0 + cw) * 4]
    return out

def retourner(img, w, h):
    return b"".join(img[(h - 1 - y) * w * 4:(h - y) * w * 4] for y in range(h))

def ecrire_png(chemin: Path, img, w, h):
    chemin.parent.mkdir(parents=True, exist_ok=True)
    brut = b"".join(b"\0" + bytes(img[y * w * 4:(y + 1) * w * 4]) for y in range(h))
    def bloc(t, c):
        return struct.pack(">I", len(c)) + t + c + struct.pack(">I", zlib.crc32(t + c) & 0xFFFFFFFF)
    chemin.write_bytes(b"\x89PNG\r\n\x1a\n" + bloc(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
                       + bloc(b"IDAT", zlib.compress(brut, 9)) + bloc(b"IEND", b""))

def cstr(d, o, n=0x30):
    return d[o:o + n].split(b"\0")[0].decode("ascii", "replace")

def noms_langues(d, o):
    r = {}
    for k, lg in enumerate(LANGUES):
        s = d[o + k * 0x100: o + (k + 1) * 0x100].decode("utf-16-le", "replace").split("\0")[0]
        if s:
            r[lg] = s
    return r

def collision(d, o, fin=None):
    if o <= 0 or o + 4 > len(d):
        return []
    n = struct.unpack_from("<I", d, o)[0]
    if n > 256:
        return []
    polys = []
    for k in range(n):
        p = o + 4 + 0x44 * k
        nv = min(struct.unpack_from("<I", d, p)[0], 8)
        polys.append([list(struct.unpack_from("<ff", d, p + 4 + 8 * v)) for v in range(nv)])
    return polys

def nom_fichier(s):
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", s) or "sans-nom"

def lire_proprietes(d, o, n, taille=0x60):
    r = []
    for k in range(n):
        p = o + k * taille
        idx = struct.unpack_from("<I", d, p)[0]
        sx, sy, rot, x, y, u18, u1c, u20, u24, u28 = struct.unpack_from("<10f", d, p + 4)
        grav = struct.unpack_from("<I", d, p + 0x2C)[0]
        reste = list(struct.unpack_from("<12f", d, p + 0x30))
        r.append({"index": idx, "echelle": [sx, sy], "rotation": rot, "x": x, "y": y, "gravite_au_depart": grav == 0,
                  "inconnus_0x18_0x28": [u18, u1c, u20, u24, u28], "inconnus_0x30": reste})
    return r

def machine(d):
    u = lambda o: struct.unpack_from("<I", d, o)[0]
    nb = {k: u(o) for k, o in [("lots", 0xE0), ("accessoires", 0xE4), ("objets_fixes", 0xE8), ("lots_machine", 0xEC),
                               ("lots_collection", 0xF0), ("accessoires_machine", 0xF4), ("objets_machine", 0xF8),
                               ("badges_accroches", 0xFC)]}
    noms = lambda o, n: [cstr(d, o + 0x30 * k) for k in range(n)]
    lots, acc, obj = noms(0x1100, nb["lots"]), noms(0x14C0, nb["accessoires"]), noms(0x1880, nb["objets_fixes"])
    accroches = []
    for k in range(nb["badges_accroches"]):
        p = 0x3E00 + 0x20 * k
        accroches.append({"accessoire": u(p + 0xC), "badge": u(p + 0x10),
                          "x": struct.unpack_from("<f", d, p + 0x14)[0], "y": struct.unpack_from("<f", d, p + 0x18)[0]})
    return {
        "id": u(0x2C), "nom": cstr(d, 0x30), "fond": cstr(d, 0x60), "icone": cstr(d, 0x90),
        "disponibilite": {0: "jeu", 1: "inconnue", 2: "entrainement"}.get(u(0xC0), u(0xC0)),
        "couleur_pince_rgb": list(struct.unpack_from("<3f", d, 0xC8)),
        "type_pince": {0: "standard", 1: "marteau", 2: "inutilisee", 3: "baton", 4: "bombe"}.get(u(0xD4), u(0xD4)),
        "noms": noms_langues(d, 0x100), "nombres": nb,
        "lots": lots, "accessoires": acc, "objets_fixes": obj,
        "dans_la_machine": {"lots": lire_proprietes(d, 0x1C40, nb["lots_machine"]),
                            "accessoires": lire_proprietes(d, 0x2F00, nb["accessoires_machine"]),
                            "objets_fixes": lire_proprietes(d, 0x3680, nb["objets_machine"])},
        "dans_la_collection": lire_proprietes(d, 0x23C0, nb["lots_collection"]),
        "badges_accroches": accroches,
        "note_positions": "x, y dans l'écran du haut 400x240, origine en haut à gauche (3dbrew)",
    }

def decoder_etc1a4_a8(d, w, h, o, retourner_etc1):
    img = decoder_etc1(d, w, h, True, o)
    return retourner(img, w, h) if retourner_etc1 else img

def png_etc(chemin, d, w, h, o, retourner_etc1):
    ecrire_png(chemin, decoder_etc1a4_a8(d, w, h, o, retourner_etc1), w, h)

def extraire(fichiers: dict, sortie: Path, retourner_etc1: bool, badges_64: bool = True,
             textures_entieres: bool = False):
    par_magie = {}
    for n, c in fichiers.items():
        c = yaz0(c)
        nom = Path(n).name.split(".")[0]
        g = par_magie.setdefault(c[:4], {})
        if nom not in g or len(c) > len(g[nom]):
            g[nom] = c
    print("contenu :", {k.decode("ascii", "replace"): len(v) for k, v in par_magie.items()})
    sortie.mkdir(parents=True, exist_ok=True)
    u = lambda d, o: struct.unpack_from("<I", d, o)[0]

    serie_badge, badges = {}, {}
    for _, d in par_magie.get(b"PRBS", {}).items():
        nom, cat = cstr(d, 0x44), cstr(d, 0x74)
        serie_badge[nom] = cat
        o_etc, f_etc = u(d, 0x2C), u(d, 0x30)
        a_jeu = f_etc - o_etc >= 0x4000 and o_etc + 0x4000 <= len(d)
        info = {"nom": nom, "categorie": cat, "id": u(d, 0x3C), "tuiles": [u(d, 0xB8), u(d, 0xBC)],
                "echelle_image": list(struct.unpack_from("<2f", d, 0xD0)), "noms": noms_langues(d, 0xE0),
                "collision": collision(d, u(d, 0x34)), "image_jeu_128": a_jeu}
        rep = sortie / "badges" / nom_fichier(cat)
        if a_jeu:   
            png_etc(rep / (nom_fichier(nom) + ".png"), d, 128, 128, o_etc, retourner_etc1)
        if badges_64 or not a_jeu:   
            o = u(d, 0x1C)
            ecrire_png(rep / (nom_fichier(nom) + "-64.png"), decoder_rgb565(d, 64, 64, o, o + 0x2000), 64, 64)
        badges[nom] = info
    (sortie / "badges.json").write_text(json.dumps(badges, ensure_ascii=False, indent=1))

    machines = [machine(d) for d in par_magie.get(b"CIBS", {}).values()]
    fobs, atbs = par_magie.get(b"FOBS", {}), par_magie.get(b"ATBS", {})
    for m in machines:
        cats = Counter(serie_badge[l] for l in m["lots"] if l in serie_badge)
        m["serie"] = cats.most_common(1)[0][0] if cats else "sans-serie"
        m["complete"] = all(o in fobs for o in m["objets_fixes"]) and all(a in atbs for a in m["accessoires"])
    machines.sort(key=lambda m: (m["serie"], m["id"]))
    (sortie / "machines.json").write_text(json.dumps(machines, ensure_ascii=False, indent=1))

    for _, d in par_magie.get(b"CRBS", {}).items():
        nom = cstr(d, 0x1C)
        o, f = u(d, 0x14), u(d, 0x18)
        h = (f - o) * 2 // 512
        img = decoder_etc1(d, 512, h, False, o)
        if retourner_etc1:
            img = retourner(img, 512, h)
        ecrire_png(sortie / "fonds" / (nom_fichier(nom) + ".png"), recadrer(img, 512, 110, 2, 400, 240), 400, 240)
        ecrire_png(sortie / "fonds" / "rail" / (nom_fichier(nom) + ".png"), recadrer(img, 512, 0, 0, 14, h), 14, h)
        if textures_entieres:
            ecrire_png(sortie / "fonds" / "texture-entiere" / (nom_fichier(nom) + ".png"), img, 512, h)

    for magie, dossier, o_nom, o_w, o_col in [(b"FOBS", "objets", 0x24, 0x54, 0x1C), (b"ATBS", "accessoires", 0x2C, 0x5C, 0x24)]:
        infos = {}
        for _, d in par_magie.get(magie, {}).items():
            nom = cstr(d, o_nom)
            w, h = struct.unpack_from("<II", d, o_w)
            png_etc(sortie / dossier / (nom_fichier(nom) + ".png"), d, w, h, 0x80, retourner_etc1)
            infos[nom] = {"taille": [w, h], "collision": collision(d, u(d, o_col))}
        if infos:
            (sortie / (dossier + ".json")).write_text(json.dumps(infos, indent=1))

    for magie, dossier, o_nom, o_img in [(b"ICBS", "icones/machines", 0x1C, 0x100), (b"CABS", "icones/series", 0x2C, 0x2080)]:
        for _, d in par_magie.get(magie, {}).items():
            ecrire_png(sortie / dossier / (nom_fichier(cstr(d, o_nom)) + ".png"), decoder_rgb565(d, 64, 64, o_img), 64, 64)
    print("machines :", len(machines), "dont complètes (objets présents) :", sum(m["complete"] for m in machines),
          "| badges :", len(badges), "dont image de jeu :", sum(b["image_jeu_128"] for b in badges.values()),
          "| fonds :", len(par_magie.get(b"CRBS", {})), "| objets :", len(fobs), "| sortie :", sortie)

def essai():
    hi = (8 << 28) | (8 << 24) | (8 << 20) | (8 << 16) | (8 << 12) | (8 << 8)
    img = decoder_etc1(struct.pack("<Q", hi << 32) * 4, 8, 8, False)
    assert img[:4] == bytes((138, 138, 138, 255)), img[:4]
    lo = (1 << (4 + 16)) | (1 << 4)
    img = decoder_etc1(struct.pack("<Q", (hi << 32) | lo) * 4, 8, 8, False)
    assert img[4:8] == bytes((128, 128, 128, 255)), img[4:8]
    z = b"Yaz0" + struct.pack(">I", 9) + b"\0" * 8 + bytes([0b11100000]) + b"abc" + bytes([0x40, 0x02])
    assert yaz0(z) == b"abcabcabc", yaz0(z)
    print("auto-contrôle ETC1 / Yaz0 : bon")

def ouvrir(sarc: bytes, prefixe: str, tout: dict):
    for n, c in lire_sarc(sarc).items():
        c2 = yaz0(c) if c[:4] == b"Yaz0" else c
        if c2[:4] == b"SARC":
            ouvrir(c2, prefixe + n + "/", tout)
        elif "/pc/" in "/" + n or "/pc/" in prefixe:
            tout[prefixe + n] = c

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--boot9"); ap.add_argument("--boss", nargs="+", default=[str(BOSS_DEFAUT)],
                    help="un ou plusieurs conteneurs BOSS (allbadge_vXXX.dat, data_vXXX.dat)")
    ap.add_argument("--sarc", nargs="+", help="SARC déjà en clair")
    ap.add_argument("--sortie", default=str(SORTIE_DEFAUT)); ap.add_argument("--retourner", action="store_true",
                    help="retourner verticalement les textures ETC1 (si les fonds sortent la tête en bas)")
    ap.add_argument("--sans-badges-64", action="store_true",
                    help="ne pas écrire la vignette 64x64 du menu HOME quand l'image de jeu 128x128 existe")
    ap.add_argument("--textures-entieres", action="store_true", help="écrire aussi la texture 512x256 de chaque fond")
    ap.add_argument("--essai", action="store_true")
    a = ap.parse_args()
    if a.essai:
        return essai()
    sarcs = []
    if a.sarc:
        sarcs = [Path(x).read_bytes() for x in a.sarc]
    else:
        if not a.boot9:
            sys.exit("il faut --boot9 (boot9.bin de la console) ou --sarc (SARC déjà en clair)")
        cle = cle_boss(Path(a.boot9).read_bytes())
        for b in a.boss:
            sarc = dechiffrer_boss(Path(b).read_bytes(), cle)
            print("déchiffré :", b, "SARC sha256", hashlib.sha256(sarc).hexdigest())
            sarcs.append(sarc)
    tout = {}
    for k, sarc in enumerate(sarcs):
        ouvrir(sarc, "%d:" % k, tout)
    extraire(tout, Path(a.sortie), a.retourner, not a.sans_badges_64, a.textures_entieres)

if __name__ == "__main__":
    main()
