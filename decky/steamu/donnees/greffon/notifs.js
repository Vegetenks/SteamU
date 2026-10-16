(() => {
  document.getElementById("pcv-notifs")?.remove();
  clearInterval(window.__pcvNotifsSuivi);
  const T = window.__pcvT || ((c) => c);
  const O = window.opener;
  const u = (n) => `calc(var(--u) * ${n})`;
  const IMG = (id, f) => `https://steamloopback.host/assets/${id}/${f}`;
  const CDN = (id, f) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${id}/${f}`;
  const echappe = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const magasin = () => {
    try {
      const req = window.opener.__pcvReq ||= (() => {
        let r;
        window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
      for (const id of Object.keys(req.m)) {
        const m = req.m[id].toString();
        if (!m.includes("m_rgNotificationRollups")) continue;
        const e = req(id);
        for (const k of Object.keys(e)) if (e[k] && typeof e[k] === "object" && "m_rgNotificationRollups" in e[k]) return e[k];
      }
    } catch (e) {
    }
    return null;
  };
  const plateau = () => {
    try {
      const req = window.opener.__pcvReq ||= (() => {
        let r;
        window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
      for (const id of Object.keys(req.m)) {
        const m = req.m[id].toString();
        if (!m.includes("m_rgNotificationTray") || !m.includes("GetNotificationsInTray")) continue;
        const e = req(id);
        for (const k of Object.keys(e)) if (e[k] && typeof e[k] === "object" && typeof e[k].GetNotificationsInTray === "function") return e[k];
      }
    } catch (e) {
    }
    return null;
  };
  let store = null, casier = null, cache = null;
  const noms = {};
  const cacheMagasin = () => {
    try {
      const req = O.__pcvReq;
      for (const id of Object.keys(req.m)) {
        if (!req.m[id].toString().includes("async QueueAppRequest(")) continue;
        const e = req(id);
        for (const k of Object.keys(e)) {
          const c = typeof e[k]?.Get === "function" && e[k].Get();
          if (typeof c?.QueueAppRequest === "function") return c;
        }
      }
    } catch (e) {
    }
    return null;
  };
  const nomMagasin = (id) => {
    if (id in noms) return noms[id];
    noms[id] = "";
    cache ||= cacheMagasin();
    if (!cache) return "";
    Promise.race([cache.QueueAppRequest(id, { include_basic_info: true }), new Promise((ok) => setTimeout(ok, 4e3))]).then(() => {
      noms[id] = cache.GetApp?.(id)?.GetName?.() || "";
      if (noms[id] && !racine.hidden) remplir();
    }, () => {
    });
    return "";
  };
  const nomJeu = (id) => O.appStore.GetAppOverviewByAppID?.(Number(id))?.display_name || nomMagasin(Number(id));
  const lus = /* @__PURE__ */ new WeakMap();
  const PRISE = '<svg viewBox="0 0 24 24"><path d="M9 2v5H7v4a5 5 0 0 0 4 4.9V22h2v-6.1a5 5 0 0 0 4-4.9V7h-2V2h-2v5h-2V2z"/></svg>';
  const lire = (n) => {
    if (lus.has(n) || !window.__pcvToastsLire) return;
    lus.set(n, null);
    const essai = (k) => window.__pcvToastsLire(n).then((l) => l || k && new Promise((ok) => setTimeout(ok, 400)).then(() => essai(k - 1)));
    essai(2).then((l) => {
      lus.set(n, l || {});
      if (l && !racine.hidden) remplir();
    }, () => lus.set(n, {}));
  };
  const SENS = (t, d) => ({
    2: [T("notifs.cadeau"), "#e5484d", T("notifs.cadeau_recu"), "steam://url/SteamIDMyProfile"],
    3: [T("notifs.commentaire"), "#2a8cff", T("notifs.nouveau_commentaire"), "steam://url/SteamIDMyProfile"],
    4: [T("notifs.objet_recu"), "#8a63ff", d.source_appid ? T("notifs.objet_recu_jeu", { jeu: nomJeu(d.source_appid) }) : T("notifs.objet_recu_texte"), "steam://url/SteamIDMyProfile"],
    5: [T("notifs.invitation"), "#2fbf71", T("notifs.nouvelle_demande_ami"), null],
    6: [T("notifs.grande_promo"), "#ff8a1f", T("notifs.soldes_commence"), "steam://store"],
    // (comme la cloche de Steam : un seul jeu → sa page du magasin ; plusieurs → la liste de souhaits)
    8: [
      T("notifs.promo_liste_souhaits"),
      "#1a9ae6",
      T("notifs.jeu_liste_souhaits_promo"),
      d.count > 1 || !Math.trunc(+d.appid) ? "steam://openurl/https://store.steampowered.com/wishlist/" : `steam://openurl/https://store.steampowered.com/app/${Math.trunc(+d.appid)}/`
    ],
    9: [T("notifs.echange"), "#e0a100", T("notifs.nouvelle_proposition_echange"), null]
  })[t] || [T("notifs.steam"), "#8b9098", T("notifs.nouvelle_notif_steam"), null];
  const racine = document.createElement("div");
  racine.id = "pcv-notifs";
  racine.hidden = true;
  racine.innerHTML = `<style>
    #pcv-notifs { position: fixed; inset: 0; padding-top: ${u(96)}; box-sizing: border-box;   
      z-index: 8600; font-family: var(--pcv-police); color: var(--pcv-texte); display: flex; flex-direction: column;
      background: var(--pcv-fond-page); animation: pcvNotifsEntree .3s cubic-bezier(.2,.8,.2,1); padding: ${u(96)} ${u(44)} ${u(30)}; }
    #pcv-notifs[hidden] { display: none; }
    
    #pcv-notifs .liste { flex: 1; min-height: 0; overflow-y: auto; padding: 0 ${u(18)} ${u(18)}; margin: 0 ${u(-18)}; }
    @keyframes pcvNotifsEntree { from { opacity: 0; transform: translateY(${u(10)}) } to { opacity: 1; transform: none } }
    #pcv-notifs * { box-sizing: border-box; }
    #pcv-notifs button { all: unset; cursor: pointer; box-sizing: border-box; }
    #pcv-notifs .tete { display: flex; justify-content: space-between; align-items: center; padding: ${u(4)} 0 ${u(10)}; }
    #pcv-notifs h2 { margin: 0; font-size: ${u(26)}; font-weight: 900; }
    #pcv-notifs .apercu { padding: ${u(9)} ${u(18)}; border-radius: ${u(20)}; font-size: ${u(15)}; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(var(--pcv-ombre-rgb) / .13); }
    #pcv-notifs h3 { margin: ${u(18)} 0 ${u(10)}; font-size: ${u(15)}; font-weight: 900; color: var(--pcv-texte2); letter-spacing: .04em; text-transform: uppercase; }
    
    #pcv-notifs .vide { padding: ${u(18)} ${u(22)}; border-radius: ${u(22)}; border: 2px dashed rgba(150,170,195,.45); font-size: ${u(15)}; font-weight: 800; color: var(--pcv-texte2);
      box-shadow: 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} rgba(47,184,255,.2); }
    #pcv-notifs .n { display: flex; align-items: center; gap: ${u(18)}; width: 100%; border-radius: ${u(26)}; padding: ${u(16)}; margin-bottom: ${u(14)};
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(var(--pcv-ombre-rgb) / .13); transition: box-shadow .12s; }
    #pcv-notifs .n.sel, #pcv-notifs .n:hover { box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} rgba(47,184,255,.2), 0 ${u(14)} ${u(28)} rgba(47,184,255,.35); }
    #pcv-notifs .n i { width: ${u(76)}; height: ${u(114)}; flex: none; border-radius: ${u(14)}; background: var(--pcv-creux) center / cover; box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere); }
    #pcv-notifs .n .t { flex: 1; min-width: 0; }
    #pcv-notifs .n .type { font-size: ${u(14)}; font-weight: 900; }
    #pcv-notifs .n .type small { color: var(--pcv-texte2); font-weight: 800; margin-left: ${u(6)}; }
    #pcv-notifs .n b { display: block; font-size: ${u(22)}; font-weight: 900; margin: ${u(4)} 0; }
    #pcv-notifs .n span.d { font-size: ${u(15)}; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-notifs .n.s { padding: ${u(12)} ${u(16)}; }
    #pcv-notifs .n .ic { width: ${u(52)}; height: ${u(52)}; flex: none; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;
      background: var(--pcv-pastille); color: var(--pcv-texte2); box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere), 0 ${u(2)} ${u(6)} rgb(var(--pcv-ombre-rgb) / .18); }
    #pcv-notifs .n .ic img { width: 100%; height: 100%; object-fit: cover; }
    #pcv-notifs .n .ic svg { width: 64%; height: 64%; }
    #pcv-notifs .n .ic svg:not([fill]) { fill: currentColor; }
    #pcv-notifs .n.s .type { color: var(--pcv-texte2); }
    #pcv-notifs .n.s b { font-size: ${u(17)}; margin: ${u(2)} 0 0; }
    #pcv-notifs .n.s .agir { padding: ${u(9)} ${u(18)}; color: var(--pcv-texte); background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(4)} ${u(12)} rgb(var(--pcv-ombre-rgb) / .15); }
    #pcv-notifs .n .agir { padding: ${u(12)} ${u(22)}; border-radius: ${u(22)}; font-size: ${u(15)}; font-weight: 900; color: var(--pcv-sur-accent); flex: none;
      background: var(--pcv-cyan); box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 ${u(8)} ${u(20)} rgba(26,154,230,.35); }
  </style>
  <div class="tete"><h2>Notifications</h2><button class="apercu" data-apercu>Aper\xE7u rapide</button></div><div class="liste"></div>`;
  document.body.appendChild(racine);
  window.__pcvFond?.(racine);
  let items = [], sel = 0;
  const jourDe = (t) => {
    const j = Math.floor((Date.now() / 1e3 - t) / 86400);
    return j <= 0 ? T("notifs.aujourdhui") : j < 7 ? T("notifs.cette_semaine") : j < 31 ? T("notifs.ce_mois") : T("notifs.plus_ancien");
  };
  const remplir = () => {
    store ||= magasin();
    casier ||= plateau();
    const brut = casier?.GetNotificationsInTray?.();
    const duPlateau = brut ? (brut[0] || []).map((t) => t.notifications?.[0]?.data).filter((d) => d?.item) : null;
    const rollups = (duPlateau ?? (store?.m_rgNotificationRollups || [])).filter((r) => r.item && !r.item.hidden).sort((a, b) => b.timestamp - a.timestamp);
    const services = (brut?.[0] || []).map((g) => g.notifications?.[0]).filter((n) => n?.decky && n.data).sort((a, b) => b.rtCreated - a.rtCreated);
    items = rollups.map((r) => {
      let d = {};
      try {
        d = JSON.parse(r.item.body_data || "{}");
      } catch (e) {
      }
      const app = Math.trunc(+(d.source_appid || d.appid || d.app_id_list?.[0] || (d.app_id && d.app_id !== 753 ? d.app_id : 0))) || 0;
      const [type, couleur, texte, lien] = SENS(r.type, d);
      return { r, d, app, type, couleur, texte, lien, titre: app ? nomJeu(app) || type : type };
    }).concat(services.map((n) => {
      lire(n);
      const l = lus.get(n) || {}, d = n.data;
      return {
        service: n,
        titre: l.titre || (typeof d.title === "string" ? d.title : T("notifs.greffon")),
        texte: l.ligne ?? (typeof d.body === "string" ? d.body : ""),
        ic: l.img ? `<img src="${echappe(l.img)}">` : l.svg || PRISE
      };
    }));
    sel = Math.min(sel, Math.max(0, items.length - 1));
    let html = "", groupe = "";
    if (!items.length) html = `<h3>${T("notifs.aujourdhui")}</h3><div class="vide">${T("notifs.vide")}</div>`;
    items.forEach((n, i) => {
      if (n.service) {
        if (groupe !== "s") {
          html += `${i ? "" : `<h3>${T("notifs.aujourdhui")}</h3><div class="vide">${T("notifs.vide_steam")}</div>`}<h3>${T("notifs.greffons_services")}</h3>`;
          groupe = "s";
        }
        const t = new Date(n.service.rtCreated), quand = jourDe(t / 1e3) === T("notifs.aujourdhui") ? t.toLocaleTimeString(window.__pcvLocale?.() || "fr-FR", { hour: "2-digit", minute: "2-digit" }) : t.toLocaleDateString(window.__pcvLocale?.() || "fr-FR", { day: "numeric", month: "short" });
        html += `<button class="n s${i === sel ? " sel" : ""}" data-i="${i}"><span class="ic">${n.ic}</span><span class="t"><span class="type">${echappe(n.titre)}<small>${quand}</small></span>${n.texte ? `<b>${echappe(n.texte)}</b>` : ""}</span><span class="agir">${T("notifs.voir")}</span></button>`;
        return;
      }
      const g = jourDe(n.r.timestamp);
      if (g !== groupe) {
        html += `<h3>${g}</h3>`;
        groupe = g;
      }
      const date = new Date(n.r.timestamp * 1e3).toLocaleDateString(window.__pcvLocale?.() || "fr-FR", { day: "numeric", month: "short" });
      const image = n.app ? `<i style="background-image:url('${IMG(n.app, "library_600x900.jpg")}'),url('${CDN(n.app, "library_600x900.jpg")}')"></i>` : "";
      html += `<button class="n${i === sel ? " sel" : ""}" data-i="${i}">${image}<span class="t"><span class="type" style="color:${n.couleur}">\u25CF ${n.type}<small>${date}${n.r.rollup_count > 1 ? ` (${n.r.rollup_count})` : ""}</small></span>
        <b>${echappe(n.titre)}</b><span class="d">${echappe(n.texte)}</span></span>${n.lien ? `<span class="agir">${T("notifs.voir")}</span>` : ""}</button>`;
    });
    racine.querySelector(".liste").innerHTML = html;
  };
  const apercu = (onglet = 0) => {
    montrer(false);
    try {
      const req = window.opener.__pcvReq ||= (() => {
        let r;
        window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
      req(75380).SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore.OpenQuickAccessMenu(onglet);
    } catch (e) {
    }
  };
  const agir = (i) => {
    const n = items[i];
    if (!n) return;
    if (n.service) {
      const f = n.service.data.onClick;
      if (typeof f !== "function") return apercu(999);
      montrer(false);
      try {
        f();
      } catch (e) {
      }
      return;
    }
    if (n.lien) {
      montrer(false);
      O.SteamClient.URL.ExecuteSteamURL(n.lien);
    } else apercu();
  };
  const montrer = (oui) => {
    if (oui) remplir();
    racine.hidden = !oui;
  };
  racine.addEventListener("click", (e) => {
    if (e.target.closest("[data-apercu]")) return apercu();
    const n = e.target.closest(".n");
    if (n) agir(+n.dataset.i);
  });
  window.__pcvNotifsMontrer = montrer;
  (window.__pcvManette ||= {}).notifs = (b) => {
    if (racine.hidden) return false;
    if (b === 9) sel = Math.max(0, sel - 1);
    else if (b === 10) sel = Math.min(items.length - 1, sel + 1);
    else if (b === 1) {
      agir(sel);
      return true;
    } else if (b === 3) {
      apercu();
      return true;
    } else if (b === 2) {
      montrer(false);
      return true;
    } else return true;
    remplir();
    racine.querySelector(".n.sel")?.scrollIntoView({ block: "nearest" });
    return true;
  };
  let route = O.location.pathname;
  window.__pcvNotifsSuivi = setInterval(() => {
    if (O.location.pathname !== route) {
      route = O.location.pathname;
      montrer(false);
    }
  }, 200);
  return "notifications pr\xEAtes";
})();
(() => {
  const O = window.opener;
  const u = (n) => `calc(var(--u) * ${n})`;
  document.getElementById("pcv-toasts")?.remove();
  clearInterval(window.__pcvToastsVeille);
  const echappe = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const lesPieces = () => window.__pcvToastsPieces ||= { React: O.SP_REACT };
  const forme = (f) => {
    const s = Function.prototype.toString.call(f).slice(0, 400);
    if (!s.includes("eType")) return null;
    return /\{[^{}=]*\bgroup:[\w$]+[^{}=]*\}=/.test(s) ? "group" : /\{[^{}=]*\bnotification:[\w$]+[^{}=]*\}=/.test(s) ? "notification" : null;
  };
  const chercher = () => {
    const p = lesPieces();
    if (p.file && p.Contenu && p.creerRacine && p.React?.createElement) return p;
    let req;
    try {
      req = O.__pcvReq ||= (() => {
        let r;
        O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
    } catch (e) {
      return p;
    }
    p.React ||= O.SP_REACT;
    try {
      for (const id of Object.keys(req.m)) {
        const s = req.m[id].toString();
        if (!p.file && s.includes("PopNextToastNotification(") && s.includes("ClearAllToastNotifications(){")) {
          const e = req(id);
          for (const k of Object.keys(e)) if (typeof e[k]?.PopNextToastNotification === "function") p.file = e[k];
        } else if (!p.Contenu && s.includes("k_ESteamNotificationType_")) {
          const e = req(id), f = Object.values(e).filter((x) => typeof x === "function");
          p.Contenu = f.find((x) => forme(x) === "group") || f.find((x) => forme(x) === "notification");
        } else if (!p.creerRacine && s.length > 5e4 && s.includes("react.dev/errors") && s.includes("createRoot")) p.creerRacine = req(id).createRoot;
        if (p.file && p.Contenu && p.creerRacine) break;
      }
    } catch (e) {
    }
    return p;
  };
  const pieces = () => {
    const p = chercher();
    return p.React?.createElement && typeof p.creerRacine === "function" && p.file && p.Contenu ? p : null;
  };
  const racine = document.createElement("div");
  racine.id = "pcv-toasts";
  racine.innerHTML = `<style>
    
    #pcv-toasts { position: fixed; inset: 0; z-index: 9050; pointer-events: none; font-family: var(--pcv-police); color: var(--pcv-texte); }
    #pcv-toasts .b { position: absolute; pointer-events: auto; cursor: pointer; display: flex; align-items: center; gap: ${u(12)}; box-sizing: border-box;
      height: ${u(60)}; min-width: ${u(220)}; max-width: ${u(400)}; padding: 0 ${u(22)} 0 ${u(9)}; border-radius: ${u(22)};
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(10)} ${u(24)} rgb(var(--pcv-ombre-rgb) / .22);
      transform-origin: var(--pointe) ${u(-10)}; animation: pcvBulleNait .42s cubic-bezier(.2,.9,.3,1.25) both; }
    
    #pcv-toasts .b::before { content: ""; position: absolute; top: ${u(-8)}; left: calc(var(--pointe) - ${u(9)}); width: ${u(18)}; height: ${u(18)};
      background: var(--pcv-carte); transform: rotate(45deg); border-radius: ${u(4)} 0 0 0; box-shadow: -1px -1px 0 var(--pcv-bord); }
    #pcv-toasts .b.sort { animation: pcvBulleRentre .28s ease-in both; }
    @keyframes pcvBulleNait { 0% { opacity: 0; transform: scale(.2); } 60% { opacity: 1; transform: scale(1.05); } 100% { transform: scale(1); } }
    @keyframes pcvBulleRentre { to { opacity: 0; transform: scale(.2); } }
    #pcv-toasts .ic { flex: none; width: ${u(42)}; height: ${u(42)}; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(180deg, #ff7a7e, #e5484d); box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere), 0 ${u(2)} ${u(5)} rgba(90,0,10,.18); color: var(--pcv-sur-accent); }
    #pcv-toasts .ic img { width: 100%; height: 100%; object-fit: cover; display: block; }
    #pcv-toasts .ic svg { width: 56%; height: 56%; }
    #pcv-toasts .ic svg, #pcv-toasts .ic svg * { fill: currentColor; color: var(--pcv-sur-accent); }
    #pcv-toasts .t { min-width: 0; display: flex; flex-direction: column; line-height: 1.15; }
    #pcv-toasts .t b, #pcv-toasts .t span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #pcv-toasts .t b { font-size: ${u(15)}; font-weight: 900; }
    #pcv-toasts .t span { font-size: ${u(13)}; font-weight: 800; color: var(--pcv-texte2); margin-top: ${u(2)}; }
    
    #pcv-toasts .compte { position: absolute; min-width: ${u(24)}; height: ${u(24)}; padding: 0 ${u(6)}; box-sizing: border-box; border-radius: ${u(12)};
      background: linear-gradient(180deg, #ff6b70, #e5484d); color: var(--pcv-sur-accent); font-size: ${u(13)}; font-weight: 900; line-height: ${u(24)}; text-align: center;
      box-shadow: 0 0 0 ${u(2.5)} var(--pcv-lisere), 0 ${u(2)} ${u(5)} rgba(90,0,10,.25); animation: pcvBulleNait .36s cubic-bezier(.2,.9,.3,1.3) both; }
    #pcv-toasts .compte[hidden] { display: none; }
    #pcv-toasts .cache { position: fixed; left: -4000px; top: 0; width: 600px; visibility: hidden; }
  </style><div class="cache"></div><span class="compte" hidden></span>`;
  document.body.appendChild(racine);
  const cache = racine.querySelector(".cache"), compteur = racine.querySelector(".compte");
  const lire = (p, t) => new Promise((ok) => {
    const boite = cache.appendChild(document.createElement("div"));
    let r;
    try {
      r = p.creerRacine(boite);
      r.render(p.React.createElement(p.Contenu, { location: 1, group: { eType: t.eType, notifications: [t] }, notification: t, onDismiss: () => {
      } }));
    } catch (e) {
      boite.remove();
      return ok(null);
    }
    requestAnimationFrame(() => setTimeout(() => {
      const img = boite.querySelector("img[src]")?.getAttribute("src") || "";
      const svg = img ? "" : boite.querySelector("svg")?.outerHTML || "";
      const lignes = [];
      for (const e of boite.querySelectorAll("*")) {
        if (e.closest("svg") || [...e.childNodes].every((n) => n.nodeType !== 3 || !n.textContent.trim())) continue;
        const x = e.textContent.trim().replace(/\s+/g, " ");
        if (x && !lignes.includes(x)) lignes.push(x);
      }
      const fermer = () => {
        try {
          r.unmount();
        } catch (e) {
        }
        boite.remove();
      };
      if (!lignes.length) {
        fermer();
        return ok(null);
      }
      ok({ img, svg, titre: lignes[0], ligne: lignes.slice(1).join(", "), agir: () => boite.querySelector('[role="button"]')?.click(), fermer });
    }, 30));
  });
  window.__pcvToastsLire = (t) => {
    const p = pieces();
    return p ? lire(p, t).then((c) => (c?.fermer(), c)) : Promise.resolve(null);
  };
  const CLOCHE = '<svg viewBox="0 0 24 24"><path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5v4.6L3.8 16.4a1 1 0 0 0 .9 1.5h14.6a1 1 0 0 0 .9-1.5l-1.7-2.8V9A6.5 6.5 0 0 0 12 2.5zm-2.6 17a2.6 2.6 0 0 0 5.2 0z"/></svg>';
  const unite = () => innerHeight / 800;
  const laCloche = () => document.querySelector('#pcv-barre .rond[data-pcv-rond="notifs"]');
  const clocheVue = () => {
    const c = laCloche();
    if (!c) return null;
    const r = c.getBoundingClientRect();
    if (r.width < 4 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return null;
    const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return e && c.contains(e) ? r : null;
  };
  const sonner = (t) => {
    try {
      laCloche()?.querySelector("i")?.animate(["rotate(0)", "rotate(-18deg) scale(1.12)", "rotate(14deg) scale(1.12)", "rotate(-8deg)", "rotate(4deg)", "rotate(0)"].map((transform) => ({ transform, transformOrigin: "50% 15%" })), { duration: 650, easing: "ease-out" });
    } catch (e) {
    }
    try {
      laCloche()?.animate([{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(.97)" }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
    } catch (e) {
    }
    if (window.__pcvSon) window.__pcvSon("notification");
    else if (t) {
      try {
        pieces()?.file.PlayNotificationSound(t);
      } catch (e) {
      }
    }
    window.__pcvLed?.("notif");
  };
  let file = [], enCours = false, retenues = 0;
  const majCompteur = () => {
    const r = retenues && clocheVue();
    if (!r) {
      compteur.hidden = true;
      return;
    }
    const k = unite();
    compteur.textContent = retenues > 9 ? "9+" : String(retenues);
    compteur.style.left = `${r.right - 18 * k}px`;
    compteur.style.top = `${r.top - 4 * k}px`;
    compteur.hidden = false;
  };
  const bulle = ({ img, svg, titre, ligne, agir }, duree, t) => new Promise((fin) => {
    const r = clocheVue();
    if (!r) return fin(false);
    const k = unite(), el = document.createElement("div");
    el.className = "b";
    const gauche = r.left - 10 * k, pointe = r.left + r.width / 2 - gauche;
    el.style.left = `${gauche}px`;
    el.style.top = `${r.bottom + 14 * k}px`;
    el.style.setProperty("--pointe", `${pointe}px`);
    el.innerHTML = `<i class="ic">${img ? `<img src="${echappe(img)}">` : svg || CLOCHE}</i><span class="t"><b>${echappe(titre)}</b>${ligne ? `<span>${echappe(ligne)}</span>` : ""}</span>`;
    el.querySelector("img")?.addEventListener("error", (e) => {
      e.target.parentNode.innerHTML = CLOCHE;
    });
    let parti = false;
    const partir = () => {
      if (parti) return;
      parti = true;
      clearInterval(veille);
      el.classList.add("sort");
      setTimeout(() => {
        el.remove();
        fin(true);
      }, 280);
    };
    el.addEventListener("click", () => {
      const avant = O.location.pathname;
      try {
        agir?.();
      } catch (e) {
      }
      partir();
      setTimeout(() => {
        if (O.location.pathname === avant) window.__pcvNotifsMontrer?.(true);
      }, agir ? 300 : 0);
    });
    racine.appendChild(el);
    sonner(t);
    setTimeout(partir, duree);
    const veille = setInterval(() => {
      if (!clocheVue()) partir();
    }, 400);
  });
  const regroupe = (n) => ({ titre: n > 1 ? `${n} notifications` : "1 notification", ligne: "Touche la cloche pour les voir", svg: CLOCHE });
  const debut = Math.max(O.performance.timeOrigin, performance.timeOrigin);
  const retenir = () => Date.now() - debut < 2e4 || !!document.getElementById("pcv-connexion") || document.getElementById("pcv-place")?.hidden === false || !clocheVue();
  const enJeu = () => {
    try {
      return (O.SteamUIStore?.RunningApps?.length || 0) > 0;
    } catch (e) {
      return false;
    }
  };
  const suivante = async () => {
    if (enCours) return;
    enCours = true;
    while (file.length && !retenir()) {
      if (file.length >= 3) {
        const n = file.length;
        file.forEach((x) => x.contenu.fermer());
        file = [];
        await bulle(regroupe(n), 6500);
        continue;
      }
      const { t, contenu } = file.shift();
      if (!await bulle(contenu, Math.min(6e3, Math.max(3500, t.nToastDurationMS || 4500)), t)) {
        retenues++;
      }
      contenu.fermer();
    }
    if (file.length) {
      retenues += file.length;
      file.forEach((x) => x.contenu.fermer());
      file = [];
    }
    enCours = false;
    majCompteur();
  };
  const recevoir = (t) => {
    if (t.decky) return void 0;
    if (enJeu() || t.__pcvPasser) return t;
    if (retenir()) {
      retenues++;
      majCompteur();
      return void 0;
    }
    const p = pieces();
    if (!p) return t;
    if (t.fnNotificationResolved) return t;
    lire(p, t).then((contenu) => {
      if (contenu) {
        file.push({ t, contenu });
        suivante();
        return;
      }
      if (retenir() && !enJeu()) {
        retenues++;
        majCompteur();
        return;
      }
      t.__pcvPasser = true;
      try {
        p.file.m_rgNotificationToasts.push(t);
        if (p.file.m_rgNotificationToasts.length === 1) p.file.DispatchNextToast();
      } catch (e) {
      }
    });
    return void 0;
  };
  const crocheter = () => {
    const F = chercher().file;
    if (!F) return false;
    F.__pcvPop0 ||= F.PopNextToastNotification;
    F.__pcvRecevoir = recevoir;
    if (!F.__pcvCrochet) {
      F.PopNextToastNotification = function(e) {
        const t = F.__pcvPop0.call(this, e);
        if (!t || e) return t;
        try {
          return F.__pcvRecevoir ? F.__pcvRecevoir(t) : t;
        } catch (x) {
          return t;
        }
      };
      F.__pcvCrochet = true;
    }
    return true;
  };
  const congedies = /* @__PURE__ */ new WeakSet();
  const classeReservoir = () => {
    if (window.__pcvToastsReservoir) return window.__pcvToastsReservoir;
    try {
      const req = O.__pcvReq;
      for (const id of Object.keys(req.m)) {
        const s = req.m[id].toString();
        if (s.includes("GamepadToastPlaceholder:") && s.includes("toastAnimateInMS")) return window.__pcvToastsReservoir = req(id).GamepadToastPlaceholder;
      }
    } catch (e) {
    }
    return null;
  };
  const toastAffiche = () => {
    const c = classeReservoir();
    const el = c && document.querySelector("." + c.split(" ")[0]);
    if (!el || el.style.display === "none") return null;
    const k = Object.keys(el).find((x) => x.startsWith("__reactFiber"));
    for (let f = el[k]?.return, i = 0; f && i < 3; i++, f = f.return) {
      const pile = [f.child];
      let n = 0;
      while (pile.length && n++ < 60) {
        const g = pile.pop();
        if (!g) continue;
        const pr = g.memoizedProps;
        if (pr?.notification && typeof pr.onDismiss === "function") return pr;
        pile.push(g.sibling, g.child);
      }
    }
    return null;
  };
  const eteindreSteam = () => {
    if (enJeu() || !retenir()) return;
    const pr = toastAffiche();
    if (!pr || congedies.has(pr.notification)) return;
    congedies.add(pr.notification);
    if (!pr.notification.decky) retenues++;
    try {
      pr.onDismiss();
    } catch (e) {
    }
  };
  window.__pcvToastsTrouver = toastAffiche;
  let pose = crocheter(), essais = 0;
  setTimeout(eteindreSteam, 0);
  clearInterval(window.__pcvToastsCrochet);
  if (!pose) window.__pcvToastsCrochet = setInterval(() => {
    if ((pose = crocheter()) || ++essais > 240) clearInterval(window.__pcvToastsCrochet);
  }, 250);
  let annonce = 0;
  window.__pcvToastsVeille = setInterval(() => {
    eteindreSteam();
    if (!retenues) {
      if (!compteur.hidden) compteur.hidden = true;
      return;
    }
    if (document.getElementById("pcv-notifs")?.hidden === false) {
      retenues = 0;
      annonce = 0;
      compteur.hidden = true;
      return;
    }
    majCompteur();
    if (annonce !== retenues && !enCours && !retenir()) {
      annonce = retenues;
      enCours = true;
      bulle(regroupe(retenues), 7e3).then(() => {
        enCours = false;
        suivante();
      });
    }
  }, 1e3);
  window.__pcvToasts = {
    etat: () => ({ pieces: !!pieces(), crochet: !!chercher().file?.__pcvCrochet, retenir: retenir(), cloche: !!clocheVue(), retenues, file: file.length, enCours, enJeu: enJeu() }),
    essai: (contenu, duree = 5e3) => bulle(contenu, duree),
    regroupe: (n) => bulle(regroupe(n), 7e3)
  };
  return "toasts pr\xEAts" + (pose ? "" : " (file de Steam pas encore charg\xE9e : crochet r\xE9essay\xE9)");
})();
