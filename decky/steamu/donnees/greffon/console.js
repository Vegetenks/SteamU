(() => {
  window.__pcvTuilesFin?.();
  const ancienneRacine = document.getElementById("pcv-console");
  if (ancienneRacine) {
    ancienneRacine.hidden = true;
    ancienneRacine.remove();
  }
  clearInterval(window.__pcvConsole);
  clearInterval(window.__pcvPassants);
  clearInterval(window.__pcvDefile);
  removeEventListener("resize", window.__pcvConsoleTaille);
  const T = window.__pcvT || ((c) => c);
  const O = window.opener;
  const ORIGINE_STEAM = "https://steamloopback.host";
  const IMG = (id, f) => `${ORIGINE_STEAM}/assets/${BANC_SOURCE.get(id) ?? id}/${f}`;
  const absolu = (u) => u.startsWith("/") ? ORIGINE_STEAM + u : u;
  const CDN = (id, f) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${BANC_SOURCE.get(id) ?? id}/${f}`;
  const h = (min) => min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
  const ilya = (rt) => {
    const j = Math.floor((Date.now() / 1e3 - rt) / 86400);
    return j <= 0 ? T("accueil.aujourdhui").toLowerCase() : j === 1 ? T("accueil.hier").toLowerCase() : T("accueil.jours", { n: j }).toLowerCase();
  };
  const joli = (t) => t && t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t;
  const lire = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const BANC = Math.max(0, Math.min(5e3, +lire("pcv-banc-biblio", 0) || 0)), BANC_BASE = 3e9, BANC_SOURCE = /* @__PURE__ */ new Map();
  const ecrire = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
    }
  };
  const mode = () => lire("pcv-interface", "nouvelle");
  window.__pcvInterface = (m) => {
    ecrire("pcv-interface", m);
    etaitVisible = false;
    return m;
  };
  const ZOOMS = [{ r: 1, c: 250, g: 34 }, { r: 2, c: 180, g: 26 }, { r: 3, c: 136, g: 20 }, { r: 4, c: 104, g: 16 }, { r: 5, c: 84, g: 13 }, { r: 6, c: 70, g: 11 }, { r: 7, c: 60, g: 10 }, { r: 8, c: 52, g: 9 }];
  const JOUR = [0.12, 0.115, 0.11, 0.1, 0.1, 0.1, 0.1, 0.1];
  const FORMES = { wiiu: { debord: 0, marge: 0.04 }, "3ds": { joint: JOUR, marge: 0.02 } };
  const familleTheme = () => document.documentElement.dataset.pcvFamille === "3ds" ? "3ds" : "wiiu";
  const forme = (z = ZOOMS[zi]) => {
    const F = FORMES[familleTheme()], j = F.joint && (F.joint[ZOOMS.indexOf(z)] ?? F.joint.at(-1)), d = j ? Math.max(0, (z.g - j * (z.c + z.g)) / 2) : z.g * F.debord, t = z.c + 2 * d;
    return { d, pad: t * F.marge, im: t * (1 - 2 * F.marge), bo: t * F.marge - d };
  };
  const DOSSIERS = { max: 60, elements: 60, nom: 17 };
  const GRILLE = { accueil: 360, dossier: 24, libreFin: 0.4 };
  const CADRE = { cote: 40, haut: -4, bas: -6 };
  const ECUSSON = { taille: 0.5 }, SORTIE_MS = 260;
  const GRILLE_HAUT = 8, DEBORD_SEL = 56;
  const IM_DEFAUT = { position: "center 18%", taille: "cover" };
  const icoEntete = (n) => window.__pcvIcones.svg(n, { attrs: 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"' });
  const racine = document.createElement("div");
  racine.id = "pcv-console";
  racine.hidden = true;
  racine.innerHTML = `<style>
    #pcv-console { position: fixed; inset: calc(var(--u) * 98) 0 0 0; z-index: 8500; font-family: var(--pcv-police); color: var(--pcv-texte); background: var(--pcv-fond-page); overflow: hidden; }
    #pcv-console[hidden] { display: none; }
    #pcv-console * { box-sizing: border-box; }
    #pcv-console .titre { position: absolute; left: calc(var(--u) * 64); top: calc(var(--u) * 10); font-size: calc(var(--u) * 26); font-weight: 900; color: var(--pcv-cyan-plein);
      text-shadow: 0 1px 0 rgb(var(--pcv-halo-rgb) / .7); transition: opacity .3s; white-space: nowrap; }
    #pcv-console .titre.dors { opacity: 0; }
    
    #pcv-console .titre { z-index: 5; }
    #pcv-console .titre:empty { display: none; }   
    
    html[data-pcv-fond="image"] #pcv-console .titre { padding: calc(var(--u) * 4) calc(var(--u) * 16); margin-left: calc(var(--u) * -16); border-radius: calc(var(--u) * 20);
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); text-shadow: none; }
    
    #pcv-console { --pcv-zone-haut: calc(var(--u) * 52); --pcv-zone-h: calc(var(--u) * 480); }
    
    #pcv-console.une-rangee:not(.dans-dossier) { --pcv-zone-haut: calc(var(--u) * 116); }
    #pcv-console.une-rangee:not(.dans-dossier) .titre { top: calc(var(--u) * 50); }
    #pcv-console.une-rangee:not(.dans-dossier) .infos { top: calc(var(--u) * 442); }
    #pcv-console .zone { touch-action: none; position: absolute; left: 0; right: 0; top: var(--pcv-zone-haut); height: var(--pcv-zone-h); }
    #pcv-console .grille { position: absolute; left: calc(var(--u) * 64); top: calc(var(--u) * ${GRILLE_HAUT}); display: grid; grid-auto-flow: column;
      grid-template-rows: repeat(var(--r), calc(var(--u) * var(--c))); grid-auto-columns: calc(var(--u) * var(--c)); gap: calc(var(--u) * var(--g));
      transition: transform .25s cubic-bezier(.3,1.2,.5,1); will-change: transform; }   
    
    html[data-pcv-plaque] #pcv-console:not(.dans-dossier) .zone { top: calc(var(--pcv-zone-haut) - var(--u) * ${DEBORD_SEL}); height: calc(var(--pcv-zone-h) + var(--u) * ${DEBORD_SEL}); }
    html[data-pcv-plaque] #pcv-console:not(.dans-dossier) .grille { top: calc(var(--u) * (${GRILLE_HAUT} + ${DEBORD_SEL})); }
    #pcv-console .cel { position: relative; border-radius: calc(var(--u) * var(--c) * .18); }
    #pcv-console .cel.jeu, #pcv-console .cel.app, #pcv-console .cel.dos { margin: calc(var(--u) * var(--d) * -1); padding: calc(var(--u) * var(--pad)); background: var(--pcv-verre);
      box-shadow: inset 0 3px 1px var(--pcv-reflet-haut), inset 0 -6px 10px rgba(140,160,185,.25), 0 0 0 2px color-mix(in srgb, var(--pcv-carte) 80%, transparent), 0 calc(var(--u) * 10) calc(var(--u) * 20) rgba(0,0,0,.16); }
    #pcv-console .cel.pose { animation: pcvPoseC .45s ease-out both; }
    #pcv-console .cel.prise { cursor: grabbing; }
    
    #pcv-console.au-doigt .cel.porte { transform: none !important; box-shadow: none !important; opacity: .35; }
    #pcv-console .fantome { position: fixed; left: 0; top: 0; z-index: 20; pointer-events: none; transform-origin: 50% 50%; will-change: transform;
      box-shadow: 0 0 0 calc(var(--u) * 4) var(--pcv-lisere), 0 calc(var(--u) * 22) calc(var(--u) * 34) rgba(0,0,0,.32); }
    #pcv-console .fantome.vide { box-shadow: none; }
    #pcv-console .cel.vise-libre { box-shadow: 0 0 0 calc(var(--u) * 4) var(--pcv-lisere), 0 0 0 calc(var(--u) * 8) var(--pcv-rangement) !important; background: color-mix(in srgb, var(--pcv-carte) 18%, transparent) !important; }
    #pcv-console .cel.vise-echange { box-shadow: 0 0 0 calc(var(--u) * 4) var(--pcv-lisere), 0 0 0 calc(var(--u) * 8) var(--pcv-rangement) !important; transform: scale(.9); opacity: .8; transition: transform .15s, opacity .15s; }
    #pcv-console .cel .im { width: 100%; height: 100%; border-radius: calc(var(--u) * var(--c) * .15); background: var(--pcv-creux) ${IM_DEFAUT.position} / ${IM_DEFAUT.taille}; position: relative; overflow: hidden; }
    #pcv-console .cel .im::after { content: ""; position: absolute; inset: 0; background: linear-gradient(160deg, color-mix(in srgb, var(--pcv-carte) 40%, transparent), transparent 35%); }
    
    #pcv-console .cel.app .im { display: flex; align-items: center; justify-content: center; background: var(--fond);
      box-shadow: inset 0 calc(var(--u) * var(--c) * -.04) calc(var(--u) * var(--c) * .08) rgba(0,0,0,.18); }
    #pcv-console .cel.app .im::after { background: linear-gradient(180deg, color-mix(in srgb, var(--pcv-carte) 45%, transparent), transparent 48%); }
    #pcv-console .cel.app .im svg { position: relative; z-index: 1; width: 58%; height: 58%; filter: drop-shadow(0 calc(var(--u) * var(--c) * .012) 0 rgba(0,0,0,.18)); }
    
    #pcv-console .rien { position: absolute; left: calc(var(--u) * 64); bottom: calc(var(--u) * 96); display: none; align-items: center; gap: calc(var(--u) * 12);
      padding: calc(var(--u) * 8) calc(var(--u) * 20) calc(var(--u) * 8) calc(var(--u) * 8); border-radius: calc(var(--u) * 26); background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre);
      font-size: calc(var(--u) * 17); font-weight: 800; color: var(--pcv-texte2); }
    #pcv-console .rien.on { display: flex; cursor: pointer; }
    #pcv-console.dans-dossier .rien { display: none; }
    #pcv-console .rien i { width: calc(var(--u) * 38); height: calc(var(--u) * 38); border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; background: linear-gradient(160deg, #b9a4ff, #6d4fd6); }
    #pcv-console .rien i svg { width: 58%; height: 58%; }
    
    #pcv-console .chem .ap b.a { display: flex; align-items: center; justify-content: center; }
    #pcv-console .chem .ap b.a svg { width: 70%; height: 70%; }
    
    #pcv-console .cel .im > video.pcv-anim, #pcv-console .cel .im > .pcv-anim-dessus { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: inherit; pointer-events: none; }
    #pcv-console .cel .im > video.pcv-anim { object-fit: fill; background: var(--pcv-creux); }
    #pcv-console .cel .im > video.pcv-anim.attente { opacity: 0; }
    #pcv-console .cel .im.pcv-anim-actif { background-image: none !important; }
    #pcv-console .cel .im .nuage { position: absolute; right: 5%; bottom: 4%; z-index: 1; width: max(28%, calc(var(--u) * 16)); aspect-ratio: 1;
      filter: drop-shadow(0 calc(var(--u) * 1) calc(var(--u) * 2) rgba(0,0,0,.35)); }
    #pcv-console .cel .im .nuage svg { display: block; width: 100%; height: 100%; }
    
    #pcv-console .cel.app.pcv-verrou .im { filter: grayscale(.55) brightness(.72); }
    #pcv-console .cel.app.pcv-verrou .im .cadenas { position: absolute; right: 6%; bottom: 5%; z-index: 1; width: max(26%, calc(var(--u) * 15)); aspect-ratio: 1;
      filter: drop-shadow(0 calc(var(--u) * 1) calc(var(--u) * 2) rgba(0,0,0,.45)); }
    
    #pcv-console .cel.vide { background: none; box-shadow: none; }
    
    #pcv-console .cel.vide:not(.couverte):not(.ancre):not(:has(.bdg))::after { content: ""; position: absolute; left: 50%; top: 50%; width: calc(var(--u) * (var(--c) + var(--g)) * .35); aspect-ratio: 1;
      transform: translate(-50%, -50%); border-radius: 42%; background: color-mix(in srgb, var(--pcv-carte) 40%, transparent);
      box-shadow: inset 0 0 0 calc(var(--u) * 1.5) rgb(from var(--pcv-ombre-c) r g b / .16); pointer-events: none; }
    #pcv-console .grille:has(.porte) .cel.vide:not(.couverte):not(.ancre):not(:has(.bdg))::after { background: color-mix(in srgb, var(--pcv-carte) 65%, transparent); }
    
    body:not(.pcv-zone-jaquettes) #pcv-console .cel.vide.sel { box-shadow: none; }
    body.pcv-zone-jaquettes #pcv-console .cel.vide.sel { transform: none; box-shadow: 0 0 0 calc(var(--u) * var(--sw, 5)) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * var(--sc, 10)) var(--pcv-cyan-plein), 0 0 calc(var(--u) * var(--sg, 26)) 0 color-mix(in srgb, var(--pcv-cyan-plein) 30%, transparent); }
    #pcv-console .cel.couverte, #pcv-console .cel.ancre:not(.sel) { background: none !important; box-shadow: none !important; }
    #pcv-console .cel.couverte.sel { outline: calc(var(--u) * 3) dashed var(--pcv-cyan-plein); outline-offset: calc(var(--u) * -3); }
    
    body.pcv-zone-jaquettes #pcv-console .cel.vide.sel:has(> .bdg) { box-shadow: none; }
    body.pcv-zone-jaquettes #pcv-console .cel.vide.sel:has(> .bdg)::before { content: none; }
    body.pcv-zone-jaquettes #pcv-console .cel.sel > .bdg::after { content: ""; position: absolute; inset: 0; border-radius: calc(var(--u) * var(--c) * .18); pointer-events: none;
      box-shadow: inset 0 0 0 calc(var(--u) * var(--si, 0)) var(--pcv-cyan-plein), 0 0 0 calc(var(--u) * var(--sw, 5)) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * var(--sc, 10)) var(--pcv-cyan-plein), 0 0 calc(var(--u) * var(--sg, 26)) 0 color-mix(in srgb, var(--pcv-cyan-plein) 30%, transparent); }
    
    #pcv-console .cel .bdg { position: absolute; inset: calc(var(--u) * var(--g) / -2 - .5px); background: center / contain no-repeat; image-rendering: pixelated; }
    #pcv-console .cel .bdg.grand { right: auto; bottom: auto; z-index: 2;
      width: calc(var(--u) * var(--w) * (var(--c) + var(--g)) + 1px); height: calc(var(--u) * var(--h) * (var(--c) + var(--g)) + 1px); }
    
    #pcv-console .cel.dos { --dos: var(--pcv-accent, var(--pcv-cyan-plein, #2fb8ff)); }
    #pcv-console .chem { position: relative; width: 100%; height: 100%; border-radius: calc(var(--u) * var(--c) * .15); overflow: hidden;
      background: linear-gradient(180deg, color-mix(in srgb, var(--pcv-carte) 70%, transparent), color-mix(in srgb, var(--dos) 14%, var(--pcv-carte))); }
    #pcv-console .chem > * { position: absolute; }
    #pcv-console .chem .arr { left: 9%; right: 9%; top: 25%; bottom: 10%; border-radius: 0 9% 9% 9%; background: color-mix(in srgb, var(--dos) 78%, #123); }
    #pcv-console .chem .arr::before { content: ""; position: absolute; left: 0; top: -12%; width: 44%; height: 14%; border-radius: calc(var(--u) * var(--c) * .05) calc(var(--u) * var(--c) * .05) 0 0; background: inherit; }
    #pcv-console .chem .ap { left: 16%; right: 16%; top: 13%; height: 48%; display: flex; justify-content: center; align-items: flex-end; }
    #pcv-console .chem .ap b { flex: none; width: 38%; height: 92%; margin: 0 -5%; border-radius: calc(var(--u) * var(--c) * .04); background: var(--pcv-creux) center 18% / cover;
      box-shadow: 0 0 0 calc(var(--u) * var(--c) * .012) var(--pcv-lisere), 0 2px 4px rgba(0,0,0,.3); transform: rotate(var(--rot)) translateY(var(--dy)); transition: transform .25s; }
    #pcv-console .chem .ap b.b { height: 62%; background: center / contain no-repeat; box-shadow: none; filter: drop-shadow(0 2px 2px rgba(0,0,0,.35)); }
    #pcv-console .chem .av { left: 5%; right: 5%; top: 47%; bottom: 7%; border-radius: calc(var(--u) * var(--c) * .07); transform-origin: 50% 100%; transition: transform .3s cubic-bezier(.3,1.4,.5,1);
      background: linear-gradient(180deg, color-mix(in srgb, var(--dos) 52%, var(--pcv-carte)), var(--dos)); box-shadow: inset 0 2px 0 color-mix(in srgb, var(--pcv-carte) 60%, transparent), 0 -2px 6px rgba(0,0,0,.18); }
    #pcv-console .chem em { left: 9%; right: 9%; bottom: 14%; text-align: center; font-style: normal; font-weight: 900; font-size: calc(var(--u) * var(--c) * .118); line-height: 1.2; color: var(--pcv-sur-accent);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 2px rgba(0,0,0,.4); }
    #pcv-console .chem small { right: 5%; top: 5%; min-width: 24%; height: 21%; padding: 0 5%; border-radius: calc(var(--u) * var(--c) * .11); display: flex; align-items: center; justify-content: center;
      background: var(--pcv-carte); color: color-mix(in srgb, var(--dos) 80%, #000); font-size: calc(var(--u) * var(--c) * .12); font-weight: 900; box-shadow: 0 2px 4px rgba(0,0,0,.2); }
    #pcv-console .chem small:empty { display: none; }
    
    #pcv-console .chem .ec { left: 50%; top: 45%; width: calc(var(--u) * var(--im) * ${ECUSSON.taille}); height: calc(var(--u) * var(--im) * ${ECUSSON.taille}); transform: translateX(-50%) rotate(-5deg);
      background: center / contain no-repeat; image-rendering: pixelated; filter: drop-shadow(0 0 calc(var(--u) * 1.5) #fff) drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
    #pcv-console .chem.a-ec em { display: none; }
    html[data-pcv-dossier="image"] #pcv-console .chem .ec { top: 15%; }
    
    #pcv-console .cel.cible { z-index: 4; transform: scale(1.1); box-shadow: 0 0 0 calc(var(--u) * 5) var(--pcv-lisere), 0 0 0 calc(var(--u) * 10) var(--pcv-rangement), 0 calc(var(--u) * 14) calc(var(--u) * 26) rgba(0,0,0,.25) !important; }
    #pcv-console .cel.cible .av { transform: perspective(calc(var(--u) * 200)) rotateX(-32deg); }
    #pcv-console .cel.cible .ap b { --dy: -14%; }
    
    html[data-pcv-dossier="image"] #pcv-console .chem .arr, html[data-pcv-dossier="image"] #pcv-console .chem .ap { display: none; }
    
    html[data-pcv-dossier="image"] #pcv-console { --dos-ferme: polygon(1.35% 3.13%, 2.7% 1.56%, 40.5% 1.56%, 43.2% 7.81%, 98.6% 7.81%, 98.6% 96.9%, 97.3% 98.4%, 2.7% 98.4%, 1.35% 96.9%);
      --dos-ouvert: polygon(4.88% 3.13%, 6.1% 1.56%, 39% 1.56%, 41.5% 6.25%, 91.5% 6.25%, 91.5% 31.25%, 98.8% 31.25%, 93.9% 98.4%, 6.1% 98.4%, 1.22% 31.25%, 4.88% 31.25%); }
    
    #pcv-console .cel.dos, #pcv-console .chem { background: none; }
    #pcv-console .cel.dos:not(.sel):not(.cible):not(.porte) { box-shadow: none; }
    #pcv-console .chem { filter: drop-shadow(0 3px 3px rgba(0,0,0,.25)); }
    html[data-pcv-dossier="image"] #pcv-console .chem .av { left: 4%; right: 4%; top: 50%; translate: 0 -50%; bottom: auto; aspect-ratio: 74 / 64;    border-radius: 0; box-shadow: none;
      background: var(--pcv-dossier-ferme) 0 0 / 172.97% 100% no-repeat; image-rendering: pixelated;
      clip-path: var(--dos-ferme); }
    html[data-pcv-dossier="image"] #pcv-console .cel.cible .av { transform: none; background-image: var(--pcv-dossier-ouvert, var(--pcv-dossier-ferme)); background-size: 156.1% 100%; aspect-ratio: 82 / 64;
      clip-path: var(--dos-ouvert); }
    html[data-pcv-dossier="image"] #pcv-console .chem em { bottom: 7%; color: var(--pcv-texte); text-shadow: 0 0 calc(var(--u) * 3) rgb(var(--pcv-halo-rgb) / .9), 0 0 calc(var(--u) * 6) rgb(var(--pcv-halo-rgb) / .7); }   
    
    #pcv-console .zone::before { content: ""; position: absolute; left: calc(var(--u) * ${CADRE.cote}); right: calc(var(--u) * ${CADRE.cote}); top: calc(var(--u) * ${CADRE.haut}); bottom: calc(var(--u) * ${CADRE.bas}); border-radius: calc(var(--u) * 34);
      background: color-mix(in srgb, var(--pcv-accent, #2fb8ff) 16%, color-mix(in srgb, var(--pcv-carte) 30%, transparent)); box-shadow: inset 0 0 0 calc(var(--u) * 2) color-mix(in srgb, var(--pcv-carte) 55%, transparent); opacity: 0; transform: scale(.96); transition: opacity .3s, transform .3s; pointer-events: none; }
    #pcv-console.dans-dossier .zone::before { opacity: 1; transform: none; }
    
    #pcv-console .grille.partant { pointer-events: none; }
    #pcv-console.dans-dossier .titre { left: auto; right: calc(var(--u) * 64); }
    
    #pcv-console.dans-dossier .etat { top: auto; bottom: calc(var(--u) * 76); }
    #pcv-console .entete { position: absolute; left: calc(var(--u) * 64); top: calc(var(--u) * 4); height: calc(var(--u) * 48); display: none; align-items: center; gap: calc(var(--u) * 10); z-index: 6;
      padding: 0 calc(var(--u) * 7) 0 calc(var(--u) * 10); border-radius: calc(var(--u) * 24); background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); white-space: nowrap; }
    #pcv-console.dans-dossier .entete { display: flex; animation: pcvBulleC .35s cubic-bezier(.3,1.7,.5,1) both; }
    #pcv-console .entete .ic { width: calc(var(--u) * 34); height: calc(var(--u) * 28); position: relative; flex: none; }
    #pcv-console .entete .ic::before, #pcv-console .entete .ic::after { content: ""; position: absolute; border-radius: calc(var(--u) * 4); background: color-mix(in srgb, var(--pcv-accent, #2fb8ff) 78%, #123); }
    #pcv-console .entete .ic::before { left: 0; top: 0; width: 46%; height: 40%; }
    #pcv-console .entete .ic::after { left: 0; right: 0; top: 18%; bottom: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--pcv-accent, #2fb8ff) 52%, var(--pcv-carte)), var(--pcv-accent, #2fb8ff));
      transform: perspective(calc(var(--u) * 60)) rotateX(-28deg); transform-origin: 50% 100%; }
    html[data-pcv-dossier="image"] #pcv-console .entete .ic { width: calc(var(--u) * 41); height: calc(var(--u) * 32); background: var(--pcv-dossier-ouvert, var(--pcv-dossier-ferme)) 0 0 / 156.1% 100% no-repeat; image-rendering: pixelated;
      clip-path: var(--dos-ouvert); }
    html[data-pcv-dossier="image"] #pcv-console .entete .ic::before, html[data-pcv-dossier="image"] #pcv-console .entete .ic::after { display: none; }
    #pcv-console .entete b { font-size: calc(var(--u) * 22); font-weight: 900; max-width: calc(var(--u) * 360); overflow: hidden; text-overflow: ellipsis; }
    #pcv-console .entete small { font-size: calc(var(--u) * 15); font-weight: 800; color: var(--pcv-texte2); margin-right: calc(var(--u) * 6); }
    #pcv-console .entete button { font: inherit; color: var(--pcv-texte); border: 0; cursor: pointer; display: flex; align-items: center; gap: calc(var(--u) * 7); height: calc(var(--u) * 36);
      padding: 0 calc(var(--u) * 14) 0 calc(var(--u) * 8); border-radius: calc(var(--u) * 18); font-size: calc(var(--u) * 15); font-weight: 800;
      
      background: var(--pcv-verre); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 2px 0 rgb(from var(--pcv-ombre-c) r g b / .22); transition: transform .15s, box-shadow .15s; }
    #pcv-console .entete button[hidden] { display: none; }
    #pcv-console .entete button i { width: calc(var(--u) * 20); height: calc(var(--u) * 20); flex: none; }
    #pcv-console .entete button i svg { width: 100%; height: 100%; }
    
    #pcv-console .entete button.choisi { transform: scale(1.06); box-shadow: 0 0 0 calc(var(--u) * 3) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * 6) var(--pcv-cyan-plein); }
    body.pcv-zone-jaquettes #pcv-console.sur-tete .cel.sel { transform: none; box-shadow: inset 0 3px 1px var(--pcv-reflet-haut), 0 0 0 2px color-mix(in srgb, var(--pcv-carte) 80%, transparent), 0 calc(var(--u) * 10) calc(var(--u) * 20) rgba(0,0,0,.16); }
    body.pcv-zone-jaquettes #pcv-console.sur-tete .cel.vide.sel { box-shadow: none; }
    body.pcv-zone-jaquettes #pcv-console.sur-tete .cel.sel::before, body.pcv-zone-jaquettes #pcv-console.sur-tete .cel.sel > .bdg::after { content: none; }
    #pcv-console .entete button.cible { transform: scale(1.1); box-shadow: 0 0 0 calc(var(--u) * 4) var(--pcv-lisere), 0 0 0 calc(var(--u) * 8) var(--pcv-rangement); }
    body.pcv-deco #pcv-console .entete { visibility: hidden; }
    #pcv-console .note { position: absolute; left: 50%; top: calc(var(--u) * 58); transform: translateX(-50%); padding: calc(var(--u) * 7) calc(var(--u) * 18); border-radius: calc(var(--u) * 20); z-index: 7;
      background: rgba(47,58,74,.88); color: var(--pcv-sur-accent); font-size: calc(var(--u) * 16); font-weight: 800; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity .3s; }
    #pcv-console .note.on { opacity: 1; }
    #pcv-console .sonde { position: absolute; width: calc(var(--u) * 100); height: 0; visibility: hidden; }
    #pcv-console .cel.sel { z-index: 3; transform: scale(var(--sk, 1.05));
      box-shadow: inset 0 3px 1px var(--pcv-reflet-haut), 0 0 0 calc(var(--u) * var(--sw, 5)) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * var(--sc, 10)) var(--pcv-cyan-plein), 0 0 calc(var(--u) * var(--sg, 26)) 0 color-mix(in srgb, var(--pcv-cyan-plein) 40%, transparent); }
    
    body.pcv-zone-jaquettes #pcv-console .cel.sel::before { content: ""; position: absolute; inset: 0; z-index: 4; border-radius: inherit; pointer-events: none;
      box-shadow: inset 0 0 0 calc(var(--u) * var(--si, 0)) var(--pcv-cyan-plein); }
    body:not(.pcv-zone-jaquettes) #pcv-console .cel.sel { transform: none; box-shadow: inset 0 3px 1px var(--pcv-reflet-haut), 0 0 0 2px color-mix(in srgb, var(--pcv-carte) 80%, transparent), 0 calc(var(--u) * 10) calc(var(--u) * 20) rgba(0,0,0,.16); }
    #pcv-console .cel.porte { transform: scale(1.15) rotate(5deg) translateY(calc(var(--u) * -8)) !important; z-index: 9;
      box-shadow: 0 0 0 calc(var(--u) * 5) var(--pcv-lisere), 0 0 0 calc(var(--u) * 10) var(--pcv-rangement), 0 calc(var(--u) * 22) calc(var(--u) * 34) rgba(0,0,0,.3) !important; }
    #pcv-console .cel.pulse { animation: pcvPulseC .5s ease-in-out 2; }
    @keyframes pcvPoseC { from { opacity: 0 } to { opacity: 1 } }
    @keyframes pcvPulseC { 50% { box-shadow: inset 0 2px 1px var(--pcv-reflet-haut), 0 0 0 calc(var(--u) * var(--sw, 5)) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * var(--sc, 10)) #7fdcff, 0 0 calc(var(--u) * var(--sg, 26) * 1.5) calc(var(--u) * var(--sw, 5)) rgba(31,179,242,.7) } }
    #pcv-console .infos { position: absolute; left: calc(var(--u) * 64); right: calc(var(--u) * 64); top: calc(var(--u) * 378); display: flex; flex-wrap: wrap; gap: calc(var(--u) * 14) calc(var(--u) * 16); transition: opacity .2s; }
    #pcv-console .infos.cache { opacity: 0; pointer-events: none; }
    #pcv-console .bu { display: flex; align-items: center; gap: calc(var(--u) * 10); height: calc(var(--u) * 54); padding: 0 calc(var(--u) * 20) 0 calc(var(--u) * 8); border-radius: calc(var(--u) * 27);
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: calc(var(--u) * 17); font-weight: 800; white-space: nowrap; flex: none; max-width: calc(var(--u) * 520);
      animation: pcvBulleC .35s cubic-bezier(.3,1.7,.5,1) both; }
    #pcv-console .bu span { overflow: hidden; text-overflow: ellipsis; }
    #pcv-console .bu small { color: var(--pcv-texte2); font-size: calc(var(--u) * 14); margin-left: calc(var(--u) * 6); }
    #pcv-console .bu i { flex: none; width: calc(var(--u) * 38); height: calc(var(--u) * 38); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-style: normal; font-size: calc(var(--u) * 19); background: var(--k); }
    #pcv-console .bu img { flex: none; width: calc(var(--u) * 38); height: calc(var(--u) * 38); border-radius: calc(var(--u) * 10); }
    @keyframes pcvBulleC { from { opacity: 0; transform: translateY(calc(var(--u) * 8)) scale(.9) } }
    #pcv-console .zoom { position: absolute; left: calc(var(--u) * 34); bottom: calc(var(--u) * 24); display: flex; align-items: center; gap: calc(var(--u) * 10);
      padding: calc(var(--u) * 6); border-radius: calc(var(--u) * 30); background: var(--pcv-verre);    box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-weight: 900; font-size: calc(var(--u) * 15); }
    
    #pcv-console .zoom b { width: calc(var(--u) * 28); height: calc(var(--u) * 28); border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--pcv-creux); color: #fff; cursor: pointer; font-size: calc(var(--u) * 13); }
    
    #pcv-console .zoom .pic { width: calc(var(--u) * 26); height: calc(var(--u) * 26); color: var(--pcv-cyan-plein); display: flex; }
    #pcv-console .zoom .pic svg { width: 100%; height: 100%; }
    #pcv-console .zoom i { width: calc(var(--u) * 12); height: calc(var(--u) * 12); border-radius: 50%; background: #cdd4da; }
    #pcv-console .zoom i.on { background: var(--pcv-cyan-plein); box-shadow: 0 0 0 calc(var(--u) * 3) var(--pcv-anneau-c); }
    
    #pcv-console .bas { position: absolute; left: calc(var(--u) * 400); right: calc(var(--u) * 34); bottom: calc(var(--u) * 24); display: flex; justify-content: flex-end; gap: calc(var(--u) * 12); }
    
    #pcv-console .etat { position: absolute; left: 50%; top: calc(var(--u) * 6); transform: translateX(-50%); padding: calc(var(--u) * 6) calc(var(--u) * 18); border-radius: calc(var(--u) * 20);
      background: var(--pcv-rangement); color: var(--pcv-sur-accent); font-size: calc(var(--u) * 16); font-weight: 800; z-index: 7; white-space: nowrap; display: flex; align-items: center; gap: calc(var(--u) * 6); }
    #pcv-console .etat span { display: flex; align-items: center; }
    #pcv-console .etat u { text-decoration: none; display: inline-flex; align-items: center; justify-content: center; min-width: calc(var(--u) * 22); height: calc(var(--u) * 22); padding: 0 calc(var(--u) * 4);
      margin-right: calc(var(--u) * 5); border-radius: calc(var(--u) * 11); color: var(--pcv-sur-accent); font-size: calc(var(--u) * 12); font-weight: 900; box-shadow: 0 0 0 calc(var(--u) * 2) color-mix(in srgb, var(--pcv-carte) 85%, transparent); }
    #pcv-console .etat:empty { display: none; }
    #pcv-console .blanc { position: absolute; inset: 0; z-index: 20; background: var(--pcv-carte); opacity: 0; pointer-events: none; transition: opacity .45s; }
    #pcv-console .blanc.on { opacity: 1; }
  </style>
  <div class="titre"></div><div class="etat"></div><div class="note"></div><i class="sonde"></i>
  <div class="entete"><i class="ic"></i><b></b><small></small><button class="ren"><i>${icoEntete("crayon")}</i>${T("console.renommer")}</button><button class="sup"><i>${icoEntete("supprimer")}</i>${T("console.supprimer")}</button><button class="dec" hidden><i>${icoEntete("epingle")}</i>${T("console.decoller_badge")}</button>
    <button class="ret"><i>${icoEntete("sortie")}</i>${T("console.retour")}</button></div>
  <div class="zone"><div class="grille"></div></div>
  <div class="infos cache"></div><div class="rien"></div>
  <div class="zoom"><b data-z="-1" data-touche="5"></b><span class="pic">${window.__pcvIcones.svg("tuiles-grandes")}</span>${ZOOMS.map(() => "<i></i>").join("")}<span class="pic">${window.__pcvIcones.svg("tuiles-petites")}</span><b data-z="1" data-touche="6"></b></div>
  <div class="bas pcv-legende"><span class="leg-vue"><u class="pcv-touche" data-touche="13"></u>${T("console.dispositions")}</span><span class="leg-x"><u class="pcv-touche" data-touche="3"></u>${T("console.ranger")}</span><span class="leg-y"><u class="pcv-touche" data-touche="4"></u>${T("spaces.place.nom")}</span><span><u class="pcv-touche" data-touche="1"></u><em class="leg-a">${T("console.ouvrir")}</em></span><span class="leg-start" hidden><u class="pcv-touche" data-touche="14"></u>${T("console.menu")}</span></div>
  <div class="blanc"></div>`;
  document.body.appendChild(racine);
  window.__pcvFond?.(racine);
  const $ = (s) => racine.querySelector(s), grille = $(".grille");
  let principal = [], cases = [], vue = null, sel = 0, zi = lire("pcv-zoom", 0), porte = -1, badgeMain = null, appui = null;
  let tete = -1;
  const boutonsTete = () => [...racine.querySelectorAll(".entete button")].filter((x) => !x.hidden);
  const marquerTete = () => {
    racine.classList.toggle("sur-tete", tete >= 0);
    boutonsTete().forEach((x, k) => x.classList.toggle("choisi", k === tete));
  };
  const SORTIE = -2;
  let cible = -1;
  const RACCOURCI = 1073741824;
  const raccourci = (a) => a.app_type === RACCOURCI || !!a.BIsShortcut?.();
  let appsMemo = null, appsT = -1e9;
  const apps = () => {
    const t = performance.now();
    if (appsMemo && t - appsT < 500) return appsMemo;
    const m = new Map((O.appStore.allApps || []).filter((a) => a.app_type === 1 || raccourci(a)).map((a) => [a.appid, a]));
    if (BANC) {
      const vrais = [...m.values()].filter((a) => a.app_type === 1);
      for (let i = 0; i < BANC && vrais.length; i++) {
        const src = vrais[i % vrais.length], id = BANC_BASE + i;
        BANC_SOURCE.set(id, src.appid);
        m.set(id, Object.assign({}, src, { appid: id, display_name: `${src.display_name} ${i + 1}`, local_per_client_data: { installed: true }, rt_last_time_played: 0 }));
      }
    }
    appsT = t;
    return appsMemo = m;
  };
  const installe = (a) => raccourci(a) || !!a.local_per_client_data?.installed;
  const distant = (a) => !installe(a) && (a.per_client_data || []).some((p) => p.clientid !== "0" && p.installed);
  const reglageJeux = () => {
    try {
      return String(localStorage.getItem("pcv-accueil-jeux") || "").replace(/"/g, "") === "tous" ? "tous" : "installes";
    } catch (e) {
      return "installes";
    }
  };
  const retires = () => lire("pcv-accueil-retires", {});
  const accueilRetire = (id) => !!retires()[id];
  const accueilRetirer = (id, oui = true) => {
    const r = retires();
    if (oui) r[id] = 1;
    else delete r[id];
    ecrire("pcv-accueil-retires", r);
    construireCases();
    infosDe = -1;
    decal = -1;
    debut();
    dessiner();
  };
  const montres = () => {
    const m = apps();
    for (const id of m.keys()) if (accueilRetire(id)) m.delete(id);
    if (reglageJeux() === "tous") return m;
    for (const [id, a] of m) if (!installe(a) && !distant(a)) m.delete(id);
    return m;
  };
  const NUAGE = '<svg viewBox="0 0 24 24"><path d="M7.2 19h10.3a4.3 4.3 0 0 0 .8-8.5 6 6 0 0 0-11.5 1.4A3.6 3.6 0 0 0 7.2 19z" fill="#fff" stroke="#5b6676" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  const icone = (x) => window.__pcvIcones.svg(x.ic, { attrs: 'color="var(--pcv-sur-accent)" fill="none" stroke="var(--pcv-sur-accent)" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"' });
  const CADENAS = `<svg class="cadenas" viewBox="0 0 24 24" fill="none" stroke="var(--pcv-sur-accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2.6"/><path d="M8 11V7.6a4 4 0 0 1 8 0V11"/></svg>`;
  const SUR_PAGE = () => !/^\/routes\/library\/home/.test(O.location.pathname);
  const APPLIS = {
    boutique: { nom: T("spaces.boutique.nom"), fond: "#ffb257, #ff7a1f", ic: "boutique", ouvrir: () => O.__pcvAller?.(3), pret: SUR_PAGE },
    bibliotheque: { nom: T("spaces.bibliotheque.nom"), fond: "#b9a4ff, #6d4fd6", ic: "bibliotheque", ouvrir: () => O.__pcvAller?.(2), pret: SUR_PAGE },
    parametres: { nom: T("spaces.parametres.nom"), fond: "#9aa6b8, #5b6676", ic: "parametres", ouvrir: () => O.__pcvAller?.(7), pret: SUR_PAGE },
    album: { nom: T("spaces.medias.nom"), fond: "#5fb2ff, #2a6fe0", ic: "album", ouvrir: () => O.__pcvAller?.(5), pret: SUR_PAGE },
    perso: {
      nom: T("console.personnaliser"),
      fond: "#ff8db5, #e8457c",
      ic: "perso",
      ouvrir: (i) => window.__pcvPerso?.personnaliser?.(i)
    },
    // le casino définitif n'est pas encore choisi : perso.js garde le seul point d'accroche (__pcvPerso.casino).
    // Verrou Nintendo : sans prive/luigi/ ET prive/casino-luigi/, cadenas « Bientôt » — on n'ouvre ni le casino ni
    // son repli (l'arcade, mêmes fichiers Nintendo) depuis cette tuile.
    casino: {
      nom: T("console.casino_luigi"),
      fond: "#e5484d, #9e1b25",
      ic: "casino",
      verrouille: () => !window.__pcvNintendo?.casino,
      ouvrir: () => {
        if (!window.__pcvNintendo?.casino) return void window.__pcvSon?.("rate");
        window.__pcvPerso?.casino?.();
      },
      pret: () => !!document.querySelector("#pcv-badges.on canvas")
    },
    // le Mii Maker (mii-maker.js, chargé avant ce fichier) : seulement s'il est là — pas de tuile qui n'ouvre rien.
    // Verrou Nintendo : sans prive/mii/ (moteur FFL), cadenas « Bientôt » (mii-maker.js sait déjà refuser proprement
    // si on l'ouvre malgré tout — montrerAbsent() — mais la tuile évite l'essai pour rien).
    ...window.__pcvMiiMaker ? { miimaker: {
      nom: T("steamu.appli.mii"),
      fond: "#8ee05a, #2ea84a",
      ic: "miimaker",
      verrouille: () => !window.__pcvNintendo?.mii,
      ouvrir: () => {
        if (!window.__pcvNintendo?.mii) return void window.__pcvSon?.("rate");
        window.__pcvMiiMaker?.ouvrir();
      },
      pret: () => !!document.querySelector("#pcv-miimaker .etagere, #pcv-miimaker .absent")
    } } : {}
  };
  const BADGES_APPLIS = {
    mset: "parametres",
    edit: "miimaker",
    meet: "place",
    tiger: "boutique",
    pnote: "album",
    plog: "profil",
    dlplay: "telechargements",
    diplay: "telechargements",
    setting: "parametres",
    miimaker: "miimaker"
  };
  const AILLEURS = { place: () => window.__pcvPlaceMontrer?.(true), profil: () => window.__pcvProfilMontrer?.(true), telechargements: () => O.__pcvAller?.("telechargements") };
  const appliDuBadge = (bd) => {
    const m = /(?:\d\d)?sc_([a-z]+)/i.exec(String(bd ?? ""));
    return m && BADGES_APPLIS[m[1].toLowerCase()] || null;
  };
  const ouvrirBadge = (k, i) => {
    if (APPLIS[k]) return lancerAppli(APPLIS[k], i);
    if (!AILLEURS[k]) return window.__pcvSon?.("bord");
    grille.children[i]?.classList.add("pulse");
    window.__pcvSon?.("choisir");
    setTimeout(() => {
      grille.children[i]?.classList.remove("pulse");
      AILLEURS[k]();
    }, 380);
  };
  window.__pcvBadgesApplis = { appliDuBadge };
  window.__pcvFondsApplis = Object.fromEntries(Object.entries(APPLIS).map(([k, v]) => [k, v.fond]));
  const appliDe = (c) => c?.appli && APPLIS[c.appli] || null;
  const peindreAppli = (el, c) => {
    const x = appliDe(c);
    el.style.setProperty("--fond", `linear-gradient(160deg, ${x.fond})`);
    el.dataset.appli = c.appli;
    const verrou = !!x.verrouille?.();
    el.parentElement?.classList.toggle("pcv-verrou", verrou);
    el.innerHTML = icone(x) + (verrou ? CADENAS : "");
  };
  const libre = (c) => !!c?.vide && c.bd == null;
  const reserver = (l, r = ZOOMS[zi].r) => {
    const grands = /* @__PURE__ */ new Set(), ancreDe = /* @__PURE__ */ new Map();
    l.forEach((c, i) => {
      const [w, hh] = c.bt || [1, 1];
      if (c.bd == null || w < 2 && hh < 2 || i % r + hh > r) return;
      const sous = [];
      for (let dc = 0; dc < w; dc++) for (let dr = 0; dr < hh; dr++) if (dc || dr) sous.push(i + dc * r + dr);
      if (sous.every((k) => libre(l[k]) && !ancreDe.has(k))) {
        grands.add(i);
        sous.forEach((k) => ancreDe.set(k, i));
      }
    });
    return { grands, ancreDe };
  };
  const libres = (l, ancreDe = reserver(l).ancreDe) => l.filter((c, i) => libre(c) && !ancreDe.has(i)).length;
  let reserve = { grands: /* @__PURE__ */ new Set(), ancreDe: /* @__PURE__ */ new Map() };
  const nouvelId = () => "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const contenu = (d) => d.l.filter((x) => x.app || x.appli || x.bd != null);
  const dossierOuvert = () => vue && principal.find((c) => c.dossier && c.id === vue) || null;
  const rangeable = (c) => !!c && (!!c.app || !!c.appli || c.bd != null);
  const copie = (c) => c.app ? { app: c.app } : c.appli ? { appli: c.appli } : { vide: 1, bd: c.bd, ...c.bt ? { bt: c.bt } : {} };
  const ecDe = (d) => d?.dossier && d.ec?.bd != null ? d.ec : null;
  const coller = (d, x) => {
    const vieux = ecDe(d);
    d.ec = copie(x);
    return vieux;
  };
  const dossierSur = (c, garder) => ({
    dossier: 1,
    id: typeof c.id === "string" && c.id ? c.id : nouvelId(),
    nom: (typeof c.nom === "string" && c.nom.trim() ? c.nom.trim() : "Dossier").slice(0, DOSSIERS.nom),
    ...c.ec && c.ec.bd != null ? { ec: copie({ bd: c.ec.bd, bt: Array.isArray(c.ec.bt) ? c.ec.bt : void 0 }) } : {},
    l: (Array.isArray(c.l) ? c.l : []).filter((x) => x && (x.vide || x.app || x.appli)).map((x) => x.app || x.appli || x.cache && x.bd == null ? garder(x) : x)
  });
  const caser = (l, x, depuis = 0) => {
    const r = ZOOMS[zi].r, { ancreDe } = reserver(l, r);
    const [w, hh] = x.bt && x.bt[1] <= r ? x.bt : [1, 1];
    const tient = (k2) => {
      if (k2 % r + hh > r) return false;
      for (let dc = 0; dc < w; dc++) for (let dr = 0; dr < hh; dr++) {
        const j = k2 + dc * r + dr;
        if (j < l.length && (!libre(l[j]) || ancreDe.has(j))) return false;
      }
      return true;
    };
    let k = Math.max(0, depuis);
    while (!tient(k)) k++;
    while (l.length < k + (w - 1) * r + hh) l.push({ vide: 1 });
    l[k] = x;
    return k;
  };
  const completer = (l, min) => {
    let fin = l.length;
    while (fin && libre(l[fin - 1])) fin--;
    const n = Math.max(min, Math.ceil(fin / (1 - GRILLE.libreFin)));
    while (l.length < n || libres(l) < 8) l.push({ vide: 1 });
    return l;
  };
  const minVue = () => {
    const z = ZOOMS[zi];
    return vue ? Math.max(GRILLE.dossier, z.r * visibles(z)) : GRILLE.accueil;
  };
  const montrerVue = () => {
    const d = dossierOuvert();
    if (!d) vue = null;
    cases = completer(d ? d.l : principal, minVue());
    racine.classList.toggle("dans-dossier", !!d);
    entete();
    tete = -1;
    marquerTete();
  };
  let sigGrille = null;
  const signatureGrille = () => {
    try {
      const l = O.appStore?.allApps || [];
      return [localStorage.getItem("pcv-grille"), localStorage.getItem("pcv-accueil-retires"), reglageJeux(), familleTheme(), zi, l.length, l.reduce((n, a) => n + (a.installed ? 1 : 0) + (a.rt_last_time_played || 0) % 997, 0)].join("|");
    } catch (e) {
      return String(Math.random());
    }
  };
  const applisDevant = (l) => {
    const places = [], applis = [], jeux = [];
    l.forEach((c, i) => {
      if (c.bd == null && (c.appli || c.app)) {
        places.push(i);
        (c.appli ? applis : jeux).push(c);
      }
    });
    const ordre = [...applis, ...jeux];
    places.forEach((i, n) => {
      l[i] = ordre[n];
    });
    return l;
  };
  const construireCases = () => {
    const connus = apps(), tous = montres(), mode2 = reglageJeux();
    vueJeux = mode2;
    const recent = (a) => a.rt_last_time_played || a.rt_last_time_played_or_installed || 0;
    const recents2 = [...tous.values()].filter((a) => mode2 === "installes" || a.rt_last_time_played).sort((a, b) => recent(b) - recent(a)).slice(0, mode2 === "installes" ? Infinity : 36);
    const range = lire("pcv-grille", null);
    const vus = /* @__PURE__ */ new Set(), garder = (c) => {
      const id = c.app || c.cache, k = id ? "j" + id : "a" + c.appli;
      if (id ? tous.has(id) : APPLIS[c.appli]) return vus.has(k) ? { vide: 1 } : (vus.add(k), id ? { app: id } : { appli: c.appli });
      return id && connus.has(id) ? { vide: 1, cache: id } : { vide: 1 };
    };
    let l = (range || []).filter((c) => c && (c.vide || c.biblio || c.app || c.appli || c.dossier)).map((c) => c.biblio ? { appli: "bibliotheque" } : c.cache && c.bd != null ? (({ cache, ...x }) => x)(c) : c).map((c) => c.dossier ? dossierSur(c, garder) : c.app || c.appli || c.cache && c.bd == null ? garder(c) : c);
    const deja = new Set(l.flatMap((c) => c.dossier ? c.l : [c]).filter((c) => c.app).map((c) => c.app));
    const nouveaux = recents2.filter((a) => !deja.has(a.appid)).map((a) => ({ app: a.appid }));
    if (!range) l = nouveaux;
    else {
      const tient = (c) => c.bd != null;
      let debutJeux = 0;
      while (debutJeux < l.length && l[debutJeux].appli) debutJeux++;
      l = [...l.slice(0, debutJeux), ...nouveaux, ...l.slice(debutJeux)];
      const sortis = [];
      nouveaux.forEach(() => {
        const s = l.findIndex(tient);
        if (s < 0) return;
        const f = l.findIndex((c, i) => i < s && libre(c));
        if (f >= 0) return l.splice(f, 1);
        sortis.unshift(...l.splice(s - 1, 1));
      });
      if (sortis.length) {
        const d = l.findLastIndex(tient), sous = /* @__PURE__ */ new Set();
        ZOOMS.forEach((z) => reserver(l, z.r).ancreDe.forEach((_, k) => sous.add(k)));
        sortis.forEach((t) => {
          const g = l.findIndex((c, i) => i > d && libre(c) && !sous.has(i));
          if (g >= 0) l[g] = t;
          else l.push(t);
        });
      }
    }
    const placees = new Set(l.flatMap((c) => c.dossier ? c.l : [c]).filter((c) => c.appli).map((c) => c.appli));
    let apres = l.findLastIndex((c) => c.app || c.cache) + 1;
    for (const k of Object.keys(APPLIS)) if (!placees.has(k)) {
      const { ancreDe: sous } = reserver(l);
      while (apres < l.length && !(libre(l[apres]) && !sous.has(apres) && !l[apres].cache)) apres++;
      while (l.length <= apres) l.push({ vide: 1 });
      l[apres++] = { appli: k };
    }
    if (!range) applisDevant(l);
    l.forEach((c) => {
      if (c.dossier) [c.l, c.masques] = compacter(c.l);
    });
    [l, masques] = compacter(l);
    principal = completer(l, GRILLE.accueil);
    montrerVue();
    sauver();
    const vide = mode2 === "installes" && !principal.some((c) => c.app || c.dossier && c.l.some((x) => x.app));
    $(".rien").classList.toggle("on", vide);
    if (vide) {
      let neuf = false;
      try {
        neuf = (O.collectionStore?.allGamesCollection?.allApps?.length ?? 1) === 0;
      } catch (e) {
      }
      const r = $(".rien");
      r.dataset.vers = neuf ? "boutique" : "bibliotheque";
      r.onclick = () => APPLIS[r.dataset.vers]?.ouvrir?.();
      r.innerHTML = `<i>${icone(neuf ? APPLIS.boutique : APPLIS.bibliotheque)}</i><span>${neuf ? T("console.aucun_jeu_compte", "Pas encore de jeu : trouvez-en dans la Boutique") : T("console.aucun_jeu_installe")}</span>`;
    }
  };
  let vueJeux = null;
  const debut = () => {
    if (vue) return;
    const r = ZOOMS[zi].r, f = cases.findIndex((c, i) => !libre(c) || reserve.ancreDe.has(i));
    if (f < r) return;
    if (sel < f) sel = f;
    decal = Math.floor(f / r);
  };
  let deco = false;
  const sansFin = (l) => {
    let n = l.length;
    while (n && libre(l[n - 1])) n--;
    return l.slice(0, n);
  };
  let masques = [];
  const compacter = (l) => {
    const m = [], v = [];
    l.forEach((c, i) => c.cache && c.bd == null ? m.push({ i, c }) : v.push(c));
    return [v, m];
  };
  const deplier = (v, m = []) => {
    const l = v.slice();
    for (const { i, c } of m) l.splice(Math.min(i, l.length), 0, c);
    return l;
  };
  const sauver = () => {
    fusionner();
    const { ancreDe } = reserver(cases), min = minVue();
    let n = libres(cases, ancreDe);
    while (porte < 0 && !deco && cases.length > min && n > 8 && libre(cases[cases.length - 1]) && !ancreDe.has(cases.length - 1)) {
      cases.pop();
      n--;
    }
    ecrire("pcv-grille", deplier(principal.map((c) => {
      if (!c.dossier) return c;
      const { masques: m, ...d } = c;
      return { ...d, l: deplier(sansFin(c.l), m) };
    }), masques));
  };
  const remettre = (l) => {
    const d = dossierOuvert();
    if (d) d.l = l;
    else principal = l;
    cases = l;
  };
  const appDe = (c) => c.app && apps().get(c.app);
  const badgeURL = (id) => window.__pcvBadgeURL?.(id) || "";
  const perso = (f, a) => {
    try {
      return O.appStore[f](a) || [];
    } catch (e) {
      return [];
    }
  };
  const urlCss = (x) => `url('${String(x).replace(/['\\\n\r]/g, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))}')`;
  const sansArt = (a) => !perso("GetCustomVerticalCapsuleURLs", a).length && !perso("GetCustomLandcapeImageURLs", a).length && !perso("GetCustomLogoImageURLs", a).length && !perso("GetCustomHeroImageURLs", a).length;
  const ARTAUTO = lire("pcv-art-auto-essaye", {});
  const essayerArtAuto = (a) => {
    const id = a.appid;
    if (!lire("pcv-art-auto", true) || ARTAUTO[id] || !sansArt(a)) return;
    ARTAUTO[id] = 1;
    ecrire("pcv-art-auto-essaye", ARTAUTO);
    O.DeckyBackend?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "art_auto_chercher", a.display_name || "").then(async (r) => {
      if (tuilesFinies || !r?.trouve || !sansArt(a)) return;
      const SC2 = O.SteamClient?.Apps ? O.SteamClient : window.SteamClient;
      if (!SC2?.Apps?.SetCustomArtworkForApp) return;
      for (const { base64, ext, assetType } of Object.values(r.images || {})) {
        try {
          await SC2.Apps.SetCustomArtworkForApp(id, base64, ext, assetType);
        } catch (e) {
        }
      }
      grille.querySelectorAll(`.cel.jeu .im[data-appid="${id}"]`).forEach((el) => peindreJeu(el, a));
    }).catch(() => {
    });
  };
  const imagesJeu = (a) => {
    let vert = "", icone2 = "";
    try {
      vert = O.appStore.GetVerticalCapsuleURLForApp(a) || "";
    } catch (e) {
    }
    const nonSteam = raccourci(a);
    if (nonSteam) try {
      icone2 = O.appStore.GetIconURLForApp(a) || "";
    } catch (e) {
    }
    return [
      ...perso("GetCustomVerticalCapsuleURLs", a),
      ...nonSteam ? [...perso("GetCustomLandcapeImageURLs", a), icone2] : [IMG(a.appid, "library_600x900.jpg"), vert, CDN(a.appid, "library_600x900.jpg")]
    ].filter(Boolean);
  };
  const imageJeu = (a, el) => (el ? couche(el, a, imagesJeu(a)) : imagesJeu(a).map(urlCss)).join(",");
  const TUILES_DEFAUT = {
    1304930: "logo",
    1326470: "logo",
    2827200: "logo",
    238320: "logo",
    246620: "logo",
    21e3: "logo",
    // Outlast Trials, Sons Of The Forest, MIMESIS, Outlast, Plague Inc, LEGO Batman
    307690: "cadrage",
    12210: "cadrage",
    // Sleeping Dogs, GTA IV
    477160: "carre",
    4e3: "carre",
    730: "carre",
    3241660: "carre"
  };
  const FACONS = ["auto", "logo", "cadrage", "carre", "jaquette"];
  const NOMS_FACONS = { auto: T("console.automatique"), logo: T("console.decor_logo"), cadrage: T("console.jaquette_cadree"), carre: T("console.vignette_carree"), jaquette: T("console.jaquette_entiere") };
  const choixTuiles = () => lire("pcv-tuile-image-jeu", {});
  const reglageImage = () => {
    const v = lire("pcv-tuiles-images", "auto");
    return FACONS.includes(v) ? v : "auto";
  };
  const faconVoulue = (a) => {
    const c = choixTuiles()[a.appid];
    return FACONS.includes(c) && c !== "auto" ? c : TUILES_DEFAUT[a.appid] || reglageImage();
  };
  const CADRES = lire("pcv-cadrage", {}), enCadrage = /* @__PURE__ */ new Set();
  const cadrer = (id, el, urls = [IMG(id, "library_600x900.jpg"), CDN(id, "library_600x900.jpg")]) => {
    if (!origine && !el.__pcvProche || enCadrage.has(id)) return;
    enCadrage.add(id);
    charge(urls, tailleTuile(el)).then((im) => {
      if (tuilesFinies || !im) return;
      try {
        const W = 30, H = 45, cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        const x = cv.getContext("2d", { willReadFrequently: true });
        x.drawImage(im, 0, 0, W, H);
        const d = x.getImageData(0, 0, W, H).data, L = (i, j) => {
          const q = (j * W + i) * 4;
          return 0.3 * d[q] + 0.59 * d[q + 1] + 0.11 * d[q + 2];
        };
        const e = [];
        for (let j = 0; j < H; j++) {
          let t = 0;
          for (let i = 0; i < W - 1; i++) {
            t += Math.abs(L(i + 1, j) - L(i, j));
            if (j < H - 1) t += Math.abs(L(i, j + 1) - L(i, j));
          }
          e.push(t);
        }
        let best = 0, bo = 0;
        for (let o = 0; o <= H - W; o++) {
          let t = 0;
          for (let j = o; j < o + W; j++) t += e[j];
          t *= 1 - 0.15 * o / (H - W);
          if (t > best) {
            best = t;
            bo = o;
          }
        }
        CADRES[id] = Math.round(bo / (H - W) * 100);
        ecrire("pcv-cadrage", CADRES);
        if (el.isConnected && el.dataset.facon === "cadrage") el.style.backgroundPosition = `center ${CADRES[id]}%`;
      } catch (err) {
      }
    });
  };
  const AUTO = lire("pcv-tuile-auto", {}), enVerif = /* @__PURE__ */ new Map();
  const charge = async (l, S = TUILE.pas) => {
    for (const url of l.filter(Boolean)) {
      const u = await copieDe(absolu(url), S);
      if (!u) continue;
      const lectures = MEMOIRE.lectures;
      lectures.set(u, (lectures.get(u) || 0) + 1);
      const im = new Image();
      im.src = u;
      try {
        await im.decode();
        if (im.naturalWidth > 8) {
          im.__pcvOrigine = absolu(url);
          return im;
        }
      } catch (e) {
      } finally {
        const n = lectures.get(u) - 1;
        if (n) lectures.set(u, n);
        else lectures.delete(u);
      }
    }
    return null;
  };
  const lireLogo = (im) => {
    try {
      const N = 48, cv = document.createElement("canvas");
      cv.width = cv.height = N;
      const x = cv.getContext("2d", { willReadFrequently: true });
      x.drawImage(im, 0, 0, N, N);
      const d = x.getImageData(0, 0, N, N).data;
      let s = 0, n = 0, x0 = N, x1 = -1, y0 = N, y1 = -1;
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3] / 255;
        s += a * (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255;
        n += a;
        if (a > 0.2) {
          const px = i / 4 % N, py = i / 4 / N | 0;
          x0 = Math.min(x0, px);
          x1 = Math.max(x1, px);
          y0 = Math.min(y0, py);
          y1 = Math.max(y1, py);
        }
      }
      const b = x1 > x0 && y1 > y0 ? [x0 / N, (x1 + 1) / N, y0 / N, (y1 + 1) / N].map((v) => +v.toFixed(3)) : [0, 1, 0, 1];
      return { l: n > 4 ? +(s / n).toFixed(2) : null, b };
    } catch (e) {
      return { l: null, b: [0, 1, 0, 1] };
    }
  };
  const imagesDetails = async (idJeu) => {
    let minuteur;
    const id = BANC_SOURCE.get(idJeu) ?? idJeu;
    try {
      await Promise.race([new Promise((ok) => {
        minuteur = setTimeout(() => ok(null), TUILE.detailsDelai);
      }), Promise.resolve().then(() => O.appDetailsStore?.RequestAppDetails(id)).catch(() => null)]);
    } finally {
      clearTimeout(minuteur);
    }
    const D = O.appDetailsStore, abs = (l) => (l || []).map(absolu);
    try {
      return [abs(D.GetLogoImagesForAppId(id)?.rgLogoImages), abs(D.GetHeroImagesForAppId(id)?.rgHeroImages)];
    } catch (e) {
      return [[], []];
    }
  };
  const verifier = (a, el) => {
    if (el && !origine && !el.__pcvProche) return;
    const id = a.appid;
    if (AUTO[id] && "b" in AUTO[id] || AUTO[id] && !AUTO[id].r && "l" in AUTO[id] && AUTO[id].d || enVerif.has(id)) return;
    const S = el ? tailleTuile(el) : TUILE.pas;
    enVerif.set(id, enFile(() => imagesDetails(id)).then((d) => d || [[], []]).then(([dl, dh]) => Promise.all([
      charge([...perso("GetCustomLogoImageURLs", a), IMG(id, "logo.png"), CDN(id, "logo.png"), ...dl], S),
      charge([...perso("GetCustomHeroImageURLs", a), IMG(id, "library_hero.jpg"), CDN(id, "library_hero.jpg"), ...dh], S)
    ])).then(([logo, fond]) => {
      if (tuilesFinies) return;
      AUTO[id] = { a: !!(logo && fond), r: logo ? +(logo.naturalWidth / logo.naturalHeight).toFixed(2) : 0, ...logo ? lireLogo(logo) : { l: null }, lu: logo?.__pcvOrigine, fu: fond?.__pcvOrigine, d: 1 };
      ecrire("pcv-tuile-auto", AUTO);
      grille.querySelectorAll(`.cel.jeu .im[data-appid="${id}"]`).forEach((el2) => peindreJeu(el2, a));
    }).catch(() => {
    }).finally(() => enVerif.delete(id)));
  };
  const placeLogo = (id) => {
    const v = AUTO[id], r = v?.r;
    if (!r) return ["80% auto", "center"];
    const [x0, x1, y0, y1] = v.b || [0, 1, 0, 1], cw = x1 - x0, ch = y1 - y0;
    const L = r * cw / ch >= 0.8 / 0.56 ? 0.8 / cw : 0.56 / ch * r, H = L / r;
    const pos2 = (c, t) => Math.abs(1 - t) < 0.01 ? 50 : +((0.5 - c * t) / (1 - t) * 100).toFixed(1);
    return [`${+(L * 100).toFixed(1)}% auto`, `${pos2((x0 + x1) / 2, L)}% ${pos2((y0 + y1) / 2, H)}%`];
  };
  const TUILE = {
    marge: 1.25,
    // la copie fait 1,25 fois la taille où la tuile est vue à son plus grand (choisie, portée)
    agrandie: 1.15,
    // la plus grande échelle qu'une tuile prend à l'écran (portée au-dessus d'un dossier)
    long: 2.5,
    // et son grand côté au moins 2,5 fois la tuile (un logo peut déborder de sa boîte)
    gain: 0.8,
    // en deçà de 20 % de pixels en moins, l'image d'origine est gardée
    pas: 64,
    // tailles arrondies par paliers (le même jeu de copies sert tant que le zoom ne change pas beaucoup)
    qualite: 0.92,
    // WebP pour les photos ; une image PNG reste en PNG (transparence et motifs fins d'un logo intacts)
    delai: 15e3,
    // une source muette ne retient pas indéfiniment une place de la file
    detailsDelai: 4e3,
    paralleles: 2,
    purgeDelai: 1e3,
    chauffeDelai: 250,
    reposDelai: 50,
    reposMax: 1e3,
    tailleDelai: 300,
    // millisecondes
    memoire: 32 * 1024 * 1024,
    // budget des blobs compressés ; ne pas révoquer une image encore utilisée
    adresseCache: "https://pcv.tuiles/",
    // clé synthétique de Cache Storage, jamais une requête réseau
    cache: "pcv-tuiles-v9",
    anciens: ["pcv-tuiles-v8", "pcv-tuiles-v7", "pcv-tuiles-v6", "pcv-tuiles-legeres-v5", "pcv-tuiles-legeres-v4", "pcv-tuiles-legeres-v3"]
  };
  window.__pcvTuilesLegeres?.arreter?.();
  delete window.__pcvTuilesLegeres;
  for (const n of ["__pcvReduits2", "__pcvDecorsReduits", "__pcvCopiesTuiles"]) {
    window[n]?.forEach?.((u) => {
      if (typeof u === "string" && u.startsWith("blob:")) URL.revokeObjectURL(u);
    });
    delete window[n];
  }
  TUILE.anciens.forEach((n) => {
    caches.delete(n).catch(() => {
    });
    const ancien = window["__pcvTuiles-" + n];
    if (!ancien) return;
    for (const m of [ancien.copies, ancien.videos]) m?.forEach((v) => Promise.resolve(v).then((u) => {
      if (typeof u === "string" && u.startsWith("blob:")) URL.revokeObjectURL(u);
    }).catch(() => {
    }));
    delete window["__pcvTuiles-" + n];
  });
  const MEMOIRE = window["__pcvTuiles-" + TUILE.cache] ||= {};
  for (const [n, f] of Object.entries({ copies: Map, dernieres: Map, decodees: Map, animees: Set, origines: Map, videos: Map, blobs: Map, lectures: Map })) MEMOIRE[n] ||= new f();
  const COPIES = MEMOIRE.copies;
  const LARGEUR_TOUR = { n: 0 };
  const tailleTuile = (el) => !el.__pcvProche || racine.hidden || document.hidden ? TUILE.pas : Math.max(TUILE.pas, Math.ceil(((el.__pcvLargeurTour === LARGEUR_TOUR.n ? el.__pcvLargeur : el.offsetWidth) || 160) * (devicePixelRatio || 1) * TUILE.agrandie * TUILE.marge / TUILE.pas) * TUILE.pas);
  let enCopie = 0, tuilesFinies = false;
  const aCopier = [], lecturesImages = /* @__PURE__ */ new Set(), annulationsVideos = /* @__PURE__ */ new Set();
  const copieSuivante = () => {
    while (!tuilesFinies && enCopie < TUILE.paralleles && aCopier.length) {
      enCopie++;
      aCopier.shift().lancer();
    }
  };
  const enFile = (f) => new Promise((ok) => {
    if (tuilesFinies) return ok(null);
    aCopier.push({ annuler: () => ok(null), lancer: () => Promise.resolve().then(() => tuilesFinies ? null : f()).catch(() => null).then(ok).finally(() => {
      enCopie--;
      copieSuivante();
    }) });
    copieSuivante();
  });
  let magasin;
  const ouvrirMagasin = async () => {
    if (magasin === void 0) {
      try {
        magasin = await caches.open(TUILE.cache);
      } catch (e) {
        magasin = null;
      }
    }
    return magasin;
  };
  const BLOBS = MEMOIRE.blobs;
  let purgeMemoire = 0;
  const toucherBlob = (u) => {
    const b = BLOBS.get(u);
    if (b) b.date = performance.now();
  };
  const oublierBlob = (u) => {
    if (typeof u === "string" && u.startsWith("blob:")) URL.revokeObjectURL(u);
    BLOBS.delete(u);
  };
  const purgerMemoire = () => {
    purgeMemoire = 0;
    if (tuilesFinies) return;
    let octets = 0;
    BLOBS.forEach((b) => {
      octets += b.taille;
    });
    if (octets <= TUILE.memoire) return;
    const utilisees = new Set(MEMOIRE.lectures.keys());
    grille.querySelectorAll(".cel.jeu > .im, .pcv-anim-dessus, video.pcv-anim").forEach((el) => {
      for (const u2 of (el.style.backgroundImage || "").match(/blob:[^'\")\s,]+/g) || []) utilisees.add(u2);
      const u = el.getAttribute("src");
      if (u) utilisees.add(u);
    });
    const retirees = /* @__PURE__ */ new Set();
    for (const [u, b] of [...BLOBS].sort((a, b2) => a[1].date - b2[1].date)) {
      if (octets <= TUILE.memoire) break;
      if (utilisees.has(u) || typeof MEMOIRE.decodees.get(u)?.then === "function") continue;
      oublierBlob(u);
      retirees.add(u);
      octets -= b.taille;
      MEMOIRE.decodees.delete(u);
      MEMOIRE.origines.delete(u);
    }
    for (const m of [COPIES, MEMOIRE.videos, MEMOIRE.dernieres]) m.forEach((v, k) => {
      if (retirees.has(v)) m.delete(k);
    });
  };
  const programmerPurge = () => {
    if (!tuilesFinies && !purgeMemoire) purgeMemoire = setTimeout(purgerMemoire, TUILE.purgeDelai);
  };
  const garderBlob = (b) => {
    if (tuilesFinies) return null;
    const u = URL.createObjectURL(b);
    BLOBS.set(u, { taille: b.size, date: performance.now() });
    programmerPurge();
    return u;
  };
  const animee = async (b) => {
    const t = new Uint8Array(await b.slice(0, 65536).arrayBuffer());
    const a = (k, d = 0) => [...k].every((c, i) => t[d + i] === c.charCodeAt(0));
    const cherche = (k) => {
      for (let i = 0; i + k.length <= t.length; i++) if (a(k, i)) return true;
      return false;
    };
    return a("GIF8") || a("RIFF") && a("WEBP", 8) && cherche("ANIM") || t[1] === 80 && a("PNG", 1) && cherche("acTL");
  };
  const ANIMEES = MEMOIRE.animees, ORIGINES = MEMOIRE.origines;
  const lireImage = async (u) => {
    const controle = new AbortController(), minuterie = setTimeout(() => controle.abort(), TUILE.delai);
    if (tuilesFinies) {
      clearTimeout(minuterie);
      return null;
    }
    lecturesImages.add(controle);
    try {
      const r = await fetch(u, { credentials: "omit", signal: controle.signal });
      return r.ok ? await r.blob() : null;
    } finally {
      clearTimeout(minuterie);
      lecturesImages.delete(controle);
    }
  };
  const copier = async (u, S) => {
    const m = await ouvrirMagasin(), req = `${TUILE.adresseCache}?s=${S}&u=${encodeURIComponent(u)}`;
    const deja = m && await m.match(req).catch(() => null);
    if (deja) {
      if (deja.headers.get("X-Pcv-Anime") === "1") ANIMEES.add(u);
      const b = await deja.blob();
      return b.size ? garderBlob(b) : u;
    }
    return enFile(async () => {
      const b = await lireImage(u);
      if (!b) return null;
      const anime = await animee(b);
      if (anime) ANIMEES.add(u);
      const im = await createImageBitmap(b).catch(() => null);
      if (!im) return null;
      let sortie = new Blob([]);
      try {
        if (tuilesFinies) return null;
        const w = im.width, h2 = im.height, k = Math.min(1, Math.max(S / Math.min(w, h2), TUILE.long * S / Math.max(w, h2)));
        if (k < TUILE.gain || anime) {
          const pw = Math.max(1, Math.round(w * k)), ph = Math.max(1, Math.round(h2 * k));
          const p = await createImageBitmap(im, { resizeWidth: pw, resizeHeight: ph, resizeQuality: "high" });
          try {
            const c = new OffscreenCanvas(pw, ph);
            c.getContext("2d").drawImage(p, 0, 0);
            sortie = await c.convertToBlob(await b.slice(1, 4).text() === "PNG" ? { type: "image/png" } : { type: "image/webp", quality: TUILE.qualite });
          } finally {
            p.close();
          }
        }
      } finally {
        im.close();
      }
      if (tuilesFinies) return null;
      m?.put(req, new Response(sortie, { headers: { "X-Pcv-Anime": anime ? "1" : "0" } })).catch(() => {
      });
      return sortie.size ? garderBlob(sortie) : u;
    });
  };
  const copieDe = (u, S) => {
    if (tuilesFinies) return null;
    const k = u + "|" + S;
    let c = COPIES.get(k);
    if (c === void 0) COPIES.set(k, c = copier(u, S).catch(() => null).then((r) => {
      if (tuilesFinies) {
        oublierBlob(r);
        return null;
      }
      if (COPIES.get(k) === c) COPIES.set(k, r);
      if (r && r !== u) ORIGINES.set(r, u);
      return r;
    }));
    if (typeof c === "string") toucherBlob(c);
    return c;
  };
  const copieTuile = (u, S, el, a) => {
    const c = copieDe(u, S);
    if (c === null) return null;
    const D = MEMOIRE.decodees, pret = typeof c === "string" && D.get(c) === true;
    if (pret) {
      MEMOIRE.dernieres.set(u, c);
      return c;
    }
    Promise.resolve(c).then((r) => {
      if (!r) return;
      if (!D.has(r)) {
        const im = new Image();
        im.src = r;
        D.set(r, im.decode().catch(() => {
        }).then(() => D.set(r, true)));
      }
      return D.get(r);
    }).then(() => {
      if (!tuilesFinies && el.isConnected && el.dataset.appid === String(a.appid)) peindreJeu(el, a);
    });
    return MEMOIRE.dernieres.get(u);
  };
  let origine = false;
  const couche = (el, a, l) => {
    l = l.filter(Boolean);
    if (origine) return l.map(urlCss);
    const S = el.__pcvS = tailleTuile(el);
    for (const u of l) {
      const c = copieTuile(absolu(u), S, el, a);
      if (c === void 0) return [];
      if (c) return [urlCss(c)];
    }
    return [];
  };
  const couchesCss = (s) => {
    const r = [];
    let p = 0, c = "";
    for (const car of s || "") {
      if (car === "(") p++;
      if (car === ")") p--;
      if (car === "," && p === 0) {
        r.push(c.trim());
        c = "";
      } else c += car;
    }
    if (c.trim()) r.push(c.trim());
    return r;
  };
  const pctCss = (t) => t == null || t === "center" ? 50 : t === "left" || t === "top" ? 0 : t === "right" || t === "bottom" ? 100 : parseFloat(t) || 50;
  const tailleCss = (taille, iw, ih, w, h2) => {
    const t = (taille || "cover").trim();
    if (t === "cover" || t === "contain") {
      const s = (t === "cover" ? Math.max : Math.min)(w / iw, h2 / ih);
      return [iw * s, ih * s];
    }
    const [sw, sh] = t.split(/\s+/);
    const dw = sw?.endsWith("%") ? w * parseFloat(sw) / 100 : iw;
    const dh = !sh || sh === "auto" ? dw * ih / iw : sh.endsWith("%") ? h2 * parseFloat(sh) / 100 : ih;
    return [dw, dh];
  };
  window.__pcvCouches = { couches: couchesCss, pct: pctCss, taille: tailleCss };
  const webm = /* @__PURE__ */ (() => {
    const vint = (n) => {
      const o = new Uint8Array(8);
      o[0] = 1;
      for (let i = 7; i >= 1; i--) {
        o[i] = n % 256;
        n = Math.floor(n / 256);
      }
      return o;
    };
    const cat = (l) => {
      const o = new Uint8Array(l.reduce((s, x) => s + x.length, 0));
      let p = 0;
      for (const x of l) {
        o.set(x, p);
        p += x.length;
      }
      return o;
    };
    const idb = (id) => {
      const b = [];
      while (id > 0) {
        b.unshift(id & 255);
        id = Math.floor(id / 256);
      }
      return new Uint8Array(b);
    };
    const el = (id, ...enfants) => {
      const d = cat(enfants);
      return cat([idb(id), vint(d.length), d]);
    };
    const ui = (id, v) => {
      const b = [];
      do {
        b.unshift(v & 255);
        v = Math.floor(v / 256);
      } while (v > 0);
      return el(id, new Uint8Array(b));
    };
    const fl = (id, v) => {
      const d = new Uint8Array(8);
      new DataView(d.buffer).setFloat64(0, v);
      return el(id, d);
    };
    const st = (id, s) => el(id, new TextEncoder().encode(s));
    return (morceaux, w, h2, dureeMs) => {
      const amas = [];
      let cour = null;
      for (const m of morceaux) {
        if (!cour || m.cle || m.ms - cour.t > 3e4) {
          cour = { t: m.ms, blocs: [] };
          amas.push(cour);
        }
        const r = m.ms - cour.t, b = new Uint8Array(4 + m.data.length);
        b[0] = 129;
        b[1] = r >> 8 & 255;
        b[2] = r & 255;
        b[3] = m.cle ? 128 : 0;
        b.set(m.data, 4);
        cour.blocs.push(el(163, b));
      }
      return new Blob([
        el(440786851, ui(17030, 1), ui(17143, 1), ui(17138, 4), ui(17139, 8), st(17026, "webm"), ui(17031, 2), ui(17029, 2)),
        el(
          408125543,
          el(357149030, ui(2807729, 1e6), st(19840, "SteamU"), st(22337, "SteamU"), fl(17545, dureeMs)),
          el(374648427, el(174, ui(215, 1), ui(29637, 1), ui(131, 1), st(134, "V_VP8"), el(224, ui(176, w), ui(186, h2)))),
          ...amas.map((a) => el(524531317, ui(231, a.t), ...a.blocs))
        )
      ], { type: "video/webm" });
    };
  })();
  const VIDEO = { images: 900, debit: 7e5, cle: 90, file: 8, coteMin: 64, pas: 16, loinMs: 1e4 };
  const fabriquerVideo = async (u, T2, position) => {
    const m = await ouvrirMagasin(), req = `${TUILE.adresseCache}video?t=${T2}&p=${encodeURIComponent(position)}&u=${encodeURIComponent(u)}`;
    const deja = m && await m.match(req).catch(() => null);
    if (deja) {
      const b = await deja.blob();
      return b.size ? garderBlob(b) : null;
    }
    if (typeof ImageDecoder === "undefined" || typeof VideoEncoder === "undefined") return null;
    return enFile(async () => {
      const b = await lireImage(u);
      if (!b) return null;
      const t = String.fromCharCode(...new Uint8Array(await b.slice(0, 12).arrayBuffer()));
      const dec = new ImageDecoder({ data: b.stream(), type: t.startsWith("GIF8") ? "image/gif" : t.slice(8, 12) === "WEBP" ? "image/webp" : "image/png" });
      let enc, erreur = null, liberer = null;
      const annuler2 = () => {
        erreur = new Error("tuiles arr\xEAt\xE9es");
        liberer?.();
      };
      annulationsVideos.add(annuler2);
      try {
        await dec.tracks.ready;
        await dec.completed;
        if (tuilesFinies || erreur) return null;
        const n = Math.min(VIDEO.images, dec.tracks.selectedTrack.frameCount);
        const [px, py] = position.split(/\s+/).map(pctCss), c = new OffscreenCanvas(T2, T2), x = c.getContext("2d"), morceaux = [];
        let ts = 0;
        enc = new VideoEncoder({ output: (ch) => {
          const d = new Uint8Array(ch.byteLength);
          ch.copyTo(d);
          morceaux.push({ data: d, ms: Math.round(ch.timestamp / 1e3), cle: ch.type === "key" });
        }, error: (e) => {
          erreur = e;
          liberer?.();
        } });
        enc.configure({ codec: "vp8", width: T2, height: T2, bitrate: VIDEO.debit, framerate: 30, latencyMode: "quality" });
        for (let i = 0; i < n && !erreur; i++) {
          const { image } = await dec.decode({ frameIndex: i });
          const iw = image.displayWidth, ih = image.displayHeight, k = Math.max(T2 / iw, T2 / ih);
          const d = image.duration || 33333;
          try {
            x.fillStyle = "#000";
            x.fillRect(0, 0, T2, T2);
            x.drawImage(image, (T2 - iw * k) * px / 100, (T2 - ih * k) * py / 100, iw * k, ih * k);
          } finally {
            image.close();
          }
          const f = new VideoFrame(c, { timestamp: ts, duration: d });
          try {
            enc.encode(f, { keyFrame: i % VIDEO.cle === 0 });
          } finally {
            f.close();
          }
          ts += d;
          while (enc.encodeQueueSize > VIDEO.file && !erreur) await new Promise((r) => {
            const fini = () => {
              enc.removeEventListener("dequeue", fini);
              liberer = null;
              r();
            };
            liberer = fini;
            enc.addEventListener("dequeue", fini, { once: true });
            if (enc.encodeQueueSize <= VIDEO.file || erreur) fini();
          });
        }
        if (!erreur) await enc.flush();
        if (tuilesFinies || erreur || !morceaux.length) return null;
        const sortie = webm(morceaux, T2, T2, ts / 1e3);
        m?.put(req, new Response(sortie)).catch(() => {
        });
        return garderBlob(sortie);
      } finally {
        annulationsVideos.delete(annuler2);
        if (enc && enc.state !== "closed") enc.close();
        dec.close();
      }
    });
  };
  const VIDEOS = MEMOIRE.videos;
  const videoVisible = (el) => !racine.hidden && !document.hidden && !window.__pcvJeuDevant && !window.__pcvEconomie?.() && el.__pcvProche === true;
  const videoDe = (u, T2, position, el) => {
    const k = `${u}|${T2}|${position}`;
    let c = VIDEOS.get(k);
    if (tuilesFinies) return null;
    if (c === void 0) VIDEOS.set(k, c = fabriquerVideo(u, T2, position).catch(() => null).then((r) => {
      if (tuilesFinies) {
        oublierBlob(r);
        return null;
      }
      if (VIDEOS.get(k) === c) VIDEOS.set(k, r);
      return r;
    }));
    if (!(c instanceof Promise)) {
      toucherBlob(c);
      return c;
    }
    c.then((r) => {
      if (!tuilesFinies && r && el.isConnected && el.dataset.appid) animer(el);
    });
    return void 0;
  };
  const animer = (el) => {
    const v0 = el.querySelector(":scope > video.pcv-anim:not(.attente)"), d0 = el.querySelector(":scope > .pcv-anim-dessus");
    const sans = () => {
      el.classList.remove("pcv-anim-actif");
      el.querySelectorAll(":scope > video.pcv-anim, :scope > .pcv-anim-dessus").forEach((x) => {
        if (x.tagName === "VIDEO") {
          x.pause();
          x.removeAttribute("src");
          x.load();
        }
        x.remove();
      });
    };
    if (!el.dataset.appid || !ANIMEES.size || lire("pcv-tuiles-animees", false) !== true) return sans();
    clearTimeout(el.__pcvLoin);
    if (!videoVisible(el)) {
      const vs = el.querySelectorAll(":scope > video.pcv-anim");
      vs.forEach((x) => x.pause());
      if (vs.length) el.__pcvLoin = setTimeout(() => {
        if (!videoVisible(el)) sans();
      }, VIDEO.loinMs);
      return;
    }
    const imgs = couchesCss(el.style.backgroundImage), tailles = couchesCss(el.style.backgroundSize || IM_DEFAUT.taille), positions = couchesCss(el.style.backgroundPosition || IM_DEFAUT.position);
    const de = (l, i2) => l[i2 % l.length];
    const i = imgs.findIndex((c, k) => {
      const u2 = /^url\("?(.+?)"?\)$/.exec(c)?.[1];
      return u2 && ANIMEES.has(ORIGINES.get(u2) || u2) && de(tailles, k) === "cover";
    });
    if (i < 0) return sans();
    const u = /^url\("?(.+?)"?\)$/.exec(imgs[i])[1], T2 = Math.max(VIDEO.coteMin, Math.round(tailleTuile(el) / TUILE.marge / VIDEO.pas) * VIDEO.pas);
    const garder = v0 && +v0.dataset.t >= T2;
    const src = garder ? v0.dataset.src : videoDe(ORIGINES.get(u) || u, T2, de(positions, i), el);
    if (src === null) return v0 ? void 0 : sans();
    const poser2 = (v2) => {
      const d = d0 || Object.assign(document.createElement("div"), { className: "pcv-anim-dessus" });
      if (d.previousElementSibling !== v2) v2.after(d);
      d.style.backgroundImage = imgs.slice(0, i).join(",");
      d.style.backgroundSize = imgs.slice(0, i).map((_, k) => de(tailles, k)).join(",");
      d.style.backgroundPosition = imgs.slice(0, i).map((_, k) => de(positions, k)).join(",");
      d.style.backgroundRepeat = "no-repeat";
      el.classList.add("pcv-anim-actif");
    };
    if (v0) poser2(v0);
    if (src === void 0 || v0?.dataset.src === src || el.querySelector(`:scope > video.attente[data-src="${src}"]`)) {
      if (v0) {
        if (videoVisible(el)) v0.play().catch(() => {
        });
        else v0.pause();
      }
      return;
    }
    const v = Object.assign(document.createElement("video"), { className: "pcv-anim attente", muted: true, loop: true, playsInline: true, disablePictureInPicture: true, src });
    v.dataset.src = src;
    v.dataset.t = T2;
    const montrer = () => {
      if (!v.isConnected) return;
      el.querySelectorAll(":scope > video.pcv-anim").forEach((x) => x !== v && x.remove());
      v.classList.remove("attente");
      poser2(v);
      if (videoVisible(el)) v.play().catch(() => {
      });
    };
    v.addEventListener("loadeddata", () => {
      if (!v.isConnected) return;
      if (!(v.duration > 0 && isFinite(v.duration))) return montrer();
      v.addEventListener("seeked", montrer, { once: true });
      v.currentTime = performance.now() / 1e3 % v.duration;
    }, { once: true });
    el.prepend(v);
  };
  const PROCHE_MARGE = 0.5;
  let prochesId = 0;
  const majProches = () => {
    prochesId = 0;
    if (tuilesFinies || !racine.isConnected) return;
    const cache = racine.hidden || document.hidden, z = ZOOMS[zi], pas = (z.c + z.g) * (innerHeight / 800);
    const rr = racine.getBoundingClientRect(), rg = grille.getBoundingClientRect(), larg = rr.width || innerWidth;
    const c0 = Math.floor((rr.left - rg.left - larg * PROCHE_MARGE) / pas), c1 = Math.ceil((rr.left - rg.left + larg * (1 + PROCHE_MARGE)) / pas);
    const tour = ++LARGEUR_TOUR.n, aPeindre = [];
    for (const el of grille.querySelectorAll(".cel.jeu > .im")) {
      const a = el.__pcvJeu;
      if (!a) continue;
      const col = Math.floor(+el.parentElement.dataset.i / z.r), pres = !cache && col >= c0 && col <= c1, avant2 = el.__pcvProche === true;
      if (pres) {
        el.__pcvLargeur = el.offsetWidth;
        el.__pcvLargeurTour = tour;
      }
      aPeindre.push([el, a, pres, avant2]);
    }
    for (const [el, a, pres, avant2] of aPeindre) {
      el.__pcvProche = pres;
      if (pres) {
        if (!avant2 || !el.dataset.appid || el.__pcvS && tailleTuile(el) !== el.__pcvS) peindreJeu(el, a);
      } else if (avant2 && el.dataset.appid) peindreJeu(el, a);
    }
    LARGEUR_TOUR.n++;
    if (!cache) rechauffer();
  };
  const prochesPlus = () => {
    if (!prochesId) prochesId = requestAnimationFrame(majProches);
  };
  let rechauffe = 0;
  const rechauffer = () => {
    if (rechauffe) return;
    const suite = () => {
      rechauffe = 0;
      if (tuilesFinies || !racine.isConnected || racine.hidden || document.hidden) return;
      if (aCopier.length >= TUILE.paralleles) {
        rechauffe = setTimeout(() => {
          rechauffe = 0;
          rechauffer();
        }, TUILE.chauffeDelai);
        return;
      }
      const el = [...grille.querySelectorAll(".cel.jeu > .im:not([data-appid])")].find((e) => e.__pcvJeu);
      if (!el) return;
      peindreJeu(el, el.__pcvJeu);
      rechauffer();
    };
    rechauffe = (window.requestIdleCallback || ((f) => setTimeout(f, TUILE.reposDelai)))(suite, { timeout: TUILE.reposMax });
  };
  let retailleId = 0;
  const retailler = new ResizeObserver(() => {
    clearTimeout(retailleId);
    retailleId = setTimeout(prochesPlus, TUILE.tailleDelai);
  });
  retailler.observe(grille);
  window.__pcvTuilesProches?.disconnect?.();
  delete window.__pcvTuilesProches;
  window.__pcvTuilesTailles?.disconnect();
  window.__pcvTuilesTailles = retailler;
  document.removeEventListener("visibilitychange", window.__pcvTuilesVisibilite);
  window.__pcvTuilesVisibilite = () => {
    grille.querySelectorAll(".cel.jeu > .im").forEach((el) => {
      if (el.__pcvProche && el.__pcvJeu) peindreJeu(el, el.__pcvJeu);
    });
    prochesPlus();
  };
  document.addEventListener("visibilitychange", window.__pcvTuilesVisibilite);
  window.__pcvTuilesFin = () => {
    tuilesFinies = true;
    clearTimeout(rechauffe);
    window.cancelIdleCallback?.(rechauffe);
    rechauffe = 0;
    clearTimeout(purgeMemoire);
    purgeMemoire = 0;
    cancelAnimationFrame(prochesId);
    clearTimeout(retailleId);
    retailler.disconnect();
    document.removeEventListener("visibilitychange", window.__pcvTuilesVisibilite);
    grille.querySelectorAll("video.pcv-anim").forEach((v) => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    });
    aCopier.splice(0).forEach((t) => t.annuler());
    lecturesImages.forEach((c) => c.abort());
    annulationsVideos.forEach((f) => f());
    for (const m of [COPIES, VIDEOS]) m.forEach((v, k) => {
      if (typeof v?.then === "function") m.delete(k);
    });
  };
  const DESSOUS_MS = 1500;
  const garderDessous = (el, avant2) => {
    if (origine || el.classList.contains("pcv-anim-actif") || !avant2.image || avant2.image === "none" || avant2.image === el.style.backgroundImage || !/url\(/.test(el.style.backgroundImage)) return;
    const de = (l, i) => l[i % l.length], ai = couchesCss(avant2.image), as = couchesCss(avant2.taille || IM_DEFAUT.taille), ap = couchesCss(avant2.position || IM_DEFAUT.position);
    const anciennes = ai.map((c, k) => [c, de(as, k), de(ap, k)]).filter(([c]) => c.startsWith("url("));
    if (!anciennes.length) return;
    const n = { image: el.style.backgroundImage, taille: el.style.backgroundSize, position: el.style.backgroundPosition, repete: el.style.backgroundRepeat };
    const ni = couchesCss(n.image), ns = couchesCss(n.taille || IM_DEFAUT.taille), np = couchesCss(n.position || IM_DEFAUT.position);
    el.style.backgroundImage = [...ni, ...anciennes.map((x) => x[0])].join(",");
    el.style.backgroundSize = [...ni.map((_, k) => de(ns, k)), ...anciennes.map((x) => x[1])].join(",");
    el.style.backgroundPosition = [...ni.map((_, k) => de(np, k)), ...anciennes.map((x) => x[2])].join(",");
    el.style.backgroundRepeat = "no-repeat";
    const composee = el.style.backgroundImage;
    clearTimeout(el.__pcvDessous);
    el.__pcvDessous = setTimeout(() => {
      el.__pcvDessous = 0;
      if (el.style.backgroundImage !== composee) return;
      el.style.backgroundImage = n.image;
      el.style.backgroundSize = n.taille;
      el.style.backgroundPosition = n.position;
      el.style.backgroundRepeat = n.repete;
    }, DESSOUS_MS);
  };
  const peindreJeu = (el, a) => {
    if (tuilesFinies) return;
    const avant2 = el.__pcvDessous && el.__pcvAvant || { image: el.style.backgroundImage, taille: el.style.backgroundSize, position: el.style.backgroundPosition };
    peindreCouches(el, a);
    if (!origine) {
      animer(el);
      garderDessous(el, avant2);
      el.__pcvAvant = avant2;
      programmerPurge();
    }
  };
  const peindreCouches = (el, a) => {
    const id = a.appid;
    el.dataset.appid = id;
    el.style.backgroundSize = el.style.backgroundPosition = el.style.backgroundRepeat = "";
    let m = faconVoulue(a);
    const verts = perso("GetCustomVerticalCapsuleURLs", a);
    if (raccourci(a) && (origine || el.__pcvProche)) essayerArtAuto(a);
    if (raccourci(a) || verts.length) {
      verifier(a, el);
      if (m === "jaquette" && verts.length) {
        el.dataset.facon = m;
        el.style.backgroundImage = imageJeu(a, el);
        return;
      }
      if (AUTO[id]?.a && m !== "cadrage") m = "logo";
      else if (verts.length) {
        el.dataset.facon = "cadrage";
        el.style.backgroundImage = imageJeu(a, el);
        if (CADRES[id] != null) el.style.backgroundPosition = `center ${CADRES[id]}%`;
        else cadrer(id, el, verts);
        return;
      } else {
        el.dataset.facon = "jaquette";
        el.style.backgroundImage = imageJeu(a, el);
        el.style.backgroundPosition = "center";
        return;
      }
    } else if (m === "auto") {
      verifier(a, el);
      m = AUTO[id] ? AUTO[id].a ? "logo" : "cadrage" : "cadrage";
    } else if (m === "logo" || m === "carre") verifier(a, el);
    if (m === "logo" && AUTO[id] && !AUTO[id].a) m = "cadrage";
    if (m === "carre" && AUTO[id] && !AUTO[id].a) {
      el.dataset.facon = m;
      el.style.backgroundImage = [...couche(el, a, [CDN(id, "hero_capsule.jpg")]), imageJeu(a, el)].filter(Boolean).join(",");
      el.style.backgroundSize = "cover";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPosition = "center 30%";
      return;
    }
    el.dataset.facon = m;
    if (m === "jaquette") {
      el.style.backgroundImage = imageJeu(a, el);
      return;
    }
    if (m === "cadrage") {
      el.style.backgroundImage = imageJeu(a, el);
      if (CADRES[id] != null) el.style.backgroundPosition = `center ${CADRES[id]}%`;
      else cadrer(id, el, [IMG(id, "library_600x900.jpg"), CDN(id, "library_600x900.jpg"), ...perso("GetCachedVerticalCapsuleURL", a).map(absolu)]);
      return;
    }
    const v = AUTO[id], logos = couche(el, a, v?.lu ? [v.lu] : [...perso("GetCustomLogoImageURLs", a), IMG(id, "logo.png"), CDN(id, "logo.png")]);
    const fonds = couche(el, a, v?.fu ? [v.fu] : [...perso("GetCustomHeroImageURLs", a), IMG(id, "library_hero.jpg"), CDN(id, "library_hero.jpg"), CDN(id, "header.jpg")]);
    const carres = m === "carre" ? couche(el, a, [CDN(id, "hero_capsule.jpg")]) : [], [tl, pl] = placeLogo(id);
    const l = v?.l, halo = l == null ? [] : [`radial-gradient(ellipse 60% 42% at center, ${l < 0.45 ? "rgb(var(--pcv-halo-rgb) / .66)" : "rgba(0,0,0,.5)"}, transparent)`];
    el.style.backgroundImage = [...carres, ...logos, ...halo, ...fonds].join(",");
    el.style.backgroundSize = [...carres.map(() => "cover"), ...logos.map(() => tl), ...halo.map(() => "100% 100%"), ...fonds.map(() => "cover")].join(",");
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundPosition = [...carres.map(() => "center 30%"), ...logos.map(() => pl), ...halo.map(() => "center"), ...fonds.map(() => "center")].join(",");
  };
  window.__pcvImageJeu = (a, el) => {
    origine = true;
    try {
      peindreJeu(el, a);
    } finally {
      origine = false;
    }
    return { image: el.style.backgroundImage, taille: el.style.backgroundSize || IM_DEFAUT.taille, position: el.style.backgroundPosition || IM_DEFAUT.position, repete: el.style.backgroundRepeat || "no-repeat" };
  };
  const TRACES = { page: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/>', image: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>' };
  const changerImage = (a, i) => {
    const actuel = choixTuiles()[a.appid] || "auto";
    return window.__pcvDossiers?.choix(i, FACONS.map((f) => ({
      svg: TRACES.image,
      teinte: f === actuel ? "#5fd0ff, #1a9ae6" : "#c3ccd8, #8f9bab",
      nom: (f === actuel ? "\u2713 " : "") + NOMS_FACONS[f] + (f === "auto" && TUILES_DEFAUT[a.appid] ? ` (${T("console.valeur_defaut")})` : ""),
      faire: () => {
        const c = choixTuiles();
        if (f === "auto") delete c[a.appid];
        else c[a.appid] = f;
        ecrire("pcv-tuile-image-jeu", c);
        grille.querySelectorAll(`.cel.jeu .im[data-appid="${a.appid}"]`).forEach((el) => peindreJeu(el, a));
        window.__pcvSon?.("choisir");
      }
    })));
  };
  const menuJeu = (a, i) => window.__pcvDossiers?.choix(i, [
    { svg: TRACES.page, teinte: "#7fd17f, #3aa64a", nom: T("console.page_jeu"), faire: () => voir(a) },
    { svg: TRACES.image, teinte: "#5fd0ff, #1a9ae6", nom: T("console.image_tuile"), faire: () => changerImage(a, i) },
    {
      svg: window.__pcvIcones?.trace("epingle") || "",
      teinte: "#c9a4ff, #8a5ce6",
      nom: T("accueil.retirer"),
      faire: () => {
        accueilRetirer(a.appid, true);
        window.__pcvSon?.("retour");
        annoncer(`${a.display_name} retir\xE9 de l'accueil`);
      }
    }
  ]) || voir(a);
  let uLu = 0;
  const sonde = $(".sonde"), uPx = () => uLu || (uLu = sonde.getBoundingClientRect().width / 100) || innerHeight / 800;
  const boite = (w = 1, h2 = 1, u = uPx()) => {
    const p = (ZOOMS[zi].c + ZOOMS[zi].g) * u;
    return [w * p, h2 * p];
  };
  const PIX = window.__pcvBadgePixels ||= /* @__PURE__ */ new Map();
  const blocs = (d, w, h2, b) => {
    if (w % b || h2 % b) return false;
    for (let y = 0; y < h2; y++) for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4, q = ((y - y % b) * w + (x - x % b)) * 4;
      if (d[p + 3] !== d[q + 3] || d[p + 3] && (d[p] !== d[q] || d[p + 1] !== d[q + 1] || d[p + 2] !== d[q + 2])) return false;
    }
    return true;
  };
  const analyser = (id) => {
    const u = badgeURL(id);
    if (!u || PIX.has(id)) return;
    PIX.set(id, null);
    const im = new Image();
    im.onerror = () => PIX.delete(id);
    im.onload = () => {
      const w = im.naturalWidth, h2 = im.naturalHeight;
      let b = 1;
      try {
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h2;
        const x = cv.getContext("2d", { willReadFrequently: true });
        x.drawImage(im, 0, 0);
        const d = x.getImageData(0, 0, w, h2).data;
        b = [8, 4, 2].find((k) => blocs(d, w, h2, k)) || 1;
      } catch (e) {
      }
      PIX.set(id, { b, w, h: h2 });
      grille.querySelectorAll(".bdg[data-bd], .ec[data-bd]").forEach((e) => e.dataset.bd === id && habiller(e, id));
    };
    im.src = u;
  };
  const habiller = (el, id) => {
    const p = PIX.get(id);
    if (p === void 0) analyser(id);
    el.style.backgroundSize = "contain";
    el.style.imageRendering = p?.b > 1 ? "pixelated" : "";
  };
  let vueFamille = null;
  window.__pcvConsoleTaille = () => {
    uLu = 0;
  };
  addEventListener("resize", window.__pcvConsoleTaille);
  const tuileDossier = (c) => {
    const t = document.createElement("div");
    t.className = "chem";
    t.innerHTML = '<i class="arr"></i><span class="ap"></span><i class="av"></i><em></em><small></small>';
    const dans = contenu(c), ap = t.querySelector(".ap");
    dans.slice(0, 3).forEach((x, k, l) => {
      const b = document.createElement("b"), a = appDe(x);
      b.style.setProperty("--rot", (k - (l.length - 1) / 2) * 9 + "deg");
      b.style.setProperty("--dy", Math.abs(k - (l.length - 1) / 2) * 8 + "%");
      if (a) b.style.backgroundImage = imageJeu(a);
      else if (appliDe(x)) {
        b.className = "a";
        b.style.background = `linear-gradient(160deg, ${appliDe(x).fond})`;
        b.innerHTML = icone(appliDe(x));
      } else {
        b.className = "b";
        b.dataset.bd = x.bd;
        b.style.backgroundImage = `url('${badgeURL(x.bd)}')`;
      }
      ap.appendChild(b);
    });
    t.querySelector("em").textContent = c.nom;
    t.querySelector("small").textContent = dans.length || "";
    const e = ecDe(c);
    t.classList.toggle("a-ec", !!e);
    if (e) {
      const s = document.createElement("i");
      s.className = "ec";
      s.dataset.bd = e.bd;
      s.style.backgroundImage = `url('${badgeURL(e.bd)}')`;
      habiller(s, e.bd);
      t.appendChild(s);
    }
    return t;
  };
  const selection = (z, f) => {
    const t = z.c + 2 * f.d, V = z.g - 2 * f.d, gr = Math.min(0.025 * t, 0.18 * V), B = Math.max(1.2, 0.6 * V - gr);
    const sc = Math.min(10, B), sw = Math.min(5, sc * 0.45);
    return { sk: 1 + 2 * gr / t, sw, sc, si: Math.max(0, 5 - (sc - sw)), sg: Math.min(26, 2.5 * V) };
  };
  const aDuContenu = (c) => !!(appDe(c) || appliDe(c) || c.dossier || c.bd != null);
  const colonneLimite = (z) => {
    let col = -1;
    cases.forEach((c, i) => {
      if (aDuContenu(c)) col = Math.max(col, Math.floor(i / z.r));
    });
    return col + 1;
  };
  const dessiner = (poser2 = false, zoomSeul = false) => {
    const z = ZOOMS[zi], f = forme(z);
    vueFamille = familleTheme();
    for (const [k, v] of Object.entries({ r: z.r, c: z.c, g: z.g, d: f.d, pad: f.pad, im: f.im, bo: f.bo, ...selection(z, f) })) grille.style.setProperty("--" + k, +v.toFixed(3));
    racine.classList.toggle("une-rangee", zi === 0);
    if (zoomSeul && grille.children.length === cases.length) {
      const r = reserver(cases), limite2 = colonneLimite(z);
      if (r.grands.size === reserve.grands.size && [...r.grands].every((i) => reserve.grands.has(i))) {
        reserve = r;
        [...grille.children].forEach((e, i) => {
          if (e.classList.contains("vide")) {
            e.classList.toggle("couverte", r.ancreDe.has(i));
            e.classList.toggle("loin", Math.floor(i / z.r) > limite2);
          }
        });
        racine.querySelectorAll(".zoom i").forEach((e, k) => e.classList.toggle("on", k === zi));
        marquer(false);
        return;
      }
    }
    const ordre = cases.map((_, i) => i).sort(() => Math.random() - 0.5), limite = colonneLimite(z);
    reserve = reserver(cases);
    const { grands, ancreDe } = reserve;
    grille.innerHTML = "";
    cases.forEach((c, i) => {
      const d = document.createElement("div");
      const a = appDe(c);
      if (a) {
        d.className = "cel jeu";
        d.innerHTML = '<div class="im"></div>';
        d.firstChild.__pcvJeu = a;
        if (distant(a)) {
          const n = document.createElement("i");
          n.className = "nuage";
          n.innerHTML = NUAGE;
          d.firstChild.appendChild(n);
        }
      } else if (appliDe(c)) {
        d.className = "cel app";
        d.innerHTML = '<div class="im"></div>';
        peindreAppli(d.firstChild, c);
      } else if (c.dossier) {
        d.className = "cel dos";
        d.appendChild(tuileDossier(c));
      } else {
        d.className = "cel vide" + (ancreDe.has(i) ? " couverte" : "") + (Math.floor(i / z.r) > limite ? " loin" : "");
        if (c.bd != null) {
          const s = document.createElement("span"), [w, hh] = grands.has(i) ? c.bt : [1, 1];
          s.className = "bdg";
          s.dataset.bd = c.bd;
          s.style.backgroundImage = `url('${badgeURL(c.bd)}')`;
          s.dataset.w = w;
          s.dataset.h = hh;
          habiller(s, c.bd);
          if (grands.has(i)) {
            s.classList.add("grand");
            s.style.setProperty("--w", w);
            s.style.setProperty("--h", hh);
            d.classList.add("ancre");
          }
          d.appendChild(s);
        }
      }
      if (poser2) {
        d.classList.add("pose");
        d.style.animationDelay = 0.15 + ordre.indexOf(i) % 48 * 0.045 + "s";
        d.addEventListener("animationend", (e) => {
          if (e.animationName === "pcvPoseC") {
            d.classList.remove("pose");
            d.style.animationDelay = "";
          }
        }, { once: false });
      }
      d.dataset.i = i;
      grille.appendChild(d);
    });
    prochesPlus();
    racine.querySelectorAll(".zoom i").forEach((e, k) => e.classList.toggle("on", k === zi));
    if (fusionAnimer >= 0) {
      grille.children[fusionAnimer]?.querySelector(".bdg")?.animate([
        { transform: "scale(.6)", filter: "brightness(2.2) drop-shadow(0 0 12px #fff)" },
        { transform: "scale(1.12)", filter: "brightness(1.4) drop-shadow(0 0 18px #fff)", offset: 0.5 },
        { transform: "none", filter: "none" }
      ], { duration: 650, easing: "ease-out" });
      fusionAnimer = -1;
    }
    marquer(false);
  };
  const nomCase = (i) => {
    const c = cases[i], a = appDe(c), bd = c.bd ?? cases[reserve.ancreDe.get(i)]?.bd, ap = appliDe(c);
    const nom = a ? a.display_name : ap ? ap.nom : c.dossier ? c.nom : bd != null ? window.__pcvCasinoBadges?.nom?.(bd) || "" : "Case libre";
    return ap?.verrouille?.() ? `${nom} (${window.__pcvT("verrou.bientot")})` : nom;
  };
  let pos = 0, elan = null;
  let dodo = null, infosDe = -1, decal = -1;
  const visibles = (z) => Math.floor((innerWidth / (innerHeight / 800) - 128) / (z.c + z.g));
  const placer = () => {
    const z = ZOOMS[zi];
    if (elan) {
      cancelAnimationFrame(elan.id);
      elan = null;
    }
    grille.style.transform = `translateX(calc(var(--u) * ${-decal * (z.c + z.g)}))`;
    prochesPlus();
  };
  const texte = (el, t) => {
    const n = el.firstChild;
    if (n && n.nodeType === 3 && !n.nextSibling) {
      if (n.data !== t) n.data = t;
    } else el.textContent = t;
  };
  const marquer = (son = true) => {
    sel = Math.max(0, Math.min(cases.length - 1, sel));
    if (porte >= cases.length) porte = -1;
    [...grille.children].forEach((e, k) => {
      e.classList.toggle("sel", k === sel);
      e.classList.toggle("porte", k === porte);
      e.classList.toggle("cible", k === cible);
    });
    $(".entete .ret").classList.toggle("cible", cible === SORTIE);
    const z = ZOOMS[zi], col = Math.floor(sel / z.r);
    if (!appui?.long && !deco || decal < 0) decal = Math.max(0, col - visibles(z) + 2, decal < 0 ? 0 : Math.min(decal, col - 1));
    placer();
    const dedans = document.body.classList.contains("pcv-zone-jaquettes");
    texte($(".titre"), dedans ? nomCase(sel) : "");
    legende();
    $(".titre").classList.remove("dors");
    clearTimeout(dodo);
    dodo = setTimeout(() => $(".titre").classList.add("dors"), 3500);
    aide();
    bulles();
    if (son) window.__pcvSon?.("bouge");
  };
  const aide = () => {
    const e = $(".etat"), glyphe = (k) => {
      const [t, c, h2] = window.__pcvTouche?.(k) || ["?", "var(--pcv-touche-neutre)"], u = document.createElement("u");
      if (h2) u.innerHTML = h2;
      else u.textContent = t;
      u.style.background = c;
      return u;
    };
    const morceaux = sortant ? [T("console.rangement"), T("console.lache_accueil_poser")] : porte < 0 ? badgeMain != null ? [T("console.badge_en_main"), [glyphe(1), " " + T("console.coller_case_libre")], [glyphe(2), " " + T("console.lacher")]] : [] : appui?.long ? [T("console.rangement"), T("console.lache_pour_poser")] : cible >= 0 ? [T("console.rangement"), [glyphe(1), cases[porte]?.app || cases[porte]?.appli ? " " + T("console.ranger_dans", { nom: cases[cible]?.nom }) : " " + T("console.coller_sur", { nom: cases[cible]?.nom })], [glyphe(2), " " + T("console.annuler")]] : cible === SORTIE ? [T("console.rangement"), [glyphe(1), " " + T("console.ressortir_accueil")], [glyphe(2), " " + T("console.annuler")]] : [T("console.rangement"), "\u2725 " + T("console.deplacer"), [glyphe(1), " " + T("console.poser")], [glyphe(2), " " + T("console.annuler")]];
    const cle = morceaux.map((m) => [m].flat().map((x) => typeof x === "string" ? x : x.outerHTML).join("")).join("|");
    if (e.dataset.cle === cle) return;
    e.dataset.cle = cle;
    e.replaceChildren(...morceaux.map((m) => {
      const s = document.createElement("span");
      s.append(...[m].flat());
      return s;
    }));
  };
  const PICTO = {
    temps: ["#1a9ae6", '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M10 3h4"/>'],
    succes: ["#e0a100", '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7"/>'],
    semaines: ["#2fbf71", '<rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>']
  };
  const picto = (n) => `<i style="--k:${PICTO[n][0]}22"><svg viewBox="0 0 24 24" width="60%" height="60%" fill="none" stroke="${PICTO[n][0]}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${PICTO[n][1]}</svg></i>`;
  const bulle = (icone2, texte2, petit, delai) => {
    const d = document.createElement("div"), s = document.createElement("span");
    d.className = "bu";
    if (delai) d.style.animationDelay = delai + "s";
    if (typeof icone2 === "string") d.innerHTML = picto(icone2);
    else d.appendChild(icone2);
    s.textContent = texte2;
    if (petit) {
      const p = document.createElement("small");
      p.textContent = petit;
      s.appendChild(p);
    }
    d.appendChild(s);
    return d;
  };
  const bulles = async () => {
    const inf = $(".infos"), a = appDe(cases[sel]);
    const montrer = zi === 0 && a && document.body.classList.contains("pcv-zone-jaquettes");
    inf.classList.toggle("cache", !montrer);
    if (!montrer || infosDe === a.appid) return;
    infosDe = a.appid;
    let s = null;
    try {
      const r = await O.SteamClient.Apps.GetMyAchievementsForApp(String(a.appid));
      const d = (typeof r === "string" ? JSON.parse(r) : r).data.rgAchievements;
      s = { total: d.length, obtenus: d.filter((x) => x.bAchieved).sort((x, y) => y.rtUnlocked - x.rtUnlocked) };
    } catch (e) {
    }
    if (appDe(cases[sel]) !== a) return;
    const der = s?.obtenus[0], deux = a.minutes_playtime_last_two_weeks || 0, l = [a.rt_last_time_played ? bulle("temps", T("console.temps_de_jeu", { temps: h(a.minutes_playtime_forever) }), T("console.derniere_partie", { quand: ilya(a.rt_last_time_played) })) : bulle("temps", T("console.pas_encore_joue"))];
    if (der) {
      const im = document.createElement("img");
      im.alt = "";
      if (der.strImage) im.src = der.strImage;
      l.push(bulle(im, T("accueil.obtenu", { nom: joli(der.strName) }), ilya(der.rtUnlocked), 0.08));
    }
    if (s?.total) l.push(bulle("succes", T("console.succes_sur", { n: s.obtenus.length, total: s.total }), "", 0.16));
    if (deux) l.push(bulle("semaines", T("console.ces_2_semaines", { temps: h(deux) }), "", 0.24));
    inf.replaceChildren(...l);
  };
  const zoomer = (d) => {
    const n = Math.max(0, Math.min(ZOOMS.length - 1, zi + d));
    if (n === zi) return window.__pcvSon?.("bord");
    const avant2 = [...grille.children].map((e) => e.getBoundingClientRect());
    zi = n;
    ecrire("pcv-zoom", zi);
    infosDe = -1;
    decal = -1;
    window.__pcvSon?.(d > 0 ? "zoom+" : "zoom-");
    completer(cases, minVue());
    grille.style.transition = "none";
    dessiner(false, true);
    void grille.offsetWidth;
    grille.style.transition = "";
    const apres = [...grille.children].map((e) => e.getBoundingClientRect());
    [...grille.children].forEach((e, i) => {
      const a = avant2[i], b = apres[i];
      if (!a || b.right < 0 || b.left > innerWidth) return;
      if (a.right < 0 || a.left > innerWidth) {
        e.animate([{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "ease-out" });
        return;
      }
      e.style.transformOrigin = "0 0";
      const an = e.animate(
        [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width})` }, { transform: "none" }],
        { duration: 320, easing: "cubic-bezier(.3,1.15,.5,1)" }
      );
      an.onfinish = an.oncancel = () => {
        e.style.transformOrigin = "";
      };
    });
  };
  racine.querySelectorAll(".zoom b").forEach((b) => b.onclick = () => zoomer(+b.dataset.z));
  const echanger = (n) => {
    if (n === porte || cases[n]?.dossier && rangeable(cases[porte])) {
      cible = n === porte ? -1 : n;
      sel = n;
      return marquer(false);
    }
    cible = -1;
    const i = porte;
    [cases[i], cases[n]] = [cases[n], cases[i]];
    porte = sel = n;
    const r = reserver(cases), a = grille.children[i], b = grille.children[n];
    const memes = r.ancreDe.size === reserve.ancreDe.size && [...r.ancreDe].every(([k, v]) => reserve.ancreDe.get(k) === v);
    if (!a || !b || !memes || r.grands.has(i) || r.grands.has(n)) return dessiner();
    const repere = document.createComment("");
    a.replaceWith(repere);
    b.replaceWith(a);
    repere.replaceWith(b);
    a.dataset.i = n;
    b.dataset.i = i;
    a.classList.remove("pose");
    b.classList.remove("pose");
    reserve = r;
    marquer(false);
  };
  const deplacer = (dx, dy) => {
    const r = ZOOMS[zi].r, row = sel % r;
    let n = sel;
    if (cible === SORTIE) {
      if (dy > 0) {
        cible = -1;
        marquer();
      } else window.__pcvSon?.("bord");
      return;
    }
    if (dx) n = sel + dx * r;
    else {
      if (dy < 0 && row === 0) {
        if (porte >= 0 && vue && rangeable(cases[porte])) {
          cible = SORTIE;
          return marquer();
        }
        if (vue && porte < 0 && badgeMain == null && boutonsTete().length) {
          tete = 0;
          marquerTete();
          legende();
          return window.__pcvSon?.("bouge");
        }
        return monter();
      }
      if (dy > 0 && row === r - 1) return window.__pcvSon?.("bord");
      n = sel + dy;
    }
    if (n < 0 || n >= cases.length) return window.__pcvSon?.("bord");
    if (porte >= 0) return echanger(n);
    sel = n;
    marquer();
  };
  const entrer = () => {
    window.__pcvZone = "jaquettes";
    document.body.classList.add("pcv-zone-jaquettes");
  };
  const toucheTete = (b) => {
    const l = boutonsTete();
    if (b === 11 || b === 12) {
      const n = tete + (b === 12 ? 1 : -1);
      if (n < 0 || n >= l.length) return window.__pcvSon?.("bord");
      tete = n;
      marquerTete();
      legende();
      return window.__pcvSon?.("bouge");
    }
    const x = l[tete];
    tete = -1;
    marquerTete();
    if (b === 1) {
      legende();
      return x?.click();
    }
    if (b === 2) return fermerDossier();
    if (b === 10) return marquer();
    tete = l.indexOf(x);
    marquerTete();
    return window.__pcvSon?.("bord");
  };
  const monter = () => {
    if (porte >= 0) return window.__pcvSon?.("bord");
    window.__pcvZone = "barre";
    document.body.classList.remove("pcv-zone-jaquettes");
    const l = document.querySelector("#header ._17M8gvakqjyaw_cLo6ntdl, #header [class*=SearchAndTitleContainer]");
    const n = window.__pcvNoeud?.(l?.querySelector(".Focusable") || l);
    if (n) n.BTakeFocus(4);
    marquer(false);
  };
  const ouvrir = (id) => O.SteamClient.URL.ExecuteSteamURL(`steam://nav/games/details/${id}`);
  const lancerAppli = (x, i) => {
    if (!x.pret) {
      grille.children[i]?.classList.add("pulse");
      window.__pcvSon?.("choisir");
      setTimeout(() => {
        grille.children[i]?.classList.remove("pulse");
        x.ouvrir(i);
      }, 380);
      return;
    }
    lancerAvecEcran({ nom: x.nom, fond: `linear-gradient(160deg, ${x.fond})`, html: icone(x), depuis: grille.children[i], pret: x.pret, faire: () => x.ouvrir(i) });
  };
  const voir = (a) => {
    const page = O.location.pathname;
    lancerAvecEcran({ nom: a.display_name, image: imageJeu(a), depuis: grille.children[sel], pret: () => O.location.pathname !== page, faire: () => ouvrir(a.appid) });
  };
  const ici = (a) => (window.__pcvLancement?.banc?.installe || installe)(a);
  const lancer = (a) => ici(a) ? jouerJeu(a, grille.children[sel]) : voir(a);
  let avant = null;
  const prendre = (i) => {
    avant = { cases: cases.slice(), sel: i };
    porte = sel = i;
    cible = -1;
    window.__pcvSon?.("prendre");
  };
  const poser = () => {
    const p = porte, c = cible, a = avant;
    porte = -1;
    cible = -1;
    avant = null;
    if (c >= 0 || c === SORTIE) {
      const x = cases[p], d = cases[c];
      if (a) remettre(a.cases);
      const i = cases.indexOf(x);
      if (i >= 0 && (c >= 0 ? rangerDans(i, cases.indexOf(d)) : ressortir(i))) return;
    }
    window.__pcvSon?.("poser");
    const n = cases.length, f = fusionAnimer;
    sauver();
    if (cases.length !== n || fusionAnimer !== f || grille.children.length !== cases.length) dessiner();
    else {
      [...grille.children].forEach((e) => e.classList.remove("prise"));
      marquer(false);
    }
  };
  const annuler = () => {
    const rien = !avant || avant.cases.every((c, i) => c === cases[i]) && avant.cases.length === cases.length;
    if (avant) {
      remettre(avant.cases);
      sel = avant.sel;
    }
    avant = null;
    porte = -1;
    cible = -1;
    if (rien && grille.children.length === cases.length) {
      [...grille.children].forEach((e) => e.classList.remove("prise"));
      marquer(false);
    } else dessiner();
  };
  let noteT = 0;
  const annoncer = (t) => {
    const n = $(".note");
    n.textContent = t;
    n.classList.add("on");
    clearTimeout(noteT);
    noteT = setTimeout(() => n.classList.remove("on"), 2600);
  };
  const sautiller = (i) => grille.children[i]?.animate([{ transform: "scale(.82)" }, { transform: "scale(1.14)", offset: 0.55 }, { transform: "none" }], { duration: 420, easing: "ease-out" });
  const plein = (d) => {
    if (contenu(d).length < DOSSIERS.elements) return false;
    annoncer(T("console.dossier_plein", { nom: d.nom, n: DOSSIERS.elements }));
    window.__pcvSon?.("bord");
    return true;
  };
  const deposer = (j, x) => {
    const d = cases[j];
    if (!d?.dossier || !rangeable(x)) return false;
    if (!x.app && !x.appli) return { vieux: coller(d, x) };
    if (plein(d)) return false;
    caser(d.l, copie(x));
    return { vieux: null };
  };
  const dit = (x, d) => x.app || x.appli ? T("console.range_dans", { nom: d.nom }) : T("console.colle_sur", { nom: d.nom });
  const rangerDans = (i, j) => {
    const x = cases[i], r = deposer(j, x);
    if (!r) return false;
    cases[i] = r.vieux ? copie(r.vieux) : { vide: 1 };
    sel = j;
    sauver();
    dessiner();
    sautiller(j);
    window.__pcvSon?.("colle");
    annoncer(dit(x, cases[j]));
    return true;
  };
  const decollerDossier = (id) => {
    const d = principal.find((c) => c.dossier && c.id === id);
    if (!ecDe(d)) return false;
    delete d.ec;
    sauver();
    dessiner();
    entete();
    window.__pcvSon?.("retour");
    annoncer(T("console.badge_decolle"));
    return true;
  };
  const ressortir = (i) => {
    const d = dossierOuvert();
    if (!d || !rangeable(cases[i])) return false;
    caser(principal, copie(cases[i]), principal.indexOf(d) + 1);
    cases[i] = { vide: 1 };
    sauver();
    dessiner();
    window.__pcvSon?.("colle");
    annoncer(T("console.ressorti_accueil"));
    return true;
  };
  const entete = () => {
    const d = dossierOuvert();
    if (!d) return;
    $(".entete b").textContent = d.nom;
    $(".entete small").textContent = `${contenu(d).length} / ${DOSSIERS.elements}`;
    $(".entete .ren").hidden = $(".entete .sup").hidden = !window.__pcvDossiers;
    $(".entete .dec").hidden = !ecDe(d);
  };
  const signaler = () => window.dispatchEvent(new CustomEvent("pcv-dossier", { detail: { id: vue } }));
  let retour = null;
  const ouvrirDossier = (i) => {
    const d = cases[i];
    if (!d?.dossier || vue) return;
    if (porte >= 0) annuler();
    const de = grille.children[i]?.getBoundingClientRect();
    retour = { i, decal };
    vue = d.id;
    montrerVue();
    sel = 0;
    decal = -1;
    infosDe = -1;
    entrer();
    dessiner();
    window.__pcvSon?.("choisir");
    if (de) [...grille.children].forEach((e, k) => {
      const b = e.getBoundingClientRect();
      if (b.left > innerWidth || b.right < 0) return;
      e.style.transformOrigin = "0 0";
      const an = e.animate(
        [{ transform: `translate(${de.left - b.left}px, ${de.top - b.top}px) scale(${de.width / b.width * 0.4})`, opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 380, delay: Math.min(k, 24) * 14, easing: "cubic-bezier(.3,1.2,.5,1)", fill: "backwards" }
      );
      an.onfinish = an.oncancel = () => {
        e.style.transformOrigin = "";
      };
    });
    signaler();
  };
  const fermerDossier = (bruit = true) => {
    if (!vue) return;
    if (porte >= 0) annuler();
    const d = dossierOuvert();
    sauver();
    vue = null;
    montrerVue();
    const i = principal.indexOf(d);
    sel = i >= 0 ? i : retour?.i ?? 0;
    decal = retour?.decal ?? -1;
    infosDe = -1;
    dessiner();
    sautiller(sel);
    if (bruit) window.__pcvSon?.("retour");
    signaler();
  };
  $(".entete .ret").onclick = () => fermerDossier();
  $(".entete .ren").onclick = () => window.__pcvDossiers?.renommer(vue);
  $(".entete .sup").onclick = () => window.__pcvDossiers?.supprimer(vue);
  $(".entete .dec").onclick = () => decollerDossier(vue);
  const creerDossier = (i = sel) => {
    if (vue || !cases.length) {
      window.__pcvSon?.("bord");
      return null;
    }
    if (principal.filter((c) => c.dossier).length >= DOSSIERS.max) {
      annoncer(T("console.dossiers_max", { n: DOSSIERS.max }));
      window.__pcvSon?.("bord");
      return null;
    }
    const { ancreDe } = reserver(cases), ok = (k) => libre(cases[k]) && !ancreDe.has(k);
    if (!ok(i)) i = cases.findIndex((c, k) => ok(k));
    if (i < 0) {
      cases.push({ vide: 1 });
      i = cases.length - 1;
    }
    const nomDossier = T("console.dossier_nom");
    const noms = new Set(principal.filter((c) => c.dossier).map((c) => c.nom));
    let n = 1;
    while (noms.has(nomDossier + " " + n)) n++;
    const d = { dossier: 1, id: nouvelId(), nom: nomDossier + " " + n, l: [] };
    cases[i] = d;
    completer(cases, GRILLE.accueil);
    sel = i;
    entrer();
    sauver();
    dessiner();
    sautiller(i);
    window.__pcvSon?.("colle");
    annoncer(T("console.dossier_cree", { nom: d.nom }));
    return d.id;
  };
  const renommerDossier = (id, nom) => {
    const d = principal.find((c) => c.dossier && c.id === id);
    nom = String(nom ?? "").trim().slice(0, DOSSIERS.nom);
    if (!d || !nom) return false;
    d.nom = nom;
    sauver();
    dessiner();
    entete();
    return true;
  };
  const supprimerDossier = (id) => {
    const j = principal.findIndex((c) => c.dossier && c.id === id);
    if (j < 0) return -1;
    if (vue === id) {
      if (porte >= 0) annuler();
      vue = null;
      montrerVue();
      signaler();
    }
    const d = principal[j], dans = contenu(d);
    principal[j] = { vide: 1 };
    let k = j;
    [...dans, ...ecDe(d) ? [d.ec] : []].forEach((x) => {
      k = caser(principal, copie(x), k) + 1;
    });
    completer(principal, GRILLE.accueil);
    sel = j;
    decal = -1;
    sauver();
    dessiner();
    window.__pcvSon?.("retour");
    return dans.length;
  };
  const agir = (b) => {
    if (sortant) {
      finAppui();
      return oublierSortie();
    }
    if (tete >= 0) return toucheTete(b);
    const c = cases[sel];
    if (b === 1) {
      if (porte >= 0) return poser();
      if (badgeMain != null) {
        if (libre(c) && !reserve.ancreDe.has(sel)) {
          c.bd = badgeMain;
          c.bt = tailleMain;
          badgeMain = null;
          sauver();
          window.__pcvSon?.("colle");
          dessiner();
        } else window.__pcvSon?.("bord");
        return;
      }
      const a = appDe(c);
      if (a) return lancer(a);
      if (appliDe(c)) return lancerAppli(appliDe(c), sel);
      if (c.dossier) return ouvrirDossier(sel);
      const k = appliDuBadge(c.bd);
      if (k) return ouvrirBadge(k, sel);
      return window.__pcvSon?.("bord");
    }
    if (b === 2) {
      if (porte >= 0) {
        annuler();
        window.__pcvSon?.("retour");
        return;
      }
      if (badgeMain != null) {
        badgeMain = null;
        marquer(false);
        return;
      }
      if (vue) return fermerDossier();
      return monter();
    }
    if (b === 3) {
      if (porte >= 0) return poser();
      if (reserve.ancreDe.has(sel)) sel = reserve.ancreDe.get(sel);
      if (libre(cases[sel])) return caseLibre(sel);
      prendre(sel);
      dessiner();
      return;
    }
    if (b === 5) return zoomer(-1);
    if (b === 6) return zoomer(1);
    if (b === 9) return deplacer(0, -1);
    if (b === 10) return deplacer(0, 1);
    if (b === 11) return deplacer(-1, 0);
    if (b === 12) return deplacer(1, 0);
  };
  const caseLibre = (i) => window.__pcvDossiers ? window.__pcvDossiers.menu(i) : window.__pcvDeco ? window.__pcvDeco.ouvrir({ case: i }) : window.__pcvSon?.("bord");
  const celSous = (x, y) => {
    const e = document.elementFromPoint(x, y)?.closest?.("#pcv-console .cel");
    return e ? +e.dataset.i : -1;
  };
  const finAppui = () => {
    if (appui) clearTimeout(appui.t);
    clearInterval(window.__pcvDefile);
    appui = null;
  };
  let fantome = null, vise = -1;
  const viserCase = (n, classe) => {
    if (vise >= 0) grille.children[vise]?.classList.remove("vise-libre", "vise-echange");
    vise = n;
    if (n >= 0 && classe) grille.children[n]?.classList.add(classe);
  };
  const destination = (x, y) => {
    if (vue && rangeable(cases[porte]) && document.elementFromPoint(x, y)?.closest?.("#pcv-console .entete")) return { n: -1, quoi: "sortie" };
    const n = celSous(x, y);
    if (n < 0 || n === porte || reserve.ancreDe.has(n) && reserve.ancreDe.get(n) !== porte || reserve.grands.has(n) && n !== porte) return { n: -1, quoi: "retour" };
    if (cases[n]?.dossier && rangeable(cases[porte])) return { n, quoi: "dossier" };
    return { n, quoi: libre(cases[n]) ? "libre" : "echange" };
  };
  const glisserVers = () => {
    if (fantome) fantome.style.transform = `translate(${appui.x - fantome.dx}px, ${appui.y - fantome.dy}px) scale(1.12) rotate(4deg)`;
    if (sortant) return viserAccueil();
    if (vue && porte >= 0 && rangeable(cases[porte])) {
      const k = cadre();
      if (appui.x < k.l || appui.x > k.r || appui.y < k.t || appui.y > k.b) return sortir();
    }
    const d = destination(appui.x, appui.y), c = d.quoi === "sortie" ? SORTIE : d.quoi === "dossier" ? d.n : -1;
    const avant2 = vise;
    viserCase(d.quoi === "libre" ? d.n : d.quoi === "echange" ? d.n : -1, d.quoi === "libre" ? "vise-libre" : "vise-echange");
    if (c !== cible) {
      cible = c;
      marquer(false);
      window.__pcvSon?.("bouge");
    } else if (vise !== avant2 && vise >= 0) window.__pcvSon?.("bouge");
  };
  let sortant = null;
  const cadre = () => {
    const z = $(".zone").getBoundingClientRect(), u = uPx();
    return { l: z.left + CADRE.cote * u, r: z.right - CADRE.cote * u, t: z.top + CADRE.haut * u, b: z.bottom - CADRE.bas * u };
  };
  const sortir = () => {
    const d = dossierOuvert(), x = cases[porte];
    if (!d || !x) return;
    const g = grille.getBoundingClientRect(), partant = grille.cloneNode(true);
    partant.classList.add("partant");
    partant.style.transformOrigin = `${innerWidth / 2 - g.left}px 50%`;
    grille.after(partant);
    const t = getComputedStyle(grille).transform, t0 = t === "none" ? "" : t;
    partant.animate([{ opacity: 1, transform: `${t0} scale(1)` }, { opacity: 0, transform: `${t0} scale(.8)` }], { duration: SORTIE_MS, easing: "ease-in", fill: "forwards" }).onfinish = () => partant.remove();
    sortant = { id: d.id, x, n: -2, k: -1 };
    porte = -1;
    cible = -1;
    avant = null;
    vue = null;
    montrerVue();
    sel = Math.max(0, principal.indexOf(d));
    decal = retour?.decal ?? -1;
    infosDe = -1;
    dessiner();
    signaler();
    window.__pcvSon?.("retour");
    viserAccueil();
  };
  const destSortie = (x, y) => {
    const n = celSous(x, y), c = cases[n];
    if (!c || reserve.ancreDe.has(n) || reserve.grands.has(n)) return { quoi: "retour" };
    if (c.dossier) return c.id === sortant.id ? { quoi: "retour" } : { quoi: "dossier", n };
    if (sortant.n !== n) {
      sortant.n = n;
      sortant.k = caser(cases.slice(), copie(sortant.x), n);
    }
    return { quoi: "place", k: sortant.k };
  };
  const viserAccueil = () => {
    const d = destSortie(appui.x, appui.y), avant2 = vise;
    viserCase(d.quoi === "place" ? d.k : -1, "vise-libre");
    const c = d.quoi === "dossier" ? d.n : -1;
    if (c !== cible) {
      cible = c;
      marquer(false);
      window.__pcvSon?.("bouge");
    } else if (vise !== avant2 && vise >= 0) window.__pcvSon?.("bouge");
  };
  const lacherSortant = (x, y) => {
    const s = sortant, d = destSortie(x, y), f = fantome;
    fantome = null;
    viserCase(-1);
    const fin = () => {
      racine.classList.remove("au-doigt");
      finSortie(s, d);
    };
    const j = d.quoi === "place" ? d.k : d.quoi === "dossier" ? d.n : principal.findIndex((c) => c.dossier && c.id === s.id);
    const vers = grille.children[j]?.getBoundingClientRect();
    if (d.quoi === "retour") window.__pcvSon?.("retour");
    return vers ? poserFantome(f, vers, fin, d.quoi !== "place") : (f?.remove(), fin());
  };
  const finSortie = (s, d) => {
    sortant = null;
    cible = -1;
    const dos = principal.find((c) => c.dossier && c.id === s.id), k = dos ? dos.l.indexOf(s.x) : -1;
    if (d.quoi === "retour" || k < 0) return marquer(false);
    if (d.quoi === "dossier") {
      const r = deposer(d.n, s.x);
      if (!r) return marquer(false);
      dos.l[k] = r.vieux ? copie(r.vieux) : { vide: 1 };
      sel = d.n;
      sauver();
      dessiner();
      sautiller(d.n);
      window.__pcvSon?.("colle");
      annoncer(dit(s.x, cases[d.n]));
      return;
    }
    dos.l[k] = { vide: 1 };
    sel = caser(principal, copie(s.x), d.k);
    sauver();
    dessiner();
    window.__pcvSon?.("poser");
  };
  const oublierSortie = () => {
    if (!sortant) return;
    sortant = null;
    cible = -1;
    lacherFantome();
    if (!racine.hidden) marquer(false);
  };
  const defiler = () => {
    if (!appui?.long || porte < 0 && !sortant || racine.hidden) return finAppui();
    const z = ZOOMS[zi], u = innerHeight / 800, k = vue ? cadre() : { l: 0, r: innerWidth }, sens = appui.x < k.l + 60 * u ? -1 : appui.x > k.r - 60 * u ? 1 : 0;
    const n = Math.max(0, Math.min(Math.ceil(cases.length / z.r) - visibles(z) + 1, decal + sens));
    if (n !== decal) {
      decal = n;
      placer();
      setTimeout(() => {
        if (appui?.long) glisserVers();
      }, 260);
    }
  };
  const prendreFantome = (k, x, y) => {
    racine.querySelectorAll(".fantome").forEach((f2) => f2.remove());
    const t = grille.children[k];
    if (!t) return;
    const r = (t.querySelector(".bdg.grand") || t).getBoundingClientRect(), f = t.cloneNode(true);
    f.classList.remove("sel", "porte", "pose", "prise", "cible");
    f.classList.add("fantome");
    for (const v of ["r", "c", "g", "d", "pad", "im", "bo"]) f.style.setProperty("--" + v, grille.style.getPropertyValue("--" + v));
    Object.assign(f.style, { width: r.width + "px", height: r.height + "px", margin: "0" });
    f.dx = x - r.left;
    f.dy = y - r.top;
    f.depart = r;
    racine.appendChild(f);
    fantome = f;
  };
  const poserFantome = (f, r, fin, entre) => {
    if (!f) return fin();
    f.style.transition = "transform .18s cubic-bezier(.3,1.2,.5,1), opacity .18s";
    f.style.transform = `translate(${r.left}px, ${r.top}px) scale(${entre ? 0.35 : 1}) rotate(0deg)`;
    if (entre) f.style.opacity = "0";
    let fait = false;
    const finir = () => {
      if (fait) return;
      fait = true;
      f.remove();
      fin();
    };
    f.addEventListener("transitionend", finir, { once: true });
    setTimeout(finir, 260);
  };
  racine.addEventListener("contextmenu", (e) => e.preventDefault());
  racine.addEventListener("pointerdown", (e) => {
    if (e.button > 0 || e.clientX < BORD_DOIGT() || e.clientX > innerWidth - BORD_DOIGT()) return;
    const arrete = arreterElan(), i = arrete ? -1 : celSous(e.clientX, e.clientY);
    if (i < 0 && !e.target.closest?.("#pcv-console .zone")) {
      if (arrete) finElan();
      return;
    }
    window.__pcvBarreQuitter?.();
    finAppui();
    appui = { i, arrete, pDepart: arrete ? pos : null, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, long: false, t: i < 0 ? 0 : setTimeout(() => {
      if (!racine.isConnected || !cases[i]) return;
      const k = reserve.ancreDe.get(i) ?? i;
      if (libre(cases[k])) {
        finAppui();
        entrer();
        sel = k;
        marquer(false);
        caseLibre(k);
        return;
      }
      appui.long = true;
      entrer();
      prendre(k);
      racine.classList.add("au-doigt");
      marquer(false);
      grille.children[k]?.classList.add("prise");
      fantome?.remove();
      prendreFantome(k, appui.x, appui.y);
      glisserVers();
      window.__pcvDefile = setInterval(defiler, 400);
      const a = appDe(cases[k]);
      if (a) menuJeu(a, k);
    }, 450) };
  });
  const DOIGT = {
    seuil: 14,
    // px : déplacement avant de décider (horizontal = balayage, vertical = rien, immobile = appui long)
    traceMs: 80,
    // ms : fenêtre de mesure de la vitesse au lâcher
    arretMs: 60,
    // ms : doigt immobile depuis plus longtemps avant le lâcher = aucun élan
    tau: 325,
    // ms : constante de freinage de l'élan (distance parcourue ≈ vitesse × tau)
    vMax: 6,
    // px/ms : vitesse plafonnée (un geste parasite ne vide pas toute la grille)
    vSens: 0.05,
    // px/ms : au-delà, la colonne d'arrivée est prise dans le sens du mouvement
    resistance: 3,
    // au-delà des bords, la grille suit le doigt trois fois moins vite
    depasse: 0.5,
    // colonnes : dépassement maximal d'un bord sur l'élan
    retourMs: 110,
    // ms : constante du retour au bord après un dépassement
    tauMin: 90,
    tauMaxFin: 600
    // ms : bornes de la constante de l'approche finale
  };
  const BORD_DOIGT = () => window.__pcvBordDoigt ?? 24;
  const pasPx = () => {
    const z = ZOOMS[zi];
    return (z.c + z.g) * innerHeight / 800;
  };
  const decalMax = () => {
    const z = ZOOMS[zi];
    return Math.max(0, Math.ceil(cases.length / z.r) - visibles(z) + 1);
  };
  const poser3d = () => {
    grille.style.transform = `translate3d(${pos}px, 0, 0)`;
    prochesPlus();
  };
  const arreterElan = () => {
    if (!elan) return false;
    cancelAnimationFrame(elan.id);
    elan = null;
    return true;
  };
  const debutBalayage = (e) => {
    appui.balaye = true;
    appui.d0 = decal < 0 ? 0 : decal;
    appui.p0 = appui.pDepart ?? -appui.d0 * pasPx();
    appui.trace = [[e.timeStamp, e.clientX]];
    grille.style.transition = "none";
    appui.x0 = e.clientX;
  };
  const balayer = (e) => {
    const a = appui, t = a.trace;
    t.push([e.timeStamp, e.clientX]);
    while (t.length > 2 && e.timeStamp - t[0][0] > DOIGT.traceMs) t.shift();
    let x = a.p0 + (a.x - a.x0);
    const min = -decalMax() * pasPx();
    if (x > 0) x /= DOIGT.resistance;
    else if (x < min) x = min + (x - min) / DOIGT.resistance;
    pos = x;
    poser3d();
  };
  const finElan = () => {
    elan = null;
    decal = Math.max(0, Math.min(decalMax(), Math.round(-pos / pasPx())));
    grille.style.transition = "none";
    placer();
    void grille.offsetWidth;
    grille.style.transition = "";
    const z = ZOOMS[zi], col = Math.floor(sel / z.r), c = Math.max(decal ? decal + 1 : 0, Math.min(decal + visibles(z) - 2, col));
    if (c !== col) {
      sel = Math.min(cases.length - 1, c * z.r + sel % z.r);
      marquer(false);
    }
  };
  let elanT = -1;
  const lancer3d = (vers, tau, puis) => {
    const p0 = pos, t0 = performance.now();
    const pas = (t) => {
      if (t === elanT) return;
      elanT = t;
      const r = Math.exp(-(t - t0) / tau);
      pos = vers + (p0 - vers) * r;
      if (Math.abs(pos - vers) < 0.5) {
        pos = vers;
        poser3d();
        return puis ? puis() : finElan();
      }
      poser3d();
      elan.id = requestAnimationFrame(pas);
    };
    elan = { id: requestAnimationFrame(pas), pas };
  };
  window.__pcvGrilleAvantImage = (t) => elan?.pas(t);
  const finBalayage = (a, tLache) => {
    const t = a.trace, [ta, xa] = t[0], [tb, xb] = t[t.length - 1];
    let v = tb > ta && tLache - tb < DOIGT.arretMs ? (xb - xa) / (tb - ta) : 0;
    v = Math.max(-DOIGT.vMax, Math.min(DOIGT.vMax, v));
    const p = pasPx(), min = -decalMax() * p, bord = (x) => Math.max(min, Math.min(0, x));
    if (pos > 0 || pos < min) return lancer3d(bord(pos), DOIGT.retourMs);
    const vise2 = pos + v * DOIGT.tau;
    if (vise2 > 0 || vise2 < min) {
      const b = bord(vise2), sur = b + Math.sign(vise2 - b) * Math.min(Math.abs(vise2 - b) * 0.2, DOIGT.depasse * p);
      return lancer3d(sur, Math.max(DOIGT.tauMin, Math.abs(v) > 0.01 ? Math.abs((sur - pos) / v) : DOIGT.tauMin), () => lancer3d(b, DOIGT.retourMs));
    }
    let col = Math.round(vise2 / p) * p;
    if (Math.abs(v) > DOIGT.vSens && (col - pos) * v < 0) col += Math.sign(v) * p;
    col = bord(col);
    const tau = Math.abs(v) > 0.01 && (col - pos) * v > 0 ? (col - pos) / v : DOIGT.tauMin * 1.5;
    lancer3d(col, Math.max(DOIGT.tauMin, Math.min(DOIGT.tauMaxFin, tau)));
  };
  const lacherFantome = () => {
    racine.querySelectorAll(".fantome").forEach((f) => f.remove());
    fantome = null;
    viserCase(-1);
    racine.classList.remove("au-doigt");
  };
  window.removeEventListener("pointermove", window.__pcvGlisse);
  window.removeEventListener("pointerup", window.__pcvLache);
  window.removeEventListener("pointercancel", window.__pcvAppuiPerdu);
  window.addEventListener("pointermove", window.__pcvGlisse = (e) => {
    if (!appui) return;
    appui.x = e.clientX;
    appui.y = e.clientY;
    if (appui.balaye) return balayer(e);
    if (!appui.long) {
      const dx = appui.x - appui.x0, dy = appui.y - appui.y0;
      if (Math.hypot(dx, dy) > DOIGT.seuil) {
        if (Math.abs(dx) > Math.abs(dy)) {
          clearTimeout(appui.t);
          debutBalayage(e);
        } else {
          const a = appui;
          finAppui();
          if (a.arrete) finElan();
        }
      }
      return;
    }
    if (window.__pcvDossiers?.modal?.() && Math.hypot(appui.x - appui.x0, appui.y - appui.y0) > DOIGT.seuil) window.__pcvDossiers.fermer(false);
    if (porte < 0 && !sortant || racine.hidden) {
      finAppui();
      oublierSortie();
      return lacherFantome();
    }
    glisserVers();
  });
  window.addEventListener("pointerup", window.__pcvLache = (e) => {
    const a = appui;
    finAppui();
    if (!a || racine.hidden) {
      oublierSortie();
      return lacherFantome();
    }
    if (a.balaye) return finBalayage(a, e.timeStamp);
    if (a.i < 0) return a.arrete ? finElan() : void 0;
    if (a.long) {
      if (sortant) return lacherSortant(e.clientX ?? a.x, e.clientY ?? a.y);
      if (porte < 0) return lacherFantome();
      const d = destination(e.clientX ?? a.x, e.clientY ?? a.y), f = fantome;
      fantome = null;
      viserCase(-1);
      const fin = () => {
        racine.classList.remove("au-doigt");
        if (d.quoi === "retour") return annuler();
        if (d.quoi === "sortie") cible = SORTIE;
        else if (d.quoi === "dossier") cible = d.n;
        else {
          cible = -1;
          echanger(d.n);
        }
        poser();
      };
      const vers = d.quoi === "retour" ? f?.depart : d.quoi === "sortie" ? $(".entete")?.getBoundingClientRect() : grille.children[d.n]?.getBoundingClientRect();
      if (d.quoi === "retour") window.__pcvSon?.("retour");
      return vers ? poserFantome(f, vers, fin, d.quoi === "dossier" || d.quoi === "sortie") : (f?.remove(), fin());
    }
    if (a.i === sel && document.body.classList.contains("pcv-zone-jaquettes")) agir(1);
    else {
      entrer();
      sel = a.i;
      marquer();
    }
  });
  window.addEventListener("pointercancel", window.__pcvAppuiPerdu = () => {
    const a = appui;
    finAppui();
    oublierSortie();
    lacherFantome();
    if (a?.balaye) finBalayage(a, performance.now());
    else if (a?.arrete) finElan();
    if (a?.long && porte >= 0) annuler();
  });
  window.removeEventListener("pcv-nintendo", window.__pcvConsoleNintendo);
  window.addEventListener("pcv-nintendo", window.__pcvConsoleNintendo = () => {
    if (cases.length) dessiner();
  });
  window.removeEventListener("pcv-badge", window.__pcvBadgeArrive);
  window.addEventListener("pcv-badge", window.__pcvBadgeArrive = () => {
    racine.querySelectorAll("[data-bd]").forEach((b) => {
      const u = badgeURL(b.dataset.bd);
      if (!u) return;
      b.style.backgroundImage = `url('${u}')`;
      if (b.classList.contains("bdg") || b.classList.contains("ec")) habiller(b, b.dataset.bd);
    });
  });
  window.__pcvConsoleMarquer = () => {
    if (!cases.length) return;
    infosDe = -1;
    marquer(false);
  };
  let index = null;
  const lireIndex = () => index ||= (async () => {
    const r = { tailles: {}, morceaux: {}, grands: {} };
    let lu = false;
    try {
      const u = await window.__pcvRessource?.("badges/index.json", "application/json");
      const idx = u ? await (await fetch(u)).json() : null;
      lu = !!idx?.series?.length;
      for (const serie of idx?.series || []) for (const b of serie.badges || []) {
        const k = b.id || serie.id + "/" + b.fichier;
        if (b.cases) r.tailles[k] = b.cases;
        if (b.morceau) r.morceaux[k] = b.morceau;
        if (b.morceaux) r.grands[k] = { cases: b.cases || [2, 2], morceaux: b.morceaux };
      }
    } catch (e) {
    }
    if (!lu) index = null;
    return r;
  })();
  const tailleDe = async (id) => (await lireIndex()).tailles[id] || [1, 1];
  let fusionAnimer = -1;
  const fusionner = () => {
    const idx = indexLu;
    if (!idx) return -1;
    const r = ZOOMS[zi].r;
    let fait = -1;
    cases.forEach((c, i) => {
      const m = c.bd != null && idx.morceaux[c.bd];
      if (!m || fait >= 0) return;
      const g = idx.grands[m.de];
      if (!g) return;
      const ligne = i % r - m.y, ancre = i - m.x * r - m.y, [w, hh] = g.cases;
      if (ligne < 0 || ligne + hh > r || ancre < 0) return;
      const places = g.morceaux.map((id, k) => [ancre + k % w * r + Math.floor(k / w), id]);
      if (!places.every(([j, id]) => cases[j]?.vide && cases[j].bd === id)) return;
      places.forEach(([j]) => {
        cases[j].bd = null;
        delete cases[j].bt;
      });
      cases[ancre].bd = m.de;
      cases[ancre].bt = [w, hh];
      fait = ancre;
    });
    if (fait >= 0) {
      fusionAnimer = fait;
      window.__pcvSon?.("gagne");
    }
    return fait;
  };
  let indexLu = null;
  const chargerIndex = () => lireIndex().then((r) => {
    indexLu = r;
  });
  let tailleMain = [1, 1];
  window.__pcvPoserBadge = async (id, taille) => {
    if (mode() !== "nouvelle") {
      window.__pcvSon?.("bord");
      return false;
    }
    if (window.__pcvDeco) return window.__pcvDeco.ouvrir({ badge: id });
    const t = taille || await tailleDe(id);
    if (porte >= 0) annuler();
    tailleMain = t;
    badgeMain = id;
    if (zi === 0) {
      zi = 2;
      decal = -1;
    }
    const premiere = () => {
      const { ancreDe } = reserver(cases);
      return cases.findIndex((c, i) => libre(c) && !ancreDe.has(i));
    };
    let v;
    while ((v = premiere()) < 0) cases.push({ vide: 1 });
    sel = v;
    entrer();
    dessiner();
    return true;
  };
  const disposition = () => ({ grille: lire("pcv-grille", null), zoom: zi });
  const chargerDisposition = (d) => {
    if (!Array.isArray(d?.grille)) return false;
    if (porte >= 0) annuler();
    finAppui();
    badgeMain = null;
    vue = null;
    zi = Math.max(0, Math.min(ZOOMS.length - 1, Math.round(+d.zoom) || 0));
    ecrire("pcv-zoom", zi);
    ecrire("pcv-grille", d.grille);
    construireCases();
    infosDe = -1;
    decal = -1;
    sel = 0;
    debut();
    dessiner(true);
    entrer();
    marquer(false);
    return true;
  };
  const remettreApplisDevant = () => {
    if (!principal.length) return false;
    if (porte >= 0) annuler();
    finAppui();
    badgeMain = null;
    applisDevant(principal);
    montrerVue();
    sauver();
    infosDe = -1;
    dessiner(true);
    return true;
  };
  const APERCU = { l: 320, h: 200 };
  const apercu = async () => {
    const z = ZOOMS[zi], r = z.r, k = APERCU.h / 800, pas = z.c + z.g, l = principal, { grands, ancreDe } = reserver(l, r);
    const f = l.findIndex((c, i) => !libre(c) || ancreDe.has(i)), c0 = f < r ? 0 : Math.floor(f / r), cols = Math.floor((APERCU.l / k - 128) / pas) + 1;
    const toile = document.createElement("canvas");
    toile.width = APERCU.l;
    toile.height = APERCU.h;
    const x = toile.getContext("2d");
    const st = getComputedStyle(racine), v = (n) => st.getPropertyValue(n).trim();
    const image = async (urls, l2 = 96) => {
      for (const u2 of urls) try {
        return await createImageBitmap(await (await fetch(u2)).blob(), { resizeWidth: l2, resizeQuality: "medium" });
      } catch (e) {
      }
      return null;
    };
    const fond = v("--pcv-fond-page"), u = /url\(["']?([^"')]+)/.exec(fond)?.[1], cs = fond.match(/#[0-9a-f]{3,8}\b|(rgb|hsl)a?\([^)]*\)/gi) || [v("--pcv-carte")];
    const g = x.createLinearGradient(0, 0, 0, APERCU.h);
    cs.forEach((c, j) => {
      try {
        g.addColorStop(cs.length > 1 ? j / (cs.length - 1) : 0, c);
      } catch (e) {
      }
    });
    x.fillStyle = g;
    x.fillRect(0, 0, APERCU.l, APERCU.h);
    const im = u && await image([u], APERCU.l);
    if (im) {
      const e = Math.max(APERCU.l / im.width, APERCU.h / im.height);
      x.drawImage(im, (APERCU.l - im.width * e) / 2, (APERCU.h - im.height * e) / 2, im.width * e, im.height * e);
      im.close();
    }
    const haut = 98 + (zi === 0 ? 116 : 52) + GRILLE_HAUT, cel = (i) => [(64 + (Math.floor(i / r) - c0) * pas) * k, (haut + i % r * pas) * k];
    await Promise.all(l.map(async (c, i) => {
      const col = Math.floor(i / r) - c0;
      if (col < 0 || col >= cols || ancreDe.has(i)) return;
      if (libre(c)) return;
      const [px, py] = cel(i), [w, hh] = grands.has(i) ? c.bt : [1, 1], lx = (w * pas - z.g) * k, ly = (hh * pas - z.g) * k, a = appDe(c), ap = appliDe(c);
      const bm = a ? await image(imagesJeu(a)) : c.bd != null ? await image([badgeURL(c.bd)]) : null;
      x.save();
      x.beginPath();
      x.roundRect(px, py, lx, ly, lx * 0.18);
      x.clip();
      if (a || ap || c.dossier) {
        x.fillStyle = "rgba(255,255,255,.85)";
        x.fill();
      }
      if (ap) {
        const [g1, g2] = ap.fond.split(","), g3 = x.createLinearGradient(px, py, px + lx, py + ly);
        g3.addColorStop(0, g1.trim());
        g3.addColorStop(1, (g2 || g1).trim());
        x.fillStyle = g3;
        x.fill();
      } else if (c.dossier) {
        x.fillStyle = v("--pcv-accent");
        x.fillRect(px + lx * 0.12, py + ly * 0.22, lx * 0.76, ly * 0.6);
      }
      if (bm && a) {
        const s = Math.min(bm.width, bm.height);
        x.drawImage(bm, (bm.width - s) / 2, (bm.height - s) * 0.18, s, s, px, py, lx, ly);
      } else if (bm) {
        const e = Math.min(lx / bm.width, ly / bm.height);
        x.drawImage(bm, px + (lx - bm.width * e) / 2, py + (ly - bm.height * e) / 2, bm.width * e, bm.height * e);
      }
      bm?.close();
      x.restore();
    }));
    return toile.toDataURL("image/jpeg", 0.82);
  };
  window.__pcvGrille = {
    disposition,
    chargerDisposition,
    remettreApplisDevant,
    apercu,
    cases: () => cases,
    zooms: () => ZOOMS,
    zoom: () => ({ ...ZOOMS[zi], i: zi }),
    libre: (i) => libre(cases[i]) && !reserve.ancreDe.has(i),
    couvertes: () => reserve.ancreDe,
    sel: () => sel,
    decal: () => decal,
    visibles: () => visibles(ZOOMS[zi]),
    grille: () => grille,
    recouvert: () => recouvert(),
    boite: (w, h2) => boite(w, h2),
    bord: () => -ZOOMS[zi].g / 2 * uPx(),
    habiller,
    // (bord : coin d'un badge depuis celui de sa case)
    tout: () => principal.flatMap((c) => c.dossier ? ecDe(c) ? [...c.l, c.ec] : c.l : [c]),
    // (badges collés sur les dossiers compris)
    dossier: () => {
      const d = dossierOuvert();
      return d && { id: d.id, nom: d.nom, n: contenu(d).length, max: DOSSIERS.elements, ec: !!ecDe(d) };
    },
    dossiers: () => principal.filter((c) => c.dossier).map((c) => ({ id: c.id, nom: c.nom, n: contenu(c).length })),
    nomMax: () => DOSSIERS.nom,
    // (un badge seulement, collé sur le dossier ; celui qui y était retourne dans la boîte. Un jeu ne se range qu'en le
    // portant, sinon il serait à deux endroits.) discret : remis à sa place après un geste abandonné, sans annonce
    deposer: (j, x, discret) => {
      if (x?.app || x?.appli || !deposer(j, x)) return false;
      sauver();
      dessiner();
      if (!discret) {
        sautiller(j);
        annoncer(dit(x, cases[j]));
      }
      return true;
    },
    // le badge collé sur le dossier de la case j : décollé (il est rendu : { bd, bt }), ou null
    decoller: (j) => {
      const d = cases[j], e = ecDe(d);
      if (!e) return null;
      delete d.ec;
      sauver();
      dessiner();
      return e;
    },
    decollerDossier,
    creerDossier: (i) => creerDossier(i),
    renommerDossier,
    supprimerDossier,
    ouvrirDossier: (i) => ouvrirDossier(i),
    fermerDossier: () => fermerDossier(),
    changer: (f) => {
      if (!cases.length) return;
      f(cases);
      sauver();
      dessiner();
    },
    zoomer: (d) => zoomer(d),
    defiler: (n) => {
      const z = ZOOMS[zi];
      decal = Math.max(0, Math.min(Math.ceil(cases.length / z.r) - visibles(z) + 1, n));
      placer();
      return decal;
    },
    choisir: (i) => {
      sel = i;
      entrer();
      marquer(false);
    },
    decoration: (on) => {
      deco = !!on;
      if (porte >= 0) annuler();
      badgeMain = null;
      if (!on && cases.length) {
        sauver();
        dessiner();
      }
    },
    // retiré de l'accueil / remis (fiche.js, « Ajouter à l'accueil » / « Retirer de l'accueil ») : accueilRetire lit
    // l'état, accueilRetirer le change et reconstruit la grille
    accueilRetire,
    accueilRetirer
  };
  const ouvert = (id) => {
    const e = document.getElementById(id);
    return !!e && !e.hidden;
  };
  const recouvert = () => racine.hidden || ["pcv-place", "pcv-profil", "pcv-amis", "pcv-notifs", "pcv-connexion"].some(ouvert) || !!window.__pcvDossiers?.modal?.() || !!document.querySelector(".pcv-panneau.on, #pcv-themes.on") || !!document.querySelector(".gpfocus")?.closest(".contextMenuItem, .FullModalOverlay");
  (window.__pcvManette ||= {}).console = (b) => {
    if (b === 10 && !racine.hidden && ouvert("pcv-profil") && document.querySelector("#header .gpfocus")) return true;
    if (recouvert()) return false;
    if (window.__pcvDeco?.actif()) return window.__pcvDeco.touche(b);
    const dansBarre = !!document.querySelector("#header .gpfocus") || document.body.classList.contains("pcv-barre-nav");
    if (dansBarre) {
      if (b === 10 && !document.body.classList.contains("pcv-barre-nav") && window.__pcvZone !== "jaquettes") {
        entrer();
        marquer();
        return true;
      }
      if (b === 2 && window.__pcvZone !== "jaquettes") {
        entrer();
        marquer();
        return true;
      }
      if (window.__pcvZone !== "jaquettes") return false;
    }
    if (window.__pcvZone !== "jaquettes") {
      if (![1, 2, 3, 5, 6, 9, 10, 11, 12].includes(b)) return false;
      if (b === 9) monter();
      else {
        entrer();
        marquer();
      }
      return true;
    }
    if ([1, 2, 3, 5, 6, 9, 10, 11, 12].includes(b)) {
      agir(b);
      return true;
    }
    return false;
  };
  const dispositions = () => {
    const D = window.__pcvDossiers;
    if (D?.etat?.()?.genre === "dispo") return D.fermer(), true;
    if (racine.hidden || recouvert() || window.__pcvDeco?.actif() || window.__pcvMenuOuvert?.() || porte >= 0 || !D?.dispositions) return false;
    return D.dispositions(), true;
  };
  $(".leg-vue").addEventListener("click", dispositions);
  if (window.__pcvVueConsole) window.removeEventListener("vgp_onbuttondown", window.__pcvVueConsole, true);
  window.addEventListener("vgp_onbuttondown", window.__pcvVueConsole = (e) => {
    if (e.detail?.button !== 13 || window.__pcvZone !== "jaquettes" && window.__pcvDossiers?.etat?.()?.genre !== "dispo") return;
    if (dispositions()) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);
  if (window.__pcvStartConsole) window.removeEventListener("vgp_onbuttondown", window.__pcvStartConsole, true);
  window.addEventListener("vgp_onbuttondown", window.__pcvStartConsole = (e) => {
    if (e.detail?.button === 14 && !racine.hidden && window.__pcvDossiers?.modal?.()) {
      e.stopPropagation();
      e.preventDefault();
      window.__pcvDossiers.fermer(true);
      return;
    }
    if (e.detail?.button !== 14 || racine.hidden || window.__pcvZone !== "jaquettes" || recouvert() || window.__pcvDeco?.actif() || window.__pcvMenuOuvert?.()) return;
    if (document.querySelector("#header .gpfocus") && !document.body.classList.contains("pcv-zone-jaquettes")) return;
    const a = porte < 0 && badgeMain == null && cases[sel] && appDe(cases[sel]);
    e.stopPropagation();
    e.preventDefault();
    if (a) menuJeu(a, sel);
  }, true);
  if (window.__pcvTouchesConsole) window.removeEventListener("keydown", window.__pcvTouchesConsole, true);
  window.addEventListener("keydown", window.__pcvTouchesConsole = (e) => {
    if (recouvert() || document.activeElement?.matches?.("input,textarea") || window.__pcvDeco?.actif()) return;
    const k = { ArrowLeft: 11, ArrowRight: 12, ArrowUp: 9, ArrowDown: 10, Enter: 1, Escape: 2, x: 3, "-": 5, "+": 6 }[e.key];
    if (!k || window.__pcvZone !== "jaquettes" && k !== 10) return;
    if (window.__pcvZone !== "jaquettes") {
      entrer();
      marquer();
    } else agir(k);
    e.stopImmediatePropagation();
    e.preventDefault();
  }, true);
  let famille = null;
  const touches = () => {
    const h2 = document.documentElement.dataset, f = h2.pcvManette + ("pcvInverse" in h2 ? ":inverse" : "");
    if (f === famille) return;
    famille = f;
    racine.querySelectorAll("[data-touche]").forEach((e) => {
      const [t, c, h3] = window.__pcvTouche?.(+e.dataset.touche) || ["?", "var(--pcv-touche-neutre)"];
      if (h3) e.innerHTML = h3;
      else e.textContent = t;
      if (e.tagName === "U" || e.tagName === "B") e.style.background = c;
    });
  };
  const legende = () => {
    if (window.__pcvZone !== "jaquettes") {
      $(".leg-x").hidden = $(".leg-y").hidden = $(".leg-vue").hidden = $(".leg-start").hidden = true;
      texte($(".leg-a"), document.querySelector("#pcv-barre .rond.pcv-sel")?.dataset.pcvNom || T("acces.rechercher"));
      return;
    }
    if (tete >= 0) {
      $(".leg-x").hidden = $(".leg-y").hidden = $(".leg-vue").hidden = $(".leg-start").hidden = true;
      texte($(".leg-a"), boutonsTete()[tete]?.textContent.trim() || "");
      return;
    }
    $(".leg-x").hidden = $(".leg-y").hidden = $(".leg-vue").hidden = false;
    const a = cases[sel] && appDe(cases[sel]), la = !!a && ici(a);
    texte($(".leg-a"), a ? la ? T("accueil.jouer") : T("console.voir_jeu") : T("console.ouvrir"));
    const st = $(".leg-start");
    if (st.hidden === !!a) st.hidden = !a;
  };
  window.__pcvLegende = legende;
  let etaitVisible = false;
  let dernierTour = Date.now(), ecranAvant = false;
  const tourConsole = () => {
    if (!racine.hidden) touches();
    const maintenant = Date.now();
    if (maintenant - dernierTour > 2e4) window.__pcvAccueilPose = false;
    dernierTour = maintenant;
    const visible = /^\/routes\/library\/home/.test(O.location.pathname) && mode() === "nouvelle" && !!O.appStore?.allApps?.length && !window.__pcvJeuDevant;
    if (racine.hidden !== !visible) {
      racine.hidden = !visible;
      prochesPlus();
    }
    if (!visible && etaitVisible) {
      window.__pcvZone = void 0;
      document.body.classList.remove("pcv-zone-jaquettes");
      finAppui();
      oublierSortie();
      porte = -1;
      cible = -1;
      avant = null;
      badgeMain = null;
      if (!document.querySelector(".pcv-panneau.on")) window.__pcvMusique?.(null);
    }
    const ecran = !!window.__pcvEcran?.ouvert?.();
    if (visible && etaitVisible && ecranAvant && !ecran) {
      if (window.__pcvVersLoupe) window.__pcvVersLoupe = false;
      else {
        entrer();
        marquer(false);
      }
    }
    ecranAvant = ecran;
    if (visible && !etaitVisible) {
      entrer();
      porte = -1;
      cible = -1;
      avant = null;
      chargerIndex();
      const sg = signatureGrille();
      if (sg !== sigGrille || grille.children.length !== cases.length) {
        sigGrille = sg;
        construireCases();
        infosDe = -1;
        decal = -1;
        debut();
        dessiner(!window.__pcvAccueilPose);
      } else marquer(false);
      window.__pcvAccueilPose = true;
      signaler();
      window.__pcvMusique?.("home-menu");
    } else if (visible && vueFamille !== familleTheme() && !appui) dessiner();
    else if (visible && vueJeux && vueJeux !== reglageJeux() && porte < 0 && !appui && !deco) {
      construireCases();
      infosDe = -1;
      decal = -1;
      debut();
      dessiner();
    }
    etaitVisible = visible;
  };
  window.__pcvConsole = setInterval(tourConsole, 150);
  O.navigation?.removeEventListener("currententrychange", O.__pcvConsoleNav);
  O.navigation?.addEventListener("currententrychange", O.__pcvConsoleNav = () => setTimeout(tourConsole, 0));
  const LANCEMENT = { min: 480, max: 760, sortie: 200, jeuMax: 6e4, essai: 3e3 };
  document.getElementById("pcv-lancement")?.remove();
  try {
    (window.__pcvLancementAbos || []).forEach((a) => a?.unregister?.());
  } catch (e) {
  }
  const lanc = document.createElement("div");
  lanc.id = "pcv-lancement";
  lanc.hidden = true;
  lanc.setAttribute("aria-hidden", "true");
  lanc.innerHTML = `<style>
    #pcv-lancement { position: fixed; inset: 0; z-index: 9700; pointer-events: none; display: flex; flex-direction: column; align-items: center; justify-content: center;
      --lanc-a: var(--pcv-accent, #2fb8ff);   
      background: linear-gradient(color-mix(in srgb, var(--lanc-a) 8%, var(--pcv-carte)) 0%, color-mix(in srgb, var(--lanc-a) 18%, var(--pcv-carte)) 60%, color-mix(in srgb, var(--lanc-a) 34%, var(--pcv-carte)) 100%);
      font-family: var(--pcv-police); animation: pcvLancFond .18s ease-out backwards; }
    #pcv-lancement[hidden] { display: none; }
    #pcv-lancement.sort { opacity: 0; transition: opacity ${LANCEMENT.sortie}ms ease-in; }
    #pcv-lancement .ic { position: relative; width: calc(var(--u) * 168); height: calc(var(--u) * 168); border-radius: calc(var(--u) * 30);
      animation: pcvLancVol .3s cubic-bezier(.2,.8,.25,1) both; will-change: transform; }
    #pcv-lancement.jeu .ic { width: calc(var(--u) * 156); height: calc(var(--u) * 234); border-radius: calc(var(--u) * 16); }
    #pcv-lancement .ic .fond { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; background: var(--fond); background-size: cover; background-position: center;
      box-shadow: inset 0 3px 1px color-mix(in srgb, var(--pcv-carte) 70%, transparent), 0 0 0 calc(var(--u) * 5) var(--pcv-lisere);
      -webkit-box-reflect: below calc(var(--u) * 7) linear-gradient(transparent 62%, rgba(0,0,0,.24)); display: flex; align-items: center; justify-content: center; }
    #pcv-lancement .ic .fond svg { width: 58%; height: 58%; }
    
    #pcv-lancement .ic .halo { position: absolute; inset: calc(var(--u) * -10); border-radius: calc(var(--u) * 38);
      box-shadow: 0 0 0 calc(var(--u) * 6) var(--lanc-a), 0 0 calc(var(--u) * 34) calc(var(--u) * 12) color-mix(in srgb, var(--lanc-a) 55%, transparent);
      animation: pcvLancSouffle 1s ease-in-out infinite; will-change: opacity, transform; }
    #pcv-lancement.jeu .nom { margin-top: calc(var(--u) * 100); }
    #pcv-lancement.jeu .ic .halo { border-radius: calc(var(--u) * 24); }
    
    #pcv-lancement .nom { margin-top: calc(var(--u) * 78); max-width: 70%; text-align: center; color: color-mix(in srgb, var(--lanc-a) 55%, var(--pcv-texte)); font-size: calc(var(--u) * 24); font-weight: 800;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; animation: pcvLancFond .2s .12s ease-out backwards; }
    @keyframes pcvLancFond { from { opacity: 0 } }
    @keyframes pcvLancVol { from { transform: translate(var(--dx, 0), var(--dy, 0)) scale(var(--s, .6)); } }
    @keyframes pcvLancSouffle { 0%, 100% { opacity: .35; transform: scale(.985); } 50% { opacity: 1; transform: scale(1.025); } }
  </style><div class="ic"><div class="halo"></div><div class="fond"></div></div><div class="nom"></div>`;
  document.body.appendChild(lanc);
  window.__pcvFond?.(lanc);
  const lancIc = lanc.querySelector(".ic"), lancFond = lanc.querySelector(".fond"), lancNom = lanc.querySelector(".nom");
  let lancTic = 0, lancFin = 0, lancEtat = null;
  const lancRetirer = (vite) => {
    if (!lancEtat) return;
    lancEtat = null;
    clearInterval(lancTic);
    clearTimeout(lancFin);
    removeEventListener("vgp_onbuttondown", lancTouche, true);
    removeEventListener("keydown", lancTouche, true);
    if (vite) {
      lanc.hidden = true;
      lanc.classList.remove("sort");
      return;
    }
    lanc.classList.add("sort");
    lancFin = setTimeout(() => {
      lanc.hidden = true;
      lanc.classList.remove("sort");
    }, LANCEMENT.sortie + 20);
  };
  const lancTouche = () => {
    if (lancEtat && Date.now() - lancEtat.depuis > 120) lancRetirer();
  };
  const lancModale = () => [...document.querySelectorAll(".FullModalOverlay, .ModalPosition, .contextMenu")].some((e) => e.getClientRects().length > 0) || !!window.__pcvMenuOuvert?.();
  const lancMontrer = ({ nom, fond, html = "", depuis, jeu = false }) => {
    lancRetirer(true);
    lancFond.style.setProperty("--fond", fond || "#dfe4ea");
    lancFond.innerHTML = html;
    lancNom.textContent = nom || "";
    lanc.classList.toggle("jeu", jeu);
    const r = depuis?.getBoundingClientRect?.(), u = innerHeight / 800, L = 168 * u, H = (jeu ? 234 : 168) * u;
    const cx = innerWidth / 2, cy = innerHeight / 2 - (jeu ? 66 : 56) * u;
    if (r && r.width) {
      lancIc.style.setProperty("--dx", `${r.left + r.width / 2 - cx}px`);
      lancIc.style.setProperty("--dy", `${r.top + r.height / 2 - cy}px`);
      lancIc.style.setProperty("--s", Math.max(0.2, Math.min(1, r.width / (jeu ? 156 * u : L))));
    } else {
      lancIc.style.removeProperty("--dx");
      lancIc.style.removeProperty("--dy");
      lancIc.style.setProperty("--s", 0.6);
    }
    lanc.classList.remove("sort");
    lanc.hidden = false;
    void lanc.offsetWidth;
    addEventListener("vgp_onbuttondown", lancTouche, true);
    addEventListener("keydown", lancTouche, true);
    window.__pcvSon?.("lance");
  };
  const lancSurveiller = () => {
    clearInterval(lancTic);
    lancTic = setInterval(() => {
      const e = lancEtat;
      if (!e) return clearInterval(lancTic);
      if (lancModale()) return lancRetirer();
      const age = Date.now() - e.depuis;
      if (e.jeu) {
        if (O.location.pathname !== e.page || age > LANCEMENT.jeuMax) lancRetirer();
        return;
      }
      let pret = false;
      try {
        pret = !!e.pret?.();
      } catch (x) {
      }
      if (pret && age >= LANCEMENT.min || age >= e.max) lancRetirer();
    }, 100);
  };
  const lancerAvecEcran = ({ nom, fond, html, depuis, image, pret, faire, tenir }) => {
    lancMontrer({ nom, fond: image || fond, html, depuis, jeu: !!image });
    lancEtat = { jeu: false, depuis: Date.now(), pret, max: tenir || LANCEMENT.max };
    requestAnimationFrame(() => {
      const son = window.__pcvSon;
      window.__pcvSon = (n) => n === "choisir" ? void 0 : son?.(n);
      try {
        faire?.();
      } catch (e) {
        console.error(e);
      } finally {
        window.__pcvSon = son;
      }
    });
    lancSurveiller();
  };
  const lancJeu = (appid, action, essai, depuis) => {
    if (lancEtat?.jeu && lancEtat.appid === +appid) {
      if (action != null) lancEtat.action = action;
      return;
    }
    const a = (() => {
      try {
        return O.appStore.GetAppOverviewByAppID(+appid);
      } catch (e) {
        return null;
      }
    })();
    if (!a && !essai) return;
    const k = cases.findIndex((c) => c?.app === +appid), t = k >= 0 ? grille.children[k] : null;
    lancMontrer({ nom: a?.display_name || `Jeu ${appid}`, fond: a ? imageJeu(a) : "var(--pcv-texte2)", depuis: depuis || (racine.hidden ? null : t), jeu: true });
    lancEtat = { jeu: true, appid: +appid, action, depuis: Date.now(), page: O.location.pathname };
    lancSurveiller();
    if (essai) lancFin = setTimeout(() => lancEtat?.appid === +appid && lancRetirer(), LANCEMENT.essai);
  };
  const abo = (f) => {
    try {
      return f();
    } catch (e) {
      return null;
    }
  };
  const SC = O.SteamClient?.Apps ? O.SteamClient : window.SteamClient;
  window.__pcvLancementAbos = [
    abo(() => SC.Apps.RegisterForGameActionStart((id, appid, action) => {
      if (/launch/i.test(String(action))) {
        lancJeu(appid, id);
      }
    })),
    abo(() => SC.Apps.RegisterForGameActionEnd((id) => {
      if (lancEtat?.jeu && lancEtat.action === id) setTimeout(() => lancEtat?.action === id && lancRetirer(), 800);
    })),
    abo(() => SC.Apps.RegisterForGameActionShowError((id) => {
      if (lancEtat?.jeu && lancEtat.action === id) lancRetirer();
    })),
    abo(() => SC.GameSessions.RegisterForAppLifetimeNotifications((n) => {
      if (lancEtat?.jeu && n?.bRunning && +n.unAppID === lancEtat.appid) lancRetirer();
    }))
  ];
  const recents = /* @__PURE__ */ new Map();
  const jouerJeu = (a, depuis) => {
    const id = a.appid, t0 = recents.get(id);
    if (t0 && Date.now() - t0 < 5e3) return;
    recents.set(id, Date.now());
    let gid = "";
    try {
      gid = a.GetGameID?.() || a.m_gameid || String(id);
    } catch (e) {
      gid = String(id);
    }
    try {
      window.__pcvLancement.run(gid, a);
    } catch (e) {
      console.error("lancement", e);
      recents.delete(id);
      return;
    }
    lancJeu(id, null, false, depuis);
  };
  window.__pcvLancement = {
    banc: {},
    run: (gid) => SC.Apps.RunGame(gid, "", -1, 100),
    appli: lancerAvecEcran,
    jeu: (appid) => lancJeu(appid, null),
    essai: (appid) => lancJeu(appid, null, true),
    fermer: () => lancRetirer(),
    etat: () => lancEtat && { ...lancEtat, pret: void 0 }
  };
  return "nouvel accueil pr\xEAt";
})();
