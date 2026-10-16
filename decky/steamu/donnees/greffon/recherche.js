(() => {
  clearInterval(window.__pcvRechercheSuivi);
  window.__pcvRechercheSuivi = setInterval(() => {
    if (document.body.dataset.pcvPage !== "recherche") return;
    document.querySelectorAll("[aria-labelledby] > [role=link] img").forEach((img) => {
      img.closest("[role=link]").parentElement.classList.toggle("pcv-sans-image", img.src.startsWith("data:"));
    });
  }, 300);
  return "recherche pr\xEAte";
})();
