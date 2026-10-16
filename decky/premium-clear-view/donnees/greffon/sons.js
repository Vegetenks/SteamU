(() => {
  const O = window.opener;
  let ac = null;
  const lire = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const volume = () => +lire("pcv-bruitages", 1) || 0;
  const PACK = {
    dossier: "@steamu/",
    // geste (nom passé à __pcvSon, le même que dans SONS_SYSTEME) → fichier du pack
    bruitages: {
      bouge: "curseur",
      pince: "curseur",
      choisir: "valider",
      prendre: "valider",
      poser: "valider",
      colle: "valider",
      capture: "valider",
      retour: "retour",
      lance: "ouvrir",
      "zoom+": "ouvrir",
      "ouvre-dossier": "ouvrir",
      fermer: "fermer",
      "zoom-": "fermer",
      "ferme-dossier": "fermer",
      home: "fermer",
      onglet: "onglet",
      bord: "erreur",
      erreur: "erreur",
      notification: "notification",
      ami: "notification",
      gagne: "reussite",
      theme: "reussite",
      rate: "verrou",
      verrou: "verrou",
      glisse: "curseur",
      frappe: "curseur",
      selection: "valider",
      dialogue: "ouvrir",
      menu: "ouvrir"
    },
    // page (écran de themes.js) → musique ; l'accueil prend l'ambiance du thème (champ « ambiance » de themes.js, 1 à 5)
    musiques: ["place", "miimaker", "themes", "boutique", "parametres", "notifs", "amis", "bibliotheque", "medias", "telechargements", "profil", "fiche", "garde-robe", "perso"],
    ambiances: 5,
    ambiance: 1
  };
  const fichierPack = (nom) => PACK.dossier + nom + ".ogg";
  window.__pcvPackMusique = (page, ambiance) => page === "accueil" ? fichierPack("ambiance-" + (ambiance >= 1 && ambiance <= PACK.ambiances ? ambiance : PACK.ambiance)) : PACK.musiques.includes(page) ? fichierPack(page) : null;
  window.__pcvSon = (nom) => {
    const f = PACK.bruitages[nom], v = volume();
    if (f && v > 0) jouer(fichierPack(f), v);
  };
  const TOUCHES = { 1: "choisir", 2: "retour", 5: "onglet", 6: "onglet", 9: "bouge", 10: "bouge", 11: "bouge", 12: "bouge" };
  let joues = 0, dernier = 0;
  window.__pcvSonAvant = (b) => ({ joues, ouvert: b === 2 && !!window.__pcvEcran?.ouvert?.() });
  window.__pcvSonApres = (b, ecran, a) => {
    if (!a || a.joues !== joues || ecran === "perso" || !TOUCHES[b]) return;
    window.__pcvSon?.(a.ouvert && !window.__pcvEcran?.ouvert?.() ? "fermer" : TOUCHES[b]);
  };
  const appeler = (methode, ...args) => Promise.race([
    (O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", "Premium Clear View", methode, ...args) ?? Promise.reject("Decky absent"),
    new Promise((_, non) => setTimeout(() => non("Decky muet"), 4e3))
  ]);
  const octets = (b64) => {
    const bin = atob(b64), oct = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) oct[i] = bin.charCodeAt(i);
    return oct;
  };
  const TRANCHE = 256 * 1024;
  const morceaux = async (chemin) => {
    let t;
    try {
      t = await appeler("tranche", chemin, 0, TRANCHE);
    } catch (e) {
      const b64 = await appeler("ressource", chemin);
      return b64 ? [octets(b64)] : null;
    }
    const m = [];
    let lu = 0;
    while (t?.b64) {
      const o = octets(t.b64);
      m.push(o);
      lu += o.length;
      if (lu >= t.taille) return m;
      t = await appeler("tranche", chemin, lu, TRANCHE);
    }
    return null;
  };
  const urls = window.__pcvBlobs ||= {}, enCours = {};
  const blob = async (chemin, type) => urls[chemin] || (enCours[chemin] ||= morceaux(chemin).then((m) => m && (urls[chemin] ||= URL.createObjectURL(new Blob(m, { type })))).finally(() => delete enCours[chemin]));
  window.__pcvRessource = blob;
  window.__pcvListe = (dossier) => appeler("liste", dossier).catch(() => []);
  let badges = null;
  const attente = /* @__PURE__ */ new Set();
  window.__pcvBadges = async () => badges ||= await window.__pcvListe("badges");
  const badgeHD = async (nom, c) => {
    let hd = null;
    try {
      const r = await appeler("badge_hd", nom);
      if (typeof r === "string" && /^hd\/.+-hd\.png$/.test(r)) hd = "badges/" + r;
    } catch (e) {
    }
    const u = hd && await blob(hd, "image/png");
    if (u) {
      urls[c] = u;
      window.dispatchEvent(new Event("pcv-badge"));
    }
  };
  window.__pcvBadgeURL = (nom) => {
    const c = "badges/" + nom;
    if (urls[c]) return urls[c];
    if (!attente.has(c)) {
      attente.add(c);
      blob(c, "image/png").then((u) => {
        if (u) window.dispatchEvent(new Event("pcv-badge"));
        badgeHD(nom, c);
      }).catch(() => {
      });
    }
    return "";
  };
  const SONS_SYSTEME = window.__pcvSonsSysteme = {
    wiiu: {
      nom: "Wii U",
      musiques: {
        accueil: "wiiu/menu/menu.ogg",
        place: "wiiu/place/place.ogg",
        parametres: "wiiu/parametres/parametres.ogg",
        boutique: "wiiu/eshop/eshop.ogg",
        amis: "wiiu/amis/amis.ogg",
        notifs: "wiiu/notifications/notifications.ogg",
        profil: "wiiu/miiverse/reglages.ogg",
        medias: "wiiu/miiverse/miiverse.ogg",
        miimaker: "wiiu/miimaker/menu.ogg",
        connexion: "wiiu/connexion/selection-compte.ogg",
        telechargements: "wiiu/telechargements/telechargements.ogg"
      },
      // autres pistes rangées (pas encore d'écran) : menu/anniversaire, miimaker/editeur, eshop/reglages,
      // eshop/variantes/*, parametres/controle-parental, journal/journal, demarrage/demarrage, miiverse/jingle
      bruitages: {
        commun: { bouge: "wiiu/ui/echantillons/00251.ogg", lance: { f: "wiiu/ui/lancement.ogg", d: 3.5 } }
      }
    },
    "3ds": {
      nom: "3DS",
      musiques: {
        accueil: "home-menu.mp3",
        place: "3ds/place/place.ogg",
        parametres: "3ds/parametres/parametres.ogg",
        boutique: "eshop-main.mp3",
        amis: "3ds/amis/amis.ogg",
        notifs: "3ds/notifications/notifications.ogg",
        profil: "3ds/miiverse/miiverse.ogg",
        medias: "3ds/medias/album.ogg",
        miimaker: "3ds/miimaker/menu.ogg",
        connexion: "initial-setup.mp3",
        telechargements: "3ds/telechargements/telechargements.ogg",
        themes: "theme-shop.mp3"
      },
      // autres : place/place-2, place/bienvenue, place/nouveau-visiteur, eshop/liste-souhaits, eshop/reglages, eshop/pret,
      // journal/journal, nnid/nnid, mode-emploi/mode-emploi, son/son, ui/nouveaute
      bruitages: {
        commun: {
          bouge: "3ds/ui/icone-choisie.ogg",
          bord: "3ds/ui/bute.ogg",
          choisir: { f: "3ds/ui/ok.ogg", d: 0.5 },
          retour: { f: "3ds/ui/retour.ogg", d: 0.45 },
          prendre: "3ds/ui/icone-prend.ogg",
          poser: "3ds/ui/icone-pose.ogg",
          colle: "3ds/ui/theme-liste-pose.ogg",
          "zoom+": "3ds/ui/zoom-plus.ogg",
          "zoom-": "3ds/ui/zoom-moins.ogg",
          lance: { f: "3ds/ui/lancement.ogg", d: 1.2 },
          theme: { f: "3ds/ui/theme-valide.ogg", d: 0.8 },
          erreur: "3ds/ui/erreur.ogg",
          notification: "3ds/ui/nouvelles.ogg",
          ami: "3ds/ui/popup-ami-en-ligne.ogg",
          capture: "3ds/ui/capture.ogg",
          "ouvre-dossier": "3ds/ui/dossier-ouvre.ogg",
          "ferme-dossier": "3ds/ui/dossier-ferme.ogg",
          home: { f: "3ds/ui/bouton-home.ogg", d: 1 },
          // (15/10) ouverture et fermeture du menu HOME et de l'accès rapide (menu-home.js, acces-rapide.js) ; absents du pack : SteamU reste muet
          "home-ouvre": { f: "3ds/ui/bouton-home.ogg", d: 1 },
          "home-ferme": "3ds/ui/bouton-home-retour.ogg",
          glisse: "3ds/ui/glissiere-centre.ogg",
          menu: "3ds/ui/sous-menu.ogg",
          dialogue: { f: "3ds/ui/dialogue.ogg", d: 0.5 },
          selection: "3ds/ui/choix.ogg"
        },
        boutique: { bouge: "3ds/eshop/ui/defile.ogg", choisir: { f: "3ds/eshop/ui/valide.ogg", d: 0.5 }, retour: { f: "3ds/eshop/ui/annuler.ogg", d: 0.45 } },
        parametres: { choisir: "3ds/parametres/ui/bulle-ok.ogg", retour: { f: "3ds/parametres/ui/bulle-annuler.ogg", d: 0.45 } },
        miimaker: { choisir: { f: "3ds/miimaker/ui/valide.ogg", d: 0.5 }, retour: "3ds/miimaker/ui/annuler.ogg", "zoom+": "3ds/miimaker/ui/zoom-plus.ogg", "zoom-": "3ds/miimaker/ui/zoom-moins.ogg" }
        // medias (appareil photo 3DS : clic, ferme, zoom, déclencheur) : pas encore récupéré (voir l'inventaire)
      }
    },
    // Switch (thèmes Themezer de la Switch) : pas de musique de menu sur la console, les pages gardent celles du pack.
    // « ouverture » : joué en arrivant sur l'écran (themes.js). Rangés sans emplacement : ui/icones,
    // ui/manette, ui/manette-bing, eshop/intro, demarrage/* (allumage, démarrage, extinction, veille) ; ui/echantillons/* jamais.
    switch: {
      nom: "Switch",
      musiques: {},
      bruitages: {
        commun: {
          bouge: "switch/ui/bouge.ogg",
          bord: "switch/ui/bord.ogg",
          choisir: "switch/ui/retour.ogg",
          retour: "switch/ui/retour.ogg",
          lance: "switch/ui/lance.ogg",
          erreur: "switch/ui/erreur.ogg",
          notification: "switch/ui/notification.ogg",
          home: "switch/ui/home.ogg",
          selection: "switch/ui/selection.ogg"
        },
        boutique: { ouverture: "switch/eshop/eshop.ogg" },
        medias: { ouverture: "switch/medias/album.ogg" },
        parametres: { ouverture: "switch/parametres/ouverture.ogg" },
        connexion: { ouverture: "switch/connexion/compte.ogg" }
      }
    }
  };
  window.__pcvFamilleSons = (familleDuTheme) => {
    const r = lire("pcv-sons-famille", "theme");
    return r === "steamu" ? null : SONS_SYSTEME[r] ? r : familleDuTheme;
  };
  const fichiersDe = (f) => [...Object.values(f.musiques), ...Object.values(f.bruitages).flatMap((g) => Object.values(g).map((b) => b.f || b))];
  let presentsLus = null;
  const importee = (famille) => !!SONS_SYSTEME[famille] && fichiersDe(SONS_SYSTEME[famille]).some((c) => presentsLus?.has("sons/" + c));
  window.__pcvSonsReglage = {
    val: (v, famille) => importee(famille) && v !== "steamu" ? SONS_SYSTEME[famille].nom : "SteamU",
    nom: (famille) => SONS_SYSTEME[famille] && !importee(famille) ? `Sons \xB7 ${SONS_SYSTEME[famille].nom} \xE0 importer` : "Sons",
    suivant: (v, famille) => {
      if (!importee(famille)) {
        window.__pcvSteamU?.ouvrir?.();
        return v;
      }
      return v === "steamu" ? "theme" : "steamu";
    }
  };
  let presents = null;
  window.__pcvSonsPresents = (forcer) => {
    if (presents && !forcer) return presents;
    const dossiers = /* @__PURE__ */ new Set(["sons"]);
    for (const c of Object.values(SONS_SYSTEME).flatMap(fichiersDe)) dossiers.add(("sons/" + c).replace(/\/[^/]*$/, ""));
    return presents = Promise.all([...dossiers].map((d) => window.__pcvListe(d).then((l) => (l || []).map((n) => d + "/" + n)))).then((ls) => {
      const s = new Set(ls.flat());
      if (!s.size) presents = null;
      return presentsLus = s;
    });
  };
  const tampons = {}, absents = /* @__PURE__ */ new Map();
  const typeDe = (c) => /\.mp3$/i.test(c) ? "audio/mpeg" : "audio/ogg";
  const chargerSon = (c) => tampons[c] || Date.now() - (absents.get(c) || 0) < 3e4 ? null : tampons[c] = blob(c, typeDe(c)).then((u) => u ? fetch(u).then((r) => r.arrayBuffer()).then((o) => ctx().decodeAudioData(o)) : Promise.reject()).then((b) => tampons[c] = b, () => {
    delete tampons[c];
    absents.set(c, Date.now());
  });
  const jouer = (c, gain, d) => {
    const b = tampons[c];
    if (!(b instanceof AudioBuffer)) {
      chargerSon(c);
      return false;
    }
    try {
      const a = ctx(), s = a.createBufferSource(), g = a.createGain(), t = a.currentTime;
      s.buffer = b;
      g.gain.setValueAtTime(gain, t);
      if (d && d < b.duration) {
        g.gain.setValueAtTime(gain, t + d - 0.06);
        g.gain.linearRampToValueAtTime(0, t + d);
      }
      s.connect(g).connect(a.destination);
      s.start(t);
      if (d) s.stop(t + d + 0.02);
      joues++;
      dernier = performance.now();
      (window.__pcvSonsJournal ||= []).push(c);
      if (window.__pcvSonsJournal.length > 200) window.__pcvSonsJournal.shift();
      return true;
    } catch (e) {
      return false;
    }
  };
  window.__pcvEchantillon = (son, vol = 1) => jouer("sons/" + (son.f || son), 0.6 * vol, son.d);
  window.__pcvTampon = (chemin) => {
    const c = "sons/" + chemin, b = tampons[c];
    if (b instanceof AudioBuffer) return b;
    chargerSon(c);
    return null;
  };
  window.__pcvSonsPlace = {
    "pas-gauche": ["3ds/place/pas/pas-gauche.ogg", "3ds/place/pas/pas-gauche-2.ogg", "3ds/place/pas/pas-gauche-3.ogg"],
    "pas-droit": ["3ds/place/pas/pas-droit.ogg", "3ds/place/pas/pas-droit-2.ogg", "3ds/place/pas/pas-droit-3.ogg"],
    saut: ["3ds/place/pas/saut.ogg"],
    arrivee: ["3ds/place/autres/arrivee-mii.ogg", "3ds/place/autres/arrivee-mii-2.ogg"],
    depart: ["3ds/place/autres/depart-mii.ogg"],
    bulle: ["3ds/place/autres/bulle-message.ogg"],
    poignee: ["3ds/place/autres/poignee-de-main.ogg"],
    tape: ["3ds/place/autres/tape-dans-la-main.ogg"],
    felicitations: ["3ds/place/autres/felicitations.ogg"],
    // babillages des Mii de la place Wii U (cafe_barista_men_00000000 à 000000EF)
    voix: Array.from({ length: 240 }, (_, i) => `wiiu/place/voix/cafe_barista_men_${i.toString(16).toUpperCase().padStart(8, "0")}.ogg`)
  };
  window.__pcvPrechargerSons = (famille) => {
    const f = SONS_SYSTEME[famille];
    if (!f) return;
    for (const g of Object.values(f.bruitages)) for (const b of Object.values(g)) chargerSon("sons/" + (b.f || b));
  };
  for (const f of new Set(Object.values(PACK.bruitages))) chargerSon(fichierPack(f));
  const ctx = () => {
    ac ||= new AudioContext();
    if (ac.state === "suspended") ac.resume().catch(() => {
    });
    return ac;
  };
  const cheminDe = (u) => Object.keys(urls).find((k) => urls[k] === u);
  const bornesDe = async (chemin) => {
    if (!chemin) return null;
    try {
      const u = await blob(chemin + ".boucle", "application/json");
      const j = u && await (await fetch(u)).json();
      return j && Number.isFinite(j.debut) && Number.isFinite(j.fin) && j.fin > j.debut ? j : null;
    } catch (e) {
      return null;
    }
  };
  class LecteurSansCouture {
    constructor() {
      this.dataset = {};
      this.loop = true;
      this.preload = "auto";
      this._v = 1;
      this._pos = 0;
      this._joue = false;
      this._url = "";
      this._src = null;
    }
    get paused() {
      return !this._joue;
    }
    get volume() {
      return this._v;
    }
    set volume(v) {
      this._v = v;
      if (this._gain) this._gain.gain.setTargetAtTime(v, this._gain.context.currentTime, 0.015);
      if (this._repli) this._repli.volume = v;
    }
    get src() {
      return this._url;
    }
    set src(u) {
      if (u === this._url) return;
      this._couper();
      this._repli?.pause();
      this._repli = null;
      this._url = u || "";
      this._buf = null;
      this._bornes = null;
      this._pos = 0;
      this._pret = u ? this._charger(u) : null;
    }
    get currentTime() {
      if (this._repli) return this._repli.currentTime;
      return this._src ? this._ou() : this._pos;
    }
    set currentTime(t) {
      if (this._repli) {
        this._repli.currentTime = t;
        return;
      }
      this._pos = Math.max(0, +t || 0);
      if (this._src) this._lancer();
    }
    async play() {
      this._joue = true;
      await this._pret;
      if (!this._joue) return;
      if (this._repli) return this._repli.play();
      if (this._buf && !this._src) this._lancer();
    }
    pause() {
      if (this._src) this._pos = this._ou();
      this._joue = false;
      this._couper();
      this._repli?.pause();
    }
    async _charger(u) {
      try {
        const c = ctx(), octets2 = await (await fetch(u)).arrayBuffer();
        const chemin = this.dataset.chemin || cheminDe(u);
        const [buf, bornes] = await Promise.all([c.decodeAudioData(octets2), bornesDe(chemin)]);
        if (u !== this._url) return;
        if (bornes && bornes.fin <= buf.duration + 0.01) {
          const n = Math.min(buf.length, Math.ceil(bornes.fin * buf.sampleRate) + 1), b = c.createBuffer(buf.numberOfChannels, n, buf.sampleRate);
          for (let k = 0; k < buf.numberOfChannels; k++) b.copyToChannel(buf.getChannelData(k).subarray(0, n), k);
          this._buf = b;
          this._bornes = { debut: bornes.debut, fin: Math.min(bornes.fin, b.duration) };
        } else this._buf = buf;
      } catch (e) {
        if (u !== this._url) return;
        const a = this._repli = new Audio(u);
        a.loop = true;
        a.volume = this._v;
        try {
          a.currentTime = this._pos;
        } catch (e2) {
        }
      }
    }
    // position dans la piste, boucle comprise
    _ou() {
      const p = this._depart + (this._src.context.currentTime - this._t0), d = this._bornes?.debut ?? 0, f = this._bornes?.fin ?? this._buf.duration;
      return p < f ? p : d + (p - d) % (f - d);
    }
    _lancer() {
      this._couper();
      const c = ctx(), s = c.createBufferSource(), d = this._bornes?.debut ?? 0, f = this._bornes?.fin ?? this._buf.duration;
      s.buffer = this._buf;
      s.loop = true;
      s.loopStart = d;
      s.loopEnd = f;
      if (!this._gain) {
        this._gain = c.createGain();
        this._gain.gain.value = this._v;
        this._gain.connect(c.destination);
      }
      const p = this._pos < f ? this._pos : d + (this._pos - d) % (f - d);
      s.connect(this._gain);
      s.start(0, p);
      this._src = s;
      this._t0 = c.currentTime;
      this._depart = p;
    }
    _couper() {
      if (!this._src) return;
      try {
        this._src.stop();
      } catch (e) {
      }
      this._src.disconnect();
      this._src = null;
    }
  }
  window.__pcvLecteurMusique = () => new LecteurSansCouture();
  const relayer = (a) => {
    const n = new LecteurSansCouture();
    if (!a) return n;
    n.volume = a.volume;
    if (a.src) {
      n.src = a.src;
      if (a.dataset?.chemin) n.dataset.chemin = a.dataset.chemin;
      n.currentTime = a.currentTime || 0;
    }
    if (!a.paused) {
      a.pause();
      n.play();
    }
    return n;
  };
  const lecteurs = window.__pcvThemesLecteurs ||= [];
  for (let i = 0; i < 2; i++) lecteurs[i] = relayer(lecteurs[i]);
  const lecteur = window.__pcvLecteur = relayer(window.__pcvLecteur);
  let voulu = null;
  window.__pcvMusique = async (piste) => {
    voulu = piste;
    if (!piste || !lire("pcv-musique", false)) {
      lecteur.pause();
      return;
    }
    const u = await blob("sons/" + piste + ".mp3", "audio/mpeg").catch(() => null);
    if (voulu !== piste || !u) return;
    if (lecteur.src !== u) {
      lecteur.src = u;
      lecteur.dataset.chemin = "sons/" + piste + ".mp3";
      lecteur.currentTime = 0;
    }
    lecteur.volume = 0.35;
    lecteur.play().catch(() => {
    });
  };
  window.__pcvMusiqueActive = (on) => {
    localStorage.setItem("pcv-musique", JSON.stringify(on));
    window.__pcvMusique(voulu);
    return on;
  };
  window.__pcvSonsProches = {
    choisir: ["bouge"],
    selection: ["choisir", "bouge"],
    retour: ["bouge"],
    fermer: ["ferme-dossier", "retour", "bouge"],
    bord: ["erreur", "bouge"],
    erreur: ["bord", "retour"],
    rate: ["erreur", "bord"],
    verrou: ["erreur", "bord"],
    onglet: ["bouge"],
    glisse: ["bouge"],
    frappe: ["bouge"],
    pince: ["bouge"],
    "zoom+": ["glisse", "bouge"],
    "zoom-": ["glisse", "bouge"],
    menu: ["ouvre-dossier", "choisir", "bouge"],
    dialogue: ["ouvre-dossier", "choisir", "bouge"],
    "ouvre-dossier": ["choisir", "bouge"],
    "ferme-dossier": ["retour", "bouge"],
    lance: ["choisir", "bouge"],
    home: ["retour", "bouge"],
    notification: ["ami", "choisir"],
    ami: ["notification", "choisir"],
    gagne: ["theme", "notification", "choisir"],
    theme: ["gagne", "choisir"],
    capture: ["choisir"],
    prendre: ["choisir", "bouge"],
    poser: ["choisir", "bouge"],
    colle: ["poser", "choisir"]
  };
  const STEAM = {
    BasicNav: ["bouge", "deck_ui_misc_10"],
    FailedNav: ["bord", "deck_ui_bumper_end_02"],
    DefaultOk: ["choisir", "deck_ui_default_activation"],
    PagedNavigation: ["onglet", "deck_ui_navigation"],
    ChangeTabs: ["onglet", "deck_ui_tab_transition_01"],
    ToggleOn: ["choisir", "deck_ui_switch_toggle_on"],
    ToggleOff: ["retour", "deck_ui_switch_toggle_off"],
    SliderUp: ["glisse", "deck_ui_slider_up"],
    SliderDown: ["glisse", "deck_ui_slider_down"],
    VolSound: ["glisse", "deck_ui_volume"],
    ShowModal: ["dialogue", "deck_ui_show_modal"],
    HideModal: ["fermer", "deck_ui_hide_modal"],
    OpenSideMenu: ["menu", "deck_ui_side_menu_fly_in"],
    CloseSideMenu: ["ferme-dossier", "deck_ui_side_menu_fly_out"],
    IntoGameDetail: ["selection", "deck_ui_into_game_detail"],
    OutOfGameDetail: ["retour", "deck_ui_out_of_game_detail"],
    LaunchGame: ["lance", "deck_ui_launch_game"],
    Typing: ["frappe", "deck_ui_typing"],
    Screenshot: ["capture", "camera1"],
    ToastMessage: ["notification", "deck_ui_message_toast"],
    ToastMisc: ["notification", "deck_ui_toast"],
    ToastMiscShort: ["notification", "desktop_toast_short"],
    ToastAchievement: ["gagne", "deck_ui_achievement_toast"],
    TimerExpired: ["notification", "timer_expired_alarm"],
    FriendMessage: ["notification", "ui_steam_message_old_smooth"],
    ChatMessage: ["notification", "steam_chatroom_notification"],
    ChatMention: ["notification", "steam_at_mention"],
    FriendOnline: ["ami", "ui_steam_smoother_friend_online"],
    FriendInGame: ["ami", "ui_steam_smoother_friend_join"],
    // fichiers que seule la page d'essai des sons de Steam joue : par prudence
    bumper_end: ["bord", "bumper_end"],
    confirmation_positive: ["choisir", "confirmation_positive"],
    confirmation_negative: ["erreur", "confirmation_negative"],
    desktop_toast_default: ["notification", "desktop_toast_default"],
    recording_start: ["capture", "recording_start"],
    recording_stop: ["capture", "recording_stop"],
    recording_highlight: ["capture", "recording_highlight"],
    deck_ui_misc_01: [null, "deck_ui_misc_01"],
    deck_ui_misc_08: [null, "deck_ui_misc_08"],
    pop_sound: [null, "pop_sound"],
    steam_os_startup: [null, "steam_os_startup"],
    silence: [null, "silence"]
  };
  let enAttente = null;
  const steam = (geste, type, rang) => {
    if (!geste || enAttente && enAttente.rang <= rang) return;
    clearTimeout(enAttente?.minuterie);
    enAttente = { rang, minuterie: setTimeout(() => {
      enAttente = null;
      if (performance.now() - dernier < 80) return;
      (window.__pcvSonsSteam ||= []).push(type);
      if (window.__pcvSonsSteam.length > 200) window.__pcvSonsSteam.shift();
      window.__pcvSon?.(geste);
    }, 1) };
  };
  if (O) {
    O.__pcvSonSteam = (t) => {
      const n = O.__pcvPN?.[t];
      steam(STEAM[n]?.[0], n, t);
    };
    O.__pcvSonSteamURL = (u) => {
      const f = String(u).replace(/^.*\/|\.\w+$/g, ""), e = Object.entries(STEAM).find(([, x]) => x[1] === f);
      steam(e?.[1][0], "url:" + f, 99);
    };
    O.__pcvSonSteamTaire = () => {
      clearTimeout(enAttente?.minuterie);
      enAttente = null;
    };
  }
  try {
    if (O && !O.__pcvSonsSteamPoses && O.SteamUIStore?.m_GamepadUIAudioStore) {
      const req = O.__pcvReq ||= (() => {
        let r;
        O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
      const estPN = (x) => x?.PN?.BasicNav === 24 && typeof x.eZ?.PlayNavSound === "function";
      let mod = null;
      try {
        mod = req(67758);
      } catch (e) {
      }
      if (!estPN(mod)) {
        const id = Object.keys(req.m).find((i) => /\.BasicNav=24\]="BasicNav"/.test(req.m[i].toString()));
        mod = id && req(id);
      }
      if (estPN(mod)) {
        O.__pcvSonsSteamPoses = true;
        O.__pcvPN = mod.PN;
        const S = O.SteamUIStore, vrai = S.m_GamepadUIAudioStore, F = (f) => new O.Function("t", `try { window.${f}(t); } catch (e) {}`);
        mod.eZ.PlayNavSound = F("__pcvSonSteam");
        mod.eZ.SuppressImminentNavSound = F("__pcvSonSteamTaire");
        const W = Object.create(vrai, { PlayNavSound: { value: F("__pcvSonSteam") }, SuppressImminentNavSound: { value: F("__pcvSonSteamTaire") } });
        const lie = (k) => Object.getOwnPropertyDescriptor(Object.getPrototypeOf(vrai), k)?.get?.call(W);
        const survol = lie("OnGamepadFocusChanged"), bute = lie("OnUnhandledButtonDownEvent");
        Object.defineProperty(S, "GamepadUIAudio", { get: () => W, configurable: true });
        const remplacer = (o, prof, vus) => {
          if (!o || typeof o !== "object" || vus.has(o) || prof > 7) return;
          vus.add(o);
          try {
            if (o.window === o || typeof o.nodeType === "number") return;
          } catch (e) {
            return;
          }
          for (const k of Object.getOwnPropertyNames(o)) {
            let v;
            try {
              v = o[k];
            } catch (e) {
              continue;
            }
            if (Array.isArray(o) && survol && v === vrai.OnGamepadFocusChanged) o[k] = survol;
            else if (Array.isArray(o) && bute && v === vrai.OnUnhandledButtonDownEvent) o[k] = bute;
            else if (v && typeof v === "object") remplacer(v, prof + 1, vus);
          }
        };
        remplacer(S, 0, /* @__PURE__ */ new Set());
        const P = Object.getPrototypeOf(vrai.m_AudioPlaybackManager), avant = P.PlayAudioURLWithRepeats;
        P.PlayAudioURLWithRepeats = new O.Function("avant", `return function (u, n) { if (/\\/sounds\\//.test(u) && !/\\/silence\\./.test(u)) {
        try { window.__pcvSonSteamURL(u); } catch (e) {} u = "/sounds/silence.wav"; } return avant.call(this, u, n); }`)(avant);
      }
    }
  } catch (e) {
    console.warn("sons de Steam : non remplac\xE9s", e);
  }
  return "sons pr\xEAts";
})();
