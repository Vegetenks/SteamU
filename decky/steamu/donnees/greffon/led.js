(() => {
  const O = window.opener;
  const INTENTIONS = /* @__PURE__ */ new Set([
    "theme",
    "notif",
    "casino-entree",
    "casino-sortie",
    "casino-pince",
    "casino-pince-fin",
    "casino-gain",
    "casino-gain-double",
    "casino-gain-triple",
    "casino-perte",
    "ecran-jeu",
    "ecran-fin"
  ]);
  const MODES = ["theme", "non", "ecran"];
  const DELAI_MS = 4e3;
  const lire = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const mode = () => {
    const m = lire("pcv-led", "theme");
    return MODES.includes(m) ? m : "theme";
  };
  const appeler = (methode, ...args) => {
    try {
      return Promise.race([
        (O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, methode, ...args) ?? Promise.reject("Decky absent"),
        new Promise((_, non) => setTimeout(() => non("d\xE9lai"), DELAI_MS))
      ]);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const sonde = document.createElement("i");
  const couleurTheme = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--pcv-accent").trim();
    if (!v) return null;
    sonde.style.color = "";
    sonde.style.color = v;
    if (!sonde.style.color) return null;
    (document.body || document.documentElement).appendChild(sonde);
    const c = getComputedStyle(sonde).color;
    sonde.remove();
    const m = c.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return m ? "#" + m.slice(1, 4).map((x) => (+x).toString(16).padStart(2, "0")).join("") : null;
  };
  window.__pcvLed = (intention, couleur) => {
    if (!INTENTIONS.has(intention) || mode() === "non") return;
    if (intention === "theme") {
      const c = couleurTheme();
      if (c) appeler("led", "theme", c).catch(() => {
      });
      return;
    }
    if (intention === "casino-entree" && typeof couleur === "string" && /^#[0-9a-f]{6}$/i.test(couleur)) {
      appeler("led", intention, couleur).catch(() => {
      });
      return;
    }
    appeler("led", intention).catch(() => {
    });
  };
  window.__pcvLedReglage = (m = mode()) => appeler("led_reglage", MODES.includes(m) ? m : "non").then(() => {
    ecranAvant = null;
    window.__pcvLed("theme");
  });
  let essais = 0;
  const synchroniser = () => window.__pcvLedReglage().catch(() => {
    if (++essais < 3) setTimeout(synchroniser, 3e3);
  });
  synchroniser();
  let t = 0;
  const surTheme = () => {
    clearTimeout(t);
    t = setTimeout(() => window.__pcvLed("theme"), 250);
  };
  if (window.__pcvLedEcoute) window.removeEventListener("pcv-theme", window.__pcvLedEcoute);
  window.__pcvLedEcoute = surTheme;
  window.addEventListener("pcv-theme", surTheme);
  if (window.__pcvLedVue) document.removeEventListener("visibilitychange", window.__pcvLedVue);
  window.__pcvLedVue = () => {
    suivreEcran();
    if (document.visibilityState === "visible") surTheme();
  };
  document.addEventListener("visibilitychange", window.__pcvLedVue);
  const REDIRE_MS = 1e4, SUIVI_MS = 250, APRES_ACCES_MS = [1800, 4e3, 6200], APRES_FERMETURE_MS = [400, 2600];
  const jeu = () => {
    try {
      return !!O?.SteamUIStore?.MainRunningApp;
    } catch (e) {
      return false;
    }
  };
  const jeuId = window.__pcvLedJeuId = () => {
    try {
      return String(O?.SteamUIStore?.MainRunningApp?.appid || "");
    } catch (e) {
      return "";
    }
  };
  const ecranVoulu = () => {
    const id = jeuId();
    return mode() === "ecran" && !!id && !lire(window.__pcvLedSansCle, []).includes(id);
  };
  let ecranAvant = null;
  const suivreEcran = () => {
    const v = ecranVoulu();
    if (v === ecranAvant) return;
    const etait = ecranAvant;
    ecranAvant = v;
    appeler("led", v ? "ecran-jeu" : "ecran-fin").catch(() => {
      ecranAvant = null;
    });
    if (!v && etait) surTheme();
  };
  clearInterval(window.__pcvLedSuivi);
  (window.__pcvLedMinus || []).forEach(clearTimeout);
  let avant = 0, tRedit = Date.now();
  const minus = window.__pcvLedMinus = [];
  const redire = (delais) => {
    minus.forEach(clearTimeout);
    minus.length = 0;
    for (const ms of delais) minus.push(setTimeout(() => {
      tRedit = Date.now();
      window.__pcvLed("theme");
    }, ms));
  };
  window.__pcvLedSuivi = setInterval(() => {
    suivreEcran();
    let n = 0;
    try {
      n = window.__pcvMenus?.m_eOpenSideMenu || 0;
    } catch (e) {
    }
    if (n !== avant) {
      if (n === 2) redire(APRES_ACCES_MS);
      else if (n === 0) redire(APRES_FERMETURE_MS);
      avant = n;
      return;
    }
    if (Date.now() - tRedit > REDIRE_MS && document.visibilityState === "visible" && !jeu()) {
      tRedit = Date.now();
      window.__pcvLed("theme");
    }
  }, SUIVI_MS);
})();
