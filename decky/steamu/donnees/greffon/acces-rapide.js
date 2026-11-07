(() => {
  try {
    window.__pcvArFin?.();
  } catch (e2) {
  }
  const { O, principale, esc, module, magasin, ico, pastille, pile, etat, bouton, liste, listeChoisir, ecran } = window.__pcvPE;
  const B = window.__pcvBridge;
  const d = document, h = d.documentElement;
  const T = (k, f, vars) => {
    try {
      return (window.__pcvT || principale().m_BrowserWindow.__pcvT)?.(k, vars) ?? f;
    } catch (x) {
      return f;
    }
  };
  const LOCALE = () => {
    try {
      return (window.__pcvLocale || principale().m_BrowserWindow.__pcvLocale)?.() || "fr-FR";
    } catch (x) {
      return "fr-FR";
    }
  };
  const audio = () => module("audio", "m_mapAudioDevices", (v) => typeof v?.m_mapAudioDevices?.get === "function");
  const steamos = () => module("steamos", "SwitchToDesktop", (v) => typeof v?.SwitchToDesktop === "function" && typeof v?.GetState === "function");
  const gamescope = () => module("gamescope", "SetBlurParams", (v) => typeof v?.SetBlurParams === "function" && typeof v?.GetState === "function");
  const perf = () => module("perf", "SetGameSpecificProfileEnabled", (v) => typeof v?.Get === "function" && typeof v.Get()?.SetFPSLimit === "function")?.Get();
  const reglage = (k, v) => module("reglage", "BinaryWriter", (f) => typeof f === "function" && /BinaryWriter[\s\S]*SetSetting\(/.test(String(f)))?.(k, v);
  const client = () => magasin("settingsStore").m_ClientSettings, systeme = () => magasin("SystemStoragStore"), reseau = () => magasin("SystemNetworkStore");
  const val = (s) => s?.Value ?? s?.m_currentValue;
  const SORTIE = 1, ENTREE = 0;
  const appareil = (sens) => {
    const a = audio();
    return a?.m_mapAudioDevices.get(sens === ENTREE ? a.m_activeInputDeviceId : a.m_activeOutputDeviceId);
  };
  const jeu = () => {
    try {
      const a = B.runningApp();
      return a && (B.appOverview(a.appid) || a);
    } catch (x) {
      return null;
    }
  };
  let tdp = { min: 4, max: 35 };
  steamos()?.GetState({}).then((r) => {
    const s = r.Body().toObject().state;
    if (s?.tdp_limit_max) tdp = { min: s.tdp_limit_min, max: s.tdp_limit_max };
  }).catch(() => {
  });
  const pc = (v) => Math.round(v * 100) + " %";
  const tdpLu = () => client().steamos_tdp_limit_enabled ? Math.max(0, Math.min(1, (client().steamos_tdp_limit - tdp.min) / (tdp.max - tdp.min))) : 1;
  const CURSEURS = {
    lum: { lire: () => val(systeme().DisplayBrightness), ecrire: (v) => systeme().SetDisplayBrightness(v), texte: pc, pas: 0.05 },
    vol: { lire: () => appareil(SORTIE).getDeviceVolume(SORTIE), ecrire: (v) => appareil(SORTIE).setDeviceVolume(SORTIE, v), texte: pc, pas: 0.05 },
    mic: { lire: () => appareil(ENTREE).getDeviceVolume(ENTREE), ecrire: (v) => appareil(ENTREE).setDeviceVolume(ENTREE, v), texte: pc, pas: 0.05 },
    tdp: {
      lire: tdpLu,
      ecrire: (v) => {
        const w = Math.round(tdp.min + v * (tdp.max - tdp.min));
        if (v >= 1) return reglage("steamos_tdp_limit_enabled", false);
        reglage("steamos_tdp_limit", w);
        if (!client().steamos_tdp_limit_enabled) reglage("steamos_tdp_limit_enabled", true);
      },
      texte: (v) => v >= 1 ? T("acces.automatique", "automatique") : Math.round(tdp.min + v * (tdp.max - tdp.min)) + " W",
      pas: () => 1 / (tdp.max - tdp.min)
    }
  };
  const peindreCurseur = (el, v) => {
    el.querySelector(".piste").style.setProperty("--v", (v * 100).toFixed(1) + "%");
    el.querySelector("em").textContent = CURSEURS[el.dataset.curseur].texte(v);
  };
  const poserCurseur = (el, v) => {
    const c = CURSEURS[el.dataset.curseur];
    v = Math.max(0, Math.min(1, v));
    try {
      c.ecrire(v);
    } catch (x) {
    }
    peindreCurseur(el, v);
  };
  const curseur = (cle, cl, debut, fin = '<div class="piste"></div>', style = "") => `<div class="${cl}"${style} data-a="curseur" data-curseur="${cle}"><h2>${debut}<em></em></h2>${fin}</div>`;
  let hz = [];
  gamescope()?.GetState({}).then((r) => {
    hz = r.Body().toObject().state?.active_display_info?.supported_refresh_rates || [];
  }).catch(() => {
  });
  const CYCLES = {
    hz: { valeurs: () => hz, lire: () => client().gamescope_display_refresh_rate, texte: (v) => v ? v + " Hz" : "", ecrire: (v) => reglage("gamescope_display_refresh_rate", v) },
    ips: {
      valeurs: () => [0, ...(perf()?.msgLimits?.fps_limit_options || []).filter(Boolean)],
      lire: () => {
        const a = perf()?.msgSettingsPerApp;
        return a?.is_fps_limit_enabled ? a.fps_limit : 0;
      },
      texte: (v) => v ? v + " i/s" : T("acces.aucune", "aucune"),
      ecrire: (v) => {
        perf().SetFPSLimitEnabled(!!v);
        if (v) perf().SetFPSLimit(false, v);
      }
    },
    // l'incrustation de performances (FPS, température…) : le même réglage et le même appel que la page native de
    // Steam (SteamClient, son magasin perf trouvé ci-dessus) ; 0 = éteinte, 1 à 4 = ses niveaux
    crans: {
      valeurs: () => [0, 1, 2, 3, 4],
      lire: () => perf()?.msgSettingsGlobal?.perf_overlay_level ?? 0,
      texte: (v) => v ? String(v) : T("acces.desactive", "D\xE9sactiv\xE9"),
      ecrire: (v) => perf().SetPerfOverlayLevel(v)
    }
  };
  const LISTES = {
    sortie: {
      titre: T("acces.sortie_titre", "Sortie audio"),
      p: "volume",
      c: "var(--c-accueil)",
      choix: () => [...audio()?.m_mapAudioDevices.values() || []].filter((x) => x.bHasOutput).map((x) => ({ valeur: x.id, texte: x.GetName() })),
      lire: () => audio()?.m_activeOutputDeviceId,
      // (07/11) 1 = EAudioDirection.Output de Steam (0 = Input : on changeait le micro, la sortie restait la même)
      ecrire: (id) => {
        audio()?.m_mapAudioDevices.get(+id)?.setAsDefaultDevice(1);
        setTimeout(peindreSortie, 400);
      }
    },
    hz: {
      titre: T("acces.hz_titre", "Fr\xE9quence de l'\xE9cran"),
      p: "perf",
      c: "var(--c-perf)",
      choix: () => CYCLES.hz.valeurs().map((v) => ({ valeur: v, texte: CYCLES.hz.texte(v) })),
      lire: () => CYCLES.hz.lire(),
      ecrire: (v) => {
        try {
          CYCLES.hz.ecrire(+v);
        } catch (x) {
        }
        setTimeout(peindrePerf, 400);
      }
    },
    ips: {
      titre: T("acces.ips_titre", "Limite d'images par seconde"),
      p: "perf",
      c: "var(--c-perf)",
      choix: () => CYCLES.ips.valeurs().map((v) => ({ valeur: v, texte: CYCLES.ips.texte(v) })),
      lire: () => CYCLES.ips.lire(),
      ecrire: (v) => {
        try {
          CYCLES.ips.ecrire(+v);
        } catch (x) {
        }
        setTimeout(peindrePerf, 400);
      }
    },
    crans: {
      titre: T("acces.crans_titre", "Affichage des performances"),
      p: "perf",
      c: "var(--c-perf)",
      choix: () => CYCLES.crans.valeurs().map((v) => ({ valeur: v, texte: CYCLES.crans.texte(v) })),
      lire: () => CYCLES.crans.lire(),
      ecrire: (v) => {
        try {
          CYCLES.crans.ecrire(+v);
        } catch (x) {
        }
        setTimeout(peindrePerf, 400);
      }
    }
  };
  const btEtat = { on: false, co: 0, liste: [], cherche: false };
  const BASCULES = {
    wifi: { lire: () => reseau().isWifiEnabled, ecrire: (v) => reseau().SetWifiEnabled(v), petit: (on) => on ? B.network().wifi || T("acces.aucun_reseau", "aucun r\xE9seau") : T("acces.desactive", "d\xE9sactiv\xE9") },
    bt: {
      lire: () => B.bluetooth.isEnabled(),
      ecrire: (v) => B.bluetooth.setEnabled(v),
      petit: (on) => on ? btEtat.co ? T("acces.connecte_n", "{n} connect\xE9{s}", { n: btEtat.co, s: btEtat.co > 1 ? "s" : "" }) : T("acces.active", "activ\xE9") : T("acces.desactive", "d\xE9sactiv\xE9")
    },
    avion: { lire: () => !!val(systeme().AirplaneModeEnabled), ecrire: (v) => systeme().SetAirplaneMode(v), petit: (on) => on ? T("acces.active", "activ\xE9") : T("acces.desactive", "d\xE9sactiv\xE9") },
    nuit: { lire: () => !!systeme().msgSettings?.display_nightmode_enabled, ecrire: (v) => systeme().SetNightModeEnabled(v), petit: (on) => on ? T("acces.active", "activ\xE9") : T("acces.desactive", "d\xE9sactiv\xE9") },
    // Steam n'a pas de « Ne pas déranger » : rien à basculer tant que SteamU ne le fait pas lui-même (notifs.js)
    npd: { lire: () => false, petit: () => T("acces.desactive", "d\xE9sactiv\xE9") },
    // réglages rien que pour ce jeu (le profil de performances du jeu en cours, celui de Steam)
    profil: {
      lire: () => {
        const s = perf()?.msgState;
        return !!s && s.current_game_id !== "769" && s.active_profile_game_id === s.current_game_id;
      },
      ecrire: (v) => perf().SetGameSpecificProfileEnabled(v),
      petit: () => ""
    }
  };
  const CONFIRMER = {
    wifi: (on) => on && ["wifi", T("acces.wifi_confirm_titre", "Couper le Wi-Fi ?"), T("acces.wifi_confirm_texte", "La console ne sera plus reli\xE9e \xE0 Internet : plus d'amis en ligne ni de t\xE9l\xE9chargements."), T("acces.wifi_confirm_bouton", "Couper le Wi-Fi")],
    avion: (on) => !on && ["avion", T("acces.avion_confirm_titre", "Passer en mode avion ?"), T("acces.avion_confirm_texte", "Le Wi-Fi et le Bluetooth se coupent : tes manettes et \xE9couteurs sans fil se d\xE9connectent."), T("acces.mode_avion", "Mode avion")],
    bt: (on) => on && btEtat.co > 0 && ["bluetooth", T("acces.bt_confirm_titre", "Couper le Bluetooth ?"), T("acces.bt_appareils_connectes", "{n} appareil{s} connect\xE9{s} : ta manette sans fil peut se d\xE9connecter.", { n: btEtat.co, s: btEtat.co > 1 ? "s" : "" }), T("acces.bt_confirm_bouton", "Couper le Bluetooth")]
  };
  const bascule = (cle, dl, p, c, nom, y) => `<div class="bascule verre entre" style="--d:${dl}s" data-a="bascule:${cle}"${y ? ` data-y="${y}"` : ""} data-b="${cle}"><div class="haut">${pastille(p, c)}<span class="inter"></span></div><b>${nom}<small></small></b>${y ? `<span class="coin" data-a="reglages:${y}">\u203A</span>` : ""}</div>`;
  const outil = (a, p, c, nom, sous) => `<div class="outil"><div class="pilule verre" data-a="${a}">${pastille(p, c)}${nom}</div><span class="outil-badge">${sous}</span></div>`;
  const sousEcran = (cle, titre, p, c, corps, cl = "") => `<div class="voile sousecran ${cl}" data-sous="${cle}" hidden><div class="entete"><div class="pilule verre titre-s">${pastille(p, c)}<span>${titre}</span></div></div><div class="panneau verre">${corps}</div></div>`;
  const grandeBascule = (cle, p, nom, premier = true) => `<div class="grande-bascule verre${premier ? " premier" : ""}" data-a="bascule:${cle}" data-b="${cle}">${pastille(p)}${nom}<span class="inter"></span></div>`;
  const html = `<div class="pilule verre titre-r entre" style="--d:.1s">${pastille("reglages", "var(--c-accueil)")}${T("acces.titre", "R\xE9glages rapides")}</div>${etat()}
    <div class="carte verre batt entre" data-a="sous:batt" hidden>${pile("grosse")}<div><div class="pct"></div><div class="etat-b"></div></div></div>
    ${curseur("lum", "carte verre curseur gliss-card entre", `${pastille("soleil", "var(--c-soleil)")}${T("acces.luminosite", "Luminosit\xE9")}`, void 0, ' style="--d:.04s"')}
    <div class="carte verre son-r entre" style="--d:.08s">${curseur("vol", "gliss-card", `${pastille("volume", "var(--c-accueil)")}${T("acces.volume", "Volume")}`)}
      <div class="sortie-bouton verre" data-a="liste:sortie"><span class="pastille"></span><b class="sortie-nom"></b><span class="coin-sortie">\u203A</span></div>
      ${curseur("mic", "gliss-card", `${pastille("micro", "var(--c-micro)")}${T("acces.micro", "Micro")}`)}</div>
    <div class="bascules">${bascule("wifi", 0.06, "wifi", "", "Wi-Fi", "wifi")}${bascule("bt", 0.09, "bluetooth", "", "Bluetooth", "bt")}${bascule("avion", 0.12, "avion", "var(--c-boutique)", T("acces.mode_avion", "Mode avion"), "avion")}
      ${bascule("npd", 0.15, "silence", "var(--c-notif)", T("acces.ne_pas_deranger", "Ne pas d\xE9ranger"), "")}${bascule("nuit", 0.18, "lune", "var(--c-medias)", T("acces.mode_nuit", "Mode nuit"), "nuit")}
      <div class="bascule verre entre" style="--d:.21s" data-a="bt:recherche"><div class="haut">${pastille("plus", "var(--c-biblio)")}</div><b>${T("acces.ajouter", "Ajouter")}<small>${T("acces.ajouter_bt", "un appareil Bluetooth")}</small></b></div></div>
    <div class="carte verre lecteur-slot entre" style="--d:.24s"></div>
    <div class="outils entre" style="--d:.27s">${outil("sous:perf", "perf", "var(--c-perf)", T("acces.performances", "Performances"), '<span class="badge-tdp">TDP</span>')}${outil("clavier", "clavier", "var(--c-param)", T("acces.clavier", "Clavier"), T("acces.clavier_aide", "\xE0 l'\xE9cran"))}${outil(`cadre:6:${T("acces.aide", "Aide")}:aide`, "aide", "var(--c-param)", T("acces.aide", "Aide"), T("acces.aide_aide", "touches"))}</div>
    <div class="carte verre decky entre" style="--d:.3s"><h2>${pastille("prise", "var(--c-decky)")}Decky</h2><div class="greffons-r"></div><div class="mini bleu tous" data-a="sous:decky">${T("acces.tous_greffons", "Tous les greffons \u203A")}</div></div>
    ${sousEcran("bt", "Bluetooth", "bluetooth", "var(--c-accueil)", `<div class="gauche">${grandeBascule("bt", "bluetooth", "Bluetooth")}
        <div class="bouton verre" style="height:110px" data-a="bt:recherche">${pastille("plus", "var(--c-biblio)")}<span class="b-recherche">${T("acces.rechercher", "Rechercher")}</span></div>
        <div class="note">${T("acces.bt_note", "Mets ton appareil en mode appairage, puis lance la recherche. Choisis un appareil associ\xE9 pour le connecter ou le d\xE9connecter.")}</div></div>
      <div class="droite defile liste-bt"></div>`)}
    ${sousEcran("wifi", "Wi-Fi", "wifi", "var(--c-accueil)", `<div class="gauche">${grandeBascule("wifi", "wifi", "Wi-Fi")}
        <div class="note">${T("acces.wifi_note", "Choisis un r\xE9seau pour t'y connecter. Le r\xE9seau connect\xE9 : le choisir pour voir ses d\xE9tails.")}</div></div>
      <div class="droite defile liste-wifi"></div>`)}
    ${sousEcran("wifid", T("acces.reseau_titre", "R\xE9seau"), "wifi", "var(--c-accueil)", `<div class="gauche centre"><div class="barres-g"></div><b class="nom-wifi"></b><small class="statut-wifi">\u25CF ${T("acces.connecte_statut", "Connect\xE9")}</small></div>
      <div class="droite"><h3>${T("acces.details", "D\xE9tails")}</h3><div class="details-wifi"></div></div>`)}
    <div class="voile sousecran" data-sous="perf" hidden><div class="entete"><div class="pilule verre titre-s">${pastille("perf", "var(--c-perf)")}<span>${T("acces.performances", "Performances")}</span></div></div>
      <div class="perf-page"><div class="ligne premier" data-a="liste:crans" data-cycle="crans">${T("acces.crans_titre", "Affichage des performances")}<span></span></div>
        <div class="ligne" data-a="liste:hz" data-cycle="hz">${T("acces.hz_titre", "Fr\xE9quence de l'\xE9cran")}<span></span></div>
        <div class="ligne" data-a="liste:ips" data-cycle="ips">${T("acces.ips_titre", "Limite d'images par seconde")}<span></span></div>
        ${curseur("tdp", "reglette", T("acces.tdp_titre", "Limite de puissance (TDP)"))}
        <div class="ligne" data-a="cadre:5:Performances:perf">${T("acces.tous_reglages_perf", "Tous les r\xE9glages de performance")}<span></span></div></div></div>
    <div class="voile sousecran musique" data-sous="musique" hidden><div class="vc-zone"></div>
      <div class="entete"><div class="pilule verre titre-s">${pastille("musique", "var(--c-musique)")}<span>${T("acces.musique", "Musique")}</span></div></div>
      <div class="pilule verre lien-bandes premier" data-a="cadre:7:${T("acces.bandes_son", "Bandes-son Steam")}:musique">${pastille("musique")}${T("acces.bandes_son", "Bandes-son Steam")}<small>\u203A</small></div></div>
    <div class="voile sousecran paroles" data-sous="paroles" hidden><div class="pa-zone"></div>
      <div class="entete"><div class="pilule verre titre-s">${pastille("paroles", "var(--c-musique)")}<span>${T("paroles.titre", "Paroles")}</span></div></div></div>
    ${sousEcran("batt", T("acces.batterie", "Batterie"), "prise", "var(--pcv-vert)", `<div class="gauche centre">${pile("xl")}<div class="pct-g"></div><div class="etat-g"></div></div>
      <div class="droite details-batt"></div>`)}
    ${sousEcran("decky", "Decky", "prise", "var(--c-decky)", `<div class="gauche etroite"><h2 class="grand-titre">${T("acces.tes_greffons", "Tes greffons")}</h2><div class="ligne fixe">${T("acces.installes", "Install\xE9s")}<span class="nb-greffons"></span></div>
        <div class="note">${T("acces.decky_note", "Choisis un greffon pour l'ouvrir.")}</div>
        <div class="bouton verre premier" data-a="boutique">${pastille("boutique", "var(--c-decky)")}${T("spaces.boutique.nom", "Boutique")}</div>
        <div class="bouton verre" data-a="decky-reglages">${pastille("reglages", "var(--c-decky)")}${T("acces.reglages_decky", "R\xE9glages de Decky")}</div></div>
      <div class="droite defile"><div class="grille-g liste-greffons"></div></div>`)}
    ${sousEcran("cadre", "", "prise", "var(--c-decky)", '<div class="cadre-boite"></div>', "cadre")}
    <div class="voile confirme" hidden><div class="fenetre verre pcv-fenetre"><span class="pastille grosse"></span><h2></h2><p></p>
      <div class="choix"><div class="bouton verre ok" data-a="confirme"></div>${bouton("retour", "premier", 0, "var(--c-accueil)", "fleche", T("acces.annuler", "Annuler"))}</div></div></div>`;
  const ICO_BT = { 4: "casque", 10: "manette", 11: "clavier" };
  const noms = /* @__PURE__ */ new Map();
  const majBt = async () => {
    const o = await B.bluetooth.state();
    if (!o) return;
    btEtat.on = !!o.is_enabled;
    btEtat.cherche = !!o.is_discovering;
    await Promise.all((o.devices || []).filter((x) => !noms.get(x.id)).map((x) => B.bluetooth.deviceDetails(x.id).then((d2) => noms.set(x.id, d2?.name || ""))));
    btEtat.liste = (o.devices || []).map((x) => ({ ...x, nom: noms.get(x.id) })).filter((x) => x.nom && (x.is_paired || !x.should_hide_hint));
    btEtat.co = btEtat.liste.filter((x) => x.is_connected).length;
    peindreBascules();
    peindreListeBt();
  };
  let appui = false;
  const peindreListeBt = () => {
    if (appui) return;
    const l = e.$(".liste-bt"), f = e.focus()?.dataset.a;
    const elt = (x) => `<div class="elt${x.is_connected ? " connecte" : ""}" data-a="btappareil:${esc(x.id)}"${x.is_paired ? ` data-y="oublier:${esc(x.id)}" data-y-nom="${esc(T("acces.bt_oublier", "Oublier"))}"` : ""}>${pastille(ICO_BT[x.etype] || "bluetooth")}${esc(x.nom)}<span class="etat-elt">${x.is_pairing || x.operation_in_progress ? '<span class="tourne"></span>' : x.is_connected ? T("acces.connecte_statut", "Connect\xE9") : x.is_paired ? T("acces.associe", "Associ\xE9") : T("acces.appuie_appairer", "Appuie pour appairer")}</span></div>` + (x.is_paired ? `<div class="ligne" data-a="btoublier:${esc(x.id)}">${T("acces.bt_oublier_appareil", "Oublier cet appareil")}</div>` : "");
    const assoc = btEtat.liste.filter((x) => x.is_paired), trouves = btEtat.liste.filter((x) => !x.is_paired);
    l.innerHTML = !btEtat.on ? `<h3>${T("acces.appareils", "Appareils")}</h3><div class="vide">${T("acces.bt_desactive_texte", "Le Bluetooth est d\xE9sactiv\xE9.")}</div>` : `<h3>${T("acces.appareils_associes", "Appareils associ\xE9s")}</h3>${assoc.map(elt).join("") || `<div class="vide">${T("acces.aucun_point", "Aucun.")}</div>`}<h3>${T("acces.appareils_trouves", "Appareils trouv\xE9s")} ${btEtat.cherche ? '<span class="tourne"></span>' : ""}</h3>${trouves.map(elt).join("") || `<div class="vide">${btEtat.cherche ? T("acces.recherche_en_cours", "Recherche en cours\u2026") : T("acces.lance_rechercher", "Lance \xAB Rechercher \xBB.")}</div>`}`;
    e.$(".b-recherche").textContent = btEtat.cherche ? T("acces.recherche_court", "Recherche\u2026") : T("acces.rechercher", "Rechercher");
    if (/^bt(appareil|oublier):/.test(f || "")) e.poser(l.querySelector(`[data-a="${f}"]`) || e.$('[data-sous="bt"] .premier'));
  };
  let suiviBt = 0;
  const ouvrirBt = (chercher) => {
    ouvrirSous("bt");
    majBt();
    if (chercher) {
      if (!BASCULES.bt.lire()) basculer("bt");
      B.bluetooth.setDiscovering(true);
      setTimeout(() => {
        const l = e.$(".liste-bt"), h2 = l?.querySelectorAll("h3")[1];
        if (!h2) return;
        l.scrollTop = Math.max(0, h2.offsetTop - 16);
        let n = h2.nextElementSibling;
        while (n && !n.matches("[data-a]")) n = n.nextElementSibling;
        e.poser(n || e.$('[data-sous="bt"] [data-a="bt:recherche"]'));
      }, 500);
    }
    clearInterval(suiviBt);
    suiviBt = setInterval(() => {
      if (sousOuvert() !== "bt") {
        clearInterval(suiviBt);
        B.bluetooth.setDiscovering(false);
        return;
      }
      majBt();
    }, 1500);
  };
  const barres = (n) => `<span class="force">${window.__pcvIcones.svg("wifi", { classe: "ico", niveau: Math.max(0, Math.min(3, n - 1)) })}</span>`;
  const infoWifi = (a) => {
    try {
      return a.wirelessAPInfo || {};
    } catch (x) {
      return {};
    }
  };
  const peindreWifi = () => {
    const l = e.$(".liste-wifi"), f = e.focus()?.dataset.a;
    const pts = (reseau().userVisibleAccessPoints || []).filter((a) => a.type === 2).sort((a, b) => b.isConnected - a.isConnected || (infoWifi(b).strength_raw || 0) - (infoWifi(a).strength_raw || 0));
    l.innerHTML = !reseau().isWifiEnabled ? `<h3>${T("acces.reseaux", "R\xE9seaux")}</h3><div class="vide">${T("acces.wifi_desactive_texte", "Le Wi-Fi est d\xE9sactiv\xE9.")}</div>` : `<h3>${T("acces.reseaux_disponibles", "R\xE9seaux disponibles")}</h3>${pts.map((a) => `<div class="elt${a.isConnected ? " connecte" : ""}" data-a="wifi:${esc(a.key)}">${barres(infoWifi(a).estrength || 0)}${esc(a.displayName)}${a.showAsLocked ? `<small class="cadenas">${T("acces.protege", "prot\xE9g\xE9")}</small>` : ""}<span class="etat-elt">${a.isConnected ? T("acces.connecte_statut", "Connect\xE9") + " \u203A" : a.isSaved ? T("acces.enregistre", "Enregistr\xE9") : ""}</span></div>`).join("") || `<div class="vide">${T("acces.recherche_reseaux", "Recherche des r\xE9seaux\u2026")}</div>`}`;
    if (f?.startsWith("wifi:")) e.poser(l.querySelector(`[data-a="${CSS.escape(f)}"]`) || e.$('[data-sous="wifi"] .premier'));
  };
  const SECU = { 0: T("acces.securite_aucune", "aucune"), 2: "WEP", 4: "WPA", 8: T("acces.wpa2_mdp", "WPA2 (mot de passe)"), 16: T("acces.wpa2_mdp", "WPA2 (mot de passe)"), 32: "WPA3" };
  const ip = (n) => [24, 16, 8, 0].map((s) => n >>> s & 255).join(".");
  const ouvrirWifid = (a) => {
    const w = infoWifi(a);
    e.$(".barres-g").innerHTML = barres(w.estrength || 0);
    e.$(".nom-wifi").textContent = a.displayName;
    const lignes = [
      [T("acces.force_signal", "Force du signal"), ["", T("acces.signal_faible", "faible"), T("acces.signal_moyen", "moyen"), T("acces.signal_bon", "bon"), T("acces.signal_tresbon", "tr\xE8s bon")][w.estrength || 0]],
      [T("acces.securite", "S\xE9curit\xE9"), SECU[w.esecurity] || T("acces.protege", "prot\xE9g\xE9")],
      [T("acces.adresse_console", "Adresse de la console"), a.IPv4Addresses?.[0] && ip(a.IPv4Addresses[0].ip)],
      [T("acces.connexion_auto", "Connexion automatique"), w.is_autoconnect ? T("steamu.app.oui", "oui") : T("steamu.app.non", "non")]
    ].filter(([, v]) => v);
    e.$(".details-wifi").innerHTML = lignes.map(([k, v]) => `<div class="ligne fixe">${k}<span class="noir">${esc(v)}</span></div>`).join("");
    ouvrirSous("wifid");
  };
  let suiviWifi = 0;
  const ouvrirWifi = () => {
    ouvrirSous("wifi");
    try {
      reseau().StartScanningForNetworks?.();
    } catch (x) {
    }
    peindreWifi();
    clearInterval(suiviWifi);
    suiviWifi = setInterval(() => {
      const s = sousOuvert();
      if (s !== "wifi" && s !== "wifid") {
        clearInterval(suiviWifi);
        try {
          reseau().StopScanningForNetworks?.();
        } catch (x) {
        }
        return;
      }
      if (s === "wifi") peindreWifi();
    }, 2e3);
  };
  const duree = (s) => {
    const t = Math.round(s / 300) * 5, hh = Math.floor(t / 60), mm = t % 60;
    return hh ? `${hh} h ${String(mm).padStart(2, "0")}` : `${mm} min`;
  };
  const etatPile = (p) => ({
    branche: p.acState === 2 || p.percent >= 0.99 && p.batteryState === 3,
    s: p.confidence === 1 && p.secondsRemaining > 0 && p.secondsRemaining < 20 * 3600 ? p.secondsRemaining : 0
  });
  const ouvrirBatt = async () => {
    const p = B.battery();
    if (p?.present !== true) return;
    ouvrirSous("batt");
    peindreBatterie();
    const { branche, s } = etatPile(p);
    let b = {};
    try {
      b = await B.callPlugin(window.__pcvGreffon.nom, "batterie") || {};
    } catch (x) {
    }
    const lignes = [
      [branche ? T("acces.branchee", "Branch\xE9e") : T("acces.sur_batterie_reste", "Sur batterie, il te reste"), branche ? Math.round(p.percent * 100) >= 99 ? T("acces.charge_terminee", "charge termin\xE9e") : T("acces.en_charge", "en charge") : s > 0 && T("acces.temps_restant", "environ {temps}", { temps: duree(s) })],
      [T("acces.consommation", "La console consomme"), b.watts != null && b.watts.toLocaleString(LOCALE()) + " W"],
      [T("acces.sante_batterie", "Sant\xE9 de la batterie"), b.sante != null && `${b.sante >= 90 ? T("acces.sante_tresbonne", "tr\xE8s bonne") : b.sante >= 80 ? T("acces.sante_bonne", "bonne") : T("acces.sante_fatiguee", "fatigu\xE9e")} (${b.sante} %)`, b.sante >= 80 ? "vert" : ""],
      [T("acces.cycles_charge", "Cycles de charge"), b.cycles != null && String(b.cycles)]
    ].filter(([, v]) => v);
    if (B.battery()?.present === true && sousOuvert() === "batt") e.$(".details-batt").innerHTML = lignes.map(([k, v, c]) => `<div class="ligne fixe">${k}<span class="${c || "noir"}">${esc(v)}</span></div>`).join("");
  };
  const greffons = () => {
    try {
      const L = O.DeckyPluginLoader, s = L.deckyState, caches = new Set(s._hiddenPlugins || []);
      const tous = s._plugins?.length ? s._plugins : L.plugins || [], par = new Map(tous.map((p) => [p.name, p])), rang\u00E9s = (s._pluginOrder || []).filter((n) => par.has(n));
      return [...rang\u00E9s, ...tous.map((p) => p.name).filter((n) => !rang\u00E9s.includes(n))].filter((n) => !caches.has(n)).map((n) => par.get(n));
    } catch (x) {
      return [];
    }
  };
  const ouvrirDecky = () => {
    const l = greffons();
    e.$(".nb-greffons").textContent = l.length;
    e.$(".liste-greffons").innerHTML = l.map((p) => `<div class="tuile-g" data-a="greffon:${esc(p.name)}">${pastille("prise", "var(--c-decky)")}<span><b>${esc(p.name)}</b><small>${esc(p.version ? T("acces.version", "version {v}", { v: p.version }) : "")}</small></span></div>`).join("");
    ouvrirSous("decky");
  };
  let lect = [], cur = 0, luLe = 0, suiviLect = 0;
  const appel = (m, ...a) => B.callPlugin(window.__pcvGreffon.nom, m, ...a);
  const tps = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    const h2 = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = String(s % 60).padStart(2, "0");
    return h2 ? `${h2}:${String(m).padStart(2, "0")}:${x}` : `${m}:${x}`;
  };
  const posDe = (p) => Math.min(p.duree || Infinity, p.position + (p.statut === "Playing" ? (performance.now() - luLe) / 1e3 * (p.vitesse || 1) : 0));
  const pctDe = (p) => p.duree > 0 ? (100 * Math.min(1, posDe(p) / p.duree)).toFixed(2) + "%" : "0%";
  const poch = (p, cl = "") => p?.pochette ? `<div class="poch ${cl}" style="background-image:url('${String(p.pochette).replace(/['"()\\]/g, encodeURIComponent)}');background-size:cover;background-position:center"></div>` : `<div class="poch vide ${cl}">${ico("musique")}</div>`;
  const prog = (p, n) => `<div class="prog"${p.chercher ? ` data-a="lect:piste:${n}"` : ""}><span class="lect-pos">${tps(posDe(p))}</span><div class="barre-l" style="--p:${pctDe(p)}"><i></i><b></b></div><span>${p.duree > 0 ? tps(p.duree) : ""}</span></div>`;
  const cmd = (a, n, ic, cl = "", ok = true) => `<div class="cmd ${cl}${ok ? "" : " off"}"${ok ? ` data-a="lect:${a}:${n}"` : ""}>${ico(ic)}</div>`;
  const cmds = (p, n) => `<div class="cmds">${cmd("precedent", n, "precedent", "", p.precedent)}${cmd("lecture", n, p.statut === "Playing" ? "pause" : "lecture", "jouer premier", p.lire)}${cmd("suivant", n, "suivant", "", p.suivant)}</div>`;
  const ouvrirL = (p, n, court) => p.jeu ? `<div class="ouvrir" data-a="lect:ouvrir:${n}">${pastille("sortie")}${court ? T("acces.ouvrir", "Ouvrir") : T("acces.ouvrir_app", "Ouvrir {app}", { app: esc(p.app) })}</div>` : "";
  const appli = (p) => `<div class="appli">${ico("musique")}${T("acces.dans_app", "dans {app}", { app: esc(p.app) })}<span class="ou">${p.statut === "Playing" ? T("acces.en_lecture", "en lecture") : T("acces.en_pause", "en pause")}</span></div>`;
  const VIDE = [T("acces.rien_ne_joue", "Rien ne joue"), T("acces.lance_musique", "Lance une musique ou une vid\xE9o dans une appli : elle appara\xEEtra ici.")];
  const puces = () => lect.length > 1 ? `<div class="lg-puces"><span class="touche epaule">LB</span>${lect.map((x, i) => `<div class="puce${i === cur ? " oui" : ""}" data-a="lect:choisir:${i}">${poch(x, "petite")}${esc(x.app)}</div>`).join("")}<span class="touche epaule">RB</span></div>` : "";
  const carteLecteur = () => {
    const p = lect[cur];
    if (!p) return `<div class="lg-h vide"><div class="lg-corps"><div class="lg-zone" data-a="lect:page">${poch(null)}<div class="lg-infos"><h1 class="titre-m">${VIDE[0]}</h1><div class="vide-txt">${VIDE[1]}</div></div></div></div></div>`;
    return `<div class="lg-h">${puces()}<div class="lg-corps"><div class="lg-zone" data-a="lect:page">${poch(p)}<div class="lg-infos">${appli(p)}<h1 class="titre-m">${esc(p.titre || p.app)}</h1><div class="artiste">${esc(p.artiste)}</div>${p.album ? `<div class="album">${esc(p.album)}</div>` : ""}</div></div></div>${prog(p, cur)}<div class="lg-bas">${cmds(p, cur)}${ouvrirL(p, cur)}</div></div>`;
  };
  const pageMusique = () => {
    const p = lect[cur], k = lect.length;
    if (!p) return `<div class="vc vide-c">${poch(null)}<h1 class="titre-m">${VIDE[0]}</h1><div class="vide-txt">${VIDE[1]}</div></div>`;
    const g = (cur - 1 + k) % k, d2 = (cur + 1) % k, cote = (i, c) => `<div class="vc-cote ${c}" data-a="lect:choisir:${i}">${poch(lect[i], "petite")}<span>${esc(lect[i].app)}</span></div>`;
    return `<div class="vc-fond">${poch(p)}</div><div class="vc clair"><div class="vc-carrousel">${k > 2 ? cote(g, "g") : ""}${poch(p, "premier-p")}${k > 1 ? cote(d2, "d") : ""}</div><div class="vc-points">${k > 1 ? lect.map((_, i) => `<i${i === cur ? ' class="oui"' : ""}></i>`).join("") : ""}</div><h1 class="titre-m">${esc(p.titre || p.app)}</h1><div class="artiste">${esc(p.artiste)}${p.album ? ", " + esc(p.album) : ""}</div>${prog(p, cur)}${cmds(p, cur)}<div class="vc-bas"><div class="paroles-star" data-a="paroles:ouvrir">${pastille("paroles")}${T("paroles.titre", "Paroles")}</div></div></div>` + (p.jeu ? `<div class="appli-mini" data-a="lect:ouvrir:${cur}">${pastille("sortie")}${esc(p.app)}</div>` : "");
  };
  let dernierRendu = "";
  const peindreLecteur = () => {
    const f = e.focus()?.dataset.a, cle = JSON.stringify(lect.map((p) => [p.nom, p.statut, p.titre, p.artiste, p.album, p.duree, p.pochette?.slice(-48), p.precedent, p.suivant])) + cur;
    if (cle !== dernierRendu) {
      dernierRendu = cle;
      e.$(".lecteur-slot").innerHTML = carteLecteur();
      if (sousOuvert() === "musique") e.$(".vc-zone").innerHTML = pageMusique();
      if (f?.startsWith("lect:")) {
        const el = e.racine.querySelector(`[data-a="${f}"]`);
        if (el) e.poser(el);
      }
      if (sousOuvert() === "paroles") {
        if (ly?.cle !== cleLy(lect[cur])) chargerParoles(false);
        else e.racine.querySelectorAll(".pa-zone [data-poch]").forEach((w) => {
          w.innerHTML = poch(lect[cur]);
        });
      }
    } else if (!scrub) e.racine.querySelectorAll(".prog").forEach((pr) => {
      const p = lect[cur];
      if (!p) return;
      pr.querySelector(".lect-pos").textContent = tps(posDe(p));
      pr.querySelector(".barre-l").style.setProperty("--p", pctDe(p));
    });
    e.racine.classList.toggle("leg-lecteur", sousOuvert() === "musique" && lect.length > 0);
    e.$(".x-txt").textContent = lect[cur]?.statut === "Playing" ? T("acces.pause_legende", "Pause") : T("acces.lecture_legende", "Lecture");
  };
  const majLecteurs = async () => {
    try {
      const l = await appel("lecteurs");
      if (!Array.isArray(l)) return;
      const nom = lect[cur]?.nom;
      if (attendu && performance.now() < attendu.jusqua) {
        const q = l.find((x) => x.nom === attendu.nom);
        if (q && Math.abs(q.position - attendu.pos) > 2) q.position = attendu.pos + (performance.now() - attendu.le) / 1e3;
        else attendu = null;
      }
      lect = l;
      luLe = performance.now();
      cur = Math.max(0, lect.findIndex((p) => p.nom === nom));
      if (cur >= lect.length) cur = 0;
    } catch (x) {
    }
    peindreLecteur();
  };
  let rafProg = 0, scrub = null, attendu = null;
  const animerProg = (oui) => {
    cancelAnimationFrame(rafProg);
    if (!oui) return;
    const pas = (t) => {
      if (e.racine.hidden) return;
      const p = lect[cur], vu = !e.$('[data-sous="paroles"]').hidden;
      if (p?.statut === "Playing" && !scrub) e.racine.querySelectorAll(".prog .barre-l").forEach((b) => b.style.setProperty("--p", pctDe(p)));
      if (vu && ly?.etat === "actif") suivreParoles();
      if (vu) danser(t);
      rafProg = requestAnimationFrame(pas);
    };
    rafProg = requestAnimationFrame(pas);
  };
  const suivreLecteurs = (oui) => {
    clearInterval(suiviLect);
    animerProg(oui);
    if (oui) {
      majLecteurs();
      suiviLect = setInterval(() => {
        if (e.racine.hidden) return suivreLecteurs(false);
        majLecteurs();
      }, 1e3);
    }
  };
  const commanderL = (action, n, position) => {
    const p = lect[+n];
    if (!p) return;
    appel("lecteur", p.nom, action, position ?? null, p.piste).then(() => setTimeout(majLecteurs, 250)).catch(() => {
    });
  };
  const changerLecteur = (d2) => {
    if (lect.length < 2) return;
    cur = (cur + d2 + lect.length) % lect.length;
    peindreLecteur();
  };
  const ouvrirAppli = (p) => {
    B.resumeApp(p.jeu);
    fermer();
  };
  const allerA = (n, pos) => {
    const q = lect[n];
    if (!q?.chercher) return;
    q.position = pos;
    luLe = performance.now();
    attendu = { nom: q.nom, pos, le: luLe, jusqua: luLe + 1500 };
    commanderL("position", n, pos);
  };
  const LY_H = 108;
  let ly = null, lyGlisse = null, lyLache = 0, lyMinuteur = 0;
  const parolesPermises = () => {
    try {
      return !!principale().m_BrowserWindow.__pcvSteamU?.paroles?.();
    } catch (x) {
      return false;
    }
  };
  const cleLy = (p) => p ? [p.nom, p.titre, p.artiste].join("\n") : "";
  const legOk = (voir) => {
    const ok = e.$(".legende > .pilule:has(.touche.a)");
    if (ok) ok.style.display = voir ? "" : "none";
  };
  const PTS = '<span class="ly-pts"><i></i><i></i><i></i></span>';
  const etatLy = (pt, h2, t, bout = "") => `<div class="pa-etat">${pt}<h1>${h2}</h1><p>${t}</p>${bout}</div>`;
  const peindreParoles = (ouverture) => {
    const p = lect[cur], z = e.$(".pa-zone"), s = ly.etat, art = esc(p?.artiste || "");
    const fond = `<div class="vc-fond" data-poch>${poch(p)}</div>`;
    if (s === "refuse") z.innerHTML = fond + etatLy(
      pastille("cadenas"),
      T("paroles.refuse_titre", "Paroles non autoris\xE9es"),
      T("paroles.refuse_texte", "Les paroles viennent de LRCLIB, une base libre. Pour les afficher, SteamU doit lui envoyer le titre et l'artiste du morceau."),
      `<div class="ouvrir-param premier" data-a="paroles:param">${pastille("reglages")}${T("paroles.ouvrir_param", "Ouvrir les param\xE8tres")}</div>`
    );
    else if (s === "vide" || s === "erreur" || s === "rien") z.innerHTML = fond + etatLy(
      PTS,
      s === "rien" ? VIDE[0] : s === "vide" ? T("paroles.vide_titre", "Pas de paroles pour ce morceau") : T("paroles.erreur_titre", "Paroles indisponibles"),
      s === "rien" ? VIDE[1] : s === "vide" ? T("paroles.vide_texte", "LRCLIB ne conna\xEEt pas encore ce morceau. Rien \xE0 afficher pour l'instant.") : T("paroles.erreur_texte", "LRCLIB ne r\xE9pond pas pour l'instant. R\xE9essaie dans un moment.")
    );
    else {
      const lignes = s === "actif" ? ly.lignes : [[0, ""]];
      const r = debitLy(lignes);
      ly.mots = lignes.map((l, i) => l[1] ? motsLy(lignes, i, p.duree, r) : null);
      const vu = !ouverture && ly.entre ? " vu" : "";
      z.innerHTML = fond + `<div class="pa-poch${vu ? " petit" : ""}" data-poch>${poch(p)}</div><div class="pa-mini${vu}"><h2 class="titre-m">${esc(p.titre || p.app)}</h2><div class="artiste">${art}</div></div><div class="ly-zone premier${vu}" data-y="pochette" data-y-nom="${T("paroles.pochette", "Pochette")}"><div class="ly-lista">` + lignes.map(([, x], i) => `<div class="lyl${x ? "" : " instru"}" data-i="${i}"><span class="lyl-in">${x ? ly.mots[i].map(([, , w]) => `<span class="m">${esc(w)}</span>`).join("") : PTS}</span></div>`).join("") + `</div><div class="ly-marqueur"></div></div><div class="pa-grande"><span data-poch>${poch(p)}</span><h2 class="titre-m">${esc(p.titre || p.app)}</h2><div class="artiste">${art}${p.album ? ", " + esc(p.album) : ""}</div></div>`;
      ly.foyer = -1;
      if (s === "actif") suivreParoles(true);
      else placerLy(0);
      if (!ly.entre) {
        const moi = ly;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          e.$(".pa-poch")?.classList.add("petit");
          e.$(".pa-mini")?.classList.add("vu");
        }));
        setTimeout(() => {
          if (moi.entre) return;
          moi.entre = true;
          e.$(".ly-lista")?.classList.add("monte");
          e.$(".ly-zone")?.classList.add("vu");
        }, ouverture ? 520 : 0);
      } else e.$(".ly-lista").classList.add("monte");
    }
    poserDanse(z);
    if (sousOuvert() === "paroles" && !e.focus()?.isConnected) e.premier();
  };
  const chargerParoles = (ouverture) => {
    const p = lect[cur], cle = cleLy(p);
    if (!ouverture && ly?.cle === cle) return;
    const moi = ly = { cle, etat: !p ? "rien" : !parolesPermises() ? "refuse" : "charge", lignes: [], foyer: -1, entre: !ouverture && !!ly?.entre };
    clearTimeout(lyMinuteur);
    peindreParoles(ouverture);
    if (moi.etat !== "charge") return;
    const montrer = (etat2, lignes = []) => {
      if (ly !== moi) return;
      moi.etat = etat2;
      moi.lignes = lignes;
      if (sousOuvert() === "paroles") peindreParoles(false);
    };
    const essayer = (n) => {
      const q = lect[cur];
      if (ly !== moi || cleLy(q) !== cle) return;
      appel("paroles", q.artiste || "", q.titre || "", q.album || "", q.duree || 0).then((r) => {
        if (r?.lignes?.length) montrer("actif", r.lignes);
        else if (r?.vide) montrer("vide");
        else throw r;
      }).catch(() => {
        if (ly !== moi) return;
        if (n < 3) lyMinuteur = setTimeout(() => essayer(n + 1), 2e3 * (n + 1));
        else montrer("erreur");
      });
    };
    lyMinuteur = setTimeout(() => essayer(0), ouverture ? 0 : 600);
  };
  const debitLy = (L) => {
    const v = L.flatMap(([t, x], i) => x && L[i + 1] ? [(L[i + 1][0] - t) / x.length] : []).sort((a, b) => a - b);
    return Math.max(0.04, Math.min(0.2, v.length >= 4 ? v[Math.floor(v.length / 4)] * 1.1 : 0.09));
  };
  const motsLy = (L, i, duree2, r) => {
    const [t, x, M] = L[i], suiv = L[i + 1]?.[0] ?? (duree2 || t + 8);
    if (M) return M.flatMap(([a, w], k) => w ? [[a, M[k + 1]?.[0] ?? Math.min(suiv, a + 2), w]] : []);
    const n = x.length || 1, D = Math.min(suiv - t, n * r);
    let c = 0;
    return x.split(" ").map((w, k, a) => {
      w = k < a.length - 1 ? w + " " : w;
      const d2 = t + D * c / n;
      c += w.length;
      return [d2, t + D * c / n, w];
    });
  };
  const placerLy = (foyer) => {
    const l = e.$(".ly-lista");
    if (!l) return;
    l.style.transform = `translateY(${-(LY_H / 2 + foyer * LY_H)}px)`;
    l.querySelectorAll(".lyl").forEach((el, i) => {
      const dd = Math.abs(i - foyer);
      el.style.setProperty("--rd", Math.min(dd * 16, 140) + "ms");
      el.classList.toggle("actif", i === foyer);
      el.classList.toggle("proche", dd === 1);
      el.classList.toggle("passe", i < foyer);
    });
  };
  const suivreParoles = (force) => {
    const p = lect[cur];
    if (ly?.etat !== "actif" || !p || lyGlisse) return;
    const L = ly.lignes, t = posDe(p), pos = t + 0.15;
    let i = 0;
    while (i + 1 < L.length && L[i + 1][0] <= pos) i++;
    if (i !== ly.foyer || force) {
      ly.foyer = i;
      placerLy(i);
      ly.ws = null;
      ly.mot = -1;
      ly.k = "";
      e.racine.querySelectorAll(".lyl .m.lu, .lyl .m[style]").forEach((w) => {
        w.classList.remove("lu");
        w.style.removeProperty("--k");
      });
    }
    const M = ly.mots?.[i];
    if (M?.length) {
      let j = 0;
      while (j + 1 < M.length && M[j + 1][0] <= t) j++;
      const ws = ly.ws || (ly.ws = e.racine.querySelectorAll(`.lyl[data-i="${i}"] .m`)), k = Math.max(0, Math.min(1, (t - M[j][0]) / Math.max(0.05, M[j][1] - M[j][0]))).toFixed(3);
      if (j !== ly.mot) {
        ws.forEach((w, n) => {
          w.classList.toggle("lu", n < j);
          if (n !== j) w.style.removeProperty("--k");
        });
        ly.mot = j;
        ly.k = "";
      }
      if (k !== ly.k) {
        ly.k = k;
        ws[j]?.style.setProperty("--k", k);
      }
    } else if (!L[i][1]) {
      const fin = L[i + 1]?.[0] ?? (p.duree || L[i][0] + 8), r = Math.max(0, Math.min(1, (pos - L[i][0]) / Math.max(0.1, fin - L[i][0])));
      const pts = e.racine.querySelectorAll(`.lyl[data-i="${i}"] .ly-pts i`);
      pts.forEach((pt, k) => pt.style.setProperty("--f", Math.max(0, Math.min(1, r * 3 - k)).toFixed(3)));
      pts[0]?.parentElement.style.setProperty("--fin", Math.max(0, Math.min(1, (fin - pos) / 0.5)).toFixed(3));
    }
  };
  const DANSE = {
    y0: 680,
    h: 520,
    bpm: 110,
    vif: 100,
    chante: 0.09,
    cam: { pos: [0, 2.3, 9.4], vise: [0, 0.8, 0], fov: 35 },
    pieds: [[640, 1046], [860, 1104], [1080, 1104], [1296, 1046]],
    caps: [24, 8, -8, -24]
  };
  let danse = null;
  const tempoLy = (instants) => {
    let m = null;
    for (let bpm = 70; bpm <= 180; bpm += 0.25) {
      const P = 60 / bpm;
      let c = 0, s = 0;
      for (const t of instants) {
        const a = 2 * Math.PI * t / P;
        c += Math.cos(a);
        s += Math.sin(a);
      }
      const R = Math.hypot(c, s) / instants.length, sc = R * Math.exp(-(Math.log2(bpm / 115) ** 2) / 0.5);
      if (!m || sc > m.sc) m = { bpm, R, sc, phase: (Math.atan2(s, c) / (2 * Math.PI) * P + P) % P };
    }
    return m && m.R >= 0.5 ? m : null;
  };
  const ambianceDe = (bpm, debit) => (bpm > 0 ? bpm >= DANSE.vif : debit > 0 && debit < DANSE.chante) ? "fete" : "douce";
  const TEINTES = { vives: [[255, 120, 80], [255, 196, 90], [40, 196, 210]], sol: [192, 130, 80] };
  const aviver = (c, haut, ch) => {
    const m = (c[0] + c[1] + c[2]) / 3, r = Math.max(...c) - Math.min(...c) || 1, v = c.map((x) => m + (x - m) * Math.min(3, Math.max(1, ch / r)));
    return v.map((x) => Math.max(0, Math.min(255, x * haut / Math.max(1, ...v))));
  };
  const teintesPoch = (url) => new Promise((ok) => {
    if (!url) return ok(TEINTES);
    const im = new Image();
    im.onerror = () => ok(TEINTES);
    im.onload = () => {
      try {
        const c = d.createElement("canvas");
        c.width = c.height = 24;
        const x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(im, 0, 0, 24, 24);
        const px = x.getImageData(0, 0, 24, 24).data, bacs = Array.from({ length: 12 }, () => [0, 0, 0, 0]), moy = [0, 0, 0];
        for (let i = 0; i < px.length; i += 4) {
          const [r, g, b] = px.subarray(i, i + 3), w = (Math.max(r, g, b) - Math.min(r, g, b)) ** 2;
          const k = Math.floor((Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180 / Math.PI + 360) % 360 / 30);
          bacs[k][0] += w;
          bacs[k][1] += w * r;
          bacs[k][2] += w * g;
          bacs[k][3] += w * b;
          moy[0] += r;
          moy[1] += g;
          moy[2] += b;
        }
        const tri = bacs.filter((b) => b[0] > 24 * 24 * 40 * 40 * 0.04).sort((a, b) => b[0] - a[0]).slice(0, 3).map((b) => aviver(b.slice(1).map((v) => v / b[0]), 245, 120));
        while (tri.length && tri.length < 3) tri.push(tri[0].map((v) => v + (255 - v) * 0.4 * tri.length));
        ok({ vives: tri.length ? tri : TEINTES.vives, sol: moy.map((v) => v / 576) });
      } catch (x) {
        ok(TEINTES);
      }
    };
    im.src = url;
  });
  const rgba = (c, a) => `rgba(${c.map(Math.round).join(",")},${a})`;
  const peindreSol = (D, tons) => {
    const { E, W, k } = D, g = D.fond.getContext("2d"), H = DANSE.h, y0 = DANSE.y0, ox = (W - 1920) / 2;
    const [sol, sable, clair, joint] = [[192, 112], [231, 123], [243, 103], [201, 119]].map(([haut, ch]) => aviver(tons.sol, haut, ch));
    g.setTransform(k, 0, 0, k, 0, 0);
    g.clearRect(0, 0, W, H);
    g.fillStyle = rgba(sol, 1);
    g.fillRect(0, 0, W, H);
    g.save();
    g.translate(760 + ox, 1060 - y0);
    g.scale(1, 0.32);
    const n = g.createRadialGradient(0, 0, 0, 0, 0, 900);
    n.addColorStop(0, rgba(sable, 0.85));
    n.addColorStop(0.55, rgba(sable, 0.25));
    n.addColorStop(1, rgba(clair, 0));
    g.fillStyle = n;
    g.fillRect(-W, -2400, 2 * W, 4800);
    g.restore();
    const L = 0.4, J = 2, Z = [-14, 8.2], lattes = new Path2D(), traits = new Path2D(), M = Math.ceil(W / 60);
    for (let i = -M; i < M; i++) {
      const x0 = i * L, x1 = x0 + L, a = E(x0, Z[0]), b = E(x1, Z[0]), c = E(x1, Z[1]), e2 = E(x0, Z[1]);
      if (i % 2) {
        lattes.moveTo(...a);
        lattes.lineTo(...b);
        lattes.lineTo(...c);
        lattes.lineTo(...e2);
        lattes.closePath();
      }
      traits.moveTo(...a);
      traits.lineTo(...e2);
      for (let z = Z[0] + (i * 7 % 5 + 5) % 5 * J / 5; z < Z[1]; z += J) {
        const p = E(x0, z), q = E(x1, z);
        if (p[1] > 80) {
          traits.moveTo(...p);
          traits.lineTo(...q);
        }
      }
    }
    g.globalAlpha = 0.35;
    g.fillStyle = rgba(clair, 1);
    g.fill(lattes);
    g.globalAlpha = 1;
    g.strokeStyle = rgba(joint, 1);
    g.lineWidth = 2.4;
    g.stroke(traits);
    g.globalCompositeOperation = "destination-in";
    const f = g.createLinearGradient(0, 770 - y0, 0, 960 - y0);
    f.addColorStop(0, "rgba(0,0,0,0)");
    f.addColorStop(1, "#000");
    g.fillStyle = f;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "source-over";
  };
  const ambiance = (nom, PAL, E, W) => {
    const fete = nom === "fete", CREME = [255, 241, 201], TRAIT = "#5e3020", ox = (W - 1920) / 2;
    const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
    const teinte = (u) => {
      const k = (u % 3 + 3) % 3, i = Math.floor(k);
      return mix(PAL[i], PAL[(i + 1) % 3], k - i);
    };
    const coup = (b) => Math.exp(-((b % 1 + 1) % 1) * 5);
    let germe = 7;
    const hasard = () => (germe = germe * 16807 % 2147483647) / 2147483647;
    const FLAQUES = fete ? [[-2.8, 1.4, 1.5, 0], [0, 2.4, 1.7, 2], [2.8, 1.4, 1.5, 1], [-5.6, 3.2, 2, 2], [5.6, 3.2, 2, 0]] : [[-1.9, 1.6, 2.6, 0], [2.1, 1.9, 2.6, 2]];
    const flaque = (g, x, z, r, c, a) => {
      const [cx, cy] = E(x, z), rx = E(x + r, z)[0] - cx, ry = (E(x, z + r)[1] - E(x, z - r)[1]) / 2;
      g.save();
      g.translate(cx, cy);
      g.scale(1, ry / rx);
      const d2 = g.createRadialGradient(0, 0, 0, 0, 0, rx);
      d2.addColorStop(0, rgba(c, a));
      d2.addColorStop(0.55, rgba(c, a * 0.45));
      d2.addColorStop(1, rgba(c, 0));
      g.fillStyle = d2;
      g.beginPath();
      g.arc(0, 0, rx, 0, Math.PI * 2);
      g.fill();
      g.restore();
    };
    const note = (g, x, y, s, rot, c, a, double) => {
      g.save();
      g.globalAlpha = a;
      g.translate(x, y);
      g.rotate(rot);
      g.scale(s, s);
      g.lineWidth = 3 / s * 0.9;
      g.strokeStyle = TRAIT;
      g.fillStyle = rgba(c, 1);
      g.lineJoin = "round";
      const tete = (dx) => {
        g.beginPath();
        g.ellipse(dx, 0, 11, 8, -0.4, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      };
      g.beginPath();
      g.rect(8, -46, 4.5, 46);
      g.fill();
      g.stroke();
      tete(0);
      if (double) {
        g.beginPath();
        g.rect(38, -54, 4.5, 50);
        g.fill();
        g.stroke();
        tete(30);
        g.beginPath();
        g.moveTo(8, -46);
        g.lineTo(42.5, -54);
        g.lineTo(42.5, -44);
        g.lineTo(8, -36);
        g.closePath();
        g.fill();
        g.stroke();
      } else {
        g.beginPath();
        g.moveTo(12.5, -46);
        g.bezierCurveTo(26, -38, 30, -28, 22, -16);
        g.bezierCurveTo(24, -26, 20, -32, 12.5, -34);
        g.closePath();
        g.fill();
        g.stroke();
      }
      g.restore();
    };
    const parts = Array.from({ length: fete ? 46 : 30 }, () => ({ x: hasard() * W, y: hasard(), v: 0.5 + hasard(), r: hasard(), c: Math.floor(hasard() * 4), ph: hasard() * 6.3 }));
    const notes = Array.from({ length: fete ? 6 : 3 }, (_, k) => ({ x: [250, 1660, 420, 1500, 120, 1800][k] + ox, ph: k / (fete ? 6 : 3), c: k % 3, d: k % 2 === 1 }));
    const fondu = (y) => Math.max(0, Math.min(1, (y - 60) / 90));
    return {
      // la lumière du moment : contre-jour des Mii (valeurs linéaires de FFL) et teinte de leur halo
      lumiere: (t, b) => {
        const c = fete ? teinte(Math.floor(b / 4)) : teinte(t / 5 * 2), k = fete ? 0.55 + 0.45 * coup(b) : 0.8;
        return { rim: c.map((v) => (v / 255) ** 2.2 * k * 1.1 + 0.05), halo: rgba(c, 0.45), c, k, cote: fete ? Math.floor(b / 4) % 2 ? 0.9 : -0.9 : Math.sin(t * Math.PI / 5) };
      },
      dessous: (g, t, b) => {
        g.save();
        g.globalCompositeOperation = "screen";
        const bas = g.createLinearGradient(0, 300, 0, 520);
        bas.addColorStop(0, rgba(PAL[0], 0));
        bas.addColorStop(1, rgba(PAL[0], fete ? 0.22 + 0.1 * coup(b) : 0.2));
        g.fillStyle = bas;
        g.fillRect(0, 300, W, 220);
        g.globalCompositeOperation = "overlay";
        FLAQUES.forEach(([x, z, r, i], k) => {
          if (fete) flaque(g, x, z, r, teinte(i + Math.floor(b / 4)), 0.55 + 0.45 * coup(b + k * 0.25 * (k % 2)));
          else flaque(g, x + 0.9 * Math.sin(t * Math.PI * 2 / 5 + i), z, r, teinte(i + t / 5), 0.7 + 0.15 * Math.sin(t * 1.3 + i));
        });
        g.globalCompositeOperation = "screen";
        const h2 = fete ? teinte(Math.floor(b / 4) + 1) : teinte(t / 5 * 2 + 1.5), [hx, hy] = E(0, 1.2);
        g.save();
        g.translate(hx, hy - 170);
        g.scale(1, 0.55);
        const d2 = g.createRadialGradient(0, 0, 0, 0, 0, 640);
        d2.addColorStop(0, rgba(h2, fete ? 0.3 + 0.15 * coup(b) : 0.3));
        d2.addColorStop(1, rgba(h2, 0));
        g.fillStyle = d2;
        g.fillRect(-640, -640, 1280, 1280);
        g.restore();
        parts.forEach((p) => {
          if (fete) {
            const y = -40 + (p.y * 560 + t * (90 + 70 * p.v)) % 560, x = p.x + 30 * Math.sin(t * 2 + p.ph), a = fondu(y);
            if (!a) return;
            const rot = t * (3 + 4 * p.r) + p.ph;
            g.save();
            g.globalCompositeOperation = "source-over";
            g.globalAlpha = a * 0.95;
            g.translate(x, y);
            g.rotate(rot);
            g.scale(1, Math.cos(rot * 1.7));
            g.fillStyle = rgba(p.c === 3 ? CREME : PAL[p.c], 1);
            g.fillRect(-9, -5, 18, 10);
            g.restore();
          } else {
            const y = 520 - (p.y * 520 + t * (18 + 22 * p.v)) % 520, x = p.x + 18 * Math.sin(t * 0.8 + p.ph), a = fondu(y) * (0.5 + 0.5 * Math.sin(t * 2 + p.ph)), r = 4 + 7 * p.r;
            if (a <= 0) return;
            const c = p.c === 3 ? CREME : PAL[p.c], d3 = g.createRadialGradient(x, y, 0, x, y, r * 2.4);
            d3.addColorStop(0, rgba(CREME, a));
            d3.addColorStop(0.25, rgba(c, a * 0.8));
            d3.addColorStop(1, rgba(c, 0));
            g.fillStyle = d3;
            g.fillRect(x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
          }
        });
        g.restore();
        notes.forEach((n) => {
          const u = (t / (fete ? 2.5 : 5) + n.ph) % 1, y = 440 - u * 380, saut = fete ? -14 * coup(b + 2 * n.ph) : 0;
          const a = fondu(y) * Math.min(1, u * 6) * (fete ? 1 : 0.85);
          if (a > 0) note(g, n.x + 24 * Math.sin(u * 6.3 + n.ph * 9), y + saut, fete ? 1.25 : 1.1, 0.18 * Math.sin(t * 1.6 + n.ph * 6), PAL[n.c], a, n.d);
        });
      }
    };
  };
  const INSTRUMENTS = ["guitare", "tambour", "clavier", "maracas", "tambourin"];
  const DANSES = { douce: ["balancer", "clap", "brasHaut"], fete: ["chasse", "brasHaut", "tour", "sautJoie", "clap", "balancer"] };
  const graine = (s) => {
    let h2 = 2166136261;
    for (let i = 0; i < s.length; i++) h2 = Math.imul(h2 ^ s.charCodeAt(i), 16777619);
    return h2 >>> 0;
  };
  const tirerGroupe = (cle, n) => {
    let g = graine(cle) || 1;
    const h2 = () => (g = Math.imul(g ^ g >>> 15, 2246822507) >>> 0 || 7) / 4294967296;
    const melange = (a) => {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(h2() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const musiciens = h2() < 0.34 ? 1 : 2, roles = ["chanteur", ...melange([...INSTRUMENTS]).slice(0, musiciens)];
    while (roles.length < n) roles.push("danseur");
    return { roles: melange(roles), qui: melange([...Array(n).keys()]), danse: Math.floor(h2() * 6) };
  };
  const PEAU = 0.36;
  const fabriquerObjets = (T2) => {
    const M = (color, roughness = 0.45, metalness = 0) => new T2.MeshStandardMaterial({ color, roughness, metalness });
    const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
      const o = new T2.Mesh(geo, mat);
      o.position.set(x, y, z);
      o.castShadow = true;
      return o;
    };
    const tour = (pts, seg = 24) => new T2.LatheGeometry(pts.map(([x, y]) => new T2.Vector2(x, y)).reverse(), seg);
    const groupe = (...o) => {
      const g = new T2.Group();
      g.add(...o);
      g.visible = false;
      return g;
    };
    const echelle = (k, g) => {
      g.scale.setScalar(k);
      return g;
    };
    const METAL = M(14212580, 0.28, 0.85), NOIR = M(2303275, 0.6), BOIS = M(13209429, 0.55), CREME = M(16182486, 0.7);
    const micro = groupe(
      mesh(tour([[0, -0.02], [0.017, -0.02], [0.021, 0.07], [0.026, 0.085], [0, 0.085]], 20), NOIR),
      mesh(new T2.SphereGeometry(0.036, 22, 16), METAL, 0, 0.11, 0),
      mesh(new T2.TorusGeometry(0.03, 5e-3, 8, 24).rotateX(Math.PI / 2), NOIR, 0, 0.095, 0)
    );
    const maraca = (c) => groupe(
      mesh(tour([[0, -0.03], [0.011, -0.03], [0.01, 0.05], [0.024, 0.085], [0.04, 0.12], [0.036, 0.15], [0.02, 0.168], [0, 0.172]]), M(c, 0.32)),
      mesh(new T2.TorusGeometry(0.039, 6e-3, 8, 28).rotateX(Math.PI / 2), M(16774364, 0.4), 0, 0.12, 0)
    );
    const baguette = () => groupe(mesh(tour([[0, -0.07], [8e-3, -0.07], [7e-3, 0.2], [4e-3, 0.24], [8e-3, 0.25], [0, 0.262]], 10), BOIS));
    const cymb = new T2.InstancedMesh(new T2.CylinderGeometry(0.016, 0.016, 6e-3, 14).rotateZ(Math.PI / 2), METAL, 6), mt = new T2.Matrix4();
    for (let i = 0; i < 6; i++) {
      const a = (i + 0.5) / 6 * Math.PI * 2 + Math.PI / 2;
      mt.makeTranslation(Math.cos(a) * 0.088, 0.088 + Math.sin(a) * 0.088, 0);
      cymb.setMatrixAt(i, mt);
    }
    cymb.castShadow = true;
    const tambourin = groupe(
      mesh(new T2.CylinderGeometry(0.088, 0.088, 0.032, 36, 1, true).rotateX(Math.PI / 2), M(13780527, 0.38), 0, 0.088, 0),
      mesh(new T2.CircleGeometry(0.086, 36), CREME, 0, 0.088, 0.012),
      cymb
    );
    tambourin.children[0].material.side = T2.DoubleSide;
    const demi = (x) => Math.max(Math.sqrt(Math.max(0, 0.01 - (x + 0.07) ** 2)), Math.sqrt(Math.max(0, 56e-4 - (x - 0.075) ** 2)), x > -0.07 && x < 0.075 ? 0.062 : 0);
    const bord2 = Array.from({ length: 41 }, (_, i) => -0.17 + i * (0.32 / 40)), huit = new T2.Shape([...bord2.map((x) => new T2.Vector2(x, demi(x))), ...bord2.reverse().map((x) => new T2.Vector2(x, -demi(x)))]);
    const caisse = new T2.ExtrudeGeometry(huit, { depth: 0.05, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3, curveSegments: 24 }).translate(0, 0, -0.025);
    const guitare = groupe(
      mesh(caisse, M(13780527, 0.3)),
      mesh(new T2.CircleGeometry(0.032, 24), NOIR, 0.03, 0, 0.038),
      mesh(new T2.BoxGeometry(0.012, 0.07, 0.012), NOIR, -0.09, 0, 0.04),
      mesh(new T2.BoxGeometry(0.3, 0.034, 0.02), M(7027999, 0.5), 0.27, 0, 0.02),
      mesh(new T2.BoxGeometry(0.07, 0.05, 0.02), NOIR, 0.45, 0, 0.02)
    );
    const HT = PEAU, pieds = new T2.InstancedMesh(new T2.CylinderGeometry(6e-3, 6e-3, 0.26, 6), NOIR, 3);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * Math.PI * 2;
      mt.makeRotationFromEuler(new T2.Euler(Math.cos(a) * 0.45, 0, -Math.sin(a) * 0.45)).setPosition(Math.sin(a) * 0.055, 0.115, Math.cos(a) * 0.055);
      pieds.setMatrixAt(i, mt);
    }
    pieds.castShadow = true;
    const tambour = groupe(
      mesh(new T2.CylinderGeometry(0.14, 0.14, 0.11, 36), M(3108818, 0.3, 0.25), 0, HT - 0.055, 0),
      mesh(new T2.CircleGeometry(0.135, 36).rotateX(-Math.PI / 2), CREME, 0, HT + 1e-3, 0),
      mesh(new T2.TorusGeometry(0.14, 7e-3, 8, 40).rotateX(Math.PI / 2), METAL, 0, HT, 0),
      mesh(new T2.TorusGeometry(0.14, 7e-3, 8, 40).rotateX(Math.PI / 2), METAL, 0, HT - 0.11, 0),
      mesh(new T2.CylinderGeometry(8e-3, 8e-3, HT - 0.11, 8), NOIR, 0, (HT - 0.11) / 2, 0),
      pieds
    );
    const HC = 0.44, coin = new T2.Shape(), w = 0.32, p = 0.1, r = 0.025;
    coin.moveTo(-w + r, -p);
    coin.lineTo(w - r, -p);
    coin.quadraticCurveTo(w, -p, w, -p + r);
    coin.lineTo(w, p - r);
    coin.quadraticCurveTo(w, p, w - r, p);
    coin.lineTo(-w + r, p);
    coin.quadraticCurveTo(-w, p, -w, p - r);
    coin.lineTo(-w, -p + r);
    coin.quadraticCurveTo(-w, -p, -w + r, -p);
    const noires = new T2.InstancedMesh(new T2.BoxGeometry(0.014, 0.012, 0.06), NOIR, 22);
    for (let i = 0, k = 0; i < 31 && k < 22; i++) if (![2, 6].includes(i % 7)) {
      mt.makeTranslation(-0.27 + (i + 1) * 0.0175, HC + 0.012, 0);
      noires.setMatrixAt(k++, mt);
    }
    const jambes = new T2.InstancedMesh(new T2.BoxGeometry(0.016, 0.55, 0.016), NOIR, 2);
    [-1, 1].forEach((s, i) => {
      mt.makeRotationZ(s * 0.55).setPosition(0, HC / 2 - 0.02, 0);
      jambes.setMatrixAt(i, mt);
    });
    const clavier = groupe(
      mesh(new T2.ExtrudeGeometry(coin, { depth: 0.035, bevelEnabled: true, bevelSize: 8e-3, bevelThickness: 8e-3, bevelSegments: 2 }).rotateX(Math.PI / 2), M(2763827, 0.35), 0, HC, 0),
      mesh(new T2.BoxGeometry(0.56, 0.012, 0.11), M(16513266, 0.4), 0, HC + 3e-3, 0.03),
      noires,
      jambes
    );
    return {
      micro: echelle(1, micro),
      maracaD: echelle(1.6, maraca(15222060)),
      maracaG: echelle(1.6, maraca(15971890)),
      baguetteD: echelle(0.8, baguette()),
      baguetteG: echelle(0.8, baguette()),
      tambourin: echelle(1.4, tambourin),
      guitare: echelle(0.85, guitare),
      tambour,
      clavier
    };
  };
  const OBJETS = { chanteur: ["micro"], guitare: ["guitare"], tambour: ["tambour", "baguetteD", "baguetteG"], clavier: ["clavier"], maracas: ["maracaD", "maracaG"], tambourin: ["tambourin"], danseur: [] };
  const teneur = (T2, O2) => {
    const v = { a: new T2.Vector3(), b: new T2.Vector3(), d: new T2.Vector3(), g: new T2.Vector3(), x: new T2.Vector3(), y: new T2.Vector3(), z: new T2.Vector3(), M: new T2.Matrix4(), Y: new T2.Vector3(0, 1, 0) };
    return (m, role) => {
      m.objet.updateMatrixWorld(true);
      const main = (cote, avance = 0.035) => {
        v.a.setFromMatrixPosition(m.os[cote ? 9 : 6].matrixWorld);
        v.b.setFromMatrixPosition(m.os[cote ? 8 : 5].matrixWorld);
        const dir = v.a.clone().sub(v.b).normalize();
        return { p: v.a.clone().addScaledVector(dir, avance * m.taille), dir };
      };
      const dans = (o, h2, cible) => {
        o.position.copy(h2.p);
        if (cible) v.y.copy(cible).sub(h2.p);
        else v.y.copy(h2.dir);
        v.y.normalize();
        v.z.set(Math.sin(m.cap), 0, Math.cos(m.cap)).addScaledVector(v.y, -v.y.dot(v.z)).normalize();
        v.x.crossVectors(v.y, v.z);
        o.quaternion.setFromRotationMatrix(v.M.makeBasis(v.x, v.y, v.z));
      };
      const devant = (o, dz) => {
        o.position.copy(m.objet.position).add(v.z.set(Math.sin(m.cap) * dz, 0, Math.cos(m.cap) * dz));
        o.rotation.set(0, m.cap, 0);
      };
      const avant = (dz, dx = 0, y = 0) => v.g.copy(m.objet.position).add(v.d.set(Math.sin(m.cap) * dz + Math.cos(m.cap) * dx, y, Math.cos(m.cap) * dz - Math.sin(m.cap) * dx));
      if (role === "chanteur") {
        const h2 = main(1, 0.012), angle = 15 * Math.PI / 180;
        const axe = v.d.set(-Math.sin(m.cap) * Math.sin(angle), Math.cos(angle), -Math.cos(m.cap) * Math.sin(angle));
        dans(O2.micro, h2, h2.p.clone().add(axe));
        O2.micro.position.addScaledVector(axe, -0.025 * O2.micro.scale.y);
      } else if (role === "maracas") {
        for (const [o, c] of [[O2.maracaD, 1], [O2.maracaG, 0]]) {
          const h2 = main(c);
          dans(o, h2, h2.p.clone().add(h2.dir).add(v.Y));
        }
      } else if (role === "tambourin") dans(O2.tambourin, main(1));
      else if (role === "tambour") {
        devant(O2.tambour, 0.2);
        dans(O2.baguetteD, main(1), avant(0.2, -0.05, PEAU).clone());
        dans(O2.baguetteG, main(0), avant(0.2, 0.05, PEAU).clone());
      } else if (role === "clavier") {
        devant(O2.clavier, 0.25);
        O2.clavier.rotation.y += Math.PI;
      } else if (role === "guitare") {
        v.x.set(Math.cos(m.cap), 0, -Math.sin(m.cap));
        v.z.set(Math.sin(m.cap), 0, Math.cos(m.cap));
        O2.guitare.position.copy(main(0, 0).p).addScaledVector(v.x, -0.32 * O2.guitare.scale.x).addScaledVector(v.z, -0.02 * O2.guitare.scale.z);
        O2.guitare.rotation.set(0, m.cap, 0);
      }
    };
  };
  const preparerDanse = () => {
    if (danse) return;
    danse = { mii: [], der: 0 };
    let W;
    try {
      W = principale().m_BrowserWindow;
    } catch (x) {
      return;
    }
    W.__pcvVraisMii?.charger().then(async (M) => {
      if (!M?.vrais || !danse) return;
      const T2 = W.THREE, C = window.__pcvCharge, basse = !!C?.reglage().miiBasse, cv = () => d.createElement("canvas");
      const k = Math.min(innerWidth / 1920, innerHeight / 1200), L = Math.round(innerWidth / k), H = DANSE.h;
      const boite = d.createElement("div"), sol = cv(), fond = cv(), toile = cv();
      boite.className = "pa-scene";
      sol.className = "pa-sol";
      toile.className = "pa-mii";
      boite.append(sol, toile);
      for (const c of [sol, fond, toile]) {
        c.width = Math.round(L * k);
        c.height = Math.round(H * k);
      }
      const rendu = new T2.WebGLRenderer({ canvas: toile, alpha: true, antialias: C?.reglage().miiLisse ?? true, powerPreference: "high-performance" });
      rendu.setClearColor(0, 0);
      rendu.setPixelRatio(1);
      rendu.setSize(toile.width, toile.height, false);
      rendu.shadowMap.enabled = !basse;
      rendu.shadowMap.type = T2.PCFSoftShadowMap;
      const Q = DANSE.cam, cam = new T2.PerspectiveCamera(Q.fov, L / 1200, 0.1, 60);
      cam.position.set(...Q.pos);
      cam.lookAt(...Q.vise);
      cam.setViewOffset(L, 1200, 0, DANSE.y0, L, H);
      cam.updateMatrixWorld();
      const v = new T2.Vector3(), E = (x, z) => {
        v.set(x, 0, z).project(cam);
        return [(v.x + 1) / 2 * L, (1 - v.y) / 2 * H];
      };
      const auSol = (x, y) => {
        v.set(x / L * 2 - 1, 1 - y / H * 2, 0.5).unproject(cam).sub(cam.position).normalize();
        return cam.position.clone().addScaledVector(v, -cam.position.y / v.y);
      };
      const scene = new T2.Scene();
      const cle = new T2.DirectionalLight(16777215, 1);
      cle.position.set(-1.8, 10, 3.6);
      cle.castShadow = true;
      cle.shadow.mapSize.set(1024, 1024);
      Object.assign(cle.shadow.camera, { left: -5, right: 5, top: 4, bottom: -4, near: 1, far: 20 });
      cle.shadow.radius = 6;
      cle.shadow.bias = -5e-4;
      cle.shadow.normalBias = 0.02;
      const plan = new T2.Mesh(new T2.PlaneGeometry(60, 60), new T2.ShadowMaterial({ color: 3806216, opacity: 0.32 }));
      plan.rotation.x = -Math.PI / 2;
      plan.receiveShadow = true;
      const face = new T2.DirectionalLight(16777215, 1.6), ciel = new T2.HemisphereLight(16774374, 7030320, 1.4);
      cle.intensity = 1.2;
      const O2 = fabriquerObjets(T2);
      scene.add(cle, plan, face, ciel, ...Object.values(O2));
      const qui = [...await M.siens(), ...M.habitantsDefaut()].slice(0, DANSE.pieds.length);
      for (let i = qui.length; i < DANSE.pieds.length; i++) qui.push(M.hasard(i));
      const rims = [], lumieres = [], mii = qui.map((q, i) => {
        const m = M.creer({
          donnees: q.donnees,
          graine: q.graine,
          pantalon: q.pantalon,
          nom: q.nom,
          rendu,
          resolution: 256,
          expressions: ["neutre", "cligne", "sourire", "joie", "parle"],
          ...q.tenue ? { tenue: q.tenue, couleursSwitch: q.couleursSwitch } : {}
        });
        m.regler(1);
        m.sol = 0;
        m.ombre.userData.force = 1.6;
        m.ombre.material.color.set(2755588);
        scene.add(m.objet, m.ombre);
        m.jouer("repos", { fondu: 0 });
        m.objet.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = !o.material.transparent;
          const u = o.material.uniforms;
          if (!u) return;
          for (const n of ["u_light_ambient", "u_light_diffuse", "u_light_specular", "u_rim_color", "u_light_dir"]) if (u[n]?.value?.clone) u[n] = { value: u[n].value.clone() };
          if (u.u_rim_color) rims.push(u.u_rim_color.value);
          if (u.u_light_ambient) lumieres.push(u);
        });
        return m;
      });
      if (!danse) {
        mii.forEach((m) => m.liberer());
        rendu.dispose();
        return;
      }
      const places = DANSE.pieds.map(([x, y]) => auSol(x + (L - 1920) / 2, y - DANSE.y0));
      Object.assign(danse, { boite, sol, fond, toile, rendu, scene, cam, mii, rims, lumieres, E, W: L, k, O: O2, face, ciel, places, tenir: teneur(T2, O2) });
      await Promise.all([...mii.map((m) => m.objet), ...Object.values(O2)].map((o) => rendu.compileAsync?.(o, cam, scene))).catch(() => {
      });
      if (danse?.toile) {
        danse.pret = true;
        const z = e.$(".pa-zone");
        if (z) poserDanse(z);
      }
    }).catch((x) => console.warn("pcv", "Paroles : pas de Mii", x?.message));
  };
  const poserDanse = (z) => {
    preparerDanse();
    const oui = !!(danse?.pret && lect[cur]);
    z.classList.toggle("avec-mii", oui);
    if (oui) z.append(danse.boite);
  };
  const danser = (t) => {
    const D = danse, p = lect[cur];
    if (!D?.pret || !p || window.__pcvJeuDevant) return;
    const C = window.__pcvCharge, ips = C?.reglage().miiIps || 0;
    if (ips && t - D.der < 1e3 / ips - 2) return;
    const eu = t - D.der, dt = Math.max(0, Math.min(0.1, eu / 1e3));
    D.der = t;
    const t0 = performance.now();
    if (D.lignes !== ly?.lignes || D.bpmLu !== p.bpm) {
      D.lignes = ly?.lignes;
      D.bpmLu = p.bpm;
      const L = ly?.etat === "actif" ? ly.lignes : null;
      D.tempo = p.bpm > 0 ? { bpm: p.bpm, phase: 0 } : L ? tempoLy(L.map((l) => l[0])) : null;
      D.nom = ambianceDe(p.bpm, L && debitLy(L));
      D.amb = null;
    }
    const cp = (p.pochette || "").length + (p.pochette || "").slice(-48);
    if (D.cp !== cp) {
      D.cp = cp;
      teintesPoch(p.pochette).then((tons) => {
        if (danse !== D || D.cp !== cp) return;
        D.tons = tons;
        D.amb = null;
        peindreSol(D, tons);
        const n = tons.sol.map((v) => v / Math.max(1, ...tons.sol)), vers = (base, f) => n.map((v) => base * (1 - f * (1 - v)));
        D.base = { amb: vers(0.78, 0.3), dif: vers(0.62, 0.4) };
        D.ciel.color.setRGB(...vers(1, 0.35));
        D.lumieres.forEach((u) => {
          u.u_light_ambient.value.setRGB(...D.base.amb);
          u.u_light_specular?.value.setRGB(...vers(0.55, 0.4));
        });
      });
    }
    if (!D.tons) return;
    if (!D.amb) D.amb = ambiance(D.nom, D.tons.vives, D.E, D.W);
    const bpm = D.tempo?.bpm || DANSE.bpm, joue = p.statut === "Playing", b = (posDe(p) - (D.tempo?.phase || 0)) * bpm / 60, s = t / 1e3;
    const cle = cleLy(p);
    if (D.cle !== cle) {
      D.cle = cle;
      D.grp = tirerGroupe(cle, D.mii.length);
      const vus = new Set(D.grp.roles.flatMap((r) => OBJETS[r]));
      for (const [n, o] of Object.entries(D.O)) o.visible = vus.has(n);
      D.grp.qui.forEach((j, place) => {
        const m = D.mii[j];
        m.place = place;
        m.role = D.grp.roles[place];
        m.objet.position.copy(D.places[place]);
        m.cap = m.capVise = DANSE.caps[place] * Math.PI / 180;
      });
    }
    const fete = D.nom === "fete", danse8 = DANSES[D.nom][(D.grp.danse + Math.floor(b / 8)) % DANSES[D.nom].length];
    D.mii.forEach((m) => {
      const nom = !joue ? "repos" : m.role === "chanteur" ? "chanter" : m.role === "danseur" ? danse8 : m.role;
      if (m.anim !== nom) m.jouer(nom, { fondu: 0.25, vitesse: nom === "repos" ? 1 : 0 });
      m.energie = fete ? 1 : 0.55;
      if (joue) m.t = b;
      const cap = DANSE.caps[m.place] * Math.PI / 180;
      if (nom === "tour") m.cap = m.capVise = cap + Math.PI * 2 * (b % 2) / 2;
      else m.capVise = cap + 6 * Math.sin(s * Math.PI * 0.65) * Math.PI / 180;
      m.maj(dt);
      D.tenir(m, m.role);
    });
    const lum = D.amb.lumiere(s, b), lin = lum.c.map((x) => (x / 255) ** 2.2), dif = D.base.dif.map((x, i) => x * 0.6 + lin[i] * 0.6 * lum.k);
    D.rims.forEach((c) => c.setRGB(...lum.rim));
    D.toile.style.setProperty("--halo", lum.halo);
    D.lumieres.forEach((u) => {
      u.u_light_diffuse?.value.setRGB(...dif);
      u.u_light_dir?.value.set(0.7 * lum.cote, 0.45, 0.75).normalize();
    });
    D.face.color.setRGB(...lin.map((x) => 0.35 + 0.65 * x));
    D.face.intensity = 1.8 * lum.k;
    D.face.position.set(4 * lum.cote, 3, 7);
    const g = D.sol.getContext("2d");
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, D.sol.width, D.sol.height);
    g.globalAlpha = 0.92;
    g.drawImage(D.fond, 0, 0);
    g.globalAlpha = 1;
    g.setTransform(D.k, 0, 0, D.k, 0, 0);
    D.amb.dessous(g, s, b);
    D.rendu.render(D.scene, D.cam);
    C?.noter(t, ips ? 1e3 / ips : 0, eu, performance.now() - t0);
  };
  let cadre = null;
  const contenu = () => [...d.querySelectorAll('[id^="quickaccess_content_"]')].find((c) => c.offsetWidth);
  const placerCadre = () => {
    const c = contenu(), b = e.$(".cadre-boite");
    if (!c || !cadre) return requestAnimationFrame(placerCadre);
    c.toggleAttribute("data-pcv-greffon-tiers", cadre.onglet === 999 && O.DeckyPluginLoader?.deckyState?._activePlugin?.name !== window.__pcvGreffon.nom);
    const r = b.getBoundingClientRect();
    h.style.setProperty("--pcv-cadre-l", "0px");
    h.style.setProperty("--pcv-cadre-w", "1000px");
    const k = c.getBoundingClientRect().width / 1e3 || 1, z = parseFloat(getComputedStyle(h).getPropertyValue("--pcv-cadre-z")) || 1;
    for (const [n, v, zz] of [["l", r.left, 1], ["t", r.top, 1], ["w", r.width, z], ["h", r.height, z]]) h.style.setProperty("--pcv-cadre-" + n, (v / k / zz).toFixed(1) + "px");
    entrer(c);
  };
  const ouvrirCadre = (onglet, titre, p) => {
    cadre = { onglet, titre };
    const s = e.$('[data-sous="cadre"]');
    s.querySelector(".titre-s > span:last-child").textContent = titre;
    s.querySelector(".titre-s .pastille").innerHTML = ico(p || "prise");
    B.openQuickAccessTab(onglet);
    ouvrirSous("cadre");
    h.dataset.pcvPeCadre = "";
    e.racine.classList.add("en-cadre");
    requestAnimationFrame(placerCadre);
  };
  const entrer = (c) => {
    const el = cadre.dernier?.isConnected ? cadre.dernier : [...c.querySelectorAll("button, [tabindex]")].find((x) => !x.closest("{{Title@QuickAccessMenu}}")) || c.querySelector("button");
    try {
      const n = principale().m_BrowserWindow.__pcvNoeud?.(el);
      if (n) n.BTakeFocus(4);
      else el?.focus();
    } catch (x) {
    }
  };
  const garder = (ev) => {
    const c = cadre && d.getElementById("quickaccess_content_" + cadre.onglet);
    if (!c) return;
    if (c.contains(ev.target)) cadre.dernier = ev.target;
    else entrer(c);
  };
  d.addEventListener("focusin", garder, true);
  const bord = () => {
    try {
      principale().m_BrowserWindow.__pcvSon?.("bord");
    } catch (x) {
    }
  };
  const ouvrirPlugin = (nom) => {
    O.__pcvRetourDecky = B.page();
    ouvrirDecky();
    O.DeckyPluginLoader.deckyState.setActivePlugin(nom);
    return ouvrirCadre(999, nom, "prise");
  };
  const ouvrirPluginDemande = () => {
    const nom = O.__pcvPluginAouvrir;
    if (!nom) return;
    delete O.__pcvPluginAouvrir;
    ouvrirPlugin(nom);
  };
  O.__pcvOuvrirPlugin = ouvrirPluginDemande;
  const fermerCadre = () => {
    if (!cadre) return false;
    cadre = null;
    delete h.dataset.pcvPeCadre;
    e.racine.classList.remove("en-cadre");
    d.querySelector("[data-pcv-greffon-tiers]")?.removeAttribute("data-pcv-greffon-tiers");
    for (const n of ["l", "t", "w", "h"]) h.style.removeProperty("--pcv-cadre-" + n);
    return true;
  };
  const quitterCadre = () => {
    const t = cadre?.titre;
    if (!fermerCadre()) return false;
    e.fermerVoile(e.$('[data-sous="cadre"]'));
    const g = [...e.racine.querySelectorAll('[data-sous="decky"] [data-a^="greffon:"]')].find((x) => x.dataset.a === "greffon:" + t);
    if (g && !g.closest("[hidden]")) e.poser(g);
    else e.premier();
    return true;
  };
  const suivreDecky = () => {
    if (cadre?.onglet === 999 && !O.DeckyPluginLoader?.deckyState?._activePlugin) quitterCadre();
  };
  O.DeckyPluginLoader?.deckyState?.eventBus?.addEventListener("update", suivreDecky);
  const sousOuvert = () => [...e.racine.querySelectorAll(".sousecran")].filter((s) => !s.hidden).pop()?.dataset.sous || null;
  const ouvrirSous = (cle) => {
    const s = e.$(`[data-sous="${cle}"]`);
    if (!s.hidden) return;
    peindreBascules();
    e.ouvrirVoile(s);
  };
  const peindreBascules = () => {
    for (const t of e.racine.querySelectorAll("[data-b]")) {
      const b = BASCULES[t.dataset.b];
      let on = false;
      try {
        on = !!b.lire();
      } catch (x) {
      }
      if (t.dataset.b === "wifi" && !t.classList.contains("grande-bascule")) {
        const n = B.network();
        t.querySelector(".pastille").innerHTML = ico(n.filaire ? "prise" : "wifi");
        t.querySelector("b").firstChild.textContent = n.filaire ? T("acces.filaire", "Filaire") : "Wi-Fi";
        t.dataset.a = n.filaire ? "reglages:wifi" : "bascule:wifi";
        if (n.filaire) on = n.connected;
      }
      t.classList.toggle("oui", on);
      if (!t.classList.contains("grande-bascule")) t.classList.toggle("verre", !on);
      const s = t.querySelector("small");
      if (s) try {
        s.textContent = t.dataset.b === "wifi" && B.network().filaire && !t.classList.contains("grande-bascule") ? T("acces.connecte_statut", "Connect\xE9") : b.petit(on);
      } catch (x) {
      }
    }
  };
  const peindreBatterie = () => {
    try {
      const p = B.battery(), presente = p?.present === true, carte = e.$(".batt");
      carte.hidden = !presente;
      e.racine.classList.toggle("sans-batterie", !presente);
      if (!presente) {
        const sous = e.$('[data-sous="batt"]'), selection = carte.contains(e.focus()) || !sous.hidden;
        sous.hidden = true;
        if (selection) e.premier();
        return;
      }
      const n = Math.round(Math.max(0, Math.min(1, p.percent)) * 100), { branche, s } = etatPile(p);
      const t = branche ? n >= 99 ? T("acces.branchee_terminee", "Branch\xE9e, charge termin\xE9e") : T("acces.branchee_en_charge", "Branch\xE9e, en charge") : s > 0 ? T("acces.sur_batterie_encore", "Sur batterie, encore {temps}", { temps: duree(s) }) : T("acces.sur_batterie", "Sur batterie");
      e.$(".batt .pct").textContent = e.$(".pct-g").textContent = n + " %";
      e.$(".batt .etat-b").textContent = e.$(".etat-g").textContent = t;
    } catch (x) {
    }
  };
  const peindreSortie = () => {
    const x = appareil(SORTIE), b = e.$(".sortie-bouton");
    if (!b) return;
    b.querySelector(".pastille").innerHTML = x ? ico(x.eConnectorType === 4 ? "casque" : x.eBus === 2 ? "bluetooth" : x.bSupportsHdmiCec ? "ecran" : "volume") : "";
    b.querySelector(".sortie-nom").textContent = x ? x.GetName() : "";
  };
  const peindreDecky = () => {
    e.$(".greffons-r").innerHTML = greffons().slice(0, 3).map((p) => `<span class="greffon" data-a="greffon:${esc(p.name)}">${esc(p.name)}</span>`).join("");
  };
  const peindrePerf = () => {
    try {
      e.$(".badge-tdp").textContent = "TDP " + CURSEURS.tdp.texte(CURSEURS.tdp.lire()).replace(T("acces.automatique", "automatique"), T("acces.auto_court", "auto"));
    } catch (x) {
    }
    for (const l of e.racine.querySelectorAll("[data-cycle]")) try {
      const c = CYCLES[l.dataset.cycle];
      l.querySelector("span").textContent = c.texte(c.lire());
    } catch (x) {
    }
  };
  const peindre = () => {
    for (const c of e.racine.querySelectorAll("[data-curseur]")) try {
      peindreCurseur(c, CURSEURS[c.dataset.curseur].lire());
    } catch (x) {
    }
    peindreBatterie();
    peindreBascules();
    peindreSortie();
    peindreDecky();
    peindrePerf();
    setTimeout(majBt, 400);
    suivreLecteurs(true);
  };
  let regle = null;
  const regler = (el) => {
    regle?.classList.remove("regle");
    regle = el;
    el?.classList.add("regle");
  };
  const fermer = () => B.closeMenus();
  let enAttente = null;
  const oublier = (id) => {
    const x = btEtat.liste.find((a) => String(a.id) === id);
    if (!x?.is_paired) return;
    const v = e.$(".voile.confirme");
    enAttente = () => {
      B.bluetooth.forget(x.id)?.then?.(majBt);
      setTimeout(majBt, 600);
    };
    v.querySelector(".grosse").innerHTML = ico("bluetooth");
    v.querySelector("h2").textContent = T("acces.bt_oublier_titre", "Oublier \xAB {nom} \xBB ?", { nom: x.nom });
    v.querySelector("p").textContent = T("acces.bt_oublier_texte", "Il faudra l'associer \xE0 nouveau pour s'en servir ici.");
    v.querySelector(".ok").innerHTML = pastille("bluetooth", "var(--pcv-rouge)") + esc(T("acces.bt_oublier", "Oublier"));
    e.ouvrirVoile(v);
  };
  const basculer = (cle, sur) => {
    const b = BASCULES[cle];
    if (!b.ecrire) return e.bulle(T("acces.npd_pas_branche", "Pas encore branch\xE9 : Steam n'a pas de \xAB Ne pas d\xE9ranger \xBB \xE0 lui."));
    let on = false;
    try {
      on = !!b.lire();
    } catch (x) {
    }
    const c = !sur && CONFIRMER[cle]?.(on);
    if (c) {
      const v = e.$(".voile.confirme");
      enAttente = cle;
      v.querySelector(".grosse").innerHTML = ico(c[0]);
      v.querySelector("h2").textContent = c[1];
      v.querySelector("p").textContent = c[2];
      v.querySelector(".ok").innerHTML = pastille(c[0], "var(--pcv-rouge)") + esc(c[3]);
      return e.ouvrirVoile(v);
    }
    try {
      b.ecrire(!on);
    } catch (x) {
    }
    setTimeout(peindreBascules, 400);
    setTimeout(majBt, 900);
    setTimeout(peindrePerf, 600);
  };
  const reglages = (k) => {
    if (k === "bt") return ouvrirBt(false);
    if (k === "wifi") return ouvrirWifi();
    if (k === "pochette") return e.$(".pa-grande")?.classList.toggle("vu");
    const page = { avion: "Internet", nuit: "Display" }[k];
    if (page) {
      B.navigate(page);
      fermer();
    }
  };
  const e = ecran({
    id: "pcv-ar",
    html,
    premier: ".curseur",
    retour: fermer,
    photo: true,
    agir: (k, v, el) => {
      if (k === "curseur") return e.auDoigt() ? void 0 : regler(regle === el ? null : el);
      if (k === "sous") return { batt: ouvrirBatt, perf: () => {
        peindrePerf();
        ouvrirSous("perf");
      }, decky: ouvrirDecky }[v]?.();
      if (k === "lect") {
        const [quoi, n] = v.split(":");
        if (quoi === "page") {
          ouvrirSous("musique");
          dernierRendu = "";
          peindreLecteur();
          const b = e.$(".paroles-star");
          if (b) e.poser(b);
          return;
        }
        if (quoi === "choisir") {
          cur = +n;
          return peindreLecteur();
        }
        if (quoi === "ouvrir") return ouvrirAppli(lect[+n]);
        if (quoi === "piste") return e.auDoigt() ? void 0 : regler(regle === el ? null : el);
        return commanderL(quoi, n);
      }
      if (k === "paroles") {
        if (v === "ouvrir") {
          chargerParoles(true);
          ouvrirSous("paroles");
          legOk(false);
          return peindreLecteur();
        }
        if (v === "param") {
          fermer();
          return setTimeout(() => {
            try {
              principale().m_BrowserWindow.__pcvSteamU?.ouvrir("confidentialite");
            } catch (x) {
            }
          }, 300);
        }
        return;
      }
      if (k === "reglages") return reglages(v);
      if (k === "cadre") {
        const [n, titre, p] = v.split(":");
        return ouvrirCadre(n, titre, p);
      }
      if (k === "bascule") return basculer(v);
      if (k === "liste") {
        const L = LISTES[v];
        if (!L) return;
        return liste(e, { cle: v, titre: L.titre, p: L.p, c: L.c, choix: L.choix(), lire: L.lire, ecrire: L.ecrire });
      }
      if (k === "liste-choix") return listeChoisir(e, v);
      if (k === "confirme") {
        const cle = enAttente;
        enAttente = null;
        e.fermerVoile(e.$(".voile.confirme"));
        e.premier();
        return typeof cle === "function" ? cle() : cle && basculer(cle, true);
      }
      if (k === "bt") return ouvrirBt(v === "recherche");
      if (k === "btoublier") return oublier(v);
      if (k === "btappareil") {
        const x = btEtat.liste.find((a) => String(a.id) === v);
        if (!x) return;
        (x.is_pairing ? B.bluetooth.cancelPair(x.id) : x.is_paired ? x.is_connected ? B.bluetooth.disconnect(x.id) : B.bluetooth.connect(x.id) : B.bluetooth.pair(x.id))?.then?.(majBt);
        return setTimeout(majBt, 300);
      }
      if (k === "wifi") {
        const a = reseau().accessPoints?.find((x) => x.key === v);
        if (!a) return;
        if (a.isConnected) return ouvrirWifid(a);
        B.navigate("Internet");
        return fermer();
      }
      if (k === "greffon") return ouvrirPlugin(v);
      if (k === "boutique" || k === "decky-reglages") {
        O.__pcvRetourDecky = B.page();
        try {
          O.DFL.Navigation.Navigate(k === "boutique" ? "/decky/store" : "/decky/settings");
        } catch (x) {
        }
        return fermer();
      }
      if (k === "clavier") {
        fermer();
        return setTimeout(() => {
          try {
            const V = principale().VirtualKeyboardManager;
            (V.SetVirtualKeyboardVisible || V.ShowVirtualKeyboard).call(V);
          } catch (x) {
          }
        }, 300);
      }
    },
    // ◀ ▶ : seulement dans un curseur en réglage (sinon elles passent aux voisins)
    pas: (el, sens) => {
      const c = CURSEURS[el.dataset.curseur];
      if (!c || regle !== el) return false;
      const p = typeof c.pas === "function" ? c.pas() : c.pas;
      poserCurseur(el, (c.lire() || 0) + sens * p);
      return true;
    },
    focus: (el) => {
      if (regle && regle !== el) regler(null);
      if (el?.dataset.y && sousOuvert() === "paroles") {
        e.$(".y-leg").classList.add("montre");
        e.$(".y-txt").textContent = el.dataset.yNom;
      }
    },
    // dernière rangée de la grille Wi-Fi/Bluetooth/Avion/Ne pas déranger/Mode nuit/Ajouter : ▼ descendait tout droit
    // sur « Tous les greffons », bien plus bas mais mieux aligné en X que le lecteur de musique entre les deux (le plus
    // proche voisin géométrique commun s'y trompe) — audit manette du 15/10, BLOQUANT n°3. ▲ depuis le lecteur revient
    // sur la tuile la plus proche en X, dans l'autre sens.
    voisin: (el, dx, dy) => {
      const a = el.dataset.a || "";
      if (dy < 0 && /^lect:(precedent|lecture|suivant):/.test(a)) {
        const b = el.closest(".lg-corps, .lg-h, .vc, .musique")?.querySelector('[data-a^="lect:piste:"]');
        if (b) return b;
      }
      if (dx && a.startsWith("lect:piste:") && regle === el) {
        const n = +a.split(":")[2], p = lect[n];
        if (!p?.chercher) return el;
        const t = performance.now(), suite = scrub && scrub.n === n && scrub.dx === dx && t - scrub.vu < 350;
        const rep = suite ? scrub.rep + 1 : 0, pasS = rep < 4 ? 1 : rep < 10 ? 3 : rep < 20 ? 10 : 30;
        const pos = Math.max(0, Math.min(p.duree || Infinity, (scrub?.n === n ? scrub.pos : posDe(p)) + dx * pasS));
        clearTimeout(scrub?.fin);
        scrub = { n, dx, rep, vu: t, pos, fin: setTimeout(() => {
          const s_ = scrub;
          scrub = null;
          if (!s_) return;
          const q = lect[s_.n];
          allerA(s_.n, s_.pos);
        }, 450) };
        el.querySelector(".barre-l")?.style.setProperty("--p", p.duree > 0 ? (100 * pos / p.duree).toFixed(2) + "%" : "0%");
        const lp = el.querySelector(".lect-pos");
        if (lp) lp.textContent = tps(pos);
        return el;
      }
      if (dy < 0 && el.matches(".lien-bandes")) return e.$(".musique .paroles-star") || void 0;
      if (!sousOuvert() && dy > 0 && /^bascule:(npd|nuit)$/.test(a)) return d.querySelector('#pcv-ar [data-a="lect:page"]') || null;
      if (dy < 0 && a === "sous:decky") return d.querySelector('#pcv-ar [data-a="lect:page"]') || null;
      if (dy < 0 && a === "lect:page") {
        const r = el.getBoundingClientRect(), cx = r.left + r.width / 2;
        return [...d.querySelectorAll("#pcv-ar .bascules .bascule")].slice(3).sort((x, y) => Math.abs(x.getBoundingClientRect().left + x.getBoundingClientRect().width / 2 - cx) - Math.abs(y.getBoundingClientRect().left + y.getBoundingClientRect().width / 2 - cx))[0] || null;
      }
      return void 0;
    },
    // B : sort d'abord du réglage d'un curseur, puis du cadre (rend la fenêtre de Steam à sa place), puis du sous-menu
    avantRetour: () => {
      if (regle) {
        regler(null);
        return true;
      }
      const pg = e.$(".pa-grande.vu");
      if (pg) {
        pg.classList.remove("vu");
        return true;
      }
      if (sousOuvert() === "paroles") {
        e.fermerVoile(e.$('[data-sous="paroles"]'));
        legOk(true);
        clearTimeout(lyMinuteur);
        dernierRendu = "";
        peindreLecteur();
        const b = e.$(".paroles-star");
        if (b) e.poser(b);
        else e.premier();
        return true;
      }
      return quitterCadre();
    },
    // dans le cadre, les touches vont au contenu de Steam (sa navigation), sauf B et ses changements d'onglet (LB RB LT RT :
    // touche() ci-dessous, le son du bord ; un greffon est un seul panneau, B ramène à la liste)
    laisser: (b) => !!cadre && b !== 2 && !(b >= 5 && b <= 8),
    y: (el) => el.dataset.y.startsWith("oublier:") ? oublier(el.dataset.y.slice(8)) : reglages(el.dataset.y),
    // LB / RB : un lecteur à l'autre ; X : lecture / pause du lecteur montré
    // (15/10 soir, l'auteur) LB / RB : morceau précédent / suivant (le lecteur revient au début du morceau s'il joue
    // depuis un moment, comme tout lecteur MPRIS) ; LT / RT : changer de lecteur, moins utile
    touche: (b) => {
      if (cadre) return b >= 5 && b <= 8 && bord();
      if (sousOuvert() !== "musique") return;
      if ((b === 5 || b === 6) && lect[cur]) return commanderL(b === 5 ? "precedent" : "suivant", cur);
      if (b === 7) return changerLecteur(-1);
      if (b === 8) return changerLecteur(1);
      if (b === 3 && lect[cur]) return commanderL("lecture", cur);
    },
    differer: () => true,
    // (lot 17 : préparé à la fermeture, repeint juste après la première image, menus-commun.js)
    // (29/10) le plugin demandé par l'eShop (« Ses réglages ») s'ouvre ICI, à l'ouverture du menu : demandé avant, son
    // cadre était aussitôt refermé par fermerCadre() et l'on ne voyait que les réglages rapides ; ouvert après le tour
    // d'ouverture de menus-commun.js, qui referme ensuite tous les voiles (le cadre en est un)
    ouvrir: () => {
      fermerCadre();
      regler(null);
      peindre();
      queueMicrotask(ouvrirPluginDemande);
    },
    minute: peindre,
    batterie: peindreBatterie,
    fermer: () => {
      fermerCadre();
      regler(null);
      suivreLecteurs(false);
    }
  });
  e.racine.addEventListener("pointerdown", () => {
    appui = true;
  }, true);
  e.racine.addEventListener("pointerup", () => {
    appui = false;
  }, true);
  e.racine.addEventListener("pointercancel", () => {
    appui = false;
  }, true);
  e.racine.addEventListener("pointerdown", (ev) => {
    const c = ev.target.closest("[data-curseur]"), p = c?.querySelector(".piste");
    if (!p) return;
    const differe = c.dataset.curseur === "tdp", x0 = ev.clientX, y0 = ev.clientY, surPiste = !!ev.target.closest(".piste");
    let v = 0, ecrit = 0, attente = 0, pris = false;
    const ecrire = () => {
      clearTimeout(attente);
      attente = 0;
      ecrit = performance.now();
      poserCurseur(c, v);
    };
    const suivre = (x) => {
      const r = p.getBoundingClientRect();
      v = Math.max(0, Math.min(1, (e.versScene(x).x - r.left) / r.width));
      peindreCurseur(c, v);
      if (differe || attente) return;
      const reste = 60 - (performance.now() - ecrit);
      if (reste <= 0) ecrire();
      else attente = setTimeout(ecrire, reste);
    };
    const finir = (ok) => {
      c.onpointermove = c.onpointerup = c.onpointercancel = null;
      clearTimeout(attente);
      attente = 0;
      if (ok) poserCurseur(c, v);
      else if (differe) peindreCurseur(c, CURSEURS.tdp.lire());
    };
    const prendre = () => {
      pris = true;
      e.poser(c);
      c.classList.remove("f");
      try {
        c.setPointerCapture(ev.pointerId);
      } catch (x) {
      }
    };
    c.onpointermove = (m) => {
      if (!pris) {
        const dx = Math.abs(m.clientX - x0), dy = Math.abs(m.clientY - y0);
        if (Math.hypot(dx, dy) < 12) return;
        if (dy > dx) return finir(false);
        prendre();
      }
      suivre(m);
    };
    c.onpointerup = (u) => {
      if (!pris && surPiste) {
        prendre();
        suivre(u);
      }
      finir(pris);
    };
    c.onpointercancel = () => finir(false);
  });
  const cibleLy = (g, y) => Math.max(0, Math.min(ly.lignes.length - 1, Math.round(g.foyer - (y - g.y) / LY_H)));
  e.racine.addEventListener("pointerdown", (ev) => {
    const z = ev.target.closest(".ly-zone");
    if (!z || ly?.etat !== "actif") return;
    lyGlisse = { y: e.versScene(ev).y, foyer: Math.max(0, ly.foyer), bouge: false, cible: -1 };
    try {
      z.setPointerCapture(ev.pointerId);
    } catch (x) {
    }
  });
  e.racine.addEventListener("pointermove", (ev) => {
    const g = lyGlisse;
    if (!g) return;
    const y = e.versScene(ev).y;
    if (!g.bouge && Math.abs(y - g.y) < 12) return;
    g.bouge = true;
    const c = cibleLy(g, y);
    if (c === g.cible) return;
    g.cible = c;
    placerLy(c);
    e.racine.querySelectorAll(".lyl.vise").forEach((x) => x.classList.remove("vise"));
    e.racine.querySelector(`.lyl[data-i="${c}"]`)?.classList.add("vise");
    const m = e.$(".ly-marqueur");
    m.textContent = ly.lignes[c][1] ? tps(ly.lignes[c][0]) : T("paroles.intermede", "interm\xE8de");
    m.classList.add("vu");
  });
  const lacherLy = (ok) => {
    const g = lyGlisse;
    if (!g) return;
    lyGlisse = null;
    e.$(".ly-marqueur")?.classList.remove("vu");
    e.racine.querySelectorAll(".lyl.vise").forEach((x) => x.classList.remove("vise"));
    if (g.bouge) lyLache = performance.now();
    if (ok && g.bouge) allerA(cur, ly.lignes[g.cible][0]);
    ly.foyer = -1;
  };
  e.racine.addEventListener("pointerup", () => lacherLy(true));
  e.racine.addEventListener("pointercancel", () => lacherLy(false));
  e.racine.addEventListener("click", (ev) => {
    const l = ev.target.closest(".lyl");
    if (l && ly?.etat === "actif" && performance.now() - lyLache > 300) {
      allerA(cur, ly.lignes[+l.dataset.i][0]);
      ly.foyer = -1;
    }
  });
  e.demarrer();
  ouvrirPluginDemande();
  window.__pcvArFin = () => {
    if (O.__pcvOuvrirPlugin === ouvrirPluginDemande) delete O.__pcvOuvrirPlugin;
    fermerCadre();
    d.removeEventListener("focusin", garder, true);
    O.DeckyPluginLoader?.deckyState?.eventBus?.removeEventListener("update", suivreDecky);
    e.fin();
    clearInterval(suiviBt);
    clearInterval(suiviWifi);
    B?.bluetooth?.setDiscovering(false);
    danse?.mii.forEach((m) => m.liberer());
    danse?.rendu?.dispose();
    danse?.rendu?.forceContextLoss();
    danse = null;
  };
})();
