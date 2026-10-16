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
    const [res, ...glb] = await Promise.all([o.lire(RESSOURCE), ...CORPS.map((c) => o.lire(c))]);
    try {
      invites = JSON.parse(new TextDecoder().decode(await o.lire(INVITES))).invites || [];
    } catch (e) {
      invites = [];
    }
    await lireDefauts();
    ffl = await F.FFL.initWithResource(new Uint8Array(res), window.ModuleFFL);
    rendu0 = o.rendu || null;
    if (rendu0) ffl.setRenderer(rendu0);
    gabarits = await Promise.all(glb.map((b) => new Promise((ok, ko) => new E.GLTFLoader().parse(b, "", ok, ko)).then(gabarit)));
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
    rz: 28
  };
  const NC = 29, NEUTRE = new Float32Array(NC);
  NEUTRE[K.ech] = 1;
  NEUTRE[K.egz] = NEUTRE[K.edz] = 0.24;
  NEUTRE[K.cg] = NEUTRE[K.cd] = 0.14;
  NEUTRE[K.egx] = NEUTRE[K.edx] = -0.04;
  NEUTRE[K.hgz] = NEUTRE[K.hdz] = 0.03;
  const BRAS_SUSP = 2.42;
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
  const ANGLES = [
    (P) => [P[K.brx], P[K.bry], P[K.brz]],
    null,
    (P) => [P[K.tx], P[K.ty], P[K.tz]],
    (P) => [P[K.hx], P[K.hy], P[K.hz]],
    (P) => [P[K.egx], P[K.egy], P[K.egz]],
    (P) => [-P[K.cg], 0, 0],
    null,
    (P) => [P[K.edx], -P[K.edy], -P[K.edz]],
    (P) => [-P[K.cd], 0, 0],
    null,
    (P) => [P[K.hgx], 0, P[K.hgz]],
    (P) => [P[K.gg], 0, 0],
    null,
    (P) => [P[K.hdx], 0, -P[K.hdz]],
    (P) => [P[K.gd], 0, 0],
    null
  ];
  const nouvellePose = () => ({ q: OS.map(() => new T.Quaternion()), o: new T.Vector3(), r: [1, 0, 0] });
  const depuisCanaux = (P, g, U, pose) => {
    for (let i = 0; i < OS.length; i++) {
      const a = ANGLES[i];
      if (a) {
        const [x, y, z] = a(P);
        qe.setFromEuler(eu.set(x, y, z));
      } else qe.identity();
      pose.q[i].copy(g.Zp[i]).multiply(qe).multiply(g.Z[i]);
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
      const v = (o.courir ? 2.4 : 1.05) * (o.vitesse || 1) * m.taille, pos = objet.position;
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
    let cm;
    try {
      cm = tete(true);
    } catch (e) {
      if (!(e instanceof F.FFLiVerifyReasonException)) throw e;
      cm = tete(false);
    }
    cm.meshes.traverse((x) => {
      x.frustumCulled = false;
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
    corps.skeleton.update();
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
      tete: sommet - ici("head").y
    };
    D.kh = D.hanche / HAUT_IMITATION;
    D.prise = D.epauleY - D.bras * Math.cos(BRAS_SUSP);
    const estClip = (nom) => !!(CLIPS[nom] && g.clips[CLIPS[nom]]);
    m.jouer = (nom, opt = {}) => {
      if (!ANIMS[nom] && !estClip(nom)) return m;
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
      salto.position.y = 0.42 * D.haut;
      dessous.position.y = -0.42 * D.haut;
      return m;
    };
    const P = new Float32Array(NC), poseA = nouvellePose(), poseB = nouvellePose(), poseBras = nouvellePose();
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
        m.tAnc += dt;
        m.fondu += dt / m.fonduDuree;
        if (m.fondu >= 1) m.ancienne = null;
        else {
          evaluer(m.ancienne, m.tAnc, poseA);
          melanger(poseA, poseB, lisse(m.fondu));
          copier(poseB, poseA);
        }
      }
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
        objet.updateMatrixWorld(true);
        inv.copy(os[I.chest].matrixWorld).invert();
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
      for (let i = 0; i < OS.length; i++) os[i].quaternion.copy(poseB.q[i]);
      if (Math.abs(m.rg.x) + Math.abs(m.rg.y) > 1e-4) os[I.head].quaternion.premultiply(qRegard.setFromEuler(eu.set(m.rg.x, m.rg.y, 0)));
      poserRacine(poseB.o);
      const e = poseB.r[0];
      racine.scale.set(1 / Math.sqrt(e), e, 1 / Math.sqrt(e));
      racine.rotation.set(poseB.r[1], 0, poseB.r[2]);
      tourner(m, dt);
      objet.rotation.set(m.inclinaison, m.cap, 0);
      recalerTete();
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
    mouvements(m);
    m.suivre = (p, dt) => {
      if (p.nJouer !== m.nSuivi) {
        const f = m.nSuivi === void 0 ? 0 : p.fonduVoulu;
        m.nSuivi = p.nJouer;
        m.jouer(p.anim, { fondu: f, redemarrer: true, vitesse: p.vitesse });
      }
      m.t = p.t - dt * m.vitesse;
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
    m.rectEcran = (cam, W, H) => {
      objet.updateMatrixWorld(true);
      corps.skeleton.update();
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
      return { cle: g, graine: g, nom: p.m_strPlayerName || "", pantalon: "bleu" };
    });
  };
  const habitantsInvites = () => invites.map((v, i) => ({ cle: "invite:" + i, donnees: octets(v.donnees), nom: v.nom, pantalon: "gris" }));
  const habitantsDefaut = () => defauts.map((v) => ({ cle: "defaut:" + v.id, donnees: octets(v.donnees), nom: v.nom, pantalon: "gris" }));
  const hasard = (k) => ({ cle: "hasard:" + k, graine: "hasard-" + k, nom: "", pantalon: "gris" });
  const API = {
    creer,
    pantin,
    eclairer,
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
