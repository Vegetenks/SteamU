import json, struct, zipfile, zlib
import xml.etree.ElementTree as ET

NS = "{http://www.collada.org/2005/11/COLLADASchema}"
FLOAT, USHORT = 5126, 5123
TAILLE_MAX = 32 * 1024 * 1024        
PIXELS_MAX = 4096 * 4096             
SOMMETS_MAX = 65535
GAIN_BLANC, SATURATION_MAX = .30, .35

class Illisible(ValueError): pass

def _membre(z, nom):
    i = z.getinfo(nom)
    if i.file_size > TAILLE_MAX: raise Illisible("membre trop gros")
    with z.open(i) as f: d = f.read(TAILLE_MAX + 1)
    if len(d) > TAILLE_MAX: raise Illisible("membre trop gros")
    return d

def _membres(z):
    noms = [n for n in z.namelist() if not n.endswith("/")]
    choix = [[n for n in noms if n.lower().endswith(s)] for s in (".dae", "_col.png", "_ao.png")]
    if any(len(c) != 1 for c in choix): raise Illisible("archive inattendue")
    return [c[0] for c in choix]

def lire_png(octets):
    if octets[:8] != b"\x89PNG\r\n\x1a\n": raise Illisible("pas un PNG")
    i, idat, tete = 8, [], None
    while i + 8 <= len(octets):
        n, genre = struct.unpack(">I4s", octets[i:i + 8]); corps = octets[i + 8:i + 8 + n]; i += 12 + n
        if genre == b"IHDR": tete = struct.unpack(">IIBBBBB", corps)
        elif genre == b"IDAT": idat.append(corps)
        elif genre == b"IEND": break
    if not tete: raise Illisible("PNG sans en-tête")
    l, h, prof, type_, _, _, entrelace = tete
    if prof != 8 or entrelace or type_ not in (0, 2, 4, 6) or not 0 < l * h <= PIXELS_MAX: raise Illisible("PNG non pris en charge")
    k = {0: 1, 2: 3, 4: 2, 6: 4}[type_]
    ligne = l * k
    d = zlib.decompressobj(); brut = d.decompress(b"".join(idat), h * (ligne + 1) + 1)   
    if len(brut) < h * (ligne + 1): raise Illisible("PNG tronqué")
    px, prec = [], bytearray(ligne)
    for y in range(h):
        f, r = brut[y * (ligne + 1)], bytearray(brut[y * (ligne + 1) + 1:(y + 1) * (ligne + 1)])
        for x in range(ligne):
            a = r[x - k] if x >= k else 0; b = prec[x]; c = prec[x - k] if x >= k else 0
            if f == 1: r[x] = (r[x] + a) & 255
            elif f == 2: r[x] = (r[x] + b) & 255
            elif f == 3: r[x] = (r[x] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c; pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                r[x] = (r[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        prec = r
        for x in range(l):
            v = r[x * k:(x + 1) * k]
            px.append((v[0], v[0], v[0], 255) if k == 1 else (v[0], v[0], v[0], v[1]) if k == 2 else (v[0], v[1], v[2], 255) if k == 3 else tuple(v))
    return l, h, px

def ecrire_png(l, h, px):
    brut = b"".join(b"\x00" + bytes(c for p in px[y * l:(y + 1) * l] for c in p[:3]) for y in range(h))
    morceau = lambda g, d: struct.pack(">I", len(d)) + g + d + struct.pack(">I", zlib.crc32(g + d) & 0xFFFFFFFF)
    return b"\x89PNG\r\n\x1a\n" + morceau(b"IHDR", struct.pack(">IIBBBBB", l, h, 8, 2, 0, 0, 0)) + morceau(b"IDAT", zlib.compress(brut, 9)) + morceau(b"IEND", b"")

def blanchir(rgb):
    haut, bas = max(rgb), min(rgb)
    s = (haut - bas) / haut if haut else 0
    g = 1 + GAIN_BLANC * max(0.0, 1 - s / SATURATION_MAX)
    return tuple(min(255, round(x * g)) for x in rgb)

def _nombres(texte, f=float):
    return [f(x) for x in (texte or "").split()]

def convertir(archive, ident):
    with zipfile.ZipFile(archive) as z:
        n_dae, n_col, n_ao = _membres(z)
        dae, col, ao = _membre(z, n_dae), _membre(z, n_col), _membre(z, n_ao)
    try: racine = ET.fromstring(dae)
    except ET.ParseError: raise Illisible("COLLADA illisible")
    tableaux = {fa.get("id"): _nombres(fa.text) for fa in racine.iter(NS + "float_array")}
    geo = racine.find(f".//{NS}geometry")
    try:
        sources = {"#" + s.get("id"): tableaux[s.find(NS + "float_array").get("id")] for s in geo.iter(NS + "source")}
        sommets = geo.find(f".//{NS}vertices")
        sources["#" + sommets.get("id")] = sources[sommets.find(NS + "input").get("source")]
        tri = geo.find(f".//{NS}triangles")
        entrees = {e.get("semantic"): (int(e.get("offset")), sources[e.get("source")]) for e in tri.findall(NS + "input")}
        pas = 1 + max(o for o, _ in entrees.values())
        p = _nombres(tri.find(NS + "p").text, int)
        (oP, P), (oN, N), (oT, UV) = entrees["VERTEX"], entrees["NORMAL"], entrees["TEXCOORD"]
        uniques, pos, nor, tex, idx = {}, [], [], [], []
        for i in range(0, len(p) - pas + 1, pas):
            cle = (p[i + oP], p[i + oN], p[i + oT])
            if cle not in uniques:
                if len(uniques) >= SOMMETS_MAX: raise Illisible("trop de sommets")
                uniques[cle] = len(pos) // 3
                v, n, t = P[cle[0] * 3:cle[0] * 3 + 3], N[cle[1] * 3:cle[1] * 3 + 3], UV[cle[2] * 3:cle[2] * 3 + 2]
                if len(v) != 3 or len(n) != 3 or len(t) != 2: raise Illisible("indice hors des tableaux")
                pos += v; nor += n; tex += [t[0], 1 - t[1]]
            idx.append(uniques[cle])
    except (AttributeError, KeyError, TypeError, ValueError) as e:
        if isinstance(e, Illisible): raise
        raise Illisible("COLLADA inattendu")
    if not idx or len(idx) % 3: raise Illisible("pas de triangles")
    l, h, pc = lire_png(col); l2, h2, pa = lire_png(ao)
    if (l, h) != (l2, h2): raise Illisible("textures de tailles différentes")
    png = ecrire_png(l, h, [blanchir(tuple(c[k] * a[0] / 255 for k in range(3))) for c, a in zip(pc, pa)])

    tampon, vues, accesseurs = bytearray(), [], []
    def vue(octets, cible=None):
        while len(tampon) % 4: tampon.append(0)
        vues.append({"buffer": 0, "byteOffset": len(tampon), "byteLength": len(octets), **({"target": cible} if cible else {})})
        tampon.extend(octets); return len(vues) - 1
    def accesseur(valeurs, k, type_, genre=FLOAT, cible=34962):
        octets = struct.pack("<%d%s" % (len(valeurs), "f" if genre == FLOAT else "H"), *valeurs)
        a = {"bufferView": vue(octets, cible), "componentType": genre, "count": len(valeurs) // k, "type": type_}
        if type_ == "VEC3" and genre == FLOAT:
            a["min"] = [min(valeurs[j::3]) for j in range(3)]; a["max"] = [max(valeurs[j::3]) for j in range(3)]
        accesseurs.append(a); return len(accesseurs) - 1
    attributs = {"POSITION": accesseur(pos, 3, "VEC3"), "NORMAL": accesseur(nor, 3, "VEC3"), "TEXCOORD_0": accesseur(tex, 2, "VEC2")}
    indices = accesseur(idx, 1, "SCALAR", USHORT, 34963)
    image = vue(png)
    gltf = {"asset": {"version": "2.0", "generator": "SteamU"}, "scene": 0, "scenes": [{"nodes": [0]}],
            "nodes": [{"name": ident, "mesh": 0}], "meshes": [{"name": ident, "primitives": [{"attributes": attributs, "indices": indices, "material": 0}]}],
            "materials": [{"pbrMetallicRoughness": {"baseColorTexture": {"index": 0}, "metallicFactor": 0, "roughnessFactor": 1}, "extras": {"teintable": False}}],
            "textures": [{"source": 0, "sampler": 0}], "samplers": [{"magFilter": 9729, "minFilter": 9987, "wrapS": 33071, "wrapT": 33071}],
            "images": [{"bufferView": image, "mimeType": "image/png"}],
            "buffers": [{"byteLength": 0}], "bufferViews": vues, "accessors": accesseurs}
    while len(tampon) % 4: tampon.append(0)
    gltf["buffers"][0]["byteLength"] = len(tampon)
    js = json.dumps(gltf, separators=(",", ":")).encode(); js += b" " * (-len(js) % 4)
    return (struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(tampon)) + struct.pack("<II", len(js), 0x4E4F534A) + js
            + struct.pack("<II", len(tampon), 0x004E4942) + bytes(tampon))
