(() => {
  window.__pcvSpotPassFenetreFin?.();
  const fins = [];
  window.__pcvSpotPassFenetreFin = () => fins.splice(0).forEach((f) => {
    try {
      f();
    } catch (e) {
    }
  });
  const T = (k2, v) => window.__pcvT?.(k2, v) ?? k2, I = window.__pcvIcones, son = (s) => window.__pcvSon?.(s);
  const SP = () => window.__pcvSpotPass, MB = () => window.__pcvMiiBase;
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const VOL = 1500, MONTRE = 2400, LENTE = 450, TOUR = 251, SALUT = 0.5, POSE = 4;
  const BLEU = "var(--pcv-c-spotpass)", GRIS = "var(--pcv-texte2)";
  const css = (s) => s.replace(/(-?\d*\.?\d+)u\b/g, "calc(var(--u) * $1)");
  const racine = document.createElement("div");
  racine.id = "pcv-spotpass";
  racine.hidden = true;
  racine.innerHTML = `<style>${css(`
    
    #pcv-spotpass { position: fixed; inset: 0; z-index: 8710; font-family: var(--pcv-police); color: var(--pcv-texte); user-select: none; --sp-lente: ${LENTE}ms; --sp-vol: ${VOL}ms; --sp-onde: 1.2s; }
    #pcv-spotpass[hidden] { display: none; }
    #pcv-spotpass * { box-sizing: border-box; }
    #pcv-spotpass button { all: unset; box-sizing: border-box; cursor: pointer; }
    #pcv-spotpass .legende-bas { position: absolute; right: 28u; bottom: 16u; z-index: 3; }
    html.pcv-question #pcv-spotpass .pcv-legende { visibility: visible; }
    body.pcv-dossiers-ouvert #pcv-spotpass .pcv-legende { visibility: hidden; }   
    html:has(#pcv-spotpass:not([hidden])) #pcv-bulle-nom { visibility: hidden; }   
    #pcv-spotpass .ic-t { display: inline-block; flex: none; }
    #pcv-spotpass .ic-t svg, #pcv-spotpass .sp-rond svg { width: 100%; height: 100%; display: block; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    #pcv-spotpass .face { flex: none; border-radius: 50%; background: var(--pcv-creux) center / cover no-repeat; }
    #pcv-spotpass .quoi .carte.sp { width: 900u; max-height: 88%; gap: 16u; position: relative; }
    #pcv-spotpass .quoi .carte.sp.large { width: 1000u; }
    #pcv-spotpass h2 { margin: 0; flex: 1; font-size: 26u; font-weight: 900; }
    #pcv-spotpass .sp-tete { display: flex; align-items: center; gap: 16u; }
    #pcv-spotpass .sp-rond { flex: none; width: 64u; height: 64u; padding: 13u; border-radius: 50%; background: ${BLEU}; color: #fff; box-shadow: var(--pcv-pastille-ombre); }
    
    #pcv-spotpass .etapes { display: flex; gap: 8u; }
    #pcv-spotpass .etapes span { display: flex; align-items: center; gap: 6u; padding: 5u 12u 5u 5u; border-radius: 18u; background: var(--pcv-creux); font-size: 14u; font-weight: 900; color: var(--pcv-texte2); }
    #pcv-spotpass .etapes b { width: 24u; height: 24u; border-radius: 50%; display: grid; place-items: center; background: var(--pcv-pastille); font-size: 13u; }
    #pcv-spotpass .etapes b svg { width: 70%; height: 70%; fill: none; stroke: currentColor; stroke-width: 3; }
    #pcv-spotpass .etapes .ici { background: ${BLEU}; color: #fff; }
    #pcv-spotpass .etapes .ici b { color: ${BLEU}; }
    #pcv-spotpass .etapes .fait b { background: ${BLEU}; color: #fff; }
    
    #pcv-spotpass .histoire { display: grid; grid-template-columns: 1fr 1fr; gap: 14u; }
    #pcv-spotpass .histoire > div { display: flex; align-items: center; gap: 14u; padding: 14u 18u; border-radius: 24u; background: var(--pcv-verre); box-shadow: var(--pcv-reflet); font-size: 19u; font-weight: 900; line-height: 1.3; }
    #pcv-spotpass .histoire .faces { display: flex; flex: none; }
    #pcv-spotpass .histoire .faces .face + .face { margin-left: -16u; }
    #pcv-spotpass .histoire .faces .face { box-shadow: 0 0 0 3u var(--pcv-lisere); }
    #pcv-spotpass .deux { display: grid; grid-template-columns: 1fr 1fr; gap: 14u; }
    #pcv-spotpass .deux > div { border-radius: 22u; padding: 12u 16u; background: var(--pcv-creux); }
    #pcv-spotpass .deux b { display: flex; align-items: center; gap: 8u; font-size: 17u; font-weight: 900; margin-bottom: 6u; }
    #pcv-spotpass .pastille-sp { flex: none; width: 28u; height: 28u; padding: 5u; border-radius: 50%; color: #fff; background: var(--c); display: block; }
    #pcv-spotpass .deux span { display: block; font-size: 15u; font-weight: 800; color: var(--pcv-texte2); line-height: 1.45; }
    #pcv-spotpass .sp-note { margin: 0; text-align: center; font-size: 15u; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-spotpass .sp-note.grand { font-size: 19u; color: var(--pcv-texte); }
    
    #pcv-spotpass .lignes { display: flex; flex-direction: column; gap: 10u; }
    #pcv-spotpass .lignes > div { display: flex; align-items: center; gap: 14u; padding: 12u 18u; border-radius: 22u; background: var(--pcv-creux); font-size: 19u; font-weight: 900; line-height: 1.35; }
    #pcv-spotpass .lignes .pastille-sp { width: 40u; height: 40u; padding: 8u; }
    #pcv-spotpass .lignes small { display: block; font-size: 15u; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-spotpass .lignes .val { margin-left: auto; font-size: 22u; white-space: nowrap; }
    #pcv-spotpass .lignes .btn-sec { margin-left: 6u; }
    
    #pcv-spotpass .lignes .val.long { white-space: normal; text-align: right; max-width: 45%; overflow-wrap: anywhere; }
    
    #pcv-spotpass .rencontres { display: flex; flex-direction: column; gap: 10u; max-height: 520u; overflow-y: auto; scrollbar-width: none; padding: 9u; margin: -9u; }
    #pcv-spotpass .rencontre { flex: none; display: flex; align-items: center; gap: 14u; padding: 10u 14u; border-radius: 22u; background: var(--pcv-creux); }
    #pcv-spotpass .rencontre .face { box-shadow: 0 0 0 3u var(--pcv-lisere); }
    #pcv-spotpass .rencontre .qui { flex: 1; min-width: 0; font-size: 19u; font-weight: 900; }
    #pcv-spotpass .rencontre .qui b { display: block; }
    #pcv-spotpass .rencontre small { display: block; font-size: 15u; font-weight: 800; color: var(--pcv-texte2); overflow-wrap: anywhere; }
    #pcv-spotpass .rencontre .lieu { flex: none; width: 200u; display: flex; align-items: center; gap: 10u; font-size: 16u; font-weight: 900; }
    #pcv-spotpass .rencontre .lieu > b { font-size: 30u; line-height: 1; }
    #pcv-spotpass .reglage-sp { display: flex; align-items: center; gap: 12u; padding: 8u 8u 8u 12u; border-radius: 22u; background: var(--pcv-creux); font-size: 16u; font-weight: 900; }
    #pcv-spotpass .reglage-sp > span { flex: none; color: var(--pcv-texte2); }
    #pcv-spotpass .reglage-sp b { flex: 1; min-width: 0; font-size: 18u; overflow-wrap: anywhere; }
    #pcv-spotpass .adulte { margin: 0; padding: 12u 18u; border-radius: 22u; background: var(--pcv-ambre-fond); color: var(--pcv-ambre-texte); font-size: 18u; font-weight: 900; text-align: center; }
    
    #pcv-spotpass .pseudo { display: grid; grid-template-columns: 300u 1fr; gap: 26u; align-items: center; }
    #pcv-spotpass .scene-mii { position: relative; height: 360u; border-radius: 30u; background: radial-gradient(circle at 50% 40%, var(--pcv-carte), var(--pcv-creux)); display: flex; justify-content: center; align-items: flex-end; overflow: hidden; }
    #pcv-spotpass .scene-mii img { height: 92%; display: block; animation: spRespire 2.4s ease-in-out infinite; transform-origin: 50% 100%; }
    @keyframes spRespire { 50% { transform: translateY(-4u) scaleY(1.01); } }
    #pcv-spotpass img.mii:not([src]) { visibility: hidden; }
    #pcv-spotpass .plaque { position: absolute; left: 50%; bottom: 10u; transform: translateX(-50%); display: flex; align-items: center; gap: 10u; padding: 7u 18u; border-radius: 22u;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 4px 12px rgb(from var(--pcv-ombre-c) r g b / .15); font-size: 19u; font-weight: 900; white-space: nowrap; }
    #pcv-spotpass .plaque em { font-style: normal; font-size: 13u; color: var(--pcv-sur-accent); background: var(--pcv-rouge); padding: 3u 10u; border-radius: 12u; }
    #pcv-spotpass .dessus { position: absolute; left: 0; right: 0; top: 12u; text-align: center; font-size: 15u; font-weight: 900; color: var(--pcv-texte2); }
    #pcv-spotpass .champ { display: flex; align-items: center; gap: 12u; }
    #pcv-spotpass .champ .val { flex: 1; min-width: 0; height: 70u; border-radius: 35u; padding: 0 26u; display: flex; align-items: center; background: var(--pcv-creux); font-size: 32u; font-weight: 900; letter-spacing: .01em;
      box-shadow: 0 0 0 4u var(--pcv-anneau-c), 0 0 0 9u var(--pcv-cyan-plein); position: relative; overflow: clip; overflow-clip-margin: 12u; text-overflow: ellipsis; white-space: nowrap; }
    
    #pcv-spotpass .champ .val::after { content: ""; position: absolute; inset: -11u; border-radius: 46u; border: 2u solid color-mix(in srgb, var(--pcv-cyan-plein) 70%, transparent);
      opacity: 0; animation: spAnneau 1.6s ease-in-out infinite; pointer-events: none; }
    @keyframes spAnneau { 50% { opacity: 1; } }
    #pcv-spotpass .btn-sec { display: flex; align-items: center; gap: 8u; padding: 12u 20u; border-radius: 26u; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 4u 12u rgb(from var(--pcv-ombre-c) r g b / .13); font-size: 17u; font-weight: 900; white-space: nowrap; }
    #pcv-spotpass .btn-sec .ic-t { width: 24u; height: 24u; }
    #pcv-spotpass .rappel { display: flex; align-items: center; gap: 10u; margin: 0; padding: 10u 16u; border-radius: 20u; background: var(--pcv-ambre-fond); color: var(--pcv-ambre-texte); font-size: 17u; font-weight: 900; }
    #pcv-spotpass .rappel .ic-t { width: 24u; height: 24u; }
    #pcv-spotpass .info { margin: 0; font-size: 16u; font-weight: 800; color: var(--pcv-texte2); line-height: 1.45; }
    #pcv-spotpass .col { display: flex; flex-direction: column; gap: 16u; min-width: 0; }
    #pcv-spotpass .col h3 { margin: 0; font-size: 15u; font-weight: 900; color: var(--pcv-texte2); letter-spacing: .04em; text-transform: uppercase; }   
    
    #pcv-spotpass .trajet { display: flex; align-items: center; justify-content: center; gap: 18u; padding: 18u; border-radius: 26u; background: var(--pcv-creux); }
    #pcv-spotpass .trajet .pas { display: flex; flex-direction: column; align-items: center; gap: 8u; font-size: 16u; font-weight: 900; width: 150u; text-align: center; animation: spTour 6s infinite; }
    #pcv-spotpass .trajet .pas > i { width: 72u; height: 72u; padding: 16u; border-radius: 50%; background: var(--c); color: #fff; box-shadow: var(--pcv-pastille-ombre); }
    #pcv-spotpass .trajet .vers { width: 40u; height: 40u; color: var(--pcv-texte2); }
    #pcv-spotpass .trajet .pas:nth-of-type(2) { animation-delay: -4s; }
    #pcv-spotpass .trajet .pas:nth-of-type(3) { animation-delay: -2s; }
    @keyframes spTour { 0%, 30% { transform: scale(1.12); } 34%, 100% { transform: none; opacity: .55; } }
    #pcv-spotpass .silhouette { width: 150u; height: 150u; padding: 30u; border-radius: 50%; background: var(--pcv-creux); color: var(--pcv-texte2); margin: 0 auto; opacity: .7; border: 4u dashed var(--pcv-lisere); }
    #pcv-spotpass .silhouette svg { width: 100%; height: 100%; display: block; }
    
    #pcv-spotpass .envoi { position: relative; flex: none; height: 330u; border-radius: 30u; background: radial-gradient(circle at 35% 55%, color-mix(in srgb, ${BLEU} 16%, var(--pcv-carte)), var(--pcv-creux)); overflow: hidden; }
    #pcv-spotpass .envoi .mii { position: absolute; left: 150u; bottom: 0; height: 300u; }
    #pcv-spotpass .ondes { position: absolute; left: 300u; top: 40u; width: 150u; height: 150u; color: ${BLEU}; }
    #pcv-spotpass .ondes path { fill: none; stroke: currentColor; stroke-width: 2.3; stroke-linecap: round; animation: spOnde var(--sp-onde) ease-in-out infinite; }
    #pcv-spotpass .ondes path + path { animation-delay: calc(var(--sp-onde) / 4); }
    @keyframes spOnde { 0%, 100% { opacity: .25; } 40% { opacity: 1; } }
    #pcv-spotpass .cv { position: absolute; left: 470u; top: 70u; width: 250u; display: flex; align-items: center; gap: 12u; padding: 12u 16u; border-radius: 20u;
      background: linear-gradient(180deg, #fff, #eef3f8); color: #2b3442; box-shadow: 0 8u 20u rgba(30,80,150,.25), inset 0 0 0 3u color-mix(in srgb, ${BLEU} 50%, #fff);
      transform: rotate(-6deg); font-size: 15u; font-weight: 800; line-height: 1.3; animation: spVol var(--sp-vol) ease-in infinite; }
    #pcv-spotpass .cv > span { min-width: 0; }
    #pcv-spotpass .cv b { display: block; font-size: 20u; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #pcv-spotpass .cv small { display: block; color: #6b7788; }
    @keyframes spVol { 0% { transform: translate(-260u, 120u) scale(.4) rotate(0); opacity: 0; } 15% { opacity: 1; transform: translate(-230u, 100u) scale(.55) rotate(-3deg); }
      45% { transform: translate(-40u, 10u) scale(.9) rotate(-6deg); opacity: 1; } 100% { transform: translate(340u, -200u) scale(.3) rotate(-14deg); opacity: 0; } }
    
    #pcv-spotpass .envoi + .textes { display: flex; flex-direction: column; gap: 16u; min-height: 93u; }
    #pcv-spotpass .titre-envoi { text-align: center; font-size: 30u; font-weight: 900; margin: 0; }
    #pcv-spotpass .sous-envoi { text-align: center; font-size: 17u; font-weight: 800; color: var(--pcv-texte2); margin: -8u 0 0; }
    #pcv-spotpass .points i { display: inline-block; width: 9u; height: 9u; margin-left: 5u; border-radius: 50%; background: ${BLEU}; vertical-align: middle; animation: spOnde var(--sp-onde) infinite; }
    #pcv-spotpass .points i:nth-child(2) { animation-delay: calc(var(--sp-onde) / 4); } #pcv-spotpass .points i:nth-child(3) { animation-delay: calc(var(--sp-onde) / 2); }
    #pcv-spotpass .coche { position: absolute; left: 520u; top: 80u; width: 140u; height: 140u; padding: 30u; border-radius: 50%; background: ${BLEU}; color: #fff;
      box-shadow: 0 0 0 8u color-mix(in srgb, ${BLEU} 25%, transparent), 0 10u 26u rgba(20,90,200,.3); animation: spCoche var(--sp-lente) var(--pcv-panneau-courbe) both; }
    #pcv-spotpass .coche svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 3.4; stroke-linecap: round; stroke-linejoin: round; }
    @keyframes spCoche { from { transform: scale(0); } }
    #pcv-spotpass .ligne-etat { display: flex; justify-content: center; gap: 12u; }
    #pcv-spotpass .ligne-etat > span { display: flex; align-items: center; gap: 8u; padding: 8u 16u; border-radius: 20u; background: var(--pcv-creux); font-size: 16u; font-weight: 900; white-space: nowrap; }
    #pcv-spotpass .ligne-etat .ic-t { width: 20u; height: 20u; color: ${BLEU}; }
    
    #pcv-spotpass .carte.parti :is(.titre-envoi, .ligne-etat, .boutons) { animation: spFondu .12s ease-out both; }
    @keyframes spFondu { from { opacity: 0; } }
    
    #pcv-spotpass .envoi.rate { background: var(--pcv-creux); height: 250u; }
    #pcv-spotpass .envoi.rate .mii { height: 235u; filter: saturate(.4); opacity: .85; }
    #pcv-spotpass .envoi.rate .ondes { color: var(--pcv-texte2); opacity: .45; }
    #pcv-spotpass .envoi.rate .ondes path { animation: none; }
    #pcv-spotpass .coupure { position: absolute; left: 470u; top: 70u; width: 150u; height: 150u; color: var(--pcv-texte2); }
    #pcv-spotpass .coupure svg { width: 100%; height: 100%; display: block; }
    #pcv-spotpass .minuteur { position: absolute; right: 50u; top: 50%; transform: translateY(-50%); width: 150u; height: 150u; }
    #pcv-spotpass .minuteur svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    #pcv-spotpass .minuteur circle { fill: none; stroke-width: 7; }
    #pcv-spotpass .minuteur .fond { stroke: var(--pcv-lisere); }
    #pcv-spotpass .minuteur .plein { stroke: var(--pcv-ambre-texte); stroke-linecap: round; stroke-dasharray: ${TOUR}; transition: stroke-dashoffset 1s linear; }
    #pcv-spotpass .minuteur b { position: absolute; inset: 0; display: grid; place-items: center; font-size: 26u; font-weight: 900; color: var(--pcv-ambre-texte); text-align: center; line-height: 1.05; }
    #pcv-spotpass .minuteur b small { display: block; font-size: 13u; }
    #pcv-spotpass .minuteur em { font-style: normal; }
    #pcv-spotpass .pas-encore { display: flex; align-items: center; justify-content: center; gap: 10u; margin: 0; padding: 10u 16u; border-radius: 20u; background: var(--pcv-ambre-fond); color: var(--pcv-ambre-texte); font-size: 18u; font-weight: 900; }
    #pcv-spotpass .pas-encore .ic-t { width: 26u; height: 26u; }
    
    #pcv-spotpass .diode-tete { display: flex; align-items: center; gap: 8u; padding: 6u 14u; border-radius: 18u; background: color-mix(in srgb, ${BLEU} 14%, transparent); color: ${BLEU}; font-size: 16u; font-weight: 900; }
    #pcv-spotpass .diode-tete i { width: 12u; height: 12u; border-radius: 50%; background: ${BLEU}; box-shadow: 0 0 8u ${BLEU}; }
    
    @media (prefers-reduced-motion: reduce) {
      #pcv-spotpass :is(.cv, .ondes path, .points i, .coche, .scene-mii img, .champ .val::after, .trajet .pas) { animation: none !important; }
      #pcv-spotpass .cv { transform: none; left: 480u; top: 110u; }
      #pcv-spotpass .ondes path { opacity: .8; } }
  `)}</style><div class="quoi"><div class="carte sp pcv-fenetre"></div></div><div class="pcv-legende legende-bas"></div>`;
  document.body.appendChild(racine);
  fins.push(() => racine.remove());
  const carte = racine.querySelector(".carte"), leg = racine.querySelector(".legende-bas");
  const ic = (n) => `<span class="ic-t">${I.svg(n)}</span>`;
  const pa = (n, c) => `<i class="pastille-sp ic-t" style="--c:${c}">${I.svg(n)}</i>`;
  const face = (url, d) => `<span class="face" style="width:calc(var(--u) * ${d});height:calc(var(--u) * ${d})${url ? `;background-image:url('${url}')` : ""}"></span>`;
  const ONDES = '<svg class="ondes" viewBox="0 0 24 24"><path d="M3 5.5a8 8 0 0 1 0 11.3"/><path d="M7.5 1.5a14 14 0 0 1 0 19.3"/></svg>';
  const teteMoi = () => window.__pcvTeteURL || "";
  const autres = [];
  const portrait = { cle: null, url: "" };
  const peindre = () => {
    const moi = MB()?.moi?.(), pose = SP()?.pose?.() || "", cle = moi ? moi.id + ":" + moi.donnees + ":" + pose : "";
    if (portrait.cle === cle && autres.length) return;
    portrait.cle = cle;
    portrait.url = "";
    window.__pcvVraisMii?.charger?.().then(async (M) => {
      const neufs = !autres.length;
      if (neufs) autres.push(...(await Promise.all(M.habitantsDefaut().slice(0, 2).map((h) => window.__pcvTeteMii?.(h.donnees).catch(() => "")))).filter(Boolean));
      if (moi && portrait.cle === cle) {
        const T3 = window.THREE, cv = document.createElement("canvas");
        cv.width = 500;
        cv.height = 640;
        const rendu = new T3.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true });
        let a = null;
        try {
          rendu.setClearColor(0, 0);
          const scene = new T3.Scene();
          M.eclairer(scene);
          a = M.creer({ donnees: moi.donnees, pantalon: moi.pantalon, rendu });
          scene.add(a.objet);
          a.jouer(pose || "saluer", { redemarrer: true });
          for (let t = 0; t < (pose ? POSE : SALUT); t += 0.1) a.maj(Math.min(0.1, (pose ? POSE : SALUT) - t));
          const b = new T3.Box3().setFromObject(a.objet), H = (b.max.y - b.min.y) / 0.79, y = b.min.y - 0.06 * H + H / 2, cam = new T3.PerspectiveCamera(22, cv.width / cv.height, 0.05, 50);
          const c = b.getCenter(new T3.Vector3());
          cam.position.set(c.x, y, c.z + H / 2 / Math.tan(cam.fov * Math.PI / 360));
          cam.lookAt(c.x, y, c.z);
          rendu.render(scene, cam);
          portrait.url = cv.toDataURL("image/png");
        } finally {
          a?.liberer();
          rendu.dispose();
          rendu.forceContextLoss();
        }
      }
      racine.querySelectorAll("img.mii").forEach((i) => {
        if (portrait.url) i.src = portrait.url;
      });
      if (neufs && autres.length && !racine.hidden && ecran === "explication") montrer(ecran, false);
    }).catch((e) => console.warn("SpotPass : dessin des Mii", e));
  };
  const mii = (cl = "mii") => `<img class="${cl}" alt=""${portrait.url ? ` src="${portrait.url}"` : ""}>`;
  const etapes = (n) => `<div class="etapes">${["accord", "pseudo", "envoi"].map((t, i) => `<span class="${i + 1 === n ? "ici" : i + 1 < n ? "fait" : ""}"><b>${i + 1 < n ? I.svg("coche") : i + 1}</b>${T("spotpass.f.etape." + t)}</span>`).join("")}</div>`;
  const tete = (titre, n, extra = "") => `<div class="sp-tete"><span class="sp-rond">${I.svg("spotpass")}</span><h2>${titre}</h2>${extra}${n ? etapes(n) : ""}</div>`;
  const bouton = (a, texte, oui, court) => `<button data-a="${a}"${oui ? ' class="oui"' : ""}${court ? ` data-l="${court}"` : ""}>${texte}</button>`;
  const boutons = (...l) => `<div class="boutons">${l.join("")}</div>`;
  const cite = (t) => T("spotpass.f.citation", { t: esc(t) });
  const heure = (t) => new Date(t).toLocaleTimeString(window.__pcvLocale?.() || void 0, { hour: "2-digit", minute: "2-digit" });
  let ecran = null, phase = 0, motif = null, debut = 0, k = 0, touches = {}, attente = 0, compte = 0;
  const E = {
    // 1. l'explication validée (maquette d'annonce du 29/10)
    explication: () => ({ b: ["fermer", T("touche.retour")], html: `${tete(T("spotpass.f.explication.titre"))}
      <div class="histoire"><div><span class="faces">${autres.map((u2) => face(u2, 66)).join("")}</span>${T("spotpass.f.visite")}</div>
        <div><span class="faces">${face(teteMoi(), 66)}</span>${T("spotpass.f.bonjour")}</div></div>
      <div class="deux"><div><b>${pa("coche", BLEU)}${T("spotpass.f.part")}</b><span>${T("spotpass.f.part.texte")}</span></div>
        <div><b>${pa("cadenas", GRIS)}${T("spotpass.f.jamais")}</b><span>${T("spotpass.f.jamais.texte")}</span></div></div>
      <p class="sp-note">${T("spotpass.f.coupe")}</p>${boutons(bouton("accord", T("spotpass.activer"), true), bouton("fermer", T("notifs.plus_tard")))}` }),
    // 2. l'accord, en trois lignes, et la phrase des moins de 15 ans
    accord: () => ({ b: ["fermer", T("spotpass.non_merci")], html: `${tete(T("spotpass.f.accord.titre"), 1)}
      <div class="lignes">${[["spotpass", BLEU, "envoie"], ["cadenas", GRIS, "jamais"], ["sortie", GRIS, "arreter"]].map(([n, c, t]) => `<div>${pa(n, c)}<span>${T("spotpass.f.accord." + t)}<small>${T("spotpass.f.accord." + t + ".detail")}</small></span></div>`).join("")}</div>
      <p class="adulte">${T("spotpass.f.adulte")}</p>${boutons(bouton("pseudo", T("spotpass.f.oui"), true), bouton("fermer", T("spotpass.non_merci")))}` }),
    // 3. le pseudo, dans la fenêtre, sur le Mii principal (tiré au hasard la première fois, steamu.js spPseudo)
    pseudo: () => {
      const moi = MB().moi(), plusieurs = MB().liste().length > 1;
      return {
        classe: "large",
        b: ["accord", T("touche.retour")],
        touches: { 4: ["changer", T("spotpass.f.changer_pseudo")], ...plusieurs ? { 3: ["autreMii", T("spotpass.f.autre_mii.court")] } : {} },
        html: `${tete(T("spotpass.pseudo.titre"), 2)}
      <div class="pseudo"><div class="scene-mii"><span class="dessus">${T("spotpass.f.mii_principal")}</span>${mii()}<span class="plaque">${esc(moi.nom)}<em>${T("spotpass.f.cest_toi")}</em></span></div>
        <div class="col"><h3>${T("spotpass.f.verront")}</h3>
          <div class="champ"><span class="val">${esc(SP().pseudo())}</span><button class="btn-sec" data-a="changer">${ic("clavier")}${T("spotpass.f.changer")}</button></div>
          <p class="rappel">${ic("aide")}${motif ? T("spotpass.erreur." + motif) : T("spotpass.f.vrai_prenom")}</p>
          <p class="info">${T("spotpass.f.seul", { nom: esc(moi.nom) })}</p>
          ${plusieurs ? `<button class="btn-sec" data-a="autreMii" style="align-self:flex-start">${ic("miimaker")}${T("spotpass.f.autre_mii")}</button>` : ""}</div></div>
      ${boutons(bouton("envoyer", T("spotpass.f.envoyer"), true))}`
      };
    },
    // 3. sans Mii principal : on le crée au Mii Maker, retour tout seul
    sansMii: () => ({ b: ["fermer", T("touche.retour")], html: `${tete(T("spotpass.f.sans_mii.titre"), 2)}
      <div class="silhouette">${I.svg("silhouette")}</div>
      <p class="sp-note grand">${T("spotpass.f.sans_mii.texte")}<br>${T("spotpass.f.sans_mii.texte2")}</p>
      <div class="trajet">${[["spotpass", BLEU, T("spotpass.nom")], ["miimaker", "var(--pcv-cyan-plein)", T("steamu.appli.mii")], ["clavier", BLEU, T("spotpass.f.ton_pseudo")]].map(([n, c, t]) => `<span class="pas" style="--c:${c}"><i class="ic-t">${I.svg(n)}</i>${t}</span>`).join(`<span class="vers ic-t">${I.svg("fleche")}</span>`)}</div>
      ${boutons(bouton("creer", T("spotpass.f.creer"), true), bouton("fermer", T("notifs.plus_tard")))}` }),
    // 4. l'envoi (phase 1), puis « C'est parti ! » (phase 2) sur la vraie réponse
    envoi: () => {
      const p = esc(SP().pseudo());
      if (phase === 1) return { b: ["fermer", T("spotpass.f.fermer")], html: `${tete(T("spotpass.nom"), 3)}
        <div class="envoi">${mii()}${ONDES}<div class="cv">${face(teteMoi(), 58)}<span><b>${p}</b>${cite(SP().phrase())}<small>${esc(SP().region())}</small></span></div></div>
        <div class="textes"><p class="titre-envoi">${T("spotpass.f.envoi")}<span class="points"><i></i><i></i><i></i></span></p><p class="sous-envoi">${T("spotpass.f.envoi.texte", { nom: p })}</p></div>
        ${boutons(bouton("fermer", T("spotpass.f.fermer")))}` };
      return { classe: "parti", b: ["ranger", T("spotpass.f.super")], html: `${tete(T("spotpass.nom"), 3)}
        <div class="envoi">${mii()}${ONDES}<span class="coche">${I.svg("coche")}</span></div>
        <div class="textes"><p class="titre-envoi">${T("spotpass.f.parti")}</p>
        <div class="ligne-etat"><span>${ic("spotpass")}${T("spotpass.f.active")}</span><span>${ic("miimaker")}${p}</span><span>${ic("horloge")}${T("spotpass.f.envoyee", { heure: heure(SP().etat().envoi || Date.now()) })}</span></div></div>
        ${boutons(bouton("ranger", T("spotpass.f.super"), true))}` };
    },
    // 4. échec : rien n'est dit « fait » ; faute de réseau, nouvel essai tout seul (steamu.js), le rond reste en attente
    echec: () => {
      const reseau = motif === "reseau", t = T("spotpass.erreur." + motif);
      return { b: ["fermer", T("spotpass.f.fermer")], touches: {}, html: `${tete(T("spotpass.nom"), 3)}
        <div class="envoi rate">${mii()}${ONDES}<span class="coupure">${I.svg("wifi", { niveau: 0 })}</span>
          ${reseau ? `<span class="minuteur"><svg viewBox="0 0 90 90"><circle class="fond" cx="45" cy="45" r="40"/><circle class="plein" cx="45" cy="45" r="40"/></svg><b><span><em></em><small>${T("spotpass.f.nouvel_essai")}</small></span></b></span>` : ""}</div>
        <p class="titre-envoi">${T("spotpass.f.echec")}</p>
        <p class="sous-envoi">${reseau ? T("spotpass.f.echec.reseau") : t.startsWith("spotpass.") ? T("spotpass.erreur.autre") : t}</p>
        <p class="pas-encore">${ic("horloge")}${T("spotpass.f.pas_encore")}</p>
        ${boutons(bouton("reessayer", T("spotpass.f.reessayer"), true, T("spotpass.f.reessayer.court")), bouton("fermer", T("spotpass.f.fermer")))}` };
    }
  };
  const focs = () => [...carte.querySelectorAll("[data-a]")];
  const marquer = () => {
    const l = focs();
    l.forEach((x, i) => x.classList.toggle("foc", i === k));
    l[k]?.scrollIntoView?.({ block: "nearest" });
    const a = l[k]?.dataset.l || l[k]?.textContent.trim(), meme = a === touches[2][1], oui = l[k]?.classList.contains("oui");
    leg.innerHTML = I.legende([...a && (!meme || oui) ? [[1, a]] : [], ...Object.entries(touches).filter(([t]) => t !== "2").map(([t, [, x]]) => [+t, x]), ...meme && oui ? [] : [[2, touches[2][1]]]]);
  };
  const montrer = (nom, anim = true, garder = false) => {
    const avant = ecran === nom && garder ? k : -1;
    ecran = nom;
    const s = E[nom]();
    carte.className = "carte sp pcv-fenetre" + (s.classe ? " " + s.classe : "");
    carte.innerHTML = s.html;
    touches = { ...s.touches, 2: s.b };
    k = avant >= 0 ? Math.min(avant, focs().length - 1) : nom === "explication" || nom === "accord" ? Math.max(0, focs().findIndex((x) => x.dataset.a === "fermer")) : Math.max(0, focs().findIndex((x) => x.classList.contains("oui")));
    marquer();
    if (anim) window.__pcvApparition(carte);
    clearInterval(compte);
    if (nom === "echec") {
      compter();
      compte = setInterval(compter, 1e3);
    }
    window.__pcvSpotPassRond?.();
  };
  const compter = () => {
    const m = racine.querySelector(".minuteur");
    if (!m) return;
    const t = SP().prochainEssai(), reste = t ? Math.max(0, t - Date.now()) : 0;
    m.hidden = !t;
    m.querySelector("em").textContent = T("spotpass.f.secondes", { n: Math.ceil(reste / 1e3) });
    m.querySelector(".plein").style.strokeDashoffset = TOUR * (1 - reste / SP().essai);
  };
  const cacher = () => {
    clearTimeout(attente);
    clearInterval(compte);
    phase = 0;
    racine.hidden = true;
    if (!window.__pcvDossiers?.modal?.()) document.documentElement.classList.remove("pcv-question");
    window.__pcvSpotPassRond?.();
  };
  const fermer = (bruit = true) => {
    if (racine.hidden) return;
    window.__pcvApparition(racine, true, ".carte");
    cacher();
    if (bruit) son(bruit === true ? "retour" : bruit);
  };
  const ranger = () => {
    clearTimeout(attente);
    if (racine.hidden) return;
    phase = 0;
    window.__pcvSpotPassRond?.();
    const r = document.querySelector("#pcv-barre .rond.sp:not([hidden])")?.getBoundingClientRect(), c = carte.getBoundingClientRect();
    if (!r?.width || window.__pcvReduit()) return fermer(false);
    carte.style.transformOrigin = `${r.left + r.width / 2 - c.left}px ${r.top + r.height / 2 - c.top}px`;
    const o = { duration: LENTE, easing: "ease-in", fill: "forwards" }, voile = racine.querySelector(".quoi");
    const a = [carte.animate({ scale: [1, 0.05], opacity: [1, 0] }, o), voile.animate({ opacity: [1, 0] }, o), leg.animate({ opacity: [1, 0] }, o)];
    a[0].onfinish = () => {
      cacher();
      a.forEach((x) => x.cancel());
      carte.style.transformOrigin = "";
    };
  };
  const envoyer = () => {
    if (!MB()?.moi?.()) return montrer("sansMii");
    phase = 1;
    debut = Date.now();
    motif = null;
    montrer("envoi");
    son("dialogue");
    SP().activer();
  };
  const envoi = (erreur) => {
    if (racine.hidden || !(ecran === "envoi" && phase === 1 || ecran === "echec")) return false;
    clearTimeout(attente);
    attente = setTimeout(
      () => {
        if (erreur === null) {
          phase = 2;
          montrer("envoi", false);
          son("gagne");
          attente = setTimeout(ranger, MONTRE);
        } else {
          phase = 0;
          motif = erreur;
          montrer(erreur === "sans_mii" ? "sansMii" : erreur === "pseudo" || erreur === "phrase" ? "pseudo" : "echec", false);
          son("erreur");
        }
      },
      Math.max(0, debut + VOL - Date.now())
    );
    return true;
  };
  const agir = (a) => a.startsWith("signaler:") ? SP().mii()[+a.slice(9)] && SP().signaler(SP().mii()[+a.slice(9)]) : {
    fermer: () => fermer(),
    ranger,
    accord: () => montrer("accord"),
    envoyer,
    reessayer: envoyer,
    pseudo: () => {
      motif = null;
      montrer(MB()?.moi?.() ? "pseudo" : "sansMii");
    },
    changer: () => {
      motif = null;
      SP().ecrire("pseudo");
    },
    // un autre Mii principal : la liste déroulante commune ; c'est lui qui part (et qui est « moi » partout)
    autreMii: () => {
      const l = MB().liste(), moi = MB().moi();
      if (!window.__pcvDossiers?.liste?.({
        ailleurs: true,
        titre: T("spotpass.f.autre_mii"),
        choix: l.map((m) => m.nom),
        v: l.findIndex((m) => m.id === moi?.id),
        ok: (i) => {
          MB().definirMoi(l[i].id);
          peindre();
          montrer("pseudo", false);
        }
      })) son("bord");
    },
    // le Mii Maker, puis retour ici : le Mii enregistré devient le Mii principal s'il n'y en avait pas
    creer: () => {
      cacher();
      window.__pcvMiiMaker?.ouvrir?.().then((id) => {
        if (!MB()?.moi?.() && id) MB().definirMoi(id);
        ouvrir(MB()?.moi?.() ? "pseudo" : "sansMii");
      });
    }
  }[a]?.();
  carte.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (b) agir(b.dataset.a);
  });
  const poser = () => {
    const p = document.getElementById("pcv-steamu"), ici = p?.getClientRects().length ? document.body : document.querySelector(".BasicUI") || document.body;
    if (racine.parentElement !== ici) ici.append(racine);
  };
  const ouvrir = (nom) => {
    if (!SP() || !MB() || !window.__pcvNintendo?.mii) return false;
    if (!nom || nom === "actif" || nom === "rencontres") {
      if (!window.__pcvSpotPassPage) return false;
      window.__pcvBarreQuitter?.();
      fermer();
      return window.__pcvSpotPassPage.ouvrir();
    }
    window.__pcvBarreQuitter?.();
    peindre();
    if (racine.hidden) poser();
    const entre = racine.hidden, etat = SP().etatRond();
    racine.hidden = false;
    document.documentElement.classList.add("pcv-question");
    const o = window.__pcvOrdre;
    if (Array.isArray(o) && o[0] !== "spotpass") {
      if (o.includes("spotpass")) o.splice(o.indexOf("spotpass"), 1);
      o.unshift("spotpass");
    }
    motif = etat === "attente" && SP().etat().erreur || null;
    phase = 0;
    montrer(nom, !entre);
    if (entre) window.__pcvApparition(racine, false, ".carte");
    return true;
  };
  (window.__pcvManette ||= {}).spotpass = (b) => {
    if (racine.hidden || window.__pcvDossiers?.modal?.()) return false;
    const l = focs();
    if (b >= 9 && b <= 12) {
      const n = k + (b === 10 || b === 12 ? 1 : -1);
      if (n < 0 || n >= l.length) son("bord");
      else {
        k = n;
        marquer();
        son("bouge");
      }
    } else if (b === 1) {
      window.__pcvAppui?.(l[k]);
      if (l[k]) agir(l[k].dataset.a);
    } else if (touches[b]) agir(touches[b][0]);
    else son("bord");
    return true;
  };
  fins.push(() => {
    cacher();
    delete window.__pcvManette?.spotpass;
    const o = window.__pcvOrdre;
    if (Array.isArray(o) && o.includes("spotpass")) o.splice(o.indexOf("spotpass"), 1);
  });
  window.__pcvSpotPassFenetre = {
    ouvrir,
    fermer,
    envoi,
    ouvert: () => !racine.hidden,
    ecran: () => !racine.hidden && ecran,
    envoiEnCours: () => !racine.hidden && ecran === "envoi" && phase === 1,
    maj: () => {
      if (racine.hidden) return;
      if (ecran === "actif" && !SP()?.actif()) return fermer(false);
      if (ecran === "pseudo") montrer(ecran, false, true);
    }
  };
  fins.push(() => {
    delete window.__pcvSpotPassFenetre;
  });
  const RUBRIQUES = [["miimaker.ma_carte", "silhouette"], ["miimaker.rencontres", "amis"], ["spotpass.page.reglages", "reglages"]];
  const trait = (n) => I.svg(n, { attrs: 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"' });
  const ligneSp = (id, ic2, nom, detail = "", o = {}) => `<button ${id ? `data-sp="${id}"` : "disabled"} class="bouton confid-ligne${o.oui ? " oui" : ""}"><i class="pastille" style="--c:${o.c || BLEU}">${ic2}</i><span>${esc(nom)}${detail ? `<small>${esc(detail)}</small>` : ""}</span>${o.inter ? '<i class="inter"></i>' : ""}</button>`;
  const tetes = /* @__PURE__ */ new Map();
  window.__pcvSpotPassVue = {
    colonne: (r, a = "sp:") => RUBRIQUES.map(([k2, ic2], i) => window.__pcvOnglet(a + i, r === i, BLEU, ic2, esc(T(k2)))).join(""),
    contenu: (r) => {
      const sp = SP();
      if (!sp) return "";
      if (r === 0) return ligneSp("pseudo", trait("crayon"), T("spotpass.pseudo"), sp.pseudo()) + ligneSp("phrase", trait("paroles"), T("spotpass.phrase"), `${sp.phrase()} (${sp.phrase().length} / ${sp.max.phrase})`) + ligneSp("pose", trait("perso"), T("spotpass.pose_spotpass"), sp.nomPose(sp.pose())) + ligneSp("pays", trait("monde"), T("miimaker.pays"), sp.drapeau(sp.codeRegion()) + " " + sp.region());
      if (r === 1) {
        if (sp.neuf()) sp.vu();
        return sp.mii().length ? sp.mii().map((m, i) => ligneSp("rencontre:" + i, '<img hidden alt="">', m.pseudo, `${sp.drapeau(m.region)} ${sp.nomRegion(m.region)} : ${T("spotpass.f.citation", { t: m.phrase })}`, { c: "var(--pcv-pastille)" })).join("") : `<p class="note">${esc(T(sp.actif() ? "spotpass.f.rencontres.aucun" : "spotpass.f.pas_encore"))}</p>`;
      }
      const e = sp.etat(), oui = sp.actif();
      return ligneSp("activation", trait("spotpass"), T("spotpass.nom"), oui ? T("spotpass.aide.oui", { nom: sp.pseudo(), region: sp.region() }) : T("spotpass.aide"), { inter: true, oui }) + (e.erreur ? `<p class="note">${esc(T("spotpass.erreur." + e.erreur))}</p>` : "") + (oui && !e.carte ? ligneSp("reessayer", trait("mise-a-jour"), T("spotpass.f.reessayer")) : "") + ligneSp("", trait("horloge"), T("spotpass.f.dernier"), e.envoi ? new Date(e.envoi).toLocaleString(window.__pcvLocale?.()) : T("spotpass.page.jamais")) + (oui ? ligneSp("couper", trait("supprimer"), T("spotpass.couper"), T("spotpass.couper.texte"), { c: GRIS }) : `<p class="note">${esc(T("spotpass.f.adulte"))}</p>`);
    },
    // les actions des lignes (apres : de quoi se redessiner quand une question commune a répondu)
    lier: (C, apres) => C.querySelectorAll("[data-sp]").forEach((b) => {
      const id = b.dataset.sp, sp = SP(), m = id.startsWith("rencontre:") && sp.mii()[+id.slice(10)];
      if (m?.mii) {
        const img = b.querySelector("img");
        if (!tetes.has(m.mii)) tetes.set(m.mii, Promise.resolve().then(() => window.__pcvTeteMii?.(Uint8Array.from(atob(m.mii), (c) => c.charCodeAt(0)))));
        tetes.get(m.mii).then((url) => {
          if (url && img.isConnected) {
            img.src = url;
            img.hidden = false;
          }
        }, () => {
        });
      }
      b.addEventListener("click", () => {
        if (m) sp.rencontre(m);
        else if (id === "activation") {
          if (sp.actif()) sp.couper();
          else ouvrir("explication");
        } else if (id === "couper") sp.couper();
        else if (id === "reessayer") sp.sync();
        else if (id === "pseudo" || id === "phrase") sp.ecrire(id, apres);
        else if (id === "pose") sp.choisirPose(apres);
        else if (id === "pays") sp.choisirRegion(apres);
      });
    }),
    // le mot de A sur une ligne (légendes)
    action: (id) => !id ? T("console.ouvrir") : id.startsWith("rencontre:") ? T("spotpass.f.gerer") : id === "activation" ? T(SP()?.actif() ? "spotpass.couper" : "spotpass.activer") : id === "couper" ? T("spotpass.f.couper.court") : id === "reessayer" ? T("spotpass.f.reessayer.court") : T("spotpass.f.changer")
  };
  fins.push(() => {
    delete window.__pcvSpotPassVue;
  });
  document.getElementById("pcv-spotpass-page")?.remove();
  const page = document.createElement("div");
  page.id = "pcv-spotpass-page";
  page.hidden = true;
  const u = (n) => `calc(var(--u) * ${n})`;
  page.innerHTML = `<style>
    #pcv-spotpass-page { position:fixed; inset:0; z-index:8600; padding:${u(96)} ${u(44)} ${u(window.__pcvPresentation?.LEGENDE || 76)}; background:var(--pcv-fond-page); color:var(--pcv-texte); font-family:var(--pcv-police); display:flex; flex-direction:column; box-sizing:border-box; }
    #pcv-spotpass-page[hidden] { display:none; }
    #pcv-spotpass-page h2 { font-size:${u(26)}; font-weight:900; margin:${u(4)} 0 ${u(20)}; }
    #pcv-spotpass-page .corps { display:flex; gap:${u(30)}; flex:1; min-height:0; }
    #pcv-spotpass-page .contenu .danger-liste { flex:none; }
    #pcv-spotpass-page .pastille img { width:100%; height:100%; object-fit:contain; }
    #pcv-spotpass-page.avec-moi .contenu { padding-right:${u(250)}; }
    #pcv-spotpass-page .moi { position:absolute; right:${u(44)}; top:${u(150)}; width:${u(220)}; height:${u(282)}; object-fit:contain; }
    #pcv-spotpass-page .pcv-legende { position:absolute; right:${u(28)}; bottom:${u(16)}; }
    body:not(.pcv-barre-main) #pcv-spotpass-page :is(.contenu, .colonne) .sel { box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein); }
  </style><h2>${T("spotpass.nom")}</h2><div class="corps"><div class="colonne"></div><div class="contenu"></div></div><canvas class="moi" hidden></canvas><div class="pcv-legende"></div>`;
  document.body.appendChild(page);
  window.__pcvFond?.(page);
  let rubrique = 0, contenu = false, selection = 0;
  const boutonsPage = () => [...page.querySelectorAll(contenu ? ".contenu [data-sp]" : ".colonne button")];
  const curseurPage = () => {
    page.querySelectorAll(".sel").forEach((b2) => b2.classList.remove("sel"));
    const b = boutonsPage()[contenu ? selection : rubrique];
    b?.classList.add("sel");
    const l = [[1, window.__pcvSpotPassVue.action(contenu && b?.dataset.sp)], [2, T("touche.retour")]];
    I.poser(page.querySelector(".pcv-legende"), window.__pcvLegendeDe?.(l) || l);
  };
  const dessinerPage = () => {
    if (page.hidden || !SP()) return;
    const V = window.__pcvSpotPassVue, C = page.querySelector(".contenu");
    page.querySelector(".colonne").innerHTML = V.colonne(rubrique);
    page.querySelectorAll(".colonne button").forEach((b, i) => {
      b.onclick = () => {
        rubrique = i;
        contenu = false;
        selection = 0;
        son("bouge");
        dessinerPage();
      };
    });
    C.innerHTML = `<div class="danger-liste">${V.contenu(rubrique)}</div>`;
    V.lier(C, () => dessinerPage());
    C.querySelectorAll("[data-sp]").forEach((b) => b.addEventListener("click", () => {
      contenu = true;
      selection = boutonsPage().indexOf(b);
      curseurPage();
    }));
    page.classList.toggle("avec-moi", rubrique === 0);
    vivreMoi(rubrique === 0);
    selection = Math.max(0, Math.min(selection, boutonsPage().length - 1));
    if (contenu && !boutonsPage().length) contenu = false;
    curseurPage();
  };
  const vif = { cle: "", a: null, rendu: null, scene: null, cam: null, pose: null, raf: 0, avant: 0 };
  const vivreMoi = (oui) => {
    const moi = oui && !page.hidden ? MB()?.moi?.() : null, cle = moi ? moi.id + ":" + moi.donnees + ":" + moi.pantalon : "";
    if (cle !== vif.cle) {
      cancelAnimationFrame(vif.raf);
      vif.raf = 0;
      vif.a?.liberer();
      vif.rendu?.dispose();
      vif.rendu?.forceContextLoss();
      const jeton = {};
      Object.assign(vif, { cle, jeton, a: null, rendu: null, pose: null });
      page.querySelector(".moi").hidden = true;
      if (!moi) return;
      window.__pcvVraisMii?.charger?.().then((M) => {
        if (vif.jeton !== jeton) return;
        const T3 = window.THREE, cv = document.createElement("canvas");
        cv.className = "moi";
        cv.width = 500;
        cv.height = 640;
        const rendu = new T3.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }), scene = new T3.Scene();
        rendu.setClearColor(0, 0);
        M.eclairer(scene);
        const a = M.creer({ donnees: moi.donnees, pantalon: moi.pantalon, rendu });
        scene.add(a.objet);
        a.jouer("repos");
        const b = new T3.Box3().setFromObject(a.objet), H = (b.max.y - b.min.y) / 0.79, y = b.min.y - 0.06 * H + H / 2, cam = new T3.PerspectiveCamera(22, cv.width / cv.height, 0.05, 50);
        const c = b.getCenter(new T3.Vector3());
        cam.position.set(c.x, y, c.z + H / 2 / Math.tan(cam.fov * Math.PI / 360));
        cam.lookAt(c.x, y, c.z);
        Object.assign(vif, { a, rendu, scene, cam, avant: 0 });
        page.querySelector(".moi").replaceWith(cv);
        vivreMoi(true);
        const boucle = (t) => {
          if (page.hidden || !page.classList.contains("avec-moi")) return vivreMoi(false);
          vif.raf = requestAnimationFrame(boucle);
          a.maj(Math.min(0.1, (t - (vif.avant || t)) / 1e3));
          vif.avant = t;
          rendu.render(scene, cam);
        };
        vif.raf = requestAnimationFrame(boucle);
      }).catch((e) => console.warn("SpotPass : Mii de Ma carte", e));
      return;
    }
    if (!vif.a) return;
    page.querySelector(".moi").hidden = false;
    const pose = SP()?.pose?.() || "";
    if (pose !== vif.pose) {
      vif.pose = pose;
      if (pose) vif.a.geste(pose, POSE);
    }
  };
  fins.push(() => vivreMoi(false));
  const montrerPage = (oui) => {
    if (oui && !SP()) return false;
    if (oui) {
      window.__pcvBarreQuitter?.();
      window.__pcvAmisMontrer?.(false);
      window.__pcvNotifsMontrer?.(false);
      window.__pcvProfilMontrer?.(false);
      window.__pcvMiiMaker?.fermer?.();
      window.__pcvSteamU?.fermer?.();
      rubrique = SP().actif() ? 0 : 2;
      contenu = false;
      selection = 0;
    }
    const entre = oui && page.hidden;
    if (!oui && !page.hidden) {
      fermer();
      window.__pcvApparition(page, true);
    }
    page.hidden = !oui;
    if (oui) {
      dessinerPage();
      if (entre) window.__pcvApparition(page);
    } else vivreMoi(false);
    return true;
  };
  (window.__pcvLegendes ||= {}).spotpassPage = () => {
    if (!page.hidden) curseurPage();
  };
  window.__pcvSpotPassPage = { ouvrir: () => montrerPage(true), fermer: () => montrerPage(false), maj: dessinerPage, ouvert: () => !page.hidden };
  (window.__pcvManette ||= {}).spotpassPage = (b) => {
    if (page.hidden || !racine.hidden || window.__pcvDossiers?.modal?.()) return false;
    if (b === 2) {
      if (contenu) {
        contenu = false;
        son("retour");
        curseurPage();
      } else {
        montrerPage(false);
        (window.opener || window).__pcvAller?.("accueil");
      }
    } else if (b === 11) {
      if (contenu) {
        contenu = false;
        son("bouge");
        curseurPage();
      } else son("bord");
    } else if ((b === 12 || b === 1) && !contenu) {
      contenu = true;
      if (boutonsPage().length) {
        selection = 0;
        son("bouge");
        curseurPage();
      } else {
        contenu = false;
        son("bord");
      }
    } else if (b === 1) {
      const x = boutonsPage()[selection];
      window.__pcvAppui?.(x);
      x?.click();
    } else if (b === 9 || b === 10) {
      const d = b === 10 ? 1 : -1;
      if (contenu) {
        const n = selection + d;
        if (n < 0 || n >= boutonsPage().length) son("bord");
        else {
          selection = n;
          son("bouge");
          curseurPage();
        }
      } else {
        const n = rubrique + d;
        if (n < 0 || n > 2) son("bord");
        else {
          rubrique = n;
          selection = 0;
          son("bouge");
          dessinerPage();
        }
      }
    } else son("bord");
    return true;
  };
  fins.push(() => {
    page.remove();
    delete window.__pcvSpotPassPage;
    delete window.__pcvLegendes?.spotpassPage;
    delete window.__pcvManette?.spotpassPage;
  });
  return "fen\xEAtre SpotPass pr\xEAte";
})();
