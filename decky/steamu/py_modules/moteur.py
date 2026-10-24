import hashlib, json, os, pathlib, re, subprocess, sys, time, urllib.parse, urllib.request
import websocket

arreter = False
DEBOGUEUR = "http://127.0.0.1:8080/json"
def _nom():
    try: return os.environ.get("DECKY_PLUGIN_NAME") or json.loads((pathlib.Path(__file__).resolve().parents[1] / "plugin.json").read_text())["name"]
    except Exception: return ""
NOM = _nom()
def _donnees():
    d, maison = os.environ.get("DECKY_PLUGIN_RUNTIME_DIR", ""), os.environ.get("DECKY_USER_HOME", "")
    return "~/" + os.path.relpath(d, maison) if d and maison and d.startswith(maison.rstrip("/") + "/") else d
GREFFON_JS = "window.__pcvGreffon = " + json.dumps({"nom": NOM, "donnees": _donnees()}, ensure_ascii=False)
ANCIEN_NOM, ANCIEN_DOSSIER = "Premium Clear View", "premium-clear-view"
SCRIPTS_PRINCIPALE = ["secours.js", "icones.js", "i18n.js", "steam-bridge.js", "apparence.js", "barre-haut.js", "bibliotheque.js", "alimentation.js", "accueil.js", "vendor/three.min.js", "vendor/three-gltf.js", "mii3d.js", "vrais-mii.js", "garde-robe.js", "sons.js", "nintendo.js", "credits.js", "steamu.js", "mii-base.js", "vendor/qrcodegen.js", "mii-qr.js", "mii-maker.js", "themes.js", "themeplaza.js", "themezer.js", "led.js", "console.js", "mii-accueil.js", "arcade.js", "luigi-vrai.js", "luigi-wonder.js", "casino.js", "casino-jeux.js", "deco.js", "dossiers.js", "perso.js", "fiche.js", "place.js", "place3d.js", "profil.js", "amis.js", "notifs.js", "medias.js", "recherche.js", "collections.js", "connexion.js"]
SCRIPTS_MENU = ["secours.js", "icones.js", "i18n.js", "steam-bridge.js", "menu-pont.js", "menus-commun.js", "menu-home.js"]
SCRIPTS_ACCES = ["secours.js", "icones.js", "i18n.js", "steam-bridge.js", "menus-commun.js", "acces-rapide.js"]   
SCRIPTS_BULLES = ["secours.js", "apparence-suivre.js"]   
VENDOR_JS = "if (!(window.__pcvVendor || {})[%s]) {\n%s\n;(window.__pcvVendor ||= {})[%s] = 1; }"
if os.environ.get("PCV_SANS_CONNEXION"): SCRIPTS_PRINCIPALE.remove("connexion.js")   

AVANT_CONNEXION_JS = r"""(() => { try {
  const s = window.SteamUIStore?.WindowStore?.GamepadUIMainWindowInstance;
  if (typeof s?.BViewingPreLoginRoute !== 'function') return null;
  const avant = s.BViewingPreLoginRoute();
  return typeof avant === 'boolean' ? avant : null;
} catch (e) { return null; } })()"""

CARTE_JS = r"""(() => { const chunk = window.webpackChunksteamui; if (!chunk) return null;
  let req; chunk.push([[Symbol()], {}, r => { req = r; }]); const out = {};
  const classe = v => typeof v === 'string' && /^[_a-zA-Z0-9-]{15,}( [_a-zA-Z0-9-]+)*$/.test(v) && /[A-Z]/.test(v) && /[a-z]/.test(v);
  for (const id of Object.keys(req.m)) {
    // Lire les exports déjà chargés ; sinon, ne charger que les candidats qui contiennent plusieurs classes CSS.
    // Appeler tous les modules de Steam au démarrage exécutait aussi ses services et leurs effets de bord.
    let m = req.c?.[id]?.exports;
    if (!m) { const textes = String(req.m[id]).matchAll(/["']([_a-zA-Z0-9-]{15,}(?: [_a-zA-Z0-9-]+)*)["']/g);
      let n = 0; for (const x of textes) if (classe(x[1]) && ++n >= 2) break;
      if (n < 2) continue;
      try { m = req(id); } catch (e) { continue; } }
    let vals; try { if (m && m.default && typeof m.default === 'object') m = m.default;
      if (!m || typeof m !== 'object') continue; vals = Object.entries(m); } catch (e) { continue; }
    const cl = vals.filter(([k, v]) => classe(v));
    if (cl.length < 2 || cl.length < vals.length * .5) continue; out[id] = Object.fromEntries(cl); }
  return out; })()"""

def _journal(*a): print(time.strftime("%H:%M:%S"), *a, flush=True)

connexions = {}   

def fermer(ident):
    c = connexions.pop(ident, None)
    if c:
        try: c[0].close()
        except Exception: pass

def local(url):
    u = urllib.parse.urlsplit(url or "")
    if u.scheme != "ws" or u.hostname not in ("127.0.0.1", "localhost"): raise ValueError("débogueur hors de la machine refusé : " + str(url)[:60])
    return url

def evaluer(cible, code, attendre=False, erreur=False):
    for neuve in (cible["id"] not in connexions, True):
        if neuve:
            fermer(cible["id"])
            connexions[cible["id"]] = [websocket.create_connection(local(cible["webSocketDebuggerUrl"]), suppress_origin=True, timeout=10), 0]
        c = connexions[cible["id"]]; c[1] += 1
        try:
            c[0].send(json.dumps({"id": c[1], "method": "Runtime.evaluate", "params": {"expression": code, "returnByValue": True, "awaitPromise": attendre}}))
            while (r := json.loads(c[0].recv())).get("id") != c[1]: pass
            res = r.get("result", {})
            if not erreur: return res.get("result", {}).get("value")
            ex = res.get("exceptionDetails")
            return res.get("result", {}).get("value"), ex and str((ex.get("exception") or {}).get("description") or ex.get("text"))[:300]
        except Exception as e:
            fermer(cible["id"])
            if neuve or isinstance(e, websocket.WebSocketTimeoutException): raise

CLASSE = re.compile(r"[_a-zA-Z0-9-]{1,200}")

def compiler(texte, modules):
    def classe(m):
        nom, voisin = m.group(1), m.group(2)
        cands = [v for v in modules.values() if isinstance(v, dict) and isinstance(v.get(nom), str) and voisin in v and CLASSE.fullmatch((v[nom].split() or [""])[0])]
        if not cands: return f".pcv-introuvable-{nom}"          
        classes = sorted({"." + c[nom].split()[0] for c in cands})
        return classes[0] if len(classes) == 1 else ":is(" + ", ".join(classes) + ")"
    return re.sub(r"\{\{(\w+)@(\w+)\}\}", classe, texte)

def poser_style(ident, css, version):
    return f"""(() => {{ let s = document.getElementById({json.dumps(ident)}); if (s && s.dataset.v === {json.dumps(version)}) return 0;
      if (!s) {{ s = document.createElement('style'); s.id = {json.dumps(ident)}; (document.head || document.documentElement).appendChild(s); }}
      s.textContent = {json.dumps(css)}; s.dataset.v = {json.dumps(version)}; return 1; }})()"""

def deja(cible, ident):
    return evaluer(cible, f"(s => [s ? s.dataset.v ?? '' : null, window.__pcvScripts ?? null])(document.getElementById({json.dumps(ident)}))") or [None, None]

memo = {}   

def preparer(f, faire, cle=None):
    st = f.stat(); empreinte = (st.st_mtime_ns, st.st_size, cle)   
    if memo.get(f, (None,))[0] != empreinte:
        contenu = faire(f.read_text()); memo[f] = (empreinte, contenu, hashlib.sha1(contenu.encode()).hexdigest()[:12])
    return memo[f][1:]

VOILE_JS = """(() => { const css = __CSS__, v = __V__; window.__pcvVoile = performance.now();
  const attente = location.protocol === 'data:';   /* l'onglet vide que Steam montre avant la boutique */
  if (!attente && !/steampowered\\.com|steamcommunity\\.com/.test(location.hostname)) return;
  if (document.getElementById('pcv-voile')) return;
  /* tant que html n'a pas data-pcv-pret : la page est cachée, un fond nacré et l'indicateur tournant la couvrent (tout en CSS :
     rien que la page puisse retirer) */
  const spin = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><circle cx="36" cy="36" r="34" fill="#fff"/><circle cx="36" cy="36" r="16" fill="none" stroke="#d6eefc" stroke-width="5"/><path d="M36 20a16 16 0 0 1 16 16" fill="none" stroke="#1a9ae6" stroke-width="5" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 36 36" to="360 36 36" dur=".8s" repeatCount="indefinite"/></path></svg>');
  const pre = document.createElement('style'); pre.id = 'pcv-voile';
  pre.textContent = `html:not([data-pcv-pret]) { background: #eef2f7 !important; }
    html:not([data-pcv-pret]) body { visibility: hidden !important; }
    html:not([data-pcv-pret])::before { content: ""; position: fixed; inset: 0; z-index: 2147483647; visibility: visible;
      background: url("${spin}") center / 72px no-repeat, repeating-linear-gradient(0deg, #f7f9fc 0 2px, #eef2f7 2px 4px); }`;
  const poser = () => { let s = document.getElementById('pcv-boutique'); if (!s) { s = document.createElement('style'); s.id = 'pcv-boutique'; }
    s.textContent = css; s.dataset.v = v; (document.head || document.documentElement).appendChild(s); };
  /* le script passe avant que la page ait sa balise <html> : on pose voile et thème dès qu'elle apparaît */
  const debut = () => { document.documentElement.appendChild(pre); poser(); };
  if (document.documentElement) debut();
  else new MutationObserver((m, o) => { if (document.documentElement) { o.disconnect(); debut(); } }).observe(document, { childList: true });
  if (attente) return;
  /* les feuilles de la boutique arrivent parfois après la nôtre : la nôtre repasse toujours en dernier */
  const garder = () => { const h = document.head; if (!h) return; const s = document.getElementById('pcv-boutique');
    if (s && h.lastElementChild !== s) h.appendChild(s); };
  document.addEventListener('DOMContentLoaded', () => { poser(); new MutationObserver(garder).observe(document.head, { childList: true }); });
  let fait = false; const pret = () => { if (fait) return; fait = true; poser(); document.documentElement.setAttribute('data-pcv-pret', ''); };
  /* la boutique réarrange sa page par script après le premier affichage : le voile attend la fin du chargement */
  window.addEventListener('load', () => setTimeout(pret, 900)); setTimeout(pret, 5500);
})()"""
abonnes = {}   

def abonner(cible, css, version):
    import threading
    ancien = abonnes.get(cible["id"])
    if ancien and ancien[1] == version and ancien[0].connected: return False
    if ancien:
        try: ancien[0].close()
        except Exception: pass
    ws = websocket.create_connection(local(cible["webSocketDebuggerUrl"]), suppress_origin=True, timeout=10)
    ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
    ws.send(json.dumps({"id": 2, "method": "Page.addScriptToEvaluateOnNewDocument", "params": {"source": VOILE_JS.replace("__CSS__", json.dumps(css)).replace("__V__", json.dumps(version))}}))
    def vider():
        try:
            while ws.connected: ws.recv()
        except Exception: pass
    threading.Thread(target=vider, daemon=True).start()
    abonnes[cible["id"]] = (ws, version)
    return True

def nettoyer(ids):
    for i in [i for i in abonnes if i not in ids]:
        try: abonnes[i][0].close()
        except Exception: pass
        del abonnes[i]
    for i in [i for i in connexions if i not in ids]: fermer(i)

def desabonner(ident):
    a = abonnes.pop(ident, None)
    if a:
        try: a[0].close()
        except Exception: pass

NETTOYER_BOUTIQUE_JS = "(() => { let n = 0; for (const id of ['pcv-boutique', 'pcv-voile']) { const e = document.getElementById(id); if (e) { e.remove(); n++; } } return n; })()"

ETAT_JEU_JS = r"""(() => { try { const W = SteamUIStore.WindowStore.GamepadUIMainWindowInstance;
  return { appid: SteamUIStore.MainRunningApp?.appid || 0, ouvert: W.MenuStore.m_eOpenSideMenu || 0, focus: FocusedAppWindowStore.GetFocusedAppID() }; } catch (e) { return null; } })()"""

def _ps(*args):
    env = {**os.environ, "LD_LIBRARY_PATH": ""}
    return subprocess.run(list(args), capture_output=True, text=True, timeout=2, env=env).stdout.split()

def garde_pause(etat, journal):
    if not etat or not etat.get("appid") or etat.get("ouvert") or etat.get("focus") != etat["appid"]: return False
    reaper = _ps("pgrep", "--full", "--oldest", rf"/reaper\s.*\bAppId={int(etat['appid'])}\b")
    if not reaper: return False
    enfants, file = [], [reaper[0]]
    while file:
        nouveaux = _ps("ps", "--ppid", file.pop(0), "-o", "pid="); enfants += nouveaux; file += nouveaux
    etats = _ps("ps", "--ppid", reaper[0], "-o", "stat=")   
    if not enfants or not etats or not etats[0].startswith("T"): return False
    subprocess.run(["kill", "-SIGCONT", *enfants], timeout=2, env={**os.environ, "LD_LIBRARY_PATH": ""})
    journal("garde de la pause : jeu", etat["appid"], "figé sans menu ouvert, repris")
    return True

SECOURS_N, SECOURS_APRES, SECOURS_FENETRE = 3, 180, 600
TEXTES_SECOURS = {
    "securite": {"fr": ("SteamU en pause", "Steam a planté plusieurs fois : son interface d'origine est rétablie. Pour relancer SteamU : Decky › {nom}."),
                 "en": ("SteamU paused", "Steam crashed several times: its original interface is back. To resume SteamU: Decky › {nom}."),
                 "es": ("SteamU en pausa", "Steam se cerró varias veces: vuelve su interfaz original. Para reanudar SteamU: Decky › {nom}.")},
    "urgence": {"fr": ("SteamU arrêté", "Interface d'origine de Steam jusqu'au prochain redémarrage. Pour relancer SteamU : Decky › {nom}."),
                "en": ("SteamU stopped", "Original Steam interface until the next restart. To resume SteamU: Decky › {nom}."),
                "es": ("SteamU detenido", "Interfaz original de Steam hasta el próximo reinicio. Para reanudar SteamU: Decky › {nom}.")},
    "ancien": {"fr": ("SteamU attend", "Retire l'ancien greffon {ancien} de Decky pour terminer le passage à SteamU."),
               "en": ("SteamU is waiting", "Remove the old {ancien} plugin from Decky to finish the switch to SteamU."),
               "es": ("SteamU en espera", "Quita el antiguo complemento {ancien} de Decky para terminar el cambio a SteamU.")}}

def textes(pause):
    return {l: (titre, texte.format(nom=NOM, ancien=ANCIEN_NOM)) for l, (titre, texte) in TEXTES_SECOURS[pause].items()}

def annonce_js(pause):
    return """(() => { const t = window.DeckyPluginLoader?.toaster; if (!t?.toast) return false;
      const l = String(window.LocalizationManager?.m_rgLocalesToUse?.[0] || navigator.language || "en").toLowerCase();
      const [title, body] = %s[l.startsWith("fr") ? "fr" : l.startsWith("es") ? "es" : "en"];
      t.toast({ title, body, duration: 20000 }); return true; })()""" % json.dumps(textes(pause), ensure_ascii=False)

ANCIEN_ATTENTE = 60
_ancien, _debut = [0, False], time.time()   
def ancien_actif(tous_les=5):
    if time.time() - _ancien[0] >= tous_les:
        try: _ancien[1] = bool(_ps("pgrep", "--full", "^" + ANCIEN_NOM + r" \("))
        except Exception: _ancien[1] = False
        if not _ancien[1] and time.time() - _debut < ANCIEN_ATTENTE and os.environ.get("DECKY_PLUGIN_DIR"):
            _ancien[1] = (pathlib.Path(os.environ["DECKY_PLUGIN_DIR"]).parent / ANCIEN_DOSSIER / "plugin.json").exists()
        _ancien[0] = time.time()
    return _ancien[1]

class Secours:
    def __init__(self, fichier=None, horloge=time.time):
        self.fichier, self.horloge = fichier, horloge
        self.pause, self.historique, self.chutes = None, [], []
        self.ctx = self.pose = self.vu = self.voulu = self.annonce = self.echec_ctx = None
        self.fenetres = {}   
        try:
            d = json.loads(pathlib.Path(fichier).read_text())
            if d.get("pause") in ("securite", "manuel"): self.pause = d["pause"]
            self.historique = list(d.get("historique") or [])[-50:]
        except Exception: pass

    def noter(self, quoi, detail=""):
        self.historique = (self.historique + [[round(self.horloge()), quoi, detail]])[-50:]
        if not self.fichier: return
        try:
            f = pathlib.Path(self.fichier); f.parent.mkdir(parents=True, exist_ok=True); tmp = f.with_suffix(".tmp")
            tmp.write_text(json.dumps({"pause": self.pause if self.pause in ("securite", "manuel") else None, "historique": self.historique}, ensure_ascii=False))
            os.replace(tmp, f)
        except Exception: pass

    def contexte(self, ident):
        if not ident: return
        t = self.horloge()
        if ident == self.ctx: self.vu = t; return
        ancien, pose, vu = self.ctx, self.pose, self.vu
        self.ctx, self.pose, self.vu = ident, None, t
        self.fenetres = {}   
        if ancien is None: return                                    
        if ancien == self.voulu: self.voulu = None; return           
        if self.pause == "urgence": self.pause = None; self.noter("reprise", "Steam redémarré après l'arrêt d'urgence"); return
        if pose is not None and vu - pose < SECOURS_APRES and ancien != self.echec_ctx:   
            self.chute(f"interface rechargée {round(vu - pose)} s après la pose")

    def sans_decky(self, ctx, decky_la, attente=45, essais=2):
        t = self.horloge()
        if decky_la or not ctx: self.decky_ctx = None; return False
        if getattr(self, "decky_ctx", None) != ctx: self.decky_ctx, self.decky_t = ctx, t; return False
        if t - self.decky_t < attente or getattr(self, "decky_essais", 0) >= essais: return False
        self.decky_essais = getattr(self, "decky_essais", 0) + 1; self.decky_t = t; self.voulu = ctx
        return True

    def reposee(self, fenetre, version):
        t, avant = self.horloge(), self.fenetres.get(fenetre)
        self.fenetres[fenetre] = (t, version)
        if avant and avant[1] == version and t - avant[0] < SECOURS_APRES and self.voulu is None:
            self.chute(f"{fenetre} rechargée {round(t - avant[0])} s après la pose")

    def posee(self):
        if self.pose is None: self.pose = self.horloge()

    def echec(self, detail):
        if self.echec_ctx != self.ctx: self.echec_ctx = self.ctx; self.chute("pose en échec : " + detail)

    def chute(self, detail):
        t = self.horloge()
        self.chutes = [c for c in self.chutes if t - c < SECOURS_FENETRE] + [t]
        self.noter("chute", detail)
        if len(self.chutes) >= SECOURS_N and self.pause is None:
            self.pause = "securite"; self.annonce = None
            self.noter("securite", f"{len(self.chutes)} chutes en {round(t - self.chutes[0])} s")
            try: getattr(self, "au_plantage", None) and self.au_plantage()
            except Exception: pass

    def arreter(self, pourquoi):
        self.pause, self.voulu, self.annonce = pourquoi, self.ctx, self.ctx   
        self.noter(pourquoi)

    def reprendre(self):
        self.pause, self.chutes, self.annonce, self.decky_essais = None, [], None, 0
        self.noter("reprise", "panneau Decky")

secours = Secours()            
etat_scripts = {}              

def boucle(DOSSIER, ecrire=None):
    journal = (lambda *a: ecrire(" ".join(map(str, a)))) if ecrire else _journal
    modules, cle_modules, dernier, garder, garde_ctx, ancien_annonce = None, None, None, True, None, None
    connexion = None   
    while not arreter:
        try:
            cibles = json.load(urllib.request.urlopen(DEBOGUEUR, timeout=3))
            partage = next((c for c in cibles if c["title"] == "SharedJSContext"), None)
            principale = any(c.get("type") == "page" and ("Big" in c["title"] or c["title"] == "SP") for c in cibles)
            secours.contexte(partage and partage["id"])
            if ancien_actif():   
                nettoyer(set())
                if partage and principale and ancien_annonce != partage["id"] and evaluer(partage, annonce_js("ancien")):
                    ancien_annonce = partage["id"]; journal("SteamU attend : l'ancien greffon", ANCIEN_NOM, "tourne encore")
                if partage: fermer(partage["id"])
                time.sleep(1); continue
            if secours.pause:   
                nettoyer(set())
                if partage and principale:
                    if secours.annonce != partage["id"] and secours.pause in TEXTES_SECOURS and evaluer(partage, annonce_js(secours.pause)): secours.annonce = partage["id"]
                    if garde_ctx != partage["id"]:
                        garde_ctx = partage["id"]
                        try: garde_pause(evaluer(partage, ETAT_JEU_JS), journal)
                        except Exception as e: journal("garde de la pause manquée :", type(e).__name__)
                    if secours.sans_decky(partage["id"], evaluer(partage, "typeof DeckyPluginLoader === 'object'")):
                        journal("SteamU : Decky absent de l'interface, relance de Steam pour le retrouver")
                        evaluer(partage, "SteamClient.Browser.RestartJSContext()")
                    fermer(partage["id"])
                time.sleep(1); continue
            if not partage or not principale:
                time.sleep(1); continue
            avant_connexion = evaluer(partage, AVANT_CONNEXION_JS)
            etat_connexion = "prête" if avant_connexion is False else "avant connexion" if avant_connexion is True else "signal indisponible"
            if etat_connexion != connexion:
                connexion = etat_connexion; journal("connexion Steam :", connexion)
            if avant_connexion is not False:
                nettoyer({c["id"] for c in cibles}); fermer(partage["id"])
                time.sleep(1); continue
            if partage and principale and partage["id"] != cle_modules:
                carte = evaluer(partage, CARTE_JS); fermer(partage["id"])   
                if carte and len(carte) > 200: modules, cle_modules, garder = carte, partage["id"], True; journal("carte des classes :", len(modules), "modules")
            if modules is None: time.sleep(1); continue
            theme, v_theme = preparer(DOSSIER / "theme-wiiu.src.css", lambda t: compiler(t, modules), cle_modules)
            scripts, versions = {}, []
            for n in dict.fromkeys(SCRIPTS_PRINCIPALE + SCRIPTS_MENU + SCRIPTS_ACCES + SCRIPTS_BULLES):
                if not (DOSSIER / "greffon" / n).exists(): continue
                faire = (lambda t, n=n: VENDOR_JS % (json.dumps(n), t, json.dumps(n))) if n.startswith("vendor/") else (lambda t: compiler(t, modules))
                scripts[n], v = preparer(DOSSIER / "greffon" / n, faire, cle_modules); versions.append(n + ":" + v)
            v_scripts = hashlib.sha1(" ".join(versions).encode()).hexdigest()[:12]
            boutique, v_boutique = preparer(DOSSIER / "boutique.css", lambda t: t) if (DOSSIER / "boutique.css").exists() else ("", "")
            nettoyer({c["id"] for c in cibles})
            for c in cibles:
                if secours.pause or arreter: break
                t, url = c["title"], c.get("url", "")
                if c.get("type") != "page" or t == "SharedJSContext": continue
                if url.startswith("data:text/html"):      
                    if boutique:
                        abonner(c, boutique, v_boutique)
                        if deja(c, "pcv-voile")[0] is None: evaluer(c, VOILE_JS.replace("__CSS__", json.dumps(boutique)).replace("__V__", json.dumps(v_boutique)))
                    else:
                        desabonner(c["id"]); evaluer(c, NETTOYER_BOUTIQUE_JS)
                    continue
                if "steampowered.com" in url or "steamcommunity.com" in url:
                    if boutique:
                        if abonner(c, boutique, v_boutique): journal("boutique (dès le chargement des pages) →", url[:60])
                        if deja(c, "pcv-boutique")[0] != v_boutique and evaluer(c, poser_style("pcv-boutique", boutique, v_boutique)): journal("boutique →", url[:60])
                    else:
                        desabonner(c["id"])
                        if evaluer(c, NETTOYER_BOUTIQUE_JS): journal("boutique : rendue à Steam d'origine →", url[:60])
                    continue
                if not url.startswith("about:blank"): continue
                if not ("Gamepad" in url or "browserviewpopup=1" in url) or t.endswith("_desktop"): continue
                v_page, s_page = deja(c, "theme-clair")
                liste = SCRIPTS_MENU if t.startswith("MainMenu") else SCRIPTS_ACCES if t.startswith("QuickAccess") else SCRIPTS_PRINCIPALE if ("Big" in t or t == "SP") else SCRIPTS_BULLES if t.startswith("notificationtoasts") else []   
                if liste is SCRIPTS_PRINCIPALE and s_page != v_scripts:
                    secours.reposee(t, v_scripts)
                    if secours.pause: break   
                if v_page != v_theme and evaluer(c, poser_style("theme-clair", theme, v_theme)): journal("thème →", t)
                if liste and s_page != v_scripts:
                    secours.posee(); poses = etat_scripts[t] = {}
                    evaluer(c, GREFFON_JS)   
                    try:
                        for n in liste:
                            if secours.pause or arreter: break
                            if n not in scripts: continue
                            poses[n] = evaluer(c, scripts[n], erreur=True)[1] or "ok"
                            if poses[n] != "ok": journal("greffon : erreur à la pose de", n, "→", t, ":", poses[n][:160])
                    except Exception as e:
                        if liste is SCRIPTS_PRINCIPALE: secours.echec(type(e).__name__)
                        raise
                    if secours.pause or arreter: break
                    evaluer(c, f"window.__pcvScripts = {json.dumps(v_scripts)}")
                    journal("greffon →", t, "(" + ", ".join(n for n in liste if n in scripts) + ")")
                    if liste is SCRIPTS_PRINCIPALE: garder = True
            if garder and partage:
                garder = False
                try: garde_pause(evaluer(partage, ETAT_JEU_JS), journal)
                except Exception as e: journal("garde de la pause manquée :", type(e).__name__)
                finally: fermer(partage["id"])
        except Exception as e:
            message = type(e).__name__ + " " + str(e)[:120]
            if message != dernier: journal("tour manqué :", message)
            dernier = message
            time.sleep(1)
            continue
        dernier = None
        time.sleep(0.8)
    for i in list(connexions): fermer(i)

if __name__ == "__main__":
    boucle(pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve())

