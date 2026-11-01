(() => {
  window.__pcvEshopThemes?.detruire();
  const I = window.__pcvIcones, P = window.__pcvPresentation;
  const T = (k, v) => window.__pcvT?.("eshop_themes." + k, v) || k, Te = (k, v) => window.__pcvT?.("eshop." + k, v) || k;
  const e = P.echapper, ico = (n) => I.svg(n), u = (n) => `calc(var(--u) * ${n})`, { cotes } = P;
  const SITES = { switch: () => window.__pcvThemezer?.switch?.donnees, wiiu: () => window.__pcvThemezer?.wiiu?.donnees, "3ds": () => window.__pcvThemePlaza?.donnees };
  const SITE_NOM = { switch: "Themezer", wiiu: "Themezer", "3ds": "ThemePlaza", steamu: "SteamU" };
  const RAYONS = [["wiiu", "telecharges", "wiiu"], ["3ds", "telecharges", "portable"], ["switch", "telecharges", "switch"], ["switch", "recents", "switch"]];
  const cleR = (s, tri, texte = "") => s + ":" + tri + ":" + texte;
  let listes = /* @__PURE__ */ new Map(), ecoute = null, mort = false;
  const ecoutes = [];
  const siteDe = (k) => k.split(":")[0], triDe = (k) => k.split(":")[1], texteDe = (k) => k.split(":").slice(2).join(":");
  const donnees = (s) => s === "steamu" ? window.__pcvThemes?.donnees : SITES[s]?.();
  const sitesDe = (k) => siteDe(k) === "tous" ? Object.keys(SITES).map((s) => cleR(s, triDe(k), texteDe(k))) : [k];
  const nomRayon = (k) => texteDe(k) ? T("resultats", { texte: texteDe(k) }) : T("rayon", { console: donnees(siteDe(k))?.nom || siteDe(k), tri: window.__pcvT?.((siteDe(k) === "3ds" ? "themeplaza." : "themezer.") + (triDe(k) === "telecharges" ? "populaires" : triDe(k))) || triDe(k) });
  const charger = async (k, suite = false) => {
    if (siteDe(k) === "tous") return Promise.all(sitesDe(k).map((x) => charger(x, suite)));
    const l = listes.get(k) || { themes: [], page: 0, pages: 1, total: 0, charge: false, erreur: "", verification: false };
    listes.set(k, l);
    if (l.charge || (suite ? l.page >= l.pages : l.page > 0)) return;
    const d = donnees(siteDe(k));
    if (!d) {
      l.erreur = window.__pcvT?.("themes.script_pas_charge") || "?";
      return m.rendre();
    }
    l.charge = true;
    l.erreur = "";
    m.rendre();
    const r = await d.chercher(texteDe(k), l.page + 1, triDe(k));
    l.charge = false;
    if (mort) return;
    if (r?.verification) l.verification = true;
    else if (!r || r.erreur || !Array.isArray(r.themes)) l.erreur = r?.erreur || window.__pcvT?.("commun.pas_de_reponse") || "?";
    else {
      l.verification = false;
      l.themes = [...l.themes, ...r.themes.map((t) => ({ ...t, site: siteDe(k) }))];
      l.page = r.page || l.page + 1;
      l.pages = r.pages || l.page;
      l.total = r.total || l.themes.length;
    }
    m.rendre();
  };
  const themesDe = (k) => sitesDe(k).flatMap((x) => listes.get(x)?.themes || []);
  const cle = (t) => t.site + ":" + t.id;
  const installe = (t) => !!donnees(t.site)?.installe(t.id);
  const apercu = (t, ecran = 0) => donnees(t.site)?.apercu(t.id, ecran);
  const fondDe = (x) => !x ? "" : /^(blob|https?|data):/.test(x) ? ` style="background-image:url('${e(x)}')"` : ` style="background:${e(x)}"`;
  const tuile = (t, c, attrs = "") => `<div class="cel" aria-label="${e(t.titre)}" ${attrs}><div class="im${t.site === "3ds" ? " d3" : ""}" data-t="${e(cle(t))}"${fondDe(apercu(t))}>${apercu(t) ? "" : ico(t.contenu?.accueil === false ? "musique" : "nuancier")}${I.contenu(t.contenu || (t.musique ? { musique: true } : {}))}${importe(t) ? `<span class="coin-e" aria-label="${e(Te("installe"))}">${ico("coche")}</span>` : ""}</div></div>`;
  let peinture = 0;
  const peindreTuiles = (dans) => {
    for (const el of dans.querySelectorAll(".im[data-t]:not([style])")) {
      const [s, ...id] = el.dataset.t.split(":"), t = { site: s, id: id.join(":") }, url = apercu(t);
      if (url) {
        el.style.backgroundImage = `url('${url}')`;
        el.querySelector("svg")?.remove();
      }
    }
  };
  const peindre = (fiche = false) => {
    peinture ||= requestAnimationFrame(() => {
      peinture = 0;
      if (m.racine.hidden) return;
      peindreTuiles(m.ombre);
      if (fiche && m.vue === "fiche" && m.fiche) {
        const d = donnees(m.fiche.site);
        if (d?.etat(m.fiche.id) || m.rubrique === 0 || m.ombre.querySelector(".banniere:not([style]), .ecrans-f div:not([style])")) m.rendreFiche();
      }
    });
  };
  const message = (k) => {
    if (siteDe(k) === "tous") {
      const m2 = sitesDe(k).map(message);
      return themesDe(k).length ? "" : m2.find((x) => x === T("chargement")) || m2.find((x) => x !== T("vide") && x !== T("verification")) || T("vide");
    }
    const l = listes.get(k);
    return !l || l.charge && !l.themes.length ? T("chargement") : l.verification ? T("verification") : l.erreur || (!l.themes.length ? T("vide") : "");
  };
  const nbMes = () => (window.__pcvThemes?.liste?.() || []).filter((t) => t.cat === "importes").length;
  const etape = (t) => donnees(t.site)?.etat(t.id);
  const enCours = (t) => {
    const x = etape(t);
    return !!x && !["fini", "erreur", "repos"].includes(x.etape);
  };
  const motAction = (t) => T(installe(t) ? "appliquer" : "telecharger");
  const rubriques = (t) => [
    ["action", installe(t) ? "nuancier" : "telechargements", motAction(t)],
    ...t.ecrans === 0 ? [] : [["apercu", "album", T("apercu")]],
    ...t.musique ? [["musique", "musique", T("musique")]] : [],
    ["infos", "info", Te("infos")],
    ...importe(t) ? [["supprimer", "supprimer", window.__pcvT?.("themes.supprimer")]] : []
  ];
  const gros = (nom, ic, faire, orange = false) => `<button class="gros-r${orange ? " orange" : ""}" data-a="${m.action(faire)}">${ico(ic)}${e(nom)}</button>`;
  const contenuFiche = (t, k) => {
    const d = donnees(t.site);
    const de = `<div class="bulle-r">${ico("info")}<span>${e(t.sous ?? window.__pcvT?.("themeplaza.de_auteur", { auteur: t.auteur || window.__pcvT?.("themeplaza.auteur_inconnu") }) ?? "")}<small>${e(t.console || SITE_NOM[t.site])}</small></span></div>`;
    let html = "";
    if (k === "action") {
      const x = etape(t), pct = x && Math.round((x.pct || 0) * 100);
      html = `<div class="banniere${t.site === "3ds" ? " d3" : ""}"${fondDe(apercu(t))}>${t.contenu?.accueil === false ? ico("musique") : ""}</div><div class="sous-b">${de}${gros(motAction(t), installe(t) ? "nuancier" : "telechargements", () => agir(t))}</div>`;
      if (enCours(t)) html += `<div role="status">${e((d?.ETAPES?.[x.etape] || "\u2026") + " " + pct + " %")}</div><div class="progression" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>`;
      else if (x?.etape === "erreur") html += `<p role="status">${e(window.__pcvT?.("themeplaza.echec_message", { msg: x.message || "?" }) || "")}</p>`;
      html += I.contenu(t.contenu, true) + (t.contenu?.accueil === false ? `<p role="note">${e(T("musique_seule"))}</p>` : "");
      html += `<p>${e(t.description || "")}</p>${P.mentionAnglais(!!t.description)}`;
    } else if (k === "apercu") html = `<div class="ecrans-f">${(d?.ecrans || [""]).slice(0, Math.max(1, Math.min(t.ecrans || 1, d?.ecrans?.length || 1))).map((n, i) => `<div${fondDe(apercu(t, i))}><span>${e(n)}</span></div>`).join("")}</div>`;
    else if (k === "musique") html = `<div class="rg verre"><div class="t"><b>${e(T("piste"))}</b><small>${e(t.piste || window.__pcvT?.("themeplaza.musique_mot") || "")}</small></div></div>` + (installe(t) ? gros(ecoute === cle(t) ? T("arreter") : T("ecouter"), ecoute === cle(t) ? "pause" : "lecture", () => ecouter(t)) : `<p>${e(T("ecouter_apres"))}</p>`);
    else if (k === "supprimer") html = `<p>${e(window.__pcvT?.("themes.supprimer_texte") || "")}</p>` + gros(window.__pcvT?.("themes.supprimer") || "", "supprimer", () => supprimer(t), true);
    else html = [[Te("auteur"), t.auteur], [T("console"), t.console || d?.nom], [T("telechargements"), t.telechargements], [T("aimes"), t.aimes], [T("site"), SITE_NOM[t.site]], [T("apporte"), d?.apporte]].filter(([, v]) => v != null && v !== "").map(([a, v]) => `<div class="rg verre"><div class="t"><b>${e(a)}</b><small>${e(v)}</small></div></div>`).join("") + (t.site === "steamu" ? "" : `<p>${e(window.__pcvT?.("themeplaza.credit", { site: SITE_NOM[t.site] }) || "")}</p>`);
    return html;
  };
  const agir = (t) => {
    const d = donnees(t.site);
    if (!d || enCours(t)) return window.__pcvSon?.("bord");
    if (installe(t)) {
      window.__pcvThemes?.appliquer(d.theme(t.id));
      window.__pcvSon?.("theme");
      return m.rendreFiche();
    }
    d.installer(t).finally(() => {
      if (!m.racine.hidden) m.rendre();
    });
  };
  const ecouter = (t) => {
    ecoute = ecoute === cle(t) ? null : cle(t);
    if (!window.__pcvThemes?.ecouter(ecoute && donnees(t.site).theme(t.id))) ecoute = null;
    m.rendreFiche();
  };
  const importe = (t) => installe(t) && /^importe:/.test(donnees(t.site).theme(t.id));
  const supprimer = (t) => {
    const id = donnees(t.site).theme(t.id).slice(8);
    if (!window.__pcvDossiers?.demander?.({
      titre: window.__pcvT?.("themes.supprimer_titre", { nom: t.titre }),
      texte: window.__pcvT?.("themes.supprimer_texte"),
      non: window.__pcvT?.("themes.annuler"),
      oui: window.__pcvT?.("themes.supprimer"),
      ailleurs: true,
      ok: async () => {
        if (!await window.__pcvThemes?.supprimer(id) || mort || m.racine.hidden) return;
        if (t.site === "steamu") m.quitterFiche();
        else m.rendre();
      }
    })) window.__pcvSon?.("bord");
  };
  const verifier = () => window.__pcvThemePlaza?.verifier(() => {
    const k = cleR("3ds", "telecharges");
    listes.delete(k);
    if (!m.racine.hidden) charger(k);
  });
  const ouvrirMesThemes = () => {
    const r = m.auRetour;
    m.fermer(false);
    window.__pcvThemes?.ouvrir(null, null, () => ouvrir(r));
  };
  const ouvrirGrille = (k) => {
    m.texte = texteDe(k);
    m.ouvrirGrille(cleR(siteDe(k), triDe(k)));
  };
  const ici = () => cleR(siteDe(m.onglet), triDe(m.onglet), m.texte);
  const ouvrirFiche = (t, l) => m.ouvrirFiche(t, l);
  const portee = () => m.vue === "grille" || m.vue === "fiche" && m.retour?.vue === "grille" ? siteDe(m.onglet) : "tous";
  const options = () => [...m.texte ? [cleR("tous", "telecharges")] : [], ...RAYONS.map(([s, tri]) => cleR(s, tri))];
  const m = P.magasin({
    id: "pcv-eshop-themes",
    nom: "eshopThemes",
    cle,
    tuile,
    style: `
    .im { overflow:hidden;background:var(--pcv-creux) center / cover no-repeat; }
    .im.d3 { background-size:contain; } .im > svg { position:absolute;left:30%;top:30%;width:40%;height:40%;opacity:.35; }
    .im > .pcv-contenu { position:absolute;left:6%;bottom:6%;font-size:calc(var(--u) * var(--c, 104) * .14); } .contenu > .pcv-contenu { margin:${u(10)} 0 ${u(2)}; }
    .banniere { position:relative;background:var(--pcv-creux) center / cover no-repeat; } .banniere > svg { position:absolute;left:40%;top:25%;width:20%;height:50%;opacity:.35; } .banniere.d3 { background-size:contain; }
    .ecrans-f { display:flex;flex-direction:column;gap:${u(12)}; } .ecrans-f div { aspect-ratio:16 / 9;border-radius:${u(18)};background:var(--pcv-creux) center / contain no-repeat;position:relative; }
    .ecrans-f span { position:absolute;left:${u(10)};bottom:${u(8)};padding:0 ${u(8)};border-radius:${u(8)};background:var(--pcv-carte);font-size:${u(12)};font-weight:900; }`,
    // la porte « Mes thèmes » : l'appli Thèmes ; un rayon par console (la Wii U et la 3DS d'abord)
    porte: () => ({ liste: RAYONS.map(([s, tri]) => themesDe(cleR(s, tri))[0]).filter(Boolean), titre: T("mes_themes"), nombre: T("nb_installes", { n: nbMes() }), ouvrir: ouvrirMesThemes }),
    etageres: () => RAYONS.map(([s, tri, ic]) => {
      const k = cleR(s, tri), l = themesDe(k), msg = message(k);
      return {
        cle: k,
        titre: nomRayon(k),
        icone: ic,
        nombre: listes.get(k)?.total || "",
        items: msg && !l.length ? [] : l,
        ouvrir: (t) => ouvrirFiche(t, l),
        tout: () => ouvrirGrille(k),
        toutNombre: listes.get(k)?.total || l.length,
        vide: `<div class="message">${e(msg)}</div>${listes.get(k)?.verification ? `<button class="og verre" data-g="verifier-${s}" data-a="${m.action(verifier)}">${e(T("verifier"))}</button>` : ""}`
      };
    }),
    fin: () => T("credit"),
    peindre: () => peindre(),
    grille: {
      onglets: () => options().map((k) => ({ cle: k, nom: siteDe(k) === "tous" ? window.__pcvT?.("eshop.tous") : nomRayon(k) })),
      choisir: (k) => {
        charger(cleR(siteDe(k), triDe(k), m.texte));
      },
      liste: () => themesDe(ici()),
      message: () => message(ici()),
      ouvrir: (t) => ouvrirFiche(t, m.lignes),
      suite: () => charger(ici(), true),
      nomOnglets: () => Te("rayon"),
      bandeau: true,
      effacer: () => {
        m.texte = "";
        return false;
      }
    },
    fiche: {
      titre: (t) => t.titre,
      rubriques: (t) => rubriques(t).map(([k, ic, n]) => [k, ic, n, k === "supprimer" ? "var(--pcv-orange)" : ""]),
      contenu: contenuFiche,
      classe: () => "riche texte",
      agir: (t) => agir(t),
      page: (t, n, total) => `${ico(t.site === "steamu" ? "nuancier" : "boutique")}${e(t.site === "steamu" ? window.__pcvT?.("themes.titre") || "" : T("titre"))} <small>${n} / ${total}</small>`,
      voisins: () => T("voisins")
    },
    libelles: (m2) => ({ a: m2.vue === "fiche" && m2.rubrique === 0 ? motAction(m2.fiche) : Te("voir") }),
    touche: (b) => !!window.__pcvThemePlaza?.touche?.(b),
    // (l'encadré de vérification ouvert a la manette)
    loupe: () => ({
      texte: m.texte,
      invite: portee() === "tous" ? T("chercher") : T("chercher_console", { console: donnees(portee())?.nom || portee() }),
      chercher: (mot) => {
        m.premier = null;
        m.texte = mot.trim().slice(0, 60);
        if (!m.texte) {
          m.vue = "etageres";
          m.sel = 0;
          return m.rendre();
        }
        const k = cleR(portee(), "telecharges", m.texte);
        sitesDe(k).forEach((x) => listes.delete(x));
        ouvrirGrille(k);
      }
    }),
    ferme: () => {
      if (ecoute) {
        ecoute = null;
        window.__pcvThemes?.ecouter(null);
      }
      window.__pcvThemePlaza?.donnees?.tenir(false);
    }
  });
  let suivi = null;
  const avertir = () => {
    if (!m.racine.hidden) peindre(true);
    suivi?.();
  };
  const brancher = () => {
    if (ecoutes.length) return;
    for (const s in SITES) {
      const d = donnees(s);
      if (d) ecoutes.push(d.ecouter(avertir));
    }
  };
  const preparer = () => {
    brancher();
    return Promise.allSettled(RAYONS.filter(([s]) => s !== "3ds").map(([s, tri]) => charger(cleR(s, tri))));
  };
  const ouvrir = (r = null) => {
    m.auRetour = r;
    brancher();
    m.debut();
    m.premier = null;
    window.__pcvThemePlaza?.donnees?.tenir(true);
    for (const [s, tri] of RAYONS) {
      const k = cleR(s, tri), l = listes.get(k);
      if (l && (l.erreur || l.verification) && !l.charge) listes.delete(k);
      charger(k);
    }
    m.montrer();
  };
  const ouvrirDepuis = (r, mot, t = null, l = null) => {
    ouvrir(r);
    if (t) {
      ouvrirFiche(t, l);
      m.premier = "fiche";
    } else {
      ouvrirGrille(cleR("tous", "telecharges", mot.trim().slice(0, 60)));
      m.premier = "grille";
    }
  };
  const chercherTout = async (mot, f) => {
    brancher();
    suivi = f;
    const k = cleR("tous", "telecharges", mot.trim().slice(0, 60));
    await charger(k);
    return themesDe(k);
  };
  window.__pcvEshopThemes = {
    preparer,
    ouvrir,
    ouvrirDepuis,
    chercher: chercherTout,
    tuile,
    peindre: peindreTuiles,
    ouvert: m.ouvert,
    fermer: m.fermer,
    detruire: () => {
      mort = true;
      m.fermer(false);
      ecoutes.forEach((f) => f());
      m.detruire();
    }
  };
  return "eShop des th\xE8mes pr\xEAt";
})();
