(() => {
  const seance = window.__pcvHistorique?.lire();
  window.__pcvHistorique?.arreter();
  const CLE = "pcv-notifs-aujourdhui", MAX = 100, GARDE = 30 * 864e5;
  const maintenant = () => new Date(window.__pcvDateEssai ?? Date.now());
  let entrees = [];
  try {
    const c = JSON.parse(localStorage.getItem(CLE));
    if (Array.isArray(c?.entrees)) entrees = (seance || c.entrees).filter((n, i, l) => !n.sourceAnnonce && (!n.sourceAvis || l.findIndex((h) => h.sourceAvis === n.sourceAvis) === i)).slice(0, MAX);
  } catch (e) {
  }
  const sauver = () => {
    try {
      localStorage.setItem(CLE, JSON.stringify({ entrees }));
    } catch (e) {
    }
  };
  const signaler = () => window.dispatchEvent(new Event("pcv-historique"));
  const actualiser = () => {
    const t = maintenant().getTime(), l = entrees.filter((n) => !(t - n.date > GARDE));
    if (l.length === entrees.length) return;
    entrees = l;
    sauver();
    signaler();
  };
  sauver();
  actualiser();
  const suivi = setInterval(actualiser, 1e3);
  window.addEventListener("focus", actualiser);
  window.__pcvHistorique = {
    lire: () => {
      actualiser();
      return entrees.slice();
    },
    // (12/11, l'auteur) un avis (sourceAvis : la nouvelle version des plugins…) n'a qu'une ligne, remise à jour en place quand
    // sa bulle renaît (à chaque démarrage de SteamU) ; le cache d'avant, déjà en double, est dédoublé au chargement
    ajouter: (n) => {
      actualiser();
      if (n.sourceAnnonce) return;
      const t = maintenant().getTime(), i = n.sourceAvis ? entrees.findIndex((h) => h.sourceAvis === n.sourceAvis) : -1;
      if (i >= 0) entrees[i] = { ...entrees[i], ...n, lu: false, date: t };
      else entrees.unshift({ ...n, historique: true, id: `${t}-${Math.random().toString(36).slice(2)}`, date: t });
      entrees.length = Math.min(entrees.length, MAX);
      sauver();
      signaler();
    },
    retirer: (f) => {
      actualiser();
      entrees = entrees.filter((n) => !f(n));
      sauver();
      signaler();
    },
    // (12/11, piles) lu : la pile a été ouverte puis refermée, ou son action faite ; la pastille rouge compte le reste
    marquer: (f) => {
      entrees = entrees.map((n) => f(n) ? { ...n, lu: true } : n);
      sauver();
      signaler();
    },
    vider: () => {
      entrees = [];
      sauver();
      signaler();
    },
    actualiser,
    arreter: () => {
      clearInterval(suivi);
      window.removeEventListener("focus", actualiser);
    }
  };
})();
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
  const ANNONCE_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13v7H3V6h10M3 7l8.5 7 4-3"/><path d="M18 2v6"/><circle cx="18" cy="11" r="1" fill="currentColor" stroke="none"/></svg>';
  const lire = (n) => {
    if (lus.has(n) || !window.__pcvToastsLire) return;
    lus.set(n, null);
    const essai = (k) => window.__pcvToastsLire(n).then((l) => l || k && new Promise((ok) => setTimeout(ok, 400)).then(() => essai(k - 1)));
    essai(2).then((l) => {
      lus.set(n, l || {});
      if (l && !racine.hidden) remplir();
    }, () => lus.set(n, {}));
  };
  const LISTE_SOUHAITS = "pcv:liste-souhaits", AMIS = "pcv:amis";
  const SENS = (t, d) => ({
    // (13/11, l'auteur : « un appui va directement à l'endroit dédié ») les pages que la cloche de Steam ouvre (ses adresses
    // nommées : PendingGift, CommunityInventory, TradeOffers) ; une invitation d'ami : notre page Amis
    2: [T("notifs.cadeau"), "#e5484d", T("notifs.cadeau_recu"), "steam://url/PendingGift"],
    3: [T("notifs.commentaire"), "#2a8cff", T("notifs.nouveau_commentaire"), "steam://url/SteamIDMyProfile"],
    4: [T("notifs.objet_recu"), "#8a63ff", d.source_appid ? T("notifs.objet_recu_jeu", { jeu: nomJeu(d.source_appid) }) : T("notifs.objet_recu_texte"), "steam://url/CommunityInventory"],
    5: [T("notifs.invitation"), "#2fbf71", T("notifs.nouvelle_demande_ami"), AMIS],
    6: [T("notifs.grande_promo"), "#ff8a1f", T("notifs.soldes_commence"), "steam://store"],
    // (comme la cloche de Steam : un seul jeu → sa page du magasin ; plusieurs → la liste de souhaits, la nôtre dans l'eShop (29/10))
    8: [
      T("notifs.promo_liste_souhaits"),
      "#1a9ae6",
      T("notifs.jeu_liste_souhaits_promo"),
      d.count > 1 || !Math.trunc(+d.appid) ? LISTE_SOUHAITS : `steam://openurl/https://store.steampowered.com/app/${Math.trunc(+d.appid)}/`
    ],
    9: [T("notifs.echange"), "#e0a100", T("notifs.nouvelle_proposition_echange"), "steam://url/TradeOffers"]
  })[t] || [T("notifs.steam"), "#8b9098", T("notifs.nouvelle_notif_steam"), "steam://url/SteamIDMyProfile"];
  const racine = document.createElement("div");
  racine.id = "pcv-notifs";
  racine.hidden = true;
  const P = window.__pcvPresentation;
  racine.innerHTML = `<style>
    #pcv-notifs { position: fixed; inset: 0; padding-top: ${u(96)}; box-sizing: border-box;   
      z-index: 8600; font-family: var(--pcv-police); color: var(--pcv-texte); display: flex; flex-direction: column;
      background: var(--pcv-fond-page); padding: ${u(96)} ${u(44)} ${u(P.LEGENDE)}; }
    #pcv-notifs[hidden] { display: none; }
    
    #pcv-notifs .liste { flex: 1; min-height: 0; overflow-y: auto; padding: var(--pcv-marge-ombre); margin: 0 calc(var(--pcv-marge-ombre) * -1);    ${P.fondus} }
    #pcv-notifs * { box-sizing: border-box; }
    #pcv-notifs button { all: unset; cursor: pointer; box-sizing: border-box; }
    #pcv-notifs .tete { display: flex; justify-content: space-between; align-items: center; padding: ${u(4)} 0 ${u(10)}; }
    #pcv-notifs h2 { margin: 0; font-size: ${u(26)}; font-weight: 900; }
    #pcv-notifs h3 { margin: ${u(18)} 0 ${u(10)}; font-size: ${u(15)}; font-weight: 900; color: var(--pcv-texte2); letter-spacing: .04em; text-transform: uppercase; }
    
    #pcv-notifs .vide { padding: ${u(18)} ${u(22)}; border-radius: ${u(22)}; border: 2px dashed rgba(150,170,195,.45); font-size: ${u(15)}; font-weight: 800; color: var(--pcv-texte2); }
    
    #pcv-notifs.sans-n .vide { box-shadow: 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} color-mix(in srgb, var(--pcv-cyan-plein) 20%, transparent); }
    #pcv-notifs .annonce-corps { overflow-y: auto; min-height: 0; font-size: ${u(18)}; overflow-wrap: anywhere; }
    #pcv-notifs .annonce-corps p { white-space: pre-wrap; }
    #pcv-notifs .annonce-corps figure { margin: ${u(16)} 0; text-align: center; }
    #pcv-notifs .annonce-corps svg { width: ${u(220)}; height: ${u(220)}; }
    #pcv-notifs .annonce-corps figcaption { font-size: ${u(14)}; color: var(--pcv-texte2); }
    #pcv-notifs :is(.tout, .histo) { display: block; margin: ${u(6)} auto ${u(10)}; padding: ${u(12)} ${u(28)}; border-radius: ${u(24)}; font-size: ${u(16)}; font-weight: 900;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); }
    body:not(.pcv-barre-main) #pcv-notifs .tout.sel { box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein); }
    
    :is(#pcv-notifs, #pcv-spotpass) .quoi { position: fixed; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; background: var(--pcv-voile-fenetre); }
    :is(#pcv-notifs, #pcv-spotpass) .quoi[hidden] { display: none; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .carte { width: ${u(860)}; max-height: 74%; display: flex; flex-direction: column; gap: ${u(18)}; padding: ${u(30)} ${u(34)}; border-radius: ${u(34)};
      background: var(--pcv-fenetre-fond); box-shadow: var(--pcv-reflet), 0 ${u(20)} ${u(50)} rgb(from var(--pcv-ombre-c) r g b / .3); }
    :is(#pcv-notifs, #pcv-spotpass) .quoi ul { flex: 1; min-height: 0; overflow-y: auto; margin: 0; padding: 0 ${u(8)} 0 ${u(28)}; font-size: ${u(18)}; font-weight: 800; line-height: 1.4; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .pcv-points { align-self: center; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi button:disabled { opacity: .5; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi li + li { margin-top: ${u(10)}; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .boutons { display: flex; gap: ${u(16)}; justify-content: center; }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .boutons button { padding: ${u(14)} ${u(34)}; border-radius: ${u(26)}; font-size: ${u(17)}; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); }
    :is(#pcv-notifs, #pcv-spotpass) .quoi .boutons .oui { color: var(--pcv-sur-accent); background: var(--pcv-cyan); }
    body:not(.pcv-barre-main) :is(#pcv-notifs, #pcv-spotpass) .quoi .foc { box-shadow: 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein); }
    
    #pcv-notifs .piles { --m: calc(var(--u) / 1.5); display: grid; grid-template-columns: repeat(4, 1fr); gap: calc(var(--m) * 40); align-items: start; margin-bottom: calc(var(--m) * 10); }
    #pcv-notifs .pile { position: relative; height: calc(var(--m) * 330); }
    #pcv-notifs .pile.ouverte { height: calc(var(--m) * (250 + 120 * (var(--n) - 1) + 30)); }
    #pcv-notifs .feuille { position: absolute; left: 0; right: 0; top: 0; height: calc(var(--m) * 250); border-radius: calc(var(--m) * 30); padding: calc(var(--m) * 22);
      display: grid; align-content: start; gap: calc(var(--m) * 10); font-size: calc(var(--m) * 24); font-weight: 900; cursor: pointer;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); transition: transform var(--pcv-panneau-duree) var(--pcv-panneau-courbe); }
    #pcv-notifs .feuille .pcv-marque-relief { --pcv-relief-taille: calc(var(--m) * 76); }
    #pcv-notifs .feuille > :is(b, small) { opacity: var(--lisible, 1); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    
    #pcv-notifs .ouverte .feuille:not(.dessous, .derriere) > :is(b, small) { white-space: normal; overflow-wrap: anywhere; }
    
    #pcv-notifs .ouverte .feuille:not(.dessous, .derriere) { height: auto; min-height: calc(var(--m) * 250); }
    
    #pcv-notifs :is(.feuille, .ligne) b { display: flex; }
    #pcv-notifs .feuille b { gap: calc(var(--m) * 12); } #pcv-notifs .ligne b { gap: var(--pcv-ligne-ecart); }
    #pcv-notifs :is(.feuille, .ligne) b > span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    
    #pcv-notifs :is(.feuille, .ligne) time { flex: none; font-weight: 800; color: var(--pcv-texte2); align-self: center; }
    #pcv-notifs .feuille time { font-size: calc(var(--m) * 18); }
    
    #pcv-notifs .histo { margin: 0; display: flex; align-items: center; gap: ${u(10)}; padding: ${u(8)} ${u(24)} ${u(8)} ${u(10)}; }
    #pcv-notifs .histo .pcv-touche { flex: none; }
    #pcv-notifs .histo svg { width: ${u(24)}; height: ${u(24)}; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
    #pcv-notifs.vue-historique .histo { display: none; }
    
    #pcv-notifs.vue-historique .liste { display: flex; flex-direction: column; gap: var(--pcv-ecart-choix); }
    #pcv-notifs.vue-historique .liste > * { flex: none; }
    #pcv-notifs.vue-historique h3 { margin: var(--pcv-intertitre-marge); font-size: var(--pcv-intertitre); letter-spacing: normal; text-transform: none; }
    #pcv-notifs.vue-historique h3:first-child { margin-top: 0; }
    #pcv-notifs .ligne { display: flex; align-items: center; gap: var(--pcv-ligne-ecart); min-height: var(--pcv-ligne-h); padding: var(--pcv-ligne-marge); border-radius: var(--pcv-ligne-rayon);
      font-size: var(--pcv-ligne-texte); font-weight: 900; cursor: pointer; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    #pcv-notifs .ligne .pcv-marque-relief { --pcv-relief-taille: var(--pcv-ligne-pastille); }
    #pcv-notifs .ligne .t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--pcv-ligne-interligne); }
    #pcv-notifs .ligne small { font-size: var(--pcv-ligne-petit); font-weight: 800; color: var(--pcv-texte2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    body:not(.pcv-barre-main) #pcv-notifs .ligne.sel { box-shadow: var(--pcv-anneau-choisi); }
    #pcv-notifs .feuille small { font-size: calc(var(--m) * 18); font-weight: 800; color: var(--pcv-texte2); }
    #pcv-notifs .feuille.f1 { transform: translate(calc(var(--m) * 5), calc(var(--m) * 7)) rotate(1deg); }
    #pcv-notifs .feuille.f2 { transform: translate(calc(var(--m) * 10), calc(var(--m) * 14)) rotate(2deg); }
    
    #pcv-notifs .ouverte .feuille { transform: translateY(calc(var(--m) * 120 * max(var(--p), 0))); }
    #pcv-notifs .ouverte .feuille.derriere { transform: translateY(calc(var(--m) * -16)) scale(.97); }
    #pcv-notifs .feuille.dessous { align-content: end; }
    #pcv-notifs .pile { touch-action: none; }   
    body:not(.pcv-barre-main) #pcv-notifs .feuille.sel { box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} color-mix(in srgb, var(--pcv-cyan-plein) 20%, transparent), 0 ${u(14)} ${u(28)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-notifs .pile .compte { position: absolute; right: calc(var(--m) * -10); top: calc(var(--m) * -10); z-index: 200; min-width: calc(var(--m) * 44); height: calc(var(--m) * 44); padding: 0 calc(var(--m) * 10);
      border-radius: 99px; display: grid; place-items: center; font-size: calc(var(--m) * 22); font-weight: 900; color: var(--pcv-sur-accent);
      background: var(--pcv-rouge); box-shadow: 0 0 0 calc(var(--m) * 4) var(--pcv-lisere); }
  </style>
  <div class="tete"><h2>${T("spaces.notifs.nom")}</h2><button class="histo" data-histo>${window.__pcvIcones?.touche?.(13) || ""}${window.__pcvIcones?.svg?.("horloge") || ""}<span>${T("notifs.historique_bouton")}</span></button></div><div class="liste"></div><div class="quoi" hidden></div>`;
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
  const AN = { cle: "pcv-annonces", recus: "pcv-annonces-recus-", essai: "pcv-annonces-essai", delai: 6 * 60 * 60 * 1e3 };
  const annoncesActives = () => lireCle(AN.cle) !== "false";
  const compteAnnonce = () => String(O?.g_FriendsUIApp?.FriendStore?.self?.accountid || "");
  const annonceBonne = (a) => {
    if (!a || typeof a !== "object" || typeof a.id !== "string" || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(a.id)) return false;
    if (!Number.isSafeInteger(a.date) || a.date <= 0 || a.date > 253402300799 || a.fin !== void 0 && (!Number.isSafeInteger(a.fin) || a.fin <= a.date || a.fin > 253402300799)) return false;
    if (!a.textes || Object.keys(a.textes).sort().join(",") !== "en,es,fr") return false;
    const texte = (s, max) => typeof s === "string" && s.trim().length > 0 && s.length <= max && !/[\x00-\x08\x0b-\x1f\x7f\u202a-\u202e\u2066-\u2069\u2014\u00b7]/.test(s);
    if (!["fr", "en", "es"].every((l) => {
      const t = a.textes[l];
      return t && texte(t.titre, 80) && !/[\n\r]/.test(t.titre) && texte(t.texte, 1200);
    })) return false;
    if (a.lien !== void 0) {
      if (typeof a.lien !== "string" || a.lien.length > 512 || !/^https:\/\//.test(a.lien) || /[\s\x00-\x1f\x7f]/.test(a.lien)) return false;
      try {
        const u2 = new URL(a.lien);
        if (!u2.hostname || u2.username || u2.password) return false;
      } catch (e) {
        return false;
      }
    }
    if (a.preversion !== void 0 && (a.lien !== void 0 || typeof a.preversion?.version !== "string" || !/^\d+\.\d+\.\d+-(rc|beta|alpha)\.\d+$/.test(a.preversion.version))) return false;
    return new TextEncoder().encode(JSON.stringify(a)).length <= (a.preversion ? 6e3 : 3e3);
  };
  const lireAnnonces = () => {
    try {
      const l = JSON.parse(lireCle(AN.recus + compteAnnonce()) || "[]");
      return Array.isArray(l) ? l.filter((n) => annonceBonne(n.annonce)) : [];
    } catch (e) {
      return [];
    }
  };
  const sauverAnnonces = (l, compte = compteAnnonce()) => {
    try {
      localStorage.setItem(AN.recus + compte, JSON.stringify(l));
      return true;
    } catch (e) {
      return false;
    }
  };
  const annoncesListe = () => {
    const t = Date.now() / 1e3;
    return lireAnnonces().filter((n) => !n.supprime && n.annonce.date <= t && (n.annonce.fin === void 0 || n.annonce.fin > t)).sort((a, b) => b.annonce.date - a.annonce.date);
  };
  const annonceTexte = (a) => a.textes[window.__pcvLangue?.() || "fr"] || a.textes.en;
  const annonceMaj = () => {
    window.__pcvAnnoncesNonLues = annoncesListe().filter((n) => !n.lu).length;
    window.__pcvCompteurNotifs?.();
    if (!racine.hidden) remplir();
  };
  const annonceEtat = (id, changements) => {
    const l = lireAnnonces(), n = l.find((n2) => n2.annonce.id === id);
    if (n) {
      Object.assign(n, changements);
      sauverAnnonces(l);
    }
    annonceMaj();
  };
  let annoncesCours = false, annoncesArretees = false;
  const bullesAnnonces = () => {
    if (!annoncesActives() || !window.__pcvBulleGrande) return;
    for (const n of annoncesListe().filter((n2) => !n2.notifie && !n2.lu)) {
      const a = n.annonce, compte = compteAnnonce(), l = lireAnnonces(), enregistre = l.find((n2) => n2.annonce.id === a.id);
      enregistre.notifie = true;
      if (!sauverAnnonces(l, compte)) continue;
      const t = annonceTexte(a);
      window.__pcvBulleGrande({
        titre: t.titre,
        ligne: t.texte,
        svg: ANNONCE_IC,
        annonce: true,
        sourceAnnonce: a.id,
        valide: () => annoncesActives() && compte === compteAnnonce() && annoncesListe().some((n2) => n2.annonce.id === a.id && !n2.lu),
        agir: () => {
          montrer(true);
          ouvrirAnnonce(a);
        }
      }, 8e3);
    }
  };
  const verifierAnnonces = async () => {
    if (annoncesArretees) return;
    clearTimeout(window.__pcvAnnoncesSuivi);
    annonceMaj();
    bullesAnnonces();
    if (!annoncesActives()) return;
    const dernier = Number(lireCle(AN.essai)) || 0, reste = AN.delai - (Date.now() - dernier);
    if (!annoncesCours && reste <= 0 && compteAnnonce()) {
      const compte = compteAnnonce();
      annoncesCours = true;
      try {
        localStorage.setItem(AN.essai, String(Date.now()));
        const backend = O?.DeckyBackend || window.DeckyBackend;
        let minuteur;
        const r = await Promise.race([backend?.call("loader/call_plugin_method", window.__pcvGreffon?.nom, "annonces"), new Promise((ok) => {
          minuteur = setTimeout(ok, 2e4);
        })]).finally(() => clearTimeout(minuteur));
        if (!annoncesArretees && annoncesActives() && compte === compteAnnonce() && Array.isArray(r?.annonces) && r.annonces.length <= 20) {
          const l = lireAnnonces(), t = Date.now() / 1e3;
          for (const a of r.annonces) if (annonceBonne(a) && a.date <= t && (a.fin === void 0 || a.fin > t) && !l.some((n) => n.annonce.id === a.id)) l.push({ annonce: a, lu: false, notifie: false });
          sauverAnnonces(l, compte);
          annonceMaj();
          bullesAnnonces();
        }
      } catch (e) {
      } finally {
        annoncesCours = false;
      }
    }
    clearTimeout(window.__pcvAnnoncesSuivi);
    if (!annoncesArretees && annoncesActives()) window.__pcvAnnoncesSuivi = setTimeout(verifierAnnonces, Math.max(1e3, AN.delai - (Date.now() - (Number(lireCle(AN.essai)) || Date.now()))));
  };
  window.__pcvAnnoncesArreter?.();
  window.__pcvAnnonces = { actif: annoncesActives, basculer: () => {
    try {
      localStorage.setItem(AN.cle, JSON.stringify(!annoncesActives()));
    } catch (e) {
    }
    verifierAnnonces();
  } };
  const reveilAnnonces = () => {
    if (!document.hidden) verifierAnnonces();
  };
  window.addEventListener("focus", reveilAnnonces);
  document.addEventListener("visibilitychange", reveilAnnonces);
  window.__pcvAnnoncesArreter = () => {
    annoncesArretees = true;
    clearTimeout(window.__pcvAnnoncesSuivi);
    window.removeEventListener("focus", reveilAnnonces);
    document.removeEventListener("visibilitychange", reveilAnnonces);
  };
  window.__pcvAnnoncesSuivi = setTimeout(verifierAnnonces, 1e4);
  const majActive = () => !!window.__pcvMaj?.version && !window.__pcvMajPlusTard;
  const demander = (m, args, fini2, n = 0) => {
    const encore = () => {
      if (n < 20) setTimeout(() => demander(m, args, fini2, n + 1), 3e4);
    };
    Promise.race([(O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon?.nom, m, ...args), new Promise((r) => setTimeout(r, 15e3))]).then((r) => r ? fini2(r) : encore(), encore);
  };
  const CLE_MAJ_AUTO = "pcv-maj-auto";
  const CLE_CANAL = "pcv-maj-canal";
  const canalMaj = () => {
    try {
      return JSON.parse(lireCle(CLE_CANAL)) || "stable";
    } catch (e) {
      return "stable";
    }
  };
  const verifierMaj = () => {
    if (lireCle(CLE_MAJ_AUTO) !== "false") demander("maj_verifier", [lireCle("pcv-maj-manifeste") || "", canalMaj()], (r) => {
      const neuve = r.version && r.version !== window.__pcvMaj?.version;
      window.__pcvMaj = r.version ? r : null;
      if (neuve && window.__pcvMajVu) {
        window.__pcvMajVu = window.__pcvMajPlusTard = false;
        bulleUneFois("__pcvMajBulle", "__pcvMajVu", majActive, { avis: "maj" });
      }
    });
  };
  window.__pcvMajVerifier = verifierMaj;
  verifierMaj();
  clearInterval(window.__pcvMajSuivi);
  window.__pcvMajSuivi = setInterval(verifierMaj, 30 * 60 * 1e3);
  let qInstallation = null;
  const MAJ_DELAI = 10 * 60 * 1e3;
  const majInstaller = async (m = window.__pcvMaj) => {
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
      if (m.canalApres) try {
        localStorage.setItem(CLE_CANAL, JSON.stringify(m.canalApres));
      } catch (e) {
      }
      await fin;
      setTimeout(() => {
        const S = O?.SteamClient || window.SteamClient;
        if ((O?.SteamUIStore || window.SteamUIStore)?.RunningApps?.length) return;
        try {
          localStorage.setItem(window.__pcvGreffon.recharge, Date.now());
        } catch (e) {
        }
        try {
          S.Browser.RestartJSContext();
        } catch (e) {
        }
      }, 4e3);
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
  const nouveautesActives = () => !window.__pcvBienvenue?.nouveau?.() && notesInstallees().length > 0 && lireCle("pcv-maj-nouveautes") !== nouveautes.version;
  const PLANTAGE_IC = '<svg viewBox="0 0 24 24"><path d="M12 2.5 1.5 21h21zM10.8 9h2.4v6h-2.4zm0 7.6h2.4V19h-2.4z"/></svg>';
  const plantageActif = () => !!window.__pcvPlantage && lireCle("pcv-plantage-vu") !== window.__pcvPlantage;
  demander("plantage", [], (r) => {
    window.__pcvPlantage = r.fichier || null;
  });
  demander("classes_perdues", [], (r) => {
    if (r?.nouveaux?.length) window.__pcvBulleGrande?.({ svg: window.__pcvIcones?.svg("info", { attrs: 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' }), titre: T("notifs.steam_change_titre"), ligne: T("notifs.steam_change_texte") });
  });
  const avisTextes = (n) => n.annonce ? { ic: ANNONCE_IC, titre: echappe(annonceTexte(n.annonce).titre), ligne: echappe(annonceTexte(n.annonce).texte), voir: T("notifs.voir_plus"), masquer: T("notifs.masquer") } : n.avis === "nouveautes" ? { ic: MAJ_IC, titre: T("bienvenue.notification"), ligne: T("bienvenue.revoir_aide"), voir: T("bienvenue.revoir"), masquer: T("notifs.masquer") } : n.avis === "installee" ? { ic: MAJ_IC, titre: T("bienvenue.notification"), ligne: echappe(notesDe(nouveautes.notes)[0]), voir: T("notifs.voir_plus"), masquer: T("notifs.masquer") } : n.avis === "plantage" ? { ic: PLANTAGE_IC, titre: T("notifs.plantage_titre"), ligne: T("notifs.plantage_texte", { fichier: echappe(window.__pcvPlantage || "") }), voir: "", masquer: T("notifs.masquer") } : n.avis === "plugins" ? { ic: MAJ_IC, titre: T("notifs.plugins_titre", { n: window.__pcvMajPlugins.length }), ligne: echappe(window.__pcvMajPlugins.map((p) => p.nom).join(", ")), voir: T("notifs.voir_plus", "Voir plus"), masquer: T("notifs.plus_tard") } : n.avis === "maj" ? { ic: MAJ_IC, titre: T("notifs.maj_titre", { version: echappe(window.__pcvMaj?.version || "") }), ligne: echappe(majNotes()[0] || ""), voir: T("notifs.voir_plus", "Voir plus"), masquer: T("notifs.plus_tard") } : { ic: AVIS_IC, titre: T("notifs.avis_titre", "Importer vos Mii"), ligne: T("notifs.avis_texte", "Pour retrouver vos Mii sur la place, appuyez sur Voir plus."), voir: T("notifs.voir_plus", "Voir plus"), masquer: T("notifs.ne_plus_afficher", "Ne plus afficher") };
  const bulleUneFois = (suivi, vu, actif, n) => {
    clearInterval(window[suivi]);
    window[suivi] = setInterval(() => {
      if (window[vu] || !actif() || !window.__pcvBulleGrande) return;
      window[vu] = true;
      const a = avisTextes(n);
      clearInterval(window[suivi]);
      window.__pcvBulleGrande({ svg: a.ic, titre: a.titre, ligne: a.ligne, sourceAvis: n.avis, valide: () => racine.hidden && actif(), agir: a.voir ? () => {
        if (!["maj", "installee", "nouveautes", "plugins"].includes(n.avis)) {
          window.__pcvSteamU?.importer?.();
          return;
        }
        window.__pcvNotifsMontrer?.(true);
        if (n.avis === "maj" || n.avis === "installee") ouvrirQuoi(n.avis === "installee");
        else if (n.avis === "nouveautes") window.__pcvBienvenue?.ouvrir(void 0, false);
        else if (n.avis === "plugins") ouvrirPluginMaj();
      } : void 0 }, 5e3);
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
    if (lireCle(CLE_MAJ_AUTO) === "false") return;
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
    montrer(false);
    window.__pcvTelechOnglet?.("greffons");
    O.__pcvAller?.("telechargements");
  };
  bulleUneFois("__pcvPlantageBulle", "__pcvPlantageVu", plantageActif, { avis: "plantage" });
  let quoi = false, qAct = 0, qLecture = null, qAnnonce = null, qPropose = null;
  const dessinerQuoi = () => {
    const q = racine.querySelector(".quoi");
    q.hidden = !quoi;
    window.__pcvVoile?.("quoi", quoi);
    if (!quoi) return ecrireLegende();
    if (qAnnonce) {
      const a = qAnnonce, t = annonceTexte(a);
      let qr = "";
      try {
        if (a.lien) qr = window.__pcvMiiQR?.genererSvg?.(a.lien, "notifications") || "";
      } catch (e) {
      }
      q.innerHTML = `<div class="carte pcv-fenetre annonce"><h2>${echappe(t.titre)}</h2><div class="annonce-corps"><p>${echappe(t.texte)}</p>${a.lien ? `<figure>${qr}<figcaption>${echappe(a.lien)}</figcaption></figure>` : ""}</div><div class="boutons"><button class="oui foc" data-q="0">${T("touche.fermer")}</button></div></div>`;
      legende.innerHTML = window.__pcvIcones.legende([[1, T("touche.fermer")], [2, T("touche.retour")]]);
      return;
    }
    const installation = qInstallation, erreur = installation?.erreur, occupe = !!installation && !erreur;
    const statut = erreur ? T("notifs.maj.erreur") + ": " + T("notifs.maj.erreur.aide") : installation ? T("notifs.maj." + installation.etape) + (installation.pct === void 0 ? "" : ` ${Math.round(installation.pct)}%`) : "";
    if (occupe && q.dataset.installation === "oui") {
      q.querySelector('[role="status"]').textContent = statut;
      return;
    }
    q.dataset.installation = occupe ? "oui" : "non";
    const m = qPropose || window.__pcvMaj, attente = qPropose?.attente, absent = qPropose?.absent;
    const boutons = erreur || qLecture || absent ? [T("touche.fermer")] : [T("notifs.installer"), T("notifs.plus_tard")];
    const defauts = notesDe(m?.defauts), canal = m?.version?.match(/-(rc|beta|alpha)\./)?.[1];
    q.innerHTML = `<div class="carte pcv-fenetre" aria-busy="${occupe || !!attente}"><h2>SteamU v${echappe(installation?.version || qLecture?.version || m?.version || "")}</h2>${installation ? `${occupe ? window.__pcvChargement.html() : ""}<p role="${erreur ? "alert" : "status"}">${statut}</p>` : attente ? window.__pcvChargement.html() : absent ? `<p role="alert">${T("notifs.preversion.absente")}</p>` : `<ul>${(qLecture ? notesDe(qLecture.notes) : qPropose ? notesDe(qPropose.notes) : majNotes()).map((l) => `<li>${echappe(l)}</li>`).join("")}</ul>${defauts.length ? `<p>${T("notifs.preversion.defauts")}</p><ul>${defauts.map((l) => `<li>${echappe(l)}</li>`).join("")}</ul>` : ""}${qPropose && canal && !occupe && !erreur ? `<div class="boutons"><button class="${qPropose.canalApres ? "oui" : ""}${qAct === 2 ? " foc" : ""}" data-q="2" role="checkbox" aria-checked="${!!qPropose.canalApres}">${T("notifs.preversion.rester", { canal: T("steamu.maj.canal." + canal) })}</button></div>` : ""}`}
      <div class="boutons">${boutons.map((t, i) => `<button class="${i ? "" : "oui"}${!occupe && i === qAct ? " foc" : ""}" data-q="${i}"${occupe ? " disabled" : ""}>${t}</button>`).join("")}</div></div>`;
    legende.innerHTML = occupe || attente ? "" : window.__pcvIcones.legende([[1, q.querySelector(".foc")?.textContent || boutons[0]], [2, T("touche.retour")]]);
  };
  const proposer = (m) => {
    qAnnonce = qLecture = null;
    qPropose = m;
    quoi = true;
    qAct = 0;
    dessinerQuoi();
  };
  const ouvrirPreversion = async (a) => {
    const v = a.preversion.version, t = { version: v, attente: true };
    proposer(t);
    const r = await Promise.race([(O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon?.nom, "maj_publication", v), new Promise((ok) => setTimeout(ok, 2e4))]).catch(() => null);
    if (qPropose !== t) return;
    qPropose = r?.version === v ? { ...r, notes: a.preversion.nouveautes || r.notes, defauts: a.preversion.defauts } : { version: v, absent: true };
    dessinerQuoi();
  };
  window.__pcvMajProposer = (m) => {
    window.__pcvSteamU?.fermer?.();
    montrer(true);
    proposer(m);
  };
  const ouvrirAnnonce = (a) => {
    annonceEtat(a.id, { lu: true });
    if (a.preversion) return ouvrirPreversion(a);
    qAnnonce = a;
    qLecture = qPropose = null;
    quoi = true;
    qAct = 0;
    dessinerQuoi();
  };
  const ouvrirQuoi = (lecture = false) => {
    qAnnonce = qPropose = null;
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
    if (qAnnonce) {
      qAnnonce = null;
      quoi = false;
      dessinerQuoi();
      return;
    }
    if (qInstallation && !qInstallation.erreur || window.__pcvMajInstallation || qPropose?.attente) return;
    if (qPropose?.absent) {
      qPropose = null;
      quoi = false;
      dessinerQuoi();
      return;
    }
    if (i === 2 && qPropose) {
      qPropose.canalApres = qPropose.canalApres ? void 0 : qPropose.version.match(/-(rc|beta|alpha)\./)?.[1];
      window.__pcvSon?.("choisir");
      return dessinerQuoi();
    }
    if (i === 0 && qPropose) return majInstaller(qPropose);
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
    if (qPropose) qPropose = null;
    else window.__pcvMajPlusTard = true;
    dessinerQuoi();
    window.__pcvSon?.("retour");
    remplir();
  };
  let act = 0;
  const agirDe = (n) => n.ami ? typeof n.agir === "function" ? n.agir : () => window.__pcvDiscuter?.(n.ami) : VERS[n.pile] || (typeof n.agir === "function" ? n.agir : null);
  const VERS = {
    amis: () => window.__pcvAmisMontrer?.(true),
    telechargements: () => O.__pcvAller?.("telechargements"),
    album: () => (window.__pcvMediatheque || O.__pcvMediatheque)?.ouvrir(),
    succes: () => O.__pcvAller?.(2),
    manettes: () => O.SteamUIStore.Navigate("/settings/controller/:type/:controllerIndex"),
    boutique: () => window.__pcvBoutique?.ouvrir()
  };
  const avisDe = (n) => n?.historique && n.sourceAvis && typeof n.agir !== "function" ? { avis: n.sourceAvis === "maj" ? "installee" : n.sourceAvis } : n;
  const voirDe = (n) => T(n.ami ? "notifs.lire_message" : "notifs.voir_plus");
  const greffonDe = (n) => {
    try {
      const t = String(n.titre || "");
      return O.DeckyPluginLoader.deckyState._plugins.map((p) => p.name).filter((x) => t === x || t.startsWith(x + " ") || t.startsWith(x + ":")).sort((a, b) => b.length - a.length)[0];
    } catch (e) {
      return void 0;
    }
  };
  const amiGreffon = (n) => {
    if (!n.ami) return false;
    try {
      const noms2 = O.DeckyPluginLoader.deckyState._plugins.map((p) => p.name), nom = O.friendStore?.GetPlayer?.(n.ami)?.m_strPlayerName;
      return noms2.includes(nom) || noms2.some((x) => {
        let h = 5381;
        for (const c of x) h = (Math.imul(h, 33) ^ c.charCodeAt(0)) >>> 0;
        return 3724541952 + (h & 1048575) === n.ami;
      });
    } catch (e) {
      return false;
    }
  };
  const steamDe = (n, types, classe) => {
    try {
      return types.includes(n.r?.type) || classe.test(String(n.toast?.data?.getClassName?.() || ""));
    } catch (e) {
      return false;
    }
  };
  const PILES = {
    // La provenance du greffon prime même sur une ancienne pile erronée conservée dans l'historique.
    // (16/11, l'auteur) les mises à jour de SteamU aussi (« maj », « installee ») ; et le « message d'ami » qu'un greffon signe de son nom
    // (Steamcord : un expéditeur factice nommé « Steamcord », amiGreffon)
    greffons: ["notifs.greffons_services", "prise", "cyan-plein", (n) => !!(n.service || n.decky || n.toast?.decky || ["plugins", "maj", "installee"].includes(n.avis || n.sourceAvis) || amiGreffon(n) || greffonDe(n) && greffonDe(n) !== (window.__pcvGreffon?.nom || "SteamU"))],
    steamu: [null, "logo-u", "cyan-plein", (n) => !!(n.avis || n.sourceAvis || greffonDe(n) === (window.__pcvGreffon?.nom || "SteamU"))],
    spotpass: ["spotpass.nom", "spotpass", "c-spotpass", (n) => !!n.annonce],
    amis: ["spaces.amis.nom", "amis", "vert", (n) => !!n.ami || steamDe(n, [3, 5], /Friend|GroupChat|Family|VoiceChat/)],
    telechargements: ["barre.telechargements", "telechargements", "c-telech", (n) => steamDe(n, [], /Download|PeerContent|DiskSpace/)],
    album: ["spaces.medias.nom", "album", "album", (n) => steamDe(n, [], /Screenshot|Recording/)],
    succes: ["biblio.r_succes", "trophee", "cyan-plein", (n) => steamDe(n, [], /Achievement/)],
    manettes: ["home.manettes_court", "manette", "parametres", () => false],
    boutique: ["boutique.titre", "boutique", "eshop", (n) => steamDe(n, [2, 6, 8], /Sale|Gift|Wishlist|Item/)],
    steam: ["notifs.steam", "notifications", "parametres", () => false]
  };
  const couleurPile = (c) => window.__pcvApplis?.[c]?.fond.split(",").at(-1).trim() || c;
  const cleDe = (n) => Object.entries(PILES).find(([, a]) => a[3](n))?.[0] || n.pile || (n.historique ? "ic:" + (n.ic || "") : "steam");
  window.__pcvNotifsCategorie = cleDe;
  const quandDe = (n) => n.historique ? n.date : n.annonce ? n.annonce.date * 1e3 : n.service ? n.service.rtCreated : n.r ? n.r.timestamp * 1e3 : Date.now();
  const jourCle = (t) => new Date(t).toDateString();
  const nomJour = (t) => {
    const j2 = Math.round((new Date(jourCle(Date.now())) - new Date(jourCle(t))) / 864e5);
    const s = j2 === 1 ? T("notifs.hier") : new Date(t).toLocaleDateString(window.__pcvLocale?.() || "fr-FR", { weekday: "long", day: "numeric", month: "long" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const VUES = "pcv-notifs-vues";
  let vues = /* @__PURE__ */ new Set();
  try {
    vues = new Set(JSON.parse(lireCle(VUES) || "[]"));
  } catch (e) {
  }
  const idDe = (n) => n.historique ? n.id : n.annonce ? "a:" + n.annonce.id : n.avis ? "v:" + n.avis : n.service ? "s:" + n.service.rtCreated : "r:" + n.r?.item?.notification_id;
  const nonLu = (n) => n.historique || n.annonce ? !n.lu : !vues.has(idDe(n)) && !n.r?.item?.read;
  const marquer = (ms) => {
    const l = ms.map((i) => items[i]).filter((n) => n && nonLu(n));
    if (!l.length) return;
    l.filter((n) => n.annonce).forEach((n) => annonceEtat(n.annonce.id, { lu: true }));
    l.filter((n) => !n.historique && !n.annonce).forEach((n) => vues.add(idDe(n)));
    try {
      localStorage.setItem(VUES, JSON.stringify([...vues].slice(-500)));
    } catch (e) {
    }
    const h = l.filter((n) => n.historique).map((n) => n.id);
    if (h.length) window.__pcvHistorique.marquer?.((x) => h.includes(x.id));
  };
  const textes = (n) => {
    if (n.annonce || n.avis) {
      const a = avisTextes(n);
      return [a.titre, a.ligne];
    }
    return [echappe(n.titre || ""), echappe(n.texte || "")];
  };
  const aAction = (n) => (n = avisDe(n)).historique ? !!agirDe(n) : n.avis !== "plantage";
  const voirTexte = (n) => n.historique ? voirDe(n) : n.annonce ? T("notifs.voir_plus") : n.avis ? avisTextes(n).voir : T("notifs.voir");
  let vue = "jour", piles = [], ouverte = null, j = 0, lignes = [];
  const reliefDe = (p) => {
    const R = window.__pcvIcones?.relief, a = PILES[p.type];
    if (!R) return "";
    return a ? R(a[1], couleurPile(a[2])) : R(/^<svg/.test(items[p.m[0]]?.ic || "") ? items[p.m[0]].ic : "notifications", "cyan-plein");
  };
  const heure = (n) => n && !n.avis ? `<time>${window.__pcvEtat?.heureDe?.(quandDe(n)) || ""}</time>` : "";
  const nomPile = (p) => {
    const a = PILES[p.type];
    return a?.[0] ? T(a[0]) : a ? "SteamU" : p.m.length ? textes(items[p.m[0]])[0] : "";
  };
  const pileHtml = (p, k) => {
    const ouv = p.cle === ouverte, N = p.m.length, a = PILES[p.type], nl = p.m.filter((i) => nonLu(items[i])).length;
    const [t0, l0] = p.m.length ? textes(items[p.m[0]]) : ["", ""];
    const titre = nomPile(p), petit = a ? [t0, l0].filter(Boolean).join(" : ") : l0;
    let html = "";
    for (let i = 0; i < N; i++) {
      const pos = i - (ouv ? j : 0), n = items[p.m[i]], [t, l] = textes(n);
      html += `<div class="feuille f${Math.min(i, 2)}${ouv && pos > 0 ? " dessous" : ouv && pos < 0 ? " derriere" : ""}${k === sel && pos === 0 ? " sel" : ""}" data-k="${k}" data-j="${i}" style="--p:${pos};z-index:${pos >= 0 ? 100 - pos : 50 + pos}">${i ? `<b><span>${t}</span>${heure(n)}</b><small>${l}</small>` : `${reliefDe(p)}<b><span>${echappe(titre || "")}</span>${heure(items[p.m[0]])}</b><small>${petit || ""}</small>`}</div>`;
    }
    return `<div class="pile${ouv ? " ouverte" : ""}" data-k="${k}" style="--n:${N}">${html}${nl ? `<b class="compte">${nl}</b>` : ""}</div>`;
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
    items.unshift(...annoncesListe());
    items.unshift(...window.__pcvHistorique.lire().filter((h) => !h.sourceAvis || !items.some((n) => n.avis === h.sourceAvis)));
    items = items.map((n, i) => [n, i]).sort((a, b) => quandDe(b[0]) - quandDe(a[0]) || a[1] - b[1]).map(([n]) => n);
    const auj = jourCle(Date.now()), par = {};
    piles = [];
    lignes = items.map((n, i) => i);
    items.forEach((n, i) => {
      if (jourCle(quandDe(n)) !== auj) return;
      const cle = cleDe(n);
      (par[cle] ||= piles[piles.push({ cle, type: cle, m: [] }) - 1]).m.push(i);
    });
    if (ouverte && !par[ouverte]) ouverte = null;
    const po = piles.find((p) => p.cle === ouverte);
    if (po) j = Math.min(j, po.m.length - 1);
    const fin = vue === "historique" ? lignes.length - 1 : piles.length + (items.length ? 0 : -1);
    sel = Math.max(0, Math.min(sel, fin));
    let html = "";
    if (vue === "historique") {
      let jour = "";
      lignes.forEach((i, k) => {
        const n = items[i], t = quandDe(n), [ti, li] = textes(n);
        if (jourCle(t) !== jour) {
          jour = jourCle(t);
          html += `<h3>${jour === auj ? T("notifs.aujourdhui") : nomJour(t)}</h3>`;
        }
        html += `<div class="ligne${k === sel ? " sel" : ""}" data-l="${k}">${reliefDe({ type: cleDe(n), m: [i] })}<span class="t"><b><span>${ti}</span></b><small>${li}</small></span>${heure(n)}</div>`;
      });
      if (!lignes.length) html = `<div class="vide">${T("notifs.vide")}</div>`;
    } else {
      html = `<h3>${T("notifs.aujourdhui")}</h3>`;
      if (!piles.length) html += `<div class="vide">${T("notifs.vide")}</div>`;
      html += `<div class="piles">${piles.map(pileHtml).join("")}</div>`;
      if (items.length > 0) html += `<button class="tout${sel === piles.length ? " sel" : ""}" data-tout>${T("notifs.tout_effacer", "Tout effacer")}</button>`;
    }
    racine.querySelector(".liste").innerHTML = html;
    racine.classList.toggle("sans-n", !items.length);
    racine.classList.toggle("vue-historique", vue === "historique");
    ecrireLegende();
  };
  const legende = document.createElement("div");
  legende.id = "pcv-notifs-legende";
  legende.className = "pcv-legende";
  racine.appendChild(legende);
  const ecrireLegende = () => {
    if (quoi) return;
    const hist = vue === "historique", p = !hist && piles[sel], n = hist ? items[lignes[sel]] : p && items[p.m[ouverte ? j : 0]], l = [];
    if (!hist && !p && items.length) l.push([1, T("notifs.tout_effacer", "Tout effacer")]);
    else if (p && !ouverte && p.m.length > 1) l.push([1, T("notifs.ouvrir_pile")]);
    else if (n && aAction(n) && voirTexte(n)) l.push([1, voirTexte(n)]);
    if (n) l.push([3, T("notifs.effacer")]);
    if (!hist && !ouverte) l.push([13, T("notifs.historique")]);
    l.push([2, T(ouverte ? "notifs.fermer_pile" : "touche.retour")]);
    legende.innerHTML = window.__pcvIcones.legende(window.__pcvLegendeDe(l));
    const tb = racine.querySelector(".histo .pcv-touche"), tn = window.__pcvIcones.touche?.(13);
    if (tb && tn && tb.outerHTML !== tn) tb.outerHTML = tn;
  };
  (window.__pcvLegendes ||= {}).notifs = () => {
    if (!racine.hidden) ecrireLegende();
  };
  const apercu = (onglet = 0) => {
    montrer(false);
    try {
      window.opener.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore.OpenQuickAccessMenu(onglet);
    } catch (e) {
    }
  };
  const agir = (i, action = act) => {
    const n = avisDe(items[i]);
    if (!n) return;
    if (typeof idDe === "function") marquer([i]);
    if (n.historique) {
      const f = agirDe(n);
      if (f) {
        montrer(false);
        f();
      }
      return;
    }
    if (n.annonce) return ouvrirAnnonce(n.annonce);
    if (n.avis === "nouveautes") return action === 1 ? supprimer(i) : window.__pcvBienvenue.ouvrir(void 0, false);
    if (n.avis === "installee") return ouvrirQuoi(true);
    if (n.avis === "maj") return ouvrirQuoi();
    if (n.avis === "plugins") return ouvrirPluginMaj();
    if (n.avis === "plantage") return;
    if (n.avis) {
      window.__pcvSteamU?.importer?.();
      return;
    }
    if (n.service) {
      const f = n.service.data.onClick;
      if (typeof f !== "function") {
        O.__pcvPluginAouvrir = greffonDe(n);
        return apercu(999);
      }
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
    } else if (n.lien === AMIS) {
      montrer(false);
      window.__pcvAmisMontrer?.(true);
    } else if (n.lien) {
      montrer(false);
      O.SteamClient.URL.ExecuteSteamURL(n.lien);
    }
  };
  const effacer = (n) => {
    if (n.historique) {
      window.__pcvHistorique.retirer((h) => h.id === n.id);
      if (n.sourceAvis) return effacer({ avis: n.sourceAvis });
      return;
    }
    if (n.annonce || n.avis) window.__pcvHistorique.retirer((h) => n.annonce ? h.sourceAnnonce === n.annonce.id : h.sourceAvis === n.avis);
    if (n.annonce) return annonceEtat(n.annonce.id, { lu: true, supprime: true });
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
  const confirmer = (titre, texte, oui, ok, non = T("telech.garder")) => {
    if (!window.__pcvDossiers?.demander?.({ titre, texte, non, oui, ok, ailleurs: true })) window.__pcvSon?.("bord");
  };
  const voirSel = () => {
    const l = racine.querySelector(".liste"), el = racine.querySelector(":is(.tout, .feuille, .ligne).sel");
    if (!el || !l) return;
    if (el.classList.contains("tout")) l.scrollTo?.({ top: l.scrollHeight });
    else if ((el.dataset.l ? +el.dataset.l === 0 : +el.dataset.k < 4) && !ouverte) l.scrollTo?.({ top: 0 });
    else el.scrollIntoView?.({ block: "nearest" });
  };
  const pileEl = (k) => racine.querySelector(`.pile[data-k="${k}"]`);
  const feuillesDe = (k) => [...pileEl(k)?.querySelectorAll(".feuille") || []];
  const placer = (k) => feuillesDe(k).forEach((f, i) => {
    const p = i - (ouverte ? j : 0);
    f.style.setProperty("--p", p);
    f.style.zIndex = p >= 0 ? 100 - p : 50 + p;
    f.classList.toggle("dessous", !!ouverte && p > 0);
    f.classList.toggle("derriere", !!ouverte && p < 0);
    f.classList.toggle("sel", k === sel && p === 0);
  });
  const eventail = (k, ouvrir, depuis) => {
    const p = piles[k];
    if (!p) return;
    if (!ouvrir) marquer(p.m);
    ouverte = ouvrir ? p.cle : null;
    j = 0;
    window.__pcvSon?.(ouvrir ? "choisir" : "retour");
    remplir();
    const el = pileEl(k);
    if (!el) return voirSel();
    const fs = feuillesDe(k);
    if (depuis) {
      fs.forEach((f, i) => {
        f.style.transition = "none";
        f.style.transform = `translateY(${depuis[i] || 0}px)`;
      });
      void el.offsetWidth;
      fs.forEach((f) => {
        f.style.transition = "";
        f.style.transform = "";
      });
    } else {
      el.classList.toggle("ouverte", !ouvrir);
      void el.offsetWidth;
      el.classList.toggle("ouverte", ouvrir);
    }
    voirSel();
  };
  const versVue = (v) => {
    if (ouverte) marquer(piles.find((x) => x.cle === ouverte)?.m || []);
    vue = v;
    ouverte = null;
    j = 0;
    sel = 0;
    window.__pcvSon?.(v === "jour" ? "retour" : "choisir");
    racine.querySelector(".tete h2").textContent = T(v === "jour" ? "spaces.notifs.nom" : "notifs.historique_bouton");
    remplir();
    racine.querySelector(".liste").scrollTop = 0;
    window.__pcvApparition?.(racine.querySelector(".liste"));
    voirSel();
  };
  const fini = () => {
    act = 0;
    window.__pcvSon?.("retour");
    remplir();
    voirSel();
  };
  const sortir = (el, sens, fin) => {
    const P2 = window.__pcvPanneau?.() || { duration: 300 };
    if (!el?.animate) return fin();
    const a = el.animate([{ opacity: 1 }, { translate: `${sens * 110}% 0`, rotate: `${sens * 8}deg`, opacity: 0 }], { duration: P2.duration, easing: "ease-in", fill: "forwards" });
    a.onfinish = a.oncancel = fin;
  };
  const supprimer = (i, el, sens = 1) => {
    const n = items[i];
    if (!n) return;
    const ok = () => sortir(el, sens, () => {
      effacer(n);
      fini();
    });
    if (n.historique || n.avis || n.annonce) return ok();
    confirmer(T("notifs.suppr_titre"), T("notifs.suppr_texte"), T("notifs.supprimer", "Supprimer"), ok);
  };
  const effacerPile = (k, sens) => {
    const p = piles[k];
    if (!p) return;
    const l = p.m.map((i) => items[i]);
    confirmer(
      T("notifs.pile_titre", { nom: nomPile(p) }),
      T(l.length > 1 ? "notifs.pile_texte" : "notifs.suppr_texte", { n: l.length }),
      T("notifs.tout_effacer", "Tout effacer"),
      () => sortir(pileEl(k), sens, () => {
        l.forEach(effacer);
        if (p.cle === ouverte) ouverte = null;
        fini();
      }),
      T("notifs.annuler")
    );
  };
  const toutEffacer = () => {
    const l = items.filter((n) => !n.historique);
    confirmer(T("notifs.tout_titre"), T("notifs.tout_texte"), T("notifs.tout_effacer", "Tout effacer"), () => {
      l.forEach(effacer);
      window.__pcvHistorique.vider();
      sel = 0;
      ouverte = null;
      vue = "jour";
      fini();
    });
  };
  const montrer = (oui) => {
    if (!oui && qInstallation && !qInstallation.erreur) return;
    if (oui) {
      window.__pcvBarreQuitter?.();
      sel = 0;
      act = 0;
      j = 0;
      ouverte = null;
      vue = "jour";
      racine.querySelector(".tete h2").textContent = T("spaces.notifs.nom");
      remplir();
      racine.querySelector(".liste").scrollTop = 0;
      window.__pcvBullesFermer?.();
      window.__pcvAvisVu = window.__pcvMajVu = window.__pcvPlantageVu = true;
    }
    if (!oui) {
      quoi = false;
      qAnnonce = qPropose = null;
    }
    racine.querySelector(".quoi").hidden = !quoi;
    window.__pcvVoile?.("quoi", quoi);
    const entre = oui && racine.hidden;
    if (!oui && !racine.hidden) window.__pcvApparition(racine, true);
    racine.hidden = !oui;
    if (entre) window.__pcvApparition(racine);
  };
  const choisir = (k) => {
    const p = piles[k];
    if (!p) return;
    sel = k;
    if (p.m.length > 1) return eventail(k, true);
    if (aAction(items[p.m[0]])) return agir(p.m[0], 0);
    window.__pcvSon?.("bord");
  };
  let geste = null, apresGeste = 0;
  racine.addEventListener("pointerdown", (e) => {
    const f = e.target.closest?.(".feuille");
    if (quoi || !f) return;
    geste = { f, k: +f.dataset.k, i: +f.dataset.j, x: e.clientX, y: e.clientY, id: e.pointerId, mode: null };
  });
  racine.addEventListener("pointermove", (e) => {
    const g = geste;
    if (!g || e.pointerId !== g.id) return;
    const dx = g.dx = e.clientX - g.x, dy = e.clientY - g.y, p = piles[g.k], ouv = p?.cle === ouverte;
    if (!g.mode) {
      if (Math.hypot(dx, dy) < 12) return;
      g.mode = Math.abs(dx) > Math.abs(dy) ? ouv ? "feuille" : "pile" : ouv ? dy > 0 ? "devant" : "replie" : dy > 0 && (p?.m.length > 1 ? "etire" : "ouvre");
      if (!g.mode) {
        geste = null;
        apresGeste = Date.now();
        return;
      }
      if (g.mode === "devant") return;
      try {
        racine.setPointerCapture?.(e.pointerId);
      } catch (x) {
      }
      g.el = g.mode === "pile" ? pileEl(g.k) : g.f;
      g.el.style.transition = "none";
      g.c = g.mode === "feuille" && g.i === j ? pileEl(g.k).querySelector(".compte") : null;
      if (g.c) g.c.style.transition = "none";
      if (g.mode === "replie") {
        g.fs = feuillesDe(g.k);
        g.px = g.f.offsetHeight / 250 || 1;
        g.h = Math.max(1, g.fs.length - 1 - j);
        g.base = g.fs.map((x, i) => i > j ? 120 * g.px * (i - j) : i < j ? -16 * g.px : 0);
        g.fs.forEach((x) => {
          x.style.transition = "none";
        });
      }
      if (g.mode === "etire") {
        g.fs = feuillesDe(g.k);
        g.fs.forEach((x, i) => {
          x.style.transition = "none";
          if (i) x.classList.add("dessous");
        });
        g.px = g.f.offsetHeight / 250 || 1;
      }
      pileEl(g.k).style.zIndex = 300;
    }
    if (g.mode === "pile" || g.mode === "feuille") {
      for (const x of [g.el, g.c]) if (x) {
        x.style.translate = `${dx}px 0`;
        x.style.rotate = `${dx / 40}deg`;
      }
      return;
    }
    if (g.mode === "replie") {
      const t = Math.min(1, Math.max(0, -dy) / (120 * g.px * g.h));
      g.t = t;
      g.offs = g.base.map((b, i) => i > j ? b * (1 - t) : b);
      g.fs.forEach((x, i) => {
        if (i > j) x.style.transform = `translateY(${g.offs[i]}px)`;
      });
      return;
    }
    if (g.mode !== "etire") return;
    const n = g.fs.length - 1, h = n && (g.i || n), plein = 120 * g.px * h, d = Math.max(0, dy), dd = d > plein ? plein + (d - plein) * 0.35 : d;
    g.d = dd;
    g.offs = g.fs.map((x, i) => i <= h ? dd * i / h : dd);
    g.fs.forEach((x, i) => {
      x.style.transform = `translateY(${g.offs[i]}px)`;
      if (i) x.style.setProperty("--lisible", Math.min(1, (dd / h / (120 * g.px)) ** 2));
    });
    pileEl(g.k).style.height = `${330 * g.px + dd}px`;
  });
  const lacher = (e) => {
    const g = geste;
    if (!g || e.pointerId !== g.id) return;
    geste = null;
    if (!g.mode) return;
    apresGeste = Date.now();
    pileEl(g.k).style.zIndex = "";
    const P2 = window.__pcvPanneau?.() || { duration: 300, easing: "ease-out" }, p = piles[g.k];
    if (g.mode === "ouvre") {
      sel = g.k;
      return eventail(g.k, true);
    }
    if (g.mode === "replie") {
      if ((g.t || 0) > 0.5) return eventail(g.k, false, g.offs);
      g.fs.forEach((x) => {
        x.style.transition = "";
        x.style.transform = "";
      });
      return;
    }
    if (g.mode === "devant") {
      const v = g.i !== j ? g.i : j + 1;
      if (v >= (p?.m.length || 0)) return window.__pcvSon?.("bord");
      j = v;
      placer(g.k);
      ecrireLegende();
      voirSel();
      return;
    }
    if (g.mode === "pile" || g.mode === "feuille") {
      const loin = Math.abs(g.dx || 0) > g.el.offsetWidth / 3, sens = Math.sign(g.dx), i = p?.m[g.i];
      if (loin && g.mode === "feuille") return sortir(g.el, sens, () => {
        if (g.c) {
          g.c.style.translate = "";
          g.c.style.rotate = "";
        }
        effacer(items[i]);
        fini();
      });
      for (const x of [g.el, g.c]) if (x) {
        x.style.transition = `translate ${P2.duration}ms ${P2.easing}, rotate ${P2.duration}ms ${P2.easing}`;
        x.style.translate = "";
        x.style.rotate = "";
      }
      if (loin) effacerPile(g.k, sens);
      return;
    }
    g.fs.forEach((x) => {
      x.style.transition = "";
    });
    const h = g.fs.length - 1 && (g.i || g.fs.length - 1);
    pileEl(g.k).style.height = "";
    if (g.d > 60 * g.px * h) {
      sel = g.k;
      return eventail(g.k, true, g.offs);
    }
    g.fs.forEach((x) => {
      x.style.transition = `transform ${P2.duration}ms ${P2.easing}`;
      x.style.transform = "";
      x.classList.remove("dessous");
      x.style.removeProperty("--lisible");
    });
  };
  racine.addEventListener("pointerup", lacher);
  racine.addEventListener("pointercancel", lacher);
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
    if (Date.now() - apresGeste < 400) return;
    if (e.target.closest("[data-tout]")) return toutEffacer();
    if (e.target.closest("[data-histo]")) return versVue("historique");
    const ln = e.target.closest(".ligne");
    if (ln) {
      sel = +ln.dataset.l;
      const i2 = lignes[sel];
      return aAction(items[i2]) ? agir(i2, 0) : (remplir(), window.__pcvSon?.("bord"));
    }
    const f = e.target.closest(".feuille");
    if (!f) return ouverte && eventail(piles.findIndex((x) => x.cle === ouverte), false);
    const k = +f.dataset.k, i = +f.dataset.j, p = piles[k];
    if (p.cle === ouverte) {
      if (i !== j) {
        j = i;
        placer(k);
        ecrireLegende();
        voirSel();
        return;
      }
      return aAction(items[p.m[i]]) ? agir(p.m[i], 0) : window.__pcvSon?.("bord");
    }
    if (ouverte) marquer(piles.find((x) => x.cle === ouverte)?.m || []), ouverte = null;
    sel = k;
    eventail(k, true);
  });
  window.__pcvNotifsMontrer = montrer;
  (window.__pcvVue ||= {}).notifs = () => !racine.hidden && !document.body.classList.contains("pcv-barre-main") && touche(13) === true;
  const touche = (window.__pcvManette ||= {}).notifs = (b) => {
    if (racine.hidden) return false;
    if (quoi && (qInstallation && !qInstallation.erreur || window.__pcvMajInstallation)) return true;
    if (quoi && qInstallation?.erreur) {
      if (b === 1 || b === 2) choisirQuoi(0);
      return true;
    }
    if (b === 1) window.__pcvAppui(racine.querySelector(quoi ? ".quoi .foc" : ".feuille.sel, .ligne.sel, .tout.sel"));
    if (quoi) {
      const caseQ = !!racine.querySelector('.quoi [data-q="2"]');
      if (caseQ && (b === 9 && qAct !== 2 || b === 10 && qAct === 2)) qAct = b === 9 ? 2 : 0;
      else if (b === 11 || b === 12) qAct = b === 12 && !qLecture && !qAnnonce && !qPropose?.absent ? 1 : 0;
      else if (b === 9 || b === 10) racine.querySelector(".quoi ul, .quoi .annonce-corps")?.scrollBy(0, b === 10 ? 120 : -120);
      else if (b === 1) return choisirQuoi(qAct), true;
      else if (b === 2) {
        quoi = false;
      } else return true;
      dessinerQuoi();
      return true;
    }
    const bord = () => {
      window.__pcvSon?.("bord");
      return true;
    }, aller = (k) => {
      sel = k;
      remplir();
      voirSel();
      return true;
    };
    if (vue === "historique") {
      const i = lignes[sel];
      if (b === 2) return versVue("jour"), true;
      if (b === 1) return i != null && aAction(items[i]) ? (agir(i, 0), true) : bord();
      if (b === 3) return i != null ? (supprimer(i, racine.querySelector(".ligne.sel"), 1), true) : bord();
      if (b === 9 && sel === 0) {
        window.__pcvBarreEntrer?.(ecrireLegende);
        return true;
      }
      if (b === 9 || b === 10) {
        const v = sel + (b === 10 ? 1 : -1);
        return v >= lignes.length ? bord() : aller(v);
      }
      return b === 11 || b === 12 || b === 4 ? bord() : true;
    }
    if (b === 13) return versVue("historique"), true;
    const p = piles[sel];
    if (ouverte && p) {
      const n = p.m.length;
      if (b === 2) return eventail(sel, false), true;
      if (b === 1) return aAction(items[p.m[j]]) ? (agir(p.m[j], 0), true) : bord();
      if (b === 3) return supprimer(p.m[j], feuillesDe(sel)[j], 1), true;
      if (b === 9 && j > 0 || b === 10 && j < n - 1) {
        j += b === 10 ? 1 : -1;
        placer(sel);
        ecrireLegende();
        voirSel();
        return true;
      }
      return b >= 9 && b <= 12 ? bord() : true;
    }
    const fin = piles.length;
    if (b === 1) return p ? choisir(sel) : items.length ? toutEffacer() : bord(), true;
    if (b === 2) {
      montrer(false);
      return true;
    }
    if (b === 3) return p ? (p.m.length > 1 ? effacerPile(sel, 1) : supprimer(p.m[0], feuillesDe(sel)[0], 1), true) : bord();
    if (b === 11 || b === 12) {
      const v = sel + (b === 12 ? 1 : -1);
      return !p || v < 0 || v >= fin ? bord() : aller(v);
    }
    if (b === 9) {
      if (!p) return fin ? aller(fin - 1) : (window.__pcvBarreEntrer?.(ecrireLegende), true);
      if (sel < 4) {
        window.__pcvBarreEntrer?.(ecrireLegende);
        return true;
      }
      return aller(sel - 4);
    }
    if (b === 10) {
      if (!p) return bord();
      return aller(sel + 4 < fin ? sel + 4 : sel >> 2 < fin - 1 >> 2 ? fin - 1 : items.length ? fin : sel);
    }
    if (b === 4) return bord();
    return true;
  };
  window.__pcvHistoriqueRafraichir && window.removeEventListener("pcv-historique", window.__pcvHistoriqueRafraichir);
  window.__pcvHistoriqueRafraichir = () => {
    if (!racine.hidden) remplir();
  };
  window.addEventListener("pcv-historique", window.__pcvHistoriqueRafraichir);
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
      height: ${u(60)}; min-width: ${u(220)}; max-width: ${u(400)}; padding: 0 ${u(22)} 0 ${u(9)}; --rayon: ${u(22)}; --fleche: ${u(12)}; --raccord: 1px; border-radius: var(--rayon);
      isolation: isolate; filter: drop-shadow(0 calc(-1 * var(--raccord)) 0 var(--pcv-bord)) drop-shadow(0 ${u(10)} ${u(24)} rgb(from var(--pcv-ombre-c) r g b / .22));
      transform-origin: var(--pointe) ${u(-10)}; animation: pcvBulleNait .42s cubic-bezier(.2,.9,.3,1.25) both; }
    
    #pcv-toasts .b::before { content: ""; position: absolute; inset: calc(-1 * var(--fleche)) 0 0; z-index: -1; background: var(--pcv-verre);
      --diametre: calc(2 * var(--rayon)); --coin: radial-gradient(circle var(--rayon), #000 calc(100% - var(--raccord) / 2), #0000);
      mask: linear-gradient(#000 0 0) center bottom / calc(100% - var(--diametre)) calc(100% - var(--fleche)) no-repeat,
        linear-gradient(#000 0 0) left calc(var(--fleche) + var(--rayon)) / 100% calc(100% - var(--fleche) - var(--diametre)) no-repeat,
        var(--coin) left top var(--fleche) / var(--diametre) var(--diametre) no-repeat,
        var(--coin) right top var(--fleche) / var(--diametre) var(--diametre) no-repeat,
        var(--coin) left bottom / var(--diametre) var(--diametre) no-repeat,
        var(--coin) right bottom / var(--diametre) var(--diametre) no-repeat,
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 12" preserveAspectRatio="none"><path d="M0 12 12 0 24 12Z"/></svg>') left calc(var(--pointe) - var(--fleche)) top / calc(2 * var(--fleche)) calc(var(--fleche) + var(--raccord)) no-repeat; }
    #pcv-toasts .b.sort { animation: pcvBulleRentre .28s ease-in both; }
    #pcv-toasts .b.grande { height: auto; min-height: ${u(92)}; max-width: ${u(560)}; padding: ${u(14)} ${u(30)} ${u(14)} ${u(14)}; gap: ${u(16)}; --rayon: ${u(30)}; }
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
    #pcv-toasts .ic svg:not([fill="none"]), #pcv-toasts .ic svg:not([fill="none"]) * { fill: currentColor; color: var(--pcv-sur-accent); }
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
        agir: boutons.length ? () => boutons[0].click() : void 0,
        // Le rendu caché est démonté à la fin de la bulle : le recréer avant d'ouvrir sa destination depuis l'historique.
        revoir: boutons.length ? async () => {
          const c = await lire(p, t);
          try {
            c?.agir?.();
          } finally {
            c?.fermer();
          }
        } : void 0,
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
  const sonner = (t, rond, son = "notification") => {
    try {
      laCloche(rond)?.querySelector("i")?.animate(["rotate(0)", "rotate(-18deg) scale(1.12)", "rotate(14deg) scale(1.12)", "rotate(-8deg)", "rotate(4deg)", "rotate(0)"].map((transform) => ({ transform, transformOrigin: "50% 15%" })), { duration: 650, easing: "ease-out" });
    } catch (e) {
    }
    try {
      laCloche(rond)?.animate([{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(.97)" }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
    } catch (e) {
    }
    if (window.__pcvSon) window.__pcvSon(son);
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
    const total = file.filter((e) => !e.contenu.annonce).length + (window.__pcvAnnoncesNonLues || 0), r = total && clocheVue();
    if (!r) {
      compteur.hidden = true;
      return;
    }
    const k = unite(), n = total > 9 ? "9+" : String(total);
    compteur.textContent = n;
    compteur.style.left = `${r.right - 18 * k}px`;
    compteur.style.top = `${r.top - 4 * k}px`;
    compteur.hidden = false;
  };
  window.__pcvCompteurNotifs = majCompteur;
  let touchesActives = null, fermerBulle = null;
  const bulle = ({ img, svg, titre, ligne, agir, revoir, grande, rond, vignette, touches, actions, detail, sourceAnnonce, sourceAvis, son, ami, pile }, duree, t) => new Promise((fin) => {
    if (silencieuse({ img, svg, titre, ligne, agir, revoir, sourceAnnonce, sourceAvis, ami, pile })) return fin(true);
    if (![titre, ligne].some((x) => typeof x === "string" && x.trim())) return fin(true);
    const r = clocheVue(rond);
    if (!r) return fin(false);
    const k = unite(), el = document.createElement("div");
    el.className = (grande ? "b grande" : "b") + (detail ? " detail" : "");
    const gauche = r.left - 10 * k, pointe = r.left + r.width / 2 - gauche;
    el.style.left = `${gauche}px`;
    el.style.top = `${r.bottom + 14 * k}px`;
    el.style.setProperty("--pointe", `${pointe}px`);
    const ic = img ? `<img src="${echappe(img)}">` : svg || CLOCHE;
    el.innerHTML = `<i class="ic">${ic}</i><span class="t"><b>${echappe(titre || "")}</b>${ligne ? `<span>${echappe(ligne)}</span>` : ""}</span>` + (vignette ? `<i class="vignette" style="background-image:${echappe(vignette)}"></i>` : "") + (touches ? `<span class="pcv-legende">${window.__pcvIcones?.legende?.(touches) || ""}</span>` : "");
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
      touches = actions.slice(0, 4).map((a, i) => [[1, 3, 4, 2][i], a.texte, a.agir]);
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
    const partir = (immediat = false) => {
      if (parti) return;
      parti = true;
      clearInterval(veille);
      clearTimeout(minuteur);
      fermerBulle = null;
      if (touchesActives === mesTouches) touchesActives = null;
      const retirer = () => {
        el.remove();
        fin(true);
      };
      if (immediat) retirer();
      else {
        el.classList.add("sort");
        setTimeout(retirer, 280);
      }
    };
    el.addEventListener("click", () => {
      const avant = O.location.pathname;
      let fait = false;
      try {
        fait = agir?.() === true;
      } catch (e) {
      }
      partir();
      setTimeout(() => {
        if (!rond && !fait && O.location.pathname === avant) window.__pcvNotifsMontrer?.(true);
      }, agir ? 300 : 0);
    });
    racine.appendChild(el);
    window.__pcvHistorique?.ajouter({
      titre: el.querySelector(".t b")?.textContent || titre || "",
      texte: el.querySelector(".t > span")?.textContent || ligne || "",
      ic: el.querySelector(".ic").innerHTML,
      agir: revoir || agir,
      sourceAnnonce,
      sourceAvis,
      ami,
      pile
    });
    sonner(t, rond, son);
    const minuteur = !t?.fnNotificationResolved ? setTimeout(partir, duree) : null;
    fermerBulle = () => partir(true);
    const veille = setInterval(() => {
      if (!clocheVue(rond)) partir();
      else if (t?.fnNotificationResolved?.()) partir();
    }, 400);
  });
  window.__pcvBullesFermer = () => {
    for (const { contenu, fin } of file.splice(0)) {
      contenu.fermer?.();
      fin?.(true);
    }
    fermerBulle?.();
    majCompteur();
  };
  (window.__pcvManette ||= {}).bulle = (b) => {
    const f = touchesActives?.[b];
    if (!f) return false;
    f();
    return true;
  };
  window.__pcvBulleRond = (rond, o, duree) => enfiler({ ...o, rond, pile: rond, grande: true }, duree);
  window.__pcvBulleGrande = (o, duree) => enfiler({ ...o, grande: true }, duree);
  const T = window.__pcvT || ((c) => c);
  const regroupe = (n) => ({ titre: n > 1 ? T("notifs.n_notifs", { n }) : T("notifs.une_notif"), ligne: T("notifs.touche_cloche"), svg: CLOCHE });
  const retenir = () => document.getElementById("pcv-notifs")?.hidden === false || !!window.__pcvDemarrage?.enCours() || !!document.getElementById("pcv-connexion") || document.getElementById("pcv-place")?.hidden === false || !clocheVue();
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
  const silencieuse = (contenu) => {
    if (!window.__pcvModes?.lire().npd) return false;
    window.__pcvHistorique?.ajouter({
      titre: contenu.titre || "",
      texte: contenu.ligne || "",
      ic: contenu.svg || CLOCHE,
      agir: contenu.revoir || contenu.agir,
      sourceAnnonce: contenu.sourceAnnonce,
      sourceAvis: contenu.sourceAvis,
      ami: contenu.ami,
      pile: contenu.pile
    });
    contenu.fermer?.();
    return true;
  };
  const enfiler = (contenu, duree) => new Promise((fin) => {
    if (silencieuse(contenu)) return fin(true);
    file.push({ contenu, duree, fin });
    suivante();
  });
  window.removeEventListener("pcv-modes", window.__pcvNotifsModes);
  window.addEventListener("pcv-modes", window.__pcvNotifsModes = () => {
    if (!window.__pcvModes.lire().npd) return;
    for (const { contenu, fin } of file.splice(0)) {
      silencieuse(contenu);
      fin?.(true);
    }
    fermerBulle?.();
    majCompteur();
  });
  const MANETTE = { connectee: 63, deconnectee: 64, batterie: 62 };
  const manettesVues = /* @__PURE__ */ new Map(), MANETTE_DELAI = 5e3;
  const manettesConnues = new Map((O.ControllerStore?.GetControllers?.() || []).map((c) => [c.strName, c]));
  const manette = async (t) => {
    const d = t.data, connexion = t.eType === MANETTE.connectee, deconnexion = t.eType === MANETTE.deconnectee;
    const batterie = t.eType === MANETTE.batterie;
    if (!connexion && !deconnexion && !batterie) return null;
    const magasin = O.ControllerStore, liste = magasin?.GetControllers?.() || [];
    for (const c2 of liste) manettesConnues.set(c2.strName, c2);
    const c = connexion ? magasin?.GetController?.(d.controller_index()) : null;
    const candidates = batterie ? liste.filter((x) => x.eControllerType === d.controller_type()) : [];
    const memesPiles = candidates.filter((x) => x.ucBatteryLevel === Math.round(d.pct_remaining() * 100));
    const concernees = memesPiles.length ? memesPiles : candidates;
    const noms = concernees.map((x) => x.strName).filter(Boolean);
    const nom = (deconnexion ? d.controller_name() : connexion ? c?.strName : [...new Set(noms)].join(", ")) || d.controller_type && magasin?.GetControllerTypeString?.(d.controller_type()) || T("notifs.manette");
    const connue = manettesConnues.get(nom), type = d.controller_type?.();
    const controleurs = connexion && c ? [c] : batterie && concernees.length ? concernees : [connue && connue.eControllerType === type ? connue : { strName: nom, eControllerType: type }];
    let picto = "manette";
    try {
      const pictos = new Set((await window.__pcvJoueurs?.(true, controleurs) || []).map((j) => j.picto));
      if (pictos.size === 1 && !pictos.has("manette-inconnue")) picto = [...pictos][0];
    } catch (e) {
    }
    return { svg: window.__pcvIcones?.svg(picto), titre: nom, ligne: batterie ? T("notifs.manette_batterie", { n: Math.round(d.pct_remaining() * 100) }) : T(connexion ? "notifs.manette_connectee" : "notifs.manette_deconnectee"), fermer: () => {
    } };
  };
  const invitationDejaVue = (c) => {
    const v = window.__pcvInvitationVue, x = c.titre + " " + c.ligne;
    return !!v && Date.now() - v.t < 15e3 && x.includes(v.nom) && x.includes(v.jeu);
  };
  const amiDe = (t) => {
    try {
      return t.data?.getClassName?.() === "CClientNotificationFriendMessage" ? Number(BigInt(t.data.steamid()) & 0xFFFFFFFFn) : 0;
    } catch (e) {
      return 0;
    }
  };
  window.__pcvDiscuter = (ami) => {
    if (window.__pcvAmisDiscussion) window.__pcvAmisDiscussion(ami);
    else O.SteamClient.URL.ExecuteSteamURL(`steam://friends/message/${76561197960265728n + BigInt(ami)}`);
    return true;
  };
  let lectures = Promise.resolve();
  const recevoir = (t) => {
    if (t.decky) return void 0;
    lectures = lectures.then(async () => {
      let p;
      while (!(p = pieces())) await new Promise((ok) => setTimeout(ok, 250));
      const controleur = await manette(t), contenu = controleur || await lire(p, t);
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
      const ami = !controleur && amiDe(t), discuter = () => window.__pcvDiscuter(ami);
      contenu.pile = window.__pcvNotifsCategorie({ ...contenu, toast: t, pile: controleur ? "manettes" : void 0 });
      if (ami) Object.assign(contenu, { ami, agir: discuter, revoir: void 0, actions: [], touches: [[1, T("notifs.lire_message"), discuter]] });
      if (!silencieuse(contenu)) {
        file.push({ t, contenu });
        suivante();
      }
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
        if (enJeu() && !window.__pcvModes?.lire().npd) return F.__pcvDispatch0.call(this);
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
