(() => {
  document.getElementById("pcv-biblio")?.remove();
  clearInterval(window.__pcvBiblio);
  const AVATAR = document.querySelector("#header_profile img")?.src || "";
  const racine = document.createElement("div");
  racine.id = "pcv-biblio";
  racine.innerHTML = `<style>
    
    #pcv-biblio .etiq, #pcv-biblio .bulle { pointer-events: none; }
    #pcv-biblio .etiq { position: fixed; z-index: 8000; transform: translateX(-50%); padding: calc(var(--u) * 4) calc(var(--u) * 12);
      border-radius: calc(var(--u) * 12); background: var(--pcv-bulle); color: var(--pcv-sur-accent); font: 900 calc(var(--u) * 13) var(--pcv-police); white-space: nowrap; }
    #pcv-biblio .bulle { position: fixed; z-index: 8000; display: flex; align-items: center; gap: calc(var(--u) * 10);
      padding: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 10) calc(var(--u) * 10); border-radius: calc(var(--u) * 22);
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); color: var(--pcv-texte);
      font: 800 calc(var(--u) * 15) var(--pcv-police); white-space: nowrap; animation: pcvBulle .3s ease-out both; transform-origin: calc(var(--u) * 30) 0; }
    #pcv-biblio .bulle::after { content: ""; position: absolute; top: calc(var(--u) * -8); left: calc(var(--u) * 34); width: calc(var(--u) * 18); height: calc(var(--u) * 18);
      background: var(--pcv-carte); transform: rotate(45deg); border-radius: 3px; }
    #pcv-biblio .bulle img { position: relative; z-index: 1; width: calc(var(--u) * 38); height: calc(var(--u) * 38); border-radius: 50%; box-shadow: inset 0 -3px 0 rgba(0,0,0,.08); }
    #pcv-biblio .bulle span { position: relative; z-index: 1; }
    @keyframes pcvBulle { 0% { opacity: 0; transform: scale(.5); } 70% { opacity: 1; transform: scale(1.04); } 100% { transform: scale(1); } }
    #pcv-biblio [hidden] { display: none !important; }   
  </style><div class="etiq" hidden></div><div class="bulle" hidden><img alt=""><span></span></div>`;
  document.body.appendChild(racine);
  const etiq = racine.querySelector(".etiq"), bulle = racine.querySelector(".bulle");
  bulle.querySelector("img").src = AVATAR;
  const appDe = (el) => {
    const k = Object.keys(el).find((x) => x.startsWith("__reactFiber"));
    for (let f = el[k], i = 0; f && i < 15; i++, f = f.return) if (f.memoizedProps?.app?.appid) return f.memoizedProps.app;
    return null;
  };
  const Tb = (k, v) => window.__pcvT?.(k, v) ?? k;
  const duree = (min) => (min = Math.round(min || 0), !min) ? Tb("biblio.jamais") : min < 60 ? Tb("biblio.min", { n: min }) : Tb("biblio.heures", { h: Math.floor(min / 60), m: String(min % 60).padStart(2, "0") });
  const date = (rt) => rt ? new Date(rt * 1e3).toLocaleDateString(window.__pcvLocale?.() || "fr-FR", { day: "numeric", month: "short" }) : "";
  let dernier = null;
  window.__pcvBiblio = setInterval(() => {
    const p = window.opener?.location.pathname || "";
    const focus = /^\/routes\/library\/?$|^\/routes\/library\/(?:collection|tab)/.test(p) ? document.querySelector("._3vHkmRShhzwd67_MtEq8-n .gpfocus") : null;
    let menuOuvert = false;
    try {
      const req = window.opener.__pcvReq ||= (() => {
        let r2;
        window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r2 = q;
        }]);
        return r2;
      })();
      menuOuvert = req(75380).SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore.IsAnySideMenuVisible();
    } catch (e) {
    }
    const app = !menuOuvert && focus && appDe(focus);
    if (!app) {
      if (!etiq.hidden) etiq.hidden = true;
      if (!bulle.hidden) bulle.hidden = true;
      dernier = null;
      return;
    }
    const r = focus.getBoundingClientRect(), u = innerHeight / 800;
    etiq.style.left = r.left + r.width / 2 + "px";
    etiq.style.top = r.bottom - 6 * u + "px";
    bulle.style.left = r.left - 6 * u + "px";
    bulle.style.top = r.bottom + 32 * u + "px";
    if (dernier !== app.appid) {
      dernier = app.appid;
      etiq.textContent = app.display_name;
      const t = duree(app.minutes_playtime_forever), d = date(app.rt_last_time_played);
      bulle.querySelector("span").textContent = d ? Tb("biblio.temps_der", { temps: t, date: d }) : t;
      bulle.style.animation = "none";
      void bulle.offsetWidth;
      bulle.style.animation = "";
    }
    if (etiq.hidden) etiq.hidden = false;
    if (bulle.hidden) bulle.hidden = false;
  }, 120);
  document.removeEventListener("focusin", window.__pcvOngletCentre, true);
  document.addEventListener("focusin", window.__pcvOngletCentre = (e) => {
    if (document.body.dataset.pcvPage !== "bibliotheque") return;
    for (let p = e.target.parentElement; p && p !== document.body; p = p.parentElement) {
      if (p.scrollWidth > p.clientWidth + 1 && p.scrollHeight <= p.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(p).overflowX)) {
        e.target.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
        return;
      }
    }
  }, true);
  document.getElementById("pcv-trier")?.remove();
  const trier = document.createElement("button");
  trier.id = "pcv-trier";
  const T = (k, f) => window.__pcvT?.(k) ?? f;
  trier.dataset.pcvNom = T("biblio.trier_nom", "Trier la biblioth\xE8que");
  trier.innerHTML = "<i></i>" + T("biblio.trier", "Trier");
  trier.hidden = true;
  trier.onclick = () => {
    try {
      const req = window.opener.__pcvReq ||= (() => {
        let r;
        window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
      const nm = req(61236).oy.NavigationManager, d = { button: 4, source: 1, is_repeat: false };
      nm.DispatchVirtualGamepad("vgp_onbuttondown", d);
      nm.DispatchVirtualGamepad("vgp_onbuttonup", d);
    } catch (e) {
    }
  };
  const st = document.createElement("style");
  st.textContent = `
    #pcv-trier { all: unset; position: fixed; z-index: 8100; right: calc(var(--u) * 24); top: calc(var(--u) * 91); height: calc(var(--u) * 42); padding: 0 calc(var(--u) * 18) 0 calc(var(--u) * 6);
      display: flex; align-items: center; gap: calc(var(--u) * 8); border-radius: calc(var(--u) * 23); cursor: pointer; font: 900 calc(var(--u) * 15) var(--pcv-police); color: var(--pcv-texte);
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    #pcv-trier[hidden] { display: none; }
    #pcv-trier:hover { box-shadow: var(--pcv-reflet), 0 0 0 calc(var(--u) * 4) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * 8) var(--pcv-cyan-plein); }
    #pcv-trier i { width: calc(var(--u) * 34); height: calc(var(--u) * 34); border-radius: 50%; background: var(--pcv-pastille) center / 55% no-repeat
      url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%235b6676%22%20stroke-width%3D%222.6%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M4%206h16M7%2012h10M10%2018h4%22%2F%3E%3C%2Fsvg%3E");
      box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); }`;
  trier.appendChild(st);
  document.body.appendChild(trier);
  clearInterval(window.__pcvTrierSuivi);
  window.__pcvTrierSuivi = setInterval(() => {
    const cache = !/^\/routes\/library\/?$|^\/routes\/library\/(?:collection|tab)/.test(window.opener?.location.pathname || "");
    if (trier.hidden !== cache) trier.hidden = cache;
  }, 250);
  return "biblioth\xE8que pr\xEAte";
})();
