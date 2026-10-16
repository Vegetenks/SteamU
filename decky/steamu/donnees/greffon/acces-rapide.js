(() => {
  window.__pcvArFin?.();
  const { O, principale, esc, module, magasin, ico, pastille, pile, etat, bouton, liste, listeChoisir, ecran } = window.__pcvPE;
  const menus = () => principale().MenuStore, d = document, h = d.documentElement;
  const T = (k, f, vars) => {
    try {
      return principale().m_BrowserWindow.__pcvT?.(k, vars) ?? f;
    } catch (x) {
      return f;
    }
  };
  const LOCALE = () => {
    try {
      return principale().m_BrowserWindow.__pcvLocale?.() || "fr-FR";
    } catch (x) {
      return "fr-FR";
    }
  };
  const audio = () => module("audio", "m_mapAudioDevices", (v) => typeof v?.m_mapAudioDevices?.get === "function");
  const bt = () => module("bt", "SetDiscovering", (v) => typeof v?.SetDiscovering === "function" && typeof v?.Pair === "function" && typeof v?.GetDeviceDetails === "function");
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
      const a = O.SteamUIStore.MainRunningApp;
      return a && (O.appStore.GetAppOverviewByAppID(a.appid) || a);
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
      ecrire: (id) => {
        audio()?.m_mapAudioDevices.get(+id)?.setAsDefaultDevice(0);
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
  const pointWifi = () => reseau().accessPoints?.find((a) => a.isConnected);
  const BASCULES = {
    wifi: { lire: () => reseau().isWifiEnabled, ecrire: (v) => reseau().SetWifiEnabled(v), petit: (on) => on ? pointWifi()?.displayName || T("acces.aucun_reseau", "aucun r\xE9seau") : T("acces.desactive", "d\xE9sactiv\xE9") },
    bt: {
      lire: () => !!client().system_bluetooth_enabled,
      ecrire: (v) => reglage("system_bluetooth_enabled", v),
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
  const html = `<div class="pilule verre titre-r entre" style="--d:.1s">${pastille("reglages", "var(--c-accueil)")}${T("acces.titre", "R\xE9glages rapides")}</div>${etat(true)}
    <div class="carte verre batt entre" data-a="sous:batt">${pile("grosse")}<div><div class="pct"></div><div class="etat-b"></div></div></div>
    ${curseur("lum", "carte verre curseur gliss-card entre", `${pastille("soleil", "var(--c-soleil)")}${T("acces.luminosite", "Luminosit\xE9")}`, void 0, ' style="top:344px;--d:.04s"')}
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
    <div class="voile confirme" hidden><div class="fenetre verre"><span class="pastille grosse"></span><h2></h2><p></p>
      <div class="choix"><div class="bouton verre ok" data-a="confirme"></div>${bouton("retour", "premier", 0, "var(--c-accueil)", "fleche", T("acces.annuler", "Annuler"))}</div></div></div>`;
  const ICO_BT = { 4: "casque", 10: "manette", 11: "clavier" };
  const noms = /* @__PURE__ */ new Map();
  const majBt = async () => {
    const S = bt();
    if (!S) return;
    try {
      const o = (await S.GetState({})).Body().toObject();
      btEtat.on = !!o.is_enabled;
      btEtat.cherche = !!o.is_discovering;
      await Promise.all((o.devices || []).filter((x) => !noms.get(x.id)).map((x) => S.GetDeviceDetails({ id: x.id }).then((r) => noms.set(x.id, r.Body().toObject().device?.name || "")).catch(() => {
      })));
      btEtat.liste = (o.devices || []).map((x) => ({ ...x, nom: noms.get(x.id) })).filter((x) => x.nom && (x.is_paired || !x.should_hide_hint));
      btEtat.co = btEtat.liste.filter((x) => x.is_connected).length;
    } catch (x) {
    }
    peindreBascules();
    peindreListeBt();
  };
  let appui = false;
  const peindreListeBt = () => {
    if (appui) return;
    const l = e.$(".liste-bt"), f = e.focus()?.dataset.a;
    const elt = (x) => `<div class="elt${x.is_connected ? " connecte" : ""}" data-a="btappareil:${esc(x.id)}">${pastille(ICO_BT[x.etype] || "bluetooth")}${esc(x.nom)}<span class="etat-elt">${x.is_pairing || x.operation_in_progress ? '<span class="tourne"></span>' : x.is_connected ? T("acces.connecte_statut", "Connect\xE9") : x.is_paired ? T("acces.associe", "Associ\xE9") : T("acces.appuie_appairer", "Appuie pour appairer")}</span></div>`;
    const assoc = btEtat.liste.filter((x) => x.is_paired), trouves = btEtat.liste.filter((x) => !x.is_paired);
    l.innerHTML = !btEtat.on ? `<h3>${T("acces.appareils", "Appareils")}</h3><div class="vide">${T("acces.bt_desactive_texte", "Le Bluetooth est d\xE9sactiv\xE9.")}</div>` : `<h3>${T("acces.appareils_associes", "Appareils associ\xE9s")}</h3>${assoc.map(elt).join("") || `<div class="vide">${T("acces.aucun_point", "Aucun.")}</div>`}<h3>${T("acces.appareils_trouves", "Appareils trouv\xE9s")} ${btEtat.cherche ? '<span class="tourne"></span>' : ""}</h3>${trouves.map(elt).join("") || `<div class="vide">${btEtat.cherche ? T("acces.recherche_en_cours", "Recherche en cours\u2026") : T("acces.lance_rechercher", "Lance \xAB Rechercher \xBB.")}</div>`}`;
    e.$(".b-recherche").textContent = btEtat.cherche ? T("acces.recherche_court", "Recherche\u2026") : T("acces.rechercher", "Rechercher");
    if (f?.startsWith("btappareil:")) e.poser(l.querySelector(`[data-a="${f}"]`) || e.$('[data-sous="bt"] .premier'));
  };
  let suiviBt = 0;
  const ouvrirBt = (chercher) => {
    ouvrirSous("bt");
    majBt();
    if (chercher) {
      if (!BASCULES.bt.lire()) basculer("bt");
      bt()?.SetDiscovering({ enabled: true });
    }
    clearInterval(suiviBt);
    suiviBt = setInterval(() => {
      if (sousOuvert() !== "bt") {
        clearInterval(suiviBt);
        bt()?.SetDiscovering({ enabled: false });
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
    const pts = (reseau().accessPoints || []).filter((a) => a.type === 2 && !a.m_NoLongerPresent).sort((a, b) => b.isConnected - a.isConnected || (infoWifi(b).strength_raw || 0) - (infoWifi(a).strength_raw || 0));
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
    branche: p.m_eACState === 2 || p.m_flBatteryLevel >= 0.99 && p.m_eBatteryState === 3,
    s: p.m_eBatteryTimeConfidence === 1 && p.m_nBatterySecondsRemaining > 0 && p.m_nBatterySecondsRemaining < 20 * 3600 ? p.m_nBatterySecondsRemaining : 0
  });
  const ouvrirBatt = async () => {
    ouvrirSous("batt");
    peindreBatterie();
    const p = magasin("SystemPowerStore"), { branche, s } = etatPile(p);
    let b = {};
    try {
      b = await O.DeckyBackend.call("loader/call_plugin_method", window.__pcvGreffon.nom, "batterie") || {};
    } catch (x) {
    }
    const lignes = [
      [branche ? T("acces.branchee", "Branch\xE9e") : T("acces.sur_batterie_reste", "Sur batterie, il te reste"), branche ? Math.round(p.m_flBatteryLevel * 100) >= 99 ? T("acces.charge_terminee", "charge termin\xE9e") : T("acces.en_charge", "en charge") : s > 0 && T("acces.temps_restant", "environ {temps}", { temps: duree(s) })],
      [T("acces.consommation", "La console consomme"), b.watts != null && b.watts.toLocaleString(LOCALE()) + " W"],
      [T("acces.sante_batterie", "Sant\xE9 de la batterie"), b.sante != null && `${b.sante >= 90 ? T("acces.sante_tresbonne", "tr\xE8s bonne") : b.sante >= 80 ? T("acces.sante_bonne", "bonne") : T("acces.sante_fatiguee", "fatigu\xE9e")} (${b.sante} %)`, b.sante >= 80 ? "vert" : ""],
      [T("acces.cycles_charge", "Cycles de charge"), b.cycles != null && String(b.cycles)]
    ].filter(([, v]) => v);
    if (sousOuvert() === "batt") e.$(".details-batt").innerHTML = lignes.map(([k, v, c]) => `<div class="ligne fixe">${k}<span class="${c || "noir"}">${esc(v)}</span></div>`).join("");
  };
  const greffons = () => {
    try {
      const s = O.DeckyPluginLoader.deckyState, caches = new Set(s._hiddenPlugins || []);
      const ordre = s._pluginOrder?.length ? s._pluginOrder : s._plugins.map((p) => p.name), par = new Map(s._plugins.map((p) => [p.name, p]));
      return ordre.filter((n) => par.has(n) && !caches.has(n)).map((n) => par.get(n));
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
  const appel = (m, ...a) => O.DeckyBackend?.call("loader/call_plugin_method", window.__pcvGreffon.nom, m, ...a) ?? Promise.reject();
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
    const pas = () => {
      if (e.racine.hidden) return;
      const p = lect[cur];
      if (p?.statut === "Playing" && !scrub) e.racine.querySelectorAll(".prog .barre-l").forEach((b) => b.style.setProperty("--p", pctDe(p)));
      if (ly?.etat === "actif" && !e.$('[data-sous="paroles"]').hidden) suivreParoles();
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
    try {
      const id = String(p.jeu);
      O.SteamClient.Apps.RaiseWindowForGame?.(id) ?? O.SteamClient.Apps.NavigateToRunningApp?.(id);
    } catch (x) {
    }
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
      ly.mots = lignes.map((l, i) => l[1] ? motsLy(lignes, i, p.duree) : null);
      const vu = !ouverture && ly.entre ? " vu" : "";
      z.innerHTML = fond + `<div class="pa-poch${vu ? " petit" : ""}" data-poch>${poch(p)}</div><div class="pa-mini${vu}"><h2 class="titre-m">${esc(p.titre || p.app)}</h2><div class="artiste">${art}</div></div><div class="ly-zone premier${vu}" data-y="pochette" data-y-nom="${T("paroles.pochette", "Pochette")}"><div class="ly-lista">` + lignes.map(([, x], i) => `<div class="lyl${x ? "" : " instru"}" data-i="${i}"><span class="lyl-in">${x ? ly.mots[i].map(([, , w]) => `<span class="m" data-m="${esc(w)}">${esc(w)}</span>`).join("") : PTS}</span></div>`).join("") + `</div><div class="ly-marqueur"></div></div><div class="pa-grande"><span data-poch>${poch(p)}</span><h2 class="titre-m">${esc(p.titre || p.app)}</h2><div class="artiste">${art}${p.album ? ", " + esc(p.album) : ""}</div></div>`;
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
          e.$(".ly-lista")?.classList.add("entre");
          e.$(".ly-zone")?.classList.add("vu");
        }, ouverture ? 520 : 0);
      } else e.$(".ly-lista").classList.add("entre");
    }
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
  const motsLy = (L, i, duree2) => {
    const [t, x, M] = L[i], suiv = L[i + 1]?.[0] ?? (duree2 || t + 8);
    if (M) return M.flatMap(([a, w], k) => w ? [[a, M[k + 1]?.[0] ?? Math.min(suiv, a + 2), w]] : []);
    const n = x.length || 1, D = Math.min(suiv - t, 0.6 + 0.09 * n);
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
  let cadre = null, gardeCadre = 0;
  const contenu = () => [...d.querySelectorAll('[id^="quickaccess_content_"]')].find((c) => c.offsetWidth);
  const placerCadre = () => {
    const c = contenu(), b = e.$(".cadre-boite");
    if (!c || !cadre) return requestAnimationFrame(placerCadre);
    const r = b.getBoundingClientRect();
    h.style.setProperty("--pcv-cadre-l", "0px");
    h.style.setProperty("--pcv-cadre-w", "1000px");
    const k = c.getBoundingClientRect().width / 1e3 || 1, z = parseFloat(getComputedStyle(h).getPropertyValue("--pcv-cadre-z")) || 1;
    for (const [n, v, zz] of [["l", r.left, 1], ["t", r.top, 1], ["w", r.width, z], ["h", r.height, z]]) h.style.setProperty("--pcv-cadre-" + n, (v / k / zz).toFixed(1) + "px");
    try {
      c.querySelector(".Focusable, button, [tabindex]")?.focus();
    } catch (x) {
    }
  };
  const ouvrirCadre = (onglet, titre, p) => {
    cadre = { onglet };
    const s = e.$('[data-sous="cadre"]');
    s.querySelector(".titre-s > span:last-child").textContent = titre;
    s.querySelector(".titre-s .pastille").innerHTML = ico(p || "prise");
    try {
      menus().OpenQuickAccessMenu(+onglet);
    } catch (x) {
    }
    ouvrirSous("cadre");
    h.dataset.pcvPeCadre = "";
    e.racine.classList.add("en-cadre");
    requestAnimationFrame(placerCadre);
    clearInterval(gardeCadre);
    gardeCadre = setInterval(() => {
      if (!cadre) return clearInterval(gardeCadre);
      const g = d.querySelector(".gpfocus"), c = contenu();
      if (g && c && !c.contains(g)) try {
        c.querySelector(".Focusable, button, [tabindex]")?.focus();
      } catch (x) {
      }
    }, 200);
  };
  const fermerCadre = () => {
    if (!cadre) return false;
    cadre = null;
    clearInterval(gardeCadre);
    delete h.dataset.pcvPeCadre;
    e.racine.classList.remove("en-cadre");
    for (const n of ["l", "t", "w", "h"]) h.style.removeProperty("--pcv-cadre-" + n);
    return true;
  };
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
      t.classList.toggle("oui", on);
      if (!t.classList.contains("grande-bascule")) t.classList.toggle("verre", !on);
      const s = t.querySelector("small");
      if (s) try {
        s.textContent = b.petit(on);
      } catch (x) {
      }
    }
  };
  const peindreBatterie = () => {
    try {
      const p = magasin("SystemPowerStore"), n = Math.round(Math.max(0, Math.min(1, p.m_flBatteryLevel)) * 100), { branche, s } = etatPile(p);
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
  const fermer = () => {
    try {
      menus().CloseSideMenus();
    } catch (x) {
    }
  };
  let enAttente = null;
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
      try {
        principale().m_Navigator.Settings(page);
      } catch (x) {
      }
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
          return peindreLecteur();
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
        e.$(".voile.confirme").hidden = true;
        e.premier();
        return cle && basculer(cle, true);
      }
      if (k === "bt") return ouvrirBt(v === "recherche");
      if (k === "btappareil") {
        const x = btEtat.liste.find((a) => String(a.id) === v), S = bt();
        if (!x || !S) return;
        (x.is_paired ? x.is_connected ? S.Disconnect({ id: x.id }) : S.Connect({ id: x.id }) : S.Pair({ id: x.id }))?.then?.(majBt);
        return setTimeout(majBt, 300);
      }
      if (k === "wifi") {
        const a = reseau().accessPoints?.find((x) => x.key === v);
        if (!a) return;
        if (a.isConnected) return ouvrirWifid(a);
        try {
          principale().m_Navigator.Settings("Internet");
        } catch (x) {
        }
        return fermer();
      }
      if (k === "greffon") {
        try {
          O.DeckyPluginLoader.deckyState.setActivePlugin(v);
        } catch (x) {
        }
        return ouvrirCadre(999, v, "prise");
      }
      if (k === "boutique") {
        try {
          O.DFL.Navigation.Navigate("/decky/store");
        } catch (x) {
        }
        return fermer();
      }
      if (k === "decky-reglages") {
        try {
          O.DFL.Navigation.Navigate("/decky/settings");
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
      if (dy > 0 && /^bascule:(npd|nuit)$|^bt:recherche$/.test(a)) return d.querySelector('#pcv-ar [data-a="lect:page"]') || null;
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
        e.$('[data-sous="paroles"]').hidden = true;
        legOk(true);
        clearTimeout(lyMinuteur);
        dernierRendu = "";
        peindreLecteur();
        const b = e.$(".paroles-star");
        if (b) e.poser(b);
        else e.premier();
        return true;
      }
      if (fermerCadre()) {
        e.$('[data-sous="cadre"]').hidden = true;
        e.premier();
        return true;
      }
      return false;
    },
    // dans le cadre, les touches vont au contenu de Steam (sa navigation), sauf B
    laisser: (b) => !!cadre && b !== 2,
    y: (el) => reglages(el.dataset.y),
    // LB / RB : un lecteur à l'autre ; X : lecture / pause du lecteur montré
    // (15/10 soir, l'auteur) LB / RB : morceau précédent / suivant (le lecteur revient au début du morceau s'il joue
    // depuis un moment, comme tout lecteur MPRIS) ; LT / RT : changer de lecteur, moins utile
    touche: (b) => {
      if ((b === 5 || b === 6) && lect[cur]) return commanderL(b === 5 ? "precedent" : "suivant", cur);
      if (b === 7) return changerLecteur(-1);
      if (b === 8) return changerLecteur(1);
      if (b === 3 && lect[cur]) return commanderL("lecture", cur);
    },
    ouvrir: () => {
      fermerCadre();
      regler(null);
      peindre();
    },
    minute: peindre,
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
    const p = ev.target.closest(".piste"), c = p?.closest("[data-curseur]");
    if (!c) return;
    const differe = c.dataset.curseur === "tdp";
    let v = 0, ecrit = 0, attente = 0;
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
      p.onpointermove = p.onpointerup = p.onpointercancel = null;
      clearTimeout(attente);
      attente = 0;
      if (ok) poserCurseur(c, v);
      else if (differe) peindreCurseur(c, CURSEURS.tdp.lire());
    };
    e.poser(c);
    c.classList.remove("f");
    try {
      p.setPointerCapture(ev.pointerId);
    } catch (x) {
    }
    suivre(ev);
    p.onpointermove = suivre;
    p.onpointerup = () => finir(true);
    p.onpointercancel = () => finir(false);
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
  window.__pcvArFin = () => {
    fermerCadre();
    e.fin();
    clearInterval(suiviBt);
    clearInterval(suiviWifi);
    try {
      bt()?.SetDiscovering({ enabled: false });
    } catch (x) {
    }
  };
})();
