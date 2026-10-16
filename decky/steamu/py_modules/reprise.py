import json, pathlib, shutil, time

MARQUE = "reprise-ancien.json"

def _vide(d):
    return not d.exists() or (d.is_dir() and not d.is_symlink() and not any(d.iterdir()))

def reprendre(decky_home, ancien, neuf, journal=print):
    base = pathlib.Path(decky_home)
    marque = base / "settings" / neuf / MARQUE
    if marque.exists(): return []
    copies = []
    for genre in ("settings", "data", "logs"):
        vieux, nouveau = base / genre / ancien, base / genre / neuf
        if not vieux.is_dir(): continue
        try:
            if genre == "logs":   
                nouveau.mkdir(parents=True, exist_ok=True)
                n = 0
                for f in vieux.iterdir():
                    if f.is_file() and not (nouveau / f.name).exists(): shutil.copy2(f, nouveau / f.name); n += 1
                if n: copies.append(f"{vieux} -> {nouveau} ({n} journaux)")
                continue
            if not _vide(nouveau):
                journal(f"reprise : {nouveau} déjà rempli, l'ancien {vieux} n'y est pas recopié"); continue
            tmp = nouveau.with_name(nouveau.name + ".reprise")
            if tmp.exists(): shutil.rmtree(tmp)   
            shutil.copytree(vieux, tmp, symlinks=True)
            if nouveau.exists(): nouveau.rmdir()
            tmp.rename(nouveau)
            n = sum(1 for _ in nouveau.rglob("*"))
            copies.append(f"{vieux} -> {nouveau} ({n} éléments)")
        except Exception as e:
            journal(f"reprise : copie de {vieux} manquée ({type(e).__name__} : {e}) ; l'ancien dossier est intact")
            return copies   
    for c in copies: journal("reprise de l'ancien greffon : " + c)
    if any((base / g / ancien).is_dir() for g in ("settings", "data", "logs")):
        marque.parent.mkdir(parents=True, exist_ok=True)
        marque.write_text(json.dumps({"date": time.strftime("%Y-%m-%d %H:%M:%S"), "depuis": ancien, "copies": copies}, ensure_ascii=False))
    return copies
