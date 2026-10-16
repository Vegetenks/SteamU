(() => {
  const p = window.__pcvVisiteursFabrique.V;
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#5f6f3d", Z = "#4d5b31", N = "#6e7f48", z = "#2f3330", A = "#232624", G = "#3a3e39";
    const L = (e) => {
      e = e.index ? e.toNonIndexed() : e;
      e.computeVertexNormals();
      return e;
    };
    const x = [[70, 9, 7, -11], [68, 20, 19, -23], [63, 27, 27, -30.5], [56, 30.5, 31, -33.5], [46, 32, 33, -35], [34, 32, 34, -35], [24, 30.5, 33.5, -33], [14, 26.5, 32.5, -29], [6, 21, 30, -24], [0, 16, 26, -19]];
    const y = 3.4, E = (e) => {
      const c = Math.cos(e), s = Math.sin(e);
      return 1 / Math.pow(Math.abs(c) ** y + Math.abs(s) ** y, 1 / y);
    };
    const g = (e) => {
      for (let c = 0; c < x.length - 1; c++) {
        const [s] = x[c], [r] = x[c + 1];
        if (e <= s && e >= r) {
          const f = (s - e) / (s - r);
          return x[c].map((i, o) => i + (x[c + 1][o] - i) * f);
        }
      }
      return e > x[0][0] ? x[0] : x[x.length - 1];
    };
    const a = (e, c, s = 0, r = new t.Vector3()) => {
      const [, f, i, o] = g(c), m = E(e), M = Math.cos(e) >= 0 ? i : -o;
      let S = Math.sin(e) * f * m, U = Math.cos(e) * M * m;
      const P = 2.6 * O((c - 50) / 8) * Math.exp(-((S / 6) ** 4)) * (U > 0 ? 1 : O((U + 30) / 10));
      const q = new t.Vector3(S / (f * f), 0, U / (M * M)).normalize();
      if (c > 60) q.y = (c - 58) / 10;
      q.normalize();
      return r.set(S, c, U).addScaledVector(q, s + P);
    };
    const w = () => {
      const e = new t.Group();
      const c = 32, s = [70, 68, 66, 63, 60, 56, 51, 46, 40, 34, 29, 24, 19, 14, 10, 6, 3, 0];
      const r = L(C((V, k, X) => a(V * I, s[Math.round(k * (s.length - 1))], 0, X), c, s.length - 1, { fermeU: true, sens: -1 }));
      e.add(new t.Mesh(r, b("coque", R, { rugosite: 0.5 })));
      e.add(new t.Mesh(C((V, k, X) => {
        const D = V * I;
        X.set(Math.sin(D) * (19 - 2 * k), -1 - 4 * k, -1 + Math.cos(D) * (21 - 2 * k));
      }, 24, 2, { fermeU: true, sens: -1 }), b("cou", A)));
      const f = 1.15, i = (V) => 27 + 4.5 * Math.abs(V) ** 1.6 - 2.5 * Math.exp(-((V / 0.25) ** 2)), o = (V) => 50 - 4 * Math.abs(V) ** 3;
      const m = (V, k) => C((X, D, v) => {
        const j = (X - 0.5) * 2, K = j * (f + k * 0.03), ee = i(j) - k + (o(j) + k - (i(j) - k)) * D;
        a(K, ee, V + 1.4 * Math.sin(D * _) * (1 - 0.6 * j * j), v);
      }, 36, 10);
      const M = m(0.7, 2.4);
      e.add(new t.Mesh(M, b("biseau", G, { rugosite: 0.4 })));
      const S = p.toile(128, (V) => {
        const k = V.createLinearGradient(0, 0, 0, 128);
        k.addColorStop(0, "#7a4206");
        k.addColorStop(0.35, "#c9780f");
        k.addColorStop(0.65, "#f4b52c");
        k.addColorStop(0.88, "#ffe08a");
        k.addColorStop(1, "#d98a14");
        V.fillStyle = k;
        V.fillRect(0, 0, 128, 128);
        V.globalAlpha = 0.55;
        V.fillStyle = "#fff6d0";
        V.beginPath();
        V.moveTo(18, 128);
        V.lineTo(34, 128);
        V.lineTo(70, 0);
        V.lineTo(54, 0);
        V.fill();
        V.globalAlpha = 0.35;
        V.beginPath();
        V.moveTo(40, 128);
        V.lineTo(46, 128);
        V.lineTo(82, 0);
        V.lineTo(76, 0);
        V.fill();
        V.globalAlpha = 1;
      });
      const U = m(1.25, 0);
      e.add(new t.Mesh(U, b("visiere", "#ffffff", { map: S, rugosite: 0.15 })));
      const P = L(C((V, k, X) => {
        const D = (V - 0.5) * 2, v = D * 0.8, j = 25 - 24 * k;
        const K = 5 * (1 - Math.abs(D) ** 1.6) * (0.55 + 0.45 * Math.sin(Math.min(1, k * 1.1 + 0.1) * _)) + 1.6;
        a(v, j, K, X);
      }, 10, 6, { sens: -1 }));
      const q = L(C((V, k, X) => {
        const D = (V - 0.5) * 2, v = D * 0.86, j = 26 - 26 * k;
        const K = 5 * (1 - Math.abs(D) ** 1.6) * (0.55 + 0.45 * Math.sin(Math.min(1, k * 1.1 + 0.1) * _)) + 1;
        a(v, j, K, X);
      }, 10, 6, { sens: -1 }));
      e.add(new t.Mesh(P, b("menton", "#56663a", { rugosite: 0.5 })), new t.Mesh(q, b("menton-bord", z)));
      const W = L(p.plaque((V, k, X) => {
        const D = (V - 0.5) * 2, v = D * (f + 0.05);
        a(v, o(D) + 1.5 + 3.5 * k, 2.6 * (1 - k) + 0.4 + (Math.abs(D) < 0.1 ? -1.2 : 0), X);
      }, () => 2.2, 24, 3));
      e.add(new t.Mesh(W, b("sourcil", Z, { rugosite: 0.5 })));
      const H = (V, k, X, D, v = 0) => {
        const j = new t.BoxGeometry(X, D, 3);
        j.rotateY(v);
        const K = a(Math.asin(Math.max(-1, Math.min(1, V / 34))), k, 6.8);
        j.translate(K.x, K.y, K.z);
        return j;
      };
      e.add(new t.Mesh(F([H(-8.5, 15, 8, 2.6, -0.3), H(8.5, 15, 8, 2.6, 0.3), H(-7.5, 9.5, 6.5, 2.4, -0.25), H(7.5, 9.5, 6.5, 2.4, 0.25), H(0, 19.5, 3, 6, 0)].map(p.indexee)), b("events", A)));
      for (const V of [24, 15]) e.add(new t.Mesh(C((k, X, D) => {
        const v = _ + (k - 0.5) * 2.2;
        a(v, V + 1.6 * X, 0.35, D);
      }, 24, 1), b("rainure-nuque", z)));
      for (const V of [-1, 1]) {
        const k = new t.BoxGeometry(5, 11, 9);
        k.rotateY(V * 0.35);
        const X = a(V * 1.45, 25, 2);
        k.translate(X.x, X.y, X.z);
        e.add(new t.Mesh(L(k), b("filtre", z)));
        for (let D = 0; D < 3; D++) {
          const v = new t.BoxGeometry(5.6, 1.1, 7);
          v.rotateY(V * 0.35);
          v.translate(X.x + V * 0.2, X.y - 3 + D * 3, X.z);
          e.add(new t.Mesh(v, b("rainure", G)));
        }
      }
      return e;
    };
    const d = (e, c, s, r) => {
      if (r === "hands") return A;
      const f = Math.abs(e.x);
      if (r === "legs") {
        if (e.y < 1.05) return Z;
        if (e.y > 3 && e.y < 3.55) return z;
        if (e.y > 5.6 && e.y < 6.1) return z;
        if (e.y > 6.1) return Z;
        return R;
      }
      if (f > 1.6) {
        if (f > 5.2) return A;
        if (f > 3.4 && f < 3.75) return z;
        return f > 3.75 ? R : z;
      }
      if (e.y < 7.55) return z;
      if (Math.abs(e.y - 8.05) < 0.12 || Math.abs(e.y - 8.55) < 0.12) return z;
      if (e.y < 8.65 && f < 0.1) return z;
      return R;
    };
    const l = (e, c, s, r, f, i, o = 0, m = 0, M = 0) => {
      const S = new t.BoxGeometry(e, c, s, 1, 1, 1);
      S.rotateX(o);
      S.rotateY(m);
      S.rotateZ(M);
      S.translate(r, f, i);
      return S;
    };
    const u = (e, c, s, r, f, i, o = {}) => {
      const m = new t.BoxGeometry(e, c, s, 2, 2, 2), M = m.attributes.position, S = o.biseau ?? 0.22;
      for (let U = 0; U < M.count; U++) {
        const P = M.getX(U) / (e / 2), q = M.getY(U) / (c / 2), W = M.getZ(U) / (s / 2), H = (Math.abs(P) > 0.99) + (Math.abs(q) > 0.99) + (Math.abs(W) > 0.99);
        if (H >= 2) {
          const V = 1 - S * (H - 1) * 0.5;
          M.setXYZ(U, M.getX(U) * (Math.abs(P) > 0.99 ? V : 1), M.getY(U) * (Math.abs(q) > 0.99 ? V : 1), M.getZ(U) * (Math.abs(W) > 0.99 ? V : 1));
        }
        if (o.bombe && W > 0.99) M.setZ(U, M.getZ(U) + o.bombe * (1 - P * P * 0.7) * (1 - q * q * 0.5));
      }
      m.rotateX(o.rx || 0);
      m.rotateY(o.ry || 0);
      m.rotateZ(o.rz || 0);
      m.translate(r, f, i);
      return L(m);
    };
    const n = async () => {
      const e = [], c = b("plaque", R, { rugosite: 0.45 }), s = b("plaque2", Z, { rugosite: 0.45 }), r = b("joint", z), f = b("plaque3", N, { rugosite: 0.45 });
      const i = async (o, m, M, S) => e.push([o, await p.lier(m, M), S]);
      await i("plastron", u(4, 1.85, 2.75, 0, 9.75, 0.3, { bombe: 0.3 }), "chest", c);
      await i("col", u(2, 0.6, 1.8, 0, 10.8, -0.05, { biseau: 0.3 }), "chest", s);
      await i("boucle", u(0.8, 0.38, 0.3, 0, 7.36, 1.72), "hip", s);
      for (const o of [-1, 1]) {
        const m = o > 0 ? "arm_l1" : "arm_r1";
        await i("epaule" + o, u(1.8, 1.2, 2, o * 2.15, 10.55, 0, { rz: -o * 0.22, bombe: 0.2 }), m, c);
        await i("epaule2-" + o, u(1.4, 0.6, 1.8, o * 2.6, 9.85, 0, { rz: -o * 0.3 }), m, s);
        await i("avbras" + o, u(1.9, 0.95, 1.05, o * 4.75, 10.32, 0.02, { bombe: 0.1 }), o > 0 ? "arm_l2" : "arm_r2", c);
        await i("bras" + o, u(1.4, 0.8, 0.9, o * 2.9, 10.3, 0), m, s);
        const M = o * 0.82, S = o > 0 ? "foot_l1" : "foot_r1", U = o > 0 ? "foot_l2" : "foot_r2", P = o > 0 ? "ankle_l" : "ankle_r";
        await i("cuisse" + o, u(1.25, 1.75, 1.45, M * 1.04, 4.75, 0.15, { bombe: 0.12 }), S, c);
        await i("tibia" + o, u(1.12, 1.55, 1.3, M, 2.1, 0.18, { bombe: 0.1 }), U, c);
        await i("botte" + o, u(1.15, 0.62, 1.85, M, 0.33, 0.35, { biseau: 0.3 }), P, s);
        await i("genou" + o, u(0.8, 0.62, 0.55, o * 0.82, 3.27, 0.7, { biseau: 0.35 }), o > 0 ? "foot_l2" : "foot_r2", s);
      }
      return e;
    };
    const h = async () => {
      const e = b("fusil", "#2c302d", { rugosite: 0.5 }), c = b("fusil2", "#474c47", { rugosite: 0.5 }), s = b("compteur", "#49c8ff"), r = [];
      const f = new t.Vector3(-6.2, 10.3, 0);
      const i = (M, S, U, P, q, W, H, V) => {
        const k = u(M * 1.3, S * 1.3, U * 1.3, P * 1.3, q * 1.3, W * 1.3, V || { biseau: 0.2 });
        k.rotateX(0.64);
        k.rotateY(0);
        k.translate(f.x, f.y, f.z);
        r.push([k, H]);
      };
      i(0.85, 1.15, 3.6, 0, 0.55, 1.3, e);
      i(0.7, 0.75, 1.6, 0, 0.45, 3.75, c);
      i(0.3, 0.3, 0.8, 0, 0.5, 4.9, e, { biseau: 0.1 });
      i(0.6, 1.1, 0.55, 0, -0.5, 1.9, e, { rx: 0.2 });
      i(0.7, 1, 1.5, 0, 0.25, -1.05, c);
      i(0.45, 0.8, 0.45, 0, -0.25, 0.2, e, { rx: -0.3 });
      i(0.5, 0.3, 0.3, 0, 1.2, 0.9, s, { biseau: 0 });
      const o = [];
      let m = 0;
      for (const [M, S] of r) o.push(["fusil" + m++, await p.lier(M, "wrist_r"), S]);
      return o;
    };
    p.ARTICLES["x24a77859"] = { nom: "casque", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: w };
    p.ARTICLES["117-2"] = { nom: "armure", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await p.combinaison(["body", "hands", "legs"], d, { sub: 1, coupes: { body: [(e) => e.x - 1.6, (e) => -e.x - 1.6, (e) => e.x - 3.4, (e) => -e.x - 3.4, (e) => e.x - 3.75, (e) => -e.x - 3.75, (e) => e.x - 5.2, (e) => -e.x - 5.2, (e) => e.y - 7.55, (e) => e.y - 7.93, (e) => e.y - 8.17, (e) => e.y - 8.43, (e) => e.y - 8.67, (e) => e.x - 0.1, (e) => -e.x - 0.1], legs: [(e) => e.y - 1.05, (e) => e.y - 3, (e) => e.y - 3.55, (e) => e.y - 5.6, (e) => e.y - 6.1] } }), ...await n(), ...await h()] };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#1f5fd8", Z = "#174bb0", N = "#f1c9a0", z = "#f4f4f2", A = "#d42a24", G = "#a81d1a", L = "#e8b923";
    const x = new t.Vector3(0, 35, -3), y = new t.Vector3(30.5, 30.5, 32.5);
    const E = (n) => {
      const h = Math.abs(Math.atan2(Math.sin(n), Math.cos(n)));
      if (h < 0.7) return 47 - 4.5 * Math.exp(-((h / 0.16) ** 2)) + 3 * O(h / 0.7);
      return 50 - 38 * O((h - 0.7) / 1.4);
    };
    const g = (n, h, e, c) => {
      const s = E(n), r = x.y + y.y, f = r + (s - r) * h, i = (f - x.y) / y.y;
      const o = f >= x.y ? Math.sqrt(Math.max(0, 1 - i * i)) : 1 - 0.1 * O((x.y - f) / 25);
      return c.set(Math.sin(n) * (y.x * o + e), f, x.z + Math.cos(n) * (y.z * o + e));
    };
    const a = (n, h, e, c, s = 0.25, r = 18, f = 10) => {
      h = h.clone().normalize();
      const i = new t.Vector3(0, 1, 0), o = new t.Vector3().crossVectors(h, i).normalize(), m = new t.Vector3().crossVectors(o, h).normalize();
      return C((M, S, U) => {
        const P = M * I, q = c * (1 - S) ** 1.1 * (1 + 0.05 * Math.sin(P * 2)), W = n.clone().addScaledVector(h, e * S).addScaledVector(m, s * e * S * S);
        U.copy(W).addScaledVector(o, Math.cos(P) * q).addScaledVector(m, Math.sin(P) * q * 0.8);
      }, r, f, { fermeU: true });
    };
    const w = () => {
      const n = new t.Group(), h = b("bleu", R, { rugosite: 0.5 });
      const e = C((s, r, f) => g(s * I, r, 0, f), 96, 30, { fermeU: true, sens: -1 });
      const c = [];
      c.push(a(new t.Vector3(0, 52, -14), new t.Vector3(0, 0.45, -1), 46, 21, 0.22));
      c.push(a(new t.Vector3(0, 35, -22), new t.Vector3(0, 0.02, -1), 52, 23, 0.24));
      c.push(a(new t.Vector3(0, 18, -18), new t.Vector3(0, -0.4, -1), 44, 19, 0.3));
      for (const s of [-1, 1]) {
        c.push(a(new t.Vector3(s * 15, 46, -14), new t.Vector3(s * 0.75, 0.22, -1), 40, 15, 0.15));
        c.push(a(new t.Vector3(s * 17, 28, -14), new t.Vector3(s * 0.8, -0.25, -1), 36, 14, 0.2));
      }
      n.add(new t.Mesh(F([e, ...c]), h));
      for (const s of [-1, 1]) {
        const r = new t.Vector3(s * 19, 57, -1), f = new t.Vector3(s * 0.6, 1, -0.1);
        const i = a(r, f, 20, 9, -0.05, 14, 6);
        i.scale(1, 1, 0.55);
        i.translate(0, 0, r.z * 0.45);
        n.add(new t.Mesh(i, h));
        const o = a(r.clone().add(new t.Vector3(0, 1.5, 3.2)), f, 14, 5.6, -0.05, 12, 5);
        o.scale(1, 1, 0.4);
        o.translate(0, 0, r.z * 0.6 + 2.4);
        n.add(new t.Mesh(o, b("oreille", N)));
      }
      return n;
    };
    const d = (n, h, e, c) => {
      if (c === "hands") return z;
      if (c === "legs") return R;
      if ((e.startsWith("arm") || e.startsWith("wrist")) && Math.abs(n.x) > 1.55) return Math.abs(n.x) > 5.05 ? z : N;
      return R;
    };
    const l = async () => {
      const n = [];
      for (const e of [-1, 1]) {
        const c = e > 0 ? "ankle_l" : "ankle_r", s = e * 0.8;
        const r = new t.SphereGeometry(1, 24, 14);
        r.scale(1.05, 0.75, 1.95);
        r.translate(s * 1.1, 0.62, 0.85);
        const f = new t.CylinderGeometry(1, 1, 0.22, 24);
        f.scale(1.08, 1.2, 1.98);
        f.translate(s * 1.1, 0.1, 0.85);
        const i = new t.CylinderGeometry(1, 1, 0.34, 24, 1, true);
        i.scale(1.08, 1.3, 1.1);
        i.translate(s * 1.1, 0.85, 0.45);
        const o = new t.BoxGeometry(0.3, 0.26, 0.1);
        o.scale(1.4, 1.4, 1);
        o.translate(s * 1.1 + e * 1.12, 0.85, 0.6);
        const m = new t.CylinderGeometry(0.55, 0.62, 0.5, 18);
        m.translate(s, 1.35, 0);
        n.push(["pied" + e, await p.lier(r, c), b("pied", A, { rugosite: 0.45 })], ["semelle" + e, await p.lier(f, c), b("semelle", z)], ["bande" + e, await p.lier(i, c), b("bande", z, { side: t.DoubleSide })], ["boucle" + e, await p.lier(o, c), b("boucle", L, { rugosite: 0.3 })], ["chaussette" + e, await p.lier(m, c), b("chaussette", z)]);
      }
      for (const e of [-1, 1]) {
        const c = new t.CylinderGeometry(0.42, 0.5, 0.45, 18);
        c.rotateZ(_ / 2);
        c.translate(e * 5.15, 10.3, 0);
        n.push(["manchette" + e, await p.lier(c, e > 0 ? "wrist_l" : "wrist_r"), b("manchette", z)]);
      }
      const h = F([a(new t.Vector3(-0.45, 10, -0.6), new t.Vector3(-0.2, -0.4, -1), 1.3, 0.45, 0.1), a(new t.Vector3(0.45, 10, -0.6), new t.Vector3(0.2, -0.4, -1), 1.3, 0.45, 0.1)]);
      n.push(["dos", await p.lier(h, "chest"), b("dos", R)]);
      return n;
    };
    const u = async () => {
      const n = await p.corps(), h = n.peaux.body, e = h.geometry.attributes.position, c = h.geometry.index.array, s = new t.Ray(), r = [], f = new t.Vector3();
      for (let m = 0; m < c.length; m += 3) r.push([0, 1, 2].map((M) => new t.Vector3().fromBufferAttribute(e, c[m + M])));
      const i = (m, M) => {
        s.origin.set(m, M, 9);
        s.direction.set(0, 0, -1);
        let S = null;
        for (const [U, P, q] of r) if (s.intersectTriangle(U, P, q, false, f) && (S === null || f.z > S)) S = f.z;
        return S;
      };
      const o = C((m, M, S) => {
        const U = m * I, P = M;
        const q = Math.sin(U) * 1 * P, W = 8.55 + Math.cos(U) * 1.3 * P;
        S.set(q, W, (i(q, W) ?? 0.9) + 0.075 + 0.03 * (1 - P));
      }, 32, 6, { fermeU: true, sens: -1 });
      o.computeVertexNormals();
      return [["ventre", await p.lier(o, "chest"), b("ventre", N, { side: t.DoubleSide })]];
    };
    p.ARTICLES["herisson-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => p.combinaison(["legs"], d, { sub: 1 }) };
    p.ARTICLES["x06fbb67d"] = { nom: "piquants", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: w };
    p.ARTICLES["herisson-2"] = { nom: "corps", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await p.combinaison(["body", "hands"], d, { sub: 1, gonfle: 0.03, coupes: { body: [(n) => n.x - 5.05, (n) => -n.x - 5.05, (n) => n.x - 1.55, (n) => -n.x - 1.55] } }), ...await l(), ...await u()] };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#ebe7de", Z = "#7f7a72", N = "#9e2027", z = "#5e3d26", A = "#3f2b1e", G = "#b9bec4", L = "#55504b";
    const x = new t.Vector3(0, 36, -2.5), y = new t.Vector3(31.6, 31, 34.5);
    const E = (e) => {
      const c = Math.abs(Math.atan2(Math.sin(e), Math.cos(e)));
      if (c <= 0.5) return 45.5 + 5 * O(c / 0.5) - 2.5 * Math.exp(-((c / 0.12) ** 2));
      if (c <= 1.2) return 50.5 - 44 * O((c - 0.5) / 0.7);
      return 6.5 - 6 * O((c - 1.2) / 1.1);
    };
    const g = (e, c, s, r) => {
      const f = E(e), i = x.y + y.y, o = i + (f - i) * c;
      const m = (o - x.y) / y.y, M = (1 - Math.cos(e)) / 2;
      const S = o >= x.y ? Math.sqrt(Math.max(0, 1 - m * m)) : 1 - O((x.y - o) / 34) * (0.06 + 0.2 * M * M);
      const U = 1 + O((x.y + 18 - o) / 30) * (0.018 * Math.sin(6 * e + 0.7) + 0.012 * Math.sin(11 * e + 2.1)) + 0.02 * Math.exp(-(((Math.abs(e) - _) / 0.25) ** 2)) * O((x.y - o) / 20);
      let P = Math.sin(e) * (y.x * S * U + s), q = x.z + Math.cos(e) * (y.z * S * U + s);
      const W = Math.exp(-((Math.atan2(Math.sin(e), Math.cos(e)) / 0.3) ** 2)) * O((o - 38) / 10) * (1 - O((o - 58) / 9));
      q += 7 * W;
      const H = o - 3 * W;
      return r.set(P, H, q);
    };
    const a = () => {
      const e = new t.Group(), c = 1.8;
      const s = C((i, o, m) => g(i * I, o, 0, m), 120, 36, { fermeU: true, sens: -1 });
      const r = C((i, o, m) => g(i * I, o, -c, m), 80, 24, { fermeU: true });
      const f = C((i, o, m) => g(i * I, 1, -c * o, m), 120, 1, { fermeU: true, sens: -1 });
      e.add(new t.Mesh(F([s, f]), b("capuche", R)), new t.Mesh(r, b("capuche-dedans", Z)));
      return e;
    };
    const w = (e, c, s, r) => {
      if (r === "hands") return A;
      if (r === "legs") return e.y < 2.4 ? z : L;
      const f = Math.abs(e.x);
      if (s.startsWith("arm") || s.startsWith("wrist")) {
        if (f > 4.3) return z;
        return R;
      }
      if (e.y < 7.75 && e.y > 7.5) return z;
      if (e.y < 8.7) return N;
      return R;
    };
    const d = async () => p.combinaison(["body", "hands", "legs"], w, { sub: 1, coupes: { body: [(e) => e.y - 7.5, (e) => e.y - 7.75, (e) => e.y - 8.7, (e) => e.x - 4.3, (e) => -e.x - 4.3], legs: [(e) => e.y - 2.4] } });
    const l = async () => {
      const e = (r, f, i, o) => {
        const m = _ * (0.28 + 1.72 * r) - _, M = f;
        const S = (0.18 + 1.64 * r) * _;
        const U = 1.72 + 0.62 * M - i, P = 1.45 + 0.68 * M - i, q = 7.6 - 3.7 * f - (Math.cos(S) < 0 ? 0.6 * f * -Math.cos(S) : 0);
        return o.set(Math.sin(S) * U, q, 0.25 + Math.cos(S) * P);
      };
      const c = C((r, f, i) => e(r, f, 0, i), 90, 10, { sens: -1 }), s = C((r, f, i) => e(r, f, 0.07, i), 90, 10);
      return [["pans", await p.lier(c, "hip"), b("pans", R, { side: t.DoubleSide })], ["doublure", await p.lier(s, "hip"), b("doublure", N, { side: t.DoubleSide })]];
    };
    const u = async () => {
      const e = C((s, r, f) => {
        const i = s * I, o = r * I;
        const m = 1.76 + 0.07 * Math.cos(o), M = 1.5 + 0.07 * Math.cos(o);
        f.set(Math.sin(i) * m, 7.63 + 0.13 * Math.sin(o), 0.22 + Math.cos(i) * M);
      }, 64, 8, { fermeU: true });
      const c = new t.CylinderGeometry(0.26, 0.26, 0.08, 16);
      c.rotateX(_ / 2);
      c.scale(1, 1.25, 1);
      c.translate(0, 7.63, 1.82);
      return [["ceinture", await p.lier(e, "hip"), b("ceinture", A)], ["boucle", await p.lier(c, "hip"), b("boucle", G, { rugosite: 0.4 })]];
    };
    const n = async () => {
      const e = (s, r, f, i) => {
        const o = (0.22 + 0.78 * s) * _, m = 1.2 + 0.75 * r + f;
        return i.set(0.55 + Math.sin(o) * m * 0.95, 10.4 - 4.6 * r + 0.35 * Math.sin(s * _) * r * r, -0.05 + Math.cos(o) * m * (0.95 + 0.25 * r));
      };
      const c = F([C((s, r, f) => e(s, r, 0, f), 24, 12, { sens: -1 }), C((s, r, f) => e(s, r, -0.05, f), 24, 12)]);
      return [["cape", await p.lier(c, "chest"), b("cape", N, { side: t.DoubleSide })]];
    };
    const h = async () => {
      const e = new t.BoxGeometry(0.9, 0.07, 0.16);
      e.translate(5.5, 10.02, 0);
      return [["lame", await p.lier(e, "arm_l2"), b("lame", G, { rugosite: 0.35 })]];
    };
    p.ARTICLES["x3d946d9f"] = { nom: "capuche", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: a };
    p.ARTICLES["firenze-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await d(), ...await l(), ...await u(), ...await n(), ...await h()] };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#1f55d6", Z = "#3db1f2", N = "#68d6f5", z = "#f2c218";
    const A = new t.Vector3(0, 35, -2.5), G = new t.Vector3(30.5, 31, 32.5);
    const L = (a) => {
      const w = Math.abs(Math.atan2(Math.sin(a), Math.cos(a)));
      if (w < 0.55) return 46 + 3.5 * O(w / 0.55) - 5.5 * Math.max(0, 1 - w / 0.2);
      if (w < 1.25) return 49.5 - 40 * O((w - 0.55) / 0.7);
      return 9.5 - 3 * O((w - 1.25) / 1.5);
    };
    const x = (a, w, d, l) => {
      const u = L(a), n = A.y + G.y, h = n + (u - n) * w, e = (h - A.y) / G.y;
      const c = h >= A.y ? Math.sqrt(Math.max(0, 1 - e * e)) : 1 - 0.07 * O((A.y - h) / 25);
      return l.set(Math.sin(a) * (G.x * c + d), h, A.z + Math.cos(a) * (G.z * c + d));
    };
    const y = () => {
      const a = new t.Group(), w = 1.6;
      a.add(new t.Mesh(F([C((u, n, h) => x(u * I, n, 0, h), 96, 32, { fermeU: true, sens: -1 }), C((u, n, h) => x(u * I, 1, -w * n, h), 96, 1, { fermeU: true, sens: -1 })]), b("casque", R, { rugosite: 0.35 })));
      a.add(new t.Mesh(C((u, n, h) => x(u * I, n, -w, h), 64, 20, { fermeU: true }), b("dedans", "#173f9e")));
      const d = p.plaque((u, n, h) => {
        const e = (u - 0.5) * 0.22, c = 0.02 + 0.36 * n, s = new t.Vector3();
        x(e, c, 1.1, s);
        h.copy(s);
      }, () => 1.6, 8, 20);
      const l = p.plaque((u, n, h) => {
        const e = (u - 0.5) * 0.42, c = 51 + 8.5 * n, s = new t.Vector3(), r = (A.y + G.y - c) / (A.y + G.y - L(e));
        x(e, Math.max(0, r), 1.2, s);
        h.copy(s);
      }, () => 1.8, 10, 6);
      a.add(new t.Mesh(F([d, l]), b("crete", N, { rugosite: 0.35 })));
      for (const u of [-1, 1]) {
        const n = new t.CylinderGeometry(9.5, 10, 4.5, 28);
        n.rotateZ(_ / 2);
        n.translate(u * (G.x + 1.2), 26, A.z - 1);
        a.add(new t.Mesh(n, b("oreille", N, { rugosite: 0.35 })));
        const h = new t.TorusGeometry(9.8, 1.3, 8, 28);
        h.rotateY(_ / 2);
        h.translate(u * (G.x + 3.5), 26, A.z - 1);
        a.add(new t.Mesh(h, b("oreille-bord", R)));
      }
      return a;
    };
    const E = (a, w, d, l) => {
      if (l === "hands") return R;
      if (l === "legs") return a.y < 2.6 ? R : Z;
      const u = Math.abs(a.x);
      if (u > 3.9) return R;
      if (a.y > 10.55 && u < 1.05) return R;
      return Z;
    };
    const g = async () => {
      const a = [], w = b("canon", R, { rugosite: 0.35 });
      const d = C((h, e, c) => {
        const s = h * I, r = -4.6 - 3.2 * e, f = 0.95 + 0.32 * Math.sin(Math.min(1, e * 1.25) * _ * 0.75) - 0.4 * O((e - 0.82) / 0.18);
        c.set(r, 10.3 + Math.sin(s) * f, Math.cos(s) * f * 1.05);
      }, 28, 16, { fermeU: true });
      const l = new t.CylinderGeometry(0.55, 0.62, 0.5, 20);
      l.rotateZ(_ / 2);
      l.translate(-8, 10.3, 0);
      const u = new t.CylinderGeometry(0.34, 0.34, 0.52, 16);
      u.rotateZ(_ / 2);
      u.translate(-8.05, 10.3, 0);
      const n = new t.BoxGeometry(1.4, 0.18, 0.14);
      n.translate(-6.4, 10.3, 1.33);
      a.push(["canon", await p.lier(d, "wrist_r"), w], ["bout", await p.lier(l, "wrist_r"), b("bout", "#1a3c90")], ["trou", await p.lier(u, "wrist_r"), b("trou", "#0b1022")], ["voyants", await p.lier(n, "wrist_r"), b("voyants", z, { rugosite: 0.3 })]);
      return a;
    };
    p.ARTICLES["xa77d997e"] = { nom: "casque", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: y };
    p.ARTICLES["robot-bleu-2"] = { nom: "combinaison", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await p.combinaison(["body", "hands", "legs"], E, { sub: 1, coupes: { body: [(a) => a.x - 3.9, (a) => -a.x - 3.9, (a) => a.y - 10.55, (a) => a.x - 1.05, (a) => -a.x - 1.05], legs: [(a) => a.y - 2.6] } }), ...await g()] };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#2f9a3a", Z = "#23772c", N = "#efe6cf", z = "#7a4a22", A = "#553218", G = "#e2b12c", L = "#ffd2ac";
    const x = () => {
      const a = new t.Group(), w = b("bonnet", R, { rugosite: 0.85, side: t.DoubleSide });
      const d = new t.Vector3(0, 40, -2), l = new t.Vector3(31.5, 26, 33.5);
      const u = (i) => {
        const o = Math.abs(Math.atan2(Math.sin(i), Math.cos(i)));
        return 47 + 1.5 * O(o / 1) - 14 * O((o - 1.1) / 1.6);
      };
      const n = d.y + l.y;
      const h = (i, o, m, M) => {
        const S = u(i), U = n + (S - n) * o, P = (U - d.y) / l.y, q = U >= d.y ? Math.sqrt(Math.max(0, 1 - P * P)) : 1;
        return M.set(Math.sin(i) * (l.x * q + m), U, d.z + Math.cos(i) * (l.z * q + m));
      };
      const e = C((i, o, m) => h(i * I, o, 0, m), 80, 24, { fermeU: true, sens: -1 });
      const c = new t.Vector3(0, 52, -14), s = new t.Vector3(0, 60, -52), r = new t.Vector3(0, 12, -70);
      const f = C((i, o, m) => {
        const M = i * I, S = 1 - o, U = new t.Vector3().addScaledVector(c, S * S).addScaledVector(s, 2 * S * o).addScaledVector(r, o * o);
        const P = new t.Vector3().addScaledVector(s.clone().sub(c), 2 * S).addScaledVector(r.clone().sub(s), 2 * o).normalize(), q = new t.Vector3(1, 0, 0), W = new t.Vector3().crossVectors(P, q).normalize();
        const H = 23 * (1 - o) ** 1.2 + 0.3;
        m.copy(U).addScaledVector(q, Math.cos(M) * H * 1.05).addScaledVector(W, Math.sin(M) * H * 0.9);
      }, 40, 24, { fermeU: true });
      a.add(new t.Mesh(F([e, f]), w));
      return a;
    };
    const y = () => {
      const a = new t.Group();
      for (const w of [-1, 1]) {
        const d = C((l, u, n) => {
          const h = l * I, e = 4.2 * (1 - u) ** 0.9;
          n.set(w * (26 + 13 * u), 27 + 7 * u + Math.sin(h) * e * 0.5, -2 - 2 * u + Math.cos(h) * e);
        }, 16, 8, { fermeU: true, sens: w });
        a.add(new t.Mesh(d, b("oreille", L)));
      }
      return a;
    };
    const E = (a, w, d, l) => {
      if (l === "hands") return z;
      if (l === "legs") return a.y < 2.5 ? A : N;
      const u = Math.abs(a.x);
      if (u > 4.4) return z;
      if (u > 2.6) return N;
      if (a.y < 7.95 && a.y > 7.45) return z;
      return R;
    };
    const g = async () => {
      const a = [];
      const w = C((s, r, f) => {
        const i = s * I, o = 1.75 + 0.5 * r, m = 1.45 + 0.52 * r;
        f.set(Math.sin(i) * o, 7.55 - 2.3 * r, 0.25 + Math.cos(i) * m);
      }, 48, 6, { fermeU: true, sens: -1 });
      a.push(["pans", await p.lier(w, "hip"), b("pans", R, { side: t.DoubleSide })]);
      const d = C((s, r, f) => {
        const i = s * I, o = r * I;
        f.set(Math.sin(i) * (1.8 + 0.06 * Math.cos(o)), 7.7 + 0.15 * Math.sin(o), 0.25 + Math.cos(i) * (1.5 + 0.06 * Math.cos(o)));
      }, 48, 6, { fermeU: true });
      const l = new t.BoxGeometry(0.6, 0.45, 0.12);
      l.translate(0, 7.7, 1.85);
      a.push(["ceinture", await p.lier(d, "hip"), b("ceinture", A)], ["boucle", await p.lier(l, "hip"), b("boucle", G, { rugosite: 0.3 })]);
      const u = p.toile(128, (s) => {
        s.fillStyle = "#c9ced6";
        s.fillRect(0, 0, 128, 128);
        s.fillStyle = "#2148a8";
        s.beginPath();
        s.moveTo(10, 10);
        s.lineTo(118, 10);
        s.lineTo(118, 70);
        s.quadraticCurveTo(110, 108, 64, 122);
        s.quadraticCurveTo(18, 108, 10, 70);
        s.closePath();
        s.fill();
        s.fillStyle = "#c32a2a";
        s.beginPath();
        s.moveTo(64, 58);
        s.lineTo(30, 46);
        s.lineTo(40, 64);
        s.lineTo(52, 66);
        s.lineTo(64, 100);
        s.lineTo(76, 66);
        s.lineTo(88, 64);
        s.lineTo(98, 46);
        s.closePath();
        s.fill();
        s.fillStyle = "#e9c03a";
        s.beginPath();
        s.moveTo(64, 20);
        s.lineTo(80, 44);
        s.lineTo(48, 44);
        s.closePath();
        s.fill();
      });
      const n = new t.Shape();
      n.moveTo(-1.3, 1.55);
      n.lineTo(1.3, 1.55);
      n.lineTo(1.3, 0.2);
      n.quadraticCurveTo(1.15, -1.1, 0, -1.6);
      n.quadraticCurveTo(-1.15, -1.1, -1.3, 0.2);
      n.closePath();
      const h = new t.ExtrudeGeometry(n, { depth: 0.18, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 2 });
      const e = h.attributes.uv, c = h.attributes.position;
      for (let s = 0; s < c.count; s++) e.setXY(s, (c.getX(s) + 1.3) / 2.6, (c.getY(s) + 1.6) / 3.15);
      h.rotateY(_);
      h.rotateZ(0.25);
      h.translate(0.1, 9.1, -1.25);
      a.push(["bouclier", await p.lier(h, "chest"), b("bouclier", "#ffffff", { map: u, rugosite: 0.4 })]);
      return a;
    };
    p.ARTICLES["x92ab6441"] = { nom: "bonnet", categorie: "chapeau", attache: "tete", cache_cheveux: "haut", modele: x };
    p.ARTICLES["xcd51bf7b"] = { nom: "oreilles", categorie: "visage", attache: "tete", modele: y };
    p.ARTICLES["heros-vert-3"] = { nom: "tunique", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await p.combinaison(["body", "hands", "legs"], E, { sub: 1, coupes: { body: [(a) => a.x - 4.4, (a) => -a.x - 4.4, (a) => a.x - 2.6, (a) => -a.x - 2.6, (a) => a.y - 7.45, (a) => a.y - 7.95], legs: [(a) => a.y - 2.5] } }), ...await g()] };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#20242c", Z = "#4a5361", N = "#39414c", z = "#1b1d21", A = "#2a2e35";
    const G = () => {
      const y = new t.Group(), E = b("bandeau", R, { rugosite: 0.95, side: t.DoubleSide });
      const g = -3, a = [35.6, 35.4, 34.6, 33.2, 31.4, 31.4, 30.2, 29.8, 30.2, 31.2, 32.3, 32.6, 32.7];
      const w = (r, f) => {
        const i = Math.abs(Math.atan2(Math.sin(r), Math.cos(r))) / _ * 12, o = Math.min(11, Math.floor(i));
        return a[o] + (a[o + 1] - a[o]) * (i - o) - 0.35 - (f - 47) * 0.22;
      };
      const d = (r) => 46.5 - 7 * (1 - Math.cos(r)) / 2;
      const l = 6.2, u = C((r, f, i) => {
        const o = r * I, m = d(o) + l * f, M = 1 + 0.012 * Math.sin(o * 9 + f * 3) * Math.sin(f * _);
        const S = w(o, m) * M + 0.5 * Math.sin(f * _);
        i.set(Math.sin(o) * S, m, g + Math.cos(o) * S);
      }, 96, 6, { fermeU: true, sens: -1 });
      const n = d(_) + l / 2, h = g - w(_, n) - 1.5;
      const e = new t.SphereGeometry(3, 14, 10);
      e.scale(1.1, 1, 0.8);
      e.translate(0, n, h);
      const c = (r) => {
        const f = new t.TorusGeometry(3.2, 1.5, 8, 16);
        f.scale(1, 0.7, 0.5);
        f.rotateZ(r * 0.25);
        f.translate(r * 4.2, n + 0.5, h - 0.2);
        return f;
      };
      const s = (r, f, i, o) => C((m, M, S) => {
        const U = 8.5 * (1 - 0.6 * M ** 1.5) + 0.6, P = (m - 0.5) * U;
        const q = r * (1 + 10 * M + 3 * Math.sin(M * 4 + o) * M), W = n - i * M * M + 2.5 * Math.sin(M * 6 + o), H = h + 1 - f * M;
        const V = 0.6 * Math.sin(M * 5 + o);
        S.set(q + P * Math.sin(V) * 0.6, W + P * Math.cos(V), H + P * Math.sin(V) * 0.4);
      }, 3, 20);
      y.add(new t.Mesh(F([u, e, s(1, 30, 36, 0), s(-1, 25, 30, 1.7)].map(p.indexee)), E));
      return y;
    };
    const L = (y, E, g, a) => {
      if (a === "hands") return z;
      if (a === "legs") {
        if (y.y < 1.7) return z;
        return Z;
      }
      const w = Math.abs(y.x);
      if (w > 5) return z;
      if (y.y < 7.55 && y.y > 7.1) return A;
      if (w > 0.55 && w < 0.85 && y.y > 7.5) return A;
      if (w > 1.6) return N;
      return Z;
    };
    const x = async () => {
      const y = [];
      const E = C((u, n, h) => {
        const e = u * I;
        h.set(Math.sin(e) * (0.75 + 0.1 * n), 10.5 + 0.75 * n, Math.cos(e) * (0.68 + 0.1 * n));
      }, 32, 4, { fermeU: true, sens: -1 });
      y.push(["col", await p.lier(E, "chest"), b("col", Z, { side: t.DoubleSide })]);
      const g = b("sangle", A), a = b("poche", "#2b2f36");
      const w = C((u, n, h) => {
        const e = u * I;
        h.set(Math.sin(e) * 1.42, 9.35 + 0.32 * n, 0.12 + Math.cos(e) * 1.18);
      }, 40, 1, { fermeU: true, sens: -1 });
      y.push(["sangle-poitrine", await p.lier(w, "chest"), b("sangle2", A, { side: t.DoubleSide })]);
      const d = new t.BoxGeometry(0.42, 0.42, 0.12);
      d.translate(0, 9.51, 1.32);
      y.push(["boucle-poitrine", await p.lier(d, "chest"), b("boucle", "#7d838c", { rugosite: 0.4 })]);
      for (const [u, n, h] of [[-1.15, 1.25, 0.5], [-0.45, 1.5, 0.1], [0.45, 1.5, -0.1], [1.15, 1.25, -0.5], [-1.65, 0.2, 1.5], [1.65, 0.2, -1.5]]) {
        const e = new t.BoxGeometry(0.55, 0.62, 0.38);
        e.rotateY(h);
        e.translate(u, 7.1, n);
        y.push(["poche" + u + n, await p.lier(e, "hip"), a]);
      }
      const l = new t.BoxGeometry(0.6, 1.15, 0.42);
      l.translate(-1.5, 5.15, 0.35);
      y.push(["etui", await p.lier(l, "foot_r1"), b("etui", z)]);
      for (const u of [-1, 1]) {
        const n = new t.SphereGeometry(0.56, 14, 10);
        n.scale(1, 1.15, 0.62);
        n.translate(u * 0.8, 3.2, 0.58);
        y.push(["genou" + u, await p.lier(n, u > 0 ? "foot_l2" : "foot_r2"), b("genou", z)]);
        const h = new t.SphereGeometry(0.42, 12, 8);
        h.scale(1.1, 0.9, 0.8);
        h.translate(u * 3.6, 10.3, -0.38);
        y.push(["coude" + u, await p.lier(h, u > 0 ? "arm_l2" : "arm_r2"), b("coude", z)]);
      }
      return y;
    };
    p.ARTICLES["xdf786c54"] = { nom: "bandeau", categorie: "chapeau", attache: "tete", cache_cheveux: "aucun", modele: G };
    p.ARTICLES["carton-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await p.combinaison(["body", "hands", "legs"], L, { sub: 1, gonfle: 0.045, coupes: { body: [(y) => y.x - 5, (y) => -y.x - 5, (y) => y.y - 7.55, (y) => y.y - 7.1, (y) => y.x - 0.55, (y) => -y.x - 0.55, (y) => y.x - 0.85, (y) => -y.x - 0.85, (y) => y.x - 1.6, (y) => -y.x - 1.6], legs: [(y) => y.y - 1.7] } }), ...await x()] };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#f2c49e", Z = "#3e9e9b", N = "#7b5a3b", z = "#4a3222", A = "#2f2118", G = "#3a2a1e", L = "#22201f", x = "#5b6066", y = "#4a2c18";
    const E = { sexe: "M" };
    const g = () => {
      const d = new t.Group(), l = b("tresse", y, { rugosite: 0.7 }), u = b("lien", "#2b1a0e");
      const n = new t.Vector3(0, 26, -33.5), h = 9;
      for (let s = 0; s < h; s++) {
        const r = s / (h - 1), f = 6.2 * (1 - 0.45 * r), i = new t.SphereGeometry(1, 14, 10);
        i.scale(f * 1.05, f * 1.25, f * 0.85);
        i.rotateZ((s % 2 ? 1 : -1) * 0.35);
        i.translate(n.x + 0.6 * s + (s % 2 ? 1.2 : -1.2), n.y - s * 6.3, n.z - 3 + s * 0.4);
        d.add(new t.Mesh(i, l));
      }
      const e = new t.CylinderGeometry(2.4, 2.4, 2.4, 12);
      e.translate(n.x + 0.6 * h, n.y - h * 6.3 + 2.5, n.z - 3 + h * 0.4 - 1);
      d.add(new t.Mesh(e, u));
      const c = new t.ConeGeometry(2.6, 7, 10);
      c.rotateX(_);
      c.translate(n.x + 0.6 * h, n.y - h * 6.3 - 2.5, n.z - 3 + h * 0.4 - 1);
      d.add(new t.Mesh(c, l));
      return d;
    };
    const a = (d, l, u, n) => {
      if (n === "hands") return G;
      if (n === "legs") {
        if (d.y < 2.6) return A;
        if (d.y > 4.2) return N;
        return R;
      }
      const h = Math.abs(d.x);
      if (u.startsWith("arm") || u.startsWith("wrist") || h > 1.75 || d.y > 10.6 && h > 1) return h > 5.3 ? G : R;
      if (d.y < 7) return N;
      if (d.y > 10.45 && h < 1) return R;
      return Z;
    };
    const w = async () => {
      const d = [], l = async (u, n, h, e) => d.push([u, await p.lier(n, h, E), e]);
      await l("ceinture", C((u, n, h) => {
        const e = u * I;
        h.set(Math.sin(e) * 1.8, 7 + 0.3 * n, 0.2 + Math.cos(e) * 1.55);
      }, 40, 1, { fermeU: true, sens: -1 }), "hip", b("ceinture", A, { side: t.DoubleSide }));
      for (const u of [-1, 1]) {
        const n = u > 0 ? "foot_l1" : "foot_r1";
        await l("sangle" + u, C((c, s, r) => {
          const f = c * I;
          r.set(u * 0.85 + Math.sin(f) * 0.86, 4.5 + 0.22 * s, 0.12 + Math.cos(f) * 0.82);
        }, 24, 1, { fermeU: true, sens: -1 }), n, b("sangle", A, { side: t.DoubleSide }));
        const h = new t.BoxGeometry(0.5, 1.25, 0.8);
        h.translate(u * 1.75, 4.8, 0.2);
        await l("etui" + u, h, n, b("etui", z));
        const e = new t.BoxGeometry(0.38, 0.75, 0.42);
        e.rotateX(-0.3);
        e.translate(u * 1.8, 5.75, -0.1);
        await l("crosse" + u, e, n, b("pistolet", L));
      }
      {
        const u = new t.SphereGeometry(1, 14, 10);
        u.scale(0.62, 0.75, 0.8);
        u.translate(0, 5.25, 0.15);
        await l("fond", u, "hip", b("fond", N));
      }
      for (const u of [-1, 1]) {
        const n = new t.CylinderGeometry(0.62, 0.66, 1.6, 16);
        n.translate(u * 0.8, 1.85, 0.05);
        await l("tige" + u, n, u > 0 ? "foot_l2" : "foot_r2", b("botte", A));
      }
      return d;
    };
    p.ARTICLES["xd0c05b05"] = { nom: "tresse", categorie: "accessoire", attache: "tete", modele: g };
    p.ARTICLES["pilleuse-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, sexe: "M", modele: async () => [...await p.combinaison(["body", "hands"], a, { sexe: "M", sub: 1, gonfle: 0.02, coupes: { body: [(d) => d.y - 7, (d) => d.y - 10.45, (d) => d.x - 1.75, (d) => -d.x - 1.75, (d) => d.y - 10.6, (d) => d.x - 5.3, (d) => -d.x - 5.3, (d) => d.x - 1, (d) => -d.x - 1] } }), ...await w()] };
    p.ARTICLES["pilleuse-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, sexe: "M", modele: async () => p.combinaison(["legs"], a, { sexe: "M", sub: 1, gonfle: 0.02, coupes: { legs: [(d) => d.y - 2.6, (d) => d.y - 4.2] }, gonfle: 0.05 }) };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#c6916b", Z = "#2fb1b8", N = "#3f3a9a", z = "#5a5a5a", A = "#3b2614";
    const G = (E, g = 16) => {
      const a = p.toile(g, (w) => {
        for (let d = 0; d < g; d++) for (let l = 0; l < g; l++) {
          w.fillStyle = E[(d * 7 + l * 13 + d * l % 5) % E.length];
          w.fillRect(d, l, 1, 1);
        }
      });
      a.magFilter = t.NearestFilter;
      a.minFilter = t.NearestFilter;
      a.generateMipmaps = false;
      return a;
    };
    const L = (E, g, a, w) => {
      if (w === "hands") return R;
      if (w === "legs") return E.y < 0.9 ? z : N;
      const d = Math.abs(E.x);
      if (d > 2.6) return R;
      if (E.y < 7.1) return N;
      return Z;
    };
    const x = async () => {
      const E = [], g = b("bois", "#7a5530"), a = b("bois2", "#5a3d22"), w = b("diamant", "#4fe3df", { rugosite: 0.35 }), d = b("diamant2", "#2fb4ae", { rugosite: 0.35 }), l = b("contour", "#163c3a");
      const u = new t.Vector3(-6.2, 10.3, 0), n = 0.42;
      const h = (i, o, m) => {
        const M = new t.BoxGeometry(n, n, n * 1.2);
        M.translate(i * n, o * n, 0);
        return [M, m];
      };
      const e = [];
      for (let i = 0; i < 9; i++) e.push(h(i - 4, i - 4, i % 2 ? g : a));
      const c = [[1, 5], [2, 5], [3, 5], [4, 4], [5, 3], [5, 2], [5, 1], [0, 5], [-1, 5], [5, 0], [5, -1], [4, 5], [5, 4]];
      c.forEach(([i, o], m) => e.push(h(i, o, m % 3 ? w : d)));
      for (const [i, o] of [[0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [-2, 5], [5, -2]]) e.push(h(i, o, l));
      const s = F(e.map(([i]) => p.indexee(i)));
      const r = /* @__PURE__ */ new Map();
      for (const [i, o] of e) {
        if (!r.has(o)) r.set(o, []);
        r.get(o).push(p.indexee(i));
      }
      let f = 0;
      for (const [i, o] of r) {
        const m = F(o);
        m.translate(n * 3, n * 3, 0);
        m.rotateZ(-_ / 4);
        m.rotateX(-0.35);
        m.translate(u.x - 0.4, u.y, u.z + 0.75);
        E.push(["pioche" + f++, await p.lier(m, "wrist_r"), i]);
      }
      return E;
    };
    const y = () => {
      const E = new t.Group();
      const g = { c: "#3b2614", c2: "#2f1d0f", p: "#c6916b", p2: "#b07a56", b: "#ffffff", y: "#4b3d9e", n: "#8a5a3c", m: "#6b3f2a", r: "#4a2a1b" };
      const a = (f) => {
        const i = p.toile(8, (o) => {
          f.forEach((m, M) => [...m].forEach((S, U) => {
            o.fillStyle = g[S];
            o.fillRect(U, M, 1, 1);
          }));
        });
        i.magFilter = i.minFilter = t.NearestFilter;
        i.generateMipmaps = false;
        return i;
      };
      const w = a(["cccccccc", "cccccccc", "cppppppc", "pppppppp", "pbypypbp", "ppppnppp", "ppmrrmpp", "pprrrrpp"].map((f) => f.replace(/y/g, "y")));
      const d = (f) => f.map((i) => i.replace("pbypypbp", "pbyppybp"));
      const l = a(d(["cccccccc", "cccccccc", "cppppppc", "pppppppp", "pbypypbp", "pppnnppp", "ppmmmmpp", "ppmppmpp"]));
      const u = a(["cccccccc", "cccccccc", "ccccccpp", "ccccpppp", "ccccpppp", "cccppppp", "cccppppp", "cccppppp"]);
      const n = a(["cccccccc", "cccccccc", "ppcccccc", "ppppcccc", "ppppcccc", "pppppccc", "pppppccc", "pppppccc"]);
      const h = a(["cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc"]);
      const e = a(["cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc", "cccccccc"]);
      const c = a(["pppppppp", "pppppppp", "pppppppp", "pppppppp", "pppppppp", "pppppppp", "pppppppp", "pppppppp"]);
      const s = (f) => b("cube", "#ffffff", { map: f, rugosite: 0.9 });
      const r = new t.BoxGeometry(62, 62, 62);
      r.translate(0, 31, -2);
      E.add(new t.Mesh(r, [s(n), s(u), s(e), s(c), s(l), s(h)]));
      return E;
    };
    p.ARTICLES["x219cd39d"] = { nom: "tete", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: y };
    p.ARTICLES["mineur-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await p.combinaison(["body", "hands"], L, { sub: 1, gonfle: 0.02, coupes: { body: [(E) => E.x - 2.6, (E) => -E.x - 2.6, (E) => E.y - 7.1] } })] };
    p.ARTICLES["mineur-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => p.combinaison(["legs"], L, { sub: 1, gonfle: 0.02, coupes: { legs: [(E) => E.y - 0.9] } }) };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#3c3f73", Z = "#2c2f4f", N = "#f3cfa8", z = "#5a3a22", A = "#242424", G = "#b9bec6", L = "#2b2b33";
    const x = (a, w, d, l) => {
      if (l === "hands") return L;
      if (l === "legs") return a.y < 1.9 ? z : Z;
      const u = Math.abs(a.x);
      if (u > 4.9) return L;
      if (u > 1.9) return N;
      if (a.y < 7.35) return Z;
      return R;
    };
    const y = (a, w, d, l, u, n, h = [0, 0, 0]) => {
      const e = new t.BoxGeometry(a, w, d);
      e.rotateX(h[0]);
      e.rotateY(h[1]);
      e.rotateZ(h[2]);
      e.translate(l, u, n);
      return e;
    };
    const E = async () => {
      const a = [], w = async (l, u, n, h) => a.push([l, await p.lier(u, n), h]);
      for (const l of [-1, 1]) await w("baudrier" + l, C((u, n, h) => {
        const e = (u - 0.5) * 2.4, c = 7.9 + l * Math.sin(e) * 0.35;
        h.set(Math.sin(e) * 1.62, c + 0.42 * n, 0.18 + Math.cos(e) * 1.42);
      }, 24, 1, { sens: -1 }), "chest", b("baudrier", z, { side: t.DoubleSide }));
      await w("ceinture", C((l, u, n) => {
        const h = l * I;
        n.set(Math.sin(h) * 1.82, 7.25 + 0.3 * u, 0.2 + Math.cos(h) * 1.6);
      }, 40, 1, { fermeU: true, sens: -1 }), "hip", b("ceinture", z, { side: t.DoubleSide }));
      await w("sangle", C((l, u, n) => {
        const h = l * I;
        n.set(0.6 + Math.sin(h) * 1.25, 9.6 + Math.cos(h) * 1.25 * 0.2 + 0.3 * u + (Math.sin(h) > 0 ? 0.9 * Math.sin(h) : 0), Math.cos(h) * 1.15);
      }, 32, 1, { fermeU: true, sens: -1 }), "chest", b("sangle", z, { side: t.DoubleSide }));
      const d = new t.SphereGeometry(1, 20, 12, 0, I, 0, _ * 0.5);
      d.scale(1.15, 0.75, 1.05);
      d.rotateZ(-0.55);
      d.translate(1.55, 10.5, 0);
      await w("epauliere", d, "chest", b("epauliere", G, { rugosite: 0.3 }));
      await w("brassard", y(1.3, 0.75, 0.8, 4.2, 10.3, 0), "arm_l2", b("brassard", "#6e7380", { rugosite: 0.4 }));
      for (const l of [-1, 1]) await w("botte" + l, y(1.05, 1.4, 1.2, l * 0.8, 1.25, 0.1), l > 0 ? "foot_l2" : "foot_r2", b("botte", z));
      return a;
    };
    const g = () => {
      const a = new t.Group(), w = b("pointes", "#e7bf5c", { rugosite: 0.6 }), d = [];
      const l = (u, n, h, e) => {
        n = n.clone().normalize();
        const c = new t.Vector3().crossVectors(n, new t.Vector3(0, 0, 1));
        if (c.lengthSq() < 1e-4) c.set(1, 0, 0);
        c.normalize();
        const s = new t.Vector3().crossVectors(c, n).normalize();
        d.push(C((r, f, i) => {
          const o = r * I, m = e * (1 - f) ** 0.8;
          i.copy(u).addScaledVector(n, h * f).addScaledVector(c, Math.cos(o) * m).addScaledVector(s, Math.sin(o) * m * 0.42);
        }, 10, 4, { fermeU: true }));
      };
      for (const [u, n, h, e, c, s, r, f] of [[0, 56, 4, 0, 1, 0.4, 30, 15], [-15, 54, 0, -0.6, 1, 0.2, 28, 14], [15, 54, 0, 0.6, 1, 0.2, 28, 14], [-8, 56, -12, -0.35, 0.9, -0.8, 30, 15], [8, 56, -12, 0.35, 0.9, -0.8, 30, 15], [0, 50, -22, 0, 0.6, -1, 28, 14], [-22, 48, -10, -1, 0.7, -0.4, 24, 12], [22, 48, -10, 1, 0.7, -0.4, 24, 12]]) l(new t.Vector3(u * 0.7, n - 12, h * 0.7), new t.Vector3(e, c, s), r + 12, f * 1.15);
      a.add(new t.Mesh(F(d), w));
      return a;
    };
    p.ARTICLES["xe33a4103"] = { nom: "pointes", categorie: "accessoire", attache: "tete", modele: g };
    p.ARTICLES["ex-soldat-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await p.combinaison(["body", "hands"], x, { sub: 1, gonfle: 0.02, coupes: { body: [(a) => a.x - 4.9, (a) => -a.x - 4.9, (a) => a.x - 1.9, (a) => -a.x - 1.9, (a) => a.y - 7.35] } }), ...await E()] };
    p.ARTICLES["ex-soldat-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => p.combinaison(["legs"], x, { sub: 1, gonfle: 0.05, coupes: { legs: [(a) => a.y - 1.9] } }) };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#b8341c", Z = "#e59a1d", N = "#c97c12", z = "#5fe04a", A = "#1c6a2a", G = "#5a5450", L = "#2a2420";
    const x = new t.Vector3(0, 30, -1), y = new t.Vector3(34, 37.5, 36.5);
    const E = (l, u, n, h) => {
      const e = u * _ * 0.93, c = Math.sin(e), s = Math.cos(e), r = y.x * c * Math.sin(l), f = x.y + y.y * s, i = y.z * c * Math.cos(l);
      const o = new t.Vector3(r / y.x ** 2, (f - x.y) / y.y ** 2, i / y.z ** 2).normalize();
      return h.set(r, f, x.z + i).addScaledVector(o, n);
    };
    const g = () => {
      const l = new t.Group();
      l.add(new t.Mesh(C((e, c, s) => E(e * I, c, 0, s), 72, 36, { fermeU: true, sens: -1 }), b("coque", R, { rugosite: 0.35 })));
      const u = C((e, c, s) => {
        const r = (e - 0.5) * 2, f = r * 1.05, i = 21 + 22 * c - 7 * (1 - Math.min(1, Math.abs(r) * 2.2)) * (1 - c) * 0, o = 24 - 9 * Math.max(0, 1 - Math.abs(r) * 1.8), m = o + (43 - o) * c;
        const M = Math.acos($((m - x.y) / y.y, -1, 1)) / (_ * 0.93);
        E(f, M, 1 + 1.2 * Math.sin(c * _), s);
      }, 36, 10);
      const n = p.toile(64, (e) => {
        const c = e.createLinearGradient(0, 0, 0, 64);
        c.addColorStop(0, "#1f7a2a");
        c.addColorStop(0.5, "#5fe04a");
        c.addColorStop(1, "#c9ff8a");
        e.fillStyle = c;
        e.fillRect(0, 0, 64, 64);
        e.globalAlpha = 0.5;
        e.fillStyle = "#fff";
        e.fillRect(10, 0, 6, 64);
        e.globalAlpha = 1;
      });
      l.add(new t.Mesh(u, b("visiere", "#ffffff", { map: n, rugosite: 0.15 })));
      const h = C((e, c, s) => {
        const r = (e - 0.5) * 2, f = r * 1.12, i = 22.5 - 9 * Math.max(0, 1 - Math.abs(r) * 1.8), o = i + (45 - i) * c;
        const m = Math.acos($((o - x.y) / y.y, -1, 1)) / (_ * 0.93);
        E(f, m, 0.5, s);
      }, 36, 8);
      l.add(new t.Mesh(h, b("cadre", L)));
      for (const e of [-1, 1]) {
        const c = new t.SphereGeometry(1, 16, 10);
        c.scale(7, 10, 6);
        const s = E(e * 1.25, 0.62, 1.5, new t.Vector3());
        c.translate(s.x, s.y, s.z);
        l.add(new t.Mesh(c, b("joue", Z, { rugosite: 0.3 })));
      }
      return l;
    };
    const a = (l, u, n, h) => {
      if (h === "hands") return N;
      if (h === "legs") {
        if (l.y < 1.2) return R;
        if (l.y > 3 && l.y < 3.5) return R;
        return Z;
      }
      const e = Math.abs(l.x);
      if (e > 2.4) return Z;
      if (e > 1.6) return R;
      if (l.y < 7.5) return G;
      if (l.y < 8.6) return N;
      return R;
    };
    const w = (l, u, n, h) => {
      l.translate(u, n, h);
      return l;
    };
    const d = async () => {
      const l = [], u = async (s, r, f, i) => l.push([s, await p.lier(r, f), i]);
      for (const s of [-1, 1]) {
        const r = new t.SphereGeometry(1, 24, 16);
        r.scale(1.75, 1.45, 1.6);
        r.translate(s * 2.5, 10.5, 0);
        await u("epaule" + s, r, s > 0 ? "arm_l1" : "arm_r1", b("epaule", Z, { rugosite: 0.3 }));
      }
      const n = new t.SphereGeometry(1, 20, 12);
      n.scale(1.8, 1.25, 1.2);
      n.translate(0, 9.6, 0.35);
      await u("plastron", n, "chest", b("plastron", R, { rugosite: 0.35 }));
      const h = new t.CylinderGeometry(0.85, 1.05, 0.6, 16);
      h.translate(0, 10.8, 0);
      await u("col", h, "chest", b("col", N));
      const e = C((s, r, f) => {
        const i = s * I, o = 0.78 + 0.12 * Math.sin(r * _);
        f.set(-4.4 - 3.3 * r, 10.3 + Math.sin(i) * o, Math.cos(i) * o);
      }, 24, 8, { fermeU: true });
      await u("canon", e, "wrist_r", b("canon", "#2f7d39", { rugosite: 0.35 }));
      for (const s of [-5.4, -6.4]) {
        const r = new t.TorusGeometry(0.92, 0.12, 8, 20);
        r.rotateY(_ / 2);
        r.translate(s, 10.3, 0);
        await u("bague" + s, r, "wrist_r", b("bague", "#c9c64a"));
      }
      const c = new t.CylinderGeometry(0.55, 0.55, 0.1, 16);
      c.rotateZ(_ / 2);
      c.translate(-7.72, 10.3, 0);
      await u("bout", c, "wrist_r", b("bout", L));
      for (const s of [-1, 1]) {
        const r = new t.SphereGeometry(0.62, 14, 10);
        r.translate(s * 0.82, 3.25, 0.45);
        await u("genou" + s, r, s > 0 ? "foot_l2" : "foot_r2", b("genou", R));
        const f = new t.CylinderGeometry(0.72, 0.8, 1.3, 16);
        f.translate(s * 0.8, 0.75, 0.1);
        await u("botte" + s, f, s > 0 ? "ankle_l" : "ankle_r", b("botte", R));
      }
      return l;
    };
    p.ARTICLES["x963179ef"] = { nom: "casque", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: g };
    p.ARTICLES["chasseuse-2"] = { nom: "armure", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await p.combinaison(["body", "hands"], a, { sub: 1, gonfle: 0.04, coupes: { body: [(l) => l.x - 2.4, (l) => -l.x - 2.4, (l) => l.x - 1.6, (l) => -l.x - 1.6, (l) => l.y - 7.5, (l) => l.y - 8.6] } }), ...await d()] };
    p.ARTICLES["chasseuse-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => p.combinaison(["legs"], a, { sub: 1, gonfle: 0.06, coupes: { legs: [(l) => l.y - 1.2, (l) => l.y - 3, (l) => l.y - 3.5] } }) };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#f1efe8", Z = "#d9d5ca", N = "#e2a878", z = "#1e1d1f", A = "#c8221c";
    const G = (y, E, g, a) => {
      if (a === "hands") return A;
      if (a === "legs") return y.y < 0.95 ? N : R;
      const w = Math.abs(y.x);
      if (w > 5.2) return A;
      if (w > 2.15) return N;
      if (E.z > 0.3 && y.y > 8.2 && w < (y.y - 8.2) * 0.55) return N;
      return R;
    };
    const L = async () => {
      const y = [], E = async (a, w, d, l) => y.push([a, await p.lier(w, d), l]);
      await E("ceinture", C((a, w, d) => {
        const l = a * I;
        d.set(Math.sin(l) * 1.85, 7.2 + 0.35 * w, 0.2 + Math.cos(l) * 1.62);
      }, 40, 1, { fermeU: true, sens: -1 }), "hip", b("ceinture", z, { side: t.DoubleSide }));
      const g = new t.SphereGeometry(0.28, 10, 8);
      g.scale(1.3, 1, 0.8);
      g.translate(0.35, 7.35, 1.85);
      await E("noeud", g, "hip", b("noeud", z));
      for (const [a, w] of [[0.25, 0.25], [0.5, -0.15]]) {
        const d = new t.BoxGeometry(0.25, 1.1, 0.06);
        d.translate(0, -0.55, 0);
        d.rotateZ(w);
        d.translate(a, 7.3, 1.9);
        await E("pan" + a, d, "hip", b("pan", z));
      }
      return y;
    };
    const x = () => {
      const y = new t.Group(), E = b("bandeau", A, { rugosite: 0.9, side: t.DoubleSide }), g = -3;
      const a = [35.6, 35.4, 34.6, 33.2, 31.4, 31.4, 30.2, 29.8, 30.2, 31.2, 32.3, 32.6, 32.7];
      const w = (r, f) => {
        const i = Math.abs(Math.atan2(Math.sin(r), Math.cos(r))) / _ * 12, o = Math.min(11, Math.floor(i));
        return a[o] + (a[o + 1] - a[o]) * (i - o) + 0.3 - (f - 47) * 0.22;
      };
      const d = (r) => 36.5 - 2 * (1 - Math.cos(r)) / 2, l = 7.5, u = (r) => Math.cos(r) < 0 ? 3.5 * Math.min(1, -Math.cos(r) * 2) : 0;
      const n = C((r, f, i) => {
        const o = r * I, m = d(o) + l * f, M = w(o, m) + u(o) + 0.4 * Math.sin(f * _);
        i.set(Math.sin(o) * M, m, g + Math.cos(o) * M);
      }, 96, 5, { fermeU: true, sens: -1 });
      const h = d(_) + l / 2, e = g - w(_, h) - 3.5 - 1.2;
      const c = (r, f, i) => C((o, m, M) => {
        const S = (o - 0.5) * (5 * (1 - 0.4 * m) + 0.5);
        M.set(r * (2 + 9 * m) + 2 * Math.sin(m * 5 + i), h - 2 - 20 * m * m + S + 2 * Math.sin(m * 6 + i), e - f * m);
      }, 3, 16);
      const s = new t.SphereGeometry(2.6, 12, 8);
      s.scale(1.2, 1, 0.8);
      s.translate(0, h, e);
      y.add(new t.Mesh(F([n, s, c(1, 34, 0), c(-1, 28, 1.6)].map(p.indexee)), E));
      return y;
    };
    p.ARTICLES["x25940e6f"] = { nom: "bandeau", categorie: "chapeau", attache: "tete", cache_cheveux: "aucun", modele: x };
    p.ARTICLES["errant-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await p.combinaison(["body", "hands"], G, { sub: 2, gonfle: 0.03, coupes: { body: [(y) => y.x - 5.2, (y) => -y.x - 5.2, (y) => y.x - 2.15, (y) => -y.x - 2.15, (y) => y.x - (y.y - 8.2) * 0.55, (y) => -y.x - (y.y - 8.2) * 0.55] } }), ...await L()] };
    p.ARTICLES["errant-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => p.combinaison(["legs"], G, { sub: 1, gonfle: 0.12, coupes: { legs: [(y) => y.y - 0.95] } }) };
  })();
  (() => {
    const { T: t, PI: _, TAU: I, borne: $, lisse: O, mat: b, surface: C, fusion: F } = p;
    const R = "#f6f6f2", Z = "#2f63d6", N = "#f04a8e", z = "#f6c32a";
    const A = new t.Vector3(0, 28, -1), G = new t.Vector3(33.5, 37, 35);
    const L = (g) => g.z > 5 && (g.x / 23.5) ** 2 + ((g.y - 24) / 19) ** 2 < 1;
    const x = () => {
      const g = new t.Group();
      let a = new t.SphereGeometry(1, 56, 36);
      a.scale(G.x, G.y, G.z);
      a.translate(A.x, A.y, A.z);
      a.deleteAttribute("uv");
      a = p.couper(a.toNonIndexed(), [(o) => o.z > 0 ? (o.x / 23.5) ** 2 + ((o.y - 24) / 19) ** 2 - 1 : 1]);
      const w = a.attributes.position, d = [], l = new t.Vector3();
      for (let o = 0; o < w.count / 3; o++) {
        l.set(0, 0, 0);
        for (let m = 0; m < 3; m++) l.add(new t.Vector3().fromBufferAttribute(w, o * 3 + m));
        l.multiplyScalar(1 / 3);
        if (!L(l) && l.y > -9) d.push(o);
      }
      const u = p.indexer(p.extraire(a, d));
      g.add(new t.Mesh(u, b("casque", R, { rugosite: 0.35, side: t.DoubleSide })));
      const n = C((o, m, M) => {
        const S = o * I, U = Math.sin(S) * 23.5, P = 24 + Math.cos(S) * 19, q = Math.sqrt(Math.max(0, 1 - (U / G.x) ** 2 - ((P - A.y) / G.y) ** 2)) * G.z + A.z;
        M.set(U * (1 - 0.03 * m), P - (P - 24) * 0.03 * m, q - 2.5 + 2.2 * m);
      }, 64, 2, { fermeU: true });
      g.add(new t.Mesh(n, b("bord", "#dcdcd8", { side: t.DoubleSide })));
      const h = p.toile(256, (o) => {
        o.fillStyle = "#f7b98c";
        o.fillRect(0, 0, 256, 256);
        const m = o.createRadialGradient(128, 150, 20, 128, 140, 170);
        m.addColorStop(0, "rgba(255,255,255,.18)");
        m.addColorStop(1, "rgba(120,40,20,.25)");
        o.fillStyle = m;
        o.fillRect(0, 0, 256, 256);
        o.fillStyle = "#151515";
        for (const M of [88, 168]) {
          o.beginPath();
          o.ellipse(M, 112, 21, 46, 0, 0, I);
          o.fill();
        }
        o.fillStyle = "rgba(255,255,255,.85)";
        for (const M of [80, 160]) {
          o.beginPath();
          o.ellipse(M, 92, 6, 10, 0, 0, I);
          o.fill();
        }
      });
      const e = C((o, m, M) => {
        const S = o * I, U = m, P = Math.sin(S) * 23.8 * U, q = 24 + Math.cos(S) * 19.3 * U, W = Math.sqrt(Math.max(0, 1 - (P / (G.x - 1.2)) ** 2 - ((q - A.y) / (G.y - 1.2)) ** 2)) * (G.z - 1.2) + A.z;
        M.set(P, q, W);
      }, 48, 12, { fermeU: true });
      const c = e.attributes.uv, s = e.attributes.position;
      for (let o = 0; o < c.count; o++) c.setXY(o, 0.5 + s.getX(o) / 48, 0.5 + (s.getY(o) - 24) / 48);
      g.add(new t.Mesh(e, b("visage", "#ffffff", { map: h, rugosite: 0.6 })));
      const r = new t.TorusGeometry(15, 4, 10, 32);
      r.rotateX(_ / 2);
      r.translate(0, -7, A.z);
      g.add(new t.Mesh(r, b("col", R, { rugosite: 0.35 })));
      const f = new t.CylinderGeometry(1.4, 1.4, 12, 10);
      f.translate(0, A.y + G.y + 5, A.z);
      g.add(new t.Mesh(f, b("tige", "#c9c9c4")));
      const i = new t.SphereGeometry(7, 20, 14);
      i.translate(0, A.y + G.y + 14, A.z);
      g.add(new t.Mesh(i, b("pompon", N, { rugosite: 0.5 })));
      return g;
    };
    const y = (g, a, w, d) => {
      if (d === "hands") return N;
      if (d === "legs") return g.y < 1.25 ? N : R;
      const l = Math.abs(g.x);
      if (l > 4.9) return N;
      if (l > 1.65) return R;
      if (g.y < 7.6) return z;
      if (g.y < 7) return R;
      return Z;
    };
    const E = async () => {
      const g = [], a = async (d, l, u, n) => g.push([d, await p.lier(l, u), n]);
      const w = new t.BoxGeometry(0.8, 0.55, 0.2);
      w.translate(0, 7.35, 1.72);
      await a("boucle", w, "hip", b("boucle", "#f3e27a"));
      for (const d of [-1, 1]) {
        const l = new t.SphereGeometry(1, 16, 10);
        l.scale(0.78, 0.58, 1.15);
        l.translate(d * 0.85, 0.5, 0.4);
        await a("botte" + d, l, d > 0 ? "ankle_l" : "ankle_r", b("botte", N, { rugosite: 0.5 }));
        const u = new t.SphereGeometry(1, 14, 10);
        u.scale(0.6, 0.6, 0.6);
        u.translate(d * 5.9, 10.3, 0);
        await a("gant" + d, u, d > 0 ? "wrist_l" : "wrist_r", b("gant", N, { rugosite: 0.5 }));
      }
      return g;
    };
    p.ARTICLES["x7f39ac3b"] = { nom: "casque", categorie: "chapeau", attache: "tete", cache_cheveux: "tout", modele: x };
    p.ARTICLES["bombeur-2"] = { nom: "tenue", categorie: "haut", attache: "torse", remplace: "haut", peau: true, modele: async () => [...await p.combinaison(["body", "hands"], y, { sub: 1, gonfle: 0.03, coupes: { body: [(g) => g.x - 4.9, (g) => -g.x - 4.9, (g) => g.x - 1.65, (g) => -g.x - 1.65, (g) => g.y - 7.6, (g) => g.y - 7] } }), ...await E()] };
    p.ARTICLES["bombeur-3"] = { nom: "jambes", categorie: "bas", attache: "bassin", remplace: "bas", peau: true, modele: async () => p.combinaison(["legs"], y, { sub: 1, gonfle: 0.03, coupes: { legs: [(g) => g.y - 1.25] } }) };
  })();
  (() => {
    const t = window.THREE, _ = window.__pcvESM;
    const I = { blanc: 16053230, gilet: 1841953, bouton: 15382842, noeud: 1873462 };
    const $ = /* @__PURE__ */ new Set(["skl_root", "chest", "hip"]);
    const O = 0.07;
    const b = (A) => new Promise((G, L) => {
      const x = new XMLHttpRequest();
      x.open("GET", A);
      x.responseType = "arraybuffer";
      x.onload = () => (x.status === 200 || x.status === 0) && x.response ? G(x.response) : L(new Error("absent : " + A));
      x.onerror = () => L(new Error("absent : " + A));
      x.send();
    });
    const C = (A, G, L = false) => {
      const x = new t.MeshStandardMaterial({ name: A, color: new t.Color(G), roughness: 0.8, metalness: 0 });
      if (L) x.userData.teintable = true;
      return x;
    };
    const F = (A) => {
      let G = "";
      const L = new Uint8Array(A);
      for (let x = 0; x < L.length; x += 32768) G += String.fromCharCode(...L.subarray(x, x + 32768));
      return btoa(G);
    };
    const R = (A) => {
      const G = [], L = [];
      for (const y of A) {
        const E = y.index ? y.toNonIndexed() : y;
        G.push(...E.attributes.position.array);
        L.push(...E.attributes.normal.array);
      }
      const x = new t.BufferGeometry();
      x.setAttribute("position", new t.Float32BufferAttribute(G, 3));
      x.setAttribute("normal", new t.Float32BufferAttribute(L, 3));
      return x;
    };
    const Z = async () => {
      const A = (await p.corps("M")).gltf;
      const G = A.scene;
      G.updateMatrixWorld(true);
      let L = null;
      G.traverse((T) => {
        if (!L && T.isSkinnedMesh && T.skeleton.bones.some((B) => B.name === "chest")) L = T;
      });
      const x = L.skeleton, y = L.geometry;
      const E = (T) => x.bones.findIndex((B) => B.name === T), g = E("chest");
      const a = new Set(x.bones.map((T, B) => $.has(T.name) ? B : -1).filter((T) => T >= 0));
      const w = y.attributes.position, d = y.attributes.normal, l = y.attributes.skinIndex, u = y.attributes.skinWeight;
      const n = (T) => {
        let B = 0, Y = -1;
        for (let Q = 0; Q < 4; Q++) {
          const J = u.getComponent(T, Q);
          if (J > Y) {
            Y = J;
            B = l.getComponent(T, Q);
          }
        }
        return B;
      };
      const h = x.boneInverses[g].clone().multiply(L.bindMatrix), e = h.clone().invert();
      const c = y.index ? y.index.array : Array.from({ length: w.count }, (T, B) => B);
      const s = /* @__PURE__ */ new Map(), r = [];
      for (let T = 0; T < c.length; T += 3) {
        const B = [c[T], c[T + 1], c[T + 2]];
        if (B.every((Y) => a.has(n(Y)))) r.push(B);
      }
      const f = [], i = [], o = [], m = [], M = [], S = new t.Vector3(), U = new t.Vector3();
      const P = (T) => {
        if (s.has(T)) return s.get(T);
        const B = f.length / 3;
        s.set(T, B);
        S.fromBufferAttribute(w, T);
        U.fromBufferAttribute(d, T);
        S.addScaledVector(U, O);
        f.push(S.x, S.y, S.z);
        i.push(U.x, U.y, U.z);
        for (let Y = 0; Y < 4; Y++) {
          o.push(l.getComponent(T, Y));
          m.push(u.getComponent(T, Y));
        }
        return B;
      };
      for (const T of r) M.push(...T.map(P));
      const q = new t.BufferGeometry();
      q.setAttribute("position", new t.Float32BufferAttribute(f, 3));
      q.setAttribute("normal", new t.Float32BufferAttribute(i, 3));
      q.setAttribute("skinIndex", new t.Uint16BufferAttribute(o, 4));
      q.setAttribute("skinWeight", new t.Float32BufferAttribute(m, 4));
      q.setIndex(M);
      const W = r.map((T) => T.map((B) => new t.Vector3().fromArray(f, s.get(B) * 3).applyMatrix4(h)));
      let H = -1e9, V = 1e9, k = 0;
      for (const T of W) for (const B of T) {
        H = Math.max(H, B.y);
        V = Math.min(V, B.y);
        k = Math.max(k, Math.abs(B.x));
      }
      const X = new t.Ray(), D = new t.Vector3();
      const v = (T, B) => {
        X.origin.set(T, B, 50);
        X.direction.set(0, 0, -1);
        let Y = null;
        for (const [Q, J, oe] of W) {
          if (X.intersectTriangle(Q, J, oe, false, D) && (Y === null || D.z > Y)) Y = D.z;
        }
        return Y;
      };
      const j = H - V;
      let K = H;
      while (K > V && v(0, K) === null) K -= j * 0.01;
      const ee = (T) => {
        T.applyMatrix4(e);
        const B = T.attributes.position.count;
        T.setAttribute("skinIndex", new t.Uint16BufferAttribute(new Array(B * 4).fill(0).map((Y, Q) => Q % 4 ? 0 : g), 4));
        T.setAttribute("skinWeight", new t.Float32BufferAttribute(new Array(B * 4).fill(0).map((Y, Q) => Q % 4 ? 0 : 1), 4));
        return T;
      };
      const ae = K - j * 0.42, fe = k * 0.36, ne = new t.PlaneGeometry(1, 1, 8, 10), se = ne.attributes.position;
      for (let T = 0; T < se.count; T++) {
        const B = se.getX(T) + 0.5, Y = se.getY(T) + 0.5, Q = ae + (K - ae) * Y, J = (B - 0.5) * 2 * fe * Y ** 0.9;
        const oe = v(J, Math.min(Q, K - j * 5e-3)) ?? v(0, K - j * 0.02) ?? 0;
        se.setXYZ(T, J, Q, oe + 0.025);
      }
      ne.computeVertexNormals();
      const ue = [], pe = (T) => v(0, T) ?? 0;
      for (let T = 0; T < 2; T++) {
        const B = ae - j * (0.09 + T * 0.17), Y = new t.SphereGeometry(j * 0.055, 12, 8);
        Y.scale(1, 1, 0.45);
        Y.translate(0, B, pe(B) + 0.02);
        ue.push(Y);
      }
      const ce = K - j * 0.27, le = (v(0, ce) ?? v(0, K - j * 0.03) ?? 0) + j * 0.09, te = j * 0.33;
      const de = [-1, 1].map((T) => {
        const B = new t.ConeGeometry(te * 0.55, te, 12, 1);
        B.rotateZ(T * Math.PI / 2);
        B.scale(1, 1, 0.45);
        B.translate(T * te * 0.55, ce, le);
        return B;
      });
      const re = new t.SphereGeometry(te * 0.28, 12, 8);
      re.scale(1, 1.1, 0.7);
      re.translate(0, ce, le + te * 0.05);
      const he = [];
      G.traverse((T) => {
        if (T.isSkinnedMesh) he.push(T);
      });
      const ie = 0.012;
      const be = (T) => {
        const B = T.geometry.clone();
        for (const J of Object.keys(B.attributes)) if (!["position", "normal", "skinIndex", "skinWeight"].includes(J)) B.deleteAttribute(J);
        const Y = B.attributes.position, Q = B.attributes.normal;
        for (let J = 0; J < Y.count; J++) Y.setXYZ(J, Y.getX(J) + Q.getX(J) * ie, Y.getY(J) + Q.getY(J) * ie, Y.getZ(J) + Q.getZ(J) * ie);
        if (T.skeleton.bones.some((J, oe) => J !== x.bones[oe])) throw new Error("tenue : " + T.name + " n'a pas le squelette du haut");
        return B;
      };
      const ye = he.slice(0, -1).map((T) => [T === L ? "chemise" : "gants", be(T)]);
      return { gilet: [...ye.map(([T, B]) => [T, B, C(T, I.blanc)]), ["gilet", q, C("gilet", I.gilet)], ["plastron", ee(ne), C("plastron", I.blanc)], ["boutons", ee(R(ue)), C("boutons", I.bouton)]], noeud: [["noeud", ee(R([...de, re])), C("noeud", I.noeud, true)]] };
    };
    let N = null;
    const z = () => N ||= Z();
    p.ARTICLES["joueur-2-2"] = { peau: true, brut: true, sexe: "M", modele: async () => (await z()).gilet };
    p.ARTICLES["joueur-2-3"] = { peau: true, brut: true, sexe: "M", modele: async () => (await z()).noeud };
  })();
})();
