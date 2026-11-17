(() => {
  const C = window.__pcvArrivees ||= {};
  const c = () => window.THREE;
  const z = (e, r = {}) => new (c()).MeshLambertMaterial({ color: e, ...r });
  const I = (e, r = {}) => new (c()).MeshBasicMaterial({ color: e, ...r });
  const D = (e, r, t, a, o, i = 0, u = 0, d = 0) => {
    const l = new (c()).Mesh(new (c()).BoxGeometry(t, a, o), r);
    l.position.set(i, u, d);
    e.add(l);
    return l;
  };
  const T = (e, r, t, a, o, i = 0, u = 0, d = 0, l = 16) => {
    const n = new (c()).Mesh(new (c()).CylinderGeometry(t, a, o, l), r);
    n.position.set(i, u, d);
    e.add(n);
    return n;
  };
  const K = (e, r, t = 0) => {
    e.position.copy(r);
    e.rotation.y = t;
    e.updateMatrixWorld(true);
    const a = new (c()).Box3().setFromObject(e);
    if (Number.isFinite(a.min.y)) e.position.y += r.y - a.min.y;
    return e;
  };
  const W = (e) => {
    e.m.objet.rotation.order = "YXZ";
    if (e.v) e.v.objet.rotation.order = "YXZ";
  };
  const G = (e, r, t, a, o = {}) => r.m.allerVers(e.local(t, a), o);
  const E = async (e, r, t = 1.1, a = "bleu") => {
    const o = r.m;
    o.objet.position.copy(e.local(0, -0.8));
    o.cap = o.capVise = e.cap(0);
    o.jouer("repos", { fondu: 0 });
    o.objet.visible = true;
    const i = o.objet.scale.x;
    let u = 0;
    e.portail("tele", 0, a);
    e.chaque(() => {
      u += e.dt;
      const d = Math.min(1, u / t), l = e.lisse(d / 0.65);
      e.portail(d < 1 ? "tele" : "allume", d, a);
      o.objet.scale.set(i * (0.35 + 0.65 * l), i * (0.15 + 0.85 * l), i * (0.35 + 0.65 * l));
      if (d >= 1) {
        o.objet.scale.setScalar(i);
        return false;
      }
    });
    await e.attendre(t);
  };
  const J = async (e, r, t = 0.7) => {
    const a = r.m, o = a.objet.scale.x;
    let i = 0;
    e.portail("tele", 1);
    e.chaque(() => {
      i += e.dt;
      const u = Math.min(1, i / t);
      e.portail("tele", 1 - u);
      a.objet.scale.set(o * (1 - 0.65 * u), o * (1 - 0.85 * u), o * (1 - 0.65 * u));
      if (u >= 1) {
        a.objet.visible = false;
        return false;
      }
    });
    await e.attendre(t);
  };
  C.s3 = (e) => {
    const r = [-2.1, 1];
    const t = K(e.objet("o1", true), e.local(r[0], r[1]), e.cap(0.35));
    if (e.deja) return null;
    const a = new (c()).Box3().setFromObject(t).max.y, o = a - 1.25 * e.h;
    const i = (s, b, h) => {
      const w = s.objet.position.y;
      let v = 0;
      return new Promise((j) => e.chaque(() => {
        v = Math.min(1, v + e.dt / h);
        s.objet.position.y = w + (b - w) * e.lisse(v);
        if (v >= 1) {
          j();
          return false;
        }
      }));
    };
    const u = t.position.y;
    let d = 0.6;
    e.chaque(() => {
      const s = performance.now() / 1e3, b = Math.max(0, Math.sin(s * 1.3)) ** 6;
      t.rotation.z = Math.sin(s * 31) * 0.012 * d * b;
      t.position.y = u + Math.abs(Math.sin(s * 23)) * 8e-3 * d * b;
      t.rotation.y = e.cap(0.35) + Math.sin(s * 17) * 0.01 * d * b;
    });
    const l = e.heros, n = l.m;
    n.objet.visible = false;
    let f = null;
    const m = e.h;
    const p = e.preparerFigurant(0).then((s) => {
      f = e.figurant(s || { graine: 4211, pantalon: "#6f767e" });
      W(f);
    });
    return async () => {
      await p;
      await E(e, f);
      f.m.capVise = e.vers(f, t.position);
      e.suivreCamera(e.local(r[0] * 0.55, r[1] * 0.7, 0.6), 0.35);
      await G(e, f, r[0] + 1.05, r[1] - 0.1, { vitesse: 0.7 });
      f.m.capVise = e.vers(f, t.position);
      f.m.jouer("pencher", { fondu: 0.2 });
      await e.attendre(1);
      n.objet.position.copy(t.position).addScaledVector(f.m.objet.position.clone().sub(t.position).setY(0).normalize(), 0.25 * m).setY(o);
      n.capVise = n.cap = e.vers(l, f.m.objet.position);
      n.objet.visible = true;
      n.jouer("pousser", { fondu: 0 });
      await i(n, a - 0.62 * m, 0.22);
      f.m.jouer("peur", { fondu: 0.06 });
      d = 3;
      const s = f.m.objet.position.clone(), b = t.position.clone().setY(0), h = a - 0.35 * m;
      let w = 0;
      await new Promise((v) => e.chaque(() => {
        w = Math.min(1, w + e.dt / 1.1);
        const j = e.lisse(w);
        f.m.inclinaison = 0.75 * e.lisse(w / 0.5);
        const M = e.lisse((w - 0.3) / 0.7);
        f.m.objet.position.lerpVectors(s, b, M * 0.55);
        f.m.objet.position.y = e.lisse(w / 0.45) * h;
        n.objet.position.y = a - 0.62 * m - (a - 0.62 * m - o) * e.lisse((w - 0.55) / 0.45);
        if (w >= 1) {
          v();
          return false;
        }
      }));
      f.m.jouer("tomber");
      d = 6;
      {
        let v = 0;
        e.chaque(() => {
          v = Math.min(1, v + e.dt / 0.5);
          f.m.inclinaison = 0.75 - 0.6 * v;
          return v < 1;
        });
      }
      await i(f.m, o, 0.5);
      f.m.objet.visible = false;
      n.objet.visible = false;
      d = 9;
      await e.attendre(1.2);
      d = 0;
      f.liberer?.();
      n.objet.visible = true;
      n.capVise = n.cap = e.cap(-0.4);
      n.jouer("sauter", { fondu: 0 });
      await i(n, a - 0.3 * m, 0.3);
      await n.sauterVers(e.local(r[0] + 1.1, r[1] + 0.9), { hauteur: 0.95, salto: true, ensuite: "atterrir" });
      e.portail("repos");
      e.suivreCamera(null);
      await e.attendre(0.6);
      n.jouer("repos", { fondu: 0.2 });
      n.capVise = e.vers(l, e.camera());
      await e.attendre(0.5);
    };
  };
  C.s1 = (e) => {
    if (e.deja) return null;
    const r = e.heros, t = r.m;
    t.objet.visible = false;
    const a = e.h;
    let o = null;
    const i = e.preparerFigurant(0).then((b) => {
      o = e.figurant({ ...b || { graine: 9123, pantalon: "#363944" }, taille: 1.25 });
      W(o);
      o.m.inclinaison = 0.14;
    });
    const u = e.objet(null), d = new (c()).MeshPhongMaterial({ color: 10134187, shininess: 90, specular: 16777215 }), l = new (c()).MeshPhongMaterial({ color: 4080716, shininess: 40 });
    T(u, l, 0.03 * a, 0.03 * a, 0.16 * a, 0, 0, 0, 12);
    {
      const b = new (c()).Mesh(new (c()).TorusGeometry(0.12 * a, 0.022 * a, 8, 24, Math.PI), d);
      b.rotation.set(0, Math.PI / 2, Math.PI / 2);
      b.position.z = 0.03 * a;
      u.add(b);
    }
    const n = new (c()).Group();
    u.add(n);
    const f = I(5031679, { transparent: true, opacity: 0.96, depthWrite: false, side: c().DoubleSide }), m = I(1731839, { transparent: true, opacity: 0.45, depthWrite: false, side: c().DoubleSide });
    const p = (b) => {
      const h = new (c()).Shape();
      h.moveTo(0, -0.02 * a * b);
      h.lineTo(0, 0.075 * a * b);
      h.quadraticCurveTo(0.38 * a, 0.095 * a * b, 0.86 * a, -0.03 * a);
      h.quadraticCurveTo(0.45 * a, -4e-3 * a, 0, -0.02 * a * b);
      h.closePath();
      return h;
    };
    const s = (b) => {
      const h = new (c()).Shape();
      h.moveTo(0, -0.02 * a * b);
      h.lineTo(0, 0.045 * a * b);
      h.lineTo(-0.15 * a, 0.065 * a * b);
      h.closePath();
      return h;
    };
    for (const b of [1, -1]) for (const [h, w, v] of [[p(1), f, 6e-3], [p(1.9), m, 0.02], [s(1), f, 6e-3], [s(1.9), m, 0.02]]) {
      const j = new (c()).Mesh(new (c()).ExtrudeGeometry(h, { depth: v * a, bevelEnabled: false }), w);
      j.geometry.translate(0, 0, -v * a / 2);
      j.rotation.set(0, -Math.PI / 2, 0);
      j.scale.set(1, b, 1);
      j.position.set(0, b * 0.11 * a, 0.03 * a);
      n.add(j);
    }
    n.scale.set(1, 1, 1e-3);
    n.visible = false;
    r.fixer(u, 9, [0, -0.01, 0.04]);
    return async () => {
      await i;
      const b = t.deuxMains;
      t.deuxMains = null;
      if (r.v) r.v.deuxMains = null;
      r.cacher(/^fusil/);
      o.m.objet.position.copy(e.local(-0.2, -0.25));
      o.m.cap = o.m.capVise = e.cap(Math.PI);
      o.m.objet.visible = true;
      o.m.jouer("garde", { fondu: 0 });
      t.objet.position.copy(e.local(0.15, -0.85));
      t.cap = t.capVise = e.cap(0);
      t.objet.visible = true;
      t.jouer("repos", { fondu: 0 });
      const h = [t.objet.scale.x, o.m.objet.scale.x];
      let w = 0;
      e.portail("tele", 0);
      e.chaque(() => {
        w += e.dt;
        const g = Math.min(1, w / 1.1), k = e.lisse(g / 0.65);
        e.portail(g < 1 ? "tele" : "allume", g);
        for (const [V, y] of [[t.objet, h[0]], [o.m.objet, h[1]]]) V.scale.set(y * (0.35 + 0.65 * k), y * (0.15 + 0.85 * k), y * (0.35 + 0.65 * k));
        return g < 1;
      });
      await e.attendre(1.1);
      const v = e.local(0, 0.75), j = e.camera().sub(v).setY(0).normalize(), M = new (c()).Vector3(-j.z, 0, j.x), q = (g) => v.clone().addScaledVector(M, g).addScaledVector(j, -0.1);
      e.suivreCamera(e.local(0, 0.7, 0.75), 0.38);
      {
        const g = o.m.objet.position.clone(), k = q(-0.6), V = t.objet.position.clone(), y = q(0.45);
        let x = 0;
        o.m.jouer("marcher", { vitesse: -0.8 });
        t.jouer("marcher");
        e.chaque(() => {
          x = Math.min(1, x + e.dt / 1.2);
          const Y = e.lisse(x);
          o.m.objet.position.lerpVectors(g, k, Y);
          t.objet.position.lerpVectors(V, y, Y);
          if (x >= 1) {
            o.m.jouer("garde", { fondu: 0.15 });
            t.jouer("garde", { fondu: 0.15 });
          }
          t.capVise = e.vers(r, o.m.objet.position);
          o.m.capVise = e.vers(o, t.objet.position);
          return x < 1;
        });
        await e.attendre(1.35);
      }
      n.visible = true;
      let P = 0;
      e.son("choisir");
      e.chaque(() => {
        P = Math.min(1, P + e.dt / 0.09);
        n.scale.z = P;
        return P < 1;
      });
      await e.attendre(0.55);
      o.m.jouer("peur", { fondu: 0.1 });
      t.jouer("projeter", { redemarrer: true, fondu: 0.06 });
      {
        let g = 0;
        e.chaque(() => {
          g = Math.min(1, g + e.dt / 0.3);
          o.m.inclinaison = 0.14 - 0.44 * e.lisse(g);
          return g < 1;
        });
      }
      {
        const g = t.objet.position.clone(), k = t.objet.position.clone().lerp(o.m.objet.position, 0.32);
        let V = 0;
        e.chaque(() => {
          V = Math.min(1, V + e.dt / 0.18);
          t.objet.position.lerpVectors(g, k, V);
          return V < 1;
        });
      }
      await e.attendre(0.7);
      {
        const g = t.cap, k = o.m.objet.position.clone().sub(t.objet.position), V = Math.hypot(k.x, k.z);
        let y = 0;
        t.jouer("pousser", { fondu: 0.2 });
        e.chaque(() => {
          y = Math.min(1, y + e.dt / 0.9);
          const x = g + Math.PI * e.lisse(y);
          t.cap = t.capVise = x;
          o.m.cap = o.m.capVise = x + Math.PI;
          o.m.objet.position.set(t.objet.position.x + Math.sin(x) * V, 0, t.objet.position.z + Math.cos(x) * V);
          return y < 1;
        });
        await e.attendre(1);
      }
      {
        const g = o.m.objet.position.clone(), k = e.local(0, -0.8), V = t.objet.position.clone(), y = e.local(0, 0.05);
        let x = 0;
        t.jouer("pousser", { redemarrer: true });
        e.chaque(() => {
          x = Math.min(1, x + e.dt / 0.6);
          const Y = e.lisse(x);
          o.m.objet.position.lerpVectors(g, k, Y);
          t.objet.position.lerpVectors(V, y, Y);
          return x < 1;
        });
        await e.attendre(0.55);
      }
      await J(e, o, 0.6);
      e.portail("repos");
      t.capVise = e.cap(0);
      t.jouer("repos", { fondu: 0.25 });
      e.suivreCamera(null);
      await e.attendre(0.5);
      P = 1;
      e.chaque(() => {
        P = Math.max(0, P - e.dt / 0.15);
        n.scale.z = Math.max(1e-3, P);
        if (!P) n.visible = false;
        return P > 0;
      });
      await e.attendre(0.5);
      r.fixer(u, null);
      u.visible = false;
      r.cacher(/^fusil/, false);
      t.deuxMains = b;
      if (r.v) r.v.deuxMains = b;
      t.capVise = e.vers(r, e.camera());
      await e.attendre(0.4);
    };
  };
  C.s2 = (e) => {
    if (e.deja) return null;
    const r = e.heros, t = r.m;
    t.objet.visible = false;
    return async () => {
      const a = e.h, o = e.objet("o8"), i = e.local(0, -0.8), u = e.local(3, 2.4), d = e.local(3.8, 2.95);
      o.position.copy(i).setY(0.38 * a);
      o.visible = false;
      let l = 0;
      e.chaque(() => {
        l += e.dt;
        const s = Math.min(1, l / 0.55);
        e.portail(s < 1 ? "tele" : "allume", s);
        return s < 1;
      });
      await e.attendre(0.45);
      o.visible = true;
      const n = o.children[0]?.children[0]?.userData.rouler;
      let f = 0;
      e.suivreCamera(() => (t.objet.visible ? t.objet.position : o.position).clone().setY(0.5));
      e.chaque(() => {
        f = Math.min(1, f + e.dt / 0.55);
        o.position.lerpVectors(i, u, f).setY(0.38 * a);
        o.rotation.y = Math.atan2(u.x - i.x, u.z - i.z);
        n?.(e.dt * 22);
        return f < 1;
      });
      await e.attendre(0.55);
      o.visible = false;
      t.objet.position.copy(u);
      t.cap = t.capVise = Math.atan2(u.x - i.x, u.z - i.z);
      t.objet.visible = true;
      t.jouer("glisse", { fondu: 0.05, redemarrer: true });
      let m = 0;
      const p = [];
      e.chaque(() => {
        m = Math.min(1, m + e.dt / 0.6);
        t.objet.position.lerpVectors(u, d, 1 - (1 - m) ** 2);
        t.inclinaison = -0.32 * Math.sin(Math.min(1, m * 1.2) * Math.PI);
        if (p.length < 7 && m > p.length / 8) {
          const s = e.objet("o18");
          s.position.copy(t.objet.position).setY(0.1 * a);
          s.scale.setScalar(0.12);
          s.userData.t = 0;
          p.push(s);
        }
        return m < 1;
      });
      e.chaque(() => {
        for (const s of p) {
          s.userData.t += e.dt;
          const b = s.userData.t / 0.9;
          s.scale.setScalar(0.12 + b * 0.2);
          s.position.y += e.dt * 0.25;
          s.traverse((h) => {
            if (h.material) h.material.opacity = Math.max(0, 0.9 * (1 - b));
          });
          s.visible = b < 1;
        }
      });
      e.portail("repos");
      await e.attendre(0.7);
      t.inclinaison = 0;
      t.capVise = e.vers(r, e.camera());
      t.jouer("doigt", { fondu: 0.15, redemarrer: true });
      await e.attendre(1.5);
      t.jouer("repos", { fondu: 0.2 });
      e.suivreCamera(null);
      await e.attendre(0.2);
    };
  };
  const R = { r: 0.92, fin: [-2.35, 4.3] };
  const F = (e) => {
    const r = e.objet(null, true), t = new (c()).IcosahedronGeometry(R.r, 3), a = t.attributes.position, o = new (c()).Vector3();
    for (let u = 0; u < a.count; u++) {
      o.fromBufferAttribute(a, u);
      const d = Math.sin(o.x * 5.1 + 1.3) * Math.sin(o.y * 4.3 + 0.7) * Math.sin(o.z * 3.7 + 2.1);
      o.multiplyScalar(1 + 0.06 * d + 0.025 * Math.sin(o.x * 13 + o.z * 11));
      a.setXYZ(u, o.x, o.y, o.z);
    }
    t.computeVertexNormals();
    const i = new (c()).Mesh(t, z(9075302, { flatShading: true }));
    i.position.y = R.r;
    r.add(i);
    r.userData.boule = i;
    return r;
  };
  const O = (e) => new (c()).CatmullRomCurve3([e.local(0, -0.75), e.local(0, 1.2), e.local(-0.4, 2.8), e.local(-1.4, 3.8), e.local(...R.fin)].map((r) => r.clone().setY(0)));
  const _ = (e, r, t, a, o) => {
    const i = e.h, u = R.r, d = 0.25 * i, l = 0.54 * i, n = a.clone().setY(u);
    if (!t.pivot) {
      const h = n.clone().sub(r.position).setY(0), w = h.length();
      if (w > u + d) return;
      t.dir = h.normalize().negate();
      t.axe = new (c()).Vector3(t.dir.z, 0, -t.dir.x);
      t.pivot = e.objet(null, true);
      t.pivot.position.copy(r.position).addScaledVector(t.dir, d);
      t.pivot.attach(r);
      t.a = 0;
      e.son?.("choisir");
    }
    if (t.a < Math.PI / 2) {
      t.a = Math.min(Math.PI / 2, t.a + o * 4.5);
      t.pivot.quaternion.setFromAxisAngle(t.axe, t.a);
      t.pivot.position.y = 0.095 * i * Math.sin(t.a);
    }
    const f = t.pivot.position.clone().setY(d * 0.9), m = f.clone().addScaledVector(t.dir, l * Math.sin(t.a)), p = new (c()).Line3(f, m), s = p.closestPointToPoint(n, true, new (c()).Vector3()), b = s.distanceTo(n);
    if (b < u + d * 0.9) {
      const h = u + d * 0.9 - b;
      t.pivot.position.addScaledVector(t.dir, h);
    }
  };
  C.s8 = (e) => {
    const r = e.local(...R.fin), t = e.h;
    const a = [0.45, 2.1], o = e.objet(null, true), i = z(12102546), u = {};
    T(o, i, 0.2 * t, 0.24 * t, 0.45 * t, 0, 0.225 * t, 0, 8);
    T(o, i, 0.27 * t, 0.27 * t, 0.06 * t, 0, 0.48 * t, 0, 8);
    o.position.copy(e.local(...a));
    o.rotation.y = e.cap(0);
    if (e.deja) {
      const m = F(e);
      m.position.copy(r);
      m.userData.boule.rotation.set(0.4, 1.1, 0.2);
      e.obstacle(r, R.r);
      const p = O(e);
      for (let s = 0; s <= 600; s++) _(e, o, u, p.getPointAt(s / 600), 1 / 30);
      if (u.pivot) e.obstacle(u.pivot.position, 0.3 * t);
      return null;
    }
    const d = e.heros, l = d.m;
    l.objet.visible = false;
    const n = e.objet(null), f = new (c()).MeshPhongMaterial({ color: 14723370, shininess: 90, specular: 16773296, emissive: 3810304 });
    {
      const m = new (c()).Mesh(new (c()).SphereGeometry(0.075 * t, 14, 10), f);
      m.position.y = 0.2 * t;
      m.scale.set(1.1, 0.95, 1);
      n.add(m);
      T(n, f, 0.06 * t, 0.085 * t, 0.15 * t, 0, 0.08 * t, 0, 10);
      for (const p of [-1, 1]) {
        const s = new (c()).Mesh(new (c()).SphereGeometry(0.016 * t, 8, 6), z(2759168));
        s.position.set(p * 0.03 * t, 0.21 * t, 0.072 * t);
        n.add(s);
      }
    }
    n.position.copy(o.position).setY(0.51 * t);
    n.rotation.y = e.cap(0);
    return async () => {
      l.objet.position.copy(e.local(0, -0.8));
      l.cap = l.capVise = e.cap(0);
      l.objet.visible = true;
      l.jouer("repos", { fondu: 0 });
      const m = l.objet.scale.x;
      let p = 0;
      e.chaque(() => {
        p += e.dt;
        const V = Math.min(1, p / 1.1), y = e.lisse(V / 0.65);
        if (V < 1) e.portail("tele", V);
        l.objet.scale.set(m * (0.35 + 0.65 * y), m * (0.15 + 0.85 * y), m * (0.35 + 0.65 * y));
        return V < 1;
      });
      await e.attendre(1.1);
      e.portail("repos");
      await G(e, d, a[0], a[1] - 0.5, { vitesse: 0.8 });
      l.capVise = e.cap(0);
      l.jouer("pencher", { fondu: 0.2 });
      await e.attendre(0.9);
      l.jouer("brandir", { fondu: 0.15, redemarrer: true });
      await e.attendre(0.25);
      d.fixer(n, 9, [0, 0.02, 0.03]);
      await e.attendre(1.1);
      const s = F(e), b = s.userData.boule, h = e.local(0, -0.75);
      s.position.copy(h);
      s.scale.setScalar(0.01);
      let w = 0;
      e.chaque(() => {
        w = Math.min(1, w + e.dt / 0.8);
        e.portail(w < 1 ? "tele" : "allume", w);
        s.scale.setScalar(Math.max(0.01, e.lisse(w)));
        s.position.x = h.x + Math.sin(w * 60) * 0.015 * (1 - w);
        return w < 1;
      });
      l.capVise = e.cap(Math.PI);
      l.jouer("peur", { fondu: 0.1 });
      await e.attendre(0.9);
      l.capVise = e.cap(1.1);
      l.jouer("courir", { fondu: 0.1 });
      const v = l.allerVers(e.local(4.6, 4.2), { courir: true, vitesse: 1.15 });
      e.suivreCamera(() => l.objet.position.clone().lerp(s.position, 0.75).setY(0.6));
      await e.attendre(0.35);
      const j = O(e), M = j.getLength();
      let q = 0, P = 4.2;
      const g = new (c()).Vector3(), k = new (c()).Vector3();
      await new Promise((V) => e.chaque(() => {
        P = Math.max(0.25, P - e.dt * (q > M * 0.55 ? 3.2 : 0.4));
        const y = Math.min(M - q, P * e.dt);
        q += y;
        const x = q / M, Y = j.getPointAt(x);
        k.copy(j.getTangentAt(x));
        s.position.copy(Y);
        g.set(k.z, 0, -k.x).normalize();
        b.rotateOnWorldAxis(g, y / R.r);
        _(e, o, u, Y, e.dt);
        if (q >= M - 1e-4) {
          V();
          return false;
        }
      }));
      e.portail("repos");
      e.obstacle(r, R.r);
      if (u.pivot) e.obstacle(u.pivot.position, 0.3 * t);
      e.suivreCamera(r.clone().setY(0.6), 0.15);
      await Promise.race([v, e.attendre(1.2)]);
      d.fixer(n, null);
      n.visible = false;
      l.jouer("repos", { fondu: 0.2 });
    };
  };
  const N = async (e, r = 0, t = 1.3, a = {}) => {
    const o = e.heros;
    await E(e, o, a.duree ?? 1.1);
    if (a.eteindre !== false) e.portail("repos");
    if (r != null) await G(e, o, r, t, { vitesse: a.vitesse ?? 0.9 });
  };
  const Q = (e, r, t = "#e8322f") => {
    const a = document.createElement("canvas");
    a.width = a.height = 128;
    const o = a.getContext("2d");
    o.font = "900 112px Nunito, sans-serif";
    o.textAlign = "center";
    o.textBaseline = "middle";
    o.lineWidth = 14;
    o.strokeStyle = "#fff";
    o.strokeText(r, 64, 70);
    o.fillStyle = t;
    o.fillText(r, 64, 70);
    const i = new (c()).CanvasTexture(a);
    i.colorSpace = c().SRGBColorSpace;
    const u = e.objet(null), d = new (c()).Sprite(new (c()).SpriteMaterial({ map: i, depthTest: false, transparent: true }));
    d.renderOrder = 10;
    u.add(d);
    return u;
  };
  const U = (e) => {
    const r = e.objet(null, true), t = e.h, a = z(9067051), o = z(6175256), i = new (c()).MeshPhongMaterial({ color: 15053882, shininess: 80, specular: 16773808 });
    const u = 0.62 * t, d = 0.34 * t, l = 0.42 * t;
    D(r, a, u, d, l, 0, d / 2, 0);
    D(r, i, u + 0.01, 0.05 * t, l + 0.01, 0, d * 0.85, 0);
    D(r, o, u + 0.012, d * 0.5, 0.03 * t, 0, d * 0.35, l / 2);
    for (const p of [-1, 1]) D(r, i, 0.05 * t, d + 0.01, l + 0.012, p * u * 0.38, d / 2, 0);
    const n = new (c()).Group();
    n.position.set(0, d, -l / 2);
    r.add(n);
    const f = new (c()).Mesh(new (c()).CylinderGeometry(l / 2, l / 2, u, 16, 1, false, 0, Math.PI), a);
    f.rotation.z = Math.PI / 2;
    f.position.set(0, 0, l / 2);
    n.add(f);
    for (const p of [-1, 1]) {
      const s = new (c()).Mesh(new (c()).CylinderGeometry(l / 2 + 0.01, l / 2 + 0.01, 0.05 * t, 16, 1, false, 0, Math.PI), i);
      s.rotation.z = Math.PI / 2;
      s.position.set(p * u * 0.38, 0, l / 2);
      n.add(s);
    }
    D(n, i, 0.08 * t, 0.1 * t, 0.03 * t, 0, 0.02 * t, l + 0.01);
    const m = new (c()).Mesh(new (c()).PlaneGeometry(u * 0.9, l * 0.9), I(16774048, { transparent: true, opacity: 0, blending: c().AdditiveBlending, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = d + 0.01;
    r.add(m);
    r.userData.ouvrir = (p) => {
      n.rotation.x = -1.9 * p;
      m.material.opacity = 0.9 * Math.sin(Math.min(1, p) * Math.PI) + 0.2 * p;
    };
    return r;
  };
  C.s5 = (e) => {
    const r = [1.15, 1.75], t = U(e);
    t.position.copy(e.local(...r));
    t.rotation.y = e.cap(-0.5);
    if (e.deja) {
      t.userData.ouvrir(1);
      return null;
    }
    e.heros.m.objet.visible = false;
    const a = e.heros, o = a.m, i = e.h;
    return async () => {
      await N(e, r[0] - 0.55, r[1] - 0.5);
      o.capVise = e.vers(a, t.position);
      o.jouer("pencher", { fondu: 0.2 });
      await e.attendre(0.6);
      let u = 0;
      e.chaque(() => {
        u = Math.min(1, u + e.dt / 0.9);
        t.userData.ouvrir(e.lisse(u));
        return u < 1;
      });
      await e.attendre(1);
      const d = e.objet(null), l = new (c()).MeshPhongMaterial({ color: 2348117, emissive: 743970, specular: 14221280, shininess: 120, transparent: true, opacity: 0.78 });
      {
        const m = new (c()).Shape(), p = 0.075 * i, s = 0.17 * i;
        m.moveTo(0, s);
        m.lineTo(p, s * 0.55);
        m.lineTo(p, -s * 0.55);
        m.lineTo(0, -s);
        m.lineTo(-p, -s * 0.55);
        m.lineTo(-p, s * 0.55);
        m.closePath();
        const b = new (c()).ExtrudeGeometry(m, { depth: 0.025 * i, bevelEnabled: true, bevelSize: 0.022 * i, bevelThickness: 0.02 * i, bevelSegments: 1 });
        b.translate(0, 0, -0.0125 * i);
        d.add(new (c()).Mesh(b, l));
        const h = new (c()).Shape();
        h.moveTo(0, s * 0.55);
        h.lineTo(p * 0.45, s * 0.3);
        h.lineTo(p * 0.45, -s * 0.3);
        h.lineTo(0, -s * 0.55);
        h.lineTo(-p * 0.45, -s * 0.3);
        h.lineTo(-p * 0.45, s * 0.3);
        h.closePath();
        const w = new (c()).Mesh(new (c()).ShapeGeometry(h), new (c()).MeshBasicMaterial({ color: 12124104, transparent: true, opacity: 0.55, side: c().DoubleSide }));
        w.position.z = 0.036 * i;
        d.add(w);
        const v = w.clone();
        v.position.z = -0.036 * i;
        d.add(v);
      }
      d.position.copy(t.position).setY(0.42 * i);
      o.capVise = e.vers(a, e.camera());
      o.jouer("brandir", { fondu: 0.15, redemarrer: true });
      e.son("choisir");
      const n = d.position.clone();
      let f = 0;
      await new Promise((m) => e.chaque(() => {
        f = Math.min(1, f + e.dt / 0.55);
        const p = a.os(3).add(new (c()).Vector3(0, 0.62 * i, 0));
        d.position.lerpVectors(n, p, e.lisse(f));
        d.position.y += Math.sin(f * Math.PI) * 0.25 * i;
        d.rotation.y = e.vers(a, e.camera()) + Math.sin(performance.now() / 400) * 0.35;
        if (f >= 1) {
          m();
          return false;
        }
      }));
      a.fixer(d, 3, [0, 0.62, 0]);
      e.chaque(() => {
        d.rotation.y += Math.sin(performance.now() / 400) * 4e-3;
        return d.visible;
      });
      e.suivreCamera(o.objet.position.clone().setY(0.9), 0.3);
      await e.attendre(1.8);
      a.fixer(d, null);
      d.visible = false;
      o.jouer("repos", { fondu: 0.2 });
      e.suivreCamera(null);
      await e.attendre(0.3);
    };
  };
  C.s6 = (e) => {
    const r = [-0.9, 2], t = e.h;
    if (e.deja) {
      const i = e.objet("o3", true);
      i.position.copy(e.local(r[0] - 1, r[1] + 0.1));
      i.rotation.y = e.cap(0.3);
      return null;
    }
    const a = e.heros, o = a.m;
    o.objet.visible = false;
    return async () => {
      const i = e.objet("o3", true), u = e.local(0, -0.75);
      i.position.copy(u);
      i.rotation.y = e.cap(0);
      i.scale.setScalar(0.01);
      let d = 0;
      e.chaque(() => {
        d += e.dt;
        const h = Math.min(1, d / 1);
        e.portail(h < 1 ? "tele" : "allume", h);
        i.scale.setScalar(Math.max(0.01, e.lisse(h / 0.7)));
        return h < 1;
      });
      await e.attendre(1);
      e.portail("repos");
      const l = e.local(...r), n = i.position.clone();
      let f = 0;
      e.suivreCamera(e.local(r[0] * 0.6, r[1] * 0.7, 0.7), 0.3);
      e.chaque(() => {
        f = Math.min(1, f + e.dt / 2.4);
        const h = (f * 3 + Math.sin(f * 3 * Math.PI * 2) / (Math.PI * 2)) / 3;
        i.position.lerpVectors(n, l, h);
        i.rotation.y = e.cap(-0.25 * Math.sin(f * Math.PI));
        i.position.y = Math.abs(Math.sin(f * 3 * Math.PI)) * 0.015;
        return f < 1;
      });
      await e.attendre(2.6);
      i.position.y = 0;
      const m = Q(e, "!");
      m.position.copy(l).setY(1.45 * t);
      let p = 0;
      e.chaque(() => {
        p += e.dt;
        const h = p < 0.12 ? p / 0.12 * 1.3 : 1.3 - 0.3 * Math.min(1, (p - 0.12) / 0.1);
        m.scale.setScalar(0.75 * t * h);
        return p < 1.2;
      });
      e.son("choisir");
      await e.attendre(0.9);
      m.visible = false;
      o.objet.position.copy(l);
      o.cap = o.capVise = e.vers(a, e.camera());
      o.jouer("brandir", { fondu: 0, redemarrer: true });
      let s = 0;
      const b = e.local(r[0] - 1, r[1] + 0.1);
      e.chaque(() => {
        s = Math.min(1, s + e.dt / 1.4);
        if (s > 0.04) o.objet.visible = true;
        if (s < 0.45) i.position.copy(l).setY(t * 0.95 * e.lisse(s / 0.45));
        else {
          const h = e.lisse((s - 0.45) / 0.55);
          i.position.lerpVectors(l, b, h).setY(t * 0.95 * (1 - h));
          i.rotation.y = e.cap(0.3 * h);
        }
        return s < 1;
      });
      await e.attendre(1);
      o.jouer("repos", { fondu: 0.25 });
      await e.attendre(0.6);
      i.position.y = 0;
      e.suivreCamera(null);
    };
  };
  const S = (e) => {
    const r = e.objet(null), t = e.h, a = new (c()).Group();
    r.add(a);
    const o = new (c()).MeshPhongMaterial({ color: 16250866, emissive: 3947578, shininess: 25 }), i = (n, f, m, p = 20) => {
      const s = new (c()).Mesh(new (c()).SphereGeometry(1, p, Math.round(p * 0.7)), m);
      s.scale.set(...n);
      s.position.set(...f);
      a.add(s);
      return s;
    };
    i([0.26 * t, 0.25 * t, 0.25 * t], [0, 0, 0], o, 28);
    const u = new (c()).Mesh(new (c()).ConeGeometry(0.09 * t, 0.22 * t, 12), o);
    u.position.set(0.05 * t, -0.06 * t, -0.26 * t);
    u.rotation.set(-Math.PI / 2 - 0.7, 0, 0.4);
    a.add(u);
    const d = new (c()).Mesh(new (c()).CircleGeometry(0.13 * t, 24, Math.PI, Math.PI), new (c()).MeshBasicMaterial({ color: 5901592, side: c().DoubleSide }));
    d.position.set(0, -0.02 * t, 0.248 * t);
    d.rotation.x = -0.15;
    a.add(d);
    for (const n of [-1, 1]) {
      const f = new (c()).Mesh(new (c()).ConeGeometry(0.022 * t, 0.05 * t, 6), new (c()).MeshBasicMaterial({ color: 16777215 }));
      f.rotation.z = Math.PI;
      f.position.set(n * 0.065 * t, -0.04 * t, 0.252 * t);
      a.add(f);
    }
    const l = i([0.07 * t, 0.1 * t, 0.03 * t], [-0.02 * t, -0.12 * t, 0.24 * t], z(16740238));
    l.rotation.x = 0.4;
    for (const n of [-1, 1]) {
      const f = i([0.03 * t, 0.055 * t, 0.015 * t], [n * 0.085 * t, 0.09 * t, 0.232 * t], new (c()).MeshBasicMaterial({ color: 1315860 }), 14);
      f.rotation.z = -n * 0.35;
      i([0.07 * t, 0.05 * t, 0.06 * t], [n * 0.25 * t, -0.01 * t, 0.05 * t], o, 14);
    }
    r.userData.i = a;
    return r;
  };
  C.s7 = (e) => {
    if (e.deja) return null;
    const r = e.heros, t = r.m, a = e.h;
    t.objet.visible = false;
    const o = e.objet(null);
    T(o, z(2899599), 0.035 * a, 0.045 * a, 0.16 * a, 0, 0, 0, 10);
    o.children[0].rotation.x = Math.PI / 2;
    const i = new (c()).Mesh(new (c()).ConeGeometry(0.13 * a, 1.2 * a, 20, 1, true), I(16774848, { transparent: true, opacity: 0.12, blending: c().AdditiveBlending, depthWrite: false, side: c().DoubleSide }));
    i.rotation.x = -Math.PI / 2 - 0.12;
    i.position.set(0, 0.07 * a, 0.68 * a);
    o.add(i);
    r.fixer(o, 9, [0, 0, 0.05]);
    const u = e.objet(null);
    T(u, z(10135459), 0.09 * a, 0.09 * a, 0.24 * a, 0, 0, 0, 16);
    T(u, z(5069399), 0.095 * a, 0.095 * a, 0.04 * a, 0, 0.07 * a, 0, 16);
    const d = new (c()).Mesh(new (c()).CircleGeometry(0.035 * a, 16), z(15921382));
    d.position.set(0, 0.03 * a, -0.095 * a);
    d.rotation.y = Math.PI;
    u.add(d);
    r.fixer(u, 2, [0, 0.03, -0.15]);
    const l = e.objet(null);
    T(l, z(5069399), 0.03 * a, 0.06 * a, 0.22 * a, 0, 0, 0, 12);
    l.children[0].rotation.x = Math.PI / 2;
    r.fixer(l, 6, [0, 0, 0.08]);
    const n = S(e);
    n.visible = false;
    return async () => {
      let f = true;
      e.chaque(() => {
        if (f && t.objet.visible) t.objet.position.x += Math.sin(performance.now() / 18) * 4e-3;
      });
      await E(e, r, 1.1);
      t.jouer("peur", { fondu: 0.2 });
      await e.attendre(0.5);
      const m = G(e, r, 0.3, 1.9, { vitesse: 0.7 });
      await e.attendre(0.6);
      n.visible = true;
      let p = 0;
      e.chaque(() => {
        p = Math.min(1, p + e.dt / 0.5);
        const q = t.objet.position, P = e.local(0, 0).sub(e.local(0, 1)).normalize();
        const g = performance.now() / 1e3, k = e.local(-1, 0).sub(e.local(0, 0)), V = q.clone().addScaledVector(P, 0.55 * a).addScaledVector(k, Math.sin(g * 1.6) * 0.75 * a).setY(0.7 * a + Math.sin(g * 3.1) * 0.08 * a);
        n.userData.i.rotation.z = Math.sin(g * 1.6 + 1.2) * 0.25;
        n.position.lerp(p < 1 ? e.local(0, -0.6, 0.7 * a) : V, p < 1 ? 1 : Math.min(1, e.dt * 3));
        n.scale.setScalar(Math.max(0.01, p));
        n.lookAt(q.clone().setY(n.position.y));
        return !n.userData.libre;
      });
      await m;
      t.jouer("peur", { fondu: 0.15 });
      await e.attendre(0.7);
      n.userData.libre = true;
      f = false;
      i.visible = false;
      t.capVise = e.vers(r, n.position);
      t.jouer("sauter", { fondu: 0.05, redemarrer: true });
      let s = 0;
      e.chaque(() => {
        s = Math.min(1, s + e.dt / 0.35);
        t.objet.position.y = Math.sin(s * Math.PI) * 0.18 * a;
        return s < 1;
      });
      await e.attendre(0.45);
      t.jouer("viser", { fondu: 0.1 });
      e.suivreCamera(t.objet.position.clone().lerp(n.position, 0.5).setY(0.6), 0.3);
      const b = n.position.clone();
      let h = 0;
      e.chaque(() => {
        h = Math.min(1, h + e.dt / 1.5);
        const q = l.position, P = e.lisse(h);
        n.position.lerpVectors(b, q, P * P);
        n.userData.i.rotation.z = h * 9;
        n.scale.set(Math.max(0.01, 1 - P) * (1 + 0.3 * Math.sin(h * 30)), Math.max(0.01, 1 - P), Math.max(0.01, 1 - P) * (1 + 0.5 * P));
        return h < 1;
      });
      await e.attendre(1.6);
      n.visible = false;
      t.capVise = e.vers(r, e.local(0, -0.8));
      await e.attendre(0.4);
      t.jouer("projeter", { fondu: 0.08, redemarrer: true });
      n.visible = true;
      const w = l.position.clone(), v = e.local(0, -0.85, 0.8);
      let j = 0;
      e.portail("allume");
      e.chaque(() => {
        j = Math.min(1, j + e.dt / 0.55);
        n.position.lerpVectors(w, v, j);
        n.scale.setScalar(Math.max(0.01, j < 0.3 ? j / 0.3 : 1 - (j - 0.7) / 0.3 * 0.9));
        n.userData.i.rotation.z += e.dt * 14;
        return j < 1;
      });
      await e.attendre(0.6);
      n.visible = false;
      let M = 0;
      e.chaque(() => {
        M = Math.min(1, M + e.dt / 0.6);
        e.portail("tele", 1 - M);
        return M < 1;
      });
      await e.attendre(0.65);
      e.portail("repos");
      t.capVise = e.vers(r, e.camera());
      t.jouer("content", { fondu: 0.2 });
      e.suivreCamera(null);
      await e.attendre(1.1);
      for (const q of [o, u, l]) {
        r.fixer(q, null);
        q.visible = false;
      }
      t.jouer("repos", { fondu: 0.2 });
    };
  };
  const H = [[0, 0.52, -0.2], [0, 0, Math.PI * 0.86]];
  C.s10 = (e) => {
    const r = e.heros, t = r.m, a = e.h;
    const o = e.objet("o11", true);
    o.children[0].scale.multiplyScalar(0.56);
    if (e.deja) {
      r.fixer(o, 2, ...H);
      return null;
    }
    t.objet.visible = false;
    o.visible = false;
    return async () => {
      t.objet.position.copy(e.local(0, -0.75));
      t.cap = t.capVise = e.cap(0);
      let i = 0;
      e.chaque(() => {
        i += e.dt;
        const u = Math.min(1, i / 0.7);
        e.portail(u < 1 ? "tele" : "allume", u);
        return u < 1;
      });
      await e.attendre(0.55);
      t.objet.visible = true;
      o.visible = true;
      r.fixer(o, 9, [0, 0.02, 0.02], [-0.25, 0, 0]);
      e.suivreCamera(e.local(0, 1.2, 0.9), 0.25);
      await t.sauterVers(e.local(0.1, 1.9), { hauteur: 1.1, prep: 0.05, ensuite: "garde" });
      e.portail("repos");
      r.fixer(o, 9, [-0.1, 0, 0.05], [0.95, 0, -0.45]);
      t.capVise = e.vers(r, e.camera());
      t.jouer("garde", { fondu: 0.1 });
      await e.attendre(1.1);
      t.jouer("brandir", { fondu: 0.15, redemarrer: true });
      r.fixer(o, 9, [0, 0.02, 0.02], [-0.3, 0, 0]);
      await e.attendre(0.45);
      r.fixer(o, 2, ...H);
      t.jouer("repos", { fondu: 0.2 });
      await e.attendre(0.9);
      e.suivreCamera(null);
      await e.attendre(0.3);
    };
  };
  C.s12 = (e) => {
    if (e.deja) return null;
    const r = e.heros, t = r.m, a = e.h;
    t.objet.visible = false;
    return async () => {
      let o = 0;
      e.chaque(() => {
        o += e.dt;
        const M = Math.min(1, o / 0.6);
        e.portail(M < 1 ? "tele" : "allume", M);
        return M < 1;
      });
      await e.attendre(0.5);
      const i = document.createElement("canvas");
      i.width = i.height = 128;
      const u = i.getContext("2d"), d = u.createRadialGradient(64, 64, 0, 64, 64, 64);
      d.addColorStop(0, "rgba(235,250,255,1)");
      d.addColorStop(0.3, "rgba(110,200,255,1)");
      d.addColorStop(0.62, "rgba(30,110,255,.95)");
      d.addColorStop(0.85, "rgba(20,70,220,.5)");
      d.addColorStop(1, "rgba(20,60,200,0)");
      u.fillStyle = d;
      u.fillRect(0, 0, 128, 128);
      const l = new (c()).CanvasTexture(i), n = e.objet(null), f = new (c()).Sprite(new (c()).SpriteMaterial({ map: l, transparent: true, depthWrite: false }));
      n.add(f);
      const m = new (c()).Sprite(f.material);
      m.scale.setScalar(0.6);
      m.position.set(0, 0, 0);
      n.add(m);
      const p = e.local(0, -0.6, 0.55 * a), s = e.local(0, 5.5, 0.55 * a), b = s.clone().sub(p).normalize();
      e.suivreCamera(e.local(0, 1.2, 0.7), 0.3);
      let h = 0;
      e.chaque(() => {
        h = Math.min(1, h + e.dt / 0.8);
        n.position.lerpVectors(p, s, h);
        const M = (0.75 + 0.12 * Math.sin(h * 60)) * Math.min(1, h * 6) * (h > 0.85 ? (1 - h) / 0.15 : 1) * a;
        f.scale.setScalar(M);
        m.scale.setScalar(M * 0.7);
        m.position.copy(b).multiplyScalar(-M * 0.45);
        n.visible = h < 1;
        return h < 1;
      });
      await e.attendre(0.55);
      t.objet.position.copy(e.local(0, -0.6));
      t.objet.visible = true;
      t.jouer("coupPied", { fondu: 0, redemarrer: true });
      const w = e.local(0, -0.6), v = e.local(0, 1.7);
      let j = 0;
      e.chaque(() => {
        j = Math.min(1, j + e.dt / 0.9);
        t.objet.position.lerpVectors(w, v, j);
        t.objet.position.y = Math.sin(j * Math.PI) * 0.3 * a + 0.15 * a * (1 - j);
        t.cap = t.capVise = e.cap(j * Math.PI * 6);
        return j < 1;
      });
      await e.attendre(0.9);
      t.objet.position.y = 0;
      e.portail("repos");
      t.cap = t.capVise = e.vers(r, e.camera());
      t.jouer("atterrir", { fondu: 0.05, redemarrer: true });
      await e.attendre(0.35);
      t.jouer("garde", { fondu: 0.15 });
      await e.attendre(1.3);
      t.jouer("repos", { fondu: 0.2 });
      e.suivreCamera(null);
      await e.attendre(0.2);
    };
  };
  C.s13 = (e) => {
    if (e.deja) return null;
    const r = e.heros, t = r.m, a = e.h;
    t.objet.visible = false;
    return async () => {
      await N(e, 0, 1.15);
      t.capVise = e.cap(0);
      t.jouer("deposer", { fondu: 0.15, redemarrer: true });
      await e.attendre(0.35);
      const o = e.objet("o15"), i = o.children[0]?.children[0], u = e.local(0, 1.75);
      o.position.copy(u);
      o.rotation.y = e.cap(0);
      let d = 0;
      e.chaque(() => {
        d = Math.min(1, d + e.dt / 0.25);
        o.scale.setScalar(0.7 + 0.3 * e.lisse(d));
        return d < 1;
      });
      await e.attendre(0.35);
      t.capVise = e.vers(r, e.local(1.2, 0.55));
      await G(e, r, 1.2, 0.55, { courir: true, vitesse: 1.1 });
      t.capVise = e.vers(r, u);
      t.jouer("accroupi", { fondu: 0.15 });
      e.suivreCamera(u.clone().lerp(e.local(1.2, 0.55), 0.4).setY(0.5), 0.25);
      const l = new (c()).Sprite(new (c()).SpriteMaterial({ color: 16765498, transparent: true, blending: c().AdditiveBlending, depthWrite: false }));
      o.add(l);
      let n = 0;
      e.chaque(() => {
        n = Math.min(1, n + e.dt / 1.4);
        i?.userData.rougir?.(n);
        o.scale.setScalar(1 + 0.12 * n + 0.05 * Math.sin(n * 50) * n);
        l.position.set(0, 0.78 * a, 0);
        l.scale.setScalar(0.12 * a * (1 + 0.5 * Math.sin(n * 90)));
        return n < 1;
      });
      await e.attendre(1.45);
      o.visible = false;
      const f = e.objet(null), m = I(16738842, { transparent: true, depthWrite: false }), p = I(16767050, { transparent: true, depthWrite: false });
      const s = 1.5;
      for (let v = 0; v < 4; v++) {
        const j = new (c()).Mesh(new (c()).CylinderGeometry(0.16 * a, 0.26 * a, s, 12), m);
        j.rotation.z = Math.PI / 2;
        const M = new (c()).Group();
        M.rotation.y = v * Math.PI / 2;
        j.position.x = s / 2;
        M.add(j);
        const q = new (c()).Mesh(new (c()).CylinderGeometry(0.08 * a, 0.13 * a, s * 0.9, 10), p);
        q.rotation.z = Math.PI / 2;
        q.position.x = s * 0.45;
        M.add(q);
        f.add(M);
      }
      const b = new (c()).Mesh(new (c()).SphereGeometry(0.42 * a, 16, 12), p);
      f.add(b);
      f.position.copy(u).setY(0.3 * a);
      f.rotation.y = e.cap(0);
      const h = [];
      for (let v = 0; v < 6; v++) {
        const j = e.objet("o18");
        j.position.copy(u).add(new (c()).Vector3(Math.cos(v) * 0.3, 0.2 * a, Math.sin(v) * 0.3));
        j.scale.setScalar(0.01);
        h.push(j);
      }
      let w = 0;
      e.son("choisir");
      e.chaque(() => {
        w += e.dt;
        const v = Math.min(1, w / 0.15), j = w < 0.5 ? 1 : Math.max(0, 1 - (w - 0.5) / 0.3);
        f.scale.set(v, 1, v);
        m.opacity = 0.9 * j;
        p.opacity = j;
        f.visible = j > 0;
        for (const M of h) {
          M.scale.setScalar(Math.min(0.7, w * 0.9));
          M.position.y += e.dt * 0.25;
          M.traverse((q) => {
            if (q.material) q.material.opacity = Math.max(0, 0.9 - w / 1.6);
          });
        }
        return w < 1.6;
      });
      await e.attendre(0.45);
      t.capVise = e.vers(r, e.camera());
      t.jouer("victoire", { fondu: 0.15, redemarrer: true });
      await e.attendre(1.6);
      t.jouer("repos", { fondu: 0.2 });
      e.suivreCamera(null);
      await e.attendre(0.2);
    };
  };
  C.s11 = (e) => {
    if (e.deja) return null;
    const r = e.heros, t = r.m, a = e.h;
    t.objet.visible = false;
    return async () => {
      const o = e.objet("o14"), i = 0.3 * a, u = o.children[0]?.children[0];
      o.visible = false;
      let d = 0;
      e.chaque(() => {
        d += e.dt;
        const p = Math.min(1, d / 0.7);
        e.portail(p < 1 ? "tele" : "allume", p);
        return p < 1;
      });
      await e.attendre(0.55);
      const l = new (c()).CatmullRomCurve3([e.local(0, -0.7), e.local(0.9, 0.6), e.local(0.6, 2), e.local(-0.6, 2.1), e.local(-0.7, 1.3)].map((p) => p.setY(0))), n = l.getLength();
      let f = 0;
      o.visible = true;
      e.portail("allume");
      await new Promise((p) => e.chaque(() => {
        const s = f < n * 0.7 ? 3.4 : Math.max(0.7, 3.4 * (1 - (f - n * 0.7) / (n * 0.3)));
        f = Math.min(n, f + s * e.dt);
        const b = f / n, h = l.getPointAt(b), w = l.getTangentAt(b);
        o.position.copy(h).setY(i);
        o.rotation.y = Math.atan2(w.x, w.z) - Math.PI / 2;
        u?.userData.rouler?.(s * e.dt / i);
        if (f >= n) {
          p();
          return false;
        }
      }));
      e.portail("repos");
      o.visible = false;
      t.objet.position.copy(l.getPointAt(1));
      t.cap = t.capVise = e.vers(r, e.camera());
      t.objet.visible = true;
      t.jouer("atterrir", { fondu: 0, redemarrer: true });
      await e.attendre(0.45);
      t.jouer("viser", { fondu: 0.2 });
      await e.attendre(1.1);
      e.suivreCamera(t.objet.position.clone().setY(0.8), 0.35);
      t.jouer("brandir", { fondu: 0.15, redemarrer: true });
      await e.attendre(0.45);
      const m = r.retirerChapeau();
      if (m) {
        const p = e.objet(null);
        p.add(m.copie);
        m.copie.position.set(0, 0, 0);
        m.copie.quaternion.identity();
        m.copie.scale.multiplyScalar(0.9);
        r.fixer(p, 6, [0.02, -0.02, 0.14]);
        t.jouer("repos", { fondu: 0.25 });
        await e.attendre(0.4);
        t.jouer("content", { fondu: 0.2, redemarrer: true });
        await e.attendre(1.6);
        t.jouer("brandir", { fondu: 0.15, redemarrer: true });
        await e.attendre(0.4);
        r.fixer(p, null);
        p.visible = false;
        await m.remettre();
      }
      t.jouer("repos", { fondu: 0.2 });
      e.suivreCamera(null);
      await e.attendre(0.3);
    };
  };
  C.s4 = (e) => {
    if (e.deja) return null;
    const r = e.heros, t = r.m, a = e.h;
    t.objet.visible = false;
    return async () => {
      const o = e.local(0, 1.25), i = e.objet(null), u = I(16777215, { transparent: true, depthWrite: false }), d = I(2795775, { transparent: true, opacity: 0.9, depthWrite: false }), l = I(5818623, { transparent: true, opacity: 0.45, blending: c().AdditiveBlending, depthWrite: false });
      const n = 0.95 * a;
      for (const [p, s] of [[0.035, u], [0.075, d], [0.13, l]]) {
        const b = new (c()).Mesh(new (c()).CapsuleGeometry(p * a, n, 6, 12), s);
        i.add(b);
      }
      i.position.copy(o).setY(5.5);
      i.scale.set(1.4, 1, 1.4);
      e.suivreCamera(o.clone().setY(0.9), 0.25);
      await new Promise((p) => e.chaque(() => {
        i.position.y = Math.max(n / 2, i.position.y - e.dt * 9.5);
        if (i.position.y <= n / 2) {
          p();
          return false;
        }
      }));
      e.son("choisir");
      e.onde();
      let f = 0;
      await new Promise((p) => e.chaque(() => {
        f += e.dt;
        const s = Math.min(1, f / 0.28);
        i.scale.set(1.4 + 1.8 * s, 1 - 0.82 * s, 1.4 + 1.8 * s);
        i.position.y = n / 2 * (1 - 0.82 * s);
        if (s >= 1) {
          p();
          return false;
        }
      }));
      t.objet.position.copy(o);
      t.cap = t.capVise = e.vers(r, e.camera());
      t.jouer("garde", { fondu: 0, redemarrer: true });
      let m = 0;
      await new Promise((p) => e.chaque(() => {
        m += e.dt;
        t.objet.visible = m > 0.16 || Math.floor(m * 30) % 2 === 0;
        i.visible = m < 0.12;
        if (m >= 0.3) {
          t.objet.visible = true;
          p();
          return false;
        }
      }));
      e.portail("repos");
      await e.attendre(1.1);
      t.jouer("viser", { fondu: 0.2 });
      await e.attendre(0.8);
      t.jouer("repos", { fondu: 0.2 });
      e.suivreCamera(null);
      await e.attendre(0.3);
    };
  };
  const B = (e, r) => {
    const t = document.createElement("canvas");
    t.width = t.height = e;
    r(t.getContext("2d"), e);
    const a = new (c()).CanvasTexture(t);
    a.magFilter = a.minFilter = c().NearestFilter;
    a.generateMipmaps = false;
    a.colorSpace = c().SRGBColorSpace;
    return a;
  };
  let L = 7;
  const A = () => (L = L * 48271 % 2147483647) / 2147483647;
  const $ = (e) => {
    const r = new (c()).Group(), t = 0.6, a = -0.95;
    L = 7;
    const o = B(16, (p) => {
      for (let s = 0; s < 16; s++) for (let b = 0; b < 16; b++) {
        const h = A();
        p.fillStyle = h > 0.93 ? "#5b3b8c" : h > 0.8 ? "#2c1d45" : h > 0.45 ? "#140f20" : "#0b0812";
        p.fillRect(b, s, 1, 1);
      }
    });
    const i = new (c()).MeshLambertMaterial({ map: o, emissive: 853528 }), u = new (c()).BoxGeometry(t, t, t);
    for (let p = 0; p < 4; p++) for (let s = 0; s < 5; s++) if (p === 0 || p === 3 || s === 0 || s === 4) {
      const b = new (c()).Mesh(u, i);
      b.position.set((p - 1.5) * t, (s + 0.5) * t - 0.12, a);
      r.add(b);
    }
    const d = B(32, (p) => {
      for (let s = 0; s < 32; s++) for (let b = 0; b < 32; b++) {
        const h = 0.5 + 0.5 * Math.sin(b * 0.55 + Math.sin(s * 0.4) * 2.2) * Math.cos(s * 0.35 - b * 0.2);
        p.fillStyle = `rgba(${130 + 90 * h | 0},${30 + 40 * h | 0},${200 + 55 * h | 0},${0.6 + 0.35 * h})`;
        p.fillRect(b, s, 1, 1);
      }
    });
    d.wrapS = d.wrapT = c().RepeatWrapping;
    const l = new (c()).Mesh(new (c()).PlaneGeometry(2 * t, 3 * t), new (c()).MeshBasicMaterial({ map: d, transparent: true, opacity: 0.85, side: c().DoubleSide, depthWrite: false, fog: false }));
    l.position.set(0, 2.5 * t - 0.12, a);
    r.add(l);
    const n = performance.now();
    l.onBeforeRender = () => {
      const p = (performance.now() - n) / 1e3;
      d.offset.set(Math.sin(p * 0.7) * 0.1, p * 0.12);
      l.material.opacity = 0.8 + 0.08 * Math.sin(p * 2.3);
    };
    const f = B(8, (p) => {
      p.fillStyle = "#e9b6ff";
      p.fillRect(2, 2, 4, 4);
      p.fillStyle = "#b25cff";
      p.fillRect(3, 3, 2, 2);
    }), m = [];
    for (let p = 0; p < 18; p++) {
      const s = new (c()).Sprite(new (c()).SpriteMaterial({ map: f, transparent: true, depthWrite: false, fog: false }));
      s.scale.setScalar(0.07);
      r.add(s);
      m.push({ sp: s, x: (A() - 0.5) * 1.4, y: A() * 2.4, z: a + (A() - 0.5) * 0.8, v: 0.2 + A() * 0.35 });
    }
    l.onAfterRender = () => {
      const p = (performance.now() - n) / 1e3;
      for (const s of m) {
        const b = (s.y + p * s.v) % 2.6;
        s.sp.position.set(s.x + Math.sin(p + s.v * 9) * 0.05, b, s.z);
        s.sp.material.opacity = Math.min(1, (2.6 - b) / 0.8);
      }
    };
    return r;
  };
  const ee = (e) => {
    const r = e.objet(null, true), t = e.h, a = 0.5 * t;
    const o = B(16, (l) => {
      l.fillStyle = "#a0763f";
      l.fillRect(0, 0, 16, 16);
      l.fillStyle = "#6b4a22";
      for (let n = 0; n < 16; n++) {
        l.fillRect(n, 0, 1, 1);
        l.fillRect(0, n, 1, 1);
        l.fillRect(n, 15, 1, 1);
        l.fillRect(15, n, 1, 1);
      }
      l.fillStyle = "#4a3317";
      for (const n of [5, 10]) {
        l.fillRect(2, n, 12, 1);
        l.fillRect(n, 2, 1, 12);
      }
      l.fillStyle = "#c49a5a";
      l.fillRect(3, 3, 2, 2);
      l.fillRect(11, 11, 2, 2);
    });
    const i = B(16, (l) => {
      l.fillStyle = "#8a6131";
      l.fillRect(0, 0, 16, 16);
      l.fillStyle = "#6b4a22";
      for (const n of [0, 4, 8, 12]) l.fillRect(0, n, 16, 1);
      l.fillStyle = "#3a3a3a";
      l.fillRect(3, 6, 2, 6);
      l.fillRect(2, 5, 4, 2);
      l.fillStyle = "#8f8f8f";
      l.fillRect(10, 6, 2, 7);
      l.fillStyle = "#5a3d22";
      l.fillRect(9, 5, 4, 2);
      l.fillStyle = "#a0763f";
      l.fillRect(0, 0, 16, 3);
    });
    const u = (l) => new (c()).MeshLambertMaterial({ map: l });
    const d = new (c()).Mesh(new (c()).BoxGeometry(a, a, a), [u(i), u(i), u(o), u(i), u(i), u(i)]);
    d.position.y = a / 2;
    r.add(d);
    return r;
  };
  const X = (e, r, t, a) => {
    const o = new (c()).Group(), i = a / 16, u = new (c()).BoxGeometry(i, i, i * 1.2), d = {};
    r.forEach((l, n) => [...l].forEach((f, m) => {
      if (f === ".") return;
      const p = new (c()).Mesh(u, d[f] ||= new (c()).MeshLambertMaterial({ color: t[f], emissive: new (c()).Color(t[f]).multiplyScalar(0.15) }));
      p.position.set((m - 7.5) * i, (7.5 - n) * i, 0);
      o.add(p);
    }));
    return o;
  };
  const te = ["..............kk", ".............kcK", "............kcck", "...........kcck.", "..........kcck..", ".........kcck...", "........kcck....", ".k.....kcck.....", ".kk...kcck......", "..kk.kcck.......", "...kkcck........", "...kbkk.........", "..kbbkk.........", ".kbb..kk........", "kbb.............", "kk.............."];
  const ae = ["................", "................", "................", "................", "................", "......kk........", ".....kyyk.......", "....kyYyyk......", "....kyyyYk......", ".....kyyk.......", "......kk........", "................", "................", "................", "................", "................"];
  C.s9 = (e) => {
    const r = e.h, t = [1.15, 1.15], a = ee(e);
    a.position.copy(e.local(...t));
    a.rotation.y = e.cap(-0.3);
    a.visible = !!e.deja;
    if (e.deja) {
      e.habillerPortail($(e));
      e.obstacle(a.position, 0.35 * r);
      return null;
    }
    const o = e.heros, i = o.m;
    i.objet.visible = false;
    let u = null;
    const d = e.preparerFigurant(0).then((l) => {
      u = e.figurant(l || { graine: 3311, pantalon: "#5a3d22" });
      W(u);
    });
    return async () => {
      await d;
      const l = e.objet(null), n = new (c()).Sprite(new (c()).SpriteMaterial({ color: 16777215, transparent: true, depthWrite: false, blending: c().AdditiveBlending, fog: false }));
      l.add(n);
      l.position.copy(e.local(0, -0.9, 1.1));
      let f = 0;
      await new Promise((y) => e.chaque(() => {
        f += e.dt;
        n.scale.setScalar(0.5 + f * 9);
        n.material.opacity = Math.max(0, 1 - f / 0.45);
        if (f > 0.12 && !e.habit) {
          e.habillerPortail($(e));
          e.portail("repos");
          e.son("choisir");
        }
        if (f >= 0.45) {
          y();
          return false;
        }
      }));
      l.visible = false;
      await e.attendre(0.6);
      i.objet.position.copy(e.local(0, -1.15));
      i.cap = i.capVise = e.cap(0);
      i.objet.visible = true;
      i.jouer("repos", { fondu: 0 });
      e.suivreCamera(e.local(0.4, 0.6, 0.8), 0.3);
      await G(e, o, 0.1, 0.65, { vitesse: 0.9 });
      i.capVise = e.vers(o, a.position);
      i.jouer("deposer", { fondu: 0.15, redemarrer: true });
      await e.attendre(0.3);
      a.visible = true;
      let m = 0;
      e.chaque(() => {
        m = Math.min(1, m + e.dt / 0.18);
        a.scale.setScalar(0.3 + 0.7 * m);
        return m < 1;
      });
      e.son("choisir");
      e.obstacle(a.position, 0.35 * r);
      await e.attendre(0.5);
      for (let y = 0; y < 3; y++) {
        i.jouer("frapper", { fondu: 0.08, redemarrer: true });
        await e.attendre(0.3);
      }
      const p = e.objet(null);
      p.add(X(e, te, { k: "#1b3c3a", c: "#4fe3df", K: "#2fb4ae", b: "#6b4a22" }, 0.5 * r));
      p.position.copy(a.position).setY(0.85 * r);
      let s = 0;
      e.chaque(() => {
        s += e.dt;
        if (p.userData.prise) return false;
        p.rotation.y = s * 2.2;
        p.position.y = (0.85 + 0.05 * Math.sin(s * 4)) * r;
      });
      e.son("choisir");
      await e.attendre(1);
      i.jouer("brandir", { fondu: 0.15, redemarrer: true });
      await e.attendre(0.3);
      p.userData.prise = true;
      p.rotation.set(0, 0, 0);
      o.fixer(p, 9, [0, 0.2, 0.06], [0, 0, Math.PI / 4]);
      await e.attendre(0.6);
      i.jouer("repos", { fondu: 0.2 });
      u.m.objet.position.copy(e.local(-0.2, -1.15));
      u.m.cap = u.m.capVise = e.cap(0);
      u.m.objet.visible = true;
      u.m.jouer("marcher");
      i.capVise = e.vers(o, e.local(-0.3, 0.2));
      e.suivreCamera(e.local(-0.1, 0.3, 0.8), 0.3);
      await G(e, u, -0.85, 0.45, { vitesse: 0.6 });
      u.m.capVise = e.vers(u, i.objet.position);
      const b = e.objet(null), h = new (c()).Sprite(new (c()).SpriteMaterial({ color: 16719904, transparent: true, opacity: 0, depthWrite: false, fog: false }));
      b.add(h);
      for (let y = 0; y < 2; y++) {
        i.capVise = e.vers(o, u.m.objet.position);
        i.jouer("trancher", { fondu: 0.05, redemarrer: true });
        await e.attendre(0.18);
        e.son("choisir");
        b.position.copy(u.m.objet.position).setY(0.55 * r);
        h.scale.set(0.7 * r, 1.1 * r, 1);
        let x = 0;
        const Y = u.m.objet.position.clone().sub(i.objet.position).setY(0).normalize().multiplyScalar(0.28), Z = u.m.objet.position.clone();
        e.chaque(() => {
          x += e.dt;
          u.m.objet.position.lerpVectors(Z, Z.clone().add(Y), Math.min(1, x / 0.2));
          u.m.objet.position.y = Math.sin(Math.min(1, x / 0.3) * Math.PI) * 0.12 * r;
          return x < 0.35;
        });
        await e.attendre(0.55);
      }
      let w = 0;
      e.chaque(() => {
        w = Math.min(1, w + e.dt / 0.3);
        u.m.inclinaison = -1.45 * e.lisse(w);
        return w < 1;
      });
      await e.attendre(0.4);
      const v = [];
      for (let y = 0; y < 5; y++) {
        const x = e.objet("o18");
        x.position.copy(u.m.objet.position).add(new (c()).Vector3(Math.cos(y * 1.3) * 0.2, 0.15 * r, Math.sin(y * 1.3) * 0.2));
        x.scale.setScalar(0.01);
        v.push(x);
      }
      let j = 0;
      e.chaque(() => {
        j += e.dt;
        for (const y of v) {
          y.scale.setScalar(Math.min(0.45, j * 0.9));
          y.position.y += e.dt * 0.3;
          y.traverse((x) => {
            if (x.material) x.material.opacity = Math.max(0, 0.9 - j / 1.2);
          });
        }
        return j < 1.2;
      });
      await e.attendre(0.15);
      u.m.objet.visible = false;
      const M = e.objet(null);
      M.add(X(e, ae, { k: "#7a5a10", y: "#f2c230", Y: "#fff3a0" }, 0.3 * r));
      M.position.copy(u.m.objet.position).setY(0.15 * r);
      let q = 0;
      e.chaque(() => {
        q += e.dt;
        if (M.userData.prise) return false;
        M.rotation.y = q * 2.5;
        M.position.y = (0.15 + 0.04 * Math.sin(q * 4)) * r;
      });
      await e.attendre(0.9);
      const P = M.position.clone(), g = i.objet.position.clone().sub(P).setY(0).normalize().multiplyScalar(0.35 * r);
      i.jouer("marcher");
      await i.allerVers(P.clone().add(g).setY(0), { vitesse: 0.8 });
      M.userData.prise = true;
      const k = M.position.clone();
      let V = 0;
      e.chaque(() => {
        V = Math.min(1, V + e.dt / 0.25);
        M.position.lerpVectors(k, i.objet.position.clone().setY(0.5 * r), V);
        M.scale.setScalar(1 - V * 0.9);
        if (V >= 1) {
          M.visible = false;
          return false;
        }
      });
      e.son("choisir");
      await e.attendre(0.4);
      i.capVise = e.vers(o, e.camera());
      i.jouer("content", { fondu: 0.2, redemarrer: true });
      await e.attendre(1.2);
      o.fixer(p, null);
      p.visible = false;
      i.jouer("repos", { fondu: 0.2 });
      e.suivreCamera(null);
      await e.attendre(0.3);
    };
  };
  for (const [e, r] of Object.entries(C)) if (!r.__souffle) {
    C[e] = Object.assign((t) => {
      const a = r(t);
      return a && (async () => {
        await t.attendre(0.7);
        t.portail("allume");
        await t.attendre(1.5);
        return a();
      });
    }, { __souffle: true });
  }
})();
