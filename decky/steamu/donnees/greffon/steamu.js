(() => {
  const O = window.opener;
  const T = (k, v) => window.__pcvT?.(k, v) ?? k;
  const touche = (k) => {
    const [, c, h] = window.__pcvTouche?.(k) || { 1: ["", "#2fbf71", "A"], 2: ["", "#e5484d", "B"] }[k];
    return `<u style="background:${c}">${h}</u>`;
  };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const son = (s) => window.__pcvSon?.(s);
  const attendre = (ms, v = null) => new Promise((r) => setTimeout(() => r(v), ms));
  const appel = (m, args = [], delai = 4e3) => {
    try {
      return Promise.race([((O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, m, ...args) ?? Promise.reject()).catch(() => null), attendre(delai)]);
    } catch (e) {
      return Promise.resolve(null);
    }
  };
  appel("conflits", [], 8e3).then((r) => {
    const cles = Object.keys(r?.actifs || {});
    if (!r?.nouveau || !cles.length) return;
    try {
      (O || window).DeckyPluginLoader.toaster.toast({ title: T("steamu.conflits.titre"), body: cles.map((c) => T("steamu.conflits." + c)).join(" "), duration: 2e4 });
    } catch (e) {
    }
  });
  const ico = (d) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICO = {
    etoile: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
    mii: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/>',
    casino: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/>',
    badges: '<circle cx="12" cy="10" r="6"/><path d="M8.5 15l-1.5 6 5-2.5 5 2.5-1.5-6"/>',
    sons: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    importer: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 10v6M9 13l3 3 3-3"/>',
    guide: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.6"/><path d="M12 17h.01"/>',
    apparence: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor"/>',
    ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    manque: '<path d="M12 7v6M12 17h.01"/>',
    cle: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8 20 3M16 7l3 3M13.5 9.5l2 2"/>',
    wiiu: '<rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="7.5" cy="12" r="1.5"/><path d="M15 12h3M16.5 10.5v3"/>',
    switch: '<rect x="4" y="5" width="6" height="14" rx="3"/><rect x="14" y="5" width="6" height="14" rx="3"/><path d="M7 9h.01M17 15h.01"/>',
    // ---- ajoutés le 15/10 pour la page refaite (Contributeurs, Importation, Confidentialité, Options de
    // réinitialisation) : dessins repris tels quels de banc/maquette-paroles/index.html (symboles i-*) ----
    coeur: '<path d="M12 20s-7.3-4.4-9.4-9.1C1.3 7.6 3 4.5 6.2 4c2-.3 3.8.8 5.8 3 2-2.2 3.8-3.3 5.8-3 3.2.5 4.9 3.6 3.6 6.9C19.3 15.6 12 20 12 20z"/>',
    dossier: '<path d="M3 7h7l2 2h9v10H3z"/>',
    biblio: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    livre: '<path d="M3 5.5c3-1.3 6-1.3 9 .5 3-1.8 6-1.8 9-.5V19c-3-1.3-6-1.3-9 .5-3-1.8-6-1.8-9-.5z"/><path d="M12 6v13.5"/>',
    internet: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
    paroles: window.__pcvIcones?.trace("paroles") || "",
    // (registre unique : icones.js)
    prise: '<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    cadenas: window.__pcvIcones?.trace("cadenas") || "",
    aide: window.__pcvIcones?.trace("aide") || "",
    // (registre unique : icones.js — onglet Aide et dépannage)
    poubelle: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/>',
    redemarrer: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',
    fermer: '<path d="M6 6l12 12M18 6L6 18"/>',
    danger: '<path d="M12 3 2.5 20h19z"/><path d="M12 9.3v5M12 17.2h.01"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>'
  };
  for (const n of ["reglages", "info", "accueil", "bibliotheque", "manette", "soleil", "ecran", "musique", "casino", "epingle", "antenne", "crayon"]) ICO[n] = window.__pcvIcones?.trace(n) || "";
  const APPLIS = [["mii", "#2fbf71"], ["casino", "#e5484d"], ["badges", "#f5a000"], ["sons", "#8a63ff"]];
  const GUIDES = (imp = T("steamu.importer")) => [
    { id: "mii", c: "#2fbf71", ico: ICO.mii, pret: true, schemas: [
      "  START + POWER  \u2500\u2500\u25B6  [ GodMode9 ]",
      "  [0:] SDCARD\n\u25B6 [1:] SYSNAND CTRNAND\n  [2:] SYSNAND TWLN\n\n  data \u25B6 3f2a\u2026c91e",
      "[1:]/data/<id>/extdata/\n   00048000 \u25B6 f000000b \u25B6 00000000\n     00000001\n     00000003\n   \u25B6 00000005",
      "\u25B6 00000005  \u2500\u2500 A \u2500\u2500\u25B6  Mount as DIFF image\n\n  Enter path now?  \u2500\u2500 A",
      "\u25B6 partitionA.bin  \u2500\u2500 A \u2500\u2500\u25B6  Copy to 0:/gm9/out\n\n  partitionA.bin = CFL_DB.dat",
      `  SD \u25B6 gm9 \u25B6 out \u25B6 partitionA.bin
           \u2193
   [ ${imp} ]`
    ] },
    { id: "cle3ds", c: "#ff5f95", ico: ICO.cle, pret: true, schemas: [
      "  boot9.bin  \u2500\u2500\u25B6  \u2026.cia  \u2026.app  \u2713",
      "  START + POWER  \u2500\u2500\u25B6  [ GodMode9 ]",
      "  [0:] SDCARD\n  [1:] SYSNAND CTRNAND\n  \u2026\n\u25B6 [M:] MEMORY VIRTUAL",
      "\u25B6 boot9.bin  \u2500\u2500 A \u2500\u2500\u25B6  Copy to 0:/gm9/out",
      `  SD \u25B6 gm9 \u25B6 out \u25B6 boot9.bin
           \u2193
   [ ${imp} ]`,
      {
        texte: `  Citra / Azahar \u25B6 aes_keys.txt
           \u2193
   [ ${imp} ]`,
        qr: [["steamu.guide.cle3ds.qr", "https://citra.azahar-emu.org/wiki/aes-keys/"]]
      }
    ] },
    // (page 2 : le fichier des visages à chercher, et des QR vers les PAGES des projets qui expliquent où le trouver ;
    // jamais un lien vers un fichier de Nintendo)
    { id: "moteur", c: "#2fbf71", ico: ICO.mii, pret: true, schemas: [
      "  Moteur            \u2500\u2500\u25B6  [ Installer ]\n  Visages, corps    \u2500\u2500\u25B6  [ Importer ]",
      {
        texte: `  FFLResHigh.dat      (Wii U)
  AFLResHigh_2_3.dat  (Miitomo)
           \u2193
   [ ${imp} ]`,
        qr: [["steamu.guide.moteur.qr1", "https://github.com/ariankordi/FFL-Testing"], ["steamu.guide.moteur.qr2", "https://github.com/datkat21/mii-creator"]]
      }
    ] },
    { id: "luigi", c: "#e5484d", ico: ICO.casino, pret: true, schemas: [
      "  [ Super Mario 64 DS ]  \u2500\u2500\u25B6  3DS",
      "  START + POWER  \u2500\u2500\u25B6  [ GodMode9 ]",
      "  [0:] SDCARD\n  [1:] SYSNAND CTRNAND\n\u25B6 [C:] GAMECART\n      \u25B6 \u2026.nds",
      "\u25B6 \u2026.nds  \u2500\u2500 A \u2500\u2500\u25B6  Copy to 0:/gm9/out",
      "  [ Mario Party DS ]  \u2500\u2500\u25B6  3DS\n\u25B6 [C:] GAMECART \u25B6 \u2026.nds\n      \u2500\u2500 A \u2500\u2500\u25B6  Copy to 0:/gm9/out",
      `  SD \u25B6 gm9 \u25B6 out \u25B6 \u2026.nds
           \u2193
   [ ${imp} ]`
    ] },
    { id: "badges", c: "#f5a000", ico: ICO.badges, pret: true, schemas: [
      "  START + POWER  \u2500\u2500\u25B6  [ GodMode9 ]",
      "  HOME  \u2500\u2500\u25B6  Title manager\n             \u25B6 [A:] SYSNAND SD",
      "    \u2026\n  \u25B6 Nintendo Badge Arcade\n      \u25B6 Open title folder",
      "\u25B6 \u2026.app  \u2500\u2500 A \u2500\u2500\u25B6\n    NCCH image options\u2026\n  \u25B6 Mount image to drive",
      "\u25B6 romfs  \u2500\u2500 Y \u2500\u2500\u25B6  Copy to 0:/gm9/out",
      `  SD \u25B6 gm9 \u25B6 out \u25B6 romfs
  SD \u25B6 gm9 \u25B6 out \u25B6 boot9.bin
           \u2193
   [ ${imp} ]`
    ] },
    { id: "sons3ds", c: "#2fb8ff", ico: ICO.sons, pret: true, schemas: [
      "  \u266A \u2026.flac  \u2026.wav  \u2026.ogg  \u2026.mp3\n  \u266A \u2026.bcstm",
      `  \u266A \u266A \u266A
           \u2193
   [ ${imp} ]`,
      "  3DS   Wii U   Switch\n  Badge Arcade   Casino\n           \u2713"
    ] },
    { id: "wiiu", c: "#8a63ff", ico: ICO.wiiu, pret: true, schemas: [
      "  Wii U (Aroma / Tiramisu)\n  + dumpling\n  + SD / USB",
      "  Wii U Menu  \u2500\u2500\u25B6  [ dumpling ]",
      "  dumpling\n  \u25B6 System applications\n      \u25B6 Wii U Menu",
      `  SD \u25B6 dumpling \u25B6 \u2026
           \u2193
   [ ${imp} ]`,
      `  \u2026.ogg  \u2026.mp3  \u2026.wav  \u2026.bfstm
           \u2193
   [ ${imp} ]`
    ] },
    { id: "switch", c: "#5b6676", ico: ICO.switch, pret: true, schemas: [
      "  Switch  \u2500\u2500\u2715\u2500\u2500\u25B6  SteamU",
      `  \u2026.ogg  \u2026.mp3  \u2026.wav
           \u2193
   [ ${imp} ]`
    ] }
  ];
  const guide = () => GUIDES().find((g) => g.id === S.guide) || GUIDES()[0];
  const CATEGORIES = [["decky", "prise"], ["bibliotheques", "livre"], ["mii", "mii"], ["communautes", "internet"], ["divers", "etoile"]];
  const CREDITS = () => O?.__pcvCredits || window.__pcvCredits || {};
  const ONGLETS = [
    { id: "nouveautes", ic: "etoile", c: "--c-apparence", libelle: "bienvenue.rubrique" },
    { id: "contrib", ic: "coeur", c: "--c-contrib", libelle: "steamu.tab.contrib" },
    { id: "import", ic: "dossier", c: "--c-import", libelle: "steamu.tab.import" },
    { id: "applis", ic: "biblio", c: "--c-applis", libelle: "steamu.applis" },
    { id: "confid", ic: "cadenas", c: "--c-confid", libelle: "steamu.tab.confid" },
    { id: "aide", ic: "aide", c: "--c-aide", libelle: "steamu.tab.aide" },
    { id: "danger", ic: "redemarrer", c: "--c-danger", libelle: "steamu.tab.reinit" },
    { id: "apparence", ic: "apparence", c: "--c-apparence", libelle: "steamu.apparence" },
    { id: "autres", ic: "reglages", c: "--c-autres", libelle: "steamu.tab.autres" }
  ];
  const regleSU = (id) => window.__pcvReglages?.regle("steamu." + id);
  const onglets = () => {
    const o = ONGLETS.filter((x) => regleSU(x.id)?.choix !== "retirer");
    return S.debug ? [...o, { id: "debug", ic: "info", c: "--c-debug", libelle: "steamu.tab.debug" }] : o;
  };
  const DANGER = { reset: { ic: ICO.redemarrer, cle: "steamu.danger.reset" }, effacer: { ic: ICO.poubelle, cle: "steamu.danger.effacer" } };
  const CLE_PAROLES = "pcv-paroles-lrclib";
  const CLE_ART_AUTO = "pcv-art-auto";
  const lireBool = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const ecrireBool = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
    }
  };
  const parolesActif = () => lireBool(CLE_PAROLES, false);
  const artAutoActif = () => lireBool(CLE_ART_AUTO, true);
  const CLE_MAJ = "pcv-maj-auto";
  const majActif = () => lireBool(CLE_MAJ, true);
  const CLE_HORS_STORE = "pcv-plugins-hors-store";
  const horsStoreActif = () => lireBool(CLE_HORS_STORE, false);
  const CLE_FILM = "pcv-film-demarrage";
  const filmActif = () => lireBool(CLE_FILM, true);
  appel("film_demarrage", [filmActif()], 2e4);
  document.getElementById("pcv-steamu")?.remove();
  document.getElementById("pcv-onglet-steamu")?.remove();
  document.body.classList.remove("pcv-steamu-ouvert");
  const page = document.createElement("div");
  page.id = "pcv-steamu";
  page.hidden = true;
  document.body.appendChild(page);
  document.getElementById("pcv-steamu-legende")?.remove();
  const legendeEl = document.createElement("div");
  legendeEl.id = "pcv-steamu-legende";
  legendeEl.className = "pcv-legende";
  document.body.appendChild(legendeEl);
  const S = {
    actif: false,
    zone: "onglet",
    og: "contrib",
    curseur: 0,
    vueImport: "liste",
    etape: 0,
    fenetre: false,
    highlightConfid: false,
    choisit: false,
    occupe: false,
    natif: null,
    actifs: [],
    attente: false,
    cibleAttente: null,
    manette: false,
    signaler: null,
    debug: false,
    appuis: 0
  };
  const style = `<style>
    
    
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres) { --u: calc(100vh / 800); --c-contrib: #e5484d; --c-import: #1a9ae6; --c-applis: #ff8a1f; --c-confid: #2a6fe0; --c-aide: #2fbf71; --c-danger: var(--t2); --c-apparence: var(--pcv-cyan-plein, #2fb8ff); --c-autres: var(--t2); --c-debug: var(--pcv-ambre-texte);
      position: fixed; left: calc(var(--u) * 140); right: calc(var(--u) * 140); top: calc(var(--u) * 330); bottom: calc(var(--u) * 60); z-index: 500; box-sizing: border-box;
      border-radius: calc(var(--u) * 32); background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre), var(--pcv-lumiere-carte, 0 0 0 transparent);
      font-family: var(--pcv-police, sans-serif); color: var(--pcv-texte, #2f3a4a); }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres)[hidden] { display: none; }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) { --t2: var(--pcv-texte2, #6b7788); }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres) *, :is(#pcv-steamu, #pcv-stockage, #pcv-parametres) *::before, :is(#pcv-steamu, #pcv-stockage, #pcv-parametres) *::after { box-sizing: border-box; }
    body.pcv-steamu-ouvert .DialogContentTransition { visibility: hidden !important; }
    body.pcv-steamu-ouvert .PageListColumn [role=tab].gpfocus { box-shadow: var(--pcv-reflet), var(--pcv-ombre) !important; opacity: .85 !important; }
    
    body.pcv-steamu-ouvert .PageListColumn .pcv-f:not(#pcv-onglet-steamu) { opacity: 1 !important; box-shadow: var(--pcv-reflet), 0 0 0 calc(var(--u) * 4) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * 7) color-mix(in srgb, var(--pcv-cyan-plein) 55%, transparent) !important; }
    
    body.pcv-steamu-ouvert #pcv-onglet-steamu + [role=tab]:not(.pcv-f) { box-shadow: var(--pcv-reflet), var(--pcv-ombre), var(--pcv-lumiere-g, 0 0 0 transparent) !important; }
    
    :is(#pcv-onglet-steamu, [data-pcv-de=pcv-onglet-steamu]) .pcv-ic { container-type: size; background: none !important; box-shadow: none !important; border-radius: 0 !important; }
    :is(#pcv-onglet-steamu, [data-pcv-de=pcv-onglet-steamu]) .pcv-ic::before { content: none; }
    :is(#pcv-onglet-steamu, [data-pcv-de=pcv-onglet-steamu]) .pcv-ic .pcv-marque-relief { --pcv-relief-taille: 100cqw; --pcv-relief-teinte: var(--pcv-relief-franc); }
    :is(#pcv-onglet-steamu, [data-pcv-de=pcv-onglet-steamu]) .pcv-marque-relief::before,
    :is(#pcv-onglet-steamu, [data-pcv-de=pcv-onglet-steamu]) .pcv-marque-relief::after { content: none; }
    :is(#pcv-onglet-steamu, [data-pcv-de=pcv-onglet-steamu]) .pcv-ic .pcv-marque-relief > svg { display: block !important; }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker, #pcv-bienvenue) svg { width: 100%; height: 100%; display: block; }   
    
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres) .panneau { position: absolute; inset: 0; padding: calc(var(--u) * 18); display: flex; gap: calc(var(--u) * 18); border-radius: inherit; overflow: hidden; }
    
    #pcv-steamu .contenu, #pcv-steamu .colonne, #pcv-steamu .liste, #pcv-steamu .apparence > .reglages { scrollbar-width: none; -ms-overflow-style: none; }
    #pcv-steamu .contenu::-webkit-scrollbar, #pcv-steamu .colonne::-webkit-scrollbar, #pcv-steamu .liste::-webkit-scrollbar, #pcv-steamu .apparence > .reglages::-webkit-scrollbar { display: none; width: 0; height: 0; }
    #pcv-steamu .vue { display: none; height: 100%; } #pcv-steamu .vue.on { display: flex; }
    #pcv-steamu h3 { margin: 0 0 calc(var(--u) * 14); font-size: calc(var(--u) * 24); font-weight: 900; color: var(--t2); display: flex; align-items: center; gap: calc(var(--u) * 10); }
    #pcv-steamu h3:first-child { margin-top: 0; }
    #pcv-steamu .grille-applis { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--u) * 14); }
    #pcv-steamu .app { display: grid; grid-template-columns: auto 1fr; align-items: center; align-content: center; gap: calc(var(--u) * 8) calc(var(--u) * 12); padding: 0 calc(var(--u) * 16); border-radius: calc(var(--u) * 26); background: var(--pcv-verre); box-shadow: var(--pcv-reflet); min-width: 0; }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker, #pcv-bienvenue) .pastille { flex: none; width: calc(var(--u) * 60); height: calc(var(--u) * 60); padding: calc(var(--u) * 14); box-sizing: border-box; border-radius: 50%; background: var(--c, var(--pcv-cyan-plein, #2fb8ff)); color: var(--pcv-sur-accent); box-shadow: var(--pcv-pastille-ombre); }
    #pcv-steamu .app .pastille { width: calc(var(--u) * 48); height: calc(var(--u) * 48); padding: calc(var(--u) * 11); }
    #pcv-steamu .app b { font-size: calc(var(--u) * 22); font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #pcv-steamu .app .etat { grid-column: 1 / -1; margin: 0; }
    #pcv-steamu .etat { display: flex; align-items: center; gap: calc(var(--u) * 6); margin-top: calc(var(--u) * 4); font-size: calc(var(--u) * 17); font-weight: 800; color: var(--t2); line-height: 1.2; }
    #pcv-steamu .etat i { flex: none; width: calc(var(--u) * 22); height: calc(var(--u) * 22); padding: calc(var(--u) * 3); box-sizing: border-box; border-radius: 50%; background: #c9d1db; color: #fff; }
    #pcv-steamu .etat.ok { color: var(--pcv-vert-texte); } #pcv-steamu .etat.ok i { background: var(--pcv-vert, #2fbf71); }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page) button { border: 0; font: inherit; color: inherit; cursor: pointer; display: flex; align-items: center; gap: calc(var(--u) * 16); text-align: left; }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) .bouton { padding: 0 calc(var(--u) * 26) 0 calc(var(--u) * 14); border-radius: 999px; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); height: calc(var(--u) * 100); font-size: calc(var(--u) * 27); font-weight: 900; }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) .bouton small { display: block; font-size: calc(var(--u) * 16); font-weight: 800; color: var(--t2); }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) .bouton .pastille { width: calc(var(--u) * 72); height: calc(var(--u) * 72); padding: calc(var(--u) * 17); }
    #pcv-steamu .bouton.gros { height: calc(var(--u) * 150); font-size: calc(var(--u) * 26); background: var(--pcv-cyan); color: #fff; box-shadow: inset 0 3px 1px rgba(255,255,255,.5), 0 calc(var(--u) * 8) calc(var(--u) * 22) color-mix(in srgb, var(--pcv-cyan-plein) 30%, transparent); }
    #pcv-steamu .bouton.gros small { color: rgba(255,255,255,.92); }
    #pcv-steamu .bouton.gros .pastille { width: calc(var(--u) * 80); height: calc(var(--u) * 80); padding: calc(var(--u) * 18); background: var(--pcv-sur-accent); color: var(--pcv-cyan-plein, #2fb8ff); }
    
    #pcv-steamu .bouton.f, #pcv-steamu .credit.f, #pcv-steamu .app.f { background: var(--pcv-cyan) !important; color: var(--pcv-sur-accent) !important;
      box-shadow: var(--pcv-bombe), var(--pcv-anneau-choisi) !important; }   
    #pcv-steamu .f :is(small, .c-lignes span, .etat) { color: inherit !important; }
    
    #pcv-steamu .guide, #pcv-steamu .guides { flex-direction: column; gap: calc(var(--u) * 10); }
    #pcv-steamu .guide > *, #pcv-steamu .guides > * { flex: none; }
    #pcv-steamu .tete { display: flex; align-items: center; gap: calc(var(--u) * 12); font-size: calc(var(--u) * 26); font-weight: 900; min-width: 0; }
    #pcv-steamu .tete .pastille { width: calc(var(--u) * 46); height: calc(var(--u) * 46); padding: calc(var(--u) * 11); }
    #pcv-steamu .tete small { margin-left: auto; flex: none; font-size: calc(var(--u) * 20); color: var(--t2); }
    #pcv-steamu .bientot { flex: none; padding: calc(var(--u) * 5) calc(var(--u) * 14); border-radius: 999px; background: var(--pcv-ambre-fond); color: var(--pcv-ambre-texte); font-size: calc(var(--u) * 16); font-weight: 900; }
    #pcv-steamu .pas { display: flex; gap: calc(var(--u) * 16); align-items: center; }
    #pcv-steamu .num { flex: none; width: calc(var(--u) * 56); height: calc(var(--u) * 56); border-radius: 50%; background: var(--pcv-cyan); color: var(--pcv-sur-accent); font-size: calc(var(--u) * 32); font-weight: 900; display: flex; align-items: center; justify-content: center; box-shadow: var(--pcv-pastille-ombre); }
    #pcv-steamu .pas p { margin: 0; font-size: calc(var(--u) * 22); font-weight: 800; line-height: 1.25; }
    #pcv-steamu pre { margin: 0 0 0 calc(var(--u) * 72); padding: calc(var(--u) * 10) calc(var(--u) * 18); border-radius: calc(var(--u) * 16); background: var(--pcv-bulle); color: #e8f4ff; font: 700 calc(var(--u) * 17) / 1.3 ui-monospace, "DejaVu Sans Mono", monospace !important; white-space: pre; overflow: hidden; }
    
    #pcv-steamu .schema-qr { display: flex; align-items: center; gap: calc(var(--u) * 18); margin-left: calc(var(--u) * 72); }
    #pcv-steamu .schema-qr pre { margin: 0; }
    #pcv-steamu .schema-qr figure { margin: 0; flex: none; width: calc(var(--u) * 150); display: flex; flex-direction: column; align-items: center; gap: calc(var(--u) * 6); }
    #pcv-steamu .schema-qr .code { width: calc(var(--u) * 150); height: calc(var(--u) * 150); padding: calc(var(--u) * 8); box-sizing: border-box; background: #fff; border-radius: calc(var(--u) * 12); overflow: hidden; overflow-wrap: anywhere; }
    #pcv-steamu .schema-qr svg { width: 100%; height: 100%; display: block; }
    #pcv-steamu .schema-qr figcaption { font-size: calc(var(--u) * 15); font-weight: 800; line-height: 1.15; text-align: center; color: var(--t2); }
    #pcv-steamu .pied { margin-top: auto; display: flex; align-items: center; gap: calc(var(--u) * 12); }
    #pcv-steamu .pied .bouton { flex: none; height: calc(var(--u) * 58); font-size: calc(var(--u) * 21); padding: 0 calc(var(--u) * 22) 0 calc(var(--u) * 9); }
    #pcv-steamu .prudence { flex: 1; min-width: 0; text-align: center; font-size: calc(var(--u) * 16); font-weight: 800; line-height: 1.2; color: var(--t2); }
    
    #pcv-steamu .liste { flex: 1 !important; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: calc(var(--u) * 8); }
    #pcv-steamu .liste .bouton { height: calc(var(--u) * 56); min-width: 0; border-radius: calc(var(--u) * 28); padding: 0 calc(var(--u) * 16) 0 calc(var(--u) * 7); align-items: center; font-size: calc(var(--u) * 16); line-height: 1.15; background: #fff; box-shadow: var(--pcv-pastille-ombre); justify-content: flex-start; }
    #pcv-steamu .liste .pastille { width: calc(var(--u) * 38); height: calc(var(--u) * 38); padding: calc(var(--u) * 9); }
    #pcv-steamu .liste span.txt { display: flex; flex-direction: column; min-width: 0; line-height: 1.15; }
    #pcv-steamu .liste span.txt b { font-size: calc(var(--u) * 16); font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #pcv-steamu .liste span.txt small { font-size: calc(var(--u) * 13); font-weight: 800; color: var(--t2); margin: 0; }
    #pcv-steamu .liste em { margin-left: auto; flex: none; display: block; padding: calc(var(--u) * 4) calc(var(--u) * 12); border-radius: 999px; font-style: normal; font-size: calc(var(--u) * 13); font-weight: 900; background: var(--pcv-ambre-fond); color: var(--pcv-ambre-texte); line-height: 1.2; }
    #pcv-steamu .liste em.ok { background: color-mix(in srgb, var(--pcv-vert-texte) 16%, transparent); color: var(--pcv-vert-texte); }
    #pcv-steamu u { flex: none; display: inline-flex; align-items: center; justify-content: center; width: calc(var(--u) * 40); height: calc(var(--u) * 40); border-radius: 50%; color: var(--pcv-sur-accent);
      text-decoration: none; font-size: calc(var(--u) * 21); font-weight: 800; box-shadow: 0 0 0 calc(var(--u) * 3) var(--pcv-lisere); }
    #pcv-steamu u svg { width: 60%; height: 60%; }
    #pcv-steamu .voile { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; background: var(--pcv-voile-fenetre); z-index: 2; }   
    #pcv-steamu .voile.on { display: flex; }
    #pcv-steamu .fenetre { min-width: 55%; max-width: 85%; padding: calc(var(--u) * 28) calc(var(--u) * 40); border-radius: calc(var(--u) * 32); background: var(--pcv-fenetre-fond); box-shadow: 0 calc(var(--u) * 10) calc(var(--u) * 30) rgba(0,0,0,.2); text-align: center; }
    #pcv-steamu .fenetre h2 { margin: 0 0 calc(var(--u) * 12); font-size: calc(var(--u) * 36); font-weight: 900; }
    #pcv-steamu .fenetre ul { list-style: none; margin: 0 0 calc(var(--u) * 20); padding: 0; font-size: calc(var(--u) * 24); font-weight: 800; line-height: 1.45; }
    #pcv-steamu .fenetre .bouton { margin: 0 auto; height: calc(var(--u) * 70); padding: 0 calc(var(--u) * 34) 0 calc(var(--u) * 12); background: var(--pcv-cyan); color: var(--pcv-sur-accent); }
    
    #pcv-steamu .fenetre.signaler { display: flex; flex-direction: column; align-items: center; gap: calc(var(--u) * 14); max-width: calc(var(--u) * 360); }
    #pcv-steamu .fenetre.signaler p { margin: 0; font-size: calc(var(--u) * 18); font-weight: 800; color: var(--pcv-texte2); line-height: 1.4; }
    #pcv-steamu .fenetre.signaler .signaler-qr { width: calc(var(--u) * 220); height: calc(var(--u) * 220); padding: calc(var(--u) * 12); background: #fff; border-radius: calc(var(--u) * 14); }
    #pcv-steamu .fenetre.signaler .signaler-qr svg { width: 100%; height: 100%; display: block; }
    #pcv-steamu .fenetre.signaler .signaler-fichier { font-size: calc(var(--u) * 14); font-weight: 700; color: var(--pcv-texte2); opacity: .8; }
    #pcv-steamu .fenetre.signaler .choix { display: flex; gap: calc(var(--u) * 14); flex-wrap: wrap; justify-content: center; }
    
    #pcv-steamu .fenetre.signaler .choix .bouton .pastille { width: calc(var(--u) * 34); height: calc(var(--u) * 34); padding: calc(var(--u) * 8); }
    
    #pcv-steamu .apparence { flex-direction: column; gap: calc(var(--u) * 10); }
    #pcv-steamu .apparence > * { flex: none; }
    #pcv-steamu .apparence > .reglages { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: calc(var(--u) * 7); }
    
    #pcv-steamu :is(.liste, .apparence > .reglages) { padding: var(--pcv-marge-ombre); margin: calc(var(--pcv-marge-ombre) * -1); scroll-padding: var(--pcv-marge-ombre); pointer-events: none;
      -webkit-mask-image: var(--pcv-masque-marge); mask-image: var(--pcv-masque-marge); } #pcv-steamu :is(.liste, .apparence > .reglages) > * { pointer-events: auto; }
    #pcv-steamu .ligne { flex: none; height: calc(var(--u) * 44); border-radius: calc(var(--u) * 22); padding: 0 calc(var(--u) * 22); font-size: calc(var(--u) * 19); justify-content: space-between; box-shadow: var(--pcv-reflet); }
    #pcv-steamu .ligne b { font-weight: 900; } #pcv-steamu .ligne b i { font-style: normal; color: var(--pcv-cyan-plein, #2fb8ff); padding: 0 calc(var(--u) * 8); }
    #pcv-steamu .info { margin: 0; font-size: calc(var(--u) * 17); font-weight: 800; line-height: 1.3; color: var(--t2); }
    
    
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page) :is(.colonne, .contenu), #pcv-miimaker .colonne-mm { padding: var(--pcv-marge-ombre); margin: calc(var(--pcv-marge-ombre) * -1); scroll-padding: var(--pcv-marge-ombre); pointer-events: none;
      -webkit-mask-image: var(--pcv-masque-marge); mask-image: var(--pcv-masque-marge); }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page) :is(.colonne, .contenu) > *, #pcv-miimaker .colonne-mm > * { pointer-events: auto; }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page) .colonne { flex: 0 0 calc(var(--u) * 316); display: flex; flex-direction: column; gap: var(--pcv-ecart-choix); overflow-y: auto; }   
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) :is(.colonne, .colonne-mm) .onglet span { display: flex; flex-direction: column; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) :is(.colonne, .colonne-mm) .onglet :is(b, small) { overflow: hidden; text-overflow: ellipsis; font-weight: inherit; }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) :is(.colonne, .colonne-mm) .onglet small { font-size: calc(var(--u) * 13); font-weight: 800; }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) .onglet.choisi small { color: rgba(255,255,255,.92); }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) :is(.colonne, .colonne-mm) .onglet { flex: none; height: calc(var(--u) * 64); border-radius: calc(var(--u) * 24); font-size: calc(var(--u) * 17); padding: 0 calc(var(--u) * 14); gap: calc(var(--u) * 12); white-space: nowrap; }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) :is(.colonne, .colonne-mm) .onglet .pastille { width: calc(var(--u) * 36); height: calc(var(--u) * 36); padding: calc(var(--u) * 8); }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) .onglet.choisi { background: var(--pcv-cyan); color: #fff; box-shadow: var(--pcv-bombe), 0 calc(var(--u) * 5) calc(var(--u) * 15) color-mix(in srgb, var(--pcv-cyan-plein) 30%, transparent); }
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) .onglet.choisi .pastille { color: #fff; background: rgba(255,255,255,.26); }
    
    :is(#pcv-steamu, #pcv-stockage, #pcv-parametres, #pcv-spotpass-page) .contenu { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow-y: auto; }
    
    :is(#pcv-steamu .contenu, #pcv-spotpass-page .contenu, #pcv-miimaker .panneau) :is(.credit, .app, .confid-ligne, .danger-liste .bouton, .liste .bouton, .bouton.gros, .ligne) { flex: none; min-height: calc(var(--u) * 64); height: auto;
      border-radius: calc(var(--u) * 24); padding: calc(var(--u) * 12) calc(var(--u) * 14) calc(var(--u) * 12) calc(var(--u) * 22); gap: calc(var(--u) * 12);
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); color: var(--pcv-texte); font-size: calc(var(--u) * 17); font-weight: 900; }
    :is(#pcv-steamu .contenu, #pcv-spotpass-page .contenu, #pcv-miimaker .panneau) :is(small, .c-lignes span, .liste span.txt small) { font-size: calc(var(--u) * 13); font-weight: 800; }
    #pcv-steamu .contenu :is(.c-tete b, .liste span.txt b, .app b) { font-size: calc(var(--u) * 17); }
    :is(#pcv-steamu .contenu, #pcv-spotpass-page .contenu, #pcv-miimaker .panneau) :is(.app, .confid-ligne, .danger-liste .bouton, .liste .bouton, .bouton.gros) .pastille { width: calc(var(--u) * 36); height: calc(var(--u) * 36); padding: calc(var(--u) * 8); }
    
    :is(#pcv-spotpass-page .contenu, #pcv-miimaker .panneau) .confid-ligne .pastille:has(> img:not([hidden])) { padding: 0; overflow: hidden; }
    :is(#pcv-spotpass-page .contenu, #pcv-miimaker .panneau) .confid-ligne .pastille > img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 40%; }
    #pcv-steamu .contenu .bouton.gros .pastille { background: var(--pcv-cyan); color: var(--pcv-sur-accent); }
    #pcv-steamu .contenu .bouton.gros small { color: var(--t2); }
    #pcv-steamu .contenu .grille-applis { flex: none; grid-template-columns: 1fr; gap: var(--pcv-ecart-choix); }
    #pcv-steamu .contenu .grille-credits { flex: none; grid-template-columns: 1fr 1fr; gap: var(--pcv-ecart-choix); }   
    #pcv-steamu .contenu .app { grid-template-columns: auto 1fr auto; }
    #pcv-steamu .contenu .app .etat { grid-column: auto; font-size: calc(var(--u) * 15); }
    :is(#pcv-steamu .contenu, #pcv-spotpass-page .contenu, #pcv-miimaker .panneau) :is(.liste, .danger-liste, .apparence > .reglages) { gap: var(--pcv-ecart-choix); }
    #pcv-steamu .contenu .imp-corps { gap: calc(var(--u) * 10); }
    
    #pcv-steamu .nouveautes > .liste { margin-top: 0; margin-bottom: 0; }
    #pcv-steamu .contenu h3 { margin: calc(var(--u) * 8) 0 calc(var(--u) * 6); font-size: calc(var(--u) * 17); }
    #pcv-steamu .contenu .guide { zoom: .85; }
    
    #pcv-steamu .contenu .vue.on { flex-direction: column; }
    
    #pcv-steamu .licence-su { align-self: flex-start; flex: none; height: calc(var(--u) * 34); padding: 0 calc(var(--u) * 18); border-radius: calc(var(--u) * 17); background: rgba(0,0,0,.06); color: var(--t2); font-size: calc(var(--u) * 14); font-weight: 800; display: flex; align-items: center; }
    #pcv-steamu .ico-mini { flex: none; width: calc(var(--u) * 28); height: calc(var(--u) * 28); padding: calc(var(--u) * 6); box-sizing: border-box; border-radius: 50%; background: rgba(0,0,0,.06); color: var(--pcv-cyan-plein, #2fb8ff); }
    #pcv-steamu .grille-credits { flex: none; display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--u) * 10); margin-bottom: calc(var(--u) * 4); }
    #pcv-steamu .credit { border-radius: calc(var(--u) * 18); background: var(--pcv-verre); box-shadow: var(--pcv-reflet); padding: calc(var(--u) * 12) calc(var(--u) * 16); display: flex; flex-direction: column; gap: calc(var(--u) * 4); cursor: pointer; }
    #pcv-steamu .c-tete { display: flex; align-items: center; gap: calc(var(--u) * 8); margin-bottom: calc(var(--u) * 2); }
    #pcv-steamu .c-tete .ico-mini { background: rgba(0,0,0,.05); color: var(--pcv-texte); }
    #pcv-steamu .c-tete b { font-size: calc(var(--u) * 16); font-weight: 900; }
    #pcv-steamu .c-lignes span { display: block; font-size: calc(var(--u) * 13); font-weight: 800; color: var(--t2); line-height: 1.35; }
    #pcv-steamu .c-lignes .lien { color: var(--pcv-cyan-plein, #4fa8e0); }
    
    #pcv-steamu .imp-corps { flex: 1; min-height: 0; display: flex; flex-direction: column; }
    
    
    :is(#pcv-steamu, #pcv-spotpass-page, #pcv-miimaker) .confid-ligne small { display: block; font-size: calc(var(--u) * 14); font-weight: 800; color: var(--t2); margin-top: calc(var(--u) * 3); }
    :is(#pcv-steamu, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) .inter { margin-left: auto; flex: none; width: calc(var(--u) * 64); height: calc(var(--u) * 34); border-radius: calc(var(--u) * 17); background: #dfe5ec; box-shadow: inset 0 2px 4px rgba(60,85,120,.2); position: relative; }
    :is(#pcv-steamu, #pcv-parametres, #pcv-spotpass-page, #pcv-miimaker) .inter::after { content: ""; position: absolute; left: calc(var(--u) * 3); top: calc(var(--u) * 3); width: calc(var(--u) * 28); height: calc(var(--u) * 28); border-radius: 50%; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,.2); transition: left .15s; }
    :is(#pcv-steamu .confid-ligne, #pcv-parametres .ligne, #pcv-spotpass-page .confid-ligne, #pcv-miimaker .confid-ligne).oui .inter { background: var(--pcv-cyan); } :is(#pcv-steamu .confid-ligne, #pcv-parametres .ligne, #pcv-spotpass-page .confid-ligne, #pcv-miimaker .confid-ligne).oui .inter::after { left: calc(var(--u) * 33); }
    
    #pcv-steamu .vise { box-shadow: var(--pcv-reflet), 0 0 0 calc(var(--u) * 4) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * 8) var(--pcv-cyan-plein, #2fb8ff) !important; }
    :is(#pcv-steamu, #pcv-spotpass-page, #pcv-miimaker) .note { font-size: calc(var(--u) * 15); font-weight: 800; color: var(--t2); line-height: 1.4; margin: 0; }
    
    :is(#pcv-steamu, #pcv-spotpass-page, #pcv-miimaker) .danger-liste { display: flex; flex-direction: column; gap: calc(var(--u) * 14); }
    
    #pcv-steamu .conflits-avis { display: flex; gap: calc(var(--u) * 12); align-items: flex-start; margin: 0 0 calc(var(--u) * 16); }
    #pcv-steamu .conflits-avis .pastille { width: calc(var(--u) * 40); height: calc(var(--u) * 40); padding: calc(var(--u) * 9); flex: none; background: var(--pcv-ambre-fond); color: var(--pcv-ambre-texte); }
    #pcv-steamu .conflits-avis b { display: block; font-size: calc(var(--u) * 15); font-weight: 900; margin-bottom: calc(var(--u) * 2); }
    #pcv-steamu .conflits-avis .note + .note { margin-top: calc(var(--u) * 6); }
    
    #pcv-steamu .ligne-reg em { margin-left: auto; flex: none; padding: calc(var(--u) * 6) calc(var(--u) * 16); border-radius: 999px; font-style: normal; font-size: calc(var(--u) * 15); font-weight: 900; background: rgba(0,0,0,.06); color: var(--pcv-cyan-plein); }
    #pcv-steamu .ligne-reg.f em { background: rgba(255,255,255,.25); color: inherit; }
    
    #pcv-steamu .contrib .version { align-self: flex-start; flex: none; height: calc(var(--u) * 34); margin-top: calc(var(--u) * 8); padding: 0 calc(var(--u) * 18); border-radius: calc(var(--u) * 17); background: rgba(0,0,0,.06); box-shadow: none; color: var(--t2); font-size: calc(var(--u) * 14); font-weight: 800; gap: calc(var(--u) * 10); }
    #pcv-steamu .contrib .version small { font-size: calc(var(--u) * 13); color: var(--pcv-cyan-plein); }
  </style>`;
  document.getElementById("pcv-steamu-style")?.remove();
  document.head.insertAdjacentHTML("beforeend", style.replace("<style>", '<style id="pcv-steamu-style">'));
  const ouvrirLien = (url) => {
    if (!url) return;
    son("choisir");
    const u = /^https?:\/\//.test(url) ? url : "https://" + url;
    try {
      (O?.SteamClient || window.SteamClient)?.System?.OpenInSystemBrowser(u);
    } catch (e) {
    }
  };
  const ligneCredit = (e) => `<div class="credit" data-a="lien:${esc(e.lien || "")}"><div class="c-tete"><i class="ico-mini">${ico(ICO[e.ico] || ICO.etoile)}</i><b>${esc(T(e.nom))}</b></div>
      <div class="c-lignes">${e.auteurs ? `<span>${T("steamu.credits.lbl.auteurs")}${T("commun.deux_points")}${esc(T(e.auteurs))}</span>` : ""}
      ${e.cheznous ? `<span>${T("steamu.credits.lbl.cheznous")}${T("commun.deux_points")}${esc(T(e.cheznous))}</span>` : ""}
      ${e.licence ? `<span>${T("steamu.credits.lbl.licence")}${T("commun.deux_points")}${esc(T(e.licence))}</span>` : ""}
      ${e.lien ? `<span class="lien">${esc(e.lien)}</span>` : ""}</div></div>`;
  const dessinerContrib = () => {
    const c = CREDITS();
    return `<div class="vue contrib${S.og === "contrib" ? " on" : ""}"><div class="licence-su">${T("steamu.licence")}</div>
      ${CATEGORIES.map(([id, ic]) => c[id]?.length ? `<h3><i class="ico-mini">${ico(ICO[ic])}</i>${T("steamu.credits." + id)}</h3>
        <div class="grille-credits">${c[id].map(ligneCredit).join("")}</div>` : "").join("")}
      <button class="bouton version" data-a="version">${T("steamu.version", { v: esc(version()) })}${S.appuis >= 4 ? `<small>${T(S.appuis === 6 ? "steamu.debug.encore1" : "steamu.debug.encore", { n: 7 - S.appuis })}</small>` : ""}</button></div>`;
  };
  const version = () => (O || window).DeckyPluginLoader?.plugins?.find((p) => p.name === window.__pcvGreffon?.nom)?.version || "?";
  const bientot = (g) => g.pret ? "" : `<span class="bientot">${T("steamu.bientot")}</span>`;
  const dessinerNouveautes = () => {
    const notes = window.__pcvQuoiDeNeuf?.notes() || [];
    return `<button class="bouton gros" data-a="revoir-nouveautes"><i class="pastille">${ico(ICO.etoile)}</i><span>${T("bienvenue.revoir")}<small>${T("steamu.nouveautes.aide")}</small></span></button>
      <div class="liste">${notes.length ? notes.map((l) => `<div class="bouton"><span class="txt">${esc(l)}</span></div>`).join("") : (window.__pcvBienvenue?.cles || []).map((c) => `<button class="bouton"><i class="pastille">${ico(ICO.etoile)}</i><span class="txt"><b>${T(`bienvenue.${c}.titre`)}</b><small>${T(`bienvenue.${c}.texte`)}</small></span></button>`).join("")}</div>`;
  };
  const dessinerImportListe = () => `<button class="bouton gros" data-a="importer"><i class="pastille">${ico(ICO.importer)}</i><span>${T("steamu.importer")}<small>${T("steamu.importer.aide")}</small></span></button>
      <div class="liste">${dessinerMoteur()}${GUIDES().map((g) => `<button class="bouton" data-a="g:${g.id}"><i class="pastille" style="--c:${g.c}">${ico(g.ico)}</i>
        <span class="txt"><b>${T(`steamu.guide.${g.id}.titre`)}</b><small>${T(`steamu.guide.${g.id}.sous`)}</small></span>
        <em class="${g.pret ? "ok" : ""}">${etatGuide(g) || T(g.pret ? "steamu.a_importer" : "steamu.bientot.court")}</em></button>`).join("")}</div>`;
  const dessinerMoteur = () => {
    const ok = etatImport?.moteur_ffl;
    return `<button class="bouton"${ok ? "" : ' data-a="moteur-installer"'}><i class="pastille" style="--c:#2fbf71">${ico(ICO.mii)}</i>
        <span class="txt"><b>${T("steamu.moteur.etat", { etat: T(ok ? "steamu.moteur.la" : "steamu.moteur.manque") })}</b><small>${T("steamu.moteur.aide")}</small></span>
        <em class="${ok ? "ok" : ""}">${T(ok ? "steamu.lisible" : S.moteurCours ? "steamu.moteur.cours" : "steamu.moteur.installer")}</em></button>`;
  };
  const etatGuide = (g) => {
    const e = etatImport, m = e?.musiques_wiiu, s3 = e?.sons?.["3ds"];
    if (g.id === "wiiu" && m?.sur) return T("steamu.etat.compte", { n: m.n, sur: m.sur });
    if (g.id === "sons3ds" && s3?.sur) return T("steamu.etat.compte", { n: s3.n, sur: s3.sur });
    if (g.id === "switch" && e?.sons?.switch?.sur) return T("steamu.etat.compte", { n: e.sons.switch.n, sur: e.sons.switch.sur });
    return g.id === "cle3ds" && e?.cle3ds || g.id === "mii" && e?.mii || g.id === "moteur" && e?.applis?.mii?.pret || g.id === "luigi" && e?.applis?.casino?.pret || g.id === "badges" && e?.badge_arcade ? T("steamu.etat.la") : "";
  };
  const codeQR = (url) => {
    let svg = "";
    try {
      svg = window.__pcvMiiQR?.genererSvg?.(url, 1) || "";
    } catch (e) {
    }
    return svg || `<small>${esc(url)}</small>`;
  };
  const dessinerSchema = (sc) => !sc.qr ? `<pre>${esc(sc)}</pre>` : `<div class="schema-qr"><pre>${esc(sc.texte)}</pre>${sc.qr.map(([cle, url]) => `<figure><div class="code">${codeQR(url)}</div><figcaption>${T(cle)}</figcaption></figure>`).join("")}</div>`;
  const dessinerGuideInterne = () => {
    const g = guide(), n = S.etape + 1, total = g.schemas.length, pr = `steamu.guide.${g.id}.prudence`;
    return `<div class="guide"><div class="tete"><i class="pastille" style="--c:${g.c}">${ico(g.ico)}</i>${T(`steamu.guide.${g.id}.titre`)}${bientot(g)}<small>${T("steamu.guide.etape", { n, total })}</small></div>
      <div class="pas"><div class="num">${n}</div><p>${T(`steamu.guide.${g.id}.${n}`)}</p></div>${dessinerSchema(g.schemas[S.etape])}
      <div class="pied"><button class="bouton" data-a="retour-import">${touche(2)}${T("touche.retour")}</button><span class="prudence">${T(pr) === pr ? T("steamu.guide.prudence") : T(pr)}</span>
        <button class="bouton" data-a="avant">\u25C0</button><button class="bouton" data-a="apres">${touche(1)}${n < total ? "\u25B6" : T("touche.terminer")}</button></div></div>`;
  };
  const dessinerImport = () => `<div class="vue import${S.og === "import" ? " on" : ""}"><div class="imp-corps">${S.vueImport === "guide" ? dessinerGuideInterne() : dessinerImportListe()}</div></div>`;
  const ligneApp = ([a, c]) => (m) => {
    const manque = m?.[a], ok = Array.isArray(manque) && !manque.length;
    const quoi = Array.isArray(manque) ? [...new Set(manque.map((d) => {
      const k = "verrou.manque." + d, t = T(k);
      return t === k ? T("verrou.manque.inconnu") : t;
    }))].join(", ") : "";
    const etat2 = !m ? T("steamu.attente") : ok ? T("steamu.prete") : T("steamu.manque", { quoi });
    return `<div class="app"><i class="pastille" style="--c:${c}">${ico(ICO[a])}</i><b>${T("steamu.appli." + a)}</b>
      <span class="etat${ok ? " ok" : ""}"><i>${ico(ok ? ICO.ok : ICO.manque)}</i>${etat2}</span></div>`;
  };
  const dessinerApplis = (m) => `<div class="vue applis${S.og === "applis" ? " on" : ""}"><h3>${T("steamu.applis.titre")}</h3><div class="grille-applis">${APPLIS.map((p) => ligneApp(p)(m)).join("")}</div></div>`;
  const dessinerConfid = () => `<div class="vue confid${S.og === "confid" ? " on" : ""}">
      <button class="bouton confid-ligne${artAutoActif() ? " oui" : ""}" data-a="art-auto-bascule"><i class="pastille">${ico(ICO.image)}</i>
        <span>${T("steamu.confid.art_auto")}<small>${T("steamu.confid.art_auto.aide")}</small></span><i class="inter"></i></button>
      <button class="bouton confid-ligne${parolesActif() ? " oui" : ""}${S.highlightConfid === "paroles-bascule" ? " vise" : ""}" data-a="paroles-bascule"><i class="pastille">${ico(ICO.paroles)}</i>
        <span>${T("steamu.confid.paroles")}<small>${T("steamu.confid.paroles.aide")}</small></span><i class="inter"></i></button>
      <button class="bouton confid-ligne${majActif() ? " oui" : ""}" data-a="maj-bascule"><i class="pastille">${ico(ICO.internet)}</i>
        <span>${T("steamu.confid.maj")}<small>${T("steamu.confid.maj.aide")}</small></span><i class="inter"></i></button>
      <button class="bouton confid-ligne${horsStoreActif() ? " oui" : ""}${S.highlightConfid === "hors-store-bascule" ? " vise" : ""}" data-a="hors-store-bascule"><i class="pastille">${ico(ICO.prise)}</i>
        <span>${T("steamu.confid.hors_store")}<small>${T("steamu.confid.hors_store.aide")}</small></span><i class="inter"></i></button>
      ${dessinerSpot()}<p class="note">${T("steamu.confid.note")}</p></div>`;
  const SP = {
    cle: "pcv-spotpass",
    region: "pcv-spotpass-region",
    regionDefaut: "FR",
    pseudo: "pcv-spotpass-pseudo",
    phrase: "pcv-spotpass-phrase",
    pose: "pcv-spotpass-pose",
    recus: "pcv-spotpass-recus",
    visiteurs: "pcv-spotpass-visiteurs",
    etat: "pcv-spotpass-etat",
    caches: "pcv-spotpass-caches",
    garder: 40,
    semaine: 7 * 864e5,
    raisons: ["pseudo", "phrase", "mii", "autre"],
    vert: "#2fbf71",
    bleu: "#2f8fe8",
    max: { pseudo: 10, phrase: 32 },
    essai: 3e4,
    // (30/10, l'auteur) la pose de son Mii sur la carte : une des 14 poses du Mii Maker (vrais-mii.js, CLIPS), ou aucune ;
    // la même liste fermée dans py_modules/spotpass.py et le service
    poses: Array.from({ length: 14 }, (_, k) => "pose" + (k + 1))
  };
  const spActif = () => lireBool(SP.cle, false) === true;
  const spEtatRond = () => {
    const e = lireBool(SP.etat, null) || {};
    return !spActif() ? "coupe" : !e.carte ? "attente" : e.neuf ? "neuf" : "on";
  };
  const spMaj = () => {
    if (S.actif) dessiner();
    window.__pcvSpotPassRond?.();
    window.__pcvSpotPassFenetre?.maj?.();
    window.__pcvSpotPassPage?.maj?.();
    window.__pcvMiiMaker?.rafraichirSpotPass?.();
  };
  const spBon = (m) => !!m && ["cle", "mii", "pseudo", "phrase", "region"].every((k) => typeof m[k] === "string") && Array.isArray(m.tenue) && !(window.__pcvMiiBase?.valider?.(m.mii) ?? ["gestionnaire des Mii absent"]).length;
  const spCaches = () => {
    const l = lireBool(SP.caches, []);
    return new Set(Array.isArray(l) ? l : []);
  };
  const spVisiteur = (m) => m?.visiteur === true || m?.cle?.startsWith?.("v-defaut-") === true;
  {
    const l = lireBool(SP.recus, []), v = lireBool(SP.visiteurs, []);
    if (Array.isArray(l) && l.some(spVisiteur)) {
      ecrireBool(SP.visiteurs, [...new Map([...Array.isArray(v) ? v.filter(spVisiteur) : [], ...l.filter(spVisiteur)].map((m) => [m.cle, m])).values()]);
      ecrireBool(SP.recus, l.filter((m) => !spVisiteur(m)));
      if (!l.some((m) => m && !spVisiteur(m))) {
        const e = lireBool(SP.etat, null);
        if (e?.neuf) ecrireBool(SP.etat, { ...e, neuf: false });
      }
    }
  }
  const spListe = (cle) => {
    const l = lireBool(cle, []), c = spCaches();
    return Array.isArray(l) ? l.filter((m) => spBon(m) && !c.has(m.cle)) : [];
  };
  const spRecus = () => spListe(SP.recus).filter((m) => !spVisiteur(m));
  const spVisiteurs = () => spListe(SP.visiteurs).filter(spVisiteur);
  const spPhrase = () => {
    const p = lireBool(SP.phrase, null);
    return typeof p === "string" && p ? p : T("spotpass.phrase.defaut");
  };
  const spPseudo = () => {
    const p = lireBool(SP.pseudo, null);
    if (typeof p === "string" && p) return p;
    const l = T("spotpass.pseudo.noms").split(","), n = l[Math.floor(Math.random() * l.length)] + (1 + Math.floor(Math.random() * 99));
    ecrireBool(SP.pseudo, n);
    return n;
  };
  const spPose = () => {
    const p = lireBool(SP.pose, "");
    return SP.poses.includes(p) ? p : "";
  };
  const spNomPose = (p) => T("spotpass.pose." + (p || "aucune"));
  const spJour = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const spRegionLocale = () => (/[-_]([A-Z]{2})\b/.exec(navigator.language || "") || /-([A-Z]{2})$/.exec(window.__pcvLocale?.() || ""))?.[1] || SP.regionDefaut;
  const spRegions = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ  CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI  GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI  LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF  PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL  TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(/\s+/);
  const spRegion = () => {
    const r = lireBool(SP.region, null);
    const locale = spRegionLocale();
    return spRegions.includes(r) ? r : spRegions.includes(locale) ? locale : SP.regionDefaut;
  };
  const spChoisirRegion = (apres) => {
    const l = spRegions.slice().sort((a, b) => spNomRegion(a).localeCompare(spNomRegion(b)));
    window.__pcvDossiers?.liste?.({
      ailleurs: true,
      titre: T("miimaker.pays"),
      choix: l.map((r) => spDrapeau(r) + " " + spNomRegion(r)),
      v: l.indexOf(spRegion()),
      ok: (k) => {
        ecrireBool(SP.region, l[k]);
        spMaj();
        apres?.();
        spSync();
      }
    }) || son("bord");
  };
  const spNomRegion = (r) => {
    try {
      return new Intl.DisplayNames([window.__pcvLocale?.() || "fr-FR"], { type: "region" }).of(r) || r;
    } catch (e) {
      return r;
    }
  };
  let spDrapeaux = null;
  const spDrapeau = (r) => {
    if (!/^[A-Z]{2}$/.test(r || "")) return "";
    spDrapeaux ??= (() => {
      try {
        const c = document.createElement("canvas").getContext("2d");
        c.font = "32px sans-serif";
        return c.measureText("\u{1F1EB}\u{1F1F7}").width < 1.5 * c.measureText("\u{1F1EB}").width;
      } catch (e) {
        return false;
      }
    })();
    return spDrapeaux ? String.fromCodePoint(...[...r].map((x) => 127462 + x.charCodeAt(0) - 65)) : r;
  };
  const spAvis = (body) => {
    try {
      (O || window).DeckyPluginLoader.toaster.toast({ title: T("spotpass.titre"), body, duration: 8e3 });
    } catch (e) {
    }
  };
  const spErreur = (code) => {
    const k = "spotpass.erreur." + code;
    return T(k) === k ? T("spotpass.erreur.autre") : T(k);
  };
  let spCours = null, spProchain = 0;
  const spSync = () => spCours ||= (async () => {
    if (!spActif()) return;
    if (window.__pcvNintendo?.mii === false) return;
    const moi = window.__pcvMiiBase?.moi?.(), e = lireBool(SP.etat, null) || {};
    if (!moi) {
      ecrireBool(SP.etat, { ...e, erreur: "sans_mii" });
      window.__pcvSpotPassFenetre?.envoi?.("sans_mii");
      return;
    }
    const tenue = (window.__pcvGardeRobe?.tenue?.(moi.id) || []).join(","), pseudo = spPseudo(), phrase = spPhrase(), pose = spPose(), carte = [moi.donnees, pseudo, phrase, spRegion(), tenue, pose].join("|");
    if (carte !== e.carte || Date.now() - (e.envoi || 0) > SP.semaine) {
      const attente = !e.carte;
      clearTimeout(window.__pcvSpotPassEssai);
      spProchain = 0;
      const r2 = await appel("spotpass", ["envoyer", moi.donnees, pseudo, phrase, spRegion(), tenue, pose], 3e4);
      if (!r2?.ok) {
        const erreur = r2?.erreur || "reseau";
        ecrireBool(SP.etat, { ...e, erreur });
        if (attente && erreur === "reseau") {
          spProchain = Date.now() + SP.essai;
          window.__pcvSpotPassEssai = setTimeout(spSync, SP.essai);
        }
        window.__pcvSpotPassFenetre?.envoi?.(erreur);
        return r2;
      }
      Object.assign(e, { carte, envoi: Date.now(), erreur: null });
      ecrireBool(SP.etat, e);
      if (!window.__pcvSpotPassFenetre?.envoi?.(null) && attente) spAvis(T("spotpass.parti"));
    }
    const langue = window.__pcvLangue?.() || "fr";
    if (e.jour === spJour() && e.langue === langue) return;
    const r = await appel("spotpass", ["lot", langue], 3e4);
    if (!Array.isArray(r?.mii)) {
      ecrireBool(SP.etat, { ...e, erreur: r?.erreur || "reseau", ...r?.erreur === "inconnue" ? { carte: null } : {} });
      return r;
    }
    const frais = new Map(r.mii.filter(spBon).map((m) => [m.cle, m.phrase])), avant = [...spRecus(), ...spVisiteurs()].map((m) => frais.has(m.cle) ? { ...m, phrase: frais.get(m.cle) } : m), vus = /* @__PURE__ */ new Set([...avant.map((m) => m.cle), ...spCaches()]), arrives = r.mii.filter((m) => spBon(m) && !vus.has(m.cle)).map((m) => ({ ...m, jour: spJour() })), neufs = arrives.filter((m) => !spVisiteur(m));
    ecrireBool(SP.recus, [...neufs, ...avant.filter((m) => !spVisiteur(m))].slice(0, SP.garder));
    ecrireBool(SP.visiteurs, [...arrives, ...avant].filter(spVisiteur).slice(0, SP.garder));
    ecrireBool(SP.etat, { ...e, jour: spJour(), langue, erreur: null, neuf: e.neuf || neufs.length > 0 });
    if (!neufs.length) return;
    spAvis(T(neufs.length > 1 ? "spotpass.arrivee.n" : "spotpass.arrivee.un", { n: neufs.length }));
  })().catch(() => null).finally(() => {
    spCours = null;
    spMaj();
  });
  const spBasculer = () => {
    const Q = window.__pcvDossiers;
    if (spActif()) return Q?.demander?.({
      ailleurs: true,
      svg: ICO.antenne,
      titre: T("spotpass.couper.titre"),
      texte: T("spotpass.couper.texte"),
      non: T("steamu.annuler"),
      oui: T("spotpass.couper"),
      ok: async () => {
        ecrireBool(SP.cle, false);
        ecrireBool(SP.etat, {});
        clearTimeout(window.__pcvSpotPassEssai);
        spMaj();
        const r = await appel("spotpass", ["effacer"], 3e4);
        if (!r?.ok) spAvis(T("spotpass.effacement_rate"));
      }
    }) || son("bord");
    if (!window.__pcvSpotPassFenetre?.ouvrir?.()) son("bord");
  };
  const spEcrire = (quoi, val = quoi === "pseudo" ? spPseudo() : spPhrase(), max = SP.max[quoi], apres) => {
    const avant = lireBool(SP[quoi], null);
    window.__pcvDossiers?.renommer?.(null, { nom: val, max, titre: T(`spotpass.${quoi}.titre`), ok: (t) => {
      if (!t) return false;
      ecrireBool(SP[quoi], t);
      spMaj();
      apres?.();
      spSync().then((r) => {
        if (r?.erreur === quoi) {
          ecrireBool(SP[quoi], avant);
          spAvis(spErreur(quoi));
          ecrireBool(SP.etat, { ...lireBool(SP.etat, {}), erreur: null });
          spMaj();
          apres?.();
        }
      });
      return true;
    } }) || son("bord");
  };
  const spChoisirPose = (apres) => {
    const l = ["", ...SP.poses];
    window.__pcvDossiers?.liste?.({
      ailleurs: true,
      titre: T("spotpass.pose.titre"),
      choix: l.map(spNomPose),
      v: l.indexOf(spPose()),
      ok: (k) => {
        ecrireBool(SP.pose, l[k]);
        spMaj();
        apres?.();
        spSync();
      }
    }) || son("bord");
  };
  const spSignaler = (m) => window.__pcvDossiers?.liste?.({
    ailleurs: true,
    svg: ICO.danger,
    titre: T("spotpass.signaler.titre", { nom: m.pseudo }),
    choix: SP.raisons.map((r) => T("spotpass.raison." + r)),
    ok: (k) => {
      ecrireBool(SP.caches, [...spCaches(), m.cle]);
      if (!m.visiteur && spActif()) appel("spotpass", ["signaler", m.cle, SP.raisons[k]], 3e4);
      spAvis(T("spotpass.signale"));
      spMaj();
    }
  }) || son("bord");
  const spRetirer = (m) => window.__pcvDossiers?.demander?.({
    ailleurs: true,
    titre: T("spotpass.retirer.titre", { nom: m.pseudo }),
    texte: T("spotpass.retirer.texte"),
    non: T("steamu.annuler"),
    oui: T("spotpass.f.retirer"),
    ok: () => {
      ecrireBool(SP.caches, [...spCaches(), m.cle]);
      spMaj();
    }
  }) || son("bord");
  const spRencontre = (m) => window.__pcvDossiers?.liste?.({ ailleurs: true, titre: m.pseudo, choix: [T("spotpass.f.retirer"), T("spotpass.f.signaler")], ok: (k) => (k ? spSignaler : spRetirer)(m) }) || son("bord");
  const dessinerSpot = () => `<button class="bouton confid-ligne" data-a="sp-ouvrir"><span>${T("spotpass.titre")}<small>${T("miimaker.ouvrir_spotpass")}</small></span></button>`;
  window.__pcvSpotPass = {
    max: SP.max,
    actif: spActif,
    mii: spRecus,
    visiteurs: spVisiteurs,
    nomRegion: spNomRegion,
    sync: spSync,
    neuf: () => spActif() && !!lireBool(SP.etat, null)?.neuf,
    etatRond: spEtatRond,
    etat: () => lireBool(SP.etat, null) || {},
    pseudo: spPseudo,
    phrase: spPhrase,
    pose: spPose,
    drapeau: spDrapeau,
    signaler: spSignaler,
    rencontre: spRencontre,
    nomPose: spNomPose,
    choisirPose: spChoisirPose,
    ecrire: (quoi, apres) => spEcrire(quoi, void 0, void 0, apres),
    codeRegion: spRegion,
    choisirRegion: spChoisirRegion,
    region: () => spNomRegion(spRegion()),
    activer: () => {
      ecrireBool(SP.cle, true);
      spMaj();
      return Promise.resolve(spCours).then(spSync);
    },
    couper: spBasculer,
    essai: SP.essai,
    prochainEssai: () => spProchain,
    vu: () => {
      const e = lireBool(SP.etat, null);
      if (e?.neuf) {
        ecrireBool(SP.etat, { ...e, neuf: false });
        spMaj();
      }
    }
  };
  window.__pcvSpotPassRond?.();
  clearInterval(window.__pcvSpotPassVeille);
  clearTimeout(window.__pcvSpotPassDebut);
  clearTimeout(window.__pcvSpotPassEssai);
  window.__pcvSpotPassDebut = setTimeout(spSync, 2e4);
  window.__pcvSpotPassVeille = setInterval(spSync, 36e5);
  const dessinerConflits = () => {
    const cles = Object.keys(conflitsActifs);
    if (!cles.length) return "";
    return `<div class="conflits-avis"><i class="pastille">${ico(ICO.danger)}</i>
      <div><b>${T("steamu.conflits.titre")}</b>${cles.map((c) => `<p class="note">${T("steamu.conflits." + c)}</p>`).join("")}</div></div>`;
  };
  const dessinerDanger = () => `<div class="vue danger${S.og === "danger" ? " on" : ""}"><h3>${T("steamu.danger.titre")}</h3>
      <div class="danger-liste">
        <button class="bouton" data-a="confirm:reset"><i class="pastille">${ico(ICO.redemarrer)}</i><span>${T("steamu.danger.reset")}<small>${T("steamu.danger.reset.aide")}</small></span></button>
        <button class="bouton" data-a="confirm:effacer"><i class="pastille">${ico(ICO.poubelle)}</i><span>${T("steamu.danger.effacer")}<small>${T("steamu.danger.effacer.aide")}</small></span></button>
      </div></div>`;
  const dessinerAide = () => `<div class="vue aide${S.og === "aide" ? " on" : ""}"><h3>${T("steamu.diag.titre")}</h3>
      ${dessinerConflits()}
      <div class="danger-liste">
        <button class="bouton" data-a="diagnostic"><i class="pastille">${ico(ICO.guide)}</i><span>${T("steamu.diag")}<small>${T("steamu.diag.aide")}</small></span></button>
        <button class="bouton" data-a="applis-devant"><i class="pastille">${ico(ICO.redemarrer)}</i><span>${T("steamu.applis.debut")}<small>${T("steamu.applis.debut.aide")}</small></span></button>
        <button class="bouton" data-a="signaler"><i class="pastille">${ico(ICO.internet)}</i><span>${T("steamu.signaler")}<small>${T("steamu.signaler.aide")}</small></span></button>
      </div></div>`;
  const confirmer = (type) => {
    const d = DANGER[type], Q = window.__pcvDossiers, non = T("steamu.annuler");
    if (!Q?.demander?.({
      ailleurs: true,
      svg: d.ic,
      titre: T(d.cle + ".titre1"),
      texte: T(d.cle + ".texte1"),
      non,
      oui: T("steamu.continuer"),
      ok: () => Q.demander({
        ailleurs: true,
        svg: ICO.danger,
        titre: T("steamu.danger.titre2"),
        texte: T("steamu.danger.texte2"),
        non,
        oui: T(d.cle + ".action"),
        ok: type === "reset" ? reinitialiser : effacerFichiers
      })
    })) son("bord");
  };
  const dessinerSignaler = () => {
    const s = S.signaler;
    if (!s) return "";
    return `<p>${T("steamu.signaler.titre")}</p>
      ${s.svg ? `<div class="signaler-qr">${s.svg}</div>` : `<p class="signaler-fichier">${esc(s.url)}</p>`}
      <p class="signaler-fichier">${esc(s.fichier)}</p>
      <div class="choix">
        <button class="bouton" data-a="signaler-navigateur"><i class="pastille">${ico(ICO.internet)}</i>${T("steamu.signaler.navigateur")}</button>
        <button class="bouton" data-a="fermer-signaler">${touche(2)}${T("touche.retour")}</button>
      </div>`;
  };
  const ledJeu = () => window.__pcvLedJeuId?.() || "";
  const sansLed = () => {
    const l = lireBool(window.__pcvLedSansCle, []);
    return Array.isArray(l) ? l : [];
  };
  const STYLE_ACCUEIL = { cle: "pcv-interface", def: "nouvelle", ic: "accueil", nom: "steamu.reg.accueil", choix: ["nouvelle", "ancienne"], apres: (v) => window.__pcvInterface?.(v) };
  const AUTRES = () => [
    ...regleSU("interface")?.vers === "steamu.debug" ? [] : [STYLE_ACCUEIL],
    { cle: "pcv-accueil-jeux", def: "installes", ic: "bibliotheque", nom: "steamu.reg.jeux", choix: ["installes", "tous"] },
    // les symboles de touches (barre-haut.js, __pcvTouche) : ceux de la manette branchée, ou une famille imposée (la Legion Go
    // passe par Handheld Daemon, qui se fait passer pour une DualSense alors que ses boutons portent A B X Y)
    { cle: "pcv-touches", def: "auto", ic: "manette", nom: "steamu.reg.touches", choix: ["auto", "xbox", "ps", "nintendo"] },
    // (16/10) la console en main ou sur la télé (barre-haut.js, __pcvJoueurs : sur la télé, sa manette intégrée n'est plus un
    // joueur du menu HOME) ; auto : l'écran externe piloté (main.py → machine), à forcer si la détection se trompe
    { cle: "pcv-mode-console", def: "auto", ic: "ecran", nom: "steamu.reg.mode", choix: ["auto", "portable", "tele"] },
    // les LED des sticks (led.js) : la couleur du thème (et l'ambiance du casino), rien, ou l'écran en jeu (Ambideck)
    { cle: "pcv-led", def: "theme", ic: "soleil", nom: "steamu.reg.led", choix: ["theme", "non", "ecran"], apres: (v) => window.__pcvLedReglage?.(v)?.catch?.(() => {
    }) },
    // pour le jeu en cours seulement (« In this game » d'Ambideck) : montré seulement quand un jeu tourne ; oui = suivre l'écran
    ...ledJeu() ? [{
      ic: "ecran",
      nom: "steamu.reg.led_jeu",
      aide: "steamu.reg.led_jeu.aide",
      oui: () => !sansLed().includes(ledJeu()),
      basculer: () => {
        const id = ledJeu(), l = sansLed();
        ecrireBool(window.__pcvLedSansCle, l.includes(id) ? l.filter((x) => x !== id) : [...l, id]);
      }
    }] : [],
    { cle: "pcv-casino-musique", def: true, ic: "musique", nom: "steamu.reg.musique_casino" },
    {
      cle: CLE_FILM,
      def: true,
      ic: "ecran",
      nom: "steamu.reg.film",
      aide: "steamu.reg.film.aide",
      basculer: () => {
        ecrireBool(CLE_FILM, !filmActif());
        appel("film_demarrage", [filmActif()], 2e4);
      }
    }
  ];
  const valeur = (r) => lireBool(r.cle, r.def);
  const ligneReglage = (r, a) => r.choix ? `<button class="bouton ligne-reg" data-a="${a}"><i class="pastille" style="--c:var(--c-autres)">${ico(ICO[r.ic])}</i><span>${T(r.nom)}</span><em>${T(r.nom + "." + valeur(r))}</em></button>` : `<button class="bouton confid-ligne${(r.oui ? r.oui() : valeur(r)) ? " oui" : ""}" data-a="${a}"><i class="pastille" style="--c:var(--c-autres)">${ico(ICO[r.ic])}</i>
        <span>${T(r.nom)}${r.aide ? `<small>${T(r.aide)}</small>` : ""}</span><i class="inter"></i></button>`;
  const dessinerAutres = () => `<div class="vue autres${S.og === "autres" ? " on" : ""}"><h3>${T("steamu.tab.autres")}</h3>
      <div class="danger-liste">${AUTRES().map((r, i) => ligneReglage(r, "autre:" + i)).join("")}</div></div>`;
  const choisirDans = (r) => {
    if (!window.__pcvDossiers?.liste?.({
      ailleurs: true,
      svg: ICO[r.ic],
      titre: T(r.nom),
      choix: r.choix.map((c) => T(r.nom + "." + c)),
      v: r.choix.indexOf(valeur(r)),
      ok: (k) => {
        ecrireBool(r.cle, r.choix[k]);
        r.apres?.(r.choix[k]);
        dessiner();
      }
    })) son("bord");
  };
  const basculerAutre = (r) => {
    if (r.basculer) r.basculer();
    else ecrireBool(r.cle, !valeur(r));
    son("choisir");
  };
  const BOITE = "pcv-arcade-boite", BOITE_REELLE = "pcv-arcade-boite-reelle";
  const badgesIllimites = () => {
    try {
      return localStorage.getItem(BOITE_REELLE) != null;
    } catch (e) {
      return false;
    }
  };
  const DEBUG = [
    { cle: "pcv-casino-illimite", def: false, ic: "casino", nom: "steamu.debug.pieces", aide: "steamu.debug.pieces.aide" },
    { ic: "epingle", nom: "steamu.debug.badges", aide: "steamu.debug.badges.aide", oui: badgesIllimites, basculer: async () => {
      if (badgesIllimites()) {
        localStorage.setItem(BOITE, localStorage.getItem(BOITE_REELLE));
        localStorage.removeItem(BOITE_REELLE);
        return dessiner();
      }
      const j = await window.__pcvArcade?.charger?.();
      if (!j?.series?.length) return son("rate");
      const t = Date.now(), b = {};
      for (const s of j.series) for (const f of s.lots || []) b[`${s.id}/${f}`] = { n: 99, t };
      localStorage.setItem(BOITE_REELLE, localStorage.getItem(BOITE) ?? "{}");
      ecrireBool(BOITE, b);
      dessiner();
    } },
    // (une ligne de Débogage bascule : les deux choix tour à tour)
    ...regleSU("interface")?.vers === "steamu.debug" ? [{ ...STYLE_ACCUEIL, basculer: () => {
      const v = valeur(STYLE_ACCUEIL) === "nouvelle" ? "ancienne" : "nouvelle";
      ecrireBool(STYLE_ACCUEIL.cle, v);
      STYLE_ACCUEIL.apres(v);
    } }] : []
  ];
  const dessinerDebug = () => !S.debug ? "" : `<div class="vue debug${S.og === "debug" ? " on" : ""}"><h3>${T("steamu.tab.debug")}</h3>
      <div class="danger-liste">${DEBUG.map((r, i) => ligneReglage(r, "debug:" + i)).join("")}
        <button class="bouton" data-a="debug-arcade"><i class="pastille">${ico(ICO.badges)}</i><span>${T("steamu.debug.arcade")}<small>${T("steamu.debug.arcade.aide")}</small></span></button></div></div>`;
  const ouvrirArcade = () => {
    son("choisir");
    O.__pcvAller?.(1);
    setTimeout(() => window.__pcvPerso?.ouvrir("badges"), 600);
  };
  const appuiVersion = () => {
    if (S.debug) {
      Object.assign(S, { og: "debug", zone: "colonne", curseur: onglets().length - 1 });
      return son("choisir");
    }
    S.appuis = (Date.now() - (S.appuiT || 0) < 3e3 ? S.appuis : 0) + 1;
    S.appuiT = Date.now();
    if (S.appuis < 7) return son("bouge");
    S.debug = true;
    Object.assign(S, { appuis: 0, og: "debug", zone: "colonne", curseur: onglets().length - 1 });
    son("choisir");
  };
  const AP = () => window.__pcvApparence;
  const hh = (m) => `${String(Math.floor((m % 1440 + 1440) % 1440 / 60)).padStart(2, "0")}:${String(Math.round((m % 60 + 60) % 60)).padStart(2, "0")}`;
  const tourner = (l, v, d) => l[(l.indexOf(v) + d + l.length) % l.length];
  const degres = (v, p, n) => `${Math.abs(v).toFixed(1)}\xB0 ${T(v >= 0 ? p : n)}`;
  const ville = (a) => AP()?.villes().find((v) => v.tz === a.lieu);
  const resumeApparence = () => {
    const ap = AP();
    if (!ap) return "";
    const c = ap.choix(), a = ap.auto();
    return c !== "auto" ? T("steamu.app." + c) : `${T("steamu.app.auto")} : ${T("steamu.app.regle." + a.regle)}${a.regle === "soleil" && ville(a) ? ", " + ville(a).nom : ""}`;
  };
  const lignesApparence = () => {
    const ap = AP();
    if (!ap) return [];
    const c = ap.choix(), a = ap.auto(), L = [];
    L.push({ nom: T("steamu.apparence"), val: T("steamu.app." + c), pas: (d) => ap.choisir(tourner(["clair", "gris", "noir", "auto"], c, d)) });
    if (c !== "auto") return L;
    L.push({ nom: T("steamu.app.regle"), val: T("steamu.app.regle." + a.regle), pas: (d) => ap.regler({ regle: tourner(["soleil", "heures", "batterie", "theme"], a.regle, d) }) });
    L.push({ nom: T("steamu.app.sombre"), val: T("steamu.app." + a.sombre), pas: (d) => ap.regler({ sombre: tourner(["gris", "noir"], a.sombre, d) }) });
    if (a.regle === "soleil") {
      const v = ap.villes(), i = v.findIndex((x) => x.tz === a.lieu);
      L.push({ nom: T("steamu.app.ville"), val: i >= 0 ? v[i].nom : T("steamu.app.coordonnees"), pas: (d) => {
        const n = v[((i < 0 ? 0 : i + d) + v.length) % v.length];
        ap.regler({ lieu: n.tz, lat: n.lat, lon: n.lon });
      } });
      if (a.lat != null) {
        L.push({ nom: T("steamu.app.lat"), val: degres(a.lat, "steamu.app.nord", "steamu.app.sud"), pas: (d) => ap.regler({ lieu: null, lat: Math.max(-89.5, Math.min(89.5, Math.round((a.lat + d * 0.5) * 10) / 10)), lon: a.lon }) });
        L.push({ nom: T("steamu.app.lon"), val: degres(a.lon, "steamu.app.est", "steamu.app.ouest"), pas: (d) => ap.regler({ lieu: null, lat: a.lat, lon: (Math.round((a.lon + d * 0.5) * 10) / 10 + 540) % 360 - 180 }) });
      }
    }
    if (a.regle === "heures" || a.regle === "soleil" && a.lat == null) {
      L.push({ nom: T("steamu.app.de"), val: hh(a.de), pas: (d) => ap.regler({ de: (a.de + d * 30 + 1440) % 1440 }) });
      L.push({ nom: T("steamu.app.a"), val: hh(a.a), pas: (d) => ap.regler({ a: (a.a + d * 30 + 1440) % 1440 }) });
    }
    if (a.regle === "batterie") {
      L.push({ nom: T("steamu.app.seuil"), val: a.seuil + " %", pas: (d) => ap.regler({ seuil: Math.max(5, Math.min(50, a.seuil + d * 5)) }) });
      L.push({ nom: T("steamu.app.eco"), val: T(a.eco ? "steamu.app.oui" : "steamu.app.non"), pas: () => ap.regler({ eco: !a.eco }) });
    }
    return L;
  };
  const infoApparence = () => {
    const ap = AP();
    if (!ap) return "";
    const a = ap.auto();
    if (ap.choix() !== "auto") return T("steamu.app.info.choix");
    if (a.regle === "heures") return T("steamu.app.info.heures", { de: hh(a.de), a: hh(a.a) });
    if (a.regle === "batterie") return T(a.eco ? "steamu.app.info.eco" : "steamu.app.info.batterie", { seuil: a.seuil });
    if (a.regle === "theme") return T("steamu.app.info.theme");
    const s = ap.soleilDuJour();
    if (!s) return T("steamu.app.info.sanslieu", { de: hh(a.de), a: hh(a.a) });
    return s.nuit ? T("steamu.app.info.nuit") : s.jour ? T("steamu.app.info.jour") : T("steamu.app.info.soleil", { lever: hh(s.lever), coucher: hh(s.coucher) });
  };
  const dessinerApparence = () => S.og !== "apparence" ? "" : `<div class="vue apparence on"><div class="tete"><i class="pastille" style="--c:var(--c-apparence)">${ico(ICO.apparence)}</i>${T("steamu.apparence")}</div>
      <div class="reglages">${lignesApparence().map((l, i) => `<button class="bouton ligne" data-a="r:${i}"><span>${esc(l.nom)}</span><b><i>\u25C0</i>${esc(l.val)}<i>\u25B6</i></b></button>`).join("")}</div>
      <p class="info">${esc(infoApparence())}</p>
      <div class="pied"><button class="bouton" data-a="retour-apparence">${touche(2)}${T("touche.retour")}</button></div></div>`;
  let etat = null, etatImport = null, resultat = null, conflitsActifs = {};
  window.__pcvOnglet = (a, choisi, c, ic, nom, sous = "") => `<button class="bouton onglet${choisi ? " choisi" : ""}" data-a="${a}">
      <i class="pastille" style="--c:${c}">${ic.includes("<") ? ic : window.__pcvIcones?.svg(ic, { attrs: 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"' }) || ""}</i><span><b>${nom}</b>${sous ? `<small>${sous}</small>` : ""}</span></button>`;
  const dessinerColonne = () => `<div class="colonne">${onglets().map((o) => window.__pcvOnglet("og:" + o.id, S.og === o.id, `var(${o.c})`, ico(ICO[o.ic]), T(o.libelle))).join("")}</div>`;
  const SEL_CONTENU = { nouveautes: ".nouveautes .bouton", contrib: ".credit, .contrib .version", import: ".imp-corps .bouton[data-a]", applis: ".app", confid: ".confid-ligne", aide: ".aide .danger-liste [data-a]", danger: ".danger .danger-liste [data-a]", apparence: ".apparence .ligne", autres: ".autres [data-a]", debug: ".debug [data-a]" };
  const contenuBoutons = () => [...page.querySelectorAll(SEL_CONTENU[S.og] || "#pcv-steamu-aucun")];
  const sansAnneau = () => document.querySelectorAll(".PageListColumn .pcv-f").forEach((t) => t.classList.remove("pcv-f"));
  let derniereLegende = null;
  const legende = () => {
    const R = [2, T("touche.retour")], O2 = [[5, 6], T("touche.onglets")], g = S.og === "import" && S.vueImport === "guide" && S.zone === "contenu";
    const da = S.zone === "contenu" && contenuBoutons()[S.curseur]?.dataset.a;
    const html = window.__pcvIcones?.legende?.(window.__pcvLegendeDe(S.fenetre ? [resultat?.fini && [1, T("touche.fermer")], R] : S.signaler ? [[1, T("steamu.signaler.navigateur")], R] : g ? [[1, S.etape < guide().schemas.length - 1 ? T("touche.suivant") : T("touche.terminer")], R, O2] : S.zone === "onglet" ? [O2, [4, T("touche.rechercher")], R, [1, T("touche.choisir")]] : [(S.zone !== "contenu" || da) && [1, S.zone === "contenu" ? T("touche.choisir") : T("console.ouvrir")], R, O2])) || "";
    if (derniereLegende !== html) {
      derniereLegende = html;
      legendeEl.innerHTML = html;
    }
  };
  (window.__pcvLegendes ||= {}).steamu = () => {
    if (S.actif) legende();
  };
  const dessiner = (curseurSeul = false) => {
    legende();
    const vue = `${S.og} ${S.vueImport} ${S.guide}`;
    if (S.vue !== vue) {
      if (S.vue) Object.assign(S, { entree: false, entreeSel: ".contenu > .on" });
      S.vue = vue;
    }
    sansAnneau();
    page.querySelectorAll(".f").forEach((e) => e.classList.remove("f"));
    if (!curseurSeul) {
      const haut = [".colonne", ".contenu"].map((k) => page.querySelector(k)?.scrollTop || 0);
      const etats = [S.fenetre, S.signaler];
      window.__pcvVoile?.("steamu", etats.some(Boolean));
      const avant = [...page.children].slice(1, 3).map((v) => v.classList.contains("on"));
      const sortantes = avant.flatMap((on, i) => on && !etats[i] ? [window.__pcvApparition(page.children[i + 1], true, ".fenetre")] : []);
      page.innerHTML = `<div class="panneau">${dessinerColonne()}<div class="contenu"><div class="vue nouveautes${S.og === "nouveautes" ? " on" : ""}"><h3>${T("bienvenue.rubrique")}</h3>${dessinerNouveautes()}</div>${dessinerContrib()}${dessinerImport()}${dessinerApplis(etat)}${dessinerConfid()}${dessinerAide()}${dessinerDanger()}${dessinerApparence()}${dessinerAutres()}${dessinerDebug()}</div></div><div class="voile${S.fenetre ? " on" : ""}"><div class="fenetre pcv-fenetre">${resultat ? `<h2>${resultat.titre}</h2><ul>${resultat.lignes.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` + (resultat.fini ? `<button class="bouton" data-a="fermer">${touche(1)}${T("touche.fermer")}</button>` : "") : ""}</div></div><div class="voile${S.signaler ? " on" : ""}"><div class="fenetre signaler pcv-fenetre">${S.signaler ? dessinerSignaler() : ""}</div></div>`;
      [...page.children].slice(1, 3).forEach((v, i) => {
        if (etats[i] && !avant[i]) window.__pcvApparition(v, false, ".fenetre");
      });
      page.append(...sortantes);
      [".colonne", ".contenu"].forEach((k, i) => {
        const e = page.querySelector(k);
        if (e) e.scrollTop = haut[i];
      });
      window.__pcvPresentation.entrer(page, S.entreeSel, false, S.entree);
      S.entree = true;
    }
    if (S.fenetre || S.signaler) return;
    if (S.zone === "colonne") {
      const f = page.querySelector(".onglet.choisi");
      if (f) {
        if (S.manette) f.classList.add("f");
        window.__pcvSuivre?.(f) || f.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      }
      return;
    }
    if (S.zone === "contenu" && S.manette && !(S.og === "import" && S.vueImport === "guide")) {
      const f = contenuBoutons()[S.curseur];
      if (f) {
        f.classList.add("f");
        window.__pcvSuivre?.(f) || f.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      }
    }
  };
  const rafraichir = async () => {
    const [e, ei, c] = await Promise.all([appel("nintendo"), appel("import_etat"), appel("conflits")]);
    etat = e;
    etatImport = ei;
    conflitsActifs = c?.actifs || {};
    window.__pcvNintendo?.appliquer?.(e);
    if (S.actif) dessiner();
  };
  const natives = () => [...document.querySelectorAll('.PageListColumn [role=tab][id*="/settings/"]:not([data-pcv-choix=retirer])')];
  const tuile = () => document.getElementById("pcv-onglet-steamu");
  const poser = () => {
    const n = natives();
    if (!n.length || tuile()) return;
    const modele = n.find((t) => t.getAttribute("aria-selected") !== "true") || n[0], c = modele.cloneNode(true);
    c.id = "pcv-onglet-steamu";
    c.setAttribute("role", "button");
    c.removeAttribute("aria-controls");
    c.removeAttribute("aria-selected");
    c.tabIndex = -1;
    c.classList.remove("gpfocus", "gpfocuswithin");
    const svg = c.querySelector("svg"), ic = svg?.parentElement;
    if (ic) {
      ic.classList.add("pcv-ic");
      ic.innerHTML = window.__pcvIcones.relief("logo-u", "cyan-plein");
    }
    const titre = [...c.querySelectorAll("*")].find((e) => !e.children.length && e.textContent.trim());
    if (titre) titre.textContent = T("steamu.titre");
    c.addEventListener("click", (e) => {
      e.stopPropagation();
      ouvrir();
    });
    n[0].before(c);
  };
  const appliquerCible = (cible) => {
    if (!cible) return;
    if (cible === "nouveautes") Object.assign(S, { og: "nouveautes", zone: "contenu", curseur: 0 });
    else if (cible === "confidentialite") Object.assign(S, { og: "confid", zone: "contenu", curseur: 0, highlightConfid: "paroles-bascule" });
    else if (cible === "plugins") Object.assign(S, { og: "confid", zone: "contenu", curseur: 3, highlightConfid: "hors-store-bascule" });
    else if (cible === "apparence") Object.assign(S, { og: "apparence", zone: "contenu", curseur: 0 });
    else if (cible === "import") Object.assign(S, { og: "import", zone: "contenu", curseur: 0, vueImport: "liste" });
    dessiner();
  };
  const ouvrir = () => {
    poser();
    const c = tuile(), n = natives();
    if (!c || !n.length) return false;
    if (!S.actif) {
      S.natif = n.find((t) => t.getAttribute("aria-selected") === "true") || null;
      const autre = n.find((t) => t !== S.natif);
      S.actifs = S.natif && autre ? [...S.natif.classList].filter((k) => !autre.classList.contains(k) && !k.startsWith("gpfocus")) : [];
      S.natif?.classList.remove(...S.actifs);
      c.classList.add(...S.actifs);
      Object.assign(S, { entree: false, entreeSel: ".colonne > *, .contenu > .on", vue: "", actif: true, zone: "onglet", og: "contrib", vueImport: "liste", curseur: 0, fenetre: false, highlightConfid: false, manette: false });
      document.body.classList.add("pcv-steamu-ouvert");
      page.hidden = false;
      son("choisir");
      page.querySelectorAll(".colonne, .contenu").forEach((e) => {
        e.scrollTop = 0;
      });
      window.__pcvParametres?.rafraichir();
    }
    c.scrollIntoView?.({ inline: "center", block: "nearest", behavior: "instant" });
    dessiner();
    rafraichir();
    return true;
  };
  const fermer = () => {
    if (!S.actif) return;
    S.actif = false;
    window.__pcvVoile?.("steamu", false);
    tuile()?.classList.remove(...S.actifs);
    if (S.natif && document.contains(S.natif)) S.natif.classList.add(...S.actifs);
    document.body.classList.remove("pcv-steamu-ouvert");
    page.hidden = true;
    sansAnneau();
    window.__pcvParametres?.rafraichir();
  };
  const aller = async (cible) => {
    if (document.body.dataset.pcvPage !== "parametres") O?.__pcvAller?.("parametres");
    for (let i = 0; i < 30; i++) {
      if (natives().length && ouvrir()) {
        appliquerCible(cible);
        return true;
      }
      await attendre(100);
    }
    S.attente = true;
    S.cibleAttente = cible;
    return false;
  };
  const importer = async () => {
    if (S.occupe) return;
    const L = O?.DeckyPluginLoader || window.DeckyPluginLoader;
    if (!L?.openFilePicker) {
      montrer(T("steamu.import.erreur"), [], true);
      return;
    }
    S.occupe = S.choisit = true;
    son("choisir");
    const debut = Date.now(), veille = setInterval(() => {
      const f = document.querySelector(".gpfocus");
      if (Date.now() - debut > 1500 && f?.closest(".PageListColumn, .DialogContentTransition")) {
        clearInterval(veille);
        S.choisit = S.occupe = false;
      }
    }, 500);
    let choix = null;
    try {
      const depart = await appel("import_depart") || "/";
      choix = await L.openFilePicker(1, depart, true, true, void 0, void 0, false, true);
    } catch (e) {
    }
    clearInterval(veille);
    S.choisit = false;
    if (!choix?.path) {
      S.occupe = false;
      return;
    }
    S.occupe = true;
    montrer(T("steamu.import.cours"), [], false);
    const r = await appel("importer", [choix.realpath || choix.path], 36e5);
    S.occupe = false;
    if (!r || r.erreur && r.erreur !== "introuvable") {
      montrer(T("steamu.import.erreur"), [], true);
      son("rate");
      return;
    }
    const l = [];
    if (r.mii) l.push(T("steamu.import.mii", { n: r.mii }));
    if (r.mii_autres) l.push(T("steamu.import.autres", { n: r.mii_autres }));
    if (r.visages) l.push(T("steamu.import.visages"));
    if (r.cle3ds) l.push(T("steamu.import.cle"));
    for (const [f, n] of Object.entries(r.sons || {})) if (n) l.push(T("steamu.import.sons." + f, { n }));
    if (r.connus) l.push(T("steamu.import.connus", { n: r.connus }));
    if (r.luigi) l.push(T(r.luigi_mp ? "steamu.import.luigi.mp" : "steamu.import.luigi"));
    if (r.casino) l.push(T("steamu.import.casino", { n: r.casino }));
    if (r.badge_arcade) l.push(T("steamu.import.badgearcade", { n: r.badge_arcade }));
    if (r.badges) l.push(T("steamu.import.badges", { n: r.badges }));
    if (r.themes) l.push(T("steamu.import.themes", { n: r.themes }));
    const neuf = l.length;
    if (r.romfs) l.push(T("steamu.import.romfs", { n: r.romfs }));
    if (r.deja) l.push(T("steamu.import.deja", { n: r.deja }));
    if (r.mauvaise_n) l.push(T("steamu.import.mauvaise", { noms: r.mauvaise.join(", ") }));
    if (r.pas_wiiu) l.push(T("steamu.import.pas_wiiu", { n: r.pas_wiiu }));
    if (r.verrouilles) l.push(T("steamu.import.verrouilles", { n: r.verrouilles }));
    if (r.autrement) l.push(T("steamu.import.autrement", { n: r.autrement }));
    if (r.autre_rom?.length) l.push(T("steamu.import.autrerom", { noms: r.autre_rom.join(", ") }));
    if (r.mpds_seul) l.push(T("steamu.import.mpdsseul"));
    if (r.wiiu_chiffre) l.push(T("steamu.import.wiiuchiffre"));
    if (r.archives_fermees) l.push(T("steamu.import.archivefermee", { n: r.archives_fermees }));
    if (r.sans_semaine) l.push(T("steamu.import.sanssemaine"));
    if (r.audio_impossible) l.push(r.audio_outils?.length ? T("steamu.import.audio_outils", { outils: r.audio_outils.join(", ") }) : T(r.audio_erreur === "analyse" ? "steamu.import.audio_analyse" : "steamu.import.audio_references"));
    if (r.abimes?.length) l.push(T("steamu.import.abimes", { noms: r.abimes.join(", ") + (r.abimes_n > r.abimes.length ? "\u2026" : "") }));
    if (r.inconnus) l.push(T("steamu.import.inconnus", { n: r.inconnus }));
    if (r.trop || r.refuses) l.push(T("steamu.import.trop", { n: (r.trop || 0) + (r.refuses || 0) }));
    for (const [a] of APPLIS) {
      const e = r.etat?.applis?.[a];
      if (!e) continue;
      const quoi = [...new Set(e.manque.map((c) => T("steamu.manque." + c)))].join(", ");
      l.push(T("steamu.appli." + a) + " : " + (e.pret ? T("steamu.prete") : T("steamu.manque", { quoi })));
      if (e.pret) for (const c of e.conseils || []) l.push("   " + T("steamu.conseil." + c));
    }
    if (r.vide || r.erreur) l.push(T("steamu.import.vide"));
    montrer(T(neuf ? "steamu.import.fait" : "steamu.import.rien"), l, true);
    son(neuf ? "choisir" : "rate");
    if (neuf) window.__pcvSonsPresents?.(true);
    rafraichir();
  };
  const montrer = (titre, lignes, fini) => {
    resultat = { titre, lignes, fini };
    S.fenetre = true;
    dessiner();
  };
  const reinitialiser = async () => {
    if (S.occupe) return;
    S.occupe = true;
    dessiner();
    const r = await appel("themes_reglages", [null, null, true]);
    S.occupe = false;
    if (r !== true) {
      montrer(T("steamu.import.erreur"), [], true);
      son("rate");
      return;
    }
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("pcv-")).forEach((k) => localStorage.removeItem(k));
    } catch (e) {
    }
    montrer(T("steamu.danger.reset.fait"), [], true);
    son("choisir");
  };
  const effacerFichiers = async () => {
    S.occupe = true;
    dessiner();
    const r = await appel("vider_prive", [], 1e4);
    S.occupe = false;
    if (!r || r.erreur) {
      montrer(T("steamu.import.erreur"), [], true);
      son("rate");
      return;
    }
    montrer(T("steamu.danger.effacer.fait"), [], true);
    son("choisir");
    rafraichir();
  };
  const diagnostiquer = async () => {
    if (S.occupe) return;
    S.occupe = true;
    montrer(T("steamu.diag.cours"), [], false);
    const r = await appel("diagnostic", [], 3e4);
    S.occupe = false;
    if (!r?.fichier) {
      montrer(T("steamu.diag.erreur"), [], true);
      son("rate");
      return;
    }
    try {
      (O || window).DeckyPluginLoader.toaster.toast({ title: T("steamu.diag.fait"), body: r.fichier, duration: 15e3 });
      S.fenetre = false;
      dessiner();
    } catch (e) {
      montrer(T("steamu.diag.fait"), [r.fichier], true);
    }
    son("choisir");
  };
  const DEPOT_GITHUB = "https://github.com/Vegetenks/SteamU";
  const corpsSignalement = (fichier, r = {}) => [
    `SteamU: ${r.steamu || "?"}`,
    `Decky: ${r.decky || "?"}`,
    `Steam: ${r.steam_version || "?"} (${r.steam_branche || "stable"})`,
    `OS: ${r.os || "?"}`,
    `Kernel: ${r.noyau || "?"}`,
    `Device: ${r.appareil || "?"}`,
    `Screen: ${r.ecran || "?"}`,
    `Safe mode: ${r.pause ? "on (paused)" : "off"}`,
    `Conflicts: ${(r.conflits || []).join(", ") || "none"}`,
    "",
    "Recent errors:",
    ...r.erreurs?.length ? r.erreurs.map((e, i) => `${i + 1}. ${e}`) : ["(none)"],
    "",
    `Diagnostic file: please attach ${fichier} from your Downloads folder.`,
    "",
    "What happened?",
    ""
  ].join("\n");
  const urlSignalement = (fichier, r) => `${DEPOT_GITHUB}/issues/new?title=${encodeURIComponent(`Bug report: SteamU ${r?.steamu || "?"}`)}&body=${encodeURIComponent(corpsSignalement(fichier, r))}`;
  const signaler = async () => {
    if (S.occupe) return;
    S.occupe = true;
    montrer(T("steamu.diag.cours"), [], false);
    const r = await appel("diagnostic", [], 3e4);
    S.occupe = false;
    S.fenetre = false;
    if (!r?.fichier) {
      montrer(T("steamu.diag.erreur"), [], true);
      son("rate");
      return;
    }
    const url = urlSignalement(r.fichier, r.resume);
    let svg = "";
    try {
      svg = window.__pcvMiiQR?.genererSvg?.(url, 1) || "";
    } catch (e) {
    }
    S.signaler = { fichier: r.fichier, url, svg };
    dessiner();
    son("choisir");
  };
  const installerMoteur = async () => {
    if (S.occupe) return;
    S.occupe = S.moteurCours = true;
    dessiner();
    son("choisir");
    const r = await appel("moteur_installer", [], 12e4);
    S.occupe = S.moteurCours = false;
    if (r?.ok) {
      montrer(T("steamu.moteur.ok"), [T("steamu.moteur.aide")], true);
      son("choisir");
    } else {
      const k = "steamu.moteur.erreur." + (r?.erreur || "reseau"), t = T(k);
      montrer(T("steamu.moteur.erreur.titre"), [t === k ? T("steamu.moteur.erreur.reseau") : t], true);
      son("rate");
    }
    rafraichir();
  };
  const agir = (a) => {
    if (a === "revoir-nouveautes") return window.__pcvQuoiDeNeuf?.notes().length ? window.__pcvQuoiDeNeuf.ouvrir() : window.__pcvBienvenue?.ouvrir();
    if (a === "importer") return importer();
    if (a === "moteur-installer") return installerMoteur();
    if (a === "diagnostic") return diagnostiquer();
    if (a === "applis-devant") {
      const ok = window.__pcvGrille?.remettreApplisDevant?.();
      return montrer(T("steamu.applis.debut"), [T(ok ? "steamu.applis.debut.fait" : "steamu.applis.debut.indisponible")], true);
    }
    if (a === "signaler") return signaler();
    if (a === "fermer-signaler") {
      S.signaler = null;
      son("retour");
    } else if (a === "signaler-navigateur") return ouvrirLien(S.signaler?.url);
    if (a.startsWith("lien:")) return ouvrirLien(a.slice(5));
    if (a.startsWith("og:")) {
      const id = a.slice(3);
      S.og = id;
      S.curseur = 0;
      if (id !== "confid") S.highlightConfid = false;
      if (id === "import") S.vueImport = "liste";
      son("choisir");
    } else if (a.startsWith("g:")) {
      Object.assign(S, { vueImport: "guide", guide: a.slice(2), etape: 0 });
      son("choisir");
    } else if (a === "retour-import") {
      S.vueImport = "liste";
      son("retour");
    } else if (a === "avant") {
      if (S.etape > 0) {
        S.etape--;
        son("bouge");
      }
    } else if (a === "apres") {
      if (S.etape < guide().schemas.length - 1) {
        S.etape++;
        son("bouge");
      } else return agir("retour-import");
    } else if (a.startsWith("r:")) {
      lignesApparence()[+a.slice(2)]?.pas(1);
      son("bouge");
    } else if (a === "retour-apparence") {
      Object.assign(S, { zone: "colonne", curseur: Math.max(0, onglets().findIndex((o) => o.id === "apparence")) });
      son("retour");
    } else if (a === "paroles-bascule") {
      ecrireBool(CLE_PAROLES, !parolesActif());
      S.highlightConfid = false;
      son("choisir");
    } else if (a === "art-auto-bascule") {
      ecrireBool(CLE_ART_AUTO, !artAutoActif());
      son("choisir");
    } else if (a === "maj-bascule") {
      ecrireBool(CLE_MAJ, !majActif());
      son("choisir");
    } else if (a === "sp-ouvrir") return window.__pcvSpotPassPage?.ouvrir?.();
    else if (a === "hors-store-bascule") {
      ecrireBool(CLE_HORS_STORE, !horsStoreActif());
      S.highlightConfid = false;
      son("choisir");
    } else if (a.startsWith("confirm:")) confirmer(a.slice(8));
    else if (a === "fermer") {
      if (!resultat?.fini) return;
      S.fenetre = false;
      son("retour");
    } else if (a.startsWith("autre:")) {
      const r = AUTRES()[+a.slice(6)];
      if (r?.choix) choisirDans(r);
      else if (r) basculerAutre(r);
    } else if (a === "debug-arcade") ouvrirArcade();
    else if (a.startsWith("debug:")) {
      const r = DEBUG[+a.slice(6)];
      if (r) basculerAutre(r);
    } else if (a === "version") appuiVersion();
    dessiner();
  };
  page.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const a = b.dataset.a;
    S.zone = a.startsWith("og:") ? "colonne" : "contenu";
    S.manette = false;
    agir(a);
  });
  (window.__pcvManette ||= {}).steamu = (b) => {
    if (document.body.dataset.pcvPage !== "parametres" || S.choisit) return false;
    if (!S.actif) {
      if (b !== 11 || window.__pcvParametres?.couvre?.()) return false;
      let f = null;
      try {
        f = window.__pcvNav?.GetActiveNavTree()?.GetLastFocusedNode()?.Element || null;
      } catch (e) {
      }
      if (!f || !document.contains(f)) f = document.querySelector(".gpfocus");
      const n = natives(), t = f ? f.closest(".PageListColumn [role=tab]") : n.find((x) => x.getAttribute("aria-selected") === "true");
      return !!t && t === n[0] && ouvrir();
    }
    if (S.fenetre) {
      if (b === 2 || b === 1 && resultat?.fini) {
        S.fenetre = false;
        son("retour");
        dessiner();
      }
      return true;
    }
    if (S.signaler) {
      if (b === 2) agir("fermer-signaler");
      else if (b === 1) agir("signaler-navigateur");
      return true;
    }
    if (b === 5 || b === 6) return false;
    S.manette = true;
    if (S.zone === "onglet") {
      if (b === 2) {
        fermer();
        O?.__pcvAller?.("accueil");
        son("retour");
        return true;
      }
      if (b === 9) {
        window.__pcvBarreEntrer?.(() => dessiner(true));
        return true;
      }
      if (b === 11 || b === 12) {
        window.__pcvParametres?.voisine(b === 12 ? 1 : -1);
        return true;
      }
      if (b === 10 || b === 1) {
        S.zone = "colonne";
        S.curseur = Math.max(0, onglets().findIndex((o) => o.id === S.og));
        son("bouge");
        dessiner(true);
        return true;
      }
      if (b === 4) return false;
      if (b === 3 || b === 7 || b === 8) son("bord");
      return true;
    }
    if (S.zone === "colonne") {
      if (b === 2 || b === 9 && S.curseur === 0) {
        S.zone = "onglet";
        son("retour");
        dessiner(true);
        return true;
      }
      if (b === 9 || b === 10) {
        const c = Math.max(0, Math.min(onglets().length - 1, S.curseur + (b === 10 ? 1 : -1)));
        if (c === S.curseur) return true;
        son("bouge");
        S.curseur = c;
        S.og = onglets()[c].id;
        if (S.og !== "confid") S.highlightConfid = false;
        if (S.og === "import") S.vueImport = "liste";
        dessiner();
        return true;
      }
      if (b === 12 || b === 1) {
        S.zone = "contenu";
        S.curseur = 0;
        son("bouge");
        dessiner(true);
      }
      return true;
    }
    if (S.og === "import" && S.vueImport === "guide") {
      if (b === 11) agir("avant");
      else if (b === 12) {
        if (S.etape < guide().schemas.length - 1) agir("apres");
      } else if (b === 1) agir("apres");
      else if (b === 2) agir("retour-import");
      else if (b === 9) {
        S.zone = "colonne";
        S.curseur = Math.max(0, onglets().findIndex((o) => o.id === S.og));
        dessiner(true);
      }
      return true;
    }
    if (S.og === "apparence") {
      const l2 = contenuBoutons();
      if (!l2.length || b === 2 || b === 9 && S.curseur === 0) {
        S.zone = "colonne";
        S.curseur = Math.max(0, onglets().findIndex((o) => o.id === S.og));
        son("retour");
        dessiner(true);
        return true;
      }
      if (b === 9 || b === 10) {
        const c = Math.max(0, Math.min(l2.length - 1, S.curseur + (b === 10 ? 1 : -1)));
        if (c !== S.curseur) son("bouge");
        S.curseur = c;
        dessiner(true);
        return true;
      }
      if (b === 11 || b === 12) {
        lignesApparence()[S.curseur]?.pas(b === 12 ? 1 : -1);
        son("bouge");
        dessiner();
        return true;
      }
      if (b === 1) {
        lignesApparence()[S.curseur]?.pas(1);
        son("bouge");
        dessiner();
        return true;
      }
      return true;
    }
    const l = contenuBoutons();
    const voisin = () => {
      const a = l[S.curseur]?.getBoundingClientRect();
      if (!a) return -1;
      let m = -1, sc = Infinity;
      l.forEach((e, i) => {
        if (i === S.curseur) return;
        const r = e.getBoundingClientRect(), dx = r.left + r.width / 2 - a.left - a.width / 2, dy = r.top + r.height / 2 - a.top - a.height / 2;
        const ok = b === 9 ? dy < -4 : b === 10 ? dy > 4 : Math.abs(dy) < a.height / 2 && (b === 11 ? dx < -4 : dx > 4);
        if (!ok) return;
        const s = b <= 10 ? Math.abs(dy) + 2 * Math.abs(dx) : Math.abs(dx) + 2 * Math.abs(dy);
        if (s < sc) {
          sc = s;
          m = i;
        }
      });
      return m;
    };
    const v = b >= 9 && b <= 12 ? voisin() : -1;
    if (!l.length || b === 2 || (b === 9 || b === 11) && v < 0) {
      S.zone = "colonne";
      S.curseur = Math.max(0, onglets().findIndex((o) => o.id === S.og));
      son("retour");
      dessiner(true);
      return true;
    }
    if (b >= 9 && b <= 12) {
      if (v >= 0) {
        son("bouge");
        S.curseur = v;
        dessiner(true);
      }
      return true;
    }
    if (b === 1) {
      const da = l[S.curseur]?.dataset.a;
      if (da) agir(da);
      return true;
    }
    return true;
  };
  const quitterPage = () => {
    if (S.actif && (document.body.dataset.pcvPage !== "parametres" || window.__pcvEcran?.ouvert?.())) fermer();
  };
  window.__pcvSteamUSortie?.disconnect();
  window.__pcvSteamUSortie = new MutationObserver(quitterPage);
  window.__pcvSteamUSortie.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "class", "data-pcv-page"] });
  clearInterval(window.__pcvSteamUVeille);
  window.__pcvSteamUVeille = setInterval(() => {
    if (document.body.dataset.pcvPage !== "parametres") {
      fermer();
      return;
    }
    poser();
    const o = window.__pcvOrdre;
    if (Array.isArray(o) && !o.includes("steamu")) o.unshift("steamu");
    if (S.attente && natives().length) {
      S.attente = false;
      ouvrir();
      appliquerCible(S.cibleAttente);
      S.cibleAttente = null;
    }
    if (S.actif && (!tuile() || S.natif && !document.contains(S.natif) || natives().some((t) => t !== S.natif && t.getAttribute("aria-selected") === "true"))) fermer();
    else if (S.actif && S.natif && S.actifs.length && S.actifs.some((k) => S.natif.classList.contains(k))) S.natif.classList.remove(...S.actifs);
  }, 400);
  document.removeEventListener("click", window.__pcvSteamUClic, true);
  document.addEventListener("click", window.__pcvSteamUClic = (e) => {
    if (S.actif && e.target.closest?.('.PageListColumn [role=tab][id*="/settings/"]')) fermer();
  }, true);
  window.__pcvSteamU = { ouvrir: aller, fermer, ouvert: () => S.actif, etat: () => ({ ...S }), paroles: parolesActif, horsStore: horsStoreActif };
  return "onglet SteamU : pr\xEAt";
})();
