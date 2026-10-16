import hashlib, json, struct, sys, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
NS = "{http://www.collada.org/2005/11/COLLADASchema}"
FLOAT, USHORT = 5126, 5123
ENVELOPPE = {"WRAP": 10497, "MIRROR": 33648, "CLAMP": 33071}

def main(ARCHIVE, SORTIE):
    ARCHIVE, SORTIE = Path(ARCHIVE), Path(SORTIE)
    z = zipfile.ZipFile(ARCHIVE)
    dae = ET.fromstring(z.read("CcObD.dae"))
    qa = lambda e, chemin: e.findall("/".join(NS + p for p in chemin.split("/")))

    images = {i.get("id"): i.find(NS + "init_from").text.lstrip("./") for i in qa(dae, "library_images/image")}
    effets = {}
    for ef in qa(dae, "library_effects/effect"):
        surf = samp = None
        for np_ in ef.iter(NS + "newparam"):
            if np_.find(NS + "surface") is not None:
                surf = np_.find(NS + "surface/" + NS + "init_from").text
            if np_.find(NS + "sampler2D") is not None:
                s = np_.find(NS + "sampler2D")
                samp = (s.find(NS + "wrap_s").text, s.find(NS + "wrap_t").text)
        effets[ef.get("id")] = (images[surf], samp)
    materiaux_dae = {m.get("id"): effets[m.find(NS + "instance_effect").get("url")[1:]] for m in qa(dae, "library_materials/material")}

    binaire, vues, accesseurs = bytearray(), [], []

    def vue(octets, cible=None):
        while len(binaire) % 4:
            binaire.append(0)
        v = {"buffer": 0, "byteOffset": len(binaire), "byteLength": len(octets)}
        if cible:
            v["target"] = cible
        binaire.extend(octets)
        vues.append(v)
        return len(vues) - 1

    def accesseur(plat, n, type_, comp, cible=None, bornes=None):
        fmt = "f" if comp == FLOAT else "H"
        a = {"bufferView": vue(struct.pack("<%d%s" % (len(plat), fmt), *plat), cible), "componentType": comp, "count": n, "type": type_}
        if bornes:
            a["min"], a["max"] = bornes
        accesseurs.append(a)
        return len(accesseurs) - 1

    geos = {g.get("id"): g for g in qa(dae, "library_geometries/geometry")}
    gltf_images, textures, echant, materiaux, maillages, noeuds = [], [], [], [], [], []
    mat_index, img_index = {}, {}
    for noeud in qa(dae, "library_visual_scenes/visual_scene/node"):
        ig = noeud.find(NS + "instance_geometry")
        g = geos[ig.get("url")[1:]]
        cible_mat = ig.find(".//" + NS + "instance_material").get("target")[1:]
        mesh = g.find(NS + "mesh")
        sources = {s.get("id"): [float(x) for x in s.find(NS + "float_array").text.split()] for s in mesh.findall(NS + "source")}
        sommets = mesh.find(NS + "vertices")
        tri = mesh.find(NS + "triangles")
        entrees = {}
        for i in list(sommets.findall(NS + "input")) + list(tri.findall(NS + "input")):
            if i.get("semantic") != "VERTEX":
                entrees[i.get("semantic")] = sources[i.get("source")[1:]]
        idx = [int(x) for x in tri.find(NS + "p").text.split()]   
        pos = entrees["POSITION"]
        n = len(pos) // 3
        attributs = {"POSITION": accesseur(pos, n, "VEC3", FLOAT, 34962,
                                           ([min(pos[i::3]) for i in range(3)], [max(pos[i::3]) for i in range(3)]))}
        if "NORMAL" in entrees:
            attributs["NORMAL"] = accesseur(entrees["NORMAL"], n, "VEC3", FLOAT, 34962)
        uv = entrees["TEXCOORD"]
        attributs["TEXCOORD_0"] = accesseur([v if i % 2 == 0 else 1 - v for i, v in enumerate(uv)], n, "VEC2", FLOAT, 34962)
        if "COLOR" in entrees:
            attributs["COLOR_0"] = accesseur(entrees["COLOR"], n, "VEC4", FLOAT, 34962)
        if cible_mat not in mat_index:
            png, (ws, wt) = materiaux_dae[cible_mat]
            if png not in img_index:
                gltf_images.append({"bufferView": vue(z.read(png)), "mimeType": "image/png", "name": png})
                img_index[png] = len(gltf_images) - 1
            echant.append({"magFilter": 9729, "minFilter": 9987, "wrapS": ENVELOPPE[ws], "wrapT": ENVELOPPE[wt]})
            textures.append({"source": img_index[png], "sampler": len(echant) - 1})
            materiaux.append({"name": cible_mat.replace("_id", ""), "pbrMetallicRoughness": {"baseColorTexture": {"index": len(textures) - 1},
                              "metallicFactor": 0, "roughnessFactor": 1}, "extensions": {"KHR_materials_unlit": {}}, "doubleSided": True})
            mat_index[cible_mat] = len(materiaux) - 1
        prim = {"attributes": attributs, "indices": accesseur(idx, len(idx), "SCALAR", USHORT, 34963), "material": mat_index[cible_mat]}
        nom = noeud.get("name") + ("_Logo" if noeud.get("id") == "PgFlame_id2" else "")
        maillages.append({"name": nom, "primitives": [prim]})
        noeuds.append({"name": nom, "mesh": len(maillages) - 1})
        print("  ", nom, len(idx) // 3, "triangles,", materiaux_dae[cible_mat][0], materiaux_dae[cible_mat][1], "couleurs" if "COLOR" in entrees else "")

    gltf = {"asset": {"version": "2.0", "generator": "outils/badge-arcade/convertir.py"},
            "extensionsUsed": ["KHR_materials_unlit"],
            "scene": 0, "scenes": [{"name": "Machine du hall (Badge Arcade)", "nodes": list(range(len(noeuds)))}],
            "nodes": noeuds, "meshes": maillages, "materials": materiaux, "textures": textures, "images": gltf_images,
            "samplers": echant, "accessors": accesseurs, "bufferViews": vues, "buffers": [{"byteLength": len(binaire)}]}
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * (-len(js) % 4)
    while len(binaire) % 4:
        binaire.append(0)
    glb = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(binaire)) + struct.pack("<II", len(js), 0x4E4F534A) + js \
        + struct.pack("<II", len(binaire), 0x004E4942) + bytes(binaire)
    SORTIE.write_bytes(glb)
    print(SORTIE, len(glb), "octets, sha256", hashlib.sha256(glb).hexdigest())

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
