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
    const ouverte = document.getElementById("pcv-place")?.hidden === false;
    document.getElementById("pcv-place")?.remove();
    document.getElementById("pcv-bascule")?.remove();
    if (window.__pcvToucheY) window.removeEventListener("keydown", window.__pcvToucheY, true);
    clearInterval(window.__pcvPlaceSuivi);
    clearInterval(window.__pcvPlaceHeure);
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
    const REG = Object.assign({ foule: 60, proches: 200, plafond: 0, intro: true, bruits: true }, lire("pcv-place3d", {}));
    if (REG.proches === 14) REG.proches = 200;
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
    const avatarDe = () => document.querySelector("#header_profile img")?.src || (() => {
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
    const APPS = [["amis", "#2fbf71", "amis", Tr("spaces.amis.nom")], ["boutique", "#ff8a1f", "magasin", Tr("spaces.boutique.nom")], ["medias", "#2a8cff", "medias", Tr("place.mediatheque")], ["reglages", "#8b9098", "parametres", Tr("spaces.parametres.nom")]];
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
    const dock = [
      ["amis", "#2fbf71", "amis", Tr("spaces.amis.nom")],
      ["boutique", "#ff8a1f", "magasin", Tr("spaces.boutique.nom")],
      ["globe", "#2a6fe0", "magasin", Tr("place.internet")],
      ["bulle", "#19b8d6", "amis", Tr("place.discussions")],
      ["medias", "#2a8cff", "medias", Tr("place.mediatheque")],
      ["telech", "#8a63ff", "telechargements", Tr("barre.telechargements")],
      ["reglages", "#8b9098", "parametres", Tr("spaces.parametres.nom")]
    ].map(([n, c, a, t]) => `<button class="dock-btn" data-action="${a}" data-pcv-nom="${t}">${svg(n, "56%", c, 2.3)}</button>`).join("");
    const [gl, glc] = toucheHaut();
    const racine = document.createElement("div");
    racine.id = "pcv-place";
    racine.hidden = true;
    racine.innerHTML = `<style>
      #pcv-place { position: fixed; inset: 0; z-index: 9200; overflow: hidden; font-family: var(--pcv-police); color: var(--pcv-texte); background: var(--pcv-creux, #eef2f1); }
      #pcv-place[hidden] { display: none; }
      #pcv-place button { all: unset; cursor: pointer; box-sizing: border-box; }
      #pcv-place canvas.monde3d { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
      #pcv-place .blanc { position: absolute; inset: 0; background: #fbfcfb; opacity: 0; pointer-events: none; z-index: 7; transition: opacity .6s ease-out; }
      #pcv-place .blanc.on { opacity: 1; transition: none; }
      
      #pcv-place .attente { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: ${u(22)};
        color: #8a96a6; font-size: ${u(18)}; font-weight: 900; opacity: 0; transition: opacity .25s; }
      #pcv-place .blanc.attend .attente { opacity: 1; transition: opacity .3s .25s; }
      #pcv-place .attente .roue { position: relative; width: ${u(64)}; height: ${u(64)}; }
      #pcv-place .attente .roue i { position: absolute; left: 50%; top: 50%; width: ${u(12)}; height: ${u(12)}; margin: ${u(-6)}; border-radius: 50%; background: #2fb8ff;
        transform: rotate(calc(var(--k) * 45deg)) translateY(${u(-26)}); opacity: .18; animation: pcvRouePlace .96s linear infinite; animation-delay: calc(var(--k) * .12s - .96s); }
      #pcv-place .attente span { opacity: 0; transition: opacity .4s 1.2s; }
      #pcv-place .blanc.attend .attente span { opacity: 1; }
      @keyframes pcvRouePlace { 0% { opacity: 1; } 70%, 100% { opacity: .18; } }
      #pcv-place .nom-sel { position: absolute; left: 0; top: 0; padding: ${u(5)} ${u(14)}; border-radius: ${u(14)}; background: var(--pcv-bulle); color: var(--pcv-sur-accent); font-size: ${u(15)}; font-weight: 900;
        white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity .15s; z-index: 3; }
      #pcv-place .nom-sel.vu { opacity: 1; }
      #pcv-place .nom-sel::before { content: ""; position: absolute; left: 50%; top: ${u(-6)}; margin-left: ${u(-6)}; border: ${u(6)} solid transparent; border-top: 0; border-bottom-color: var(--pcv-bulle); }
      #pcv-place .bulle-p { position: absolute; left: 0; top: 0; cursor: pointer; opacity: 0; transform-origin: ${u(46)} 100%; transition: opacity .3s; z-index: 2; }
      #pcv-place .bulle-p.vu { opacity: 1; animation: pcvBulle3 .35s cubic-bezier(.3,1.6,.5,1); }
      @keyframes pcvBulle3 { from { scale: .6 } to { scale: 1 } }
      #pcv-place .bulle-p .qui { position: absolute; left: ${u(18)}; top: ${u(-20)}; padding: ${u(3)} ${u(12)}; border-radius: ${u(12)}; background: var(--pcv-bulle); color: var(--pcv-sur-accent); font-size: ${u(12)}; font-weight: 900; letter-spacing: .05em; }
      #pcv-place .bulle-p .corps { position: relative; display: flex; align-items: center; gap: ${u(12)}; padding: ${u(12)} ${u(18)} ${u(12)} ${u(12)}; border-radius: ${u(24)};
        background: linear-gradient(180deg, var(--pcv-carte), var(--pcv-creux)); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 ${u(10)} ${u(24)} rgba(70,95,130,.22); font-size: ${u(16)}; font-weight: 800; max-width: ${u(300)}; line-height: 1.25; }
      #pcv-place .bulle-p .corps::after { content: ""; position: absolute; left: ${u(36)}; bottom: ${u(-9)}; width: ${u(18)}; height: ${u(18)}; background: var(--pcv-creux); transform: rotate(45deg); border-radius: 3px; }
      #pcv-place .bulle-p img { width: ${u(44)}; height: ${u(44)}; border-radius: ${u(12)}; box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere); object-fit: cover; }
      #pcv-place .v { position: absolute; background: linear-gradient(180deg,var(--pcv-carte),var(--pcv-creux)); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 0 0 1px var(--pcv-bord), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); z-index: 4; }
      #pcv-place .haut-avatar { left: ${u(24)}; top: ${u(20)}; width: ${u(56)}; height: ${u(56)}; border-radius: 50%; padding: ${u(6)}; }
      #pcv-place .haut-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
      #pcv-place .retour { left: 50%; top: ${u(20)}; transform: translateX(-50%); height: ${u(52)}; border-radius: ${u(26)}; padding: 0 ${u(10)} 0 ${u(6)}; display: flex; align-items: center; gap: ${u(12)}; font-weight: 900; font-size: ${u(17)}; }
      #pcv-place .retour .p { width: ${u(40)}; height: ${u(40)}; border-radius: 50%; background: var(--pcv-carte); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); }
      #pcv-place .gl { width: ${u(30)}; height: ${u(30)}; border-radius: 50%; background: var(--pcv-carte); display: flex; align-items: center; justify-content: center; font-size: ${u(15)}; box-shadow: inset 0 -2px 0 rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.15); }
      #pcv-place .etat { right: ${u(24)}; top: ${u(20)}; height: ${u(52)}; border-radius: ${u(26)}; padding: 0 ${u(20)}; display: flex; align-items: center; gap: ${u(14)}; font-weight: 900; font-size: ${u(16)}; }
      #pcv-place .zoom { left: ${u(24)}; bottom: ${u(22)}; display: flex; align-items: center; gap: ${u(10)}; padding: ${u(8)} ${u(12)}; border-radius: ${u(26)}; }
      #pcv-place .zoom button { width: ${u(38)}; height: ${u(38)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${u(22)}; font-weight: 900; color: var(--pcv-texte2);
        background: linear-gradient(180deg,var(--pcv-carte),var(--pcv-creux)); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 2px 6px rgb(from var(--pcv-ombre-c) r g b / .18); }
      #pcv-place .zoom .pt { width: ${u(12)}; height: ${u(12)}; border-radius: 50%; background: var(--pcv-creux); transition: background .2s, box-shadow .2s; }
      #pcv-place .zoom .pt.on { background: var(--pcv-cyan-plein); box-shadow: 0 0 0 ${u(3)} color-mix(in srgb, var(--pcv-cyan-plein) 25%, transparent); }
      #pcv-place .dock { left: 50%; transform: translateX(-50%); bottom: ${u(20)}; padding: ${u(10)} ${u(14)}; border-radius: ${u(28)}; display: flex; gap: ${u(12)}; background: color-mix(in srgb, var(--pcv-carte) 65%, transparent); backdrop-filter: blur(12px); }
      #pcv-place .dock-btn { width: ${u(60)}; height: ${u(60)}; border-radius: ${u(18)}; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(180deg, var(--pcv-carte), var(--pcv-creux)); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 -3px 0 rgba(150,170,195,.3), 0 ${u(6)} ${u(14)} rgba(70,95,130,.18); }
      
      #pcv-place .dock-btn svg { transform: translateY(var(--pcv-biseau-dy)); }
      #pcv-place .voile { position: absolute; inset: 0; background: var(--pcv-voile); backdrop-filter: blur(3px); z-index: 8; }
      #pcv-place .carte { left: 50%; top: 50%; transform: translate(-50%,-50%); width: ${u(640)}; border-radius: ${u(34)}; padding: ${u(26)} ${u(28)}; box-sizing: border-box; z-index: 9; display: flex; flex-direction: column; gap: ${u(18)}; }
      #pcv-place .carte .msg { border-radius: ${u(24)}; padding: ${u(16)}; display: flex; align-items: center; gap: ${u(16)}; font-size: ${u(20)}; font-weight: 800; line-height: 1.3; }
      #pcv-place .carte .msg img { width: ${u(76)}; height: ${u(76)}; border-radius: ${u(18)}; box-shadow: 0 0 0 ${u(4)} var(--pcv-lisere), 0 4px 10px rgba(0,0,0,.15); object-fit: cover; }
      #pcv-place .carte .actions { display: flex; gap: ${u(12)}; }
      #pcv-place .carte .actions button { flex: 1; text-align: center; padding: ${u(14)} 0; border-radius: ${u(24)}; font-size: ${u(17)}; font-weight: 900;
        background: linear-gradient(180deg,var(--pcv-carte),var(--pcv-creux)); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 ${u(4)} ${u(12)} rgb(from var(--pcv-ombre-c) r g b / .15); }
      #pcv-place .carte .actions button.cyan { background: var(--pcv-cyan); color: var(--pcv-sur-accent);
        box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 ${u(8)} ${u(20)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
      #pcv-bascule { all: unset; position: fixed; z-index: 9050; top: ${u(20)}; left: ${u(222)}; width: ${u(56)}; height: ${u(56)}; border-radius: 50%; cursor: pointer;
        display: flex; align-items: center; justify-content: center; background: var(--pcv-verre);
        box-shadow: var(--pcv-reflet), var(--pcv-ombre); }   
      #pcv-bascule i { width: ${u(40)}; height: ${u(40)}; border-radius: 50%; background: var(--pcv-pastille, #fff); box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); display: flex; align-items: center; justify-content: center; }
      #pcv-bascule[hidden] { display: none; }
    </style>
    <canvas class="monde3d"></canvas><div class="bulles"></div><div class="nom-sel"></div>
    <div class="v haut-avatar"><img data-pcv-avatar src="" alt=""></div>
    <button class="v retour" data-pcv-nom="${Tr("place.revenir_accueil")}"><span class="p">${svg("accueil", "55%", "#1a9ae6")}</span>${Tr("spaces.accueil.nom")}<span class="gl" style="background:${glc};color:var(--pcv-sur-accent)">${gl}</span></button>
    <div class="v etat"><svg style="width:${u(20)};height:${u(20)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2.5 8.5a14 14 0 0 1 19 0"/><path d="M5.5 12a9.5 9.5 0 0 1 13 0"/><path d="M8.7 15.4a5 5 0 0 1 6.6 0"/><circle cx="12" cy="19" r="1"/></svg><span class="heure"></span></div>
    <div class="v zoom"><button class="moins" data-pcv-nom="${Tr("place.eloigner")}">\u2212</button><i class="pt"></i><i class="pt"></i><i class="pt"></i><i class="pt"></i><button class="plus" data-pcv-nom="${Tr("place.rapprocher")}">+</button></div>
    <div class="v dock">${dock}</div>
    <div class="carte-zone"></div><div class="blanc"><div class="attente"><div class="roue">${Array.from({ length: 8 }, (_, k) => `<i style="--k:${k}"></i>`).join("")}</div><span>${Tr("place.prepare")}</span></div></div>`;
    document.body.appendChild(racine);
    const bascule = document.createElement("button");
    bascule.id = "pcv-bascule";
    bascule.dataset.pcvNom = Tr("spaces.place.nom");
    bascule.setAttribute("aria-label", Tr("spaces.place.nom"));
    bascule.innerHTML = "<i></i>";
    document.body.appendChild(bascule);
    const $ = (s) => racine.querySelector(s), toile = $("canvas.monde3d"), blanc = $(".blanc"), nomSel = $(".nom-sel"), pts = [...racine.querySelectorAll(".zoom .pt")];
    const RX = 12.5, RZ = 7.2, ZOOMS = [1, 1.5, 2.2, 3.2], D0 = 36, ELEV = 0.74;
    let rendu = null, scene = null, cam = null, sol = null, ombres = null, halo = null, rayon = new T.Raycaster();
    let solBase = new T.Color(16777215), apparenceSol = "clair";
    const teindreSol = () => {
      if (sol) sol.material.color.copy(solBase).multiplyScalar(apparenceSol === "noir" ? 0.22 : apparenceSol === "gris" ? 0.42 : 1);
    };
    let fige = false, icones = [], foule = [], heros = [], cle = "", sel = 0, zoom = 0, debut = 0, introFin = 0, raf = 0, dernier = 0, temps = 0;
    const qDebout = new T.Quaternion(), eDebout = new T.Euler(), camPos = new T.Vector3(), camVise = new T.Vector3(), butPos = new T.Vector3(), butVise = new T.Vector3();
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
    let decorUrl = null, motifSol = null;
    const decorTheme = () => {
      const T_ = window.__pcvThemes, tele = T_?.teleActuel?.() || null, manette = tele ? null : T_?.manetteActuel?.() || null;
      const url = tele || manette;
      if (url === decorUrl || !sol) return;
      decorUrl = url;
      const m = sol.material;
      motifSol ||= m.map;
      m.map = motifSol;
      solBase.set(16777215);
      teindreSol();
      m.needsUpdate = true;
      scene.background = null;
      if (!url) return;
      new T.TextureLoader().load(url, (tx) => {
        if (decorUrl !== url) return;
        tx.colorSpace = T.SRGBColorSpace;
        const fond = tx.clone();
        fond.needsUpdate = true;
        scene.background = fond;
        if (tele) {
          tx.wrapS = tx.wrapT = T.RepeatWrapping;
          tx.repeat.set(140 / DECOR_TUILE, 140 / DECOR_TUILE);
          tx.anisotropy = 8;
          m.map = tx;
          m.needsUpdate = true;
          return;
        }
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
        solBase.setRGB(r / 64 / 255, g / 64 / 255, b / 64 / 255, T.SRGBColorSpace);
        teindreSol();
      });
    };
    const sol3d = () => {
      const motif = toileTexte(256, 222, (x, w, h) => {
        x.fillStyle = "#f6f8f7";
        x.fillRect(0, 0, w, h);
        x.strokeStyle = "rgba(150,168,160,.13)";
        x.lineWidth = 2.5;
        const r = 37;
        for (const [cx, cy] of [[0, 0], [w, 0], [w / 2, h / 2], [0, h], [w, h]]) {
          x.beginPath();
          for (let k = 0; k <= 6; k++) {
            const a = k * Math.PI / 3;
            x.lineTo(cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r);
          }
          x.stroke();
        }
      });
      motif.wrapS = motif.wrapT = T.RepeatWrapping;
      motif.repeat.set(44, 44);
      motif.anisotropy = 8;
      const g = new T.CircleGeometry(70, 64);
      const c = [];
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const d = Math.hypot(p.getX(i), p.getY(i)), k = 1 - 0.1 * lisse((d - 6) / 26);
        const col = new T.Color(k, k, k * 1.005);
        c.push(col.r, col.g, col.b);
      }
      g.setAttribute("color", new T.Float32BufferAttribute(c, 3));
      const m = new T.Mesh(g, new T.MeshLambertMaterial({ map: motif, vertexColors: true }));
      m.rotation.x = -Math.PI / 2;
      return m;
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
    let geoCadre = null, geoImage = null, geoHalo = null, matCadre = null;
    const couches = (s) => window.__pcvCouches.couches(s), pct = (t) => window.__pcvCouches.pct(t);
    const tailleWH = (taille, iw, ih, w, h) => window.__pcvCouches.taille(taille, iw, ih, w, h);
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
      };
      urls.forEach((u2, i) => {
        if (!u2) return;
        const im = new Image();
        im.crossOrigin = u2.startsWith("https://shared") ? "anonymous" : null;
        im.onload = () => {
          chargees[i] = im;
          fini();
        };
        im.onerror = fini;
        im.src = u2;
      });
    };
    const imageIcone = (ic) => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const x = c.getContext("2d"), t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      t.anisotropy = 4;
      const peindre = (im) => {
        x.clearRect(0, 0, 256, 256);
        x.save();
        x.beginPath();
        x.roundRect(0, 0, 256, 256, 46);
        x.clip();
        if (ic.jeu) {
          x.fillStyle = "#dfe6ee";
          x.fillRect(0, 0, 256, 256);
          if (im) {
            const s = Math.max(256 / im.width, 256 / im.height);
            x.drawImage(im, (256 - im.width * s) / 2, -(im.height * s - 256) * 0.15, im.width * s, im.height * s);
          } else {
            x.fillStyle = "#5b6676";
            x.font = "900 26px Nunito, sans-serif";
            x.textAlign = "center";
            x.fillText(ic.nom.slice(0, 16), 128, 136);
          }
        } else {
          x.fillStyle = "#fff";
          x.fillRect(0, 0, 256, 256);
          if (im) x.drawImage(im, 64, 64, 128, 128);
        }
        const g = x.createLinearGradient(0, 0, 0, 140);
        g.addColorStop(0, "rgba(255,255,255,.5)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = g;
        x.fillRect(0, 0, 256, 140);
        x.restore();
        t.needsUpdate = true;
      };
      peindre(null);
      const essayer2 = (l) => {
        if (!l.length) return;
        const im = new Image();
        im.crossOrigin = l[0].startsWith("https://shared") ? "anonymous" : null;
        im.onload = () => {
          try {
            peindre(im);
            x.getImageData(0, 0, 1, 1);
          } catch (e) {
            peindre(null);
            essayer2(l.slice(1));
          }
        };
        im.onerror = () => essayer2(l.slice(1));
        im.src = l[0];
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
        essayer2([...perso("GetCustomVerticalCapsuleURLs"), ...ic.jeu.app_type === 1 ? [IMG(ic.jeu.appid, "library_600x900.jpg"), vert, CDN(ic.jeu.appid, "library_600x900.jpg")] : [...perso("GetCustomLandcapeImageURLs"), vert, icone]].filter(Boolean));
      };
      if (ic.jeu) {
        if (!window.__pcvImageJeu) repli();
        else composerCouches(window.__pcvImageJeu(ic.jeu, document.createElement("div")), (cv) => cv ? peindre(cv) : repli());
      } else essayer2(["data:image/svg+xml," + encodeURIComponent(svg(ic.appli, 128, ic.couleur, 2.4).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '))]);
      return t;
    };
    const creerIcone = (ic, k, n) => {
      geoCadre ||= new T.ExtrudeGeometry(formeArrondie(2.5, 2.5, 0.55), { depth: 0.28, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 4, curveSegments: 8 }).translate(0, 0, -0.14);
      geoImage ||= new T.PlaneGeometry(2.2, 2.2);
      geoHalo ||= new T.ShapeGeometry(formeArrondie(3.05, 3.05, 0.78), 8);
      matCadre ||= new T.MeshToonMaterial({ color: 16777215, gradientMap: degrade() });
      const g = new T.Group(), cadre = new T.Mesh(geoCadre, matCadre), image = new T.Mesh(geoImage, new T.MeshBasicMaterial({ map: imageIcone(ic), transparent: true }));
      image.position.z = 0.26;
      g.add(cadre, image);
      cadre.userData.k = image.userData.k = k;
      const ombre = new T.Mesh(new T.PlaneGeometry(3.2, 1.6), new T.MeshBasicMaterial({ map: tacheRonde, transparent: true, depthWrite: false, opacity: 0.9 }));
      ombre.rotation.x = -Math.PI / 2;
      ombre.position.y = 0.01;
      const p = ellipse(k, n);
      ic.k = k;
      ic.pos = p;
      ic.groupe = p.clone().multiplyScalar(0.74);
      ic.objet = g;
      ic.ombre = ombre;
      ic.cadre = cadre;
      g.position.set(p.x, 2.35, p.z);
      ombre.position.x = p.x;
      ombre.position.z = p.z;
      scene.add(g, ombre);
    };
    let rampe = null;
    const degrade = () => rampe ||= (() => {
      const t = new T.DataTexture(new Uint8Array([150, 160, 178, 205, 228, 244, 252, 255]), 8, 1, T.RedFormat);
      t.minFilter = t.magFilter = T.LinearFilter;
      t.needsUpdate = true;
      return t;
    })();
    let surApparence = null;
    const preparer = () => {
      if (rendu) return true;
      try {
        rendu = new T.WebGLRenderer({ canvas: toile, antialias: true, powerPreference: "high-performance" });
      } catch (e) {
        console.warn("place3d : pas de WebGL", e);
        return false;
      }
      rendu.setPixelRatio(Math.min(2, devicePixelRatio || 1));
      rendu.setClearColor(15659761, 1);
      scene = new T.Scene();
      scene.fog = new T.Fog(15659761, D0 + 10, D0 + 60);
      M.eclairer(scene, { ciel: 2.1, soleil: 1.9 });
      const lumieres = scene.children.filter((o) => o.isHemisphereLight || o.isDirectionalLight || o.isAmbientLight), base = lumieres.map((l) => l.intensity);
      const ciel = lumieres.find((l) => l.isHemisphereLight), soleil = lumieres.find((l) => l.isDirectionalLight);
      const cielJour = ciel && [ciel.color.getHex(), ciel.groundColor.getHex()], soleilJour = soleil && soleil.color.getHex();
      cam = new T.PerspectiveCamera(30, 1, 0.1, 200);
      sol = sol3d();
      scene.add(sol);
      const appliquer = (ap) => {
        const k = ap === "gris" ? 0.62 : ap === "noir" ? 0.7 : 1, fond = ap === "noir" ? 0 : ap === "gris" ? 1777188 : 15659761, nuit = ap !== "clair";
        lumieres.forEach((l, i) => l.intensity = base[i] * k);
        rendu.setClearColor(fond, 1);
        scene.fog.color.setHex(fond);
        if (ciel) {
          ciel.color.setHex(nuit ? 3359326 : cielJour[0]);
          ciel.groundColor.setHex(nuit ? 1381916 : cielJour[1]);
        }
        if (soleil) soleil.color.setHex(nuit ? 11452648 : soleilJour);
        apparenceSol = ap;
        teindreSol();
      };
      appliquer(document.documentElement.dataset.pcvApparence || "clair");
      addEventListener("pcv-apparence", surApparence = (e) => appliquer(e.detail?.apparence || "clair"));
      halo = new T.Mesh(new T.ShapeGeometry(formeArrondie(3.05, 3.05, 0.78), 8), new T.MeshBasicMaterial({ color: 3127551, transparent: true, opacity: 0.95 }));
      halo.position.z = -0.27;
      halo.raycast = () => {
      };
      const blancHalo = new T.Mesh(new T.ShapeGeometry(formeArrondie(2.82, 2.82, 0.66), 8), new T.MeshBasicMaterial({ color: 16777215 }));
      blancHalo.position.z = 5e-3;
      blancHalo.raycast = () => {
      };
      halo.add(blancHalo);
      ombres = new T.InstancedMesh(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: tacheRonde, transparent: true, depthWrite: false }), FOULE_MAX);
      ombres.count = 0;
      ombres.position.y = 0.012;
      ombres.frustumCulled = false;
      ombres.renderOrder = 1;
      scene.add(ombres);
      retailler();
      addEventListener("resize", retailler);
      return true;
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
    const habitants = () => {
      const amis = M.amis(16), moi = siens.filter((s) => s.moi), autres = siens.filter((s) => !s.moi);
      const l = [...moi, ...amis.slice(0, 4), ...autres, ...amis.slice(4), ...M.habitantsDefaut(), ...M.habitantsInvites()];
      const voulu = Math.min(FOULE_MAX, Math.max(N_HEROS, REG.foule, siens.length));
      for (let k = 0; l.length < voulu; k++) l.push(M.hasard(k));
      return l.slice(0, voulu).map((h) => ({ ...h, sig: signature(h) }));
    };
    const membre = (h) => {
      const m = M.pantin({ nom: h.nom });
      m.objet.visible = false;
      return { cle: h.cle, qui: h, m, v: null, photo: null, taille: 1, g: tirerGroupe(), etat: "dehors", t: 0, but: null, heros: false, veut: false, refuse: false };
    };
    const oublier = (f) => {
      if (auStudio?.f === f) {
        if (f.v !== auStudio.r) auStudio.r.liberer();
        auStudio = null;
      }
      f.m.liberer();
      if (f.v) {
        f.v.liberer();
        f.v = null;
      }
      if (f.photo) {
        libres.push(f.photo.k);
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
      foule = nouvelle;
      foule.forEach((f, i) => {
        f.rang = i;
        f.heros = i < N_HEROS;
      });
      heros = foule.slice(0, N_HEROS);
      bulleMii = null;
    };
    const pret = (f) => !!(f.photo || f.v);
    const ANGLES = 5, PHASES = 8, COL = { repos: 0, pas: 1, assis: 1 + PHASES, salut: 2 + PHASES };
    const CASE = { l: 48, h: 96 }, BLOC = { l: 3 + PHASES, h: ANGLES }, PAGE = 2048;
    const PAR_LIGNE = PAGE / (CASE.l * BLOC.l) | 0, PAR_PAGE = PAR_LIGNE * (PAGE / (CASE.h * BLOC.h) | 0);
    const PHOTO = { l: 0.8, h: 1.6, b: 0.3, elev: 0.7 };
    const PAS = { marcher: 1.7, courir: 2.6 }, SALUTS = /* @__PURE__ */ new Set(["saluer", "applaudir", "content", "danser"]), ASSIS = /* @__PURE__ */ new Set(["assisSol", "assis"]);
    const CLICHES = Array.from({ length: ANGLES }, (_, r) => {
      const cap = r * Math.PI / (ANGLES - 1);
      return [
        { c: COL.repos, anim: "repos", t: 0.5 },
        ...Array.from({ length: PHASES }, (_2, j) => ({ c: COL.pas + j, anim: "marcher", t: j / PHASES / PAS.marcher })),
        { c: COL.assis, anim: "assisSol", t: 0 },
        { c: COL.salut, anim: "saluer", t: 0.14 }
      ].map((x) => ({ ...x, r, cap }));
    }).flat();
    let pages = [], libres = [], nPhotos = 0, studio = null, camPhoto = null, brouillon = null, copie = null;
    const VS_LOIN = `attribute vec3 pied; attribute vec4 cellule; uniform vec3 cadre; varying vec2 vUv;
      void main() { vec4 p = modelViewMatrix * vec4(pied, 1.0); p.xy += vec2(position.x * cadre.x, position.y * cadre.y - cadre.z);
        gl_Position = projectionMatrix * p; vUv = cellule.xy + vec2(position.x + 0.5, position.y) * cellule.zw; }`;
    const FS_LOIN = `uniform sampler2D carte; varying vec2 vUv; void main() { vec4 c = texture2D(carte, vUv); if (c.a < 0.02) discard; gl_FragColor = c; }`;
    const nouvellePage = () => {
      const cible = new T.WebGLRenderTarget(PAGE, PAGE, { depthBuffer: false });
      const q = new T.PlaneGeometry(1, 1).translate(0, 0.5, 0), geo = new T.InstancedBufferGeometry();
      geo.index = q.index;
      geo.setAttribute("position", q.attributes.position);
      const pied = new T.InstancedBufferAttribute(new Float32Array(FOULE_MAX * 3), 3).setUsage(T.DynamicDrawUsage), cellule = new T.InstancedBufferAttribute(new Float32Array(FOULE_MAX * 4), 4).setUsage(T.DynamicDrawUsage);
      geo.setAttribute("pied", pied);
      geo.setAttribute("cellule", cellule);
      geo.instanceCount = 0;
      const mat = new T.ShaderMaterial({ uniforms: { carte: { value: cible.texture }, cadre: { value: new T.Vector3(PHOTO.l, PHOTO.h, PHOTO.b) } }, vertexShader: VS_LOIN, fragmentShader: FS_LOIN, transparent: true, premultipliedAlpha: true });
      const maillage = new T.Mesh(geo, mat);
      maillage.frustumCulled = false;
      maillage.renderOrder = 2;
      scene.add(maillage);
      return { cible, maillage, pied, cellule, n: 0 };
    };
    const placePhoto = () => {
      const k = libres.length ? libres.pop() : nPhotos++, j = k % PAR_PAGE, p = k / PAR_PAGE | 0;
      while (pages.length <= p) pages.push(nouvellePage());
      return { k, page: pages[p], x: j % PAR_LIGNE * CASE.l * BLOC.l, y: (j / PAR_LIGNE | 0) * CASE.h * BLOC.h };
    };
    const preparerStudio = () => {
      if (studio) return;
      studio = new T.Scene();
      copie = new T.Scene();
      camPhoto = new T.OrthographicCamera(-PHOTO.l / 2, PHOTO.l / 2, PHOTO.h - PHOTO.b, -PHOTO.b, 0.1, 20);
      camPhoto.position.set(0, Math.sin(PHOTO.elev), Math.cos(PHOTO.elev)).multiplyScalar(8);
      camPhoto.lookAt(0, 0, 0);
      brouillon = new T.WebGLRenderTarget(CASE.l * BLOC.l * 2, CASE.h * BLOC.h * 2);
      const q = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
        uniforms: { carte: { value: brouillon.texture } },
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
      const parent = r.objet.parent, garde = { ph: r.ph, cadence: r.cadence, pos: r.objet.position.clone(), vu: r.objet.visible }, fond = rendu.getClearColor(new T.Color()), alpha = rendu.getClearAlpha();
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
      const W = CASE.l * 2, H = CASE.h * 2, t0 = performance.now();
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
        const ph = f.photo || placePhoto(), P = ph.page.cible;
        P.viewport.set(ph.x, ph.y, CASE.l * BLOC.l, CASE.h * BLOC.h);
        P.scissor.copy(P.viewport);
        P.scissorTest = true;
        rendu.setRenderTarget(P);
        rendu.render(copie, camPhoto);
        f.photo = ph;
      }
      rendu.setRenderTarget(null);
      rendu.setClearColor(fond, alpha);
      studio.remove(r.objet);
      parent?.add(r.objet);
      r.objet.position.copy(garde.pos);
      r.objet.visible = garde.vu;
      r.ph = garde.ph;
      r.cadence = garde.cadence;
      r.nSuivi = void 0;
      return fini;
    };
    const caseDe = (f) => {
      const p = f.m, pos = p.objet.position;
      let rel = p.cap - Math.atan2(cam.position.x - pos.x, cam.position.z - pos.z);
      rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      const r = Math.min(ANGLES - 1, Math.round(Math.abs(rel) / (Math.PI / (ANGLES - 1)))), miroir = r > 0 && r < ANGLES - 1 && rel < 0;
      let c = COL.repos;
      if (PAS[p.anim]) c = COL.pas + Math.round(((p.t * PAS[p.anim] * p.cadence + p.ph / (2 * Math.PI)) % 1 + 1) % 1 * PHASES) % PHASES;
      else if (ASSIS.has(p.anim)) c = COL.assis;
      else if (SALUTS.has(p.anim)) c = COL.salut;
      return caseVers(f.photo, r, c, miroir);
    };
    const caseVers = (ph, r, c, miroir) => {
      const u0 = (ph.x + c * CASE.l) / PAGE, v0 = (ph.y + (BLOC.h - 1 - r) * CASE.h) / PAGE, du = CASE.l / PAGE;
      return [miroir ? u0 + du : u0, v0, miroir ? -du : du, CASE.h / PAGE];
    };
    const EXPR_PROCHE = ["neutre", "cligne", "sourire", "joie", "parle", "surprise"];
    let auStudio = null;
    const fabriquer = (f, garder) => {
      const h = f.qui, t0 = performance.now(), r = M.creer({
        donnees: h.donnees,
        graine: h.graine,
        pantalon: h.pantalon,
        nom: h.nom,
        rendu,
        resolution: garder ? f.heros ? 512 : 256 : 128,
        expressions: garder ? EXPR_PROCHE : ["neutre", "sourire"]
      });
      noter(mesure.creer, performance.now() - t0);
      f.taille = r.D.haut * ECHELLE;
      f.m.regler(f.taille);
      if (garder) {
        r.regler(f.taille);
        scene.add(r.objet);
        f.v = r;
        r.suivre(f.m, 0);
      }
      if (!f.photo) auStudio = { f, r, garder, k: 0 };
      else if (!garder) r.liberer();
    };
    const noter = (m, ms) => {
      m.n++;
      m.ms += ms;
      m.max = Math.max(m.max, ms);
    };
    const fabriquerUn = () => {
      if (auStudio) {
        const s = auStudio, t0 = performance.now();
        let fini = true;
        try {
          fini = s.f.refuse || photographier(s.f, s.r, s);
        } catch (e) {
          s.f.refuse = true;
          console.warn("place3d : photo refus\xE9e", s.f.cle, e);
        }
        noter(mesure.photos, performance.now() - t0);
        if (fini) {
          auStudio = null;
          if (!s.garder || s.f.v !== s.r) s.r.liberer();
          if (s.f.etat === "dehors" && pret(s.f) && temps >= introFin) entrer(s.f);
        }
        return true;
      }
      const f = heros.find((x) => !x.v && !x.refuse) || foule.find((x) => x.veut && !x.v && !x.refuse) || foule.find((x) => !x.photo && !x.refuse);
      if (!f) return false;
      try {
        fabriquer(f, f.heros || f.veut);
      } catch (e) {
        f.refuse = true;
        console.warn("place3d : Mii refus\xE9 par le moteur", f.cle, e);
      }
      if (f.etat === "dehors" && pret(f) && temps >= introFin) entrer(f);
      return true;
    };
    const MARGE_PROCHES = 2;
    const BUDGET = { n: 24, min: 8, pas: 4, ri: 0, riMin: 1e9, verifie: 0, baisse: -1e9, cpu: 0, margeCpu: 0.5 };
    const choisirProches = () => {
      const l = [], k = innerHeight / (2 * Math.tan(cam.fov * Math.PI / 360));
      for (const f of foule) {
        f.px = 0;
        if (f.heros || f.refuse || !f.m.objet.visible) continue;
        const p = f.m.objet.position, [x, y] = ecran(p);
        if (x > -100 && x < innerWidth + 100 && y > -50 && y < innerHeight + 300) {
          f.px = f.taille * k / cam.position.distanceTo(p);
          l.push(f);
        }
      }
      l.sort((a, b) => b.px - a.px);
      const n = Math.max(0, Math.min(REG.proches, BUDGET.n) - heros.length), tous = n >= l.length, rang = new Map(l.map((f, i) => [f, i]));
      for (const f of foule) {
        if (f.heros) continue;
        const i = rang.get(f) ?? Infinity;
        f.veut = tous ? i < Infinity : i < n - MARGE_PROCHES;
        if (f.v && !tous && i >= n + MARGE_PROCHES && auStudio?.r !== f.v) {
          f.v.liberer();
          f.v = null;
        }
      }
    };
    const regulerBudget = (brut, occupe2) => {
      if (brut > 0) {
        brut = Math.min(250, brut);
        BUDGET.riMin = Math.min(BUDGET.riMin, brut, 1e3 / Math.min(60, REG.plafond || 60) + 0.5);
        if (!occupe2) BUDGET.ri = BUDGET.ri ? BUDGET.ri + (brut - BUDGET.ri) * 0.06 : brut;
      }
      if (temps < introFin || temps < BUDGET.verifie) return;
      BUDGET.verifie = temps + 1;
      const charge = Math.max(BUDGET.ri / BUDGET.riMin, BUDGET.cpu / (BUDGET.riMin * BUDGET.margeCpu)), vrais = foule.filter((f) => f.v).length;
      if (charge > 1.3 && BUDGET.n > BUDGET.min) {
        const n = Math.min(BUDGET.n, vrais);
        BUDGET.n = Math.max(BUDGET.min, charge > 2 ? Math.round(n / 2) : n - BUDGET.pas);
        BUDGET.baisse = temps;
      } else if (charge < 1.12 && temps - BUDGET.baisse > 4 && BUDGET.n < Math.min(REG.proches, foule.length) && vrais >= BUDGET.n - MARGE_PROCHES - 1) BUDGET.n += 2;
    };
    const placeLibre = (g, ecart = 0.5) => {
      const ic = icones[g], n = foule.filter((f) => f.g === g).length;
      for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2, r = alea(0.45, 1.5 + 0.2 * Math.sqrt(n)), p = ic.groupe.clone().add(new T.Vector3(Math.cos(a) * r * 1.25, 0, Math.sin(a) * r * 0.85));
        if (foule.every((f) => !f.but || f.but.distanceToSquared(p) > ecart * ecart)) return p;
      }
      return ic.groupe.clone().add(new T.Vector3(alea(-2, 2), 0, alea(-1.4, 1.4)));
    };
    const tirerGroupe = () => {
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
    const VIT = { marcher: 1.05, courir: 2.4 };
    const aller = (f, courir = false, but = null) => {
      const m = f.m;
      f.but = but || placeLibre(f.g);
      f.etat = "marche";
      f.pivot = null;
      f.course = courir;
      f.vmax = VIT[courir ? "courir" : "marcher"] * m.taille * (courir ? alea(0.9, 1.05) : alea(0.6, 0.92));
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
        if (o === f || !o.m.objet.visible) continue;
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
      m.vitesse = Math.max(0.35, f.vit / (VIT[m.anim] || VIT.marcher) / T0);
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
          if (o === f || !o.m.objet.visible) continue;
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
    const vivre = (f, dt) => {
      const m = f.m;
      f.t -= dt;
      if (f.parle && f.parle.fin < temps) f.parle = null;
      if (f.etat === "marche") {
        if (!m.action && avancer(f, dt)) arriver(f);
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
      const x = Math.random();
      if (x < 0.05 && icones.length > 1) {
        f.g = tirerGroupe();
        aller(f, Math.random() < 0.25);
        jouerPlace("depart", f, 0.8);
      } else if (x < 0.3) aller(f);
      else if (x < 0.48) {
        const b = foule.find((o) => o !== f && o.etat === "pause" && !o.pivot && o.m.objet.position.distanceTo(m.objet.position) < 1.8 && !o.parle);
        if (b) discuter(f, b);
        else {
          f.etat = "pause";
          f.t = alea(1.5, 4);
          faireFace(f);
        }
      } else if (x < 0.58) {
        f.etat = "assis";
        f.t = alea(5, 11);
        m.capVise = alea(-0.8, 0.8);
        m.jouer("assisSol", { fondu: 0.5 });
      } else if (x < 0.7) {
        f.etat = "geste";
        f.t = alea(1.4, 2.4);
        m.capVise = alea(-0.4, 0.4);
        m.jouer(["saluer", "applaudir", "content", "danser", "hausser"][Math.floor(Math.random() * 5)], { redemarrer: true });
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
        if (o !== f) f.m.regarder(o.m.objet.position.clone().setY(0.8));
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
      if (!REG.bruits || !(volBruits > 0)) return null;
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
      if (racine.hidden || !f?.m.objet.visible) return;
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
      tMurmure = alea(0.35, 0.9);
      const l = foule.filter((f2) => f2.m.objet.visible && f2.etat !== "dehors");
      if (!l.length) return;
      const parleurs = l.filter((f2) => f2.etat === "parle" || f2.etat === "porteParole"), choix = parleurs.length && Math.random() < 0.6 ? parleurs : l, f = choix[Math.floor(Math.random() * choix.length)];
      if (f && (!sonsPrives() || parleurs.includes(f))) babiller(f, f.etat === "parle" ? 0.5 : 0.28);
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
    const construire = () => {
      const jeux = lireJeux(), c = cleJeux(jeux);
      if (c === cle && icones.length) return;
      cle = c;
      for (const ic of icones) {
        ic.objet.removeFromParent();
        ic.ombre.removeFromParent();
        ic.objet.children[1].material.map.dispose();
        ic.objet.children[1].material.dispose();
      }
      icones = composer(jeux);
      icones.forEach((ic, k) => creerIcone(ic, k, icones.length));
      sel = Math.min(sel, icones.length - 1);
      for (const f of foule) {
        f.g = tirerGroupe();
        f.but = null;
      }
      chargerBulles(jeux);
    };
    let attenteHeros = false, attenteDepuis = 0;
    const PATIENCE = 3500;
    const herosPrets = () => heros.every((h) => h.v || h.refuse);
    const INTRO = { gros: 2.5, recul: [2.4, 4.4], icones: 3, foule: 3.2, fin: 5.6 };
    const lancerIntro = (complete) => {
      debut = temps;
      introFin = complete ? temps + INTRO.fin : temps;
      blanc.classList.add("on");
      blanc.classList.remove("attend");
      requestAnimationFrame(() => requestAnimationFrame(() => blanc.classList.remove("on")));
      heros.forEach((h, i) => {
        const m = h.m, k = PLACES_HEROS[i];
        m.interrompre();
        m.objet.visible = !h.refuse;
        m.objet.position.set((k - 2) * 0.82, 0, 5.2 + Math.abs(k - 2) * 0.22);
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
        if (!complete && pret(f)) entrer(f, true);
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
        });
      } else icones.forEach((ic) => {
        ic.objet.visible = true;
        ic.ombre.visible = true;
        ic.arrive = false;
        ic.objet.rotation.set(0, 0, 0);
        ic.ombre.scale.setScalar(1);
      });
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
      if (Math.random() < 0.35) {
        m.objet.position.copy(f.but).setY(alea(7, 11));
        f.etat = "tombe";
        m.tomber(0, { recuperation: 0.6 }).then(() => jouerPlace("arrivee", f), () => {
        });
      } else {
        const dir = f.but.clone().setY(0).normalize();
        m.objet.position.copy(f.but).addScaledVector(dir.lengthSq() ? dir : new T.Vector3(0, 0, -1), alea(14, 20));
        m.cap = capVers(f, f.but);
        aller(f, true, f.but);
        f.entre = true;
      }
    };
    const majIntro = () => {
      const e = temps - debut;
      if (temps >= introFin) return false;
      const ordre = [...icones].sort((a, b) => b.pos.z - a.pos.z);
      ordre.forEach((ic, i) => {
        const q = lisse((e - INTRO.icones - i * 0.11) / 0.75), g = ic.objet;
        g.visible = ic.ombre.visible = q > 0;
        ic.arrive = q < 1;
        if (q <= 0) return;
        const v = 1 - Math.pow(1 - q, 3);
        g.position.set(ic.pos.x, 2.35 + 6 * (1 - v), ic.pos.z);
        qDebout.setFromEuler(eDebout.set(0, Math.atan2(cam.position.x - g.position.x, cam.position.z - g.position.z) + (1 - v) * 1.1 * (ic.k % 2 ? 1 : -1), 0));
        g.quaternion.copy(qDebout).slerp(cam.quaternion, 0.8);
        g.scale.setScalar(0.55 + 0.45 * v);
        ic.ombre.scale.setScalar(v * v);
      });
      heros.forEach((h, i) => {
        if (h.etat !== "intro") return;
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
      });
      for (const f of foule) if (f.etat === "dehors" && pret(f) && e > INTRO.foule + f.rang % 13 * 0.1) entrer(f);
      if (e > INTRO.recul[0]) {
        for (const h of heros) if (h.etat === "intro") {
          h.etat = "pause";
          h.t = alea(0.5, 2);
          h.g = Math.floor(Math.random() * icones.length);
        }
      }
      return true;
    };
    const viser = (dt, intro) => {
      const z = ZOOMS[zoom], ic = icones[sel], f = zoom ? 0.82 : 0;
      butVise.set(0, 0.6, 0.9).lerp(ic ? ic.pos.clone().setY(1.6) : butVise, f);
      butVise.x += Math.sin(temps * 0.11) * 0.5;
      butVise.z += Math.sin(temps * 0.083) * 0.35;
      const d = D0 / z, az = Math.sin(temps * 0.05) * 0.05 + (ic && zoom ? -Math.atan2(ic.pos.x, 30) * 0.15 : 0), el = ELEV - zoom * 0.05;
      butPos.set(butVise.x + Math.sin(az) * Math.cos(el) * d, butVise.y + Math.sin(el) * d, butVise.z + Math.cos(az) * Math.cos(el) * d);
      if (intro) {
        const e = temps - debut, q = lisse((e - INTRO.recul[0]) / (INTRO.recul[1] - INTRO.recul[0])), ease = q * q * (3 - 2 * q);
        const pg = new T.Vector3(0, 0.92, 10.2), vg = new T.Vector3(0, 0.5, 5.3);
        camPos.copy(pg).lerp(butPos, ease);
        camVise.copy(vg).lerp(butVise, ease);
      } else {
        const k = 1 - Math.exp(-dt * 2.6);
        camPos.lerp(butPos, k);
        camVise.lerp(butVise, k);
      }
      cam.position.copy(camPos);
      cam.lookAt(camVise);
    };
    let bulles = [], bulleK = 0, bulleT = 0, bulleMii = null;
    const chargerBulles = async (jeux) => {
      const l = [];
      for (const a of jeux.slice(0, 4)) {
        try {
          const r = await O.SteamClient.Apps.GetMyAchievementsForApp(String(a.appid));
          const d = (typeof r === "string" ? JSON.parse(r) : r).data.rgAchievements;
          d.filter((x) => x.bAchieved).sort((x, y) => y.rtUnlocked - x.rtUnlocked).slice(0, 2).forEach((s) => l.push({
            jeu: a,
            img: s.strImage,
            txt: Tr("place.bulle_succes", { succes: s.strName.charAt(0) + s.strName.slice(1).toLowerCase(), jeu: a.display_name }),
            date: new Date(s.rtUnlocked * 1e3)
          }));
        } catch (e) {
        }
      }
      const fort = jeux.filter((a) => a.minutes_playtime_last_two_weeks).sort((a, b) => b.minutes_playtime_last_two_weeks - a.minutes_playtime_last_two_weeks)[0];
      if (fort) l.push({ jeu: fort, img: "", txt: Tr("place.bulle_temps", { h: Math.round(fort.minutes_playtime_last_two_weeks / 60), jeu: fort.display_name }), date: new Date(fort.rt_last_time_played * 1e3) });
      bulles = l.sort((a, b) => b.date - a.date).slice(0, 3);
      bulleT = 0;
    };
    const zoneBulles = $(".bulles");
    const majBulles = (dt) => {
      bulleT -= dt;
      if (!bulles.length || temps < introFin) return;
      if (bulleT <= 0) {
        bulleT = 3.4;
        const b = bulles[bulleK++ % bulles.length], g = icones.findIndex((i) => i.jeu?.appid === b.jeu.appid);
        const groupe = foule.filter((f) => f.g === g && f.m.objet.visible && (f.etat === "pause" || f.etat === "geste")), choix = groupe[Math.floor(Math.random() * groupe.length)] || foule.find((f) => f.m.objet.visible && f.etat !== "intro");
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
          pivoter(bulleMii, capVers(bulleMii, cam.position), "parler");
          bulleMii.m.regarder(cam.position);
          babiller(bulleMii);
        }
        const av = avatarDe();
        zoneBulles.innerHTML = `<div class="bulle-p"><span class="qui">${echap((pseudo() || "MOI").toUpperCase())}</span><div class="corps">${b.img ? `<img src="${urlSure(b.img)}" alt="">` : `<img data-pcv-avatar src="${urlSure(av)}" alt="">`}<span></span></div></div>`;
        zoneBulles.querySelector(".corps span").textContent = b.txt;
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
        setTimeout(() => el2.classList.remove("vu"), 2900);
      }
      const el = zoneBulles.firstChild;
      if (!el || !bulleMii) return;
      const p = bulleMii.m.objet.position.clone().setY(bulleMii.taille + 0.15).project(cam), un = innerHeight / 800;
      el.style.transform = `translate(${(p.x + 1) / 2 * innerWidth - 46 * un}px, calc(${(1 - p.y) / 2 * innerHeight}px - 100%))`;
    };
    const jour = (d) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const carte = (b) => {
      const z = $(".carte-zone"), av = avatarDe();
      z.innerHTML = `<div class="voile"></div><div class="v carte">
        <div style="display:flex;align-items:center;gap:${u(16)}"><img src="${urlSure(av)}" alt="" style="width:${u(58)};height:${u(58)};border-radius:50%;box-shadow:0 0 0 ${u(3)} var(--pcv-lisere)">
          <span><b style="display:block;font-size:${u(22)}" class="qui"></b><span style="font-size:${u(14)};font-weight:800;color:var(--pcv-texte2)" class="ou"></span></span></div>
        <div class="v msg" style="position:relative">${b.img ? `<img src="${urlSure(b.img)}" alt="">` : ""}<span class="txt"></span></div>
        <div class="actions"><button class="cyan" data-fiche="${echap(b.jeu.appid)}">Voir la fiche du jeu</button><button class="fermer">Fermer</button></div></div>`;
      z.querySelector(".qui").textContent = pseudo();
      z.querySelector(".ou").textContent = `${b.jeu.display_name}, ${jour(b.date)}`;
      z.querySelector(".txt").textContent = b.txt;
      z.querySelector(".voile").onclick = z.querySelector(".fermer").onclick = (e) => {
        e.stopPropagation();
        z.innerHTML = "";
      };
      z.querySelector("[data-fiche]").onclick = (e) => {
        e.stopPropagation();
        z.innerHTML = "";
        montrer(false);
        O.SteamClient.URL.ExecuteSteamURL(`steam://nav/games/details/${b.jeu.appid}`);
      };
    };
    const ecran = (v) => {
      const p = v.clone().project(cam);
      return [(p.x + 1) / 2 * innerWidth, (1 - p.y) / 2 * innerHeight, p.z];
    };
    const rectMembre = (f) => {
      if (f.v) return f.v.rectEcran(cam, innerWidth, innerHeight);
      const p = f.m.objet.position, [x, y] = ecran(p), [, yh] = ecran(p.clone().setY(p.y + f.taille)), w = (y - yh) * 0.32;
      return { x0: x - w, x1: x + w, y0: yh, y1: y };
    };
    let tChoix = 0, tourPrec = 0, occupe = false, ouvertA = 0, imagesVues = 0;
    const loin = [], m4 = new T.Matrix4(), q0 = new T.Quaternion(), v1 = new T.Vector3(), pz = new T.Vector3();
    const tour = (t) => {
      raf = requestAnimationFrame(tour);
      if (racine.hidden || document.hidden) {
        arreterBoucle();
        return;
      }
      if (window.__pcvMenuOuvert?.()) {
        dernier = t;
        return;
      }
      const brut = t - (tourPrec || t);
      tourPrec = t;
      if (REG.plafond && t - dernier + Math.min(brut, BUDGET.riMin) / 2 < 1e3 / REG.plafond) return;
      const dt = fige ? 0 : Math.min(0.1, (t - dernier) / 1e3);
      dernier = t;
      temps += dt;
      const t0 = performance.now();
      if (attenteHeros) {
        fabriquerUn();
        if (!herosPrets() && performance.now() - attenteDepuis < PATIENCE) return;
        attenteHeros = false;
        lancerIntro(REG.intro !== false);
      }
      regulerBudget(brut, occupe);
      occupe = false;
      const intro = majIntro();
      viser(dt, intro);
      cam.updateMatrixWorld();
      icones.forEach((ic2) => {
        const g = ic2.objet;
        if (intro && ic2.arrive) return;
        g.position.y = 2.35 + Math.sin(temps * 1.1 + ic2.k) * 0.07;
        qDebout.setFromEuler(eDebout.set(0, Math.atan2(cam.position.x - g.position.x, cam.position.z - g.position.z), 0));
        g.quaternion.copy(qDebout).slerp(cam.quaternion, 0.8);
        const s = ic2.k === sel ? 1.08 : 1;
        g.scale.setScalar(g.scale.x + (s - g.scale.x) * Math.min(1, dt * 10));
      });
      const ic = icones[sel];
      if (ic && (!intro || temps - debut > INTRO.fin - 0.4)) {
        if (halo.parent !== ic.objet) ic.objet.add(halo);
        halo.visible = true;
        halo.scale.setScalar(1 + Math.sin(temps * 4) * 0.012);
        const [x, y] = ecran(ic.objet.position.clone().add(new T.Vector3(0, -1.55 * ic.objet.scale.x, 0)));
        nomSel.textContent = ic.nom;
        nomSel.style.transform = `translate(calc(${x}px - 50%), ${y + 10}px)`;
        nomSel.classList.add("vu");
      } else {
        halo.visible = false;
        nomSel.classList.remove("vu");
      }
      {
        const n0 = mesure.creer.n;
        fabriquerUn();
        occupe = mesure.creer.n !== n0;
      }
      if ((tChoix -= dt) <= 0 || fige) {
        tChoix = 0.25;
        choisirProches();
      }
      murmurer(dt);
      let n = 0;
      loin.length = 0;
      for (const f of foule) {
        const p = f.m;
        if (!p.objet.visible) {
          if (f.v) f.v.objet.visible = false;
          continue;
        }
        if (!intro || f.etat !== "intro") vivre(f, dt);
        p.maj(dt);
        pas(f);
        if (f.v) {
          f.v.vitesse = p.vitesse;
          f.v.suivre(p, dt);
        } else if (f.photo) {
          f.loin = cam.position.distanceToSquared(p.objet.position);
          loin.push(f);
        }
        const k = 1 / (1 + p.objet.position.y * 0.5);
        if (n < FOULE_MAX) {
          pz.copy(p.objet.position).setY(0);
          v1.set(0.55 * k * f.taille, 1, 0.4 * k * f.taille);
          m4.compose(pz, q0, v1);
          ombres.setMatrixAt(n++, m4);
        }
      }
      ombres.count = n;
      ombres.instanceMatrix.needsUpdate = true;
      loin.sort((a, b) => b.loin - a.loin);
      for (const pg of pages) pg.n = 0;
      for (const f of loin) {
        const pg = f.photo.page, i = pg.n++, p = f.m.objet.position;
        pg.pied.setXYZ(i, p.x, p.y, p.z);
        pg.cellule.setXYZW(i, ...caseDe(f));
      }
      for (const pg of pages) {
        pg.maillage.geometry.instanceCount = pg.n;
        pg.pied.needsUpdate = pg.cellule.needsUpdate = true;
      }
      majBulles(dt);
      const t1 = performance.now(), qg = gpuDebut();
      rendu.render(scene, cam);
      gpuFin(qg);
      const t2 = performance.now();
      if (!occupe) BUDGET.cpu = BUDGET.cpu ? BUDGET.cpu + (t2 - t0 - BUDGET.cpu) * 0.06 : t2 - t0;
      imagesVues++;
      mesure.n++;
      mesure.logique += t1 - t0;
      mesure.rendu += t2 - t1;
      suivreQualite(t, t2 - t0);
    };
    const mesure = { n: 0, logique: 0, rendu: 0, photos: { n: 0, ms: 0, max: 0 }, creer: { n: 0, ms: 0, max: 0 } };
    const demarrerBoucle = () => {
      if (raf) return;
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
      st.textContent = `html:not(.pcv-steam-verrou, .pcv-steam-modale) [${SOUS}] { visibility: hidden !important; }`;
      racine.appendChild(st);
    }
    const zDe = (e) => {
      const z = parseInt(getComputedStyle(e).zIndex);
      return Number.isFinite(z) ? z : null;
    };
    const masquerDessous = (oui) => {
      for (const e of document.querySelectorAll(`[${SOUS}]`)) e.removeAttribute(SOUS);
      if (!oui) return;
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
    const QUALITE = { min: 0.6, pas: 0.85, gpuHaut: 13, gpuBas: 7.5, intervalleHaut: 19, attente: 1500, fenetre: 1e3 };
    let Q = null;
    const qualiteNeuve = () => {
      const gl2 = rendu.getContext(), base = Math.min(2, devicePixelRatio || 1);
      return { gl: gl2, ext: gl2.getExtension?.("EXT_disjoint_timer_query_webgl2") || null, base, r: base, requetes: [], libres: [], gpu: [], dts: [], cpu: [], t0: 0, change: 0, bilan: null, aff: null };
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
        if (!gl2.getParameter(Q.ext.GPU_DISJOINT_EXT)) Q.gpu.push(gl2.getQueryParameter(r, gl2.QUERY_RESULT) / 1e6);
        Q.libres.push(r);
      }
    };
    const reglerEchelle = (r) => {
      r = Math.max(QUALITE.min * Q.base, Math.min(Q.base, r));
      if (Math.abs(r - Q.r) < 0.01) return;
      Q.r = r;
      rendu.setPixelRatio(r);
      retailler();
    };
    const suivreQualite = (t, cpu) => {
      if (!Q) return;
      const d = Q.tp ? t - Q.tp : 0;
      Q.tp = t;
      if (d > 0 && d < 250) Q.dts.push(d);
      Q.cpu.push(cpu);
      if (!Q.t0) Q.t0 = t;
      if (t - Q.t0 < QUALITE.fenetre) return;
      Q.t0 = t;
      const moy = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0, med = (a) => a.length ? a.slice().sort((x, y) => x - y)[a.length >> 1] : 0;
      const gpu = med(Q.gpu), inter = med(Q.dts), P = window.__pcvPlacePerf;
      Q.bilan = {
        ips: Q.dts.length ? +(1e3 / moy(Q.dts)).toFixed(1) : 0,
        pire: Math.round(Math.max(0, ...Q.dts)),
        gpu: Q.gpu.length ? +gpu.toFixed(2) : null,
        cpu: +moy(Q.cpu).toFixed(2),
        echelle: +Q.r.toFixed(2),
        taille: [toile.width, toile.height],
        dessins: rendu.info.render.calls,
        triangles: rendu.info.render.triangles,
        vrais: foule.filter((f) => f.v).length
      };
      Q.gpu.length = Q.dts.length = Q.cpu.length = 0;
      if (P && !Q.aff) {
        Q.aff = document.createElement("div");
        Q.aff.style.cssText = "position:absolute;right:6px;top:4px;z-index:99;font:12px monospace;color:#063;background:rgba(255,255,255,.8);padding:2px 6px;pointer-events:none";
        racine.appendChild(Q.aff);
      } else if (!P && Q.aff) {
        Q.aff.remove();
        Q.aff = null;
      }
      if (Q.aff) Q.aff.textContent = `${Q.bilan.ips} i/s, pire ${Q.bilan.pire} ms, GPU ${Q.bilan.gpu ?? "?"} ms, CPU ${Q.bilan.cpu} ms, \xD7${Q.bilan.echelle} ${Q.bilan.taille.join("\xD7")}, ${Q.bilan.dessins} dessins, ${Q.bilan.vrais} vrais`;
      if (P?.echelle) {
        reglerEchelle(P.echelle);
        return;
      }
      if (t - Q.change < QUALITE.attente || temps < introFin) return;
      const k = Math.min(1, BUDGET.riMin * 0.06);
      const trop = Q.bilan.gpu != null ? gpu > QUALITE.gpuHaut * k : inter > QUALITE.intervalleHaut * k, large = Q.bilan.gpu != null && gpu < QUALITE.gpuBas * k;
      if (trop && Q.r > QUALITE.min * Q.base + 0.01) {
        reglerEchelle(Q.r * QUALITE.pas);
        Q.change = t;
      } else if (large && Q.r < Q.base - 0.01) {
        reglerEchelle(Q.r / QUALITE.pas);
        Q.change = t;
      }
    };
    const marquer = () => pts.forEach((p, i) => p.classList.toggle("on", i <= zoom));
    const choisir = (k) => {
      if (!icones.length) return;
      sel = (k + icones.length) % icones.length;
      marquer();
      window.__pcvSon?.("bouge");
      for (const f of foule) if (f.g === sel && f.etat === "pause" && Math.random() < 0.5) {
        f.m.regarder(cam.position);
        const geste = Math.random() < 0.4;
        if (geste) {
          f.etat = "geste";
          f.t = 1.9;
        }
        pivoter(f, capVers(f, cam.position), geste ? Math.random() < 0.5 ? "saluer" : "content" : "repos");
      }
    };
    const zoomer = (d) => {
      zoom = Math.max(0, Math.min(ZOOMS.length - 1, zoom + d));
      marquer();
      window.__pcvSon?.(d > 0 ? "zoom+" : "zoom-");
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
    const ACTIONS = { amis: () => window.__pcvAmisMontrer?.(true), magasin: () => O.__pcvAller?.(3), medias: () => O.__pcvAller?.(5), telechargements: () => O.__pcvAller?.(6), parametres: () => O.__pcvAller?.(7) };
    const ouvrir = (a) => {
      montrer(false);
      if (a.startsWith("jeu:")) O.SteamClient.URL.ExecuteSteamURL(`steam://nav/games/details/${a.slice(4)}`);
      else ACTIONS[a]?.();
    };
    toile.addEventListener("click", (e) => {
      if (temps < introFin) return finirIntro();
      rayon.setFromCamera(new T.Vector2(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), cam);
      const t = rayon.intersectObjects(icones.map((i) => i.objet), true)[0];
      if (t) {
        const k = t.object.userData.k ?? icones.findIndex((i) => i.objet === t.object.parent);
        if (k === sel && zoom) ouvrir(icones[k].action);
        else {
          choisir(k);
          zoom = Math.max(1, zoom);
          marquer();
        }
        return;
      }
      for (const f of foule) {
        if (!f.m.objet.visible || !pret(f)) continue;
        const b = rectMembre(f);
        if (e.clientX > b.x0 && e.clientX < b.x1 && e.clientY > b.y0 && e.clientY < b.y1) {
          f.etat = "geste";
          f.t = 2.2;
          f.pivot = null;
          f.vit = 0;
          f.m.capVise = capVers(f, cam.position);
          hop(f);
          f.m.sauterVers(f.m.objet.position.clone(), { hauteur: 0.6, ensuite: "saluer" }).catch(() => {
          });
          break;
        }
      }
    });
    racine.addEventListener("click", (e) => {
      const b = e.target.closest(".dock-btn");
      if (b) ouvrir(b.dataset.action);
    });
    const heure = () => {
      racine.querySelector(".heure").textContent = (/* @__PURE__ */ new Date()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    };
    heure();
    window.__pcvPlaceHeure = setInterval(() => {
      if (racine.hidden) return;
      heure();
      const a = avatarDe();
      if (a) racine.querySelectorAll("[data-pcv-avatar]").forEach((i) => {
        if (i.src !== a) i.src = a;
      });
    }, 3e3);
    const montrer = (oui) => {
      const etait = !racine.hidden;
      racine.hidden = !oui;
      bascule.hidden = oui;
      if (oui && !etait) {
        if (!preparer()) {
          racine.hidden = true;
          return;
        }
        decorTheme();
        Q ||= qualiteNeuve();
        Q.tp = Q.t0 = 0;
        Q.dts.length = Q.gpu.length = Q.cpu.length = 0;
        masquerDessous(true);
        {
          const e = racine.querySelector(".gl"), [h, c] = toucheHaut();
          if (e) {
            if (e.innerHTML !== h) e.innerHTML = h;
            e.style.background = c;
          }
          heure();
        }
        $(".carte-zone").innerHTML = "";
        racine.querySelectorAll("[data-pcv-avatar]").forEach((i) => {
          i.src = avatarDe();
        });
        construire();
        peupler();
        zoom = 0;
        marquer();
        retailler();
        bulles.forEach((b) => {
          b.fete = false;
        });
        if (window.__pcvNintendo?.pret) window.__pcvNintendo.pret.then(prechargerPlace);
        else prechargerPlace();
        if (herosPrets()) lancerIntro(REG.intro !== false);
        else {
          attenteHeros = true;
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
        window.__pcvMusique?.("place");
      }
      if (!oui && etait) {
        arreterBoucle();
        masquerDessous(false);
        try {
          localStorage.setItem("pcv-place3d-mesure", JSON.stringify({
            quand: (/* @__PURE__ */ new Date()).toISOString(),
            duree: +temps.toFixed(1) - +ouvertA.toFixed(1),
            images: imagesVues,
            ips: +(imagesVues / Math.max(1e-3, temps - ouvertA)).toFixed(1),
            budget: BUDGET.n,
            vrais: foule.filter((f) => f.v).length,
            charge: BUDGET.ri ? +(BUDGET.ri / BUDGET.riMin).toFixed(2) : null,
            ecranMs: +BUDGET.riMin.toFixed(1)
          }));
        } catch (e) {
        }
        zoneBulles.innerHTML = "";
        nomSel.classList.remove("vu");
        relireSiens();
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
      else if (k === "ArrowLeft") choisir(sel + 1);
      else if (k === "ArrowRight") choisir(sel - 1);
      else if (k === "-" || k === "PageUp") zoomer(-1);
      else if (k === "+" || k === "=" || k === "PageDown") zoomer(1);
      else if (k === "Enter") {
        const z = $(".carte-zone");
        if (z.innerHTML) z.querySelector("[data-fiche]")?.click();
        else if (zoom) ouvrir(icones[sel].action);
        else zoomer(1);
      } else return;
      e.stopPropagation();
      e.preventDefault();
    }, true);
    (window.__pcvManette ||= {}).place = (b) => {
      if (b === 4) {
        if (racine.hidden && !/^\/routes\/library\/home/.test(O.location.pathname)) return false;
        montrer(racine.hidden);
        return true;
      }
      if (racine.hidden) return false;
      const z = $(".carte-zone");
      if (b === 2) {
        if (z.innerHTML) z.innerHTML = "";
        else montrer(false);
        return true;
      }
      if (temps < introFin) {
        finirIntro();
        return true;
      }
      if (b === 11) choisir(sel + 1);
      else if (b === 12) choisir(sel - 1);
      else if (b === 5 || b === 7) zoomer(-1);
      else if (b === 6 || b === 8) zoomer(1);
      else if (b === 1) {
        if (z.innerHTML) z.querySelector("[data-fiche]")?.click();
        else if (zoom) ouvrir(icones[sel].action);
        else zoomer(1);
      }
      return true;
    };
    window.__pcvPlaceSuivi = setInterval(() => {
      const accueil = /^\/routes\/library\/home/.test(O.location.pathname);
      if (!racine.hidden && !accueil) montrer(false);
      if (racine.hidden) bascule.hidden = false;
    }, 200);
    addEventListener("pcv-mii-base", relireSiens);
    window.__pcvPlace3D = {
      liberer: () => {
        arreterBoucle();
        masquerDessous(false);
        Q = null;
        removeEventListener("resize", retailler);
        removeEventListener("pcv-mii-base", relireSiens);
        if (surApparence) {
          removeEventListener("pcv-apparence", surApparence);
          surApparence = null;
        }
        for (const f of foule) oublier(f);
        foule = [];
        heros = [];
        for (const p of pages) p.cible.dispose();
        pages = [];
        brouillon?.dispose();
        if (rendu) {
          for (const s of [scene, copie]) s?.traverse((o) => {
            o.geometry?.dispose?.();
            if (o.material) {
              o.material.map?.dispose?.();
              o.material.dispose?.();
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
      // essais : arrêter le temps pour une capture
      etat: () => ({
        ouvert: !racine.hidden,
        intro: temps < introFin,
        e: +(temps - debut).toFixed(2),
        icones: icones.map((i) => i.nom),
        sel,
        zoom,
        foule: foule.length,
        budget: BUDGET.n,
        charge: BUDGET.ri ? +(BUDGET.ri / BUDGET.riMin).toFixed(2) : null,
        cpuMs: +BUDGET.cpu.toFixed(2),
        ecranMs: +BUDGET.riMin.toFixed(1),
        visibles: foule.filter((f) => f.m.objet.visible).length,
        vrais: foule.filter((f) => f.v).length,
        photos: foule.filter((f) => f.photo).length,
        refuses: foule.filter((f) => f.refuse).length,
        pages: pages.length,
        gpu: rendu ? { ...rendu.info.memory } : null,
        qualite: Q?.bilan ?? null,
        // géométries et textures vivantes : elles ne doivent pas grossir à force de zoomer
        pantalons: foule.reduce((o, f) => (o[f.qui.pantalon] = (o[f.qui.pantalon] || 0) + 1, o), {}),
        etats: foule.reduce((o, f) => (o[f.etat] = (o[f.etat] || 0) + 1, o), {})
      }),
      habitants: () => foule.map((f) => ({ cle: f.cle, nom: f.qui.nom, pantalon: f.qui.pantalon, heros: f.heros, vrai: !!f.v, photo: !!f.photo, taille: +f.taille.toFixed(2) })),
      reglages: REG,
      choisir,
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
      // ms par image (logique JS, envoi du rendu) ; depuis le dernier appel : paquets de photos (ms par image), vrais Mii créés (ms chacun)
      temps: () => {
        const moy = (x) => ({ n: x.n, ms: x.n ? +(x.ms / x.n).toFixed(1) : 0, max: +x.max.toFixed(1) });
        const r = {
          images: mesure.n,
          logique: +(mesure.logique / mesure.n).toFixed(2),
          rendu: +(mesure.rendu / mesure.n).toFixed(2),
          appels: rendu?.info.render.calls,
          triangles: rendu?.info.render.triangles,
          photos: moy(mesure.photos),
          creer: moy(mesure.creer)
        };
        mesure.n = mesure.logique = mesure.rendu = 0;
        mesure.photos = { n: 0, ms: 0, max: 0 };
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
