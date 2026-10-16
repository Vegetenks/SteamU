import json, os, re, struct, sys, zipfile, zlib
from collections import Counter, defaultdict

MORCEAU = re.compile(r"^(.*?)(?:_Sep)?\.tile_(\d+)\.png$")

SERIES = {
    "Amiibo1": ("amiibo", "Mario et ses amis", "Mario"), "Amiibo2": ("amiibo", "Animal Crossing", "Animal Crossing"),
    "Amiibo3": ("amiibo", "Splatoon et compagnie", "Splatoon"),
    "Animal": ("Animal Crossing", "les habitants", "Animal Crossing"), "Animal2": ("Animal Crossing", "les habitants 2", "Animal Crossing"),
    "AnimalFes": ("Animal Crossing", "amiibo Festival", "Animal Crossing"), "AnimalItem": ("Animal Crossing", "les objets", "Animal Crossing"),
    "AnimalItem2": ("Animal Crossing", "les objets 2", "Animal Crossing"), "AnimalSanrio": ("Animal Crossing", "× Sanrio", "Animal Crossing"),
    "BTCenter": ("Badge Arcade", "le lapin et l'arcade", "Badge Arcade"), "BTCenter2": ("Badge Arcade", "le lapin 2", "Badge Arcade"),
    "BandBro": ("Jam with the Band", "Band Brothers", "Musique"), "BandBro2": ("Jam with the Band", "Band Brothers 2", "Musique"),
    "CatMario": ("Mario chat", "Super Mario 3D World", "Mario"), "CrazyGalaxy": ("Crazy Galaxy", "les héroïnes", "Divers"),
    "DalSp": ("Darumeshi Sports", "le baseball d'Inuji", "Divers"),
    "DotHard": ("Pixels Nintendo", "Famicom", "Rétro"), "DotHard2": ("Pixels Nintendo", "Nintendo 64", "Rétro"),
    "DotHard3": ("Pixels Nintendo", "Wii", "Rétro"), "DotHard4": ("Pixels Nintendo", "le robot R.O.B.", "Rétro"),
    "DotHard5": ("Pixels Nintendo", "GameCube", "Rétro"),
    "Emblem": ("Fire Emblem", "Fates et Awakening", "Fire Emblem"),
    "FcRemix": ("NES Remix", "les classiques", "Rétro"), "FcRemix2": ("NES Remix", "Zelda II et compagnie", "Rétro"),
    "Hakoboy": ("BoxBoy!", "Qbby et ses boîtes", "Divers"), "HappyHome": ("Animal Crossing", "Happy Home Designer", "Animal Crossing"),
    "Karesansui": ("Jardin zen", "sable et mousse", "Divers"),
    "Kirby": ("Kirby", "Planet Robobot", "Kirby"), "KirbyKey1": ("Kirby", "porte-clés 1", "Kirby"),
    "KirbyKey2": ("Kirby", "porte-clés 2", "Kirby"), "KirbyKey3": ("Kirby", "porte-clés 3", "Kirby"),
    "Lawson": ("Lawson", "Ponta et ses amis", "Divers"),
    "MH": ("Monster Hunter", "les Félynes", "Monster Hunter"), "MH2": ("Monster Hunter", "série 2", "Monster Hunter"),
    "MH3": ("Monster Hunter", "Generations", "Monster Hunter"), "MH4": ("Monster Hunter", "série 4", "Monster Hunter"),
    "MH5": ("Monster Hunter", "les chasseurs", "Monster Hunter"), "MH6": ("Monster Hunter", "série 6", "Monster Hunter"),
    "MH7": ("Monster Hunter", "Stories", "Monster Hunter"),
    "MdWario": ("WarioWare", "Gold", "WarioWare"), "MdWario2": ("WarioWare", "Ashley et les 8 bits", "WarioWare"),
    "Mgmmgr": ("Megami Meguri", "les déesses", "Divers"), "MroGn2D": ("Mario", "les applis de la 3DS", "Mario"),
    "MroKrt8": ("Mario Kart 8", "pilotes et karts", "Mario"),
    "MroMkr": ("Super Mario Maker", "série 1", "Mario"), "MroMkr2": ("Super Mario Maker", "série 2", "Mario"),
    "MroMkr3": ("Super Mario Maker", "série 3", "Mario"), "MroMkr4": ("Super Mario Maker", "série 4", "Mario"),
    "MroMkr5": ("Super Mario Maker", "série 5", "Mario"), "MroMvsD": ("Mario vs. Donkey Kong", "les mini-Mario", "Mario"),
    "MroPrt": ("Mario Party", "Star Rush", "Mario"), "MroRPGMix": ("Mario & Luigi", "les RPG", "Mario"),
    "MroSMB": ("Super Mario Bros.", "le premier", "Mario"), "MroTnsU": ("Mario Tennis", "Ultra Smash", "Mario"),
    "Nikki": ("Nikki", "Swapnote", "Divers"), "Nikki2": ("Nikki", "Swapnote 2", "Divers"),
    "Pkm": ("Pikmin", "Olimar et les Pikmin", "Pikmin"),
    "PokeDot00": ("Pokémon en pixels", "Kanto", "Pokémon"), "PokeDot01": ("Pokémon en pixels", "Johto", "Pokémon"),
    "PokeDot02": ("Pokémon en pixels", "Hoenn", "Pokémon"), "PokeDot03": ("Pokémon en pixels", "Sinnoh", "Pokémon"),
    "PokeDot04": ("Pokémon en pixels", "Unys", "Pokémon"), "PokeDot05": ("Pokémon en pixels", "Kalos", "Pokémon"),
    "PokeDot06": ("Pokémon en pixels", "Alola", "Pokémon"), "PokeDotUn": ("Pokémon en pixels", "les Zarbi", "Pokémon"),
    "PokeExt": ("Pokémon", "Évoli et les saisons", "Pokémon"),
    "Pokemon00": ("Pokémon", "Kanto", "Pokémon"), "Pokemon01": ("Pokémon", "Johto", "Pokémon"),
    "Pokemon02": ("Pokémon", "Hoenn", "Pokémon"), "Pokemon03": ("Pokémon", "Sinnoh", "Pokémon"),
    "Pokemon04": ("Pokémon", "Unys", "Pokémon"), "Pokemon05": ("Pokémon", "Kalos", "Pokémon"),
    "Pokemon06": ("Pokémon", "Alola", "Pokémon"),
    "Pushmo": ("Pushmo", "Mallo", "Divers"), "Rhythm": ("Rhythm Paradise", "Megamix", "Musique"),
    "Rhythm2": ("Rhythm Paradise", "série 2", "Musique"), "Rockman": ("Mega Man", "les robots", "Rétro"),
    "Rockman2": ("Mega Man", "série 2", "Rétro"), "SFZero": ("Star Fox Zero", "Fox et l'Arwing", "Divers"),
    "Sanrio": ("Sanrio", "Hello Kitty et ses amis", "Sanrio"),
    "Spltn": ("Splatoon", "les Inklings", "Splatoon"), "Spltn2": ("Splatoon", "les armes", "Splatoon"),
    "Spltn3": ("Splatoon", "série 3", "Splatoon"), "Spltn4": ("Splatoon", "les marques", "Splatoon"),
    "Spltn5": ("Splatoon", "les habits", "Splatoon"), "Tank": ("Tank Troopers", "chars et pilotes", "Divers"),
    "Todofuken": ("Préfectures du Japon", "les 47 régions", "Divers"), "Tomodachi": ("Tomodachi Life", "les plats et les Mii", "Divers"),
    "YshWW": ("Yoshi", "Woolly World", "Mario"),
    "ZelBoW": ("Zelda", "Breath of the Wild", "Zelda"), "ZelDisk": ("Zelda", "le premier, en pixels", "Zelda"),
    "ZelHero": ("Hyrule Warriors", "Legends", "Zelda"), "ZelMuju": ("Zelda", "Majora's Mask", "Zelda"),
    "ZelTPri": ("Zelda", "Twilight Princess", "Zelda"), "ZelTri": ("Zelda", "A Link to the Past", "Zelda"),
    "ZelTri2": ("Zelda", "A Link Between Worlds", "Zelda"), "ZelWndHD": ("Zelda", "The Wind Waker HD", "Zelda"),
    "Zelda30th": ("Zelda", "les 30 ans", "Zelda"),
}
for _i in range(1, 16): SERIES.setdefault(f"Yokai{_i:02d}", ("Yo-kai Watch", f"série {_i}", "Yo-kai Watch"))

def png_lire(donnees):
    i, idat, l, h = 8, b"", 0, 0
    while i < len(donnees):
        n, = struct.unpack(">I", donnees[i:i + 4]); t = donnees[i + 4:i + 8]; c = donnees[i + 8:i + 8 + n]; i += 12 + n
        if t == b"IHDR":
            l, h, prof, coul, _, _, entr = struct.unpack(">IIBBBBB", c)
            if (prof, coul, entr) != (8, 6, 0): raise ValueError("PNG non RGBA 8 bits")
        elif t == b"IDAT": idat += c
    brut, pas, px, prec = zlib.decompress(idat), l * 4, bytearray(), bytearray(l * 4)
    for y in range(h):
        f, lg = brut[y * (pas + 1)], bytearray(brut[y * (pas + 1) + 1:(y + 1) * (pas + 1)])
        for x in range(pas):
            a = lg[x - 4] if x >= 4 else 0; b = prec[x]; c = prec[x - 4] if x >= 4 else 0
            if f == 1: lg[x] = (lg[x] + a) & 255
            elif f == 2: lg[x] = (lg[x] + b) & 255
            elif f == 3: lg[x] = (lg[x] + ((a + b) >> 1)) & 255
            elif f == 4:
                p = a + b - c; pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                lg[x] = (lg[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        px += lg; prec = lg
    return l, h, px

def png_ecrire(chemin, l, h, px):
    brut = b"".join(b"\0" + bytes(px[y * l * 4:(y + 1) * l * 4]) for y in range(h))
    bloc = lambda t, c: struct.pack(">I", len(c)) + t + c + struct.pack(">I", zlib.crc32(t + c) & 0xffffffff)
    with open(chemin, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n" + bloc(b"IHDR", struct.pack(">IIBBBBB", l, h, 8, 6, 0, 0, 0))
                + bloc(b"IDAT", zlib.compress(brut, 9)) + bloc(b"IEND", b""))

def fond(t):
    tour = [tuple(t[(y * 64 + x) * 4:(y * 64 + x) * 4 + 4]) for i in range(64) for (x, y) in ((i, 0), (i, 63), (0, i), (63, i))]
    c, n = Counter(p for p in tour if p[3] > 100).most_common(1)[0] if any(p[3] > 100 for p in tour) else (None, 0)
    return c if n > len(tour) / 2 else None

def contenu(t, f):
    m = []
    for k in range(4096):
        p = t[k * 4:k * 4 + 4]
        m.append(p[3] > 100 and not (f and sum(abs(p[c] - f[c]) for c in range(3)) < 40))
    return m

def couture(a, ma, b, mb, sens):
    note = 0.0
    for i in range(64):
        ka, kb = (i * 64 + 63, i * 64) if sens == "h" else (63 * 64 + i, i)
        if ma[ka] and mb[kb]: note += 1 - min(1, sum(abs(a[ka * 4 + c] - b[kb * 4 + c]) for c in range(3)) / 200)
        elif ma[ka] != mb[kb]: note -= .5
    return note

def ecarts(m):
    xs = [k % 64 for k in range(4096) if m[k]]; ys = [k // 64 for k in range(4096) if m[k]]
    return (min(xs), min(ys), 63 - max(xs), 63 - max(ys)) if xs else (64, 64, 64, 64)

FORCES = {"MroMkr2/Pr_MroMkr2_SMB3_Enm017_00.png": [1, 2], "ZelDisk/Pr_ZelDisk_Chara_LinkGHeartBottle.png": [1, 2]}

def disposition(morceaux):
    ms = [contenu(t, fond(t)) for t in morceaux]
    R = lambda i, j, s: couture(morceaux[i], ms[i], morceaux[j], ms[j], s)
    if len(morceaux) == 2:
        ea, eb = ecarts(ms[0]), ecarts(ms[1])
        gh, gv = ea[2] + eb[0], ea[3] + eb[1]           
        if abs(gh - gv) >= 8: return [2, 1] if gh < gv else [1, 2]
        return [2, 1] if R(0, 1, "h") > R(0, 1, "v") else [1, 2]   
    if len(morceaux) == 4:
        carre = R(0, 1, "h") + R(2, 3, "h") + R(0, 2, "v") + R(1, 3, "v")
        ligne = R(0, 1, "h") + R(1, 2, "h") + R(2, 3, "h")
        return [4, 1] if R(1, 2, "h") > 40 and ligne > carre else [2, 2]
    c = int(len(morceaux) ** .5 + .999); return [c, (len(morceaux) + c - 1) // c]

def assembler(morceaux, col, rang):
    l, h = 64 * col, 64 * rang; px = bytearray(l * h * 4)
    for k, t in enumerate(morceaux):
        ox, oy = (k % col) * 64, (k // col) * 64
        for y in range(64): px[((oy + y) * l + ox) * 4:((oy + y) * l + ox + 64) * 4] = t[y * 256:(y + 1) * 256]
    return l, h, px

def extraire(ARCHIVE, SORTIE):
    z = zipfile.ZipFile(ARCHIVE)
    noms = [n for n in z.namelist() if n.endswith(".png")]
    par_serie = defaultdict(list)
    for n in noms:
        p = n.split("/")
        if len(p) == 3 and p[0] == "Badges": par_serie[p[1]].append(p[2])
    os.makedirs(SORTIE, exist_ok=True)
    index = {"version": 2, "source": os.path.basename(ARCHIVE), "series": []}
    total = grands_total = 0
    for s in sorted(par_serie, key=str.lower):
        d = os.path.join(SORTIE, s); os.makedirs(d, exist_ok=True)
        seuls, groupes = [], defaultdict(dict)
        for f in sorted(par_serie[s]):
            m = MORCEAU.match(f)
            if m: groupes[m.group(1)][int(m.group(2))] = f
            else: seuls.append(f)
        badges, morceaux_tous, grands = [], [], 0
        for f in seuls:
            with open(os.path.join(d, f), "wb") as o: o.write(z.read(f"Badges/{s}/{f}"))
            badges.append({"id": f"{s}/{f}", "fichier": f, "cases": [1, 1]})
        for base, mx in sorted(groupes.items()):
            ordre = [mx[k] for k in sorted(mx)]
            morceaux = [png_lire(z.read(f"Badges/{s}/{m}"))[2] for m in ordre]
            f = base + ".png"
            col, rang = FORCES.get(f"{s}/{f}") or disposition(morceaux)
            png_ecrire(os.path.join(d, f), *assembler(morceaux, col, rang))
            for k, m in enumerate(ordre):                       
                with open(os.path.join(d, m), "wb") as o: o.write(z.read(f"Badges/{s}/{m}"))
                morceaux_tous.append({"id": f"{s}/{m}", "fichier": m, "cases": [1, 1], "morceau": {"de": f"{s}/{f}", "x": k % col, "y": k // col}})
            badges.append({"id": f"{s}/{f}", "fichier": f, "cases": [col, rang], "morceaux": [f"{s}/{m}" for m in ordre]}); grands += 1
        icone = f"Set Icons/{s}.png"
        if icone in noms:
            with open(os.path.join(d, "_icone.png"), "wb") as o: o.write(z.read(icone))
        nom, sous, famille = SERIES.get(s, (s, "", "Divers"))
        badges.sort(key=lambda b: b["fichier"].lower())
        index["series"].append({"id": s, "nom": nom, "sous": sous, "famille": famille,
                                "icone": "_icone.png" if icone in noms else None, "badges": badges + morceaux_tous})
        total += len(badges); grands_total += grands
    with open(os.path.join(SORTIE, "index.json"), "w", encoding="utf-8") as o:
        json.dump(index, o, ensure_ascii=False, separators=(",", ":"))
    return total

if __name__ == "__main__":
    extraire(sys.argv[1], sys.argv[2])
