(() => {
  if (window.__pcvVisiteursFabrique) return;
  const T = THREE, PI = Math.PI, TAU = 2 * PI, E = () => window.__pcvESM;
  const pause = () => new Promise((r) => setTimeout(r, 0));
  const TRANCHE = 8;
  const sync = (it) => {
    let r;
    do
      r = it.next();
    while (!r.done);
    return r.value;
  };
  const async_ = async (it) => {
    let t = performance.now(), r;
    for (; ; ) {
      r = it.next();
      if (r.done) return r.value;
      if (performance.now() - t > TRANCHE) {
        await pause();
        t = performance.now();
      }
    }
  };
  const borne = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lisse = (x) => (x = borne(x)) * x * (3 - 2 * x);
  const mat = (nom, couleur, o = {}) => {
    const m = new T.MeshStandardMaterial({ name: nom, color: new T.Color(couleur), roughness: o.rugosite ?? 0.75, metalness: 0, map: o.map || null, side: o.side ?? T.FrontSide });
    if (o.teintable) m.userData.teintable = true;
    return m;
  };
  const surface = (f, nu, nv, o = {}) => {
    const pos = [], nor = [], uv = [], idx = [], p = new T.Vector3(), a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), d = new T.Vector3(), n = new T.Vector3();
    const e = 1e-4, sens = o.sens ?? 1, fu = (u) => o.fermeU ? u : borne(u);
    const derivee = (u, v) => {
      f(fu(u + e), v, a);
      f(fu(u - e), v, b);
      a.sub(b);
      f(u, borne(v + e), c);
      f(u, borne(v - e), d);
      c.sub(d);
      n.crossVectors(a, c);
      return n.lengthSq() > 1e-14;
    };
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const u = i / nu, v = j / nv;
      f(u, v, p);
      pos.push(p.x, p.y, p.z);
      if (!derivee(u, v) && !derivee(u, v < 0.5 ? v + 0.02 : v - 0.02)) derivee(u < 0.5 ? u + 0.02 : u - 0.02, v);
      n.normalize().multiplyScalar(sens);
      nor.push(n.x, n.y, n.z);
      uv.push(u * (o.ru || 1), v * (o.rv || 1));
    }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const q = j * (nu + 1) + i, r = q + 1, s = q + nu + 1, t = s + 1;
      if (sens > 0) idx.push(q, r, s, r, t, s);
      else idx.push(q, s, r, r, s, t);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  };
  const fusion = (l) => {
    const pos = [], nor = [], uv = [], idx = [];
    let base = 0;
    for (const g2 of l) {
      const P = g2.attributes.position, N = g2.attributes.normal, U = g2.attributes.uv;
      pos.push(...P.array);
      nor.push(...N.array);
      uv.push(...U ? U.array : new Float32Array(P.count * 2));
      for (const i of g2.index.array) idx.push(i + base);
      base += P.count;
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  };
  const indexee = (g) => {
    if (!g.index) g.setIndex(Array.from({ length: g.attributes.position.count }, (_, i) => i));
    if (!g.attributes.uv) g.setAttribute("uv", new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    return g;
  };
  const plaque = (f, ep, nu, nv, o = {}) => {
    const nrm = (u, v) => {
      const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), d = new T.Vector3(), e = 1e-4;
      f(borne(u + e), v, a);
      f(borne(u - e), v, b);
      f(u, borne(v + e), c);
      f(u, borne(v - e), d);
      return a.sub(b).cross(c.sub(d)).normalize();
    };
    const dessus = (s) => (u, v, p) => {
      f(u, v, p);
      p.addScaledVector(nrm(u, v), s * ep(u, v) / 2);
    };
    const bord = (vb) => (u, w, p) => {
      const q = new T.Vector3(), q2 = new T.Vector3();
      f(u, vb, q);
      f(u, vb ? vb - 1e-3 : 1e-3, q2);
      const dehors = q.clone().sub(q2).normalize(), n = nrm(u, vb), r = ep(u, vb) / 2;
      const a = PI * (w - 0.5);
      p.copy(q).addScaledVector(n, r * Math.sin(a)).addScaledVector(dehors, r * Math.cos(a) * 0.9);
    };
    const sens = o.sens ?? 1;
    return fusion([surface(dessus(1), nu, nv, o), surface(dessus(-1), nu, nv, { ...o, sens: -sens }), surface(bord(1), nu, 6, { ...o, sens: -sens }), surface(bord(0), nu, 6, { ...o, sens })]);
  };
  const toile = (n, dessin) => {
    const c = document.createElement("canvas");
    c.width = c.height = n;
    dessin(c.getContext("2d"), n);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    return t;
  };
  const V = { T, PI, TAU, borne, lisse, mat, surface, fusion, indexee, plaque, toile, ARTICLES: {} };
  const lireBin = async (c) => {
    const url = await window.__pcvRessource?.(c, "model/gltf-binary");
    if (!url) throw new Error("visiteurs : prive/" + c + " absent");
    try {
      return await (await fetch(url)).arrayBuffer();
    } finally {
      URL.revokeObjectURL(url);
      if (window.__pcvBlobs?.[c] === url) delete window.__pcvBlobs[c];
    }
  };
  V.corps = async (sexe = "M") => V["_c" + sexe] ||= (async () => {
    const g = await new Promise(async (ok, ko) => {
      try {
        new (E()).GLTFLoader().parse(await lireBin(`mii/corps/miiBody${sexe === "F" ? "F" : "M"}_wiiu.glb`), "", ok, ko);
      } catch (e) {
        ko(e);
      }
    });
    g.scene.updateMatrixWorld(true);
    const peaux = {};
    g.scene.traverse((x) => {
      if (x.isSkinnedMesh) peaux[x.name.split("_")[0]] = x;
    });
    if (!peaux.body) throw new Error("visiteurs : corps inattendu");
    return { gltf: g, scene: g.scene, peaux, sq: peaux.body.skeleton };
  })().catch((e) => {
    delete V["_c" + sexe];
    throw e;
  });
  V.subdiviser = (geo, n = 1) => {
    let g = geo.index ? geo : V.indexee(geo);
    for (let k = 0; k < n; k++) {
      const P = g.attributes.position, N = g.attributes.normal, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, I = g.index.array;
      const pos = Array.from(P.array), nor = Array.from(N.array), poids = [];
      for (let i = 0; i < P.count; i++) {
        const m = /* @__PURE__ */ new Map();
        for (let c = 0; c < 4; c++) {
          const w = SW.getComponent(i, c);
          if (w > 0) m.set(SI.getComponent(i, c), (m.get(SI.getComponent(i, c)) || 0) + w);
        }
        poids.push(m);
      }
      const milieu = /* @__PURE__ */ new Map(), idx = [];
      const mi = (a, b) => {
        const cle = a < b ? a + "_" + b : b + "_" + a;
        if (milieu.has(cle)) return milieu.get(cle);
        const k2 = pos.length / 3;
        for (let c = 0; c < 3; c++) {
          pos.push((pos[a * 3 + c] + pos[b * 3 + c]) / 2);
          nor.push((nor[a * 3 + c] + nor[b * 3 + c]) / 2);
        }
        const m = /* @__PURE__ */ new Map();
        for (const [o, w] of poids[a]) m.set(o, (m.get(o) || 0) + w / 2);
        for (const [o, w] of poids[b]) m.set(o, (m.get(o) || 0) + w / 2);
        poids.push(m);
        milieu.set(cle, k2);
        return k2;
      };
      for (let f = 0; f < I.length; f += 3) {
        const [a, b, c] = [I[f], I[f + 1], I[f + 2]], ab = mi(a, b), bc = mi(b, c), ca = mi(c, a);
        idx.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
      }
      const si = [], sw = [];
      for (const m of poids) {
        const l = [...m].sort((x, y) => y[1] - x[1]).slice(0, 4);
        let s = 0;
        for (const [, w] of l) s += w;
        while (l.length < 4) l.push([0, 0]);
        for (const [o, w] of l) {
          si.push(o);
          sw.push(s ? w / s : 0);
        }
      }
      const h = new T.BufferGeometry();
      h.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      h.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
      h.setAttribute("skinIndex", new T.Uint16BufferAttribute(si, 4));
      h.setAttribute("skinWeight", new T.Float32BufferAttribute(sw, 4));
      h.setIndex(idx);
      g = h;
    }
    g.attributes.normal.array.forEach(() => {
    });
    return g;
  };
  const couperG = function* (geo, plans) {
    let g = geo.index ? geo.toNonIndexed() : geo;
    for (const f of plans) {
      const A = g.attributes, noms = Object.keys(A), out = Object.fromEntries(noms.map((n) => [n, []])), P = A.position, v = new T.Vector3();
      const val = (i) => f(v.fromBufferAttribute(P, i));
      const sommet = (i) => noms.map((n) => Array.from({ length: A[n].itemSize }, (_, c) => A[n].getComponent(i, c)));
      const iSI = noms.indexOf("skinIndex"), iSW = noms.indexOf("skinWeight");
      const melange = (a, b, t) => {
        const r = a.map((x, k) => x.map((y, c) => y + (b[k][c] - y) * t));
        if (iSI >= 0) {
          const m = /* @__PURE__ */ new Map();
          for (const [s, w] of [[a, 1 - t], [b, t]]) for (let c = 0; c < 4; c++) if (s[iSW][c] > 0) m.set(s[iSI][c], (m.get(s[iSI][c]) || 0) + s[iSW][c] * w);
          const l = [...m].sort((x, y) => y[1] - x[1]).slice(0, 4), tot = l.reduce((q, x) => q + x[1], 0);
          while (l.length < 4) l.push([0, 0]);
          r[iSI] = l.map((x) => x[0]);
          r[iSW] = l.map((x) => tot ? x[1] / tot : 0);
        }
        return r;
      };
      const pousser = (...s3) => {
        for (const s of s3) noms.forEach((n, k) => out[n].push(...s[k]));
      };
      for (let i = 0; i < P.count; i += 3) {
        if (!(i % 768)) yield;
        const S = [sommet(i), sommet(i + 1), sommet(i + 2)], d = [val(i), val(i + 1), val(i + 2)];
        const pos = d.map((x) => x >= 0);
        if (pos[0] === pos[1] && pos[1] === pos[2]) {
          pousser(...S);
          continue;
        }
        const k = pos[0] !== pos[1] && pos[0] !== pos[2] ? 0 : pos[1] !== pos[0] && pos[1] !== pos[2] ? 1 : 2, a = (k + 1) % 3, b = (k + 2) % 3;
        const ka = melange(S[k], S[a], d[k] / (d[k] - d[a])), kb = melange(S[k], S[b], d[k] / (d[k] - d[b]));
        pousser(S[k], ka, kb);
        pousser(ka, S[a], S[b]);
        pousser(ka, S[b], kb);
      }
      const h = new T.BufferGeometry();
      for (const n of noms) {
        const C = A[n].array.constructor;
        h.setAttribute(n, new T.BufferAttribute(new C(out[n]), A[n].itemSize, A[n].normalized));
      }
      g = h;
    }
    return g;
  };
  V.couper = (geo, plans) => sync(couperG(geo, plans));
  V.couperPas = (geo, plans) => async_(couperG(geo, plans));
  V.extraire = (g, tris) => {
    const h = new T.BufferGeometry();
    for (const [n, a] of Object.entries(g.attributes)) {
      const s = a.itemSize, C = a.array.constructor, o = new C(tris.length * 3 * s);
      tris.forEach((t, j) => {
        for (let k = 0; k < 3; k++) for (let c = 0; c < s; c++) o[(j * 3 + k) * s + c] = a.array[(t * 3 + k) * s + c];
      });
      h.setAttribute(n, new T.BufferAttribute(o, s, a.normalized));
    }
    return h;
  };
  V.combinaison = async (parties, couleur, o = {}) => {
    const C = await V.corps(o.sexe), sortie = [];
    for (const nom of parties) {
      const x = C.peaux[nom];
      let g = x.geometry.clone();
      for (const k of Object.keys(g.attributes)) if (!["position", "normal", "skinIndex", "skinWeight"].includes(k)) g.deleteAttribute(k);
      for (let k = 0; k < (o.sub ?? 1); k++) {
        g = V.subdiviser(g, 1);
        await pause();
      }
      const N0 = g.attributes.normal, P0 = g.attributes.position, gon = o.gonfle ?? 0.015;
      for (let i = 0; i < P0.count; i++) {
        const n2 = new T.Vector3().fromBufferAttribute(N0, i).normalize();
        N0.setXYZ(i, n2.x, n2.y, n2.z);
        P0.setXYZ(i, P0.getX(i) + n2.x * gon, P0.getY(i) + n2.y * gon, P0.getZ(i) + n2.z * gon);
      }
      g = await V.couperPas(g, (o.coupes || {})[nom] || o.coupes?.tout || []);
      await pause();
      const P = g.attributes.position, N = g.attributes.normal, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, groupes = /* @__PURE__ */ new Map(), p = new T.Vector3(), n = new T.Vector3();
      const osDom = (i) => {
        let b = 0, w = -1;
        for (let c = 0; c < 4; c++) if (SW.getComponent(i, c) > w) {
          w = SW.getComponent(i, c);
          b = SI.getComponent(i, c);
        }
        return C.sq.bones[b].name;
      };
      for (let t = 0; t < P.count / 3; t++) {
        p.set(0, 0, 0);
        n.set(0, 0, 0);
        for (let k = 0; k < 3; k++) {
          p.add(new T.Vector3().fromBufferAttribute(P, t * 3 + k));
          n.add(new T.Vector3().fromBufferAttribute(N, t * 3 + k));
        }
        p.multiplyScalar(1 / 3);
        n.normalize();
        const c = couleur(p, n, osDom(t * 3), nom);
        if (!c) continue;
        (groupes.get(c) || groupes.set(c, []).get(c)).push(t);
      }
      for (const [c, tris] of groupes) sortie.push([nom + "-" + c.replace("#", ""), V.extraire(g, tris), V.mat(nom + c, c, { rugosite: 0.8 })]);
    }
    return sortie;
  };
  V.lier = async (geo, osNom, o = {}) => {
    const C = await V.corps(o.sexe), i = C.sq.bones.findIndex((b) => b.name === osNom);
    if (i < 0) throw new Error("os " + osNom);
    const g = V.indexee(geo.index ? geo : geo), c = g.attributes.position.count;
    g.setAttribute("skinIndex", new T.Uint16BufferAttribute(new Array(c * 4).fill(0).map((_, k) => k % 4 ? 0 : i), 4));
    g.setAttribute("skinWeight", new T.Float32BufferAttribute(new Array(c * 4).fill(0).map((_, k) => k % 4 ? 0 : 1), 4));
    return g;
  };
  V.os = async (nom, o = {}) => {
    const C = await V.corps(o.sexe);
    const b = C.sq.bones.find((x) => x.name === nom);
    return new T.Vector3().setFromMatrixPosition(C.sq.boneInverses[C.sq.bones.indexOf(b)].clone().invert());
  };
  const indexerG = function* (g) {
    if (g.index) g = g.toNonIndexed();
    const A = g.attributes, noms = Object.keys(A).filter((n2) => ["position", "normal", "skinIndex", "skinWeight", "uv"].includes(n2)), n = A.position.count;
    const cles = /* @__PURE__ */ new Map(), idx = [], out = Object.fromEntries(noms.map((k) => [k, []]));
    for (let i = 0; i < n; i++) {
      if (!(i % 512)) yield;
      const v = noms.map((k) => Array.from({ length: A[k].itemSize }, (_, c) => +A[k].getComponent(i, c).toFixed(k === "skinIndex" ? 0 : 4)));
      const cle = v.map((x) => x.join(",")).join("|");
      let j = cles.get(cle);
      if (j === void 0) {
        j = cles.size;
        cles.set(cle, j);
        noms.forEach((k, q) => out[k].push(...v[q]));
      }
      idx.push(j);
    }
    const h = new T.BufferGeometry();
    for (const k of noms) {
      const C = A[k].array.constructor;
      h.setAttribute(k, new T.BufferAttribute(new C(out[k]), A[k].itemSize, A[k].normalized));
    }
    h.setIndex(idx);
    return h;
  };
  V.indexer = (g) => sync(indexerG(g));
  const construire = async (id) => {
    const a = Object.hasOwn(V.ARTICLES, id) ? V.ARTICLES[id] : null;
    if (!a?.peau) throw new Error("visiteurs : pas de recette pour " + id);
    const pieces = await a.modele(), C = await V.corps(a.sexe), s = E().clone(C.scene);
    let peau = null;
    const vieux = [];
    s.traverse((x) => {
      if (x.isSkinnedMesh) {
        vieux.push(x);
        if (!peau && x.skeleton.bones.some((b) => b.name === "chest")) peau = x;
      }
    });
    for (const x of vieux) x.removeFromParent();
    for (const [nom, g0, m] of pieces) {
      await pause();
      const g = a.brut ? g0 : await async_(indexerG(g0));
      const sm = new T.SkinnedMesh(g, m);
      sm.name = nom;
      sm.bind(peau.skeleton, peau.bindMatrix);
      s.add(sm);
    }
    s.updateMatrixWorld(true);
    return { scene: s };
  };
  window.__pcvVisiteursFabrique = { V, construire, pause };
})();
