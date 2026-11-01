import argparse
import hashlib
import json
import pathlib
import re
import zipfile

def verifier(dossier):
    dossier = pathlib.Path(dossier)
    try:
        plugin = json.loads((dossier / "plugin.json").read_text(encoding="utf-8"))
        paquet = json.loads((dossier / "package.json").read_text(encoding="utf-8"))
        if not isinstance(plugin, dict) or not isinstance(paquet, dict): raise ValueError("Descriptions JSON invalides")
        entree = (dossier / "dist/index.js").read_bytes()
        if not (dossier / "main.py").is_file(): raise ValueError("main.py absent")
    except (OSError, ValueError) as e:
        raise ValueError("Paquet incomplet : plugin.json, package.json, main.py et dist/index.js sont requis") from e
    nom = plugin.get("name")
    if not isinstance(nom, str) or not nom.strip() or any(c in nom for c in "/\\"):
        raise ValueError("plugin.json : name invalide")
    if paquet.get("type") != "module" or not re.search(rb"\bexport\s+default\b", entree):
        raise ValueError("dist/index.js doit être un module JavaScript avec un export default (package.json : type module)")
    return {"nom": nom, "dossier": dossier.name, "taille_js": len(entree), "sha256_js": hashlib.sha256(entree).hexdigest()}

def archiver(dossier, cible):
    dossier, cible = pathlib.Path(dossier).resolve(), pathlib.Path(cible).resolve()
    verifier(dossier)
    if cible.is_relative_to(dossier): raise ValueError("L'archive doit être placée hors du dossier du greffon")
    with zipfile.ZipFile(cible, "w", zipfile.ZIP_DEFLATED) as archive:
        for fichier in sorted(dossier.rglob("*")):
            if fichier.is_symlink(): raise ValueError("Lien symbolique refusé dans le paquet")
            if fichier.is_file() and "__pycache__" not in fichier.parts and fichier.suffix != ".pyc":
                archive.write(fichier, fichier.relative_to(dossier.parent))

if __name__ == "__main__":
    arguments = argparse.ArgumentParser(description=__doc__)
    arguments.add_argument("--archive", type=pathlib.Path, help="Créer un ZIP installable après vérification")
    options = arguments.parse_args()
    dossier = pathlib.Path(__file__).resolve().parent.parent
    try:
        resultat = verifier(dossier)
        if options.archive: archiver(dossier, options.archive)
    except ValueError as e:
        arguments.exit(1, str(e) + "\n")
    print(json.dumps(resultat, ensure_ascii=False))
