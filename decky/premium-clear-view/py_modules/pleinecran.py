import os, subprocess

APPIDS = {2232529458: "youtube-music-desktop-app"}   
AFFICHAGES = (":0", ":1")

def _dehors(affichage, *args):
    env = {**os.environ, "DISPLAY": affichage, "LD_LIBRARY_PATH": ""}
    try:
        return subprocess.run(args, env=env, capture_output=True, text=True, timeout=2).stdout
    except Exception:
        return ""

def _large(fid, affichage):
    for ligne in _dehors(affichage, "xdotool", "getwindowgeometry", "--shell", fid).splitlines():
        if ligne.startswith("WIDTH="):
            return int(ligne[6:] or 0) > 200
    return False

def corriger(appid):
    classe = APPIDS.get(int(appid) if appid else 0)
    if not classe:
        return False
    for affichage in AFFICHAGES:
        for fid in _dehors(affichage, "xdotool", "search", "--class", classe).split():
            if not _large(fid, affichage):
                continue
            if "FULLSCREEN" not in _dehors(affichage, "xprop", "-id", fid, "_NET_WM_STATE"):
                _dehors(affichage, "wmctrl", "-i", "-r", fid, "-b", "add,fullscreen")
    return True
