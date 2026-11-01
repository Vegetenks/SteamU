(() => {
  const u = (n) => `calc(var(--u) * ${n})`;
  const echapper = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const RANG_HAUT = 78, FONDU_BAS = 60, FONDU_HAUT = 30, GRILLE_HAUT = 60, ETAGERES_X = 252, PORTE_X = 28, PORTE_LARGEUR = 196, PORTE_DROITE = PORTE_X + PORTE_LARGEUR, PORTE_HAUT = 12, PORTE_LEVE = 5;
  const LEGENDE = 70, masque = (haut = 0) => ((m) => `-webkit-mask-image: ${m}; mask-image: ${m};`)(`linear-gradient(180deg, transparent 0, #000 ${u(haut)}, #000 calc(100% - ${u(FONDU_BAS)}), transparent)`);
  const fondus = `${masque(FONDU_HAUT)} padding-top: ${u(FONDU_HAUT)}; padding-bottom: ${u(FONDU_BAS)}; scroll-padding: ${u(FONDU_HAUT)} 0 ${u(FONDU_BAS)};`;
  const cadre = (ETAGERES_X2) => {
    const DEBUT = ETAGERES_X2 ? PORTE_DROITE : 0, RETRAIT = ETAGERES_X2 - DEBUT;
    return `<style class="emprunt"></style><style>
      :host { position: fixed; inset: 0; z-index: 8600; font-family: var(--pcv-police); color: var(--pcv-texte); overflow: hidden; }
      
      :host::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--pcv-fond-page); will-change: transform; }
      [hidden] { display: none !important; }
      * { box-sizing: border-box; }
      button { all: unset; box-sizing: border-box; cursor: pointer; }
      svg[data-ico] { width: 1em; height: 1em; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; flex: none; }
      .verre { background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
      .pastille { flex: none; border-radius: 50%; background: var(--pcv-pastille); box-shadow: var(--pcv-pastille-ombre); display: flex; align-items: center; justify-content: center; }
      .legende-bas { position: absolute; right: ${u(28)}; bottom: ${u(16)}; left: ${u(28)}; z-index: 20; }   
      :host-context(html.pcv-question) .pcv-legende { visibility: hidden; }   
      
      .zoom b { cursor: pointer; }
      .page { position: absolute; left: ${u(28)}; bottom: ${u(16)}; }
      .page small { margin-left: ${u(8)}; color: var(--pcv-texte2); }
      .page svg { font-size: ${u(22)}; color: var(--pcv-cyan-plein); }
      
      .cel { width: calc(var(--u) * var(--c)); height: calc(var(--u) * var(--c)); flex: none; }
      .absent .im { opacity: .8; filter: saturate(.65); }
      .cel .im .nuage svg { stroke: #fff; filter: drop-shadow(0 0 calc(var(--u) * 1.5) #5b6676); }
      .cel.app .im, .cel .im.nomme { flex-direction: column; gap: 6%; color: var(--pcv-sur-accent); text-align: center; padding: 8%; }
      .cel .im.nomme svg:not(.coin-e *) { width: 34%; height: 34%; }   
      .cel .im b { position: relative; z-index: 1; font-size: calc(var(--u) * var(--c) * .115); font-weight: 900; line-height: 1.15; overflow-wrap: anywhere;
        display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 1px 2px rgb(0 0 0 / .25); }
      .sans-texte .cel:not(.tout) :is(b, em, .t) { display: none; }   
      .sans-texte .cel.app .im svg { width: 58%; height: 58%; }
      
      .bloc-etageres { position: absolute; left: 0; right: 0; top: ${u(88)}; bottom: ${u(76)}; z-index: 0; }
      
      .etageres { position: absolute; left: ${u(DEBUT)}; right: 0; top: 0; bottom: 0; overflow-y: auto; scrollbar-width: none; overscroll-behavior: contain; touch-action: pan-y; }   
      .etageres::-webkit-scrollbar { display: none; }
      .piste { position: relative; }
      .vitrine, .entete-jeux, .vedette, .rayon { margin-left: ${u(RETRAIT)}; margin-right: ${u(40)}; }
      .rayon h3 { margin: ${u(12)} 0; }
      
      .etagere { position: relative; content-visibility: auto; }
      .grande-porte { position: absolute; left: ${u(PORTE_X)}; top: ${u(PORTE_HAUT)}; bottom: 0; width: ${u(PORTE_LARGEUR)}; border-radius: ${u(30)}; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: ${u(14)}; padding: ${u(18)}; text-align: center; }
      .grande-porte .pile { position: relative; width: ${u(132)}; height: ${u(120)}; flex: none; }
      .grande-porte .pile .cel { position: absolute; }
      .grande-porte b { font-size: ${u(22)}; font-weight: 900; line-height: 1.15; }
      .grande-porte small { font-size: ${u(16)}; font-weight: 800; color: var(--pcv-texte2); }
      
      .cel.tout { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--u) * var(--c) * .058); font-size: calc(var(--u) * var(--c) * .135); font-weight: 900; text-align: center; color: var(--pcv-texte2); }
      .cel.tout .pastille { width: calc(var(--u) * var(--c) * .385); height: calc(var(--u) * var(--c) * .385); font-size: calc(var(--u) * var(--c) * .19); color: var(--pcv-cyan-plein); }
      .grande-porte.sel { box-shadow: var(--pcv-reflet), var(--pcv-curseur); }
      
      .grande-porte { overflow: hidden; transform-origin: 50% 0; transition: transform var(--pcv-panneau-duree) var(--pcv-panneau-courbe); }   
      .grande-porte.sel { transform: translateY(${u(-PORTE_LEVE)}) scale(1.02); }
      .grande-porte .pile .cel { transition: translate var(--pcv-panneau-duree) var(--pcv-panneau-courbe); }
      .grande-porte.sel .pile .cel:first-child { translate: ${u(-10)} ${u(3)}; }
      .grande-porte.sel .pile .cel:last-child { translate: ${u(10)} ${u(-4)}; }
      .grande-porte.sel .pile { animation: pcvPorteSouffle 1.6s ease-in-out .35s infinite alternate; }
      .grande-porte::after { content: ""; position: absolute; top: -10%; bottom: -10%; left: 0; width: 45%; pointer-events: none; opacity: 0;
        background: linear-gradient(100deg, transparent, rgba(255, 255, 255, .45), transparent); transform: translateX(-110%) skewX(-14deg); }
      .grande-porte.sel::after { animation: pcvPorteReflet .9s ease-out .15s; }
      @keyframes pcvPorteSouffle { to { transform: translateY(${u(-4)}); } }
      @keyframes pcvPorteReflet { from { opacity: 1; } to { opacity: 1; transform: translateX(330%) skewX(-14deg); } }
      @media (prefers-reduced-motion: reduce) { .grande-porte, .grande-porte .pile, .grande-porte .pile .cel, .grande-porte::after { animation: none !important; transition: none !important; } }
      .etagere h3 { margin: 0; position: absolute; left: ${u(RETRAIT)}; right: ${u(40)}; top: ${u(4)}; }
      
      :is(.etagere, .rayon) h3 { display: flex; align-items: center; gap: ${u(10)}; font-size: ${u(19)}; font-weight: 900; white-space: nowrap; }
      :is(.etagere, .rayon) h3 .pastille { width: ${u(34)}; height: ${u(34)}; font-size: ${u(18)}; color: var(--pcv-cyan-plein); }
      :is(.etagere, .rayon) h3 > small { font-size: ${u(15)}; font-weight: 800; color: var(--pcv-texte2); }
      .etagere .rang { position: absolute; left: ${u(RETRAIT)}; top: ${u(RANG_HAUT)}; display: flex; gap: calc(var(--u) * var(--g)); }
      
      .onglets { position: absolute; left: ${u(28)}; right: ${u(28)}; top: ${u(90)}; height: ${u(48)}; display: flex; align-items: center; gap: ${u(8)}; }
      .onglets .pcv-touche { --taille: ${u(28)}; }
      
      .og-l { display: flex; align-items: center; gap: ${u(8)}; min-width: 0; padding: var(--pcv-marge-ombre); margin: calc(var(--pcv-marge-ombre) * -1) 0 calc(var(--pcv-marge-ombre) * -1) calc(var(--pcv-marge-ombre) * -1);
        scroll-padding-inline: var(--pcv-marge-ombre); overflow-x: auto; scrollbar-width: none; pointer-events: none; -webkit-mask-image: var(--pcv-masque-marge-x); mask-image: var(--pcv-masque-marge-x); } .og-l > * { pointer-events: auto; }
      .og { height: ${u(44)}; border-radius: ${u(22)}; padding: 0 ${u(16)}; display: inline-flex; align-items: center; gap: ${u(8)}; font-size: ${u(16)}; font-weight: 900; white-space: nowrap; flex: none; }
      .og small { font-weight: 800; color: var(--pcv-texte2); }
      .og.on { background: var(--pcv-cyan); color: var(--pcv-sur-accent); box-shadow: var(--pcv-bombe), 0 ${u(5)} ${u(15)} color-mix(in srgb, var(--pcv-cyan-plein) 30%, transparent); }
      .og.on small { color: var(--pcv-sur-accent); } .og.recherche { color: var(--pcv-orange); } .og.recherche svg { width: ${u(20)}; height: ${u(20)}; }
      .puce-f { position: relative; margin-left: auto; height: ${u(40)}; border-radius: ${u(20)}; display: inline-flex; align-items: center; gap: ${u(8)}; padding: 0 ${u(16)} 0 ${u(6)}; font-size: ${u(15)}; font-weight: 900; white-space: nowrap; flex: none; }
      .puce-f small { font-size: inherit; font-weight: 800; color: var(--pcv-texte2); }
      .puce-f::after { content: ""; position: absolute; inset: ${u(-8)} ${u(-4)}; }   
      .puce-f .chevron { display: inline-flex; font-size: ${u(13)}; color: var(--pcv-texte2); transform: rotate(90deg); }
      .puce-f.ouvert, .og.f, .puce-f.f { box-shadow: var(--pcv-reflet), var(--pcv-anneau), var(--pcv-curseur-ombre); }
      .puce-f .menu { left: auto; right: 0; top: ${u(50)}; transform-origin: top right; }   
      
      .menus { position: absolute; inset: 0; z-index: 19; pointer-events: none; } .menus > * { pointer-events: auto; }
      .voile { position: absolute; inset: 0; z-index: 19; background: var(--pcv-voile-fenetre); }
      .menu { position: absolute; z-index: 20; left: 0; top: ${u(56)}; cursor: default; width: ${u(330)}; max-height: ${u(560)}; overflow-y: auto; scrollbar-width: none; border-radius: ${u(26)}; padding: ${u(10)}; background: var(--pcv-fenetre-fond); box-shadow: var(--pcv-reflet), 0 ${u(18)} ${u(40)} rgb(from var(--pcv-ombre-c) r g b / .3); }
      .menu .ligne { height: ${u(42)}; border-radius: ${u(21)}; display: flex; align-items: center; gap: ${u(10)}; padding: 0 ${u(16)}; font-size: ${u(17)}; font-weight: 800; white-space: nowrap; }
      .menu .ligne small { flex: none; margin-left: auto; color: var(--pcv-texte2); font-weight: 800; }
      .menu .ligne .n { min-width: 0; overflow: hidden; text-overflow: ellipsis; }   
      .menu .ligne.choisi { background: var(--pcv-cyan); color: var(--pcv-sur-accent); box-shadow: var(--pcv-curseur); }
      .menu .ligne.choisi small { color: var(--pcv-sur-accent); }
      .menu .ligne.coche::before { content: ""; flex: none; width: ${u(8)}; height: ${u(8)}; border-radius: 50%; background: currentColor; margin-left: ${u(-4)}; }
      .menu .sep { height: ${u(30)}; font-size: ${u(13)}; font-weight: 900; color: var(--pcv-texte3); text-transform: uppercase; letter-spacing: .5px; padding: ${u(10)} ${u(16)} ${u(4)}; }
      
      .grille-g { position: absolute; left: 0; right: ${u(60)}; top: ${u(124)}; bottom: ${u(LEGENDE)}; overflow-y: auto; scrollbar-width: none; overscroll-behavior: contain; touch-action: pan-y; z-index: 0;
      }
      .grille-g, .etageres { ${masque(FONDU_HAUT)} }
      
      .grille-g .piste > .message { position: absolute; left: 0; right: 0; top: ${u(GRILLE_HAUT + 120)}; margin: 0; text-align: center; font-size: ${u(20)}; font-weight: 800; color: var(--pcv-texte2); }
      
      .etageres { scroll-padding-top: ${u(FONDU_HAUT)}; } .etageres > .piste { padding-top: ${u(FONDU_HAUT)}; }
      .etageres :is(.rayon, [data-a], [data-e]):not(.cel) { scroll-margin-bottom: ${u(FONDU_BAS)}; }
      
      .etageres .piste > .fin { padding-bottom: ${u(FONDU_BAS)}; }
      .grille-g::-webkit-scrollbar { display: none; }
      .grille-g > .piste { will-change: transform; }   
      
      .rangee-g { position: absolute; display: flex; }
      .cases-g { position: absolute; z-index: -1; pointer-events: none; background-repeat: repeat-y; }   
      
      .etiq-g { position: absolute; max-width: calc(100% - 24px); overflow: hidden; text-overflow: ellipsis; z-index: 5; transform: translateX(-50%); padding: ${u(5)} ${u(14)}; border-radius: ${u(13)}; background: var(--pcv-bulle); color: var(--pcv-sur-accent);
        font-size: ${u(15)}; font-weight: 900; white-space: nowrap; pointer-events: none; box-shadow: 0 0 0 ${u(2)} var(--pcv-lisere), 0 ${u(4)} ${u(10)} rgb(0 0 0 / .25); }
      .etiq-g small { font-weight: 800; opacity: .75; margin-left: ${u(6)}; }
      :host-context(body.pcv-barre-main) .etiq-g { visibility: hidden; }   
      
      .rail { position: absolute; right: ${u(22)}; top: ${u(150)}; bottom: ${u(84)}; width: ${u(34)}; border-radius: ${u(17)}; display: flex; flex-direction: column; align-items: center; justify-content: space-between;
        padding: ${u(8)} 0; font-size: ${u(12)}; font-weight: 900; color: var(--pcv-texte2); background: var(--pcv-creux); touch-action: none; }
      .rail i { font-style: normal; width: ${u(26)}; height: ${u(16)}; display: flex; align-items: center; justify-content: center; border-radius: ${u(8)}; }
      .rail i.vide { opacity: .35; }
      .rail i.ici { background: var(--pcv-cyan); color: var(--pcv-sur-accent); height: ${u(24)}; font-size: ${u(14)}; }
      .rail.f { box-shadow: var(--pcv-reflet), var(--pcv-curseur); }
      
      .cel { position: relative; cursor: pointer; }
      .sur-action { box-shadow: var(--pcv-reflet), var(--pcv-curseur); }
      :host-context(body.pcv-barre-main) .sur-action { box-shadow: none; }
      .message { padding: ${u(16)}; font-size: ${u(16)}; font-weight: 800; color: var(--pcv-texte2); } .message:empty { display: none; }
      .etagere .rang > .message { align-self: center; padding: 0; }   
      .legende-bas { left: ${u(360)}; }
      
      .og .pcv-marque-relief { --pcv-relief-taille: ${u(34)}; }
      
      .pcv-marque-relief > svg { width: 50%; height: 50%; }
      
      .coin-e { position: absolute; right: 7%; top: 7%; width: ${u(26)}; height: ${u(26)}; box-sizing: border-box; border-radius: 50%; padding: ${u(5)}; display: flex;
        background: var(--pcv-vert); color: var(--pcv-sur-accent); box-shadow: 0 0 0 ${u(2.5)} var(--pcv-lisere); } .coin-e svg { width: 100%; height: 100%; }
      .orange { background: var(--pcv-orange); color: var(--pcv-sur-accent); }
      
      .contenu.texte p { margin: ${u(6)} 0; line-height: 1.4; white-space: pre-wrap; } .contenu.texte .bulle-r { font-size: ${u(15)}; padding: ${u(10)}; }
      .contenu.texte .gros-r { font-size: ${u(20)}; height: ${u(60)}; gap: ${u(10)}; }
      .contenu.texte .gros-r svg { border-radius: 50%; padding: ${u(8)}; width: ${u(40)}; height: ${u(40)}; background: var(--pcv-pastille); color: var(--pcv-cyan-plein); }   
      .progression { height: ${u(10)}; border-radius: ${u(5)}; background: var(--pcv-creux); overflow: hidden; width: 100%; }
      .progression i { display: block; height: 100%; background: var(--pcv-cyan-plein); transition: width .4s ease; }
      .rail-bulle { position: absolute; z-index: 5; right: ${u(68)}; height: ${u(44)}; border-radius: ${u(22)}; padding: 0 ${u(16)} 0 ${u(6)}; display: flex; align-items: center; gap: ${u(10)};
        background: var(--pcv-bulle); color: var(--pcv-sur-accent); font-size: ${u(15)}; font-weight: 900; white-space: nowrap; pointer-events: none; }
      .rail-bulle b { width: ${u(34)}; height: ${u(34)}; border-radius: 50%; background: var(--pcv-cyan); display: flex; align-items: center; justify-content: center; font-size: ${u(19)}; }
      
      :host .zoom { left: ${u(28)}; bottom: ${u(16)}; }
      
      .carrousel { position: absolute; left: ${u(160)}; right: ${u(160)}; top: ${u(84)}; height: ${u(236)}; z-index: 2;
        -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 ${u(70)}, #000 calc(100% - ${u(70)}), transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 ${u(70)}, #000 calc(100% - ${u(70)}), transparent 100%); }
      
      .carrousel .cel { position: absolute; left: 0; top: ${u(16)}; cursor: pointer; will-change: transform; }
      .fleche-c { position: absolute; top: ${u(126)}; width: ${u(56)}; height: ${u(56)}; border-radius: 50%; z-index: 3; display: flex; align-items: center; justify-content: center; }
      .fleche-c span { width: ${u(40)}; height: ${u(40)}; border-radius: 50%; background: var(--pcv-pastille); box-shadow: 0 0 0 1px rgba(0,0,0,.07); display: flex; align-items: center; justify-content: center; color: #6b7788; font-size: ${u(22)}; }
      .fleche-c.g { left: ${u(92)}; } .fleche-c.g svg { transform: scaleX(-1); } .fleche-c.d { right: ${u(92)}; }
      .nom-jeu { position: absolute; left: ${u(160)}; right: ${u(160)}; top: ${u(262)}; text-align: center; font-size: ${u(22)}; font-weight: 900; z-index: 3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .carte { position: absolute; left: ${u(140)}; right: ${u(140)}; top: ${u(330)}; bottom: ${u(60)}; border-radius: ${u(32)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre), var(--pcv-lumiere-carte);
        padding: ${u(18)}; display: flex; gap: ${u(18)}; overflow: hidden; }
      
      .colonne { flex: 0 0 calc(${u(300)} + 2 * var(--pcv-marge-ombre)); display: flex; flex-direction: column; overflow: hidden; }
      :is(.colonne, .contenu) { padding: var(--pcv-marge-ombre); margin: calc(var(--pcv-marge-ombre) * -1); scroll-padding: var(--pcv-marge-ombre); pointer-events: none;
        -webkit-mask-image: var(--pcv-masque-marge); mask-image: var(--pcv-masque-marge); } :is(.colonne, .contenu) > * { pointer-events: auto; }
      .colonne .pile { display: flex; flex-direction: column; gap: var(--pcv-ecart-choix); transition: transform .15s; }
      .onglet { flex: none; height: ${u(64)}; border-radius: ${u(24)}; font-size: ${u(17)}; font-weight: 900; padding: 0 ${u(14)}; gap: ${u(12)}; white-space: nowrap; display: flex; align-items: center; }
      .onglet .pastille, .rg .pastille { width: ${u(36)}; height: ${u(36)}; font-size: ${u(20)}; color: var(--pcv-sur-accent); background: var(--k); }
      .onglet.choisi { background: var(--pcv-cyan); color: var(--pcv-sur-accent); box-shadow: var(--pcv-bombe), 0 ${u(5)} ${u(15)} color-mix(in srgb, var(--pcv-cyan-plein) 30%, transparent); }
      .onglet.choisi .pastille { background: rgba(255,255,255,.26); box-shadow: none; }
      
      
      :host(:not(.sur-contenu)) .onglet.choisi { box-shadow: var(--pcv-reflet), var(--pcv-curseur); }
      :host-context(body.pcv-barre-main) .onglet.choisi { background: var(--pcv-creux); color: var(--pcv-texte); box-shadow: none; }
      :host-context(body.pcv-barre-main) .onglet.choisi .pastille { background: var(--k); }
      .fondu-b { -webkit-mask-image: linear-gradient(180deg, #000 calc(100% - ${u(46)}), transparent); mask-image: linear-gradient(180deg, #000 calc(100% - ${u(46)}), transparent); }
      .fondu-hb { -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 ${u(34)}, #000 calc(100% - ${u(46)}), transparent); mask-image: linear-gradient(180deg, transparent 0, #000 ${u(34)}, #000 calc(100% - ${u(46)}), transparent); }
      .contenu { flex: 1; min-width: 0; position: relative; display: flex; flex-direction: column; gap: var(--pcv-ecart-choix); overflow: hidden auto; scrollbar-width: none; overscroll-behavior: contain; touch-action: pan-y; }   
      .contenu.riche { gap: var(--pcv-ecart-choix); }
      
      .rg { flex: none; min-height: ${u(64)}; border-radius: ${u(24)}; padding: ${u(12)} ${u(14)} ${u(12)} ${u(22)}; display: flex; align-items: center; gap: ${u(12)}; }
      .rg .t { flex: 1; min-width: 0; }
      .rg .t b { display: block; font-size: ${u(17)}; font-weight: 900; }
      .rg .t small { display: block; font-size: ${u(13)}; font-weight: 800; color: var(--pcv-texte2); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
      .rg .val { flex: none; height: ${u(38)}; border-radius: ${u(18)}; padding: 0 ${u(16)}; display: inline-flex; align-items: center; font-size: ${u(15)}; font-weight: 900; white-space: nowrap; max-width: ${u(260)}; overflow: hidden; text-overflow: ellipsis;
        background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
      .rg .val.code { font-family: ui-monospace, monospace; font-size: ${u(13)}; font-weight: 700; color: var(--pcv-texte2); background: var(--pcv-creux); box-shadow: none; }
      .inter { width: ${u(64)}; height: ${u(34)}; border-radius: ${u(17)}; background: var(--pcv-cyan); position: relative; flex: none; }
      .inter::after { content: ""; position: absolute; right: ${u(4)}; top: ${u(4)}; width: ${u(26)}; height: ${u(26)}; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); }
      .inter.non { background: var(--pcv-creux); } .inter.non::after { right: auto; left: ${u(4)}; }
      
      .banniere { position: relative; height: ${u(150)}; flex: none; border-radius: ${u(24)}; background: var(--pcv-creux) center 30% / cover; box-shadow: 0 0 0 ${u(4)} var(--pcv-lisere), var(--pcv-ombre); }
      .sous-b { display: flex; align-items: center; justify-content: space-between; gap: ${u(14)}; margin-top: ${u(-40)}; padding: 0 ${u(14)}; flex: none; position: relative; }
      .bulle-r { position: relative; display: flex; align-items: center; gap: ${u(12)}; padding: ${u(8)} ${u(18)} ${u(8)} ${u(8)}; border-radius: ${u(26)}; min-width: 0; background: var(--pcv-carte); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
      .bulle-r b { display: block; font-size: ${u(17)}; font-weight: 900; white-space: nowrap; } .bulle-r small { display: block; font-size: ${u(13)}; font-weight: 800; color: var(--pcv-texte2); white-space: nowrap; }
      .mii-r { width: ${u(40)}; height: ${u(40)}; border-radius: 50%; flex: none; object-fit: cover; background: var(--pcv-creux); box-shadow: 0 0 0 2px var(--pcv-lisere); }
      .gros-r { height: ${u(74)}; border-radius: ${u(37)}; padding: 0 ${u(34)}; display: inline-flex; align-items: center; background: var(--pcv-cyan); color: var(--pcv-sur-accent); font-size: ${u(26)}; font-weight: 900; white-space: nowrap; box-shadow: var(--pcv-curseur); flex: none; }
      
      .gros-r[data-a]:not(.sur-action), :host-context(body.pcv-barre-main) .gros-r[data-a] { box-shadow: var(--pcv-bombe), var(--pcv-ombre); }
      .tete-r { font-size: ${u(16)}; font-weight: 900; color: var(--pcv-texte2); flex: none; } .tete-r small { font-weight: 800; margin-left: ${u(6)}; }
      .caps { display: flex; gap: ${u(12)}; flex: none; } .caps img { width: calc((100% - ${u(24)}) / 3); aspect-ratio: 16 / 9; object-fit: cover; border-radius: ${u(14)}; box-shadow: 0 0 0 3px var(--pcv-lisere); }
      .fond-r { position: absolute; inset: var(--pcv-marge-ombre); border-radius: ${u(24)}; background: var(--pcv-creux) center / cover; }
      .fond-r::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(90deg, rgba(10,14,20,.25), rgba(10,14,20,.05) 60%, rgba(10,14,20,.45)); }
      .verre-r { position: relative; margin: auto ${u(18)} ${u(18)}; padding: ${u(18)} ${u(20)}; border-radius: ${u(24)}; background: color-mix(in srgb, var(--pcv-carte) 86%, transparent); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
      .resume { margin: 0 0 ${u(14)}; font-size: ${u(16)}; font-weight: 800; line-height: 1.45; }
      .puces-r { display: flex; flex-wrap: wrap; gap: ${u(8)}; }
      .puce-r { height: ${u(32)}; border-radius: ${u(16)}; padding: 0 ${u(12)} 0 ${u(8)}; display: inline-flex; align-items: center; gap: ${u(7)}; font-size: ${u(13.5)}; font-weight: 900; white-space: nowrap; background: var(--pcv-pastille); box-shadow: var(--pcv-pastille-ombre); }
      .puce-r svg { color: var(--pcv-cyan-plein); font-size: ${u(16)}; }
      .d2-succes { display: flex; gap: ${u(22)}; align-items: center; flex: none; } .tuiles-s { display: grid; grid-template-columns: repeat(5, ${u(76)}); gap: ${u(12)}; }
      .anneau-r { width: ${u(132)}; height: ${u(132)}; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; background: conic-gradient(var(--pcv-cyan-plein) calc(var(--p) * 1%), var(--pcv-creux) 0); }
      .anneau-r span { width: ${u(104)}; height: ${u(104)}; border-radius: 50%; background: var(--pcv-carte); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: var(--pcv-reflet); }
      .anneau-r b { font-size: ${u(34)}; font-weight: 900; line-height: 1; } .anneau-r small { font-size: ${u(14)}; font-weight: 800; color: var(--pcv-texte2); }
      .bad { --t: ${u(76)}; width: var(--t); height: var(--t); flex: none; border-radius: calc(var(--t) * .24); padding: calc(var(--t) * .06); background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); display: flex; align-items: center; justify-content: center; }
      .bad img { width: 100%; height: 100%; border-radius: calc(var(--t) * .18); display: block; }
      .bad.clos { color: var(--pcv-texte3); font-size: calc(var(--t) * .38); background: var(--pcv-creux); box-shadow: inset 0 2px 4px rgba(0,0,0,.18); }
      .succes-r { display: flex; align-items: center; gap: ${u(14)}; padding: ${u(10)} ${u(16)} ${u(10)} ${u(10)}; border-radius: ${u(24)}; flex: none; min-width: 0; }
      .succes-r img { width: ${u(56)}; height: ${u(56)}; border-radius: ${u(14)}; flex: none; box-shadow: 0 0 0 3px var(--pcv-lisere); }
      .succes-r span { min-width: 0; }
      .succes-r small { display: block; font-size: ${u(13)}; font-weight: 800; color: var(--pcv-texte2); } .succes-r b { display: block; font-size: ${u(17)}; font-weight: 900; }
      .succes-r i { display: block; font-style: normal; font-size: ${u(13)}; font-weight: 800; color: var(--pcv-texte2); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    </style>
    <div class="bloc-etageres"><div class="grande-porte verre" data-g="porte"></div><div class="etageres"><div class="piste"></div></div></div>
    <div class="vue-grille" hidden><div class="grille-g"><div class="piste"></div></div><div class="onglets"></div><div class="rail"></div><div class="rail-bulle" hidden></div></div>
    <div class="vue-page" hidden><div class="carrousel"></div><button class="fleche-c g verre" data-v="-1"><span></span></button><button class="fleche-c d verre" data-v="1"><span></span></button><div class="nom-jeu"></div><div class="carte"><div class="colonne"><div class="pile"></div></div><div class="contenu"></div></div></div>
    <div class="menus"></div>
    <div class="page pcv-legende"><span></span></div><div class="zoom"></div>
    <div class="legende-bas pcv-legende"></div>`;
  };
  const geometrie = (z, largeur) => {
    const gap = z.g * 2, pas = z.c + gap, larg = largeur - 64 - 90, n = Math.max(1, Math.floor((larg + gap) / pas));
    return { z, gap, pas, n, x0: 64 + (larg - (n * pas - gap)) / 2 };
  };
  const cransGrille = () => window.__pcvJeux.zooms.slice(2, 7), cransEtageres = () => window.__pcvJeux.zooms.slice(1, 6);
  const commandeZoom = ({ cran, niveaux, barre, actif, piste, boite, changer }) => {
    let commande;
    return (d) => (commande ||= window.__pcvJeux.crans({
      cran,
      max: () => niveaux().length - 1,
      barre,
      aller: (n) => {
        if (actif()) zoomer(piste, boite, () => changer(n));
      }
    }))(d);
  };
  const cotes = (c, g = window.__pcvJeux.zooms.find((z) => z.c === c)?.g ?? 16) => Object.entries(window.__pcvJeux.cotes(c, g)).map(([k, v]) => `--${k}:${v}`).join(";");
  const dimensionsEtagere = (z, largeur = innerWidth / (innerHeight / 800)) => ({ n: Math.max(2, Math.floor((largeur - ETAGERES_X - 40) / (z.c + z.g))), hauteur: RANG_HAUT + z.c + FONDU_BAS + 8 });
  const toutVoir = (nombre, attrs = "") => `<button class="cel tout verre" ${attrs}><span class="pastille">${window.__pcvIcones.svg("bibliotheque")}</span><span class="t">${window.__pcvT("biblio.tout_voir")}<br>${nombre}</span></button>`;
  const porte = ({ liste, tuile, titre, nombre, el }) => {
    const h = `<div class="pile" style="${cotes(78, 12)}">${liste.slice(0, 3).map((p, i) => tuile(p, 78, `style="${cotes(78, 12)};left:${u(i * 26)};top:${u((2 - i) * 14)};transform:rotate(${(i - 1) * 7}deg)"`)).join("")}</div><b>${titre}</b><small>${nombre}</small>`;
    if (el && el.__pcvPorte !== h) {
      el.innerHTML = h;
      el.__pcvPorte = h;
    }
    return h;
  };
  const etagere = ({ titre, icone, nombre, tuiles, suite }) => `<h3><span class="pastille">${window.__pcvIcones.svg(icone)}</span>${titre}<small>${nombre}</small></h3><div class="rang">${tuiles}${suite}</div>`;
  const deplacerEtagere = (k, j, tailles, b) => {
    const barre = b === 9 && k <= 0;
    if (b === 9 || b === 10) k = Math.max(0, Math.min(tailles.length - 1, k + (b === 10 ? 1 : -1)));
    else if (b === 11 || b === 12) j += b === 12 ? 1 : -1;
    return { k, j: Math.max(-1, Math.min(j, (tailles[k] || 1) - 1)), barre };
  };
  const naviguer = (zone, selecteur, selection, b, porte2, barre) => {
    const elements = [...zone.querySelectorAll(selecteur)].filter((el2) => !el2.closest?.("[hidden]") && !el2.disabled);
    const groupes = [];
    for (const el2 of elements) {
      const parent = el2.closest?.(".rang, nav, .commandes-vedette, .vedette-texte, .vitrine") || el2.parentElement;
      let groupe = groupes.find((g) => g.parent === parent);
      if (!groupe) groupes.push(groupe = { parent, l: [] });
      groupe.l.push(el2);
    }
    let k = groupes.findIndex((g) => g.l.some((el2) => +(el2.dataset.a ?? el2.dataset.e) === selection));
    let j = k < 0 ? -1 : groupes[k].l.findIndex((el2) => +(el2.dataset.a ?? el2.dataset.e) === selection);
    k = Math.max(0, k);
    const d = deplacerEtagere(k, j, groupes.map((g) => g.l.length), b);
    if (d.barre) barre?.();
    const el = d.j < 0 && porte2 ? porte2 : groupes[d.k]?.l[Math.max(0, d.j)], n = el ? +(el.dataset.a ?? el.dataset.e) : selection;
    if (n === selection && !d.barre) window.__pcvSon?.("bord");
    return n;
  };
  const nomsBulles = /* @__PURE__ */ new WeakMap();
  const bulleNom = (piste, tuile, texte) => {
    let q = piste.querySelector(".etiq-g");
    if (!q) {
      q = document.createElement("div");
      q.className = "etiq-g";
      piste.appendChild(q);
    }
    q.hidden = !tuile || !texte;
    if (q.hidden) return;
    const cle = [texte, innerWidth, innerHeight].join("|");
    if (nomsBulles.get(q)?.tuile === tuile && nomsBulles.get(q)?.cle === cle) return;
    nomsBulles.set(q, { tuile, cle });
    const U = innerHeight / 800, r = tuile.getBoundingClientRect(), p = piste.getBoundingClientRect();
    if (q.innerHTML !== texte) q.innerHTML = texte;
    const w = (q.offsetWidth || 0) / 2;
    q.style.top = r.top - p.top - (q.offsetHeight || 26 * U) - 4 * U + "px";
    q.style.left = Math.max(w + 12 * U, Math.min(p.width - w - 12 * U, r.left - p.left + r.width / 2)) + "px";
  };
  const passes = /* @__PURE__ */ new Map();
  let passeId = 0;
  const differer = (piste, f) => {
    passes.set(piste, f);
    passeId ||= requestAnimationFrame(() => {
      passeId = 0;
      const l = [...passes.values()];
      passes.clear();
      for (const g of l) g();
    });
  };
  const marquerTuiles = (zone, selecteur, index, { actif = true, piste = zone, nom, defiler = false, secours = false } = {}) => {
    const elements = [...zone.querySelectorAll(selecteur)], id = (el) => +(el.dataset.i ?? el.dataset.e ?? el.dataset.a);
    const t = elements.find((el) => id(el) === index) || (secours ? elements[0] : null);
    for (const el of elements) el.classList.toggle(el.classList.contains("cel") || el.classList.contains("grande-porte") || el.classList.contains("vitrine") ? "sel" : "sur-action", actif && el === t);
    const enHaut = defiler && actif && t && t === piste.querySelector?.(selecteur), texte = nom ? nom(t) : echapper(t?.getAttribute?.("aria-label") || "");
    differer(piste, () => {
      if (enHaut) piste.parentElement?.scrollTo?.({ top: 0 });
      else if (defiler && actif) (t?.closest?.(".etagere, .rayon") || t)?.scrollIntoView({ block: "nearest", inline: "nearest" });
      bulleNom(piste, actif && t?.classList.contains("cel") ? t : null, texte);
    });
    return t ? id(t) : index;
  };
  const grille = ({ boite, piste, geometrie: geo, liste, tuile, peindre, vide = () => "", cle: cleDe = (p) => p.id ?? p.nom }) => {
    let rangs = /* @__PURE__ */ new Map(), derniere = "";
    const rendre = (cle, tout = false) => {
      const g = geo(), l = liste(), U = innerHeight / 800, neuf = tout || cle !== derniere;
      derniere = cle;
      const gardees = /* @__PURE__ */ new Map();
      if (neuf || !rangs.size && l.length) {
        for (const el of piste.querySelectorAll(".cel[data-g]")) gardees.set(el.dataset.g, el);
        rangs.clear();
        piste.innerHTML = "";
      }
      piste.style.cssText = cotes(g.z.c, g.z.g) + `;height:${(GRILLE_HAUT + Math.ceil(l.length / g.n) * g.pas + 60) * U}px`;
      const a = Math.max(0, Math.floor((boite.scrollTop / U - GRILLE_HAUT) / g.pas) - 2), b = Math.min(Math.ceil(l.length / g.n), Math.ceil((boite.scrollTop / U + boite.clientHeight / U) / g.pas) + 2), nouveaux = [];
      for (const [r, el] of rangs) if (r < a || r >= b) {
        el.remove();
        rangs.delete(r);
      }
      for (let r = a; r < b; r++) {
        const page = l.slice(r * g.n, (r + 1) * g.n), ids = page.map(cleDe).join("|");
        if (rangs.get(r)?.dataset.ids === ids) continue;
        rangs.get(r)?.remove();
        const el = document.createElement("div");
        el.className = "rangee-g";
        el.dataset.ids = ids;
        el.style.cssText = `left:${u(g.x0)};top:${(GRILLE_HAUT + r * g.pas) * U}px;gap:${u(g.gap)}`;
        el.innerHTML = page.map((p, j) => tuile(p, g.z.c, `style="${cotes(g.z.c, g.z.g)}" data-i="${r * g.n + j}" data-g="${encodeURIComponent(cleDe(p))}"`)).join("");
        piste.appendChild(el);
        rangs.set(r, el);
        nouveaux.push(el);
        for (const t of [...el.children]) {
          const v = gardees.get(t.dataset?.g);
          if (!v) continue;
          gardees.delete(t.dataset.g);
          for (const a2 of ["style", "data-i"]) v.setAttribute(a2, t.getAttribute(a2));
          v.querySelector("[data-c]")?.setAttribute("data-c", g.z.c);
          t.replaceWith(v);
        }
      }
      const total = Math.floor(l.length / g.n), A = Math.max(0, Math.min(total, a - 40)), B = Math.min(total, b + 40), ligne = g.n * g.pas - g.gap;
      let cases = piste.querySelector(":scope > .cases-g");
      if (!cases && l.length) {
        cases = document.createElement("div");
        cases.className = "cases-g";
        piste.appendChild(cases);
      }
      if (cases) cases.style.cssText = `left:${g.x0 * U}px;top:${(GRILLE_HAUT + A * g.pas) * U}px;width:${ligne * U}px;height:${(B - A) * g.pas * U}px;background-size:${ligne * U}px ${g.pas * U}px;background-image:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ligne} ${g.pas}">${Array.from({ length: g.n }, (_, j) => `<rect x="${j * g.pas}" width="${g.z.c}" height="${g.z.c}" rx="${g.z.c * 0.22}" fill="rgb(128 128 128 / .16)"/>`).join("")}</svg>`)}")`;
      if (!l.length) piste.innerHTML = vide();
      peindre(nouveaux);
      return neuf;
    };
    const voir = (i, doux = true) => {
      const g = geo(), U = innerHeight / 800, y = (GRILLE_HAUT + Math.floor(i / g.n) * g.pas) * U;
      const st = Math.max(0, Math.min(boite.scrollTop, y - GRILLE_HAUT * U), y + (g.z.c + 60) * U - boite.clientHeight), d = st - boite.scrollTop;
      if (Math.abs(d) > 0.5) {
        const animations = piste.getAnimations?.() || [], reste = doux && animations.length ? new DOMMatrixReadOnly(getComputedStyle(piste).transform).m42 : 0;
        animations.forEach((a) => a.cancel());
        boite.scrollTop = st;
        if (doux) piste.animate?.([{ transform: `translateY(${reste + d}px)` }, { transform: "none" }], { duration: 220, easing: "cubic-bezier(.25,.8,.3,1)" });
      }
    };
    return { rendre, voir, tuile: (i) => rangs.get(Math.floor(i / geo().n))?.children[i % geo().n] };
  };
  const zoomer = (piste, boite, changer) => {
    const cle = (el) => (el.dataset.k ?? el.closest?.(".etagere")?.dataset.rayon ?? el.closest?.(".etagere")?.dataset.e ?? "") + ":" + (el.dataset.g ?? "titre");
    const porte2 = piste.closest?.(".bloc-etageres")?.querySelector(".grande-porte");
    const elems = () => {
      const vues = /* @__PURE__ */ new Map(), b = boite.getBoundingClientRect?.();
      const dedans = (el) => {
        const s = el.closest?.(".etagere");
        if (!s || !b) return true;
        if (!vues.has(s)) {
          const r = s.getBoundingClientRect();
          vues.set(s, r.bottom > b.top && r.top < b.bottom);
        }
        return vues.get(s);
      };
      return [...porte2 ? [porte2] : [], ...[...piste.querySelectorAll(".cel[data-g], .etagere > h3")].filter(dedans)];
    };
    const avant = new Map(elems().map((el) => {
      const s = getComputedStyle(el), c = +s.getPropertyValue("--c"), g = +s.getPropertyValue("--g");
      return [cle(el), { el, r: el.getBoundingClientRect(), cotes: c ? window.__pcvJeux.cotes(c, g) : {} }];
    }));
    for (const { el, cotes: cotes2 } of avant.values()) for (const [k, v] of Object.entries(cotes2)) el.style.setProperty("--" + k, v);
    const zone = piste.closest?.(".bloc-etageres") || boite, image = (el) => el.dataset.image + "|" + (el.dataset.format || "");
    const peintes = new Map([...zone.querySelectorAll("[data-image] > img")].map((img) => [image(img.parentElement), img]));
    changer();
    for (const n of [...piste.querySelectorAll(".cel[data-g]")]) {
      const v = avant.get(cle(n))?.el;
      if (!v || v.isConnected || !v.matches?.(".cel") || v.querySelector(".im[data-p]:not([data-appid]), [data-image]:not(:has(> img))")) continue;
      for (const a of [...v.attributes]) v.removeAttribute(a.name);
      for (const a of n.attributes) v.setAttribute(a.name, a.value);
      const c = n.querySelector("[data-c]")?.dataset.c;
      if (c) v.querySelector("[data-c]")?.setAttribute("data-c", c);
      n.replaceWith(v);
    }
    for (const el of zone.querySelectorAll("[data-image]")) {
      const img = peintes.get(image(el));
      if (img && !img.isConnected && !el.querySelector(":scope > img")) {
        el.querySelector("svg")?.remove();
        el.prepend(img);
      }
    }
    const l = elems(), la = new Set(l.map(cle));
    window.__pcvJeux.glisser?.(l, l.map((el) => avant.get(cle(el))?.r), { couche: boite, partants: [...avant].filter(([k]) => !la.has(k)).map(([, v]) => v) });
  };
  const placeCarrousel = (d, [v, ec], centre, milieu) => {
    const m = centre / 2;
    return !d ? milieu - m : d > 0 ? milieu + m + ec + (d - 1) * (v + ec) : milieu - m - ec - v + (d + 1) * (v + ec);
  };
  const carrousel = (liste, choisi, rendre, voisin = [104, 26], centre = 150, milieu = (1280 - 2 * 160) / 2) => {
    const i = liste.indexOf(choisi);
    return liste.slice(Math.max(0, i - 4), i + 5).map((g, k) => {
      const d = k - Math.min(i, 4);
      return rendre(g, d ? voisin[0] : centre, d, placeCarrousel(d, voisin, centre, milieu));
    }).join("");
  };
  const rangee = (tuiles, i, voisin = [104, 26], centre = 150, milieu = (1280 - 2 * 160) / 2) => {
    const o = window.__pcvReduit?.() ? null : window.__pcvPanneau?.(), tr = o ? ["translate", "scale", "opacity"].map((p) => `${p} ${o.duration}ms ${o.easing}`).join(", ") : "none";
    tuiles.forEach((t, k) => {
      const d = k - i, [x, e] = placeRangee(d, voisin, centre, milieu);
      if (t.style.transition !== tr) t.style.transition = tr;
      t.style.translate = x;
      t.style.scale = e;
      t.style.transformOrigin = "50% 50%";
      t.style.opacity = Math.abs(d) > 4 ? "0" : d ? ".85" : "";
      t.classList.toggle("sel", !d);
    });
  };
  const placeRangee = (d, voisin, centre, milieu) => {
    const w = d ? voisin[0] : centre;
    return [`calc(var(--u) * ${placeCarrousel(d, voisin, centre, milieu) + w / 2 - centre / 2}) 0`, String(w / centre)];
  };
  const emprunt = () => [...document.styleSheets].flatMap((f) => {
    try {
      return [...f.cssRules];
    } catch (x) {
      return [];
    }
  }).filter((r) => /^\.pcv-(touche|legende|marque-relief|choix-relief|contenu|fenetre)\b/.test(r.selectorText || "")).map((r) => r.cssText).join("\n");
  const accueil = () => [...document.querySelector("#pcv-console > style")?.sheet?.cssRules || []].filter((r) => /\.(cel|chem|zoom)\b/.test(r.selectorText || "") && !/#pcv-console[.:[]/.test(r.selectorText)).map((r) => r.cssText.replace(/body\.pcv-zone-jaquettes #pcv-console/g, ":host-context(body:not(.pcv-barre-main))").replace(/body:not\(\.pcv-zone-jaquettes\) #pcv-console/g, ":host-context(body.pcv-barre-main)").replace(/(html\[[^\]]*\]) #pcv-console/g, ":host-context($1)").replace(/#pcv-console/g, ":host")).join("\n");
  const colonne = (rubriques, choix, conteneur, pile, rendre) => {
    pile.innerHTML = rubriques.map(rendre).join("");
    const decal = Math.max(0, choix - 2) * 74 + (choix > 2 ? 30 : 0);
    pile.style.transform = decal ? `translateY(${u(-decal)})` : "";
    conteneur.className = "colonne " + (decal ? "fondu-hb" : rubriques.length > 5 ? "fondu-b" : "");
  };
  const images = ({ racine, ombre, charger, resoudre = (v) => v }) => {
    const urls = /* @__PURE__ */ new Map(), copies = /* @__PURE__ */ new Map(), peintes = /* @__PURE__ */ new WeakMap(), enCours = /* @__PURE__ */ new WeakMap(), travaux = /* @__PURE__ */ new WeakMap(), file = [];
    let actives = 0, observation = null, tour = 0, mort = false;
    const cleDe = (el) => new URL("/pcv-eshop/" + (el.dataset.format || "tuile") + "/" + encodeURIComponent(resoudre(el.dataset.image)), location.origin).href;
    const peindre = async (el, generation) => {
      const adresse = resoudre(el.dataset.image);
      if (!adresse) return;
      const cle = cleDe(el);
      const valide = () => !mort && !racine.hidden && el.isConnected && generation === tour && cleDe(el) === cle;
      if (peintes.get(el) === cle || enCours.get(el) === cle) return;
      enCours.set(el, cle);
      let copie;
      try {
        if (!copies.has(cle)) copies.set(cle, (async () => {
          const cache = await caches.open("pcv-eshop-images-v2");
          let blob2 = await (await cache.match(cle))?.blob();
          if (!blob2) {
            const d = await charger(adresse);
            if (!d?.image || mort || generation !== tour) return;
            const source = await (await fetch(d.image)).blob(), bitmap = await createImageBitmap(source);
            try {
              if (bitmap.width > 4096 || bitmap.height > 4096 || bitmap.width * bitmap.height > 8 * 1024 * 1024) return;
              const toile = document.createElement("canvas"), carre = !el.dataset.format;
              const limite = el.dataset.format === "galerie" ? 1600 : el.dataset.format === "miniature" ? 256 : 960;
              const k = Math.min(1, limite / bitmap.width);
              toile.width = carre ? 256 : Math.max(1, Math.round(bitmap.width * k));
              toile.height = carre ? 256 : Math.max(1, Math.round(bitmap.height * k));
              const ctx = toile.getContext("2d");
              if (carre) {
                const plein = Math.max(256 / bitmap.width, 256 / bitmap.height), entier = Math.min(256 / bitmap.width, 256 / bitmap.height);
                ctx.filter = "blur(10px) brightness(.8)";
                ctx.drawImage(bitmap, (256 - bitmap.width * plein) / 2 - 16, (256 - bitmap.height * plein) / 2 - 16, bitmap.width * plein + 32, bitmap.height * plein + 32);
                ctx.filter = "none";
                ctx.drawImage(bitmap, (256 - bitmap.width * entier) / 2, 256 - bitmap.height * entier, bitmap.width * entier, bitmap.height * entier);
              } else ctx.drawImage(bitmap, 0, 0, toile.width, toile.height);
              blob2 = await new Promise((r) => toile.toBlob(r, "image/webp", 0.85));
            } finally {
              bitmap.close();
            }
            if (!blob2 || mort || generation !== tour) return;
            await cache.put(cle, new Response(blob2));
            const cles = await cache.keys();
            for (const k of cles.slice(0, Math.max(0, cles.length - 400))) await cache.delete(k);
          }
          return blob2;
        })());
        copie = copies.get(cle);
        const blob = await copie;
        if (!blob) {
          if (copies.get(cle) === copie) copies.delete(cle);
          return;
        }
        if (!valide()) return;
        let url = urls.get(cle);
        if (!url) {
          url = URL.createObjectURL(blob);
          urls.set(cle, url);
        }
        const img = document.createElement("img");
        img.alt = "";
        img.src = url;
        await img.decode();
        if (!valide()) return;
        el.querySelector("svg")?.remove();
        el.querySelector("img")?.remove();
        el.prepend(img);
        peintes.set(el, cle);
      } catch (_) {
        if (copies.get(cle) === copie) copies.delete(cle);
      } finally {
        if (enCours.get(el) === cle) enCours.delete(el);
      }
    };
    const avancer = () => {
      while (actives < 2 && file.length && !mort && !racine.hidden) {
        const { el, fin } = file.shift();
        if (!el.isConnected) {
          fin?.();
          continue;
        }
        actives++;
        const cle = cleDe(el), ancien = travaux.get(el);
        const promesse = ancien?.cle === cle ? ancien.promesse : peindre(el, tour);
        travaux.set(el, { cle, promesse });
        promesse.finally(() => {
          if (travaux.get(el)?.promesse === promesse) travaux.delete(el);
          fin?.();
          actives--;
          avancer();
        });
      }
    };
    const viderFile = () => {
      for (const t of file.splice(0)) t.fin?.();
    };
    const preparer = (elements) => Promise.all([...elements].map((el) => new Promise((fin) => {
      file.push({ el, fin });
      avancer();
    })));
    const observer = (nouveaux) => {
      const utiles = new Set([...ombre.querySelectorAll("[data-image]")].map(cleDe));
      for (const [cle, url] of urls) if (!utiles.has(cle)) {
        URL.revokeObjectURL(url);
        urls.delete(cle);
      }
      for (const cle of copies.keys()) if (!utiles.has(cle)) copies.delete(cle);
      const observerElement = (el) => {
        const cle = cleDe(el);
        if (peintes.get(el) !== cle && enCours.get(el) !== cle) observation.observe(el);
      };
      if (!nouveaux || !observation) {
        observation?.disconnect();
        viderFile();
        observation = new IntersectionObserver((entrees) => {
          for (const x of entrees) if (x.isIntersecting) {
            observation.unobserve(x.target);
            file.push({ el: x.target });
          }
          avancer();
        }, { root: null, rootMargin: "100px" });
        ombre.querySelectorAll("[data-image]").forEach(observerElement);
      } else nouveaux.forEach((r) => r.querySelectorAll("[data-image]").forEach(observerElement));
    };
    const liberer = () => {
      tour++;
      observation?.disconnect();
      viderFile();
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
      copies.clear();
    };
    return { observer, preparer, liberer, detruire: () => {
      mort = true;
      liberer();
    } };
  };
  const repliTuile = (nom, pictogramme, c = Infinity) => pictogramme + (c > 60 ? `<b>${echapper(nom)}</b>` : "");
  const gestes = ({ ombre, deux = () => false, long = () => null, balayer = () => {
  } }) => {
    let appui = null;
    const annuler = () => {
      clearTimeout(appui?.minute);
      appui = null;
    };
    const bouge = (x) => {
      if (!appui) return false;
      const a = appui;
      a.dx = x.clientX - a.x;
      a.dy = x.clientY - a.y;
      a.bouge ||= Math.hypot(a.dx, a.dy) > 12 * (innerHeight / 800) || a.parents.some(([el, x2, y]) => Math.abs((el.scrollLeft || 0) - x2) + Math.abs((el.scrollTop || 0) - y) > 2);
      return a.bouge;
    };
    const ecoutes = {
      pointerdown: (x) => {
        const plusieurs = !!appui && !appui.leve && x.pointerId !== appui.id && x.pointerType === "touch";
        annuler();
        const parents = [];
        for (let el = x.target; el; el = el.parentElement) parents.push([el, el.scrollLeft || 0, el.scrollTop || 0]);
        const a = appui = { id: x.pointerId, x: x.clientX, y: x.clientY, target: x.target, parents, bouge: plusieurs, dx: 0, dy: 0 };
        const faire = long(x);
        if (faire && !plusieurs) a.minute = setTimeout(() => {
          if (appui !== a || a.bouge || deux() || bouge(x)) return;
          a.long = true;
          faire();
        }, 500);
      },
      pointermove: (x) => {
        if (bouge(x) || deux()) {
          clearTimeout(appui?.minute);
          if (appui) appui.bouge = true;
        }
      },
      pointerup: (x) => {
        clearTimeout(appui?.minute);
        if (appui) {
          appui.leve = true;
          if (bouge(x) && !appui.long && !deux()) balayer(x, appui);
        }
      },
      pointercancel: () => {
        clearTimeout(appui?.minute);
        if (appui) appui.bouge = appui.leve = true;
      },
      contextmenu: (x) => x.preventDefault()
    };
    for (const [nom, faire] of Object.entries(ecoutes)) ombre.addEventListener(nom, faire, true);
    return { annuler, accepter: (x) => {
      const refuse = deux() || appui && (appui.long || bouge(appui.leve ? { clientX: appui.x + appui.dx, clientY: appui.y + appui.dy } : x));
      annuler();
      return !refuse;
    }, detruire: () => {
      annuler();
      for (const [nom, faire] of Object.entries(ecoutes)) ombre.removeEventListener(nom, faire, true);
    } };
  };
  const lettreDe = (cle) => {
    const c = String(cle ?? "").normalize("NFD")[0]?.toUpperCase() || "#";
    return c >= "A" && c <= "Z" ? c : "#";
  };
  const railLettres = ({ rail, bulle, liste, selection, choisir, visible, main = () => false, rang, preparer = () => {
  } }) => {
    const ALPHA = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
    let doigt = false, fin = 0, cle = "";
    const annuler = () => {
      if (fin) clearTimeout(fin);
      fin = 0;
      bulle.hidden = true;
    };
    let memo = null, ls0 = [], presentes = /* @__PURE__ */ new Set();
    const lettres = () => {
      const l = liste();
      if (l !== memo) {
        memo = l;
        ls0 = l.map((g) => g.l || lettreDe(g.cle ?? g.nom));
        presentes = new Set(ls0);
      }
      return ls0;
    };
    const rendre = () => {
      rail.hidden = !visible() || !liste().length;
      if (rail.hidden) {
        annuler();
        return;
      }
      const ls = lettres(), ici = ls[selection()], nouvelle = [ici, ...presentes].join("|");
      if (cle === nouvelle) return;
      cle = nouvelle;
      rail.innerHTML = ALPHA.map((l) => `<i class="${l === ici ? "ici" : presentes.has(l) ? "" : "vide"}">${l}</i>`).join("");
    };
    const montrer = () => {
      if (rail.hidden || !liste().length) return;
      const r = rail.getBoundingClientRect(), U = innerHeight / 800, l = lettres()[selection()] || "#";
      bulle.innerHTML = `<b>${l}</b>${rang(selection() + 1, liste().length)}`;
      bulle.style.top = u(r.top / U + 8 + (ALPHA.indexOf(l) + 0.5) * (r.height / U - 16) / ALPHA.length - 22);
      bulle.hidden = false;
      clearTimeout(fin);
      if (!main() && !doigt) fin = setTimeout(() => {
        bulle.hidden = true;
      }, 900);
    };
    const lettre = (l, sens = 0) => {
      if (rail.hidden) return false;
      preparer();
      const ls = lettres(), L = ALPHA.filter((x) => presentes.has(x));
      if (!L.length) return false;
      let i = L.indexOf(l);
      if (sens) i = Math.max(0, Math.min(L.length - 1, (i < 0 ? L.findIndex((x) => x > l) : i) + sens));
      else if (i < 0) i = Math.max(0, L.findIndex((x) => x > l));
      const avant = selection();
      choisir(ls.indexOf(L[i]));
      return selection() !== avant;
    };
    const toucher = (x) => {
      const r = rail.getBoundingClientRect(), marge = 8 * innerHeight / 800;
      lettre(ALPHA[Math.max(0, Math.min(ALPHA.length - 1, Math.floor((x.clientY - r.top - marge) / (r.height - marge * 2) * ALPHA.length)))]);
      montrer();
    };
    const ecoutes = {
      pointerdown: (x) => {
        doigt = true;
        rail.setPointerCapture(x.pointerId);
        toucher(x);
      },
      pointermove: (x) => {
        if (doigt && rail.hasPointerCapture(x.pointerId)) toucher(x);
      },
      pointerup: () => {
        doigt = false;
        montrer();
      },
      pointercancel: () => {
        doigt = false;
        montrer();
      }
    };
    for (const [n, f] of Object.entries(ecoutes)) rail.addEventListener(n, f);
    return { rendre, montrer, lettre, annuler, doigt: () => doigt, detruire: () => {
      annuler();
      for (const [n, f] of Object.entries(ecoutes)) rail.removeEventListener(n, f);
    } };
  };
  const premierEcran = (boite, elements, porte2) => {
    const cadre2 = boite.getBoundingClientRect();
    return [...elements].filter((el) => {
      if (porte2?.contains(el)) return true;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > Math.max(0, cadre2.top) && r.top < Math.min(innerHeight, cadre2.bottom) && r.right > Math.max(0, cadre2.left) && r.left < Math.min(innerWidth, cadre2.right);
    });
  };
  const mentionAnglais = (visible) => visible ? `<small>${window.__pcvT("eshop.anglais")}</small>` : "";
  const VUES = {
    etageres: ".bloc-etageres > *",
    accueil: ".bloc-etageres > *",
    resultats: ".bloc-etageres > *",
    grille: ".vue-grille .piste, .vue-grille > .onglets, .vue-grille > .rail",
    fiche: ".vue-page > .carrousel, .vue-page > .carte"
  };
  VUES.page = VUES.fiche;
  const elementsDe = (v) => VUES[v] || (/^[.#]/.test(v ?? "") ? v : "");
  const debuts = /* @__PURE__ */ new WeakMap();
  const entrer = (ombre, vue, depuisPorte = false, suite = false) => {
    const d = debuts.get(ombre), t = d?.t == null ? 0 : performance.now() - d.t;
    if (!elementsDe(vue) || suite && (!d || t >= d.duree)) return;
    let reduit, o;
    for (const el of ombre.querySelectorAll(elementsDe(vue))) {
      if (!el.animate) continue;
      if (!o) {
        reduit = window.__pcvReduit();
        o = reduit ? { duration: window.__pcvRapide, easing: "ease-out" } : window.__pcvPanneau();
      }
      el.__pcvEntree?.cancel();
      el.__pcvEntree = el.animate(reduit ? { opacity: [0, 1] } : depuisPorte ? { opacity: [0, 1], transformOrigin: ["0 0", "0 0"], translate: ["-6% 0", "0 0"], scale: [0.92, 1] } : { opacity: [0, 1], translate: [`0 ${10 * innerHeight / 800}px`, "0 0"] }, o);
      if (suite && t) el.__pcvEntree.currentTime = t;
    }
    if (o && !suite) {
      const n = { duree: o.duration, t: null };
      debuts.set(ombre, n);
      requestAnimationFrame((x) => {
        n.t = x;
      });
    }
  };
  const ouvrirPorte = (ombre) => entrer(ombre, "grille", true);
  const vuesMontrees = /* @__PURE__ */ new WeakMap();
  const montrerVue = (ombre, vue) => {
    const avant = vuesMontrees.get(ombre);
    vuesMontrees.set(ombre, vue);
    if (elementsDe(avant) && elementsDe(avant) !== elementsDe(vue)) entrer(ombre, vue);
  };
  const magasin = (o) => {
    const I = window.__pcvIcones, O = window.opener || window, Tm = (k, v) => window.__pcvT?.("magasin." + k, v) || k;
    const racine = document.createElement("div");
    racine.id = o.id;
    racine.hidden = true;
    const ombre = racine.attachShadow({ mode: "open" });
    ombre.innerHTML = cadre(ETAGERES_X);
    const style = document.createElement("style");
    style.textContent = `:host([hidden]) { display: none; } :host { z-index: ${o.z ?? 8700}; }` + (o.style || "");
    ombre.appendChild(style);
    document.body.appendChild(racine);
    const $ = (s) => ombre.querySelector(s), bloc = $(".bloc-etageres"), porteEl = $(".grande-porte"), boiteE = $(".etageres"), pisteE = $(".etageres .piste"), vueG = $(".vue-grille"), boiteG = $(".grille-g"), pisteG = $(".grille-g .piste"), onglets = $(".onglets"), rail = $(".rail"), vueP = $(".vue-page"), contenu = $(".contenu"), zoomEl = $(".zoom"), pageEl = $(".page > span");
    ombre.querySelectorAll(".fleche-c span").forEach((x) => {
      x.innerHTML = I.svg("fleche");
    });
    const m = {
      racine,
      ombre,
      $,
      porte: porteEl,
      vue: "etageres",
      sel: 0,
      zE: null,
      zG: null,
      og: -1,
      surRail: false,
      onglet: null,
      lignes: [],
      fiche: null,
      voisins: [],
      rubrique: 0,
      dedans: false,
      texte: "",
      premier: null,
      auRetour: null,
      calque: null,
      actions: [],
      pages: [],
      vite: false,
      mort: false
    };
    const bord = () => window.__pcvSon?.("bord");
    const autre = () => o.autres?.[m.vue];
    const etageresVue = () => m.vue !== "grille" && m.vue !== "fiche" && !autre();
    const action = (f, page) => {
      m.pages[m.actions.length] = page;
      return m.actions.push(f) - 1;
    };
    const cleDe = (el) => el && (el.dataset?.g || el.getAttribute?.("aria-label"));
    const crans = () => {
      if (m.zE != null) return;
      const lire = (k, l) => {
        let z;
        try {
          z = JSON.parse(localStorage.getItem(k));
        } catch (x) {
        }
        return Number.isInteger(z) && z >= 0 && z < l.length ? z : Math.max(0, l.findIndex((x) => x.r === 4));
      };
      m.zE = lire(`pcv-${o.nom}-zoom`, cransEtageres());
      m.zG = lire(`pcv-${o.nom}-grille-zoom`, cransGrille());
    };
    const retenir = () => {
      try {
        localStorage.setItem(`pcv-${o.nom}-zoom`, JSON.stringify(m.zE));
        localStorage.setItem(`pcv-${o.nom}-grille-zoom`, JSON.stringify(m.zG));
      } catch (x) {
      }
    };
    const sansTexte = () => {
      if (!o.sansTexte) return;
      boiteE.classList.toggle("sans-texte", cransEtageres()[m.zE].r >= 4);
      boiteG.classList.toggle("sans-texte", cransGrille()[m.zG].r >= 4);
    };
    const zoneE = () => autre()?.zone || bloc;
    const courantE = () => zoneE().querySelector(`[data-a="${m.sel}"]`);
    const rendreEtageres = () => {
      const z = cransEtageres()[m.zE], geo = dimensionsEtagere(z), p = o.porte?.(m.vue);
      porteEl.hidden = !p;
      if (p) {
        porteEl.dataset.a = action(() => {
          p.ouvrir();
        });
        porte({ el: porteEl, liste: p.liste, tuile: o.tuile, titre: echapper(p.titre), nombre: echapper(p.nombre) });
      } else delete porteEl.dataset.a;
      pisteE.innerHTML = (o.avant?.(m.vue) || "") + (o.etageres(m.vue) || []).map((et) => {
        const l = et.items || [], t = et.tuile || o.tuile, a = `style="${cotes(z.c, z.g)}"`;
        return `<section class="etagere" data-rayon="${echapper(et.cle)}" style="height:${u(geo.hauteur)};${cotes(z.c, z.g)}">` + etagere({
          titre: echapper(et.titre),
          icone: et.icone,
          nombre: echapper(et.nombre ?? l.length),
          tuiles: l.length ? l.slice(0, geo.n - 1).map((x, i) => t(x, z.c, `${a} data-g="${echapper(et.cle + ":" + (et.id || o.cle)(x))}" data-a="${action(() => et.ouvrir(x, l, i, courantE()), et.page && (() => et.page(x, l, i)))}"`)).join("") : et.vide || "",
          suite: et.tout && (l.length || et.toujours) ? toutVoir(echapper(et.toutNombre ?? l.length), `data-g="tout-${echapper(et.cle)}" data-a="${action(et.tout, et.toutPage)}"`) : ""
        }) + `</section>`;
      }).join("") + (o.fin?.(m.vue) ? `<p class="fin">${echapper(o.fin(m.vue))}</p>` : "");
      zoomEl.innerHTML = I.zoom(cransEtageres().length, m.zE, [5, 6]);
    };
    const sauter = (d) => {
      const ici = courantE(), l = [...pisteE.querySelectorAll(".etagere")].filter((s) => s.querySelector("[data-a]")), k = l.findIndex((s) => s.contains(ici));
      const cible = k < 0 ? d > 0 ? l[0] : null : l[k + d];
      if (!cible) return bord();
      const j = k < 0 ? 0 : [...l[k].querySelectorAll("[data-a]")].indexOf(ici), t = [...cible.querySelectorAll("[data-a]")];
      m.sel = +t[Math.max(0, Math.min(t.length - 1, j))].dataset.a;
      marquer();
      legende();
    };
    const geoG = () => geometrie(cransGrille()[m.zG], innerWidth / (innerHeight / 800));
    const grilleC = grille({
      boite: boiteG,
      piste: pisteG,
      geometrie: geoG,
      liste: () => m.lignes,
      tuile: (x, c, attrs) => o.tuile(x, c, attrs),
      cle: (x) => o.cle(x),
      peindre: (l) => o.peindre?.(l),
      vide: () => `<p class="message" role="status">${echapper(o.grille.message?.() || Tm("vide"))}</p>`
    });
    let cleG = "";
    const calculer = () => {
      const x = m.lignes[m.sel], id = x && o.cle(x);
      m.lignes = o.grille.liste() || [];
      const i = id == null ? -1 : m.lignes.findIndex((y) => o.cle(y) === id);
      m.sel = i >= 0 ? i : Math.max(0, Math.min(m.sel, m.lignes.length - 1));
    };
    const rendreGrille = () => {
      const cle = [m.zG, m.onglet, m.texte, o.grille.cle?.() ?? "", geoG().n].join("|"), neuf = cle !== cleG;
      cleG = cle;
      if (neuf) grilleC.voir(m.sel, false);
      grilleC.rendre(cle);
      if (neuf) {
        dessinerOnglets();
        zoomEl.innerHTML = I.zoom(cransGrille().length, m.zG, [5, 6]);
      }
      o.grille.entete?.();
      railC.rendre();
    };
    const ogs = () => [...onglets.querySelectorAll(".og, .puce-f")];
    const marquerOnglets = () => ogs().forEach((x, k) => {
      x.classList.toggle("f", k === m.og);
      if (k === m.og || m.og < 0 && x.classList.contains("on")) x.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    });
    let cleO = "";
    const dessinerOnglets = () => {
      const l = o.grille.onglets(), r = o.grille.bandeau && m.texte.trim(), k = JSON.stringify(l) + (r || ""), p = onglets.querySelector(".puce-f");
      if (k !== cleO || !onglets.firstChild) {
        cleO = k;
        onglets.innerHTML = `<div class="og-l">${r ? `<button class="og verre recherche" data-effacer>${I.svg("recherche")}${echapper(Tm("resultats_pour", { texte: r }))}</button>` : ""}${l.map((x) => `<button class="og verre" ${x.menu ? `data-menu="${echapper(x.menu)}"` : `data-o="${echapper(x.cle)}"`}>${x.icone || ""}${echapper(x.nom)}${x.n != null ? ` <small>${echapper(x.n)}</small>` : ""}</button>`).join("")}</div>${o.grille.puce?.() || ""}`;
      } else if (p) p.outerHTML = o.grille.puce?.() || "";
      onglets.querySelectorAll(".og").forEach((x) => x.classList.toggle("on", x.dataset.o != null && x.dataset.o === m.onglet));
      marquerOnglets();
    };
    const xOnglet = () => m.og >= 0 ? o.grille.ongletX?.(ogs()[m.og]?.dataset.o) : null;
    const choisirOnglet = (cle) => {
      railC.annuler();
      m.onglet = cle;
      o.grille.choisir?.(cle);
      calculer();
      boiteG.scrollTop = 0;
      cleG = "";
      rendreGrille();
      marquer();
      legende();
    };
    const effacer = () => {
      m.texte = "";
      m.og = -1;
      const l = o.grille.onglets().filter((x) => !x.menu);
      choisirOnglet(l.some((x) => x.cle === m.onglet) ? m.onglet : l[0]?.cle);
    };
    const ouvrirGrille = (cle, depuisPorte = false) => {
      if (etageresVue()) m.retourG = cleDe(courantE());
      m.vue = "grille";
      m.og = -1;
      m.surRail = false;
      railC.annuler();
      m.onglet = cle;
      o.grille.choisir?.(cle);
      m.lignes = [];
      m.sel = 0;
      boiteG.scrollTop = 0;
      cleG = "";
      rendre();
      if (depuisPorte) ouvrirPorte(ombre);
    };
    const quitterGrille = () => {
      if (m.premier === "grille") return fermer();
      if (o.grille.effacer?.()) return;
      if (o.grille.quitter?.()) return;
      railC.annuler();
      m.vue = o.grille.retour || "etageres";
      const g = m.retourG;
      m.retourG = null;
      rendre();
      choisirCle(g);
    };
    const tuileG = () => grilleC.tuile(m.sel);
    let dernierPas = 0;
    const choisirG = (i) => {
      if (!m.lignes.length) return false;
      const avant = m.sel;
      m.sel = Math.max(0, Math.min(m.lignes.length - 1, i));
      if (m.sel === avant) return false;
      const t = performance.now();
      m.vite = t - dernierPas < 200;
      dernierPas = t;
      grilleC.voir(m.sel, !m.vite);
      grilleC.rendre(cleG);
      marquer();
      legende();
      if (m.vite || m.surRail || railC.doigt()) railC.montrer();
      if (m.sel >= m.lignes.length - 2 * geoG().n) o.grille.suite?.();
      return true;
    };
    const railC = railLettres({
      rail,
      bulle: $(".rail-bulle"),
      liste: () => m.lignes,
      selection: () => m.sel,
      choisir: (i) => choisirG(i),
      main: () => m.surRail,
      visible: () => m.vue === "grille" && !!o.grille?.rail?.visible?.(),
      preparer: () => o.grille.rail?.preparer?.(),
      rang: (n, t) => o.grille.rail?.rang?.(n, t) ?? echapper(window.__pcvT?.("biblio.rang", { n: n.toLocaleString(), t: t.toLocaleString() }))
    });
    const lettre = (d) => {
      const x = m.lignes[m.sel];
      if (!railC.lettre(lettreDe(x?.cle ?? x?.nom), d)) bord();
      else railC.montrer();
    };
    const quitterRail = () => {
      m.surRail = false;
      railC.montrer();
      marquer();
      legende();
    };
    const toucheOnglets = (b) => {
      const l = ogs();
      if (b === 11 || b === 12) {
        const k = m.og + (b === 12 ? 1 : -1);
        if (k < 0 || k >= l.length) return bord();
        m.og = k;
        if (l[k].dataset.o != null) return choisirOnglet(l[k].dataset.o);
      } else if (b === 1 && l[m.og]?.dataset.effacer != null) return effacer();
      else if (b === 1 && l[m.og]?.dataset.menu != null) return o.grille.menu?.(l[m.og].dataset.menu);
      else if (b === 3 && xOnglet()) return xOnglet()[1]();
      else if (b === 1 || b === 10 || b === 2) m.og = -1;
      else if (b === 9) return window.__pcvBarreEntrer?.(marquer);
      else if (b === 5 || b === 6) return zoomG(b === 6 ? 1 : -1);
      else return bord();
      marquer();
      legende();
    };
    const toucheGrille = (b) => {
      const n = geoG().n, x = m.lignes[m.sel];
      if (m.surRail) {
        if ([7, 8, 9, 10].includes(b)) lettre(b === 8 || b === 10 ? 1 : -1);
        else if (b === 11 || b === 1 || b === 2) quitterRail();
        else bord();
        return;
      }
      if (m.og >= 0) return toucheOnglets(b);
      if (b === 9) {
        if (m.sel < n) {
          const l = ogs(), a = l.findIndex((y) => y.classList.contains("og") && y.dataset.menu != null);
          m.og = a >= 0 ? a : Math.max(0, l.findIndex((y) => y.classList.contains("on")));
          marquer();
          legende();
        } else choisirG(m.sel - n);
      } else if (b === 10) {
        if (Math.floor(m.sel / n) < Math.floor((m.lignes.length - 1) / n)) choisirG(Math.min(m.lignes.length - 1, m.sel + n));
        else bord();
      } else if (b === 11) {
        if (m.sel % n > 0) choisirG(m.sel - 1);
        else bord();
      } else if (b === 12) {
        if (m.sel % n < n - 1 && m.sel < m.lignes.length - 1) choisirG(m.sel + 1);
        else if (!rail.hidden) {
          m.surRail = true;
          railC.montrer();
          marquer();
          legende();
        } else bord();
      } else if (b === 5 || b === 6) zoomG(b === 6 ? 1 : -1);
      else if (b === 7 || b === 8) lettre(b === 8 ? 1 : -1);
      else if (b === 1) {
        if (x) o.grille.ouvrir(x, m.sel, tuileG());
        else bord();
      } else if (b === 3) {
        if (x) (o.grille.page || o.grille.ouvrir)(x, m.sel, tuileG());
        else bord();
      } else if (b === 2) quitterGrille();
      else bord();
    };
    const rubriques = () => o.fiche.rubriques?.(m.fiche);
    const rangeeFiche = () => {
      const F = o.fiche, x = m.fiche, [voisin2 = [104, 26], centre = 150] = F.carrousel || [], car = $(".carrousel");
      const i = Math.max(0, rangFiche()), deb = Math.max(0, i - 5), vus = new Map([...car.children].map((el) => [el.dataset.k, el])), nees = [];
      const l = m.voisins.slice(deb, i + 6).map((g, k) => {
        const cle = String(o.cle(g)), d = deb + k - i;
        let el = vus.get(cle);
        vus.delete(cle);
        if (!el) {
          car.insertAdjacentHTML("beforeend", o.tuile(g, centre, `style="${cotes(centre, voisin2[1])};${((p) => `translate:${p[0]};scale:${p[1]}`)(placeRangee(d, voisin2, centre, (1280 - 2 * 160) / 2))}"`));
          el = car.lastElementChild;
          el.dataset.k = cle;
          nees.push(el);
        }
        el.dataset.d = d;
        return el;
      });
      vus.forEach((el) => el.remove());
      rangee(l, i - deb, voisin2, centre);
      if (nees.length && m.fiche && !racine.hidden) o.peindre?.(nees);
      const nom = $(".nom-jeu");
      if (nom) nom.textContent = F.titre?.(x) ?? x.nom;
      pageEl.innerHTML = F.page?.(x, i + 1, m.voisins.length) ?? "";
    };
    const rendreFiche = () => {
      const F = o.fiche, x = m.fiche;
      if (!x) return;
      clearTimeout(m.poser);
      m.poserFiche = null;
      rangeeFiche();
      const rubs = rubriques();
      let k = "";
      if (rubs) {
        m.rubrique = Math.max(0, Math.min(m.rubrique, rubs.length - 1));
        k = rubs[m.rubrique][0];
        colonne(rubs, m.rubrique, $(".colonne"), $(".colonne .pile"), ([, ic, n, couleur], i) => `<button class="onglet verre${i === m.rubrique ? " choisi" : ""}" data-r="${i}" style="--k:${couleur || "var(--pcv-cyan-plein)"}"><span class="pastille">${I.svg(ic)}</span>${echapper(n)}</button>`);
      }
      m.actions = [];
      m.pages = [];
      contenu.className = "contenu " + (F.classe?.(k) ?? "riche");
      contenu.innerHTML = F.contenu(x, k);
      if (m.sel >= m.actions.length) m.dedans = false;
      o.peindre?.(null);
      marquer();
      legende();
    };
    const ouvrirFiche = (x, voisins, depuis = null) => {
      if (!x) return;
      railC.annuler();
      if (m.vue !== "fiche") m.retour = { vue: m.vue, sel: m.sel, onglet: m.onglet, texte: m.texte, scroll: (m.vue === "grille" ? boiteG : boiteE).scrollTop, cle: etageresVue() ? cleDe(courantE()) : null, ...depuis };
      m.fiche = x;
      m.voisins = voisins?.length ? voisins : [x];
      m.vue = "fiche";
      m.rubrique = 0;
      m.dedans = !rubriques();
      m.sel = 0;
      contenu.scrollTop = 0;
      $(".carrousel").innerHTML = "";
      rendre();
      o.fiche.ouverte?.(x);
    };
    const quitterFiche = () => {
      if (o.fiche.quitter?.()) return;
      if (m.premier === "fiche") return fermer();
      const r = m.retour || { vue: "etageres", sel: 0 }, x = m.fiche;
      m.vue = r.vue;
      m.onglet = r.onglet ?? m.onglet;
      m.texte = r.texte ?? m.texte;
      m.fiche = null;
      m.sel = r.sel;
      m.dedans = false;
      if (m.vue === "grille") {
        calculer();
        const i = m.lignes.findIndex((y) => o.cle(y) === o.cle(x));
        if (i >= 0) m.sel = i;
      }
      const fin = ":" + o.cle(x);
      rendre();
      if (m.vue === "grille") {
        grilleC.voir(m.sel, false);
        grilleC.rendre(cleG);
        marquer();
      } else {
        boiteE.scrollTop = r.scroll || 0;
        choisirCle(r.cle?.endsWith(fin) ? r.cle : [...zoneE().querySelectorAll("[data-a]")].find((el) => el.dataset.g?.endsWith(fin))?.dataset.g || r.cle);
      }
    };
    const rangFiche = () => m.voisins.findIndex((y) => o.cle(y) === o.cle(m.fiche));
    const voisin = (d) => {
      const i = rangFiche() + d;
      if (!d) return false;
      if (i < 0 || i >= m.voisins.length) {
        bord();
        return false;
      }
      const x = m.fiche = m.voisins[i];
      rangeeFiche();
      clearTimeout(m.poser);
      m.poser = setTimeout(m.poserFiche = () => {
        m.poserFiche = null;
        if (m.vue !== "fiche" || m.fiche !== x) return;
        m.rubrique = 0;
        m.dedans = !rubriques();
        m.sel = 0;
        contenu.scrollTop = 0;
        rendreFiche();
        o.fiche.ouverte?.(x);
      }, window.__pcvPanneau?.().duration || 0);
      return true;
    };
    const toucheFiche = (b) => {
      const F = o.fiche;
      if (b !== 5 && b !== 6 && m.poserFiche) {
        clearTimeout(m.poser);
        m.poserFiche();
      }
      if (F.touche?.(b)) return;
      if (b === 5 || b === 6) return window.__pcvTenir(b, () => m.vue === "fiche" && voisin(b === 6 ? 1 : -1));
      if (b === 2 && m.dedans && rubriques()) {
        m.dedans = false;
        return marquer(), legende();
      }
      if (b === 2) return quitterFiche();
      if (!rubriques()) {
        if (b === 1) return m.actions[m.sel]?.();
        if ([9, 10, 11, 12].includes(b)) {
          m.sel = naviguer(contenu, "[data-a]", m.sel, b, null, () => window.__pcvBarreEntrer?.(marquer));
          marquer();
        }
        return;
      }
      const n = m.actions.length;
      if (m.dedans) {
        if (b === 11) m.dedans = false;
        else if (b === 9 || b === 10) {
          const j = m.sel + (b === 10 ? 1 : -1);
          if (j < 0 || j >= n) return bord();
          m.sel = j;
        } else if (b === 1) return m.actions[m.sel]?.();
        else return bord();
        return marquer(), legende();
      }
      const rubs = rubriques();
      if (b === 9) {
        if (m.rubrique === 0) return window.__pcvBarreEntrer?.(marquer);
        m.rubrique--;
        return rendreFiche();
      }
      if (b === 10) {
        if (m.rubrique >= rubs.length - 1) return bord();
        m.rubrique++;
        return rendreFiche();
      }
      if (b === 1 && m.rubrique === 0 && F.agir) return F.agir(m.fiche);
      if ((b === 1 || b === 12) && n) {
        m.dedans = true;
        m.sel = 0;
        return marquer(), legende();
      }
      bord();
    };
    const choisirCle = (cle) => {
      const el = cle && [...zoneE().querySelectorAll("[data-a]")].find((x) => cleDe(x) === cle);
      if (el) {
        m.sel = +el.dataset.a;
        marquer();
        legende();
      }
    };
    const rendre = () => {
      if (racine.hidden || m.mort) return;
      crans();
      sansTexte();
      const etag = etageresVue(), cle = etag ? cleDe(courantE()) : null, a = autre();
      if (m.vue !== "fiche") {
        m.actions = [];
        m.pages = [];
      }
      bloc.hidden = !etag;
      vueG.hidden = m.vue !== "grille";
      vueP.hidden = m.vue !== "fiche";
      pageEl.parentElement.hidden = m.vue !== "fiche";
      zoomEl.hidden = !etag && m.vue !== "grille";
      for (const v of Object.values(o.autres || {})) v.zone.hidden = v !== a;
      if (a) a.rendre(action);
      else if (etag) {
        rendreEtageres();
        const el = cle && [...bloc.querySelectorAll("[data-a]")].find((x) => cleDe(x) === cle);
        if (el) m.sel = +el.dataset.a;
      } else if (m.vue === "grille") {
        calculer();
        rendreGrille();
      } else rendreFiche();
      if (etag || a) o.peindre?.(null);
      legende();
      marquer();
      montrerVue(ombre, m.vue);
      o.apres?.(m.vue);
    };
    const preparerEtageres = () => {
      const v = m.vue;
      m.vue = "etageres";
      crans();
      rendreEtageres();
      m.vue = v;
    };
    const courant = () => m.vue === "grille" ? m.og >= 0 ? ogs()[m.og] : m.surRail ? rail : tuileG() : m.vue === "fiche" ? m.dedans || !rubriques() ? contenu.querySelector(`[data-a="${m.sel}"]`) : $(".colonne .choisi") : courantE();
    const marquer = () => {
      if (racine.hidden) return;
      if (m.vue === "grille") {
        marquerTuiles(pisteG, "[data-i]", m.sel, { actif: m.og < 0 && !m.surRail, nom: () => o.grille.nom?.(m.lignes[m.sel]) ?? echapper(m.lignes[m.sel]?.nom || "") });
        marquerOnglets();
        railC.rendre();
        rail.classList.toggle("f", m.surRail);
      } else if (m.vue === "fiche") {
        const dans = m.dedans || !rubriques();
        racine.classList.toggle("sur-contenu", m.dedans);
        marquerTuiles(contenu, "[data-a]", m.sel, { actif: dans, piste: pisteE, defiler: dans });
        if (dans) o.choixFiche?.(contenu.querySelectorAll("[data-a]")[m.sel]);
      } else m.sel = marquerTuiles(zoneE(), "[data-a]", m.sel, { piste: zoneE() === bloc ? pisteE : zoneE(), secours: true, defiler: true });
    };
    const plusieursOnglets = () => onglets.querySelectorAll(".og").length > 1;
    const legende = () => {
      if (racine.hidden) return;
      const lib = o.libelles?.(m) || {}, g = m.vue === "grille";
      I.poser($(".legende-bas"), window.__pcvLegendeDe(m.calque?.legende ? m.calque.legende() : m.og >= 0 && g ? [[1, Tm(ogs()[m.og]?.dataset.effacer != null ? "effacer" : "choisir")], [2, Tm("retour")], ...((x) => x ? [[3, x[0]]] : [])(xOnglet())] : [
        [1, lib.a || Tm("voir")],
        [2, Tm(g && m.texte.trim() && m.premier !== "grille" ? "effacer" : "retour")],
        ...lib.x ? [[3, lib.x]] : [],
        ...g ? [...!rail.hidden ? [[[7, 8], Tm("lettre")]] : [], ...plusieursOnglets() ? [[13, o.grille.nomOnglets?.() || Tm("rayon")]] : []] : m.vue === "fiche" ? [[[5, 6], o.fiche.voisins?.() || Tm("voisins")]] : etageresVue() && !autre() && pisteE.querySelector(".etagere [data-a]") ? [[[7, 8], Tm("etagere")]] : [],
        ...o.loupe ? [[4, Tm("rechercher")]] : [],
        ...lib.plus || []
      ]));
    };
    const zoomE = commandeZoom({
      cran: () => m.zE,
      niveaux: cransEtageres,
      barre: (n) => {
        zoomEl.innerHTML = I.zoom(cransEtageres().length, n, [5, 6]);
      },
      actif: () => etageresVue() && !racine.hidden,
      piste: pisteE,
      boite: boiteE,
      changer: (n) => {
        m.zE = n;
        retenir();
        rendre();
      }
    });
    const zoomG = commandeZoom({
      cran: () => m.zG,
      niveaux: cransGrille,
      barre: (n) => {
        zoomEl.innerHTML = I.zoom(cransGrille().length, n, [5, 6]);
      },
      actif: () => m.vue === "grille" && !racine.hidden,
      piste: pisteG,
      boite: boiteG,
      changer: (n) => {
        m.zG = n;
        retenir();
        sansTexte();
        rendreGrille();
        grilleC.voir(m.sel, false);
        grilleC.rendre(cleG);
        marquer();
      }
    });
    const toucheEtageres = (b) => {
      if ((b === 5 || b === 6) && !autre()) return zoomE(b === 6 ? 1 : -1);
      if ((b === 7 || b === 8) && !autre()) return sauter(b === 8 ? 1 : -1);
      if ([9, 10, 11, 12].includes(b)) {
        const z = zoneE(), c = o.deplacer?.(b, courantE());
        m.sel = c ? +c.dataset.a : naviguer(z === bloc ? pisteE : z, "[data-a]", m.sel, b, z === bloc && !porteEl.hidden ? porteEl : null, () => window.__pcvBarreEntrer?.(marquer));
        return marquer(), legende();
      }
      if (b === 1) return m.actions[m.sel]?.();
      if (b === 3) return (m.pages[m.sel] || m.actions[m.sel])?.();
      if (b === 2) return o.retour?.() || fermer();
      bord();
    };
    const manette = (b) => {
      if (racine.hidden) return false;
      if (m.calque) {
        m.calque.touche(b);
        return true;
      }
      if (o.touche?.(b)) return true;
      if (b === 4 && o.loupe) {
        window.__pcvBarreEntrer?.(marquer);
        window.__pcvBarreChercher?.();
        return true;
      }
      if (b === 1) window.__pcvAppui?.(courant());
      if (m.vue === "grille") toucheGrille(b);
      else if (m.vue === "fiche") toucheFiche(b);
      else toucheEtageres(b);
      return true;
    };
    (window.__pcvManette ||= {})[o.nom] = manette;
    (window.__pcvLegendes ||= {})[o.nom] = () => {
      if (!racine.hidden) legende();
    };
    (window.__pcvVue ||= {})[o.nom] = () => {
      if (racine.hidden || m.vue !== "grille" || m.calque || document.body.classList.contains("pcv-barre-main") || !plusieursOnglets()) return false;
      const l = o.grille.onglets().filter((x) => !x.menu);
      choisirOnglet(l[(l.findIndex((x) => x.cle === m.onglet) + 1) % l.length].cle);
      return true;
    };
    if (o.loupe) (window.__pcvLoupes ||= {})[o.nom] = () => racine.hidden ? null : o.loupe();
    let pinces = [];
    const gest = gestes({
      ombre,
      deux: () => pinces.some((p) => p?.deux()),
      balayer: (x, a) => o.balayer?.(x, a),
      // (l'appui long sur une tuile : ce que fait X, la page de ce qu'on touche ; sans autre page, comme A)
      long: (x) => {
        const t = x.target.closest?.(".cel[data-a], .cel[data-i]");
        if (!t) return null;
        if (t.dataset.i != null) return () => {
          m.sel = +t.dataset.i;
          marquer();
          (o.grille.page || o.grille.ouvrir)(m.lignes[m.sel], m.sel, t);
        };
        const p = m.pages[+t.dataset.a] || m.actions[+t.dataset.a];
        return p && (() => {
          m.sel = +t.dataset.a;
          marquer();
          p();
        });
      }
    });
    ombre.addEventListener("click", (x) => {
      if (!gest.accepter(x) || o.clic?.(x)) return;
      const t = x.target.closest?.("[data-a],[data-i],[data-o],[data-r],[data-d],[data-v],[data-z],[data-menu],[data-effacer]");
      if (!t) return;
      const d = t.dataset;
      if (d.z != null) (m.vue === "grille" ? zoomG : zoomE)(+d.z);
      else if (d.effacer != null) effacer();
      else if (d.menu != null) o.grille.menu?.(d.menu);
      else if (d.a != null) {
        m.sel = +d.a;
        if (m.vue === "fiche" && rubriques() && contenu.contains(t)) m.dedans = true;
        marquer();
        m.actions[m.sel]?.();
      } else if (d.i != null) {
        m.surRail = false;
        m.og = -1;
        m.sel = +d.i;
        marquer();
        o.grille.ouvrir(m.lignes[m.sel], m.sel, t);
      } else if (d.o != null) {
        m.og = -1;
        choisirOnglet(d.o);
      } else if (d.r != null) {
        if (+d.r === m.rubrique && !m.rubrique && o.fiche.agir) return o.fiche.agir(m.fiche);
        m.rubrique = +d.r;
        m.dedans = false;
        rendreFiche();
      } else if (d.d != null || d.v != null) voisin(+(d.d ?? d.v));
    });
    let attenteG = 0;
    boiteG.addEventListener("scroll", () => {
      if (m.vue !== "grille" || racine.hidden || attenteG) return;
      attenteG = requestAnimationFrame(() => {
        attenteG = 0;
        grilleC.rendre(cleG);
        marquer();
        if (boiteG.scrollTop + boiteG.clientHeight >= boiteG.scrollHeight - boiteG.clientHeight) o.grille.suite?.();
      });
    }, { passive: true });
    const redimensionner = () => {
      if (!racine.hidden) rendre();
    };
    addEventListener("resize", redimensionner);
    const montrer = (apparition = true) => {
      crans();
      racine.hidden = false;
      window.__pcvAccentAppli?.(racine);
      window.__pcvFond?.(racine);
      $(".emprunt").textContent = emprunt() + "\n" + accueil();
      if (!pinces.length) pinces = [window.__pcvJeux?.pincer?.(boiteE, (d) => zoomE(d), () => etageresVue() && !racine.hidden), window.__pcvJeux?.pincer?.(boiteG, (d) => zoomG(d), () => m.vue === "grille" && !racine.hidden)];
      if (apparition) window.__pcvBarreQuitter?.();
      rendre();
      if (apparition) window.__pcvApparition?.(racine);
    };
    const cacher = () => {
      m.calque?.fermer?.();
      m.calque = null;
      railC.annuler();
      gest.annuler();
      racine.hidden = true;
      montrerVue(ombre, "");
      o.ferme?.();
    };
    const debut = () => {
      m.vue = "etageres";
      m.sel = 0;
      m.texte = "";
      boiteE.scrollTop = boiteG.scrollTop = 0;
    };
    const fermer = (revenir = true) => {
      cacher();
      const r = m.auRetour;
      m.auRetour = null;
      if (revenir) {
        if (r) r();
        else O.__pcvAller?.(1);
      }
    };
    const detruire = () => {
      m.mort = true;
      cacher();
      railC.detruire();
      gest.detruire();
      racine.remove();
      removeEventListener("resize", redimensionner);
      for (const r of ["__pcvManette", "__pcvLegendes", "__pcvVue", "__pcvLoupes"]) delete window[r]?.[o.nom];
    };
    return Object.assign(m, {
      rendre,
      rendreGrille: () => {
        calculer();
        rendreGrille();
        marquer();
        legende();
      },
      rendreFiche,
      marquer,
      legende,
      montrer,
      cacher,
      fermer,
      detruire,
      action,
      dessinerOnglets,
      ouvrirGrille,
      choisirOnglet,
      ouvrirFiche,
      quitterFiche,
      quitterGrille,
      voisin,
      choisirCle,
      choisirG,
      rail: railC,
      tuileG,
      courant,
      ouvert: () => !racine.hidden,
      etageres: etageresVue,
      preparerEtageres,
      debut
    });
  };
  window.__pcvPresentation = { magasin, ouvrirPorte, entrer, montrerVue, cadre, geometrie, echapper, porte, cransGrille, cransEtageres, commandeZoom, marquerTuiles, cotes, dimensionsEtagere, toutVoir, etagere, deplacerEtagere, naviguer, bulleNom, grille, zoomer, carrousel, rangee, colonne, emprunt, accueil, images, repliTuile, gestes, lettreDe, railLettres, premierEcran, mentionAnglais, ETAGERES_X, LEGENDE, fondus };
})();
