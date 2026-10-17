(() => {
  const O = window.opener;
  const manques = () => {
    try {
      return Promise.race([
        ((O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "nintendo") ?? Promise.reject()).catch(() => null),
        new Promise((r) => setTimeout(() => r(null), 4e3))
      ]);
    } catch (e) {
      return Promise.resolve(null);
    }
  };
  const libre = (m, appli) => Array.isArray(m?.[appli]) && !m[appli].length;
  const sonder = () => manques().then((m) => ({ mii: libre(m, "mii"), casino: libre(m, "casino"), badges: libre(m, "badges"), sons: libre(m, "sons"), repondu: !!m }));
  const jeton = window.__pcvNintendoJeton = /* @__PURE__ */ Symbol("nintendo");
  const essayer = async (n) => {
    const F = await sonder();
    if (window.__pcvNintendoJeton !== jeton) return F;
    if (F.repondu || n >= 9) return F;
    await new Promise((r) => setTimeout(r, 1500));
    return essayer(n + 1);
  };
  const T = (k) => window.__pcvT?.(k) ?? k;
  const touche = (k) => {
    const [, c, h] = window.__pcvTouche?.(k) || ["", "#5b6676", ""];
    return `<u style="background:${c}">${h}</u>`;
  };
  document.getElementById("pcv-verrou")?.remove();
  let ecran = null;
  const fermer = () => {
    if (!ecran || ecran.hidden) return;
    ecran.hidden = true;
    const o = window.__pcvOrdre;
    if (Array.isArray(o) && o.includes("verrou")) o.splice(o.indexOf("verrou"), 1);
  };
  const versGreffon = () => {
    fermer();
    window.__pcvSon?.("choisir");
    window.__pcvSteamU?.ouvrir?.();
  };
  const revenir = () => {
    fermer();
    window.__pcvSon?.("retour");
    if (!/^\/routes\/library\/home/.test(O?.location?.pathname || "")) O?.__pcvAller?.(1);
  };
  const montrer = (manque) => {
    window.__pcvEcran?.fermer?.();
    window.__pcvLancement?.fermer?.();
    if (!ecran) {
      ecran = document.createElement("div");
      ecran.id = "pcv-verrou";
      ecran.hidden = true;
      document.body.appendChild(ecran);
      ecran.addEventListener("click", (e) => {
        if (e.target.closest(".ajouter")) versGreffon();
        else if (e.target.closest(".revenir")) revenir();
      });
    }
    const textes = [...new Set(manque.map((d) => {
      const k = "verrou.manque." + d, t = T(k);
      return t === k ? T("verrou.manque.inconnu") : t;
    }))];
    ecran.innerHTML = `<style>
      #pcv-verrou { position: fixed; inset: 0; z-index: 9650; display: flex; align-items: center; justify-content: center; background: var(--pcv-fond-page, #f3f5f3);
        font-family: var(--pcv-police, sans-serif); color: var(--pcv-texte, #2f3a4a); }
      #pcv-verrou[hidden] { display: none; }
      #pcv-verrou .carte { width: min(88vw, calc(var(--u) * 780)); padding: calc(var(--u) * 44) calc(var(--u) * 48); border-radius: calc(var(--u) * 36); text-align: center;
        background: color-mix(in srgb, var(--pcv-carte) 92%, transparent); box-shadow: 0 calc(var(--u) * 10) calc(var(--u) * 40) rgba(0,0,0,.14); }
      #pcv-verrou .cad { width: calc(var(--u) * 112); height: calc(var(--u) * 112); padding: calc(var(--u) * 24); border-radius: 50%; background: var(--pcv-accent, #2fb8ff); box-sizing: border-box; }
      #pcv-verrou h1 { margin: calc(var(--u) * 20) 0 calc(var(--u) * 10); font-size: calc(var(--u) * 42); font-weight: 800; }
      #pcv-verrou p { margin: 0; font-size: calc(var(--u) * 26); line-height: 1.35; }
      #pcv-verrou ul { list-style: none; margin: calc(var(--u) * 16) 0 calc(var(--u) * 32); padding: 0; font-size: calc(var(--u) * 29); font-weight: 800; }
      #pcv-verrou li { margin: calc(var(--u) * 6) 0; }
      #pcv-verrou li::before { content: "\u25CF "; color: var(--pcv-accent, #2fb8ff); }
      #pcv-verrou button { border: 0; font: inherit; cursor: pointer; display: inline-flex; align-items: center; gap: calc(var(--u) * 14); }
      #pcv-verrou .ajouter { padding: calc(var(--u) * 22) calc(var(--u) * 50); border-radius: 999px; background: var(--pcv-accent, #2fb8ff); color: var(--pcv-sur-accent); font-size: calc(var(--u) * 33); font-weight: 800;
        box-shadow: inset 0 3px 1px rgba(255,255,255,.5), 0 calc(var(--u) * 6) calc(var(--u) * 18) rgba(0,0,0,.18); }
      #pcv-verrou .aide { margin-top: calc(var(--u) * 18); font-size: calc(var(--u) * 22); opacity: .75; }
      #pcv-verrou .revenir { position: absolute; left: calc(var(--u) * 32); bottom: calc(var(--u) * 28); background: none; color: inherit; font-size: calc(var(--u) * 25); font-weight: 700; }
      #pcv-verrou u { display: inline-flex; align-items: center; justify-content: center; width: calc(var(--u) * 42); height: calc(var(--u) * 42); border-radius: 50%; color: var(--pcv-sur-accent);
        text-decoration: none; font-size: calc(var(--u) * 22); font-weight: 800; box-shadow: 0 0 0 calc(var(--u) * 3) var(--pcv-lisere); }
      #pcv-verrou u svg { width: 60%; height: 60%; }
    </style><div class="carte"><svg class="cad" viewBox="0 0 24 24" fill="none" stroke="var(--pcv-sur-accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2.6"/><path d="M8 11V7.6a4 4 0 0 1 8 0V11"/></svg>
      <h1>${T("verrou.titre")}</h1><p>${T("verrou.texte")}</p><ul>${textes.map((t) => `<li>${t}</li>`).join("")}</ul>
      <button class="ajouter">${touche(1)}${T("verrou.bouton")}</button><p class="aide">${T("verrou.aide")}</p></div>
      <button class="revenir">${touche(2)}${T("verrou.retour")}</button>`;
    ecran.hidden = false;
    window.__pcvSon?.("rate");
    const o = window.__pcvOrdre;
    if (Array.isArray(o) && !o.includes("verrou")) o.unshift("verrou");
  };
  (window.__pcvManette ||= {}).verrou = (b) => {
    if (!ecran || ecran.hidden) return false;
    if (b === 1) versGreffon();
    else if (b === 2) revenir();
    return true;
  };
  window.removeEventListener("keydown", window.__pcvTouchesVerrou, true);
  window.addEventListener("keydown", window.__pcvTouchesVerrou = (e) => {
    const b = { Enter: 1, Escape: 2 }[e.key];
    if (b && window.__pcvManette?.verrou?.(b)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
  const exiger = async (appli) => {
    const m = await manques(), manque = Array.isArray(m?.[appli]) ? m[appli] : ["inconnu"];
    if (!manque.length) return true;
    montrer(manque);
    return false;
  };
  const PRET = essayer(0).then(({ repondu, ...F }) => {
    if (window.__pcvNintendoJeton !== jeton) return window.__pcvNintendo;
    Object.assign(window.__pcvNintendo, F);
    window.dispatchEvent(new Event("pcv-nintendo"));
    return window.__pcvNintendo;
  });
  window.__pcvNintendo = Object.assign(window.__pcvNintendo || {}, { mii: false, casino: false, badges: false, sons: false, pret: PRET, exiger, fermer, ouvert: () => !!ecran && !ecran.hidden });
  return "verrou Nintendo : v\xE9rification en cours";
})();
