(() => {
  window.__pcvBienvenue?.detruire();
  const T = (c, p) => window.__pcvT("bienvenue." + c, p);
  const P = window.__pcvPresentation, O = window.opener || window;
  const CLES = ["musiques", "place", "mii", "pause", "manettes", "amis", "notifications", "lancement", "boutique-greffons", "wifi", "greffons", "themes", "menu-rapide"];
  const IMPORT = [];
  const APPLI = { musiques: "perso", mii: "miimaker", manettes: "parametres", lancement: "bibliotheque", themes: "perso", "boutique-greffons": "eshop", wifi: "parametres", "menu-rapide": "parametres" };
  const marque = (t) => t.replace("SteamU", '<b class="nom">Steam<i>U</i></b>');
  const couleur = (cle) => cle === "spotpass" || cle === "place" ? "c-spotpass" : window.__pcvApplis?.[APPLI[cle]]?.fond.split(",").at(-1).trim() || "cyan-plein";
  const VUES = "pcv-bienvenue-vues", AVIS = "pcv-bienvenue-avis", MASQUE = "pcv-bienvenue-masque";
  const lire = (c) => {
    try {
      return localStorage.getItem(c);
    } catch (_) {
      return null;
    }
  };
  const ecrire = (c, v) => {
    try {
      localStorage.setItem(c, v);
    } catch (_) {
    }
  };
  const vues = () => {
    try {
      const v = JSON.parse(lire(VUES) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (_) {
      return [];
    }
  };
  const version = () => O.DeckyPluginLoader?.plugins?.find((p) => p.name === window.__pcvGreffon?.nom)?.version?.match(/^\d+\.\d+\.\d+/)?.[0];
  const notes = (v) => /^\d+\.\d+\.0$/.test(v || "");
  const ech = P.echapper;
  const G = (c, p) => window.__pcvT("guide." + c, p);
  const GUIDE = "pcv-guide-vu", LARGEUR_CARTE = 800;
  const PAGES_GUIDE = ["logo", "grille", "place", "home", "applis", "confid", "nintendo", "import", "spotpass", "fin"];
  const nouveau = () => window.__pcvGreffon?.decouverte === true && !lire(GUIDE);
  let guide = false, suspendu = false, etatImport = null, zi = 1, essaisZoom = 0, carteGuide = -1;
  let page = 0, choix = 0, ouverte = false, courante = "", vueSeance = "", retourDemande = "";
  const racine = document.createElement("div");
  racine.id = "pcv-bienvenue";
  racine.hidden = true;
  racine.innerHTML = `<style>
    #pcv-bienvenue { --u:calc(100vh / 800); position:fixed; inset:0; z-index:2147483000; overflow:hidden; background:var(--pcv-fond-page); color:var(--pcv-texte); font-family:var(--pcv-police); }
    #pcv-bienvenue[hidden] { display:none; }
    #pcv-bienvenue * { box-sizing:border-box; font-family:inherit; }
    
    #pcv-bienvenue .tete { position:absolute; top:calc(var(--u)*36); left:calc(var(--u)*44); margin:0; font-size:calc(var(--u)*26); font-weight:900; }
    #pcv-bienvenue .tete span { margin-left:calc(var(--u)*10); color:var(--pcv-texte2); }
    
    #pcv-bienvenue .nom { color:var(--pcv-texte); } #pcv-bienvenue .nom i { font-style:normal; color:var(--pcv-cyan-plein); }
    #pcv-bienvenue .centre { position:absolute; inset:15% 8% 12%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:calc(var(--u)*22); }
    #pcv-bienvenue .sel { outline:calc(var(--u)*4) solid var(--pcv-anneau-c); outline-offset:calc(var(--u)*5); }
    #pcv-bienvenue h1 { font-size:calc(var(--u)*40); margin:0; }
    #pcv-bienvenue p { font-size:calc(var(--u)*21); color:var(--pcv-texte2); margin:0; }
    #pcv-bienvenue .piste p .pcv-touche { vertical-align:middle; margin:0 calc(var(--u)*2); }   
    #pcv-bienvenue button { border:0; color:var(--pcv-texte); background:var(--pcv-verre); box-shadow:var(--pcv-reflet),var(--pcv-ombre); font:800 calc(var(--u)*21) var(--pcv-police); cursor:pointer; border-radius:calc(var(--u)*38); padding:calc(var(--u)*18) calc(var(--u)*24); }
    #pcv-bienvenue .actions { display:flex; gap:calc(var(--u)*24); }
    
    #pcv-bienvenue .actions button { min-width:calc(var(--u)*170); height:calc(var(--u)*56); padding:0 calc(var(--u)*30); border-radius:calc(var(--u)*28); font-size:calc(var(--u)*19); font-weight:900;
      box-shadow:inset 0 calc(var(--u)*2) 0 var(--pcv-reflet-haut), inset 0 calc(var(--u)*-3) 0 var(--pcv-reflet-bas), 0 calc(var(--u)*3) 0 rgb(from var(--pcv-ombre-c) r g b / .22); }
    #pcv-bienvenue .actions .principal { background:var(--pcv-cyan); color:var(--pcv-sur-accent); box-shadow:inset 0 calc(var(--u)*2) 0 rgba(255,255,255,.5), 0 calc(var(--u)*3) 0 rgba(20,90,140,.35); }
    #pcv-bienvenue :is(.actions .sel, .fleche.sel) { outline-offset:calc(var(--u)*2); box-shadow:0 0 0 calc(var(--u)*9) var(--pcv-cyan-plein); }
    #pcv-bienvenue .maj-animee { --pcv-maj-animation:1.6s cubic-bezier(.3,0,.2,1) both; }
    #pcv-bienvenue .maj-animee svg { animation:pcvMajTour var(--pcv-maj-animation); }
    #pcv-bienvenue .maj-animee .pcv-marque-relief::before, #pcv-bienvenue .maj-animee .pcv-marque-relief::after { left:43%; top:43%; right:auto; bottom:auto; animation:pcvMajCarreA var(--pcv-maj-animation); }
    #pcv-bienvenue .maj-animee .pcv-marque-relief::after { animation-name:pcvMajCarreB; }
    @keyframes pcvMajTour { 0% { transform:rotate(-540deg) scale(.6); opacity:0; } 15% { opacity:1; } 100% { transform:none; } }
    @keyframes pcvMajCarreA { 0% { transform:rotate(-540deg) translate(0,-210%) rotate(540deg); } 80% { transform:translate(0,-210%); } 100% { transform:translate(-226%,-226%) rotate(-12deg); } }
    @keyframes pcvMajCarreB { 0% { transform:rotate(-540deg) translate(0,210%) rotate(540deg); } 80% { transform:translate(0,210%); } 100% { transform:translate(229%,226%) rotate(12deg); } }
    @media (prefers-reduced-motion:reduce) { #pcv-bienvenue .maj-animee *, #pcv-bienvenue .maj-animee ::before, #pcv-bienvenue .maj-animee ::after { animation-duration:.01s!important; } }
    
    #pcv-bienvenue .mosaique { display:flex; flex-wrap:wrap; justify-content:center; gap:calc(var(--u)*18); width:86%; }
    #pcv-bienvenue .mosaique > button { width:calc((100% - var(--u)*18*6) / 7); }
    #pcv-bienvenue .mosaique > button { display:flex; flex-direction:column; align-items:center; gap:calc(var(--u)*8); padding:0; background:none; box-shadow:none; border-radius:calc(var(--u)*12); font:inherit; font-size:calc(var(--u)*12); }
    #pcv-bienvenue svg { width:100%; height:100%; }
    
    #pcv-bienvenue .badge-maj { --pcv-relief-taille:calc(var(--u)*130); display:flex; }
    #pcv-bienvenue .mosaique { --pcv-relief-taille:calc(var(--u)*64); }
    #pcv-bienvenue .pcv-marque-relief > svg { width:50%; height:50%; }
    
    #pcv-bienvenue :not(.badge-maj):not(.guide-film) > .pcv-marque-relief::before, #pcv-bienvenue :not(.badge-maj):not(.guide-film) > .pcv-marque-relief::after { content:none; }
    #pcv-bienvenue .piste { position:absolute; top:calc(var(--u)*150); bottom:13%; left:calc(50% - var(--u)*480); width:calc(var(--u)*960); }
    #pcv-bienvenue article { position:absolute; top:0; height:100%; padding:calc(var(--u)*18); border-radius:calc(var(--u)*28); background:var(--pcv-fenetre-fond); box-shadow:var(--pcv-reflet),var(--pcv-ombre); display:flex; flex-direction:column; gap:calc(var(--u)*12); }
    #pcv-bienvenue button:is(:hover,:focus-visible), #pcv-bienvenue .points .on { outline:calc(var(--u)*4) solid var(--pcv-anneau-c); outline-offset:calc(var(--u)*2); }
    #pcv-bienvenue article img { width:100%; min-height:0; flex:1; object-fit:contain; border-radius:calc(var(--u)*16); background:var(--pcv-creux); }
    #pcv-bienvenue h2 { margin:0; font-size:calc(var(--u)*28); }
    #pcv-bienvenue article p { font-size:calc(var(--u)*18); } #pcv-bienvenue article .importer { font-size:calc(var(--u)*15); color:var(--pcv-texte3); }
    
    #pcv-bienvenue.import-en-cours { pointer-events: none; }
    #pcv-bienvenue .fleche { position:absolute; top:45%; z-index:2; width:calc(var(--u)*64); height:calc(var(--u)*64); padding:0; border-radius:calc(var(--u)*32); display:flex; align-items:center; justify-content:center; transition:width var(--pcv-panneau-duree) var(--pcv-panneau-courbe); }
    #pcv-bienvenue .fleche svg { width:45%; height:45%; pointer-events:none; }
    
    #pcv-bienvenue .fleche > * { transition:opacity var(--pcv-panneau-duree); } #pcv-bienvenue .fleche span { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; white-space:nowrap; }
    #pcv-bienvenue .fleche.fin { width:calc(var(--u)*170); background:var(--pcv-cyan); color:var(--pcv-sur-accent); } #pcv-bienvenue .fleche.fin svg { opacity:0; } #pcv-bienvenue .fleche.fin span { opacity:1; } #pcv-bienvenue .fleche.g svg { transform:scaleX(-1); } #pcv-bienvenue .g { right:calc(50% + var(--u)*420); } #pcv-bienvenue .d { left:calc(50% + var(--u)*420); }
    #pcv-bienvenue .points { position:absolute; bottom:4%; left:30%; right:30%; display:flex; justify-content:center; gap:calc(var(--u)*8); }
    #pcv-bienvenue .points button { padding:0; width:calc(var(--u)*10); height:calc(var(--u)*10); border-radius:99px; background:var(--pcv-texte3); }
    #pcv-bienvenue .points .on { width:calc(var(--u)*28); background:var(--pcv-cyan-plein); }
    #pcv-bienvenue .pcv-legende { position:absolute; right:2%; bottom:2%; }
    #pcv-bienvenue.guide .chapitres { position:absolute; top:4%; left:4%; display:flex; gap:calc(var(--u)*12); }
    #pcv-bienvenue.guide .chapitres span { padding:calc(var(--u)*8) calc(var(--u)*18); border-radius:99px; background:var(--pcv-verre); color:var(--pcv-texte2); font-size:calc(var(--u)*18); font-weight:900; }
    #pcv-bienvenue.guide .chapitres .on { background:var(--pcv-cyan); color:var(--pcv-sur-accent); }
    #pcv-bienvenue.guide .points { top:6%; bottom:auto; left:auto; right:4%; gap:calc(var(--u)*9); }
    #pcv-bienvenue.guide .guide-page { position:absolute; inset:17% 4% 20%; display:grid; grid-template-columns:1.65fr 1fr; align-items:center; gap:calc(var(--u)*44); }
    #pcv-bienvenue.guide .guide-page.centre { display:flex; text-align:center; gap:calc(var(--u)*20); }
    #pcv-bienvenue.guide h1 { font-size:calc(var(--u)*40); line-height:1.18; margin-bottom:calc(var(--u)*18); }
    #pcv-bienvenue.guide p { font-size:calc(var(--u)*26); line-height:1.4; }
    #pcv-bienvenue.guide .capture { width:100%; border-radius:calc(var(--u)*22); box-shadow:var(--pcv-reflet),var(--pcv-ombre); }
    #pcv-bienvenue.guide .menus-images { display:flex; gap:calc(var(--u)*20); width:100%; min-height:0; }
    #pcv-bienvenue.guide .menus-images img { width:calc(50% - var(--u)*10); object-fit:contain; min-height:0; }
    #pcv-bienvenue.guide .guide-film { --pcv-relief-taille:calc(var(--u)*220); display:flex; justify-content:center; animation:pcvGuideLogo 5s ease-in-out infinite; margin-bottom:calc(var(--u)*24); }
    #pcv-bienvenue.guide .guide-fin { animation:none; }
    #pcv-bienvenue.guide .guide-fin svg { overflow:visible; fill:none; stroke:var(--pcv-relief-couleur); stroke-linecap:round; stroke-linejoin:round; }
    #pcv-bienvenue.guide .guide-fin .halo { stroke-width:3.4; opacity:.3; }
    #pcv-bienvenue.guide .guide-fin circle { stroke-dasharray:63; animation:pcvGuideRond 1.1s cubic-bezier(.45,0,.2,1) both; }
    #pcv-bienvenue.guide .guide-fin path { stroke-width:2.6; stroke-dasharray:22; animation:pcvGuideCoche .35s ease-out 1.35s both; }
    #pcv-bienvenue.guide .guide-fin .pcv-marque-relief::before, #pcv-bienvenue.guide .guide-fin .pcv-marque-relief::after { left:43%; top:43%; right:auto; bottom:auto; background:var(--pcv-relief-couleur); box-shadow:0 0 .06em var(--pcv-relief-couleur); animation:pcvGuideTraineA 1.6s cubic-bezier(.45,0,.2,1) both,pcvGuideAllume 1.6s linear both; }
    #pcv-bienvenue.guide .guide-fin .pcv-marque-relief::after { animation-name:pcvGuideTraineB,pcvGuideAllume; }
    @keyframes pcvGuideTraineA { 0% { transform:rotate(0) translate(0,-176%) rotate(0); } 70% { transform:rotate(720deg) translate(0,-176%) rotate(-720deg); } 100% { transform:translate(-226%,-226%) rotate(-12deg); } }
    @keyframes pcvGuideTraineB { 0% { transform:rotate(0) translate(0,176%) rotate(0); } 70% { transform:rotate(720deg) translate(0,176%) rotate(-720deg); } 100% { transform:translate(229%,226%) rotate(12deg); } }
    @keyframes pcvGuideAllume { 0%,100% { filter:brightness(1); } 15%,70% { filter:brightness(1.2); } }
    @keyframes pcvGuideRond { from { stroke-dashoffset:63; } to { stroke-dashoffset:0; } }
    @keyframes pcvGuideCoche { from { stroke-dashoffset:22; } to { stroke-dashoffset:0; } }
    @media (prefers-reduced-motion:reduce) { #pcv-bienvenue.guide .guide-fin * , #pcv-bienvenue.guide .guide-fin ::before, #pcv-bienvenue.guide .guide-fin ::after { animation-duration:.01s!important; animation-delay:0s!important; } }
    @keyframes pcvGuideLogo { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(calc(var(--u)*-8)) scale(1.025); } }
    #pcv-bienvenue.guide .guide-logo h1 { margin:0; color:var(--pcv-cyan-plein); }
    #pcv-bienvenue.guide .guide-logo .nom { display:block; font-size:calc(var(--u)*48); margin-bottom:calc(var(--u)*8); }
    #pcv-bienvenue.guide .guide-pied { position:absolute; bottom:4%; left:5%; right:5%; display:flex; align-items:center; justify-content:space-between; gap:calc(var(--u)*20); font-size:calc(var(--u)*22); }
    #pcv-bienvenue.guide .guide-pied > span { flex:none; white-space:nowrap; }
    #pcv-bienvenue.guide .guide-pied .pcv-legende { position:static; min-width:0; flex-wrap:wrap; justify-content:flex-end; }
    #pcv-bienvenue.guide .applis-page { display:block; inset:0; text-align:center; }
    #pcv-bienvenue.guide .applis-page .piste { bottom:13%; }
    #pcv-bienvenue.guide .applis-page > h1 { position:absolute; top:calc(var(--u)*80); left:0; right:0; margin:0; font-size:calc(var(--u)*28); }
    #pcv-bienvenue.guide .carte-position { position:absolute; top:calc(var(--u)*118); left:40%; right:40%; text-align:center; }
    #pcv-bienvenue.guide article { text-align:left; cursor:pointer; }
    #pcv-bienvenue.guide article p { font-size:calc(var(--u)*18); line-height:normal; }
    #pcv-bienvenue.guide .apercu { position:relative; flex:1; min-height:0; width:100%; overflow:hidden; border-radius:calc(var(--u)*16); background:var(--pcv-creux); }
    #pcv-bienvenue.guide .apercu :is(img,video) { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; }
    #pcv-bienvenue.guide .apercu video:not(.joue) { visibility:hidden; }
    #pcv-bienvenue.guide .guide-page > .carte { display:flex; flex-direction:column; padding:calc(var(--u)*22); border-radius:calc(var(--u)*24); background:var(--pcv-verre); box-shadow:var(--pcv-reflet),var(--pcv-ombre); text-align:center; }
    #pcv-bienvenue.guide .carte .pcv-marque-relief { --pcv-relief-taille:calc(var(--u)*70); margin:0 auto calc(var(--u)*12); }
    #pcv-bienvenue.guide .mini-barre { --guide-rond:calc(100cqw * 56 / 1280); position:absolute; top:4%; left:calc(100cqw * 20 / 1280); right:4%; display:flex; align-items:center; gap:2%; height:var(--guide-rond); pointer-events:none; }
    #pcv-bienvenue.guide .mini-barre .rond { position:static; display:flex; flex:none; width:var(--guide-rond); height:var(--guide-rond); border-radius:50%; padding:.5%; background:var(--pcv-verre); box-shadow:var(--pcv-reflet),var(--pcv-ombre); }
    #pcv-bienvenue.guide .mini-barre .rond img { width:100%; height:100%; border-radius:50%; object-fit:cover; }
    #pcv-bienvenue.guide .mini-barre .rond i { width:calc(100cqw * 22 / 1280); height:calc(100cqw * 22 / 1280); margin:auto; mask:var(--m) center / contain no-repeat; background:var(--c); }
    #pcv-bienvenue.guide .mini-barre .etat { position:static; flex:none; margin-left:auto; --u:calc(100cqw / 1280); --pcv-etat-h:calc(var(--u)*56); --pcv-etat-texte:calc(var(--u)*18); --pcv-etat-ico:calc(var(--u)*25); --pcv-etat-chiffres:calc(var(--u)*16); }
    #pcv-bienvenue.guide .mini-barre .etat svg.ico { width:var(--pcv-etat-ico); height:var(--pcv-etat-ico); }
    #pcv-bienvenue.guide .mini-place { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; background:var(--pcv-fond-place-base); opacity:0; pointer-events:none; }
    #pcv-bienvenue.guide .mini-place :is(img,video) { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; }
    #pcv-bienvenue.guide .mini-place.on { opacity:1; }
    #pcv-bienvenue.guide .petit-ecran[data-action] { cursor:pointer; }
    #pcv-bienvenue.guide .geste { margin-top:calc(var(--u)*22); display:flex; gap:calc(var(--u)*12); align-items:center; font-size:calc(var(--u)*22); }
    #pcv-bienvenue.guide .geste.pcv-legende { position:static; justify-content:flex-start; }
    #pcv-bienvenue.guide .petit-ecran { width:100%; aspect-ratio:16/10; border-radius:calc(var(--u)*24); background:var(--pcv-fond-accueil-base); box-shadow:var(--pcv-reflet),var(--pcv-ombre); overflow:hidden; position:relative; container-type:inline-size; }
    #pcv-bienvenue.guide .mini-grille { position:absolute; left:8%; top:23%; display:grid; grid-auto-flow:column; grid-template-rows:repeat(var(--guide-r),var(--guide-c)); grid-auto-columns:var(--guide-c); gap:var(--guide-g); }
    #pcv-bienvenue.guide .mini-tuile { border-radius:18%; width:100%; height:100%; background:var(--pcv-verre) center / cover no-repeat; overflow:hidden; box-shadow:var(--pcv-reflet),var(--pcv-ombre); }
    #pcv-bienvenue.guide .mini-tuile .pcv-marque-relief { --pcv-relief-taille:var(--guide-c); }
    #pcv-bienvenue.guide .mini-tuile.vide { background:var(--pcv-creux); opacity:.28; box-shadow:none; }
    #pcv-bienvenue.guide .petit-ecran .zoom { --u:calc(100cqw / 1280); }
    #pcv-bienvenue.guide .reussi { min-height:calc(var(--u)*52); color:var(--pcv-vert-texte); margin-top:calc(var(--u)*18); font-size:calc(var(--u)*18); }
    #pcv-bienvenue.guide .fichiers { display:grid; gap:calc(var(--u)*10); width:100%; text-align:left; }
    #pcv-bienvenue.guide .fichier { text-align:left; display:flex; align-items:center; gap:calc(var(--u)*15); padding:calc(var(--u)*10) calc(var(--u)*18); border-radius:calc(var(--u)*16); background:var(--pcv-verre); box-shadow:var(--pcv-reflet),var(--pcv-ombre); }
    #pcv-bienvenue.guide .fichier .pastille { --c:var(--pcv-ambre-texte); width:calc(var(--u)*44); height:calc(var(--u)*44); padding:calc(var(--u)*10); }
    #pcv-bienvenue.guide .fichier.ok .pastille { --c:var(--pcv-vert-texte); }
    #pcv-bienvenue.guide .confid-ligne .pastille { --c:var(--pcv-cyan-plein); }
    #pcv-bienvenue.guide .fichier > span { flex:1; }
    #pcv-bienvenue.guide .fichier b { font-size:calc(var(--u)*24); }
    #pcv-bienvenue.guide .fichier small { display:block; font-size:calc(var(--u)*20); color:var(--pcv-texte2); }
    #pcv-bienvenue.guide .import-page { inset:13% 10% 21%; gap:calc(var(--u)*12); }
    #pcv-bienvenue.guide .import-page p { font-size:calc(var(--u)*22); }
    #pcv-bienvenue.guide .import-page .fichier { padding-block:calc(var(--u)*8); }
    #pcv-bienvenue.guide .fichier.neutre .pastille { --c:var(--pcv-texte3); }
    #pcv-bienvenue.guide .porte-import { display:flex; align-items:center; justify-content:center; gap:calc(var(--u)*24); width:100%; min-height:calc(var(--u)*90); }
    #pcv-bienvenue.guide .porte-import:is(.sel,:hover,:focus-visible) { outline:none; box-shadow:var(--pcv-bombe), var(--pcv-anneau-choisi); }
    #pcv-bienvenue.guide .porte-import .pcv-marque-relief { --pcv-relief-taille:calc(var(--u)*70); }
    #pcv-bienvenue.guide .import-page h1 { margin:0; }
    #pcv-bienvenue.guide .fichier small .attente { float:right; margin-left:calc(var(--u)*24); color:var(--pcv-texte2); background:var(--pcv-creux); border-radius:calc(var(--u)*12); padding:0 calc(var(--u)*8); }
    #pcv-bienvenue.guide .import-page small { font-size:calc(var(--u)*16); }
    @media (prefers-reduced-motion:reduce) { #pcv-bienvenue.guide .guide-film { animation:none; } }
  </style><div class="contenu"></div>`;
  racine.dataset.pcvEspace = "notifs";
  document.body.appendChild(racine);
  racine.style.setProperty("--pcv-fond-page", `var(--pcv-fond-${racine.dataset.pcvEspace}-base)`);
  const captures = /* @__PURE__ */ new Map();
  const image = (cle) => {
    const a = document.documentElement.dataset.pcvApparence || "clair", l = window.__pcvLangue?.() || "fr", k = l + "/" + a + "/" + cle;
    if (!captures.has(k)) {
      captures.set(k, "");
      (async () => {
        for (const x of [.../* @__PURE__ */ new Set([l, "en", "fr"])].flatMap((l2) => [a, ...a === "noir" ? ["gris", "clair"] : a === "gris" ? ["noir", "clair"] : ["gris", "noir"]].map((y) => l2 + "/" + y))) {
          const b = await (O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "ressource", `@bienvenue/${x}/${cle}.jpg`).catch(() => null);
          if (b) {
            captures.set(k, "data:image/jpeg;base64," + b);
            if (guide) {
              racine.querySelectorAll("img[data-capture]").forEach((img) => {
                const src = captures.get(l + "/" + a + "/" + img.dataset.capture);
                if (!src) return;
                if (img.getAttribute("src") !== src) img.src = src;
              });
              return;
            }
            return dessiner();
          }
        }
      })();
    }
    return captures.get(k);
  };
  const texte = (cle) => ech(T(cle + ".texte")).replace("{Y}", window.__pcvIcones.touche(4));
  const ico = (cle) => window.__pcvIcones.relief({ musiques: "musique", place: "spotpass", mii: "miimaker", pause: "pause", manettes: "manette", amis: "amis", notifications: "notifications", lancement: "bibliotheque", "boutique-greffons": "bouclier", wifi: "wifi", greffons: "accueil", themes: "nuancier", "menu-rapide": "feuille", spotpass: "spotpass" }[cle], couleur(cle));
  const toile = document.createElement("canvas");
  toile.width = toile.height = 8;
  const bord = (img) => {
    try {
      const c = toile.getContext("2d", { willReadFrequently: true });
      c.drawImage(img, 0, 0, 8, 8);
      const d = c.getImageData(0, 0, 8, 8).data, s = [0, 0, 0];
      let n = 0;
      for (let y = 0; y < 8; y++) for (const x of [0, 7]) {
        const i = (y * 8 + x) * 4;
        s[0] += d[i];
        s[1] += d[i + 1];
        s[2] += d[i + 2];
        n++;
      }
      img.style.background = `rgb(${s.map((v) => Math.round(v / n)).join(",")})`;
    } catch (_) {
    }
  };
  const article = (attributs, contenu, largeur = LARGEUR_CARTE) => `<article class="pcv-fenetre" ${attributs} style="left:0;width:calc(var(--u)*${largeur})">${contenu}</article>`;
  const fleches = (attributG, attributD, texteG, texteD) => `<button class="fleche g" ${attributG}>${window.__pcvIcones.svg("fleche")}<span>${ech(texteG)}</span></button><button class="fleche d" ${attributD}>${window.__pcvIcones.svg("fleche")}<span>${ech(texteD)}</span></button>`;
  const ranger = (piste) => {
    const tuiles = [...piste.querySelectorAll("article")];
    P.rangee(tuiles, page - 1, [704, 104], LARGEUR_CARTE);
    racine.querySelectorAll(".fleche").forEach((f) => {
      const g = f.classList.contains("g"), fin = page === (g ? 1 : CLES.length);
      f.classList.toggle("fin", fin);
      f.classList.toggle("sel", fin && !!choix);
      f.setAttribute("aria-label", T(fin ? g ? "sommaire" : "terminer" : "continuer"));
    });
    tuiles.forEach((el, i) => {
      el.classList.remove("sel");
      el.setAttribute("aria-hidden", String(i !== page - 1));
      const src = Math.abs(i - (page - 1)) <= 1 ? image(el.dataset.cle) : null;
      if (src !== null && el.querySelector("img").getAttribute("src") !== src) {
        const img = el.querySelector("img");
        img.onload = () => bord(img);
        img.setAttribute("src", src);
      }
    });
  };
  const reliefAppli = (cle) => {
    const a = window.__pcvApplis?.[cle];
    return a ? window.__pcvIconeAppli(a, true) : "";
  };
  const applisGuide = () => Object.entries(window.__pcvApplis || {}).filter(([, a]) => !a.greffon).sort(([a], [b]) => Number(b === "casino") - Number(a === "casino")).map(([id, a]) => ({ id, ...a, nom: id === "album" ? window.__pcvT("spaces.medias.nom") : a.nom })).concat([
    window.__pcvThemes && { id: "themes", nom: window.__pcvT("spaces.themes.nom"), ic: "nuancier", fond: window.__pcvApplis?.perso?.fond },
    window.__pcvEshopThemes && { id: "themeboutique", nom: G("applis.themeboutique.nom") },
    window.__pcvDeco && { id: "badges", nom: window.__pcvT("steamu.appli.badges"), ic: "badges", fond: "var(--pcv-cyan-plein)" },
    window.__pcvTelech && { id: "telechargements", nom: window.__pcvT("home.telechargements"), ic: "telecharger", fond: "var(--pcv-cyan-plein)" },
    window.__pcvStockage && { id: "stockage", nom: G("applis.stockage.nom"), ic: "disque", fond: window.__pcvApplis?.parametres?.fond }
  ].filter(Boolean)).concat(["amis", "notifications", "recherche", "profil", "fiche", "dossiers", "plugins"].map((id) => ({ id, nom: G("applis." + id + ".nom") })));
  const filmsGuide = /* @__PURE__ */ new Map();
  const arreterFilms = () => {
    racine.querySelectorAll("video").forEach((v) => v.pause());
    filmsGuide.forEach((p) => p.then((u) => {
      if (u) URL.revokeObjectURL(u);
    }));
    filmsGuide.clear();
  };
  const film = (cle) => {
    const apparence2 = document.documentElement.dataset.pcvApparence || "clair", k = apparence2 + "/" + cle;
    if (!filmsGuide.has(k)) filmsGuide.set(k, (async () => {
      for (const l of [.../* @__PURE__ */ new Set([window.__pcvLangue?.() || "fr", "en", "fr"])]) for (const a of [.../* @__PURE__ */ new Set([apparence2, "clair"])]) {
        const b = await (O.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "ressource", "@bienvenue/" + l + "/" + a + "/" + cle + ".webm").catch(() => null);
        if (b) return URL.createObjectURL(new Blob([Uint8Array.from(atob(b), (c) => c.charCodeAt(0))], { type: "video/webm" }));
      }
      return null;
    })());
    return filmsGuide.get(k);
  };
  const survolGuide = (n) => {
    const cartes = [...racine.querySelectorAll("[data-appli]")], c = cartes[n];
    if (!c) return;
    carteGuide = n;
    const position = racine.querySelector(".carte-position");
    if (position) position.textContent = G("applis.position", { n: n + 1, total: cartes.length });
    cartes.forEach((e) => {
      const actif = e === c, v2 = e.querySelector("video");
      e.classList.toggle("sel", actif && (!guide || choix === 0));
      if (!actif) {
        v2.pause();
        v2.classList.remove("joue");
      }
    });
    P.rangee(cartes, n, [704, 104], LARGEUR_CARTE);
    cartes.forEach((e, i) => {
      e.setAttribute("aria-hidden", String(i !== n));
      e.tabIndex = i === n ? 0 : -1;
    });
    racine.querySelectorAll("[data-carte-pas]").forEach((f) => {
      const gauche = Number(f.dataset.cartePas) < 0, fin = n === (gauche ? 0 : cartes.length - 1);
      f.classList.toggle("fin", fin);
      f.setAttribute("aria-label", G(gauche ? "applis.precedent" : fin ? "continuer" : "suivant"));
    });
    cartes.forEach((e, i) => {
      if (Math.abs(i - n) > 1) return;
      const img = e.querySelector("img");
      img.src = image(img.dataset.capture);
    });
    const id = c.dataset.appli, v = c.querySelector("video");
    if (v.classList.contains("joue") && !v.paused) return;
    film("apercu-" + id).then((u) => {
      if (!u || !ouverte || suspendu || !v.isConnected || carteGuide !== n) return;
      if (v.getAttribute("src") !== u) v.src = u;
      v.play().then(() => {
        if (!v.paused) v.classList.add("joue");
      }).catch(() => null);
    });
  };
  const lireImport = async () => {
    const v = await (O.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "import_etat").catch(() => null);
    if (!ouverte || !guide) return;
    etatImport = v;
    if (PAGES_GUIDE[page] === "import") dessiner();
  };
  const sansImport = () => !!etatImport && !etatImport.importe && !Object.values(etatImport.sons || {}).some((s) => s.n > 0) && !["cle3ds", "mii", "visages", "luigi", "badge_arcade", "moteur_ffl"].some((c) => etatImport[c]) && !Object.values(etatImport.applis || {}).some((a) => a.pret);
  const traitGuide = (n) => window.__pcvIcones.svg(n, { attrs: 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' });
  const cocheGuide = (c) => {
    const oui = c === "spotpass" ? window.__pcvSpotPass?.actif() : c === "annonces" ? window.__pcvAnnonces?.actif() : window.__pcvSteamU?.paroles();
    return `<button class="fichier confid-ligne${oui ? " oui" : ""}" data-reglage="${c}" role="checkbox" aria-checked="${!!oui}"><i class="pastille">${traitGuide({ spotpass: "spotpass", annonces: "monde", paroles: "paroles" }[c])}</i><span><b>${ech(G("confid." + c))}</b><small>${ech(G(oui ? "confid.oui" : "confid.non"))}</small></span><i class="inter"></i></button>`;
  };
  const fichiers = () => {
    if (!etatImport) return `<p>${ech(G("import.attente"))}</p>`;
    if (sansImport()) return ["wiiu", "3ds", "mii", "badges", "casino"].map((c) => `<div class="fichier neutre"><i class="pastille">${traitGuide("plus")}</i><span><b>${ech(G("fichiers." + c))}</b><small>${ech(G("import.debloque." + c))}<span class="attente">${ech(G("import.a_importer"))}</span></small></span></div>`).join("");
    const e = etatImport;
    const sons = (f) => {
      const s = e.sons?.[f];
      return { ok: !!s?.sur && s.n === s.sur, detail: s?.sur ? window.__pcvT("steamu.etat.compte", s) : G("import.aucun") };
    };
    const appli = (a) => {
      const s = e.applis?.[a], manque = (s?.manque || []).map((c) => window.__pcvT("steamu.manque." + c)).concat((s?.conseils || []).map((c) => window.__pcvT("steamu.conseil." + c)));
      return { ok: !!s?.pret && !manque.length, detail: manque.length ? manque.join(", ") : s?.pret ? G("import.complet") : G("import.aucun") };
    };
    return [["wiiu", sons("wiiu")], ["3ds", sons("3ds")], ["mii", appli("mii")], ["badges", appli("badges")], ["casino", appli("casino")]].map(([cle, v]) => `<div class="fichier${v.ok ? " ok" : ""}"><i class="pastille">${traitGuide(v.ok ? "coche" : "info")}</i><span><b>${ech(G("fichiers." + cle))}</b><small>${ech(v.detail)}</small></span></div>`).join("");
  };
  const mini = (animer = false) => {
    const el = racine.querySelector(".mini-grille"), J = window.__pcvJeux;
    if (!el || !J) return;
    const avant = [...el.children].map((e) => e.getBoundingClientRect()), z = J.zooms[zi];
    el.style.setProperty("--guide-r", z.r);
    el.style.setProperty("--guide-c", z.c / 12.8 + "cqw");
    el.style.setProperty("--guide-g", z.g / 12.8 + "cqw");
    if (!el.children.length) {
      const applis = Object.keys(window.__pcvApplis || {}), jeux = (window.__pcvGrille?.cases() || []).filter((c) => c.app).slice(0, 4).map((c) => J.apps().get(c.app)).filter(Boolean);
      el.innerHTML = Array.from({ length: 72 }, (_, i) => `<div class="mini-tuile${i >= jeux.length + applis.length ? " vide" : ""}">${i >= jeux.length && i < jeux.length + applis.length ? reliefAppli(applis[i - jeux.length]) : ""}</div>`).join("");
      jeux.forEach((a, i) => J.peindre(el.children[i], a, z.c));
    }
    if (animer && !window.__pcvReduit?.()) J.glisser([...el.children], avant);
    racine.querySelector(".mini-zoom").innerHTML = window.__pcvIcones.zoom(J.zooms.length, zi, [5, 6]);
    if (racine.querySelector(".reussi")) racine.querySelector(".reussi").textContent = essaisZoom ? G("grille.bravo") : "";
  };
  const zoomGuide = (d) => {
    const J = window.__pcvJeux;
    if (!J) return;
    zoomGuide.crans ||= J.crans({
      cran: () => zi,
      max: () => J.zooms.length - 1,
      barre: (n) => racine.querySelectorAll(".mini-zoom i").forEach((e, i) => e.classList.toggle("on", i === n)),
      aller: (n) => {
        if (!ouverte || !guide || page !== 1 || suspendu) return;
        zi = n;
        essaisZoom++;
        mini(true);
      }
    });
    zoomGuide.crans(d);
  };
  const petitAccueil = (place = false) => `<div class="petit-ecran"${place ? ' data-action="place" role="button" tabindex="0" aria-label="' + ech(G("place.geste")) + '"' : ""}><div class="mini-barre">${["loupe", "amis", "notifs", "spotpass", "profil"].map((id) => {
    const original = document.querySelector(`#pcv-barre [data-pcv-rond="${id}"]`);
    return `<span class="rond"${id === "spotpass" ? ' style="--c:var(--pcv-c-spotpass)"' : ""}>${id === "profil" ? `<img src="${ech(document.querySelector("#header_profile img")?.src || "")}" alt="">` : (() => {
      const i = original?.querySelector("i");
      if (!i) return "";
      const c = i.cloneNode(true);
      c.style.setProperty("--m", getComputedStyle(i).getPropertyValue("--m"));
      if (id === "spotpass") c.style.setProperty("--c", "var(--pcv-c-spotpass)");
      return c.outerHTML;
    })()}</span>`;
  }).join("")}${document.querySelector("#pcv-barre .etat")?.outerHTML || window.__pcvEtat.html()}</div><div class="mini-grille"></div><div class="zoom mini-zoom"></div>${place ? `<div class="mini-place"><img data-capture="guide-place" src="${image("guide-place")}" alt="${ech(G("place.titre"))}"><video muted loop playsinline preload="none" aria-hidden="true"></video></div>` : ""}</div>`;
  const basculerPlace = () => {
    const el = racine.querySelector(".mini-place");
    if (!el) return;
    const transition = document.getElementById("pcv-place") ? getComputedStyle(document.getElementById("pcv-place")).transition : "opacity var(--pcv-panneau-duree)";
    el.style.transition = window.__pcvReduit?.() ? "none" : transition;
    const on = el.classList.toggle("on"), v = el.querySelector("video");
    if (!on) return v.pause();
    film("guide-place").then((u) => {
      if (!u || !ouverte || suspendu || !el.isConnected || !el.classList.contains("on")) return;
      if (v.getAttribute("src") !== u) v.src = u;
      v.play().catch(() => null);
    });
  };
  const texteGuide = (cle) => `<div class="texte"><h1>${ech(G(cle + ".titre"))}</h1><p>${ech(G(cle + ".texte"))}</p>${cle === "place" ? `<div class="geste">${window.__pcvIcones.touche(4)}${ech(G("place.geste"))}</div>` : ""}</div>`;
  const dessinerGuide = () => {
    racine.querySelectorAll("video").forEach((v) => v.pause());
    const cle = PAGES_GUIDE[page];
    let contenu;
    if (cle === "logo") contenu = `<div class="guide-page centre guide-logo"><div class="guide-film" aria-hidden="true">${window.__pcvIcones.relief("logo-u", "cyan-plein")}</div>${marque("SteamU")}<h1>${ech(G("titre"))}</h1></div>`;
    else if (cle === "grille") contenu = `<div class="guide-page">${petitAccueil()}<div>${texteGuide(cle)}<div class="geste pcv-legende">${window.__pcvIcones.legende([[[5, 6], G("grille.essayer")]])}</div><div class="reussi"></div></div></div>`;
    else if (cle === "home") contenu = `<div class="guide-page centre">${texteGuide(cle)}<div class="menus-images"><img class="capture" data-capture="guide-home" src="${image("guide-home")}" alt=""><img class="capture" data-capture="guide-rapide" src="${image("guide-rapide")}" alt=""></div></div>`;
    else if (cle === "place") contenu = `<div class="guide-page">${petitAccueil(true)}${texteGuide(cle)}</div>`;
    else if (cle === "nintendo") contenu = `<div class="guide-page"><img class="capture" data-capture="guide-${cle}" src="${image("guide-" + cle)}" alt="">${texteGuide(cle)}</div>`;
    else if (cle === "spotpass") contenu = `<div class="guide-page"><div class="carte">${ico("spotpass")}<h2>SpotPass</h2><p>${ech(G("spotpass.carte"))}</p></div><div><div class="fichiers">${cocheGuide("spotpass")}</div></div></div>`;
    else if (cle === "applis") contenu = `<div class="guide-page applis-page"><h1>${ech(G("applis.titre"))}</h1><div class="piste cartes">${applisGuide().map((a) => article(`data-appli="${a.id}" role="button" tabindex="-1"`, `<div class="apercu"><img data-capture="apercu-${a.id}" alt=""><video muted loop playsinline preload="none" aria-hidden="true"></video></div><h2>${ech(a.nom)}</h2><p>${ech(G("applis." + a.id))}</p>`, LARGEUR_CARTE)).join("")}</div><span class="carte-position"></span>${fleches('data-carte-pas="-1"', 'data-carte-pas="1"', G("applis.precedent"), G("continuer"))}</div>`;
    else if (cle === "confid") contenu = `<div class="guide-page centre">${texteGuide(cle)}<div class="fichiers">${["annonces", "paroles"].map(cocheGuide).join("")}</div></div>`;
    else if (cle === "import") contenu = `<div class="guide-page centre import-page"><h1>${ech(G("import.titre"))}</h1><button class="porte-import" data-action="importer">${reliefAppli("bibliotheque")}${ech(G("import.maintenant"))}</button><div class="fichiers">${fichiers()}</div><p>${ech(G(sansImport() ? "import.premier" : "import.texte"))}</p></div>`;
    else contenu = `<div class="guide-page centre"><span class="guide-film guide-fin">${window.__pcvIcones.relief("coche", "cyan-plein").replace(/<svg[\s\S]*<\/svg>/, '<svg viewBox="0 0 24 24"><circle class="halo" cx="12" cy="12" r="10" transform="rotate(-90 12 12)"/><circle cx="12" cy="12" r="10" stroke-width="2.2" transform="rotate(-90 12 12)"/><path d="m7.5 12.3 3 3 6-6.3"/></svg>')}</span><h1>${ech(G("fin.titre"))}</h1></div>`;
    racine.querySelector(".contenu").innerHTML = `<style>${["grille", "place"].includes(cle) ? [...document.querySelector("#pcv-console > style")?.sheet?.cssRules || []].filter((r) => /^#pcv-console \.zoom\b/.test(r.selectorText || "")).map((r) => r.cssText.replaceAll("#pcv-console", "#pcv-bienvenue.guide .petit-ecran")).join("") : ""}</style><div class="chapitres"><span class="${page < PAGES_GUIDE.indexOf("nintendo") ? "on" : ""}">SteamU</span><span class="${page >= PAGES_GUIDE.indexOf("nintendo") ? "on" : ""}">${ech(G("nintendo.titre"))}</span></div><div class="points">${PAGES_GUIDE.map((_, i) => `<button data-page="${i}" class="${i === page ? "on" : ""}" aria-label="${i + 1}" ${i === page ? 'aria-current="step"' : ""}></button>`).join("")}</div>${contenu}<div class="guide-pied"><span>${ech(G("page", { n: page + 1, total: PAGES_GUIDE.length }))}</span><div class="pcv-legende">${legende()}</div></div>`;
    if (cle === "applis") survolGuide(Math.max(0, carteGuide));
    if (cle === "grille" || cle === "place") {
      mini();
      window.__pcvEtat.heure(racine.querySelector(".mini-barre"));
    }
    if (cle === "place") basculerPlace();
    marquerGuide();
    if (page !== dernierePage) P.entrer(racine, ".guide-page");
    dernierePage = page;
  };
  const reglerGuide = async () => {
    arreterFilms();
    suspendu = true;
    racine.classList.add("import-en-cours");
    window.__pcvAuRelacher?.(null);
    try {
      await window.__pcvSteamU?.importer();
    } finally {
      racine.classList.remove("import-en-cours");
      suspendu = false;
      if (ouverte && guide) {
        dessiner();
        lireImport();
      }
    }
  };
  let dernierePage = 0;
  const dessiner = () => {
    if (!ouverte || suspendu) return;
    if (guide) return dessinerGuide();
    const fin = page === CLES.length + 1;
    const milieu = page > 0 && !fin;
    const ancienne = racine.querySelector(".piste");
    if (milieu && ancienne) {
      ranger(ancienne);
      racine.querySelectorAll("[data-page]").forEach((el, i) => {
        el.classList.toggle("on", i === page);
        if (i === page) el.setAttribute("aria-current", "step");
        else el.removeAttribute("aria-current");
      });
      dessinerLegende();
      dernierePage = page;
      return;
    }
    const contenu = milieu ? `<div class="piste">${CLES.map((cle) => article(`data-cle="${cle}"`, `<img src="" alt=""><h2>${ech(T(cle + ".titre"))}</h2><p>${texte(cle)}</p>${IMPORT.includes(cle) ? `<p class="importer">${ech(T("importer"))}</p>` : ""}`)).join("")}</div>${fleches('data-action="precedent"', 'data-action="suivant"', T("sommaire"), T("terminer"))}` : `<div class="centre"><span class="badge-maj${fin ? "" : " maj-animee"}">${window.__pcvIcones.relief(fin ? "coche" : "mise-a-jour", fin ? "vert" : "cyan-plein")}</span><h1>${marque(ech(T(fin ? "fin" : "titre")))}</h1><p>${ech(T(fin ? "revoir_aide" : "intro", { version: courante }))}</p>${!fin ? `<div class="mosaique">${CLES.map((s, i) => `<button data-page="${i + 1}">${ico(s)}${ech(T(s + ".titre"))}</button>`).join("")}</div>` : ""}<div class="actions"><button class="principal${choix ? "" : " sel"}" data-action="suivant">${ech(T(fin ? "terminer" : "decouvrir"))}</button>${!fin ? `<button class="${choix ? "sel" : ""}" data-action="fermer">${ech(T("passer"))}</button>` : ""}</div></div>`;
    racine.querySelector(".contenu").innerHTML = `<h2 class="tete">${ech(T("rubrique"))}<span>${marque("SteamU")} ${ech(courante)}</span></h2>${contenu}<div class="points">${Array.from({ length: CLES.length + 2 }, (_, i) => `<button data-page="${i}" class="${i === page ? "on" : ""}" aria-label="${i + 1}" ${i === page ? 'aria-current="step"' : ""}></button>`).join("")}</div><div class="pcv-legende">${legende()}</div>`;
    if (milieu) ranger(racine.querySelector(".piste"));
    const o = window.__pcvReduit?.() ? null : window.__pcvPanneau?.();
    if (fin && dernierePage === CLES.length && o) racine.querySelector(".centre")?.animate?.({ transform: ["translateX(40%)", "none"], opacity: [0, 1] }, o);
    else P.entrer(racine, milieu ? ".piste" : ".centre");
    dernierePage = page;
  };
  let derriere = null, pageAvant = null;
  const fermer = (accueil = true) => {
    if (!ouverte) return;
    ouverte = false;
    suspendu = false;
    gestes.annuler();
    window.__pcvAuRelacher?.(null);
    const f = derriere;
    derriere = null;
    if (f) f();
    const cacher = () => {
      window.__pcvApparition?.(racine, true);
      racine.hidden = true;
    };
    if (f) setTimeout(() => {
      if (!ouverte) cacher();
    }, 350);
    else cacher();
    if (guide && PAGES_GUIDE[page] === "fin" && !f) {
      pageAvant = null;
      window.__pcvPlaceMontrer?.(true);
    }
    if (guide) {
      arreterFilms();
      if (nouveau()) {
        ecrire(VUES, JSON.stringify([.../* @__PURE__ */ new Set([...vues(), courante])]));
        ecrire("pcv-maj-nouveautes", courante);
      }
      ecrire(GUIDE, "1");
      window.__pcvGreffon.decouverte = false;
      (O.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "guide_vu").catch(() => null);
    } else ecrire(AVIS, courante);
    window.__pcvSon?.("retour");
    if (!f && accueil) {
      if (pageAvant) window.__pcvBridge?.revenirA?.(pageAvant);
      else window.__pcvBridge?.ouvrirAccueil();
    }
    pageAvant = null;
  };
  const ouvrir = (v = version(), retour = true, decouverte = nouveau()) => {
    if (ouverte) return true;
    if (!decouverte && !notes(v)) return false;
    if (document.body.dataset.pcvPage !== "accueil") {
      if (retour) pageAvant ||= window.__pcvBridge?.page?.() || null;
      window.__pcvSteamU?.fermer();
      window.__pcvBridge?.ouvrirAccueil();
      let n = 0;
      const t = setInterval(() => {
        const ici = document.body.dataset.pcvPage === "accueil";
        if (ici || ++n > 20) {
          clearInterval(t);
          if (ici) ouvrir(v, retour, decouverte);
        }
      }, 150);
      return true;
    }
    guide = decouverte;
    suspendu = false;
    racine.classList.toggle("guide", guide);
    courante = v;
    page = 0;
    choix = guide ? -1 : 0;
    dernierePage = -1;
    zi = 1;
    essaisZoom = 0;
    carteGuide = -1;
    delete zoomGuide.crans;
    window.__pcvBarreQuitter?.();
    window.__pcvEcran?.fermer();
    window.__pcvNotifsMontrer?.(false);
    window.__pcvSteamU?.fermer();
    ouverte = true;
    vueSeance = v;
    if (!guide) ecrire(VUES, JSON.stringify([.../* @__PURE__ */ new Set([...vues(), v])]));
    racine.hidden = false;
    window.__pcvFond?.(racine);
    dessiner();
    window.__pcvApparition?.(racine);
    if (guide) lireImport();
    return true;
  };
  const legende = (fin = page === CLES.length + 1) => guide ? window.__pcvIcones.legende([
    [[5, 6], G(PAGES_GUIDE[page] === "grille" ? "grille.essayer" : PAGES_GUIDE[page] === "applis" ? "cartes" : "pages")],
    ["stick-droit", G("pages")],
    ...PAGES_GUIDE[page] === "place" ? [[4, G("place.geste")]] : [],
    [2, G(page ? "precedent" : "passer")],
    [1, racine.querySelector(".sel")?.getAttribute("aria-label") || racine.querySelector(".sel")?.querySelector("b, h2")?.textContent || racine.querySelector(".sel")?.textContent || G(PAGES_GUIDE[page] === "fin" ? "fin.action" : page === 0 ? "commencer" : "continuer")]
  ]) : window.__pcvIcones.legende(window.__pcvLegendeDe([page > 0 && [5, "\u25C0"], page > 0 && !fin && [6, "\u25B6"], [1, T(page >= CLES.length ? "terminer" : page === 0 ? choix ? "passer" : "decouvrir" : page === 1 && choix ? "sommaire" : "continuer")], !fin && !(page === 0 && choix) && [2, T("passer")]].filter(Boolean)));
  const commandesGuide = () => [...racine.querySelectorAll('.guide-page button, .guide-page [data-appli], .guide-page [data-action="place"], .guide-pied [data-action="importer"]')].filter((e) => e.getAttribute("aria-hidden") !== "true");
  const marquerGuide = () => {
    const liste = commandesGuide();
    if (choix >= liste.length) choix = -1;
    liste.forEach((e, i) => e.classList.toggle("sel", i === choix));
    dessinerLegende();
  };
  const choisirCarteGuide = (c) => {
    choix = 0;
    survolGuide(applisGuide().findIndex((a) => a.id === c.dataset.appli));
    marquerGuide();
  };
  const dessinerLegende = () => {
    const l = racine.querySelector(guide ? ".guide-pied .pcv-legende" : ".pcv-legende");
    if (l) l.innerHTML = legende();
  };
  const marquerChoix = () => {
    racine.querySelectorAll(".actions button").forEach((b, i) => b.classList.toggle("sel", i === choix));
    racine.querySelectorAll(".fleche.fin").forEach((f) => f.classList.toggle("sel", !!choix));
    dessinerLegende();
  };
  const deplacer = (d) => {
    const suivante = Math.max(0, Math.min(guide ? PAGES_GUIDE.length - 1 : CLES.length + 1, page + d));
    if (suivante === page) return;
    page = suivante;
    choix = guide ? -1 : 0;
    dessiner();
    window.__pcvSon?.("bouge");
  };
  const avancerCarte = (d) => {
    if (d > 0 && carteGuide === applisGuide().length - 1 || d < 0 && carteGuide <= 0) return deplacer(d);
    survolGuide(Math.max(0, Math.min(applisGuide().length - 1, Math.max(0, carteGuide) + d)));
    marquerGuide();
  };
  const continuer = () => guide && PAGES_GUIDE[page] === "applis" ? avancerCarte(1) : guide ? PAGES_GUIDE[page] === "fin" ? fermer() : deplacer(1) : page >= CLES.length ? fermer() : deplacer(1);
  const touche = (b) => {
    if (!ouverte || suspendu) return false;
    if (guide) {
      const cle = PAGES_GUIDE[page];
      if (cle === "grille" && (b === 5 || b === 6)) {
        zoomGuide(b === 5 ? -1 : 1);
        marquerGuide();
      } else if (cle === "applis" && (b === 5 || b === 6)) avancerCarte(b === 5 ? -1 : 1);
      else if (b === 5 || b === 6 || b === 26 || b === 27) deplacer(b === 5 || b === 26 ? -1 : 1);
      else if (cle === "place" && b === 4) basculerPlace();
      else if (cle === "applis" && (b === 11 || b === 12)) avancerCarte(b === 11 ? -1 : 1);
      else if ([9, 10, 11, 12].includes(b)) {
        const liste = commandesGuide();
        const d = [9, 11].includes(b) ? -1 : 1;
        choix = choix < 0 ? d < 0 ? liste.length - 1 : Math.min(0, liste.length - 1) : Math.max(-1, Math.min(liste.length - 1, choix + d));
        marquerGuide();
      } else if (b === 2) {
        if (page) deplacer(-1);
        else fermer();
      } else if (b === 1) {
        const cible = commandesGuide()[choix];
        if (cible) cible.click();
        else continuer();
      }
      return true;
    }
    if (page === 0 && (b === 11 || b === 12)) {
      const c = b === 12 ? 1 : 0;
      if (c === choix) window.__pcvSon?.("bord");
      else {
        choix = c;
        marquerChoix();
        window.__pcvSon?.("bouge");
      }
    } else if (page === 0 && (b === 5 || b === 6)) window.__pcvSon?.("bord");
    else if ((b === 11 || b === 12) && page <= CLES.length && (choix || page === (b === 11 ? 1 : CLES.length))) {
      if (choix && page === (b === 11 ? 1 : CLES.length)) window.__pcvSon?.("bord");
      else {
        choix = 1 - choix;
        marquerChoix();
        window.__pcvSon?.("bouge");
      }
    } else if (b === 2) fermer();
    else if (b === 11 || b === 5) deplacer(-1);
    else if (b === 12 || b === 6) deplacer(1);
    else if (b === 1) {
      if (page === 0 && choix) fermer();
      else if (page === 1 && choix) deplacer(-1);
      else continuer();
    }
    return true;
  };
  racine.onclick = (e) => {
    if (!gestes.accepter(e)) return;
    const z = e.target.closest("[data-z]");
    if (guide && page === 1 && z) return zoomGuide(+z.dataset.z);
    if (guide && e.target.closest('[data-action="place"]')) return basculerPlace();
    const b = e.target.closest("button, [data-appli]");
    if (!b) return;
    if (guide && b.dataset.cartePas) {
      if (Number(b.dataset.cartePas) < 0 && carteGuide === 0) deplacer(-1);
      else avancerCarte(Number(b.dataset.cartePas));
      return;
    }
    if (guide && b.dataset.appli) {
      const v = b.querySelector("video");
      if (v) v.currentTime = 0;
      return choisirCarteGuide(b);
    }
    if (b.dataset.page !== void 0) {
      if (page === +b.dataset.page) return;
      page = +b.dataset.page;
      choix = guide ? -1 : 0;
      dessiner();
    } else if (guide && b.dataset.reglage) {
      const c = b.dataset.reglage;
      if (c === "spotpass") {
        if (window.__pcvSpotPass?.actif()) window.__pcvSpotPass.desactiver();
        else window.__pcvSpotPass?.activer();
      } else window.__pcvSteamU?.basculerConfidentialite(c);
      dessiner();
    } else if (guide && b.dataset.action === "importer") reglerGuide();
    else if (b.dataset.action === "fermer") fermer();
    else if (b.dataset.action === "precedent") deplacer(-1);
    else continuer();
  };
  racine.onpointerover = (e) => {
    const c = e.target.closest("[data-appli]");
    if (guide && c && !c.contains(e.relatedTarget)) choisirCarteGuide(c);
  };
  racine.onfocusin = (e) => {
    const c = e.target.closest("[data-appli]");
    if (guide && c) choisirCarteGuide(c);
  };
  racine.onpointerdown = (e) => {
    const c = e.target.closest("[data-appli]");
    if (guide && c) choisirCarteGuide(c);
  };
  const gestes = P.gestes({ ombre: racine, balayer: (e, a) => {
    if (guide && e.target.closest(".cartes")) {
      if (Math.abs(a.dx) > 40 * innerHeight / 800 && Math.abs(a.dx) > Math.abs(a.dy)) avancerCarte(a.dx < 0 ? 1 : -1);
      return;
    }
    if (page > 0 && Math.abs(a.dx) > 40 * innerHeight / 800 && Math.abs(a.dx) > Math.abs(a.dy)) deplacer(a.dx < 0 ? 1 : -1);
  } });
  const clavier = (e) => {
    const b = { ArrowLeft: 11, ArrowRight: 12, ArrowUp: 9, ArrowDown: 10, Escape: 2, Enter: 1, x: 3, y: 4, q: 5, e: 6 }[e.key];
    if (!ouverte || suspendu || !b) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    if (b === 1) {
      if (e.type === "keydown" && !e.repeat) window.__pcvAuRelacher?.(() => touche(1), racine.querySelector("button.sel"));
      else if (e.type === "keyup") {
        window.__pcvAuRelacher?.(null);
        touche(1);
      }
    } else if (e.type === "keydown") touche(b);
  };
  window.addEventListener("keydown", clavier, true);
  window.addEventListener("keyup", clavier, true);
  const apparence = () => {
    arreterFilms();
    dessiner();
  };
  window.addEventListener("pcv-apparence", apparence);
  window.addEventListener("pcv-theme", apparence);
  const symboles = new MutationObserver(() => {
    if (!ouverte || suspendu) return;
    dessinerLegende();
    if (guide && ["grille", "place"].includes(PAGES_GUIDE[page])) mini();
    if (guide && PAGES_GUIDE[page] === "grille") racine.querySelector(".guide-page .geste").innerHTML = window.__pcvIcones.legende([[[5, 6], G("grille.essayer")]]);
    racine.querySelectorAll(".texte .geste .pcv-touche, .piste p .pcv-touche").forEach((y) => {
      y.outerHTML = window.__pcvIcones.touche(4);
    });
  });
  symboles.observe(document.documentElement, { attributes: true, attributeFilter: ["data-pcv-manette", "data-pcv-inverse"] });
  const verifier = () => {
    const v = version();
    if (v && !nouveau() && (!notes(v) || vues().includes(v))) return clearInterval(suivi);
    if (!v || vueSeance === v || !window.__pcvAccueilPose) return;
    if (document.getElementById("pcv-connexion") || document.getElementById("pcv-demarrage") && !window.__pcvDemarrage?.connexionPassee?.()) return;
    O.SteamUIStore?.WindowStore?.GamepadUIMainWindowInstance?.MenuStore?.CloseSideMenus?.();
    if (retourDemande !== v) {
      retourDemande = v;
      window.__pcvBridge?.ouvrirAccueil();
    }
    if (document.body.dataset.pcvPage !== "accueil") return;
    if (ouvrir(v, true, nouveau())) {
      try {
        localStorage.removeItem("pcv-maj-nouveautes");
      } catch (_) {
      }
    }
  };
  (window.__pcvManette ||= {}).bienvenue = touche;
  const stickDroit = (window.SteamClient || O.SteamClient)?.Input?.RegisterForControllerInputMessages((_, source, appuye) => {
    if (appuye && (source === 26 || source === 27) && ouverte && guide && !suspendu && !window.__pcvSteamDessus?.()) touche(source);
  });
  const suivi = setInterval(verifier, 250);
  const attendu = () => {
    const v = version();
    return !!v && (nouveau() || notes(v) && !vues().includes(v)) && vueSeance !== v;
  };
  window.__pcvBienvenue = {
    nouveau,
    guide: () => ouvrir(version(), true, true),
    decouverte: () => guide && ouverte,
    ouvrir,
    fermer,
    touche,
    verifier,
    attendu,
    vueSeance: () => vueSeance === version(),
    derriere: (f) => {
      derriere = f;
    },
    ouvert: () => ouverte,
    affichee: () => ouverte && !suspendu,
    cles: CLES,
    avis: () => lire(AVIS) === version() && notes(version()) && lire(MASQUE) !== version(),
    masquer: () => ecrire(MASQUE, version()),
    liste: () => CLES.map((c) => `<li><b>${ech(T(c + ".titre"))}</b> : ${texte(c)}</li>`).join(""),
    detruire: () => {
      stickDroit?.unregister?.();
      symboles.disconnect();
      arreterFilms();
      ouverte = false;
      gestes.detruire();
      window.__pcvAuRelacher?.(null);
      delete (window.__pcvManette.__brute || window.__pcvManette).bienvenue;
      clearInterval(suivi);
      window.removeEventListener("keydown", clavier, true);
      window.removeEventListener("keyup", clavier, true);
      window.removeEventListener("pcv-apparence", apparence);
      window.removeEventListener("pcv-theme", apparence);
      racine.remove();
    }
  };
})();
