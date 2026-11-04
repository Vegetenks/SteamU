(() => {
  if (window.__pcvDemarrage) return "d\xE9j\xE0 pos\xE9";
  if (sessionStorage.getItem("pcvConnexionVue")) {
    window.__pcvDemarrage = { video: () => false, enCours: () => false, connexionPassee: () => true, connexionPrete() {
    }, valider() {
    }, accueilPret() {
    } };
    return "s\xE9ance d\xE9j\xE0 connect\xE9e";
  }
  const h = document.documentElement;
  let validee = !!sessionStorage.getItem("pcvConnexionVue"), relire = 0, connexionPrete = false, accueilAffiche = false, termine = false, prevu = 0, securite = 0, coupee = false;
  const SECURITE_MS = 8e3;
  const couverture = document.createElement("div");
  couverture.id = "pcv-demarrage";
  const style = document.createElement("style");
  const FONDS = { clair: "#eef2f6", gris: "#16181e", noir: "#000000" }, IMAGE = window.__pcvGreffon?.image;
  style.textContent = `#pcv-demarrage { position: fixed; inset: 0; z-index: 2147483646; background: ${FONDS.clair}; }
    #pcv-demarrage::before { content: ""; position: absolute; inset: 0; margin: auto; width: min(100vw, 178vh); background: center / cover no-repeat; }
    ${Object.entries(FONDS).map(([a, c]) => `html[data-pcv-apparence="${a}"] #pcv-demarrage { background: ${c}; }${IMAGE ? ` html[data-pcv-apparence="${a}"] #pcv-demarrage::before { background-image: url("${IMAGE}?${a}"); }` : ""}`).join(" ")}
    #pcv-demarrage[hidden] { display: none; }
    #pcv-demarrage .points { position: absolute; left: 50%; top: calc(50% + 13vh); transform: translateX(-50%); display: flex; gap: 1.5vh; opacity: 0; }
    #pcv-demarrage .points i { width: 1.5vh; height: 1.5vh; border-radius: 50%; background: var(--pcv-cyan-plein); animation: pcv-saut 1.1s ease-in-out infinite; }
    #pcv-demarrage .points i:nth-child(2) { animation-delay: .15s; } #pcv-demarrage .points i:nth-child(3) { animation-delay: .3s; }
    #pcv-demarrage.charge .points { animation: pcv-paraitre .5s ease 1.5s forwards; }
    @keyframes pcv-saut { 0%, 60%, 100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-1.2vh); opacity: 1; } }
    @keyframes pcv-paraitre { to { opacity: 1; } }
    html[data-pcv-demarrage] {{GamepadToastPlaceholder@GamepadToastPlaceholder}} { visibility: hidden !important; }
    html[data-pcv-demarrage]:has({{StartupAnimationContainer@StartupAnimationContainer}}) #pcv-connexion { visibility: hidden !important; }
    html[data-pcv-demarrage] {{StartupAnimationContainer@StartupAnimationContainer}}, html[data-pcv-demarrage] .pcv-film-dessus { position: fixed; inset: 0; z-index: 2147483647 !important; }`;
  const points = document.createElement("div");
  points.className = "points";
  couverture.appendChild(points);
  for (let i = 0; i < 3; i++) points.appendChild(document.createElement("i"));
  couverture.appendChild(style);
  document.body.appendChild(couverture);
  const nousFilm = () => window.__pcvGreffon?.film && document.querySelector(`video[src$="${window.__pcvGreffon.film}"]`);
  const video = () => !!document.querySelector("{{StartupAnimationContainer@StartupAnimationContainer}}") || !!nousFilm();
  const avantConnexion = () => {
    try {
      return (window.opener || window).SteamUIStore?.WindowStore?.GamepadUIMainWindowInstance?.BViewingPreLoginRoute?.() === true;
    } catch (e) {
      return false;
    }
  };
  const connexionPassee = () => {
    if (!validee && !document.getElementById("pcv-connexion") && /^(?!avant-)./.test(window.__pcvScripts || "")) {
      validee = true;
      prevu ||= requestAnimationFrame(actualiser);
    }
    return validee;
  };
  const COUPE_MS = 400, LOGO_S = 6.4, FIN_S = 7;
  const pret = {};
  let piste = null;
  const prevoirMusique = () => {
    if (piste || !window.__pcvGreffon?.musique) return;
    piste = fetch(window.__pcvGreffon.musique).then((r) => r.ok ? r.blob() : null).then((b) => b && Object.assign(new Audio(URL.createObjectURL(b)), { preload: "auto" })).catch(() => null);
  };
  let vu = null;
  const musique = (t0, p0, f) => {
    if (!piste) return false;
    piste.then((a) => {
      if (!a) {
        if (f) f.muted = false;
        return;
      }
      const v0 = f ? f.volume : 1;
      a.volume = 0;
      a.play().then(() => {
        a.currentTime = t0 + (performance.now() - p0) / 1e3;
        const d = performance.now(), monter = () => {
          const k = Math.min(1, (performance.now() - d) / COUPE_MS);
          a.volume = v0 * k;
          if (f) f.volume = v0 * (1 - k);
          if (k < 1) requestAnimationFrame(monter);
          else if (f) f.muted = true;
        };
        monter();
      }).catch(() => {
        if (f) f.muted = false;
      });
      const fin = () => {
        const t1 = performance.now(), v1 = a.volume, baisser = () => {
          const k = Math.min(1, (performance.now() - t1) / 800);
          a.volume = v1 * (1 - k);
          if (k < 1) requestAnimationFrame(baisser);
          else {
            a.pause();
            URL.revokeObjectURL(a.src);
          }
        };
        baisser();
      };
      const guetter = () => document.getElementById("pcv-connexion") || termine || a.ended ? fin() : setTimeout(guetter, 100);
      guetter();
    });
    return true;
  };
  const bloquer = (e) => {
    if (!coupee && nousFilm()) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };
  const TOUCHES = ["vgp_onbuttondown", "vgp_onok", "vgp_oncancel", "vgp_onmenubutton", "vgp_onoptionsbutton", "keydown", "pointerdown"];
  for (const t of TOUCHES) window.addEventListener(t, bloquer, true);
  const couperFilm = () => {
    const f = window.__pcvGreffon?.film && document.querySelector(`video[src$="${window.__pcvGreffon.film}"]`);
    if (!f) {
      if (vu && !coupee) {
        coupee = true;
        couverture.classList.add("charge");
        musique(vu.t, vu.p);
      }
      return;
    }
    if (coupee) return;
    prevoirMusique();
    vu = { t: f.currentTime, p: performance.now() };
    const im = IMAGE && h.dataset.pcvApparence && (pret[h.dataset.pcvApparence] ||= Object.assign(new Image(), { src: `${IMAGE}?${h.dataset.pcvApparence}` }));
    if (!h.dataset.pcvApparence || f.currentTime < FIN_S || im && !(im.complete && im.naturalWidth)) {
      prevu ||= requestAnimationFrame(actualiser);
      return;
    }
    coupee = true;
    const c = f.closest("{{StartupAnimationContainer@StartupAnimationContainer}}") || f.parentElement;
    c.style.transition = `opacity ${COUPE_MS}ms ease-out`;
    c.style.opacity = "0";
    couverture.classList.add("charge");
    if (!musique(f.currentTime, performance.now(), f)) {
      const v0 = f.volume, t0 = performance.now(), baisser = () => {
        const k = Math.min(1, (performance.now() - t0) / COUPE_MS);
        f.volume = v0 * (1 - k);
        if (k < 1) requestAnimationFrame(baisser);
      };
      baisser();
    }
    setTimeout(() => {
      f.muted = true;
      f.playbackRate = 16;
    }, COUPE_MS);
  };
  const arrivee = () => {
    if (window.__pcvBienvenue?.ouvert?.()) return true;
    if (window.__pcvPlace3D?.etat?.()?.ouvert) return true;
    return accueilAffiche && !window.__pcvConnexionArreter && !window.__pcvBienvenue?.attendu?.();
  };
  const finir = () => {
    for (const t of TOUCHES) window.removeEventListener(t, bloquer, true);
    termine = true;
    clearTimeout(securite);
    clearTimeout(relire);
    h.removeAttribute("data-pcv-demarrage");
    couverture.remove();
    suivi.disconnect();
  };
  let muet = false;
  const taireSteam = () => {
    if (muet) return;
    try {
      const O = window.opener || window, A = O.SteamUIStore?.m_GamepadUIAudioStore?.m_AudioPlaybackManager;
      const P = A && Object.getPrototypeOf(A);
      if (!P?.PlayAudioURLWithRepeats) return;
      muet = true;
      if (P.__pcvMuet) return;
      P.__pcvMuet = true;
      const avant = P.PlayAudioURLWithRepeats;
      P.PlayAudioURLWithRepeats = new (O.Function || Function)("avant", "O", 'return function (u, n) { if (!O.__pcvSonsSteamPoses && /\\/sounds\\//.test(u)) u = "/sounds/silence.wav"; return avant.call(this, u, n); }')(avant, O);
    } catch (e) {
    }
  };
  const actualiser = () => {
    prevu = 0;
    taireSteam();
    if (termine) return;
    if (connexionPassee() && !video() && !document.getElementById("pcv-connexion")) {
      if (arrivee()) return finir();
      relire ||= setTimeout(() => {
        relire = 0;
        actualiser();
      }, 250);
      securite ||= setTimeout(() => {
        try {
          const t = "SteamU d\xE9marrage : arriv\xE9e pas pr\xEAte " + SECURITE_MS / 1e3 + " s apr\xE8s la connexion, couverture retir\xE9e (" + (window.opener || window).location?.pathname + ")";
          (window.__pcvErreurs ||= []).push([Date.now(), t]);
          console.warn(t);
        } catch (e) {
        }
        finir();
      }, SECURITE_MS);
    }
    const nf = nousFilm(), boite = nf && !nf.closest("{{StartupAnimationContainer@StartupAnimationContainer}}") && nf.parentElement;
    if (boite && !boite.classList.contains("pcv-film-dessus")) boite.classList.add("pcv-film-dessus");
    const avant = avantConnexion() && !!document.querySelector(".gpfocus, input");
    if (!avant) couperFilm();
    const cachee = avant || video() && !coupee || !!window.__pcvBridge?.steamDessus?.() || connexionPrete && !!document.getElementById("pcv-connexion");
    if (couverture.hidden !== cachee) couverture.hidden = cachee;
    if (!cachee && !video()) couverture.classList.add("charge");
  };
  const suivi = new MutationObserver(() => {
    prevu ||= requestAnimationFrame(actualiser);
  });
  suivi.observe(document.body, { childList: true, subtree: true });
  h.setAttribute("data-pcv-demarrage", "");
  window.__pcvDemarrage = {
    video,
    enCours: () => !termine,
    connexionPassee,
    connexionPrete: () => {
      connexionPrete = true;
      actualiser();
    },
    valider: () => {
      validee = true;
      actualiser();
    },
    accueilPret: () => {
      accueilAffiche = true;
      actualiser();
    }
  };
  actualiser();
  return "couverture du d\xE9marrage pos\xE9e";
})();
