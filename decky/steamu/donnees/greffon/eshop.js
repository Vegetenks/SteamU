(() => {
  window.__pcvEshop?.detruire();
  const O = window.opener || window, I = window.__pcvIcones, P = window.__pcvPresentation;
  const T = (k, v) => window.__pcvT?.("eshop." + k, v) || k;
  const e = P.echapper;
  const u = (n) => `calc(var(--u) * ${n})`, ico = (n) => I.svg(n);
  const appel = (m2, ...args) => O.DeckyBackend.call("loader/call_plugin_method", window.__pcvGreffon.nom, "eshop_" + m2, ...args);
  const classer = (store, explorer, installes) => {
    const par = /* @__PURE__ */ new Map();
    for (const p of explorer) par.set(p.nom, { ...p, origine: "non_verifie" });
    for (const p of store) par.set(p.nom, { ...p, origine: "verifie" });
    for (const p of installes) par.set(p.nom, { ...par.get(p.nom) || { ...p, origine: "manuel", versions: [], tags: [] }, installee: p.version || "", installe: true });
    return [...par.values()].sort((a, b) => a.nom.localeCompare(b.nom));
  };
  const rechercher = (plugins2, texte) => {
    const mot = texte.trim().toLocaleLowerCase();
    return plugins2.filter((p) => [p.nom, p.auteur, ...p.tags || []].join(" ").toLocaleLowerCase().includes(mot));
  };
  const RAYONS = [
    ["perf", "perf", /framegen|lsfg|tdp|pause games|autosuspend|performance/i],
    ["manette", "manette", /remapper|magicpods|bluetooth|battery|surround|controller|audio/i],
    ["biblio", "bibliotheque", /tabmaster|shelves|steamgriddb|metadata|junk.store|mods|achievement|playcount|library/i],
    ["amis", "amis", /steamcord|sunshine|muon|network|friends|streaming/i],
    ["outils", "reglages", /./]
  ];
  const rayonDe = (p) => RAYONS.find((r) => r[2].test(p.nom + " " + (p.tags || []).join(" ")))?.[0] || "outils";
  const versionPlusRecente = (a, b) => {
    const lire = (v) => /^(\d+(?:\.\d+)*)(?:-([^+]+))?/.exec(String(v || ""));
    const x = lire(a), y = lire(b);
    if (!x || !y) return false;
    const n = x[1].split(".").map(Number), m2 = y[1].split(".").map(Number);
    for (let i = 0; i < Math.max(n.length, m2.length); i++) {
      if ((n[i] || 0) !== (m2[i] || 0)) return (n[i] || 0) > (m2[i] || 0);
    }
    return !x[2] && !!y[2];
  };
  const derniere = (p) => p.versions?.[0];
  const maj = (p) => !!(p.installe && p.installee && derniere(p)?.version && versionPlusRecente(derniere(p).version, p.installee));
  const motAction = (p) => T(maj(p) ? "maj" : p.installe ? "reglages" : "installer");
  let ficheDemandee = null, plugins = [], catalogue = null, locaux = [], rayon = "tous", operation = null, erreur = "", mort = false, chargement = false;
  let attenteEtat = null, suiviInstallation = null;
  const pauseEtat = () => new Promise((r) => {
    const id = setTimeout(() => {
      attenteEtat = null;
      r();
    }, 1e3);
    attenteEtat = () => {
      clearTimeout(id);
      r();
    };
  });
  const attendreEtat = async (p, version, supprimer = false) => {
    const fin = Date.now() + 9e4;
    while (!mort) {
      await chargerLocaux();
      const present = plugins.find((g) => g.nom === p.nom);
      if (supprimer ? !present?.installe : present?.installe && (present.installee === version || operation?.fini)) return;
      if (Date.now() > fin) throw Error("\xE9tat Decky non confirm\xE9");
      await pauseEtat();
    }
  };
  const duRayon = (p, k) => k === "tous" || (k === "inst" ? p.installe : k === "store" ? p.origine === "verifie" : k === "autres" ? p.origine !== "verifie" : rayonDe(p) === k);
  const liste = () => rechercher(plugins, m.texte).filter((p) => duRayon(p, rayon));
  const options = () => [["tous", T("tous")], ...RAYONS.map(([k]) => [k, T(k)]), ["inst", T("installes")], ["store", T("decky_store")], ["autres", T("autre_source")]];
  const { cotes } = P;
  const provenance = (p) => {
    if (p.origine === "verifie") return T("decky_store");
    if (p.origine === "manuel") return T("installe_main");
    try {
      const h = new URL(p.source).hostname.replace(/^www\./, "");
      return h === "github.com" ? "GitHub" : h;
    } catch (x) {
      return T("autre_source");
    }
  };
  const badges = (p) => `<span class="origine-e">${e(provenance(p))}</span>${p.installe ? `<span class="coin-e${maj(p) ? " maj" : ""}" aria-label="${e(T("installe"))}" title="${e(T("installe"))}">${ico(maj(p) ? "mise-a-jour" : "coche")}</span>` : ""}`;
  const fondRepli = (p) => window.__pcvFondRepli([...p.nom].reduce((n, x) => n + x.charCodeAt(0), 0) % 360);
  const tuile = (p, c, attrs = "", statut2 = true) => `<div class="cel" aria-label="${e(p.nom)}" ${attrs}><div class="im nomme" style="--fond:${fondRepli(p)}"${p.image ? ` data-image="${e(p.nom)}"` : ""}>${P.repliTuile(p.nom, ico("prise"), c)}${statut2 ? badges(p) : ""}</div></div>`;
  const fondImage = (classe, p) => `<div class="${classe} repli" style="--fond:${fondRepli(p)}"${p.image ? ` data-image="${e(p.nom)}"${classe === "fond-r" ? ' data-format="presentation"' : ' data-format="banniere"'}` : ""}>${ico("prise")}</div>`;
  const message = () => chargement ? T("chargement") : erreur || (!plugins.length ? T("vide") : "");
  const rubriques = (p) => [
    ["action", maj(p) ? "mise-a-jour" : p.installe ? "reglages" : "telechargements", motAction(p)],
    ...maj(p) ? [["reglages", "reglages", T("reglages")]] : [],
    ...p.origine === "manuel" ? [] : [["presentation", "info", T("presentation")]],
    ["infos", "info", T("infos")],
    ...p.origine === "manuel" ? [] : [["versions", "calendrier", T("versions")]],
    ...p.installe ? [["supprimer", "supprimer", T("desinstaller")]] : []
  ];
  const statut = (p) => p.origine === "verifie" ? provenance(p) : `${provenance(p)}, ${T("hors_store")}`;
  const gros = (nom, ic, faire, orange = false) => `<button class="gros-r${orange ? " orange" : ""}" data-a="${m.action(faire)}">${ico(ic)}${e(nom)}</button>`;
  const contenuFiche = (p, cle) => {
    const avis = `<div class="bulle-r${p.origine === "non_verifie" ? " ambre" : ""}">${ico(p.origine === "verifie" ? "coche" : "info")}<span>${e(statut(p))}${p.installe ? `<small>${e(T("installe"))}</small>` : ""}${p.root ? `<small>${e(T("root"))}</small>` : ""}</span></div>`;
    let html = "";
    if (cle === "action") {
      html = `${fondImage("banniere", p)}<div class="sous-b">${avis}${gros(motAction(p), p.installe && !maj(p) ? "reglages" : "telechargements", () => agir(p))}</div>`;
      if (operation?.nom === p.nom) html += `<div role="status">${e(T("installation"))}</div><div class="progression${operation.pct == null ? "" : " connue"}" role="progressbar" aria-label="${e(T("etapes"))}" aria-valuemin="0" aria-valuemax="100"${operation.pct == null ? "" : ` aria-valuenow="${operation.pct}"`}><i${operation.pct == null ? "" : ` style="width:${operation.pct}%"`}></i></div>${operation.pct == null ? "" : `<p>${e(T("etapes"))} : ${operation.pct} %</p>`}<p>${e(T("chez_decky"))}</p>`;
      if (p.nom === "Pause Games") html += `<p>${e(T("pause"))}</p>`;
      html += `<p>${e(p.description || "")}</p>${P.mentionAnglais(!!p.description)}`;
    } else if (cle === "reglages") html = gros(T("reglages"), "reglages", () => reglages(p));
    else if (cle === "presentation") html = `${fondImage("fond-r", p)}<div class="verre-r">${p.nom === "Pause Games" ? `<p>${e(T("pause"))}</p>` : ""}<p>${e(p.description || T("sans_description"))}</p>${P.mentionAnglais(!!p.description)}</div>`;
    else if (cle === "infos") html = [[T("auteur"), p.auteur], [T("version"), p.installee || derniere(p)?.version], [T("licence"), p.licence || T("inconnue")], [T("origine"), statut(p)], [T("droits"), T(p.root ? "root" : "utilisateur")], [T("source"), p.source]].filter(([, v]) => v).map(([k, v]) => `<div class="rg verre"><div class="t"><b>${e(k)}</b><small>${e(v)}</small></div></div>`).join("");
    else if (cle === "versions") html = (p.versions || []).map((v) => `<div class="rg verre"><div class="t"><b>${e(v.version)}</b><small>${e(v.date)}</small></div></div>`).join("") || e(T("aucune_version"));
    else html = `<p>${e(T("desinstaller_question", { nom: p.nom }))}</p>${gros(T("desinstaller"), "supprimer", () => demander({ titre: T("desinstaller_titre", { nom: p.nom }), texte: T("desinstaller_texte"), oui: T("desinstaller"), ic: "suppr", svg: "", teinte: void 0, ok: () => desinstaller(p) }), true)}`;
    return html + (erreur ? `<p role="status">${e(erreur)}</p>` : "");
  };
  const ouvrirFiche = (p, l) => {
    if (!p) return;
    erreur = "";
    m.ouvrirFiche(p, l);
  };
  const m = P.magasin({
    id: "pcv-eshop",
    nom: "eshop",
    cle: (p) => p.nom,
    tuile,
    style: `
    .vitrine { display:flex;align-items:center;gap:${u(24)};padding:${u(18)};border-radius:${u(28)};margin-bottom:${u(20)}; }
    .vitrine img { width:${u(340)};height:${u(180)};object-fit:contain;border-radius:${u(20)}; }
    .vitrine.sel { box-shadow:var(--pcv-curseur); }
    .vitrine h1 { margin:${u(8)} 0; } .conseille { color:var(--pcv-orange); }
    .banniere > img, .fond-r > img { width:100%;height:100%;object-fit:cover;border-radius:inherit; }
    .fond-r > img { object-fit:contain; }   
    .banniere, .fond-r { overflow:hidden;isolation:isolate; }   
    .im img { width:100%;height:100%;object-fit:contain; } .im { overflow:hidden; }
    .im.nomme { padding-bottom:22%; }   
    .im.nomme > img, .repli > img { position:absolute;inset:0;border-radius:inherit;z-index:2; } .coin-e, .origine-e { z-index:3; }
    .im.nomme:has(> img) > :is(b, svg) { visibility:hidden; }   
    .repli { background:var(--fond);display:flex;align-items:center;justify-content:center;color:var(--pcv-sur-accent); } .repli > svg { width:${u(64)};height:${u(64)}; }
    .origine-e { position:absolute;left:5%;right:5%;bottom:5%;font-size:${u(10)};background:var(--pcv-carte);color:var(--pcv-texte);border-radius:${u(8)};text-align:center; }
    .coin-e.maj { background:var(--pcv-cyan); }
    .contenu { overflow-y:auto; } .ambre { color:var(--pcv-ambre-texte);background:var(--pcv-ambre-fond,var(--pcv-creux));border-radius:${u(18)};padding:${u(12)}; }
    .progression:not(.connue) i { width:35%;animation:eshop-attente 1.2s ease-in-out infinite alternate; }   
    @keyframes eshop-attente { to { transform:translateX(180%); } }`,
    // la vitrine (Pause Games, conseillé), puis un rayon par sorte de plugin
    porte: () => ({ liste: plugins.filter((p) => p.image), titre: T("tous_plugins"), nombre: T("nb_plugins", { n: plugins.length }), ouvrir: () => m.ouvrirGrille("tous", true) }),
    avant: () => {
      const pause = plugins.find((p) => p.nom === "Pause Games");
      return `<div class="message">${e(message())}</div>` + (pause ? `<button class="vitrine verre" data-g="vitrine" data-a="${m.action(() => ouvrirFiche(pause, plugins))}"><div data-image="${e(pause.nom)}"></div><div><b class="conseille">${e(T("conseille"))}</b><h1>Pause Games</h1><p>${e(T("pause"))}</p></div></button>` : "");
    },
    etageres: () => RAYONS.map(([k, ic]) => ({ cle: k, titre: T(k), icone: ic, items: plugins.filter((p) => rayonDe(p) === k), ouvrir: (p) => ouvrirFiche(p, plugins), tout: () => m.ouvrirGrille(k) })),
    fin: () => T("explorer_credit"),
    peindre: (l) => imagerie.observer(l || void 0),
    grille: {
      onglets: () => options().map(([k, n]) => ({ cle: k, nom: n, n: rechercher(plugins, m.texte).filter((p) => duRayon(p, k)).length })),
      choisir: (k) => {
        rayon = k;
      },
      liste,
      cle: () => plugins.map((p) => p.nom + p.installee).join("|"),
      message,
      bandeau: true,
      rail: { visible: () => !m.texte.trim() },
      ouvrir: (p) => ouvrirFiche(p, m.lignes),
      nomOnglets: () => T("rayon"),
      effacer: () => {
        if (!m.texte) return false;
        m.texte = "";
        m.sel = 0;
        m.rendre();
        return true;
      }
    },
    fiche: {
      rubriques: (p) => rubriques(p).map(([k, ic, n]) => [k, ic, n, k === "supprimer" ? "var(--pcv-orange)" : ""]),
      contenu: contenuFiche,
      classe: () => "riche texte",
      agir: (p) => agir(p),
      page: (p, n, t) => `${ico("boutique")}${e(T("titre"))} <small>${n} / ${t}</small>`,
      voisins: () => T("voisins")
    },
    libelles: (m2) => ({ a: m2.vue === "fiche" && m2.rubrique === 0 ? motAction(m2.fiche) : T("voir") }),
    // la recherche de la page (le registre de barre-haut.js) : QUE les plugins
    loupe: () => ({ texte: m.texte, invite: T("chercher"), chercher: (t) => {
      m.premier = null;
      m.texte = t;
      m.ouvrirGrille("tous");
    } }),
    ferme: () => {
      preparationCachee = false;
      racine.style.visibility = "";
      ficheDemandee = null;
      imagerie.liberer();
    }
  });
  const { racine, ombre } = m;
  const imagerie = P.images({ racine, ombre, charger: (url) => appel("image", url), resoudre: (nom) => plugins.find((p) => p.nom === nom)?.image });
  const TEINTES = { prise: "color-mix(in srgb, var(--pcv-cyan-plein) 60%, #fff), var(--pcv-cyan-plein)", alerte: "#ffb35c, #ff7a1f", root: "#ff8a8a, #e5484d" };
  const demander = (o) => {
    if (!window.__pcvDossiers?.demander?.({ ailleurs: true, svg: I.trace("prise"), teinte: TEINTES.prise, non: T("annuler"), ...o })) window.__pcvSon?.("bord");
  };
  const reglages = (p) => {
    try {
      O.__pcvPluginAouvrir = p.nom;
      window.__pcvBridge.openQuickAccessTab(999);
    } catch (_) {
      erreur = T("erreur");
      m.rendreFiche();
    }
  };
  const question = (p, autorise) => {
    const hors = p.origine !== "verifie";
    if (hors && !autorise) return { bloque: true, titre: T("bloque_titre"), texte: T("bloque_texte"), oui: T("ouvrir_reglages"), danger: false, svg: I.trace("reglages") };
    return {
      titre: T(p.root ? "root_titre" : maj(p) ? "maj_question" : "installer_question", { nom: p.nom }),
      oui: motAction(p),
      danger: hors || !!p.root,
      texte: [p.root && T("root_texte", { nom: p.nom }), hors && T("non_verifie_store")].filter(Boolean).join(" "),
      teinte: p.root ? TEINTES.root : hors ? TEINTES.alerte : TEINTES.prise
    };
  };
  const agir = (p) => {
    if (operation) return;
    if (p.installe && !maj(p)) return reglages(p);
    const q = question(p, !!window.__pcvSteamU?.horsStore?.());
    demander({ ...q, ok: q.bloque ? () => window.__pcvSteamU?.ouvrir?.("plugins") : () => installer(p) });
  };
  const suivreInstallation = (nom) => {
    const backend = O.DeckyBackend;
    let actif = false;
    const peindre = (pct) => {
      if (mort || operation?.nom !== nom) return;
      operation.pct = pct;
      window.__pcvTelechEshop = { pct };
      window.__pcvTelechMaj?.();
      if (!m.racine.hidden && m.vue === "fiche" && m.fiche?.nom === nom) m.rendreFiche();
    };
    const debut = (n) => {
      actif = n === nom;
      if (actif) peindre(0);
    };
    const progression = (pct) => {
      if (actif && Number.isFinite(pct)) peindre(Math.max(0, Math.min(100, pct)));
    };
    const fin = (n) => {
      if (actif && n === nom) {
        peindre(100);
        actif = false;
        operation.fini = true;
        attenteEtat?.();
      }
    };
    const INVITE = "loader/add_plugin_install_prompt", decky = [...backend.eventListeners?.get?.(INVITE) || []];
    const invite = (n, ...reste) => {
      if (n === nom) backend.call("utilities/confirm_plugin_install", reste[1]);
      else decky.forEach((f) => f(n, ...reste));
    };
    decky.forEach((f) => backend.removeEventListener(INVITE, f));
    const evenements = [["loader/plugin_download_start", debut], ["loader/plugin_download_info", progression], ["loader/plugin_download_finish", fin], [INVITE, invite]];
    evenements.forEach(([n, f]) => backend.addEventListener(n, f));
    const arreter = () => {
      evenements.forEach(([n, f]) => backend.removeEventListener(n, f));
      decky.forEach((f) => backend.addEventListener(INVITE, f));
      delete window.__pcvTelechEshop;
      window.__pcvTelechMaj?.();
    };
    return arreter;
  };
  const archive = async (p) => {
    const v = derniere(p);
    return v?.url || p.origine !== "non_verifie" || !p.source ? v : await appel("github", p.source);
  };
  const installer = async (p) => {
    if (operation) return;
    operation = { nom: p.nom };
    erreur = "";
    m.rendreFiche();
    const arreter = suivreInstallation(p.nom);
    suiviInstallation = arreter;
    try {
      const v = await archive(p);
      if (!v?.url) {
        erreur = T("archive_absente");
        return;
      }
      const r = await O.DeckyBackend.call("utilities/install_plugin", v.url, p.nom, v.version, v.sha256 || "", p.installe ? 2 : 0);
      if (r === false) throw Error();
      await attendreEtat(p, v.version);
      if (p.origine !== "verifie") {
        retenir(p.nom, v.version);
        await chargerLocaux();
        window.__pcvMajPluginsVerifier?.();
      }
    } catch (_) {
      erreur = T("erreur");
    } finally {
      arreter();
      suiviInstallation = null;
      operation = null;
      if (!mort && !m.racine.hidden) m.rendre();
    }
  };
  const desinstaller = async (p) => {
    if (operation) return;
    operation = { nom: p.nom };
    try {
      const r = await O.DeckyBackend.call("utilities/uninstall_plugin", p.nom);
      if (r === false) throw Error();
      await attendreEtat(p, "", true);
    } catch (_) {
      erreur = T("erreur");
    } finally {
      operation = null;
      m.rubrique = 0;
      if (!mort && !m.racine.hidden) m.rendre();
    }
  };
  const fusionner = () => {
    plugins = classer(catalogue?.store || [], catalogue?.explorer || [], locaux);
    if (m.fiche) {
      const nom = m.fiche.nom;
      m.fiche = plugins.find((p) => p.nom === nom) || null;
      m.voisins = m.voisins.map((p) => plugins.find((g) => g.nom === p.nom)).filter(Boolean);
      if (!m.fiche) m.vue = m.retour?.vue || "etageres";
    }
  };
  const GITHUB = "pcv-plugins-github";
  const installesGithub = () => {
    try {
      return JSON.parse(localStorage.getItem(GITHUB)) || {};
    } catch (_) {
      return {};
    }
  };
  const retenir = (nom, tag) => {
    const g = installesGithub(), l = locaux.find((x) => x.nom === nom);
    if (!l) return;
    g[nom] = { tag, paquet: l.paquet };
    try {
      localStorage.setItem(GITHUB, JSON.stringify(g));
    } catch (_) {
    }
  };
  const chargerLocaux = async () => {
    const manifests = await appel("installes"), decky = O.DeckyPluginLoader?.deckyState?._plugins, g = installesGithub();
    locaux = manifests.map((p) => {
      const v = p.version || (Array.isArray(decky) ? decky.find((x) => x.name === p.nom)?.version : "") || "";
      return { ...p, paquet: v, version: g[p.nom]?.paquet === v ? g[p.nom].tag : v };
    });
    fusionner();
  };
  const charger = () => {
    if (chargement) return preparationCatalogue;
    return preparationCatalogue = (async () => {
      chargement = true;
      erreur = "";
      m.rendre();
      const resultats = await Promise.allSettled([appel("catalogues"), chargerLocaux()]);
      if (mort) return;
      if (resultats[0].status === "fulfilled") {
        catalogue = resultats[0].value;
        if (catalogue.erreurs?.length) erreur = T("hors_ligne");
      } else erreur = T("hors_ligne");
      if (resultats[1].status === "rejected") erreur = T("installes_indisponibles");
      fusionner();
      chargement = false;
      m.rendre();
      if (ficheDemandee && !racine.hidden) {
        const p = plugins.find((p2) => p2.nom === ficheDemandee);
        ficheDemandee = null;
        ouvrirFiche(p, plugins);
      }
    })();
  };
  let preparationCatalogue = null, cataloguePrepare = null, preparationCachee = false;
  const preparer = () => (cataloguePrepare = charger()).then(async () => {
    if (mort || !racine.hidden) return;
    preparationCachee = true;
    racine.style.visibility = "hidden";
    m.vue = "etageres";
    m.montrer(false);
    try {
      await imagerie.preparer(P.premierEcran(ombre.querySelector(".etageres"), ombre.querySelectorAll("[data-image]"), m.porte));
    } finally {
      if (preparationCachee) m.cacher();
    }
  });
  (window.__pcvPreparer ||= {}).plugins = () => preparationCatalogue;
  window.__pcvEshop = {
    preparer,
    fond: fondRepli,
    chercher: async (mot) => {
      await (preparationCatalogue || charger());
      return rechercher(plugins, mot);
    },
    // les plugins installés hors du Decky Store dont une version plus récente est annoncée (notifs.js les propose ; Decky garde ceux du Store)
    majs: async () => {
      await (preparationCatalogue || charger());
      return plugins.filter((p) => maj(p) && p.origine !== "verifie");
    },
    ouvrir: (nom, retour, recherche) => {
      preparationCachee = false;
      racine.style.visibility = "";
      m.auRetour = retour || null;
      ficheDemandee = nom || null;
      m.debut();
      m.premier = recherche == null ? null : nom ? "fiche" : "grille";
      if (m.premier === "grille") {
        m.vue = "grille";
        m.onglet = rayon = "tous";
        m.texte = recherche;
      }
      m.montrer();
      const prepare = cataloguePrepare;
      cataloguePrepare = null;
      if (!prepare) charger();
      else if (ficheDemandee && !chargement) {
        ouvrirFiche(plugins.find((p) => p.nom === ficheDemandee), plugins);
        ficheDemandee = null;
      }
    },
    ouvert: () => !racine.hidden && !preparationCachee,
    fermer: m.fermer,
    detruire: () => {
      mort = true;
      suiviInstallation?.();
      attenteEtat?.();
      m.detruire();
      imagerie.detruire();
      delete window.__pcvPreparer.plugins;
    }
  };
  return "eShop pr\xEAt";
})();
