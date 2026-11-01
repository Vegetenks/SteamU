import os
import pathlib
import stat

def environnement():
    env = {**os.environ, "DISPLAY": ":0", "LD_LIBRARY_PATH": ""}
    for processus in pathlib.Path("/proc").iterdir():
        if not processus.name.isdecimal():
            continue
        try:
            if (processus / "comm").read_text().strip() != "steam":
                continue
            uid = processus.stat().st_uid
            if not uid:
                continue
            variables = dict(v.split("=", 1) for v in (processus / "environ").read_bytes().decode(errors="replace").split("\0") if "=" in v)
            if "gamescope" in variables.get("XDG_CURRENT_DESKTOP", "").lower() or variables.get("GAMESCOPE_WAYLAND_DISPLAY"):
                return env
            candidats = [pathlib.Path(variables["XAUTHORITY"])] if variables.get("XAUTHORITY", "").startswith("/") else []
            candidats += sorted(pathlib.Path(f"/run/user/{uid}").glob("xauth_*"))
            for fichier in candidats:
                try:
                    infos = fichier.lstat()
                except OSError:
                    continue
                if stat.S_ISREG(infos.st_mode) and infos.st_uid == uid:
                    env["XAUTHORITY"] = str(fichier)
                    break
            if variables.get("DISPLAY"):
                env["DISPLAY"] = variables["DISPLAY"]
            return env
        except (OSError, ValueError):
            continue
    return env
