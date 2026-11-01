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
  let suspendu = null, preparationPanneau = null;
  (window.__pcvPreparer ||= {}).casino = () => preparationPanneau;
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
    window.__pcvAccentAppli?.(pB, p === "casino" ? "casino" : null);
    if (p === "casino" && suspendu) {
      preparationPanneau = null;
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
    const E = ecran = p === "casino" ? window.__pcvCasinoBadges : window.__pcvArcade;
    if (!E) return fermer(true);
    const r = E.ouvrir(pB);
    preparationPanneau = Promise.resolve(r);
    Promise.resolve(r).then((ok) => {
      if (ok === false && ouvert === p && ecran === E) fermer(true);
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
      appli: p,
      nom: c.nom,
      html: L.icone({ fond: c.teinte, ic: "perso" }, true),
      /* (31/10) le même carré en relief que la tuile */
      pret: () => !!document.querySelector("#pcv-themes.on"),
      faire: () => ouvrir(p)
    });
  };
  const choixDe = {};
  const personnaliser = (i) => {
    const choix = [
      { cle: "themes", nom: window.__pcvT("spaces.themes.nom"), teinte: "#ff8db5, #e8457c", svg: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.7-1.3-.7-2.1 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10" r="1"/>', faire: () => lancer("themes") },
      window.__pcvDeco && { ic: "decorer", nom: window.__pcvT("perso.decorer"), faire: () => window.__pcvDeco.ouvrir() }
    ].filter(Boolean);
    choix.forEach((c) => {
      if (c.cle) choixDe[c.cle] = c;
    });
    if (!window.__pcvDossiers?.choix(i, choix)) ouvrir("themes");
  };
  window.__pcvPerso = { ouvrir, fermer, rendreZone, personnaliser, casino: () => CASINO() };
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
    bienvenue: [() => !!window.__pcvBienvenue?.ouvert(), () => window.__pcvBienvenue?.fermer(false)],
    // (29/10, l'auteur : « toutes nos applications doivent être considérées comme une application ») le 3e terme : l'appli
    // que l'écran est, pour le menu HOME (logiciel en cours) : la clé de sa tuile de l'accueil (console.js, __pcvApplis),
    // ou [clé, nom] quand l'écran porte un autre nom que sa tuile
    eshop: [() => !!window.__pcvBoutique?.ouvert(), () => window.__pcvBoutique?.fermer(false), "eshop"],
    medias: [() => !!window.__pcvMediatheque?.ouvert(), () => window.__pcvMediatheque?.fermer(false), "album"],
    // (28/10) notre Album   // (false : sans revenir à l'accueil, la page qui la remplace reste)
    // (en tête : l'écran « il manque des fichiers » de nintendo.js remplace l'appli qui l'a demandé, même vue au même tour)
    verrou: [() => !!window.__pcvNintendo?.ouvert?.(), () => window.__pcvNintendo?.fermer?.()],
    themes: [() => document.getElementById("pcv-themes")?.classList.contains("on") && vu("pcv-themes"), () => window.__pcvThemes?.fermer(false), ["perso", "spaces.themes.nom"]],
    perso: [() => !!ouvert, () => fermer(true), () => ouvert === "casino" && "casino"],
    spotpassPage: [() => vu("pcv-spotpass-page"), () => window.__pcvSpotPassPage?.fermer()],
    notifs: [() => vu("pcv-notifs"), () => window.__pcvNotifsMontrer?.(false)],
    amis: [() => vu("pcv-amis"), () => window.__pcvAmisMontrer?.(false)],
    profil: [() => vu("pcv-profil"), () => window.__pcvProfilMontrer?.(false)],
    place: [() => vu("pcv-place"), () => window.__pcvPlaceMontrer?.(false)],
    deco: [() => !!window.__pcvDeco?.actif?.(), () => window.__pcvDeco?.fermer?.()],
    miimaker: [() => !!window.__pcvMiiMaker?.ouvert, () => window.__pcvMiiMaker?.fermer(), "miimaker"],
    // (30/10, l'auteur) la fenêtre SpotPass (spotpass.js) : une fenêtre, posée sur la page en cours sans la fermer (FENETRES),
    // mais qu'un autre écran (barre, menu HOME, accueil) referme, son de fermeture ; un envoi en cours continue (avis ensuite)
    spotpass: [() => !!window.__pcvSpotPassFenetre?.ouvert?.(), () => window.__pcvSpotPassFenetre?.fermer("fermer")]
  };
  const FENETRES = ["spotpass"];
  const ensemble = (a, b) => [a, b].sort().join() === "bienvenue,place";
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
  const DE_LA_BARRE = ["amis", "notifs", "profil", ...FENETRES];
  let actif = null, avant = /* @__PURE__ */ new Set(), dernierB = 0, route = O.location.pathname;
  const veiller = () => {
    if (O.location.pathname !== route) {
      route = O.location.pathname;
      if (!surAccueil()) {
        for (const n in ECRANS) if (n !== "perso") try {
          if (ECRANS[n][0]()) ECRANS[n][1]();
        } catch (e) {
        }
      }
    }
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
    if (neuf && FENETRES.includes(neuf)) actif = neuf;
    else if (neuf) {
      actif = neuf;
      for (const n of vus) if (n !== neuf && !ensemble(n, neuf)) try {
        ECRANS[n][1]();
      } catch (e) {
      }
    } else if (actif && !vus.includes(actif)) {
      const ferme2 = actif;
      actif = vus[0] || null;
      if (!actif && performance.now() - dernierB < 800 && !surAccueil() && !DE_LA_BARRE.includes(ferme2) && document.body.dataset.pcvPage !== "parametres") O.__pcvAller?.(1);
    }
    avant = new Set(vus);
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
  const decrire = (cle, nom, fermer2, reprendre) => {
    const x = window.__pcvApplis?.[cle];
    return x && { cle, nom: nom ? window.__pcvT(nom) : x.nom, fond: x.fond, html: window.__pcvLancement?.icone(x) || "", fermer: fermer2, reprendre };
  };
  const abandonner = () => {
    try {
      suspendu?.ecran?.fermer();
    } catch (e) {
    }
    suspendu = null;
  };
  const appli = () => {
    const E = ECRANS[actif];
    let k = E?.[2];
    try {
      if (typeof k === "function") k = k();
      if (k && E[0]()) {
        const [cle, nom] = [].concat(k);
        return decrire(cle, nom, E[1]);
      }
    } catch (e) {
    }
    return suspendu ? decrire("casino", null, abandonner, CASINO) : null;
  };
  const fermerTout = () => {
    for (const n in ECRANS) try {
      if (ECRANS[n][0]()) ECRANS[n][1]();
    } catch (e) {
    }
  };
  const accueil = () => {
    window.__pcvBarreQuitter?.();
    try {
      O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.VirtualKeyboardManager.SetVirtualKeyboardHidden();
    } catch (e) {
    }
    abandonner();
    fermerTout();
    O.__pcvAller?.(1);
  };
  window.__pcvEcran = { actif: () => actif, appli, accueil, ouvert: unOuvert, fermer: fermerTout };
  return "personnalisation pr\xEAte";
})();
