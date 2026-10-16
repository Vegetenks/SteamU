(() => {
  const COMBO = [15, 16], DUREE = 4e3;
  const O = window.opener || window;
  const S = window.__pcvSecours ||= { tenus: /* @__PURE__ */ new Set(), minuteur: 0 };
  for (const [n, f] of S.ecouteurs || []) window.removeEventListener(n, f, true);
  const E = window.__pcvErreurs ||= [];
  const noter = (texte) => {
    try {
      E.push([Date.now(), String(texte).slice(0, 600)]);
      if (E.length > 200) E.splice(0, E.length - 200);
    } catch (e) {
    }
  };
  const arreter = async () => {
    S.minuteur = 0;
    S.tenus.clear();
    try {
      document.getElementById("theme-clair")?.remove();
    } catch (e) {
    }
    try {
      await Promise.race([O.DeckyBackend.call("loader/call_plugin_method", window.__pcvGreffon.nom, "arret_urgence"), new Promise((r) => setTimeout(r, 2e3))]);
    } catch (e) {
    }
    setTimeout(() => {
      try {
        O.SteamClient.Browser.RestartJSContext();
      } catch (e) {
        O.location.reload();
      }
    }, 300);
  };
  const suivre = () => {
    if (COMBO.every((b) => S.tenus.has(b))) {
      if (!S.minuteur) S.minuteur = setTimeout(arreter, DUREE);
    } else if (S.minuteur) {
      clearTimeout(S.minuteur);
      S.minuteur = 0;
    }
  };
  S.ecouteurs = [
    ["vgp_onbuttondown", (e) => {
      S.tenus.add(e.detail?.button);
      suivre();
    }],
    ["vgp_onbuttonup", (e) => {
      S.tenus.delete(e.detail?.button);
      suivre();
    }],
    ["blur", (e) => {
      if (e.target === window) {
        S.tenus.clear();
        suivre();
      }
    }],
    // fenêtre quittée touches tenues : on ne recevra pas leur relâchement
    ["error", (e) => e.message && noter(`${e.message} @ ${e.filename}:${e.lineno}:${e.colno}`)],
    ["unhandledrejection", (e) => noter("promesse rejet\xE9e : " + (e.reason?.stack || e.reason))]
  ];
  for (const [n, f] of S.ecouteurs) window.addEventListener(n, f, true);
})();
