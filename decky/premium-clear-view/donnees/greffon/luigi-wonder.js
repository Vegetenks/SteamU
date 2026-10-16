(() => {
  window.__pcvLuigiWonder?.fin?.();
  const T = window.THREE, E = window.__pcvESM;
  if (!T || !E?.GLTFLoader) return "luigi-wonder : three.js ou son GLTFLoader absent";
  const FICHIER = "luigi/candidats/casino-luigi-wonder/casino-luigi-wonder.glb";
  const lisse = (x) => (x = Math.max(0, Math.min(1, x))) * x * (3 - 2 * x);
  const borne = (x, a, b) => Math.max(a, Math.min(b, x));
  const mix = (a, b, k) => a + (b - a) * k;
  const amortir = (x, cible, k, dt) => x + (cible - x) * (1 - Math.exp(-k * dt));
  const ecartAngle = (a, b) => {
    let d = (b - a) % (2 * Math.PI);
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    return d;
  };
  const entree = (t, a, b, d) => lisse(t / a) * (1 - lisse((t - (d - b)) / b));
  const lireModele = async (o) => {
    if (o.lire) return o.lire(FICHIER);
    const url = await window.__pcvRessource?.(FICHIER, "model/gltf-binary");
    if (!url) throw new Error("luigi-wonder : prive/" + FICHIER + " absent");
    try {
      return await (await fetch(url)).arrayBuffer();
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  const Y = new T.Vector3(0, 1, 0);
  const redresser = (clip) => {
    const piste = (n, p) => clip.tracks.find((t) => t.name === n + "." + p);
    const rr = piste("Rot_Root", "quaternion"), sr = piste("Skl_Root", "quaternion");
    if (rr && sr) {
      const q0 = new T.Quaternion().fromArray(rr.values, 0).multiply(new T.Quaternion().fromArray(sr.values, 0)), av = new T.Vector3(0, 0, 1).applyQuaternion(q0);
      const qc = new T.Quaternion().setFromAxisAngle(Y, -Math.atan2(av.x, av.z)), q = new T.Quaternion();
      for (let i = 0; i < rr.values.length; i += 4) {
        q.fromArray(rr.values, i).premultiply(qc).toArray(rr.values, i);
      }
    }
    const sp = piste("Skl_Root", "position");
    if (sp) {
      const x0 = sp.values[0], z0 = sp.values[2];
      for (let i = 0; i < sp.values.length; i += 3) {
        sp.values[i] -= x0;
        sp.values[i + 2] -= z0;
      }
    }
    clip.tracks = clip.tracks.filter((t) => !/^(Root|Interaction_Root|Rot_Root)\.position$/.test(t.name));
    return clip;
  };
  const GESTES = {
    accueil: { clip: ["GoalGreet"], visage: "Face004", main: "Hand005" },
    salut: { clip: ["GoalGreet"], visage: "Face004", main: "Hand005" },
    gagne: { clip: ["DemoJoy"], visage: "Face004", main: "Hand000" },
    bravo: { clip: ["GoalPerformance", "GoalPerformanceToWait"], visage: "Face004", main: "Hand005" },
    joie: { clip: ["DemoJoySt"], visage: "Face004", main: "Hand000" },
    regarde: { clip: ["WaitWonderPose"], visage: "Face004", main: "Hand003", tient: 0.5 },
    attente: { clip: ["GoalLookAround"], visage: "Face000" },
    salle: { clip: ["GoalLookAround"], visage: "Face000" },
    designer: { fait: "designer", visage: "Face000", main: "Hand005", duree: 1.9, clin: [1, 1.3] },
    rate: { fait: "decu", visage: "Face007", sourcils: "Eyebrow002", paupieres: "Eyelid003", duree: 2.4 },
    presque: { fait: "presque", visage: "Face004", sourcils: "Eyebrow001", duree: 2.2 },
    cartes: { fait: "cartes", main: "Hand001", duree: 2.8, objet: "cartes" },
    astiquer: { fait: "astiquer", main: "Hand001", duree: 3, objet: "chiffon" },
    noeud: { fait: "noeud", main: "Hand001", duree: 1.8 },
    ouvrir: { fait: "ouvrir", main: "Hand001", duree: 1.6 },
    porter: { fait: "porter", main: "Hand001", duree: 1e9 }
  };
  const REPOS = { clip: "GoalGreet", t: 0 };
  const ALLURE = {
    vMarche: 2.2,
    vCourse: 3.6,
    seuil: 0.3,
    cadenceMin: 1.3,
    foulee: 1.5,
    cadenceCourse: 2.05,
    appui: [0.6, 0.36],
    hauteur: [0.12, 0.22],
    baisse: [0.04, 0.1],
    rebond: [0.022, 0.05],
    penche: [0.07, 0.26],
    bras: [0.5, 0.75],
    coude: [0.3, 1],
    roulis: [0.05, 0.03],
    lacet: [0.12, 0.16],
    decale: [0.035, 0.015],
    pas: { duree: 0.2, hauteur: 0.1, seuil: 0.13, lacet: 0.45 }
  };
  const fabriquer = async (rendu, parent, o = {}) => {
    const gltf = await new Promise(async (ok, ko) => {
      try {
        new E.GLTFLoader().parse(await lireModele(o), "", ok, ko);
      } catch (e) {
        ko(e);
      }
    });
    const modele = gltf.scene, os = {}, jetables = [], pieces = [];
    modele.traverse((x) => {
      if (x.isBone) os[x.name] = x;
      if (x.isMesh) {
        x.frustumCulled = false;
        pieces.push(x);
        if (x.userData.cache) x.visible = false;
        const m = x.material, n = new T.MeshStandardMaterial({ map: m.map, roughness: /Cap|Body/.test(m.name) ? 0.5 : 0.65, metalness: 0, envMapIntensity: 0.6, transparent: m.transparent, alphaTest: m.alphaTest });
        if (m.map) m.map.colorSpace = T.SRGBColorSpace;
        m.dispose();
        x.material = n;
        jetables.push(n, x.geometry);
      }
    });
    const BESOIN = ["Skl_Root", "Head", "Neck", "Spine_1", "Spine_2", "Clavicle_L", "Clavicle_R", "Hair_Top"];
    for (const c of "LR") BESOIN.push(`Arm_1_${c}`, `Arm_2_${c}`, `Wrist_${c}`, `Leg_1_${c}`, `Leg_2_${c}`, `Ankle_${c}`, `Toe_${c}`);
    for (const n of BESOIN) if (!os[n]) throw new Error("luigi-wonder : os absent : " + n);
    const famille = (re) => pieces.filter((p) => re.test(p.name));
    const VISAGES = famille(/^Face\d{3}/), MAINS = famille(/^Hand\d{3}/), SOURCILS = famille(/^Eyebrow\d{3}/), PAUPIERES = famille(/^Eyelid\d{3}/);
    const montrer = (liste, prefixe) => {
      if (!liste.some((p) => p.name.startsWith(prefixe))) return;
      for (const p of liste) p.visible = p.name.startsWith(prefixe);
    };
    const NEUTRE = { visage: "Face000", main: "Hand004", sourcils: "Eyebrow000", paupieres: null };
    const objet = new T.Group();
    objet.name = "Luigi (Wonder)";
    const echelle = new T.Group();
    echelle.add(modele);
    objet.add(echelle);
    const mixer = new T.AnimationMixer(modele), clips = new Map(gltf.animations.map((c) => [c.name, redresser(c)]));
    const actions = /* @__PURE__ */ new Map(), action = (nom) => {
      if (actions.has(nom)) return actions.get(nom);
      const c = clips.get(nom);
      if (!c) return null;
      const a = mixer.clipAction(c);
      a.play();
      a.paused = true;
      a.setEffectiveWeight(0);
      actions.set(nom, a);
      return a;
    };
    const cRepos = clips.get(REPOS.clip).clone();
    cRepos.name = "repos";
    const repos = mixer.clipAction(cRepos);
    repos.play();
    repos.paused = true;
    repos.time = REPOS.t;
    repos.setEffectiveWeight(1);
    for (const n of clips.keys()) action(n);
    const tousOs = Object.values(os), sortie = tousOs.map((b) => [b.position.clone(), b.quaternion.clone(), b.scale.clone()]);
    const remettre = () => tousOs.forEach((b, i) => {
      const [p, q, s2] = sortie[i];
      b.position.copy(p);
      b.quaternion.copy(q);
      b.scale.copy(s2);
    });
    const retenir = () => tousOs.forEach((b, i) => {
      const [p, q, s2] = sortie[i];
      p.copy(b.position);
      q.copy(b.quaternion);
      s2.copy(b.scale);
    });
    const adulte = o.proportions === "adulte", cou0 = os.Head.position.clone();
    const proportions = () => {
      if (!adulte) return;
      os.Head.scale.setScalar(0.9);
      os.Head.position.copy(cou0).multiplyScalar(1.3);
      for (const n of ["Leg_1_L", "Leg_1_R", "Arm_1_L", "Arm_1_R"]) os[n]?.scale.setScalar(1.1);
    };
    remettre();
    mixer.update(0);
    retenir();
    proportions();
    modele.updateMatrixWorld(true);
    const H = new T.Box3().setFromObject(modele).getSize(new T.Vector3()).y || 1;
    const v1 = new T.Vector3(), v2 = new T.Vector3(), v3 = new T.Vector3(), q1 = new T.Quaternion(), q2 = new T.Quaternion();
    const loc = (b) => echelle.worldToLocal(b.getWorldPosition(new T.Vector3()));
    const JAMBE = {}, BRAS = {};
    for (const c of "LR") {
      const hanche = loc(os[`Leg_1_${c}`]), genou = loc(os[`Leg_2_${c}`]), cheville = loc(os[`Ankle_${c}`]), orteil = loc(os[`Toe_${c}`]);
      JAMBE[c] = {
        l1: hanche.distanceTo(genou),
        l2: genou.distanceTo(cheville),
        maison: new T.Vector3(cheville.x, 0, cheville.z),
        haut: cheville.y,
        avantPied: Math.hypot(orteil.x - cheville.x, orteil.z - cheville.z) + 0.03,
        talon: 0.05,
        q: echelle.getWorldQuaternion(new T.Quaternion()).invert().multiply(os[`Ankle_${c}`].getWorldQuaternion(new T.Quaternion()))
      };
      const epaule = loc(os[`Arm_1_${c}`]), coude = loc(os[`Arm_2_${c}`]), poignet = loc(os[`Wrist_${c}`]);
      BRAS[c] = { l1: epaule.distanceTo(coude), l2: coude.distanceTo(poignet) };
    }
    const l0 = JAMBE.L.l1 + JAMBE.L.l2;
    const L = {
      objet,
      modele,
      os: { wrist_l1: os.Wrist_L, wrist_r1: os.Wrist_R },
      taille: 1,
      geste: null,
      appui: o.appui ?? null,
      regard: null,
      regardVoulu: null,
      kRegard: [0, 0],
      cligne: 3,
      t: 0,
      kAppui: o.appui != null ? 1 : 0
    };
    const sol = (x, z) => o.sol ? o.sol(x, z) : objet.getWorldPosition(v3).y;
    let s = 1;
    L.regler = (t) => {
      L.taille = t;
      s = t / H;
      echelle.scale.setScalar(s);
    };
    const qo = new T.Quaternion(), qp = new T.Quaternion(), qw = new T.Quaternion(), qr = new T.Quaternion(), eu = new T.Euler();
    const tourner = (b, x, y, z) => {
      if (!x && !y && !z) return;
      eu.set(x, y, z, "YXZ");
      qr.setFromEuler(eu);
      echelle.getWorldQuaternion(qo);
      b.parent.getWorldQuaternion(qp);
      qw.copy(qo).multiply(qr).multiply(qo.clone().invert());
      b.quaternion.premultiply(qp.clone().invert().multiply(qw).multiply(qp));
      b.updateMatrixWorld(true);
    };
    const orienter = (b, de, vers, w) => {
      q1.setFromUnitVectors(de.normalize(), vers.normalize());
      if (w < 1) q1.slerp(q2.identity(), 1 - w);
      b.getWorldQuaternion(qw).premultiply(q1);
      b.parent.getWorldQuaternion(qp).invert();
      b.quaternion.copy(qp.multiply(qw));
      b.updateMatrixWorld(true);
    };
    const pa = new T.Vector3(), pb = new T.Vector3(), pc = new T.Vector3(), dir = new T.Vector3(), perp = new T.Vector3(), milieu = new T.Vector3(), but_ = new T.Vector3();
    const ik = (b1, b2, b3, cible, pole, l1, l2, w) => {
      if (w <= 1e-3) return;
      b1.getWorldPosition(pa);
      b2.getWorldPosition(pb);
      b3.getWorldPosition(pc);
      l1 *= s;
      l2 *= s;
      dir.copy(cible).sub(pa);
      const d = borne(dir.length(), Math.abs(l1 - l2) + 1e-4, (l1 + l2) * 0.999);
      dir.normalize();
      but_.copy(pa).addScaledVector(dir, d);
      const cosA = borne((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
      perp.copy(pole).addScaledVector(dir, -pole.dot(dir));
      if (perp.lengthSq() < 1e-8) perp.set(0, 0, 1);
      perp.normalize();
      milieu.copy(pa).addScaledVector(dir, l1 * cosA).addScaledVector(perp, l1 * Math.sqrt(1 - cosA * cosA));
      orienter(b1, v1.copy(pb).sub(pa), v2.copy(milieu).sub(pa), w);
      b2.getWorldPosition(pb);
      b3.getWorldPosition(pc);
      orienter(b2, v1.copy(pc).sub(pb), v2.copy(but_).sub(pb), w);
    };
    const chez = (x, y, z, v = new T.Vector3()) => objet.localToWorld(v.set(x * L.taille, y * L.taille, z * L.taille));
    const avant = new T.Vector3(), gauche = new T.Vector3();
    const OBJETS = {};
    {
      const dos = new T.MeshStandardMaterial({ color: 11739178, roughness: 0.5 }), tranche = new T.MeshStandardMaterial({ color: 16052454, roughness: 0.6 });
      const demi = () => {
        const m = new T.Mesh(new T.BoxGeometry(0.13, 0.045, 0.19), [tranche, tranche, dos, dos, tranche, tranche]);
        jetables.push(m.geometry);
        return m;
      };
      const g = new T.Group();
      g.name = "cartes";
      const a = demi(), b = demi();
      g.add(a, b);
      g.userData.moities = [a, b];
      OBJETS.cartes = g;
      jetables.push(dos, tranche);
      const geo = new T.PlaneGeometry(0.42, 0.34, 8, 6), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) p.setZ(i, 0.03 * Math.sin(p.getX(i) * 22 + p.getY(i) * 14) + 0.02 * Math.cos(p.getY(i) * 28));
      geo.computeVertexNormals();
      const chiffon = new T.Mesh(geo, new T.MeshStandardMaterial({ color: 15919572, roughness: 0.9, side: T.DoubleSide }));
      chiffon.name = "chiffon";
      OBJETS.chiffon = chiffon;
      jetables.push(geo, chiffon.material);
      for (const x of Object.values(OBJETS)) {
        x.visible = false;
        x.traverse((m) => {
          if (m.isMesh) {
            m.castShadow = true;
            m.frustumCulled = false;
          }
        });
        echelle.add(x);
      }
    }
    let gestes = [];
    const poids = (g) => g.sortie != null ? g.w0 * (1 - lisse((g.t - g.sortie) / 0.35)) : g.G.duree > 100 ? lisse(g.t / 0.3) : entree(g.t, g.G.clip ? 0.3 : 0.35, g.G.clip ? 0.45 : 0.4, g.duree);
    L.regarder = (v) => {
      L.regardVoulu = v ? v.clone() : null;
      if (!L.geste) L.regard = L.regardVoulu;
    };
    L.coupDOeil = () => {
      const a = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.4);
      objet.updateMatrixWorld(true);
      L.regard = objet.localToWorld(new T.Vector3(Math.sin(a) * 30, L.taille * 0.9, Math.cos(a) * 30));
      setTimeout(() => {
        if (!L.geste) L.regard = L.regardVoulu ?? null;
      }, 1600);
    };
    L.appuyer = (f) => {
      L.appui = f ?? null;
    };
    L.finir = () => {
      const g = L.geste;
      if (!g) return;
      L.geste = null;
      g.w0 = poids(g);
      g.sortie = g.t;
      L.regard = L.regardVoulu ?? null;
      g.fin?.();
    };
    L.reagir = (nom, o2 = {}) => {
      L.finir();
      const G = GESTES[nom];
      if (!G) return Promise.resolve();
      return new Promise((fin) => {
        const g = { nom, fin, t: 0, G, duree: G.duree ?? 2, vers: o2.vers?.clone() ?? null };
        if (G.clip) g.duree = G.clip.reduce((a, n) => a + (clips.get(n)?.duration ?? 0), 0) + 0.1;
        if (g.vers) L.regard = g.vers.clone();
        gestes.push(g);
        L.geste = g;
      });
    };
    L.dire = () => Promise.resolve();
    L.expression = () => {
    };
    let elan = 1;
    L.elan = (vers) => {
      elan = 0;
      if (vers) {
        L.regard = vers.clone();
        setTimeout(() => {
          if (!L.geste) L.regard = L.regardVoulu ?? null;
        }, 700);
      }
    };
    const pieds = { L: { cote: 1, pos: new T.Vector3(), lacet: 0, vol: null }, R: { cote: -1, pos: new T.Vector3(), lacet: 0, vol: null } };
    const M = { phase: 0, actif: false, k: 0, v: new T.Vector3(), vit: 0, acc: 0, avant: null, inertie: 0, inertieV: 0, plie: 0, plieV: 0, r: 0, foulee: 1, cadence: 1, appui: 0.6, init: false };
    const cap = () => {
      objet.getWorldDirection(avant);
      avant.y = 0;
      avant.normalize();
      return Math.atan2(avant.x, avant.z);
    };
    const maison = (c, v = new T.Vector3()) => {
      const J = JAMBE[c];
      echelle.localToWorld(v.set(J.maison.x, 0, J.maison.z));
      v.y = sol(v.x, v.z);
      return v;
    };
    const poser = (p) => {
      maison(p === pieds.L ? "L" : "R", p.pos);
      p.lacet = cap();
      p.vol = null;
    };
    L.allure = () => ({ marche: M.actif, vitesse: M.vit, course: M.r, phase: M.phase, foulee: M.foulee * l0 * s, cadence: M.cadence });
    const atterrissage = (c, reste, v) => {
      maison(c, v);
      const l = l0 * s, vd = M.v.clone();
      const n = vd.length();
      if (n > 1e-4) v.addScaledVector(vd, reste).addScaledVector(vd.divideScalar(n), M.foulee * l * M.appui / 2);
      v.y = sol(v.x, v.z);
      return v;
    };
    L.maj = (dt) => {
      dt = Math.min(dt, 0.1);
      L.t += dt;
      const t = L.t;
      objet.updateMatrixWorld(true);
      const ici = objet.getWorldPosition(new T.Vector3());
      const l = l0 * s;
      if (!M.init) {
        M.init = true;
        M.avant = ici.clone();
        for (const p of Object.values(pieds)) poser(p);
      }
      if (dt > 0) {
        const vb = ici.clone().sub(M.avant).setY(0).divideScalar(dt);
        if (vb.length() > 40 * l) vb.set(0, 0, 0);
        if (vb.length() > 40 * l || ici.distanceTo(M.avant) > 6 * l) {
          for (const p of Object.values(pieds)) poser(p);
          M.actif = false;
        }
        const av = M.vit;
        M.v.lerp(vb, 1 - Math.exp(-dt * 18));
        M.vit = M.v.length() / l;
        M.acc = amortir(M.acc, (M.vit - av) / dt, 12, dt);
      }
      M.avant.copy(ici);
      for (const g of gestes) g.t += dt;
      if (L.geste && L.geste.t >= L.geste.duree) L.finir();
      for (const g of gestes) g.w = poids(g);
      gestes = gestes.filter((g) => g === L.geste || g.w > 2e-3);
      const G = L.geste?.G, gc = L.geste;
      for (const a of actions.values()) a.setEffectiveWeight(0);
      let wClip = 0;
      for (const g of gestes) {
        if (!g.G.clip) continue;
        let tt = Math.min(g.t, g.duree - 0.1);
        for (const n of g.G.clip) {
          const a = action(n), d = clips.get(n)?.duration ?? 0;
          if (!a) continue;
          if (tt <= d || n === g.G.clip[g.G.clip.length - 1]) {
            a.time = Math.min(tt, d - 1e-3);
            a.setEffectiveWeight(a.getEffectiveWeight() + g.w);
            wClip += g.w;
            break;
          }
          tt -= d;
        }
      }
      if (wClip > 1) {
        for (const a of actions.values()) a.setEffectiveWeight(a.getEffectiveWeight() / wClip);
        wClip = 1;
      }
      if (L.force) {
        for (const a2 of actions.values()) a2.setEffectiveWeight(0);
        const a = action(L.force.clip);
        a.time = L.force.t;
        a.setEffectiveWeight(1);
        wClip = 1;
      }
      repos.setEffectiveWeight(1 - wClip);
      remettre();
      mixer.update(0);
      retenir();
      proportions();
      modele.updateMatrixWorld(true);
      if (L.force?.brut) return;
      const souple = 1 - wClip;
      const A = ALLURE, vit = M.vit;
      M.r = lisse((vit - A.vMarche) / (A.vCourse - A.vMarche));
      M.cadence = mix(Math.max(A.cadenceMin, vit / A.foulee), A.cadenceCourse, M.r);
      M.foulee = Math.max(0.05, vit / M.cadence);
      M.appui = mix(A.appui[0], A.appui[1], M.r);
      const veut = vit > A.seuil && souple > 0.5;
      if (veut && !M.actif) {
        M.actif = true;
        const d = M.v.clone().normalize(), eL = pieds.L.pos.clone().sub(ici).dot(d), eR = pieds.R.pos.clone().sub(ici).dot(d);
        const premier = pieds.L.vol ? "L" : pieds.R.vol ? "R" : eL <= eR ? "L" : "R";
        const s0 = pieds[premier].vol ? lisse(pieds[premier].vol.t / pieds[premier].vol.d) * 0.5 : 0;
        M.phase = (M.appui + s0 * (1 - M.appui) + (premier === "R" ? 0.5 : 0)) % 1;
        for (const c of "LR") {
          const p = pieds[c];
          if (p.vol) p.vol = { ...p.vol, cycle: true };
        }
      }
      if (M.actif) {
        const avance = vit * l * dt / (M.foulee * l);
        M.phase = (M.phase + avance) % 1;
        for (const c of "LR") {
          const p = pieds[c], ph = (M.phase + (c === "R" ? 0.5 : 0)) % 1;
          if (ph < M.appui) {
            if (p.vol) {
              atterrissage(c, 0, p.pos);
              p.lacet = cap();
              p.vol = null;
              p.pose = 0;
            }
            p.ph = ph / M.appui;
          } else {
            const sv = (ph - M.appui) / (1 - M.appui);
            if (!p.vol || !p.vol.cycle) p.vol = { de: p.pos.clone(), lacetDe: p.lacet, cycle: true };
            p.vol.s = sv;
            p.ph = null;
          }
        }
        if (!veut) {
          M.actif = false;
          for (const c of "LR") {
            const p = pieds[c];
            if (p.vol) p.vol = { de: p.vol.de, lacetDe: p.vol.lacetDe, t: (p.vol.s ?? 0) * A.pas.duree, d: A.pas.duree, h: A.hauteur[0] };
          }
        }
      }
      if (!M.actif) {
        const enVol = Object.values(pieds).some((p) => p.vol);
        if (!enVol && souple > 0.5) {
          let pire = null, e0 = 0;
          const lc = cap();
          for (const c of "LR") {
            const p = pieds[c], m = maison(c, v1), e = Math.hypot(m.x - p.pos.x, m.z - p.pos.z) / l, el = Math.abs(ecartAngle(p.lacet, lc));
            const note = e > A.pas.seuil || el > A.pas.lacet ? e + el * 0.4 : 0;
            if (note > e0) {
              e0 = note;
              pire = p;
            }
          }
          if (pire) pire.vol = { de: pire.pos.clone(), lacetDe: pire.lacet, t: 0, d: A.pas.duree, h: A.pas.hauteur };
        }
      }
      M.k = amortir(M.k, M.actif ? 1 : 0, 7, dt);
      const cibleInertie = 0.022 * Math.max(0, -M.acc) + 0.012 * Math.max(0, M.acc);
      M.inertieV += (90 * (cibleInertie - M.inertie) - 11 * M.inertieV) * dt;
      M.inertie += M.inertieV * dt;
      const ciblePlie = 0.012 * Math.max(0, -M.acc);
      M.plieV += (120 * (ciblePlie - M.plie) - 13 * M.plieV) * dt;
      M.plie += M.plieV * dt;
      elan = Math.min(1, elan + dt / 0.22);
      const kElan = elan < 1 ? Math.sin(Math.PI * elan) : 0;
      const r = M.r, km = M.k * souple, ph0 = M.phase - M.appui / 2;
      const rebond = mix(A.rebond[0], -A.rebond[1], r) * Math.cos(4 * Math.PI * ph0);
      let bas = (mix(A.baisse[0], A.baisse[1], r) - rebond) * km + M.plie + 0.05 * kElan;
      let lat = mix(A.decale[0], A.decale[1], r) * Math.cos(2 * Math.PI * ph0) * km, roulis = mix(A.roulis[0], A.roulis[1], r) * Math.sin(2 * Math.PI * ph0) * km;
      for (const c of "LR") {
        const p = pieds[c];
        if (p.vol && !p.vol.cycle) {
          const k = Math.sin(Math.PI * borne(p.vol.t / p.vol.d, 0, 1));
          lat -= p.cote * 0.03 * k;
          bas += 0.015 * k;
        }
      }
      const avantDe = (ph) => ph < M.appui ? Math.cos(Math.PI * ph / M.appui) : -Math.cos(Math.PI * (ph - M.appui) / (1 - M.appui));
      const fG = avantDe((M.phase % 1 + 1) % 1), fD = avantDe((M.phase + 0.5) % 1);
      const lacetB = -mix(A.lacet[0], A.lacet[1], r) * fG * km;
      const respire = Math.sin(t * 1.7), bascule = Math.sin(t * 0.45) * (1 - M.k) * souple;
      objet.getWorldDirection(avant);
      gauche.set(avant.z, 0, -avant.x);
      {
        const d = v1.copy(gauche).multiplyScalar((lat + 0.012 * bascule) * l0 * s).add(v2.set(0, -bas * l0 * s, 0)), par = os.Skl_Root.parent;
        par.getWorldQuaternion(qp).invert();
        os.Skl_Root.position.addScaledVector(d.applyQuaternion(qp), 1 / s);
        os.Skl_Root.updateMatrixWorld(true);
      }
      const penche = mix(A.penche[0], A.penche[1], r) * km * Math.min(1, vit / A.vMarche) + M.inertie - 0.1 * kElan;
      tourner(os.Skl_Root, penche, lacetB, roulis + 0.02 * bascule);
      tourner(os.Spine_1, 0.02 * respire, -lacetB * 1.6, -roulis * 1.3 - 0.025 * bascule);
      tourner(os.Spine_2, -0.35 * penche * km, 0, 0);
      let brasLibres = souple;
      for (const g of gestes) if (g.G.fait && !["decu", "presque"].includes(g.G.fait)) brasLibres *= 1 - g.w;
      if (L.kAppui > 0) brasLibres *= 1 - L.kAppui;
      if (brasLibres > 0.01) {
        const amp = mix(A.bras[0], A.bras[1], r) * km * brasLibres, coude = (mix(A.coude[0], A.coude[1], r) * km + 0.12) * brasLibres;
        const serre = (0.22 + 0.28 * r) * km * brasLibres;
        tourner(os.Arm_1_L, -amp * fD, 0, -serre);
        tourner(os.Arm_1_R, -amp * fG, 0, serre);
        tourner(os.Arm_2_L, -coude * (1 + 0.25 * fD), 0, 0);
        tourner(os.Arm_2_R, -coude * (1 + 0.25 * fG), 0, 0);
      }
      const appuiCible = L.appui != null && M.k < 0.3 && !G?.clip ? 1 : 0;
      L.kAppui = amortir(L.kAppui, appuiCible, 6, dt);
      const hTable = L.appui ?? 0.45, polesBras = (c) => v3.set(0, 0, 0).addScaledVector(avant, -1).addScaledVector(gauche, c === "L" ? 0.6 : -0.6).add(v2.set(0, -0.4, 0));
      objet.getWorldDirection(avant);
      gauche.set(avant.z, 0, -avant.x);
      const main = (c, cible, w) => ik(os[`Arm_1_${c}`], os[`Arm_2_${c}`], os[`Wrist_${c}`], cible, polesBras(c).clone(), BRAS[c].l1, BRAS[c].l2, w);
      let wAppui = L.kAppui * souple;
      for (const g of gestes) if (g.G.fait) wAppui *= 1 - g.w;
      if (wAppui > 0.01) {
        main("L", chez(0.21, hTable + 0.015, 0.17), wAppui);
        main("R", chez(-0.21, hTable + 0.015, 0.17), wAppui);
      }
      for (const g of gestes) {
        const w = g.w * souple;
        if (w < 5e-3 || !g.G.fait) continue;
        const f = g.G.fait, tg = g.t;
        if (f === "decu") {
          tourner(os.Spine_2, 0.3 * w, 0, 0);
          tourner(os.Clavicle_L, 0, 0, -0.22 * w);
          tourner(os.Clavicle_R, 0, 0, 0.22 * w);
          tourner(os.Head, (0.25 + 0.05 * Math.sin(tg * 2)) * w, 0.22 * Math.sin(tg * 1.6) * lisse((tg - 0.6) / 0.4) * w, 0);
        }
        if (f === "presque") {
          const sursaut = lisse(tg / 0.15) * (1 - lisse((tg - 0.5) / 0.3));
          tourner(os.Spine_2, -0.2 * sursaut * w, 0, 0);
          tourner(os.Clavicle_L, 0, 0, 0.3 * sursaut * w);
          tourner(os.Clavicle_R, 0, 0, -0.3 * sursaut * w);
          tourner(os.Head, (-0.18 * sursaut + 0.15 * Math.sin(tg * 8) * lisse((tg - 0.9) / 0.3)) * w, 0.22 * Math.sin(tg * 5) * lisse((tg - 0.9) / 0.3) * w, 0);
        }
        if (f === "cartes") {
          const b = Math.sin(tg * 13) * 0.012, rap = 0.14 + 0.025 * Math.sin(tg * 6.5);
          main("L", chez(rap, hTable + 0.045 + b, 0.2), w);
          main("R", chez(-rap, hTable + 0.045 - b, 0.2), w);
          tourner(os.Head, 0.22 * w, 0, 0);
        }
        if (f === "astiquer") {
          const a = tg * 5.5;
          main("R", chez(-0.1 + 0.1 * Math.cos(a), hTable + 0.02, 0.23 + 0.06 * Math.sin(a)), w);
          main("L", chez(0.21, hTable + 0.015, 0.17), w);
          tourner(os.Spine_2, 0.16 * w, 0.08 * Math.sin(a) * w, 0);
          tourner(os.Head, 0.28 * w, 0.12 * Math.sin(a) * w, 0);
        }
        if (f === "noeud") {
          os.Neck.getWorldPosition(v1);
          const col = v1.addScaledVector(avant, 0.1 * L.taille).add(v2.set(0, -0.035 * L.taille, 0)), tire = 0.012 * Math.sin(tg * 9) * lisse((tg - 0.4) / 0.2) * (1 - lisse((tg - 1.2) / 0.2));
          main("L", col.clone().addScaledVector(gauche, 0.035 * L.taille + tire * L.taille), w);
          main("R", col.clone().addScaledVector(gauche, -0.035 * L.taille + tire * L.taille), w);
          tourner(os.Head, -0.15 * w, 0, 0);
        }
        if (f === "porter") {
          main("L", chez(0.1, 0.4, 0.17), w);
          main("R", chez(-0.1, 0.4, 0.17), w);
        }
        if (f === "ouvrir") {
          const k = lisse(tg / 0.8);
          main("L", chez(0.1, hTable + 0.06 + 0.06 * k, 0.2), w);
          main("R", chez(-0.1, hTable + 0.06 + 0.06 * k, 0.2), w);
          tourner(os.Head, 0.2 * w, 0, 0);
        }
        if (f === "designer" && g.vers) {
          const loc_ = objet.worldToLocal(g.vers.clone()), c = loc_.x >= 0 ? "L" : "R", sg = c === "L" ? 1 : -1, k = lisse(tg / 0.45);
          tourner(os.Spine_1, 0, sg * 0.22 * w * k, 0);
          os[`Arm_1_${c}`].getWorldPosition(v1);
          const vers = g.vers.clone().sub(v1);
          vers.y = Math.min(vers.y, 0.1 * L.taille);
          vers.normalize();
          main(c, v1.clone().addScaledVector(vers, (BRAS[c].l1 + BRAS[c].l2) * s * 0.9).add(v2.set(0, -0.04 * L.taille, 0)), w * k);
          if (tg > 0.9 && L.regardVoulu && L.regard !== L.regardVoulu) L.regard = L.regardVoulu;
        }
      }
      let [px, py] = [0, 0];
      if (L.regard) {
        const lr = echelle.worldToLocal(L.regard.clone()), tete = echelle.worldToLocal(os.Head.getWorldPosition(new T.Vector3()));
        const d = lr.sub(tete);
        py = borne(Math.atan2(d.x, d.z), -0.9, 0.9);
        px = borne(-Math.atan2(d.y, Math.hypot(d.x, d.z)), -0.4, 0.4);
      }
      L.kRegard = L.kRegard.map((k, i) => amortir(k, [px, py][i], 6, dt));
      tourner(os.Neck, L.kRegard[0] * souple * 0.3, L.kRegard[1] * souple * 0.35, 0);
      tourner(os.Head, L.kRegard[0] * souple * 0.5, L.kRegard[1] * souple * 0.5, 0);
      for (const c of "LR") {
        const p = pieds[c], J = JAMBE[c];
        if (souple < 0.999) {
          os[`Ankle_${c}`].getWorldPosition(v1);
          p.pos.set(v1.x, sol(v1.x, v1.z), v1.z);
          p.lacet = cap();
          if (souple < 0.5) {
            p.vol = null;
            continue;
          }
        }
        let lever = 0, tangage = 0, lacet = p.lacet;
        if (p.vol?.cycle) {
          const sv = p.vol.s ?? 0, rest = (1 - sv) * (1 - M.appui) / M.cadence, cible = atterrissage(c, rest, v1), k = lisse(sv);
          p.cour = (p.cour || new T.Vector3()).lerpVectors(p.vol.de, cible, k);
          lever = mix(A.hauteur[0], A.hauteur[1], r) * l * Math.pow(Math.sin(Math.PI * sv), 0.8);
          tangage = mix(0.5 * (1 - lisse(sv / 0.35)), -0.28 * lisse((sv - 0.6) / 0.4), lisse((sv - 0.3) / 0.2));
          lacet = p.vol.lacetDe + ecartAngle(p.vol.lacetDe, cap()) * k;
        } else if (p.vol) {
          p.vol.t += dt;
          const sv = borne(p.vol.t / p.vol.d, 0, 1), k = lisse(sv), cible = maison(c, v1);
          p.cour = (p.cour || new T.Vector3()).lerpVectors(p.vol.de, cible, k);
          lever = p.vol.h * l * Math.sin(Math.PI * sv);
          tangage = -0.15 * Math.sin(Math.PI * sv);
          lacet = p.vol.lacetDe + ecartAngle(p.vol.lacetDe, cap()) * k;
          if (sv >= 1) {
            p.pos.copy(cible);
            p.lacet = cap();
            p.vol = null;
          }
        }
        if (!p.vol) {
          p.cour = (p.cour || new T.Vector3()).copy(p.pos);
          if (M.actif && p.ph != null) tangage = -0.22 * (1 - lisse(p.ph / 0.2)) * (1 - r * 0.6) + 0.5 * lisse((p.ph - 0.65) / 0.35) * km;
        }
        const pied = p.cour;
        pied.y = p.vol ? mix(sol(pied.x, pied.z), sol(pied.x, pied.z), 1) : sol(pied.x, pied.z);
        const hBascule = tangage > 0 ? J.avantPied * Math.sin(tangage) : J.talon * Math.sin(-tangage);
        const cib = v2.set(pied.x, pied.y + (J.haut + hBascule) * s + lever, pied.z);
        const pole = v3.set(Math.sin(lacet), 0, Math.cos(lacet)).addScaledVector(gauche, p.cote * 0.15);
        const wj = borne((souple - 0.5) * 2, 0, 1);
        ik(os[`Leg_1_${c}`], os[`Leg_2_${c}`], os[`Ankle_${c}`], cib.clone(), pole.clone(), J.l1, J.l2, wj);
        q1.setFromAxisAngle(Y, lacet);
        q2.setFromAxisAngle(v1.set(Math.cos(lacet), 0, -Math.sin(lacet)), tangage);
        const qMonde = q2.multiply(q1).multiply(J.q), an = os[`Ankle_${c}`];
        an.parent.getWorldQuaternion(qp).invert();
        qw.copy(qp).multiply(qMonde);
        an.quaternion.slerp(qw, wj);
        an.updateMatrixWorld(true);
        if (tangage > 0.05) tourner(os[`Toe_${c}`], -tangage * 0.8 * wj, 0, 0);
      }
      const tenu = (nom) => gestes.reduce((a, g) => g.G.objet === nom ? Math.max(a, g.w) : a, 0);
      {
        const k = lisse((tenu("cartes") - 0.35) / 0.3), C = OBJETS.cartes;
        C.visible = k > 0.01;
        if (C.visible) {
          const mL = echelle.worldToLocal(os.Wrist_L.getWorldPosition(v1)), mR = echelle.worldToLocal(os.Wrist_R.getWorldPosition(v2)), centre = mL.clone().add(mR).multiplyScalar(0.5);
          const [a, b] = C.userData.moities, battre = Math.sin(L.t * 13);
          for (const [m, sg] of [[a, 1], [b, -1]]) {
            m.position.copy(centre).add(v3.set(sg * (0.1 + 0.04 * battre), 0.05 + 0.03 * sg * battre, 0.2));
            m.rotation.set(0, 0, sg * (0.25 + 0.2 * Math.abs(battre)));
            m.scale.setScalar(k);
          }
        }
      }
      {
        const k = lisse((tenu("chiffon") - 0.35) / 0.3), C = OBJETS.chiffon;
        C.visible = k > 0.01;
        if (C.visible) {
          const m = echelle.worldToLocal(os.Wrist_R.getWorldPosition(v1));
          C.position.set(m.x - 0.05, (L.appui ?? 0.45) * H + 0.012, m.z + 0.2);
          C.rotation.set(-Math.PI / 2, 0, 0.4 * Math.sin(L.t * 5.5));
          C.scale.setScalar(k);
        }
      }
      const dom = gestes.reduce((a, g) => g.w > (a?.w ?? 0.25) ? g : a, null)?.G;
      const pose = (cle) => dom && dom[cle] || NEUTRE[cle];
      montrer(VISAGES, M.k > 0.5 && !dom ? r > 0.5 ? "Face002" : "Face001" : pose("visage"));
      montrer(MAINS, pose("main"));
      montrer(SOURCILS, pose("sourcils"));
      L.cligne -= dt;
      const clin = gc?.G.clin && gc.t > gc.G.clin[0] && gc.t < gc.G.clin[1];
      const paup = pose("paupieres") || (L.cligne < 0 || clin ? "Eyelid001" : null);
      for (const p of PAUPIERES) p.visible = !!paup && p.name.startsWith(paup);
      if (L.cligne < -0.12) L.cligne = 2 + Math.random() * 4;
    };
    L.poseClip = (nom, t, brut = true) => {
      L.force = nom ? { clip: nom, t, brut } : null;
      L.maj(0);
    };
    L.clips = [...clips.keys()];
    L.liberer = () => {
      L.finir();
      mixer.stopAllAction();
      objet.removeFromParent();
      for (const x of jetables) x.dispose?.();
    };
    L.regler(o.taille ?? 1);
    if (parent) parent.add(objet);
    L.maj(0);
    return L;
  };
  window.__pcvLuigiWonder = { fabriquer, GESTES: Object.keys(GESTES), fin: () => {
  } };
  return "luigi-wonder : pr\xEAt";
})();
