import json, os, re

AIDES = ("SkeletonScalingExtensions.js", "ModelScaleDesc.js", "BodyUtilities.js")
SOURCES = "ressources-privees/mii/sources/ffl.js-2.2.2/helpers/"
ENTETE = ("Aides de FFL.js v2.2.2 pour le corps des Mii (AGPL-3.0-only, Arian Kordi) converties en script classique par\n"
          "// outils/vrais_mii_vendor.py. PRIVÉ : ressources-privees/ seulement.")

def convertir(src):
    def imp(m):
        noms, origine = m.group(1), m.group(2)
        espace = "window.THREE" if origine == "three" else "window.__pcvESM"
        if m.group(0).lstrip().startswith("import * as"):
            return f"const {noms} = {espace};"
        noms = re.sub(r"\s+as\s+", ": ", noms.strip().strip("{}"))
        return f"const {{{noms}}} = {espace};"
    src = re.sub(r"^import\s+\*\s+as\s+(\w+)\s+from\s+'([^']+)';", imp, src, flags=re.M)
    src = re.sub(r"^import\s+(\{[^}]*\})\s+from\s+'([^']+)';", imp, src, flags=re.M | re.S)
    exports = []

    def exp_bloc(m):
        for n in re.sub(r"/\*.*?\*/|//[^\n]*", "", m.group(1), flags=re.S).split(","):
            n = n.strip()
            if n:
                exports.append(tuple(x.strip() for x in n.split(" as ")) if " as " in n else (n, n))
        return ""
    src = re.sub(r"^export\s*\{([^}]*)\};?", exp_bloc, src, flags=re.M | re.S)

    def exp_decl(m):
        exports.append((m.group(2), m.group(2)))
        return m.group(1)
    src = re.sub(r"^export\s+((?:async\s+)?(?:function\*?|class|const|let)\s+(\w+))", exp_decl, src, flags=re.M)
    src = re.sub(r"^export\s+default\s+(\w+);", lambda m: exports.append((m.group(1), m.group(1))) or "", src, flags=re.M)
    reste = [l for l in src.split("\n") if re.match(r"^\s*(import|export)\s", l)]
    if reste:
        raise ValueError("import/export non converti")
    fin = "\n".join(f"window.__pcvESM.{b} = {a};" for a, b in exports)
    return "(() => {\nwindow.__pcvESM ||= {};\n" + src + "\n" + fin + "\n})();\n"

def aides(textes):
    sources = [SOURCES + n for n in AIDES]
    corps = "".join(f"// ---- {n} ----\n" + convertir(textes[n]) for n in AIDES)
    return (f"// {ENTETE}\n// Généré, ne pas modifier à la main. Sources : " + ", ".join(sources) + "\n" + corps).encode()

def invites(cpp):
    corps = cpp[cpp.index("MII_DATA_CORE_RFL[6]"):]
    corps = corps[corps.index("{") + 1:corps.index("};")]
    entrees, prof, cour = [], 0, ""
    for c in corps:
        if c == "{":
            prof += 1
            if prof == 1:
                cour = ""; continue
        elif c == "}":
            prof -= 1
            if prof == 0:
                entrees.append(cour); continue
        if prof >= 1:
            cour += c
    sortie = []
    for e in entrees[:6]:
        nom = "".join(re.findall(r"L'(.)'", e))
        nombres = [int(x, 0) for x in re.findall(r"\b(0x[0-9A-Fa-f]+|\d+)\b", re.sub(r"L'.'", "", e))]
        drapeaux, taille, carrure, ident, reste = nombres[0], nombres[1], nombres[2], nombres[3:11], nombres[11:]
        if len(reste) != 11: raise ValueError("Mii invité illisible")
        d = drapeaux.to_bytes(2, "big") + nom.encode("utf-16-be").ljust(20, b"\0") + bytes([taille, carrure]) + bytes(ident)
        d += b"".join(x.to_bytes(2, "big") for x in reste) + bytes(20)
        if len(d) != 74: raise ValueError("Mii invité illisible")
        sortie.append(d.hex())
    if len(sortie) != 6: raise ValueError("Mii invités incomplets")
    return json.dumps({"_doc": "les 6 Mii invités de la Wii U (FFLiDatabaseDefault.cpp de la décompilation de FFL), "
                       "au format RFLCharData (74 octets, hexadécimal) ; généré par outils/vrais_mii_vendor.py",
                       "invites": [{"nom": "Invité " + "ABCDEF"[i], "donnees": h} for i, h in enumerate(sortie)]},
                      ensure_ascii=False, indent=1).encode()
