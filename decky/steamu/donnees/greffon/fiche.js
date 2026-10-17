(() => {
  window.__pcvFicheObs?.disconnect();
  document.querySelectorAll(".pcv-puces, .pcv-cartes, .pcv-fiche-switch").forEach((e) => e.remove());
  const O = window.opener;
  const Tr = window.__pcvT || ((c) => c);
  const h = (min) => min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
  const jour = (rt) => new Date(rt * 1e3).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const joli = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t;
  const avatar = () => document.querySelector("#header_profile img")?.src || "";
  const echappe = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ICO = {
    disque: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 15h.01M11 15h6"/>',
    manette: '<path d="M7 8h10a5 5 0 0 1 4.8 6.3l-.8 3a2.5 2.5 0 0 1-4.3 1L15 16H9l-1.7 2.3a2.5 2.5 0 0 1-4.3-1l-.8-3A5 5 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3"/>',
    etoile: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'
  };
  const ico = (n, c) => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICO[n]}</svg>`;
  const icoReg = (n, c) => window.__pcvIcones?.svg(n, { attrs: `fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"` }) || "";
  const ONGLETS = { YourStuff: "Succ\xE8s", GameInfo: "Infos" };
  let enCours = null, cache = {};
  const DELAI_SWITCH_MS = 8e3;
  const appelerSwitch = (appid, langue) => {
    try {
      return Promise.race([
        (O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "fiche_switch", appid, langue) ?? Promise.reject(new Error("Decky absent")),
        new Promise((_, non) => setTimeout(() => non("d\xE9lai"), DELAI_SWITCH_MS))
      ]);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  let enCoursSwitch = null, cacheSwitch = {};
  const ficheSwitch = async (id) => {
    if (id in cacheSwitch) return cacheSwitch[id];
    try {
      return (cacheSwitch[id] = await appelerSwitch(id, window.__pcvLangue?.() || "fr")) || null;
    } catch (e) {
      return null;
    }
  };
  const joueursTexte = (n) => n === 1 ? Tr("fiche_switch.joueurs_un") : Tr("fiche_switch.joueurs_plusieurs", { n });
  const puceTexte = (icone, couleur, texte) => {
    const s = document.createElement("span");
    s.className = "puce";
    s.insertAdjacentHTML("afterbegin", icoReg(icone, couleur));
    s.appendChild(document.createTextNode(" " + texte));
    return s;
  };
  const peindreAccueil = (b, id) => {
    const dehors = !!window.__pcvGrille?.accueilRetire(id);
    b.classList.toggle("actif", !dehors);
    b.replaceChildren();
    b.insertAdjacentHTML("afterbegin", icoReg("epingle", dehors ? "#2fbf71" : "#8a5ce6"));
    b.appendChild(document.createTextNode(" " + Tr(dehors ? "accueil.ajouter" : "accueil.retirer")));
    b.insertAdjacentHTML("beforeend", window.__pcvIcones?.touche?.(4) || "");
  };
  const rendreFicheSwitch = (conteneur, id, fiche) => {
    const c = document.createElement("div");
    c.className = "pcv-fiche-switch";
    c.dataset.app = id;
    if (!fiche) {
      const p = document.createElement("p");
      p.className = "indisponible";
      p.textContent = Tr("fiche_switch.indisponible");
      c.appendChild(p);
      conteneur.appendChild(c);
      return;
    }
    const puces = document.createElement("div");
    puces.className = "pcv-puces pcv-puces-switch";
    const go2 = (o) => {
      const n = +o;
      return n > 0 ? (n / 1024 ** 3).toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " Go" : "";
    };
    if (fiche.taille_octets) puces.appendChild(puceTexte("disque", "#8b9098", go2(fiche.taille_octets)));
    if (fiche.joueurs) puces.appendChild(puceTexte("manette", "#2a8cff", joueursTexte(fiche.joueurs)));
    if (Number.isInteger(fiche.age)) puces.appendChild(puceTexte("bouclier", "#f0a020", Tr("fiche_switch.pegi", { n: fiche.age })));
    if (fiche.editeur) puces.appendChild(puceTexte("tag", "#8b9098", fiche.editeur));
    if (fiche.date) puces.appendChild(puceTexte("calendrier", "#8b9098", fiche.date));
    if (fiche.anglais) puces.appendChild(puceTexte("monde", "#8b5cf6", Tr("fiche_switch.anglais")));
    c.appendChild(puces);
    if (fiche.banniere || fiche.icone) {
      const media = document.createElement("div");
      media.className = "media";
      if (fiche.banniere && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(fiche.banniere)) {
        const img = document.createElement("img");
        img.className = "banniere";
        img.alt = "";
        img.src = fiche.banniere;
        media.appendChild(img);
      }
      if (fiche.icone && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(fiche.icone)) {
        const img = document.createElement("img");
        img.className = "icone";
        img.alt = "";
        img.src = fiche.icone;
        media.appendChild(img);
      }
      c.appendChild(media);
    }
    if (fiche.description) {
      const p = document.createElement("p");
      p.className = "description";
      p.textContent = fiche.description;
      c.appendChild(p);
    }
    const captures = (fiche.captures || []).filter((u) => /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(u));
    if (captures.length) {
      const g = document.createElement("div");
      g.className = "captures";
      for (const u of captures) {
        const img = document.createElement("img");
        img.src = u;
        img.alt = Tr("fiche_switch.captures");
        g.appendChild(img);
      }
      c.appendChild(g);
    }
    conteneur.appendChild(c);
  };
  const tailles = window.__pcvFicheTailles ||= {};
  const go = (octets) => {
    const n = +octets;
    return n > 0 ? (n / 1024 ** 3).toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " Go" : "";
  };
  const succes = async (id) => {
    if (cache[id]) return cache[id];
    try {
      const r = await O.SteamClient.Apps.GetMyAchievementsForApp(String(id));
      const d = (typeof r === "string" ? JSON.parse(r) : r).data.rgAchievements;
      return cache[id] = { total: d.length, obtenus: d.filter((a) => a.bAchieved).sort((a, b) => b.rtUnlocked - a.rtUnlocked) };
    } catch (e) {
      return cache[id] = { total: 0, obtenus: [] };
    }
  };
  const appliquer = async () => {
    const m = O.location.pathname.match(/^\/routes\/library\/app\/(\d+)/);
    if (!m) return;
    const id = +m[1], app = O.appStore.GetAppOverviewByAppID(id);
    if (!app) return;
    const stats = document.querySelector("._1YbtIWcfkQJOysLXQbwzRf");
    const lue = stats && [...stats.querySelectorAll("._2TYVGoD27ZMfjRirKQNLfk")].map((e) => e.textContent.trim()).find((t) => /\d.*[KMGT]i?[oB]$/.test(t));
    if (lue) tailles[id] = lue;
    const taille = lue || tailles[id] || go(app.size_on_disk);
    const avant = stats?.querySelector(".pcv-puces");
    if (avant && avant.dataset.taille !== (taille || "")) avant.remove();
    if (stats && !stats.querySelector(".pcv-puces")) {
      const p = document.createElement("div");
      p.className = "pcv-puces";
      p.dataset.taille = taille || "";
      p.innerHTML = [
        taille && [ico("disque", "#8b9098"), taille],
        [ico("manette", "#2a8cff"), h(app.minutes_playtime_forever) + " de jeu"],
        app.review_percentage_with_bombs && [ico("etoile", "#f0a020"), app.review_percentage_with_bombs + " % d'avis positifs"]
      ].filter(Boolean).map(([i, t]) => `<span class="puce">${i}${echappe(t)}</span>`).join("");
      stats.appendChild(p);
    }
    const peutAccueil = app.app_type === 1 || !!app.BIsShortcut?.();
    if (stats && peutAccueil) {
      const puces2 = stats.querySelector(".pcv-puces");
      let bt = puces2?.querySelector(".pcv-accueil");
      if (puces2 && !bt) {
        bt = document.createElement("button");
        bt.type = "button";
        bt.className = "puce pcv-accueil";
        bt.onclick = () => {
          const g = window.__pcvGrille;
          if (!g) return;
          g.accueilRetirer(id, !g.accueilRetire(id));
          peindreAccueil(bt, id);
        };
        puces2.appendChild(bt);
      }
      if (bt) peindreAccueil(bt, id);
    } else stats?.querySelector(".pcv-accueil")?.remove();
    for (const [cle, libelle] of Object.entries(ONGLETS)) {
      const t = document.querySelector(`[role=tab][id$=${cle}] ._1nq0ibcuVEbRv0z_wk9pIQ`);
      if (t && t.textContent !== libelle) t.textContent = libelle;
    }
    const contenus = document.querySelector("._2-ns_GqXzymHk0jsXBBWJ1 .WDa0_WKNSWIa38S26gl_T");
    const activite = document.querySelector("[role=tab][id$=WhatsNew]")?.matches("._3Gp1bACHx__POxmy6Gd3kG");
    if (!contenus) return;
    contenus.classList.toggle("pcv-activite", !!activite);
    if (!activite) contenus.querySelector(".pcv-cartes")?.remove();
    else if (!(contenus.querySelector(`.pcv-cartes[data-app="${id}"]`) || enCours === id)) {
      enCours = id;
      const s = await succes(id);
      enCours = null;
      contenus.querySelector(".pcv-cartes")?.remove();
      const c = document.createElement("div");
      c.className = "pcv-cartes";
      c.dataset.app = id;
      const tuile = (a) => `<div class="tuile"><img src="${echappe(a.strImage)}" alt=""><span><b>${echappe(joli(a.strName))}</b><small>${echappe(a.strDescription)} ${jour(a.rtUnlocked)}</small></span></div>`;
      const bulle = (t) => `<div class="bulle"><img class="mii" src="${echappe(avatar())}" alt=""><span>${t}</span></div>`;
      const bulles = s.obtenus.slice(0, 3).map((a) => bulle(`J'ai eu \xAB ${echappe(joli(a.strName))} \xBB !`));
      if (!bulles.length) bulles.push(bulle(`${h(app.minutes_playtime_forever)} de jeu sur ${echappe(app.display_name)}`));
      c.innerHTML = `
        <section class="carte succes"><header><b>Succ\xE8s</b><span>${s.obtenus.length} sur ${s.total}</span></header>
          <div class="piste"><i style="width:${s.total ? (100 * s.obtenus.length / s.total).toFixed(1) : 0}%"></i></div>
          <div class="tuiles">${s.obtenus.slice(0, 2).map(tuile).join("") || "<small>Aucun succ\xE8s pour l'instant</small>"}</div></section>
        <section class="carte place"><header><b>La place du jeu</b></header>${bulles.join("")}</section>`;
      contenus.prepend(c);
    }
    const estSwitch = !!app.BIsShortcut?.();
    const ongletInfos = estSwitch && document.querySelector("[role=tab][id$=GameInfo]")?.matches("._3Gp1bACHx__POxmy6Gd3kG");
    contenus.classList.toggle("pcv-infos-switch", !!ongletInfos);
    if (!ongletInfos) {
      contenus.querySelector(".pcv-fiche-switch")?.remove();
      return;
    }
    if (contenus.querySelector(`.pcv-fiche-switch[data-app="${id}"]`) || enCoursSwitch === id) return;
    enCoursSwitch = id;
    const fiche = await ficheSwitch(id);
    enCoursSwitch = null;
    contenus.querySelector(".pcv-fiche-switch")?.remove();
    rendreFicheSwitch(contenus, id, fiche);
  };
  appliquer();
  window.__pcvFicheObs = new MutationObserver(() => {
    clearTimeout(window.__pcvFicheT);
    window.__pcvFicheT = setTimeout(appliquer, 60);
  });
  window.__pcvFicheObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  return "fiche pr\xEAte";
})();
