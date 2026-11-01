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
    const lireJeux = () => (O.appStore?.allApps || []).filter((a) => JOUABLE.has(a.app_type) && a.rt_last_time_played).sort((a, b) => b.rt_last_time_played - a.rt_last_time_played).slice(0, 7);
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
        background: var(--pcv-verre); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 -3px 0 var(--pcv-reflet-bas), 0 ${u(6)} ${u(14)} rgb(from var(--pcv-ombre-c) r g b / .18); }
      
      #pcv-place .dock-btn svg { transform: translateY(var(--pcv-biseau-dy)); }
      
      #pcv-place .dock-btn { transition: transform .12s, box-shadow .12s; } #pcv-place .dock-btn.choisi { transform: scale(1.08); box-shadow: var(--pcv-curseur); }
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
    fantome.innerHTML = `<style>
      .bulle-p { pointer-events: auto; }
      .bulle-p { position: absolute; left: 0; top: 0; cursor: pointer; opacity: 0; transform-origin: ${u(46)} 100%; transition: opacity .3s; z-index: 2; }
      .bulle-p.vu { opacity: 1; animation: pcvBulle3 .35s cubic-bezier(.3,1.6,.5,1); }
      @keyframes pcvBulle3 { from { scale: .6 } to { scale: 1 } }
      .bulle-p .qui { position: absolute; left: ${u(18)}; top: ${u(-20)}; padding: ${u(3)} ${u(12)}; border-radius: ${u(12)}; background: var(--pcv-bulle); color: var(--pcv-sur-accent); font-size: ${u(12)}; font-weight: 900; letter-spacing: .05em; z-index: 1; }
      .bulle-p .corps { position: relative; display: flex; align-items: center; gap: ${u(12)}; padding: ${u(12)} ${u(18)} ${u(12)} ${u(12)}; border-radius: ${u(24)};
        background: linear-gradient(180deg, var(--pcv-carte), var(--pcv-creux)); box-shadow: var(--pcv-reflet), 0 ${u(10)} ${u(24)} rgba(70,95,130,.22); font-size: ${u(16)}; font-weight: 800; max-width: ${u(300)}; line-height: 1.25; overflow-wrap: anywhere; }
      .bulle-p .corps::after { content: ""; position: absolute; left: ${u(36)}; bottom: ${u(-9)}; width: ${u(18)}; height: ${u(18)}; background: var(--pcv-creux); transform: rotate(45deg); border-radius: 3px; }
      
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
    const brumeMonde = (s) => {
      s.vertexShader = s.vertexShader.replace(
        "#include <fog_vertex>",
        `#ifdef USE_FOG
vFogDepth = ${BRUME_Z.toFixed(3)} - (cameraPosition + transpose(mat3(viewMatrix)) * mvPosition.xyz).z;
#endif`
      );
    };
    const auMonde = (m) => {
      m.onBeforeCompile = brumeMonde;
      return m;
    };
    const brumeNeutre = (s) => {
      brumeMonde(s);
      s.fragmentShader = s.fragmentShader.replace(
        "#include <fog_fragment>",
        "#ifdef USE_FOG\ngl_FragColor = mix(gl_FragColor, vec4(1.0), smoothstep(fogNear, fogFar, vFogDepth));\n#endif"
      );
    };
    let rendu = null, scene = null, cam = null, sol = null, ombres = null, troupe = null, rayon = new T.Raycaster();
    let solBase = new T.Color(16777215), apparenceSol = "clair";
    const teindreSol = () => {
      if (!sol) return;
      sol.material.color.copy(solBase).multiplyScalar(sol.material.map === motifSol || apparenceSol === "clair" ? 1 : apparenceSol === "noir" ? 0.22 : 0.42);
      nuance.visible = sol.material.map === motifSol;
      lumiereSale = true;
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
    const DECOR_TUILE = 8;
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
    const SOL = { pcvTe: { value: [0, 1, 2, 3, 4, 5].map(() => new T.Vector3()) }, pcvTeN: { value: 6 }, pcvJ: { value: new T.Vector3() }, pcvBruit: { value: bruitSol } };
    const SOL_GLSL = [`
uniform vec3 pcvTe[6]; uniform float pcvTeN; uniform vec3 pcvJ; uniform sampler2D pcvBruit;
vec4 pcvH4(vec2 c){ return texelFetch(pcvBruit, ivec2(c) & ${DALLES.bruit - 1}, 0); }
vec2 pcvH2(vec2 c){ return pcvH4(c).xy; }
float pcvN(vec2 p){ return texture(pcvBruit, (p + .5) / ${DALLES.bruit.toFixed(1)}).w; }
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
  diffuseColor.rgb *= pow(clamp(mix(pcvJ, col * s, e * jx), 0., 1.), vec3(2.2)); }
`];
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
    const decorTheme = () => {
      const T_ = window.__pcvThemes, tele = T_?.teleActuel?.() || null, manette = tele ? null : T_?.manetteActuel?.() || null;
      const url = tele || manette;
      if (url === decorUrl || !sol) return;
      decorUrl = url;
      const m = sol.material;
      if (m.map !== motifSol) m.map?.dispose();
      m.map = motifSol;
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
        brumeTheme = new T.Color().setRGB(r / 64 / 255, g / 64 / 255, b / 64 / 255, T.SRGBColorSpace).lerp(new T.Color(1, 1, 1), DECOR.brume);
        teinter();
        if (T_.teleMotif?.()) {
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
      carteRT = new T.WebGLRenderTarget(LUEUR.carte, LUEUR.carte, { depthBuffer: false });
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
        if (mat.map !== motifSol) return;
        Object.assign(sh.uniforms, SOL);
        sh.fragmentShader = sh.fragmentShader.replace("void main() {", SOL_GLSL[0] + "void main() {").replace("#include <map_fragment>", SOL_GLSL[1]);
      };
      mat.customProgramCacheKey = () => mat.map === motifSol ? "dalles" : "decor";
      const m = new T.Mesh(g, mat);
      m.rotation.x = -Math.PI / 2;
      m.add(nuance);
      return m;
    };
    const LUEUR = { sol: [7.5, 5, 0.4], clair: [5.5, 3.6, 0.5], lanterne: [3.6, 0.6, 16758880], liser\u00E9: { couleur: 0.25, emission: 1 }, max: 32, carte: 256, mii: 0.4 };
    const lueurTex = toileTexte(64, 64, (x) => {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      for (const t of [0, 0.2, 0.4, 0.6, 0.8, 1]) g.addColorStop(t, `rgba(255,255,255,${(1 - lisse(t)) ** 2})`);
      x.fillStyle = g;
      x.fillRect(0, 0, 64, 64);
    });
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
      troupe?.lumieres?.(A.gain && sol?.material.map === motifSol ? icones.map((ic) => ic.lum) : []);
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
      if (lanternes?.visible) {
        const [t, f, coul] = LUEUR.lanterne;
        c2.set(coul).multiplyScalar(clair ? 1 : f * A.gain / haut);
        for (const l of lanternes.children) if (l.isSprite && n < LUEUR.max) {
          lueurs.setMatrixAt(n, lueurM.makeScale(t, 1, t).setPosition(l.position.x, 0, l.position.z));
          lueurs.setColorAt(n++, c2);
        }
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
      return g;
    };
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
      const nom = { medias: "album", reglages: "parametres" }[ic.appli] || ic.appli;
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
      const fond = teinte("--pcv-pastille").css, texte2 = teinte("--pcv-texte2").css;
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
        } else {
          x.fillStyle = fond;
          x.fillRect(0, 0, 256, 256);
          if (im) x.drawImage(im, 44, 44, 168, 168);
        }
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
      else essayer2(["data:image/svg+xml," + encodeURIComponent(svg(ic.appli, 168, ic.couleur, 2.6).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '))]);
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
    const spotpass = () => (window.__pcvSpotPass?.mii?.() || []).map((m) => ({
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
      return l.slice(0, voulu).map((h) => ({ ...h, sig: signature(h) }));
    };
    const membre = (h) => {
      const m = M.pantin({ nom: h.nom });
      m.objet.visible = false;
      return { cle: h.cle, qui: h, m, v: null, taille: 1, g: tirerGroupe(), etat: "dehors", t: 0, dt: 0, actif: true, distance: 0, but: null, heros: false, refuse: false };
    };
    const oublier = (f) => {
      f.m.liberer();
      if (f.v) {
        troupe?.retirer(f.v);
        f.v.liberer();
        f.v = null;
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
      foule = nouvelle;
      foule.forEach((f, i) => {
        f.rang = i;
        f.heros = i < N_HEROS;
      });
      heros = foule.slice(0, N_HEROS);
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
      if (!troupe.ajouter(r)) scene.add(r.objet);
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
    const placeLibre = (g, ecart2 = 0.5) => {
      const ic = icones[g], n = foule.filter((f) => f.g === g).length;
      for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2, r = alea(0.45, 1.5 + 0.2 * Math.sqrt(n)), p = ic.groupe.clone().add(new T.Vector3(Math.cos(a) * r * 1.25, 0, Math.sin(a) * r * 0.85));
        if (foule.every((f) => !f.but || f.but.distanceToSquared(p) > ecart2 * ecart2)) return p;
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
      } else if (x < 0.7) {
        f.etat = "geste";
        f.t = alea(1.4, 2.4);
        pivoter(f, alea(-0.4, 0.4), ["saluer", "applaudir", "content", "danser", "hausser"][Math.floor(Math.random() * 5)]);
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
    const manque = () => froid && foule.some((f) => (f.heros || f.actif) && !f.v && !f.refuse);
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
      musiqueVisite = neuf ? "place-visiteur" : n % 2 ? "place" : "place-2";
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
        ic.ombre.visible = true;
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
        g.visible = ic.ombre.visible = q > 0;
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
      vue.avancer(dt, !intro && dockSel < 0 && !$(".carte-zone").innerHTML && !window.__pcvSteamDessus?.(250) && !document.body.classList.contains("pcv-barre-main"));
      const z = vue.zoom, el = ELEV - Math.log(z) * 0.12 - Math.max(0, Math.log(z / ZOOM.proche)) * ZOOM.baisse, d = D0 / z;
      butVise.set(CENTRE.x + vue.x * RX, 0.6, CENTRE.z + vue.y * RZ);
      butPos.set(butVise.x, butVise.y + Math.sin(el) * d, butVise.z + Math.cos(el) * d);
      if (intro) {
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
      if (bulleT <= 0) {
        bulleT = BULLE.vue + alea(...BULLE.silence);
        if (!sac.length) {
          majAmis();
          const l = [...bulles, ...bullesJoue()];
          sac = l.filter((x2) => x2.cle !== derniere?.cle || l.length === 1).sort(() => Math.random() - 0.5);
        }
        let b;
        do
          b = sac.pop();
        while (b?.cle.startsWith("j:") && !bullesJoue().some((x2) => x2.cle === b.cle));
        const auteur = b && foule.find((f) => b.sid ? f.qui.sid === b.sid : f.qui.moi);
        if (!b || b.sid && !libre(auteur)) return;
        derniere = b;
        const g = icones.findIndex((i) => i.jeu?.appid === b.jeu.appid);
        const groupe = foule.filter((f) => f.actif && f.g === g && f.m.objet.visible && (f.etat === "pause" || f.etat === "geste")), choix = libre(auteur) ? auteur : groupe[Math.floor(Math.random() * groupe.length)] || foule.find((f) => f.actif && f.m.objet.visible && f.etat !== "intro");
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
        zoneBulles.innerHTML = `<div class="bulle-p"><span class="qui">${echap((b.qui || pseudo() || Tr("place.moi")).toUpperCase())}</span><div class="corps">${b.drapeau ? `<b class="drapeau">${echap(b.drapeau)}</b>` : b.img || avatarBulle(b) ? `<img ${b.img || b.sid ? "" : "data-pcv-avatar "}src="${urlSure(b.img || avatarBulle(b))}" alt="">` : ""}<span></span></div></div>`;
        zoneBulles.querySelector(".corps span").textContent = b.txt;
        if (bulleSel) choisirBulle(false);
        const el2 = zoneBulles.firstChild;
        el2.onclick = (e) => {
          e.stopPropagation();
          carte(b);
        };
        requestAnimationFrame(() => el2.classList.add("vu"));
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
          el2.classList.remove("vu");
          if (bulleSel) choisirBulle(false);
          if (bulleMii?.etat === "porteParole") {
            bulleMii.etat = "pause";
            bulleMii.t = 1;
            bulleMii.m.jouer("repos");
          }
        }, BULLE.vue * 1e3);
      }
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
    const projection = new T.Vector3(), pointEcran = [0, 0, 0];
    const ecran = (v) => {
      projection.copy(v).project(cam);
      pointEcran[0] = (projection.x + 1) / 2 * innerWidth;
      pointEcran[1] = (1 - projection.y) / 2 * innerHeight;
      pointEcran[2] = projection.z;
      return pointEcran;
    };
    const rectMembre = (f) => {
      if (f.v) return f.v.rectEcran(cam, innerWidth, innerHeight);
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
      if (REG.plafond && t - dernier + Math.min(brut, ECRAN.riMin) / 2 < 1e3 / REG.plafond) return;
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
        if (!bout && !compilee) {
          finitions({ finitions: true, lentille: false }, true);
          rendu.compile(scene, cam);
          rendu.compile(sceneVerre, cam);
          finitions({ finitions: true, lentille: true }, true);
          rendu.compile(sceneVerre, cam);
          finitions(PALIERS[Q?.palier || 0]);
          compilee = 1;
          return;
        }
        if (!bout && compilee === 1) {
          cam.position.copy(grosPos);
          cam.lookAt(grosVise);
          troupe.maj();
          rendu.render(scene, cam);
          compilee = 2;
          return;
        }
        attente = false;
        lancerIntro(REG.intro !== false);
        return;
      }
      const fabrique = occupe;
      mesurerEcran(brut, fabrique);
      occupe = false;
      if (brut > 0 && !fabrique) riMoy = riMoy ? riMoy + (Math.min(250, brut) - riMoy) * 0.1 : brut;
      const intro = majIntro();
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
          if (v && !horsVue) {
            v.vitesse = p.vitesse;
            v.suivre(p, pasDt);
          }
        }
        if (v) {
          v.horsVue = horsVue;
          v.objet.visible = !horsVue;
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
      const tb = performance.now(), qg = gpuDebut();
      troupe.maj();
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
    const priorite = (f) => f.heros || f === bulleMii ? -2 : f.qui.moi ? -1 : (f.refuse ? 2e9 : f.v ? 0 : 1e9) + f.distance * (f.actif ? 0.85 : 1);
    const comparerFoule = (a, b) => priorite(a) - priorite(b) || a.rang - b.rang;
    const choisirFoule = () => {
      if (temps < prochaineFoule) return;
      prochaineFoule = temps + 0.5;
      const palier = PALIERS[Q?.palier || 0], max = Math.max(N_HEROS, Math.ceil(foule.length * palier.foule));
      for (const f of foule) f.distance = cam.position.distanceToSquared(f.m.objet.position);
      ordreFoule.sort(comparerFoule);
      for (let i = 0; i < ordreFoule.length; i++) {
        const f = ordreFoule[i];
        garder(f, i < max || f === bulleMii);
      }
      for (const ic of icones) ic.ombre.visible = palier.ombres && ic.objet.visible;
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
      const l = palier.finitions && (tout || !!pierre().lanternes);
      if (lanternes && lanternes.visible !== l) {
        lanternes.visible = l;
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
      const l = ouverte2 ? [[1, fiche ? fiche.textContent : Tr("dispo.fermer")], [2, Tr("dispo.fermer")]] : bulleSel ? [[1, Tr("place.lire")], [2, Tr("place.retour")]] : dockSel >= 0 ? [[1, Tr("place.ouvrir")], [2, Tr("place.retour")]] : [[3, Tr("place.raccourcis")], [[7, 8], Tr("place.tourner")]];
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
      if (racine.hidden || temps < introFin) return false;
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
      if (temps < introFin) return finirIntro();
      if (choisirPoint(e.clientX, e.clientY)) return;
      for (const f of foule) {
        if (!f.actif || f.v?.horsVue || !f.m.objet.visible || !pret(f)) continue;
        const b = rectMembre(f);
        if (e.clientX > b.x0 && e.clientX < b.x1 && e.clientY > b.y0 && e.clientY < b.y1) {
          f.etat = "geste";
          f.t = 2.2;
          f.pivot = null;
          f.vit = 0;
          f.m.capVise = capVers(f, cam.position);
          hop(f);
          f.m.sauterVers(f.m.objet.position.clone().setY(0), { hauteur: 0.6, ensuite: "saluer" }).catch(() => {
          });
          break;
        }
      }
    });
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
    const montrer = (oui) => {
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
        Q.tp = Q.t0 = 0;
        Q.grace = performance.now() + QUALITE.grace;
        Q.gpuMs = Q.gpuN = Q.ms = Q.n = Q.cpuMs = Q.images = Q.pire = Q.lentes = Q.fluides = 0;
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
        selectionner(-1);
        construire();
        if (!teintesVues) {
          teinter();
          teintesVues = true;
        }
        peupler();
        majAmis();
        vue.reinitialiser();
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
      } else if (temps < introFin && ["ArrowLeft", "ArrowRight", "Enter", "-", "+", "="].includes(k)) finirIntro();
      else if (k === "-" || k === "PageUp") zoomer(-1);
      else if (k === "+" || k === "=" || k === "PageDown") zoomer(1);
      else if (k === "Enter") {
        const z = $(".carte-zone");
        if (z.innerHTML) carteA(z);
        else if (bulleSel) carte(derniere);
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
      if (temps < introFin) {
        finirIntro();
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
        else if (zoneBulles.firstChild?.classList.contains("vu")) choisirBulle(true);
      }
      return true;
    };
    window.__pcvPlaceSuivi = setInterval(() => {
      const accueil = /^\/routes\/library\/home/.test(O.location.pathname);
      if (!racine.hidden && !accueil) montrer(false);
      if (racine.hidden) bascule.hidden = false;
    }, 200);
    addEventListener("pcv-mii-base", relireSiens);
    window.__pcvPlace = window.__pcvPlace3D = {
      liberer: () => {
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
    relireSiens().finally(() => {
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
