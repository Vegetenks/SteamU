import datetime, json, os, pathlib, platform, pwd, re, socket, subprocess, time, urllib.request, zipfile

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
  // (19/10, issue #1) la taille de la bibliothèque : l'accueil met tous les jeux installés sur la grille (raccourcis
  // non-Steam compris, émulateurs) ; le même test que console.js (raccourci, installe)
  try { const l = appStore.allApps || [], rac = (a) => a.app_type === 1073741824 || !!a.BIsShortcut?.(), ici = (a) => rac(a) || !!a.local_per_client_data?.installed;
    const perso = (f, a) => { try { return (appStore[f](a) || []).length > 0; } catch (e) { return false; } };
    r.bibliotheque = { total: l.length, installes_ici: l.filter(ici).length, raccourcis_non_steam: l.filter(rac).length,
      installes_ailleurs: l.filter((a) => !ici(a) && (a.per_client_data || []).some((p) => p.clientid !== "0" && p.installed)).length,
      images_perso: l.filter((a) => ici(a) && ["GetCustomHeroImageURLs", "GetCustomVerticalCapsuleURLs", "GetCustomLogoImageURLs", "GetCustomLandcapeImageURLs"].some((f) => perso(f, a))).length }; }
  catch (e) { r.bibliotheque = { erreur: String(e) }; }
  return r; })()"""
FENETRE_JS = r"""(async (mesurer) => { const r = { erreurs: (window.__pcvErreurs || []).slice(-200), scripts: window.__pcvScripts || null,
  ecran: [screen.width, screen.height, devicePixelRatio, Math.round(screen.width * devicePixelRatio), Math.round(screen.height * devicePixelRatio)], theme: !!document.getElementById("theme-clair") };
  // (18/10, issue #1) comment Steam dessine : la carte graphique, ou le processeur (rendu logiciel : llvmpipe, SwiftShader…)
  if (mesurer) try { const g = document.createElement("canvas").getContext("webgl"), x = g && g.getExtension("WEBGL_debug_renderer_info");
    r.rendu = g ? String(x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER)) : "pas de WebGL"; r.rendu_logiciel = window.__pcvRenduLogiciel ?? null; } catch (e) { r.rendu = "erreur"; }
  // l'accueil : ses cases, ses tuiles de jeu, et ce que la voie des images en tient (console.js, mémoire __pcvTuiles-…)
  if (mesurer) try { const d = document, M = Object.keys(window).filter((k) => k.startsWith("__pcvTuiles-")).map((k) => window[k])[0];
    r.accueil = { cases: d.querySelectorAll("#pcv-console .cel").length, tuiles_jeux: d.querySelectorAll("#pcv-console .cel.jeu").length,
      peintes: d.querySelectorAll("#pcv-console .cel.jeu .im[data-appid]").length, videos: d.querySelectorAll("#pcv-console video.pcv-anim").length,
      copies: M?.copies?.size ?? null, images_animees: M?.animees?.size ?? null, tuiles_animees_reglage: (() => { try { return localStorage.getItem("pcv-tuiles-animees"); } catch (e) { return null; } })() }; } catch (e) { r.accueil = { erreur: String(e) }; }
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

PHASES = [("normal", ""), ("sans_mii", "#pcv-mii-toile{display:none!important}"), ("sans_fond_anime", "canvas.pcv-fond{display:none!important}"),
          ("sans_grille_accueil", "#pcv-console{display:none!important}"),
          ("sans_animations_css", "html *{animation:none!important;transition:none!important}"), ("normal_fin", "")]
STYLE_JS = r"""(() => { const d = SteamUIStore.WindowStore.GamepadUIMainWindowInstance.BrowserWindow.document;
  d.getElementById("pcv-essai-perf")?.remove(); const css = %s; if (css) { const s = d.createElement("style"); s.id = "pcv-essai-perf"; s.textContent = css; d.head.appendChild(s); }
  return true; })()"""
JS_ETAT = r"""(() => { const W = SteamUIStore.WindowStore.GamepadUIMainWindowInstance.BrowserWindow, d = W.document;
  return { page: d.body.dataset.pcvPage || null, tas_mo: W.performance?.memory ? Math.round(W.performance.memory.usedJSHeapSize / 1048576) : null,
    noeuds: d.getElementsByTagName("*").length, animations: d.getAnimations ? d.getAnimations().length : null,
    canvas: d.querySelectorAll("canvas").length, rendu_logiciel: W.__pcvRenduLogiciel ?? null,
    accueil: (() => { try { return JSON.parse(W.localStorage.getItem("pcv-interface")) || "nouvelle"; } catch (e) { return null; } })() }; })()"""
MII_ARRET_JS = r"""(() => { const W = SteamUIStore.WindowStore.GamepadUIMainWindowInstance.BrowserWindow, M = W.__pcvMiiAccueil;
  const vu = !!(M?.marche?.() ?? W.document.querySelector("#pcv-mii-toile.vu")); if (vu) try { M?.arreter?.(); } catch (e) {} return vu; })()"""   
MII_RELANCE_JS = r"""(() => { try { SteamUIStore.WindowStore.GamepadUIMainWindowInstance.BrowserWindow.__pcvMiiAccueil?.demarrer?.(); } catch (e) {} return true; })()"""
ALLER_JS = r"""(() => { const a = window.__pcvAller; if (typeof a === "function") a(%s); return true; })()"""

def _processus():
    out = {}
    for d in pathlib.Path("/proc").iterdir():
        if not d.name.isdigit(): continue
        try:
            cmd = (d / "cmdline").read_bytes().split(b"\0")
            if not cmd or b"steamwebhelper" not in cmd[0]: continue
            t = next((a.split(b"=", 1)[1].decode() for a in cmd if a.startswith(b"--type=")), "principal")
            st = (d / "stat").read_text().rsplit(")", 1)[1].split()
            rss = int((d / "statm").read_text().split()[1]) * os.sysconf("SC_PAGE_SIZE") / 1048576
            out[d.name] = (t, int(st[11]) + int(st[12]), rss)
        except Exception: continue
    return out

def _mesure(duree=5):
    tick = os.sysconf("SC_CLK_TCK"); a = _processus(); time.sleep(duree); b = _processus()
    par_type = {}
    for pid, (t, cpu, rss) in b.items():
        x = par_type.setdefault(t, [0.0, 0.0]); x[0] += (cpu - a.get(pid, (t, cpu, 0))[1]) * 100 / (duree * tick); x[1] += rss
    return {"processeur_pct_d_un_coeur": round(sum(v[0] for v in par_type.values())), "memoire_mo": round(sum(v[1] for v in par_type.values())),
            "par_type": {k: {"processeur_pct": round(v[0]), "memoire_mo": round(v[1])} for k, v in sorted(par_type.items(), key=lambda kv: -kv[1][0])}}

def performance(debogueur, local, journal=None):
    try:
        cibles = json.load(urllib.request.urlopen(debogueur, timeout=3))
        sj = next(c for c in cibles if c.get("title") == "SharedJSContext")
    except Exception as e: return {"erreur": type(e).__name__}
    res = {"coeurs": os.cpu_count(), "phases": {}}
    try:
        _evaluer(local, sj, ALLER_JS % '"accueil"'); time.sleep(3)
        for nom, css in PHASES:
            _evaluer(local, sj, STYLE_JS % json.dumps(css))
            if nom == "sans_mii": res["mii_tournaient"] = _evaluer(local, sj, MII_ARRET_JS)
            time.sleep(1)
            res["phases"][nom] = {**_mesure(), "page": _evaluer(local, sj, JS_ETAT)}
            if nom == "sans_mii" and res.get("mii_tournaient"): _evaluer(local, sj, MII_RELANCE_JS)   
            if journal:
                try: journal.write_text(json.dumps(res, ensure_ascii=False, indent=1))
                except Exception: pass
    except Exception as e: res["erreur"] = type(e).__name__
    finally:
        try: _evaluer(local, sj, STYLE_JS % json.dumps(""))
        except Exception: pass
    return res

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

def _dernieres_erreurs(fenetres, n=3):
    toutes = [e for f in (fenetres or {}).values() for e in (f or {}).get("erreurs") or [] if isinstance(e, (list, tuple)) and len(e) == 2]
    toutes.sort(key=lambda e: e[0], reverse=True)
    return [str(t).split("\n", 1)[0] for _, t in toutes[:n]]

def _ecran(fenetres):
    for f in (fenetres or {}).values():
        e = (f or {}).get("ecran")
        if e: return e
    return None

def resume_github(donnees, secrets):
    os_rel, steam_infos, modele = donnees.get("os") or {}, (donnees.get("steam") or {}).get("steam") or {}, donnees.get("modele") or {}
    ecran = _ecran(donnees.get("fenetres"))
    r = {"steamu": donnees.get("steamu"), "decky": donnees.get("decky"),
         "steam_version": steam_infos.get("version"), "steam_branche": steam_infos.get("beta"),
         "os": (f"{os_rel.get('NAME', '?')} {os_rel.get('VERSION', '')}".strip()) or None, "noyau": donnees.get("noyau"),
         "appareil": modele.get("product_name") or modele.get("sys_vendor") or None,
         "ecran": f"{ecran[0]}x{ecran[1]} @{round(ecran[2], 2)}x" if ecran else None,
         "pause": bool((donnees.get("secours") or {}).get("pause")),
         "conflits": list((donnees.get("conflits") or {}).values()), "erreurs": _dernieres_erreurs(donnees.get("fenetres"))}
    return {k: (caviarder(v, secrets) if isinstance(v, str) else [caviarder(x, secrets) for x in v] if isinstance(v, list) else v)
            for k, v in r.items()}

def session():
    r = {"gamescope": False}
    for d in pathlib.Path("/proc").iterdir():
        if not d.name.isdigit(): continue
        nom = _lire(d / "comm").strip()
        if nom.startswith("gamescope"): r["gamescope"] = True
        if nom == "steam" and "environnement" not in r:
            try: env = dict(x.split("=", 1) for x in (d / "environ").read_bytes().decode("utf8", "replace").split("\0") if "=" in x)
            except Exception: continue
            r["environnement"] = {k: env.get(k) for k in ("XDG_CURRENT_DESKTOP", "XDG_SESSION_DESKTOP", "XDG_SESSION_TYPE", "GAMESCOPE_WAYLAND_DISPLAY", "SteamDeck", "SteamGamepadUI")}
    r["mode"] = "jeu" if r["gamescope"] else "bureau"
    return r

JOURNAUX_STEAM = ("cef_log.txt", "cef_log.previous.txt", "console-linux.txt", "console-linux.previous.txt")
MOTIFS_PLANTAGE = re.compile(r"fatal|crash|out of memory|\boom\b|gpu.process|gpu process|renderer|sigsegv|sigabrt|killed|webhelper.*(exit|restart|died)|context lost", re.I)
def journaux_steam(maison):
    r = {}
    for base in (".local/share/Steam/logs", ".steam/steam/logs"):
        for n in JOURNAUX_STEAM:
            f = pathlib.Path(maison, base, n)
            if n in r or not f.is_file(): continue
            r[n] = "\n".join([l for l in _lire(f).splitlines() if MOTIFS_PLANTAGE.search(l) and "Fontconfig" not in l][-150:])
    return r

def journal_decky(maison):
    f = sorted(pathlib.Path(maison, "homebrew/logs").glob("*.log"), key=lambda f: f.stat().st_mtime)
    if f: return "\n".join(_lire(f[-1]).splitlines()[-300:])
    try: return subprocess.run(["journalctl", "-u", "plugin_loader", "-n", "300", "--no-pager"], capture_output=True, text=True, timeout=5).stdout
    except Exception: return ""

GARDES_PLANTAGE = 3   

def rapport(maison, dossier_greffon, journaux, secours, etat_scripts, debogueur, local, maintenant=None, imports=None, court=False):
    maintenant = maintenant or datetime.datetime.now()
    perf = None if court else performance(debogueur, local, telechargements(maison) / maintenant.strftime("steamu-performance-%Y%m%d-%H%M.json"))
    infos, fenetres = ({}, {}) if court else steam(debogueur, local)
    secrets = secrets_locaux(maison) + list(infos.pop("secrets", None) or [])
    try: version = json.loads(_lire(pathlib.Path(dossier_greffon, "package.json"))).get("version")
    except Exception: version = None
    donnees = {"rapport": "SteamU, rapport de diagnostic", "date": maintenant.isoformat(timespec="seconds"),
               "steamu": version, "decky": _lire(pathlib.Path(maison, "homebrew/services/.loader.version")) or None,
               **systeme(), "steam": infos, "secours": {"pause": secours.pause, "historique": secours.historique},
               "scripts_poses": {k: dict(v) for k, v in list(etat_scripts.items())}, "fenetres": fenetres, "greffons_decky": greffons(maison),
               "conflits": {} if court else conflits.conflits(maison, debogueur, local, _evaluer), "performance": perf, "imports": imports,
               "session": session()}
    nom = maintenant.strftime("steamu-plantage-%Y%m%d-%H%M.zip" if court else "steamu-diagnostic-%Y%m%d-%H%M.zip")
    cible = telechargements(maison) / nom
    tmp = cible.with_name("." + nom + ".tmp")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("rapport.json", caviarder(json.dumps(donnees, ensure_ascii=False, indent=1), secrets))
        for j in sorted(pathlib.Path(journaux).glob("*.log"), key=lambda f: f.stat().st_mtime)[-3:]:
            z.writestr("journaux/" + caviarder(j.name, secrets), caviarder(_lire(j), secrets))
        for n, t in journaux_steam(maison).items(): z.writestr("journaux-steam/" + n, caviarder(t, secrets))
        z.writestr("journaux/decky.log", caviarder(journal_decky(maison), secrets))
    os.replace(tmp, cible)
    if court:   
        for vieux in sorted(cible.parent.glob("steamu-plantage-*.zip"), key=lambda f: f.stat().st_mtime)[:-GARDES_PLANTAGE]: vieux.unlink(missing_ok=True)
    if os.geteuid() == 0:   
        st = os.stat(cible.parent); os.chown(cible, st.st_uid, st.st_gid)
    return nom, resume_github(donnees, secrets)

