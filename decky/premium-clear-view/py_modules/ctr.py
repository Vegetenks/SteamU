import hashlib, os, shutil, struct, subprocess, tempfile

BOOT9_COMPLET = "2f88744feed717856386400a44bba4b9ca62e76a32c715d4f309c399bf28166f"
BOOT9_PROTEGE = "7331f7edece3dd33f2ab4bd0b3a5d607229fd19212c10b734cedcaf78c1a7b98"
BROUILLEUR = 0x1FF9E9AAC5FE0408024591DC5D52768A      
MEDIA = 0x200
TAILLE_MAX = 512 * 1024 * 1024                      
YAZ0_MAX = 64 * 1024 * 1024                          
DELAI_OPENSSL = 300

class Illisible(Exception):
    pass

class SansCle(Illisible):
    pass

class AutreCle(SansCle):
    pass

def _base_boot9(boot9):
    h = hashlib.sha256(boot9).hexdigest()
    if h == BOOT9_COMPLET: return 0x8000 + 0x5860
    if h == BOOT9_PROTEGE: return 0x5860
    raise SansCle("boot9.bin inattendu")

def cle_x_2c(boot9):
    b = _base_boot9(boot9)
    return int.from_bytes(boot9[b + 0x170:b + 0x180], "big")

def cle_boss(boot9):
    b = _base_boot9(boot9)
    return boot9[b + 0x370:b + 0x380]

def _rol(v, n):
    n %= 128
    return ((v << n) | (v >> (128 - n))) & ((1 << 128) - 1)

def cle_normale(x, y):
    return _rol((_rol(x, 2) ^ y) + BROUILLEUR & ((1 << 128) - 1), 87).to_bytes(16, "big")

def _ctr_cryptography(cle, iv):
    try:
        from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    except ImportError:
        return None
    return Cipher(algorithms.AES(cle), modes.CTR(iv)).decryptor()

def dechiffrer_fichier(source, debut, taille, cle, iv, cible):
    d = _ctr_cryptography(cle, iv)
    if d is not None:
        with open(source, "rb") as e, open(cible, "wb") as s:
            e.seek(debut); reste = taille
            while reste > 0:
                bloc = e.read(min(reste, 1 << 22))
                if not bloc: raise Illisible("tronqué")
                s.write(d.update(bloc)); reste -= len(bloc)
            s.write(d.finalize())
        return
    fd, morceau = tempfile.mkstemp(dir=os.path.dirname(cible)); os.close(fd)
    try:
        with open(source, "rb") as e, open(morceau, "wb") as s:
            e.seek(debut); reste = taille
            while reste > 0:
                bloc = e.read(min(reste, 1 << 22))
                if not bloc: raise Illisible("tronqué")
                s.write(bloc); reste -= len(bloc)
        p = subprocess.run(["openssl", "enc", "-d", "-aes-128-ctr", "-nopad", "-K", cle.hex(), "-iv", iv.hex(), "-in", morceau,
                            "-out", cible], stdin=subprocess.DEVNULL, capture_output=True, timeout=DELAI_OPENSSL,
                           env={"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "LD_LIBRARY_PATH": ""})
        if p.returncode != 0: raise Illisible("openssl a échoué")
    except (OSError, subprocess.TimeoutExpired):
        raise Illisible("pas d'AES sur cette machine")
    finally:
        os.unlink(morceau)

def dechiffrer_octets(donnees, cle, iv):
    d = _ctr_cryptography(cle, iv)
    if d is not None: return d.update(donnees) + d.finalize()
    with tempfile.TemporaryDirectory() as t:
        e, s = os.path.join(t, "e"), os.path.join(t, "s")
        with open(e, "wb") as o: o.write(donnees)
        dechiffrer_fichier(e, 0, len(donnees), cle, iv, s)
        with open(s, "rb") as o: return o.read()

def _u32(d, o): return struct.unpack_from("<I", d, o)[0]

def _aligner(n, a=64): return (n + a - 1) // a * a

def ncch_dans(chemin):
    taille = os.path.getsize(chemin)
    with open(chemin, "rb") as f: t = f.read(0x4000)
    if t[0x100:0x104] == b"NCCH": return 0, taille
    if t[0x100:0x104] == b"NCSD":
        debut, n = struct.unpack_from("<II", t, 0x120)
        if not n or (debut + n) * MEDIA > taille: raise Illisible("NCSD abîmé")
        return debut * MEDIA, n * MEDIA
    if len(t) >= 0x20 and _u32(t, 0) == 0x2020:
        en_tete, _, _, cert, tik, tmd, meta, contenu = struct.unpack_from("<IHHIIIIQ", t, 0)
        o_tmd = _aligner(en_tete) + _aligner(cert) + _aligner(tik)
        o_contenu = o_tmd + _aligner(tmd)
        if o_contenu + contenu > taille or tmd < 0xC4 + 0x900 + 0x30: raise Illisible("CIA abîmée")
        with open(chemin, "rb") as f: f.seek(o_tmd); m = f.read(tmd)
        sig = struct.unpack_from(">I", m, 0)[0]
        tete = {0x10003: 0x240, 0x10004: 0x140, 0x10005: 0x80}.get(sig)
        if tete is None: raise Illisible("TMD inconnu")
        n_contenus = struct.unpack_from(">H", m, tete + 0x9E)[0]
        if not n_contenus: raise Illisible("CIA vide")
        cid, idx, typ, tc = struct.unpack_from(">IHHQ", m, tete + 0xC4 + 0x900)
        if typ & 1: raise AutreCle("contenu chiffré par la clé du titre")
        with open(chemin, "rb") as f: f.seek(o_contenu + 0x100); mag = f.read(4)
        if mag != b"NCCH": raise Illisible("CIA sans NCCH")
        return o_contenu, tc
    raise Illisible("pas un fichier de la 3DS")

def romfs_de_ncch(chemin, debut, taille, boot9, travail):
    with open(chemin, "rb") as f: f.seek(debut); h = f.read(0x200)
    if h[0x100:0x104] != b"NCCH": raise Illisible("pas un NCCH")
    o_romfs, t_romfs = struct.unpack_from("<II", h, 0x1B0)
    if not t_romfs: return None
    if (o_romfs + t_romfs) * MEDIA > taille: raise Illisible("NCCH tronqué")
    drapeaux = h[0x188:0x190]
    cible = os.path.join(travail, "romfs.bin")
    if drapeaux[7] & 4:                                   
        with open(chemin, "rb") as e, open(cible, "wb") as s:
            e.seek(debut + o_romfs * MEDIA); reste = t_romfs * MEDIA
            while reste > 0:
                bloc = e.read(min(reste, 1 << 22))
                if not bloc: raise Illisible("tronqué")
                s.write(bloc); reste -= len(bloc)
        return cible
    if drapeaux[3] != 0 or drapeaux[7] & 0x21: raise AutreCle("chiffrement du système (0x25/0x18/0x1B, clé fixe ou graine)")
    if boot9 is None: raise SansCle("il faut la clé de la 3DS")
    cle = cle_normale(cle_x_2c(boot9), int.from_bytes(h[:16], "big"))
    version = struct.unpack_from("<H", h, 0x112)[0]
    pid = h[0x108:0x110]
    iv = (pid[::-1] + bytes([3]) + bytes(7)) if version in (0, 2) else (pid + bytes(4) + struct.pack(">I", o_romfs * MEDIA))
    dechiffrer_fichier(chemin, debut + o_romfs * MEDIA, t_romfs * MEDIA, cle, iv, cible)
    with open(cible, "rb") as f:
        if f.read(4) != b"IVFC": raise SansCle("déchiffrement faux : ce n'est pas la clé de cette console")
    return cible

def fichiers_romfs(chemin, fichiers_max=20000):
    taille = os.path.getsize(chemin)
    with open(chemin, "rb") as f: h = f.read(0x60)
    if h[:4] != b"IVFC": raise Illisible("pas un RomFS")
    hash_maitre = _u32(h, 8)
    bloc3 = 1 << _u32(h, 0x4C)
    if not 4 <= _u32(h, 0x4C) <= 20: raise Illisible("RomFS abîmé")
    base = _aligner(0x60 + hash_maitre, bloc3)
    with open(chemin, "rb") as f:
        f.seek(base); e = f.read(0x28)
        if len(e) < 0x28 or _u32(e, 0) != 0x28: raise Illisible("RomFS abîmé")
        _, _, _, o_dir, t_dir, _, _, o_fic, t_fic, o_data = struct.unpack("<10I", e)
        if max(t_dir, t_fic) > 64 * 1024 * 1024: raise Illisible("RomFS abîmé")
        f.seek(base + o_dir); dirs = f.read(t_dir)
        f.seek(base + o_fic); fics = f.read(t_fic)
    sortie, vus = [], set()

    def nom(d, o, n): return d[o:o + n].decode("utf-16-le", "replace")

    def dossier(o, prefixe, profondeur):
        if o in vus or profondeur > 32 or o + 0x18 > len(dirs): return
        vus.add(o)
        _, _, enfant, fichier, _, n = struct.unpack_from("<6I", dirs, o)
        while fichier != 0xFFFFFFFF and fichier + 0x20 <= len(fics) and len(sortie) < fichiers_max:
            _, suivant, debut, t, _, n2 = struct.unpack_from("<IIQQII", fics, fichier)
            if base + o_data + debut + t <= taille:
                sortie.append((prefixe + nom(fics, fichier + 0x20, n2), base + o_data + debut, t))
            if suivant == fichier: break
            fichier = suivant
        while enfant != 0xFFFFFFFF and enfant + 0x18 <= len(dirs):
            _, frere, _, _, _, n3 = struct.unpack_from("<6I", dirs, enfant)
            dossier(enfant, prefixe + nom(dirs, enfant + 0x18, n3) + "/", profondeur + 1)
            if frere == enfant: break
            enfant = frere
    dossier(0, "", 0)
    return sortie

def dechiffrer_boss(donnees, boot9):
    if donnees[:4] != b"boss": raise Illisible("pas un conteneur SpotPass")
    if boot9 is None: raise SansCle("il faut la clé de la 3DS")
    clair = dechiffrer_octets(donnees[0x28:], cle_boss(boot9), donnees[0x1C:0x28] + b"\x00\x00\x00\x01")
    i = clair.find(b"SARC", 0, 0x1000)
    if i < 0: raise SansCle("déchiffrement faux : ce n'est pas la clé d'une 3DS")
    return clair[i:]

def yaz0(d, taille_max=YAZ0_MAX, debut=None):
    if d[:4] != b"Yaz0": return d
    n = int.from_bytes(d[4:8], "big")
    if n > taille_max: raise Illisible("Yaz0 trop gros")
    if debut is not None: n = min(n, debut)
    o, s = bytearray(), 16
    try:
        while len(o) < n:
            c = d[s]; s += 1
            for b in range(8):
                if len(o) >= n: break
                if c & (0x80 >> b):
                    o.append(d[s]); s += 1
                else:
                    b1, b2 = d[s], d[s + 1]; s += 2
                    dist = ((b1 & 15) << 8 | b2) + 1
                    if b1 >> 4 == 0: ln = d[s] + 0x12; s += 1
                    else: ln = (b1 >> 4) + 2
                    st = len(o) - dist
                    if st < 0: raise Illisible("Yaz0 abîmé")
                    for i in range(ln): o.append(o[st + i])
    except IndexError:
        raise Illisible("Yaz0 tronqué")
    return bytes(o[:n])

def sarc(d):
    if d[:4] != b"SARC": raise Illisible("pas un SARC")
    e = "<" if d[6:8] == b"\xff\xfe" else ">"
    hl, _, _, doff = struct.unpack_from(e + "HHII", d, 4)
    if d[hl:hl + 4] != b"SFAT": raise Illisible("SARC abîmé")
    _, n, _ = struct.unpack_from(e + "HHI", d, hl + 4)
    if hl + 12 + 16 * n > len(d): raise Illisible("SARC abîmé")
    ents = [struct.unpack_from(e + "IIII", d, hl + 12 + 16 * i) for i in range(n)]
    o2 = hl + 12 + 16 * n
    if d[o2:o2 + 4] != b"SFNT": raise Illisible("SARC abîmé")
    out = {}
    for h, attr, a, b in ents:
        if attr >> 24:
            no = o2 + 8 + (attr & 0xFFFFFF) * 4
            nom = d[no:d.index(b"\0", no)].decode("utf-8", "replace")
        else:
            nom = "sans-nom/%08x" % h
        if not doff + a <= doff + b <= len(d): raise Illisible("SARC abîmé")
        out[nom] = d[doff + a:doff + b]
    return out
