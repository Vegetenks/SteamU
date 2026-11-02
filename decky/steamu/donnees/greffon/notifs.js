(() => {
  window.__pcvMajArreter?.();
  document.getElementById("pcv-notifs")?.remove();
  clearInterval(window.__pcvNotifsSuivi);
  const T = window.__pcvT || ((c) => c);
  const O = window.opener;
  const u = (n) => `calc(var(--u) * ${n})`;
  const IMG = (id, f) => `https://steamloopback.host/assets/${id}/${f}`;
  const CDN = (id, f) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${id}/${f}`;
  const echappe = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const magasin = () => {
    try {
      const req = window.opener.__pcvReq ||= (() => {
        let r;
        window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
      for (const id of Object.keys(req.m)) {
        const m = req.m[id].toString();
        if (!m.includes("m_rgNotificationRollups")) continue;
        const e = req(id);
        for (const k of Object.keys(e)) if (e[k] && typeof e[k] === "object" && "m_rgNotificationRollups" in e[k]) return e[k];
      }
    } catch (e) {
    }
    return null;
  };
  const plateau = () => {
    try {
      const req = window.opener.__pcvReq ||= (() => {
        let r;
        window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
      for (const id of Object.keys(req.m)) {
        const m = req.m[id].toString();
        if (!m.includes("m_rgNotificationTray") || !m.includes("GetNotificationsInTray")) continue;
        const e = req(id);
        for (const k of Object.keys(e)) if (e[k] && typeof e[k] === "object" && typeof e[k].GetNotificationsInTray === "function") return e[k];
      }
    } catch (e) {
    }
    return null;
  };
  let store = null, casier = null, cache = null;
  const noms = {};
  const cacheMagasin = () => {
    try {
      const req = O.__pcvReq;
      for (const id of Object.keys(req.m)) {
        if (!req.m[id].toString().includes("async QueueAppRequest(")) continue;
        const e = req(id);
        for (const k of Object.keys(e)) {
          const c = typeof e[k]?.Get === "function" && e[k].Get();
          if (typeof c?.QueueAppRequest === "function") return c;
        }
      }
    } catch (e) {
    }
    return null;
  };
  const nomMagasin = (id) => {
    if (id in noms) return noms[id];
    noms[id] = "";
    cache ||= cacheMagasin();
    if (!cache) return "";
    Promise.race([cache.QueueAppRequest(id, { include_basic_info: true }), new Promise((ok) => setTimeout(ok, 4e3))]).then(() => {
      noms[id] = cache.GetApp?.(id)?.GetName?.() || "";
      if (noms[id] && !racine.hidden) remplir();
    }, () => {
    });
    return "";
  };
  const nomJeu = (id) => O.appStore.GetAppOverviewByAppID?.(Number(id))?.display_name || nomMagasin(Number(id));
  const lus = /* @__PURE__ */ new WeakMap();
  const PRISE = '<svg viewBox="0 0 24 24"><path d="M9 2v5H7v4a5 5 0 0 0 4 4.9V22h2v-6.1a5 5 0 0 0 4-4.9V7h-2V2h-2v5h-2V2z"/></svg>';
  const lire = (n) => {
    if (lus.has(n) || !window.__pcvToastsLire) return;
    lus.set(n, null);
    const essai = (k) => window.__pcvToastsLire(n).then((l) => l || k && new Promise((ok) => setTimeout(ok, 400)).then(() => essai(k - 1)));
    essai(2).then((l) => {
      lus.set(n, l || {});
      if (l && !racine.hidden) remplir();
    }, () => lus.set(n, {}));
  };
  const LISTE_SOUHAITS = "pcv:liste-souhaits";
  const SENS = (t, d) => ({
    2: [T("notifs.cadeau"), "#e5484d", T("notifs.cadeau_recu"), "steam://url/SteamIDMyProfile"],
    3: [T("notifs.commentaire"), "#2a8cff", T("notifs.nouveau_commentaire"), "steam://url/SteamIDMyProfile"],
    4: [T("notifs.objet_recu"), "#8a63ff", d.source_appid ? T("notifs.objet_recu_jeu", { jeu: nomJeu(d.source_appid) }) : T("notifs.objet_recu_texte"), "steam://url/SteamIDMyProfile"],
    5: [T("notifs.invitation"), "#2fbf71", T("notifs.nouvelle_demande_ami"), null],
    6: [T("notifs.grande_promo"), "#ff8a1f", T("notifs.soldes_commence"), "steam://store"],
    // (comme la cloche de Steam : un seul jeu → sa page du magasin ; plusieurs → la liste de souhaits, la nôtre dans l'eShop (29/10))
    8: [
      T("notifs.promo_liste_souhaits"),
      "#1a9ae6",
      T("notifs.jeu_liste_souhaits_promo"),
      d.count > 1 || !Math.trunc(+d.appid) ? LISTE_SOUHAITS : `steam://openurl/https://store.steampowered.com/app/${Math.trunc(+d.appid)}/`
    ],
    9: [T("notifs.echange"), "#e0a100", T("notifs.nouvelle_proposition_echange"), null]
  })[t] || [T("notifs.steam"), "#8b9098", T("notifs.nouvelle_notif_steam"), null];
  const racine = document.createElement("div");
  racine.id = "pcv-notifs";
  racine.hidden = true;
  const P = window.__pcvPresentation;
  racine.innerHTML = `<style>
    #pcv-notifs { position: fixed; inset: 0; padding-top: ${u(96)}; box-sizing: border-box;   
      z-index: 8600; font-family: var(--pcv-police); color: var(--pcv-texte); display: flex; flex-direction: column;
      background: var(--pcv-fond-page); padding: ${u(96)} ${u(44)} ${u(P.LEGENDE)}; }
    #pcv-notifs[hidden] { display: none; }
    
    #pcv-notifs .liste { flex: 1; min-height: 0; overflow-y: auto; padding: ${u(10)} ${u(18)} ${u(18)}; margin: ${u(-10)} ${u(-18)} 0;    ${P.fondus} }
    #pcv-notifs * { box-sizing: border-box; }
    #pcv-notifs button { all: unset; cursor: pointer; box-sizing: border-box; }
    #pcv-notifs .tete { display: flex; justify-content: space-between; align-items: center; padding: ${u(4)} 0 ${u(10)}; }
    #pcv-notifs h2 { margin: 0; font-size: ${u(26)}; font-weight: 900; }
    #pcv-notifs h3 { margin: ${u(18)} 0 ${u(10)}; font-size: ${u(15)}; font-weight: 900; color: var(--pcv-texte2); letter-spacing: .04em; text-transform: uppercase; }
    
    #pcv-notifs .vide { padding: ${u(18)} ${u(22)}; border-radius: ${u(22)}; border: 2px dashed rgba(150,170,195,.45); font-size: ${u(15)}; font-weight: 800; color: var(--pcv-texte2); }
    
    #pcv-notifs.sans-n .vide { box-shadow: 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} color-mix(in srgb, var(--pcv-cyan-plein) 20%, transparent); }
    #pcv-notifs .n { display: flex; align-items: center; gap: ${u(18)}; width: 100%; border-radius: ${u(26)}; padding: ${u(16)}; margin-bottom: ${u(14)};
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); transition: box-shadow .12s; }
    
    body:not(.pcv-barre-main) #pcv-notifs .n.sel { box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} color-mix(in srgb, var(--pcv-cyan-plein) 20%, transparent), 0 ${u(14)} ${u(28)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-notifs .n i { width: ${u(76)}; height: ${u(114)}; flex: none; border-radius: ${u(14)}; background: var(--pcv-creux) center / cover; box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere); }
    #pcv-notifs .n .t { flex: 1; min-width: 0; }
    #pcv-notifs .n .type { font-size: ${u(14)}; font-weight: 900; }
    #pcv-notifs .n .type small { color: var(--pcv-texte2); font-weight: 800; margin-left: ${u(6)}; }
    #pcv-notifs .n b { display: block; font-size: ${u(22)}; font-weight: 900; margin: ${u(4)} 0; }
    #pcv-notifs .n span.d { font-size: ${u(15)}; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-notifs .n.s { padding: ${u(12)} ${u(16)}; }
    #pcv-notifs .n .ic { width: ${u(52)}; height: ${u(52)}; flex: none; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;
      background: var(--pcv-pastille); color: var(--pcv-texte2); box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere), 0 ${u(2)} ${u(6)} rgb(from var(--pcv-ombre-c) r g b / .18); }
    #pcv-notifs .n .ic img { width: 100%; height: 100%; object-fit: cover; }
    #pcv-notifs .n .ic svg { width: 64%; height: 64%; }
    #pcv-notifs .n .ic svg:not([fill]) { fill: currentColor; }
    #pcv-notifs .n.s .type { color: var(--pcv-texte2); }
    #pcv-notifs .n.s b { font-size: ${u(17)}; margin: ${u(2)} 0 0; }
    #pcv-notifs .n.s .agir { padding: ${u(9)} ${u(18)}; color: var(--pcv-texte); background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(4)} ${u(12)} rgb(from var(--pcv-ombre-c) r g b / .15); }
    #pcv-notifs .n .agir { padding: ${u(12)} ${u(22)}; border-radius: ${u(22)}; font-size: ${u(15)}; font-weight: 900; color: var(--pcv-sur-accent); flex: none;
      background: var(--pcv-cyan); box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 ${u(8)} ${u(20)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-notifs .tout { display: block; margin: ${u(6)} auto ${u(10)}; padding: ${u(12)} ${u(28)}; border-radius: ${u(24)}; font-size: ${u(16)}; font-weight: 900;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); }
    body:not(.pcv-barre-main) #pcv-notifs .tout.sel { box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein); }
    #pcv-notifs .n.avis { padding: ${u(20)}; border: ${u(3)} solid color-mix(in srgb, var(--pcv-cyan-plein) 45%, transparent); }
    #pcv-notifs .n.avis .ic { width: ${u(64)}; height: ${u(64)}; background: var(--pcv-cyan); color: var(--pcv-sur-accent); }
    #pcv-notifs .n.avis .masquer { padding: ${u(12)} ${u(20)}; border-radius: ${u(22)}; font-size: ${u(15)}; font-weight: 900; flex: none; background: var(--pcv-creux); color: var(--pcv-texte2); }
    
    :is(#pcv-notifs, #pcv-spotpass) .quoi { position: fixed; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; background: var(--pcv-voile-fenetre); }
    :is(#pcv-notifs, #pcv-spotpass) .quoi[hidden] { display: none; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .carte { width: ${u(860)}; max-height: 74%; display: flex; flex-direction: column; gap: ${u(18)}; padding: ${u(30)} ${u(34)}; border-radius: ${u(34)};
      background: var(--pcv-fenetre-fond); box-shadow: var(--pcv-reflet), 0 ${u(20)} ${u(50)} rgb(from var(--pcv-ombre-c) r g b / .3); }
    :is(#pcv-notifs, #pcv-spotpass) .quoi ul { flex: 1; min-height: 0; overflow-y: auto; margin: 0; padding: 0 ${u(8)} 0 ${u(28)}; font-size: ${u(18)}; font-weight: 800; line-height: 1.4; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .attente { width: ${u(64)}; height: ${u(64)}; align-self: center; color: var(--pcv-cyan-plein); animation: pcvLancSouffle 1s ease-in-out infinite; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .attente svg { width: 100%; height: 100%; fill: currentColor; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi button:disabled { opacity: .5; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi li + li { margin-top: ${u(10)}; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .boutons { display: flex; gap: ${u(16)}; justify-content: center; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .boutons button { padding: ${u(14)} ${u(34)}; border-radius: ${u(26)}; font-size: ${u(17)}; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .boutons .oui { color: var(--pcv-sur-accent); background: var(--pcv-cyan); }
    body:not(.pcv-barre-main) :is(#pcv-notifs, #pcv-spotpass) .quoi .foc { box-shadow: 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein); }
    body:not(.pcv-barre-main) #pcv-notifs .n .foc { box-shadow: 0 0 0 ${u(3)} var(--pcv-anneau-c), 0 0 0 ${u(6)} var(--pcv-cyan-plein) !important; }
    #pcv-notifs .n .suppr { flex: none; width: ${u(40)}; height: ${u(40)}; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    #pcv-notifs .n .suppr { position: relative; } #pcv-notifs .n .suppr::after { content: ""; position: absolute; inset: ${u(-10)}; }   
      background: var(--pcv-creux); color: var(--pcv-texte2); }
    #pcv-notifs .n .suppr svg { width: 55%; height: 55%; fill: none; stroke: currentColor; stroke-width: 3; stroke-linecap: round; }
  </style>
  <div class="tete"><h2>${T("spaces.notifs.nom")}</h2></div><div class="liste"></div><div class="quoi" hidden></div>`;
  document.body.appendChild(racine);
  window.__pcvFond?.(racine);
  let items = [], sel = 0;
  const AVIS_CLE = "pcv-avis-import", AVIS_DEBUT = Date.now();
  const AVIS_IC = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/></svg>';
  const avisActif = () => {
    try {
      if (localStorage.getItem(AVIS_CLE) === "masque") return false;
    } catch (e) {
    }
    return !window.__pcvPlace3D && Date.now() - AVIS_DEBUT > 15e3;
  };
  const MAJ_IC = '<svg viewBox="0 0 24 24"><path d="M10.6 3h2.8v9l3.3-3.3 2 2L12 17.4 5.3 10.7l2-2 3.3 3.3zM4 19h16v2.6H4z"/></svg>';
  const lireCle = (k) => {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  };
  const majActive = () => !!window.__pcvMaj?.version && !window.__pcvMajPlusTard;
  const demander = (m, args, fini2, n = 0) => {
    const encore = () => {
      if (n < 20) setTimeout(() => demander(m, args, fini2, n + 1), 3e4);
    };
    Promise.race([(O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon?.nom, m, ...args), new Promise((r) => setTimeout(r, 15e3))]).then((r) => r ? fini2(r) : encore(), encore);
  };
  const CLE_MAJ_AUTO = "pcv-maj-auto";
  const verifierMaj = () => {
    if (lireCle(CLE_MAJ_AUTO) !== "false") demander("maj_verifier", [lireCle("pcv-maj-manifeste") || ""], (r) => {
      const neuve = r.version && r.version !== window.__pcvMaj?.version;
      window.__pcvMaj = r.version ? r : null;
      if (neuve && window.__pcvMajVu) {
        window.__pcvMajVu = window.__pcvMajPlusTard = false;
        bulleUneFois("__pcvMajBulle", "__pcvMajVu", majActive, { avis: "maj" });
      }
    });
  };
  verifierMaj();
  clearInterval(window.__pcvMajSuivi);
  window.__pcvMajSuivi = setInterval(verifierMaj, 30 * 60 * 1e3);
  let qInstallation = null;
  const MAJ_DELAI = 10 * 60 * 1e3;
  const majInstaller = async () => {
    const m = window.__pcvMaj;
    if (!m || window.__pcvMajInstallation) return;
    window.__pcvMajInstallation = true;
    const installation = qInstallation = { version: m.version, etape: "telechargement" };
    dessinerQuoi();
    const backend = O?.DeckyBackend || window.DeckyBackend, nom = window.__pcvGreffon?.nom;
    let remise = false, actif = false, detruit = false, minuteur, terminer, echouer;
    const fin = new Promise((ok, non) => {
      terminer = ok;
      echouer = non;
    });
    const attendre = () => {
      clearTimeout(minuteur);
      minuteur = setTimeout(() => echouer(new Error()), MAJ_DELAI);
    };
    const etape = (e, pct) => {
      installation.etape = e;
      installation.pct = pct;
      dessinerQuoi();
      attendre();
    };
    const evenements = [
      ["loader/plugin_download_start", (n) => {
        actif = n === nom;
        if (actif) etape("telechargement");
      }],
      ["loader/plugin_download_info", (pct) => {
        if (actif && Number.isFinite(pct))
          etape(pct >= 100 ? "verification_installation" : "telechargement", Math.max(0, Math.min(100, pct)));
      }],
      ["loader/plugin_download_finish", (n) => {
        if (actif && n === nom) {
          etape("redemarrage");
          terminer();
        }
      }]
    ];
    const arreter = () => {
      clearTimeout(minuteur);
      evenements.forEach(([n, f]) => backend?.removeEventListener?.(n, f));
    };
    const annuler = () => {
      detruit = true;
      arreter();
      window.__pcvMajInstallation = false;
      echouer(new Error());
    };
    window.__pcvMajArreter = annuler;
    const installer = async () => {
      let archive = m;
      remise = await backend.call("utilities/install_plugin", archive.url, nom, archive.version, archive.sha256, 2) !== false;
      if (!remise) throw new Error();
      await fin;
    };
    try {
      evenements.forEach(([n, f]) => backend?.addEventListener?.(n, f));
      attendre();
      await Promise.all([installer(), fin]);
    } catch (e) {
      if (!detruit) {
        installation.erreur = true;
        installation.pct = void 0;
        dessinerQuoi();
      }
    } finally {
      arreter();
      if (window.__pcvMajArreter === annuler) {
        window.__pcvMajInstallation = false;
        window.__pcvMajArreter = null;
      }
      if (!detruit) dessinerQuoi();
    }
  };
  const notesDe = (n = {}) => n[window.__pcvLangue?.()]?.length ? n[window.__pcvLangue()] : n.en || [];
  const majNotes = () => notesDe(window.__pcvMaj?.notes);
  const nouveautes = window.__pcvGreffon?.nouveautes;
  const notesInstallees = () => nouveautes && /^\d+\.\d+\.[1-9]\d*$/.test(nouveautes.version) ? notesDe(nouveautes.notes) : [];
  const nouveautesActives = () => notesInstallees().length > 0 && lireCle("pcv-maj-nouveautes") !== nouveautes.version;
  const PLANTAGE_IC = '<svg viewBox="0 0 24 24"><path d="M12 2.5 1.5 21h21zM10.8 9h2.4v6h-2.4zm0 7.6h2.4V19h-2.4z"/></svg>';
  const plantageActif = () => !!window.__pcvPlantage && lireCle("pcv-plantage-vu") !== window.__pcvPlantage;
  demander("plantage", [], (r) => {
    window.__pcvPlantage = r.fichier || null;
  });
  const avisTextes = (n) => n.avis === "nouveautes" ? { ic: MAJ_IC, titre: T("bienvenue.notification"), ligne: T("bienvenue.revoir_aide"), voir: T("bienvenue.revoir"), masquer: T("notifs.masquer") } : n.avis === "installee" ? { ic: MAJ_IC, titre: T("bienvenue.notification"), ligne: echappe(notesDe(nouveautes.notes)[0]), voir: T("notifs.voir_plus"), masquer: T("notifs.masquer") } : n.avis === "plantage" ? { ic: PLANTAGE_IC, titre: T("notifs.plantage_titre"), ligne: T("notifs.plantage_texte", { fichier: echappe(window.__pcvPlantage || "") }), voir: "", masquer: T("notifs.masquer") } : n.avis === "plugins" ? { ic: MAJ_IC, titre: T("notifs.plugins_titre", { n: window.__pcvMajPlugins.length }), ligne: echappe(window.__pcvMajPlugins.map((p) => p.nom).join(", ")), voir: T("notifs.voir_plus", "Voir plus"), masquer: T("notifs.plus_tard") } : n.avis === "maj" ? { ic: MAJ_IC, titre: T("notifs.maj_titre", { version: echappe(window.__pcvMaj?.version || "") }), ligne: echappe(majNotes()[0] || ""), voir: T("notifs.voir_plus", "Voir plus"), masquer: T("notifs.plus_tard") } : { ic: AVIS_IC, titre: T("notifs.avis_titre", "Importer vos Mii"), ligne: T("notifs.avis_texte", "Pour retrouver vos Mii sur la place, appuyez sur Voir plus."), voir: T("notifs.voir_plus", "Voir plus"), masquer: T("notifs.ne_plus_afficher", "Ne plus afficher") };
  const bulleUneFois = (suivi, vu, actif, n) => {
    clearInterval(window[suivi]);
    window[suivi] = setInterval(() => {
      if (window[vu] || !actif() || !window.__pcvBulleGrande) return;
      window[vu] = true;
      const a = avisTextes(n);
      clearInterval(window[suivi]);
      window.__pcvBulleGrande({ svg: a.ic, titre: a.titre, ligne: a.ligne, valide: () => racine.hidden && actif(), agir: () => {
        window.__pcvNotifsMontrer?.(true);
        if (n.avis === "maj" || n.avis === "installee") ouvrirQuoi(n.avis === "installee");
        else if (n.avis === "nouveautes") window.__pcvBienvenue?.ouvrir();
      } }, 5e3);
    }, 5e3);
  };
  bulleUneFois("__pcvBienvenueBulle", "__pcvBienvenueBulleVue", () => !!window.__pcvBienvenue?.avis() && !window.__pcvBienvenue.ouvert() && !window.__pcvBienvenue.attendu?.() && !window.__pcvBienvenue.vueSeance?.() && document.body.dataset.pcvPage === "accueil", { avis: "nouveautes" });
  bulleUneFois("__pcvAvisSuivi", "__pcvAvisVu", avisActif, { avis: "import" });
  bulleUneFois("__pcvMajBulle", "__pcvMajVu", majActive, { avis: "maj" });
  if (window.__pcvNouveautesVersion !== nouveautes?.version) {
    window.__pcvNouveautesVersion = nouveautes?.version;
    window.__pcvNouveautesVues = false;
  }
  bulleUneFois("__pcvNouveautesSuivi", "__pcvNouveautesVues", nouveautesActives, { avis: "installee" });
  const majPluginsActive = () => !!window.__pcvMajPlugins?.length && !window.__pcvMajPluginsPlusTard;
  const verifierPlugins = async () => {
    if (lireCle(CLE_MAJ_AUTO) === "false" || !window.__pcvSteamU?.horsStore?.()) return;
    const l = await window.__pcvEshop?.majs?.().catch(() => null);
    if (!l) return;
    const neuve = l.some((p) => !window.__pcvMajPlugins?.some((q) => q.nom === p.nom && q.versions?.[0]?.version === p.versions?.[0]?.version));
    window.__pcvMajPlugins = l;
    if (neuve) {
      window.__pcvMajPluginsVu = window.__pcvMajPluginsPlusTard = false;
      bulleUneFois("__pcvMajPluginsBulle", "__pcvMajPluginsVu", majPluginsActive, { avis: "plugins" });
    }
  };
  window.__pcvMajPluginsVerifier = verifierPlugins;
  clearTimeout(window.__pcvMajPluginsPremier);
  window.__pcvMajPluginsPremier = setTimeout(verifierPlugins, 6e4);
  clearInterval(window.__pcvMajPluginsSuivi);
  window.__pcvMajPluginsSuivi = setInterval(verifierPlugins, 30 * 60 * 1e3);
  const ouvrirPluginMaj = () => {
    const p = window.__pcvMajPlugins?.[0];
    if (!p) return;
    montrer(false);
    O.__pcvAller?.("accueil");
    setTimeout(() => window.__pcvBoutique?.ouvrirPlugin(p.nom), 400);
  };
  bulleUneFois("__pcvPlantageBulle", "__pcvPlantageVu", plantageActif, { avis: "plantage" });
  let quoi = false, qAct = 0, qLecture = null;
  const dessinerQuoi = () => {
    const q = racine.querySelector(".quoi");
    q.hidden = !quoi;
    window.__pcvVoile?.("quoi", quoi);
    if (!quoi) return ecrireLegende();
    const installation = qInstallation, erreur = installation?.erreur, occupe = !!installation && !erreur;
    const statut = erreur ? T("notifs.maj.erreur") + ": " + T("notifs.maj.erreur.aide") : installation ? T("notifs.maj." + installation.etape) + (installation.pct === void 0 ? "" : ` ${Math.round(installation.pct)}%`) : "";
    if (occupe && q.dataset.installation === "oui") {
      q.querySelector('[role="status"]').textContent = statut;
      return;
    }
    q.dataset.installation = occupe ? "oui" : "non";
    const boutons = erreur || qLecture ? [T("touche.fermer")] : [T("notifs.installer"), T("notifs.plus_tard")];
    q.innerHTML = `<div class="carte pcv-fenetre" aria-busy="${occupe}"><h2>SteamU v${echappe(installation?.version || qLecture?.version || window.__pcvMaj?.version || "")}</h2>${installation ? `${occupe ? `<div class="attente" aria-hidden="true">${MAJ_IC}</div>` : ""}<p role="${erreur ? "alert" : "status"}">${statut}</p>` : `<ul>${(qLecture ? notesDe(qLecture.notes) : majNotes()).map((l) => `<li>${echappe(l)}</li>`).join("")}</ul>`}
      <div class="boutons">${boutons.map((t, i) => `<button class="${i ? "" : "oui"}${!occupe && i === qAct ? " foc" : ""}" data-q="${i}"${occupe ? " disabled" : ""}>${t}</button>`).join("")}</div></div>`;
    legende.innerHTML = occupe ? "" : window.__pcvIcones.legende([[1, boutons[qAct] || boutons[0]], [2, T("touche.retour")]]);
  };
  const ouvrirQuoi = (lecture = false) => {
    qLecture = lecture ? nouveautes : null;
    quoi = true;
    qAct = 0;
    if (qLecture) {
      try {
        localStorage.setItem("pcv-maj-nouveautes", qLecture.version);
      } catch (e) {
      }
      remplir();
    }
    dessinerQuoi();
  };
  window.__pcvQuoiDeNeuf = { notes: notesInstallees, ouvrir: () => {
    window.__pcvSteamU?.fermer();
    montrer(true);
    ouvrirQuoi(true);
  } };
  const choisirQuoi = (i) => {
    if (qInstallation && !qInstallation.erreur || window.__pcvMajInstallation) return;
    if (qInstallation?.erreur) {
      qInstallation = null;
      quoi = false;
      dessinerQuoi();
      remplir();
      return;
    }
    if (qLecture) {
      quoi = false;
      dessinerQuoi();
      return;
    }
    if (i === 0) return majInstaller();
    quoi = false;
    dessinerQuoi();
    window.__pcvMajPlusTard = true;
    window.__pcvSon?.("retour");
    remplir();
  };
  let act = 0;
  const actions = (n) => !n ? [] : n.avis === "nouveautes" ? ["voir", "masquer"] : n.avis === "plantage" ? ["masquer"] : n.avis ? ["voir", "masquer"] : n.service || n.lien ? ["voir", "suppr"] : ["suppr"];
  const suppr = (i, k) => `<span class="suppr${i === sel && act === k ? " foc" : ""}" data-suppr title="${T("notifs.supprimer", "Supprimer")}"><svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg></span>`;
  const jourDe = (t) => {
    const j = Math.floor((Date.now() / 1e3 - t) / 86400);
    return j <= 0 ? T("notifs.aujourdhui") : j < 7 ? T("notifs.cette_semaine") : j < 31 ? T("notifs.ce_mois") : T("notifs.plus_ancien");
  };
  const remplir = () => {
    store ||= magasin();
    casier ||= plateau();
    const brut = casier?.GetNotificationsInTray?.();
    const duPlateau = brut ? (brut[0] || []).map((t) => t.notifications?.[0]?.data).filter((d) => d?.item) : null;
    const rollups = (duPlateau ?? (store?.m_rgNotificationRollups || [])).filter((r) => r.item && !r.item.hidden).sort((a, b) => b.timestamp - a.timestamp);
    const services = (brut?.[0] || []).map((g) => g.notifications?.[0]).filter((n) => n?.decky && n.data).sort((a, b) => b.rtCreated - a.rtCreated);
    items = rollups.map((r) => {
      let d = {};
      try {
        d = JSON.parse(r.item.body_data || "{}");
      } catch (e) {
      }
      const app = Math.trunc(+(d.source_appid || d.appid || d.app_id_list?.[0] || (d.app_id && d.app_id !== 753 ? d.app_id : 0))) || 0;
      const [type, couleur, texte, lien] = SENS(r.type, d);
      return { r, d, app, type, couleur, texte, lien, titre: app ? nomJeu(app) || type : type };
    }).concat(services.map((n) => {
      lire(n);
      const l = lus.get(n) || {}, d = n.data;
      return {
        service: n,
        titre: l.titre || (typeof d.title === "string" ? d.title : T("notifs.greffon")),
        texte: l.ligne ?? (typeof d.body === "string" ? d.body : ""),
        ic: l.img ? `<img src="${echappe(l.img)}">` : l.svg || PRISE
      };
    }));
    if (window.__pcvBienvenue?.avis()) items.unshift({ avis: "nouveautes" });
    if (nouveautesActives()) items.unshift({ avis: "installee" });
    if (avisActif()) items.unshift({ avis: "import" });
    if (majActive()) items.unshift({ avis: "maj" });
    if (majPluginsActive()) items.unshift({ avis: "plugins" });
    if (plantageActif()) items.unshift({ avis: "plantage" });
    sel = Math.min(sel, items.length > 1 ? items.length : Math.max(0, items.length - 1));
    let html = "", groupe = "";
    if (!items.length) html = `<h3>${T("notifs.aujourdhui")}</h3><div class="vide">${T("notifs.vide")}</div>`;
    items.forEach((n, i) => {
      if (n.avis) {
        const a = avisTextes(n);
        html += `<div class="n avis${i === sel ? " sel" : ""}" data-i="${i}"><span class="ic">${a.ic}</span><span class="t"><b>${a.titre}</b><span class="d">${a.ligne}</span></span>
        ${a.voir ? `<button class="agir${i === sel && act === 0 ? " foc" : ""}" data-voir>${a.voir}</button>` : ""}<button class="masquer${i === sel && actions(n)[act] === "masquer" ? " foc" : ""}" data-masquer>${a.masquer}</button></div>`;
        return;
      }
      if (n.service) {
        if (groupe !== "s") {
          html += `${i ? "" : `<h3>${T("notifs.aujourdhui")}</h3><div class="vide">${T("notifs.vide_steam")}</div>`}<h3>${T("notifs.greffons_services")}</h3>`;
          groupe = "s";
        }
        const t = new Date(n.service.rtCreated), quand = jourDe(t / 1e3) === T("notifs.aujourdhui") ? t.toLocaleTimeString(window.__pcvLocale?.() || "fr-FR", { hour: "2-digit", minute: "2-digit" }) : t.toLocaleDateString(window.__pcvLocale?.() || "fr-FR", { day: "numeric", month: "short" });
        html += `<button class="n s${i === sel ? " sel" : ""}" data-i="${i}"><span class="ic">${n.ic}</span><span class="t"><span class="type">${echappe(n.titre)}<small>${quand}</small></span>${n.texte ? `<b>${echappe(n.texte)}</b>` : ""}</span><span class="agir${i === sel && act === 0 ? " foc" : ""}">${T("notifs.voir")}</span>${suppr(i, 1)}</button>`;
        return;
      }
      const g = jourDe(n.r.timestamp);
      if (g !== groupe) {
        html += `<h3>${g}</h3>`;
        groupe = g;
      }
      const date = new Date(n.r.timestamp * 1e3).toLocaleDateString(window.__pcvLocale?.() || "fr-FR", { day: "numeric", month: "short" });
      const image = n.app ? `<i style="background-image:url('${IMG(n.app, "library_600x900.jpg")}'),url('${CDN(n.app, "library_600x900.jpg")}')"></i>` : "";
      html += `<button class="n${i === sel ? " sel" : ""}" data-i="${i}">${image}<span class="t"><span class="type" style="color:${n.couleur}">\u25CF ${n.type}<small>${date}${n.r.rollup_count > 1 ? ` (${n.r.rollup_count})` : ""}</small></span>
        <b>${echappe(n.titre)}</b><span class="d">${echappe(n.texte)}</span></span>${n.lien ? `<span class="agir${i === sel && act === 0 ? " foc" : ""}">${T("notifs.voir")}</span>` : ""}${suppr(i, n.lien ? 1 : 0)}</button>`;
    });
    if (items.length > 1) html += `<button class="tout${sel === items.length ? " sel" : ""}" data-tout>${T("notifs.tout_effacer", "Tout effacer")}</button>`;
    racine.querySelector(".liste").innerHTML = html;
    racine.classList.toggle("sans-n", !items.length);
    ecrireLegende();
  };
  const legende = document.createElement("div");
  legende.id = "pcv-notifs-legende";
  legende.className = "pcv-legende";
  racine.appendChild(legende);
  const ecrireLegende = () => {
    if (quoi) return;
    const n = items[sel], tout = sel === items.length && items.length > 1;
    const l = tout ? [[1, T("notifs.tout_effacer", "Tout effacer")]] : n ? [[1, { voir: n.avis ? avisTextes(n).voir : T("notifs.voir"), masquer: n.avis && avisTextes(n).masquer, suppr: T("notifs.supprimer", "Supprimer") }[actions(n)[act]]]] : [];
    legende.innerHTML = window.__pcvIcones.legende(window.__pcvLegendeDe([...l, [2, T("touche.retour")]]));
  };
  (window.__pcvLegendes ||= {}).notifs = () => {
    if (!racine.hidden) ecrireLegende();
  };
  const apercu = (onglet = 0) => {
    montrer(false);
    try {
      const req = window.opener.__pcvReq ||= (() => {
        let r;
        window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
      req(75380).SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore.OpenQuickAccessMenu(onglet);
    } catch (e) {
    }
  };
  const agir = (i, action = act) => {
    const n = items[i];
    if (!n) return;
    if (n.avis === "nouveautes") return action === 1 ? supprimer(i) : window.__pcvBienvenue.ouvrir();
    if (n.avis === "installee") return ouvrirQuoi(true);
    if (n.avis === "maj") return ouvrirQuoi();
    if (n.avis === "plugins") return ouvrirPluginMaj();
    if (n.avis === "plantage") return;
    if (n.avis) {
      montrer(false);
      window.__pcvSteamU?.ouvrir?.("import");
      return;
    }
    if (n.service) {
      const f = n.service.data.onClick;
      if (typeof f !== "function") return apercu(999);
      montrer(false);
      try {
        f();
      } catch (e) {
      }
      return;
    }
    if (n.lien === LISTE_SOUHAITS) {
      montrer(false);
      O.__pcvAller?.("accueil");
      setTimeout(() => window.__pcvBoutique?.ouvrirSouhaits(), 400);
    } else if (n.lien) {
      montrer(false);
      O.SteamClient.URL.ExecuteSteamURL(n.lien);
    } else apercu();
  };
  const effacer = (n) => {
    if (n.avis === "nouveautes") {
      window.__pcvBienvenue?.masquer();
      return;
    }
    if (n.avis) {
      try {
        if (n.avis === "installee") localStorage.setItem("pcv-maj-nouveautes", nouveautes.version);
        else if (n.avis === "maj") window.__pcvMajPlusTard = true;
        else if (n.avis === "plugins") window.__pcvMajPluginsPlusTard = true;
        else if (n.avis === "plantage") localStorage.setItem("pcv-plantage-vu", window.__pcvPlantage);
        else localStorage.setItem(AVIS_CLE, "masque");
      } catch (e) {
      }
      return;
    }
    const retirer = (f) => {
      const l = casier?.m_rgNotificationTray;
      if (!l) return;
      const k = l.findIndex(f);
      if (k >= 0) {
        l.splice(k, 1);
        casier.m_cbkNotificationTray?.Dispatch?.(l);
      }
    };
    try {
      if (n.service) retirer((g) => g?.notifications?.includes?.(n.service));
      else {
        store?.MarkItemHidden?.(n.r.item.notification_id);
        retirer((g) => g?.notifications?.some?.((x) => x?.data === n.r));
      }
    } catch (e) {
    }
  };
  const confirmer = (titre, texte, oui, ok) => {
    if (!window.__pcvDossiers?.demander?.({ titre, texte, non: T("telech.garder"), oui, ok, ailleurs: true })) window.__pcvSon?.("bord");
  };
  const fini = () => {
    act = 0;
    window.__pcvSon?.("retour");
    remplir();
    racine.querySelector(".n.sel")?.scrollIntoView({ block: "nearest" });
  };
  const supprimer = (i) => {
    const n = items[i];
    if (!n) return;
    if (n.avis) {
      effacer(n);
      return fini();
    }
    confirmer(T("notifs.suppr_titre"), T("notifs.suppr_texte"), T("notifs.supprimer", "Supprimer"), () => {
      effacer(n);
      fini();
    });
  };
  const toutEffacer = () => {
    const l = items.slice();
    confirmer(T("notifs.tout_titre"), T("notifs.tout_texte"), T("notifs.tout_effacer", "Tout effacer"), () => {
      l.forEach(effacer);
      sel = 0;
      fini();
    });
  };
  const montrer = (oui) => {
    if (!oui && qInstallation && !qInstallation.erreur) return;
    if (oui) {
      window.__pcvBarreQuitter?.();
      sel = 0;
      act = 0;
      remplir();
      racine.querySelector(".liste").scrollTop = 0;
      document.querySelectorAll("#pcv-toasts .b").forEach((b) => b.remove());
      window.__pcvAvisVu = window.__pcvMajVu = window.__pcvPlantageVu = true;
    }
    if (!oui) quoi = false;
    racine.querySelector(".quoi").hidden = !quoi;
    window.__pcvVoile?.("quoi", quoi);
    const entre = oui && racine.hidden;
    if (!oui && !racine.hidden) window.__pcvApparition(racine, true);
    racine.hidden = !oui;
    if (entre) window.__pcvApparition(racine);
  };
  racine.addEventListener("click", (e) => {
    if (quoi) {
      if (qInstallation && !qInstallation.erreur || window.__pcvMajInstallation) return;
      const q = e.target.closest("[data-q]");
      if (q) return choisirQuoi(+q.dataset.q);
      if (!e.target.closest(".carte")) {
        qInstallation = null;
        quoi = false;
        dessinerQuoi();
      }
      return;
    }
    const x = e.target.closest("[data-suppr]");
    if (x) return supprimer(+x.closest(".n").dataset.i);
    if (e.target.closest("[data-tout]")) return toutEffacer();
    if (e.target.closest("[data-masquer]")) return supprimer(+e.target.closest(".n").dataset.i);
    const n = e.target.closest(".n");
    if (n) agir(+n.dataset.i, 0);
  });
  window.__pcvNotifsMontrer = montrer;
  (window.__pcvManette ||= {}).notifs = (b) => {
    if (racine.hidden) return false;
    if (quoi && (qInstallation && !qInstallation.erreur || window.__pcvMajInstallation)) return true;
    if (quoi && qInstallation?.erreur) {
      if (b === 1 || b === 2) choisirQuoi(0);
      return true;
    }
    if (b === 1) window.__pcvAppui(racine.querySelector(quoi ? ".quoi .foc" : ".sel .foc, .tout.sel"));
    if (quoi) {
      if (b === 11 || b === 12) qAct = b === 12 && !qLecture ? 1 : 0;
      else if (b === 9 || b === 10) racine.querySelector(".quoi ul")?.scrollBy(0, b === 10 ? 120 : -120);
      else if (b === 1) return choisirQuoi(qAct), true;
      else if (b === 2) {
        quoi = false;
      } else return true;
      dessinerQuoi();
      return true;
    }
    if (b === 9 && sel === 0) {
      window.__pcvBarreEntrer?.(ecrireLegende);
      return true;
    }
    if (b === 9) {
      sel = Math.max(0, sel - 1);
      act = 0;
    } else if (b === 10) {
      sel = Math.min(items.length > 1 ? items.length : items.length - 1, sel + 1);
      act = 0;
    } else if (b === 11 || b === 12) {
      const k = actions(items[sel]).length;
      if (!k) return true;
      act = Math.max(0, Math.min(k - 1, act + (b === 12 ? 1 : -1)));
    } else if (b === 1) {
      if (sel === items.length) return toutEffacer(), true;
      const a = actions(items[sel])[act];
      if (a === "masquer" || a === "suppr") supprimer(sel);
      else agir(sel);
      return true;
    } else if (b === 2) {
      montrer(false);
      return true;
    } else if (b === 3 || b === 4) {
      window.__pcvSon?.("bord");
      return true;
    } else return true;
    remplir();
    racine.querySelector(".n.sel")?.scrollIntoView({ block: "nearest" });
    return true;
  };
  let route = O.location.pathname;
  window.__pcvNotifsSuivi = setInterval(() => {
    if (O.location.pathname !== route) {
      route = O.location.pathname;
      montrer(false);
    }
  }, 200);
  return "notifications pr\xEAtes";
})();
(() => {
  const O = window.opener;
  const u = (n) => `calc(var(--u) * ${n})`;
  document.getElementById("pcv-toasts")?.remove();
  clearInterval(window.__pcvToastsVeille);
  const echappe = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const lesPieces = () => window.__pcvToastsPieces ||= { React: O.SP_REACT };
  const forme = (f) => {
    const s = Function.prototype.toString.call(f).slice(0, 400);
    if (!s.includes("eType")) return null;
    return /\{[^{}=]*\bgroup:[\w$]+[^{}=]*\}=/.test(s) ? "group" : /\{[^{}=]*\bnotification:[\w$]+[^{}=]*\}=/.test(s) ? "notification" : null;
  };
  const chercher = () => {
    const p = lesPieces();
    if (p.file && p.Contenu && p.creerRacine && p.React?.createElement) return p;
    let req;
    try {
      req = O.__pcvReq ||= (() => {
        let r;
        O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
    } catch (e) {
      return p;
    }
    p.React ||= O.SP_REACT;
    try {
      for (const id of Object.keys(req.m)) {
        const s = req.m[id].toString();
        if (!p.file && s.includes("PopNextToastNotification(") && s.includes("ClearAllToastNotifications(){")) {
          const e = req(id);
          for (const k of Object.keys(e)) if (typeof e[k]?.PopNextToastNotification === "function") p.file = e[k];
        } else if (!p.Contenu && s.includes("k_ESteamNotificationType_")) {
          const e = req(id), f = Object.values(e).filter((x) => typeof x === "function");
          p.Contenu = f.find((x) => forme(x) === "group") || f.find((x) => forme(x) === "notification");
        } else if (!p.creerRacine && s.length > 5e4 && s.includes("react.dev/errors") && s.includes("createRoot")) p.creerRacine = req(id).createRoot;
        if (p.file && p.Contenu && p.creerRacine) break;
      }
    } catch (e) {
    }
    return p;
  };
  const pieces = () => {
    const p = chercher();
    return p.React?.createElement && typeof p.creerRacine === "function" && p.file && p.Contenu ? p : null;
  };
  const racine = document.createElement("div");
  racine.id = "pcv-toasts";
  racine.innerHTML = `<style>
    
    #pcv-toasts { position: fixed; inset: 0; z-index: 9050; pointer-events: none; font-family: var(--pcv-police); color: var(--pcv-texte); }
    #pcv-toasts .b { position: absolute; pointer-events: auto; cursor: pointer; display: flex; align-items: center; gap: ${u(12)}; box-sizing: border-box;
      height: ${u(60)}; min-width: ${u(220)}; max-width: ${u(400)}; padding: 0 ${u(22)} 0 ${u(9)}; border-radius: ${u(22)};
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(10)} ${u(24)} rgb(from var(--pcv-ombre-c) r g b / .22);
      transform-origin: var(--pointe) ${u(-10)}; animation: pcvBulleNait .42s cubic-bezier(.2,.9,.3,1.25) both; }
    
    #pcv-toasts .b::before { content: ""; position: absolute; top: ${u(-8)}; left: calc(var(--pointe) - ${u(9)}); width: ${u(18)}; height: ${u(18)};
      background: var(--pcv-carte); transform: rotate(45deg); border-radius: ${u(4)} 0 0 0; box-shadow: -1px -1px 0 var(--pcv-bord); }
    #pcv-toasts .b.sort { animation: pcvBulleRentre .28s ease-in both; }
    #pcv-toasts .b.grande { height: auto; min-height: ${u(92)}; max-width: ${u(560)}; padding: ${u(14)} ${u(30)} ${u(14)} ${u(14)}; gap: ${u(16)}; border-radius: ${u(30)}; }
    #pcv-toasts .b.grande .ic { width: ${u(62)}; height: ${u(62)}; background: var(--pcv-cyan); }
    #pcv-toasts .b.grande .t b { font-size: ${u(21)}; }
    #pcv-toasts .b.grande .t span { font-size: ${u(16)}; white-space: normal; }
    
    #pcv-toasts .b .vignette { flex: none; width: ${u(150)}; height: ${u(70)}; border-radius: ${u(14)}; background: var(--pcv-creux) center / cover; box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere); margin-left: auto; }
    #pcv-toasts .b .pcv-legende { flex: none; }
    @keyframes pcvBulleNait { 0% { opacity: 0; transform: scale(.2); } 60% { opacity: 1; transform: scale(1.05); } 100% { transform: scale(1); } }
    @keyframes pcvBulleRentre { to { opacity: 0; transform: scale(.2); } }
    #pcv-toasts .ic { flex: none; width: ${u(42)}; height: ${u(42)}; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(180deg, #ff7a7e, #e5484d); box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere), 0 ${u(2)} ${u(5)} rgba(90,0,10,.18); color: var(--pcv-sur-accent); }
    #pcv-toasts .ic img { width: 100%; height: 100%; object-fit: cover; display: block; }
    #pcv-toasts .ic svg { width: 56%; height: 56%; }
    #pcv-toasts .ic svg, #pcv-toasts .ic svg * { fill: currentColor; color: var(--pcv-sur-accent); }
    #pcv-toasts .t { min-width: 0; display: flex; flex-direction: column; line-height: 1.15; }
    #pcv-toasts .t b, #pcv-toasts .t span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #pcv-toasts .t b { font-size: ${u(15)}; font-weight: 900; }
    #pcv-toasts .t span { font-size: ${u(13)}; font-weight: 800; color: var(--pcv-texte2); margin-top: ${u(2)}; }
    
    #pcv-toasts .compte { position: absolute; min-width: ${u(24)}; height: ${u(24)}; padding: 0 ${u(6)}; box-sizing: border-box; border-radius: ${u(12)};
      background: linear-gradient(180deg, #ff6b70, #e5484d); color: var(--pcv-sur-accent); font-size: ${u(13)}; font-weight: 900; line-height: ${u(24)}; text-align: center;
      box-shadow: 0 0 0 ${u(2.5)} var(--pcv-lisere), 0 ${u(2)} ${u(5)} rgba(90,0,10,.25); animation: pcvBulleNait .36s cubic-bezier(.2,.9,.3,1.3) both; }
    #pcv-toasts .b.detail { height: auto; max-width: min(90vw, ${u(620)}); flex-wrap: wrap; }
    #pcv-toasts .b.detail .t { flex: 1; }
    #pcv-toasts .b.detail .t b, #pcv-toasts .b.detail .t span { white-space: normal; overflow-wrap: anywhere; }
    #pcv-toasts .actions { display: flex; gap: ${u(10)}; width: 100%; flex-wrap: wrap; }
    #pcv-toasts .actions button { color: var(--pcv-texte); background: var(--pcv-creux); padding: ${u(8)} ${u(14)}; border-radius: ${u(14)}; }
    #pcv-toasts .compte[hidden] { display: none; }
    #pcv-toasts .cache { position: fixed; left: -4000px; top: 0; width: 600px; visibility: hidden; }
  </style><div class="cache"></div><span class="compte" hidden></span>`;
  document.body.appendChild(racine);
  const cache = racine.querySelector(".cache"), compteur = racine.querySelector(".compte");
  const avecContextes = (p, enfant) => {
    for (const el of document.querySelectorAll("div")) {
      if (el.closest('[id^="pcv-"]')) continue;
      const cle = Object.keys(el).find((k) => k.startsWith("__reactFiber"));
      if (!cle) continue;
      for (let f = el[cle]; f; f = f.return) if (f.tag === 10)
        enfant = p.React.createElement(f.type.Provider || f.type, { value: f.memoizedProps.value }, enfant);
      break;
    }
    return enfant;
  };
  const lire = (p, t) => new Promise((ok) => {
    const boite = cache.appendChild(document.createElement("div"));
    let erreur = false;
    let r;
    try {
      r = p.creerRacine(boite, { onUncaughtError: (e) => {
        erreur = true;
        console.warn("SteamU toast", t.eType, e.message);
      } });
      r.render(avecContextes(p, p.React.createElement(p.Contenu, { location: 1, group: { eType: t.eType, notifications: [t] }, notification: t, onDismiss: () => {
      } })));
    } catch (e) {
      boite.remove();
      return ok(null);
    }
    const debut = Date.now();
    const relever = () => {
      const img = boite.querySelector("img[src]")?.getAttribute("src") || "";
      const svg = img ? "" : boite.querySelector("svg")?.outerHTML || "";
      const lignes = [];
      for (const e of boite.querySelectorAll("*")) {
        if (e.closest("svg") || [...e.childNodes].every((n) => n.nodeType !== 3 || !n.textContent.trim())) continue;
        const x = e.textContent.trim().replace(/\s+/g, " ");
        if (x && !lignes.includes(x)) lignes.push(x);
      }
      const fermer = () => {
        try {
          r.unmount();
        } catch (e) {
        }
        boite.remove();
      };
      if (!lignes.length) {
        if (!erreur && Date.now() - debut < 1500) return setTimeout(relever, 100);
        fermer();
        return ok(null);
      }
      const boutons = [...boite.querySelectorAll('button, [role="button"], a[href]')].filter((e) => !e.querySelector('button, [role="button"], a[href]') && e.textContent.trim());
      const actions = boutons.length > 1 ? boutons.map((e) => ({ texte: e.textContent.trim(), agir: () => e.click() })) : [];
      ok({
        img,
        svg,
        titre: lignes[0],
        ligne: lignes.slice(1).join(", "),
        actions,
        detail: true,
        agir: () => boutons[0]?.click(),
        fermer
      });
    };
    requestAnimationFrame(() => setTimeout(relever, 30));
  });
  window.__pcvToastsLire = (t) => {
    const p = pieces();
    return p ? lire(p, t).then((c) => (c?.fermer(), c)) : Promise.resolve(null);
  };
  const CLOCHE = '<svg viewBox="0 0 24 24"><path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5v4.6L3.8 16.4a1 1 0 0 0 .9 1.5h14.6a1 1 0 0 0 .9-1.5l-1.7-2.8V9A6.5 6.5 0 0 0 12 2.5zm-2.6 17a2.6 2.6 0 0 0 5.2 0z"/></svg>';
  const unite = () => innerHeight / 800;
  const laCloche = (rond = "notifs") => document.querySelector(`#pcv-barre .rond[data-pcv-rond="${rond}"]`);
  const clocheVue = (rond) => {
    if (window.__pcvDemarrage?.enCours()) return null;
    const c = laCloche(rond);
    if (!c) return null;
    const r = c.getBoundingClientRect();
    if (r.width < 4 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return null;
    const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return e && c.contains(e) ? r : null;
  };
  const sonner = (t, rond) => {
    try {
      laCloche(rond)?.querySelector("i")?.animate(["rotate(0)", "rotate(-18deg) scale(1.12)", "rotate(14deg) scale(1.12)", "rotate(-8deg)", "rotate(4deg)", "rotate(0)"].map((transform) => ({ transform, transformOrigin: "50% 15%" })), { duration: 650, easing: "ease-out" });
    } catch (e) {
    }
    try {
      laCloche(rond)?.animate([{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(.97)" }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
    } catch (e) {
    }
    if (window.__pcvSon) window.__pcvSon("notification");
    else if (t) {
      try {
        pieces()?.file.PlayNotificationSound(t);
      } catch (e) {
      }
    }
    window.__pcvLed?.("notif");
  };
  let file = [], enCours = false;
  const majCompteur = () => {
    const total = file.length, r = total && clocheVue();
    if (!r) {
      compteur.hidden = true;
      return;
    }
    const k = unite(), n = total > 9 ? "9+" : String(total);
    if (!compteur.hidden && compteur.textContent !== n) window.__pcvAppui(compteur);
    compteur.textContent = n;
    compteur.style.left = `${r.right - 18 * k}px`;
    compteur.style.top = `${r.top - 4 * k}px`;
    compteur.hidden = false;
  };
  let touchesActives = null;
  const bulle = ({ img, svg, titre, ligne, agir, grande, rond, vignette, touches, actions, detail }, duree, t) => new Promise((fin) => {
    if (![titre, ligne].some((x) => typeof x === "string" && x.trim())) return fin(true);
    const r = clocheVue(rond);
    if (!r) return fin(false);
    const k = unite(), el = document.createElement("div");
    el.className = (grande ? "b grande" : "b") + (detail ? " detail" : "");
    const gauche = r.left - 10 * k, pointe = r.left + r.width / 2 - gauche;
    el.style.left = `${gauche}px`;
    el.style.top = `${r.bottom + 14 * k}px`;
    el.style.setProperty("--pointe", `${pointe}px`);
    el.innerHTML = `<i class="ic">${img ? `<img src="${echappe(img)}">` : svg || CLOCHE}</i><span class="t"><b>${echappe(titre || "")}</b>${ligne ? `<span>${echappe(ligne)}</span>` : ""}</span>` + (vignette ? `<i class="vignette" style="background-image:${echappe(vignette)}"></i>` : "") + (touches ? `<span class="pcv-legende">${window.__pcvIcones?.legende?.(touches) || ""}</span>` : "");
    el.querySelector("img")?.addEventListener("error", (e) => {
      e.target.parentNode.innerHTML = CLOCHE;
    });
    let parti = false;
    if (actions?.length) {
      const liste = el.appendChild(document.createElement("span"));
      liste.className = "actions";
      actions.forEach((a) => {
        const b = liste.appendChild(document.createElement("button"));
        b.textContent = a.texte;
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          try {
            a.agir();
          } finally {
            partir();
          }
        });
      });
      touches = actions.slice(0, 4).map((a, i) => [["a", "x", "y", "b"][i], a.texte, a.agir]);
      const legende = el.appendChild(document.createElement("span"));
      legende.className = "pcv-legende";
      legende.innerHTML = window.__pcvIcones?.legende?.(touches) || "";
    }
    const mesTouches = touches && Object.fromEntries(touches.map(([c, , f]) => [c, () => {
      try {
        f();
      } catch (e) {
      }
      partir();
    }]));
    if (mesTouches) touchesActives = mesTouches;
    const partir = () => {
      if (parti) return;
      parti = true;
      clearInterval(veille);
      if (touchesActives === mesTouches) touchesActives = null;
      el.classList.add("sort");
      setTimeout(() => {
        el.remove();
        fin(true);
      }, 280);
    };
    el.addEventListener("click", () => {
      const avant = O.location.pathname;
      try {
        agir?.();
      } catch (e) {
      }
      partir();
      setTimeout(() => {
        if (!rond && O.location.pathname === avant) window.__pcvNotifsMontrer?.(true);
      }, agir ? 300 : 0);
    });
    racine.appendChild(el);
    sonner(t, rond);
    if (!t?.fnNotificationResolved) setTimeout(partir, duree);
    const veille = setInterval(() => {
      if (!clocheVue(rond)) partir();
      else if (t?.fnNotificationResolved?.()) partir();
    }, 400);
  });
  (window.__pcvManette ||= {}).bulle = (b) => {
    const f = touchesActives?.[b];
    if (!f) return false;
    f();
    return true;
  };
  window.__pcvBulleRond = (rond, o, duree) => enfiler({ ...o, rond, grande: true }, duree);
  window.__pcvBulleGrande = (o, duree) => enfiler({ ...o, grande: true }, duree);
  const T = window.__pcvT || ((c) => c);
  const regroupe = (n) => ({ titre: n > 1 ? T("notifs.n_notifs", { n }) : T("notifs.une_notif"), ligne: T("notifs.touche_cloche"), svg: CLOCHE });
  const retenir = () => !!window.__pcvDemarrage?.enCours() || !!document.getElementById("pcv-connexion") || document.getElementById("pcv-place")?.hidden === false || !clocheVue();
  const enJeu = () => {
    try {
      return (O.SteamUIStore?.RunningApps?.length || 0) > 0;
    } catch (e) {
      return false;
    }
  };
  const suivante = async () => {
    if (enCours) return;
    enCours = true;
    while (file.length && !retenir()) {
      const entree = file[0], { t, contenu, duree, fin } = entree;
      if (t?.fnNotificationResolved?.() || contenu.valide && !contenu.valide()) {
        file.shift();
        contenu.fermer?.();
        fin?.(true);
        continue;
      }
      if (!clocheVue(contenu.rond)) break;
      file.shift();
      if (!await bulle(contenu, duree ?? Math.min(6e3, Math.max(3500, t?.nToastDurationMS || 4500)), t)) {
        file.unshift(entree);
        break;
      }
      contenu.fermer?.();
      fin?.(true);
    }
    enCours = false;
    majCompteur();
  };
  const enfiler = (contenu, duree) => new Promise((fin) => {
    file.push({ contenu, duree, fin });
    suivante();
  });
  const MANETTE = { connectee: 63, deconnectee: 64, batterie: 62 };
  const manettesVues = /* @__PURE__ */ new Map(), MANETTE_DELAI = 5e3;
  const manette = (t) => {
    const d = t.data, connexion = t.eType === MANETTE.connectee, deconnexion = t.eType === MANETTE.deconnectee;
    const batterie = t.eType === MANETTE.batterie;
    if (!connexion && !deconnexion && !batterie) return null;
    const magasin = O.ControllerStore, liste = magasin?.GetControllers?.() || [];
    const c = connexion ? magasin?.GetController?.(d.controller_index()) : null;
    const candidates = batterie ? liste.filter((x) => x.eControllerType === d.controller_type()) : [];
    const memesPiles = candidates.filter((x) => x.ucBatteryLevel === Math.round(d.pct_remaining() * 100));
    const noms = (memesPiles.length ? memesPiles : candidates).map((x) => x.strName).filter(Boolean);
    const nom = (deconnexion ? d.controller_name() : connexion ? c?.strName : [...new Set(noms)].join(", ")) || d.controller_type && magasin?.GetControllerTypeString?.(d.controller_type()) || T("notifs.manette");
    return { titre: nom, ligne: batterie ? T("notifs.manette_batterie", { n: Math.round(d.pct_remaining() * 100) }) : T(connexion ? "notifs.manette_connectee" : "notifs.manette_deconnectee"), fermer: () => {
    } };
  };
  const invitationDejaVue = (c) => {
    const v = window.__pcvInvitationVue, x = c.titre + " " + c.ligne;
    return !!v && Date.now() - v.t < 15e3 && x.includes(v.nom) && x.includes(v.jeu);
  };
  let lectures = Promise.resolve();
  const recevoir = (t) => {
    if (t.decky) return void 0;
    lectures = lectures.then(async () => {
      let p;
      while (!(p = pieces())) await new Promise((ok) => setTimeout(ok, 250));
      const controleur = manette(t), contenu = controleur || await lire(p, t);
      if (!contenu) return;
      if (controleur) {
        const maintenant = Date.now(), cle = t.eType + ":" + contenu.titre + ":" + contenu.ligne;
        for (const [k, date] of manettesVues) if (maintenant - date >= MANETTE_DELAI) manettesVues.delete(k);
        if (manettesVues.has(cle)) return;
        manettesVues.set(cle, maintenant);
      }
      if (invitationDejaVue(contenu)) {
        contenu.fermer();
        return;
      }
      file.push({ t, contenu });
      suivante();
    }).catch((e) => console.warn("SteamU notification", t.eType, e));
    return void 0;
  };
  const crocheter = () => {
    const F = chercher().file;
    if (!F) return false;
    if (F.__pcvPop0) F.PopNextToastNotification = F.__pcvPop0;
    F.__pcvRecevoir = recevoir;
    F.__pcvDispatch0 ||= F.DispatchNextToast;
    if (!F.__pcvDispatchCrochet) {
      F.DispatchNextToast = function() {
        if (enJeu()) return F.__pcvDispatch0.call(this);
        const aLire = this.m_rgNotificationToasts.splice(0);
        const r = F.__pcvDispatch0.call(this);
        aLire.forEach((t) => F.__pcvRecevoir(t));
        return r;
      };
      F.__pcvDispatchCrochet = true;
    }
    F.__pcvCrochet = true;
    F.DispatchNextToast();
    return true;
  };
  const congedies = /* @__PURE__ */ new WeakSet();
  const classeReservoir = () => {
    if (window.__pcvToastsReservoir) return window.__pcvToastsReservoir;
    try {
      const req = O.__pcvReq;
      for (const id of Object.keys(req.m)) {
        const s = req.m[id].toString();
        if (s.includes("GamepadToastPlaceholder:") && s.includes("toastAnimateInMS")) return window.__pcvToastsReservoir = req(id).GamepadToastPlaceholder;
      }
    } catch (e) {
    }
    return null;
  };
  const toastAffiche = () => {
    const c = classeReservoir();
    const el = c && document.querySelector("." + c.split(" ")[0]);
    if (!el || el.style.display === "none") return null;
    const k = Object.keys(el).find((x) => x.startsWith("__reactFiber"));
    for (let f = el[k]?.return, i = 0; f && i < 3; i++, f = f.return) {
      const pile = [f.child];
      let n = 0;
      while (pile.length && n++ < 60) {
        const g = pile.pop();
        if (!g) continue;
        const pr = g.memoizedProps;
        if (pr?.notification && typeof pr.onDismiss === "function") return pr;
        pile.push(g.sibling, g.child);
      }
    }
    return null;
  };
  const eteindreSteam = () => {
    if (enJeu()) return;
    const pr = toastAffiche();
    if (!pr || congedies.has(pr.notification) || pr.notification.decky) return;
    congedies.add(pr.notification);
    recevoir(pr.notification);
    try {
      pr.onDismiss();
    } catch (e) {
    }
  };
  window.__pcvToastsTrouver = toastAffiche;
  const libererToasts = () => {
    document.documentElement.dataset.pcvToasts = "";
  };
  let pose = crocheter(), essais = 0;
  setTimeout(eteindreSteam, 0);
  clearInterval(window.__pcvToastsCrochet);
  if (pose) libererToasts();
  else window.__pcvToastsCrochet = setInterval(() => {
    if ((pose = crocheter()) || ++essais > 240) {
      clearInterval(window.__pcvToastsCrochet);
      libererToasts();
    }
  }, 250);
  window.__pcvToastsVeille = setInterval(() => {
    eteindreSteam();
    if (file.length && !enCours && !retenir()) suivante();
    majCompteur();
  }, 1e3);
  window.__pcvToasts = {
    etat: () => ({ pieces: !!pieces(), crochet: !!chercher().file?.__pcvCrochet, retenir: retenir(), cloche: !!clocheVue(), retenues: file.length, file: file.length, enCours, enJeu: enJeu() }),
    essai: (contenu, duree = 5e3) => bulle(contenu, duree),
    regroupe: (n) => bulle(regroupe(n), 7e3)
  };
  return "toasts pr\xEAts" + (pose ? "" : " (file de Steam pas encore charg\xE9e : crochet r\xE9essay\xE9)");
})();
