(() => {
  window.__pcvBienvenue?.detruire();
  const T = (c, p) => window.__pcvT("bienvenue." + c, p);
  const P = window.__pcvPresentation, O = window.opener || window;
  const CLES = ["spotpass", "miimaker", "bibliotheque", "eshop", "plugins", "souhaits", "parametres", "stockage", "manettes", "couleurs", "place", "paroles", "icones", "demarrage", "fluidite", "doigt"];
  const SUJETS = ["spotpass", "miimaker", "bibliotheque", "boutique", "reglages", "couleurs", "place", "paroles", "icones", "demarrage", "fluidite", "doigt"];
  const DEBUT = { boutique: "eshop", reglages: "parametres" };
  const IMPORT = ["spotpass", "miimaker", "place", "paroles"];
  const APPLI = { miimaker: "miimaker", bibliotheque: "bibliotheque", couleurs: "perso", eshop: "eshop", plugins: "eshop", souhaits: "eshop", parametres: "parametres", stockage: "parametres", manettes: "parametres" };
  const marque = (t) => t.replace("SteamU", '<b class="nom">Steam<i>U</i></b>');
  const couleur = (cle) => cle === "spotpass" ? "c-spotpass" : window.__pcvApplis?.[APPLI[cle]]?.fond.split(",").at(-1).trim() || "cyan-plein";
  const VUES = "pcv-bienvenue-vues", AVIS = "pcv-bienvenue-avis";
  const lire = (c) => {
    try {
      return localStorage.getItem(c);
    } catch (_) {
      return null;
    }
  };
  const ecrire = (c, v) => {
    try {
      localStorage.setItem(c, v);
    } catch (_) {
    }
  };
  const vues = () => {
    try {
      const v = JSON.parse(lire(VUES) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (_) {
      return [];
    }
  };
  const version = () => O.DeckyPluginLoader?.plugins?.find((p) => p.name === window.__pcvGreffon?.nom)?.version?.match(/^\d+\.\d+\.\d+/)?.[0];
  const notes = (v) => /^0\.2\.\d+(?:[-+].*)?$/.test(v || "");
  const ech = P.echapper;
  let page = 0, choix = 0, ouverte = false, courante = "", vueSeance = "", retourDemande = "";
  const racine = document.createElement("div");
  racine.id = "pcv-bienvenue";
  racine.hidden = true;
  racine.innerHTML = `<style>
    #pcv-bienvenue { --u:calc(100vh / 800); position:fixed; inset:0; z-index:2147483000; overflow:hidden; background:var(--pcv-fond-page); color:var(--pcv-texte); font-family:var(--pcv-police); }
    #pcv-bienvenue[hidden] { display:none; }
    #pcv-bienvenue * { box-sizing:border-box; }
    
    #pcv-bienvenue .tete { position:absolute; top:calc(var(--u)*36); left:calc(var(--u)*44); margin:0; font-size:calc(var(--u)*26); font-weight:900; }
    #pcv-bienvenue .tete span { margin-left:calc(var(--u)*10); color:var(--pcv-texte2); }
    
    #pcv-bienvenue .nom { color:var(--pcv-texte); } #pcv-bienvenue .nom i { font-style:normal; color:var(--pcv-cyan-plein); }
    #pcv-bienvenue .centre { position:absolute; inset:15% 8% 12%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:calc(var(--u)*22); }
    #pcv-bienvenue .sel { outline:calc(var(--u)*4) solid var(--pcv-anneau-c); outline-offset:calc(var(--u)*5); }
    #pcv-bienvenue h1 { font-size:calc(var(--u)*40); margin:0; }
    #pcv-bienvenue p { font-size:calc(var(--u)*21); color:var(--pcv-texte2); margin:0; }
    #pcv-bienvenue button { border:0; color:var(--pcv-texte); background:var(--pcv-verre); box-shadow:var(--pcv-reflet),var(--pcv-ombre); font:800 calc(var(--u)*21) var(--pcv-police); cursor:pointer; border-radius:calc(var(--u)*38); padding:calc(var(--u)*18) calc(var(--u)*24); }
    #pcv-bienvenue .actions { display:flex; gap:calc(var(--u)*24); }
    
    #pcv-bienvenue .actions button { min-width:calc(var(--u)*170); height:calc(var(--u)*56); padding:0 calc(var(--u)*30); border-radius:calc(var(--u)*28); font-size:calc(var(--u)*19); font-weight:900;
      box-shadow:inset 0 calc(var(--u)*2) 0 var(--pcv-reflet-haut), inset 0 calc(var(--u)*-3) 0 var(--pcv-reflet-bas), 0 calc(var(--u)*3) 0 rgb(from var(--pcv-ombre-c) r g b / .22); }
    #pcv-bienvenue .actions .principal { background:var(--pcv-cyan); color:var(--pcv-sur-accent); box-shadow:inset 0 calc(var(--u)*2) 0 rgba(255,255,255,.5), 0 calc(var(--u)*3) 0 rgba(20,90,140,.35); }
    #pcv-bienvenue :is(.actions .sel, .fleche.sel) { outline-offset:calc(var(--u)*2); box-shadow:0 0 0 calc(var(--u)*9) var(--pcv-cyan-plein); }
    #pcv-bienvenue .mosaique { display:grid; grid-template-columns:repeat(6,1fr); gap:calc(var(--u)*18); width:75%; }
    #pcv-bienvenue .mosaique > button { display:flex; flex-direction:column; align-items:center; gap:calc(var(--u)*8); padding:0; background:none; box-shadow:none; border-radius:calc(var(--u)*12); font:inherit; font-size:calc(var(--u)*12); }
    #pcv-bienvenue svg { width:100%; height:100%; }
    
    #pcv-bienvenue .badge-maj { --pcv-relief-taille:calc(var(--u)*130); display:flex; }
    #pcv-bienvenue .mosaique { --pcv-relief-taille:calc(var(--u)*64); }
    #pcv-bienvenue .pcv-marque-relief > svg { width:50%; height:50%; }
    
    #pcv-bienvenue :not(.badge-maj) > .pcv-marque-relief::before, #pcv-bienvenue :not(.badge-maj) > .pcv-marque-relief::after { content:none; }
    #pcv-bienvenue .piste { position:absolute; top:calc(var(--u)*150); bottom:13%; left:calc(50% - var(--u)*480); width:calc(var(--u)*960); }
    #pcv-bienvenue article { position:absolute; top:0; height:100%; padding:calc(var(--u)*18); border-radius:calc(var(--u)*28); background:var(--pcv-fenetre-fond); box-shadow:var(--pcv-reflet),var(--pcv-ombre); display:flex; flex-direction:column; gap:calc(var(--u)*12); }
    #pcv-bienvenue button:is(:hover,:focus-visible), #pcv-bienvenue .points .on { outline:calc(var(--u)*4) solid var(--pcv-anneau-c); outline-offset:calc(var(--u)*2); }
    #pcv-bienvenue article img { width:100%; min-height:0; flex:1; object-fit:contain; border-radius:calc(var(--u)*16); background:var(--pcv-creux); }
    #pcv-bienvenue h2 { margin:0; font-size:calc(var(--u)*28); }
    #pcv-bienvenue article p { font-size:calc(var(--u)*18); } #pcv-bienvenue article .importer { font-size:calc(var(--u)*15); color:var(--pcv-texte3); }
    
    #pcv-bienvenue .fleche { position:absolute; top:45%; z-index:2; width:calc(var(--u)*64); height:calc(var(--u)*64); padding:0; border-radius:calc(var(--u)*32); display:flex; align-items:center; justify-content:center; transition:width var(--pcv-panneau-duree) var(--pcv-panneau-courbe); }
    #pcv-bienvenue .fleche svg { width:45%; height:45%; pointer-events:none; }
    
    #pcv-bienvenue .fleche > * { transition:opacity var(--pcv-panneau-duree); } #pcv-bienvenue .fleche span { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; white-space:nowrap; }
    #pcv-bienvenue .fleche.fin { width:calc(var(--u)*170); background:var(--pcv-cyan); color:var(--pcv-sur-accent); } #pcv-bienvenue .fleche.fin svg { opacity:0; } #pcv-bienvenue .fleche.fin span { opacity:1; } #pcv-bienvenue .fleche.g svg { transform:scaleX(-1); } #pcv-bienvenue .g { right:calc(50% + var(--u)*420); } #pcv-bienvenue .d { left:calc(50% + var(--u)*420); }
    #pcv-bienvenue .points { position:absolute; bottom:4%; left:30%; right:30%; display:flex; justify-content:center; gap:calc(var(--u)*8); }
    #pcv-bienvenue .points button { padding:0; width:calc(var(--u)*10); height:calc(var(--u)*10); border-radius:99px; background:var(--pcv-texte3); }
    #pcv-bienvenue .points .on { width:calc(var(--u)*28); background:var(--pcv-cyan-plein); }
    #pcv-bienvenue .pcv-legende { position:absolute; right:2%; bottom:2%; }
  </style><div class="contenu"></div>`;
  racine.dataset.pcvEspace = "notifs";
  document.body.appendChild(racine);
  racine.style.setProperty("--pcv-fond-page", `var(--pcv-fond-${racine.dataset.pcvEspace}-base)`);
  const captures = /* @__PURE__ */ new Map();
  const image = (cle) => {
    const a = document.documentElement.dataset.pcvApparence || "clair", l = window.__pcvLangue?.() || "fr", k = l + "/" + a + "/" + cle;
    if (!captures.has(k)) {
      captures.set(k, "");
      (async () => {
        for (const x of [.../* @__PURE__ */ new Set([l, "fr"])].flatMap((l2) => [a, ...a === "noir" ? ["gris", "clair"] : a === "gris" ? ["noir", "clair"] : ["gris", "noir"]].map((y) => l2 + "/" + y))) {
          const b = await (O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "ressource", `@bienvenue/${x}/${cle}.jpg`).catch(() => null);
          if (b) {
            captures.set(k, "data:image/jpeg;base64," + b);
            return dessiner();
          }
        }
      })();
    }
    return captures.get(k);
  };
  const ico = (cle) => window.__pcvIcones.relief({ parametres: "parametres", stockage: "disque", manettes: "manette", eshop: "boutique", souhaits: "epingle", plugins: "prise", spotpass: "spotpass", miimaker: "miimaker", place: "perso", bibliotheque: "bibliotheque", couleurs: "nuancier", fluidite: "perf", paroles: "paroles", icones: "tuiles-petites", demarrage: "logo-u", doigt: "ecran" }[cle], couleur(cle));
  const toile = document.createElement("canvas");
  toile.width = toile.height = 8;
  const bord = (img) => {
    try {
      const c = toile.getContext("2d", { willReadFrequently: true });
      c.drawImage(img, 0, 0, 8, 8);
      const d = c.getImageData(0, 0, 8, 8).data, s = [0, 0, 0];
      let n = 0;
      for (let y = 0; y < 8; y++) for (const x of [0, 7]) {
        const i = (y * 8 + x) * 4;
        s[0] += d[i];
        s[1] += d[i + 1];
        s[2] += d[i + 2];
        n++;
      }
      img.style.background = `rgb(${s.map((v) => Math.round(v / n)).join(",")})`;
    } catch (_) {
    }
  };
  const ranger = (piste) => {
    const tuiles = [...piste.querySelectorAll("article")];
    P.rangee(tuiles, page - 1, [704, 104], 800);
    racine.querySelectorAll(".fleche").forEach((f) => {
      const g = f.classList.contains("g"), fin = page === (g ? 1 : CLES.length);
      f.classList.toggle("fin", fin);
      f.classList.toggle("sel", fin && !!choix);
      f.setAttribute("aria-label", T(fin ? g ? "sommaire" : "terminer" : "continuer"));
    });
    tuiles.forEach((el, i) => {
      el.classList.remove("sel");
      el.setAttribute("aria-hidden", String(i !== page - 1));
      const src = Math.abs(i - (page - 1)) <= 1 ? image(el.dataset.cle) : null;
      if (src !== null && el.querySelector("img").getAttribute("src") !== src) {
        const img = el.querySelector("img");
        img.onload = () => bord(img);
        img.setAttribute("src", src);
      }
    });
  };
  let dernierePage = 0;
  const dessiner = () => {
    if (!ouverte) return;
    const fin = page === CLES.length + 1;
    const milieu = page > 0 && !fin;
    const ancienne = racine.querySelector(".piste");
    if (milieu && ancienne) {
      ranger(ancienne);
      racine.querySelectorAll("[data-page]").forEach((el, i) => {
        el.classList.toggle("on", i === page);
        if (i === page) el.setAttribute("aria-current", "step");
        else el.removeAttribute("aria-current");
      });
      dessinerLegende();
      dernierePage = page;
      return;
    }
    const contenu = milieu ? `<div class="piste">${CLES.map((cle) => `<article class="pcv-fenetre" data-cle="${cle}" style="left:0;width:calc(var(--u)*800)"><img src="" alt=""><h2>${ech(T(cle + ".titre"))}</h2><p>${ech(T(cle + ".texte"))}</p>${IMPORT.includes(cle) ? `<p class="importer">${ech(T("importer"))}</p>` : ""}</article>`).join("")}</div><button class="fleche g" data-action="precedent" aria-label="${ech(T("continuer"))}">${window.__pcvIcones.svg("fleche")}<span>${ech(T("sommaire"))}</span></button><button class="fleche d" data-action="suivant" aria-label="${ech(T("continuer"))}">${window.__pcvIcones.svg("fleche")}<span>${ech(T("terminer"))}</span></button>` : `<div class="centre"><span class="badge-maj">${window.__pcvIcones.relief(fin ? "coche" : "mise-a-jour", fin ? "vert" : "cyan-plein")}</span><h1>${marque(ech(T(fin ? "fin" : "titre")))}</h1><p>${ech(T(fin ? "revoir_aide" : "intro", { version: courante }))}</p>${!fin ? `<div class="mosaique">${SUJETS.map((s) => `<button data-page="${CLES.indexOf(DEBUT[s] || s) + 1}">${ico(DEBUT[s] || s)}${ech(T(s + ".titre"))}</button>`).join("")}</div>` : ""}<div class="actions"><button class="principal${choix ? "" : " sel"}" data-action="suivant">${ech(T(fin ? "terminer" : "decouvrir"))}</button>${!fin ? `<button class="${choix ? "sel" : ""}" data-action="fermer">${ech(T("passer"))}</button>` : ""}</div></div>`;
    racine.querySelector(".contenu").innerHTML = `<h2 class="tete">${ech(T("rubrique"))}<span>${marque("SteamU")} ${ech(courante)}</span></h2>${contenu}<div class="points">${Array.from({ length: CLES.length + 2 }, (_, i) => `<button data-page="${i}" class="${i === page ? "on" : ""}" aria-label="${i + 1}" ${i === page ? 'aria-current="step"' : ""}></button>`).join("")}</div><div class="pcv-legende">${legende()}</div>`;
    if (milieu) ranger(racine.querySelector(".piste"));
    const o = window.__pcvReduit?.() ? null : window.__pcvPanneau?.();
    if (fin && dernierePage === CLES.length && o) racine.querySelector(".centre")?.animate?.({ transform: ["translateX(40%)", "none"], opacity: [0, 1] }, o);
    else P.entrer(racine, milieu ? ".piste" : ".centre");
    dernierePage = page;
  };
  let derriere = null, pageAvant = null;
  const fermer = (accueil = true) => {
    if (!ouverte) return;
    ouverte = false;
    gestes.annuler();
    window.__pcvAuRelacher?.(null);
    const f = derriere;
    derriere = null;
    if (f) f();
    const cacher = () => {
      window.__pcvApparition?.(racine, true);
      racine.hidden = true;
    };
    if (f) setTimeout(() => {
      if (!ouverte) cacher();
    }, 350);
    else cacher();
    ecrire(AVIS, courante);
    window.__pcvSon?.("retour");
    if (!f && accueil) {
      if (pageAvant) window.__pcvBridge?.revenirA?.(pageAvant);
      else window.__pcvBridge?.ouvrirAccueil();
    }
    pageAvant = null;
  };
  const ouvrir = (v = version()) => {
    if (!notes(v)) return false;
    if (document.body.dataset.pcvPage !== "accueil") {
      pageAvant ||= window.__pcvBridge?.page?.() || null;
      window.__pcvSteamU?.fermer();
      window.__pcvBridge?.ouvrirAccueil();
      let n = 0;
      const t = setInterval(() => {
        const ici = document.body.dataset.pcvPage === "accueil";
        if (ici || ++n > 20) {
          clearInterval(t);
          if (ici) ouvrir(v);
        }
      }, 150);
      return true;
    }
    courante = v;
    page = 0;
    choix = 0;
    window.__pcvBarreQuitter?.();
    window.__pcvEcran?.fermer();
    window.__pcvNotifsMontrer?.(false);
    window.__pcvSteamU?.fermer();
    ouverte = true;
    vueSeance = v;
    ecrire(VUES, JSON.stringify([.../* @__PURE__ */ new Set([...vues(), v])]));
    racine.hidden = false;
    window.__pcvFond?.(racine);
    dessiner();
    window.__pcvApparition?.(racine);
    return true;
  };
  const legende = (fin = page === CLES.length + 1) => window.__pcvIcones.legende(window.__pcvLegendeDe([page > 0 && [5, "\u25C0"], page > 0 && !fin && [6, "\u25B6"], [1, T(page >= CLES.length ? "terminer" : page === 0 ? choix ? "passer" : "decouvrir" : page === 1 && choix ? "sommaire" : "continuer")], !fin && !(page === 0 && choix) && [2, T("passer")]].filter(Boolean)));
  const dessinerLegende = () => {
    const l = racine.querySelector(".pcv-legende");
    if (l) l.innerHTML = legende();
  };
  const marquerChoix = () => {
    racine.querySelectorAll(".actions button").forEach((b, i) => b.classList.toggle("sel", i === choix));
    racine.querySelectorAll(".fleche.fin").forEach((f) => f.classList.toggle("sel", !!choix));
    dessinerLegende();
  };
  const deplacer = (d) => {
    page = Math.max(0, Math.min(CLES.length + 1, page + d));
    choix = 0;
    dessiner();
    window.__pcvSon?.("bouge");
  };
  const continuer = () => page >= CLES.length ? fermer() : deplacer(1);
  const touche = (b) => {
    if (!ouverte) return false;
    if (page === 0 && (b === 11 || b === 12)) {
      const c = b === 12 ? 1 : 0;
      if (c === choix) window.__pcvSon?.("bord");
      else {
        choix = c;
        marquerChoix();
        window.__pcvSon?.("bouge");
      }
    } else if (page === 0 && (b === 5 || b === 6)) window.__pcvSon?.("bord");
    else if ((b === 11 || b === 12) && page <= CLES.length && (choix || page === (b === 11 ? 1 : CLES.length))) {
      if (choix && page === (b === 11 ? 1 : CLES.length)) window.__pcvSon?.("bord");
      else {
        choix = 1 - choix;
        marquerChoix();
        window.__pcvSon?.("bouge");
      }
    } else if (b === 2) fermer();
    else if (b === 11 || b === 5) deplacer(-1);
    else if (b === 12 || b === 6) deplacer(1);
    else if (b === 1) {
      if (page === 0 && choix) fermer();
      else if (page === 1 && choix) deplacer(-1);
      else continuer();
    }
    return true;
  };
  racine.onclick = (e) => {
    if (!gestes.accepter(e)) return;
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.page !== void 0) {
      page = +b.dataset.page;
      choix = 0;
      dessiner();
    } else if (b.dataset.action === "fermer") fermer();
    else if (b.dataset.action === "precedent") deplacer(-1);
    else continuer();
  };
  const gestes = P.gestes({ ombre: racine, balayer: (e, a) => {
    if (page > 0 && Math.abs(a.dx) > 40 * innerHeight / 800 && Math.abs(a.dx) > Math.abs(a.dy)) deplacer(a.dx < 0 ? 1 : -1);
  } });
  const clavier = (e) => {
    const b = { ArrowLeft: 11, ArrowRight: 12, Escape: 2, Enter: 1, q: 5, e: 6 }[e.key];
    if (!ouverte || !b) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    if (b === 1) {
      if (e.type === "keydown" && !e.repeat) window.__pcvAuRelacher?.(() => touche(1), racine.querySelector("button.sel"));
      else if (e.type === "keyup") {
        window.__pcvAuRelacher?.(null);
        touche(1);
      }
    } else if (e.type === "keydown") touche(b);
  };
  window.addEventListener("keydown", clavier, true);
  window.addEventListener("keyup", clavier, true);
  const apparence = () => dessiner();
  window.addEventListener("pcv-apparence", apparence);
  window.addEventListener("pcv-theme", apparence);
  const verifier = () => {
    const v = version();
    if (v && (!notes(v) || vues().includes(v))) return clearInterval(suivi);
    if (!v || vueSeance === v || !window.__pcvAccueilPose) return;
    if (document.getElementById("pcv-connexion") || document.getElementById("pcv-demarrage") && !window.__pcvDemarrage?.connexionPassee?.()) return;
    O.SteamUIStore?.WindowStore?.GamepadUIMainWindowInstance?.MenuStore?.CloseSideMenus?.();
    if (retourDemande !== v) {
      retourDemande = v;
      window.__pcvBridge?.ouvrirAccueil();
    }
    if (document.body.dataset.pcvPage !== "accueil") return;
    if (ouvrir(v)) {
      try {
        localStorage.removeItem("pcv-maj-nouveautes");
      } catch (_) {
      }
    }
  };
  (window.__pcvManette ||= {}).bienvenue = touche;
  const suivi = setInterval(verifier, 250);
  const attendu = () => {
    const v = version();
    return !!v && notes(v) && !vues().includes(v) && vueSeance !== v;
  };
  window.__pcvBienvenue = {
    ouvrir,
    fermer,
    touche,
    verifier,
    attendu,
    vueSeance: () => vueSeance === version(),
    derriere: (f) => {
      derriere = f;
    },
    ouvert: () => ouverte,
    cles: CLES,
    avis: () => lire(AVIS) === version() && notes(version()),
    liste: () => CLES.map((c) => `<li><b>${ech(T(c + ".titre"))}</b> : ${ech(T(c + ".texte"))}</li>`).join(""),
    detruire: () => {
      gestes.detruire();
      window.__pcvAuRelacher?.(null);
      delete (window.__pcvManette.__brute || window.__pcvManette).bienvenue;
      clearInterval(suivi);
      window.removeEventListener("keydown", clavier, true);
      window.removeEventListener("keyup", clavier, true);
      window.removeEventListener("pcv-apparence", apparence);
      window.removeEventListener("pcv-theme", apparence);
      racine.remove();
    }
  };
})();
