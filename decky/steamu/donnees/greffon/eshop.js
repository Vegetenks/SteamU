(() => {
  window.__pcvEshop?.detruire();
  const O = window.opener || window, I = window.__pcvIcones, P = window.__pcvPresentation;
  const T = (k, v) => window.__pcvT?.("eshop." + k, v) || k;
  const e = P.echapper;
  const u = (n) => `calc(var(--u) * ${n})`, ico = (n) => I.svg(n);
  const appel = (m2, ...args) => O.DeckyBackend.call("loader/call_plugin_method", window.__pcvGreffon.nom, "eshop_" + m2, ...args);
  const cle = (n) => String(n || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const memeNom = (a, l) => l.some((n) => n && cle(n) === cle(a));
  const classer = (store, hub, installes) => {
    const par = new Map(hub.map((p) => [p.nom, p]));
    for (const s of store) {
      const h = hub.find((g) => g.nom === s.nom || g.noms?.includes(s.nom));
      if (h && (h.exclu || h.analyse === "propre" && !versionPlusRecente(derniere(s)?.version, derniere(h)?.version))) par.set(h.nom, { ...h, image: s.image || h.image });
      else {
        if (h) par.delete(h.nom);
        par.set(s.nom, { ...s, ...h ? { ia: h.ia, fork: h.fork, telechargements: h.telechargements, etoiles: h.etoiles } : {}, origine: "verifie" });
      }
    }
    for (const p of installes) {
      const d = [...par.values()].find((g) => g.installe && memeNom(p.nom, [g.nom]));
      if (d) {
        d.dossiers.push(p.dossier);
        d.copies.push(p);
        if (versionPlusRecente(d.installee, p.version)) d.installee = p.version || "";
        continue;
      }
      const libres = [...par.values()].filter((g) => !g.installe), c = par.get(p.nom) && !par.get(p.nom).installe ? par.get(p.nom) : libres.find((g) => g.noms?.includes(p.nom)) || libres.find((g) => memeNom(p.nom, [g.nom, ...g.noms || []]));
      if (c) par.delete(c.nom);
      par.set(p.nom, { ...c || { ...p, origine: "manuel", versions: [], tags: [] }, nom: p.nom, nomCatalogue: c?.nom, installee: p.version || "", installe: true, dossiers: [p.dossier], copies: [p] });
    }
    for (const g of [...par.values()]) if (!g.installe && [...par.values()].some((x) => x.installe && memeNom(g.nom, [x.nom, x.nomCatalogue]))) par.delete(g.nom);
    return [...par.values()].filter((p) => !p.exclu || p.installe).sort((a, b) => a.nom.localeCompare(b.nom));
  };
  const POPULARITE = (a, b) => (b.telechargements || 0) - (a.telechargements || 0) || (b.etoiles || 0) - (a.etoiles || 0) || a.nom.localeCompare(b.nom);
  const RECOMMANDES = [];
  const TRIS = ["nom", "popularite"], LIMITE_VITRINE = 9, RECENT = 30 * 864e5;
  const preparerVitrine = (l, maintenant = Date.now()) => {
    const populaires2 = l.filter((p) => p.telechargements > 0 || p.etoiles > 0).sort(POPULARITE).slice(0, LIMITE_VITRINE);
    const recentes = l.map((p) => ({ p, date: Math.max(0, ...(p.versions || []).map((v) => Date.parse(v.date) || 0)) })).filter(({ date }) => date > 0 && date <= maintenant && maintenant - date <= RECENT).sort((a, b) => b.date - a.date).slice(0, LIMITE_VITRINE).map(({ p }) => p);
    const recommandes = l.filter((p) => RECOMMANDES.includes(p.nomCatalogue || p.nom));
    return [.../* @__PURE__ */ new Set([...recommandes, ...populaires2.flatMap((p, i) => [p, recentes[i]]).filter(Boolean), ...recentes])].slice(0, LIMITE_VITRINE).map((p) => ({ ...p, vedettes: [recommandes.includes(p) && "recommande", populaires2.includes(p) && "populaire", recentes.includes(p) && "nouveaute"].filter(Boolean) }));
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
  const motAction = (p) => T(maj(p) ? "maj" : p.copies?.length > 1 ? "garder_recente" : p.installe ? "reglages" : "installer");
  let ficheDemandee = null, plugins = [], catalogue = null, locaux = [], rayon = "tous", operation = null, erreur = "", mort = false, chargement = false;
  let tri = "nom", populaires = [], vitrine = [], menuTri = null, catalogueClasse = void 0, ordrePopulaire = [], choixVitrine = [];
  let attenteEtat = null, suiviInstallation = null, reussi = null;
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
  const trouver = (p) => plugins.find((g) => memeNom(g.nom, [p.nom, p.nomCatalogue]) || memeNom(g.nomCatalogue, [p.nom, p.nomCatalogue]));
  const attendreEtat = async (p, version, supprimer = false) => {
    const fin = Date.now() + 9e4;
    while (!mort) {
      await chargerLocaux();
      const present = trouver(p);
      if (supprimer ? !present?.installe : present?.installe && (present.installee === version || operation?.fini)) return;
      if (Date.now() > fin) throw echec("delai");
      await pauseEtat();
    }
  };
  const echec = (k, v) => Object.assign(Error(T(k, v)), { raison: true });
  const duRayon = (p, k) => k === "tous" || (k === "inst" ? p.installe : k === "store" ? p.origine === "verifie" : k === "hub" ? p.origine === "deckyhub" : rayonDe(p) === k);
  const liste = () => rechercher(tri === "popularite" ? populaires : plugins, m.texte).filter((p) => duRayon(p, rayon));
  const options = () => [["tous", T("tous")], ...RAYONS.map(([k]) => [k, T(k)]), ["inst", T("installes")], ["store", T("decky_store")], ["hub", "DeckyHub"]];
  const { cotes } = P;
  const provenance = (p) => p.origine === "verifie" ? T("decky_store") : p.origine === "deckyhub" ? "DeckyHub" : T("installe_main");
  const etiquettes = (p) => [p.ia && "ia", p.fork && "fork", ...p.vedettes || []].filter(Boolean).map((k) => T(k));
  const badges = (p) => `<span class="origine-e">${[provenance(p), ...etiquettes(p)].map(e).join("<br>")}</span>${p.installe ? `<span class="coin-e${maj(p) ? " maj" : ""}" aria-label="${e(T("installe"))}" title="${e(T("installe"))}">${ico(maj(p) ? "mise-a-jour" : "coche")}</span>` : ""}`;
  const fondRepli = (p) => window.__pcvFondRepli([...p.nom].reduce((n, x) => n + x.charCodeAt(0), 0) % 360);
  const tuile = (p, c, attrs = "", statut = true) => `<div class="cel" aria-label="${e(p.nom)}" ${attrs}><div class="im nomme" style="--fond:${fondRepli(p)}"${p.image ? ` data-image="${e(p.nom)}"` : ""}>${P.repliTuile(p.nom, ico("prise"), c, true)}${statut ? badges(p) : ""}</div></div>`;
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
  const gros = (nom, ic, faire, orange = false) => `<button class="gros-r${orange ? " orange" : ""}" data-a="${m.action(faire)}">${ico(ic)}${e(nom)}</button>`;
  const confiance = (p) => [
    p.installe && T(p.copies?.length > 1 ? "doublon" : "installe", { n: p.copies?.length }),
    p.analyse && T("analyse_" + p.analyse),
    p.root && T("root"),
    Date.now() - Date.parse(derniere(p)?.date) > 365 * 864e5 && T("vieux"),
    p.avertissements?.includes("blocked") && T("bloque_audit"),
    p.avertissements?.includes("private-data") && T("donnees_privees")
  ].filter(Boolean);
  const contenuFiche = (p, cle2) => {
    const avis = `<div class="bulle-r">${ico("info")}<span>${e(provenance(p))}${[...etiquettes(p), ...confiance(p)].map((t) => `<small>${e(t)}</small>`).join("")}</span></div>`;
    let html = "";
    if (cle2 === "action") {
      html = `${fondImage("banniere", p)}<div class="sous-b">${avis}${gros(motAction(p), p.copies?.length > 1 && !maj(p) ? "supprimer" : p.installe && !maj(p) ? "reglages" : "telechargements", () => agir(p))}</div>`;
      if (operation?.nom === p.nom) html += `<div role="status">${e(T("installation"))}</div>${operation.pct == null ? window.__pcvChargement.html() : `<div class="progression connue" role="progressbar" aria-label="${e(T("etapes"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${operation.pct}"><i style="width:${operation.pct}%"></i></div>`}${operation.pct == null ? "" : `<p>${e(T("etapes"))} : ${operation.pct} %</p>`}<p>${e(T("chez_decky"))}</p>`;
      if (reussi?.nom === p.nom && !operation) html += `<p role="status">${e(reussi.texte)}</p>`;
      html += `<p>${e(p.description || "")}</p>${P.mentionAnglais(!!p.description)}`;
    } else if (cle2 === "reglages") html = gros(T("reglages"), "reglages", () => reglages(p));
    else if (cle2 === "presentation") html = `${fondImage("fond-r", p)}<div class="verre-r"><p>${e(p.description || T("sans_description"))}</p>${P.mentionAnglais(!!p.description)}</div>`;
    else if (cle2 === "infos") html = [[T("auteur"), p.auteur], [T("version"), p.installee || derniere(p)?.version], [T("licence"), p.licence || T("inconnue")], [T("origine"), provenance(p)], [T("droits"), T(p.root ? "root" : "utilisateur")], [T("source"), p.source]].filter(([, v]) => v).map(([k, v]) => `<div class="rg verre"><div class="t"><b>${e(k)}</b><small>${e(v)}</small></div></div>`).join("");
    else if (cle2 === "versions") html = (p.versions || []).map((v) => `<div class="rg verre"><div class="t"><b>${e(v.version)}</b><small>${e(v.date)}</small></div></div>`).join("") || e(T("aucune_version"));
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
    .banniere > img, .fond-r > img { width:100%;height:100%;object-fit:cover;border-radius:inherit; }
    .fond-r > img { object-fit:contain; }   
    .banniere, .fond-r { overflow:hidden;isolation:isolate; }   
    .im img { width:100%;height:100%;object-fit:contain; } .im { overflow:hidden; }
    .im.nomme > b { overflow-wrap:normal;-webkit-line-clamp:2;max-width:100%; }   
    .im.nomme { padding-bottom:22%; }   
    .im.nomme > img, .repli > img { position:absolute;inset:0;border-radius:inherit;z-index:2; } .coin-e, .origine-e { z-index:3; }
    .im.nomme:has(> img) > :is(b, svg) { visibility:hidden; }   
    .repli { background:var(--fond);display:flex;align-items:center;justify-content:center;color:var(--pcv-sur-accent); } .repli > svg { width:${u(64)};height:${u(64)}; }
    .origine-e { position:absolute;left:5%;right:5%;bottom:5%;font-size:${u(10)};background:var(--pcv-carte);color:var(--pcv-texte);border-radius:${u(8)};text-align:center; }
    .coin-e.maj { background:var(--pcv-cyan); }
    .contenu { overflow-y:auto; }
`,
    // La vitrine emploie les mêmes étagères, gestes et animations que les rayons.
    // (une image cherchée dans le dépôt d'un greffon de DeckyHub, peut-être absente : pas sur la porte)
    porte: () => ({ liste: plugins.filter((p) => p.image && p.image !== p.source), titre: T("tous_plugins"), nombre: T("nb_plugins", { n: plugins.length }), ouvrir: () => m.ouvrirGrille("tous", true) }),
    chargement: () => chargement,
    avant: () => `<div class="message" role="status">${chargement ? window.__pcvChargement.html() : ""}${e(message())}</div>`,
    etageres: () => [...vitrine.length ? [{ cle: "vitrine", titre: T("vitrine"), icone: "prise", items: vitrine, ouvrir: (p) => ouvrirFiche(p, vitrine) }] : [], ...RAYONS.map(([k, ic]) => ({ cle: k, titre: T(k), icone: ic, items: plugins.filter((p) => rayonDe(p) === k), ouvrir: (p) => ouvrirFiche(p, plugins), tout: () => m.ouvrirGrille(k) }))],
    fin: () => T("catalogues_credit"),
    peindre: (l) => {
      imagerie.observer(l || void 0);
      tenirMots(l || [ombre]);
    },
    grille: {
      onglets: () => options().map(([k, n]) => ({ cle: k, nom: n, n: rechercher(plugins, m.texte).filter((p) => duRayon(p, k)).length })),
      choisir: (k) => {
        rayon = k;
      },
      liste,
      puce: () => `<button class="puce-f verre${menuTri != null ? " ouvert" : ""}" data-menu="trier">${e(T("trier"))} <small>${e(T("tri_" + tri))}</small><span class="chevron">${ico("fleche")}</span></button>`,
      menu: () => ouvrirTri(),
      cle: () => tri + plugins.map((p) => p.nom + p.installee).join("|"),
      message,
      bandeau: true,
      rail: { visible: () => !m.texte.trim() && tri === "nom" },
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
      etat: (p) => p.installe ? maj(p) ? "maj" : "ok" : "",
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
    clic: (x) => {
      if (menuTri == null) return false;
      const l = x.target.closest?.("[data-tri]");
      if (l) validerTri(+l.dataset.tri);
      else if (x.target.closest?.(".voile, [data-menu]")) fermerTri();
      return true;
    },
    ferme: () => {
      fermerTri();
      preparationCachee = false;
      racine.style.visibility = "";
      ficheDemandee = null;
      imagerie.liberer();
    }
  });
  const { racine, ombre } = m;
  const fermerTri = () => {
    if (menuTri == null) return;
    menuTri = null;
    m.calque = null;
    m.$(".menus").innerHTML = "";
    window.__pcvVoile?.("tri", false);
    m.$(".puce-f .menu")?.remove();
    m.dessinerOnglets();
    m.legende();
  };
  const validerTri = (i) => {
    fermerTri();
    tri = TRIS[i];
    m.choisirOnglet(rayon);
  };
  const marquerTri = () => m.$(".menu").querySelectorAll(".ligne").forEach((x, i) => x.classList.toggle("choisi", i === menuTri));
  const ouvrirTri = () => {
    if (menuTri != null) return fermerTri();
    menuTri = TRIS.indexOf(tri);
    m.calque = { fermer: fermerTri, legende: () => [[1, T("voir")], [2, T("annuler")]], touche: (b) => {
      if (b === 9 || b === 10) {
        menuTri = (menuTri + (b === 10 ? 1 : -1) + TRIS.length) % TRIS.length;
        marquerTri();
      } else if (b === 1) validerTri(menuTri);
      else if (b === 2) fermerTri();
      else window.__pcvSon?.("bord");
    } };
    m.dessinerOnglets();
    m.$(".menus").innerHTML = `<div class="voile"></div>`;
    window.__pcvVoile?.("tri", true);
    m.$(".puce-f").insertAdjacentHTML("beforeend", `<div class="menu pcv-fenetre">${TRIS.map((k, i) => `<div class="ligne${k === tri ? " coche" : ""}" data-tri="${i}"><span class="n">${e(T("tri_" + k))}</span></div>`).join("")}</div>`);
    window.__pcvApparition?.(m.$(".puce-f .menu"));
    marquerTri();
    m.legende();
  };
  const tenirMots = (l) => {
    const noms = l.flatMap((r) => [...r.querySelectorAll(".im.nomme > b")]).filter((b) => b.clientWidth);
    noms.forEach((b) => {
      b.style.fontSize = "";
    });
    noms.filter((b) => b.scrollWidth > b.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1).forEach((b) => window.__pcvTenirMot?.(b, 5, true));
  };
  const imagerie = P.images({ racine, ombre, charger: (url) => appel("image", url), resoudre: (nom) => plugins.find((p) => p.nom === nom)?.image });
  const TEINTES = { prise: "color-mix(in srgb, var(--pcv-cyan-plein) 60%, #fff), var(--pcv-cyan-plein)", root: "#ff8a8a, #e5484d" };
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
  const agir = (p) => {
    if (operation) return;
    const double = p.copies?.length > 1, v = { nom: p.nom, n: p.copies?.length, dossiers: p.dossiers?.join(", ") };
    if (p.installe && !maj(p) && !double) return reglages(p);
    const texte = [p.root && !(double && !maj(p)) && T("root_texte", v), double && T(maj(p) ? "doublon_maj" : "doublon_texte", v)].filter(Boolean).join(" ");
    if (!texte) return installer(p);
    demander({ titre: T(double ? "doublon_titre" : "root_titre", v), texte, oui: motAction(p), danger: true, teinte: p.root ? TEINTES.root : void 0, ok: () => double && !maj(p) ? dedoubler(p) : installer(p) });
  };
  const suivreInstallation = (nom) => {
    const backend = O.DeckyBackend;
    let actif = false;
    const peindre = (pct) => {
      if (mort || operation?.nom !== nom) return;
      operation.pct = pct;
      window.__pcvTelechEshop = { pct };
      window.__pcvTelechMaj?.();
      window.__pcvEshopSuivi?.();
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
  const retirerCopie = async (nom) => {
    const r = await O.DeckyBackend.call("utilities/uninstall_plugin", nom);
    if (r === false) throw echec("refus_decky");
    await chargerLocaux();
  };
  const installer = async (p) => {
    if (operation) return { erreur: T("occupe") };
    operation = { nom: p.nom };
    erreur = "";
    reussi = null;
    m.rendreFiche();
    const arreter = suivreInstallation(p.nom);
    suiviInstallation = arreter;
    try {
      const v = derniere(p);
      if (!v?.url) {
        erreur = T("archive_absente");
        return { erreur };
      }
      const nom = p.nomCatalogue || p.nom;
      for (const c of p.copies || []) if (c.nom !== nom && trouver(p)?.copies.some((x) => x.dossier === c.dossier)) await retirerCopie(c.nom);
      let reste = [];
      for (let tour = 0; tour < (p.dossiers?.length || 1); tour++) {
        if (tour) {
          operation.fini = false;
          operation.pct = null;
        }
        const r = await O.DeckyBackend.call("utilities/install_plugin", v.url, nom, v.version, v.sha256 || "", p.installe ? 2 : 0);
        if (r === false) throw echec("refus_decky");
        await attendreEtat(p, v.version);
        reste = trouver(p)?.dossiers || [];
        if (reste.length < 2) break;
      }
      if (reste.length > 1) throw echec("copies", { nom: p.nom, dossiers: reste.join(", ") });
      if (p.origine !== "verifie") {
        retenir(nom, v.version);
        await chargerLocaux();
      }
      window.__pcvMajPluginsVerifier?.();
      reussi = { nom: p.nom, texte: T(p.installe ? "maj_reussie" : "installe_reussi", { nom: p.nom, version: v.version }) };
      return { ok: true };
    } catch (x) {
      erreur = x?.raison ? x.message : T("erreur");
      return { erreur };
    } finally {
      arreter();
      suiviInstallation = null;
      operation = null;
      if (!mort && !m.racine.hidden) m.rendre();
    }
  };
  const dedoubler = async (p) => {
    if (operation) return;
    const garde = p.copies.reduce((a, c) => versionPlusRecente(c.version, a.version) ? c : a);
    operation = { nom: p.nom };
    erreur = "";
    reussi = null;
    let suite = false;
    try {
      for (let k = 0; k < p.copies.length; k++) {
        const c = trouver(p)?.copies.find((x) => x.nom !== garde.nom);
        if (!c) break;
        await retirerCopie(c.nom);
      }
      const q = trouver(p);
      if (q?.copies.length > 1) {
        if (!derniere(q)?.url) throw echec("copies", { nom: p.nom, dossiers: q.dossiers.join(", ") });
        suite = q;
      } else reussi = { nom: p.nom, texte: T("doublon_regle", { nom: p.nom, version: garde.version }) };
    } catch (x) {
      erreur = x?.raison ? x.message : T("erreur");
    } finally {
      operation = null;
      if (!mort && !m.racine.hidden) m.rendre();
    }
    if (suite) return installer(suite);
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
  const actualiserClassements = () => {
    const id = (p) => p.nomCatalogue || p.nom;
    if (catalogueClasse !== catalogue) {
      catalogueClasse = catalogue;
      ordrePopulaire = [...plugins].sort(POPULARITE).map(id);
      choixVitrine = preparerVitrine(plugins).map((p) => ({ nom: id(p), vedettes: p.vedettes }));
    }
    const par = new Map(plugins.map((p) => [id(p), p])), connus = new Set(ordrePopulaire);
    populaires = [...ordrePopulaire.map((nom) => par.get(nom)).filter(Boolean), ...plugins.filter((p) => !connus.has(id(p)))];
    vitrine = choixVitrine.filter(({ nom }) => par.has(nom)).map(({ nom, vedettes }) => ({ ...par.get(nom), vedettes }));
  };
  const fusionner = () => {
    plugins = classer(catalogue?.store || [], catalogue?.deckyhub || [], locaux);
    actualiserClassements();
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
    majs: async (tous) => {
      await (preparationCatalogue || charger());
      return plugins.filter((p) => maj(p) && (tous || p.origine !== "verifie"));
    },
    // (12/11) le centre des mises à jour (telechargements.js) : la même installation, sans question (posée là-bas, une fois),
    // et les tuiles de l'eShop
    installer: async (nom) => {
      await (preparationCatalogue || charger());
      const p = plugins.find((g) => g.nom === nom);
      return !p ? { erreur: T("erreur") } : maj(p) ? installer(p) : { ok: true };
    },
    operation: () => operation,
    tuile: (p, c, attrs) => tuile(p, c, attrs, false),
    image: (url) => appel("image", url),
    resoudre: (nom) => plugins.find((p) => p.nom === nom)?.image,
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
