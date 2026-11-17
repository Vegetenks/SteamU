(() => {
  const Tr = window.__pcvT || ((c) => c);
  const webgl = (() => {
    try {
      const c = document.createElement("canvas"), g = c.getContext("webgl2") || c.getContext("webgl");
      g?.getExtension("WEBGL_lose_context")?.loseContext();
      return !!g;
    } catch (e) {
      return false;
    }
  })();
  const V = window.__pcvVraisMii;
  if (!webgl || !window.THREE || !V) return "place3d : pas de WebGL ou pas de vrais Mii, la place 2D reste";
  window.__pcvPlace3D?.liberer?.();
  clearTimeout(window.__pcvPlace3DAttente);
  const installer = (M) => {
    window.__pcvPlace?.liberer?.();
    const ouverte = document.getElementById("pcv-place")?.hidden === false;
    document.getElementById("pcv-place")?.remove();
    document.getElementById("pcv-bascule")?.remove();
    if (window.__pcvToucheY) window.removeEventListener("keydown", window.__pcvToucheY, true);
    clearInterval(window.__pcvPlaceSuivi);
    clearInterval(window.__pcvPlaceHeure);
    window.__pcvPlaceEtat?.();
    const O = window.opener, T = window.THREE;
    const IMG = (id, f) => `https://steamloopback.host/assets/${id}/${f}`;
    const CDN = (id, f) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${id}/${f}`;
    const u = (n) => `calc(var(--u) * ${n})`;
    const lire = (k, d) => {
      try {
        const v = localStorage.getItem(k);
        return v == null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    };
    const REG = Object.assign({ foule: 100, plafond: 0, intro: true, bruits: true, contour: true }, lire("pcv-place3d", {}));
    const formeTuile = () => ["carte", "verre", "galet"].includes(REG.tuile) ? REG.tuile : "galet";
    if (REG.plafond === 60) REG.plafond = 0;
    const TR = {
      amis: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.2 5 2.6 5 5.8"/>',
      boutique: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
      reglages: window.__pcvIcones?.trace("parametres") || "",
      medias: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
      telech: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
      globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
      bulle: '<path d="M4 5h16v11H9l-5 4z"/>',
      accueil: '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>'
    };
    const svg = (n, t, c, ep = 2.4) => `<svg width="${t}" height="${t}" viewBox="0 0 24 24" color="${c}" fill="none" stroke="${c}" stroke-width="${ep}" stroke-linecap="round" stroke-linejoin="round">${TR[n]}</svg>`;
    const toucheHaut = () => {
      const [, c, h] = window.__pcvTouche?.(4) || ["Y", "#e0a100", "Y"];
      return [h, c];
    };
    const JOUABLE = /* @__PURE__ */ new Set([1, 1073741824]);
    const lireJeux = () => (O.appStore?.allApps || []).filter((a) => JOUABLE.has(a.app_type) && a.rt_last_time_played && !window.__pcvBridge?.unifideck?.outil?.(a.appid)).sort((a, b) => b.rt_last_time_played - a.rt_last_time_played).slice(0, 7);
    const pseudo = () => {
      try {
        return O.g_FriendsUIApp.FriendStore.self.persona.m_strPlayerName || "";
      } catch (e) {
        return "";
      }
    };
    const avatarDe = () => window.__pcvImageMoi?.() || document.querySelector("#header_profile img")?.src || (() => {
      try {
        const p = O.g_FriendsUIApp.FriendStore.self.persona;
        return p.avatar_url_full || p.avatar_url_medium || "";
      } catch (e) {
        return "";
      }
    })();
    const echap = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
    const urlSure = (u2) => {
      const s = String(u2 ?? "").trim(), t = s.replace(/[\x00-\x20]/g, "");
      return echap(!/^[a-z][a-z0-9+.-]*:/i.test(t) || /^(https?:|data:image\/|blob:)/i.test(t) ? s : "");
    };
    const APPS = [["amis", "#2fbf71", "amis", Tr("spaces.amis.nom")], ["boutique", "#ff8a1f", "eshop", Tr("spaces.boutique.nom")], ["medias", "#2a8cff", "medias", Tr("place.mediatheque")], ["reglages", "#8b9098", "parametres", Tr("spaces.parametres.nom")]];
    const composer = (jeux) => {
      const l = [];
      for (let i = 0; i < Math.max(jeux.length, 4); i++) {
        if (jeux[i]) l.push({
          jeu: jeux[i],
          action: `jeu:${jeux[i].appid}`,
          nom: jeux[i].display_name,
          poids: 2 + Math.sqrt((+jeux[i].minutes_playtime_last_two_weeks || 0) / 30) + Math.sqrt((+jeux[i].minutes_playtime_forever || 0) / 600) + (i < 2 ? 2 : 0)
        });
        if (APPS[i]) {
          const [ic, c, act, nom] = APPS[i];
          l.push({ appli: ic, couleur: c, action: act, nom, poids: 1.2 });
        }
      }
      return l;
    };
    const cleJeux = (j) => j.map((a) => a.appid).join(",");
    const DEPART = { x: 0, y: 0.15 };
    const ZOOM = { crans: [0.6, 1, 1.47, 2.17, 3.2, 7.4], proche: 3.2, baisse: 0.49, fondu: [1.6, 2.8] };
    const dock = [
      ["amis", "#2fbf71", "amis", Tr("spaces.amis.nom")],
      ["boutique", "#ff8a1f", "eshop", Tr("spaces.boutique.nom")],
      ["globe", "#2a6fe0", "magasin", Tr("place.internet")],
      ["bulle", "#19b8d6", "discussions", Tr("place.discussions")],
      ["medias", "#2a8cff", "medias", Tr("place.mediatheque")],
      ["telech", "var(--pcv-c-telech)", "telechargements", Tr("barre.telechargements")],
      ["reglages", "#8b9098", "parametres", Tr("spaces.parametres.nom")]
    ].map(([n, c, a, t]) => `<button class="dock-btn" data-action="${a}" data-pcv-nom="${t}">${svg(n, "56%", c, 2.3)}</button>`).join("");
    const [gl, glc] = toucheHaut();
    const FONDU_MS = 250;
    const racine = document.createElement("div");
    racine.id = "pcv-place";
    racine.hidden = true;
    racine.innerHTML = `<style>
      @keyframes pcv-visite-rare { 50% { filter: brightness(1.18) drop-shadow(0 0 calc(var(--u) * 7) var(--pcv-cyan-plein, #5fd0ff)); } }
      html[data-pcv-visite-rare] :is(#pcv-accueil-legende, #pcv-console .pcv-legende) [data-b="4"] { animation: pcv-visite-rare 3s ease-in-out infinite; }
      #pcv-place { position: fixed; inset: 0; z-index: 9200; overflow: hidden; font-family: var(--pcv-police); color: var(--pcv-texte); background: var(--pcv-creux, #eef2f1); }
      #pcv-place[hidden] { display: none; }
      #pcv-place { transition: opacity ${FONDU_MS}ms ease-out; } #pcv-place.fondu { opacity: 0; pointer-events: none; }
      #pcv-place button { all: unset; cursor: pointer; box-sizing: border-box; }
      #pcv-place canvas.monde3d { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }   
      #pcv-place .blanc { position: absolute; inset: 0; background: linear-gradient(var(--pcv-fond-base));    opacity: 0; pointer-events: none; z-index: 7; transition: opacity .6s ease-out; }
      #pcv-place .blanc.on { opacity: 1; transition: none; }
      
      #pcv-place .attente { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: ${u(22)};
        color: var(--pcv-texte2); font-size: ${u(18)}; font-weight: 900; opacity: 0; transition: opacity .25s; }
      #pcv-place .blanc.attend .attente { opacity: 1; transition: opacity .3s .25s; }
      #pcv-place .attente .roue { position: relative; width: ${u(64)}; height: ${u(64)}; }
      #pcv-place .attente .roue i { position: absolute; left: 50%; top: 50%; width: ${u(12)}; height: ${u(12)}; margin: ${u(-6)}; border-radius: 50%; background: var(--pcv-cyan-plein);
        transform: rotate(calc(var(--k) * 45deg)) translateY(${u(-26)}); opacity: .18; animation: pcvRouePlace .96s linear infinite paused; animation-delay: calc(var(--k) * .12s - .96s); }
      
      #pcv-place .blanc.attend .roue i { animation-play-state: running; }
      #pcv-place .attente span { opacity: 0; transition: opacity .4s 1.2s; }
      #pcv-place .blanc.attend .attente span { opacity: 1; }
      @keyframes pcvRouePlace { 0% { opacity: 1; } 70%, 100% { opacity: .18; } }
      #pcv-place .fantome { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
      #pcv-place .v { position: absolute; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre);    z-index: 4; }
      #pcv-place .haut-avatar { left: ${u(24)}; top: ${u(20)}; width: ${u(56)}; height: ${u(56)}; border-radius: 50%; padding: ${u(6)}; }
      #pcv-place .haut-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
      #pcv-place .retour { left: 50%; top: ${u(20)}; transform: translateX(-50%); height: ${u(52)}; border-radius: ${u(26)}; padding: 0 ${u(10)} 0 ${u(6)}; display: flex; align-items: center; gap: ${u(12)}; font-weight: 900; font-size: ${u(17)}; }
      #pcv-place .retour .p { width: ${u(40)}; height: ${u(40)}; border-radius: 50%; background: var(--pcv-pastille); display: flex; align-items: center; justify-content: center; box-shadow: var(--pcv-pastille-ombre); }
      #pcv-place .gl { width: ${u(30)}; height: ${u(30)}; border-radius: 50%; background: var(--pcv-carte); display: flex; align-items: center; justify-content: center; font-size: ${u(15)}; box-shadow: inset 0 -2px 0 rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.15); }
      #pcv-place .etat { z-index: 4; }   
      #pcv-place .zoom { left: ${u(24)}; bottom: ${u(22)}; display: flex; align-items: center; gap: ${u(10)}; padding: ${u(8)} ${u(12)}; border-radius: ${u(26)}; }
      #pcv-place .zoom button { width: ${u(38)}; height: ${u(38)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${u(22)}; font-weight: 900; color: var(--pcv-texte2);
        background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 2px 6px rgb(from var(--pcv-ombre-c) r g b / .18); }
      #pcv-place .zoom button { position: relative; } #pcv-place .zoom button::after { content: ""; position: absolute; inset: ${u(-9)}; }
      #pcv-place .zoom .tz { display: flex; } #pcv-place .zoom .pcv-touche { --taille: ${u(28)}; }   
      #pcv-place .zoom .pt { width: ${u(12)}; height: ${u(12)}; border-radius: 50%; background: var(--pcv-creux); transition: background .2s, box-shadow .2s; }
      #pcv-place .zoom .pt.on { background: var(--pcv-cyan-plein); box-shadow: 0 0 0 ${u(3)} color-mix(in srgb, var(--pcv-cyan-plein) 25%, transparent); }
      #pcv-place .dock { left: 50%; transform: translateX(-50%); bottom: ${u(20)}; padding: ${u(10)} ${u(14)}; border-radius: ${u(28)}; display: flex; gap: ${u(12)};
        background: color-mix(in srgb, var(--pcv-carte) 65%, transparent); backdrop-filter: blur(${u(12)}); }   
      #pcv-place .dock-btn { width: ${u(60)}; height: ${u(60)}; border-radius: ${u(18)}; display: flex; align-items: center; justify-content: center;
        background: var(--pcv-verre); }
      
      #pcv-place .dock-btn svg { transform: translateY(var(--pcv-biseau-dy)); }
      
      
      #pcv-place .dock-btn { position: relative; transition: transform .12s; } #pcv-place .dock-btn.choisi { transform: scale(1.08); }
      #pcv-place .dock-btn::before, #pcv-place .dock-btn::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; transition: opacity .12s; }
      #pcv-place .dock-btn::before { box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 -3px 0 var(--pcv-reflet-bas), 0 ${u(6)} ${u(14)} rgb(from var(--pcv-ombre-c) r g b / .18); }
      #pcv-place .dock-btn::after { box-shadow: var(--pcv-curseur); opacity: 0; }
      #pcv-place .dock-btn.choisi::before { opacity: 0; } #pcv-place .dock-btn.choisi::after { opacity: 1; }
      #pcv-place .portail-pil { position: absolute; right: ${u(24)}; top: ${u(96)}; z-index: 10; display: flex; align-items: center; gap: ${u(10)}; padding: ${u(8)} ${u(18)} ${u(8)} ${u(12)}; border-radius: ${u(30)};
        background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-weight: 900; font-size: ${u(17)}; color: var(--pcv-texte); opacity: 0; transform: translateY(${u(-8)}); transition: opacity .3s, transform .3s; pointer-events: none; }
      #pcv-place .portail-pil.vu { opacity: 1; transform: none; pointer-events: auto; }
      #pcv-place .portail-pil i { width: ${u(14)}; height: ${u(14)}; border-radius: 50%; background: var(--pcv-vert); }
      #pcv-place .legende { position: absolute; right: ${u(24)}; bottom: ${u(30)}; z-index: 10; flex-wrap: wrap; row-gap: ${u(10)}; }   
      #pcv-place .voile { position: absolute; inset: 0; background: var(--pcv-voile-fenetre); backdrop-filter: blur(3px); z-index: 8; }
      #pcv-place .carte { left: 50%; top: 50%; transform: translate(-50%,-50%); width: ${u(640)}; border-radius: ${u(34)}; padding: ${u(26)} ${u(28)}; box-sizing: border-box; z-index: 9; background: var(--pcv-fenetre-fond); display: flex; flex-direction: column; gap: ${u(18)}; }
      #pcv-place .carte .msg { border-radius: ${u(24)}; padding: ${u(16)}; display: flex; align-items: center; gap: ${u(16)}; font-size: ${u(20)}; font-weight: 800; line-height: 1.3; }
      #pcv-place .carte .msg img { width: ${u(76)}; height: ${u(76)}; border-radius: ${u(18)}; box-shadow: 0 0 0 ${u(4)} var(--pcv-lisere), 0 4px 10px rgba(0,0,0,.15); object-fit: cover; }
      #pcv-place .carte .actions { display: flex; gap: ${u(12)}; }
      #pcv-place .carte .actions button { flex: 1; text-align: center; padding: ${u(14)} 0; border-radius: ${u(24)}; font-size: ${u(17)}; font-weight: 900;
        background: var(--pcv-verre); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 ${u(4)} ${u(12)} rgb(from var(--pcv-ombre-c) r g b / .15); }
      #pcv-place .carte .actions button.cyan { background: var(--pcv-cyan); color: var(--pcv-sur-accent);
        box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 ${u(8)} ${u(20)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
      #pcv-bascule { all: unset; position: fixed; z-index: 9050; top: ${u(20)}; left: ${u(222)}; width: ${u(56)}; height: ${u(56)}; border-radius: 50%; cursor: pointer;
        display: flex; align-items: center; justify-content: center; background: var(--pcv-verre);
        box-shadow: var(--pcv-reflet), var(--pcv-ombre); }   
      #pcv-bascule i { width: ${u(40)}; height: ${u(40)}; border-radius: 50%; background: var(--pcv-pastille, #fff); box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); display: flex; align-items: center; justify-content: center; }
      #pcv-bascule[hidden] { display: none; }
    </style>
    <canvas class="monde3d"></canvas><div class="fantome"></div>
    <div class="v haut-avatar"><img data-pcv-avatar src="" alt=""></div>
    <button class="v retour" data-pcv-nom="${Tr("place.revenir_accueil")}"><span class="p">${svg("accueil", "55%", "#1a9ae6")}</span>${Tr("spaces.accueil.nom")}<span class="gl" style="background:${glc};color:var(--pcv-sur-accent)">${gl}</span></button>
    ${window.__pcvEtat.html()}
    <div class="v zoom"><span class="tz" data-touche="5"></span><button class="moins" data-pcv-nom="${Tr("place.eloigner")}">\u2212</button>${ZOOM.crans.map(() => `<i class="pt"></i>`).join("")}<button class="plus" data-pcv-nom="${Tr("place.rapprocher")}">+</button><span class="tz" data-touche="6"></span></div>
    <div class="v dock">${dock}</div><div class="legende pcv-legende"></div>
    <div class="carte-zone"></div><div class="blanc"><div class="attente"><div class="roue">${Array.from({ length: 8 }, (_, k) => `<i style="--k:${k}"></i>`).join("")}</div><span>${Tr("place.prepare")}</span></div></div>`;
    document.body.appendChild(racine);
    const bascule = document.createElement("button");
    bascule.id = "pcv-bascule";
    bascule.dataset.pcvNom = Tr("spaces.place.nom");
    bascule.setAttribute("aria-label", Tr("spaces.place.nom"));
    bascule.innerHTML = "<i></i>";
    document.body.appendChild(bascule);
    const fantome = racine.querySelector(".fantome").attachShadow({ mode: "open" });
    fantome.innerHTML = `<style class="emprunt"></style><style>
      .bulle-p { pointer-events: auto; }
      .bulle-p { position: absolute; left: 0; top: 0; cursor: pointer; opacity: 0; transform-origin: ${u(46)} 100%; transition: opacity .3s; z-index: 2; }
      .bulle-p.vu { opacity: 1; animation: pcvBulle3 .35s cubic-bezier(.3,1.6,.5,1); }
      @keyframes pcvBulle3 { from { scale: .6 } to { scale: 1 } }
      .bulle-p .qui { position: absolute; left: ${u(18)}; top: ${u(-20)}; padding: ${u(3)} ${u(12)}; border-radius: ${u(12)}; background: var(--pcv-bulle); color: var(--pcv-sur-accent); font-size: ${u(12)}; font-weight: 900; letter-spacing: .05em; z-index: 1; }
      .bulle-p .corps { position: relative; display: flex; align-items: center; gap: ${u(12)}; padding: ${u(12)} ${u(18)} ${u(12)} ${u(12)}; border-radius: ${u(24)};
        background: linear-gradient(180deg, var(--pcv-carte), var(--pcv-creux)); box-shadow: var(--pcv-reflet), 0 ${u(10)} ${u(24)} rgba(70,95,130,.22); font-size: ${u(16)}; font-weight: 800; max-width: ${u(300)}; line-height: 1.25; overflow-wrap: anywhere; }
      .bulle-p .corps { --pointe-fond: var(--pcv-creux); }   
      .bulle-p .corps::after { left: ${u(36)}; bottom: ${u(-9)}; width: ${u(18)}; height: ${u(18)}; }
      
      .bulle-p.droite { transform-origin: calc(100% - ${u(46)}) 100%; }
      .bulle-p.droite .qui { left: auto; right: ${u(18)}; }
      .bulle-p.droite .corps::after { left: auto; right: ${u(36)}; }
      .bulle-p.choisie .corps { box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein); }
      .bulle-p .drapeau { flex: none; font-size: ${u(34)}; line-height: 1; font-weight: 900; }   
      .bulle-p img { width: ${u(44)}; height: ${u(44)}; border-radius: ${u(12)}; box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere); object-fit: cover; }
    </style><div class="bulles"></div>`;
    const $ = (s) => racine.querySelector(s), toile = $("canvas.monde3d"), blanc = $(".blanc"), pts = [...racine.querySelectorAll(".zoom .pt")];
    const boutonsDock = [...racine.querySelectorAll(".dock-btn")], legendeEl = $(".legende");
    const RX = 12.5, RZ = 7.2, D0 = 36, ELEV = 0.74;
    const CENTRE = new T.Vector3(0, 0, 0.9);
    const BRUME = { avant: 4, loin: 26 };
    const BRUME_Z = CENTRE.z + D0 * Math.cos(ELEV);
    const brumeSol = (B2) => {
      const h = (0.6 + D0 * Math.sin(ELEV)) * Math.sin(ELEV), c = Math.cos(ELEV);
      return [(D0 - B2.avant - h) / c, (D0 + B2.loin - h) / c];
    };
    const SANS_BRUME = { fondu: 1, nuit: [-1, 0] }, sansBrume = { value: new T.Vector2(...SANS_BRUME.nuit) };
    const brumeMonde = (s, fond = "gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, f);") => {
      s.uniforms.pcvSansBrume = sansBrume;
      s.vertexShader = s.vertexShader.replace("void main() {", "varying vec2 pcvXZ;\nvoid main() {").replace(
        "#include <fog_vertex>",
        `#ifdef USE_FOG
vec3 pcvW3 = cameraPosition + transpose(mat3(viewMatrix)) * mvPosition.xyz; pcvXZ = pcvW3.xz; vFogDepth = ${BRUME_Z.toFixed(3)} - pcvW3.z;
#endif`
      );
      s.fragmentShader = s.fragmentShader.replace("void main() {", "varying vec2 pcvXZ; uniform vec2 pcvSansBrume;\nvoid main() {").replace(
        "#include <fog_fragment>",
        `#ifdef USE_FOG
{ float f = smoothstep(fogNear, fogFar, vFogDepth) * smoothstep(pcvSansBrume.x, pcvSansBrume.y, distance(pcvXZ, vec2(${PORTAIL.x.toFixed(2)}, ${PORTAIL.z.toFixed(2)}))); ${fond} }
#endif`
      );
    };
    const auMonde = (m) => {
      m.onBeforeCompile = (s) => brumeMonde(s);
      return m;
    };
    const brumeLegere = (s) => brumeMonde(s, "gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, .5 * f);");
    const brumeNeutre = (s) => brumeMonde(s, "gl_FragColor = mix(gl_FragColor, vec4(1.0), f);");
    let rendu = null, scene = null, cam = null, sol = null, ombres = null, troupe = null, rayon = new T.Raycaster();
    let solBase = new T.Color(16777215), apparenceSol = "clair";
    const teindreSol = () => {
      if (!sol) return;
      sol.material.color.copy(solBase).multiplyScalar(sol.material.map === motifSol || apparenceSol === "clair" ? 1 : apparenceSol === "noir" ? 0.22 : 0.42);
      nuance.visible = sol.material.map === motifSol;
      lumiereSale = true;
      portail.matiere(sol.material.map === motifSol ? null : sol.material.map, sol.material.color, decorMotif, sol.material.map !== motifSol && decorMoy ? decorMoy.clone().lerp(new T.Color(0.86, 0.84, 0.8), 0.5).multiply(sol.material.color) : sol.material.color);
    };
    let fige = false, icones = [], foule = [], heros = [], cle = "", debut = 0, introFin = 0, raf = 0, dernier = 0, temps = 0;
    let dockSel = -1, dockDernier = 0;
    const vue = window.__pcvPlaceCommandes(ZOOM.crans.at(-1), ZOOM.crans[0]);
    const camPos = new T.Vector3(), camVise = new T.Vector3(), butPos = new T.Vector3(), butVise = new T.Vector3();
    const lisse = (x) => (x = Math.max(0, Math.min(1, x))) * x * (3 - 2 * x);
    const alea = (a, b) => a + Math.random() * (b - a);
    const ellipse = (k, n, f = 1) => {
      const a = k / n * Math.PI * 2;
      return new T.Vector3(-RX * f * Math.sin(a), 0, RZ * f * Math.cos(a));
    };
    const toileTexte = (w, h, dessin) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      dessin(c.getContext("2d"), w, h);
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      return t;
    };
    const DECOR_TUILE = 5;
    const DECOR = { unites: 60, toile: 1024, net: 0.75, brume: 0.3 };
    let decorUrl = null, motifSol = null, brumeTheme = null;
    const sonde = document.createElement("i"), pixel = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    sonde.hidden = true;
    racine.appendChild(sonde);
    const teinte = (nom) => {
      sonde.style.color = nom.startsWith("--") ? `var(${nom})` : nom;
      pixel.clearRect(0, 0, 1, 1);
      pixel.fillStyle = getComputedStyle(sonde).color;
      pixel.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = pixel.getImageData(0, 0, 1, 1).data;
      return { css: `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`, c: new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace), a: a / 255 };
    };
    const PIERRE = {
      clair: {
        teintes: ["#efece5", "#e9edf1", "#f1e9e6", "#e7efe9", "#eceae6", "#f2eee2"],
        joint: "#d9d5ce",
        nuances: ["rgba(255,240,215,.7)", "rgba(225,236,255,.7)", "rgba(240,226,236,.6)"],
        base: 1,
        gain: 0,
        ombre: 0.9,
        eclat: 1,
        reflet: 0.45,
        verre: 1,
        lueur: { halo: 0.18, force: 0.45 }
      },
      gris: {
        teintes: ["#3c4048", "#40424a", "#3a3e44", "#44464c", "#3e4248"],
        joint: "#2a2d33",
        nuances: ["rgba(225,225,238,.7)", "rgba(240,232,220,.7)"],
        base: 1,
        gain: 9,
        ombre: 0.7,
        eclat: 1.08,
        reflet: 0.2,
        verre: 0.55,
        brume: { avant: 5, loin: 18 },
        lueur: { halo: 0.5, force: 0.75 }
      },
      noir: {
        teintes: ["#6e6c72", "#66666e", "#727070", "#6a6c70", "#686a72"],
        joint: "#2a2a2e",
        nuances: ["rgba(225,225,238,.7)", "rgba(240,232,220,.7)"],
        base: 0.13,
        gain: 16,
        ombre: 0,
        eclat: 1.2,
        reflet: 0.15,
        verre: 0.45,
        brume: { avant: 8, loin: 15 },
        fond: "#000000",
        lanternes: true,
        lueur: { halo: 0.8, force: 0.6 }
      }
    };
    const DALLES = { cellules: 7, unites: 10, px: 1024 / 7, bruit: 128 }, LUM_MAX = 12;
    const bruitSol = (() => {
      let g = 11;
      const n = DALLES.bruit, d = new Uint8Array(n * n * 4).map(() => (g = g * 48271 % 2147483647) & 255), t = new T.DataTexture(d, n, n);
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.magFilter = t.minFilter = T.LinearFilter;
      t.needsUpdate = true;
      return t;
    })();
    const ILOT = { bord: 3.9, fin: 5.4, teinte: 0.35, pierre: 0.25, ombre: 0, ombreFin: 6.8, pastel: 0.9, brins: 0.4, laiteux: [0.38, 0.385, 0.36] };
    const SOL = {
      pcvTe: { value: [0, 1, 2, 3, 4, 5].map(() => new T.Vector3()) },
      pcvTeN: { value: 6 },
      pcvJ: { value: new T.Vector3() },
      pcvBruit: { value: bruitSol },
      pcvPortail: { value: new T.Vector3() },
      pcvVeille: { value: 0 },
      pcvPierre: { value: new T.Vector3(0.8, 0.8, 0.8) },
      pcvRuine: { value: 0 },
      /* (détruit : le parvis plus abîmé) */
      pcvPhospho: { value: new T.Vector3() },
      /* (en Noir : la lueur des brins, PHOSPHO) */
      pcvUv: { value: new T.Vector4(1, 1, 0, 0) }
    };
    const SOL_GLSL = [`
uniform vec3 pcvTe[6]; uniform float pcvTeN; uniform vec3 pcvJ; uniform sampler2D pcvBruit; uniform vec3 pcvPortail; uniform float pcvVeille; uniform vec3 pcvPierre; uniform float pcvRuine; vec3 pcvLueur = vec3(0.);
vec4 pcvH4(vec2 c){ return texelFetch(pcvBruit, ivec2(c) & ${DALLES.bruit - 1}, 0); }
vec2 pcvH2(vec2 c){ return pcvH4(c).xy; }
float pcvN(vec2 p){ return texture(pcvBruit, (p + .5) / ${DALLES.bruit.toFixed(1)}).w; }
// (14/11, l'auteur : \xAB de la peinture verte sur la dalle \xBB) un vrai sol de gazon vu de dessus, calcul\xE9 (aucune toile) : trois
// \xE9chelles de nuances (vert clair, vert fonc\xE9, un peu jaune), des touffes (une par cellule de 1/7, plus claire au c\u0153ur, ombr\xE9e
// autour) et un grain fin ; le d\xE9tail fin s'efface au loin (fin : 1 de pr\xE8s, 0 au loin) pour ne pas scintiller. lum : la
// clart\xE9 de l'apparence (sRGB)
float pcvHa(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float pcvVn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(pcvHa(i), pcvHa(i + vec2(1, 0)), f.x), mix(pcvHa(i + vec2(0, 1)), pcvHa(i + vec2(1, 1)), f.x), f.y); }
vec3 pcvGazon(vec2 W, float lum, float fin);
// l'\xEElot du portail (ILOT) : x, la couverture du gazon (plaques de plus en plus petites et clairsem\xE9es de bord \xE0 fin, sur une
// large bande irr\xE9guli\xE8re) ; y, sa part dans les joints des dalles, qui s'avance plus loin que les plaques
vec2 pcvIlot(vec2 W, float rr, float nz, float px2){ float f = 1. - smoothstep(${ILOT.bord.toFixed(3)}, ${ILOT.fin.toFixed(3)}, rr + nz * 1.4 + (pcvVn(W * .7) - .5) * .9), pt = mix(pcvVn(W * 2.2 + 17.), pcvVn(W * 5.5 + 3.), .5);
  return vec2(smoothstep(3.42 - px2, 3.42 + px2, rr + nz * .3) * smoothstep(-.06, .06, f - pt * .85 - .05) * (.55 + .45 * f), smoothstep(3.3, 3.42, rr + nz * .3) * smoothstep(0., .25, f + .3 - pt)); }
// son gazon : un peu de la teinte du sol (sol, sRGB : la dalle ou la teinte moyenne du th\xE8me), plus sombre vers le bord (l'ombre)
vec3 pcvGazonIlot(vec2 W, float lum, float fin, vec3 sol, float rr, float nz){ vec3 g = pcvGazon(W, lum, fin);
  // (ILOT.pastel, selon la clart\xE9 de l'apparence : pcvTe[0], car le d\xE9cor d'un th\xE8me passe lum \xE0 1)
  g = mix(g, mix(vec3(dot(g, vec3(.3, .59, .11))), g, .55) * .6 + vec3(${ILOT.laiteux.join(", ")}), ${ILOT.pastel.toFixed(3)} * smoothstep(.6, .9, dot(pcvTe[0], vec3(.333)) / .93));
  return mix(g, g * sol / max(dot(sol, vec3(.333)), .05), ${ILOT.teinte.toFixed(3)}) * (1. - .22 * smoothstep(${ILOT.bord.toFixed(3)}, ${ILOT.fin.toFixed(3)}, rr + nz)); }
// son ombre douce sur le sol autour (facteur)
float pcvIlotOmbre(vec2 W, float rr){ return 1. - ${ILOT.ombre.toFixed(3)} * (1. - smoothstep(${ILOT.bord.toFixed(3)}, ${ILOT.ombreFin.toFixed(3)}, rr + (pcvN(W * 1.6) - .5) * .4)); }
vec3 pcvGazon(vec2 W, float lum, float fin){
  // (14/11 soir, l'auteur : \xAB ultra r\xE9p\xE9titif \xBB) aucune p\xE9riode : un hachage arithm\xE9tique (pcvHa), quatre \xE9chelles d\xE9cal\xE9es et
  // tourn\xE9es, des plaques \xE0 grande \xE9chelle (plus denses, plus claires), de la terre qui affleure par endroits, des touffes
  vec2 R = mat2(.8, -.6, .6, .8) * W;
  float big = pcvVn(W * .33 + 4.1), n1 = pcvVn(R * 1.1 + 9.7), n2 = pcvVn(W * 3.9 + 31.3), n3 = pcvVn(R * 17. + 7.), m = n1 * .55 + n2 * .45;
  vec3 c = mix(vec3(.38, .53, .28), vec3(.62, .77, .44), m) * (.86 + .28 * big);
  c = mix(c, vec3(.70, .73, .40), smoothstep(.6, .85, pcvVn(R * .7 + 21.)) * .5);
  vec2 q = W * 6.3, iq = floor(q); float hx = pcvHa(iq + 3.7), hy = pcvHa(iq + 9.1), d = length(fract(q) - .2 - .6 * vec2(hx, hy));
  c *= 1. + fin * (.14 * (1. - smoothstep(.0, .3, d)) - .09 * smoothstep(.28, .45, d) * (1. - smoothstep(.45, .58, d)));
  c *= 1. + fin * (n3 - .5) * .16;
  float terre = smoothstep(.70, .78, pcvVn(W * .9 + 17.) * .6 + n2 * .4) * (1. - big * .5);
  c = mix(c, vec3(.52, .45, .36) * (.9 + .2 * n3), terre * .85);
  c = mix(c, vec3(.66, .60, .42) * (.8 + .4 * n2), pcvRuine * .75); c = mix(c, vec3(.48, .41, .32), pcvRuine * smoothstep(.45, .7, big) * .8);   // (d\xE9truit : gazon sec)
  return c * mix(.42, 1., lum); }
`, `
{ vec2 W = vMapUv * ${DALLES.unites.toFixed(1)}, Pc = W * ${(DALLES.cellules / DALLES.unites).toFixed(2)}, ip = floor(Pc), fp = fract(Pc);
  float px = length(fwidth(Pc)) * ${DALLES.px.toFixed(1)}, loin = smoothstep(4., 12., px), fin = 1. - smoothstep(1., 2.5, px);
  float d1 = 1e9, d2 = 1e9; vec2 c1 = vec2(0), o1 = vec2(0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { vec2 g = vec2(i, j), r = g + .15 + .7 * pcvH2(ip + g) - fp; float d = dot(r, r);
    d2 = min(d2, max(d, d1)); bool b = d < d1; d1 = b ? d : d1; c1 = b ? ip + g : c1; o1 = b ? r : o1; }   // (sans branchement)
  float e1 = sqrt(d1), gap = (sqrt(d2) - e1) * ${DALLES.px.toFixed(1)};
  float e = mix(smoothstep(3. - px, 8. + px, gap), .92, loin), s = 1. - .04 * e1, jx = 1.;
  vec4 h = pcvH4(c1 + vec2(511, 263)), h2 = pcvH4(c1 + vec2(97, 911));
  vec3 col = pcvTe[int(h.x * pcvTeN * .9999)] + (h.y - .5) * .03 + (pcvN(W / 7.) - .5) * .035 + (pcvN(W / 2.3 + 17.) - .5) * .016;
  if (h.z > .83) col *= h.w > .5 ? vec3(1.012, 1., .975) : vec3(.982, .995, 1.012);
  vec2 q = -o1, nd = vec2(cos(h2.z * 6.283), sin(h2.z * 6.283));
  if (h.z < .45 && fin > 0.) col *= 1. - smoothstep(.66, .86, pcvN(W * 24. + h.w * 50.)) * .022 * (.5 + h2.x) * fin;
  if (h2.y < .07) jx = mix(smoothstep(2. - px, 5. + px, abs(dot(q, nd)) * ${DALLES.px.toFixed(1)}), .97, loin);
  else if (h2.y < .2 && fin > 0.) { float t = dot(q, vec2(-nd.y, nd.x)), w = (pcvN(vec2(t * 10., h2.w * 30.)) - .5) * .1, dl = abs(dot(q, nd) - w) * ${DALLES.px.toFixed(1)};
    col *= 1. - .09 * (1. - smoothstep(.7, 1.8, dl)) * smoothstep(.32, .12, abs(t - (h2.w - .5) * .3)) * fin; }
  if (h.w > .987) { col = mix(pcvJ, col, .7) * (1. + (pcvN(W * 45.) - .5) * .08 * fin); s = 1.; jx = 1.; }
  // (14/11, l'auteur : l'herbe \xAB pas du tout de l'herbe, une texture plate, pixelis\xE9e \xBB) l'herbe est faite de vraies touffes de
  // brins (portail.herbe) ; ici seulement le sol sous elles, un vert terreux net, sans flou ni halo
  vec3 pcvJx = pcvJ, pcvG = vec3(0.); float pcvCov = 0., pcvJg = 0., pcvMq = 0., pcvOm = 1.;
  { vec2 dp = W - pcvPortail.xy; float rr = length(dp);
    if (pcvPortail.z > 0. && rr < ${(ILOT.ombreFin + 0.4).toFixed(1)}) { float lum = dot(pcvTe[0], vec3(.333)) / .93, nz = (pcvN(W * 1.6) - .5) * .5;
      // le gazon couvre la dalle et ses joints ; au bord, il s'avance d'abord dans les joints (pcvJg) puis s'\xE9gr\xE8ne (ILOT)
      vec2 il = pcvIlot(W, rr, nz, length(fwidth(W)) * 2.);
      pcvG = pcvGazonIlot(W, lum, fin, pcvTe[0], rr, nz); pcvCov = il.x;   /* (aussi sous les pierres manquantes, plus bas) */ pcvJg = il.y; pcvOm = pcvIlotOmbre(W, rr); } }
  // (13/11, sol A du portail) le parvis : des pierres en couronnes de 0,4 autour du socle, aux teintes et aux joints des dalles ;
  // la derni\xE8re couronne s'\xE9gr\xE8ne dans les dalles (pcvPortail : son centre en coordonn\xE9es du motif, z \xE0 1 quand il est pos\xE9)
  { vec2 dp = W - pcvPortail.xy; float rr = length(dp), k = floor((rr - 1.86) / .4);
    if (pcvPortail.z > 0. && rr < 3.5 && k >= 0.) { float rk = 1.86 + k * .4, n = floor(6.2832 * (rk + .2) / .62), a = (atan(dp.y, dp.x) / 6.2832 + .5) * n + .5 * mod(k, 2.), ia = mod(floor(a), n);
      vec4 hp = pcvH4(vec2(ia, k) + vec2(733., 157.));
      // (14/11 soir, l'auteur : \xAB un temple ancien et futuriste \xBB) des pierres anciennes : quelques-unes manquantes (l'herbe y
      // pousse : PARVIS_MANQUE, m\xEAmes tirages c\xF4t\xE9 JS pour les touffes), joints plus ou moins disjoints, coins \xE9br\xE9ch\xE9s, des
      // fentes, des teintes plus ou moins us\xE9es ; l'herbe reprend les joints vers l'ext\xE9rieur
      if ((rk + .4 <= 2.8 || hp.z >= .45 + pcvRuine * .3) && hp.w >= .07 + pcvRuine * .3) { float u = fract(a), g = min(min(u, 1. - u) * 6.2832 * rr / n, min(rr - rk, rk + .4 - rr)) * 204.8;
        float jw = 3. + 7. * hp.y * hp.y, coin = (1. - smoothstep(0., 30., min(u, 1. - u) * 6.2832 * rr / n * 204.8)) * (1. - smoothstep(0., 30., min(rr - rk, rk + .4 - rr) * 204.8));
        g -= coin * 26. * pcvVn(W * 13. + hp.zw * 60.) * (.4 + hp.x);
        col = pcvTe[int(hp.x * pcvTeN * .9999)] * (.9 + .16 * hp.z) + (hp.y - .5) * .04 + (pcvN(W / 7.) - .5) * .035 - pcvVn(W * 5. + 3.) * .05 * hp.w;
        vec2 lq = vec2((u - .5) * 6.2832 * rr / n, rr - rk - .2), nd = vec2(cos(hp.x * 9.), sin(hp.x * 9.));
        if (hp.y > .78) col *= 1. - .22 * (1. - smoothstep(.6, 2.2, abs(dot(lq, nd) + (pcvVn(lq * 20. + 5.) - .5) * .05) * 204.8)) * fin;   // (une fente)
        s = 1.; jx = 1.; pcvOm = 1.; e = mix(smoothstep(jw - px, jw + 5. + px, g), .92, loin);
        pcvJg = max(pcvJg, smoothstep(2.3, 3.2, rr) * step(.45, pcvVn(W * 3. + 50.)) * (1. - e)); }
      else pcvMq = 1. - smoothstep(3.42, 3.5, rr); } }
  diffuseColor.rgb *= pow(clamp(mix(mix(mix(pcvJx * pcvOm, pcvG, pcvJg), col * s * pcvOm, e * jx), pcvG, max(pcvCov, pcvMq)), 0., 1.), vec3(2.2));
  }
`];
    const PARVIS_DECOR = `{ vec2 W = (vMapUv - pcvUv.zw) / pcvUv.xy * 140., dp = W - pcvPortail.xy; float rr = length(dp), k = floor((rr - 1.86) / .4), px = length(fwidth(W)) * 102.4, mq = 0.;
  if (pcvPortail.z > 0.) diffuseColor.rgb *= pcvIlotOmbre(W, rr);   
  if (pcvPortail.z > 0. && rr < 3.5 && k >= 0.) { float rk = 1.86 + k * .4, n = floor(6.2832 * (rk + .2) / .62), a = (atan(dp.y, dp.x) / 6.2832 + .5) * n + .5 * mod(k, 2.), ia = mod(floor(a), n);
    vec4 hp = pcvH4(vec2(ia, k) + vec2(733., 157.));
    if ((rk + .4 <= 2.8 || hp.z >= .45 + pcvRuine * .3) && hp.w >= .07 + pcvRuine * .3) { float u = fract(a), g = min(min(u, 1. - u) * 6.2832 * rr / n, min(rr - rk, rk + .4 - rr)) * 204.8;
      float jw = 3. + 7. * hp.y * hp.y, coin = (1. - smoothstep(0., 30., min(u, 1. - u) * 6.2832 * rr / n * 204.8)) * (1. - smoothstep(0., 30., min(rr - rk, rk + .4 - rr) * 204.8));
      g -= coin * 26. * pcvVn(W * 13. + hp.zw * 60.) * (.4 + hp.x);
      float e = smoothstep(jw - px, jw + 5. + px, g); vec3 p = mix(pcvPierre, vec3(.86, .84, .80), ${ILOT.pierre.toFixed(3)}) * (1. + (hp.y - .5) * .1 + (pcvN(W / 7.) - .5) * .06);
      diffuseColor.rgb = diffuse * pow(clamp(p * mix(.62, 1., e), 0., 1.), vec3(2.2));
      if (rr > 2.3 && pcvVn(W * 3. + 50.) > .45) diffuseColor.rgb = mix(diffuseColor.rgb, diffuse * pow(pcvGazonIlot(W, 1., 1., pcvPierre, rr, 0.), vec3(2.2)), (1. - e) * smoothstep(2.3, 3.2, rr)); }
    else if (rr < 3.46) mq = 1.; }
  if (pcvPortail.z > 0. && rr < ${(ILOT.fin + 1.6).toFixed(1)}) { float nz = (pcvN(W * 1.6) - .5) * .5, t = max(mq, pcvIlot(W, rr, nz, length(fwidth(W)) * 2.).x);
    float fin = 1. - smoothstep(.04, .1, length(fwidth(W)));
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuse * pow(pcvGazonIlot(W, 1., fin, pcvPierre, rr, nz), vec3(2.2)), t); } }`;
    let nuance = null, carteLum = null, lumiereSale = true, lumiereT = 0;
    const pierre = () => PIERRE[apparenceSol] || PIERRE.clair;
    const peindreSol = () => {
      const A = pierre(), srgb = (h, v) => {
        const t = {};
        new T.Color(h).getRGB(t, T.SRGBColorSpace);
        v.set(t.r, t.g, t.b);
      };
      A.teintes.forEach((h, k) => srgb(h, SOL.pcvTe.value[k]));
      SOL.pcvTeN.value = A.teintes.length;
      srgb(A.joint, SOL.pcvJ.value);
      if (nuance) {
        let g3 = 11;
        const al = (a, b) => a + (g3 = g3 * 48271 % 2147483647) / 2147483647 * (b - a), t = nuance.material.map, y = t.image.getContext("2d");
        y.setTransform(1, 0, 0, 1, 0, 0);
        y.fillStyle = "#fff";
        y.fillRect(0, 0, 256, 256);
        for (let k = 0; k < 40; k++) {
          const cx = al(0, 256), cy = al(0, 256), R = al(20, 70), gg = y.createRadialGradient(cx, cy, 0, cx, cy, R);
          gg.addColorStop(0, A.nuances[k % A.nuances.length]);
          gg.addColorStop(1, "rgba(255,255,255,0)");
          for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) {
            y.setTransform(1, 0, 0, 1, ox, oy);
            y.fillStyle = gg;
            y.fillRect(-ox, -oy, 256, 256);
          }
        }
        t.needsUpdate = true;
      }
      lumiereSale = true;
    };
    let decorMotif = false, decorMoy = null;
    const decorTheme = () => {
      const T_ = window.__pcvThemes, tele = T_?.teleActuel?.() || null, manette = tele ? null : T_?.manetteActuel?.() || null;
      const url = tele || manette;
      if (url === decorUrl || !sol) return;
      decorUrl = url;
      const m = sol.material;
      if (m.map !== motifSol) m.map?.dispose();
      m.map = motifSol;
      decorMotif = false;
      solBase.set(16777215);
      teindreSol();
      m.needsUpdate = true;
      if (brumeTheme) {
        brumeTheme = null;
        teinter();
      }
      if (!url) return;
      new T.TextureLoader().load(url, (tx) => {
        if (decorUrl !== url) return;
        tx.colorSpace = T.SRGBColorSpace;
        const c = document.createElement("canvas");
        c.width = c.height = 8;
        const x = c.getContext("2d");
        x.drawImage(tx.image, 0, 0, 8, 8);
        const p = x.getImageData(0, 0, 8, 8).data;
        let r = 0, g = 0, b = 0;
        for (let k = 0; k < p.length; k += 4) {
          r += p[k];
          g += p[k + 1];
          b += p[k + 2];
        }
        if (!tele) {
          solBase.setRGB(r / 64 / 255, g / 64 / 255, b / 64 / 255, T.SRGBColorSpace);
          teindreSol();
          return;
        }
        decorMoy = new T.Color().setRGB(r / 64 / 255, g / 64 / 255, b / 64 / 255, T.SRGBColorSpace);
        SOL.pcvPierre.value.set(r / 64 / 255, g / 64 / 255, b / 64 / 255);
        brumeTheme = decorMoy.clone().lerp(new T.Color(1, 1, 1), DECOR.brume);
        teinter();
        decorMotif = !!T_.teleMotif?.();
        if (decorMotif) {
          tx.wrapS = tx.wrapT = T.RepeatWrapping;
          tx.repeat.setScalar(140 / DECOR_TUILE);
          m.map = tx;
        } else {
          const moy = (a) => `rgba(${r / 64},${g / 64},${b / 64},${a})`;
          m.map = toileTexte(DECOR.toile, DECOR.toile, (y, N) => {
            const im = tx.image, h = N * im.height / im.width;
            y.fillStyle = moy(1);
            y.fillRect(0, 0, N, N);
            y.drawImage(im, 0, (N - h) / 2, N, h);
            const f = y.createRadialGradient(0, 0, DECOR.net, 0, 0, 1);
            f.addColorStop(0, moy(0));
            f.addColorStop(1, moy(1));
            y.setTransform(N / 2, 0, 0, h / 2, N / 2, N / 2);
            y.fillStyle = f;
            y.fillRect(-1, -N / h, 2, 2 * N / h);
          });
          m.map.repeat.setScalar(140 / DECOR.unites);
          m.map.offset.setScalar((1 - m.map.repeat.x) / 2);
        }
        m.map.anisotropy = 8;
        m.needsUpdate = true;
        SOL.pcvUv.value.set(m.map.repeat.x, m.map.repeat.y, m.map.offset.x, m.map.offset.y);
        teindreSol();
      });
    };
    const sol3d = () => {
      const motif = motifSol = toileTexte(1, 1, () => {
      });
      motif.wrapS = motif.wrapT = T.RepeatWrapping;
      motif.repeat.setScalar(140 / DALLES.unites);
      motif.anisotropy = 8;
      const nu = toileTexte(256, 256, () => {
      });
      nu.wrapS = nu.wrapT = T.RepeatWrapping;
      nu.repeat.setScalar(3);
      nuance = new T.Mesh(new T.CircleGeometry(70, 64), new T.MeshBasicMaterial({ map: nu, transparent: true, depthWrite: false, blending: T.MultiplyBlending, premultipliedAlpha: true }));
      nuance.material.onBeforeCompile = brumeNeutre;
      nuance.position.z = 5e-3;
      nuance.renderOrder = 0.5;
      carteRT = new T.WebGLRenderTarget(LUEUR.carte, LUEUR.carte, { depthBuffer: false, type: T.HalfFloatType });
      carteLum = carteRT.texture;
      const g = new T.CircleGeometry(70, 64);
      const c = [];
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const d = Math.hypot(p.getX(i), p.getY(i)), k = 1 - 0.1 * lisse((d - 6) / 26);
        const col = new T.Color(k, k, k * 1.005);
        c.push(col.r, col.g, col.b);
      }
      g.setAttribute("color", new T.Float32BufferAttribute(c, 3));
      const mat = new T.MeshBasicMaterial({ map: motif, vertexColors: true });
      mat.onBeforeCompile = (sh) => {
        brumeMonde(sh);
        Object.assign(sh.uniforms, SOL);
        if (mat.map !== motifSol) {
          sh.fragmentShader = sh.fragmentShader.replace("void main() {", SOL_GLSL[0] + "uniform vec4 pcvUv;\nvoid main() {").replace("#include <map_fragment>", "#include <map_fragment>\n" + PARVIS_DECOR).replace("#include <opaque_fragment>", "outgoingLight += pcvLueur;\n#include <opaque_fragment>");
          return;
        }
        sh.fragmentShader = sh.fragmentShader.replace("void main() {", SOL_GLSL[0] + "void main() {").replace("#include <map_fragment>", SOL_GLSL[1]).replace("#include <opaque_fragment>", "outgoingLight += pcvLueur;\n#include <opaque_fragment>");
      };
      mat.customProgramCacheKey = () => mat.map === motifSol ? "dalles" : "decor";
      const m = new T.Mesh(g, mat);
      m.rotation.x = -Math.PI / 2;
      m.add(nuance);
      return m;
    };
    const LUEUR = { sol: [7.5, 5, 0.4], clair: [5.5, 3.6, 0.5], lanterne: [3.6, 0.6, 16758880], liser\u00E9: { couleur: 0.25, emission: 1 }, max: 32, carte: 512, mii: 0.4 };
    const lueurTex = (() => {
      const n = 64, d = new Uint16Array(n * n * 4);
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const i = (y * n + x) * 4, t2 = Math.hypot(x + 0.5 - n / 2, y + 0.5 - n / 2) / (n / 2);
        d.fill(T.DataUtils.toHalfFloat(1), i, i + 3);
        d[i + 3] = T.DataUtils.toHalfFloat((1 - lisse(t2)) ** 2);
      }
      const t = new T.DataTexture(d, n, n, T.RGBAFormat, T.HalfFloatType);
      t.magFilter = t.minFilter = T.LinearFilter;
      t.needsUpdate = true;
      return t;
    })();
    const HALO = { toile: 128, forme: 88, coin: 30, flou: 9 };
    const haloTex = toileTexte(HALO.toile, HALO.toile, (x) => {
      const m = (HALO.toile - HALO.forme) / 2;
      x.filter = `blur(${HALO.flou}px)`;
      x.fillStyle = "#fff";
      x.beginPath();
      x.roundRect(m, m, HALO.forme, HALO.forme, HALO.coin);
      x.fill();
    });
    let carteRT = null, lueurs = null;
    const lueurM = new T.Matrix4(), sceneLum = new T.Scene(), camLum = new T.OrthographicCamera(-70, 70, 70, -70, 1, 20), fondLum = new T.Color(), clairAvant = new T.Color();
    camLum.position.set(0, 10, 0);
    camLum.up.set(0, 0, -1);
    camLum.lookAt(0, 0, 0);
    lueurs = new T.InstancedMesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: lueurTex, transparent: true, depthWrite: false, depthTest: false }), LUEUR.max);
    lueurs.count = 0;
    lueurs.frustumCulled = false;
    sceneLum.add(lueurs);
    const dessinerCarte = () => {
      if (!rendu || !carteRT) return;
      const A = pierre(), rt = rendu.getRenderTarget(), a = rendu.getClearAlpha();
      rendu.getClearColor(clairAvant);
      rendu.setRenderTarget(carteRT);
      rendu.setClearColor(fondLum.setScalar(A.base / (A.gain ? LUM_MAX : 1)), 1);
      rendu.render(sceneLum, camLum);
      rendu.setRenderTarget(rt);
      rendu.setClearColor(clairAvant, a);
    };
    const suivreLueurs = () => {
      if (lumiereSale) {
        peindreLumiere();
        return;
      }
      const A = pierre(), [w, p, d] = A.gain ? LUEUR.sol : LUEUR.clair;
      icones.forEach((ic, k) => {
        const v = temps < introFin ? ic.venue : 1;
        if (k < LUEUR.max) lueurs.setMatrixAt(k, lueurM.makeScale(w * v, 1, p * v).setPosition(ic.pos.x, 0, ic.pos.z + d));
        ic.lum.x = ic.pos.x;
        ic.lum.z = ic.pos.z + d;
        ic.lum.f = v;
      });
      lueurs.instanceMatrix.needsUpdate = true;
      dessinerCarte();
      const pl = portail.lumiere(), lp = A.gain && pl.f > 0 ? [{ x: pl.x, z: pl.z, c: pl.c.clone().lerp(new T.Color(1, 1, 1), 0.45).multiplyScalar(A.gain > 12 ? 0.55 : 0.35), f: pl.f, r: 3.5 }] : [];
      troupe?.lumieres?.(A.gain && sol?.material.map === motifSol ? [...lp, ...icones.map((ic) => ic.lum)] : lp);
      troupe?.projecteur?.(A.gain && pl.f > 0 ? { x: pl.x, z: pl.z, r: 3.2, f: pl.f } : null);
    };
    const teindreLueurs = () => {
      const A = pierre(), L = A.lueur, clair = !A.gain, haut = clair ? 1 : LUM_MAX, lis = teinte("--pcv-lisere").c, c2 = new T.Color();
      lueurs.material.blending = clair ? T.NormalBlending : T.AdditiveBlending;
      lueurs.material.opacity = clair ? L.force : 1;
      const k = clair ? 1 : L.force * A.gain / haut;
      icones.forEach((ic, i) => {
        const c = ic.coul || lis, h = ic.halo.material, r = ic.galet.material[1];
        r.color.copy(c).multiplyScalar(LUEUR.liser\u00E9.couleur);
        r.emissive.copy(c).multiplyScalar(LUEUR.liser\u00E9.emission);
        h.blending = clair ? T.NormalBlending : T.AdditiveBlending;
        h.color.copy(c).multiplyScalar(clair ? 1 : L.halo);
        h.opacity = clair ? L.halo : 1;
        if (i < LUEUR.max) lueurs.setColorAt(i, c2.copy(c).multiplyScalar(k));
        ic.lum.c.copy(c).multiplyScalar(0.4);
      });
      let n = Math.min(icones.length, LUEUR.max);
      if (lanternes?.userData.allumees) {
        const [t, f, coul] = LUEUR.lanterne;
        c2.set(coul).multiplyScalar(clair ? 1 : f * A.gain / haut);
        for (const l of lanternes.children) if (l.isSprite && n < LUEUR.max) {
          lueurs.setMatrixAt(n, lueurM.makeScale(t, 1, t).setPosition(l.position.x, 0, l.position.z));
          lueurs.setColorAt(n++, c2);
        }
      }
      const pl = portail.lumiere();
      if (!clair && pl.f > 0 && n < LUEUR.max) {
        lueurs.setMatrixAt(n, lueurM.makeScale(5.5, 1, 5.5).setPosition(pl.x, 0, pl.z));
        lueurs.setColorAt(n++, c2.copy(pl.c).lerp(new T.Color(1, 1, 1), 0.4).multiplyScalar(1.6 * pl.f * A.gain / haut));
      }
      lueurs.count = n;
      if (lueurs.instanceColor) lueurs.instanceColor.needsUpdate = true;
      suivreLueurs();
    };
    const peindreLumiere = () => {
      lumiereSale = false;
      if (!sol) return;
      const A = pierre(), m = sol.material, avec = m.map === motifSol;
      if (!!m.lightMap !== avec) {
        m.lightMap = avec ? carteLum : null;
        m.needsUpdate = true;
      }
      m.lightMapIntensity = (A.gain ? LUM_MAX : 1) * Math.PI;
      teindreLueurs();
      troupe?.ombrer?.({ carte: carteLum, echelle: avec && A.gain ? LUM_MAX : 0, plancher: LUEUR.mii, demi: camLum.right, brume: [BRUME_Z, scene.fog.near, scene.fog.far], couleur: scene.fog.color, proche: ZOOM.fondu });
    };
    let lanternes = null;
    const poserLanternes = () => {
      const g = new T.Group(), pied = new T.CylinderGeometry(0.05, 0.07, 1.5, 6), boule2 = new T.SphereGeometry(0.2, 12, 8);
      const mPied = auMonde(new T.MeshBasicMaterial({ color: 2763312 })), mBoule = new T.MeshBasicMaterial({ color: 16769704, fog: false });
      const halo = new T.SpriteMaterial({
        map: toileTexte(64, 64, (x) => {
          const d = x.createRadialGradient(32, 32, 0, 32, 32, 32);
          d.addColorStop(0, "#fff");
          d.addColorStop(0.5, "rgba(255,255,255,.5)");
          d.addColorStop(1, "rgba(255,255,255,0)");
          x.fillStyle = d;
          x.fillRect(0, 0, 64, 64);
        }),
        color: 16760944,
        blending: T.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        fog: false
      });
      for (let k = 0; k < 10; k++) {
        const a = (k + 0.5) / 10 * Math.PI * 2, x = -RX * 1.32 * Math.sin(a), z = RZ * 1.32 * Math.cos(a) + 0.6;
        if (z > 2) continue;
        const p = new T.Mesh(pied, mPied), b = new T.Mesh(boule2, mBoule), h = new T.Sprite(halo);
        p.position.set(x, 0.75, z);
        b.position.set(x, 1.6, z);
        h.position.set(x, 1.6, z);
        h.scale.setScalar(1.6);
        g.add(p, b, h);
      }
      g.visible = false;
      g.userData.boule = mBoule;
      return g;
    };
    const PORTAIL = { x: -19.5, z: -11, dir: 0.6, socle: 0.035, r: 1.2, rc: 0.85, za: -0.95, parvis: 3.5 };
    {
      const c = [PORTAIL.x + 2 * Math.sin(PORTAIL.dir), PORTAIL.z + 2 * Math.cos(PORTAIL.dir)];
      vue.zone?.((c[0] - CENTRE.x) / RX, (c[1] - CENTRE.z) / RZ, 0.3);
    }
    const etatReel = () => !window.__pcvNintendo?.mii ? "detruit" : window.__pcvSpotPass?.actif?.() ? "normal" : "eteint";
    let portailEssai = null;
    const etatPortail = () => portailEssai || etatReel();
    const PHOSPHO = { couleur: [0.05, 0.25, 0.17] };
    const portail = (() => {
      let D = null, mode = null, nom = null, t = 0, q = 0, VENT = { value: 0 }, nuit = false, noirAp = false, eclaire = 0, lumPeinte = 0;
      const eteint = new T.Color();
      const LUMIERE = { x: 0, z: 0, c: new T.Color(), f: 0, r: 4 };
      const HAUT = new T.Vector3(0, 1, 0), BASE = new T.Vector3(PORTAIL.x, 0, PORTAIL.z), BLANC = new T.Color(1, 1, 1), REPOS = new T.Color(12894392);
      const local = (x, z, y = 0, v = new T.Vector3()) => v.set(x, y, z).applyAxisAngle(HAUT, PORTAIL.dir).add(BASE);
      const couleur = (n) => new T.Color(getComputedStyle(document.documentElement).getPropertyValue(n === "bleu" ? "--pcv-c-spotpass" : "--pcv-vert").trim() || (n === "bleu" ? "#1f8fff" : "#2fbf71"));
      const lum = (o) => new T.MeshBasicMaterial({ transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false, opacity: 0, ...o });
      const rond = (stops) => toileTexte(128, 128, (x) => {
        const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
        for (const [k, c] of stops) g.addColorStop(k, c);
        x.fillStyle = g;
        x.fillRect(0, 0, 128, 128);
      });
      const plaque0 = rond([[0, "#fff"], [0.7, "#fff"], [1, "#d8d8d8"]]);
      const hexa = (x) => {
        x.drawImage(plaque0.image, 0, 0, 512, 512);
        x.strokeStyle = "rgba(110,120,130,.3)";
        x.lineWidth = 1.5;
        const s = 22;
        for (let j = -1; j < 26; j++) for (let i = -1; i < 14; i++) {
          const cx = i * s * 1.73 + j % 2 * s * 0.87, cy = j * s * 1.5 * 0.58 * 2;
          x.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = k / 6 * 6.283 + 0.52;
            x.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s);
          }
          x.closePath();
          x.stroke();
        }
      };
      let CREME = null, CREME2 = null, essai = "normal";
      const SEG = { value: new T.Vector2() };
      const appliquerEtat = () => {
        if (essai === "normal") return;
        const P = D.P, R = PORTAIL.r, RC = PORTAIL.rc, ZA = PORTAIL.za;
        const tores = P.children.filter((o) => o.isMesh && o.geometry.type === "TorusGeometry");
        const pierre2 = tores.find((o) => o.geometry.parameters.tube === 0.15), dos = tores.find((o) => o.geometry.parameters.tube === 0.05);
        const lumieres = [D.tube, dos, D.halo, ...D.voiles, D.flaque, D.halPlaque, D.colonne], mat = pierre2.material, add = (o) => {
          P.add(o);
          return o;
        };
        let g = 7;
        const al = () => (g = g * 48271 % 2147483647) / 2147483647;
        let tubeMort = null;
        const debris = (m, c) => {
          m.userData.base = c;
          m.onBeforeCompile = (s) => brumeMonde(s);
          (D.debris ||= []).push(m);
        };
        const morceau = (a0, a1, x, y, z, rx, ry, rz) => {
          const m = add(new T.Mesh(new T.TorusGeometry(R, 0.15, 16, 24, a1 - a0), mat));
          m.geometry.rotateZ(a0);
          const tb = new T.Mesh(new T.TorusGeometry(R, 0.07, 12, 48, a1 - a0), tubeMort ||= Object.assign(D.tube.material.clone(), { onBeforeCompile: D.tube.material.onBeforeCompile }));
          D.tubeMort = tubeMort;
          tubeMort.color.setScalar(nuit ? noirAp ? 0.3 : 0.45 : 0.6);
          tb.geometry.rotateZ(a0);
          tb.position.z = 0.13;
          m.add(tb);
          m.position.set(x, y, z);
          m.rotation.set(rx, ry, rz);
          return m;
        };
        const plaque = D.fondPicto.parent;
        const fendre = () => {
          const tx = toileTexte(512, 512, (x) => {
            hexa(x);
            x.fillStyle = "rgba(150,145,135,.35)";
            x.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 1800; i++) {
              x.fillStyle = `rgba(${90 + i % 5 * 10},${85 + i % 7 * 8},70,${0.04 + i % 3 * 0.025})`;
              x.beginPath();
              x.arc(i * 97 % 512, i * 211 % 512, 2 + i % 9, 0, 7);
              x.fill();
            }
            x.strokeStyle = "rgba(60,52,44,.8)";
            for (let k = 0; k < 7; k++) {
              x.lineWidth = 2 + k % 3;
              x.beginPath();
              let px = 256, py = 256;
              x.moveTo(px, py);
              const a = k * 0.9 + al();
              for (let s = 0; s < 9; s++) {
                px += Math.cos(a + (al() - 0.5)) * 30;
                py += Math.sin(a + (al() - 0.5)) * 30;
                x.lineTo(px, py);
              }
              x.stroke();
            }
          });
          for (const o of [D.disque, D.lisere]) {
            const m = new T.MeshLambertMaterial({ map: o === D.disque ? tx : null, color: o === D.disque ? 16777215 : 9406847 });
            m.onBeforeCompile = (s) => brumeMonde(s);
            o.material.dispose();
            o.material = m;
          }
        };
        const ruine = (k) => {
          for (const o of [...lumieres, pierre2]) o.visible = false;
          D.face.material.opacity = 0.25;
          SOL.pcvRuine.value = k;
          fendre();
          const fp = new T.MeshLambertMaterial({ color: 4869717 });
          fp.onBeforeCompile = (s) => brumeMonde(s);
          D.fondPicto.material = fp;
          D.face.material.opacity = 0.12;
        };
        const eclats = (n, zone) => {
          const m = mat;
          for (let i = 0; i < n; i++) {
            const e = add(new T.Mesh(new T.DodecahedronGeometry(0.06 + al() * 0.1, 0), m));
            const a = al() * 6.28, r = zone * Math.sqrt(al());
            e.position.set(Math.cos(a) * r, 0.03, Math.sin(a) * r * 0.8 + 0.2);
            e.rotation.set(al() * 3, al() * 3, al() * 3);
            e.scale.set(1.4, 0.55, 1);
          }
        };
        const herbe = (garde, sec) => {
          const c = new T.Color(), m42 = new T.Matrix4();
          for (let i = 0; i < D.herbe.count; i++) {
            if (al() > garde) {
              D.herbe.getMatrixAt(i, m42);
              m42.scale(new T.Vector3(1e-3, 1e-3, 1e-3));
              D.herbe.setMatrixAt(i, m42);
              continue;
            }
            D.herbe.getColorAt(i, c);
            D.herbe.setColorAt(i, c.lerp(new T.Color(0.78, 0.7, 0.45), sec * (0.5 + al() * 0.5)));
          }
          D.herbe.instanceMatrix.needsUpdate = true;
          D.herbe.instanceColor.needsUpdate = true;
        };
        const mousse = (n) => {
          const geo = new T.SphereGeometry(0.09, 10, 6), m = new T.MeshLambertMaterial({ color: 6060602 });
          debris(m, 6060602);
          for (let i = 0; i < n; i++) {
            const a = al() * 6.28, s = add(new T.Mesh(geo, m));
            s.position.set(Math.cos(a) * (R + (al() - 0.5) * 0.3), al() * 0.25, ZA + (al() - 0.5) * 0.3);
            s.scale.set(1 + al(), 0.35 + al() * 0.3, 1 + al());
          }
        };
        const racines = (n) => {
          const m = new T.MeshLambertMaterial({ color: 5916210 });
          debris(m, 5916210);
          for (let i = 0; i < n; i++) {
            const a = al() * 6.28, r0 = 1.3 + al() * 0.4, pts2 = [];
            for (let k = 0; k < 6; k++) pts2.push(new T.Vector3(Math.cos(a + k * 0.12) * (r0 - k * 0.08), 0.02 + Math.sin(k) * 0.02, Math.sin(a + k * 0.12) * (r0 - k * 0.08) * 0.9 + ZA * 0.2));
            add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts2), 24, 0.022 - i % 3 * 4e-3, 6), m));
          }
        };
        if (essai === "eteint") {
          mousse(9);
          racines(5);
        }
        if (essai === "detruit") {
          ruine(0.25);
          morceau(-0.35, 1.75, 0, RC, ZA, 0, 0, 0);
          morceau(0, 1.1, 0.2, 0.15, 1.2, Math.PI / 2, 0, -2.6);
          eclats(10, 1.6);
          plaque.position.set(-0.3, 0.1, 1.3);
          plaque.rotation.set(-Math.PI / 2 + 0.1, 0, 0.4);
          herbe(0.75, 0.35);
        }
      };
      const essaiEteint = () => essai !== "normal";
      const construire2 = () => {
        const P = new T.Group(), { socle: SOC, za: ZA, r: R, rc: RC } = PORTAIL, add = (o, x = 0, y = 0, z = 0) => {
          o.position.set(x, y, z);
          P.add(o);
          return o;
        };
        P.position.copy(BASE);
        P.rotation.y = PORTAIL.dir;
        SOL.pcvPortail.value.set(PORTAIL.x + 70, 70 - PORTAIL.z, 1);
        essai = etatPortail();
        const toileE = (f) => {
          const x = toileTexte(512, 512, f);
          x.wrapS = x.wrapT = T.RepeatWrapping;
          x.anisotropy = 8;
          return x;
        };
        const VAR = { c: 11847380, c2: 10728642, sh: 60, sp: 4872806, t: (x) => {
          x.fillStyle = "#eeeeee";
          x.fillRect(0, 0, 512, 512);
          for (let i = 0; i < 6e3; i++) {
            x.fillStyle = i % 2 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.05)";
            x.fillRect(i * 131 % 512, i * 271 % 512, 1, 1);
          }
        } };
        {
          const tx = toileE(VAR.t);
          tx.repeat.set(8, 1);
          CREME = new T.MeshPhongMaterial({ color: VAR.c, map: tx, shininess: VAR.sh, specular: VAR.sp });
          CREME2 = new T.MeshPhongMaterial({ color: VAR.c2, map: tx, shininess: VAR.sh * 0.6, specular: VAR.sp });
          CREME.userData.base = VAR.c;
          CREME2.userData.base = VAR.c2;
        }
        for (const m of [CREME, CREME2]) {
          m.onBeforeCompile = (s) => (nuit ? brumeMonde : brumeLegere)(s);
          m.customProgramCacheKey = () => nuit ? "portail-nuit" : "portail";
        }
        add(new T.Mesh(new T.CylinderGeometry(1.8, 1.85, SOC, 48), CREME2), 0, SOC / 2);
        const lisere = add(new T.Mesh(new T.RingGeometry(1.4, 1.55, 48).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 14675684 })), 0, SOC + 4e-3);
        const disque = add(new T.Mesh(new T.CircleGeometry(1.4, 48).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: toileTexte(512, 512, hexa), color: 16513266 })), 0, SOC + 3e-3);
        add(new T.Mesh(new T.TorusGeometry(R, 0.15, 16, 72), CREME), 0, RC, ZA);
        const bande = new T.DataTexture(new Uint8Array(256 * 4), 256, 1);
        bande.wrapS = T.RepeatWrapping;
        bande.magFilter = bande.minFilter = T.LinearFilter;
        bande.colorSpace = T.SRGBColorSpace;
        const mTube = new T.MeshBasicMaterial({ map: bande, transparent: true, opacity: 0.95, fog: false });
        mTube.onBeforeCompile = (s) => {
          s.uniforms.pcvSeg = SEG;
          s.fragmentShader = s.fragmentShader.replace("void main() {", "uniform vec2 pcvSeg;\nvoid main() {").replace("#include <map_fragment>", "#include <map_fragment>\n{ float u = (vMapUv.x - pcvSeg.x) * 51.2, w = fwidth(u), f = fract(u), s = smoothstep(.0, w, f) * (1. - smoothstep(.4 - w, .4, f));\n  diffuseColor.rgb *= mix(mix(.76, 1.04, s), mix(.84, 1.06, s), pcvSeg.y); }");
        };
        const tube = add(new T.Mesh(new T.TorusGeometry(R, 0.07, 12, 120), mTube), 0, RC, ZA + 0.13);
        add(new T.Mesh(new T.TorusGeometry(R, 0.05, 8, 120), tube.material), 0, RC, ZA - 0.13);
        const halo = add(new T.Mesh(new T.TorusGeometry(R, 0.2, 8, 120), lum({ map: bande })), 0, RC, ZA + 0.13);
        const spir = toileTexte(256, 256, (x) => {
          x.translate(128, 128);
          const g = x.createRadialGradient(0, 0, 0, 0, 0, 128);
          g.addColorStop(0, "rgba(255,255,255,.95)");
          g.addColorStop(0.55, "rgba(255,255,255,.45)");
          g.addColorStop(1, "rgba(255,255,255,.12)");
          x.fillStyle = g;
          x.beginPath();
          x.arc(0, 0, 128, 0, 7);
          x.fill();
          x.globalCompositeOperation = "lighter";
          for (let k = 0; k < 3; k++) {
            x.rotate(Math.PI * 2 / 3);
            x.beginPath();
            for (let s = 0; s < 1; s += 0.01) {
              const r = 10 + s * 118, a = s * 4.2;
              x.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            x.lineWidth = 17;
            x.strokeStyle = "rgba(255,255,255,.28)";
            x.lineCap = "round";
            x.stroke();
          }
        });
        const voiles = [ZA, ZA - 0.02].map((z) => {
          const s = spir.clone();
          s.center.set(0.5, 0.5);
          return add(new T.Mesh(new T.CircleGeometry(R - 0.08, 48), lum({ map: s, side: T.DoubleSide, blending: T.NormalBlending })), 0, RC, z);
        });
        const haut = RC + R + 0.15;
        add(new T.Mesh(new T.CylinderGeometry(0.09, 0.13, 0.22, 12), CREME2), 0, haut + 0.06, ZA + 0.06);
        const plaque = add(new T.Group(), 0, haut + 0.5, ZA + 0.12);
        plaque.add(new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.12, 40).rotateX(Math.PI / 2), CREME), new T.Mesh(new T.TorusGeometry(0.42, 0.04, 8, 40), CREME2));
        const fondPicto = new T.Mesh(new T.CircleGeometry(0.34, 40), new T.MeshBasicMaterial({ color: 8376216, fog: false }));
        fondPicto.position.z = 0.062;
        plaque.add(fondPicto);
        const picto = toileTexte(128, 128, () => {
        }), face = new T.Mesh(new T.CircleGeometry(0.34, 40), new T.MeshBasicMaterial({ map: picto, transparent: true, fog: false }));
        face.position.z = 0.064;
        plaque.add(face);
        const im = new Image();
        im.onload = () => {
          const x = picto.image.getContext("2d");
          x.drawImage(im, 22, 20, 84, 84);
          picto.needsUpdate = true;
        };
        im.src = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color="#fff" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">${window.__pcvIcones?.trace?.("spotpass") || ""}</svg>`);
        const halPlaque = new T.Sprite(new T.SpriteMaterial({ map: rond([[0, "rgba(255,255,255,1)"], [0.4, "rgba(255,255,255,.4)"], [1, "rgba(255,255,255,0)"]]), blending: T.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false, fog: false }));
        halPlaque.scale.setScalar(1.5);
        halPlaque.position.z = 0.1;
        plaque.add(halPlaque);
        const tache = halPlaque.material.map, flaque = add(new T.Mesh(new T.PlaneGeometry(6.4, 6.4).rotateX(-Math.PI / 2), lum({ map: tache })), 0, SOC + 0.01, ZA * 0.4);
        const grad = toileTexte(32, 128, (x) => {
          const g = x.createLinearGradient(0, 128, 0, 0);
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.5, "rgba(255,255,255,.55)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          x.fillStyle = g;
          x.fillRect(0, 0, 32, 128);
        });
        const colonne = add(new T.Group(), 0, SOC, ZA + 0.15);
        const col = new T.Mesh(new T.CylinderGeometry(0.62, 0.72, 2.7, 32, 1, true), lum({ map: grad, side: T.DoubleSide, blending: T.NormalBlending }));
        col.position.y = 1.35;
        const coeur = new T.Mesh(new T.CylinderGeometry(0.3, 0.4, 2.3, 20, 1, true), lum({ map: grad, side: T.DoubleSide }));
        coeur.position.y = 1.15;
        const etoile = toileTexte(32, 32, (x) => {
          x.translate(16, 16);
          x.fillStyle = "#fff";
          x.beginPath();
          for (let i = 0; i < 8; i++) {
            const r = i % 2 ? 3.5 : 15, a = i / 8 * Math.PI * 2;
            x.lineTo(Math.sin(a) * r, -Math.cos(a) * r);
          }
          x.fill();
        });
        const etincelles = Array.from({ length: 12 }, (_, i) => {
          const s = new T.Sprite(new T.SpriteMaterial({ map: etoile, blending: T.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
          colonne.add(s);
          return { s, a: i * 2.4, r: 0.4 + i * 37 % 10 / 20, h: i * 53 % 30 / 10, k: 0.1 + i % 4 * 0.045, v: 0.6 + i % 5 * 0.15 };
        });
        const descente = new T.Sprite(new T.SpriteMaterial({ map: halPlaque.material.map, transparent: true, opacity: 0, depthWrite: false, fog: false }));
        for (const m of [lisere.material, disque.material]) m.onBeforeCompile = (s) => brumeMonde(s);
        const brins = [], cols = [], vB = new T.Color(0.3, 0.42, 0.2), vM = new T.Color(0.48, 0.64, 0.32), vH = new T.Color(0.7, 0.84, 0.48);
        for (let b = 0; b < 7; b++) {
          const a = b / 7 * 6.283 + b * 1.7 % 1, r0 = 6e-3 + b * 53 % 7 * 3e-3, h = 0.06 + b * 37 % 7 * 0.011, pen = 0.15 + b * 29 % 5 * 0.08, w = 8e-3 + b % 3 * 3e-3;
          const cx = Math.cos(a) * r0, cz = Math.sin(a) * r0, ox = Math.cos(a), oz = Math.sin(a), px = -oz * w, pz2 = ox * w;
          const mx = cx + ox * pen * h * 0.35, mz = cz + oz * pen * h * 0.35, tx = cx + ox * pen * h, tz = cz + oz * pen * h;
          const q2 = [[cx - px, 0, cz - pz2], [cx + px, 0, cz + pz2], [mx - px * 0.6, h * 0.55, mz - pz2 * 0.6], [mx + px * 0.6, h * 0.55, mz + pz2 * 0.6], [tx, h, tz]];
          for (const [u2, v, w2] of [[0, 1, 2], [1, 3, 2], [2, 3, 4]]) {
            for (const k of [u2, v, w2]) {
              brins.push(...q2[k]);
              cols.push(...(k < 2 ? vB : k < 4 ? vM : vH).toArray());
            }
          }
        }
        const gB = new T.BufferGeometry();
        gB.setAttribute("position", new T.Float32BufferAttribute(brins, 3));
        gB.setAttribute("color", new T.Float32BufferAttribute(cols, 3));
        gB.computeVertexNormals();
        const vent = (fleur) => (s) => {
          brumeMonde(s);
          s.uniforms.pcvVent = VENT;
          s.uniforms.pcvPhospho = SOL.pcvPhospho;
          s.fragmentShader = s.fragmentShader.replace("void main() {", "uniform vec3 pcvPhospho; varying float pcvHt;\nvoid main() {").replace("#include <dithering_fragment>", "gl_FragColor.rgb += pcvPhospho * mix(.15, 1., pcvHt * pcvHt);   // (apr\xE8s la brume : la nuit ne l'\xE9teint pas)\n#include <dithering_fragment>");
          s.vertexShader = s.vertexShader.replace("void main() {", "uniform float pcvVent; varying float pcvHt;\nvoid main() {").replace("#include <project_vertex>", `pcvHt = ${fleur ? "0." : "clamp(transformed.y / .126, 0., 1.)"};
vec4 mvPosition = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
mvPosition = instanceMatrix * mvPosition;
#endif
vec4 pcvW = modelMatrix * mvPosition; vec2 pcvD = vec2(.93, .37);
float pcvH = max(pcvW.y - modelMatrix[3].y, 0.) * ${fleur ? "1." : "clamp(transformed.y / .126, 0., 1.)"};
float pcvR = .5 + .5 * sin(dot(pcvW.xz, pcvD) * .7 - pcvVent * .55) * (.6 + .4 * sin(dot(pcvW.xz, vec2(-.37, .93)) * .45 + pcvVent * .23));
pcvW.xz += pcvD * pcvH * (.035 + .1 * pcvR * pcvR + .02 * sin(pcvVent * 1.7 + pcvW.x * 6.1 + pcvW.z * 4.3));
mvPosition = viewMatrix * pcvW;
gl_Position = projectionMatrix * mvPosition;`);
        };
        const mB = new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide });
        mB.onBeforeCompile = vent(false);
        mB.customProgramCacheKey = () => "herbe-vent";
        let g3 = 7;
        const al = () => (g3 = g3 * 48271 % 2147483647) / 2147483647, places = [];
        const br = (x, z) => 0.5 + 0.25 * Math.sin(x * 1.71 + z * 0.93 + 1.3) * Math.sin(z * 1.37 - x * 0.61 + 0.4) + 0.25 * Math.sin(x * 3.13 - z * 2.71 + 2.2) * Math.sin(z * 2.9 + x * 1.9);
        for (let i = 0; i < 6e3 && places.length < 2600; i++) {
          const a = al() * 6.2832, r = 3.42 + al() * (ILOT.fin - 3.42), bord2 = ILOT.bord + Math.sin(a * 7) * 0.15 + Math.sin(a * 3 + 1) * 0.12;
          const x = Math.cos(a) * r, z = Math.sin(a) * r, d = br(x, z), k = Math.max(0, (ILOT.fin - r) / (ILOT.fin - bord2));
          if ((r < bord2 || al() < 0.45 * k * k) && al() < 0.25 + d * 0.9) places.push([x, z, (0.6 + al() * 0.8) * (r < bord2 ? 1 : 0.6 + 0.4 * k)]);
        }
        const bd = bruitSol.image.data, H = (x, y) => {
          const k = ((y & 127) * 128 + (x & 127)) * 4;
          return [bd[k] / 255, bd[k + 1] / 255, bd[k + 2] / 255, bd[k + 3] / 255];
        };
        for (let k = 0; k < 4; k++) {
          const rk = 1.86 + k * 0.4, n = Math.floor(6.2832 * (rk + 0.2) / 0.62);
          for (let ia = 0; ia < n; ia++) {
            const hp = H(ia + 733, k + 157), garde = (rk + 0.4 <= 2.8 || hp[2] >= 0.45) && hp[3] >= 0.07;
            if (garde || rk > 3.42) continue;
            const th = ((ia + 0.5 - 0.5 * (k % 2)) / n - 0.5) * 6.2832;
            for (let m = 0; m < 6; m++) {
              const rr = rk + 0.06 + al() * 0.28, tt = th + (al() - 0.5) * 5 / n;
              places.push([Math.cos(tt) * rr, Math.sin(tt) * rr, 0.5 + al() * 0.6]);
            }
          }
        }
        for (let i = 0; i < 140; i++) {
          const a = al() * 6.2832, r = 2.66 + al() * 0.76;
          if (br(Math.cos(a) * r, Math.sin(a) * r) > 0.55) places.push([Math.cos(a) * r, Math.sin(a) * r, 0.35 + al() * 0.35]);
        }
        const herbe = new T.InstancedMesh(gB, mB, places.length), m42 = new T.Matrix4(), q4 = new T.Quaternion(), e4 = new T.Vector3(), cB = new T.Color(), eu = new T.Euler();
        const TEINTES = [[0.25, 0.5, 0.5], [0.22, 0.55, 0.55], [0.28, 0.45, 0.48], [0.18, 0.5, 0.58], [0.3, 0.35, 0.42]];
        places.forEach(([x, z, s], i) => {
          eu.set((al() - 0.5) * 0.5, al() * 6.2832, (al() - 0.5) * 0.5);
          q4.setFromEuler(eu);
          const haut2 = al() < 0.05 ? 1.9 : 1;
          e4.set(s * (0.7 + al() * 0.6), s * (0.6 + al() * 0.7) * haut2, s * (0.7 + al() * 0.6));
          m42.compose(new T.Vector3(x, 1e-3, -z).applyAxisAngle(HAUT, -PORTAIL.dir), q4, e4);
          const [hh, ss, ll] = TEINTES[Math.floor(al() * TEINTES.length)];
          herbe.setMatrixAt(i, m42);
          herbe.setColorAt(i, cB.setHSL(hh + (al() - 0.5) * 0.03, ss, ll + (al() - 0.5) * 0.1).multiplyScalar(1.5));
        });
        const pet = [], pc = [], blanc2 = new T.Color(1, 1, 1), coeurC = new T.Color(1, 0.82, 0.3);
        for (let k = 0; k < 5; k++) {
          const a = k / 5 * 6.2832, b = a + 0.5;
          pet.push(0, 0, 0, Math.cos(a) * 0.022, 0, Math.sin(a) * 0.022, Math.cos(b) * 0.022, 0, Math.sin(b) * 0.022);
          pc.push(...coeurC.toArray(), ...blanc2.toArray(), ...blanc2.toArray());
        }
        const gF = new T.BufferGeometry();
        gF.setAttribute("position", new T.Float32BufferAttribute(pet, 3));
        gF.setAttribute("color", new T.Float32BufferAttribute(pc, 3));
        gF.computeVertexNormals();
        const mF = new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide });
        mF.onBeforeCompile = vent(true);
        mF.customProgramCacheKey = () => "fleur-vent";
        const lieuxF = places.filter(() => al() < 0.022), fleurs = new T.InstancedMesh(gF, mF, lieuxF.length), FC = [16777215, 16773544, 16173532, 14274037];
        lieuxF.forEach(([x, z], i) => {
          q4.setFromAxisAngle(HAUT, al() * 6.28);
          e4.setScalar(0.8 + al() * 0.6);
          m42.compose(new T.Vector3(x + (al() - 0.5) * 0.05, 0.05 + al() * 0.04, -z).applyAxisAngle(HAUT, -PORTAIL.dir), q4, e4);
          fleurs.setMatrixAt(i, m42);
          fleurs.setColorAt(i, cB.set(FC[Math.floor(al() * FC.length)]));
        });
        herbe.frustumCulled = false;
        fleurs.frustumCulled = false;
        P.add(herbe, fleurs);
        colonne.visible = false;
        scene.add(P);
        D = { P, bande, tube, halo, voiles, lisere, disque, fondPicto, face, halPlaque, flaque, colonne, col, coeur, etincelles, descente, herbe, fleurs };
        appliquerEtat();
        regler("repos");
        return P;
      };
      const peindre = (c) => {
        const px = D.bande.image.data, c2 = c?.clone().offsetHSL(0.08, 0, 0.04), k = new T.Color();
        const repos = nuit ? eteint : REPOS;
        for (let i = 0; i < 256; i++) {
          if (!c) {
            k.copy(repos);
            if (nuit) k.convertLinearToSRGB();
          } else {
            const w = 0.5 + 0.5 * Math.sin(i / 256 * 3 * Math.PI * 2);
            k.copy(c).lerp(c2, w).lerp(BLANC, 0.12 * (1 - w));
          }
          const g = 1;
          px[i * 4] = Math.min(255, k.r * 255 * g);
          px[i * 4 + 1] = Math.min(255, k.g * 255 * g);
          px[i * 4 + 2] = Math.min(255, k.b * 255 * g);
          px[i * 4 + 3] = 255;
        }
        D.bande.needsUpdate = true;
      };
      const regler = (m, n = nom, k = 0) => {
        if (!D) return;
        if (essaiEteint()) m = "repos";
        const c = m === "repos" ? null : couleur(n || "vert");
        const sol2 = theme ? theme.moyenne.clone().multiplyScalar(nuit ? 1 : 1.05) : new T.Color().setRGB(...SOL.pcvTe.value[0].toArray(), T.SRGBColorSpace);
        const ombre = theme ? 1 : noirAp ? 0.22 : 0.5;
        eteint.copy(theme ? theme.moyenne : sol2).multiplyScalar(theme ? noirAp ? 0.4 : 0.55 : noirAp ? 0.62 : 1.05);
        if ((m !== mode || n !== nom) && essai === "detruit") peindre(null);
        else if (m !== mode || n !== nom) {
          peindre(c);
          D.lisere.material.color.copy(c ? c.clone().lerp(BLANC, 0.05) : nuit ? sol2.clone().multiplyScalar(ombre * 0.8) : theme ? sol2.clone().multiplyScalar(1.6) : new T.Color(14675684));
          D.disque.material.color.copy(c ? c.clone().lerp(BLANC, nuit ? 0.15 : 0.5) : nuit ? sol2.clone().multiplyScalar(ombre) : theme ? sol2.clone().multiplyScalar(1.3) : new T.Color(16513266));
          D.fondPicto.material.color.copy(couleur("bleu")).multiplyScalar(nuit ? 0.55 : 1);
          D.halPlaque.material.color.copy(couleur("bleu"));
          for (const o of [D.halo, D.flaque, ...D.voiles, D.col, D.coeur, D.descente]) o.material.color.copy(c || BLANC);
        }
        if (essaiEteint()) {
          if (essai === "eteint") {
            D.fondPicto.material.color.set(9080983);
            D.disque.material.color.multiplyScalar(0.82);
          }
          D.halPlaque.visible = false;
        }
        mode = m;
        nom = n;
        q = k;
        D.tube.material.opacity = c ? 1 : 0.78;
        D.flaque.scale.setScalar(n === "bleu" && c ? 1.4 : 1);
        D.colonne.visible = m === "tele" || m === "descente";
      };
      const maj = (dt) => {
        if (!D) return;
        t += dt;
        VENT.value = t;
        const allume = mode !== "repos", att = mode === "attente", resp = 0.6 + 0.15 * Math.sin(t * 2.4);
        eclaire += ((allume && !att ? 1 : 0) - eclaire) * Math.min(1, dt * 2.5);
        if (eclaire < 0.01) eclaire = 0;
        if (Math.abs(eclaire - lumPeinte) > 0.08 || !eclaire && lumPeinte) {
          lumPeinte = eclaire;
          lumiereSale = true;
        }
        const fort = !allume ? 0 : att ? resp : 1;
        if (allume) D.bande.offset.x = -t * 0.35 / 3;
        SEG.value.set(D.bande.offset.x, allume ? 1 : 0);
        D.halo.material.opacity = allume ? att ? 0.25 + 0.1 * Math.sin(t * 2.4) : 0.42 : 0;
        D.voiles.forEach((v, i) => {
          v.material.opacity = fort * (i ? 0.3 : 0.5);
          v.material.map.rotation = i ? t * 0.8 + 1 : -t * 1.3;
        });
        D.halPlaque.material.opacity = allume ? 0.55 * Math.max(fort, 0.5) : 0;
        D.flaque.material.opacity = fort * 0.85;
        if (!D.colonne.visible) return;
        const tele = mode === "tele", m = Math.min(1, q * 1.6) * (q > 0.8 ? 1 - (q - 0.8) * 5 : 1);
        D.col.visible = D.coeur.visible = tele;
        D.descente.visible = !tele;
        if (tele) {
          D.colonne.scale.set(1, Math.max(0.01, Math.min(1, q * 2.2)), 1);
          D.col.material.opacity = 0.42 * m;
          D.coeur.material.opacity = 0.3 * m;
        } else {
          D.colonne.scale.set(1, 1, 1);
          D.descente.position.set(0, (PORTAIL.rc - 0.45) * (1 - lisse(q)) + 0.45, 0);
          D.descente.scale.setScalar(0.5 + 1.4 * Math.sin(Math.min(1, q * 1.15) * Math.PI / 2));
          D.descente.material.opacity = q < 0.85 ? 1 : (1 - q) / 0.15;
        }
        for (const e of D.etincelles) {
          const a = e.a + t * e.v * 2, h = (e.h + t * e.v) % 3.2;
          e.s.position.set(Math.cos(a) * e.r * (tele ? 1 : 1.6), 0.1 + h, Math.sin(a) * e.r * (tele ? 1 : 1.6));
          e.s.scale.setScalar(e.k * (1 - h / 3.4));
          e.s.material.opacity = tele ? m : (1 - q) * 0.9;
        }
      };
      let theme = null;
      const matiere = (map, teinte2, motif, moyenne = teinte2) => {
        if (!CREME) return;
        const avant = theme;
        theme = map || teinte2.getHex() !== 16777215 ? { map: motif ? map : null, teinte: (motif ? teinte2 : moyenne).clone(), moyenne: moyenne.clone() } : null;
        for (const [m, c, k] of [[CREME, 16184042, 1.12], [CREME2, 15130577, 1]]) {
          if (avant?.map && m.map !== avant.map) m.map?.dispose();
          if (!theme) {
            m.color.setHex(c);
            m.map = null;
          } else {
            m.color.copy(theme.moyenne).multiplyScalar(k);
            m.map = null;
          }
          m.emissiveMap = m.map;
          m.needsUpdate = true;
        }
        if (D) {
          const a = D.herbe.instanceColor.array, b = D.herbe.userData.base ||= a.slice(), pT = theme ? theme.moyenne.clone() : new T.Color().setRGB(...SOL.pcvTe.value[0].toArray(), T.SRGBColorSpace);
          pT.multiplyScalar(3 / Math.max(0.05, pT.r + pT.g + pT.b));
          const k = [pT.r, pT.g, pT.b].map((x) => 1 + (x - 1) * ILOT.teinte);
          for (let i = 0; i < a.length; i++) a[i] = b[i] * k[i % 3];
          const P = ILOT.pastel * ILOT.brins * lisse((SOL.pcvTe.value[0].toArray().reduce((s, x) => s + x) / 3 / 0.93 - 0.6) / 0.3);
          if (P > 0) for (let i = 0; i < a.length; i += 3) {
            const g = a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11;
            for (let j = 0; j < 3; j++) a[i + j] += ((g + (a[i + j] - g) * 0.55) * 0.6 + ILOT.laiteux[j] - a[i + j]) * P;
          }
          D.herbe.instanceColor.needsUpdate = true;
        }
        apparence(apparenceSol);
      };
      const apparence = (ap) => {
        const avant = nuit;
        nuit = !!ap && ap !== "clair";
        noirAp = ap === "noir";
        SOL.pcvVeille.value = ap === "noir" ? 1 : ap === "gris" ? 0.85 : 0;
        for (const [m, c, k] of [[CREME, 16184042, 1.12], [CREME2, 15130577, 1]]) {
          if (!m) continue;
          const base = theme ? theme.moyenne.clone().multiplyScalar(k) : new T.Color(m.userData.base ?? c), f = !nuit ? 1 : theme ? 0.9 : noirAp ? 0.17 : 0.3;
          m.color.copy(base).multiplyScalar(f * (nuit ? 0.25 : theme ? 0.7 : 1));
          m.emissive.copy(base).multiplyScalar(essai === "detruit" ? 0 : nuit ? f * 0.85 : theme ? 0.35 : 0.1);
          if (avant !== nuit) m.needsUpdate = true;
        }
        if (D?.tubeMort) D.tubeMort.color.setScalar(nuit ? noirAp ? 0.3 : 0.45 : 0.6);
        for (const m of D?.debris || []) m.color.setHex(m.userData.base).multiplyScalar(nuit ? (noirAp ? 0.17 : 0.3) * 1.3 : 1);
        SOL.pcvPhospho.value.set(...nuit ? PHOSPHO.couleur : [0, 0, 0]);
        sansBrume.value.set(...nuit ? SANS_BRUME.nuit : [ILOT.fin, ILOT.fin + SANS_BRUME.fondu]);
        if (D) {
          D.herbe.material.emissive.setRGB(0, 0, 0);
          D.fleurs.material.emissive.setRGB(0.1, 0.1, 0.1).multiplyScalar(SOL.pcvVeille.value);
          D.face.material.opacity = essai === "detruit" ? 0.12 : nuit ? 0.8 : 1;
          const m = mode;
          mode = null;
          regler(m || "repos", nom, q);
        }
      };
      const lumiere = () => {
        local(0, 0.4, 0, v0);
        LUMIERE.x = v0.x;
        LUMIERE.z = v0.z;
        LUMIERE.c.copy(couleur(nom || "vert"));
        LUMIERE.f = lumPeinte;
        return LUMIERE;
      }, v0 = new T.Vector3();
      const refaire = () => {
        D.P.removeFromParent();
        D.P.traverse((o) => {
          o.geometry?.dispose?.();
        });
        SOL.pcvRuine.value = 0;
        mode = null;
        construire2();
        const ap = apparenceSol;
        nuit = null;
        apparence(ap);
        teindreSol();
        regler("repos");
      };
      const suivre = () => {
        if (D && etatPortail() !== essai) refaire();
      };
      return {
        construire: construire2,
        regler,
        maj,
        local,
        apparence,
        matiere,
        lumiere,
        suivre,
        etat: () => essai,
        socle: () => D && [D.disque, D.lisere],
        ignores: () => D ? [D.flaque, ...D.voiles, D.herbe, D.fleurs, D.halo, D.halPlaque, D.descente] : [],
        objet: () => D?.P,
        mode: () => mode,
        cacher: (k) => {
          for (const o of D.P.children) if (o.isMesh && o.geometry.type === "TorusGeometry" && o.geometry.parameters.tube === k) o.visible = false;
          return 1;
        },
        couleurs: () => D && [D.disque.material.color.getHexString(), D.lisere.material.color.getHexString(), D.disque.material.fog, nuit, noirAp],
        // (essais)
        apparition: () => local(0, PORTAIL.za + 0.15, 0),
        liberer: () => {
          D = null;
          mode = null;
          nom = null;
        },
        // (14/11) un autre habillage pour la journée (une arrivée mise en scène) : ce qui dépasse du sol (anneau, tube, plaque,
        // lumières) est rangé dans un groupe caché, le groupe g prend sa place dans le repère du portail ; habiller(null) : rendu
        habiller: (g) => {
          if (!D) return false;
          const P = D.P;
          if (D.habit) {
            D.habit.removeFromParent();
            for (const o of [...D.cache.children]) P.add(o);
            D.cache.removeFromParent();
            D.habit = D.cache = null;
          }
          if (!g) return true;
          D.cache = new T.Group();
          D.cache.visible = false;
          P.updateMatrixWorld(true);
          for (const o of [...P.children]) {
            if (o === D.disque || o === D.lisere || o === D.herbe || o === D.fleurs || o === D.flaque) continue;
            const b = new T.Box3().setFromObject(o);
            if (b.isEmpty() || b.max.y > BASE.y + 0.25) D.cache.add(o);
          }
          P.add(D.cache, g);
          D.habit = g;
          return true;
        }
      };
    })();
    const tacheRonde = toileTexte(64, 64, (x) => {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(60,80,100,.5)");
      g.addColorStop(0.6, "rgba(60,80,100,.18)");
      g.addColorStop(1, "rgba(60,80,100,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 64, 64);
    });
    const formeArrondie = (w, h, r) => {
      const s = new T.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y);
      s.lineTo(x + w - r, y);
      s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r);
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h);
      s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r);
      s.quadraticCurveTo(x, y, x + r, y);
      return s;
    };
    let geoCadre = null, geoImage = null, matCadre = null;
    const couches = (s) => window.__pcvCouches.couches(s), pct = (t) => window.__pcvCouches.pct(t);
    const tailleWH = (taille, iw, ih, w, h) => window.__pcvCouches.taille(taille, iw, ih, w, h);
    const chargerImage = (u2) => u2.startsWith("data:") ? new Promise((ok, ko) => {
      const im = new Image();
      im.onload = () => ok(im);
      im.onerror = ko;
      im.src = u2;
    }) : fetch(u2).then((r) => r.ok ? r.blob() : Promise.reject(new Error("HTTP " + r.status))).then((b) => createImageBitmap(b));
    const composerCouches = (desc, fin) => {
      const urls = couches(desc.image).map((u2) => {
        const m = /^url\((.*)\)$/.exec(u2);
        return m ? m[1].replace(/^["']|["']$/g, "") : null;
      });
      if (!urls.some(Boolean)) return fin(null);
      const tailles = couches(desc.taille), positions = couches(desc.position), chargees = new Array(urls.length).fill(null);
      let restants = urls.filter(Boolean).length;
      const W = 256, cv = document.createElement("canvas");
      cv.width = cv.height = W;
      const x = cv.getContext("2d");
      const fini = () => {
        if (--restants > 0) return;
        for (let i = urls.length - 1; i >= 0; i--) if (chargees[i]) {
          const im = chargees[i], [dw, dh] = tailleWH(tailles[i], im.width, im.height, W, W), px = pct(positions[i]?.split(/\s+/)[0]), py = pct(positions[i]?.split(/\s+/)[1]);
          x.drawImage(im, (W - dw) * px / 100, (W - dh) * py / 100, dw, dh);
        }
        fin(chargees.some(Boolean) ? cv : null);
        chargees.forEach((im) => im?.close?.());
      };
      urls.forEach((u2, i) => {
        if (u2) chargerImage(u2).then((im) => {
          chargees[i] = im;
          fini();
        }, fini);
      });
    };
    const args = (s) => {
      const l = [""];
      let p = 0;
      for (const ch of s) {
        p += ch === "(" ? 1 : ch === ")" ? -1 : 0;
        if (ch === "," && !p) l.push("");
        else l[l.length - 1] += ch;
      }
      return l.map((a) => a.trim());
    };
    const degrade = (x, css, [bx, by, l, h]) => {
      const m = /^radial-gradient\((.*)\)$/.exec(css);
      if (!m) return;
      const a = args(m[1]), forme = /^(ellipse|circle|closest|farthest|at\b)/.test(a[0]) ? a.shift() : "", pos = /at ([\d.]+)% ([\d.]+)%/.exec(forme);
      const cx = bx + l * (pos ? +pos[1] : 50) / 100, cy = by + h * (pos ? +pos[2] : 50) / 100, dx = Math.max(cx - bx, bx + l - cx), dy = Math.max(cy - by, by + h - cy);
      const r = Math.min(cx - bx, bx + l - cx) / Math.max(1e-3, Math.min(cy - by, by + h - cy)), ry = Math.hypot(dx / r, dy);
      const arrets = a.map((s, i) => {
        const [, coul, p] = /^(.*?)(?:\s+([\d.]+)%)?$/.exec(s);
        return { t: p ? p / 100 : i / Math.max(1, a.length - 1), ...teinte(coul) };
      });
      x.save();
      x.beginPath();
      x.rect(bx, by, l, h);
      x.clip();
      x.translate(cx, cy);
      x.scale(r, 1);
      const g = x.createRadialGradient(0, 0, 0, 0, 0, ry);
      arrets.forEach((s, i) => g.addColorStop(Math.min(1, s.t), s.a ? s.css : (arrets[i - 1] || arrets[i + 1] || s).css.replace(/[\d.]+\)$/, "0)")));
      x.fillStyle = g;
      x.fillRect(-1e4, -1e4, 2e4, 2e4);
      x.restore();
    };
    const ombresInt = (x, css, l, h) => {
      for (const o of css === "none" ? [] : args(css)) {
        if (!/\binset\b/.test(o)) continue;
        const [ox = 0, oy = 0, b = 0, s = 0] = (o.match(/-?[\d.]+px/g) || []).map(parseFloat);
        x.save();
        x.beginPath();
        x.rect(0, 0, l, h);
        x.clip();
        if (b) x.filter = `blur(${b / 2}px)`;
        x.fillStyle = teinte(o.replace(/\binset\b|-?[\d.]+px/g, "").trim()).css;
        x.beginPath();
        x.rect(-l, -h, 3 * l, 3 * h);
        x.rect(ox + s, oy + s, l - 2 * s, h - 2 * s);
        x.fill("evenodd");
        x.restore();
      }
    };
    const reliefToile = (ic) => {
      const nom = { medias: "album", reglages: "parametres", telech: "telecharger", globe: "monde", bulle: "discussion" }[ic.appli] || ic.appli;
      const hote = document.body.appendChild(document.createElement("div"));
      hote.style.cssText = "position:fixed;left:-2000px;top:0;visibility:hidden;--pcv-relief-taille:256px";
      hote.innerHTML = window.__pcvIcones.relief(nom, ic.couleur);
      const el = hote.firstElementChild;
      el.style.border = "0";
      el.style.borderRadius = "0";
      const o = el.getBoundingClientRect(), boite = (e) => {
        const q = e.getBoundingClientRect();
        return [q.x - o.x, q.y - o.y, q.width, q.height];
      };
      const ov = el.querySelector("i"), des = el.querySelector("svg"), cs = getComputedStyle(el), co = getComputedStyle(ov), cd = getComputedStyle(des);
      const v = { fond: cs.backgroundImage, ombres: cs.boxShadow, ovale: boite(ov), ovaleC: co.backgroundColor, ovaleI: co.backgroundImage, dessin: boite(des), filtre: cd.filter };
      const url = "data:image/svg+xml," + encodeURIComponent(window.__pcvIcones.svg(nom, { attrs: `xmlns="http://www.w3.org/2000/svg" width="${v.dessin[2]}" height="${v.dessin[3]}" ` + ["color", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"].map((p) => `${p}="${cd.getPropertyValue(p)}"`).join(" ") }));
      hote.remove();
      return { url, peindre: (x, im) => {
        const [ol, oh] = [o.width, o.height];
        x.save();
        x.scale(256 / ol, 256 / oh);
        degrade(x, v.fond, [0, 0, ol, oh]);
        ombresInt(x, v.ombres, ol, oh);
        const [vx, vy, vl, vh] = v.ovale;
        x.save();
        x.beginPath();
        x.ellipse(vx + vl / 2, vy + vh / 2, vl / 2, vh / 2, 0, 0, 7);
        x.clip();
        x.fillStyle = teinte(v.ovaleC).css;
        x.fillRect(vx, vy, vl, vh);
        degrade(x, v.ovaleI, v.ovale);
        x.restore();
        if (im) {
          x.filter = v.filtre;
          x.drawImage(im, ...v.dessin);
        }
        x.restore();
      } };
    };
    const imageIcone = (ic) => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const x = c.getContext("2d"), t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      t.anisotropy = 4;
      const fond = teinte("--pcv-pastille").css, texte2 = teinte("--pcv-texte2").css, relief = ic.appli ? reliefToile(ic) : null;
      if (ic.appli) ic.coul = teinte(ic.couleur).c;
      const peindre = (im) => {
        x.save();
        if (ic.jeu) {
          x.fillStyle = fond;
          x.fillRect(0, 0, 256, 256);
          if (im) {
            const s = Math.max(256 / im.width, 256 / im.height);
            x.drawImage(im, (256 - im.width * s) / 2, -(im.height * s - 256) * 0.15, im.width * s, im.height * s);
          } else {
            x.fillStyle = texte2;
            x.font = "900 26px Nunito, sans-serif";
            x.textAlign = "center";
            x.fillText(ic.nom.slice(0, 16), 128, 136);
          }
        } else relief.peindre(x, im);
        x.restore();
        t.needsUpdate = true;
        rendu?.initTexture(t);
        if (ic.jeu && im) {
          pixel.clearRect(0, 0, 1, 1);
          pixel.drawImage(c, 0, 0, 1, 1);
          const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data, h = {};
          ic.coul = new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
          ic.coul.getHSL(h);
          ic.coul.setHSL(h.h, Math.min(0.75, h.s * 1.4 + 0.15), 0.5);
          lumiereSale = true;
        }
      };
      peindre(null);
      const essayer2 = (l, sinon) => {
        if (!l.length) return sinon?.();
        chargerImage(l[0]).then((im) => {
          try {
            peindre(im);
            x.getImageData(0, 0, 1, 1);
          } catch (e) {
            peindre(null);
            essayer2(l.slice(1), sinon);
          }
          im.close?.();
        }, () => essayer2(l.slice(1), sinon));
      };
      let essais = 0;
      const plusTard = () => {
        if (++essais <= 6) setTimeout(() => {
          if (icones.includes(ic)) chercher();
        }, 5e3 * essais);
      };
      const repli = () => {
        let vert = "";
        try {
          vert = O.appStore.GetVerticalCapsuleURLForApp(ic.jeu) || "";
        } catch (e) {
        }
        const perso = (f) => {
          try {
            return O.appStore[f](ic.jeu) || [];
          } catch (e) {
            return [];
          }
        };
        let icone = "";
        if (ic.jeu.app_type !== 1) try {
          icone = O.appStore.GetIconURLForApp(ic.jeu) || "";
        } catch (e) {
        }
        essayer2([...perso("GetCustomVerticalCapsuleURLs"), ...ic.jeu.app_type === 1 ? [IMG(ic.jeu.appid, "library_600x900.jpg"), vert, CDN(ic.jeu.appid, "library_600x900.jpg")] : [...perso("GetCustomLandcapeImageURLs"), vert, icone]].filter(Boolean), plusTard);
      };
      const chercher = () => {
        if (!window.__pcvImageJeu) repli();
        else composerCouches(window.__pcvImageJeu(ic.jeu, document.createElement("div")), (cv) => cv ? peindre(cv) : repli());
      };
      if (ic.jeu) chercher();
      else essayer2([relief.url]);
      return t;
    };
    const CARTE = { cote: 2.7, coin: 0.62, epaisseur: 0.3, biseau: 0.05, image: 2.42, coinImage: 0.5, verre: 0.2, galet: { cote: 2.8, epaisseur: 0.56, image: 0.3 } };
    const rondi = (w, r) => {
      const h = w / 2 - r, f = new T.Shape();
      f.moveTo(h, -h - r);
      f.absarc(h, -h, r, -Math.PI / 2, 0);
      f.absarc(h, h, r, 0, Math.PI / 2);
      f.absarc(-h, h, r, Math.PI / 2, Math.PI);
      f.absarc(-h, -h, r, Math.PI, 1.5 * Math.PI);
      return f;
    };
    const imageGeo = (w, r) => {
      const g = new T.ShapeGeometry(rondi(w, r), 16), p = g.attributes.position, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w * 0.94 + 0.5, p.getY(i) / w * 0.94 + 0.5);
      return g;
    };
    let matReflet = null, contourGeo = null, matContour = null, matLentille = null, fondVerre = null, sel = -1;
    const roue = { a: 0, v: 0, tenue: false, cran: 0, appui: -1e9 };
    const tournerRoue = (dt) => {
      if (!roue.tenue) {
        roue.a += roue.v * dt;
        roue.v *= Math.exp(-dt * GESTE.frein);
        if (Math.abs(roue.v) < GESTE.cale) {
          roue.v = 0;
          const c2 = Math.round(roue.a);
          roue.a += (c2 - roue.a) * (1 - Math.exp(-dt * 10));
          if (Math.abs(c2 - roue.a) < 3e-3) roue.a = c2;
        }
      }
      const c = Math.round(roue.a);
      if (c !== roue.cran) {
        roue.cran = c;
        window.__pcvSon?.("bouge");
      }
      for (const ic of icones) {
        ic.pos.copy(ellipse(ic.k + roue.a, icones.length));
        ic.groupe.copy(ic.pos).multiplyScalar(0.74);
        ic.objet.position.x = ic.ombre.position.x = ic.pos.x;
        ic.objet.position.z = ic.ombre.position.z = ic.pos.z;
      }
      suivreLueurs();
    };
    const contour = () => {
      contourGeo ||= new T.ShapeGeometry(((f) => {
        f.holes.push(rondi(CARTE.image, CARTE.coinImage));
        return f;
      })(rondi(CARTE.image + 2 * CARTE.verre, CARTE.coinImage + CARTE.verre)), 16);
      const vs = `varying vec2 vP, vAx, vAy; varying vec3 vNx, vNy, vNz, vV; void main() { vP = position.xy;
          vAx = (modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xy; vAy = (modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xy;   // (les axes de la carte, vus \xE0 l'\xE9cran)
          vNx = normalMatrix * vec3(1.0, 0.0, 0.0); vNy = normalMatrix * vec3(0.0, 1.0, 0.0); vNz = normalMatrix * vec3(0.0, 0.0, 1.0);
          vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
      const bordDe = `varying vec2 vP, vAx, vAy; varying vec3 vNx, vNy, vNz, vV;
        void bordDe(out float vT, out vec2 vD, out vec3 vN) { vec2 q = abs(vP) - ${(CARTE.image / 2 - CARTE.coinImage).toFixed(4)}, o = max(q, 0.0);
          vT = clamp((length(o) + min(max(q.x, q.y), 0.0) - ${CARTE.coinImage.toFixed(4)}) / ${CARTE.verre.toFixed(4)}, 0.0, 1.0);
          vec2 g = sign(vP) * (o.x > 0.0 && o.y > 0.0 ? normalize(o) : q.x > q.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
          vD = g.x * vAx + g.y * vAy; vN = normalize(g.x * vNx + g.y * vNy + .55 * vNz); }`;
      const lumiere = `float vT; vec2 vD; vec3 vN; bordDe(vT, vD, vN); vec3 n = vN; float f = pow(1.0 - abs(dot(n, normalize(vV))), 1.5);
          float l = max(dot(n, normalize(vec3(-.5, .8, .35))), 0.0), s = pow(l, 14.0), s2 = pow(l, 3.0), o = pow(max(dot(n, normalize(vec3(.5, -.8, .35))), 0.0), 3.0);
          float bord = smoothstep(.7, 1.0, vT) + .5 * smoothstep(.3, 0.0, vT);`;
      const voile = { value: pierre().verre };
      matContour ||= new T.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { voile },
        vertexShader: vs,
        fragmentShader: `uniform float voile; ${bordDe} void main() { ${lumiere}
          gl_FragColor = vec4(mix(vec3(1.0), vec3(.08, .12, .2), o * (1.0 - s2) * .8), clamp(voile * (.08 + .25 * f + .3 * bord + .22 * o) + .9 * s + .25 * s2, 0.0, 1.0)); }`
      });
      matLentille ||= new T.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        extensions: { derivatives: true },
        vertexShader: vs,
        uniforms: { voile: matContour.uniforms.voile, fond: { value: null }, taille: { value: new T.Vector2(1, 1) } },
        fragmentShader: `uniform float voile; uniform sampler2D fond; uniform vec2 taille; ${bordDe} void main() { ${lumiere}
          float px = 1.0 / max(fwidth(vT), 1e-3); vec2 d = normalize(vD + 1e-5), c = gl_FragCoord.xy + d * px * (.35 + 1.4 * vT * vT);   // (toujours vers l'ext\xE9rieur : jamais l'image de la carte reprise)
          vec3 v = texture2D(fond, c / taille).rgb * .4; for (int i = 0; i < 4; i++) { vec2 e = vec2(i == 0 ? 1.2 : i == 1 ? -1.2 : 0.0, i == 2 ? 1.2 : i == 3 ? -1.2 : 0.0); v += texture2D(fond, (c + e) / taille).rgb * .15; }
          float arete = smoothstep(.8, 1.0, vT) + .6 * smoothstep(.15, 0.0, vT);   // les deux ar\xEAtes du verre : deux fins filets de lumi\xE8re
          v = mix(v * 1.04, vec3(1.0), voile * .04 + arete * (.18 + .3 * l)); v = mix(v, vec3(.08, .12, .2), o * smoothstep(.6, 1.0, vT) * .3) + (.9 * s + .08 * s2) * smoothstep(.4, 1.0, vT);
          gl_FragColor = vec4(v, smoothstep(0.0, .1, vT) * smoothstep(1.0, .9, vT)); }`
      });
      const m = new T.Mesh(contourGeo, matContour);
      m.matrixAutoUpdate = false;
      m.position.z = CARTE.biseau + 0.012;
      m.renderOrder = 6;
      m.raycast = () => {
      };
      return m;
    };
    let geoGalet = null, haloGeo = null;
    const GALET_TOURS = 48;
    const galetGeo = (rangs, tours) => {
      const A = CARTE.galet.cote / 2, E = CARTE.galet.epaisseur / 2, n = 3, m = 4, coupe = Math.round(rangs * CARTE.galet.image), pos = [], uv = [], idx = [];
      const pw = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e), rayon2 = (i) => A * pw(Math.sin(i / rangs * Math.PI), 2 / n), ri = rayon2(coupe);
      for (let i = 0; i <= rangs; i++) {
        const r = rayon2(i), z = E * pw(Math.cos(i / rangs * Math.PI), 2 / n);
        for (let j = 0; j <= tours; j++) {
          const a = j / tours * Math.PI * 2;
          const x = r * pw(Math.cos(a), 2 / m), y = r * pw(Math.sin(a), 2 / m);
          pos.push(x, y, z);
          uv.push(x / (2 * ri) + 0.5, y / (2 * ri) + 0.5);
        }
      }
      for (let i = 0; i < rangs; i++) for (let j = 0; j < tours; j++) {
        const a = i * (tours + 1) + j, b = a + tours + 1;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
      const g = new T.BufferGeometry();
      g.setIndex(idx);
      g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
      g.addGroup(0, coupe * tours * 6, 0);
      g.addGroup(coupe * tours * 6, (rangs - coupe) * tours * 6, 1);
      g.computeVertexNormals();
      const nr = g.attributes.normal;
      for (let i = 0; i <= rangs; i++) {
        const a = i * (tours + 1), b = a + tours, x = nr.getX(a) + nr.getX(b), y = nr.getY(a) + nr.getY(b), z = nr.getZ(a) + nr.getZ(b), l = Math.hypot(x, y, z) || 1;
        nr.setXYZ(a, x / l, y / l, z / l);
        nr.setXYZ(b, x / l, y / l, z / l);
      }
      return g;
    };
    const pointFondu = new T.Vector3();
    const opaciteTuile = (distance) => 0.1 + 0.9 * lisse((distance - ZOOM.fondu[0]) / (ZOOM.fondu[1] - ZOOM.fondu[0]));
    const preparerFondu = (ic) => {
      ic.fondu = { value: 1 };
      ic.matFondu = [];
      const vus = /* @__PURE__ */ new Set();
      const preparer2 = (m) => {
        if (vus.has(m)) return;
        vus.add(m);
        const avant = m.onBeforeCompile, transparent = m.transparent, profondeur = m.depthWrite;
        m.onBeforeCompile = function(s, r) {
          avant.call(this, s, r);
          s.uniforms.fonduTuile = ic.fondu;
          s.fragmentShader = "uniform float fonduTuile;\n" + s.fragmentShader.replace(/}\s*$/, "gl_FragColor.a *= fonduTuile;\n}");
        };
        m.customProgramCacheKey = () => "tuile-proche:" + avant.toString();
        ic.matFondu.push({ m, transparent, profondeur });
      };
      const parcourir = (o) => {
        if (o.material) {
          o.renderOrder += 2;
          if (Array.isArray(o.material)) o.material.forEach(preparer2);
          else preparer2(o.material);
        }
      };
      ic.objet.traverse(parcourir);
      parcourir(ic.ombre);
      ic.verres.forEach(preparer2);
    };
    const fondreTuile = (ic) => {
      if (!ic.objet.visible) return;
      ic.objet.getWorldPosition(pointFondu);
      const a = opaciteTuile(pointFondu.distanceTo(cam.position));
      ic.fondu.value = a;
      for (const f of ic.matFondu) {
        const transparent = f.transparent || a < 1;
        if (f.m.transparent !== transparent) {
          f.m.transparent = transparent;
          f.m.needsUpdate = true;
        }
        f.m.depthWrite = f.profondeur && a === 1;
      }
    };
    const creerIcone = (ic, k, n) => {
      geoCadre ||= new T.ExtrudeGeometry(formeArrondie(CARTE.cote, CARTE.cote, CARTE.coin), {
        depth: CARTE.epaisseur,
        bevelEnabled: true,
        bevelThickness: CARTE.biseau,
        bevelSize: CARTE.biseau,
        bevelSegments: PALIERS[Q?.palier || 0].tranche,
        curveSegments: 10
      }).translate(0, 0, -CARTE.epaisseur);
      geoImage ||= imageGeo(CARTE.image, CARTE.coinImage);
      if (!matCadre) {
        matCadre = new T.MeshBasicMaterial({ vertexColors: true, fog: false });
        peindreCadre();
      }
      matReflet ||= new T.MeshBasicMaterial({
        map: toileTexte(256, 256, (x) => {
          x.beginPath();
          x.roundRect(0, 0, 256, 256, 52);
          x.clip();
          const d = x.createLinearGradient(0, 0, 0, 110);
          d.addColorStop(0, "rgba(255,255,255,.55)");
          d.addColorStop(1, "rgba(255,255,255,0)");
          x.fillStyle = d;
          x.beginPath();
          x.ellipse(128, -50, 200, 150, 0, 0, 7);
          x.fill();
        }),
        transparent: true,
        opacity: pierre().reflet,
        depthWrite: false,
        fog: false
      });
      const g = new T.Group(), cadre = new T.Mesh(geoCadre, matCadre.clone()), image = new T.Mesh(geoImage, new T.MeshBasicMaterial({ map: imageIcone(ic), fog: false })), reflet = new T.Mesh(geoImage, matReflet.clone());
      image.material.color.setScalar(pierre().eclat);
      image.position.z = CARTE.biseau + 6e-3;
      reflet.position.z = CARTE.biseau + 0.01;
      image.renderOrder = 4;
      reflet.renderOrder = 5;
      reflet.raycast = () => {
      };
      const verre = contour();
      ic.verres = [matContour, matLentille].map((m) => {
        const c = m.clone();
        c.uniforms = { ...m.uniforms };
        return c;
      });
      verre.material = ic.verres[0];
      g.add(cadre, image, reflet);
      sceneVerre.add(verre);
      cadre.userData.k = image.userData.k = k;
      geoGalet ||= galetGeo(8 * PALIERS[Q?.palier || 0].tranche, GALET_TOURS * PALIERS[Q?.palier || 0].tranche);
      const galet = new T.Mesh(geoGalet, [image.material, new T.MeshPhongMaterial({ shininess: 45, specular: 4210752, fog: false })]);
      galet.userData.k = k;
      galet.visible = false;
      g.add(galet);
      ic.galet = galet;
      haloGeo ||= new T.PlaneGeometry(1, 1).scale(CARTE.galet.cote * HALO.toile / HALO.forme, CARTE.galet.cote * HALO.toile / HALO.forme, 1);
      const halo = new T.Mesh(haloGeo, new T.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, fog: false }));
      halo.position.z = -CARTE.galet.epaisseur / 2 - 0.02;
      halo.raycast = () => {
      };
      galet.add(halo);
      ic.halo = halo;
      const ombre = new T.Mesh(new T.PlaneGeometry(3.2, 1.6), auMonde(new T.MeshBasicMaterial({ map: tacheRonde, transparent: true, depthWrite: false, opacity: pierre().ombre })));
      ombre.rotation.x = -Math.PI / 2;
      ombre.position.y = 0.01;
      ic.lum = { x: 0, z: 0, c: new T.Color(), f: 1 };
      ic.venue = 1;
      const p = ellipse(k, n);
      ic.k = k;
      ic.pos = p;
      ic.groupe = p.clone().multiplyScalar(0.74);
      ic.objet = g;
      ic.ombre = ombre;
      ic.cadre = cadre;
      ic.image = image;
      ic.finitions = [reflet, verre];
      g.position.set(p.x, 2.35, p.z);
      ombre.position.x = p.x;
      ombre.position.z = p.z;
      scene.add(g, ombre);
      preparerFondu(ic);
      lumiereSale = true;
    };
    const selectionner = (k) => {
      sel = k;
    };
    const peindreCadre = () => {
      const p = geoCadre.attributes.position, nr = geoCadre.attributes.normal, n = p.count;
      const lis = teinte("--pcv-lisere").c, acc = teinte("--pcv-cyan-plein").c, c = new T.Color();
      const col = geoCadre.attributes.color || geoCadre.setAttribute("color", new T.Float32BufferAttribute(new Float32Array(n * 3), 3)).attributes.color;
      for (let i = 0; i < n; i++) {
        if (nr.getZ(i) > 0.9) c.copy(lis);
        else c.copy(acc).offsetHSL(0, 0, -0.12 + 0.1 * (p.getY(i) / CARTE.cote + 0.5) + (nr.getY(i) > 0.3 ? 0.08 : 0));
        col.setXYZ(i, c.r, c.g, c.b);
      }
      col.needsUpdate = true;
    };
    let surApparence = null, surTheme = null, teintesVues = false;
    let teintes = null;
    const teinter = () => {
      if (!rendu) return;
      const A = pierre(), creux = A.fond ? new T.Color(A.fond) : apparenceSol === "clair" && brumeTheme || teinte("--pcv-creux").c, cles = teinte("--pcv-pastille").css + teinte("--pcv-texte2").css;
      rendu.setClearColor(creux, 1);
      scene.fog.color.copy(creux);
      [scene.fog.near, scene.fog.far] = brumeSol(A.brume || BRUME);
      peindreSol();
      teindreSol();
      for (const ic of icones) {
        ic.image.material.color.setScalar(A.eclat);
        ic.ombre.material.opacity = A.ombre;
        ic.finitions[0].material.opacity = A.reflet;
      }
      if (matReflet) matReflet.opacity = A.reflet;
      if (matContour) matContour.uniforms.voile.value = A.verre;
      finitions(PALIERS[Q?.palier || 0]);
      if (matCadre) peindreCadre();
      lumiereSale = true;
      if (teintes !== null && cles !== teintes && icones.length) {
        cle = "";
        construire();
      }
      teintes = cles;
    };
    const preparer = () => {
      if (rendu) return true;
      try {
        rendu = new T.WebGLRenderer({ canvas: toile, antialias: true, powerPreference: "high-performance" });
      } catch (e) {
        console.warn("place3d : pas de WebGL", e);
        return false;
      }
      rendu.setPixelRatio(Math.min(2, devicePixelRatio || 1));
      scene = new T.Scene();
      scene.fog = new T.Fog(0, D0 - BRUME.avant, D0 + BRUME.loin);
      M.eclairer(scene, { ciel: 2.1, soleil: 1.9 });
      const lumieres = scene.children.filter((o) => o.isHemisphereLight || o.isDirectionalLight || o.isAmbientLight), base = lumieres.map((l) => l.intensity);
      const ciel = lumieres.find((l) => l.isHemisphereLight), soleil = lumieres.find((l) => l.isDirectionalLight);
      const cielJour = ciel && [ciel.color.getHex(), ciel.groundColor.getHex()], soleilJour = soleil && soleil.color.getHex();
      cam = new T.PerspectiveCamera(30, 1, 0.1, 200);
      sol = sol3d();
      lanternes = poserLanternes();
      scene.add(sol, lanternes);
      portail.construire();
      const appliquer = (ap) => {
        const k = ap === "gris" ? 0.62 : ap === "noir" ? 0.7 : 1, nuit = ap !== "clair";
        lumieres.forEach((l, i) => l.intensity = base[i] * k);
        if (ciel) {
          ciel.color.setHex(nuit ? 3359326 : cielJour[0]);
          ciel.groundColor.setHex(nuit ? 1381916 : cielJour[1]);
        }
        if (soleil) soleil.color.setHex(nuit ? 11452648 : soleilJour);
        apparenceSol = ap;
        teinter();
        portail.apparence(ap);
      };
      appliquer(document.documentElement.dataset.pcvApparence || "clair");
      addEventListener("pcv-apparence", surApparence = (e) => appliquer(e.detail?.apparence || "clair"));
      addEventListener("pcv-theme", surTheme = () => {
        teintesVues = false;
      });
      ombres = new T.InstancedMesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), auMonde(new T.MeshBasicMaterial({ map: tacheRonde, transparent: true, depthWrite: false })), FOULE_MAX);
      ombres.count = 0;
      ombres.position.y = 0.012;
      ombres.frustumCulled = false;
      ombres.renderOrder = 1;
      scene.add(ombres);
      troupe = M.foule({ rendu, scene, max: FOULE_MAX + 1 });
      retailler();
      addEventListener("resize", retailler);
      return true;
    };
    const coinVerre = new T.Vector2(), tailleVerre = new T.Vector2(), sceneVerre = new T.Scene(), decalVerre = new T.Matrix4().makeTranslation(0, 0, CARTE.biseau + 0.012);
    const rendreVerre = (lentille) => {
      if (lentille) {
        rendu.getDrawingBufferSize(tailleVerre);
        if (fondVerre?.image.width !== tailleVerre.x || fondVerre?.image.height !== tailleVerre.y) {
          fondVerre?.dispose();
          fondVerre = new T.FramebufferTexture(tailleVerre.x, tailleVerre.y);
          matLentille.uniforms.fond.value = fondVerre;
        }
        matLentille.uniforms.taille.value.copy(tailleVerre);
        rendu.copyFramebufferToTexture(coinVerre, fondVerre);
      }
      for (const ic of icones) {
        const v = ic.finitions[1];
        v.visible = v.userData.voulu && ic.objet.visible;
        v.matrix.multiplyMatrices(ic.objet.matrixWorld, decalVerre);
        v.matrixWorldNeedsUpdate = true;
      }
      rendu.autoClear = false;
      rendu.render(sceneVerre, cam);
      rendu.autoClear = true;
    };
    const retailler = () => {
      if (!rendu) return;
      const W = innerWidth, H = innerHeight;
      rendu.setSize(W, H, false);
      cam.aspect = W / H;
      cam.updateProjectionMatrix();
    };
    const FOULE_MAX = 200, N_HEROS = 5, PLACES_HEROS = [2, 1, 3, 0, 4];
    const ECHELLE = 1.4;
    let siens = [];
    const relireSiens = () => M.siens().then((l) => {
      siens = l;
    }, () => {
    });
    const signature = (h) => h.pantalon + ":" + (h.donnees ? Array.from(h.donnees, (b) => b.toString(16)).join(".") : "~" + h.graine);
    const spotpass = () => [...window.__pcvSpotPass?.mii?.() || [], ...window.__pcvSpotPass?.visiteurs?.() || []].map((m) => ({
      cle: "sp:" + m.cle,
      sid: "sp:" + m.cle,
      donnees: m.mii,
      nom: m.pseudo,
      pantalon: m.visiteur ? "or" : "bleu",
      tenue: m.tenue,
      phrase: m.phrase,
      region: m.region,
      jour: m.jour,
      pose: m.pose
    }));
    const habitants = () => {
      const amis = M.amis(16), moi = siens.filter((s) => s.moi), autres = siens.filter((s) => !s.moi);
      const l = [...moi, ...amis.slice(0, 4), ...spotpass(), ...autres, ...amis.slice(4), ...M.habitantsDefaut(), ...M.habitantsInvites()];
      const voulu = Math.min(FOULE_MAX, Math.max(N_HEROS, REG.foule, siens.length));
      for (let k = 0; l.length < voulu; k++) l.push(M.hasard(k));
      const r = RARE.habitant();
      if (r) l.splice(Math.min(N_HEROS, l.length), 0, r);
      return l.slice(0, r ? Math.max(voulu, N_HEROS + 1) : voulu).map((h) => ({ ...h, sig: signature(h) }));
    };
    const membre = (h) => {
      const m = M.pantin({ nom: h.nom });
      m.objet.visible = false;
      return { cle: h.cle, qui: h, m, v: null, taille: 1, g: tirerGroupe(), etat: "dehors", t: 0, dt: 0, actif: true, distance: 0, but: null, heros: false, refuse: false };
    };
    const oublier = (f) => {
      RARE.oublierMise(f);
      f.m.liberer();
      if (f.v) {
        troupe?.retirer(f.v);
        f.v.liberer();
        f.v = null;
      }
      if (auStudio?.f === f) {
        auStudio.r.liberer();
        auStudio = null;
      }
      if (f.photo) {
        f.photo.al.libres.push(f.photo.k);
        f.photo = null;
      }
    };
    const peupler = () => {
      const l = habitants(), avant = new Map(foule.map((f) => [f.cle, f]));
      const nouvelle = l.map((h) => {
        const f = avant.get(h.cle);
        if (f && f.qui.sig === h.sig) {
          avant.delete(h.cle);
          return f;
        }
        return membre(h);
      });
      for (const f of avant.values()) oublier(f);
      const venus = ARRIVEES.venus();
      foule = nouvelle;
      heros = foule.filter((f) => !f.qui.rare && (!ARRIVEES.rencontre(f) || venus.has(f.cle))).slice(0, N_HEROS);
      foule.forEach((f, i) => {
        f.rang = i;
        f.heros = heros.includes(f);
      });
      ordreFoule = foule.slice();
      prochaineFoule = 0;
      bulleMii = null;
    };
    const pret = (f) => !!f.v;
    const EXPR_MII = ["neutre", "cligne", "sourire", "joie", "parle", "surprise"];
    const fabriquer = (f) => {
      const h = f.qui, t0 = performance.now(), P = PALIERS[Q?.palier || 0], plein = f.heros || !P.basse;
      const r = M.creer({
        donnees: h.donnees,
        graine: h.graine,
        pantalon: h.pantalon,
        nom: h.nom,
        tenue: h.tenue,
        couleursSwitch: h.couleursSwitch,
        rendu,
        resolution: f.heros ? 512 : P.tete,
        qualite: plein ? "haute" : "basse",
        expressions: plein ? EXPR_MII : null
      });
      f.taille = r.D.haut * ECHELLE;
      f.m.regler(f.taille);
      r.regler(f.taille);
      f.v = r;
      r.suivre(f.m, 0);
      if (h.rare?.deuxMains) r.deuxMains = f.m.deuxMains = h.rare.deuxMains;
      if (h.tenue?.length || !troupe.ajouter(r)) scene.add(r.objet);
      noter(mesure.creer, performance.now() - t0);
    };
    const noter = (m, ms) => {
      m.n++;
      m.ms += ms;
      m.max = Math.max(m.max, ms);
    };
    const fabriquerUn = () => {
      let f = null;
      for (const x of foule) if ((x.heros || x.actif) && !x.v && !x.refuse) {
        f = x;
        break;
      }
      if (!f) return false;
      try {
        fabriquer(f);
      } catch (e) {
        f.refuse = true;
        console.warn("place3d : Mii refus\xE9 par le moteur", f.cle, e);
      }
      if (f.etat === "dehors" && pret(f) && temps >= introFin) entrer(f);
      return true;
    };
    const ECO_IPS = 30;
    const TDP_BAS = 6;
    const ANGLES = 5, PHASES = 12, COL = { repos: 0, pas: 1, assis: 1 + PHASES, geste: 2 + PHASES };
    const GESTE_PHOTOS = [["saluer", 0.139], ["saluer", 0.417], ["applaudir", 0.0806], ["applaudir", 0.2419], ["parler", 0.5067], ["parler", 1.52], ["danser", 0.192]];
    const GESTES = {
      saluer: { c: [0, 1], s: (t) => Math.sin(t * 2 * Math.PI * 1.8) },
      applaudir: { c: [2, 3], s: (t) => Math.sin(t * 2 * Math.PI * 3.1) },
      parler: { c: [4, 5], s: (t, ph) => Math.sin(t * 3.1 + ph) },
      danser: { c: [6, COL.repos - COL.geste], s: (t) => Math.sin(t * 2 * Math.PI * 1.3) }
    };
    GESTES.content = GESTES.saluer;
    const BLOC = { l: COL.geste + GESTE_PHOTOS.length, h: ANGLES };
    const album = (ec, PAGE) => {
      const CASE = { l: 2 * Math.round(24 * ec), h: 2 * Math.round(48 * ec) }, PAR_LIGNE = PAGE / (CASE.l * BLOC.l) | 0;
      return { CASE, PAGE, PAR_LIGNE, PAR_PAGE: PAR_LIGNE * (PAGE / (CASE.h * BLOC.h) | 0), pages: [], libres: [], n: 0, brouillon: null };
    };
    const PETITES = album(1, innerHeight * (devicePixelRatio || 1) > 600 ? 4096 : 2048);
    const PHOTO = { l: 0.8, h: 1.6, b: 0.3, elev: 0.7 };
    const PAS_S = { marcher: 1.7, courir: 2.6 }, ASSIS = /* @__PURE__ */ new Set(["assisSol", "assis"]);
    const CLICHES = Array.from({ length: ANGLES }, (_, r) => {
      const cap = r * Math.PI / (ANGLES - 1);
      return [
        { c: COL.repos, anim: "repos", t: 0.5 },
        ...Array.from({ length: PHASES }, (_2, j) => ({ c: COL.pas + j, anim: "marcher", t: j / PHASES / PAS_S.marcher })),
        { c: COL.assis, anim: "assisSol", t: 0 },
        ...GESTE_PHOTOS.map(([anim, t], i) => ({ c: COL.geste + i, anim, t }))
      ].map((x) => ({ ...x, r, cap }));
    }).flat();
    let pages = [], studio = null, camPhoto = null, copie = null, auStudio = null, photosFond = 0;
    const VS_LOIN = `attribute vec3 pied; attribute vec4 cellule, cellule2, cellule3, cellule4; attribute vec2 melange; uniform vec3 cadre; varying vec2 vUv, vUv2, vUv3, vUv4, vK, vP;
      void main() { vec4 p = modelViewMatrix * vec4(pied, 1.0); vP = pied.xz; p.xy += vec2(position.x * cadre.x, position.y * cadre.y - cadre.z);
        gl_Position = projectionMatrix * p; vec4 d = projectionMatrix * vec4(p.xy, p.z + 0.4, 1.0); gl_Position.z = d.z / d.w * gl_Position.w;
        vec2 q = vec2(position.x + 0.5, position.y); vUv = cellule.xy + q * cellule.zw; vUv2 = cellule2.xy + q * cellule2.zw; vUv3 = cellule3.xy + q * cellule3.zw; vUv4 = cellule4.xy + q * cellule4.zw; vK = melange; }`;
    const FS_LOIN = `uniform sampler2D carte, ombre_; uniform vec3 ombreP_, brume_, brumeC_; varying vec2 vUv, vUv2, vUv3, vUv4, vK, vP; void main() {
      vec4 c = mix(mix(texture2D(carte, vUv), texture2D(carte, vUv2), vK.x), mix(texture2D(carte, vUv3), texture2D(carte, vUv4), vK.x), vK.y); if (c.a < 0.02) discard;
      vec3 o = vec3(1.0); if (ombreP_.x > 0.0) o = clamp(texture2D(ombre_, vec2(vP.x + ombreP_.z, ombreP_.z - vP.y) / (2.0 * ombreP_.z)).rgb * ombreP_.x, ombreP_.y, 1.0);
      c.rgb = mix(c.rgb * o, brumeC_ * c.a, brume_.z > 0.0 ? smoothstep(brume_.y, brume_.z, brume_.x - vP.y) : 0.0); gl_FragColor = c; }`;
    const nouvellePage = (al) => {
      const cible = new T.WebGLRenderTarget(al.PAGE, al.PAGE, { depthBuffer: false });
      const q = new T.PlaneGeometry(1, 1).translate(0, 0.5, 0), geo = new T.InstancedBufferGeometry();
      geo.index = q.index;
      geo.setAttribute("position", q.attributes.position);
      const attr = (n) => new T.InstancedBufferAttribute(new Float32Array(FOULE_MAX * n), n).setUsage(T.DynamicDrawUsage);
      const pied = attr(3), cellules = [attr(4), attr(4), attr(4), attr(4)], melange = attr(2);
      geo.setAttribute("pied", pied);
      cellules.forEach((c, i) => geo.setAttribute(i ? "cellule" + (i + 1) : "cellule", c));
      geo.setAttribute("melange", melange);
      geo.instanceCount = 0;
      const L = troupe.lum, mat = new T.ShaderMaterial({
        uniforms: { ombre_: L.ombre_, ombreP_: L.ombreP_, brume_: L.brume_, brumeC_: L.brumeC_, carte: { value: cible.texture }, cadre: { value: new T.Vector3(PHOTO.l, PHOTO.h, PHOTO.b) } },
        vertexShader: VS_LOIN,
        fragmentShader: FS_LOIN,
        transparent: true,
        premultipliedAlpha: true
      });
      const maillage = new T.Mesh(geo, mat);
      maillage.frustumCulled = false;
      maillage.renderOrder = 2;
      scene.add(maillage);
      return { cible, maillage, pied, cellules, melange, n: 0 };
    };
    const placePhoto = (al) => {
      const k = al.libres.length ? al.libres.pop() : al.n++, j = k % al.PAR_PAGE, p = k / al.PAR_PAGE | 0;
      while (al.pages.length <= p) {
        const pg = nouvellePage(al);
        al.pages.push(pg);
        pages.push(pg);
      }
      return { k, al, page: al.pages[p], x: j % al.PAR_LIGNE * al.CASE.l * BLOC.l, y: (j / al.PAR_LIGNE | 0) * al.CASE.h * BLOC.h };
    };
    const preparerStudio = () => {
      if (studio) return;
      studio = new T.Scene();
      copie = new T.Scene();
      camPhoto = new T.OrthographicCamera(-PHOTO.l / 2, PHOTO.l / 2, PHOTO.h - PHOTO.b, -PHOTO.b, 0.1, 20);
      camPhoto.position.set(0, Math.sin(PHOTO.elev), Math.cos(PHOTO.elev)).multiplyScalar(8);
      camPhoto.lookAt(0, 0, 0);
      const q = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
        uniforms: { carte: { value: null } },
        depthTest: false,
        depthWrite: false,
        blending: T.NoBlending,
        vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
        fragmentShader: "uniform sampler2D carte; varying vec2 vUv; void main() { gl_FragColor = texture2D(carte, vUv); }"
      }));
      q.frustumCulled = false;
      copie.add(q);
    };
    const photographier = (f, r, st) => {
      preparerStudio();
      const fond = rendu.getClearColor(new T.Color()), alpha = rendu.getClearAlpha();
      studio.add(r.objet);
      r.objet.position.set(0, 0, 0);
      r.objet.visible = true;
      r.salto.rotation.x = 0;
      r.inclinaison = 0;
      r.saut = null;
      r.bras = null;
      r.kBras = 0;
      r.regard = null;
      r.rg.x = r.rg.y = 0;
      r.expr = null;
      r.cligne = 0;
      r.ph = 0;
      r.cadence = 1;
      r.regler(f.taille);
      rendu.setClearColor(0, 0);
      const al = st.al, W = al.CASE.l * 2, H = al.CASE.h * 2, t0 = performance.now(), brouillon = al.brouillon ||= new T.WebGLRenderTarget(W * BLOC.l, H * BLOC.h);
      let n0 = 0;
      while (st.k < CLICHES.length && (n0++ === 0 || performance.now() - t0 < 3)) {
        const c = CLICHES[st.k++];
        r.jouer(c.anim, { fondu: 0, redemarrer: true });
        r.t = c.t;
        r.cap = r.capVise = c.cap;
        r.maj(0);
        brouillon.viewport.set(c.c * W, (BLOC.h - 1 - c.r) * H, W, H);
        brouillon.scissor.copy(brouillon.viewport);
        brouillon.scissorTest = true;
        rendu.setRenderTarget(brouillon);
        rendu.render(studio, camPhoto);
      }
      const fini = st.k >= CLICHES.length;
      if (fini) {
        const ph = f.photo || placePhoto(al), P = ph.page.cible;
        P.viewport.set(ph.x, ph.y, al.CASE.l * BLOC.l, al.CASE.h * BLOC.h);
        P.scissor.copy(P.viewport);
        P.scissorTest = true;
        copie.children[0].material.uniforms.carte.value = brouillon.texture;
        rendu.setRenderTarget(P);
        rendu.render(copie, camPhoto);
        f.photo = ph;
      }
      rendu.setRenderTarget(null);
      rendu.setClearColor(fond, alpha);
      studio.remove(r.objet);
      return fini;
    };
    const sansPhoto = (x) => !x.photo && !x.refuse && !x.photoRefusee;
    const photographierUn = () => {
      if (!auStudio) {
        const f = foule.find(sansPhoto);
        if (!f) return false;
        const h = f.qui;
        try {
          const r = M.creer({ donnees: h.donnees, graine: h.graine, pantalon: h.pantalon, nom: h.nom, tenue: h.tenue, rendu, resolution: 128, expressions: ["neutre", "sourire"] });
          if (!f.v) {
            f.taille = r.D.haut * ECHELLE;
            f.m.regler(f.taille);
          }
          auStudio = { f, r, k: 0, al: PETITES };
        } catch (e) {
          f.photoRefusee = true;
          console.warn("place3d : Mii non photographi\xE9", f.cle, e);
        }
        return true;
      }
      const s = auStudio;
      let fini = true;
      try {
        fini = photographier(s.f, s.r, s);
      } catch (e) {
        s.f.photoRefusee = true;
        console.warn("place3d : photo refus\xE9e", s.f.cle, e);
      }
      if (fini) {
        auStudio = null;
        s.r.liberer();
      }
      return true;
    };
    const photosEnFond = () => {
      if (photosFond || !rendu || window.__pcvJeuDevant) return;
      photosFond = requestIdleCallback((d) => {
        photosFond = 0;
        if (!rendu || window.__pcvJeuDevant) return;
        try {
          while (d.timeRemaining() > 4 && photographierUn()) ;
        } catch (e) {
          console.warn("place3d : studio interrompu", e);
          return;
        }
        if (auStudio || foule.some(sansPhoto)) photosEnFond();
      }, { timeout: 2e3 });
    };
    const casesDe = (f) => {
      const p = f.m, pos = p.objet.position;
      let rel = p.cap - Math.atan2(cam.position.x - pos.x, cam.position.z - pos.z);
      rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      const a = Math.abs(rel) / (Math.PI / (ANGLES - 1)), r0 = Math.min(ANGLES - 1, Math.floor(a)), r1 = Math.min(ANGLES - 1, r0 + 1), ka = lisse((a - r0 - 0.3) / 0.4);
      let c0 = COL.repos, c1 = c0, kp = 0;
      if (PAS_S[p.anim]) {
        const x = ((p.t * PAS_S[p.anim] * p.cadence + p.ph / (2 * Math.PI)) % 1 + 1) % 1 * PHASES, j = Math.floor(x);
        c0 = COL.pas + j % PHASES;
        c1 = COL.pas + (j + 1) % PHASES;
        kp = x - j;
      } else if (ASSIS.has(p.anim)) c0 = c1 = COL.assis;
      else if (GESTES[p.anim]) {
        const g = GESTES[p.anim];
        c0 = COL.geste + g.c[0];
        c1 = COL.geste + g.c[1];
        kp = lisse((0.6 - g.s(p.t, p.ph || 0)) / 1.2);
      }
      const ph = f.photo, cv = (r, c) => caseVers(ph, r, c, r > 0 && r < ANGLES - 1 && rel < 0);
      return { cases: [cv(r0, c0), cv(r0, c1), cv(r1, c0), cv(r1, c1)], kp, ka };
    };
    const caseVers = (ph, r, c, miroir) => {
      const { CASE, PAGE } = ph.al, u0 = (ph.x + c * CASE.l) / PAGE, v0 = (ph.y + (BLOC.h - 1 - r) * CASE.h) / PAGE, du = CASE.l / PAGE;
      return [miroir ? u0 + du : u0, v0, miroir ? -du : du, CASE.h / PAGE];
    };
    const loin = [];
    const dessinerPhotos = () => {
      loin.sort((a, b) => b.loin - a.loin);
      for (const pg of pages) pg.n = 0;
      for (const f of loin) {
        const pg = f.photo.page, i = pg.n++, p = f.m.objet.position, c = casesDe(f);
        pg.pied.setXYZ(i, p.x, p.y, p.z);
        c.cases.forEach((x, k) => pg.cellules[k].setXYZW(i, ...x));
        pg.melange.setXY(i, c.kp, c.ka);
      }
      for (const pg of pages) {
        if (!pg.n && !pg.maillage.geometry.instanceCount) continue;
        pg.maillage.geometry.instanceCount = pg.n;
        pg.pied.needsUpdate = pg.melange.needsUpdate = true;
        pg.cellules.forEach((c) => {
          c.needsUpdate = true;
        });
      }
      loin.length = 0;
    };
    const ECRAN = { riMin: 1e3 / 60, verifie: 0, dts: [] };
    const mesurerEcran = (brut, occupe2) => {
      if (temps < introFin) {
        ECRAN.dts.length = 0;
        return;
      }
      if (brut > 0 && !occupe2) ECRAN.dts.push(Math.min(250, brut));
      if (temps < ECRAN.verifie || ECRAN.dts.length < 10) return;
      ECRAN.verifie = temps + 1;
      const d = ECRAN.dts.slice().sort((x, y) => x - y);
      ECRAN.riMin = Math.min(ECRAN.riMin, d[d.length >> 1], 1e3 / Math.min(60, REG.plafond || 60));
      ECRAN.dts.length = 0;
    };
    const OBSTACLES = [], horsObstacle = (p, marge = 0.35) => OBSTACLES.every((o) => o.p.distanceTo(p) > o.r + marge);
    const placeLibre = (g, ecart2 = 0.5) => {
      const ic = icones[g], n = foule.filter((f) => f.g === g).length;
      for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2, r = alea(0.45, 1.5 + 0.2 * Math.sqrt(n)), p = ic.groupe.clone().add(new T.Vector3(Math.cos(a) * r * 1.25, 0, Math.sin(a) * r * 0.85));
        if (foule.every((f) => !f.but || f.but.distanceToSquared(p) > ecart2 * ecart2) && horsObstacle(p)) return p;
      }
      return ic.groupe.clone().add(new T.Vector3(alea(-2, 2), 0, alea(-1.4, 1.4)));
    };
    const tirerGroupe = (f) => {
      if (f?.fixe != null) return f.fixe;
      const tot = icones.reduce((s, i) => s + i.poids, 0);
      let r = Math.random() * tot;
      for (const ic of icones) {
        r -= ic.poids;
        if (r <= 0) return ic.k;
      }
      return 0;
    };
    const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const capVers = (f, v) => {
      const p = f.m.objet.position;
      return Math.atan2(v.x - p.x, v.z - p.z);
    };
    const VIT = (a) => (window.__pcvMii3D?.FOULEE || M.FOULEE)[a] || (window.__pcvMii3D?.FOULEE || M.FOULEE).marcher;
    const aller = (f, courir = false, but = null) => {
      const m = f.m;
      f.but = but || placeLibre(f.g);
      f.etat = "marche";
      f.pivot = null;
      f.course = courir;
      f.vmax = VIT(courir ? "courir" : "marcher") * m.taille * (courir ? alea(0.9, 1.05) : alea(0.6, 0.92));
      f.courbe = (Math.random() < 0.5 ? -1 : 1) * alea(0.15, 0.65);
      f.dir = m.cap;
      f.vit = 0;
      m.jouer(courir ? "courir" : "marcher", { fondu: 0.2 });
      m.vitesse = 0.4;
    };
    const avancer = (f, dt) => {
      const m = f.m, p = m.objet.position, T0 = m.taille, dx = f.but.x - p.x, dz = f.but.z - p.z, d = Math.hypot(dx, dz);
      let cap = Math.atan2(dx, dz) + f.courbe * Math.min(1, d / (3 * T0)), sx = Math.sin(cap), sz = Math.cos(cap);
      const r = 0.8 * T0;
      for (const o of foule) {
        if (o === f || !o.actif || !o.m.objet.visible) continue;
        const q = o.m.objet.position, ox = p.x - q.x, oz = p.z - q.z, d2 = ox * ox + oz * oz;
        if (d2 < r * r && d2 > 1e-6) {
          const e = Math.sqrt(d2), k = (1 - e / r) * 1.8 / e;
          sx += ox * k;
          sz += oz * k;
        }
      }
      for (const o of OBSTACLES) {
        const ox = p.x - o.p.x, oz = p.z - o.p.z, e = Math.hypot(ox, oz), ro = o.r + 0.9 * T0;
        if (e < ro && e > 1e-6) {
          const k = (1 - e / ro) * 3 / e;
          sx += ox * k;
          sz += oz * k;
        }
      }
      cap = Math.atan2(sx, sz);
      const err = angle(cap - f.dir), tmax = (f.course ? 3.4 : 2.6) * dt;
      f.dir = angle(f.dir + Math.max(-tmax, Math.min(tmax, err)));
      const voulu = f.vmax * Math.max(0.3, Math.min(1, d / (0.9 * T0))) * Math.max(0.18, Math.cos(Math.min(1.45, Math.abs(err))));
      f.vit += (voulu - f.vit) * (1 - Math.exp(-dt * (voulu > f.vit ? 3.5 : 6)));
      const pas2 = Math.min(d, f.vit * dt);
      p.x += Math.sin(f.dir) * pas2;
      p.z += Math.cos(f.dir) * pas2;
      m.cap = m.capVise = f.dir;
      m.vitesse = Math.max(0.35, f.vit / VIT(m.anim) / T0);
      return d < 0.06 * T0 || d < 0.4 * T0 && Math.abs(angle(Math.atan2(dx, dz) - f.dir)) > 1.3;
    };
    const pivoter = (f, cap, ensuite = "repos") => {
      const m = f.m;
      if (Math.abs(angle(cap - m.cap)) < 0.45) {
        m.capVise = cap;
        f.pivot = null;
        if (m.anim !== ensuite) m.jouer(ensuite, { fondu: 0.3 });
        return;
      }
      f.pivot = { cap, ensuite };
      m.jouer("marcher", { fondu: 0.15 });
      m.vitesse = 0.5;
    };
    const pivoterPas = (f, dt) => {
      const m = f.m, e = angle(f.pivot.cap - m.cap), s = Math.min(Math.abs(e), 2.8 * dt);
      m.cap = m.capVise = angle(m.cap + Math.sign(e) * s);
      if (Math.abs(e) < 0.03) {
        const ens = f.pivot.ensuite;
        f.pivot = null;
        m.jouer(ens, { fondu: 0.25 });
      }
    };
    const faireFace = (f) => {
      const x = Math.random(), p = f.m.objet.position;
      let v = null;
      if (x < 0.45) {
        let best = null, bd = 2.5 * 2.5;
        for (const o of foule) {
          if (o === f || !o.actif || !o.m.objet.visible) continue;
          const d2 = o.m.objet.position.distanceToSquared(p);
          if (d2 < bd) {
            bd = d2;
            best = o;
          }
        }
        v = best?.m.objet.position;
      } else if (x < 0.75) v = icones[f.g]?.pos;
      else v = cam.position;
      if (v) pivoter(f, capVers(f, v) + alea(-0.25, 0.25), f.m.anim === "parler" ? "parler" : "repos");
    };
    const arriver = (f) => {
      const m = f.m;
      f.vit = 0;
      if (f.entre) {
        f.entre = false;
        jouerPlace("arrivee", f, 0.8);
      }
      f.etat = "pause";
      f.t = alea(1.5, 5);
      m.jouer("repos", { fondu: 0.3 });
      if (Math.random() < 0.5) faireFace(f);
    };
    const auCentre = (f, x) => {
      if (!f.qui.moi) return false;
      if (f.m.objet.position.distanceTo(CENTRE) > 0.5 * f.taille) {
        aller(f, false, CENTRE.clone());
        return true;
      }
      if (x >= 0.36) return false;
      f.etat = "pause";
      f.t = alea(2, 6);
      faireFace(f);
      return true;
    };
    const vivre = (f, dt) => {
      const m = f.m;
      f.t -= dt;
      if (f.parle && f.parle.fin < temps) f.parle = null;
      if (f.etat === "marche") {
        if (f.sort && cache(m.objet.position, f.taille)) partir(f);
        else if (!m.action && avancer(f, dt)) {
          if (f.sort) aller(f, true, bord(m.objet.position));
          else arriver(f);
        }
        return;
      }
      if (f.etat === "tombe") {
        if (!m.action) arriver(f);
        return;
      }
      if (f.pivot) pivoterPas(f, dt);
      if (f.etat === "intro" || f.etat === "porteParole") return;
      if (f.t > 0) {
        if (f.etat === "pause" && !f.pivot) {
          if (Math.random() < dt * 0.25) regarderQuelquun(f);
          else if (Math.random() < dt * 0.07) faireFace(f);
        }
        return;
      }
      if (f.etat === "assis" || f.etat === "geste" || f.etat === "parle") {
        m.jouer("repos", { fondu: 0.4 });
        m.regarder(null);
      }
      f.pivot = null;
      if (f.sort) {
        aller(f, true, bord(m.objet.position));
        return;
      }
      const x = Math.random();
      if (auCentre(f, x)) return;
      if (x < 0.05 && icones.length > 1) {
        f.g = tirerGroupe(f);
        aller(f, Math.random() < 0.25);
        jouerPlace("depart", f, 0.8);
      } else if (x < 0.3) aller(f);
      else if (x < 0.36) {
        const b = foule.find((o) => o !== f && o.actif && o.etat === "pause" && !o.pivot && o.m.objet.position.distanceTo(m.objet.position) < 1.8 && !o.parle);
        if (b) discuter(f, b);
        else {
          f.etat = "pause";
          f.t = alea(1.5, 4);
          faireFace(f);
        }
      } else if (x < 0.58) {
        f.etat = "assis";
        f.t = alea(5, 11);
        pivoter(f, alea(-0.8, 0.8), "assisSol");
      } else if (x < (f.qui.rare ? 0.85 : 0.7)) {
        const g = f.qui.rare?.gestes || ["saluer", "applaudir", "content", "danser", "hausser"];
        f.etat = "geste";
        f.t = alea(1.4, 2.4);
        pivoter(f, alea(-0.4, 0.4), g[Math.floor(Math.random() * g.length)]);
      } else {
        f.etat = "pause";
        f.t = alea(2, 6);
        if (Math.random() < 0.6) faireFace(f);
        else m.jouer("repos");
      }
    };
    const discuter = (a, b) => {
      const fin = alea(3.5, 6);
      for (const [x, y] of [[a, b], [b, a]]) {
        x.etat = "parle";
        x.t = fin;
        x.parle = { avec: y, fin: temps + fin };
        x.m.regarder(y.m.objet.position.clone().setY(0.8));
        pivoter(x, capVers(x, y.m.objet.position), x === a ? "parler" : "repos");
      }
      babiller(a);
      setTimeout(() => {
        if (b.parle?.avec === a && b.etat === "parle" && !b.pivot) {
          b.m.jouer("parler");
          a.m.jouer("repos");
          babiller(b);
        }
      }, fin * 500);
      setTimeout(() => {
        if (a.parle?.avec !== b || b.parle?.avec !== a || a.etat !== "parle" || b.etat !== "parle" || a.pivot || b.pivot) return;
        const x = Math.random(), [anim, son] = x < 0.3 ? ["pointer", "poignee"] : x < 0.5 ? ["victoire", "tape"] : [];
        if (!anim) return;
        a.m.jouer(anim, { redemarrer: true });
        b.m.jouer(anim, { redemarrer: true });
        jouerPlace(son, a);
      }, (fin - 1.4) * 1e3);
    };
    const regarderQuelquun = (f) => {
      const x = Math.random();
      if (x < 0.4) f.m.regarder(null);
      else if (x < 0.7) f.m.regarder(cam.position);
      else {
        const o = foule[Math.floor(Math.random() * foule.length)];
        if (o !== f && o.actif) f.m.regarder(o.m.objet.position.clone().setY(0.8));
      }
    };
    let ac = null, sortieSon = null, tMurmure = 0;
    let volBruits = 1, volLu = -1e9;
    const audio = () => {
      const mtn = performance.now();
      if (mtn - volLu > 1e3) {
        volLu = mtn;
        volBruits = +lire("pcv-bruitages", 1) || 0;
      }
      if (!REG.bruits || !(volBruits > 0) || window.__pcvBienvenue?.ouvert?.()) return null;
      try {
        ac ||= new AudioContext();
        if (ac.state === "suspended") ac.resume().catch(() => {
        });
        if (!sortieSon) {
          const comp = ac.createDynamicsCompressor();
          sortieSon = ac.createGain();
          sortieSon.connect(comp).connect(ac.destination);
        }
        if (sortieSon.gain.value !== volBruits) sortieSon.gain.value = volBruits;
        return ac;
      } catch (e) {
        return null;
      }
    };
    const VOYELLES = [[750, 1150], [420, 1950], [300, 2250], [480, 850], [340, 750], [560, 1650]];
    const babiller = (f, force = 1) => {
      if (racine.hidden || !f?.actif || !f.m.objet.visible) return;
      if (sonsPrives()) {
        jouerPlace("voix", f, 0.9 * force);
        return;
      }
      const c = audio();
      if (!c) return;
      const [x, , z] = ecran(f.m.objet.position);
      if (x < -60 || x > innerWidth + 60 || z > 1) return;
      const v = 0.9 * force * Math.min(1, 12 / cam.position.distanceTo(f.m.objet.position));
      if (v < 0.05) return;
      const pan = c.createStereoPanner();
      pan.pan.value = Math.max(-0.7, Math.min(0.7, x / innerWidth * 2 - 1));
      pan.connect(sortieSon);
      const f0 = f.voix ||= alea(200, 330);
      let s = c.currentTime + 0.02;
      const n = force < 1 ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) {
        const d = alea(0.07, 0.13), [F1, F2] = VOYELLES[Math.floor(Math.random() * VOYELLES.length)];
        const o = c.createOscillator(), g = c.createGain(), b1 = c.createBiquadFilter(), b2 = c.createBiquadFilter();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(f0 * alea(0.92, 1.18), s);
        o.frequency.linearRampToValueAtTime(f0 * alea(0.85, 1.25), s + d);
        b1.type = b2.type = "bandpass";
        b1.frequency.value = F1;
        b1.Q.value = 5;
        b2.frequency.value = F2;
        b2.Q.value = 8;
        g.gain.setValueAtTime(0, s);
        g.gain.linearRampToValueAtTime(v * 0.05, s + 0.018);
        g.gain.setValueAtTime(v * 0.05, s + d - 0.035);
        g.gain.linearRampToValueAtTime(0, s + d);
        o.connect(b1).connect(g);
        o.connect(b2).connect(g);
        g.connect(pan);
        o.start(s);
        o.stop(s + d + 0.02);
        s += d + alea(0.025, 0.07);
      }
    };
    const hop = (f) => {
      if (sonsPrives()) {
        jouerPlace("saut", f);
        return;
      }
      const c = audio();
      if (!c) return;
      const [x] = ecran(f.m.objet.position), s = c.currentTime + 0.01, o = c.createOscillator(), g = c.createGain(), pan = c.createStereoPanner();
      pan.pan.value = Math.max(-0.7, Math.min(0.7, x / innerWidth * 2 - 1));
      o.type = "sine";
      o.frequency.setValueAtTime(520, s);
      o.frequency.exponentialRampToValueAtTime(980, s + 0.09);
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.03, s + 0.01);
      g.gain.exponentialRampToValueAtTime(5e-4, s + 0.14);
      o.connect(g).connect(pan).connect(sortieSon);
      o.start(s);
      o.stop(s + 0.16);
    };
    const murmurer = (dt) => {
      if ((tMurmure -= dt) > 0 || temps < introFin) return;
      tMurmure = alea(4, 9);
      const parleurs = foule.filter((f2) => f2.actif && f2.m.objet.visible && (f2.etat === "parle" || f2.etat === "porteParole")), f = parleurs[Math.floor(Math.random() * parleurs.length)];
      if (f) babiller(f, f.etat === "parle" ? 0.5 : 0.28);
    };
    const SP = window.__pcvSonsPlace || {}, PLAFOND = { pas: [3, 0.15], voix: [3, 0.55], arrivee: [2, 0.25], depart: [2, 0.25] };
    const sonsPrives = () => !!(window.__pcvNintendo?.sons && window.__pcvTampon && SP.voix);
    const prets = {}, derniers = {}, joues = {}, journal = [], compte = {}, vp = new T.Vector3();
    const jouerPlace = (nom, f, vol = 1) => {
      const l = SP[nom];
      if (!l || racine.hidden || !sonsPrives()) return false;
      const cle2 = nom.startsWith("pas") ? "pas" : nom, [n, tenue] = PLAFOND[cle2] || [2, 0.5], mtn = performance.now() / 1e3, e = joues[cle2] ||= [];
      while (e.length && e[0] <= mtn) e.shift();
      if (e.length >= n) return false;
      let pan = 0;
      if (f) {
        const pos = f.m.objet.position;
        vp.copy(pos).project(cam);
        if (vp.z > 1) return false;
        pan = Math.max(-0.7, Math.min(0.7, vp.x * 0.7));
        vol *= Math.min(1, 12 / cam.position.distanceTo(pos)) ** (nom.startsWith("pas") ? 1.6 : 1);
      }
      if (vol < 0.03) return false;
      const c = audio();
      if (!c) return false;
      const t = c.currentTime;
      const p = prets[nom] ||= [];
      let k = Math.floor(Math.random() * l.length);
      if (k === derniers[nom] && l.length > 1) k = (k + 1) % l.length;
      let b = window.__pcvTampon(l[k]);
      if (b) {
        if (!p.includes(k)) p.push(k);
      } else {
        const autres = p.filter((i) => i !== derniers[nom]);
        if (!autres.length) return false;
        k = autres[Math.floor(Math.random() * autres.length)];
        b = window.__pcvTampon(l[k]);
        if (!b) return false;
      }
      derniers[nom] = k;
      e.push(mtn + tenue);
      const s = c.createBufferSource(), g = c.createGain(), pn = c.createStereoPanner();
      s.buffer = b;
      g.gain.value = vol;
      pn.pan.value = pan;
      if (nom === "voix" && f) s.playbackRate.value = f.voixR ||= alea(0.92, 1.12);
      s.connect(g).connect(pn).connect(sortieSon);
      s.start(t);
      journal.push({ t: +t.toFixed(2), nom, k, vol: +vol.toFixed(2) });
      if (journal.length > 300) journal.shift();
      compte[nom] = (compte[nom] || 0) + 1;
      return true;
    };
    const PAS = { marcher: 1.7, courir: 2.6 };
    const pas = (f) => {
      const p = f.m, r = PAS[p.anim];
      if (!r || p.objet.position.y > 0.05) {
        f.kPas = null;
        return;
      }
      const k = Math.floor(2 * (p.t * r * (p.cadence || 1) + (p.ph || 0) / (2 * Math.PI)) - 0.5);
      if (f.kPas != null && k !== f.kPas) jouerPlace(k & 1 ? "pas-droit" : "pas-gauche", f, 0.5);
      f.kPas = k;
    };
    const prechargerPlace = () => {
      if (!sonsPrives()) return;
      for (const [nom, l] of Object.entries(SP)) for (const c of nom === "voix" ? l.filter(() => Math.random() < 0.1) : l) window.__pcvTampon(c);
    };
    let ordreIcones = [];
    const construire = () => {
      const jeux = lireJeux(), c = cleJeux(jeux);
      if (c === cle && icones.length) return;
      cle = c;
      for (const ic of icones) {
        ic.objet.removeFromParent();
        ic.ombre.removeFromParent();
        ic.finitions[1].removeFromParent();
        ic.ombre.geometry.dispose();
        ic.ombre.material.dispose();
        ic.objet.children[1].material.map.dispose();
        ic.objet.children[1].material.dispose();
        ic.galet.material[1].dispose();
        ic.halo.material.dispose();
        ic.cadre.material.dispose();
        ic.finitions[0].material.dispose();
        ic.verres.forEach((m) => m.dispose());
      }
      selectionner(-1);
      Object.assign(roue, { a: 0, v: 0, tenue: false, cran: 0, appui: -1e9 });
      icones = composer(jeux);
      icones.forEach((ic, k) => creerIcone(ic, k, icones.length));
      finitions(PALIERS[Q?.palier || 0]);
      ordreIcones = icones.slice().sort((a, b) => b.pos.z - a.pos.z);
      majAmis();
      for (const f of foule) {
        f.g = tirerGroupe(f);
        if (f.etat !== "marche") f.but = null;
      }
      chargerBulles(jeux);
    };
    let attente = false, attenteDepuis = 0, compilee = 0, froid = true;
    const PATIENCE = 15e3;
    const manque = () => froid && foule.some((f) => (f.heros || f.actif) && !f.v && !f.refuse) || ARRIVEES.membres().some((f) => !f.v && !f.refuse);
    const compilerPlace = () => {
      if (!compilee) {
        finitions({ finitions: true, lentille: false }, true);
        rendu.compile(scene, cam);
        rendu.compile(sceneVerre, cam);
        finitions({ finitions: true, lentille: true }, true);
        rendu.compile(sceneVerre, cam);
        finitions(PALIERS[Q?.palier || 0]);
        compilee = 1;
        return false;
      }
      if (compilee === 1) {
        cam.position.copy(grosPos);
        cam.lookAt(grosVise);
        troupe.maj();
        rendu.render(scene, cam);
        compilee = 2;
        return false;
      }
      return true;
    };
    const INTRO = { gros: 2.5, recul: [2.4, 4.4], icones: 3, foule: 3.2, fin: 5.6 };
    let introVue = false, introLum = false;
    let bienvenue = false, musiqueVisite = "place";
    const visite = () => {
      const vus = new Set(lire("pcv-place-vus", [])), n = (+lire("pcv-place-visites", 0) || 0) + 1;
      const neuf = foule.some((f) => !f.qui.moi && !vus.has(f.cle));
      try {
        localStorage.setItem("pcv-place-vus", JSON.stringify([.../* @__PURE__ */ new Set([...vus, ...foule.map((f) => f.cle)])].slice(-1e3)));
        localStorage.setItem("pcv-place-visites", JSON.stringify(n));
      } catch (e) {
      }
      musiqueVisite = neuf || RARE.neuf() ? "place-visiteur" : n % 2 ? "place" : "place-2";
    };
    const lancerIntro = (complete) => {
      complete = complete && !introVue;
      if (complete) {
        introVue = true;
        bienvenue = true;
        window.__pcvMusique?.("place-bienvenue");
      }
      debut = temps;
      introFin = complete ? temps + INTRO.fin : temps;
      blanc.classList.remove("attend");
      if (complete) {
        blanc.classList.add("on");
        requestAnimationFrame(() => requestAnimationFrame(() => blanc.classList.remove("on")));
      } else blanc.classList.remove("on");
      heros.forEach((h, i) => {
        const m = h.m, k = PLACES_HEROS[i];
        m.interrompre();
        m.objet.visible = !h.refuse;
        m.objet.position.set((k - 2) * 0.82, 0, 5.2 + Math.abs(k - 2) * 0.22);
        if (!complete && h.qui.moi) m.objet.position.copy(CENTRE);
        m.capVise = 0;
        m.cap = 0;
        h.pivot = null;
        h.vit = 0;
        m.jouer("repos", { fondu: 0 });
        h.etat = complete ? "intro" : "pause";
        h.t = 1;
        h.g = i % icones.length;
      });
      for (const f of foule) if (!f.heros) {
        f.m.interrompre();
        f.pivot = null;
        f.sort = false;
        if (!complete && pret(f) && f.actif) entrer(f, true);
        else {
          f.etat = "dehors";
          f.m.objet.visible = false;
        }
      }
      if (complete) {
        heros.forEach((h) => {
          h.saute = h.salue = false;
        });
        icones.forEach((ic) => {
          ic.objet.visible = false;
          ic.ombre.visible = false;
          ic.venue = 0;
        });
        suivreLueurs();
        introLum = true;
      } else icones.forEach((ic) => {
        ic.objet.visible = true;
        ic.ombre.visible = ombreTuile(ic);
        ic.arrive = false;
        ic.objet.rotation.set(0, 0, 0);
        ic.ombre.scale.setScalar(1);
      });
    };
    const sphere = new T.Sphere();
    const cache = (p, r) => {
      sphere.center.copy(p);
      sphere.center.y += r / 2;
      sphere.radius = r;
      return !champ.intersectsSphere(sphere) || BRUME_Z - p.z > scene.fog.far + r;
    };
    const bord = (p) => {
      const q = p.clone().setY(0), d = q.lengthSq() ? q.clone().normalize() : new T.Vector3(0, 0, -1), o = new T.Vector3();
      for (let t = alea(14, 20); ; t += 2) {
        o.copy(q).addScaledVector(d, t);
        if (t > 150 || cache(o, 2)) return o;
      }
    };
    const entrer = (f, tout) => {
      if (ARRIVEES.prend(f)) return;
      const m = f.m;
      m.objet.visible = true;
      f.but = placeLibre(f.g);
      if (tout) {
        m.objet.position.copy(f.but);
        f.etat = "pause";
        f.t = alea(0, 3);
        m.jouer("repos", { fondu: 0 });
        return;
      }
      if (temps < introFin && Math.random() < 0.35) {
        m.objet.position.copy(f.but).setY(alea(7, 11));
        f.etat = "tombe";
        m.tomber(0, { recuperation: 0.6 }).then(() => jouerPlace("arrivee", f), () => {
        });
      } else {
        m.objet.position.copy(bord(f.but));
        m.cap = capVers(f, f.but);
        aller(f, true, f.but);
        f.entre = true;
      }
    };
    const majIntro = () => {
      const e = temps - debut;
      if (temps >= introFin) {
        if (introLum) {
          introLum = false;
          suivreLueurs();
        }
        if (bienvenue) {
          bienvenue = false;
          window.__pcvMusique?.(musiqueVisite);
        }
        return false;
      }
      for (let i = 0; i < ordreIcones.length; i++) {
        const ic = ordreIcones[i], q = lisse((e - INTRO.icones - i * 0.11) / 0.75), g = ic.objet;
        const v = 1 - Math.pow(1 - q, 3);
        ic.venue = q > 0 ? v : 0;
        g.visible = q > 0;
        ic.ombre.visible = ombreTuile(ic);
        ic.arrive = q < 1;
        if (q <= 0) continue;
        g.position.set(ic.pos.x, 2.35 + 6 * (1 - v), ic.pos.z);
        g.lookAt(cam.position);
        g.rotateY((1 - v) * 1.1 * (ic.k % 2 ? 1 : -1));
        g.scale.setScalar(0.55 + 0.45 * v);
        ic.ombre.scale.setScalar(v * v);
      }
      for (let i = 0; i < heros.length; i++) {
        const h = heros[i];
        if (h.etat !== "intro") continue;
        if (!h.saute && e > 0.35 + i * 0.09) {
          h.saute = true;
          hop(h);
          h.m.sauterVers(h.m.objet.position.clone(), { hauteur: 0.55, ensuite: "content" }).catch(() => {
          });
        }
        if (!h.salue && e > 1.35 + i * 0.07 && !h.m.action) {
          h.salue = true;
          h.m.jouer("saluer", { redemarrer: true });
        }
      }
      for (const f of foule) if (f.etat === "dehors" && pret(f) && e > INTRO.foule + f.rang % 13 * 0.1) entrer(f);
      if (e > INTRO.icones) {
        introLum = true;
        suivreLueurs();
      }
      if (e > INTRO.recul[0]) {
        for (const h of heros) if (h.etat === "intro") {
          h.etat = "pause";
          h.t = alea(0.5, 2);
          h.g = h.fixe ?? Math.floor(Math.random() * icones.length);
        }
      }
      return true;
    };
    const grosPos = new T.Vector3(0, 0.92, 10.2), grosVise = new T.Vector3(0, 0.5, 5.3);
    const viser = (dt, intro) => {
      vue.avancer(dt, dockSel < 0 && !$(".carte-zone").innerHTML && !window.__pcvSteamDessus?.(250) && !document.body.classList.contains("pcv-barre-main"));
      const z = vue.zoom, el = ELEV - Math.log(z) * 0.12 - Math.max(0, Math.log(z / ZOOM.proche)) * ZOOM.baisse, d = D0 / z;
      butVise.set(CENTRE.x + vue.x * RX, 0.6, CENTRE.z + vue.y * RZ);
      butPos.set(butVise.x, butVise.y + Math.sin(el) * d, butVise.z + Math.cos(el) * d);
      const arrivee = ARRIVEES.camera(butPos, butVise);
      if (arrivee) {
        const k = arrivee === 2 ? 1 : 1 - Math.exp(-dt * 2.2);
        camPos.lerp(butPos, k);
        camVise.lerp(butVise, k);
      } else if (intro) {
        const e = temps - debut, q = lisse((e - INTRO.recul[0]) / (INTRO.recul[1] - INTRO.recul[0]));
        camPos.copy(grosPos).lerp(butPos, q);
        camVise.copy(grosVise).lerp(butVise, q);
      } else {
        const k = 1 - Math.exp(-dt * 8);
        camPos.lerp(butPos, k);
        camVise.lerp(butVise, k);
      }
      cam.position.copy(camPos);
      cam.lookAt(camVise);
    };
    const BULLE = { vue: 6, silence: [16, 32] };
    let bulles = [], sac = [], derniere = null, bulleT = 0, bulleMii = null, bulleSel = false;
    const B = () => window.__pcvBridge, RECENT_J = 30;
    const nomSucces = (s) => s.strName.charAt(0) + s.strName.slice(1).toLowerCase();
    const chargerBulles = async (jeux) => {
      const l = [], la = [], depuis = Date.now() / 1e3 - RECENT_J * 86400, amis = M.amis(16).filter((m) => m.sid);
      for (const a of jeux.slice(0, 10)) {
        (await B().succes(a.appid)).filter((x) => x.bAchieved).sort((x, y) => y.rtUnlocked - x.rtUnlocked).slice(0, 2).forEach((s) => l.push({
          cle: "s:" + a.appid + ":" + s.strID,
          jeu: a,
          img: s.strImage,
          txt: Tr("place.bulle_succes", { succes: nomSucces(s), jeu: a.display_name }),
          date: new Date(s.rtUnlocked * 1e3)
        }));
        await Promise.all(amis.map(async (m) => {
          const s = (await B().succesAmi(a.appid, m.sid)).filter((x) => x.bAchieved && x.strName && x.rtUnlocked > depuis).sort((x, y) => y.rtUnlocked - x.rtUnlocked)[0];
          if (s) la.push({ cle: "a:" + m.sid + ":" + a.appid + ":" + s.strID, sid: m.sid, qui: m.nom, jeu: a, img: s.strImage, txt: Tr("place.bulle_succes", { succes: nomSucces(s), jeu: a.display_name }), date: new Date(s.rtUnlocked * 1e3) });
        }));
      }
      for (const a of jeux.filter((a2) => a2.minutes_playtime_last_two_weeks >= 60))
        l.push({ cle: "t:" + a.appid, jeu: a, img: "", txt: Tr("place.bulle_temps", { h: Math.round(a.minutes_playtime_last_two_weeks / 60), jeu: a.display_name }), date: new Date(a.rt_last_time_played * 1e3) });
      bulles = [...l.sort((a, b) => b.date - a.date).slice(0, 12), ...la.sort((a, b) => b.date - a.date).slice(0, 6), ...bullesSpot()];
      sac = [];
      bulleT = alea(3, 6);
      majAmis();
    };
    const bullesSpot = () => spotpass().map((h) => ({
      cle: h.sid,
      sid: h.sid,
      qui: h.nom,
      img: "",
      drapeau: window.__pcvSpotPass?.drapeau?.(h.region) || "",
      txt: h.phrase,
      jeu: { appid: 0, display_name: window.__pcvSpotPass?.nomRegion?.(h.region) || h.region },
      date: new Date(h.jour || Date.now())
    }));
    const bullesJoue = () => B().amis().filter((a) => a.appid && a.jeu && foule.some((f) => f.qui.sid === a.id)).map((a) => ({
      cle: "j:" + a.id + ":" + a.appid + ":" + a.presence,
      sid: a.id,
      qui: a.nom,
      jeu: O.appStore?.GetAppOverviewByAppID?.(a.appid) || { appid: a.appid, display_name: a.jeu },
      img: "",
      txt: Tr("place.bulle_joue", { jeu: a.jeu }) + (a.presence ? " " + a.presence : ""),
      date: /* @__PURE__ */ new Date()
    }));
    const majAmis = () => {
      const enJeu = new Map(B().amis().filter((a) => a.appid).map((a) => [a.id, a.appid]));
      for (const f of foule) {
        if (!f.qui.sid) continue;
        const a = enJeu.get(f.qui.sid), g = a ? icones.findIndex((i) => i.jeu?.appid === a) : -1;
        f.fixe = g >= 0 ? g : null;
        if (g >= 0 && f.g !== g) {
          f.g = g;
          if (f.etat === "pause") aller(f);
        }
      }
    };
    const avatarBulle = (b) => b.sid ? B().amis().find((a) => a.id === b.sid)?.avatar || "" : avatarDe();
    const zoneBulles = fantome.querySelector(".bulles");
    const emprunter = () => {
      const em = fantome.querySelector(".emprunt");
      if (!em.textContent) em.textContent = [...document.styleSheets].flatMap((f) => {
        try {
          return [...f.cssRules];
        } catch (x) {
          return [];
        }
      }).filter((r) => /^\.pcv-pointe\b/.test(r.selectorText || "")).map((r) => r.cssText).join("\n");
    };
    const libre = (f) => f?.actif && f.m.objet.visible && !["dehors", "intro", "tombe"].includes(f.etat);
    const choisirBulle = (oui) => {
      bulleSel = oui;
      zoneBulles.firstChild?.classList.toggle("choisie", oui);
      legende();
      if (oui) window.__pcvSon?.("bouge");
    };
    const majBulles = (dt) => {
      bulleT -= dt;
      if (temps < introFin) return;
      if (bulleT <= 0 && !ARRIVEES.occupe()) {
        bulleT = BULLE.vue + alea(...BULLE.silence);
        if (!sac.length) {
          majAmis();
          const l = [...bulles, ...bullesJoue()];
          sac = l.filter((x) => x.cle !== derniere?.cle || l.length === 1).sort(() => Math.random() - 0.5);
        }
        let b;
        do
          b = sac.pop();
        while (b?.cle.startsWith("j:") && !bullesJoue().some((x) => x.cle === b.cle));
        const auteur = b && foule.find((f) => b.sid ? f.qui.sid === b.sid : f.qui.moi);
        if (!b || b.sid && !libre(auteur)) return;
        derniere = b;
        const g = icones.findIndex((i) => i.jeu?.appid === b.jeu.appid);
        const groupe = foule.filter((f) => f.actif && f.g === g && f.m.objet.visible && (f.etat === "pause" || f.etat === "geste") && !f.qui.rare), choix = libre(auteur) ? auteur : groupe[Math.floor(Math.random() * groupe.length)] || foule.find((f) => libre(f) && !f.qui.rare);
        if (bulleMii && bulleMii.etat === "porteParole") {
          bulleMii.etat = "pause";
          bulleMii.t = 1;
          bulleMii.m.jouer("repos");
        }
        bulleMii = choix || null;
        if (bulleMii) {
          bulleMii.etat = "porteParole";
          bulleMii.m.interrompre();
          bulleMii.vit = 0;
          pivoter(bulleMii, capVers(bulleMii, cam.position), bulleMii.qui.pose || "parler");
          bulleMii.m.regarder(cam.position);
          babiller(bulleMii);
        }
        montrerBulle(b);
      }
      placerBulle();
    };
    const montrerBulle = (b, porteur = null, duree = BULLE.vue) => {
      if (porteur) {
        if (bulleMii?.etat === "porteParole") {
          bulleMii.etat = "pause";
          bulleMii.t = 1;
          bulleMii.m.jouer("repos");
        }
        bulleMii = porteur;
        bulleT = duree + alea(...BULLE.silence);
        derniere = b;
      }
      emprunter();
      zoneBulles.innerHTML = `<div class="bulle-p"><span class="qui">${echap((b.qui || pseudo() || Tr("place.moi")).toUpperCase())}</span><div class="corps pcv-pointe pcv-pointe-bas">${b.drapeau ? `<b class="drapeau">${echap(b.drapeau)}</b>` : b.img || avatarBulle(b) ? `<img ${b.img || b.sid ? "" : "data-pcv-avatar "}src="${urlSure(b.img || avatarBulle(b))}" alt="">` : ""}<span></span></div></div>`;
      zoneBulles.querySelector(".corps span").textContent = b.txt;
      if (bulleSel) choisirBulle(false);
      const el = zoneBulles.firstChild;
      el.onclick = (e) => {
        e.stopPropagation();
        carte(b);
      };
      requestAnimationFrame(() => el.classList.add("vu"));
      jouerPlace("bulle", null, 0.7);
      if (b.img && bulleMii && !b.fete) {
        b.fete = true;
        const pm = bulleMii.m.objet.position;
        for (const o of foule) if (o !== bulleMii && o.etat === "pause" && !o.pivot && o.m.objet.visible && o.m.objet.position.distanceTo(pm) < 2.5) {
          o.etat = "geste";
          o.t = 2.4;
          pivoter(o, capVers(o, pm), "applaudir");
        }
        jouerPlace("felicitations", bulleMii, 0.8);
      }
      setTimeout(() => {
        el.classList.remove("vu");
        if (bulleSel) choisirBulle(false);
        if (bulleMii?.etat === "porteParole") {
          bulleMii.etat = "pause";
          bulleMii.t = 1;
          bulleMii.m.jouer("repos");
        }
      }, duree * 1e3);
    };
    const placerBulle = () => {
      const el = zoneBulles.firstChild;
      if (!el || !bulleMii) return;
      el.hidden = !bulleMii.actif || !!bulleMii.v?.horsVue;
      const p = projection.copy(bulleMii.m.objet.position).setY(bulleMii.taille + 0.15).project(cam), un = innerHeight / 800, x = (p.x + 1) / 2 * innerWidth, w = el.largeur ||= el.offsetWidth;
      const droite = x - 46 * un + w > innerWidth - 12 * un;
      el.classList.toggle("droite", droite);
      poser(el, `translate(${Math.round(2 * Math.max(12 * un, Math.min(innerWidth - 12 * un - w, droite ? x + 46 * un - w : x - 46 * un))) / 2}px, calc(${Math.round((1 - p.y) * innerHeight) / 2}px - 100%))`);
    };
    const poser = (el, t) => {
      if (el.dernier !== t) {
        el.dernier = t;
        el.style.transform = t;
      }
    };
    const jour = (d) => d.toLocaleDateString(window.__pcvLocale?.() || "fr-FR", { day: "numeric", month: "short" });
    new MutationObserver(() => {
      legende();
      window.__pcvVoile?.("place", !!$(".carte-zone").innerHTML);
    }).observe($(".carte-zone"), { childList: true });
    const carte = (b) => {
      window.__pcvSon?.("dialogue");
      const z = $(".carte-zone"), av = avatarBulle(b), fiche = !!O.appStore?.GetAppOverviewByAppID?.(b.jeu.appid);
      z.innerHTML = `<div class="voile"></div><div class="v carte pcv-fenetre">
        <div style="display:flex;align-items:center;gap:${u(16)}"><img src="${urlSure(av)}" alt="" style="width:${u(58)};height:${u(58)};border-radius:50%;box-shadow:0 0 0 ${u(3)} var(--pcv-lisere)">
          <span><b style="display:block;font-size:${u(22)}" class="qui"></b><span style="font-size:${u(14)};font-weight:800;color:var(--pcv-texte2)" class="ou"></span></span></div>
        <div class="v msg" style="position:relative">${b.img ? `<img src="${urlSure(b.img)}" alt="">` : ""}<span class="txt"></span></div>
        <div class="actions">${fiche ? `<button class="cyan" data-fiche="${echap(b.jeu.appid)}">${Tr("place.voir_fiche")}</button>` : ""}<button class="fermer">${Tr("dispo.fermer")}</button></div></div>`;
      z.querySelector(".qui").textContent = b.qui || pseudo();
      z.querySelector(".ou").textContent = `${b.jeu.display_name}, ${jour(b.date)}`;
      z.querySelector(".txt").textContent = b.txt;
      z.querySelector(".voile").onclick = z.querySelector(".fermer").onclick = (e) => {
        e.stopPropagation();
        z.innerHTML = "";
      };
      if (fiche) z.querySelector("[data-fiche]").onclick = (e) => {
        e.stopPropagation();
        z.innerHTML = "";
        montrer(false);
        pageJeu(b.jeu.appid);
      };
    };
    const pageJeu = (id) => window.__pcvPageJeu?.(id, null, "place") || O.SteamClient.URL.ExecuteSteamURL(`steam://nav/games/details/${id}`);
    const carteA = (z) => {
      const f = z.querySelector("[data-fiche]");
      if (f) f.click();
      else z.innerHTML = "";
    };
    const RARE = (() => {
      const VU = "pcv-visite-rare-vu", GRAINE = "pcv-visite-rare-graine", POINTS = 6, HEURE = 36e5, ARRIVEE = 3.4;
      const AURAS = ["#a5c967", "#64b6ff", "#e2d6b5", "#54dafa", "#72e681", "#a1afb5", "#77d975", "#64d5cf", "#8ad4ac", "#aaadf5", "#ffbb60", "#88d7fa", "#f7a6df"];
      const GESTES2 = ["saluer", "applaudir", "content", "danser"];
      let liste = [], locaux = [], jour2 = null, aura = null, minuterie = 0, onde = -1, ondeF = null, force = null;
      const A = () => window.__pcvMiiAccueil, objets = /* @__PURE__ */ new Map();
      const dateCle = (d) => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
      const hacher = (s) => {
        let h = 2166136261;
        for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
        h ^= h >>> 16;
        h = Math.imul(h, 2146121005);
        h ^= h >>> 15;
        h = Math.imul(h, 2221713035);
        return (h ^ h >>> 16) >>> 0;
      };
      const CHANCE = 0.5;
      const ACTIFS = false;
      const numJour = (d) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
      const duJour = (l, graine2, d = /* @__PURE__ */ new Date()) => {
        const t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).getTime() / 1e3;
        const actifs = l.filter((v2) => t >= v2.debut && t < v2.fin);
        if (!actifs.length) return null;
        const n = numJour(d) - numJour(new Date(Math.min(...l.map((x) => x.debut)) * 1e3)), v = actifs[(n % actifs.length + actifs.length) % actifs.length];
        return hacher(dateCle(d) + ":" + v.id + ":" + graine2) / 2 ** 32 < CHANCE ? v : null;
      };
      let graine = lire(GRAINE, "");
      if (typeof graine !== "string" || !graine) {
        graine = Array.from(crypto.getRandomValues(new Uint32Array(2)), (x) => x.toString(36)).join("");
        try {
          localStorage.setItem(GRAINE, JSON.stringify(graine));
        } catch (e) {
        }
      }
      const vu = () => lire(VU, "") === dateCle(/* @__PURE__ */ new Date());
      const majJour = () => {
        const choix = force ? null : duJour(liste, graine);
        if (force) {
          if (jour2 !== force) jour2 = force;
        } else if (!choix?.local) jour2 = choix;
        else {
          const v = locaux.find((x) => x.scenes[0] === choix.id);
          if (!v) jour2 = null;
          else if (!jour2?.local || jour2.id !== v.id) {
            const n = +String(v.scenes[0]).slice(1);
            jour2 = { id: v.id, local: true, nom: "", scene: n, aura: AURAS[(n - 1 + AURAS.length) % AURAS.length], gestes: GESTES2, pret: false };
            preparer2(jour2);
          }
        }
        document.documentElement.toggleAttribute("data-pcv-visite-rare", !!jour2 && !vu() && etatPortail() === "normal");
      };
      const preparer2 = (j) => Promise.resolve(A()?.preparerVisiteur?.(j.id)).then((v) => {
        if (!v || jour2 !== j || detruite) return;
        Object.assign(j, { donnees: v.donnees, tenue: v.tenue, pantalon: v.pantalon, couleursSwitch: v.couleursSwitch, deuxMains: v.deuxMains, figurants: v.figurants || [], pret: true });
      }, () => {
      });
      const charger = () => {
        clearTimeout(minuterie);
        minuterie = setTimeout(charger, HEURE);
        Promise.resolve(A()?.visiteurs?.()).then((l) => {
          if (detruite) return;
          locaux = Array.isArray(l) ? l.filter((v) => v.scenes?.length) : [];
          majJour();
        }, () => {
        });
        if (!ACTIFS || !window.__pcvSpotPass?.actif?.()) {
          liste = [];
          return majJour();
        }
        Promise.resolve((O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon?.nom, "visiteurs_rares")).then((r) => {
          if (detruite) return;
          liste = Array.isArray(r?.visiteurs) ? r.visiteurs.filter((v) => typeof v?.id === "string" && (v.local === true || Array.isArray(v.gestes))) : [];
          majJour();
        }, () => {
        });
      };
      const creerAura = () => {
        const n = 32, px = new Uint8Array(n * n * 4), c = (n - 1) / 2;
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
          const k = (y * n + x) * 4;
          px[k] = px[k + 1] = px[k + 2] = 255;
          px[k + 3] = Math.round(Math.max(0, 1 - Math.hypot(x - c, y - c) / c) ** 2 * 180);
        }
        const tex = new T.DataTexture(px, n, n);
        tex.needsUpdate = true;
        const mat = (o) => ({ map: tex, transparent: true, depthWrite: false, ...o });
        const anneau = new T.Mesh(new T.RingGeometry(0.43, 0.59, 32), new T.MeshBasicMaterial({ transparent: true, depthWrite: false, side: T.DoubleSide }));
        anneau.rotation.x = -Math.PI / 2;
        const lueur = new T.Sprite(new T.SpriteMaterial(mat({ opacity: 0.6 })));
        const points = new T.InstancedMesh(new T.PlaneGeometry(0.035, 0.035), new T.MeshBasicMaterial(mat({ opacity: 0.65 })), POINTS);
        points.frustumCulled = false;
        const vague = anneau.clone();
        vague.geometry = new T.RingGeometry(0.45, 0.57, 32);
        vague.material = anneau.material.clone();
        const g = new T.Group();
        g.add(anneau, lueur, points, vague);
        return { g, anneau, lueur, points, vague, tex, m4: new T.Matrix4() };
      };
      const majAura = (f) => {
        if (!f?.actif || !f.m.objet.visible || !f.v || f.v.horsVue) {
          if (aura) aura.g.visible = false;
          return;
        }
        if (!aura) aura = creerAura();
        if (aura.g.parent !== scene) scene.add(aura.g);
        if (aura.couleur !== f.qui.rare.aura) {
          aura.couleur = f.qui.rare.aura;
          for (const o of [aura.anneau, aura.lueur, aura.points, aura.vague]) o.material.color.set(aura.couleur);
        }
        const p = f.m.objet.position, h = f.taille, b = Math.sin(temps * 1.6), entree = !!f.arrivee;
        aura.g.visible = true;
        aura.anneau.position.set(p.x, 0.012, p.z);
        aura.anneau.scale.setScalar(h * (1 + b * 0.07));
        aura.anneau.material.opacity = 0.38 + b * 0.12;
        aura.lueur.position.set(p.x, p.y + h * 0.45, p.z - 0.05);
        aura.lueur.scale.setScalar(h * (1.7 + b * 0.12));
        aura.lueur.material.opacity = entree ? 0.95 : 0.6;
        for (let i = 0; i < POINTS; i++) {
          const a = i * Math.PI * 2 / POINTS + temps * 0.4, y = (temps * 0.23 + i / POINTS) % 1 * h;
          aura.m4.makeRotationFromQuaternion(cam.quaternion);
          aura.m4.setPosition(p.x + Math.cos(a) * h * 0.48, p.y + y, p.z + Math.sin(a) * h * 0.48);
          aura.points.setMatrixAt(i, aura.m4);
        }
        aura.points.instanceMatrix.needsUpdate = true;
        const q = (temps - onde) / 1.4, s = 1 - (1 - Math.min(1, q)) ** 2;
        aura.vague.visible = ondeF === f && onde >= 0 && q < 1;
        if (aura.vague.visible) {
          aura.vague.position.set(p.x, 0.014, p.z);
          aura.vague.scale.setScalar(h * (0.4 + 2.6 * s));
          aura.vague.material.opacity = 0.8 * (1 - s);
        }
      };
      const membre2 = () => foule.find((f) => f.qui.rare);
      const marquerVu = () => {
        try {
          localStorage.setItem(VU, JSON.stringify(dateCle(/* @__PURE__ */ new Date())));
        } catch (e) {
        }
        majJour();
      };
      const objet = (nom) => {
        if (!objets.has(nom)) {
          const o = A()?.objetVisiteur?.(nom);
          if (!o) return null;
          const g = new T.Group();
          g.add(o);
          scene.add(g);
          objets.set(nom, g);
        }
        return objets.get(nom);
      };
      const interne = (o) => o?.children[0]?.children[0];
      const montrerObjet = (nom, x, y, z, taille = 1) => {
        const o = objet(nom);
        if (!o) return null;
        o.visible = true;
        o.rotation.set(0, 0, 0);
        o.scale.setScalar(1);
        if (o.userData.base == null) {
          const b = new T.Box3().setFromObject(o);
          o.userData.base = Number.isFinite(b.min.y) ? Math.max(0, o.position.y - b.min.y) : 0;
        }
        o.position.set(x, y || o.userData.base * taille, z);
        o.scale.setScalar(taille);
        return o;
      };
      const scenes = (f, a, dt) => {
        const m = f.m, p = m.objet.position, h = f.taille, t = a.t, profil = f.qui.rare.scene;
        const phase = (n, nom) => {
          if (a.etape !== n) {
            a.etape = n;
            m.jouer(nom, { fondu: 0.12, redemarrer: true });
          }
        };
        for (const o of objets.values()) o.visible = false;
        m.objet.visible = true;
        if (profil === 1) {
          phase(t < 0.6 ? 0 : 1, t < 0.6 ? "atterrir" : "viser");
          m.capVise += Math.sin(t * 3) * dt * 0.5;
        } else if (profil === 2) {
          phase(t < 1.5 ? 0 : 1, t < 1.5 ? "boule" : "doigt");
          if (t < 1.5) {
            m.objet.visible = false;
            const o = montrerObjet("o8", p.x, 0.38 * h, p.z, h);
            interne(o)?.userData.rouler?.(dt * 18);
          }
        } else if (profil === 3) {
          phase(t < 0.9 ? 0 : t < 1.6 ? 1 : 2, t < 0.9 ? "ange" : t < 1.6 ? "atterrir" : "tapi");
          montrerObjet("o1", p.x, 0, p.z - 0.45 * h, 0.7 * h);
          p.y = t < 0.9 ? Math.sin(t / 0.9 * Math.PI) * 1.1 * h : 0;
          if (t >= 0.9 && t < 1.4) m.objet.visible = false;
        } else if (profil === 4 || profil === 12) {
          phase(t < 0.8 ? 0 : t < 1.4 ? 1 : 2, t < 0.8 ? "charger" : t < 1.4 ? "projeter" : "victoire");
          if (t < 1.5) {
            const o = montrerObjet("o10", p.x + (t > 0.8 ? (t - 0.8) * 3 : 0), 0.6 * h, p.z + 0.45, h * (t < 0.8 ? 0.25 + t * 0.6 : 0.7));
            if (o) o.rotation.y = m.cap;
          }
        } else if (profil === 5) {
          phase(t < 0.7 ? 0 : t < 1.4 ? 1 : 2, t < 0.7 ? "trancher" : t < 1.4 ? "accroupi" : "brandir");
          if (t < 1.2) montrerObjet("o16", p.x + 0.45, 0.35, p.z + 0.2, 0.75 * h);
          else montrerObjet("o5", p.x, h * 1.2, p.z + 0.15, 0.7 * h);
        } else if (profil === 6) {
          phase(t < 1.4 ? 0 : 1, t < 1.4 ? "tapi" : "brandir");
          montrerObjet("o3", p.x, t < 1.4 ? 0 : h * 0.85, p.z, h);
          m.objet.visible = t >= 1.4;
        } else if (profil === 7) {
          phase(t < 0.6 ? 0 : 1, t < 0.6 ? "tapi" : "victoire");
          p.y = t < 0.6 ? 0 : Math.sin(Math.min(1, (t - 0.6) / 0.8) * Math.PI) * 0.65 * h;
          montrerObjet("o17", p.x - 0.8 * h, 0, p.z, 0.65 * h);
          if (t > 0.8 && t < 1.8) montrerObjet("o7", p.x, h * (1.1 + Math.sin((t - 0.8) * Math.PI)), p.z, 0.6 * h);
        } else if (profil === 8) {
          phase(t < 0.7 ? 0 : t < 1.4 ? 1 : 2, t < 0.7 ? "sauter" : t < 1.4 ? "suspendu" : "atterrir");
          p.y = Math.sin(Math.min(1, t / 1.5) * Math.PI) * 0.9 * h;
        } else if (profil === 9) {
          phase(0, "trancher");
          const outil = montrerObjet("o12", p.x + 0.4 * h, 0.5 * h, p.z + 0.25, 0.7 * h);
          if (outil) outil.rotation.z = Math.sin(t * 6) * 0.8;
          interne(montrerObjet("o13", p.x + 0.75 * h, 0, p.z + 0.2, h))?.userData.fissures?.(Math.min(3, Math.floor(t * 1.5)));
        } else if (profil === 10) {
          phase(t < 0.7 ? 0 : t < 1.3 ? 1 : 2, t < 0.7 ? "charger" : t < 1.3 ? "trancher" : "victoire");
          const o = montrerObjet("o11", p.x, 0.3, p.z, 0.56 * h);
          if (o && f.v) {
            f.v.objet.updateMatrixWorld(true);
            o.position.setFromMatrixPosition(f.v.os[9].matrixWorld);
            o.rotation.set(t < 1.3 ? -0.4 + Math.sin(t * 3) * 1.1 : 0.9, m.cap, 0, "YXZ");
          }
          if (t > 0.9 && t < 1.1) {
            onde = temps;
            ondeF = f;
          }
        } else if (profil === 11) {
          phase(t < 1.3 ? 0 : 1, t < 1.3 ? "boule" : "viser");
          if (t < 1.3) {
            m.objet.visible = false;
            interne(montrerObjet("o14", p.x, 0.32 * h, p.z, h))?.userData.rouler?.(dt * 6);
          } else if (t < 2.1) montrerObjet("o10", p.x + (t - 1.3) * 3, 0.6 * h, p.z + 0.3, h * 0.6);
        } else if (profil === 13) {
          phase(t < 1 ? 0 : 1, t < 1 ? "deposer" : "coupPied");
          interne(montrerObjet("o15", p.x + 0.5 * h + Math.max(0, t - 1) * h, 0, p.z + 0.2, h * 0.65))?.userData.rougir?.(Math.min(1, t / 2));
        } else phase(0, "victoire");
      };
      const arriver2 = (f) => {
        f.arrivee = { t: 0, etape: -1 };
        f.etat = "intro";
        f.vit = 0;
        f.pivot = null;
        f.m.interrompre();
        f.m.capVise = capVers(f, cam.position);
        if (!f.qui.rare.local) f.m.jouer(f.qui.rare.arrivee || "victoire", { fondu: 0.12, redemarrer: true });
      };
      const majArrivee = (f, dt) => {
        const a = f.arrivee;
        if (!a) return false;
        a.t += dt;
        if (f.qui.rare.local) scenes(f, a, dt);
        if (a.t < ARRIVEE) return true;
        for (const o of objets.values()) o.visible = false;
        f.arrivee = null;
        f.m.objet.position.y = 0;
        f.m.objet.visible = true;
        f.m.jouer("repos", { fondu: 0.2 });
        if (f.etat === "intro" && !f.portail) {
          f.etat = "pause";
          f.t = alea(1, 3);
        }
        return false;
      };
      const RARE_MISE = (f) => RARE_API.mise(f);
      let RARE_API = null;
      let scenesP = null;
      const chargerScenes = () => scenesP ||= Promise.resolve(window.__pcvGardeRobe?.script?.("@visiteurs/arrivees.js")).catch(() => {
        scenesP = null;
      });
      const v3 = new T.Vector3(), v4 = new T.Vector3(), q4 = new T.Quaternion(), q5 = new T.Quaternion(), e3 = new T.Euler();
      const acteur = (m, v, taille, cache2 = () => false) => {
        const a = {
          m,
          get v() {
            return v();
          },
          taille,
          fixes: [],
          os: (i, p = new T.Vector3()) => {
            const r = v();
            if (!r) return p.copy(m.objet.position).setY(m.objet.position.y + taille * (i === 3 ? 0.8 : 0.5));
            r.objet.updateMatrixWorld(true);
            return p.setFromMatrixPosition(r.os[i].matrixWorld);
          },
          // (os vrai : l'objet tourne aussi avec l'os, depuis sa pose de la deuxième image : un casque suit la tête qui se tourne)
          fixer: (o, i, d = [0, 0, 0], r = [0, 0, 0], os = false) => {
            a.fixes = a.fixes.filter((x) => x.o !== o);
            if (i == null) return o;
            a.fixes.push({ o, i, d, r: new T.Quaternion().setFromEuler(e3.set(...r)), os, n: 0 });
            return o;
          },
          // retirer son chapeau (article de catégorie « chapeau ») : sa coiffure revient ; rend une copie du chapeau, posée là où il
          // était (à tenir à la main), et de quoi le remettre
          retirerChapeau: () => {
            const r = v(), G = window.__pcvGardeRobe;
            if (!r || !G) return null;
            const ids = G.porte(r), id = ids.find((i) => G.horsCatalogue?.get(i)?.article?.categorie === "chapeau");
            if (!id) return null;
            const copie2 = new T.Group();
            r.objet.updateMatrixWorld(true);
            r.objet.traverse((x) => {
              if (x.isMesh && x.userData.pcvArticle === id) {
                const c = new T.Mesh(x.geometry.clone(), [].concat(x.material).map((m2) => m2.clone()));
                if (c.material.length === 1) c.material = c.material[0];
                x.matrixWorld.decompose(c.position, c.quaternion, c.scale);
                copie2.add(c);
              }
            });
            const centre = new T.Box3().setFromObject(copie2).getCenter(new T.Vector3());
            for (const c of copie2.children) c.position.sub(centre);
            copie2.position.copy(centre);
            G.deshabiller(r, id);
            scene.add(copie2);
            return { copie: copie2, remettre: () => {
              copie2.removeFromParent();
              return G.habiller(r, ids);
            } };
          },
          // cacher (ou remontrer) des pièces de sa tenue d'après leur nom (une arme qu'il range le temps de la scène)
          cacher: (re, k = true) => {
            v()?.objet.traverse((o) => {
              if (o !== v().objet && re.test(o.name || "")) o.visible = !k;
            });
          },
          suivre: () => {
            const r = v();
            if (!r) return;
            r.objet.scale.copy(m.objet.scale).multiplyScalar(r.taille / r.D.haut);
            for (const x of a.fixes) {
              r.objet.updateMatrixWorld(true);
              r.objet.getWorldQuaternion(q4);
              if (x.os) {
                r.os[x.i].matrixWorld.decompose(v3, q5, v4);
                if (++x.n === 2) x.dq = q5.clone().invert().multiply(q4);
                if (x.dq) q4.copy(q5).multiply(x.dq);
              }
              x.o.position.setFromMatrixPosition(r.os[x.i].matrixWorld).add(v3.set(...x.d).multiplyScalar(taille).applyQuaternion(q4));
              x.o.quaternion.copy(q4).multiply(x.r);
              x.o.visible = r.objet.visible && !cache2();
            }
          }
        };
        return a;
      };
      const creerMise = (f, deja) => {
        const fab = window.__pcvArrivees?.["s" + f.qui.rare.scene];
        if (typeof fab !== "function") return null;
        const objs = [], figs = [], obs = [], h = f.taille, attentes = [], chaque = [];
        const S = {
          T,
          scene,
          h,
          t: 0,
          dt: 0,
          deja,
          port: { mode: "repos", nom: "bleu", q: 0 },
          heros: acteur(f.m, () => f.v, h, () => !!f.arrivee),
          // (touché, il rejoue sa scène de l'accueil avec ses objets à elle : ce qu'il garde sur lui se cache)
          local: (x, z, y = 0) => portail.local(x, z, y),
          cap: (a = 0) => a + PORTAIL.dir,
          vers: (a, p) => Math.atan2(p.x - a.m.objet.position.x, p.z - a.m.objet.position.z),
          camera: () => (ARRIVEES.vue() || cam.position).clone(),
          /* (le point de vue du portail choisi pour cette arrivée) */
          lisse,
          attendre: (s) => new Promise((ok) => attentes.push({ t: S.t + s, ok })),
          chaque: (fn) => {
            chaque.push(fn);
            return fn;
          },
          portail: (mode, q = 0, nom = "bleu") => Object.assign(S.port, { mode, q, nom }),
          son: (n) => window.__pcvSon?.(n),
          onde: () => {
            onde = temps;
            ondeF = f;
          },
          // un objet : fabriqué par l'accueil (nom, à la taille d'un Mii) ou un groupe vide ; reste : il reste sur la place jusqu'à sa fermeture
          // un obstacle au sol (un objet qui reste) : la foule le contourne et n'y prend pas sa place, jusqu'à la fermeture
          obstacle: (p, r) => {
            const o = { p: p.clone().setY(0), r };
            OBSTACLES.push(o);
            obs.push(o);
            return o;
          },
          // le portail habillé autrement pour la journée (groupe g, repère du portail ; null : rendu), jusqu'à la fermeture de la place
          habillerPortail: (g) => {
            S.habit = g;
            return portail.habiller(g);
          },
          // la caméra du portail regarde vers ce point (ou ce que rend la fonction, à chaque image), et s'en approche de la
          // fraction pres de la distance ; null : le portail
          suivreCamera: (c, pres = 0) => {
            S.cible = c;
            S.pres = c ? pres : 0;
          },
          objet: (nom, reste = false) => {
            const o = nom ? A()?.objetVisiteur?.(nom) : null, g = new T.Group();
            if (o) {
              o.scale.multiplyScalar(h);
              g.add(o);
            }
            g.userData.reste = reste;
            g.userData.accueil = !!o;
            scene.add(g);
            objs.push(g);
            return g;
          },
          // le k-ième figurant habillé de ce visiteur (fichiers privés : « figurants » de son entrée), prêt pour figurant(), ou null
          preparerFigurant: (k) => Promise.resolve(f.qui.rare.figurants?.[k] && A()?.preparerVisiteur?.(f.qui.rare.figurants[k])).catch(() => null),
          // un figurant : un Mii de passage (données de Mii, pantalon, tenue préparée), rendu à la fin de la scène
          figurant: (o = {}) => {
            const m = M.pantin({});
            let r = null;
            m.objet.visible = false;
            try {
              r = M.creer({ donnees: o.donnees, graine: o.graine ?? 7, pantalon: o.pantalon || "gris", couleursSwitch: o.couleursSwitch, tenue: o.tenue, rendu, resolution: 256, qualite: "haute", expressions: EXPR_MII });
              const t = r.D.haut * ECHELLE * (o.taille ?? 1);
              m.regler(t);
              r.regler(t);
              scene.add(r.objet);
              r.objet.visible = false;
            } catch (e) {
              console.warn("place3d : figurant refus\xE9", e);
            }
            const a = acteur(m, () => r, r ? m.taille : h);
            a.liberer = () => {
              m.liberer();
              if (r) {
                r.objet.removeFromParent();
                r.liberer();
                r = null;
              }
            };
            figs.push(a);
            return a;
          },
          liberer: (tout) => {
            for (const a of figs) a.liberer();
            figs.length = 0;
            S.heros.fixes = tout ? [] : S.heros.fixes.filter((x) => x.o.userData.reste);
            S.cible = null;
            if (tout) {
              for (const o of obs.splice(0)) OBSTACLES.splice(OBSTACLES.indexOf(o), 1);
              if (S.habit) {
                portail.habiller(null);
                S.habit = null;
              }
            }
            for (const o of [...objs]) if (tout || !o.userData.reste) {
              o.removeFromParent();
              if (o.userData.accueil) A()?.libererObjetVisiteur?.(o.children[0]);
              objs.splice(objs.indexOf(o), 1);
            }
          }
        };
        let jeu = null, finie = false;
        try {
          jeu = fab(S);
        } catch (e) {
          console.warn("place3d : arriv\xE9e refus\xE9e", e);
          S.liberer(true);
          return null;
        }
        return {
          S,
          fini: deja,
          liberer: () => {
            chaque.length = 0;
            S.liberer(true);
          },
          // chaque image, dès sa naissance (RARE.maj) : ce qui bouge tout seul, ses figurants, ce qui suit un os
          vivre: (dt) => {
            S.dt = dt;
            for (let i = chaque.length; i--; ) try {
              if (chaque[i](S) === false) chaque.splice(i, 1);
            } catch (e) {
              chaque.splice(i, 1);
            }
            for (const a of figs) {
              a.m.maj(dt);
              const r = a.v;
              if (r) r.suivre(a.m, dt);
              a.suivre();
            }
            S.heros.suivre();
          },
          // une image de son déroulé, depuis son tour au portail (ARRIVEES) : false quand il est fini, figurants rendus
          maj: (dt) => {
            S.t += dt;
            if (typeof jeu === "function") {
              const p = jeu();
              jeu = null;
              Promise.resolve(p).catch((e) => console.warn("place3d : arriv\xE9e interrompue", e)).then(() => {
                finie = true;
              });
            }
            for (let i = attentes.length; i--; ) if (attentes[i].t <= S.t) attentes.splice(i, 1)[0].ok();
            const encore = !finie;
            if (!encore) {
              chaque.length = 0;
              S.liberer(false);
              f.m.objet.visible = true;
              f.m.objet.position.y = 0;
              f.m.inclinaison = 0;
              f.m.jouer("repos", { fondu: 0.2 });
            }
            return encore;
          }
        };
      };
      return RARE_API = {
        // la scène d'arrivée du visiteur (créée dès qu'il est prêt), sa mise à jour, et l'état du portail qu'elle demande
        mise: (f) => {
          if (f.mise !== void 0) return f.mise;
          if (!f.v) return false;
          if (!f.qui.rare?.local) return f.mise = null;
          f.mise = false;
          Promise.resolve(chargerScenes()).then(() => {
            if (f.mise === false && !detruite) f.mise = creerMise(f, vu() && !f.portail);
          });
          return false;
        },
        // (false : pas encore prête)
        oublierMise: (f) => {
          f.mise?.liberer();
          f.mise = void 0;
        },
        duJour,
        vu,
        marquerVu,
        arriver: arriver2,
        majArrivee,
        neuf: () => !!jour2 && !vu(),
        // (14/11, l'auteur) un visiteur rare n'arrive que si le SpotPass est activé : portail éteint ou détruit, aucun visiteur
        habitant: () => !jour2 || etatPortail() !== "normal" ? null : jour2.local ? jour2.pret && { cle: "vr:" + jour2.id, rare: jour2, donnees: jour2.donnees, nom: "", pantalon: jour2.pantalon || "or", tenue: jour2.tenue, couleursSwitch: jour2.couleursSwitch } : { cle: "vr:" + jour2.id, rare: jour2, donnees: jour2.mii, nom: jour2.nom, pantalon: "or", tenue: jour2.tenue },
        charger,
        onde: (f) => {
          onde = temps;
          ondeF = f;
        },
        // essais : un visiteur aujourd'hui, sans rien garder ni tirage ; il vient à la prochaine ouverture de la place. id d'un
        // visiteur de l'accueil (ou son code de scène) ou du serveur, ou (14/11) un visiteur du serveur entier (outils/sources/visiteurs-exemple.json)
        forcer: (id) => {
          const s = typeof id === "object" ? id : liste.find((x) => x.id === id);
          const f = membre2();
          if (f) {
            f.mise?.liberer();
            f.mise = void 0;
          }
          if (s && typeof s.id === "string" && Array.isArray(s.gestes)) {
            jour2 = force = s;
            try {
              localStorage.removeItem(VU);
            } catch (e) {
            }
            return Promise.resolve(true);
          }
          const v = locaux.find((x) => x.id === id || x.scenes?.[0] === id);
          if (!v) return false;
          const n = +String(v.scenes[0]).slice(1);
          jour2 = force = { id: v.id, local: true, nom: "", scene: n, aura: AURAS[(n - 1 + AURAS.length) % AURAS.length], gestes: GESTES2, pret: false };
          try {
            localStorage.removeItem(VU);
          } catch (e) {
          }
          return preparer2(jour2).then(() => jour2.pret);
        },
        oublierForce: () => {
          force = null;
          majJour();
          return true;
        },
        maj: (intro, dt) => {
          const f = membre2();
          if (!f) {
            if (aura) aura.g.visible = false;
            return;
          }
          if (f.refuse && !vu()) marquerVu();
          (RARE_MISE(f) || null)?.vivre(dt);
          if (!f.portail) majArrivee(f, dt);
          majAura(f);
        },
        toucher: (f) => {
          const v = f.qui.rare;
          if (f.arrivee || f.portail) return;
          if (v.local) return arriver2(f);
          f.etat = "geste";
          f.t = 2.6;
          f.vit = 0;
          pivoter(f, capVers(f, cam.position), v.gestes[Math.floor(Math.random() * v.gestes.length)]);
          carte({ sid: "vr:" + v.id, qui: v.nom, txt: v.phrase[window.__pcvLangue?.() || "fr"] || v.phrase.fr || "", jeu: { appid: 0, display_name: Tr("place.visiteur_rare") }, date: /* @__PURE__ */ new Date() });
          const im = $(".carte-zone .carte img");
          if (!im) return;
          im.removeAttribute("src");
          im.style.boxShadow += `, 0 0 0 ${u(6)} ${v.aura}`;
          Promise.resolve(window.__pcvTeteMii?.(Uint8Array.from(atob(v.mii), (c) => c.charCodeAt(0)))).then((url) => {
            if (url && im.isConnected) im.src = urlSure(url);
          }, () => {
          });
        },
        liberer: () => {
          clearTimeout(minuterie);
          document.documentElement.removeAttribute("data-pcv-visite-rare");
          for (const o of objets.values()) {
            A()?.libererObjetVisiteur?.(o.children[0]);
            o.removeFromParent();
          }
          objets.clear();
          if (aura) {
            aura.g.removeFromParent();
            aura.tex.dispose();
            for (const o of [aura.anneau, aura.lueur, aura.points, aura.vague]) {
              o.geometry?.dispose();
              o.material.dispose();
            }
            aura = null;
          }
        },
        etat: () => ({ liste: liste.map((v) => v.id), locaux: locaux.length, jour: jour2?.id || null, local: !!jour2?.local, pret: !!(jour2 && (!jour2.local || jour2.pret)), vu: vu(), present: !!membre2()?.m.objet.visible, actif: !!membre2()?.actif, arrivee: !!membre2()?.arrivee })
      };
    })();
    const ARRIVEES = (() => {
      const VENUS = "pcv-portail-venus", ATTENTE = "pcv-portail-attente", FRAIS = 7 * 864e5, TELE = 1.2, TELE_RARE = 1.8, SALUT = 3.2, FIN = 1.6, FIN_SCENE = 0.35;
      const CADRES = [[5.6, 10.6, 2.9], [2.8, 9.4, 2.6], [-2.8, 9.4, 2.6], [0, 8.4, 2.5], [6, 7, 2.4], [-6, 7, 2.4], [0, 6.4, 2.2]], VISE = [0, -0.2, 1.45];
      let apresScene = null, file = [], tour2 = null, enCours = false, rendue = false, pil = null, ref = null, camDejaPosee = false, cadre = null, fin = null;
      const lireSet = (c) => new Set(lire(c, []));
      const ecrire = (c, s) => {
        try {
          localStorage.setItem(c, JSON.stringify([...s].slice(-500)));
        } catch (e) {
        }
      };
      const devant = () => portail.local(0, 1.4);
      const rencontre = (f) => f.qui.sid?.startsWith("sp:") && f.qui.pantalon !== "or" && (!f.qui.jour || Date.now() - new Date(f.qui.jour).getTime() < FRAIS);
      const choisirCadre = () => {
        const v = portail.local(VISE[0], VISE[1], VISE[2]), seg = new T.Line3(), p = new T.Vector3(), q = new T.Vector3();
        const gene = (c2) => {
          seg.set(portail.local(c2[0], c2[1], c2[2], p.clone()), v);
          return icones.reduce((n, ic) => n + (seg.closestPointToPoint(q.set(ic.pos.x, 2.35, ic.pos.z), true, p).distanceTo(q) < 1.5), 0);
        };
        const c = CADRES.reduce((m, c2) => gene(c2) < gene(m) ? c2 : m, CADRES[0]);
        return { pos: portail.local(c[0], c[1], c[2]), vise: v };
      };
      const preparer2 = () => {
        const venus = lireSet(VENUS), att = lireSet(ATTENTE);
        const rare = foule.find((f) => f.qui.rare && !f.refuse && (!RARE.vu() || att.has(f.cle)));
        file = [...rare ? [rare] : [], ...foule.filter((f) => !f.heros && rencontre(f) && !venus.has(f.cle))].map((f) => ({ f, etat: "neuf", rare: !!f.qui.rare, att: att.has(f.cle) }));
        for (const x of file) x.f.portail = x;
        enCours = file.length > 0 && !file.some((x) => x.att);
        apresScene = null;
        tour2 = null;
        fin = null;
        rendue = false;
        ref = null;
        camDejaPosee = !enCours;
        cadre = file.length ? choisirCadre() : null;
        if (enCours) ecrire(ATTENTE, /* @__PURE__ */ new Set([...att, ...file.map((x) => x.f.cle)]));
        afficher();
      };
      const membres = () => file.map((x) => x.f);
      const attendent = () => !enCours && file.some((x) => x.etat === "neuf");
      const afficher = () => {
        const n = file.filter((x) => x.etat === "neuf").length, voir = attendent();
        if (!pil) {
          pil = document.createElement("div");
          pil.className = "portail-pil";
          racine.appendChild(pil);
        }
        if (voir) pil.innerHTML = `<i></i>${echap(Tr(n > 1 ? "place.portail_attendent" : "place.portail_attend", { n }))}`;
        pil.classList.toggle("vu", voir);
        pil.onclick = (e) => {
          e.stopPropagation();
          lancer();
        };
        legende();
      };
      const lancer = () => {
        if (!attendent()) return false;
        enCours = true;
        rendue = false;
        ref = null;
        camDejaPosee = false;
        fin = null;
        cadre = choisirCadre();
        blanc.classList.add("on");
        requestAnimationFrame(() => requestAnimationFrame(() => blanc.classList.remove("on")));
        window.__pcvSon?.("choisir");
        afficher();
        return true;
      };
      const finir = (x) => {
        const v = lireSet(VENUS), a = lireSet(ATTENTE);
        if (!x.rare) v.add(x.f.cle);
        a.delete(x.f.cle);
        ecrire(VENUS, v);
        ecrire(ATTENTE, a);
        x.etat = "parti";
        x.f.portail = null;
      };
      const maj = (dt, intro) => {
        if (!file.length) return;
        const vivants = file.some((x) => x.etat !== "parti"), bleu = !!(tour2 || file.find((x) => x.etat === "neuf") || fin && file.at(-1))?.rare;
        const prochain = !tour2 && !apresScene && file.find((x) => x.etat === "neuf");
        const mise = tour2 ? tour2.etat === "scene" && tour2.f.mise?.S.port : apresScene || (prochain?.rare && prochain.f.mise !== null && enCours ? { mode: "repos", nom: "bleu", q: 0 } : null);
        if (mise) portail.regler(mise.mode, mise.nom, mise.q);
        else portail.regler(vivants || fin ? tour2?.etat === "tele" ? bleu ? "descente" : "tele" : enCours || fin ? "allume" : "attente" : "repos", bleu ? "bleu" : "vert", tour2?.etat === "tele" ? tour2.q : 0);
        if (!enCours || attente) return;
        if (!tour2) {
          const x = file.find((x2) => x2.etat === "neuf" && pret(x2.f) && (!x2.rare || RARE.mise(x2.f) !== false));
          if (!x) {
            if (!file.some((x2) => x2.etat === "neuf")) {
              enCours = false;
              afficher();
            }
            return;
          }
          tour2 = x;
          apresScene = null;
          x.etat = "tele";
          x.q = 0;
          const m = x.f.m;
          x.f.etat = "intro";
          m.interrompre();
          m.objet.visible = !x.rare;
          m.objet.position.copy(portail.apparition());
          m.cap = m.capVise = capVers(x.f, devant());
          m.jouer("repos", { fondu: 0 });
          x.s0 = m.objet.scale.x;
          jouerPlace("arrivee", x.f, 0.8);
          if (x.rare) RARE.marquerVu();
          if (x.rare && x.f.mise && !x.f.mise.fini) {
            x.etat = "scene";
            m.objet.visible = false;
          }
        }
        if (tour2.etat === "scene") {
          if (tour2.f.mise.maj(dt)) return;
          tour2.f.mise.fini = true;
          apresScene = { ...tour2.f.mise.S.port };
          tour2.etat = "salue";
          tour2.f.arrivee = null;
        }
        if (tour2.etat === "tele") {
          const x = tour2, m = x.f.m;
          const g = x.rare ? lisse((x.q - 0.7) / 0.3) : lisse(x.q / 0.65);
          x.q = Math.min(1, x.q + dt / (x.rare ? TELE_RARE : TELE));
          if (x.rare && !m.objet.visible && x.q >= 0.7) {
            m.objet.visible = true;
            RARE.onde(x.f);
          }
          m.objet.scale.set(x.s0 * (0.35 + 0.65 * g), x.s0 * (0.15 + 0.85 * g), x.s0 * (0.35 + 0.65 * g));
          if (x.q < 1) return;
          m.objet.scale.setScalar(x.s0);
          x.etat = "sort";
          m.allerVers(devant(), { ensuite: "repos" }).then(() => {
            if (tour2 !== x) return;
            x.etat = "salue";
            x.t = SALUT;
            m.capVise = capVers(x.f, cam.position);
            babiller(x.f);
            if (x.rare) {
              RARE.arriver(x.f);
              const v = x.f.qui.rare, txt = v.phrase?.[window.__pcvLangue?.() || "fr"] || v.phrase?.fr;
              if (txt) montrerBulle({ cle: "vr:" + v.id, qui: v.nom, img: "", txt, jeu: { appid: 0, display_name: Tr("place.visiteur_rare") }, date: /* @__PURE__ */ new Date() }, x.f, SALUT);
              return;
            }
            m.jouer("saluer", { redemarrer: true });
            const b = bullesSpot().find((b2) => b2.sid === x.f.qui.sid);
            if (b) montrerBulle(b, x.f, SALUT);
          }, () => {
          });
          return;
        }
        if (tour2.etat === "salue" && (tour2.rare ? !RARE.majArrivee(tour2.f, dt) : (tour2.t -= dt) <= 0)) {
          const x = tour2, f = x.f;
          tour2 = null;
          finir(x);
          f.g = tirerGroupe(f);
          aller(f, false, placeLibre(f.g));
          if (!file.some((y) => y.etat === "neuf")) {
            enCours = false;
            fin = { t: temps + (f.mise ? FIN_SCENE : FIN) };
            afficher();
          }
        }
      };
      const courbe = (s, x) => {
        const b = /cubic-bezier\(([^)]+)\)/.exec(s)?.[1].split(",").map(Number) || (s === "linear" ? [0, 0, 1, 1] : s === "ease-in" ? [0.42, 0, 1, 1] : s === "ease" ? [0.25, 0.1, 0.25, 1] : [0, 0, 0.58, 1]);
        const B2 = (t, a, c) => 3 * a * t * (1 - t) ** 2 + 3 * c * t * t * (1 - t) + t ** 3;
        let lo = 0, hi = 1;
        for (let i = 0; i < 20; i++) {
          const m = (lo + hi) / 2;
          if (B2(m, b[0], b[2]) < x) lo = m;
          else hi = m;
        }
        return B2((lo + hi) / 2, b[1], b[3]);
      };
      const depart = new T.Vector3(), departVise = new T.Vector3();
      const camera = (pos, vise) => {
        if (rendue || !cadre) return false;
        if (fin) {
          if (temps < fin.t) {
            pos.copy(cadre.pos);
            vise.copy(cadre.vise);
            return true;
          }
          if (!fin.d) {
            const P = window.__pcvPanneau?.() || { duration: 300, easing: "ease-out" };
            fin.d = P.duration / 1e3;
            fin.e = P.easing;
            fin.t0 = temps;
            depart.copy(cadre.pos);
            departVise.copy(cadre.vise);
          }
          const q = Math.min(1, (temps - fin.t0) / fin.d), k2 = courbe(fin.e, q);
          if (q >= 1) {
            fin = null;
            cadre = null;
            return false;
          }
          pos.lerpVectors(depart, pos, k2);
          pos.y += Math.sin(Math.PI * k2) * 3;
          vise.lerpVectors(departVise, vise, k2);
          return 2;
        }
        if (!enCours) return false;
        let premiere = false;
        if (!ref) {
          ref = [vue.x, vue.y, vue.zoom];
          premiere = !camDejaPosee;
          camDejaPosee = true;
        } else if (Math.abs(vue.x - ref[0]) + Math.abs(vue.y - ref[1]) + Math.abs(vue.zoom - ref[2]) > 0.01) {
          rendue = true;
          return false;
        }
        pos.copy(cadre.pos);
        vise.copy(cadre.vise);
        const S = tour2?.etat === "scene" && tour2.f.mise?.S, c = S?.cible ? typeof S.cible === "function" ? S.cible() : S.cible : null, k = 1 - Math.exp(-Math.min(0.1, temps - (suivi.t || temps)) * 6.5);
        suivi.t = temps;
        suivi.v.lerp(c ? v0.copy(c).sub(cadre.vise) : v0.set(0, 0, 0), premiere ? 1 : k);
        suivi.pres += ((S?.pres || 0) - suivi.pres) * (premiere ? 1 : k);
        vise.add(suivi.v);
        pos.addScaledVector(suivi.v, 0.45).lerp(vise, suivi.pres);
        return premiere ? 2 : true;
      };
      const suivi = { v: new T.Vector3(), t: 0, pres: 0 }, v0 = new T.Vector3();
      return {
        preparer: preparer2,
        maj,
        camera,
        lancer,
        attendent,
        membres,
        rencontre,
        occupe: () => enCours,
        venus: () => lireSet(VENUS),
        vue: () => cadre?.pos || null,
        prend: (f) => !!f.portail && f.portail.etat !== "parti",
        etat: () => ({ file: file.map((x) => x.etat), enCours, fin: !!fin, rendue }),
        liberer: () => {
          for (const x of file) x.f.portail = null;
          file = [];
          tour2 = null;
          fin = null;
          pil?.remove();
          pil = null;
        }
      };
    })();
    const projection = new T.Vector3(), pointEcran = [0, 0, 0];
    const ecran = (v) => {
      projection.copy(v).project(cam);
      pointEcran[0] = (projection.x + 1) / 2 * innerWidth;
      pointEcran[1] = (1 - projection.y) / 2 * innerHeight;
      pointEcran[2] = projection.z;
      return pointEcran;
    };
    const rectMembre = (f) => {
      if (f.v && !f.enPhoto) return f.v.rectEcran(cam, innerWidth, innerHeight);
      const p = f.m.objet.position, [x, y] = ecran(p), [, yh] = ecran(p.clone().setY(p.y + f.taille)), w = (y - yh) * 0.32;
      return { x0: x - w, x1: x + w, y0: yh, y1: y };
    };
    let tourPrec = 0, occupe = false, fabPrevue = 0, pauseFab = 0, riMoy = 0, ouvertA = 0, imagesVues = 0;
    const champ = new T.Frustum(), boule = new T.Sphere(), m4 = new T.Matrix4(), q0 = new T.Quaternion(), v1 = new T.Vector3(), pz = new T.Vector3();
    const tour = (t) => {
      raf = requestAnimationFrame(tour);
      if (racine.hidden || document.hidden) {
        arreterBoucle();
        return;
      }
      if (window.__pcvSteamDessus?.(250)) {
        vue.arreter();
        arreterBoucle();
        setTimeout(() => {
          if (!racine.hidden) demarrerBoucle();
        }, 100);
        return;
      }
      const brut = t - (tourPrec || t);
      tourPrec = t;
      const eco = !!window.__pcvModes?.coupe("place"), bas = eco || (window.__pcvBridge?.limiteTdp() || Infinity) <= TDP_BAS;
      const plafond = bas ? Math.min(ECO_IPS, REG.plafond || ECO_IPS) : REG.plafond;
      if (plafond && t - dernier + Math.min(brut, ECRAN.riMin) / 2 < 1e3 / plafond) return;
      const dt = fige ? 0 : Math.max(0, Math.min(0.1, (t - dernier) / 1e3));
      dernier = t;
      temps += dt;
      const t0 = performance.now();
      if (attente) {
        const f0 = performance.now(), bout = f0 - attenteDepuis >= PATIENCE;
        let reste = true;
        choisirFoule();
        while ((reste = fabriquerUn()) && performance.now() - f0 < 10) ;
        if (!bout && (reste || !dessous)) return;
        if (!bout && !compilerPlace()) return;
        attente = false;
        lancerIntro(REG.intro !== false);
        return;
      }
      const fabrique = occupe;
      mesurerEcran(brut, fabrique);
      occupe = false;
      if (brut > 0 && !fabrique) riMoy = riMoy ? riMoy + (Math.min(250, brut) - riMoy) * 0.1 : brut;
      const intro = majIntro(), enPhoto = eco && !intro;
      photosEnFond();
      viser(dt, intro);
      marquer();
      cam.updateMatrixWorld();
      choisirFoule();
      for (const ic of icones) {
        const g = ic.objet;
        if (intro && ic.arrive) continue;
        g.position.y = 2.35 + Math.sin(temps * 1.1 + ic.k) * 0.07;
        g.lookAt(cam.position);
        g.scale.setScalar(g.scale.x + ((ic.k === sel ? 0.92 : 1) - g.scale.x) * Math.min(1, dt * 14));
      }
      {
        const s = vue.tourne();
        if (s && !roue.tenue && temps - roue.appui > GESTE.attente) roue.v = s * GESTE.tenue;
      }
      if (roue.tenue || roue.v || roue.a !== Math.round(roue.a)) tournerRoue(dt);
      for (const ic of icones) fondreTuile(ic);
      const peint = lumiereSale && temps >= lumiereT;
      if (peint) {
        lumiereT = temps + 0.3;
        peindreLumiere();
      }
      if (!fabPrevue && !intro && performance.now() >= pauseFab) fabPrevue = setTimeout(fabriquerApres, 0);
      murmurer(dt);
      let n = 0;
      const ta = performance.now(), palier = PALIERS[Q?.palier || 0];
      champ.setFromProjectionMatrix(m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
      for (const f of foule) {
        const p = f.m, v = f.v;
        f.enPhoto = enPhoto && !!f.photo;
        if (!p.objet.visible || !f.actif) {
          if (v) {
            v.objet.visible = false;
            v.horsVue = true;
          }
          f.dt = 0;
          continue;
        }
        boule.center.copy(p.objet.position);
        boule.center.y += f.taille / 2;
        boule.radius = f.taille;
        const horsVue = !champ.intersectsSphere(boule);
        f.dt += dt;
        const delai = intro || !horsVue ? 0 : 0.125;
        if (f.dt >= delai) {
          const pasDt = Math.min(0.15, f.dt);
          f.dt = 0;
          if (!intro || f.etat !== "intro") vivre(f, pasDt);
          p.maj(pasDt);
          if (!horsVue) pas(f);
          if (v && !horsVue && !f.enPhoto) {
            v.vitesse = p.vitesse;
            v.suivre(p, pasDt);
          }
        }
        if (v) {
          v.horsVue = horsVue;
          v.objet.visible = !horsVue && !f.enPhoto;
        }
        if (f.enPhoto && !horsVue) {
          f.loin = cam.position.distanceToSquared(p.objet.position);
          loin.push(f);
        }
        if (palier.ombres && !horsVue) {
          const k = 1 / (1 + p.objet.position.y * 0.5);
          pz.copy(p.objet.position).setY(0);
          v1.set(0.55 * k * f.taille, 1, 0.4 * k * f.taille);
          m4.compose(pz, q0, v1);
          ombres.setMatrixAt(n++, m4);
        }
      }
      ombres.visible = palier.ombres;
      ombres.count = n;
      if (n) ombres.instanceMatrix.needsUpdate = true;
      RARE.maj(intro, dt);
      ARRIVEES.maj(dt, intro);
      portail.maj(dt);
      const tb = performance.now(), qg = gpuDebut();
      const vrais3d = !enPhoto || foule.some((f) => f.v && !f.enPhoto && f.actif);
      troupe.montrer?.(vrais3d);
      if (vrais3d) troupe.maj();
      dessinerPhotos();
      mesure.vie += tb - ta;
      mesure.os += performance.now() - tb;
      majBulles(dt);
      const t1 = performance.now();
      rendu.render(scene, cam);
      if (icones.some((ic) => ic.finitions[1].userData.voulu && ic.objet.visible)) rendreVerre(palier.lentille);
      gpuFin(qg);
      const t2 = performance.now();
      imagesVues++;
      mesure.n++;
      mesure.logique += t1 - t0;
      mesure.rendu += t2 - t1;
      suivreQualite(t, t2 - t0, intro || fabrique || peint);
    };
    const fabriquerApres = () => {
      fabPrevue = 0;
      if (!raf || racine.hidden) return;
      const f0 = performance.now();
      occupe = fabriquerUn();
      const d = performance.now() - f0;
      const seuil = Math.min(ECRAN.riMin * window.__pcvCharge.QUALITE.haut, 1e3 / 60), libre2 = Math.max(1 / 30, 1 - (riMoy || ECRAN.riMin) / seuil);
      if (d > 8 && temps >= introFin) pauseFab = f0 + d / libre2;
    };
    const mesure = { n: 0, logique: 0, rendu: 0, vie: 0, os: 0, creer: { n: 0, ms: 0, max: 0 } };
    const demarrerBoucle = () => {
      if (raf) return;
      tourPrec = 0;
      if (Q) Q.tp = 0;
      dernier = performance.now();
      raf = requestAnimationFrame(tour);
    };
    const arreterBoucle = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const SOUS = "data-pcvp-sous";
    {
      const st = document.createElement("style");
      st.textContent = `html:not(.pcv-steam-verrou, .pcv-steam-modale) [${SOUS}] { content-visibility: hidden !important; }`;
      racine.appendChild(st);
    }
    const zDe = (e) => {
      const z = parseInt(getComputedStyle(e).zIndex);
      return Number.isFinite(z) ? z : null;
    };
    let enPause = [], dessous = false;
    const masquerDessous = (oui) => {
      dessous = oui;
      for (const e of document.querySelectorAll(`[${SOUS}]`)) e.removeAttribute(SOUS);
      for (const a of enPause) try {
        a.play();
      } catch (e) {
      }
      enPause = [];
      if (!oui) return;
      enPause = document.getAnimations().filter((a) => a.playState === "running" && !racine.contains(a.effect?.target) && !a.effect?.target?.closest?.("#pcv-bienvenue"));
      for (const a of enPause) a.pause();
      let zb = zDe(racine) ?? 0;
      for (let p = racine; p.parentElement && p !== document.body; p = p.parentElement) {
        const zp = zDe(p);
        if (p !== racine && zp != null) zb = zp;
        let avant = true;
        for (const f of p.parentElement.children) {
          if (f === p) {
            avant = false;
            continue;
          }
          if (/^(STYLE|SCRIPT|LINK|META)$/.test(f.tagName) || f.id === "pcv-toasts") continue;
          const zf = zDe(f) ?? 0;
          if (zf < zb || zf === zb && avant) f.setAttribute(SOUS, "");
        }
      }
    };
    const ombreTuile = (ic) => sol?.material.map !== motifSol && PALIERS[Q?.palier || 0].ombres && ic.objet.visible;
    const PALIERS = [
      { ombres: true, foule: 1, tete: 256, basse: false, tranche: 3, finitions: true, lentille: true },
      { ombres: true, foule: 0.85, tete: 256, basse: true, tranche: 3, finitions: true, lentille: true },
      { ombres: false, foule: 0.6, tete: 256, basse: true, tranche: 2, finitions: true, lentille: false },
      { ombres: false, foule: 0.4, tete: 256, basse: true, tranche: 1, finitions: false },
      { ombres: false, foule: 0.15, tete: 256, basse: true, tranche: 1, finitions: false }
      // (lot 16) une vingtaine de Mii, comme la place de la Wii U (avant : 38 sur 150, 7,3 ms de calcul par image pour 7 de budget)
    ];
    const QUALITE = window.__pcvCharge.QUALITE;
    const jugerPalier = window.__pcvCharge.juger;
    let Q = null, ordreFoule = [], prochaineFoule = 0;
    const priorite = (f) => f.heros || f === bulleMii || f.qui.rare || f.portail ? -2 : f.qui.moi ? -1 : (f.refuse ? 2e9 : f.v ? 0 : 1e9) + f.distance * (f.actif ? 0.85 : 1);
    const comparerFoule = (a, b) => priorite(a) - priorite(b) || a.rang - b.rang;
    const choisirFoule = () => {
      if (temps < prochaineFoule) return;
      prochaineFoule = temps + 0.5;
      const palier = PALIERS[Q?.palier || 0], max = Math.max(N_HEROS, Math.ceil(foule.length * palier.foule));
      for (const f of foule) f.distance = cam.position.distanceToSquared(f.m.objet.position);
      ordreFoule.sort(comparerFoule);
      for (let i = 0; i < ordreFoule.length; i++) {
        const f = ordreFoule[i];
        garder(f, i < max || f === bulleMii || !!f.qui.rare || !!f.portail);
      }
      for (const ic of icones) ic.ombre.visible = ombreTuile(ic);
      finitions(palier);
    };
    const finitions = (palier, tout) => {
      for (const ic of icones) {
        const v = ic.finitions[1];
        ic.finitions[0].visible = palier.finitions;
        v.visible = v.userData.voulu = palier.finitions && (tout || formeTuile() === "verre");
        v.material = ic.verres[palier.lentille ? 1 : 0];
        const galet = formeTuile() === "galet";
        if (galet && !tout) v.visible = v.userData.voulu = false;
        ic.galet.visible = galet || !!tout;
        ic.image.visible = !galet;
        ic.finitions[0].visible = palier.finitions && !galet;
        ic.cadre.visible = !galet && !v.visible;
      }
      const l = tout || !!pierre().lanternes, allumees = l && palier.finitions;
      if (lanternes && (lanternes.visible !== l || lanternes.userData.allumees !== allumees)) {
        lanternes.visible = l;
        lanternes.userData.allumees = allumees;
        for (const c of lanternes.children) if (c.isSprite) c.visible = allumees;
        lanternes.userData.boule.color.set(allumees ? 16769704 : 3816002);
        lumiereSale = true;
      }
    };
    const partir = (f) => {
      f.sort = false;
      f.actif = false;
      f.etat = "dehors";
      f.but = null;
      f.m.interrompre();
      f.m.objet.visible = false;
    };
    const garder = (f, oui) => {
      if (oui) {
        if (f.sort) {
          f.sort = false;
          aller(f);
        } else if (!f.actif) {
          f.actif = true;
          if (f.etat === "dehors" && pret(f) && temps >= introFin) entrer(f);
        }
        return;
      }
      if (!f.actif) return;
      if (f.etat === "dehors" || !f.m.objet.visible || !f.v || f.v.horsVue || cache(f.m.objet.position, f.taille)) partir(f);
      else if (!f.sort) {
        f.sort = true;
        aller(f, true, bord(f.m.objet.position));
      }
    };
    const qualiteNeuve = () => {
      const gl2 = rendu.getContext();
      return {
        ...window.__pcvCharge.etatQualite(Math.min(PALIERS.length - 1, Math.max(0, lire("pcv-place3d-mesure", {}).palier | 0))),
        gl: gl2,
        ext: gl2.getExtension?.("EXT_disjoint_timer_query_webgl2") || null,
        requetes: [],
        libres: [],
        gpuMs: 0,
        gpuN: 0,
        ms: 0,
        n: 0,
        cpuMs: 0,
        images: 0,
        pire: 0,
        t0: 0,
        tp: 0,
        bilan: null,
        aff: null
      };
    };
    const gpuDebut = () => {
      if (!Q?.ext || Q.requetes.length > 4) return null;
      const q = Q.libres.pop() || Q.gl.createQuery();
      Q.gl.beginQuery(Q.ext.TIME_ELAPSED_EXT, q);
      return q;
    };
    const gpuFin = (q) => {
      if (!Q?.ext) return;
      const gl2 = Q.gl;
      if (q) {
        gl2.endQuery(Q.ext.TIME_ELAPSED_EXT);
        Q.requetes.push(q);
      }
      while (Q.requetes.length && gl2.getQueryParameter(Q.requetes[0], gl2.QUERY_RESULT_AVAILABLE)) {
        const r = Q.requetes.shift();
        if (!gl2.getParameter(Q.ext.GPU_DISJOINT_EXT)) {
          Q.gpuMs += gl2.getQueryParameter(r, gl2.QUERY_RESULT) / 1e6;
          Q.gpuN++;
        }
        Q.libres.push(r);
      }
    };
    const suivreQualite = (t, cpu, pic) => {
      if (!Q) return;
      const d = Q.tp ? t - Q.tp : 0;
      Q.tp = t;
      if (pic) Q.grace = t + QUALITE.grace;
      if (d > 0) {
        Q.ms += d;
        Q.n++;
        Q.pire = Math.max(Q.pire, d);
      }
      Q.cpuMs += cpu;
      Q.images++;
      if (!Q.t0) Q.t0 = t;
      if (t - Q.t0 < QUALITE.fenetre) return;
      Q.t0 = t;
      const inter = Q.n ? Q.ms / Q.n : 0, gpu = Q.gpuN ? Q.gpuMs / Q.gpuN : null, moyenCpu = Q.cpuMs / Q.images;
      const budget = Math.max(ECRAN.riMin, REG.plafond ? 1e3 / REG.plafond : 0), P = window.__pcvPlacePerf;
      const sature = moyenCpu > budget * 0.9 || gpu != null && gpu > budget * 0.9, trop = inter > budget * QUALITE.haut || sature;
      const large = inter > 0 && inter <= budget * QUALITE.haut && moyenCpu < budget * QUALITE.marge && (gpu == null || gpu < budget * QUALITE.marge);
      const avantPalier = Q.palier;
      if (jugerPalier(Q, t, inter, trop, large && !Q.fige, sature, PALIERS.length)) prochaineFoule = 0;
      if (Q.palier > avantPalier) Q.descendu = true;
      else if (Q.palier < avantPalier && Q.descendu) Q.fige = true;
      Q.bilan = {
        ips: inter ? +(1e3 / inter).toFixed(1) : 0,
        palier: Q.palier,
        budgetMs: +budget.toFixed(2),
        pire: Math.round(Q.pire),
        gpu: gpu == null ? null : +gpu.toFixed(2),
        cpu: +moyenCpu.toFixed(2),
        tete: PALIERS[Q.palier].tete,
        taille: [toile.width, toile.height],
        dessins: rendu.info.render.calls,
        triangles: rendu.info.render.triangles,
        actifs: foule.filter((f) => f.actif).length,
        vrais: foule.filter((f) => f.v).length
      };
      Q.gpuMs = Q.gpuN = Q.ms = Q.n = Q.cpuMs = Q.images = Q.pire = 0;
      if (P && !Q.aff) {
        Q.aff = document.createElement("div");
        Q.aff.style.cssText = "position:absolute;right:6px;top:4px;z-index:99;font:12px monospace;color:var(--pcv-texte);background:var(--pcv-carte);padding:2px 6px;pointer-events:none";
        racine.appendChild(Q.aff);
      } else if (!P && Q.aff) {
        Q.aff.remove();
        Q.aff = null;
      }
      if (Q.aff) texte(Q.aff, Tr("place.performance", { ips: Q.bilan.ips, palier: Q.palier, gpu: Q.bilan.gpu ?? "?", cpu: Q.bilan.cpu, tete: Q.bilan.tete, mii: Q.bilan.actifs }));
    };
    const legende = () => {
      const fiche = $(".carte-zone [data-fiche]"), ouverte2 = !!$(".carte-zone").innerHTML;
      const l = ouverte2 ? [[1, fiche ? fiche.textContent : Tr("dispo.fermer")], [2, Tr("dispo.fermer")]] : bulleSel ? [[1, Tr("place.lire")], [2, Tr("place.retour")]] : dockSel >= 0 ? [[1, Tr("place.ouvrir")], [2, Tr("place.retour")]] : [...ARRIVEES.attendent() ? [[1, Tr("place.faire_entrer")]] : [], [3, Tr("place.raccourcis")], [[7, 8], Tr("place.tourner")]];
      window.__pcvIcones.poser(legendeEl, window.__pcvLegendeDe(l));
      for (const e of racine.querySelectorAll(".zoom .tz")) {
        const h = window.__pcvIcones.touche(+e.dataset.touche);
        if (e.innerHTML !== h) e.innerHTML = h;
      }
      const dk = $(".dock").getBoundingClientRect();
      if (dk.width) legendeEl.style.left = `calc(${dk.right - racine.getBoundingClientRect().left}px + ${u(16)})`;
    };
    (window.__pcvLegendes ||= {}).place = () => {
      if (!racine.hidden) legende();
    };
    let cran = -1;
    const cranDe = (z) => ZOOM.crans.findLastIndex((c) => z >= c * 0.999);
    const marquer = () => {
      const n = cranDe(vue.zoom);
      if (n === cran) return;
      cran = n;
      pts.forEach((p, i) => p.classList.toggle("on", i <= n));
    };
    const zoomer = (d) => {
      const c = ZOOM.crans, n = cranDe(vue.zoom);
      vue.zoom = c[Math.max(0, Math.min(c.length - 1, d > 0 ? n + 1 : vue.zoom > c[n] * 1.001 ? n : n - 1))];
      marquer();
      window.__pcvSon?.(d > 0 ? "zoom+" : "zoom-");
    };
    const dockChoisir = (i, son = true) => {
      dockSel = i;
      if (i >= 0) dockDernier = i;
      vue.arreter();
      boutonsDock.forEach((b, j) => b.classList.toggle("choisi", j === i));
      legende();
      if (son) window.__pcvSon?.("bouge");
    };
    const finirIntro = () => {
      if (temps < introFin) {
        introFin = temps;
        lancerIntro(false);
      }
    };
    $(".moins").onclick = (e) => {
      e.stopPropagation();
      zoomer(-1);
    };
    $(".plus").onclick = (e) => {
      e.stopPropagation();
      zoomer(1);
    };
    const ACTIONS = {
      amis: () => window.__pcvAmisMontrer?.(true),
      discussions: () => window.__pcvAmisDiscussion?.(),
      magasin: () => O.__pcvAller?.(3),
      eshop: () => window.__pcvLancement?.ouvrirAppli?.("eshop") || (window.__pcvBoutique ? window.__pcvBoutique.ouvrir() : O.__pcvAller?.(3)),
      medias: () => {
        const m = window.__pcvMediatheque || O.__pcvMediatheque;
        if (m) m.ouvrir();
        else O.__pcvAller?.(5);
      },
      /* (ouvrir() ne renvoie rien : pas de ??) */
      telechargements: () => O.__pcvAller?.(6),
      parametres: () => O.__pcvAller?.(7)
    };
    const ouvrir = (a) => {
      window.__pcvSon?.("choisir");
      montrer(false);
      if (a.startsWith("jeu:")) pageJeu(a.slice(4));
      else ACTIONS[a]?.();
    };
    const point = new T.Vector2(), touches = [], objetsIcones = [];
    const tuileSous = (x, y) => {
      const r = toile.getBoundingClientRect();
      if (!r.width || !r.height || x < r.left || x > r.left + r.width || y < r.top || y > r.top + r.height) return null;
      point.set((x - r.left) / r.width * 2 - 1, 1 - (y - r.top) / r.height * 2);
      rayon.setFromCamera(point, cam);
      objetsIcones.length = touches.length = 0;
      for (const ic of icones) if (ic.objet.visible) objetsIcones.push(ic.objet);
      rayon.intersectObjects(objetsIcones, true, touches);
      return touches[0]?.object.userData.k ?? null;
    };
    const choisirPoint = (x, y) => {
      if (racine.hidden) return false;
      const k = tuileSous(x, y);
      if (k == null) return false;
      selectionner(k);
      ouvrir(icones[k].action);
      return true;
    };
    toile.addEventListener("click", (e) => {
      if (glisse) {
        glisse = false;
        return;
      }
      if (choisirPoint(e.clientX, e.clientY)) return;
      for (const f of foule) {
        if (!f.actif || f.v?.horsVue || !f.m.objet.visible || !pret(f)) continue;
        const b = rectMembre(f);
        if (e.clientX > b.x0 && e.clientX < b.x1 && e.clientY > b.y0 && e.clientY < b.y1) {
          if (f.qui.rare) {
            RARE.toucher(f);
            return;
          }
          f.etat = "geste";
          f.t = 2.2;
          f.pivot = null;
          f.vit = 0;
          f.m.capVise = capVers(f, cam.position);
          hop(f);
          f.m.sauterVers(f.m.objet.position.clone().setY(0), { hauteur: 0.6, ensuite: "saluer" }).catch(() => {
          });
          return;
        }
      }
      toucherPortail(e.clientX, e.clientY);
    });
    const toucherPortail = (x, y) => {
      const et = portail.etat(), o = portail.objet();
      if (et === "normal" || !o) return false;
      const r = toile.getBoundingClientRect();
      rayon.setFromCamera({ x: (x - r.left) / r.width * 2 - 1, y: -(y - r.top) / r.height * 2 + 1 }, cam);
      const vu = (x2) => {
        for (; x2; x2 = x2.parent) if (!x2.visible) return false;
        return true;
      }, ign = portail.ignores();
      if (!rayon.intersectObject(o, true).some((i) => vu(i.object) && !ign.includes(i.object))) return false;
      const Q2 = window.__pcvDossiers, ic = (n) => window.__pcvIcones?.trace(n);
      return et === "eteint" ? Q2?.demander?.({
        ailleurs: true,
        ic: "dossier",
        svg: ic("spotpass"),
        titre: Tr("place.portail.eteint.titre"),
        texte: Tr("place.portail.eteint.texte"),
        non: Tr("steamu.annuler"),
        oui: Tr("spotpass.activer"),
        ok: () => window.__pcvSpotPassFenetre?.ouvrir?.("accord") || window.__pcvSon?.("bord")
      }) : Q2?.demander?.({
        ailleurs: true,
        ic: "dossier",
        svg: ic("silhouette"),
        titre: Tr("place.portail.detruit.titre"),
        texte: Tr("place.portail.detruit.texte"),
        non: Tr("notifs.plus_tard"),
        oui: Tr("place.portail.detruit.importer"),
        ok: () => window.__pcvSpotPassFenetre?.mii?.()
      });
    };
    racine.addEventListener("click", (e) => {
      const b = e.target.closest(".dock-btn");
      if (b) ouvrir(b.dataset.action);
    });
    const GESTE = { seuil: 12, frein: 3.5, cale: 1.5, attente: 0.35, tenue: 5 };
    const pousserRoue = (s) => {
      const v = Math.abs(roue.v), r = v > GESTE.cale ? roue.a + Math.sign(roue.v) * (v - GESTE.cale) / GESTE.frein : roue.a, d = Math.round(r) + s - roue.a;
      roue.v = Math.sign(d) * (GESTE.cale + GESTE.frein * Math.max(0, Math.abs(d) - 0.1));
      roue.appui = temps;
    };
    const planTuiles = new T.Plane(new T.Vector3(0, 1, 0)), surPlan = new T.Vector3();
    const angleDoigt = (x, y, h) => {
      const r = toile.getBoundingClientRect();
      point.set((x - r.left) / r.width * 2 - 1, 1 - (y - r.top) / r.height * 2);
      rayon.setFromCamera(point, cam);
      planTuiles.constant = -h;
      return rayon.ray.intersectPlane(planTuiles, surPlan) ? [-surPlan.x / RX, surPlan.z / RZ] : null;
    };
    const doigts = /* @__PURE__ */ new Map();
    let geste = null, glisse = false;
    const ecart = () => {
      const [a, b] = doigts.values();
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };
    toile.addEventListener("pointerdown", (e) => {
      if (temps < introFin) return;
      doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try {
        toile.setPointerCapture(e.pointerId);
      } catch (x) {
      }
      if (doigts.size === 1) {
        glisse = false;
        const k = tuileSous(e.clientX, e.clientY);
        geste = { x0: e.clientX, y0: e.clientY, t: performance.now(), sur: k != null, actif: null };
        if (k != null) {
          geste.h = icones[k].objet.position.y;
          geste.p = angleDoigt(e.clientX, e.clientY, geste.h);
        }
      } else if (geste) {
        geste.actif = "pince";
        geste.d = ecart();
        glisse = true;
      }
    });
    toile.addEventListener("pointermove", (e) => {
      const d = doigts.get(e.pointerId);
      if (!d || !geste) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      if (geste.actif === "pince") {
        const n = ecart();
        if (geste.d && n) {
          vue.zoomer(Math.log(n / geste.d) / 0.3);
          marquer();
        }
        geste.d = n;
        return;
      }
      if (!geste.actif) {
        if (Math.hypot(e.clientX - geste.x0, e.clientY - geste.y0) < GESTE.seuil) return;
        geste.actif = geste.sur ? "roue" : "promene";
        glisse = true;
      }
      const t = performance.now(), dt = Math.max(4, t - geste.t) / 1e3;
      geste.t = t;
      if (geste.actif === "roue") {
        const p = angleDoigt(e.clientX, e.clientY, geste.h), q = geste.p;
        geste.p = p;
        if (!p || !q) return;
        const da = (q[1] * (p[0] - q[0]) - q[0] * (p[1] - q[1])) / Math.max(0.25, q[0] * q[0] + q[1] * q[1]) * icones.length / (2 * Math.PI);
        roue.a += da;
        roue.tenue = true;
        roue.v = roue.v * 0.5 + da / dt * 0.5;
      } else {
        const u2 = 2 * cam.position.distanceTo(camVise) * Math.tan(cam.fov * Math.PI / 360) / innerHeight;
        const mx = -dx * u2 / RX, my = -dy * u2 / Math.sin(ELEV) / RZ;
        vue.x += mx;
        vue.y += my;
        vue.zoomer(0);
        geste.vx = (geste.vx || 0) * 0.5 + mx / dt * 0.5;
        geste.vy = (geste.vy || 0) * 0.5 + my / dt * 0.5;
      }
    });
    const lacher = (e) => {
      doigts.delete(e.pointerId);
      if (doigts.size) return;
      if (geste?.actif === "roue") {
        roue.tenue = false;
        if (performance.now() - geste.t > 80) roue.v = 0;
      } else if (geste?.actif === "promene" && performance.now() - geste.t <= 80) vue.elan?.(geste.vx || 0, geste.vy || 0);
      geste = null;
    };
    toile.addEventListener("pointerup", lacher);
    toile.addEventListener("pointercancel", lacher);
    const texte = (el, t) => {
      const n = el.firstChild;
      if (n?.nodeType === 3 && !n.nextSibling) {
        if (n.data !== t) n.data = t;
      } else el.textContent = t;
    };
    const peindreEtat = () => window.__pcvEtat.peindre(racine, [...document.querySelectorAll("{{HeaderItem@Header}}{{BatteryIcon@HeaderItem}}")].find((x) => !x.closest(".pile")));
    peindreEtat();
    window.__pcvPlaceEtat = window.__pcvEtat.suivre(racine, peindreEtat);
    window.__pcvPlaceHeure = setInterval(() => {
      if (racine.hidden) return;
      if (temps >= introFin) construire();
      const a = avatarDe();
      if (a) [...racine.querySelectorAll("[data-pcv-avatar]"), ...fantome.querySelectorAll("[data-pcv-avatar]")].forEach((i) => {
        if (i.src !== a) i.src = a;
      });
    }, 3e3);
    let fermeture = 0;
    let lacherY = null;
    const montrer = (oui) => {
      if (oui && !lacherY) lacherY = window.__pcvToutesTouches?.((b, bas) => b === 4 && bas && !racine.hidden && !window.__pcvSteamDessus?.(250) && window.__pcvEcran?.actif?.() === "place" && !window.__pcvBienvenue?.affichee?.() && window.__pcvManette.place(4)) || null;
      else if (!oui && lacherY) {
        lacherY();
        lacherY = null;
      }
      if (fermeture) {
        clearTimeout(fermeture);
        fermeture = 0;
        racine.hidden = true;
        racine.classList.remove("fondu");
      }
      const etait = !racine.hidden;
      if (oui) racine.hidden = false;
      bascule.hidden = oui;
      if (oui && !etait) {
        if (!preparer()) {
          racine.hidden = true;
          return;
        }
        decorTheme();
        racine.classList.add("fondu");
        requestAnimationFrame(() => requestAnimationFrame(() => racine.classList.remove("fondu")));
        setTimeout(() => requestAnimationFrame(() => {
          if (!racine.hidden && !fermeture) masquerDessous(true);
        }), FONDU_MS);
        Q ||= qualiteNeuve();
        Object.assign(Q, window.__pcvCharge.etatQualite(Q.palier), { fige: false, descendu: false, tp: 0, t0: 0, grace: performance.now() + QUALITE.grace });
        Q.gpuMs = Q.gpuN = Q.ms = Q.n = Q.cpuMs = Q.images = Q.pire = 0;
        {
          const e = racine.querySelector(".gl"), [h, c] = toucheHaut();
          if (e) {
            if (e.innerHTML !== h) e.innerHTML = h;
            e.style.background = c;
          }
          peindreEtat();
        }
        $(".carte-zone").innerHTML = "";
        racine.querySelectorAll("[data-pcv-avatar]").forEach((i) => {
          i.src = avatarDe();
        });
        const essai = window.__pcvPlace?.rejouerArrivee;
        if (essai) {
          introVue = false;
          if (essai === "froid") {
            for (const f of foule) oublier(f);
            foule = [];
            troupe.liberer();
            troupe = M.foule({ rendu, scene, max: FOULE_MAX + 1 });
            lumiereSale = true;
          }
        }
        RARE.charger();
        portail.suivre();
        selectionner(-1);
        construire();
        if (!teintesVues) {
          teinter();
          teintesVues = true;
        }
        peupler();
        ARRIVEES.preparer();
        majAmis();
        vue.reinitialiser();
        Object.assign(vue, DEPART);
        marquer();
        dockChoisir(-1, false);
        vue.activer(true);
        retailler();
        bulles.forEach((b) => {
          b.fete = false;
        });
        if (window.__pcvNintendo?.pret) window.__pcvNintendo.pret.then(prechargerPlace);
        else prechargerPlace();
        froid = !foule.some((f) => f.v);
        choisirFoule();
        if (!manque()) lancerIntro(REG.intro !== false);
        else {
          attente = true;
          compilee = 0;
          attenteDepuis = performance.now();
          blanc.classList.add("on", "attend");
          for (const f of foule) f.m.objet.visible = false;
        }
        camPos.set(0, 0.92, 10.2);
        camVise.set(0, 0.5, 5.3);
        tourPrec = 0;
        ouvertA = temps;
        imagesVues = 0;
        demarrerBoucle();
        visite();
        requestAnimationFrame(() => {
          if (!racine.hidden && !fermeture) window.__pcvMusique?.(bienvenue || attente && !introVue && REG.intro !== false ? "place-bienvenue" : musiqueVisite);
        });
      }
      if (!oui && etait) {
        arreterBoucle();
        masquerDessous(false);
        vue.activer(false);
        try {
          localStorage.setItem("pcv-place3d-mesure", JSON.stringify({
            quand: (/* @__PURE__ */ new Date()).toISOString(),
            duree: +temps.toFixed(1) - +ouvertA.toFixed(1),
            images: imagesVues,
            ips: +(imagesVues / Math.max(1e-3, temps - ouvertA)).toFixed(1),
            vrais: foule.filter((f) => f.v).length,
            ecranMs: +ECRAN.riMin.toFixed(1),
            palier: Q?.palier ?? 0
          }));
        } catch (e) {
        }
        zoneBulles.innerHTML = "";
        bulleSel = false;
        relireSiens();
        racine.classList.add("fondu");
        fermeture = setTimeout(() => {
          fermeture = 0;
          racine.hidden = true;
          racine.classList.remove("fondu");
        }, FONDU_MS);
      }
    };
    window.__pcvPlaceMontrer = montrer;
    $(".retour").onclick = () => montrer(false);
    bascule.onclick = () => {
      if (/^\/routes\/library\/home/.test(O.location.pathname)) montrer(true);
      else O.__pcvAller?.(1);
    };
    window.addEventListener("keydown", window.__pcvToucheY = (e) => {
      if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      const k = e.key;
      if (k === "y" || k === "Y") {
        if (racine.hidden && !/^\/routes\/library\/home/.test(O.location.pathname)) return;
        montrer(racine.hidden);
      } else if (racine.hidden) return;
      else if (k === "Escape") {
        const z = $(".carte-zone");
        if (z.innerHTML) z.innerHTML = "";
        else montrer(false);
      } else if (k === "-" || k === "PageUp") zoomer(-1);
      else if (k === "+" || k === "=" || k === "PageDown") zoomer(1);
      else if (k === "Enter") {
        const z = $(".carte-zone");
        if (z.innerHTML) carteA(z);
        else if (bulleSel) carte(derniere);
        else ARRIVEES.lancer();
      } else return;
      e.stopPropagation();
      e.preventDefault();
    }, true);
    (window.__pcvManette ||= {}).place = (b) => {
      if (b === 4) {
        if (racine.hidden && !/^\/routes\/library\/home/.test(O.location.pathname)) return false;
        window.__pcvSon?.("home");
        montrer(racine.hidden);
        return true;
      }
      if (racine.hidden) return false;
      const z = $(".carte-zone");
      if (b === 2) {
        window.__pcvSon?.("retour");
        if (z.innerHTML) z.innerHTML = "";
        else if (bulleSel) choisirBulle(false);
        else if (dockSel >= 0) dockChoisir(-1);
        else montrer(false);
        return true;
      }
      if (b === 5 || b === 6) {
        if (!z.innerHTML) vue.tenir(b);
        return true;
      }
      if (b === 7 || b === 8) {
        if (!z.innerHTML) {
          vue.tenir(b);
          pousserRoue(b === 8 ? 1 : -1);
        }
        return true;
      }
      if (b === 3) {
        if (!z.innerHTML) {
          if (dockSel >= 0) dockChoisir(-1);
          else {
            if (bulleSel) choisirBulle(false);
            dockChoisir(dockDernier);
          }
        }
        return true;
      }
      if (dockSel >= 0) {
        if (b === 9) dockChoisir(-1);
        else if (b === 1) ouvrir(boutonsDock[dockSel].dataset.action);
        else if (b === 11 || b === 12) {
          const i = dockSel + (b === 12 ? 1 : -1);
          if (i < 0 || i >= boutonsDock.length) window.__pcvSon?.("bord");
          else dockChoisir(i);
        }
        return true;
      }
      if (b >= 9 && b <= 12) {
        if (z.innerHTML) return true;
        if (b === 10 && bulleSel) choisirBulle(false);
        else if (b === 10 && !vue.gauche() && vue.y > 0 && Math.hypot(vue.x, vue.y) > 0.99) dockChoisir(dockDernier);
        else vue.tenir(b);
      } else if (b === 1) {
        if (z.innerHTML) carteA(z);
        else if (bulleSel) carte(derniere);
        else if (ARRIVEES.lancer()) {
        } else if (zoneBulles.firstChild?.classList.contains("vu")) choisirBulle(true);
      }
      return true;
    };
    window.__pcvPlaceSuivi = setInterval(() => {
      const accueil = /^\/routes\/library\/home/.test(O.location.pathname);
      if (!racine.hidden && !accueil) montrer(false);
      if (racine.hidden) bascule.hidden = false;
    }, 200);
    addEventListener("pcv-mii-base", relireSiens);
    let siensPrets = false, prechauffage = 0, preteConnexion = false, detruite = false;
    const preparerConnexion = () => {
      if (preteConnexion || detruite || !racine.hidden) return true;
      if (!siensPrets) return false;
      if (!prechauffage) prechauffage = requestIdleCallback(() => {
        prechauffage = 0;
        if (detruite || !racine.hidden) return;
        try {
          if (!rendu) {
            if (!preparer()) {
              preteConnexion = true;
              return;
            }
            decorTheme();
            Q ||= qualiteNeuve();
            construire();
            peupler();
            vue.reinitialiser();
            Object.assign(vue, DEPART);
            choisirFoule();
          }
          if (fabriquerUn() || !compilerPlace()) {
            preparerConnexion();
            return;
          }
          construire();
          preteConnexion = true;
          photosEnFond();
          if (window.__pcvNintendo?.pret) window.__pcvNintendo.pret.then(prechargerPlace);
          else prechargerPlace();
          window.__pcvMusiquePrete?.(REG.intro !== false ? "place-bienvenue" : musiqueVisite);
        } catch (e) {
          preteConnexion = true;
          console.warn("place3d : pr\xE9paration avant connexion interrompue", e);
        }
      }, { timeout: 1e3 });
      return false;
    };
    window.__pcvPlace = window.__pcvPlace3D = {
      preparerConnexion,
      liberer: () => {
        detruite = true;
        RARE.liberer();
        ARRIVEES.liberer();
        portail.liberer();
        cancelIdleCallback(prechauffage);
        arreterBoucle();
        masquerDessous(false);
        vue.activer(false);
        if (Q) {
          for (const q of [...Q.requetes, ...Q.libres]) Q.gl.deleteQuery(q);
        }
        Q = null;
        removeEventListener("resize", retailler);
        removeEventListener("pcv-mii-base", relireSiens);
        if (surApparence) {
          removeEventListener("pcv-apparence", surApparence);
          surApparence = null;
        }
        if (surTheme) {
          removeEventListener("pcv-theme", surTheme);
          surTheme = null;
        }
        for (const f of foule) oublier(f);
        foule = [];
        heros = [];
        troupe?.liberer();
        troupe = null;
        cancelIdleCallback(photosFond);
        photosFond = 0;
        for (const pg of pages) pg.cible.dispose();
        pages = [];
        PETITES.brouillon?.dispose();
        Object.assign(PETITES, { brouillon: null, pages: [], libres: [], n: 0 });
        if (rendu) {
          for (const ic of icones) for (const m of ic.verres) if (m !== ic.finitions[1].material) m.dispose();
          fondVerre?.dispose();
          carteRT?.dispose();
          for (const s of [scene, sceneVerre]) s?.traverse((o) => {
            o.geometry?.dispose?.();
            for (const m of [].concat(o.material || [])) {
              m.map?.dispose?.();
              m.dispose?.();
            }
          });
          rendu.dispose();
          rendu.forceContextLoss();
          rendu = null;
        }
      },
      heros: () => heros.map((h) => `${h.qui.nom || h.cle}/${h.qui.pantalon}/${h.etat}/${h.m.anim}/${h.m.action?.nom || "-"}/${h.m.cap.toFixed(1)}`),
      figer: (oui) => {
        fige = !!oui;
        return fige;
      },
      selection: (k) => {
        selectionner(k);
        return sel;
      },
      // essais : la tuile enfoncée, sans l'ouvrir            // essais : arrêter le temps pour une capture
      etat: () => ({
        ouvert: !racine.hidden,
        intro: temps < introFin,
        attente: attente && { ms: Math.round(performance.now() - attenteDepuis), manque: manque(), dessous, compilee },
        e: +(temps - debut).toFixed(2),
        icones: icones.map((i) => i.nom),
        iconesVues: icones.filter((i) => i.objet.visible && i.objet.parent).length,
        zoom: +vue.zoom.toFixed(3),
        ips: Q?.bilan?.ips ?? 0,
        palier: Q?.palier ?? 0,
        dock: dockSel,
        foule: foule.length,
        ecranMs: +ECRAN.riMin.toFixed(1),
        troupe: troupe?.info() ?? null,
        visibles: foule.filter((f) => f.actif && f.v?.objet.visible && !f.v.horsVue).length,
        vrais: foule.filter((f) => f.v).length,
        photos: foule.filter((f) => f.photo).length,
        enPhoto: foule.filter((f) => f.enPhoto).length,
        pagesPhotos: pages.length,
        refuses: foule.filter((f) => f.refuse).length,
        gpu: rendu ? { ...rendu.info.memory } : null,
        qualite: Q?.bilan ?? null,
        // géométries et textures vivantes : elles ne doivent pas grossir à force de zoomer
        pantalons: foule.reduce((o, f) => (o[f.qui.pantalon] = (o[f.qui.pantalon] || 0) + 1, o), {}),
        etats: foule.reduce((o, f) => (o[f.etat] = (o[f.etat] || 0) + 1, o), {}),
        // bulles par sorte (s succès, t temps de jeu, a succès d'ami, j ami en jeu), sans nom ; qui porte celle à l'écran ; amis fixés sous leur jeu
        bulles: [...bulles, ...bullesJoue()].map((b) => b.cle[0]).join(""),
        porteur: bulleMii ? bulleMii.qui.sid ? "ami" : bulleMii.qui.moi ? "moi" : "autre" : null,
        auteur: derniere ? derniere.sid ? "ami" : "moi" : null,
        fixes: foule.filter((f) => f.fixe != null).length,
        bulleSel,
        vue: [+(vue.x * RX).toFixed(2), +(vue.y * RZ).toFixed(2)],
        roue: +roue.a.toFixed(2),
        commandes: vue.compte
      }),
      habitants: () => foule.map((f) => ({ cle: f.cle, nom: f.qui.nom, pantalon: f.qui.pantalon, heros: f.heros, vrai: !!f.v, taille: +f.taille.toFixed(2), y: +f.m.objet.position.y.toFixed(3), etat: f.etat, rect: f.actif && f.v && !f.v.horsVue ? rectMembre(f) : null })),
      // (y : hauteur des pieds, 0 au sol ; rect : à l'écran, pour les essais au doigt)
      portailEcran: (s) => {
        const o = s ? portail.socle()?.[0] : portail.objet();
        if (!o) return null;
        const b = new T.Box3().setFromObject(o).getCenter(new T.Vector3());
        if (!s) b.y = 0.9;
        else b.y = 0.04;
        const p = ecran(b);
        return [Math.round(p[0]), Math.round(p[1])];
      },
      // essais : où toucher le portail
      visiteurRare: () => RARE.etat(),
      forcerVisiteur: (id) => RARE.forcer(id),
      oublierVisiteur: () => RARE.oublierForce(),
      // (14/11, démonstration, commande de développement sans bouton) un visiteur de l'accueil (id) arrive tout de suite : la
      // place se rouvre et il joue son arrivée ; rien n'est gardé (oublierVisiteur pour revenir au tirage du jour)
      portailEssai: (e) => {
        portailEssai = ["normal", "eteint", "detruit"].includes(e) ? e : null;
        portail.suivre();
        return etatPortail();
      },
      arrivee: async (id) => {
        if (!await RARE.forcer(id)) return false;
        try {
          localStorage.removeItem("pcv-portail-attente");
        } catch (e) {
        }
        window.__pcvPlaceMontrer?.(false);
        await new Promise((ok) => setTimeout(ok, 500));
        window.__pcvPlaceMontrer?.(true);
        return true;
      },
      portail,
      arrivees: ARRIVEES,
      // essais   // essais
      reglages: REG,
      choisirPoint,
      zoomer,
      finirIntro,
      sons: () => ({ prives: sonsPrives(), journal: journal.slice(-40), compte: { ...compte }, prets: Object.fromEntries(Object.entries(prets).map(([k, v]) => [k, v.length])) }),
      regler: (o) => {
        Object.assign(REG, o);
        try {
          localStorage.setItem("pcv-place3d", JSON.stringify(REG));
        } catch (e) {
        }
        return REG;
      },
      // foule : à la prochaine ouverture
      // ms par image (logique JS, dont la vie de la foule, les poses des vrais Mii et leurs os ; envoi du rendu) ; depuis le
      // dernier appel : vrais Mii créés (ms chacun)
      temps: () => {
        const moy = (x) => ({ n: x.n, ms: x.n ? +(x.ms / x.n).toFixed(1) : 0, max: +x.max.toFixed(1) });
        const r = {
          images: mesure.n,
          logique: +(mesure.logique / mesure.n).toFixed(2),
          rendu: +(mesure.rendu / mesure.n).toFixed(2),
          vie: +(mesure.vie / mesure.n).toFixed(2),
          os: +(mesure.os / mesure.n).toFixed(2),
          appels: rendu?.info.render.calls,
          triangles: rendu?.info.render.triangles,
          creer: moy(mesure.creer)
        };
        mesure.n = mesure.logique = mesure.rendu = mesure.vie = mesure.os = 0;
        mesure.creer = { n: 0, ms: 0, max: 0 };
        return r;
      }
    };
    montrer(false);
    window.__pcvNintendo?.pret?.then(prechargerPlace);
    RARE.charger();
    relireSiens().finally(() => {
      siensPrets = true;
      if (window.__pcvDemarrage?.enCours?.() && !window.__pcvDemarrage.connexionPassee()) preparerConnexion();
      if (ouverte && racine.hidden) montrer(true);
    });
    return "place 3D pr\xEAte (vrais Mii)";
  };
  if (window.__pcvMii3D?.vrais) return installer(window.__pcvMii3D);
  const jeton = window.__pcvPlace3DJeton = /* @__PURE__ */ Symbol("place3d");
  let installee = false;
  const une = (M) => {
    if (window.__pcvPlace3DJeton !== jeton || installee || !M) return;
    installee = true;
    clearTimeout(window.__pcvPlace3DAttente);
    removeEventListener("pcv-vrais-mii", surMoteur);
    installer(M);
  };
  const surMoteur = () => une(window.__pcvMii3D?.vrais && window.__pcvMii3D);
  addEventListener("pcv-vrais-mii", surMoteur);
  const essayer = (n) => V.charger().then(une, (e) => {
    if (window.__pcvPlace3DJeton !== jeton || installee) return;
    if (n < 80) window.__pcvPlace3DAttente = setTimeout(() => essayer(n + 1), 1500);
    else console.warn("place3d : pas de vrais Mii, la place 2D reste \u2014", e.message);
  });
  essayer(0);
  return "place3d : moteur des Mii en chargement (la place 2D sert en attendant)";
})();
