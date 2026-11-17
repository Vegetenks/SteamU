(() => {
  try {
    window.__pcvArFin?.();
  } catch (e2) {
  }
  const { O, principale, esc, module, magasin, ico, pastille, pile, etat, bouton, liste, listeChoisir, ecran, voisin } = window.__pcvPE;
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
  const directionAudio = (sens) => module("audioDirection", "AllOutput", (v) => typeof v?.Input === "number" && typeof v?.Output === "number")?.[sens === ENTREE ? "Input" : "Output"];
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
  const TDP_MIN = 5;
  let tdp = { min: TDP_MIN, max: 35 };
  steamos()?.GetState({}).then((r) => {
    const s = r.Body().toObject().state;
    if (s?.tdp_limit_max) tdp = { min: Math.max(TDP_MIN, s.tdp_limit_min || TDP_MIN), max: s.tdp_limit_max };
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
        if (v >= 1) return window.__pcvModes.tdp(void 0, false);
        window.__pcvModes.tdp(w, true);
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
    const cle = el.dataset.curseur, c = CURSEURS[cle];
    v = Math.max(0, Math.min(1, v));
    try {
      c.ecrire(v);
    } catch (x) {
    }
    e.racine.querySelectorAll(`[data-curseur="${cle}"]`).forEach((x) => peindreCurseur(x, v));
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
  const listeAudio = (sens, titre, p) => ({
    titre,
    p,
    c: "var(--pcv-accent)",
    choix: () => {
      const a = audio(), direction = directionAudio(sens);
      const appareils = a?.getDevices && direction !== void 0 ? a.getDevices(direction) : [...a?.m_mapAudioDevices.values() || []].filter((x) => sens === ENTREE ? x.bHasInput : x.bHasOutput);
      return [{ valeur: -1, texte: T("acces.automatique", "automatique") }, ...appareils.map((x) => ({ valeur: x.id, texte: x.GetName(direction) }))];
    },
    lire: () => (sens === ENTREE ? audio()?.m_overrideInputDeviceId : audio()?.m_overrideOutputDeviceId) ?? -1,
    ecrire: (id) => {
      const a = audio(), direction = directionAudio(sens), x = a?.m_mapAudioDevices.get(+id);
      if (direction === void 0 || +id !== -1 && !x) return e.bulle(T("acces.audio_indisponible", "Cet appareil audio n'est plus disponible."));
      if (+id === -1) a.ClearDefaultDeviceOverride(direction);
      else x.setAsDefaultDevice(direction);
      setTimeout(() => {
        a.UpdateDefaultDevices();
        setTimeout(peindreSortie, 400);
      }, 400);
    }
  });
  const LISTES = {
    sortie: listeAudio(SORTIE, T("acces.sortie_titre", "Sortie audio"), "volume"),
    entree: listeAudio(ENTREE, T("acces.entree_titre", "Entr\xE9e audio"), "micro"),
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
    // Modes locaux SteamU : la même bascule et le même stockage dans chaque fenêtre.
    economie: {
      lire: () => !!window.__pcvModes.lire().economie,
      ecrire: (v) => window.__pcvModes.economie(v),
      indispo: () => !!window.__pcvBridge.battery()?.charging,
      petit: (on) => on ? T("acces.active", "activ\xE9") : window.__pcvBridge.battery()?.charging ? T("acces.en_charge", "en charge") : T("acces.desactive", "d\xE9sactiv\xE9")
    },
    npd: { lire: () => !!window.__pcvModes.lire().npd, ecrire: (v) => window.__pcvModes.npd(v), petit: (on) => on ? T("acces.active", "activ\xE9") : T("acces.desactive", "d\xE9sactiv\xE9") },
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
  const outil = (a, p, c, nom, sous) => `<div class="outil"><div class="pilule verre" data-a="${a}">${pastille(p, c)}<b>${nom}<small>${sous}</small></b></div></div>`;
  const sousEcran = (cle, titre, p, c, corps, cl = "", avant = "") => `<div class="voile sousecran ${cl}" data-sous="${cle}" hidden><div class="entete"><div class="pilule verre titre-s">${pastille(p, c)}<span>${titre}</span></div></div>${avant}<div class="panneau verre">${corps}</div></div>`;
  const grandeBascule = (cle, p, nom, premier = true) => `<div class="grande-bascule verre${premier ? " premier" : ""}" data-a="bascule:${cle}" data-b="${cle}">${pastille(p)}${nom}<span class="inter"></span></div>`;
  const html = `<div class="pilule verre titre-r entre" style="--d:.1s">${pastille("reglages", "var(--c-accueil)")}${T("acces.titre", "R\xE9glages rapides")}</div>${etat()}
    <div class="carte verre batt entre" data-a="sous:batt" hidden>${pile("grosse")}<div><div class="pct"></div><div class="etat-b"></div></div></div>
    ${curseur("tdp", "carte verre curseur gliss-card entre", `${pastille("perf", "var(--c-perf)")}${T("acces.puissance", "Puissance")}<span class="coin-panneau">\u203A</span>`, void 0, ' data-panneau-lien="perf" style="--d:.04s"')}
    ${curseur("lum", "carte verre curseur gliss-card entre", `${pastille("soleil", "var(--c-soleil)")}${T("acces.luminosite", "Luminosit\xE9")}`, void 0, ' style="--d:.08s"')}
    ${curseur("vol", "carte verre curseur gliss-card entre", `${pastille("volume", "var(--c-accueil)")}${T("acces.volume", "Volume")}<span class="coin-panneau">\u203A</span>`, void 0, ' data-panneau-lien="son" style="--d:.12s"')}
    <div class="bascules">${bascule("wifi", 0.06, "wifi", "", "Wi-Fi", "wifi")}${bascule("bt", 0.09, "bluetooth", "", "Bluetooth", "bt")}${bascule("avion", 0.12, "avion", "var(--c-boutique)", T("acces.mode_avion", "Mode avion"), "avion")}
      ${bascule("npd", 0.15, "silence", "var(--c-notif)", T("acces.ne_pas_deranger", "Ne pas d\xE9ranger"), "")}${bascule("economie", 0.18, "feuille", "var(--pcv-vert)", T("acces.economie", "\xC9conomie d\u2019\xE9nergie"), "eco")}${bascule("nuit", 0.21, "lune", "var(--c-medias)", T("acces.mode_nuit", "Mode nuit"), "nuit")}
      </div>
    <div class="carte verre lecteur-slot entre" style="--d:.24s"></div>
    <div class="outils entre" style="--d:.27s">${outil("clavier", "clavier", "var(--c-param)", T("acces.clavier", "Clavier"), T("acces.clavier_aide", "\xE0 l'\xE9cran"))}</div>
    <div class="carte verre decky entre" style="--d:.3s"><h2>${pastille("prise", "var(--c-decky)")}Decky</h2><div class="greffons-r"></div><div class="mini bleu tous" data-a="sous:decky">${T("acces.tous_greffons", "Tous les greffons \u203A")}</div></div>
    ${sousEcran("bt", "Bluetooth", "bluetooth", "var(--c-accueil)", `<div class="gauche">${grandeBascule("bt", "bluetooth", "Bluetooth")}
        <div class="bouton verre" style="height:110px" data-a="bt:recherche">${pastille("plus", "var(--c-biblio)")}<span class="b-recherche">${T("acces.rechercher", "Rechercher")}</span></div>
        <div class="note">${T("acces.bt_note", "Mets ton appareil en mode appairage, puis lance la recherche. Choisis un appareil associ\xE9 pour le connecter ou le d\xE9connecter.")}</div></div>
      <div class="droite defile liste-bt"></div>`)}
    ${sousEcran("wifi", "Wi-Fi", "wifi", "var(--c-accueil)", `<div class="gauche">${grandeBascule("wifi", "wifi", "Wi-Fi")}
        <div class="note">${T("acces.wifi_note", "Choisis un r\xE9seau pour t'y connecter. Le r\xE9seau connect\xE9 : le choisir pour voir ses d\xE9tails.")}</div><div class="ligne" data-a="reglages:internet">${T("acces.gerer_reseaux", "G\xE9rer les r\xE9seaux dans Steam")}<span></span></div></div>
      <div class="droite defile liste-wifi"></div>`)}
    <div class="carte verre panneau-rapide" data-panneau="son" hidden><h2>${pastille("volume", "var(--c-accueil)")}${T("acces.son", "Son")}</h2>
      <h3>${T("acces.sortie_titre", "Sortie audio")}</h3><div class="sortie-bouton verre" data-a="liste:sortie" data-audio="sortie"><span class="pastille"></span><b class="sortie-nom"></b><span class="coin-sortie">\u203A</span></div>
      ${curseur("vol", "reglette gliss-card", T("acces.volume", "Volume"))}
      <h3>${T("acces.entree_titre", "Entr\xE9e audio")}</h3><div class="sortie-bouton verre" data-a="liste:entree" data-audio="entree"><span class="pastille"></span><b class="sortie-nom"></b><span class="coin-sortie">\u203A</span></div>
      ${curseur("mic", "reglette gliss-card", T("acces.volume_micro", "Volume du micro"))}</div>
    <div class="carte verre panneau-rapide perf-page" data-panneau="perf" hidden><h2>${pastille("perf", "var(--c-perf)")}${T("acces.performances", "Performances")}</h2>
      <div class="ligne" data-a="liste:crans" data-cycle="crans">${T("acces.crans_titre", "Affichage des performances")}<span></span></div>
        <div class="ligne" data-a="liste:hz" data-cycle="hz">${T("acces.hz_titre", "Fr\xE9quence de l'\xE9cran")}<span></span></div>
        <div class="ligne" data-a="liste:ips" data-cycle="ips">${T("acces.ips_titre", "Limite d'images par seconde")}<span></span></div>
        <div class="ligne" data-a="cadre:5:${T("acces.performances", "Performances")}:perf">${T("acces.tous_reglages_perf", "Tous les r\xE9glages de performance")}<span></span></div></div>
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
      <div class="droite defile"><div class="grille-g liste-greffons"></div></div>`, "", '<p class="rangement pcv-aide-rangement" hidden></p>')}
    ${sousEcran("cadre", "", "prise", "var(--c-decky)", '<div class="colonne" hidden></div><div class="cadre-boite"></div>', "cadre", '<div class="carrou-g"><i class="fl-c" data-a="greffon-pas:-1"></i><div class="bande-g"></div><i class="fl-c d" data-a="greffon-pas:1"></i></div>')}
    <div class="voile wifi-motdepasse" hidden><div class="fenetre verre pcv-fenetre" role="dialog" aria-modal="true" aria-labelledby="pcv-wifi-nom">
      <div class="wifi-entete">${pastille("wifi", "var(--c-accueil)")}<div><h2 id="pcv-wifi-nom"></h2><p>${T("acces.wifi_rejoindre", "Rejoindre ce r\xE9seau")}</p></div></div>
      <div class="wifi-infos"></div><div class="details-wifi-fenetre"></div>
      <div class="wifi-saisie"><label for="pcv-wifi-secret">${T("acces.wifi_mdp", "Mot de passe")}</label>
      <input id="pcv-wifi-secret" class="premier" data-a="wifichamp" type="password" autocomplete="off" spellcheck="false" data-y="wifi-afficher" data-y-nom="${T("acces.wifi_afficher", "Afficher")}"></div>
      <div class="wifi-statut" role="status" aria-live="polite"></div>
      <div class="choix">${bouton("wifiafficher", "wifi-afficher", 0, "var(--c-accueil)", "masquer", T("acces.wifi_afficher", "Afficher"))}${bouton("wifioublier", "wifi-oublier", 0, "var(--pcv-rouge)", "wifi", T("acces.wifi_oublier", "Oublier ce r\xE9seau"))}${bouton("wificancel", "", 0, "var(--c-accueil)", "fleche", T("acces.annuler", "Annuler"))}${bouton("wificonnecter", "wifi-connecter", 0, "var(--c-accueil)", "wifi", T("acces.wifi_connecter", "Se connecter"))}</div></div></div>
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
    const elt = (x) => `<div class="elt${x.is_connected ? " connecte" : ""}" data-a="btappareil:${esc(x.id)}"${x.is_paired ? ` data-y="oublier:${esc(x.id)}" data-y-nom="${esc(T("acces.bt_oublier", "Oublier"))}"` : ""}>${pastille(ICO_BT[x.etype] || "bluetooth")}${esc(x.nom)}<span class="etat-elt">${x.is_pairing || x.operation_in_progress ? window.__pcvChargement.html() : x.is_connected ? T("acces.connecte_statut", "Connect\xE9") : x.is_paired ? T("acces.associe", "Associ\xE9") : T("acces.appuie_appairer", "Appuie pour appairer")}</span></div>` + (x.is_paired ? `<div class="ligne" data-a="btoublier:${esc(x.id)}">${T("acces.bt_oublier_appareil", "Oublier cet appareil")}</div>` : "");
    const assoc = btEtat.liste.filter((x) => x.is_paired), trouves = btEtat.liste.filter((x) => !x.is_paired);
    l.innerHTML = !btEtat.on ? `<h3>${T("acces.appareils", "Appareils")}</h3><div class="vide">${T("acces.bt_desactive_texte", "Le Bluetooth est d\xE9sactiv\xE9.")}</div>` : `<h3>${T("acces.appareils_associes", "Appareils associ\xE9s")}</h3>${assoc.map(elt).join("") || `<div class="vide">${T("acces.aucun_point", "Aucun.")}</div>`}<h3>${T("acces.appareils_trouves", "Appareils trouv\xE9s")} ${btEtat.cherche ? window.__pcvChargement.html() : ""}</h3>${trouves.map(elt).join("") || `<div class="vide">${btEtat.cherche ? T("acces.recherche_en_cours", "Recherche en cours\u2026") : T("acces.lance_rechercher", "Lance \xAB Rechercher \xBB.")}</div>`}`;
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
  let wifiFenetre = null;
  const wifiVoile = () => e.$(".wifi-motdepasse");
  const wifiChamp = () => e.$("#pcv-wifi-secret");
  const wifiClavier = () => window.__pcvClavier ? window : principale().m_BrowserWindow;
  const fermerWifi = () => {
    if (!wifiFenetre) return;
    wifiClavier().__pcvClavierCacher?.();
    wifiChamp().value = "";
    wifiChamp().blur();
    wifiFenetre = null;
    e.fermerVoile(wifiVoile());
    e.premier();
  };
  const afficherWifi = () => {
    if (!wifiFenetre || wifiFenetre.occupe) return;
    const c = wifiChamp();
    c.type = c.type === "password" ? "text" : "password";
    const texte = c.type === "password" ? T("acces.wifi_afficher", "Afficher") : T("acces.wifi_masquer", "Masquer");
    wifiVoile().querySelectorAll("[data-a]").forEach((x) => {
      if (wifiFenetre.secret) {
        x.dataset.y = "wifi-afficher";
        x.dataset.yNom = texte;
      } else {
        delete x.dataset.y;
        delete x.dataset.yNom;
      }
    });
    e.$('[data-a="wifiafficher"]').lastChild.textContent = texte;
    e.$('[data-a="wifiafficher"]').setAttribute("aria-pressed", String(c.type === "text"));
    if (e.focus?.()) e.poser(e.focus());
  };
  const saisirWifi = () => {
    if (!wifiFenetre || wifiFenetre.occupe) return;
    if (!wifiClavier().__pcvClavier?.(wifiChamp())) wifiChamp().focus();
  };
  const connecterWifi = async () => {
    const session = wifiFenetre;
    if (!session || session.occupe || session.a.isConnected) return;
    if (session.secret && !wifiChamp().value) return saisirWifi();
    session.occupe = true;
    wifiChamp().disabled = true;
    wifiClavier().__pcvClavierCacher?.();
    const statut = e.$(".wifi-statut");
    statut.classList.remove("erreur");
    statut.innerHTML = window.__pcvChargement.html() + esc(T("acces.wifi_connexion", "Connexion\u2026"));
    e.$(".wifi-connecter").disabled = true;
    let ok = false;
    try {
      ok = await reseau().Connect({
        deviceId: session.a.deviceId,
        deviceWapId: session.a.deviceWapId,
        credentials: { username: "", password: wifiChamp().value }
      });
    } catch (x) {
    }
    if (wifiFenetre !== session) return;
    session.occupe = false;
    wifiChamp().disabled = false;
    e.$(".wifi-connecter").disabled = false;
    if (ok) {
      e.bulle(T("acces.connecte_statut", "Connect\xE9"));
      fermerWifi();
      peindreWifi();
      return;
    }
    statut.textContent = session.secret ? T("acces.wifi_erreur_mdp", "Mot de passe incorrect. R\xE9essaie.") : T("acces.wifi_erreur", "Connexion impossible. R\xE9essaie.");
    statut.classList.add("erreur");
    e.$(".wifi-connecter").lastChild.textContent = T("acces.wifi_reessayer", "R\xE9essayer");
    e.poser(session.secret ? wifiChamp() : e.$(".wifi-connecter"));
  };
  const ouvrirWifid = (a) => {
    const w = infoWifi(a);
    const secret = a.showAsLocked && !a.isSaved;
    if (!a.isConnected && (typeof reseau().Connect !== "function" || secret && ![1, 4, 8, 16, 32, 64].includes(w.esecurity))) {
      B.navigate("Internet");
      return fermer();
    }
    wifiFenetre = { a, secret, occupe: false };
    const v = wifiVoile();
    v.querySelector("h2").textContent = a.displayName;
    v.querySelector(".wifi-infos").innerHTML = "<span>" + barres(w.estrength || 0) + esc(T("acces.force_signal", "Force du signal")) + ": " + esc(["", T("acces.signal_faible", "faible"), T("acces.signal_moyen", "moyen"), T("acces.signal_bon", "bon"), T("acces.signal_tresbon", "tr\xE8s bon")][w.estrength || 0] || "") + "</span><span>" + ico("cadenas") + esc(SECU[w.esecurity] || T("acces.protege", "prot\xE9g\xE9")) + "</span>";
    v.querySelector(".details-wifi-fenetre").innerHTML = a.isConnected ? [
      [T("acces.adresse_console", "Adresse de la console"), a.IPv4Addresses?.[0] && ip(a.IPv4Addresses[0].ip)],
      [T("acces.connexion_auto", "Connexion automatique"), w.is_autoconnect ? T("steamu.app.oui", "oui") : T("steamu.app.non", "non")]
    ].filter(([, x]) => x).map(([k, x]) => `<div>${esc(k)} : ${esc(x)}</div>`).join("") : "";
    wifiChamp().value = "";
    wifiChamp().disabled = false;
    wifiChamp().type = "text";
    afficherWifi();
    v.querySelector(".wifi-saisie").hidden = v.querySelector(".wifi-afficher").hidden = !secret;
    v.querySelector(".wifi-oublier").hidden = !(a.isSaved && a.isForgettable);
    v.querySelector(".wifi-connecter").hidden = !!a.isConnected;
    v.querySelector(".wifi-connecter").disabled = false;
    v.querySelector(".wifi-connecter").lastChild.textContent = T("acces.wifi_connecter", "Se connecter");
    const statut = v.querySelector(".wifi-statut");
    statut.classList.remove("erreur");
    statut.textContent = a.isConnected ? T("acces.connecte_statut", "Connect\xE9") : "";
    if (secret) statut.innerHTML = ico("cadenas") + esc(T("acces.wifi_indice", "Saisis le mot de passe de ce r\xE9seau."));
    v.querySelectorAll(".premier").forEach((x) => x.classList.remove("premier"));
    (secret ? wifiChamp() : v.querySelector('[data-a="wificancel"]')).classList.add("premier");
    e.ouvrirVoile(v);
    if (secret) saisirWifi();
  };
  const oublierWifi = () => {
    const a = wifiFenetre?.a;
    if (!a?.isSaved || !a.isForgettable || wifiFenetre.occupe) return;
    const v = e.$(".voile.confirme");
    enAttente = async () => {
      try {
        await a.Forget();
        fermerWifi();
        peindreWifi();
      } catch (x) {
        e.bulle(T("acces.wifi_erreur", "Connexion impossible. R\xE9essaie."));
      }
    };
    v.querySelector(".grosse").innerHTML = ico("wifi");
    v.querySelector("h2").textContent = T("acces.wifi_oublier_titre", "Oublier \xAB {nom} \xBB ?", { nom: a.displayName });
    v.querySelector("p").textContent = T("acces.wifi_oublier_texte", "Il faudra saisir \xE0 nouveau le mot de passe pour rejoindre ce r\xE9seau.");
    v.querySelector(".ok").innerHTML = pastille("wifi", "var(--pcv-rouge)") + esc(T("acces.bt_oublier", "Oublier"));
    e.ouvrirVoile(v);
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
      if (s !== "wifi") {
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
  const duree = (s) => window.__pcvEtat.duree(s);
  const etatPile = (p) => ({
    branche: p.acState === 2 || p.percent >= 0.99 && p.batteryState === 3,
    s: window.__pcvEtat.autonomie(p)
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
  const greffons = () => window.__pcvDecky.liste();
  const peindreListe = () => {
    const l = greffons();
    e.$(".nb-greffons").textContent = l.length;
    e.$(".liste-greffons").innerHTML = l.map((p) => `<div class="tuile-g" data-a="greffon:${esc(p.name)}">${window.__pcvDecky.relief(p)}<span><b>${esc(p.name)}</b><small>${esc(enPanne(p.name) ? T("acces.greffon_panne_court", "ne se charge pas") : p.version ? T("acces.version", "version {v}", { v: p.version }) : "")}</small></span></div>`).join("");
  };
  const ouvrirDecky = () => {
    peindreListe();
    ouvrirSous("decky");
  };
  const rangerGreffon = (el) => el.matches(".liste-greffons .tuile-g") && { verbe: T("touche.deplacer", "D\xE9placer"), poser: (ordre) => {
    try {
      const s = O.DeckyPluginLoader.deckyState, vus2 = ordre.map((a) => a.slice(8)), k = [...vus2], tous = [.../* @__PURE__ */ new Set([...s._pluginOrder || [], ...(s._plugins || []).map((p) => p.name)])];
      const o = tous.map((n) => vus2.includes(n) ? k.shift() : n);
      s.setPluginOrder(o);
      (O.DeckyBackend || window.DeckyBackend).call("utilities/settings/set", "pluginOrder", o);
    } catch (x) {
      console.error("pcv", "Ordre des greffons", x);
    }
  } };
  const optionsGreffon = (el) => {
    if (!el?.matches(".liste-greffons .tuile-g")) return false;
    const nom = el.dataset.a.slice(8), accueil = principale().m_BrowserWindow.__pcvGreffonsAccueil;
    liste(e, {
      cle: "greffon-options",
      pres: el,
      lire: () => "",
      choix: [{ valeur: "ranger", ic: "ranger", texte: T("console.ranger") }, { valeur: "epingle", ic: "epingle", texte: T(accueil?.contient(nom) ? "greffons.desepingler" : "greffons.epingler") }],
      ecrire: (v) => {
        if (v === "ranger") queueMicrotask(() => e.ranger(el));
        else {
          const oui = !accueil?.contient(nom);
          if (accueil?.epingler(nom, oui) && oui) {
            fermer();
            O.__pcvAller?.("accueil");
          }
        }
      }
    });
    return true;
  };
  const greffonsCadre = () => greffons().filter((p) => p.name !== window.__pcvGreffon.nom);
  const icone = (p) => window.__pcvDecky.dessin(p) || ico("prise");
  const peindreCarrousel = () => {
    const b = e.$(".bande-g"), l = greffonsCadre(), sig = l.map((p) => p.name).join("\n"), nom = cadre?.vise || cadre?.titre;
    if (b.__sig !== sig) {
      b.__sig = sig;
      b.innerHTML = l.map((p) => `<span class="tuile-c" data-a="greffon:${esc(p.name)}"><span class="ico-c">${icone(p)}</span><b>${esc(p.name)}</b></span>`).join("");
    }
    const t = [...b.children], i = l.findIndex((p) => p.name === nom);
    t.forEach((x, k) => x.classList.toggle("on", k === i));
    try {
      principale().m_BrowserWindow.__pcvPresentation.rangee(t, i, void 0, void 0, 75);
    } catch (x) {
    }
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
    if (e.racine.classList.toggle("leg-lecteur", sousOuvert() === "musique" && lect.length > 0)) e.$(".x-txt").textContent = lect[cur]?.statut === "Playing" ? T("acces.pause_legende", "Pause") : T("acces.lecture_legende", "Lecture");
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
      const R = Math.hypot(c, s) / instants.length, sc2 = R * Math.exp(-(Math.log2(bpm / 115) ** 2) / 0.5);
      if (!m || sc2 > m.sc) m = { bpm, R, sc: sc2, phase: (Math.atan2(s, c) / (2 * Math.PI) * P + P) % P };
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
      const main2 = (cote, avance = 0.035) => {
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
        const h2 = main2(1, 0.012), angle = 15 * Math.PI / 180;
        const axe = v.d.set(-Math.sin(m.cap) * Math.sin(angle), Math.cos(angle), -Math.cos(m.cap) * Math.sin(angle));
        dans(O2.micro, h2, h2.p.clone().add(axe));
        O2.micro.position.addScaledVector(axe, -0.025 * O2.micro.scale.y);
      } else if (role === "maracas") {
        for (const [o, c] of [[O2.maracaD, 1], [O2.maracaG, 0]]) {
          const h2 = main2(c);
          dans(o, h2, h2.p.clone().add(h2.dir).add(v.Y));
        }
      } else if (role === "tambourin") dans(O2.tambourin, main2(1));
      else if (role === "tambour") {
        devant(O2.tambour, 0.2);
        dans(O2.baguetteD, main2(1), avant(0.2, -0.05, PEAU).clone());
        dans(O2.baguetteG, main2(0), avant(0.2, 0.05, PEAU).clone());
      } else if (role === "clavier") {
        devant(O2.clavier, 0.25);
        O2.clavier.rotation.y += Math.PI;
      } else if (role === "guitare") {
        v.x.set(Math.cos(m.cap), 0, -Math.sin(m.cap));
        v.z.set(Math.sin(m.cap), 0, Math.cos(m.cap));
        O2.guitare.position.copy(main2(0, 0).p).addScaledVector(v.x, -0.32 * O2.guitare.scale.x).addScaledVector(v.z, -0.02 * O2.guitare.scale.z);
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
      const vus2 = new Set(D.grp.roles.flatMap((r) => OBJETS[r]));
      for (const [n, o] of Object.entries(D.O)) o.visible = vus2.has(n);
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
    if (cadre?.panne) return;
    if (!c || !cadre) return requestAnimationFrame(placerCadre);
    const actif = cadre.onglet === 999 && O.DeckyPluginLoader?.deckyState?._activePlugin?.name;
    c.toggleAttribute("data-pcv-greffon-tiers", !!actif && actif !== window.__pcvGreffon.nom);
    if (c.hasAttribute("data-pcv-greffon-tiers")) {
      c.dataset.pcvGreffon = actif;
      suivreGreffon(c);
    } else delete c.dataset.pcvGreffon;
    const animations = b.closest(".sousecran").getAnimations().filter((a) => a.playState === "running");
    if (animations.length) {
      const ouvert = cadre;
      Promise.allSettled(animations.map((a) => a.finished)).then(() => {
        if (cadre === ouvert) placerCadre();
      });
      return;
    }
    const r = b.getBoundingClientRect(), scene = e.racine.getBoundingClientRect();
    h.style.removeProperty("--pcv-cadre-z");
    const cs = getComputedStyle(h), tiers = c.hasAttribute("data-pcv-greffon-tiers"), rapport = innerWidth / scene.width / (tiers ? parseFloat(cs.zoom) || 1 : 1);
    const z = tiers ? parseFloat(cs.getPropertyValue("--pcv-greffon-echelle")) * rapport : parseFloat(cs.getPropertyValue("--pcv-cadre-z")) || 1;
    if (tiers) h.style.setProperty("--pcv-cadre-z", z.toFixed(4));
    h.style.setProperty("--pcv-cadre-k", (parseFloat(getComputedStyle(e.racine).zoom) || 1).toFixed(4));
    for (const [n, v, zz] of [["l", r.left, 1], ["t", r.top, 1], ["w", r.width, z], ["h", r.height, z]]) h.style.setProperty("--pcv-cadre-" + n, (v * rapport / zz).toFixed(1) + "px");
    entrer(c);
  };
  const titreCadre = (titre, p) => {
    const s = e.$('[data-sous="cadre"]'), g = +cadre.onglet === 999 && greffonsCadre().find((x) => x.name === titre);
    s.querySelector(".titre-s > span:last-child").textContent = g ? T("acces.greffons_page", "Greffons") : titre;
    s.querySelector(".titre-s .pastille").innerHTML = ico(g ? "prise" : p || "prise");
    s.classList.toggle("greffons", !!g);
    legendeGreffons(!!g);
    if (g) peindreCarrousel();
  };
  let lacherEpaules = null;
  const epaules = (oui) => {
    if (!oui) {
      lacherEpaules?.();
      lacherEpaules = null;
      return;
    }
    if (lacherEpaules) return;
    try {
      lacherEpaules = principale().m_BrowserWindow.__pcvToutesTouches?.((b, bas) => {
        if (b !== 5 && b !== 6 || !cadre || e.racine.hidden || d.visibilityState !== "visible") return false;
        if (!bas) {
          clearTimeout(window.__pcvTenue?.m);
          window.__pcvTenue = null;
          return true;
        }
        window.__pcvTenir(b, () => pasGreffon(b === 5 ? -1 : 1));
        return true;
      }) || null;
    } catch (x) {
    }
  };
  const legendeGreffons = (oui) => {
    epaules(oui);
    e.racine.classList.toggle("leg-greffons", oui);
    const t = e.$(".epaules-leg .lb-txt");
    if (t) t.textContent = oui ? T("touche.onglets", "Onglets") : T("menus.morceau", "Morceau");
  };
  const ouvrirCadre = (onglet, titre, p) => {
    cadre = { onglet, titre, depuis: e.focus() };
    titreCadre(titre, p);
    B.openQuickAccessTab(onglet);
    ouvrirSous("cadre");
    h.dataset.pcvPeCadre = "";
    e.racine.classList.add("en-cadre");
    requestAnimationFrame(placerCadre);
  };
  const entrer = (c) => prendre(cadre.dernier?.isConnected && cadre.dernier.getClientRects().length ? cadre.dernier : commandes(c).find((x) => !x.closest("{{Title@QuickAccessMenu}}")) || c.querySelector("button"));
  const prendre = (el) => {
    try {
      const n = principale().m_BrowserWindow.__pcvNoeud?.(el);
      if (n) n.BTakeFocus(4);
      else el?.focus();
    } catch (x) {
    }
  };
  const COMMANDE = "button, input, .Focusable, [tabindex]";
  const commandes = (c) => {
    let n = null;
    try {
      n = principale().m_BrowserWindow.__pcvNoeud;
    } catch (x) {
    }
    const l = [...c.querySelectorAll(COMMANDE)].filter((x) => x.getClientRects().length && n?.(x)?.m_Properties?.focusable === true);
    return l.filter((x) => !l.some((y) => y !== x && x.contains(y)));
  };
  const garder = (ev) => {
    const c = cadre && d.getElementById("quickaccess_content_" + cadre.onglet);
    if (!c) return;
    if (c.contains(ev.target)) cadre.dernier = ev.target;
    else entrer(c);
  };
  d.addEventListener("focusin", garder, true);
  const toucherGreffon = (ev) => {
    const c = cadre && !cadre.main && cadre.zone && contenu();
    if (!c?.contains(ev.target)) return;
    cadre.zone = null;
    e.poser(null);
    ranger(c);
  };
  d.addEventListener("pointerdown", toucherGreffon, true);
  const son = (n) => {
    try {
      principale().m_BrowserWindow.__pcvSon?.(n);
    } catch (x) {
    }
  }, bord = () => son("bord");
  const enPanne = (nom) => greffons().find((p) => p.name === nom)?.content?.type?.name === "TheError";
  const panne = (nom) => {
    const b = e.$(".cadre-boite");
    if (cadre) cadre.panne = !!nom;
    if (!nom) return b.replaceChildren();
    delete h.dataset.pcvPeCadre;
    colonneG().hidden = true;
    colonneG().__pcvVu = null;
    const g = greffons().find((p) => p.name === nom);
    b.innerHTML = `<div class="panne-g" data-a="retour"><span class="pastille">${g ? icone(g) : ico("prise")}</span><b>${esc(nom)}</b><span>${esc(T("acces.greffon_panne", "Ce greffon ne se charge pas."))}</span></div>`;
    e.poser(b.firstChild);
  };
  const ouvrirPlugin = (nom) => {
    O.__pcvRetourDecky = B.page();
    ouvrirDecky();
    const casse = enPanne(nom);
    if (!casse) O.DeckyPluginLoader.deckyState.setActivePlugin(nom);
    ouvrirCadre(999, nom, "prise");
    if (casse) panne(nom);
  };
  const ouvrirPluginDemande = () => {
    const nom = O.__pcvPluginAouvrir;
    if (!nom) return;
    delete O.__pcvPluginAouvrir;
    ouvrirPlugin(nom);
  };
  O.__pcvOuvrirPlugin = ouvrirPluginDemande;
  const changerGreffon = (nom) => {
    if (!cadre) return;
    clearTimeout(cadre.pose);
    cadre.vise = null;
    if (nom === cadre.titre) return peindreCarrousel();
    cadre.titre = nom;
    cadre.dernier = null;
    cadre.main = null;
    titreCadre(nom);
    if (nom !== MP) {
      mpFermer();
      mp.cadre = null;
    }
    if (enPanne(nom)) return panne(nom);
    const c0 = contenu();
    if (c0?.hasAttribute("data-pcv-greffon-tiers")) c0.dataset.pcvGreffon = nom;
    panne(null);
    h.dataset.pcvPeCadre = "";
    O.DeckyPluginLoader.deckyState.setActivePlugin(nom);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const c = contenu();
      if (c) c.scrollTop = 0;
      if (cadre) placerCadre();
    }));
  };
  let navG = null;
  const rangeeG = () => navG ||= principale().m_BrowserWindow.__pcvPresentation.onglets({
    rang: () => {
      const l = greffonsCadre();
      return [cadre ? l.findIndex((p) => p.name === (cadre.vise || cadre.titre)) : -1, l.length];
    },
    aller: (j) => {
      const g = greffonsCadre()[j], ici = cadre;
      cadre.vise = g.name;
      peindreCarrousel();
      if (cadre.zone === "bande") e.poser(e.$(".bande-g .tuile-c.on"));
      clearTimeout(cadre.pose);
      cadre.pose = setTimeout(() => {
        if (cadre === ici) changerGreffon(g.name);
      }, window.__pcvPanneau().duration);
    },
    revenir: () => {
    },
    descendre: () => {
      const c = contenu();
      if (c) (cadre.ongs?.length > 1 ? versOnglets : versCartes)(c);
    }
  });
  const pasGreffon = (n) => rangeeG().voisine(n);
  const RANG = "{{PanelSectionRow@PanelSectionTitle}}";
  const texteSeul = (r) => !!r && !r.querySelector("button, input, .Focusable") && r.textContent.trim();
  const replis = (c) => {
    for (const b of c.querySelectorAll(".DialogButton")) {
      const r = b.closest(RANG);
      if (!r || b.textContent.trim() || b.querySelectorAll("svg").length !== 1 || b.offsetWidth < r.offsetWidth * 0.8) continue;
      let t = r.previousElementSibling;
      while (t?.tagName === "STYLE") t = t.previousElementSibling;
      const titre = texteSeul(t);
      if (!titre) continue;
      t.setAttribute("data-pcv-repli-titre", "");
      if (b.dataset.pcvRepli !== titre) b.dataset.pcvRepli = titre;
      const dans = [];
      for (let x = r.nextElementSibling; x && !texteSeul(x); x = x.nextElementSibling) if (x.tagName !== "STYLE") dans.push(x);
      b.toggleAttribute("data-pcv-ouvert", dans.length > 0);
      b.__pcvRepli = { t, r, dans, b };
      for (const x of dans) if (!x.hasAttribute("data-pcv-repli-dans")) {
        x.setAttribute("data-pcv-repli-dans", "");
        if (b.__pcvVu) window.__pcvApparition(x);
      }
      b.__pcvVu = true;
    }
  };
  const ADAPTER = {
    // Speed Test : ses courbes ont une largeur fixe (140 px, sans viewBox) ; elles s'étirent sur la largeur de leur colonne
    // (12/11, l'auteur) MagicPods, sa page d'origine ouverte par « Réglages de MagicPods » (mp.etat « leur ») : ce que notre panneau fait déjà
    // n'y revient pas (ses batteries, son contrôle du bruit, la pause à l'oreille, le micro HD, la conversation). Reconnu par SA commande
    // (le texte de son onChange) et par le dessin de ses batteries ; une autre version où rien ne correspond : rien n'est caché. Sa page
    // en repli (son moteur injoignable) ou ouverte hors de notre cadre reste entière
    "MagicPods": (c) => {
      const ici = mp.etat === "leur", RE = /handleNumberCapabilityChange\("anc"|pauseMedia: b\b|"highResolutionMicrophone"|handleConversationAwarenessChange\(\{ enabled/;
      for (const r of c.querySelectorAll(RANG)) {
        if (r.__pcvDouble === void 0) {
          let t = "";
          for (const el of r.querySelectorAll(".Focusable, input, [role=slider]")) for (let f = fibre(el), i = 0; f && i < 8; f = f.return, i++) {
            const p = f.memoizedProps;
            if (typeof p?.onChange === "function") t += String(p.onChange);
          }
          r.__pcvDouble = !!r.querySelector('svg[width="16"][height="28"]') || RE.test(t);
        }
        r.toggleAttribute("data-pcv-double", ici && r.__pcvDouble);
      }
      c.toggleAttribute("data-pcv-mp-leur", ici);
    },
    "Speed Test": (c) => {
      for (const g of c.querySelectorAll("svg[width][height]:not([viewBox])")) if (g.querySelector("path")) {
        g.setAttribute("viewBox", `0 0 ${g.getAttribute("width")} ${g.getAttribute("height")}`);
        g.setAttribute("preserveAspectRatio", "none");
        const k = g.clientHeight / g.getAttribute("height") / (g.clientWidth / g.getAttribute("width") || 1);
        for (const t of g.querySelectorAll("text")) Object.assign(t.style, { transformBox: "fill-box", transformOrigin: "0 50%", transform: `scaleX(${k.toFixed(3)})` });
      }
    }
  };
  const fibre = (el) => el && el[Object.keys(el).find((k) => k.startsWith("__reactFiber"))];
  const propsDe = (el, ok, n) => {
    for (let f = fibre(el), i = 0; f && i < n; f = f.return, i++) {
      const p = f.memoizedProps;
      if (p && typeof p === "object" && ok(p)) return p;
    }
    return null;
  };
  const boutonDe = (c, re) => [...c.querySelectorAll(".DialogButton")].find((b) => re.test(b.textContent.trim()));
  const sectionDe = (c, titre) => [...c.querySelectorAll(SECTION)].find((s) => s.querySelector(`:scope > ${TITRE_S}`)?.textContent.trim() === titre);
  const inactif = (b) => !b || b.disabled || b.classList.contains("Disabled");
  const dureeJeu = (s) => {
    s = Math.round(s || 0);
    const hh = Math.floor(s / 3600), mm = Math.floor(s / 60) % 60;
    return hh ? `${hh} h ${String(mm).padStart(2, "0")}` : mm ? `${mm} min` : s ? `${s} s` : "0";
  };
  const dureeTexte = (t) => (t || "").replace(/(\d+)\s*h\b/g, "$1 h").replace(/(\d+)\s*m\b/g, "$1 min").replace(/(\d+)\s*s\b/g, "$1 s");
  const jourDe = (j) => /* @__PURE__ */ new Date(j + "T12:00:00");
  const blk = (corps, cls = "") => `<div class="blk${cls}">${corps}</div>`, h5 = (t) => `<h5>${esc(t)}</h5>`;
  const SC = "Steamcord", SC_DELAI = 2e3, SC_REESSAI = 3e3, SC_ESSAIS = 10, SC_STATUTS = ["online", "idle", "dnd", "invisible"], SC_PROFIL = 4;
  const SC_FORME = {
    etat: { discord_enabled: "b", loaded: "b", logged_in: "b" },
    moi: { me: { id: "s", username: "s", is_muted: "b", is_deafened: "b" } },
    vc: { channel_id: "s" },
    statut: { status: "s" },
    serveurs: [{ id: "s", name: "s", channels: [{ id: "s", name: "s", members: [{ id: "s" }] }] }],
    mp: [{ id: "s", active_call: "b", recipients: [{ id: "s" }] }],
    evs: [{ id: "s", guild_id: "s", name: "s", status: "n" }]
  };
  const scFaute = (v, f, ou) => {
    if (Array.isArray(f)) {
      if (!Array.isArray(v)) return ou;
      for (const x of v) {
        const r = scFaute(x, f[0], ou + "[]");
        if (r) return r;
      }
      return "";
    }
    if (typeof f === "string") return typeof v === { s: "string", b: "boolean", n: "number" }[f] ? "" : ou;
    if (!v || typeof v !== "object") return ou;
    for (const k in f) {
      const r = scFaute(v[k], f[k], ou + "." + k);
      if (r) return r;
    }
    return "";
  };
  const scFauteEtat = (s) => scFaute(s, SC_FORME.etat, "state") || (s.loaded && s.logged_in ? scFaute(s, SC_FORME.moi, "state") || (s.vc == null ? "" : scFaute(s.vc, SC_FORME.vc, "state.vc")) : "");
  const scLeur = (s) => !s.discord_enabled || !!s.qr_login || !!s.captcha_needed || s.loaded && !s.logged_in;
  const scAppel = (m, ...a) => (O.DeckyBackend || window.DeckyBackend).call("loader/call_plugin_method", SC, m, ...a);
  const sc = { cadre: null, etat: "", d: null, essais: 0, interet: /* @__PURE__ */ new Set() };
  const scMaj = () => {
    const c = cadre && sc.cadre === cadre && contenu();
    if (c?.dataset.pcvGreffon === SC) main(c);
  };
  const scLire = async () => {
    const st = await scAppel("get_state"), f = scFauteEtat(st);
    if (f) throw new Error(f);
    if (scLeur(st)) return { leur: true };
    if (!st.logged_in) return { attente: true };
    const [statut, serveurs, mp2] = await Promise.all([scAppel("get_discord_status"), scAppel("get_guilds_vc", false), scAppel("get_dm_channels")]);
    const g = scFaute(statut, SC_FORME.statut, "get_discord_status") || scFaute(serveurs, SC_FORME.serveurs, "get_guilds_vc") || scFaute(mp2, SC_FORME.mp, "get_dm_channels");
    if (g) throw new Error(g);
    return { st, statut: statut.status, serveurs, mp: mp2, evs: sc.evs || null };
  };
  const scEvs = () => {
    if (sc.evsEnCours) return;
    sc.evsEnCours = true;
    scAppel("get_events").then((l) => {
      const f = scFaute(l, SC_FORME.evs, "get_events");
      if (f) throw new Error(f);
      sc.evs = l;
    }).then(() => {
      sc.evsEnCours = false;
      if (sc.etat === "ok") {
        sc.d.evs = sc.evs;
        scMaj();
      }
    }, (x) => {
      sc.evsEnCours = false;
      if (sc.etat === "ok") scRepli(String(x?.message || x).slice(0, 160));
    });
  };
  const scRepli = (pourquoi) => {
    sc.etat = "repli";
    scMaj();
    scAppel("get_version").catch(() => "?").then((v) => O.DeckyBackend?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "journal", `Steamcord ${v} : ${pourquoi}, son panneau d'origine est montr\xE9`)).catch(() => {
    });
  };
  const scVerifier = async () => {
    if (sc.enCours) return;
    sc.enCours = true;
    clearTimeout(sc.minuteur);
    const ici = sc.cadre;
    let d2, er;
    try {
      d2 = await Promise.race([scLire(), new Promise((_, non) => setTimeout(() => non(new Error("pas de r\xE9ponse en " + SC_DELAI / 1e3 + " s")), SC_DELAI))]);
    } catch (x) {
      er = String(x?.message || x);
    }
    sc.enCours = false;
    if (sc.cadre !== ici) return;
    if (er && !/stores_not_ready|discord_reconnecting/.test(er)) return scRepli(er.slice(0, 160));
    if (d2?.leur) sc.etat = "leur";
    else if (!d2 || d2.attente) {
      sc.etat = ++sc.essais > SC_ESSAIS ? "leur" : "attente";
      if (sc.etat === "attente") sc.minuteur = setTimeout(scVerifier, SC_REESSAI);
    } else {
      Object.assign(sc, { etat: "ok", d: d2, essais: 0 });
      scEvs();
    }
    scMaj();
  };
  const scPoserEtat = () => {
    sc.image = 0;
    const s = sc.recu, f = scFauteEtat(s);
    if (f) return scRepli(f);
    if (scLeur(s)) {
      if (sc.etat !== "leur") {
        sc.etat = "leur";
        scMaj();
      }
      return;
    }
    if (sc.etat === "ok") {
      sc.d.st = s;
      return scMaj();
    }
    if (s.logged_in) {
      sc.essais = 0;
      scVerifier();
    }
  };
  const scEvenement = (ev) => {
    if (ev?.plugin !== SC || !cadre || sc.cadre !== cadre || sc.etat === "repli") return;
    if (ev.event === "state") {
      sc.recu = ev.args?.[0];
      sc.image ||= requestAnimationFrame(scPoserEtat);
    } else if (ev.event === "dm_channels_changed" && sc.etat === "ok") scAppel("get_dm_channels").then((l) => {
      if (sc.etat !== "ok") return;
      const f = scFaute(l, SC_FORME.mp, "get_dm_channels");
      if (f) return scRepli(f);
      sc.d.mp = l;
      scMaj();
    }, () => {
    });
  };
  const scOuvrir = () => {
    Object.assign(sc, { cadre, etat: "attente", essais: 0, ouvert: null });
    if (!sc.ecoute) {
      sc.ecoute = scEvenement;
      try {
        (O.DeckyBackend || window.DeckyBackend).addEventListener("loader/plugin_event", scEvenement);
      } catch (x) {
      }
    }
    scVerifier();
  };
  const scImg = (dossier, id, h2) => h2 ? `https://cdn.discordapp.com/${dossier}/${id}/${h2}.webp?size=64` : "";
  const scAv = (nom, url, st, cl = "") => `<span class="sc-av${cl}">${esc(([...String(nom || "?")][0] || "?").toUpperCase())}${url ? `<img src="${esc(url)}" loading="lazy" alt="" onerror="this.remove()">` : ""}${st ? `<i class="sc-pt" data-st="${esc(st)}"></i>` : ""}</span>`;
  const scMini = (l) => l.length ? `<span class="sc-mini">${l.slice(0, 3).map((m) => scAv("", scImg("avatars", m.id, m.avatar))).join("")}</span>` : "";
  const scNomStatut = (s) => ({ online: T("acces.sc_en_ligne", "En ligne"), idle: T("acces.sc_absent", "Absent"), dnd: T("acces.sc_ndd", "Ne pas d\xE9ranger"), invisible: T("acces.sc_invisible", "Invisible") })[s] || T("acces.sc_hors_ligne", "Hors ligne");
  const scNom = (u) => u?.global_name || u?.username || "";
  const scY = () => ` data-y="main:statut" data-y-nom="${esc(T("acces.sc_statut", "Statut"))}"`;
  const scCarte = (a, av, nom, sous, bout = "", cl = "") => `<div class="blk sc-l${cl}" data-a="main:${esc(a)}"${scY()}>${av}<span class="sc-t"><b>${esc(nom)}</b>${sous}</span>${bout}</div>`;
  const scAct = (txt, plein) => `<span class="sc-act${plein ? " plein" : ""}">${esc(txt)}</span>`;
  const scDirect = () => `<span class="sc-direct">${esc(T("acces.sc_direct", "En direct"))}</span>`;
  const scRond = (a, p, cl = "") => `<span class="rond sc-rd${cl}" data-a="main:${a}"${scY()}>${ico(p)}</span>`;
  const scGrand = () => {
    const g = greffons().find((p) => p.name === SC);
    return `<button class="bouton sc-grand" data-a="main:grand"${scY()}>${g ? icone(g) : ""}<b>${esc(T("acces.sc_vue_agrandie", "Vue agrandie"))}</b></button>`;
  };
  const scConversation = (id, nom) => {
    let n = 0;
    const t = setInterval(() => {
      let p = null;
      try {
        const s = principale().m_BrowserWindow.document.querySelector(".sc-xv-side");
        p = s && propsDe(s, (q) => typeof q.value?.openChat === "function" && typeof q.value.openMembers === "function", 80);
      } catch (x) {
      }
      if (p || ++n > 40) {
        clearInterval(t);
        try {
          p?.value.openChat(id, nom, true);
        } catch (x) {
        }
      }
    }, 100);
  };
  const scQuand = (iso) => {
    const t = new Date(iso);
    return isNaN(t) ? "" : t.toLocaleString(LOCALE(), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };
  const scVide = (t) => blk(`<span class="vide">${esc(t)}</span>`, " large");
  const MP = "MagicPods", MP_ADRESSE = "ws://localhost:2020", MP_API = 1;
  const MP_MODES = [
    [1, "off", "mp_off", "D\xE9sactiv\xE9"],
    [2, "transparence", "mp_transparence", "Transparence"],
    [4, "adaptatif", "mp_adaptatif", "Adaptatif"],
    [8, "vent", "mp_vent", "Anti-vent"],
    [16, "reduction", "mp_reduction", "R\xE9duction"]
  ];
  const MP_FORME = {
    appareils: [{ name: "s", address: "s", connected: "b" }],
    info: { name: "s", address: "s", connected: "b", capabilities: {} },
    battery: { battery: "n", charging: "b", status: "n" },
    anc: { selected: "n", options: "n" },
    earDetection: { selected: { pauseMedia: "b", switchToSpeakers: "b", lowerVolume: "n" } },
    highResolutionMicrophone: { selected: "b" },
    conversationAwareness: { selected: { enabled: "b", volume: "n" } }
  };
  const mpFauteInfo = (i) => {
    if (!i || typeof i !== "object") return "info";
    if (!Object.keys(i).length) return "";
    const f = scFaute(i, MP_FORME.info, "info"), c = i.capabilities;
    if (f) return f;
    for (const k of ["anc", "earDetection", "highResolutionMicrophone", "conversationAwareness"]) if (c[k] != null) {
      const g = scFaute(c[k], MP_FORME[k], "info.capabilities." + k);
      if (g) return g;
    }
    for (const k of c.battery != null ? ["left", "right", "case", "single"] : []) {
      const g = scFaute(c.battery[k], MP_FORME.battery, "info.capabilities.battery." + k);
      if (g) return g;
    }
    return "";
  };
  const MP_FAMILLES = {
    tige: { paire: "ecouteurs-tige", g: "ecouteur-tige-g", d: "ecouteur-tige-d" },
    rond: { paire: "ecouteurs-ronds", g: "ecouteur-rond-g", d: "ecouteur-rond-d" },
    casque: { paire: "casque" },
    autre: { paire: "ecouteurs-autres" }
  };
  const mpFamille = (nom) => {
    const n = String(nom || "").toLowerCase();
    return /\bmax\b|solo|studio(?! ?buds)|casque|headphone/.test(n) ? "casque" : n.includes("airpods") ? "tige" : /buds|beats/.test(n) ? "rond" : "autre";
  };
  const mp = { cadre: null, etat: "", ws: null, d: null };
  const mpPc = () => {
    const l = contenu()?.querySelectorAll("{{Title@QuickAccessMenu}} .DialogButton");
    return l?.length > 1 ? l[l.length - 1] : null;
  };
  const mpPcOuvrir = () => {
    const b = mpPc();
    if (!b) return bord();
    son("bouge");
    b.click();
  };
  const mpCo = (x) => !!x.info?.connected, mpCap = (x) => x.info?.capabilities || {};
  const mpModes = (x) => {
    const a = mpCap(x).anc;
    return a ? MP_MODES.filter(([v]) => a.options & v) : [];
  };
  const mpMaj = () => {
    const c = cadre && contenu();
    if (c?.dataset.pcvGreffon !== MP) return;
    if (!main(c)) {
      replis(c);
      ADAPTER[MP](c);
      ranger(c);
    }
  };
  const mpFermer = () => {
    clearTimeout(mp.minuteur);
    const w = mp.ws;
    mp.ws = null;
    if (w) {
      w.onmessage = w.onclose = null;
      try {
        w.close();
      } catch (x) {
      }
    }
  };
  const mpRepli = (pourquoi) => {
    if (mp.etat === "repli") return;
    mp.etat = "repli";
    mpFermer();
    mpMaj();
    try {
      O.DeckyBackend?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "journal", `MagicPods ${mp.version || "?"} : ${pourquoi}, sa page d'origine est montr\xE9e`)?.catch?.(() => {
      });
    } catch (x) {
    }
  };
  const retourMp = () => {
    if (!cadre || cadre.main || mp.etat !== "leur" || mp.cadre !== cadre || contenu()?.dataset.pcvGreffon !== MP) return false;
    mp.cadre = null;
    son("bouge");
    mpMaj();
    return true;
  };
  const mpEnvoyer = (method, args) => {
    if (mp.ws?.readyState !== 1) return false;
    mp.ws.send(JSON.stringify(args ? { method, arguments: args } : { method }));
    return true;
  };
  const mpRecu = (ev) => {
    let j;
    try {
      j = JSON.parse(ev.data);
    } catch (x) {
      return;
    }
    if (!j || typeof j !== "object" || mp.etat === "repli") return;
    if (j.init) {
      mp.version = String(j.init.version ?? "?");
      return j.init.api === MP_API ? void mpEnvoyer("GetAll") : mpRepli(`API ${j.init.api} (attendue : ${MP_API})`);
    }
    if ("headphones" in j) {
      const f = scFaute(j.headphones, MP_FORME.appareils, "headphones");
      if (f) return mpRepli(f);
      mp.d.appareils = j.headphones;
    }
    if ("info" in j) {
      const f = mpFauteInfo(j.info);
      if (f) return mpRepli(f);
      mp.d.info = j.info;
    }
    if (mp.etat === "attente" && "headphones" in j && "info" in j) {
      mp.etat = "ok";
      clearTimeout(mp.minuteur);
    }
    if (mp.etat === "ok") mp.image ||= requestAnimationFrame(() => {
      mp.image = 0;
      mpMaj();
    });
  };
  const mpOuvrir = () => {
    mpFermer();
    Object.assign(mp, { cadre, etat: "attente", d: { appareils: [], info: {} } });
    mp.minuteur = setTimeout(() => {
      if (mp.etat === "attente") mpRepli("pas de r\xE9ponse en " + SC_DELAI / 1e3 + " s");
    }, SC_DELAI);
    try {
      const w = mp.ws = new (O.WebSocket || WebSocket)(MP_ADRESSE);
      w.onmessage = mpRecu;
      w.onclose = () => {
        if (mp.ws === w) mpRepli("connexion ferm\xE9e");
      };
    } catch (x) {
      queueMicrotask(() => mpRepli(String(x?.message || x).slice(0, 160)));
    }
  };
  const mpNiv = (v) => v <= 20 ? "rouge" : v <= 50 ? "jaune" : "vert";
  const mpBulle = (b, nom) => `<span class="mp-bulle${b.status === 3 ? " hors" : ""}" data-niv="${mpNiv(b.battery)}"><small>${esc(nom)}</small><b>${b.charging ? ico("eclair") : ""}${Math.round(b.battery)} %</b><i class="mp-jauge"><i style="width:${Math.max(0, Math.min(100, b.battery))}%"></i></i></span>`;
  const mpVitrine = (x) => {
    const co = mpCo(x), f = MP_FAMILLES[mpFamille(x.info.name || x.appareils[0]?.name)], bat = co ? mpCap(x).battery || {} : {};
    const piece = (b, nom, p, cl = "") => `<div class="mp-piece${cl}${co && !(b?.status >= 2) ? " hors" : ""}">${b?.status >= 2 ? mpBulle(b, nom) : '<span class="mp-bulle vide"></span>'}${ico(p)}</div>`;
    return `<div class="blk mp-vit${co ? "" : " vide"}">${f.g ? piece(bat.left, T("acces.mp_gauche", "Gauche"), f.g) + piece(bat.case, T("acces.mp_boitier", "Bo\xEEtier"), "ecouteurs-boitier", " boitier") + piece(bat.right, T("acces.mp_droite", "Droite"), f.d) : piece(bat.single?.status >= 2 ? bat.single : bat.left, T("acces.mp_batterie", "Batterie"), f.paire, " seul")}</div>`;
  };
  const mpLigne = (a, p, nom, aide, cap, oui) => `<div class="blk mp-lig${oui ? " oui" : ""}${cap.readonly ? " inactif" : ""}" data-a="main:${a}">${pastille(p)}<span class="sc-t"><b>${esc(nom)}</b><small>${esc(aide)}</small></span><span class="inter"></span></div>`;
  const mpAppareil = (h2) => {
    const p = MP_FAMILLES[mpFamille(h2.name)].paire;
    return `<div class="blk sc-l mp-app" data-a="main:connecter:${esc(h2.address)}">${pastille(p)}<span class="sc-t"><b>${esc(h2.name)}</b><small${h2.connected ? ' class="mp-co"' : ""}>${esc(h2.connected ? T("acces.mp_connectes", "Connect\xE9s") : T("acces.mp_associes", "Associ\xE9s \xE0 la console"))}</small></span>${h2.connected ? "" : scAct(T("acces.mp_connecter", "Connecter"))}</div>`;
  };
  const mpAppareils = (x) => x.appareils.map(mpAppareil).join("") || scVide(T("acces.mp_aucun", "Aucun \xE9couteur associ\xE9 \xE0 la console"));
  const MAIN = {
    PlayTime: {
      lire: (c) => {
        const t = c.querySelector("div.title"), pg = t?.closest(".Panel"), fl = pg ? [...pg.querySelectorAll(":scope > .DialogButton")] : [];
        if (fl.length !== 2) return null;
        const sem = propsDe(c.querySelector(".playtime-chart"), (p) => Array.isArray(p.statistics), 8)?.statistics || null;
        if (!sem && !/Loading/.test(c.textContent)) return null;
        const ao = sectionDe(c, "Average and overall"), vals = ao ? [...ao.querySelectorAll("{{Field@FieldLabel}}")].map((f) => f.textContent.slice((f.querySelector("{{FieldLabel@FieldLeftColumn}}")?.textContent || "").length).trim()) : [];
        const jeux = propsDe(c.querySelector(".games-by-week"), (p) => Array.isArray(p.data), 4)?.data || [];
        const autres = [...sectionDe(c, "Misc")?.querySelectorAll(".DialogButton") || []].filter((b) => b.textContent.trim());
        return { fl, titre: t.textContent.trim(), sem, moy: vals[0], total: vals[1], jeux, autres };
      },
      ongs: () => [T("acces.pt_semaine", "Par semaine"), T("acces.pt_jeux", "Par jeu"), T("acces.pt_autres", "Autres")],
      peindre: (x, ong) => {
        const s = x.sem, du = s?.length ? new Intl.DateTimeFormat(LOCALE(), { day: "numeric", month: "long" }) : null;
        const titre = du ? du.formatRange?.(jourDe(s[0].date), jourDe(s[s.length - 1].date)) || x.titre : x.titre;
        const semaine = blk(`<div class="pager"><span class="rond${inactif(x.fl[0]) ? " inactif" : ""}" data-a="main:prec"><i class="pcv-chevron pcv-retour"></i></span><b>${esc(titre)}</b><span class="rond${inactif(x.fl[1]) ? " inactif" : ""}" data-a="main:suiv"><i class="pcv-chevron"></i></span></div>`, " large");
        const NOMS = { "Detailed report": T("acces.pt_rapport", "Rapport d\xE9taill\xE9"), Settings: T("acces.pt_reglages", "R\xE9glages de PlayTime"), "View Changelog": T("acces.pt_nouveautes", "Nouveaut\xE9s de PlayTime"), "Support on Ko-fi": T("acces.pt_kofi", "Soutenir PlayTime sur Ko-fi") };
        if (ong === 2) return `<div class="main-g c2">${x.autres.map((b, i) => {
          const t = b.textContent.trim();
          return `<div class="blk carte-b" data-a="main:autre:${i}">${esc(NOMS[t] || t)}</div>`;
        }).join("")}</div>`;
        if (!s) return `<div class="main-g c2">${semaine}${blk(`<span class="vide">\u2026</span>`, " large")}</div>`;
        if (ong === 1) {
          const l = [...x.jeux].sort((a, b) => b.totalTime - a.totalTime), max2 = Math.max(1, ...l.map((j) => j.totalTime));
          return `<div class="main-g c2 defile">${semaine}${l.length ? l.map((j, i) => blk(`<div class="jeu" data-a="main:jeu:${i}"><b>${esc(j.game?.name || "")}</b><em>${dureeJeu(j.totalTime)}</em><i class="barre-j"><i style="width:${(100 * j.totalTime / max2).toFixed(1)}%"></i></i></div>`)).join("") : blk(`<span class="vide">${esc(T("acces.pt_aucun", "Aucun jeu cette semaine"))}</span>`, " large")}</div>`;
        }
        const max = Math.max(1, ...s.map((j) => j.total || 0)), auj = (/* @__PURE__ */ new Date()).toDateString();
        const barres2 = s.map((j) => {
          const d2 = jourDe(j.date);
          return `<div class="jour${d2.toDateString() === auj ? " auj" : ""}"><em>${j.total ? dureeJeu(j.total) : ""}</em><span class="fut"><i${j.total ? "" : ' class="nul"'} style="height:${(100 * (j.total || 0) / max).toFixed(1)}%"></i></span><small>${esc(d2.toLocaleDateString(LOCALE(), { weekday: "short" }))}</small></div>`;
        }).join("");
        return `<div class="main-g c2">${semaine}${blk(h5(T("acces.pt_moyenne", "Moyenne par jour")) + `<b class="chiffre">${esc(dureeTexte(x.moy) || "\u2026")}</b>`)}${blk(h5(T("acces.pt_total", "Total")) + `<b class="chiffre">${esc(dureeTexte(x.total) || "\u2026")}</b>`)}${blk(h5(T("acces.pt_par_jour", "Par jour")) + `<div class="barres">${barres2}</div>`, " large")}</div>`;
      },
      agir: (x, v) => {
        const [quoi, n] = v.split(":"), b = quoi === "prec" ? x.fl[0] : quoi === "suiv" ? x.fl[1] : quoi === "autre" ? x.autres[+n] : null;
        if (inactif(b)) return bord();
        b.click();
      }
    },
    "Speed Test": {
      lire: (c) => {
        const m = {};
        for (const el of c.querySelectorAll("div")) {
          const p = propsDe(el, (q) => typeof q.format === "function" && typeof q.label === "string" && "unit" in q, 2);
          if (p) m[p.label] = p;
        }
        if (!m.Download || !m.Upload || !m.Latency) return null;
        const txt = (re) => [...c.querySelectorAll("div")].find((x) => !x.children.length && re.test(x.textContent))?.textContent || "";
        return {
          m,
          b: boutonDe(c, /^(Pause|Resume|Retest)$/),
          courbes: [...c.querySelectorAll("svg")].map((g) => propsDe(g, (q) => Array.isArray(q.points), 2)).filter(Boolean),
          phase: /Testing (latency|download|upload)/.exec(c.textContent)?.[1],
          erreur: /Test failed/.test(c.textContent),
          mesure: txt(/^Measured at /).slice(12)
        };
      },
      peindre: (x) => {
        const L = LOCALE(), nb = (p, v = p?.value) => {
          const t = p ? p.format(v ?? null) : "--";
          return t === "--" || isNaN(+t) ? "--" : (+t).toLocaleString(L, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        };
        const etat2 = x.b?.textContent.trim(), lib = { Pause: T("acces.st_pause", "Pause"), Resume: T("acces.st_reprendre", "Reprendre"), Retest: T("acces.st_relancer", "Relancer le test") }[etat2] || T("acces.st_lancer", "Lancer le test");
        const sous = x.erreur ? T("acces.st_erreur", "Le test a \xE9chou\xE9 : v\xE9rifie la connexion.") : x.phase ? T("acces.st_" + x.phase, x.phase) : x.mesure ? T("acces.st_mesure", "Mesur\xE9 \xE0 {heure}", { heure: x.mesure }) : "";
        const res = (p, unite, nom, sv) => blk(`<b class="chiffre">${nb(p)}</b><small>${esc(unite)} ${esc(nom)}</small>${sv ? `<small class="sv">\u2193 ${nb(p, sv.download)} \u2191 ${nb(p, sv.upload)}</small>` : ""}`, " res");
        const courbe = (q, nom) => {
          const pts = q?.points || [], k = Math.max(1, ...pts), n = Math.max(1, pts.length - 1);
          const l = pts.map((y, i) => `${(100 * i / n).toFixed(2)},${(38 - 34 * y / k).toFixed(2)}`).join(" ");
          return `<div class="courbe"><small>${esc(nom)}</small><svg viewBox="0 0 100 40" preserveAspectRatio="none">${pts.length > 1 ? `<polygon points="0,40 ${l} 100,40"/><polyline points="${l}"/>` : ""}</svg></div>`;
        };
        return `<div class="main-g c4">${blk(`<span class="gros-b${x.b ? "" : " inactif"}" data-a="main:bouton">${esc(lib)}</span>${sous ? `<small class="phase">${esc(sous)}</small>` : ""}`, " large")}` + res(x.m.Download, "Mb/s", T("acces.st_dl", "en t\xE9l\xE9chargement")) + res(x.m.Upload, "Mb/s", T("acces.st_ul", "en envoi")) + res(x.m.Latency, "ms", T("acces.st_ping", "de ping"), x.m.Latency.subValues) + (x.m.Jitter ? res(x.m.Jitter, "ms", T("acces.st_gigue", "de gigue"), x.m.Jitter.subValues) : "") + (x.courbes.length ? blk(`<div class="courbes">${courbe(x.courbes[0], T("acces.st_dl_court", "T\xE9l\xE9chargement"))}${courbe(x.courbes[1], T("acces.st_ul_court", "Envoi"))}</div>`, " large") : "") + "</div>";
      },
      agir: (x, v) => {
        if (v !== "bouton" || inactif(x.b)) return bord();
        x.b.click();
      }
    },
    // (la page : bloc Steamcord ci-dessus ; repeinte par ses données à lui, jamais par son rendu caché : brut, son panneau tel quel s'il le faut)
    [SC]: {
      brut: true,
      // (12/11 soir, l'auteur : RB vers MagicPods laissait notre page) ses données ne viennent pas de son rendu : tant que Decky en montre
      // un autre (le nom du contenu suit un peu plus tard, placerCadre), rien ; et jamais repeinte par-dessus le greffon suivant
      lire: () => {
        if (O.DeckyPluginLoader?.deckyState?._activePlugin?.name !== SC) return null;
        if (sc.cadre !== cadre) scOuvrir();
        return sc.etat === "ok" ? sc.d : sc.etat === "attente" ? { attente: true } : null;
      },
      get y() {
        return scY();
      },
      ongs: (x) => x.attente ? [] : [
        { nom: T("acces.sc_voix", "Voix"), p: "casque" },
        { nom: T("acces.sc_serveurs", "Serveurs"), p: "monde" },
        { nom: T("acces.sc_mp", "MP"), p: "silhouette" },
        { nom: T("acces.sc_evenements", "\xC9v\xE9nements"), p: "calendrier", plus: ((n) => n ? `<span class="sc-direct">${n}</span>` : "")((x.evs || []).filter((v) => v.status === 2).length) }
      ],
      tete: (x) => x.attente ? "" : `<div class="sc-prof" data-a="main:profil"${scY()}>${scAv(scNom(x.st.me), scImg("avatars", x.st.me.id, x.st.me.avatar), x.statut, " grand")}<span class="sc-t"><b>${esc(scNom(x.st.me))}</b><small>${esc(scNomStatut(x.statut))}</small></span></div>`,
      pied: (x) => x.attente ? "" : scGrand(),
      peindre: (x, ong) => {
        if (x.attente) return `<div class="main-g c2">${scVide(T("acces.sc_attente", "Connexion \xE0 Discord\u2026"))}</div>`;
        const me = x.st.me, vc = x.st.vc, ici = vc?.channel_id, nb = (l) => l.length ? `<small class="vert">${esc(T("acces.sc_n_vocal", "{n} en vocal", { n: l.length }))}</small>` : `<small>${esc(T("acces.sc_personne", "Personne en vocal"))}</small>`;
        if (ong === SC_PROFIL) return `<div class="main-g c2">${blk(`<div class="sc-ev">${scAv(scNom(me), scImg("avatars", me.id, me.avatar), x.statut, " grand")}<span class="sc-t"><b>${esc(scNom(me))}</b><small>@${esc(me.username)}</small></span></div>`, " large")}` + scCarte("statut", `<span class="sc-av carre">${ico("silhouette")}</span>`, T("acces.sc_statut", "Statut"), `<small>${esc(scNomStatut(x.statut))}</small>`, scAct(T("acces.sc_changer", "Changer")), " large") + "</div>";
        if (ong === 0) return `<div class="main-g c2">${blk(`<b class="sc-titre">${esc(vc ? vc.channel_name || T("acces.sc_appel", "Appel en cours") : T("acces.sc_pas_appel", "Pas d'appel en cours"))}</b><small class="sc-sous">${esc(vc ? [vc.guild_name, T("acces.sc_n_vocal", "{n} en vocal", { n: Array.isArray(vc.users) ? vc.users.length : 1 })].filter(Boolean).join(", ") : T("acces.sc_pas_appel_aide", "Rejoins un salon dans Serveurs, ou appelle quelqu'un dans MP"))}</small>`, " large")}` + blk(scRond("micro", "micro", me.is_muted ? " coupe" : "") + scRond("casque", "casque", me.is_deafened ? " coupe" : "") + scRond("raccrocher", "raccrocher", vc ? " rouge" : " inactif"), " large sc-voix") + scCarte("grand", "", T("acces.sc_riche", "Appel, soundboard, partage d'\xE9cran"), `<small>${esc(T("acces.sc_riche_aide", "Dans la vue agrandie de Steamcord"))}</small>`, scAct(T("acces.sc_ouvrir", "Ouvrir")), " large") + "</div>";
        if (ong === 1) return `<div class="main-g c2 defile">${x.serveurs.map((g) => {
          const ouvert = sc.ouvert === g.id, qui = g.channels.flatMap((c) => c.members);
          return scCarte("serv:" + g.id, scAv(g.name, scImg("icons", g.id, g.icon), "", " carre"), g.name, nb(qui), scMini(qui) + `<i class="pcv-chevron"></i>`, ouvert ? " ouvert" : "") + (!ouvert ? "" : g.channels.map((c) => scCarte(`salon:${g.id}:${c.id}`, `<span class="sc-av carre">${ico("volume")}</span>`, c.name, nb(c.members), scMini(c.members) + scAct(ici === c.id ? T("acces.sc_tu_y_es", "Tu y es") : T("acces.sc_rejoindre", "Rejoindre"), ici !== c.id), " large sc-salon")).join("") || scVide(T("acces.sc_aucun_salon", "Aucun salon vocal")));
        }).join("") || scVide(T("acces.sc_aucun_serveur", "Aucun serveur"))}</div>`;
        if (ong === 2) return `<div class="main-g c2 defile">${x.mp.map((m) => {
          const r = m.recipients[0], nom = m.name || m.recipients.map(scNom).join(", ") || "?";
          const av = m.recipients.length === 1 ? scAv(nom, scImg("avatars", r.id, r.avatar), r.status || "offline") : scAv(nom, scImg("channel-icons", m.id, m.icon), "", " carre");
          const sous = m.active_call ? `<small class="vert">${esc(T("acces.sc_appel", "Appel en cours"))}</small>` : `<small>${esc(r?.activity?.type === 0 && r.activity.name ? T("acces.sc_en_jeu", "En jeu : {jeu}", { jeu: r.activity.name }) : m.recipients.length === 1 ? scNomStatut(r.status) : T("acces.sc_groupe", "{n} membres", { n: m.recipients.length + 1 }))}</small>`;
          const appel2 = m.active_call ? T("acces.sc_rejoindre", "Rejoindre") : T("acces.sc_appeler", "Appeler");
          return `<div class="blk sc-l sc-mp"><div class="sc-mp-o" data-a="main:mp-ouvrir:${esc(m.id)}" data-a-nom="${esc(T("acces.sc_ouvrir_conv", "Ouvrir la conversation"))}"${scY()}>${av}<span class="sc-t"><b>${esc(nom)}</b>${sous}</span></div><span class="sc-act${m.active_call ? " plein" : ""}" data-a="main:mp-appel:${esc(m.id)}" data-a-nom="${esc(appel2)}"${scY()}>${esc(appel2)}</span></div>`;
        }).join("") || scVide(T("acces.sc_aucun_mp", "Aucun message priv\xE9"))}</div>`;
        if (!x.evs) return `<div class="main-g c2">${scVide(T("acces.sc_ev_attente", "Recherche des \xE9v\xE9nements\u2026"))}</div>`;
        return `<div class="main-g c2 defile">${x.evs.map((v) => {
          const direct = v.status === 2, oui = sc.interet.has(v.id);
          return blk(`<div class="sc-ev">${scAv(v.guild || v.name, "", "", " carre")}<span class="sc-t"><b>${esc(v.name)}</b><small>${esc([v.guild, v.location, v.count ? T("acces.sc_interesses", "{n} int\xE9ress\xE9s", { n: v.count }) : ""].filter(Boolean).join(", "))}</small></span>${direct ? scDirect() : `<small class="sc-quand">${esc(scQuand(v.start))}</small>`}</div>${v.description ? `<p class="sc-desc">${esc(v.description)}</p>` : ""}`, " large") + (direct && v.channel_id ? scCarte("ev-salon:" + v.id, "", T("acces.sc_rejoindre_salon", "Rejoindre le salon"), `<small>${esc(T("acces.sc_rejoindre_aide", "Entre dans le vocal de l'\xE9v\xE9nement"))}</small>`, scAct(T("acces.sc_rejoindre", "Rejoindre"), true)) : "") + scCarte("ev-interet:" + v.id, "", T("acces.sc_interet", "\xC7a m'int\xE9resse"), `<small>${esc(T("acces.sc_interet_aide", "Discord te pr\xE9viendra"))}</small>`, scAct(oui ? "\u2713" : "+", oui));
        }).join("") || scVide(T("acces.sc_aucun_ev", "Aucun \xE9v\xE9nement pr\xE9vu"))}</div>`;
      },
      // (ses actions simples, celles de ses propres boutons ; un refus de sa part : le son du bord)
      agir: (x, v) => {
        const [quoi, a, b] = v.split(":"), fait = (p) => p.catch(() => bord());
        if (x.attente) return bord();
        if (quoi === "profil") {
          son("bouge");
          return choisirOnglet(SC_PROFIL);
        }
        if (quoi === "statut") return liste(e, {
          cle: "sc-statut",
          titre: T("acces.sc_statut", "Statut"),
          p: "silhouette",
          c: "var(--c-decky)",
          choix: SC_STATUTS.map((s) => ({ valeur: s, texte: scNomStatut(s) })),
          lire: () => x.statut,
          ecrire: (s) => fait(scAppel("set_discord_status", s).then(() => {
            if (sc.d) sc.d.statut = s;
            scMaj();
          }))
        });
        if (quoi === "grand") {
          fermer();
          return setTimeout(() => B.ouvrirLanceur("/discord"), 300);
        }
        if (quoi === "micro" || quoi === "casque") return fait(scAppel(quoi === "micro" ? "toggle_mute" : "toggle_deafen"));
        if (quoi === "raccrocher") return x.st.vc ? fait(scAppel("disconnect_vc")) : bord();
        if (quoi === "serv") {
          sc.ouvert = sc.ouvert === a ? null : a;
          son("bouge");
          return scMaj();
        }
        if (quoi === "salon") return x.st.vc?.channel_id === b ? bord() : fait(scAppel("join_vc", b, a));
        if (quoi === "mp-ouvrir") {
          const m = x.mp.find((y) => y.id === a);
          if (!m) return bord();
          fermer();
          setTimeout(() => B.ouvrirLanceur("/discord"), 300);
          return scConversation(m.id, m.name || m.recipients.map(scNom).join(", "));
        }
        if (quoi === "mp-appel") {
          const m = x.mp.find((y) => y.id === a);
          return m ? fait(scAppel("dm_call", m.id, m.active_call).then(() => {
            if (cadre?.main === MAIN[SC]) choisirOnglet(0);
          })) : bord();
        }
        const ev = (x.evs || []).find((y) => y.id === a);
        if (!ev) return bord();
        if (quoi === "ev-salon") return fait(scAppel("join_vc", ev.channel_id, ev.guild_id));
        if (quoi === "ev-interet") {
          const oui = !sc.interet.has(ev.id);
          return fait(scAppel("set_event_interest", ev.guild_id, ev.id, oui).then(() => {
            sc.interet[oui ? "add" : "delete"](ev.id);
            scMaj();
          }));
        }
        bord();
      }
    },
    // (la page : bloc MagicPods ci-dessus ; repeinte par les données de son moteur, jamais par son rendu caché)
    [MP]: {
      lire: () => {
        if (O.DeckyPluginLoader?.deckyState?._activePlugin?.name !== MP) return null;
        if (mp.cadre !== cadre) mpOuvrir();
        return mp.etat === "ok" ? mp.d : mp.etat === "attente" ? { attente: true } : null;
      },
      x: (x) => !x.attente && mpCo(x) && mpModes(x).length > 1 ? T("acces.mp_suivant", "Mode suivant") : "",
      ongs: (x) => x.attente ? [] : [{ nom: T("acces.mp_ecouteurs", "\xC9couteurs"), p: "casque" }, { nom: T("acces.mp_son", "Son et micro"), p: "micro" }, { nom: T("acces.mp_bluetooth", "Bluetooth"), p: "bluetooth" }],
      // (les écouteurs en tête, à regarder seulement : rien à choisir ; leur nom et s'ils sont connectés)
      tete: (x) => {
        if (x.attente) return "";
        const co = mpCo(x);
        return `<div class="sc-prof mp-prof">${pastille(MP_FAMILLES[mpFamille(x.info.name || x.appareils[0]?.name)].paire)}<span class="sc-t"><b>${esc(co ? x.info.name : T("acces.mp_pas_ecouteurs", "Pas d'\xE9couteurs"))}</b><small${co ? ' class="mp-co"' : ""}>${esc(co ? T("acces.mp_connectes", "Connect\xE9s") : T("acces.mp_non_connectes", "Non connect\xE9s"))}</small></span></div>`;
      },
      pied: (x) => {
        if (x.attente) return "";
        const g = greffons().find((p) => p.name === MP);
        return `<button class="bouton sc-grand mp-reglages" data-a="main:reglages">${g ? icone(g) : ""}<b>${esc(T("acces.mp_reglages", "R\xE9glages de MagicPods"))}</b></button>`;
      },
      peindre: (x, ong) => {
        if (x.attente) return `<div class="main-g c2">${scVide(T("acces.mp_attente", "Connexion \xE0 MagicPods\u2026"))}</div>`;
        const co = mpCo(x), c = mpCap(x), page = (corps) => `<div class="main-g mp"><div class="mp-g">${corps}</div>${mpVitrine(x)}</div>`;
        if (ong === 2) return page(mpAppareils(x));
        if (!co) return page(ong === 1 ? scVide(T("acces.mp_d_abord", "Connecte tes \xE9couteurs d'abord")) : blk(`<b class="sc-titre">${esc(T("acces.mp_nc_titre", "Tes \xE9couteurs ne sont pas connect\xE9s"))}</b><small class="sc-sous">${esc(T("acces.mp_nc_aide", "Choisis-les ci-dessous."))}</small>`) + mpAppareils(x));
        if (ong === 1) return page((c.highResolutionMicrophone ? mpLigne("microhd", "micro", T("acces.mp_micro_hd", "Micro HD"), T("acces.mp_micro_hd_aide", "Ta voix en meilleure qualit\xE9"), c.highResolutionMicrophone, c.highResolutionMicrophone.selected) : "") + (c.conversationAwareness ? mpLigne("conversation", "conversation", T("acces.mp_conversation", "Conversation"), T("acces.mp_conversation_aide", "Baisse le son quand tu parles"), c.conversationAwareness, c.conversationAwareness.selected.enabled) : "") || scVide(T("acces.mp_rien", "Rien \xE0 r\xE9gler sur ces \xE9couteurs")));
        const m = mpModes(x), sel = c.anc?.selected;
        return page((m.length ? blk(`<b class="sc-titre">${esc(T("acces.mp_bruit", "Contr\xF4le du bruit"))}</b><div class="mp-modes">${m.map(([v, k, cle, f]) => `<div class="mp-md"><span class="rond mp-rd${v === sel ? " choisi" : ""}${c.anc.readonly ? " inactif" : ""}" data-a="main:anc:${v}">${ico("bruit-" + k)}</span><small>${esc(T("acces." + cle, f))}</small></div>`).join("")}</div>`) : "") + (c.earDetection ? mpLigne("oreille", "oreille", T("acces.mp_oreille", "D\xE9tection d'oreille"), T("acces.mp_oreille_aide", "Pause quand tu en retires un"), c.earDetection, c.earDetection.selected.pauseMedia) : "") || scVide(T("acces.mp_rien", "Rien \xE0 r\xE9gler sur ces \xE9couteurs")));
      },
      // (ses commandes, celles de sa propre page : le changement montré tout de suite, comme chez lui, puis confirmé par sa diffusion)
      agir: (x, v) => {
        const [quoi, a] = v.split(/:(.*)/), c = x.attente ? {} : mpCap(x);
        if (x.attente) return bord();
        if (quoi === "reglages") {
          mp.etat = "leur";
          mpFermer();
          son("bouge");
          return mpMaj();
        }
        if (quoi === "connecter") {
          const h2 = x.appareils.find((y) => y.address === a);
          if (!h2 || h2.connected || !mpEnvoyer("ConnectDevice", { address: a })) return bord();
          return son("bouge");
        }
        const poser = (cap, sel) => {
          if (!mpEnvoyer("SetCapabilities", { address: x.info.address, capabilities: { [cap]: { selected: sel } } })) return bord();
          c[cap].selected = sel;
          mpMaj();
        };
        if (!mpCo(x)) return bord();
        if (quoi === "anc" || quoi === "x") {
          const l = mpModes(x).map((m) => m[0]), s = c.anc?.selected;
          if (!c.anc || c.anc.readonly || !l.length) return bord();
          const n = quoi === "x" ? l.find((m) => m > s) ?? l[0] : +a;
          if (n === s) return;
          return l.includes(n) && l.length > 1 ? poser("anc", n) : bord();
        }
        const t = { oreille: ["earDetection", (s) => ({ ...s, pauseMedia: !s.pauseMedia })], microhd: ["highResolutionMicrophone", (s) => !s], conversation: ["conversationAwareness", (s) => ({ ...s, enabled: !s.enabled })] }[quoi];
        if (!t || !c[t[0]] || c[t[0]].readonly) return bord();
        poser(t[0], t[1](c[t[0]].selected));
      }
    }
  };
  const morph = (a, b) => {
    if (a.nodeName !== b.nodeName || a.childNodes.length !== b.childNodes.length) return a.replaceWith(b);
    if (a.nodeType === 3) {
      if (a.data !== b.data) a.data = b.data;
      return;
    }
    if (a.nodeType !== 1) return;
    for (const { name, value } of [...b.attributes]) if (name !== "class" && a.getAttribute(name) !== value) a.setAttribute(name, value);
    for (const { name } of [...a.attributes]) if (name !== "class" && !b.hasAttribute(name)) a.removeAttribute(name);
    const f = a.classList.contains("f");
    if (a.className !== b.className) {
      a.className = b.className;
      if (f) a.classList.add("f");
    }
    const kids = [...b.childNodes];
    [...a.childNodes].forEach((k, i) => morph(k, kids[i]));
  };
  const marquerOnglet = () => {
    const col = colonneG(), l = col.querySelectorAll(".onglet");
    l.forEach((b, i) => b.classList.toggle("choisi", i === cadre?.ong));
    col.querySelector(".sc-prof")?.classList.toggle("choisi", cadre?.ong === l.length);
  };
  const peindreMain = () => {
    const M = cadre?.main, x = cadre?.mainLu;
    if (!M || !x) return;
    const col = colonneG(), noms2 = M.ongs?.(x) || [], hc = (M.tete?.(x) || "") + noms2.map((n, i) => `<button class="bouton onglet" data-a="ong:${i}"${M.y || ""}>${n.p ? pastille(n.p) : ""}<span><b>${esc(n.nom ?? n)}</b></span>${n.plus || ""}</button>`).join("") + (M.pied?.(x) || "");
    if (col.__pcvVu !== hc) {
      col.__pcvVu = hc;
      col.innerHTML = hc;
      col.hidden = !noms2.length;
    }
    marquerOnglet();
    const boite = e.$(".cadre-boite"), t = d.createElement("template");
    t.innerHTML = M.peindre(x, cadre.ong);
    const avant = e.focus(), a = avant?.dataset.a, vieux = boite.firstElementChild;
    if (vieux?.classList.contains("main-g")) morph(vieux, t.content.firstElementChild);
    else boite.replaceChildren(t.content);
    if (cadre.mainNeuf || !avant?.isConnected) {
      cadre.mainNeuf = false;
      e.poser(a && boite.querySelector(`[data-a="${CSS.escape(a)}"]`) || col.querySelector(".choisi") || boite.querySelector("[data-a]"));
    }
  };
  const main = (c) => {
    const M = MAIN[c.dataset.pcvGreffon];
    let x = null;
    try {
      x = M?.lire(c);
    } catch (er) {
      x = null;
    }
    const lx = x && M.x?.(x);
    e.racine.classList.toggle("leg-x", !!lx);
    if (lx) e.$(".x-txt").textContent = lx;
    c.toggleAttribute("data-pcv-main", !!x);
    if (!x) {
      if (cadre.main) {
        cadre.main = cadre.mainLu = null;
        e.$(".cadre-boite").replaceChildren();
        colonneG().__pcvVu = null;
        colonneG().hidden = true;
        requestAnimationFrame(placerCadre);
      }
      return false;
    }
    if (!cadre.main) {
      Object.assign(cadre, { main: M, ong: 0, mainNeuf: true });
      c.removeAttribute("data-pcv-ailleurs");
    }
    cadre.mainLu = x;
    peindreMain();
    return true;
  };
  const agirMain = (v) => {
    try {
      cadre?.main?.agir(cadre.mainLu, v);
    } catch (x) {
      bord();
    }
  };
  const SECTION = "{{PanelSection@PanelSectionTitle}}", TITRE_S = "{{PanelSectionTitle@PanelSectionRow}}";
  const CHAMP = "{{Field@FieldLabel}}", LIB_D = "{{FieldLabel@FieldLeftColumn}}, {{FieldDescription@FieldLabel}}", LISTE_D = "{{DropDownControlButton@DropDownControlButton}}";
  const colonneG = () => e.$('[data-sous="cadre"] .colonne');
  const ongletsSteam = (c) => {
    const b = c.querySelector('[role="tablist"]'), l = b ? [...b.querySelectorAll('[role="tab"]')] : [];
    if (l.length < 2) return null;
    let tete = b;
    while (tete.parentElement && tete.parentElement !== c && !tete.parentElement.querySelector(':scope > [role="tabpanel"], :scope > * [role="tabpanel"]')) tete = tete.parentElement;
    const nom = (t, i) => {
      const id = (t.getAttribute("aria-controls") || "").replace(/_Content$/, "").replace(/^«[^»]*»/, "");
      return t.textContent.trim() || (id ? T("acces.onglet_" + id, id.charAt(0).toUpperCase() + id.slice(1)) : String(i + 1));
    };
    return { tete, ongs: l.map((t, i) => ({ nom: nom(t, i), els: [], tab: t })), actif: Math.max(0, l.findIndex((t) => t.getAttribute("aria-selected") === "true")) };
  };
  const ranger = (c) => {
    const ongs = [], general = T("acces.greffon_general", "G\xE9n\xE9ral"), barre = ongletsSteam(c);
    c.toggleAttribute("data-pcv-barre", !!barre);
    if (barre) {
      barre.tete.setAttribute("data-pcv-cache", "");
      ongs.push(...barre.ongs);
    }
    for (const s of c.querySelectorAll(SECTION)) {
      if (s.parentElement.closest(SECTION)) continue;
      s.setAttribute("data-pcv-cartes", "");
      if (barre) {
        s.querySelectorAll(SECTION).forEach((n) => n.setAttribute("data-pcv-cartes", ""));
        continue;
      }
      const nom = s.querySelector(`:scope > ${TITRE_S}`)?.textContent.trim() || general;
      const parts = [
        ...[...s.querySelectorAll(".DialogButton[data-pcv-repli]")].map((b) => b.__pcvRepli).filter((x) => x?.r.parentElement === s).map((x) => ({ nom: x.b.dataset.pcvRepli, els: [x.t, x.r, ...x.dans], repli: x })),
        ...[...s.querySelectorAll(`:scope > ${SECTION}`)].map((n) => (n.setAttribute("data-pcv-cartes", ""), { nom: n.querySelector(`:scope > ${TITRE_S}`)?.textContent.trim() || general, els: [n] }))
      ];
      if (!parts.length) {
        ongs.push({ nom, els: [s] });
        continue;
      }
      const pris = new Set(parts.flatMap((x) => x.els)), avant = [...s.children].filter((x) => !pris.has(x) && x.tagName !== "STYLE" && !x.matches(TITRE_S));
      if (avant.length) ongs.push({ nom, els: avant });
      ongs.push(...parts);
    }
    const plusieurs = ongs.length > 1;
    if (cadre.pour !== cadre.titre) Object.assign(cadre, { pour: cadre.titre, ong: barre?.actif || 0, zone: cadre.zone === "bande" ? "bande" : null, colonneVue: false });
    if (plusieurs && !cadre.colonneVue) Object.assign(cadre, { colonneVue: true, zone: cadre.zone === "bande" ? "bande" : "onglets" });
    if (!plusieurs && cadre.zone === "onglets") Object.assign(cadre, { zone: null, colonneVue: false });
    cadre.ong = Math.min(cadre.ong, Math.max(0, ongs.length - 1));
    cadre.ongs = ongs;
    ongs.forEach((o, i) => {
      for (const x of o.els) x.toggleAttribute("data-pcv-cache", plusieurs && i !== cadre.ong);
    });
    const r = plusieurs && ongs[cadre.ong].repli;
    if (r) {
      const ouvert = r.b.hasAttribute("data-pcv-ouvert");
      r.r.toggleAttribute("data-pcv-cache", ouvert);
      if (!ouvert && cadre.ouvre !== r.b) {
        cadre.ouvre = r.b;
        r.b.click();
      }
    }
    const t = barre && ongs[cadre.ong]?.tab;
    if (t && t.getAttribute("aria-selected") !== "true" && cadre.ouvre !== t) {
      cadre.ouvre = t;
      t.click();
    }
    const seul = (x) => x?.matches(RANG) && [...x.querySelectorAll(COMMANDE)].filter((y) => !y.querySelector(COMMANDE)).length === 1 && !!x.querySelector(".DialogButton");
    for (const s of c.querySelectorAll("[data-pcv-cartes]")) {
      const v = [...s.children].filter((x) => x.tagName !== "STYLE" && !x.hasAttribute("data-pcv-cache") && !x.matches(TITRE_S));
      v.forEach((x, i) => x.toggleAttribute("data-pcv-large", !x.matches(RANG) || !!texteSeul(x) || !!x.querySelector("canvas, img, svg[preserveAspectRatio]") || seul(x) && !seul(v[i - 1]) && !seul(v[i + 1])));
      v.forEach((x, i) => {
        const n = v[i + 1], titre = texteSeul(x), apres = v[i + 2];
        const tete = !!titre && titre.length <= 40 && !x.querySelector(CHAMP) && !!n?.matches(RANG) && !texteSeul(n) && !!n.querySelector(COMMANDE) && (!apres || !!texteSeul(apres) || !apres.matches(RANG));
        x.toggleAttribute("data-pcv-tete-prise", tete);
        if (tete && n.dataset.pcvTete !== titre) n.dataset.pcvTete = titre;
        const b = x.matches(RANG) ? [...x.querySelectorAll(".DialogButton")] : [];
        x.toggleAttribute("data-pcv-pas", b.length === 2 && /^[−–-]$/.test(b[0].textContent.trim()) && b[1].textContent.trim() === "+");
      });
    }
    for (const f2 of c.querySelectorAll(CHAMP)) {
      const propre = (s) => [...f2.querySelectorAll(s)].filter((x) => x.closest(CHAMP) === f2).map((x) => x.textContent).join("").trim();
      f2.toggleAttribute("data-pcv-sans-cadre", !!f2.querySelector(CHAMP) || !propre(LIB_D) && !!f2.querySelector(".DialogButton") && !f2.querySelector(LISTE_D));
    }
    const pc2 = c.dataset.pcvGreffon === MP && mp.etat === "leur" && mpPc() ? `<button class="bouton onglet onglet-g" data-a="mppc"><span><b>${esc(T("acces.mp_pc", "MagicPods pour PC"))}</b></span></button>` : "";
    const h2 = plusieurs ? ongs.map((o, i) => `<button class="bouton onglet onglet-g${i === cadre.ong ? " choisi" : ""}" data-a="ong:${i}"><span><b>${esc(o.nom)}</b></span></button>`).join("") + pc2 : "";
    const col = colonneG();
    if (h2 !== col.__pcvVu) {
      col.__pcvVu = h2;
      col.innerHTML = h2;
      c.toggleAttribute("data-pcv-onglets", plusieurs);
      if (col.hidden === plusieurs) {
        col.hidden = !plusieurs;
        requestAnimationFrame(placerCadre);
      }
      col.querySelector(".choisi")?.scrollIntoView({ block: "nearest" });
      if (cadre.zone === "onglets") e.poser(col.querySelector(".choisi"));
    }
    const f = c.querySelector(".gpfocus");
    if (f && !f.getClientRects().length) prendre(premiere(c));
    c.toggleAttribute("data-pcv-ailleurs", !!cadre.zone);
  };
  const choisirOnglet = (i) => {
    if (cadre?.main) {
      if (i !== cadre.ong) {
        cadre.ong = i;
        peindreMain();
      }
      return;
    }
    const c = contenu();
    if (!c || !cadre?.ongs?.[i]) return bord();
    if (i === cadre.ong) return;
    cadre.ong = i;
    son("bouge");
    c.scrollTop = 0;
    ranger(c);
  };
  const versOnglets = (c) => {
    lacherJauge();
    cadre.zone = "onglets";
    son("bouge");
    colonneG().__pcvVu = null;
    ranger(c);
  };
  const versBande = (c) => {
    lacherJauge();
    cadre.zone = "bande";
    son("bouge");
    e.poser(e.$(".bande-g .tuile-c.on"));
    c.setAttribute("data-pcv-ailleurs", "");
  };
  const RETOUR_G = /^(back|go back|retour|zurück|atrás|volver|indietro|voltar|terug|wstecz|назад|返回|戻る|뒤로)$/i;
  const retourGreffon = (c) => {
    const r = [...c.querySelectorAll(".DialogButton")].find((x) => x.getClientRects().length && !x.closest("{{Title@QuickAccessMenu}}") && RETOUR_G.test(x.textContent.trim()));
    if (!r) return false;
    son("bouge");
    r.click();
    return true;
  };
  const surcouche = () => [...d.querySelectorAll("{{BasicContextMenuContainer@contextMenuContents}}, {{GamepadDialogContent@ModalPosition}}")].some((x) => x.getClientRects().length);
  const premiere = (c) => {
    const l = commandes(c);
    return l.find((x) => !x.closest("{{Title@QuickAccessMenu}}")) || l[0];
  };
  const versCartes = (c) => {
    const p = premiere(c);
    if (!p) return bord();
    cadre.zone = null;
    e.poser(null);
    son("bouge");
    prendre(p);
    ranger(c);
  };
  let suiviGreffon = null;
  const suivreGreffon = (c) => {
    if (suiviGreffon?.c === c) return;
    suiviGreffon?.disconnect();
    let t = 0;
    const relire = () => {
      if (!cadre || cadre.main?.brut) return;
      if (main(c) || MAIN[c.dataset.pcvGreffon]?.brut) return;
      replis(c);
      ADAPTER[c.dataset.pcvGreffon]?.(c);
      ranger(c);
    };
    suiviGreffon = new MutationObserver(() => {
      cancelAnimationFrame(t);
      t = requestAnimationFrame(relire);
    });
    suiviGreffon.c = c;
    suiviGreffon.observe(c, { childList: true, subtree: true, characterData: true });
    relire();
  };
  const garderGreffon = () => {
    const nom = cadre?.onglet === 999 && !cadre.panne && cadre.titre;
    if (!nom) return;
    const vue = () => {
      try {
        return [...principale().m_BrowserWindow.document.querySelectorAll(".ModalOverlayContent.active")].some((x) => x.getClientRects().length);
      } catch (x) {
        return false;
      }
    };
    let n = 0;
    const voir = () => {
      if (vue()) O.__pcvPluginAouvrir = nom;
      else if (++n < 6) setTimeout(voir, 100);
    };
    voir();
  };
  const fermerCadre = () => {
    if (!cadre) return false;
    panne(null);
    cadre = null;
    mpFermer();
    mp.cadre = null;
    e.racine.classList.remove("leg-x");
    colonneG().hidden = true;
    colonneG().__pcvVu = null;
    suiviGreffon?.disconnect();
    suiviGreffon = null;
    delete h.dataset.pcvPeCadre;
    e.racine.classList.remove("en-cadre");
    legendeGreffons(false);
    const t = d.querySelector("[data-pcv-greffon-tiers]");
    t?.removeAttribute("data-pcv-greffon-tiers");
    t?.removeAttribute("data-pcv-greffon");
    t?.removeAttribute("data-pcv-main");
    for (const n of ["l", "t", "w", "h", "z", "k"]) h.style.removeProperty("--pcv-cadre-" + n);
    return true;
  };
  const quitterCadre = () => {
    const t = cadre?.titre, depuis = cadre?.depuis;
    if (!fermerCadre()) return false;
    e.fermerVoile(e.$('[data-sous="cadre"]'));
    if (depuis?.closest("[data-panneau]")) {
      e.poser(depuis);
      return true;
    }
    const g = [...e.racine.querySelectorAll('[data-sous="decky"] [data-a^="greffon:"]')].find((x) => x.dataset.a === "greffon:" + t);
    if (g && !g.closest("[hidden]")) e.poser(g);
    else e.premier();
    return true;
  };
  const suivreDecky = () => {
    if (cadre?.onglet === 999 && !cadre.panne && !O.DeckyPluginLoader?.deckyState?._activePlugin) return quitterCadre();
    peindreDecky();
    if (e.$('[data-sous="decky"]').hidden || e.enRangement()) return;
    const f = e.focus()?.dataset.a;
    peindreListe();
    if (cadre) peindreCarrousel();
    else if (f?.startsWith("greffon:")) e.poser(e.$(`.liste-greffons [data-a="${CSS.escape(f)}"]`) || e.$(".liste-greffons [data-a]") || e.$('[data-sous="decky"] [data-a]'));
  };
  O.DeckyPluginLoader?.deckyState?.eventBus?.addEventListener("update", suivreDecky);
  const sousOuvert = () => [...e.racine.querySelectorAll(".sousecran")].filter((s) => !s.hidden).pop()?.dataset.sous || null;
  const ouvrirSous = (cle) => {
    const s = e.$(`[data-sous="${cle}"]`);
    if (!s.hidden) return;
    peindreBascules();
    e.ouvrirVoile(s);
  };
  let panneauRapide = null;
  const montrerPanneau = (cle) => {
    if (cle === panneauRapide) return;
    panneauRapide = cle;
    for (const p of e.racine.querySelectorAll("[data-panneau]")) p.hidden = p.dataset.panneau !== cle;
    e.$(".bascules").hidden = e.$(".lecteur-slot").hidden = !!cle;
  };
  const suivrePanneau = (el) => {
    if (sousOuvert() || el?.closest(".voile")) return;
    montrerPanneau(el?.dataset.panneauLien || el?.closest("[data-panneau]")?.dataset.panneau || null);
  };
  const lignePanneau = (cle) => e.$(`[data-panneau-lien="${cle}"]`);
  const premierPanneau = (cle) => e.$(`[data-panneau="${cle}"] [data-a]`);
  const peindreBascules = () => {
    for (const t of e.racine.querySelectorAll("[data-b]")) {
      const b = BASCULES[t.dataset.b];
      if (!b) continue;
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
      t.classList.toggle("indispo", !!b.indispo?.());
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
    for (const b of e.racine.querySelectorAll("[data-audio]")) {
      const sens = b.dataset.audio === "entree" ? ENTREE : SORTIE, x = appareil(sens);
      b.querySelector(".pastille").innerHTML = ico(sens === ENTREE ? "micro" : x?.eConnectorType === 4 ? "casque" : x?.eBus === 2 ? "bluetooth" : x?.bSupportsHdmiCec ? "ecran" : "volume");
      b.querySelector(".sortie-nom").textContent = x ? x.GetName(directionAudio(sens)) : T("acces.audio_absent", "Aucun appareil");
    }
  };
  const peindreDecky = () => {
    const r = e.$(".greffons-r"), h2 = greffons().slice(0, 3).map((p) => `<span class="greffon" data-a="greffon:${esc(p.name)}">${esc(p.name)}</span>`).join("");
    if (r.__pcvVu !== h2) {
      r.__pcvVu = h2;
      r.innerHTML = h2;
    }
    ajusterDecky();
  };
  const ajusterDecky = () => {
    const l = [...e.$(".greffons-r").children];
    for (const g of l) g.style.display = "";
    for (let i = l.length - 1; i > 0 && l.slice(0, i + 1).some((g) => g.scrollWidth > g.clientWidth); i--) l[i].style.display = "none";
  };
  const peindrePerf = () => {
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
    if (b.indispo?.()) return bord();
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
    if (k === "eco") {
      try {
        principale().m_BrowserWindow.__pcvParametres?.ouvrirEco?.();
      } catch (x) {
      }
      return fermer();
    }
    const page = { internet: "Internet", avion: "Internet", nuit: "Display" }[k];
    if (page) {
      B.navigate(page);
      fermer();
    }
  };
  const carteVoisine = (de, l, dx, dy) => {
    const a = de.getBoundingClientRect();
    let mieux = null, score = Infinity;
    for (const x of l) {
      const b = x.getBoundingClientRect();
      if (!b.width) continue;
      const loin = dx > 0 ? b.left - a.right : dx < 0 ? a.left - b.right : dy > 0 ? b.top - a.bottom : a.top - b.bottom;
      if (loin < -8) continue;
      const cote = dx ? Math.max(0, b.top - a.bottom, a.top - b.bottom) : Math.max(0, b.left - a.right, a.left - b.right);
      const s = Math.max(0, loin) + 2.2 * cote + 0.01 * Math.abs(dx ? b.top + b.bottom - a.top - a.bottom : b.left + b.right - a.left - a.right);
      if (s < score) {
        score = s;
        mieux = x;
      }
    }
    return mieux;
  };
  let jauge = null;
  const lacherJauge = () => {
    jauge?.removeAttribute("data-pcv-regle");
    jauge = null;
  };
  const defiler = (c, sens) => c.scrollBy({ top: sens * c.clientHeight * 0.6, behavior: "smooth" });
  const toucheJauge = (ev) => {
    const b = ev.detail?.button, c = cadre && !cadre.panne && !cadre.main && contenu(), tiers = !!c?.hasAttribute("data-pcv-greffon-tiers");
    const stop = () => {
      ev.stopImmediatePropagation();
      ev.preventDefault();
    }, fleche = b >= 9 && b <= 12;
    if (tiers && b === 2 && (retourMp() || retourGreffon(c))) return stop();
    if (tiers && cadre.zone && (fleche || b === 1) && e.montrer()) return stop();
    if (tiers && cadre.zone === "bande") {
      if (b === 9) bord();
      else if (b === 1 || b >= 10 && b <= 12) rangeeG().dans(b);
      else return;
      return stop();
    }
    const pc2 = tiers && colonneG().querySelector('[data-a="mppc"]');
    if (pc2 && cadre.zone === "mppc") {
      if (b === 9 || b === 2) versOnglets(c);
      else if (b === 1) mpPcOuvrir();
      else if (b === 12) versCartes(c);
      else if (fleche) bord();
      else return;
      return stop();
    }
    if (pc2 && cadre.zone === "onglets" && b === 10 && cadre.ong === cadre.ongs.length - 1) {
      cadre.zone = "mppc";
      son("bouge");
      e.poser(pc2);
      return stop();
    }
    if (tiers && cadre.zone === "onglets") {
      if (b === 9 && !cadre.ong) versBande(c);
      else if (b === 9 || b === 10) choisirOnglet(cadre.ong + (b === 10 ? 1 : -1));
      else if (b === 12 || b === 1) versCartes(c);
      else if (fleche) bord();
      else return;
      return stop();
    }
    const f = tiers && c.querySelector(".gpfocus"), champ = f ? f.closest("{{Field@FieldLabel}}") : null, curseur2 = champ?.querySelector("{{SliderControl@SliderTrack}}") ? champ : null;
    if (jauge && jauge !== curseur2) lacherJauge();
    if (jauge) {
      if (b === 11 || b === 12) return;
      lacherJauge();
      if (b === 1 || b === 2) return stop();
    } else if (curseur2 && b === 1) {
      jauge = curseur2;
      curseur2.setAttribute("data-pcv-regle", "");
      return stop();
    }
    if (tiers && b === 2 && cadre.ongs?.length > 1) {
      stop();
      return versOnglets(c);
    }
    if (!f || !fleche) return;
    stop();
    const dx = b === 11 ? -1 : b === 12 ? 1 : 0, dy = b === 9 ? -1 : b === 10 ? 1 : 0, l = commandes(c), carte = (x) => x.closest("[data-pcv-cartes] > *") || x, ici = carte(f);
    let v = voisin(f, l.filter((x) => carte(x) === ici), dx, dy);
    if (!v) {
      const k = carteVoisine(ici, [...new Set(l.map(carte))].filter((x) => x !== ici), dx, dy);
      v = k && l.find((x) => carte(x) === k);
    }
    if (v) {
      son("bouge");
      prendre(v);
    } else if (dx < 0 && cadre.ongs?.length > 1) versOnglets(c);
    else if (dy < 0 && c.scrollTop < 2) versBande(c);
    else if (dy) defiler(c, dy);
    else bord();
  };
  window.addEventListener("vgp_onbuttondown", toucheJauge, true);
  const e = ecran({
    id: "pcv-ar",
    html,
    premier: '.curseur[data-curseur="lum"]',
    retour: fermer,
    photo: true,
    ranger: rangerGreffon,
    options: optionsGreffon,
    agir: (k, v, el) => {
      if (k === "curseur") return e.auDoigt() ? void 0 : regler(regle === el ? null : el);
      if (k === "sous") return { batt: ouvrirBatt, decky: ouvrirDecky }[v]?.();
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
      if (k === "ong") return choisirOnglet(+v);
      if (k === "mppc") return mpPcOuvrir();
      if (k === "main") return agirMain(v);
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
      if (k === "wifichamp") return saisirWifi();
      if (k === "wifiafficher") return afficherWifi();
      if (k === "wificonnecter") return connecterWifi();
      if (k === "wificancel") return fermerWifi();
      if (k === "wifioublier") return oublierWifi();
      if (k === "wifi") {
        const a = reseau().accessPoints?.find((x) => x.key === v);
        if (a) return ouvrirWifid(a);
      }
      if (k === "greffon") return cadre ? changerGreffon(v) : ouvrirPlugin(v);
      if (k === "greffon-pas") return pasGreffon(+v);
      if (k === "boutique") {
        fermer();
        O.__pcvAller?.("accueil");
        return setTimeout(() => {
          try {
            principale().m_BrowserWindow.__pcvBoutique?.ouvrirPlugin(null);
          } catch (x) {
          }
        }, 400);
      }
      if (k === "decky-reglages") {
        O.__pcvRetourDecky = B.page();
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
            const W = principale(), V = W.VirtualKeyboardManager;
            if (O.SteamUIStore.RunningApps.length) {
              V.SetVirtualKeyboardHidden();
              W.NavigateWithoutChangingFocus("/keyboard", true, true);
            } else (V.SetVirtualKeyboardVisible || V.ShowVirtualKeyboard).call(V);
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
      if (cadre?.main && el?.dataset.a?.startsWith("ong:")) choisirOnglet(+el.dataset.a.slice(4));
      suivrePanneau(el);
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
      if (!sousOuvert() && !el.closest(".voile")) {
        if (dx > 0 && el.dataset.panneauLien) return premierPanneau(el.dataset.panneauLien);
        const p = el.closest("[data-panneau]");
        if (p) {
          if (dx < 0) return lignePanneau(p.dataset.panneau);
          if (dx > 0) return null;
          const lignes = [...p.querySelectorAll("[data-a]")], i = lignes.indexOf(el);
          return lignes[i + dy] || null;
        }
      }
      if (dy < 0 && cadre && el === colonneG().querySelector("[data-a]")) return e.$(".bande-g .tuile-c.on") || void 0;
      if (dx && cadre?.main && el.parentElement === colonneG()) return dx < 0 ? null : voisin(el, [...e.$(".cadre-boite").querySelectorAll("[data-a]")], dx, 0) || null;
      if (dx && cadre?.main && el.closest(".cadre-boite")) {
        const v = voisin(el, [...e.$(".cadre-boite").querySelectorAll("[data-a]")], dx, 0);
        return v || (dx > 0 ? null : void 0);
      }
      if (dy > 0 && cadre && el.matches(".bande-g .tuile-c") && !colonneG().hidden) return colonneG().querySelector("[data-a]") || void 0;
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
      if (!sousOuvert() && dx && el.closest(".decky")) {
        const l = [...el.closest(".decky").querySelectorAll("[data-a]")].filter((x) => x.getBoundingClientRect().width), i = l.indexOf(el);
        return l[i + dx] || (dx > 0 ? null : void 0);
      }
      if (!sousOuvert() && dy > 0 && /^bascule:(npd|nuit)$/.test(a)) return d.querySelector('#pcv-ar [data-a="lect:page"]') || null;
      if (dy < 0 && a === "sous:decky") return d.querySelector('#pcv-ar [data-a="lect:page"]') || null;
      if (!sousOuvert() && (dy > 0 && el.dataset.curseur === "vol" || dy < 0 && el.closest(".decky"))) return e.$('[data-a="clavier"]') || void 0;
      if (dy < 0 && a === "lect:page") {
        const r = el.getBoundingClientRect(), cx = r.left + r.width / 2;
        return [...d.querySelectorAll("#pcv-ar .bascules .bascule")].slice(3).sort((x, y) => Math.abs(x.getBoundingClientRect().left + x.getBoundingClientRect().width / 2 - cx) - Math.abs(y.getBoundingClientRect().left + y.getBoundingClientRect().width / 2 - cx))[0] || null;
      }
      return void 0;
    },
    // B : sort d'abord du réglage d'un curseur, puis du cadre (rend la fenêtre de Steam à sa place), puis du sous-menu
    avantRetour: () => {
      if (wifiFenetre && e.$(".voile.confirme").hidden) {
        fermerWifi();
        return true;
      }
      if (regle) {
        const p2 = regle.closest("[data-panneau]");
        regler(null);
        if (p2) e.poser(lignePanneau(p2.dataset.panneau));
        return true;
      }
      const p = e.focus()?.closest("[data-panneau]");
      if (p && !sousOuvert() && !e.$(".voile:not([hidden])")) {
        e.poser(lignePanneau(p.dataset.panneau));
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
      const vl = cadre && e.$(".voile.liste:not([hidden])");
      if (vl) {
        const de = vl.__pcvDepuis, a = de?.dataset.a;
        e.fermerVoile(vl);
        e.poser(de?.isConnected && de || a && e.$(`[data-sous="cadre"] [data-a="${CSS.escape(a)}"]`) || colonneG().querySelector(".choisi"));
        return true;
      }
      const og = cadre?.main && !colonneG().hidden && e.focus()?.closest(".cadre-boite") && colonneG().querySelector(".choisi");
      if (og) {
        e.poser(og);
        return true;
      }
      return quitterCadre();
    },
    // dans le cadre, les touches vont au contenu de Steam (sa navigation), sauf B et ses changements d'onglet (LB RB LT RT :
    // touche() ci-dessous : d'un greffon à l'autre, sinon le son du bord ; B ramène à la liste)
    laisser: (b) => !!wifiFenetre && d.activeElement === wifiChamp() || !!cadre && !cadre.panne && !cadre.main && b !== 2 && !(b >= 5 && b <= 8) || b === 2 && !!cadre && surcouche(),
    y: (el) => el.dataset.y === "wifi-afficher" ? afficherWifi() : el.dataset.y.startsWith("main:") ? agirMain(el.dataset.y.slice(5)) : el.dataset.y.startsWith("oublier:") ? oublier(el.dataset.y.slice(8)) : reglages(el.dataset.y),
    // LB / RB : un lecteur à l'autre ; X : lecture / pause du lecteur montré
    // (15/10 soir, l'auteur) LB / RB : morceau précédent / suivant (le lecteur revient au début du morceau s'il joue
    // depuis un moment, comme tout lecteur MPRIS) ; LT / RT : changer de lecteur, moins utile
    touche: (b) => {
      if (cadre && b === 3 && cadre.main?.x?.(cadre.mainLu)) return agirMain("x");
      if (cadre) return (b === 5 || b === 6) && e.$('[data-sous="cadre"]').classList.contains("greffons") ? window.__pcvTenir(b, () => pasGreffon(b === 5 ? -1 : 1)) : b >= 5 && b <= 8 && bord();
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
      garderGreffon();
      fermerWifi();
      fermerCadre();
      regler(null);
      suivreLecteurs(false);
    }
  });
  wifiChamp().addEventListener("keydown", (ev) => {
    ev.stopPropagation();
    if (ev.key === "Enter") {
      ev.preventDefault();
      wifiClavier().__pcvClavierCacher?.();
      wifiChamp().blur();
      e.poser(e.$(".wifi-connecter"));
    }
    if (ev.key === "Escape") {
      ev.preventDefault();
      wifiClavier().__pcvClavierCacher?.();
      wifiChamp().blur();
    }
  });
  const largeurLegende = new ResizeObserver(() => {
    const l = e.$(".legende");
    if (l) e.racine.style.setProperty("--pcv-legende-l", l.offsetWidth + "px");
    ajusterDecky();
  });
  largeurLegende.observe(e.$(".legende"));
  const SUIVIS = ["vol", "mic"], vus = {};
  const suiviVolume = setInterval(() => {
    if (e.racine.hidden) return;
    for (const cle of SUIVIS) {
      let v;
      try {
        v = CURSEURS[cle].lire();
      } catch (x) {
        continue;
      }
      if (v === vus[cle]) continue;
      vus[cle] = v;
      for (const c of e.racine.querySelectorAll(`[data-curseur="${cle}"]:not(.regle)`)) peindreCurseur(c, v);
    }
  }, 100);
  e.racine.addEventListener("pointerdown", () => {
    appui = true;
  }, true);
  e.racine.addEventListener("pointerdown", (ev) => {
    if (!cadre || !ev.target.closest(".bande-g")) return;
    const x0 = e.versScene(ev).x, pas = 130 * parseFloat(getComputedStyle(e.racine).getPropertyValue("--u")) || 195;
    let fait = 0;
    const bouge = (m) => {
      if (m.pointerId !== ev.pointerId) return;
      const n = Math.trunc((x0 - e.versScene(m).x) / pas);
      while (fait !== n) {
        const s = Math.sign(n - fait);
        if (!pasGreffon(s)) {
          fait = n;
          break;
        }
        fait += s;
      }
    };
    const fin = (m) => {
      if (m.pointerId !== ev.pointerId) return;
      for (const [t, f] of ev2) window.removeEventListener(t, f, true);
    };
    const ev2 = [["pointermove", bouge], ["pointerup", fin], ["pointercancel", fin]];
    for (const [t, f] of ev2) window.addEventListener(t, f, true);
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
    const prendre2 = () => {
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
        prendre2();
      }
      suivre(m);
    };
    c.onpointerup = (u) => {
      if (!pris && surPiste) {
        prendre2();
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
    fermerWifi();
    largeurLegende.disconnect();
    clearTimeout(sc.minuteur);
    if (sc.ecoute) try {
      (O.DeckyBackend || window.DeckyBackend).removeEventListener("loader/plugin_event", sc.ecoute);
    } catch (x) {
    }
    clearInterval(suiviVolume);
    if (O.__pcvOuvrirPlugin === ouvrirPluginDemande) delete O.__pcvOuvrirPlugin;
    fermerCadre();
    d.removeEventListener("pointerdown", toucherGreffon, true);
    d.removeEventListener("focusin", garder, true);
    window.removeEventListener("vgp_onbuttondown", toucheJauge, true);
    O.DeckyPluginLoader?.deckyState?.eventBus?.removeEventListener("update", suivreDecky);
    suiviGreffon?.disconnect();
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
