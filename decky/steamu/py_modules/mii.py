import argparse, base64, binascii, datetime, json, os, random, re, sys, tempfile, unicodedata

DOSSIER_OUTIL = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(os.path.dirname(DOSSIER_OUTIL))
VENV = os.path.join(DOSSIER_OUTIL, ".venv")
SORTIE = os.path.join(RACINE, "ressources-privees", "mii")
FORMAT = "pcv-mii-1"

def _relancer_dans_le_venv():
    python = os.path.join(VENV, "bin", "python")
    if os.environ.get("PCV_MII_VENV") or not os.path.exists(python):
        return
    if os.path.realpath(sys.prefix) == os.path.realpath(VENV):
        return
    os.environ["PCV_MII_VENV"] = "1"
    os.execv(python, [python, os.path.abspath(__file__)] + sys.argv[1:])

TAILLE_QR = 0x70        
TAILLE_STORE = 0x60     
TAILLE_COEUR = 0x5C     
TAILLE_QR_LONG = 0x400  
TAILLE_SANS_AUTEUR = 0x48
CLE_QR = bytes.fromhex("59FC817E6446EA6190347B20E9BDCE52")
NONCE_POS, NONCE_TAILLE = 0x0C, 8     
TAILLE_MAX_FOUILLE = 16 * 1024 * 1024
EXTENSIONS_IMAGE = (".jpg", ".jpeg", ".jpe", ".jfif", ".png", ".bmp", ".webp", ".mpo", ".tif", ".tiff", ".gif")
EXTENSIONS_TELEPHONE = (".heic", ".heif", ".avif")    

CFL_TETE, CFL_MII, CFL_NB = 0x8, TAILLE_COEUR, 100
CFL_CRC1 = 0xC81E                         
CFRA, CFRA_NB, CFRA_MII, CFRA_CRC = 0xC820, 0xC824, 0xC88C, 0xE4BE
CFRA_TAILLE = TAILLE_SANS_AUTEUR
SUITE, SUITE_NB, SUITE_TAILLE = 0xE4C0, 3000, 0x54   

_FFL = {
    "teints": [(1.000, 0.827, 0.678), (1.000, 0.714, 0.420), (0.870, 0.475, 0.259), (1.000, 0.667, 0.549),
               (0.678, 0.318, 0.161), (0.388, 0.173, 0.094)],
    "cheveux": [(0.118, 0.102, 0.094), (0.251, 0.125, 0.063), (0.361, 0.094, 0.039), (0.486, 0.227, 0.078),
                (0.471, 0.471, 0.502), (0.306, 0.243, 0.063), (0.533, 0.345, 0.094), (0.816, 0.627, 0.290)],
    "yeux": [(0.000, 0.000, 0.000), (0.424, 0.439, 0.439), (0.400, 0.235, 0.173), (0.376, 0.369, 0.188),
             (0.275, 0.329, 0.659), (0.220, 0.439, 0.345)],
    "levres": [(0.847, 0.322, 0.031), (0.941, 0.047, 0.031), (0.961, 0.282, 0.282), (0.941, 0.604, 0.455),
               (0.549, 0.314, 0.251)],
    "levres_ombre": [(0.510, 0.188, 0.094), (0.471, 0.047, 0.047), (0.533, 0.125, 0.157), (0.863, 0.471, 0.314),
                     (0.275, 0.118, 0.039)],
    "lunettes": [(0.094, 0.094, 0.094), (0.376, 0.219, 0.062), (0.658, 0.062, 0.031), (0.125, 0.188, 0.407),
                 (0.658, 0.376, 0.000), (0.470, 0.439, 0.407)],
    "couleurs_preferees": [(0.824, 0.118, 0.078), (1.000, 0.431, 0.098), (1.000, 0.847, 0.125), (0.471, 0.824, 0.125),
                           (0.000, 0.471, 0.188), (0.039, 0.282, 0.706), (0.235, 0.667, 0.871), (0.961, 0.353, 0.490),
                           (0.451, 0.157, 0.678), (0.282, 0.220, 0.094), (0.878, 0.878, 0.878), (0.094, 0.094, 0.078)],
    "grain_de_beaute": [(0.071, 0.059, 0.059)],
    "traits": [(0.000, 0.000, 0.000)],
}

def _hex(rvb):
    return "#" + "".join(f"{round(c * 255):02X}" for c in rvb)

PALETTES = {nom: [_hex(c) for c in liste] for nom, liste in _FFL.items()}
NOMS_COULEURS = {   
    "teints": ["clair", "doré", "hâlé", "rosé", "mat", "foncé"],
    "cheveux": ["noirs", "bruns", "auburn", "roux", "gris", "châtain foncé", "châtain clair", "blonds"],
    "yeux": ["noirs", "gris", "marron", "noisette", "bleus", "verts"],
    "levres": ["orangées", "rouges", "roses", "pêche", "brunes"],
    "lunettes": ["noires", "brunes", "rouges", "bleues", "dorées", "grises"],
    "couleurs_preferees": ["rouge", "orange", "jaune", "vert clair", "vert", "bleu", "bleu ciel", "rose", "violet",
                           "marron", "blanc", "noir"],
}
DOC_PALETTES = {
    "teints": "skinColor 0-5 (peau du visage et du corps)",
    "cheveux": "hairColor, eyebrowColor et facialHairColor 0-7 (une seule palette pour les trois)",
    "yeux": "eyeColor 0-5 : iris",
    "levres": "mouthColor 0-4 : lèvres",
    "levres_ombre": "mouthColor 0-4 : seconde teinte, plus sombre, de la bouche dans FFL (mouthColorG)",
    "lunettes": "glassesColor 0-5 : monture",
    "couleurs_preferees": "favoriteColor 0-11 : vêtements, et bonnet/casquette des coiffures 34 et 57",
    "grain_de_beaute": "couleur unique du grain de beauté",
    "traits": "couleur des contours (nez, traits)",
}

EDITEUR = {
    "faceType": [[0x00, 0x01, 0x08, 0x02, 0x03, 0x09, 0x04, 0x05, 0x0a, 0x06, 0x07, 0x0b]],
    "hairType": [
        [0x21, 0x2f, 0x28, 0x25, 0x20, 0x6b, 0x30, 0x33, 0x37, 0x46, 0x2c, 0x42],
        [0x34, 0x32, 0x26, 0x31, 0x2b, 0x1f, 0x38, 0x44, 0x3e, 0x73, 0x4c, 0x77],
        [0x40, 0x51, 0x74, 0x79, 0x16, 0x3a, 0x3c, 0x57, 0x7d, 0x75, 0x49, 0x4b],
        [0x2a, 0x59, 0x39, 0x36, 0x50, 0x22, 0x17, 0x56, 0x58, 0x76, 0x27, 0x24],
        [0x2d, 0x43, 0x3b, 0x41, 0x29, 0x1e, 0x0c, 0x10, 0x0a, 0x52, 0x80, 0x81],
        [0x0e, 0x5f, 0x69, 0x64, 0x06, 0x14, 0x5d, 0x66, 0x1b, 0x04, 0x11, 0x6e],
        [0x7b, 0x08, 0x6a, 0x48, 0x03, 0x15, 0x00, 0x62, 0x3f, 0x5a, 0x0b, 0x78],
        [0x05, 0x4a, 0x6c, 0x5e, 0x7c, 0x19, 0x63, 0x45, 0x23, 0x0d, 0x7a, 0x71],
        [0x35, 0x18, 0x55, 0x53, 0x47, 0x83, 0x60, 0x65, 0x1d, 0x07, 0x0f, 0x70],
        [0x4f, 0x01, 0x6d, 0x7f, 0x5b, 0x1a, 0x3d, 0x67, 0x02, 0x4d, 0x12, 0x5c],
        [0x54, 0x09, 0x13, 0x82, 0x61, 0x68, 0x2e, 0x4e, 0x1c, 0x72, 0x7e, 0x6f]],
    "eyebrowType": [
        [0x06, 0x00, 0x0c, 0x01, 0x09, 0x13, 0x07, 0x15, 0x08, 0x11, 0x05, 0x04],
        [0x0b, 0x0a, 0x02, 0x03, 0x0e, 0x14, 0x0f, 0x0d, 0x16, 0x12, 0x10, 0x17]],
    "eyeType": [
        [0x02, 0x04, 0x00, 0x08, 0x27, 0x11, 0x01, 0x1a, 0x10, 0x0f, 0x1b, 0x14],
        [0x21, 0x0b, 0x13, 0x20, 0x09, 0x0c, 0x17, 0x22, 0x15, 0x19, 0x28, 0x23],
        [0x05, 0x29, 0x0d, 0x24, 0x25, 0x06, 0x18, 0x1e, 0x1f, 0x12, 0x1c, 0x2e],
        [0x07, 0x2c, 0x26, 0x2a, 0x2d, 0x1d, 0x03, 0x2b, 0x16, 0x0a, 0x0e, 0x2f],
        [0x30, 0x31, 0x32, 0x35, 0x3b, 0x38, 0x36, 0x3a, 0x39, 0x37, 0x33, 0x34]],
    "noseType": [
        [0x01, 0x0a, 0x02, 0x03, 0x06, 0x00, 0x05, 0x04, 0x08, 0x09, 0x07, 0x0b],
        [0x0d, 0x0e, 0x0c, 0x11, 0x10, 0x0f]],
    "mouthType": [
        [0x17, 0x01, 0x13, 0x15, 0x16, 0x05, 0x00, 0x08, 0x0a, 0x10, 0x06, 0x0d],
        [0x07, 0x09, 0x02, 0x11, 0x03, 0x04, 0x0f, 0x0b, 0x14, 0x12, 0x0e, 0x0c],
        [0x1b, 0x1e, 0x18, 0x19, 0x1d, 0x1c, 0x1a, 0x23, 0x1f, 0x22, 0x21, 0x20]],
}
POSITION_EDITEUR = {cle: {v: (p + 1, i + 1) for p, page in enumerate(pages) for i, v in enumerate(page)}
                    for cle, pages in EDITEUR.items()}

COIFFURES = [ligne.split(";") for ligne in """
mi-longs;carré aux pointes relevées
attachés;petite queue haute en épi
attachés;chignon bas
mi-longs;volumineux
longs;raides, frange droite
courts;carré court dégradé
mi-longs;carré
mi-longs;bouclés
mi-longs;dégradés
attachés;queue de cheval basse
mi-longs;carré arrondi
courts;dégradés
mi-longs;carré à mèche
mi-longs;carré, frange en pointes
longs;
mi-longs;ondulés
mi-longs;carré
mi-longs;dégradés
attachés;chignon haut
attachés;couettes basses
mi-longs;frange droite
mi-longs;carré à frange
mi-longs;raie au milieu
courts;
mi-longs;ondulés
mi-longs;carré à frange droite
attachés;queue de cheval haute
longs;volumineux
attachés;deux nattes
attachés;chignon et mèches bouclées
chauve;
courts;hérissés
mi-longs;dégradés à frange
courts;frange en pointes
couvre-chef;bonnet
courts;coupe au bol
très courts;en brosse
courts;frange en pointes
courts;en épis
très courts;
courts;frange en pointes
dégarnis;chauve sur le dessus
longs;dreadlocks
courts;en épis
courts;raie au milieu
très courts;
attachés;petites couettes
courts;frange en pointes
courts;mèche sur le côté
courts;en épis
mi-longs;dégradés
courts;
courts;raie au milieu
mi-longs;bouclés
courts;volumineux
courts;mèche sur le côté
courts;en bataille
couvre-chef;casquette
mi-longs;carré
courts;
mi-longs;dégradés
attachés;queue de cheval sur le côté
courts;en bataille
mi-longs;
mi-longs;en bataille
très courts;rasés
courts;
courts;
courts;en bataille
courts;volumineux
courts;mèche sur le côté
mi-longs;bouclés
mi-longs;carré à frange droite
mi-longs;en bataille
mi-longs;carré
mi-longs;en épis
courts;en bataille
mi-longs;carré à barrette
attachés;couettes hautes
courts;bouclés
mi-longs;tresses plaquées
mi-longs;mèche sur l'œil
longs;
mi-longs;afro
attachés;queue de cheval sur le côté
mi-longs;ondulés
courts;
mi-longs;dégradés
très courts;front dégarni
courts;tresses plaquées
mi-longs;carré aux pointes relevées, frange
attachés;petite queue haute en épi, frange
attachés;chignon bas, frange
longs;raides
courts;carré court à frange
mi-longs;
mi-longs;ondulés
attachés;queue de cheval basse
courts;dégradés
mi-longs;
longs;volumineux, frange droite
mi-longs;ondulés
mi-longs;dégradés
attachés;chignon haut
attachés;couettes basses, frange
mi-longs;mèche sur le côté
mi-longs;carré
courts;mèche en épi
mi-longs;carré
attachés;queue de cheval haute
longs;frange en pointes
attachés;deux nattes, frange
attachés;chignon et mèches bouclées, frange
courts;coupe au bol
attachés;deux macarons
courts;en bataille
mi-longs;carré à mèche
mi-longs;
courts;coupe au bol
courts;frange en pointes
mi-longs;dégradés à frange
courts;en bataille
courts;frange arrondie
mi-longs;carré à mèche
mi-longs;carré à frange droite
mi-longs;en épis
attachés;couettes hautes, frange
courts;bouclés
longs;mèche sur le côté
longs;frange droite
attachés;queue de cheval basse
mi-longs;dégradés
""".strip().splitlines()]
COUVRE_CHEF = (34, 57)
FORMES = ["en œuf", "rond", "ovale", "carré aux joues pleines", "anguleux", "carré", "arrondi large", "rectangulaire",
          "en pointe", "rond plein", "menton saillant", "trapèze"]
TRAITS = ["aucun", "rides obliques sous les yeux", "sillons des joues", "plis des pommettes",
          "petites rides sous les yeux",
          "poches sous les yeux", "menton fendu", "pli du menton", "orbites creusées", "rides du sourire",
          "pattes d'oie", "rides marquées"]
MAQUILLAGES = ["aucun", "joues roses", "joues roses marquées", "fard à paupières vert", "pommettes rosées",
               "pommettes orangées", "fard vert et joues roses", "fard pêche et joues roses", "fard rose et pommettes",
               "taches de rousseur", "barbe naissante au menton", "barbe naissante en collier"]
LUNETTES = ["aucune", "carrées épaisses", "rectangulaires", "rondes fines", "ovales", "ovales épaisses",
            "d'aviateur teintées", "carrées teintées", "papillon teintées"]
MOUSTACHES = ["aucune", "moustache épaisse", "moustache fine séparée", "moustache en fer à cheval",
              "moustache large arquée", "mouche sous la lèvre"]
BARBES = ["aucune", "barbiche", "bouc", "barbe pleine", "collier fin", "bouc cerclé"]
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre",
        "décembre"]
REGIONS = ["aucun", "Japon", "Amérique", "Europe"]
JEUX_CARACTERES = ["Japon/Amérique/Europe", "Chine", "Corée", "Taïwan"]
CONSOLES = {1: "Wii", 2: "DS", 3: "3DS", 4: "Wii U ou Switch"}

CHAMPS = [
    ("version", 0x00, 1, 0, 8, 0, 3),
    ("allowCopying", 0x01, 1, 0, 1, 0, 1), ("profanityFlag", 0x01, 1, 1, 1, 0, 1),
    ("regionLock", 0x01, 1, 2, 2, 0, 3), ("characterSet", 0x01, 1, 4, 2, 0, 3),
    ("pageIndex", 0x02, 1, 0, 4, 0, 9), ("slotIndex", 0x02, 1, 4, 4, 0, 9),
    ("unknown1", 0x03, 1, 0, 4, 0, 15), ("deviceOrigin", 0x03, 1, 4, 3, 1, 4),
    ("gender", 0x18, 2, 0, 1, 0, 1), ("birthMonth", 0x18, 2, 1, 4, 0, 12), ("birthDay", 0x18, 2, 5, 5, 0, 31),
    ("favoriteColor", 0x18, 2, 10, 4, 0, 11), ("favorite", 0x18, 2, 14, 1, 0, 1),
    ("height", 0x2E, 1, 0, 8, 0, 127), ("build", 0x2F, 1, 0, 8, 0, 127),
    ("disableSharing", 0x30, 1, 0, 1, 0, 1), ("faceType", 0x30, 1, 1, 4, 0, 11), ("skinColor", 0x30, 1, 5, 3, 0, 5),
    ("wrinklesType", 0x31, 1, 0, 4, 0, 11), ("makeupType", 0x31, 1, 4, 4, 0, 11),
    ("hairType", 0x32, 1, 0, 8, 0, 131), ("hairColor", 0x33, 1, 0, 3, 0, 7), ("flipHair", 0x33, 1, 3, 1, 0, 1),
    ("eyeType", 0x34, 4, 0, 6, 0, 59), ("eyeColor", 0x34, 4, 6, 3, 0, 5), ("eyeScale", 0x34, 4, 9, 4, 0, 7),
    ("eyeVerticalStretch", 0x34, 4, 13, 3, 0, 6), ("eyeRotation", 0x34, 4, 16, 5, 0, 7),
    ("eyeSpacing", 0x34, 4, 21, 4, 0, 12), ("eyeYPosition", 0x34, 4, 25, 5, 0, 18),
    ("eyebrowType", 0x38, 4, 0, 5, 0, 23), ("eyebrowColor", 0x38, 4, 5, 3, 0, 7),
    ("eyebrowScale", 0x38, 4, 8, 4, 0, 8), ("eyebrowVerticalStretch", 0x38, 4, 12, 3, 0, 6),
    ("eyebrowRotation", 0x38, 4, 16, 4, 0, 11), ("eyebrowSpacing", 0x38, 4, 21, 4, 0, 12),
    ("eyebrowYPosition", 0x38, 4, 25, 5, 3, 18),
    ("noseType", 0x3C, 2, 0, 5, 0, 17), ("noseScale", 0x3C, 2, 5, 4, 0, 8), ("noseYPosition", 0x3C, 2, 9, 5, 0, 18),
    ("mouthType", 0x3E, 2, 0, 6, 0, 35), ("mouthColor", 0x3E, 2, 6, 3, 0, 4), ("mouthScale", 0x3E, 2, 9, 4, 0, 8),
    ("mouthHorizontalStretch", 0x3E, 2, 13, 3, 0, 6),
    ("mouthYPosition", 0x40, 1, 0, 5, 0, 18), ("mustacheType", 0x40, 1, 5, 3, 0, 5),
    ("unknown2", 0x41, 1, 0, 8, 0, 255),
    ("beardType", 0x42, 2, 0, 3, 0, 5), ("facialHairColor", 0x42, 2, 3, 3, 0, 7),
    ("mustacheScale", 0x42, 2, 6, 4, 0, 8), ("mustacheYPosition", 0x42, 2, 10, 5, 0, 16),
    ("glassesType", 0x44, 2, 0, 4, 0, 8), ("glassesColor", 0x44, 2, 4, 3, 0, 5),
    ("glassesScale", 0x44, 2, 7, 4, 0, 7), ("glassesYPosition", 0x44, 2, 11, 5, 0, 20),
    ("moleEnabled", 0x46, 2, 0, 1, 0, 1), ("moleScale", 0x46, 2, 1, 4, 0, 8),
    ("moleXPosition", 0x46, 2, 5, 5, 0, 16), ("moleYPosition", 0x46, 2, 10, 5, 0, 30),
]
BOOLEENS = {"allowCopying", "profanityFlag", "favorite", "disableSharing", "flipHair", "moleEnabled"}
PLAGES = {nom: (mini, maxi) for nom, _, _, _, _, mini, maxi in CHAMPS}
NOM_MII, AUTEUR = 0x1A, 0x48          
ID_SYSTEME, ID_MII, MAC = 0x04, 0x0C, 0x10
EPOQUE_MII = datetime.datetime(2010, 1, 1)     

class Illisible(Exception):
    pass

class SansQR(Illisible):
    pass

class SansMii(Illisible):
    pass

def _table_crc():
    table = []
    for i in range(256):
        c = i << 8
        for _ in range(8):
            c = ((c << 1) ^ 0x1021) if c & 0x8000 else c << 1
        table.append(c & 0xFFFF)
    return table

TABLE_CRC = _table_crc()

def crc16(d):
    c = 0
    for o in d:
        c = ((c << 8) & 0xFFFF) ^ TABLE_CRC[(c >> 8) ^ o]
    return c

def avec_crc(coeur):
    d = bytes(coeur[:TAILLE_COEUR]) + b"\0\0"
    return d + crc16(d).to_bytes(2, "big")

def _texte(d, off):
    brut = bytes(d[off:off + 0x14])
    fin = next((i for i in range(0, 0x14, 2) if brut[i:i + 2] == b"\0\0"), 0x14)
    return brut[:fin].decode("utf-16-le", errors="replace")

def decoder(d):
    if len(d) < TAILLE_SANS_AUTEUR:
        raise Illisible(f"{len(d)} octets : trop court pour un Mii (0x48 au moins)")
    f, anomalies = {}, []
    for nom, off, larg, bit, n, mini, maxi in CHAMPS:
        v = (int.from_bytes(d[off:off + larg], "little") >> bit) & ((1 << n) - 1)
        f[nom] = bool(v) if nom in BOOLEENS else v
        if not mini <= v <= maxi:
            anomalies.append(f"{nom} = {v} hors de la plage {mini}-{maxi}")
    ident = int.from_bytes(d[ID_MII:ID_MII + 4], "big")
    f.update(systemId=d[ID_SYSTEME:ID_SYSTEME + 8].hex(), miiId=d[ID_MII:ID_MII + 4].hex(),
             normalMii=bool(ident >> 31 & 1), dsMii=bool(ident >> 30 & 1), nonUserMii=bool(ident >> 29 & 1),
             isValid=bool(ident >> 28 & 1), creationTime=ident & 0x0FFFFFFF, consoleMAC=d[MAC:MAC + 6].hex(),
             miiName=_texte(d, NOM_MII), creatorName=_texte(d, AUTEUR) if len(d) >= TAILLE_COEUR else None)
    if f["version"] != 3:
        anomalies.append(f"version {f['version']} au lieu de 3 : ce n'est probablement pas un Mii 3DS/Wii U")
    if not f["normalMii"] and not f["disableSharing"]:
        anomalies.append("Mii spécial dont le partage n'est pas désactivé (la console le jugerait invalide)")
    return f, anomalies

def encoder(f):
    d = bytearray(TAILLE_COEUR)
    for nom, off, larg, bit, n, mini, maxi in CHAMPS:
        v = int(f[nom])
        if not 0 <= v < 1 << n:
            raise ValueError(f"{nom} = {v} ne tient pas sur {n} bits")
        cour = int.from_bytes(d[off:off + larg], "little") & ~(((1 << n) - 1) << bit)
        d[off:off + larg] = (cour | v << bit).to_bytes(larg, "little")
    d[ID_SYSTEME:ID_SYSTEME + 8] = bytes.fromhex(f["systemId"])
    ident = (f["normalMii"] << 31 | f["dsMii"] << 30 | f["nonUserMii"] << 29 | f["isValid"] << 28
             | f["creationTime"] & 0x0FFFFFFF)
    d[ID_MII:ID_MII + 4] = ident.to_bytes(4, "big")
    d[MAC:MAC + 6] = bytes.fromhex(f["consoleMAC"])
    for off, texte in ((NOM_MII, f["miiName"]), (AUTEUR, f["creatorName"] or "")):
        brut = texte.encode("utf-16-le")[:0x14]
        d[off:off + 0x14] = brut + bytes(0x14 - len(brut))
    return avec_crc(d)

def _crypto():
    try:
        from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
        from cryptography.hazmat.primitives.ciphers.aead import AESCCM
    except ImportError:
        raise Illisible("bibliothèque « cryptography » absente : outils/3ds/.venv/bin/pip install cryptography")
    return Cipher, algorithms, modes, AESCCM

def dechiffrer_qr(q):
    Cipher, algorithms, modes, AESCCM = _crypto()
    nonce = q[:NONCE_TAILLE] + bytes(4)
    chiffre, mac = q[NONCE_TAILLE:0x60], q[0x60:TAILLE_QR]
    compteur1 = bytes([2]) + nonce + b"\0\0\1"        
    clair = Cipher(algorithms.AES(CLE_QR), modes.CTR(compteur1)).decryptor().update(chiffre)
    attendu = AESCCM(CLE_QR, tag_length=16).encrypt(nonce, clair + bytes(8), None)
    mac_juste = attendu[:len(chiffre)] == chiffre and attendu[-16:] == mac
    return clair[:NONCE_POS] + q[:NONCE_TAILLE] + clair[NONCE_POS:], mac_juste

def chiffrer_qr(d):
    *_, AESCCM = _crypto()
    nonce = bytes(d[NONCE_POS:NONCE_POS + NONCE_TAILLE])
    clair = bytes(d[:NONCE_POS]) + bytes(d[NONCE_POS + NONCE_TAILLE:TAILLE_STORE])
    sortie = AESCCM(CLE_QR, tag_length=16).encrypt(nonce + bytes(4), clair + bytes(8), None)
    return nonce + sortie[:len(clair)] + sortie[-16:]

def _variantes(gris, cv2):
    h, w = gris.shape[:2]
    yield "telle quelle", gris
    for f in (2, 3, 4):
        if max(h, w) * f <= 2400:
            yield f"agrandie ×{f}", cv2.resize(gris, None, fx=f, fy=f, interpolation=cv2.INTER_CUBIC)
    if max(h, w) > 1600:
        f = 1600 / max(h, w)
        yield "réduite", cv2.resize(gris, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
    base = gris if max(h, w) >= 600 else cv2.resize(gris, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    yield "seuil d'Otsu", cv2.threshold(cv2.GaussianBlur(base, (3, 3), 0), 0, 255,
                                        cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    yield "seuil adaptatif", cv2.adaptiveThreshold(base, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 51, 5)
    yield "accentuée", cv2.addWeighted(base, 1.8, cv2.GaussianBlur(base, (0, 0), 3), -0.8, 0)

def lire_qr_image(chemin):
    try:
        import cv2
    except ImportError:
        raise Illisible("OpenCV absent : outils/3ds/.venv/bin/pip install opencv-python-headless zxing-cpp")
    try:
        import zxingcpp
    except ImportError:
        zxingcpp = None
    img = cv2.imread(chemin, cv2.IMREAD_COLOR)
    if img is None:
        raise Illisible("image que OpenCV ne sait pas ouvrir (fichier coupé ou abîmé ? refaire la copie FTP en mode "
                        "binaire)")
    gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    trouves = {}
    for nom, v in _variantes(gris, cv2):
        if zxingcpp:
            try:
                for r in zxingcpp.read_barcodes(v, formats=zxingcpp.BarcodeFormat.QRCode):
                    trouves.setdefault(bytes(r.bytes), f"zxing-cpp ({nom})")
            except Exception:
                pass
        for detecteur in (cv2.QRCodeDetector(), getattr(cv2, "QRCodeDetectorAruco", lambda: None)()):
            if detecteur is None or not hasattr(detecteur, "detectAndDecodeBytes"):
                continue
            try:
                octets = detecteur.detectAndDecodeBytes(v)[0]
            except Exception:
                continue
            if octets:
                trouves.setdefault(_octets_opencv(bytes(octets)), f"OpenCV ({nom})")
        if any(len(o) >= TAILLE_QR for o in trouves):
            break
    return trouves

def _octets_opencv(o):
    if len(o) == TAILLE_QR:
        return o
    try:
        brut = o.decode("utf-8").encode("latin-1")
        return brut if len(brut) >= TAILLE_QR else o
    except (UnicodeDecodeError, UnicodeEncodeError):
        return o

def analyser_qr(q):
    if len(q) < TAILLE_QR:
        apercu = q[:40].decode("utf-8", errors="replace")
        raise Illisible(f"QR de {len(q)} octets ({apercu!r}…) : pas un Mii 3DS (0x70 octets attendus)")
    donnees, mac_juste = dechiffrer_qr(q[:TAILLE_QR])
    controle = {"mac_qr": "vérifiée", "octets_qr": len(q)}
    if len(q) > TAILLE_QR:
        if len(q) == 0x90 and q[TAILLE_QR] == 0x11:
            controle["supplement"] = "QR de Switch 2 : 0x20 octets d'extension (couleurs étendues) non décodés"
        else:
            controle["supplement"] = (f"{len(q) - TAILLE_QR} octets de plus (Tomodachi Life ou Miitomo : IV + données "
                                      "AES-CTR) non décodés")
    if not mac_juste:
        if donnees[0] != 3 or crc16(donnees[:0x5E]) != int.from_bytes(donnees[0x5E:TAILLE_STORE], "big"):
            raise Illisible(f"QR de {len(q)} octets : MAC et CRC faux, ce n'est pas un Mii 3DS (QR d'un autre jeu ?)")
        controle["mac_qr"] = "FAUSSE, mais CRC du Mii juste (QR fabriqué hors d'une 3DS ?) : à vérifier"
    return donnees, controle

def _deplier_si_diff(d, avert):
    if d[0x100:0x104] != b"DIFF":
        return d
    try:
        if DOSSIER_OUTIL not in sys.path:
            sys.path.insert(0, DOSSIER_OUTIL)
        from badges import deplier_diff
        rendu = deplier_diff(d)
        contenu, manque = rendu if isinstance(rendu, tuple) else (rendu, 0)
        if not isinstance(contenu, (bytes, bytearray)):
            raise TypeError(f"deplier_diff a rendu {type(contenu).__name__} au lieu d'octets")
        avert("conteneur DIFF déplié (fonction deplier_diff de badges.py)", info=True)
        if manque:
            avert(f"conteneur DIFF coupé : {manque} octets du contenu manquent (copie interrompue ?), complétés de zéros")
        return bytes(contenu)
    except Exception as e:
        avert(f"conteneur DIFF non déplié ({type(e).__name__} : {e}) : recherche directe dans les octets bruts")
        return d

def _etat_crc(donnees, stocke):
    c = crc16(donnees)
    if c == int.from_bytes(stocke, "big"):
        return "bon"
    if c == int.from_bytes(stocke, "little"):
        return "bon (rangé en petit-boutiste)"
    return "FAUX (copie abîmée, ou pas la base attendue)"

def lire_cfl_db(d, avert):
    base = d.find(b"CFOG")
    if base < 0:
        raise Illisible("pas d'en-tête « CFOG »")
    db = d[base:]
    trouves, ecartes = [], 0
    if len(db) >= CFL_CRC1 + 2:
        etat = _etat_crc(db[:CFL_CRC1], db[CFL_CRC1:CFL_CRC1 + 2])
        avert(f"CFL_DB.dat : CRC de la section Mii Maker {etat}", info=etat.startswith("bon"))
    else:
        avert(f"CFL_DB.dat tronqué ({len(db):#x} octets) : seules les entrées complètes sont lues")
    for i in range(CFL_NB):
        e = db[CFL_TETE + i * CFL_MII:CFL_TETE + (i + 1) * CFL_MII]
        if len(e) == CFL_MII and any(e):
            if not vraisemblable(e):
                ecartes += 1
                continue
            trouves.append((e, "cfl_db", {"section": "CFOG (Mii Maker)", "entree": i,
                                          "mii_personnel_probable": i == 0}))
    if db[CFRA:CFRA + 4] == b"CFRA":
        nb = min(int.from_bytes(db[CFRA_NB:CFRA_NB + 4], "little"), CFL_NB)
        for i in range(CFL_NB):
            e = db[CFRA_MII + i * CFRA_TAILLE:CFRA_MII + (i + 1) * CFRA_TAILLE]
            if len(e) == CFRA_TAILLE and any(e):
                if not vraisemblable(e):
                    ecartes += 1
                    continue
                trouves.append((e, "autres", {"section": "CFRA (invitations de la place Mii)", "entree": i}))
        if len(db) >= CFRA_CRC + 2:
            etat = _etat_crc(db[CFRA:CFRA_CRC], db[CFRA_CRC:CFRA_CRC + 2])
            avert(f"CFL_DB.dat : section CFRA, {nb} Mii annoncés, CRC {etat}", info=etat.startswith("bon"))
    for i in range(SUITE_NB):
        e = db[SUITE + i * SUITE_TAILLE:SUITE + (i + 1) * SUITE_TAILLE]
        if len(e) < SUITE_TAILLE:
            break
        if any(e):
            if not vraisemblable(e):
                ecartes += 1
                continue
            secondes = int.from_bytes(e[TAILLE_SANS_AUTEUR:TAILLE_SANS_AUTEUR + 4], "little")
            quand = (datetime.datetime(2000, 1, 1) + datetime.timedelta(seconds=secondes)).isoformat()
            trouves.append((e[:TAILLE_SANS_AUTEUR], "autres",
                            {"section": "suite (liée à CFHE)", "entree": i, "horodatage": quand}))
    if ecartes:
        avert(f"CFL_DB.dat : {ecartes} entrée(s) non vide(s) écartée(s), ce ne sont pas des Mii (base abîmée, ou "
              "conteneur DIFF mal déplié)")
    if not trouves and not ecartes:
        avert("CFL_DB.dat lu, mais aucun Mii n'y est enregistré (base vide, comme celle d'une console neuve)")
    return trouves

def vraisemblable(d, i=0):
    return (d[i] == 3 and d[i + 1] & 0xC0 == 0 and d[i + 3] & 0x80 == 0 and 1 <= d[i + 3] >> 4 <= 4
            and d[i + 0x16:i + 0x18] == b"\0\0")

def fouiller(d):
    pos, i = [], d.find(b"\x03")
    while 0 <= i <= len(d) - TAILLE_STORE:
        if (vraisemblable(d, i) and d[i + 0x5C:i + 0x5E] == b"\0\0"
                and crc16(d[i:i + 0x5E]) == int.from_bytes(d[i + 0x5E:i + 0x60], "big")):
            pos.append(i)
            i += TAILLE_STORE
        else:
            i += 1
        i = d.find(b"\x03", i)
    return pos

def _couleur(palette, i):
    noms, hexa = NOMS_COULEURS[palette], PALETTES[palette]
    return {"valeur": i, "nom": noms[i] if i < len(noms) else None, "hex": hexa[i] if i < len(hexa) else None}

def _type(cle, v, noms=None):
    sortie = {"valeur": v}
    if noms is not None:
        sortie["nom"] = noms[v] if v < len(noms) else None
    if cle in POSITION_EDITEUR:
        p = POSITION_EDITEUR[cle].get(v)
        sortie["editeur"] = {"page": p[0], "position": p[1]} if p else None
    return sortie

def _echelle(v, mots):
    return mots[min(len(mots) - 1, v * len(mots) // 128)]

def lisible(f):
    coiffure = _type("hairType", f["hairType"])
    if f["hairType"] < len(COIFFURES):
        coiffure["longueur"], coiffure["detail"] = COIFFURES[f["hairType"]]
    anniv = None
    if 1 <= f["birthMonth"] <= 12 and f["birthDay"]:
        anniv = {"jour": f["birthDay"], "mois": f["birthMonth"],
                 "texte": f"{'1er' if f['birthDay'] == 1 else f['birthDay']} {MOIS[f['birthMonth'] - 1]}"}
    return {
        "nom": f["miiName"], "createur": f["creatorName"],
        "sexe": "féminin" if f["gender"] else "masculin",
        "anniversaire": anniv,
        "couleur_preferee": _couleur("couleurs_preferees", f["favoriteColor"]),
        "favori": f["favorite"],
        "taille": {"valeur": f["height"], "texte": _echelle(f["height"], ["très petite", "petite", "moyenne", "grande",
                                                                          "très grande"])},
        "corpulence": {"valeur": f["build"], "texte": _echelle(f["build"], ["très mince", "mince", "moyenne", "forte",
                                                                            "très forte"])},
        "visage": {"forme": _type("faceType", f["faceType"], FORMES), "teint": _couleur("teints", f["skinColor"]),
                   "traits": _type("wrinklesType", f["wrinklesType"], TRAITS),
                   "maquillage": _type("makeupType", f["makeupType"], MAQUILLAGES)},
        "cheveux": {"coiffure": coiffure, "couleur": _couleur("cheveux", f["hairColor"]), "inversee": f["flipHair"],
                    "couvre_chef_couleur_preferee": f["hairType"] in COUVRE_CHEF},
        "yeux": {"type": _type("eyeType", f["eyeType"]), "couleur": _couleur("yeux", f["eyeColor"]),
                 "taille": f["eyeScale"], "epaisseur": f["eyeVerticalStretch"], "rotation": f["eyeRotation"],
                 "ecart": f["eyeSpacing"], "hauteur": f["eyeYPosition"]},
        "sourcils": {"type": _type("eyebrowType", f["eyebrowType"]), "couleur": _couleur("cheveux", f["eyebrowColor"]),
                     "taille": f["eyebrowScale"], "epaisseur": f["eyebrowVerticalStretch"],
                     "rotation": f["eyebrowRotation"], "ecart": f["eyebrowSpacing"], "hauteur": f["eyebrowYPosition"]},
        "nez": {"type": _type("noseType", f["noseType"]), "taille": f["noseScale"], "hauteur": f["noseYPosition"]},
        "bouche": {"type": _type("mouthType", f["mouthType"]), "couleur": _couleur("levres", f["mouthColor"]),
                   "taille": f["mouthScale"], "epaisseur": f["mouthHorizontalStretch"], "hauteur": f["mouthYPosition"]},
        "pilosite": {"couleur": _couleur("cheveux", f["facialHairColor"]),
                     "moustache": {"type": _type("mustacheType", f["mustacheType"], MOUSTACHES),
                                   "taille": f["mustacheScale"], "hauteur": f["mustacheYPosition"]},
                     "barbe": {"type": _type("beardType", f["beardType"], BARBES)}},
        "lunettes": {"type": _type("glassesType", f["glassesType"], LUNETTES),
                     "couleur": _couleur("lunettes", f["glassesColor"]),
                     "taille": f["glassesScale"], "hauteur": f["glassesYPosition"]},
        "grain_de_beaute": {"present": f["moleEnabled"], "taille": f["moleScale"], "x": f["moleXPosition"],
                            "y": f["moleYPosition"]},
    }

def _nom(x):
    return x.get("nom") or f"n° {x['valeur']}"

def description(f, l):
    c = l["cheveux"]
    longueur, detail = c["coiffure"].get("longueur"), c["coiffure"].get("detail")
    teinte = c["couleur"]["nom"] or f"de couleur n° {f['hairColor']}"
    if longueur == "chauve":
        cheveux = "chauve"
    elif longueur == "couvre-chef":
        cheveux = f"{detail} couleur {_nom(l['couleur_preferee'])} sur cheveux {teinte}"
    elif longueur in ("attachés", "dégarnis"):
        cheveux = f"cheveux {teinte} {longueur}" + (f" ({detail})" if detail else "")
    elif longueur:
        cheveux = f"cheveux {longueur} {teinte}" + (f" ({detail})" if detail else "")
    else:
        cheveux = f"coiffure n° {f['hairType']} {teinte}"
    morceaux = [f"Mii {l['sexe']}", cheveux, f"yeux {_nom(l['yeux']['couleur'])}",
                f"teint {_nom(l['visage']['teint'])}"]
    if f["glassesType"]:
        morceaux.append(f"lunettes {_nom(l['lunettes']['type'])} {_nom(l['lunettes']['couleur'])}")
    poils = [_nom(t) for t in (l["pilosite"]["moustache"]["type"], l["pilosite"]["barbe"]["type"]) if t["valeur"]]
    if poils:
        morceaux.append(" et ".join(poils) + f" (poils {_nom(l['pilosite']['couleur'])})")
    for cle, valeur in (("traits", f["wrinklesType"]), ("maquillage", f["makeupType"])):
        if valeur:
            morceaux.append(_nom(l["visage"][cle]))
    if f["moleEnabled"]:
        morceaux.append("grain de beauté")
    morceaux.append(f"taille {l['taille']['texte']}, corpulence {l['corpulence']['texte']}")
    morceaux.append(f"couleur préférée : {_nom(l['couleur_preferee'])}")
    return ", ".join(m for m in morceaux if m) + "."

DOC = {
    "ffl": "valeurs brutes sous les noms de FFL / mii-js (plages : clé _doc.plages) ; ce que lit un moteur de Mii",
    "donnees_3ds": "CFLStoreData de 0x60 octets (CRC juste), à donner tel quel à FFL.js ou mii-js",
    "description": "estimation lisible ; coiffures, formes, traits, maquillage, lunettes et barbes sont étiquetés à "
                   "l'œil sur les vignettes de l'éditeur (approximatif)",
    "editeur": "page et position (1 à 12, ordre de lecture) de la partie dans l'éditeur du Mii Maker (3dbrew)",
    "curseurs": "taille, épaisseur, rotation, écart, hauteur : valeurs brutes ; dans le Mii Maker le bouton gauche "
                "augmente la taille et l'épaisseur (3dbrew)",
    "couvre_chef_couleur_preferee": "coiffures 34 (bonnet) et 57 (casquette) : teintes de la couleur préférée",
    "technique.cree_le": "date de création tirée du Mii ID, à l'heure de la console",
    "technique.special": "Mii spécial (pantalon doré) : bit 31 du Mii ID à zéro",
    "controle.crc": "les QR officiels anciens ont souvent un CRC faux : la 3DS l'ignore et se fie à la MAC (3dbrew)",
    "palettes": "couleurs officielles de FFL (FFLiColor.cpp) en sRGB ; l'indice de chaque couleur est la valeur brute",
}

def fiche(octets, source, controle, complete=True):
    f, anomalies = decoder(octets)
    l = lisible(f)
    cree = EPOQUE_MII + datetime.timedelta(seconds=f["creationTime"] * 2)
    store = avec_crc(octets) if len(octets) >= TAILLE_COEUR else None
    controle = dict(controle)
    if len(octets) >= TAILLE_STORE:
        stocke = int.from_bytes(octets[0x5E:0x60], "big")
        controle["crc"] = "bon" if stocke == crc16(octets[:0x5E]) else f"différent ({stocke:04X}), recalculé"
    elif len(octets) >= TAILLE_COEUR:
        controle["crc"] = "absent de la source, recalculé"
    controle["anomalies"] = anomalies
    sortie = {"_format": FORMAT}
    if complete:
        sortie["_doc"] = dict(DOC, plages={nom: f"{a}-{b}" for nom, (a, b) in PLAGES.items()})
    sortie.update(l)
    sortie["description"] = description(f, l)
    sortie["technique"] = {
        "version": f["version"], "special": not f["normalMii"], "temporaire": f["nonUserMii"],
        "copie_autorisee": f["allowCopying"], "partage_desactive": f["disableSharing"],
        "nom_signale_inapproprie": f["profanityFlag"],
        "verrou_region": REGIONS[f["regionLock"]], "jeu_de_caracteres": JEUX_CARACTERES[f["characterSet"]],
        "console_origine": CONSOLES.get(f["deviceOrigin"], f"inconnue ({f['deviceOrigin']})"),
        "position_mii_maker": {"page": f["pageIndex"], "case": f["slotIndex"]},
        "id_mii": f["miiId"], "cree_le": cree.isoformat(), "id_systeme": f["systemId"], "mac_createur":
            ":".join(f["consoleMAC"][i:i + 2] for i in range(0, 12, 2)),
    }
    sortie["controle"] = controle
    sortie["source"] = source
    sortie["ffl"] = f
    if store:
        sortie["donnees_3ds"] = {"hex": store.hex(), "base64": base64.b64encode(store).decode()}
    else:
        sortie["donnees_partielles_hex"] = bytes(octets).hex()
    if complete:
        sortie["palettes"] = PALETTES
    return sortie

def lire_entree(chemin, rel, avert):
    if chemin.lower().endswith(EXTENSIONS_TELEPHONE):
        raise Illisible("photo HEIC/AVIF qu'OpenCV ne sait pas ouvrir : l'enregistrer en JPG sur le téléphone, ou "
                        "prendre le JPG du Mii Maker dans le DCIM de la 3DS")
    if chemin.lower().endswith(EXTENSIONS_IMAGE):
        qrs = lire_qr_image(chemin)
        if not qrs:
            raise SansQR("aucun QR code trouvé dans l'image")
        trouves, raisons = [], []
        for q, lecteur in qrs.items():
            try:
                d, controle = analyser_qr(q)
                trouves.append((d, "principal", {"fichier": rel, "nature": "QR code Mii Maker", "lecteur": lecteur},
                                controle))
            except Illisible as e:
                raisons.append(str(e))
        if not trouves:
            raise Illisible("; ".join(raisons))
        return trouves
    taille = os.path.getsize(chemin)
    if taille > TAILLE_MAX_FOUILLE:
        raise SansMii(f"fichier de {taille} octets, trop gros pour contenir des Mii (non fouillé)")
    with open(chemin, "rb") as fic:
        d = fic.read()
    return lire_octets(d, rel, avert)

def lire_octets(d, rel, avert):
    if not d:
        raise SansMii("fichier vide (copie interrompue ?)")
    source = {"fichier": rel}
    texte = _octets_du_texte(d) if len(d) < 1024 else None
    if texte is not None:
        d, source["nature_texte"] = texte
    d = _deplier_si_diff(d, avert)
    if b"CFOG" in d:
        return [(e, groupe, dict(source, nature="CFL_DB.dat", **ctx), {}) for e, groupe, ctx in lire_cfl_db(d, avert)]
    if len(d) == TAILLE_QR:
        donnees, controle = analyser_qr(d)
        return [(donnees, "principal", dict(source, nature="contenu de QR (0x70 octets)"), controle)]
    if len(d) in (TAILLE_STORE, TAILLE_COEUR) and d[0] == 3:
        nature = "CFLStoreData (0x60 octets)" if len(d) == TAILLE_STORE else "Mii sans CRC (0x5C octets)"
        return [(d, "principal", dict(source, nature=nature), {})]
    if TAILLE_QR < len(d) <= TAILLE_QR_LONG:
        try:
            donnees, controle = analyser_qr(d)
            if controle["mac_qr"] == "vérifiée":
                return [(donnees, "principal", dict(source, nature=f"contenu de QR ({len(d)} octets)"), controle)]
        except Illisible:
            pass
    pos = fouiller(d)
    if not pos:
        raise SansMii(f"{len(d)} octets sans Mii reconnaissable (ni QR, ni CFL_DB.dat, ni CFLStoreData à CRC juste)")
    return [(d[p:p + TAILLE_STORE], "principal", dict(source, nature="CFLStoreData trouvé par CRC", position=hex(p)),
             {}) for p in pos]

def _octets_du_texte(d):
    try:
        t = d.decode("ascii").strip() if isinstance(d, bytes) else d.strip()
    except UnicodeDecodeError:
        return None
    t = re.sub(r"\s+", "", t)
    if re.fullmatch(r"(0x)?[0-9A-Fa-f]+", t) and len(t) % 2 == 0:
        brut = bytes.fromhex(t[2:] if t.startswith("0x") else t)
        if len(brut) >= TAILLE_SANS_AUTEUR:
            return brut, "hexadécimal"
    try:
        brut = base64.b64decode(t + "=" * (-len(t) % 4), validate=True)
        if len(brut) in (TAILLE_COEUR, TAILLE_STORE, TAILLE_QR, 0x90) or len(brut) > TAILLE_QR:
            return brut, "base64"
    except (binascii.Error, ValueError):
        pass
    return None

def fichiers(entrees):
    for e in entrees:
        if os.path.isdir(e):
            for dossier, sous, noms in os.walk(e):
                sous[:] = sorted(s for s in sous if not s.startswith("."))
                for n in sorted(noms):
                    yield os.path.join(dossier, n)
        else:
            yield e

def nom_de_fichier(nom, repli):
    s = unicodedata.normalize("NFC", nom or "").strip()
    s = "".join(c for c in s if unicodedata.category(c)[0] in "LNPSZ" and c not in '\\/:*?"<>|')
    s = re.sub(r"\s+", "-", s).strip(".-")
    return s or repli

def ecrire_json(chemin, donnees):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin + ".tmp", "w", encoding="utf-8") as fic:
        json.dump(donnees, fic, ensure_ascii=False, indent=1)
        fic.write("\n")
    os.replace(chemin + ".tmp", chemin)

NOMS_RESERVES = {"index", "palettes", "autres"}     

def chemin_pour(dossier, base, identite, pris):
    n = 1
    while True:
        nom = base if n == 1 else f"{base}-{n}"
        chemin = os.path.join(dossier, nom + ".json")
        if nom.lower() in NOMS_RESERVES:       
            libre = False
        elif chemin in pris:
            libre = pris[chemin] == identite
        else:
            try:
                with open(chemin, encoding="utf-8") as fic:
                    t = json.load(fic).get("technique", {})
                libre = (t.get("id_mii"), t.get("id_systeme")) == identite
            except (OSError, ValueError, AttributeError):
                libre = not os.path.exists(chemin)
        if libre:
            pris[chemin] = identite
            return chemin
        n += 1

def ecrire_index(sortie):
    entrees = []
    for dossier, _, noms in os.walk(sortie):
        for n in sorted(noms):
            if not n.endswith(".json") or n in ("index.json", "palettes.json"):
                continue
            chemin = os.path.join(dossier, n)
            try:
                with open(chemin, encoding="utf-8") as fic:
                    j = json.load(fic)
            except (OSError, ValueError):
                continue
            liste = j if isinstance(j, list) else [j]
            for m in liste:
                if isinstance(m, dict) and m.get("_format") == FORMAT:
                    entrees.append({"fichier": os.path.relpath(chemin, sortie), "nom": m.get("nom"),
                                    "createur": m.get("createur"), "source": m.get("source", {}).get("nature"),
                                    "id_mii": m.get("technique", {}).get("id_mii"),
                                    "description": m.get("description")})
    ecrire_json(os.path.join(sortie, "index.json"), {"_format": FORMAT + "-index", "mii": entrees})
    return len(entrees)

def relatif(chemin):
    try:
        r = os.path.relpath(chemin, RACINE)
        return chemin if r.startswith("..") else r
    except ValueError:
        return chemin

def mii_essai(alea=None):
    if alea is None:
        f = dict(version=3, allowCopying=True, profanityFlag=False, regionLock=3, characterSet=0, pageIndex=2,
                 slotIndex=5, unknown1=0, deviceOrigin=3, gender=1, birthMonth=11, birthDay=23, favoriteColor=6,
                 favorite=True, height=97, build=31, disableSharing=False, faceType=7, skinColor=4, wrinklesType=9,
                 makeupType=3, hairType=101, hairColor=6, flipHair=True, eyeType=41, eyeColor=4, eyeScale=5,
                 eyeVerticalStretch=2, eyeRotation=6, eyeSpacing=9, eyeYPosition=14, eyebrowType=17, eyebrowColor=2,
                 eyebrowScale=7, eyebrowVerticalStretch=5, eyebrowRotation=10, eyebrowSpacing=3, eyebrowYPosition=16,
                 noseType=13, noseScale=6, noseYPosition=4, mouthType=29, mouthColor=3, mouthScale=2,
                 mouthHorizontalStretch=5, mouthYPosition=17, mustacheType=4, unknown2=0, beardType=2,
                 facialHairColor=5, mustacheScale=7, mustacheYPosition=15, glassesType=6, glassesColor=3,
                 glassesScale=2, glassesYPosition=19, moleEnabled=True, moleScale=3, moleXPosition=14,
                 moleYPosition=27)
        f.update(systemId="a1b2c3d4e5f60718", consoleMAC="0123456789ab", miiName="Essai Ça", creatorName="Atelier",
                 normalMii=True, dsMii=False, nonUserMii=False, isValid=True, creationTime=231_234_567)
        return f
    f = {}
    for nom, *_, mini, maxi in CHAMPS:
        v = 3 if nom == "version" else alea.randint(mini, maxi)
        f[nom] = bool(v) if nom in BOOLEENS else v
    lettres = "abcdefghijklmnopqrstuvwxyzéèçàùÉ ÀÔ日本語한국어"
    f.update(systemId=alea.randbytes(8).hex(), consoleMAC=alea.randbytes(6).hex(),
             miiName="".join(alea.choice(lettres) for _ in range(alea.randint(1, 10))),
             creatorName="".join(alea.choice(lettres) for _ in range(alea.randint(0, 10))),
             normalMii=bool(alea.getrandbits(1)), dsMii=bool(alea.getrandbits(1)),
             nonUserMii=bool(alea.getrandbits(1)), isValid=bool(alea.getrandbits(1)),
             creationTime=alea.getrandbits(28))
    return f

def _image_qr(contenu, module, logo=True):
    import numpy as np, cv2, qrcode, qrcode.util
    qr = qrcode.QRCode(version=10, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=1, border=4)
    qr.add_data(qrcode.util.QRData(contenu, mode=qrcode.util.MODE_8BIT_BYTE))
    qr.make(fit=False)
    m = np.array(qr.get_matrix(), dtype=np.uint8)
    img = np.where(m, 0, 255).astype(np.uint8)
    img = cv2.resize(img, None, fx=module, fy=module, interpolation=cv2.INTER_NEAREST)
    if logo:
        h = img.shape[0]
        c, lx, ly = h // 2, 11 * module, 7 * module
        img[c - ly:c + ly, c - lx:c + lx] = 255
        cv2.putText(img, "Mii", (c - lx + 2 * module, c + ly - 3 * module), cv2.FONT_HERSHEY_SIMPLEX,
                    module * 0.75, 0, max(2, module), cv2.LINE_AA)
        cv2.rectangle(img, (0, 0), (h - 1, h - 1), 0, max(1, module // 2))
    return img

def essai(dossier):
    import numpy as np, cv2
    os.makedirs(dossier, exist_ok=True)
    echecs = []

    def verifier(etiquette, attendu, lu):
        differences = [k for k in attendu if attendu[k] != lu.get(k)]
        print(f"  {'OK ' if not differences else 'ÉCHEC'} {etiquette}" + (f" : {differences}" if differences else ""))
        if differences:
            echecs.append(etiquette)

    print("Tables :")
    for cle, pages in EDITEUR.items():
        valeurs = sorted(v for p in pages for v in p)
        mini, maxi = PLAGES[cle]
        manque = sorted(set(range(mini, maxi + 1)) - set(valeurs))
        ok = len(valeurs) == len(set(valeurs)) and not (set(valeurs) - set(range(mini, maxi + 1)))
        print(f"  {'OK ' if ok else 'ÉCHEC'} éditeur {cle} : {len(valeurs)} valeurs"
              + (f" (absentes de 3dbrew : {manque})" if manque else ""))
        if not ok:
            echecs.append(f"table {cle}")
    for nom, liste, n in (("coiffures", COIFFURES, 132), ("formes", FORMES, 12), ("traits", TRAITS, 12),
                          ("maquillages", MAQUILLAGES, 12), ("lunettes", LUNETTES, 9), ("moustaches", MOUSTACHES, 6),
                          ("barbes", BARBES, 6)):
        ok = len(liste) == n and all(len(e) == 2 for e in liste) if nom == "coiffures" else len(liste) == n
        print(f"  {'OK ' if ok else 'ÉCHEC'} {nom} : {len(liste)} / {n}")
        if not ok:
            echecs.append(nom)

    print("Aller-retour encoder → chiffrer → déchiffrer → décoder, 500 Mii tirés au hasard :")
    alea, mauvais = random.Random(2026), 0
    for _ in range(500):
        f = mii_essai(alea)
        d = encoder(f)
        q = chiffrer_qr(d)
        d2, mac = dechiffrer_qr(q)
        lu, _ = decoder(d2)
        if d2 != d or not mac or any(f[k] != lu[k] for k in f):
            mauvais += 1
    print(f"  {'OK ' if not mauvais else 'ÉCHEC'} {500 - mauvais} / 500")
    if mauvais:
        echecs.append("aller-retour")

    f = mii_essai()
    d = encoder(f)
    q = chiffrer_qr(d)
    print("Images de QR (Mii d'essai « Essai Ça ») :")
    propre = _image_qr(q, 4)
    chemins = {"propre": os.path.join(dossier, "essai-qr.png")}
    cv2.imwrite(chemins["propre"], propre)
    carte = np.full((176, 176, 3), 255, np.uint8)
    carte[26 - 8:140 + 8, 31 - 8:145 + 8] = cv2.cvtColor(_image_qr(q, 2), cv2.COLOR_GRAY2BGR)
    cv2.putText(carte, "Essai Ca", (52, 166), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (60, 60, 60), 1, cv2.LINE_AA)
    chemins["mii-maker"] = os.path.join(dossier, "HNI_0001.JPG")
    cv2.imwrite(chemins["mii-maker"], carte, [cv2.IMWRITE_JPEG_QUALITY, 80])
    abimee = cv2.resize(cv2.imread(chemins["mii-maker"]), None, fx=0.8, fy=0.8, interpolation=cv2.INTER_AREA)
    chemins["mii-maker abîmé"] = os.path.join(dossier, "HNI_0002.JPG")
    cv2.imwrite(chemins["mii-maker abîmé"], abimee, [cv2.IMWRITE_JPEG_QUALITY, 45])
    grand = cv2.cvtColor(_image_qr(q, 9), cv2.COLOR_GRAY2BGR)
    s = grand.shape[0]
    src = np.float32([[0, 0], [s, 0], [s, s], [0, s]])
    dst = np.float32([[90, 60], [s + 40, 110], [s + 10, s + 150], [50, s + 90]])
    photo = cv2.warpPerspective(grand, cv2.getPerspectiveTransform(src, dst), (s + 160, s + 220),
                                borderValue=(70, 60, 80))
    photo = cv2.GaussianBlur(photo, (5, 5), 1.6)
    xx = np.mgrid[0:photo.shape[0], 0:photo.shape[1]][1]
    lumiere = (0.65 + 0.35 * xx / photo.shape[1])[..., None]
    bruit = np.random.default_rng(7).normal(0, 9, photo.shape)
    photo = np.clip(photo * lumiere + bruit, 0, 255).astype(np.uint8)
    chemins["photo"] = os.path.join(dossier, "essai-photo.jpg")
    cv2.imwrite(chemins["photo"], photo, [cv2.IMWRITE_JPEG_QUALITY, 60])
    for nom, chemin in chemins.items():
        try:
            lus = lire_entree(chemin, os.path.basename(chemin), lambda *a, **k: None)
            octets, _, source, controle = lus[0]
            lu, _ = decoder(octets)
            verifier(f"{nom} ({os.path.basename(chemin)}, {source['lecteur']}, MAC {controle['mac_qr']})", f, lu)
        except Illisible as e:
            print(f"  ÉCHEC {nom} : {e}")
            echecs.append(nom)
    pieges = {"sans QR": np.full((240, 320, 3), 128, np.uint8),
              "QR d'adresse": _image_qr(b"https://example.org/fichier.cia", 4, logo=False),
              "QR de 0x70 octets quelconques": _image_qr(random.Random(5).randbytes(TAILLE_QR), 4, logo=False)}
    for n, (nom, image) in enumerate(pieges.items(), 1):
        chemin = os.path.join(dossier, f"piege-{n}.png")
        cv2.imwrite(chemin, image)
        try:
            lire_entree(chemin, os.path.basename(chemin), lambda *a, **k: None)
            print(f"  ÉCHEC {nom} : un Mii a été inventé")
            echecs.append(nom)
        except Illisible as e:
            print(f"  OK  {nom} refusé : {e}")

    print("Fichiers bruts et base CFL_DB.dat synthétique :")
    brut = os.path.join(dossier, "essai.bin")
    with open(brut, "wb") as fic:
        fic.write(q)
    lu, _ = decoder(lire_entree(brut, "essai.bin", lambda *a, **k: None)[0][0])
    verifier("contenu de QR brut (0x70 octets)", f, lu)
    db = bytearray(SUITE + SUITE_NB * SUITE_TAILLE)
    db[0:8] = b"CFOG" + bytes.fromhex("00000100")
    autres = [encoder(mii_essai(alea)) for _ in range(3)]
    for i, m in ((0, d), (7, autres[0]), (99, autres[1])):
        db[CFL_TETE + i * CFL_MII:CFL_TETE + (i + 1) * CFL_MII] = m[:TAILLE_COEUR]
    db[0x23F8:0x2400] = b"CFHE\xff\xff\xff\xff"
    db[CFL_CRC1:CFL_CRC1 + 2] = crc16(db[:CFL_CRC1]).to_bytes(2, "big")
    db[CFRA:CFRA + 8] = b"CFRA" + (1).to_bytes(4, "little")
    db[CFRA_MII:CFRA_MII + CFRA_TAILLE] = autres[2][:CFRA_TAILLE]
    db[CFRA_CRC:CFRA_CRC + 2] = crc16(db[CFRA:CFRA_CRC]).to_bytes(2, "big")
    db[SUITE + 5 * SUITE_TAILLE:SUITE + 5 * SUITE_TAILLE + TAILLE_SANS_AUTEUR] = autres[0][:TAILLE_SANS_AUTEUR]
    chemin_db = os.path.join(dossier, "CFL_DB.dat")
    with open(chemin_db, "wb") as fic:
        fic.write(db)
    notes = []
    lus = lire_entree(chemin_db, "CFL_DB.dat", lambda m, info=False: notes.append(m))
    groupes = [(g, ctx["entree"]) for _, g, ctx, _ in lus]
    attendu = [("cfl_db", 0), ("cfl_db", 7), ("cfl_db", 99), ("autres", 0), ("autres", 5)]
    ok = groupes == attendu and decoder(lus[0][0])[0]["miiName"] == f["miiName"] and all("bon" in n for n in notes)
    print(f"  {'OK ' if ok else 'ÉCHEC'} CFL_DB.dat : {groupes} ; {notes}")
    if not ok:
        echecs.append("CFL_DB.dat")
    try:
        sys.path.insert(0, DOSSIER_OUTIL)
        from badges_essai import diff as fabriquer_diff
        chemin_diff = os.path.join(dossier, "00000003")
        with open(chemin_diff, "wb") as fic:
            fic.write(fabriquer_diff(bytes(db), False, random.Random(3), 0x1234))
        notes = []
        lus = lire_entree(chemin_diff, "00000003", lambda m, info=False: notes.append(m))
        ok = [(g, ctx["entree"]) for _, g, ctx, _ in lus] == attendu
        print(f"  {'OK ' if ok else 'ÉCHEC'} CFL_DB.dat en conteneur DIFF : {len(lus)} Mii ; {notes}")
        if not ok:
            echecs.append("DIFF")
    except ImportError as e:
        print(f"  SAUTÉ conteneur DIFF : {e}")
    except Exception as e:
        print(f"  ÉCHEC conteneur DIFF : {type(e).__name__} : {e}")
        echecs.append("DIFF")
    enfoui = os.path.join(dossier, "enfoui.bin")
    with open(enfoui, "wb") as fic:
        fic.write(os.urandom(5000) + d + os.urandom(3000) + autres[1] + os.urandom(100))
    lus = lire_entree(enfoui, "enfoui.bin", lambda *a, **k: None)
    ok = [x[0] for x in lus] == [d, autres[1]]
    print(f"  {'OK ' if ok else 'ÉCHEC'} fouille par CRC : {len(lus)} CFLStoreData retrouvés sur 2")
    if not ok:
        echecs.append("fouille")

    j = fiche(d, {"fichier": "essai-qr.png", "nature": "essai"}, {"mac_qr": "vérifiée"})
    ecrire_json(os.path.join(dossier, "Essai-Ça.json"), j)
    print(f"\nDescription : {j['description']}")
    print(f"Fichiers d'essai dans {dossier}")
    print("Résultat :", "tout est bon" if not echecs else f"{len(echecs)} échec(s) : {echecs}")
    return 0 if not echecs else 1

def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0], epilog=__doc__.split("\n\n", 1)[1],
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("entrees", nargs="*", metavar="ENTRÉE",
                   help="image de QR code, CFL_DB.dat, fichier brut .bin/.cfsd/.cfcd, dossier, ou octets hex/base64")
    p.add_argument("--sortie", default=SORTIE, help=f"dossier de sortie (défaut : {relatif(SORTIE)})")
    p.add_argument("--afficher", action="store_true", help="affiche aussi le JSON de chaque Mii lu")
    p.add_argument("--essai", nargs="?", const="", metavar="DOSSIER",
                   help="fabrique des QR d'essai, les relit et compare (défaut : dossier temporaire)")
    p.add_argument("--palettes", action="store_true",
                   help="affiche les palettes officielles en JSON et les écrit dans SORTIE/palettes.json")
    args = p.parse_args()

    if args.palettes:
        print(json.dumps({"_doc": DOC_PALETTES, **PALETTES}, ensure_ascii=False, indent=1))
        ecrire_json(os.path.join(os.path.abspath(args.sortie), "palettes.json"), {"_doc": DOC_PALETTES, **PALETTES})
        print(f"→ {relatif(os.path.join(os.path.abspath(args.sortie), 'palettes.json'))}", file=sys.stderr)
        return 0
    if args.essai is not None:
        return essai(args.essai or tempfile.mkdtemp(prefix="mii-essai-"))
    if not args.entrees:
        p.print_usage(sys.stderr)
        print("mii.py : donnez au moins une ENTRÉE (ou --essai, --palettes).", file=sys.stderr)
        return 2

    sortie = os.path.abspath(args.sortie)
    lus, sans_qr, sans_mii, illisibles, notes = [], [], [], [], []
    a_lire = []         
    for entree in args.entrees:
        if not os.path.exists(entree):
            texte = _octets_du_texte(entree)
            if texte is None:
                illisibles.append((entree, "ni un fichier, ni un dossier, ni des octets en hexadécimal ou base64"))
                continue
            try:
                lus += lire_octets(texte[0], f"argument ({texte[1]})", lambda m, info=False: notes.append(m))
            except Exception as e:
                illisibles.append((entree[:40], str(e) if isinstance(e, Illisible)
                                   else f"erreur imprévue de l'outil ({type(e).__name__} : {e})"))
            continue
        a_lire += [(chemin, os.path.isdir(entree)) for chemin in fichiers([entree])]

    nb_images, vues = sum(c.lower().endswith(EXTENSIONS_IMAGE) for c, _ in a_lire), 0
    for chemin, de_dossier in a_lire:
        rel = relatif(chemin)
        if chemin.lower().endswith(EXTENSIONS_IMAGE):
            vues += 1
            if nb_images >= 20 and vues % 10 == 0:
                print(f"… {vues}/{nb_images} images regardées", file=sys.stderr, flush=True)
        avert = lambda m, info=False, rel=rel: notes.append(f"{rel} : {m}")
        try:
            lus += lire_entree(chemin, rel, avert)
        except SansQR as e:
            sans_qr.append((rel, str(e)))
        except SansMii as e:
            (sans_mii if de_dossier else illisibles).append((rel, str(e)))
        except Illisible as e:
            illisibles.append((rel, str(e)))
        except OSError as e:
            illisibles.append((rel, f"lecture impossible ({e.strerror or e})"))
        except Exception as e:      
            illisibles.append((rel, f"erreur imprévue de l'outil ({type(e).__name__} : {e}), fichier ignoré"))

    pris, autres, ecrits, vus = {}, [], {}, set()
    for octets, groupe, source, controle in lus:
        try:
            j = fiche(octets, source, controle, complete=groupe != "autres")
        except Exception as e:
            illisibles.append((source.get("fichier"), str(e) if isinstance(e, Illisible)
                               else f"erreur imprévue de l'outil ({type(e).__name__} : {e})"))
            continue
        if args.afficher:
            print(json.dumps(j, ensure_ascii=False, indent=1))
        if groupe == "autres":
            cle = j.get("donnees_partielles_hex") or j.get("donnees_3ds", {}).get("hex")
            if cle not in vus:
                vus.add(cle)
                autres.append(j)
            continue
        dossier = sortie if groupe == "principal" else os.path.join(sortie, "cfl_db")
        identite = (j["technique"]["id_mii"], j["technique"]["id_systeme"])
        chemin = chemin_pour(dossier, nom_de_fichier(j["nom"], "mii-" + j["technique"]["id_mii"]), identite, pris)
        if chemin in ecrits:
            avant = ecrits[chemin]["source"].get("fichier")
            if ecrits[chemin].get("donnees_3ds") == j.get("donnees_3ds"):
                notes.append(f"{relatif(chemin)} : même Mii, identique, relu dans {source.get('fichier')} : gardé une fois")
            else:
                notes.append(f"{relatif(chemin)} : même Mii (même Mii ID) mais retouché entre {avant} et "
                             f"{source.get('fichier')} : la version lue en dernier ({source.get('fichier')}) est gardée ; "
                             "pour l'autre, relancer sur ce seul fichier avec --sortie ailleurs")
        ecrire_json(chemin, j)
        ecrits[chemin] = j
    if autres:
        ecrire_json(os.path.join(sortie, "cfl_db", "autres.json"), autres)
    if ecrits or autres:
        ecrire_json(os.path.join(sortie, "palettes.json"), {"_doc": DOC_PALETTES, **PALETTES})
        total = ecrire_index(sortie)

    for chemin, j in ecrits.items():
        c = j["controle"]
        etat = ", ".join(x for x in (f"MAC {c['mac_qr']}" if "mac_qr" in c else "", f"CRC {c.get('crc')}",
                                     c.get("supplement", "")) if x)
        ou = j["source"]
        lieu = (ou.get("fichier") or "") + (f", entrée {ou['entree']}" if "entree" in ou else "")
        if ou.get("mii_personnel_probable"):
            lieu += " (première entrée : le Mii personnel, d'après 3dbrew)"
        print(f"Mii « {j['nom']} » ({ou.get('nature')}, {etat})\n  ← {lieu}\n  → {relatif(chemin)}\n"
              f"  {j['description']}")
        for a in c["anomalies"]:
            print(f"  attention : {a}")
    if autres:
        print(f"{len(autres)} autre(s) Mii de CFL_DB.dat (invitations, rencontres) → "
              f"{relatif(os.path.join(sortie, 'cfl_db', 'autres.json'))}")
    for n in notes:
        print(f"note : {n}")
    if sans_qr:
        noms = ", ".join(r for r, _ in sans_qr[:10]) + (" …" if len(sans_qr) > 10 else "")
        print(f"{len(sans_qr)} image(s) sans QR code lisible : {noms}")
    if sans_mii:
        noms = ", ".join(r for r, _ in sans_mii[:10]) + (" …" if len(sans_mii) > 10 else "")
        print(f"{len(sans_mii)} autre(s) fichier(s) fouillé(s), sans Mii : {noms}")
    for r, raison in illisibles:
        print(f"non lu : {r} : {raison}")
    if not ecrits and not autres:
        sys.stdout.flush()
        print("Aucun Mii lu.", file=sys.stderr)
        return 1
    print(f"{len(ecrits)} fichier(s) écrit(s) ; index : {relatif(os.path.join(sortie, 'index.json'))} ({total} Mii)")
    return 0

if __name__ == "__main__":
    _relancer_dans_le_venv()
    sys.exit(main())
