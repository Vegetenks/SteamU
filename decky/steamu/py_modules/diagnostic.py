import collections, datetime, hashlib, json, os, pathlib, platform, re, socket, subprocess, time, urllib.request, zipfile

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
SSID = re.compile(r"(?i)(\bssid\"?\s*[:=]\s*)(?:\"[^\"]*\"|'[^']*'|[^,;\n]+)")
CLES = re.compile(r"(?i)([\"']?(?<![\w-])-?(?:access_?token|refresh_?token|id_?token|token|bearer_?token|authorization|password|passwd|"
                  r"secret|client_?secret|api_?key|auth_?code|exchange_?code|oauth_?code|code_?verifier|cookie|session_?id|"
                  r"steamLoginSecure|auth_?password|auth_?login|epicusername|epicuserid|epic_?user_?id|account_?id|account_?name|"
                  r"user_?name|user_?id|login|e-?mail|persona_?name|display_?name|nickname|psk|serial_?number|uhs|xuid|gamertag)(?![\w-])[\"']?\s*(?:=|:(?=[\s\"']))\s*)"
                  r"(\"[^\"]*\"|'[^']*'|[^\s,;&}\]\"']+)")
BEARER = re.compile(r"(?i)\b(bearer|basic)\s+[\w.~+/=-]{8,}")
URL_PARAMS = re.compile(r"(https?://[^\s?#\"'<>]+)\?[^\s\"']*")
URL_LOCALE = re.compile(r"(https?://(?:127\.0\.0\.1|localhost)(?::\d+)?/)[\w-]{12,}")   
JWT = re.compile(r"\beyJ[\w-]{8,}\.[\w-]+(?:\.[\w-]+)?")
JETON = re.compile(r"(?<![\w-])(?=[\w-]*[a-z])(?=[\w-]*[A-Z])(?=[\w-]*\d)[\w-]{20,}(?![\w-])|\b[0-9a-fA-F]{32,}\b")
def _jeton(m):
    x = re.sub(r"[-_]", "", m.group(0)); classe = lambda c: c.isdigit() or (c.isupper() and 2)
    return "<jeton>" if re.fullmatch(r"[0-9a-fA-F]{32,}", x) or sum(classe(a) != classe(b) for a, b in zip(x, x[1:])) >= len(x) * .2 else m.group(0)
LONG_NUMERO = re.compile(r"(?<![\w.-])\d{15,}(?![\w.])")   
LOCALES = ("127.0.0.1", "0.0.0.0")
COMMUNS = {"deck", "steam", "steamos", "root", "user", "admin", "gamer", "bazzite", "chimeraos", "holo",
           "amazon", "epic", "gog", "itch", "ubisoft", "battlenet", "microsoft", "xbox", "legendary", "nile", "unifideck", "true", "false", "none", "null"}   
ID_STEAM_BASE = 76561197960265728
SEL = os.urandom(16)   

def _repere(genre, valeur):
    return f"<{genre}-{hashlib.sha256(SEL + valeur.lower().encode()).hexdigest()[:6]}>"

def caviarder(texte, secrets):
    texte = MAISON.sub(r"\1<utilisateur>", texte)
    for s in sorted({s.strip() for s in secrets if isinstance(s, str) and len(s.strip()) >= 3 and s.strip().lower() not in COMMUNS}, key=len, reverse=True):
        motif = rf"(?<!\d){re.escape(s)}(?!\d)" if s.isdigit() else re.escape(s)   
        texte = re.sub(motif, lambda m: _repere("prive", m.group(0)), texte, flags=re.I)
    texte = SSID.sub(r"\1<ssid>", texte)
    texte = URL_LOCALE.sub(r"\1<jeton>", texte)
    texte = URL_PARAMS.sub(r"\1?<parametres>", texte)
    texte = BEARER.sub(r"\1 <jeton>", texte)
    texte = CLES.sub(lambda m: m.group(1) + ("\"<retire>\"" if m.group(2)[:1] in "\"'" else "<retire>"), texte)
    texte = JWT.sub("<jeton>", texte)
    texte = EMAIL.sub(lambda m: _repere("e-mail", m.group(0)), texte)
    texte = STEAMID.sub(lambda m: _repere("steamid", m.group(0)), texte)
    texte = LONG_NUMERO.sub(lambda m: _repere("id", m.group(0)), texte)
    texte = USERDATA.sub(r"\1<compte>", texte)
    texte = MAC.sub(lambda m: _repere("mac", m.group(0)), texte)
    texte = IPV4.sub(lambda m: m.group(0) if m.group(0) in LOCALES else _repere("ip", m.group(0)), texte)
    texte = IPV6.sub(lambda m: _repere("ip", m.group(0)), texte)
    texte = JETON.sub(_jeton, texte)
    return SERIE.sub(r"\1<serie>", texte)

def _lire(chemin):
    try: return pathlib.Path(chemin).read_text(errors="replace").strip()
    except Exception: return ""

def secrets_locaux(maison):
    s = [maison, socket.gethostname(), _lire("/etc/hostname"), _lire("/etc/machine-id")]
    try:
        import pwd
        s.append(pwd.getpwuid(os.stat(maison).st_uid).pw_name)
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
    s += [l.rsplit(":", 1)[0] for l in _commande(["nmcli", "-t", "-f", "NAME,TYPE", "connection", "show"]).splitlines() if l.endswith("wireless")]
    for f in pathlib.Path("/etc/NetworkManager/system-connections").glob("*"):   
        s += [f.stem] + re.findall(r"^ssid=(.+)$", _lire(f), re.M)
    for f in [pathlib.Path(maison, ".config", n, "user.json") for n in ("legendary", "nile")] + list(pathlib.Path(maison, ".config/unifideck").glob("*.json")):
        try: s += _valeurs_sensibles(json.loads(_lire(f) or "null"))
        except ValueError: pass
    return [x for x in s if x]

SENSIBLES = re.compile(r"(?i)name|user|account|login|mail|token|password|customer|persona|nick|_id$|^id$")
def _valeurs_sensibles(o, cle=""):
    if isinstance(o, dict): return [x for k, v in o.items() for x in _valeurs_sensibles(v, str(k))]
    if isinstance(o, list): return [x for v in o[:50] for x in _valeurs_sensibles(v, cle)]
    return [str(o)] if isinstance(o, (str, int)) and not isinstance(o, bool) and SENSIBLES.search(cle) and len(str(o)) >= 3 else []

def _commande(cmd, delai=4, **k):
    try: return subprocess.run(cmd, capture_output=True, text=True, timeout=delai, **k).stdout
    except Exception: return ""

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
  try { const c = settingsStore.m_ClientSettings; r.puissance = { limite_active: c.steamos_tdp_limit_enabled ?? null, tdp_w: c.steamos_tdp_limit ?? null }; } catch (e) {}
  try { r.reseau = { hors_ligne: App.m_CurrentUser?.bIsInOfflineMode ?? null }; } catch (e) {}
  // (16/11) la veille et l'écran de veille (une console qui s'endort en plein téléchargement), les logiciels en cours (noms
  // de jeux seulement), la page de Steam et les dernières (sans les identifiants d'amis ou de profils)
  try { const c = settingsStore.m_ClientSettings || {}, v = {};
    for (const k of Object.keys(c)) if (/idle|screensaver|suspend|dim|sleep/i.test(k) && typeof c[k] !== "object") v[k] = c[k];
    for (const k of ["system_idle_suspend_battery_sec", "system_idle_suspend_ac_sec", "system_idle_screensaver_battery_sec", "system_idle_screensaver_ac_sec"])
      if (!(k in v)) try { v[k] = settingsStore.GetClientSetting(k); } catch (e) {}
    r.veille = v; } catch (e) { r.veille = { erreur: String(e) }; }
  try { r.logiciels_en_cours = (SteamUIStore.RunningApps || []).map((a) => ({ appid: a.appid, nom: a.display_name, raccourci: a.app_type === 1073741824 })); } catch (e) {}
  try { const anon = (p) => String(p || "").replace(/(profile|friends?|chat|user|player|groups?|id)\/[^/?#]+/gi, "$1/*"),
      h = SteamUIStore.WindowStore.GamepadUIMainWindowInstance.m_history;
    r.route = { actuelle: anon(h?.location?.pathname), profondeur: h?.length ?? null }; }   // (les dernières : __pcvPagesVues, fenêtre principale)
  catch (e) { r.route = { erreur: String(e) }; }
  try { r.steam.mode_hors_ligne = App.m_CurrentUser?.bIsInOfflineMode ?? null; r.steam.uptime_min = Math.round(performance.now() / 60000); } catch (e) {}
  return r; })()"""
FENETRE_JS = r"""(async (mesurer) => { const r = { erreurs: (window.__pcvErreurs || []).slice(-200), scripts: window.__pcvScripts || null,
  ecran: [screen.width, screen.height, devicePixelRatio, Math.round(screen.width * devicePixelRatio), Math.round(screen.height * devicePixelRatio)], theme: !!document.getElementById("theme-clair"),
  connexion: window.__pcvConnexionDiagnostic || null,
  economie_steamu: (() => { try { const m = window.__pcvModes?.lire?.(); return m ? !!m.economie : null; } catch (e) { return null; } })(),
  // (25/10) rangées réellement dessinées et --r tel que le document le voit (une seule rangée chez un testeur Steam Deck)
  grille: window.__pcvGrilleDiagnostic ? { ...window.__pcvGrilleDiagnostic, zoom: window.__pcvGrille?.zoom?.(), css: (() => { const g = window.__pcvGrille?.grille?.(); if (!g) return null;
    const s = getComputedStyle(g); return { rangees: s.gridTemplateRows, var_r: s.getPropertyValue("--r") }; })() } : null,
  // (lot 12) les voies de la manette qui arrivent à la place (place.js, compte de __pcvPlaceCommandes) : état brut, axes,
  // défilement 47, navigation ; seulement des compteurs et des valeurs d'axes
  place: (() => { try { return window.__pcvPlace?.etat?.().commandes ?? null; } catch (e) { return { erreur: String(e) }; } })() };
  // (18/10, issue #1) comment Steam dessine : la carte graphique, ou le processeur (rendu logiciel : llvmpipe, SwiftShader…)
  if (mesurer) try { const g = document.createElement("canvas").getContext("webgl"), x = g && g.getExtension("WEBGL_debug_renderer_info");
    r.rendu = g ? String(x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER)) : "pas de WebGL"; r.rendu_logiciel = window.__pcvRenduLogiciel ?? null;
    r.webgl_extensions = g ? g.getSupportedExtensions() : null; } catch (e) { r.rendu = "erreur"; }
  // (01/11, place 3D : sur la console, toutes les applis prenaient l'icône d'Amis, la VM non) le Chromium de Steam, l'apparence
  // et le thème, et deux petites images SVG (rouge, puis bleue ; simple, puis en foreignObject) dessinées sur une toile :
  // lisible (pas de taint) et chaque image bien la sienne (« memes » : la 2e a rendu la 1re)
  if (mesurer) { r.chromium = (navigator.userAgent.match(/(?:Chrome|Valve Steam [A-Za-z]+)\/[\d.]+/g) || []).join(" ");
    r.apparence = document.documentElement.dataset.pcvApparence || "clair"; try { r.theme = window.__pcvThemes?.actuel?.() ?? null; } catch (e) { r.theme = { erreur: String(e) }; }
    const essai = async (fo) => { const res = []; for (const c of ["#ff0000", "#0000ff"]) { const corps = `<rect width="16" height="16" fill="${c}"/>`;
        const u = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">${fo ? `<foreignObject width="16" height="16"><div xmlns="http://www.w3.org/1999/xhtml" style="width:16px;height:16px;background:${c}"></div></foreignObject>` : corps}</svg>`);
        try { const im = new Image(); im.src = u; await im.decode(); const t = document.createElement("canvas"); t.width = t.height = 16; const x = t.getContext("2d"); x.drawImage(im, 0, 0);
          res.push([...x.getImageData(8, 8, 1, 1).data].join(",")); } catch (e) { res.push(e.name || String(e)); } }
      return { pixels: res, memes: res[0] === res[1], attendu: ["255,0,0,255", "0,0,255,255"] }; };
    try { r.essai_svg = { simple: await essai(false), foreign_object: await essai(true) }; } catch (e) { r.essai_svg = { erreur: String(e) }; } }
  // l'accueil : ses cases, ses tuiles de jeu, et ce que la voie des images en tient (console.js, mémoire __pcvTuiles-…)
  if (mesurer) try { const d = document, M = Object.keys(window).filter((k) => k.startsWith("__pcvTuiles-")).map((k) => window[k])[0];
    r.accueil = { cases: d.querySelectorAll("#pcv-console .cel").length, tuiles_jeux: d.querySelectorAll("#pcv-console .cel.jeu").length,
      peintes: d.querySelectorAll("#pcv-console .cel.jeu .im[data-appid]").length, videos: d.querySelectorAll("#pcv-console video.pcv-anim").length,
      copies: M?.copies?.size ?? null, images_animees: M?.animees?.size ?? null, tuiles_animees_reglage: (() => { try { return localStorage.getItem("pcv-tuiles-animees"); } catch (e) { return null; } })() }; } catch (e) { r.accueil = { erreur: String(e) }; }
  if (mesurer) r.steamu = (() => { const W = window, O = window.opener || window, g = (k) => W[k] ?? O[k];
    const t = (f) => { try { return f(); } catch (e) { return { erreur: String(e).slice(0, 160) }; } };
    const anon = (p) => String(p || "").replace(/(profile|friends?|chat|user|player|groups?|id)\/[^/?#]+/gi, "$1/*");
    const M = Object.keys(W).filter((k) => k.startsWith("__pcvTuiles-")).map((k) => W[k])[0];
    return {
      page: t(() => document.body.dataset.pcvPage || null), route: t(() => anon(W.__pcvBridge?.page?.())),
      pages_vues: t(() => (W.__pcvPagesVues || []).map(([q, p]) => [q, anon(p)])),
      pages_ouvertes: t(() => (W.__pcvPagesDessus || []).filter((id) => { const e = document.getElementById(id); return e && !e.hidden; })),
      jeu_devant: g("__pcvJeuDevant") ?? null, pause_installee: !!W.__pcvMajInstallation,
      lancement: t(() => ({ etat: W.__pcvLancement?.etat?.() ?? null, journal: (W.__pcvLancement?.journal || []).slice(-40).map((x) => ({ ...x, depuis: anon(x.depuis), page: anon(x.page) })) })),
      concession: t(() => { const C = g("__pcvCharge"); return C ? { palier: C.palier(), reglage: C.reglage(), bilan: C.bilan() } : null; }),
      modes: t(() => W.__pcvModes?.lire?.() ?? null),
      tuiles: t(() => { if (!M) return null; let o = 0; M.blobs?.forEach?.((b) => { o += b.taille || 0; });
        return { copies: M.copies?.size, blobs: M.blobs?.size, blobs_mo: Math.round(o / 1048576), plafond_mo: M.plafond ? Math.round(M.plafond / 1048576) : null,
          decodees: M.decodees?.size, animees: M.animees?.size, videos: M.videos?.size }; }),
      evenements_bibliotheque: t(() => { const f = g("__pcvBiblioFreq"); if (!f) return null; const now = Date.now();
        return { total: f.total, par_minute_moyenne: Math.round(f.total * 60000 / Math.max(1, now - f.depuis)), derniere_minute: f.recents.filter((x) => now - x < 60000).length, par_source: f.sources }; }),
      notifications: t(() => ({ recentes: (W.__pcvHistorique?.lire?.() || []).slice(0, 25).map((n) => ({ categorie: W.__pcvNotifsCategorie?.(n) ?? n.pile ?? null, quand: n.date, lu: !!n.lu })),
        bulles: W.__pcvToasts?.etat?.() ?? null })),
      manettes: t(() => ({ page_ouverte: W.__pcvManettes?.ouvert?.() ?? null, liste: (W.__pcvBridge?.controllers?.() || []).map((c) => ({ type: c.eControllerType,
        vendor: (+c.unVendorID || 0).toString(16), product: (+c.unProductID || 0).toString(16), index: c.nControllerIndex, xinput: c.nXInputIndex,
        sans_fil: !!c.bWireless, bluetooth: !!c.bBluetooth, batterie: c.ucBatteryLevel, picto: t(() => W.__pcvPictoManette?.(c)) })) })),
      apercu_home: g("__pcvHomeApercuEtat") ?? null,
      unifideck: t(() => { const u = O.__pcvUnifideck; if (!u) return null; const b = {}; for (const k of u.ids?.keys?.() || []) { const s = k.split(":")[0]; b[s] = (b[s] || 0) + 1; }
        const f = W.__pcvTelechUnif?.file?.();
        return { repond: !!u.ok, echecs: u.echecs, erreur: u.erreur || null, jeux_par_boutique: b, installes: [...(u.jeux?.values?.() || [])].filter(Boolean).length,
          nuage: u.nuage?.size ?? null, xbox_pc: u.pc?.size ?? null, doublons: u.dbl ? { dispo: !!u.dbl.dispo, groupes: u.dbl.grp?.size ?? null } : null,
          file: f ? { en_cours: f.cours ? { appid: f.cours.appid, pct: f.cours.pct, boutique: f.cours.unif?.store } : null, suivants: f.suivants.length, termines: f.termines.length } : null }; }),
      spotpass: t(() => { const S = W.__pcvSpotPass; return S ? { actif: !!S.actif(), visiteurs: (S.visiteurs?.() || []).length, mii_recus: (S.mii?.() || []).length } : null; }),
      videos: t(() => [...document.querySelectorAll("video")].slice(0, 12).map((v) => ({ classe: String(v.className).slice(0, 40), pret: v.readyState, en_pause: v.paused,
        erreur: v.error?.code ?? null, taille: [v.videoWidth, v.videoHeight], temps: Math.round(v.currentTime) }))),
      place: t(() => W.__pcvPlace?.etat?.() ?? null)
    }; })();
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
    for f in fenetres.values():
        if isinstance(f, dict) and isinstance(f.get("erreurs"), list): f["erreurs"] = _regrouper(f["erreurs"])
    return infos, fenetres

def _regrouper(erreurs, n=40):
    vues = {}
    for e in erreurs:
        if isinstance(e, (list, tuple)) and len(e) >= 2: t, x = e[0], str(e[1])[:600]; vues[x] = [max(t, vues.get(x, [t])[0]), x, vues.get(x, [0, 0, 0])[2] + 1]
    return sorted(vues.values(), key=lambda e: e[0])[-n:]

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
                try: journal.write_text(caviarder(json.dumps(res, ensure_ascii=False, indent=1), []))
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
    toutes = [e[:2] for f in (fenetres or {}).values() for e in (f or {}).get("erreurs") or [] if isinstance(e, (list, tuple)) and len(e) >= 2]
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
    p, n = donnees.get("puissance") or {}, donnees.get("reseau") or {}
    r["puissance"] = f"Steam: {p.get('steam', INCONNU)}; SteamU economy: {p.get('economie_steamu', INCONNU)}; sysfs: {p.get('systeme', INCONNU)}"
    r["reseau"] = "; ".join(f"{k}: {v}" for k, v in n.items()) or INCONNU
    r["demarrage"] = "; ".join(f"{k}: {v['instant']} (+{v['depuis_precedent_s']} s)" for k, v in (donnees.get("demarrage") or {}).items()) or INCONNU
    c = donnees.get("connexion_steam") or {}
    r["connexion_steam"] = f"{c.get('etat', INCONNU)}, {c.get('lignes', 0)} lines in diagnostic ZIP"
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
            r[n] = "\n".join([l for l in _lire(f).splitlines() if MOTIFS_PLANTAGE.search(l) and "Fontconfig" not in l and "crash key" not in l][-150:])
    return r

DECKY_MOTIFS = re.compile(r"Installed|Loaded|Loading|Shutting down|still alive|SIGKILL|has been stopped|already loaded|Decky frontend|"
                          r"\[ERROR\]|ERROR|Traceback|Exception|SteamU|steamu|Started|Stopped|Stopping|Main process exited|[Ff]ailed|"
                          r"[Kk]illed|oom|Out of memory|Unifideck\]")
LIMITE_DECKY, LIMITE_DECKY_AVANT, PILE = 250, 60, 12
def _filtrer(lignes, motifs, limite, pile=PILE):
    garder = set()
    for i, l in enumerate(lignes):
        if motifs.search(l) and "Handling event" not in l:
            garder.add(i)
            if "Traceback" in l: garder.update(range(i + 1, min(i + 1 + pile, len(lignes))))
    return [lignes[i] for i in sorted(garder)][-limite:]

def journal_decky(maison):
    f = sorted(pathlib.Path(maison, "homebrew/logs").glob("*.log"), key=lambda f: f.stat().st_mtime)
    if f: return "\n".join(_filtrer(_lire(f[-1]).splitlines()[-20000:], DECKY_MOTIFS, LIMITE_DECKY))
    j = lambda b, n: _commande(["journalctl", "-u", "plugin_loader", "-b", b, "-n", str(n), "--no-pager", "-o", "short-iso"], 8).splitlines()
    avant = _filtrer(j("-1", 5000), DECKY_MOTIFS, LIMITE_DECKY_AVANT)
    return "\n".join((["--- démarrage précédent (fin) ---"] + avant + ["--- ce démarrage ---"] if avant else []) + _filtrer(j("0", 30000), DECKY_MOTIFS, LIMITE_DECKY))

def erreurs_greffons(decky_log):
    return dict(collections.Counter(m[1] for m in re.finditer(r"ERROR.*?plugin (.+?) \(v", decky_log)).most_common(20))

def memoire():
    m = dict(re.findall(r"^(\w+):\s+(\d+)", _lire("/proc/meminfo"), re.M))
    mo = lambda k: round(int(m[k]) / 1024) if k in m else None
    return {"total_mo": mo("MemTotal"), "disponible_mo": mo("MemAvailable"), "libre_mo": mo("MemFree"), "swap_total_mo": mo("SwapTotal"),
            "swap_libre_mo": mo("SwapFree"), "pression": _lire("/proc/pressure/memory") or None,
            "swaps": [" ".join(l.split()[1:4]) for l in _lire("/proc/swaps").splitlines()[1:5]]}

SUIVIS = ("PluginLoader", "steamwebhelper", "steam", "gamescope", "gamescope-wl", "Xwayland", "inputplumber", "hhd", "pipewire", "wireplumber")
def _lire_proc():
    tick, debut, out = os.sysconf("SC_CLK_TCK"), time.clock_gettime(time.CLOCK_BOOTTIME), {}
    for d in pathlib.Path("/proc").iterdir():
        if not d.name.isdigit(): continue
        try:
            nom = (d / "comm").read_text().strip()
            st = (d / "stat").read_text().rsplit(")", 1)[1].split()
            rss = int((d / "statm").read_text().split()[1]) * os.sysconf("SC_PAGE_SIZE") / 1048576
            t = None
            if nom.startswith("steamwebhelper"):
                t = next((a.split(b"=", 1)[1].decode() for a in (d / "cmdline").read_bytes().split(b"\0") if a.startswith(b"--type=")), "principal")
            out[d.name] = (nom, t, int(st[11]) + int(st[12]), rss, round(debut - int(st[19]) / tick))
        except Exception: continue
    return out

def processus(duree=1.0):
    tick = os.sysconf("SC_CLK_TCK"); a = _lire_proc(); time.sleep(duree); b = _lire_proc()
    l = []
    for pid, (nom, t, cpu, rss, age) in b.items():
        if not (nom.startswith(SUIVIS) or rss > 400): continue
        l.append({"nom": nom, **({"type": t} if t else {}), "memoire_mo": round(rss), "processeur_pct": round((cpu - a.get(pid, (0, 0, cpu))[2]) * 100 / (duree * tick)),
                  "processeur_moyen_pct": round(cpu * 100 / tick / age) if age > 0 else None, "age_s": age})
    l.sort(key=lambda x: -x["memoire_mo"])
    groupes = {}
    for x in l:
        g = groupes.setdefault(x["nom"], {"nombre": 0, "memoire_mo": 0, "processeur_pct": 0})
        g["nombre"] += 1; g["memoire_mo"] += x["memoire_mo"]; g["processeur_pct"] += x["processeur_pct"]
    return {"groupes": groupes, "detail": l[:30]}

OOM = re.compile(r"Out of memory|oom-kill|Killed process|oom_reaper|invoked oom-killer|systemd-oomd.*Killed")
def oom():
    j = lambda *a: _commande(["journalctl", *a, "--no-pager", "-o", "short-iso"], 6).splitlines()
    return {"ce_demarrage": [l for l in j("-k", "-b", "0", "-n", "5000") + j("-u", "systemd-oomd", "-b", "0", "-n", "300") if OOM.search(l)][-30:],
            "demarrage_precedent": [l for l in j("-k", "-b", "-1", "-n", "5000") + j("-u", "systemd-oomd", "-b", "-1", "-n", "300") if OOM.search(l)][-20:]}

SERVICES = re.compile(r"(?i)input|plumb|hhd|handheld|powerbutton|plugin_loader|gamescope|bluetooth|NetworkManager|iwd|wpa|tlp|power-profiles|tuned|jupiter|steamos|oomd|zram")
def services():
    l = lambda etat: [x.split()[0] for x in _commande(["systemctl", "list-units", "--type=service", f"--state={etat}", "--no-legend", "--plain", "--no-pager"]).splitlines() if x.strip()]
    return {"actifs": [x for x in l("running") if SERVICES.search(x)][:40], "en_echec": l("failed")[:20]}

def peripheriques_entree():
    r = []
    for bloc in _lire("/proc/bus/input/devices").split("\n\n"):
        nom = re.search(r'^N: Name="(.*)"', bloc, re.M); i = re.search(r"^I: Bus=(\w+) Vendor=(\w+) Product=(\w+)", bloc, re.M)
        if nom: r.append({"nom": nom[1], **({"bus": i[1], "vendor": i[2], "product": i[3]} if i else {})})
    return r[:60]

ATOMES_GAMESCOPE = ("GAMESCOPE_FOCUSED_APP", "GAMESCOPE_FOCUSED_APP_GFX", "GAMESCOPE_FOCUSABLE_APPS", "GAMESCOPE_FOCUSED_WINDOW",
                    "GAMESCOPE_FOCUSABLE_WINDOWS", "GAMESCOPE_VRR_ENABLED", "GAMESCOPE_VRR_FEEDBACK", "GAMESCOPE_DISPLAY_REFRESH_RATE_FEEDBACK",
                    "GAMESCOPE_FPS_LIMIT", "GAMESCOPE_DISPLAY_IS_EXTERNAL", "STEAM_INPUT_FOCUS")
def _env_x():
    for d in pathlib.Path("/proc").iterdir():
        if d.name.isdigit() and _lire(d / "comm") == "steam":
            try: env = dict(x.split("=", 1) for x in (d / "environ").read_bytes().decode("utf8", "replace").split("\0") if "=" in x)
            except Exception: continue
            return {k: env[k] for k in ("XAUTHORITY",) if k in env}
    return {}

def gamescope():
    r, env = {}, _env_x()
    for x in sorted(pathlib.Path("/tmp/.X11-unix").glob("X*"))[:4]:
        e = {**os.environ, **env, "DISPLAY": ":" + x.name[1:]}
        t = _commande(["xprop", "-root", *ATOMES_GAMESCOPE], 2, env=e)
        v = dict(re.findall(r"^(\w+)\(\w+\) = (.*)$", t, re.M))
        if v: r[e["DISPLAY"]] = v
    return r or INCONNU

def wifi():
    cartes = {d.parent.name: {"pilote": os.path.basename(os.path.realpath(d.parent / "device/driver")), "etat": _lire(d.parent / "operstate"),
                              "economie": _commande(["iw", "dev", d.parent.name, "get", "power_save"], 2).strip() or None}
              for d in pathlib.Path("/sys/class/net").glob("*/wireless")}
    lien = [l for l in _commande(["nmcli", "-t", "-f", "IN-USE,SIGNAL,RATE,CHAN,FREQ,SECURITY", "dev", "wifi", "list", "--rescan", "no"], 4).splitlines() if l.startswith("*")]
    return {"cartes": cartes, "lien": lien[0][2:] if lien else None,
            "appareils": [l for l in _commande(["nmcli", "-t", "-f", "TYPE,STATE", "device"], 3).splitlines() if l][:10]}

def batterie():
    r = {}
    for d in pathlib.Path("/sys/class/power_supply").glob("*"):
        v = {k: _lire(d / k) for k in ("type", "status", "capacity", "online", "power_now", "current_now", "voltage_now", "energy_full", "energy_full_design", "charge_full", "charge_full_design", "cycle_count") if (d / k).exists()}
        if v: r[d.name] = v
    return r

OUTIL_UNIF = re.compile(r"(?:^|\s)([a-z]+:[a-z-]+-(?:auth|store)(?:-temp)?)(?:-\d{10,})?(?=\s|$)", re.I)   
def unifideck(maison):
    m, r, fichiers = pathlib.Path(maison), {}, {}
    p = m / "homebrew/plugins/Unifideck"
    if not p.is_dir(): return {"installe": False}, {}
    try: r["version"] = json.loads(_lire(p / "package.json")).get("version")
    except ValueError: r["version"] = None
    journaux = sorted(m.glob("homebrew/logs/Unifideck/*.log"), key=lambda f: f.stat().st_mtime)
    if journaux: fichiers["unifideck.log"] = "\n".join(_lire(journaux[-1]).splitlines()[-200:])
    d = m / ".local/share/unifideck"
    ev = []
    for l in _lire(d / "launcher_events.jsonl").splitlines()[-40:]:
        try: e = json.loads(l); k = e.get("kwargs") or {}
        except ValueError: continue
        ev.append({"quand": datetime.datetime.fromtimestamp(e.get("ts") or 0).isoformat(timespec="seconds"), "evenement": e.get("event"),
                   "etape": k.get("i18n_key"), "jeu": k.get("game_title"), "gravite": k.get("severity")})
    r["etapes_lancement"] = ev
    lancements = sorted(d.glob("launches/*.log"), key=lambda f: f.stat().st_mtime)
    r["lancements"] = [{"fichier": f.name, "taille_ko": round(f.stat().st_size / 1024), "quand": datetime.datetime.fromtimestamp(f.stat().st_mtime).isoformat(timespec="seconds")} for f in lancements[-6:]]
    for f in lancements[-2:]: fichiers["unifideck-lancement-" + f.name] = "\n".join(_lire(f).splitlines()[-120:])   
    try: q = json.loads(_lire(d / "download_queue.json") or "{}")
    except ValueError: q = {}
    r["file_telechargement"] = {k: len(v) if isinstance(v, list) else bool(v) for k, v in q.items()} if isinstance(q, dict) else len(q) if isinstance(q, list) else None
    raccourcis = []
    for f in m.glob(".local/share/Steam/userdata/*/config/shortcuts.vdf"):
        try: b = f.read_bytes()[:4 << 20]
        except OSError: continue
        exes = re.findall(rb"\x01(?i:exe)\x00([^\x00]*)\x00", b); opts = [o.decode(errors="replace") for o in re.findall(rb"\x01(?i:launchoptions)\x00([^\x00]*)\x00", b)]
        raccourcis.append({"raccourcis": len(re.findall(rb"\x01(?i:appname)\x00", b)), "par_unifideck": sum(b"unifideck" in e.lower() for e in exes),
                           "par_boutique": dict(collections.Counter(o.split(":", 1)[0] for o in opts if re.match(r"^[a-z]+:\S+$", o.strip()))),
                           "outils": sorted({mo[1] for o in opts for mo in OUTIL_UNIF.finditer(o)})})
    r["raccourcis_steam"] = raccourcis
    return r, fichiers

INCONNU = "inconnu"
LIMITE_CONNEXION = 80
JOURNAUX_CONNEXION = ("connection_log.txt", "bootstrap_log.txt", "content_log.txt")
DATE_JOURNAL = re.compile(r"(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:[.,](\d+))?")
MOTIFS_CONNEXION = re.compile(r"connect|network|offline|online|logon|logged|login|timeout|DNS|socket|session|startup", re.I)

def puissance(racine="/"):
    r = pathlib.Path(racine)
    valeurs = {}
    for motif in ("sys/class/drm/card*/device/power_dpm_force_performance_level",
                  "sys/class/drm/card*/device/hwmon/hwmon*/power1_cap",
                  "sys/class/hwmon/hwmon*/power1_cap",
                  "sys/firmware/acpi/platform_profile",
                  "sys/devices/system/cpu/cpu0/cpufreq/energy_performance_preference"):
        for f in sorted(r.glob(motif)):
            v = _lire(f)
            if not v: continue
            if f.name == "power1_cap":
                try: v = {"limite_w": int(v) / 1000000, "capteur": _lire(f.parent / "name") or INCONNU}
                except ValueError: continue
            valeurs[str(f.relative_to(r))] = v
    return valeurs or {"etat": INCONNU}

def reseau(racine="/"):
    r = pathlib.Path(racine)
    radios = [d for d in (r / "sys/class/rfkill").glob("*") if _lire(d / "type") == "wlan"]
    blocages = [(_lire(d / "soft"), _lire(d / "hard")) for d in radios]
    bloque = any("1" in b for b in blocages)
    wifi = list((r / "sys/class/net").glob("*/wireless"))
    carriers = [_lire(d.parent / "carrier") for d in wifi]
    routes = _lire(r / "proc/net/route")
    route6 = _lire(r / "proc/net/ipv6_route")
    defaut = any(len(c := l.split()) > 3 and c[1] == "00000000" and int(c[3], 16) & 1 for l in routes.splitlines()[1:] if re.match(r"^\S+\s+[0-9A-Fa-f]{8}\s+[0-9A-Fa-f]{8}\s+[0-9A-Fa-f]+", l))
    defaut |= any(len(c := l.split()) >= 10 and c[0] == "0" * 32 and c[1] == "00" and int(c[8], 16) & 1 for l in route6.splitlines() if re.match(r"^[0-9a-fA-F ]+\S+$", l))
    dns = bool(re.search(r"^\s*nameserver\s+\S+", _lire(r / "etc/resolv.conf"), re.M))
    return {"radio_wifi_bloquee": bloque if blocages and all(x in ("0", "1") for b in blocages for x in b) else INCONNU,
            "mode_avion": "blocage radio détecté (matériel ou logiciel)" if bloque else INCONNU,
            "wifi_allume": not bloque if blocages and all(x in ("0", "1") for b in blocages for x in b) else INCONNU,
            "wifi_connecte": "1" in carriers if carriers and all(c in ("0", "1") for c in carriers) else INCONNU,
            "route_defaut": bool(defaut) if routes or route6 else INCONNU,
            "dns": "configuré, résolution non vérifiée" if dns and defaut else "configuration ou route absente" if routes or route6 else INCONNU}

def _date_journal(ligne):
    m = DATE_JOURNAL.search(ligne)
    if not m: return None
    try: return datetime.datetime.fromisoformat(m[1] + "T" + m[2] + ("." + m[3] if m[3] else ""))
    except ValueError: return None

def connexion_steam(maison):
    fichiers, debuts = {}, []
    for base in (".local/share/Steam/logs", ".steam/steam/logs"):
        for n in JOURNAUX_CONNEXION:
            if n in fichiers: continue
            lignes = _lire(pathlib.Path(maison, base, n)).splitlines()
            if not lignes: continue
            fichiers[n] = lignes
            debuts += [d for l in lignes if re.search(r"Log session started|Startup - updater built", l, re.I) and (d := _date_journal(l))]
    debut = max(debuts, default=None)
    retenus = {}
    if debut:
        for n, lignes in fichiers.items():
            date = None
            for l in lignes:
                date = _date_journal(l) or date
                if date and date >= debut and MOTIFS_CONNEXION.search(l): retenus.setdefault(n, []).append(l)
    reste, sortie = LIMITE_CONNEXION, {}
    for n, lignes in retenus.items():
        sortie[n] = "\n".join(lignes[-reste:]) if reste else ""
        reste -= min(reste, len(lignes))
    return debut, sortie

def demarrage(debut, greffon, decky):
    reperes = [("Steam lancé", None), ("connexion de Steam prête", r"connexion Steam : prête"),
               ("Decky prêt", r"SteamU : entrée Decky"),
               ("SteamU chargé", r"greffon →.*(?:Big Picture|SP).*console"),
               ("accueil affiché", r"accueil affiché")]
    lignes = (greffon + "\n" + decky).splitlines()
    sources = {"Steam lancé": "début de session du journal Steam (repère indirect)",
               "connexion de Steam prête": "journal SteamU, état de connexion de l’interface",
               "Decky prêt": "entrée du greffon SteamU dans Decky (repère indirect)",
               "SteamU chargé": "journal de pose des scripts dans la fenêtre principale",
               "accueil affiché": "première image demandée après construction de l’accueil"}
    resultat, precedent = {}, None
    for nom, motif in reperes:
        dates = [d for l in lignes if motif and re.search(motif, l) and (d := _date_journal(l.split("accueil affiché", 1)[-1] if nom == "accueil affiché" else l)) and debut and d >= debut]
        date = debut if motif is None else min(dates, default=None)
        resultat[nom] = {"instant": date.isoformat() if date else INCONNU, "source": sources[nom],
                         "depuis_precedent_s": (date - precedent).total_seconds() if date and precedent and date >= precedent else INCONNU}
        precedent = date
    return resultat

GARDES_PLANTAGE = 3   

def apercu_home():
    import sys
    a = sys.modules.get("apercu")
    return {"mode": a._etat.get("mode"), "dernier_echec": a._etat.get("echec"), "serveur": bool(a._etat.get("serveur"))} if a else INCONNU

def _borne(nom, f, *a):
    try: return f(*a)
    except Exception as e: return {"erreur": f"{nom} : {type(e).__name__}"}

LIMITE_FICHIER = 256 * 1024   

def rapport(maison, dossier_greffon, journaux, secours, etat_scripts, debogueur, local, maintenant=None, imports=None, court=False, classes=None,
            dossier=None, mesure=True):
    maintenant = maintenant or datetime.datetime.now()
    sortie = pathlib.Path(dossier) if dossier else telechargements(maison)
    sortie.mkdir(parents=True, exist_ok=True)
    perf = None if court or not mesure else performance(debogueur, local, sortie / maintenant.strftime("steamu-performance-%Y%m%d-%H%M.json"))
    infos, fenetres = ({}, {}) if court else steam(debogueur, local)
    secrets = secrets_locaux(maison) + list(infos.pop("secrets", None) or [])
    try: version = json.loads(_lire(pathlib.Path(dossier_greffon, "package.json"))).get("version")
    except Exception: version = None
    donnees = {"rapport": "SteamU, rapport de diagnostic", "date": maintenant.isoformat(timespec="seconds"),
               "steamu": version, "decky": _lire(pathlib.Path(maison, "homebrew/services/.loader.version")) or None,
               **systeme(), "steam": infos, "secours": {"pause": secours.pause, "historique": secours.historique},
               "classes_introuvables": classes,
               "scripts_poses": {k: dict(v) for k, v in list(etat_scripts.items())}, "fenetres": fenetres, "greffons_decky": greffons(maison),
               "conflits": {} if court else conflits.conflits(maison, debogueur, local, _evaluer), "performance": perf, "imports": imports,
               "session": session(),
               "memoire": _borne("memoire", memoire), "processus": _borne("processus", processus), "oom": _borne("oom", oom),
               "services": _borne("services", services), "peripheriques_entree": _borne("entrees", peripheriques_entree),
               "gamescope": _borne("gamescope", gamescope), "wifi": _borne("wifi", wifi), "batterie": _borne("batterie", batterie),
               "apercu_home": _borne("apercu", apercu_home)}
    unif, fichiers_unif = _borne("unifideck", unifideck, maison), {}
    if isinstance(unif, tuple): unif, fichiers_unif = unif
    donnees["unifideck"] = unif
    debut, connexion = connexion_steam(maison)
    logs = sorted(pathlib.Path(journaux).glob("*.log"), key=lambda f: f.stat().st_mtime)[-3:]
    decky_log = journal_decky(maison)
    donnees.update(puissance={"systeme": puissance(), "steam": infos.get("puissance", INCONNU),
                              "economie_steamu": next((f["economie_steamu"] for f in fenetres.values() if f and f.get("economie_steamu") is not None), INCONNU)},
                   reseau={**reseau(), "steam": infos.get("reseau", INCONNU)},
                   demarrage=demarrage(debut, "\n".join(_lire(j) for j in logs), decky_log),
                   connexion_steam={"lignes": sum(len(t.splitlines()) for t in connexion.values()), "etat": "dernier démarrage" if debut else INCONNU},
                   erreurs_greffons=erreurs_greffons(decky_log))
    nom = maintenant.strftime("steamu-plantage-%Y%m%d-%H%M.zip" if court else "steamu-diagnostic-%Y%m%d-%H%M.zip")
    cible = sortie / nom
    tmp = cible.with_name("." + nom + ".tmp")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        ecrire = lambda n, t, borne=True: z.writestr(caviarder(n, secrets), caviarder(t[-LIMITE_FICHIER:] if borne else t, secrets))
        ecrire("rapport.json", json.dumps(donnees, ensure_ascii=False, indent=1), False)   
        for j in logs: ecrire("journaux/" + j.name, _lire(j))
        for n, t in journaux_steam(maison).items(): ecrire("journaux-steam/" + n, t)
        for n, t in connexion.items(): ecrire("connexion-steam/" + n, t)
        ecrire("journaux/decky.log", decky_log)
        for n, t in fichiers_unif.items(): ecrire("unifideck/" + n, t)
    os.replace(tmp, cible)
    if court:   
        for vieux in sorted(cible.parent.glob("steamu-plantage-*.zip"), key=lambda f: f.stat().st_mtime)[:-GARDES_PLANTAGE]: vieux.unlink(missing_ok=True)
    if os.geteuid() == 0:   
        st = os.stat(cible.parent); os.chown(cible, st.st_uid, st.st_gid)
    return nom, resume_github(donnees, secrets)

if __name__ == "__main__":
    import sys, types
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    sortie_cli = sys.argv[1] if len(sys.argv) > 1 else "."
    maison_cli = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser("~")
    def local_cli(url):
        if not str(url).startswith(("ws://127.0.0.1", "ws://localhost")): raise ValueError("débogueur hors de la machine refusé")
        return url
    greffon_cli = os.path.join(maison_cli, "homebrew/plugins/steamu")
    nom_cli, _ = rapport(maison_cli, greffon_cli, os.path.join(maison_cli, "homebrew/logs/steamu"), types.SimpleNamespace(pause=None, historique=[]), {},
                         "http://127.0.0.1:8080/json", local_cli, dossier=sortie_cli, mesure=False)
    print(os.path.join(sortie_cli, nom_cli))
