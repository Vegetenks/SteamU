(() => {
  window.__pcvMiiAccueil?.arreter?.();
  document.getElementById("pcv-mii-toile")?.remove();
  document.getElementById("pcv-mii-style")?.remove();
  document.getElementById("pcv-mii-passants")?.remove();
  clearInterval(window.__pcvPassants);
  const passants = document.createElement("style");
  passants.id = "pcv-mii-passants";
  passants.textContent = "#pcv-console .passants { visibility: hidden !important; }";
  document.head.appendChild(passants);
  window.__pcvTuilesLegeres?.arreter?.();
  const LEGER = {
    marge: 1.6,
    // la copie fait au moins 1,6 fois la taille où elle est vue (la tuile choisie grandit de 3,6 %, une tuile portée de 15 %)
    agrandie: 1.15,
    // la plus grande échelle qu'une tuile prend à l'écran (portée au-dessus d'un dossier)
    long: 2.5,
    // et son grand côté au moins 2,5 fois la tuile (un logo peut déborder de sa boîte)
    gain: 0.8,
    // en deçà de 20 % de pixels en moins, l'image d'origine est gardée
    pas: 64,
    // tailles arrondies par paliers (le même jeu de copies sert tant que le zoom ne change pas beaucoup)
    qualite: 0.92,
    // WebP pour les photos (JPEG) ; une image PNG reste en PNG (transparence et motifs fins d'un logo intacts)
    cache: "pcv-tuiles-legeres-v5"
  };
  window.__pcvTuilesLegeres = (() => {
    if ((() => {
      try {
        return JSON.parse(localStorage.getItem("pcv-tuiles-legeres")) === false;
      } catch (e) {
        return false;
      }
    })()) return { etat: () => "coup\xE9", arreter: () => {
    } };
    const copies = /* @__PURE__ */ new Map(), origine = /* @__PURE__ */ new WeakMap(), ecrit = /* @__PURE__ */ new WeakMap(), file = [], vus = /* @__PURE__ */ new Set(), stats = { faites: 0, lues: 0, gardees: 0, echecs: 0, animees: 0 };
    const garderAnimees = () => {
      try {
        return JSON.parse(localStorage.getItem("pcv-tuiles-animees")) === true;
      } catch (e) {
        return false;
      }
    };
    let obs = null, attente = 0, enCours = false, fini = false, aPoser = 0, magasin = null;
    const taille = () => {
      const im = document.querySelector("#pcv-console .cel.jeu .im");
      const w = im?.offsetWidth || 0;
      return w ? Math.ceil(w * (devicePixelRatio || 1) * LEGER.agrandie * LEGER.marge / LEGER.pas) * LEGER.pas : 0;
    };
    const adresses = (bg) => [...bg.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]).filter((u2) => /^https?:/.test(u2));
    const cle = (u2, S) => u2 + "|" + S;
    const poser2 = (el, S) => {
      const o = origine.get(el);
      if (!o) return;
      let bg = o, manque = false;
      for (const u2 of adresses(o)) {
        const c = copies.get(cle(u2, S));
        if (c) bg = bg.split(`url("${u2}")`).join(`url("${c}")`);
        else if (c === void 0) {
          manque = true;
          demander(u2, S);
        }
      }
      if (bg !== el.style.backgroundImage) {
        ecrit.set(el, bg);
        el.style.backgroundImage = bg;
      }
      return manque;
    };
    let dernierS = 0, nouvelles = false;
    const tout = () => {
      aPoser = 0;
      const S = taille();
      if (!S || S === dernierS && !nouvelles) return;
      dernierS = S;
      nouvelles = false;
      for (const el of document.querySelectorAll("#pcv-console .im")) poser2(el, S);
    };
    const plusTard = (neuve) => {
      if (neuve === true) nouvelles = true;
      aPoser ||= requestAnimationFrame(tout);
    };
    const lu = (el) => {
      const bg = el.style.backgroundImage;
      if (!bg || bg === ecrit.get(el)) return;
      origine.set(el, bg);
      ecrit.delete(el);
      poser2(el, taille());
    };
    const demander = (u2, S) => {
      const k = cle(u2, S);
      if (vus.has(k)) return;
      vus.add(k);
      file.push([u2, S]);
      suite();
    };
    const suite = () => {
      if (enCours || attente || fini || !file.length) return;
      attente = (window.requestIdleCallback || ((f) => setTimeout(f, 200)))(travailler, { timeout: 3e3 });
    };
    const ouvrir = async () => {
      if (magasin === null) {
        try {
          magasin = await caches.open(LEGER.cache);
        } catch (e) {
          magasin = false;
        }
      }
      return magasin || null;
    };
    const reduire = async (u2, S) => {
      const m = await ouvrir(), req = "https://pcv.tuiles/?s=" + S + (garderAnimees() ? "&animees=1" : "") + "&u=" + encodeURIComponent(u2);
      const deja = m && await m.match(req).catch(() => null);
      if (deja) {
        stats.lues++;
        const b2 = await deja.blob();
        return b2.size ? decodee(URL.createObjectURL(b2)) : null;
      }
      const r = await fetch(u2, { mode: "cors", credentials: "omit" });
      if (!r.ok) throw new Error(r.status);
      const b = await r.blob();
      const anime = await animee(b);
      if (anime) {
        stats.animees++;
        if (garderAnimees()) {
          stats.gardees++;
          return null;
        }
      }
      const im = await createImageBitmap(b), w = im.width, h = im.height;
      im.close();
      const k = Math.max(S / Math.min(w, h), LEGER.long * S / Math.max(w, h));
      if (k >= LEGER.gain && !anime) {
        stats.gardees++;
        m?.put(req, new Response(new Blob([]))).catch(() => {
        });
        return null;
      }
      const kk = Math.min(1, k), pw = Math.max(1, Math.round(w * kk)), ph = Math.max(1, Math.round(h * kk));
      const p = await createImageBitmap(b, { resizeWidth: pw, resizeHeight: ph, resizeQuality: "high" });
      const c = new OffscreenCanvas(pw, ph);
      c.getContext("2d").drawImage(p, 0, 0);
      p.close();
      const png = await b.slice(1, 4).text() === "PNG";
      const sortie = await c.convertToBlob(png ? { type: "image/png" } : { type: "image/webp", quality: LEGER.qualite });
      m?.put(req, new Response(sortie)).catch(() => {
      });
      stats.faites++;
      return decodee(URL.createObjectURL(sortie));
    };
    const decodees = [];
    const decodee = async (u2) => {
      const im = new Image();
      im.src = u2;
      await im.decode().catch(() => {
      });
      decodees.push(im);
      return u2;
    };
    const animee = async (b) => {
      const t = new Uint8Array(await b.slice(0, 65536).arrayBuffer());
      const a = (k, d = 0) => [...k].every((c, i) => t[d + i] === c.charCodeAt(0));
      const cherche = (k) => {
        for (let i = 0; i + k.length <= t.length; i++) if (a(k, i)) return true;
        return false;
      };
      return a("GIF8") || a("RIFF") && a("WEBP", 8) && cherche("ANIM") || t[1] === 80 && a("PNG", 1) && cherche("acTL");
    };
    const travailler = async () => {
      attente = 0;
      if (fini || !file.length) return;
      const acc = document.getElementById("pcv-console");
      if (document.hidden || !acc || acc.hidden) {
        attente = setTimeout(() => {
          attente = 0;
          suite();
        }, 2e3);
        return;
      }
      enCours = true;
      const [u2, S] = file.shift();
      try {
        copies.set(cle(u2, S), await reduire(u2, S));
      } catch (e) {
        stats.echecs++;
        copies.set(cle(u2, S), null);
      }
      enCours = false;
      if (fini) return;
      plusTard(true);
      suite();
    };
    const observer = () => {
      const acc = document.getElementById("pcv-console");
      if (!acc) return false;
      obs = new MutationObserver((l) => {
        for (const m of l) {
          if (m.type === "attributes") {
            if (m.target.classList?.contains("im")) lu(m.target);
            else if (m.target.classList?.contains("grille")) plusTard();
          } else for (const n of m.addedNodes) if (n.nodeType === 1) {
            if (n.classList.contains("im")) lu(n);
            else n.querySelectorAll?.(".im").forEach(lu);
          }
        }
      });
      obs.observe(acc, { subtree: true, childList: true, attributes: true, attributeFilter: ["style"] });
      acc.querySelectorAll(".im").forEach(lu);
      addEventListener("resize", plusTard);
      return true;
    };
    const essai = setInterval(() => {
      if (fini || observer()) clearInterval(essai);
    }, 1e3);
    if (observer()) clearInterval(essai);
    return {
      etat: () => ({ taille: taille(), copies: copies.size, enFile: file.length, ...stats }),
      arreter: () => {
        fini = true;
        clearInterval(essai);
        obs?.disconnect();
        removeEventListener("resize", plusTard);
        cancelAnimationFrame(aPoser);
        if (attente) {
          (window.cancelIdleCallback || clearTimeout)(attente);
          clearTimeout(attente);
        }
        for (const el of document.querySelectorAll("#pcv-console .im")) {
          const o = origine.get(el);
          if (o && el.style.backgroundImage === ecrit.get(el)) el.style.backgroundImage = o;
        }
        for (const c of copies.values()) if (c) URL.revokeObjectURL(c);
        copies.clear();
        decodees.length = 0;
      }
    };
  })();
  const Tr = window.__pcvT || ((c) => c);
  const T = window.THREE, V = window.__pcvVraisMii;
  if (!T || !V) return "mii-accueil : three.js ou vrais-mii.js absent";
  let M = window.__pcvMii3D?.vrais ? window.__pcvMii3D : null, chargement = null, habitants = null, signale = false;
  let gel = false, dtImage = 1 / 60;
  const lire = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const REG = Object.assign({ actif: true, intervalle: [25, 60], premier: [6, 12], max: 3, plafond: 0, taille: 70, inclinaison: 0.14, resolution: 512 }, lire("pcv-mii-accueil", {}));
  if (REG.plafond === 60) REG.plafond = 0;
  const COMMUNS = [{ sel: "#pcv-barre .rond", genre: "rond" }, { sel: "#pcv-bascule", genre: "rond" }];
  const CIBLES_PAGES = {
    accueil: [
      { sel: "#pcv-console .cel.jeu", genre: "tuile" },
      { sel: "#pcv-console .cel.app", genre: "tuile" },
      { sel: "#pcv-console .cel.dos", genre: "dossier" },
      { sel: "#pcv-console .cel .bdg", genre: "badge" },
      { sel: "#pcv-console .bu", genre: "bulle" },
      { sel: "#pcv-console .zoom", genre: "socle" },
      { sel: "#pcv-console .bas span", genre: "socle" }
    ],
    // la liste des notifications : des cartes larges (une affiche à gauche, un bouton cyan à droite), « Aperçu rapide »
    notifs: [{ sel: "#pcv-notifs .n", genre: "tuile" }, { sel: "#pcv-notifs .n .agir", genre: "bulle" }, { sel: "#pcv-notifs .apercu", genre: "socle" }],
    // la grille des amis (tuiles avec avatar) et les deux onglets
    amis: [{ sel: "#pcv-amis .ami", genre: "tuile" }, { sel: "#pcv-amis .onglet", genre: "socle" }],
    // le panneau Thèmes : les cartes de l'étagère, la grande vitrine, les pastilles de couleur, le titre et les onglets
    themes: [
      { sel: "#pcv-themes .pcvth .carte", genre: "tuile", clip: ".etagere" },
      { sel: "#pcv-themes .pcvth .vitrine", genre: "vitrine" },
      { sel: "#pcv-themes .pcvth .esp i", genre: "pastille" },
      { sel: "#pcv-themes .pcvth .tete", genre: "socle" },
      { sel: "#pcv-themes .pcvth .onglets", genre: "socle" }
    ]
  };
  let pageCourante = null;
  const cibles = () => [...COMMUNS, ...CIBLES_PAGES[pageCourante] || []];
  const GENRES = {
    // (une case vide n'est plus un support : on n'y voit qu'un point, un Mii posé dessus flotterait dans le vide)
    // jaquette : support dont la hauteur affichée est fixe (tuile, dossier, badge, vitrine) — un Mii debout dessus ne
    // doit jamais dépasser sa hauteur (D2 de la revue M. Nintendo : plafond appliqué dans majActeur, voir PLAFOND_JAQUETTE)
    tuile: { dessus: true, assise: true, cache: true, choc: "choc", jaquette: true },
    dossier: { dessus: true, assise: true, cache: true, choc: "ecrase", jaquette: true },
    badge: { dessus: true, choc: "ecrase", jaquette: true },
    bulle: { dessus: true, choc: "rebond" },
    rond: { dessous: true },
    pilule: { dessous: true },
    socle: { dessus: true, pousse: true, choc: "choc" },
    sol: { dessus: true },
    vitrine: { dessus: true, assise: true, choc: "choc", jaquette: true },
    pastille: { dessus: true, choc: "ecrase" }
  };
  const PLAFOND_JAQUETTE = 0.8;
  const REACTIONS = {
    choc: [[80, { ty: 4, sx: 1.015, sy: 0.97 }], [240, { ty: -1, sy: 1.01 }], [200, {}]],
    ecrase: [[70, { ty: 5, sx: 1.14, sy: 0.8 }], [240, { ty: -2, sx: 0.94, sy: 1.08 }], [220, {}]],
    rebond: [[80, { ty: 7, sx: 1.08, sy: 0.8 }], [260, { ty: -3, sx: 0.97, sy: 1.06 }], [220, {}]],
    tremble: [[70, { r: -3 }], [90, { r: 2.4 }], [90, { r: -1.4 }], [90, { r: 0.7 }], [120, {}]],
    accroche: [[80, { ty: 6 }], [200, { ty: 3, r: 0 }]],
    relache: [[80, { ty: -2.5 }], [260, {}]],
    pousse: [[200, { tx: 6, r: 1.6 }], [220, { tx: 2.5, r: 0.4 }], [220, { tx: 7, r: 2 }], [260, {}]]
  };
  const style = document.createElement("style");
  style.id = "pcv-mii-style";
  style.textContent = `#pcv-mii-toile { position: fixed; left: 0; top: 0; pointer-events: none; z-index: 9100; display: none; will-change: transform; }
    #pcv-mii-toile.vu { display: block; }
    .pcv-mii-bouge { translate: var(--pcv-mii-tx, 0px) var(--pcv-mii-ty, 0px) !important; rotate: var(--pcv-mii-r, 0deg) !important; scale: var(--pcv-mii-sx, 1) var(--pcv-mii-sy, 1) !important;
      transition: translate var(--pcv-mii-d, .2s) cubic-bezier(.3,1.5,.5,1), rotate var(--pcv-mii-d, .2s) ease-in-out, scale var(--pcv-mii-d, .2s) cubic-bezier(.3,1.5,.5,1) !important; }`;
  document.head.appendChild(style);
  const PROPS = { tx: ["--pcv-mii-tx", 0, "u"], ty: ["--pcv-mii-ty", 0, "u"], r: ["--pcv-mii-r", 0, "deg"], sx: ["--pcv-mii-sx", 1, ""], sy: ["--pcv-mii-sy", 1, ""] };
  const reagir = (s, nom, sens = 1) => {
    const el = s?.el, pas = REACTIONS[nom];
    if (!el || !pas) return;
    clearTimeout(el.__pcvMiiT);
    el.classList.add("pcv-mii-bouge");
    let i = 0;
    const suivant = () => {
      if (gel) {
        el.__pcvMiiT = setTimeout(suivant, 60);
        return;
      }
      if (i >= pas.length) {
        if (nom !== "accroche") {
          el.classList.remove("pcv-mii-bouge");
          for (const [p] of Object.values(PROPS)) el.style.removeProperty(p);
          el.style.removeProperty("--pcv-mii-d");
        }
        return;
      }
      const [d, v] = pas[i++];
      el.style.setProperty("--pcv-mii-d", d + "ms");
      for (const [k, [p, def, unite]] of Object.entries(PROPS)) {
        const x = (v[k] ?? def) * (k === "tx" || k === "r" ? sens : 1);
        el.style.setProperty(p, unite === "u" ? `calc(var(--u) * ${x})` : unite ? x + unite : String(x));
      }
      el.__pcvMiiT = setTimeout(suivant, d);
    };
    suivant();
  };
  const u = () => innerHeight / 800, hMii = () => REG.taille * u();
  const SOL = { sol: true, genre: "sol", g: GENRES.sol, cle: "sol", r: null, rayon: 0 };
  const majSol = () => {
    const y = innerHeight - 3 * u();
    SOL.r = { left: -1e5, right: 1e5, width: 2e5, top: y, bottom: y + 3 * u(), height: 3 * u() };
  };
  const montre = (el) => !el.closest("[hidden], .cache");
  const visibleRond = (el) => +getComputedStyle(el).opacity > 0.5;
  const dansClip = (el, r, sel) => {
    const c = el.closest(sel);
    if (!c) return true;
    const q = c.getBoundingClientRect();
    return r.top >= q.top - 2 && r.bottom <= q.bottom + 2 && r.left >= q.left - 2 && r.right <= q.right + 2;
  };
  let supImage = null, supT = -1;
  const lireSupports = () => {
    if (supImage && performance.now() - supT < 12) return supImage;
    const l = [];
    cibles().forEach((c) => {
      const g = GENRES[c.genre];
      if (!g) return;
      document.querySelectorAll(c.sel).forEach((el, k) => {
        if (!montre(el) || c.genre === "rond" && !visibleRond(el)) return;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8 || r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) return;
        if (c.clip && !dansClip(el, r, c.clip)) return;
        const cel = el.closest("#pcv-console [data-i]"), i = cel ? cel.dataset.i : null;
        l.push({ el, sel: c.sel, clip: c.clip, k, i, genre: c.genre, g, r, w: el.offsetWidth, cle: c.genre + ":" + (i ?? c.sel + k), rayon: null });
      });
    });
    supImage = l;
    supT = performance.now();
    return l;
  };
  const reprendre = (s) => {
    if (s.sol) {
      majSol();
      s.saute = false;
      return true;
    }
    if (!s.el.isConnected || !s.el.matches(s.sel)) {
      let el = null;
      if (s.i != null) {
        const cel = document.querySelector(`#pcv-console .cel[data-i="${s.i}"]`);
        el = s.genre === "badge" ? cel?.querySelector(".bdg") : cel;
      } else el = document.querySelectorAll(s.sel)[s.k] || null;
      if (!el || !el.matches(s.sel)) return false;
      s.el = el;
    }
    if (!montre(s.el)) return false;
    const r = s.el.getBoundingClientRect(), w = s.el.offsetWidth;
    if (r.width < 4) return false;
    if (s.clip && !dansClip(s.el, r, s.clip)) return false;
    s.saute = !!s.r && Math.hypot(r.left - s.r.left, r.top - s.r.top) > Math.max(0.8 * hMii(), 2500 * u() * dtImage);
    s.r = r;
    s.w = w;
    return true;
  };
  const FORMES = /* @__PURE__ */ new Map();
  const forme = (s) => {
    if (s.genre !== "badge") return null;
    s.url ??= /^url\(["']?([\s\S]*?)["']?\)$/.exec(getComputedStyle(s.el).backgroundImage.split(/,\s*(?=url\()/)[0])?.[1] || "";
    if (!s.url) return null;
    const f = FORMES.get(s.url);
    if (f !== void 0) return f;
    FORMES.set(s.url, null);
    const im = new Image();
    im.onload = () => {
      try {
        const n = 64, c = document.createElement("canvas");
        c.width = c.height = n;
        const x = c.getContext("2d");
        x.drawImage(im, 0, 0, n, n);
        const d = x.getImageData(0, 0, n, n).data, plein = (i, y) => d[(y * n + i) * 4 + 3] > 60;
        let haut2 = -1, g = n, dr = 0;
        for (let y = 0; y < n && haut2 < 0; y++) for (let i = 0; i < n; i++) if (plein(i, y)) {
          haut2 = y;
          break;
        }
        if (haut2 < 0) return;
        for (let y = haut2; y < Math.min(n, haut2 + 6); y++) for (let i = 0; i < n; i++) if (plein(i, y)) {
          g = Math.min(g, i);
          dr = Math.max(dr, i + 1);
        }
        FORMES.set(s.url, { ar: im.naturalWidth / im.naturalHeight, fy: haut2 / n, fx0: g / n, fx1: dr / n });
      } catch (e) {
      }
    };
    im.src = s.url;
    return null;
  };
  const dessus = (s) => {
    const r = s.r, f = forme(s);
    if (!f) {
      const m = marge(s);
      return { y: r.top, x0: r.left + m, x1: r.right - m };
    }
    const w = r.width, h = r.height, dw = f.ar > w / h ? w : h * f.ar, dh = dw / f.ar, ox = r.left + (w - dw) / 2, oy = r.top + (h - dh) / 2;
    let x0 = ox + f.fx0 * dw, x1 = ox + f.fx1 * dw;
    const mi = 0.08 * hMii();
    if (x1 - x0 < 2 * mi) {
      const c = (x0 + x1) / 2;
      x0 = c - mi;
      x1 = c + mi;
    }
    return { y: oy + f.fy * dh, x0, x1 };
  };
  const haut = (s) => dessus(s).y;
  const rayonDe = (s) => s.rayon ??= s.sol ? 0 : parseFloat(getComputedStyle(s.el).borderTopLeftRadius) || 0;
  const marge = (s) => s.sol ? 0 : Math.min(s.r.width * 0.42, Math.max(rayonDe(s) * 0.55, 0.14 * hMii()));
  const segment = (s) => {
    const d = dessus(s);
    return [d.x0, d.x1];
  };
  const centre = (s) => [(s.r.left + s.r.right) / 2, (s.r.top + s.r.bottom) / 2];
  const borne = (x, a, b) => Math.max(a, Math.min(b, x));
  const alea = (a, b) => a + Math.random() * (b - a);
  const melanger = (l) => l.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const lien = (A, B) => {
    const h = hMii(), [a0, a1] = segment(A), [b0, b1] = segment(B);
    if (a1 < a0 || b1 < b0) return null;
    const gap = Math.max(0, b0 - a1, a0 - b1), monte = haut(A) - haut(B);
    if (monte > 3.3 * h || gap > 3.6 * h || monte > 1.8 * h && gap > 0.3 * h) return null;
    if (B.genre === "bulle" && monte > 0) return null;
    return 1 + gap / (6 * h) + Math.max(0, monte) / (8 * h);
  };
  const entrees = (sup) => {
    const h = hMii(), W = innerWidth, l = [];
    for (const cote of [-1, 1]) {
      l.push({ s: SOL, entree: "sol", cote, cout: 0.6 });
      for (const s of sup) {
        if (!s.g.dessus || s.genre === "bulle") continue;
        const [x0, x1] = segment(s);
        if (x1 - x0 < 0.3 * h) continue;
        const ecart = cote < 0 ? x0 : W - x1;
        if (ecart > -h && ecart < 3 * h && s.r.top > 1.3 * h && s.r.top < innerHeight - 1.6 * h) l.push({ s, entree: "bond", cote, cout: 0.8 });
      }
    }
    return l;
  };
  const planifier = (sup, estBut, parSol, xBut) => {
    majSol();
    const noeuds = [SOL, ...sup.filter((s) => s.g.dessus)], dist = /* @__PURE__ */ new Map(), prec = /* @__PURE__ */ new Map(), faits = /* @__PURE__ */ new Set();
    for (const e of entrees(sup)) {
      if (parSol && e.entree !== "sol") continue;
      const loin = xBut == null || e.entree !== "sol" ? 0 : Math.abs((e.cote < 0 ? 0 : innerWidth) - xBut) / (5 * hMii()), c = e.cout + loin + Math.random() * 1.5;
      if (c < (dist.get(e.s) ?? 1e9)) {
        dist.set(e.s, c);
        prec.set(e.s, e);
      }
    }
    for (; ; ) {
      let best = null, bd = 1e9;
      for (const [s, d] of dist) if (!faits.has(s) && d < bd) {
        bd = d;
        best = s;
      }
      if (!best) return null;
      if (estBut(best)) {
        const chemin2 = [];
        for (let s = best; s; ) {
          const p = prec.get(s);
          chemin2.unshift({ s, entree: p.entree, cote: p.cote });
          s = p.de;
        }
        return chemin2;
      }
      faits.add(best);
      for (const B of noeuds) {
        if (faits.has(B)) continue;
        const c = lien(best, B);
        if (c == null) continue;
        if (bd + c < (dist.get(B) ?? 1e9)) {
          dist.set(B, bd + c);
          prec.set(B, { de: best });
        }
      }
    }
  };
  let toile = null, rendu = null, scene = null, cam = null, camEcran = null, raf = 0, dernier = 0, minuterie = 0, veille = 0, demarre = false;
  const acteurs = [];
  const preparerRendu = () => {
    if (rendu) return true;
    try {
      toile = document.createElement("canvas");
      toile.id = "pcv-mii-toile";
      rendu = new T.WebGLRenderer({ canvas: toile, alpha: true, antialias: REG.lissage !== false, powerPreference: "high-performance" });
    } catch (e) {
      console.warn("mii-accueil : pas de WebGL", e);
      rendu = null;
      return false;
    }
    rendu.setClearColor(0, 0);
    rendu.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    scene = new T.Scene();
    M.eclairer(scene);
    cam = new T.OrthographicCamera(0, 1, 0, -1, -3e3, 3e3);
    cam.position.z = 1e3;
    camEcran = new T.OrthographicCamera(0, 1, 0, -1, -3e3, 3e3);
    camEcran.position.z = 1e3;
    retailler();
    addEventListener("resize", retailler);
    return true;
  };
  const retailler = () => {
    if (!rendu) return;
    const W = innerWidth, H = innerHeight;
    camEcran.left = 0;
    camEcran.right = W;
    camEcran.top = 0;
    camEcran.bottom = -H;
    camEcran.updateProjectionMatrix();
    cadre.w = cadre.h = 0;
    majSol();
    for (const a of acteurs) {
      a.mii.regler(hMii());
      a.tailleVue = hMii();
    }
  };
  const cadre = { w: 0, h: 0, petit: 0 };
  const cadrer = (t) => {
    const h = hMii(), Q = 128, W = innerWidth, H = innerHeight;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const a of acteurs) {
      const b = a.mii.rectEcran(camEcran, W, H);
      x0 = Math.min(x0, b.x0);
      y0 = Math.min(y0, b.y0);
      x1 = Math.max(x1, b.x1);
      y1 = Math.max(y1, b.y1);
      for (const o of a.objets) if (o.visible) {
        const c = boiteObjet(o);
        x0 = Math.min(x0, c.x0);
        y0 = Math.min(y0, c.y0);
        x1 = Math.max(x1, c.x1);
        y1 = Math.max(y1, c.y1);
      }
    }
    x0 = Math.max(0, Math.floor((x0 - 0.6 * h) / Q) * Q);
    y0 = Math.max(0, Math.floor((y0 - 0.6 * h) / Q) * Q);
    x1 = Math.min(Math.ceil(W / Q) * Q, Math.ceil((x1 + 0.6 * h) / Q) * Q);
    y1 = Math.min(Math.ceil(H / Q) * Q, Math.ceil((y1 + 0.6 * h) / Q) * Q);
    const w = Math.max(Q, x1 - x0), hh = Math.max(Q, y1 - y0);
    const petit = w < cadre.w * 0.6 && hh < cadre.h * 0.6;
    if (!petit) cadre.petit = 0;
    else cadre.petit ||= t;
    const dense = Math.min(2, devicePixelRatio || 1), voulu = w * hh > 0.3 * W * H ? 1 : dense;
    if (voulu !== rendu.getPixelRatio() && (voulu < rendu.getPixelRatio() || petit)) {
      rendu.setPixelRatio(voulu);
      cadre.w = cadre.h = 0;
    }
    if (w > cadre.w || hh > cadre.h || petit && t - cadre.petit > 1e3) {
      cadre.w = w;
      cadre.h = hh;
      cadre.petit = 0;
      rendu.setSize(w, hh, false);
      toile.style.width = w + "px";
      toile.style.height = hh + "px";
    }
    toile.style.transform = `translate(${x0}px, ${y0}px)`;
    cam.left = x0;
    cam.right = x0 + cadre.w;
    cam.top = -y0;
    cam.bottom = -(y0 + cadre.h);
    cam.updateProjectionMatrix();
  };
  const placerToile = () => {
    const c = document.getElementById("pcv-console"), hote = c?.parentElement || document.body;
    if (toile.parentElement !== hote) hote.appendChild(toile);
  };
  const cache = (a) => {
    const s = a.cache;
    if (!s) {
      if (a.occ) a.occ.visible = false;
      return;
    }
    const r = s.r, cle = Math.round(r.width) + "x" + Math.round(r.height);
    if (!a.occ || a.occ.userData.cle !== cle) {
      if (a.occ) {
        a.occ.geometry.dispose();
        a.occ.removeFromParent();
      }
      const w = r.width, h = r.height, k = Math.min(rayonDe(s), w / 2, h / 2), f = new T.Shape();
      f.moveTo(k, 0);
      f.lineTo(w - k, 0);
      f.quadraticCurveTo(w, 0, w, k);
      f.lineTo(w, h - k);
      f.quadraticCurveTo(w, h, w - k, h);
      f.lineTo(k, h);
      f.quadraticCurveTo(0, h, 0, h - k);
      f.lineTo(0, k);
      f.quadraticCurveTo(0, 0, k, 0);
      a.occ = new T.Mesh(new T.ShapeGeometry(f, 4), new T.MeshBasicMaterial({ colorWrite: false }));
      a.occ.renderOrder = -10;
      a.occ.userData.cle = cle;
      scene.add(a.occ);
    }
    a.occ.visible = true;
    a.occ.position.set(r.left, -r.bottom, 400);
  };
  const PARTAGE = /* @__PURE__ */ new Map();
  const une = (cle, faire) => {
    let v = PARTAGE.get(cle);
    if (!v) PARTAGE.set(cle, v = faire());
    return v;
  };
  const viderPartage = () => {
    for (const v of PARTAGE.values()) {
      v.map?.dispose?.();
      v.dispose?.();
    }
    PARTAGE.clear();
  };
  const mat = (c, o = {}) => une("mat:" + c + ":" + JSON.stringify(o), () => new T.MeshLambertMaterial({ color: c, ...o }));
  const boite = () => une("geo:boite", () => new T.BoxGeometry(1, 1, 1));
  const cylindre = () => une("geo:cyl", () => new T.CylinderGeometry(1, 1, 1, 10));
  const morceau = (geo, m, sx, sy, sz, x = 0, y = 0, z = 0) => {
    const o = new T.Mesh(geo, m);
    o.scale.set(sx, sy, sz);
    o.position.set(x, y, z);
    return o;
  };
  const toile2D = (n, dessiner) => {
    const c = document.createElement("canvas");
    c.width = c.height = n;
    const x = c.getContext("2d");
    x.lineJoin = x.lineCap = "round";
    dessiner(x, n);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  };
  const etoile5 = (x, cx, cy, R, r) => {
    x.beginPath();
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r : R;
      x.lineTo(cx + q * Math.cos(a), cy + q * Math.sin(a));
    }
    x.closePath();
  };
  const ICONES = {
    coeur: (x) => {
      x.fillStyle = "#ff5c7c";
      x.beginPath();
      x.moveTo(50, 82);
      x.bezierCurveTo(10, 56, 14, 18, 38, 22);
      x.bezierCurveTo(46, 23, 50, 30, 50, 34);
      x.bezierCurveTo(50, 30, 54, 23, 62, 22);
      x.bezierCurveTo(86, 18, 90, 56, 50, 82);
      x.fill();
      x.fillStyle = "rgba(255,255,255,.55)";
      x.beginPath();
      x.ellipse(33, 36, 7, 4.5, -0.7, 0, 7);
      x.fill();
    },
    note: (x) => {
      x.fillStyle = x.strokeStyle = "#2f9cf4";
      x.lineWidth = 7;
      for (const [cx, cy] of [[30, 72], [68, 64]]) {
        x.beginPath();
        x.ellipse(cx, cy, 12, 9, -0.4, 0, 7);
        x.fill();
      }
      x.beginPath();
      x.moveTo(40, 70);
      x.lineTo(40, 24);
      x.lineTo(78, 16);
      x.lineTo(78, 62);
      x.stroke();
      x.lineWidth = 9;
      x.beginPath();
      x.moveTo(40, 26);
      x.lineTo(78, 18);
      x.stroke();
    },
    etoile: (x) => {
      x.fillStyle = "#ffc629";
      etoile5(x, 50, 53, 38, 16);
      x.fill();
      x.strokeStyle = "#f0a400";
      x.lineWidth = 4;
      x.stroke();
    },
    manette: (x) => {
      x.fillStyle = "#5b6878";
      x.beginPath();
      x.moveTo(22, 36);
      x.quadraticCurveTo(50, 28, 78, 36);
      x.quadraticCurveTo(96, 40, 92, 66);
      x.quadraticCurveTo(88, 80, 74, 70);
      x.quadraticCurveTo(50, 60, 26, 70);
      x.quadraticCurveTo(12, 80, 8, 66);
      x.quadraticCurveTo(4, 40, 22, 36);
      x.fill();
      x.fillStyle = "#fff";
      x.fillRect(22, 47, 16, 5);
      x.fillRect(27.5, 41.5, 5, 16);
      for (const [cx, cy, c] of [[70, 44, "#ff6b6b"], [78, 51, "#4fc3f7"], [62, 51, "#ffd54f"], [70, 58, "#81c784"]]) {
        x.fillStyle = c;
        x.beginPath();
        x.arc(cx, cy, 4.2, 0, 7);
        x.fill();
      }
    },
    exclam: (x) => {
      x.fillStyle = "#ff8a1e";
      x.beginPath();
      x.roundRect(41, 14, 18, 52, 9);
      x.fill();
      x.beginPath();
      x.arc(50, 82, 9.5, 0, 7);
      x.fill();
    },
    question: (x) => {
      x.strokeStyle = x.fillStyle = "#2f9cf4";
      x.lineWidth = 13;
      x.beginPath();
      x.arc(50, 36, 18, Math.PI * 1.1, Math.PI * 2.35);
      x.quadraticCurveTo(50, 54, 50, 62);
      x.stroke();
      x.beginPath();
      x.arc(50, 83, 8.5, 0, 7);
      x.fill();
    },
    horloge: (x) => {
      x.fillStyle = "#fff";
      x.strokeStyle = "#2f9cf4";
      x.lineWidth = 8;
      x.beginPath();
      x.arc(50, 52, 34, 0, 7);
      x.fill();
      x.stroke();
      x.strokeStyle = "#3a4552";
      x.lineWidth = 7;
      x.beginPath();
      x.moveTo(50, 52);
      x.lineTo(50, 30);
      x.moveTo(50, 52);
      x.lineTo(66, 60);
      x.stroke();
    },
    points: (x) => {
      x.fillStyle = "#8a96a6";
      for (const cx of [26, 50, 74]) {
        x.beginPath();
        x.arc(cx, 54, 8.5, 0, 7);
        x.fill();
      }
    },
    soleil: (x) => {
      x.fillStyle = x.strokeStyle = "#ffb300";
      x.lineWidth = 7;
      x.beginPath();
      x.arc(50, 52, 18, 0, 7);
      x.fill();
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        x.beginPath();
        x.moveTo(50 + 26 * Math.cos(a), 52 + 26 * Math.sin(a));
        x.lineTo(50 + 36 * Math.cos(a), 52 + 36 * Math.sin(a));
        x.stroke();
      }
    },
    pouce: (x) => {
      x.fillStyle = "#ffcf9e";
      x.strokeStyle = "#d9935b";
      x.lineWidth = 4;
      x.beginPath();
      x.roundRect(22, 44, 16, 36, 4);
      x.fill();
      x.stroke();
      x.beginPath();
      x.moveTo(42, 46);
      x.lineTo(52, 18);
      x.quadraticCurveTo(62, 16, 60, 30);
      x.lineTo(58, 42);
      x.lineTo(76, 42);
      x.quadraticCurveTo(84, 44, 80, 54);
      x.lineTo(74, 78);
      x.quadraticCurveTo(72, 82, 66, 82);
      x.lineTo(42, 82);
      x.closePath();
      x.fill();
      x.stroke();
    }
  };
  const texBulle = (icone) => une("tex:bulle:" + icone, () => toile2D(128, (x) => {
    x.save();
    x.shadowColor = "rgba(40,60,90,.25)";
    x.shadowBlur = 6;
    x.shadowOffsetY = 2;
    x.fillStyle = "#fff";
    x.beginPath();
    x.ellipse(64, 56, 54, 46, 0, 0, 7);
    x.fill();
    x.beginPath();
    x.moveTo(44, 92);
    x.lineTo(34, 122);
    x.lineTo(64, 98);
    x.fill();
    x.restore();
    x.strokeStyle = "#d5dde8";
    x.lineWidth = 3;
    x.beginPath();
    x.ellipse(64, 56, 54, 46, 0, 0, 7);
    x.stroke();
    x.save();
    x.translate(64 - 30, 56 - 31);
    x.scale(0.6, 0.6);
    ICONES[icone](x);
    x.restore();
  }));
  const MARQUES = {
    z: (x) => {
      x.fillStyle = "#6f8fd8";
      x.strokeStyle = "#fff";
      x.lineWidth = 10;
      x.beginPath();
      x.moveTo(24, 26);
      x.lineTo(76, 26);
      x.lineTo(76, 36);
      x.lineTo(42, 72);
      x.lineTo(78, 72);
      x.lineTo(78, 84);
      x.lineTo(22, 84);
      x.lineTo(22, 74);
      x.lineTo(56, 38);
      x.lineTo(24, 38);
      x.closePath();
      x.stroke();
      x.fill();
    },
    etoile: (x) => {
      x.fillStyle = "#ffd23a";
      x.strokeStyle = "#fff";
      x.lineWidth = 8;
      etoile5(x, 50, 54, 42, 18);
      x.stroke();
      x.fill();
    },
    note: (x) => {
      x.scale(1, 1);
      ICONES.note(x);
    },
    goutte: (x) => {
      x.fillStyle = "#8fd3ff";
      x.strokeStyle = "#fff";
      x.lineWidth = 7;
      x.beginPath();
      x.moveTo(50, 12);
      x.bezierCurveTo(56, 34, 80, 52, 76, 70);
      x.arc(50, 68, 26, 0.1, Math.PI - 0.1);
      x.bezierCurveTo(20, 52, 44, 34, 50, 12);
      x.stroke();
      x.fill();
    },
    poussiere: (x) => {
      x.fillStyle = "rgba(255,255,255,.95)";
      for (const [cx, cy, r] of [[38, 60, 22], [62, 56, 25], [50, 40, 20]]) {
        x.beginPath();
        x.arc(cx, cy, r, 0, 7);
        x.fill();
      }
    },
    eclat: (x) => {
      x.fillStyle = "#fffbe0";
      etoile5(x, 50, 50, 48, 10);
      x.fill();
    },
    // une tache de peinture, blanche : la couleur vient de la teinte du sprite
    k1: (x) => {
      x.lineCap = "round";
      for (const [a, c] of [[-0.5, "#f3d579"], [0.2, "#d7a842"], [0.9, "#f7e29a"]]) {
        x.strokeStyle = c;
        x.lineWidth = 7;
        x.beginPath();
        x.moveTo(50 - 34 * Math.cos(a), 50 - 34 * Math.sin(a));
        x.lineTo(50 + 34 * Math.cos(a), 50 + 34 * Math.sin(a));
        x.stroke();
      }
    },
    k2: (x) => {
      const g = x.createRadialGradient(50, 55, 4, 50, 55, 46);
      g.addColorStop(0, "#fff6c0");
      g.addColorStop(0.35, "#ffb02e");
      g.addColorStop(0.75, "#ff5a1a");
      g.addColorStop(1, "rgba(255,60,0,0)");
      x.fillStyle = g;
      x.beginPath();
      x.arc(50, 55, 46, 0, 7);
      x.fill();
    },
    k3: (x) => {
      x.strokeStyle = "rgba(255,255,255,.95)";
      x.lineCap = "round";
      for (const [y, l, w] of [[30, 70, 7], [50, 90, 9], [70, 60, 7]]) {
        x.lineWidth = w;
        x.beginPath();
        x.moveTo(95 - l, y);
        x.lineTo(95, y);
        x.stroke();
      }
    },
    k4: (x) => {
      x.fillStyle = "#4cae3a";
      x.beginPath();
      x.ellipse(50, 50, 16, 36, 0.6, 0, 7);
      x.fill();
      x.strokeStyle = "#2f7d22";
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(34, 72);
      x.lineTo(66, 28);
      x.stroke();
    },
    k5: (x) => {
      const g = x.createRadialGradient(50, 50, 4, 50, 50, 48);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.3, "#fff2a0");
      g.addColorStop(0.6, "#ff9a2a");
      g.addColorStop(0.85, "#e8401a");
      g.addColorStop(1, "rgba(200,40,10,0)");
      x.fillStyle = g;
      x.beginPath();
      x.arc(50, 50, 48, 0, 7);
      x.fill();
    },
    k6: (x) => {
      const g = x.createRadialGradient(50, 50, 6, 50, 50, 48);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.35, "#a8e9ff");
      g.addColorStop(0.7, "#3a9dff");
      g.addColorStop(1, "rgba(30,90,255,0)");
      x.fillStyle = g;
      x.beginPath();
      x.arc(50, 50, 48, 0, 7);
      x.fill();
    },
    k7: (x) => {
      for (const [cx, cy, c] of [[30, 30, "#8a5a32"], [62, 40, "#6cb544"], [44, 66, "#7a4e2b"], [70, 70, "#97663c"]]) {
        x.fillStyle = c;
        x.fillRect(cx - 12, cy - 12, 24, 24);
      }
    },
    k8: (x) => {
      const g = x.createLinearGradient(0, 0, 0, 100);
      g.addColorStop(0, "rgba(255,90,20,0)");
      g.addColorStop(0.6, "rgba(255,150,40,.85)");
      g.addColorStop(1, "#fff4c0");
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(38, 0);
      x.lineTo(62, 0);
      x.quadraticCurveTo(78, 90, 50, 100);
      x.quadraticCurveTo(22, 90, 38, 0);
      x.fill();
    },
    k9: (x) => {
      x.lineCap = "round";
      for (const [w, c] of [[16, "rgba(120,200,255,.55)"], [8, "#e9f7ff"]]) {
        x.strokeStyle = c;
        x.lineWidth = w;
        x.beginPath();
        x.arc(50, 95, 60, Math.PI * 1.2, Math.PI * 1.8);
        x.stroke();
      }
    },
    k10: (x) => {
      const g = x.createRadialGradient(50, 50, 0, 50, 50, 50);
      g.addColorStop(0, "rgba(255,255,255,.75)");
      g.addColorStop(0.6, "rgba(255,255,255,.45)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 100, 100);
    },
    k11: (x) => {
      x.fillStyle = "rgba(150,150,160,.95)";
      for (const [cx, cy, r] of [[38, 60, 24], [62, 56, 27], [50, 38, 22]]) {
        x.beginPath();
        x.arc(cx, cy, r, 0, 7);
        x.fill();
      }
    },
    tache: (x) => {
      x.fillStyle = "#fff";
      x.beginPath();
      x.arc(50, 52, 30, 0, 7);
      x.fill();
      for (const [cx, cy, r] of [[18, 40, 9], [82, 62, 8], [64, 18, 7], [30, 84, 6]]) {
        x.beginPath();
        x.arc(cx, cy, r, 0, 7);
        x.fill();
      }
    }
  };
  const texMarque = (nom) => une("tex:marque:" + nom, () => toile2D(64, (x) => {
    x.scale(0.64, 0.64);
    MARQUES[nom](x);
  }));
  const sprite = (tex, taille) => {
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    s.scale.set(taille, taille, 1);
    s.renderOrder = 20;
    s.userData.propre = true;
    return s;
  };
  const FABRIQUES = {
    // échelle en bois : deux montants, des barreaux tous les quarts de Mii
    echelle: (L) => {
      const h = hMii(), g = new T.Group(), W = 0.44 * h, e = 0.06 * h, bois = mat(13142602), barreau = mat(14921066);
      g.add(morceau(boite(), bois, e, L, e, -W / 2, L / 2), morceau(boite(), bois, e, L, e, W / 2, L / 2));
      for (let y = 0.2 * h; y < L - 0.05 * h; y += 0.26 * h) g.add(morceau(boite(), barreau, W, 0.045 * h, 0.045 * h, 0, y));
      g.userData.pas = 0.26 * h;
      return g;
    },
    // ballon de plage (quartiers rouge, blanc, bleu, jaune)
    ballon: () => {
      const h = hMii(), r = 0.19 * h;
      const m = une("mat:ballon", () => new T.MeshLambertMaterial({ map: toile2D(128, (x) => {
        ["#ec4a3c", "#ffffff", "#2f8fe0", "#ffffff", "#f6c51a", "#ffffff"].forEach((c, k) => {
          x.fillStyle = c;
          x.fillRect(k * 128 / 6, 0, 128 / 6 + 1, 128);
        });
        x.fillStyle = "#fff";
        x.fillRect(0, 0, 128, 10);
        x.fillRect(0, 118, 128, 10);
      }) }));
      const o = new T.Mesh(une("geo:sphere", () => new T.SphereGeometry(1, 20, 14)), m);
      o.scale.setScalar(r);
      const g = new T.Group();
      g.add(o);
      g.userData.rayon = r;
      g.userData.boule = o;
      return g;
    },
    // parapluie : manche à crosse, toile en 8 pans (rouge et blanc) qui s'ouvre (g.userData.ouvrir(k), k de 0 à 1)
    parapluie: () => {
      const h = hMii(), g = new T.Group(), manche = mat(7031342), L = 0.95 * h;
      g.add(morceau(cylindre(), manche, 0.022 * h, L, 0.022 * h, 0, L / 2));
      const crosse = new T.Mesh(une("geo:crosse", () => new T.TorusGeometry(1, 0.28, 6, 12, Math.PI)), manche);
      crosse.scale.setScalar(0.075 * h);
      crosse.rotation.z = Math.PI;
      crosse.position.set(0.075 * h, 0, 0);
      g.add(crosse);
      const tm = une("mat:toile-parapluie", () => new T.MeshLambertMaterial({ side: T.DoubleSide, map: toile2D(128, (x) => {
        for (let k = 0; k < 8; k++) {
          x.fillStyle = k % 2 ? "#ffffff" : "#e84a3d";
          x.fillRect(k * 16, 0, 17, 128);
        }
      }) }));
      const toile2 = new T.Mesh(une("geo:toile-parapluie", () => new T.CylinderGeometry(0.03, 1, 0.42, 8, 1, true)), tm);
      toile2.position.y = L;
      g.add(toile2);
      const pointe = morceau(cylindre(), manche, 0.02 * h, 0.12 * h, 0.02 * h, 0, L + 0.2 * h);
      g.add(pointe);
      const R = 0.62 * h, H = 0.3 * h;
      g.userData.ouvrir = (k) => {
        k = borne(k, 0, 1);
        const haut2 = H * (1.9 - 0.9 * k);
        toile2.scale.set(R * (0.13 + 0.87 * k), haut2 / 0.42, R * (0.13 + 0.87 * k));
        toile2.position.y = L + 0.08 * h - haut2 / 2;
      };
      g.userData.ouvrir(0);
      return g;
    },
    // appareil photo : boîtier, objectif, flash
    appareil: () => {
      const h = hMii(), g = new T.Group();
      g.add(morceau(boite(), mat(4409941), 0.32 * h, 0.2 * h, 0.13 * h), morceau(boite(), mat(15265267), 0.1 * h, 0.05 * h, 0.06 * h, -0.09 * h, 0.12 * h));
      const obj = morceau(cylindre(), mat(2040875), 0.075 * h, 0.1 * h, 0.075 * h, 0.03 * h, 0, 0.1 * h);
      obj.rotation.x = Math.PI / 2;
      g.add(obj);
      const verre = morceau(cylindre(), mat(6271999, { emissive: 1454154 }), 0.05 * h, 0.02 * h, 0.05 * h, 0.03 * h, 0, 0.155 * h);
      verre.rotation.x = Math.PI / 2;
      g.add(verre);
      return g;
    },
    // balai : manche et paille, la paille en bas (origine au milieu du manche, là où on le tient)
    balai: () => {
      const h = hMii(), g = new T.Group(), L = 1.05 * h;
      g.add(morceau(cylindre(), mat(11696965), 0.022 * h, L, 0.022 * h, 0, 0));
      const paille = new T.Mesh(une("geo:paille", () => new T.CylinderGeometry(0.35, 1, 1, 10)), mat(15319900));
      paille.scale.set(0.13 * h, 0.26 * h, 0.07 * h);
      paille.position.y = -L / 2 - 0.1 * h;
      g.add(paille);
      g.add(morceau(cylindre(), mat(12597547), 0.05 * h, 0.03 * h, 0.05 * h, 0, -L / 2 + 0.03 * h));
      return g;
    },
    // enveloppe (le facteur des notifications) : papier blanc, rabat bleuté, cachet rouge
    enveloppe: () => {
      const h = hMii(), g = new T.Group(), W = 0.44 * h, H = 0.29 * h;
      g.add(morceau(boite(), mat(16777215), W, H, 0.025 * h));
      const rabat = new T.Mesh(une("geo:rabat", () => {
        const f = new T.Shape();
        f.moveTo(-0.5, 0.5);
        f.lineTo(0.5, 0.5);
        f.lineTo(0, -0.08);
        f.closePath();
        return new T.ShapeGeometry(f);
      }), mat(14411506, { side: T.DoubleSide }));
      rabat.scale.set(W, H, 1);
      rabat.position.z = 0.014 * h;
      g.add(rabat);
      const cachet = morceau(cylindre(), mat(15026253), 0.045 * h, 0.012 * h, 0.045 * h, 0, -0.01 * h, 0.022 * h);
      cachet.rotation.x = Math.PI / 2;
      g.add(cachet);
      return g;
    },
    // pinceau de peintre : manche de bois, virole grise, poils de la couleur prise (g.userData.teinter(couleur))
    pinceau: () => {
      const h = hMii(), g = new T.Group(), L = 0.5 * h;
      g.add(morceau(cylindre(), mat(13142602), 0.025 * h, L, 0.025 * h, 0, -L / 2 + 0.05 * h), morceau(cylindre(), mat(12108492), 0.035 * h, 0.07 * h, 0.035 * h, 0, 0.08 * h));
      const poils = new T.Mesh(une("geo:poils", () => new T.CylinderGeometry(0.55, 1, 1, 8)), new T.MeshLambertMaterial({ color: 15918793 }));
      poils.userData.propre = true;
      poils.scale.set(0.05 * h, 0.12 * h, 0.03 * h);
      poils.position.y = 0.17 * h;
      g.add(poils);
      g.userData.teinter = (c) => poils.material.color.set(c);
      return g;
    },
    o1: () => {
      const h = hMii(), g = new T.Group(), W = 1.3 * h, Hc = 0.3 * h, D = 0.78 * h;
      const paille = une("tex:o1", () => toile2D(256, (x) => {
        x.fillStyle = "#d9b04a";
        x.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1400; i++) {
          const c = ["#f1d27a", "#c99a35", "#e8c25d", "#a9772a", "#f7e3a0"][i % 5], a = Math.random() * Math.PI, L = 10 + Math.random() * 26, X = Math.random() * 256, Y = Math.random() * 256;
          x.strokeStyle = c;
          x.lineWidth = 1.2 + Math.random() * 1.4;
          x.beginPath();
          x.moveTo(X, Y);
          x.lineTo(X + Math.cos(a) * L, Y + Math.sin(a) * L * 0.45);
          x.stroke();
        }
      }));
      const bois = une("tex:o1b", () => toile2D(128, (x) => {
        x.fillStyle = "#8a5a32";
        x.fillRect(0, 0, 128, 128);
        for (let k = 0; k < 4; k++) {
          const y = k * 32;
          x.fillStyle = k % 2 ? "#7b4e2b" : "#93623a";
          x.fillRect(0, y + 2, 128, 28);
          x.fillStyle = "#4d2f18";
          x.fillRect(0, y, 128, 2);
        }
        x.fillStyle = "#4d2f18";
        x.fillRect(0, 0, 8, 128);
        x.fillRect(120, 0, 8, 128);
      }));
      const caisse = new T.Mesh(une("geo:caisse", () => new T.BoxGeometry(1, 1, 1)), une("mat:o1b", () => new T.MeshLambertMaterial({ map: bois })));
      caisse.scale.set(W, Hc, D);
      caisse.position.y = Hc / 2;
      g.add(caisse);
      const tas = new T.Mesh(une("geo:o1t", () => {
        const b = new T.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), P = b.attributes.position, v = new T.Vector3();
        for (let i = 0; i < P.count; i++) {
          v.fromBufferAttribute(P, i);
          const n = 0.08 * Math.sin(v.x * 9 + v.z * 5) * Math.sin(v.z * 7 - v.y * 4) + 0.05 * Math.sin(v.x * 17 + v.y * 13);
          v.multiplyScalar(1 + n * (v.y > 0.05 ? 1 : 0));
          P.setXYZ(i, v.x, v.y, v.z);
        }
        b.computeVertexNormals();
        return b;
      }), une("mat:o1", () => new T.MeshLambertMaterial({ map: paille })));
      tas.scale.set(W * 0.56, 0.55 * h, D * 0.56);
      tas.position.y = Hc * 0.8;
      g.add(tas);
      g.userData.dessus = Hc * 0.8 + 0.5 * h;
      return g;
    },
    o3: () => {
      const h = hMii(), g = new T.Group(), W = 1 * h, H = 0.82 * h, D = 0.78 * h;
      const tex = une("tex:o3", () => toile2D(128, (x) => {
        x.fillStyle = "#b8874f";
        x.fillRect(0, 0, 128, 128);
        x.fillStyle = "#a6763f";
        for (let i = 0; i < 128; i += 6) x.fillRect(0, i, 128, 2);
        x.fillStyle = "#d9bf8f";
        x.fillRect(0, 54, 128, 20);
        x.strokeStyle = "#6e4a24";
        x.lineWidth = 3;
        x.strokeRect(2, 2, 124, 124);
      }));
      const b = new T.Mesh(une("geo:caisse", () => new T.BoxGeometry(1, 1, 1)), une("mat:o3", () => new T.MeshLambertMaterial({ map: tex })));
      b.scale.set(W, H, D);
      b.position.y = H / 2;
      g.add(b);
      g.userData.haut = H;
      return g;
    },
    o5: () => {
      const h = hMii(), o = new T.Mesh(une("geo:o5", () => new T.CylinderGeometry(0.55, 0.55, 1.3, 6, 1)), une("mat:o5", () => new T.MeshLambertMaterial({ color: 3265370, emissive: 740636 })));
      const p1 = new T.Mesh(une("geo:o5p", () => new T.ConeGeometry(0.55, 0.5, 6)), o.material);
      p1.position.y = 0.9;
      const p2 = p1.clone();
      p2.rotation.x = Math.PI;
      p2.position.y = -0.9;
      const g = new T.Group(), i = new T.Group();
      i.add(o, p1, p2);
      i.scale.setScalar(0.3 * h);
      g.add(i);
      let t = 0;
      g.userData.maj = (dt) => {
        t += dt;
        i.rotation.y = t * 3;
        return true;
      };
      return g;
    },
    o6: () => {
      const h = hMii(), g = new T.Group(), m = mat(5025338), m2 = mat(3837740);
      for (let k = 0; k < 7; k++) {
        const b = new T.Mesh(une("geo:o6", () => new T.ConeGeometry(0.5, 1, 4)), k % 2 ? m : m2);
        b.scale.set(0.12 * h, (0.38 + 0.12 * Math.sin(k * 2.3)) * h, 0.08 * h);
        b.position.set((k - 3) * 0.075 * h, 0.2 * h, Math.sin(k * 1.7) * 0.06 * h);
        b.rotation.z = (k - 3) * 0.12;
        g.add(b);
      }
      return g;
    },
    o7: () => {
      const h = hMii(), o = new T.Mesh(une("geo:o7", () => new T.CylinderGeometry(1, 1, 0.18, 24)), une("mat:o7", () => new T.MeshLambertMaterial({ color: 16764718, emissive: 5913600 })));
      o.rotation.x = Math.PI / 2;
      const c = new T.Mesh(une("geo:o7c", () => new T.BoxGeometry(0.22, 1.05, 0.2)), une("mat:o7c", () => new T.MeshLambertMaterial({ color: 14260752 })));
      c.position.z = 0.02;
      o.add(c);
      c.rotation.x = -Math.PI / 2;
      const g = new T.Group(), i = new T.Group();
      i.add(o);
      i.scale.setScalar(0.26 * h);
      g.add(i);
      g.userData.maj = (dt) => {
        i.rotation.y += dt * 9;
        return true;
      };
      return g;
    },
    o8: () => {
      const h = hMii(), g = new T.Group(), i = new T.Group(), r = 0.4 * h;
      const tex = une("tex:o8", () => toile2D(128, (x) => {
        x.fillStyle = "#1f5fd8";
        x.fillRect(0, 0, 128, 128);
        x.fillStyle = "#8fc6ff";
        for (let k = 0; k < 4; k++) {
          x.save();
          x.translate(64, 64);
          x.rotate(k * Math.PI / 2);
          x.beginPath();
          x.moveTo(0, 0);
          x.quadraticCurveTo(40, -10, 64, 20);
          x.lineTo(64, 34);
          x.quadraticCurveTo(30, 6, 0, 0);
          x.fill();
          x.restore();
        }
      }));
      const disque = new T.Mesh(une("geo:o8", () => new T.SphereGeometry(1, 24, 16)), une("mat:o8", () => new T.MeshLambertMaterial({ map: tex })));
      disque.scale.setScalar(r);
      i.add(disque);
      for (let k = 0; k < 6; k++) {
        const c = new T.Mesh(une("geo:o8p", () => new T.ConeGeometry(0.5, 1, 8)), mat(2056152));
        const a = k / 6 * Math.PI * 2;
        c.scale.set(0.2 * h, 0.36 * h, 0.16 * h);
        c.position.set(Math.cos(a) * 0.37 * h, Math.sin(a) * 0.37 * h, -0.04 * h);
        c.rotation.z = a - Math.PI / 2 - 0.9;
        i.add(c);
      }
      g.add(i);
      g.userData.rouler = (v) => {
        i.rotation.z -= v;
      };
      g.userData.rayon = r;
      return g;
    },
    o9: () => {
      const h = hMii(), m = new T.MeshBasicMaterial({ color: 8378623, transparent: true, opacity: 0.9, depthWrite: false });
      m.userData = {};
      const o = new T.Mesh(une("geo:caisse", () => new T.BoxGeometry(1, 1, 1)), m);
      o.userData.propre = true;
      o.scale.set(0.2 * h, 1, 0.05 * h);
      const g = new T.Group();
      g.add(o);
      g.userData.regler = (L, k = 1) => {
        o.scale.y = Math.max(0.01, L);
        o.position.y = L / 2;
        m.opacity = 0.9 * k;
        o.scale.x = 0.2 * h * (0.4 + 0.6 * k);
      };
      return g;
    },
    o10: (taille = 0.6, tex = "o10") => {
      const h = hMii(), s = sprite(une("tex:" + tex, () => toile2D(64, (x) => {
        const g2 = x.createRadialGradient(32, 32, 0, 32, 32, 30);
        g2.addColorStop(0, "#ffffff");
        g2.addColorStop(0.35, "#fff79a");
        g2.addColorStop(0.7, "#ffcf2e");
        g2.addColorStop(1, "rgba(255,180,0,0)");
        x.fillStyle = g2;
        x.fillRect(0, 0, 64, 64);
      })), taille * h);
      s.renderOrder = 22;
      const g = new T.Group();
      g.add(s);
      g.userData.s = s;
      return g;
    },
    o11: () => {
      const h = hMii(), g = new T.Group(), k = h / 6.5;
      const f = une("geo:o11", () => {
        const l = new T.Shape();
        l.moveTo(-0.8, 0);
        l.lineTo(0.8, 0);
        l.lineTo(0.8, 6.6);
        l.lineTo(-0.1, 7.6);
        l.lineTo(-0.8, 7.1);
        l.closePath();
        for (const y of [0.65, 1.25]) {
          const t = new T.Path();
          t.absarc(0.05, y, 0.22, 0, Math.PI * 2, true);
          l.holes.push(t);
        }
        const e = new T.ExtrudeGeometry(l, { depth: 0.3, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.06, bevelSegments: 1 });
        e.translate(0, 0.1, -0.15);
        return e;
      });
      const lame = new T.Mesh(f, mat(13225686));
      lame.scale.setScalar(k);
      g.add(lame);
      const tranchant = new T.Mesh(une("geo:caisse", () => new T.BoxGeometry(1, 1, 1)), mat(15922680));
      tranchant.scale.set(0.18 * k, 6.4 * k, 0.36 * k);
      tranchant.position.set(0.78 * k, 3.4 * k, 0);
      g.add(tranchant);
      g.add(morceau(boite(), mat(5593699), 1.9 * k, 0.32 * k, 0.5 * k, 0, 0), morceau(cylindre(), mat(3813162), 0.16 * k, 1.4 * k, 0.16 * k, 0, -0.75 * k));
      return g;
    },
    o12: () => {
      const h = hMii(), g = new T.Group(), c = 0.075 * h, bois = mat(8017200), bois2 = mat(5913890), d1 = mat(5235679), d2 = mat(3126446), noir = mat(1457210);
      const px = (i, j, m) => g.add(morceau(boite(), m, c, c, c * 1.1, i * c, j * c));
      for (let k = 0; k < 10; k++) px(0, k, k % 2 ? bois : bois2);
      for (const [i, j, m] of [[-3, 8, d2], [-2, 9, d1], [-1, 10, d1], [0, 10, d1], [1, 10, d1], [2, 9, d1], [3, 8, d2], [-4, 7, d2], [4, 7, d2], [-1, 11, noir], [0, 11, noir], [1, 11, noir], [-2, 10, noir], [2, 10, noir], [-3, 9, noir], [3, 9, noir], [-4, 8, noir], [4, 8, noir]]) px(i, j, m);
      return g;
    },
    o13: () => {
      const h = hMii(), c = 0.55 * h;
      const pixels = (haut2, f) => {
        const t = toile2D(16, (x) => {
          for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
            const r = (i * 7 + j * 13 + i * j % 5) % 4;
            x.fillStyle = haut2 ? ["#5ea33a", "#6cb544", "#4f8f30", "#78c04c"][r] : j < 4 ? ["#5ea33a", "#6cb544", "#4f8f30", "#78c04c"][r] : ["#8a5a32", "#7a4e2b", "#97663c", "#6d4425"][r];
            x.fillRect(i, j, 1, 1);
          }
          x.fillStyle = "#1e140c";
          const F = [[], [[7, 7], [8, 8], [8, 6]], [[5, 4], [6, 5], [7, 7], [8, 8], [9, 9], [10, 8], [8, 6], [4, 10], [5, 9]], [[3, 3], [4, 4], [5, 5], [6, 5], [7, 7], [8, 8], [9, 9], [10, 10], [11, 9], [8, 6], [9, 4], [4, 11], [5, 10], [6, 9], [12, 12], [2, 13]]][f];
          for (const [i, j] of F) x.fillRect(i, j, 1, 1);
        });
        t.magFilter = t.minFilter = T.NearestFilter;
        t.generateMipmaps = false;
        return t;
      };
      const mats = [0, 1, 2, 3].map((f) => {
        const cote = une("mat:o13c" + f, () => new T.MeshLambertMaterial({ map: pixels(false, f) })), dessus2 = une("mat:o13h" + f, () => new T.MeshLambertMaterial({ map: pixels(true, f) }));
        return [cote, cote, dessus2, mat(7160869), cote, cote];
      });
      const o = new T.Mesh(une("geo:caisse", () => new T.BoxGeometry(1, 1, 1)), mats[0]);
      o.scale.setScalar(c);
      o.position.y = c / 2;
      const g = new T.Group();
      g.add(o);
      g.userData.c = c;
      g.userData.fissures = (f) => {
        o.material = mats[Math.max(0, Math.min(3, f))];
      };
      return g;
    },
    o14: () => {
      const h = hMii(), g = new T.Group(), i = new T.Group(), r = 0.3 * h;
      i.add(morceau(une("geo:sphere", () => new T.SphereGeometry(1, 20, 14)), mat(14916127), r, r, r));
      for (const a of [0, Math.PI / 2]) {
        const t = new T.Mesh(une("geo:o14a", () => new T.TorusGeometry(1, 0.12, 8, 24)), mat(12071964));
        t.scale.setScalar(r * 1.01);
        t.rotation.y = a;
        i.add(t);
      }
      const l = new T.Mesh(une("geo:sphere", () => new T.SphereGeometry(1, 20, 14)), mat(16773530, { emissive: 13214208 }));
      l.scale.setScalar(r * 0.32);
      l.position.z = r * 0.9;
      i.add(l);
      g.add(i);
      g.userData.rouler = (v) => {
        i.rotation.z -= v;
      };
      g.userData.rayon = r;
      return g;
    },
    o15: () => {
      const h = hMii(), g = new T.Group(), r = 0.3 * h;
      const b = morceau(une("geo:sphere", () => new T.SphereGeometry(1, 20, 14)), new T.MeshLambertMaterial({ color: 2039594 }), r, r, r, 0, r);
      b.material.userData = {};
      b.userData.propre = true;
      g.add(b);
      g.add(morceau(boite(), mat(7303032), 0.15 * h, 0.07 * h, 0.15 * h, 0, 2 * r), morceau(cylindre(), mat(14271370), 0.02 * h, 0.12 * h, 0.02 * h, 0.02 * h, 2 * r + 0.08 * h));
      g.add(morceau(une("geo:sphere", () => new T.SphereGeometry(1, 20, 14)), mat(16777215), r * 0.22, r * 0.3, r * 0.1, -r * 0.45, r * 1.45, r * 0.8));
      g.userData.rougir = (k) => b.material.color.setRGB(0.12 + 0.85 * k, 0.12, 0.16);
      g.userData.meche = new T.Vector3(0.02 * h, 2 * r + 0.15 * h, 0);
      return g;
    },
    o16: () => {
      const h = hMii(), g = new T.Group();
      g.add(morceau(boite(), mat(15265525), 0.1 * h, 0.9 * h, 0.03 * h, 0, 0.55 * h), morceau(boite(), mat(5980064), 0.38 * h, 0.07 * h, 0.09 * h, 0, 0.1 * h), morceau(cylindre(), mat(4009326), 0.04 * h, 0.2 * h, 0.04 * h, 0, 0));
      return g;
    },
    o17: () => {
      const h = hMii(), g = new T.Group(), vert = mat(3124794), clair = mat(6281322), H = 1 * h, i = new T.Group();
      const corps = new T.Mesh(une("geo:o17", () => new T.CylinderGeometry(1, 1, 1, 24, 1, true)), new T.MeshLambertMaterial({ color: 3124794, side: T.DoubleSide }));
      corps.userData.propre = true;
      corps.scale.set(0.5 * h, H, 0.5 * h);
      corps.position.y = H / 2;
      const bord = new T.Mesh(une("geo:o17b", () => new T.CylinderGeometry(1, 1, 1, 24, 1, true)), new T.MeshLambertMaterial({ color: 6281322, side: T.DoubleSide }));
      bord.userData.propre = true;
      bord.scale.set(0.6 * h, 0.26 * h, 0.6 * h);
      bord.position.y = H + 0.02 * h;
      const anneau = new T.Mesh(une("geo:o17r", () => new T.RingGeometry(0.83, 1, 24)), clair);
      anneau.rotation.x = -Math.PI / 2;
      anneau.scale.setScalar(0.6 * h);
      anneau.position.y = H + 0.15 * h;
      const fond = new T.Mesh(une("geo:o17f", () => new T.CircleGeometry(1, 24)), mat(997908));
      fond.rotation.x = -Math.PI / 2;
      fond.scale.setScalar(0.5 * h);
      fond.position.y = H + 0.14 * h;
      i.add(corps, bord, anneau, fond);
      g.add(i);
      g.userData.haut = H + 0.15 * h;
      g.userData.sortir = (k) => {
        i.scale.y = Math.max(0.01, k);
      };
      return g;
    },
    o18: () => {
      const h = hMii(), s = sprite(une("tex:o18", () => toile2D(64, (x) => {
        const g2 = x.createRadialGradient(32, 32, 0, 32, 32, 32);
        g2.addColorStop(0, "rgba(255,255,255,.55)");
        g2.addColorStop(0.55, "rgba(255,255,255,.35)");
        g2.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = g2;
        x.fillRect(0, 0, 64, 64);
      })), 1.5 * h);
      s.renderOrder = -2;
      s.material.depthTest = true;
      const g = new T.Group();
      g.add(s);
      return g;
    },
    // avion en papier (pointe vers +x)
    avion: () => {
      const h = hMii(), s = 0.34 * h;
      const geo = une("geo:avion", () => {
        const b = new T.BufferGeometry();
        b.setAttribute("position", new T.Float32BufferAttribute([1, 0, 0, -1, 0.08, 0.55, -1, 0.02, 0, 1, 0, 0, -1, 0.02, 0, -1, 0.08, -0.55, 1, 0, 0, -1, -0.22, 0, -1, 0.02, 0], 3));
        b.computeVertexNormals();
        return b;
      });
      const o = new T.Mesh(geo, mat(16777215, { side: T.DoubleSide }));
      o.scale.setScalar(s / 2);
      const g = new T.Group();
      g.add(o);
      return g;
    }
  };
  const prendreObjet = (a, nom, ...args) => {
    const o = FABRIQUES[nom](...args);
    o.userData.nom = nom;
    scene.add(o);
    a.objets.push(o);
    return o;
  };
  const lacher = (a, o) => {
    const i = a.objets.indexOf(o);
    if (i >= 0) a.objets.splice(i, 1);
    jeter(o);
    if (a.tenu?.o === o) a.tenu = null;
  };
  const jeter = (o) => {
    o.removeFromParent();
    o.traverse((x) => {
      if (x.material && (x.userData.propre || x.isSprite)) x.material.dispose();
    });
  };
  const tenir = (a, o, main = "d", o2 = {}) => {
    a.tenu = o ? { o, main, dx: o2.dx ?? 0, dy: o2.dy ?? 0, dz: o2.dz ?? 10, rz: o2.rz ?? 0 } : null;
  };
  const OS_MAIN = { d: 9, g: 6 }, TAU2 = Math.PI * 2, v1 = new T.Vector3(), v2 = new T.Vector3(), b3 = new T.Box3();
  const suivreMain = (a) => {
    const t = a.tenu;
    if (!t || !t.o.parent) return;
    const os = a.mii.os, h = hMii();
    if (t.main === "deux") {
      v1.setFromMatrixPosition(os[OS_MAIN.d].matrixWorld);
      v2.setFromMatrixPosition(os[OS_MAIN.g].matrixWorld);
      v1.add(v2).multiplyScalar(0.5);
    } else v1.setFromMatrixPosition(os[OS_MAIN[t.main]].matrixWorld);
    t.o.position.set(v1.x + t.dx * h, v1.y + t.dy * h, v1.z + t.dz);
    t.o.rotation.z = t.rz;
    t.o.updateMatrixWorld(true);
  };
  const qMii = new T.Quaternion(), qPropre = new T.Quaternion(), vDecal = new T.Vector3();
  const fixer = (a, o, os, decal = [0, 0, 0], rot = [0, 0, 0]) => {
    const e = new T.Euler(...rot), prec = o.userData.maj;
    o.userData.maj = (dt) => {
      prec?.(dt);
      a.mii.objet.updateMatrixWorld(true);
      v1.setFromMatrixPosition(a.mii.os[os].matrixWorld);
      a.mii.objet.getWorldQuaternion(qMii);
      vDecal.set(...decal).multiplyScalar(hMii()).applyQuaternion(qMii);
      o.position.copy(v1).add(vDecal);
      o.quaternion.copy(qMii).multiply(qPropre.setFromEuler(e));
      o.visible = a.mii.objet.visible;
      return true;
    };
    return o;
  };
  const marque = (a, nom, o = {}) => {
    const h = hMii(), s = sprite(o.bulle ? texBulle(nom) : texMarque(nom), (o.taille ?? 0.3) * h);
    if (o.couleur) s.material.color.set(o.couleur);
    const vie = o.vie ?? 1.2;
    s.position.set(o.x, -o.y, 700);
    s.userData.t = 0;
    scene.add(s);
    a.objets.push(s);
    s.userData.maj = (dt) => {
      const u2 = s.userData;
      u2.t += dt;
      const q = u2.t / vie;
      if (o.suivre) {
        s.position.x = a.x + (o.dx ?? 0) * h;
        s.position.y = -(a.y - (o.dy ?? 1.25) * h);
      }
      s.position.x += (o.vx ?? 0) * h * dt;
      s.position.y += (o.vy ?? 0) * h * dt;
      if (o.orbite) {
        const an = u2.t * 6 + o.orbite;
        s.position.x = a.x + Math.cos(an) * 0.28 * h;
        s.position.y = -(a.y - (o.oy ?? 1.05) * h) + Math.sin(an) * 0.07 * h;
      }
      const pop = Math.min(1, u2.t / 0.1);
      s.material.opacity = Math.min(pop, (1 - q) / 0.25);
      const k = (o.taille ?? 0.3) * h * (o.bulle ? u2.t < 0.12 ? 0.6 + 0.5 * u2.t / 0.12 : 1.1 - 0.1 * Math.min(1, (u2.t - 0.12) / 0.1) : 1);
      s.scale.set(k, k, 1);
      return q < 1;
    };
    return s;
  };
  const pancarte = (a, titre, texte, vie = 3.4) => {
    const h = hMii(), S = 3, W = 300 * S, police = (p, t2) => `${p} ${t2 * S}px Nunito, "Motiva Sans", sans-serif`;
    const jeton = (n, def) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || def;
    const c = document.createElement("canvas"), x = c.getContext("2d");
    c.width = W;
    c.height = 112 * S;
    const coupe = (t2, max) => {
      if (x.measureText(t2).width <= max) return t2;
      while (t2.length > 1 && x.measureText(t2 + "\u2026").width > max) t2 = t2.slice(0, -1);
      return t2 + "\u2026";
    };
    x.save();
    x.shadowColor = `rgb(${jeton("--pcv-ombre-rgb", "60 85 120")} / .28)`;
    x.shadowBlur = 7 * S;
    x.shadowOffsetY = 3 * S;
    x.fillStyle = jeton("--pcv-carte", "#fff");
    x.beginPath();
    x.roundRect(6 * S, 6 * S, W - 12 * S, 84 * S, 22 * S);
    x.fill();
    x.beginPath();
    x.moveTo(W / 2 - 13 * S, 89 * S);
    x.lineTo(W / 2, 104 * S);
    x.lineTo(W / 2 + 13 * S, 89 * S);
    x.fill();
    x.restore();
    x.strokeStyle = jeton("--pcv-bord", "#d5dde8");
    x.lineWidth = 2 * S;
    x.beginPath();
    x.roundRect(6 * S, 6 * S, W - 12 * S, 84 * S, 22 * S);
    x.stroke();
    x.fillStyle = jeton("--pcv-cyan-plein", "#2fb8ff");
    x.beginPath();
    x.roundRect(20 * S, 20 * S, 6 * S, 56 * S, 3 * S);
    x.fill();
    x.textBaseline = "middle";
    x.fillStyle = jeton("--pcv-bulle", "#3a4252");
    x.font = police(900, 22);
    x.fillText(coupe(titre, W - 56 * S), 36 * S, 34 * S);
    x.fillStyle = jeton("--pcv-cyan-plein", "#1a8ad8");
    x.font = police(800, 19);
    x.fillText(coupe(texte, W - 56 * S), 36 * S, 63 * S);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sp.renderOrder = 21;
    sp.userData.propre = true;
    const L = 3.3 * h, H = L * c.height / c.width;
    sp.center.set(0.5, 0);
    scene.add(sp);
    a.objets.push(sp);
    let t = 0;
    sp.userData.maj = (dt) => {
      t += dt;
      const pop = t < 0.14 ? 0.7 + 0.38 * (t / 0.14) : t < 0.24 ? 1.08 - 0.08 * ((t - 0.14) / 0.1) : 1, fin = Math.min(1, (vie - t) / 0.25);
      sp.scale.set(L * pop, H * pop, 1);
      sp.material.opacity = Math.max(0, Math.min(1, t / 0.08, fin));
      sp.position.set(borne(a.x, L / 2 + 4, innerWidth - L / 2 - 4), -(a.y - 1.32 * h), 720);
      if (t >= vie) {
        tex.dispose();
        return false;
      }
      return true;
    };
    return sp;
  };
  const infoJeu = (T2) => {
    const i = T2.el.closest?.("#pcv-console [data-i]")?.dataset.i, c = i != null ? window.__pcvGrille?.cases?.()[+i] : null;
    if (!c?.app) return null;
    let app = null;
    try {
      app = window.opener.appStore.GetAppOverviewByAppID(+c.app);
    } catch (e) {
    }
    if (!app) return null;
    const min = app.minutes_playtime_forever || 0, der = app.rt_last_time_played || 0, j = der ? Math.floor((Date.now() / 1e3 - der) / 86400) : -1, f = [];
    if (!min && !der) f.push([Tr("mii.accueil.tout_neuf"), "surprise"]);
    if (min >= 60) f.push([Tr("mii.accueil.heures_jeu", { h: Math.round(min / 60) }), "joie"]);
    else if (min > 0) f.push([Tr("mii.accueil.minutes_jeu", { min }), "sourire"]);
    if (j >= 14) f.push([j >= 60 ? Tr("mii.accueil.pas_lance_mois", { n: Math.round(j / 30) }) : Tr("mii.accueil.pas_lance_semaines", { n: Math.round(j / 7) }), "inquiet"]);
    else if (j >= 0 && j <= 1) f.push([Tr("mii.accueil.joue_recemment"), "joie"]);
    if (app.review_percentage_with_bombs > 0) f.push([Tr("mii.accueil.avis_positifs", { pct: app.review_percentage_with_bombs }), "sourire"]);
    if (!f.length) return null;
    const [texte, mine] = f[Math.floor(Math.random() * f.length)];
    return { nom: app.display_name, texte, mine };
  };
  const bulle = (a, icone, duree = 1.6) => marque(a, icone, { bulle: true, taille: 0.62, vie: duree, suivre: true, dx: 0.38, dy: 1.45 });
  const boiteObjet = (o) => {
    b3.setFromObject(o);
    return { x0: b3.min.x, x1: b3.max.x, y0: -b3.max.y, y1: -b3.min.y };
  };
  const MONDE = 12;
  const peupler = async () => {
    const l = [...(await M.siens()).map((s) => ({ ...s, poids: 3 })), ...M.amis(4).map((a) => ({ ...a, poids: 1.5 }))];
    for (const d of M.habitantsDefaut()) if (l.length < MONDE) l.push({ ...d, poids: 1 });
    l.push(...M.habitantsInvites().map((v) => ({ ...v, poids: 1 })));
    for (let k = 0; l.length < MONDE; k++) l.push({ ...M.hasard(k), poids: 1 });
    habitants = l;
  };
  const choisirHabitant = () => {
    const l = habitants.filter((h) => !acteurs.some((a) => !a.sorti && a.qui === h.cle)), tot = l.reduce((s, h) => s + h.poids, 0);
    let r = Math.random() * tot;
    for (const h of l) {
      r -= h.poids;
      if (r <= 0) return h;
    }
    return l[0];
  };
  const moteur = () => M && habitants ? Promise.resolve(M) : chargement ||= V.charger().then(async (api) => {
    M = api;
    await peupler();
    return M;
  }).catch((e) => {
    if (!signale) console.warn("mii-accueil : pas de vrais Mii (fichiers priv\xE9s absents ?)", e.message);
    signale = true;
    return null;
  }).finally(() => {
    chargement = null;
  });
  const pret = () => !!(M && habitants?.length);
  let miiAvance = null, miiAvanceDemande = false;
  const fabriquerMii = (qui) => M.creer({
    donnees: qui.donnees,
    graine: qui.graine,
    pantalon: qui.pantalon,
    nom: qui.nom,
    rendu,
    resolution: REG.resolution,
    ...qui.tenue ? { tenue: qui.tenue, couleursSwitch: qui.couleursSwitch } : {}
  });
  const preparerMiiAvance = () => {
    miiAvanceDemande = false;
    if (miiAvance || !demarre || !pret() || !rendu) return;
    const h = choisirHabitant();
    if (!h) return;
    try {
      miiAvance = { qui: h, mii: fabriquerMii(h), rendu };
      precompiler(miiAvance.mii);
    } catch (e) {
      miiAvance = null;
    }
  };
  const precompiler = (mii) => {
    if (mii.compile) return mii.compile;
    const fait = () => {
      mii.compile = true;
    };
    if (!rendu.compileAsync) {
      fait();
      return mii.compile = Promise.resolve();
    }
    return mii.compile = Promise.all([rendu.compileAsync(mii.objet, cam, scene), rendu.compileAsync(mii.ombre, cam, scene)]).then(fait, fait);
  };
  const programmerMiiAvance = () => {
    if (miiAvance || miiAvanceDemande || !rendu) return;
    miiAvanceDemande = true;
    (window.requestIdleCallback || ((f) => setTimeout(f, 300)))(preparerMiiAvance, { timeout: 4e3 });
  };
  const oublierMiiAvance = () => {
    miiAvance?.mii.liberer();
    miiAvance = null;
  };
  const creerActeur = (cle, visiteur = null) => {
    const r = !cle && !visiteur && miiAvance && miiAvance.rendu === rendu && !acteurs.some((a2) => !a2.sorti && a2.qui === miiAvance.qui.cle) ? miiAvance : null;
    if (r) miiAvance = null;
    const qui = visiteur || (r ? r.qui : habitants.find((h) => h.cle === cle) || choisirHabitant());
    const mii = r ? r.mii : fabriquerMii(qui);
    mii.regler(hMii());
    mii.inclinaison = REG.inclinaison;
    mii.triche = 0.45;
    mii.regardMax = 0.5;
    if (qui.deuxMains) mii.deuxMains = qui.deuxMains;
    if (mii.compile !== true) {
      const vu = () => {
        if (!mii.masque) mii.objet.visible = true;
      };
      mii.objet.visible = false;
      precompiler(mii).then(vu, vu);
    }
    mii.ombre.rotation.x = -Math.PI / 2 + 0.35;
    mii.ombre.userData.dz = -0.3;
    mii.ombre.userData.force = 1.4;
    scene.add(mii.objet, mii.ombre);
    const a = { mii, qui: qui.cle, x: -999, y: -999, z: acteurs.length % 3 * 60 - 60, mode: "libre", objets: [], tenu: null, appui: null, bord: "dessus", u: 0, dy: 0, tache: null, alerte: null, cible: null, nom: "", sorti: false, fini: false, regardT: 0, gene: 0, tailleVue: hMii() };
    acteurs.push(a);
    if (visiteur) {
      a.estVisiteur = true;
      const hal = prendreObjet(a, "o18");
      hal.userData.maj = () => {
        const k = mii.objet.scale.y * mii.D.haut / hMii();
        hal.position.set(a.x, -(a.y - 0.5 * hMii() * k), a.z - 60);
        hal.children[0].scale.setScalar(1.5 * hMii() * Math.max(0.01, k));
        hal.visible = mii.objet.visible && a.x > -900;
        return true;
      };
    }
    return a;
  };
  const JOURNAL = [], noterDepart = (quoi, a) => {
    const h = hMii(), dehors = a.x < -h || a.x > innerWidth + h || a.y > innerHeight + h || a.y < -h;
    JOURNAL.push({ t: Math.round(performance.now()), quoi, scene: a.nom, mode: a.mode, bord: a.bord, ecran: !a.sorti && !dehors && !(a.cache && a.bord === "derriere") });
    if (JOURNAL.length > 30) JOURNAL.shift();
  };
  const retirer = (a, quoi = "fin") => {
    noterDepart(quoi, a);
    a.fini = true;
    const i = acteurs.indexOf(a);
    if (i >= 0) acteurs.splice(i, 1);
    if (a.appui?.el && a.bord === "dessous") reagir(a.appui, "relache");
    if (a.occ) {
      a.occ.geometry.dispose();
      a.occ.material.dispose();
      a.occ.removeFromParent();
    }
    for (const o of a.objets) jeter(o);
    a.objets.length = 0;
    a.tenu = null;
    a.relacher?.();
    a.mii.liberer();
  };
  const toutRetirer = (quoi = "tous") => {
    for (const a of [...acteurs]) {
      const t = a.tache;
      a.tache = null;
      a.fini = true;
      t?.ko(new Error("fin"));
      retirer(a, quoi);
    }
    arreterBoucle();
  };
  const erreur = (a, r) => Object.assign(new Error(r), { acteur: a });
  const tache = (a, maj) => {
    if (a.alerte) {
      const r = a.alerte;
      a.alerte = null;
      return Promise.reject(erreur(a, r));
    }
    if (a.fini) return Promise.reject(erreur(a, "fin"));
    const p = new Promise((ok, ko) => {
      a.tache = { maj, ok, ko };
    });
    p.catch(() => {
    });
    return p;
  };
  const interrompre = (a, raison) => {
    const t = a.tache;
    a.tache = null;
    if (t) t.ko(erreur(a, raison));
    else a.alerte = raison;
  };
  const prise = (a) => a.mii.D.prise / a.mii.D.haut * hMii();
  const ancre = (s, bord, uu, dy = 0) => {
    const r = s.r;
    return [r.left + uu, bord === "dessous" ? r.bottom - 2 * u() : bord === "mains" ? r.top + u() : bord === "derriere" ? r.top + dy : haut(s)];
  };
  const vers = (x, y, z = 320) => new T.Vector3(x, -y, z);
  const attendre = (a, s, chaque) => {
    let t = 0;
    return tache(a, (dt) => {
      t += dt;
      chaque?.(t, dt);
      return t >= s;
    });
  };
  const geste = async (a, nom, s, chaque) => {
    a.mii.jouer(nom, { redemarrer: true });
    await attendre(a, s, chaque);
    a.mii.jouer("repos");
  };
  const marcher = (a, uBut, o = {}) => {
    const h = hMii();
    let anim = null;
    return tache(a, (dt) => {
      const d = uBut - a.u;
      if (Math.abs(d) < 1.5) {
        a.u = uBut;
        a.mii.jouer(o.ensuite || "repos");
        a.mii.capVise = 0;
        return true;
      }
      const court = !o.anim && (o.courir ?? Math.abs(d) > 5 * h), v = (court ? 2.5 : o.anim ? 1 : 1.15) * h;
      if (anim !== court) {
        anim = court;
        a.mii.jouer(o.anim || (court ? "courir" : "marcher"));
      }
      a.u += Math.sign(d) * Math.min(Math.abs(d), v * dt);
      a.mii.viser(Math.sign(d), 0);
      return false;
    });
  };
  const glisser = (a, dyBut, s) => {
    const d0 = a.dy;
    let t = 0;
    return tache(a, (dt) => {
      t += dt;
      const q = Math.min(1, t / s);
      a.dy = d0 + (dyBut - d0) * (q * q * (3 - 2 * q));
      return q >= 1;
    });
  };
  const sauter = (a, but, o = {}) => {
    const h = hMii(), g = 16 * h, m = a.mii, saisir = but.bord === "dessous" || but.bord === "mains", prep = o.prep ?? 0.13;
    const pieds = () => {
      const p = but.s ? ancre(but.s, but.bord, but.u, but.dy) : [but.x, but.y];
      if (saisir) p[1] += prise(a);
      return p;
    };
    let t = -prep, x0, y0, d0, A, B, duree, arrive = false;
    m.saut = { ph: "prep", q: 0, saisir };
    m.jouer("sauter", { fondu: 0.1, redemarrer: true });
    return tache(a, (dt) => {
      t += dt;
      if (t < 0) {
        m.saut.ph = "prep";
        m.saut.q = 1 + t / prep;
        return false;
      }
      if (x0 === void 0) {
        if (a.mode === "appui" && (a.bord === "dessous" || a.bord === "mains")) a.y += prise(a);
        x0 = a.x;
        y0 = a.y;
        a.mode = "vol";
        if (but.s && !reprendre(but.s)) throw new Error("cible");
        d0 = pieds();
        const sommet = Math.min(y0, d0[1]) - (o.hauteur ?? 0.5 * h), sm = Math.sqrt(Math.max(1, y0 - sommet)), sd = Math.sqrt(Math.max(1, d0[1] - sommet));
        A = (sm + sd) ** 2;
        B = -2 * sm * (sm + sd);
        duree = Math.sqrt(2 / g) * (sm + sd);
        if (Math.abs(d0[0] - x0) > 2) m.viser(d0[0] - x0, 0);
        if (o.face) m.capVise = 0;
        a.solVol = a.appui && a.bord === "dessus" ? haut(a.appui) : null;
        a.appui = null;
      }
      if (t < duree) {
        const q2 = t / duree;
        let dx = 0, dy = 0;
        if (but.s && reprendre(but.s)) {
          const p = pieds();
          dx = p[0] - d0[0];
          dy = p[1] - d0[1];
        }
        a.x = x0 + (d0[0] + dx - x0) * q2;
        a.y = y0 + B * q2 + A * q2 * q2 + dy * q2;
        m.saut.ph = "vol";
        m.saut.q = q2;
        if (o.salto) m.salto.rotation.x = Math.PI * 2 * Math.min(1, q2 * 1.15) ** 1.3 * (o.salto > 0 ? 1 : -1);
        if (q2 > 0.5) a.solVol = but.s && but.bord === "dessus" ? haut(but.s) : null;
        return false;
      }
      if (!arrive) {
        arrive = true;
        m.salto.rotation.x = 0;
        a.solVol = null;
        if (but.s) {
          a.appui = but.s;
          a.bord = but.bord;
          a.u = but.u;
          a.dy = but.dy || 0;
          a.mode = "appui";
          const p = ancre(but.s, but.bord, but.u, but.dy);
          a.x = p[0];
          a.y = p[1];
          if (!saisir) reagir(but.s, but.s.g.choc);
        } else {
          a.mode = "libre";
          a.x = but.x;
          a.y = but.y;
        }
        if (saisir) {
          m.saut = null;
          m.amplitude = 1.8;
          m.jouer("suspendu", { fondu: 0, redemarrer: true });
          return true;
        }
        m.saut.ph = "recep";
        m.saut.q = 0;
        if (o.face !== false) m.capVise = 0;
      }
      const q = (t - duree) / (o.recep ?? 0.2);
      m.saut.q = q;
      if (q >= 1) {
        m.saut = null;
        m.jouer(o.ensuite || "repos", { fondu: 0.15 });
        return true;
      }
      return false;
    });
  };
  const sousLeMii = (x, y0, y1) => {
    let best = null;
    majSol();
    for (const s of [...lireSupports(), SOL]) {
      if (!s.g.dessus) continue;
      const d = dessus(s);
      if (x > d.x0 - 2 && x < d.x1 + 2 && d.y >= y0 - 1 && d.y <= y1 && (!best || d.y < haut(best))) best = s;
    }
    return best;
  };
  const chuter = (a, o = {}) => {
    const h = hMii(), g = 16 * h, m = a.mii;
    let vy = o.vy ?? 0, pose = false, t = 0;
    if (a.mode === "appui" && (a.bord === "dessous" || a.bord === "mains")) {
      a.y += prise(a);
      if (a.appui) reagir(a.appui, "relache");
    }
    a.mode = "chute";
    a.appui = null;
    a.cache = null;
    a.solVol = null;
    m.saut = null;
    m.salto.rotation.x = 0;
    m.jouer("tomber", { fondu: 0, redemarrer: true });
    return tache(a, (dt) => {
      if (!pose) {
        const y1 = a.y + vy * dt + 0.5 * g * dt * dt;
        vy += g * dt;
        a.x += (o.vx ?? 0) * dt;
        const s = sousLeMii(a.x, a.y, y1);
        if (s) {
          a.appui = s;
          a.bord = "dessus";
          a.u = a.x - s.r.left;
          a.mode = "appui";
          a.y = haut(s);
          reagir(s, s.g.choc);
          m.jouer("rattraper", { fondu: 0.05, redemarrer: true });
          m.capVise = 0;
          pose = true;
          return false;
        }
        a.y = y1;
        if (a.y > innerHeight + 2 * h || a.x < -2 * h || a.x > innerWidth + 2 * h) {
          a.sorti = true;
          return true;
        }
        return false;
      }
      t += dt;
      if (t > (o.recup ?? 0.8)) {
        m.jouer("repos");
        return true;
      }
      return false;
    });
  };
  const hisser = (a) => {
    const m = a.mii;
    let t = 0, dessus2 = false;
    m.hisse = 0;
    m.jouer("hisser", { fondu: 0.15, redemarrer: true });
    return tache(a, (dt) => {
      t += dt;
      m.hisse = Math.min(1, t / 0.55);
      if (t >= 0.55 && !dessus2) {
        dessus2 = true;
        a.bord = "dessus";
        m.saut = { ph: "recep", q: 0 };
        m.jouer("sauter", { fondu: 0.2, redemarrer: true });
        reagir(a.appui, a.appui.g.choc);
      }
      if (dessus2) {
        m.saut.q = (t - 0.55) / 0.3;
        if (t >= 0.85) {
          m.saut = null;
          m.jouer("repos");
          m.capVise = 0;
          return true;
        }
      }
      return false;
    });
  };
  const sautVers = async (a, B, o = {}) => {
    const A = a.appui, h = hMii();
    if (!reprendre(A) || !reprendre(B)) throw new Error("chute");
    const [a0, a1] = segment(A), [b0, b1] = segment(B);
    let xd, xa;
    if (b0 > a1) {
      xd = a1;
      xa = o.centre ? (b0 + b1) / 2 : Math.min(b1, b0 + 0.2 * h);
    } else if (a0 > b1) {
      xd = a0;
      xa = o.centre ? (b0 + b1) / 2 : Math.max(b0, b1 - 0.2 * h);
    } else {
      xd = borne(a.x, Math.max(a0, b0), Math.min(a1, b1));
      xa = o.centre ? (b0 + b1) / 2 : xd;
    }
    await marcher(a, xd - A.r.left);
    const monte = haut(A) - haut(B);
    if (monte > 1.8 * h) {
      await sauter(a, { s: B, bord: "mains", u: xa - B.r.left }, { hauteur: 0.15 * h, face: true });
      a.mii.amplitude = 1;
      await attendre(a, alea(0.35, 0.8), () => a.mii.regarder(null));
      await hisser(a);
    } else await sauter(a, { s: B, bord: "dessus", u: xa - B.r.left }, { hauteur: (monte > 0 ? 0.42 : 0.3) * h + Math.max(0, monte) * 0.25 });
  };
  const parcourir = async (a, chemin2) => {
    const h = hMii(), W = innerWidth, e = chemin2[0];
    if (e.entree === "sol") {
      majSol();
      a.appui = SOL;
      a.bord = "dessus";
      a.mode = "appui";
      a.u = (e.cote < 0 ? -1.1 * h : W + 1.1 * h) - SOL.r.left;
      [a.x, a.y] = ancre(SOL, "dessus", a.u);
    } else {
      reprendre(e.s);
      const [x0, x1] = segment(e.s);
      a.mode = "libre";
      a.x = e.cote < 0 ? -1.2 * h : W + 1.2 * h;
      a.y = haut(e.s) + 0.4 * h;
      await sauter(a, { s: e.s, bord: "dessus", u: (e.cote < 0 ? Math.max(x0, 0) + 0.35 * h : Math.min(x1, W) - 0.35 * h) - e.s.r.left }, { prep: 0, hauteur: 0.8 * h });
    }
    for (let i = 1; i < chemin2.length; i++) await sautVers(a, chemin2[i].s);
  };
  const sortir = async (a) => {
    const h = hMii(), W = innerWidth;
    for (let n = 0; n < 5 && !a.sorti; n++) {
      if (a.mode === "appui" && a.bord === "derriere" && a.cache) {
        await glisser(a, 1.3 * h, 0.4);
        a.sorti = true;
        return;
      }
      if (a.mode === "appui" && a.bord === "derriere") {
        a.mode = "libre";
        a.bord = "dessus";
        a.appui = null;
      }
      if (a.mode !== "appui" || a.bord !== "dessus" || a.cache) {
        await chuter(a);
        continue;
      }
      const s = a.appui;
      if (!reprendre(s)) {
        await chuter(a);
        continue;
      }
      if (s.sol) {
        await marcher(a, (a.x < W / 2 ? -1.3 * h : W + 1.3 * h) - s.r.left, { courir: Math.random() < 0.5 });
        a.sorti = true;
        return;
      }
      const [x0, x1] = segment(s), gauche = (x0 + x1) / 2 < W / 2, bout = gauche ? x0 : x1;
      await marcher(a, bout - s.r.left, { courir: true });
      if (gauche ? bout < 4 * h : bout > W - 4 * h) {
        await sauter(a, { x: gauche ? -1.4 * h : W + 1.4 * h, y: haut(s) + 1.4 * h }, { hauteur: 0.7 * h, face: false });
        a.sorti = true;
        return;
      }
      await sauter(a, { x: bout + (gauche ? -0.9 : 0.9) * h, y: haut(s) + 0.5 * h }, { hauteur: 0.5 * h, face: false });
    }
    a.sorti = true;
  };
  const regarderAutour = (a, dt) => {
    a.regardT -= dt;
    if (a.regardT > 0) return;
    a.regardT = alea(1.4, 3.2);
    const autres = acteurs.filter((b) => b !== a && !b.sorti), sel = document.querySelector("#pcv-console .cel.sel"), x = Math.random();
    if (autres.length && x < 0.35) {
      const b = autres[0];
      a.mii.regarder(vers(b.x, b.y - 0.7 * hMii()));
    } else if (sel && x < 0.7) {
      const [cx, cy] = centre({ r: sel.getBoundingClientRect() });
      a.mii.regarder(vers(cx, cy));
    } else a.mii.regarder(null);
  };
  const poser = (a, nom, tenue, chaque, fondu = 0.16) => {
    a.mii.jouer(nom, { fondu, redemarrer: true });
    return attendre(a, tenue, chaque);
  };
  const face = (a) => {
    a.mii.capVise = 0;
  };
  const versLui = (a, b) => {
    a.mii.viser(b.x - a.x, 0);
    a.mii.regarder(vers(b.x, b.y - 0.75 * hMii()));
  };
  const entrerSol = (a, cote) => {
    majSol();
    a.appui = SOL;
    a.bord = "dessus";
    a.mode = "appui";
    a.u = (cote < 0 ? -1.1 * hMii() : innerWidth + 1.1 * hMii()) - SOL.r.left;
    [a.x, a.y] = ancre(SOL, "dessus", a.u);
  };
  const allerA = async (a, chemin2, f = 0.5) => {
    await parcourir(a, chemin2);
    const s = a.appui, [x0, x1] = segment(s);
    await marcher(a, x0 + (x1 - x0) * f - s.r.left);
  };
  const chemin = (sup, S, parSol = false) => planifier(sup, (s) => s === S, parSol, centre(S)[0]);
  const coteProche = (x) => x < innerWidth / 2 ? -1 : 1;
  const degage = (sup, x0, x1, y0, y1, sauf = []) => !sup.some((s) => !sauf.includes(s) && s.r.left < x1 && s.r.right > x0 && s.r.top < y1 && s.r.bottom > y0);
  const posables = (sup, genres = ["tuile", "dossier"]) => sup.filter((s) => genres.includes(s.genre) && !estSel(s) && !s.el.classList.contains("porte") && !reserve(s) && s.r.left > -2 && s.r.right < innerWidth + 2 && s.r.top > 1.05 * hMii() && !auDessus(sup, s));
  const rangees = (l) => {
    const r = [];
    for (const s of [...l].sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left)) {
      const g = r.find((x) => Math.abs(x[0].r.top - s.r.top) < 4);
      g ? g.push(s) : r.push([s]);
    }
    return r.map((g) => g.sort((a, b) => a.r.left - b.r.left));
  };
  const voisins = (A, B) => B.r.left - A.r.right < 0.55 * hMii() && B.r.left > A.r.left;
  const suites = (rangee, n) => {
    const out = [];
    for (let i = 0; i + n <= rangee.length; i++) {
      let ok = true;
      for (let k = i; k < i + n - 1; k++) if (!voisins(rangee[k], rangee[k + 1])) ok = false;
      if (ok) out.push(rangee.slice(i, i + n));
    }
    return out;
  };
  const auDessus = (sup, S) => sup.find((s) => s !== S && Math.abs(centre(s)[0] - centre(S)[0]) < S.r.width * 0.3 && S.r.top - s.r.bottom > -2 && S.r.top - s.r.bottom < 0.5 * hMii());
  const horloge = () => {
    for (const e of document.querySelectorAll("#header .Panel, #header div")) if (!e.childElementCount && /^\s*\d{1,2}[:h]\d{2}/.test(e.textContent)) {
      const r = e.getBoundingClientRect();
      if (r.width > 8) return { el: e, r };
    }
    return null;
  };
  const curseur = { r: null, i: null, bouge: 0 };
  const curseurPres = (a, k = 1.9) => {
    const r = curseur.r;
    if (!r || !document.body.classList.contains("pcv-zone-jaquettes")) return false;
    return Math.hypot((r.left + r.right) / 2 - a.x, (r.top + r.bottom) / 2 - (a.y - 0.5 * hMii())) < k * Math.max(r.width, hMii());
  };
  const vivote = (a, dt) => {
    regarderAutour(a, dt);
    if (a.signe > 0) {
      a.signe -= dt;
      if (a.signe <= 0) {
        a.mii.bras = a.brasAvant ?? null;
        a.mii.expression(null);
        a.repit = 5;
      }
      return;
    }
    a.repit = (a.repit || 0) - dt;
    if (a.repit <= 0 && performance.now() - curseur.bouge < 1500 && curseurPres(a)) {
      a.signe = 1.4;
      a.brasAvant = a.mii.bras;
      a.mii.bras = "salut";
      a.mii.expression("joie");
      const r = curseur.r;
      a.mii.regarder(vers((r.left + r.right) / 2, r.top));
    }
  };
  const trajet = (o, [x0, y0], [x1, y1], hauteur, duree, chaque) => new Promise((ok) => {
    let t = 0;
    const sommet = Math.min(y0, y1) - hauteur;
    o.userData.maj = (dt) => {
      t += dt;
      const q = Math.min(1, t / duree), b = 1 - q;
      const y = b * b * y0 + 2 * b * q * (2 * sommet - (y0 + y1) / 2) + q * q * y1;
      o.position.x = x0 + (x1 - x0) * q;
      o.position.y = -y;
      chaque?.(q, dt);
      if (q >= 1) {
        o.userData.maj = null;
        ok();
      }
      return true;
    };
  });
  const rythme = () => {
    let an = null, src = null, data = null, moy = 0, dernier2 = -1, t = 0;
    const l = [...window.__pcvThemesLecteurs || [], window.__pcvLecteur].find((x) => x && !x.paused && x._gain);
    try {
      if (l) {
        an = l._gain.context.createAnalyser();
        an.fftSize = 256;
        l._gain.connect(an);
        src = l._gain;
        data = new Uint8Array(an.frequencyBinCount);
      }
    } catch (e) {
      an = null;
    }
    return {
      musique: !!an,
      fermer: () => {
        try {
          src?.disconnect(an);
        } catch (e) {
        }
        an = src = null;
      },
      battement: (dt) => {
        t += dt;
        if (!an) {
          if (t - dernier2 >= 0.52) {
            dernier2 = t;
            return true;
          }
          return false;
        }
        an.getByteFrequencyData(data);
        let e = 0;
        for (let i = 1; i < 7; i++) e += data[i];
        moy = moy ? moy * 0.9 + e * 0.1 : e;
        if (e > moy * 1.18 && e > 240 && t - dernier2 > 0.3 || t - dernier2 > 1.1) {
          dernier2 = t;
          return true;
        }
        return false;
      }
    };
  };
  const POSES_DANSE = ["pose1", "pose2", "pose3", "pose4", "pose5", "pose6", "pose7", "pose8", "pose9", "pose10", "pose11", "pose12", "pose13", "pose14"];
  const ICONES_CAUSETTE = ["manette", "coeur", "etoile", "note", "soleil", "question"];
  const echelons = (a, x, y0, y1, pas) => {
    const m = a.mii, n = Math.max(1, Math.round(Math.abs(y1 - y0) / pas)), d = (y1 - y0) / n;
    let k = 0, t = 0;
    a.mode = "libre";
    a.appui = null;
    a.x = x;
    a.y = y0;
    m.regardMax = null;
    m.capVise = Math.PI;
    m.pasN = 0;
    m.pasQ = 1;
    m.jouer("grimper", { fondu: 0.12, redemarrer: true });
    return tache(a, (dt) => {
      t += dt;
      const q = Math.min(1, t / 0.16);
      m.pasQ = q;
      a.y = y0 + d * (k + q * q * (3 - 2 * q));
      if (t >= 0.26) {
        k++;
        t = 0;
        m.pasN = k;
        m.pasQ = 0;
        if (k >= n) {
          a.y = y1;
          m.pasQ = 1;
          return true;
        }
      }
      return false;
    });
  };
  const finGrimper = (a) => {
    a.mii.regardMax = 0.5;
    a.mii.capVise = 0;
  };
  const flanc = (sup, D) => {
    const h = hMii(), out = [];
    for (const c of [-1, 1]) {
      const x = c < 0 ? D.r.left - 0.3 * h : D.r.right + 0.3 * h;
      if (x < 0.5 * h || x > innerWidth - 0.5 * h) continue;
      const S = sousLeMii(x, D.r.bottom - 0.3 * h, D.r.bottom + 0.35 * h);
      if (!S || S === D || !S.g.dessus || S.genre === "badge" || S.genre === "bulle") continue;
      const y = haut(S);
      if (!degage(sup, x - 0.28 * h, x + 0.28 * h, y - h, y - 2, [S, D])) continue;
      out.push({ S, cote: c, x });
    }
    return out;
  };
  const animer = (o, duree, f) => new Promise((ok) => {
    let t = 0;
    const avant = o.userData.maj;
    o.userData.maj = (dt) => {
      t += dt;
      const q = Math.min(1, t / duree);
      f(q);
      if (q >= 1) {
        o.userData.maj = avant;
        ok();
      }
      return true;
    };
  });
  const rebond = (q) => q < 0.8 ? lisse(q / 0.8) * 1.06 : 1.06 - 0.06 * lisse((q - 0.8) / 0.2);
  const lisse = (q) => q * q * (3 - 2 * q);
  const lisseB = (q) => lisse(Math.max(0, Math.min(1, q)));
  const danser = (a, b) => {
    const r = rythme(), h = hMii(), danseurs = b ? [a, b] : [a];
    let t = 0, n = 0, fini = false;
    for (const d of danseurs) {
      face(d);
      d.mii.expression("joie");
    }
    const tA = tache(a, (dt) => {
      t += dt;
      if (r.battement(dt)) {
        n++;
        const nom = n % 4 === 0 ? "danser" : POSES_DANSE[Math.floor(Math.random() * POSES_DANSE.length)];
        for (const d of danseurs) {
          d.mii.jouer(nom, { fondu: 0.1, redemarrer: true });
          d.mii.capVise = n % 4 === 0 ? 0 : n % 2 ? 0.3 : -0.3;
        }
        if (n % 2) marque(a, "note", { x: a.x + alea(-0.4, 0.4) * h, y: a.y - 1.25 * h, vy: 0.55, vx: alea(-0.25, 0.25), vie: 1.1, taille: 0.2 });
      }
      fini = t > 9.5 || n >= 16;
      return fini;
    });
    const tB = b ? tache(b, () => fini) : null;
    return Promise.all([tA, tB]).finally(() => {
      r.fermer();
      for (const d of danseurs) d.mii.expression(null);
    }).then(() => {
      for (const d of danseurs) face(d);
      return Promise.all(danseurs.map((d) => poser(d, "fin", 1.3, null, 0.12)));
    });
  };
  const deuxVoisines = (sup, test = () => true) => {
    for (const r of melanger(rangees(posables(sup)))) for (const [A, B] of melanger(suites(r, 2))) {
      if (!test(A, B)) continue;
      const ca = chemin(sup, A), cb = chemin(sup, B);
      if (ca && cb) return { cible: A, cible2: B, ca, cb };
    }
    return null;
  };
  const aDeux = (a, b, p, fa = 0.5, fb = 0.5) => Promise.all([allerA(a, p.ca, fa), (async () => {
    await attendre(b, 0.5);
    await allerA(b, p.cb, fb);
  })()]);
  const echelleMii = (a, k) => {
    a.mii.regler(hMii() * Math.max(0.01, k));
  };
  const nuage = (a, x, y, n = 8, gris = false) => {
    const h = hMii();
    for (let k = 0; k < n; k++) marque(a, gris ? "k11" : "poussiere", { x: x + alea(-0.5, 0.5) * h, y: y - alea(0, 0.9) * h, vx: alea(-0.9, 0.9), vy: alea(0.1, 0.8), vie: alea(0.35, 0.65), taille: alea(0.4, 0.65) });
  };
  const surSol = (a, x) => {
    majSol();
    a.appui = SOL;
    a.bord = "dessus";
    a.mode = "appui";
    a.u = x - SOL.r.left;
    [a.x, a.y] = ancre(SOL, "dessus", a.u);
  };
  const apparaitre = async (a, x, o = {}) => {
    surSol(a, x);
    nuage(a, a.x, a.y, 8, o.gris);
    echelleMii(a, 0.01);
    a.mii.capVise = a.mii.cap = 0;
    await attendre(a, 0.22, (t) => echelleMii(a, rebond(Math.min(1, t / 0.22))));
    echelleMii(a, 1);
  };
  const disparaitre = async (a, o = {}) => {
    nuage(a, a.x, a.y, 9, o.gris);
    await attendre(a, 0.2, (t) => echelleMii(a, 1 - Math.min(1, t / 0.2)));
    a.mii.masque = true, a.mii.objet.visible = false;
    a.sorti = true;
  };
  const courirVers = (a, x, v = 7, o = {}) => {
    const h = hMii(), m = a.mii;
    m.cadence = o.cadence ?? 1.7;
    m.jouer(o.anim || "courir", { fondu: 0.08 });
    let tr = 0;
    return tache(a, (dt) => {
      const d = x - SOL.r.left - a.u;
      if (Math.abs(d) > 1) m.viser(Math.sign(d), 0);
      a.u += Math.sign(d) * Math.min(Math.abs(d), v * h * dt);
      [a.x, a.y] = ancre(SOL, "dessus", a.u);
      if (o.trainee && (tr -= dt) <= 0) {
        tr = 0.03;
        marque(a, "k3", { x: a.x - Math.sign(d) * 0.55 * h, y: a.y - alea(0.25, 0.7) * h, vie: 0.22, taille: 0.5 });
      }
      if (Math.abs(d) < 1) {
        m.cadence = 1;
        if (!o.garder) m.jouer("repos", { fondu: 0.1 });
        return true;
      }
      return false;
    });
  };
  const entrerVite = async (a, x, v = 8, o = {}) => {
    const h = hMii(), c = coteProche(x);
    surSol(a, c < 0 ? -1.2 * h : innerWidth + 1.2 * h);
    await courirVers(a, x, v, o);
  };
  const partirVite = async (a, v = 9, o = {}) => {
    const h = hMii(), c = a.x < innerWidth / 2 ? -1 : 1;
    await courirVers(a, c < 0 ? -1.6 * h : innerWidth + 1.6 * h, v, { ...o, garder: true });
    a.sorti = true;
  };
  const xPresDuBord = (l = 2) => {
    const h = hMii(), c = Math.random() < 0.5 ? -1 : 1;
    return c < 0 ? (l / 2 + 1.2) * h : innerWidth - (l / 2 + 1.2) * h;
  };
  const vA = new T.Vector3(), vB = new T.Vector3(), vX = new T.Vector3(), vF = new T.Vector3(), qT = new T.Quaternion(), AXE_Y = new T.Vector3(0, 1, 0);
  const enMain = (a, o, o2 = {}) => {
    const os = o2.gauche ? [5, 6] : [8, 9];
    o.userData.maj = (dt) => {
      const m = a.mii;
      m.objet.updateMatrixWorld(true);
      vA.setFromMatrixPosition(m.os[os[0]].matrixWorld);
      vB.setFromMatrixPosition(m.os[os[1]].matrixWorld);
      vF.copy(vB).sub(vA).normalize();
      m.objet.getWorldQuaternion(qMii);
      vX.set(1, 0, 0).applyQuaternion(qMii);
      const lame = vF.clone().applyAxisAngle(vX, -(o.userData.angle ?? o2.angle ?? Math.PI / 2));
      o.position.copy(vB).addScaledVector(vF, (o2.avance ?? 0.04) * hMii());
      o.position.z += o2.dz ?? 30;
      o.quaternion.setFromUnitVectors(AXE_Y, lame);
      if (o2.tourne) o.quaternion.multiply(qT.setFromAxisAngle(AXE_Y, o2.tourne));
      o.visible = m.objet.visible;
      return true;
    };
    return o;
  };
  const surLesMains = (a, o, dy = 0) => {
    o.userData.maj = () => {
      const m = a.mii;
      m.objet.updateMatrixWorld(true);
      vA.setFromMatrixPosition(m.os[6].matrixWorld);
      vB.setFromMatrixPosition(m.os[9].matrixWorld);
      o.position.copy(vA).add(vB).multiplyScalar(0.5);
      o.position.y += dy * hMii();
      o.position.z += 25;
      o.visible = m.objet.visible;
      return true;
    };
    return o;
  };
  const tirer = (a, o, s, v = 10) => {
    o.userData.maj = (dt) => {
      o.position.x += s * v * hMii() * dt;
      return o.position.x > -2 * hMii() && o.position.x < innerWidth + 2 * hMii();
    };
  };
  const boutMain = (a, k = 1.2) => {
    v1.setFromMatrixPosition(a.mii.os[8].matrixWorld);
    v2.setFromMatrixPosition(a.mii.os[9].matrixWorld);
    return v2.clone().add(v2.clone().sub(v1).multiplyScalar(k));
  };
  const reserve = (s) => acteurs.some((a) => !a.sorti && a.cible === s.cle);
  const estSel = (s) => s.el?.classList?.contains("sel") && document.body.classList.contains("pcv-zone-jaquettes");
  const tuilesLibres = (sup) => sup.filter((s) => s.genre === "tuile" && !estSel(s) && !s.el.classList.contains("porte") && !reserve(s) && s.r.left > -2 && s.r.right < innerWidth + 2);
  const avecChemin = (cibles2, but) => {
    const sup = cibles2.sup;
    for (const c of melanger(cibles2.l.filter((c2) => !sup.forcer || c2.cle === sup.forcer))) {
      const chemin2 = planifier(sup, but(c), false, centre(c)[0]);
      if (chemin2) return { cible: c, chemin: chemin2 };
    }
    return null;
  };
  const SCENES = {
    // s'asseoir au bord d'une tuile, jambes pendantes, regarder autour, saluer
    assis: {
      poids: 3,
      duree: "10\u201315 s",
      preparer: (sup) => avecChemin({ sup, l: tuilesLibres(sup) }, (T2) => (s) => s === T2),
      jouer: async (a, p) => {
        await parcourir(a, p.chemin);
        const s = a.appui, [x0, x1] = segment(s);
        await marcher(a, x0 + (x1 - x0) * alea(0.25, 0.75) - s.r.left);
        a.mii.capVise = (Math.random() < 0.5 ? -1 : 1) * alea(0.35, 0.55);
        a.mii.jouer("assis", { fondu: 0.45 });
        const duree = alea(7, 11), quand = alea(2, duree - 2.5);
        await attendre(a, duree, (t, dt) => {
          regarderAutour(a, dt);
          a.mii.bras = t > quand && t < quand + 1.6 ? "salut" : null;
        });
        a.mii.bras = null;
        a.mii.regarder(null);
        a.mii.jouer("repos", { fondu: 0.35 });
        await attendre(a, 0.45);
      }
    },
    // se suspendre sous un bouton rond de la barre du haut (ou la pilule), se balancer, se laisser tomber
    suspendu: {
      poids: 2.5,
      duree: "9\u201313 s",
      preparer: (sup) => {
        const h = hMii();
        for (const R of melanger(sup.filter((s) => s.g.dessous && !reserve(s)))) {
          const cx = centre(R)[0];
          const chemin2 = planifier(sup, (s) => {
            if (!s.g.dessus || s.genre === "bulle" || s.sol) return false;
            const [x0, x1] = segment(s), dy = s.r.top - R.r.bottom;
            return cx > x0 && cx < x1 && dy > 0.35 * h && dy < 2.2 * h;
          });
          if (chemin2) return { cible: R, chemin: chemin2 };
        }
        return null;
      },
      jouer: async (a, p) => {
        const R = p.cible;
        await parcourir(a, p.chemin);
        if (!reprendre(R)) return;
        const cx = centre(R)[0];
        await marcher(a, cx - a.appui.r.left);
        a.mii.capVise = 0;
        await attendre(a, 0.45, () => a.mii.regarder(vers(cx, R.r.bottom, 40)));
        await sauter(a, { s: R, bord: "dessous", u: cx - R.r.left }, { hauteur: 0.12 * hMii(), face: true });
        reagir(R, "accroche");
        a.mii.regarder(null);
        await attendre(a, alea(3.2, 5.5), (t, dt) => {
          a.mii.amplitude = 0.55 + 1.25 * Math.exp(-t * 0.9);
          if (t > 1.2) regarderAutour(a, dt);
        });
        await chuter(a);
        a.mii.regarder(null);
        await geste(a, Math.random() < 0.5 ? "saluer" : "content", 1.3);
      }
    },
    // sauter sur un badge collé : il s'écrase sous les pieds ; petite danse ; un deuxième bond
    badge: {
      poids: 2.2,
      duree: "8\u201311 s",
      preparer: (sup) => {
        const h = hMii();
        return avecChemin({ sup, l: sup.filter((s) => s.genre === "badge" && !reserve(s)) }, (B) => (s) => s !== B && s.genre !== "badge" && s.genre !== "bulle" && !s.sol && lien(s, B) != null && Math.abs(haut(s) - haut(B)) < 2.4 * h);
      },
      jouer: async (a, p) => {
        const B = p.cible;
        await parcourir(a, p.chemin);
        await sautVers(a, B, { centre: true });
        a.mii.capVise = 0;
        await geste(a, "content", 1.2);
        await sauter(a, { s: B, bord: "dessus", u: a.u }, { hauteur: 0.55 * hMii() });
        await geste(a, "danser", 1.6);
      }
    },
    // tomber sur une bulle d'information et rebondir dessus comme sur un trampoline
    rebond: {
      poids: 2.2,
      duree: "8\u201310 s",
      preparer: (sup) => {
        const h = hMii();
        return avecChemin({ sup, l: sup.filter((s) => s.genre === "bulle" && !reserve(s)) }, (Q) => (s) => s.genre !== "bulle" && !s.sol && haut(s) < haut(Q) - 0.5 * h && lien(s, Q) != null);
      },
      jouer: async (a, p) => {
        const Q = p.cible, h = hMii();
        await parcourir(a, p.chemin);
        await sautVers(a, Q, { centre: true });
        await sauter(a, { s: Q, bord: "dessus", u: a.u + alea(-0.2, 0.2) * h }, { prep: 0, hauteur: 2.4 * h, salto: 1, recep: 0.16 });
        await sauter(a, { s: Q, bord: "dessus", u: a.u }, { prep: 0, hauteur: 1.3 * h, recep: 0.16 });
        a.mii.capVise = 0;
        await geste(a, "content", 1.1);
      }
    },
    // escalader la grille depuis le bas de l'écran, rangée par rangée (en s'accrochant au bord des tuiles), puis fêter ça
    escalade: {
      poids: 2.2,
      duree: "8\u201314 s",
      preparer: (sup) => {
        const l = tuilesLibres(sup).filter((s) => !sup.forcer || s.cle === sup.forcer).sort((a, b) => a.r.top - b.r.top), h = hMii();
        for (const T2 of l.slice(0, 6)) {
          const chemin2 = planifier(sup, (s) => s === T2, true, centre(T2)[0]);
          if (chemin2 && chemin2.some((n, i) => i && haut(chemin2[i - 1].s) - haut(n.s) > 1.8 * h)) return { cible: T2, chemin: chemin2 };
        }
        return null;
      },
      jouer: async (a, p) => {
        await parcourir(a, p.chemin);
        a.mii.capVise = 0;
        await geste(a, "content", 1.4);
        await geste(a, "saluer", 1.2);
      }
    },
    // jeter un œil par-dessus une tuile, depuis derrière elle
    coucou: {
      poids: 2,
      duree: "5\u20138 s",
      preparer: (sup) => {
        const l = tuilesLibres(sup).filter((s) => s.r.height > 1.35 * hMii() && s.r.top > 0.9 * hMii());
        return l.length ? { cible: melanger(l)[0] } : null;
      },
      jouer: async (a, p) => {
        const S = p.cible, h = hMii();
        if (!reprendre(S)) return;
        const [x0, x1] = segment(S);
        a.appui = S;
        a.bord = "derriere";
        a.mode = "appui";
        a.cache = S;
        a.u = x0 + (x1 - x0) * alea(0.2, 0.8) - S.r.left;
        a.dy = 1.25 * h;
        a.mii.capVise = 0;
        a.mii.regarder(vers(a.x - h, S.r.top - h));
        await glisser(a, 0.64 * h, 0.6);
        const quand = alea(0.8, 1.6);
        await attendre(a, alea(2.6, 3.6), (t, dt) => {
          regarderAutour(a, dt);
          a.mii.bras = t > quand && t < quand + 1.3 ? "salut" : null;
        });
        a.mii.bras = null;
        if (Math.random() < 0.45) {
          await glisser(a, 1.3 * h, 0.45);
          a.sorti = true;
          return;
        }
        await sauter(a, { s: S, bord: "dessus", u: a.u }, { hauteur: 0.35 * h });
        a.cache = null;
        a.mii.regarder(null);
        await geste(a, "saluer", 1.1);
      }
    },
    // aller saluer la tuile que le curseur a choisie, depuis sa voisine
    salut: {
      poids: 2.4,
      duree: "7\u20139 s",
      preparer: (sup) => {
        const S = sup.find((s) => (s.genre === "tuile" || s.genre === "case") && estSel(s));
        if (!S) return null;
        const voisins2 = sup.filter((s) => (s.genre === "tuile" || s.genre === "case") && s !== S && !reserve(s) && Math.abs(s.r.top - S.r.top) < 8 && Math.abs(centre(s)[0] - centre(S)[0]) < S.r.width * 1.7);
        const p = avecChemin({ sup, l: voisins2 }, (N) => (s) => s === N);
        return p && { ...p, sel: S };
      },
      jouer: async (a, p) => {
        const N = p.cible;
        await parcourir(a, p.chemin);
        const sel = () => document.querySelector("#pcv-console .cel.sel")?.getBoundingClientRect();
        const r = sel();
        if (!r) return;
        const [x0, x1] = segment(N), droite = r.left > N.r.right;
        await marcher(a, (droite ? x1 : x0) - N.r.left);
        a.mii.capVise = (droite ? 1 : -1) * 0.55;
        a.mii.jouer("saluer");
        await attendre(a, alea(2.2, 3), () => {
          const q = sel();
          if (q) a.mii.regarder(vers((q.left + q.right) / 2, q.top + q.height * 0.15, 120));
        });
        await geste(a, "applaudir", 1.3);
        a.mii.regarder(null);
      }
    },
    // pousser une pastille du bas de l'écran (elle bouge un peu), puis hausser les épaules
    pousser: {
      poids: 1.3,
      duree: "7\u20139 s",
      preparer: (sup) => {
        const l = sup.filter((s) => s.g.pousse && !reserve(s) && s.r.bottom > innerHeight - 4 * hMii());
        return l.length ? { cible: melanger(l)[0] } : null;
      },
      jouer: async (a, p) => {
        const P = p.cible, h = hMii(), W = innerWidth;
        if (!reprendre(P)) return;
        const cote = centre(P)[0] < W / 2 ? -1 : 1;
        majSol();
        a.appui = SOL;
        a.bord = "dessus";
        a.mode = "appui";
        a.u = (cote < 0 ? -1.1 * h : W + 1.1 * h) - SOL.r.left;
        await marcher(a, (cote < 0 ? P.r.left - 0.17 * h : P.r.right + 0.17 * h) - SOL.r.left);
        a.mii.viser(-cote, 0);
        a.mii.jouer("pousser");
        await attendre(a, 2.8, (t) => {
          if (!a.poussee || t - a.poussee > 0.95) {
            a.poussee = t;
            reagir(P, "pousse", -cote);
          }
        });
        a.mii.capVise = 0;
        await geste(a, "hausser", 1.2);
      }
    },
    // simple passage sur le bas de l'écran, avec un salut au milieu
    promenade: {
      poids: 0.7,
      duree: "6\u20139 s",
      preparer: () => ({}),
      jouer: async (a) => {
        const h = hMii(), W = innerWidth, cote = Math.random() < 0.5 ? -1 : 1;
        majSol();
        a.appui = SOL;
        a.bord = "dessus";
        a.mode = "appui";
        a.u = (cote < 0 ? -1.1 * h : W + 1.1 * h) - SOL.r.left;
        await marcher(a, W * alea(0.35, 0.65) - SOL.r.left, { courir: false });
        a.mii.capVise = 0;
        await geste(a, "saluer", 1.6);
      }
    },
    // ===== scènes ajoutées le 7/10/2026 (rythme Nintendo : poses tenues, transitions de 4 à 7 images) =====
    // deux Mii arrivent chacun d'un côté, se rencontrent sur le sol (entre les boutons du bas), se saluent, repartent ensemble
    rencontre: {
      poids: 2.2,
      duo: true,
      duree: "11\u201314 s",
      preparer: (sup) => {
        majSol();
        const h = hMii(), bas = sup.filter((s) => s.genre === "socle" && s.r.bottom > innerHeight - 3 * h).map((s) => [s.r.left, s.r.right]).sort((p, q) => p[0] - q[0]);
        let best = null, x = 0;
        for (const [l, r] of [...bas, [innerWidth, innerWidth]]) {
          if (l - x > 3 * h && (!best || l - x > best[1] - best[0])) best = [x, l];
          x = Math.max(x, r);
        }
        return best ? { xm: (best[0] + best[1]) / 2 } : null;
      },
      jouer: async (a, p, b) => {
        const h = hMii(), c = Math.random() < 0.5 ? -1 : 1;
        entrerSol(a, c);
        entrerSol(b, -c);
        await Promise.all([marcher(a, p.xm + c * 0.42 * h - SOL.r.left, { courir: false }), (async () => {
          await attendre(b, 0.4);
          await marcher(b, p.xm - c * 0.42 * h - SOL.r.left, { courir: false });
        })()]);
        versLui(a, b);
        versLui(b, a);
        await Promise.all([poser(a, "repos", 0.35), poser(b, "repos", 0.35)]);
        bulle(a, "exclam", 1);
        await Promise.all([poser(a, "saluer", 1.1), (async () => {
          await attendre(b, 0.25);
          await poser(b, "saluer", 1.1);
        })()]);
        bulle(b, Math.random() < 0.5 ? "coeur" : "note", 1.4);
        await Promise.all([poser(a, "content", 0.9), poser(b, "content", 0.9)]);
        a.mii.regarder(null);
        b.mii.regarder(null);
        const sortie = (c > 0 ? -1.3 * h : innerWidth + 1.3 * h) - SOL.r.left;
        await Promise.all([marcher(b, sortie - c * 0.8 * h), (async () => {
          await attendre(a, 0.35);
          await marcher(a, sortie);
        })()]);
        a.sorti = b.sorti = true;
      }
    },
    // deux Mii assis au bord de deux tuiles voisines, jambes qui balancent, bavardent en bulles (icônes), puis rient
    causette: {
      poids: 2.2,
      duo: true,
      duree: "14\u201318 s",
      preparer: (sup) => deuxVoisines(sup),
      jouer: async (a, p, b) => {
        await aDeux(a, b, p, 0.62, 0.38);
        a.mii.capVise = 0.5;
        b.mii.capVise = -0.5;
        a.mii.jouer("assis", { fondu: 0.2 });
        b.mii.jouer("assis", { fondu: 0.2 });
        await attendre(a, 0.5);
        a.mii.regarder(vers(b.x, b.y - 0.6 * hMii()));
        b.mii.regarder(vers(a.x, a.y - 0.6 * hMii()));
        let parleur = Math.random() < 0.5 ? a : b;
        for (let k = 0; k < 4; k++) {
          const autre = parleur === a ? b : a, ic = ICONES_CAUSETTE[Math.floor(Math.random() * ICONES_CAUSETTE.length)];
          parleur.mii.expression("parle");
          bulle(parleur, ic, 1.5);
          await attendre(parleur, 1.35);
          parleur.mii.expression(null);
          autre.mii.expression(ic === "question" ? "surprise" : "joie");
          await attendre(autre, 0.45);
          autre.mii.expression(null);
          parleur = autre;
        }
        a.mii.expression("joie");
        b.mii.expression("joie");
        await Promise.all([attendre(a, 1, (t) => {
          a.mii.bras = t < 0.8 ? "salut" : null;
        }), attendre(b, 1)]);
        for (const d of [a, b]) {
          d.mii.expression(null);
          d.mii.regarder(null);
          d.mii.bras = null;
        }
        await Promise.all([poser(a, "repos", 0.3), poser(b, "repos", 0.3)]);
      }
    },
    // saute-mouton sur trois ou quatre tuiles voisines : l'un se baisse, l'autre lui saute par-dessus, et on recommence
    sauteMouton: {
      poids: 1.8,
      duo: true,
      duree: "10\u201313 s",
      preparer: (sup) => {
        const r = melanger(rangees(posables(sup)));
        for (const n of [4, 3]) for (const g of r) for (const l of melanger(suites(g, n))) {
          const ca = chemin(sup, l[0]), cb = ca && chemin(sup, l[1]);
          if (cb) return { cible: l[0], cible2: l[1], l, ca, cb };
        }
        return null;
      },
      jouer: async (a, p, b) => {
        const h = hMii(), l = p.l;
        await aDeux(a, b, p);
        face(a);
        face(b);
        bulle(a, "etoile", 1);
        await Promise.all([poser(a, "content", 0.7), poser(b, "saluer", 0.7)]);
        let sauteur = a, mouton = b;
        for (let k = 2; k < l.length; k++) {
          const dest = l[k], [x0, x1] = segment(dest);
          await poser(mouton, "accroupi", 0.25, null, 0.12);
          await sauter(sauteur, { s: dest, bord: "dessus", u: (x0 + x1) / 2 - dest.r.left }, { hauteur: 1.05 * h, prep: 0.16 });
          face(sauteur);
          [sauteur, mouton] = [mouton, sauteur];
          await poser(sauteur, "repos", 0.15, null, 0.12);
        }
        await Promise.all([poser(a, "content", 1), poser(b, "content", 1)]);
      }
    },
    // cache-cache : l'un compte (mains sur les yeux), l'autre file s'accroupir derrière une tuile ; le premier cherche,
    // main en visière, l'autre pointe le nez… vu ! il jaillit
    cacheCache: {
      poids: 1.8,
      duo: true,
      duree: "15\u201318 s",
      preparer: (sup) => {
        const l = posables(sup, ["tuile", "dossier"]);
        for (const T2 of melanger(l.filter((s) => s.r.height > 0.8 * hMii()))) {
          const ct = chemin(sup, T2);
          if (!ct) continue;
          const S = melanger(l.filter((s) => s !== T2 && Math.abs(s.r.top - T2.r.top) < 2.5 * hMii() && Math.abs(centre(s)[0] - centre(T2)[0]) > 2 * T2.r.width))[0];
          const cs = S && chemin(sup, S);
          if (cs) return { cible: S, cible2: T2, ca: cs, cb: ct };
        }
        return null;
      },
      jouer: async (a, p, b) => {
        const h = hMii(), T2 = p.cible2;
        await aDeux(a, b, p);
        face(a);
        face(b);
        versLui(b, a);
        await poser(b, "saluer", 0.8);
        a.mii.regarder(null);
        a.mii.jouer("yeux", { fondu: 0.14 });
        bulle(a, "points", 2.8);
        b.mii.regarder(null);
        await poser(b, "repos", 0.2);
        b.mii.jouer("accroupi", { fondu: 0.12 });
        b.cache = T2;
        b.bord = "derriere";
        b.dy = 0;
        await glisser(b, 0.8 * h, 0.3);
        await attendre(a, 2.3);
        face(a);
        await poser(a, "repos", 0.15);
        a.mii.bras = "visiere";
        for (const s of [-1, 1]) {
          a.mii.capVise = s * 0.55;
          a.mii.regarder(vers(a.x + s * 3 * h, a.y - h));
          await attendre(a, 0.75);
        }
        a.mii.bras = null;
        face(a);
        bulle(a, "question", 1.2);
        await poser(a, "hausser", 1);
        b.mii.jouer("repos", { fondu: 0.12 });
        await glisser(b, 0.68 * h, 0.22);
        await attendre(b, 0.6);
        versLui(a, b);
        bulle(a, "exclam", 1);
        await poser(a, "repos", 0.35);
        b.cacheJusqua = haut(T2);
        await sauter(b, { s: T2, bord: "dessus", u: b.u }, { hauteur: 1 * h, prep: 0.08 });
        b.dy = 0;
        face(b);
        b.mii.expression("joie");
        await Promise.all([poser(a, "content", 1), poser(b, "content", 1)]);
        b.mii.expression(null);
        a.mii.regarder(null);
      }
    },
    // danser à deux sur deux tuiles voisines, les mêmes poses au même temps
    danseDuo: {
      poids: 1.4,
      duo: true,
      duree: "11\u201313 s",
      preparer: (sup) => deuxVoisines(sup),
      jouer: async (a, p, b) => {
        await aDeux(a, b, p);
        await danser(a, b);
      }
    },
    // se cacher derrière une tuile (accroupi), attendre, puis jaillir d'un bond quand le curseur passe (ou à la fin)
    surprise: {
      poids: 1.8,
      duree: "9\u201312 s",
      preparer: (sup) => avecChemin({ sup, l: posables(sup).filter((s) => s.r.height > 0.8 * hMii()) }, (T2) => (s) => s === T2),
      jouer: async (a, p) => {
        const T2 = p.cible, h = hMii();
        await allerA(a, p.chemin, alea(0.35, 0.65));
        face(a);
        await poser(a, "repos", 0.35, () => a.mii.regarder(vers(a.x - 2 * h, a.y - 0.5 * h)));
        a.mii.regarder(null);
        a.mii.expression("clin");
        await attendre(a, 0.5);
        a.mii.expression(null);
        a.mii.jouer("accroupi", { fondu: 0.12 });
        a.cache = T2;
        a.bord = "derriere";
        a.dy = 0;
        await glisser(a, 0.8 * h, 0.28);
        let t = 0;
        await tache(a, (dt) => {
          t += dt;
          return t > 5 || t > 1.2 && curseurPres(a, 1.7) && performance.now() - curseur.bouge < 900;
        });
        a.mii.jouer("repos", { fondu: 0 });
        a.mii.expression("joie");
        a.cacheJusqua = haut(T2);
        await sauter(a, { s: T2, bord: "dessus", u: a.u }, { hauteur: 1.2 * h, prep: 0.06 });
        a.dy = 0;
        bulle(a, "exclam", 1);
        await poser(a, "content", 1.1);
        a.mii.expression(null);
        await poser(a, "saluer", 0.9);
      }
    },
    // la sieste sur un dossier (ou une tuile) : bâiller, s'asseoir, piquer du nez (petits « z »), se réveiller, s'étirer
    sieste: {
      poids: 2,
      duree: "13\u201317 s",
      preparer: (sup) => {
        const d = posables(sup, ["dossier"]);
        return avecChemin({ sup, l: d.length ? d : posables(sup, ["tuile"]) }, (T2) => (s) => s === T2);
      },
      jouer: async (a, p) => {
        const h = hMii();
        await allerA(a, p.chemin, 0.5);
        face(a);
        a.mii.expression("parle");
        await poser(a, "etirer", 0.8);
        a.mii.expression(null);
        a.mii.capVise = (Math.random() < 0.5 ? -1 : 1) * 0.45;
        await poser(a, "assisSol", 0.7, null, 0.2);
        a.mii.jouer("somnoler", { fondu: 0.3 });
        let z = 0.4, t = 0, reveil = false;
        await tache(a, (dt) => {
          t += dt;
          z -= dt;
          if (z <= 0) {
            z = 0.95;
            marque(a, "z", { x: a.x + 0.2 * h, y: a.y - 0.75 * h, vx: 0.14, vy: 0.32, vie: 1.7, taille: 0.17 + 0.07 * Math.random() });
          }
          if (t > 2.5 && curseurPres(a, 1.3) && performance.now() - curseur.bouge < 700) reveil = true;
          return reveil || t > alea(8, 9);
        });
        a.mii.expression("surprise");
        if (reveil) bulle(a, "exclam", 0.9);
        face(a);
        await poser(a, "repos", 0.35, null, 0.08);
        a.mii.expression(null);
        await poser(a, "etirer", 0.9);
        if (reveil) {
          a.mii.bras = "salut";
          await attendre(a, 1);
          a.mii.bras = null;
        }
      }
    },
    // lire la jaquette d'un jeu : debout dessus, il se penche au bord pour la regarder, puis dit ce qu'il en pense
    jaquette: {
      poids: 2,
      duree: "7\u20139 s",
      preparer: (sup) => avecChemin({ sup, l: posables(sup, ["tuile"]).filter((s) => s.el.classList.contains("jeu")) }, (T2) => (s) => s === T2),
      jouer: async (a, p) => {
        const T2 = p.cible, h = hMii();
        await allerA(a, p.chemin, alea(0.4, 0.6));
        face(a);
        a.mii.sens = 0;
        a.mii.jouer("pencher", { fondu: 0.16, redemarrer: true });
        await attendre(a, 2.4, () => {
          if (reprendre(T2)) a.mii.regarder(vers(centre(T2)[0], centre(T2)[1] + 0.25 * h, 200));
        });
        a.mii.regarder(null);
        await poser(a, "repos", 0.25, null, 0.12);
        const info = infoJeu(T2);
        if (info) {
          reagir(T2, "choc");
          pancarte(a, info.nom, info.texte, 3.6);
          a.mii.expression(info.mine);
          await poser(a, info.mine === "inquiet" ? "hausser" : info.mine === "surprise" ? "content" : "applaudir", 1.3);
          await attendre(a, 2.1);
          a.mii.expression(null);
          return;
        }
        const ic = Math.random() < 0.55 ? "coeur" : Math.random() < 0.5 ? "manette" : "etoile";
        bulle(a, ic, 1.6);
        reagir(T2, "choc");
        await poser(a, ic === "manette" ? "content" : "applaudir", 1.2);
      }
    },
    // pousser une tuile de côté (elle ne bouge pas), frapper, toc toc… rien : tant pis
    pousserTuile: {
      poids: 1.7,
      duree: "9\u201311 s",
      preparer: (sup) => {
        for (const D of melanger(sup.filter((s) => (s.genre === "tuile" || s.genre === "dossier") && !reserve(s) && !estSel(s))))
          for (const f of melanger(flanc(sup, D))) {
            const c = chemin(sup, f.S);
            if (c) return { cible: D, ...f, chemin: c };
          }
        return null;
      },
      jouer: async (a, p) => {
        const D = p.cible, h = hMii();
        await parcourir(a, p.chemin);
        if (!reprendre(D)) return;
        const xc = p.cote < 0 ? D.r.left - 0.17 * h : D.r.right + 0.17 * h;
        await marcher(a, xc - a.appui.r.left);
        a.mii.viser(-p.cote, 0);
        a.mii.jouer("pousser", { fondu: 0.12 });
        let pousse = -1, sueur = false;
        await attendre(a, 2.6, (t) => {
          if (t - pousse > 0.95) {
            pousse = t;
            reagir(D, "pousse", -p.cote);
          }
          if (t > 1.3 && !sueur) {
            sueur = true;
            marque(a, "goutte", { x: a.x + 0.28 * h * p.cote, y: a.y - 1.15 * h, vy: -0.25, vie: 0.9, taille: 0.18 });
          }
        });
        await poser(a, "repos", 0.3, null, 0.12);
        let toc = 0;
        await poser(a, "frapper", 1.15, (t) => {
          const n = Math.floor((t + 0.1) * 2.6);
          if (n > toc && n <= 2) {
            toc = n;
            reagir(D, "tremble");
          }
        });
        face(a);
        bulle(a, "points", 1.2);
        await poser(a, "hausser", 1.2);
      }
    },
    // un Mii assis guette le curseur : quand il approche, il se lève d'un bond et fait signe ; quand il s'en va, il se rassoit
    guetteur: {
      poids: 1.6,
      duree: "14\u201316 s",
      preparer: (sup) => {
        const c = curseur.r;
        return avecChemin({ sup, l: posables(sup).filter((s) => !c || Math.hypot(centre(s)[0] - (c.left + c.right) / 2, centre(s)[1] - (c.top + c.bottom) / 2) > 2.5 * s.r.width) }, (T2) => (s) => s === T2);
      },
      jouer: async (a, p) => {
        await allerA(a, p.chemin, alea(0.3, 0.7));
        a.mii.capVise = alea(-0.4, 0.4);
        a.mii.jouer("assis", { fondu: 0.2 });
        let t = 0, debout = 0, vu = 0;
        const salut = alea(4, 7);
        await tache(a, (dt) => {
          t += dt;
          const pres = curseurPres(a, 2.3);
          if (pres && !debout) {
            debout = t;
            vu++;
            face(a);
            a.mii.bras = null;
            a.mii.jouer("content", { fondu: 0.1, redemarrer: true });
            a.mii.expression("joie");
            bulle(a, vu > 1 ? "coeur" : "exclam", 1.2);
          } else if (debout && !pres && t - debout > 1.5) {
            debout = 0;
            a.mii.expression(null);
            a.mii.jouer("assis", { fondu: 0.2 });
          }
          if (debout) {
            const r = curseur.r;
            if (r) a.mii.regarder(vers((r.left + r.right) / 2, r.top));
          } else {
            regarderAutour(a, dt);
            a.mii.bras = t > salut && t < salut + 1.4 ? "salut" : null;
          }
          return t > 15;
        });
        a.mii.bras = null;
        a.mii.expression(null);
        a.mii.regarder(null);
        await poser(a, "repos", 0.3);
      }
    },
    // marcher sur une tuile en saluant le joueur, sans voir le bord… pied dans le vide, chute, étoiles, se frotter la tête
    chute: {
      poids: 1.8,
      duree: "10\u201312 s",
      preparer: (sup) => {
        const h = hMii();
        for (const T2 of melanger(posables(sup))) for (const c of melanger([-1, 1])) {
          const xb = c < 0 ? T2.r.left - 0.12 * h : T2.r.right + 0.12 * h, B = sousLeMii(xb, T2.r.top + 0.5 * h, innerHeight);
          if (!B || B.genre === "bulle" || haut(B) - T2.r.top < 1.3 * h || haut(B) - T2.r.top > 6 * h) continue;
          const bx = c < 0 ? T2.r.left - 0.55 * h : T2.r.right + 0.05 * h;
          if (!degage(sup, bx, bx + 0.5 * h, T2.r.top - 0.9 * h, haut(B) - 2, [T2, B])) continue;
          const ch = chemin(sup, T2);
          if (ch) return { cible: T2, cote: c, chemin: ch };
        }
        return null;
      },
      jouer: async (a, p) => {
        const T2 = p.cible, h = hMii(), c = p.cote;
        await parcourir(a, p.chemin);
        if (!reprendre(T2)) return;
        const [x0, x1] = segment(T2);
        await marcher(a, (c < 0 ? x1 : x0) - T2.r.left);
        a.mii.bras = "salut";
        a.mii.expression("joie");
        a.mii.regarder(vers(a.x, a.y - 0.7 * h, 900));
        await marcher(a, c < 0 ? -0.1 * h : T2.r.width + 0.1 * h, { courir: false });
        a.mii.bras = null;
        a.mii.expression("surprise");
        face(a);
        await poser(a, "repos", 0.5, () => a.mii.regarder(vers(a.x, a.y + 1.5 * h, 200)), 0.08);
        a.mii.regarder(null);
        await chuter(a, { vx: c * 0.3 * h });
        if (a.sorti) return;
        a.mii.expression("inquiet");
        await poser(a, "assisSol", 0.2, null, 0.06);
        for (let k = 0; k < 3; k++) marque(a, "etoile", { orbite: k * 2.1, oy: 0.72, vie: 1.7, taille: 0.15 });
        await attendre(a, 1.7);
        await poser(a, "repos", 0.25, null, 0.12);
        await poser(a, "frotter", 1.3);
        a.mii.expression(null);
        bulle(a, "points", 1);
        await poser(a, "hausser", 1);
      }
    },
    // il voit une tuile trop haute, va chercher une échelle hors de l'écran, la dresse contre elle, grimpe, profite de la
    // vue, redescend, couche l'échelle et la remporte
    echelle: {
      poids: 2.2,
      duree: "22\u201328 s",
      preparer: (sup) => {
        const h = hMii();
        majSol();
        const yS = haut(SOL);
        for (const T2 of melanger(posables(sup))) {
          const [x0, x1] = segment(T2);
          for (const x of melanger([x0 + 0.3 * (x1 - x0), x1 - 0.3 * (x1 - x0)])) {
            const L = yS - T2.r.top + 0.3 * h;
            if (L < 2.4 * h || L > 7.5 * h || x < 1.5 * h || x > innerWidth - 1.5 * h) continue;
            if (!degage(sup, x - 0.32 * h, x + 0.32 * h, T2.r.bottom + 1, yS - 1, [T2])) continue;
            return { cible: T2, x, L };
          }
        }
        return null;
      },
      jouer: async (a, p) => {
        const T2 = p.cible, h = hMii(), x = p.x, c = coteProche(x), W = innerWidth, yS = () => haut(SOL), dx0 = x - T2.r.left;
        entrerSol(a, c);
        await marcher(a, x + c * 0.5 * h - SOL.r.left);
        face(a);
        a.mii.regarder(vers(x, T2.r.top));
        a.mii.bras = "visiere";
        await attendre(a, 1.1);
        a.mii.bras = null;
        bulle(a, "question", 1.1);
        await poser(a, "hausser", 0.7);
        bulle(a, "exclam", 0.8);
        a.mii.regarder(null);
        await attendre(a, 0.4);
        await marcher(a, (c < 0 ? -1.2 * h : W + 1.2 * h) - SOL.r.left, { courir: true });
        await attendre(a, 0.5);
        const e = prendreObjet(a, "echelle", p.L), rz = c * Math.PI / 2;
        tenir(a, e, "deux", { dx: c * p.L / 2 / h, dy: 0.6, rz, dz: 6 });
        await marcher(a, x + c * 0.5 * h - SOL.r.left, { anim: "porterMarche" });
        face(a);
        await poser(a, "porter", 0.25, null, 0.1);
        tenir(a, null);
        e.position.set(x, -yS(), a.z - 25);
        e.rotation.z = rz;
        e.updateMatrixWorld(true);
        a.mii.jouer("pousser", { fondu: 0.12 });
        a.mii.viser(-c, 0);
        await animer(e, 0.5, (q) => {
          e.rotation.z = rz * (1 - rebond(q)) + c * 0.03 * rebond(q);
        });
        reagir(T2, "choc");
        e.userData.maj = () => {
          if (reprendre(T2)) e.position.x = T2.r.left + dx0;
          return true;
        };
        await marcher(a, x - SOL.r.left);
        a.mii.capVise = Math.PI;
        await attendre(a, 0.2);
        await echelons(a, x, yS(), T2.r.top + prise(a), e.userData.pas);
        finGrimper(a);
        a.appui = T2;
        a.bord = "mains";
        a.mode = "appui";
        a.u = x - T2.r.left;
        a.y = T2.r.top + u();
        await hisser(a);
        face(a);
        bulle(a, "etoile", 1.2);
        await poser(a, "content", 1);
        a.mii.capVise = 0.4;
        a.mii.jouer("assis", { fondu: 0.2 });
        const q0 = alea(0.8, 1.6);
        await attendre(a, 3, (t, dt) => {
          vivote(a, dt);
          if (!a.signe) a.mii.bras = t > q0 && t < q0 + 1.3 ? "salut" : null;
        });
        a.mii.bras = null;
        await poser(a, "repos", 0.3);
        await marcher(a, dx0);
        a.mii.capVise = Math.PI;
        await attendre(a, 0.25);
        await echelons(a, x, haut(T2), yS(), e.userData.pas);
        finGrimper(a);
        majSol();
        a.appui = SOL;
        a.bord = "dessus";
        a.mode = "appui";
        a.u = x - SOL.r.left;
        await marcher(a, x + c * 0.5 * h - SOL.r.left);
        a.mii.viser(-c, 0);
        a.mii.jouer("pousser", { fondu: 0.12 });
        e.userData.maj = null;
        await animer(e, 0.45, (q) => {
          e.rotation.z = c * 0.03 * (1 - lisse(q)) + rz * lisse(q);
        });
        face(a);
        await poser(a, "porter", 0.3, null, 0.1);
        tenir(a, e, "deux", { dx: c * p.L / 2 / h, dy: 0.6, rz, dz: 6 });
        await marcher(a, (c < 0 ? -1.4 * h : W + 1.4 * h) - SOL.r.left, { anim: "porterMarche" });
        a.sorti = true;
      }
    },
    // jongler de la tête avec un ballon de plage, l'envoyer sur la tuile voisine, aller le chercher
    ballon: {
      poids: 1.8,
      duree: "12\u201315 s",
      preparer: (sup) => deuxVoisines(sup),
      jouer: async (a, p) => {
        const A = p.cible, B = p.cible2, h = hMii();
        const bal = prendreObjet(a, "ballon"), r = bal.userData.rayon;
        const droite = Math.random() < 0.5, [D, F] = droite ? [A, B] : [B, A];
        tenir(a, bal, "d", { dy: -0.02, dx: 0.05 });
        a.mii.bras = "tenir";
        await allerA(a, droite ? p.ca : p.cb, droite ? 0.35 : 0.65);
        face(a);
        const tete = () => [a.x, a.y - 1.08 * h - r];
        a.mii.bras = "haut";
        await attendre(a, 0.2);
        tenir(a, null);
        a.mii.bras = null;
        const tourner = (q, dt) => {
          bal.userData.boule.rotation.z += dt * 9;
        };
        let p0 = [bal.position.x, -bal.position.y];
        await Promise.all([trajet(bal, p0, tete(), 0.9 * h, 0.55, tourner), poser(a, "repos", 0.5, () => a.mii.regarder(vers(bal.position.x, -bal.position.y, 300)), 0.1)]);
        a.mii.jouer("content", { fondu: 0.1, redemarrer: true });
        for (let k = 0; k < 3; k++) await Promise.all([trajet(bal, tete(), tete(), (0.7 + 0.15 * k) * h, 0.5 + 0.05 * k, tourner), attendre(a, 0.45, () => a.mii.regarder(vers(bal.position.x, -bal.position.y, 300)))]);
        const [f0, f1] = segment(F), xa = (f0 + f1) / 2, cible = () => [xa, haut(F) - r];
        a.mii.viser(xa - a.x, 0);
        await trajet(bal, tete(), cible(), 1.2 * h, 0.7, tourner);
        reagir(F, "ecrase");
        await trajet(bal, cible(), [xa + (droite ? 0.3 : -0.3) * h, haut(F) - r], 0.35 * h, 0.32, tourner);
        a.mii.regarder(null);
        bulle(a, "exclam", 0.8);
        await sautVers(a, F);
        await marcher(a, xa + (droite ? 0.3 : -0.3) * h - F.r.left - (droite ? 0.25 : -0.25) * h);
        await poser(a, "accroupi", 0.35, null, 0.12);
        tenir(a, bal, "d", { dy: -0.02, dx: 0.05 });
        a.mii.bras = "tenir";
        face(a);
        await poser(a, "repos", 0.2);
        bulle(a, "etoile", 1);
        await poser(a, "content", 1);
      }
    },
    // descendre d'une tuile en parapluie : il l'apporte fermé, comme une canne, l'ouvre au bord, saute et plane
    parapluie: {
      poids: 1.8,
      duree: "12\u201316 s",
      preparer: (sup) => {
        const h = hMii();
        for (const T2 of melanger(posables(sup))) for (const c of melanger([-1, 1])) {
          const x = c < 0 ? T2.r.left - 0.5 * h : T2.r.right + 0.5 * h;
          if (x < h || x > innerWidth - h) continue;
          const B = sousLeMii(x, T2.r.top + 0.2 * h, innerHeight);
          if (!B || B.genre === "bulle") continue;
          const yB = haut(B);
          if (yB - T2.r.top < 2.4 * h) continue;
          if (!degage(sup, x - 0.4 * h, x + 0.4 * h, T2.r.top + 0.1 * h, yB - 2, [B, T2])) continue;
          const ch = chemin(sup, T2);
          if (ch) return { cible: T2, cote: c, x, B, chemin: ch };
        }
        return null;
      },
      jouer: async (a, p) => {
        const T2 = p.cible, B = p.B, h = hMii(), c = p.cote;
        const pa = prendreObjet(a, "parapluie");
        tenir(a, pa, "d", { dy: -0.04, rz: -c * 0.2 });
        a.mii.bras = "tenir";
        await parcourir(a, p.chemin);
        const [x0, x1] = segment(T2);
        await marcher(a, (c < 0 ? x0 : x1) - T2.r.left);
        a.mii.sens = c;
        a.mii.jouer("pencher", { fondu: 0.14, redemarrer: true });
        await attendre(a, 0.9, () => reprendre(B) && a.mii.regarder(vers(p.x, haut(B), 200)));
        a.mii.regarder(null);
        face(a);
        bulle(a, "exclam", 0.8);
        await poser(a, "repos", 0.3, null, 0.1);
        a.mii.bras = "haut";
        tenir(a, pa, "d", { dy: -0.02 });
        await attendre(a, 0.35, (t2) => pa.userData.ouvrir(t2 / 0.3));
        await sauter(a, { x: p.x, y: haut(T2) + 0.25 * h }, { hauteur: 0.35 * h });
        a.mode = "libre";
        a.mii.jouer("repos", { fondu: 0.2 });
        let t = 0;
        await tache(a, (dt) => {
          t += dt;
          a.y += 0.95 * h * dt;
          a.x = p.x + 0.12 * h * Math.sin(t * 2.4);
          tenir(a, pa, "d", { dy: -0.02, rz: 0.1 * Math.sin(t * 2.4 + 0.6) });
          a.solVol = reprendre(B) ? haut(B) : null;
          if (a.solVol != null && a.y >= a.solVol) {
            a.y = a.solVol;
            return true;
          }
          return a.y > innerHeight + h;
        });
        if (!reprendre(B)) {
          a.sorti = true;
          return;
        }
        a.appui = B;
        a.bord = "dessus";
        a.mode = "appui";
        a.u = a.x - B.r.left;
        a.solVol = null;
        reagir(B, B.g.choc || "choc");
        await poser(a, "rattraper", 0.4, null, 0.05);
        await attendre(a, 0.3, (q) => pa.userData.ouvrir(1 - q / 0.25));
        a.mii.bras = "tenir";
        tenir(a, pa, "d", { dy: -0.04, rz: -c * 0.2 });
        bulle(a, "etoile", 1);
        await poser(a, "content", 0.9);
      }
    },
    // regarder l'heure à l'horloge de la barre, main en visière… déjà ?! il file en courant
    heure: {
      poids: 1.6,
      duree: "7\u20139 s",
      preparer: (sup) => {
        const H = horloge();
        if (!H) return null;
        const d = (s) => Math.hypot(centre(s)[0] - H.r.left, centre(s)[1] - H.r.bottom);
        return avecChemin({ sup, l: posables(sup).filter((s) => s.r.top < innerHeight * 0.5).sort((x, y) => d(x) - d(y)).slice(0, 4) }, (T2) => (s) => s === T2);
      },
      jouer: async (a, p) => {
        await allerA(a, p.chemin, 0.7);
        const H = horloge();
        if (!H) return;
        const cx = (H.r.left + H.r.right) / 2, cy = (H.r.top + H.r.bottom) / 2;
        a.mii.viser(cx - a.x, 0);
        a.mii.regarder(vers(cx, cy, 200));
        a.mii.bras = "visiere";
        await poser(a, "repos", 1.3);
        a.mii.bras = null;
        bulle(a, "horloge", 1.4);
        reagir({ el: H.el }, "tremble");
        await attendre(a, 1.1);
        face(a);
        a.mii.regarder(null);
        a.mii.expression("surprise");
        bulle(a, "exclam", 0.9);
        await poser(a, "content", 0.6, null, 0.08);
        a.mii.expression(null);
      }
    },
    // danser au rythme de la musique du thème (ses basses), une pose de Nintendo par temps, des notes qui s'envolent
    danse: {
      poids: 1.8,
      duree: "10\u201312 s",
      preparer: (sup) => avecChemin({ sup, l: posables(sup) }, (T2) => (s) => s === T2),
      jouer: async (a, p) => {
        await allerA(a, p.chemin, 0.5);
        await danser(a, null);
      }
    },
    // se percher sur un bouton de la légende du bas (ou la barre des pages), jambes qui balancent
    perche: {
      poids: 1.5,
      duree: "10\u201313 s",
      preparer: (sup) => avecChemin({ sup, l: sup.filter((s) => s.genre === "socle" && !reserve(s) && s.r.width > 0.9 * hMii()) }, (P) => (s) => s === P),
      jouer: async (a, p) => {
        await allerA(a, p.chemin, alea(0.3, 0.7));
        a.mii.capVise = alea(-0.45, 0.45);
        a.mii.jouer("assis", { fondu: 0.2 });
        const quand = alea(2, 5);
        await attendre(a, alea(7, 10), (t, dt) => {
          vivote(a, dt);
          if (!a.signe) a.mii.bras = t > quand && t < quand + 1.4 ? "salut" : null;
        });
        a.mii.bras = null;
        a.mii.regarder(null);
        await poser(a, "repos", 0.3);
      }
    },
    // une tuile vient d'être rangée : un Mii accourt sur la voisine, la regarde, pouce levé, applaudit
    bravo: {
      poids: 0,
      surEvenement: true,
      duree: "6\u20138 s",
      preparer: (sup) => {
        const S = sup.find((s) => (s.genre === "tuile" || s.genre === "dossier") && s.el.classList.contains("sel"));
        if (!S) return null;
        const l = sup.filter((s) => (s.genre === "tuile" || s.genre === "dossier") && s !== S && !reserve(s) && Math.abs(s.r.top - S.r.top) < 4 && (voisins(s, S) || voisins(S, s)));
        const p = avecChemin({ sup, l }, (N) => (s) => s === N);
        return p && { ...p, sel: S };
      },
      jouer: async (a, p) => {
        const N = p.cible, S = p.sel;
        await parcourir(a, p.chemin);
        if (!reprendre(S)) return;
        const [x0, x1] = segment(N), droite = S.r.left > N.r.right;
        await marcher(a, (droite ? x1 : x0) - N.r.left);
        a.mii.capVise = (droite ? 1 : -1) * 0.55;
        a.mii.regarder(vers(centre(S)[0], S.r.top + 0.2 * hMii(), 120));
        await poser(a, "repos", 0.5);
        bulle(a, "pouce", 1.6);
        await poser(a, "applaudir", 1.4);
        face(a);
        a.mii.regarder(null);
      }
    },
    // prendre le joueur en photo : appareil devant le visage, éclair du flash, il regarde le résultat, content
    photo: {
      poids: 1.5,
      duree: "8\u201310 s",
      preparer: (sup) => avecChemin({ sup, l: posables(sup) }, (T2) => (s) => s === T2),
      jouer: async (a, p) => {
        const h = hMii();
        const ap = prendreObjet(a, "appareil");
        tenir(a, ap, "d", { dy: -0.03 });
        a.mii.bras = "tenir";
        await allerA(a, p.chemin, alea(0.35, 0.65));
        face(a);
        a.mii.bras = null;
        tenir(a, ap, "deux", { dy: 0.02, dz: 18 });
        await poser(a, "photo", 1.1, null, 0.14);
        const [lx, ly] = [ap.position.x, -ap.position.y];
        marque(a, "eclat", { x: lx, y: ly, vie: 0.35, taille: 0.9 });
        await attendre(a, 0.7);
        a.mii.jouer("repos", { fondu: 0.14 });
        tenir(a, ap, "d", { dy: -0.03 });
        a.mii.bras = "tenir";
        a.mii.regarder(vers(a.x + 0.2 * h, a.y - 0.3 * h, 400));
        await attendre(a, 0.9);
        a.mii.regarder(null);
        bulle(a, Math.random() < 0.5 ? "coeur" : "etoile", 1.3);
        await poser(a, "content", 1);
      }
    },
    // faire le ménage sur une tuile : balai, petits nuages de poussière, la tuile qui brille, s'essuyer le front
    menage: {
      poids: 1.5,
      duree: "10\u201312 s",
      preparer: (sup) => avecChemin({ sup, l: posables(sup) }, (T2) => (s) => s === T2),
      jouer: async (a, p) => {
        const T2 = p.cible, h = hMii();
        const bl = prendreObjet(a, "balai");
        tenir(a, bl, "d", { dy: 0.02, rz: 0.12 });
        a.mii.bras = "tenir";
        await parcourir(a, p.chemin);
        const [x0, x1] = segment(T2);
        for (const f of [0.25, 0.75, 0.5]) {
          await marcher(a, x0 + (x1 - x0) * f - T2.r.left);
          const s = Math.random() < 0.5 ? -1 : 1;
          let pf = 0;
          a.mii.capVise = s * 0.5;
          a.mii.bras = null;
          tenir(a, bl, "deux", { dy: -0.02, rz: s * 0.55 });
          await poser(a, "balayer", 1.3, (t, dt) => {
            pf -= dt;
            if (pf <= 0) {
              pf = 0.38;
              marque(a, "poussiere", { x: a.x + s * 0.5 * h, y: a.y - 0.12 * h, vx: s * 0.8, vy: 0.3, vie: 0.6, taille: 0.22 });
            }
          }, 0.14);
          tenir(a, bl, "d", { dy: 0.02, rz: 0.12 });
          a.mii.bras = "tenir";
        }
        reagir(T2, "choc");
        face(a);
        for (let k = 0; k < 3; k++) marque(a, "eclat", { x: alea(T2.r.left + 8, T2.r.right - 8), y: T2.r.top + alea(0.15, 0.7) * T2.r.height, vie: 0.8, taille: 0.2 });
        marque(a, "goutte", { x: a.x + 0.3 * h, y: a.y - 1.15 * h, vy: -0.25, vie: 0.9, taille: 0.18 });
        await poser(a, "content", 1);
      }
    },
    // lancer un avion en papier depuis une tuile haute : il plane au loin ; le Mii le suit des yeux et applaudit
    avion: {
      poids: 1.4,
      duree: "8\u201310 s",
      preparer: (sup) => avecChemin({ sup, l: posables(sup).filter((s) => s.r.top < innerHeight * 0.55) }, (T2) => (s) => s === T2),
      jouer: async (a, p) => {
        const h = hMii(), T2 = p.cible;
        const av = prendreObjet(a, "avion");
        tenir(a, av, "d", { dy: 0.04 });
        a.mii.bras = "tenir";
        await allerA(a, p.chemin, 0.5);
        const s = centre(T2)[0] < innerWidth / 2 ? 1 : -1;
        a.mii.viser(s, 0);
        a.mii.bras = null;
        a.mii.jouer("lancer", { fondu: 0.1, redemarrer: true });
        await attendre(a, 0.36);
        tenir(a, null);
        let vx = s * 3.1 * h, vy = -0.7 * h, t = 0;
        av.rotation.y = s < 0 ? Math.PI : 0;
        av.userData.maj = (dt) => {
          t += dt;
          vy += (0.45 * h - vy) * dt * 0.7;
          const vys = vy + Math.sin(t * 3.2) * 0.9 * h;
          av.position.x += vx * dt;
          av.position.y -= vys * dt;
          av.rotation.z = Math.atan2(-vys, Math.abs(vx)) * 0.7;
          const x = av.position.x, y = -av.position.y;
          return x > -2 * h && x < innerWidth + 2 * h && y < innerHeight + h && y > -2 * h;
        };
        await attendre(a, 1.8, () => {
          if (av.parent) a.mii.regarder(vers(av.position.x, -av.position.y, 300));
        });
        a.mii.regarder(null);
        face(a);
        await poser(a, "applaudir", 1.1);
      }
    },
    s1: {
      rare: true,
      poids: 1,
      duree: "4\u20135 s",
      preparer: (sup) => {
        const h = hMii();
        majSol();
        for (const S of [...melanger(posables(sup).filter((s) => s.r.top > 1.2 * h)), SOL]) {
          const [x0, x1] = segment(S), x = S.sol ? xPresDuBord(1.5) : (x0 + x1) / 2;
          if (x < h || x > innerWidth - h) continue;
          if (!degage(sup, x - 0.45 * h, x + 0.45 * h, -2 * h, haut(S) - 2, [S])) continue;
          return { cible: S.sol ? null : S, S, x };
        }
        return null;
      },
      jouer: async (a, p) => {
        const S = p.S, h = hMii(), m = a.mii;
        if (!reprendre(S)) return;
        const dx = p.x - S.r.left;
        a.mode = "libre";
        a.x = p.x;
        a.y = -1.4 * h;
        m.capVise = m.cap = 0;
        m.jouer("atterrir", { fondu: 0 });
        const vy = 9 * h;
        const tr = sprite(texMarque("k8"), h);
        tr.center.set(0.5, 0);
        tr.renderOrder = 19;
        scene.add(tr);
        a.objets.push(tr);
        tr.userData.maj = () => true;
        await tache(a, (dt) => {
          a.y += vy * dt;
          a.x = S.sol ? p.x : S.r.left + dx;
          tr.position.set(a.x, -(a.y - 0.35 * h), a.z - 5);
          tr.scale.set(1.1 * h, Math.min(4.5 * h, a.y + 1.4 * h), 1);
          if (a.y >= haut(S)) {
            a.y = haut(S);
            return true;
          }
          return false;
        });
        let tt = 0;
        tr.userData.maj = (dt) => {
          tt += dt;
          tr.material.opacity = Math.max(0, 1 - tt / 0.25);
          tr.scale.y *= 0.8;
          return tt < 0.25;
        };
        a.appui = S;
        a.bord = "dessus";
        a.mode = "appui";
        a.u = dx;
        reagir(S, S.sol ? "choc" : "ecrase");
        m.jouer("atterrir", { fondu: 0, redemarrer: true });
        for (let k = 0; k < 10; k++) marque(a, k < 2 ? "k5" : "poussiere", { x: a.x + (k % 2 ? 1 : -1) * alea(0.1, 0.9) * h, y: a.y - alea(0, 0.2) * h, vx: (k % 2 ? 1 : -1) * alea(0.6, 1.6), vy: alea(0.1, 0.6), vie: 0.5, taille: k < 2 ? 0.7 : 0.45 });
        await attendre(a, 0.55);
        m.jouer("repos", { fondu: 0.2 });
        await attendre(a, 0.2);
        m.jouer("viser", { fondu: 0.15 });
        await attendre(a, 1.1, (t) => {
          m.capVise = Math.sin(t * 3) * 0.75;
        });
        face(a);
        m.saut = { ph: "prep", q: 0 };
        m.jouer("sauter", { fondu: 0.08, redemarrer: true });
        await attendre(a, 0.14, (t) => {
          m.saut.q = t / 0.14;
        });
        a.mode = "libre";
        a.appui = null;
        m.saut = { ph: "vol", q: 0.15 };
        await tache(a, (dt) => {
          a.y -= 16 * h * dt;
          return a.y < -2 * h;
        });
        m.saut = null;
        a.sorti = true;
      }
    },
    s2: {
      rare: true,
      poids: 1,
      duree: "3\u20134 s",
      preparer: () => {
        majSol();
        return { cible: null, x: xPresDuBord(2.5) };
      },
      jouer: async (a, p) => {
        const h = hMii(), m = a.mii;
        await entrerVite(a, p.x, 16, { trainee: true, cadence: 3.2 });
        const s = a.x < innerWidth / 2 ? 1 : -1;
        for (let k = 0; k < 5; k++) marque(a, "poussiere", { x: a.x + s * alea(0.1, 0.6) * h, y: a.y - 0.05 * h, vx: s * alea(0.4, 1), vy: alea(0.1, 0.5), vie: 0.45, taille: 0.35 });
        m.capVise = s * Math.PI / 2 * 0.9;
        await poser(a, "boule", 0.14, null, 0.06);
        const b = prendreObjet(a, "o8");
        b.position.set(a.x, -(a.y - b.userData.rayon), a.z + 10);
        b.scale.setScalar(0.3);
        await attendre(a, 0.1, (t) => {
          b.scale.setScalar(0.3 + 7 * t);
          echelleMii(a, 1 - 9 * t);
        });
        b.scale.setScalar(1);
        m.masque = true, m.objet.visible = false;
        echelleMii(a, 1);
        await attendre(a, 1.1, (u2, dt) => {
          b.userData.rouler(dt * (14 + 40 * u2) * s);
          b.position.x = a.x + Math.sin(u2 * 70) * 0.025 * h;
          if (Math.random() < 0.6) marque(a, "poussiere", { x: a.x - s * 0.4 * h, y: a.y - 0.05 * h, vx: -s * alea(0.8, 1.8), vy: alea(0.2, 0.7), vie: 0.45, taille: alea(0.25, 0.4) });
        });
        const fin = s > 0 ? innerWidth + 2 * h : -2 * h;
        await tache(a, (dt) => {
          a.u += s * 24 * h * dt;
          [a.x, a.y] = ancre(SOL, "dessus", a.u);
          b.position.x = a.x;
          b.userData.rouler(dt * 50 * s);
          marque(a, "k3", { x: a.x - s * 0.6 * h, y: a.y - alea(0.15, 0.7) * h, vie: 0.2, taille: 0.55 });
          return s > 0 ? a.x > fin : a.x < fin;
        });
        a.sorti = true;
      }
    },
    s3: {
      rare: true,
      poids: 1,
      duree: "6\u20138 s",
      preparer: (sup) => {
        const h = hMii();
        majSol();
        const yS = haut(SOL);
        for (const T2 of melanger(posables(sup, ["tuile", "dossier"]).filter((s) => s.r.top < innerHeight * 0.45))) for (const c of melanger([-1, 1])) {
          const xb = c < 0 ? T2.r.left + 0.55 * h : T2.r.right - 0.55 * h;
          if (xb < h || xb > innerWidth - h) continue;
          if (yS - T2.r.top < 3 * h) continue;
          if (!degage(sup, xb - 0.5 * h, xb + 0.5 * h, -2 * h, T2.r.top - 2, [T2])) continue;
          return { cible: T2, cote: c, xb };
        }
        return null;
      },
      jouer: async (a, p) => {
        const T2 = p.cible, h = hMii(), c = p.cote, m = a.mii;
        if (!reprendre(T2)) return;
        const yS = () => haut(SOL);
        const xe = c < 0 ? T2.r.left + 0.2 * h : T2.r.right - 0.2 * h;
        a.mode = "libre";
        a.x = xe;
        a.y = -1.4 * h;
        await sauter(a, { s: T2, bord: "dessus", u: xe - T2.r.left }, { prep: 0, hauteur: 0.2 * h, ensuite: "tapi" });
        m.regardMax = null;
        m.capVise = c * 0.9;
        const f = prendreObjet(a, "o1");
        f.position.set(p.xb, -yS(), a.z + 40);
        f.scale.setScalar(0.01);
        nuage(a, p.xb, yS(), 5);
        await animer(f, 0.25, (q) => f.scale.setScalar(Math.max(0.01, rebond(q))));
        await attendre(a, 0.3, () => m.regarder(vers(p.xb, yS() - 0.3 * h, 300)));
        m.regarder(null);
        await poser(a, "ange", 0.4, null, 0.12);
        reagir(T2, "choc");
        const g = 16 * h, xd = a.x, yd = a.y, yc = () => yS() - f.userData.dessus + 0.05 * h, vy0 = -2.4 * h, duree = (-vy0 + Math.sqrt(vy0 * vy0 + 2 * g * (yc() - yd))) / g;
        let t = 0;
        a.mode = "vol";
        a.appui = null;
        a.solVol = null;
        await tache(a, (dt) => {
          t += dt;
          const q = Math.min(1, t / duree);
          a.x = xd + (p.xb - xd) * q;
          a.y = yd + vy0 * t + 0.5 * g * t * t;
          m.salto.rotation.x = Math.PI * 0.95 * lisseB(q * 1.4);
          if (q >= 1) {
            m.masque = true, m.objet.visible = false;
            return true;
          }
          return false;
        });
        m.salto.rotation.x = 0;
        m.jouer("repos", { fondu: 0 });
        for (let k = 0; k < 14; k++) marque(a, "k1", { x: p.xb + alea(-0.5, 0.5) * h, y: yc() + alea(-0.1, 0.15) * h, vx: alea(-1.3, 1.3), vy: alea(0.9, 2), vie: alea(0.5, 0.9), taille: alea(0.16, 0.26) });
        await animer(f, 0.4, (q) => {
          const e = Math.sin(q * Math.PI) * Math.exp(-q * 2);
          f.scale.set(1 + 0.16 * e, 1 - 0.25 * e, 1 + 0.16 * e);
        });
        await attendre(a, 0.35);
        a.mode = "libre";
        a.x = p.xb;
        a.y = yc() + 0.55 * h;
        m.capVise = m.cap = 0;
        m.masque = false, m.objet.visible = true;
        await attendre(a, 0.5, (u2) => m.regarder(vers(a.x + (u2 < 0.25 ? -1 : 1) * 2 * h, a.y - 0.7 * h, 300)));
        m.regarder(null);
        const xs = p.xb + (p.xb < innerWidth / 2 ? 1 : -1) * 1.05 * h;
        await sauter(a, { x: xs, y: yS() }, { hauteur: 0.5 * h, prep: 0.05 });
        surSol(a, a.x);
        await poser(a, "frotter", 0.55);
        m.regardMax = 0.5;
        await Promise.all([animer(f, 0.3, (q) => f.scale.set(1 - 0.3 * q, Math.max(0.01, 1 - q), 1 - 0.3 * q)), disparaitre(a, { gris: true })]);
      }
    },
    s4: {
      rare: true,
      poids: 1,
      duree: "5\u20136 s",
      preparer: (sup) => {
        const h = hMii();
        majSol();
        for (const S of [...melanger(posables(sup).filter((s) => s.r.top > 1.2 * h)), SOL]) {
          const [x0, x1] = segment(S), x = S.sol ? xPresDuBord(2) : (x0 + x1) / 2;
          if (x < 1.5 * h || x > innerWidth - 1.5 * h) continue;
          if (!degage(sup, x - 0.35 * h, x + 0.35 * h, -h, haut(S) - 2, [S])) continue;
          return { cible: S.sol ? null : S, S, x };
        }
        return null;
      },
      jouer: async (a, p) => {
        const S = p.S, h = hMii(), m = a.mii;
        if (!reprendre(S)) return;
        const x = p.x, yS = () => haut(S), r = prendreObjet(a, "o9");
        r.position.set(x, -yS(), a.z + 30);
        a.appui = S;
        a.bord = "dessus";
        a.mode = "appui";
        a.u = x - S.r.left;
        m.capVise = m.cap = 0;
        const base = () => hMii() / m.D.haut;
        const etirer = (k) => {
          m.regler(hMii());
          m.objet.scale.set(base() * (1 - 0.4 * (1 - k)), base() * Math.max(0.01, k), base() * (1 - 0.4 * (1 - k)));
        };
        etirer(0.01);
        await animer(r, 0.22, (q) => {
          const L = yS() * lisseB(q) + 1;
          r.userData.regler(L, 1);
          r.position.y = -L;
        });
        await attendre(a, 0.2, (t) => {
          const q = Math.min(1, t / 0.2), L = yS() * (1 - q) + 1;
          etirer(q);
          r.userData.regler(L, 1 - 0.6 * q);
          r.position.y = -yS();
        });
        etirer(1);
        r.visible = false;
        await poser(a, "atterrir", 0.15, null, 0.03);
        await poser(a, "repos", 0.2, null, 0.1);
        const s = a.x < innerWidth / 2 ? 1 : -1;
        m.capVise = s * Math.PI / 2 * 0.85;
        m.jouer("pointer", { fondu: 0.1 });
        const tir = prendreObjet(a, "o10", 1);
        tir.visible = false;
        await attendre(a, 0.9, (u2) => {
          const b = boutMain(a);
          tir.visible = true;
          tir.position.copy(b);
          tir.position.z = a.z + 200;
          tir.userData.s.scale.setScalar(1 * h * (0.3 + 0.7 * lisseB(u2 / 0.8)) * (0.9 + 0.1 * Math.sin(u2 * 40)));
        });
        tirer(a, tir, s, 9);
        a.u -= s * 0.08 * h;
        await attendre(a, 0.35);
        for (let k = 0; k < 2; k++) {
          const t2 = prendreObjet(a, "o10", 0.45), b = boutMain(a);
          t2.position.set(b.x, b.y, a.z + 200);
          tirer(a, t2, s, 11);
          await attendre(a, 0.22);
        }
        await attendre(a, 0.25);
        face(a);
        m.jouer("repos", { fondu: 0.1 });
        await attendre(a, 0.15);
        r.visible = true;
        await attendre(a, 0.2, (t) => {
          const q = Math.min(1, t / 0.2), L = yS() * q + 1;
          etirer(1 - q);
          r.userData.regler(L, 0.4 + 0.6 * q);
          r.position.y = -yS();
        });
        m.masque = true, m.objet.visible = false;
        await animer(r, 0.2, (q) => {
          const L = yS() * (1 - q) + 1;
          r.userData.regler(L, 1 - 0.5 * q);
          r.position.y = -L;
        });
        etirer(1);
        a.sorti = true;
      }
    },
    s5: {
      rare: true,
      poids: 1,
      duree: "5\u20136 s",
      preparer: () => {
        majSol();
        const h = hMii(), c = Math.random() < 0.5 ? -1 : 1;
        return { cible: null, c, xs: [1.9, 2.9, 3.9, 4.9].map((k) => c < 0 ? k * h : innerWidth - k * h) };
      },
      jouer: async (a, p) => {
        const h = hMii(), m = a.mii, yS = () => haut(SOL), c = p.c;
        const touffes = p.xs.map((x) => {
          const o = prendreObjet(a, "o6");
          o.position.set(x, -yS(), a.z + 25);
          o.scale.setScalar(0.01);
          return o;
        });
        touffes.forEach((o, k) => setTimeout(() => animer(o, 0.15, (q) => o.scale.setScalar(Math.max(0.01, rebond(q)))), k * 60));
        const ep = enMain(a, prendreObjet(a, "o16"), { angle: Math.PI / 2 });
        for (let k = 0; k < touffes.length; k++) {
          const o = touffes[k];
          if (k === 0) await entrerVite(a, o.position.x + c * 0.5 * h, 9);
          else await courirVers(a, o.position.x + c * 0.5 * h, 6);
          m.capVise = -c * Math.PI / 2 * 0.8;
          m.jouer("trancher", { fondu: 0.04, redemarrer: true });
          await attendre(a, 0.14);
          for (let j = 0; j < 6; j++) marque(a, "k4", { x: o.position.x + alea(-0.25, 0.25) * h, y: yS() - alea(0.1, 0.4) * h, vx: alea(-1.1, 1.1), vy: alea(0.9, 1.8), vie: 0.6, taille: 0.2 });
          lacher(a, o);
          await attendre(a, 0.16);
          m.jouer("repos", { fondu: 0.1 });
        }
        const x0 = a.x - c * 0.5 * h, gm = prendreObjet(a, "o5");
        gm.position.set(x0, -(yS() - 0.3 * h), a.z + 60);
        marque(a, "eclat", { x: x0, y: yS() - 0.3 * h, vie: 0.3, taille: 0.5 });
        await courirVers(a, x0, 5);
        face(a);
        lacher(a, ep);
        m.jouer("porter", { fondu: 0.1 });
        surLesMains(a, gm, 0.3);
        await attendre(a, 0.9, () => {
          if (Math.random() < 0.2) marque(a, "eclat", { x: a.x + alea(-0.4, 0.4) * h, y: a.y - alea(1.1, 1.6) * h, vie: 0.4, taille: 0.2 });
        });
        lacher(a, gm);
        marque(a, "eclat", { x: a.x, y: a.y - 1.3 * h, vie: 0.3, taille: 0.6 });
        const ep2 = enMain(a, prendreObjet(a, "o16"), { angle: Math.PI / 2 });
        m.jouer("trancher", { fondu: 0.05, redemarrer: true });
        let t = 0;
        await tache(a, (dt) => {
          t += dt;
          m.cap = m.capVise = -c * Math.PI * 2 * lisseB(t / 0.5);
          if (Math.random() < 0.6) marque(a, "eclat", { x: a.x + Math.cos(t * 14) * 0.8 * h, y: a.y - 0.45 * h + Math.sin(t * 14) * 0.15 * h, vie: 0.25, taille: 0.18 });
          return t >= 0.6;
        });
        m.cap = m.capVise = 0;
        await partirVite(a, 9);
        lacher(a, ep2);
      }
    },
    s6: {
      rare: true,
      poids: 1,
      duree: "5\u20137 s",
      preparer: () => {
        majSol();
        return { cible: null, x: xPresDuBord(2) };
      },
      jouer: async (a, p) => {
        const h = hMii(), m = a.mii, yS = () => haut(SOL), W = innerWidth, c = coteProche(p.x);
        const b = prendreObjet(a, "o3");
        m.masque = true, m.objet.visible = false;
        surSol(a, c < 0 ? -1.2 * h : W + 1.2 * h);
        b.position.set(a.x, -yS(), a.z + 20);
        const avancer = (xBut, v = 3) => {
          let t = 0;
          return tache(a, (dt) => {
            t += dt;
            const d = xBut - b.position.x;
            b.position.x += Math.sign(d) * Math.min(Math.abs(d), v * h * dt);
            b.position.y = -yS() + 0.07 * h * Math.abs(Math.sin(t * 11));
            b.rotation.z = 0.05 * Math.sin(t * 11);
            a.u = b.position.x - SOL.r.left;
            [a.x, a.y] = ancre(SOL, "dessus", a.u);
            return Math.abs(d) < 1;
          });
        };
        await avancer(p.x);
        b.position.y = -yS();
        b.rotation.z = 0;
        await attendre(a, 0.3);
        m.masque = false, m.objet.visible = true;
        m.capVise = m.cap = 0;
        m.jouer("porter", { fondu: 0 });
        for (let i = 0; i < 4; i++) m.maj(1 / 60);
        const y0 = b.position.y;
        let tm = 0;
        b.userData.maj = (dt) => {
          tm += dt;
          const k = lisseB(tm / 0.25);
          m.objet.updateMatrixWorld(true);
          vA.setFromMatrixPosition(m.os[6].matrixWorld);
          vB.setFromMatrixPosition(m.os[9].matrixWorld);
          const yMains = (vA.y + vB.y) / 2 + 0.32 * h;
          b.position.y = y0 + (yMains - y0) * k;
          return true;
        };
        await attendre(a, 0.3);
        await attendre(a, 1, (u2) => {
          m.regarder(vers(a.x + (u2 < 0.5 ? -2 : 2) * h, a.y - 0.5 * h, 300));
        });
        m.regarder(null);
        tm = 0;
        const yh = b.position.y;
        b.userData.maj = (dt) => {
          tm += dt;
          b.position.y = yh + (y0 - yh) * lisseB(tm / 0.2);
          return true;
        };
        await attendre(a, 0.22);
        b.userData.maj = null;
        b.position.y = y0;
        m.masque = true, m.objet.visible = false;
        await attendre(a, 0.2);
        await avancer(c < 0 ? -1.5 * h : W + 1.5 * h, 4);
        a.sorti = true;
      }
    },
    s7: {
      rare: true,
      poids: 1,
      duree: "5\u20137 s",
      preparer: (sup) => {
        const h = hMii();
        majSol();
        const yS = haut(SOL);
        for (const R of melanger(sup.filter((x) => x.genre === "tuile" && !reserve(x)))) {
          const cx = centre(R)[0];
          if (yS - R.r.bottom < 1.3 * h) continue;
          if (!degage(sup, cx - 0.45 * h, cx + 0.45 * h, R.r.bottom + 2, yS - 2, [R])) continue;
          for (const c of melanger([-1, 1])) {
            const px = cx + c * 1.05 * h;
            if (px < h || px > innerWidth - h) continue;
            if (!degage(sup, px - 0.65 * h, px + 0.65 * h, yS - 1.35 * h, yS - 2)) continue;
            return { cible: R, cx, px };
          }
        }
        return null;
      },
      jouer: async (a, p) => {
        const R = p.cible, h = hMii(), m = a.mii, yS = () => haut(SOL), cx = p.cx, px = p.px;
        const tu = prendreObjet(a, "o17");
        tu.position.set(px, -yS(), a.z);
        tu.userData.sortir(0.01);
        m.masque = true, m.objet.visible = false;
        await animer(tu, 0.25, (q) => tu.userData.sortir(rebond(q)));
        const yHaut = () => yS() - tu.userData.haut;
        a.mode = "libre";
        a.x = px;
        a.y = yHaut() + 1.1 * h;
        m.capVise = m.cap = 0;
        m.masque = false, m.objet.visible = true;
        m.jouer("victoire", { fondu: 0 });
        await attendre(a, 0.25, (t) => {
          a.y = yHaut() + 1.1 * h - 1.3 * h * lisseB(t / 0.25);
        });
        await sauter(a, { x: cx, y: yS() }, { prep: 0, hauteur: 0.3 * h });
        surSol(a, cx);
        m.capVise = 0;
        for (let n = 0; n < 2; n++) {
          const yb = yS(), yt = R.r.bottom + 1.02 * h;
          m.saut = { ph: "prep", q: 0 };
          m.jouer("sauter", { fondu: 0.06, redemarrer: true });
          await attendre(a, 0.1, (t2) => {
            m.saut.q = t2 / 0.1;
          });
          m.saut = null;
          m.jouer("victoire", { fondu: 0.05, redemarrer: true });
          a.mode = "libre";
          a.appui = null;
          let t = 0;
          await tache(a, (dt) => {
            t += dt;
            const q = Math.min(1, t / 0.2);
            a.y = yb - (yb - yt) * Math.sin(q * Math.PI / 2);
            return q >= 1;
          });
          reagir(R, "rebond");
          const pc = prendreObjet(a, "o7"), y0 = R.r.top;
          pc.position.set(cx, -y0, a.z + 260);
          let u2 = 0;
          const tourner = pc.userData.maj;
          pc.userData.maj = (dt) => {
            tourner(dt);
            u2 += dt;
            pc.position.y = -(y0 - 1.1 * h * Math.sin(Math.min(1, u2 / 0.4) * Math.PI / 2) + (u2 > 0.5 ? (u2 - 0.5) * 0.5 * h : 0));
            pc.scale.setScalar(u2 > 0.65 ? Math.max(0.01, 1 - (u2 - 0.65) / 0.2) : 1);
            if (u2 > 0.82 && u2 < 0.86) marque(a, "eclat", { x: cx, y: y0 - 1.1 * h, vie: 0.25, taille: 0.35 });
            return u2 < 0.85;
          };
          t = 0;
          await tache(a, (dt) => {
            t += dt;
            a.y = yt + (yb - yt) * Math.min(1, (t / 0.22) ** 2);
            return t >= 0.22;
          });
          surSol(a, cx);
          m.jouer("repos", { fondu: 0.08 });
          await attendre(a, 0.22);
        }
        await sauter(a, { x: px, y: yHaut() }, { prep: 0.06, hauteur: 0.4 * h });
        a.mode = "libre";
        a.x = px;
        a.y = yHaut();
        m.capVise = 0;
        m.jouer("victoire", { fondu: 0.1 });
        await attendre(a, 0.28, (t) => {
          a.y = yHaut() + 1.15 * h * lisseB(t / 0.28);
        });
        m.masque = true, m.objet.visible = false;
        await animer(tu, 0.2, (q) => tu.userData.sortir(1 - q));
        lacher(a, tu);
        a.sorti = true;
      }
    },
    s8: {
      rare: true,
      poids: 1,
      duree: "4\u20136 s",
      preparer: () => {
        majSol();
        return { cible: null, x: xPresDuBord(4) };
      },
      jouer: async (a, p) => {
        const h = hMii(), m = a.mii, yS = () => haut(SOL);
        await entrerVite(a, p.x, 8);
        const s = a.x < innerWidth / 2 ? 1 : -1;
        for (let k = 0; k < 2; k++) {
          m.viser(s, 0);
          await sauter(a, { x: a.x + s * 1.1 * h, y: yS() }, { hauteur: 1.5 * h, salto: -1, prep: 0.08 });
          surSol(a, a.x);
        }
        await poser(a, "atterrir", 0.35, null, 0.04);
        await poser(a, "repos", 0.2, null, 0.1);
        face(a);
        await poser(a, "brasTendus", 0.5, null, 0.1);
        const c = a.x < innerWidth / 2 ? -1 : 1;
        m.viser(c, 0);
        m.jouer("ange", { fondu: 0.1 });
        a.mode = "libre";
        a.appui = null;
        let vx = c * 6 * h, vy = -4 * h;
        await tache(a, (dt) => {
          vy += 12 * h * dt;
          a.x += vx * dt;
          a.y += vy * dt;
          m.salto.rotation.x = Math.min(1.4, Math.max(0, vy / (6 * h)));
          return a.x < -1.5 * h || a.x > innerWidth + 1.5 * h || a.y > innerHeight + h;
        });
        m.salto.rotation.x = 0;
        a.sorti = true;
      }
    },
    s9: {
      rare: true,
      poids: 1,
      duree: "5\u20136 s",
      preparer: () => {
        majSol();
        return { cible: null, x: xPresDuBord(3) };
      },
      jouer: async (a, p) => {
        const h = hMii(), m = a.mii, yS = () => haut(SOL);
        const pi = enMain(a, prendreObjet(a, "o12"), { angle: Math.PI * 0.35 });
        await entrerVite(a, p.x, 7);
        const s = a.x < innerWidth / 2 ? 1 : -1, xb = a.x + s * 0.8 * h;
        m.capVise = s * Math.PI / 2 * 0.8;
        const b = prendreObjet(a, "o13");
        b.position.set(xb, -yS(), a.z - 10);
        nuage(a, xb, yS(), 4);
        await animer(b, 0.12, (q) => b.scale.setScalar(Math.max(0.01, rebond(q))));
        for (let k = 0; k < 4; k++) {
          m.jouer("frapper", { fondu: 0.04, redemarrer: true });
          pi.userData.angle = Math.PI * 0.1;
          await attendre(a, 0.2);
          pi.userData.angle = Math.PI * 0.35;
          b.userData.fissures(k);
          for (let j = 0; j < 3; j++) marque(a, "k7", { x: xb + alea(-0.25, 0.25) * h, y: yS() - alea(0.1, 0.5) * h, vx: alea(-0.7, 0.7), vy: alea(0.4, 1.2), vie: 0.5, taille: 0.16 });
          await attendre(a, 0.14);
        }
        lacher(a, b);
        for (let j = 0; j < 8; j++) marque(a, "k7", { x: xb + alea(-0.3, 0.3) * h, y: yS() - alea(0.1, 0.5) * h, vx: alea(-1, 1), vy: alea(0.6, 1.6), vie: 0.6, taille: 0.2 });
        const mini = prendreObjet(a, "o13");
        mini.scale.setScalar(0.35);
        mini.position.set(xb, -(yS() - 0.25 * h), a.z + 20);
        let t = 0;
        await tache(a, (dt) => {
          t += dt;
          mini.rotation.y += dt * 3;
          const q = Math.max(0, (t - 0.45) / 0.25);
          mini.position.x = xb + (a.x - xb) * lisseB(q);
          mini.position.y = -(yS() - 0.25 * h - 0.06 * h * Math.sin(t * 6) + 0.1 * h * lisseB(q));
          return t >= 0.7;
        });
        lacher(a, mini);
        marque(a, "eclat", { x: a.x, y: a.y - 0.5 * h, vie: 0.25, taille: 0.35 });
        m.jouer("repos", { fondu: 0.1 });
        await attendre(a, 0.2);
        await partirVite(a, 7);
        lacher(a, pi);
      }
    },
    s10: {
      rare: true,
      poids: 1,
      duree: "4\u20136 s",
      preparer: () => {
        majSol();
        return { cible: null, x: xPresDuBord(3) };
      },
      jouer: async (a, p) => {
        const h = hMii(), m = a.mii, yS = () => haut(SOL);
        const ep = fixer(a, prendreObjet(a, "o11"), 2, [-0.12, 0.5, -0.2], [0, 0, Math.PI + 0.5]);
        await entrerVite(a, p.x, 8);
        const s = a.x < innerWidth / 2 ? 1 : -1;
        m.capVise = s * Math.PI / 2 * 0.6;
        m.bras = "haut";
        await attendre(a, 0.2);
        m.bras = null;
        enMain(a, ep, { angle: 0, avance: 0.02 });
        m.jouer("brandir", { fondu: 0.1 });
        await attendre(a, 0.25);
        a.mode = "libre";
        a.appui = null;
        const x0 = a.x;
        let t = 0;
        await tache(a, (dt) => {
          t += dt;
          const q = Math.min(1, t / 0.55);
          a.x = x0 + s * 0.5 * h * q;
          a.y = yS() - 2.2 * h * 4 * q * (1 - q);
          if (q > 0.7 && m.anim !== "projeter") m.jouer("projeter", { fondu: 0.08, redemarrer: true });
          return q >= 1;
        });
        surSol(a, a.x);
        m.jouer("projeter", { fondu: 0 });
        for (let k = 0; k < 8; k++) marque(a, "poussiere", { x: a.x + s * alea(0.4, 1.2) * h, y: yS() - alea(0, 0.2) * h, vx: alea(-1.2, 1.2), vy: alea(0.1, 0.6), vie: 0.5, taille: 0.4 });
        for (const d of [1, -1]) {
          const o = sprite(texMarque("k9"), 1.1 * h);
          o.renderOrder = 21;
          o.center.set(0.5, 0);
          o.position.set(a.x + s * 0.9 * h, -yS(), 700);
          scene.add(o);
          a.objets.push(o);
          let u2 = 0;
          o.userData.maj = (dt) => {
            u2 += dt;
            o.position.x += d * 7 * h * dt;
            o.material.opacity = Math.max(0, 1 - u2 / 0.7);
            if (d < 0) o.scale.x = -1.1 * h;
            return u2 < 0.7;
          };
        }
        await attendre(a, 0.45);
        m.jouer("repos", { fondu: 0.15 });
        await attendre(a, 0.15);
        m.bras = "haut";
        await attendre(a, 0.2);
        m.bras = null;
        ep.userData.maj = null;
        fixer(a, ep, 2, [-0.12, 0.5, -0.2], [0, 0, Math.PI + 0.5]);
        face(a);
        await attendre(a, 0.15);
        await partirVite(a, 9, { trainee: true });
        lacher(a, ep);
      }
    },
    s11: {
      rare: true,
      poids: 1,
      duree: "5\u20137 s",
      preparer: () => {
        majSol();
        return { cible: null, x: xPresDuBord(3) };
      },
      jouer: async (a, p) => {
        const h = hMii(), m = a.mii, yS = () => haut(SOL), c = coteProche(p.x), s = -c;
        const b = prendreObjet(a, "o14");
        m.masque = true, m.objet.visible = false;
        surSol(a, c < 0 ? -1.2 * h : innerWidth + 1.2 * h);
        b.position.set(a.x, -(yS() - b.userData.rayon), a.z + 10);
        const rouler = (xBut, v) => tache(a, (dt) => {
          const d = xBut - a.x;
          a.u += Math.sign(d) * Math.min(Math.abs(d), v * h * dt);
          [a.x, a.y] = ancre(SOL, "dessus", a.u);
          b.position.x = a.x;
          b.position.y = -(yS() - b.userData.rayon);
          b.userData.rouler(dt * v * h / b.userData.rayon * Math.sign(d || 1));
          return Math.abs(d) < 1;
        });
        await rouler(p.x, 7);
        const bo = prendreObjet(a, "o15");
        bo.scale.setScalar(0.5);
        bo.position.set(a.x, -yS(), a.z + 5);
        await rouler(a.x + s * 0.55 * h, 3);
        await attendre(a, 0.35, (u2) => bo.userData.rougir(Math.sin(u2 * 40) > 0 ? 1 : 0));
        const xb = bo.position.x;
        lacher(a, bo);
        marque(a, "k5", { x: xb, y: yS() - 0.25 * h, vie: 0.4, taille: 0.9 });
        a.mode = "libre";
        a.appui = null;
        let t = 0;
        await tache(a, (dt) => {
          t += dt;
          const q = Math.min(1, t / 0.32);
          a.x += s * 2 * h * dt;
          a.y = yS() - 1.4 * h * Math.sin(q * Math.PI / 2);
          b.position.set(a.x, -(a.y - b.userData.rayon), a.z + 10);
          b.userData.rouler(dt * 12 * s);
          return q >= 1;
        });
        m.masque = false, m.objet.visible = true;
        m.capVise = m.cap = s * Math.PI / 2 * 0.85;
        m.jouer("tomber", { fondu: 0 });
        marque(a, "eclat", { x: a.x, y: a.y - 0.4 * h, vie: 0.3, taille: 1 });
        await attendre(a, 0.12, (u2) => {
          echelleMii(a, 0.2 + 0.8 * u2 / 0.12);
          b.scale.setScalar(Math.max(0.01, 1 - u2 / 0.12));
        });
        echelleMii(a, 1);
        lacher(a, b);
        t = 0;
        const ya = a.y;
        await tache(a, (dt) => {
          t += dt;
          a.y = ya + (yS() - ya) * Math.min(1, (t / 0.3) ** 2);
          return t >= 0.3;
        });
        surSol(a, a.x);
        await poser(a, "atterrir", 0.2, null, 0.04);
        m.jouer("pointer", { fondu: 0.1 });
        const tir = prendreObjet(a, "o10", 1);
        tir.userData.s.material.color.setRGB(0.7, 1, 0.7);
        await attendre(a, 0.7, (u2) => {
          const bm = boutMain(a);
          tir.position.copy(bm);
          tir.position.z = a.z + 200;
          tir.userData.s.scale.setScalar(0.95 * h * (0.3 + 0.7 * lisseB(u2 / 0.6)));
        });
        tirer(a, tir, s, 9);
        await attendre(a, 0.35);
        m.jouer("repos", { fondu: 0.1 });
        const b2 = prendreObjet(a, "o14");
        b2.position.set(a.x, -(yS() - b2.userData.rayon), a.z + 10);
        b2.scale.setScalar(0.01);
        await attendre(a, 0.12, (u2) => {
          b2.scale.setScalar(Math.max(0.01, u2 / 0.12));
          echelleMii(a, 1 - u2 / 0.12);
        });
        m.masque = true, m.objet.visible = false;
        echelleMii(a, 1);
        const fin = a.x < innerWidth / 2 ? -1.5 * h : innerWidth + 1.5 * h;
        await tache(a, (dt) => {
          const d = fin - a.x;
          a.u += Math.sign(d) * 9 * h * dt;
          [a.x, a.y] = ancre(SOL, "dessus", a.u);
          b2.position.x = a.x;
          b2.userData.rouler(dt * 9 * h / b2.userData.rayon * Math.sign(d));
          return Math.abs(d) < 9 * h * dt + 1;
        });
        a.sorti = true;
      }
    },
    s12: {
      rare: true,
      poids: 1,
      duree: "3\u20134 s",
      preparer: () => {
        majSol();
        return { cible: null, x: xPresDuBord(2) };
      },
      jouer: async (a, p) => {
        const h = hMii(), m = a.mii;
        await entrerVite(a, p.x, 8);
        const s = a.x < innerWidth / 2 ? 1 : -1;
        m.capVise = s * Math.PI / 2 * 0.7;
        await poser(a, "garde", 0.35, null, 0.1);
        m.jouer("charger", { fondu: 0.1 });
        const bo = prendreObjet(a, "o10", 0.5, "o10b");
        bo.userData.s.material.color.setRGB(0.55, 0.8, 1);
        const milieu = () => {
          m.objet.updateMatrixWorld(true);
          vA.setFromMatrixPosition(m.os[6].matrixWorld);
          vB.setFromMatrixPosition(m.os[9].matrixWorld);
          return vA.clone().add(vB).multiplyScalar(0.5);
        };
        await attendre(a, 0.5, (u2) => {
          const c2 = milieu();
          bo.position.set(c2.x, c2.y, a.z + 200);
          bo.userData.s.scale.setScalar(0.6 * h * (0.25 + 0.75 * lisseB(u2 / 0.45)) * (0.9 + 0.1 * Math.sin(u2 * 50)));
        });
        m.jouer("projeter", { fondu: 0.04 });
        await attendre(a, 0.06);
        const c = milieu();
        bo.position.set(c.x + s * 0.45 * h, -(a.y - 0.55 * h), a.z + 200);
        bo.userData.s.scale.setScalar(1 * h);
        tirer(a, bo, s, 8);
        await attendre(a, 0.45);
        await poser(a, "garde", 0.3, null, 0.12);
        face(a);
        await partirVite(a, 8);
      }
    },
    s13: {
      rare: true,
      poids: 1,
      duree: "4\u20136 s",
      preparer: () => {
        majSol();
        const h = hMii(), c = Math.random() < 0.5 ? -1 : 1;
        return { cible: null, c, x: c < 0 ? 4.2 * h : innerWidth - 4.2 * h };
      },
      jouer: async (a, p) => {
        const h = hMii(), m = a.mii, yS = () => haut(SOL), c = p.c;
        await entrerVite(a, p.x, 8);
        face(a);
        await poser(a, "deposer", 0.3, null, 0.08);
        const bo = prendreObjet(a, "o15");
        bo.position.set(a.x, -yS(), a.z + 30);
        await animer(bo, 0.12, (q) => bo.scale.setScalar(Math.max(0.01, rebond(q))));
        const meche = setInterval(() => marque(a, "eclat", { x: bo.position.x + bo.userData.meche.x, y: -(bo.position.y + bo.userData.meche.y), vy: 0.5, vx: alea(-0.3, 0.3), vie: 0.2, taille: 0.16 }), 70);
        await courirVers(a, a.x + c * 2.6 * h, 8);
        m.capVise = -c * Math.PI / 2 * 0.6;
        m.jouer("peur", { fondu: 0.08 });
        await attendre(a, 0.55, (u2) => {
          bo.userData.rougir(Math.sin(u2 * 50) > 0 ? 1 : 0);
          bo.scale.setScalar(1 + 0.12 * Math.sin(u2 * 50));
        });
        clearInterval(meche);
        const xb = bo.position.x;
        lacher(a, bo);
        marque(a, "k5", { x: xb, y: yS() - 0.45 * h, vie: 0.65, taille: 1.4 });
        for (let k = 1; k <= 3; k++) for (const d of [-1, 1]) setTimeout(() => marque(a, "k5", { x: xb + d * k * 0.6 * h, y: yS() - 0.4 * h, vie: 0.5, taille: 1 }), k * 55);
        for (let k = 1; k <= 3; k++) setTimeout(() => marque(a, "k5", { x: xb, y: yS() - (0.45 + k * 0.6) * h, vie: 0.5, taille: 1 }), k * 55);
        await attendre(a, 0.7);
        face(a);
        await poser(a, "content", 0.7);
        await partirVite(a, 8);
      }
    },
    // ===== scènes des autres pages du thème (7/10) : chacune faite pour les éléments réels de sa page =====
    // — Notifications —
    // le facteur : il apporte une lettre, monte sur une notification, l'y dépose (elle s'y enfonce dans un éclat), salue
    facteur: {
      pages: ["notifs"],
      poids: 2.4,
      duree: "9\u201312 s",
      preparer: (sup) => avecChemin({ sup, l: posables(sup).filter((s) => s.el.matches("#pcv-notifs .n")).slice(0, 3) }, (T2) => (s) => s === T2),
      jouer: async (a, p) => {
        const T2 = p.cible, h = hMii();
        const env = prendreObjet(a, "enveloppe");
        tenir(a, env, "d", { dy: -0.02, dz: 14, rz: 0.15 });
        a.mii.bras = "tenir";
        await allerA(a, p.chemin, alea(0.25, 0.45));
        face(a);
        bulle(a, "exclam", 0.9);
        await poser(a, "repos", 0.5, null, 0.1);
        a.mii.bras = null;
        await poser(a, "accroupi", 0.3, null, 0.12);
        tenir(a, null);
        const xa = a.x + 0.5 * h, ya = () => haut(T2) - 0.15 * h;
        await trajet(env, [env.position.x, -env.position.y], [xa, ya()], 0.2 * h, 0.3);
        reagir(T2, "choc");
        env.userData.maj = () => {
          if (reprendre(T2)) env.position.y = -ya();
          return true;
        };
        await poser(a, "repos", 0.3, null, 0.12);
        a.mii.bras = "salut";
        a.mii.expression("joie");
        await attendre(a, 1.3);
        a.mii.bras = null;
        a.mii.expression(null);
        marque(a, "eclat", { x: xa, y: ya(), vie: 0.45, taille: 0.6 });
        lacher(a, env);
        reagir(T2, "ecrase");
        await poser(a, "content", 1);
      }
    },
    // la lecture : assis sur une notification, il se penche pour la lire, réagit (bulle), puis reste un moment
    lecteur: {
      pages: ["notifs"],
      poids: 2.2,
      duree: "9\u201312 s",
      preparer: (sup) => avecChemin({ sup, l: posables(sup).filter((s) => s.el.matches("#pcv-notifs .n")) }, (T2) => (s) => s === T2),
      jouer: async (a, p) => {
        const T2 = p.cible, h = hMii();
        await allerA(a, p.chemin, alea(0.3, 0.6));
        face(a);
        const titre = () => (T2.el.querySelector("b") || T2.el).getBoundingClientRect();
        a.mii.sens = 0;
        a.mii.jouer("pencher", { fondu: 0.16, redemarrer: true });
        await attendre(a, 2.4, () => {
          const r = titre();
          a.mii.regarder(vers((r.left + r.right) / 2, (r.top + r.bottom) / 2, 200));
        });
        a.mii.regarder(null);
        await poser(a, "repos", 0.25, null, 0.12);
        const ic = ["coeur", "manette", "etoile", "exclam"][Math.floor(Math.random() * 4)];
        bulle(a, ic, 1.5);
        reagir(T2, "choc");
        await poser(a, ic === "exclam" ? "content" : "applaudir", 1.2);
        a.mii.capVise = alea(-0.45, 0.45);
        a.mii.jouer("assis", { fondu: 0.25 });
        await attendre(a, alea(3, 4.5), (t, dt) => vivote(a, dt));
        await poser(a, "repos", 0.3);
      }
    },
    // la sonnette : il saute s'accrocher sous la cloche de la barre et la fait sonner (elle tremble, des notes s'envolent)
    sonnette: {
      pages: ["notifs"],
      poids: 2,
      duree: "8\u201311 s",
      preparer: (sup) => {
        const h = hMii(), R = sup.find((s) => s.genre === "rond" && s.el.dataset?.pcvRond === "notifs" && !reserve(s));
        if (!R) return null;
        const cx = centre(R)[0], chemin2 = planifier(sup, (s) => {
          if (!s.g.dessus || s.genre === "bulle" || s.sol) return false;
          const [x0, x1] = segment(s), dy = s.r.top - R.r.bottom;
          return cx > x0 && cx < x1 && dy > 0.35 * h && dy < 2.4 * h;
        });
        return chemin2 ? { cible: R, chemin: chemin2 } : null;
      },
      jouer: async (a, p) => {
        const R = p.cible, h = hMii();
        await parcourir(a, p.chemin);
        if (!reprendre(R)) return;
        const cx = centre(R)[0];
        await marcher(a, cx - a.appui.r.left);
        a.mii.capVise = 0;
        a.mii.expression("joie");
        await sauter(a, { s: R, bord: "dessous", u: cx - R.r.left }, { hauteur: 0.12 * h, face: true });
        reagir(R, "accroche");
        let son = 0;
        await attendre(a, 2.6, (t) => {
          a.mii.amplitude = 2.2;
          if (t - son > 0.32) {
            son = t;
            reagir(R, "tremble");
            marque(a, "note", { x: cx + alea(-0.5, 0.5) * h, y: R.r.top, vy: 0.6, vx: alea(-0.35, 0.35), vie: 1, taille: 0.2 });
          }
        });
        a.mii.expression(null);
        await chuter(a);
        a.mii.regarder(null);
        await geste(a, "content", 1.2);
      }
    },
    // — Amis —
    // la visite : il monte sur la tuile d'un ami, regarde son avatar, toque (la tuile tremble), lui fait signe
    visite: {
      pages: ["amis"],
      poids: 2.4,
      duree: "8\u201310 s",
      preparer: (sup) => avecChemin({ sup, l: posables(sup).filter((s) => s.el.matches("#pcv-amis .ami")) }, (T2) => (s) => s === T2),
      jouer: async (a, p) => {
        const T2 = p.cible, h = hMii();
        await allerA(a, p.chemin, alea(0.3, 0.7));
        face(a);
        const av = () => (T2.el.querySelector(".av img") || T2.el).getBoundingClientRect();
        a.mii.sens = 0;
        a.mii.jouer("pencher", { fondu: 0.16, redemarrer: true });
        await attendre(a, 1.5, () => {
          const r = av();
          a.mii.regarder(vers((r.left + r.right) / 2, (r.top + r.bottom) / 2, 200));
        });
        a.mii.regarder(null);
        await poser(a, "repos", 0.2, null, 0.1);
        let toc = 0;
        await poser(a, "frapper", 1.15, (t) => {
          const n = Math.floor((t + 0.1) * 2.6);
          if (n > toc && n <= 2) {
            toc = n;
            reagir(T2, "tremble");
          }
        });
        face(a);
        bulle(a, Math.random() < 0.5 ? "coeur" : "note", 1.5);
        a.mii.bras = "salut";
        a.mii.expression("joie");
        await attendre(a, 1.5);
        a.mii.bras = null;
        a.mii.expression(null);
        await poser(a, "content", 0.9);
      }
    },
    // — Thèmes —
    // le critique : il s'installe sur la vitrine, se penche sur l'aperçu du thème, puis donne son avis (étoile ou cœur)
    critique: {
      pages: ["themes"],
      poids: 2.4,
      duree: "9\u201312 s",
      preparer: (sup) => avecChemin({ sup, l: sup.filter((s) => s.genre === "vitrine" && !reserve(s)) }, (V2) => (s) => s === V2),
      jouer: async (a, p) => {
        const V2 = p.cible, h = hMii();
        await allerA(a, p.chemin, alea(0.2, 0.8));
        face(a);
        a.mii.capVise = alea(-0.4, 0.4);
        a.mii.jouer("assis", { fondu: 0.3 });
        await attendre(a, 1.8, (t, dt) => regarderAutour(a, dt));
        const ec = () => V2.el.querySelector(".ecran")?.getBoundingClientRect() || V2.r;
        await poser(a, "repos", 0.3);
        a.mii.sens = 0;
        a.mii.jouer("pencher", { fondu: 0.16, redemarrer: true });
        a.mii.bras = "visiere";
        await attendre(a, 2, () => {
          const r = ec();
          a.mii.regarder(vers((r.left + r.right) / 2, (r.top + r.bottom) / 2, 200));
        });
        a.mii.bras = null;
        a.mii.regarder(null);
        await poser(a, "repos", 0.25, null, 0.12);
        bulle(a, Math.random() < 0.6 ? "etoile" : "coeur", 1.5);
        reagir(V2, "choc");
        await poser(a, "applaudir", 1.3);
      }
    },
    // la marelle : il saute de pastille de couleur en pastille de couleur (chacune s'écrase sous ses pieds), puis salue
    marelle: {
      pages: ["themes"],
      poids: 2.2,
      duree: "8\u201311 s",
      preparer: (sup) => {
        const l = sup.filter((s) => s.genre === "pastille").sort((x, y) => x.r.left - y.r.left);
        if (l.length < 3) return null;
        const sens = Math.random() < 0.5, suite = sens ? l : [...l].reverse(), c = chemin(sup, suite[0]);
        return c ? { cible: suite[0], suite, chemin: c } : null;
      },
      jouer: async (a, p) => {
        const h = hMii();
        await allerA(a, p.chemin, 0.5);
        face(a);
        await poser(a, "content", 0.5);
        for (const P of p.suite.slice(1)) {
          if (!reprendre(P)) break;
          const [x0, x1] = segment(P);
          await sauter(a, { s: P, bord: "dessus", u: (x0 + x1) / 2 - P.r.left }, { hauteur: 0.55 * h, prep: 0.1 });
        }
        face(a);
        bulle(a, "etoile", 1.1);
        await poser(a, "saluer", 1.1);
      }
    },
    // le peintre : il apporte un pinceau sur une carte de l'étagère, le trempe dans la pastille de couleur du thème (le
    // point coloré de la carte), puis repeint la carte à grands coups (taches de cette couleur, la carte brille) et
    // s'essuie le front
    peintre: {
      pages: ["themes"],
      poids: 2.2,
      duree: "12\u201315 s",
      preparer: (sup) => avecChemin({ sup, l: posables(sup).filter((s) => s.el.matches("#pcv-themes .carte") && s.el.querySelector(".nm i")) }, (C) => (s) => s === C),
      jouer: async (a, p) => {
        const C = p.cible, h = hMii();
        const pi = prendreObjet(a, "pinceau");
        tenir(a, pi, "d", { dy: 0.02, rz: 0.2 });
        a.mii.bras = "tenir";
        await parcourir(a, p.chemin);
        if (!reprendre(C)) return;
        const point = C.el.querySelector(".nm i"), rp = point.getBoundingClientRect(), st = getComputedStyle(point);
        const m = /rgba?\([^)]*\)|#[0-9a-f]{3,8}/i.exec(st.backgroundColor !== "rgba(0, 0, 0, 0)" ? st.backgroundColor : st.backgroundImage), couleur = m ? m[0] : "#2fb8ff";
        const [c0, c1] = segment(C);
        await marcher(a, borne((rp.left + rp.right) / 2, c0, c1) - C.r.left);
        face(a);
        a.mii.sens = 0;
        a.mii.jouer("pencher", { fondu: 0.16, redemarrer: true });
        a.mii.regarder(vers((rp.left + rp.right) / 2, (rp.top + rp.bottom) / 2, 200));
        await attendre(a, 0.8);
        a.mii.regarder(null);
        a.mii.bras = null;
        await poser(a, "accroupi", 0.45, null, 0.12);
        pi.userData.teinter(couleur);
        reagir(C, "ecrase");
        marque(a, "tache", { x: a.x + 0.3 * h, y: a.y - 0.05 * h, vy: 0.3, vie: 0.5, taille: 0.16, couleur });
        await poser(a, "repos", 0.2);
        a.mii.bras = "tenir";
        const [x0, x1] = segment(C);
        for (const f of [0.3, 0.7]) {
          await marcher(a, x0 + (x1 - x0) * f - C.r.left);
          const s = Math.random() < 0.5 ? -1 : 1;
          let pf = 0;
          a.mii.capVise = s * 0.5;
          a.mii.bras = null;
          tenir(a, pi, "deux", { dy: -0.02, rz: s * 0.6 });
          await poser(a, "balayer", 1.3, (t, dt) => {
            pf -= dt;
            if (pf <= 0) {
              pf = 0.3;
              marque(a, "tache", { x: a.x + s * alea(0.35, 0.6) * h, y: haut(C) + alea(0.1, 0.5) * h, vie: 0.9, taille: alea(0.12, 0.2), couleur });
            }
          }, 0.14);
          tenir(a, pi, "d", { dy: 0.02, rz: 0.2 });
          a.mii.bras = "tenir";
        }
        reagir(C, "choc");
        face(a);
        for (let k = 0; k < 3; k++) marque(a, "eclat", { x: alea(C.r.left + 8, C.r.right - 8), y: C.r.top + alea(0.15, 0.7) * C.r.height, vie: 0.8, taille: 0.2 });
        marque(a, "goutte", { x: a.x + 0.3 * h, y: a.y - 1.15 * h, vy: -0.25, vie: 0.9, taille: 0.18 });
        await poser(a, "content", 1);
      }
    }
  };
  const AILLEURS = {
    assis: ["notifs", "amis", "themes"],
    suspendu: ["notifs", "amis", "themes"],
    promenade: ["notifs", "amis", "themes"],
    causette: ["amis"],
    ballon: ["amis"],
    photo: ["amis", "themes"],
    perche: ["amis"],
    rebond: ["notifs"],
    danse: ["themes"]
  };
  const pagesDe = (n) => SCENES[n].pages || ["accueil", ...AILLEURS[n] || []];
  const SUITES = {
    touche: async (a) => {
      if (a.mode === "appui" && (a.bord === "dessus" || a.bord === "derriere")) {
        a.mii.expression("joie");
        await sauter(a, { s: a.appui, bord: "dessus", u: a.u }, { hauteur: 0.9 * hMii() });
        a.cache = null;
      } else if (a.mode === "appui") await chuter(a);
      a.mii.expression(null);
      a.mii.capVise = 0;
      a.mii.regarder(null);
      await geste(a, "saluer", 1.6);
      a.touche = false;
    },
    chute: async (a) => {
      await chuter(a);
      if (a.sorti) return;
      await geste(a, Math.random() < 0.5 ? "hausser" : "saluer", 1.1);
    },
    place: async () => {
    },
    partenaire: async () => {
    }
    // dans une scène à deux, l'autre a été dérangé : chacun s'en va de son côté
  };
  const vivre = async (a, jouer) => {
    let suite = () => jouer(a);
    for (let n = 0; n < 12 && !a.fini && !a.sorti; n++) {
      try {
        await suite();
        suite = () => sortir(a);
      } catch (e) {
        if (a.fini) break;
        a.mii.bras = null;
        a.mii.expression(null);
        a.cacheJusqua = null;
        finGrimper(a);
        const r = e.message;
        suite = SUITES[r] ? async () => {
          await SUITES[r](a);
          await sortir(a);
        } : () => sortir(a);
      }
    }
    if (!a.fini) retirer(a);
    if (!acteurs.length) arreterBoucle();
  };
  const CLE_RECENTES = "pcv-mii-scenes-recentes";
  let recentes = lire(CLE_RECENTES, []);
  if (!Array.isArray(recentes)) recentes = [];
  const noter = (n) => {
    recentes = [n, ...recentes.filter((x) => x !== n)].slice(0, 8);
    try {
      localStorage.setItem(CLE_RECENTES, JSON.stringify(recentes));
    } catch (e) {
    }
  };
  const poidsDe = (n) => {
    const i = recentes.indexOf(n), p = SCENES[n].poids;
    return i === 0 ? 0 : i > 0 && i < 3 ? p * 0.2 : i >= 3 && i < 6 ? p * 0.5 : p;
  };
  const tirage = (noms) => {
    const l = noms.map((n) => [n, poidsDe(n)]).filter((x) => x[1] > 0), out = [];
    while (l.length) {
      let r = Math.random() * l.reduce((s, x) => s + x[1], 0), k = 0;
      for (; k < l.length - 1; k++) {
        r -= l[k][1];
        if (r <= 0) break;
      }
      out.push(l.splice(k, 1)[0][0]);
    }
    return out;
  };
  const vivants = () => acteurs.filter((a) => !a.sorti).length;
  const lancerScene = (nom, cible, qui) => {
    if (!pret() || !preparerRendu()) return null;
    const sup = [...lireSupports()];
    sup.forcer = cible;
    const noms = nom ? [nom] : tirage(Object.keys(SCENES).filter((n) => !SCENES[n].surEvenement && !SCENES[n].rare && pagesDe(n).includes(pageCourante)));
    for (const n of noms) {
      const sc = SCENES[n];
      if (!sc) continue;
      if (sc.duo && !nom && vivants() + 2 > Math.max(2, REG.max)) continue;
      let plan = null;
      try {
        plan = sc.preparer(sup);
      } catch (e) {
        console.warn("mii-accueil", n, e);
      }
      if (!plan) continue;
      placerToile();
      let a, b = null;
      try {
        a = qui && typeof qui === "object" ? creerActeur(null, qui) : creerActeur(qui);
        if (sc.duo) b = creerActeur();
      } catch (e) {
        console.warn("mii-accueil : Mii refus\xE9 par le moteur", e);
        if (a) retirer(a);
        return null;
      }
      a.nom = n;
      a.cible = plan.cible?.cle || null;
      if (!sc.rare) noter(n);
      for (const c of acteurs) if (c !== a && c !== b) c.regardT = 0;
      if (b) {
        b.nom = n + "\xB72";
        b.cible = plan.cible2?.cle || null;
        vivre(b, () => new Promise((ok, ko) => {
          b.relacher = (e) => {
            b.relacher = null;
            e ? ko(e) : ok();
          };
        }));
        vivre(a, async (x) => {
          try {
            await sc.jouer(x, plan, b);
          } catch (e) {
            if (e.acteur === b) {
              b.relacher?.(e);
              throw erreur(a, "partenaire");
            }
            throw e;
          } finally {
            b.relacher?.();
          }
        });
      } else vivre(a, (x) => sc.jouer(x, plan));
      demarrerBoucle();
      programmerMiiAvance();
      return n;
    }
    return null;
  };
  const possibles = () => {
    actif();
    const sup = [...lireSupports()];
    return Object.keys(SCENES).filter((n) => {
      if (!pagesDe(n).includes(pageCourante)) return false;
      try {
        return !!SCENES[n].preparer(sup);
      } catch (e) {
        return false;
      }
    });
  };
  const VISITES = { proba: 0.07, ecart: 900, cle: "pcv-mii-visites", forcer: "pcv-mii-visiteur", dossier: "visiteurs/", livres: "@visiteurs/index.json" };
  let visiteurs = null, dernierRare = false;
  const listeVisiteurs = () => visiteurs ||= (async () => {
    const lireIndex = (c) => window.__pcvRessource?.(c, "application/json").catch(() => null);
    let chemin2 = VISITES.dossier + "index.json", url = await lireIndex(chemin2);
    if (!url) url = await lireIndex(chemin2 = VISITES.livres);
    if (!url) {
      setTimeout(() => {
        visiteurs = null;
      }, 3e5);
      return [];
    }
    try {
      const j = await (await fetch(url)).json(), ok = (x) => typeof x === "string" && /^[\w.-]{1,40}$/.test(x);
      const dossier = chemin2 === VISITES.livres ? "@visiteurs/" : VISITES.dossier;
      return (Array.isArray(j?.visiteurs) ? j.visiteurs : []).filter((v) => ok(v?.id) && typeof v.donnees === "string" && Array.isArray(v.tenue) && v.tenue.every(ok) && Array.isArray(v.scenes) && v.scenes.some((n) => SCENES[n]?.rare)).map((v) => ({
        cle: "visiteur:" + v.id,
        id: v.id,
        nom: "",
        donnees: v.donnees,
        pantalon: v.pantalon,
        couleursSwitch: v.couleurs_switch || void 0,
        deuxMains: typeof v.deux_mains === "string" ? v.deux_mains : void 0,
        tenue: v.tenue.slice(),
        dossier,
        option: Array.isArray(v.tenue_option) ? v.tenue_option.filter(ok) : [],
        scenes: v.scenes.filter((n) => SCENES[n]?.rare),
        poids: 1
      }));
    } catch (e) {
      setTimeout(() => {
        visiteurs = null;
      }, 3e5);
      return [];
    } finally {
      URL.revokeObjectURL(url);
      if (window.__pcvBlobs?.[chemin2] === url) delete window.__pcvBlobs[chemin2];
    }
  })();
  const lireVisites = () => {
    const v = lire(VISITES.cle, null);
    return v && Array.isArray(v.vus) ? v : { vus: [], t: 0 };
  };
  const tirerVisiteur = (l) => {
    if (!l.length || pageCourante !== "accueil") return null;
    let force = null;
    try {
      force = localStorage.getItem(VISITES.forcer);
    } catch (e) {
    }
    if (force) return l.find((v) => v.id === force) || null;
    const etat = lireVisites();
    if (dernierRare || Date.now() - (etat.t || 0) < VISITES.ecart * 1e3 || Math.random() >= VISITES.proba) return null;
    const restants = l.filter((v) => !etat.vus.includes(v.id)), choix = restants.length ? restants : l.filter((v) => v.id !== etat.dernier);
    return choix[Math.floor(Math.random() * choix.length)] || null;
  };
  const noterVisite = (v, l) => {
    const etat = lireVisites(), ids = l.map((x) => x.id);
    let vus = etat.vus.filter((x) => ids.includes(x) && x !== v.id);
    if (ids.every((x) => vus.includes(x) || x === v.id) && vus.length) vus = [];
    vus.push(v.id);
    try {
      localStorage.setItem(VISITES.cle, JSON.stringify({ vus, dernier: v.id, t: Date.now() }));
    } catch (e) {
    }
  };
  let visiteEnCours = false;
  const lancerVisiteur = async (v, nom = null) => {
    if (visiteEnCours) return null;
    visiteEnCours = true;
    try {
      const G = window.__pcvGardeRobe;
      if (!G) return null;
      const cat = new Set((await G.liste().catch(() => [])).map((x) => x.id)), hors = v.tenue.filter((id) => !cat.has(id));
      const ids = [...v.tenue.filter((id) => cat.has(id)), ...await G.inscrire(v.dossier, hors)];
      if (ids.length !== v.tenue.length) return null;
      if (v.option.length) ids.push(...await G.inscrire(VISITES.dossier, v.option));
      await Promise.all(ids.map((id) => G.charger(id)));
      if (!demarre || !actif() || !calme() || vivants() >= REG.max) return null;
      const l = await listeVisiteurs();
      for (const n of nom ? [nom] : melanger(v.scenes)) {
        const fait = lancerScene(n, null, v);
        if (fait) {
          noterVisite(v, l);
          return fait;
        }
      }
      return null;
    } catch (e) {
      console.warn("mii-accueil : visiteur", e?.message || e);
      return null;
    } finally {
      visiteEnCours = false;
    }
  };
  const visiteEnScene = () => acteurs.some((a) => a.estVisiteur && !a.fini);
  let enAttente = null;
  const lancerAuChoix = () => {
    if (visiteEnScene()) return null;
    if (enAttente) {
      if (vivants()) return null;
      const v = enAttente;
      enAttente = null;
      dernierRare = true;
      lancerVisiteur(v).then((r) => {
        if (!r) dernierRare = false;
      });
      return null;
    }
    if (!visiteurs) {
      listeVisiteurs();
      dernierRare = false;
      return lancerScene();
    }
    listeVisiteurs().then((l) => {
      const v = tirerVisiteur(l);
      if (v && vivants()) {
        enAttente = v;
        return;
      }
      if (v) {
        dernierRare = true;
        lancerVisiteur(v).then((r) => {
          if (!r) {
            dernierRare = false;
            lancerScene();
          }
        });
      } else {
        dernierRare = false;
        lancerScene();
      }
    });
  };
  const majActeur = (a, dt) => {
    if (a.appui && a.mode === "appui") {
      if (!reprendre(a.appui)) {
        if (a.bord === "dessous" || a.bord === "mains") a.y += prise(a);
        a.mode = "libre";
        a.bord = "dessus";
        a.appui = null;
        a.cache = null;
        interrompre(a, "chute");
      } else {
        if (a.wDe !== a.appui) {
          a.wDe = a.appui;
          a.wRef = a.appui.w;
        } else if (a.wRef && a.appui.w !== a.wRef) {
          a.u *= a.appui.w / a.wRef;
          a.wRef = a.appui.w;
        }
        [a.x, a.y] = ancre(a.appui, a.bord, a.u, a.dy);
      }
    }
    if (a.cache && !reprendre(a.cache)) a.cache = null;
    if (a.cacheJusqua != null && a.y <= a.cacheJusqua + 2) {
      a.cache = null;
      a.cacheJusqua = null;
    }
    if (a.emu > 0) {
      a.emu -= dt;
      if (a.emu <= 0) {
        a.mii.expression(null);
        a.mii.regarder(null);
      }
    }
    if (a.tache) {
      const t = a.tache;
      let fini = false;
      try {
        fini = t.maj(dt);
      } catch (e) {
        if (!["cible", "chute"].includes(e.message)) console.warn("mii-accueil", e);
        a.tache = null;
        e.acteur ??= a;
        t.ko(e);
      }
      if (fini && a.tache === t) {
        a.tache = null;
        t.ok();
      }
    }
    a.verif = (a.verif || 0) - dt;
    if (a.verif <= 0 && document.body.classList.contains("pcv-zone-jaquettes") && a.nom !== "salut" && a.nom !== "bravo") {
      a.verif = 0.5;
      const sel = document.querySelector("#pcv-console .cel.sel"), b = sel && a.mii.rectEcran(camEcran, innerWidth, innerHeight);
      if (sel) {
        const r = sel.getBoundingClientRect(), dedans = b.x1 > r.left + 8 && b.x0 < r.right - 8 && b.y1 > r.top + 8 && b.y0 < r.bottom - 8;
        a.gene = dedans && !a.cache ? a.gene + 0.5 : 0;
        if (a.gene >= 2.5 && !a.parti) {
          a.parti = true;
          interrompre(a, "place");
        }
      }
    }
    const jaquette = a.mode === "appui" && a.bord === "dessus" && a.appui?.g.jaquette;
    const tailleVue = jaquette ? Math.min(hMii(), PLAFOND_JAQUETTE * a.appui.r.height) : hMii();
    if (a.tailleVue !== tailleVue) {
      a.mii.regler(tailleVue);
      a.tailleVue = tailleVue;
    }
    a.mii.sol = a.mode === "appui" && a.bord === "dessus" && !a.cache ? -a.y : a.solVol != null ? -a.solVol : null;
    a.mii.objet.position.set(a.x, -a.y, a.z);
    a.mii.maj(dt);
    cache(a);
  };
  const tour = (t) => {
    raf = requestAnimationFrame(tour);
    window.__pcvGrilleAvantImage?.(t);
    if (REG.plafond && t - dernier < 1e3 / REG.plafond - 2) return;
    const dt = Math.min(0.1, (t - dernier) / 1e3);
    dernier = t;
    dtImage = dt;
    if (!actif()) {
      toutRetirer();
      return;
    }
    const t0 = performance.now();
    if (!gel) for (const a of [...acteurs]) majActeur(a, dt);
    else for (const a of acteurs) if (a.mode === "appui" && reprendre(a.appui)) {
      [a.x, a.y] = ancre(a.appui, a.bord, a.u, a.dy);
      a.mii.objet.position.set(a.x, -a.y, a.z);
    }
    const t1 = performance.now();
    if (!acteurs.length) return;
    scene.updateMatrixWorld();
    for (const a of acteurs) {
      suivreMain(a);
      if (!gel) for (let i = a.objets.length - 1; i >= 0; i--) {
        const o = a.objets[i];
        if (o.userData.maj && !o.userData.maj(dt)) {
          a.objets.splice(i, 1);
          jeter(o);
        }
      }
    }
    cadrer(t);
    rendu.render(scene, cam);
    const t2 = performance.now();
    mesure.n++;
    mesure.logique += t1 - t0;
    mesure.rendu += t2 - t1;
  };
  const mesure = { n: 0, logique: 0, rendu: 0 };
  const demarrerBoucle = () => {
    if (raf) return;
    toile.classList.add("vu");
    dernier = performance.now();
    raf = requestAnimationFrame(tour);
  };
  const arreterBoucle = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    if (rendu) {
      rendu.clear();
      toile.classList.remove("vu");
    }
  };
  const RACINES = { accueil: "pcv-console", themes: "pcv-themes", notifs: "pcv-notifs", amis: "pcv-amis" };
  const ouvert = (id) => {
    const e = document.getElementById(id);
    return !!e && !e.hidden && e.getClientRects().length > 0;
  };
  let pageLue = null, pageT = -1;
  let pourquoi = "";
  const lirePage = () => {
    const non = (r) => {
      pourquoi = r;
      return null;
    };
    if (document.hidden) return non("cach\xE9e");
    const o = ["pcv-place", "pcv-connexion", "pcv-profil", "pcv-miimaker"].find(ouvert);
    if (o) return non(o);
    if (document.querySelector(".pcv-panneau.on")) return non("panneau");
    if (window.__pcvDossiers?.modal?.()) return non("dossier");
    try {
      if (window.__pcvMenus?.IsAnySideMenuVisible?.()) return non("menu de Steam");
    } catch (e) {
    }
    if (document.querySelector(".gpfocus")?.closest(".contextMenuItem, .FullModalOverlay")) return non("fen\xEAtre de Steam");
    if (document.querySelector("#pcv-amis .carte-zone > *")) return non("carte d'ami");
    const el = document.elementFromPoint(innerWidth / 2, innerHeight * 0.62);
    if (!el) return non("rien au milieu");
    for (const [nom, id] of Object.entries(RACINES)) {
      const r = document.getElementById(id);
      if (r && !r.hidden && r.contains(el)) return nom;
    }
    return non("au milieu : " + (el.id || el.className?.toString?.().slice(0, 40) || el.tagName));
  };
  const pageMii = () => {
    const t = performance.now();
    if (t - pageT > 120) {
      pageT = t;
      pageLue = lirePage();
    }
    return pageLue;
  };
  const PAGE_MS = 450;
  let autrePage, autreDepuis = 0;
  const montrerToile = (oui) => {
    if (toile) toile.style.visibility = oui ? "" : "hidden";
  };
  const actif = () => {
    const p = pageMii();
    if (p === pageCourante) {
      if (autrePage !== void 0) {
        autrePage = void 0;
        montrerToile(true);
      }
      return !!p;
    }
    if (acteurs.length && pageCourante) {
      const t = performance.now();
      if (autrePage !== p) {
        autrePage = p;
        autreDepuis = t;
        montrerToile(false);
      }
      if (t - autreDepuis < PAGE_MS) return true;
    }
    autrePage = void 0;
    montrerToile(true);
    if (acteurs.length) toutRetirer("page " + pageCourante + " \u2192 " + (p || "aucune (" + pourquoi + ")"));
    pageCourante = p;
    supImage = null;
    return !!p;
  };
  const calme = () => !document.body.classList.contains("pcv-deco") && !document.querySelector("#pcv-console .cel.porte, #pcv-console .cel.pulse");
  const programmer = (s) => {
    clearTimeout(minuterie);
    minuterie = setTimeout(() => {
      minuterie = 0;
      if (!demarre || !actif()) return;
      if (autrePage !== void 0) {
        programmer(2);
        return;
      }
      if (!pret()) moteur().then((m) => {
        if (m && demarre && preparerRendu()) programmerMiiAvance();
      });
      else if (calme() && acteurs.filter((a) => !a.sorti).length < REG.max) lancerAuChoix();
      programmer(alea(...REG.intervalle));
    }, s * 1e3);
  };
  const rangement = { porte: null };
  const suivreJoueur = () => {
    const sel = document.querySelector("#pcv-console .cel.sel"), i = sel?.dataset.i ?? null;
    if (i !== curseur.i) {
      curseur.i = i;
      curseur.bouge = performance.now();
    }
    curseur.r = sel ? sel.getBoundingClientRect() : null;
    const porte = document.querySelector("#pcv-console .cel.porte");
    if (porte) {
      rangement.porte = porte;
      const r = porte.getBoundingClientRect();
      for (const a of acteurs) if (!a.sorti && a.mode === "appui") {
        a.mii.expression("surprise");
        a.mii.regarder(vers((r.left + r.right) / 2, (r.top + r.bottom) / 2, 200));
        a.emu = 0.6;
      }
    } else if (rangement.porte) {
      rangement.porte = null;
      const vus = acteurs.filter((a) => !a.sorti);
      for (const a of vus) {
        a.mii.expression("joie");
        a.emu = 1.6;
      }
      if (!vus.length && Math.random() < 0.6) setTimeout(() => {
        if (demarre && actif() && calme() && vivants() < REG.max && !visiteEnScene() && !enAttente) lancerScene("bravo");
      }, 600);
    }
  };
  const surveiller = () => {
    const ok = demarre && actif();
    if (!ok) {
      if (acteurs.length) toutRetirer();
      if (minuterie) {
        clearTimeout(minuterie);
        minuterie = 0;
      }
      return;
    }
    if (!minuterie) programmer(alea(...REG.premier));
    if (pret()) {
      suivreJoueur();
      programmerMiiAvance();
    }
  };
  const toucher = (e) => {
    if (!acteurs.length || !camEcran) return;
    for (const a of acteurs) {
      if (a.sorti || a.touche || a.mode === "vol" || a.mode === "chute") continue;
      const b = a.mii.rectEcran(camEcran, innerWidth, innerHeight), m = 8;
      if (e.clientX >= b.x0 - m && e.clientX <= b.x1 + m && e.clientY >= b.y0 - m && e.clientY <= b.y1 + m) {
        a.touche = true;
        interrompre(a, "touche");
        return;
      }
    }
  };
  const demarrer = (o) => {
    if (o) {
      Object.assign(REG, o);
      try {
        localStorage.setItem("pcv-mii-accueil", JSON.stringify(REG));
      } catch (e) {
      }
    }
    if (!REG.actif && !o) return "Mii de l'accueil d\xE9sactiv\xE9s (r\xE9glage pcv-mii-accueil.actif)";
    REG.actif = true;
    demarre = true;
    clearInterval(veille);
    veille = setInterval(surveiller, 400);
    removeEventListener("pointerdown", toucher, true);
    addEventListener("pointerdown", toucher, { capture: true, passive: true });
    removeEventListener("pcv-mii-base", repeupler);
    addEventListener("pcv-mii-base", repeupler);
    surveiller();
    return "Mii de l'accueil en route";
  };
  const repeupler = () => {
    if (M) peupler().catch(() => {
    });
  };
  const arreter = (desactiver) => {
    if (desactiver) {
      REG.actif = false;
      try {
        localStorage.setItem("pcv-mii-accueil", JSON.stringify(REG));
      } catch (e) {
      }
    }
    demarre = false;
    clearInterval(veille);
    clearTimeout(minuterie);
    minuterie = 0;
    toutRetirer("arr\xEAt");
    removeEventListener("pointerdown", toucher, true);
    removeEventListener("resize", retailler);
    removeEventListener("pcv-mii-base", repeupler);
    document.querySelectorAll(".pcv-mii-bouge").forEach((el) => {
      el.classList.remove("pcv-mii-bouge");
      clearTimeout(el.__pcvMiiT);
    });
    oublierMiiAvance();
    if (rendu) {
      viderPartage();
      rendu.dispose();
      rendu.forceContextLoss();
      toile.remove();
      rendu = null;
      toile = null;
    }
  };
  window.__pcvMiiAccueil = {
    demarrer,
    arreter,
    reglages: REG,
    cibles,
    pages: CIBLES_PAGES,
    page: () => pageCourante,
    genres: GENRES,
    scenes: Object.keys(SCENES),
    poids: Object.fromEntries(Object.entries(SCENES).map(([n, s]) => [n, s.poids])),
    possibles,
    recentes: () => [...recentes],
    journal: () => JOURNAL.slice(),
    scene: (nom, cible, qui) => {
      if (!demarre) demarrer();
      return actif() ? lancerScene(nom, cible, qui) : null;
    },
    // essais : cible = clé d'un support (ex. "tuile:0"), qui = clé d'un habitant
    charger: () => moteur().then((m) => !!m),
    visiteur: async (id, nom) => {
      if (!demarre) demarrer();
      const l = await listeVisiteurs(), v = l.find((x) => x.id === id) || l[0];
      if (!v || !actif()) return null;
      for (const a of acteurs) if (!a.sorti && !a.estVisiteur) interrompre(a, "place");
      for (let k = 0; k < 120 && vivants(); k++) await new Promise((r) => setTimeout(r, 100));
      return lancerVisiteur(v, nom);
    },
    // essais
    visiteurs: () => listeVisiteurs().then((l) => l.map((v) => ({ id: v.id, scenes: v.scenes }))),
    // essais : charger le moteur tout de suite (sinon : au premier tour du metteur en scène)
    habitants: () => habitants?.map((h) => ({ cle: h.cle, nom: h.nom, pantalon: h.pantalon, moi: !!h.moi })) ?? null,
    etat: () => acteurs.map((a) => ({ scene: a.nom, mode: a.mode, bord: a.bord, appui: a.appui?.cle, anim: a.mii.anim, x: Math.round(a.x), y: Math.round(a.y), salto: +a.mii.salto.rotation.x.toFixed(2), tache: !!a.tache, objets: a.objets.map((o) => (o.userData.nom || (o.isSprite ? "marque" : "?")) + "@" + Math.round(o.position.x) + "," + Math.round(-o.position.y) + (o.visible ? "" : " cach\xE9")) })),
    images: () => rendu?.info.render.frame ?? 0,
    temps: () => {
      const r = { images: mesure.n, logique: +(mesure.logique / mesure.n).toFixed(2), rendu: +(mesure.rendu / mesure.n).toFixed(2) };
      mesure.n = mesure.logique = mesure.rendu = 0;
      return r;
    },
    // ms par image
    pause: (oui) => {
      gel = !!oui;
      return gel;
    },
    _acteurs: () => acteurs,
    // essais : figer les Mii pour une capture
    // essais : figer un Mii dans une animation (et un geste du bras), pour la regarder
    poser: (nom, bras = null, k = 0) => {
      const a = acteurs[k];
      if (!a) return null;
      gel = true;
      a.mii.bras = bras;
      a.mii.cap = a.mii.capVise = 0;
      a.mii.jouer(nom, { fondu: 0, redemarrer: true });
      for (let i = 0; i < 40; i++) a.mii.maj(1 / 60);
      return a.mii.anim;
    }
  };
  return REG.actif ? demarrer() : "Mii de l'accueil pr\xEAts (d\xE9sactiv\xE9s)";
})();
