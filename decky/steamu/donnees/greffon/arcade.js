(() => {
  window.__pcvArcade?.fermer?.();
  const T = window.__pcvT || ((c) => c);
  const O = window.opener || {};
  const lire = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const ecrire = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
    }
  };
  const u = (n) => `calc(var(--u) * ${n})`;
  const css = (s) => s.replace(/(-?\d*\.?\d+)u\b/g, "calc(var(--u) * $1)");
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const echap = (s) => String(s).replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
  const jourDe = (d = /* @__PURE__ */ new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const graine = (s) => {
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }
    return () => {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  };
  const melanger = (t, r) => {
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  };
  const CLE = { parties: "pcv-arcade-parties", boite: "pcv-arcade-boite", jour: "pcv-arcade-jour", succes: "pcv-arcade-succes", mode: "pcv-arcade-grands" };
  const OFFERTES = 10, JETONS_PAR_PARTIE = 10, BONUS_ENTRAINEMENT = 2, NB_SERIES = 7, PAS_HALL = 300, SUCCES_MAX = 15, LOTS = 28, MORCEAUX_PAR_MACHINE = 10;
  const COULEURS = {
    // [couleur, foncée, claire] par famille de séries
    "Entra\xEEnement": ["#39b8f0", "#1677b3", "#d9f3ff"],
    Mario: ["#ff5d5d", "#c4283b", "#ffe0dc"],
    Zelda: ["#45c46e", "#1f8445", "#dcf8e2"],
    "Pok\xE9mon": ["#ffc63a", "#c98500", "#fff1c4"],
    Kirby: ["#ff8cc6", "#cf4b8b", "#ffe3f1"],
    "Animal Crossing": ["#4fcf9f", "#1f9068", "#d7f6ea"],
    Splatoon: ["#b45cff", "#7330c6", "#efdfff"],
    "Monster Hunter": ["#ff9842", "#c25a05", "#ffe5cc"],
    "Yo-kai Watch": ["#ff6a7f", "#b5304f", "#ffe0e5"],
    "R\xE9tro": ["#6d86ff", "#3346bd", "#e0e6ff"],
    Musique: ["#ff74c8", "#c03c8f", "#ffe0f3"],
    "Badge Arcade": ["#ff8ab0", "#cf4b77", "#ffe2ec"],
    "Fire Emblem": ["#4f8bff", "#2550b8", "#dfe9ff"],
    WarioWare: ["#ffd23f", "#b88600", "#fff4c6"],
    Sanrio: ["#ff9dbd", "#d65d86", "#ffe6ef"],
    Pikmin: ["#7fd64a", "#3f9a17", "#e6f8d8"],
    Divers: ["#38bdf8", "#1479b5", "#d8f1ff"]
  };
  const couleurs = (f) => COULEURS[f] || COULEURS.Divers;
  let ac = null, maitre = null, mot = null;
  const volume = () => +lire("pcv-bruitages", 1) || 0;
  const audio = () => {
    if (!volume()) return null;
    try {
      ac ||= new AudioContext();
      if (ac.state === "suspended") ac.resume();
      if (!maitre) {
        maitre = ac.createGain();
        maitre.connect(ac.destination);
      }
      maitre.gain.value = volume();
      return ac;
    } catch (e) {
      return null;
    }
  };
  const note = (f, d = 0.08, type = "sine", v = 0.05, q = 0, f2 = 0) => {
    const a = audio();
    if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + q;
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(1e-4, t + d);
    o.connect(g).connect(maitre);
    o.start(t);
    o.stop(t + d + 0.03);
  };
  const souffle = (d = 0.12, v = 0.05, q = 0, f = 1800, f2 = 0) => {
    const a = audio();
    if (!a) return;
    const n = Math.ceil(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), c = b.getChannelData(0);
    for (let i = 0; i < n; i++) c[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + q;
    s.buffer = b;
    fl.type = "bandpass";
    fl.Q.value = 1.3;
    fl.frequency.setValueAtTime(f, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(1e-4, t + d);
    s.connect(fl).connect(g).connect(maitre);
    s.start(t);
    s.stop(t + d + 0.02);
  };
  const SONS = {
    bouge: () => note(1250, 0.045, "sine", 0.035),
    travelling: () => {
      souffle(0.32, 0.045, 0, 600, 2600);
      note(660, 0.12, "sine", 0.025, 0.06, 990);
    },
    approche: () => {
      souffle(0.4, 0.05, 0, 2600, 500);
      [523, 659, 784, 1047].forEach((f, i) => note(f, 0.14, "triangle", 0.045, 0.1 + i * 0.06));
    },
    retour: () => {
      note(700, 0.06, "triangle", 0.045);
      note(470, 0.1, "triangle", 0.045, 0.05);
    },
    piece: () => {
      note(1318, 0.07, "square", 0.025);
      note(1976, 0.25, "square", 0.025, 0.07);
    },
    refus: () => {
      note(233, 0.12, "square", 0.03);
      note(185, 0.2, "square", 0.03, 0.1);
    },
    descend: () => note(560, 0.55, "triangle", 0.03, 0, 280),
    monte: () => note(280, 0.6, "triangle", 0.03, 0, 600),
    clac: () => {
      souffle(0.05, 0.09, 0, 3400);
      note(170, 0.07, "square", 0.025);
    },
    glisse: () => {
      note(900, 0.25, "sine", 0.035, 0, 300);
      souffle(0.12, 0.03, 0, 1200);
    },
    tombe: () => {
      souffle(0.09, 0.07, 0, 900);
      note(150, 0.12, "sine", 0.06, 0, 70);
    },
    pousse: () => souffle(0.9, 0.035, 0, 260, 700),
    gagne: () => {
      [784, 988, 1175, 1568, 1976].forEach((f, i) => note(f, 0.22, "square", 0.024, i * 0.08));
      [2637, 3136, 3951].forEach((f, i) => note(f, 0.32, "sine", 0.028, 0.45 + i * 0.08));
    },
    rate: () => {
      note(392, 0.14, "triangle", 0.045);
      note(330, 0.14, "triangle", 0.045, 0.13);
      note(262, 0.32, "triangle", 0.045, 0.26);
    },
    pop: () => note(700, 0.08, "sine", 0.05, 0, 1500),
    jeton: () => {
      note(1568, 0.06, "sine", 0.04);
      note(2093, 0.12, "sine", 0.04, 0.05);
    },
    babil: () => note(420 + Math.random() * 360, 0.05, "square", 0.014),
    ouvre: () => [660, 880, 1175].forEach((f, i) => note(f, 0.1, "sine", 0.04, i * 0.05)),
    lumiere: () => [1047, 1319, 1568, 2093].forEach((f, i) => note(f, 0.09, "sine", 0.02, i * 0.045))
  };
  const son = (n) => {
    if (volume() > 0) SONS[n]?.();
  };
  const moteur = (on) => {
    const a = on ? audio() : ac;
    if (!a || !maitre) return;
    if (!mot && on) {
      const o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain();
      o.type = "sawtooth";
      o.frequency.value = 64;
      f.type = "lowpass";
      f.frequency.value = 420;
      g.gain.value = 0;
      o.connect(f).connect(g).connect(maitre);
      o.start();
      mot = { o, g };
    }
    if (mot) mot.g.gain.setTargetAtTime(on ? 0.022 : 0, a.currentTime, 0.06);
  };
  let index = null, attenteIndex = null, seriesPar = /* @__PURE__ */ new Map(), morceauxDe = /* @__PURE__ */ new Map(), morceauDe = /* @__PURE__ */ new Map();
  const chargerIndex = () => attenteIndex ||= (async () => {
    try {
      const url = await window.__pcvRessource?.("badges/index.json", "application/json");
      if (!url) return null;
      const j = await (await fetch(url)).json();
      return j?.series?.length ? j : null;
    } catch (e) {
      return null;
    }
  })().then((j) => {
    index = j;
    if (!j) {
      attenteIndex = null;
      return j;
    }
    seriesPar = /* @__PURE__ */ new Map();
    morceauxDe = /* @__PURE__ */ new Map();
    morceauDe = /* @__PURE__ */ new Map();
    for (const s of j.series) {
      s.lots = [];
      s.tailles = {};
      for (const b of s.badges || []) {
        const o = typeof b === "string" ? { fichier: b, cases: s.grands?.[b] } : b, f = o.fichier || String(o.id).split("/").pop();
        if (o.morceau) {
          morceauDe.set(o.id || `${s.id}/${f}`, o.morceau);
          continue;
        }
        s.lots.push(f);
        if (o.cases && o.cases[0] * o.cases[1] > 1) s.tailles[f] = o.cases;
        if (o.morceaux) morceauxDe.set(`${s.id}/${f}`, o.morceaux);
      }
      seriesPar.set(s.id, s);
    }
    morceauDe.forEach((m, id) => m.k = morceauxDe.get(m.de)?.indexOf(id) ?? 0);
    return j;
  });
  const imgs = /* @__PURE__ */ new Map();
  const image = (id) => {
    let im = imgs.get(id);
    if (im) return im;
    im = new Image();
    imgs.set(id, im);
    Promise.resolve(window.__pcvRessource?.("badges/" + id, "image/png")).then((url) => {
      if (url) im.src = url;
    }).catch(() => {
    });
    return im;
  };
  const pret = (im) => im.complete && im.naturalWidth > 0;
  const poserImage = (el, id) => {
    const im = image(id);
    if (pret(im)) el.src = im.src;
    else im.addEventListener("load", () => el.src = im.src, { once: true });
  };
  const info = (id) => {
    const [sid, f] = String(id).split("/"), s = seriesPar.get(sid);
    if (!s) return null;
    const [colonnes2, rangees] = s.tailles[f] || [1, 1], m = morceauDe.get(id);
    return {
      serie: s.id,
      serieNom: `${s.nom}, ${s.sous}`,
      nom: nomBadge(m ? m.de : id),
      colonnes: colonnes2,
      rangees,
      morceaux: morceauxDe.get(id) || null,
      morceau: m ? { de: m.de, x: m.x, y: m.y, numero: m.k + 1, sur: morceauxDe.get(m.de)?.length || 1 } : null
    };
  };
  const tailleDe = (id) => {
    const [sid, f] = id.split("/");
    return seriesPar.get(sid)?.tailles[f] || [1, 1];
  };
  const exemplaires = () => {
    const r = {};
    for (const [id, v] of Object.entries(boite())) for (const x of morceauxDe.get(id) || [id]) r[x] = (r[x] || 0) + (v?.n || 1);
    return r;
  };
  const GENERIQUES = /* @__PURE__ */ new Set(["pr", "chara", "char", "item", "obj", "enm", "enemy", "xx", "pkg", "icon", "cp", "sep", "tile", "ad", "r", "8bit", "anm", "etc", "int", "npc"]);
  const SIGLES = { SMB: "Super Mario Bros.", SMB3: "Super Mario Bros. 3", SMW: "Super Mario World", NSMBU: "New Super Mario Bros. U", SMBUSA: "Super Mario Bros. 2" };
  const nomBadge = (id) => {
    const [sid, f] = String(id).split("/"), s = seriesPar.get(sid);
    const base = f.replace(/\.png$/, "").replace(new RegExp("^Pr_" + sid + "_", "i"), "");
    if (/^[\w-]{20,}$/.test(base) && !base.includes("_")) return "Badge secret";
    if (s?.famille === "Pok\xE9mon" && /^\d{4}/.test(base)) return `Pok\xE9mon n\xB0 ${+base.slice(0, 4)}`;
    const mots = base.replace(/([a-z])([A-Z])/g, "$1 $2").split(/[_\s]+/).map((m) => SIGLES[m] || m.replace(/\d+$/, "")).filter((m) => m && !/^\d+$/.test(m) && !GENERIQUES.has(m.toLowerCase()));
    const n = mots.slice(-2).join(" ");
    return n ? n.charAt(0).toUpperCase() + n.slice(1) : s ? `${s.nom} n\xB0 ${s.lots.indexOf(f) + 1}` : "Badge";
  };
  const parties = () => {
    const p = lire(CLE.parties, null) || { jour: "", offertes: 0, bonus: 0, jetons: 0, bonusJetons: 0 };
    if (p.jour !== jourDe()) {
      Object.assign(p, { jour: jourDe(), offertes: OFFERTES, jetons: 0, bonusJetons: 0 });
      ecrire(CLE.parties, p);
    }
    return p;
  };
  const totalParties = () => {
    const p = parties();
    return p.offertes + p.bonus;
  };
  const depenser = () => {
    const p = parties();
    if (p.offertes > 0) p.offertes--;
    else if (p.bonus > 0) p.bonus--;
    else return false;
    ecrire(CLE.parties, p);
    majHud();
    return true;
  };
  const boite = () => lire(CLE.boite, {});
  const aMorceau = (b, pid) => !!(b[pid] || b[morceauDe.get(pid)?.de]);
  const nbMorceaux = (b, id) => {
    const p = morceauxDe.get(id);
    return !p ? b[id] ? 1 : 0 : b[id] ? p.length : p.filter((x) => b[x]).length;
  };
  const complet = (b, id) => nbMorceaux(b, id) === (morceauxDe.get(id)?.length || 1);
  const possede = (b, id) => nbMorceaux(b, id) > 0;
  const avancee = (b, s) => s.lots.reduce((a, f) => {
    const id = `${s.id}/${f}`;
    return a + nbMorceaux(b, id) / (morceauxDe.get(id)?.length || 1);
  }, 0);
  const completes = (b, s) => s.lots.filter((f) => complet(b, `${s.id}/${f}`)).length;
  const modeGrands = () => lire(CLE.mode, "morceaux") === "entiers" ? "entiers" : "morceaux";
  const etatJour = () => {
    const e = lire(CLE.jour, null);
    return e?.jour === jourDe() ? e : { jour: jourDe(), gagnes: {} };
  };
  const enregistrer = (m, id) => {
    const b = boite(), n = (b[id]?.n || 0) + 1;
    b[id] = { n, t: b[id]?.t || Date.now() };
    ecrire(CLE.boite, b);
    const e = etatJour();
    (e.gagnes[m.cle] ||= []).push(id);
    ecrire(CLE.jour, e);
    m.file = m.file.filter((x) => x !== id);
    return n;
  };
  const lireSucces = async () => {
    const A = O.SteamClient?.Apps;
    if (!A?.GetMyAchievementsForApp || !O.appStore) return [];
    const e = lire(CLE.succes, null) || { depuis: Math.floor(Date.now() / 1e3) - 7 * 86400, credites: {} }, noms = [];
    const jeux = (O.appStore.allApps || []).filter((a) => a.app_type === 1 && a.rt_last_time_played > e.depuis).sort((a, b) => b.rt_last_time_played - a.rt_last_time_played).slice(0, 20);
    for (const a of jeux) {
      try {
        const r = await A.GetMyAchievementsForApp(String(a.appid)), d = (typeof r === "string" ? JSON.parse(r) : r).data.rgAchievements;
        const obtenus = d.filter((x) => x.bAchieved && x.rtUnlocked > e.depuis).sort((x, y) => y.rtUnlocked - x.rtUnlocked), deja = e.credites[a.appid] || 0;
        if (obtenus.length > deja) {
          obtenus.slice(0, obtenus.length - deja).forEach((x) => noms.push({ nom: x.strName, jeu: a.display_name }));
          e.credites[a.appid] = obtenus.length;
        }
      } catch (er) {
      }
    }
    ecrire(CLE.succes, e);
    noms.splice(SUCCES_MAX);
    if (noms.length) {
      const p = parties();
      p.bonus += noms.length;
      ecrire(CLE.parties, p);
    }
    return noms;
  };
  let machines = [], machinesDe = "";
  const ENTRAINEMENT = { cle: "entrainement", type: "pince", entrainement: true, nom: T("casino.entrainement"), sous: "gratuit, pour se faire la main", famille: "Entra\xEEnement", stock: [] };
  const machineDe = (s, type, stock) => ({ cle: s.id, type, serie: s, nom: s.nom, sous: s.sous, famille: s.famille, icone: s.icone ? `${s.id}/${s.icone}` : null, stock });
  const stockDe = (s, type, mode, r, b) => {
    const petits = melanger(s.lots.filter((f) => !s.tailles[f]), r).map((f) => `${s.id}/${f}`), grands = s.lots.filter((f) => s.tailles[f]).map((f) => `${s.id}/${f}`);
    if (mode === "entiers") {
      const g = melanger(grands.filter((id) => tailleDe(id)[0] <= 2), r).slice(0, Math.max(type === "pousseur" ? 3 : 2, Math.min(12, LOTS - petits.length)));
      return melanger([...g, ...petits.slice(0, LOTS - g.length)], r);
    }
    const quota = Math.max(MORCEAUX_PAR_MACHINE, LOTS - petits.length), morceaux = [];
    const commences = melanger(grands.filter((id) => possede(b, id) && !complet(b, id)), r), neufs = melanger(grands.filter((id) => !possede(b, id)), r);
    for (const id of [...commences, ...neufs]) {
      const manque = morceauxDe.get(id)?.filter((p) => !b[p]) || [];
      if (morceaux.length && morceaux.length + manque.length > quota) break;
      morceaux.push(...manque);
    }
    return melanger([...morceaux, ...petits.slice(0, Math.max(0, LOTS - morceaux.length))], r);
  };
  const machinesDuJour = (mode) => {
    const r = graine("arcade " + jourDe()), b = boite(), liste = [ENTRAINEMENT];
    if (!index) return liste;
    const commencees = mode === "morceaux" ? melanger(index.series.filter((s) => s.lots.some((f) => {
      const id = `${s.id}/${f}`;
      return morceauxDe.has(id) && possede(b, id) && !complet(b, id);
    })), r).slice(0, 2) : [];
    const parFamille = {}, choisies = [...commencees];
    for (const s of commencees) parFamille[s.famille] = (parFamille[s.famille] || 0) + 1;
    for (const s of melanger(index.series.filter((s2) => s2.lots.length >= 12 && !commencees.includes(s2)), r)) {
      if (choisies.length >= NB_SERIES) break;
      if ((parFamille[s.famille] || 0) >= 2) continue;
      parFamille[s.famille] = (parFamille[s.famille] || 0) + 1;
      choisies.push(s);
    }
    const pousseurs = new Set(melanger([...choisies.keys()], r).slice(0, 2));
    choisies.forEach((s, i) => {
      const type = pousseurs.has(i) ? "pousseur" : "pince";
      liste.push(machineDe(s, type, stockDe(s, type, mode, r, b)));
    });
    return liste;
  };
  const preparerMachines = (refaire) => {
    const mode = modeGrands(), cle = jourDe() + (index ? ":i:" : ":") + mode;
    if (!refaire && machinesDe === cle) return;
    machinesDe = cle;
    const e = etatJour();
    let liste = null;
    if (index && !refaire && e.mode === mode && e.machines?.length) liste = [ENTRAINEMENT, ...e.machines.filter((d) => seriesPar.has(d.cle)).map((d) => machineDe(seriesPar.get(d.cle), d.type, d.stock))];
    if (!liste || liste.length < 2) {
      liste = machinesDuJour(mode);
      if (index) {
        e.mode = mode;
        e.machines = liste.filter((d) => !d.entrainement).map((d) => ({ cle: d.cle, type: d.type, stock: d.stock }));
        ecrire(CLE.jour, e);
      }
    }
    machines = liste.map((d) => ({ ...d, coul: couleurs(d.famille), file: d.stock.filter((id) => !e.gagnes[d.cle]?.includes(id)), monde: null, jeu: null }));
    sel = clamp(sel || 1, 0, machines.length - 1);
  };
  const W = 760, H = 440, G = 1500, MU_S = 0.55, MU_K = 0.35, CASE = 70;
  const contact = (a, b, nx, ny, d, kdx, kdy, mus, muk) => {
    const wa = a.w, wb = b ? b.w : 0, ws = wa + wb;
    if (ws <= 0) return;
    const fa = wa / ws, fb = wb / ws;
    a.x += nx * d * fa;
    a.y += ny * d * fa;
    if (b) {
      b.x -= nx * d * fb;
      b.y -= ny * d * fb;
    }
    a.touche = true;
    if (b) b.touche = true;
    if (ny < -0.5) a.appui = true;
    if (b && ny > 0.5) b.appui = true;
    const rx = a.x - a.px - (b ? b.x - b.px : kdx), ry = a.y - a.py - (b ? b.y - b.py : kdy);
    const rn = rx * nx + ry * ny, tx = rx - rn * nx, ty = ry - rn * ny, lt = Math.hypot(tx, ty);
    if (!lt) return;
    const k = lt < mus * d ? 1 : Math.min(muk * d / lt, 1);
    a.x -= tx * k * fa;
    a.y -= ty * k * fa;
    if (b) {
      b.x += tx * k * fb;
      b.y += ty * k * fb;
    }
  };
  const enfoncement = (p, s) => {
    const ex = s.bx - s.ax, ey = s.by - s.ay, l2 = ex * ex + ey * ey;
    const t = l2 ? clamp(((p.x - s.ax) * ex + (p.y - s.ay) * ey) / l2, 0, 1) : 0, dx = p.x - s.ax - ex * t, dy = p.y - s.ay - ey * t;
    return { d: p.r + s.r - Math.hypot(dx, dy), dx, dy, ex, ey, l2 };
  };
  const contreCapsule = (p, s) => {
    const e = enfoncement(p, s);
    if (e.d <= 0) return;
    if (s.v != null) p.kin = Math.max(p.kin, s.v);
    let l = Math.hypot(e.dx, e.dy), nx, ny;
    if (l > 1e-6) {
      nx = e.dx / l;
      ny = e.dy / l;
    } else {
      l = Math.sqrt(e.l2) || 1;
      nx = -e.ey / l;
      ny = e.ex / l;
    }
    contact(p, null, nx, ny, e.d, s.dx || 0, s.dy || 0, s.mus ?? MU_S, s.muk ?? MU_K);
  };
  const pas = (mo, dt) => {
    const g = G * dt * dt, P = mo.parts, n = P.length;
    for (const p of P) {
      p.appui = p.touche = false;
      p.kin = -1;
      if (p.tenu) continue;
      let vx = p.x - p.px, vy = p.y - p.py;
      const v = Math.hypot(vx, vy);
      if (v > 10) {
        vx *= 10 / v;
        vy *= 10 / v;
      }
      p.vx0 = vx * 0.998;
      p.vy0 = vy * 0.998 + g;
      p.px = p.x;
      p.py = p.y;
      p.x += p.vx0;
      p.y += p.vy0;
    }
    for (let it = 0; it < 7; it++) {
      for (let i = 0; i < n; i++) {
        const a = P[i];
        for (let j = i + 1; j < n; j++) {
          const b = P[j];
          if (a.c === b.c) continue;
          const dx = a.x - b.x, dy = a.y - b.y, R = a.r + b.r;
          if (dx > R || dx < -R || dy > R || dy < -R) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 >= R * R || d2 < 1e-9) continue;
          const d = Math.sqrt(d2);
          contact(a, b, dx / d, dy / d, R - d, 0, 0, MU_S, MU_K);
        }
      }
      for (const c of mo.corps) if (c.parts.length > 1) tige(c);
      for (const s of mo.segs) for (const p of P) contreCapsule(p, s);
      for (const s of mo.cines) for (const p of P) contreCapsule(p, s);
    }
    for (const p of P) {
      if (p.tenu) continue;
      if (p.kin >= 0) {
        const vx = p.x - p.px, vy = p.y - p.py, v = Math.hypot(vx, vy), lim = p.kin + 0.5;
        if (v > lim) {
          p.px = p.x - vx * lim / v;
          p.py = p.y - vy * lim / v;
        }
      }
      const dvx = p.x - p.px - p.vx0, dvy = p.y - p.py - p.vy0, dv = Math.hypot(dvx, dvy);
      if (dv > 2.5) {
        p.px = p.x - p.vx0 - dvx * 2.5 / dv;
        p.py = p.y - p.vy0 - dvy * 2.5 / dv;
      }
      if (p.touche) {
        const vx = p.x - p.px, vy = p.y - p.py, v = Math.hypot(vx, vy);
        if (v > 3) {
          p.px = p.x - vx * 3 / v;
          p.py = p.y - vy * 3 / v;
        }
      }
    }
    for (const p of P) if (p.appui && !p.tenu) {
      p.px += (p.x - p.px) * 0.08;
      p.py += (p.y - p.py) * 0.08;
    }
    for (const c of mo.corps) {
      const Q = c.parts;
      if (Q.length > 1) c.ang = Math.atan2(Q[Q.length - 1].y - Q[0].y, Q[Q.length - 1].x - Q[0].x) - c.axe;
      else if (Q[0].appui && !Q[0].tenu) c.ang = clamp(c.ang + (Q[0].x - Q[0].px) / Q[0].r * 0.45, -0.6, 0.6);
    }
  };
  const tige = (c) => {
    const P = c.parts;
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const a = P[i], b = P[j], L = (j - i) * c.ecart, ws = a.w + b.w;
      if (!ws) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1e-6, k = (d - L) / d / ws;
      a.x += dx * k * a.w;
      a.y += dy * k * a.w;
      b.x -= dx * k * b.w;
      b.y -= dy * k * b.w;
    }
  };
  const ajouterCorps = (mo, c, x, y, ang = 0) => {
    const [col, rang] = c.taille, n = Math.max(col, rang);
    c.axe = col >= rang ? 0 : Math.PI / 2;
    c.ang = ang;
    if (col === rang) c.parts = [{ x, y, px: x, py: y, r: 29 * n, w: 1 / (n * n * 1.3), c }];
    else {
      c.ecart = 64;
      const a = ang + c.axe, ux = Math.cos(a), uy = Math.sin(a);
      c.parts = Array.from({ length: n }, (_, k) => {
        const o = (k - (n - 1) / 2) * 64, px = x + ux * o, py = y + uy * o;
        return { x: px, y: py, px, py, r: 29, w: 1 / 1.6, c };
      });
    }
    mo.corps.push(c);
    mo.parts.push(...c.parts);
    return c;
  };
  const retirerCorps = (mo, c) => {
    mo.corps = mo.corps.filter((k) => k !== c);
    mo.parts = mo.parts.filter((p) => p.c !== c);
  };
  const cinematiques = (mo, caps) => {
    mo.cines = caps.map((k, i) => {
      const v = mo.cinesPrec?.[i];
      const dx = v ? Math.max(Math.abs(k[0] - v.ax), Math.abs(k[2] - v.bx)) * Math.sign(k[0] + k[2] - v.ax - v.bx) : 0, dy = v ? Math.max(Math.abs(k[1] - v.ay), Math.abs(k[3] - v.by)) * Math.sign(k[1] + k[3] - v.ay - v.by) : 0;
      return { ax: k[0], ay: k[1], bx: k[2], by: k[3], r: k[4], mus: 0.03, muk: 0.01, dx, dy, v: Math.hypot(dx, dy) };
    });
    mo.cinesPrec = mo.cines;
  };
  const calme = (mo) => mo.parts.every((p) => p.tenu || Math.abs(p.x - p.px) + Math.abs(p.y - p.py) < 0.25);
  const PINCE = { sol: 392, chute: 124, haut: 196, rail: 24, L0: 46, xmin: 196, xmax: W - 64, depart: 450 };
  PINCE.Lmax = PINCE.sol - 100 - (PINCE.rail + 14);
  PINCE.xChute = PINCE.chute / 2;
  const POUSSE = { table: 318, bord: 560, rail: 24, course: 150, xmin: 40, xmax: 500, depart: 300, haut: 74 };
  const creerMonde = (m) => {
    const mo = { parts: [], corps: [], segs: [], cines: [], cinesPrec: null };
    const seg = (ax, ay, bx, by, r, mus, muk) => mo.segs.push({ ax, ay, bx, by, r, mus, muk });
    seg(-30, -400, -30, H + 300, 30, 0.1, 0.05);
    seg(W + 30, -400, W + 30, H + 300, 30, 0.1, 0.05);
    if (m.type === "pince") {
      const g = PINCE;
      seg(g.chute + 140, g.sol + 140, W + 200, g.sol + 140, 140, 0.7, 0.45);
      seg(g.chute, g.haut, g.chute, H + 300, 6);
      seg(g.chute + 22, g.sol - 28, g.chute + 132, g.sol + 16, 18, 0.04, 0.02);
    } else {
      const g = POUSSE;
      seg(-200, g.table + 140, g.bord - 140, g.table + 140, 140, 0.95, 0.62);
      seg(g.bord - 20, g.table - 4, g.bord - 20, g.table - 4, 11);
    }
    return mo;
  };
  const nbDedans = (m) => m.type === "pince" ? 24 : 16;
  const nouveauCorps = (m) => {
    if (m.entrainement) return { jeton: Math.floor(Math.random() * JETONS.length), taille: [1, 1] };
    const deja = new Set(m.monde.corps.map((c) => c.id)), id = m.file.find((x) => !deja.has(x));
    return id ? { id, taille: tailleDe(id) } : null;
  };
  const zoneDepot = (m) => m.type === "pince" ? [PINCE.chute + 96, W - 50] : [44, POUSSE.bord - 150];
  const remplir = (m, n, pluie) => {
    const [a, b] = zoneDepot(m), cols = Math.floor((b - a) / 72) + 1;
    for (let k = 0; k < n; k++) {
      const c = nouveauCorps(m);
      if (!c) return;
      const col = k * 5 % cols, x = pluie ? a + Math.random() * (b - a) : a + col * 72 + (Math.random() - 0.5) * 40, rang = Math.floor(k / cols);
      const sol = (m.type === "pince" ? PINCE.sol : POUSSE.table) - 34;
      ajouterCorps(m.monde, c, x, pluie ? -60 - k * 90 : Math.max(120, sol - rang * 64 - Math.sin(Math.PI * col / (cols - 1 || 1)) * 40), (Math.random() - 0.5) * 0.7);
    }
  };
  const installer = (m) => {
    if (m.monde) return;
    m.monde = creerMonde(m);
    remplir(m, nbDedans(m), false);
    m.jeu = m.type === "pince" ? { etat: "attente", cx: PINCE.depart, vx: 0, cible: PINCE.depart, L: PINCE.L0, phi: 0, vphi: 0, oG: 0.35, oD: 0.35, t: 0, tenus: [], gains: [], dir: 0, xJoueur: PINCE.depart } : { etat: "attente", x: POUSSE.depart, cible: POUSSE.depart, yb: POUSSE.haut, t: 0, charge: 0, gains: [], dir: 0, xJoueur: POUSSE.depart };
    for (let k = 0; k < 480; k++) pas(m.monde, 1 / 120);
    positionnerOutil(m, 0);
    for (const c of m.monde.corps.slice()) if (c.parts.every((p) => p.y > H)) retirerCorps(m.monde, c);
  };
  const forme = (hx, hy, phi, oG, oD) => {
    const c = Math.cos(phi), s = Math.sin(phi), R = (x, y) => [hx + x * c + y * s, hy - x * s + y * c];
    const doigt = (sg, o) => [R(sg * 20, 10), R(sg * (40 + 44 * o), 60), R(sg * (14 + 52 * o), 96)];
    return { R, tete: [...R(-24, 0), ...R(24, 0)], toit: [R(-34, -6), R(0, -30), R(34, -6)], g: doigt(-1, oG), d: doigt(1, oD) };
  };
  const positionnerOutil = (m, dt) => {
    const j = m.jeu;
    if (m.type === "pince") {
      j.hx = j.cx + Math.sin(j.phi) * j.L;
      j.hy = PINCE.rail + 14 + Math.cos(j.phi) * j.L;
      const D = j.D = forme(j.hx, j.hy, j.phi, j.oG, j.oD);
      cinematiques(m.monde, [
        [...D.tete, 14],
        [...D.g[0], ...D.g[1], 6],
        [...D.g[1], ...D.g[2], 6],
        [...D.d[0], ...D.d[1], 6],
        [...D.d[1], ...D.d[2], 6],
        [...D.toit[0], ...D.toit[1], 5],
        [...D.toit[1], ...D.toit[2], 5]
      ]);
      for (const t of j.tenus) t.c.parts.forEach((p, k) => {
        if (dt && t.petit) t.off[k][0] *= 1 - dt * 2.5;
        const [x, y] = D.R(t.off[k][0], t.off[k][1]);
        p.px = p.x;
        p.py = p.y;
        p.x = x;
        p.y = y;
      });
    } else cinematiques(m.monde, [[j.x, 0, j.x, j.yb - 44, 7], [j.x, j.yb - 40, j.x, j.yb, 15]]);
  };
  const maxEnfoncement = (mo, ks, filtre) => {
    let d = -99;
    for (const k of ks) for (const p of mo.parts) if (!p.tenu && (!filtre || filtre(p))) d = Math.max(d, enfoncement(p, mo.cines[k]).d);
    return d;
  };
  const gros = (p) => p.r > 40 || p.c.parts.length > 1;
  const prise = (m, j) => {
    const { hx, hy } = j, D = j.D, cand = [];
    const dansCage = (p) => p.y > hy + 6 && p.y < hy + 92 && Math.abs(p.x - hx) < 38;
    for (const c of m.monde.corps) {
      const ps = c.parts, n = ps.length, dedans = ps.filter(dansCage).length;
      const mx = ps.reduce((a, p) => a + p.x, 0) / n, my = ps.reduce((a, p) => a + p.y, 0) / n, dx = mx - hx;
      let q = 0;
      if (n === 1 && ps[0].r < 40) {
        if (dedans) q = 0.74 - 0.7 * (dx / 38) ** 2;
      } else if (n === 1) {
        if (hy + 96 > my + 6 && Math.abs(dx) < ps[0].r * 0.5 && j.bloqueG && j.bloqueD) q = 0.5 - 0.7 * Math.abs(dx) / ps[0].r;
      } else if (dedans || hy + 96 > my && Math.abs(dx) < 50) q = (dedans === n ? 0.62 : 0.45) - Math.abs(dx) / 120 - (c.axe ? 0.06 : 0);
      if (q <= 0) continue;
      const dessus = m.monde.parts.some((o) => o.c !== c && !dansCage(o) && ps.some((p) => o.y < p.y - 8 && Math.hypot(o.x - p.x, o.y - p.y) < o.r + p.r + 3));
      if (dessus) q -= 0.18;
      cand.push({ c, q: clamp(q, 0.05, 0.95) });
    }
    const c2 = Math.cos(j.phi), s2 = Math.sin(j.phi);
    const meilleur = cand.sort((a, b) => b.q - a.q)[0];
    j.tenus = meilleur ? [meilleur].map(({ c, q }) => {
      c.parts.forEach((p) => {
        p.tenu = true;
        p.w0 = p.w;
        p.w = 0;
      });
      return { c, q, petit: c.parts.length === 1 && c.parts[0].r < 40, off: c.parts.map((p) => {
        const x = p.x - hx, y = p.y - hy;
        return [x * c2 - y * s2, x * s2 + y * c2];
      }) };
    }) : [];
    j.rate = meilleur && Math.random() > meilleur.q ? { quand: 0.08 + Math.random() * 0.85 } : null;
    j.desserre = 0;
    j.Lbas = j.L;
    if (D) son("clac");
  };
  const lacher = (c) => c.parts.forEach((p) => {
    if (p.tenu) {
      p.tenu = false;
      p.w = p.w0;
    }
  });
  const glisser = (j, avance) => {
    if (!j.rate || avance < j.rate.quand) return;
    j.rate = null;
    j.desserre = 0.45;
    j.glisses = (j.glisses || 0) + 1;
    son("glisse");
    for (const t of j.tenus) {
      lacher(t.c);
      if (!t.petit) {
        const sens = Math.random() < 0.5 ? -1 : 1;
        t.c.parts.forEach((p) => p.px = p.x - sens * 1.6);
      }
    }
    j.tenus = [];
  };
  const serrer = (j, dt) => {
    if (j.desserre > 0) {
      j.desserre -= dt;
      j.oG = Math.min(0.9, j.oG + dt * 4);
      j.oD = Math.min(0.9, j.oD + dt * 4);
    } else {
      j.oG = Math.max(j.fermeG, j.oG - dt * 2);
      j.oD = Math.max(j.fermeD, j.oD - dt * 2);
    }
  };
  const avancerPince = (m, j, dt) => {
    const g = PINCE, v0 = j.vx;
    j.t += dt;
    let cible = j.etat === "transport" ? g.xChute : j.etat === "retour" ? j.xJoueur : j.cible;
    if (j.etat === "attente") cible = j.cible = clamp(j.cible + j.dir * 280 * dt, g.xmin, g.xmax);
    const roule = ["attente", "approche", "transport", "retour"].includes(j.etat);
    j.vx = roule ? clamp((cible - j.cx) * 7, -320, 320) : 0;
    j.cx += j.vx * dt;
    const Lp = j.L + 60, brise = j.etat === "attente" ? Math.sin(j.t * 1.9) * 0.35 : 0;
    j.vphi += (-(G / Lp) * Math.sin(j.phi) - 4 * j.vphi - (j.vx - v0) / dt / Lp * 0.55 + brise) * dt;
    j.phi = clamp(j.phi + j.vphi * dt, -0.32, 0.32);
    moteur(Math.abs(j.vx) > 10 || j.etat === "descente" || j.etat === "montee");
    switch (j.etat) {
      case "approche":
        if (Math.abs(j.cx - j.cible) < 1.5 && Math.abs(j.phi) < 0.05) {
          j.etat = "descente";
          j.t = 0;
          j.bloqueG = j.bloqueD = false;
          son("descend");
        }
        break;
      case "descente":
        j.oG = j.oD = Math.min(1, j.oG + dt * 3);
        j.L += 170 * dt;
        if (j.L >= g.Lmax || j.t > 0.15 && (maxEnfoncement(m.monde, [0]) > 1 || maxEnfoncement(m.monde, [2, 4]) > 5)) {
          j.L = Math.min(j.L, g.Lmax);
          j.etat = "fermeture";
          j.t = 0;
        }
        break;
      case "fermeture": {
        const v = dt / 0.5;
        const bute = (sg, o) => {
          const D = forme(j.hx, j.hy, j.phi, sg < 0 ? o : j.oG, sg > 0 ? o : j.oD), f = sg < 0 ? D.g : D.d;
          return [[...f[0], ...f[1]], [...f[1], ...f[2]]].some((k) => m.monde.parts.some((p) => !p.tenu && gros(p) && enfoncement(p, { ax: k[0], ay: k[1], bx: k[2], by: k[3], r: 6 }).d > 0));
        };
        if (!j.bloqueG) {
          if (bute(-1, j.oG - v)) j.bloqueG = true;
          else j.oG = Math.max(0, j.oG - v);
        }
        if (!j.bloqueD) {
          if (bute(1, j.oD - v)) j.bloqueD = true;
          else j.oD = Math.max(0, j.oD - v);
        }
        if (j.t > 0.6) {
          j.fermeG = j.oG;
          j.fermeD = j.oD;
          prise(m, j);
          j.etat = "montee";
          j.t = 0;
          son("monte");
        }
        break;
      }
      case "montee":
        j.L -= (j.tenus.some((t) => !t.petit) ? 90 : 130) * dt;
        glisser(j, 0.55 * (1 - (j.L - g.L0) / Math.max(1, j.Lbas - g.L0)));
        serrer(j, dt);
        if (j.L <= g.L0) {
          j.L = g.L0;
          j.etat = "transport";
          j.t = 0;
        }
        break;
      case "transport":
        glisser(j, 0.55 + 0.45 * clamp(1 - (j.cx - g.xChute) / Math.max(1, j.xJoueur - g.xChute), 0, 1));
        serrer(j, dt);
        if (Math.abs(j.cx - g.xChute) < 2) {
          j.etat = "lacher";
          j.t = 0;
        }
        break;
      case "lacher":
        j.oG = j.oD = Math.min(1, j.oG + dt * 4);
        if (j.t > 0.1 && j.tenus.length) {
          j.tenus.forEach((t) => lacher(t.c));
          j.tenus = [];
        }
        if (j.t > 0.8) {
          j.etat = "retour";
          j.t = 0;
        }
        break;
      case "retour":
        j.oG = j.oD = Math.max(0.35, j.oG - dt);
        if (Math.abs(j.cx - j.xJoueur) < 2) {
          j.etat = "repos";
          j.t = 0;
        }
        break;
      case "repos":
        if (j.t > 1.6 || j.t > 0.4 && calme(m.monde)) {
          j.etat = "attente";
          finPartie(m);
        }
        break;
      default:
        j.oG = j.oD = j.oG + (0.35 - j.oG) * Math.min(1, dt * 4);
    }
  };
  const avancerPousseur = (m, j, dt) => {
    const g = POUSSE;
    j.t += dt;
    let roule = false;
    switch (j.etat) {
      case "attente":
        j.cible = clamp(j.cible + j.dir * 280 * dt, g.xmin, g.xmax);
        roule = Math.abs(j.cible - j.x) > 1;
        j.x += clamp((j.cible - j.x) * 8, -320, 320) * dt;
        break;
      case "approche":
        roule = true;
        j.x += clamp((j.cible - j.x) * 8, -320, 320) * dt;
        if (Math.abs(j.x - j.cible) < 1.5) {
          j.etat = "descente";
          j.t = 0;
          son("descend");
        }
        break;
      case "descente":
        j.yb += 300 * dt;
        roule = true;
        if (j.yb >= g.table - 17 || j.t > 0.1 && maxEnfoncement(m.monde, [1]) > 6) {
          j.etat = "poussee";
          j.t = 0;
          j.x0 = j.x;
          son("pousse");
        }
        break;
      case "poussee":
        roule = true;
        j.x += 165 / (1 + 0.14 * j.charge) * dt;
        if (j.x - j.x0 >= g.course || j.t > 1.6) {
          j.etat = "remontee";
          j.t = 0;
        }
        break;
      // le poids poussé ralentit le bras
      case "remontee":
        roule = true;
        j.yb -= 320 * dt;
        if (j.yb <= g.haut) {
          j.yb = g.haut;
          j.etat = "retour";
        }
        break;
      case "retour":
        roule = true;
        j.x += clamp((j.xJoueur - j.x) * 6, -300, 300) * dt;
        if (Math.abs(j.x - j.xJoueur) < 1.5) {
          j.etat = "repos";
          j.t = 0;
        }
        break;
      case "repos":
        if (j.t > 2.4 || j.t > 0.7 && calme(m.monde)) {
          j.etat = "attente";
          finPartie(m);
        }
        break;
    }
    moteur(roule);
    j.charge = 0;
    const bras = m.monde.cines[1];
    if (bras) {
      for (const p of m.monde.parts) if (enfoncement(p, bras).d > -2) j.charge += 1 / p.w;
    }
  };
  const ramasser = (m) => {
    const mo = m.monde;
    for (const c of mo.corps.slice()) {
      if (c.parts.some((p) => p.y < H + 60)) continue;
      const x = c.parts[0].x, gagne = m.type === "pince" ? x < PINCE.chute : x > POUSSE.bord - 30;
      retirerCorps(mo, c);
      if (gagne) {
        son("tombe");
        m.jeu.gains.push(c);
        if (c.id) c.fois = enregistrer(m, c.id);
        if (m.jeu.etat === "attente") finPartie(m);
      } else ajouterCorps(mo, c, zoneDepot(m)[0] + 80, -60);
    }
  };
  const avancer = (m, dt) => {
    m.type === "pince" ? avancerPince(m, m.jeu, dt) : avancerPousseur(m, m.jeu, dt);
    positionnerOutil(m, dt);
    pas(m.monde, dt);
    ramasser(m);
  };
  let racine = null, hote = null, vue = "hall", sel = 1, mJeu = null, boucle = 0, minuteries = [], boiteOuverte = false, gainOuvert = null, ficheOuverte = null;
  const $ = (s) => racine?.querySelector(s);
  const plus_tard = (f, ms) => {
    const t = setTimeout(f, ms);
    minuteries.push(t);
    return t;
  };
  const STYLE = css(`
  .pcv-arcade { position: absolute; inset: 0; z-index: 30; overflow: hidden; font-family: var(--pcv-police, Nunito, sans-serif); color: #4b3a5e; background: #ffe3f0;
    user-select: none; -webkit-user-select: none; touch-action: none; -webkit-tap-highlight-color: transparent; }
  .pcv-arcade * { box-sizing: border-box; }
  .pcv-arcade button { font: inherit; color: inherit; border: 0; background: none; padding: 0; cursor: pointer; }
  .pcv-arcade .tch { display: inline-flex; align-items: center; justify-content: center; min-width: 30u; height: 30u; padding: 0 7u; border-radius: 15u;
    background: radial-gradient(circle at 50% 30%, #6b5a84, #3d2f52); color: var(--pcv-sur-accent); font-size: 14u; font-weight: 900; box-shadow: 0 2u 0 rgba(0,0,0,.25); }
  
  .pcv-arcade .salle { position: absolute; inset: 0; transition: transform .6s cubic-bezier(.55,0,.35,1), opacity .5s; }
  .pcv-arcade .salle.zoom { transform: scale(2.4); opacity: 0; pointer-events: none; }
  .pcv-arcade .salle.eteinte { display: none; }
  .pcv-arcade .mur { position: absolute; left: 0; right: 0; top: 0; height: 540u; overflow: hidden; background: linear-gradient(180deg, #ffe9a8 0%, #ffd7e3 62%, #ffc4de 100%); }
  .pcv-arcade .rayures { position: absolute; left: -1200u; width: 4000u; top: 0; bottom: 0; transition: transform .7s cubic-bezier(.3,1.1,.4,1);
    background: repeating-linear-gradient(90deg, rgba(255,255,255,.28) 0 44u, rgba(255,255,255,0) 44u 88u); }
  .pcv-arcade .auvent { position: absolute; left: 0; right: 0; top: 0; height: 34u; background: repeating-linear-gradient(90deg, #ff6fa3 0 50u, #fff 50u 100u); box-shadow: 0 3u 0 rgba(0,0,0,.06); }
  .pcv-arcade .festons { position: absolute; left: 0; right: 0; top: 33u; height: 26u; filter: drop-shadow(0 4u 3u rgba(160,40,90,.18));
    background: radial-gradient(circle at 50% 0, #ff6fa3 0 24u, transparent 25u) 0 0 / 100u 26u repeat-x, radial-gradient(circle at 50% 0, #fff 0 24u, transparent 25u) 50u 0 / 100u 26u repeat-x; }
  .pcv-arcade .guirlande { position: absolute; left: -640u; top: 52u; width: 2560u; height: 90u; transition: transform .7s cubic-bezier(.3,1.1,.4,1); }
  .pcv-arcade .guirlande .a1, .pcv-arcade .amp.a1 { animation: pcvA-clign 1.2s steps(1) infinite; }
  .pcv-arcade .guirlande .a2, .pcv-arcade .amp.a2 { animation: pcvA-clign 1.2s steps(1) -.4s infinite; }
  .pcv-arcade .guirlande .a3, .pcv-arcade .amp.a3 { animation: pcvA-clign 1.2s steps(1) -.8s infinite; }
  @keyframes pcvA-clign { 0% { opacity: 1; } 33.3% { opacity: .22; } }
  .pcv-arcade .projo { position: absolute; top: -30u; width: 400u; height: 620u; opacity: .6; transform-origin: 50% 0;
    background: conic-gradient(from 166deg at 50% 0, rgba(255,255,255,0) 0deg, rgba(255,255,255,.7) 14deg, rgba(255,255,255,0) 28deg); animation: pcvA-balaye 6.5s ease-in-out infinite alternate; }
  .pcv-arcade .projo.p1 { left: 70u; } .pcv-arcade .projo.p2 { right: 70u; animation-delay: -3.2s; }
  @keyframes pcvA-balaye { from { transform: rotate(-16deg); } to { transform: rotate(16deg); } }
  .pcv-arcade .sol { position: absolute; left: 0; right: 0; top: 520u; bottom: 0; overflow: hidden; perspective: 420u; perspective-origin: 50% 0; background: #ffd3e8; }
  .pcv-arcade .sol i { position: absolute; left: -80%; right: -80%; top: 0; height: 300%; transform-origin: 50% 0; transform: rotateX(70deg);
    background: repeating-conic-gradient(#fff5fa 0 25%, #ffcfe5 0 50%) 0 0 / 120u 120u; }
  .pcv-arcade .sol::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,196,222,.95), rgba(255,196,222,0) 45%); }
  .pcv-arcade .rail { position: absolute; left: 0; top: 92u; height: 480u; transition: transform .62s cubic-bezier(.3,1.18,.42,1); }
  .pcv-arcade .rail.glisse { transition: none; }
  
  .pcv-arcade .borne { position: absolute; top: 0; width: 250u; height: 470u; cursor: pointer; transition: transform .38s cubic-bezier(.3,1.6,.5,1);
    transform: scale(.88) translateY(26u); transform-origin: 50% 100%; }
  .pcv-arcade .borne.choisi { transform: translateY(-6u); z-index: 2; }
  .pcv-arcade .borne .bloc { position: absolute; inset: 0; animation: pcvA-arrivee .8s cubic-bezier(.3,1.35,.5,1) backwards; }
  @keyframes pcvA-arrivee { from { transform: translateY(-130%) rotate(-5deg); opacity: 0; } 60% { opacity: 1; } }
  .pcv-arcade .borne .ombre { position: absolute; left: -10u; right: -10u; bottom: -26u; height: 52u; border-radius: 50%; background: radial-gradient(closest-side, rgba(120,30,80,.28), rgba(120,30,80,0)); }
  .pcv-arcade .borne.choisi .ombre { background: radial-gradient(closest-side, rgba(255,255,255,1), rgba(255,255,255,0)); left: -50u; right: -50u; height: 80u; bottom: -40u; }
  .pcv-arcade .caisse { position: absolute; left: 14u; right: 14u; top: 66u; bottom: 0; border-radius: 30u 30u 22u 22u;
    background: linear-gradient(90deg, var(--c2) 0%, var(--c) 16%, var(--c) 84%, var(--c2) 100%);
    box-shadow: inset 0 5u 0 rgba(255,255,255,.35), inset 0 -10u 0 rgba(0,0,0,.12), 0 18u 26u rgba(140,40,90,.22); }
  .pcv-arcade .vitre { position: absolute; left: 16u; right: 16u; top: 42u; height: 196u; border-radius: 22u; overflow: hidden;
    background: linear-gradient(180deg, var(--c3) 0%, #fff 100%); box-shadow: inset 0 0 0 5u rgba(255,255,255,.95), inset 0 -16u 20u rgba(0,0,0,.06), 0 4u 0 rgba(0,0,0,.1); }
  .pcv-arcade .vitre .tas img, .pcv-arcade .vitre .tas i { position: absolute; width: 58u; height: 58u; object-fit: contain; }
  .pcv-arcade .vitre .tas i { border-radius: 50%; }
  .pcv-arcade .vitre .tas .plancher { left: 0; right: 0; bottom: 0; top: auto; width: auto; height: 18u; border-radius: 0; background: linear-gradient(180deg, var(--c3), var(--c)); }
  .pcv-arcade .reflet { position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(118deg, rgba(255,255,255,.7) 0 10%, rgba(255,255,255,0) 10.5% 27%, rgba(255,255,255,.3) 27.5% 33%, rgba(255,255,255,0) 33.5%); }
  .pcv-arcade .pince-mini { position: absolute; left: 50%; top: 0; width: 6u; height: 62u; margin-left: -3u; background: #8a93a3; transform-origin: 50% 0; animation: pcvA-oscille 2.6s ease-in-out infinite alternate; }
  .pcv-arcade .pince-mini b { position: absolute; left: -17u; bottom: -16u; width: 40u; height: 22u; border-radius: 10u; background: linear-gradient(180deg, var(--c3), var(--c)); box-shadow: inset 0 -3u 0 var(--c2); }
  .pcv-arcade .pince-mini b::before, .pcv-arcade .pince-mini b::after { content: ""; position: absolute; top: 16u; width: 8u; height: 30u; border-radius: 4u; background: #dfe5ee; box-shadow: inset -2u 0 0 #9aa3b2; }
  .pcv-arcade .pince-mini b::before { left: 0; transform: rotate(18deg); transform-origin: 50% 0; } .pcv-arcade .pince-mini b::after { right: 0; transform: rotate(-18deg); transform-origin: 50% 0; }
  .pcv-arcade .bras-mini { position: absolute; left: 30%; top: 0; width: 10u; height: 120u; border-radius: 5u; background: repeating-linear-gradient(180deg, #ffd23f 0 12u, #4b3a5e 12u 24u); animation: pcvA-pousse 2.4s ease-in-out infinite; }
  .pcv-arcade .bras-mini::after { content: ""; position: absolute; left: -10u; bottom: -8u; width: 30u; height: 40u; border-radius: 12u; background: linear-gradient(90deg, var(--c), var(--c3)); }
  @keyframes pcvA-oscille { from { transform: rotate(-7deg); } to { transform: rotate(7deg); } }
  @keyframes pcvA-pousse { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(46u); } }
  .pcv-arcade .plaque { position: absolute; left: 50%; top: 250u; transform: translateX(-50%); padding: 5u 16u; border-radius: 16u; background: #fff; color: var(--c2);
    font-weight: 900; font-size: 14u; letter-spacing: .08em; box-shadow: 0 3u 0 rgba(0,0,0,.14); white-space: nowrap; }
  .pcv-arcade .pupitre { position: absolute; left: 10u; right: 10u; top: 292u; height: 52u; border-radius: 16u 16u 10u 10u; background: linear-gradient(180deg, var(--c3), var(--c));
    box-shadow: inset 0 4u 0 rgba(255,255,255,.55), 0 6u 0 var(--c2); }
  .pcv-arcade .pupitre .manche { position: absolute; left: 40u; top: -20u; width: 28u; height: 28u; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff 0 4u, #ff4d6d 7u, #c9183f 100%); }
  .pcv-arcade .pupitre .manche::after { content: ""; position: absolute; left: 11u; top: 24u; width: 6u; height: 18u; background: #5d6675; border-radius: 3u; }
  .pcv-arcade .pupitre .bouton { position: absolute; right: 36u; top: 13u; width: 40u; height: 24u; border-radius: 50%; background: radial-gradient(circle at 40% 30%, #fff8c8 0 3u, #ffd23a 7u, #e0a400); box-shadow: 0 4u 0 #a87700; }
  .pcv-arcade .borne.choisi .pupitre .bouton { animation: pcvA-appuie 1s ease-in-out infinite; }
  @keyframes pcvA-appuie { 50% { transform: translateY(3u); } }   
  .pcv-arcade .trappe { position: absolute; left: 50%; bottom: 22u; width: 96u; height: 44u; margin-left: -48u; border-radius: 12u; background: linear-gradient(180deg, #2c2140, #47365f);
    box-shadow: inset 0 8u 10u rgba(0,0,0,.5), 0 0 0 5u rgba(255,255,255,.55); }
  .pcv-arcade .fronton { position: absolute; left: 0; right: 0; top: 0; height: 94u; border-radius: 36u; z-index: 2; display: flex; align-items: center; gap: 10u; padding: 0 16u;
    background: radial-gradient(120% 100% at 50% 0%, var(--c3) 0%, var(--c) 58%, var(--c2) 100%);
    box-shadow: inset 0 6u 0 rgba(255,255,255,.55), inset 0 -6u 0 rgba(0,0,0,.14), 0 8u 14u rgba(0,0,0,.16); }
  .pcv-arcade .amp { position: absolute; left: 26u; right: 26u; height: 12u; background: radial-gradient(circle, #fffde8 0 2.6u, #ffcf40 3.6u, rgba(255,207,64,0) 5.6u) var(--o, 0) 50% / 18u 12u repeat-x; }
  .pcv-arcade .amp.h { top: 2u; } .pcv-arcade .amp.b { bottom: 2u; } .pcv-arcade .amp.a2 { --o: 6u; } .pcv-arcade .amp.a3 { --o: 12u; }
  .pcv-arcade .borne:not(.allumee) .amp { animation: none; opacity: .25; }
  .pcv-arcade .borne.allumee:not(.proche) .amp { animation: none; opacity: .8; }   
  .pcv-arcade .fronton .ic { flex: none; width: 52u; height: 52u; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3u 0 rgba(0,0,0,.16), inset 0 -3u 0 rgba(0,0,0,.06); overflow: hidden; font-size: 26u; }
  .pcv-arcade .fronton .ic img { width: 44u; height: 44u; border-radius: 10u; }
  .pcv-arcade .fronton .tx { min-width: 0; }
  .pcv-arcade .fronton b { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; color: #fff; font-size: 21u; font-weight: 900; line-height: 1.02; overflow: hidden;
    text-shadow: 0 2u 0 var(--c2), 2u 0 0 var(--c2), -2u 0 0 var(--c2), 0 -1u 0 var(--c2); }
  .pcv-arcade .fronton small { display: block; margin-top: 3u; font-size: 13u; font-weight: 800; color: rgba(255,255,255,.95); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pcv-arcade .prix { position: absolute; right: -8u; top: 78u; z-index: 3; width: 64u; height: 64u; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center;
    background: radial-gradient(circle at 40% 30%, #fff, #fff3b8); color: #b26b00; font-size: 12u; font-weight: 900; line-height: 1.05; transform: rotate(14deg);
    box-shadow: 0 0 0 4u #ffd23f, 0 5u 8u rgba(0,0,0,.18); }
  .pcv-arcade .borne.choisi .prix { animation: pcvA-balance 1.6s ease-in-out infinite alternate; }
  @keyframes pcvA-balance { from { transform: rotate(4deg); } to { transform: rotate(20deg); } }
  
  .pcv-arcade .hud-g { position: absolute; left: 22u; top: 66u; z-index: 5; display: flex; align-items: center; gap: 10u; padding: 6u 18u 6u 6u; border-radius: 28u; background: color-mix(in srgb, var(--pcv-carte) 92%, transparent);
    box-shadow: 0 4u 0 rgba(200,90,140,.18), 0 8u 18u rgba(160,50,100,.15); }
  .pcv-arcade .hud-g .logo { width: 44u; height: 44u; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24u; background: linear-gradient(180deg, #ff9cc4, #ff6fa3); }
  .pcv-arcade .hud-g b { display: block; font-size: 19u; font-weight: 900; } .pcv-arcade .hud-g small { display: block; font-size: 13u; font-weight: 800; color: #9a7aa8; }
  .pcv-arcade .hud-d { position: absolute; right: 22u; top: 66u; z-index: 40; display: flex; gap: 10u; transition: transform .4s cubic-bezier(.3,1.4,.5,1); }
  .pcv-arcade .pil { display: flex; align-items: center; gap: 9u; height: 56u; padding: 0 18u 0 7u; border-radius: 28u; background: color-mix(in srgb, var(--pcv-carte) 95%, transparent);
    box-shadow: 0 4u 0 rgba(200,90,140,.18), 0 8u 18u rgba(160,50,100,.15); font-weight: 900; font-size: 22u; }
  .pcv-arcade .pil small { display: block; font-size: 12u; font-weight: 800; color: #9a7aa8; line-height: 1; }
  .pcv-arcade .pil .n { line-height: 1; }
  .pcv-arcade .piece { flex: none; width: 42u; height: 42u; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #b06a00; font-size: 20u; font-weight: 900;
    background: radial-gradient(circle at 35% 30%, #fffbe0 0 4u, #ffd84a 9u, #f0a400 100%); box-shadow: inset 0 0 0 3u #ffe98a, 0 3u 0 #c27c00; }
  .pcv-arcade .pil.saute { animation: pcvA-saute .5s cubic-bezier(.3,1.8,.5,1); }
  .pcv-arcade .pil.secoue { animation: pcvA-secoue .45s; }
  @keyframes pcvA-saute { 40% { transform: scale(1.18) translateY(-4u); } }
  @keyframes pcvA-secoue { 20%, 60% { transform: translateX(-8u); } 40%, 80% { transform: translateX(8u); } }
  .pcv-arcade .coffre { width: 42u; height: 42u; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 22u; background: linear-gradient(180deg, #8fe3ff, #39b8f0); }
  .pcv-arcade .aide { position: absolute; right: 22u; bottom: 16u; z-index: 5; display: flex; gap: 8u; }
  .pcv-arcade .aide button { display: flex; align-items: center; gap: 7u; height: 42u; padding: 0 15u 0 6u; border-radius: 21u; background: color-mix(in srgb, var(--pcv-carte) 92%, transparent); font-size: 15u; font-weight: 900;
    box-shadow: 0 3u 0 rgba(200,90,140,.18); }
  
  .pcv-arcade .pipo { position: absolute; left: 22u; bottom: 4u; width: 150u; height: 164u; z-index: 41; cursor: pointer; transition: transform .5s cubic-bezier(.3,1.5,.5,1); animation: pcvA-entre .9s .5s cubic-bezier(.3,1.5,.5,1) backwards; }
  @keyframes pcvA-entre { from { transform: translateY(120%); } }
  .pcv-arcade .pipo svg { width: 100%; height: 100%; overflow: visible; }
  .pcv-arcade .pipo .corps-p { animation: pcvA-dodeline 1.4s ease-in-out infinite; transform-origin: 60px 120px; }
  .pcv-arcade.parle .pipo .corps-p { animation-duration: .45s; }
  @keyframes pcvA-dodeline { 50% { transform: translateY(-4px) scale(1.02, .98); } }
  .pcv-arcade .pipo .yeux { animation: pcvA-cligne 3.6s infinite; transform-origin: 60px 60px; }
  @keyframes pcvA-cligne { 0%, 92%, 100% { transform: none; } 95% { transform: scaleY(.1); } }
  .pcv-arcade .pipo .bec-b { transform-origin: 60px 80px; }
  .pcv-arcade.parle .pipo .bec-b { animation: pcvA-bec .16s infinite alternate; }
  @keyframes pcvA-bec { to { transform: translateY(5px); } }
  .pcv-arcade .pipo .aile-d { transform-origin: 98px 74px; animation: pcvA-salue 1.8s ease-in-out infinite; }
  @keyframes pcvA-salue { 0%, 60%, 100% { transform: none; } 70%, 90% { transform: rotate(-35deg); } 80% { transform: rotate(-10deg); } }
  .pcv-arcade .bulle { position: absolute; left: 172u; bottom: 70u; z-index: 41; max-width: 330u; padding: 12u 22u 14u; border-radius: 26u; background: var(--pcv-carte); font-size: 19u; font-weight: 800; line-height: 1.3;
    box-shadow: 0 6u 0 rgba(200,90,140,.16), 0 12u 26u rgba(120,40,90,.18); opacity: 0; transform: scale(.6) translateY(20u); transform-origin: 0 100%; transition: opacity .2s, transform .35s cubic-bezier(.3,1.6,.5,1); pointer-events: none; }
  .pcv-arcade .bulle.on { opacity: 1; transform: none; pointer-events: auto; }
  .pcv-arcade .bulle::before { content: ""; position: absolute; left: -12u; bottom: 18u; border: 12u solid transparent; border-right-color: var(--pcv-carte); border-left: 0; }
  .pcv-arcade .bulle em { display: block; font-style: normal; font-size: 13u; font-weight: 900; color: #ff6fa3; letter-spacing: .05em; }
  .pcv-arcade .bulle p { margin: 0; min-height: 1.3em; }
  .pcv-arcade[data-vue=machine] .bulle { left: 18u; bottom: 186u; max-width: 206u; font-size: 17u; transform-origin: 30% 100%; }
  .pcv-arcade[data-vue=machine] .bulle::before { left: 60u; bottom: -12u; border: 12u solid transparent; border-top-color: var(--pcv-carte); border-bottom: 0; }
  
  .pcv-arcade .jeu { position: absolute; inset: 0; opacity: 0; transform: scale(.8); pointer-events: none; visibility: hidden;
    transition: opacity .35s .15s, transform .55s .1s cubic-bezier(.3,1.25,.5,1), visibility 0s .7s;
    background: radial-gradient(90% 80% at 50% 40%, #fff3f9 0%, #ffd9ea 70%, #ffc6df 100%); }
  .pcv-arcade[data-vue=machine] .jeu { opacity: 1; transform: none; pointer-events: auto; visibility: visible; transition: opacity .35s .15s, transform .55s .1s cubic-bezier(.3,1.25,.5,1), visibility 0s; }
  .pcv-arcade .cabine { position: absolute; left: 236u; top: 4u; width: 790u; height: 644u; }
  .pcv-arcade .cabine .caisse { left: 0; right: 0; top: 40u; bottom: 0; border-radius: 40u 40u 30u 30u; }
  .pcv-arcade .cabine .fronton { left: 60u; right: 60u; height: 72u; justify-content: center; }
  .pcv-arcade .cabine .fronton .ic { width: 50u; height: 50u; }
  .pcv-arcade .cabine .fronton b { font-size: 26u; -webkit-line-clamp: 1; } .pcv-arcade .cabine .fronton .tx { text-align: left; }
  .pcv-arcade .vitre-jeu { position: absolute; left: 15u; top: 78u; width: 760u; height: 440u; border-radius: 26u; overflow: hidden; background: #fff;
    box-shadow: 0 0 0 6u rgba(255,255,255,.95), 0 8u 0 6u rgba(0,0,0,.08); }
  .pcv-arcade .vitre-jeu canvas { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; margin: 0 !important; border-radius: 0 !important;
    background: none !important; box-shadow: none !important; touch-action: none; }   
  .pcv-arcade .vitre-jeu .reflet { opacity: .55; }
  .pcv-arcade .commandes { position: absolute; left: 15u; right: 15u; top: 530u; height: 98u; display: flex; align-items: center; gap: 14u; padding: 0 18u; border-radius: 24u;
    background: linear-gradient(180deg, var(--c3), var(--c)); box-shadow: inset 0 5u 0 rgba(255,255,255,.55), 0 6u 0 var(--c2); }
  .pcv-arcade .bt { flex: none; width: 72u; height: 72u; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30u; font-weight: 900; color: var(--pcv-sur-accent) !important;
    background: radial-gradient(circle at 40% 30%, #8f7aa8, #4b3a5e); box-shadow: 0 6u 0 #2f2340, inset 0 3u 0 rgba(255,255,255,.3); transition: transform .08s, box-shadow .08s; }
  .pcv-arcade .bt:active, .pcv-arcade .bt.presse { transform: translateY(5u); box-shadow: 0 1u 0 #2f2340, inset 0 3u 0 rgba(255,255,255,.3); }
  .pcv-arcade .bt.a { width: auto; padding: 0 28u 0 12u; gap: 10u; border-radius: 36u; font-size: 22u; background: radial-gradient(circle at 40% 25%, #fff8c8 0 5u, #ffd23a 14u, #e39b00); color: #6b3d00 !important; box-shadow: 0 6u 0 #a86d00, inset 0 3u 0 rgba(255,255,255,.5); }
  .pcv-arcade .bt.a .tch { background: #fff; color: #c27c00; }
  .pcv-arcade .bt.a.presse, .pcv-arcade .bt.a:active { box-shadow: 0 1u 0 #a86d00; }
  .pcv-arcade .bt.a.attend { filter: saturate(.3) brightness(1.05); }
  .pcv-arcade .consigne { flex: 1; margin: 0 6u; padding: 8u 12u; border-radius: 18u; background: color-mix(in srgb, var(--pcv-carte) 88%, transparent); text-align: center; color: #5b4670; font-size: 15u; font-weight: 800; line-height: 1.25; }
  .pcv-arcade[data-vue=machine] .hud-d { top: 14u; } .pcv-arcade[data-vue=machine] .hud-d .boite-b { display: none; }
  .pcv-arcade[data-vue=machine] .hud-d .pil { width: 214u; }
  .pcv-arcade .cote { position: absolute; left: 1044u; top: 86u; width: 214u; display: flex; flex-direction: column; gap: 12u; }
  .pcv-arcade .carte { padding: 14u 16u; border-radius: 24u; background: color-mix(in srgb, var(--pcv-carte) 95%, transparent); box-shadow: 0 4u 0 rgba(200,90,140,.16), 0 8u 18u rgba(160,50,100,.12); font-size: 15u; font-weight: 800; }
  .pcv-arcade .carte .t { display: block; font-size: 12u; font-weight: 900; letter-spacing: .08em; color: #b48ac0; margin-bottom: 4u; }
  .pcv-arcade .carte b { font-size: 20u; font-weight: 900; }
  .pcv-arcade .jauge { position: relative; height: 12u; margin-top: 8u; border-radius: 6u; background: #f2e3ee; overflow: hidden; }
  .pcv-arcade .jauge i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 6u; background: linear-gradient(90deg, #ffd23f, #ff8ab0); transition: width .6s cubic-bezier(.3,1.3,.5,1); }
  .pcv-arcade .cote button.carte { display: flex; align-items: center; gap: 10u; text-align: left; font-size: 16u; }
  .pcv-arcade .cote .jetons { display: flex; gap: 3u; margin-top: 6u; } .pcv-arcade .cote .jetons i { width: 14u; height: 14u; border-radius: 50%; background: #eadcea; }
  .pcv-arcade .cote .jetons i.on { background: radial-gradient(circle at 35% 30%, #fff 0 2u, #ffd23f 4u, #f0a400); }
  
  .pcv-arcade .gain { position: absolute; inset: 0; z-index: 60; display: none; background: radial-gradient(70% 70% at 50% 38%, rgba(255,250,225,.97), rgba(255,215,236,.93)); }
  .pcv-arcade .gain.on { display: block; animation: pcvA-fondu .25s; }
  @keyframes pcvA-fondu { from { opacity: 0; } }
  .pcv-arcade .rayons { position: absolute; left: 50%; top: 36%; width: 1200u; height: 1200u; margin: -600u 0 0 -600u; border-radius: 50%; will-change: transform;
    background: repeating-conic-gradient(rgba(255,210,63,.42) 0 9deg, rgba(255,255,255,0) 9deg 18deg); -webkit-mask: radial-gradient(closest-side, #000 20%, transparent 100%); mask: radial-gradient(closest-side, #000 20%, transparent 100%);
    animation: pcvA-tourne 12s linear infinite; }
  @keyframes pcvA-tourne { to { transform: rotate(360deg); } }
  .pcv-arcade .gain .vole { position: absolute; left: 50%; top: 36%; transform: translate(-50%, -50%); object-fit: contain; filter: drop-shadow(0 10u 12u rgba(120,40,90,.3)); }
  .pcv-arcade .gain .jeton-g { position: absolute; left: 50%; top: 36%; width: 200u; height: 200u; margin: -100u 0 0 -100u; border-radius: 50%; }
  .pcv-arcade .gain .carte-g { position: absolute; left: 50%; top: 64%; width: 560u; margin-left: -280u; padding: 18u 26u 22u; border-radius: 34u; background: var(--pcv-carte); text-align: center;
    box-shadow: 0 8u 0 rgba(200,90,140,.18), 0 18u 40u rgba(120,40,90,.2); animation: pcvA-monte .5s .55s cubic-bezier(.3,1.5,.5,1) backwards; }
  @keyframes pcvA-monte { from { transform: translateY(60u) scale(.8); opacity: 0; } }
  .pcv-arcade .carte-g .titre { font-size: 30u; font-weight: 900; color: #ff5d95; }
  .pcv-arcade .carte-g .nom { margin: 2u 0 0; font-size: 20u; font-weight: 900; } .pcv-arcade .carte-g .ser { margin: 2u 0 0; font-size: 15u; font-weight: 800; color: #9a7aa8; }
  .pcv-arcade .choix { display: flex; justify-content: center; gap: 12u; margin-top: 14u; }
  .pcv-arcade .choix button { display: flex; align-items: center; gap: 8u; height: 52u; padding: 0 22u 0 10u; border-radius: 26u; background: #f3e9f2; font-size: 17u; font-weight: 900; transition: transform .15s; }
  .pcv-arcade .choix button.choisi { background: linear-gradient(180deg, #ff9cc4, #ff5d95); color: var(--pcv-sur-accent); transform: scale(1.06); box-shadow: 0 5u 0 #d23a73; }
  .pcv-arcade .confettis i { position: absolute; top: -30u; width: 14u; height: 22u; border-radius: 4u; animation: pcvA-confetti var(--d) cubic-bezier(.3,.6,.6,1) var(--r) forwards; }
  @keyframes pcvA-confetti { to { transform: translate(var(--x), 800u) rotate(var(--a)); } }
  
  .pcv-arcade .boite { position: absolute; inset: 0; z-index: 50; background: linear-gradient(180deg, #fff7d6, #ffe3ef); transform: translateY(105%); transition: transform .45s cubic-bezier(.3,1.15,.45,1); }
  .pcv-arcade .boite.on { transform: none; }
  .pcv-arcade.boite-on .salle, .pcv-arcade.boite-on .jeu { visibility: hidden; }   
  .pcv-arcade .boite .tete-b { position: absolute; left: 22u; top: 14u; display: flex; align-items: center; gap: 12u; height: 56u; padding: 0 22u 0 7u; border-radius: 28u; background: var(--pcv-carte); box-shadow: 0 4u 0 rgba(200,90,140,.16); }
  .pcv-arcade .boite .tete-b b { font-size: 22u; font-weight: 900; } .pcv-arcade .boite .tete-b small { font-size: 14u; font-weight: 800; color: #9a7aa8; }
  .pcv-arcade .onglets { position: absolute; left: 14u; top: 80u; bottom: 66u; width: 346u; overflow-y: auto; touch-action: pan-y; padding: 10u 12u 10u 10u; scrollbar-width: none; }
  .pcv-arcade .onglets::-webkit-scrollbar { display: none; }
  .pcv-arcade .ong { display: flex; align-items: center; gap: 10u; padding: 8u 12u 8u 8u; margin-bottom: 8u; border-radius: 22u; background: color-mix(in srgb, var(--pcv-carte) 75%, transparent); cursor: pointer; transition: transform .15s, background .15s; }
  .pcv-arcade .ong.zero { opacity: .55; }
  .pcv-arcade .ong .ic { flex: none; width: 46u; height: 46u; border-radius: 14u; background: var(--pcv-pastille); display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 2u 0 rgba(0,0,0,.08); }
  .pcv-arcade .ong .ic img { width: 40u; height: 40u; }
  .pcv-arcade .ong .tx { flex: 1; min-width: 0; } .pcv-arcade .ong b { display: block; font-size: 16u; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pcv-arcade .ong small { display: block; font-size: 12u; font-weight: 800; color: #9a7aa8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pcv-arcade .ong .jauge { height: 8u; margin-top: 5u; }
  .pcv-arcade .ong em { flex: none; font-style: normal; font-size: 13u; font-weight: 900; color: #b48ac0; }
  .pcv-arcade .ong.choisi { background: var(--pcv-carte); box-shadow: 0 0 0 4u var(--pcv-anneau-c), 0 0 0 8u #ff8ab0, 0 6u 14u rgba(0,0,0,.12); transform: scale(1.02); }
  .pcv-arcade .boite.grille-active .ong.choisi { box-shadow: 0 0 0 4u #ff8ab0; transform: none; }
  .pcv-arcade .velours { position: absolute; left: 372u; top: 86u; right: 22u; bottom: 72u; border-radius: 30u; overflow: hidden;
    background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.12), rgba(255,255,255,0) 60%), linear-gradient(160deg, #2f8fb0, #1d5f8a); box-shadow: inset 0 0 0 7u var(--pcv-lisere), inset 0 10u 30u rgba(0,0,0,.25), 0 8u 18u rgba(120,40,90,.15); }
  .pcv-arcade .velours .titre-s { position: absolute; left: 24u; top: 18u; right: 24u; color: #fff; font-size: 20u; font-weight: 900; text-shadow: 0 2u 0 rgba(0,0,0,.2); }
  .pcv-arcade .velours .titre-s small { font-size: 14u; font-weight: 800; opacity: .85; margin-left: 8u; }
  .pcv-arcade .grille { position: absolute; left: 14u; right: 14u; top: 54u; bottom: 12u; overflow-y: auto; touch-action: pan-y; display: grid; grid-template-columns: repeat(auto-fill, 98u); grid-auto-rows: 98u; gap: 10u;
    justify-content: center; padding: 10u; scrollbar-width: none; }
  .pcv-arcade .grille::-webkit-scrollbar { display: none; }
  .pcv-arcade .case { position: relative; border-radius: 50%; background: radial-gradient(circle at 50% 60%, rgba(0,0,0,.22), rgba(0,0,0,.08) 70%); display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .pcv-arcade .case:not(.a)::after { content: "?"; color: rgba(255,255,255,.35); font-size: 30u; font-weight: 900; }
  .pcv-arcade .case img { width: 86u; height: 86u; object-fit: contain; filter: drop-shadow(0 4u 3u rgba(0,0,0,.35)); }
  .pcv-arcade .case em { position: absolute; right: 2u; bottom: 2u; min-width: 26u; height: 24u; padding: 0 6u; border-radius: 12u; background: #ffd23f; color: #6b3d00; font-style: normal; font-size: 13u; font-weight: 900; display: flex; align-items: center; justify-content: center; }
  
  .pcv-arcade .assemble { display: inline-grid; flex: none; filter: drop-shadow(0 4u 4u rgba(0,0,0,.3)); }
  .pcv-arcade .assemble img, .pcv-arcade .case .assemble img { width: 100%; height: 100%; object-fit: contain; filter: none; border-radius: 4u; }
  .pcv-arcade .assemble { gap: 2u; }
  .pcv-arcade .assemble img.manque { filter: grayscale(1) brightness(1.5) opacity(.4); background: rgba(255,255,255,.22); outline: 2u dashed rgba(255,255,255,.75); outline-offset: -2u; }
  .pcv-arcade .assemble img.curseur { outline: 4u solid #ffd23f; outline-offset: -2u; background: rgba(255,255,255,.18); }
  .pcv-arcade .fiche .socle .assemble { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); gap: 6u; padding: 8u; border-radius: 16u; background: rgba(255,255,255,.16);
    box-sizing: content-box; animation: pcvA-flotte 2.4s ease-in-out infinite alternate; }
  .pcv-arcade .fiche .socle .assemble img { cursor: pointer; }
  .pcv-arcade .case.plein { box-shadow: inset 0 0 0 4u #ffd23f; }
  .pcv-arcade .case.g::before { content: "GRAND"; position: absolute; left: 50%; bottom: -5u; transform: translateX(-50%); padding: 1u 7u; border-radius: 8u; background: #ff8ab0; color: var(--pcv-sur-accent); font-size: 10u; font-weight: 900; z-index: 1; }
  .pcv-arcade .case.choisi { box-shadow: 0 0 0 4u var(--pcv-anneau-c), 0 0 0 8u #ffd23f; background: rgba(255,255,255,.22); }
  .pcv-arcade .boite .aide { z-index: 2; }
  .pcv-arcade .vide-b { position: absolute; left: 50%; top: 45%; transform: translate(-50%, -50%); width: 520u; text-align: center; color: var(--pcv-sur-accent); font-size: 19u; font-weight: 800; line-height: 1.4; }
  .pcv-arcade .fiche { position: absolute; inset: 0; z-index: 3; display: none; background: rgba(255,230,242,.75); }
  .pcv-arcade .fiche.on { display: block; animation: pcvA-fondu .2s; }
  .pcv-arcade .fiche .carte-f { position: absolute; left: 50%; top: 50%; width: 700u; height: 430u; margin: -215u 0 0 -350u; border-radius: 40u; background: var(--pcv-carte); overflow: hidden;
    box-shadow: 0 10u 0 rgba(200,90,140,.18), 0 24u 50u rgba(120,40,90,.25); animation: pcvA-monte .4s cubic-bezier(.3,1.5,.5,1); }
  .pcv-arcade .fiche .socle { position: absolute; left: 30u; top: 30u; width: 300u; height: 370u; border-radius: 30u; overflow: hidden; background: linear-gradient(160deg, #2f8fb0, #1d5f8a); box-shadow: inset 0 0 0 6u rgba(255,255,255,.6); }
  .pcv-arcade .fiche .socle .rayons { top: 50%; width: 700u; height: 700u; margin: -350u 0 0 -350u; opacity: .5; }
  .pcv-arcade .fiche .socle > img { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); max-width: 240u; max-height: 240u; width: 220u; height: 220u; object-fit: contain; filter: drop-shadow(0 10u 10u rgba(0,0,0,.35)); animation: pcvA-flotte 2.4s ease-in-out infinite alternate; }
  @keyframes pcvA-flotte { to { transform: translate(-50%, -54%) rotate(3deg); } }
  .pcv-arcade .fiche .texte { position: absolute; left: 360u; top: 40u; right: 32u; }
  .pcv-arcade .fiche .texte b { display: block; font-size: 28u; font-weight: 900; line-height: 1.1; } .pcv-arcade .fiche .texte .ser { margin-top: 6u; font-size: 16u; font-weight: 800; color: #9a7aa8; }
  .pcv-arcade .fiche .puces { display: flex; flex-wrap: wrap; gap: 8u; margin-top: 16u; } .pcv-arcade .fiche .puces span { padding: 6u 12u; border-radius: 14u; background: #f6edf5; font-size: 14u; font-weight: 900; }
  .pcv-arcade .fiche .choix { position: absolute; left: 360u; right: 32u; bottom: 32u; flex-direction: column; align-items: stretch; }
  .pcv-arcade .fiche .choix button { justify-content: center; }
  .pcv-arcade .fiche .choix button.off { opacity: .45; }
  .pcv-arcade .fiche .choix.trois { gap: 8u; } .pcv-arcade .fiche .choix.trois button { height: 44u; }
  .pcv-arcade .fiche .puces span.ok { background: #fff1b8; color: #8a5a00; }
  .pcv-arcade .fiche .note { margin: 14u 0 0; font-size: 15u; font-weight: 800; color: #9a7aa8; line-height: 1.35; }
  .pcv-arcade .carte-g .avec-g { display: flex; align-items: center; gap: 18u; text-align: left; justify-content: center; }
  .pcv-arcade .carte-g .prog { margin: 4u 0 0; font-size: 15u; font-weight: 900; color: #ff5d95; }
  .pcv-arcade .carte-g.trois { width: 660u; margin-left: -330u; }
  .pcv-arcade .carte-g.trois .choix button { font-size: 15u; padding: 0 16u 0 8u; }
  
  html[data-pcv-apparence]:not([data-pcv-apparence="clair"]) .pcv-arcade :is(.hud-g, .pil, .aide button, .bulle, .consigne, .carte, .carte-g, .tete-b, .ong, .carte-f) { color: var(--pcv-texte); }
  html[data-pcv-apparence]:not([data-pcv-apparence="clair"]) .pcv-arcade :is(.hud-g small, .pil small, .carte-g .ser, .tete-b small, .ong small, .fiche .texte .ser, .fiche .note) { color: var(--pcv-texte2); }
  html[data-pcv-apparence]:not([data-pcv-apparence="clair"]) .pcv-arcade :is(.carte .t, .ong em) { color: var(--pcv-texte3); }
  html[data-pcv-apparence]:not([data-pcv-apparence="clair"]) .pcv-arcade :is(.jauge, .jetons i:not(.on), .choix button:not(.choisi), .fiche .puces span:not(.ok)) { background: var(--pcv-creux); }
  html[data-pcv-apparence]:not([data-pcv-apparence="clair"]) .pcv-arcade .fiche .puces span.ok { background: var(--pcv-ambre-fond); color: var(--pcv-ambre-texte); }
  html[data-pcv-apparence]:not([data-pcv-apparence="clair"]) .pcv-arcade .fiche { background: var(--pcv-voile); }
  html[data-pcv-apparence]:not([data-pcv-apparence="clair"]) .pcv-arcade .boite { background: var(--pcv-fond-page); }
  `);
  const PIPO = `<svg viewBox="0 0 120 132"><defs>
      <radialGradient id="pcvA-pj" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#fff6b8"/><stop offset=".45" stop-color="#ffe04a"/><stop offset="1" stop-color="#ffb81a"/></radialGradient>
      <linearGradient id="pcvA-pc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8fb8"/><stop offset="1" stop-color="#ff4f86"/></linearGradient></defs>
    <ellipse cx="60" cy="126" rx="36" ry="6" fill="rgba(120,30,80,.18)"/>
    <g class="corps-p">
      <ellipse cx="45" cy="119" rx="11" ry="5.5" fill="#ff9a2e"/><ellipse cx="75" cy="119" rx="11" ry="5.5" fill="#ff9a2e"/>
      <path class="aile-g" d="M20 70 q-16 12 -5 30 q12 -3 15 -16z" fill="#ffc21a"/>
      <circle cx="60" cy="74" r="44" fill="url(#pcvA-pj)"/>
      <ellipse cx="60" cy="90" rx="27" ry="20" fill="#fff6cf" opacity=".9"/>
      <path class="aile-d" d="M100 70 q16 12 5 30 q-12 -3 -15 -16z" fill="#ffc21a"/>
      <g class="yeux"><ellipse cx="46" cy="63" rx="6" ry="8" fill="#3b2a4d"/><ellipse cx="74" cy="63" rx="6" ry="8" fill="#3b2a4d"/>
        <circle cx="48" cy="60" r="2.4" fill="#fff"/><circle cx="76" cy="60" r="2.4" fill="#fff"/></g>
      <circle cx="35" cy="77" r="6.5" fill="#ff8fb1" opacity=".6"/><circle cx="85" cy="77" r="6.5" fill="#ff8fb1" opacity=".6"/>
      <path d="M51 72 h18 l-9 8z" fill="#ff8a1f"/><path class="bec-b" d="M53 79 h14 l-7 6z" fill="#e06a00"/>
      <path d="M48 104 l12 6 l12 -6 v13 l-12 -6 l-12 6z" fill="#39b8f0"/><circle cx="60" cy="110" r="3.4" fill="#1d86c2"/>
      <path d="M22 50 q38 -46 76 0 q-38 -10 -76 0z" fill="url(#pcvA-pc)"/><path d="M58 42 q34 -6 50 8 q-26 2 -50 -4z" fill="#d8285d"/>
      <path d="M60 20 l3.2 6.6 7.2 1 -5.2 5 1.3 7.2 -6.5 -3.4 -6.5 3.4 1.3 -7.2 -5.2 -5 7.2 -1z" fill="#fff" transform="translate(0 -2) scale(.9) translate(6 2)"/>
      <path d="M60 30 q-6 -14 4 -18 q-2 8 4 10" fill="none" stroke="#ffb81a" stroke-width="4" stroke-linecap="round"/>
    </g></svg>`;
  let fileBulle = [], parole = null;
  const dire = (txt, urgent) => {
    if (urgent) fileBulle = [];
    fileBulle.push(txt);
    if (!parole || urgent) direSuivant();
  };
  const direSuivant = () => {
    if (parole) {
      clearInterval(parole.i);
      clearTimeout(parole.f);
    }
    const t = fileBulle.shift(), b = $(".bulle");
    if (!t || !b) {
      parole = null;
      return;
    }
    b.classList.add("on");
    racine.classList.add("parle");
    let k = 0;
    const p = b.querySelector("p");
    parole = { i: setInterval(() => {
      k++;
      p.textContent = t.slice(0, k);
      if (k % 2 && /\S/.test(t[k - 1] || "")) son("babil");
      if (k >= t.length) {
        clearInterval(parole.i);
        racine?.classList.remove("parle");
        parole.f = setTimeout(() => fileBulle.length ? direSuivant() : (b.classList.remove("on"), parole = null), fileBulle.length ? 1500 : 7e3);
      }
    }, 24) };
  };
  const ASTUCES = [
    "Garde le doigt sur la vitre pour viser, l\xE2che pour faire descendre la pince !",
    "Les grands badges sont lourds : vise bien le milieu, sinon ils glissent.",
    "Chaque succ\xE8s d\xE9bloqu\xE9 dans tes jeux te rapporte une partie. Joue, et reviens me voir !",
    "Le pousseur ne pousse que vers la fente : place le bras juste derri\xE8re le tas.",
    "\xC0 l'entra\xEEnement, 10 jetons attrap\xE9s = 1 partie offerte. Pratique, non ?",
    "Les machines changent chaque jour. Demain, d'autres s\xE9ries !",
    "Dans ta bo\xEEte, choisis un badge et colle-le sur ton accueil.",
    "Un grand badge se gagne en morceaux. Colle-les c\xF4te \xE0 c\xF4te sur l'accueil et ils se rassemblent !",
    "Tu pr\xE9f\xE8res gagner les grands badges d'un coup ? Appuie sur X dans le hall."
  ];
  const touches = (l) => l.map(([t, n, a]) => `<button data-action="${a}"><span class="tch">${t}</span>${n}</button>`).join("");
  const JETONS = ["#ff6f9f", "#ffc63a", "#39b8f0", "#5fd38a", "#b47cff"];
  const PILE = [[6, 124, -12], [64, 128, 8], [122, 124, -6], [34, 84, 14], [94, 86, -10], [64, 46, 5], [126, 64, 18]];
  const apercu = (m) => PILE.map(([x, y, r], k) => {
    const pos = `left:${u(x)};top:${u(y)};transform:rotate(${r}deg)`;
    if (m.entrainement) return `<i style="${pos};background:radial-gradient(circle at 35% 30%, #fff 0 ${u(5)}, ${JETONS[k % 5]} ${u(12)})"></i>`;
    const id = m.file[k];
    return id ? `<img data-id="${echap(id)}" style="${pos}" alt="">` : "";
  }).join("");
  const htmlBorne = (m, i) => `<div class="borne" data-i="${i}" style="left:${u(i * PAS_HALL + 25)};--c:${m.coul[0]};--c2:${m.coul[1]};--c3:${m.coul[2]}">
    <div class="bloc" style="animation-delay:${(0.12 + i * 0.08).toFixed(2)}s"><i class="ombre"></i>
      <div class="caisse"><div class="vitre"><div class="tas"><i class="plancher"></i>${apercu(m)}</div>${m.type === "pousseur" ? '<i class="bras-mini"></i>' : '<i class="pince-mini"><b></b></i>'}<i class="reflet"></i></div>
        <div class="plaque">${m.entrainement ? "ENTRA\xCENEMENT" : m.type === "pince" ? "PINCE" : "POUSSEUR"}</div>
        <div class="pupitre"><i class="manche"></i><i class="bouton"></i></div><div class="trappe"></div></div>
      <div class="fronton"><i class="amp h a1"></i><i class="amp h a2"></i><i class="amp h a3"></i><i class="amp b a1"></i><i class="amp b a2"></i><i class="amp b a3"></i>
        <span class="ic">${m.icone ? `<img data-id="${echap(m.icone)}" alt="">` : m.entrainement ? "\u{1F3AF}" : "\u{1F3C5}"}</span><span class="tx"><b>${echap(m.nom)}</b><small>${echap(m.sous)}</small></span></div>
      <div class="prix">${m.entrainement ? "GRA-<br>TUIT" : "1<br>partie"}</div></div></div>`;
  const guirlande = () => {
    let s = "", k = 0;
    const C = ["#ff5d8f", "#ffd23f", "#39c6ff", "#7be36b", "#c47bff"];
    for (let x0 = 0; x0 < 2560; x0 += 320) {
      s += `<path d="M${x0} 6 Q${x0 + 160} 76 ${x0 + 320} 6" fill="none" stroke="#7a5a8c" stroke-width="2.5"/>`;
      for (let t = 1 / 8; t < 1; t += 1 / 8) {
        const x = x0 + 320 * t, y = 6 + 2 * (1 - t) * t * 70;
        k++;
        s += `<g class="a${k % 3 + 1}"><circle cx="${x.toFixed(1)}" cy="${(y + 9).toFixed(1)}" r="8" fill="${C[k % 5]}"/><circle cx="${(x - 2.5).toFixed(1)}" cy="${(y + 6.5).toFixed(1)}" r="2.6" fill="#fff" opacity=".8"/></g><rect x="${(x - 3.5).toFixed(1)}" y="${(y - 2).toFixed(1)}" width="7" height="5" rx="1.5" fill="#7a5a8c"/>`;
      }
    }
    return `<svg class="guirlande" viewBox="0 0 2560 90" preserveAspectRatio="none">${s}</svg>`;
  };
  const quand = () => {
    const d = /* @__PURE__ */ new Date(), f = new Date(d);
    f.setHours(24, 0, 0, 0);
    const m = Math.round((f - d) / 6e4);
    return `${d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}, nouvelles machines dans ${m >= 60 ? Math.floor(m / 60) + " h " : ""}${m % 60} min`;
  };
  const htmlSalle = () => `<div class="salle">
      <div class="mur"><i class="rayures"></i><i class="projo p1"></i><i class="projo p2"></i><div class="auvent"></div><div class="festons"></div>${guirlande()}</div>
      <div class="sol"><i></i></div>
      <div class="rail">${machines.map(htmlBorne).join("")}</div>
      <div class="hud-g"><span class="logo">\u{1F3AA}</span><span><b>Arcade \xE0 badges</b><small class="jour">${quand()}</small></span></div>
      <div class="aide">${aideHall()}</div></div>`;
  const aideHall = () => touches([["\u25C0 \u25B6", "Machines", "rien"], ["A", "S'approcher", "approcher"], ["X", `Grands badges : ${modeGrands() === "morceaux" ? "en morceaux" : "entiers"}`, "mode"], ["Y", "Ma bo\xEEte", "boite"]]);
  const basculerMode = () => {
    if (vue !== "hall" || boiteOuverte) return;
    const mode = modeGrands() === "morceaux" ? "entiers" : "morceaux";
    ecrire(CLE.mode, mode);
    preparerMachines(true);
    $(".rail").innerHTML = machines.map(htmlBorne).join("");
    $(".salle .aide").innerHTML = aideHall();
    placerRail();
    allumer();
    son("ouvre");
    dire(mode === "morceaux" ? "Grands badges en morceaux, comme dans l'appli ! Gagne chaque morceau, puis colle-les c\xF4te \xE0 c\xF4te sur l'accueil." : "Grands badges entiers ! Un seul coup de pince pour tout le badge\u2026 mais ils sont lourds !", true);
  };
  const chargerImages = (zone) => zone?.querySelectorAll("img[data-id]:not([src])").forEach((im) => poserImage(im, im.dataset.id));
  const placerRail = () => {
    const r = $(".rail");
    if (!r) return;
    r.style.transform = `translateX(${u(640 - (sel * PAS_HALL + 150))})`;
    $(".rayures").style.transform = `translateX(${u(-sel * 70)})`;
    $(".guirlande").style.transform = `translateX(${u(-sel * 40)})`;
    racine.querySelectorAll(".borne").forEach((b, i) => {
      b.classList.toggle("choisi", i === sel);
      b.classList.toggle("proche", Math.abs(i - sel) <= 1);
      if (Math.abs(i - sel) <= 2) chargerImages(b);
    });
  };
  let presentation = 0;
  const presenter = () => {
    clearTimeout(presentation);
    presentation = setTimeout(() => {
      const m = machines[sel];
      if (!m || vue !== "hall") return;
      dire(m.entrainement ? "L'entra\xEEnement ! C'est gratuit : 10 jetons attrap\xE9s = 1 partie offerte." : `${m.nom}, ${m.sous} ! ${m.type === "pince" ? "Une pince" : "Un pousseur"} avec ${m.file.length} badge${m.file.length > 1 ? "s" : ""} dedans.${resume(m)}`, true);
    }, 420);
  };
  const resume = (m) => {
    const b = boite(), morceaux = m.file.filter((id) => morceauDe.has(id));
    if (morceaux.some((id) => possede(b, morceauDe.get(id).de))) return " Il y a des morceaux qui te manquent !";
    if (morceaux.length) return ` Dont ${morceaux.length} morceaux de grands badges \xE0 rassembler !`;
    return m.file.some((id) => tailleDe(id)[0] * tailleDe(id)[1] > 1) ? " Il y a m\xEAme des grands badges !" : "";
  };
  const choisir = (i, bruit = true) => {
    i = clamp(i, 0, machines.length - 1);
    if (i !== sel && bruit) son("travelling");
    sel = i;
    placerRail();
    presenter();
  };
  const construire = () => {
    racine.innerHTML = `<style>${STYLE}</style>${htmlSalle()}<div class="jeu"></div>
      <div class="hud-d"><div class="pil parties"><span class="piece">\u2605</span><span><span class="n"></span><small class="detail"></small></span></div>
        <button class="pil boite-b" data-action="boite"><span class="coffre">\u{1F3C5}</span><span><span class="n nb"></span><small>ma bo\xEEte</small></span></button></div>
      <div class="pipo">${PIPO}</div><div class="bulle"><em>PIPO</em><p></p></div>
      <div class="boite"></div><div class="gain"></div>`;
    hote = $(".pipo");
    placerRail();
    majHud();
    allumer();
    brancherSalle();
  };
  const allumer = () => racine.querySelectorAll(".borne").forEach((b, i) => plus_tard(() => {
    b.classList.add("allumee");
    if (i % 2 === 0) son("lumiere");
  }, 700 + i * 110));
  const majHud = () => {
    if (!racine) return;
    const p = parties(), n = p.offertes + p.bonus, b = boite();
    const el = $(".hud-d .parties");
    if (!el) return;
    const avant = el.querySelector(".n").textContent;
    el.querySelector(".n").textContent = `${n} partie${n > 1 ? "s" : ""}`;
    el.querySelector(".detail").textContent = p.bonus ? `${p.offertes} du jour + ${p.bonus} gagn\xE9e${p.bonus > 1 ? "s" : ""}` : `${OFFERTES} offertes chaque jour`;
    if (avant && avant !== el.querySelector(".n").textContent) {
      el.classList.remove("saute");
      void el.offsetWidth;
      el.classList.add("saute");
    }
    const nb = Object.keys(b).filter((id) => !morceauDe.has(id)).length + [...morceauxDe.keys()].filter((id) => !b[id] && complet(b, id)).length;
    $(".hud-d .nb").textContent = `${nb} badge${nb > 1 ? "s" : ""}`;
  };
  const htmlJeu = (m) => `<div class="cabine" style="--c:${m.coul[0]};--c2:${m.coul[1]};--c3:${m.coul[2]}">
      <div class="caisse"></div>
      <div class="fronton"><i class="amp h a1"></i><i class="amp h a2"></i><i class="amp h a3"></i><i class="amp b a1"></i><i class="amp b a2"></i><i class="amp b a3"></i>
        <span class="ic">${m.icone ? `<img data-id="${echap(m.icone)}" alt="">` : m.entrainement ? "\u{1F3AF}" : "\u{1F3C5}"}</span><span class="tx"><b>${echap(m.nom)}</b><small>${echap(m.sous)}</small></span></div>
      <div class="vitre-jeu"><canvas></canvas><i class="reflet"></i></div>
      <div class="commandes"><button class="bt g" data-dir="-1">\u25C0</button><button class="bt d" data-dir="1">\u25B6</button>
        <div class="consigne">${m.type === "pince" ? "Garde le doigt sur la vitre pour viser,<br>l\xE2che-le pour faire descendre la pince." : "Place le bras derri\xE8re le tas,<br>puis pousse vers la fente !"}</div>
        <button class="bt a"><span class="tch">A</span>${m.type === "pince" ? "Descendre" : "Pousser"}</button></div></div>
    <div class="cote">
      <div class="carte"><span class="t">${m.entrainement ? "ENTRA\xCENEMENT" : m.type === "pince" ? "MACHINE \xC0 PINCE" : "MACHINE \xC0 POUSSER"}</span><b class="dedans"></b><div class="detail-m"></div></div>
      ${m.entrainement ? `<div class="carte"><span class="t">JETONS DU JOUR</span><b class="nj"></b><div class="jetons"></div></div>` : `<div class="carte"><span class="t">TA COLLECTION</span><b class="prog"></b><div class="jauge"><i></i></div></div>`}
      <button class="carte" data-action="boite"><span class="coffre">\u{1F3C5}</span>Ma bo\xEEte<span class="tch" style="margin-left:auto">Y</span></button>
      <button class="carte" data-action="hall"><span class="coffre" style="background:linear-gradient(180deg,#ffc0d8,#ff8ab0)">\u25C0</span>Le hall<span class="tch" style="margin-left:auto">B</span></button></div>`;
  const majCote = () => {
    const m = mJeu;
    if (!m || !racine) return;
    const n = m.monde?.corps.length || 0, grands = m.monde?.corps.filter((c) => c.taille[0] * c.taille[1] > 1).length || 0;
    const d = $(".cote .dedans");
    if (d) d.textContent = m.entrainement ? `${n} jetons` : `${m.file.length} badge${m.file.length > 1 ? "s" : ""}`;
    const nm = m.monde?.corps.filter((c) => morceauDe.has(c.id)).length || 0;
    const dm = $(".cote .detail-m");
    if (dm) dm.textContent = m.entrainement ? "Gratuit, \xE0 volont\xE9." : `${n} dans la vitre${grands ? `, dont ${grands} grand${grands > 1 ? "s" : ""}` : nm ? `, dont ${nm} morceaux` : ""}`;
    if (m.entrainement) {
      const p = parties(), k = p.jetons % JETONS_PAR_PARTIE, fini = p.bonusJetons >= BONUS_ENTRAINEMENT;
      $(".cote .nj").textContent = fini ? "Bonus du jour pris !" : `${k} / ${JETONS_PAR_PARTIE} \u2192 1 partie`;
      $(".cote .jetons").innerHTML = Array.from({ length: JETONS_PAR_PARTIE }, (_, i) => `<i class="${fini || i < k ? "on" : ""}"></i>`).join("");
    } else if (m.serie) {
      const b = boite(), a = completes(b, m.serie);
      $(".cote .prog").textContent = `${a} / ${m.serie.lots.length}`;
      $(".cote .jauge i").style.width = `${(100 * avancee(b, m.serie) / m.serie.lots.length).toFixed(1)}%`;
    }
    $(".bt.a")?.classList.toggle("attend", m.jeu?.etat !== "attente");
  };
  const ouvrirMachine = (m) => {
    mJeu = m;
    installer(m);
    const j = $(".jeu");
    j.innerHTML = htmlJeu(m);
    chargerImages(j);
    racine.dataset.vue = vue = "machine";
    fond = null;
    brancherJeu();
    majCote();
    demarrer();
    if (m.entrainement) dire("Ici on s'entra\xEEne gratuitement. Vise un jeton et l\xE2che !", true);
    else if (!m.file.length) dire("Cette machine est vide : tu as tout gagn\xE9 ! Bravo, champion !", true);
    else if (!totalParties()) dire("Tu n'as plus de parties\u2026 Reviens demain, ou d\xE9bloque des succ\xE8s dans tes jeux !", true);
    else dire(m.type === "pince" ? "Vise bien, et que la pince soit avec toi !" : "Pousse doucement\u2026 tout ce qui tombe dans la fente est \xE0 toi !", true);
  };
  const revenirHall = () => {
    const m = mJeu;
    if (m?.jeu && m.jeu.etat !== "attente") return;
    arreter();
    moteur(false);
    vue = "hall";
    racine.dataset.vue = "hall";
    const s = $(".salle");
    s.classList.remove("eteinte");
    void s.offsetWidth;
    s.classList.remove("zoom");
    son("retour");
    mJeu = null;
    presenter();
  };
  const approcher = () => {
    const m = machines[sel];
    if (!m || vue !== "hall") return;
    son("approche");
    const s = $(".salle");
    s.style.transformOrigin = `${u(640)} ${u(92 + 260)}`;
    s.classList.add("zoom");
    ouvrirMachine(m);
    plus_tard(() => {
      if (vue === "machine") s.classList.add("eteinte");
    }, 650);
  };
  let cv = null, ctx = null, fond = null, echelle = 1, dernier = 0, reste = 0, gel = false;
  const mesurer = () => {
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1, l = Math.round(cv.offsetWidth * dpr), h = Math.round(cv.offsetHeight * dpr);
    if (l && (cv.width !== l || cv.height !== h)) {
      cv.width = l;
      cv.height = h;
      fond = null;
    }
    echelle = cv.width / W;
  };
  const arrondi = (c, x, y, l, h, r) => {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + l, y, x + l, y + h, r);
    c.arcTo(x + l, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + l, y, r);
    c.closePath();
  };
  const dessinerFond = (m) => {
    const f = document.createElement("canvas");
    f.width = cv.width;
    f.height = cv.height;
    const c = f.getContext("2d");
    c.scale(echelle, echelle);
    const [coul, fonce, clair] = m.coul, lg = c.createLinearGradient(0, 0, 0, H);
    lg.addColorStop(0, clair);
    lg.addColorStop(1, "#ffffff");
    c.fillStyle = lg;
    c.fillRect(0, 0, W, H);
    c.fillStyle = coul;
    c.globalAlpha = 0.1;
    for (let y = 50; y < H; y += 46) for (let x = y / 46 % 2 ? 23 : 0; x < W; x += 46) {
      c.beginPath();
      c.arc(x, y, 6, 0, 7);
      c.fill();
    }
    c.globalAlpha = 1;
    const halo = c.createRadialGradient(W / 2, 40, 10, W / 2, 40, 420);
    halo.addColorStop(0, "rgba(255,255,255,.7)");
    halo.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = halo;
    c.fillRect(0, 0, W, H);
    const rail = c.createLinearGradient(0, 14, 0, 34);
    rail.addColorStop(0, "#f4f6fa");
    rail.addColorStop(1, "#9aa3b2");
    c.fillStyle = rail;
    c.fillRect(0, 16, W, 16);
    c.fillStyle = "#7d8696";
    for (let x = 30; x < W; x += 120) {
      c.beginPath();
      c.arc(x, 24, 3, 0, 7);
      c.fill();
    }
    if (m.type === "pince") {
      const g = PINCE;
      const pl = c.createLinearGradient(0, g.sol, 0, H);
      pl.addColorStop(0, clair);
      pl.addColorStop(0.12, coul);
      pl.addColorStop(1, fonce);
      c.fillStyle = pl;
      arrondi(c, g.chute, g.sol, W - g.chute + 20, H - g.sol + 30, 14);
      c.fill();
      c.fillStyle = "rgba(255,255,255,.55)";
      c.fillRect(g.chute + 14, g.sol + 3, W - g.chute - 28, 4);
      c.fillStyle = fonce;
      c.beginPath();
      c.moveTo(g.chute, g.sol - 50);
      c.lineTo(g.chute + 124, g.sol);
      c.lineTo(g.chute, g.sol);
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.6)";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(g.chute + 4, g.sol - 47);
      c.lineTo(g.chute + 120, g.sol - 1);
      c.stroke();
      const tr = c.createLinearGradient(0, g.sol - 40, 0, H);
      tr.addColorStop(0, "#5a4473");
      tr.addColorStop(1, "#1f1530");
      c.fillStyle = tr;
      arrondi(c, 4, g.sol - 30, g.chute - 10, H, 16);
      c.fill();
      c.fillStyle = "#ffd23f";
      arrondi(c, 8, g.haut + 30, g.chute - 18, 40, 14);
      c.fill();
      c.fillStyle = "#8a5a00";
      c.font = "900 17px Nunito, sans-serif";
      c.textAlign = "center";
      c.fillText("SORTIE", g.chute / 2 - 1, g.haut + 56);
    } else {
      const g = POUSSE;
      const tb = c.createLinearGradient(0, g.table, 0, H);
      tb.addColorStop(0, clair);
      tb.addColorStop(0.1, coul);
      tb.addColorStop(1, fonce);
      c.fillStyle = tb;
      arrondi(c, -20, g.table, g.bord + 20, H, 26);
      c.fill();
      c.fillStyle = "rgba(255,255,255,.5)";
      c.fillRect(10, g.table + 4, g.bord - 40, 4);
      c.strokeStyle = "rgba(255,255,255,.25)";
      c.lineWidth = 3;
      for (let x = 40; x < g.bord - 20; x += 60) {
        c.beginPath();
        c.moveTo(x, g.table + 24);
        c.lineTo(x - 30, H);
        c.stroke();
      }
      const tr = c.createLinearGradient(0, g.table, 0, H);
      tr.addColorStop(0, "#5a4473");
      tr.addColorStop(1, "#1f1530");
      c.fillStyle = tr;
      arrondi(c, g.bord + 8, g.table + 30, W - g.bord - 12, H, 18);
      c.fill();
      c.fillStyle = "#ffd23f";
      arrondi(c, g.bord + 30, g.table - 120, W - g.bord - 56, 40, 14);
      c.fill();
      c.fillStyle = "#8a5a00";
      c.font = "900 17px Nunito, sans-serif";
      c.textAlign = "center";
      c.fillText("FENTE", (g.bord + W) / 2 + 2, g.table - 94);
    }
    return f;
  };
  const jetonsDessines = JETONS.map((col) => {
    const f = document.createElement("canvas");
    f.width = f.height = 128;
    const c = f.getContext("2d");
    const rg = c.createRadialGradient(46, 40, 6, 64, 64, 62);
    rg.addColorStop(0, "#fff");
    rg.addColorStop(0.25, col);
    rg.addColorStop(1, col);
    c.fillStyle = rg;
    c.beginPath();
    c.arc(64, 64, 58, 0, 7);
    c.fill();
    c.lineWidth = 8;
    c.strokeStyle = "rgba(255,255,255,.85)";
    c.beginPath();
    c.arc(64, 64, 44, 0, 7);
    c.stroke();
    c.fillStyle = "#fff";
    c.beginPath();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? 12 : 28, a = -Math.PI / 2 + k * Math.PI / 5;
      c.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r);
    }
    c.fill();
    return f;
  });
  const dessinCorps = (c, k) => {
    const P = k.parts, x = (P[0].x + P[P.length - 1].x) / 2, y = (P[0].y + P[P.length - 1].y) / 2, [col, rang] = k.taille, l = col * CASE, h = rang * CASE;
    c.save();
    c.translate(x, y);
    c.rotate(k.ang);
    if (k.jeton != null) c.drawImage(jetonsDessines[k.jeton], -31, -31, 62, 62);
    else {
      const im = image(k.id);
      if (pret(im)) c.drawImage(im, -l / 2, -h / 2, l, h);
      else {
        c.fillStyle = "#fff";
        c.strokeStyle = "#ddd";
        c.lineWidth = 4;
        c.beginPath();
        c.arc(0, 0, P[0].r, 0, 7);
        c.fill();
        c.stroke();
      }
    }
    c.restore();
  };
  const trait = (c, pts) => {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
    c.stroke();
  };
  const dessinPince = (c, m, t) => {
    const j = m.jeu, g = PINCE, D = j.D, [coul, fonce, clair] = m.coul;
    if (j.etat === "attente" || j.etat === "approche") {
      c.setLineDash([7, 9]);
      c.strokeStyle = "rgba(255,255,255,.95)";
      c.lineWidth = 3;
      trait(c, [[j.hx, j.hy + 104], [j.hx, g.sol - 4]]);
      c.setLineDash([]);
      c.fillStyle = "rgba(255,111,163,.35)";
      c.beginPath();
      c.ellipse(j.cx, g.sol - 2, 34, 7, 0, 0, 7);
      c.fill();
    }
    c.strokeStyle = "#6f7888";
    c.lineWidth = 3;
    trait(c, [[j.cx, g.rail + 8], D.toit[1]]);
    const ch = c.createLinearGradient(0, g.rail - 12, 0, g.rail + 16);
    ch.addColorStop(0, "#ffffff");
    ch.addColorStop(1, "#8d96a6");
    c.fillStyle = ch;
    arrondi(c, j.cx - 36, g.rail - 13, 72, 28, 11);
    c.fill();
    c.lineCap = c.lineJoin = "round";
    for (const [lw, col] of [[15, "#5b6372"], [9, "#e9eef5"], [3, "#ffffff"]]) {
      c.lineWidth = lw;
      c.strokeStyle = col;
      trait(c, D.g);
      trait(c, D.d);
    }
    c.save();
    c.translate(j.hx, j.hy);
    c.rotate(-j.phi);
    const tg = c.createLinearGradient(0, -30, 0, 18);
    tg.addColorStop(0, clair);
    tg.addColorStop(0.5, coul);
    tg.addColorStop(1, fonce);
    c.fillStyle = tg;
    c.beginPath();
    c.moveTo(-36, -6);
    c.quadraticCurveTo(0, -46, 36, -6);
    c.fill();
    arrondi(c, -34, -20, 68, 36, 15);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.6)";
    arrondi(c, -24, -15, 48, 7, 4);
    c.fill();
    c.fillStyle = j.etat === "attente" ? Math.floor(t * 2) % 2 ? "#fff59a" : "#ffd23f" : "#ff5d95";
    c.beginPath();
    c.arc(0, 4, 6, 0, 7);
    c.fill();
    c.restore();
  };
  const dessinBras = (c, m) => {
    const j = m.jeu, g = POUSSE, [coul, fonce, clair] = m.coul;
    if (j.etat === "attente") {
      c.fillStyle = "rgba(255,111,163,.35)";
      c.beginPath();
      c.ellipse(j.x + 70, g.table - 3, 80, 7, 0, 0, 7);
      c.fill();
      c.fillStyle = "rgba(255,255,255,.9)";
      c.beginPath();
      c.moveTo(j.x + 130, g.table - 30);
      c.lineTo(j.x + 150, g.table - 18);
      c.lineTo(j.x + 130, g.table - 6);
      c.fill();
    }
    const ch = c.createLinearGradient(0, g.rail - 12, 0, g.rail + 16);
    ch.addColorStop(0, "#ffffff");
    ch.addColorStop(1, "#8d96a6");
    c.fillStyle = ch;
    arrondi(c, j.x - 36, g.rail - 13, 72, 28, 11);
    c.fill();
    c.save();
    arrondi(c, j.x - 8, g.rail, 16, j.yb - 40 - g.rail, 6);
    c.clip();
    c.fillStyle = "#ffd23f";
    c.fillRect(j.x - 8, g.rail, 16, j.yb);
    c.fillStyle = "#4b3a5e";
    for (let y = g.rail - 20; y < j.yb; y += 26) {
      c.beginPath();
      c.moveTo(j.x - 8, y);
      c.lineTo(j.x + 8, y + 10);
      c.lineTo(j.x + 8, y + 22);
      c.lineTo(j.x - 8, y + 12);
      c.fill();
    }
    c.restore();
    const pg = c.createLinearGradient(j.x - 16, 0, j.x + 16, 0);
    pg.addColorStop(0, fonce);
    pg.addColorStop(0.5, coul);
    pg.addColorStop(1, clair);
    c.fillStyle = pg;
    arrondi(c, j.x - 16, j.yb - 52, 32, 66, 14);
    c.fill();
    c.fillStyle = "rgba(255,255,255,.7)";
    c.beginPath();
    c.moveTo(j.x - 3, j.yb - 30);
    c.lineTo(j.x + 8, j.yb - 20);
    c.lineTo(j.x - 3, j.yb - 10);
    c.fill();
  };
  const dessiner = (t) => {
    const m = mJeu;
    if (!m || !ctx) return;
    if (!fond) fond = dessinerFond(m);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(fond, 0, 0);
    ctx.setTransform(echelle, 0, 0, echelle, 0, 0);
    for (const k of m.monde.corps) dessinCorps(ctx, k);
    if (m.type === "pince") {
      dessinPince(ctx, m, t);
      const g = PINCE;
      ctx.fillStyle = "rgba(220,240,255,.55)";
      arrondi(ctx, g.chute - 6, g.haut - 6, 12, H, 6);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.fillRect(g.chute - 3, g.haut, 3, H);
      ctx.fillStyle = Math.floor(t * 2.5) % 2 ? "#ff5d95" : "#ffd23f";
      const ya = g.haut + 86 + Math.sin(t * 6) * 4;
      ctx.beginPath();
      ctx.moveTo(g.xChute - 14, ya);
      ctx.lineTo(g.xChute + 14, ya);
      ctx.lineTo(g.xChute, ya + 14);
      ctx.fill();
    } else {
      dessinBras(ctx, m);
      const g = POUSSE;
      ctx.fillStyle = m.coul[1];
      ctx.beginPath();
      ctx.arc(g.bord - 20, g.table - 4, 11, 0, 7);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.beginPath();
      ctx.arc(g.bord - 23, g.table - 8, 4, 0, 7);
      ctx.fill();
      ctx.fillStyle = Math.floor(t * 2.5) % 2 ? "#ff5d95" : "#ffd23f";
      const xa = (g.bord + W) / 2, ya = g.table - 60 + Math.sin(t * 6) * 4;
      ctx.beginPath();
      ctx.moveTo(xa - 14, ya);
      ctx.lineTo(xa + 14, ya);
      ctx.lineTo(xa, ya + 14);
      ctx.fill();
    }
  };
  const image_suivante = (t) => {
    if (!racine || vue !== "machine" || boiteOuverte) {
      boucle = 0;
      return;
    }
    const dt = gel ? 0 : Math.min(0.1, (t - (dernier || t)) / 1e3);
    dernier = t;
    reste += dt;
    let n = 0;
    while (reste >= 1 / 120 && n < 6) {
      avancer(mJeu, 1 / 120);
      reste -= 1 / 120;
      n++;
    }
    if (n === 6) reste = 0;
    dessiner(t / 1e3);
    boucle = requestAnimationFrame(image_suivante);
  };
  const demarrer = () => {
    cv = $(".vitre-jeu canvas");
    ctx = cv?.getContext("2d");
    mesurer();
    dernier = 0;
    reste = 0;
    if (!boucle) boucle = requestAnimationFrame(image_suivante);
  };
  const arreter = () => {
    cancelAnimationFrame(boucle);
    boucle = 0;
  };
  const refus = () => {
    son("refus");
    const el = $(".hud-d .parties");
    el?.classList.remove("secoue");
    void el?.offsetWidth;
    el?.classList.add("secoue");
    dire("Oh non, plus de parties ! Reviens demain, ou d\xE9bloque des succ\xE8s dans tes jeux : chacun t'en offre une.", true);
  };
  const jouer = () => {
    const m = mJeu, j = m?.jeu;
    if (!j || j.etat !== "attente") return;
    if (!m.monde.corps.length) {
      son("refus");
      dire("Cette machine est vide. Essaie sa voisine !", true);
      return;
    }
    if (!m.entrainement && !depenser()) return refus();
    son("piece");
    j.dir = 0;
    j.gains = [];
    j.glisses = 0;
    j.xJoueur = m.type === "pince" ? clamp(j.cible, PINCE.xmin, PINCE.xmax) : clamp(j.cible, POUSSE.xmin, POUSSE.xmax);
    j.etat = "approche";
    j.t = 0;
    $(".bt.a")?.classList.add("attend");
  };
  const finPartie = (m) => {
    const j = m.jeu, g = j.gains;
    j.gains = [];
    majCote();
    majHud();
    if (m.monde.corps.length < nbDedans(m) - 4) remplir(m, 3, true);
    if (m !== mJeu) return;
    if (m.entrainement) {
      if (!g.length) {
        son("rate");
        dire(j.glisses ? "Il a gliss\xE9 ! Serre-le bien au milieu." : "Rat\xE9 ! Recommence, c'est gratuit.", true);
        return;
      }
      const p = parties();
      p.jetons += g.length;
      let bonus = 0;
      while (p.bonusJetons < BONUS_ENTRAINEMENT && Math.floor(p.jetons / JETONS_PAR_PARTIE) > p.bonusJetons) {
        p.bonusJetons++;
        p.bonus++;
        bonus++;
      }
      ecrire(CLE.parties, p);
      son("jeton");
      majCote();
      majHud();
      dire(bonus ? "Bravo ! 10 jetons : je t'offre une partie !" : `${g.length > 1 ? g.length + " jetons" : "Un jeton"} ! Encore ${JETONS_PAR_PARTIE - p.jetons % JETONS_PAR_PARTIE} pour une partie offerte.`, true);
      if (bonus) son("gagne");
      return;
    }
    if (!g.length) {
      son("rate");
      dire(j.glisses ? "A\xEFe, il a gliss\xE9 de la pince ! Vise plus au centre." : m.type === "pince" ? "Presque ! La prochaine sera la bonne." : "\xC7a bouge, \xE7a bouge\u2026 encore une pouss\xE9e !", true);
      return;
    }
    montrerGains(m, g);
  };
  const assemblage = (id, b, taille, curseur = -1) => {
    const p = morceauxDe.get(id) || [], [w, h] = tailleDe(id), c = taille / Math.max(w, h);
    return `<span class="assemble" style="width:${u(c * w)};height:${u(c * h)};grid-template-columns:repeat(${w}, 1fr)">${p.map((pid, i) => `<img data-id="${echap(pid)}" data-k="${i}" class="${aMorceau(b, pid) ? "" : "manque"}${i === curseur ? " curseur" : ""}" alt="">`).join("")}</span>`;
  };
  const boutons = (l) => l.map(([acte, t, n], i) => `<button data-acte="${acte}" class="${i ? "" : "choisi"}"><span class="tch">${t}</span>${n}</button>`).join("");
  const montrerGains = (m, liste) => {
    const c = liste.shift();
    if (!c) return;
    const el = $(".gain"), b = boite(), inf = info(c.id), mo = inf?.morceau;
    const [col, rang] = c.taille, k = Math.max(col, rang), l = col / k * (k > 1 ? 300 : 230), h = rang / k * (k > 1 ? 300 : 230), U_ = innerHeight / 800;
    const n = mo ? nbMorceaux(b, mo.de) : 0, fini = !!mo && n === mo.sur;
    const actes = mo ? [["morceau", "A", "Coller ce morceau"], ...fini ? [["entier", "X", "Coller le badge entier"]] : [], ["suite", "B", "Continuer"]] : [["coller", "A", "Coller sur l'accueil"], ["suite", "B", "Continuer"]];
    gainOuvert = { id: c.id, de: mo?.de, sel: 0, actes: actes.map((x) => x[0]), suite: () => montrerGains(m, liste) };
    const titre = fini ? "Grand badge complet !" : c.fois > 1 ? `Encore un ! (\xD7${c.fois})` : mo ? "Nouveau morceau !" : "Nouveau badge !";
    el.innerHTML = `<div class="rayons"></div><div class="confettis">${Array.from({ length: 46 }, (_, i) => `<i style="left:${(Math.random() * 100).toFixed(1)}%;background:${JETONS[i % 5]};--x:${u(Math.round(Math.random() * 300 - 150))};--a:${Math.round(Math.random() * 900 - 450)}deg;--d:${(1.6 + Math.random() * 1.6).toFixed(2)}s;--r:${(0.35 + Math.random() * 0.5).toFixed(2)}s"></i>`).join("")}</div>
      <img class="vole" alt="" style="width:${u(l)};height:${u(h)}">
      <div class="carte-g ${actes.length > 2 ? "trois" : ""}">${mo ? `<div class="avec-g">${assemblage(mo.de, b, 112, mo.numero - 1)}<div>` : ""}
        <div class="titre">${titre}</div><p class="nom">${echap(inf?.nom || "Badge")}</p>
        <p class="ser">${echap(inf?.serieNom || m.nom)}${mo ? `, morceau ${mo.numero} sur ${mo.sur}` : col * rang > 1 ? `, grand badge ${col}\xD7${rang}` : ""}</p>
        ${mo ? `<p class="prog">${n} morceau${n > 1 ? "x" : ""} sur ${mo.sur}${fini ? " : il est complet !" : ""}</p></div></div>` : ""}
        <div class="choix">${boutons(actes)}</div></div>`;
    el.classList.add("on");
    poserImage(el.querySelector(".vole"), c.id);
    chargerImages(el.querySelector(".avec-g"));
    son("gagne");
    const r = cv.getBoundingClientRect(), rr = racine.getBoundingClientRect(), wx = m.type === "pince" ? PINCE.xChute : (POUSSE.bord + W) / 2;
    const x0 = r.left + r.width * wx / W - rr.left - rr.width / 2, y0 = r.bottom - rr.top - rr.height * 0.36;
    el.querySelector(".vole").animate([
      { transform: `translate(calc(-50% + ${x0}px), calc(-50% + ${y0}px)) scale(.25) rotate(-40deg)`, opacity: 0 },
      { transform: `translate(calc(-50% + ${x0 * 0.5}px), calc(-50% + ${-180 * U_}px)) scale(.9) rotate(160deg)`, opacity: 1, offset: 0.45 },
      { transform: "translate(-50%, -50%) scale(1.25) rotate(360deg)", offset: 0.8 },
      { transform: "translate(-50%, -50%) scale(1) rotate(360deg)" }
    ], { duration: 1100, easing: "cubic-bezier(.3,.7,.4,1)", fill: "backwards" });
    el.querySelectorAll(".choix button").forEach((x) => x.onclick = () => choixGain(x.dataset.acte));
    dire(fini ? "INCROYABLE ! Tu as tous les morceaux : le grand badge est complet !" : mo ? `Un morceau de grand badge ! Encore ${mo.sur - n} \xE0 trouver.` : c.fois > 1 ? "Encore un pour ta bo\xEEte ! Tu en as une belle pile." : col * rang > 1 ? "INCROYABLE ! Un grand badge ! Tu es un vrai champion !" : "Bravo ! Quel joli badge !", true);
  };
  const choixGain = (acte) => {
    const g = gainOuvert;
    if (!g) return;
    gainOuvert = null;
    $(".gain").classList.remove("on");
    $(".gain").innerHTML = "";
    son("pop");
    if (acte === "coller" || acte === "morceau") coller(g.id);
    else if (acte === "entier") coller(g.de);
    else g.suite();
  };
  const marquerGain = () => racine.querySelectorAll(".gain .choix button").forEach((b, i) => b.classList.toggle("choisi", i === gainOuvert.sel));
  const coller = (id) => {
    if (window.__pcvArcade.surColler) return window.__pcvArcade.surColler(id, tailleDe(id));
    let accueil = "nouvelle";
    try {
      accueil = JSON.parse(localStorage.getItem("pcv-interface")) ?? "nouvelle";
    } catch (e) {
    }
    if (accueil !== "nouvelle") {
      dire("Les badges se collent sur le nouvel accueil ! Choisis-le dans Th\xE8mes, r\xE9glage \xAB Accueil \xBB.", true);
      son("bord");
      return;
    }
    window.__pcvPerso?.fermer?.(true);
    O.__pcvAller?.(1);
    setTimeout(() => window.__pcvPoserBadge?.(id, tailleDe(id)), 600);
  };
  let bs = { s: 0, g: 0, zone: "s", ordre: [] }, observateur = null, observateurOnglets = null;
  const paresseux = (zone, sel2) => {
    const o = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll("img[data-id]:not([src])").forEach((im) => poserImage(im, im.dataset.id));
      o.unobserve(e.target);
    }), { root: zone, rootMargin: "200px" });
    zone.querySelectorAll(sel2).forEach((c) => o.observe(c));
    return o;
  };
  const ouvrirBoite = () => {
    if (boiteOuverte || gainOuvert) return;
    boiteOuverte = true;
    arreter();
    moteur(false);
    son("ouvre");
    const b = boite(), el = $(".boite");
    bs.ordre = index ? index.series.map((s) => ({ s, n: completes(b, s), f: avancee(b, s) / s.lots.length })).sort((x, y) => (y.f > 0) - (x.f > 0) || y.f - x.f) : [];
    const total = bs.ordre.reduce((a, x) => a + x.n, 0), nbS = bs.ordre.filter((x) => x.f).length;
    const enCours = [...morceauxDe.keys()].filter((id) => possede(b, id) && !complet(b, id)).length;
    el.innerHTML = `<div class="tete-b"><span class="coffre">\u{1F3C5}</span><b>Ma bo\xEEte \xE0 badges</b><small>${total} badge${total > 1 ? "s" : ""}${enCours ? `, ${enCours} grand${enCours > 1 ? "s" : ""} en morceaux` : ""} \xB7 ${nbS} s\xE9rie${nbS > 1 ? "s" : ""} commenc\xE9e${nbS > 1 ? "s" : ""}</small></div>
      <div class="onglets">${bs.ordre.map(({ s, n, f }, i) => `<div class="ong ${f ? "" : "zero"}" data-i="${i}"><span class="ic">${s.icone ? `<img data-id="${echap(s.id + "/" + s.icone)}" alt="">` : "\u{1F3C5}"}</span>
        <span class="tx"><b>${echap(s.nom)}</b><small>${echap(s.sous)}</small><span class="jauge"><i style="width:${(100 * f).toFixed(1)}%"></i></span></span><em>${n}/${s.lots.length}</em></div>`).join("")}</div>
      <div class="velours">${index ? `<div class="titre-s"></div><div class="grille"></div>` : `<div class="vide-b">Ta bo\xEEte est vide pour l'instant.<br>Les badges arrivent quand la collection est rang\xE9e dans le dossier priv\xE9 de la console (outils/badges-extraire.py).</div>`}<div class="fiche"></div></div>
      <div class="aide">${touches([["\u25B2 \u25BC", "S\xE9ries", "rien"], ["A", "Voir", "rien"], ["B", "Fermer", "fermer-boite"]])}</div>`;
    el.classList.add("on");
    plus_tard(() => boiteOuverte && racine.classList.add("boite-on"), 480);
    bs.zone = "s";
    bs.s = Math.max(0, bs.ordre.findIndex((x) => x.s.id === mJeu?.serie?.id));
    bs.g = 0;
    observateurOnglets?.disconnect();
    observateurOnglets = paresseux(el.querySelector(".onglets"), ".ong");
    afficherSerie();
    brancherBoite();
  };
  const fermerBoite = () => {
    if (!boiteOuverte) return;
    boiteOuverte = false;
    observateur?.disconnect();
    observateurOnglets?.disconnect();
    racine.classList.remove("boite-on");
    $(".boite").classList.remove("on");
    son("retour");
    majHud();
    majCote();
    if (vue === "machine") demarrer();
  };
  const afficherSerie = () => {
    const o = bs.ordre[bs.s], el = $(".boite");
    if (!o || !el) return;
    const b = boite(), s = o.s;
    el.querySelectorAll(".ong").forEach((x, i) => x.classList.toggle("choisi", i === bs.s));
    montrer(el.querySelector(".onglets"), el.querySelector(".ong.choisi"));
    el.querySelector(".titre-s").innerHTML = `${echap(s.nom)}<small>${echap(s.sous)}, ${o.n} sur ${s.lots.length}</small>`;
    const gr = el.querySelector(".grille");
    gr.innerHTML = s.lots.map((f, i) => {
      const id = `${s.id}/${f}`, a = b[id], gd = s.tailles[f], p = morceauxDe.get(id);
      if (gd && p) {
        const n = nbMorceaux(b, id);
        return `<div class="case g ${n ? "a" : ""} ${n === p.length ? "plein" : ""}" data-i="${i}">${n ? `${assemblage(id, b, 80)}<em>${n}/${p.length}</em>` : ""}</div>`;
      }
      return `<div class="case ${a ? "a" : ""} ${gd ? "g" : ""}" data-i="${i}">${a ? `<img data-id="${echap(id)}" alt="">${a.n > 1 ? `<em>\xD7${a.n}</em>` : ""}` : ""}</div>`;
    }).join("");
    observateur?.disconnect();
    observateur = paresseux(gr, ".case.a");
    const premier = gr.querySelector(".case.a");
    gr.scrollTop = premier ? Math.max(0, premier.offsetTop - gr.clientHeight / 3) : 0;
    marquerGrille();
  };
  const montrer = (zone, el) => {
    if (!zone || !el) return;
    const h = el.offsetTop - zone.scrollTop;
    if (h < 0) zone.scrollTop = el.offsetTop - 8;
    else if (h + el.offsetHeight > zone.clientHeight) zone.scrollTop = el.offsetTop + el.offsetHeight - zone.clientHeight + 8;
  };
  const premierGagne = () => {
    const s = bs.ordre[bs.s]?.s, b = boite();
    return Math.max(0, s ? s.lots.findIndex((f) => possede(b, `${s.id}/${f}`)) : 0);
  };
  const colonnes = () => {
    const gr = $(".boite .grille"), c = gr?.querySelector(".case");
    return c ? Math.max(1, Math.round((gr.clientWidth - 20) / (c.offsetWidth + 10 * innerHeight / 800))) : 1;
  };
  const marquerGrille = () => {
    const el = $(".boite");
    el.classList.toggle("grille-active", bs.zone === "g");
    el.querySelectorAll(".case").forEach((c, i) => c.classList.toggle("choisi", bs.zone === "g" && i === bs.g));
    if (bs.zone === "g") montrer(el.querySelector(".grille"), el.querySelector(".case.choisi"));
  };
  const ouvrirFiche = () => {
    const s = bs.ordre[bs.s]?.s, f = s?.lots[bs.g], id = s && `${s.id}/${f}`, b = boite();
    if (!id || !possede(b, id)) return son("refus");
    const inf = info(id), fi = $(".boite .fiche"), [col, rang] = s.tailles[f] || [1, 1], p = morceauxDe.get(id), a = b[id];
    son("pop");
    const date = (t) => new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    if (p) {
      const n = nbMorceaux(b, id), fini = n === p.length, k = Math.max(0, p.findIndex((x) => aMorceau(b, x)));
      ficheOuverte = { id, morceaux: p, col, rang, k, fini, sel: 0 };
      fi.innerHTML = `<div class="carte-f"><div class="socle"><div class="rayons"></div>${assemblage(id, b, 236, k)}</div>
        <div class="texte"><b>${echap(inf.nom)}</b><div class="ser">${echap(inf.serieNom)}</div>
          <div class="puces"><span class="${fini ? "ok" : ""}">${fini ? "Complet : " : ""}${n} morceau${n > 1 ? "x" : ""} sur ${p.length}</span><span>Grand badge ${col}\xD7${rang}</span></div>
          <p class="note">${fini ? "D'un bloc, ou morceau par morceau : c\xF4te \xE0 c\xF4te sur l'accueil, ils se rassemblent." : "Les morceaux gris\xE9s t'attendent dans les machines. Choisis un morceau pour le coller."}</p></div>
        <div class="choix ${fini ? "trois" : ""}">${boutons([["morceau", "A", "Coller ce morceau"], ...fini ? [["entier", "X", "Coller le badge entier"]] : [], ["ranger", "B", "Ranger"]])}</div></div>`;
      chargerImages(fi);
      fi.querySelectorAll(".assemble img").forEach((im) => im.onclick = (e) => {
        e.stopPropagation();
        ficheOuverte.k = +im.dataset.k;
        marquerFiche();
        son("bouge");
      });
    } else {
      ficheOuverte = { id, sel: 0 };
      fi.innerHTML = `<div class="carte-f"><div class="socle"><div class="rayons"></div><img alt="" style="${col !== rang ? col > rang ? `height:${u(110)}` : `width:${u(110)}` : ""}"></div>
        <div class="texte"><b>${echap(inf.nom)}</b><div class="ser">${echap(inf.serieNom)}</div><div class="puces"><span>\xD7${Math.trunc(+a?.n) || 1} dans ta bo\xEEte</span>${col * rang > 1 ? `<span>Grand badge ${col}\xD7${rang}</span>` : ""}${a ? `<span>Gagn\xE9 le ${date(a.t)}</span>` : ""}</div></div>
        <div class="choix">${boutons([["coller", "A", "Coller sur l'accueil"], ["ranger", "B", "Ranger"]])}</div></div>`;
      poserImage(fi.querySelector(".socle > img"), id);
    }
    fi.classList.add("on");
    fi.querySelectorAll(".choix button").forEach((x) => x.onclick = (e) => {
      e.stopPropagation();
      choixFiche(x.dataset.acte);
    });
    marquerFiche();
  };
  const marquerFiche = () => {
    const f = ficheOuverte, fi = $(".boite .fiche");
    if (!f || !fi) return;
    if (f.morceaux) {
      fi.querySelectorAll(".assemble img").forEach((im, i) => im.classList.toggle("curseur", i === f.k));
      fi.querySelector('[data-acte="morceau"]')?.classList.toggle("off", !aMorceau(boite(), f.morceaux[f.k]));
    } else fi.querySelectorAll(".choix button").forEach((x, i) => x.classList.toggle("choisi", i === f.sel));
  };
  const choixFiche = (acte) => {
    const f = ficheOuverte;
    if (!f) return;
    if (acte === "morceau" && !aMorceau(boite(), f.morceaux[f.k])) return son("refus");
    if (acte === "entier" && !f.fini) return son("refus");
    ficheOuverte = null;
    $(".boite .fiche").classList.remove("on");
    if (acte === "ranger") return son("retour");
    son("pop");
    boiteOuverte = false;
    racine.classList.remove("boite-on");
    $(".boite").classList.remove("on");
    coller(acte === "morceau" ? f.morceaux[f.k] : f.id);
  };
  const capter = (el, e) => {
    try {
      el.setPointerCapture(e.pointerId);
    } catch (er) {
    }
  };
  const brancherSalle = () => {
    const s = $(".salle"), r = $(".rail");
    let d = null;
    s.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button,.pipo")) return;
      d = { x: e.clientX, t: performance.now(), base: sel, glisse: false };
      capter(s, e);
    });
    s.addEventListener("pointermove", (e) => {
      if (!d) return;
      const dx = e.clientX - d.x;
      if (!d.glisse && Math.abs(dx) > 12) {
        d.glisse = true;
        r.classList.add("glisse");
      }
      if (d.glisse) r.style.transform = `translateX(calc(${u(640 - (d.base * PAS_HALL + 150))} + ${dx}px))`;
    });
    const fin = (e) => {
      if (!d) return;
      const dx = e.clientX - d.x, v = dx / Math.max(1, performance.now() - d.t);
      r.classList.remove("glisse");
      if (d.glisse) choisir(Math.round(d.base - (dx + v * 180) / (PAS_HALL * innerHeight / 800)));
      else {
        const b = e.target.closest?.(".borne") || document.elementFromPoint(e.clientX, e.clientY)?.closest(".borne");
        if (b) {
          const i = +b.dataset.i;
          i === sel ? approcher() : choisir(i);
        }
      }
      d = null;
    };
    s.addEventListener("pointerup", fin);
    s.addEventListener("pointercancel", () => {
      d = null;
      r.classList.remove("glisse");
      placerRail();
    });
    racine.addEventListener("click", (e) => {
      const a = e.target.closest("[data-action]")?.dataset.action;
      if (!a) return;
      e.stopPropagation();
      if (a === "approcher") approcher();
      else if (a === "boite") ouvrirBoite();
      else if (a === "hall") revenirHall();
      else if (a === "fermer-boite") fermerBoite();
      else if (a === "mode") basculerMode();
    });
    hote.addEventListener("click", () => {
      son("pop");
      dire(ASTUCES[Math.floor(Math.random() * ASTUCES.length)], true);
    });
  };
  const brancherJeu = () => {
    const c = $(".vitre-jeu canvas");
    let vise = false;
    const monde = (e) => {
      const r = c.getBoundingClientRect();
      return (e.clientX - r.left) / r.width * W;
    };
    const viser = (x) => {
      const j = mJeu.jeu;
      j.cible = mJeu.type === "pince" ? clamp(x, PINCE.xmin, PINCE.xmax) : clamp(x - 30, POUSSE.xmin, POUSSE.xmax);
    };
    c.addEventListener("pointerdown", (e) => {
      if (mJeu?.jeu.etat !== "attente") return;
      vise = true;
      capter(c, e);
      viser(monde(e));
    });
    c.addEventListener("pointermove", (e) => {
      if (vise) viser(monde(e));
    });
    c.addEventListener("pointerup", () => {
      if (vise) {
        vise = false;
        jouer();
      }
    });
    c.addEventListener("pointercancel", () => vise = false);
    for (const b of racine.querySelectorAll(".commandes .bt[data-dir]")) {
      b.addEventListener("pointerdown", (e) => {
        capter(b, e);
        if (mJeu?.jeu) mJeu.jeu.dir = +b.dataset.dir;
        son("bouge");
      });
      const stop = () => {
        if (mJeu?.jeu) mJeu.jeu.dir = 0;
      };
      b.addEventListener("pointerup", stop);
      b.addEventListener("pointercancel", stop);
    }
    $(".commandes .bt.a").addEventListener("click", jouer);
    window.removeEventListener("resize", mesurer);
    window.addEventListener("resize", mesurer);
  };
  const brancherBoite = () => {
    const el = $(".boite");
    el.querySelectorAll(".ong").forEach((o) => o.onclick = () => {
      bs.s = +o.dataset.i;
      bs.zone = "s";
      son("bouge");
      afficherSerie();
    });
    el.querySelector(".grille")?.addEventListener("click", (e) => {
      const c = e.target.closest(".case");
      if (!c) return;
      bs.zone = "g";
      bs.g = +c.dataset.i;
      marquerGrille();
      ouvrirFiche();
    });
    el.querySelector(".fiche").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) choixFiche("ranger");
    });
  };
  const pasManette = 26;
  const touche = (b) => {
    if (!racine) return false;
    if (gainOuvert) {
      const g = gainOuvert, n = g.actes.length;
      if (b === 11 || b === 12) {
        g.sel = (g.sel + (b === 12 ? 1 : n - 1)) % n;
        marquerGain();
        son("bouge");
      } else if (b === 1) choixGain(g.actes[g.sel]);
      else if (b === 2) choixGain("suite");
      else if (b === 3 && g.actes.includes("entier")) choixGain("entier");
      return true;
    }
    if (boiteOuverte) {
      if (ficheOuverte) {
        const f = ficheOuverte;
        if (f.morceaux) {
          if (b >= 9 && b <= 12) {
            const x = f.k % f.col, y = Math.floor(f.k / f.col), nx = clamp(x + (b === 12) - (b === 11), 0, f.col - 1), ny = clamp(y + (b === 10) - (b === 9), 0, f.rang - 1);
            if (ny * f.col + nx !== f.k) {
              f.k = ny * f.col + nx;
              son("bouge");
              marquerFiche();
            }
          } else if (b === 1) choixFiche("morceau");
          else if (b === 3) choixFiche("entier");
          else if (b === 2) choixFiche("ranger");
          return true;
        }
        if (b === 11 || b === 12 || b === 9 || b === 10) {
          f.sel = 1 - f.sel;
          marquerFiche();
          son("bouge");
        } else if (b === 1) choixFiche(f.sel ? "ranger" : "coller");
        else if (b === 2) choixFiche("ranger");
        return true;
      }
      if (b === 2) {
        if (bs.zone === "g") {
          bs.zone = "s";
          marquerGrille();
          son("retour");
        } else fermerBoite();
        return true;
      }
      if (b === 4) {
        fermerBoite();
        return true;
      }
      if (b === 5 || b === 6) {
        bs.s = clamp(bs.s + (b === 6 ? 1 : -1), 0, bs.ordre.length - 1);
        bs.g = 0;
        son("bouge");
        afficherSerie();
        return true;
      }
      if (bs.zone === "s") {
        if (b === 9 || b === 10) {
          bs.s = clamp(bs.s + (b === 10 ? 1 : -1), 0, bs.ordre.length - 1);
          bs.g = 0;
          son("bouge");
          afficherSerie();
        } else if ((b === 12 || b === 1) && bs.ordre[bs.s]) {
          bs.zone = "g";
          bs.g = premierGagne();
          son("bouge");
          marquerGrille();
        }
        return true;
      }
      const n = bs.ordre[bs.s]?.s.lots.length || 0, k = colonnes();
      if (b === 11) {
        if (bs.g % k === 0) {
          bs.zone = "s";
        } else bs.g--;
      } else if (b === 12) bs.g = Math.min(n - 1, bs.g + 1);
      else if (b === 9) bs.g = Math.max(0, bs.g - k);
      else if (b === 10) bs.g = Math.min(n - 1, bs.g + k);
      else if (b === 1) {
        ouvrirFiche();
        return true;
      }
      son("bouge");
      marquerGrille();
      return true;
    }
    if (vue === "machine") {
      const j = mJeu?.jeu;
      if (!j) return true;
      if (b === 2) {
        if (j.etat === "attente") revenirHall();
        return true;
      }
      if (b === 4) {
        if (j.etat === "attente") ouvrirBoite();
        return true;
      }
      if (b === 1) {
        jouer();
        return true;
      }
      if ((b === 11 || b === 12) && j.etat === "attente") {
        j.cible = clamp(j.cible + (b === 12 ? pasManette : -pasManette), mJeu.type === "pince" ? PINCE.xmin : POUSSE.xmin, mJeu.type === "pince" ? PINCE.xmax : POUSSE.xmax);
        son("bouge");
      }
      return true;
    }
    if (b === 11 || b === 12) {
      choisir(sel + (b === 12 ? 1 : -1));
      return true;
    }
    if (b === 5 || b === 6) {
      choisir(b === 6 ? machines.length - 1 : 0);
      return true;
    }
    if (b === 1) {
      approcher();
      return true;
    }
    if (b === 4) {
      ouvrirBoite();
      return true;
    }
    if (b === 3) {
      basculerMode();
      return true;
    }
    if (b === 9 || b === 10) return true;
    return false;
  };
  const ouvrir = async (conteneur) => {
    fermer();
    if (!conteneur) return;
    if (!await window.__pcvNintendo?.exiger?.("badges")) return false;
    racine = document.createElement("div");
    racine.className = "pcv-arcade";
    racine.dataset.vue = vue = "hall";
    conteneur.appendChild(racine);
    const r0 = racine;
    await chargerIndex();
    if (racine !== r0) return;
    preparerMachines();
    construire();
    window.__pcvMusique?.("mii-maker-main");
    const p = parties(), nb = machines.length - 1;
    dire(nb ? T("luigi.benvenuto_arcade", { nb, s: nb > 1 ? "s" : "" }) : T("luigi.solo_entrainement"), true);
    if (!nb) dire("Pour remplir les autres, range ta collection de badges dans le dossier priv\xE9 de la console.");
    else if (!p.offertes && !p.bonus) dire("Tu as jou\xE9 toutes tes parties du jour. D\xE9bloque des succ\xE8s dans tes jeux pour en gagner d'autres !");
    const minute = setInterval(() => {
      const q = $(".hud-g .jour");
      if (q) q.textContent = quand();
    }, 6e4);
    minuteries.push({ i: minute });
    lireSucces().then((noms) => {
      if (racine !== r0 || !noms.length) return;
      majHud();
      son("piece");
      dire(noms.length === 1 ? `Tu as d\xE9bloqu\xE9 \xAB ${noms[0].nom} \xBB sur ${noms[0].jeu} : une partie en cadeau !` : `Tu as d\xE9bloqu\xE9 ${noms.length} succ\xE8s dans tes jeux : ${noms.length} parties en cadeau !`);
    });
  };
  const fermer = () => {
    arreter();
    moteur(false);
    if (mot) {
      try {
        mot.o.stop();
      } catch (e) {
      }
      mot = null;
    }
    if (parole) {
      clearInterval(parole.i);
      clearTimeout(parole.f);
      parole = null;
    }
    fileBulle = [];
    clearTimeout(presentation);
    minuteries.forEach((t) => t.i ? clearInterval(t.i) : clearTimeout(t));
    minuteries = [];
    observateur?.disconnect();
    observateurOnglets?.disconnect();
    if (mJeu?.jeu) {
      mJeu.jeu.tenus?.forEach((t) => lacher(t.c));
      if (mJeu.jeu.tenus) mJeu.jeu.tenus = [];
      mJeu.jeu.etat = "attente";
      mJeu.jeu.dir = 0;
    }
    window.removeEventListener("resize", mesurer);
    racine?.remove();
    racine = null;
    mJeu = null;
    boiteOuverte = false;
    gainOuvert = null;
    ficheOuverte = null;
    vue = "hall";
  };
  window.__pcvArcade = {
    ouvrir,
    fermer,
    touche,
    info,
    collection: () => Object.keys(boite()),
    surColler: null,
    charger: chargerIndex,
    exemplaires,
    banc: () => ({ machine: mJeu, machines, sel, vue, geler: (v) => gel = v, simuler: (s) => {
      for (let k = 0; k < s * 120; k++) avancer(mJeu, 1 / 120);
    } })
  };
  return "arcade pr\xEAte";
})();
