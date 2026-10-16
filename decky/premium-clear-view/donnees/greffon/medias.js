(() => {
  clearInterval(window.__pcvMediasSuivi);
  const O = window.opener;
  const IMG = (id, f) => `https://steamloopback.host/assets/${id}/${f}`;
  const CDN = (id, f) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${id}/${f}`;
  let parNom = null;
  const trouver = (nom) => {
    if (!parNom) {
      parNom = /* @__PURE__ */ new Map();
      for (const a of O.appStore.allApps || []) parNom.set(a.display_name.toLowerCase(), a);
    }
    return parNom.get(nom.trim().toLowerCase());
  };
  window.__pcvMediasSuivi = setInterval(() => {
    if (document.body.dataset.pcvPage !== "medias") return;
    const menu = [...document.querySelectorAll('.BasicUIContextMenu [role="menu"]')].find((m) => m.querySelector("input[placeholder]"));
    if (!menu) return;
    menu.classList.add("pcv-choix-jeu");
    const boite = menu.closest(".BasicUIContextMenu");
    if (boite && !boite.hasAttribute("data-pcv-choix-jeu")) boite.setAttribute("data-pcv-choix-jeu", "");
    menu.querySelectorAll('[role="menuitem"]').forEach((item, i) => {
      if (item.dataset.pcvJeu) return;
      const nom = item.querySelector("span")?.textContent || "";
      if (!nom) {
        item.dataset.pcvJeu = "annuler";
        return;
      }
      const a = trouver(nom);
      if (a) {
        let vert = "";
        try {
          vert = O.appStore.GetVerticalCapsuleURLForApp(a) || "";
        } catch (e) {
        }
        item.style.setProperty("--jaq", [IMG(a.appid, "library_600x900.jpg"), vert, CDN(a.appid, "library_600x900.jpg")].filter(Boolean).map((x) => `url('${String(x).replace(/['\\\n\r]/g, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))}')`).join(","));
        item.dataset.pcvJeu = "jeu";
      } else item.dataset.pcvJeu = "tous";
    });
  }, 150);
  (window.__pcvManette ||= {}).choixJeu = (b) => {
    if (b !== 11 && b !== 12 || !document.querySelector(".pcv-choix-jeu")) return false;
    try {
      const req = window.opener.__pcvReq ||= (() => {
        let r;
        window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r = q;
        }]);
        return r;
      })();
      const nm = req(61236).oy.NavigationManager, d = { button: b === 12 ? 10 : 9, source: 1, is_repeat: false };
      nm.DispatchVirtualGamepad("vgp_onbuttondown", d);
      nm.DispatchVirtualGamepad("vgp_onbuttonup", d);
    } catch (e) {
    }
    return true;
  };
  return "m\xE9diath\xE8que pr\xEAte";
})();
