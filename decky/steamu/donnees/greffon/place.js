(() => {
  window.__pcvPlace?.liberer?.();
  window.__pcvPlaceCommandes = (maximum, minimum = 1) => {
    const VITESSE = 0.85;
    const DIRECTIONS = { 20: [0, -1], 21: [0, 1], 22: [-1, 0], 23: [1, 0], 4: [0, -1], 6: [0, 1], 7: [-1, 0], 5: [1, 0] };
    let inscription = null, etats = null, messages = null, manette = null, repos = null, vx = 0, vy = 0, ex = 0, ey = 0, defile = 0, relache = null, essai = -1e9;
    const navigateurs = [window.navigator, window.opener?.navigator], prec = /* @__PURE__ */ new Map(), directs = /* @__PURE__ */ new Set(), vue2 = { x: 0, y: 0, zoom: 1, maximum };
    const compte = {
      echantillon: [],
      manette: false,
      axes: 0,
      repos: null,
      analogiques: {},
      dernier: {},
      navigation: 0,
      boutons: {},
      inscrit: false,
      brut: { inscrit: false, recus: 0, axes: [0, 0, 0, 0] },
      directs: 0,
      // état brut : inscription, états reçus, derniers sLeftStickX/Y, sRightStickX/Y
      get preneurs() {
        return window.__pcvPreneurs;
      }
    }, tenus = /* @__PURE__ */ new Set();
    const tenu = (a, b) => (tenus.has(b) ? 1 : 0) - (tenus.has(a) ? 1 : 0);
    const courbe = (v) => Math.abs(v) < 0.18 ? 0 : Math.sign(v) * (Math.abs(v) - 0.18) / 0.82;
    const axe = (i) => {
      const v = manette?.axes[i] || 0;
      if (repos && !repos.bouge[i] && Math.abs(v - repos[i]) > 0.18) repos.bouge[i] = true;
      return repos?.bouge[i] ? courbe(v) : 0;
    };
    const brut = (i) => compte.brut.axes[i] / 32767 * (i & 1 ? -1 : 1);
    const brutPris = () => Math.hypot(brut(0), brut(1)) > 0.05;
    const NOMS_BRUTS = ["sLeftStickX", "sLeftStickY", "sRightStickX", "sRightStickY"];
    const lireManette = () => {
      manette = null;
      for (const nav of navigateurs) {
        try {
          const l = nav?.getGamepads?.();
          if (l) {
            for (const p of l) if (p?.connected && p.mapping === "standard") {
              manette = p;
              return;
            }
          }
        } catch (e) {
        }
      }
    };
    const borner = () => {
      const d = Math.hypot(vue2.x, vue2.y);
      if (d > 1) {
        vue2.x /= d;
        vue2.y /= d;
      }
      vue2.zoom = Math.max(minimum, Math.min(maximum, vue2.zoom));
    };
    const arreter = () => {
      vx = vy = ex = ey = defile = 0;
      tenus.clear();
    };
    const avancer = (dt, permis) => {
      lireManette();
      compte.manette = !!manette;
      if (manette && !repos) compte.repos = repos = Object.assign([...manette.axes], { bouge: [] });
      if (relache && (!inscription || !etats || !messages) && performance.now() - essai > 2e3) inscrire();
      if (!permis) {
        arreter();
        return false;
      }
      const x0 = vue2.x, y0 = vue2.y, z0 = vue2.zoom, gx = axe(0), gy = axe(1), gz = axe(3), pris = brutPris(), az = courbe(brut(3)) || gz;
      if (gx || gy || gz) compte.axes++;
      const ax = pris ? courbe(brut(0)) : gx, ay = pris ? courbe(brut(1)) : gy, axes = pris || ax || ay;
      let dx = 0, dy = 0;
      for (const d of directs) {
        dx += DIRECTIONS[d][0];
        dy += DIRECTIONS[d][1];
      }
      dx = Math.sign(dx);
      dy = Math.sign(dy);
      const n = dx && dy ? Math.SQRT1_2 : 1;
      const k = 1 - Math.exp(-dt * 9), x = axes ? ax : compte.directs ? dx * n : tenu(11, 12), y = axes ? ay : compte.directs ? dy * n : tenu(9, 10);
      vx += (x - vx) * k;
      vy += (y - vy) * k;
      if (!x && Math.abs(vx) < 1e-4) vx = 0;
      if (!y && Math.abs(vy) < 1e-4) vy = 0;
      vue2.x += vx * dt * VITESSE / vue2.zoom;
      vue2.y += vy * dt * VITESSE / vue2.zoom;
      if (ex || ey) {
        vue2.x += ex * dt;
        vue2.y += ey * dt;
        const f = Math.exp(-dt * 5);
        ex *= f;
        ey *= f;
        if (Math.hypot(ex, ey) < 5e-3) ex = ey = 0;
      }
      vue2.zoom *= Math.exp(az ? -az * dt : defile + tenu(5, 6) * dt);
      defile = 0;
      borner();
      return x0 !== vue2.x || y0 !== vue2.y || z0 !== vue2.zoom;
    };
    const inscrire = () => {
      essai = performance.now();
      const I = (window.SteamClient || window.opener?.SteamClient)?.Input;
      if (!inscription) try {
        I.EnableControllerAnalogInputMessages?.(true);
        inscription = I.RegisterForControllerAnalogInputMessages((...m) => {
          if (compte.echantillon.length < 8) compte.echantillon.push(JSON.stringify(m).slice(0, 300));
          const [i, src, , x, y] = m;
          compte.analogiques[src] = (compte.analogiques[src] || 0) + 1;
          compte.dernier[src] = [x, y];
          if (src !== 47) return;
          const p = prec.get(i);
          if (p) {
            defile -= (y - p.y) * 25e-5;
            p.y = y;
            vue2.reveil?.();
          } else prec.set(i, { y });
        }) || {};
        compte.inscrit = true;
      } catch (e) {
        compte.inscrit = String(e?.message || e);
        if (I && typeof I.RegisterForControllerAnalogInputMessages !== "function") inscription = {};
      }
      if (!messages) try {
        messages = I.RegisterForControllerInputMessages((...m) => {
          const [, src, bas] = m;
          if (!DIRECTIONS[src]) return;
          compte.directs++;
          if (bas) directs.add(src);
          else directs.delete(src);
          vue2.reveil?.();
        }) || {};
      } catch (e) {
        if (I && typeof I.RegisterForControllerInputMessages !== "function") messages = {};
      }
      if (!etats) try {
        etats = I.RegisterForControllerStateChanges((l) => {
          const s = Array.isArray(l) ? l[l.length - 1] : l;
          if (!s) return;
          compte.brut.recus++;
          NOMS_BRUTS.forEach((n, j) => {
            if (typeof s[n] === "number") compte.brut.axes[j] = s[n];
          });
          if (brutPris() || courbe(brut(3))) vue2.reveil?.();
        }) || {};
        compte.brut.inscrit = true;
      } catch (e) {
        compte.brut.inscrit = String(e?.message || e);
        if (I && typeof I.RegisterForControllerStateChanges !== "function") etats = {};
      }
    };
    const activer = (oui) => {
      for (const r of [inscription, etats, messages]) try {
        r?.unregister?.();
      } catch (e) {
      }
      if (inscription) try {
        (window.SteamClient || window.opener?.SteamClient)?.Input?.EnableControllerAnalogInputMessages?.(false);
      } catch (e) {
      }
      inscription = etats = messages = repos = null;
      compte.brut.axes = [0, 0, 0, 0];
      prec.clear();
      directs.clear();
      arreter();
      if (relache) {
        window.removeEventListener("vgp_onbuttonup", relache, true);
        relache = null;
      }
      if (!oui) return;
      window.addEventListener("vgp_onbuttonup", relache = (e) => tenus.delete(e.detail?.button), true);
      inscrire();
    };
    const tenir = (b) => {
      if (!(b >= 9 && b <= 12) && !(b >= 5 && b <= 8)) return false;
      compte.boutons[b] = (compte.boutons[b] || 0) + 1;
      if (b >= 9) compte.navigation++;
      tenus.add(b);
      tenus.delete(b & 1 ? b + 1 : b - 1);
      vue2.reveil?.();
      return true;
    };
    return Object.assign(vue2, {
      avancer,
      activer,
      arreter,
      tenir,
      compte,
      gauche: () => {
        lireManette();
        return !!(brutPris() || axe(0) || axe(1) || [20, 21, 22, 23].some((d) => directs.has(d)));
      },
      tourne: () => tenu(7, 8),
      elan: (x, y) => {
        ex = x;
        ey = y;
        vue2.reveil?.();
      },
      // (vitesse du doigt au lâcher, en unités de vue par seconde)   // LT RT tenus (la roue de la place 3D) : -1, 0 ou 1
      zoomer: (d) => {
        vue2.zoom *= Math.exp(d * 0.3);
        borner();
      },
      reinitialiser: () => {
        vue2.x = vue2.y = 0;
        vue2.zoom = 1;
        arreter();
      }
    });
  };
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
  const jaq = (a) => {
    const el = document.createElement("span");
    el.className = "jaq";
    if (window.__pcvImageJeu) {
      const d = window.__pcvImageJeu(a, el);
      Object.assign(el.style, { backgroundImage: d.image, backgroundSize: d.taille, backgroundPosition: d.position, backgroundRepeat: d.repete });
    } else el.style.backgroundImage = `url('${IMG(a.appid, "library_600x900.jpg")}'),url('${CDN(a.appid, "library_600x900.jpg")}')`;
    return el.outerHTML;
  };
  const appli = (n, c) => `<span class="appli">${svg(n, "46%", c)}</span>`;
  const ICONES = [];
  const APPS = [
    ["amis", "#2fbf71", "amis", T("spaces.amis.nom"), "#2fbf71"],
    ["boutique", "#ff8a1f", "eshop", T("spaces.boutique.nom"), "#ff8a1f"],
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
    elements.push([y + t * 0.1, `<button class="ico" aria-label="${echap(ic.nom)}" data-action="${ic.action}" style="left:${u(x - t / 2)};top:${u(y - t - 30)};width:${u(t)};height:${u(t)};--t:${u(t)}">
      <span class="cadre">${ic.contenu}</span></button>`]);
  });
  elements.sort((a, b) => a[0] - b[0]);
  const dock = [
    ["amis", "#2fbf71", "amis", T("spaces.amis.nom")],
    ["boutique", "#ff8a1f", "eshop", T("spaces.boutique.nom")],
    ["globe", "#2a6fe0", "magasin", T("place.internet")],
    ["bulle", "#19b8d6", "discussions", T("place.discussions")],
    ["medias", "#2a8cff", "medias", T("place.mediatheque")],
    ["telech", "#8a63ff", "telechargements", T("barre.telechargements")],
    ["reglages", "#8b9098", "parametres", T("spaces.parametres.nom")]
  ].map(([n, c, a, t]) => `<button class="dock-btn" data-action="${a}" data-pcv-nom="${t}">${svg(n, "56%", c, 2.3)}</button>`).join("");
  const [gl, glc] = toucheHaut();
  const racine = document.createElement("div");
  racine.id = "pcv-place";
  racine.hidden = true;
  const SANS_MII = (() => {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch (e) {
      return false;
    }
  })();
  racine.innerHTML = `<style>
    #pcv-place { position: fixed; inset: 0; z-index: 9200; overflow: hidden; font-family: var(--pcv-police); color: var(--pcv-texte);
      background: radial-gradient(120% 70% at 50% 85%, var(--pcv-fond-base)); animation: pcvEntree .45s cubic-bezier(.2,.8,.2,1); }
    #pcv-place[hidden] { display: none; }
    @keyframes pcvEntree { from { opacity: 0; transform: scale(.97) } to { opacity: 1; transform: none } }
    #pcv-place button { all: unset; cursor: pointer; box-sizing: border-box; }
    #pcv-place .monde { position: absolute; left: 0; top: 0; width: ${u(1280)}; height: ${u(800)}; transform-origin: 0 0; }
    #pcv-place .sol { position: absolute; left: ${u(-900)}; right: ${u(-900)}; top: ${u(250)}; height: ${u(1400)}; transform: perspective(${u(800)}) rotateX(64deg); transform-origin: top center;
      background: repeating-linear-gradient(90deg, var(--pcv-filet) 0 2px, transparent 2px ${u(70)}), repeating-linear-gradient(0deg, var(--pcv-filet) 0 2px, transparent 2px ${u(70)});
      -webkit-mask: linear-gradient(180deg, transparent, #000 25%); }
    #pcv-place .anneau { position: absolute; left: ${u(170)}; top: ${u(280)}; width: ${u(940)}; height: ${u(350)}; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--pcv-anneau-c) 70%, transparent), transparent); }
    #pcv-place .monde .ico { position: absolute; border-radius: calc(var(--t) * .24); background: linear-gradient(160deg, color-mix(in srgb, var(--pcv-carte) 95%, transparent), color-mix(in srgb, var(--pcv-creux) 85%, transparent));
      box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 -4px 8px rgba(150,170,195,.35), 0 calc(var(--t) * .16) calc(var(--t) * .22) rgba(70,95,130,.22); transition: box-shadow .12s, transform .12s; }
    #pcv-place .cadre { position: absolute; inset: calc(var(--t) * .07); border-radius: calc(var(--t) * .18); overflow: hidden; }
    #pcv-place .cadre::after { content: ""; position: absolute; inset: 0 0 55% 0; background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0)); }
    #pcv-place .jaq { display: block; width: 100%; height: 100%; background: var(--pcv-creux) center 15% / cover; }
    #pcv-place .appli { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; background: var(--pcv-carte); }
    #pcv-place .v { position: absolute; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre);    }
    #pcv-place .haut-avatar { left: ${u(24)}; top: ${u(20)}; width: ${u(56)}; height: ${u(56)}; border-radius: 50%; padding: ${u(6)}; }
    #pcv-place .haut-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
    #pcv-place .retour { left: 50%; top: ${u(20)}; transform: translateX(-50%); height: ${u(52)}; border-radius: ${u(26)}; padding: 0 ${u(10)} 0 ${u(6)}; display: flex; align-items: center; gap: ${u(12)}; font-weight: 900; font-size: ${u(17)}; }
    #pcv-place .retour .p { width: ${u(40)}; height: ${u(40)}; border-radius: 50%; background: var(--pcv-pastille); display: flex; align-items: center; justify-content: center; box-shadow: var(--pcv-pastille-ombre); }
    #pcv-place .gl { width: ${u(30)}; height: ${u(30)}; border-radius: 50%; background: var(--pcv-carte); display: flex; align-items: center; justify-content: center; font-size: ${u(15)}; box-shadow: inset 0 -2px 0 rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.15); }
    #pcv-place .etat { right: ${u(24)}; top: ${u(20)}; height: ${u(52)}; border-radius: ${u(26)}; padding: 0 ${u(20)}; display: flex; align-items: center; gap: ${u(14)}; font-weight: 900; font-size: ${u(16)}; }
    #pcv-place .zoom { left: ${u(24)}; bottom: ${u(22)}; display: flex; align-items: center; gap: ${u(10)}; padding: ${u(8)} ${u(12)}; border-radius: ${u(26)}; z-index: 5; }
    #pcv-place .zoom button { width: ${u(38)}; height: ${u(38)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${u(22)}; font-weight: 900; color: var(--pcv-texte2);
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 2px 6px rgb(from var(--pcv-ombre-c) r g b / .18); }
    #pcv-place .zoom .pt { width: ${u(12)}; height: ${u(12)}; border-radius: 50%; background: var(--pcv-creux); transition: background .2s, box-shadow .2s; }
    #pcv-place .zoom .pt.on { background: var(--pcv-cyan-plein); box-shadow: 0 0 0 ${u(3)} color-mix(in srgb, var(--pcv-cyan-plein) 25%, transparent); }
    #pcv-place .dock { left: 50%; transform: translateX(-50%); bottom: ${u(20)}; padding: ${u(10)} ${u(14)}; border-radius: ${u(28)}; display: flex; gap: ${u(12)}; z-index: 5; }
    #pcv-place .dock-btn { width: ${u(60)}; height: ${u(60)}; border-radius: ${u(18)}; display: flex; align-items: center; justify-content: center;
      background: var(--pcv-verre); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 -3px 0 var(--pcv-reflet-bas), 0 ${u(6)} ${u(14)} rgb(from var(--pcv-ombre-c) r g b / .18); }
    #pcv-place .voile { position: absolute; inset: 0; background: var(--pcv-voile); backdrop-filter: blur(3px); z-index: 8; }
    #pcv-place .carte { left: 50%; top: 50%; transform: translate(-50%,-50%); width: ${u(640)}; border-radius: ${u(34)}; padding: ${u(26)} ${u(28)}; box-sizing: border-box; z-index: 9; display: flex; flex-direction: column; gap: ${u(18)}; }
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
    #pcv-place .legende { position: absolute; left: ${u(24)}; right: ${u(24)}; bottom: ${u(112)}; z-index: 10; }
    #pcv-place .sans-mii { right: ${u(24)}; bottom: ${u(22)}; max-width: ${u(300)}; padding: ${u(10)} ${u(16)}; border-radius: ${u(20)}; z-index: 5;
      font-size: ${u(13)}; font-weight: 800; line-height: 1.3; color: var(--pcv-texte2); }
  </style>
  <div class="monde"><div class="sol"></div><div class="anneau"></div>${elements.map((e) => e[1]).join("")}</div>
  <div class="v haut-avatar"><img data-pcv-avatar src="${urlSure(avatar)}" alt=""></div>
  <button class="v retour" data-pcv-nom="${T("place.revenir_accueil")}"><span class="p">${svg("accueil", "55%", "#1a9ae6")}</span>${T("spaces.accueil.nom")}<span class="gl" style="background:${glc};color:var(--pcv-sur-accent)">${gl}</span></button>
  ${window.__pcvEtat.html()}
  <div class="v zoom"><button class="moins" data-pcv-nom="${T("place.eloigner")}">\u2212</button><i class="pt"></i><i class="pt"></i><i class="pt"></i><i class="pt"></i><button class="plus" data-pcv-nom="${T("place.rapprocher")}">+</button></div>
  ${SANS_MII ? `<div class="v sans-mii">${T("place.sans_mii", "Mii non import\xE9s : la place est vide. Des personnages originaux arrivent bient\xF4t.")}</div>` : ""}
  <div class="v dock">${dock}</div><div class="legende pcv-legende"></div>
  <div class="carte-zone"></div>`;
  document.body.appendChild(racine);
  const bascule = document.createElement("button");
  bascule.id = "pcv-bascule";
  bascule.dataset.pcvNom = T("spaces.place.nom");
  bascule.setAttribute("aria-label", T("spaces.place.nom"));
  bascule.innerHTML = "<i></i>";
  document.body.appendChild(bascule);
  const vue = window.__pcvPlaceCommandes(2.5);
  const monde = racine.querySelector(".monde"), pts = [...racine.querySelectorAll(".zoom .pt")];
  const legende = () => window.__pcvIcones.poser(racine.querySelector(".legende"), window.__pcvLegendeDe([
    ["stick-gauche", T("place.deplacer")],
    [["stick-droit", 5, 6], T("place.zoom")],
    [4, T("spaces.accueil.nom")],
    [2, T("touche.retour")]
  ]));
  (window.__pcvLegendes ||= {}).place = () => {
    if (!racine.hidden) legende();
  };
  const camera = () => {
    const z = vue.zoom, tx = CX * (1 - z) - vue.x * RX * z, ty = CY * (1 - z) - vue.y * RY * z;
    const transform = `translate(${u(+tx.toFixed(2))}, ${u(+ty.toFixed(2))}) scale(${z})`;
    if (monde.style.transform !== transform) monde.style.transform = transform;
    for (let i = 0; i < pts.length; i++) pts[i].classList.toggle("on", i <= (z - 1) / (vue.maximum - 1) * (pts.length - 1));
  };
  const zoomer = (d) => {
    vue.zoomer(d);
    camera();
    window.__pcvSon?.(d > 0 ? "zoom+" : "zoom-");
  };
  racine.querySelector(".moins").onclick = (e) => {
    e.stopPropagation();
    zoomer(-1);
  };
  racine.querySelector(".plus").onclick = (e) => {
    e.stopPropagation();
    zoomer(1);
  };
  let raf = 0, attente = 0, dernier = 0;
  const tour = (t = performance.now()) => {
    raf = attente = 0;
    const dt = Math.max(0, Math.min(0.1, (t - dernier) / 1e3));
    dernier = t;
    if (vue.avancer(dt, !document.hidden && !window.__pcvSteamDessus?.(250) && !document.body.classList.contains("pcv-barre-main"))) {
      camera();
      raf = requestAnimationFrame(tour);
    } else attente = setTimeout(tour, 50);
  };
  vue.reveil = () => {
    if (attente) {
      clearTimeout(attente);
      attente = 0;
      raf = requestAnimationFrame(tour);
    }
  };
  const liberer = () => {
    cancelAnimationFrame(raf);
    clearTimeout(attente);
    raf = attente = 0;
    vue.activer(false);
  };
  window.__pcvPlace = { liberer, etat: () => ({ ouvert: !racine.hidden, zoom: vue.zoom, vue: [vue.x, vue.y], commandes: vue.compte }), choisirPoint: (x, y) => choisirPoint(x, y) };
  camera();
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
    if (a.startsWith("jeu:")) window.__pcvPageJeu?.(a.slice(4), null, "place") || O.SteamClient.URL.ExecuteSteamURL(`steam://nav/games/details/${a.slice(4)}`);
    else ACTIONS[a]?.();
  };
  const peindreEtat = () => window.__pcvEtat.peindre(racine, [...document.querySelectorAll("{{HeaderItem@Header}}{{BatteryIcon@HeaderItem}}")].find((x) => !x.closest(".pile")));
  let tours = 0;
  peindreEtat();
  window.__pcvPlaceHeure = setInterval(() => {
    if (++tours % 10 === 0) peindreEtat();
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
      vue.reinitialiser();
      legende();
      camera();
      vue.activer(true);
      if (!raf && !attente) {
        dernier = performance.now();
        raf = requestAnimationFrame(tour);
      }
    } else liberer();
  };
  window.__pcvPlaceMontrer = montrer;
  const choisirPoint = (x, y) => {
    const ico = document.elementFromPoint(x, y)?.closest("#pcv-place .monde .ico");
    if (!ico || racine.hidden) return false;
    ouvrir(ico.dataset.action);
    return true;
  };
  racine.addEventListener("click", (e) => {
    if (choisirPoint(e.clientX, e.clientY)) return;
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
    else if (k === "-" || k === "PageUp") zoomer(-1);
    else if (k === "+" || k === "=" || k === "PageDown") zoomer(1);
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
      window.__pcvSon?.("home");
      montrer(racine.hidden);
      return true;
    }
    if (racine.hidden) return false;
    const z = racine.querySelector(".carte-zone");
    if (b === 2) {
      window.__pcvSon?.("retour");
      if (z.innerHTML) z.innerHTML = "";
      else montrer(false);
    } else if (!z.innerHTML) vue.tenir(b);
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
