import datetime, json, os, pathlib, platform, pwd, re, socket, urllib.request, zipfile

import websocket

import conflits

EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
IPV4 = re.compile(r"\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b")
IPV6 = re.compile(r"\b(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}\b|\b(?:[0-9a-f]{1,4}:){1,7}:(?:[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){0,6})?(?![\w:])", re.I)
MAC = re.compile(r"\b[0-9a-f]{2}(?:[:-][0-9a-f]{2}){5}\b", re.I)
STEAMID = re.compile(r"\b7656119\d{10}\b|\[U:1:\d+\]")
USERDATA = re.compile(r"(userdata[/\\])\d+")
SERIE = re.compile(r"((?:serial|serie|série)[\w ]{0,12}[\"']?\s*[:=]\s*[\"']?)[\w-]{4,}", re.I)
MAISON = re.compile(r"(/(?:var/)?home/)[^/\s\"']+")
LOCALES = ("127.0.0.1", "0.0.0.0")
COMMUNS = {"deck", "steam", "steamos", "root", "user", "admin", "gamer", "bazzite", "chimeraos", "holo"}
ID_STEAM_BASE = 76561197960265728

def caviarder(texte, secrets):
    texte = MAISON.sub(r"\1<utilisateur>", texte)
    for s in sorted({s.strip() for s in secrets if isinstance(s, str) and len(s.strip()) >= 3 and s.strip().lower() not in COMMUNS}, key=len, reverse=True):
        texte = re.sub(re.escape(s), "<prive>", texte, flags=re.I)
    texte = EMAIL.sub("<e-mail>", texte)
    texte = STEAMID.sub("<steamid>", texte)
    texte = USERDATA.sub(r"\1<compte>", texte)
    texte = MAC.sub("<mac>", texte)
    texte = IPV4.sub(lambda m: m.group(0) if m.group(0) in LOCALES else "<ip>", texte)
    texte = IPV6.sub("<ip>", texte)
    return SERIE.sub(r"\1<serie>", texte)

def _lire(chemin):
    try: return pathlib.Path(chemin).read_text(errors="replace").strip()
    except Exception: return ""

def secrets_locaux(maison):
    s = [maison, socket.gethostname(), _lire("/etc/hostname"), _lire("/etc/machine-id")]
    try: s.append(pwd.getpwuid(os.stat(maison).st_uid).pw_name)
    except Exception: pass
    s.append(pathlib.Path(maison).name)
    for n in ("product_serial", "board_serial", "chassis_serial", "product_uuid"):
        s.append(_lire(f"/sys/class/dmi/id/{n}"))
    for b in pathlib.Path("/sys/class/power_supply").glob("*/serial_number"): s.append(_lire(b))
    for vdf in (".local/share/Steam/config/loginusers.vdf", ".steam/steam/config/loginusers.vdf"):
        t = _lire(pathlib.Path(maison) / vdf)
        for ident in re.findall(r'"(7656119\d{10})"', t):
            s += [ident, str(int(ident) - ID_STEAM_BASE)]
        s += re.findall(r'"(?:AccountName|PersonaName)"\s+"([^"]*)"', t)
    for d in pathlib.Path(maison, ".local/share/Steam/userdata").glob("*"):
        if d.name.isdigit() and d.name != "0": s.append(d.name)
    return [x for x in s if x]

STEAM_JS = r"""(async () => { const r = {}; try { const s = await SteamClient.System.GetSystemInfo(), st = settingsStore?.m_Settings || {};
  r.steam = { version: s.nSteamVersion, build: s.sSteamBuildDate, api: s.sSteamAPI, beta: st.strCurrentBetaName || (st.bIsInClientBeta ? "beta" : "stable") };
  try { r.steam.branche_os = (await SteamClient.Updates.GetCurrentOSBranch())?.sRawName; } catch (e) {}
  r.materiel = { vendeur: s.sProductVendor, bios: s.sBIOSVersion, cpu: (s.sCPUName || "").trim(), gpu: s.sVideoCardName, pilote: s.sVideoDriverVersion,
    ram_mo: s.nSystemRAMSizeMB, appareil: s.eGamingDeviceType, deck_oled: s.bIsDeckOled };
  r.secrets = [s.sHostname, s.sProductSerialNumber]; } catch (e) { r.erreur = String(e); }
  try { const u = App.m_CurrentUser; r.secrets = (r.secrets || []).concat([u.strAccountName, u.strSteamID, u.strFamilyGroupName, u.strClientInstanceID]); } catch (e) {}
  try { r.langue = LocalizationManager.m_rgLocalesToUse[0]; } catch (e) {}
  return r; })()"""
FENETRE_JS = r"""(async (mesurer) => { const r = { erreurs: (window.__pcvErreurs || []).slice(-200), scripts: window.__pcvScripts || null,
  ecran: [screen.width, screen.height, devicePixelRatio, Math.round(screen.width * devicePixelRatio), Math.round(screen.height * devicePixelRatio)], theme: !!document.getElementById("theme-clair") };
  if (mesurer && document.visibilityState === "visible") r.hz = await new Promise((ok) => { let n = 0; const t0 = performance.now();
    const f = (t) => { n++; t - t0 < 1000 ? requestAnimationFrame(f) : ok(Math.round(n * 1000 / (t - t0))); }; requestAnimationFrame(f); setTimeout(() => ok(null), 2500); });
  return r; })(%s)"""

def _evaluer(local, cible, code):
    ws = websocket.create_connection(local(cible["webSocketDebuggerUrl"]), suppress_origin=True, timeout=8)
    try:
        ws.send(json.dumps({"id": 1, "method": "Runtime.evaluate", "params": {"expression": code, "awaitPromise": True, "returnByValue": True}}))
        while (r := json.loads(ws.recv())).get("id") != 1: pass
        return r.get("result", {}).get("result", {}).get("value")
    finally: ws.close()

def steam(debogueur, local):
    try: cibles = json.load(urllib.request.urlopen(debogueur, timeout=3))
    except Exception as e: return {"erreur": type(e).__name__}, {}
    infos, fenetres = {}, {}
    for c in cibles:
        if c.get("type") != "page": continue
        t = c.get("title", "")
        try:
            if t == "SharedJSContext": infos = _evaluer(local, c, STEAM_JS) or {}
            elif c.get("url", "").startswith("about:blank"):
                fenetres[t] = _evaluer(local, c, FENETRE_JS % ("true" if ("Big" in t or t == "SP") else "false"))
        except Exception as e: fenetres[t] = {"erreur": type(e).__name__}
    return infos, fenetres

def systeme():
    os_rel = dict(re.findall(r'^(\w+)="?([^"\n]*)"?$', _lire("/etc/os-release"), re.M))
    return {"os": {k: os_rel[k] for k in ("NAME", "VERSION", "VERSION_ID", "ID", "VARIANT_ID", "BUILD_ID") if k in os_rel},
            "noyau": platform.release(), "architecture": platform.machine(),
            "modele": {n: _lire(f"/sys/class/dmi/id/{n}") for n in ("sys_vendor", "product_name", "product_version", "board_name")}}

def greffons(maison):
    l = []
    for d in sorted(pathlib.Path(maison, "homebrew/plugins").glob("*")):
        try: nom = json.loads(_lire(d / "plugin.json")).get("name") or d.name
        except Exception: nom = d.name
        try: version = json.loads(_lire(d / "package.json")).get("version")
        except Exception: version = None
        l.append({"nom": nom, "version": version})
    return l

def telechargements(maison):
    m = re.search(r'^XDG_DOWNLOAD_DIR="([^"]+)"', _lire(pathlib.Path(maison, ".config/user-dirs.dirs")), re.M)
    choix = [pathlib.Path(m.group(1).replace("$HOME", str(maison)))] if m else []
    choix += [pathlib.Path(maison, "Téléchargements"), pathlib.Path(maison, "Downloads")]
    for d in choix:
        if d.is_dir() and d.resolve().is_relative_to(pathlib.Path(maison).resolve()): return d
    choix[-1].mkdir(exist_ok=True)
    return choix[-1]

def rapport(maison, dossier_greffon, journaux, secours, etat_scripts, debogueur, local, maintenant=None):
    maintenant = maintenant or datetime.datetime.now()
    infos, fenetres = steam(debogueur, local)
    secrets = secrets_locaux(maison) + list(infos.pop("secrets", None) or [])
    try: version = json.loads(_lire(pathlib.Path(dossier_greffon, "package.json"))).get("version")
    except Exception: version = None
    donnees = {"rapport": "SteamU, rapport de diagnostic", "date": maintenant.isoformat(timespec="seconds"),
               "steamu": version, "decky": _lire(pathlib.Path(maison, "homebrew/services/.loader.version")) or None,
               **systeme(), "steam": infos, "secours": {"pause": secours.pause, "historique": secours.historique},
               "scripts_poses": {k: dict(v) for k, v in list(etat_scripts.items())}, "fenetres": fenetres, "greffons_decky": greffons(maison),
               "conflits": conflits.conflits(maison, debogueur, local, _evaluer)}
    nom = maintenant.strftime("steamu-diagnostic-%Y%m%d-%H%M.zip")
    cible = telechargements(maison) / nom
    tmp = cible.with_name("." + nom + ".tmp")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("rapport.json", caviarder(json.dumps(donnees, ensure_ascii=False, indent=1), secrets))
        for j in sorted(pathlib.Path(journaux).glob("*.log"), key=lambda f: f.stat().st_mtime)[-3:]:
            z.writestr("journaux/" + caviarder(j.name, secrets), caviarder(_lire(j), secrets))
    os.replace(tmp, cible)
    if os.geteuid() == 0:   
        st = os.stat(cible.parent); os.chown(cible, st.st_uid, st.st_gid)
    return nom
