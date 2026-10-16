(() => {
  window.__pcvAlimFin?.();
  window.__pcvAlimObs?.disconnect();
  const O = window.opener;
  const requis = (n) => {
    try {
      return (O.__pcvReq ||= (() => {
        let r;
        O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })())(n);
    } catch (e) {
      return null;
    }
  };
  const loc = (t) => {
    try {
      return (O.LocalizationManager || window.LocalizationManager).LocalizeString(t);
    } catch (e) {
      return null;
    }
  };
  const net = (s) => (s || "").replace(/\s+/g, " ").trim();
  const SORTES = [
    ["veille", "Veille", ["#Sleep", "#Quit_Sleep"], /veille/i],
    ["redemarrer", "Red\xE9marrer", ["#Restart", "#Quit_Restart", "#RestartDevice"], /^red[ée]marrer( le système| l'appareil)?$/i],
    ["bureau", "Bureau", ["#SwitchToDesktop"], /bureau/i],
    ["eteindre", "\xC9teindre", ["#Shutdown", "#Quit_Shutdown"], /^(arr[êe]ter|[ée]teindre)/i]
  ];
  const CONFIRMES = [
    ["veille", ["#Sleep", "#Quit_Sleep"]],
    ["redemarrer", ["#Restart", "#Quit_Restart", "#RestartDevice", "#RestartSteam"]],
    ["eteindre", ["#Shutdown", "#Quit_Shutdown", "#ExitSteam"]]
  ];
  let textes = null;
  const lire = () => textes ||= {
    power: net(loc("#Power")),
    annuler: net(loc("#Button_Cancel")) || "Annuler",
    sur: net(loc("#Dialog_AreYouSure")),
    sortes: SORTES.map(([id, , jetons, re]) => [id, new Set(jetons.map((j) => net(loc(j))).filter(Boolean)), re]),
    confirmes: CONFIRMES.map(([id, jetons]) => [id, new Set(jetons.map((j) => net(loc(j))).filter(Boolean))])
  };
  const sorteDe = (texte) => {
    const t = net(texte), L = lire();
    for (const [id, set, re] of L.sortes) if (set.size ? set.has(t) : re.test(t)) return id;
    return null;
  };
  let batterie = "";
  let abonnement = null;
  let dernier = null, pileVue = null;
  const poserEclair = (s) => {
    for (const svg of document.getElementById("header")?.querySelectorAll('svg:is([viewBox="0 0 48 36"], [viewBox="0 0 42 36"])') || []) {
      if (![...svg.querySelectorAll("path")].some((p) => /^M(39 6H0V30H39V22H42V14H39V6|0 6H39V14H42V22H39V30H0V6)/.test(p.getAttribute("d") || ""))) continue;
      const carte = svg.parentElement?.parentElement;
      if (!carte || getComputedStyle(carte).getPropertyValue("--pcv-marque-bat").trim() !== "1") continue;
      const repere = svg.parentElement;
      let eclair = repere.querySelector(".pcv-eclair");
      const charge = !!s?.bHasBattery && s.eACState === 2;
      if (charge && !eclair) {
        eclair = document.createElement("div");
        eclair.className = "pcv-eclair";
        repere.appendChild(eclair);
      } else if (!charge && eclair) eclair.remove();
      const pile = carte.parentElement, steam = !!pile.querySelector("{{Percentage@BatteryIcon}}")?.textContent.trim();
      pileVue = pile;
      let pct = pile.querySelector(":scope > .pcv-pct");
      if (steam || !s?.bHasBattery) pct?.remove();
      else {
        if (!pct) {
          pct = document.createElement("div");
          pct.className = "pcv-pct";
          pile.prepend(pct);
        }
        pct.textContent = Math.round((s.flLevel || 0) * 100) + "%";
      }
    }
  };
  try {
    abonnement = O.SteamClient.System.RegisterForBatteryStateChanges((s) => {
      batterie = s?.bHasBattery ? Math.round((s.flLevel || 0) * 100) + " %" : "";
      for (const c of document.querySelectorAll("[data-pcv-alim-carte]")) c.dataset.pcvBatterie = batterie;
      document.documentElement.classList.toggle("pcv-bat-bas", !!s?.bHasBattery && (s.flLevel || 0) < 0.2);
      dernier = s;
      poserEclair(s);
    });
  } catch (e) {
  }
  const legende = document.createElement("div");
  legende.id = "pcv-alim-legende";
  legende.hidden = true;
  document.getElementById("pcv-alim-legende")?.remove();
  document.body.appendChild(legende);
  const glyphe = (code) => {
    const [t, c, h] = window.__pcvTouche?.(code) || [code === 1 ? "A" : "B", code === 1 ? "#2fbf71" : "#e5484d"];
    const u = document.createElement("u");
    if (h) u.innerHTML = h;
    else u.textContent = t;
    u.style.background = c;
    return u;
  };
  const ecrireLegende = (avecChoisir) => {
    const cle = (avecChoisir ? "1" : "0") + (document.documentElement.dataset.pcvManette || "") + ("pcvInverse" in document.documentElement.dataset);
    if (legende.dataset.cle === cle) return;
    legende.dataset.cle = cle;
    legende.textContent = "";
    for (const [code, mot] of avecChoisir ? [[1, "Choisir"], [2, "Annuler"]] : [[2, "Annuler"]]) {
      const s = document.createElement("span");
      s.append(glyphe(code), mot);
      legende.appendChild(s);
    }
  };
  const MENU = "{{BasicContextMenuContainer@contextMenuContents}}", TETE = "{{BasicContextMenuHeader@contextMenuContents}}";
  const menus = document.getElementsByClassName("BasicUIContextMenu");
  const boites = document.getElementsByClassName("GenericConfirmDialog");
  const marquerMenu = (m) => {
    const carte = m.querySelector(MENU), items = m.querySelectorAll(".contextMenuItem");
    if (!carte || !items.length) return;
    const L = lire();
    if (!("pcvAlim" in m.dataset)) {
      const tete = net(m.querySelector(TETE)?.textContent);
      if (!(L.power && tete === L.power) && [...items].filter((it) => sorteDe(it.textContent)).length < 2) {
        m.dataset.pcvNon = "";
        return;
      }
      m.dataset.pcvAlim = "";
      ordre();
    }
    if (!("pcvAlimCarte" in carte.dataset)) {
      carte.dataset.pcvAlimCarte = "";
      carte.dataset.pcvBatterie = batterie;
    }
    let pilules = 0;
    for (const it of items) {
      const d = it.dataset;
      if (!d.pcvIco && !("pcvAutre" in d) && !("pcvAnnuler" in d)) {
        const s = sorteDe(it.textContent);
        if (s) {
          d.pcvIco = s;
          const w = document.createTreeWalker(it, NodeFilter.SHOW_TEXT);
          let n, t = null;
          while (n = w.nextNode()) if (n.textContent.trim()) t = n;
          const court = SORTES.find((x) => x[0] === s)[1];
          if (t && t.textContent !== court) t.textContent = court;
        } else if (net(it.textContent) === L.annuler) d.pcvAnnuler = "";
        else d.pcvAutre = "";
      }
      if ("pcvAutre" in d) pilules++;
    }
    if (!pilules !== !("pcvPilules" in carte.dataset)) {
      if (pilules) carte.dataset.pcvPilules = "";
      else delete carte.dataset.pcvPilules;
    }
  };
  const marquerBoite = (b) => {
    if (b.matches("{{DelayedActionDialog@DelayedActionContents}}")) {
      b.dataset.pcvConf = "bureau";
      b.dataset.pcvAttente = "";
      return;
    }
    const tete = b.querySelector(".DialogHeader");
    if (!tete) return;
    b.dataset.pcvNon = "";
    const L = lire(), titre = net(tete.textContent), texte = net(b.querySelector(".DialogBodyText")?.textContent);
    if (!L.sur || texte !== L.sur) return;
    const c = L.confirmes.find(([, set]) => set.has(titre));
    if (c) {
      b.dataset.pcvConf = c[0];
      delete b.dataset.pcvNon;
    }
  };
  const tour = () => {
    let ouvert = 0;
    for (const m of menus) {
      if (!("pcvNon" in m.dataset)) marquerMenu(m);
      if ("pcvAlim" in m.dataset) ouvert = 2;
    }
    for (const b of boites) {
      if (!b.dataset.pcvConf && !("pcvNon" in b.dataset)) marquerBoite(b);
      if (b.dataset.pcvConf) ouvert = Math.max(ouvert, "pcvAttente" in b.dataset ? 1 : 2);
    }
    if (ouvert) ecrireLegende(ouvert === 2);
    if (ouvert) try {
      const M = O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore;
      if (M.m_eOpenSideMenu) M.CloseSideMenus();
    } catch (e) {
    }
    if (legende.hidden !== !ouvert) {
      legende.hidden = !ouvert;
      if (ouvert) document.documentElement.dataset.pcvAlimOuvert = "";
      else delete document.documentElement.dataset.pcvAlimOuvert;
    }
  };
  const noeud = (el) => {
    const k = el && Object.keys(el).find((x) => x.startsWith("__reactFiber"));
    if (!k) return null;
    for (let f = el[k]; f; f = f.return) for (const p of [f.memoizedProps, f.pendingProps]) if (p?.node && typeof p.node.BTakeFocus === "function") return p.node;
    return null;
  };
  const centre = (e) => {
    const r = e.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, w: r.width };
  };
  const deplacer = (b) => {
    if (b < 9 || b > 12) return false;
    const m = [...menus].find((x) => "pcvAlim" in x.dataset), f = m?.querySelector(".contextMenuItem.gpfocus");
    if (!f) return false;
    const ici = centre(f), autres = [...m.querySelectorAll(".contextMenuItem[data-pcv-ico], .contextMenuItem[data-pcv-autre]")].filter((e) => e !== f).map((e) => [e, centre(e)]).filter(([, c]) => c.w > 0 && c.h > 0);
    const memeRang = ([, c]) => Math.abs(c.y - ici.y) < ici.h / 2;
    let cands;
    if (b === 11 || b === 12) cands = autres.filter((a) => memeRang(a) && (b === 12 ? a[1].x > ici.x : a[1].x < ici.x)).sort((a, z) => Math.abs(a[1].x - ici.x) - Math.abs(z[1].x - ici.x));
    else {
      const bas = b === 10, loin = autres.filter((a) => !memeRang(a) && (bas ? a[1].y > ici.y : a[1].y < ici.y));
      const dy = Math.min(...loin.map(([, c]) => Math.abs(c.y - ici.y)));
      cands = loin.filter(([, c]) => Math.abs(Math.abs(c.y - ici.y) - dy) < ici.h / 2).sort((a, z) => Math.abs(a[1].x - ici.x) - Math.abs(z[1].x - ici.x));
    }
    const n = cands.length ? noeud(cands[0][0]) : null;
    if (n) {
      n.BTakeFocus(4);
      return true;
    }
    return false;
  };
  (window.__pcvManette ||= {}).alim = deplacer;
  const ordre = () => {
    const o = window.__pcvOrdre;
    if (Array.isArray(o) && o[0] !== "alim") {
      const i = o.indexOf("alim");
      if (i > 0) o.splice(i, 1);
      o.unshift("alim");
    }
  };
  ordre();
  tour();
  const obs = new MutationObserver(() => {
    tour();
    if (dernier && !pileVue?.isConnected) poserEclair(dernier);
  });
  obs.observe(document.body, { childList: true, subtree: true });
  window.__pcvAlimFin = () => {
    obs.disconnect();
    try {
      abonnement?.unregister?.();
    } catch (e) {
    }
    legende.remove();
    delete document.documentElement.dataset.pcvAlimOuvert;
    document.documentElement.classList.remove("pcv-bat-bas");
    document.querySelectorAll(".pcv-eclair").forEach((e) => e.remove());
    const o = window.__pcvOrdre;
    if (Array.isArray(o) && o.includes("alim")) o.splice(o.indexOf("alim"), 1);
    delete window.__pcvManette?.alim;
  };
  return "alimentation pr\xEAte";
})();
