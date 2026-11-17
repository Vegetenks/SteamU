(() => {
  const jeton = window.__pcvPrechargementMii = /* @__PURE__ */ Symbol("prechargement-mii");
  const essayer = (n) => requestIdleCallback(() => {
    if (window.__pcvPrechargementMii !== jeton || window.__pcvMii3D?.vrais) return;
    window.__pcvVraisMii.charger().catch(() => {
      if (n < 80 && window.__pcvPrechargementMii === jeton) setTimeout(() => essayer(n + 1), 1500);
    });
  }, { timeout: 1e3 });
  essayer(0);
  return "pr\xE9chargement des Mii au repos";
})();
