(() => {
  const regles = [
    ['path[d^="M3 33H10.54"], path.pcv-chemin-wifi', "pcv-chemin-wifi", (e) => e.getAttribute("d")?.startsWith("M3 33H10.54") || false],
    // (lot 17) la pile dont le dessin garde un <rect> dans un <svg> imbriqué (theme-wiiu.src.css) : marquée sur la pile elle-même,
    // plus sur chaque <rect> de la page (chaque icône insérée changeait une classe lue par un :has() et réévaluait html et body)
    ["{{BatteryIcon@LegacySizing}}", "pcv-pile-rect", (e) => !!e.querySelector("svg svg rect")],
    [".DialogContent", "pcv-stockage", (e) => !!e.querySelector('[data-appid][role="button"]')],
    ["{{HeaderItem@Header}}", "pcv-sans-enfant", (e) => !e.firstElementChild],
    ["svg", "pcv-svg-vide", (e) => !e.querySelector('*:not([d=""])')],
    ["{{BasicUiRoot@BasicHome}}", "pcv-fond-transparent", (e) => !!e.querySelector(":scope > * > {{TransparentBackground@BasicHome}}")],
    ["#pcv-ar", "pcv-sous-ouvert", (e) => !!e.querySelector(":scope > .sousecran:not([hidden])")],
    ["#pcv-ar", "pcv-lecteur-ouvert", (e) => !!e.querySelector(":scope > :is(.musique, .paroles):not([hidden])")]
  ];
  const sujets = regles.map(([s]) => s).join(","), marques = new Set(regles.map(([, c]) => c));
  const classesSteam = (texte) => (texte || "").split(/\s+/).filter((c) => c && !marques.has(c)).join(" ");
  const marquer = (e) => {
    for (const [s, c, lire] of regles) if (e.matches(s)) {
      const oui = lire(e);
      if (e.classList.contains(c) !== oui) e.classList.toggle(c, oui);
    }
  };
  window.__pcvRelationsTheme?.disconnect();
  document.querySelectorAll(sujets).forEach(marquer);
  window.__pcvRelationsTheme = new MutationObserver((changements) => {
    const touches = /* @__PURE__ */ new Set();
    for (const m of changements) {
      if (m.attributeName === "class" && classesSteam(m.oldValue) === classesSteam(m.target.getAttribute("class"))) continue;
      for (let e = m.target; e?.nodeType === 1; e = e.parentElement) if (e.matches(sujets)) touches.add(e);
      for (const n of m.addedNodes || []) if (n.nodeType === 1) {
        if (n.matches(sujets)) touches.add(n);
        n.querySelectorAll(sujets).forEach((e) => touches.add(e));
      }
    }
    touches.forEach(marquer);
  });
  window.__pcvRelationsTheme.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ["class", "hidden", "data-appid", "role", "d"]
  });
})();
