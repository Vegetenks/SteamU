(() => {
  const T = window.THREE, E = window.__pcvESM;
  if (!T || !E?.GLTFLoader) return "luigi-vrai : three.js ou son GLTFLoader absent";
  const reprise = window.__pcvLuigiVrai?.reprise?.() ?? null;
  window.__pcvLuigiVrai?.fin?.();
  const fins = [];
  const FICHIER = "luigi/luigi-croupier.glb";
  const TEINT = { lumiere: new T.Color(0.56, 0.6, 0.68), propre: 0.4 };
  const QUI = "luigi-vrai";
  const REPLIQUES = {
    accueil: [
      "Bienvenue au casino de Luigi ! Oh yeah !",
      "Ah, te voil\xE0 ! Les machines brillent rien que pour toi ce soir.",
      "Entre donc ! Ici, c'est Luigi qui tient la maison\u2026 pas Mario !",
      "Bonsoir, bonsoir ! Une petite partie avant de dormir ?",
      "Approche, approche ! Le croupier ne mord pas."
    ],
    cartes: [
      "Je bats les cartes\u2026 comme au bon vieux temps !",
      "\xC9toile, champignon, fleur\u2026 Ah non, \xE7a, c'est l'autre jeu.",
      "Regarde bien mes mains\u2026 Hop ! Tu n'as rien vu.",
      "Une carte pour toi, une carte pour moi\u2026 H\xE9 h\xE9."
    ],
    designer: [
      "Celle-l\xE0 ! Je la sens bien, celle-l\xE0.",
      "Psst\u2026 Celle-ci a l'air d'avoir bon c\u0153ur aujourd'hui.",
      "Essaie donc celle-l\xE0. Luigi a du flair !",
      "Regarde : celle-ci clignote plus fort que les autres !"
    ],
    gagne: [
      "Oh yeah ! Bien jou\xE9 !",
      "Gotcha ! Il est \xE0 toi !",
      "Wahoo ! M\xEAme Mario n'aurait pas fait mieux !",
      "Bravo ! Tu vas finir par vider mon casino !",
      "Mamma mia, quelle adresse !"
    ],
    rate: [
      "Mamma mia\u2026 C'\xE9tait tout pr\xE8s !",
      "Oh non\u2026 La pince a gliss\xE9. Ce n'est pas moi, promis !",
      "H\xE9 h\xE9\u2026 On dira que c'\xE9tait l'\xE9chauffement.",
      "Ne t'en fais pas, moi aussi je rate. Souvent. Tr\xE8s souvent.",
      "Oh-oh\u2026 La prochaine sera la bonne !"
    ],
    salut: [
      "\xC0 bient\xF4t ! Je garde ta place au chaud.",
      "Ciao ! Reviens vite, les badges vont s'ennuyer.",
      "Bonne nuit ! Et chut, pas un mot \xE0 Mario.",
      "\xC0 la prochaine ! Le casino de Luigi ne ferme jamais."
    ],
    noeud: ["Toujours tir\xE9 \xE0 quatre \xE9pingles, le croupier !", "Un croupier, \xE7a soigne son n\u0153ud. Hm hm."],
    attente: [
      "Alors, on h\xE9site ?",
      "Les pi\xE8ces ne vont pas se jouer toutes seules !",
      "Il para\xEEt qu'il y a de nouveaux badges aujourd'hui\u2026",
      "Prends ton temps\u2026 Luigi a toute la nuit.",
      "Psst ! La machine du fond\u2026 Non, rien."
    ]
  };
  const auHasard = (l) => l[Math.floor(Math.random() * l.length)];
  const dernieres = {};
  const replique = (nom) => {
    const l = REPLIQUES[nom];
    if (!l) return null;
    let r;
    do
      r = auHasard(l);
    while (l.length > 1 && r === dernieres[nom]);
    return dernieres[nom] = r;
  };
  const lireModele = async (o) => {
    if (o.lire) return o.lire(FICHIER);
    const url = await window.__pcvRessource?.(FICHIER, "model/gltf-binary");
    if (!url) throw new Error("luigi-vrai : prive/" + FICHIER + " absent");
    try {
      return await (await fetch(url)).arrayBuffer();
    } finally {
      URL.revokeObjectURL(url);
      if (window.__pcvBlobs?.[FICHIER] === url) delete window.__pcvBlobs[FICHIER];
    }
  };
  const analyser = (octets) => new Promise((ok, ko) => new E.GLTFLoader().parse(octets, "", ok, ko));
  const EXPRESSIONS = ["neutre", "cligne", "joie", "clin", "surprise", "inquiet"];
  const MOITIES = {
    neutre: ["ouvert", "ouvert"],
    cligne: ["ferme", "ferme"],
    joie: ["joie", "joie"],
    clin: ["ouvert", "ferme"],
    surprise: ["ouvert", "ouvert"],
    inquiet: ["ouvert", "ouvert"]
  };
  const SOURCILS = { joie: "haut", surprise: "haut", inquiet: "inquiet" };
  const texturesYeux = (image, filtre) => {
    const w = image.width, h = image.height, c0 = document.createElement("canvas");
    c0.width = w;
    c0.height = h;
    const x0 = c0.getContext("2d", { willReadFrequently: true });
    x0.drawImage(image, 0, 0);
    const src = x0.getImageData(0, 0, w, h).data;
    const px = (d, x, y) => d.subarray((y * w + x) * 4, (y * w + x) * 4 + 4);
    const ecart = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    const fond = (y) => px(src, 0, y), marque = (x, y) => ecart(px(src, x, y), fond(y)) > 60;
    const clair = (p) => p[2] > p[0] + 20 || p[0] > 200 && p[1] > 200 && p[2] > 200;
    let oy0 = h, oy1 = -1, ox0 = w, ox1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (marque(x, y) && clair(px(src, x, y))) {
      oy0 = Math.min(oy0, y);
      oy1 = Math.max(oy1, y);
      ox0 = Math.min(ox0, x);
      ox1 = Math.max(ox1, x);
    }
    if (oy1 < 0) return null;
    const dansOeil = (x, y) => y >= oy0 - 1 && y <= oy1 + 1 && x >= ox0 - 1 && x <= ox1 + 1;
    const sombre = (p) => p[0] + p[1] + p[2] < 400;
    let sy0 = h, sy1 = -1, sx0 = w, sx1 = -1;
    for (let y = 0; y < oy0 - 1; y++) for (let x = 0; x < w; x++) if (marque(x, y) && sombre(px(src, x, y))) {
      sy0 = Math.min(sy0, y);
      sy1 = Math.max(sy1, y);
      sx0 = Math.min(sx0, x);
      sx1 = Math.max(sx1, x);
    }
    const sourcil = [];
    for (let y = sy0 - 1; y <= sy1 + 1 && y < oy0 - 1; y++) for (let x = sx0 - 1; x <= sx1 + 1; x++)
      if (y >= 0 && x >= 0 && x < w && ecart(px(src, x, y), fond(y)) > 15) sourcil.push([x, y, Array.from(px(src, x, y).subarray(0, 3))]);
    let trait = [40, 16, 8], noir = 1e9;
    for (const [, , c] of sourcil) if (c[0] + c[1] + c[2] < noir) {
      noir = c[0] + c[1] + c[2];
      trait = c;
    }
    const moitie = (oeilEtat, sourcilEtat) => {
      const d = new Uint8ClampedArray(src);
      const poser = (x, y, c) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        d.set([c[0], c[1], c[2], 255], (y * w + x) * 4);
      };
      if (oeilEtat !== "ouvert") {
        for (let y = oy0 - 1; y <= oy1 + 1; y++) for (let x = 0; x < w; x++) if (dansOeil(x, y)) poser(x, y, fond(y));
        const yl = Math.round(oy0 + (oy1 - oy0) * (oeilEtat === "joie" ? 0.5 : 0.62)), large = Math.max(1, ox1 - ox0);
        for (let x = ox0; x <= ox1; x++) {
          const k = Math.abs((x - ox0) / large * 2 - 1);
          const dy = oeilEtat === "joie" ? Math.round(3 * k * k) - 2 : -Math.round(2 * k * k) + 1;
          poser(x, yl + dy, trait);
          poser(x, yl + dy + 1, trait);
        }
      }
      if (sourcil.length && sourcilEtat) {
        for (const [x, y] of sourcil) poser(x, y, fond(y));
        for (const [x, y, c] of sourcil) poser(x, y - (sourcilEtat === "haut" ? 2 : Math.round(-1 + 3 * x / (w - 1))), c);
      }
      return new ImageData(d, w, h);
    };
    const toile = (nom) => {
      const [dr, ga] = MOITIES[nom], c = document.createElement("canvas");
      c.width = w * 2;
      c.height = h;
      const x = c.getContext("2d"), t = document.createElement("canvas");
      t.width = w;
      t.height = h;
      const tx = t.getContext("2d");
      tx.putImageData(moitie(dr, SOURCILS[nom]), 0, 0);
      x.drawImage(t, 0, 0);
      tx.putImageData(moitie(ga, SOURCILS[nom]), 0, 0);
      x.save();
      x.translate(w * 2, 0);
      x.scale(-1, 1);
      x.drawImage(t, 0, 0);
      x.restore();
      const tex = new T.CanvasTexture(c);
      tex.flipY = false;
      tex.colorSpace = T.SRGBColorSpace;
      tex.wrapS = tex.wrapT = T.ClampToEdgeWrapping;
      tex.magFilter = filtre;
      tex.minFilter = T.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      return tex;
    };
    return Object.fromEntries(EXPRESSIONS.map((n) => [n, toile(n)]));
  };
  const SANS_CARTES = ["luigi_d_throw"];
  const SANS_CARTE_LANCEE = ["luigi_d_deal_start", "luigi_d_deal", "luigi_d_deal_end", "luigi_d_deal_end2"];
  const COUPE = { mp_choc_a_plat_ventre: 29 / 60, mp_lever_la_main: 14 / 60, mp_victoire: 102 / 60 };
  const ALLURES = { mpds: { marche: ["mp_marche", 17.6], course: ["mp_course", 32.5] }, sm64ds: { marche: ["L_walk", 9.9], course: ["L_run", 13.1] } };
  const SEUIL_COURSE = 1.15;
  const au = (l) => l[Math.floor(Math.random() * l.length)];
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const GESTES = {
    accueil: { yeux: () => "joie", etapes: () => [{ c: "mp_se_retourner", tenir: 0.45 }] },
    salut: { yeux: (t) => t > 0.5 ? "joie" : "neutre", etapes: () => [{ c: "L_ed_cap_off", tenir: 0.5 }] },
    designer: { yeux: (t) => t > 0.55 && t < 1.3 ? "clin" : "neutre", etapes: () => [{ c: "luigi_d_throw", tenir: 0.7 }] },
    cartes: { yeux: (t) => t > 2.6 ? "clin" : "neutre", etapes: () => [{ c: "luigi_d_shuffle_start" }, { c: "luigi_d_shuffle", n: 3 }, { c: "luigi_d_deal_start" }, { c: "luigi_d_deal", n: 3 }, { c: "luigi_d_deal_end2" }] },
    // (9/10) redonner : il lève son paquet et donne les cartes échangées (casino-jeux.js), sans rebattre
    redonner: { yeux: () => "neutre", etapes: () => [{ c: "luigi_d_deal_start" }, { c: "luigi_d_deal", n: 2 }, { c: "luigi_d_deal_end2" }] },
    astiquer: { yeux: () => "neutre", etapes: (x) => x.comptoir ? [{ c: "luigi_d_shuffle_start" }, { c: "luigi_d_shuffle", n: 4 }, { c: "luigi_d_deal_end" }] : [{ c: "mp_regarde_autour", n: 1 }] },
    noeud: { yeux: (t) => t > 1 ? "joie" : "neutre", etapes: (x) => x.comptoir ? [{ c: "luigi_d_deal_wait", n: 2 }] : [{ c: "L_ed_look_mario", tenir: 0.9 }] },
    regarde: { yeux: () => "neutre", etapes: () => [{ c: "mp_regarde_autour", n: 1 }] },
    salle: { yeux: () => "neutre", etapes: (x) => x.comptoir ? [{ c: "luigi_d_wait", n: 1 }] : [{ c: "L_ed_look_mario", tenir: 0.9 }] },
    gagne: { yeux: () => "joie", etapes: () => au([[{ c: "win", tenir: 0.2 }], [{ c: "mp_petit_saut_poing", tenir: 0.35 }], [{ c: "mp_joie_saut", tenir: 0.25 }]]) },
    bravo: { yeux: () => "joie", etapes: () => au([[{ c: "star_get", tenir: 0.5 }], [{ c: "mp_victoire", tenir: 0.9 }]]) },
    rate: { yeux: () => "inquiet", etapes: () => [{ c: "mp_attente_inquiete", jusqua: 1.5 }] },
    presque: { yeux: (t) => t < 0.9 ? "surprise" : "inquiet", etapes: () => [{ c: "mp_oh_non", tenir: 0.3 }] },
    battu: { yeux: () => "inquiet", etapes: () => [{ c: "luigi_d_win_start" }, { c: "luigi_d_win", n: 4 }, { c: "luigi_d_win_end" }] },
    triomphe: { yeux: (t) => t > 0.3 ? "joie" : "neutre", etapes: () => [{ c: "luigi_d_lose", tenir: 0.2 }] },
    ouvrir: { yeux: (t) => t > 0.5 ? "joie" : "neutre", etapes: () => [{ c: "mp_lever_la_main", tenir: 0.5 }] },
    porter: { yeux: () => null, etapes: () => [], porter: true }
  };
  const FONDU = 0.12, FONDU_PAS = 0.1;
  const BRAS = /^(arm_|wrist_|finger_)/;
  const creerLuigi = async (rendu, parent, o = {}) => {
    const gltf = await analyser(await lireModele(o));
    const modele = gltf.scene, os = {};
    modele.traverse((x) => {
      if (x.isBone) os[x.name] = x;
    });
    const manque = ["luigi_all_root", "skl_root", "spin", "face_1", "card_lmodel", "card_rmodel"].filter((n) => !os[n]);
    if (manque.length) throw new Error("luigi-vrai : os absents : " + manque.join(", "));
    const clips = {};
    for (const c of gltf.animations) clips[c.name] = c;
    const requis = ["L_wait", "luigi_d_wait", "mp_marche", "mp_course", "L_walk", "L_run", ...new Set(Object.values(GESTES).flatMap((g) => [true, false].flatMap((c) => g.etapes({ comptoir: c }).map((e) => e.c))))];
    const sans = requis.filter((n) => !clips[n]);
    if (sans.length) throw new Error("luigi-vrai : le mod\xE8le n'a pas les animations du jeu (" + sans.slice(0, 4).join(", ") + "\u2026) : mettre \xE0 jour prive/luigi/luigi-croupier.glb");
    for (const [n, t] of Object.entries(COUPE)) if (clips[n] && clips[n].duration > t) {
      const c = clips[n].clone();
      c.tracks.forEach((k) => k.trim(0, t));
      c.duration = t;
      clips[n] = c;
    }
    for (const n of SANS_CARTES) if (clips[n]) {
      const c = clips[n].clone();
      c.tracks = c.tracks.filter((k) => !/^(card_|ball_)/.test(k.name));
      clips[n] = c;
    }
    for (const n of SANS_CARTE_LANCEE) if (clips[n]) {
      const c = clips[n].clone();
      c.tracks = c.tracks.filter((k) => !/^card_rmodel/.test(k.name));
      clips[n] = c;
    }
    const pieces = [];
    modele.traverse((x) => {
      if (x.isSkinnedMesh) pieces.push(x);
    });
    if (!pieces.length) throw new Error("luigi-vrai : mod\xE8le sans maillage");
    const filtre = o.pixels ? T.NearestFilter : T.LinearFilter, jetables = [], teint = { ...TEINT, ...o.teint };
    let yeux = null, matYeux = null;
    for (const x of pieces) {
      const m = x.material, base = {
        map: m.map,
        side: m.side,
        name: m.name,
        alphaTest: m.name === "cartes" ? 0.5 : 0,
        color: teint.lumiere,
        emissive: 16777215,
        emissiveMap: m.map,
        emissiveIntensity: teint.propre
      };
      const n = o.matiere ? new T.MeshStandardMaterial({ ...base, roughness: o.matiere.rugosite, metalness: 0, envMapIntensity: o.matiere.reflets }) : new T.MeshLambertMaterial(base);
      if (m.map) {
        m.map.magFilter = filtre;
        jetables.push(m.map);
      }
      if (m.name === "yeux" && m.map) {
        yeux = texturesYeux(m.map.image, filtre);
        if (yeux) {
          n.map = n.emissiveMap = yeux.neutre;
          matYeux = n;
          const uv = x.geometry.attributes.uv;
          for (let v = 0; v < uv.count; v++) uv.setX(v, uv.getX(v) / 2);
          uv.needsUpdate = true;
        }
      }
      m.dispose();
      x.material = n;
      jetables.push(n, x.geometry);
      x.frustumCulled = false;
    }
    const corps = pieces.find((x) => x.material.name === "corps") || pieces[0];
    const boite = new T.Box3().setFromBufferAttribute(corps.geometry.attributes.position), HAUT = boite.max.y - boite.min.y;
    modele.updateMatrixWorld(true);
    const M = { H: HAUT, tete: modele.worldToLocal(os.face_1.getWorldPosition(new T.Vector3())).add(new T.Vector3(0, HAUT * 0.1, 0.3)) };
    const objet = new T.Group();
    objet.name = "Luigi (vrai)";
    const echelle = new T.Group();
    echelle.add(modele);
    objet.add(echelle);
    const mixer = new T.AnimationMixer(modele);
    const filtrer = (c, garder) => {
      const k = c.clone();
      k.tracks = k.tracks.filter((t) => garder(t.name.split(".")[0]));
      k.name = c.name + (garder === estBras ? "\xB7bras" : "\xB7jambes");
      return k;
    };
    const estBras = (n) => BRAS.test(n), estJambes = (n) => !BRAS.test(n);
    const action = (c, boucle2 = true) => {
      const a = mixer.clipAction(c);
      a.setLoop(boucle2 ? T.LoopRepeat : T.LoopOnce, Infinity);
      a.clampWhenFinished = !boucle2;
      return a;
    };
    const marcheVoulue = () => {
      let v = "mpds";
      try {
        if (localStorage.getItem("pcv-luigi-marche") === "sm64ds") v = "sm64ds";
      } catch (e) {
      }
      return ALLURES[v];
    };
    const AL = marcheVoulue();
    const FOND = { debout: clips.mp_attente || clips.L_wait, comptoir: clips.luigi_d_wait, marche: clips[AL.marche[0]], course: clips[AL.course[0]] };
    const fond = {}, fondJ = {};
    for (const [k, c] of Object.entries(FOND)) {
      fond[k] = action(c);
      fondJ[k] = action(filtrer(c, estJambes));
      for (const a of [fond[k], fondJ[k]]) {
        a.play();
        a.setEffectiveWeight(0);
      }
    }
    const brasBoite = action(filtrer(clips.luigi_d_deal_wait, (n) => estBras(n) && !/card/.test(n)));
    brasBoite.play();
    brasBoite.setEffectiveWeight(0);
    const poidsFond = { debout: 1, comptoir: 0, marche: 0, course: 0 };
    const L = {
      objet,
      modele,
      os,
      corps,
      M,
      geste: null,
      parle: 0,
      t: 0,
      vivant: o.vivant ?? true,
      appui: o.appui ?? null,
      regard: null,
      kRegard: [0, 0],
      expr: "neutre",
      cligne: 2 + Math.random() * 3,
      prochainRepos: 8 + Math.random() * 6,
      vitesse: 0,
      avantPos: null,
      taille: 1,
      kPorter: 0,
      vMax: 0
    };
    let piste = null;
    const sortantes = /* @__PURE__ */ new Set();
    const effacer = (a, d) => {
      if (!a) return;
      a.fadeOut(d);
      a.finLe = L.t + d + 0.05;
      sortantes.add(a);
    };
    const pourGeste = {};
    const clipGeste = (n) => pourGeste[n] ||= Object.assign(clips[n].clone(), { name: n + "\xB7geste" });
    const lancerEtape = () => {
      const e = piste.etapes[piste.k], c = clipGeste(e.c), boucle2 = !!e.n || !!e.jusqua, a = action(c, boucle2);
      sortantes.delete(a);
      a.reset();
      a.timeScale = 1;
      a.setEffectiveWeight(1);
      a.play();
      a.fadeIn(piste.k ? FONDU_PAS : FONDU);
      if (piste.a && piste.a !== a) effacer(piste.a, piste.k ? FONDU_PAS : FONDU);
      piste.a = a;
      piste.tEtape = 0;
      piste.duree = e.jusqua ?? c.duration * (e.n || 1) + (e.tenir || 0);
    };
    const poidsGeste = () => {
      let w = piste?.a ? piste.a.getEffectiveWeight() : 0;
      for (const a of sortantes) w += a.getEffectiveWeight();
      return Math.min(1, w);
    };
    L.expression = (nom) => {
      if (!matYeux || !yeux) return;
      const t = yeux[nom] || yeux.neutre;
      if (matYeux.map !== t) matYeux.map = matYeux.emissiveMap = t;
      L.expr = nom;
    };
    const qL = new T.Quaternion(), qM = new T.Quaternion(), qH = new T.Quaternion(), qP = new T.Quaternion(), qB = new T.Quaternion(), qI = new T.Quaternion(), eL = new T.Euler(0, 0, 0, "YXZ");
    const baseTete = os.face_1.quaternion.clone();
    const qBuste0 = new T.Quaternion();
    {
      modele.updateMatrixWorld(true);
      const a = new T.Quaternion(), b = new T.Quaternion();
      modele.getWorldQuaternion(a);
      os.spin.getWorldQuaternion(b);
      qBuste0.copy(a.invert().multiply(b));
    }
    const LACET = 70 * Math.PI / 180, TANGAGE = 30 * Math.PI / 180, DERRIERE = 115 * Math.PI / 180;
    const busteActuel = () => {
      const a = new T.Quaternion(), b = new T.Quaternion();
      modele.getWorldQuaternion(a);
      os.spin.getWorldQuaternion(b);
      return qB.copy(a.invert().multiply(b)).multiply(qI.copy(qBuste0).invert());
    };
    const tournerTete = (pitch, yaw, roulis = 0) => {
      if (!pitch && !yaw && !roulis) return;
      echelle.getWorldQuaternion(qM);
      os.face_1.getWorldQuaternion(qH);
      os.face_1.parent.getWorldQuaternion(qP);
      qM.multiply(qB);
      qL.setFromEuler(eL.set(pitch, yaw, roulis));
      qL.premultiply(qM).multiply(qI.copy(qM).invert());
      os.face_1.quaternion.copy(qP.invert().multiply(qL).multiply(qH));
    };
    const vMonde = new T.Vector3(), vLocal = new T.Vector3();
    let avantCap = null;
    L.maj = (dt) => {
      dt = Math.min(dt, 0.1);
      L.t += dt;
      if (L.vivant && !piste && !L.parle) {
        L.prochainRepos -= dt;
        if (L.prochainRepos < 0) {
          L.prochainRepos = 10 + Math.random() * 10;
          const r = Math.random();
          if (r < 0.45) L.reagir("regarde", { silence: Math.random() < 0.5 });
          else if (r < 0.7) L.coupDOeil();
          else L.reagir("attente");
        }
      }
      objet.updateMatrixWorld(true);
      objet.getWorldPosition(vMonde);
      const sc = Math.max(1e-6, L.taille / HAUT * objet.getWorldScale(vLocal).y);
      let v = 0;
      if (L.avantPos && dt > 0) {
        v = vMonde.distanceTo(L.avantPos) / dt / sc;
        if (v > 12 * HAUT) v = 0;
      }
      L.vitesse += (v - L.vitesse) * (1 - Math.exp(-dt * 10));
      L.avantPos = (L.avantPos || new T.Vector3()).copy(vMonde);
      const vt = L.vitesse / HAUT;
      const bouge = vt > 0.12, court = vt > SEUIL_COURSE;
      const voulu = { debout: !bouge && L.appui == null ? 1 : 0, comptoir: !bouge && L.appui != null ? 1 : 0, marche: bouge && !court ? 1 : 0, course: court ? 1 : 0 };
      const k = 1 - Math.exp(-dt / (FONDU / 3));
      for (const n in poidsFond) poidsFond[n] += (voulu[n] - poidsFond[n]) * k;
      fond.marche.timeScale = fondJ.marche.timeScale = clamp(L.vitesse / AL.marche[1], 0.35, 1.6);
      fond.course.timeScale = fondJ.course.timeScale = clamp(L.vitesse / AL.course[1], 0.6, 1.8);
      if (piste) {
        piste.t += dt;
        piste.tEtape += dt;
        if (piste.tEtape >= piste.duree) {
          if (piste.k < piste.etapes.length - 1) {
            piste.k++;
            lancerEtape();
          } else L.finir();
        }
      }
      for (const a of sortantes) if (L.t > a.finLe) {
        a.stop();
        sortantes.delete(a);
      }
      const wg = poidsGeste();
      L.kPorter += ((L.porte ? 1 : 0) - L.kPorter) * k;
      for (const n in poidsFond) {
        const w = poidsFond[n] * (1 - wg);
        fond[n].setEffectiveWeight(w * (1 - L.kPorter));
        fondJ[n].setEffectiveWeight(w * L.kPorter);
      }
      brasBoite.setEffectiveWeight(L.kPorter * (1 - wg));
      os.face_1.quaternion.copy(baseTete);
      mixer.update(dt);
      baseTete.copy(os.face_1.quaternion);
      echelle.updateMatrixWorld(true);
      let cible = [0, 0];
      busteActuel();
      if (L.regard) {
        vLocal.copy(L.regard);
        echelle.worldToLocal(vLocal);
        const d = vLocal.sub(M.tete).applyQuaternion(qI.copy(qB).invert());
        const lacet = Math.atan2(d.x, d.z);
        if (Math.abs(lacet) < DERRIERE) cible = [clamp(-Math.atan2(d.y, Math.hypot(d.x, d.z)), -TANGAGE, TANGAGE), clamp(lacet, -LACET, LACET)];
      }
      const kr = 1 - Math.exp(-dt * 6);
      L.kRegard = [L.kRegard[0] + (cible[0] - L.kRegard[0]) * kr, L.kRegard[1] + (cible[1] - L.kRegard[1]) * kr];
      L.kLibre = (L.kLibre ?? 1) + ((piste ? 0 : 1) - (L.kLibre ?? 1)) * (1 - Math.exp(-dt * 6));
      const libre = L.kLibre * (1 - Math.min(1, vt));
      const hoche = L.parle && !piste ? 0.07 * Math.sin(L.t * 9) : 0;
      tournerTete(clamp(L.kRegard[0] * libre + hoche, -TANGAGE, TANGAGE), clamp(L.kRegard[1] * libre, -LACET, LACET));
      L.regardApplique = [L.kRegard[0] * libre + hoche, L.kRegard[1] * libre];
      L.cligne -= dt;
      let ex = piste ? GESTES[piste.nom].yeux(piste.t) : null;
      if (!ex || ex === "neutre") {
        if (L.cligne < 0) ex = "cligne";
        if (L.cligne < -0.13) L.cligne = 2 + Math.random() * 4;
      }
      L.expression(ex || "neutre");
      if (L.parle) L.parle = Math.max(0, L.parle - dt);
    };
    L.coupDOeil = () => {
      const a = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.4);
      objet.updateMatrixWorld(true);
      L.regard = echelle.localToWorld(M.tete.clone().add(new T.Vector3(Math.sin(a) * 20, -1, Math.cos(a) * 20)));
      setTimeout(() => {
        if (!piste) L.regard = L.regardVoulu ?? null;
      }, 1600);
    };
    L.finir = () => {
      if (L.porte) L.porte = false;
      if (!piste) return;
      const p = piste;
      piste = null;
      effacer(p.a, FONDU);
      L.regard = L.regardVoulu ?? null;
      p.fin?.();
    };
    L.reagir = (nom, o2 = {}) => {
      const texte = o2.silence ? null : o2.texte ?? replique(nom);
      if (nom === "attente") return texte ? L.dire(texte, o2) : Promise.resolve();
      const G = GESTES[nom];
      if (!G) return Promise.reject(new Error("luigi-vrai : geste inconnu : " + nom));
      L.finir();
      if (G.porter) {
        L.porte = true;
        return Promise.resolve();
      }
      return new Promise((fin) => {
        const etapes = G.etapes({ comptoir: L.appui != null }).filter((e) => clips[e.c]);
        if (!etapes.length) return fin();
        if (o2.vers) {
          L.regard = o2.vers.clone();
        }
        piste = { nom, etapes, k: 0, a: null, t: 0, tEtape: 0, fin, sortie: null };
        lancerEtape();
        L.prochainRepos = 10 + Math.random() * 10;
        if (texte) L.dire(texte, { ...o2, geste: true });
      });
    };
    L.dire = (texte, o2 = {}) => {
      const duree = o2.duree ?? Math.min(5.5, Math.max(1.6, 0.8 + 0.06 * String(texte).length));
      L.parle = duree * 0.85;
      window.dispatchEvent(new CustomEvent("pcv-accompagnant-dit", { detail: { texte: String(texte), duree, qui: QUI } }));
      return new Promise((ok) => setTimeout(ok, duree * 1e3));
    };
    L.elan = (vers) => {
      if (vers) {
        L.regard = vers.clone();
        setTimeout(() => {
          if (!piste) L.regard = L.regardVoulu ?? null;
        }, 700);
      }
    };
    L.parler = (s_) => {
      L.parle = Math.max(L.parle, s_);
    };
    L.regarder = (v) => {
      L.regardVoulu = v ? v.clone() : null;
      if (!piste) L.regard = L.regardVoulu;
    };
    L.regler = (taille) => {
      L.taille = taille;
      echelle.scale.setScalar(taille / HAUT);
    };
    L.appuyer = (f) => {
      L.appui = f ?? null;
    };
    Object.defineProperty(L, "geste", { get: () => piste ? { nom: piste.nom } : null });
    L.liberer = () => {
      L.finir();
      mixer.stopAllAction();
      mixer.uncacheRoot(modele);
      objet.removeFromParent();
      for (const x of jetables) x.dispose?.();
      if (yeux) for (const t of Object.values(yeux)) t.dispose();
      for (const x of pieces) x.skeleton?.dispose?.();
    };
    L.clips = Object.keys(clips);
    L.regler(o.taille ?? 1);
    if (parent) parent.add(objet);
    L.maj(0);
    return L;
  };
  let luigi = null, enCours = null, raf = 0, dessine = 0, avant = 0, majManuelle = 0, fini = false;
  const boucle = (t) => {
    if (!luigi || fini || performance.now() - dessine > 1e3) {
      raf = 0;
      avant = 0;
      return;
    }
    raf = requestAnimationFrame(boucle);
    if (performance.now() - majManuelle < 250 || document.hidden) {
      avant = t;
      return;
    }
    luigi.maj(Math.min(0.1, (t - (avant || t)) / 1e3));
    avant = t;
  };
  const creer = (rendu, parent, o = {}) => {
    const precedente = enCours;
    const p = (async () => {
      await precedente?.catch(() => {
      });
      luigi?.liberer();
      luigi = null;
      const l = await creerLuigi(rendu, parent, o);
      if (fini) {
        l.liberer();
        throw new Error("luigi-vrai : script r\xE9\xE9valu\xE9 pendant la cr\xE9ation");
      }
      luigi = l;
      l.corps.onAfterRender = () => {
        dessine = performance.now();
        if (!raf && !fini) raf = requestAnimationFrame(boucle);
      };
      return l;
    })();
    enCours = p;
    p.catch(() => {
    }).finally(() => {
      if (enCours === p) enCours = null;
    });
    return p;
  };
  const maj = (dt) => {
    majManuelle = performance.now();
    luigi?.maj(dt);
  };
  const reagir = (nom, o) => luigi ? luigi.reagir(nom, o) : Promise.resolve();
  const dire = (texte, o) => luigi ? luigi.dire(texte, o) : Promise.resolve();
  const liberer = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    luigi?.liberer();
    luigi = null;
  };
  fins.push(() => {
    fini = true;
    liberer();
  });
  let place = null;
  const accompagnant = {
    nom: "Luigi",
    version: "vrai",
    qui: QUI,
    poser: async (objet3d, o = {}) => {
      const rendu = o.rendu || window.__pcvCasino?.rendu;
      place = { parent: objet3d, o };
      if (enCours) await enCours.catch(() => {
      });
      if (!luigi) await creer(rendu, objet3d, o);
      else {
        objet3d.add(luigi.objet);
        if (o.taille) luigi.regler(o.taille);
        if ("appui" in o) luigi.appuyer(o.appui);
      }
      return luigi.objet;
    },
    dire,
    reagir,
    maj,
    liberer: () => {
      place = null;
      liberer();
    },
    regarder: (v) => luigi?.regarder(v),
    get objet() {
      return luigi?.objet ?? null;
    },
    get pret() {
      return !!luigi;
    }
  };
  (window.__pcvAccompagnants ||= {})[QUI] = accompagnant;
  const brancher = () => {
    const c = window.__pcvCasino;
    if (!c || typeof c !== "object") return;
    let choix = null;
    try {
      choix = localStorage.getItem("pcv-casino-accompagnant");
    } catch (e) {
    }
    if (choix === QUI || !choix && !c.accompagnant) c.accompagnant = accompagnant;
  };
  brancher();
  addEventListener("pcv-casino", brancher);
  fins.push(() => removeEventListener("pcv-casino", brancher));
  fins.push(() => {
    if (window.__pcvCasino?.accompagnant === accompagnant) window.__pcvCasino.accompagnant = null;
    delete window.__pcvAccompagnants?.[QUI];
  });
  window.__pcvLuigiVrai = {
    creer,
    fabriquer: creerLuigi,
    reagir,
    dire,
    maj,
    liberer,
    accompagnant,
    REPLIQUES,
    EXPRESSIONS,
    GESTES: [...Object.keys(GESTES), "attente"],
    get objet() {
      return luigi?.objet ?? null;
    },
    get luigi() {
      return luigi;
    },
    reprise: () => place,
    fin: () => {
      for (const f of fins.splice(0)) f();
    }
  };
  if (reprise) accompagnant.poser(reprise.parent, reprise.o).catch((e) => {
    if (!fini) console.warn("luigi-vrai : reprise impossible", e);
  });
  return "luigi-vrai : pr\xEAt";
})();
