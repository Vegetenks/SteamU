(() => {
  const d = window.__pcvVisiteursFabrique.V;
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#5f6f3d", O = "#4d5b31", B = "#6e7f48", E = "#2f3330", G = "#232624", R = "#3a3e39";
    const P = (t) => {
      t = t.index ? t.toNonIndexed() : t;
      t.computeVertexNormals();
      return t;
    };
    const T = [[70, 9, 7, -11], [68, 20, 19, -23], [63, 27, 27, -30.5], [56, 30.5, 31, -33.5], [46, 32, 33, -35], [34, 32, 34, -35], [24, 30.5, 33.5, -33], [14, 26.5, 32.5, -29], [6, 21, 30, -24], [0, 16, 26, -19]];
    const w = 3.4, z = (t) => {
      const p = Math.cos(t), e = Math.sin(t);
      return 1 / Math.pow(Math.abs(p) ** w + Math.abs(e) ** w, 1 / w);
    };
    const S = (t) => {
      for (let p = 0; p < T.length - 1; p++) {
        const [e] = T[p], [c] = T[p + 1];
        if (t <= e && t >= c) {
          const i = (e - t) / (e - c);
          return T[p].map((r, a) => r + (T[p + 1][a] - r) * i);
        }
      }
      return t > T[0][0] ? T[0] : T[T.length - 1];
    };
    const u = (t, p, e = 0, c = new o.Vector3()) => {
      const [, i, r, a] = S(p), l = z(t), m = Math.cos(t) >= 0 ? r : -a;
      let M = Math.sin(t) * i * l, g = Math.cos(t) * m * l;
      const A = 2.6 * X((p - 50) / 8) * Math.exp(-((M / 6) ** 4)) * (g > 0 ? 1 : X((g + 30) / 10));
      const V = new o.Vector3(M / (i * i), 0, g / (m * m)).normalize();
      if (p > 60) V.y = (p - 58) / 10;
      V.normalize();
      return c.set(M, p, g).addScaledVector(V, e + A);
    };
    const x = () => {
      const t = new o.Group();
      const p = 32, e = [70, 68, 66, 63, 60, 56, 51, 46, 40, 34, 29, 24, 19, 14, 10, 6, 3, 0];
      const c = P(C((_, k, F) => u(_ * q, e[Math.round(k * (e.length - 1))], 0, F), p, e.length - 1, { fermeU: true, sens: -1 }));
      t.add(new o.Mesh(c, b("coque", I, { rugosite: 0.5 })));
      t.add(new o.Mesh(C((_, k, F) => {
        const j = _ * q;
        F.set(Math.sin(j) * (19 - 2 * k), -1 - 4 * k, -1 + Math.cos(j) * (21 - 2 * k));
      }, 24, 2, { fermeU: true, sens: -1 }), b("cou", G)));
      const i = 1.15, r = (_) => 27 + 4.5 * Math.abs(_) ** 1.6 - 2.5 * Math.exp(-((_ / 0.25) ** 2)), a = (_) => 50 - 4 * Math.abs(_) ** 3;
      const l = (_, k) => C((F, j, J) => {
        const W = (F - 0.5) * 2, Q = W * (i + k * 0.03), ee = r(W) - k + (a(W) + k - (r(W) - k)) * j;
        u(Q, ee, _ + 1.4 * Math.sin(j * L) * (1 - 0.6 * W * W), J);
      }, 36, 10);
      const m = l(0.7, 2.4);
      t.add(new o.Mesh(m, b("biseau", R, { rugosite: 0.4 })));
      const M = d.toile(128, (_) => {
        const k = _.createLinearGradient(0, 0, 0, 128);
        k.addColorStop(0, "#7a4206");
        k.addColorStop(0.35, "#c9780f");
        k.addColorStop(0.65, "#f4b52c");
        k.addColorStop(0.88, "#ffe08a");
        k.addColorStop(1, "#d98a14");
        _.fillStyle = k;
        _.fillRect(0, 0, 128, 128);
        _.globalAlpha = 0.55;
        _.fillStyle = "#fff6d0";
        _.beginPath();
        _.moveTo(18, 128);
        _.lineTo(34, 128);
        _.lineTo(70, 0);
        _.lineTo(54, 0);
        _.fill();
        _.globalAlpha = 0.35;
        _.beginPath();
        _.moveTo(40, 128);
        _.lineTo(46, 128);
        _.lineTo(82, 0);
        _.lineTo(76, 0);
        _.fill();
        _.globalAlpha = 1;
      });
      const g = l(1.25, 0);
      t.add(new o.Mesh(g, b("visiere", "#ffffff", { map: M, rugosite: 0.15 })));
      const A = P(C((_, k, F) => {
        const j = (_ - 0.5) * 2, J = j * 0.8, W = 25 - 24 * k;
        const Q = 5 * (1 - Math.abs(j) ** 1.6) * (0.55 + 0.45 * Math.sin(Math.min(1, k * 1.1 + 0.1) * L)) + 1.6;
        u(J, W, Q, F);
      }, 10, 6, { sens: -1 }));
      const V = P(C((_, k, F) => {
        const j = (_ - 0.5) * 2, J = j * 0.86, W = 26 - 26 * k;
        const Q = 5 * (1 - Math.abs(j) ** 1.6) * (0.55 + 0.45 * Math.sin(Math.min(1, k * 1.1 + 0.1) * L)) + 1;
        u(J, W, Q, F);
      }, 10, 6, { sens: -1 }));
      t.add(new o.Mesh(A, b("menton", "#56663a", { rugosite: 0.5 })), new o.Mesh(V, b("menton-bord", E)));
      const N = P(d.plaque((_, k, F) => {
        const j = (_ - 0.5) * 2, J = j * (i + 0.05);
        u(J, a(j) + 1.5 + 3.5 * k, 2.6 * (1 - k) + 0.4 + (Math.abs(j) < 0.1 ? -1.2 : 0), F);
      }, () => 2.2, 24, 3));
      t.add(new o.Mesh(N, b("sourcil", O, { rugosite: 0.5 })));
      const Y = (_, k, F, j, J = 0) => {
        const W = new o.BoxGeometry(F, j, 3);
        W.rotateY(J);
        const Q = u(Math.asin(Math.max(-1, Math.min(1, _ / 34))), k, 6.8);
        W.translate(Q.x, Q.y, Q.z);
        return W;
      };
      t.add(new o.Mesh(D([Y(-8.5, 15, 8, 2.6, -0.3), Y(8.5, 15, 8, 2.6, 0.3), Y(-7.5, 9.5, 6.5, 2.4, -0.25), Y(7.5, 9.5, 6.5, 2.4, 0.25), Y(0, 19.5, 3, 6, 0)].map(d.indexee)), b("events", G)));
      for (const _ of [24, 15]) t.add(new o.Mesh(C((k, F, j) => {
        const J = L + (k - 0.5) * 2.2;
        u(J, _ + 1.6 * F, 0.35, j);
      }, 24, 1), b("rainure-nuque", E)));
      for (const _ of [-1, 1]) {
        const k = new o.BoxGeometry(5, 11, 9);
        k.rotateY(_ * 0.35);
        const F = u(_ * 1.45, 25, 2);
        k.translate(F.x, F.y, F.z);
        t.add(new o.Mesh(P(k), b("filtre", E)));
        for (let j = 0; j < 3; j++) {
          const J = new o.BoxGeometry(5.6, 1.1, 7);
          J.rotateY(_ * 0.35);
          J.translate(F.x + _ * 0.2, F.y - 3 + j * 3, F.z);
          t.add(new o.Mesh(J, b("rainure", R)));
        }
      }
      return t;
    };
    const y = (t, p, e, c) => {
      if (c === "hands") return G;
      const i = Math.abs(t.x);
      if (c === "legs") {
        if (t.y < 1.05) return O;
        if (t.y > 3 && t.y < 3.55) return E;
        if (t.y > 5.6 && t.y < 6.1) return E;
        if (t.y > 6.1) return O;
        return I;
      }
      if (i > 1.6) {
        if (i > 5.2) return G;
        if (i > 3.4 && i < 3.75) return E;
        return i > 3.75 ? I : E;
      }
      if (t.y < 7.55) return E;
      if (Math.abs(t.y - 8.05) < 0.12 || Math.abs(t.y - 8.55) < 0.12) return E;
      if (t.y < 8.65 && i < 0.1) return E;
      return I;
    };
    const h = (t, p, e, c, i, r, a = 0, l = 0, m = 0) => {
      const M = new o.BoxGeometry(t, p, e, 1, 1, 1);
      M.rotateX(a);
      M.rotateY(l);
      M.rotateZ(m);
      M.translate(c, i, r);
      return M;
    };
    const s = (t, p, e, c, i, r, a = {}) => {
      const l = new o.BoxGeometry(t, p, e, 2, 2, 2), m = l.attributes.position, M = a.biseau ?? 0.22;
      for (let g = 0; g < m.count; g++) {
        const A = m.getX(g) / (t / 2), V = m.getY(g) / (p / 2), N = m.getZ(g) / (e / 2), Y = (Math.abs(A) > 0.99) + (Math.abs(V) > 0.99) + (Math.abs(N) > 0.99);
        if (Y >= 2) {
          const _ = 1 - M * (Y - 1) * 0.5;
          m.setXYZ(g, m.getX(g) * (Math.abs(A) > 0.99 ? _ : 1), m.getY(g) * (Math.abs(V) > 0.99 ? _ : 1), m.getZ(g) * (Math.abs(N) > 0.99 ? _ : 1));
        }
        if (a.bombe && N > 0.99) m.setZ(g, m.getZ(g) + a.bombe * (1 - A * A * 0.7) * (1 - V * V * 0.5));
      }
      l.rotateX(a.rx || 0);
      l.rotateY(a.ry || 0);
      l.rotateZ(a.rz || 0);
      l.translate(c, i, r);
      return P(l);
    };
    const n = async () => {
      const t = [], p = b("plaque", I, { rugosite: 0.45 }), e = b("plaque2", O, { rugosite: 0.45 }), c = b("joint", E), i = b("plaque3", B, { rugosite: 0.45 });
      const r = async (a, l, m, M) => t.push([a, await d.lier(l, m), M]);
      await r("plastron", s(4.7, 2.3, 3.25, 0, 9.7, 0.3, { bombe: 0.42 }), "chest", p);
      await r("dos", s(4.2, 2.2, 1.6, 0, 9.8, -1.05, { bombe: 0.25, ry: L }), "chest", e);
      await r("col", s(2.4, 0.75, 2.2, 0, 10.95, -0.05, { biseau: 0.3 }), "chest", e);
      await r("boucle", s(0.8, 0.38, 0.3, 0, 7.36, 1.72), "hip", e);
      for (const a of [-1, 1]) {
        const l = a > 0 ? "arm_l1" : "arm_r1";
        await r("epaule" + a, s(2.4, 1.5, 2.6, a * 2.45, 10.65, 0, { rz: -a * 0.22, bombe: 0.3 }), l, p);
        await r("epaule2-" + a, s(1.9, 0.75, 2.3, a * 2.95, 9.85, 0, { rz: -a * 0.3 }), l, e);
        await r("avbras" + a, s(2, 1.15, 1.25, a * 4.75, 10.32, 0.02, { bombe: 0.12 }), a > 0 ? "arm_l2" : "arm_r2", p);
        await r("bras" + a, s(1.5, 1, 1.1, a * 3, 10.3, 0), l, e);
        const m = a * 0.82, M = a > 0 ? "foot_l1" : "foot_r1", g = a > 0 ? "foot_l2" : "foot_r2", A = a > 0 ? "ankle_l" : "ankle_r";
        await r("cuisse" + a, s(1.5, 1.9, 1.7, m * 1.06, 4.75, 0.15, { bombe: 0.15 }), M, p);
        await r("tibia" + a, s(1.35, 1.7, 1.55, m, 2.1, 0.18, { bombe: 0.12 }), g, p);
        await r("botte" + a, s(1.4, 0.72, 2.1, m, 0.36, 0.35, { biseau: 0.3 }), A, e);
        await r("genou" + a, s(0.8, 0.62, 0.55, a * 0.82, 3.27, 0.7, { biseau: 0.35 }), a > 0 ? "foot_l2" : "foot_r2", e);
      }
      return t;
    };
    const f = async () => {
      const t = b("fusil", "#2c302d", { rugosite: 0.5 }), p = b("fusil2", "#474c47", { rugosite: 0.5 }), e = b("compteur", "#49c8ff"), c = [];
      const i = new o.Vector3(-6.2, 10.3, 0);
      const r = (m, M, g, A, V, N, Y, _) => {
        const k = s(m * 1.3, M * 1.3, g * 1.3, A * 1.3, V * 1.3, N * 1.3, _ || { biseau: 0.2 });
        k.rotateX(0.64);
        k.rotateY(0);
        k.translate(i.x, i.y, i.z);
        c.push([k, Y]);
      };
      r(0.85, 1.15, 3.6, 0, 0.55, 1.3, t);
      r(0.7, 0.75, 1.6, 0, 0.45, 3.75, p);
      r(0.3, 0.3, 0.8, 0, 0.5, 4.9, t, { biseau: 0.1 });
      r(0.6, 1.1, 0.55, 0, -0.5, 1.9, t, { rx: 0.2 });
      r(0.7, 1, 1.5, 0, 0.25, -1.05, p);
      r(0.45, 0.8, 0.45, 0, -0.25, 0.2, t, { rx: -0.3 });
      r(0.5, 0.3, 0.3, 0, 1.2, 0.9, e, { biseau: 0 });
      const a = [];
      let l = 0;
      for (const [m, M] of c) a.push(["fusil" + l++, await d.lier(m, "wrist_r"), M]);
      return a;
    };
    d.ARTICLES["x24a77859"] = { nom: "casque", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: x };
    d.ARTICLES["117-2"] = { nom: "armure", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands", "legs"], y, { sub: 1, gonfle: 0.09, coupes: { body: [(t) => t.x - 1.6, (t) => -t.x - 1.6, (t) => t.x - 3.4, (t) => -t.x - 3.4, (t) => t.x - 3.75, (t) => -t.x - 3.75, (t) => t.x - 5.2, (t) => -t.x - 5.2, (t) => t.y - 7.55, (t) => t.y - 7.93, (t) => t.y - 8.17, (t) => t.y - 8.43, (t) => t.y - 8.67, (t) => t.x - 0.1, (t) => -t.x - 0.1], legs: [(t) => t.y - 1.05, (t) => t.y - 3, (t) => t.y - 3.55, (t) => t.y - 5.6, (t) => t.y - 6.1] } }), ...await n(), ...await f()] };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#1f5fd8", O = "#174bb0", B = "#f1c9a0", E = "#f4f4f2", G = "#d42a24", R = "#a81d1a", P = "#e8b923";
    const T = new o.Vector3(0, 35, -3), w = new o.Vector3(30.5, 30.5, 32.5);
    const z = (n) => {
      const f = Math.abs(Math.atan2(Math.sin(n), Math.cos(n)));
      if (f < 0.7) return 47 - 4.5 * Math.exp(-((f / 0.16) ** 2)) + 3 * X(f / 0.7);
      return 50 - 38 * X((f - 0.7) / 1.4);
    };
    const S = (n, f, t, p) => {
      const e = z(n), c = T.y + w.y, i = c + (e - c) * f, r = (i - T.y) / w.y;
      const a = i >= T.y ? Math.sqrt(Math.max(0, 1 - r * r)) : 1 - 0.1 * X((T.y - i) / 25);
      return p.set(Math.sin(n) * (w.x * a + t), i, T.z + Math.cos(n) * (w.z * a + t));
    };
    const u = (n, f, t, p, e = 0.25, c = 18, i = 10) => {
      f = f.clone().normalize();
      const r = new o.Vector3(0, 1, 0), a = new o.Vector3().crossVectors(f, r).normalize(), l = new o.Vector3().crossVectors(a, f).normalize();
      return C((m, M, g) => {
        const A = m * q, V = p * (1 - M) ** 1.1 * (1 + 0.05 * Math.sin(A * 2)), N = n.clone().addScaledVector(f, t * M).addScaledVector(l, e * t * M * M);
        g.copy(N).addScaledVector(a, Math.cos(A) * V).addScaledVector(l, Math.sin(A) * V * 0.8);
      }, c, i, { fermeU: true });
    };
    const x = () => {
      const n = new o.Group(), f = b("bleu", I, { rugosite: 0.45 }), t = b("museau", B, { rugosite: 0.7 }), p = b("oeil", "#ffffff", { rugosite: 0.3 }), e = b("iris", "#2f9e3b", { rugosite: 0.3 }), c = b("noir", "#111111", { rugosite: 0.3 }), i = (l, m, M, g = 28) => {
        const A = new o.SphereGeometry(1, g, Math.round(g * 0.7));
        A.scale(m[0], m[1], m[2]);
        A.translate(l[0], l[1], l[2]);
        return new o.Mesh(A, M);
      };
      n.add(i([0, 37, -6], [32, 31, 35], f, 40));
      n.add(i([0, 30, 4], [27, 22, 26], f, 28));
      const r = [];
      r.push(u(new o.Vector3(0, 56, -18), new o.Vector3(0, 0.3, -1), 46, 27, 0.2));
      r.push(u(new o.Vector3(0, 36, -26), new o.Vector3(0, -0.12, -1), 52, 29, 0.2));
      r.push(u(new o.Vector3(0, 16, -24), new o.Vector3(0, -0.55, -1), 42, 23, 0.25));
      for (const l of [-1, 1]) {
        r.push(u(new o.Vector3(l * 16, 46, -22), new o.Vector3(l * 0.28, 0.05, -1), 42, 21, 0.15));
        r.push(u(new o.Vector3(l * 17, 24, -22), new o.Vector3(l * 0.3, -0.4, -1), 38, 18, 0.2));
      }
      n.add(new o.Mesh(D(r), f));
      n.add(i([0, 22, 27], [20, 13, 20], t));
      n.add(i([0, 15, 18], [15, 9, 14], t));
      n.add(i([0, 29, 46], [4.6, 3.8, 3.6], c, 16));
      const a = new o.TorusGeometry(7, 0.9, 6, 20, 1.8);
      a.rotateZ(L + 0.9);
      a.translate(5, 18, 44);
      n.add(new o.Mesh(a, c));
      n.add(i([0, 50, 25], [5, 7, 6], f, 14));
      for (const l of [-1, 1]) {
        n.add(i([l * 9, 41, 22], [12, 15, 10], p));
        n.add(i([l * 8, 40, 31], [5.8, 8, 1.8], e, 18));
        n.add(i([l * 7.2, 40.5, 32.4], [3, 4.6, 1], c, 14));
        n.add(i([l * 6, 43.5, 33.2], [1.1, 1.4, 0.5], p, 10));
      }
      for (const l of [-1, 1]) {
        const m = new o.Vector3(l * 21, 62, -4), M = new o.Vector3(l * 0.55, 1, -0.15);
        const g = u(m, M, 22, 10, -0.05, 14, 6);
        g.scale(1, 1, 0.55);
        g.translate(0, 0, m.z * 0.45);
        n.add(new o.Mesh(g, f));
        const A = u(m.clone().add(new o.Vector3(0, 1.5, 3.2)), M, 15, 6, -0.05, 12, 5);
        A.scale(1, 1, 0.4);
        A.translate(0, 0, m.z * 0.6 + 2.4);
        n.add(new o.Mesh(A, b("oreille", B)));
      }
      return n;
    };
    const y = (n, f, t, p) => {
      if (p === "hands") return E;
      if (p === "legs") return I;
      if ((t.startsWith("arm") || t.startsWith("wrist")) && Math.abs(n.x) > 1.55) return Math.abs(n.x) > 5.05 ? E : B;
      return I;
    };
    const h = async () => {
      const n = [];
      for (const t of [-1, 1]) {
        const p = t > 0 ? "ankle_l" : "ankle_r", e = t * 0.8;
        const c = new o.SphereGeometry(1, 24, 14);
        c.scale(1.05, 0.75, 1.95);
        c.translate(e * 1.1, 0.62, 0.85);
        const i = new o.CylinderGeometry(1, 1, 0.22, 24);
        i.scale(1.08, 1.2, 1.98);
        i.translate(e * 1.1, 0.1, 0.85);
        const r = new o.CylinderGeometry(1, 1, 0.34, 24, 1, true);
        r.scale(1.08, 1.3, 1.1);
        r.translate(e * 1.1, 0.85, 0.45);
        const a = new o.BoxGeometry(0.3, 0.26, 0.1);
        a.scale(1.4, 1.4, 1);
        a.translate(e * 1.1 + t * 1.12, 0.85, 0.6);
        const l = new o.CylinderGeometry(0.55, 0.62, 0.5, 18);
        l.translate(e, 1.35, 0);
        n.push(["pied" + t, await d.lier(c, p), b("pied", G, { rugosite: 0.45 })], ["semelle" + t, await d.lier(i, p), b("semelle", E)], ["bande" + t, await d.lier(r, p), b("bande", E, { side: o.DoubleSide })], ["boucle" + t, await d.lier(a, p), b("boucle", P, { rugosite: 0.3 })], ["chaussette" + t, await d.lier(l, p), b("chaussette", E)]);
      }
      for (const t of [-1, 1]) {
        const p = new o.CylinderGeometry(0.42, 0.5, 0.45, 18);
        p.rotateZ(L / 2);
        p.translate(t * 5.15, 10.3, 0);
        n.push(["manchette" + t, await d.lier(p, t > 0 ? "wrist_l" : "wrist_r"), b("manchette", E)]);
      }
      const f = D([u(new o.Vector3(-0.45, 10, -0.6), new o.Vector3(-0.2, -0.4, -1), 1.3, 0.45, 0.1), u(new o.Vector3(0.45, 10, -0.6), new o.Vector3(0.2, -0.4, -1), 1.3, 0.45, 0.1)]);
      n.push(["dos", await d.lier(f, "chest"), b("dos", I)]);
      return n;
    };
    const s = async () => {
      const n = await d.corps(), f = n.peaux.body, t = f.geometry.attributes.position, p = f.geometry.index.array, e = new o.Ray(), c = [], i = new o.Vector3();
      for (let l = 0; l < p.length; l += 3) c.push([0, 1, 2].map((m) => new o.Vector3().fromBufferAttribute(t, p[l + m])));
      const r = (l, m) => {
        e.origin.set(l, m, 9);
        e.direction.set(0, 0, -1);
        let M = null;
        for (const [g, A, V] of c) if (e.intersectTriangle(g, A, V, false, i) && (M === null || i.z > M)) M = i.z;
        return M;
      };
      const a = C((l, m, M) => {
        const g = l * q, A = m;
        const V = Math.sin(g) * 1 * A, N = 8.55 + Math.cos(g) * 1.3 * A;
        M.set(V, N, (r(V, N) ?? 0.9) + 0.075 + 0.03 * (1 - A));
      }, 32, 6, { fermeU: true, sens: -1 });
      a.computeVertexNormals();
      return [["ventre", await d.lier(a, "chest"), b("ventre", B, { side: o.DoubleSide })]];
    };
    d.ARTICLES["herisson-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => d.combinaison(["legs"], y, { sub: 1 }) };
    d.ARTICLES["x06fbb67d"] = { nom: "piquants", categorie: "chapeau", attache: "tete", cache_cheveux: "tete", modele: x };
    d.ARTICLES["herisson-2"] = { nom: "corps", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands"], y, { sub: 1, gonfle: 0.03, coupes: { body: [(n) => n.x - 5.05, (n) => -n.x - 5.05, (n) => n.x - 1.55, (n) => -n.x - 1.55] } }), ...await h(), ...await s()] };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#ebe7de", O = "#7f7a72", B = "#9e2027", E = "#5e3d26", G = "#3f2b1e", R = "#b9bec4", P = "#55504b";
    const T = new o.Vector3(0, 36, -2.5), w = new o.Vector3(31.6, 31, 34.5);
    const z = (t) => {
      const p = Math.abs(Math.atan2(Math.sin(t), Math.cos(t)));
      if (p <= 0.5) return 45.5 + 5 * X(p / 0.5) - 2.5 * Math.exp(-((p / 0.12) ** 2));
      if (p <= 1.2) return 50.5 - 44 * X((p - 0.5) / 0.7);
      return 6.5 - 6 * X((p - 1.2) / 1.1);
    };
    const S = (t, p, e, c) => {
      const i = z(t), r = T.y + w.y, a = r + (i - r) * p;
      const l = (a - T.y) / w.y, m = (1 - Math.cos(t)) / 2;
      const M = a >= T.y ? Math.sqrt(Math.max(0, 1 - l * l)) : 1 - X((T.y - a) / 34) * (0.06 + 0.2 * m * m);
      const g = 1 + X((T.y + 18 - a) / 30) * (0.018 * Math.sin(6 * t + 0.7) + 0.012 * Math.sin(11 * t + 2.1)) + 0.02 * Math.exp(-(((Math.abs(t) - L) / 0.25) ** 2)) * X((T.y - a) / 20);
      let A = Math.sin(t) * (w.x * M * g + e), V = T.z + Math.cos(t) * (w.z * M * g + e);
      const N = Math.exp(-((Math.atan2(Math.sin(t), Math.cos(t)) / 0.3) ** 2)) * X((a - 38) / 10) * (1 - X((a - 58) / 9));
      V += 7 * N;
      const Y = a - 3 * N;
      return c.set(A, Y, V);
    };
    const u = () => {
      const t = new o.Group(), p = 1.8;
      const e = C((r, a, l) => S(r * q, a, 0, l), 120, 36, { fermeU: true, sens: -1 });
      const c = C((r, a, l) => S(r * q, a, -p, l), 80, 24, { fermeU: true });
      const i = C((r, a, l) => S(r * q, 1, -p * a, l), 120, 1, { fermeU: true, sens: -1 });
      t.add(new o.Mesh(D([e, i]), b("capuche", I)), new o.Mesh(c, b("capuche-dedans", O)));
      return t;
    };
    const x = (t, p, e, c) => {
      if (c === "hands") return G;
      if (c === "legs") return t.y < 2.4 ? E : P;
      const i = Math.abs(t.x);
      if (e.startsWith("arm") || e.startsWith("wrist")) {
        if (i > 4.3) return E;
        return I;
      }
      if (t.y < 7.75 && t.y > 7.5) return E;
      if (t.y < 8.7) return B;
      return I;
    };
    const y = async () => d.combinaison(["body", "hands", "legs"], x, { sub: 1, coupes: { body: [(t) => t.y - 7.5, (t) => t.y - 7.75, (t) => t.y - 8.7, (t) => t.x - 4.3, (t) => -t.x - 4.3], legs: [(t) => t.y - 2.4] } });
    const h = async () => {
      const t = (c, i, r, a) => {
        const l = L * (0.28 + 1.72 * c) - L, m = i;
        const M = (0.18 + 1.64 * c) * L;
        const g = 1.72 + 0.62 * m - r, A = 1.45 + 0.68 * m - r, V = 7.6 - 3.7 * i - (Math.cos(M) < 0 ? 0.6 * i * -Math.cos(M) : 0);
        return a.set(Math.sin(M) * g, V, 0.25 + Math.cos(M) * A);
      };
      const p = C((c, i, r) => t(c, i, 0, r), 90, 10, { sens: -1 }), e = C((c, i, r) => t(c, i, 0.07, r), 90, 10);
      return [["pans", await d.lier(p, "hip"), b("pans", I, { side: o.DoubleSide })], ["doublure", await d.lier(e, "hip"), b("doublure", B, { side: o.DoubleSide })]];
    };
    const s = async () => {
      const t = C((e, c, i) => {
        const r = e * q, a = c * q;
        const l = 1.76 + 0.07 * Math.cos(a), m = 1.5 + 0.07 * Math.cos(a);
        i.set(Math.sin(r) * l, 7.63 + 0.13 * Math.sin(a), 0.22 + Math.cos(r) * m);
      }, 64, 8, { fermeU: true });
      const p = new o.CylinderGeometry(0.26, 0.26, 0.08, 16);
      p.rotateX(L / 2);
      p.scale(1, 1.25, 1);
      p.translate(0, 7.63, 1.82);
      return [["ceinture", await d.lier(t, "hip"), b("ceinture", G)], ["boucle", await d.lier(p, "hip"), b("boucle", R, { rugosite: 0.4 })]];
    };
    const n = async () => {
      const t = (e, c, i, r) => {
        const a = (0.22 + 0.78 * e) * L, l = 1.2 + 0.75 * c + i;
        return r.set(0.55 + Math.sin(a) * l * 0.95, 10.4 - 4.6 * c + 0.35 * Math.sin(e * L) * c * c, -0.05 + Math.cos(a) * l * (0.95 + 0.25 * c));
      };
      const p = D([C((e, c, i) => t(e, c, 0, i), 24, 12, { sens: -1 }), C((e, c, i) => t(e, c, -0.05, i), 24, 12)]);
      return [["cape", await d.lier(p, "chest"), b("cape", B, { side: o.DoubleSide })]];
    };
    const f = async () => {
      const t = new o.BoxGeometry(0.9, 0.07, 0.16);
      t.translate(5.5, 10.02, 0);
      return [["lame", await d.lier(t, "arm_l2"), b("lame", R, { rugosite: 0.35 })]];
    };
    d.ARTICLES["x3d946d9f"] = { nom: "capuche", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: u };
    d.ARTICLES["firenze-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await y(), ...await h(), ...await s(), ...await n(), ...await f()] };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#1f55d6", O = "#3db1f2", B = "#68d6f5", E = "#f2c218";
    const G = new o.Vector3(0, 35, -2.5), R = new o.Vector3(30.5, 31, 32.5);
    const P = (u) => {
      const x = Math.abs(Math.atan2(Math.sin(u), Math.cos(u)));
      if (x < 0.55) return 46 + 3.5 * X(x / 0.55) - 5.5 * Math.max(0, 1 - x / 0.2);
      if (x < 1.25) return 49.5 - 40 * X((x - 0.55) / 0.7);
      return 9.5 - 3 * X((x - 1.25) / 1.5);
    };
    const T = (u, x, y, h) => {
      const s = P(u), n = G.y + R.y, f = n + (s - n) * x, t = (f - G.y) / R.y;
      const p = f >= G.y ? Math.sqrt(Math.max(0, 1 - t * t)) : 1 - 0.07 * X((G.y - f) / 25);
      return h.set(Math.sin(u) * (R.x * p + y), f, G.z + Math.cos(u) * (R.z * p + y));
    };
    const w = () => {
      const u = new o.Group(), x = 1.6;
      u.add(new o.Mesh(D([C((s, n, f) => T(s * q, n, 0, f), 96, 32, { fermeU: true, sens: -1 }), C((s, n, f) => T(s * q, 1, -x * n, f), 96, 1, { fermeU: true, sens: -1 })]), b("casque", I, { rugosite: 0.35 })));
      u.add(new o.Mesh(C((s, n, f) => T(s * q, n, -x, f), 64, 20, { fermeU: true }), b("dedans", "#173f9e")));
      const y = d.plaque((s, n, f) => {
        const t = (s - 0.5) * 0.22, p = 0.02 + 0.36 * n, e = new o.Vector3();
        T(t, p, 1.1, e);
        f.copy(e);
      }, () => 1.6, 8, 20);
      const h = d.plaque((s, n, f) => {
        const t = (s - 0.5) * 0.42, p = 51 + 8.5 * n, e = new o.Vector3(), c = (G.y + R.y - p) / (G.y + R.y - P(t));
        T(t, Math.max(0, c), 1.2, e);
        f.copy(e);
      }, () => 1.8, 10, 6);
      u.add(new o.Mesh(D([y, h]), b("crete", B, { rugosite: 0.35 })));
      for (const s of [-1, 1]) {
        const n = new o.CylinderGeometry(9.5, 10, 4.5, 28);
        n.rotateZ(L / 2);
        n.translate(s * (R.x + 1.2), 26, G.z - 1);
        u.add(new o.Mesh(n, b("oreille", B, { rugosite: 0.35 })));
        const f = new o.TorusGeometry(9.8, 1.3, 8, 28);
        f.rotateY(L / 2);
        f.translate(s * (R.x + 3.5), 26, G.z - 1);
        u.add(new o.Mesh(f, b("oreille-bord", I)));
      }
      return u;
    };
    const z = (u, x, y, h) => {
      if (h === "hands") return I;
      if (h === "legs") return u.y < 2.6 ? I : O;
      const s = Math.abs(u.x);
      if (s > 3.9) return I;
      if (u.y > 10.55 && s < 1.05) return I;
      return O;
    };
    const S = async () => {
      const u = [], x = b("canon", I, { rugosite: 0.35 });
      const y = C((f, t, p) => {
        const e = f * q, c = -4.6 - 3.2 * t, i = 0.95 + 0.32 * Math.sin(Math.min(1, t * 1.25) * L * 0.75) - 0.4 * X((t - 0.82) / 0.18);
        p.set(c, 10.3 + Math.sin(e) * i, Math.cos(e) * i * 1.05);
      }, 28, 16, { fermeU: true });
      const h = new o.CylinderGeometry(0.55, 0.62, 0.5, 20);
      h.rotateZ(L / 2);
      h.translate(-8, 10.3, 0);
      const s = new o.CylinderGeometry(0.34, 0.34, 0.52, 16);
      s.rotateZ(L / 2);
      s.translate(-8.05, 10.3, 0);
      const n = new o.BoxGeometry(1.4, 0.18, 0.14);
      n.translate(-6.4, 10.3, 1.33);
      u.push(["canon", await d.lier(y, "wrist_r"), x], ["bout", await d.lier(h, "wrist_r"), b("bout", "#1a3c90")], ["trou", await d.lier(s, "wrist_r"), b("trou", "#0b1022")], ["voyants", await d.lier(n, "wrist_r"), b("voyants", E, { rugosite: 0.3 })]);
      return u;
    };
    d.ARTICLES["xa77d997e"] = { nom: "casque", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: w };
    d.ARTICLES["robot-bleu-2"] = { nom: "combinaison", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands", "legs"], z, { sub: 1, coupes: { body: [(u) => u.x - 3.9, (u) => -u.x - 3.9, (u) => u.y - 10.55, (u) => u.x - 1.05, (u) => -u.x - 1.05], legs: [(u) => u.y - 2.6] } }), ...await S()] };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#2f9a3a", O = "#23772c", B = "#efe6cf", E = "#7a4a22", G = "#553218", R = "#e2b12c", P = "#ffd2ac";
    const T = () => {
      const u = new o.Group(), x = b("bonnet", I, { rugosite: 0.85, side: o.DoubleSide });
      const y = new o.Vector3(0, 40, -2), h = new o.Vector3(31.5, 26, 33.5);
      const s = (r) => {
        const a = Math.abs(Math.atan2(Math.sin(r), Math.cos(r)));
        return 47 + 1.5 * X(a / 1) - 14 * X((a - 1.1) / 1.6);
      };
      const n = y.y + h.y;
      const f = (r, a, l, m) => {
        const M = s(r), g = n + (M - n) * a, A = (g - y.y) / h.y, V = g >= y.y ? Math.sqrt(Math.max(0, 1 - A * A)) : 1;
        return m.set(Math.sin(r) * (h.x * V + l), g, y.z + Math.cos(r) * (h.z * V + l));
      };
      const t = C((r, a, l) => f(r * q, a, 0, l), 80, 24, { fermeU: true, sens: -1 });
      const p = new o.Vector3(0, 52, -14), e = new o.Vector3(0, 60, -52), c = new o.Vector3(0, 12, -70);
      const i = C((r, a, l) => {
        const m = r * q, M = 1 - a, g = new o.Vector3().addScaledVector(p, M * M).addScaledVector(e, 2 * M * a).addScaledVector(c, a * a);
        const A = new o.Vector3().addScaledVector(e.clone().sub(p), 2 * M).addScaledVector(c.clone().sub(e), 2 * a).normalize(), V = new o.Vector3(1, 0, 0), N = new o.Vector3().crossVectors(A, V).normalize();
        const Y = 23 * (1 - a) ** 1.2 + 0.3;
        l.copy(g).addScaledVector(V, Math.cos(m) * Y * 1.05).addScaledVector(N, Math.sin(m) * Y * 0.9);
      }, 40, 24, { fermeU: true });
      u.add(new o.Mesh(D([t, i]), x));
      return u;
    };
    const w = () => {
      const u = new o.Group();
      for (const x of [-1, 1]) {
        const y = C((h, s, n) => {
          const f = h * q, t = 4.2 * (1 - s) ** 0.9;
          n.set(x * (26 + 13 * s), 27 + 7 * s + Math.sin(f) * t * 0.5, -2 - 2 * s + Math.cos(f) * t);
        }, 16, 8, { fermeU: true, sens: x });
        u.add(new o.Mesh(y, b("oreille", P)));
      }
      return u;
    };
    const z = (u, x, y, h) => {
      if (h === "hands") return E;
      if (h === "legs") return u.y < 2.5 ? G : B;
      const s = Math.abs(u.x);
      if (s > 4.4) return E;
      if (s > 2.6) return B;
      if (u.y < 7.95 && u.y > 7.45) return E;
      return I;
    };
    const S = async () => {
      const u = [];
      const x = C((e, c, i) => {
        const r = e * q, a = 1.75 + 0.5 * c, l = 1.45 + 0.52 * c;
        i.set(Math.sin(r) * a, 7.55 - 2.3 * c, 0.25 + Math.cos(r) * l);
      }, 48, 6, { fermeU: true, sens: -1 });
      u.push(["pans", await d.lier(x, "hip"), b("pans", I, { side: o.DoubleSide })]);
      const y = C((e, c, i) => {
        const r = e * q, a = c * q;
        i.set(Math.sin(r) * (1.8 + 0.06 * Math.cos(a)), 7.7 + 0.15 * Math.sin(a), 0.25 + Math.cos(r) * (1.5 + 0.06 * Math.cos(a)));
      }, 48, 6, { fermeU: true });
      const h = new o.BoxGeometry(0.6, 0.45, 0.12);
      h.translate(0, 7.7, 1.85);
      u.push(["ceinture", await d.lier(y, "hip"), b("ceinture", G)], ["boucle", await d.lier(h, "hip"), b("boucle", R, { rugosite: 0.3 })]);
      const s = d.toile(128, (e) => {
        e.fillStyle = "#c9ced6";
        e.fillRect(0, 0, 128, 128);
        e.fillStyle = "#2148a8";
        e.beginPath();
        e.moveTo(10, 10);
        e.lineTo(118, 10);
        e.lineTo(118, 70);
        e.quadraticCurveTo(110, 108, 64, 122);
        e.quadraticCurveTo(18, 108, 10, 70);
        e.closePath();
        e.fill();
        e.fillStyle = "#c32a2a";
        e.beginPath();
        e.moveTo(64, 58);
        e.lineTo(30, 46);
        e.lineTo(40, 64);
        e.lineTo(52, 66);
        e.lineTo(64, 100);
        e.lineTo(76, 66);
        e.lineTo(88, 64);
        e.lineTo(98, 46);
        e.closePath();
        e.fill();
        e.fillStyle = "#e9c03a";
        e.beginPath();
        e.moveTo(64, 20);
        e.lineTo(80, 44);
        e.lineTo(48, 44);
        e.closePath();
        e.fill();
      });
      const n = new o.Shape();
      n.moveTo(-1.3, 1.55);
      n.lineTo(1.3, 1.55);
      n.lineTo(1.3, 0.2);
      n.quadraticCurveTo(1.15, -1.1, 0, -1.6);
      n.quadraticCurveTo(-1.15, -1.1, -1.3, 0.2);
      n.closePath();
      const f = new o.ExtrudeGeometry(n, { depth: 0.18, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 2 });
      const t = f.attributes.uv, p = f.attributes.position;
      for (let e = 0; e < p.count; e++) t.setXY(e, (p.getX(e) + 1.3) / 2.6, (p.getY(e) + 1.6) / 3.15);
      f.rotateY(L);
      f.rotateZ(0.25);
      f.translate(0.1, 9.1, -1.25);
      u.push(["bouclier", await d.lier(f, "chest"), b("bouclier", "#ffffff", { map: s, rugosite: 0.4 })]);
      return u;
    };
    d.ARTICLES["x92ab6441"] = { nom: "bonnet", categorie: "chapeau", attache: "tete", cache_cheveux: "haut", modele: T };
    d.ARTICLES["xcd51bf7b"] = { nom: "oreilles", categorie: "visage", attache: "tete", modele: w };
    d.ARTICLES["heros-vert-3"] = { nom: "tunique", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands", "legs"], z, { sub: 1, coupes: { body: [(u) => u.x - 4.4, (u) => -u.x - 4.4, (u) => u.x - 2.6, (u) => -u.x - 2.6, (u) => u.y - 7.45, (u) => u.y - 7.95], legs: [(u) => u.y - 2.5] } }), ...await S()] };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#20242c", O = "#4a5361", B = "#39414c", E = "#1b1d21", G = "#2a2e35";
    const R = () => {
      const w = new o.Group(), z = b("bandeau", I, { rugosite: 0.95, side: o.DoubleSide });
      const S = -3, u = [35.6, 35.4, 34.6, 33.2, 31.4, 31.4, 30.2, 29.8, 30.2, 31.2, 32.3, 32.6, 32.7];
      const x = (c, i) => {
        const r = Math.abs(Math.atan2(Math.sin(c), Math.cos(c))) / L * 12, a = Math.min(11, Math.floor(r));
        return u[a] + (u[a + 1] - u[a]) * (r - a) - 0.35 - (i - 47) * 0.22;
      };
      const y = (c) => 46.5 - 7 * (1 - Math.cos(c)) / 2;
      const h = 6.2, s = C((c, i, r) => {
        const a = c * q, l = y(a) + h * i, m = 1 + 0.012 * Math.sin(a * 9 + i * 3) * Math.sin(i * L);
        const M = x(a, l) * m + 0.5 * Math.sin(i * L);
        r.set(Math.sin(a) * M, l, S + Math.cos(a) * M);
      }, 96, 6, { fermeU: true, sens: -1 });
      const n = y(L) + h / 2, f = S - x(L, n) - 1.5;
      const t = new o.SphereGeometry(3, 14, 10);
      t.scale(1.1, 1, 0.8);
      t.translate(0, n, f);
      const p = (c) => {
        const i = new o.TorusGeometry(3.2, 1.5, 8, 16);
        i.scale(1, 0.7, 0.5);
        i.rotateZ(c * 0.25);
        i.translate(c * 4.2, n + 0.5, f - 0.2);
        return i;
      };
      const e = (c, i, r, a) => C((l, m, M) => {
        const g = 8.5 * (1 - 0.6 * m ** 1.5) + 0.6, A = (l - 0.5) * g;
        const V = c * (1 + 10 * m + 3 * Math.sin(m * 4 + a) * m), N = n - r * m * m + 2.5 * Math.sin(m * 6 + a), Y = f + 1 - i * m;
        const _ = 0.6 * Math.sin(m * 5 + a);
        M.set(V + A * Math.sin(_) * 0.6, N + A * Math.cos(_), Y + A * Math.sin(_) * 0.4);
      }, 3, 20);
      w.add(new o.Mesh(D([s, t, e(1, 30, 36, 0), e(-1, 25, 30, 1.7)].map(d.indexee)), z));
      return w;
    };
    const P = (w, z, S, u) => {
      if (u === "hands") return E;
      if (u === "legs") {
        if (w.y < 1.7) return E;
        return O;
      }
      const x = Math.abs(w.x);
      if (x > 5) return E;
      if (w.y < 7.55 && w.y > 7.1) return G;
      if (x > 0.55 && x < 0.85 && w.y > 7.5) return G;
      if (x > 1.6) return B;
      return O;
    };
    const T = async () => {
      const w = [];
      const z = C((s, n, f) => {
        const t = s * q;
        f.set(Math.sin(t) * (0.75 + 0.1 * n), 10.5 + 0.75 * n, Math.cos(t) * (0.68 + 0.1 * n));
      }, 32, 4, { fermeU: true, sens: -1 });
      w.push(["col", await d.lier(z, "chest"), b("col", O, { side: o.DoubleSide })]);
      const S = b("sangle", G), u = b("poche", "#2b2f36");
      const x = C((s, n, f) => {
        const t = s * q;
        f.set(Math.sin(t) * 1.42, 9.35 + 0.32 * n, 0.12 + Math.cos(t) * 1.18);
      }, 40, 1, { fermeU: true, sens: -1 });
      w.push(["sangle-poitrine", await d.lier(x, "chest"), b("sangle2", G, { side: o.DoubleSide })]);
      const y = new o.BoxGeometry(0.42, 0.42, 0.12);
      y.translate(0, 9.51, 1.32);
      w.push(["boucle-poitrine", await d.lier(y, "chest"), b("boucle", "#7d838c", { rugosite: 0.4 })]);
      for (const [s, n, f] of [[-1.15, 1.25, 0.5], [-0.45, 1.5, 0.1], [0.45, 1.5, -0.1], [1.15, 1.25, -0.5], [-1.65, 0.2, 1.5], [1.65, 0.2, -1.5]]) {
        const t = new o.BoxGeometry(0.55, 0.62, 0.38);
        t.rotateY(f);
        t.translate(s, 7.1, n);
        w.push(["poche" + s + n, await d.lier(t, "hip"), u]);
      }
      const h = new o.BoxGeometry(0.6, 1.15, 0.42);
      h.translate(-1.5, 5.15, 0.35);
      w.push(["etui", await d.lier(h, "foot_r1"), b("etui", E)]);
      for (const s of [-1, 1]) {
        const n = new o.SphereGeometry(0.56, 14, 10);
        n.scale(1, 1.15, 0.62);
        n.translate(s * 0.8, 3.2, 0.58);
        w.push(["genou" + s, await d.lier(n, s > 0 ? "foot_l2" : "foot_r2"), b("genou", E)]);
        const f = new o.SphereGeometry(0.42, 12, 8);
        f.scale(1.1, 0.9, 0.8);
        f.translate(s * 3.6, 10.3, -0.38);
        w.push(["coude" + s, await d.lier(f, s > 0 ? "arm_l2" : "arm_r2"), b("coude", E)]);
      }
      return w;
    };
    d.ARTICLES["xdf786c54"] = { nom: "bandeau", categorie: "chapeau", attache: "tete", cache_cheveux: "aucun", modele: R };
    d.ARTICLES["carton-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands", "legs"], P, { sub: 1, gonfle: 0.045, coupes: { body: [(w) => w.x - 5, (w) => -w.x - 5, (w) => w.y - 7.55, (w) => w.y - 7.1, (w) => w.x - 0.55, (w) => -w.x - 0.55, (w) => w.x - 0.85, (w) => -w.x - 0.85, (w) => w.x - 1.6, (w) => -w.x - 1.6], legs: [(w) => w.y - 1.7] } }), ...await T()] };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#f2c49e", O = "#3e9e9b", B = "#7b5a3b", E = "#4a3222", G = "#2f2118", R = "#3a2a1e", P = "#22201f", T = "#5b6066", w = "#4a2c18";
    const z = { sexe: "M" };
    const S = () => {
      const y = new o.Group(), h = b("tresse", w, { rugosite: 0.7 }), s = b("lien", "#2b1a0e");
      const n = new o.Vector3(0, 26, -33.5), f = 9;
      for (let e = 0; e < f; e++) {
        const c = e / (f - 1), i = 6.2 * (1 - 0.45 * c), r = new o.SphereGeometry(1, 14, 10);
        r.scale(i * 1.05, i * 1.25, i * 0.85);
        r.rotateZ((e % 2 ? 1 : -1) * 0.35);
        r.translate(n.x + 0.6 * e + (e % 2 ? 1.2 : -1.2), n.y - e * 6.3, n.z - 3 + e * 0.4);
        y.add(new o.Mesh(r, h));
      }
      const t = new o.CylinderGeometry(2.4, 2.4, 2.4, 12);
      t.translate(n.x + 0.6 * f, n.y - f * 6.3 + 2.5, n.z - 3 + f * 0.4 - 1);
      y.add(new o.Mesh(t, s));
      const p = new o.ConeGeometry(2.6, 7, 10);
      p.rotateX(L);
      p.translate(n.x + 0.6 * f, n.y - f * 6.3 - 2.5, n.z - 3 + f * 0.4 - 1);
      y.add(new o.Mesh(p, h));
      return y;
    };
    const u = (y, h, s, n) => {
      if (n === "hands") return R;
      if (n === "legs") {
        if (y.y < 2.6) return G;
        if (y.y > 4.2) return B;
        return I;
      }
      const f = Math.abs(y.x);
      if (s.startsWith("arm") || s.startsWith("wrist") || f > 1.75 || y.y > 10.6 && f > 1) return f > 5.3 ? R : I;
      if (y.y < 7) return B;
      if (y.y > 10.45 && f < 1) return I;
      return O;
    };
    const x = async () => {
      const y = [], h = async (s, n, f, t) => y.push([s, await d.lier(n, f, z), t]);
      await h("ceinture", C((s, n, f) => {
        const t = s * q;
        f.set(Math.sin(t) * 1.8, 7 + 0.3 * n, 0.2 + Math.cos(t) * 1.55);
      }, 40, 1, { fermeU: true, sens: -1 }), "hip", b("ceinture", G, { side: o.DoubleSide }));
      for (const s of [-1, 1]) {
        const n = s > 0 ? "foot_l1" : "foot_r1";
        await h("sangle" + s, C((p, e, c) => {
          const i = p * q;
          c.set(s * 0.85 + Math.sin(i) * 0.86, 4.5 + 0.22 * e, 0.12 + Math.cos(i) * 0.82);
        }, 24, 1, { fermeU: true, sens: -1 }), n, b("sangle", G, { side: o.DoubleSide }));
        const f = new o.BoxGeometry(0.5, 1.25, 0.8);
        f.translate(s * 1.75, 4.8, 0.2);
        await h("etui" + s, f, n, b("etui", E));
        const t = new o.BoxGeometry(0.38, 0.75, 0.42);
        t.rotateX(-0.3);
        t.translate(s * 1.8, 5.75, -0.1);
        await h("crosse" + s, t, n, b("pistolet", P));
      }
      {
        const s = new o.SphereGeometry(1, 14, 10);
        s.scale(0.62, 0.75, 0.8);
        s.translate(0, 5.25, 0.15);
        await h("fond", s, "hip", b("fond", B));
      }
      for (const s of [-1, 1]) {
        const n = new o.CylinderGeometry(0.62, 0.66, 1.6, 16);
        n.translate(s * 0.8, 1.85, 0.05);
        await h("tige" + s, n, s > 0 ? "foot_l2" : "foot_r2", b("botte", G));
      }
      return y;
    };
    d.ARTICLES["xd0c05b05"] = { nom: "tresse", categorie: "accessoire", attache: "tete", modele: S };
    d.ARTICLES["pilleuse-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, sexe: "M", modele: async () => [...await d.combinaison(["body", "hands"], u, { sexe: "M", sub: 1, gonfle: 0.02, coupes: { body: [(y) => y.y - 7, (y) => y.y - 10.45, (y) => y.x - 1.75, (y) => -y.x - 1.75, (y) => y.y - 10.6, (y) => y.x - 5.3, (y) => -y.x - 5.3, (y) => y.x - 1, (y) => -y.x - 1] } }), ...await x()] };
    d.ARTICLES["pilleuse-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, sexe: "M", modele: async () => d.combinaison(["legs"], u, { sexe: "M", sub: 1, gonfle: 0.02, coupes: { legs: [(y) => y.y - 2.6, (y) => y.y - 4.2] }, gonfle: 0.05 }) };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#c6916b", O = "#2fb1b8", B = "#3f3a9a", E = "#5a5a5a", G = "#3b2614";
    const R = (z, S = 16) => {
      const u = d.toile(S, (x) => {
        for (let y = 0; y < S; y++) for (let h = 0; h < S; h++) {
          x.fillStyle = z[(y * 7 + h * 13 + y * h % 5) % z.length];
          x.fillRect(y, h, 1, 1);
        }
      });
      u.magFilter = o.NearestFilter;
      u.minFilter = o.NearestFilter;
      u.generateMipmaps = false;
      return u;
    };
    const P = (z, S, u, x) => {
      if (x === "hands") return I;
      if (x === "legs") return z.y < 0.9 ? E : B;
      const y = Math.abs(z.x);
      if (y > 2.6) return I;
      if (z.y < 7.1) return B;
      return O;
    };
    const T = async () => {
      const z = [], S = b("bois", "#7a5530"), u = b("bois2", "#5a3d22"), x = b("diamant", "#4fe3df", { rugosite: 0.35 }), y = b("diamant2", "#2fb4ae", { rugosite: 0.35 }), h = b("contour", "#163c3a");
      const s = new o.Vector3(-6.2, 10.3, 0), n = 0.42;
      const f = (r, a, l) => {
        const m = new o.BoxGeometry(n, n, n * 1.2);
        m.translate(r * n, a * n, 0);
        return [m, l];
      };
      const t = [];
      for (let r = 0; r < 9; r++) t.push(f(r - 4, r - 4, r % 2 ? S : u));
      const p = [[1, 5], [2, 5], [3, 5], [4, 4], [5, 3], [5, 2], [5, 1], [0, 5], [-1, 5], [5, 0], [5, -1], [4, 5], [5, 4]];
      p.forEach(([r, a], l) => t.push(f(r, a, l % 3 ? x : y)));
      for (const [r, a] of [[0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [-2, 5], [5, -2]]) t.push(f(r, a, h));
      const e = D(t.map(([r]) => d.indexee(r)));
      const c = /* @__PURE__ */ new Map();
      for (const [r, a] of t) {
        if (!c.has(a)) c.set(a, []);
        c.get(a).push(d.indexee(r));
      }
      let i = 0;
      for (const [r, a] of c) {
        const l = D(a);
        l.translate(n * 3, n * 3, 0);
        l.rotateZ(-L / 4);
        l.rotateX(-0.35);
        l.translate(s.x - 0.4, s.y, s.z + 0.75);
        z.push(["pioche" + i++, await d.lier(l, "wrist_r"), r]);
      }
      return z;
    };
    const w = () => {
      const z = new o.Group();
      const S = { c: "#3b2614", c2: "#2f1d0f", p: "#c6916b", p2: "#b07a56", b: "#ffffff", y: "#4b3d9e", n: "#8a5a3c", m: "#6b3f2a", r: "#4a2a1b" };
      const u = (i) => {
        const r = d.toile(8, (a) => {
          i.forEach((l, m) => [...l].forEach((M, g) => {
            a.fillStyle = S[M];
            a.fillRect(g, m, 1, 1);
          }));
        });
        r.magFilter = r.minFilter = o.NearestFilter;
        r.generateMipmaps = false;
        return r;
      };
      const x = u(["cccccccc", "cccccccc", "cppppppc", "pppppppp", "pbypypbp", "ppppnppp", "ppmrrmpp", "pprrrrpp"].map((i) => i.replace(/y/g, "y")));
      const y = (i) => i.map((r) => r.replace("pbypypbp", "pbyppybp"));
      const h = u(y(["cccccccc", "cccccccc", "cppppppc", "pppppppp", "pbypypbp", "pppnnppp", "ppmmmmpp", "ppmppmpp"]));
      const s = u(["cccccccc", "cccccccc", "ccccccpp", "ccccpppp", "ccccpppp", "cccppppp", "cccppppp", "cccppppp"]);
      const n = u(["cccccccc", "cccccccc", "ppcccccc", "ppppcccc", "ppppcccc", "pppppccc", "pppppccc", "pppppccc"]);
      const f = u(["cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc"]);
      const t = u(["cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc"]);
      const p = u(["pppppppp", "pppppppp", "pppppppp", "pppppppp", "pppppppp", "pppppppp", "pppppppp", "pppppppp"]);
      const e = (i) => b("cube", "#ffffff", { map: i, rugosite: 0.9 });
      const c = new o.BoxGeometry(62, 62, 62);
      c.translate(0, 31, -2);
      z.add(new o.Mesh(c, [e(n), e(s), e(t), e(p), e(h), e(f)]));
      return z;
    };
    d.ARTICLES["x219cd39d"] = { nom: "tete", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: w };
    d.ARTICLES["mineur-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands"], P, { sub: 1, gonfle: 0.02, coupes: { body: [(z) => z.x - 2.6, (z) => -z.x - 2.6, (z) => z.y - 7.1] } })] };
    d.ARTICLES["mineur-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => d.combinaison(["legs"], P, { sub: 1, gonfle: 0.02, coupes: { legs: [(z) => z.y - 0.9] } }) };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#3c3f73", O = "#2c2f4f", B = "#f3cfa8", E = "#5a3a22", G = "#242424", R = "#b9bec6", P = "#2b2b33";
    const T = (u, x, y, h) => {
      if (h === "hands") return P;
      if (h === "legs") return u.y < 1.9 ? E : O;
      const s = Math.abs(u.x);
      if (s > 4.9) return P;
      if (s > 1.9) return B;
      if (u.y < 7.35) return O;
      return I;
    };
    const w = (u, x, y, h, s, n, f = [0, 0, 0]) => {
      const t = new o.BoxGeometry(u, x, y);
      t.rotateX(f[0]);
      t.rotateY(f[1]);
      t.rotateZ(f[2]);
      t.translate(h, s, n);
      return t;
    };
    const z = async () => {
      const u = [], x = async (h, s, n, f) => u.push([h, await d.lier(s, n), f]);
      for (const h of [-1, 1]) await x("baudrier" + h, C((s, n, f) => {
        const t = (s - 0.5) * 2.4, p = 7.9 + h * Math.sin(t) * 0.35;
        f.set(Math.sin(t) * 1.62, p + 0.42 * n, 0.18 + Math.cos(t) * 1.42);
      }, 24, 1, { sens: -1 }), "chest", b("baudrier", E, { side: o.DoubleSide }));
      await x("ceinture", C((h, s, n) => {
        const f = h * q;
        n.set(Math.sin(f) * 1.82, 7.25 + 0.3 * s, 0.2 + Math.cos(f) * 1.6);
      }, 40, 1, { fermeU: true, sens: -1 }), "hip", b("ceinture", E, { side: o.DoubleSide }));
      await x("sangle", C((h, s, n) => {
        const f = h * q;
        n.set(0.6 + Math.sin(f) * 1.25, 9.6 + Math.cos(f) * 1.25 * 0.2 + 0.3 * s + (Math.sin(f) > 0 ? 0.9 * Math.sin(f) : 0), Math.cos(f) * 1.15);
      }, 32, 1, { fermeU: true, sens: -1 }), "chest", b("sangle", E, { side: o.DoubleSide }));
      const y = new o.SphereGeometry(1, 20, 12, 0, q, 0, L * 0.5);
      y.scale(1.15, 0.75, 1.05);
      y.rotateZ(-0.55);
      y.translate(1.55, 10.5, 0);
      await x("epauliere", y, "chest", b("epauliere", R, { rugosite: 0.3 }));
      await x("brassard", w(1.3, 0.75, 0.8, 4.2, 10.3, 0), "arm_l2", b("brassard", "#6e7380", { rugosite: 0.4 }));
      for (const h of [-1, 1]) await x("botte" + h, w(1.05, 1.4, 1.2, h * 0.8, 1.25, 0.1), h > 0 ? "foot_l2" : "foot_r2", b("botte", E));
      return u;
    };
    const S = () => {
      const u = new o.Group(), x = b("pointes", "#e7bf5c", { rugosite: 0.6 }), y = [];
      const h = (s, n, f, t) => {
        n = n.clone().normalize();
        const p = new o.Vector3().crossVectors(n, new o.Vector3(0, 0, 1));
        if (p.lengthSq() < 1e-4) p.set(1, 0, 0);
        p.normalize();
        const e = new o.Vector3().crossVectors(p, n).normalize();
        y.push(C((c, i, r) => {
          const a = c * q, l = t * (1 - i) ** 0.8;
          r.copy(s).addScaledVector(n, f * i).addScaledVector(p, Math.cos(a) * l).addScaledVector(e, Math.sin(a) * l * 0.42);
        }, 10, 4, { fermeU: true }));
      };
      for (const [s, n, f, t, p, e, c, i] of [[0, 56, 4, 0, 1, 0.4, 30, 15], [-15, 54, 0, -0.6, 1, 0.2, 28, 14], [15, 54, 0, 0.6, 1, 0.2, 28, 14], [-8, 56, -12, -0.35, 0.9, -0.8, 30, 15], [8, 56, -12, 0.35, 0.9, -0.8, 30, 15], [0, 50, -22, 0, 0.6, -1, 28, 14], [-22, 48, -10, -1, 0.7, -0.4, 24, 12], [22, 48, -10, 1, 0.7, -0.4, 24, 12]]) h(new o.Vector3(s * 0.7, n - 12, f * 0.7), new o.Vector3(t, p, e), c + 12, i * 1.15);
      u.add(new o.Mesh(D(y), x));
      return u;
    };
    d.ARTICLES["xe33a4103"] = { nom: "pointes", categorie: "accessoire", attache: "tete", modele: S };
    d.ARTICLES["ex-soldat-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands"], T, { sub: 1, gonfle: 0.02, coupes: { body: [(u) => u.x - 4.9, (u) => -u.x - 4.9, (u) => u.x - 1.9, (u) => -u.x - 1.9, (u) => u.y - 7.35] } }), ...await z()] };
    d.ARTICLES["ex-soldat-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => d.combinaison(["legs"], T, { sub: 1, gonfle: 0.05, coupes: { legs: [(u) => u.y - 1.9] } }) };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#b8341c", O = "#e59a1d", B = "#c97c12", E = "#5fe04a", G = "#1c6a2a", R = "#5a5450", P = "#2a2420";
    const T = new o.Vector3(0, 30, -1), w = new o.Vector3(34, 37.5, 36.5);
    const z = (h, s, n, f) => {
      const t = s * L * 0.93, p = Math.sin(t), e = Math.cos(t), c = w.x * p * Math.sin(h), i = T.y + w.y * e, r = w.z * p * Math.cos(h);
      const a = new o.Vector3(c / w.x ** 2, (i - T.y) / w.y ** 2, r / w.z ** 2).normalize();
      return f.set(c, i, T.z + r).addScaledVector(a, n);
    };
    const S = () => {
      const h = new o.Group();
      h.add(new o.Mesh(C((t, p, e) => z(t * q, p, 0, e), 72, 36, { fermeU: true, sens: -1 }), b("coque", I, { rugosite: 0.35 })));
      const s = C((t, p, e) => {
        const c = (t - 0.5) * 2, i = c * 1.05, r = 21 + 22 * p - 7 * (1 - Math.min(1, Math.abs(c) * 2.2)) * (1 - p) * 0, a = 24 - 9 * Math.max(0, 1 - Math.abs(c) * 1.8), l = a + (43 - a) * p;
        const m = Math.acos(H((l - T.y) / w.y, -1, 1)) / (L * 0.93);
        z(i, m, 1 + 1.2 * Math.sin(p * L), e);
      }, 36, 10);
      const n = d.toile(64, (t) => {
        const p = t.createLinearGradient(0, 0, 0, 64);
        p.addColorStop(0, "#1f7a2a");
        p.addColorStop(0.5, "#5fe04a");
        p.addColorStop(1, "#c9ff8a");
        t.fillStyle = p;
        t.fillRect(0, 0, 64, 64);
        t.globalAlpha = 0.5;
        t.fillStyle = "#fff";
        t.fillRect(10, 0, 6, 64);
        t.globalAlpha = 1;
      });
      h.add(new o.Mesh(s, b("visiere", "#ffffff", { map: n, rugosite: 0.15 })));
      const f = C((t, p, e) => {
        const c = (t - 0.5) * 2, i = c * 1.12, r = 22.5 - 9 * Math.max(0, 1 - Math.abs(c) * 1.8), a = r + (45 - r) * p;
        const l = Math.acos(H((a - T.y) / w.y, -1, 1)) / (L * 0.93);
        z(i, l, 0.5, e);
      }, 36, 8);
      h.add(new o.Mesh(f, b("cadre", P)));
      for (const t of [-1, 1]) {
        const p = new o.SphereGeometry(1, 16, 10);
        p.scale(7, 10, 6);
        const e = z(t * 1.25, 0.62, 1.5, new o.Vector3());
        p.translate(e.x, e.y, e.z);
        h.add(new o.Mesh(p, b("joue", O, { rugosite: 0.3 })));
      }
      return h;
    };
    const u = (h, s, n, f) => {
      if (f === "hands") return B;
      if (f === "legs") {
        if (h.y < 1.2) return I;
        if (h.y > 3 && h.y < 3.5) return I;
        return O;
      }
      const t = Math.abs(h.x);
      if (t > 2.4) return O;
      if (t > 1.6) return I;
      if (h.y < 7.5) return R;
      if (h.y < 8.6) return B;
      return I;
    };
    const x = (h, s, n, f) => {
      h.translate(s, n, f);
      return h;
    };
    const y = async () => {
      const h = [], s = async (e, c, i, r) => h.push([e, await d.lier(c, i), r]);
      for (const e of [-1, 1]) {
        const c = new o.SphereGeometry(1, 24, 16);
        c.scale(1.75, 1.45, 1.6);
        c.translate(e * 2.5, 10.5, 0);
        await s("epaule" + e, c, e > 0 ? "arm_l1" : "arm_r1", b("epaule", O, { rugosite: 0.3 }));
      }
      const n = new o.SphereGeometry(1, 20, 12);
      n.scale(1.8, 1.25, 1.2);
      n.translate(0, 9.6, 0.35);
      await s("plastron", n, "chest", b("plastron", I, { rugosite: 0.35 }));
      const f = new o.CylinderGeometry(0.85, 1.05, 0.6, 16);
      f.translate(0, 10.8, 0);
      await s("col", f, "chest", b("col", B));
      const t = C((e, c, i) => {
        const r = e * q, a = 0.78 + 0.12 * Math.sin(c * L);
        i.set(-4.4 - 3.3 * c, 10.3 + Math.sin(r) * a, Math.cos(r) * a);
      }, 24, 8, { fermeU: true });
      await s("canon", t, "wrist_r", b("canon", "#2f7d39", { rugosite: 0.35 }));
      for (const e of [-5.4, -6.4]) {
        const c = new o.TorusGeometry(0.92, 0.12, 8, 20);
        c.rotateY(L / 2);
        c.translate(e, 10.3, 0);
        await s("bague" + e, c, "wrist_r", b("bague", "#c9c64a"));
      }
      const p = new o.CylinderGeometry(0.55, 0.55, 0.1, 16);
      p.rotateZ(L / 2);
      p.translate(-7.72, 10.3, 0);
      await s("bout", p, "wrist_r", b("bout", P));
      for (const e of [-1, 1]) {
        const c = new o.SphereGeometry(0.62, 14, 10);
        c.translate(e * 0.82, 3.25, 0.45);
        await s("genou" + e, c, e > 0 ? "foot_l2" : "foot_r2", b("genou", I));
        const i = new o.CylinderGeometry(0.72, 0.8, 1.3, 16);
        i.translate(e * 0.8, 0.75, 0.1);
        await s("botte" + e, i, e > 0 ? "ankle_l" : "ankle_r", b("botte", I));
      }
      return h;
    };
    d.ARTICLES["x963179ef"] = { nom: "casque", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: S };
    d.ARTICLES["chasseuse-2"] = { nom: "armure", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands"], u, { sub: 1, gonfle: 0.04, coupes: { body: [(h) => h.x - 2.4, (h) => -h.x - 2.4, (h) => h.x - 1.6, (h) => -h.x - 1.6, (h) => h.y - 7.5, (h) => h.y - 8.6] } }), ...await y()] };
    d.ARTICLES["chasseuse-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => d.combinaison(["legs"], u, { sub: 1, gonfle: 0.06, coupes: { legs: [(h) => h.y - 1.2, (h) => h.y - 3, (h) => h.y - 3.5] } }) };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#f1efe8", O = "#d9d5ca", B = "#e2a878", E = "#1e1d1f", G = "#c8221c";
    const R = (w, z, S, u) => {
      if (u === "hands") return G;
      if (u === "legs") return w.y < 0.95 ? B : I;
      const x = Math.abs(w.x);
      if (x > 5.2) return G;
      if (x > 2.15) return B;
      if (z.z > 0.3 && w.y > 8.2 && x < (w.y - 8.2) * 0.55) return B;
      return I;
    };
    const P = async () => {
      const w = [], z = async (u, x, y, h) => w.push([u, await d.lier(x, y), h]);
      await z("ceinture", C((u, x, y) => {
        const h = u * q;
        y.set(Math.sin(h) * 1.85, 7.2 + 0.35 * x, 0.2 + Math.cos(h) * 1.62);
      }, 40, 1, { fermeU: true, sens: -1 }), "hip", b("ceinture", E, { side: o.DoubleSide }));
      const S = new o.SphereGeometry(0.28, 10, 8);
      S.scale(1.3, 1, 0.8);
      S.translate(0.35, 7.35, 1.85);
      await z("noeud", S, "hip", b("noeud", E));
      for (const [u, x] of [[0.25, 0.25], [0.5, -0.15]]) {
        const y = new o.BoxGeometry(0.25, 1.1, 0.06);
        y.translate(0, -0.55, 0);
        y.rotateZ(x);
        y.translate(u, 7.3, 1.9);
        await z("pan" + u, y, "hip", b("pan", E));
      }
      return w;
    };
    const T = () => {
      const w = new o.Group(), z = b("bandeau", G, { rugosite: 0.9, side: o.DoubleSide }), S = -3;
      const u = [35.6, 35.4, 34.6, 33.2, 31.4, 31.4, 30.2, 29.8, 30.2, 31.2, 32.3, 32.6, 32.7];
      const x = (c, i) => {
        const r = Math.abs(Math.atan2(Math.sin(c), Math.cos(c))) / L * 12, a = Math.min(11, Math.floor(r));
        return u[a] + (u[a + 1] - u[a]) * (r - a) + 0.3 - (i - 47) * 0.22;
      };
      const y = (c) => 36.5 - 2 * (1 - Math.cos(c)) / 2, h = 7.5, s = (c) => Math.cos(c) < 0 ? 3.5 * Math.min(1, -Math.cos(c) * 2) : 0;
      const n = C((c, i, r) => {
        const a = c * q, l = y(a) + h * i, m = x(a, l) + s(a) + 0.4 * Math.sin(i * L);
        r.set(Math.sin(a) * m, l, S + Math.cos(a) * m);
      }, 96, 5, { fermeU: true, sens: -1 });
      const f = y(L) + h / 2, t = S - x(L, f) - 3.5 - 1.2;
      const p = (c, i, r) => C((a, l, m) => {
        const M = (a - 0.5) * (5 * (1 - 0.4 * l) + 0.5);
        m.set(c * (2 + 9 * l) + 2 * Math.sin(l * 5 + r), f - 2 - 20 * l * l + M + 2 * Math.sin(l * 6 + r), t - i * l);
      }, 3, 16);
      const e = new o.SphereGeometry(2.6, 12, 8);
      e.scale(1.2, 1, 0.8);
      e.translate(0, f, t);
      w.add(new o.Mesh(D([n, e, p(1, 34, 0), p(-1, 28, 1.6)].map(d.indexee)), z));
      return w;
    };
    d.ARTICLES["x25940e6f"] = { nom: "bandeau", categorie: "chapeau", attache: "tete", cache_cheveux: "aucun", modele: T };
    d.ARTICLES["errant-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands"], R, { sub: 2, gonfle: 0.03, coupes: { body: [(w) => w.x - 5.2, (w) => -w.x - 5.2, (w) => w.x - 2.15, (w) => -w.x - 2.15, (w) => w.x - (w.y - 8.2) * 0.55, (w) => -w.x - (w.y - 8.2) * 0.55] } }), ...await P()] };
    d.ARTICLES["errant-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => d.combinaison(["legs"], R, { sub: 1, gonfle: 0.12, coupes: { legs: [(w) => w.y - 0.95] } }) };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#f6f6f2", O = "#2f63d6", B = "#f04a8e", E = "#f6c32a";
    const G = new o.Vector3(0, 28, -1), R = new o.Vector3(33.5, 37, 35);
    const P = (S) => S.z > 5 && (S.x / 23.5) ** 2 + ((S.y - 24) / 19) ** 2 < 1;
    const T = () => {
      const S = new o.Group();
      let u = new o.SphereGeometry(1, 56, 36);
      u.scale(R.x, R.y, R.z);
      u.translate(G.x, G.y, G.z);
      u.deleteAttribute("uv");
      u = d.couper(u.toNonIndexed(), [(a) => a.z > 0 ? (a.x / 23.5) ** 2 + ((a.y - 24) / 19) ** 2 - 1 : 1]);
      const x = u.attributes.position, y = [], h = new o.Vector3();
      for (let a = 0; a < x.count / 3; a++) {
        h.set(0, 0, 0);
        for (let l = 0; l < 3; l++) h.add(new o.Vector3().fromBufferAttribute(x, a * 3 + l));
        h.multiplyScalar(1 / 3);
        if (!P(h) && h.y > -9) y.push(a);
      }
      const s = d.indexer(d.extraire(u, y));
      S.add(new o.Mesh(s, b("casque", I, { rugosite: 0.35, side: o.DoubleSide })));
      const n = C((a, l, m) => {
        const M = a * q, g = Math.sin(M) * 23.5, A = 24 + Math.cos(M) * 19, V = Math.sqrt(Math.max(0, 1 - (g / R.x) ** 2 - ((A - G.y) / R.y) ** 2)) * R.z + G.z;
        m.set(g * (1 - 0.03 * l), A - (A - 24) * 0.03 * l, V - 2.5 + 2.2 * l);
      }, 64, 2, { fermeU: true });
      S.add(new o.Mesh(n, b("bord", "#dcdcd8", { side: o.DoubleSide })));
      const f = d.toile(256, (a) => {
        a.fillStyle = "#f7b98c";
        a.fillRect(0, 0, 256, 256);
        const l = a.createRadialGradient(128, 150, 20, 128, 140, 170);
        l.addColorStop(0, "rgba(255,255,255,.18)");
        l.addColorStop(1, "rgba(120,40,20,.25)");
        a.fillStyle = l;
        a.fillRect(0, 0, 256, 256);
        a.fillStyle = "#151515";
        for (const m of [88, 168]) {
          a.beginPath();
          a.ellipse(m, 112, 21, 46, 0, 0, q);
          a.fill();
        }
        a.fillStyle = "rgba(255,255,255,.85)";
        for (const m of [80, 160]) {
          a.beginPath();
          a.ellipse(m, 92, 6, 10, 0, 0, q);
          a.fill();
        }
      });
      const t = C((a, l, m) => {
        const M = a * q, g = l, A = Math.sin(M) * 23.8 * g, V = 24 + Math.cos(M) * 19.3 * g, N = Math.sqrt(Math.max(0, 1 - (A / (R.x - 1.2)) ** 2 - ((V - G.y) / (R.y - 1.2)) ** 2)) * (R.z - 1.2) + G.z;
        m.set(A, V, N);
      }, 48, 12, { fermeU: true });
      const p = t.attributes.uv, e = t.attributes.position;
      for (let a = 0; a < p.count; a++) p.setXY(a, 0.5 + e.getX(a) / 48, 0.5 + (e.getY(a) - 24) / 48);
      S.add(new o.Mesh(t, b("visage", "#ffffff", { map: f, rugosite: 0.6 })));
      const c = new o.TorusGeometry(15, 4, 10, 32);
      c.rotateX(L / 2);
      c.translate(0, -7, G.z);
      S.add(new o.Mesh(c, b("col", I, { rugosite: 0.35 })));
      const i = new o.CylinderGeometry(1.4, 1.4, 12, 10);
      i.translate(0, G.y + R.y + 5, G.z);
      S.add(new o.Mesh(i, b("tige", "#c9c9c4")));
      const r = new o.SphereGeometry(7, 20, 14);
      r.translate(0, G.y + R.y + 14, G.z);
      S.add(new o.Mesh(r, b("pompon", B, { rugosite: 0.5 })));
      return S;
    };
    const w = (S, u, x, y) => {
      if (y === "hands") return B;
      if (y === "legs") return S.y < 1.25 ? B : I;
      const h = Math.abs(S.x);
      if (h > 4.9) return B;
      if (h > 1.65) return I;
      if (S.y < 7.6) return E;
      if (S.y < 7) return I;
      return O;
    };
    const z = async () => {
      const S = [], u = async (y, h, s, n) => S.push([y, await d.lier(h, s), n]);
      const x = new o.BoxGeometry(0.8, 0.55, 0.2);
      x.translate(0, 7.35, 1.72);
      await u("boucle", x, "hip", b("boucle", "#f3e27a"));
      for (const y of [-1, 1]) {
        const h = new o.SphereGeometry(1, 16, 10);
        h.scale(0.78, 0.58, 1.15);
        h.translate(y * 0.85, 0.5, 0.4);
        await u("botte" + y, h, y > 0 ? "ankle_l" : "ankle_r", b("botte", B, { rugosite: 0.5 }));
        const s = new o.SphereGeometry(1, 14, 10);
        s.scale(0.6, 0.6, 0.6);
        s.translate(y * 5.9, 10.3, 0);
        await u("gant" + y, s, y > 0 ? "wrist_l" : "wrist_r", b("gant", B, { rugosite: 0.5 }));
      }
      return S;
    };
    d.ARTICLES["x7f39ac3b"] = { nom: "casque", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: T };
    d.ARTICLES["bombeur-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands"], w, { sub: 1, gonfle: 0.03, coupes: { body: [(S) => S.x - 4.9, (S) => -S.x - 4.9, (S) => S.x - 1.65, (S) => -S.x - 1.65, (S) => S.y - 7.6, (S) => S.y - 7] } }), ...await z()] };
    d.ARTICLES["bombeur-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => d.combinaison(["legs"], w, { sub: 1, gonfle: 0.03, coupes: { legs: [(S) => S.y - 1.25] } }) };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#aab2bb", O = "#7d858e", B = "#16181b", E = "#efece4", G = "#b3141c", R = "#8c939b", P = "#6f767e", T = "#4b3322", w = "#35241a";
    const z = (e) => {
      e = e.index ? e.toNonIndexed() : e;
      e.computeVertexNormals();
      return e;
    };
    const S = [[76, 18, 19, -21], [75, 27, 28, -30], [72, 31.5, 32.5, -34], [64, 33.5, 34.5, -36], [46, 34, 35.5, -36.5], [28, 34, 35.5, -36], [12, 33, 35, -35], [0, 32, 34, -34], [-4, 31.5, 33.5, -33.5]];
    const u = 2.6, x = (e) => {
      const c = Math.cos(e), i = Math.sin(e);
      return 1 / Math.pow(Math.abs(c) ** u + Math.abs(i) ** u, 1 / u);
    };
    const y = (e) => {
      for (let c = 0; c < S.length - 1; c++) {
        const [i] = S[c], [r] = S[c + 1];
        if (e <= i && e >= r) {
          const a = (i - e) / (i - r);
          return S[c].map((l, m) => l + (S[c + 1][m] - l) * a);
        }
      }
      return e > S[0][0] ? S[0] : S[S.length - 1];
    };
    const h = (e, c, i = 0, r = new o.Vector3()) => {
      const [, a, l, m] = y(c), M = x(e), g = Math.cos(e) >= 0 ? l : -m;
      const A = Math.sin(e) * a * M, V = Math.cos(e) * g * M;
      const N = new o.Vector3(A / (a * a), 0, V / (g * g)).normalize();
      return r.set(A, c, V).addScaledVector(N, i);
    };
    const s = () => {
      const e = new o.Group(), c = b("heaume", I, { rugosite: 0.32 }), i = b("fente", B, { rugosite: 0.9 }), r = b("renfort", O, { rugosite: 0.35 });
      const a = [76, 75, 74, 72, 68, 64, 56, 46, 36, 28, 20, 12, 6, 0, -4];
      e.add(new o.Mesh(C((g, A, V) => h(g * q, a[Math.round(A * (a.length - 1))], 0, V), 40, a.length - 1, { fermeU: true, sens: -1 }), c));
      e.add(new o.Mesh(C((g, A, V) => {
        const N = h(g * q, 76, 0, V);
        return V.set(N.x * (1 - A), 76 + 2.2 * Math.sin((1 - A) * L / 2) * A, N.z * (1 - A));
      }, 40, 4, { fermeU: true, sens: -1 }), c));
      e.add(new o.Mesh(C((g, A, V) => {
        const N = g * q;
        V.set(Math.sin(N) * (31.5 - 9 * A), -4 - 1 * A, Math.cos(N) * (33 - 9 * A) - 1);
      }, 32, 2, { fermeU: true }), r));
      const l = (g, A, V, N, Y, _, k) => {
        const F = C((j, J, W) => h(g + (A - g) * j, V + (N - V) * J, Y, W), 16, 2);
        e.add(new o.Mesh(F, _));
        F.name = k;
      };
      l(-1.05, -0.13, 41, 45.5, 0.5, i);
      l(0.13, 1.05, 41, 45.5, 0.5, i);
      l(-0.13, 0.13, 6, 58, 1.6, r);
      l(-1.1, 1.1, 46.5, 49.5, 1.2, r);
      const m = [];
      for (let g = 0; g < 3; g++) for (let A = 0; A < 4; A++) {
        const V = new o.CylinderGeometry(1, 1, 3, 8);
        V.rotateX(L / 2);
        const N = -0.35 - A * 0.17, Y = h(N, 30 - g * 6, 0.3);
        V.rotateY(N);
        V.translate(Y.x, Y.y, Y.z);
        m.push(d.indexee(V));
      }
      e.add(new o.Mesh(D(m), i));
      const M = [];
      for (let g = 0; g < 18; g++) {
        const A = g / 18 * q, V = h(A, 70, 0.6), N = new o.SphereGeometry(0.9, 6, 4);
        N.translate(V.x, V.y, V.z);
        M.push(d.indexee(N));
      }
      e.add(new o.Mesh(D(M), r));
      return e;
    };
    const n = (e, c, i, r) => {
      if (r === "hands") return T;
      if (r === "legs") return e.y < 1.05 ? w : e.y < 1.4 ? T : Math.floor(e.y * 4) % 2 ? R : P;
      const a = Math.abs(e.x);
      if (a > 1.65) return a > 5.25 ? T : Math.floor(a * 4) % 2 ? R : P;
      if (e.y > 7.48 && e.y < 7.78) return w;
      if (e.y > 10.75) return Math.floor(e.y * 5) % 2 ? R : P;
      if (a < 0.36 && e.y > 7.78 && e.y < 10.4 || Math.abs(e.y - 9.55) < 0.25 && a < 1.25) return G;
      return E;
    };
    const f = async () => d.combinaison(["body", "hands", "legs"], n, { sub: 1, coupes: { body: [(e) => e.x - 1.65, (e) => -e.x - 1.65, (e) => e.x - 5.25, (e) => -e.x - 5.25, (e) => e.y - 7.48, (e) => e.y - 7.78, (e) => e.y - 10.75, (e) => e.x - 0.36, (e) => -e.x - 0.36, (e) => e.y - 9.3, (e) => e.y - 9.8, (e) => e.x - 1.25, (e) => -e.x - 1.25, (e) => e.y - 10.4], legs: [(e) => e.y - 1.05, (e) => e.y - 1.4] } });
    const t = async () => {
      const e = [];
      for (const r of [0, 1]) {
        const a = (m, M, g, A) => {
          const V = (r ? L : 0) + (m - 0.5) * 2.3, N = 1.74 + 0.45 * M - g, Y = 1.5 + 0.5 * M - g;
          return A.set(Math.sin(V) * N, 7.5 - 3.6 * M, 0.2 + Math.cos(V) * Y);
        };
        const l = D([C((m, M, g) => a(m, M, 0, g), 30, 8, { sens: -1 }), C((m, M, g) => a(m, M, 0.06, g), 30, 8)]);
        e.push(["pan" + r, await d.lier(l, "hip"), b("pan", E, { side: o.DoubleSide })]);
        if (!r) {
          const m = C((M, g, A) => a(0.44 + 0.12 * M, g * 0.55, -0.012, A), 4, 6, { sens: -1 });
          e.push(["croix-bas", await d.lier(m, "hip"), b("croix", G, { side: o.DoubleSide })]);
        }
      }
      const c = C((r, a, l) => {
        const m = r * q, M = a * q;
        l.set(Math.sin(m) * (1.8 + 0.07 * Math.cos(M)), 7.63 + 0.14 * Math.sin(M), 0.22 + Math.cos(m) * (1.54 + 0.07 * Math.cos(M)));
      }, 64, 8, { fermeU: true });
      e.push(["ceinture", await d.lier(c, "hip"), b("ceinture", w)]);
      const i = new o.BoxGeometry(0.5, 0.36, 0.1);
      i.translate(0, 7.63, 1.86);
      e.push(["boucle", await d.lier(i, "hip"), b("boucle", O, { rugosite: 0.4 })]);
      return e;
    };
    const p = async () => {
      const e = [], c = new o.Vector3(-6.45, 10.3, 0.1);
      const i = new o.Shape();
      i.moveTo(-0.28, 0);
      i.lineTo(0.28, 0);
      i.lineTo(0.22, 5.6);
      i.lineTo(0, 6.5);
      i.lineTo(-0.22, 5.6);
      i.closePath();
      const r = new o.ExtrudeGeometry(i, { depth: 0.1, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.04, bevelSegments: 1 });
      r.translate(0, 0.95, -0.05);
      const a = new o.BoxGeometry(2.1, 0.26, 0.34);
      a.translate(0, 0.82, 0);
      const l = new o.CylinderGeometry(0.17, 0.19, 1.1, 10);
      l.translate(0, 0.17, 0);
      const m = new o.SphereGeometry(0.32, 12, 8);
      m.translate(0, -0.5, 0);
      const M = (g) => {
        g.rotateZ(-L / 2);
        g.rotateY(-1.3);
        g.translate(c.x, c.y, c.z);
        return g;
      };
      e.push(["lame", await d.lier(M(z(r)), "wrist_r"), b("lame", "#dde3ea", { rugosite: 0.25 })]);
      e.push(["garde", await d.lier(M(z(a)), "wrist_r"), b("garde", "#a8873a", { rugosite: 0.4 })]);
      e.push(["fusee", await d.lier(M(l), "wrist_r"), b("fusee", w)], ["pommeau", await d.lier(M(m), "wrist_r"), b("pommeau", "#a8873a", { rugosite: 0.4 })]);
      return e;
    };
    d.ARTICLES["xe2ab1595"] = { nom: "heaume", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: s };
    d.ARTICLES["soldat-2"] = { nom: "surcot", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await f(), ...await t(), ...await p()] };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, borne: H, lisse: X, mat: b, surface: C, fusion: D } = d;
    const I = "#2b50b6", O = "#1f3c8c", B = "#86a8f2", E = "#363944", G = "#2a2c33", R = "#8c857a", P = "#6e675d", T = "#e3dcc8", w = "#ffb02e";
    const z = (s) => {
      s = s.index ? s.toNonIndexed() : s;
      s.computeVertexNormals();
      return s;
    };
    const S = (s, n, f, t, p, e, c = 0.7, i = 14, r = 10) => {
      n = n.clone().normalize();
      const a = e.clone().sub(n.clone().multiplyScalar(e.dot(n))).normalize(), l = new o.Vector3().crossVectors(n, a).normalize();
      return C((m, M, g) => {
        const A = m * q, V = t * (1 - M) ** 1.05, N = s.clone().addScaledVector(n, f * M).addScaledVector(a, p * f * M * M);
        g.copy(N).addScaledVector(l, Math.cos(A) * V * c).addScaledVector(a, Math.sin(A) * V);
      }, i, r, { fermeU: true });
    };
    const u = () => {
      const s = new o.Group(), n = b("casque", I, { rugosite: 0.28 }), f = b("crete", B, { rugosite: 0.3 }), t = b("machoire", R, { rugosite: 0.85 }), p = b("mandibule", P, { rugosite: 0.8 });
      const e = (l, m, M, g = 32) => {
        const A = new o.SphereGeometry(1, g, Math.round(g * 0.7));
        A.scale(m[0], m[1], m[2]);
        A.translate(l[0], l[1], l[2]);
        return new o.Mesh(A, M);
      };
      s.add(e([0, 34, 4], [21, 21, 36], t));
      s.add(e([0, 22, 20], [17, 13, 26], p));
      s.add(e([0, 28, 40], [8, 8, 7], b("bouche", "#4a1f24", { rugosite: 0.9 })));
      const c = (l, m, M, g) => {
        const A = l * q, V = Math.cos(A), N = m * L * (0.56 + 0.1 * Math.max(0, V) ** 3 + 0.1 * Math.max(0, -V)), Y = Math.sin(N);
        const _ = (V > 0 ? 38 : 52) + M, k = 24 + M - (V > 0 ? 8 * V ** 3 : 0), F = 18 + M;
        return g.set(Math.sin(A) * Y * k, 42 + Math.cos(N) * F - (V > 0 ? 6 * V ** 4 * Y : 0), -2 + V * Y * _);
      };
      s.add(new o.Mesh(D([C((l, m, M) => c(l, m, 0, M), 72, 24, { fermeU: true, sens: -1 }), C((l, m, M) => c(l, m, -1.5, M), 48, 16, { fermeU: true })]), n));
      s.add(new o.Mesh(C((l, m, M) => c(l, 0.985 + 0.015 * m, 1, M), 72, 1, { fermeU: true, sens: -1 }), f));
      s.add(new o.Mesh(S(new o.Vector3(0, 60, 10), new o.Vector3(0, 0.05, -1), 64, 5, -0.12, new o.Vector3(0, 1, 0), 0.35), f));
      s.add(new o.Mesh(S(new o.Vector3(0, 46, 26), new o.Vector3(0, -0.35, 1), 18, 6, 0.05, new o.Vector3(0, 1, 0), 2), n));
      const i = [], r = [], a = b("dents", T, { rugosite: 0.5 });
      for (const [l, m] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
        const M = new o.Vector3(l * 8, 28 + m * 7, 34), g = new o.Vector3(l * 0.95, m * 0.5, 0.8), A = 0, V = new o.Vector3(-l * 0.55, -m * 0.35, 0.3);
        i.push(S(M, g, 34, 8.5, 0.3, V, 0.5, 16, 12));
        for (let N = 1; N <= 3; N++) {
          const Y = M.clone().addScaledVector(g.clone().normalize(), 34 * N / 4.4).addScaledVector(V.clone().normalize(), 3.2), _ = new o.ConeGeometry(1.4, 4.5, 6);
          _.rotateZ(l > 0 ? L / 2 : -L / 2);
          _.translate(Y.x - l * 2, Y.y - m * 2, Y.z + 1.5);
          r.push(d.indexee(_));
        }
      }
      s.add(new o.Mesh(D(i.map(d.indexee)), p), new o.Mesh(D(r), a));
      for (const l of [-1, 1]) s.add(e([l * 17, 37, 22], [4, 3, 5], b("yeux", w, { rugosite: 0.2 }), 14));
      s.add(e([0, 6, -4], [13, 16, 13], p));
      return s;
    };
    const x = (s, n, f, t) => {
      if (t === "hands") return G;
      if (t === "legs") return s.y < 1.05 ? G : E;
      const p = Math.abs(s.x);
      if (p > 1.7) return p > 4.2 && p < 5.25 ? O : E;
      if (s.y < 7.7) return E;
      if (Math.abs(s.y - 8.6) < 0.12) return B;
      return I;
    };
    const y = (s, n, f, t, p, e, c = {}) => {
      const i = new o.BoxGeometry(s, n, f, 2, 2, 2), r = i.attributes.position, a = c.biseau ?? 0.25;
      for (let l = 0; l < r.count; l++) {
        const m = r.getX(l) / (s / 2), M = r.getY(l) / (n / 2), g = r.getZ(l) / (f / 2), A = (Math.abs(m) > 0.99) + (Math.abs(M) > 0.99) + (Math.abs(g) > 0.99);
        if (A >= 2) {
          const V = 1 - a * (A - 1) * 0.5;
          r.setXYZ(l, r.getX(l) * (Math.abs(m) > 0.99 ? V : 1), r.getY(l) * (Math.abs(M) > 0.99 ? V : 1), r.getZ(l) * (Math.abs(g) > 0.99 ? V : 1));
        }
        if (c.bombe && g > 0.99) r.setZ(l, r.getZ(l) + c.bombe * (1 - m * m * 0.7) * (1 - M * M * 0.5));
      }
      i.rotateX(c.rx || 0);
      i.rotateY(c.ry || 0);
      i.rotateZ(c.rz || 0);
      i.translate(t, p, e);
      return z(i);
    };
    const h = async () => {
      const s = [], n = b("armure", I, { rugosite: 0.3 }), f = b("armure2", O, { rugosite: 0.35 }), t = b("liser\xE9", B, { rugosite: 0.3 });
      const p = async (e, c, i, r) => s.push([e, await d.lier(c, i), r]);
      await p("plastron", y(3.7, 2, 2.7, 0, 9.7, 0.35, { bombe: 0.45 }), "chest", n);
      await p("crete-plastron", y(0.3, 1.8, 0.4, 0, 9.7, 1.95, { biseau: 0.4 }), "chest", t);
      await p("dos", y(3.6, 2.4, 1.8, 0, 10, -1.25, { bombe: 0.35, ry: L }), "chest", f);
      await p("col", y(2.6, 1, 1.4, 0, 11.1, -0.9, { biseau: 0.35, rx: -0.4 }), "chest", n);
      for (const e of [-1, 1]) {
        const c = e > 0 ? "arm_l1" : "arm_r1";
        await p("epaule" + e, y(3, 1.5, 3, e * 2.7, 10.9, 0, { rz: -e * 0.38, bombe: 0.45 }), c, n);
        await p("epaule-bord" + e, y(2.6, 0.35, 2.8, e * 3.15, 10.05, 0, { rz: -e * 0.45 }), c, t);
        await p("cuisse" + e, y(1.3, 1.6, 1.5, e * 0.86, 5.4, 0.2, { bombe: 0.15 }), e > 0 ? "foot_l1" : "foot_r1", n);
        await p("tibia" + e, y(1.1, 1.5, 1.25, e * 0.82, 2.2, 0.25, { bombe: 0.12 }), e > 0 ? "foot_l2" : "foot_r2", f);
      }
      return s;
    };
    d.ARTICLES["xf6d8c53f"] = { nom: "casque", categorie: "chapeau", attache: "tete", cache_cheveux: "tete", modele: u };
    d.ARTICLES["guerrier-2"] = { nom: "armure", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands", "legs"], x, { sub: 1, coupes: { body: [(s) => s.x - 1.7, (s) => -s.x - 1.7, (s) => s.x - 4.2, (s) => -s.x - 4.2, (s) => s.x - 5.25, (s) => -s.x - 5.25, (s) => s.y - 7.7, (s) => s.y - 8.48, (s) => s.y - 8.72], legs: [(s) => s.y - 1.05] } }), ...await h()] };
  })();
  (() => {
    const { T: o, PI: L, TAU: q, mat: H, fusion: X } = d;
    const b = { p: "#e89a9a", P: "#d47c80", q: "#f2b4b4", g: "#5f8f3a", G: "#3f6e2a", o: "#e8e2cf", O: "#bdb39a", n: "#7d3b46", b: "#ffffff", k: "#1a1a1a", r: "#b04050" };
    const C = (E) => {
      const G = d.toile(8, (R) => {
        E.forEach((P, T) => [...P].forEach((w, z) => {
          R.fillStyle = b[w];
          R.fillRect(z, T, 1, 1);
        }));
      });
      G.magFilter = G.minFilter = o.NearestFilter;
      G.generateMipmaps = false;
      return G;
    };
    const D = () => {
      const E = new o.Group();
      const G = C(["pPpppPpp", "pppqpppp", "pkbppbkp", "ppppPppp", "pnrrrrnp", "pprnnrpp", "pPpppppg", "ppPppggg"]);
      const R = C(["ppgggooo", "pggGgooo", "pggGooOo", "ppgggooo", "ppgGgOoo", "pggggooo", "pgGggoOo", "ppgggooo"]);
      const P = C(["pppPpppp", "pPpppppp", "pppppPpp", "ppqppppp", "pppppppP", "pPpppppp", "pppppqpp", "pppPpppp"]);
      const T = C(["ppppgggo", "pPppggoo", "ppppgGoo", "pppqggoo", "pppppggo", "pPpppggo", "ppppppgo", "pppppppg"]);
      const w = C(["pppPpppp", "pppppppP", "pPpppppp", "ppppqppp", "pppppppp", "ppPppppp", "pppppPpp", "pppppppp"]);
      const z = (x) => H("cube", "#ffffff", { map: x, rugosite: 0.9 });
      const S = new o.BoxGeometry(60, 60, 60);
      S.translate(0, 30, -2);
      E.add(new o.Mesh(S, [z(P), z(R), z(T), z(w), z(G), z(w)]));
      const u = new o.BoxGeometry(22, 14, 6);
      u.translate(0, 19, 31);
      E.add(new o.Mesh(u, H("groin", b.r, { rugosite: 0.8 })));
      for (const x of [-1, 1]) {
        const y = new o.BoxGeometry(5, 6, 1);
        y.translate(x * 5, 19, 34.2);
        E.add(new o.Mesh(y, H("narine", b.n)));
      }
      return E;
    };
    const I = ["#e89a9a", "#d47c80", "#e89a9a", "#e89a9a", "#5f8f3a", "#f2b4b4", "#d47c80", "#e89a9a"];
    const O = (E, G, R, P) => {
      const T = Math.floor(E.x * 1.3) * 7 + Math.floor(E.y * 1.3) * 13 + Math.floor(E.z * 1.3) * 5 & 7;
      if (P === "hands") return "#e89a9a";
      if (P === "legs") return E.y > 6.1 ? "#5a3d22" : I[T];
      if (E.y < 7.6 && Math.abs(E.x) < 1.7) return "#5a3d22";
      return I[T];
    };
    const B = async () => {
      const E = [], G = new o.Vector3(-6.2, 10.3, 0), R = 0.4, P = H("or", "#f2c230", { rugosite: 0.35 }), T = H("or2", "#c8961c", { rugosite: 0.35 }), w = H("bois", "#5a3d22"), z = H("contour", "#3a2a10");
      const S = (h, s, n) => {
        const f = new o.BoxGeometry(R, R, R * 1.1);
        f.translate(h * R, s * R, 0);
        return [f, n];
      };
      const u = [];
      for (let h = 0; h < 9; h++) {
        u.push(S(h, h, h % 2 ? P : T));
        u.push(S(h + 1, h, T));
      }
      for (const [h, s] of [[-2, 0], [-1, -1], [0, -2], [-1, 1], [1, -1]]) u.push(S(h, s, T));
      for (const [h, s] of [[-2, -2], [-3, -3]]) u.push(S(h, s, w));
      const x = /* @__PURE__ */ new Map();
      for (const [h, s] of u) {
        if (!x.has(s)) x.set(s, []);
        x.get(s).push(d.indexee(h));
      }
      let y = 0;
      for (const [h, s] of x) {
        const n = X(s);
        n.translate(R * 3, R * 3, 0);
        n.rotateZ(-L / 4);
        n.rotateX(-0.35);
        n.translate(G.x - 0.4, G.y, G.z + 0.75);
        E.push(["epee" + y++, await d.lier(n, "wrist_r"), h]);
      }
      return E;
    };
    d.ARTICLES["x65c65291"] = { nom: "tete", categorie: "chapeau", attache: "tete", cache_cheveux: "tete", modele: D };
    d.ARTICLES["porcin-2"] = { nom: "corps", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d.combinaison(["body", "hands"], O, { sub: 1, gonfle: 0.02 }), ...await B()] };
    d.ARTICLES["porcin-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => d.combinaison(["legs"], O, { sub: 1, gonfle: 0.02 }) };
  })();
  (() => {
    const o = window.THREE, L = window.__pcvESM;
    const q = { blanc: 16053230, gilet: 1841953, bouton: 15382842, noeud: 1873462 };
    const H = /* @__PURE__ */ new Set(["skl_root", "chest", "hip"]);
    const X = 0.07;
    const b = (G) => new Promise((R, P) => {
      const T = new XMLHttpRequest();
      T.open("GET", G);
      T.responseType = "arraybuffer";
      T.onload = () => (T.status === 200 || T.status === 0) && T.response ? R(T.response) : P(new Error("absent : " + G));
      T.onerror = () => P(new Error("absent : " + G));
      T.send();
    });
    const C = (G, R, P = false) => {
      const T = new o.MeshStandardMaterial({ name: G, color: new o.Color(R), roughness: 0.8, metalness: 0 });
      if (P) T.userData.teintable = true;
      return T;
    };
    const D = (G) => {
      let R = "";
      const P = new Uint8Array(G);
      for (let T = 0; T < P.length; T += 32768) R += String.fromCharCode(...P.subarray(T, T + 32768));
      return btoa(R);
    };
    const I = (G) => {
      const R = [], P = [];
      for (const w of G) {
        const z = w.index ? w.toNonIndexed() : w;
        R.push(...z.attributes.position.array);
        P.push(...z.attributes.normal.array);
      }
      const T = new o.BufferGeometry();
      T.setAttribute("position", new o.Float32BufferAttribute(R, 3));
      T.setAttribute("normal", new o.Float32BufferAttribute(P, 3));
      return T;
    };
    const O = async () => {
      const G = (await d.corps("M")).gltf;
      const R = G.scene;
      R.updateMatrixWorld(true);
      let P = null;
      R.traverse((U) => {
        if (!P && U.isSkinnedMesh && U.skeleton.bones.some((Z) => Z.name === "chest")) P = U;
      });
      const T = P.skeleton, w = P.geometry;
      const z = (U) => T.bones.findIndex((Z) => Z.name === U), S = z("chest");
      const u = new Set(T.bones.map((U, Z) => H.has(U.name) ? Z : -1).filter((U) => U >= 0));
      const x = w.attributes.position, y = w.attributes.normal, h = w.attributes.skinIndex, s = w.attributes.skinWeight;
      const n = (U) => {
        let Z = 0, v = -1;
        for (let $ = 0; $ < 4; $++) {
          const K = s.getComponent(U, $);
          if (K > v) {
            v = K;
            Z = h.getComponent(U, $);
          }
        }
        return Z;
      };
      const f = T.boneInverses[S].clone().multiply(P.bindMatrix), t = f.clone().invert();
      const p = w.index ? w.index.array : Array.from({ length: x.count }, (U, Z) => Z);
      const e = /* @__PURE__ */ new Map(), c = [];
      for (let U = 0; U < p.length; U += 3) {
        const Z = [p[U], p[U + 1], p[U + 2]];
        if (Z.every((v) => u.has(n(v)))) c.push(Z);
      }
      const i = [], r = [], a = [], l = [], m = [], M = new o.Vector3(), g = new o.Vector3();
      const A = (U) => {
        if (e.has(U)) return e.get(U);
        const Z = i.length / 3;
        e.set(U, Z);
        M.fromBufferAttribute(x, U);
        g.fromBufferAttribute(y, U);
        M.addScaledVector(g, X);
        i.push(M.x, M.y, M.z);
        r.push(g.x, g.y, g.z);
        for (let v = 0; v < 4; v++) {
          a.push(h.getComponent(U, v));
          l.push(s.getComponent(U, v));
        }
        return Z;
      };
      for (const U of c) m.push(...U.map(A));
      const V = new o.BufferGeometry();
      V.setAttribute("position", new o.Float32BufferAttribute(i, 3));
      V.setAttribute("normal", new o.Float32BufferAttribute(r, 3));
      V.setAttribute("skinIndex", new o.Uint16BufferAttribute(a, 4));
      V.setAttribute("skinWeight", new o.Float32BufferAttribute(l, 4));
      V.setIndex(m);
      const N = c.map((U) => U.map((Z) => new o.Vector3().fromArray(i, e.get(Z) * 3).applyMatrix4(f)));
      let Y = -1e9, _ = 1e9, k = 0;
      for (const U of N) for (const Z of U) {
        Y = Math.max(Y, Z.y);
        _ = Math.min(_, Z.y);
        k = Math.max(k, Math.abs(Z.x));
      }
      const F = new o.Ray(), j = new o.Vector3();
      const J = (U, Z) => {
        F.origin.set(U, Z, 50);
        F.direction.set(0, 0, -1);
        let v = null;
        for (const [$, K, oe] of N) {
          if (F.intersectTriangle($, K, oe, false, j) && (v === null || j.z > v)) v = j.z;
        }
        return v;
      };
      const W = Y - _;
      let Q = Y;
      while (Q > _ && J(0, Q) === null) Q -= W * 0.01;
      const ee = (U) => {
        U.applyMatrix4(t);
        const Z = U.attributes.position.count;
        U.setAttribute("skinIndex", new o.Uint16BufferAttribute(new Array(Z * 4).fill(0).map((v, $) => $ % 4 ? 0 : S), 4));
        U.setAttribute("skinWeight", new o.Float32BufferAttribute(new Array(Z * 4).fill(0).map((v, $) => $ % 4 ? 0 : 1), 4));
        return U;
      };
      const se = Q - W * 0.42, he = k * 0.36, ne = new o.PlaneGeometry(1, 1, 8, 10), ae = ne.attributes.position;
      for (let U = 0; U < ae.count; U++) {
        const Z = ae.getX(U) + 0.5, v = ae.getY(U) + 0.5, $ = se + (Q - se) * v, K = (Z - 0.5) * 2 * he * v ** 0.9;
        const oe = J(K, Math.min($, Q - W * 5e-3)) ?? J(0, Q - W * 0.02) ?? 0;
        ae.setXYZ(U, K, $, oe + 0.025);
      }
      ne.computeVertexNormals();
      const ue = [], fe = (U) => J(0, U) ?? 0;
      for (let U = 0; U < 2; U++) {
        const Z = se - W * (0.09 + U * 0.17), v = new o.SphereGeometry(W * 0.055, 12, 8);
        v.scale(1, 1, 0.45);
        v.translate(0, Z, fe(Z) + 0.02);
        ue.push(v);
      }
      const re = Q - W * 0.27, le = (J(0, re) ?? J(0, Q - W * 0.03) ?? 0) + W * 0.09, te = W * 0.33;
      const de = [-1, 1].map((U) => {
        const Z = new o.ConeGeometry(te * 0.55, te, 12, 1);
        Z.rotateZ(U * Math.PI / 2);
        Z.scale(1, 1, 0.45);
        Z.translate(U * te * 0.55, re, le);
        return Z;
      });
      const ce = new o.SphereGeometry(te * 0.28, 12, 8);
      ce.scale(1, 1.1, 0.7);
      ce.translate(0, re, le + te * 0.05);
      const pe = [];
      R.traverse((U) => {
        if (U.isSkinnedMesh) pe.push(U);
      });
      const ie = 0.012;
      const be = (U) => {
        const Z = U.geometry.clone();
        for (const K of Object.keys(Z.attributes)) if (!["position", "normal", "skinIndex", "skinWeight"].includes(K)) Z.deleteAttribute(K);
        const v = Z.attributes.position, $ = Z.attributes.normal;
        for (let K = 0; K < v.count; K++) v.setXYZ(K, v.getX(K) + $.getX(K) * ie, v.getY(K) + $.getY(K) * ie, v.getZ(K) + $.getZ(K) * ie);
        if (U.skeleton.bones.some((K, oe) => K !== T.bones[oe])) throw new Error("tenue : " + U.name + " n'a pas le squelette du haut");
        return Z;
      };
      const me = pe.slice(0, -1).map((U) => [U === P ? "chemise" : "gants", be(U)]);
      return { gilet: [...me.map(([U, Z]) => [U, Z, C(U, q.blanc)]), ["gilet", V, C("gilet", q.gilet)], ["plastron", ee(ne), C("plastron", q.blanc)], ["boutons", ee(I(ue)), C("boutons", q.bouton)]], noeud: [["noeud", ee(I([...de, ce])), C("noeud", q.noeud, true)]] };
    };
    let B = null;
    const E = () => B ||= O();
    d.ARTICLES["joueur-2-2"] = { peau: true, brut: true, sexe: "M", modele: async () => (await E()).gilet };
    d.ARTICLES["joueur-2-3"] = { peau: true, brut: true, sexe: "M", modele: async () => (await E()).noeud };
  })();
})();
