(() => {
  const O = window.opener || window;
  const T = (k, v) => window.__pcvT?.(k, v) ?? k;
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
  const son = (s) => window.__pcvSon?.(s);
  const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
  const ic = (n) => window.__pcvIcones?.svg(n, { attrs: 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"' }) || "";
  const SC = () => O.SteamClient || window.SteamClient;
  const appDe = (id) => {
    try {
      return O.appStore.GetAppOverviewByAppID(id);
    } catch (e) {
      return null;
    }
  };
  const GO = 2 ** 30, nombre = (o) => {
    const x = o / GO;
    return (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10).toLocaleString(window.__pcvLocale?.());
  };
  const go = (o) => `${nombre(o)} ${T("stockage.go")}`;
  const pl = (cle, n) => T(n === 1 ? cle + "_1" : cle, { n });
  const IDEES = 4, OUBLIE = 60 * 86400, COLONNES = 4, GROS_BARRE = 9, GROS_JAQ = 6, VISIBLES = 3;
  const TEINTE = { reste: "#a9b4c2", jeux: "#e78f25", outils: "#cfd6df", gris: "#8a96a8", sd: "#8b6cf0", page: "#ff8a1f", vert: "var(--pcv-vert, #2fbf71)" };
  const onglets = () => [
    ["place", "balai", TEINTE.vert],
    ["jeux", "bibliotheque", TEINTE.page],
    ...[true, false].flatMap((fixe) => montes().filter((d) => !!d.bIsFixed === fixe).map((d) => ["disque-" + d.nFolderIndex, fixe ? "disque" : "carte-sd", fixe ? "var(--pcv-cyan-plein)" : TEINTE.sd, d])),
    ["outils", "outil", TEINTE.gris]
  ];
  const TRIS = ["gros", "nom", "ancien"];
  const ORDRE = { gros: (a, b) => b.octets - a.octets, nom: (a, b) => a.nom.localeCompare(b.nom, window.__pcvLocale?.()), ancien: (a, b) => a.joue - b.joue || b.octets - a.octets };
  let disques = [], banc = false;
  let ufListe = [];
  const ufFormes = (id) => {
    const n = Number(id);
    return !Number.isFinite(n) ? [] : n < 0 ? [n, n + 4294967296] : n > 2147483647 ? [n, n - 4294967296] : [n];
  };
  const ufAppel = (m, ...a) => window.__pcvBridge?.callPlugin?.("Unifideck", m, ...a);
  const ufDonnee = (r) => Array.isArray(r) ? r : r && typeof r === "object" && "success" in r && "data" in r ? r.data : r;
  let ufT = 0;
  const lireUF = async (force = false) => {
    if (!window.__pcvBridge?.unifideck || !O.DeckyBackend?.call) {
      ufListe = [];
      return;
    }
    if (!force && Date.now() - ufT < 3e3) return;
    ufT = Date.now();
    try {
      const [gr, ir] = await Promise.all([ufAppel("get_all_unifideck_games"), ufAppel("get_installed_disk_info")]);
      const g = ufDonnee(gr), info = ufDonnee(ir) || {};
      ufListe = (Array.isArray(g) ? g : []).filter((x) => x && x.installed && x.app_id != null && x.store && x.store !== "steam" && !(Array.isArray(x.tags) && x.tags.some((t) => String(t).toLowerCase() === "xcloud"))).map((x) => {
        const f = ufFormes(x.app_id), a = f.map(appDe).find(Boolean), gid = String(x.store_game_id ?? x.id), i = info[`${x.store}:${gid}`] || {};
        return { id: a?.appid ?? f[f.length - 1], appId: x.app_id, store: x.store, gid, titre: String(x.title || x.name || ""), octets: +i.size_bytes || 0, externe: i.location === "external" };
      });
    } catch (e) {
      ufListe = [];
    }
  };
  const ufTous = () => ufListe.flatMap((x) => {
    const d = x.externe ? laSD() : laConsole();
    if (!d) return [];
    const a = appDe(x.id);
    return [{ id: x.id, nom: a?.display_name || x.titre || String(x.id), octets: x.octets, v: {}, d: d.nFolderIndex, outil: false, joue: a?.rt_last_time_played || 0, uf: x }];
  });
  const ufDesinstaller = async (j) => {
    let r;
    try {
      r = await ufAppel("uninstall_game", j.uf.appId, false);
    } catch (e) {
      r = { success: false, error: String(e?.message || e) };
    }
    if (r && (r.success === false || r.error || r.data?.success === false)) {
      S.part?.reste.delete(j.id);
      if (S.part && !S.part.reste.size) S.part = null;
      bulle(T("uf.echec", { e: String(r.error || r.data?.error || "?") }));
    }
    window.__pcvBridge?.unifideck?.charger?.(true);
    ufT = 0;
    lire();
  };
  const lire = async () => {
    if (!banc) try {
      disques = await SC().InstallFolder.GetInstallFolders() || [];
    } catch (e) {
      disques = [];
    }
    if (!suivreDesinstallation() && S.actif) dessiner();
    lireUF().then(() => {
      if (!suivreDesinstallation() && S.actif) dessiner();
    });
  };
  const montes = () => disques.filter((d) => d.bIsMounted);
  const laConsole = () => montes().find((d) => d.bIsFixed && d.bIsDefaultFolder) || montes().find((d) => d.bIsFixed) || montes()[0];
  const laSD = () => montes().find((d) => !d.bIsFixed);
  const ensemble = () => ({ nFolderIndex: null, nCapacity: montes().reduce((n, d) => n + (+d.nCapacity || 0), 0), nFreeSpace: montes().reduce((n, d) => n + (+d.nFreeSpace || 0), 0) });
  const surDisque = (l, d) => d.nFolderIndex == null ? l : l.filter((j) => j.d === d.nFolderIndex);
  const tous = () => montes().flatMap((d) => (d.vecApps || []).map((v) => {
    const a = appDe(v.nAppID);
    return { id: v.nAppID, nom: a?.display_name || v.strAppName || String(v.nAppID), octets: +v.nUsedSize || 0, v, d: d.nFolderIndex, outil: a?.app_type === 4, joue: a?.rt_last_time_played || v.rtLastPlayed || 0 };
  })).concat(ufTous());
  const jeux = () => tous().filter((j) => !j.outil);
  const outils = () => tous().filter((j) => j.outil);
  const somme = (l) => l.reduce((s, j) => s + j.octets, 0);
  const place = (d) => {
    const l = surDisque(tous(), d), cap = +d.nCapacity || 0, libre = +d.nFreeSpace || 0, j = somme(l.filter((x) => !x.outil)), o = somme(l.filter((x) => x.outil));
    return { cap, libre, jeux: j, outils: o, autres: Math.max(0, cap - libre - j - o) };
  };
  const idees = (maintenant = Date.now() / 1e3) => jeux().filter((j) => maintenant - j.joue > OUBLIE).sort(ORDRE.ancien).slice(0, IDEES);
  const trier = (l, tri) => [...l].sort(ORDRE[tri] || ORDRE.gros);
  const nomDisque = (d) => d.strUserLabel || T(d.bIsFixed ? "stockage.onglet.console" : "stockage.onglet.sd");
  const versQui = (d) => d.strUserLabel || T(d.bIsFixed ? "stockage.la_console" : "stockage.la_sd");
  const destinations = (l) => l.some((j) => j.uf) ? [] : montes().filter((d) => l.some((j) => j.d !== d.nFolderIndex));
  const aDeplacer = (l, d) => l.filter((j) => j.d !== d.nFolderIndex);
  const assez = (l, d) => +d.nFreeSpace >= somme(aDeplacer(l, d));
  const quand = (t) => {
    if (!t) return T("stockage.jamais");
    const d = new Date(t * 1e3), n = /* @__PURE__ */ new Date();
    if (n - d < 7 * 864e5) return T("stockage.joue_semaine");
    return T("stockage.joue", { quand: d.toLocaleDateString(window.__pcvLocale?.(), d.getFullYear() === n.getFullYear() ? { month: "long" } : { year: "numeric" }) });
  };
  const CDN = "https://shared.steamstatic.com/store_item_assets/steam/apps/";
  const sources = (id) => {
    const a = appDe(id), h = a?.header_filename;
    const propres = a && (a.app_type === 1073741824 || ufListe.some((x) => x.id === id)) ? ["GetCustomLandcapeImageURLs", "GetCustomHeroImageURLs", "GetCustomVerticalCapsuleURLs"].flatMap((f) => {
      try {
        return O.appStore[f](a) || [];
      } catch (e) {
        return [];
      }
    }) : [];
    return [...propres, h && CDN + id + "/" + h, `/assets/${id}/header.jpg`, CDN + id + "/header.jpg"].filter(Boolean).map((u) => String(u).replace(/['"\\()\s<>]/g, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")));
  };
  const fond = (id) => `background-image:${sources(id).map((u) => `url('${u}')`).join(",")}`;
  const vive = (d) => {
    const b = /* @__PURE__ */ new Map();
    let m = null, note = -1;
    for (let k = 0; k < d.length; k += 4) {
      const q = d[k] >> 5 << 6 | d[k + 1] >> 5 << 3 | d[k + 2] >> 5, e = b.get(q) || b.set(q, [0, 0, 0, 0]).get(q);
      e[0] += d[k];
      e[1] += d[k + 1];
      e[2] += d[k + 2];
      e[3]++;
    }
    for (const [r, g, v, n] of b.values()) {
      const c = [r / n, g / n, v / n], hi = Math.max(...c) / 255, lo = Math.min(...c) / 255, l = (hi + lo) / 2, s = hi === lo ? 0 : (hi - lo) / (1 - Math.abs(2 * l - 1)), x = s * Math.sqrt(n);
      if (l > 0.28 && l < 0.72 && x > note) {
        note = x;
        m = `rgb(${c.map(Math.round).join(",")})`;
      }
    }
    return m;
  };
  const couleurs = /* @__PURE__ */ new Map();
  let repeint = 0;
  const couleur = (id) => {
    if (couleurs.has(id)) return couleurs.get(id) || TEINTE.reste;
    couleurs.set(id, null);
    const l = sources(id), i = new Image();
    i.crossOrigin = "anonymous";
    i.onerror = () => {
      if (l.length) i.src = l.shift();
    };
    i.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = 46;
        c.height = 22;
        const x = c.getContext("2d");
        x.drawImage(i, 0, 0, 46, 22);
        couleurs.set(id, vive(x.getImageData(0, 0, 46, 22).data));
        repeint ||= requestAnimationFrame(() => {
          repeint = 0;
          if (S.actif) dessiner();
        });
      } catch (e) {
      }
    };
    i.src = l.shift();
    return TEINTE.reste;
  };
  document.getElementById("pcv-stockage")?.remove();
  document.getElementById("pcv-stockage-legende")?.remove();
  document.getElementById("pcv-stockage-style")?.remove();
  document.getElementById("pcv-stockage-bulle")?.remove();
  const page = document.createElement("div");
  page.id = "pcv-stockage";
  page.hidden = true;
  document.body.appendChild(page);
  const legendeEl = document.createElement("div");
  legendeEl.id = "pcv-stockage-legende";
  legendeEl.className = "pcv-legende";
  document.body.appendChild(legendeEl);
  const S = { actif: false, zone: "onglet", og: "jeux", cur: null, fiche: null, retour: null, choix: null, tri: "gros", manette: false, dep: null, part: null };
  const C = "#pcv-stockage";
  document.head.insertAdjacentHTML("beforeend", `<style id="pcv-stockage-style">
    body.pcv-stockage-ouvert .DialogContentTransition { visibility: hidden !important; }
    ${C} { --t2: var(--pcv-texte2, #6b7788); --hachures: repeating-linear-gradient(135deg, #c3ccd7 0 calc(var(--u) * 4), #d8dee6 calc(var(--u) * 4) calc(var(--u) * 8)); }
    ${C} :is(.contenu, .colonne, .grille)::-webkit-scrollbar { display: none; }
    
    :is(${C}, #pcv-parametres) .f { box-shadow: var(--pcv-anneau-choisi) !important; }
    ${C} .colonne > * { flex-shrink: 0; }
    ${C} .colonne .groupe { margin: calc(var(--u) * 2) calc(var(--u) * 14); color: var(--t2); font-size: calc(var(--u) * 14); font-weight: 900; }
    ${C} .colonne .onglet > span { min-width: 0; }
    ${C} .colonne .onglet { height: auto; min-height: calc(var(--u) * 64); padding-block: calc(var(--u) * 8); }
    ${C} .colonne .onglet b { white-space: normal; overflow-wrap: anywhere; }
    ${C} .contenu { gap: var(--pcv-ecart-choix); }
    ${C} .contenu > * { flex: none; }
    
    ${C} .reste { display: flex; flex-direction: column; justify-content: center; line-height: 1; }
    ${C} .reste small { font-size: calc(var(--u) * 18); font-weight: 900; color: var(--t2); }
    ${C} .reste b { font-size: calc(var(--u) * 52); font-weight: 900; letter-spacing: -.02em; margin: calc(var(--u) * 2) 0; }
    ${C} .reste b span { font-size: .5em; letter-spacing: 0; }
    ${C} .reste em { font-style: normal; font-size: calc(var(--u) * 16); font-weight: 800; color: var(--t2); }
    ${C} .barre { position: relative; display: flex; gap: calc(var(--u) * 2); height: calc(var(--u) * 34); border-radius: 999px; overflow: hidden; background: #fff; box-shadow: inset 0 2px 5px rgba(0,0,0,.12), 0 0 0 1px var(--pcv-bord); margin-bottom: calc(var(--u) * 10); }
    ${C} .barre > i { flex: 0 1 auto; min-width: 0; height: 100%; background: var(--c); }
    ${C} .barre > i.autres, ${C} .pills .autres::before { background: var(--hachures); }
    ${C} .barre > i.libre { flex-shrink: 0; min-width: calc(var(--u) * 22); background: color-mix(in srgb, var(--pcv-cyan-plein) 18%, #fff); box-shadow: inset 0 0 0 calc(var(--u) * 3) var(--pcv-cyan-plein); border-radius: 0 999px 999px 0; }
    ${C} .pills { display: flex; gap: calc(var(--u) * 4) calc(var(--u) * 8); flex-wrap: wrap; }
    ${C} .pills span { display: flex; align-items: center; gap: calc(var(--u) * 6); font-size: calc(var(--u) * 14); font-weight: 900; color: var(--t2); white-space: nowrap; }
    ${C} .pills span::before { content: ""; width: calc(var(--u) * 14); height: calc(var(--u) * 14); border-radius: 50%; background: var(--c); }
    ${C} .pills span.libre::before { background: #fff; box-shadow: inset 0 0 0 3px var(--pcv-cyan-plein); }
    ${C} .pills b { color: var(--pcv-texte); }
    ${C} .haut { display: grid; grid-template-columns: auto 1fr; gap: calc(var(--u) * 22); align-items: center; padding: calc(var(--u) * 2) calc(var(--u) * 4) 0; }
    
    ${C} .outils { display: flex; gap: calc(var(--u) * 12); padding: 0 calc(var(--u) * 6); }
    ${C} .outils .droite { margin-left: auto; }
    ${C} .choixl { display: flex; align-items: center; gap: calc(var(--u) * 10); height: calc(var(--u) * 46); padding: 0 calc(var(--u) * 14) 0 calc(var(--u) * 8); border-radius: 999px;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: calc(var(--u) * 17); font-weight: 900; white-space: nowrap; }
    ${C} .choixl > i { width: calc(var(--u) * 32); height: calc(var(--u) * 32); padding: calc(var(--u) * 6); border-radius: 50%; background: var(--c, var(--pcv-cyan-plein)); color: #fff; flex: none; }
    ${C} .choixl > .fl { width: calc(var(--u) * 18); height: calc(var(--u) * 18); color: var(--t2); }
    
    ${C} .grille { flex: 1 1 0 !important; min-height: 0; display: grid; grid-template-columns: repeat(${COLONNES}, 1fr); gap: calc(var(--u) * 14); align-content: start; overflow-y: auto;
      padding: calc(var(--u) * 10) calc(var(--u) * 10) calc(var(--u) * 40); margin: 0 calc(var(--u) * -4); -webkit-mask-image: linear-gradient(180deg, transparent, #000 calc(var(--u) * 10), #000 82%, transparent); mask-image: linear-gradient(180deg, transparent, #000 calc(var(--u) * 10), #000 82%, transparent); }
    ${C}.choix-on .grille { padding-bottom: calc(var(--u) * 110); scroll-padding-bottom: calc(var(--u) * 100); }   
    ${C} .jq { position: relative; aspect-ratio: 460 / 215; border-radius: calc(var(--u) * 16); background: #c9d1db center / cover; box-shadow: 0 0 0 calc(var(--u) * 3) #fff, 0 calc(var(--u) * 5) calc(var(--u) * 12) rgba(60,85,120,.22); margin-bottom: calc(var(--u) * 8); }
    ${C} .jq::after { content: ""; position: absolute; left: calc(var(--u) * 10); right: calc(var(--u) * 10); bottom: calc(var(--u) * -8); height: calc(var(--u) * 5); border-radius: 3px; background: var(--c); }
    ${C} .jq .go { position: absolute; right: calc(var(--u) * 6); bottom: calc(var(--u) * 6); padding: calc(var(--u) * 3) calc(var(--u) * 10); border-radius: 999px; background: var(--pcv-bulle); color: var(--pcv-sur-accent); font-size: calc(var(--u) * 15); font-weight: 900; box-shadow: 0 2px 6px rgba(0,0,0,.18); }   
    
    #pcv-stockage-bulle { --u: calc(100vh / 800); position: fixed; left: 50%; bottom: calc(var(--u) * 84); translate: -50% 0; z-index: 8600; padding: calc(var(--u) * 10) calc(var(--u) * 22); border-radius: 999px; background: var(--pcv-bulle); color: var(--pcv-sur-accent); font: 900 calc(var(--u) * 18) var(--pcv-police, sans-serif); box-shadow: var(--pcv-ombre); white-space: nowrap; }
    #pcv-stockage-bulle[hidden] { display: none; }
    ${C} .jq.part { filter: grayscale(1); }
    ${C} .jq .etat { position: absolute; inset: 0; border-radius: inherit; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--u) * 4); background: color-mix(in srgb, var(--pcv-bulle) 72%, transparent); color: var(--pcv-sur-accent); font-size: calc(var(--u) * 14); font-weight: 900; }
    ${C} .jq .etat i { width: calc(var(--u) * 24); height: calc(var(--u) * 24); display: block; }
    ${C} .jq .prog { position: absolute; left: calc(var(--u) * 10); right: calc(var(--u) * 10); top: calc(var(--u) * 10); height: calc(var(--u) * 12); border-radius: 999px; background: var(--pcv-bulle); box-shadow: 0 0 0 calc(var(--u) * 2) var(--pcv-sur-accent); overflow: hidden; }
    ${C} .jq .prog b { display: block; height: 100%; background: var(--pcv-cyan-plein); transform-origin: 0 0; transform: scaleX(var(--p, 0)); transition: transform .3s; }
    ${C} .jq .coche { position: absolute; left: calc(var(--u) * -6); top: calc(var(--u) * -6); width: calc(var(--u) * 32); height: calc(var(--u) * 32); padding: calc(var(--u) * 6); border-radius: 50%; background: #fff; color: transparent; box-shadow: inset 0 0 0 calc(var(--u) * 3) #c5ceda, 0 2px 5px rgba(0,0,0,.2); }
    ${C} .jq.sel .coche { background: var(--pcv-cyan-plein); color: #fff; box-shadow: 0 0 0 calc(var(--u) * 3) #fff, 0 2px 5px rgba(0,0,0,.2); }
    ${C} .jq.sel:not(.f) { box-shadow: 0 0 0 calc(var(--u) * 4) var(--pcv-cyan-plein), 0 calc(var(--u) * 5) calc(var(--u) * 12) rgba(60,85,120,.22); }
    
    ${C} .actions-sel { position: absolute; left: calc(var(--u) * 352); right: calc(var(--u) * 18); bottom: calc(var(--u) * 16); height: calc(var(--u) * 74); border-radius: 999px; z-index: 3; display: flex; align-items: center; gap: calc(var(--u) * 12);
      padding: 0 calc(var(--u) * 26) 0 calc(var(--u) * 12); background: var(--pcv-carte); box-shadow: 0 calc(var(--u) * 8) calc(var(--u) * 24) rgba(40,60,90,.25), 0 0 0 1px var(--pcv-bord); white-space: nowrap; }
    ${C} .actions-sel b { margin-left: auto; font-size: calc(var(--u) * 21); font-weight: 900; }
    ${C} .actions-sel em { font-style: normal; color: var(--t2); font-size: calc(var(--u) * 17); font-weight: 800; }
    ${C} :is(.actions-sel, .tete-place) .bouton { height: calc(var(--u) * 54); font-size: calc(var(--u) * 18); padding: 0 calc(var(--u) * 20) 0 calc(var(--u) * 8); gap: calc(var(--u) * 10); }
    ${C} :is(.actions-sel, .tete-place) .bouton .pastille { width: calc(var(--u) * 38); height: calc(var(--u) * 38); padding: calc(var(--u) * 9); }
    ${C} .bouton[disabled] { opacity: .5; }
    
    ${C} .ligne1 { display: flex; align-items: flex-end; gap: calc(var(--u) * 18); }
    ${C} .ligne1 .pills { margin-left: auto; justify-content: flex-end; max-width: calc(var(--u) * 360); padding-bottom: calc(var(--u) * 6); }
    ${C} .barre.jaq { height: calc(var(--u) * 56); border-radius: calc(var(--u) * 20); overflow: visible; background: none; box-shadow: none; gap: calc(var(--u) * 3); margin-bottom: calc(var(--u) * 22); }
    ${C} .barre.jaq > i { border-radius: calc(var(--u) * 8); background: var(--c) center / cover; position: relative; box-shadow: 0 2px 6px rgba(0,0,0,.18); }
    ${C} .barre.jaq > i:first-child { border-radius: calc(var(--u) * 20) calc(var(--u) * 8) calc(var(--u) * 8) calc(var(--u) * 20); }
    ${C} .barre.jaq > i.libre { border-radius: calc(var(--u) * 8) calc(var(--u) * 20) calc(var(--u) * 20) calc(var(--u) * 8); box-shadow: inset 0 0 0 calc(var(--u) * 3) var(--pcv-cyan-plein); flex: none; }
    ${C} .barre.jaq > i.autres { box-shadow: none; background: var(--hachures); }
    ${C} .barre.jaq > i > span { position: absolute; left: 0; right: 0; bottom: calc(var(--u) * -22); text-align: center; font-size: calc(var(--u) * 13); font-weight: 900; color: var(--t2); white-space: nowrap; font-style: normal; }
    ${C} .barre.jaq > i.libre > span { color: var(--pcv-cyan-plein); left: auto; right: 0; }
    ${C} .tete-place { display: flex; align-items: center; gap: calc(var(--u) * 18); font-size: calc(var(--u) * 17); font-weight: 900; white-space: nowrap; }
    ${C} .tete-place .bouton small { display: inline; margin-left: calc(var(--u) * 6); }
    ${C} .tete-place small, ${C} .vide { font-size: calc(var(--u) * 14); color: var(--t2); font-weight: 800; }
    ${C} .sugg { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(var(--u) * 10); }
    ${C} .sg { display: flex; align-items: center; gap: calc(var(--u) * 12); height: calc(var(--u) * 58); padding: 0 calc(var(--u) * 16) 0 calc(var(--u) * 8); border-radius: calc(var(--u) * 22); background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    ${C} .sg .mini { flex: none; width: calc(var(--u) * 90); height: calc(var(--u) * 42); border-radius: calc(var(--u) * 12); background: center / cover; }
    ${C} .sg span { min-width: 0; flex: 1; font-size: calc(var(--u) * 17); font-weight: 900; line-height: 1.15; }
    ${C} .sg span b { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    ${C} .sg span small { font-size: calc(var(--u) * 13); color: var(--t2); font-weight: 800; }
    ${C} .sg > em { font-style: normal; font-size: calc(var(--u) * 20); font-weight: 900; }
    
    ${C} .colonne.jeu { gap: calc(var(--u) * 12); overflow: visible; }
    ${C} .colonne.jeu > * { flex: none; }
    ${C} .grande { width: 100%; aspect-ratio: 460 / 215; border-radius: calc(var(--u) * 22); background: #c9d1db center / cover; box-shadow: 0 0 0 calc(var(--u) * 4) #fff, 0 calc(var(--u) * 10) calc(var(--u) * 24) rgba(60,85,120,.28); }
    ${C} .part { font-size: calc(var(--u) * 16); font-weight: 800; color: var(--t2); }
    ${C} .part b { color: var(--pcv-texte); }
    ${C} .colonne.jeu .barre { height: calc(var(--u) * 20); margin: 0; }
    ${C} .cat { display: grid; grid-template-columns: 1fr auto; gap: calc(var(--u) * 3) calc(var(--u) * 12); font-size: calc(var(--u) * 14); font-weight: 800; color: var(--t2); padding: calc(var(--u) * 8) calc(var(--u) * 14); border-radius: calc(var(--u) * 16); background: var(--pcv-creux); }
    ${C} .cat b { color: var(--pcv-texte); text-align: right; }
    ${C} h2 { margin: calc(var(--u) * 4) 0 0; font-size: calc(var(--u) * 34); font-weight: 900; line-height: 1.05; }
    ${C} .titre { display: flex; align-items: center; gap: calc(var(--u) * 14); }
    ${C} .infos { display: flex; gap: calc(var(--u) * 8); flex-wrap: wrap; }
    ${C} .infos span { padding: calc(var(--u) * 6) calc(var(--u) * 14); border-radius: 999px; background: var(--pcv-creux); font-size: calc(var(--u) * 16); font-weight: 900; color: var(--t2); }
    ${C} .infos span.gros { background: var(--c); color: #fff; }
    ${C} .infos .quand::first-letter { text-transform: uppercase; }   
    ${C} .actions { display: flex; flex-direction: column; gap: calc(var(--u) * 12); padding: calc(var(--u) * 4); }
    ${C} .actions .bouton { height: calc(var(--u) * 74); font-size: calc(var(--u) * 22); }
    ${C} .actions .bouton .pastille { width: calc(var(--u) * 52); height: calc(var(--u) * 52); padding: calc(var(--u) * 12); }
    ${C} .actions.normales .bouton { height: calc(var(--u) * 56); font-size: calc(var(--u) * 19); }   
    ${C} .actions.normales .bouton .pastille { width: calc(var(--u) * 40); height: calc(var(--u) * 40); padding: calc(var(--u) * 9); }
    ${C} .actions .bouton span { display: flex; flex-direction: column; line-height: 1.15; }
    ${C} .actions .bouton.principal { background: var(--pcv-cyan); color: var(--pcv-sur-accent); }
    ${C} .actions .bouton.principal small { color: inherit; opacity: .92; }
    ${C} .lignes { display: flex; flex-direction: column; gap: calc(var(--u) * 8); }
    ${C} .lignes > div { display: flex; justify-content: space-between; gap: calc(var(--u) * 12); padding: calc(var(--u) * 10) calc(var(--u) * 18); border-radius: calc(var(--u) * 20); background: var(--pcv-verre); box-shadow: var(--pcv-reflet); font-size: calc(var(--u) * 17); font-weight: 900; }
    ${C} .lignes > div small { color: var(--t2); }   
    ${C} .note { margin: 0; font-size: calc(var(--u) * 16); font-weight: 800; color: var(--t2); line-height: 1.35; }
  </style>`);
  const pills = (p) => `<div class="pills"><span style="--c:${TEINTE.jeux}"><b>${T("stockage.jeux")}</b>${go(p.jeux)}</span><span style="--c:${TEINTE.outils}"><b>${T("stockage.onglet.outils")}</b>${go(p.outils)}</span>
    <span class="autres"><b>${T("stockage.autres")}</b>${go(p.autres)}</span><span class="libre"><b>${T("stockage.libre")}</b>${go(p.libre)}</span></div>`;
  const reste = (p, sous) => `<div class="reste"><small>${T("stockage.il_reste")}</small><b>${nombre(p.libre)} <span>${T("stockage.go")}</span></b><em>${sous ?? T("stockage.sur", { n: go(p.cap) })}</em></div>`;
  const morceaux = (d, n) => {
    const p = place(d), l = trier(surDisque(jeux(), d), "gros");
    return [
      ...l.slice(0, n).map((j) => ({ o: j.octets, c: couleur(j.id), j })),
      { o: somme(l.slice(n)), c: TEINTE.reste, t: T("stockage.autres_jeux", { n: l.length - n }) },
      { o: p.outils, c: TEINTE.outils, t: T("stockage.onglet.outils") },
      { o: p.autres, cl: "autres", t: T("stockage.autres") },
      { o: p.libre, cl: "libre", t: T("stockage.libre") }
    ].filter((m) => m.o > 0 || m.cl === "libre");
  };
  const largeur = (o, cap) => `width:${cap ? o / cap * 100 : 0}%`;
  const barre = (d, n) => `<div class="barre">${morceaux(d, n).map((m) => `<i class="${m.cl || ""}" style="${largeur(m.o, d.nCapacity)};--c:${m.c || ""}"></i>`).join("")}</div>`;
  const barreJaq = (d) => {
    const cap = +d.nCapacity, assez2 = (o) => o / cap > 0.05;
    return `<div class="barre jaq">${morceaux(d, GROS_JAQ).map((m) => `<i class="${m.cl || ""}" style="${largeur(m.o, cap)};--c:${m.c || TEINTE.reste};${m.j ? fond(m.j.id) : ""}">${assez2(m.o) ? `<span>${esc(m.j ? go(m.o) : m.t)}</span>` : ""}</i>`).join("")}</div>`;
  };
  const SOUS = { place: () => pl("stockage.idees", idees().length), jeux: () => S.part ? T("stockage.desinst_n", { n: Math.min(S.part.total, S.part.faits + 1), total: S.part.total }) : S.dep ? T("stockage.en_cours", { nom: jeu(S.dep.id)?.nom || "", p: T("stockage.pourcent", { n: Math.round(S.dep.p * 100) }) }) : pl("stockage.n_jeux", jeux().length), outils: () => T("stockage.a_garder", { n: go(somme(outils())) }) };
  const dessinerColonne = () => {
    const groupes = [true, false].some((fixe) => montes().filter((d) => !!d.bIsFixed === fixe).length > 1);
    return `<div class="colonne">${onglets().map(([id, n, c, d], i, l) => (groupes && d && (!l[i - 1]?.[3] || !!l[i - 1][3].bIsFixed !== !!d.bIsFixed) ? `<p class="groupe">${T(d.bIsFixed ? "stockage.internes" : "stockage.amovibles")}</p>` : "") + window.__pcvOnglet("og:" + id, S.og === id, c, ic(n), esc(d ? nomDisque(d) : T("stockage.onglet." + id)), esc(d ? T("stockage.libres_sur", { libre: go(d.nFreeSpace), total: nombre(d.nCapacity) }) : SOUS[id]()))).join("")}</div>`;
  };
  const bouton = (a, n, c, texte, aide = "", cl = "", off = false) => `<button class="bouton ${cl}" data-a="${a}"${off ? " disabled" : ""}><i class="pastille" style="--c:${c}">${ic(n)}</i><span>${esc(texte)}${aide ? `<small>${esc(aide)}</small>` : ""}</span></button>`;
  const vuePlace = (d) => {
    const p = place(d), l = idees();
    return `<div class="ligne1">${reste(p, p.libre / p.cap < 0.1 ? T("stockage.presque_pleine") : void 0)}${pills(p)}</div>${barreJaq(d)}
      <div class="tete-place">${l.length ? bouton("tout", "balai", TEINTE.vert, T("stockage.tout_desinstaller"), "+" + go(somme(l))) : ""}<span>${T("stockage.pas_lances")}</span></div>
      ${l.length ? `<div class="sugg">${l.map((j) => `<button class="sg" data-a="jeu:${j.id}"><span class="mini" style="${fond(j.id)}"></span><span><b>${esc(j.nom)}</b><small>${esc(quand(j.joue))}</small></span><em>${go(j.octets)}</em></button>`).join("")}</div>` : `<p class="vide">${T("stockage.rien_a_faire")}</p>`}`;
  };
  const vueJeux = (d) => {
    const p = place(d);
    return `<div class="haut">${reste(p)}<div>${barre(d, GROS_BARRE)}${pills(p)}</div></div>
      <div class="outils"><button class="choixl" data-a="tri"><i>${ic("trier")}</i>${T("stockage.tri." + S.tri)}<span class="fl">${ic("deroulant")}</span></button>
        <button class="choixl droite" data-a="choix" style="--c:${S.choix ? "var(--pcv-cyan-plein)" : TEINTE.gris}"><i>${ic("cocher")}</i>${T(S.choix ? "stockage.choisir_plusieurs_oui" : "stockage.choisir_plusieurs")}</button></div>
      ${jeux().length ? "" : `<p class="vide">${T("stockage.aucun_jeu")}</p>`}<div class="grille">${trier(jeux(), S.tri).map((j) => `<button class="jq${S.choix?.has(j.id) ? " sel" : ""}${partant(j.id) ? " part" : ""}${S.dep?.id === j.id ? " dep" : ""}" data-a="jeu:${j.id}" style="${fond(j.id)};--c:${couleur(j.id)}">${S.choix ? `<i class="coche">${ic("coche")}</i>` : ""}` + (partant(j.id) ? `<span class="etat"><i>${ic("horloge")}</i>${T("stockage.desinstallation")}</span>` : S.dep?.id === j.id ? `<i class="prog"><b style="--p:${S.dep.p}"></b></i><span class="go">${go(j.octets)}</span>` : `<span class="go">${go(j.octets)}</span>`) + `</button>`).join("")}</div>`;
  };
  const ACTIONS_DISQUE = (d) => [
    !d.bIsDefaultFolder && ["d:defaut", "coche", "var(--pcv-cyan-plein)", T("stockage.d.defaut"), T("stockage.d.defaut_aide")],
    ["d:ajouter", "plus", TEINTE.gris, T("stockage.d.ajouter"), T("stockage.d.ajouter_aide")],
    ["d:renommer", "crayon", TEINTE.gris, T("stockage.d.renommer"), T("stockage.d.renommer_aide")],
    ["d:reparer", "outil", TEINTE.gris, T("stockage.d.reparer"), T("stockage.d.reparer_aide")],
    d.nFolderIndex > 0 && ["d:retirer", "supprimer", TEINTE.gris, T("stockage.d.retirer"), T("stockage.d.retirer_aide")]
  ].filter(Boolean);
  const vueDisque = (d, vide) => {
    if (!d) return `<p class="note">${T(vide)}</p>`;
    const p = place(d);
    return `<div class="titre"><h2>${esc(nomDisque(d))}</h2>${d.bIsDefaultFolder ? `<div class="infos"><span>${T("stockage.disque_defaut")}</span></div>` : ""}</div>
      <div class="haut">${reste(p)}<div>${barre(d, GROS_BARRE)}${pills(p)}</div></div>
      <div class="actions normales">${ACTIONS_DISQUE(d).slice(0, VISIBLES).map(([a, n, c, t, aide]) => bouton(a, n, c, t, aide)).join("")}</div>`;
  };
  const vueOutils = () => `<p class="note">${T("stockage.outils_texte")}</p><div class="lignes">${trier(outils(), "gros").map((j) => `<div data-a="outil:${j.id}"><span>${esc(j.nom)}</span><small>${go(j.octets)}</small></div>`).join("")}</div>`;
  const VUES = { place: () => vuePlace(ensemble()), jeux: () => vueJeux(ensemble()), outils: vueOutils };
  const vueFiche = (j) => {
    const d = montes().find((x) => x.nFolderIndex === j.d) || laConsole(), cap = +d.nCapacity || 1, part = Math.round(j.octets / cap * 100), p = place(d), v = j.v;
    const morceauxJeu = [["jeu", j.octets - (+v.nDLCSize || 0) - (+v.nWorkshopSize || 0) - (+v.nShaderSize || 0)], ["dlc", +v.nDLCSize], ["shaders", +v.nShaderSize], ["workshop", +v.nWorkshopSize]].filter(([, o]) => o > 0);
    const plusGros = trier(jeux(), "gros")[0]?.id === j.id, c = couleur(j.id);
    const pourcent = `<b>${T("stockage.pourcent", { n: part })}</b>`;
    return `<div class="colonne jeu"><div class="grande" style="${fond(j.id)}"></div>
        <div class="part">${esc(T(d.strUserLabel ? "stockage.part" : d.bIsFixed ? "stockage.part.console" : "stockage.part.sd", { n: "", disque: nomDisque(d) })).replace("", pourcent)}</div>
        <div class="barre"><i style="${largeur(j.octets, cap)};--c:${c}"></i><i class="autres" style="${largeur(cap - p.libre - j.octets, cap)}"></i><i class="libre"></i></div>
        ${morceauxJeu.length > 1 ? `<div class="cat">${morceauxJeu.map(([k, o]) => `<span>${T("stockage.part." + k)}</span><b>${go(o)}</b>`).join("")}</div>` : ""}</div>
      <div class="contenu"><h2>${esc(j.nom)}</h2><div class="infos"><span class="gros" style="--c:${c}">${go(j.octets)}</span>${plusGros ? `<span>${T("stockage.plus_gros")}</span>` : ""}<span class="quand">${esc(quand(j.joue))}</span></div>
        <div class="actions">${bouton("act:desinstaller", "supprimer", TEINTE.gris, T("biblio.r_desinstaller"), T("stockage.tu_gagnes", { n: go(j.octets) }), "principal")}
          ${boutonDeplacer([j], "act:deplacer")}
          ${bouton("act:page", "page", TEINTE.page, T("stockage.voir_page"), T("stockage.voir_page_aide"))}</div></div>`;
  };
  const boutonDeplacer = (l, action) => {
    const ds = destinations(l), d = ds[0];
    if (!d) return "";
    const possible = ds.some((x) => assez(l, x));
    return bouton(
      action,
      ds.length === 1 && d.bIsFixed ? "disque" : "carte-sd",
      TEINTE.sd,
      ds.length === 1 ? T("stockage.deplacer_vers", { disque: versQui(d) }) : T("stockage.deplacer"),
      possible ? ds.length === 1 ? T("stockage.destination_libre", { libre: go(d.nFreeSpace) }) : T("stockage.destination") : T("stockage.pas_assez"),
      "",
      !possible
    );
  };
  const choisis = () => jeux().filter((j) => S.choix?.has(j.id));
  const barreChoix = () => {
    const l = choisis();
    return `<div class="actions-sel">${bouton("sel:desinstaller", "supprimer", TEINTE.gris, T("biblio.r_desinstaller"), "", "", !l.length).replace('class="bouton ', 'data-rang="fin" class="bouton ')}
      ${boutonDeplacer(l, "sel:deplacer").replace('class="bouton ', 'data-rang="fin" class="bouton ')}
      <b>${pl("stockage.n_choisis", l.length)}</b><em>+${go(somme(l))}</em></div>`;
  };
  const jeu = (id) => tous().find((j) => j.id === +id);
  const dessiner = () => {
    const grille = page.querySelector(".grille"), haut = grille?.scrollTop || 0, defile = page.querySelector(".colonne")?.scrollTop || 0, j = S.fiche && jeu(S.fiche);
    if (!onglets().some(([id]) => id === S.og)) {
      S.og = "jeux";
      S.zone = "colonne";
      S.cur = null;
    }
    if (S.fiche && !j) {
      S.fiche = null;
      S.cur = S.retour;
    }
    page.classList.toggle("choix-on", !!S.choix);
    page.innerHTML = `<div class="panneau">${j ? vueFiche(j) : `${dessinerColonne()}<div class="contenu">${laConsole() ? VUES[S.og] ? VUES[S.og]() : vueDisque(disqueVu(), "stockage.aucun_disque") : `<p class="note">${T("stockage.aucun_disque")}</p>`}</div>`}</div>${S.choix && !j ? barreChoix() : ""}`;
    const g = page.querySelector(".grille");
    if (g) g.scrollTop = haut;
    const col = page.querySelector(".colonne");
    if (col) col.scrollTop = defile;
    curseur();
  };
  const cibles = () => [...page.querySelectorAll(S.zone === "colonne" ? ".colonne [data-a]" : S.fiche ? ".contenu [data-a]" : ".contenu [data-a], .actions-sel [data-a]")].filter((e) => !e.disabled);
  const rangs = () => {
    const R = [];
    for (const [e, r] of cibles().map((e2) => [e2, e2.getBoundingClientRect()]).sort(([x, a], [y, b]) => (x.dataset.rang ? 1e9 : a.top) - (y.dataset.rang ? 1e9 : b.top))) {
      const d = R.at(-1);
      if (d && !!e.dataset.rang === d.fin && Math.abs(r.top - d.top) < r.height / 2) d.l.push([e, r]);
      else R.push({ top: r.top, fin: !!e.dataset.rang, l: [[e, r]] });
    }
    return R.map((x) => x.l.sort(([, a], [, b]) => a.left - b.left).map(([e]) => e));
  };
  const vise = () => page.querySelector(`[data-a="${S.cur}"]`);
  const curseur = () => {
    page.querySelectorAll(".f").forEach((e) => e.classList.remove("f"));
    if (S.zone === "colonne") S.cur = "og:" + S.og;
    if (S.zone !== "onglet" && !cibles().includes(vise())) S.cur = cibles()[0]?.dataset.a ?? null;
    const f = S.zone !== "onglet" && S.manette && vise();
    if (f) {
      f.classList.add("f");
      window.__pcvSuivre?.(f) || f.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    }
    document.body.classList.toggle("pcv-stockage-main", S.actif && S.zone !== "onglet");
    legende();
  };
  const legende = () => {
    const a = S.cur || "", O2 = [[5, 6], T("touche.onglets")], R = [2, T("touche.retour")];
    window.__pcvIcones?.poser(legendeEl, S.choix && !S.fiche && S.zone === "contenu" ? [[2, T("steamu.annuler")], [1, a.startsWith("jeu:") ? T("stockage.cocher") : T("touche.choisir")]] : S.fiche ? [R, [1, T("touche.choisir")]] : S.zone === "contenu" && S.og === "jeux" ? [O2, [4, T("stockage.trier")], [3, T("stockage.choisir_plusieurs")], R, [1, a.startsWith("jeu:") ? T("console.ouvrir") : T("touche.choisir")]] : [O2, S.zone === "onglet" && [4, T("touche.rechercher")], S.zone === "contenu" && options().length && [3, T("touche.options")], R, (S.zone === "colonne" ? page.querySelector(".contenu [data-a]") : !a.startsWith("outil:")) && [1, S.zone === "colonne" || a.startsWith("jeu:") ? T("console.ouvrir") : T("touche.choisir")]]);
  };
  const Q = (o) => window.__pcvDossiers?.demander?.({ ailleurs: true, ...o });
  const partant = (id) => !!S.part?.reste.has(id);
  const desinstaller = (ids) => {
    const SCl = SC();
    S.part = { reste: new Map(ids.map((id) => {
      const j = jeu(id);
      return [id, { nom: j?.nom || "", octets: j?.octets || 0 }];
    })), total: ids.length, faits: 0 };
    const dUF = ids.map(jeu).filter((j) => j?.uf), dSteam = ids.filter((id) => !dUF.some((j) => j.id === id));
    if (dSteam.length) try {
      SCl.Installs.OpenUninstallWizard(dSteam, "0", true);
    } catch (e) {
      dSteam.forEach((id) => window.__pcvBridge?.desinstaller?.(id));
    }
    dUF.forEach((j) => ufDesinstaller(j));
    S.choix = null;
    S.fiche = null;
    S.cur = S.retour;
    setTimeout(lire, 1500);
    dessiner();
  };
  const suivreDesinstallation = () => {
    if (!S.part || !disques.length) return false;
    const partis = [...S.part.reste.keys()].filter((id) => !tous().some((j) => j.id === id));
    if (!partis.length) return false;
    for (const id of partis) {
      const x = S.part.reste.get(id);
      S.part.reste.delete(id);
      S.part.faits++;
      bulle(T("stockage.desinstalle", { nom: x.nom, n: go(x.octets) }));
    }
    if (!S.part.reste.size) S.part = null;
    const el = partis.map((id) => page.querySelector(`.jq[data-a="jeu:${id}"]`)).filter(Boolean);
    let n = el.length;
    if (!n || !S.actif) return false;
    el.forEach((e) => window.__pcvApparition(e, true, null, () => {
      if (!--n) dessiner();
    }));
    return true;
  };
  const BULLE_MS = 2600, bulleEl = document.createElement("div");
  bulleEl.id = "pcv-stockage-bulle";
  bulleEl.hidden = true;
  document.body.appendChild(bulleEl);
  const bulle = (t) => {
    bulleEl.textContent = t;
    clearTimeout(bulleEl.t);
    if (bulleEl.hidden) {
      bulleEl.hidden = false;
      window.__pcvApparition(bulleEl);
    }
    bulleEl.t = setTimeout(() => window.__pcvApparition(bulleEl, true, null, () => {
      bulleEl.hidden = true;
    }), BULLE_MS);
  };
  const demanderDesinstaller = (l) => {
    const libre = ensemble().nFreeSpace + somme(l), un = l.length === 1;
    return Q({
      ic: "suppr",
      titre: un ? T("stockage.q_desinstaller", { nom: l[0].nom }) : T("stockage.q_desinstaller_n", { n: l.length }),
      texte: T(un ? "stockage.q_desinstaller_texte" : "stockage.q_desinstaller_texte_n", { n: go(libre) }),
      non: T("telech.garder"),
      oui: T("biblio.r_desinstaller"),
      ok: () => desinstaller(l.map((j) => j.id))
    });
  };
  const deplacer = async (ids, vers) => {
    S.choix = null;
    S.fiche = null;
    S.cur = S.retour;
    for (const id of ids) {
      S.dep = { id, p: 0 };
      dessiner();
      try {
        await SC().InstallFolder.MoveInstallFolderForApp(id, vers);
      } catch (e) {
        continue;
      }
      for (let i = 0; i < 3600; i++) {
        await attendre(2e3);
        await lire();
        if (disques.find((d) => d.nFolderIndex === vers)?.vecApps?.some((v) => v.nAppID === id)) break;
      }
    }
    S.dep = null;
    lire();
  };
  const demanderDeplacer = (l, vers) => {
    const d = montes().find((x) => x.nFolderIndex === vers);
    l = l.map((j) => jeu(j.id)).filter(Boolean);
    if (!d || !assez(l, d)) return;
    l = aDeplacer(l, d);
    if (!l.length) return;
    const un = l.length === 1;
    return Q({
      ic: "dossier",
      danger: false,
      titre: un ? T("stockage.q_deplacer", { nom: l[0].nom, disque: versQui(d) }) : T("stockage.q_deplacer_n", { n: l.length, disque: versQui(d) }),
      texte: T("stockage.q_deplacer_texte", { n: go(somme(l)), libre: go(d.nFreeSpace) }),
      non: T("steamu.annuler"),
      oui: T("stockage.deplacer"),
      ok: () => {
        const actuel = montes().find((x) => x.nFolderIndex === vers), presents = l.map((j) => jeu(j.id)).filter(Boolean);
        if (actuel && assez(presents, actuel)) deplacer(aDeplacer(presents, actuel).map((j) => j.id), vers);
      }
    });
  };
  const choisirDestination = (l) => {
    const ds = destinations(l);
    if (!ds.length) return;
    if (ds.length === 1) return demanderDeplacer(l, ds[0].nFolderIndex);
    const grises = ds.flatMap((d, i) => assez(l, d) ? [] : [i]);
    return window.__pcvDossiers?.liste?.({
      ailleurs: true,
      titre: T("stockage.destination"),
      choix: ds.map((d) => `${nomDisque(d)} : ${T("stockage.destination_libre", { libre: go(d.nFreeSpace) })}${assez(l, d) ? "" : ", " + T("stockage.pas_assez")}`),
      grises,
      v: ds.findIndex((d) => assez(l, d)),
      ok: (i) => ds[i] && demanderDeplacer(l, ds[i].nFolderIndex)
    });
  };
  const disqueVu = () => montes().find((d) => S.og === "disque-" + d.nFolderIndex);
  const options = () => !S.fiche && disqueVu() ? ACTIONS_DISQUE(disqueVu()).slice(VISIBLES) : [];
  const ACTION_DISQUE = {
    defaut: (d) => {
      SC().InstallFolder.SetDefaultInstallFolder(d.nFolderIndex);
      setTimeout(lire, 500);
      son("choisir");
    },
    renommer: (d) => window.__pcvDossiers?.renommer?.(null, {
      nom: d.strUserLabel || "",
      max: 32,
      titre: T("stockage.d.nom"),
      annuler: T("steamu.annuler"),
      oui: T("touche.choisir"),
      ailleurs: true,
      ok: (nom) => {
        SC().InstallFolder.SetFolderLabel(d.nFolderIndex, nom);
        setTimeout(lire, 500);
        return true;
      }
    }),
    reparer: (d) => Q({
      ic: "nom",
      danger: false,
      titre: T("stockage.q_reparer", { disque: nomDisque(d) }),
      texte: T("stockage.q_reparer_texte"),
      non: T("steamu.annuler"),
      oui: T("stockage.d.reparer"),
      ok: () => SC().InstallFolder.RepairInstallFolder(d.nFolderIndex)
    }),
    retirer: (d) => Q({
      ic: "suppr",
      titre: T("stockage.q_retirer", { disque: nomDisque(d) }),
      texte: T("stockage.q_retirer_texte"),
      non: T("steamu.annuler"),
      oui: T("stockage.d.retirer"),
      ok: () => {
        SC().InstallFolder.RemoveInstallFolder(d.nFolderIndex);
        setTimeout(lire, 500);
      }
    }),
    ajouter: async () => {
      let l = [];
      try {
        l = await SC().InstallFolder.GetPotentialFolders() || [];
      } catch (e) {
      }
      window.__pcvDossiers?.liste?.({
        ailleurs: true,
        titre: T("stockage.d.ajouter"),
        choix: l.length ? l.map((d) => d.strFolderPath) : [T("stockage.aucun_autre")],
        v: -1,
        ok: (k) => l[k] && Q({
          ic: "dossier",
          danger: false,
          titre: T("stockage.d.ajouter"),
          texte: l[k].strFolderPath,
          non: T("steamu.annuler"),
          oui: T("stockage.d.ajouter"),
          ok: () => SC().InstallFolder.AddInstallFolder(l[k].strFolderPath).then(lire, () => {
          })
        })
      });
    }
  };
  const agir = (a) => {
    const [k, v] = a.split(":");
    if (k === "og") {
      if (S.og !== v) son("bouge");
      Object.assign(S, { og: v, choix: null, fiche: null });
      return dessiner();
    }
    if (k === "jeu") {
      if (S.choix) {
        S.choix.has(+v) ? S.choix.delete(+v) : S.choix.add(+v);
        son("choisir");
        return dessiner();
      }
      Object.assign(S, { retour: a, fiche: +v, cur: "act:desinstaller" });
      son("choisir");
      return dessiner();
    }
    if (a === "tri") return window.__pcvDossiers?.liste?.({
      ailleurs: true,
      svg: window.__pcvIcones?.trace("trier"),
      titre: T("stockage.trier"),
      choix: TRIS.map((t) => T("stockage.tri." + t)),
      v: TRIS.indexOf(S.tri),
      ok: (n) => {
        S.tri = TRIS[n];
        dessiner();
      }
    });
    if (a === "choix") {
      S.choix = S.choix ? null : /* @__PURE__ */ new Set();
      son("choisir");
      return dessiner();
    }
    if (a === "tout") return demanderDesinstaller(idees());
    const j = S.fiche && jeu(S.fiche);
    if (a === "act:desinstaller" && j) return demanderDesinstaller([j]);
    if (a === "act:deplacer" && j) return choisirDestination([j]);
    if (a === "act:page" && j) {
      son("choisir");
      if (!window.__pcvPageJeu?.(j.id)) window.__pcvBridge?.revenirA?.("/library/app/" + j.id);
      return;
    }
    if (a === "sel:desinstaller" && choisis().length) return demanderDesinstaller(choisis());
    if (a === "sel:deplacer" && choisis().length) return choisirDestination(choisis());
    if (k === "d" && disqueVu()) return ACTION_DISQUE[v]?.(disqueVu());
  };
  page.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b || b.disabled) return;
    S.manette = false;
    S.zone = b.dataset.a.startsWith("og:") ? "colonne" : "contenu";
    S.cur = b.dataset.a;
    agir(b.dataset.a);
    curseur();
  });
  const colonne = () => {
    S.zone = "colonne";
    S.choix = null;
    son("retour");
    dessiner();
  };
  const bouger = (b) => {
    const R = rangs(), r = R.findIndex((l2) => l2.includes(vise())), c = R[r]?.indexOf(vise()) ?? -1;
    if (r < 0) {
      S.cur = R[0]?.[0]?.dataset.a ?? null;
      return true;
    }
    if (b === 11 || b === 12) {
      const n = R[r][c + (b === 12 ? 1 : -1)];
      if (!n) return b === 11 ? "gauche" : false;
      S.cur = n.dataset.a;
      return true;
    }
    const l = R[r + (b === 10 ? 1 : -1)];
    if (!l) return false;
    const x = (e) => {
      const q = e.getBoundingClientRect();
      return q.left + q.width / 2;
    }, x0 = x(vise());
    S.cur = l.reduce((m, e) => Math.abs(x(e) - x0) < Math.abs(x(m) - x0) ? e : m).dataset.a;
    return true;
  };
  (window.__pcvManette ||= {}).stockage = (b) => {
    if (!S.actif || window.__pcvDossiers?.modal?.() || b === 5 || b === 6) return false;
    if (S.zone === "onglet" && (b === 3 || b === 7 || b === 8)) {
      son("bord");
      return true;
    }
    if (S.zone === "onglet") {
      if (b !== 10) return false;
      S.zone = "colonne";
      S.manette = true;
      son("bouge");
      curseur();
      return true;
    }
    S.manette = true;
    if (S.zone === "colonne") {
      const liste = onglets(), i = liste.findIndex(([id]) => id === S.og);
      if (b === 2 || b === 9 && i === 0) {
        S.zone = "onglet";
        son("retour");
        curseur();
        return true;
      }
      if (b === 9 || b === 10) {
        const n = liste[i + (b === 10 ? 1 : -1)];
        if (n) agir("og:" + n[0]);
        else son("bord");
        return true;
      }
      if (b === 12 || b === 1) {
        S.zone = "contenu";
        if (!cibles().length) {
          S.zone = "colonne";
          son("bord");
        } else {
          S.cur = null;
          son("bouge");
        }
        curseur();
      }
      return true;
    }
    if (b === 2) {
      if (S.choix) {
        S.choix = null;
        son("retour");
        dessiner();
      } else if (S.fiche) {
        S.fiche = null;
        S.cur = S.retour;
        son("retour");
        dessiner();
      } else colonne();
      return true;
    }
    if (!S.fiche && S.og === "jeux" && (b === 3 || b === 4)) {
      agir(b === 3 ? "choix" : "tri");
      return true;
    }
    if (b === 3 && options().length) {
      window.__pcvDossiers?.choix?.(null, options().map(([a, n, c, t]) => ({ svg: window.__pcvIcones?.trace(n), teinte: `${c}, ${c}`, nom: t, faire: () => agir(a) })), { pres: vise() || page.querySelector(".actions"), ailleurs: true });
      return true;
    }
    if (b >= 9 && b <= 12) {
      const r = bouger(b);
      if (r === "gauche" && !S.fiche) colonne();
      else if (r === true) {
        son("bouge");
        curseur();
      } else son("bord");
      return true;
    }
    if (b === 1 && S.cur) {
      agir(S.cur);
      curseur();
    }
    return true;
  };
  const tuile = () => document.querySelector('.PageListColumn [role=tab][id$="/settings/storage"]');
  const doitMontrer = () => document.body.dataset.pcvPage === "parametres" && tuile()?.getAttribute("aria-selected") === "true" && !window.__pcvSteamU?.ouvert?.() && !window.__pcvEcran?.ouvert?.();
  const ouvrir = () => {
    Object.assign(S, { actif: true, zone: "onglet", fiche: null, choix: null, manette: false });
    page.hidden = false;
    document.body.classList.add("pcv-stockage-ouvert");
    lire();
    dessiner();
  };
  const fermer = () => {
    S.actif = false;
    page.hidden = true;
    document.body.classList.remove("pcv-stockage-ouvert", "pcv-stockage-main");
    window.__pcvDossiers?.fermer?.(false);
  };
  clearInterval(window.__pcvStockageVeille);
  const veiller = () => {
    const v = doitMontrer();
    if (v !== S.actif) v ? ouvrir() : fermer();
  };
  window.__pcvStockageVeille = setInterval(veiller, 300);
  try {
    window.__pcvStockageAbo?.unregister?.();
    window.__pcvStockageAbo = SC().InstallFolder.RegisterForInstallFolderChanges(() => lire());
  } catch (e) {
  }
  try {
    window.__pcvStockageDep?.unregister?.();
    window.__pcvStockageDep = SC().InstallFolder.RegisterForMoveContentProgress(progres);
  } catch (e) {
  }
  function progres(e) {
    if (!S.dep || e?.appid !== S.dep.id) return;
    S.dep.p = e.flProgress;
    page.querySelector(".jq.dep .prog b")?.style.setProperty("--p", e.flProgress);
  }
  window.__pcvStockage = { ouvert: () => S.actif, etat: () => ({ ...S, choix: S.choix && [...S.choix] }), agir, progres, veiller, essai: (d) => {
    banc = !!d;
    disques = d || [];
    lire();
  } };
  return "page Stockage : pr\xEAte";
})();
