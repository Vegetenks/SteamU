(() => {
  const T = window.THREE;
  if (window.__pcvMii3D && !window.__pcvMii3D.vrais && !window.__pcvMii3D.generique) delete window.__pcvMii3D;
  if (!T) return "vrais-mii : three.js absent";
  const prec = window.__pcvVraisMii?.etat;
  const SCRIPTS = [
    ["moteur/ffl-emscripten.js", () => window.ModuleFFL],
    ["moteur/ffl.browser.js", () => window.FFLjs],
    ["moteur/FFLShaderMaterial.browser.js", () => window.FFLShaderMaterial],
    ["moteur/CTRShaderMaterial.browser.js", () => window.CTRShaderMaterial],
    ["moteur/LUTShaderMaterial.browser.js", () => window.LUTShaderMaterial],
    ["moteur/aides-ffl.js", () => window.__pcvESM?.prepareBodyForCharModel]
  ];
  const SCRIPT_SWITCH = ["moteur/SampleShaderMaterial.browser.js", () => window.SampleShaderMaterial];
  const ECLAIRAGES = { wiiu: () => window.FFLShaderMaterial, "3ds": () => window.CTRShaderMaterial, switch: () => materiauSwitch() || window.LUTShaderMaterial };
  const RESSOURCE = "AFLResHigh_2_3.dat", INVITES = "invites.json", DEFAUT = "@mii-defaut/index.json", CORPS = ["corps/miiBodyM_wiiu.glb", "corps/miiBodyF_wiiu.glb"];
  const borne = (x) => Math.max(0, Math.min(1, x));
  const lisse = (x) => (x = borne(x)) * x * (3 - 2 * x);
  const PI2 = Math.PI * 2;
  const FOULEE = { marcher: 0.66, courir: 1.49 };
  let { F = null, ffl = null, rendu0 = null, gabarits = null, invites = [], defauts = [] } = prec || {};
  const PANTALONS = { gris: 4212558, bleu: 2637946, rouge: 7348245, or: 12623920 };
  const couleurBrute = (x) => new T.Color().setHex(typeof x === "string" ? parseInt(x.replace("#", ""), 16) : x, T.LinearSRGBColorSpace);
  const X = () => F.FFLExpression;
  const EXPR = {
    neutre: "NORMAL",
    cligne: "BLINK",
    sourire: "SMILE",
    joie: "HAPPY",
    surprise: "SURPRISE_OPEN_MOUTH",
    inquiet: "SORROW",
    effort: "ANGER",
    parle: "OPEN_MOUTH",
    clin: "LIKE_WINK_LEFT",
    fache: "ANGER"
  };
  const ETATS = Object.keys(EXPR);
  const REPLI = { joie: "sourire", clin: "sourire", surprise: "neutre", inquiet: "neutre", effort: "neutre", fache: "neutre", parle: "neutre", sourire: "neutre", cligne: "neutre" };
  const CLIGNABLES = /* @__PURE__ */ new Set(["neutre", "surprise", "parle", "sourire", "inquiet", "fache", "effort"]);
  const QUALITES = { haute: { resolution: 512, etats: ETATS }, basse: { resolution: 256, etats: ["neutre", "cligne", "sourire"] } };
  const octets = (d) => {
    if (d instanceof Uint8Array) return d;
    if (d instanceof ArrayBuffer) return new Uint8Array(d);
    const s = String(d).trim();
    if (/^[0-9a-f]+$/i.test(s) && s.length % 2 === 0) return Uint8Array.from({ length: s.length >> 1 }, (_, i) => parseInt(s.substr(i * 2, 2), 16));
    return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  };
  const versB64 = (u8) => btoa(String.fromCharCode(...u8));
  const reglage = (k) => {
    let v = null;
    try {
      v = localStorage.getItem(k);
      return v == null ? null : JSON.parse(v);
    } catch (e) {
      return v;
    }
  };
  const CLE_HASARD = "pcv-mii-hasard";
  const empreinte = (g) => {
    let h = 2166136261;
    for (const c of String(g)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return h >>> 0;
  };
  const auHasard = (graine) => {
    let memo = {};
    try {
      memo = JSON.parse(localStorage.getItem(CLE_HASARD) || "{}");
    } catch (e) {
    }
    if (graine != null && memo[graine]) return octets(memo[graine]);
    const ci = F.getRandomCharInfo(ffl), h = graine == null ? Math.random() * 2 ** 32 >>> 0 : empreinte(graine), v = new DataView(ci.buffer);
    v.setInt32(172, 34 + h % 61, true);
    v.setInt32(176, 30 + (h >>> 8) % 69, true);
    if (graine == null) return ci;
    memo[graine] = versB64(ci);
    try {
      localStorage.setItem(CLE_HASARD, JSON.stringify(memo));
    } catch (e) {
    }
    return ci;
  };
  const OCTETS_SWITCH = { cheveux: 24, yeux: 36, sourcils: 64, bouche: 104, barbe: 128, lunettes: 144 };
  const charInfo = (d) => {
    const m = ffl.module, pi = m._malloc(288), pd = m._malloc(d.length);
    try {
      m.HEAPU8.set(d, pd);
      if (!m._FFLpGetCharInfoFromStoreData(pi, pd)) throw new Error("vrais-mii : Mii illisible");
      return m.HEAPU8.slice(pi, pi + 288);
    } finally {
      m._free(pi);
      m._free(pd);
    }
  };
  const poserSwitch = (ci, c = {}) => {
    const v = new DataView(ci.buffer, ci.byteOffset);
    for (const [k, o] of Object.entries(OCTETS_SWITCH)) if (c[k] != null) v.setUint32(o, (c[k] | 2147483648) >>> 0, true);
    if (c.peau != null) v.setUint32(8, c.peau, true);
    if (c.lunettes_forme != null) v.setInt32(140, c.lunettes_forme, true);
    return ci;
  };
  const VERS_COMMUNES = [[24, (c) => c || 8], [64, (c) => c || 8], [128, (c) => c || 8], [36, (c) => 8 + c], [104, (c) => 19 + c], [144, (c) => c ? 13 + c : 8]];
  const enCouleursSwitch = (ci) => {
    const v = new DataView(ci.buffer, ci.byteOffset);
    for (const [o, f] of VERS_COMMUNES) {
      const c = v.getInt32(o, true);
      if (c >= 0) v.setUint32(o, (f(c) | 2147483648) >>> 0, true);
    }
    return ci;
  };
  const REGLAGE_SWITCH = {
    u_Relief: { value: 1.3 },
    // × facteur de demi-Lambert de nn::mii (plus haut = ombre plus marquée)
    u_KReflet: { value: 0.4 },
    // × reflet spéculaire
    u_KSss: { value: 0.7 },
    // × transluminance (teinte chaude des ombres)
    u_KRim: { value: 1 },
    // × liseré
    u_Lumiere: { value: new T.Color(1.15, 1.2, 1.3) },
    u_Saturation: { value: 1.225 },
    u_Voile: { value: new T.Color(0.77, 0.8, 0.86) },
    // couleur du voile (celle du fond du Mii Maker)
    u_VoileForce: { value: 0.044 },
    u_Direction: { value: new T.Vector3(0.027, 0.632, 0.6963642) },
    // (nn::mii : IconLightDirection -0,123 ; 0,707 ; 0,696)
    // encre et papier du masque (yeux, sourcils, bouche, dessinés en texture) : sur la Switch, leur noir et leur blanc
    // ne sont pas purs (noir bleuté, blanc bleuté) ; 0 → encre, 1 → papier
    u_Encre: { value: new T.Color(0.13, 0.115, 0.13) },
    u_Papier: { value: new T.Color(0.85, 0.85, 1) },
    u_SatMasque: { value: 1.4 },
    // saturation du masque (l'iris de la Switch est d'un bleu plus franc)
    u_TeintePeau: { value: new T.Color(0.86, 0.98, 1) }
    // × couleur de la peau (visage, nez, front)
  };
  const TYPES_SWITCH = { u_Lumiere: "vec3", u_Voile: "vec3", u_Direction: "vec3", u_Encre: "vec3", u_Papier: "vec3", u_TeintePeau: "vec3", u_Partie: "float" };
  const RETOUCHES_SWITCH = [
    ["vec4 albedo = GetAlbedo();", `vec4 albedo = GetAlbedo();
    if (u_Partie == 1.) { albedo.rgb = mix(u_Encre, u_Papier, albedo.rgb);
      albedo.rgb = clamp(mix(vec3(dot(albedo.rgb, vec3(.299, .587, .114))), albedo.rgb, u_SatMasque), 0., 1.); }
    else if (u_Partie == 2.) albedo.rgb *= u_TeintePeau;`],
    [
      "float halfLambert = ((diffuseFactor) * u_HalfLambertFactor + (1.0 - u_HalfLambertFactor));",
      "float hlf = u_HalfLambertFactor * u_Relief; float halfLambert = diffuseFactor * hlf + (1.0 - hlf);"
    ],
    ["vec3 lightDir = normalize(lightDirInView.xyz);", "vec3 lightDir = normalize(u_Direction);"],
    ["vec3 diffuseColor = lightColor.rgb", "vec3 diffuseColor = u_Lumiere"],
    ["* u_SpecularColor.rgb;", "* u_SpecularColor.rgb * u_KReflet;"],
    ["u_SssColor.rgb * (1.0 - halfLambert);", "u_SssColor.rgb * (1.0 - halfLambert) * u_KSss;"],
    ["outputColor.rgb += GetRimColor(", "outputColor.rgb += u_KRim * GetRimColor("],
    ["gl_FragColor = outputColor;", `float gris = dot(outputColor.rgb, vec3(.299, .587, .114));
    outputColor.rgb = mix(mix(vec3(gris), outputColor.rgb, u_Saturation), u_Voile, u_VoileForce);
    gl_FragColor = outputColor;`]
  ];
  let MatSwitch = null;
  const materiauSwitch = () => MatSwitch || window.SampleShaderMaterial && (MatSwitch = class extends window.SampleShaderMaterial {
    constructor(o) {
      super(o);
      let f = this.fragmentShader;
      for (const [a, b] of RETOUCHES_SWITCH) {
        if (!f.includes(a)) throw new Error("vrais-mii : SampleShader inattendu (" + a + ")");
        f = f.replace(a, b);
      }
      this.fragmentShader = [...Object.keys(REGLAGE_SWITCH), "u_Partie"].map((k) => `uniform ${TYPES_SWITCH[k] || "float"} ${k};
`).join("") + f;
      Object.assign(this.uniforms, REGLAGE_SWITCH);
      this.uniforms.u_Partie ||= { value: 0 };
    }
    // partie de la tête (types de FFL) : 1 = masque (6 : yeux, sourcils, bouche), encre et papier ; 2 = peau (0 visage,
    // 2 nez, 3 front), teinte de la peau. Posée dès le constructeur parent (setValues).
    get modulateType() {
      return super.modulateType;
    }
    set modulateType(v) {
      super.modulateType = v;
      this.uniforms.u_Partie = { value: v === 6 ? 1 : [0, 2, 3].includes(v) ? 2 : 0 };
    }
  });
  let promesse = prec ? Promise.resolve({ ms: 0 }) : null;
  const preparer = (o = {}) => promesse ||= (async () => {
    const t0 = performance.now();
    for (const [chemin, present] of SCRIPTS) if (!present()) await o.script(chemin);
    const manque = SCRIPTS.filter(([, p]) => !p()).map(([c]) => c);
    if (manque.length) throw new Error("vrais-mii : scripts priv\xE9s absents : " + manque.join(", "));
    if (!SCRIPT_SWITCH[1]()) try {
      await o.script(SCRIPT_SWITCH[0]);
    } catch (e) {
    }
    const E = window.__pcvESM;
    if (!E.GLTFLoader || !E.clone) throw new Error("vrais-mii : greffon/vendor/three-gltf.js absent");
    F = window.FFLjs;
    E.addSkeletonScalingExtensions(T.Skeleton);
    const [res, ...glb] = await Promise.all([o.lire(RESSOURCE), ...CORPS.map((c) => o.lire(c).catch(() => null))]);
    try {
      invites = JSON.parse(new TextDecoder().decode(await o.lire(INVITES))).invites || [];
    } catch (e) {
      invites = [];
    }
    await lireDefauts();
    ffl = await F.FFL.initWithResource(new Uint8Array(res), window.ModuleFFL);
    rendu0 = o.rendu || null;
    if (rendu0) ffl.setRenderer(rendu0);
    gabarits = await Promise.all(glb.map((b, sexe) => !b ? gabarit(corpsDessine(sexe)) : new Promise((ok, ko) => new E.GLTFLoader().parse(b, "", ok, ko)).then(gabarit).catch((e) => {
      console.warn("vrais-mii : corps illisible, corps de SteamU \xE0 la place", e);
      return gabarit(corpsDessine(sexe));
    })));
    window.__pcvMii3D = API;
    window.dispatchEvent(new Event("pcv-vrais-mii"));
    return { ms: Math.round(performance.now() - t0) };
  })().catch((e) => {
    promesse = null;
    throw e;
  });
  const lireDefauts = async () => {
    try {
      const u = await window.__pcvRessource?.(DEFAUT, "application/json");
      if (u) try {
        defauts = (await (await fetch(u)).json()).mii || [];
      } finally {
        rendre(DEFAUT, u);
      }
    } catch (e) {
      defauts = [];
    }
  };
  const DOSSIER = "mii/";
  const rendre = (c, url) => {
    URL.revokeObjectURL(url);
    if (window.__pcvBlobs?.[c] === url) delete window.__pcvBlobs[c];
  };
  const adresse = async (chemin, type) => {
    const c = DOSSIER + chemin, url = await window.__pcvRessource?.(c, type);
    if (!url) throw new Error("vrais-mii : prive/" + c + " absent");
    return [c, url];
  };
  const lire = async (chemin) => {
    const [c, url] = await adresse(chemin, "application/octet-stream");
    try {
      return await (await fetch(url)).arrayBuffer();
    } finally {
      rendre(c, url);
    }
  };
  const script = async (chemin) => {
    const [c, url] = await adresse(chemin, "text/javascript");
    try {
      await new Promise((ok, ko) => {
        const s = document.createElement("script");
        s.src = url;
        s.onload = () => {
          s.remove();
          ok();
        };
        s.onerror = () => {
          s.remove();
          ko(new Error("vrais-mii : script refus\xE9 : " + c));
        };
        document.head.appendChild(s);
      });
    } finally {
      rendre(c, url);
    }
  };
  const charger = () => preparer({ lire, script }).then(() => API);
  const OS = ["skl_root", "hip", "chest", "head", "arm_l1", "arm_l2", "wrist_l", "arm_r1", "arm_r2", "wrist_r", "foot_l1", "foot_l2", "ankle_l", "foot_r1", "foot_r2", "ankle_r"];
  const I = Object.fromEntries(OS.map((n, i) => [n, i]));
  const CHAINES = { arm_l1: "arm_l2", arm_r1: "arm_r2", foot_l1: "foot_l2", foot_r1: "foot_r2" };
  const MEMBRE = { arm_l2: "arm_l1", wrist_l: "arm_l1", arm_r2: "arm_r1", wrist_r: "arm_r1", foot_l2: "foot_l1", ankle_l: "foot_l1", foot_r2: "foot_r1", ankle_r: "foot_r1" };
  const BAS = new T.Vector3(0, -1, 0);
  const gabarit = (gltf) => {
    const scene = gltf.scene, os = OS.map((n) => scene.getObjectByName(n));
    if (os.some((b) => !b)) throw new Error("vrais-mii : corps inattendu (os manquants)");
    scene.updateMatrixWorld(true);
    const monde = os.map((b) => b.getWorldQuaternion(new T.Quaternion())), pos = os.map((b) => b.getWorldPosition(new T.Vector3()));
    const calage = OS.map((n) => {
      const debut = CHAINES[n] ? n : MEMBRE[n];
      if (!debut) return new T.Quaternion();
      const d = pos[I[CHAINES[debut]]].clone().sub(pos[I[debut]]).normalize();
      return new T.Quaternion().setFromUnitVectors(d, BAS);
    });
    const Z = OS.map((n, i) => calage[i].clone().multiply(monde[i]));
    const parent = os.map((b) => b.parent.getWorldQuaternion(new T.Quaternion()));
    const Zp = OS.map((n, i) => (i ? Z[OS.indexOf(os[i].parent.name)] : parent[0]).clone().invert());
    const clips = {};
    for (const c of gltf.animations) {
      const pistes = [];
      for (const p of c.tracks) {
        const [nom, prop] = p.name.split("."), i = I[nom];
        if (i === void 0 || !(prop === "quaternion" || prop === "position" && i === 0)) continue;
        pistes.push({ i, prop, interp: p.createInterpolant() });
      }
      clips[c.name] = { duree: c.duration, pistes };
    }
    return { gltf, Z, Zp, clips, racineRepos: os[0].position.clone(), racineParent: parent[0], hautRepos: pos[0].y };
  };
  const corpsDessine = (sexe) => {
    const fille = sexe === 1, os = {}, scene = new T.Group(), rond = (r) => (geo) => geo.scale(r[0], r[1], r[2]);
    const SQ = [
      ["skl_root", "", 0, 6.8],
      ["chest", "skl_root", 0, 0],
      ["head", "chest", 0, 4.1],
      ["hip", "skl_root", 0, 0],
      ...[1, -1].flatMap((s) => {
        const c = s > 0 ? "l" : "r";
        return [
          ["arm_" + c + "1", "chest", 1.2 * s, 3.5],
          ["arm_" + c + "2", "arm_" + c + "1", 2.4 * s, 0],
          ["wrist_" + c, "arm_" + c + "2", 2.4 * s, 0],
          ["foot_" + c + "1", "hip", 0.8 * s, -1.4],
          ["foot_" + c + "2", "foot_" + c + "1", 0, -2.2],
          ["ankle_" + c, "foot_" + c + "2", 0, -2.2]
        ];
      })
    ];
    const bones = SQ.map(([n, p, x, y], i) => {
      const b = new T.Bone();
      b.name = n;
      b.position.set(x, y, 0);
      (os[n] = b).userData.i = i;
      (p ? os[p] : scene).add(b);
      return b;
    });
    const fondu = (a, b, t2) => (t2 = lisse(t2)) <= 0 ? [[a, 1]] : t2 >= 1 ? [[b, 1]] : [[a, 1 - t2], [b, t2]];
    const piece = (geo, poids) => {
      const P = geo.attributes.position, n = P.count, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), p = new T.Vector3();
      for (let i = 0; i < n; i++) poids(p.fromBufferAttribute(P, i)).forEach(([o, w], k) => {
        si[i * 4 + k] = os[o].userData.i;
        sw[i * 4 + k] = w;
      });
      geo.setAttribute("skinIndex", new T.Uint16BufferAttribute(si, 4));
      geo.setAttribute("skinWeight", new T.Float32BufferAttribute(sw, 4));
      return geo;
    };
    const fondre = (geos) => {
      const g = new T.BufferGeometry(), idx = [];
      let base = 0;
      for (const n of ["position", "normal", "uv", "skinIndex", "skinWeight"]) {
        const a = geos.map((x) => x.attributes[n]);
        const v = new a[0].array.constructor(a.reduce((s, x) => s + x.array.length, 0));
        let o = 0;
        for (const x of a) {
          v.set(x.array, o);
          o += x.array.length;
        }
        g.setAttribute(n, new T.BufferAttribute(v, a[0].itemSize));
      }
      for (const x of geos) {
        for (const i of x.index.array) idx.push(i + base);
        base += x.attributes.position.count;
        x.dispose();
      }
      g.setIndex(idx);
      return g;
    };
    const boule = (r, x, y, z, ls = 12, hs = 10) => rond(r)(new T.SphereGeometry(1, ls, hs)).translate(x, y, z);
    const fmin = (a, b, k) => {
      const h = Math.max(k - Math.abs(a - b), 0) / k;
      return Math.min(a, b) - h * h * k * 0.25;
    };
    const fmax = (a, b, k) => -fmin(-a, -b, k);
    const tube = (x, y, z, A, B, ra, rb) => {
      const bx = B[0] - A[0], by = B[1] - A[1], bz = B[2] - A[2], px = x - A[0], py = y - A[1], pz = z - A[2];
      const t2 = Math.max(0, Math.min(1, (px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz)));
      return Math.hypot(px - t2 * bx, py - t2 * by, pz - t2 * bz) - (ra + (rb - ra) * t2);
    };
    const ovale = (x, y, z, C, R) => {
      const k = Math.hypot((x - C[0]) / R[0], (y - C[1]) / R[1], (z - C[2]) / R[2]);
      return (k - 1) * Math.min(...R);
    };
    const tourne = (x, y, z, P, zs2, dz, k) => {
      let r = P[0][0];
      for (let n = 1; n < P.length; n++) if (y <= P[n][1] || n === P.length - 1) {
        const [r0, y0] = P[n - 1], [r1, y1] = P[n];
        r = r0 + (r1 - r0) * borne((y - y0) / (y1 - y0));
        break;
      }
      return fmax(Math.hypot(x, (z - dz) / zs2) - r, fmax(P[0][1] - y, y - P[P.length - 1][1], k), k);
    };
    const surface = (f, a, b, h) => {
      const n = a.map((v, k) => Math.ceil((b[k] - v) / h) + 1), [nx, ny, nz] = n, val = new Float32Array(nx * ny * nz), id = new Int32Array(nx * ny * nz).fill(-1);
      const I2 = (i, j2, k) => i + nx * (j2 + ny * k), pos = [], idx = [];
      for (let k = 0; k < nz; k++) for (let j2 = 0; j2 < ny; j2++) for (let i = 0; i < nx; i++) val[I2(i, j2, k)] = f(a[0] + i * h, a[1] + j2 * h, a[2] + k * h);
      const C = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], A = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
      for (let k = 0; k < nz - 1; k++) for (let j2 = 0; j2 < ny - 1; j2++) for (let i = 0; i < nx - 1; i++) {
        const v = C.map(([x, y, z]) => val[I2(i + x, j2 + y, k + z)]);
        let sx = 0, sy = 0, sz = 0, c = 0;
        for (const [p, q2] of A) if (v[p] < 0 !== v[q2] < 0) {
          const t2 = v[p] / (v[p] - v[q2]);
          sx += C[p][0] + t2 * (C[q2][0] - C[p][0]);
          sy += C[p][1] + t2 * (C[q2][1] - C[p][1]);
          sz += C[p][2] + t2 * (C[q2][2] - C[p][2]);
          c++;
        }
        if (c) {
          id[I2(i, j2, k)] = pos.length / 3;
          pos.push(a[0] + (i + sx / c) * h, a[1] + (j2 + sy / c) * h, a[2] + (k + sz / c) * h);
        }
      }
      const quad = (q2, dedans) => {
        if (q2.some((x) => x < 0)) return;
        if (dedans) idx.push(q2[0], q2[1], q2[2], q2[0], q2[2], q2[3]);
        else idx.push(q2[0], q2[2], q2[1], q2[0], q2[3], q2[2]);
      };
      for (let k = 1; k < nz - 1; k++) for (let j2 = 1; j2 < ny - 1; j2++) for (let i = 1; i < nx - 1; i++) {
        const d = val[I2(i, j2, k)] < 0;
        if (d !== val[I2(i + 1, j2, k)] < 0) quad([id[I2(i, j2 - 1, k - 1)], id[I2(i, j2, k - 1)], id[I2(i, j2, k)], id[I2(i, j2 - 1, k)]], d);
        if (d !== val[I2(i, j2 + 1, k)] < 0) quad([id[I2(i - 1, j2, k - 1)], id[I2(i - 1, j2, k)], id[I2(i, j2, k)], id[I2(i, j2, k - 1)]], d);
        if (d !== val[I2(i, j2, k + 1)] < 0) quad([id[I2(i - 1, j2 - 1, k)], id[I2(i, j2 - 1, k)], id[I2(i, j2, k)], id[I2(i - 1, j2, k)]], d);
      }
      const nor = new Float32Array(pos.length), e = h * 0.25, g = (x, y, z) => [f(x + e, y, z) - f(x - e, y, z), f(x, y + e, z) - f(x, y - e, z), f(x, y, z + e) - f(x, y, z - e)];
      for (let v = 0; v < pos.length; v += 3) {
        for (let it = 0; it < 2; it++) {
          const [x, y, z] = [pos[v], pos[v + 1], pos[v + 2]], d = f(x, y, z), G2 = g(x, y, z), l2 = G2[0] ** 2 + G2[1] ** 2 + G2[2] ** 2 || 1;
          for (let c = 0; c < 3; c++) pos[v + c] -= d * G2[c] * 2 * e / l2;
        }
        const G = g(pos[v], pos[v + 1], pos[v + 2]), l = Math.hypot(...G) || 1;
        for (let c = 0; c < 3; c++) nor[v + c] = G[c] / l;
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      geo.setAttribute("normal", new T.BufferAttribute(nor, 3));
      geo.setAttribute("uv", new T.BufferAttribute(new Float32Array(pos.length / 3 * 2), 2));
      geo.setIndex(idx);
      return geo;
    };
    const profil = fille ? [[2.46, 5.05], [2.4, 5.4], [2.06, 6.8], [1.7, 8.3], [1.5, 9.5], [1.36, 10.15], [1.12, 10.6], [0.8, 10.92], [0.55, 11.2], [0.5, 11.9]] : [[1.88, 7.1], [1.86, 7.5], [1.82, 8.4], [1.7, 9.3], [1.48, 9.95], [1.22, 10.45], [0.96, 10.8], [0.72, 11.05], [0.55, 11.3], [0.5, 11.9]];
    const zs = fille ? 0.84 : 0.78, epaule = (s) => [s * 1.05, 10.2, 0.05], coude = (s) => [s * 3.6, 10.3, 0], poignet = (s) => [s * 6.1, 10.3, 0];
    const fHaut = (x, y, z) => {
      let d = tourne(x, y, z, profil, zs, 0.12, 0.45);
      for (const s of [1, -1]) d = fmin(d, fmin(tube(x, y, z, epaule(s), coude(s), 0.6, 0.5), tube(x, y, z, coude(s), poignet(s), 0.5, 0.42), 0.16), 1.1);
      return d;
    };
    const hautGeo = surface(fHaut, [-7.1, fille ? 4.4 : 6.4, -2.7], [7.1, 12.5, 2.8], 0.28);
    const haut = [piece(hautGeo, (p) => {
      const ax = Math.abs(p.x), c = p.x > 0 ? "l" : "r", wa = lisse((ax - 0.6) / 1.9) * lisse((p.y - 8.9) / 1), e = lisse((ax - 3.3) / 0.6);
      return [["chest", 1 - wa], ["arm_" + c + "1", wa * (1 - e)], ["arm_" + c + "2", wa * e]].filter(([, w]) => w > 1e-4);
    })], mains = [], bas = [];
    for (const s of [1, -1]) mains.push(piece(boule([0.72, 0.72, 0.72], s * 6.36, 10.3, 0, 10, 8), () => [["wrist_" + (s > 0 ? "l" : "r"), 1]]));
    const j = fille ? 0.8 : 1;
    const hanches = [[1.25 * j, 5.36], [1.72 * j, 6], [1.78 * j, 6.6], [1.76 * j, fille ? 6.4 : 7.4]];
    const fBas = (x, y, z) => {
      let l = 9;
      for (const s of [1, -1]) {
        const H = [s * 0.8, 6, 0], G = [s * 0.8, 3.2, 0.06], C = [s * 0.8, 1, 0];
        let jb = fmin(tube(x, y, z, H, G, 0.82 * j, 0.58 * j), tube(x, y, z, G, C, 0.58 * j, 0.5 * j), 0.12);
        jb = fmin(jb, ovale(x, y, z, [s * 0.8, 3.25, 0.1], [0.52 * j, 0.52 * j, 0.52 * j]), 0.25);
        const pied = fmax(ovale(x, y, z, [s * 0.8, 0.46, 0.32], [0.64 * j, 0.52, 1.36 * j]), -y, 0.08);
        l = Math.min(l, fmin(jb, pied, 0.35));
      }
      return fmin(tourne(x, y, z, hanches, 0.7, 0, 0.4), l, 0.5);
    };
    const basGeo = surface(fBas, [-2.4, -0.7, -1.8], [2.4, 7.9, 2.4], 0.3);
    bas.push(piece(basGeo, (p) => {
      const c = p.x > 0 ? "l" : "r";
      if (p.y > 5.7 || Math.abs(p.x) < 0.3 && p.y > 5.2) return [["hip", 1]];
      if (p.y > 5.1) return fondu("foot_" + c + "1", "hip", (p.y - 5.1) / 0.6);
      if (p.y > 1.3) return fondu("foot_" + c + "2", "foot_" + c + "1", (p.y - 2.9) / 0.6);
      return fondu("ankle_" + c, "foot_" + c + "2", (p.y - 0.9) / 0.4);
    }));
    scene.updateMatrixWorld(true);
    const squelette = new T.Skeleton(bones);
    for (const [nom, geos] of [["body_steamu", haut], ["hands_steamu", mains], ["legs_steamu", bas]]) {
      const m = new T.SkinnedMesh(fondre(geos), new T.MeshBasicMaterial());
      m.name = nom;
      scene.add(m);
      m.bind(squelette);
    }
    scene.add(os.skl_root);
    const q = (x, y, z) => new T.Quaternion().setFromEuler(new T.Euler(x, y, z)).toArray(), t = [0, 1.3, 2.6];
    const piste = (n, a, b) => new T.QuaternionKeyframeTrack(n + ".quaternion", t, [...a, ...b, ...a]);
    const attente = new T.AnimationClip("Wait", 2.6, [
      piste("arm_l1", q(0, 0, -1.25), q(0, 0, -1.21)),
      piste("arm_r1", q(0, 0, 1.25), q(0, 0, 1.21)),
      piste("arm_l2", q(0, -0.08, 0.1), q(0, -0.12, 0.12)),
      piste("arm_r2", q(0, 0.08, -0.1), q(0, 0.12, -0.12)),
      piste("chest", q(0, 0, 0), q(-0.015, 0, 0)),
      piste("head", q(0, 0, 0), q(0.02, 0, 0)),
      ...["l", "r"].flatMap((c) => [piste("foot_" + c + "1", q(-0.14, 0, 0), q(-0.15, 0, 0)), piste("foot_" + c + "2", q(0.28, 0, 0), q(0.3, 0, 0)), piste("ankle_" + c, q(-0.14, 0, 0), q(-0.15, 0, 0))])
    ]);
    return { scene, animations: [attente] };
  };
  const CLIPS = { repos: "Wait", fin: "Finish", ...Object.fromEntries(Array.from({ length: 14 }, (_, k) => ["pose" + (k + 1), "Pose." + String(k + 1).padStart(2, "0")])) };
  const BOUCLE = /* @__PURE__ */ new Set(["repos"]);
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
    rz: 28,
    plat: 29
  };
  const NC = 30, NEUTRE = new Float32Array(NC);
  NEUTRE[K.ech] = 1;
  NEUTRE[K.egz] = NEUTRE[K.edz] = 0.24;
  NEUTRE[K.cg] = NEUTRE[K.cd] = 0.14;
  NEUTRE[K.egx] = NEUTRE[K.edx] = -0.04;
  NEUTRE[K.hgz] = NEUTRE[K.hdz] = 0.03;
  const BRAS_SUSP = 2.42;
  const ASSIS_CUISSE = 1.7, ASSIS_GENOU = 0.12;
  const pulse = (t) => Math.exp(-((t % 1 + 1) % 1) * 6);
  const accroupir = (P, a, m) => {
    const C = m.D.cuisse, Ti = m.D.tibia, b = a + Math.asin(Math.min(1, C * Math.sin(a) / Ti));
    P[K.hgx] = P[K.hdx] = -a;
    P[K.gg] = P[K.gd] = b;
    P[K.by] = -(C + Ti - C * Math.cos(a) - Ti * Math.cos(b - a));
    P[K.tx] = 0.5 * a;
  };
  const ANIMS = {
    repos: (P, t, m) => {
      const s = Math.sin(t * 2.1 + m.ph), r = Math.sin(t * 0.43 + m.ph * 2);
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
      P[K.plat] = 1;
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
      P[K.plat] = 1;
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
    // (bras un peu plus en avant que dans l'imitation : la vraie tête est grande, et les cheveux longs cachaient la main)
    saluer: (P, t, m) => {
      ANIMS.repos(P, t, m);
      const w = Math.sin(t * PI2 * 1.8);
      P[K.edz] = 2.3 + 0.34 * w;
      P[K.edx] = -0.55;
      P[K.cd] = 0.35 + 0.25 * w;
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
      P[K.by] = Math.max(0, -8e-3 + 0.014 * Math.abs(Math.sin(t * PI2 * 1.55)));
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
    // assis par terre, jambes allongées devant, mains posées derrière (le point d'ancrage reste au
    // sol) : le bassin descend de ce que les jambes perdent en hauteur (comme accroupir), les talons restent donc posés.
    // (Avant, 21/10 : bassin fixé à 4,5 % de la hanche de l'imitation et jambes plongeant vers le sol : au banc, fesses à
    // −3 % de la taille du Mii, talons à −10 %, tout l'assis sous le sol.)
    assisSol: (P, t, m) => {
      const C = m.D.cuisse, Ti = m.D.tibia, a = ASSIS_CUISSE, b = ASSIS_GENOU;
      P[K.by] = -(C + Ti - C * Math.cos(a) - Ti * Math.cos(a - b));
      P[K.hgx] = P[K.hdx] = -a;
      P[K.gg] = b - 0.03 + 0.06 * Math.sin(t * 1.3 + m.ph);
      P[K.gd] = b;
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
    },
    // ---- gestes des scènes de l'accueil (mii-accueil.js) : des poses franches, tenues, sans balancement permanent
    // (étude de l'animation Nintendo : banc/luigi-animation-etude/etude.md) ----
    // le « mouton » du saute-mouton : accroupi, mains sur les genoux, dos rond
    accroupi: (P, t, m) => {
      accroupir(P, 0.95, m);
      P[K.tx] = 0.8;
      P[K.egx] = P[K.edx] = -0.7;
      P[K.egz] = P[K.edz] = 0.32;
      P[K.cg] = P[K.cd] = 0.25;
      P[K.hx] = -0.4;
    },
    // grimper à une échelle, de dos : m.pasQ (0 → 1) fait passer d'un appui à l'autre, m.pasN donne le côté
    grimper: (P, t, m) => {
      const q = lisse(m.pasQ ?? 1), k = ((m.pasN ?? 0) % 2 ? 1 : -1) * (2 * q - 1);
      P[K.egz] = 2.55 + 0.35 * k;
      P[K.edz] = 2.55 - 0.35 * k;
      P[K.egx] = P[K.edx] = -0.35;
      P[K.cg] = 0.45 - 0.35 * k;
      P[K.cd] = 0.45 + 0.35 * k;
      P[K.hgx] = -0.25 - 0.85 * Math.max(0, k);
      P[K.gg] = 0.3 + 1.3 * Math.max(0, k);
      P[K.hdx] = -0.25 - 0.85 * Math.max(0, -k);
      P[K.gd] = 0.3 + 1.3 * Math.max(0, -k);
      P[K.tx] = 0.12;
      P[K.hx] = -0.2;
    },
    // somnoler assis par terre : tête qui tombe, et qui se redresse d'un coup de temps en temps
    somnoler: (P, t, m) => {
      ANIMS.assisSol(P, t, m);
      const c = (t + m.ph) % 4.2, tombe = c < 3.6 ? lisse(c / 3.6) : 1 - lisse((c - 3.6) / 0.12);
      P[K.hx] = 0.1 + 0.42 * tombe;
      P[K.hy] = 0.05;
      P[K.tx] = 0.05 + 0.12 * tombe;
      P[K.egx] = P[K.edx] = -0.45;
      P[K.egz] = P[K.edz] = 0.28;
      P[K.cg] = P[K.cd] = 0.7;
    },
    // se frotter la tête (après une chute)
    frotter: (P, t, m) => {
      const r = Math.sin(t * 16);
      P[K.edz] = 2.1;
      P[K.edx] = -0.6;
      P[K.cd] = 1.3 + 0.25 * r;
      P[K.hz] = 0.16;
      P[K.hx] = 0.12;
      P[K.tz] = 0.05;
      P[K.egz] = 0.36;
      P[K.egx] = -0.1;
      P[K.by] = -6e-3;
    },
    // porter quelque chose au-dessus de la tête, à l'arrêt ou en marchant (échelle)
    porter: (P, t, m) => {
      P[K.egz] = P[K.edz] = 2.35;
      P[K.egx] = P[K.edx] = -0.45;
      P[K.cg] = P[K.cd] = 0.7;
      P[K.hx] = -0.05;
    },
    // (bras levés de côté : une main devant le visage disparaît dans la grande tête)
    porterMarche: (P, t, m) => {
      ANIMS.marcher(P, t, m);
      ANIMS.porter(P, t, m);
      P[K.ty] *= 0.4;
    },
    // les mains sur les yeux (cache-cache : il compte)
    yeux: (P, t, m) => {
      const b = Math.abs(Math.sin(t * 2.6)) ** 6;
      P[K.egx] = P[K.edx] = -1.75;
      P[K.egz] = P[K.edz] = 0.45;
      P[K.cg] = P[K.cd] = 1.55;
      P[K.hx] = 0.2 + 0.04 * b;
      P[K.tx] = 0.12 + 0.03 * b;
      P[K.by] = -4e-3 * b;
    },
    // un appareil photo tenu devant le visage
    photo: (P, t, m) => {
      P[K.egx] = P[K.edx] = -1.65;
      P[K.egz] = P[K.edz] = 0.3;
      P[K.cg] = P[K.cd] = 1.25;
      P[K.hx] = -0.06;
      P[K.tx] = -0.03;
    },
    // lancer (avion en papier, ballon) : armer en arrière, puis le bras part d'un coup et reste tendu
    lancer: (P, t, m) => {
      const arme = lisse(t / 0.14), part = lisse((t - 0.34) / 0.1);
      P[K.edx] = 0.95 * arme * (1 - part) - 1.7 * part;
      P[K.edz] = 0.5 + 0.7 * part;
      P[K.cd] = 0.9 * (1 - part) + 0.15;
      P[K.ty] = -0.22 * arme * (1 - part) + 0.2 * part;
      P[K.tx] = -0.05 * arme + 0.12 * part;
      P[K.egz] = 0.4;
      P[K.egx] = -0.4 * part;
      P[K.hgx] = -0.25 * part;
    },
    // balayer : bras bas en avant (le manche), le buste va et vient par à-coups
    balayer: (P, t, m) => {
      const s = Math.sin(t * 7.5), c = Math.sign(s) * Math.abs(s) ** 0.45;
      P[K.egx] = P[K.edx] = -0.8;
      P[K.egz] = 0.2;
      P[K.edz] = 0.12;
      P[K.cg] = 0.55;
      P[K.cd] = 0.35;
      P[K.ty] = 0.3 * c;
      P[K.tx] = 0.3;
      P[K.hx] = 0.15;
      P[K.bx] = 8e-3 * c;
    },
    // frapper à une porte : le poing part en avant, toc, toc
    frapper: (P, t, m) => {
      const k = Math.max(0, Math.sin(t * PI2 * 2.6)) ** 3;
      P[K.edx] = -1.25 - 0.2 * k;
      P[K.edz] = 0.32;
      P[K.cd] = 1.45 - 0.55 * k;
      P[K.tx] = 0.06 + 0.04 * k;
      P[K.egz] = 0.3;
      P[K.hz] = 0.05;
    },
    // s'étirer en se réveillant
    // réception lourde, genoux écartés (lisible de face), une main au sol, l'autre écartée
    atterrir: (P, t, m) => {
      accroupir(P, 1.15, m);
      P[K.hgz] = P[K.hdz] = 0.6;
      P[K.tx] = 0.65;
      P[K.edx] = -0.9;
      P[K.edz] = 0.35;
      P[K.cd] = 0.2;
      P[K.egz] = 0.9;
      P[K.egx] = 0.2;
      P[K.cg] = 0.3;
      P[K.hx] = -0.35;
    },
    // dos plaqué contre un mur, mains à plat derrière soi
    plaque: (P, t, m) => {
      P[K.egx] = P[K.edx] = 0.45;
      P[K.egz] = P[K.edz] = 0.12;
      P[K.cg] = P[K.cd] = 0.15;
      P[K.tx] = -0.1;
      P[K.hx] = -0.08;
      P[K.by] = -4e-3;
    },
    // ramper (le corps est couché par le metteur en scène) : bras qui tirent tour à tour, jambes qui poussent, tête relevée
    ramper: (P, t, m) => {
      const c = Math.sin(t * PI2 * 1.2);
      P[K.egz] = 2 + 0.5 * c;
      P[K.edz] = 2 - 0.5 * c;
      P[K.egx] = P[K.edx] = -0.6;
      P[K.cg] = 0.8 - 0.5 * c;
      P[K.cd] = 0.8 + 0.5 * c;
      P[K.hgx] = 0.15 + 0.35 * c;
      P[K.hdx] = 0.15 - 0.35 * c;
      P[K.gg] = 0.5 + 0.4 * Math.max(0, c);
      P[K.gd] = 0.5 + 0.4 * Math.max(0, -c);
      P[K.hgz] = P[K.hdz] = 0.12;
      P[K.hx] = -1.05;
    },
    // glissade : couché en arrière, jambes devant, bras en arrière
    glisse: (P, t, m) => {
      P[K.by] = -m.D.hanche * 0.55;
      P[K.hgx] = -1.35;
      P[K.hdx] = -1.05;
      P[K.gg] = 0.05;
      P[K.gd] = 0.45;
      P[K.tx] = -0.45;
      P[K.egx] = P[K.edx] = 0.6;
      P[K.egz] = P[K.edz] = 0.35;
      P[K.cg] = P[K.cd] = 0.2;
      P[K.hx] = 0.15;
    },
    // les deux paumes poussées devant soi, accroupi, buste de profil (projeter une boule d'énergie)
    projeter: (P, t, m) => {
      const q = lisse(t / 0.12);
      accroupir(P, 0.45, m);
      P[K.egx] = P[K.edx] = -1.5 * q;
      P[K.egz] = -0.12;
      P[K.edz] = -0.05;
      P[K.cg] = P[K.cd] = 0.15;
      P[K.tx] = 0.35;
      P[K.ty] = 0.25;
      P[K.hx] = -0.2;
    },
    // les mains ramenées à la hanche, accroupi, buste tourné (charger une boule d'énergie)
    charger: (P, t, m) => {
      accroupir(P, 0.45, m);
      P[K.egx] = P[K.edx] = 0.45;
      P[K.egz] = P[K.edz] = 0.45;
      P[K.cg] = P[K.cd] = 1.7;
      P[K.ty] = -0.35;
      P[K.tx] = 0.05;
      P[K.hy] = 0.3;
    },
    // garde de combat, poings levés, sautille
    garde: (P, t, m) => {
      const b = Math.abs(Math.sin(t * PI2 * 1.6));
      accroupir(P, 0.22 + 0.06 * b, m);
      P[K.egx] = -1;
      P[K.edx] = -0.8;
      P[K.egz] = P[K.edz] = 0.35;
      P[K.cg] = 1.9;
      P[K.cd] = 2;
      P[K.ty] = 0.35;
      P[K.tx] = 0.12;
      P[K.hy] = -0.15;
    },
    // coup de pied de face
    coupPied: (P, t, m) => {
      const q = lisse(t / 0.12);
      P[K.hdx] = -1.5 * q;
      P[K.gd] = 0.15;
      P[K.hgx] = 0.1;
      P[K.egx] = -0.6;
      P[K.egz] = 0.5;
      P[K.cg] = 1.4;
      P[K.edz] = 0.6;
      P[K.edx] = 0.3;
      P[K.cd] = 1.4;
      P[K.tx] = -0.2 * q;
    },
    // une épée brandie à deux mains au-dessus de la tête
    brandir: (P, t, m) => {
      P[K.egz] = P[K.edz] = 2.65;
      P[K.egx] = P[K.edx] = -0.35;
      P[K.cg] = P[K.cd] = 0.45;
      P[K.hx] = -0.15;
      P[K.by] = 0.01;
    },
    // les deux bras tendus devant soi
    brasTendus: (P, t, m) => {
      P[K.egx] = P[K.edx] = -1.5;
      P[K.egz] = 0.02;
      P[K.edz] = 0.02;
      P[K.cg] = P[K.cd] = 0.05;
      P[K.hx] = -0.03;
      P[K.tx] = 0.03;
    },
    // poser quelque chose par terre devant soi
    deposer: (P, t, m) => {
      const q = lisse(t / 0.3);
      accroupir(P, 0.9 * q, m);
      P[K.tx] = 0.7 * q;
      P[K.egx] = P[K.edx] = -1.1 * q;
      P[K.egz] = P[K.edz] = 0.25;
      P[K.cg] = P[K.cd] = 0.3;
      P[K.hx] = 0.2 * q;
    },
    // tenir une arme à deux mains, épaulée, canon devant soi
    viser: (P, t, m) => {
      P[K.edx] = -1.45;
      P[K.edz] = 0.12;
      P[K.cd] = 0.25;
      P[K.egx] = -1.25;
      P[K.egz] = -0.32;
      P[K.cg] = 1.05;
      P[K.tx] = 0.06;
      P[K.ty] = 0.12;
      P[K.hx] = -0.04 + 0.03 * Math.sin(t * 1.7);
      P[K.hy] = 0.12;
      P[K.by] = -0.01;
    },
    // le bras droit tendu devant soi (canon pointé), l'autre en garde
    pointer: (P, t, m) => {
      P[K.edx] = -1.55;
      P[K.edz] = 0.05;
      P[K.cd] = 0.02;
      P[K.egx] = -0.35;
      P[K.egz] = 0.4;
      P[K.cg] = 1.2;
      P[K.ty] = 0.25;
      P[K.tx] = 0.04;
      P[K.hy] = -0.1;
    },
    // coup d'épée en travers (bras droit qui balaie), puis bras tendu
    trancher: (P, t, m) => {
      const q = lisse(t / 0.12), r = lisse((t - 0.12) / 0.1);
      P[K.edz] = 0.5 + 1.9 * q * (1 - r) + 0.3 * r;
      P[K.edx] = -0.3 * q - 1.2 * r;
      P[K.cd] = 0.4 * (1 - r);
      P[K.ty] = 0.35 * q - 0.7 * r;
      P[K.tx] = 0.1 * r;
      P[K.egz] = 0.5;
      P[K.egx] = -0.4;
      P[K.cg] = 1;
      accroupir(P, 0.25 * r, m);
      P[K.tx] += 0.2 * r;
    },
    // poings sur les hanches, le pied qui tape (impatient)
    impatient: (P, t, m) => {
      P[K.egz] = P[K.edz] = 0.55;
      P[K.egx] = P[K.edx] = 0.25;
      P[K.cg] = P[K.cd] = 2;
      const k = Math.max(0, Math.sin(t * PI2 * 2.2));
      P[K.hdx] = -0.25 * k;
      P[K.gd] = 0.35 * k;
      P[K.hy] = 0.1 * Math.sin(t * 0.9);
      P[K.tz] = 0.03;
    },
    // l'index qui fait non-non (bras droit levé devant), l'autre poing sur la hanche
    doigt: (P, t, m) => {
      P[K.egz] = 0.55;
      P[K.egx] = 0.25;
      P[K.cg] = 2;
      P[K.edx] = -1.2;
      P[K.edz] = 0.35 + 0.18 * Math.sin(t * PI2 * 2.4);
      P[K.cd] = 1.7;
      P[K.hz] = -0.06 * Math.sin(t * PI2 * 2.4);
    },
    // accroupi en boule (élan de la toupie)
    boule: (P, t, m) => {
      accroupir(P, 1.15, m);
      P[K.tx] = 1;
      P[K.hx] = 0.5;
      P[K.egx] = P[K.edx] = -1.3;
      P[K.egz] = P[K.edz] = 0.1;
      P[K.cg] = P[K.cd] = 2.2;
    },
    // trembler de peur, ramassé sur lui-même
    peur: (P, t, m) => {
      accroupir(P, 0.35, m);
      const f = Math.sin(t * 38) * 0.025;
      P[K.bx] = f;
      P[K.tx] = 0.25;
      P[K.egx] = P[K.edx] = -1.3;
      P[K.egz] = P[K.edz] = 0.55;
      P[K.cg] = P[K.cd] = 2.1;
      P[K.hx] = 0.2 + f;
      P[K.hz] = f * 2;
    },
    // victoire : poing levé
    victoire: (P, t, m) => {
      const q = lisse(t / 0.18);
      P[K.edz] = 0.24 + 2.4 * q;
      P[K.edx] = -0.3 * q;
      P[K.cd] = 0.9 * q;
      P[K.egz] = 0.4;
      P[K.egx] = -0.2;
      P[K.cg] = 1.3;
      P[K.by] = 0.02 * q;
      P[K.hx] = -0.15 * q;
    },
    // plongeon de l'ange : bras grands ouverts (un peu en arrière), jambes serrées et tendues, tête relevée
    ange: (P, t, m) => {
      const q = lisse(t / 0.2);
      P[K.egz] = P[K.edz] = 0.24 + 1.3 * q;
      P[K.egx] = P[K.edx] = 0.35 * q;
      P[K.cg] = P[K.cd] = 0.05;
      P[K.hgx] = P[K.hdx] = 0.12 * q;
      P[K.gg] = P[K.gd] = 0.04;
      P[K.hgz] = P[K.hdz] = 0;
      P[K.hx] = -0.3 * q;
      P[K.tx] = -0.08 * q;
    },
    // tapi au bord d'un toit : accroupi bas, une main posée devant, tête qui scrute
    tapi: (P, t, m) => {
      accroupir(P, 1.05, m);
      P[K.tx] = 0.55;
      P[K.egx] = -1.2;
      P[K.egz] = 0.2;
      P[K.cg] = 0.3;
      P[K.edx] = -0.5;
      P[K.edz] = 0.45;
      P[K.cd] = 0.9;
      P[K.hx] = -0.45 + 0.05 * Math.sin(t * 1.3);
      P[K.hy] = 0.35 * Math.sin(t * 0.8);
    },
    etirer: (P, t, m) => {
      const q = lisse(t / 0.25);
      P[K.egz] = P[K.edz] = 0.24 + 2.65 * q;
      P[K.egx] = P[K.edx] = -0.15 * q;
      P[K.cg] = P[K.cd] = 0.05;
      P[K.hx] = -0.3 * q;
      P[K.tx] = -0.1 * q;
      P[K.ech] = 1 + 0.04 * q;
    },
    // ---- le groupe de la page Paroles (acces-rapide.js ; Wii Music, concerts de Tomodachi Life) : t compté en temps du
    // morceau (1 = un temps, posé par la page), m.energie : 1 en festive, moins en douce. Les objets tenus sont ceux de la
    // page, posés sur les mains (main droite : le Mii la lève à gauche de l'écran) ----
    // chanteur : le micro dans la main droite sous le menton, la gauche qui s'ouvre au fil de la phrase
    chanter: (P, t, m) => {
      const e = m.energie ?? 1, s = Math.sin(t * Math.PI / 2), k = pulse(t);
      accroupir(P, 0.1 * e * k, m);
      P[K.edx] = -1.6;
      P[K.edz] = 0.3;
      P[K.cd] = 1.4;
      P[K.hx] = -0.1 - 0.05 * s;
      P[K.egz] = 0.45 + 0.55 * e * (0.5 + 0.5 * s);
      P[K.egx] = -0.55;
      P[K.cg] = 0.45;
      P[K.tz] = 0.05 * e * s;
      P[K.hz] = 0.07 * e * s;
    },
    // guitare : la main droite gratte sur le temps (aller au temps, retour au contretemps), la gauche tient le manche
    guitare: (P, t, m) => {
      const e = m.energie ?? 1, g = Math.cos(t * PI2);
      accroupir(P, 0.12 * e * pulse(t), m);
      P[K.edx] = -0.7;
      P[K.edz] = 0.15;
      P[K.cd] = 0.95 + 0.3 * g;
      P[K.ty] = 0.06 * g * e;
      P[K.egx] = -0.75;
      P[K.egz] = 0.95;
      P[K.cg] = 0.45;
      P[K.hz] = 0.08 * Math.sin(t * Math.PI / 2);
      P[K.hx] = 0.06;
    },
    // tambour : les baguettes frappent à tour de rôle, la droite sur le temps, la gauche au contretemps
    tambour: (P, t, m) => {
      const e = m.energie ?? 1, d = pulse(t), g = pulse(t + 0.5) * e;
      accroupir(P, 0.18 + 0.08 * e * d, m);
      P[K.edx] = -0.85;
      P[K.edz] = 0.3;
      P[K.cd] = 0.55 + 0.75 * (1 - d);
      P[K.egx] = -0.85;
      P[K.egz] = 0.3;
      P[K.cg] = 0.55 + 0.75 * (1 - g);
      P[K.tx] = 0.12;
      P[K.hx] = 0.05 * d;
    },
    // clavier : les deux mains sur les touches, qui vont et viennent ; le buste suit
    clavier: (P, t, m) => {
      const e = m.energie ?? 1, s = Math.sin(t * Math.PI / 2), a = pulse(t * 2), b = pulse(t * 2 + 0.5);
      accroupir(P, 0.08 * e * pulse(t), m);
      P[K.edx] = -1;
      P[K.egx] = -1;
      P[K.edz] = 0.2 - 0.1 * s;
      P[K.egz] = 0.2 + 0.1 * s;
      P[K.cd] = 0.95 + 0.12 * a;
      P[K.cg] = 0.95 + 0.12 * b;
      P[K.ty] = 0.1 * s;
      P[K.tx] = 0.1;
      P[K.hz] = 0.06 * s;
      P[K.hx] = 0.08;
    },
    // maracas : une dans chaque main, secouées tour à tour, deux fois par temps
    maracas: (P, t, m) => {
      const e = m.energie ?? 1, a = pulse(t * 2), b = pulse(t * 2 + 0.5);
      accroupir(P, 0.12 * e * pulse(t), m);
      P[K.edx] = P[K.egx] = -0.75;
      P[K.edz] = P[K.egz] = 0.95;
      P[K.cd] = 1.05 + 0.45 * a * e;
      P[K.cg] = 1.05 + 0.45 * b * e;
      P[K.tz] = 0.05 * Math.sin(t * Math.PI);
      P[K.hz] = 0.08 * Math.sin(t * Math.PI);
    },
    // tambourin : levé dans la main droite, secoué et frappé sur le temps, la gauche sur la hanche
    tambourin: (P, t, m) => {
      const e = m.energie ?? 1, k = pulse(t);
      accroupir(P, 0.12 * e * k, m);
      P[K.edz] = 0.85 + 0.25 * k * e;
      P[K.edx] = -1.35 - 0.15 * k;
      P[K.cd] = 0.6 + 0.3 * k;
      P[K.egz] = 0.55;
      P[K.egx] = 0.25;
      P[K.cg] = 2;
      P[K.tz] = 0.08 * e * Math.sin(t * Math.PI);
      P[K.hz] = -0.08 * Math.sin(t * Math.PI);
    },
    // danses (Wii Music, Wii Party) : balancement, clap, bras en l'air, pas chassés, tour sur soi (le cap est tenu par la
    // page), saut de joie
    balancer: (P, t, m) => {
      const e = m.energie ?? 1, s = Math.sin(t * Math.PI);
      accroupir(P, 0.1 * pulse(t), m);
      P[K.bx] = 0.02 * e * s;
      P[K.brz] = -0.06 * e * s;
      P[K.tz] = 0.1 * e * s;
      P[K.hz] = 0.12 * s;
      P[K.egz] = 0.95 + 0.4 * e * s;
      P[K.edz] = 0.95 - 0.4 * e * s;
      P[K.egx] = P[K.edx] = -0.35;
      P[K.cg] = P[K.cd] = 0.6;
    },
    clap: (P, t, m) => {
      const e = m.energie ?? 1, c = Math.abs(Math.sin(t * Math.PI)), s = Math.sin(t * Math.PI / 2);
      accroupir(P, 0.14 * e * pulse(t), m);
      P[K.egx] = P[K.edx] = -1.15 - 0.2 * e * Math.max(0, s);
      P[K.egz] = P[K.edz] = -0.32 + 0.34 * c;
      P[K.cg] = P[K.cd] = 0.45;
      P[K.tz] = 0.06 * s;
      P[K.hz] = 0.1 * s;
      P[K.hx] = -0.08;
    },
    brasHaut: (P, t, m) => {
      const e = m.energie ?? 1, s = Math.sin(t * Math.PI);
      accroupir(P, 0.15 * e * pulse(t), m);
      P[K.egz] = 2.45 + 0.2 * s;
      P[K.edz] = 2.45 - 0.2 * s;
      P[K.egx] = P[K.edx] = -0.25;
      P[K.cg] = P[K.cd] = 0.3;
      P[K.tz] = -0.12 * e * s;
      P[K.hz] = 0.1 * s;
      P[K.hx] = -0.12;
    },
    chasse: (P, t, m) => {
      const e = m.energie ?? 1, u = t % 2, c = Math.sin(t * Math.PI), l = Math.max(0, Math.sin(u * PI2)), r = Math.max(0, -Math.sin(u * PI2));
      P[K.bx] = 0.06 * e * c;
      P[K.hgz] = 0.03 + 0.3 * e * l;
      P[K.hdz] = 0.03 + 0.3 * e * r;
      P[K.gg] = 0.2 * l;
      P[K.gd] = 0.2 * r;
      P[K.by] = 0.012 * e * (l + r);
      P[K.egz] = 0.9 + 0.4 * l;
      P[K.edz] = 0.9 + 0.4 * r;
      P[K.egx] = P[K.edx] = -0.3;
      P[K.cg] = P[K.cd] = 0.9;
      P[K.tz] = -0.08 * c;
      P[K.hz] = 0.1 * c;
    },
    tour: (P, t, m) => {
      const e = m.energie ?? 1;
      accroupir(P, 0.1 * pulse(t), m);
      P[K.egz] = P[K.edz] = 1.35;
      P[K.egx] = P[K.edx] = -0.15;
      P[K.cg] = P[K.cd] = 0.35;
      P[K.hx] = -0.1 * e;
    },
    sautJoie: (P, t, m) => {
      const e = m.energie ?? 1, h = Math.sin(t % 1 * Math.PI);
      P[K.by] = 0.07 * e * h;
      P[K.hgx] = P[K.hdx] = -0.35 * h;
      P[K.gg] = P[K.gd] = 0.7 * h;
      P[K.egz] = P[K.edz] = 2.3 + 0.25 * h;
      P[K.egx] = P[K.edx] = -0.3;
      P[K.cg] = P[K.cd] = 0.3;
      P[K.hx] = -0.15;
    }
  };
  const BRAS = {
    salut: (P, t) => {
      const w = Math.sin(t * PI2 * 1.8);
      P[K.edz] = 2.3 + 0.34 * w;
      P[K.edx] = -0.55;
      P[K.cd] = 0.35 + 0.25 * w;
    },
    tenir: (P) => {
      P[K.edz] = 0.42;
      P[K.edx] = -1.05;
      P[K.cd] = 1.55;
    },
    // un manche tenu devant soi, droit (parapluie, ballon)
    visiere: (P) => {
      P[K.edz] = 1.95;
      P[K.edx] = -1;
      P[K.cd] = 1.7;
    },
    // main contre la tempe (devant le front, la tête la cacherait)     // la main en visière
    haut: (P) => {
      P[K.edz] = 2.2;
      P[K.edx] = -0.65;
      P[K.cd] = 0.35;
    }
    // bras tendu vers le haut (ficelle d'un ballon, parapluie ouvert)
  };
  const PRISES = {
    arme: (P) => {
      P[K.edx] = -0.3;
      P[K.edz] = 0.25;
      P[K.cd] = 0.85;
      P[K.egx] = -0.7;
      P[K.egz] = -0.3;
      P[K.cg] = 1.25;
    }
  };
  const BRAS_LIBRES = /* @__PURE__ */ new Set([
    "grimper",
    "hisser",
    "suspendu",
    "tomber",
    "porter",
    "porterMarche",
    "pousser",
    "content",
    "victoire",
    "saluer",
    "applaudir",
    "frotter",
    "etirer",
    "yeux",
    "photo",
    "lancer",
    "balayer",
    "frapper",
    "hausser",
    "danser",
    "peur",
    "doigt",
    "impatient",
    "boule",
    "ange",
    "trancher",
    "pointer",
    "tapi",
    "atterrir",
    "plaque",
    "glisse",
    "ramper",
    "projeter",
    "charger",
    "garde",
    "coupPied",
    "brandir",
    "brasTendus",
    "deposer",
    "fin",
    "pose1",
    "pose2",
    "pose3",
    "pose4",
    "pose5",
    "pose6",
    "pose7",
    "pose8",
    "pose9",
    "pose10",
    "pose11",
    "pose12",
    "pose13",
    "pose14"
  ]);
  ANIMS.bouger = ANIMS.repos;
  const EXPRESSIONS = {
    saluer: "sourire",
    applaudir: "joie",
    content: "joie",
    danser: "joie",
    chanter: "parle",
    guitare: "joie",
    tambour: "joie",
    clavier: "sourire",
    maracas: "joie",
    tambourin: "joie",
    balancer: "sourire",
    clap: "joie",
    brasHaut: "joie",
    chasse: "joie",
    tour: "joie",
    sautJoie: "joie",
    tomber: "surprise",
    pousser: "effort",
    rattraper: "inquiet",
    hisser: "effort",
    parler: "parle",
    hausser: "inquiet",
    fin: "joie",
    accroupi: "sourire",
    grimper: "effort",
    somnoler: "cligne",
    frotter: "inquiet",
    ange: "neutre",
    tapi: "neutre",
    projeter: "fache",
    charger: "fache",
    garde: "fache",
    coupPied: "fache",
    brandir: "effort",
    brasTendus: "neutre",
    deposer: "neutre",
    plaque: "neutre",
    glisse: "effort",
    ramper: "effort",
    atterrir: "effort",
    viser: "neutre",
    pointer: "effort",
    trancher: "effort",
    impatient: "neutre",
    doigt: "clin",
    boule: "effort",
    peur: "inquiet",
    victoire: "joie",
    porter: "effort",
    porterMarche: "effort",
    yeux: "sourire",
    photo: "sourire",
    lancer: "joie",
    balayer: "sourire",
    etirer: "joie"
  };
  const eu = new T.Euler(), qe = new T.Quaternion();
  const A3 = [0, 0, 0], tri = (x, y, z) => {
    A3[0] = x;
    A3[1] = y;
    A3[2] = z;
    return A3;
  };
  const ANGLES = [
    (P) => tri(P[K.brx], P[K.bry], P[K.brz]),
    null,
    (P) => tri(P[K.tx], P[K.ty], P[K.tz]),
    (P) => tri(P[K.hx], P[K.hy], P[K.hz]),
    (P) => tri(P[K.egx], P[K.egy], P[K.egz]),
    (P) => tri(-P[K.cg], 0, 0),
    null,
    (P) => tri(P[K.edx], -P[K.edy], -P[K.edz]),
    (P) => tri(-P[K.cd], 0, 0),
    null,
    (P) => tri(P[K.hgx], 0, P[K.hgz]),
    (P) => tri(P[K.gg], 0, 0),
    (P) => tri(-P[K.plat] * (P[K.hgx] + P[K.gg]), 0, 0),
    (P) => tri(P[K.hdx], 0, -P[K.hdz]),
    (P) => tri(P[K.gd], 0, 0),
    (P) => tri(-P[K.plat] * (P[K.hdx] + P[K.gd]), 0, 0)
  ];
  const nouvellePose = () => ({ q: OS.map(() => new T.Quaternion()), o: new T.Vector3(), r: [1, 0, 0] });
  const depuisCanaux = (P, g, U, pose) => {
    for (let i = 0; i < OS.length; i++) {
      const a = ANGLES[i], zp = g.Zp[i], z = g.Z[i];
      let ex = 0, ey = 0, ez = 0, ew = 1;
      if (a) {
        const r = a(P);
        euler(r[0], r[1], r[2]);
        ex = Q4[0];
        ey = Q4[1];
        ez = Q4[2];
        ew = Q4[3];
      }
      const ax = zp._x, ay = zp._y, az = zp._z, aw = zp._w;
      const mx = ax * ew + aw * ex + ay * ez - az * ey, my = ay * ew + aw * ey + az * ex - ax * ez, mz = az * ew + aw * ez + ax * ey - ay * ex, mw = aw * ew - ax * ex - ay * ey - az * ez;
      const bx = z._x, by = z._y, bz = z._z, bw = z._w;
      pose.q[i].set(mx * bw + mw * bx + my * bz - mz * by, my * bw + mw * by + mz * bx - mx * bz, mz * bw + mw * bz + mx * by - my * bx, mw * bw - mx * bx - my * by - mz * bz);
    }
    pose.o.set(P[K.bx], P[K.by], P[K.bz]).multiplyScalar(U);
    pose.r[0] = P[K.ech];
    pose.r[1] = P[K.rx];
    pose.r[2] = P[K.rz];
  };
  const depuisClip = (clip, t, g, pose) => {
    for (let i = 0; i < OS.length; i++) pose.q[i].copy(g.Zp[i]).multiply(g.Z[i]);
    pose.o.set(0, 0, 0);
    pose.r[0] = 1;
    pose.r[1] = pose.r[2] = 0;
    for (const p of clip.pistes) {
      const v = p.interp.evaluate(t);
      if (p.prop === "quaternion") pose.q[p.i].fromArray(v);
      else pose.o.fromArray(v).sub(g.racineRepos).applyQuaternion(g.racineParent);
    }
  };
  const copier = (A, B) => {
    for (let i = 0; i < OS.length; i++) A.q[i].copy(B.q[i]);
    A.o.copy(B.o);
    A.r[0] = B.r[0];
    A.r[1] = B.r[1];
    A.r[2] = B.r[2];
  };
  const melanger = (A, B, w) => {
    for (let i = 0; i < OS.length; i++) A.q[i].slerp(B.q[i], w);
    A.o.lerp(B.o, w);
    for (let k = 0; k < 3; k++) A.r[k] += (B.r[k] - A.r[k]) * w;
  };
  let texOmbre = null;
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
  const mouvements = (m) => {
    const objet = m.objet;
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
    m.viser = (dx, dz) => {
      if (Math.abs(dx) + Math.abs(dz) < 1e-6) return;
      const a = Math.atan2(dx, dz);
      m.capVise = a * (1 - m.triche);
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
    m.allerVers = (but, o = {}) => {
      const v = FOULEE[o.courir ? "courir" : "marcher"] * (o.vitesse || 1) * m.taille, pos = objet.position;
      m.jouer(o.courir ? "courir" : "marcher");
      return lancer("aller", (dt) => {
        const dx = but.x - pos.x, dz = but.z - pos.z, d = Math.hypot(dx, dz), pas = v * dt;
        if (d <= pas) {
          pos.x = but.x;
          pos.z = but.z;
          m.jouer(o.ensuite || "repos");
          m.action.fin();
          return;
        }
        pos.x += dx / d * pas;
        pos.z += dz / d * pas;
        m.viser(dx, dz);
      });
    };
    m.sauterVers = (but, o = {}) => {
      const gr = (o.gravite ?? 16) * m.taille, p0 = objet.position.clone(), haut = Math.max(p0.y, but.y) + (o.hauteur ?? 0.55) * m.taille;
      const tm = Math.sqrt(2 * (haut - p0.y) / gr), td = Math.sqrt(2 * (haut - but.y) / gr), duree = tm + td, prep = o.prep ?? 0.14;
      let t = -prep;
      m.saut = { ph: "prep", q: 0 };
      m.jouer("sauter", { fondu: 0.1 });
      m.viser(but.x - p0.x, but.z - p0.z);
      if (o.sol !== void 0) m.sol = o.sol;
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
          objet.position.y = t < tm ? haut - 0.5 * gr * (tm - t) ** 2 : haut - 0.5 * gr * (t - tm) ** 2;
          if (o.salto) m.salto.rotation.x = PI2 * lisse(q * 1.1);
          if (o.sol !== void 0 && q > 0.5) m.sol = but.y;
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
        m.jouer(o.ensuite || "repos", { fondu: 0.15 });
        m.action.fin();
      });
    };
    m.tomber = (ySol, o = {}) => {
      const gr = (o.gravite ?? 16) * m.taille;
      let vy = o.vy ?? 0, t = 0, pose = false;
      m.jouer("tomber", { fondu: 0.12 });
      return lancer("tomber", (dt) => {
        t += dt;
        if (!pose) {
          vy -= gr * dt;
          objet.position.y += vy * dt;
          if (objet.position.y <= ySol) {
            objet.position.y = ySol;
            pose = true;
            t = 0;
            m.jouer("rattraper", { fondu: 0.06 });
          }
          return;
        }
        if (t > (o.recuperation ?? 0.9)) {
          m.jouer("repos");
          m.action.fin();
        }
      });
    };
  };
  const tourner = (m, dt) => {
    let dc = m.capVise - m.cap;
    dc = Math.atan2(Math.sin(dc), Math.cos(dc));
    m.cap += dc * (1 - Math.exp(-dt * 9));
  };
  const pantin = (o = {}) => {
    const m = {
      pantin: true,
      objet: new T.Object3D(),
      salto: new T.Object3D(),
      d: { graine: o.graine ?? null, nom: o.nom ?? null },
      ph: Math.random() * 6.3,
      cadence: 0.95 + Math.random() * 0.12,
      anim: "repos",
      t: 0,
      vitesse: 1,
      fonduVoulu: 0,
      nJouer: 0,
      cap: 0,
      capVise: 0,
      triche: 0,
      inclinaison: 0,
      regard: null,
      expr: null,
      action: null,
      saut: null,
      sol: null,
      taille: o.taille ?? 1,
      bras: null
    };
    m.jouer = (nom, opt = {}) => {
      if (!ANIMS[nom] && !CLIPS[nom]) return m;
      if (nom === m.anim && !opt.redemarrer) return m;
      m.anim = nom;
      m.t = 0;
      m.vitesse = opt.vitesse ?? 1;
      m.fonduVoulu = opt.fondu ?? 0.25;
      m.nJouer++;
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
      return m;
    };
    m.maj = (dt) => {
      dt = Math.min(dt, 0.1);
      if (m.action) m.action.maj(dt);
      m.t += dt * m.vitesse;
      tourner(m, dt);
      m.objet.rotation.set(m.inclinaison, m.cap, 0);
    };
    m.liberer = () => m.action?.rejeter("lib\xE9r\xE9");
    mouvements(m);
    return m;
  };
  const HAUT_IMITATION = 0.255;
  const creer = (o = {}) => {
    if (!ffl) throw new Error("vrais-mii : preparer() d'abord");
    const rendu = o.rendu || rendu0, qualite = QUALITES[o.qualite] || QUALITES.haute;
    if (!rendu) throw new Error("vrais-mii : il faut le rendu (WebGLRenderer) de la sc\xE8ne o\xF9 le Mii sera dessin\xE9");
    const Mat = window.FFLShaderMaterial, MatEcl = (ECLAIRAGES[o.eclairage ?? reglage("pcv-mii-eclairage")] || ECLAIRAGES.wiiu)(), direct = F.matSupportsFFL(MatEcl);
    const graine = o.graine ?? null, brut = o.donnees != null ? octets(o.donnees) : auHasard(graine);
    const enSwitch = MatEcl === MatSwitch, ci = () => brut.length === 288 ? brut.slice() : charInfo(brut);
    const donnees = enSwitch ? poserSwitch(enCouleursSwitch(ci()), o.couleursSwitch) : o.couleursSwitch ? poserSwitch(ci(), o.couleursSwitch) : brut;
    const etats = (o.expressions || qualite.etats).filter((e) => X()[EXPR[e]] !== void 0);
    if (!etats.includes("neutre")) etats.unshift("neutre");
    const desc = { resolution: o.resolution || qualite.resolution, allExpressionFlag: F.makeExpressionFlag(etats.map((e) => X()[EXPR[e]])), modelFlag: F.FFLModelFlag.NORMAL };
    const tete = (verifier) => direct ? new F.CharModel(ffl, donnees, desc, MatEcl, rendu, verifier) : (() => {
      const c = new F.CharModel(ffl, donnees, desc, MatEcl, null, verifier);
      c.initTextures(rendu, Mat);
      return c;
    })();
    const liberer = T.Material.prototype.dispose;
    T.Material.prototype.dispose = function() {
    };
    let cm;
    try {
      try {
        cm = tete(true);
      } catch (e) {
        if (!(e instanceof F.FFLiVerifyReasonException)) throw e;
        cm = tete(false);
      }
    } finally {
      T.Material.prototype.dispose = liberer;
    }
    cm.meshes.traverse((x) => {
      x.frustumCulled = false;
      x.renderOrder /= 1 + Math.abs(x.renderOrder);
      if (x.material) for (const mat of Array.isArray(x.material) ? x.material : [x.material]) mat.depthTest = true;
    });
    const E = window.__pcvESM, g = gabarits[cm.charInfo.gender] || gabarits[0];
    const modele = E.clone(g.gltf.scene), echelle = cm.getBodyScale();
    const corpsFFL = { model: modele, animations: g.gltf.animations, scaleDesc: E.detectModelDesc(modele) };
    const pantalon = couleurBrute(PANTALONS[o.pantalon] ?? (o.pantalon != null && /^#?[0-9a-f]{6}$/i.test(o.pantalon) ? o.pantalon : PANTALONS.gris));
    E.prepareBodyForCharModel(corpsFFL, MatEcl, cm.favoriteColor, echelle, pantalon);
    if ("colorInfo" in MatEcl.prototype) {
      const ci2 = cm.getColorInfo();
      modele.traverse((x) => {
        if (x.isSkinnedMesh) x.material.colorInfo = ci2;
      });
    }
    E.attachHeadToBody(corpsFFL, cm.meshes);
    const os = OS.map((n) => modele.getObjectByName(n));
    for (const b of os) delete b.scaleForRootAdjust;
    const racineRepos = new T.Vector3(0, g.hautRepos * echelle.y + (echelle.x - echelle.y), 0);
    const peaux = [];
    modele.traverse((x) => {
      if (x.isSkinnedMesh) {
        x.frustumCulled = false;
        peaux.push(x);
      }
    });
    const corps = peaux.find((x) => x.skeleton.bones.includes(os[I.head])) || peaux[0];
    const U = g.hautRepos / HAUT_IMITATION;
    const TAILLE_TETE = cm.meshes.scale.x, ws = new T.Vector3();
    const recalerTete = () => {
      modele.getWorldScale(ws);
      cm.meshes.scale.setScalar(TAILLE_TETE * Math.cbrt(Math.abs(ws.x * ws.y * ws.z)));
    };
    const objet = new T.Group(), salto = new T.Group(), dessous = new T.Group(), racine = new T.Group();
    objet.add(salto);
    salto.add(dessous);
    dessous.add(racine);
    racine.add(modele);
    modele.scale.setScalar(1 / U);
    const ombre = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: ombreTexture(), transparent: true, depthWrite: false, opacity: 0.3 }));
    ombre.rotation.x = -Math.PI / 2;
    ombre.renderOrder = -1;
    const m = {
      objet,
      corps,
      ombre,
      salto,
      os,
      modele,
      tete: cm,
      squelettes: peaux.map((x) => x.skeleton),
      // tous les squelettes du corps (pour ne pas les renvoyer à la carte graphique)
      charInfo: cm.charInfo,
      d: { graine, nom: o.nom ?? null, sexe: cm.charInfo.gender },
      ph: Math.random() * 6.3,
      cadence: 0.95 + Math.random() * 0.12,
      anim: "repos",
      t: 0,
      ancienne: null,
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
      exprFFL: -1,
      cligne: 0,
      prochain: 1 + Math.random() * 3,
      bouche: 0,
      action: null,
      saut: null,
      sol: null,
      taille: 1,
      bras: null,
      kBras: 0,
      tBras: 0,
      expressions: etats,
      D: null,
      unite: 1 / U
      // unite : taille d'une unité du corps de Nintendo dans le repère du Mii
    };
    const versParent = g.racineParent.clone().invert();
    const poserRacine = (o2) => {
      os[0].position.copy(racineRepos).add(o2).applyQuaternion(versParent);
    };
    poserRacine(new T.Vector3());
    recalerTete();
    objet.updateMatrixWorld(true);
    peaux.forEach((x) => x.skeleton.update());
    {
      const semelle = new T.Box3();
      peaux.forEach((x) => semelle.expandByObject(x, true));
      if (Number.isFinite(semelle.min.y)) {
        racine.position.y = -semelle.min.y;
        objet.updateMatrixWorld(true);
        peaux.forEach((x) => x.skeleton.update());
      }
    }
    const ici = (b) => new T.Vector3().setFromMatrixPosition(os[I[b]].matrixWorld);
    const dist = (a, b) => ici(a).distanceTo(ici(b));
    const sommet = new T.Vector3(0, cm.boundingBox.max.y, 0).applyMatrix4(cm.meshes.matrixWorld).y;
    const D = m.D = {
      hanche: ici("skl_root").y,
      cou: ici("head").y,
      haut: sommet + 6e-3,
      epauleY: ici("arm_l1").y,
      epauleX: ici("arm_l1").x,
      bras: dist("arm_l1", "arm_l2") + dist("arm_l2", "wrist_l") + 0.02,
      cuisse: dist("foot_l1", "foot_l2"),
      tibia: dist("foot_l2", "ankle_l"),
      hancheX: ici("foot_l1").x,
      kl: echelle.x / 0.83,
      tete: sommet - ici("head").y,
      cheville: ici("ankle_l").y
    };
    D.kh = D.hanche / HAUT_IMITATION;
    D.prise = D.epauleY - D.bras * Math.cos(BRAS_SUSP);
    const estClip = (nom) => !!(CLIPS[nom] && g.clips[CLIPS[nom]]);
    m.jouer = (nom, opt = {}) => {
      if (!ANIMS[nom] && !estClip(nom)) {
        if (!CLIPS[nom]) return m;
        nom = "danser";
      }
      if (nom === m.anim && !opt.redemarrer) return m;
      const f = opt.fondu ?? 0.25;
      if (f > 0 && poseVue.vue) {
        copier(poseDepart, poseVue);
        m.ancienne = m.anim;
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
      salto.position.y = 0.42 * D.haut;
      dessous.position.y = -0.42 * D.haut;
      return m;
    };
    const P = new Float32Array(NC), poseA = nouvellePose(), poseB = nouvellePose(), poseBras = nouvellePose(), poseVue = nouvellePose(), poseDepart = nouvellePose();
    const evaluer = (nom, t, pose) => {
      if (estClip(nom)) {
        const c = g.clips[CLIPS[nom]];
        depuisClip(c, BOUCLE.has(nom) ? t % c.duree : Math.min(t, c.duree), g, pose);
        return;
      }
      P.set(NEUTRE);
      ANIMS[nom](P, t, m);
      depuisCanaux(P, g, U, pose);
    };
    const vise = new T.Vector3(), inv = new T.Matrix4(), qRegard = new T.Quaternion();
    const exprFFL = (e) => {
      while (!etats.includes(e)) e = REPLI[e] || "neutre";
      return X()[EXPR[e]];
    };
    m.maj = (dt) => {
      dt = Math.min(dt, 0.1);
      if (m.action) m.action.maj(dt);
      m.t += dt * m.vitesse;
      evaluer(m.anim, m.t, poseB);
      if (m.ancienne) {
        m.fondu += dt / m.fonduDuree;
        if (m.fondu >= 1) m.ancienne = null;
        else {
          copier(poseA, poseDepart);
          melanger(poseA, poseB, lisse(m.fondu));
          copier(poseB, poseA);
        }
      }
      copier(poseVue, poseB);
      poseVue.vue = true;
      if (m.bras && BRAS[m.bras] && m.bras !== m.brasJoue) {
        if (m.brasJoue) m.kBras = 0;
        m.brasJoue = m.bras;
      }
      m.kBras += ((m.bras && BRAS[m.bras] ? 1 : 0) - m.kBras) * (1 - Math.exp(-dt * (m.bras === "salut" || !m.bras ? 8 : 14)));
      m.tBras += dt;
      if (m.kBras > 0.01 && BRAS[m.brasJoue]) {
        P.set(NEUTRE);
        BRAS[m.brasJoue](P, m.tBras);
        depuisCanaux(P, g, U, poseBras);
        for (const n of ["arm_r1", "arm_r2"]) poseB.q[I[n]].slerp(poseBras.q[I[n]], m.kBras);
      }
      const prise = m.deuxMains && PRISES[m.deuxMains] && !BRAS_LIBRES.has(m.anim) && !(m.saut && m.saut.saisir) ? 1 : 0;
      m.kPrise = (m.kPrise || 0) + (prise - (m.kPrise || 0)) * (1 - Math.exp(-dt * 10));
      if (m.kPrise > 0.01 && PRISES[m.deuxMains]) {
        P.set(NEUTRE);
        PRISES[m.deuxMains](P);
        depuisCanaux(P, g, U, poseBras);
        for (const n of ["arm_l1", "arm_l2", "wrist_l", ...m.kBras > 0.5 ? [] : ["arm_r1", "arm_r2", "wrist_r"]]) poseB.q[I[n]].slerp(poseBras.q[I[n]], m.kPrise);
      }
      let gx = 0, gy = 0;
      if (m.regard) {
        if (m.enFoule) inv.copy(m.torse).invert();
        else {
          objet.updateMatrixWorld(true);
          inv.copy(os[I.chest].matrixWorld).invert();
        }
        vise.copy(m.regard).applyMatrix4(inv).multiplyScalar(1 / U);
        vise.y -= D.cou - D.hanche + D.tete * 0.5;
        const yaw = Math.atan2(vise.x, vise.z);
        if (Math.abs(yaw) < 1.9) {
          gy = Math.max(-0.8, Math.min(0.8, yaw));
          gx = Math.max(-0.5, Math.min(0.45, -Math.atan2(vise.y, Math.hypot(vise.x, vise.z))));
        }
      }
      if (m.regardMax != null) gy = Math.max(-m.regardMax - m.cap, Math.min(m.regardMax - m.cap, gy));
      const kr = 1 - Math.exp(-dt * 7);
      m.rg.x += (gx - m.rg.x) * kr;
      m.rg.y += (gy - m.rg.y) * kr;
      tourner(m, dt);
      if (!m.enFoule) ecrire();
      let ex = m.expr || (m.bras === "salut" ? "sourire" : EXPRESSIONS[m.anim]) || "neutre";
      m.cligne -= dt;
      if (m.cligne < -m.prochain) {
        m.cligne = 0.12;
        m.prochain = 1.6 + Math.random() * 4;
      }
      if (m.cligne > 0 && CLIGNABLES.has(ex)) ex = "cligne";
      if (ex === "parle") {
        m.bouche -= dt;
        if (m.bouche < -0.11) m.bouche = 0.08 + Math.random() * 0.1;
        if (m.bouche < 0) ex = "neutre";
      }
      const xf = exprFFL(ex);
      if (xf !== m.exprFFL) {
        m.exprFFL = xf;
        cm.setExpression(xf);
      }
      if (ombre.parent && m.sol != null) {
        const hsol = Math.max(0, objet.position.y - m.sol) / (m.taille || 1), k = 1 / (1 + hsol * 1.8);
        ombre.position.set(objet.position.x, m.sol + 2e-3 * m.taille, objet.position.z + (ombre.userData.dz ?? 0) * m.taille);
        ombre.scale.set(0.5 * m.taille * k * D.kl, 0.34 * m.taille * k, 1);
        ombre.material.opacity = 0.3 * k * (ombre.userData.force ?? 1);
        ombre.visible = objet.visible;
      } else ombre.visible = false;
    };
    const ecrire = () => {
      for (let i = 0; i < OS.length; i++) os[i].quaternion.copy(poseB.q[i]);
      if (Math.abs(m.rg.x) + Math.abs(m.rg.y) > 1e-4) os[I.head].quaternion.premultiply(qRegard.setFromEuler(eu.set(m.rg.x, m.rg.y, 0)));
      poserRacine(poseB.o);
      const e = poseB.r[0];
      racine.scale.set(1 / Math.sqrt(e), e, 1 / Math.sqrt(e));
      racine.rotation.set(poseB.r[1], 0, poseB.r[2]);
      objet.rotation.set(m.inclinaison, m.cap, 0);
      dessous.position.y = -0.42 * D.haut;
      if (!salto.rotation.x && Math.abs(objet.position.y - (m.sol ?? 0)) < 1e-3) {
        objet.updateMatrixWorld(true);
        const bas = Math.min(objet.worldToLocal(vise.setFromMatrixPosition(os[I.ankle_l].matrixWorld)).y, objet.worldToLocal(vise.setFromMatrixPosition(os[I.ankle_r].matrixWorld)).y);
        if (bas < D.cheville) dessous.position.y += D.cheville - bas;
      }
      recalerTete();
    };
    mouvements(m);
    m.suivre = (p, dt) => {
      if (p.nJouer !== m.nSuivi) {
        const f = m.nSuivi === void 0 ? 0 : p.fonduVoulu;
        m.nSuivi = p.nJouer;
        m.jouer(p.anim, { fondu: f, redemarrer: true, vitesse: p.vitesse });
      }
      m.t = p.t - dt * m.vitesse;
      m.ph = p.ph;
      m.cadence = p.cadence;
      m.cap = m.capVise = p.cap;
      m.inclinaison = p.inclinaison;
      objet.position.copy(p.objet.position);
      objet.visible = p.objet.visible;
      m.saut = p.saut;
      m.salto.rotation.x = p.salto.rotation.x;
      m.amplitude = p.amplitude;
      m.hisse = p.hisse;
      m.bras = p.bras;
      m.sens = p.sens;
      m.regard = p.regard;
      m.expr = p.expr;
      m.sol = p.sol;
      if (p.taille !== m.taille) m.regler(p.taille);
      m.maj(dt);
      return m;
    };
    Object.assign(m, { ecrireOs: ecrire, pose: poseB, racine, racineRepos, versParent, tailleTete: TAILLE_TETE, torse: new T.Matrix4() });
    m.rectEcran = (cam, W, H) => {
      if (m.enFoule) ecrire();
      objet.updateMatrixWorld(true);
      const v = new T.Vector3(), c = new T.Vector3(), b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }, k = objet.scale.x;
      const voir = (x, y) => {
        b.x0 = Math.min(b.x0, x);
        b.x1 = Math.max(b.x1, x);
        b.y0 = Math.min(b.y0, y);
        b.y1 = Math.max(b.y1, y);
      };
      const proj = (p, rayon) => {
        c.copy(p).project(cam);
        v.copy(p);
        v.x += rayon * k;
        v.project(cam);
        const rp = Math.hypot((v.x - c.x) * W / 2, (v.y - c.y) * H / 2), x = (c.x + 1) * W / 2, y = (1 - c.y) * H / 2;
        voir(x - rp, y - rp);
        voir(x + rp, y + rp);
      };
      const pt = (n) => new T.Vector3().setFromMatrixPosition(os[I[n]].matrixWorld);
      const centre = new T.Vector3().setFromMatrixPosition(cm.meshes.matrixWorld);
      centre.y += D.tete * 0.5 * k;
      proj(centre, D.tete * 0.62);
      for (const n of ["wrist_l", "wrist_r", "ankle_l", "ankle_r"]) proj(pt(n), 0.05);
      proj(pt("hip"), 0.11);
      return b;
    };
    m.liberer = () => {
      m.action?.rejeter("lib\xE9r\xE9");
      objet.removeFromParent();
      ombre.removeFromParent();
      cm.dispose();
      modele.traverse((x) => {
        if (x.isSkinnedMesh) {
          x.material.dispose();
          x.skeleton.dispose();
        }
      });
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
  const PAR_MII = /* @__PURE__ */ new Set(["u_const1", "u_const2", "u_const3", "diffuse", "constColor1", "constColor2", "constColor3", "u_SssColor", "u_SpecularColor", "u_RimColor"]);
  const TEXTURES_MII = /* @__PURE__ */ new Set(["s_texture", "s_Tex", "map"]);
  const TAILLES = { float: 1, vec2: 2, vec3: 3, vec4: 4 };
  const LIGNE = 72;
  const ENTREE = 24, STATIQUE = 16 * 7 + 2;
  const PASSE_OS = `
    uniform highp sampler2D entrees, statique; int r;
    vec4 E(int t) { return texelFetch(entrees, ivec2(t, r), 0); }
    vec4 S(int t) { return texelFetch(statique, ivec2(t, r), 0); }
    mat4 composer(vec3 p, vec4 q, vec3 s) { float x2 = q.x + q.x, y2 = q.y + q.y, z2 = q.z + q.z, xx = q.x * x2, xy = q.x * y2, xz = q.x * z2, yy = q.y * y2, yz = q.y * z2, zz = q.z * z2, wx = q.w * x2, wy = q.w * y2, wz = q.w * z2;
      return mat4(vec4(1.0 - (yy + zz), xy + wz, xz - wy, 0.0) * s.x, vec4(xy - wz, 1.0 - (xx + zz), yz + wx, 0.0) * s.y, vec4(xz + wy, yz - wx, 1.0 - (xx + yy), 0.0) * s.z, vec4(p, 1.0)); }
    int racine;
    mat4 local(int k) { vec4 a = S(7 * k), b = S(7 * k + 1); return composer(k == racine ? E(16).xyz : a.xyz, E(k), b.xyz); }
    int parent(int k) { return int(S(7 * k).w); }
    // monde (sans \xE9chelle) et matrice mise \xE0 l'\xE9chelle M de l'os k, en descendant sa cha\xEEne depuis la racine
    void chaine(int k, out mat4 W, out mat4 M) {
      int c[8]; int n = 0; for (int j = k; j >= 0 && n < 8; j = parent(j)) c[n++] = j;
      mat4 Wp = mat4(E(17), E(18), E(19), E(20)), Mp = Wp; int p = -1;
      for (int i = n - 1; i >= 0; i--) { int j = c[i]; mat4 L = local(j); W = Wp * L; mat4 CW = W;
        if (p >= 0 && p < j && S(7 * p + 1).w > 0.5) CW[3].xyz = (Mp * L)[3].xyz;
        M = CW; if (S(7 * j + 1).w > 0.5) { vec3 e = S(7 * j + 2).xyz; M[0] *= e.x; M[1] *= e.y; M[2] *= e.z; }
        Wp = W; Mp = M; p = j; } }
    void main() {
      ivec2 f = ivec2(gl_FragCoord.xy); r = f.y; int x = f.x;
      vec4 v23 = E(23); if (v23.z < 0.5 || x > 68) { gl_FragColor = vec4(0.0); return; }
      if (x == 68) { gl_FragColor = vec4(v23.y, 0.0, 0.0, 0.0); return; }
      vec4 g = S(112), h = S(113); int n = int(g.x); racine = int(g.y);
      int k = x < 64 ? x / 4 : int(g.z); if (k >= n) { gl_FragColor = vec4(0.0); return; }
      mat4 W, M, W2, M2; chaine(k, W, M);
      // pieds au sol : la plus basse cheville, dans le rep\xE8re de l'objet, remont\xE9e \xE0 sa hauteur de repos
      vec3 d = vec3(0.0); vec4 pl = E(21), ax = E(22);
      if (E(16).w > 0.5) { chaine(int(h.x), W2, M2); float b = dot(ax.xyz, W2[3].xyz - pl.xyz); chaine(int(h.y), W2, M2); b = min(b, dot(ax.xyz, W2[3].xyz - pl.xyz)) / ax.w;
        if (b < pl.w) d = ax.xyz * (pl.w - b); }
      M[3].xyz += d;
      if (x < 64) { mat4 I = mat4(S(7 * k + 3), S(7 * k + 4), S(7 * k + 5), S(7 * k + 6)); gl_FragColor = (M * I)[x - 4 * k]; return; }
      // la t\xEAte : l'os de la t\xEAte, sa rotation et sa place, \xE0 la taille propre de la t\xEAte (comme l'attache de FFL.js)
      int c = x - 64; if (c == 3) { gl_FragColor = M[3]; return; }
      float sg = (c == 0 && determinant(mat3(M)) < 0.0) ? -1.0 : 1.0;
      gl_FragColor = vec4(M[c].xyz / (length(M[c].xyz) * sg) * v23.x, 0.0); }`;
  const DECL = (n) => new RegExp(`uniform\\s+(?:(?:lowp|mediump|highp)\\s+)?(\\w+)\\s+${n}\\s*;`);
  const MAIN = /void\s+main\s*\(\s*(?:void)?\s*\)\s*\{/;
  const SKIN = ["skinning_pars_vertex", "skinbase_vertex", "skinning_vertex", "skinnormal_vertex"];
  const deplies = /* @__PURE__ */ new Map(), deplier = (s) => {
    const s0 = s;
    if (deplies.has(s0)) return deplies.get(s0);
    for (let k = 0; k < 4 && s.includes("#include"); k++) s = s.replace(/#include\s+<(\w+)>/g, (x, n) => T.ShaderChunk[n] ?? x);
    deplies.set(s0, s);
    return s;
  };
  const valeur = (v) => v == null ? "~" : typeof v !== "object" ? String(v) : v.isTexture ? "t" + v.id : v.toArray ? v.toArray().join(",") : Array.isArray(v) ? v.map(valeur).join(";") : "{" + Object.keys(v).map((k) => k + ":" + valeur(v[k])).join(",") + "}";
  const foule = ({ rendu, scene, max = 256 }) => {
    const gl = rendu.getContext(), MAX_COUCHES = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
    const texture = (l, h) => {
      const t = new T.DataTexture(new Float32Array(l * 4 * h), l, h, T.RGBAFormat, T.FloatType);
      t.needsUpdate = true;
      return t;
    };
    const entrees = texture(ENTREE, max), statique = texture(STATIQUE, max), E_ = entrees.image.data, S_ = statique.image.data;
    rendu.initTexture(entrees);
    const cible = new T.WebGLRenderTarget(LIGNE, max, { type: T.FloatType, format: T.RGBAFormat, minFilter: T.NearestFilter, magFilter: T.NearestFilter, depthBuffer: false, generateMipmaps: false });
    const tex = cible.texture;
    const LUM_N = 8, LUM = {
      lum_: { value: Array.from({ length: LUM_N }, () => new T.Vector3()) },
      lumC_: { value: Array.from({ length: LUM_N }, () => new T.Color(0)) },
      ombre_: { value: null },
      ombreP_: { value: new T.Vector3() },
      brume_: { value: new T.Vector3() },
      brumeC_: { value: new T.Color() },
      proche_: { value: new T.Vector2() }
    };
    const lumieres = (l) => LUM.lum_.value.forEach((v, i) => {
      const p = l[i];
      if (p) {
        v.set(p.x, p.z, 1 / (p.r || 6));
        LUM.lumC_.value[i].copy(p.c).multiplyScalar(p.f ?? 1);
      } else LUM.lumC_.value[i].setScalar(0);
    });
    const ombrer = (o) => {
      LUM.ombre_.value = o?.carte ?? null;
      LUM.ombreP_.value.set(o ? o.echelle : 0, o?.plancher ?? 0, o?.demi ?? 1);
      LUM.brume_.value.set(...o?.brume ?? [0, 0, 0]);
      if (o) LUM.brumeC_.value.copy(o.couleur).convertLinearToSRGB();
      LUM.proche_.value.set(...o?.proche ?? [0, 0]);
    };
    const familles = /* @__PURE__ */ new Map(), membres = /* @__PURE__ */ new Map(), libres = [], ids = /* @__PURE__ */ new Map();
    let nCases = 1;
    const id = (s) => {
      let i = ids.get(s);
      if (i === void 0) ids.set(s, i = ids.size);
      return i;
    };
    const analyser = (mat) => {
      if (!mat?.isShaderMaterial || mat.isRawShaderMaterial || !MAIN.test(mat.vertexShader)) return null;
      const varies = [], textures = [], cle = [
        mat.constructor.name,
        id(mat.vertexShader),
        id(mat.fragmentShader),
        mat.side,
        mat.transparent,
        mat.depthWrite,
        mat.depthTest,
        mat.blending,
        mat.blendSrc,
        mat.blendDst,
        mat.alphaTest,
        mat.colorWrite,
        mat.premultipliedAlpha,
        mat.lights,
        mat.fog,
        !!mat.map,
        JSON.stringify(mat.defines || {})
      ];
      const vs = deplier(mat.vertexShader), fs = deplier(mat.fragmentShader);
      for (const k of Object.keys(mat.uniforms).sort()) {
        const u = mat.uniforms[k], t = (DECL(k).exec(fs) || DECL(k).exec(vs))?.[1];
        if (TEXTURES_MII.has(k) && u.value?.isTexture && t === "sampler2D") textures.push(k);
        else if (PAR_MII.has(k) && TAILLES[t] && (typeof u.value === "number" || u.value?.toArray)) varies.push([k, t]);
        else cle.push(k + "=" + valeur(u.value));
      }
      return { varies, textures, cle: cle.join("|"), prog: varies.map((x) => x[0]).join() + "/" + textures.join() };
    };
    const patcher = (f) => (s) => {
      let v = s.vertexShader, fr = deplier(s.fragmentShader), debut = "";
      let haut = "attribute float a_case;\nuniform highp sampler2D poses_;\nmat4 pose_(int k) { int r = int(a_case); return mat4(texelFetch(poses_, ivec2(k, r), 0), texelFetch(poses_, ivec2(k + 1, r), 0), texelFetch(poses_, ivec2(k + 2, r), 0), texelFetch(poses_, ivec2(k + 3, r), 0)); }\n";
      if (f.corps) {
        haut += "attribute vec4 skinIndex, skinWeight;\nuniform mat4 lien_;\n";
        v = deplier(v.replace("#include <skinning_pars_vertex>", "").replace("#include <skinbase_vertex>", "mat4 boneMatX = pose_(4 * int(skinIndex.x)), boneMatY = pose_(4 * int(skinIndex.y)), boneMatZ = pose_(4 * int(skinIndex.z)), boneMatW = pose_(4 * int(skinIndex.w));").replace("#include <skinning_vertex>", "{ vec4 sv = lien_ * vec4(transformed, 1.0); transformed = (boneMatX * sv * skinWeight.x + boneMatY * sv * skinWeight.y + boneMatZ * sv * skinWeight.z + boneMatW * sv * skinWeight.w).xyz; }").replace("#include <skinnormal_vertex>", "{ mat4 sm = (skinWeight.x * boneMatX + skinWeight.y * boneMatY + skinWeight.z * boneMatZ + skinWeight.w * boneMatW) * lien_;\nobjectNormal = (sm * vec4(objectNormal, 0.0)).xyz;\n#ifdef USE_TANGENT\nobjectTangent = (sm * vec4(objectTangent, 0.0)).xyz;\n#endif\n}"));
      } else {
        v = deplier(v).replace(/\bmodelViewMatrix\b/g, "mv_").replace(/\bnormalMatrix\b/g, "nm_").replace(/\bmodelMatrix\b/g, "mm_");
        haut += "mat4 mm_, mv_; mat3 nm_;\n";
        debut = "mm_ = pose_(64); mv_ = viewMatrix * mm_; nm_ = transpose(inverse(mat3(mv_)));\n";
      }
      for (const [k, t] of f.varies) {
        haut += `attribute ${t} a_${k};
varying ${t} v_${k};
`;
        debut += `v_${k} = a_${k};
`;
        v = v.replace(DECL(k), `
#define ${k} a_${k}
`);
        fr = fr.replace(DECL(k), `varying ${t} v_${k};
#define ${k} v_${k}
`);
      }
      for (const k of f.textures) {
        haut += `attribute float a_couche_${k};
varying float v_couche_${k};
`;
        debut += `v_couche_${k} = a_couche_${k}${f.dyn === k ? " + texelFetch(poses_, ivec2(68, int(a_case)), 0).x" : ""};
`;
        fr = fr.replace(DECL(k), `uniform highp sampler2DArray ${k}_t;
varying float v_couche_${k};
vec4 ${k}_lire(vec2 uv) { return texture(${k}_t, vec3(uv, v_couche_${k})); }
`).replace(new RegExp(`texture(?:2D)?\\s*\\(\\s*${k}\\s*,`, "g"), `${k}_lire(`);
      }
      haut += `uniform vec3 lum_[${LUM_N}], lumC_[${LUM_N}], ombreP_;
uniform vec3 brume_;
uniform vec2 proche_;
uniform sampler2D ombre_;
varying vec3 teinte_;
varying vec4 ombreV_;
varying float proche_v;
`;
      debut += `{ vec3 q_ = texelFetch(poses_, ivec2(67, int(a_case)), 0).xyz; vec2 p_ = q_.xz; teinte_ = vec3(0.0); for (int i = 0; i < ${LUM_N}; i++) teinte_ += lumC_[i] * max(0.0, 1.0 - distance(p_, lum_[i].xy) * lum_[i].z);
        ombreV_ = vec4(1.0, 1.0, 1.0, 0.0); if (ombreP_.x > 0.0) ombreV_.rgb = clamp(texture(ombre_, vec2(p_.x + ombreP_.z, ombreP_.z - p_.y) / (2.0 * ombreP_.z)).rgb * ombreP_.x, ombreP_.y, 1.0);
        if (brume_.z > 0.0) ombreV_.a = smoothstep(brume_.y, brume_.z, brume_.x - p_.y); proche_v = proche_.y > 0.0 ? smoothstep(proche_.x, proche_.y, distance(cameraPosition, q_)) : 1.0; }
`;
      const m = MAIN.exec(fr);
      if (m) fr = fr.slice(0, m.index) + "varying vec3 teinte_;\nvarying vec4 ombreV_;\nvarying float proche_v;\nuniform vec3 brumeC_;\n" + fr.slice(m.index).replace(
        /gl_FragColor\s*=\s*([^;]+);/g,
        // (fondu tramé, sans tri ni transparence : un pixel sur deux, puis aucun, selon un bruit fixe à l'écran)
        "{ if (proche_v < 1.0 && proche_v <= fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(.06711056, .00583715))))) discard; gl_FragColor = $1; gl_FragColor.rgb = mix(gl_FragColor.rgb * ombreV_.rgb + teinte_ * gl_FragColor.a, brumeC_ * gl_FragColor.a, ombreV_.a); }"
      );
      s.vertexShader = haut + v.replace(MAIN, (x) => x + "\n" + debut);
      s.fragmentShader = fr;
    };
    const maillage = (g, src, f, extra) => {
      const mat = new T.ShaderMaterial();
      T.Material.prototype.copy.call(mat, src);
      Object.assign(mat, {
        vertexShader: src.vertexShader,
        fragmentShader: src.fragmentShader,
        uniforms: { ...src.uniforms, poses_: { value: tex }, ...LUM, ...extra },
        defines: { ...src.defines },
        extensions: { ...src.extensions },
        lights: src.lights,
        fog: src.fog,
        glslVersion: src.glslVersion
      });
      for (const k of [...f.textures, ...f.varies.map((x) => x[0])]) delete mat.uniforms[k];
      const prog = "foule" + (f.corps ? "C" : "T") + f.prog + "/" + f.dyn;
      mat.onBeforeCompile = patcher(f);
      mat.customProgramCacheKey = () => prog;
      const m = new T.Mesh(g, mat);
      m.frustumCulled = false;
      m.matrixAutoUpdate = false;
      m.raycast = () => {
      };
      scene.add(m);
      return m;
    };
    const valeurs = (u) => typeof u.value === "number" ? [u.value] : u.value.toArray();
    const PLAN = new T.PlaneGeometry(2, 2), CAM = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), atelier = new T.Scene();
    const VS_COPIE = "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
    const copie2D = new T.ShaderMaterial({
      uniforms: { src: { value: null } },
      vertexShader: VS_COPIE,
      depthTest: false,
      depthWrite: false,
      blending: T.NoBlending,
      fragmentShader: "uniform sampler2D src; varying vec2 vUv; void main() { gl_FragColor = texture2D(src, vUv); }"
    });
    const copieTab = new T.ShaderMaterial({
      uniforms: { src: { value: null }, c: { value: 0 } },
      vertexShader: VS_COPIE,
      depthTest: false,
      depthWrite: false,
      blending: T.NoBlending,
      fragmentShader: "uniform highp sampler2DArray src; uniform float c; varying vec2 vUv; void main() { gl_FragColor = texture(src, vec3(vUv, c)); }"
    });
    const plan = new T.Mesh(PLAN, copie2D);
    plan.frustumCulled = false;
    atelier.add(plan);
    const copier2 = (mat, rt, couche) => {
      plan.material = mat;
      const avant = rendu.getRenderTarget();
      rendu.setRenderTarget(rt, couche);
      rendu.render(atelier, CAM);
      rendu.setRenderTarget(avant);
    };
    const mips = (rt) => {
      rendu.state.bindTexture(gl.TEXTURE_2D_ARRAY, rendu.properties.get(rt.texture).__webglTexture);
      gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
      rendu.state.unbindTexture();
    };
    const tableau = (spec, couches) => {
      const rt = new T.WebGLArrayRenderTarget(spec.w, spec.h, couches, { depthBuffer: false });
      Object.assign(rt.texture, { wrapS: spec.wrapS, wrapT: spec.wrapT, magFilter: spec.mag, minFilter: spec.mips ? T.LinearMipmapLinearFilter : spec.min, generateMipmaps: false });
      return rt;
    };
    const familleCorps = (x, a, cle) => {
      const g = new T.InstancedBufferGeometry();
      g.index = x.geometry.index;
      for (const [k, at] of Object.entries(x.geometry.attributes)) g.setAttribute(k, at);
      const f = { corps: true, cle, ...a, dyn: null, n: 0, qui: [], attrs: {} };
      const attr = (k, t) => {
        const at = new T.InstancedBufferAttribute(new Float32Array(max * t), t).setUsage(T.DynamicDrawUsage);
        g.setAttribute(k, at);
        f.attrs[k] = at;
      };
      attr("a_case", 1);
      for (const [k, t] of a.varies) attr("a_" + k, TAILLES[t]);
      g.instanceCount = 0;
      f.mesh = maillage(g, x.material, f, { lien_: { value: x.bindMatrix.clone() } });
      f.mesh.renderOrder = x.renderOrder;
      return f;
    };
    const ecrireCorps = (f, j, mb, x) => {
      f.attrs.a_case.setX(j, mb.case);
      for (const [k] of f.varies) f.attrs["a_" + k].set(valeurs(x.material.uniforms[k]), j * f.attrs["a_" + k].itemSize);
      for (const at of Object.values(f.attrs)) at.needsUpdate = true;
    };
    const disposition = (g) => Object.keys(g.attributes).sort().map((k) => {
      const a = g.attributes[k];
      return k + a.itemSize + (a.isFloat16BufferAttribute ? "h" : (a.isInterleavedBufferAttribute ? a.data.array : a.array).constructor.name) + a.normalized;
    }).join(",") + (g.index ? "i" : "");
    const familleTete = (x, a, cle, specs, dyn) => {
      const f = { corps: false, cle, ...a, dyn, specs, nv: 0, ni: 0, capV: 0, capI: 0, couches: 0, tabs: {}, plein: false, g: null };
      f.mesh = maillage(new T.BufferGeometry(), x.material, f, {});
      f.mesh.renderOrder = x.renderOrder;
      f.src = Object.fromEntries(Object.entries(x.geometry.attributes).map(([k, at]) => [k, {
        t: at.itemSize,
        half: !!at.isFloat16BufferAttribute,
        norm: at.normalized,
        C: (at.isInterleavedBufferAttribute ? at.data.array : at.array).constructor
      }]));
      f.src.a_case = { t: 1, C: Float32Array };
      for (const [k, t] of a.varies) f.src["a_" + k] = { t: TAILLES[t], C: Float32Array };
      for (const k of a.textures) f.src["a_couche_" + k] = { t: 1, C: Float32Array };
      return f;
    };
    const agrandirGeo = (f, nv, ni) => {
      if (f.nv + nv <= f.capV && f.ni + ni <= f.capI) return;
      const capV = Math.max(f.nv + nv, 2 * f.capV, 16 * nv), capI = Math.max(f.ni + ni, 2 * f.capI, 16 * ni), g = new T.BufferGeometry(), ancienne = f.g;
      for (const [k, s] of Object.entries(f.src)) {
        const arr = new s.C(capV * s.t);
        if (ancienne) arr.set(ancienne.attributes[k].array.subarray(0, f.nv * s.t));
        g.setAttribute(k, s.half ? new T.Float16BufferAttribute(arr, s.t) : new T.BufferAttribute(arr, s.t, s.norm));
      }
      const idx = new Uint32Array(capI);
      if (ancienne) idx.set(ancienne.index.array.subarray(0, f.ni));
      g.setIndex(new T.BufferAttribute(idx, 1));
      g.setDrawRange(0, f.ni);
      f.g = f.mesh.geometry = g;
      f.capV = capV;
      f.capI = capI;
      ancienne?.dispose();
    };
    const marquer = (at, debut, n) => {
      const r = at.updateRange;
      if (r.count === -1) {
        r.offset = debut;
        r.count = n;
      } else {
        const fin = Math.max(r.offset + r.count, debut + n);
        r.offset = Math.min(r.offset, debut);
        r.count = fin - r.offset;
      }
      at.needsUpdate = true;
    };
    const agrandirTab = (f, k) => {
      const cap = f.tabs[f.textures[0]]?.depth ?? 0;
      if (f.couches + k <= cap) return true;
      const max_ = Math.floor(MAX_COUCHES / f.specs[f.textures[0]].n) * f.specs[f.textures[0]].n;
      if (f.couches + k > max_) return false;
      const neuf = Math.min(max_, Math.max(f.couches + k, Math.ceil(cap * 1.25 / k) * k, 4 * k));
      for (const t of f.textures) {
        const ancien = f.tabs[t], rt = tableau(f.specs[t], neuf);
        if (ancien) {
          copieTab.uniforms.src.value = ancien.texture;
          for (let c = 0; c < f.couches; c++) {
            copieTab.uniforms.c.value = c;
            copier2(copieTab, rt, c);
          }
          ancien.dispose();
        }
        f.tabs[t] = rt;
        f.mesh.material.uniforms[t + "_t"] = { value: rt.texture };
        if (t === "map") f.mesh.material.map = rt.texture;
      }
      return true;
    };
    const ajouterTete = (mb, x, f, sources) => {
      x.updateMatrix();
      const g = x.matrix.equals(IDENTITE) ? x.geometry : x.geometry.clone().applyMatrix4(x.matrix), nv = g.attributes.position.count, ni = g.index ? g.index.count : nv;
      const k = f.textures.length ? f.specs[f.textures[0]].n : 0;
      if (k && !agrandirTab(f, k)) return false;
      agrandirGeo(f, nv, ni);
      const G = f.g;
      for (const [nom, s] of Object.entries(f.src)) {
        if (!g.attributes[nom]) continue;
        const at = g.attributes[nom], dst = G.attributes[nom].array, o = f.nv * s.t;
        if (at.isInterleavedBufferAttribute) {
          const d = at.data.array, st = at.data.stride;
          for (let i = 0; i < nv; i++) for (let c = 0; c < s.t; c++) dst[o + i * s.t + c] = d[i * st + at.offset + c];
        } else dst.set(at.array.subarray(0, nv * s.t), o);
        marquer(G.attributes[nom], o, nv * s.t);
      }
      G.attributes.a_case.array.fill(mb.case, f.nv, f.nv + nv);
      marquer(G.attributes.a_case, f.nv, nv);
      for (const [u, t] of f.varies) {
        const at = G.attributes["a_" + u], v = valeurs(x.material.uniforms[u]);
        for (let i = 0; i < nv; i++) at.array.set(v, (f.nv + i) * TAILLES[t]);
        marquer(at, f.nv * TAILLES[t], nv * TAILLES[t]);
      }
      for (const t of f.textures) {
        const at = G.attributes["a_couche_" + t];
        at.array.fill(f.couches, f.nv, f.nv + nv);
        marquer(at, f.nv, nv);
        sources[t].forEach((s, c) => {
          copie2D.uniforms.src.value = s;
          copier2(copie2D, f.tabs[t], f.couches + c);
        });
        if (f.specs[t].mips) mips(f.tabs[t]);
      }
      const idx = G.index.array, sens = x.matrix.determinant() < 0, src = g.index?.array;
      for (let i = 0; i < ni; i++) {
        const j = sens ? i - i % 3 + [0, 2, 1][i % 3] : i;
        idx[f.ni + i] = (src ? src[j] : j) + f.nv;
      }
      marquer(G.index, f.ni, ni);
      mb.tete.push({ f, v0: f.nv, nv });
      f.nv += nv;
      f.ni += ni;
      f.couches += k;
      G.setDrawRange(0, f.ni);
      if (g !== x.geometry) g.dispose();
      return true;
    };
    const famille = (cle, creer_) => {
      let gen = 0, f;
      while ((f = familles.get(cle + "#" + gen)) && f.plein) gen++;
      if (!f) familles.set(cle + "#" + gen, f = creer_(cle + "#" + gen));
      return f;
    };
    const ajouter = (m) => {
      if (membres.has(m)) return true;
      const cm = m.tete, sq = m.corps?.skeleton, peaux = [];
      m.modele.traverse((x) => {
        if (x.isSkinnedMesh) peaux.push(x);
      });
      const corps = peaux.map((x) => [x, analyser(x.material)]), pieces = cm?.meshes ? cm.meshes.children.filter((x) => x.isMesh).map((x) => [x, analyser(x.material)]) : null;
      if (!sq || sq.bones.length > 16 || sq.bones.some((b) => !m.os.includes(b)) || !pieces || corps.some(([x, a]) => !a || a.textures.length || x.skeleton.bones.some((b, i) => b !== sq.bones[i]) || x.skeleton.boneInverses.some((b, i) => !b.equals(sq.boneInverses[i])) || !SKIN.every((c) => x.material.vertexShader.includes(`#include <${c}>`))) || pieces.some(([, a]) => !a)) return false;
      const exprs = m.expressions.map((e) => X()[EXPR[e]]), masque = cm.getMask(cm.expression)?.texture;
      const mb = { m, case: libres.pop() ?? nCases++, exprs, corps: [], tete: [], vide: false };
      if (mb.case >= max) {
        if (mb.case === nCases - 1) nCases--;
        return false;
      }
      for (const [x, a] of corps) {
        const cle = "C|" + x.geometry.uuid + "|" + a.cle + "|" + x.bindMatrix.elements.join(",") + "|" + x.renderOrder;
        const f = famille(cle, (c) => familleCorps(x, a, c)), j = f.n++;
        f.qui[j] = mb;
        ecrireCorps(f, j, mb, x);
        f.mesh.geometry.instanceCount = f.n;
        mb.corps.push([f, x]);
        x.removeFromParent();
        x.material.dispose();
      }
      for (const [x, a] of pieces) {
        const sources = {}, specs = {};
        let dyn = null;
        for (const t of a.textures) {
          const s = x.material.uniforms[t].value;
          sources[t] = s === masque && exprs.length ? (dyn = t, exprs.map((e) => cm.getMask(e).texture)) : [s];
          const i = s.image;
          specs[t] = { w: i.width, h: i.height, wrapS: s.wrapS, wrapT: s.wrapT, mag: s.magFilter, min: s.minFilter, mips: s.minFilter !== T.LinearFilter && s.minFilter !== T.NearestFilter && s.mipmaps?.length > 1, n: sources[t].length };
        }
        const cle = "T|" + a.cle + "|" + disposition(x.geometry) + "|" + JSON.stringify(specs) + "|" + x.renderOrder + "|" + dyn;
        let f = famille(cle, (c) => familleTete(x, a, c, specs, dyn));
        if (!ajouterTete(mb, x, f, sources)) {
          f.plein = true;
          f = famille(cle, (c) => familleTete(x, a, c, specs, dyn));
          ajouterTete(mb, x, f, sources);
        }
        x.removeFromParent();
        x.geometry.dispose();
        x.material.dispose();
      }
      cm.setExpression = () => {
      };
      cm.disposeTargets();
      cm._textureManager?.dispose();
      cm._textureManager = null;
      sq.detach?.(cm.meshes);
      m.objet.updateMatrixWorld(true);
      m.torse.copy(m.os[I.chest].matrixWorld);
      const B = sq.bones, n = B.length, ordre = [];
      while (ordre.length < n) for (let k = 0; k < n; k++) if (!ordre.includes(k) && (B.indexOf(B[k].parent) < 0 || ordre.includes(B.indexOf(B[k].parent)))) ordre.push(k);
      mb.sq = {
        n,
        ordre,
        idx: B.map((b) => m.os.indexOf(b)),
        parent: B.map((b) => B.indexOf(b.parent)),
        enf: B.map((b) => B.flatMap((c, k) => c.parent === b ? [k] : [])),
        rep: Float64Array.from(B.flatMap((b) => [b.position.x, b.position.y, b.position.z, b.scale.x, b.scale.y, b.scale.z])),
        ech: B.map((b) => b.scalling ? [b.scalling.x, b.scalling.y, b.scalling.z] : null),
        inv: Float64Array.from(B.flatMap((b, k) => sq.boneInverses[k].elements)),
        racine: B.indexOf(m.os[0]),
        tete: B.indexOf(m.os[I.head]),
        torse: B.indexOf(m.os[I.chest]),
        chev: [B.indexOf(m.os[I.ankle_l]), B.indexOf(m.os[I.ankle_r])],
        modele: Float64Array.from(m.modele.matrix.elements),
        K: Float64Array.from(new T.Matrix4().copy(m.modele.matrixWorld).invert().multiply(m.os[0].parent.matrixWorld).elements),
        c0: new Float64Array(16),
        cle0: NaN
      };
      {
        const d = mb.sq, o = mb.case * STATIQUE * 4;
        for (let k = 0; k < n; k++) {
          const t = o + k * 28, r = d.rep, e = d.ech[k];
          S_.set([r[k * 6], r[k * 6 + 1], r[k * 6 + 2], d.parent[k], r[k * 6 + 3], r[k * 6 + 4], r[k * 6 + 5], e ? 1 : 0, e ? e[0] : 1, e ? e[1] : 1, e ? e[2] : 1, 0], t);
          S_.set(d.inv.subarray(k * 16, k * 16 + 16), t + 12);
        }
        S_.set([n, d.racine, d.tete, 0, d.chev[0], d.chev[1], 0, 0], o + 16 * 28);
        statique.needsUpdate = true;
      }
      m.enFoule = true;
      membres.set(m, mb);
      return true;
    };
    const retirer = (m) => {
      const mb = membres.get(m);
      if (!mb) return;
      membres.delete(m);
      for (const [f] of mb.corps) {
        const j = f.qui.indexOf(mb), l = --f.n;
        if (j !== l) {
          const d = f.qui[l];
          f.qui[j] = d;
          for (const at of Object.values(f.attrs)) {
            for (let c = 0; c < at.itemSize; c++) at.array[j * at.itemSize + c] = at.array[l * at.itemSize + c];
            at.needsUpdate = true;
          }
        }
        f.qui.length = l;
        f.mesh.geometry.instanceCount = l;
      }
      for (const { f, v0, nv } of mb.tete) {
        const at = f.g.attributes.a_case;
        at.array.fill(0, v0, v0 + nv);
        marquer(at, v0, nv);
      }
      E_.fill(0, mb.case * ENTREE * 4, (mb.case + 1) * ENTREE * 4);
      entrees.needsUpdate = true;
      libres.push(mb.case);
    };
    const O = new Float64Array(16), S = new Float64Array(16), A = new Float64Array(16), MX = new Float64Array(16), MY = new Float64Array(16), L3 = new Float64Array(48);
    const preparer2 = (mb, o) => {
      const m = mb.m, d = mb.sq, p = m.pose, P = m.objet.position, s = m.objet.scale.x, sal = m.salto.rotation.x, D = m.D;
      euler(m.inclinaison, m.cap, 0);
      composer(O, 0, P.x, P.y, P.z, Q4[0], Q4[1], Q4[2], Q4[3], s, s, s);
      euler(sal, 0, 0);
      composer(S, 0, 0, m.salto.position.y, 0, Q4[0], Q4[1], Q4[2], Q4[3], 1, 1, 1);
      mul(A, 0, O, 0, S, 0);
      const e = p.r[0], cle = e * 1e6 + p.r[1] * 1e3 + p.r[2];
      if (cle !== d.cle0) {
        d.cle0 = cle;
        euler(p.r[1], 0, p.r[2]);
        const r = Math.sqrt(e);
        composer(MX, 0, 0, -0.42 * D.haut + m.racine.position.y, 0, Q4[0], Q4[1], Q4[2], Q4[3], 1 / r, e, 1 / r);
        mul(MY, 0, MX, 0, d.modele, 0);
        mul(d.c0, 0, MY, 0, d.K, 0);
      }
      mul(MX, 0, A, 0, d.c0, 0);
      const rg = Math.abs(m.rg.x) + Math.abs(m.rg.y) > 1e-4;
      if (rg) euler(m.rg.x, m.rg.y, 0);
      for (let k = 0; k < d.n; k++) {
        const q = p.q[d.idx[k]], t = o + k * 4;
        let qx = q._x, qy = q._y, qz = q._z, qw = q._w;
        if (k === d.tete && rg) {
          const ax = Q4[0], ay = Q4[1], az = Q4[2], aw = Q4[3], bx = qx, by = qy, bz = qz, bw = qw;
          qx = ax * bw + aw * bx + ay * bz - az * by;
          qy = ay * bw + aw * by + az * bx - ax * bz;
          qz = az * bw + aw * bz + ax * by - ay * bx;
          qw = aw * bw - ax * bx - ay * by - az * bz;
        }
        E_[t] = qx;
        E_[t + 1] = qy;
        E_[t + 2] = qz;
        E_[t + 3] = qw;
      }
      vR.copy(m.racineRepos).add(p.o).applyQuaternion(m.versParent);
      E_[o + 64] = vR.x;
      E_[o + 65] = vR.y;
      E_[o + 66] = vR.z;
      E_[o + 67] = !sal && Math.abs(P.y - (m.sol ?? 0)) < 1e-3 ? 1 : 0;
      for (let i = 0; i < 16; i++) E_[o + 68 + i] = MX[i];
      E_[o + 84] = P.x;
      E_[o + 85] = P.y;
      E_[o + 86] = P.z;
      E_[o + 87] = D.cheville;
      E_[o + 88] = O[4];
      E_[o + 89] = O[5];
      E_[o + 90] = O[6];
      E_[o + 91] = s * s;
      E_[o + 92] = m.tailleTete * s * m.unite;
      E_[o + 93] = Math.max(0, mb.exprs.indexOf(m.exprFFL));
      E_[o + 94] = 1;
      E_[o + 95] = 0;
      if (m.regard) {
        let pere = MX, po = 0;
        for (const k of [d.racine, d.parent[d.torse], d.torse]) {
          const r = d.rep, b = k * 6, t = o + k * 4;
          if (k === d.racine) composer(L3, 0, vR.x, vR.y, vR.z, E_[t], E_[t + 1], E_[t + 2], E_[t + 3], r[b + 3], r[b + 4], r[b + 5]);
          else composer(L3, 0, r[b], r[b + 1], r[b + 2], E_[t], E_[t + 1], E_[t + 2], E_[t + 3], r[b + 3], r[b + 4], r[b + 5]);
          mul(L3, po === 16 ? 32 : 16, pere, po, L3, 0);
          pere = L3;
          po = po === 16 ? 32 : 16;
        }
        const te = m.torse.elements;
        for (let i = 0; i < 16; i++) te[i] = L3[po + i];
      }
    };
    const passe = new T.Scene(), passeCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    {
      const q = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
        uniforms: { entrees: { value: entrees }, statique: { value: statique } },
        depthTest: false,
        depthWrite: false,
        blending: T.NoBlending,
        vertexShader: "void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }",
        fragmentShader: PASSE_OS
      }));
      q.frustumCulled = false;
      passe.add(q);
    }
    const maj = () => {
      for (const mb of membres.values()) {
        const o = mb.case * ENTREE * 4;
        if (mb.m.objet.visible && !mb.m.horsVue) preparer2(mb, o);
        else E_[o + 94] = 0;
      }
      entrees.image.height = nCases;
      entrees.needsUpdate = true;
      const avant = rendu.getRenderTarget();
      rendu.setRenderTarget(cible);
      rendu.render(passe, passeCam);
      rendu.setRenderTarget(avant);
    };
    const verifier = () => {
      maj();
      const lu = new Float32Array(LIGNE * 4 * max);
      rendu.readRenderTargetPixels(cible, 0, 0, LIGNE, max, lu);
      let ecart = 0;
      const t = new T.Matrix4(), v = new T.Vector3(), q = new T.Quaternion(), sc = new T.Vector3();
      for (const mb of membres.values()) {
        const m = mb.m, o = mb.case * LIGNE * 4;
        if (!m.objet.visible) continue;
        m.ecrireOs();
        m.objet.updateMatrixWorld(true);
        const sq = m.corps.skeleton;
        sq.update();
        for (let i = 0; i < 256; i++) ecart = Math.max(ecart, Math.abs(sq.boneMatrices[i] - lu[o + i]));
        t.fromArray(sq.boneMatrices, mb.sq.tete * 16).multiply(new T.Matrix4().fromArray(mb.sq.inv, mb.sq.tete * 16).invert()).decompose(v, q, sc);
        t.compose(v, q, m.tete.meshes.scale);
        for (let i = 0; i < 16; i++) ecart = Math.max(ecart, Math.abs(t.elements[i] - lu[o + 256 + i]));
      }
      return ecart;
    };
    const info = () => ({
      mii: membres.size,
      familles: familles.size,
      corps: [...familles.values()].filter((f) => f.corps).length,
      sommets: [...familles.values()].reduce((s, f) => s + (f.corps ? f.n * f.mesh.geometry.attributes.position.count : f.nv), 0),
      tableaux: [...familles.values()].filter((f) => f.textures?.length && !f.corps).map((f) => f.textures.map((t) => `${f.specs[t].w}x${f.specs[t].h} ${f.couches}/${f.tabs[t]?.depth}${f.dyn ? " masque" : ""}`).join()),
      couchesMo: Math.round([...familles.values()].reduce((s, f) => s + Object.entries(f.tabs || {}).reduce((t, [k, rt]) => t + f.specs[k].w * f.specs[k].h * 4 * rt.depth, 0), 0) / 1048576)
    });
    const liberer = () => {
      for (const f of familles.values()) {
        f.mesh.removeFromParent();
        f.mesh.material.dispose();
        const g = f.mesh.geometry;
        if (f.corps) {
          for (const k of Object.keys(g.attributes)) if (!f.attrs[k]) g.deleteAttribute(k);
          g.index = null;
        }
        g.dispose();
        for (const rt of Object.values(f.tabs || {})) rt.dispose();
      }
      familles.clear();
      membres.clear();
      cible.dispose();
      entrees.dispose();
      statique.dispose();
      passe.children[0].geometry.dispose();
      passe.children[0].material.dispose();
      copie2D.dispose();
      copieTab.dispose();
      PLAN.dispose();
    };
    return { ajouter, retirer, maj, info, liberer, verifier, lumieres, ombrer };
  };
  const IDENTITE = new T.Matrix4(), vR = new T.Vector3();
  const Q4 = new Float64Array(4);
  const euler = (x, y, z) => {
    const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2), s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);
    Q4[0] = s1 * c2 * c3 + c1 * s2 * s3;
    Q4[1] = c1 * s2 * c3 - s1 * c2 * s3;
    Q4[2] = c1 * c2 * s3 + s1 * s2 * c3;
    Q4[3] = c1 * c2 * c3 - s1 * s2 * s3;
  };
  const composer = (e, o, px, py, pz, x, y, z, w, sx, sy, sz) => {
    const x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
    e[o] = (1 - (yy + zz)) * sx;
    e[o + 1] = (xy + wz) * sx;
    e[o + 2] = (xz - wy) * sx;
    e[o + 3] = 0;
    e[o + 4] = (xy - wz) * sy;
    e[o + 5] = (1 - (xx + zz)) * sy;
    e[o + 6] = (yz + wx) * sy;
    e[o + 7] = 0;
    e[o + 8] = (xz + wy) * sz;
    e[o + 9] = (yz - wx) * sz;
    e[o + 10] = (1 - (xx + yy)) * sz;
    e[o + 11] = 0;
    e[o + 12] = px;
    e[o + 13] = py;
    e[o + 14] = pz;
    e[o + 15] = 1;
  };
  const mul = (r, ro, a, ao, b, bo) => {
    const a0 = a[ao], a1 = a[ao + 1], a2 = a[ao + 2], a4 = a[ao + 4], a5 = a[ao + 5], a6 = a[ao + 6], a8 = a[ao + 8], a9 = a[ao + 9], a10 = a[ao + 10], a12 = a[ao + 12], a13 = a[ao + 13], a14 = a[ao + 14];
    for (let c = 0; c < 16; c += 4) {
      const b0 = b[bo + c], b1 = b[bo + c + 1], b2 = b[bo + c + 2], b3 = c === 12 ? 1 : 0;
      r[ro + c] = a0 * b0 + a4 * b1 + a8 * b2 + a12 * b3;
      r[ro + c + 1] = a1 * b0 + a5 * b1 + a9 * b2 + a13 * b3;
      r[ro + c + 2] = a2 * b0 + a6 * b1 + a10 * b2 + a14 * b3;
      r[ro + c + 3] = b3;
    }
  };
  const hexa = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("");
  const cleDe = (d) => "mii:" + hexa(d.subarray(12, 22));
  const lireJSON = async (chemin) => JSON.parse(new TextDecoder().decode(await lire(chemin)));
  const lireSiens = async () => {
    const l = [], base = window.__pcvMiiBase;
    const ajouter = (donnees, nom, pantalon, moi) => {
      let d;
      try {
        d = octets(donnees);
      } catch (e) {
        return;
      }
      if (d.length < 92) return;
      const cle = cleDe(d), deja = l.find((e) => e.cle === cle);
      if (deja) {
        if (moi && !l.some((e) => e.moi)) {
          deja.moi = true;
          deja.pantalon = "rouge";
        }
        return;
      }
      l.push({ cle, donnees: d, nom: nom || "", pantalon: PANTALONS[pantalon] ? pantalon : "gris", moi: !!moi });
    };
    if (base) {
      for (const e of base.liste()) ajouter(e.donnees, e.nom, e.pantalon, e.moi);
      return l;
    }
    try {
      const idx = await lireJSON("index.json"), lus = [];
      for (const f of new Set((idx.mii || []).map((e) => e.fichier).filter(Boolean))) {
        let j;
        try {
          j = await lireJSON(f);
        } catch (e) {
          continue;
        }
        for (const m of [].concat(j)) if (m?.donnees_3ds?.hex) lus.push(m);
      }
      const sien = lus.find((m) => m.source?.mii_personnel_probable) || lus.find((m) => /QR/.test(m.source?.nature || ""));
      for (const m of lus) ajouter(m.donnees_3ds.hex, m.nom, m === sien ? "rouge" : "gris", m === sien);
    } catch (e) {
    }
    return l.sort((a, b) => b.moi - a.moi);
  };
  let lecture = null, suivante = null;
  const siens = () => lecture ? suivante ||= lecture.then(() => {
    suivante = null;
    return siens();
  }) : lecture = lireSiens().finally(() => {
    lecture = null;
  });
  const amis = (n = 4) => {
    let l = [];
    try {
      const fs = window.opener?.g_FriendsUIApp?.FriendStore;
      l = [...fs?.all_friends || fs?.allFriends || []].map((f) => f.persona || f.m_persona).filter(Boolean);
    } catch (e) {
    }
    return l.sort((a, b) => (b.m_ePersonaState > 0) - (a.m_ePersonaState > 0) || (b.m_rtLastSeenOnline || 0) - (a.m_rtLastSeenOnline || 0)).slice(0, n).map((p) => {
      const g = "ami-" + empreinte(p.m_steamid?.ConvertTo64BitString?.() || p.m_strPlayerName || "");
      return { cle: g, graine: g, nom: p.m_strPlayerName || "", pantalon: "bleu", sid: p.m_steamid?.ConvertTo64BitString?.() || "" };
    });
  };
  const habitantsInvites = () => invites.map((v, i) => ({ cle: "invite:" + i, donnees: octets(v.donnees), nom: v.nom, pantalon: "gris" }));
  const habitantsDefaut = () => defauts.map((v) => ({ cle: "defaut:" + v.id, donnees: octets(v.donnees), nom: v.nom, pantalon: "gris" }));
  const hasard = (k) => ({ cle: "hasard:" + k, graine: "hasard-" + k, nom: "", pantalon: "gris" });
  const API = {
    clips: CLIPS,
    creer,
    pantin,
    foule,
    eclairer,
    FOULEE,
    siens,
    amis,
    habitantsInvites,
    habitantsDefaut,
    hasard,
    invite: (i) => octets(invites[i % invites.length].donnees),
    get invites() {
      return invites;
    },
    charInfo,
    poserSwitch,
    enCouleursSwitch,
    REGLAGE_SWITCH,
    get MateriauSwitch() {
      return materiauSwitch();
    },
    PANTALONS,
    animations: [...Object.keys(ANIMS), ...Object.keys(CLIPS)],
    expressions: ETATS,
    version: 2,
    vrais: true,
    get ffl() {
      return ffl;
    },
    get FFLjs() {
      return F;
    }
  };
  window.__pcvVraisMii = { preparer, charger, lire, API, get etat() {
    return ffl && gabarits ? { F, ffl, rendu0, gabarits, invites, defauts } : null;
  } };
  if (prec) {
    if (!defauts.length) lireDefauts();
    window.__pcvMii3D = API;
    return "vrais Mii : moteur repris";
  }
  return "vrais Mii : en attente de preparer()";
})();
