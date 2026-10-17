(() => {
  const PPM = 20;
  const REGLAGES = {
    pas: 1 / 120,
    sousPasMax: 6,
    iterV: 10,
    iterP: 8,
    gravite: 800,
    vmax: 360,
    // px/s², px/s (vidéos officielles)
    frottement: 0.6,
    rebond: 0.02,
    densite: 1,
    rebondTerrain: 0.75,
    // (14/10) le « terrain rebondissant » du jeu (objets « Jump », fréquents avec la bombe)
    // (14/10) la bombe : rayon (unités du modèle), mèche 40 images à 30 i/s (AnCaObBombFuseBurn), souffle : rayon (px de
    // l'écran) et vitesse donnée au centre ; (14/10 : un souffle court, « les badges bougent peu » dans le jeu réel)
    // (15/10, retour de l'auteur : « le souffle ne fait presque rien, seul le choc de la bombe fait bouger les badges ») un
    // souffle franc qui projette les badges autour, par consigne de l'auteur, même si ça s'éloigne du jeu réel
    bombe: { rayon: 0.9, meche: 40 / 30, souffle: 130, vitesse: 420 },
    murs: [0, 400],
    hautMurs: 30,
    epaisseurMur: 40,
    // les deux parois (x écran) ; au-dessus de hautMurs, un objet du décor passe devant la pince
    murHaut: -160,
    // (14/10) les parois montent jusqu'en haut de la vitrine : rien ne passe derrière les poteaux
    sortie: 240 + 40,
    // un corps plus bas que cela est sorti (goulotte)
    pince: {
      unite: 19.8,
      // px par unité du modèle (camera CrSt_Cam_Play)
      ouverture: 55 * Math.PI / 180,
      // butée haute
      vitesseOuvrir: 55 * Math.PI / 180 / 1.3,
      vitesseFermer: 55 * Math.PI / 180 / 1.4,
      // P03 : 1,3 s et 1,4 s
      couple: 600,
      // N·m (unités Box2D) : la force de la prise ; 14/10 : 30 % au robot du casino (318 parties, avec la tenue PRISE_VRAIE de casino.js)
      coupleOuvert: 300,
      // ouverte : les bras tiennent leur ouverture et écartent les badges ; un badge coincé entre eux les fait céder un peu
      densiteBras: 1,
      frottementBras: 0.9,
      // (14/10, retour de l'auteur : « des morceaux de plateau en hauteur empêchent d'atteindre les badges du dessous »)
      // contre le décor, seules comptent les pointes (Lo_ArmL_edge, le point de collision du modèle) et le moyeu : le
      // reste des bras, en 2,5D, passe devant les plateaux et les chevilles, comme dans le jeu. « tout » : l'ancien choix
      brasDecor: "pointes",
      rayonPointe: 0.3
      // unités du modèle
    }
  };
  const BRAS = [
    [[-0.1, 0.27], [0.38, 0.02], [-0.24, -0.72], [-1.18, -0.72], [-0.95, -0.45]],
    [[-1.18, -0.72], [-0.24, -0.72], [0.02, -1.3], [-0.3, -1.46], [-1.06, -1.38], [-1.26, -1.04]],
    [[-0.92, -1.42], [0.08, -1.4], [1.65, -2.38], [2.04, -2.52], [1.98, -2.74], [0.84, -2.77]]
  ];
  const ARTIC = [1.697, -0.437];
  const MOYEU = { rx: 1.82, ry: 1.15 };
  const GROUPE_PINCE = -7;
  const DECOR = 2;
  const ARRET = { force: 1200, images: 2, plie: 0.5, recul: 3, enfonce: 1.5, imagesCoince: 30 };
  const MARGE_MUR = Math.ceil(MOYEU.rx * 19.8) + 3;
  const aire = (P) => {
    let a = 0;
    for (let i = 0; i < P.length; i++) {
      const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % P.length];
      a += x0 * y1 - x1 * y0;
    }
    return a / 2;
  };
  const enveloppe = (pts) => {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (p.length < 3) return p;
    const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = [];
    for (const q of p) {
      while (lo.length >= 2 && x(lo[lo.length - 2], lo[lo.length - 1], q) <= 1e-9) lo.pop();
      lo.push(q);
    }
    for (let i = p.length - 1; i >= 0; i--) {
      const q = p[i];
      while (hi.length >= 2 && x(hi[hi.length - 2], hi[hi.length - 1], q) <= 1e-9) hi.pop();
      hi.push(q);
    }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  };
  const nettoyer = (P, aireMin = 1.5) => {
    const q = [];
    for (const p of P) if (!q.some((r) => Math.hypot(r[0] - p[0], r[1] - p[1]) < 0.35)) q.push(p);
    const h = enveloppe(q);
    if (h.length < 3 || Math.abs(aire(h)) < aireMin) return [];
    if (h.length <= 8) return [h];
    const out = [];
    for (let i = 1; i < h.length - 1; i += 6) out.push([h[0], ...h.slice(i, Math.min(h.length, i + 7))]);
    return out.filter((x) => x.length >= 3 && Math.abs(aire(x)) >= aireMin);
  };
  const fusionner = (polys) => {
    let L = polys.filter((P) => P.length >= 3).map((P) => P.slice());
    const cle = (p) => p[0].toFixed(1) + "," + p[1].toFixed(1);
    for (let encore = true; encore; ) {
      encore = false;
      fin: for (let i = 0; i < L.length; i++) for (let k = i + 1; k < L.length; k++) {
        const A = L[i], B = L[k], ka = new Set(A.map(cle)), communs = B.filter((p) => ka.has(cle(p))).length;
        if (communs < 2) continue;
        const h = enveloppe([...A, ...B]);
        if (h.length > 8) continue;
        if (Math.abs(Math.abs(aire(h)) - Math.abs(aire(A)) - Math.abs(aire(B))) > 0.5) continue;
        L[i] = h;
        L.splice(k, 1);
        encore = true;
        break fin;
      }
    }
    return L;
  };
  const bordsExt = (polys) => {
    const k = (a, b) => a[0].toFixed(1) + "," + a[1].toFixed(1) + ":" + b[0].toFixed(1) + "," + b[1].toFixed(1), n = /* @__PURE__ */ new Map(), L = [];
    for (const P of polys) for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      n.set(k(a, b), (n.get(k(a, b)) || 0) + 1);
      L.push([a, b]);
    }
    return L.filter(([a, b]) => !n.has(k(b, a))).map(([a, b]) => [a[0], a[1], b[0], b[1]]);
  };
  const creer = (o = {}) => {
    const pl = window.planck;
    if (!pl) throw new Error("casino-physique : planck.js absent");
    const R = { ...REGLAGES, ...o.reglages || {}, pince: { ...REGLAGES.pince, ...o.reglages?.pince || {} } };
    const V = (x, y) => new pl.Vec2(x / PPM, y / PPM);
    const monde = new pl.World({ gravity: new pl.Vec2(0, R.gravite / PPM) });
    const badges = /* @__PURE__ */ new Set(), accs = /* @__PURE__ */ new Set(), evts = [], ignores = /* @__PURE__ */ new Map();
    const prises = /* @__PURE__ */ new Map();
    let reste = 0, pince = null;
    const cle = (a, b) => a.__id < b.__id ? a.__id + ":" + b.__id : b.__id + ":" + a.__id;
    let nId = 0;
    const fixe = monde.createBody({ type: "static" });
    for (const x of R.murs) {
      if ((R.murHaut ?? R.hautMurs) < R.hautMurs) fixe.createFixture(new pl.Edge(V(x, R.murHaut ?? R.hautMurs), V(x, R.hautMurs)), { friction: 0.2, filterGroupIndex: GROUPE_PINCE }).__mur = true;
      const x1 = x + (x > 0 ? R.epaisseurMur : -R.epaisseurMur);
      fixe.createFixture(new pl.Polygon([V(x, R.hautMurs), V(x1, R.hautMurs), V(x1, R.sortie + 200), V(x, R.sortie + 200)]), { friction: 0.2 }).__mur = true;
    }
    fixe.__type = "decor";
    monde.on("pre-solve", (c) => {
      const a = c.getFixtureA().getBody(), b = c.getFixtureB().getBody();
      if (a.__badge && b.__badge && ignores.has(cle(a, b))) c.setEnabled(false);
    });
    monde.on("post-solve", (c, imp) => {
      const a = c.getFixtureA().getBody(), b = c.getFixtureB().getBody();
      const pc = a.__type === "pince" ? a : b.__type === "pince" ? b : null;
      if (!pc || !pince) return;
      let f = 0;
      for (const x of imp.normalImpulses) f += x;
      pc.__force = (pc.__force || 0) + f / R.pas;
      const autre = pc === a ? b : a;
      if ((pc === a ? c.getFixtureB() : c.getFixtureA()).__mur) return;
      if (autre.__badge) pc.__forceBadge = (pc.__forceBadge || 0) + f / R.pas;
      const wm = c.getWorldManifold(null);
      if (!wm) return;
      if (autre.__badge) for (let k = 0; k < c.getManifold().pointCount; k++) pc.__enfonce = Math.max(pc.__enfonce || 0, -wm.separations[k] * PPM);
      const ny = pc === a ? wm.normal.y : -wm.normal.y, haut = ny * f / R.pas;
      if (haut <= 0) return;
      pc.__forceHaut = (pc.__forceHaut || 0) + haut;
      if (autre.__type === "decor") pc.__forceDur = (pc.__forceDur || 0) + haut;
    });
    monde.on("begin-contact", (c) => {
      const a = c.getFixtureA().getBody(), b = c.getFixtureB().getBody();
      const ba = a.__badge, bb = b.__badge;
      if (!ba && !bb) return;
      const pinceA = a.__type === "pince", pinceB = b.__type === "pince";
      if (pinceA || pinceB) {
        const bd = ba || bb;
        if (bd && !bd.__parPince) {
          bd.__parPince = true;
        }
        evts.push({ type: "choc", b: bd, pince: true });
        return;
      }
      const va = a.getLinearVelocity(), vb = b.getLinearVelocity(), dv = Math.hypot(va.x - vb.x, va.y - vb.y) * PPM;
      if (dv > 60) evts.push({ type: "pose", b: ba || bb, force: dv });
    });
    fixe.__bords = R.murs.map((x) => [x, R.murHaut ?? R.hautMurs, x, R.sortie + 200]);
    const decor = (objets) => {
      for (const ob of objets || []) {
        const f = ob.phys ? ob.phys[1] : ob.glisse ? 0 : R.frottement, qs = fusionner((ob.polys || []).flatMap((P) => nettoyer(P)));
        const devant = qs.some((q) => q.some(([, y]) => y < R.hautMurs));
        for (const q of qs) fixe.createFixture(new pl.Polygon(q.map(([x, y]) => V(x, y))), { friction: f, restitution: ob.rebond ? R.rebondTerrain : 0, filterGroupIndex: devant ? GROUPE_PINCE : 0, filterCategoryBits: DECOR });
        fixe.__bords.push(...bordsExt(qs));
      }
    };
    const badge = (d) => {
      const s = d.ech || 0.5, sx = s, sy = s;
      const corps = monde.createBody({ type: "dynamic", position: V(d.x, d.y), angle: d.rot || 0, awake: !d.fige, allowSleep: true, angularDamping: 0.6, linearDamping: 0.05 });
      const frott = d.phys ? Math.max(0.05, d.phys[1]) : R.frottement;
      const garnir = (polys) => {
        for (let f = corps.getFixtureList(); f; ) {
          const g = f.getNext();
          corps.destroyFixture(f);
          f = g;
        }
        const pieces = fusionner((polys || []).flatMap((P) => nettoyer(P.map(([u, v]) => [(u - 64) * sx, (v - 64) * sy]))));
        let n = 0;
        for (const q of pieces) {
          corps.createFixture(new pl.Polygon(q.map(([x, y]) => V(x, y))), { density: R.densite, friction: frott, restitution: R.rebond });
          n++;
        }
        if (!n) corps.createFixture(new pl.Circle(V(0, 0), (d.r || 30) / PPM), { density: R.densite, friction: frott, restitution: R.rebond });
        corps.__bords = n ? bordsExt(pieces) : Array.from({ length: 16 }, (_, k) => {
          const r = d.r || 30, a = k / 16 * Math.PI * 2, b2 = (k + 1) / 16 * Math.PI * 2;
          return [Math.cos(a) * r, Math.sin(a) * r, Math.cos(b2) * r, Math.sin(b2) * r];
        });
        return n;
      };
      garnir(d.polys);
      const b = {
        forme: garnir,
        corps,
        donnees: d.donnees,
        fige: !!d.fige,
        touche: !d.fige,
        r: d.r || 30,
        lire() {
          const p = corps.getPosition();
          return { x: p.x * PPM, y: p.y * PPM, a: corps.getAngle(), eveille: corps.isAwake(), touche: b.touche };
        },
        point(u, v) {
          const p = corps.getWorldPoint(V((u - 64) * sx, (v - 64) * sy));
          return [p.x * PPM, p.y * PPM];
        },
        vitesse() {
          const v = corps.getLinearVelocity();
          return [v.x * PPM, v.y * PPM];
        },
        reveiller() {
          b.reveille = true;
          corps.setAwake(true);
        },
        // (15/10) la boîte de sa forme, px de l'écran : [x0, y0, x1, y1]
        boite() {
          const q = [1e9, 1e9, -1e9, -1e9];
          for (let f = corps.getFixtureList(); f; f = f.getNext()) {
            const a = f.getAABB(0);
            q[0] = Math.min(q[0], a.lowerBound.x * PPM);
            q[1] = Math.min(q[1], a.lowerBound.y * PPM);
            q[2] = Math.max(q[2], a.upperBound.x * PPM);
            q[3] = Math.max(q[3], a.upperBound.y * PPM);
          }
          return q;
        }
      };
      corps.__badge = b;
      corps.__id = ++nId;
      corps.__type = "badge";
      badges.add(b);
      return b;
    };
    const retirer = (b) => {
      if (!badges.has(b)) return;
      badges.delete(b);
      prises.delete(b);
      for (const k of [...ignores.keys()]) if (ignores.get(k).includes(b)) ignores.delete(k);
      monde.destroyBody(b.corps);
    };
    const chevauchent = (A, B) => {
      const xa = A.getTransform(), xb = B.getTransform();
      for (let fa = A.getFixtureList(); fa; fa = fa.getNext()) for (let fb = B.getFixtureList(); fb; fb = fb.getNext())
        if (pl.testOverlap(fa.getShape(), 0, fb.getShape(), 0, xa, xb)) return true;
      return false;
    };
    const croiser = (neufs) => {
      const L = [...badges];
      for (const a of neufs || L) for (const b of L) {
        if (a === b || ignores.has(cle(a.corps, b.corps))) continue;
        if (chevauchent(a.corps, b.corps)) ignores.set(cle(a.corps, b.corps), [a, b]);
      }
    };
    const accessoire = (d) => {
      const sx = d.sx || 1, sy = d.sy || 1;
      const corps = monde.createBody({ type: d.genre === "fixe" ? "static" : "dynamic", position: V(d.x, d.y), angle: d.rot || 0, awake: !d.fige, allowSleep: true, angularDamping: 0.6, linearDamping: 0.05 });
      const frott = d.phys ? Math.max(0.05, d.phys[1]) : R.frottement;
      const pieces = fusionner((d.polys || []).flatMap((P) => nettoyer(P.map(([u, v]) => [(u - d.w / 2) * sx, (v - d.h / 2) * sy]))));
      for (const q of pieces) corps.createFixture(new pl.Polygon(q.map(([x, y]) => V(x, y))), { density: R.densite, friction: frott, restitution: R.rebond });
      if (!pieces.length) corps.createFixture(new pl.Circle(V(0, 0), 6 / PPM), { density: R.densite, friction: frott });
      if (d.genre === "pivot") monde.createJoint(new pl.RevoluteJoint({}, fixe, corps, V(d.x, d.y)));
      corps.__bords = bordsExt(pieces);
      corps.__id = ++nId;
      const a = {
        corps,
        donnees: d.donnees,
        fige: !!d.fige,
        genre: d.genre,
        lire() {
          const p = corps.getPosition();
          return { x: p.x * PPM, y: p.y * PPM, a: corps.getAngle(), sorti: !!a.sorti };
        }
      };
      if (d.genre === "fixe") corps.__type = "decor";
      else {
        corps.__type = "acc";
        corps.__acc = a;
        accs.add(a);
      }
      return a;
    };
    const souder = (b, a) => {
      if (!b || !a || a.genre === "fixe") return;
      const p = b.corps.getPosition();
      monde.createJoint(new pl.WeldJoint({}, a.corps, b.corps, p));
      b.soude = a;
    };
    let laBombe = null;
    const bombe = (x, y, vx = 0, vy = 0) => {
      if (laBombe) monde.destroyBody(laBombe);
      laBombe = monde.createBody({ type: "dynamic", position: V(x, y), bullet: true, allowSleep: false, angularDamping: 0.8 });
      laBombe.createFixture(new pl.Circle(V(0, 0), R.bombe.rayon * R.pince.unite / PPM), { density: 2, friction: 0.6, restitution: 0.3, filterGroupIndex: GROUPE_PINCE });
      laBombe.setLinearVelocity(new pl.Vec2(vx / PPM, vy / PPM));
      laBombe.__type = "pince";
      return laBombe;
    };
    const exploser = (x, y) => {
      const B_ = R.bombe, touches = [];
      if (laBombe) {
        monde.destroyBody(laBombe);
        laBombe = null;
      }
      for (const e of [...badges, ...accs]) {
        const c = e.corps, p = c.getPosition(), dx = p.x * PPM - x, dy = p.y * PPM - y, d = Math.hypot(dx, dy);
        if (d > B_.souffle + 20) continue;
        const k = Math.max(0, 1 - d / (B_.souffle + 20)), v = B_.vitesse * k / PPM, ux = d > 1e-3 ? dx / d : 0, uy = d > 1e-3 ? dy / d : -1;
        e.reveille = true;
        c.setAwake(true);
        c.applyLinearImpulse(new pl.Vec2(ux * v * c.getMass(), (uy - 0.35) * v * c.getMass()), c.getWorldCenter(), true);
        if (badges.has(e)) {
          e.__parPince = true;
          touches.push(e);
        }
      }
      return touches;
    };
    const couvert = (b) => {
      const p = b.corps.getPosition(), r = b.r / PPM;
      return [-0.5, 0, 0.5].every((k) => {
        let dur = false;
        monde.rayCast(new pl.Vec2(p.x + k * r, p.y), new pl.Vec2(p.x + k * r, R.murHaut / PPM), (f) => {
          if (f.getBody() !== fixe || f.getFilterGroupIndex() === GROUPE_PINCE || f.getShape().getType() === "edge" || f.__mur) return -1;
          dur = true;
          return 0;
        });
        return dur;
      });
    };
    const creerPince = (o2 = {}) => {
      const P = R.pince, U = P.unite;
      const moyeu = monde.createBody({ type: "kinematic", position: V(200, -60) });
      moyeu.__type = "pince";
      const ov = Array.from({ length: 8 }, (_, k) => {
        const t = k / 8 * Math.PI * 2;
        return V(Math.cos(t) * MOYEU.rx * U, Math.sin(t) * MOYEU.ry * U);
      });
      moyeu.createFixture(new pl.Polygon(ov), { friction: 0.5, filterGroupIndex: GROUPE_PINCE });
      const bras = [-1, 1].map((sg) => {
        const ancre = [sg * ARTIC[0] * U, -ARTIC[1] * U];
        const b = monde.createBody({ type: "dynamic", position: V(200 + ancre[0], -60 + ancre[1]), gravityScale: 0, angularDamping: 2, linearDamping: 0.5, allowSleep: false, bullet: true });
        b.__type = "pince";
        b.__sg = sg;
        for (const morceau of BRAS) {
          const q = enveloppe(morceau.map(([x, y]) => [-sg * x * U, -y * U]));
          b.createFixture(new pl.Polygon(q.map(([x, y]) => V(x, y))), { density: P.densiteBras, friction: P.frottementBras, filterGroupIndex: GROUPE_PINCE, filterMaskBits: o2.sansBras ? 0 : P.brasDecor === "tout" ? 65535 : 65535 & ~DECOR });
        }
        if (P.brasDecor !== "tout") b.createFixture(new pl.Circle(V(-sg * 1.697 * U, 2.653 * U), P.rayonPointe * U / PPM), { density: P.densiteBras, friction: P.frottementBras, filterGroupIndex: GROUPE_PINCE, filterMaskBits: o2.sansBras ? 0 : 65535 });
        const j = monde.createJoint(new pl.RevoluteJoint({
          enableMotor: true,
          maxMotorTorque: P.coupleOuvert,
          motorSpeed: 0,
          enableLimit: true,
          lowerAngle: sg < 0 ? 0 : -P.ouverture,
          upperAngle: sg < 0 ? P.ouverture : 0
        }, moyeu, b, V(200 + ancre[0], -60 + ancre[1])));
        return { b, j, sg, ancre, contacts: 0, decor: 0 };
      });
      let cible = { x: 200, y: -60, phi: 0 }, ouvrir = 1, couple = null;
      const touche = (corps) => {
        for (let e = corps.getContactList(); e; e = e.next) if (e.contact.isTouching() && e.contact.isEnabled() && e.other.__type !== "pince") return true;
        return false;
      };
      const angle = (k) => bras[k].j.getJointAngle() * -bras[k].sg;
      const placer = (x, y, phi, a) => {
        moyeu.setTransform(V(x, y), -phi);
        moyeu.setLinearVelocity(new pl.Vec2(0, 0));
        moyeu.setAngularVelocity(0);
        for (const B of bras) {
          const ang = -phi - B.sg * a, c = Math.cos(-phi), s = Math.sin(-phi), [ax, ay] = B.ancre;
          B.b.setTransform(V(x + ax * c - ay * s, y + ax * s + ay * c), ang);
          B.b.setLinearVelocity(new pl.Vec2(0, 0));
          B.b.setAngularVelocity(0);
        }
        cible = { x, y, phi };
      };
      placer(200, -60, 0, P.ouverture * 0.8);
      const p = {
        placer,
        commander(o3) {
          if (o3.x != null) cible = { x: o3.x, y: o3.y, phi: o3.phi || 0 };
          if (o3.ouvrir != null) ouvrir = o3.ouvrir;
          if (o3.couple !== void 0) couple = o3.couple;
        },
        // (appelé à chaque sous-pas) le moyeu suit sa cible par sa vitesse (cinématique : il pousse, rien ne le pousse) ;
        // chaque bras tourne par son moteur vers ouvert ou fermé, avec son couple
        // (k : la part du chemin vers la cible à faire pendant ce sous-pas ; la cible est répartie sur les sous-pas d'un pas,
        // sans quoi le moyeu avançait par à-coups et l'inertie des bras les repliait)
        piloter(h, k = 1) {
          const pos = moyeu.getPosition(), a0 = moyeu.getAngle();
          moyeu.setLinearVelocity(new pl.Vec2((cible.x / PPM - pos.x) * k / h, (cible.y / PPM - pos.y) * k / h));
          moyeu.setAngularVelocity((-cible.phi - a0) * k / h);
          for (let k2 = 0; k2 < 2; k2++) {
            const B = bras[k2], o_ = typeof ouvrir === "number" ? ouvrir : ouvrir[k2], a = angle(k2);
            if (o_) {
              B.bloque = false;
              B.cale = 0;
              B.a0 = a;
            } else if (!B.bloque) {
              if (!touche(B.b)) {
                B.cale = 0;
                B.a0 = a;
              } else {
                B.cale = (B.cale || 0) + h;
                if (B.cale >= 0.12) {
                  if (B.a0 - a < 0.25 * P.vitesseFermer * B.cale) B.bloque = true;
                  B.cale = 0;
                  B.a0 = a;
                }
              }
            }
            if (!o_ && B.bloque) {
              B.j.enableMotor(false);
              B.b.applyTorque(B.sg * (couple ?? P.couple), true);
              continue;
            }
            B.j.enableMotor(true);
            const v = o_ ? Math.min(P.vitesseOuvrir, Math.max(0, (P.ouverture - a) * 8)) : -P.vitesseFermer;
            B.j.setMotorSpeed(-B.sg * v);
            B.j.setMaxMotorTorque(o_ ? P.coupleOuvert : couple ?? P.couple);
          }
        },
        // LA DESCENTE S'ARRÊTE (à appeler à chaque image pendant la descente) : le moyeu touche quelque chose ; ou un bras
        // replié de moitié (il a buté en descendant ; contre une paroi, il glisse le long et la pince continue) ; ou la pince appuie vraiment
        // (plus de ARRET.force N pendant ARRET.images images de suite) : elle ne fait que frôler un badge libre, elle
        // continue (les bras ouverts sont souples). Rend la raison, ou null ; casino.js remonte alors de ARRET.recul px
        // (8/10/2026, règle de l'auteur : « elle cogne et n'attrape rien ») : comme le vrai jeu, la pince FORCE vers le bas
        // jusqu'à sa profondeur maximale ; seules les surfaces dures l'arrêtent (décor : plateaux, pentes, murets, sol),
        // jamais un badge : elle les pousse, les écarte, les tasse pour engager le badge visé entre ses bras. Arrêt :
        // le moyeu dans le décor ; le décor qui la repousse vers le haut (ARRET.force, ARRET.images images) ; un bras
        // replié de moitié contre le décor ; ou des badges qui ne cèdent plus. Elle pousse les badges sans les traverser :
        // dès qu'elle entre de plus de ARRET.enfonce px dans un badge, etat.retenir demande à l'automate de ne pas
        // descendre à cette image (le badge a le temps de glisser, d'être écarté ou tassé) ; retenue trop longtemps
        // (ARRET.imagesCoince, compteur qui fuit quand elle avance), le tas ne cède pas : elle s'arrête là
        arret(lu = p.lire(), etat = p) {
          const c = lu.contacts, F = lu.haut;
          etat.appui = F.dur > ARRET.force ? (etat.appui || 0) + 1 : 0;
          etat.retenir = F.enfonce > ARRET.enfonce;
          etat.coince = Math.max(0, (etat.coince || 0) + (etat.retenir ? 1 : -0.25));
          if (c.decorMoyeu || p.dansDecor()) return "moyeu";
          if (lu.oG < ARRET.plie && c.decorG || lu.oD < ARRET.plie && c.decorD) return "bras";
          const seule = !c.decorMoyeu && c.decorG > 0 !== c.decorD > 0 && (c.decorG ? lu.oG : lu.oD) > ARRET.plie;
          if (etat.appui >= ARRET.images && !seule) return "decor";
          if (etat.coince >= ARRET.imagesCoince) return "coince";
          return null;
        },
        lire() {
          const c = { moyeu: 0, g: 0, d: 0, decorG: 0, decorD: 0, decorMoyeu: 0 }, tenus = /* @__PURE__ */ new Set();
          const compter = (corps, cleB, cleD) => {
            for (let e = corps.getContactList(); e; e = e.next) {
              const k = e.contact;
              if (!k.isTouching() || !k.isEnabled()) continue;
              const autre = e.other;
              if (k.getFixtureA().__mur || k.getFixtureB().__mur) continue;
              if (autre.__badge) {
                c[cleB]++;
                if (cleB !== "moyeu") tenus.add(autre.__badge);
              } else if (autre.__type === "decor") c[cleD]++;
            }
          };
          compter(moyeu, "moyeu", "decorMoyeu");
          compter(bras[0].b, "g", "decorG");
          compter(bras[1].b, "d", "decorD");
          return { oG: angle(0) / P.ouverture, oD: angle(1) / P.ouverture, force: { moyeu: moyeu.__forceMax || 0, g: bras[0].b.__forceMax || 0, d: bras[1].b.__forceMax || 0 }, haut: { moyeu: moyeu.__hautMax || 0, g: bras[0].b.__hautMax || 0, d: bras[1].b.__hautMax || 0, dur: Math.max(moyeu.__durMax || 0, bras[0].b.__durMax || 0, bras[1].b.__durMax || 0), badges: Math.max(moyeu.__badgeMax || 0, bras[0].b.__badgeMax || 0, bras[1].b.__badgeMax || 0), enfonce: Math.max(moyeu.__enfonceMax || 0, bras[0].b.__enfonceMax || 0, bras[1].b.__enfonceMax || 0) }, bloqueG: !!bras[0].bloque, bloqueD: !!bras[1].bloque, contacts: c, tenus: [...tenus] };
        },
        // le moyeu dans le décor ? (cinématique : Box2D ne le fait pas buter contre le statique ; casino.js l'arrête)
        dansDecor(marge = 0) {
          const xa = moyeu.getTransform();
          for (let fa = moyeu.getFixtureList(); fa; fa = fa.getNext())
            for (let fb = fixe.getFixtureList(); fb; fb = fb.getNext()) {
              if (fb.getShape().getType() === "edge" || fb.__mur || fb.getFilterGroupIndex() === GROUPE_PINCE) continue;
              if (pl.testOverlap(fa.getShape(), 0, fb.getShape(), 0, xa, fixe.getTransform())) return true;
            }
          return false;
        },
        formes() {
          const out = [];
          for (const corps of [moyeu, bras[0].b, bras[1].b]) for (let f = corps.getFixtureList(); f; f = f.getNext()) {
            const sh = f.getShape();
            const vs = sh.m_vertices || Array.from({ length: 8 }, (_, k) => new pl.Vec2(sh.m_p.x + Math.cos(k * Math.PI / 4) * sh.m_radius, sh.m_p.y + Math.sin(k * Math.PI / 4) * sh.m_radius));
            out.push(vs.map((v) => {
              const w = corps.getWorldPoint(v);
              return [w.x * PPM, w.y * PPM];
            }));
          }
          return out;
        },
        // la place libre sous la pince (px) : des rayons vers le bas depuis le dessous du moyeu et les deux pointes, jusqu'au
        // premier badge ou décor (casino.js freine la descente en approchant)
        dessous(max = 300) {
          let d = max;
          const U_ = P.unite, depuis = [[moyeu, [0, MOYEU.ry * U_]], [bras[0].b, [1.697 * U_, 2.653 * U_]], [bras[1].b, [-1.697 * U_, 2.653 * U_]]];
          for (const [corps, [x, y]] of depuis) {
            const a = corps.getWorldPoint(V(x, y)), b = new pl.Vec2(a.x, a.y + max / PPM);
            monde.rayCast(a, b, (f, pt, n, frac) => {
              const t = f.getBody().__type;
              if (t === "pince" || f.getFilterGroupIndex() === GROUPE_PINCE) return -1;
              d = Math.min(d, frac * max);
              return frac;
            });
          }
          return d;
        },
        pointes() {
          return bras.map((B) => {
            const w = B.b.getWorldPoint(V(-B.sg * 1.697 * U, 2.653 * U));
            return [w.x * PPM, w.y * PPM];
          });
        },
        // (15/10, test « pince à 100 % » : sur 14 bornes, presque aucun badge PORTÉ ; serré par le seul frottement de deux
        // bras de 600 N·m, le badge (≈ 440 N) glissait entre eux pendant la montée) LA PRISE : un badge que les bras
        // referment à leur portée pend au moyeu par un pivot entre les deux pointes (au-dessus de son centre : il pend et se
        // balance, comme dans le jeu) ; les bras le serrent toujours, et lacher() le rend à la gravité (glisse, goulotte)
        saisir(b) {
          if (prises.has(b) || !badges.has(b)) return;
          const [g, d] = p.pointes(), q = b.lire();
          b.reveiller();
          prises.set(b, monde.createJoint(new pl.RevoluteJoint({}, moyeu, b.corps, V((g[0] + d[0]) / 2, Math.min((g[1] + d[1]) / 2, q.y - 0.4 * b.r)))));
        },
        lacher() {
          for (const [b, j] of prises) if (badges.has(b)) monde.destroyJoint(j);
          prises.clear();
        },
        get prises() {
          return [...prises.keys()];
        },
        corps: [moyeu, bras[0].b, bras[1].b]
      };
      pince = p;
      return p;
    };
    let cout = 0;
    const pas = (dt) => {
      const t0 = (typeof performance !== "undefined" ? performance : Date).now();
      if (pince) for (const c of pince.corps) c.__forceMax = c.__hautMax = c.__durMax = c.__badgeMax = c.__enfonceMax = 0;
      evts.length = 0;
      reste = Math.min(reste + dt, R.pas * R.sousPasMax);
      const vm = R.vmax / PPM;
      const avant = /* @__PURE__ */ new Map();
      for (const b of badges) avant.set(b, b.corps.isAwake());
      let n = Math.floor((reste + 1e-9) / R.pas), i = 0;
      while (reste >= R.pas - 1e-9) {
        reste -= R.pas;
        i++;
        if (pince) {
          pince.piloter(R.pas, 1 / (n - i + 1));
          for (const c of pince.corps) c.__force = c.__forceHaut = c.__forceDur = c.__forceBadge = c.__enfonce = 0;
        }
        monde.step(R.pas, R.iterV, R.iterP);
        if (pince) for (const c of pince.corps) {
          c.__forceMax = Math.max(c.__forceMax || 0, c.__force);
          c.__hautMax = Math.max(c.__hautMax || 0, c.__forceHaut);
          c.__durMax = Math.max(c.__durMax || 0, c.__forceDur);
          c.__badgeMax = Math.max(c.__badgeMax || 0, c.__forceBadge);
          c.__enfonceMax = Math.max(c.__enfonceMax || 0, c.__enfonce);
        }
        for (const b of badges) {
          const v = b.corps.getLinearVelocity(), l = Math.hypot(v.x, v.y);
          if (l > vm) b.corps.setLinearVelocity(new pl.Vec2(v.x * vm / l, v.y * vm / l));
        }
        for (const a of accs) {
          const v = a.corps.getLinearVelocity(), l = Math.hypot(v.x, v.y);
          if (l > vm) a.corps.setLinearVelocity(new pl.Vec2(v.x * vm / l, v.y * vm / l));
        }
        const vif = (o2) => {
          const e = o2.__badge || o2.__acc;
          return o2.__type === "pince" || !!e && o2.isAwake() && (e.reveille || !e.fige);
        };
        for (const b of [...badges, ...accs]) {
          if (!b.fige || b.reveille || !b.corps.isAwake()) continue;
          let vrai = false;
          for (let e = b.corps.getContactList(); e && !vrai; e = e.next) {
            if (!e.contact.isTouching() || !e.contact.isEnabled()) continue;
            vrai = vif(e.other);
          }
          for (let e = b.corps.getJointList(); e && !vrai; e = e.next) vrai = vif(e.other);
          if (vrai) b.reveille = true;
          else b.corps.setAwake(false);
        }
      }
      for (const b of badges) {
        const ev = b.corps.isAwake();
        if (ev && !avant.get(b)) {
          if (!b.touche) {
            b.touche = true;
          }
          evts.push({ type: "reveil", b });
        }
        if (b.corps.getPosition().y * PPM > R.sortie && !b.sorti) {
          b.sorti = true;
          evts.push({ type: "sortie", b, x: b.corps.getPosition().x * PPM });
        }
      }
      for (const a of accs) if (a.corps.getPosition().y * PPM > R.sortie + 60) {
        a.sorti = true;
        accs.delete(a);
        monde.destroyBody(a.corps);
      }
      if (laBombe && laBombe.getPosition().y * PPM > R.sortie + 60) {
        monde.destroyBody(laBombe);
        laBombe = null;
      }
      if (ignores.size) {
        for (const [k, [a, b]] of ignores) if ((a.corps.isAwake() || b.corps.isAwake()) && !chevauchent(a.corps, b.corps)) ignores.delete(k);
      }
      const t1 = (typeof performance !== "undefined" ? performance : Date).now();
      cout = cout ? cout * 0.9 + (t1 - t0) * 0.1 : t1 - t0;
      return evts.slice();
    };
    const dedans = (B, x, y) => {
      const p = new pl.Vec2(x / PPM, y / PPM);
      for (let f = B.getFixtureList(); f; f = f.getNext()) if (f.getShape().getType() !== "edge" && f.testPoint(p)) return true;
      return false;
    };
    const bordsMonde = (B) => {
      const L = B.__bords;
      if (!L) {
        const out = [];
        for (let f = B.getFixtureList(); f; f = f.getNext()) {
          const v = f.getShape().m_vertices;
          if (!v) continue;
          for (let i = 0; i < v.length; i++) {
            const a = v[i], b = v[(i + 1) % v.length];
            out.push([a.x * PPM, a.y * PPM, b.x * PPM, b.y * PPM]);
          }
        }
        B.__bords = out;
        return bordsMonde(B);
      }
      if (B === fixe) return L;
      const t = B.getTransform();
      return L.map(([x0, y0, x1, y1]) => {
        const a = pl.Transform.mulVec2(t, V(x0, y0)), b = pl.Transform.mulVec2(t, V(x1, y1));
        return [a.x * PPM, a.y * PPM, b.x * PPM, b.y * PPM];
      });
    };
    const distSeg = (x, y, [ax, ay, bx, by]) => {
      const ex = bx - ax, ey = by - ay, l2 = ex * ex + ey * ey, t = l2 ? Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / l2)) : 0;
      return Math.hypot(x - ax - ex * t, y - ay - ey * t);
    };
    const profondeur = (A, B) => {
      const LA = bordsMonde(A), LB = bordsMonde(B);
      let d = 0;
      if (!LB.length) return 0;
      for (const [x0, y0, x1, y1] of LA) for (const [x, y] of [[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2]]) if (dedans(B, x, y)) {
        let m = 1e9;
        for (const e of LB) m = Math.min(m, distSeg(x, y, e));
        d = Math.max(d, m);
      }
      return d;
    };
    const mesure = () => {
      let inter = 0, pire = 0;
      const parGenre = {}, paires = [];
      for (let c = monde.getContactList(); c; c = c.getNext()) {
        if (!c.isTouching() || !c.isEnabled()) continue;
        const a = c.getFixtureA().getBody(), b = c.getFixtureB().getBody();
        if (!a.__badge && !b.__badge) continue;
        const genre = [a.__type, b.__type].sort().join("-");
        const s = Math.max(profondeur(a, b), profondeur(b, a));
        if (s > pire) pire = s;
        if (s > 1) {
          inter++;
          parGenre[genre] = (parGenre[genre] || 0) + 1;
          paires.push([a, b, s]);
        }
      }
      let suspendus = 0, figesEnLAir = 0, eveilles = 0;
      const liste = [];
      for (const b of badges) {
        const c = b.corps;
        let appui = false;
        for (let e = c.getContactList(); e; e = e.next) if (e.contact.isTouching() && e.contact.isEnabled()) {
          appui = true;
          break;
        }
        if (c.isAwake()) eveilles++;
        if (!appui && c.getLinearVelocity().length() * PPM < 2) {
          if (b.touche) {
            suspendus++;
            liste.push(b);
          } else figesEnLAir++;
        }
      }
      return { interpenetrations: inter, parGenre, paires, pire, suspendus, figesEnLAir, eveilles, liste };
    };
    return {
      R,
      PPM,
      monde,
      ignores,
      decor,
      badge,
      retirer,
      croiser,
      pince: creerPince,
      pas,
      mesure,
      badges,
      accs,
      accessoire,
      souder,
      bombe,
      exploser,
      couvert,
      get laBombe() {
        return laBombe;
      },
      get cout() {
        return cout;
      },
      get laPince() {
        return pince;
      }
    };
  };
  window.__pcvCasinoPhysique = { creer, REGLAGES, ARRET, MARGE_MUR, PPM, BRAS, ARTIC, MOYEU, nettoyer, enveloppe, fusionner };
})();
