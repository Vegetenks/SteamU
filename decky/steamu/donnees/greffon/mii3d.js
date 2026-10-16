(() => {
  const T = window.THREE;
  if (!T) return "mii3d : three.js absent";
  const hacher = (g) => {
    if (typeof g === "number") return (Math.imul(g | 0, 2654435761) ^ Math.floor(g * 977)) >>> 0 || 1;
    let h = 2166136261;
    for (const c of String(g)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return h >>> 0 || 1;
  };
  const hasard = (g) => {
    let a = hacher(g);
    return () => {
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  const borne = (x) => Math.max(0, Math.min(1, x));
  const lisse = (x) => (x = borne(x)) * x * (3 - 2 * x);
  const PALETTE = {
    couleurs: ["#d8231a", "#ff7a1f", "#ffd52a", "#86d63a", "#139447", "#1f56c4", "#41b4e0", "#f76b8a", "#7e36b8", "#6b4d2a", "#ececec", "#30333a"],
    peaux: ["#ffdcc2", "#ffc89e", "#efab7c", "#ffb9a3", "#c27e52", "#7a472c"],
    cheveux: ["#2a2320", "#4c3222", "#70301a", "#8f5c2d", "#a8a39c", "#5f4c26", "#c48d46", "#ebc77c"],
    yeux: ["#201c1a", "#6e6e6e", "#6e4a2a", "#76762e", "#3a6ccc", "#3a8c5c"],
    pantalons: ["#3d4554", "#323a48", "#4b505a"],
    chaussures: ["#2d2a2a", "#4b3727", "#3a3f4a"]
  };
  const R = 0.2, TETE_Y = 0.17;
  const CUISSE = 0.11, TIBIA = 0.095;
  const BRAS_SUSP = 2.42;
  const mesurer = (kh, kl) => {
    const d = {
      kh,
      kl,
      cheville: 0.05 * kh,
      genou: 0.145 * kh,
      hanche: 0.255 * kh,
      hancheX: 0.052 * kl,
      epauleY: 0.505 * kh,
      epauleX: 0.093 * kl,
      bras1: 0.1 * kh,
      bras2: 0.085 * kh,
      cou: 0.56 * kh
    };
    d.haut = d.cou + TETE_Y + R * 0.96 + 0.025;
    d.prise = d.epauleY - (d.bras1 + d.bras2 + 0.036) * Math.cos(BRAS_SUSP);
    return d;
  };
  const OS = { racine: 0, bassin: 1, torse: 2, tete: 3, epG: 4, coudeG: 5, epD: 6, coudeD: 7, hancheG: 8, genouG: 9, hancheD: 10, genouD: 11 };
  const TRONC = [[0, 0.215], [0.055, 0.219], [0.083, 0.232], [0.094, 0.255], [0.099, 0.277], [0.1, 0.284], [0.105, 0.29], [0.107, 0.3], [0.103, 0.335], [0.097, 0.38], [0.089, 0.43], [0.08, 0.47], [0.069, 0.503], [0.052, 0.532], [0.028, 0.553], [0, 0.562]];
  const CEINTURE = 0.287;
  const bord = (F, S, B, fest = 0, k = 0, asym = 0) => (ph) => {
    const a = Math.abs(ph);
    let h = a < Math.PI / 2 ? F + (S - F) * lisse(a / (Math.PI / 2)) : S + (B - S) * lisse((a - Math.PI / 2) / (Math.PI / 2));
    if (asym) h += asym * Math.sin(ph) * Math.max(0, Math.cos(ph));
    if (fest) h -= fest * (0.5 - 0.5 * Math.cos(ph * k)) * Math.max(0, Math.cos(ph)) ** 2;
    return h;
  };
  let Q = 1;
  const seg = (n, min = 3) => Math.max(min, Math.round(n * Q));
  const calotte = (hem, gonfle, nl = seg(12), nc = seg(36, 12)) => {
    const pos = [], idx = [];
    for (let i = 0; i <= nl; i++) for (let j = 0; j <= nc; j++) {
      const ph = -Math.PI + j / nc * 2 * Math.PI, h = hem(ph), th = h * i / nl, r = gonfle(th, ph, h);
      pos.push(r * Math.sin(th) * Math.sin(ph), r * Math.cos(th), r * Math.sin(th) * Math.cos(ph));
    }
    for (let i = 0; i < nl; i++) for (let j = 0; j < nc; j++) {
      const a = i * (nc + 1) + j, b = a + nc + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const n = g.attributes.normal, p = g.attributes.position, m = Math.floor(nl / 2) * (nc + 1) + Math.floor(nc / 2);
    if (n.getX(m) * p.getX(m) + n.getY(m) * p.getY(m) + n.getZ(m) * p.getZ(m) < 0) {
      const ix = g.index.array;
      for (let k = 0; k < ix.length; k += 3) {
        const s = ix[k + 1];
        ix[k + 1] = ix[k + 2];
        ix[k + 2] = s;
      }
      g.computeVertexNormals();
    }
    for (let i = 0; i <= nl; i++) {
      const a = i * (nc + 1), b = a + nc, v = new T.Vector3(n.getX(a) + n.getX(b), n.getY(a) + n.getY(b), n.getZ(a) + n.getZ(b)).normalize();
      n.setXYZ(a, v.x, v.y, v.z);
      n.setXYZ(b, v.x, v.y, v.z);
    }
    for (let j = 0; j <= nc; j++) n.setXYZ(j, 0, 1, 0);
    return g;
  };
  const boule = (r, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => {
    const g = new T.SphereGeometry(r, seg(16), seg(12)).scale(sx, sy, sz);
    if (rx) g.rotateX(rx);
    if (rz) g.rotateZ(rz);
    return g.translate(x, y, z);
  };
  const pique = (dir, l, r) => {
    const d = new T.Vector3(...dir).normalize(), g = new T.ConeGeometry(r, l, seg(8));
    g.translate(0, l / 2, 0).applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d));
    return g.translate(d.x * 0.92, d.y * 0.92, d.z * 0.92);
  };
  const evase = (v, e, de = 1.2) => (th, ph, h) => v + e * lisse((th - de) / Math.max(0.2, h - de));
  const COUPES = {
    courts: () => [calotte(bord(0.95, 1.4, 2.42, 0.1, 9), evase(1.065, 0.02))],
    frange: () => [calotte(bord(1.2, 1.5, 2.42, 0.12, 11), evase(1.07, 0.03))],
    raie: () => [calotte(bord(1.04, 1.44, 2.38, 0, 0, 0.3), (th, ph) => 1.07 + 0.04 * lisse(Math.sin(ph)) * Math.sin(th))],
    carre: () => [calotte(bord(1.16, 2.18, 2.22, 0.08, 13), evase(1.075, 0.14))],
    longs: () => [calotte(bord(1.02, 2.32, 2.4, 0, 0, 0.12), evase(1.07, 0.07)), boule(0.8, 0, -0.78, -0.4, 1.08, 1.05, 0.5)],
    queue: () => [calotte(bord(0.98, 1.45, 2.3, 0.08, 9), () => 1.06), boule(0.36, 0, -0.12, -1.12, 0.85, 1.55, 0.85, -0.45), boule(0.15, 0, 0.22, -1)],
    chignon: () => [calotte(bord(1, 1.45, 2.3, 0.06, 9), () => 1.06), boule(0.42, 0, 0.84, -0.6), boule(0.2, 0, 0.55, -0.82)],
    couettes: () => [calotte(bord(1.18, 1.5, 2.35, 0.1, 11), () => 1.07), boule(0.32, 1.06, -0.28, -0.25, 0.8, 1.35, 0.8, 0, 0.35), boule(0.32, -1.06, -0.28, -0.25, 0.8, 1.35, 0.8, 0, -0.35)],
    piques: () => [calotte(bord(0.92, 1.36, 2.3, 0.14, 7), () => 1.07), ...[[0, 1, 0.25], [0.55, 0.8, 0.1], [-0.55, 0.8, 0.1], [0.3, 0.85, -0.5], [-0.3, 0.85, -0.5], [0, 0.7, -0.75], [0.25, 0.95, 0.45], [-0.25, 0.95, 0.45]].map((d) => pique(d, 0.42, 0.2))],
    afro: () => [calotte(bord(0.98, 1.95, 2.28, 0.05, 15), evase(1.32, 0.04))],
    rase: () => [calotte(bord(0.86, 1.42, 2.36), () => 1.024)],
    houppe: () => [calotte(bord(0.9, 1.38, 2.4, 0.05, 9), () => 1.065), boule(0.46, 0.12, 0.9, 0.42, 1.05, 0.55, 0.95, -0.35, -0.15)]
  };
  const SANS_OREILLES = /* @__PURE__ */ new Set(["carre", "longs", "afro"]);
  const NEZ = [{ r: 0.09, s: [1, 0.85, 1.1] }, { r: 0.085, s: [0.85, 1.35, 1.15] }, { r: 0.11, s: [1.1, 0.9, 1] }];
  const fusionner = (P) => {
    let nv = 0, ni = 0;
    for (const p of P) {
      nv += p.g.attributes.position.count;
      ni += p.g.index.count;
    }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), si = new Uint16Array(nv * 4), sw = new Float32Array(nv * 4), br = new Float32Array(nv);
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let v = 0, i = 0;
    for (const p of P) {
      const a = p.g.attributes.position, n = p.g.attributes.normal, ix = p.g.index;
      for (let k = 0; k < a.count; k++) {
        const o = (v + k) * 3, y = a.getY(k), c = typeof p.c === "function" ? p.c(y) : p.c;
        pos[o] = a.getX(k);
        pos[o + 1] = y;
        pos[o + 2] = a.getZ(k);
        nor[o] = n.getX(k);
        nor[o + 1] = n.getY(k);
        nor[o + 2] = n.getZ(k);
        col[o] = c.r;
        col[o + 1] = c.g;
        col[o + 2] = c.b;
        si[(v + k) * 4] = p.os;
        sw[(v + k) * 4] = 1;
        br[v + k] = typeof p.b === "function" ? p.b(y) : p.b ?? 0.25;
      }
      for (let k = 0; k < ix.count; k++) idx[i + k] = ix.getX(k) + v;
      v += a.count;
      i += ix.count;
      p.g.dispose();
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(pos, 3));
    g.setAttribute("normal", new T.BufferAttribute(nor, 3));
    g.setAttribute("color", new T.BufferAttribute(col, 3));
    g.setAttribute("brille", new T.BufferAttribute(br, 1));
    g.setAttribute("skinIndex", new T.BufferAttribute(si, 4));
    g.setAttribute("skinWeight", new T.BufferAttribute(sw, 4));
    g.setIndex(new T.BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    return g;
  };
  const fabriquer = (d, D, q = 1) => {
    Q = q;
    const P = [], met = (g, os, c, b) => P.push({ g, os, c, b });
    const C = (h) => new T.Color(h), cH = C(d.couleur), cP = C(d.peau), cC = C(d.cheveux), cB = C(d.pantalon), cS = C(d.chaussures);
    met(new T.LatheGeometry(TRONC.map(([r, y]) => new T.Vector2(r * D.kl, y * D.kh)), seg(24, 10)).scale(1, 1, 0.8), OS.torse, (y) => y < CEINTURE * D.kh ? cB : cH);
    for (const s of [1, -1]) {
      const x = s * D.epauleX, coude = s > 0 ? OS.coudeG : OS.coudeD;
      met(new T.CapsuleGeometry(0.031, D.bras1, seg(4, 2), seg(10, 6)).translate(x, D.epauleY - D.bras1 / 2, 0), s > 0 ? OS.epG : OS.epD, cH);
      met(new T.CapsuleGeometry(0.029, D.bras2, seg(4, 2), seg(10, 6)).translate(x, D.epauleY - D.bras1 - D.bras2 / 2, 0), coude, cH);
      met(new T.SphereGeometry(0.041, seg(14, 6), seg(10, 5)).translate(x, D.epauleY - D.bras1 - D.bras2 - 0.03, 0), coude, cP, 0.9);
      const xh = s * D.hancheX, genou = s > 0 ? OS.genouG : OS.genouD;
      met(new T.CapsuleGeometry(0.039, D.hanche - D.genou, seg(4, 2), seg(10, 6)).translate(xh, (D.hanche + D.genou) / 2, 0), s > 0 ? OS.hancheG : OS.hancheD, cB);
      met(new T.CapsuleGeometry(0.036, D.genou - D.cheville, seg(4, 2), seg(10, 6)).translate(xh, (D.genou + D.cheville) / 2, 0), genou, cB);
      met(new T.SphereGeometry(0.045, seg(14, 6), seg(10, 5)).scale(1.04, 0.7, 1.55).translate(xh * 1.08, 0.031, 0.024), genou, cS, 0.6);
    }
    const yT = D.cou + TETE_Y, v = d.visage;
    met(new T.SphereGeometry(R, seg(36, 14), seg(26, 10)).scale(1, 0.96, 0.94).translate(0, yT, 0), OS.tete, cP, 1);
    if (!SANS_OREILLES.has(d.coupe)) for (const s of [1, -1]) met(new T.SphereGeometry(R * 0.2, seg(12, 5), seg(10, 4)).scale(0.55, 1, 0.85).translate(s * R * 0.965, yT - R * 0.06, -R * 0.02), OS.tete, cP, 0.8);
    const n = NEZ[v.nez], ny = v.nezY, nz = Math.sqrt(1 - ny * ny) * 0.94 * 0.955;
    met(new T.SphereGeometry(R * n.r, seg(12, 5), seg(10, 4)).scale(...n.s).translate(0, yT + R * ny * 0.96, R * nz), OS.tete, cP, 1);
    for (const g of COUPES[d.coupe]()) met(g.scale(R, R * 0.96, R * 0.94).translate(0, yT, 0), OS.tete, cC, 0.7);
    Q = 1;
    return fusionner(P);
  };
  const ETATS = ["neutre", "cligne", "joie", "surprise", "effort", "parle", "sourire", "inquiet"];
  const CLIGNABLES = /* @__PURE__ */ new Set(["neutre", "surprise", "parle", "sourire", "inquiet"]);
  const sombre = (h, k) => {
    const c = new T.Color(h);
    c.multiplyScalar(k);
    return "#" + c.getHexString();
  };
  const trait = (x, pts, ep, coul) => {
    x.beginPath();
    x.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 4) x.quadraticCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]);
    x.lineWidth = ep;
    x.strokeStyle = coul;
    x.stroke();
  };
  const ovale = (x, cx, cy, rx, ry) => {
    x.beginPath();
    x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  };
  const oeil = (x, cx, cy, v, etat, s) => {
    const k = v.yeux.k, nuit = "#2b211d";
    if (etat === "cligne") return trait(x, [cx - 0.085 * k, cy + 5e-3, cx, cy - 0.045 * k, cx + 0.085 * k, cy + 5e-3], 0.03, nuit);
    if (etat === "joie") return trait(x, [cx - 0.085 * k, cy - 0.03, cx, cy + 0.07 * k, cx + 0.085 * k, cy - 0.03], 0.034, nuit);
    if (etat === "effort") {
      const p = -Math.sign(cx);
      return trait(x, [cx - p * 0.07 * k, cy + 0.06 * k, cx - p * 0.02 * k, cy + 0.03 * k, cx + p * 0.06 * k, cy, cx - p * 0.02 * k, cy - 0.03 * k, cx - p * 0.07 * k, cy - 0.06 * k], 0.03, nuit);
    }
    const grand = etat === "surprise" ? 1.12 : 1, t = v.yeux.type, iris = v.yeux.couleur;
    if (t === 0) {
      const g = x.createLinearGradient(0, cy + 0.13 * k, 0, cy - 0.13 * k);
      g.addColorStop(0, sombre(iris, 0.35));
      g.addColorStop(1, sombre(iris, 0.8));
      ovale(x, cx, cy, 0.078 * k * grand, 0.118 * k * grand);
      x.fillStyle = g;
      x.fill();
      x.fillStyle = "#fff";
      ovale(x, cx + 0.026 * k, cy + 0.05 * k, 0.028 * k, 0.034 * k);
      x.fill();
      ovale(x, cx - 0.024 * k, cy - 0.055 * k, 0.012 * k, 0.012 * k);
      x.fill();
      return;
    }
    const rx = (t === 3 ? 0.088 : 0.1) * k * grand, ry = (t === 3 ? 0.11 : 0.082) * k * grand, lid = t === 4 ? cy + 0.025 * k : null;
    x.save();
    ovale(x, cx, cy, rx, ry);
    x.clip();
    if (lid != null) {
      x.beginPath();
      x.rect(cx - 1, lid - 2, 2, 2);
      x.clip();
    }
    x.fillStyle = "#fff";
    x.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
    x.fillStyle = iris;
    ovale(x, cx + s * 6e-3, cy - 4e-3, 0.068 * k, 0.068 * k * (t === 3 ? 1.25 : 1));
    x.fill();
    x.fillStyle = "#151515";
    ovale(x, cx + s * 6e-3, cy - 4e-3, 0.034 * k, 0.036 * k * (t === 3 ? 1.2 : 1));
    x.fill();
    x.fillStyle = "#fff";
    ovale(x, cx + 0.024 * k, cy + 0.026 * k, 0.019 * k, 0.021 * k);
    x.fill();
    x.restore();
    x.lineWidth = 0.016;
    x.strokeStyle = "rgba(60,40,35,.7)";
    ovale(x, cx, cy, rx, ry);
    x.stroke();
    const haut = [];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * (0.08 + 0.84 * i / 10);
      haut.push(cx - Math.cos(a) * rx, Math.min(lid ?? 9, cy + Math.sin(a) * ry));
    }
    x.beginPath();
    x.moveTo(haut[0], haut[1]);
    for (let i = 2; i < haut.length; i += 2) x.lineTo(haut[i], haut[i + 1]);
    x.lineWidth = 0.03;
    x.strokeStyle = nuit;
    x.stroke();
    if (t === 2) {
      const o = s;
      trait(x, [cx + o * rx * 0.8, cy + ry * 0.55, cx + o * (rx + 0.03), cy + ry * 0.85, cx + o * (rx + 0.05), cy + ry * 1.05], 0.02, nuit);
      trait(x, [cx + o * rx * 0.5, cy + ry * 0.85, cx + o * (rx * 0.65), cy + ry * 1.12, cx + o * (rx * 0.7), cy + ry * 1.3], 0.018, nuit);
    }
  };
  const peindre = (x, v, etat) => {
    x.lineCap = x.lineJoin = "round";
    const E = v.yeux.ecart, Y = v.yeux.y, sc = sombre(v.cheveux, 0.85);
    if (v.joues || etat === "joie" || etat === "sourire") {
      x.fillStyle = v.joues ? "rgba(255,110,120,.32)" : "rgba(255,120,120,.2)";
      for (const s of [-1, 1]) {
        ovale(x, s * (E + 0.16), Y - 0.27, 0.1, 0.062);
        x.fill();
      }
    }
    x.fillStyle = "rgba(150,70,50,.15)";
    ovale(x, 0, v.nezY - 0.1, 0.07, 0.028);
    x.fill();
    if (v.grain) {
      x.fillStyle = "#4a3326";
      ovale(x, 0.34, -0.36, 0.018, 0.018);
      x.fill();
    }
    const sy = v.sourcils.y + (etat === "surprise" ? 0.06 : 0), ep = v.sourcils.ep;
    for (const s of [-1, 1]) {
      const cx = s * E, int = cx - s * 0.085, ext = cx + s * 0.085;
      const yi = sy + (etat === "inquiet" ? 0.05 : etat === "effort" ? -0.04 : 0) + v.sourcils.pente, ye = sy - v.sourcils.pente + (etat === "inquiet" ? -0.03 : 0);
      trait(x, [int, yi, cx, Math.max(yi, ye) + v.sourcils.arc, ext, ye], ep, sc);
    }
    for (const s of [-1, 1]) oeil(x, s * E, Y, v, etat, s);
    const by = v.bouche.y, L = v.bouche.l, levre = v.bouche.couleur;
    if (etat === "joie" || etat === "sourire") {
      x.beginPath();
      x.moveTo(-L * 1.05, by + 0.02);
      x.quadraticCurveTo(0, by - 0.02, L * 1.05, by + 0.02);
      x.quadraticCurveTo(L * 0.7, by - 0.17, 0, by - 0.17);
      x.quadraticCurveTo(-L * 0.7, by - 0.17, -L * 1.05, by + 0.02);
      x.fillStyle = "#6b1a1c";
      x.fill();
      x.save();
      x.clip();
      x.fillStyle = "#e8737a";
      ovale(x, 0, by - 0.16, L * 0.62, 0.06);
      x.fill();
      x.fillStyle = "#fff";
      x.fillRect(-L, by - 0.025, L * 2, 0.035);
      x.restore();
      x.lineWidth = 0.014;
      x.strokeStyle = sombre(levre, 0.7);
      x.stroke();
    } else if (etat === "surprise") {
      x.fillStyle = "#6b1a1c";
      ovale(x, 0, by - 0.04, 0.05, 0.066);
      x.fill();
      x.fillStyle = "#e8737a";
      ovale(x, 0, by - 0.085, 0.03, 0.018);
      x.fill();
    } else if (etat === "parle") {
      x.fillStyle = "#6b1a1c";
      ovale(x, 0, by - 0.03, L * 0.55, 0.045);
      x.fill();
      x.fillStyle = "#e8737a";
      ovale(x, 0, by - 0.055, L * 0.35, 0.016);
      x.fill();
    } else if (etat === "effort") {
      x.fillStyle = "#fff";
      x.beginPath();
      x.roundRect(-L * 0.85, by - 0.065, L * 1.7, 0.065, 0.025);
      x.fill();
      x.lineWidth = 0.016;
      x.strokeStyle = "#5a2a28";
      x.stroke();
      x.beginPath();
      x.moveTo(-L * 0.85, by - 0.032);
      x.lineTo(L * 0.85, by - 0.032);
      x.lineWidth = 0.01;
      x.stroke();
    } else if (etat === "inquiet") trait(x, [-L * 0.7, by - 0.05, 0, by + 0.02, L * 0.7, by - 0.05], 0.03, sombre(levre, 0.8));
    else {
      trait(x, [-L, by, 0, by - 0.085 - v.bouche.sourire, L, by], 0.032, sombre(levre, 0.85));
      if (v.bouche.levres) trait(x, [-L * 0.6, by - 0.055, 0, by - 0.085, L * 0.6, by - 0.055], 0.018, "rgba(220,90,90,.55)");
    }
    if (v.moustache) {
      x.fillStyle = sc;
      for (const s of [-1, 1]) {
        x.save();
        x.translate(s * 0.075, v.nezY - 0.135);
        x.rotate(s * -0.25);
        ovale(x, 0, 0, 0.085, 0.034);
        x.fill();
        x.restore();
      }
    }
    if (v.lunettes) {
      x.lineWidth = 0.028;
      x.strokeStyle = v.lunettes.couleur;
      x.fillStyle = "rgba(255,255,255,.1)";
      for (const s of [-1, 1]) {
        x.beginPath();
        if (v.lunettes.rondes) x.ellipse(s * E, Y, 0.145, 0.13, 0, 0, Math.PI * 2);
        else x.roundRect(s * E - 0.15, Y - 0.11, 0.3, 0.22, 0.06);
        x.fill();
        x.stroke();
        trait(x, [s * E - 0.07, Y + 0.05, s * E - 0.06, Y + 0.06, s * E - 0.03, Y + 0.085], 0.016, "rgba(255,255,255,.75)");
      }
      trait(x, [-E + 0.14, Y + 0.03, 0, Y + 0.06, E - 0.14, Y + 0.03], 0.024, v.lunettes.couleur);
    }
  };
  const PLANCHES = /* @__PURE__ */ new Map();
  const planche = (v, res) => {
    const cle = res + JSON.stringify(v);
    if (PLANCHES.has(cle)) return PLANCHES.get(cle);
    const cv = document.createElement("canvas");
    cv.width = res * 4;
    cv.height = res * 2;
    const x = cv.getContext("2d");
    ETATS.forEach((e, k) => {
      x.save();
      x.translate(k % 4 * res + res / 2, Math.floor(k / 4) * res + res / 2);
      x.scale(res / 2, -res / 2);
      peindre(x, v, e);
      x.restore();
    });
    const t = new T.CanvasTexture(cv);
    t.colorSpace = T.SRGBColorSpace;
    t.repeat.set(0.25, 0.5);
    t.anisotropy = 4;
    if (PLANCHES.size > 60) {
      const [k0, t0] = PLANCHES.entries().next().value;
      PLANCHES.delete(k0);
      t0.dispose();
    }
    PLANCHES.set(cle, t);
    return t;
  };
  const geoVisage = {};
  const calotteVisage = (fin = 1) => geoVisage[fin] ||= (() => {
    const g = new T.SphereGeometry(1, Math.round(26 * fin), Math.round(18 * fin), Math.PI / 2 - 1.18, 2.36, 0.42, 2), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 + p.getX(i) / 2, 0.5 + p.getY(i) / 2);
    return g.scale(R * 1.006, R * 0.96 * 1.006, R * 0.94 * 1.006).translate(0, TETE_Y, 0);
  })();
  let rampe = null, matCorps = null, texOmbre = null;
  const degrade = () => rampe ||= (() => {
    const t = new T.DataTexture(new Uint8Array([96, 104, 120, 156, 200, 232, 248, 255]), 8, 1, T.RedFormat);
    t.minFilter = t.magFilter = T.LinearFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  })();
  const lumiereDeBord = (m, force, brillance = 0.11) => {
    m.onBeforeCompile = (s) => {
      s.vertexShader = "attribute float brille;\nvarying float vBrille;\n" + s.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n  vBrille = brille;");
      s.uniforms.pcvBord = { value: new T.Color("#fffaf2") };
      s.uniforms.pcvBordForce = { value: force };
      s.uniforms.pcvBrillance = { value: brillance };
      s.fragmentShader = "uniform vec3 pcvBord;\nuniform float pcvBordForce;\nuniform float pcvBrillance;\nvarying float vBrille;\n" + s.fragmentShader.replace(
        "#include <opaque_fragment>",
        "  float pcvR = 1.0 - clamp(dot(normal, isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(vViewPosition)), 0.0, 1.0);\n  outgoingLight += pcvBord * pcvBordForce * smoothstep(0.58, 1.0, pcvR);\n  vec3 pcvVue = isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(vViewPosition);\n  float pcvS = pow(max(dot(normal, normalize(vec3(-0.35, 0.55, 0.75) + pcvVue)), 0.0), 36.0);\n  outgoingLight += vec3(1.0) * pcvBrillance * vBrille * smoothstep(0.25, 0.9, pcvS);\n#include <opaque_fragment>"
      );
    };
    m.customProgramCacheKey = () => "pcv-mii-bord-" + force + "-" + brillance;
    return m;
  };
  const materiauCorps = () => matCorps ||= lumiereDeBord(new T.MeshToonMaterial({ vertexColors: true, gradientMap: degrade(), side: T.DoubleSide }), 0.32);
  const ombreTexture = () => texOmbre ||= (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(40,55,80,1)");
    g.addColorStop(0.55, "rgba(40,55,80,.5)");
    g.addColorStop(1, "rgba(40,55,80,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(c);
  })();
  const K = {
    bx: 0,
    by: 1,
    bz: 2,
    brx: 3,
    bry: 4,
    brz: 5,
    tx: 6,
    ty: 7,
    tz: 8,
    hx: 9,
    hy: 10,
    hz: 11,
    egx: 12,
    egy: 13,
    egz: 14,
    cg: 15,
    edx: 16,
    edy: 17,
    edz: 18,
    cd: 19,
    hgx: 20,
    hgz: 21,
    gg: 22,
    hdx: 23,
    hdz: 24,
    gd: 25,
    ech: 26,
    rx: 27,
    rz: 28
  };
  const NC = 29, NEUTRE = new Float32Array(NC);
  NEUTRE[K.ech] = 1;
  NEUTRE[K.egz] = NEUTRE[K.edz] = 0.24;
  NEUTRE[K.cg] = NEUTRE[K.cd] = 0.14;
  NEUTRE[K.egx] = NEUTRE[K.edx] = -0.04;
  NEUTRE[K.hgz] = NEUTRE[K.hdz] = 0.03;
  const accroupir = (P, a, m) => {
    const b = a + Math.asin(Math.min(1, CUISSE * Math.sin(a) / TIBIA));
    P[K.hgx] = P[K.hdx] = -a;
    P[K.gg] = P[K.gd] = b;
    P[K.by] = -(CUISSE + TIBIA - CUISSE * Math.cos(a) - TIBIA * Math.cos(b - a)) * m.D.kh;
    P[K.tx] = 0.5 * a;
  };
  const PI2 = Math.PI * 2;
  const ANIMS = {
    repos: (P, t, m) => {
      const s = Math.sin(t * 2.1 + m.ph), r = Math.sin(t * 0.43 + m.ph * 2);
      P[K.by] = -4e-3 - 4e-3 * s;
      P[K.tx] = 0.02 * s;
      P[K.egz] = 0.24 + 0.025 * s;
      P[K.edz] = 0.24 + 0.025 * s;
      P[K.hy] = 0.1 * Math.sin(t * 0.37 + m.ph);
      P[K.hz] = 0.04 * r;
      P[K.brz] = 0.025 * r;
      P[K.bx] = 5e-3 * r;
    },
    marcher: (P, t, m) => {
      const c = t * PI2 * 1.7 * m.cadence + m.ph, s = Math.sin(c), co = Math.cos(c);
      P[K.hgx] = -0.5 * s;
      P[K.hdx] = 0.5 * s;
      P[K.gg] = 0.1 + 0.8 * Math.max(0, co) ** 1.4;
      P[K.gd] = 0.1 + 0.8 * Math.max(0, -co) ** 1.4;
      P[K.egx] = 0.42 * s;
      P[K.edx] = -0.42 * s;
      P[K.cg] = P[K.cd] = 0.35;
      P[K.egz] = P[K.edz] = 0.2;
      P[K.by] = 0.012 * co * co - 0.012;
      P[K.brz] = 0.045 * s;
      P[K.ty] = 0.1 * s;
      P[K.hy] = -0.07 * s;
      P[K.tx] = 0.06;
      P[K.hz] = 0.03 * s;
    },
    courir: (P, t, m) => {
      const c = t * PI2 * 2.6 * m.cadence + m.ph, s = Math.sin(c), co = Math.cos(c);
      P[K.hgx] = -0.85 * s - 0.15;
      P[K.hdx] = 0.85 * s - 0.15;
      P[K.gg] = 0.3 + 1.4 * Math.max(0, co) ** 1.2;
      P[K.gd] = 0.3 + 1.4 * Math.max(0, -co) ** 1.2;
      P[K.egx] = 0.85 * s;
      P[K.edx] = -0.85 * s;
      P[K.cg] = P[K.cd] = 1.5;
      P[K.egz] = P[K.edz] = 0.3;
      P[K.by] = 0.03 * Math.abs(co) - 0.03;
      P[K.ty] = 0.15 * s;
      P[K.tx] = 0.24;
      P[K.hx] = -0.12;
      P[K.brz] = 0.03 * s;
    },
    // saut : la phase (accroupi, vol, réception) est tenue par celui qui déplace le Mii, dans m.saut = { ph, q }
    sauter: (P, t, m) => {
      const s = m.saut || { ph: "vol", q: 0.5 }, q = s.q;
      if (s.ph === "prep") {
        accroupir(P, 0.62 * lisse(q), m);
        P[K.egx] = P[K.edx] = 0.7 * lisse(q);
        P[K.ech] = 1 - 0.1 * lisse(q);
        P[K.hx] = -0.15;
        return;
      }
      if (s.ph === "recep") {
        const e = Math.sin(Math.min(1, q * 1.15) * Math.PI);
        accroupir(P, 0.55 * e, m);
        P[K.ech] = 1 - 0.2 * e;
        P[K.egz] = P[K.edz] = 0.24 + 0.9 * e;
        P[K.egx] = P[K.edx] = -0.3 * e;
        return;
      }
      const monte = 1 - lisse(q * 1.6);
      P[K.ech] = 1 + 0.14 * Math.max(0, 1 - q * 3);
      P[K.egz] = P[K.edz] = 0.8 + 1.5 * monte;
      P[K.egx] = P[K.edx] = -0.35 * monte;
      P[K.cg] = P[K.cd] = 0.3;
      P[K.hgx] = -1 * Math.sin(Math.min(1, q * 1.3) * Math.PI);
      P[K.gg] = 1.4 * Math.sin(Math.min(1, q * 1.3) * Math.PI) + 0.1;
      P[K.hdx] = 0.3 * monte - 0.1;
      P[K.gd] = 0.35;
      P[K.tx] = -0.06;
      P[K.hx] = -0.18 * monte;
      if (s.saisir) {
        P[K.egz] = P[K.edz] = BRAS_SUSP;
        P[K.egx] = P[K.edx] = -0.05;
        P[K.cg] = P[K.cd] = 0.1;
        P[K.hx] = -0.25;
      }
    },
    // bras tendus vers la prise
    saluer: (P, t, m) => {
      ANIMS.repos(P, t, m);
      const w = Math.sin(t * PI2 * 1.8);
      P[K.edz] = 2.45 + 0.34 * w;
      P[K.edx] = -0.28;
      P[K.cd] = 0.3 + 0.2 * w;
      P[K.hz] = -0.1;
      P[K.tz] = 0.04;
      P[K.by] += 6e-3 * Math.abs(w);
    },
    applaudir: (P, t, m) => {
      ANIMS.repos(P, t, m);
      const c = 0.5 + 0.5 * Math.sin(t * PI2 * 3.1);
      P[K.egx] = P[K.edx] = -1.18;
      P[K.egz] = P[K.edz] = -0.34 + 0.32 * c;
      P[K.cg] = P[K.cd] = 0.45;
      P[K.by] = -8e-3 + 0.014 * Math.abs(Math.sin(t * PI2 * 1.55));
      P[K.hx] = -0.1;
    },
    content: (P, t, m) => {
      const b = Math.abs(Math.sin(t * PI2 * 1.6));
      P[K.by] = 0.045 * b;
      P[K.egz] = 2.5 + 0.25 * Math.sin(t * 15);
      P[K.edz] = 2.5 + 0.25 * Math.sin(t * 15 + 1.5);
      P[K.cg] = P[K.cd] = 0.25;
      P[K.hgx] = -0.25 * b;
      P[K.gg] = 0.45 * b;
      P[K.hdx] = -0.1 * b;
      P[K.gd] = 0.2 * b;
      P[K.hx] = -0.15;
      P[K.hz] = 0.1 * Math.sin(t * 6);
    },
    danser: (P, t, m) => {
      const c = t * PI2 * 1.3, s = Math.sin(c);
      P[K.bx] = 0.025 * s;
      P[K.brz] = 0.08 * s;
      P[K.tz] = -0.12 * s;
      P[K.hz] = 0.14 * s;
      P[K.egz] = 1.3 + 0.5 * s;
      P[K.edz] = 1.3 - 0.5 * s;
      P[K.cg] = P[K.cd] = 1.1;
      P[K.by] = -0.012 * Math.abs(Math.cos(c));
      P[K.gg] = 0.3 * Math.max(0, s);
      P[K.gd] = 0.3 * Math.max(0, -s);
      P[K.hgx] = -0.15 * Math.max(0, s);
      P[K.hdx] = -0.15 * Math.max(0, -s);
    },
    parler: (P, t, m) => {
      ANIMS.repos(P, t, m);
      const g = Math.sin(t * 3.1 + m.ph);
      P[K.edx] = -0.7 - 0.25 * g;
      P[K.edz] = 0.35;
      P[K.cd] = 1.1 + 0.3 * Math.sin(t * 4.3);
      P[K.egx] = -0.3 * Math.max(0, -g);
      P[K.cg] = 0.4 + 0.4 * Math.max(0, -g);
      P[K.hz] = 0.08 * g;
      P[K.hx] = 0.04 * Math.sin(t * 5);
    },
    // assis sur un bord, jambes pendantes : le point d'ancrage est sous les fesses
    assis: (P, t, m) => {
      const bal = Math.sin(t * 2.6 + m.ph);
      P[K.by] = -(m.D.hanche - 0.034 * m.D.kh);
      P[K.hgx] = P[K.hdx] = -1.5;
      P[K.gg] = 1.38 + 0.32 * bal;
      P[K.gd] = 1.38 - 0.32 * bal;
      P[K.hgz] = P[K.hdz] = 0.12;
      P[K.egx] = P[K.edx] = -0.3;
      P[K.egz] = P[K.edz] = 0.45;
      P[K.cg] = P[K.cd] = 0.25;
      P[K.tx] = -0.04 + 0.015 * Math.sin(t * 1.7);
      P[K.hy] = 0.16 * Math.sin(t * 0.5 + m.ph);
    },
    // assis par terre, jambes allongées devant, mains posées derrière (le point d'ancrage reste au sol)
    assisSol: (P, t, m) => {
      P[K.by] = -(m.D.hanche - 0.045 * m.D.kh);
      P[K.hgx] = P[K.hdx] = -1.45;
      P[K.gg] = 0.12 + 0.08 * Math.sin(t * 1.3 + m.ph);
      P[K.gd] = 0.18;
      P[K.hgz] = P[K.hdz] = 0.1;
      P[K.egx] = P[K.edx] = 0.55;
      P[K.egz] = P[K.edz] = 0.35;
      P[K.cg] = P[K.cd] = 0.1;
      P[K.tx] = -0.12;
      P[K.hy] = 0.22 * Math.sin(t * 0.4 + m.ph);
      P[K.hx] = -0.05;
    },
    // suspendu par les mains : le point d'ancrage est entre les mains ; le corps se balance autour
    suspendu: (P, t, m) => {
      const b = Math.sin(t * 2.3 + m.ph), k = Math.sin(t * 3.3);
      P[K.by] = -m.D.prise;
      P[K.egz] = P[K.edz] = BRAS_SUSP;
      P[K.egx] = P[K.edx] = -0.04;
      P[K.cg] = P[K.cd] = 0.06;
      P[K.rz] = 0.11 * b * (m.amplitude ?? 1);
      P[K.hgx] = -0.28 * k - 0.15;
      P[K.hdx] = 0.28 * k - 0.15;
      P[K.gg] = P[K.gd] = 0.35;
      P[K.hx] = -0.22;
      P[K.tx] = 0.03;
    },
    hisser: (P, t, m) => {
      const q = lisse(m.hisse ?? t / 0.7);
      P[K.by] = -m.D.prise * (1 - 0.5 * q);
      P[K.egz] = P[K.edz] = BRAS_SUSP - 0.9 * q;
      P[K.egx] = P[K.edx] = -0.3 * q;
      P[K.cg] = P[K.cd] = 0.06 + 1.9 * q;
      P[K.hgx] = -1.1 * q;
      P[K.gg] = 1.3 * q;
      P[K.hdx] = -0.4 * q;
      P[K.gd] = 0.8 * q;
      P[K.hx] = -0.25 + 0.25 * q;
      P[K.tx] = 0.25 * q;
    },
    tomber: (P, t, m) => {
      const f = Math.sin(t * 16), g = Math.sin(t * 13 + 1);
      P[K.egz] = 2 + 0.45 * f;
      P[K.edz] = 2 + 0.45 * g;
      P[K.cg] = 0.5 + 0.3 * g;
      P[K.cd] = 0.5 + 0.3 * f;
      P[K.hgx] = -0.5 + 0.4 * g;
      P[K.hdx] = -0.2 - 0.4 * f;
      P[K.gg] = 0.6 + 0.3 * f;
      P[K.gd] = 0.6 - 0.3 * g;
      P[K.hx] = 0.12;
      P[K.ech] = 1.03;
    },
    rattraper: (P, t, m) => {
      const a = Math.exp(-t * 3.2);
      accroupir(P, 0.5 * a + 0.04, m);
      P[K.egz] = P[K.edz] = 1.25 * a + 0.24;
      P[K.tz] = 0.22 * a * Math.sin(t * 11);
      P[K.rz] = 0.05 * a * Math.sin(t * 9);
      P[K.hz] = -0.2 * a * Math.sin(t * 7);
    },
    // se pencher pour regarder (sens = ±1 sur le côté, 0 = en avant)
    pencher: (P, t, m) => {
      const s = m.sens ?? 1, q = lisse(t * 2.2);
      if (!s) {
        accroupir(P, 0.3 * q, m);
        P[K.tx] = 0.55 * q;
        P[K.hx] = 0.25 * q;
        P[K.egx] = P[K.edx] = -0.5 * q;
        P[K.cg] = P[K.cd] = 0.3;
        P[K.hy] = 0.15 * Math.sin(t * 0.9);
        return;
      }
      P[K.tz] = -0.45 * s * q;
      P[K.brz] = -0.1 * s * q;
      P[K.bx] = 0.02 * s * q;
      P[K.hz] = -0.2 * s * q;
      P[K.hy] = 0.25 * s * q + 0.1 * Math.sin(t * 1.1);
      if (s > 0) {
        P[K.egz] = 0.24 + 0.7 * q;
        P[K.hdz] = 0.03 + 0.2 * q;
      } else {
        P[K.edz] = 0.24 + 0.7 * q;
        P[K.hgz] = 0.03 + 0.2 * q;
      }
    },
    pousser: (P, t, m) => {
      const c = t * PI2 * 1.1, s = Math.sin(c), co = Math.cos(c);
      P[K.tx] = 0.4;
      P[K.egx] = P[K.edx] = -1.4;
      P[K.egz] = P[K.edz] = -0.04;
      P[K.cg] = P[K.cd] = 0.3 + 0.12 * Math.sin(c * 2);
      P[K.hx] = -0.25;
      P[K.hgx] = -0.3 - 0.3 * s;
      P[K.hdx] = -0.3 + 0.3 * s;
      P[K.gg] = 0.3 + 0.5 * Math.max(0, co);
      P[K.gd] = 0.3 + 0.5 * Math.max(0, -co);
      P[K.by] = -0.02;
    },
    hausser: (P, t, m) => {
      ANIMS.repos(P, t, m);
      const q = Math.sin(Math.min(1, t / 1.1) * Math.PI);
      P[K.egz] = P[K.edz] = 0.24 + 0.9 * q;
      P[K.egx] = P[K.edx] = -0.5 * q;
      P[K.cg] = P[K.cd] = 0.14 + 1.2 * q;
      P[K.by] += 0.01 * q;
      P[K.hz] = 0.15 * q;
    }
  };
  const EXPRESSIONS = { saluer: "sourire", applaudir: "joie", content: "joie", danser: "joie", tomber: "surprise", pousser: "effort", rattraper: "inquiet", hisser: "effort", parler: "parle", hausser: "inquiet" };
  const decrire = (o) => {
    const r = hasard(o.graine ?? Math.floor(Math.random() * 1e9)), p = (l) => l[Math.floor(r() * l.length)];
    const coupes = Object.keys(COUPES), coupe = o.coupe && COUPES[o.coupe] ? o.coupe : p(coupes), cheveux = o.cheveux ?? p(PALETTE.cheveux);
    return {
      couleur: o.couleur ?? p(PALETTE.couleurs),
      peau: o.peau ?? p(PALETTE.peaux),
      cheveux,
      coupe,
      pantalon: o.pantalon ?? p(PALETTE.pantalons),
      chaussures: p(PALETTE.chaussures),
      hauteur: o.hauteur ?? 0.9 + r() * 0.18,
      largeur: o.largeur ?? 0.88 + r() * 0.34,
      visage: {
        yeux: { type: r() < 0.38 ? 0 : 1 + Math.floor(r() * 4), couleur: p(PALETTE.yeux), ecart: 0.28 + r() * 0.06, y: -0.05 + r() * 0.07, k: 1.02 + r() * 0.24 },
        sourcils: { y: 0.24 + r() * 0.07, ep: 0.028 + r() * 0.026, pente: r() * 0.035 - 8e-3, arc: 0.01 + r() * 0.035 },
        bouche: { y: -0.46 + r() * 0.07, l: 0.12 + r() * 0.05, sourire: r() * 0.03, couleur: p(["#9a3b34", "#b04848", "#8a4038"]), levres: r() < 0.25 },
        nez: Math.floor(r() * NEZ.length),
        nezY: -0.2 - r() * 0.06,
        cheveux,
        joues: r() < 0.3,
        grain: r() < 0.1,
        moustache: r() < 0.08,
        lunettes: r() < 0.14 ? { couleur: p(["#2d2d33", "#7a4a2a", "#c03030", "#2a5ab0"]), rondes: r() < 0.5 } : null
      },
      graine: o.graine
    };
  };
  const creer = (o = {}) => {
    const d = decrire(o), D = mesurer(d.hauteur, d.largeur);
    const os = Array.from({ length: 12 }, () => new T.Bone());
    const lier = (e, p, x, y, z) => {
      os[p].add(os[e]);
      os[e].position.set(x, y, z);
    };
    lier(1, 0, 0, D.hanche, 0);
    lier(2, 1, 0, 0, 0);
    lier(3, 2, 0, D.cou - D.hanche, 0);
    lier(4, 2, D.epauleX, D.epauleY - D.hanche, 0);
    lier(5, 4, 0, -D.bras1, 0);
    lier(6, 2, -D.epauleX, D.epauleY - D.hanche, 0);
    lier(7, 6, 0, -D.bras1, 0);
    lier(8, 1, D.hancheX, 0, 0);
    lier(9, 8, 0, D.genou - D.hanche, 0);
    lier(10, 1, -D.hancheX, 0, 0);
    lier(11, 10, 0, D.genou - D.hanche, 0);
    const fin = o.qualite === "basse" ? 0.45 : 1;
    const corps = new T.SkinnedMesh(fabriquer(d, D, fin), materiauCorps());
    corps.frustumCulled = false;
    corps.add(os[0]);
    corps.updateMatrixWorld(true);
    corps.bind(new T.Skeleton(os));
    const tex = planche(d.visage, o.qualite === "haute" ? 256 : 128);
    const matVisage = new T.MeshToonMaterial({ map: tex, gradientMap: degrade(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 });
    const visage = new T.Mesh(calotteVisage(fin < 1 ? 0.62 : 1), matVisage);
    visage.frustumCulled = false;
    os[OS.tete].add(visage);
    const objet = new T.Group(), salto = new T.Group(), dessous = new T.Group();
    salto.position.y = 0.42 * D.kh;
    dessous.position.y = -0.42 * D.kh;
    objet.add(salto);
    salto.add(dessous);
    dessous.add(corps);
    const ombre = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: ombreTexture(), transparent: true, depthWrite: false, opacity: 0.3 }));
    ombre.rotation.x = -Math.PI / 2;
    ombre.renderOrder = -1;
    const PA = new Float32Array(NC), PB = new Float32Array(NC);
    const m = {
      objet,
      corps,
      visage,
      ombre,
      salto,
      os,
      d,
      D,
      ph: Math.random() * 6.3,
      cadence: 0.95 + Math.random() * 0.12,
      anim: "repos",
      t: 0,
      ancienne: null,
      tAnc: 0,
      fondu: 1,
      fonduDuree: 0.25,
      vitesse: 1,
      cap: 0,
      capVise: 0,
      triche: 0,
      inclinaison: 0,
      regard: null,
      rg: { x: 0, y: 0 },
      expr: null,
      cellule: 0,
      cligne: 0,
      prochain: 1 + Math.random() * 3,
      action: null,
      saut: null,
      sol: null,
      taille: 1,
      bras: null,
      kBras: 0,
      tBras: 0
    };
    matVisage.userData.mii = m;
    visage.onBeforeRender = () => {
      tex.offset.set(m.cellule % 4 * 0.25, m.cellule < 4 ? 0.5 : 0);
      tex.updateMatrix();
    };
    m.jouer = (nom, opt = {}) => {
      if (!ANIMS[nom]) return m;
      if (nom === m.anim && !opt.redemarrer) return m;
      const f = opt.fondu ?? 0.25;
      if (f > 0) {
        m.ancienne = m.anim;
        m.tAnc = m.t;
        m.fondu = 0;
        m.fonduDuree = f;
      } else m.ancienne = null;
      m.anim = nom;
      m.t = 0;
      m.vitesse = opt.vitesse ?? 1;
      return m;
    };
    m.expression = (e) => {
      m.expr = e && ETATS.includes(e) ? e : null;
      return m;
    };
    m.regarder = (v) => {
      m.regard = v ? (m.regard || new T.Vector3()).copy(v) : null;
      return m;
    };
    m.regler = (taille) => {
      m.taille = taille;
      objet.scale.setScalar(taille / D.haut);
      return m;
    };
    m.viser = (dx, dz) => {
      if (Math.abs(dx) + Math.abs(dz) < 1e-6) return;
      const a = Math.atan2(dx, dz);
      m.capVise = a * (1 - m.triche);
    };
    const appliquer = (P) => {
      const [r0, b, t, h, eg, cg, ed, cd, hg, gg, hd, gd] = os, e = P[K.ech];
      r0.scale.set(1 / Math.sqrt(e), e, 1 / Math.sqrt(e));
      r0.rotation.set(P[K.rx], 0, P[K.rz]);
      b.position.set(P[K.bx], D.hanche + P[K.by], P[K.bz]);
      b.rotation.set(P[K.brx], P[K.bry], P[K.brz]);
      t.rotation.set(P[K.tx], P[K.ty], P[K.tz]);
      h.rotation.set(P[K.hx] + m.rg.x, P[K.hy] + m.rg.y, P[K.hz]);
      eg.rotation.set(P[K.egx], P[K.egy], P[K.egz]);
      cg.rotation.x = -P[K.cg];
      ed.rotation.set(P[K.edx], -P[K.edy], -P[K.edz]);
      cd.rotation.x = -P[K.cd];
      hg.rotation.set(P[K.hgx], 0, P[K.hgz]);
      gg.rotation.x = P[K.gg];
      hd.rotation.set(P[K.hdx], 0, -P[K.hdz]);
      gd.rotation.x = P[K.gd];
    };
    const vise = new T.Vector3(), inv = new T.Matrix4();
    m.maj = (dt) => {
      dt = Math.min(dt, 0.1);
      if (m.action) m.action.maj(dt);
      m.t += dt * m.vitesse;
      PB.set(NEUTRE);
      ANIMS[m.anim](PB, m.t, m);
      if (m.ancienne) {
        m.tAnc += dt;
        m.fondu += dt / m.fonduDuree;
        if (m.fondu >= 1) m.ancienne = null;
        else {
          PA.set(NEUTRE);
          ANIMS[m.ancienne](PA, m.tAnc, m);
          const w = lisse(m.fondu);
          for (let i = 0; i < NC; i++) PB[i] = PA[i] + (PB[i] - PA[i]) * w;
        }
      }
      m.kBras += ((m.bras === "salut" ? 1 : 0) - m.kBras) * (1 - Math.exp(-dt * 8));
      m.tBras += dt;
      if (m.kBras > 0.01) {
        const w = Math.sin(m.tBras * PI2 * 1.8), k = m.kBras;
        PB[K.edz] += (2.45 + 0.34 * w - PB[K.edz]) * k;
        PB[K.edx] += (-0.28 - PB[K.edx]) * k;
        PB[K.cd] += (0.3 + 0.2 * w - PB[K.cd]) * k;
        PB[K.edy] *= 1 - k;
      }
      let gx = 0, gy = 0;
      if (m.regard) {
        inv.copy(os[OS.torse].matrixWorld).invert();
        vise.copy(m.regard).applyMatrix4(inv);
        vise.y -= D.cou - D.hanche + TETE_Y;
        const yaw = Math.atan2(vise.x, vise.z);
        if (Math.abs(yaw) < 1.9) {
          gy = Math.max(-0.8, Math.min(0.8, yaw)) - PB[K.hy] * 0.5;
          gx = Math.max(-0.5, Math.min(0.45, -Math.atan2(vise.y, Math.hypot(vise.x, vise.z))));
        }
      }
      if (m.regardMax != null) gy = Math.max(-m.regardMax - m.cap, Math.min(m.regardMax - m.cap, gy));
      const kr = 1 - Math.exp(-dt * 7);
      m.rg.x += (gx - m.rg.x) * kr;
      m.rg.y += (gy - m.rg.y) * kr;
      appliquer(PB);
      let dc = m.capVise - m.cap;
      dc = Math.atan2(Math.sin(dc), Math.cos(dc));
      m.cap += dc * (1 - Math.exp(-dt * 9));
      objet.rotation.set(m.inclinaison, m.cap, 0);
      let e = m.expr || (m.bras === "salut" ? "sourire" : EXPRESSIONS[m.anim]) || "neutre";
      m.cligne -= dt;
      if (m.cligne < -m.prochain) {
        m.cligne = 0.12;
        m.prochain = 1.6 + Math.random() * 4;
      }
      if (m.cligne > 0 && CLIGNABLES.has(e)) e = "cligne";
      m.cellule = ETATS.indexOf(e);
      if (ombre.parent && m.sol != null) {
        const hsol = Math.max(0, objet.position.y - m.sol) / (m.taille || 1), k = 1 / (1 + hsol * 1.8);
        ombre.position.set(objet.position.x, m.sol + 2e-3 * m.taille, objet.position.z + (ombre.userData.dz ?? 0) * m.taille);
        ombre.scale.set(0.5 * m.taille * k * D.kl, 0.34 * m.taille * k, 1);
        ombre.material.opacity = 0.3 * k * (ombre.userData.force ?? 1);
        ombre.visible = objet.visible;
      } else ombre.visible = false;
    };
    const lancer = (nom, maj) => {
      m.action?.rejeter("remplac\xE9e");
      const p = new Promise((ok, ko) => {
        const a = { nom, maj, fin: (v) => {
          if (m.action === a) m.action = null;
          ok(v);
        }, rejeter: (r) => {
          if (m.action === a) m.action = null;
          ko(new Error(r));
        } };
        m.action = a;
      });
      p.catch(() => {
      });
      return p;
    };
    m.interrompre = (raison = "interrompu") => m.action?.rejeter(raison);
    m.attendre = (s) => {
      let t = 0;
      return lancer("attendre", (dt) => {
        if ((t += dt) >= s) m.action.fin();
      });
    };
    m.geste = (nom, s, ensuite = "repos") => {
      m.jouer(nom, { redemarrer: true });
      let t = 0;
      return lancer(nom, (dt) => {
        if ((t += dt) >= s) {
          m.jouer(ensuite);
          m.action.fin();
        }
      });
    };
    m.allerVers = (but, o2 = {}) => {
      const v = (o2.courir ? 2.4 : 1.05) * (o2.vitesse || 1) * m.taille, pos = objet.position;
      m.jouer(o2.courir ? "courir" : "marcher");
      return lancer("aller", (dt) => {
        const dx = but.x - pos.x, dz = but.z - pos.z, d2 = Math.hypot(dx, dz), pas = v * dt;
        if (d2 <= pas) {
          pos.x = but.x;
          pos.z = but.z;
          m.jouer(o2.ensuite || "repos");
          m.action.fin();
          return;
        }
        pos.x += dx / d2 * pas;
        pos.z += dz / d2 * pas;
        m.viser(dx, dz);
      });
    };
    m.sauterVers = (but, o2 = {}) => {
      const g = (o2.gravite ?? 16) * m.taille, p0 = objet.position.clone(), haut = Math.max(p0.y, but.y) + (o2.hauteur ?? 0.55) * m.taille;
      const tm = Math.sqrt(2 * (haut - p0.y) / g), td = Math.sqrt(2 * (haut - but.y) / g), duree = tm + td, prep = o2.prep ?? 0.14;
      let t = -prep;
      m.saut = { ph: "prep", q: 0 };
      m.jouer("sauter", { fondu: 0.1 });
      m.viser(but.x - p0.x, but.z - p0.z);
      if (o2.sol !== void 0) m.sol = o2.sol;
      return lancer("sauter", (dt) => {
        t += dt;
        if (t < 0) {
          m.saut.ph = "prep";
          m.saut.q = 1 + t / prep;
          return;
        }
        if (t < duree) {
          const q = t / duree;
          m.saut.ph = "vol";
          m.saut.q = q;
          objet.position.x = p0.x + (but.x - p0.x) * q;
          objet.position.z = p0.z + (but.z - p0.z) * q;
          objet.position.y = t < tm ? haut - 0.5 * g * (tm - t) ** 2 : haut - 0.5 * g * (t - tm) ** 2;
          if (o2.salto) m.salto.rotation.x = PI2 * lisse(q * 1.1);
          if (o2.sol !== void 0 && q > 0.5) m.sol = but.y;
          return;
        }
        objet.position.copy(but);
        m.salto.rotation.x = 0;
        if (t < duree + 0.2) {
          m.saut.ph = "recep";
          m.saut.q = (t - duree) / 0.2;
          return;
        }
        m.saut = null;
        m.jouer(o2.ensuite || "repos", { fondu: 0.15 });
        m.action.fin();
      });
    };
    m.tomber = (ySol, o2 = {}) => {
      const g = (o2.gravite ?? 16) * m.taille;
      let vy = o2.vy ?? 0, t = 0, pose = false;
      m.jouer("tomber", { fondu: 0.12 });
      return lancer("tomber", (dt) => {
        t += dt;
        if (!pose) {
          vy -= g * dt;
          objet.position.y += vy * dt;
          if (objet.position.y <= ySol) {
            objet.position.y = ySol;
            pose = true;
            t = 0;
            m.jouer("rattraper", { fondu: 0.06 });
          }
          return;
        }
        if (t > (o2.recuperation ?? 0.9)) {
          m.jouer("repos");
          m.action.fin();
        }
      });
    };
    m.rectEcran = (cam, W, H) => {
      const v = new T.Vector3(), b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
      const voir = (x, y) => {
        b.x0 = Math.min(b.x0, x);
        b.x1 = Math.max(b.x1, x);
        b.y0 = Math.min(b.y0, y);
        b.y1 = Math.max(b.y1, y);
      };
      const proj = (bone, oy, rayon) => {
        v.set(0, oy, 0).applyMatrix4(os[bone].matrixWorld);
        const c = v.clone().project(cam);
        v.set(rayon, oy, 0).applyMatrix4(os[bone].matrixWorld).project(cam);
        const rp = Math.hypot((v.x - c.x) * W / 2, (v.y - c.y) * H / 2);
        const x = (c.x + 1) * W / 2, y = (1 - c.y) * H / 2;
        voir(x - rp, y - rp);
        voir(x + rp, y + rp);
      };
      proj(OS.tete, TETE_Y, R * 1.1);
      proj(OS.coudeG, -D.bras2, 0.05);
      proj(OS.coudeD, -D.bras2, 0.05);
      proj(OS.genouG, -(D.genou - 0.02), 0.06);
      proj(OS.genouD, -(D.genou - 0.02), 0.06);
      proj(OS.bassin, 0.1, 0.11);
      return b;
    };
    m.liberer = () => {
      m.action?.rejeter("lib\xE9r\xE9");
      objet.removeFromParent();
      ombre.removeFromParent();
      corps.geometry.dispose();
      corps.skeleton.dispose();
      matVisage.dispose();
      ombre.geometry.dispose();
      ombre.material.dispose();
    };
    m.regler(o.taille ?? 1);
    m.maj(0);
    return m;
  };
  const eclairer = (scene, o = {}) => {
    const ciel = new T.HemisphereLight(16777215, 14273469, o.ciel ?? 1.9), soleil = new T.DirectionalLight(16774116, o.soleil ?? 2.2);
    soleil.position.set(-0.5, 1, 0.9);
    scene.add(ciel, soleil);
    return { ciel, soleil };
  };
  const suivre = (m, p, dt) => {
    m.anim = p.anim;
    m.t = p.t;
    m.cap = p.cap;
    m.capVise = p.capVise;
    m.ph = p.ph;
    m.cadence = p.cadence;
    m.expr = p.expr;
    m.objet.position.copy(p.objet.position);
    m.maj(dt || 0);
    return m;
  };
  const creerCompat = (o = {}) => {
    const m = creer({ ...o, qualite: o.qualite ?? ((o.resolution ?? 0) >= 256 ? "haute" : "basse") });
    m.suivre = (p, dt) => suivre(m, p, dt);
    return m;
  };
  const AUCUN = [];
  window.__pcvMii3D = {
    creer: creerCompat,
    eclairer,
    pantin: (o) => creerCompat({ taille: o?.taille, qualite: "basse" }),
    // aucune identité à proposer sans fichiers privés : seulement soi-même (sans visage précis) puis le générateur, le
    // temps que vrais-mii.js reprenne la main si prive/mii/ redevient disponible
    siens: () => Promise.resolve([{ cle: "moi", graine: "pcv-moi", nom: "", moi: true }]),
    amis: () => AUCUN,
    habitantsInvites: () => AUCUN,
    hasard: (k) => ({ cle: "g" + k, graine: "pcv-g" + k, nom: "" }),
    PALETTE,
    coupes: Object.keys(COUPES),
    animations: Object.keys(ANIMS),
    expressions: ETATS,
    generique: true,
    version: 1
  };
  return "Mii 3D pr\xEAts";
})();
