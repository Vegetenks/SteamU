(() => {
  window.__pcvCasinoJeux?.fin?.();
  const Tr = window.__pcvT || ((c) => c);
  const fins = [];
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
  const jourDe = (d = /* @__PURE__ */ new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const css = (s) => s.replace(/(-?\d*\.?\d+)u\b/g, "calc(var(--u) * $1)");
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  let vitesse = 1;
  let presse = false;
  let jeton = 0;
  const attendre = (ms) => anim(ms / 1e3, () => {
  }, (k) => k);
  const hasard = () => Math.random();
  const CLE = "pcv-casino-jeux", CLE_PARTIES = "pcv-arcade-parties";
  const ECO = { depart: 10, cadeauDuJour: 5, plancher: 10, depannagesParJour: 3, taux: 20, changesParFenetre: 4, fenetreChangeH: 3, plafond: 9999 };
  const bourse = () => {
    const b = lire(CLE, null) || { pieces: ECO.depart, jour: "", depannages: 0, changes: 0, etoiles: 0 };
    if (b.jour !== jourDe()) {
      b.annonce = b.jour ? Tr("casino.cadeau_du_jour", { n: ECO.cadeauDuJour }) : Tr("casino.voila_pieces_commencer", { n: ECO.depart });
      if (b.jour) b.pieces = Math.min(ECO.plafond, Math.max(ECO.depart, b.pieces + ECO.cadeauDuJour));
      Object.assign(b, { jour: jourDe(), depannages: 0 });
      ecrire(CLE, b);
    }
    if (b.changes && Date.now() - (b.fenetre || 0) >= ECO.fenetreChangeH * 36e5) {
      Object.assign(b, { changes: 0, fenetre: 0 });
      ecrire(CLE, b);
    }
    return b;
  };
  const attenteChange = (b) => {
    const m = Math.max(1, Math.ceil(((b.fenetre || 0) + ECO.fenetreChangeH * 36e5 - Date.now()) / 6e4));
    return m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? " " + String(m % 60).padStart(2, "0") : ""}` : `${m} min`;
  };
  const illimite = () => lire("pcv-casino-illimite", false) === true;
  const pieces = () => illimite() ? ECO.plafond : bourse().pieces;
  const modifier = (f) => {
    const b = bourse(), avant = b.pieces;
    f(b);
    b.pieces = illimite() ? avant : Math.max(0, Math.min(ECO.plafond, b.pieces));
    ecrire(CLE, b);
    majBourse();
    if (avant > 0 && b.pieces === 0) setTimeout(proposer, 1800 * vitesse);
    return b;
  };
  const payer = (n) => {
    if (pieces() < n) return false;
    modifier((b) => {
      b.pieces -= n;
    });
    return true;
  };
  const recevoir = (n) => modifier((b) => {
    b.pieces += n;
  });
  const depanner = () => {
    const b = bourse();
    if (b.pieces > 0 || b.depannages >= ECO.depannagesParJour) return false;
    modifier((x) => {
      x.pieces += ECO.plancher;
      x.depannages++;
    });
    return true;
  };
  const crediterParties = (n, raison) => {
    const f = opts.crediter || window.__pcvCasinoBadges?.crediter;
    if (typeof f === "function") return f(n, raison);
    const p = lire(CLE_PARTIES, null) || { jour: "", offertes: 0, bonus: 0, jetons: 0, bonusJetons: 0 };
    p.bonus = (p.bonus || 0) + n;
    ecrire(CLE_PARTIES, p);
    return p.offertes + p.bonus;
  };
  const partiesAuxBornes = () => {
    const e = window.__pcvCasinoBadges?.etat?.();
    if (e && Number.isFinite(e.parties)) return e.parties;
    const p = lire(CLE_PARTIES, null);
    return p ? (p.jour === jourDe() ? p.offertes : 0) + (p.bonus || 0) : null;
  };
  const changer = () => {
    const b = bourse();
    if (illimite()) return { ok: false, texte: Tr("luigi.mode_essai_illimite") };
    if (b.changes >= ECO.changesParFenetre) return { ok: false, texte: Tr("luigi.plus_change", { temps: attenteChange(b) }) };
    if (b.pieces < ECO.taux) return { ok: false, texte: Tr("casino.il_faut_pieces_partie", { n: ECO.taux }) };
    modifier((x) => {
      x.pieces -= ECO.taux;
      if (!x.changes) x.fenetre = Date.now();
      x.changes++;
    });
    crediterParties(1, "casino de Luigi : change");
    if (session) session.gain++;
    const reste = ECO.changesParFenetre - b.changes - 1;
    return { ok: true, texte: Tr("luigi.une_partie_bonus", { reste: reste ? Tr("casino.encore_n_aujourdhui", { n: reste }) : "" }) };
  };
  const CLE_BOITE = "pcv-arcade-boite", PRIX = { petit: 3, morceau: 4, parCase: 4, grandMax: 16, secret: 2 };
  const arcade = () => window.__pcvArcade?.info && window.__pcvArcade?.charger && window.__pcvArcade?.exemplaires ? window.__pcvArcade : null;
  const aBadges = () => !!arcade() && Object.keys(lire(CLE_BOITE, null) || {}).length > 0;
  const posesAccueil = () => {
    const G = window.__pcvGrille, X = arcade();
    let l, sauver;
    if (G?.cases?.().length) {
      l = G.tout?.() || G.cases();
      sauver = () => G.changer(() => {
      });
    } else {
      const g = lire("pcv-grille", null);
      if (!Array.isArray(g)) return { l: [], de: () => [], sauver: () => {
      } };
      l = g.flatMap((c) => c?.dossier ? c.l || [] : [c]);
      sauver = () => ecrire("pcv-grille", g);
    }
    const de = (c) => c.bt && c.bt[0] * c.bt[1] > 1 && X?.info(c.bd)?.morceaux || [c.bd];
    return { l: l.filter((c) => c && c.bd != null), de, sauver };
  };
  const compterPoses = (P) => {
    const n = {};
    for (const c of P.l) for (const x of P.de(c)) n[x] = (n[x] || 0) + 1;
    return n;
  };
  const catalogueVente = async () => {
    const X = arcade(), idx = await X.charger(), b = lire(CLE_BOITE, {}), ex = X.exemplaires(), poses = compterPoses(posesAccueil());
    const progres = /* @__PURE__ */ new Map(), avoir = (sid) => {
      if (progres.has(sid)) return progres.get(sid);
      const s = idx?.series?.find((x) => x.id === sid);
      if (!s) return null;
      const k = s.lots.filter((f) => {
        const id = `${sid}/${f}`, m = X.info(id)?.morceaux;
        return b[id] || m && m.every((x) => b[x]);
      }).length;
      const r = { k, n: s.lots.length, nom: s.nom };
      progres.set(sid, r);
      return r;
    };
    const l = [];
    for (const [id, v] of Object.entries(b)) {
      const inf = X.info(id);
      if (!inf) continue;
      const n = v?.n || 1, doublon = n > 1;
      let base = inf.morceau ? PRIX.morceau : inf.morceaux ? Math.min(PRIX.grandMax, PRIX.parCase * inf.colonnes * inf.rangees) : PRIX.petit;
      if (inf.nom === "Badge secret") base *= PRIX.secret;
      const pose = (inf.morceaux || [id]).some((x) => (ex[x] || 0) - 1 < (poses[x] || 0)), serie = avoir(inf.serie);
      l.push({
        id,
        n,
        doublon,
        pose,
        serie,
        prix: doublon ? Math.ceil(base / 2) : base,
        nom: inf.nom + (inf.morceau ? `, morceau ${inf.morceau.numero}/${inf.morceau.sur}` : inf.morceaux ? ", grand badge" : ""),
        collection: !doublon && serie && serie.k * 2 >= serie.n
      });
    }
    return l.sort((a, c) => c.doublon - a.doublon || a.collection - c.collection || a.pose - c.pose || (a.serie?.k / a.serie?.n || 0) - (c.serie?.k / c.serie?.n || 0) || a.prix - c.prix);
  };
  const vendre = (it) => {
    const X = arcade(), b = lire(CLE_BOITE, {}), v = b[it.id];
    if (!v || !X) return false;
    if ((v.n || 1) > 1) v.n = (v.n || 1) - 1;
    else delete b[it.id];
    ecrire(CLE_BOITE, b);
    let decolle = false;
    const ex = X.exemplaires(), P = posesAccueil(), poses = compterPoses(P);
    for (const c of P.l.slice().reverse()) {
      const d = P.de(c);
      if (!d.some((x) => poses[x] > (ex[x] || 0))) continue;
      for (const x of d) poses[x]--;
      c.bd = null;
      delete c.bt;
      decolle = true;
    }
    if (decolle) {
      try {
        P.sauver();
      } catch (e) {
      }
    }
    return { decolle };
  };
  const FICHIERS = {
    distribue: "C_KUBARU",
    melange: "C_SHUFFLE",
    touche: "C_TOUCH",
    monte: "C_UP",
    descend: "C_DOWN",
    change: "C_CHANGE",
    revele: "C_TURN_POKER",
    retourne: "C_TURN_ONLY",
    trie: "C_SORT",
    forme: "C_SOROU",
    mise: "COIN_BET",
    miseAuto: "COIN_AUTOBET",
    piece: "COIN_GET",
    perdu: "COIN_LOST",
    gagne: "CASINO_WIN",
    rate: "CASINO_BAD",
    egalite: "CASINO_DRAW",
    tinte: "COIN_HYUN"
  };
  const REPLI = {
    distribue: "bouge",
    touche: "bouge",
    monte: "prendre",
    descend: "poser",
    change: "bouge",
    revele: "choisir",
    retourne: "bouge",
    trie: "bouge",
    mise: "prendre",
    miseAuto: "prendre",
    piece: "colle",
    gagne: "gagne",
    rate: "rate",
    egalite: "retour",
    tinte: "colle"
  };
  const VOIX = { accueil: ["START"], cartes: ["PROMPT"], gagne: ["CLAP"], bravo: ["PAIR", "CLAP"], rate: ["NOPAIR"], presque: ["LOSE"], noeud: ["DRAW"] };
  let ac = null, maitre = null, opts = {};
  const tampons = {};
  const volume = () => +lire("pcv-bruitages", 1) || 0;
  const octets = async (chemin, type) => {
    if (opts.lire) return opts.lire(chemin);
    const url = await window.__pcvRessource?.(chemin, type);
    if (!url) throw new Error("absent");
    try {
      return await (await fetch(url)).arrayBuffer();
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  const chargerSons = async () => {
    try {
      ac ||= new AudioContext();
      if (!maitre) {
        maitre = ac.createGain();
        maitre.connect(ac.destination);
      }
    } catch (e) {
      return;
    }
    const voix = [...new Set(Object.values(VOIX).flat())].map((f) => ["L_" + f, "casino-luigi/voix/NCS_SE_MGM_L_" + f + ".wav"]);
    await Promise.all([...Object.entries(FICHIERS).map(([n, f]) => [n, "casino-luigi/sons/NCS_SE_MGM_" + f + ".wav"]), ...voix].map(async ([nom, chemin]) => {
      if (tampons[nom] !== void 0) return;
      tampons[nom] = null;
      try {
        tampons[nom] = await ac.decodeAudioData(await octets(chemin, "audio/wav"));
      } catch (e) {
      }
    }));
  };
  const son = (nom, v = 1) => {
    if (!volume()) return;
    const b = tampons[nom];
    if (!b || !ac) {
      if (REPLI[nom]) window.__pcvSon?.(REPLI[nom]);
      return;
    }
    try {
      if (ac.state === "suspended") ac.resume();
      maitre.gain.value = volume() * 0.8;
      const s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = b;
      g.gain.value = v;
      s.connect(g).connect(maitre);
      s.start();
    } catch (e) {
    }
  };
  const geste = (nom) => {
    const g = opts.luigi?.geste;
    if (typeof g === "function") {
      try {
        g(nom);
      } catch (e) {
      }
      return;
    }
    const L = opts.luigiModele;
    if (!L?.reagir) return;
    let t = 0;
    for (const f of VOIX[nom] || []) {
      setTimeout(() => son("L_" + f, 0.9), t);
      t += (tampons["L_" + f]?.duration || 0.6) * 1e3 + 120;
    }
    L.reagir(nom, { silence: true })?.catch?.(() => {
    });
  };
  const etoileChemin = (cx, cy, R, r) => {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r : R;
      d += (i ? "L" : "M") + (cx + Math.cos(a) * k).toFixed(1) + " " + (cy + Math.sin(a) * k).toFixed(1);
    }
    return d + "Z";
  };
  const yeux = (x1, x2, y, rx = 3.6, ry = 7.5) => `<ellipse cx="${x1}" cy="${y}" rx="${rx}" ry="${ry}" fill="#1b1b1b"/><ellipse cx="${x2}" cy="${y}" rx="${rx}" ry="${ry}" fill="#1b1b1b"/><ellipse cx="${x1 + 0.8}" cy="${y - ry * 0.45}" rx="${rx * 0.4}" ry="${ry * 0.3}" fill="#fff"/><ellipse cx="${x2 + 0.8}" cy="${y - ry * 0.45}" rx="${rx * 0.4}" ry="${ry * 0.3}" fill="#fff"/>`;
  const etoile = `<path d="${etoileChemin(50, 54, 46, 21)}" fill="#ffd21f" stroke="#e58a00" stroke-width="6" stroke-linejoin="round"/><path d="${etoileChemin(50, 54, 33, 15)}" fill="#ffe46b" opacity=".7"/>` + yeux(43, 57, 50, 3.6, 8);
  const tete = (cap, ombre, lettre, moustache) => `<circle cx="22" cy="62" r="8" fill="#ffc994" stroke="#8a5530" stroke-width="2.5"/><circle cx="78" cy="62" r="8" fill="#ffc994" stroke="#8a5530" stroke-width="2.5"/><circle cx="50" cy="60" r="29" fill="#ffd1a1" stroke="#8a5530" stroke-width="3"/><path d="M17 52 C15 14 85 14 83 52 Q50 42 17 52Z" fill="${cap}" stroke="${ombre}" stroke-width="3" stroke-linejoin="round"/><path d="M24 50 Q55 38 90 50 Q86 58 56 54 Q36 52 24 56Z" fill="${cap}" stroke="${ombre}" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="31" r="11" fill="#fff" stroke="${ombre}" stroke-width="2"/><text x="50" y="37.5" text-anchor="middle" font-family="Nunito, Arial, sans-serif" font-weight="900" font-size="17" fill="${cap}">${lettre}</text><ellipse cx="42" cy="61" rx="4.6" ry="7.5" fill="#fff" stroke="#3a2a20" stroke-width="1.2"/><ellipse cx="58" cy="61" rx="4.6" ry="7.5" fill="#fff" stroke="#3a2a20" stroke-width="1.2"/><ellipse cx="43" cy="62" rx="2.6" ry="4.6" fill="#2563c9"/><ellipse cx="57" cy="62" rx="2.6" ry="4.6" fill="#2563c9"/><path d="${moustache}" fill="#2a1a12"/><circle cx="50" cy="71" r="9.5" fill="#ffbf88" stroke="#8a5530" stroke-width="2.5"/>`;
  const SYMBOLES = {
    nuage: `<g stroke="#8fa6bf" stroke-width="7"><circle cx="28" cy="58" r="19"/><circle cx="50" cy="44" r="24"/><circle cx="72" cy="58" r="19"/><circle cx="50" cy="66" r="22"/></g><g fill="#fff"><circle cx="28" cy="58" r="19"/><circle cx="50" cy="44" r="24"/><circle cx="72" cy="58" r="19"/><circle cx="50" cy="66" r="22"/></g><ellipse cx="44" cy="40" rx="11" ry="6" fill="#eef4fb"/>` + yeux(43, 57, 55, 3.4, 7) + `<path d="M41 68 Q50 75 59 68" fill="none" stroke="#1b1b1b" stroke-width="3" stroke-linecap="round"/>`,
    champignon: `<rect x="29" y="54" width="42" height="36" rx="14" fill="#f8ead0" stroke="#a5865a" stroke-width="3.5"/>` + yeux(44, 56, 70, 3, 7) + `<path d="M8 62 C6 18 94 18 92 62 Q50 72 8 62Z" fill="#e52521" stroke="#8c1010" stroke-width="3.5" stroke-linejoin="round"/><circle cx="50" cy="31" r="11" fill="#fff"/><ellipse cx="22" cy="49" rx="8" ry="9" fill="#fff"/><ellipse cx="78" cy="49" rx="8" ry="9" fill="#fff"/>`,
    fleur: `<path d="M50 62 V94" stroke="#2f9a3a" stroke-width="7" stroke-linecap="round"/><ellipse cx="34" cy="84" rx="15" ry="7" transform="rotate(-25 34 84)" fill="#3cb44a" stroke="#1e6b27" stroke-width="2.5"/><ellipse cx="66" cy="84" rx="15" ry="7" transform="rotate(25 66 84)" fill="#3cb44a" stroke="#1e6b27" stroke-width="2.5"/><ellipse cx="50" cy="38" rx="42" ry="29" fill="#f24a1c" stroke="#8a200a" stroke-width="3.5"/><ellipse cx="50" cy="38" rx="30" ry="20" fill="#ffd21f"/><ellipse cx="50" cy="38" rx="18" ry="12" fill="#fffdf2"/>` + yeux(45, 55, 38, 2.4, 6),
    luigi: tete("#2ea43c", "#13581d", "L", "M29 80 Q34 70 43 74 Q50 77 57 74 Q66 70 71 80 Q66 83 61 79 Q55 85 50 81 Q45 85 39 79 Q34 83 29 80Z"),
    mario: tete("#e2231a", "#7d0d0a", "M", "M31 78 Q38 70 50 75 Q62 70 69 78 Q63 84 56 80 Q50 84 44 80 Q37 84 31 78Z"),
    etoile,
    // ceux de la machine à sous
    superetoile: `<rect x="4" y="4" width="92" height="92" rx="20" fill="#d8262b" stroke="#7d0d0a" stroke-width="4"/><rect x="11" y="11" width="78" height="78" rx="14" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.5"/><g transform="translate(10 10) scale(.8)">${etoile}</g>`,
    plume: `<path d="M22 86 Q30 44 70 14 Q86 30 74 52 Q60 74 22 86Z" fill="#ffb21f" stroke="#a85a00" stroke-width="3.5" stroke-linejoin="round"/><path d="M70 14 Q86 30 74 52 Q72 40 62 30Z" fill="#fff6d8"/><path d="M22 86 Q46 56 66 26" fill="none" stroke="#a85a00" stroke-width="3" stroke-linecap="round"/><path d="M40 64 L30 58 M50 52 L40 44 M58 42 L50 34" stroke="#d07a00" stroke-width="2.5" stroke-linecap="round"/>`,
    oeuf: `<path d="M50 8 C76 8 88 46 88 62 C88 82 72 94 50 94 C28 94 12 82 12 62 C12 46 24 8 50 8Z" fill="#fff" stroke="#8a9a8a" stroke-width="3.5"/><g fill="#36b24a"><ellipse cx="38" cy="34" rx="9" ry="10"/><ellipse cx="66" cy="46" rx="10" ry="11"/><ellipse cx="34" cy="68" rx="11" ry="10"/><ellipse cx="62" cy="80" rx="9" ry="7"/></g><ellipse cx="36" cy="22" rx="6" ry="9" fill="#fff" opacity=".9" transform="rotate(-20 36 22)"/>`
  };
  let T = null, A = null, monde = null, desabonner = null, secours = 0, S = null;
  const jetables = [], tweens = /* @__PURE__ */ new Set(), parImage = /* @__PURE__ */ new Set(), restaurer = [];
  const masquer = (o) => {
    if (!o) return;
    const v = o.visible;
    o.visible = false;
    restaurer.push(() => {
      o.visible = v;
    });
  };
  const poserSur = (parent, o) => {
    parent.add(o);
    restaurer.push(() => o.removeFromParent());
    return o;
  };
  const garder = (x) => {
    jetables.push(x);
    return x;
  };
  const lisse = (k) => k * k * (3 - 2 * k), sortie = (k) => 1 - (1 - k) ** 3, lineaire = (k) => k;
  const ressort = (k) => {
    const c = 1.6;
    return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
  };
  const lerp = (a, b, k) => a + (b - a) * k;
  const anim = (s, f, ease = lisse) => {
    const j = jeton;
    return new Promise((ok) => {
      tweens.add({ t: 0, d: Math.max(1e-3, s * vitesse), f, ease, ok, j });
    });
  };
  const image = (dt) => {
    dt = Math.min(+dt || 0, 0.1);
    for (const w of [...tweens]) {
      if (w.j !== jeton) {
        tweens.delete(w);
        continue;
      }
      w.t += presse ? dt * RYTHME.presse : dt;
      const k = Math.min(1, w.t / w.d);
      w.f(w.ease(k), k);
      if (k >= 1) {
        tweens.delete(w);
        w.ok();
      }
    }
    for (const f of [...parImage]) f(dt);
  };
  const toile = (l, h) => {
    const c = document.createElement("canvas");
    c.width = l;
    c.height = h;
    const x = c.getContext("2d");
    const tex = garder(new T.CanvasTexture(c));
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    return { c, x, tex };
  };
  const matiere = (o) => garder(new T.MeshStandardMaterial(o));
  const forme = (l, h, r, cx = 0, cy = 0) => {
    const s = new T.Shape(), x = cx - l / 2, y = cy - h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + l - r, y);
    s.quadraticCurveTo(x + l, y, x + l, y + r);
    s.lineTo(x + l, y + h - r);
    s.quadraticCurveTo(x + l, y + h, x + l - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };
  const plaque = (l, h, r) => {
    const g = new T.ShapeGeometry(forme(l, h, r), 6), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / l + 0.5, p.getY(i) / h + 0.5);
    return garder(g);
  };
  const cadre = (l, h, e) => {
    const r = Math.min(l, h) * 0.12, s = forme(l + 2 * e, h + 2 * e, r + e);
    s.holes.push(forme(l, h, r));
    return garder(new T.ShapeGeometry(s, 6));
  };
  const aPlat = (m) => {
    m.rotation.x = -Math.PI / 2;
    return m;
  };
  const versAncre = (p) => A.ancre.localToWorld(new T.Vector3(...p));
  const cadrer = (pos, cible, d = 1.1) => Promise.resolve(A.cadrer?.(versAncre(pos), versAncre(cible), d)).catch(() => {
  });
  const regarder = (p) => {
    try {
      A.luigi?.regarder?.(p ? monde.localToWorld(new T.Vector3(...p)) : null);
    } catch (e) {
    }
  };
  const curseur = (geo) => {
    const m = new T.Mesh(geo, garder(new T.MeshBasicMaterial({ color: 16777215, transparent: true, depthWrite: false })));
    m.renderOrder = 5;
    parImage.add(() => {
      m.material.opacity = 0.6 + 0.4 * Math.sin(performance.now() / 210);
    });
    return m;
  };
  const POLICE = "Nunito, 'Arial Rounded MT Bold', Arial, sans-serif";
  const arrondi = (x, X, Y, L, H, R) => {
    x.beginPath();
    x.moveTo(X + R, Y);
    x.arcTo(X + L, Y, X + L, Y + H, R);
    x.arcTo(X + L, Y + H, X, Y + H, R);
    x.arcTo(X, Y + H, X, Y, R);
    x.arcTo(X, Y, X + L, Y, R);
    x.closePath();
  };
  const ecrit = (x, texte, X, Y, taille, o = {}) => {
    x.font = `900 ${taille}px ${POLICE}`;
    x.textAlign = o.align || "center";
    x.textBaseline = "middle";
    x.lineJoin = "round";
    if (o.contour) {
      x.lineWidth = o.epaisseur || taille * 0.16;
      x.strokeStyle = o.contour;
      x.strokeText(texte, X, Y);
    }
    x.fillStyle = o.couleur || "#fff";
    x.fillText(texte, X, Y);
  };
  let attenteImages = null;
  const chargerImages = () => attenteImages ||= Promise.all(Object.entries(SYMBOLES).map(([n, s]) => new Promise((ok) => {
    const im = new Image();
    im.onload = () => ok([n, im]);
    im.onerror = () => ok([n, null]);
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">${s}</svg>`);
  })).concat(planche().then(() => ["", null]))).then((l) => new Map(l));
  const symbole = (x, n, X, Y, t) => {
    const im = S?.get(n);
    if (im) x.drawImage(im, X - t / 2, Y - t / 2, t, t);
  };
  let pieceGeo = null, pieceMats = null;
  const PIECE = { r: 0.016, ep: 34e-4, cloche: 0.09 };
  const PIECE_DESSIN = { tranche: 14260736, face: { metalness: 0.45, roughness: 0.35 }, bord: { metalness: 0.6, roughness: 0.35 } };
  const dessinerPiece = (x) => {
    x.fillStyle = "#e3a200";
    x.fillRect(0, 0, 128, 128);
    x.fillStyle = "#ffd84a";
    x.beginPath();
    x.arc(64, 64, 50, 0, 7);
    x.fill();
    x.fillStyle = "#c98a00";
    arrondi(x, 55, 28, 18, 72, 9);
    x.fill();
  };
  const piece = () => {
    if (!pieceGeo) {
      pieceGeo = garder(new T.CylinderGeometry(PIECE.r, PIECE.r, PIECE.ep, 32));
      const { x, tex } = toile(128, 128);
      dessinerPiece(x);
      const face = matiere({ map: tex, ...PIECE_DESSIN.face });
      pieceMats = [matiere({ color: PIECE_DESSIN.tranche, ...PIECE_DESSIN.bord }), face, face];
    }
    return new T.Mesh(pieceGeo, pieceMats);
  };
  const pile = (parent, pos) => {
    const g = new T.Group();
    g.position.set(...pos);
    parent.add(g);
    const P = {
      g,
      get n() {
        return g.children.length;
      },
      mettre(n) {
        n = Math.min(n, 40);
        while (g.children.length > n) g.children[g.children.length - 1].removeFromParent();
        while (g.children.length < n) {
          const m = piece(), i = g.children.length;
          m.position.set((hasard() - 0.5) * PIECE.r * 0.15, PIECE.ep / 2 + i * PIECE.ep, (hasard() - 0.5) * PIECE.r * 0.15);
          m.rotation.y = hasard() * 6;
          g.add(m);
        }
      },
      // la pile glisse (vers le joueur : gagnée ; vers Luigi : perdue) puis disparaît
      async partir(vers) {
        const p0 = g.position.clone(), p1 = new T.Vector3(...vers);
        await anim(0.55, (k) => g.position.lerpVectors(p0, p1, k), lisse);
        P.mettre(0);
        g.position.copy(p0);
      }
    };
    return P;
  };
  const TAS_MAX = 40;
  const tas = (parent, pos, ech = 1) => {
    piece();
    const m = garder(new T.InstancedMesh(pieceGeo, pieceMats, TAS_MAX));
    m.count = 0;
    m.frustumCulled = false;
    const g = new T.Group();
    g.position.set(...pos);
    g.scale.setScalar(ech);
    g.add(m);
    parent.add(g);
    const M = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), v = new T.Vector3(), s = new T.Vector3(1, 1, 1);
    const P = {
      g,
      get n() {
        return m.count;
      },
      mettre(n) {
        n = Math.max(0, Math.min(n, TAS_MAX));
        if (n === m.count) return;
        for (let i = m.count; i < n; i++) {
          v.set((hasard() - 0.5) * PIECE.r * 0.15, PIECE.ep / 2 + i * PIECE.ep, (hasard() - 0.5) * PIECE.r * 0.15);
          m.setMatrixAt(i, M.compose(v, q.setFromEuler(e.set(0, hasard() * 6, 0)), s));
        }
        m.count = n;
        m.instanceMatrix.needsUpdate = true;
      },
      async partir(vers) {
        const p0 = g.position.clone(), p1 = new T.Vector3(...vers);
        await anim(0.55, (k) => g.position.lerpVectors(p0, p1, k), lisse);
        P.mettre(0);
        g.position.copy(p0);
      }
    };
    return P;
  };
  const volerPieces = (parent, n, de, vers, arrivee) => Promise.all(Array.from({ length: n }, (_, i) => attendre(i * 70).then(() => {
    const m = piece();
    parent.add(m);
    const p0 = new T.Vector3(...de), p1 = typeof vers === "function" ? vers(i) : new T.Vector3(...vers);
    return anim(0.42, (k) => {
      m.position.lerpVectors(p0, p1, k);
      m.position.y += PIECE.cloche * Math.sin(Math.PI * k);
      m.rotation.x = k * 7;
    }).then(() => {
      m.removeFromParent();
      arrivee?.(i);
    });
  })));
  const TEINTES = { or: ["#fff3a0", "#ffc21a", "#f08a00"], bleu: ["#d6caff", "#7b62e8", "#4a33b8"], vert: ["#d8ffc8", "#5fd05a", "#249a3a"] };
  const bandeau = (parent, pos, largeur) => {
    const { x, tex } = toile(1024, 200), s = new T.Sprite(garder(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false })));
    s.position.set(...pos);
    s.renderOrder = 10;
    s.visible = false;
    parent.add(s);
    return {
      montrer(texte, teinte = "or") {
        x.clearRect(0, 0, 1024, 200);
        const gr = x.createLinearGradient(0, 40, 0, 160);
        TEINTES[teinte].forEach((c, i) => gr.addColorStop(i / 2, c));
        x.font = `900 128px ${POLICE}`;
        const w = x.measureText(texte).width;
        if (w > 960) x.font = `900 ${Math.floor(128 * 960 / w)}px ${POLICE}`;
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.lineJoin = "round";
        x.lineWidth = 30;
        x.strokeStyle = "rgba(0,0,0,.3)";
        x.strokeText(texte, 512, 110);
        x.lineWidth = 20;
        x.strokeStyle = "#fff";
        x.strokeText(texte, 512, 100);
        x.fillStyle = gr;
        x.fillText(texte, 512, 100);
        tex.needsUpdate = true;
        s.visible = true;
        return anim(0.5, (k) => s.scale.set(largeur * Math.max(0.01, k), largeur * 0.195 * Math.max(0.01, k), 1), ressort);
      },
      cacher() {
        s.visible = false;
      }
    };
  };
  const etiquette = (parent, pos, l) => {
    const { x, tex } = toile(512, 80), m = aPlat(new T.Mesh(garder(new T.PlaneGeometry(l, l * 80 / 512)), garder(new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }))));
    m.position.set(...pos);
    parent.add(m);
    return (texte, couleur = "#fff") => {
      x.clearRect(0, 0, 512, 80);
      if (texte) ecrit(x, texte, 256, 42, 50, { couleur, contour: "rgba(0,30,10,.6)", epaisseur: 10 });
      tex.needsUpdate = true;
    };
  };
  const etiquetteFlottante = (parent, pos, l) => {
    const { x, tex } = toile(512, 80), s = new T.Sprite(garder(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false })));
    s.position.set(...pos);
    s.scale.set(l, l * 80 / 512, 1);
    s.renderOrder = 9;
    parent.add(s);
    const f = (texte, couleur = "#fff") => {
      x.clearRect(0, 0, 512, 80);
      if (texte) ecrit(x, texte, 256, 42, 50, { couleur, contour: "rgba(0,30,10,.7)", epaisseur: 10 });
      tex.needsUpdate = true;
    };
    f.sprite = s;
    return f;
  };
  const STYLE = css(`
  .pcvj { position: absolute; inset: 0; font-family: var(--pcv-police, Nunito, sans-serif); color: #fff; user-select: none; -webkit-user-select: none; touch-action: none; }
  .pcvj-aide { position: absolute; left: 0; right: 0; bottom: 14u; display: flex; justify-content: center; gap: 10u; font-size: 17u; font-weight: 800; }
  .pcvj-aide span { display: flex; align-items: center; gap: 8u; padding: 5u 14u 5u 6u; border-radius: 20u; background: rgba(8,10,26,.55); cursor: pointer; }
  .pcvj-g { display: inline-grid; place-items: center; min-width: 26u; height: 26u; padding: 0 5u; border-radius: 13u; background: #5b6676; color: #fff; font-size: 14u; font-weight: 900; }
  .pcvj-bourse { position: absolute; right: 22u; bottom: 14u; display: flex; align-items: center; gap: 7u; padding: 5u 14u 5u 7u; border-radius: 20u;
    background: rgba(8,10,26,.55); font-size: 20u; font-weight: 900; font-variant-numeric: tabular-nums; }
  .pcvj-bourse i { width: 24u; height: 24u; border-radius: 50%; background: radial-gradient(circle, #ffd84a 0 56%, #e3a200 60%); box-shadow: inset 0 0 0 2u #b07800; }
  .pcvj-annonce { position: absolute; left: 50%; bottom: 60u; transform: translate(-50%, 8u); opacity: 0; padding: 9u 20u; border-radius: 16u; background: rgba(255,255,255,.95);
    color: #27313a; font-size: 19u; font-weight: 800; transition: opacity .25s, transform .25s; pointer-events: none; white-space: nowrap; }
  .pcvj-annonce.vue { opacity: 1; transform: translate(-50%, 0); }
  .pcvj-annonce b { color: #2ea43c; }
  .pcvj-bourse { transition: transform .15s; } .pcvj-bourse.monte { transform: scale(1.18); background: rgba(40,120,30,.8); }
  .pcvj-plus { position: absolute; right: 30u; bottom: 54u; font-size: 46u; font-weight: 900; color: #ffe46b; pointer-events: none;
    text-shadow: 0 3u 0 #b06a00, 0 0 12u rgba(0,0,0,.6); transform-origin: 70% 80%; opacity: 0; }
  .pcvj-vole { position: absolute; left: 0; top: 0; margin: -13u 0 0 -13u; width: 26u; height: 26u; border-radius: 50%; pointer-events: none; opacity: 0;
    background: radial-gradient(circle at 40% 35%, #fff2a0 0 18%, #ffd84a 22% 56%, #e3a200 60%); box-shadow: inset 0 0 0 2u #b07800, 0 2u 6u rgba(0,0,0,.4); }
  .pcvj-gains { position: absolute; left: 24u; top: 24u; padding: 14u 18u; border-radius: 18u; background: rgba(42,22,11,.94); box-shadow: 0 0 0 3u #d9b45a inset, 0 8u 30u rgba(0,0,0,.5);
    color: #f6efd9; font-size: 19u; font-weight: 800; display: none; } .pcvj-gains.vue { display: block; }
  .pcvj-gains h3 { margin: 0 0 8u; font-size: 20u; color: #ffd84a; }
  .pcvj-gains table { border-collapse: collapse; } .pcvj-gains td { padding: 3u 10u 3u 0; white-space: nowrap; } .pcvj-gains td:last-child { text-align: right; color: #ffe46b; font-size: 22u; }
  .pcvj-gains tr.vue td { color: #fff; background: rgba(255,216,74,.25); } .pcvj-gains p { margin: 8u 0 0; font-size: 16u; color: #d9c79a; max-width: 380u; white-space: normal; }
  .pcvj-bourse.essai::before { content: "ESSAI"; position: absolute; right: 8u; top: -20u; padding: 1u 7u; border-radius: 8u; background: #e5484d; color: #fff; font-size: 12u; letter-spacing: 1u; }
  .pcvj-vente { position: absolute; left: 50%; top: 22u; bottom: 58u; width: 660u; max-width: calc(100% - 32u); transform: translateX(-50%); display: flex; flex-direction: column;
    padding: 14u 16u; border-radius: 20u; background: rgba(42,22,11,.95); box-shadow: 0 0 0 3u #d9b45a inset, 0 10u 34u rgba(0,0,0,.55); color: #f6efd9; font-weight: 800; }
  .pcvj-vente h3 { margin: 0 0 10u; display: flex; align-items: center; gap: 10u; font-size: 22u; color: #ffd84a; }
  .pcvj-vente i { display: inline-block; width: 20u; height: 20u; border-radius: 50%; background: radial-gradient(circle, #ffd84a 0 56%, #e3a200 60%); box-shadow: inset 0 0 0 2u #b07800; }
  .pcvj-vente .l { flex: 1; overflow: hidden auto; position: relative; scrollbar-width: none; }
  .pcvj-vente .r { display: flex; align-items: center; gap: 12u; padding: 6u 10u; margin-bottom: 4u; border-radius: 12u; cursor: pointer; }
  .pcvj-vente .r.sel { background: rgba(255,216,74,.22); box-shadow: 0 0 0 2u #ffd84a inset; }
  .pcvj-vente img { width: 48u; height: 48u; object-fit: contain; flex: none; }
  .pcvj-vente span { flex: 1; min-width: 0; display: flex; flex-direction: column; } .pcvj-vente span b { font-size: 18u; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pcvj-vente small { font-size: 14u; color: #d9c79a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pcvj-vente em { font-style: normal; display: flex; align-items: center; gap: 6u; font-size: 22u; color: #ffe46b; }
  .pcvj-vente .dit { margin: 10u 0 0; min-height: 46u; padding: 8u 12u; border-radius: 12u; background: rgba(255,255,255,.95); color: #27313a; font-size: 17u; }
  .pcvj-vente .dit b { color: #2ea43c; } .pcvj-vente .dit u { text-decoration: none; color: #c0392b; } .pcvj-vente .dit small { color: #5b6676; font-size: 15u; }
  .pcvj-vente .vide { text-align: center; color: #d9c79a; }
  
  .pcvj-dit { position: absolute; left: var(--x); top: var(--y); opacity: 0; transition: opacity .2s; pointer-events: none; }
  .pcvj-dit.vue { opacity: 1; }
  .pcvj-dit i { position: absolute; left: -5u; top: -5u; width: 10u; height: 10u; border-radius: 50%; background: #1f8a3a; box-shadow: 0 0 0 2u #fff, 0 1u 3u #000; }
  .pcvj-dit u { position: absolute; left: 0; top: -1.5u; width: var(--l); height: 3u; background: #1f8a3a; transform-origin: 0 50%; transform: rotate(var(--a)); box-shadow: 0 0 2u rgba(0,0,0,.6); }
  .pcvj-dit span { position: absolute; left: var(--dx); top: var(--dy); transform: translate(-50%, -50%); padding: 4u 11u; border-radius: 13u; background: #fffaf0; color: #2b2320;
    border: 2.4u solid #1f8a3a; font-size: 15.2u; font-weight: 800; line-height: 1.15; white-space: nowrap; box-shadow: 0 2.4u 8u rgba(0,0,0,.5); }`);
  const CODES = { A: 1, B: 2, X: 3, Y: 4, LB: 5, RB: 6 };
  let racine = null, jeu = null, session = null, minuterieAnnonce = 0, finSeance = null;
  let montre = 0, roule = 0, attente = false;
  const ecrireBourse = () => {
    const e = racine?.querySelector(".pcvj-bourse span");
    if (e) e.textContent = illimite() ? "\u221E" : Math.round(montre);
  };
  const majBourse = () => {
    if (!racine) return;
    const n = pieces();
    racine.querySelector(".pcvj-bourse")?.classList.toggle("essai", illimite());
    if (!(roule || attente) || n < montre) {
      montre = n;
      roule = 0;
      attente = false;
    }
    ecrireBourse();
    jeu?.surBourse?.(Math.round(montre));
  };
  const animerBourse = (dt) => {
    if (!roule || !racine) return;
    const n = pieces();
    montre = Math.min(n, montre + roule * dt);
    if (montre >= n) {
      montre = n;
      roule = 0;
      attente = false;
      racine.querySelector(".pcvj-bourse")?.classList.remove("monte");
    }
    const r = Math.round(montre);
    if (r !== animerBourse.vu) {
      animerBourse.vu = r;
      ecrireBourse();
      jeu?.surBourse?.(r);
    }
  };
  const feter = (n, de) => {
    if (!racine || n <= 0) return;
    const b = racine.querySelector(".pcvj-bourse"), rb = racine.getBoundingClientRect(), r = b.getBoundingClientRect();
    montre = pieces();
    attente = true;
    b.classList.add("monte");
    const plus = el("div", "pcvj-plus", "+" + n);
    racine.appendChild(plus);
    let tp = 0;
    const fp = (dt) => {
      tp += dt;
      const u = tp / 2;
      if (u >= 1) {
        parImage.delete(fp);
        plus.remove();
        return;
      }
      const sc = u < 0.12 ? 0.4 + 0.6 * ressort(u / 0.12) : 1, y = u < 0.7 ? -u * 20 : -14 - (u - 0.7) * 55;
      plus.style.transform = `translateY(${y}px) scale(${sc})`;
      plus.style.opacity = u < 0.08 ? u / 0.08 : u > 0.75 ? (1 - u) / 0.25 : 1;
    };
    parImage.add(fp);
    fp(0);
    let x0 = rb.width / 2, y0 = rb.height / 2;
    try {
      if (de && A?.camera && monde) {
        const v = monde.localToWorld(new T.Vector3(...de)).project(A.camera);
        x0 = (v.x + 1) / 2 * rb.width;
        y0 = (1 - v.y) / 2 * rb.height;
      }
    } catch (e) {
    }
    const x1 = r.left - rb.left + 18, y1 = r.top - rb.top + r.height / 2;
    const k = Math.min(n, 14);
    for (let i = 0; i < k; i++) {
      const p = el("i", "pcvj-vole");
      racine.appendChild(p);
      let t = -i * 0.06;
      const dx = (hasard() - 0.5) * 60;
      const f = (dt) => {
        t += dt;
        if (t < 0) return;
        const u = Math.min(1, t / 0.55), e = u * u * (3 - 2 * u);
        p.style.transform = `translate(${lerp(x0 + dx, x1, e)}px, ${lerp(y0, y1, e) - 90 * Math.sin(Math.PI * u)}px)`;
        p.style.opacity = u < 0.05 ? u * 20 : 1;
        if (u >= 1) {
          parImage.delete(f);
          p.remove();
          if (i === 0) {
            attente = false;
            roule = Math.max(6, n / 0.9);
          }
          if (i % 3 === 0) son("piece", 0.35);
        }
      };
      parImage.add(f);
    }
  };
  const annoncer = (texte, ms = 2600) => {
    if (!racine) return;
    const a = racine.querySelector(".pcvj-annonce");
    a.innerHTML = texte;
    a.classList.add("vue");
    clearTimeout(minuterieAnnonce);
    minuterieAnnonce = setTimeout(() => a.classList.remove("vue"), ms * vitesse);
  };
  const glyphe = (g) => {
    const [t, c, h] = window.__pcvTouche?.(CODES[g]) || ["?", "#5b6676"], e = el("b", "pcvj-g");
    if (h) e.innerHTML = h;
    else e.textContent = t;
    e.style.background = c;
    return e.outerHTML;
  };
  const touches = (liste) => {
    const a = racine?.querySelector(".pcvj-aide");
    liste = [...liste, liste.length > 0 && ["LB", gainsVus ? Tr("casino.cacher_gains") : Tr("casino.gains")]];
    majGains();
    if (a) a.innerHTML = liste.filter(Boolean).map(([g, t]) => `<span data-b="${CODES[g]}">${glyphe(g)}${t}</span>`).join("");
  };
  const assurer = (n) => {
    if (pieces() >= n || pieces() > 0) return true;
    if (depanner()) {
      annoncer(Tr("casino.luigi_depanne_courage", { n: ECO.plancher }), 3200);
      son("tinte");
      return true;
    }
    proposer();
    return false;
  };
  const proposer = () => {
    if (!racine || !jeu || vente || illimite() || pieces() > 0) return;
    const k = ECO.depannagesParJour - bourse().depannages;
    if (k > 0) annoncer(Tr("casino.plus_pieces_rb", { rb: glyphe("RB"), n: ECO.plancher, k }), 4600);
    else annoncer(aBadges() ? Tr("casino.plus_depanner_vendre", { rb: glyphe("RB") }) : Tr("casino.plus_depanner"), 5200);
    son("tinte");
    jeu.majTouches?.();
  };
  const rbEntree = () => {
    if (illimite()) return null;
    const n = pieces();
    if (n >= ECO.taux) return ["RB", Tr("casino.changer_pieces_partie", { n: ECO.taux })];
    if (n === 0 && bourse().depannages < ECO.depannagesParJour) return ["RB", Tr("casino.luigi_depanne_moi")];
    return aBadges() ? ["RB", Tr("casino.vendre_badge_luigi")] : null;
  };
  let vente = null;
  const imgBadge = (img, id) => Promise.resolve(window.__pcvRessource?.("badges/" + id, "image/png")).then((u) => {
    if (u) img.src = u;
  }).catch(() => {
  });
  const aideVente = (l) => {
    const a = racine?.querySelector(".pcvj-aide");
    if (a) a.innerHTML = l.filter(Boolean).map(([g, t]) => `<span data-b="${CODES[g]}">${glyphe(g)}${t}</span>`).join("");
  };
  const ouvrirVente = async () => {
    const v = racine && el("div", "pcvj-vente", `<h3><i></i>${Tr("casino.luigi_rachete_titre")}</h3><div class="l"></div><p class="dit"></p>`);
    if (!v) return;
    vente = { l: [], i: 0, ok: false, e: v };
    racine.appendChild(v);
    son("monte", 0.6);
    geste("accueil");
    aideVente([["B", Tr("casino.fermer")]]);
    let l = [];
    try {
      l = await catalogueVente();
    } catch (e) {
      console.warn("casino-jeux : revente", e);
    }
    if (vente?.e !== v) return;
    vente.l = l;
    v.querySelector(".l").innerHTML = l.map((it, k) => `<div class="r" data-v="${k}"><img alt=""><span><b></b><small></small></span><em>${it.prix}<i></i></em></div>`).join("") || `<p class="vide">${Tr("casino.boite_vide")}</p>`;
    v.querySelectorAll(".r").forEach((r, k) => {
      const it = l[k];
      r.querySelector("b").textContent = it.nom;
      r.querySelector("small").textContent = [it.doublon ? Tr("casino.doublon_n", { n: it.n }) : Tr("casino.seul_exemplaire"), it.serie && `${it.serie.nom} ${it.serie.k}/${it.serie.n}`, it.pose && Tr("casino.colle_accueil")].filter(Boolean).join(" ");
      imgBadge(r.querySelector("img"), it.id);
      r.onclick = () => {
        if (!(vente.i === k && vente.ok)) {
          vente.i = k;
          vente.ok = false;
        }
        toucheVente(1);
      };
    });
    majVente();
  };
  const fermerVente = () => {
    vente?.e.remove();
    vente = null;
    if (jeu?.guichet) return partirDuJeu();
    jeu?.majTouches?.();
  };
  const majVente = () => {
    if (!vente) return;
    const { l, i, ok, e } = vente, it = l[i];
    e.querySelectorAll(".r").forEach((r2, k) => r2.classList.toggle("sel", k === i));
    const r = e.querySelectorAll(".r")[i], c = e.querySelector(".l");
    if (r) {
      if (r.offsetTop < c.scrollTop) c.scrollTop = r.offsetTop;
      else if (r.offsetTop + r.offsetHeight > c.scrollTop + c.clientHeight) c.scrollTop = r.offsetTop + r.offsetHeight - c.clientHeight;
    }
    const dit = e.querySelector(".dit");
    if (!it) {
      dit.textContent = Tr("casino.rien_a_vendre");
      aideVente([["B", Tr("casino.fermer")]]);
      return;
    }
    if (!ok) {
      dit.textContent = it.doublon ? Tr("casino.doublon_prends") : Tr("casino.montre_moi");
      aideVente([["A", Tr("casino.vendre_prix", { n: it.prix })], ["B", Tr("casino.fermer")]]);
      return;
    }
    dit.innerHTML = Tr("casino.je_prends_pour", { n: it.prix }) + (it.collection ? `<br><u>${Tr("casino.attention_seul_exemplaire", { k: it.serie.k, n: it.serie.n })}</u>` : "") + (it.pose ? `<br><small>${Tr("casino.decolle_accueil")}</small>` : "");
    const bs = dit.querySelectorAll("b");
    bs[0].textContent = it.nom;
    if (it.collection) bs[2].textContent = it.serie.nom;
    aideVente([["A", Tr("casino.oui_vendre")], ["B", Tr("casino.non_garder")]]);
  };
  const toucheVente = (b) => {
    if (!vente) return false;
    const n = vente.l.length;
    if (b === 2) {
      son("descend", 0.5);
      if (vente.ok) {
        vente.ok = false;
        majVente();
      } else fermerVente();
      return true;
    }
    if ([9, 10, 11, 12].includes(b) && n) {
      const d = { 9: -1, 10: 1, 11: -5, 12: 5 }[b];
      vente.i = Math.max(0, Math.min(n - 1, vente.i + d));
      vente.ok = false;
      son("touche", 0.5);
      majVente();
      return true;
    }
    if (b === 1 && n) {
      if (!vente.ok) {
        vente.ok = true;
        son("touche", 0.6);
        majVente();
        return true;
      }
      const it = vente.l[vente.i], r = vendre(it);
      fermerVente();
      if (!r) {
        son("perdu");
        return true;
      }
      feter(it.prix, null);
      recevoir(it.prix);
      son("gagne", 0.7);
      geste("triomphe");
      annoncer(Tr("casino.merci_pieces", { n: it.prix, decolle: r.decolle ? Tr("casino.decolle_suffixe") : "" }), 3600);
      return true;
    }
    return true;
  };
  let gainsVus = false;
  const majGains = () => {
    const e = racine?.querySelector(".pcvj-gains"), d = jeu?.gains?.();
    if (!e || !d) return;
    e.innerHTML = `<h3>${d.titre}</h3><table>${d.lignes.map(([t, g], i) => `<tr${i === d.vue ? ' class="vue"' : ""}><td>${t}</td><td>${g}</td></tr>`).join("")}</table>${d.note ? `<p>${d.note}</p>` : ""}`;
    e.classList.toggle("vue", gainsVus);
  };
  const toucheCommune = (b) => {
    if (b === 5) {
      gainsVus = !gainsVus;
      majGains();
      son("touche", 0.5);
      jeu?.majTouches?.();
      return true;
    }
    if (b !== 6) return false;
    if (!jeu?.libre()) return true;
    if (illimite()) {
      annoncer(Tr("casino.mode_essai_illimite_reglage"));
      son("touche", 0.5);
      return true;
    }
    const n = pieces();
    if (n < ECO.taux) {
      if (n === 0 && depanner()) {
        annoncer(Tr("casino.luigi_depanne_courage", { n: ECO.plancher }), 3200);
        son("tinte");
        jeu.majTouches?.();
      } else if (aBadges()) ouvrirVente();
      else {
        annoncer(n ? Tr("casino.il_faut_pieces_partie", { n: ECO.taux }) : Tr("casino.plus_depanner"), 3600);
        son("perdu");
      }
      return true;
    }
    const r = changer();
    annoncer(r.texte);
    son(r.ok ? "piece" : "perdu");
    majBourse();
    jeu.majTouches?.();
    return true;
  };
  const toucher = (e) => {
    if (!A?.camera || !monde || e.target.closest?.(".pcvj-aide")) return;
    const b = racine.getBoundingClientRect();
    const r = new T.Raycaster();
    r.setFromCamera(new T.Vector2((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1), A.camera);
    for (const h of r.intersectObject(monde, true)) {
      let o = h.object;
      while (o && !o.userData.clic) o = o.parent;
      if (o) {
        o.userData.clic(h);
        return;
      }
    }
  };
  const CARTES = ["nuage", "champignon", "fleur", "luigi", "mario", "etoile"];
  const FIGURES = [
    { cle: "rien", nom: "", mult: 0 },
    { cle: "paire", nom: Tr("casino.figure_paire"), mult: 2, motif: [2] },
    { cle: "double", nom: Tr("casino.figure_double_paire"), mult: 3, motif: [2, 2] },
    { cle: "brelan", nom: Tr("casino.figure_brelan"), mult: 4, motif: [3] },
    { cle: "full", nom: Tr("casino.figure_full"), mult: 6, motif: [3, 2] },
    { cle: "carre", nom: Tr("casino.figure_carre"), mult: 8, motif: [4] },
    { cle: "flush", nom: Tr("casino.figure_flush"), mult: 16, motif: [5] }
  ];
  const cote = (main) => {
    const n = new Array(6).fill(0);
    for (const c of main) n[c]++;
    const ordre = main.slice().sort((a, b) => n[b] - n[a] || b - a), f = [...new Set(ordre)].map((c) => n[c]);
    const rang = f[0] === 5 ? 6 : f[0] === 4 ? 5 : f[0] === 3 && f[1] === 2 ? 4 : f[0] === 3 ? 3 : f[0] === 2 && f[1] === 2 ? 2 : f[0] === 2 ? 1 : 0;
    return { rang, ordre, n };
  };
  const comparer = (a, b) => {
    if (a.rang !== b.rang) return a.rang - b.rang;
    if (!a.rang) return 0;
    for (let i = 0; i < 5; i++) if (a.ordre[i] !== b.ordre[i]) return a.ordre[i] - b.ordre[i];
    return 0;
  };
  const choixLuigi = (main) => {
    const { n } = cote(main);
    const garde = main.map((c) => n[c] >= 2);
    if (!garde.some(Boolean)) garde[main.indexOf(Math.max(...main))] = true;
    return garde.map((g) => !g);
  };
  const miseMin = (etoiles) => Math.min(4, 1 + Math.floor(etoiles / 5)), MISE_MAX = 5;
  const TABLE_PLUS = { entree: 5, relance: 5, relancesMax: 2, suitAvec: 3 };
  const miiSuit = (main, relance) => !relance || cote(main).rang >= TABLE_PLUS.suitAvec;
  const reglerTable = (mains, relances, echangeJoueur, tirage) => {
    const R = relances * TABLE_PLUS.relance, restent = mains.map((m, k) => k === 0 || miiSuit(m, R));
    const finales = mains.map((m, k) => {
      if (!restent[k]) return m.slice();
      const ch = k === 0 ? echangeJoueur : choixLuigi(m);
      return m.map((c, i) => ch[i] ? tirage() : c);
    });
    const pot = TABLE_PLUS.entree * mains.length + R * restent.filter(Boolean).length;
    let mieux = null, gagnants = [];
    finales.forEach((m, k) => {
      if (!restent[k]) return;
      const c = cote(m), d = mieux ? comparer(c, mieux) : 1;
      if (d > 0) {
        mieux = c;
        gagnants = [k];
      } else if (d === 0) gagnants.push(k);
    });
    return { gagnants, pot, part: Math.floor(pot / gagnants.length), restent, finales };
  };
  let forcees = [];
  const tirer = () => {
    if (!forcees.length) return Math.floor(hasard() * 6);
    const x = forcees.shift();
    return typeof x === "string" ? CARTES.indexOf(x) : x;
  };
  const SOCLE_CARTES = { echelle: 13, pos: [0, 5.05, 3.3] };
  const CARTE = { l: 0.07, h: 0.105, r: 6e-3, ep: 22e-4 }, INCLINE = 0.5, TOILE_CARTE = { l: 256, h: 384 };
  const PLANCHE_CARTES = {
    fichier: "casino-luigi/cartes/cartes.png",
    dos: [0, 0, 32, 48],
    face: [32, 0, 32, 48],
    figure: { x: 64, y: 0, t: 32 },
    icone: { x: 64, y: 32, t: 16 },
    gains: { x: 0, y: 48, l: 64, h: 16, sansMult: 48 }
  };
  let PL = null, attentePlanche = null;
  const planche = () => attentePlanche ||= Promise.resolve(window.__pcvRessource?.(PLANCHE_CARTES.fichier, "image/png")).then((u) => u && new Promise((ok) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = () => ok(null);
    im.src = u;
  })).catch(() => null).then((im) => {
    PL = im || null;
    return PL;
  });
  const pixels = (x, [sx, sy, sl, sh], X, Y, L, H) => {
    x.imageSmoothingEnabled = false;
    x.drawImage(PL, sx, sy, sl, sh, X, Y, L, H);
  };
  const toileCarte = (T_, f) => {
    const c = document.createElement("canvas");
    c.width = TOILE_CARTE.l;
    c.height = TOILE_CARTE.h;
    const t = new T_.CanvasTexture(c);
    t.colorSpace = T_.SRGBColorSpace;
    t.anisotropy = 8;
    const dessiner = () => {
      f(c.getContext("2d"));
      t.needsUpdate = true;
    };
    dessiner();
    if (!PL) planche().then((im) => {
      if (im) dessiner();
    });
    return t;
  };
  const TABLE = {
    joueur: 0.15,
    luigi: -0.18,
    pas: 0.082,
    sabot: [0, 0.11, -0.36],
    mise: [0.27, 0, 0.12],
    etoiles: [-0.33, 0, 0.1],
    plaque: [-0.33, 2e-3, -0.07],
    banque: [0, 0.04, -0.3],
    gagnees: [0.27, 0, 0.42],
    camera: [[0, 10.8, 13.8], [0, 5.6, 1.6]]
  };
  const SOCLE_TABLE = { echelle: 13, pos: [0, 5.05, 6.6] };
  const TABLE_GRANDE = {
    centre: [0, 0, -6.6 / 13],
    rayonCartes: 10.75 / 13,
    sabot: [0, 0.11, -1.2],
    mise: [-0.277, 0, 0.165],
    reserve: [-0.377, 0, 0.142],
    reserves: [8, 6, 9, 7],
    nom: [0, 2e-3, 0.15],
    nomLargeur: 0.45,
    miseJoueur: [0.364, 0, 0.18],
    echPile: 2.5,
    bulle: 1.7
  };
  const DONNE = { ramasser: 0.45, arc: 0.03, battre: 2.4, lever: 0.3, pas: 0.1, pasTable: 0.07, sansMain: 0.35, mainHaute: 0.03 };
  const PAQUET = { pos: [0.24, 0, -0.29], ep: 0.012 };
  const NOM_PAQUET = "paquet du comptoir", NOM_MAINS_DECOR = "grande table : d\xE9cor";
  const RYTHME = { decalage: 0.3, bulle: 1.1, presse: 6 };
  const CLE_CONSEIL_TABLE = "pcv-casino-conseil-table";
  const CONSEIL_TABLE = [Tr("casino.conseil_table_1"), Tr("casino.conseil_table_2")];
  const MISES = { hauteur: 0.03, largeur: 0.42, couleur: "#fff6c8", miseLuigi: [-0.25, 0, -0.3], pot: [0, 0.07, -0.05] };
  const dessinerFace = (x, n) => {
    x.fillStyle = "#fdfcf7";
    x.fillRect(0, 0, TOILE_CARTE.l, TOILE_CARTE.h);
    if (PL) {
      const F = PLANCHE_CARTES.figure, k = TOILE_CARTE.l / PLANCHE_CARTES.face[2];
      pixels(x, PLANCHE_CARTES.face, 0, 0, TOILE_CARTE.l, TOILE_CARTE.h);
      pixels(x, [F.x + CARTES.indexOf(n) * F.t, F.y, F.t, F.t], 0, (TOILE_CARTE.h - F.t * k) / 2, F.t * k, F.t * k);
      return;
    }
    x.save();
    x.scale(1, TOILE_CARTE.h / 358);
    x.fillStyle = "#e3f1dc";
    arrondi(x, 14, 14, 228, 330, 18);
    x.fill();
    x.strokeStyle = "#b9d8ad";
    x.lineWidth = 3;
    x.stroke();
    x.restore();
    symbole(x, n, 128, TOILE_CARTE.h / 2, 196);
  };
  const dessinerDos = (x) => {
    x.fillStyle = "#fdfcf7";
    x.fillRect(0, 0, TOILE_CARTE.l, TOILE_CARTE.h);
    if (PL) return pixels(x, PLANCHE_CARTES.dos, 0, 0, TOILE_CARTE.l, TOILE_CARTE.h);
    x.save();
    x.scale(1, TOILE_CARTE.h / 358);
    x.save();
    arrondi(x, 14, 14, 228, 330, 16);
    x.clip();
    x.fillStyle = "#23843a";
    x.fillRect(0, 0, 256, 358);
    x.strokeStyle = "#1c7231";
    x.lineWidth = 9;
    for (let i = -400; i < 700; i += 24) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i + 358, 358);
      x.stroke();
    }
    x.restore();
    x.strokeStyle = "rgba(255,255,255,.55)";
    x.lineWidth = 3;
    arrondi(x, 24, 24, 208, 310, 10);
    x.stroke();
    x.fillStyle = "#fff";
    x.beginPath();
    x.arc(128, 179, 46, 0, 7);
    x.fill();
    x.strokeStyle = "#1b6b2a";
    x.lineWidth = 6;
    x.stroke();
    ecrit(x, "L", 129, 184, 68, { couleur: "#2ea43c" });
    x.restore();
  };
  const poker = (table = null) => {
    const G = TABLE_GRANDE;
    const g = new T.Group();
    g.name = table ? "grande table" : "poker";
    monde.add(g);
    const paquet = table ? null : A.ancre.getObjectByName(NOM_PAQUET) || null;
    if (paquet) {
      const p0 = paquet.position.clone(), r0 = paquet.rotation.clone();
      restaurer.push(() => {
        paquet.position.copy(p0);
        paquet.rotation.copy(r0);
        paquet.visible = true;
      });
    }
    masquer(A.ancre.getObjectByName(NOM_MAINS_DECOR));
    const aLaMain = () => !!A.luigi?.main?.();
    let enMain = !paquet && aLaMain();
    if (enMain) A.luigi.cartes?.(true);
    const ramasser = async () => {
      if (enMain || !paquet?.visible || !aLaMain()) return;
      const p0 = paquet.position.clone(), r0 = paquet.rotation.y;
      await anim(DONNE.ramasser, (k) => {
        const m = A.luigi.main?.();
        if (!m) return;
        paquet.position.lerpVectors(p0, paquet.parent.worldToLocal(m), k);
        paquet.position.y += DONNE.arc * Math.sin(Math.PI * k);
        paquet.rotation.y = lerp(r0, 0, k);
      });
      paquet.visible = false;
      A.luigi.cartes?.(true);
      enMain = true;
    };
    const faces = CARTES.map((n) => {
      const t = toile(TOILE_CARTE.l, TOILE_CARTE.h);
      dessinerFace(t.x, n);
      return t.tex;
    });
    const dosT = toile(TOILE_CARTE.l, TOILE_CARTE.h);
    dessinerDos(dosT.x);
    const corps = garder(new T.ExtrudeGeometry(forme(CARTE.l, CARTE.h, CARTE.r), { depth: CARTE.ep, bevelEnabled: false, curveSegments: 6 }));
    corps.translate(0, 0, -CARTE.ep / 2);
    const faceGeo = plaque(CARTE.l, CARTE.h, CARTE.r), matCorps = matiere({ color: 15855072, roughness: 0.7 }), matDos = matiere({ map: dosT.tex, roughness: 0.55 });
    const cur = curseur(cadre(CARTE.l + 6e-3, CARTE.h + 6e-3, 4e-3));
    cur.position.z = CARTE.ep / 2 + 8e-4;
    const sabot = new T.Vector3(...table ? G.sabot : TABLE.sabot);
    const depart = (c) => {
      const m = enMain && A.luigi?.main?.();
      if (m && c.o.parent && g.worldToLocal(m.clone()).y > DONNE.mainHaute) return c.o.parent.worldToLocal(m);
      if (paquet?.visible && c.o.parent) return c.o.parent.worldToLocal(paquet.getWorldPosition(new T.Vector3()));
      return c.sabot.clone();
    };
    const fabriquer = (s, parent = g) => {
      const o = new T.Group(), pivot = new T.Group(), dedans = new T.Group();
      o.add(pivot);
      pivot.add(dedans);
      dedans.rotation.x = -Math.PI / 2;
      const face = new T.Mesh(faceGeo, matiere({ map: s == null ? null : faces[s], emissiveMap: s == null ? null : faces[s], emissive: 16777215, emissiveIntensity: 0.35, roughness: 0.5 }));
      face.position.z = CARTE.ep / 2 + 1e-4;
      const dos = new T.Mesh(faceGeo, matDos);
      dos.rotation.y = Math.PI;
      dos.position.z = -CARTE.ep / 2 - 1e-4;
      face.visible = s != null;
      dedans.add(new T.Mesh(corps, matCorps), face, dos);
      o.visible = false;
      parent.add(o);
      const c = { o, pivot, dedans, face, base: new T.Vector3(), visible: false, incline: false, leve: false, sabot: parent === g ? sabot : parent.userData.sabot };
      c.montrer = (s2) => {
        face.material.map = face.material.emissiveMap = faces[s2];
        face.material.needsUpdate = true;
        face.visible = true;
      };
      return c;
    };
    const place = (qui, i) => new T.Vector3((i - 2) * TABLE.pas, CARTE.ep / 2 + 8e-4, typeof qui === "number" ? qui : TABLE[qui]);
    const pose = (c) => {
      const p = c.base.clone();
      if (c.incline) p.y += Math.sin(INCLINE) * CARTE.h / 2;
      if (c.leve) {
        p.y += 0.028;
        p.z -= 0.035;
      }
      return { p, rx: c.incline ? INCLINE : 0, rz: c.visible ? 0 : Math.PI };
    };
    const aller = (c, s, arc = 0) => {
      const p0 = c.o.position.clone(), rx0 = c.o.rotation.x, rz0 = c.pivot.rotation.z, ry0 = c.o.rotation.y, { p, rx, rz } = pose(c);
      return anim(s, (k) => {
        c.o.position.lerpVectors(p0, p, k);
        c.o.position.y += arc * Math.sin(Math.PI * k);
        c.o.rotation.x = lerp(rx0, rx, k);
        c.pivot.rotation.z = lerp(rz0, rz, k);
        c.o.rotation.y = lerp(ry0, 0, k);
      }, sortie);
    };
    const distribuer = (c) => {
      c.o.position.copy(depart(c));
      c.o.rotation.set(0, 0.9, 0);
      c.pivot.rotation.z = Math.PI;
      c.o.visible = true;
      son("distribue", 0.8);
      return aller(c, 0.45, 0.035);
    };
    const reprendre = (c) => {
      const p0 = c.o.position.clone(), rz0 = c.pivot.rotation.z, rx0 = c.o.rotation.x;
      return anim(0.32, (k) => {
        c.o.position.lerpVectors(p0, depart(c), k);
        c.o.position.y += 0.03 * Math.sin(Math.PI * k);
        c.pivot.rotation.z = lerp(rz0, Math.PI, k);
        c.o.rotation.x = lerp(rx0, 0, k);
      }, (k) => k * k).then(() => c.o.removeFromParent());
    };
    const retourner = (c) => {
      c.visible = true;
      c.incline = c.joueur;
      son("retourne", 0.5);
      return aller(c, 0.42, 0.045);
    };
    const sauter = (c) => {
      const y = pose(c).p.y;
      return anim(0.6, (k) => {
        c.o.position.y = y + 0.02 * Math.abs(Math.sin(k * Math.PI * 2));
      }, lineaire);
    };
    const pq = toile(512, 640);
    const dessinerPlaque = (rang) => {
      const x = pq.x, gr = x.createLinearGradient(0, 0, 0, 640);
      gr.addColorStop(0, "#4a2614");
      gr.addColorStop(1, "#2a1309");
      x.fillStyle = gr;
      x.fillRect(0, 0, 512, 640);
      x.strokeStyle = "#d9b45a";
      x.lineWidth = 6;
      arrondi(x, 12, 12, 488, 616, 22);
      x.stroke();
      x.lineWidth = 2;
      arrondi(x, 26, 26, 460, 588, 14);
      x.stroke();
      FIGURES.slice(1).reverse().forEach((f, j) => {
        const y = 44 + j * 76, r = FIGURES.indexOf(f);
        if (r === rang) {
          x.fillStyle = "rgba(255,216,74,.32)";
          arrondi(x, 38, y - 4, 436, 66, 12);
          x.fill();
        }
        if (PL) {
          const R_ = PLANCHE_CARTES.gains, l = table ? R_.sansMult : R_.l, k2 = 66 / R_.h;
          pixels(x, [R_.x, R_.y + j * R_.h, l, R_.h], (512 - l * k2) / 2, y - 4, l * k2, R_.h * k2);
          return;
        }
        let k = 0;
        f.motif.forEach((m, gi) => {
          for (let i = 0; i < m; i++) {
            symbole(x, gi ? "champignon" : "etoile", 80 + k * 60, y + 29, 52);
            k++;
          }
        });
        for (; k < 5; k++) {
          x.fillStyle = "rgba(0,0,0,.38)";
          arrondi(x, 58 + k * 60, y + 7, 44, 44, 9);
          x.fill();
        }
        if (!table) ecrit(x, "\xD7" + f.mult, 456, y + 31, 46, { couleur: r === rang ? "#ffe9a0" : "#e6c56a", align: "right" });
      });
      x.fillStyle = "rgba(217,180,90,.55)";
      x.fillRect(50, 514, 412, 2);
      const I = PLANCHE_CARTES.icone;
      CARTES.slice().reverse().forEach((n, i) => PL ? pixels(x, [I.x + CARTES.indexOf(n) * I.t, I.y, I.t, I.t], 56 + i * 69, 540, 56, 56) : symbole(x, n, 84 + i * 69, 568, 56));
      pq.tex.needsUpdate = true;
    };
    dessinerPlaque(-1);
    const bord = matiere({ color: 3808270, roughness: 0.5 });
    const plaqueGains = new T.Mesh(garder(new T.BoxGeometry(0.17, 5e-3, 0.2125)), [bord, bord, matiere({ map: pq.tex, roughness: 0.35, metalness: 0.15 }), bord, bord, bord]);
    plaqueGains.position.set(...TABLE.plaque);
    plaqueGains.rotation.y = 0.14;
    g.add(plaqueGains);
    const etoileForme = new T.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 56e-4 : 0.013;
      i ? etoileForme.lineTo(Math.cos(a) * r, Math.sin(a) * r) : etoileForme.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const etoileGeo = garder(new T.ExtrudeGeometry(etoileForme, { depth: 3e-3, bevelEnabled: true, bevelThickness: 1e-3, bevelSize: 8e-4, bevelSegments: 1 }));
    const matEtoile = matiere({ color: 16765471, emissive: 4860928, roughness: 0.35, metalness: 0.25 });
    const etoiles = new T.Group();
    etoiles.position.set(...TABLE.etoiles);
    g.add(etoiles);
    const majEtoiles = (anime) => {
      const n = Math.min(15, bourse().etoiles);
      while (etoiles.children.length > n) etoiles.children[etoiles.children.length - 1].removeFromParent();
      while (etoiles.children.length < n) {
        const i = etoiles.children.length, m = aPlat(new T.Mesh(etoileGeo, matEtoile));
        m.position.set(i % 5 * 0.022, 1e-3, Math.floor(i / 5) * 0.022);
        etoiles.add(m);
        if (anime) anim(0.5, (k) => m.scale.setScalar(Math.max(0.01, k)), ressort);
      }
    };
    majEtoiles(false);
    let potE = null;
    const chiffrer = (Q) => {
      const parent = Q.g.parent, e = etiquetteFlottante(parent, Q.g.position.toArray(), MISES.largeur), mettre = Q.mettre.bind(Q), partir = Q.partir.bind(Q);
      Q.mettre = (n) => {
        mettre(n);
        e(n > 0 ? String(n) : "", MISES.couleur);
        e.sprite.position.y = Q.g.position.y + n * PIECE.ep * Q.g.scale.y + MISES.hauteur;
        majPot();
      };
      Q.partir = async (v) => {
        e("");
        await partir(v);
        majPot();
      };
      return Q;
    };
    const mise = chiffrer(table ? tas(g, G.miseJoueur, G.echPile) : pile(g, TABLE.mise));
    const miseL = table ? null : chiffrer(pile(g, MISES.miseLuigi));
    const nomL = table ? null : etiquette(g, [0, 2e-3, -0.1], 0.3), nomJ = etiquetteFlottante(g, [0, 0.1, 0.13], 0.26), ban = bandeau(g, [0, 0.19, -0.12], 0.46);
    const sieges = (table || []).map((j, k) => {
      const [dx, dz] = j.dir, s = new T.Group();
      s.name = "si\xE8ge " + (j.nom || k);
      s.position.set(G.centre[0] + dx * G.rayonCartes, 0, G.centre[2] + dz * G.rayonCartes);
      s.rotation.y = Math.atan2(-dx, -dz);
      g.add(s);
      s.updateMatrixWorld(true);
      s.userData.sabot = s.worldToLocal(g.localToWorld(sabot.clone()));
      const reserve = tas(s, G.reserve, G.echPile);
      reserve.mettre(G.reserves[k % G.reserves.length]);
      const n = s.position.clone().addScaledVector(new T.Vector3(dx, 0, dz), -G.nom[2]);
      n.y = G.nom[1];
      return { j, s, k, mise: chiffrer(tas(s, G.mise, G.echPile)), nom: etiquette(g, n.toArray(), G.nomLargeur), main: [], cs: [], dedans: true };
    });
    if (table) potE = etiquetteFlottante(g, [G.centre[0], MISES.pot[1], G.centre[2] + MISES.pot[2]], MISES.largeur * 1.8);
    function majPot() {
      if (!potE) return;
      const n = mise.n + sieges.reduce((a, x) => a + x.mise.n, 0);
      potE(n > 0 ? Tr("casino.pot_n", { n }) : "", "#ffe46b");
    }
    const P = { phase: "pret", joueur: [], luigi: [], cj: [], cl: [], choix: [], mise: 0, relances: 0, curseur: 0 };
    const majCurseur = () => {
      const c = P.cj[P.curseur];
      cur.visible = P.phase === "choix" && !!c;
      if (c && cur.parent !== c.dedans) c.dedans.add(cur);
    };
    const majFigure = () => {
      const r = cote(P.joueur).rang;
      nomJ(r ? table ? FIGURES[r].nom : `${FIGURES[r].nom}  \xD7${FIGURES[r].mult}` : "", "#ffe46b");
      dessinerPlaque(r);
    };
    const peutMiser = () => table ? P.relances < TABLE_PLUS.relancesMax && pieces() >= TABLE_PLUS.relance : P.mise < MISE_MAX && pieces() > 0;
    const majTouches = () => touches(P.phase === "choix" ? [["A", P.choix[P.curseur] ? Tr("casino.garder_carte") : Tr("casino.changer_carte")], ["X", P.choix.some(Boolean) ? Tr("casino.echanger_n_cartes", { n: P.choix.filter(Boolean).length, s: P.choix.filter(Boolean).length > 1 ? "s" : "" }) : Tr("casino.garder_main")], peutMiser() && ["Y", table ? Tr("casino.miser_plus", { n: TABLE_PLUS.relance }) : Tr("casino.miser_plus", { n: 1 })], ["B", Tr("casino.partir")]] : P.phase === "fin" ? [["A", Tr("casino.rejouer")], rbEntree(), ["B", Tr("casino.partir")]] : [["B", Tr("casino.partir")]]);
    const maj = () => {
      if (["choix", "fin", "pret"].includes(P.phase)) presse = false;
      mise.mettre(P.mise);
      miseL?.mettre(P.mise);
      majCurseur();
      majTouches();
    };
    const carteJoueur = (s, i) => {
      const c = fabriquer(s);
      c.joueur = true;
      c.base = place("joueur", i);
      c.o.userData.clic = () => {
        if (P.phase === "choix") {
          P.curseur = P.cj.indexOf(c);
          basculer(P.curseur);
        }
      };
      return c;
    };
    const carteLuigi = (i) => {
      const c = fabriquer(null);
      c.base = place("luigi", i);
      return c;
    };
    const carteMii = (x, i) => {
      const c = fabriquer(null, x.s);
      c.base = place(0, i);
      return c;
    };
    for (const x of sieges) x.mise.mettre(TABLE_PLUS.entree);
    for (const x of sieges) x.cs = Array.from({ length: 5 }, (_, i) => {
      const c = carteMii(x, i);
      c.o.position.copy(pose(c).p);
      c.pivot.rotation.z = Math.PI;
      c.o.visible = true;
      return c;
    });
    const ranger = (cs, main, qui) => {
      const { ordre } = cote(main), pris = /* @__PURE__ */ new Set();
      const idx = ordre.map((s) => {
        const i = main.findIndex((x, j) => x === s && !pris.has(j));
        pris.add(i);
        return i;
      });
      const nc = idx.map((i) => cs[i]), nm = idx.map((i) => main[i]);
      cs.splice(0, 5, ...nc);
      main.splice(0, 5, ...nm);
      return Promise.all(cs.map((c, k) => {
        c.base = place(qui, k);
        return aller(c, 0.34, 0.012);
      }));
    };
    const bulles = sieges.map((x) => {
      const b = el("div", "pcvj-dit");
      b.innerHTML = `<i></i><u></u><span></span>`;
      racine.appendChild(b);
      return b;
    });
    const placerBulle = (x) => {
      const b = bulles[x.k], p = x.j.tete?.();
      if (!p || !A.camera) return;
      const r = racine.getBoundingClientRect(), v = p.clone().project(A.camera);
      const px = (v.x + 1) / 2 * r.width, py = (1 - v.y) / 2 * r.height, l = b.querySelector("span").offsetWidth / 2 + r.height * 0.012, ecart = l + r.height * 0.07;
      let dx = (px < r.width / 2 ? -1 : 1) * ecart;
      if (px + dx - l < 0 || px + dx + l > r.width) dx = -dx;
      const dy = -r.height * 0.05;
      b.style.setProperty("--x", px + "px");
      b.style.setProperty("--y", py + "px");
      b.style.setProperty("--dx", dx + "px");
      b.style.setProperty("--dy", dy + "px");
      b.style.setProperty("--l", Math.hypot(dx, dy) + "px");
      b.style.setProperty("--a", Math.atan2(dy, dx) + "rad");
    };
    const dire = async (x, texte) => {
      const b = bulles[x.k];
      b.querySelector("span").textContent = texte;
      placerBulle(x);
      b.classList.add("vue");
      const suivre = () => placerBulle(x);
      parImage.add(suivre);
      try {
        x.j.parler?.(true);
      } catch (e) {
      }
      await attendre(RYTHME.bulle * 1e3);
      parImage.delete(suivre);
      b.classList.remove("vue");
      try {
        x.j.parler?.(false);
      } catch (e) {
      }
    };
    const tousRegardent = (x) => {
      for (const y of sieges) try {
        y.j.regarder?.(!x ? null : y === x ? A.camera?.position.clone() : x.j.tete?.());
      } catch (e) {
      }
    };
    const battre = async (vieilles) => {
      geste("cartes");
      son("melange");
      const fin = attendre((aLaMain() ? DONNE.battre : DONNE.sansMain) * 1e3);
      if (vieilles.length) {
        if (enMain) await attendre(DONNE.lever * 1e3);
        await Promise.all(vieilles.map((c, i) => attendre(i * 30).then(() => reprendre(c))));
      }
      await ramasser();
      await fin;
    };
    const redonner = async () => {
      geste("redonner");
      if (enMain) await attendre(DONNE.lever * 1e3);
    };
    const donne = async () => {
      if (P.phase !== "pret" && P.phase !== "fin") return;
      if (table) return donneTable();
      const min = miseMin(bourse().etoiles);
      if (!assurer(min)) {
        P.phase = "fin";
        maj();
        return;
      }
      P.phase = "distribue";
      ban.cacher();
      nomL("");
      nomJ("");
      dessinerPlaque(-1);
      majCurseur();
      majTouches();
      const vieilles = [...P.cj, ...P.cl];
      P.mise = Math.min(min, pieces());
      payer(P.mise);
      son("miseAuto");
      P.choix = [false, false, false, false, false];
      P.curseur = 0;
      maj();
      P.joueur = [];
      P.luigi = [];
      for (let i = 0; i < 5; i++) {
        P.joueur.push(tirer());
        P.luigi.push(tirer());
      }
      P.cj = P.joueur.map((s, i) => carteJoueur(s, i));
      P.cl = P.luigi.map((s, i) => carteLuigi(i));
      regarder([0, 0, TABLE.joueur]);
      await battre(vieilles);
      const pas = DONNE.pas * 1e3, vols = [];
      for (let i = 0; i < 5; i++) {
        vols.push(attendre(2 * i * pas).then(() => distribuer(P.cl[i])));
        vols.push(attendre((2 * i + 1) * pas).then(() => distribuer(P.cj[i])));
      }
      await Promise.all(vols);
      await Promise.all(P.cj.map((c, i) => attendre(i * 90).then(() => retourner(c))));
      if (cote(P.joueur).rang) son("forme", 0.7);
      regarder(null);
      P.phase = "choix";
      majFigure();
      maj();
      if (!P.explique) {
        P.explique = true;
        annoncer(Tr("casino.explique_pince_simple", { a: glyphe("A"), x: glyphe("X") }), 5200);
      }
    };
    const assurerTable = () => {
      const n = TABLE_PLUS.entree;
      if (pieces() >= n) return true;
      if (pieces() === 0 && depanner()) {
        annoncer(Tr("casino.luigi_depanne_courage", { n: ECO.plancher }), 3200);
        son("tinte");
        return pieces() >= n;
      }
      if (pieces() > 0) annoncer(Tr("casino.il_faut_pieces_grande_table", { n }), 3600);
      else proposer();
      son("perdu");
      return false;
    };
    const donneTable = async () => {
      if (!assurerTable()) {
        P.phase = "fin";
        maj();
        return;
      }
      P.phase = "distribue";
      ban.cacher();
      nomJ("");
      for (const x of sieges) x.nom("");
      dessinerPlaque(-1);
      majCurseur();
      majTouches();
      const vieilles = [...P.cj, ...sieges.flatMap((x) => x.cs)];
      P.mise = TABLE_PLUS.entree;
      payer(P.mise);
      P.relances = 0;
      son("miseAuto");
      P.choix = [false, false, false, false, false];
      P.curseur = 0;
      maj();
      for (const x of sieges) {
        x.mise.mettre(TABLE_PLUS.entree);
        x.dedans = true;
      }
      P.joueur = [];
      for (const x of sieges) x.main = [];
      for (let i = 0; i < 5; i++) {
        for (const x of sieges) x.main.push(tirer());
        P.joueur.push(tirer());
      }
      P.cj = P.joueur.map((s, i) => carteJoueur(s, i));
      for (const x of sieges) x.cs = x.main.map((s, i) => carteMii(x, i));
      regarder(G.centre);
      await battre(vieilles);
      const pas = DONNE.pasTable * 1e3, vols = [];
      let t = 0;
      for (let i = 0; i < 5; i++) {
        for (const x of sieges) {
          const c2 = x.cs[i];
          vols.push(attendre(t).then(() => distribuer(c2)));
          t += pas;
        }
        const c = P.cj[i];
        vols.push(attendre(t).then(() => distribuer(c)));
        t += pas;
      }
      await Promise.all(vols);
      await Promise.all(P.cj.map((c, i) => attendre(i * 90).then(() => retourner(c))));
      if (cote(P.joueur).rang) son("forme", 0.7);
      regarder(null);
      P.phase = "choix";
      majFigure();
      maj();
      if (!P.explique) {
        P.explique = true;
        annoncer(Tr("casino.explique_table", { a: glyphe("A"), x: glyphe("X"), y: glyphe("Y"), n: TABLE_PLUS.relance }), 5600);
      }
    };
    const basculer = (i) => {
      if (P.phase !== "choix") return;
      P.choix[i] = !P.choix[i];
      const c = P.cj[i];
      c.leve = P.choix[i];
      aller(c, 0.2);
      son(P.choix[i] ? "monte" : "descend");
      majTouches();
    };
    const miser = () => {
      if (P.phase !== "choix") return;
      if (table) {
        if (P.relances >= TABLE_PLUS.relancesMax) return;
        if (!payer(TABLE_PLUS.relance)) {
          annoncer(Tr("casino.plus_assez_miser"));
          son("perdu");
          return;
        }
        P.relances++;
        P.mise += TABLE_PLUS.relance;
        son("mise");
        maj();
        return;
      }
      if (P.mise >= MISE_MAX) return;
      if (!payer(1)) {
        annoncer(Tr("casino.plus_de_pieces_miser"));
        son("perdu");
        return;
      }
      P.mise++;
      son("mise");
      maj();
    };
    const regler = () => {
      const d = P.du;
      if (!d) return null;
      P.du = null;
      if (!table) modifier((x) => {
        if (d.res > 0) x.etoiles++;
        else if (d.res < 0 && x.etoiles > 0) x.etoiles--;
      });
      if (d.retour) recevoir(d.retour);
      session.pieces += d.retour - d.mise;
      P.mise = 0;
      return d;
    };
    const echanger = async () => {
      if (P.phase !== "choix") return;
      if (table) return echangerTable();
      P.phase = "tirage";
      maj();
      const a = P.choix.map((x, i) => x ? i : -1).filter((i) => i >= 0);
      const neuves = a.map(() => tirer()), l = choixLuigi(P.luigi).map((x, i) => x ? i : -1).filter((i) => i >= 0), neuvesL = l.map(() => tirer());
      {
        const mj = P.joueur.slice(), ml = P.luigi.slice();
        a.forEach((i, k) => {
          mj[i] = neuves[k];
        });
        l.forEach((i, k) => {
          ml[i] = neuvesL[k];
        });
        const cj = cote(mj), res = comparer(cj, cote(ml)), mult = res > 0 ? FIGURES[cj.rang].mult : res === 0 ? 1 : 0;
        P.du = { res, mise: P.mise, retour: P.mise * mult, mult };
      }
      if (a.length) {
        await redonner();
        son("change");
        await Promise.all(a.map((i, k) => attendre(k * 60).then(() => reprendre(P.cj[i]))));
        a.forEach((i, k) => {
          P.joueur[i] = neuves[k];
          P.cj[i] = carteJoueur(P.joueur[i], i);
        });
        await Promise.all(a.map((i, k) => attendre(k * 130).then(() => distribuer(P.cj[i]))));
        await Promise.all(a.map((i, k) => attendre(k * 90).then(() => retourner(P.cj[i]))));
      }
      P.choix = P.choix.map(() => false);
      majFigure();
      maj();
      await attendre(400);
      if (l.length) await redonner();
      son("change");
      await Promise.all(l.map((i, k) => attendre(k * 60).then(() => reprendre(P.cl[i]))));
      l.forEach((i, k) => {
        P.luigi[i] = neuvesL[k];
        P.cl[i] = carteLuigi(i);
      });
      await Promise.all(l.map((i, k) => attendre(k * 130).then(() => distribuer(P.cl[i]))));
      await attendre(500);
      await reveler();
    };
    const remplacer = async (cs, main, a, neuves, fab, montrer) => {
      if (!a.length) return;
      son("change");
      await Promise.all(a.map((i, k) => attendre(k * 60).then(() => reprendre(cs[i]))));
      a.forEach((i, k) => {
        main[i] = neuves[k];
        cs[i] = fab(main[i], i);
      });
      await Promise.all(a.map((i, k) => attendre(k * 130).then(() => distribuer(cs[i]))));
      if (montrer) await Promise.all(a.map((i, k) => attendre(k * 90).then(() => retourner(cs[i]))));
    };
    const echangerTable = async () => {
      P.phase = "tirage";
      maj();
      const R = P.relances * TABLE_PLUS.relance, r = reglerTable([P.joueur.slice(), ...sieges.map((x) => x.main.slice())], P.relances, P.choix.slice(), tirer);
      const gagne = r.gagnants.includes(0);
      P.du = { res: gagne ? r.gagnants.length > 1 ? 0 : 1 : -1, mise: P.mise, retour: gagne ? r.part : 0, r };
      const a = P.choix.map((x, i) => x ? i : -1).filter((i) => i >= 0);
      await redonner();
      await remplacer(P.cj, P.joueur, a, a.map((i) => r.finales[0][i]), carteJoueur, true);
      P.choix = P.choix.map(() => false);
      majFigure();
      maj();
      await Promise.all(sieges.map((x, j) => attendre(j * RYTHME.decalage * 1e3).then(async () => {
        const k = x.k + 1;
        if (!r.restent[k]) {
          x.dedans = false;
          const fin2 = dire(x, Tr("casino.je_me_couche"));
          son("descend", 0.6);
          await Promise.all(x.cs.map((c, i) => attendre(i * 50).then(() => reprendre(c))));
          x.cs = [];
          await fin2;
          return;
        }
        if (R) {
          x.mise.mettre(TABLE_PLUS.entree + R);
          son("mise");
        }
        const ch = choixLuigi(x.main), b = ch.map((v, i) => v ? i : -1).filter((i) => i >= 0), n = b.length;
        const fin = dire(x, (R ? Tr("casino.je_suis") : "") + (n ? Tr("casino.n_cartes", { n, s: n > 1 ? "s" : "" }) : Tr("casino.je_garde_tout")));
        await remplacer(x.cs, x.main, b, b.map((i) => r.finales[k][i]), (s, i) => carteMii(x, i), false);
        await fin;
      })));
      await revelerTable();
    };
    const reveler = async () => {
      P.cl.forEach((c, i) => c.montrer(P.luigi[i]));
      son("revele");
      await Promise.all(P.cl.map((c, i) => attendre(i * 80).then(() => retourner(c))));
      await attendre(300);
      son("trie");
      await Promise.all([ranger(P.cj, P.joueur, "joueur"), ranger(P.cl, P.luigi, "luigi")]);
      const cj = cote(P.joueur), cl = cote(P.luigi), res = comparer(cj, cl);
      nomL(FIGURES[cl.rang].nom || Tr("casino.rien"));
      nomJ(FIGURES[cj.rang].nom ? `${FIGURES[cj.rang].nom}  \xD7${FIGURES[cj.rang].mult}` : Tr("casino.rien"), "#ffe46b");
      const marquer = (cs, c, gagne) => cs.forEach((x, i) => {
        const groupe = gagne && c.rang && c.n[c.ordre[i]] >= 2;
        if (groupe) sauter(x);
        else {
          x.face.material.color.setScalar(0.55);
          x.face.material.emissiveIntensity = 0.1;
        }
      });
      marquer(P.cj, cj, res > 0 || cj.rang && res === 0);
      marquer(P.cl, cl, res < 0 || cl.rang && res === 0);
      await attendre(350);
      const d = P.du || { res, mise: P.mise, retour: 0, mult: 0 };
      if (d.res > 0) {
        P.dernier = cj.rang;
        dessinerPlaque(cj.rang);
        ban.montrer(Tr("casino.gagne_plus", { n: d.retour }), "or");
        son("gagne");
        geste("battu");
        const n0 = 2 * d.mise;
        await miseL.partir(TABLE.mise);
        mise.mettre(n0);
        await volerPieces(g, Math.min(d.retour - n0, 20), TABLE.banque, (i) => new T.Vector3(TABLE.mise[0], PIECE.ep * (n0 + i + 1), TABLE.mise[2]), (i) => mise.mettre(n0 + i + 1));
        son("piece");
        await mise.partir(TABLE.gagnees);
        feter(d.retour, TABLE.gagnees);
        regler();
        majEtoiles(true);
      } else if (d.res < 0) {
        regler();
        majEtoiles(false);
        ban.montrer(d.mise > 1 ? Tr("casino.dommage_moins", { n: d.mise }) : Tr("casino.dommage"), "bleu");
        son("rate");
        geste(cj.rang === cl.rang ? "presque" : "triomphe");
        const banque = TABLE.banque.map((v, i) => i === 1 ? 0 : v);
        await Promise.all([mise.partir(banque), miseL.partir(banque)]);
      } else {
        ban.montrer(Tr("casino.egalite_mise_rendue"), "vert");
        son("egalite");
        geste("noeud");
        await Promise.all([mise.partir(TABLE.gagnees), miseL.partir(TABLE.banque.map((v, i) => i === 1 ? 0 : v))]);
        feter(d.retour, TABLE.gagnees);
        regler();
      }
      P.mise = 0;
      P.phase = "fin";
      maj();
    };
    const revelerTable = async () => {
      const d = P.du, r = d.r, dedans = sieges.filter((x) => x.dedans);
      for (const x of dedans) x.cs.forEach((c, i) => c.montrer(x.main[i]));
      son("revele");
      await Promise.all(dedans.flatMap((x, j) => x.cs.map((c, i) => attendre(j * 80 + i * 40).then(() => retourner(c)))));
      await attendre(150);
      son("trie");
      await Promise.all([ranger(P.cj, P.joueur, "joueur"), ...dedans.map((x) => ranger(x.cs, x.main, 0))]);
      const cj = cote(P.joueur);
      nomJ(FIGURES[cj.rang].nom || Tr("casino.rien"), "#ffe46b");
      for (const x of sieges) x.nom(x.dedans ? FIGURES[cote(x.main).rang].nom || Tr("casino.rien") : Tr("casino.couche"), x.dedans ? "#fff" : "#c9c2b0");
      const marquer = (cs, main, gagne) => {
        const c = cote(main);
        cs.forEach((x, i) => {
          const groupe = gagne && c.rang && c.n[c.ordre[i]] >= 2;
          if (groupe) sauter(x);
          else if (!gagne) {
            x.face.material.color.setScalar(0.55);
            x.face.material.emissiveIntensity = 0.1;
          }
        });
      };
      marquer(P.cj, P.joueur, r.gagnants.includes(0));
      for (const x of dedans) marquer(x.cs, x.main, r.gagnants.includes(x.k + 1));
      await attendre(350);
      const gagnants = r.gagnants.filter((k) => k > 0).map((k) => sieges[k - 1]);
      const vers = d.retour ? g.localToWorld(new T.Vector3(...G.miseJoueur)) : gagnants[0].s.localToWorld(new T.Vector3(...G.mise));
      const versDe = (tas_) => tas_.g.parent.worldToLocal(vers.clone()).toArray();
      for (const x of sieges) try {
        x.j.reagir?.(r.gagnants.includes(x.k + 1) ? "gagne" : "perd");
      } catch (e) {
      }
      if (d.res > 0) {
        P.dernier = cj.rang;
        dessinerPlaque(cj.rang);
        ban.montrer(Tr("casino.gagne_plus", { n: d.retour }), "or");
        son("gagne");
        geste("gagne");
      } else if (d.res === 0) {
        ban.montrer(Tr("casino.pot_partage_plus", { n: d.retour }), "vert");
        son("egalite");
        geste("noeud");
      } else {
        ban.montrer(gagnants.length > 1 ? Tr("casino.pot_partage_mii") : Tr("casino.ramasse_pot", { nom: gagnants[0].j.nom }), "bleu");
        son("rate");
        geste("noeud");
      }
      await Promise.all(sieges.map((x) => x.mise.partir(versDe(x.mise))));
      if (d.res >= 0) {
        son("piece");
        await mise.partir(G.miseJoueur.map((v, i) => i === 2 ? v + 0.12 : v));
        feter(d.retour, G.miseJoueur);
      } else await mise.partir(versDe(mise));
      regler();
      P.mise = 0;
      P.phase = "fin";
      maj();
    };
    cadrer(...cadrage(table ? "table" : "cartes", A.ancre), 1.2);
    maj();
    const touche2 = (b) => {
      if ((b === 1 || b === 2) && !["choix", "fin", "pret"].includes(P.phase)) {
        presse = true;
        return true;
      }
      if (P.phase === "choix") {
        if (b === 11 || b === 12) {
          P.curseur = Math.max(0, Math.min(4, P.curseur + (b === 11 ? -1 : 1)));
          son("touche", 0.5);
          majCurseur();
          majTouches();
          return true;
        }
        if (b === 1) {
          basculer(P.curseur);
          return true;
        }
        if (b === 3) {
          echanger();
          return true;
        }
        if (b === 4 || b === 9) {
          miser();
          return true;
        }
      }
      if (P.phase === "fin" && (b === 1 || b === 3)) {
        donne();
        return true;
      }
      return b !== 2;
    };
    const rendre = () => {
      if (P.du) regler();
      else if (P.mise && (P.phase === "choix" || P.phase === "distribue")) {
        recevoir(P.mise);
        P.mise = 0;
      }
    };
    const gains = () => table ? {
      titre: Tr("casino.grande_table_regle"),
      vue: -1,
      lignes: [[Tr("casino.pour_entrer"), Tr("casino.n_pieces", { n: TABLE_PLUS.entree })], [Tr("casino.miser_plus_y"), Tr("casino.plus_n_fois_max", { n: TABLE_PLUS.relance, max: TABLE_PLUS.relancesMax })], [Tr("casino.meilleure_main"), Tr("casino.ramasse_le_pot")], [Tr("casino.egalite"), Tr("casino.pot_partage_minuscule")]],
      note: Tr("casino.conseil_luigi_note", { conseil: CONSEIL_TABLE.map((t) => t.replace(/\*/g, "")).join(" ") })
    } : {
      titre: Tr("casino.poker_images_gains"),
      vue: P.phase === "fin" && P.dernier ? 6 - P.dernier : -1,
      lignes: FIGURES.slice(1).reverse().map((f) => [f.nom === Tr("casino.figure_flush") ? Tr("casino.flush_5_pareilles") : f.nom, Tr("casino.mise_x", { n: f.mult })]),
      note: Tr("casino.poker_note", { mise: P.mise || miseMin(bourse().etoiles), gain: 2 * (P.mise || miseMin(bourse().etoiles)) })
    };
    const conseil = table && !lire(CLE_CONSEIL_TABLE, false) && A.dialogue ? (ecrire(CLE_CONSEIL_TABLE, true), Promise.resolve(A.dialogue(CONSEIL_TABLE)).catch(() => {
    })) : null;
    const demarrer = async () => {
      if (conseil) await conseil;
      return donne();
    };
    return { touche: touche2, libre: () => ["fin", "pret", "choix"].includes(P.phase), demarrer, majTouches, P, echanger, basculer, miser, rendre, gains, sieges };
  };
  const ROULEAU = ["superetoile", "oeuf", "plume", "fleur", "oeuf", "champignon", "plume", "oeuf", "etoile", "oeuf", "fleur", "plume", "champignon", "oeuf", "etoile"];
  const ROULEAU2 = ["superetoile", "oeuf", "plume", "fleur", "oeuf", "champignon", "superetoile", "oeuf", "etoile", "oeuf", "fleur", "plume", "champignon", "oeuf", "etoile"];
  const ROULEAUX = [ROULEAU2, ROULEAU2, ROULEAU];
  const TRIPLE = { superetoile: 20, etoile: 15, fleur: 10, champignon: 10, plume: 5, oeuf: 5 };
  const paieMachine = (t) => {
    const s = t.filter((x) => x === "superetoile").length, a = t.filter((x) => x !== "superetoile");
    if (s === 3) return { mult: 20, cle: "superetoile" };
    if (s === 2) return { mult: 4, cle: "s2" };
    if (s === 1) return a[0] === a[1] ? { mult: TRIPLE[a[0]], cle: a[0] } : { mult: 2, cle: "s1" };
    return t[0] === t[1] && t[1] === t[2] ? { mult: TRIPLE[t[0]], cle: t[0] } : { mult: 0 };
  };
  const CASES_MACHINE = [["superetoile", 3, 20], ["plume", 3, 5], ["etoile", 3, 15], ["oeuf", 3, 5], ["fleur", 3, 10], ["s2", 2, 4], ["champignon", 3, 10], ["s1", 1, 2]];
  const MACH_CASINO = {
    R: 1.1,
    large: 1.12,
    y: 8.6,
    face: 2.13,
    afficheur: [0, 10.55],
    plaque: [0, 6.35],
    bouton: [1.5, 5.4, 2.95],
    camera: [[0, 9.2, 12.6], [0, 7.9, 1.5]]
  };
  const machine = () => {
    const MACH = { ...MACH_CASINO, ...A.ancre.userData.gabarit };
    const g = new T.Group();
    g.name = "machine \xE0 sous";
    monde.add(g);
    const anciens = A.ancre.userData.rouleaux || [];
    if (anciens.length < 3) throw new Error("casino-jeux : rouleaux de la machine introuvables");
    const N = ROULEAU.length, PAS = 2 * Math.PI / N, RR = MACH.R;
    const tuiles = Object.fromEntries(Object.keys(TRIPLE).map((n) => {
      const t = toile(256, 106), gr = t.x.createLinearGradient(0, 0, 0, 106);
      gr.addColorStop(0, "#efe7d2");
      gr.addColorStop(0.5, "#fffaf0");
      gr.addColorStop(1, "#efe7d2");
      t.x.fillStyle = gr;
      t.x.fillRect(0, 0, 256, 106);
      symbole(t.x, n, 128, 53, 96);
      t.x.fillStyle = "rgba(0,0,0,.07)";
      t.x.fillRect(0, 0, 256, 2);
      return [n, garder(new T.MeshBasicMaterial({ map: t.tex }))];
    }));
    const tuileGeo = garder(new T.PlaneGeometry(MACH.large, 2 * RR * Math.sin(PAS / 2) * 1.02));
    const rouleaux = anciens.slice(0, 3).map((a, i) => {
      masquer(a.mesh);
      const r = new T.Group();
      r.position.copy(a.mesh.position);
      ROULEAUX[i].forEach((n, k) => {
        const m = new T.Mesh(tuileGeo, tuiles[n]), b = k * PAS;
        m.position.set(0, RR * Math.sin(b), RR * Math.cos(b));
        m.rotation.x = -b;
        r.add(m);
      });
      r.userData.clic = () => arreter(i);
      g.add(r);
      return r;
    });
    const xs = rouleaux.map((r) => r.position.x), zAvant = rouleaux[0].position.z + RR;
    const matLigne = garder(new T.MeshBasicMaterial({ color: 14165547 }));
    const ligne = new T.Mesh(garder(new T.BoxGeometry(xs[2] - xs[0] + MACH.large + 0.2, 0.05, 0.03)), matLigne);
    ligne.position.set((xs[0] + xs[2]) / 2, MACH.y, zAvant + 0.04);
    g.add(ligne);
    const af = toile(1024, 256), afficheur = new T.Mesh(plaque(4, 1, 0.08), garder(new T.MeshBasicMaterial({ map: af.tex })));
    afficheur.position.set(...MACH.afficheur, MACH.face);
    g.add(afficheur);
    const M = { phase: "pret", prochain: 0, gain: 0, clignote: 0 };
    const dessinerAfficheur = () => {
      const x = af.x;
      x.fillStyle = "#120806";
      x.fillRect(0, 0, 1024, 256);
      x.shadowColor = "#ffae22";
      x.shadowBlur = 20;
      const allume = !M.gain || Math.floor(M.clignote * 3) % 2 === 0;
      ecrit(x, Tr("casino.pieces_majuscule"), 60, 74, 48, { couleur: "#b97a1a", align: "left" });
      ecrit(x, illimite() ? "\u221E" : String(M.pieces ?? pieces()).padStart(4, "0"), 60, 168, 104, { couleur: "#ffb73a", align: "left" });
      ecrit(x, Tr("casino.gain_majuscule"), 964, 74, 48, { couleur: "#b97a1a", align: "right" });
      if (allume) ecrit(x, M.gain ? "+ " + M.gain : "0", 964, 168, 104, { couleur: M.gain ? "#ffe46b" : "#7a4a10", align: "right" });
      x.shadowBlur = 0;
      af.tex.needsUpdate = true;
    };
    const pt = toile(1024, 340), plaqueGains = new T.Mesh(plaque(4, 4 * 340 / 1024, 0.08), matiere({ map: pt.tex, roughness: 0.45 }));
    plaqueGains.position.set(...MACH.plaque, MACH.face);
    g.add(plaqueGains);
    const dessinerPlaque = (cle) => {
      const x = pt.x;
      x.fillStyle = "#2a160b";
      x.fillRect(0, 0, 1024, 340);
      CASES_MACHINE.forEach(([n, k, mult], i) => {
        const X = 20 + i % 2 * 497, Y = 18 + Math.floor(i / 2) * 78, vue = n === cle, sup = n.startsWith("s");
        x.fillStyle = vue ? "#ffe46b" : "#f6efd9";
        arrondi(x, X, Y, 487, 68, 12);
        x.fill();
        for (let j = 0; j < 3; j++) {
          if (j < k) symbole(x, sup ? "superetoile" : n, X + 44 + j * 66, Y + 34, 56);
          else {
            x.fillStyle = "rgba(35,96,46,.16)";
            arrondi(x, X + 17 + j * 66, Y + 8, 54, 54, 8);
            x.fill();
          }
        }
        ecrit(x, "\xD7" + mult, X + 466, Y + 36, 46, { couleur: "#23602e", align: "right" });
      });
      pt.tex.needsUpdate = true;
    };
    dessinerAfficheur();
    dessinerPlaque(null);
    const bouton = new T.Mesh(garder(new T.CylinderGeometry(0.42, 0.48, 0.3, 40)), matiere({ color: 15214379, roughness: 0.25, emissive: 3801088 }));
    bouton.position.set(...MACH.bouton);
    bouton.position.y += 0.15;
    bouton.userData.clic = () => action();
    g.add(bouton);
    const yBouton = bouton.position.y, appuyer = () => anim(0.22, (k) => {
      bouton.position.y = yBouton - 0.12 * Math.sin(Math.PI * k);
    }, lineaire);
    const ban = bandeau(g, [0, MACH.y + 1.25, zAvant + 0.8], 3.4);
    const cur = curseur(cadre(MACH.large, 1.5, 0.06));
    g.add(cur);
    const R = rouleaux.map((r, i) => ({ phi: i * 5 % N * PAS, v: 0, arret: false, fini: true }));
    parImage.add((dt) => {
      R.forEach((x, i) => {
        if (!x.fini && !x.arret) x.phi += x.v * dt;
        rouleaux[i].rotation.x = x.phi;
      });
      if (M.gain) {
        M.clignote += dt;
        dessinerAfficheur();
      }
    });
    const lancer = () => {
      if (M.phase !== "pret" && M.phase !== "fin") return;
      if (!assurer(1)) return;
      payer(1);
      son("mise");
      session.pieces -= 1;
      appuyer();
      M.gain = 0;
      ban.cacher();
      matLigne.color.set(14165547);
      dessinerPlaque(null);
      dessinerAfficheur();
      R.forEach((x, i) => {
        x.v = 5.2 + i * 0.4;
        x.fini = false;
        x.arret = false;
      });
      M.phase = "tourne";
      M.prochain = 0;
      regarder([0, MACH.y, zAvant]);
      maj();
    };
    const arreter = (i) => {
      const x = R[i];
      if (M.phase !== "tourne" || x.fini || x.arret) return;
      const f = forcees.shift(), devant = Math.round(x.phi / PAS);
      let a = (devant + 2 + Math.floor(hasard() * 3)) * PAS;
      if (f) {
        const B = ROULEAUX[i];
        let k = devant + 2;
        while (B[(k % N + N) % N] !== f && k < devant + 2 + N) k++;
        a = k * PAS;
      }
      x.arret = true;
      son("touche", 0.6);
      appuyer();
      const de = x.phi;
      anim(0.35 + (a - de) / 3, (k) => {
        x.phi = lerp(de, a, k);
      }, (k) => ressort(k) * 0.3 + sortie(k) * 0.7).then(() => {
        x.phi = a % (2 * Math.PI);
        x.fini = true;
        x.arret = false;
        son("descend", 0.8);
        apresArret();
      });
      while (M.prochain < 3 && (R[M.prochain].arret || R[M.prochain].fini)) M.prochain++;
      maj();
    };
    const apresArret = () => {
      if (R.some((x) => !x.fini)) return;
      const t = R.map((x, i) => ROULEAUX[i][(Math.round(x.phi / PAS) % N + N) % N]), p = paieMachine(t);
      if (p.mult) {
        feter(p.mult, [0, MACH.y, zAvant]);
        recevoir(p.mult);
        session.pieces += p.mult;
        M.gain = p.mult;
        M.clignote = 0;
        M.cle = p.cle;
        son("gagne");
        matLigne.color.set(16765471);
        dessinerPlaque(p.cle);
        ban.montrer(Tr("casino.gagne_plus", { n: p.mult }), "or");
        geste(p.mult >= 10 ? "bravo" : "gagne");
      } else {
        son("rate", 0.6);
        if (hasard() < 0.3) geste("rate");
      }
      dessinerAfficheur();
      regarder(null);
      M.phase = "fin";
      maj();
    };
    const maj = () => {
      cur.visible = M.phase === "tourne" && M.prochain < 3;
      if (cur.visible) cur.position.set(xs[M.prochain], MACH.y, zAvant + 0.06);
      touches(M.phase === "tourne" ? [["A", Tr("casino.arreter_rouleau")]] : [["A", Tr("casino.jouer_1_piece")], rbEntree(), ["B", Tr("casino.partir")]]);
    };
    const action = () => M.phase === "tourne" ? arreter(M.prochain) : lancer();
    cadrer(...cadrage("machines", A.ancre), 1.1);
    maj();
    const touche2 = (b) => {
      if (b === 1 || b === 3) {
        action();
        return true;
      }
      if (M.phase === "tourne" && (b === 11 || b === 12)) {
        const libres = [0, 1, 2].filter((k) => !R[k].fini && !R[k].arret);
        if (libres.length) {
          const j = libres.indexOf(M.prochain), d = b === 11 ? -1 : 1;
          M.prochain = libres[((j < 0 ? 0 : j + d) + libres.length) % libres.length];
          maj();
        }
        return true;
      }
      return b !== 2 || M.phase === "tourne";
    };
    const NOMS_M = { superetoile: Tr("casino.sym_super_etoiles"), etoile: Tr("casino.sym_etoiles"), fleur: Tr("casino.sym_fleurs"), champignon: Tr("casino.sym_champignons"), plume: Tr("casino.sym_plumes"), oeuf: Tr("casino.sym_oeufs") };
    const gains = () => ({
      titre: Tr("casino.machine_a_sous_gains"),
      vue: M.phase === "fin" && M.gain ? CASES_MACHINE.findIndex(([n]) => n === M.cle) : -1,
      lignes: CASES_MACHINE.map(([n, k, mult]) => [k === 3 ? Tr("casino.n3_symboles", { nom: NOMS_M[n] }) : k === 2 ? Tr("casino.deux_super_etoiles") : Tr("casino.une_super_etoile"), `+${mult}`]),
      note: Tr("casino.super_etoile_note")
    });
    const rendre = () => {
      if (M.phase === "tourne") {
        recevoir(1);
        session.pieces += 1;
        M.phase = "fin";
      }
    };
    return { touche: touche2, libre: () => M.phase !== "tourne", lancer, arreter, majTouches: maj, surBourse: (n) => {
      M.pieces = n;
      dessinerAfficheur();
    }, M, R, gains, rendre };
  };
  const CARTE_R = [["etoile", "mario", "luigi"], ["fleur", "champignon", "nuage"]];
  const caseDe = (c, r) => ({ sym: CARTE_R[c % 2][r], coul: c < 2 ? "r" : "n" });
  const ROUE = [
    ["etoile", "r"],
    ["champignon", "n"],
    ["luigi", "r"],
    ["nuage", "n"],
    ["fleur", "r"],
    ["mario", "n"],
    ["champignon", "r"],
    ["etoile", "n"],
    ["nuage", "r"],
    ["luigi", "n"],
    ["mario", "r"],
    ["fleur", "n"]
  ];
  const MISE_TABLE = 5;
  const GRILLE = { gauche: -0.7, fond: -1.5, col: 1.6, rang: 1.38, couleurZ: -2.2, camera: [[-0.6, 13.6, 12.4], [-0.4, 4.9, 0.2]] };
  const roulette = () => {
    const g = new T.Group();
    g.name = "roulette";
    monde.add(g);
    const roue = A.ancre.getObjectByName("roue"), tapisSalle = A.ancre.getObjectByName("tapis de mise");
    if (!roue || !tapisSalle) throw new Error("casino-jeux : roue ou tapis de mise introuvables");
    Object.assign(PIECE, { r: 0.2, ep: 0.05, cloche: 1.3 });
    const C = roue.position.clone(), RAYON = roue.geometry?.parameters?.radiusTop ?? 2.6, DESSUS = C.y + (roue.geometry?.parameters?.height ?? 0.5) / 2;
    const PASR = 2 * Math.PI / 12, R_PISTE = RAYON * 0.93, R_CASE = RAYON * 0.7, R_BILLE = 0.14, Y_TAPIS = tapisSalle.position.y + 6e-3;
    const rt = toile(1024, 1024), x = rt.x, O = 512, RP = 512;
    x.fillStyle = "#5a2e14";
    x.fillRect(0, 0, 1024, 1024);
    x.fillStyle = "#2c160b";
    x.beginPath();
    x.arc(O, O, RP, 0, 7);
    x.fill();
    ROUE.forEach(([s, c], i) => {
      const th = -i * PASR;
      x.beginPath();
      x.arc(O, O, RP * 0.86, th - PASR / 2, th + PASR / 2);
      x.arc(O, O, RP * 0.52, th + PASR / 2, th - PASR / 2, true);
      x.closePath();
      x.fillStyle = c === "r" ? "#c8202a" : "#1b1b20";
      x.fill();
      const X = O + Math.cos(th) * RP * 0.69, Y = O + Math.sin(th) * RP * 0.69;
      x.fillStyle = "#fff";
      x.beginPath();
      x.arc(X, Y, RP * 0.115, 0, 7);
      x.fill();
      x.save();
      x.translate(X, Y);
      x.rotate(th + Math.PI / 2);
      symbole(x, s, 0, 0, RP * 0.19);
      x.restore();
    });
    x.strokeStyle = "#e7b54a";
    x.lineWidth = 6;
    for (const r of [0.52, 0.86]) {
      x.beginPath();
      x.arc(O, O, RP * r, 0, 7);
      x.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const th = -i * PASR + PASR / 2;
      x.beginPath();
      x.moveTo(O + Math.cos(th) * RP * 0.52, O + Math.sin(th) * RP * 0.52);
      x.lineTo(O + Math.cos(th) * RP * 0.86, O + Math.sin(th) * RP * 0.86);
      x.stroke();
    }
    x.fillStyle = "#1f7a3f";
    x.beginPath();
    x.arc(O, O, RP * 0.5, 0, 7);
    x.fill();
    rt.tex.needsUpdate = true;
    const dessus = aPlat(new T.Mesh(garder(new T.CircleGeometry(RAYON * 0.998, 96)), matiere({ map: rt.tex, roughness: 0.3 })));
    dessus.position.y = DESSUS - C.y + 4e-3;
    poserSur(roue, dessus);
    const bille = new T.Mesh(garder(new T.SphereGeometry(R_BILLE, 20, 14)), matiere({ color: 16777215, roughness: 0.15 }));
    g.add(bille);
    roue.userData.clic = () => lancer();
    const q = tapisSalle.geometry?.parameters || { width: 12, height: 5.6 }, L = q.width, H = q.height, PX = 200;
    const tp = toile(L * PX, H * PX), px = (v) => (v + L / 2) * PX, pz = (v) => (v + H / 2) * PX;
    (() => {
      const x2 = tp.x;
      x2.fillStyle = "#0f6a33";
      x2.fillRect(0, 0, L * PX, H * PX);
      x2.strokeStyle = "rgba(255,255,255,.16)";
      x2.lineWidth = 6;
      arrondi(x2, 20, 20, L * PX - 40, H * PX - 40, 40);
      x2.stroke();
      for (const [c0, f] of [[0, "#c8202a"], [2, "#1b1b20"]]) {
        const X = px(GRILLE.gauche + (c0 + 1) * GRILLE.col), Z = pz(GRILLE.couleurZ);
        x2.beginPath();
        x2.moveTo(X - 270, Z);
        x2.lineTo(X, Z - 88);
        x2.lineTo(X + 270, Z);
        x2.lineTo(X, Z + 88);
        x2.closePath();
        x2.fillStyle = f;
        x2.fill();
        x2.strokeStyle = "#f2e27a";
        x2.lineWidth = 7;
        x2.stroke();
      }
      for (let c = 0; c < 4; c++) for (let r = 0; r < 3; r++) {
        const k = caseDe(c, r), X = px(GRILLE.gauche + (c + 0.5) * GRILLE.col), Z = pz(GRILLE.fond + (r + 0.5) * GRILLE.rang);
        x2.fillStyle = "rgba(0,0,0,.25)";
        x2.beginPath();
        x2.arc(X, Z + 8, 104, 0, 7);
        x2.fill();
        x2.fillStyle = k.coul === "r" ? "#c8202a" : "#1b1b20";
        x2.beginPath();
        x2.arc(X, Z, 104, 0, 7);
        x2.fill();
        symbole(x2, k.sym, X, Z, 158);
      }
      x2.strokeStyle = "#f2e27a";
      x2.lineWidth = 6;
      for (let c = 0; c <= 4; c++) {
        x2.beginPath();
        x2.moveTo(px(GRILLE.gauche + c * GRILLE.col), pz(GRILLE.fond));
        x2.lineTo(px(GRILLE.gauche + c * GRILLE.col), pz(GRILLE.fond + 3 * GRILLE.rang));
        x2.stroke();
      }
      for (let r = 0; r <= 3; r++) {
        x2.beginPath();
        x2.moveTo(px(GRILLE.gauche), pz(GRILLE.fond + r * GRILLE.rang));
        x2.lineTo(px(GRILLE.gauche + 4 * GRILLE.col), pz(GRILLE.fond + r * GRILLE.rang));
        x2.stroke();
      }
      x2.lineWidth = 10;
      x2.strokeRect(px(GRILLE.gauche), pz(GRILLE.fond), 4 * GRILLE.col * PX, 3 * GRILLE.rang * PX);
      tp.tex.needsUpdate = true;
    })();
    masquer(tapisSalle);
    const tapis = aPlat(new T.Mesh(garder(new T.PlaneGeometry(L, H)), matiere({ map: tp.tex, roughness: 0.95 })));
    tapis.position.copy(tapisSalle.position);
    tapis.position.y += 2e-3;
    g.add(tapis);
    tapis.userData.clic = (h) => {
      const p = tapis.worldToLocal(h.point.clone()), mx = p.x + tapis.position.x, mz = -p.y + tapis.position.z;
      if (mz < GRILLE.fond) {
        RO.y = -1;
        RO.x = mx < GRILLE.gauche + 2 * GRILLE.col ? 1 : 5;
      } else {
        const tr = (v, n) => {
          const i = Math.max(0, Math.min(n - 1, Math.floor(v))), f = v - i;
          return f < 0.22 && i > 0 ? 2 * i - 1 : f > 0.78 && i < n - 1 ? 2 * i + 1 : 2 * i;
        };
        RO.x = tr((mx - GRILLE.gauche) / GRILLE.col, 4);
        RO.y = tr((mz - GRILLE.fond) / GRILLE.rang, 3);
      }
      poser();
    };
    const RO = { phase: "pret", x: 0, y: 0, mises: /* @__PURE__ */ new Map(), alpha: roue.rotation.y, beta: 0, piles: /* @__PURE__ */ new Map() };
    const lieu = (x2, y) => y < 0 ? [GRILLE.gauche + (x2 < 3 ? 1 : 3) * GRILLE.col, GRILLE.couleurZ] : [GRILLE.gauche + (x2 + 1) * GRILLE.col / 2, GRILLE.fond + (y + 1) * GRILLE.rang / 2];
    const couvre = (x2, y) => {
      if (y < 0) return ROUE.map((p, i) => i).filter((i) => ROUE[i][1] === (x2 < 3 ? "r" : "n"));
      const cs = x2 % 2 ? [(x2 - 1) / 2, (x2 + 1) / 2] : [x2 / 2], rs = y % 2 ? [(y - 1) / 2, (y + 1) / 2] : [y / 2], k = [];
      for (const c of cs) for (const r of rs) {
        const q2 = caseDe(c, r);
        k.push(ROUE.findIndex(([s, co]) => s === q2.sym && co === q2.coul));
      }
      return k;
    };
    const cle = (x2, y) => x2 + "," + y;
    const total = () => [...RO.mises.values()].reduce((a, b) => a + b, 0);
    const curseurs = { case: curseur(cadre(GRILLE.col - 0.14, GRILLE.rang - 0.14, 0.07)), cheval: curseur(cadre(0.5, 0.5, 0.06)), couleur: curseur(cadre(3, 0.95, 0.07)) };
    for (const c of Object.values(curseurs)) {
      aPlat(c);
      g.add(c);
    }
    const surbrillance = aPlat(new T.Mesh(garder(new T.PlaneGeometry(GRILLE.col - 0.1, GRILLE.rang - 0.1)), garder(new T.MeshBasicMaterial({ color: 16770155, transparent: true, opacity: 0.45, depthWrite: false }))));
    surbrillance.visible = false;
    g.add(surbrillance);
    const majJetons = () => {
      for (const [k, p] of RO.piles) if (!RO.mises.has(k)) {
        p.mettre(0);
        p.g.removeFromParent();
        RO.piles.delete(k);
      }
      for (const [k, n] of RO.mises) {
        let p = RO.piles.get(k);
        if (!p) {
          const [x2, y2] = k.split(",").map(Number), [X, Z] = lieu(x2, y2);
          p = pile(g, [X, Y_TAPIS, Z]);
          RO.piles.set(k, p);
        }
        p.mettre(n);
      }
    };
    const majCurseur = () => {
      const visible = RO.phase !== "tourne", [X, Z] = lieu(RO.x, RO.y), sorte = RO.y < 0 ? "couleur" : RO.x % 2 || RO.y % 2 ? "cheval" : "case";
      for (const [n, c] of Object.entries(curseurs)) {
        c.visible = visible && n === sorte;
        c.position.set(X, Y_TAPIS + 0.01, Z);
      }
    };
    const majTouches = () => touches(RO.phase === "tourne" ? [] : RO.phase === "fin" ? [["A", Tr("casino.nouvelle_mise")], ["X", Tr("casino.relancer_meme_mise")], rbEntree(), ["B", Tr("casino.partir")]] : [["A", Tr("casino.poser_une_piece")], RO.mises.size && ["Y", Tr("casino.reprendre")], total() && ["X", Tr("casino.lancer_bille")], !total() && rbEntree(), ["B", Tr("casino.partir")]]);
    const maj = () => {
      majJetons();
      majCurseur();
      majTouches();
    };
    const placerBille = (r, y) => bille.position.set(C.x + Math.cos(RO.beta) * r, y, C.z - Math.sin(RO.beta) * r);
    RO.beta = RO.alpha;
    placerBille(R_CASE, DESSUS + R_BILLE);
    parImage.add(() => {
      if (RO.phase !== "tourne") {
        RO.beta = roue.rotation.y + (RO.case ?? 0) * PASR;
        placerBille(R_CASE, DESSUS + R_BILLE);
      }
    });
    const nettoyer = () => {
      RO.phase = "pret";
      RO.mises.clear();
      ban.cacher();
      surbrillance.visible = false;
    };
    const poser = () => {
      if (RO.phase === "tourne") return;
      if (RO.phase === "fin") nettoyer();
      if (total() >= MISE_TABLE) {
        annoncer(Tr("casino.pieces_max_table", { n: MISE_TABLE }));
        son("perdu", 0.6);
        return;
      }
      if (!assurer(1) || !payer(1)) return;
      const k = cle(RO.x, RO.y);
      RO.mises.set(k, (RO.mises.get(k) || 0) + 1);
      son("mise");
      maj();
    };
    const reprendre = () => {
      if (RO.phase !== "pret") return;
      const k = cle(RO.x, RO.y), n = RO.mises.get(k);
      if (!n) return;
      if (n > 1) RO.mises.set(k, n - 1);
      else RO.mises.delete(k);
      recevoir(1);
      son("descend", 0.7);
      maj();
    };
    const remiser = () => {
      const avant = [...RO.mises];
      nettoyer();
      for (const [k, n] of avant) for (let i = 0; i < n; i++) {
        if (!assurer(1) || !payer(1)) break;
        RO.mises.set(k, (RO.mises.get(k) || 0) + 1);
      }
      maj();
    };
    const ban = bandeau(g, [C.x, DESSUS + 2.6, C.z], 5);
    const lancer = async () => {
      if (RO.phase === "fin") {
        remiser();
        if (total()) son("mise");
      }
      if (RO.phase !== "pret" || !total()) return;
      RO.phase = "tourne";
      maj();
      session.pieces -= total();
      geste("designer");
      son("melange");
      regarder([C.x, DESSUS, C.z]);
      const f = forcees.shift(), k = f ? Math.max(0, ROUE.findIndex(([s2, c2]) => s2 + c2 === f)) : Math.floor(hasard() * 12);
      let du = 0;
      for (const [cl, n] of RO.mises) {
        const [x2, y2] = cl.split(",").map(Number), cv = couvre(x2, y2);
        if (cv.includes(k)) du += n * 12 / cv.length;
      }
      RO.du = du;
      const a0 = roue.rotation.y, a1 = a0 + 2 * Math.PI * (1.6 + hasard() * 0.8), fin = a1 + k * PASR, b0 = RO.beta;
      let db = (b0 - fin) % (2 * Math.PI);
      if (db < 0) db += 2 * Math.PI;
      db += 2 * Math.PI * 4;
      let rebonds = 0;
      await anim(5.6, (t) => {
        roue.rotation.y = a0 + (a1 - a0) * sortie(t);
        RO.beta = b0 - db * (1 - (1 - t) ** 2.2);
        if (t < 0.08) {
          placerBille(lerp(R_CASE, R_PISTE, t / 0.08), DESSUS + R_BILLE + 0.5 * Math.sin(Math.PI * t / 0.08));
          return;
        }
        if (t < 0.55) {
          placerBille(R_PISTE, DESSUS + R_BILLE);
          return;
        }
        const u = Math.min(1, (t - 0.55) / 0.32), saut = Math.abs(Math.sin(u * Math.PI * 3.5)) * (1 - u), n = Math.floor(u * 3.5);
        if (n > rebonds && u < 1) {
          rebonds = n;
          son("touche", 0.35);
        }
        placerBille(lerp(R_PISTE, R_CASE, lisse(u)), DESSUS + R_BILLE + 0.35 * saut);
      }, lineaire);
      RO.case = k;
      son("tinte");
      regarder(null);
      const [s, c] = ROUE[k], gain = RO.du || 0;
      for (let cc = 0; cc < 4; cc++) for (let r = 0; r < 3; r++) {
        const q2 = caseDe(cc, r);
        if (q2.sym === s && q2.coul === c) {
          const [X, Z] = lieu(cc * 2, r * 2);
          surbrillance.position.set(X, Y_TAPIS + 4e-3, Z);
          surbrillance.visible = true;
        }
      }
      RO.phase = "fin";
      if (gain) {
        ban.montrer(Tr("casino.gagne_plus", { n: gain }), "or");
        son("gagne");
        geste(gain >= 12 ? "bravo" : "gagne");
        RO.dernier = gain;
        await volerPieces(g, Math.min(gain, 16), [C.x, DESSUS + 0.5, C.z - 4], [2, Y_TAPIS + 0.2, 3.2]);
        if (RO.du) {
          RO.du = 0;
          feter(gain, [2, Y_TAPIS + 0.2, 3.2]);
          recevoir(gain);
          session.pieces += gain;
        }
        son("piece");
      } else {
        ban.montrer(Tr("casino.dommage"), "bleu");
        son("rate");
        geste("rate");
      }
      maj();
    };
    cadrer(...cadrage("roulette", A.ancre), 1.2);
    maj();
    const touche2 = (b) => {
      if (RO.phase === "tourne") return true;
      const bouge = { 9: [0, -1], 10: [0, 1], 11: [-1, 0], 12: [1, 0] }[b];
      if (bouge) {
        if (RO.phase === "fin") nettoyer();
        let x2 = RO.x, y2 = RO.y;
        if (y2 < 0) {
          if (bouge[0]) x2 = x2 === 1 ? 5 : 1;
          else if (bouge[1] > 0) {
            y2 = 0;
            x2 = x2 === 1 ? 0 : 4;
          }
        } else {
          x2 = Math.max(0, Math.min(6, x2 + bouge[0]));
          y2 += bouge[1];
          if (y2 < 0) x2 = x2 < 3 ? 1 : 5;
          y2 = Math.min(4, y2);
        }
        RO.x = x2;
        RO.y = y2;
        son("touche", 0.5);
        maj();
        return true;
      }
      if (b === 1) {
        poser();
        return true;
      }
      if (b === 4) {
        reprendre();
        return true;
      }
      if (b === 3) {
        lancer();
        return true;
      }
      return b !== 2;
    };
    return {
      touche: touche2,
      libre: () => RO.phase === "fin" || RO.phase === "pret" && !total(),
      poser,
      lancer,
      majTouches,
      RO,
      // B avec des pièces posées : elles reviennent dans la bourse
      rendre: () => {
        if (RO.phase === "tourne" && RO.du) {
          recevoir(RO.du);
          session.pieces += RO.du;
          RO.du = 0;
        } else if (RO.phase === "pret" && total()) {
          recevoir(total());
          RO.mises.clear();
        }
      },
      gains: () => ({
        titre: Tr("casino.roulette_gains"),
        vue: -1,
        lignes: [[Tr("casino.sur_une_image"), Tr("casino.mise_x", { n: 12 })], [Tr("casino.a_cheval_2_images"), Tr("casino.mise_x", { n: 6 })], [Tr("casino.carrefour_4_images"), Tr("casino.mise_x", { n: 3 })], [Tr("casino.sur_une_couleur"), Tr("casino.mise_x", { n: 2 })]],
        note: Tr("casino.roulette_note")
      })
    };
  };
  const decorTable = (THREE, ancre, joueurs) => {
    const T_ = THREE, G = TABLE_GRANDE, n = joueurs.length, g = new T_.Group();
    g.name = NOM_MAINS_DECOR;
    g.position.set(...SOCLE_TABLE.pos);
    g.scale.setScalar(SOCLE_TABLE.echelle);
    ancre.add(g);
    const toile_ = (l, h, f) => {
      const c = document.createElement("canvas");
      c.width = l;
      c.height = h;
      f(c.getContext("2d"));
      const t = new T_.CanvasTexture(c);
      t.colorSpace = T_.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    };
    const geoCarte = new T_.PlaneGeometry(CARTE.l, CARTE.h);
    geoCarte.rotateX(-Math.PI / 2);
    const cartes = new T_.InstancedMesh(geoCarte, new T_.MeshStandardMaterial({ map: toileCarte(T_, dessinerDos), roughness: 0.55 }), n * 5);
    const face = new T_.MeshStandardMaterial({ map: toile_(128, 128, dessinerPiece), ...PIECE_DESSIN.face });
    const piles = joueurs.map((j, k) => [TABLE_PLUS.entree, G.reserves[k % G.reserves.length]]), total = piles.flat().reduce((a, b) => a + b, 0);
    const pieces2 = new T_.InstancedMesh(new T_.CylinderGeometry(PIECE.r, PIECE.r, PIECE.ep, 32), [new T_.MeshStandardMaterial({ color: PIECE_DESSIN.tranche, ...PIECE_DESSIN.bord }), face, face], total);
    const M = new T_.Matrix4(), S2 = new T_.Matrix4(), q = new T_.Quaternion(), v = new T_.Vector3(), un = new T_.Vector3(1, 1, 1), axe = new T_.Vector3(0, 1, 0);
    let kp = 0;
    joueurs.forEach((j, k) => {
      const [dx, dz] = j.dir;
      S2.compose(v.set(G.centre[0] + dx * G.rayonCartes, 0, G.centre[2] + dz * G.rayonCartes), q.setFromAxisAngle(axe, Math.atan2(-dx, -dz)), un);
      for (let i = 0; i < 5; i++) cartes.setMatrixAt(k * 5 + i, M.makeTranslation((i - 2) * TABLE.pas, CARTE.ep + 8e-4, 0).premultiply(S2));
      [G.mise, G.reserve].forEach((p, w) => {
        for (let i = 0; i < piles[k][w]; i++) {
          const r = Math.sin(k * 7 + w * 3 + i * 1.7);
          pieces2.setMatrixAt(kp++, M.compose(v.set(r * PIECE.r * 0.07, PIECE.ep / 2 + i * PIECE.ep, 0).multiplyScalar(G.echPile).add(new T_.Vector3(...p)), q.setFromAxisAngle(axe, i), un.clone().multiplyScalar(G.echPile)).premultiply(S2));
        }
      });
    });
    g.add(cartes, pieces2);
    return g;
  };
  const decorComptoir = (THREE, ancre) => {
    const T_ = THREE, g = new T_.Group();
    g.name = "d\xE9cor du comptoir";
    g.position.set(...SOCLE_CARTES.pos);
    g.scale.setScalar(SOCLE_CARTES.echelle);
    ancre.add(g);
    const cote2 = new T_.MeshStandardMaterial({ color: 15855072, roughness: 0.7 }), dessus = new T_.MeshStandardMaterial({ map: toileCarte(T_, dessinerDos), roughness: 0.55 });
    const m = new T_.Mesh(new T_.BoxGeometry(CARTE.l, PAQUET.ep, CARTE.h), [cote2, cote2, dessus, cote2, cote2, cote2]);
    m.name = NOM_PAQUET;
    m.position.set(PAQUET.pos[0], PAQUET.ep / 2 + 8e-4, PAQUET.pos[2]);
    m.castShadow = true;
    g.add(m);
    return g;
  };
  const JEUX = {
    cartes: { titre: Tr("casino.jeu_poker_titre"), resume: Tr("casino.jeu_poker_resume"), fabriquer: poker, socle: SOCLE_CARTES },
    machines: { titre: Tr("casino.jeu_machine_titre"), resume: Tr("casino.jeu_machine_resume"), fabriquer: machine },
    roulette: { titre: Tr("casino.jeu_roulette_titre"), resume: Tr("casino.jeu_roulette_resume"), fabriquer: roulette },
    // la grande table : le poker en images à plusieurs (aide.joueurs : les Mii assis ; sans eux, face à Luigi)
    table: { titre: Tr("casino.jeu_table_titre"), resume: Tr("casino.jeu_table_resume"), fabriquer: () => poker(A.joueurs?.length ? A.joueurs : null), socle: SOCLE_TABLE },
    // le guichet de Luigi (casino.js) : la revente des badges, seule ; refermée, le guichet reprend la main
    guichet: { titre: Tr("casino.jeu_guichet_titre"), resume: Tr("casino.jeu_guichet_resume"), fabriquer: () => {
      ouvrirVente();
      return { guichet: true, touche: () => true, libre: () => true, majTouches: () => {
      } };
    } }
  };
  const ALIAS = { poker: "cartes", machine: "machines" };
  const cadrage = (nom, ancre) => ancre?.userData.gabarit?.camera || { cartes: TABLE.camera, table: TABLE.camera, roulette: GRILLE.camera, machines: MACH_CASINO.camera }[ALIAS[nom] || nom];
  const ouvrir = (nom, conteneur, o = {}) => {
    nom = ALIAS[nom] || nom;
    if (!JEUX[nom]) return Promise.reject(new Error("casino-jeux : jeu inconnu : " + nom));
    if (!(o.THREE || window.THREE) || !o.scene || !o.camera || !o.ancre) return Promise.reject(new Error("casino-jeux : il faut aide.THREE, scene, camera et ancre"));
    fermer();
    opts = o;
    A = o;
    T = o.THREE || window.THREE;
    session = { jeu: nom, gain: 0, pieces: 0 };
    const socle = JEUX[nom].socle || { echelle: 1, pos: [0, 0, 0] };
    monde = new T.Group();
    monde.name = "jeux du casino : " + nom;
    monde.scale.setScalar(socle.echelle);
    monde.position.set(...socle.pos);
    o.ancre.add(monde);
    monde.updateMatrixWorld(true);
    Object.assign(PIECE, { r: 0.016, ep: 34e-4, cloche: 0.09 });
    racine = el("div", "pcvj", `<style>${STYLE}</style><div class="pcvj-aide"></div><div class="pcvj-bourse"><i></i><span></span></div><div class="pcvj-annonce"></div><div class="pcvj-gains"></div>`);
    conteneur.appendChild(racine);
    racine.addEventListener("pointerdown", toucher);
    racine.addEventListener("click", (e) => {
      const s = e.target.closest?.("[data-b]");
      if (s) touche(+s.dataset.b);
    });
    if (typeof o.rendu === "function") {
      const d = o.rendu(image);
      desabonner = typeof d === "function" ? d : null;
    } else {
      let avant = performance.now();
      const tour = (t) => {
        image((t - avant) / 1e3);
        avant = t;
        secours = requestAnimationFrame(tour);
      };
      secours = requestAnimationFrame(tour);
    }
    montre = 0;
    roule = 0;
    attente = false;
    parImage.add(animerBourse);
    chargerSons();
    majBourse();
    const j = jeton, fin = new Promise((ok) => {
      finSeance = ok;
    });
    (async () => {
      S = await chargerImages();
      await document.fonts?.load?.(`900 40px Nunito`).catch(() => {
      });
      if (j !== jeton) return;
      jeu = JEUX[nom].fabriquer();
      majBourse();
      const b = bourse();
      if (b.annonce) {
        const t = b.annonce;
        delete b.annonce;
        ecrire(CLE, b);
        setTimeout(() => {
          annoncer(String(t).replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";"), 3200);
          son("tinte");
        }, 500);
      }
      geste("accueil");
      if (!illimite() && pieces() === 0) attendre(1400).then(() => {
        if (j === jeton) proposer();
      });
      if (nom === "cartes" || nom === "table") attendre(1300).then(() => jeu?.demarrer?.());
    })().catch((e) => {
      console.warn("casino-jeux :", e);
      partirDuJeu();
    });
    return fin;
  };
  const fermer = () => {
    presse = false;
    if (!racine && !monde) return;
    try {
      jeu?.rendre?.();
    } catch (e) {
    }
    jeton++;
    tweens.clear();
    parImage.clear();
    if (desabonner) {
      try {
        desabonner();
      } catch (e) {
      }
    }
    desabonner = null;
    cancelAnimationFrame(secours);
    secours = 0;
    for (const f2 of restaurer.splice(0)) {
      try {
        f2();
      } catch (e) {
      }
    }
    monde?.removeFromParent();
    monde = null;
    for (const x of jetables.splice(0)) x.dispose?.();
    pieceGeo = null;
    pieceMats = null;
    clearTimeout(minuterieAnnonce);
    vente = null;
    racine?.remove();
    racine = null;
    jeu = null;
    const f = finSeance, s = session;
    finSeance = null;
    session = null;
    f?.({ gain: s?.gain ?? 0, pieces: s?.pieces ?? 0, jeu: s?.jeu });
  };
  fins.push(fermer);
  const partirDuJeu = () => {
    const f = opts.fermer;
    if (typeof f === "function") {
      try {
        f();
      } catch (e) {
      }
    }
    if (racine) fermer();
  };
  const touche = (b) => {
    if (!racine) return false;
    if (!jeu) {
      if (b === 2) partirDuJeu();
      return true;
    }
    if (vente) return toucheVente(b);
    if (toucheCommune(b)) return true;
    if (jeu.touche(b)) return true;
    if (b === 2) {
      if (jeu.libre() || jeu.rendre) {
        son("descend", 0.6);
        partirDuJeu();
      }
      return true;
    }
    return false;
  };
  window.__pcvCasinoJeux = {
    ouvrir,
    fermer,
    touche,
    ECO,
    decorTable,
    decorComptoir,
    cadrage,
    liste: () => Object.entries(JEUX).map(([nom, j]) => ({ nom, titre: j.titre, resume: j.resume })),
    economie: () => {
      const b = bourse();
      return { pieces: b.pieces, depannages: b.depannages, changes: b.changes, etoiles: b.etoiles, ECO };
    },
    // LE GUICHET DE LUIGI (casino.js) : le change et le dépannage, hors d'un jeu ; { ok, texte } (texte pour la bulle de
    // Luigi : *mot* en rouge). La revente : ouvrir("guichet", …). Mode essai : rien ne bouge.
    guichet: {
      changer: () => {
        const r = changer();
        if (r.ok) son("piece");
        return { ok: r.ok, texte: r.ok ? Tr("casino.il_te_reste_pieces", { texte: r.texte, n: pieces() }) : r.texte };
      },
      depanner: () => {
        const b = bourse(), n = pieces(), k = ECO.depannagesParJour - b.depannages;
        if (illimite()) return { ok: false, texte: Tr("luigi.pi\xE8ces_illimit\xE9es") };
        if (n > 0) return { ok: false, texte: Tr("luigi.pi\xE8ces_restantes", { n, s: n > 1 ? "s" : "" }) };
        if (!depanner()) return { ok: false, texte: Tr("luigi.depannage_fini") };
        son("tinte");
        return { ok: true, texte: Tr("luigi.pi\xE8ces_donnees", { n: ECO.plancher, encore: k > 1 ? Tr("casino.encore_n_depannages", { n: k - 1, s: k - 1 > 1 ? "s" : "" }) : "" }) };
      },
      pieces: () => pieces(),
      aBadges: () => aBadges()
    },
    banc: {
      get jeu() {
        return jeu;
      },
      get monde() {
        return monde;
      },
      vitesse: (v) => {
        vitesse = v;
      },
      // les prochaines cartes (noms) / symboles des rouleaux / cases de la roue (« champignonr »)
      forcer: (l) => {
        forcees = l.slice();
      },
      bourse: (n, etoiles) => modifier((b) => {
        b.pieces = n;
        if (etoiles != null) b.etoiles = etoiles;
      }),
      // la revente : le catalogue de Luigi et les badges comptés sur l'accueil
      catalogue: () => catalogueVente(),
      poses: () => compterPoses(posesAccueil()),
      // l'espérance des jeux, par tirages (pièces rendues pour une pièce misée)
      simuler: (n = 1e5) => {
        const m = () => Math.floor(Math.random() * 6), main = () => [m(), m(), m(), m(), m()];
        const tirage = (h, ch) => h.map((c, i) => ch[i] ? m() : c);
        let mise = 0, rendu = 0, mise5 = 0, rendu5 = 0;
        for (let i = 0; i < n; i++) {
          let j = main(), l = main();
          const mi = cote(j).rang >= 1 ? 5 : 1;
          j = tirage(j, choixLuigi(j));
          l = tirage(l, choixLuigi(l));
          const cj = cote(j), c = comparer(cj, cote(l));
          const r = c > 0 ? FIGURES[cj.rang].mult : c === 0 ? 1 : 0;
          mise += 1;
          rendu += r;
          mise5 += mi;
          rendu5 += r * mi;
        }
        let mm = 0, mg = 0;
        const L = ROULEAU.length;
        for (const a of ROULEAUX[0]) for (const b of ROULEAUX[1]) for (const c of ROULEAUX[2]) {
          const x = paieMachine([a, b, c]).mult;
          mm += x;
          mg += x > 0;
        }
        return { poker: +(rendu / mise).toFixed(3), pokerMise5SurPaire: +(rendu5 / mise5).toFixed(3), machine: +(mm / L ** 3).toFixed(3), machineGagnants: +(mg / L ** 3).toFixed(3), roulette: 1 };
      },
      // la grande table, par tirages (la règle de la partie : reglerTable) : n mains pour chaque façon de jouer du joueur
      // (il change ses cartes comme Luigi : garder ses groupes) ; gagnees : pot gagné seul ; partagees : pot partagé ;
      // rendement : pièces rendues pour une pièce misée ; couches : part des Mii qui se couchent
      simulerTable: (n = 1e5) => {
        const m = () => Math.floor(Math.random() * 6), main = () => [m(), m(), m(), m(), m()];
        const facons = {
          "ne mise jamais": () => 0,
          "mise +5 avec une paire ou mieux": (h) => cote(h).rang >= 1 ? 1 : 0,
          "mise toujours +5": () => 1,
          "mise +5 avec une paire, +10 avec un brelan": (h) => cote(h).rang >= 3 ? 2 : cote(h).rang >= 1 ? 1 : 0
        };
        const r = {};
        for (const [nom, f] of Object.entries(facons)) {
          let g = 0, p = 0, mise = 0, rendu = 0, couches = 0;
          for (let i = 0; i < n; i++) {
            const mains = [main(), main(), main(), main(), main()], rel = f(mains[0]), x = reglerTable(mains, rel, choixLuigi(mains[0]), m);
            const gagne = x.gagnants.includes(0);
            if (gagne) {
              if (x.gagnants.length > 1) p++;
              else g++;
              rendu += x.part;
            }
            mise += TABLE_PLUS.entree + rel * TABLE_PLUS.relance;
            couches += x.restent.filter((v) => !v).length;
          }
          r[nom] = { gagnees: +(g / n).toFixed(4), partagees: +(p / n).toFixed(4), rendement: +(rendu / mise).toFixed(3), couches: +(couches / n / 4).toFixed(3) };
        }
        return { mains: n, ...r };
      }
    },
    fin: () => {
      for (const f of fins.splice(0)) f();
    }
  };
  return "casino-jeux : pr\xEAt";
})();
