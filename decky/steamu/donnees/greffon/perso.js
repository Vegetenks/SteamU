(() => {
  for (const id of ["pcv-badges", "pcv-theme-perso"]) document.getElementById(id)?.remove();
  document.querySelectorAll("#pcv-barre .rond.perso").forEach((b) => b.remove());
  const O = window.opener;
  const son = (n) => window.__pcvSon?.(n);
  const surAccueil = () => /^\/routes\/library\/home/.test(O.location.pathname);
  clearInterval(window.__pcvPersoBoutons);
  window.__pcvPersoRO?.disconnect();
  const pB = document.createElement("div");
  pB.id = "pcv-badges";
  pB.className = "pcv-panneau";
  pB.innerHTML = `<style>
    .pcv-panneau { position: fixed; inset: calc(var(--u) * 98) 0 0 0; z-index: 8600; font-family: var(--pcv-police); color: var(--pcv-texte); background: var(--pcv-fond-page);
      opacity: 0; pointer-events: none; transform: scale(1.03); transition: opacity .22s, transform .22s; }
    .pcv-panneau.on { opacity: 1; pointer-events: auto; transform: none; }
    .pcv-panneau * { box-sizing: border-box; }
  </style>`;
  document.body.appendChild(pB);
  let ouvert = null, ecran = null;
  let suspendu = null;
  const rendreZone = () => {
    if (!surAccueil()) {
      window.__pcvZone = void 0;
      document.body.classList.remove("pcv-zone-jaquettes");
    } else window.__pcvConsoleMarquer?.();
  };
  const ouvrir = (p) => {
    window.__pcvBarreQuitter?.();
    fermer(true);
    window.__pcvZone = "jaquettes";
    document.body.classList.add("pcv-zone-jaquettes");
    if (p === "themes") {
      window.__pcvThemes?.ouvrir();
      return;
    }
    if (p === "casino" && suspendu) {
      ouvert = "casino";
      ecran = suspendu.ecran;
      suspendu = null;
      pB.classList.add("on");
      son("choisir");
      return;
    }
    ouvert = p;
    casinoVu = false;
    pB.classList.add("on");
    son("choisir");
    const C = p === "casino" && window.__pcvCasinoBadges, A = window.__pcvArcade;
    ecran = C || A;
    if (!ecran) return;
    const r = ecran.ouvrir(pB);
    if (C) Promise.resolve(r).then((ok) => {
      if (ok === false && ouvert === p && ecran === C) ecran = A;
    }, () => {
    });
  };
  const fermer = (silence) => {
    window.__pcvThemes?.fermer();
    if (!ouvert) return;
    ecran?.fermer();
    ecran = null;
    pB.classList.remove("on");
    ouvert = null;
    rendreZone();
    if (!silence) son("retour");
  };
  const CASINO = () => ouvrir("casino");
  let casinoVu = false;
  const lancer = (p) => {
    const c = choixDe[p], L = window.__pcvLancement;
    if (!L || !c) return ouvrir(p);
    L.appli({
      nom: c.nom,
      fond: `linear-gradient(160deg, ${c.teinte})`,
      html: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--pcv-sur-accent)" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${c.svg}</svg>`,
      pret: () => !!document.querySelector(p === "themes" ? "#pcv-themes.on" : "#pcv-badges.on"),
      faire: () => ouvrir(p)
    });
  };
  const choixDe = {};
  const personnaliser = (i) => {
    const choix = [
      { nom: "Th\xE8mes", teinte: "#ff8db5, #e8457c", svg: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.7-1.3-.7-2.1 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10" r="1"/>', faire: () => lancer("themes") },
      { nom: "Badges", teinte: "#ffc24d, #e6940f", svg: '<circle cx="12" cy="10" r="6"/><path d="M8.5 15l-1.5 6 5-2.5 5 2.5-1.5-6"/>', faire: () => lancer("badges") },
      window.__pcvDeco && { ic: "decorer", nom: "D\xE9corer", faire: () => window.__pcvDeco.ouvrir() }
    ].filter(Boolean);
    choix.forEach((c) => {
      if (c.svg) choixDe[c.nom === "Th\xE8mes" ? "themes" : "badges"] = c;
    });
    if (!window.__pcvDossiers?.choix(i, choix)) ouvrir("themes");
  };
  window.__pcvPerso = { ouvrir, fermer, rendreZone, personnaliser, casino: () => CASINO(), casinoSuspendu: () => !!suspendu };
  const PAS_UNE_PAGE = /* @__PURE__ */ new Set(["pcv-badges", "pcv-toasts", "pcv-lancement"]);
  const autrePageDessus = () => {
    const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    if (!e || pB.contains(e)) return false;
    for (let n = e; n && n !== document.body; n = n.parentElement) if (n.id?.startsWith("pcv-") && !PAS_UNE_PAGE.has(n.id)) return true;
    return !!e.closest("[role='dialog'], [class*='ModalPosition']");
  };
  (window.__pcvManette ||= {}).perso = (b) => {
    if (!ouvert) return false;
    if (ecran?.recouvert?.() && autrePageDessus()) return false;
    if (ecran?.touche(b)) return true;
    if (b === 2) fermer();
    return true;
  };
  if (window.__pcvTouchesPerso) window.removeEventListener("keydown", window.__pcvTouchesPerso, true);
  window.addEventListener("keydown", window.__pcvTouchesPerso = (e) => {
    const k = { ArrowLeft: 11, ArrowRight: 12, ArrowUp: 9, ArrowDown: 10, Enter: 1, Escape: 2, x: 3, X: 3, y: 4, Y: 4, q: 5, e: 6 }[e.key];
    if (k && window.__pcvManette.perso(k)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
  clearInterval(window.__pcvPersoSuivi);
  let page = O.location.pathname;
  window.__pcvPersoSuivi = setInterval(() => {
    if (O.location.pathname !== page) {
      page = O.location.pathname;
      if (ouvert === "casino" && casinoOccupe()) {
        suspendu = { ecran };
        ecran = null;
        ouvert = null;
        pB.classList.remove("on");
        return;
      }
      if (suspendu) {
        if (surAccueil()) {
          ouvert = "casino";
          ecran = suspendu.ecran;
          suspendu = null;
          pB.classList.add("on");
        }
        return;
      }
      fermer(true);
    } else if (ouvert === "casino" && ecran && ecran === window.__pcvCasinoBadges) {
      if (pB.querySelector(".pcvc")) casinoVu = true;
      else if (casinoVu) fermer(true);
    }
  }, 300);
  const ferme = (e) => {
    if (e.target.closest?.("#pcv-barre .rond, #pcv-bascule")) fermer();
  };
  document.removeEventListener("click", window.__pcvPersoFerme, true);
  document.addEventListener("click", window.__pcvPersoFerme = ferme, true);
  const vu = (id) => {
    const e = document.getElementById(id);
    return !!e && !e.hidden;
  };
  const ECRANS = {
    // (en tête : l'écran « il manque des fichiers » de nintendo.js remplace l'appli qui l'a demandé, même vue au même tour)
    verrou: [() => !!window.__pcvNintendo?.ouvert?.(), () => window.__pcvNintendo?.fermer?.()],
    themes: [() => document.getElementById("pcv-themes")?.classList.contains("on") && vu("pcv-themes"), () => window.__pcvThemes?.fermer()],
    perso: [() => !!ouvert, () => fermer(true)],
    notifs: [() => vu("pcv-notifs"), () => window.__pcvNotifsMontrer?.(false)],
    amis: [() => vu("pcv-amis"), () => window.__pcvAmisMontrer?.(false)],
    profil: [() => vu("pcv-profil"), () => window.__pcvProfilMontrer?.(false)],
    place: [() => vu("pcv-place"), () => window.__pcvPlaceMontrer?.(false)],
    deco: [() => !!window.__pcvDeco?.actif?.(), () => window.__pcvDeco?.fermer?.()],
    miimaker: [() => !!window.__pcvMiiMaker?.ouvert, () => window.__pcvMiiMaker?.fermer()]
  };
  const casinoOccupe = () => {
    if (ouvert !== "casino") return false;
    try {
      const e = window.__pcvCasinoBadges?.etat?.();
      if (!e) return false;
      return e.jeu && e.jeu !== "attente" || !!e.gain || e.vue === "jeu";
    } catch (x) {
      return false;
    }
  };
  let actif = null, avant = /* @__PURE__ */ new Set(), dernierB = 0;
  const veiller = () => {
    const vus = Object.keys(ECRANS).filter((n) => {
      try {
        return ECRANS[n][0]();
      } catch (e) {
        return false;
      }
    });
    const neuf = vus.find((n) => !avant.has(n) && n !== actif);
    if (neuf && neuf !== "perso" && vus.includes("perso") && casinoOccupe()) {
      try {
        ECRANS[neuf][1]();
      } catch (e) {
      }
      avant = new Set(vus.filter((n) => n !== neuf));
      return;
    }
    if (neuf) {
      actif = neuf;
      for (const n of vus) if (n !== neuf) try {
        ECRANS[n][1]();
      } catch (e) {
      }
    } else if (actif && !vus.includes(actif)) {
      actif = vus[0] || null;
      if (!actif && performance.now() - dernierB < 800 && !surAccueil()) O.__pcvAller?.(1);
    }
    avant = new Set(vus.filter((n) => !neuf || n === neuf));
  };
  clearInterval(window.__pcvEcranSuivi);
  window.__pcvEcranSuivi = setInterval(veiller, 150);
  const surB = (e) => {
    if (e.detail?.button === 2 || e.key === "Escape") {
      dernierB = performance.now();
      setTimeout(veiller, 0);
    }
  };
  for (const t of ["vgp_onbuttondown", "keydown"]) {
    window.removeEventListener(t, window.__pcvEcranB, true);
    window.addEventListener(t, surB, true);
  }
  window.__pcvEcranB = surB;
  const unOuvert = () => Object.values(ECRANS).some(([vu2]) => {
    try {
      return vu2();
    } catch (e) {
      return false;
    }
  });
  window.__pcvEcran = { actif: () => actif, ouvert: unOuvert, fermer: () => {
    for (const n in ECRANS) try {
      if (ECRANS[n][0]()) ECRANS[n][1]();
    } catch (e) {
    }
  } };
  return "personnalisation pr\xEAte";
})();
