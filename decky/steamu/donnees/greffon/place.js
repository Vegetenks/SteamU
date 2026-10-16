(() => {
  document.getElementById("pcv-place")?.remove();
  document.getElementById("pcv-bascule")?.remove();
  if (window.__pcvToucheY) window.removeEventListener("keydown", window.__pcvToucheY, true);
  clearInterval(window.__pcvPlaceSuivi);
  clearInterval(window.__pcvPlaceHeure);
  const T = window.__pcvT || ((c) => c);
  const O = window.opener;
  const IMG = (id, f) => `https://steamloopback.host/assets/${id}/${f}`;
  const CDN = (id, f) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${id}/${f}`;
  const u = (n) => `calc(var(--u) * ${n})`;
  const TR = {
    amis: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.2 5 2.6 5 5.8"/>',
    boutique: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    reglages: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    medias: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
    telech: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
    bulle: '<path d="M4 5h16v11H9l-5 4z"/>',
    accueil: '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>'
  };
  const svg = (n, t, c, ep = 2.4) => `<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${ep}" stroke-linecap="round" stroke-linejoin="round">${TR[n]}</svg>`;
  const toucheHaut = () => {
    const [, c, h] = window.__pcvTouche?.(4) || ["Y", "#e0a100", "Y"];
    return [h, c];
  };
  const jeux = (O.appStore.allApps || []).filter((a) => (a.app_type === 1 || a.app_type === 1073741824) && a.rt_last_time_played).sort((a, b) => b.rt_last_time_played - a.rt_last_time_played).slice(0, 4);
  const avatarDe = () => document.querySelector("#header_profile img")?.src || (() => {
    try {
      const p = window.opener.g_FriendsUIApp.FriendStore.self.persona;
      return p.avatar_url_full || p.avatar_url_medium || "";
    } catch (e) {
      return "";
    }
  })();
  const avatar = avatarDe();
  const echap = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
  const urlSure = (v) => {
    const s = String(v ?? "").trim(), t = s.replace(/[\x00-\x20]/g, "");
    return echap(!/^[a-z][a-z0-9+.-]*:/i.test(t) || /^(https?:|data:image\/|blob:)/i.test(t) ? s : "");
  };
  const jaq = (a) => `<span class="jaq" style="background-image:url('${IMG(a.appid, "library_600x900.jpg")}'),url('${CDN(a.appid, "library_600x900.jpg")}')"></span>`;
  const appli = (n, c) => `<span class="appli">${svg(n, "46%", c)}</span>`;
  const ICONES = [];
  const APPS = [
    ["amis", "#2fbf71", "amis", T("spaces.amis.nom"), "#2fbf71"],
    ["boutique", "#ff8a1f", "magasin", T("spaces.boutique.nom"), "#ff8a1f"],
    ["medias", "#2a8cff", "medias", T("place.mediatheque"), "#2a8cff"],
    ["reglages", "#8b9098", "parametres", T("spaces.parametres.nom"), "#8b9098"]
  ];
  for (let i = 0; i < 4; i++) {
    if (jeux[i]) ICONES.push({ contenu: jaq(jeux[i]), action: `jeu:${jeux[i].appid}`, nom: jeux[i].display_name });
    const [ic, c, act, nom] = APPS[i];
    ICONES.push({ contenu: appli(ic, c), action: act, nom });
  }
  const CX = 640, CY = 455, RX = 470, RY = 175;
  const position = (k) => {
    const a = Math.PI / 2 + k * 2 * Math.PI / ICONES.length;
    return [CX + RX * Math.cos(a), CY + RY * Math.sin(a), (Math.sin(a) + 1) / 2];
  };
  const elements = [];
  ICONES.forEach((ic, k) => {
    const [x, y, prof] = position(k), t = 92 + 46 * prof;
    ic.pos = [x, y - 60];
    elements.push([y + t * 0.1, `<button class="ico" data-k="${k}" data-action="${ic.action}" style="left:${u(x - t / 2)};top:${u(y - t - 30)};width:${u(t)};height:${u(t)};--t:${u(t)}">
      <span class="cadre">${ic.contenu}</span><span class="nom">${echap(ic.nom)}</span></button>`]);
  });
  elements.sort((a, b) => a[0] - b[0]);
  const dock = [
    ["amis", "#2fbf71", "amis", T("spaces.amis.nom")],
    ["boutique", "#ff8a1f", "magasin", T("spaces.boutique.nom")],
    ["globe", "#2a6fe0", "magasin", T("place.internet")],
    ["bulle", "#19b8d6", "amis", T("place.discussions")],
    ["medias", "#2a8cff", "medias", T("place.mediatheque")],
    ["telech", "#8a63ff", "telechargements", T("barre.telechargements")],
    ["reglages", "#8b9098", "parametres", T("spaces.parametres.nom")]
  ].map(([n, c, a, t]) => `<button class="dock-btn" data-action="${a}" data-pcv-nom="${t}">${svg(n, "56%", c, 2.3)}</button>`).join("");
  const [gl, glc] = toucheHaut();
  const racine = document.createElement("div");
  racine.id = "pcv-place";
  racine.hidden = true;
  racine.innerHTML = `<style>
    #pcv-place { position: fixed; inset: 0; z-index: 9200; overflow: hidden; font-family: var(--pcv-police); color: var(--pcv-texte);
      background: radial-gradient(120% 70% at 50% 85%, var(--pcv-fond-base)); animation: pcvEntree .45s cubic-bezier(.2,.8,.2,1); }
    #pcv-place[hidden] { display: none; }
    @keyframes pcvEntree { from { opacity: 0; transform: scale(.97) } to { opacity: 1; transform: none } }
    #pcv-place button { all: unset; cursor: pointer; box-sizing: border-box; }
    #pcv-place .monde { position: absolute; left: 0; top: 0; width: ${u(1280)}; height: ${u(800)}; transform-origin: 0 0; transition: transform .7s cubic-bezier(.25,.8,.25,1); }
    #pcv-place .sol { position: absolute; left: ${u(-900)}; right: ${u(-900)}; top: ${u(250)}; height: ${u(1400)}; transform: perspective(${u(800)}) rotateX(64deg); transform-origin: top center;
      background: repeating-linear-gradient(90deg, var(--pcv-filet) 0 2px, transparent 2px ${u(70)}), repeating-linear-gradient(0deg, var(--pcv-filet) 0 2px, transparent 2px ${u(70)});
      -webkit-mask: linear-gradient(180deg, transparent, #000 25%); }
    #pcv-place .anneau { position: absolute; left: ${u(170)}; top: ${u(280)}; width: ${u(940)}; height: ${u(350)}; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--pcv-anneau-c) 70%, transparent), transparent); }
    #pcv-place .ico { position: absolute; border-radius: calc(var(--t) * .24); background: linear-gradient(160deg, color-mix(in srgb, var(--pcv-carte) 95%, transparent), color-mix(in srgb, var(--pcv-creux) 85%, transparent));
      box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 -4px 8px rgba(150,170,195,.35), 0 calc(var(--t) * .16) calc(var(--t) * .22) rgba(70,95,130,.22); transition: box-shadow .12s, transform .12s; }
    #pcv-place .cadre { position: absolute; inset: calc(var(--t) * .07); border-radius: calc(var(--t) * .18); overflow: hidden; }
    #pcv-place .cadre::after { content: ""; position: absolute; inset: 0 0 55% 0; background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0)); }
    #pcv-place .jaq { display: block; width: 100%; height: 100%; background: var(--pcv-creux) center 15% / cover; }
    #pcv-place .appli { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; background: var(--pcv-carte); }
    #pcv-place .ico.sel { z-index: 50; transform: translateY(${u(-4)}); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} rgba(47,184,255,.2), 0 ${u(16)} ${u(30)} rgba(47,184,255,.4); }
    #pcv-place .ico .nom { position: absolute; left: 50%; top: calc(100% + ${u(14)}); transform: translateX(-50%); padding: ${u(5)} ${u(14)}; border-radius: ${u(14)};
      background: var(--pcv-bulle); color: var(--pcv-sur-accent); font-size: ${u(15)}; font-weight: 900; white-space: nowrap; opacity: 0; transition: opacity .15s; pointer-events: none; }
    #pcv-place .ico .nom::before { content: ""; position: absolute; left: 50%; top: ${u(-6)}; margin-left: ${u(-6)}; border: ${u(6)} solid transparent; border-top: 0; border-bottom-color: var(--pcv-bulle); }
    #pcv-place .ico.sel .nom { opacity: 1; }
    #pcv-place .v { position: absolute; background: linear-gradient(180deg,var(--pcv-carte),var(--pcv-creux)); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 0 0 1px var(--pcv-bord), 0 ${u(6)} ${u(18)} rgb(var(--pcv-ombre-rgb) / .13); }
    #pcv-place .haut-avatar { left: ${u(24)}; top: ${u(20)}; width: ${u(56)}; height: ${u(56)}; border-radius: 50%; padding: ${u(6)}; }
    #pcv-place .haut-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
    #pcv-place .retour { left: 50%; top: ${u(20)}; transform: translateX(-50%); height: ${u(52)}; border-radius: ${u(26)}; padding: 0 ${u(10)} 0 ${u(6)}; display: flex; align-items: center; gap: ${u(12)}; font-weight: 900; font-size: ${u(17)}; }
    #pcv-place .retour .p { width: ${u(40)}; height: ${u(40)}; border-radius: 50%; background: var(--pcv-carte); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); }
    #pcv-place .gl { width: ${u(30)}; height: ${u(30)}; border-radius: 50%; background: var(--pcv-carte); display: flex; align-items: center; justify-content: center; font-size: ${u(15)}; box-shadow: inset 0 -2px 0 rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.15); }
    #pcv-place .etat { right: ${u(24)}; top: ${u(20)}; height: ${u(52)}; border-radius: ${u(26)}; padding: 0 ${u(20)}; display: flex; align-items: center; gap: ${u(14)}; font-weight: 900; font-size: ${u(16)}; }
    #pcv-place .zoom { left: ${u(24)}; bottom: ${u(22)}; display: flex; align-items: center; gap: ${u(10)}; padding: ${u(8)} ${u(12)}; border-radius: ${u(26)}; z-index: 5; }
    #pcv-place .zoom button { width: ${u(38)}; height: ${u(38)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${u(22)}; font-weight: 900; color: var(--pcv-texte2);
      background: linear-gradient(180deg,var(--pcv-carte),var(--pcv-creux)); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 2px 6px rgb(var(--pcv-ombre-rgb) / .18); }
    #pcv-place .zoom .pt { width: ${u(12)}; height: ${u(12)}; border-radius: 50%; background: var(--pcv-creux); transition: background .2s, box-shadow .2s; }
    #pcv-place .zoom .pt.on { background: var(--pcv-cyan-plein); box-shadow: 0 0 0 ${u(3)} rgba(47,184,255,.25); }
    #pcv-place .dock { left: 50%; transform: translateX(-50%); bottom: ${u(20)}; padding: ${u(10)} ${u(14)}; border-radius: ${u(28)}; display: flex; gap: ${u(12)}; z-index: 5;
      background: color-mix(in srgb, var(--pcv-carte) 65%, transparent); backdrop-filter: blur(12px); }
    #pcv-place .dock-btn { width: ${u(60)}; height: ${u(60)}; border-radius: ${u(18)}; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(180deg, var(--pcv-carte), var(--pcv-creux)); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 -3px 0 rgba(150,170,195,.3), 0 ${u(6)} ${u(14)} rgba(70,95,130,.18); }
    #pcv-place .voile { position: absolute; inset: 0; background: var(--pcv-voile); backdrop-filter: blur(3px); z-index: 8; }
    #pcv-place .carte { left: 50%; top: 50%; transform: translate(-50%,-50%); width: ${u(640)}; border-radius: ${u(34)}; padding: ${u(26)} ${u(28)}; box-sizing: border-box; z-index: 9; display: flex; flex-direction: column; gap: ${u(18)}; }
    #pcv-place .carte .msg { border-radius: ${u(24)}; padding: ${u(16)}; display: flex; align-items: center; gap: ${u(16)}; font-size: ${u(20)}; font-weight: 800; line-height: 1.3; }
    #pcv-place .carte .msg img { width: ${u(76)}; height: ${u(76)}; border-radius: ${u(18)}; box-shadow: 0 0 0 ${u(4)} var(--pcv-lisere), 0 4px 10px rgba(0,0,0,.15); object-fit: cover; }
    #pcv-place .carte .actions { display: flex; gap: ${u(12)}; }
    #pcv-place .carte .actions button { flex: 1; text-align: center; padding: ${u(14)} 0; border-radius: ${u(24)}; font-size: ${u(17)}; font-weight: 900;
      background: linear-gradient(180deg,var(--pcv-carte),var(--pcv-creux)); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 ${u(4)} ${u(12)} rgb(var(--pcv-ombre-rgb) / .15); }
    #pcv-place .carte .actions button.cyan { background: var(--pcv-cyan); color: var(--pcv-sur-accent);
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 ${u(8)} ${u(20)} rgba(26,154,230,.35); }
    #pcv-bascule { all: unset; position: fixed; z-index: 9050; top: ${u(20)}; left: ${u(222)}; width: ${u(56)}; height: ${u(56)}; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center; background: var(--pcv-verre);
      box-shadow: var(--pcv-reflet), var(--pcv-ombre); }   
    #pcv-bascule i { width: ${u(40)}; height: ${u(40)}; border-radius: 50%; background: var(--pcv-pastille, #fff); box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); display: flex; align-items: center; justify-content: center; }
    #pcv-bascule[hidden] { display: none; }
  </style>
  <div class="monde"><div class="sol"></div><div class="anneau"></div>${elements.map((e) => e[1]).join("")}</div>
  <div class="v haut-avatar"><img data-pcv-avatar src="${urlSure(avatar)}" alt=""></div>
  <button class="v retour" data-pcv-nom="${T("place.revenir_accueil")}"><span class="p">${svg("accueil", "55%", "#1a9ae6")}</span>${T("spaces.accueil.nom")}<span class="gl" style="background:${glc};color:var(--pcv-sur-accent)">${gl}</span></button>
  <div class="v etat"><svg style="width:${u(20)};height:${u(20)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2.5 8.5a14 14 0 0 1 19 0"/><path d="M5.5 12a9.5 9.5 0 0 1 13 0"/><path d="M8.7 15.4a5 5 0 0 1 6.6 0"/><circle cx="12" cy="19" r="1"/></svg><span class="heure"></span></div>
  <div class="v zoom"><button class="moins" data-pcv-nom="${T("place.eloigner")}">\u2212</button><i class="pt"></i><i class="pt"></i><i class="pt"></i><i class="pt"></i><button class="plus" data-pcv-nom="${T("place.rapprocher")}">+</button></div>
  <div class="v dock">${dock}</div>
  <div class="carte-zone"></div>`;
  document.body.appendChild(racine);
  const bascule = document.createElement("button");
  bascule.id = "pcv-bascule";
  bascule.dataset.pcvNom = T("spaces.place.nom");
  bascule.setAttribute("aria-label", T("spaces.place.nom"));
  bascule.innerHTML = "<i></i>";
  document.body.appendChild(bascule);
  const ZOOMS = [1, 1.4, 1.9, 2.5];
  let sel = 0, zoom = 0;
  const monde = racine.querySelector(".monde"), icos = [...racine.querySelectorAll(".ico")], pts = [...racine.querySelectorAll(".zoom .pt")];
  const camera = () => {
    const z = ZOOMS[zoom], p = ICONES[sel].pos, tx = zoom ? 640 - p[0] * z : 0, ty = zoom ? 430 - p[1] * z : 0;
    monde.style.transform = `translate(${u(tx)}, ${u(ty)}) scale(${z})`;
    icos.forEach((b) => b.classList.toggle("sel", +b.dataset.k === sel));
    pts.forEach((p2, i) => p2.classList.toggle("on", i <= zoom));
  };
  const choisir = (k) => {
    sel = (k + ICONES.length) % ICONES.length;
    camera();
  };
  const zoomer = (d) => {
    zoom = Math.max(0, Math.min(3, zoom + d));
    camera();
  };
  racine.querySelector(".moins").onclick = (e) => {
    e.stopPropagation();
    zoomer(-1);
  };
  racine.querySelector(".plus").onclick = (e) => {
    e.stopPropagation();
    zoomer(1);
  };
  camera();
  const ACTIONS = {
    amis: () => window.__pcvAmisMontrer?.(true),
    magasin: () => O.__pcvAller?.(3),
    medias: () => O.__pcvAller?.(5),
    telechargements: () => O.__pcvAller?.(6),
    parametres: () => O.__pcvAller?.(7)
  };
  const ouvrir = (a) => {
    montrer(false);
    if (a.startsWith("jeu:")) O.SteamClient.URL.ExecuteSteamURL(`steam://nav/games/details/${a.slice(4)}`);
    else ACTIONS[a]?.();
  };
  const heure = () => {
    racine.querySelector(".heure").textContent = (/* @__PURE__ */ new Date()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };
  heure();
  window.__pcvPlaceHeure = setInterval(() => {
    heure();
    const a = avatarDe();
    if (a) racine.querySelectorAll("[data-pcv-avatar]").forEach((i) => {
      if (i.src !== a) i.src = a;
    });
  }, 3e3);
  const majTouche = () => {
    const e = racine.querySelector(".gl"), [h, c] = toucheHaut();
    if (e && e.innerHTML !== h) e.innerHTML = h;
    if (e) e.style.background = c;
  };
  const montrer = (oui) => {
    racine.hidden = !oui;
    bascule.hidden = oui;
    if (oui) {
      majTouche();
      camera();
    }
  };
  window.__pcvPlaceMontrer = montrer;
  racine.addEventListener("click", (e) => {
    const ico = e.target.closest(".ico");
    if (ico) {
      const k = +ico.dataset.k;
      if (k === sel && zoom) ouvrir(ico.dataset.action);
      else {
        sel = k;
        zoom = Math.max(1, zoom);
        camera();
      }
      return;
    }
    const b = e.target.closest(".dock-btn");
    if (b) ouvrir(b.dataset.action);
  });
  racine.querySelector(".retour").onclick = () => montrer(false);
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
    else if (k === "ArrowLeft") choisir(sel + 1);
    else if (k === "ArrowRight") choisir(sel - 1);
    else if (k === "-" || k === "PageUp") zoomer(-1);
    else if (k === "+" || k === "=" || k === "PageDown") zoomer(1);
    else if (k === "Enter") ouvrir(ICONES[sel].action);
    else if (k === "Escape") {
      const z = racine.querySelector(".carte-zone");
      if (z.innerHTML) z.innerHTML = "";
      else montrer(false);
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
    const z = racine.querySelector(".carte-zone");
    if (b === 11) choisir(sel + 1);
    else if (b === 12) choisir(sel - 1);
    else if (b === 5 || b === 7) zoomer(-1);
    else if (b === 6 || b === 8) zoomer(1);
    else if (b === 1) {
      if (z.innerHTML) z.querySelector("[data-fiche]")?.click();
      else if (zoom) ouvrir(ICONES[sel].action);
      else zoomer(1);
    } else if (b === 2) {
      if (z.innerHTML) z.innerHTML = "";
      else montrer(false);
    }
    return true;
  };
  window.__pcvPlaceSuivi = setInterval(() => {
    const accueil = /^\/routes\/library\/home/.test(O.location.pathname);
    if (!racine.hidden && !accueil) montrer(false);
    if (racine.hidden) bascule.hidden = false;
  }, 200);
  montrer(false);
  return "place pr\xEAte";
})();
