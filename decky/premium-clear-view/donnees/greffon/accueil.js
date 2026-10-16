(() => {
  document.getElementById("pcv-accueil")?.remove();
  clearInterval(window.__pcvAccueil);
  if (window.__pcvTouchesAccueil) window.removeEventListener("keydown", window.__pcvTouchesAccueil, true);
  const T = window.__pcvT || ((c) => c);
  const O = window.opener;
  const IMG = (id, f) => `https://steamloopback.host/assets/${id}/${f}`;
  const CDN = (id, f) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${id}/${f}`;
  const h = (min) => min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
  const jour = (rt) => new Date(rt * 1e3).toLocaleDateString(window.__pcvLocale?.() || "fr-FR", { day: "numeric", month: "short" });
  const ilya = (rt) => {
    const j = Math.floor((Date.now() / 1e3 - rt) / 86400);
    return j <= 0 ? T("accueil.aujourdhui") : j === 1 ? T("accueil.hier") : T("accueil.jours", { n: j });
  };
  const avatarDe = () => document.querySelector("#header_profile img")?.src || (() => {
    try {
      const p = window.opener.g_FriendsUIApp.FriendStore.self.persona;
      return p.avatar_url_full || p.avatar_url_medium || "";
    } catch (e) {
      return "";
    }
  })();
  const avatar = avatarDe();
  const racine = document.createElement("div");
  racine.id = "pcv-accueil";
  racine.innerHTML = `<style>
    #pcv-accueil { position: fixed; inset: calc(var(--u) * 98) 0 0 0; z-index: 8500; font-family: var(--pcv-police); color: var(--pcv-texte);
      background: var(--pcv-fond-page); }
    #pcv-accueil[hidden] { display: none; }
    #pcv-accueil * { box-sizing: border-box; }
    #pcv-accueil .rang { position: absolute; left: calc(var(--u) * 44); top: calc(var(--u) * 6); display: flex; align-items: flex-start; gap: calc(var(--u) * 18); }
    #pcv-accueil .jaq { position: relative; flex: none; width: calc(var(--u) * 90); height: calc(var(--u) * 135); border-radius: calc(var(--u) * 18); overflow: hidden; cursor: pointer;
      background: var(--pcv-creux) center / cover; box-shadow: 0 0 0 calc(var(--u) * 4) var(--pcv-lisere), 0 calc(var(--u) * 10) calc(var(--u) * 22) rgba(0,0,0,.30);
      animation: pcvPose .25s ease-out both; }
    #pcv-accueil .jaq.tout { background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--u) * 10); }
    #pcv-accueil .jaq.tout .pt { width: calc(var(--u) * 52); height: calc(var(--u) * 52); border-radius: 50%; background: var(--pcv-pastille); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); }
    #pcv-accueil .jaq.tout .pt i { width: calc(var(--u) * 26); height: calc(var(--u) * 26); background: #2a8cff;
      -webkit-mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23000%22%20stroke-width%3D%222.2%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%224%22%20y%3D%224%22%20width%3D%227%22%20height%3D%227%22%20rx%3D%222%22/%3E%3Crect%20x%3D%2213%22%20y%3D%224%22%20width%3D%227%22%20height%3D%227%22%20rx%3D%222%22/%3E%3Crect%20x%3D%224%22%20y%3D%2213%22%20width%3D%227%22%20height%3D%227%22%20rx%3D%222%22/%3E%3Crect%20x%3D%2213%22%20y%3D%2213%22%20width%3D%227%22%20height%3D%227%22%20rx%3D%222%22/%3E%3C/svg%3E") center / contain no-repeat; }
    #pcv-accueil .jaq.tout b { font: 900 calc(var(--u) * 13) var(--pcv-police); color: var(--pcv-texte); }
    #pcv-accueil .jaq.sel { width: calc(var(--u) * 108); height: calc(var(--u) * 162); transform: translateY(calc(var(--u) * -4));
      box-shadow: 0 0 0 calc(var(--u) * 4) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * 9) var(--pcv-cyan-plein), 0 0 0 calc(var(--u) * 17) rgba(47,184,255,.22), 0 calc(var(--u) * 16) calc(var(--u) * 34) rgba(47,184,255,.45); }
    @keyframes pcvPose { from { opacity: 0 } to { opacity: 1 } }
    #pcv-accueil .bulle { position: absolute; z-index: 3; display: flex; align-items: center; gap: calc(var(--u) * 10); padding: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 10) calc(var(--u) * 10);
      border-radius: calc(var(--u) * 22); background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: calc(var(--u) * 15); font-weight: 800; white-space: nowrap; max-width: calc(var(--u) * 360);
      animation: pcvBulle .3s ease-out both; }
    #pcv-accueil .bulle > span { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
    #pcv-accueil .bulle small { display: block; font-size: calc(var(--u) * 12); font-weight: 700; color: var(--pcv-texte2); }
    #pcv-accueil .bulle img { width: calc(var(--u) * 36); height: calc(var(--u) * 36); border-radius: calc(var(--u) * 10); }
    #pcv-accueil .bulle .mii { width: calc(var(--u) * 38); height: calc(var(--u) * 38); border-radius: 50%; }
    #pcv-accueil .bulle::after { content: ""; position: absolute; width: calc(var(--u) * 18); height: calc(var(--u) * 18); background: var(--pcv-carte); transform: rotate(45deg); border-radius: 3px; }
    #pcv-accueil .bulle.haut::after { top: calc(var(--u) * -8); left: calc(var(--u) * 34); }
    #pcv-accueil .bulle.gauche::after { left: calc(var(--u) * -8); top: 50%; margin-top: calc(var(--u) * -9); }
    @keyframes pcvBulle { 0% { opacity: 0; transform: scale(.5) } 70% { opacity: 1; transform: scale(1.04) } 100% { transform: scale(1) } }
    #pcv-accueil .banniere { position: absolute; left: calc(var(--u) * 24); right: calc(var(--u) * 24); top: calc(var(--u) * 202); height: calc(var(--u) * 250);
      border-radius: calc(var(--u) * 30); overflow: hidden; background: #222 center 40% / cover; box-shadow: 0 0 0 calc(var(--u) * 5) var(--pcv-lisere), 0 calc(var(--u) * 14) calc(var(--u) * 34) rgb(var(--pcv-ombre-rgb) / .22);
      animation: pcvPose .2s ease-out both; }
    #pcv-accueil .banniere::before { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,0) 60%); }
    #pcv-accueil .logo { position: absolute; left: calc(var(--u) * 36); top: calc(var(--u) * 52); width: calc(var(--u) * 300); height: calc(var(--u) * 110); object-fit: contain; object-position: left bottom; }
    #pcv-accueil .logo-texte { position: absolute; left: calc(var(--u) * 36); top: calc(var(--u) * 92); color: #fff; font-size: calc(var(--u) * 34); font-weight: 900; text-shadow: 0 2px 10px rgba(0,0,0,.5); }
    #pcv-accueil .action { position: absolute; left: calc(var(--u) * 40); top: calc(var(--u) * 182); display: flex; align-items: center; gap: calc(var(--u) * 12); color: #fff; }
    #pcv-accueil button { all: unset; cursor: pointer; }
    #pcv-accueil .jouer { height: calc(var(--u) * 52); padding: 0 calc(var(--u) * 38); border-radius: calc(var(--u) * 26); background: var(--pcv-cyan); color: var(--pcv-sur-accent);
      font-size: calc(var(--u) * 18); font-weight: 900; line-height: calc(var(--u) * 52);
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 calc(var(--u) * 8) calc(var(--u) * 20) rgba(26,154,230,.45); }
    #pcv-accueil .meta { font-size: calc(var(--u) * 15); font-weight: 800; text-shadow: 0 1px 6px rgba(0,0,0,.5); }
    #pcv-accueil .cartes { position: absolute; left: calc(var(--u) * 24); right: calc(var(--u) * 24); top: calc(var(--u) * 486); display: flex; gap: calc(var(--u) * 16); }
    #pcv-accueil .carte { position: relative; flex: 1; height: calc(var(--u) * 170); border-radius: calc(var(--u) * 30); overflow: hidden; background: var(--pcv-verre);
      box-shadow: var(--pcv-reflet), var(--pcv-ombre); display: flex; align-items: center; gap: calc(var(--u) * 16); padding: 0 calc(var(--u) * 22); cursor: pointer;
      animation: pcvPose .25s ease-out both; }
    #pcv-accueil .carte.image { padding: 0; background: #222 70% 40% / cover; }
    #pcv-accueil .carte .etiquette { position: absolute; left: calc(var(--u) * 14); bottom: calc(var(--u) * 14); padding: calc(var(--u) * 8) calc(var(--u) * 14); border-radius: calc(var(--u) * 18);
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: calc(var(--u) * 15); font-weight: 900; }
    #pcv-accueil .carte b { display: block; font-size: calc(var(--u) * 18); font-weight: 900; }
    #pcv-accueil .carte small { display: block; font-size: calc(var(--u) * 14); font-weight: 700; color: var(--pcv-texte2); }
    #pcv-accueil .carte .vign { width: calc(var(--u) * 76); height: calc(var(--u) * 76); border-radius: calc(var(--u) * 18); box-shadow: 0 0 0 calc(var(--u) * 3) var(--pcv-lisere); object-fit: cover; flex: none; }
    #pcv-accueil .carte .port { width: calc(var(--u) * 52); height: calc(var(--u) * 78); border-radius: calc(var(--u) * 10); box-shadow: 0 0 0 calc(var(--u) * 3) var(--pcv-lisere); object-fit: cover; flex: none; }
    #pcv-accueil .piste { display: block; margin-top: calc(var(--u) * 10); width: calc(var(--u) * 180); height: calc(var(--u) * 8); border-radius: calc(var(--u) * 4); background: var(--pcv-filet); overflow: hidden; }
    #pcv-accueil .piste i { display: block; height: 100%; background: var(--pcv-cyan-plein); }
  </style><div class="rang"></div><div class="zone"></div>`;
  document.body.appendChild(racine);
  window.__pcvFond?.(racine);
  const rang = racine.querySelector(".rang"), zone = racine.querySelector(".zone");
  const jeux = () => (O.appStore.allApps || []).filter((a) => a.app_type === 1 && a.rt_last_time_played).sort((a, b) => b.rt_last_time_played - a.rt_last_time_played).slice(0, 10);
  const succes = async (id) => {
    try {
      const r = await O.SteamClient.Apps.GetMyAchievementsForApp(String(id));
      const d = (typeof r === "string" ? JSON.parse(r) : r).data.rgAchievements;
      return { total: d.length, obtenus: d.filter((a) => a.bAchieved).sort((a, b) => b.rtUnlocked - a.rtUnlocked) };
    } catch (e) {
      return { total: 0, obtenus: [] };
    }
  };
  let liste = [], choix = 0;
  const afficher = async () => {
    const app = liste[choix];
    if (!app) return;
    [...rang.children].forEach((e, i) => e.classList.toggle("sel", i === choix));
    const s = await succes(app.appid);
    if (liste[choix] !== app) return;
    const installe = app.per_client_data?.some?.((c) => c.installed) ?? app.installed;
    const plusJoue = (O.appStore.allApps || []).filter((a) => a.app_type === 1).sort((a, b) => b.minutes_playtime_forever - a.minutes_playtime_forever)[0];
    const dernier = s.obtenus[0], avant = s.obtenus[1];
    const deuxSem = app.minutes_playtime_last_two_weeks || 0;
    const jaq = rang.children[choix].getBoundingClientRect(), u = innerHeight / 800;
    zone.innerHTML = `
      ${dernier ? `<div class="bulle haut" style="left:${jaq.left - 4 * u}px;top:${jaq.bottom + 18 * u - 98 * u}px"><img src="${urlSure(dernier.strImage)}" alt=""><span>${T("accueil.obtenu", { nom: echap(joli(dernier.strName)) })}<small>${ilya(dernier.rtUnlocked)}</small></span></div>` : ""}
      <div class="banniere" style="background-image:url('${IMG(app.appid, "library_hero.jpg")}'),url('${CDN(app.appid, "library_hero.jpg")}')">
        <img class="logo" src="${IMG(app.appid, "logo.png")}" alt="${echap(app.display_name)}" data-cdn="${CDN(app.appid, "logo.png")}" onerror="if(this.dataset.cdn){this.src=this.dataset.cdn;this.dataset.cdn=''}else{const d=document.createElement('div');d.className='logo-texte';d.textContent=this.alt;this.replaceWith(d)}">
        <div class="action"><button class="jouer">${installe ? T("accueil.jouer") : T("accueil.installer")}</button>
          <span class="meta">${T("accueil.temps_dernier", { temps: h(app.minutes_playtime_forever), date: jour(app.rt_last_time_played) })}</span></div>
      </div>
      ${deuxSem ? `<div class="bulle gauche" style="right:calc(var(--u)*70);top:calc(var(--u)*274)"><img class="mii" src="${urlSure(avatarDe())}" alt=""><span>${T("accueil.deux_semaines", { temps: h(deuxSem) })}</span></div>` : ""}
      ${avant ? `<div class="bulle gauche" style="right:calc(var(--u)*40);top:calc(var(--u)*352);animation-delay:.15s"><img src="${urlSure(avant.strImage)}" alt=""><span>${echap(joli(avant.strName))}<small>${ilya(avant.rtUnlocked)}</small></span></div>` : ""}
      <div class="cartes">
        <div class="carte image" data-ouvrir="${app.appid}" style="background-image:url('${IMG(app.appid, "library_hero.jpg")}'),url('${CDN(app.appid, "library_hero.jpg")}')"><span class="etiquette">${T("accueil.reprendre", { nom: echap(app.display_name) })}</span></div>
        ${s.total ? `<div class="carte" data-ouvrir="${app.appid}">${dernier ? `<img class="vign" src="${urlSure(dernier.strImage)}" alt="">` : ""}
          <span><b>${T("accueil.succes_compte", { obtenus: s.obtenus.length, total: s.total })}</b><small>${echap(app.display_name)}</small>
          <span class="piste"><i style="width:${(100 * s.obtenus.length / s.total).toFixed(1)}%"></i></span></span></div>` : `<div class="carte" data-ouvrir="${app.appid}"><span><b>${T("accueil.pas_succes")}</b><small>${T("accueil.pas_succes_detail", { nom: echap(app.display_name) })}</small></span></div>`}
        ${plusJoue ? `<div class="carte" data-ouvrir="${plusJoue.appid}"><img class="port" src="${IMG(plusJoue.appid, "library_600x900.jpg")}" alt="">
          <span><b>${echap(plusJoue.display_name)}</b><small>${T("accueil.temps_dernier", { temps: Math.round(plusJoue.minutes_playtime_forever / 60) + " h", date: jour(plusJoue.rt_last_time_played) })}</small></span></div>` : ""}
      </div>`;
    zone.querySelector(".jouer").onclick = () => ouvrir(app.appid);
    zone.querySelectorAll("[data-ouvrir]").forEach((c) => c.onclick = () => ouvrir(c.dataset.ouvrir));
  };
  const joli = (t) => t && t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t;
  const echap = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const urlSure = (u) => {
    const s = String(u ?? "").trim(), t = s.replace(/[\x00-\x20]/g, "");
    return echap(!/^[a-z][a-z0-9+.-]*:/i.test(t) || /^(https?:|data:image\/|blob:)/i.test(t) ? s : "");
  };
  const ouvrir = (id) => O.SteamClient.URL.ExecuteSteamURL(`steam://nav/games/details/${id}`);
  const choisir = (i) => {
    choix = Math.max(0, Math.min(liste.length - 1, i));
    afficher();
  };
  const construire = () => {
    liste = jeux();
    rang.innerHTML = "";
    const ordre = liste.map((_, i) => i).sort(() => Math.random() - 0.5);
    liste.forEach((a, i) => {
      const d = document.createElement("div");
      d.className = "jaq";
      d.dataset.pcvNom = a.display_name;
      let vert = "";
      try {
        vert = O.appStore.GetVerticalCapsuleURLForApp(a) || "";
      } catch (e) {
      }
      d.style.backgroundImage = [IMG(a.appid, "library_600x900.jpg"), vert, CDN(a.appid, "library_600x900.jpg")].filter(Boolean).map((x) => `url('${String(x).replace(/['\\\n\r]/g, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))}')`).join(",");
      d.style.animationDelay = 0.35 + ordre.indexOf(i) * 0.12 + "s";
      d.onclick = () => choix === i ? ouvrir(a.appid) : choisir(i);
      rang.appendChild(d);
    });
    const tout = document.createElement("div");
    tout.className = "jaq tout";
    tout.dataset.pcvNom = T("accueil.toute_bibliotheque");
    tout.innerHTML = `<span class="pt"><i></i></span><b>${T("spaces.bibliotheque.nom")}</b>`;
    tout.style.animationDelay = 0.35 + liste.length * 0.12 + "s";
    tout.onclick = () => O.__pcvAller?.(2);
    rang.appendChild(tout);
    choisir(0);
  };
  const ouvert = (id) => {
    const e = document.getElementById(id);
    return !!e && !e.hidden;
  };
  (window.__pcvManette ||= {}).accueil = (b) => {
    if (racine.hidden || ouvert("pcv-place")) return false;
    const dansBarre = !!document.querySelector("#header .gpfocus") || document.body.classList.contains("pcv-barre-nav");
    if (dansBarre) {
      if (b === 10 && !document.body.classList.contains("pcv-barre-nav")) {
        document.body.classList.add("pcv-zone-jaquettes");
        window.__pcvZone = "jaquettes";
        afficher();
        return true;
      }
      if (window.__pcvZone !== "jaquettes") return false;
    }
    if (window.__pcvZone !== "jaquettes") {
      window.__pcvZone = "jaquettes";
      document.body.classList.add("pcv-zone-jaquettes");
      afficher();
    }
    if (b === 9) {
      window.__pcvZone = "barre";
      document.body.classList.remove("pcv-zone-jaquettes");
      const l = document.querySelector("#header ._17M8gvakqjyaw_cLo6ntdl, #header [class*=SearchAndTitleContainer]");
      const n = window.__pcvNoeud?.(l?.querySelector(".Focusable") || l);
      if (n) n.BTakeFocus(4);
      afficher();
      return true;
    }
    if (b === 10) return true;
    const tout = rang.querySelector(".tout");
    if (b === 11) {
      if (tout?.classList.contains("sel")) {
        tout.classList.remove("sel");
        choisir(choix);
      } else choisir(choix - 1);
      return true;
    }
    if (b === 12) {
      if (choix === liste.length - 1 && tout) {
        rang.querySelectorAll(".jaq.sel").forEach((j) => j.classList.remove("sel"));
        tout.classList.add("sel");
      } else choisir(choix + 1);
      return true;
    }
    if (b === 1) {
      if (tout?.classList.contains("sel")) O.__pcvAller?.(2);
      else ouvrir(liste[choix].appid);
      return true;
    }
    return false;
  };
  window.addEventListener("keydown", window.__pcvTouchesAccueil = (e) => {
    if (racine.hidden || document.activeElement?.matches?.("input,textarea") || ["pcv-place", "pcv-profil", "pcv-amis", "pcv-notifs", "pcv-connexion"].some(ouvert) || document.querySelector(".pcv-panneau.on, #pcv-themes.on")) return;
    if (e.key === "ArrowRight") {
      choisir(choix + 1);
      e.stopPropagation();
    }
    if (e.key === "ArrowLeft") {
      choisir(choix - 1);
      e.stopPropagation();
    }
    if (e.key === "Enter") {
      ouvrir(liste[choix].appid);
      e.stopPropagation();
    }
  }, true);
  let etaitVisible = false;
  window.__pcvAccueil = setInterval(() => {
    let nouvelle = true;
    try {
      nouvelle = (JSON.parse(localStorage.getItem("pcv-interface")) ?? "nouvelle") === "nouvelle";
    } catch (e) {
    }
    const visible = /^\/routes\/library\/home/.test(O.location.pathname) && !nouvelle;
    if (racine.hidden !== !visible) racine.hidden = !visible;
    if (!visible && etaitVisible && window.__pcvZone) {
      window.__pcvZone = void 0;
      document.body.classList.remove("pcv-zone-jaquettes");
    }
    if (visible && !etaitVisible) construire();
    etaitVisible = visible;
  }, 150);
  return "accueil pr\xEAt";
})();
