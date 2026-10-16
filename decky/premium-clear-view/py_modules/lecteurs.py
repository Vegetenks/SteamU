import base64, hashlib, os, pathlib, re, struct, subprocess, urllib.parse, urllib.request
from jeepney import DBusAddress, new_method_call, Properties
from jeepney.bus_messages import message_bus
from jeepney.io.blocking import open_dbus_connection

CHEMIN, LECTEUR, RACINE = "/org/mpris/MediaPlayer2", "org.mpris.MediaPlayer2.Player", "org.mpris.MediaPlayer2"
POCHETTE_MAX = 2 * 1024 * 1024
DELAI_RESEAU = 3             
DELAI_FFMPEG = 3             
_pochettes = {}   
_sandbox_pid = {} 
_ID_YOUTUBE = re.compile(r"(?:music\.)?youtube\.com/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})")
_YOUTUBE_IMG = "https://i.ytimg.com/vi/{}/hqdefault.jpg"
_SPOTIFY_VIEUX = "https://open.spotify.com/image/"
_SPOTIFY_CDN = "https://i.scdn.co/image/"
_VIDEO_SUR = re.compile(r"(?i)twitch\.tv|netflix\.com|primevideo\.com|disneyplus\.com|dailymotion\.com")   
_YOUTUBE_VU = re.compile(r"(?i)(?<!music\.)youtube\.com/watch")       
_YOUTUBE_MUSIQUE = re.compile(r"(?i)music\.youtube\.com/watch")
_IDENTITE_MUSIQUE = ("spotify", "deezer", "tidal", "plexamp", "music", "radio", "audacious", "rhythmbox",
                     "clementine", "strawberry", "lollypop", "amberol", "elisa", "tauon", "nuclear", "cider")
_IDENTITE_BIBLIOTHEQUE = ("jellyfin", "kodi", "plex", "netflix")
DUREE_FILM_S = 20 * 60   

def _bus():
    return open_dbus_connection(bus=f"unix:path=/run/user/{os.getuid()}/bus", enable_fds=False)

def _valeur(v):
    return v[1] if isinstance(v, tuple) and len(v) == 2 and isinstance(v[0], str) else v

def _tout(con, nom, interface):
    r = con.send_and_get_reply(Properties(DBusAddress(CHEMIN, bus_name=nom, interface=interface)).get_all(), timeout=1)
    return {k: _valeur(v) for k, v in (r.body[0] if r.body else {}).items()}

def _pid(con, nom):
    try:
        return con.send_and_get_reply(message_bus.GetConnectionUnixProcessID(nom), timeout=1).body[0]
    except Exception:
        return None

def _jeu_steam(pid):
    for _ in range(12):
        if not pid or pid <= 1:
            return None
        try:
            env = pathlib.Path(f"/proc/{pid}/environ").read_bytes().split(b"\0")
            for e in env:
                if e.startswith(b"SteamGameId="):
                    return e.split(b"=", 1)[1].decode() or None
            pid = int(pathlib.Path(f"/proc/{pid}/stat").read_text().rsplit(")", 1)[1].split()[1])
        except Exception:
            return None
    return None

def _sorte_image(donnees):
    if not donnees:
        return None
    if donnees[:8] == b"\x89PNG\r\n\x1a\n": return "image/png"
    if donnees[:3] == b"\xff\xd8\xff": return "image/jpeg"
    if donnees[:4] == b"RIFF" and donnees[8:12] == b"WEBP": return "image/webp"
    if donnees[:6] in (b"GIF87a", b"GIF89a"): return "image/gif"
    return None

def _dimensions_image(donnees):
    if not donnees:
        return None
    try:
        if donnees[:8] == b"\x89PNG\r\n\x1a\n" and len(donnees) >= 24:
            return struct.unpack(">II", donnees[16:24])
        if donnees[:6] in (b"GIF87a", b"GIF89a") and len(donnees) >= 10:
            return struct.unpack("<HH", donnees[6:10])
        if donnees[:4] == b"RIFF" and donnees[8:12] == b"WEBP" and len(donnees) >= 16:
            if donnees[12:16] == b"VP8X" and len(donnees) >= 30:
                return (1 + int.from_bytes(donnees[24:27], "little"), 1 + int.from_bytes(donnees[27:30], "little"))
            if donnees[12:16] == b"VP8 " and len(donnees) >= 30:
                l, h = int.from_bytes(donnees[26:28], "little") & 0x3FFF, int.from_bytes(donnees[28:30], "little") & 0x3FFF
                return (l, h) if l and h else None
            if donnees[12:16] == b"VP8L" and len(donnees) >= 25:
                b0, b1, b2, b3 = donnees[21], donnees[22], donnees[23], donnees[24]
                return (1 + (((b1 & 0x3F) << 8) | b0), 1 + (((b3 & 0xF) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6)))
            return None
        if donnees[:3] == b"\xff\xd8\xff":   
            i, n = 2, len(donnees)
            while i + 9 < n and donnees[i] == 0xFF:
                m = donnees[i + 1]
                if m in (0xD8, 0xD9) or 0xD0 <= m <= 0xD7:
                    i += 2; continue
                taille = int.from_bytes(donnees[i + 2:i + 4], "big")
                if 0xC0 <= m <= 0xCF and m not in (0xC4, 0xC8, 0xCC):
                    h, l = int.from_bytes(donnees[i + 5:i + 7], "big"), int.from_bytes(donnees[i + 7:i + 9], "big")
                    return (l, h) if l and h else None
                i += 2 + taille
    except (struct.error, IndexError, ValueError):
        return None
    return None

def _comm(pid):
    try:
        return pathlib.Path(f"/proc/{pid}/comm").read_text().strip().lower()
    except OSError:
        return None

def _appli_depuis_nom(nom):
    reste = nom[len(RACINE) + 1:]
    reste = re.split(r"\.instance|[0-9]", reste, maxsplit=1)[0]
    mot = reste.rsplit(".", 1)[-1]
    return mot.lower() if mot else None

def _chemins_bac_a_sable(nom, pid, chemin):
    essayes, vus = [], []

    def ajoute(p):
        if p not in essayes:
            essayes.append(p); vus.append(f"/proc/{p}/root{chemin}")

    if pid:
        ajoute(pid)
    connu = _sandbox_pid.get(nom)
    if connu:
        ajoute(connu)
    appli = _appli_depuis_nom(nom)
    autres = [int(n) for n in os.listdir("/proc") if n.isdigit() and int(n) not in essayes]
    trouve_par_nom = False
    if appli:
        for p in autres:
            c = _comm(p)
            if c and (appli in c or c in appli):
                ajoute(p); trouve_par_nom = True
    if not trouve_par_nom:
        for p in autres:
            ajoute(p)
    return vus

def _chemin_reel(chemin, nom, pid):
    try:
        if pathlib.Path(chemin).is_file():
            return chemin
    except OSError:
        pass
    for f in _chemins_bac_a_sable(nom, pid, chemin):
        try:
            if pathlib.Path(f).is_file():
                m = re.match(r"/proc/(\d+)/root", f)
                if m:
                    _sandbox_pid[nom] = int(m.group(1))
                return f
        except OSError:
            continue
    return None

def _lire_image_locale(chemin, nom, pid):
    reel = _chemin_reel(chemin, nom, pid)
    if reel is None:
        return None
    try:
        p = pathlib.Path(reel)
        return p.read_bytes() if 0 < p.stat().st_size <= POCHETTE_MAX else None
    except OSError:
        return None

def _pochette_integree(chemin, nom, pid):
    reel = _chemin_reel(chemin, nom, pid)
    if reel is None:
        return None
    try:
        with open(reel, "rb") as f:
            tete = f.read(16)
    except OSError:
        return None
    try:
        from importer import _format_audio   
    except Exception:
        return None
    fmt = _format_audio(tete)
    if not fmt:
        return None
    args = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-protocol_whitelist", "file", "-f", fmt,
            "-i", "file:" + os.path.abspath(reel), "-map", "0:v:0?", "-frames:v", "1", "-c", "copy",
            "-f", "image2pipe", "pipe:1"]
    try:
        p = subprocess.run(args, stdin=subprocess.DEVNULL, capture_output=True, timeout=DELAI_FFMPEG,
                            env={**os.environ, "LD_LIBRARY_PATH": ""})
    except (OSError, subprocess.TimeoutExpired):
        return None
    donnees = p.stdout[:POCHETTE_MAX + 1]
    return donnees if p.returncode == 0 and 0 < len(donnees) <= POCHETTE_MAX else None

def _pochette(adresse, page, pid, nom):
    ident = _ID_YOUTUBE.search(page or "")
    if ident and (not adresse or urllib.parse.urlparse(adresse).scheme == "file"):
        adresse = _YOUTUBE_IMG.format(ident.group(1))
    elif adresse and adresse.startswith(_SPOTIFY_VIEUX):   
        adresse = _SPOTIFY_CDN + adresse[len(_SPOTIFY_VIEUX):]
    u_page = urllib.parse.urlparse(page or "")
    integree = not adresse and u_page.scheme == "file"   
    if not adresse and not integree:
        return None, None
    cible = adresse if adresse else page
    u = urllib.parse.urlparse(cible)
    if u.scheme == "data":
        cle = ("data", hashlib.sha1(cible.encode()).hexdigest())
    elif u.scheme == "file":   
        cle = cible
        try: cle = (cible, pathlib.Path(urllib.parse.unquote(u.path)).stat().st_mtime_ns)
        except OSError: pass
    else:
        cle = cible
    if integree:
        cle = ("integree",) + (cle if isinstance(cle, tuple) else (cle,))
    if cle in _pochettes:
        return _pochettes[cle]
    donnees = None
    try:
        if integree:
            donnees = _pochette_integree(urllib.parse.unquote(u.path), nom, pid)
        elif u.scheme == "file":
            donnees = _lire_image_locale(urllib.parse.unquote(u.path), nom, pid)
        elif u.scheme in ("http", "https", "data"):   
            with urllib.request.urlopen(cible, timeout=DELAI_RESEAU) as r:
                lu = r.read(POCHETTE_MAX + 1)
                if len(lu) <= POCHETTE_MAX:
                    donnees = lu
    except Exception:
        donnees = None
    sorte = _sorte_image(donnees)
    if sorte:
        _pochettes[cle] = (f"data:{sorte};base64," + base64.b64encode(donnees).decode(), _dimensions_image(donnees))
    else:
        _pochettes[cle] = (None, None)
    if len(_pochettes) > 40:
        _pochettes.pop(next(iter(_pochettes)))
    return _pochettes[cle]

def _video_probable(app, page, album, artiste, duree, dims):
    page = page or ""
    if _VIDEO_SUR.search(page):            
        return True
    if _YOUTUBE_MUSIQUE.search(page):      
        return False
    youtube_vu = bool(_YOUTUBE_VU.search(page))   
    app = (app or "").lower()
    if any(m in app for m in _IDENTITE_MUSIQUE):
        return False
    if any(v in app for v in _IDENTITE_BIBLIOTHEQUE):
        if album:
            return False
        if duree and duree > DUREE_FILM_S:
            return True
    if dims and dims[1] > 0:
        rapport = dims[0] / dims[1]
        if 0.8 <= rapport <= 1.25:         
            return False
        if 1.4 <= rapport <= 2.2:          
            return True
    if youtube_vu and not album and not artiste and not dims:
        return True   
    if album or artiste:
        return False
    return False   

def lister():
    try:
        con = _bus()
    except Exception:
        return []
    try:
        noms = [n for n in con.send_and_get_reply(message_bus.ListNames(), timeout=1).body[0] if n.startswith(RACINE + ".")]
        sortie = []
        for nom in sorted(noms):
            try:
                l, r = _tout(con, nom, LECTEUR), _tout(con, nom, RACINE)
            except Exception:
                continue
            m = l.get("Metadata") or {}
            m = {k: _valeur(v) for k, v in m.items()}
            pid = _pid(con, nom)
            artistes = m.get("xesam:artist") or []
            artiste = ", ".join(artistes) if isinstance(artistes, list) else str(artistes)
            album = m.get("xesam:album") or ""
            page = m.get("xesam:url") or ""
            duree = (m.get("mpris:length") or 0) / 1e6
            app = r.get("Identity") or nom.rsplit(".", 1)[-1]
            pochette, dims = _pochette(m.get("mpris:artUrl"), page, pid, nom)
            sortie.append({
                "nom": nom, "app": app, "statut": l.get("PlaybackStatus", "Stopped"),
                "titre": m.get("xesam:title") or "", "artiste": artiste, "album": album, "duree": duree,
                "position": (l.get("Position") or 0) / 1e6,
                "vitesse": l.get("Rate", 1.0), "piste": m.get("mpris:trackid") or "/org/mpris/MediaPlayer2/TrackList/NoTrack",
                "precedent": bool(l.get("CanGoPrevious")), "suivant": bool(l.get("CanGoNext")), "lire": bool(l.get("CanPlay", True)),
                "chercher": bool(l.get("CanSeek")), "pochette": pochette, "jeu": _jeu_steam(pid), "pid": pid,
                "video": _video_probable(app, page, album, artiste, duree, dims)})
        return sortie
    finally:
        con.close()

COMMANDES = {"lecture": "PlayPause", "precedent": "Previous", "suivant": "Next",
             "pause": "Pause", "jouer": "Play"}

def commander(nom, action, position=None, piste=None):
    if not str(nom).startswith(RACINE + ".") or (action not in COMMANDES and action != "position"):
        return False
    con = _bus()
    try:
        a = DBusAddress(CHEMIN, bus_name=nom, interface=LECTEUR)
        msg = new_method_call(a, "SetPosition", "ox", (piste, int(float(position) * 1e6))) if action == "position" else new_method_call(a, COMMANDES[action])
        con.send_and_get_reply(msg, timeout=1)
        return True
    except Exception:
        return False
    finally:
        con.close()
