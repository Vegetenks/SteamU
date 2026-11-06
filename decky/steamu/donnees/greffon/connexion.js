((forcer) => {
  window.__pcvConnexionArreter?.();
  document.getElementById("pcv-connexion")?.remove();
  if (!forcer && sessionStorage.getItem("pcvConnexionVue")) return "d\xE9j\xE0 vue pendant cette session";
  const T = window.__pcvT || ((c) => c);
  const compteCourant = () => window.__pcvBridge?.compteCourant?.() ?? null;
  const resumeBibliotheque = () => window.__pcvBridge?.resumeBibliotheque?.() ?? { pret: false, nombreJeux: null };
  const compte = compteCourant(), bibliotheque = resumeBibliotheque();
  let miiAbsents = false;
  window.__pcvNintendo?.pret?.then((n) => {
    miiAbsents = n.mii === false;
  });
  const pseudo = compte?.nom || T("connexion.compte_attente"), nbJeux = bibliotheque.pret ? bibliotheque.nombreJeux : null;
  const jeuxTexte = (n) => n === 1 ? T("connexion.jeu_un", { n }) : T("connexion.jeu_plusieurs", { n });
  const avatar = compte?.avatar || "";
  const LECTURE_COMPTE = { pasMs: 300, toursMax: 100 };
  const echappe = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const urlSure = (u2) => {
    const s = String(u2 ?? "").trim(), t = s.replace(/[\x00-\x20]/g, "");
    return echappe(!/^[a-z][a-z0-9+.-]*:/i.test(t) || /^(https?:|data:image\/|blob:)/i.test(t) ? s : "");
  };
  let teteMii = "";
  try {
    const moi = window.__pcvMiiBase?.moi?.();
    const c = moi && window.__pcvTeteCacheCle ? JSON.parse(localStorage.getItem(window.__pcvTeteCacheCle) || "null") : null;
    if (c && c.cle === moi.id + ":" + moi.donnees && c.url && urlSure(c.url)) teteMii = c.url;
  } catch (e) {
  }
  const AVATAR_CACHE = "pcv-avatar-cache";
  let avatarGarde = null;
  try {
    avatarGarde = JSON.parse(localStorage.getItem(AVATAR_CACHE) || "null");
  } catch (e) {
  }
  const avatarDe = (nom) => avatarGarde?.url?.startsWith("data:image/") && (!nom || avatarGarde.nom === nom) ? avatarGarde.url : "";
  const repliAvatar = (nom) => avatarDe(nom) || teteMii;
  const initiale = (nom) => ([...String(nom || "").trim()][0] || "").toUpperCase();
  let avatarEchoue = "";
  const TRAITS = {
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  const premier = urlSure(avatar || repliAvatar(compte?.nom)), srcAvatar = premier ? `src="${premier}"` : "";
  const svg = (n, t, ep = 1.6) => `<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${ep}" stroke-linecap="round" stroke-linejoin="round">${TRAITS[n]}</svg>`;
  const u = (n) => `calc(var(--u) * ${n})`;
  const racine = document.createElement("div");
  racine.id = "pcv-connexion";
  let arrete = false, completer = 0, sortie = 0, attentePlace = 0, attenteDessus = 0, touche = null, manette = null, lacherTouches = null;
  let sortieTerminee = false, placeTerminee = false;
  const diagnostic = window.__pcvConnexionDiagnostic = { tours: 0, a: 0, clavier: 0, affiche: false, valide: false, avatarErreur: false };
  const vivant = () => !arrete && document.body.contains(racine);
  const retirerEntrees = () => {
    if (completer) {
      clearInterval(completer);
      completer = 0;
    }
    if (touche) window.removeEventListener("keydown", touche, true);
    lacherTouches?.();
    lacherTouches = null;
    const entrees = window.__pcvManette?.__brute || window.__pcvManette;
    if (entrees?.connexion === manette) delete entrees.connexion;
    const tuile2 = racine.querySelector(".tuile");
    if (tuile2) tuile2.onclick = tuile2.onpointerdown = tuile2.onpointermove = tuile2.onpointerup = tuile2.onpointercancel = null;
  };
  const arreter = () => {
    if (arrete) return;
    arrete = true;
    retirerEntrees();
    clearTimeout(sortie);
    clearTimeout(attentePlace);
    clearTimeout(attenteDessus);
    racine.remove();
    if (window.__pcvConnexionArreter === arreter) delete window.__pcvConnexionArreter;
  };
  const terminer = () => {
    if (sortieTerminee && placeTerminee) arreter();
  };
  racine.innerHTML = `<style>
    #pcv-connexion { position: fixed; inset: 0; z-index: 9800; overflow: hidden; font-family: var(--pcv-police); color: var(--pcv-texte);
      background: var(--pcv-fond-page); }   
    #pcv-connexion * { box-sizing: border-box; }
    
    
    #pcv-connexion > .pcv-fond { animation: pcvFondu .6s ease-out .6s both; }
    #pcv-connexion .colline { position: absolute; left: -15vw; right: -15vw; top: ${u(520)}; height: ${u(600)}; border-radius: 50%; background: var(--pcv-verre);
      box-shadow: 0 ${u(-8)} ${u(40)} rgba(120,140,170,.18); z-index: 1; animation: pcvFondu .6s ease-out .6s both; }
    #pcv-connexion .entree { position: absolute; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center; background: var(--pcv-fond-page);
      font-size: ${u(64)}; font-weight: 900; letter-spacing: -.02em; color: var(--pcv-texte2); animation: pcvSortie .3s ease-in 1.4s both; }
    #pcv-connexion .choix { position: absolute; inset: 0; z-index: 2; animation: pcvFondu .4s ease-out .8s both; }
    
    #pcv-connexion .centre { position: absolute; left: 50%; top: ${u(150)}; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: ${u(18)}; }
    #pcv-connexion .bulle { position: relative; padding: ${u(10)} ${u(20)}; border-radius: ${u(20)}; font-size: ${u(17)}; font-weight: 900; background: var(--pcv-verre);
      box-shadow: var(--pcv-reflet), var(--pcv-ombre); animation: pcvFondu .2s ease-out 1.25s both; }
    #pcv-connexion .bulle::after { content: ""; position: absolute; left: 50%; bottom: ${u(-8)}; margin-left: ${u(-8)}; width: ${u(16)}; height: ${u(16)}; background: var(--pcv-creux); transform: rotate(45deg); border-radius: 3px; }
    #pcv-connexion button { all: unset; cursor: pointer; }
    #pcv-connexion .tuile { position: relative; width: ${u(118)}; height: ${u(118)}; border-radius: ${u(22)}; padding: ${u(6)}; background: var(--pcv-verre);
      box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 ${u(6)} ${u(16)} rgb(from var(--pcv-ombre-c) r g b / .2); }
    #pcv-connexion .tuile img { display: block; width: 100%; height: 100%; border-radius: ${u(16)}; object-fit: cover; }
    #pcv-connexion .tuile img:not([src]) { visibility: hidden; }
    #pcv-connexion .tuile .attente-avatar { position: absolute; inset: ${u(6)}; display: grid; place-items: center; border-radius: ${u(16)};
      background: var(--pcv-cyan-plein); color: var(--pcv-sur-accent); font-size: ${u(56)}; font-weight: 900; }
    #pcv-connexion .tuile:has(img[src]) .attente-avatar { display: none; }
    #pcv-connexion .tuile::after { content: ""; position: absolute; inset: ${u(-7)}; border-radius: ${u(27)}; border: ${u(5)} solid var(--pcv-cyan-plein); box-shadow: 0 0 0 2px var(--pcv-anneau-c); }
    #pcv-connexion .coins { position: absolute; inset: ${u(-7)}; border-radius: ${u(30)}; border: ${u(4)} solid #7fdcff; animation: pcvEclat .25s ease-out both; }
    #pcv-connexion .perso { position: absolute; left: ${u(70)}; top: ${u(540)}; width: ${u(70)}; height: ${u(70)}; border-radius: 50%; overflow: hidden;
      box-shadow: 0 0 0 ${u(4)} #fff, 0 4px 10px rgba(0,0,0,.18); }
    #pcv-connexion .perso img { display: block; width: 100%; height: 100%; object-fit: cover; }
    #pcv-connexion .infos { position: absolute; left: ${u(220)}; top: ${u(640)}; display: flex; align-items: center; gap: ${u(34)}; }
    #pcv-connexion .infos small { display: block; font-size: ${u(17)}; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-connexion .infos b { font-size: ${u(24)}; font-weight: 900; color: var(--pcv-texte); }
    #pcv-connexion.part { animation: pcvSortie .3s ease-in .2s both; }
    @keyframes pcvFondu { from { opacity: 0 } to { opacity: 1 } }
    @keyframes pcvSortie { from { opacity: 1 } to { opacity: 0; visibility: hidden } }
    @keyframes pcvEclat { 0% { inset: ${u(-7)}; opacity: 1 } 100% { inset: ${u(-15)}; opacity: 0 } }
  </style>
  <div class="colline"></div>
  <div class="choix">
    <div class="ajouter"><i>${svg("plus", "calc(var(--u) * 18)", 2.6)}</i>${T("connexion.ajouter_compte")}</div>
    ${window.__pcvPiluleMachine?.() || ""}
    <div class="centre"><div class="bulle">${window.__pcvIcones?.touche?.(1) || ""} ${T("connexion.commencer_compte")}</div>
      <button class="tuile" aria-label="${echappe(T("connexion.commencer_aria", { pseudo }))}"><span class="attente-avatar" aria-hidden="true" data-pcv-initiale>${echappe(initiale(compte?.nom))}</span><img data-pcv-avatar ${srcAvatar} alt=""></button></div>
    <div class="perso">${teteMii ? `<img src="${urlSure(teteMii)}" alt="">` : `<img data-pcv-avatar ${srcAvatar} alt="">`}</div>
    <div class="infos"><span><small>${T("connexion.pseudo_label")}</small><b data-pcv-pseudo>${echappe(pseudo)}</b></span><span style="width:2px;height:${u(56)};background:var(--pcv-texte2);opacity:.3"></span>
      <span><small>${T("connexion.bibliotheque_label")}</small><b style="color:var(--pcv-cyan-plein)" data-pcv-nbjeux>${nbJeux !== null ? jeuxTexte(nbJeux) : "\u2026"}</b></span></div>
  </div>`;
  document.body.appendChild(racine);
  window.__pcvFond?.(racine);
  racine.querySelectorAll("[data-pcv-avatar]").forEach((e) => {
    e.onerror = () => {
      diagnostic.avatarErreur = true;
      const s = e.getAttribute("src") || "", r = repliAvatar(compteCourant()?.nom);
      if (/^https?:/i.test(s)) avatarEchoue = s;
      if (r && s !== r) e.src = r;
      else e.removeAttribute("src");
    };
    e.onload = () => {
      const s = e.getAttribute("src") || "", nom = compteCourant()?.nom;
      if (!/^https?:/i.test(s) || !nom || avatarGarde?.source === s) return;
      fetch(s).then((r) => r.ok ? r.blob() : null).then((b) => b?.type.startsWith("image/") && new Promise((ok) => {
        const f = new FileReader();
        f.onload = () => ok(f.result);
        f.onerror = () => ok("");
        f.readAsDataURL(b);
      })).then((url) => {
        if (!url) return;
        avatarGarde = { nom, source: s, url };
        try {
          localStorage.setItem(AVATAR_CACHE, JSON.stringify(avatarGarde));
        } catch (err) {
        }
      }).catch(() => {
      });
    };
  });
  window.__pcvConnexionArreter = arreter;
  window.__pcvNomMachine?.().then((n) => {
    if (!vivant()) return;
    const e = racine.querySelector(".nom-systeme");
    if (n && e) e.textContent = n;
  }).catch(() => {
  });
  const valider = () => {
    if (!vivant() || racine.classList.contains("part") || diagnostic.valide) return;
    if (window.__pcvDemarrage?.video()) return;
    diagnostic.valide = true;
    window.__pcvDemarrage?.valider();
    sessionStorage.setItem("pcvConnexionVue", "1");
    const c = document.createElement("span");
    c.className = "coins";
    racine.querySelector(".tuile").appendChild(c);
    retirerEntrees();
    const partir = () => {
      if (arrete || racine.classList.contains("part")) return;
      racine.classList.add("part");
      sortie = setTimeout(() => {
        if (arrete) return;
        racine.remove();
        sortieTerminee = true;
        terminer();
      }, 600);
    };
    window.__pcvBridge?.ouvrirAccueil?.();
    if (arrete) return;
    let essais = 0;
    const versPlace = () => {
      if (arrete) return;
      if (window.__pcvPlace3D) {
        window.__pcvPlaceMontrer?.(true);
        placeTerminee = true;
        partir();
        terminer();
      } else if (!miiAbsents && ++essais < 60) attentePlace = setTimeout(versPlace, 250);
      else {
        placeTerminee = true;
        partir();
        terminer();
      }
    };
    if (window.__pcvBienvenue?.attendu?.()) {
      const placeQuandPrete = (k = 12) => {
        const encore = window.__pcvBienvenue?.ouvert?.();
        if (window.__pcvPlace3D) window.__pcvPlaceMontrer?.(true);
        else if (encore || k > 0) setTimeout(() => placeQuandPrete(encore ? k : k - 1), 250);
      };
      window.__pcvBienvenue.derriere(() => placeQuandPrete());
      window.__pcvBienvenue.ouvrir?.();
      placeTerminee = true;
      partir();
      terminer();
    } else versPlace();
  };
  touche = (e) => {
    if (!vivant()) {
      arreter();
      return;
    }
    if (racine.style.visibility === "hidden") return;
    if (e.key === "Enter" || e.key === " ") {
      diagnostic.clavier++;
      valider();
      e.stopPropagation();
      e.preventDefault();
    }
  };
  const tuile = racine.querySelector(".tuile"), DISTANCE_TOUCHER = 15;
  let toucher = null;
  tuile.onclick = valider;
  tuile.onpointerdown = (e) => {
    toucher = e.pointerType === "touch" ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null;
  };
  tuile.onpointermove = (e) => {
    if (toucher?.id === e.pointerId && Math.hypot(e.clientX - toucher.x, e.clientY - toucher.y) > DISTANCE_TOUCHER) toucher = null;
  };
  tuile.onpointercancel = () => {
    toucher = null;
  };
  tuile.onpointerup = (e) => {
    const t = toucher;
    toucher = null;
    if (t && t.id === e.pointerId && tuile.contains(document.elementFromPoint(e.clientX, e.clientY))) valider();
  };
  window.addEventListener("keydown", touche, true);
  manette = (b) => {
    if (!vivant()) {
      arreter();
      return false;
    }
    if (racine.style.visibility === "hidden") return false;
    if (b === 1) {
      diagnostic.a++;
      window.__pcvAppui?.(tuile);
      valider();
    }
    return true;
  };
  (window.__pcvManette ||= {}).connexion = manette;
  lacherTouches = window.__pcvToutesTouches?.((b, bas) => {
    if (b !== 1 || !bas || !vivant() || racine.style.visibility === "hidden") return false;
    const f = { detail: { button: 1 }, pris: false, stopPropagation() {
      this.pris = true;
    }, preventDefault() {
    } };
    window.__pcvPrendre?.(f);
    return f.pris;
  }) || null;
  racine.style.visibility = "hidden";
  const montrer = (choisi) => {
    if (!vivant()) return;
    if (window.__pcvDemarrage?.video() || window.__pcvBridge?.steamDessus?.()) {
      attenteDessus = setTimeout(() => montrer(choisi), 250);
      return;
    }
    if (choisi) return valider();
    racine.style.visibility = "";
    diagnostic.affiche = true;
    window.__pcvDemarrage?.connexionPrete();
    racine.querySelector(".tuile").focus?.({ preventScroll: true });
  };
  Promise.resolve(window.__pcvBridge?.choixCompteAuDemarrage?.()).catch(() => false).then((choisi) => montrer(choisi));
  completer = setInterval(() => {
    if (!vivant()) return arreter();
    const p = compteCourant(), b = resumeBibliotheque();
    diagnostic.tours++;
    diagnostic.compte = window.__pcvBridge?.etatCompte?.() || { nom: !!p?.nom, avatar: !!p?.avatar };
    diagnostic.focus = document.hasFocus?.() ?? null;
    if (p) {
      racine.querySelectorAll("[data-pcv-pseudo]").forEach((e) => {
        e.textContent = p.nom;
      });
      racine.querySelectorAll("[data-pcv-initiale]").forEach((e) => {
        e.textContent = initiale(p.nom);
      });
      racine.querySelectorAll("[data-pcv-avatar]").forEach((e) => {
        const s = e.getAttribute("src") || "", autre = s.startsWith("data:") && s === avatarGarde?.url && !avatarDe(p.nom);
        if (p.avatar && s !== p.avatar && p.avatar !== avatarEchoue) e.src = p.avatar;
        else if (autre) {
          const r = repliAvatar(p.nom);
          if (r) e.src = r;
          else e.removeAttribute("src");
        }
      });
      racine.querySelector(".tuile").setAttribute("aria-label", T("connexion.commencer_aria", { pseudo: p.nom }));
    }
    if (b.pret) racine.querySelectorAll("[data-pcv-nbjeux]").forEach((e) => {
      e.textContent = jeuxTexte(b.nombreJeux);
    });
    if (diagnostic.tours === LECTURE_COMPTE.toursMax) {
      diagnostic.expire = true;
      if (!p?.nom) racine.querySelectorAll("[data-pcv-pseudo]").forEach((e) => {
        e.textContent = T("connexion.compte_indisponible");
      });
    }
    if (diagnostic.tours === LECTURE_COMPTE.toursMax || p?.nom && p.avatar && b.pret) {
      clearInterval(completer);
      completer = 0;
    }
  }, LECTURE_COMPTE.pasMs);
  return "connexion affich\xE9e";
})(window.__pcvForcerConnexion);
