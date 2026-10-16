(() => {
  const h = document.documentElement;
  let d = null;
  try {
    d = window.opener.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.m_BrowserWindow.document;
  } catch (e) {
  }
  if (!d) return "apparence : pas de fen\xEAtre principale";
  const copier = () => {
    const a = d.documentElement.dataset.pcvApparence || "clair";
    if (h.dataset.pcvApparence !== a) h.dataset.pcvApparence = a;
  };
  window.__pcvApparenceSuivi?.disconnect();
  (window.__pcvApparenceSuivi = new MutationObserver(copier)).observe(d.documentElement, { attributes: true, attributeFilter: ["data-pcv-apparence"] });
  copier();
  return "apparence : suit la fen\xEAtre principale";
})();
