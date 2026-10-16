import hashlib, json, os, pathlib, re, shutil, stat, struct, subprocess, tarfile, tempfile, time, unicodedata, zipfile
import mii, badges, mii_moteur

ICI = pathlib.Path(__file__).resolve().parent
EMPREINTES = ICI.parent / "donnees" / "empreintes-sons.json"    
CONNUS = ICI.parent / "donnees" / "fichiers-connus.json"        
ANALYSE = ICI / "empreinte_son.py"
EXTRAIRE = ICI / "extraire.py"
PYTHON = "/usr/bin/python3"          
TEMP = None                          
TRAVAIL = "steamu-import-"
_travail = None                      

VISAGES = ("AFLResHigh_2_3.dat", 4579008, "4a4be71d75162c20b48720ef89cd3d4e6cd4e8e21bcbc2aed63ee08d96de7722")
CLE_3DS = ("boot9.bin", 65536, "2f88744feed717856386400a44bba4b9ca62e76a32c715d4f309c399bf28166f")
TAILLE_BASE_MAX = 4 * 1024 * 1024    
FICHIERS_MAX = 5000                  
ENTREES_MAX = 50000                  
TAILLE_FICHIER_MAX = 512 * 1024 * 1024    
TAILLE_TOTALE_MAX = 3 * 1024 * 1024 * 1024    
PROFONDEUR_MAX = 3                   
AUDIO_MAX = 1000                     
LOT_AUDIO = 25                       
ECOUTES = 4                          
DELAI_ANALYSE = 90                   
DELAI_CONVERSION = 120               
DELAI_EXTRACTION = 900               
SON_DUREE_MAX = 600                  
NOM_MAX, NOMS_MAX = 80, 10           
TETE = 0x200                         
SAUTES = {"Nintendo 3DS"}            
CHEMIN_SUR = re.compile(r"(?:[A-Za-z0-9_][A-Za-z0-9_.-]{0,99}/){0,6}[A-Za-z0-9_][A-Za-z0-9_.-]{0,99}")
EXIGE = {"mii": ["mii/moteur", "mii/AFLResHigh_2_3.dat", "mii/corps"], "casino": ["luigi", "casino-luigi/sons"], "badges": ["badges"], "sons": ["sons"]}
MANQUE = {"mii/moteur": "moteur-mii", "mii/AFLResHigh_2_3.dat": "visages", "mii/corps": "corps-mii", "luigi": "sm64ds",
          "casino-luigi/sons": "sm64ds", "badges": "badges", "sons": "sons"}
PERMIS = {"badge-arcade": ("badge-arcade/modeles/romfs/", "badge-arcade/romfs-eur/layout-png/", "sons/badge-arcade/romfs/"),
          "boss": ("badge-arcade/bornes/", "badges/"), "collection": ("badges/",), "machine-hall": ("badge-arcade/machine-hall.glb",),
          "luigi": ("luigi/luigi-croupier.glb", "casino-luigi/sons/", "casino-luigi/voix/")}
LUIGI = "luigi/luigi-croupier.glb"

def _empreinte(f):
    h = hashlib.sha256()
    with open(f, "rb") as o:
        for bloc in iter(lambda: o.read(1 << 20), b""): h.update(bloc)
    return h.hexdigest()

def _ecrire(chemin, donnees):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=_travail or os.path.dirname(chemin), suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as o: json.dump(donnees, o, ensure_ascii=False, indent=1); o.write("\n")
    os.replace(tmp, chemin)

def _lire(chemin):
    try: return json.loads(pathlib.Path(chemin).read_text(encoding="utf-8"))
    except (OSError, ValueError): return None

def _libre(dossier, base, garder):
    k = 1
    while True:
        chemin = os.path.join(dossier, (base if k == 1 else f"{base}-{k}") + ".json")
        if not os.path.exists(chemin): return chemin
        if garder(_lire(chemin)): return None
        k += 1

def _poser(source, cible):
    if cible.exists(): return False
    cible.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=_travail or cible.parent, suffix=".tmp"); os.close(fd)
    try:
        shutil.copyfile(source, tmp)
        if cible.exists(): return False                     
        os.replace(tmp, cible); return True
    finally:
        if os.path.exists(tmp): os.unlink(tmp)

def _poser_octets(octets, cible):
    if cible.exists(): return False
    fd, tmp = tempfile.mkstemp(dir=_travail); os.close(fd)
    with open(tmp, "wb") as o: o.write(octets)
    try: return _poser(tmp, cible)
    finally: os.unlink(tmp)

def _nom(nom):
    nom = str(nom).replace("\\", "/").rstrip("/").rsplit("/", 1)[-1]
    nom = "".join(c for c in nom if unicodedata.category(c)[0] != "C").strip() or "?"
    return nom if len(nom) <= NOM_MAX else nom[:NOM_MAX - 1] + "…"

def _abime(r, nom):
    r["abimes_n"] += 1
    if len(r["abimes"]) < NOMS_MAX: r["abimes"].append(_nom(nom))

def _env():
    return {"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "LANG": "C.UTF-8", "LD_LIBRARY_PATH": ""}   

def _chemin_sur(c):
    return isinstance(c, str) and bool(CHEMIN_SUR.fullmatch(c)) and ".." not in c.split("/")

def _garder(chemin, x):
    x["n_gardes"] += 1
    garde = os.path.join(x["travail"], f"garde-{x['n_gardes']:06d}")
    if os.path.dirname(os.path.abspath(chemin)) == x["travail"] and os.path.basename(chemin).isdigit():
        os.replace(chemin, garde); return garde
    try: fd = os.open(chemin, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    except OSError: return None
    with os.fdopen(fd, "rb") as o:
        if not stat.S_ISREG(os.fstat(fd).st_mode): return None
        x["decompresse"] += os.fstat(fd).st_size
        if x["decompresse"] > TAILLE_TOTALE_MAX: x["r"]["trop"] += 1; return None
        with open(garde, "xb") as s: shutil.copyfileobj(o, s, 1 << 20)
    return garde

def _diff_sain(d):
    try: _, _, _, n4, niveaux, _, _ = badges._diff(d)
    except (ValueError, struct.error, IndexError): return False
    return n4 <= TAILLE_BASE_MAX and all(t <= TAILLE_BASE_MAX and lb <= 20 for _, t, lb in niveaux)

def _base_mii(nom, d, prive, r):
    if d[0x100:0x104] == b"DIFF" and not _diff_sain(d): _abime(r, nom); return
    notes = []
    d = mii._deplier_si_diff(d, lambda m, info=False: notes.append(m))
    if b"CFOG" not in d: _abime(r, nom); return
    try: trouves = mii.lire_cfl_db(d, lambda m, info=False: notes.append(m))
    except mii.Illisible: trouves = []
    if any("FAUX" in n or "tronqué" in n or "coupé" in n or "non déplié" in n for n in notes) or not trouves:
        _abime(r, nom); return
    dossier, autres = str(prive / "mii" / "cfl_db"), []
    for octets, groupe, ctx in trouves:
        j = mii.fiche(octets, dict({"fichier": _nom(nom), "nature": "CFL_DB.dat"}, **ctx), {}, complete=groupe != "autres")
        if groupe == "autres": autres.append(j); continue
        base = mii.nom_de_fichier(j["nom"], "mii-" + j["technique"]["id_mii"])
        if base.lower() in mii.NOMS_RESERVES or base.lower().startswith("autres"): base = "mii-" + base
        chemin = _libre(dossier, base, lambda x: isinstance(x, dict) and x.get("donnees_3ds") == j.get("donnees_3ds"))
        if not chemin: r["deja"] += 1; continue
        _ecrire(chemin, j); r["mii"] += 1
    if autres:   
        cle = lambda j: isinstance(j, dict) and (j.get("donnees_partielles_hex") or j.get("donnees_3ds", {}).get("hex"))
        vus = {cle(x) for p in pathlib.Path(dossier).glob("autres*.json") for x in (_lire(p) if isinstance(_lire(p), list) else [])}
        neufs = [j for j in autres if cle(j) not in vus and not vus.add(cle(j))]
        if neufs: _ecrire(_libre(dossier, "autres", lambda x: False), neufs); r["mii_autres"] += len(neufs)

def _sha_exacte(ref):
    return lambda tete, taille, nom: taille == ref[1]

def _ranger_exact(ref, cible, cle_r):
    def ranger(chemin, nom, x):
        if _empreinte(chemin) != ref[2]:
            if _nom(nom).lower() == ref[0].lower(): _abime(x["r"], nom); return   
            return False
        if _poser(chemin, x["prive"] / cible / ref[0]): x["r"][cle_r] += 1
        else: x["r"]["deja"] += 1
    return ranger

_connus = None

def _table_connus():
    global _connus
    if _connus is None:
        _connus = {}
        for e in (_lire(CONNUS) or {}).get("fichiers", []):
            if not isinstance(e, dict) or not isinstance(e.get("taille"), int) or not isinstance(e.get("sha256"), str): continue
            if not all(_chemin_sur(c) for c in [e.get("vers") or "x", *e.get("aussi", []), *(e.get("avec") or {})]): continue
            _connus.setdefault(e["taille"], {})[e["sha256"]] = e
    return _connus

def _veut_connu(tete, taille, nom):
    return taille in _table_connus()

def _ranger_connu(chemin, nom, x):
    e = _table_connus().get(os.path.getsize(chemin), {}).get(_empreinte(chemin))
    if not e: return False
    r = x["r"]
    if e.get("role"):
        if e["role"] not in x["lot"]["roles"]:
            g = _garder(chemin, x)
            if g: x["lot"]["roles"][e["role"]] = g; x["lot"]["noms"][e["role"]] = e.get("nom")
        else: r["deja"] += 1
        return
    neuf = False
    for c in [e["vers"], *e.get("aussi", [])]:
        neuf = _poser(chemin, x["prive"] / c) or neuf
    for c, contenu in (e.get("avec") or {}).items():          
        if isinstance(contenu, str): _poser_octets(contenu.encode("utf-8"), x["prive"] / c)
    if neuf:
        r["connus"] += 1
        if e["vers"].startswith("garde-robe/"): x["garde_robe"] = True
    else: r["deja"] += 1

def _veut_base(tete, taille, nom):
    return 0 < taille <= TAILLE_BASE_MAX and (tete[:4] == b"CFOG" or tete[0x100:0x104] == b"DIFF")

def _ranger_base(chemin, nom, x):
    _base_mii(nom, pathlib.Path(chemin).read_bytes(), x["prive"], x["r"])

def _format_audio(tete):
    if tete[:4] == b"OggS": return "ogg"
    if tete[:4] == b"RIFF" and tete[8:12] == b"WAVE": return "wav"
    if tete[:4] == b"fLaC": return "flac"
    if tete[4:8] == b"ftyp": return "mov"                     
    if tete[:4] == b"\x1aE\xdf\xa3": return "matroska"        
    if tete[:4] == b"FORM" and tete[8:12] in (b"AIFF", b"AIFC"): return "aiff"
    if tete[:4] in (b"FSTM", b"CSTM"): return "bfstm"         
    if tete[:4] == b"RSTM": return "brstm"
    if tete[:3] == b"ID3": return "mp3"
    if len(tete) > 1 and tete[0] == 0xFF and tete[1] & 0xF6 == 0xF0: return "aac"     
    if len(tete) > 2 and tete[0] == 0xFF and tete[1] & 0xE0 == 0xE0 and tete[1] & 0x06 and (tete[2] >> 4) not in (0, 15): return "mp3"
    return None

def _veut_audio(tete, taille, nom):
    return taille > 0 and _format_audio(tete) is not None

def _ranger_audio(chemin, nom, x):
    if x["audio_impossible"]: x["r"]["audio_impossible"] = True; return
    if len(x["lot"]["audio"]) >= AUDIO_MAX: x["r"]["trop"] += 1; return
    with open(chemin, "rb") as o: fmt = _format_audio(o.read(TETE))
    g = _garder(chemin, x)
    if g: x["lot"]["audio"].append((g, fmt, _nom(nom)))

def _veut_3ds(tete, taille, nom):
    if len(tete) >= 0x10 and struct.unpack_from("<I", tete, 0)[0] == 0x2020 and struct.unpack_from("<I", tete, 8)[0] == 0xA00: return True
    return tete[0x100:0x104] in (b"NCCH", b"NCSD")

def _ranger_3ds(chemin, nom, x):
    g = _garder(chemin, x)
    if g: x["lot"]["ctr"].append((g, _nom(nom)))

def _crc16(d):
    c = 0xFFFF
    for o in d:
        c ^= o
        for _ in range(8): c = (c >> 1) ^ 0xA001 if c & 1 else c >> 1
    return c

def _veut_nds(tete, taille, nom):
    return taille >= 0x200 and len(tete) >= 0x160 and _crc16(tete[:0x15E]) == struct.unpack_from("<H", tete, 0x15E)[0]

def _ranger_nds(chemin, nom, x):
    with open(chemin, "rb") as o: t = o.read(0x20)
    titre = t[:12].rstrip(b"\0").decode("latin-1", "replace")
    code = t[12:16]
    sorte = "sm64ds" if code[:3] == b"ASM" and titre.startswith("S.MARIO64") else "mpds" if code[:3] == b"A8T" else None
    if sorte is None:
        r = x["r"]
        if len(r["autre_rom"]) < NOMS_MAX: r["autre_rom"].append(_nom("".join(c for c in titre if c.isprintable()) or code.decode("latin-1", "replace")))
        return
    if sorte in x["lot"]["nds"]: x["r"]["deja"] += 1; return
    g = _garder(chemin, x)
    if g: x["lot"]["nds"][sorte] = g

def _veut_boss(tete, taille, nom):
    return tete[:4] == b"boss" or tete[:4] == b"SARC"

def _ranger_boss(chemin, nom, x):
    g = _garder(chemin, x)
    if g: x["lot"]["boss"].append((g, _nom(nom)))

def _veut_ba(tete, taille, nom):
    return tete[:4] in (b"Yaz0", b"CSAR") and taille <= 64 * 1024 * 1024

def _ranger_ba(chemin, nom, x):
    g = _garder(chemin, x)
    if g: x["lot"]["ba"].append((g, "".join(c for c in str(nom) if c.isprintable())[-200:]))

def _veut_zip(tete, taille, nom): return tete[:4] in (b"PK\x03\x04", b"PK\x05\x06")
def _veut_tar(tete, taille, nom): return tete[257:262] == b"ustar" or tete[:2] == b"\x1f\x8b"

RECONNAISSEURS = [
    (_veut_connu, _ranger_connu),
    (_veut_zip, "zip"), (_veut_tar, "tar"),
    (_sha_exacte(VISAGES), _ranger_exact(VISAGES, "mii", "visages")),
    (_sha_exacte(CLE_3DS), _ranger_exact(CLE_3DS, "cles", "cle3ds")),
    (_veut_base, _ranger_base),
    (_veut_3ds, _ranger_3ds),
    (_veut_nds, _ranger_nds),
    (_veut_boss, _ranger_boss),
    (_veut_ba, _ranger_ba),
    (_veut_audio, _ranger_audio),
]

class _Recolle:
    def __init__(self, tete, flux): self.tete, self.flux = tete, flux
    def read(self, n):
        if self.tete: b, self.tete = self.tete[:n], self.tete[n:]; return b
        return self.flux.read(n)

def _copier_borne(flux, x):
    x["n_extraits"] += 1
    chemin, n = os.path.join(x["travail"], f"{x['n_extraits']:06d}"), 0
    with open(chemin, "xb") as o:
        while bloc := flux.read(1 << 20):
            n += len(bloc); x["decompresse"] += len(bloc)
            if n > TAILLE_FICHIER_MAX or x["decompresse"] > TAILLE_TOTALE_MAX: break
            o.write(bloc)
    if n > TAILLE_FICHIER_MAX or x["decompresse"] > TAILLE_TOTALE_MAX:
        os.unlink(chemin); x["r"]["trop"] += 1; return None
    return chemin

def _traiter(tete, taille, nom, flux, chemin, x, profondeur):
    r = x["r"]
    candidats = []
    for veut, ranger in RECONNAISSEURS:
        try:
            if veut(tete, taille, nom): candidats.append(ranger)
        except Exception: continue
    if not candidats: r["inconnus"] += 1; return
    if x["lus"] >= FICHIERS_MAX: r["trop"] += 1; return
    if chemin is None and taille > TAILLE_FICHIER_MAX: r["trop"] += 1; return   
    x["lus"] += 1
    extrait = chemin is None and _copier_borne(_Recolle(tete, flux), x)
    if chemin is None and not extrait: return
    vrai = chemin or extrait
    try:
        for ranger in candidats:
            if ranger in ("zip", "tar"):
                if profondeur >= PROFONDEUR_MAX: r["trop"] += 1; return
                (_zip if ranger == "zip" else _tar)(vrai, nom, x, profondeur + 1); return
            if ranger(vrai, nom, x) is not False: return
        r["inconnus"] += 1
    finally:
        if extrait and os.path.exists(extrait): os.unlink(extrait)

def _entree(x):
    x["entrees"] += 1
    if x["entrees"] > ENTREES_MAX: x["r"]["trop"] += 1; return False
    return True

def _smdh(d):
    if not d or d[:4] != b"SMDH" or len(d) < 0x8 + 2 * 0x200: return None, None
    t = lambda o, n: d[o:o + n].decode("utf-16-le", "replace").split("\0")[0].strip() or None
    return t(0x8 + 0x200, 0x80), t(0x8 + 0x200 + 0x180, 0x80)

def _theme_3ds(chemin, nom, x):
    import themeplaza
    try:
        if os.path.getsize(chemin) > themeplaza.MAX_ZIP: return False
        with open(chemin, "rb") as o: fichiers = themeplaza.lire_archive(o.read())
        ident = "theme3ds-" + hashlib.sha256(fichiers["body_LZ.bin"]).hexdigest()[:12]
        titre, auteur = _smdh(fichiers.get("info.smdh"))
        sortie = themeplaza.convertir(fichiers, ident, _nom(titre or nom), _nom(auteur) if auteur else "", "")
        j = json.loads(sortie[ident + ".json"])
    except Exception:
        return False
    j.update(sous=("de " + j["auteur"]) if j.get("auteur") else "Thème de la 3DS", source="carte SD de la 3DS"); j.pop("lien", None)
    sortie[ident + ".json"] = json.dumps(j, ensure_ascii=False, indent=2).encode()
    dossier, neuf = x["prive"] / "themes", False
    for n in sorted(sortie, key=lambda n: n.endswith(".json")):      
        if _chemin_sur(n): neuf = _poser_octets(sortie[n], dossier / n) or neuf
    x["r"]["themes" if neuf else "deja"] += 1
    return True

def _zip(chemin, nom, x, profondeur):
    try: z = zipfile.ZipFile(chemin)
    except (zipfile.BadZipFile, OSError, ValueError): _abime(x["r"], nom); return
    with z:
        if "body_LZ.bin" in z.namelist() and _theme_3ds(chemin, nom, x): return
        for m in z.infolist():
            if m.is_dir(): continue
            x["r"]["vide"] = False
            if not _entree(x): return
            if stat.S_ISLNK(m.external_attr >> 16): x["r"]["inconnus"] += 1; continue   
            try:
                with z.open(m) as o: _traiter(o.read(TETE), m.file_size, m.filename, o, None, x, profondeur)
            except Exception:                                 
                _abime(x["r"], m.filename)

def _tar(chemin, nom, x, profondeur):
    try: t = tarfile.open(chemin, "r:*")
    except Exception: x["r"]["inconnus"] += 1; return           
    with t:
        try:
            for m in t:
                x["decompresse"] += max(0, m.size)
                if x["decompresse"] > TAILLE_TOTALE_MAX: x["r"]["trop"] += 1; return
                if m.isdir(): continue
                x["r"]["vide"] = False
                if not _entree(x): return
                if not m.isreg(): x["r"]["inconnus"] += 1; continue      
                o = t.extractfile(m)
                _traiter(o.read(TETE), m.size, m.name, o, None, x, profondeur)
        except Exception:
            _abime(x["r"], nom)

def _fichier(chemin, x, nom=None, profondeur=0):
    try: fd = os.open(chemin, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    except OSError: x["r"]["inconnus"] += 1; return
    with os.fdopen(fd, "rb") as o:
        st = os.fstat(fd)
        if not stat.S_ISREG(st.st_mode): x["r"]["inconnus"] += 1; return
        tete = o.read(TETE)
    _traiter(tete, st.st_size, nom or os.path.basename(chemin), None, chemin, x, profondeur)

def _parcourir(source, x):
    if os.path.isfile(source) and not os.path.islink(source):
        x["r"]["vide"] = False
        if _entree(x): _fichier(source, x)
        return
    for dossier, sous, noms in os.walk(source):              
        sous[:] = sorted(s for s in sous if not s.startswith(".") and s not in SAUTES)
        for nom in sorted(noms):
            x["r"]["vide"] = False
            if not _entree(x): return
            f = os.path.join(dossier, nom)
            if os.path.islink(f): x["r"]["inconnus"] += 1; continue
            try: _fichier(f, x, os.path.relpath(f, source))
            except Exception: _abime(x["r"], nom)

def _extraire(x, commande, *args):
    sortie = tempfile.mkdtemp(prefix="sortie-", dir=x["travail"])
    try:
        p = subprocess.run([PYTHON, "-I", str(EXTRAIRE), commande, *[str(a) for a in args], sortie], stdin=subprocess.DEVNULL,
                           capture_output=True, timeout=DELAI_EXTRACTION, env=_env())     
        lignes = p.stdout[-(16 << 20):].decode("utf-8", "replace").strip().splitlines()
        m = json.loads(lignes[-1]) if lignes else {"erreur": "outil"}
    except (OSError, ValueError, subprocess.TimeoutExpired):
        m = {"erreur": "outil"}
    return (m if isinstance(m, dict) else {"erreur": "outil"}), sortie

def _lot(x, entrees):
    d = tempfile.mkdtemp(prefix="lot-", dir=x["travail"])
    liste = []
    for k, (g, nom) in enumerate(entrees):
        os.link(g, os.path.join(d, f"{k:06d}")) if hasattr(os, "link") else shutil.copyfile(g, os.path.join(d, f"{k:06d}"))
        liste.append({"fichier": f"{k:06d}", "nom": nom})
    with open(os.path.join(d, "lot.json"), "w", encoding="utf-8") as o: json.dump(liste, o, ensure_ascii=False)
    return d

def _vers_son(source, cible, x, duree_max=None):
    with open(source, "rb") as o: fmt = _format_audio(o.read(TETE))
    if not fmt: return None
    mp3 = cible.suffix == ".mp3"
    fd, tmp = tempfile.mkstemp(dir=x["travail"], suffix=".mp3" if mp3 else ".ogg"); os.close(fd)
    args = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-protocol_whitelist", "file", "-f", fmt,
            "-t", str(duree_max or SON_DUREE_MAX), "-i", "file:" + os.path.abspath(source), "-map", "0:a:0", "-vn", "-sn", "-dn",
            "-map_metadata", "-1", *(["-c:a", "libmp3lame", "-q:a", "2", "-f", "mp3"] if mp3 else ["-c:a", "libvorbis", "-q:a", "6", "-f", "ogg"]),
            "file:" + tmp]
    try:
        ok = subprocess.run(args, stdin=subprocess.DEVNULL, capture_output=True, timeout=DELAI_CONVERSION, env=_env()).returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        ok = False
    if ok and os.path.getsize(tmp): return tmp
    os.unlink(tmp); return None

def _placer(x, m, sortie, permis):
    r, n, valides = x["r"], 0, []
    racine = os.path.realpath(sortie)
    for f in m.get("fichiers", []) if isinstance(m.get("fichiers"), list) else []:
        de, vers = (f.get("de"), f.get("vers")) if isinstance(f, dict) else (None, None)
        if not (_chemin_sur(vers) and isinstance(de, str) and vers.startswith(permis)): r["refuses"] += 1; continue
        src = os.path.join(racine, de)
        if os.path.commonpath([racine, os.path.realpath(src)]) != racine or os.path.islink(src) or not os.path.isfile(src):
            r["refuses"] += 1; continue
        cible = x["prive"] / vers
        if cible.exists(): r["deja"] += 1; continue
        valides.append((src, cible, f.get("convertir") == "ogg"))
    convertis = _convertir_tous([(s, c) for s, c, ogg in valides if ogg], x)    
    try:
        for src, cible, ogg in valides:
            if ogg and not convertis.get((src, cible)): _abime(r, str(cible.relative_to(x["prive"]))); continue
            if _poser(convertis[(src, cible)] if ogg else src, cible): n += 1
            else: r["deja"] += 1
    finally:
        for t in convertis.values():
            if t and os.path.exists(t): os.unlink(t)
    return n

def _references():
    d = _lire(EMPREINTES)
    return [p for p in (d or {}).get("pistes", []) if isinstance(p, dict) and _chemin_sur(p.get("chemin"))
            and all(_chemin_sur(c) for c in p.get("aussi", []))]

def _ecouter(x):
    r, lot = x["r"], x["lot"]["audio"]
    if not lot: return
    if x["audio_impossible"]: r["audio_impossible"] = True; return
    def ecouter(part):
        try:
            p = subprocess.run([PYTHON, "-I", str(ANALYSE), "--lot", str(EMPREINTES)], input="".join(f"{c}\t{f}\n" for c, f, _ in part).encode(),
                               capture_output=True, timeout=DELAI_ANALYSE * len(part), env=_env())
            return [json.loads(l) for l in p.stdout[:1 << 20].decode("utf-8", "replace").splitlines()[:len(part)]]
        except (OSError, ValueError, subprocess.TimeoutExpired):
            return []
    lots = [lot[k:k + LOT_AUDIO] for k in range(0, len(lot), LOT_AUDIO)]
    if not ecouter(lots[0][:1]):   
        x["audio_impossible"] = r["audio_impossible"] = True; return
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(ECOUTES) as f: resultats = list(f.map(ecouter, lots))     
    entendus = [(c, nom, res_ if isinstance(res_, dict) else {}) for part, res in zip(lots, resultats)
                for (c, fmt, nom), res_ in zip(part, res + [{}] * (len(part) - len(res)))]
    def score(e):
        v = e[2].get("part") or e[2].get("correlation") or 0
        return float(v) if isinstance(v, (int, float)) else 0.0
    prevues, plans = set(), []
    for c, nom, res_ in sorted(entendus, key=score, reverse=True):
        p = _prevoir_son(c, nom, res_, x, prevues)
        if p: plans.append((c, nom, res_, *p))
    convertis = _convertir_tous([(c, cible) for c, _, _, _, libres in plans for cible in libres], x)
    try:
        for c, nom, res_, piste, libres in plans: _ranger_son(c, nom, res_, x, piste, libres, convertis)
    finally:
        for t in convertis.values():
            if t and os.path.exists(t): os.unlink(t)

def _convertir_tous(travaux, x):
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(ECOUTES) as f: return dict(zip(travaux, f.map(lambda t: _vers_son(t[0], t[1], x), travaux)))

def _prevoir_son(chemin, nom, res, x, prevues):
    r = x["r"]
    if res.get("illisible"): _abime(r, nom); return None
    piste = next((p for p in x["references"] if p["chemin"] == res.get("piste")), None)
    if not piste: r["pas_wiiu"] += 1; return None             
    if res.get("qualite") == "mauvaise":
        r["mauvaise_n"] += 1
        if len(r["mauvaise"]) < NOMS_MAX: r["mauvaise"].append(_nom(nom))
        return None
    cibles = [x["prive"] / "sons" / c for c in [piste["chemin"], *piste.get("aussi", [])]]
    libres = [c for c in cibles if not c.exists() and c not in prevues]
    if not libres: r["deja"] += 1; return None
    prevues.update(libres)
    return piste, libres

def _ranger_son(chemin, nom, res, x, piste, libres, convertis):
    r = x["r"]
    for c in libres:
        tmp = convertis.get((chemin, c))
        if not tmp: _abime(r, nom); return
        _poser(tmp, c)
    famille = piste.get("famille") or "wiiu"
    r["sons"][famille] = r["sons"].get(famille, 0) + 1; r["musiques"] += 1
    b, d, e = piste.get("boucle"), float(res.get("decalage", 0)), float(res.get("echelle", 1)) or 1
    debut, fin = ((b["debut"] - d) / e, (b["fin"] - d) / e) if b else (-1, 0)
    cible = x["prive"] / "sons" / piste["chemin"]
    if b and debut >= 0 and fin <= min(float(res.get("duree", 0)), SON_DUREE_MAX) and not cible.with_name(cible.name + ".boucle").exists():
        _ecrire(str(cible) + ".boucle", {"debut": round(debut, 3), "fin": round(fin, 3),
                                         "source": "import : points de la musique de référence, recalés par l'empreinte sonore"})

def _cle(x):
    k = x["prive"] / "cles" / CLE_3DS[0]
    return str(k) if k.is_file() and k.stat().st_size == CLE_3DS[1] else "-"

def _ouvrir_3ds(x):
    r, cle = x["r"], _cle(x)
    for g, nom in x["lot"]["ctr"]:
        m, sortie = _extraire(x, "romfs", g, cle, max(0, TAILLE_TOTALE_MAX - x["decompresse"]), FICHIERS_MAX)
        if m.get("erreur") == "autre_cle": r["autrement"] += 1; continue      
        if m.get("erreur") == "sans_cle":
            if cle == "-": r["verrouilles"] += 1
            else: r["autrement"] += 1                      
            continue
        if m.get("erreur"): _abime(r, nom); continue
        r["romfs"] += 1
        for f in m.get("fichiers", []) if isinstance(m.get("fichiers"), list) else []:
            de = f.get("de") if isinstance(f, dict) else None
            if not (isinstance(de, str) and de.isdigit() and len(de) <= 8): continue
            if not _entree(x): break
            p = os.path.join(sortie, de)
            x["decompresse"] += os.path.getsize(p) if os.path.isfile(p) else 0
            _fichier(p, x, str(f.get("nom", ""))[-200:], 1)
        shutil.rmtree(sortie, ignore_errors=True)

def _clips(glb):
    try:
        with open(glb, "rb") as f:
            t = f.read(20); n = struct.unpack_from("<I", t, 12)[0]
            if t[:4] != b"glTF" or n > 64 << 20: return []
            j = json.loads(f.read(n))
        return [a.get("name", "") for a in j.get("animations", [])]
    except (OSError, ValueError, struct.error): return []

def _finir(x):
    r, lot, prive = x["r"], x["lot"], x["prive"]
    if lot["ctr"]: _ouvrir_3ds(x)
    _ecouter(x)
    if lot["ba"]:
        m, s = _extraire(x, "badge-arcade", _lot(x, lot["ba"]))
        n = _placer(x, m, s, PERMIS["badge-arcade"]); r["badge_arcade"] += n
        if m.get("erreur"): _abime(r, "Badge Arcade")
    for role, commande in (("collection", "collection"), ("machine-hall", "machine-hall")):
        if role in lot["roles"]:
            nom = lot["noms"].get(role)
            d = tempfile.mkdtemp(prefix="lot-", dir=x["travail"]); f = os.path.join(d, nom if _chemin_sur(nom) and "/" not in nom else "source")
            os.link(lot["roles"][role], f)
            m, s = _extraire(x, commande, f)
            n = _placer(x, m, s, PERMIS[commande])
            notes = m.get("notes") if isinstance(m.get("notes"), dict) else {}
            if role == "collection": r["badges"] += int(notes.get("badges") or 0) if n else 0     
            else: r["badge_arcade"] += n
    if lot["boss"]:
        index = prive / "badges" / "index.json"
        m, s = _extraire(x, "boss", _lot(x, lot["boss"]), _cle(x), str(index) if index.is_file() else "-")
        notes = m.get("notes") if isinstance(m.get("notes"), dict) else {}
        if notes.get("sans_cle"): r["verrouilles"] += 1
        badges_avant = (prive / "badges" / "index.json").is_file()
        n = _placer(x, m, s, PERMIS["boss"]); r["badge_arcade"] += n
        if not badges_avant and (prive / "badges" / "index.json").is_file(): r["badges"] += int(notes.get("badges") or 0)
        if notes.get("sans_semaine"): r["sans_semaine"] = True
    nds, mp = lot["nds"].get("sm64ds", "-"), lot["nds"].get("mpds", "-")
    luigi = prive / LUIGI
    existant = str(luigi) if luigi.is_file() and nds == "-" and mp != "-" and not any(c.startswith("mp_") for c in _clips(luigi)) else "-"
    if nds != "-" or existant != "-":
        m, s = _extraire(x, "luigi", nds, mp, existant)
        if m.get("erreur"): _abime(r, "Super Mario 64 DS" if nds != "-" else "Mario Party DS")
        neuf = next((f for f in m.get("fichiers", []) if isinstance(f, dict) and f.get("vers") == LUIGI), None)
        de_cote = None
        if neuf and luigi.is_file() and mp != "-" and not any(c.startswith("mp_") for c in _clips(luigi)) \
                and any(c.startswith("mp_") for c in _clips(os.path.join(s, str(neuf.get("de"))))):
            de_cote = luigi.with_name(luigi.name + ".avant-mario-party-" + time.strftime("%Y%m%d-%H%M%S"))
            os.replace(luigi, de_cote)
        avant = luigi.is_file()
        n = _placer(x, m, s, PERMIS["luigi"])
        if de_cote and not luigi.is_file(): os.replace(de_cote, luigi)     
        notes = m.get("notes") if isinstance(m.get("notes"), dict) else {}
        r["luigi"] += int(not avant and luigi.is_file()); r["casino"] += n - int(not avant and luigi.is_file())
        r["luigi_mp"] = bool(notes.get("clips_mpds"))
    elif mp != "-":
        if luigi.is_file(): r["deja"] += 1                  
        else: r["mpds_seul"] = True                         
    if all("aides-ffl:" + n in lot["roles"] for n in mii_moteur.AIDES) and not (prive / "mii/moteur/aides-ffl.js").exists():
        try:
            textes = {n: pathlib.Path(lot["roles"]["aides-ffl:" + n]).read_text(encoding="utf-8") for n in mii_moteur.AIDES}
            if _poser_octets(mii_moteur.aides(textes), prive / "mii/moteur/aides-ffl.js"): r["connus"] += 1
        except (OSError, ValueError, UnicodeDecodeError): _abime(r, "aides-ffl.js")
    if "invites" in lot["roles"] and not (prive / "mii/invites.json").exists():
        try:
            if _poser_octets(mii_moteur.invites(pathlib.Path(lot["roles"]["invites"]).read_text(encoding="utf-8")), prive / "mii/invites.json"): r["connus"] += 1
        except (OSError, ValueError, UnicodeDecodeError): _abime(r, "FFLiDatabaseDefault.cpp")

def plein(p):
    try:
        if p.is_file(): return True
        if not p.is_dir(): return False
        for _, _, fichiers in os.walk(p):
            if fichiers: return True
    except OSError: pass
    return False

def _plein(prive, chemin):
    return plein(prive / chemin)

def etat(prive, references=None):
    prive = pathlib.Path(prive)
    refs = references if references is not None else _references()
    sons = {}
    for p in refs:
        if not p.get("emplacement"): continue
        s = sons.setdefault(p.get("famille") or "wiiu", {"n": 0, "sur": 0, "manquent": []})
        s["sur"] += 1
        if (prive / "sons" / p["chemin"]).is_file(): s["n"] += 1
        else: s["manquent"].append(p["emplacement"])
    wiiu = [p for p in refs if p.get("emplacement") and (p.get("famille") or "wiiu") == "wiiu" and str(p.get("emplacement")).startswith("musiques.")]
    manquent = [p["emplacement"] for p in wiiu if not (prive / "sons" / p["chemin"]).is_file()]
    applis = {}
    for appli, dossiers in EXIGE.items():
        manque = list(dict.fromkeys(MANQUE[d] for d in dossiers if not _plein(prive, d)))
        applis[appli] = {"pret": not manque, "manque": manque, "conseils": []}
    c = applis["casino"]["conseils"]
    if (prive / LUIGI).is_file() and not any(n.startswith("mp_") for n in _clips(prive / LUIGI)): c.append("mpds")
    c = applis["badges"]["conseils"]
    if not (prive / "badge-arcade/modeles/romfs/pince-standard.glb").is_file() or not _plein(prive, "sons/badge-arcade/romfs"): c.append("ba-romfs")
    if not (prive / "badge-arcade/bornes/index.json").is_file(): c.append("ba-bornes")
    c = applis["mii"]["conseils"]
    if not (prive / "mii/moteur/aides-ffl.js").is_file(): c.append("aides-mii")
    for f in ("3ds", "wiiu", "switch"):
        if sons.get(f, {}).get("n", 0) < sons.get(f, {}).get("sur", 0): applis["sons"]["conseils"].append("sons-" + f)
    return {"musiques_wiiu": {"n": len(wiiu) - len(manquent), "sur": len(wiiu), "manquent": manquent},
            "sons": {f: {"n": s["n"], "sur": s["sur"]} for f, s in sons.items()},
            "cle3ds": (prive / "cles" / CLE_3DS[0]).is_file(),
            "mii": any((prive / "mii" / "cfl_db").glob("*.json")) if (prive / "mii" / "cfl_db").is_dir() else False,
            "visages": (prive / "mii" / VISAGES[0]).is_file(),
            "luigi": (prive / LUIGI).is_file(), "badge_arcade": _plein(prive, "badge-arcade/modeles/romfs"),
            "applis": applis}

def _nettoyer(racine):
    try: noms = os.listdir(racine)
    except OSError: return
    for n in noms:
        f = os.path.join(racine, n)
        if n.startswith(TRAVAIL) and not os.path.islink(f) and os.path.isdir(f): shutil.rmtree(f, ignore_errors=True)

def _index_garde_robe(prive):
    d = prive / "garde-robe"
    ids = sorted(p.name for p in d.iterdir() if p.is_dir() and not p.is_symlink() and (p / "modele.glb").is_file()) if d.is_dir() else []
    if ids:
        fd, tmp = tempfile.mkstemp(dir=_travail or d); os.close(fd)
        with open(tmp, "w", encoding="utf-8") as o:
            json.dump({"_doc": "liste des articles de la garde-robe des Mii (greffon/garde-robe.js) ; refaite par l'import", "articles": ids}, o, ensure_ascii=False, indent=1)
        os.replace(tmp, d / "index.json")

def importer(source, prive):
    source, prive = os.path.realpath(source), pathlib.Path(prive)
    r = {"mii": 0, "mii_autres": 0, "visages": 0, "cle3ds": 0, "musiques": 0, "sons": {}, "connus": 0, "badge_arcade": 0, "themes": 0,
         "badges": 0, "luigi": 0, "luigi_mp": False, "casino": 0, "romfs": 0, "deja": 0, "abimes": [], "abimes_n": 0,
         "mauvaise": [], "mauvaise_n": 0, "pas_wiiu": 0, "verrouilles": 0, "autrement": 0, "autre_rom": [], "mpds_seul": False,
         "sans_semaine": False, "inconnus": 0, "trop": 0, "refuses": 0, "audio_impossible": False, "vide": True}
    if not os.path.exists(source): return {"erreur": "introuvable"}
    global _travail
    racine = TEMP or os.path.dirname(os.path.realpath(prive))
    os.makedirs(racine, exist_ok=True)
    _nettoyer(racine)
    travail = _travail = tempfile.mkdtemp(prefix=TRAVAIL, dir=racine)    
    references = _references()
    x = {"prive": prive, "r": r, "travail": travail, "references": references, "lus": 0, "entrees": 0,
         "audio_impossible": not references, "decompresse": 0, "n_extraits": 0, "n_gardes": 0, "garde_robe": False,
         "lot": {"audio": [], "ctr": [], "ba": [], "boss": [], "nds": {}, "roles": {}, "noms": {}}}
    try:
        _parcourir(source, x)
        _finir(x)
    finally:
        try:
            if r["mii"] or r["mii_autres"]:
                sortie = prive / "mii"
                if not (sortie / "palettes.json").exists(): _ecrire(str(sortie / "palettes.json"), {"_doc": mii.DOC_PALETTES, **mii.PALETTES})
                mii.ecrire_index(str(sortie))    
            if x["garde_robe"]: _index_garde_robe(prive)
        finally:
            _travail = None
            shutil.rmtree(travail, ignore_errors=True)
    r["etat"] = etat(prive, references)
    return r
