(() => {
  clearInterval(window.__pcvCollectionsSuivi);
  const O = window.opener;
  const JAQ = (a) => {
    let v = "";
    try {
      v = O.appStore.GetVerticalCapsuleURLForApp(a) || "";
    } catch (e) {
    }
    return [`https://steamloopback.host/assets/${a.appid}/library_600x900.jpg`, v, `https://shared.steamstatic.com/store_item_assets/steam/apps/${a.appid}/library_600x900.jpg`].filter(Boolean).map((x) => `url('${String(x).replace(/['\\\n\r]/g, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))}')`).join(",");
  };
  window.__pcvCollectionsSuivi = setInterval(() => {
    if (document.body.dataset.pcvPage !== "bibliotheque") return;
    const parNom = new Map((O.collectionStore?.userCollections || []).map((c) => [c.displayName, c]));
    document.querySelectorAll("._3IWn-2rn7x98o5fDd0rAxb").forEach((tuile) => {
      const nom = tuile.querySelector("._1J1LQ0vGtpM3n0xw7XwQM6 > div")?.textContent?.trim();
      if (!nom || tuile.dataset.pcvColl === nom) return;
      tuile.dataset.pcvColl = nom;
      const c = parNom.get(nom), apps = (c?.allApps || []).filter((a) => a.app_type === 1).slice(0, 3);
      tuile.dataset.pcvVide = apps.length ? "non" : "oui";
      apps.forEach((a, i) => tuile.style.setProperty(`--j${i}`, JAQ(a)));
      tuile.style.setProperty("--n", apps.length);
    });
  }, 300);
  return "collections pr\xEAtes";
})();
