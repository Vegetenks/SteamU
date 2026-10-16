import contextlib, json, os, re, struct, sys

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
NOM_SUR = re.compile(r"[A-Za-z0-9_][A-Za-z0-9_.-]{0,79}")
MEMOIRE = 3 * 1024 ** 3              
FICHIER_MAX = 1024 ** 3              
CASINO = ("NCS_SE_MGM_C_", "NCS_SE_MGM_COIN_", "NCS_SE_MGM_CASINO_", "NCS_SE_MGM_L_")
CASINO_VOIX = "NCS_SE_MGM_L_"

def _lire(chemin):
    with open(chemin, "rb") as f: return f.read()

def _ecrire(chemin, octets):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, "wb") as f: f.write(octets)

def _boot9(arg):
    return None if arg == "-" else _lire(arg)

def romfs(entree, boot9, octets_max, fichiers_max, sortie):
    import ctr
    os.makedirs(sortie, exist_ok=True)
    debut, taille = ctr.ncch_dans(entree)
    brut = ctr.romfs_de_ncch(entree, debut, taille, _boot9(boot9), sortie)
    if not brut: return {"fichiers": [], "notes": {"romfs": 0}}
    sortis, total = [], 0
    with open(brut, "rb") as f:
        for k, (nom, o, t) in enumerate(ctr.fichiers_romfs(brut, int(fichiers_max))):
            total += t
            if total > int(octets_max): break
            f.seek(o); de = "%06d" % (k + 1)
            with open(os.path.join(sortie, de), "wb") as s:
                reste = t
                while reste > 0:
                    b = f.read(min(reste, 1 << 22))
                    if not b: break
                    s.write(b); reste -= len(b)
            sortis.append({"de": de, "nom": nom[-200:]})
    os.unlink(brut)
    return {"fichiers": sortis, "notes": {"romfs": len(sortis)}}

def badge_arcade(lot, sortie):
    import ctr, bch, bch2gltf, bcsar, layout
    entrees = json.loads(_lire(os.path.join(lot, "lot.json")))
    romfs_dir = os.path.join(sortie, "romfs", "region_common", "model")
    os.makedirs(romfs_dir, exist_ok=True)
    modeles, layouts, bcsar_ = set(), {}, None
    for e in entrees:
        if not NOM_SUR.fullmatch(e["fichier"]): continue
        d = _lire(os.path.join(lot, e["fichier"]))
        try:
            if d[:4] == b"CSAR": bcsar_ = bcsar_ or d; continue
            c = ctr.yaz0(d)
            if c[:4] == b"BCH\0":
                for m in bch.lire_bch(c)["modeles"]:
                    if m["nom"] and re.fullmatch(r"CaOb[A-Za-z0-9_]{1,60}", m["nom"]):
                        _ecrire(os.path.join(romfs_dir, m["nom"] + ".bch.szs"), d); modeles.add(m["nom"])
            elif c[:4] == b"SARC":
                S = ctr.sarc(c)
                arch = next((k[5:-6] for k in S if k.startswith("blyt/") and k.endswith(".bflyt")), None)
                if arch and re.fullmatch(r"MgCr[A-Za-z0-9_]{1,60}", arch):
                    rang = 0 if "/fr/" in "/" + e.get("nom", "") else 1 if "common" in e.get("nom", "") else 2
                    if arch not in layouts or rang < layouts[arch][0]: layouts[arch] = (rang, S)
        except Exception as x:
            print("illisible", e["fichier"], type(x).__name__, file=sys.stderr)
    fichiers, notes = [], {"modeles": len(modeles), "interfaces": len(layouts), "bruitages": 0, "pinces": 0}
    for nom, G in bch2gltf.pinces(os.path.join(sortie, "romfs")):    
        _ecrire(os.path.join(sortie, "pinces", nom + ".glb"), G.glb())
        fichiers.append({"de": f"pinces/{nom}.glb", "vers": f"badge-arcade/modeles/romfs/{nom}.glb"}); notes["pinces"] += 1
    for arch, (_, S) in sorted(layouts.items()):
        for k, v in sorted(S.items()):
            tex = k.rsplit("/", 1)[-1][:-6] if k.endswith(".bflim") else None
            if not tex or not NOM_SUR.fullmatch(tex): continue
            try:
                w, h, img, _, _ = layout.lire_flim(v)
                _ecrire(os.path.join(sortie, "interface", arch, tex + ".png"), bch.png(img, w, h))
                fichiers.append({"de": f"interface/{arch}/{tex}.png", "vers": f"badge-arcade/romfs-eur/layout-png/{arch}/{tex}.png"})
            except Exception as x:
                print("texture", arch, tex, type(x).__name__, file=sys.stderr)
    if bcsar_:
        C = bcsar.lire_csar(bcsar_)
        cache, banques = {}, {}
        for s in C["sons"]:
            nom = s.get("nom") or ""
            if not nom.startswith("SE_") or not NOM_SUR.fullmatch(nom) or s["type"] != "sequence": continue
            f = C["fichiers"][s["fichier"]] if s["fichier"] < len(C["fichiers"]) else None
            if not f or f[:4] != b"CSEQ": continue
            try:
                _, base = bcsar.labels_cseq(f)
                notes_, tempo = bcsar.evenements_sequence(f, base, base + s["debut"])
                b_ = (s.get("banques") or [None])[0]
                if b_ is None or (b_ & 0xFFFFFF) >= len(C["banques"]): continue
                bf = C["fichiers"][C["banques"][b_ & 0xFFFFFF]["fichier"]]
                if not bf: continue
                if id(bf) not in banques: banques[id(bf)] = bcsar.lire_cbnk(bf)
                ech, fr = bcsar.rendre_notes(C, notes_, tempo, banques[id(bf)], cache)
                if not ech: continue
                chemin = os.path.join(sortie, "bruitages", nom + ".wav"); os.makedirs(os.path.dirname(chemin), exist_ok=True)
                bcsar.ecrire_wav_stereo(chemin, ech, fr)
                fichiers.append({"de": f"bruitages/{nom}.wav", "vers": f"sons/badge-arcade/romfs/{nom}.ogg", "convertir": "ogg"})
                notes["bruitages"] += 1
            except Exception as x:
                print("bruitage", nom, type(x).__name__, file=sys.stderr)
    return {"fichiers": fichiers, "notes": notes}

def boss(lot, boot9, index, sortie):
    import ctr, boss_extraire, bornes_preparer, badges_extraire
    entrees = json.loads(_lire(os.path.join(lot, "lot.json")))
    cle, tout, notes = _boot9(boot9), {}, {"conteneurs": 0, "sans_cle": 0, "bornes": 0, "badges": 0}
    for k, e in enumerate(entrees):
        if not NOM_SUR.fullmatch(e["fichier"]): continue
        d = _lire(os.path.join(lot, e["fichier"]))
        try:
            s = ctr.dechiffrer_boss(d, cle) if d[:4] == b"boss" else d
            boss_extraire.ouvrir(s, "%d:" % k, tout); notes["conteneurs"] += 1
        except ctr.SansCle:
            notes["sans_cle"] += 1
        except Exception as x:
            print("SpotPass illisible", type(x).__name__, x, file=sys.stderr)
    if not tout: return {"fichiers": [], "notes": notes}
    if index != "-" and not any(ctr.yaz0(c, debut=4)[:4] == b"FOBS" for c in tout.values()):
        notes["sans_semaine"] = 1
        return {"fichiers": [], "notes": notes}
    donnees = os.path.join(sortie, "boss")
    boss_extraire.extraire(tout, __import__("pathlib").Path(donnees), False)
    fichiers = []
    if index == "-":
        badges = json.loads(_lire(os.path.join(donnees, "badges.json")))
        series = {}
        for nom, b in sorted(badges.items()):
            cat = b.get("categorie") or ""
            src = os.path.join(donnees, "badges", boss_extraire.nom_fichier(cat), boss_extraire.nom_fichier(nom) + "-64.png")
            if not (NOM_SUR.fullmatch(cat) and NOM_SUR.fullmatch(nom) and os.path.exists(src)): continue
            series.setdefault(cat, []).append({"id": f"{cat}/{nom}.png", "fichier": f"{nom}.png", "cases": [1, 1]})
            fichiers.append({"de": os.path.relpath(src, sortie), "vers": f"badges/{cat}/{nom}.png"})
        idx = {"version": 2, "source": "données SpotPass de Badge Arcade (import)", "series": []}
        for cat in sorted(series, key=str.lower):
            nom, sous, famille = badges_extraire.SERIES.get(cat, (cat, "", "Divers"))
            ic = os.path.join(donnees, "icones", "series", boss_extraire.nom_fichier(cat) + ".png")
            if os.path.exists(ic): fichiers.append({"de": os.path.relpath(ic, sortie), "vers": f"badges/{cat}/_icone.png"})
            idx["series"].append({"id": cat, "nom": nom, "sous": sous, "famille": famille,
                                  "icone": "_icone.png" if os.path.exists(ic) else None, "badges": series[cat]})
        index = os.path.join(sortie, "badges-index.json")
        _ecrire(index, json.dumps(idx, ensure_ascii=False, separators=(",", ":")).encode())
        fichiers.append({"de": "badges-index.json", "vers": "badges/index.json"})
        notes["badges"] = sum(len(v) for v in series.values())
    bornes = os.path.join(sortie, "bornes")
    notes["bornes"] = bornes_preparer.preparer(donnees, index, bornes)
    if notes["bornes"]:
        for r, _, fs in os.walk(bornes):
            for f in fs:
                rel = os.path.relpath(os.path.join(r, f), bornes)
                fichiers.append({"de": "bornes/" + rel, "vers": "badge-arcade/bornes/" + rel})
    return {"fichiers": fichiers, "notes": notes}

def collection(zip_, sortie):
    import badges_extraire
    n = badges_extraire.extraire(zip_, os.path.join(sortie, "badges"))
    fichiers = [{"de": os.path.relpath(os.path.join(r, f), sortie), "vers": os.path.relpath(os.path.join(r, f), sortie)}
                for r, _, fs in os.walk(os.path.join(sortie, "badges")) for f in fs]
    return {"fichiers": fichiers, "notes": {"badges": n}}

def machine_hall(zip_, sortie):
    import machine_hall
    machine_hall.main(zip_, os.path.join(sortie, "machine-hall.glb"))
    return {"fichiers": [{"de": "machine-hall.glb", "vers": "badge-arcade/machine-hall.glb"}], "notes": {"machine": 1}}

def tenue_dae(zip_, ident, sortie):
    import tenue_dae
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,39}", ident): return {"erreur": "illisible"}
    _ecrire(os.path.join(sortie, "modele.glb"), tenue_dae.convertir(zip_, ident))
    return {"fichiers": [{"de": "modele.glb", "vers": f"visiteurs/{ident}/modele.glb"}], "notes": {"tenue": 1}}

def luigi(nds, mpds_, glb_existant, sortie):
    import sm64ds, mpds, sdat
    fichiers, notes = [], {"luigi": 0, "clips": 0, "clips_mpds": 0, "casino": 0}
    j = binaire = None
    if nds != "-":
        octets = _lire(nds)
        cart = sm64ds.Cartouche(octets)
        j, binaire = sm64ds.bmd_vers_glb(cart.lire(sm64ds.CROUPIER),
                                         "Super Mario 64 DS, MG/luigi_d.bmd (cartouche de l'utilisateur) — Nintendo, usage personnel")
        sm64ds.ajouter_clips(j, binaire, cart)
        S = sdat.SDAT(cart.lire("data/sound_data.sdat"))
        for nom in sorted({n for _, noms in S.arcs for n in noms if n and n.startswith(CASINO)}):
            if not NOM_SUR.fullmatch(nom): continue
            try: r = sdat.rendre(S, nom)
            except Exception as x: print("bruitage", nom, type(x).__name__, file=sys.stderr); continue
            if not r: continue
            _ecrire(os.path.join(sortie, "casino", nom + ".wav"), sdat.wav(*r))
            fichiers.append({"de": f"casino/{nom}.wav", "vers": f"casino-luigi/sons/{nom}.wav"}); notes["casino"] += 1
            if nom.startswith(CASINO_VOIX): fichiers.append({"de": f"casino/{nom}.wav", "vers": f"casino-luigi/voix/{nom}.wav"})
    elif glb_existant != "-":
        g = _lire(glb_existant)
        lj, = struct.unpack_from("<I", g, 12)
        j = json.loads(g[20:20 + lj]); lb, = struct.unpack_from("<I", g, 20 + lj)
        binaire = bytearray(g[28 + lj:28 + lj + lb])
    if j is None: return {"fichiers": fichiers, "notes": notes}
    if mpds_ != "-": mpds.ajouter_clips(j, binaire, _lire(mpds_))
    noms = [a["name"] for a in j.get("animations", [])]
    notes.update(clips=len(noms), clips_mpds=sum(n.startswith("mp_") for n in noms))
    _ecrire(os.path.join(sortie, "luigi-croupier.glb"), sm64ds.glb(j, binaire))
    fichiers.append({"de": "luigi-croupier.glb", "vers": "luigi/luigi-croupier.glb"}); notes["luigi"] = 1
    return {"fichiers": fichiers, "notes": notes}

COMMANDES = {"romfs": (romfs, 5), "badge-arcade": (badge_arcade, 2), "boss": (boss, 4), "collection": (collection, 2),
             "machine-hall": (machine_hall, 2), "tenue-dae": (tenue_dae, 3), "luigi": (luigi, 4)}

if __name__ == "__main__":
    import resource
    resource.setrlimit(resource.RLIMIT_AS, (MEMOIRE, MEMOIRE))
    resource.setrlimit(resource.RLIMIT_FSIZE, (FICHIER_MAX, FICHIER_MAX))
    sortie_vraie = sys.stdout
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDES or len(sys.argv) != 2 + COMMANDES[sys.argv[1]][1]: sys.exit(2)
    try:
        with contextlib.redirect_stdout(sys.stderr):            
            r = COMMANDES[sys.argv[1]][0](*sys.argv[2:])
    except Exception as e:
        import ctr
        r = {"erreur": "autre_cle" if isinstance(e, ctr.AutreCle) else "sans_cle" if isinstance(e, ctr.SansCle) else "illisible",
             "detail": type(e).__name__}
        print(type(e).__name__, e, file=sys.stderr)
    print(json.dumps(r, ensure_ascii=False), file=sortie_vraie)
