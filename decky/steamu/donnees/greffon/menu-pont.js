(() => {
  const entrees = () => [...document.querySelectorAll(":is(._1LoZDVq2hD-hg_cS_zzsYn, ._2w9TpQwxU7vcwaAbf3KGv_, .o4dc4YuFACmgE_eLORMo1)")];
  const SORTES = {
    home: "accueil",
    library: "bibliotheque",
    store: "magasin",
    chat: "contacts",
    media: "medias",
    downloads: "telechargements",
    settings: "parametres",
    power: "alimentation"
  };
  const sorteDe = (el) => {
    const k = el && Object.keys(el).find((x) => x.startsWith("__reactFiber"));
    let n = 0;
    for (let f = k && el[k]; f && n < 10; f = f.return, n++) if (f.key != null) return SORTES[f.key] || "appli";
    return "appli";
  };
  const marquer = () => {
    for (const e of entrees()) {
      const v = sorteDe(e), enveloppe = e.parentElement;
      if (enveloppe && enveloppe.dataset.pcvMenu !== v) enveloppe.dataset.pcvMenu = v;
    }
  };
  document.documentElement.dataset.pcvFenetre = "menu";
  const O = window.opener;
  const entete = () => {
    try {
      const p = window.__pcvBridge.compteCourant(), r = document.documentElement.style;
      const av = p?.avatar || "", v = av && `url(${JSON.stringify(av)})`, n = p?.nom && JSON.stringify(p.nom);
      if (v && r.getPropertyValue("--pcv-avatar") !== v) r.setProperty("--pcv-avatar", v);
      if (n && r.getPropertyValue("--pcv-pseudo") !== n) r.setProperty("--pcv-pseudo", n);
    } catch (e) {
    }
  };
  window.__pcvMenuObs?.disconnect();
  const tour = () => {
    marquer();
    entete();
  };
  tour();
  (window.__pcvMenuObs = new MutationObserver(tour)).observe(document.body, { childList: true, subtree: true });
  const PAR_RANG = ["accueil", "bibliotheque", "magasin", "contacts", "medias", "telechargements", "parametres", "alimentation"];
  window.opener.__pcvAller = (n) => {
    marquer();
    const nom = typeof n === "number" ? PAR_RANG[n - 1] : n;
    const e = entrees().find((x) => x.parentElement?.dataset.pcvMenu === nom);
    if (e) e.click();
  };
  window.__pcvJeuFin?.();
  const JEU = { col: "{{NavigationColumn@ItemOuter}}", boite: "{{NavigationBox@ItemOuter}}", entree: "{{NavigationMenuItem@ItemOuter}}", racine: "{{AppRunningControls@ItemOuter}}" };
  const T = (k, f, vars) => window.__pcvT?.(k, vars) ?? f;
  const ROLES = { resume: ["reprendre", T("home.reprendre", "Reprendre")], exit: ["fermer", T("dispo.fermer", "Fermer")] };
  const IMG = (id, f) => `https://steamloopback.host/assets/${id}/${f}`;
  const CDN = (id, f) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${id}/${f}`;
  const fibre = (el) => {
    const k = el && Object.keys(el).find((x) => x.startsWith("__reactFiber"));
    return k ? el[k] : null;
  };
  const cleDe = (el) => {
    let n = 0;
    for (let f = fibre(el); f && n < 8; f = f.return, n++) if (f.key != null) return f.key;
    return null;
  };
  window.__pcvJeuEntrees = async () => {
    const l = () => [...document.querySelectorAll(JEU.entree)].map((el) => ({ cle: cleDe(el), el })).filter((x) => x.cle);
    if (!l().length) {
      noeud(entrees().find((e) => e.parentElement?.dataset.pcvMenu === "appli"))?.BTakeFocus(4);
      await new Promise((r) => setTimeout(r, 300));
    }
    return l();
  };
  window.__pcvJeuEntree = async (cle) => (await window.__pcvJeuEntrees()).find((x) => x.cle === cle)?.el || null;
  const noeud = (el) => {
    let n = 0;
    for (let f = fibre(el); f && n < 20; f = f.return, n++) for (const p of [f.memoizedProps, f.pendingProps]) if (p?.node && typeof p.node.BTakeFocus === "function") return p.node;
    return null;
  };
  const appDe = (col) => {
    let a = null, n = 0;
    for (let f = fibre(col); f && n < 12 && !a; f = f.return, n++) {
      const p = f.memoizedProps?.app;
      if (p?.appid) a = p;
    }
    try {
      a ||= O.SteamUIStore.MainRunningApp;
      return a && O.appStore.GetAppOverviewByAppID(a.appid) || a || null;
    } catch (e) {
      return a;
    }
  };
  const perso = (f, a) => {
    try {
      return O.appStore[f](a) || [];
    } catch (e) {
      return [];
    }
  };
  const imagesDe = (a) => {
    const nonSteam = a.app_type === 1073741824;
    let vert = "";
    try {
      vert = O.appStore.GetVerticalCapsuleURLForApp(a) || "";
    } catch (e) {
    }
    return [...perso("GetCustomVerticalCapsuleURLs", a), ...nonSteam ? [] : [IMG(a.appid, "library_600x900.jpg"), vert, CDN(a.appid, "library_600x900.jpg")]].filter(Boolean);
  };
  const poserImage = (img, a) => {
    const l = imagesDe(a);
    let i = 0, icone = "";
    try {
      icone = O.appStore.GetIconURLForApp(a) || "";
    } catch (e) {
    }
    const suivant = () => {
      if (i < l.length) {
        img.className = "";
        img.src = l[i++];
      } else if (icone && img.className !== "pcv-icone") {
        img.className = "pcv-icone";
        img.src = icone;
      } else {
        img.onerror = null;
        img.removeAttribute("src");
        img.className = "pcv-vide";
      }
    };
    img.onerror = suivant;
    suivant();
  };
  const debuts = O.__pcvJeuDebut ||= {};
  let abo = null;
  try {
    abo = O.SteamClient.GameSessions.RegisterForAppLifetimeNotifications((n) => {
      if (n.bRunning) debuts[n.unAppID] = Date.now() / 1e3;
    });
  } catch (e) {
  }
  const debut = (a) => {
    const t = Date.now() / 1e3, t0 = debuts[a.appid] || a.rt_recent_activity_time;
    return t0 > 0 && t0 <= t ? t0 : debuts[a.appid] = t;
  };
  window.__pcvJeuOutils = { IMG, CDN, perso, debut };
  const ecrireDuree = (el, a) => {
    const t = Date.now() / 1e3, t0 = debut(a);
    const m = Math.floor((t - t0) / 60), h = Math.floor(m / 60), s = "\u25CF " + T("dispo.en_cours", "En cours") + ", " + (h ? `${h} h ${m % 60} min` : `${m} min`);
    if (el.textContent !== s) el.textContent = s;
  };
  const habiller = (col) => {
    const a = appDe(col);
    if (!a) return false;
    let jaq = col.querySelector(":scope > .pcv-jeu-jaq"), info = col.querySelector(":scope > .pcv-jeu-info");
    if (!jaq) {
      jaq = document.createElement("div");
      jaq.className = "pcv-jeu-jaq";
      jaq.appendChild(document.createElement("img"));
      col.prepend(jaq);
    }
    if (!info) {
      info = document.createElement("div");
      info.className = "pcv-jeu-info";
      info.append(document.createElement("div"), document.createElement("div"));
      info.firstChild.className = "pcv-jeu-nom";
      info.lastChild.className = "pcv-jeu-etat";
      jaq.after(info);
    }
    if (jaq.dataset.app !== String(a.appid)) {
      jaq.dataset.app = a.appid;
      poserImage(jaq.firstChild, a);
    }
    const nom = a.display_name || "";
    if (info.firstChild.textContent !== nom) info.firstChild.textContent = nom;
    ecrireDuree(info.lastChild, a);
    return true;
  };
  const ramener = () => {
    if (!("pcvJeuCarte" in document.documentElement.dataset)) return;
    const f = document.querySelector(".gpfocus"), r = f?.closest(JEU.racine);
    if (!r || f.matches("[data-pcv-jeu]")) return;
    noeud(r.querySelector("[data-pcv-jeu=reprendre]"))?.BTakeFocus(4);
  };
  let suivi = null, suivie = null;
  const jeuTour = () => {
    const h = document.documentElement, col = document.querySelector(JEU.col), boite = col?.querySelector(JEU.boite);
    let ok = false;
    if (boite) {
      const vus = /* @__PURE__ */ new Set();
      for (const e of boite.querySelectorAll(JEU.entree)) {
        const r2 = e.parentElement === boite && ROLES[cleDe(e)];
        if (r2) {
          vus.add(r2[0]);
          if (e.dataset.pcvJeu !== r2[0]) {
            e.dataset.pcvJeu = r2[0];
            e.dataset.pcvLibelle = r2[1];
          }
        } else if ("pcvJeu" in e.dataset) {
          delete e.dataset.pcvJeu;
          delete e.dataset.pcvLibelle;
        }
      }
      ok = vus.size === 2 && habiller(col);
    }
    if (ok !== "pcvJeuCarte" in h.dataset) {
      if (ok) h.dataset.pcvJeuCarte = "";
      else delete h.dataset.pcvJeuCarte;
    }
    const r = ok ? col.closest(JEU.racine) : null;
    if (r !== suivie) {
      suivi?.disconnect();
      suivi = null;
      suivie = r;
      if (r) {
        (suivi = new MutationObserver(ramener)).observe(r, { attributes: true, attributeFilter: ["class"], subtree: true });
        ramener();
      }
    }
  };
  const touche = (ev) => {
    const b = ev.detail?.button;
    if (!(b >= 9 && b <= 12) || !("pcvJeuCarte" in document.documentElement.dataset)) return;
    const f = document.querySelector("[data-pcv-jeu].gpfocus");
    if (!f || b === 11 && f.dataset.pcvJeu === "reprendre") {
      setTimeout(ramener, 0);
      return;
    }
    ev.stopPropagation();
    ev.preventDefault();
    const vers = b === 12 && f.dataset.pcvJeu === "reprendre" ? "fermer" : b === 11 && f.dataset.pcvJeu === "fermer" ? "reprendre" : null;
    if (vers) noeud(f.parentElement.querySelector(`[data-pcv-jeu=${vers}]`))?.BTakeFocus(4);
  };
  window.addEventListener("vgp_onbuttondown", touche, true);
  const jeuObs = new MutationObserver(jeuTour);
  jeuObs.observe(document.body, { childList: true, subtree: true });
  const minute = setInterval(() => {
    if ("pcvJeuCarte" in document.documentElement.dataset) jeuTour();
  }, 15e3);
  jeuTour();
  window.__pcvJeuFin = () => {
    try {
      abo?.unregister();
    } catch (e) {
    }
    jeuObs.disconnect();
    suivi?.disconnect();
    clearInterval(minute);
    window.removeEventListener("vgp_onbuttondown", touche, true);
    delete document.documentElement.dataset.pcvJeuCarte;
    document.querySelectorAll(".pcv-jeu-jaq, .pcv-jeu-info").forEach((e) => e.remove());
    document.querySelectorAll("[data-pcv-jeu]").forEach((e) => {
      delete e.dataset.pcvJeu;
      delete e.dataset.pcvLibelle;
    });
  };
  return "pont pr\xEAt : " + entrees().length + " entr\xE9es";
})();
