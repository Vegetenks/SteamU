(() => {
  window.__pcvMiiMaker?.retirer?.();
  const Tr = window.__pcvT || ((c) => c);
  const T = window.THREE;
  const CLE = "pcv-mii", VERSION = 1;
  const lireLS = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const ecrireLS = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch (e) {
      return false;
    }
  };
  const son = (n) => {
    try {
      window.__pcvSon?.(n);
    } catch (e) {
    }
  };
  const TOUCHES = { 1: ["A", "#2fbf71"], 2: ["B", "#e5484d"], 3: ["X", "#2a8cff"], 4: ["Y", "#e0a100"], 5: ["LB", "#5b6676"], 6: ["RB", "#5b6676"] };
  const touche = (c) => window.__pcvTouche?.(c) || TOUCHES[c] || ["?", "#5b6676"];
  const borne = (x, a, b) => Math.max(a, Math.min(b, x));
  const u = (n) => `calc(var(--u, 1px) * ${n})`;
  const echapper = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const TAILLE_CI = 288, TAILLE_STORE = 96;
  const POS = {
    faceType: 4,
    faceColor: 8,
    faceTex: 12,
    faceMake: 16,
    hairType: 20,
    hairColor: 24,
    hairFlip: 28,
    eyeType: 32,
    eyeColor: 36,
    eyeScale: 40,
    eyeAspect: 44,
    eyeRotate: 48,
    eyeX: 52,
    eyeY: 56,
    eyebrowType: 60,
    eyebrowColor: 64,
    eyebrowScale: 68,
    eyebrowAspect: 72,
    eyebrowRotate: 76,
    eyebrowX: 80,
    eyebrowY: 84,
    noseType: 88,
    noseScale: 92,
    noseY: 96,
    mouthType: 100,
    mouthColor: 104,
    mouthScale: 108,
    mouthAspect: 112,
    mouthY: 116,
    mustacheType: 120,
    beardType: 124,
    beardColor: 128,
    mustacheScale: 132,
    mustacheY: 136,
    glassType: 140,
    glassColor: 144,
    glassScale: 148,
    glassY: 152,
    moleType: 156,
    moleScale: 160,
    moleX: 164,
    moleY: 168,
    height: 172,
    build: 176,
    gender: 224,
    birthMonth: 228,
    birthDay: 232,
    favoriteColor: 236
  };
  const NOM = 180, NOM_MAX = 10, ID = 264, ID_TAILLE = 10;
  const PLAGE = {
    faceType: 11,
    faceColor: 5,
    faceTex: 11,
    faceMake: 11,
    hairType: 131,
    hairColor: 7,
    hairFlip: 1,
    eyeType: 59,
    eyeColor: 5,
    eyeScale: 7,
    eyeAspect: 6,
    eyeRotate: 7,
    eyeX: 12,
    eyeY: 18,
    eyebrowType: 23,
    eyebrowColor: 7,
    eyebrowScale: 8,
    eyebrowAspect: 6,
    eyebrowRotate: 11,
    eyebrowX: 12,
    eyebrowY: [3, 18],
    noseType: 17,
    noseScale: 8,
    noseY: 18,
    mouthType: 35,
    mouthColor: 4,
    mouthScale: 8,
    mouthAspect: 6,
    mouthY: 18,
    mustacheType: 5,
    beardType: 5,
    beardColor: 7,
    mustacheScale: 8,
    mustacheY: 16,
    glassType: 8,
    glassColor: 5,
    glassScale: 7,
    glassY: 20,
    moleType: 1,
    moleScale: 8,
    moleX: 16,
    moleY: 30,
    height: 127,
    build: 127,
    gender: 1,
    birthMonth: 12,
    birthDay: 31,
    favoriteColor: 11
  };
  const plage = (c) => Array.isArray(PLAGE[c]) ? PLAGE[c] : [0, PLAGE[c]];
  const vue = (ci) => new DataView(ci.buffer, ci.byteOffset, ci.byteLength);
  const lireC = (ci, c) => vue(ci).getInt32(POS[c], true);
  const ecrireC = (ci, c, x) => {
    const [a, b] = plage(c);
    vue(ci).setInt32(POS[c], borne(Math.round(x), a, b), true);
  };
  const nomDe = (ci) => {
    let s = "";
    for (let i = 0; i < NOM_MAX; i++) {
      const k = vue(ci).getUint16(NOM + 2 * i, true);
      if (!k) break;
      s += String.fromCharCode(k);
    }
    return s;
  };
  const nommer = (ci, s) => {
    const t = String(s).slice(0, NOM_MAX);
    for (let i = 0; i <= NOM_MAX; i++) vue(ci).setUint16(NOM + 2 * i, i < t.length ? t.charCodeAt(i) : 0, true);
  };
  const JOURS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const MOIS = ["?", ...Array.from({ length: 12 }, (_, i) => new Date(2e3, i, 1).toLocaleDateString(window.__pcvLocale?.() || "fr-FR", { month: "long" }))];
  const DEPART = {
    faceType: 0,
    faceColor: 0,
    faceTex: 0,
    faceMake: 0,
    hairColor: 1,
    hairFlip: 0,
    eyeColor: 0,
    eyeScale: 4,
    eyeAspect: 3,
    eyeRotate: 4,
    eyeX: 2,
    eyeY: 12,
    eyebrowColor: 1,
    eyebrowScale: 4,
    eyebrowAspect: 3,
    eyebrowRotate: 6,
    eyebrowX: 2,
    eyebrowY: 10,
    noseType: 1,
    noseScale: 4,
    noseY: 9,
    mouthType: 23,
    mouthColor: 0,
    mouthScale: 4,
    mouthAspect: 3,
    mouthY: 13,
    mustacheType: 0,
    beardType: 0,
    beardColor: 0,
    mustacheScale: 4,
    mustacheY: 10,
    glassType: 0,
    glassColor: 0,
    glassScale: 4,
    glassY: 10,
    moleType: 0,
    moleScale: 4,
    moleX: 2,
    moleY: 20,
    height: 64,
    build: 64,
    favoriteColor: 0,
    birthMonth: 0,
    birthDay: 0
  };
  const DEPART_SEXE = [{ gender: 0, hairType: 33, eyeType: 2, eyebrowType: 6 }, { gender: 1, hairType: 12, eyeType: 4, eyebrowType: 0 }];
  const hex = (o) => [...o].map((b) => b.toString(16).padStart(2, "0")).join("");
  const deHex = (s) => Uint8Array.from({ length: s.length >> 1 }, (_, i) => parseInt(s.substr(i * 2, 2), 16));
  const b64 = (o) => btoa(String.fromCharCode(...o));
  const deB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const nomStore = (s) => {
    let t = "";
    for (let i = 0; i < NOM_MAX; i++) {
      const k = s[26 + 2 * i] | s[27 + 2 * i] << 8;
      if (!k) break;
      t += String.fromCharCode(k);
    }
    return t;
  };
  const nouvelleConsole = () => {
    const o = crypto.getRandomValues(new Uint8Array(6));
    o[0] = o[0] & 252 | 2;
    return hex(o);
  };
  const base = () => {
    const d = lireLS(CLE, null), b = d && typeof d === "object" ? d : {};
    const mii = (Array.isArray(b.mii) ? b.mii : []).filter((m) => m && typeof m.id === "string" && typeof m.donnees === "string");
    return { version: VERSION, moi: mii.some((m) => m.id === b.moi) ? b.moi : null, console: /^[0-9a-f]{12}$/.test(b.console || "") ? b.console : nouvelleConsole(), mii };
  };
  const liste = () => {
    const b = base();
    return b.mii.map((m) => {
      const d = deB64(m.donnees);
      return { id: m.id, nom: nomStore(d), donnees: d, moi: m.id === b.moi };
    });
  };
  const garder = (b) => {
    ecrireLS(CLE, b);
    window.dispatchEvent(new CustomEvent("pcv-mii", { detail: { moi: b.moi, mii: liste() } }));
  };
  const MB = () => window.__pcvMiiBase;
  const choisirMoi = (id) => {
    if (MB()) {
      MB().definirMoi(id);
      return MB().moi()?.id ?? null;
    }
    const b = base();
    b.moi = b.mii.some((m) => m.id === id) ? id : null;
    garder(b);
    return b.moi;
  };
  const supprimer = (id) => {
    if (MB()) MB().supprimer(id);
    else {
      const b = base();
      b.mii = b.mii.filter((m) => m.id !== id);
      if (b.moi === id) b.moi = null;
      garder(b);
    }
    window.__pcvGardeRobe?.definirTenue?.(id, []);
  };
  const dupliquer = (id) => {
    if (MB()) return MB().copier(id);
    const b = base(), e = b.mii.find((m) => m.id === id);
    if (!e) return null;
    const d = deB64(e.donnees), pris = new Set(b.mii.map((m) => m.id));
    let ts = Math.floor((Date.now() / 1e3 - 1262304e3) / 2), n;
    do {
      n = hex([144 | ts >>> 24 & 15, ts >>> 16 & 255, ts >>> 8 & 255, ts & 255, ...deHex(b.console)]);
      ts++;
    } while (pris.has(n));
    d.set(deHex(n), 12);
    crcPoser(d);
    b.mii.push({ id: n, donnees: b64(d), cree: Date.now(), modifie: Date.now() });
    garder(b);
    return n;
  };
  const crcPoser = (d) => {
    let c = 0;
    for (let i = 0; i < 94; i++) {
      c ^= d[i] << 8;
      for (let k = 0; k < 8; k++) c = c & 32768 ? (c << 1 ^ 4129) & 65535 : c << 1 & 65535;
    }
    d[94] = c >> 8;
    d[95] = c & 255;
    return d;
  };
  const ajouterImporte = (d, origine, source) => {
    if (moteur && !depuisStore(d)) throw new Error("refus\xE9 par le moteur des Mii");
    if (MB()) return MB().ajouter(d, origine, source);
    const b = base(), id = hex(d.subarray(12, 22)), e = b.mii.find((m) => m.id === id), t = Date.now();
    if (e) Object.assign(e, { donnees: b64(d), modifie: t });
    else b.mii.push({ id, donnees: b64(d), cree: t, modifie: t, origine, ...source ? { source } : {} });
    garder(b);
    return id;
  };
  const exporter = () => {
    const l = liste(), j = {
      _format: "pcv-mii-sauvegarde-1",
      cree: (/* @__PURE__ */ new Date()).toISOString(),
      moi: l.find((m) => m.moi)?.id ?? null,
      mii: l.map((m) => ({ id: m.id, nom: m.nom, donnees: b64(m.donnees) }))
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(j, null, 1)], { type: "application/json" }));
    a.download = `mes-mii-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4e3);
    return l.length;
  };
  const importerFichier = async (f) => {
    const nom = (f.name || "").toLowerCase(), QR = window.__pcvMiiQR, ajoutes = [];
    if (/^image\//.test(f.type) || /\.(png|jpe?g|webp|gif|bmp)$/.test(nom)) {
      if (!QR) throw new Error("lecture des QR codes absente");
      ajoutes.push(ajouterImporte(await QR.depuisImage(f), "3ds-qr"));
      return ajoutes;
    }
    const o = new Uint8Array(await f.arrayBuffer());
    if (o.length === TAILLE_STORE) {
      ajoutes.push(ajouterImporte(o.slice(), "fichier"));
      return ajoutes;
    }
    if (o.length >= 112 && o.length <= 1024 && o[0] !== 123 && QR) {
      ajoutes.push(ajouterImporte(await QR.dechiffrer(o), "3ds-qr"));
      return ajoutes;
    }
    let j;
    try {
      j = JSON.parse(new TextDecoder().decode(o));
    } catch (e) {
      throw new Error("fichier non reconnu");
    }
    const entrees = Array.isArray(j?.mii) ? j.mii : j?.donnees_3ds ? [{ donnees: j.donnees_3ds }] : [];
    let moi = null;
    for (const e of entrees) {
      try {
        const d = versOctetsMii(e.donnees);
        if (d?.length !== TAILLE_STORE) continue;
        const id = ajouterImporte(d, "fichier");
        ajoutes.push(id);
        if (j.moi && e.id === j.moi) moi = id;
      } catch (x) {
        console.warn("Mii Maker : Mii refus\xE9 \xE0 l'import", x);
      }
    }
    if (!entrees.length) throw new Error("aucun Mii dans ce fichier");
    if (moi && !liste().some((m) => m.moi)) choisirMoi(moi);
    return ajoutes;
  };
  let autres = null, autresP = null;
  const chargerAutres = () => autresP ||= (async () => {
    const l = [], lire = moteur?.lire;
    if (!lire) return autres = l;
    const json = async (c) => JSON.parse(new TextDecoder().decode(await lire(c)));
    try {
      const j = await json("luigi-switch.json");
      const d = versOctetsMii(j.donnees);
      if (d.length === TAILLE_STORE) l.push({ id: "autre:luigi", nom: j.nom || "Luigi", donnees: d, autre: true });
    } catch (e) {
    }
    try {
      (await json("invites.json")).invites.forEach((x, i) => {
        const ci = convertir("_FFLpGetCharInfoFromMiiDataOfficialRFL", versOctetsMii(x.donnees), TAILLE_CI);
        if (ci) l.push({ id: "autre:invite" + i, nom: x.nom || Tr("miimaker.invite"), ci, autre: true });
      });
    } catch (e) {
    }
    return autres = l;
  })();
  const versOctetsMii = (s) => {
    s = String(s ?? "").trim();
    return /^[0-9a-f]+$/i.test(s) && !(s.length % 2) ? deHex(s) : deB64(s);
  };
  let moteur = null;
  let enPreparation = null;
  const preparerMoteur = (m) => enPreparation ||= (async () => {
    m = typeof m === "function" ? m() : m;
    m = await m;
    if (!T || !m?.FFLjs || !m?.ffl?.module || !m?.materiau) throw new Error("moteur des Mii absent");
    const r = { F: m.FFLjs, ffl: m.ffl, M: m.ffl.module, Mat: m.materiau, MatTex: m.materiauTextures || m.materiau, aides: m.aides || null, corps: m.corps || null, palettes: m.palettes || null, lire: m.lire || null };
    if (r.aides && !r.corps && m.lire) {
      try {
        r.corps = await Promise.all(["corps/miiBodyM_wiiu.glb", "corps/miiBodyF_wiiu.glb"].map(async (c) => {
          const b = await m.lire(c);
          return new Promise((ok, ko) => new r.aides.GLTFLoader().parse(b, "", ok, ko));
        }));
      } catch (e) {
        console.warn("Mii Maker : corps absents, t\xEAtes seules", e);
        r.corps = null;
      }
    }
    if (r.corps && !r.aides) r.corps = null;
    r.aides?.addSkeletonScalingExtensions?.(T.Skeleton);
    if (!r.palettes && m.lire) {
      try {
        r.palettes = JSON.parse(new TextDecoder().decode(await m.lire("palettes.json")));
      } catch (e) {
        r.palettes = null;
      }
    }
    return moteur = r;
  })().catch((e) => {
    enPreparation = null;
    throw e;
  });
  const moteurSteam = () => {
    const V = window.__pcvVraisMii;
    if (!V) return Promise.reject(new Error("vrais-mii.js absent"));
    return V.charger().then(() => {
      const e = V.etat;
      if (!e) throw new Error("moteur des Mii absent");
      return {
        FFLjs: e.F,
        ffl: e.ffl,
        materiau: window.FFLShaderMaterial,
        materiauTextures: window.FFLShaderMaterial,
        aides: window.__pcvESM || null,
        lire: V.lire,
        corps: e.gabarits.map((g) => g.gltf)
      };
    });
  };
  const X = () => moteur.F.FFLExpression;
  const convertir = (fn, entree, tailleSortie) => {
    const M = moteur.M, p = M._malloc(entree.length), q = M._malloc(tailleSortie);
    try {
      M.HEAPU8.set(entree, p);
      M.HEAPU8.fill(0, q, q + tailleSortie);
      return M[fn](q, p) ? M.HEAPU8.slice(q, q + tailleSortie) : null;
    } finally {
      M._free(p);
      M._free(q);
    }
  };
  const versStore = (ci) => convertir("_FFLpGetStoreDataFromCharInfo", ci, TAILLE_STORE);
  const depuisStore = (s) => convertir("_FFLpGetCharInfoFromStoreData", s, TAILLE_CI);
  const hasard = (sexe, age) => {
    const F = moteur.F, ci = F.getRandomCharInfo(moteur.ffl, sexe ?? F.FFLGender.ALL, age ?? F.FFLAge.ALL, F.FFLRace.ALL);
    ecrireC(ci, "height", 64 + (Math.random() - 0.5) * 64);
    ecrireC(ci, "build", 64 + (Math.random() - 0.5) * 56);
    nommer(ci, "");
    return ci;
  };
  const depart = (sexe) => {
    const ci = hasard(sexe);
    for (const [c, x] of Object.entries({ ...DEPART, ...DEPART_SEXE[sexe] })) ecrireC(ci, c, x);
    return ci;
  };
  const couleurFavorite = (i) => {
    const M = moteur.M, p = M._malloc(16);
    try {
      M._FFLGetFavoriteColor(p, i);
      return "#" + [...M.HEAPF32.subarray(p / 4, p / 4 + 3)].map((x) => Math.round(borne(x, 0, 1) * 255).toString(16).padStart(2, "0")).join("");
    } finally {
      M._free(p);
    }
  };
  const tete = (ci, desc) => {
    const F = moteur.F, apart = moteur.MatTex !== moteur.Mat;
    const faire = (verifier) => {
      const cm = new F.CharModel(moteur.ffl, ci, desc, moteur.Mat, apart ? void 0 : rendu, verifier);
      if (apart) cm.initTextures(rendu, moteur.MatTex);
      return cm;
    };
    try {
      return faire(true);
    } catch (e) {
      if (!(e instanceof F.FFLiVerifyReasonException)) throw e;
      return faire(false);
    }
  };
  const pantalon = (moi) => {
    const P = moteur.F.pantsColors, c = P?.[moi ? 2 : 0];
    return new T.Color().setHex(c ? c.getHex() : moi ? 7348245 : 4212558, T.LinearSRGBColorSpace);
  };
  const NORM = {
    eyebrow: ["eyebrowScale", "eyebrowAspect", "eyebrowRotate", "eyebrowX", "eyebrowY"],
    eye: ["eyeScale", "eyeAspect", "eyeRotate", "eyeX", "eyeY"],
    nose: ["noseScale", "noseY"],
    mouth: ["mouthScale", "mouthAspect", "mouthY"],
    mustache: ["mustacheScale", "mustacheY"],
    glass: ["glassScale", "glassY"]
  };
  const R = (champ, nom, moins, plus) => ({ champ, nom, moins, plus });
  const hauteur = (c) => R(c, Tr("miimaker.hauteur"), "haut", "bas"), taille = (c) => R(c, Tr("miimaker.taille"), "moins", "plus"), etirement = (c) => R(c, Tr("miimaker.etirement"), "aplatir", "etirer"), rotation = (c) => R(c, Tr("miimaker.rotation"), "tournerG", "tournerD");
  const CATS = [
    { id: "profil", nom: Tr("miimaker.profil"), vue: "corps", pages: [{ nom: Tr("miimaker.profil"), type: "profil" }, { nom: Tr("miimaker.couleur_preferee"), type: "nuancier", champ: "favoriteColor", palette: "couleurs_preferees" }, { nom: Tr("miimaker.silhouette"), type: "silhouette" }] },
    { id: "visage", nom: Tr("miimaker.visage"), pages: [
      { nom: Tr("miimaker.forme"), type: "grille", champ: "faceType", cadre: "tete" },
      { nom: Tr("miimaker.teint"), type: "nuancier", champ: "faceColor", palette: "teints", cadre: "tete" },
      { nom: Tr("miimaker.rides"), type: "grille", champ: "faceTex", cadre: "visage" },
      { nom: Tr("miimaker.maquillage"), type: "grille", champ: "faceMake", cadre: "visage" }
    ] },
    { id: "coiffure", nom: Tr("miimaker.coiffure"), pages: [{ nom: Tr("miimaker.coupe"), type: "grille", champ: "hairType", cadre: "tete", bascule: { champ: "hairFlip", nom: Tr("miimaker.raie_inversee") } }, { nom: Tr("miimaker.couleur"), type: "nuancier", champ: "hairColor", palette: "cheveux", cadre: "tete" }] },
    { id: "sourcils", nom: Tr("miimaker.sourcils"), pages: [
      { nom: Tr("miimaker.forme"), type: "grille", champ: "eyebrowType", cadre: "sourcils", normaliser: NORM.eyebrow },
      { nom: Tr("miimaker.couleur"), type: "nuancier", champ: "eyebrowColor", palette: "cheveux", cadre: "sourcils" },
      { nom: Tr("miimaker.position"), type: "reglages", reglages: [hauteur("eyebrowY"), R("eyebrowX", Tr("miimaker.ecart"), "rapprocher", "ecarter"), taille("eyebrowScale"), etirement("eyebrowAspect"), rotation("eyebrowRotate")] }
    ] },
    { id: "yeux", nom: Tr("miimaker.yeux"), pages: [
      { nom: Tr("miimaker.forme"), type: "grille", champ: "eyeType", cadre: "yeux", normaliser: NORM.eye },
      { nom: Tr("miimaker.couleur"), type: "nuancier", champ: "eyeColor", palette: "yeux", cadre: "yeux" },
      { nom: Tr("miimaker.position"), type: "reglages", reglages: [hauteur("eyeY"), R("eyeX", Tr("miimaker.ecart"), "rapprocher", "ecarter"), taille("eyeScale"), etirement("eyeAspect"), rotation("eyeRotate")] }
    ] },
    { id: "nez", nom: Tr("miimaker.nez"), pages: [{ nom: Tr("miimaker.forme"), type: "grille", champ: "noseType", cadre: "nez", normaliser: NORM.nose }, { nom: Tr("miimaker.position"), type: "reglages", reglages: [hauteur("noseY"), taille("noseScale")] }] },
    { id: "bouche", nom: Tr("miimaker.bouche"), pages: [
      { nom: Tr("miimaker.forme"), type: "grille", champ: "mouthType", cadre: "bouche", normaliser: NORM.mouth },
      { nom: Tr("miimaker.couleur"), type: "nuancier", champ: "mouthColor", palette: "levres", cadre: "bouche" },
      { nom: Tr("miimaker.position"), type: "reglages", reglages: [hauteur("mouthY"), taille("mouthScale"), etirement("mouthAspect")] }
    ] },
    { id: "pilosite", nom: Tr("miimaker.pilosite"), pages: [
      { nom: Tr("miimaker.moustache"), type: "grille", champ: "mustacheType", cadre: "moustache", normaliser: NORM.mustache },
      { nom: Tr("miimaker.barbe"), type: "grille", champ: "beardType", cadre: "barbe" },
      { nom: Tr("miimaker.couleur"), type: "nuancier", champ: "beardColor", palette: "cheveux", cadre: "barbe" },
      { nom: Tr("miimaker.position"), type: "reglages", reglages: [hauteur("mustacheY"), taille("mustacheScale")] }
    ] },
    { id: "lunettes", nom: Tr("miimaker.lunettes"), pages: [
      { nom: Tr("miimaker.monture"), type: "grille", champ: "glassType", cadre: "lunettes", normaliser: NORM.glass },
      { nom: Tr("miimaker.couleur"), type: "nuancier", champ: "glassColor", palette: "lunettes", cadre: "lunettes" },
      { nom: Tr("miimaker.position"), type: "reglages", reglages: [hauteur("glassY"), taille("glassScale")] }
    ] },
    { id: "grain", nom: Tr("miimaker.grain_beaute"), pages: [{ nom: Tr("miimaker.grain"), type: "grille", champ: "moleType", cadre: "visage" }, { nom: Tr("miimaker.position"), type: "reglages", reglages: [hauteur("moleY"), R("moleX", Tr("miimaker.gauche_droite"), "gauche", "droite"), taille("moleScale")] }] }
  ];
  const SORTES = [["chapeau", Tr("miimaker.chapeaux"), "visage"], ["visage", Tr("miimaker.visage"), "visage"], ["haut", Tr("miimaker.hauts"), "corps"], ["accessoire", Tr("miimaker.accessoires"), "corps"], ["bas", Tr("miimaker.bas"), "corps"]];
  let garde = [];
  const installerTenue = (l) => {
    garde = l;
    const i = CATS.findIndex((c) => c.id === "tenue");
    if (i >= 0) CATS.splice(i, 1);
    const pages = SORTES.filter(([k]) => l.some((a) => a.categorie === k)).map(([k, nom, vue2]) => ({ nom, type: "tenue", sorte: k, vue: vue2 }));
    if (pages.length) CATS.push({ id: "tenue", nom: Tr("miimaker.tenue"), vue: "corps", pages });
    if (ed && ecran === "editeur") {
      if (ed.cat >= CATS.length) choisirCat(0);
      poserOnglets();
    }
  };
  const CADRES = {
    icone: [125, 95, 760, ""],
    tete: [150, 125, 710, ""],
    chapeau: [40, -40, 920, ""],
    visage: [235, 330, 540, "cheveux"],
    sourcils: [345, 285, 320, "cheveux nez lunettes"],
    yeux: [350, 345, 310, "cheveux nez lunettes"],
    nez: [390, 470, 230, "cheveux lunettes"],
    bouche: [380, 588, 250, "cheveux nez barbe lunettes"],
    moustache: [350, 545, 310, "cheveux lunettes"],
    barbe: [235, 445, 540, "cheveux lunettes"],
    lunettes: [235, 300, 540, "cheveux"]
  };
  const MASQUES = { cheveux: ["SHAPE_HAIR", "SHAPE_CAP"], nez: ["SHAPE_NOSE", "SHAPE_NOSELINE"], lunettes: ["SHAPE_GLASS"], barbe: ["SHAPE_BEARD"] };
  const svg = (d, plein) => `<svg viewBox="0 0 24 24" ${plein ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${d}</svg>`;
  const TETE = '<path d="M12 3c-4.4 0-7 3.4-7 8 0 5 3.2 10 7 10s7-5 7-10c0-4.6-2.6-8-7-8z"/>';
  const ICONES = {
    profil: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2.4"/><path d="M5.6 17c.8-1.9 2-2.8 3.4-2.8s2.6.9 3.4 2.8M14.5 10h4M14.5 14h3"/>'),
    visage: svg(TETE + '<circle cx="9.3" cy="11.5" r=".9" fill="currentColor"/><circle cx="14.7" cy="11.5" r=".9" fill="currentColor"/><path d="M10 16c1.2.8 2.8.8 4 0"/>'),
    coiffure: svg('<path d="M5.5 14c-.6-6 2.4-10 6.5-10s7.1 4 6.5 10"/><path d="M5.5 14c2.4-1.2 3.7-3.4 4.2-5.6 1.6 2.4 4.6 4.4 8.8 5.6"/><path d="M6.4 14.5c.7 3.8 3 6.5 5.6 6.5s4.9-2.7 5.6-6.5"/>'),
    sourcils: svg('<path d="M3.5 10.5c1.8-2.2 4.4-2.6 6.5-1.4M14 9.1c2.1-1.2 4.7-.8 6.5 1.4"/><circle cx="7" cy="15" r="1.2" fill="currentColor"/><circle cx="17" cy="15" r="1.2" fill="currentColor"/>'),
    yeux: svg('<path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
    nez: svg('<path d="M12.5 4c-1 4-3.6 8.4-3.6 11.4 0 1.8 1.4 3 3.2 3 1.2 0 2.3-.5 3-1.3"/>'),
    bouche: svg('<path d="M4 10c2.5 1.3 5 1.8 8 1.8s5.5-.5 8-1.8c-.8 4.6-4 7.2-8 7.2s-7.2-2.6-8-7.2z"/>'),
    pilosite: svg('<path d="M12 10.5c-1.6-2.4-5-2.8-7.4-.9-1.1.9-1.6 2.4-1.2 3.7.6-1.3 2-1.8 3.2-1.4 1.8.6 3.4 1.2 5.4.2 2 1 3.6.4 5.4-.2 1.2-.4 2.6.1 3.2 1.4.4-1.3-.1-2.8-1.2-3.7-2.4-1.9-5.8-1.5-7.4.9z"/>'),
    lunettes: svg('<circle cx="7" cy="13" r="3.6"/><circle cx="17" cy="13" r="3.6"/><path d="M10.6 12.6c.9-.7 1.9-.7 2.8 0M3.4 12.4 2 9M20.6 12.4 22 9"/>'),
    grain: svg(TETE + '<circle cx="15" cy="15" r="1.5" fill="currentColor"/>'),
    tenue: svg('<path d="M5 15.2c0-4.6 3.1-8.4 7-8.4s7 3.8 7 8.4"/><path d="M2.6 15.4h18.8c-.5 1.7-2 2.6-3.8 2.6H6.4c-1.8 0-3.3-.9-3.8-2.6z"/><path d="M12 6.8V5"/><path d="M8.5 12.5h7"/>'),
    zero: svg(TETE + '<path d="M12 8.6v6.8M8.6 12h6.8"/>'),
    sosies: svg('<circle cx="7" cy="7.5" r="3.3"/><circle cx="17" cy="7.5" r="3.3"/><circle cx="7" cy="17.5" r="3.3"/><circle cx="17" cy="17.5" r="3.3"/>'),
    hasard: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="8.6" cy="8.6" r="1.4" fill="currentColor"/><circle cx="15.4" cy="8.6" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="8.6" cy="15.4" r="1.4" fill="currentColor"/><circle cx="15.4" cy="15.4" r="1.4" fill="currentColor"/>'),
    zoom: svg('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M8 10.5h5M10.5 8v5"/>'),
    dezoom: svg('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M8 10.5h5"/>'),
    moi: svg('<path d="M12 3.5l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.2l-5 2.7 1-5.6-4.1-3.9 5.6-.7z"/>', true),
    inverser: svg('<path d="M4 8h14l-3-3M20 16H6l3 3"/>'),
    haut: svg('<path d="M12 5.5l7.5 11h-15z"/>', true),
    bas: svg('<path d="M12 18.5l-7.5-11h15z"/>', true),
    gauche: svg('<path d="M5.5 12l11-7.5v15z"/>', true),
    droite: svg('<path d="M18.5 12l-11 7.5v-15z"/>', true),
    rapprocher: svg('<path d="M2.5 6.5l7 5.5-7 5.5zM21.5 6.5l-7 5.5 7 5.5z"/>', true),
    ecarter: svg('<path d="M9.5 6.5l-7 5.5 7 5.5zM14.5 6.5l7 5.5-7 5.5z"/>', true),
    plus: svg('<path d="M5 12h14M12 5v14"/>'),
    moins: svg('<path d="M5 12h14"/>'),
    tournerG: svg('<path d="M8 7.5a7 7 0 1 1-2.3 7"/><path d="M8.5 3v5h-5"/>'),
    tournerD: svg('<path d="M16 7.5a7 7 0 1 0 2.3 7"/><path d="M15.5 3v5h5"/>'),
    aplatir: svg('<path d="M3 12h18M6.5 8L3 12l3.5 4M17.5 8L21 12l-3.5 4"/>'),
    etirer: svg('<path d="M12 3v18M8 6.5L12 3l4 3.5M8 17.5l4 3.5 4-3.5"/>'),
    petit: svg('<circle cx="12" cy="11" r="2.2"/><path d="M9.5 20v-3.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5V20"/>'),
    grand: svg('<circle cx="12" cy="5.5" r="2.6"/><path d="M8.5 21v-9c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5v9"/>'),
    mince: svg('<circle cx="12" cy="6" r="2.4"/><path d="M10.5 21v-9.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V21"/>'),
    fort: svg('<circle cx="12" cy="6" r="2.4"/><path d="M7 21v-8c0-1.8 2.2-3 5-3s5 1.2 5 3v8"/>')
  };
  const CSS = `
    #pcv-miimaker { position: fixed; inset: ${u(98)} 0 0 0; z-index: 8700; overflow: hidden; user-select: none; -webkit-user-select: none;
      background: var(--pcv-fond-profil, var(--pcv-fond-page, #f3f5f3)); color: var(--pcv-texte, #2f3a4a); font-family: var(--pcv-police, Nunito, sans-serif); font-weight: 700; }
    #pcv-miimaker *, #pcv-miimaker *::before { box-sizing: border-box; }
    #pcv-miimaker button { all: unset; box-sizing: border-box; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    #pcv-miimaker [hidden] { display: none !important; }
    #pcv-miimaker svg { width: 100%; height: 100%; display: block; }
    #pcv-miimaker .verre { background: var(--pcv-verre, #fff); box-shadow: var(--pcv-reflet, inset 0 2px 0 #fff), var(--pcv-ombre, 0 8px 22px rgba(60,85,120,.16)); }
    
    #pcv-miimaker.clavier .mm-focus { z-index: 2; box-shadow: 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(8)} var(--pcv-cyan-plein, #2fb8ff), 0 0 ${u(22)} ${u(4)} color-mix(in srgb, var(--pcv-cyan-plein) 45%, transparent) !important; }
    
    #pcv-miimaker .scene { position: absolute; left: 0; top: ${u(70)}; width: ${u(590)}; height: ${u(570)}; touch-action: none; }
    #pcv-miimaker .scene::before { content: ""; position: absolute; left: 12%; right: 12%; top: 6%; bottom: 4%; border-radius: 50%;
      background: radial-gradient(closest-side, color-mix(in srgb, var(--pcv-carte) 95%, transparent), color-mix(in srgb, var(--pcv-carte) 55%, transparent) 55%, transparent); }
    #pcv-miimaker .scene canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
    #pcv-miimaker[data-ecran="sosies"] .scene, #pcv-miimaker[data-ecran="absent"] .scene { visibility: hidden; }
    #pcv-miimaker .plaque { position: absolute; left: 50%; bottom: ${u(4)}; transform: translateX(-50%); display: flex; align-items: center; gap: ${u(10)};
      padding: ${u(7)} ${u(20)}; border-radius: ${u(22)}; font-size: ${u(19)}; font-weight: 900; white-space: nowrap; }
    #pcv-miimaker .plaque em { font-style: normal; font-size: ${u(13)}; color: var(--pcv-sur-accent); background: #d23a2a; padding: ${u(3)} ${u(10)}; border-radius: ${u(12)}; }
    #pcv-miimaker .plaque:empty { display: none; }
    #pcv-miimaker .bulle-scene { position: absolute; left: 50%; top: ${u(10)}; transform: translateX(-50%); max-width: ${u(420)}; padding: ${u(12)} ${u(20)};
      border-radius: ${u(22)}; font-size: ${u(17)}; text-align: center; animation: mmBulle .4s cubic-bezier(.3,1.6,.5,1) both; }
    #pcv-miimaker .bulle-scene::after { content: ""; position: absolute; left: 50%; bottom: ${u(-9)}; width: ${u(18)}; height: ${u(18)}; transform: translateX(-50%) rotate(45deg); background: var(--pcv-creux); }
    #pcv-miimaker .rond { position: absolute; width: ${u(58)}; height: ${u(58)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    #pcv-miimaker .rond > i, #pcv-miimaker .onglet > i, #pcv-miimaker .carte > i { display: flex; align-items: center; justify-content: center; border-radius: 50%;
      background: var(--pcv-pastille, #fff); box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); color: var(--pcv-texte2); }
    #pcv-miimaker .rond > i { width: ${u(42)}; height: ${u(42)}; padding: ${u(9)}; }
    #pcv-miimaker .rond.zoom { left: ${u(30)}; bottom: ${u(78)}; }
    #pcv-miimaker .titre { position: absolute; left: ${u(32)}; top: ${u(16)}; font-size: ${u(28)}; font-weight: 900; color: var(--pcv-cyan-plein, #2fb8ff);
      text-shadow: 0 1px 0 rgb(var(--pcv-halo-rgb) / .7); white-space: nowrap; max-width: ${u(540)}; overflow: hidden; text-overflow: ellipsis; }
    #pcv-miimaker .titre small { color: var(--pcv-texte2, #6b7788); font-size: ${u(16)}; margin-left: ${u(10)}; text-shadow: none; }
    
    #pcv-miimaker .onglets { position: absolute; left: ${u(604)}; right: ${u(28)}; top: ${u(12)}; height: ${u(64)}; display: flex; justify-content: space-between; align-items: center; }
    #pcv-miimaker .onglet { position: relative; width: ${u(56)}; height: ${u(56)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform .15s; }
    #pcv-miimaker .onglet > i { width: ${u(42)}; height: ${u(42)}; padding: ${u(9)}; }
    #pcv-miimaker .onglet.actif { background: var(--pcv-cyan, linear-gradient(180deg, #5fd0ff, #1a9ae6)); transform: scale(1.1);
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 ${u(8)} ${u(18)} color-mix(in srgb, var(--pcv-cyan-plein) 40%, transparent); }
    #pcv-miimaker .onglet.actif > i { color: var(--pcv-cyan-plein, #2fb8ff); }
    #pcv-miimaker .onglet:active, #pcv-miimaker .rond:active, #pcv-miimaker .pas:active { transform: scale(.92); }
    
    #pcv-miimaker .onglet::after { content: attr(data-nom); position: absolute; top: calc(100% + ${u(8)}); left: 50%; transform: translateX(-50%); z-index: 6; pointer-events: none;
      padding: ${u(4)} ${u(12)}; border-radius: ${u(14)}; background: var(--pcv-bulle); color: var(--pcv-sur-accent); font-size: ${u(14)}; font-weight: 900; white-space: nowrap; opacity: 0; transition: opacity .15s; }
    #pcv-miimaker.clavier .onglet.mm-focus::after, #pcv-miimaker .onglet:hover::after { opacity: 1; }
    
    #pcv-miimaker .panneau { position: absolute; left: ${u(604)}; right: ${u(28)}; top: ${u(86)}; bottom: ${u(78)}; border-radius: ${u(30)}; padding: ${u(16)} ${u(20)} ${u(18)};
      display: flex; flex-direction: column; gap: ${u(14)}; }
    #pcv-miimaker .tete-panneau { display: flex; align-items: center; gap: ${u(12)}; min-height: ${u(44)}; }
    #pcv-miimaker .tete-panneau h2 { margin: 0; font-size: ${u(22)}; font-weight: 900; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #pcv-miimaker .pilule { display: flex; gap: ${u(4)}; padding: ${u(4)}; border-radius: ${u(24)}; background: color-mix(in srgb, var(--pcv-creux) 12%, transparent); box-shadow: inset 0 1px 3px rgba(0,0,0,.08); }
    #pcv-miimaker .pilule button { padding: ${u(8)} ${u(16)}; border-radius: ${u(20)}; font-size: ${u(15)}; font-weight: 800; white-space: nowrap; }
    #pcv-miimaker .pilule button.actif { background: var(--pcv-bulle); color: var(--pcv-sur-accent); }
    #pcv-miimaker .contenu { position: relative; flex: 1; min-height: 0; }
    #pcv-miimaker .defile { position: absolute; inset: 0; overflow-y: auto; scrollbar-width: none; padding: ${u(8)}; margin: ${u(-8)}; }
    #pcv-miimaker .defile::-webkit-scrollbar { display: none; }
    #pcv-miimaker .grille { display: grid; grid-template-columns: repeat(var(--col, 6), 1fr); gap: ${u(12)}; }
    #pcv-miimaker .choix { position: relative; aspect-ratio: 1; border-radius: ${u(18)}; background: var(--pcv-pastille, #fff);
      box-shadow: inset 0 ${u(-4)} 0 color-mix(in srgb, var(--pcv-creux) 14%, transparent), 0 0 0 1px var(--pcv-bord), 0 ${u(4)} ${u(10)} rgb(from var(--pcv-ombre-c) r g b / .1); transition: transform .12s; }
    #pcv-miimaker .choix canvas { position: absolute; inset: 4%; width: 92%; height: 92%; opacity: 0; transition: opacity .2s; }
    #pcv-miimaker .choix.pret canvas { opacity: 1; }
    #pcv-miimaker .choix:not(.pret)::after { content: ""; position: absolute; inset: 34%; border-radius: 50%; border: ${u(4)} solid color-mix(in srgb, var(--pcv-creux) 25%, transparent); border-top-color: var(--pcv-cyan-plein, #2fb8ff); animation: mmTourne .8s linear infinite; }
    #pcv-miimaker .choix.actuel { background: color-mix(in srgb, var(--pcv-cyan-plein) 13%, var(--pcv-carte)); box-shadow: inset 0 0 0 ${u(4)} var(--pcv-cyan-plein, #2fb8ff), 0 ${u(4)} ${u(10)} color-mix(in srgb, var(--pcv-cyan-plein) 25%, transparent); }
    #pcv-miimaker .choix.actuel::before { content: "\u2713"; position: absolute; right: ${u(5)}; top: ${u(4)}; width: ${u(22)}; height: ${u(22)}; border-radius: 50%; z-index: 1;
      display: flex; align-items: center; justify-content: center; background: var(--pcv-cyan-plein, #2fb8ff); color: var(--pcv-sur-accent); font-size: ${u(13)}; font-weight: 900; }
    #pcv-miimaker .choix .etiquette { position: absolute; left: 4%; right: 4%; bottom: 4%; z-index: 1; text-align: center; font-size: ${u(13)}; font-weight: 900; line-height: 1.1;
      color: var(--pcv-texte, #2f3a4a); text-shadow: 0 1px 0 rgb(var(--pcv-halo-rgb) / 1), 0 0 ${u(4)} rgb(var(--pcv-halo-rgb) / 1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; }
    #pcv-miimaker .choix.article canvas { inset: 3% 8% 16%; width: 84%; height: 81%; }
    #pcv-miimaker .choix .aucun { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--pcv-texte2, #6b7788); font-size: ${u(14)}; }
    #pcv-miimaker .choix:hover { transform: translateY(${u(-2)}); }
    #pcv-miimaker .options { display: flex; gap: ${u(10)}; margin-bottom: ${u(12)}; }
    #pcv-miimaker .option { display: flex; align-items: center; gap: ${u(8)}; padding: ${u(7)} ${u(16)} ${u(7)} ${u(8)}; border-radius: ${u(22)}; font-size: ${u(15)}; }
    #pcv-miimaker .option i { width: ${u(30)}; height: ${u(30)}; padding: ${u(5)}; border-radius: 50%; background: var(--pcv-creux); color: var(--pcv-texte2); }
    #pcv-miimaker .option.on i { background: var(--pcv-cyan-plein, #2fb8ff); color: var(--pcv-sur-accent); }
    #pcv-miimaker .compte { position: absolute; right: 0; bottom: ${u(-14)}; font-size: ${u(13)}; color: var(--pcv-texte2, #6b7788); }
    
    #pcv-miimaker .nuancier { display: flex; flex-wrap: wrap; gap: ${u(18)}; padding: ${u(10)} ${u(4)}; }
    #pcv-miimaker .teinte { position: relative; width: ${u(78)}; height: ${u(78)}; border-radius: 50%; padding: ${u(8)}; transition: transform .12s; }
    #pcv-miimaker .teinte i { display: block; width: 100%; height: 100%; border-radius: 50%; box-shadow: inset 0 ${u(-5)} ${u(8)} rgba(0,0,0,.22), 0 2px 4px rgba(0,0,0,.18);
      background: radial-gradient(circle at 34% 28%, rgba(255,255,255,.65), rgba(255,255,255,0) 42%), var(--k); }
    #pcv-miimaker .teinte.actuel { transform: scale(1.08); box-shadow: inset 0 3px 1px #fff, 0 0 0 ${u(4)} var(--pcv-cyan-plein, #2fb8ff), 0 ${u(6)} ${u(14)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-miimaker .teinte.actuel::after { content: "\u2713"; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--pcv-sur-accent); font-size: ${u(26)}; font-weight: 900; text-shadow: 0 1px 3px rgba(0,0,0,.5); }
    
    #pcv-miimaker .reglages { display: flex; flex-direction: column; gap: ${u(12)}; padding-top: ${u(4)}; }
    #pcv-miimaker .reglage { display: grid; grid-template-columns: ${u(170)} ${u(60)} 1fr ${u(60)}; align-items: center; gap: ${u(14)}; height: ${u(70)};
      padding: 0 ${u(14)}; border-radius: ${u(22)}; background: color-mix(in srgb, var(--pcv-carte) 50%, transparent); box-shadow: inset 0 0 0 1px var(--pcv-bord); }
    #pcv-miimaker .reglage .nom, #pcv-miimaker .glissiere .nom, #pcv-miimaker .ligne > span { font-size: ${u(18)}; font-weight: 900; }
    #pcv-miimaker .pas { width: ${u(58)}; height: ${u(58)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform .1s; }
    #pcv-miimaker .pas > i { width: ${u(42)}; height: ${u(42)}; padding: ${u(10)}; border-radius: 50%; background: var(--pcv-pastille, #fff); color: var(--pcv-texte2);
      box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); display: flex; }
    #pcv-miimaker .jauge { position: relative; height: ${u(14)}; border-radius: ${u(7)}; background: color-mix(in srgb, var(--pcv-creux) 18%, transparent); box-shadow: inset 0 1px 2px rgba(0,0,0,.12); touch-action: none; cursor: pointer; }
    #pcv-miimaker .jauge::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: calc(var(--p) * 100%); border-radius: inherit; background: var(--pcv-cyan, linear-gradient(180deg, #5fd0ff, #1a9ae6)); }
    #pcv-miimaker .jauge u { position: absolute; top: ${u(-6)}; bottom: ${u(-6)}; left: calc(var(--p0) * 100%); width: ${u(3)}; margin-left: ${u(-1.5)}; background: rgba(60,80,110,.35); border-radius: 2px; }
    #pcv-miimaker .jauge b { position: absolute; top: 50%; left: calc(var(--p) * 100%); width: ${u(30)}; height: ${u(30)}; margin: ${u(-15)} 0 0 ${u(-15)}; border-radius: 50%;
      background: var(--pcv-pastille, #fff); box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 0 0 ${u(4)} var(--pcv-cyan-plein, #2fb8ff), 0 ${u(3)} ${u(8)} rgba(0,0,0,.2); transition: left .12s; }
    
    #pcv-miimaker .fiche { display: flex; flex-direction: column; gap: ${u(14)}; padding-top: ${u(4)}; }
    #pcv-miimaker .ligne { display: grid; grid-template-columns: ${u(170)} 1fr; align-items: center; gap: ${u(14)}; min-height: ${u(70)}; padding: 0 ${u(14)};
      border-radius: ${u(22)}; background: color-mix(in srgb, var(--pcv-carte) 50%, transparent); box-shadow: inset 0 0 0 1px var(--pcv-bord); }
    #pcv-miimaker .ligne input { all: unset; box-sizing: border-box; height: ${u(50)}; padding: 0 ${u(20)}; border-radius: ${u(25)}; font: inherit; font-size: ${u(22)}; font-weight: 900;
      background: var(--pcv-carte); box-shadow: inset 0 2px 4px rgba(0,0,0,.1), 0 0 0 1px var(--pcv-bord); color: inherit; cursor: text; user-select: text; -webkit-user-select: text; }
    #pcv-miimaker .ligne input::placeholder { color: var(--pcv-texte3); }
    #pcv-miimaker .duo { display: flex; gap: ${u(10)}; flex-wrap: wrap; }
    #pcv-miimaker .duo button { padding: ${u(11)} ${u(22)}; border-radius: ${u(24)}; font-size: ${u(17)}; font-weight: 900; background: var(--pcv-pastille, #fff);
      box-shadow: inset 0 ${u(-3)} 0 rgba(0,0,0,.07), 0 0 0 1px var(--pcv-bord), 0 ${u(3)} ${u(6)} rgb(from var(--pcv-ombre-c) r g b / .1); }
    #pcv-miimaker .duo button.actif { background: var(--pcv-cyan, linear-gradient(180deg, #5fd0ff, #1a9ae6)); color: var(--pcv-sur-accent);
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), 0 ${u(4)} ${u(10)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-miimaker .date { display: flex; align-items: center; gap: ${u(6)}; }
    #pcv-miimaker .date b { min-width: ${u(120)}; text-align: center; font-size: ${u(19)}; }
    #pcv-miimaker .date b.jour { min-width: ${u(48)}; }
    #pcv-miimaker .date .pas { width: ${u(48)}; height: ${u(48)}; }
    #pcv-miimaker .date .pas > i { width: ${u(38)}; height: ${u(38)}; padding: ${u(11)}; }
    #pcv-miimaker .interrupteur { display: flex; align-items: center; gap: ${u(10)}; padding: ${u(6)} ${u(18)} ${u(6)} ${u(6)}; border-radius: ${u(26)}; font-size: ${u(16)};
      background: var(--pcv-pastille, #fff); box-shadow: 0 0 0 1px var(--pcv-bord), 0 ${u(3)} ${u(6)} rgb(from var(--pcv-ombre-c) r g b / .1); justify-self: start; }
    #pcv-miimaker .interrupteur i { width: ${u(38)}; height: ${u(38)}; padding: ${u(8)}; border-radius: 50%; background: var(--pcv-creux); color: var(--pcv-texte3); }
    #pcv-miimaker .interrupteur.on i { background: #d23a2a; color: var(--pcv-sur-accent); }
    #pcv-miimaker .glissiere { display: grid; grid-template-columns: ${u(170)} ${u(40)} 1fr ${u(40)}; align-items: center; gap: ${u(16)}; height: ${u(96)}; padding: 0 ${u(18)};
      border-radius: ${u(22)}; background: color-mix(in srgb, var(--pcv-carte) 50%, transparent); box-shadow: inset 0 0 0 1px var(--pcv-bord); }
    #pcv-miimaker .glissiere > i { color: var(--pcv-texte2); }
    
    #pcv-miimaker .creer { display: grid; grid-template-columns: repeat(3, 1fr); gap: ${u(14)}; }
    #pcv-miimaker .carte { position: relative; display: flex; flex-direction: column; align-items: center; gap: ${u(6)}; padding: ${u(16)} ${u(10)} ${u(14)}; border-radius: ${u(24)}; text-align: center;
      background: var(--pcv-pastille, #fff); box-shadow: inset 0 ${u(-5)} 0 color-mix(in srgb, var(--pcv-creux) 12%, transparent), 0 0 0 1px var(--pcv-bord), 0 ${u(6)} ${u(16)} rgb(from var(--pcv-ombre-c) r g b / .12); transition: transform .12s; }
    #pcv-miimaker .carte:hover { transform: translateY(${u(-3)}); }
    #pcv-miimaker .carte > i { width: ${u(64)}; height: ${u(64)}; padding: ${u(14)}; color: var(--pcv-sur-accent); background: var(--k); box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.5), inset 0 -6px 10px -6px rgba(0,0,0,.25), 0 ${u(5)} ${u(12)} rgba(0,0,0,.18); }
    #pcv-miimaker .carte b { font-size: ${u(18)}; font-weight: 900; }
    #pcv-miimaker .carte small { font-size: ${u(13)}; color: var(--pcv-texte2, #6b7788); font-weight: 700; }
    #pcv-miimaker .tes-mii { display: flex; flex-direction: column; flex: 1; min-height: 0; gap: ${u(10)}; }
    #pcv-miimaker .tes-mii h3 { margin: ${u(4)} 0 0; font-size: ${u(19)}; font-weight: 900; }
    #pcv-miimaker .tes-mii h3 { display: flex; align-items: baseline; }
    #pcv-miimaker .etagere h4 { grid-column: 1 / -1; margin: ${u(10)} 0 0; font-size: ${u(17)}; font-weight: 900; }
    #pcv-miimaker .etagere h4 small { display: block; color: var(--pcv-texte2, #6b7788); font-size: ${u(13)}; font-weight: 700; }
    #pcv-miimaker .tes-mii h3 .outils { margin-left: auto; display: flex; gap: ${u(8)}; }
    #pcv-miimaker .tes-mii h3 .outils button { padding: ${u(6)} ${u(14)}; border-radius: ${u(18)}; font-size: ${u(14)}; font-weight: 900; color: var(--pcv-texte, #2f3a4a);
      background: var(--pcv-verre, #fff); box-shadow: var(--pcv-reflet, none), 0 ${u(3)} ${u(8)} rgb(from var(--pcv-ombre-c) r g b / .14); }
    #pcv-miimaker .tes-mii h3 small { color: var(--pcv-texte2, #6b7788); font-size: ${u(15)}; margin-left: ${u(6)}; }
    #pcv-miimaker .mii { position: relative; display: flex; flex-direction: column; align-items: center; gap: ${u(4)}; padding: ${u(6)} ${u(4)} ${u(8)}; border-radius: ${u(20)}; transition: transform .12s; }
    #pcv-miimaker .mii .ic { position: relative; width: 100%; aspect-ratio: 1; border-radius: ${u(18)}; background: var(--pcv-pastille, #fff);
      box-shadow: inset 0 ${u(-4)} 0 color-mix(in srgb, var(--pcv-creux) 14%, transparent), 0 0 0 1px var(--pcv-bord), 0 ${u(4)} ${u(10)} rgb(from var(--pcv-ombre-c) r g b / .1); }
    #pcv-miimaker .mii canvas { position: absolute; inset: 3%; width: 94%; height: 94%; opacity: 0; transition: opacity .2s; }
    #pcv-miimaker .mii.pret canvas { opacity: 1; }
    #pcv-miimaker .mii:not(.pret) .ic::after { content: ""; position: absolute; inset: 34%; border-radius: 50%; border: ${u(4)} solid color-mix(in srgb, var(--pcv-creux) 25%, transparent); border-top-color: var(--pcv-cyan-plein, #2fb8ff); animation: mmTourne .8s linear infinite; }
    #pcv-miimaker .mii > b { font-size: ${u(14)}; font-weight: 900; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #pcv-miimaker .mii em { position: absolute; top: 0; right: 0; width: ${u(28)}; height: ${u(28)}; padding: ${u(5)}; border-radius: 50%; background: #d23a2a; color: var(--pcv-sur-accent); box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere); }
    
    #pcv-miimaker .mii.choisi .ic { background: color-mix(in srgb, var(--pcv-cyan-plein) 22%, var(--pcv-carte)); box-shadow: 0 ${u(4)} ${u(10)} color-mix(in srgb, var(--pcv-cyan-plein) 25%, transparent); }
    #pcv-miimaker .mii.choisi .ic::before { content: "\u2713"; position: absolute; left: ${u(6)}; bottom: ${u(6)}; width: ${u(26)}; height: ${u(26)}; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-size: ${u(15)}; font-weight: 900; color: var(--pcv-sur-accent);
      background: var(--pcv-cyan-plein, #2fb8ff); box-shadow: 0 0 0 ${u(3)} var(--pcv-carte, #fff); }
    #pcv-miimaker .vide { grid-column: 1 / -1; padding: ${u(26)}; text-align: center; color: var(--pcv-texte2, #6b7788); font-size: ${u(16)}; border-radius: ${u(20)}; border: ${u(3)} dashed var(--pcv-filet); }
    #pcv-miimaker .actions-mii { position: absolute; z-index: 5; display: flex; gap: ${u(8)}; padding: ${u(8)}; border-radius: ${u(26)}; animation: mmBulle .25s cubic-bezier(.3,1.6,.5,1) both; }
    #pcv-miimaker .actions-mii button, #pcv-miimaker .dialogue .choix-d button { padding: ${u(10)} ${u(18)}; border-radius: ${u(22)}; font-size: ${u(16)}; font-weight: 900; white-space: nowrap;
      background: var(--pcv-pastille, #fff); box-shadow: inset 0 ${u(-3)} 0 rgba(0,0,0,.07), 0 0 0 1px var(--pcv-bord); }
    #pcv-miimaker .actions-mii button.rouge { color: var(--pcv-rouge-texte); }
    
    #pcv-miimaker .tes-mii h3 .outils button.cyan, #pcv-miimaker .cherche .ok, #pcv-miimaker .fiche-cat .ok { background: var(--pcv-cyan, linear-gradient(180deg, #5fd0ff, #1a9ae6)); color: var(--pcv-sur-accent);
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), 0 ${u(4)} ${u(10)} color-mix(in srgb, var(--pcv-cyan-plein) 30%, transparent); }
    #pcv-miimaker .source-cat { margin-left: auto; font-size: ${u(14)}; color: var(--pcv-texte2, #6b7788); }
    #pcv-miimaker .cherche { display: flex; gap: ${u(10)}; }
    #pcv-miimaker .cherche input { all: unset; box-sizing: border-box; flex: 1; height: ${u(50)}; padding: 0 ${u(20)}; border-radius: ${u(25)}; font: inherit; font-size: ${u(19)}; font-weight: 800;
      background: var(--pcv-carte); box-shadow: inset 0 2px 4px rgba(0,0,0,.1), 0 0 0 1px var(--pcv-bord); color: var(--pcv-texte); cursor: text; user-select: text; -webkit-user-select: text; }
    #pcv-miimaker .cherche input::placeholder { color: var(--pcv-texte3); }
    #pcv-miimaker .cherche .ok, #pcv-miimaker .fiche-cat .ok { padding: 0 ${u(22)}; height: ${u(50)}; display: flex; align-items: center; border-radius: ${u(25)}; font-size: ${u(17)}; font-weight: 900; white-space: nowrap; }
    #pcv-miimaker .fiche-cat { display: flex; align-items: center; gap: ${u(14)}; padding: ${u(10)} ${u(12)} ${u(10)} ${u(18)}; border-radius: ${u(22)}; background: color-mix(in srgb, var(--pcv-carte) 55%, transparent); box-shadow: inset 0 0 0 1px var(--pcv-bord); }
    #pcv-miimaker .fiche-cat .txt { flex: 1; min-width: 0; }
    #pcv-miimaker .fiche-cat b { display: block; font-size: ${u(20)}; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #pcv-miimaker .fiche-cat small { display: block; font-size: ${u(14)}; color: var(--pcv-texte2, #6b7788); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #pcv-miimaker .fiche-cat p { margin: ${u(4)} 0 0; font-size: ${u(13)}; line-height: 1.3; color: var(--pcv-texte2, #6b7788); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    #pcv-miimaker .catalogue .ic img { position: absolute; inset: 4%; width: 92%; height: 92%; object-fit: contain; opacity: 0; transition: opacity .2s; }
    #pcv-miimaker .catalogue .mii.pret img { opacity: 1; }
    #pcv-miimaker .catalogue .mii > small { margin-top: ${u(-4)}; font-size: ${u(12)}; color: var(--pcv-texte2, #6b7788); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #pcv-miimaker .catalogue .plus { grid-column: 1 / -1; justify-self: center; padding: ${u(10)} ${u(28)}; border-radius: ${u(22)}; font-size: ${u(16)}; font-weight: 900;
      background: var(--pcv-pastille, #fff); box-shadow: inset 0 ${u(-3)} 0 rgba(0,0,0,.07), 0 0 0 1px var(--pcv-bord); }
    
    #pcv-miimaker .sosies { position: absolute; left: 0; right: 0; top: 0; bottom: ${u(70)}; display: flex; flex-direction: column; align-items: center; }
    #pcv-miimaker .sosies .filtres { position: absolute; right: ${u(32)}; top: ${u(14)}; display: flex; gap: ${u(14)}; }
    #pcv-miimaker .grille-sosies { margin-top: ${u(84)}; display: grid; grid-template-columns: repeat(6, ${u(156)}); gap: ${u(14)} ${u(18)}; }
    #pcv-miimaker .grille-sosies .mii { padding: 0; }
    #pcv-miimaker .grille-sosies .mii:hover, #pcv-miimaker .etagere .mii:hover { transform: translateY(${u(-3)}); }
    
    #pcv-miimaker .bas { position: absolute; left: ${u(28)}; right: ${u(28)}; bottom: ${u(14)}; height: ${u(48)}; display: flex; align-items: center; gap: ${u(12)}; }
    #pcv-miimaker .bas .espace { flex: 1; }
    #pcv-miimaker .indice { display: flex; align-items: center; gap: ${u(8)}; padding: ${u(6)} ${u(16)} ${u(6)} ${u(6)}; border-radius: ${u(22)}; font-size: ${u(16)}; font-weight: 800; white-space: nowrap; }
    #pcv-miimaker .indice u { text-decoration: none; display: flex; align-items: center; justify-content: center; min-width: ${u(30)}; height: ${u(30)}; padding: 0 ${u(6)}; border-radius: ${u(15)};
      background: radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--k) 70%, #fff), var(--k)); color: var(--pcv-sur-accent); font-size: ${u(13)}; font-weight: 900; }
    #pcv-miimaker .indice.fort { background: var(--pcv-cyan, linear-gradient(180deg, #5fd0ff, #1a9ae6)); color: var(--pcv-sur-accent); box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), 0 ${u(5)} ${u(14)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    
    #pcv-miimaker .voile { position: absolute; inset: 0; z-index: 20; background: color-mix(in srgb, var(--pcv-carte) 55%, transparent); display: flex; align-items: center; justify-content: center; }
    #pcv-miimaker .dialogue { min-width: ${u(420)}; max-width: ${u(640)}; padding: ${u(26)} ${u(30)} ${u(22)}; border-radius: ${u(30)}; text-align: center; animation: mmBulle .3s cubic-bezier(.3,1.6,.5,1) both; }
    #pcv-miimaker .dialogue p { margin: 0 0 ${u(20)}; font-size: ${u(21)}; font-weight: 900; line-height: 1.35; }
    #pcv-miimaker .dialogue .choix-d { display: flex; gap: ${u(12)}; justify-content: center; flex-wrap: wrap; }
    #pcv-miimaker .annonce { position: absolute; left: ${u(295)}; top: ${u(70)}; z-index: 25; transform: translateX(-50%); padding: ${u(10)} ${u(24)}; border-radius: ${u(22)};
      background: #ff8a1f; color: var(--pcv-sur-accent); font-size: ${u(17)}; font-weight: 900; box-shadow: 0 ${u(6)} ${u(16)} rgba(0,0,0,.18); animation: mmBulleC .3s cubic-bezier(.3,1.6,.5,1) both; }
    #pcv-miimaker .absent { position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%); width: ${u(640)}; padding: ${u(30)} ${u(36)}; border-radius: ${u(30)}; text-align: center; }
    #pcv-miimaker .absent b { display: block; font-size: ${u(24)}; font-weight: 900; margin-bottom: ${u(12)}; }
    #pcv-miimaker .absent p { margin: 0; font-size: ${u(17)}; color: var(--pcv-texte2, #6b7788); line-height: 1.45; }
    @keyframes mmBulle { from { opacity: 0; transform: translateY(${u(8)}) scale(.9); } }
    @keyframes mmTourne { to { transform: rotate(1turn); } }
    #pcv-miimaker .bulle-scene { animation-name: mmBulleC; }
    @keyframes mmBulleC { from { opacity: 0; transform: translateX(-50%) translateY(${u(8)}) scale(.9); } }`;
  let racine = null, ouvert = false, fini = null, dernier = null;
  let ecran = "accueil", focus = null, dialogue = null, actionsDe = null, choisiAccueil = null;
  let ed = null;
  let sosies = { sexe: 0, age: null, ci: [] };
  const $ = (s) => racine.querySelector(s);
  const fins = [];
  let rendu = null, scene = null, socle = null, ombre = null, camera = null, vivant = null, aRefaire = null;
  const camVise = new (T ? T.Vector3 : Object)();
  let vueCorps = false, vueForcee = null;
  const regard = { yaw: 0, pitch: 0 }, pointeur = { x: 0, y: 0, t: -1e9 };
  let yawCorps = 0, yawVise = 0, lacheA = 0, glisse = null;
  const anim = { reaction: null, finReaction: 0, cligne: 0, prochainCligne: 2, saut: -1, sautH: 0 };
  let horloge = 0, boucle = 0, avant = 0;
  const mesures = { refonte: 0, vignette: 0 };
  const creerRendu = () => {
    const cv = $(".scene canvas");
    rendu = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    rendu.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    rendu.outputColorSpace = T.LinearSRGBColorSpace;
    rendu.setClearColor(0, 0);
    moteur.ffl.setRenderer(rendu);
    scene = new T.Scene();
    socle = new T.Group();
    scene.add(socle);
    const t = document.createElement("canvas");
    t.width = t.height = 128;
    const g = t.getContext("2d"), d = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    d.addColorStop(0, "rgba(40,60,90,.36)");
    d.addColorStop(0.6, "rgba(40,60,90,.14)");
    d.addColorStop(1, "rgba(40,60,90,0)");
    g.fillStyle = d;
    g.fillRect(0, 0, 128, 128);
    ombre = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: new T.CanvasTexture(t), transparent: true, depthWrite: false }));
    ombre.rotation.x = -Math.PI / 2;
    ombre.renderOrder = -1;
    scene.add(ombre);
    camera = new T.PerspectiveCamera(15, 1, 1, 3e3);
    const taille2 = () => {
      const r = cv.getBoundingClientRect();
      if (r.width && r.height) {
        rendu.setSize(r.width, r.height, false);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
      }
    };
    const ro = new ResizeObserver(taille2);
    ro.observe(cv);
    fins.push(() => ro.disconnect());
    taille2();
  };
  const RECUL_VISAGE = 1.45;
  const EXPRESSIONS = () => [X().NORMAL, X().BLINK, X().SMILE, X().SMILE_OPEN_MOUTH, X().SURPRISE_OPEN_MOUTH];
  const montrer = (ci, o = {}) => {
    const A = moteur.aides, F = moteur.F, ancien = vivant;
    const cm = tete(ci, { resolution: 512, allExpressionFlag: F.makeExpressionFlag(EXPRESSIONS()), modelFlag: F.FFLModelFlag.NORMAL });
    cm.meshes.traverse((x) => {
      x.frustumCulled = false;
    });
    const v = { ci: ci.slice(), cm, moi: !!o.moi, sexe: cm.charInfo.gender, expr: X().NORMAL, t: ancien?.t ?? Math.random() * 2 };
    v.cleCorps = ["gender", "favoriteColor", "height", "build"].map((c) => lireC(ci, c)).join() + (v.moi ? "m" : "");
    if (moteur.corps && ancien?.corps && ancien.cleCorps === v.cleCorps) {
      A.findSkinnedMeshWithBone(ancien.modele, ancien.corps.scaleDesc.head)?.skeleton?.detach?.(ancien.cm.meshes);
      devetir(ancien);
      ancien.cm.meshes.removeFromParent();
      ancien.cm.dispose();
      A.attachHeadToBody(ancien.corps, cm.meshes);
      for (const k of ["corps", "modele", "mixer", "os", "attente", "fin", "action", "camCorps", "camVisage", "enFinale"]) v[k] = ancien[k];
      v.t = ancien.t;
      vivant = v;
      vetirVivant();
      return;
    }
    if (moteur.corps) {
      const g = moteur.corps[v.sexe] || moteur.corps[0], modele = A.clone(g.scene), mixer = new T.AnimationMixer(modele);
      const corps = { model: modele, animations: g.animations, scaleDesc: A.detectModelDesc(modele) };
      A.prepareBodyForCharModel(corps, moteur.Mat, cm.favoriteColor, cm.getBodyScale(), pantalon(v.moi));
      A.attachHeadToBody(corps, cm.meshes);
      modele.traverse((x) => {
        x.frustumCulled = false;
      });
      const clip = (n) => g.animations.find((a) => a.name === n);
      Object.assign(v, { corps, modele, mixer, os: modele.getObjectByName(corps.scaleDesc.head), attente: clip("Wait"), fin: clip("Finish") });
      if (v.attente) {
        v.action = mixer.clipAction(v.attente).play();
        mixer.setTime(0);
      }
      modele.updateMatrixWorld(true);
      v.camCorps = A.getWholeBodyCamera(1, lireC(ci, "height")).position.clone();
      const cf = A.getFaceCamera();
      A.adjustCameraForBodyHead(cf, corps);
      v.camVisage = cf.position.clone();
      v.camVisage.z *= RECUL_VISAGE;
      mixer.setTime(v.t % (v.attente?.duration || 1));
      socle.add(modele);
      const s = cm.getBodyScale();
      ombre.scale.set(9 * s.x / 0.83, 7 * s.x / 0.83, 1);
      ombre.visible = true;
    } else {
      const ci0 = F.ModelIcon.getCamera(), k = Math.tan(ci0.fov * Math.PI / 360) / Math.tan(15 * Math.PI / 360);
      v.camVisage = new T.Vector3(0, ci0.position.y, ci0.position.z * k);
      v.camCorps = new T.Vector3(0, ci0.position.y, ci0.position.z * k * 1.25);
      socle.add(cm.meshes);
      ombre.visible = false;
    }
    if (ancien) {
      socle.remove(ancien.modele || ancien.cm.meshes);
      ancien.mixer?.stopAllAction();
      devetir(ancien);
      ancien.cm.dispose();
    } else camera.position.copy(vueCorps ? v.camCorps : v.camVisage);
    vivant = v;
    vetirVivant();
  };
  let tenueAccueil = [];
  const devetir = (v) => {
    try {
      window.__pcvGardeRobe?.deshabiller?.({ tete: v.cm, modele: v.modele || null });
    } catch (e) {
    }
  };
  const vetirVivant = () => {
    const G = window.__pcvGardeRobe, v = vivant;
    if (!G || !v) return;
    const ids = ed ? ed.tenue : tenueAccueil;
    if (!ids.length && !garde.length) return;
    G.habiller({ tete: v.cm, modele: v.modele || null }, ids).catch((e) => {
      if (v === vivant) console.warn("Mii Maker : tenue", e);
    });
  };
  const reagir = (quoi = "joie", bond = true) => {
    if (!vivant) return;
    const E = { joie: X().SMILE_OPEN_MOUTH, sourire: X().SMILE, surprise: X().SURPRISE_OPEN_MOUTH }[quoi] ?? X().SMILE;
    anim.reaction = E;
    anim.finReaction = horloge + (quoi === "sourire" ? 0.7 : 1.1);
    if (bond) {
      anim.saut = horloge;
      anim.sautH = quoi === "surprise" ? 0.9 : 0.55;
    }
  };
  const finale = () => {
    if (!vivant?.fin) return;
    const a = vivant.mixer.clipAction(vivant.fin);
    a.reset().setLoop(T.LoopOnce, 1);
    a.clampWhenFinished = true;
    a.crossFadeFrom(vivant.action, 0.2, false).play();
    vivant.enFinale = horloge + vivant.fin.duration + 0.6;
    reagir("joie", false);
    anim.finReaction = vivant.enFinale;
  };
  const qA = T ? new T.Quaternion() : null, qB = T ? new T.Quaternion() : null, qC = T ? new T.Quaternion() : null, qD = T ? new T.Quaternion() : null, eul = T ? new T.Euler() : null, vA = T ? new T.Vector3() : null;
  const vivre = (dt) => {
    const v = vivant;
    if (!v) return;
    if (v.mixer) {
      v.mixer.update(dt);
      v.t += dt;
      if (v.enFinale && horloge > v.enFinale) {
        v.enFinale = 0;
        const a = v.mixer.clipAction(v.attente);
        a.reset().play();
        v.mixer.clipAction(v.fin).crossFadeTo(a, 0.35, false);
      }
    }
    if (horloge > anim.prochainCligne) {
      anim.cligne = horloge + 0.13;
      anim.prochainCligne = horloge + 2 + Math.random() * 4;
    }
    let e = horloge < anim.finReaction && anim.reaction != null ? anim.reaction : X().NORMAL;
    if (horloge < anim.cligne && (e === X().NORMAL || e === X().SMILE)) e = X().BLINK;
    if (e !== v.expr) {
      try {
        v.cm.setExpression(e);
        v.expr = e;
      } catch (err) {
        v.expr = e;
      }
    }
    let cx = null, cy = null;
    if (performance.now() - pointeur.t < 4e3) {
      cx = pointeur.x;
      cy = pointeur.y;
    } else if (focus && racine.classList.contains("clavier")) {
      const r = focus.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
    }
    let yawC = 0, pitchC = 0;
    if (cx != null) {
      camera.updateMatrixWorld();
      const rc = rendu.domElement.getBoundingClientRect(), p = (v.os || v.cm.meshes).getWorldPosition(vA).project(camera);
      const hx = rc.left + (p.x + 1) / 2 * rc.width, hy = rc.top + (1 - p.y) / 2 * rc.height - rc.height * 0.04;
      yawC = borne(borne((cx - hx) / rc.width * 1.3, -0.5, 0.5) - yawCorps, -0.5, 0.5);
      pitchC = borne((cy - hy) / rc.height * 1.1, -0.28, 0.34);
    }
    if (!Number.isFinite(yawC) || !Number.isFinite(pitchC)) yawC = pitchC = 0;
    const k = 1 - Math.exp(-dt * 7);
    regard.yaw += (yawC - regard.yaw) * k;
    regard.pitch += (pitchC - regard.pitch) * k;
    if (!glisse && horloge - lacheA > 2.5) yawVise = 0;
    yawCorps += (yawVise - yawCorps) * (1 - Math.exp(-dt * (glisse ? 20 : 3)));
    socle.rotation.y = yawCorps;
    const ts = (horloge - anim.saut) / 0.42;
    socle.position.y = ts >= 0 && ts < 1 ? Math.sin(Math.PI * ts) * anim.sautH : 0;
    eul.set(regard.pitch, regard.yaw, 0);
    qA.setFromEuler(eul);
    if (v.os) {
      v.os.parent.getWorldQuaternion(qB);
      qC.copy(socle.quaternion).multiply(qA).multiply(qD.copy(socle.quaternion).invert());
      v.os.quaternion.premultiply(qD.copy(qB).invert().multiply(qC).multiply(qB));
    } else v.cm.meshes.quaternion.copy(qA);
  };
  const dessiner = (dt) => {
    if (!vivant || ecran === "sosies" || ecran === "absent") return;
    const corps = vueForcee ?? vueCorps, cible = corps ? vivant.camCorps : vivant.camVisage;
    camVise.copy(cible);
    if (camera.aspect < 1) camVise.z /= Math.max(0.6, camera.aspect);
    camera.position.lerp(camVise, 1 - Math.exp(-dt * 6));
    camera.rotation.set(0, 0, 0);
    rendu.setRenderTarget(null);
    rendu.setClearColor(0, 0);
    rendu.clear();
    rendu.render(scene, camera);
  };
  const cache = /* @__PURE__ */ new Map();
  let file = [], rt = null, tampon = null, toileTmp = null;
  const empreinte = (ci) => {
    let h = 2166136261;
    for (let i = 0; i < ci.length; i++) h = Math.imul(h ^ ci[i], 16777619);
    return (h >>> 0).toString(36);
  };
  const peindre = (el, src) => {
    const c = el.querySelector("canvas");
    if (!c) return;
    if (c.width !== src.width) {
      c.width = src.width;
      c.height = src.height;
    }
    const g = c.getContext("2d");
    g.clearRect(0, 0, c.width, c.height);
    g.drawImage(src, 0, 0);
    el.classList.add("pret");
  };
  const demander = (el, ci, cadre) => {
    const cle = cadre + ":" + empreinte(ci);
    if (el.dataset.v === cle && el.classList.contains("pret")) return;
    el.dataset.v = cle;
    const c = cache.get(cle);
    if (c) {
      peindre(el, c);
      return;
    }
    if (!file.some((j) => j.cle === cle)) file.push({ cle, ci: ci.slice(), cadre });
  };
  const teteVignette = (ci, px) => {
    const F = moteur.F;
    return tete(ci, { resolution: px > 140 ? 256 : 128, allExpressionFlag: F.makeExpressionFlag([X().NORMAL]), modelFlag: F.FFLModelFlag.NORMAL });
  };
  const cliche = (cm, cadre, px) => {
    const F = moteur.F, [x, y, cote] = CADRES[cadre], s = new T.Scene();
    s.add(cm.meshes);
    const cam = F.ModelIcon.getCamera();
    cam.setViewOffset(1e3, 1e3, x, y, cote, cote);
    cam.updateProjectionMatrix();
    const n = Math.min(512, px * 2);
    if (!rt || rt.width !== n) {
      rt?.dispose();
      rt = new T.WebGLRenderTarget(n, n);
      tampon = new Uint8Array(n * n * 4);
      toileTmp = document.createElement("canvas");
      toileTmp.width = toileTmp.height = n;
    }
    rendu.setRenderTarget(rt);
    rendu.setClearColor(0, 0);
    rendu.clear();
    rendu.render(s, cam);
    rendu.readRenderTargetPixels(rt, 0, 0, n, n, tampon);
    rendu.setRenderTarget(null);
    toileTmp.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(tampon), n, n), 0, 0);
    return reduire(toileTmp, px, true);
  };
  const reduire = (src, px, retourner) => {
    const sortie = document.createElement("canvas");
    sortie.width = sortie.height = px;
    const g = sortie.getContext("2d");
    g.imageSmoothingQuality = "high";
    if (retourner) g.setTransform(1, 0, 0, -1, 0, px);
    g.drawImage(src, 0, 0, src.width, src.height, 0, 0, px, px);
    return sortie;
  };
  const rendreVignette = (j, px) => {
    const F = moteur.F, cm = teteVignette(j.ci, px), masques = CADRES[j.cadre][3];
    const caches = new Set(masques.split(" ").filter(Boolean).flatMap((m) => MASQUES[m].map((t) => F.FFLModulateType[t])));
    if (caches.size) cm.meshes.traverse((o) => {
      if (caches.has(o.geometry?.userData?.modulateType)) o.visible = false;
    });
    try {
      return cliche(cm, j.cadre, px);
    } finally {
      cm.dispose();
    }
  };
  const fileTenue = [];
  let tenueEnCours = false;
  const demanderTenue = (el, id, sorte) => {
    const cle = `t:${sorte}:${id}:${empreinte(ed.ci)}`;
    if (el.dataset.v === cle && el.classList.contains("pret")) return;
    el.dataset.v = cle;
    const c = cache.get(cle);
    if (c) {
      peindre(el, c);
      return;
    }
    if (!fileTenue.some((j) => j.cle === cle)) fileTenue.push({ cle, id, sorte, ci: ed.ci.slice() });
    pomperTenue();
  };
  const rendreTenue = async (j, px) => {
    const G = window.__pcvGardeRobe;
    if (j.sorte === "chapeau" || j.sorte === "visage") {
      const cm = teteVignette(j.ci, px);
      try {
        if (j.id) await G.habiller({ tete: cm }, [j.id]);
        return rendu ? cliche(cm, j.sorte === "chapeau" ? "chapeau" : "tete", px) : null;
      } finally {
        devetir({ cm });
        cm.dispose();
      }
    }
    if (!j.id || !rendu) return null;
    const teinte = new T.Color().setHex(parseInt(couleurFavorite(lireC(j.ci, "favoriteColor")).slice(1), 16), T.LinearSRGBColorSpace);
    const c = await G.apercu(j.id, { rendu, teinte, materiau: moteur.Mat, taille: Math.min(512, px * 2) });
    return rendu ? reduire(c, px, false) : null;
  };
  const pomperTenue = async () => {
    if (tenueEnCours) return;
    tenueEnCours = true;
    try {
      while (fileTenue.length && ouvert && rendu) {
        const j = fileTenue.shift(), els = racine.querySelectorAll(`[data-v="${j.cle}"]`);
        if (!els.length) continue;
        const px = Math.round(borne(els[0].getBoundingClientRect().width * Math.min(2, window.devicePixelRatio || 1), 48, 256));
        let c = null;
        try {
          c = await rendreTenue(j, px);
        } catch (e) {
          console.warn("Mii Maker : vignette de tenue", e);
        }
        if (!ouvert) return;
        if (c) {
          cache.set(j.cle, c);
          if (cache.size > 600) cache.delete(cache.keys().next().value);
        }
        els.forEach((el) => {
          if (el.dataset.v !== j.cle) return;
          if (c) peindre(el, c);
          else el.classList.add("pret");
        });
        await new Promise((r) => requestAnimationFrame(r));
      }
    } finally {
      tenueEnCours = false;
    }
  };
  const pomper = (budget) => {
    const t0 = performance.now();
    while (file.length && performance.now() - t0 < budget) {
      const j = file.shift(), els = racine.querySelectorAll(`[data-v="${j.cle}"]`);
      if (!els.length) continue;
      const px = Math.round(borne(els[0].getBoundingClientRect().width * Math.min(2, window.devicePixelRatio || 1), 48, 256));
      let c;
      const t1 = performance.now();
      try {
        c = rendreVignette(j, px);
      } catch (e) {
        console.warn("Mii Maker : vignette", e);
        continue;
      }
      mesures.vignette = Math.round(performance.now() - t1);
      cache.set(j.cle, c);
      if (cache.size > 600) cache.delete(cache.keys().next().value);
      els.forEach((el) => {
        if (el.dataset.v === j.cle) peindre(el, c);
      });
    }
  };
  const visibles = (defile, faire) => {
    const r = defile.getBoundingClientRect(), m = r.height * 0.35;
    defile.querySelectorAll("[data-i]").forEach((el) => {
      const e = el.getBoundingClientRect();
      if (e.bottom > r.top - m && e.top < r.bottom + m) faire(el, +el.dataset.i);
    });
  };
  const indices = (l) => {
    $(".bas").innerHTML = l.map(([k, nom, fort]) => k === "|" ? '<span class="espace"></span>' : `<button class="indice verre${fort ? " fort" : ""}" data-k="${k}"><u></u>${nom}</button>`).join("");
    $(".bas").querySelectorAll("[data-k]").forEach((b) => {
      const ks = b.dataset.k.split(",");
      b.querySelector("u").innerHTML = ks.map((k) => touche(+k)[2] ?? echapper(touche(+k)[0])).join(" ");
      b.querySelector("u").style.setProperty("--k", touche(+ks[0])[1]);
      b.onclick = () => {
        racine.classList.remove("clavier");
        appuyer(+ks[ks.length - 1]);
      };
    });
  };
  const plaque = (texte, moi) => {
    const p = $(".plaque");
    p.innerHTML = texte ? `${echapper(texte)}${moi ? "<em>C'est toi</em>" : ""}` : "";
    p.classList.toggle("verre", !!texte);
  };
  const bulleScene = (texte) => {
    const b = $(".bulle-scene");
    b.hidden = !texte;
    if (texte) {
      b.textContent = texte;
      b.style.animation = "none";
      void b.offsetWidth;
      b.style.animation = "";
    }
  };
  const annoncer = (texte) => {
    $(".annonce")?.remove();
    const a = document.createElement("div");
    a.className = "annonce";
    a.textContent = texte;
    racine.appendChild(a);
    setTimeout(() => a.remove(), 2600);
  };
  const poserFocus = (el) => {
    focus?.classList.remove("mm-focus");
    focus = el || null;
    if (!focus) return;
    focus.classList.add("mm-focus");
    const d = focus.closest(".defile");
    if (d) {
      const r = focus.getBoundingClientRect(), rd = d.getBoundingClientRect();
      if (r.top < rd.top + 6) d.scrollBy({ top: r.top - rd.top - 10, behavior: "smooth" });
      else if (r.bottom > rd.bottom - 6) d.scrollBy({ top: r.bottom - rd.bottom + 10, behavior: "smooth" });
    }
  };
  const changerEcran = (e) => {
    ecran = e;
    racine.dataset.ecran = e;
    actionsDe = null;
    $(".actions-mii")?.remove();
    racine.querySelectorAll("[data-pour]").forEach((el) => {
      el.hidden = !el.dataset.pour.split(" ").includes(e);
    });
    poserFocus(null);
  };
  const ouvrirAccueil = (choix) => {
    changerEcran("accueil");
    $(".titre").innerHTML = "Mii Maker";
    bulleScene("");
    const l = liste(), aut = autres || [], tout = [...l, ...aut];
    choisiAccueil = choix ?? (tout.some((m) => m.id === choisiAccueil) ? choisiAccueil : l.find((m) => m.moi)?.id ?? l[0]?.id ?? null);
    const tuile = (m, i) => `<button class="mii${m.id === choisiAccueil ? " choisi" : ""}${m.autre ? " autre" : ""}" data-nav data-i="${i}" data-id="${echapper(m.id)}"><span class="ic"><canvas></canvas>${m.moi ? `<em>${ICONES.moi}</em>` : ""}</span><b>${echapper(m.nom || Tr("miimaker.sans_nom"))}</b></button>`;
    $(".panneau").innerHTML = `<div class="creer">
        <button class="carte" data-nav data-act="zero" style="--k:#2fb8ff"><i>${ICONES.zero}</i><b>${Tr("miimaker.partir_zero")}</b><small>${Tr("miimaker.partir_zero_aide")}</small></button>
        <button class="carte" data-nav data-act="sosies" style="--k:#3cc47c"><i>${ICONES.sosies}</i><b>${Tr("miimaker.choisir_sosie")}</b><small>${Tr("miimaker.choisir_sosie_aide")}</small></button>
        <button class="carte" data-nav data-act="hasard" style="--k:#ff9a2e"><i>${ICONES.hasard}</i><b>${Tr("miimaker.mii_hasard")}</b><small>${Tr("miimaker.mii_hasard_aide")}</small></button></div>
      <div class="tes-mii"><h3>${Tr("miimaker.tes_mii")}<small>${l.length ? Tr("miimaker.n_sur_place", { n: l.length }) : ""}</small><span class="outils"><button data-nav data-catalogue class="cyan">${Tr("miimaker.catalogue")}</button><button data-nav data-fichier="importer">${Tr("steamu.importer")}</button>${l.length ? `<button data-nav data-fichier="sauver">${Tr("miimaker.sauvegarder")}</button>` : ""}</span></h3><div class="contenu"><div class="defile"><div class="grille etagere">
        ${l.length ? l.map(tuile).join("") : `<div class="vide">${Tr("miimaker.aucun_mii")}</div>`}
        ${aut.length ? `<h4>${Tr("miimaker.autres_mii")}<small>${Tr("miimaker.autres_mii_aide")}</small></h4>${aut.map((m, i) => tuile(m, l.length + i)).join("")}` : ""}
      </div></div></div></div>`;
    racine.querySelectorAll(".carte").forEach((b) => {
      b.onclick = () => {
        son("choisir");
        ({ zero: demanderZero, sosies: () => ouvrirSosies(), hasard: () => ouvrirEditeur(hasard(), { reaction: "surprise" }) })[b.dataset.act]();
      };
    });
    const defile = $(".tes-mii .defile"), parId2 = new Map(tout.map((m) => [m.id, m]));
    const icones = () => visibles(defile, (el) => {
      const m = parId2.get(el.dataset.id);
      const ci = m && (m.ci || depuisStore(m.donnees));
      if (ci) demander(el, ci, "icone");
    });
    defile.onscroll = icones;
    icones();
    racine.querySelectorAll("[data-fichier]").forEach((b) => {
      b.onclick = () => {
        son("choisir");
        b.dataset.fichier === "sauver" ? sauver() : importer();
      };
    });
    racine.querySelectorAll(".etagere .mii").forEach((b) => {
      b.onclick = () => {
        if (choisiAccueil === b.dataset.id && actionsDe !== b) montrerActions(b);
        else choisirAccueil(b.dataset.id, b);
      };
    });
    montrerAccueil(tout);
    if (!autres) chargerAutres().then((x) => {
      if (x.length && ouvert && ecran === "accueil" && !actionsDe && !dialogue) {
        const f = focus?.dataset.id;
        ouvrirAccueil(choisiAccueil);
        if (f) poserFocus([...racine.querySelectorAll(".etagere .mii")].find((x2) => x2.dataset.id === f) || focus);
      }
    });
    racine.querySelector("[data-catalogue]").onclick = () => {
      son("choisir");
      ouvrirCatalogue();
    };
    indices([[2, Tr("miimaker.fermer")], ["|"], [6, Tr("miimaker.catalogue")], [1, Tr("miimaker.choisir")]]);
    poserFocus(racine.querySelector(".etagere .mii.choisi") || racine.querySelector(".carte"));
  };
  const montrerAccueil = (l = [...liste(), ...autres || []]) => {
    const m = l.find((x) => x.id === choisiAccueil);
    const ci = m && (m.ci?.slice() || depuisStore(m.donnees));
    tenueAccueil = ci ? window.__pcvGardeRobe?.tenue?.(m.id) || [] : [];
    if (ci) {
      montrer(ci, { moi: m.moi });
      plaque(m.nom || Tr("miimaker.sans_nom"), m.moi);
      bulleScene("");
    } else {
      montrer(hasard());
      plaque("");
      bulleScene(l.length ? "" : Tr("miimaker.bonjour_cree"));
    }
    vueCorps = true;
    vueForcee = null;
    reagir("sourire");
  };
  const choisirAccueil = (id, b) => {
    choisiAccueil = id;
    racine.querySelectorAll(".etagere .mii").forEach((x) => x.classList.toggle("choisi", x.dataset.id === id));
    son("bouge");
    montrerAccueil();
    if (b) montrerActions(b);
  };
  const montrerActions = (b) => {
    $(".actions-mii")?.remove();
    actionsDe = b;
    const m = [...liste(), ...autres || []].find((x) => x.id === b.dataset.id);
    if (!m) return;
    const a = document.createElement("div");
    a.className = "actions-mii verre";
    a.innerHTML = m.autre ? `<button data-nav data-a="adopter">${Tr("miimaker.ajouter_tes_mii")}</button>` : `<button data-nav data-a="modifier">${Tr("miimaker.modifier")}</button><button data-nav data-a="moi">${m.moi ? Tr("miimaker.nest_plus_moi") : Tr("miimaker.cest_moi")}</button><button data-nav data-a="copie">${Tr("miimaker.dupliquer")}</button><button data-nav data-a="suppr" class="rouge">${Tr("miimaker.supprimer")}</button>`;
    racine.appendChild(a);
    const r = b.getBoundingClientRect(), rr = racine.getBoundingClientRect();
    a.style.left = borne(r.left - rr.left + r.width / 2 - a.offsetWidth / 2, 8, rr.width - a.offsetWidth - 8) + "px";
    a.style.top = (r.top - rr.top - a.offsetHeight - 6 < 70 ? r.bottom - rr.top + 6 : r.top - rr.top - a.offsetHeight - 6) + "px";
    a.querySelectorAll("button").forEach((x) => {
      x.onclick = async () => {
        const quoi = x.dataset.a;
        fermerActions();
        if (quoi === "adopter" && m.ci) {
          son("choisir");
          const ci = m.ci.slice();
          nommer(ci, m.nom);
          ouvrirEditeur(ci, { reaction: "joie" });
          annoncer(Tr("miimaker.retouche_ajouter"));
        } else if (quoi === "adopter") {
          try {
            const n = ajouterImporte(m.donnees.slice(), "fichier");
            son("gagne");
            ouvrirAccueil(n);
            reagir("joie");
            annoncer(Tr("miimaker.rejoint_tes_mii", { nom: m.nom }));
          } catch (e) {
            son("rate");
            annoncer(Tr("miimaker.ajout_impossible_mii"));
            console.warn("Mii Maker :", e);
          }
        } else if (quoi === "modifier") {
          const ci = depuisStore(m.donnees);
          if (ci) {
            son("choisir");
            ouvrirEditeur(ci, { id: m.id, moi: m.moi, nouveau: false });
          }
        } else if (quoi === "moi") {
          choisirMoi(m.moi ? null : m.id);
          son(m.moi ? "retour" : "gagne");
          ouvrirAccueil(m.id);
          if (!m.moi) {
            reagir("joie");
            annoncer(Tr("miimaker.cest_toi", { nom: m.nom || Tr("miimaker.ce_mii") }));
          }
        } else if (quoi === "copie") {
          const n = dupliquer(m.id);
          if (n) {
            son("gagne");
            ouvrirAccueil(n);
            annoncer(Tr("miimaker.copie_ajoutee", { nom: m.nom || Tr("miimaker.ce_mii_minuscule") }));
          } else son("rate");
        } else if (quoi === "suppr") {
          const r2 = await demanderChoix(Tr("miimaker.supprimer_confirme", { nom: m.nom || Tr("miimaker.ce_mii_minuscule") }), [Tr("miimaker.supprimer"), Tr("miimaker.garder")]);
          if (r2 === 0) {
            supprimer(m.id);
            son("retour");
            ouvrirAccueil(null);
          }
        }
      };
    });
    poserFocus(a.querySelector("button"));
  };
  const fermerActions = () => {
    const b = actionsDe;
    $(".actions-mii")?.remove();
    actionsDe = null;
    if (b?.isConnected) poserFocus(b);
  };
  const sauver = () => {
    try {
      const n = exporter();
      annoncer(Tr("miimaker.n_mii_enregistres", { n, s: n > 1 ? "s" : "" }));
    } catch (e) {
      annoncer(Tr("miimaker.sauvegarde_impossible"));
      son("rate");
    }
  };
  const importer = () => {
    const f = document.createElement("input");
    f.type = "file";
    f.accept = ".json,.cfsd,.ffsd,.bin,.mii,image/*";
    f.multiple = true;
    f.onchange = async () => {
      let ok = [], ko = 0;
      for (const x of f.files) {
        try {
          ok = ok.concat(await importerFichier(x));
        } catch (e) {
          ko++;
          console.warn("Mii Maker : import", x.name, e);
        }
      }
      if (!ouvert) return;
      if (ok.length) {
        son("gagne");
        ouvrirAccueil(ok[ok.length - 1]);
        reagir("joie");
      } else son("rate");
      annoncer(ok.length ? Tr("miimaker.n_mii_ajoutes", { n: ok.length, s: ok.length > 1 ? "s" : "", refuses: ko ? Tr("miimaker.fichiers_refuses", { n: ko, s: ko > 1 ? "s" : "" }) : "" }) : Tr("miimaker.aucun_mii_reconnu"));
    };
    f.click();
  };
  const demanderZero = async () => {
    const r = await demanderChoix(Tr("miimaker.ton_mii_sera"), [Tr("miimaker.un_garcon"), Tr("miimaker.une_fille")]);
    if (r >= 0) ouvrirEditeur(depart(r), { reaction: "joie" });
  };
  const appelerGreffon = (m, ...a) => {
    try {
      const B = (window.opener || window).DeckyBackend || window.DeckyBackend;
      return B ? B.call("loader/call_plugin_method", window.__pcvGreffon.nom, m, ...a) : Promise.reject(new Error("Decky absent"));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  let jsqrP = null;
  const chargerJsQR = () => window.jsQR ? Promise.resolve() : jsqrP ||= (async () => {
    const t = await appelerGreffon("script_greffon", "jsqr");
    if (typeof t !== "string") throw new Error("lecteur de QR absent du greffon");
    const url = URL.createObjectURL(new Blob([`(function (exports, module, define) {
${t}
}).call(window);`], { type: "text/javascript" }));
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
          ko(new Error("lecteur de QR refus\xE9"));
        };
        document.head.appendChild(s);
      });
    } finally {
      URL.revokeObjectURL(url);
    }
    if (!window.jsQR) throw new Error("lecteur de QR non charg\xE9");
  })().catch((e) => {
    jsqrP = null;
    throw e;
  });
  const cat = { texte: "", page: 0, mii: [], suite: false, attente: false, erreur: "", choisi: null, minis: /* @__PURE__ */ new Map(), decodes: /* @__PURE__ */ new Map() };
  const fileMini = [];
  let miniEnCours = false, demandeCat = 0;
  const parId = (id) => cat.mii.find((m) => m.id === id) || null;
  const credit = (m) => m.auteur ? m.source ? `source : ${m.auteur}` : `par ${m.auteur}` : "auteur inconnu";
  const miiDuCatalogue = async (id) => {
    if (cat.decodes.has(id)) return cat.decodes.get(id);
    const r = await appelerGreffon("infinimii_qr", id);
    if (typeof r !== "string") throw new Error(r?.erreur || "QR introuvable");
    await chargerJsQR();
    if (!window.__pcvMiiQR) throw new Error("mii-qr.js absent");
    const d = await window.__pcvMiiQR.depuisImage(await createImageBitmap(new Blob([deB64(r)], { type: "image/png" })));
    cat.decodes.set(id, d);
    return d;
  };
  const ouvrirCatalogue = () => {
    changerEcran("catalogue");
    $(".titre").innerHTML = "Catalogue<small>Mii de la communaut\xE9 InfiniMii</small>";
    $(".panneau").innerHTML = `<div class="tete-panneau"><div class="pilule"><button data-nav data-retour>Tes Mii</button><button class="actif">Catalogue</button></div>
        <span class="source-cat">infinimii.com</span></div>
      <div class="cherche"><input class="cherche-cat" data-nav maxlength="60" placeholder="Chercher un Mii : Mario, Zelda, Ironman\u2026" value="${echapper(cat.texte)}"><button class="ok" data-nav data-chercher>Chercher</button></div>
      <div class="fiche-cat" hidden></div>
      <div class="contenu"><div class="defile"><div class="grille etagere catalogue" style="--col:5"></div></div></div>`;
    const champ = $(".cherche-cat");
    champ.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        champ.blur();
        chercherCatalogue(champ.value);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        champ.blur();
      }
    };
    champ.onclick = () => clavierSteam(champ);
    $("[data-chercher]").onclick = () => chercherCatalogue(champ.value);
    $("[data-retour]").onclick = () => {
      son("retour");
      ouvrirAccueil();
    };
    $(".catalogue").parentElement.onscroll = vignettesCat;
    remplirCatalogue();
    majFiche();
    indices([[2, "Retour"], ["|"], [3, "Chercher"], [4, "Ajouter"], [1, "Choisir", true]]);
    if (!cat.page && !cat.attente) chercherCatalogue("");
    else if (cat.choisi) montrerCatalogue(cat.choisi);
    else {
      montrer(hasard());
      plaque("");
      bulleScene("Choisis un Mii du catalogue : il viendra ici");
    }
    poserFocus(racine.querySelector(`.catalogue .mii[data-id="${cat.choisi || ""}"]`) || racine.querySelector(".catalogue .mii") || champ);
  };
  const chercherCatalogue = async (texte, suite) => {
    texte = String(texte ?? "").trim().slice(0, 60);
    const n = ++demandeCat, page = suite ? cat.page + 1 : 1;
    if (!suite) {
      cat.texte = texte;
      cat.mii = [];
      cat.page = 0;
      cat.suite = false;
    }
    cat.attente = true;
    cat.erreur = "";
    son("choisir");
    remplirCatalogue();
    let r;
    try {
      r = await appelerGreffon("infinimii_recherche", texte, page);
    } catch (e) {
      r = { erreur: "greffon pas encore red\xE9marr\xE9" };
    }
    if (n !== demandeCat) return;
    cat.attente = false;
    if (!r || r.erreur || !Array.isArray(r.mii)) cat.erreur = r?.erreur || "r\xE9ponse illisible";
    else {
      const vus = new Set(cat.mii.map((m) => m.id));
      cat.mii.push(...r.mii.filter((m) => m && typeof m.id === "string" && !vus.has(m.id)));
      cat.page = page;
      cat.suite = !!r.suite;
    }
    if (!ouvert || ecran !== "catalogue") return;
    const avant2 = focus?.dataset.id;
    remplirCatalogue();
    if (cat.erreur) {
      son("rate");
      annoncer(cat.erreur);
    }
    poserFocus(suite && racine.querySelectorAll(".catalogue .mii")[(page - 1) * 32] || racine.querySelector(`.catalogue .mii[data-id="${avant2 || ""}"]`) || racine.querySelector(".catalogue .mii") || $(".cherche-cat"));
  };
  const remplirCatalogue = () => {
    const G = racine?.querySelector(".catalogue");
    if (!G) return;
    fileMini.length = 0;
    G.innerHTML = cat.mii.map((m, i) => `<button class="mii${m.id === cat.choisi ? " choisi" : ""}" data-nav data-i="${i}" data-id="${echapper(m.id)}"><span class="ic"><img alt=""></span><b>${echapper(m.nom)}</b><small>${echapper(m.auteur || "")}</small></button>`).join("") + (cat.attente ? '<div class="vide">Recherche sur InfiniMii\u2026</div>' : cat.erreur && !cat.mii.length ? `<div class="vide">${echapper(cat.erreur)}</div>` : !cat.mii.length ? `<div class="vide">Aucun Mii trouv\xE9${cat.texte ? ` pour \xAB ${echapper(cat.texte)} \xBB` : ""}.</div>` : cat.suite ? '<button class="plus" data-nav data-plus>Plus de Mii</button>' : "");
    G.querySelectorAll(".mii").forEach((b) => {
      b.onclick = () => {
        poserFocus(b);
        if (cat.choisi === b.dataset.id) ajouterDuCatalogue();
        else choisirCatalogue(b.dataset.id);
      };
    });
    const p = G.querySelector("[data-plus]");
    if (p) p.onclick = () => chercherCatalogue(cat.texte, true);
    vignettesCat();
  };
  const vignettesCat = () => {
    const D = racine?.querySelector(".catalogue")?.parentElement;
    if (!D) return;
    visibles(D, (el) => {
      if (el.classList.contains("pret") || el.dataset.att) return;
      const u2 = cat.minis.get(el.dataset.id);
      if (u2 !== void 0) return poserMini(el, u2);
      el.dataset.att = "1";
      fileMini.push(el.dataset.id);
    });
    pomperMini();
  };
  const poserMini = (el, u2) => {
    const img = el.querySelector("img");
    if (u2) img.src = u2;
    el.classList.add("pret");
  };
  const pomperMini = async () => {
    if (miniEnCours) return;
    miniEnCours = true;
    try {
      while (fileMini.length && ouvert && ecran === "catalogue") {
        const id = fileMini.shift();
        let r = null;
        try {
          r = await appelerGreffon("infinimii_miniature", id);
        } catch (e) {
          r = null;
        }
        const u2 = typeof r === "string" ? "data:image/png;base64," + r : "";
        cat.minis.set(id, u2);
        if (cat.minis.size > 400) cat.minis.delete(cat.minis.keys().next().value);
        racine?.querySelectorAll(".catalogue .mii").forEach((el) => {
          if (el.dataset.id === id) poserMini(el, u2);
        });
      }
    } finally {
      miniEnCours = false;
    }
  };
  const majFiche = () => {
    const F = racine?.querySelector(".fiche-cat");
    if (!F) return;
    const m = parId(cat.choisi);
    F.hidden = !m;
    if (!m) return;
    F.innerHTML = `<div class="txt"><b>${echapper(m.nom)}</b><small>${Tr("miimaker.credit_infinimii", { credit: echapper(credit(m)) })}</small>${m.description ? `<p>${echapper(m.description)}</p>` : ""}</div>
      <button class="ok" data-nav data-ajouter>${Tr("miimaker.ajouter_tes_mii")}</button>`;
    F.querySelector("[data-ajouter]").onclick = () => ajouterDuCatalogue();
  };
  const choisirCatalogue = (id) => {
    cat.choisi = id;
    son("bouge");
    racine.querySelectorAll(".catalogue .mii").forEach((x) => x.classList.toggle("choisi", x.dataset.id === id));
    majFiche();
    montrerCatalogue(id);
  };
  const montrerCatalogue = async (id) => {
    const m = parId(id);
    if (!m) return;
    plaque(m.nom);
    if (!cat.decodes.has(id)) bulleScene(Tr("miimaker.cherche_mii"));
    try {
      const d = await miiDuCatalogue(id);
      if (!ouvert || ecran !== "catalogue" || cat.choisi !== id) return;
      const ci = depuisStore(d);
      if (!ci) throw new Error("refus\xE9 par le moteur des Mii");
      montrer(ci);
      plaque(nomStore(d) || m.nom);
      bulleScene("");
      vueCorps = true;
      vueForcee = null;
      reagir("joie");
    } catch (e) {
      if (!ouvert || cat.choisi !== id) return;
      bulleScene("");
      son("rate");
      annoncer(Tr("miimaker.catalogue_erreur", { nom: m.nom, msg: e.message || Tr("miimaker.illisible") }));
      console.warn("Mii Maker : catalogue", id, e);
    }
  };
  const ajouterDuCatalogue = async () => {
    const m = parId(cat.choisi);
    if (!m) {
      son("bord");
      annoncer(Tr("miimaker.choisis_dabord"));
      return;
    }
    try {
      const d = await miiDuCatalogue(m.id), cle = hex(d.subarray(12, 22));
      const deja = liste().find((x) => hex(x.donnees.subarray(12, 22)) === cle);
      if (deja) {
        son("bord");
        annoncer(Tr("miimaker.deja_dans_tes_mii", { nom: deja.nom || Tr("miimaker.ce_mii") }));
        return;
      }
      ajouterImporte(d.slice(), "infinimii", { site: "InfiniMii", mii: m.id, nom: m.nom, auteur: m.auteur, lien: `https://infinimii.com/mii/${m.id}` });
      if (!ouvert) return;
      son("gagne");
      reagir("joie");
      annoncer(Tr("miimaker.rejoint_tes_mii_credit", { nom: nomStore(d) || m.nom, credit: credit(m) }));
    } catch (e) {
      son("rate");
      annoncer(Tr("miimaker.ajout_impossible", { msg: e.message || Tr("miimaker.erreur") }));
      console.warn("Mii Maker : ajout du catalogue", e);
    }
  };
  const ouvrirSosies = (garder2) => {
    changerEcran("sosies");
    $(".titre").innerHTML = "Choisis un sosie<small>Le plus ressemblant, puis retouche-le</small>";
    if (!garder2 || !sosies.ci.length) sosies.ci = Array.from({ length: 18 }, () => hasard(sosies.sexe, sosies.age ?? void 0));
    const S = $(".sosies");
    S.innerHTML = `<div class="filtres"><div class="duo">${["Gar\xE7ons", "Filles"].map((n, i) => `<button data-nav data-sexe="${i}" class="${sosies.sexe === i ? "actif" : ""}">${n}</button>`).join("")}</div>
      <div class="duo">${["Enfants", "Adultes", "A\xEEn\xE9s"].map((n, i) => `<button data-nav data-age="${i}" class="${sosies.age === i ? "actif" : ""}">${n}</button>`).join("")}</div></div>
      <div class="grille grille-sosies">${sosies.ci.map((_, i) => `<button class="mii" data-nav data-i="${i}"><span class="ic"><canvas></canvas></span></button>`).join("")}</div>`;
    S.querySelectorAll("[data-sexe]").forEach((b) => {
      b.onclick = () => {
        sosies.sexe = +b.dataset.sexe;
        son("choisir");
        ouvrirSosies();
        poserFocus(S.querySelector(`[data-sexe="${b.dataset.sexe}"]`));
      };
    });
    S.querySelectorAll("[data-age]").forEach((b) => {
      b.onclick = () => {
        const a = +b.dataset.age;
        sosies.age = sosies.age === a ? null : a;
        son("choisir");
        ouvrirSosies();
        poserFocus(S.querySelector(`[data-age="${b.dataset.age}"]`));
      };
    });
    S.querySelectorAll(".grille-sosies .mii").forEach((b) => {
      const i = +b.dataset.i;
      demander(b, sosies.ci[i], "icone");
      b.onclick = () => {
        son("choisir");
        ouvrirEditeur(sosies.ci[i].slice(), { reaction: "joie" });
      };
    });
    indices([[2, "Retour"], ["|"], [4, "Autres visages"], [1, "Choisir", true]]);
    if (!focus) poserFocus(S.querySelector(".grille-sosies .mii"));
  };
  const ouvrirEditeur = (ci, o = {}) => {
    ed = { ci, id: o.id ?? null, cat: 0, page: 0, modifie: o.id == null, moi: !!o.moi, tenue: o.id != null ? window.__pcvGardeRobe?.tenue?.(o.id) || [] : [] };
    changerEcran("editeur");
    bulleScene("");
    plaque("");
    poserOnglets();
    montrer(ed.ci, { moi: ed.moi });
    reagir(o.reaction || "sourire");
    choisirCat(o.cat ?? 0, o.page ?? 0);
    indices([["5,6", "Cat\xE9gorie"], [3, "Zoom"], ["|"], [2, "Retour"], [4, "Terminer", true]]);
  };
  const poserOnglets = () => {
    $(".onglets").innerHTML = CATS.map((c, i) => `<button class="onglet verre${ed && i === ed.cat ? " actif" : ""}" data-nav data-cat="${i}" data-nom="${c.nom}"><i>${ICONES[c.id]}</i></button>`).join("");
    racine.querySelectorAll(".onglet").forEach((b) => {
      b.onclick = () => {
        if (+b.dataset.cat !== ed.cat) {
          son("choisir");
          choisirCat(+b.dataset.cat);
        }
      };
    });
  };
  const choisirCat = (i, p = 0) => {
    ed.cat = (i + CATS.length) % CATS.length;
    ed.page = borne(p, 0, CATS[ed.cat].pages.length - 1);
    vueForcee = null;
    vueCorps = CATS[ed.cat].vue === "corps";
    racine.dataset.cat = CATS[ed.cat].id;
    racine.querySelectorAll(".onglet").forEach((b) => b.classList.toggle("actif", +b.dataset.cat === ed.cat));
    construirePage();
    poserFocus(premierDuPanneau());
  };
  const premierDuPanneau = () => $(".panneau .actuel") || $(".panneau .contenu [data-nav]") || $(".panneau [data-nav]");
  const titreEditeur = () => {
    const n = nomDe(ed.ci);
    $(".titre").innerHTML = `${echapper(n || "Nouveau Mii")}${ed.modifie ? "<small>non enregistr\xE9</small>" : ""}`;
  };
  const construirePage = () => {
    const cat2 = CATS[ed.cat], page = cat2.pages[ed.page];
    titreEditeur();
    file = [];
    if (page.vue) {
      vueCorps = page.vue === "corps";
      vueForcee = null;
      majZoom();
    }
    $(".panneau").innerHTML = `<div class="tete-panneau"><h2>${cat2.nom}</h2>${cat2.pages.length > 1 ? `<div class="pilule">${cat2.pages.map((p, i) => `<button data-nav data-page="${i}" class="${i === ed.page ? "actif" : ""}">${p.nom}</button>`).join("")}</div>` : ""}</div><div class="contenu"></div>`;
    racine.querySelectorAll("[data-page]").forEach((b) => {
      b.onclick = () => {
        if (+b.dataset.page !== ed.page) {
          son("choisir");
          ed.page = +b.dataset.page;
          construirePage();
          poserFocus($(`[data-page="${ed.page}"]`));
        }
      };
    });
    const C = $(".panneau .contenu");
    if (page.type === "grille") pageGrille(C, page);
    else if (page.type === "nuancier") pageNuancier(C, page);
    else if (page.type === "reglages") pageReglages(C, page);
    else if (page.type === "profil") pageProfil(C);
    else if (page.type === "silhouette") pageSilhouette(C);
    else if (page.type === "tenue") pageTenue(C, page);
  };
  const pageTenue = (C, page) => {
    const l = garde.filter((a) => a.categorie === page.sorte), seul = page.sorte !== "accessoire";
    C.innerHTML = `<div class="defile"><div class="grille" style="--col:4">${[null, ...l].map((a, i) => `<button class="choix article" data-nav data-i="${i}" data-article="${a ? echapper(a.id) : ""}"><canvas></canvas><span class="etiquette">${a ? echapper(a.nom) : "Aucun"}</span></button>`).join("")}</div></div>`;
    const maj = () => C.querySelectorAll(".choix").forEach((el) => {
      const id = el.dataset.article;
      el.classList.toggle("actuel", id ? ed.tenue.includes(id) : !ed.tenue.some((x) => l.some((a) => a.id === x)));
    });
    const D = C.querySelector(".defile"), remplir = () => visibles(D, (el) => demanderTenue(el, el.dataset.article || null, page.sorte));
    D.onscroll = remplir;
    remplir();
    C.querySelectorAll(".choix").forEach((el) => {
      el.onclick = () => {
        const id = el.dataset.article || null, avant2 = ed.tenue.join();
        const autres2 = ed.tenue.filter((x) => !l.some((a) => a.id === x));
        ed.tenue = !id ? autres2 : seul ? ed.tenue.includes(id) ? autres2 : [...autres2, id] : ed.tenue.includes(id) ? ed.tenue.filter((x) => x !== id) : [...ed.tenue, id];
        if (ed.tenue.join() === avant2) {
          son("bord");
          return;
        }
        ed.modifie = true;
        son("choisir");
        reagir(id && ed.tenue.includes(id) ? "joie" : "sourire");
        vetirVivant();
        maj();
        titreEditeur();
      };
    });
    page.majour = () => {
      maj();
      remplir();
    };
    maj();
  };
  const variante = (page, x) => {
    const ci = ed.ci.slice();
    for (const c of page.normaliser || []) ecrireC(ci, c, DEPART[c]);
    ecrireC(ci, page.champ, x);
    return ci;
  };
  const pageGrille = (C, page) => {
    const [a, b] = plage(page.champ), n = b - a + 1, actuel = lireC(ed.ci, page.champ);
    const opt = page.bascule ? `<div class="options"><button class="option verre${lireC(ed.ci, page.bascule.champ) ? " on" : ""}" data-nav data-bascule><i>${ICONES.inverser}</i>${page.bascule.nom}</button></div>` : "";
    C.innerHTML = `<div class="defile">${opt}<div class="grille">${Array.from({ length: n }, (_, i) => `<button class="choix${a + i === actuel ? " actuel" : ""}" data-nav data-i="${a + i}"><canvas></canvas></button>`).join("")}</div></div>${n > 24 ? `<div class="compte">${n} choix</div>` : ""}`;
    const D = C.querySelector(".defile");
    const remplir = () => visibles(D, (el, x) => demander(el, variante(page, x), page.cadre));
    D.onscroll = remplir;
    remplir();
    C.querySelectorAll(".choix").forEach((el) => {
      el.onclick = () => changer(page.champ, +el.dataset.i);
    });
    const bs = C.querySelector("[data-bascule]");
    if (bs) bs.onclick = () => changer(page.bascule.champ, lireC(ed.ci, page.bascule.champ) ? 0 : 1, { reaction: "surprise" });
    page.majour = () => {
      const v = lireC(ed.ci, page.champ);
      C.querySelectorAll(".choix").forEach((el) => el.classList.toggle("actuel", +el.dataset.i === v));
      bs?.classList.toggle("on", !!lireC(ed.ci, page.bascule.champ));
      remplir();
    };
  };
  const pageNuancier = (C, page) => {
    const [a, b] = plage(page.champ), n = b - a + 1;
    const couleurs = page.champ === "favoriteColor" ? Array.from({ length: n }, (_, i) => moteur.palettes?.[page.palette]?.[i] || couleurFavorite(i)) : moteur.palettes?.[page.palette];
    if (!couleurs) return pageGrille(C, page);
    const actuel = lireC(ed.ci, page.champ);
    C.innerHTML = `<div class="defile"><div class="nuancier">${couleurs.slice(0, n).map((k, i) => `<button class="teinte verre${i === actuel ? " actuel" : ""}" data-nav data-i="${a + i}" style="--k:${k}"><i></i></button>`).join("")}</div></div>`;
    C.querySelectorAll(".teinte").forEach((el) => {
      el.onclick = () => changer(page.champ, +el.dataset.i);
    });
    page.majour = () => {
      const v = lireC(ed.ci, page.champ);
      C.querySelectorAll(".teinte").forEach((el) => el.classList.toggle("actuel", +el.dataset.i === v));
    };
  };
  const proportion = (c, x) => {
    const [a, b] = plage(c);
    return (x - a) / (b - a);
  };
  const pageReglages = (C, page) => {
    C.innerHTML = `<div class="reglages">${page.reglages.map((r) => `<div class="reglage" data-champ="${r.champ}"><span class="nom">${r.nom}</span>
      <button class="pas" data-nav data-d="-1" title="${r.nom}"><i>${ICONES[r.moins]}</i></button><div class="jauge"><u></u><b></b></div><button class="pas" data-nav data-d="1" title="${r.nom}"><i>${ICONES[r.plus]}</i></button></div>`).join("")}</div>`;
    const maj = () => C.querySelectorAll(".reglage").forEach((l) => {
      const c = l.dataset.champ;
      l.style.setProperty("--p", proportion(c, lireC(ed.ci, c)));
      l.style.setProperty("--p0", proportion(c, DEPART[c]));
    });
    C.querySelectorAll(".reglage").forEach((l) => {
      const c = l.dataset.champ;
      l.querySelectorAll(".pas").forEach((p) => {
        repeter(p, () => changer(c, lireC(ed.ci, c) + +p.dataset.d, { reaction: "sourire", bond: false, son: "bouge" }));
      });
      glisser(l.querySelector(".jauge"), (f) => {
        const [a, b] = plage(c);
        changer(c, a + f * (b - a), { reaction: "sourire", bond: false, son: "bouge", silencieux: true });
      });
    });
    page.majour = maj;
    maj();
  };
  const pageProfil = (C) => {
    const m = lireC(ed.ci, "birthMonth"), j = lireC(ed.ci, "birthDay"), s = lireC(ed.ci, "gender");
    C.innerHTML = `<div class="fiche">
      <label class="ligne"><span>Surnom</span><input data-nav class="surnom" maxlength="${NOM_MAX}" placeholder="Son surnom (10 lettres)" value="${echapper(nomDe(ed.ci))}"></label>
      <div class="ligne"><span>Sexe</span><div class="duo">${["Gar\xE7on", "Fille"].map((n, i) => `<button data-nav data-sexe="${i}" class="${s === i ? "actif" : ""}">${n}</button>`).join("")}</div></div>
      <div class="ligne"><span>${Tr("miimaker.anniversaire")}</span><div class="date"><button class="pas" data-nav data-mois="-1"><i>${ICONES.gauche}</i></button><b class="mois">${MOIS[m]}</b><button class="pas" data-nav data-mois="1"><i>${ICONES.droite}</i></button>
        <button class="pas" data-nav data-jour="-1"><i>${ICONES.gauche}</i></button><b class="jour">${m ? j : "-"}</b><button class="pas" data-nav data-jour="1"><i>${ICONES.droite}</i></button></div></div>
      <div class="ligne"><span>Ce Mii, c'est\u2026</span><button class="interrupteur${ed.moi ? " on" : ""}" data-nav data-moi><i>${ICONES.moi}</i>${ed.moi ? "Moi !" : "Quelqu'un d'autre"}</button></div></div>`;
    const champ = C.querySelector(".surnom");
    champ.oninput = () => {
      nommer(ed.ci, champ.value);
      ed.modifie = true;
      titreEditeur();
    };
    champ.onclick = () => clavierSteam(champ);
    champ.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        champ.blur();
        reagir("joie");
        son("choisir");
      }
    };
    C.querySelectorAll("[data-sexe]").forEach((b) => {
      b.onclick = () => changer("gender", +b.dataset.sexe, { reaction: "surprise" });
    });
    C.querySelectorAll("[data-mois]").forEach((b) => {
      repeter(b, () => {
        const mm = (lireC(ed.ci, "birthMonth") + +b.dataset.mois + 13) % 13;
        ecrireC(ed.ci, "birthMonth", mm);
        ecrireC(ed.ci, "birthDay", mm ? borne(lireC(ed.ci, "birthDay") || 1, 1, JOURS[mm]) : 0);
        dateChangee();
      });
    });
    C.querySelectorAll("[data-jour]").forEach((b) => {
      repeter(b, () => {
        const mm = lireC(ed.ci, "birthMonth");
        if (!mm) {
          son("bord");
          return;
        }
        ecrireC(ed.ci, "birthDay", (lireC(ed.ci, "birthDay") - 1 + +b.dataset.jour + JOURS[mm]) % JOURS[mm] + 1);
        dateChangee();
      });
    });
    C.querySelector("[data-moi]").onclick = () => {
      ed.moi = !ed.moi;
      ed.modifie = true;
      son(ed.moi ? "gagne" : "retour");
      aRefaire = { moi: ed.moi };
      reagir(ed.moi ? "joie" : "sourire");
      construirePage();
      poserFocus($("[data-moi]"));
    };
    const dateChangee = () => {
      ed.modifie = true;
      son("bouge");
      reagir("sourire", false);
      const mm = lireC(ed.ci, "birthMonth");
      C.querySelector(".mois").textContent = MOIS[mm];
      C.querySelector(".jour").textContent = mm ? lireC(ed.ci, "birthDay") : "?";
      titreEditeur();
    };
    CATS[0].pages[0].majour = () => C.querySelectorAll("[data-sexe]").forEach((b) => b.classList.toggle("actif", +b.dataset.sexe === lireC(ed.ci, "gender")));
  };
  const pageSilhouette = (C) => {
    const L = [["height", "Taille", "petit", "grand"], ["build", "Corpulence", "mince", "fort"]];
    C.innerHTML = `<div class="reglages">${L.map(([c, nom, a, b]) => `<div class="glissiere" data-champ="${c}" data-nav data-glissiere><span class="nom">${nom}</span><i>${ICONES[a]}</i><div class="jauge"><u></u><b></b></div><i>${ICONES[b]}</i></div>`).join("")}</div>`;
    const maj = () => C.querySelectorAll(".glissiere").forEach((l) => {
      const c = l.dataset.champ;
      l.style.setProperty("--p", proportion(c, lireC(ed.ci, c)));
      l.style.setProperty("--p0", proportion(c, 64));
    });
    C.querySelectorAll(".glissiere").forEach((l) => {
      const c = l.dataset.champ;
      glisser(l.querySelector(".jauge"), (f) => changer(c, f * 127, { reaction: "sourire", bond: false, silencieux: true }));
    });
    CATS[0].pages[2].majour = maj;
    maj();
  };
  const changer = (c, x, o = {}) => {
    const avant2 = lireC(ed.ci, c);
    ecrireC(ed.ci, c, x);
    if (lireC(ed.ci, c) === avant2) {
      if (!o.silencieux) son("bord");
      return false;
    }
    ed.modifie = true;
    aRefaire = aRefaire || true;
    reagir(o.reaction || "joie", o.bond !== false);
    son(o.son || "choisir");
    CATS[ed.cat].pages[ed.page].majour?.();
    titreEditeur();
    return true;
  };
  const glissiereAuPas = (el, d) => {
    const c = el.dataset.champ;
    changer(c, lireC(ed.ci, c) + d * 4, { reaction: "sourire", bond: false, son: "bouge" });
  };
  const terminer = async () => {
    if (!nomDe(ed.ci).trim()) {
      annoncer(Tr("miimaker.donne_surnom"));
      son("rate");
      choisirCat(0, 0);
      const s = $(".surnom");
      poserFocus(s);
      s?.focus();
      return;
    }
    const id = enregistrer();
    if (!id) {
      annoncer(Tr("miimaker.pas_enregistre"));
      son("rate");
      return;
    }
    son("gagne");
    finale();
    ed.modifie = false;
    titreEditeur();
    dernier = id;
    if (!liste().some((m) => m.moi)) {
      const r = await demanderChoix(Tr("miimaker.cest_toi_question", { nom: nomDe(ed.ci) }), [Tr("miimaker.oui_cest_moi"), Tr("miimaker.non")]);
      if (r === 0) {
        choisirMoi(id);
        ed.moi = true;
        aRefaire = { moi: true };
        annoncer(Tr("miimaker.cest_toi", { nom: nomDe(ed.ci) }));
      }
    }
    const retour = setTimeout(() => {
      if (ouvert && ecran === "editeur") {
        ed = null;
        ouvrirAccueil(id);
      }
    }, 1700);
    fins.push(() => clearTimeout(retour));
  };
  const enregistrer = () => {
    const b = base(), maintenant = Date.now();
    if (!ed.id) {
      let ts = Math.floor((maintenant / 1e3 - 1262304e3) / 2), id2;
      const pris = new Set(b.mii.map((m) => m.id)), cons = deHex(b.console);
      do {
        id2 = hex([144 | ts >>> 24 & 15, ts >>> 16 & 255, ts >>> 8 & 255, ts & 255, ...cons]);
        ts++;
      } while (pris.has(id2));
      ed.ci.set(deHex(id2), ID);
    }
    const id = hex(ed.ci.subarray(ID, ID + ID_TAILLE)), s = versStore(ed.ci);
    if (!s) return null;
    const ancien = b.mii.find((m) => m.id === (ed.id ?? id));
    if (ancien) Object.assign(ancien, { id, donnees: b64(s), modifie: maintenant });
    else b.mii.push({ id, donnees: b64(s), cree: maintenant, modifie: maintenant });
    if (ed.moi) b.moi = id;
    else if (b.moi === id) b.moi = null;
    const G = window.__pcvGardeRobe;
    if (ed.id && ed.id !== id) G?.definirTenue?.(ed.id, []);
    ed.id = id;
    garder(b);
    G?.definirTenue?.(id, ed.tenue);
    return id;
  };
  const quitterEditeur = async () => {
    if (ed.modifie) {
      const r = await demanderChoix("Enregistrer ce Mii avant de partir ?", ["Enregistrer", "Ne pas enregistrer", "Continuer"]);
      if (r === 0) return terminer();
      if (r !== 1) return;
    }
    son("retour");
    ed = null;
    ouvrirAccueil();
  };
  const navigables = () => [...(dialogue ? dialogue.el : racine).querySelectorAll("[data-nav]")].filter((e) => e.offsetParent !== null && (!actionsDe || dialogue || e.closest(".actions-mii")));
  const deplacer = (dir) => {
    const l = navigables();
    if (!l.length) return;
    if (!focus || !l.includes(focus)) {
      poserFocus(l[0]);
      return;
    }
    const g = focus.parentElement?.classList.contains("grille") ? [...focus.parentElement.children].filter((e) => l.includes(e)) : null;
    if (g) {
      const i = g.indexOf(focus), cols = g.filter((e) => e.offsetTop === g[0].offsetTop).length;
      const j = dir === 11 ? i - 1 : dir === 12 ? i + 1 : dir === 9 ? i - cols : i + cols;
      const k = dir === 10 && j >= g.length && Math.floor(i / cols) < Math.floor((g.length - 1) / cols) ? g.length - 1 : j;
      if (k >= 0 && k < g.length) {
        poserFocus(g[k]);
        son("bouge");
        return;
      }
    }
    const r0 = focus.getBoundingClientRect(), h = dir === 11 || dir === 12, s = dir === 12 || dir === 10 ? 1 : -1;
    const ecart = (a1, a2, b1, b2) => Math.max(0, Math.max(a1, b1) - Math.min(a2, b2));
    let meilleur = null, score = Infinity;
    for (const e of l) {
      if (e === focus) continue;
      const r = e.getBoundingClientRect();
      const d = h ? s > 0 ? r.left - r0.right : r0.left - r.right : s > 0 ? r.top - r0.bottom : r0.top - r.bottom;
      const c = h ? (r.left + r.right - r0.left - r0.right) * s : (r.top + r.bottom - r0.top - r0.bottom) * s;
      if (d < -8 || c <= 0) continue;
      const sc = Math.max(0, d) + 2.2 * (h ? ecart(r.top, r.bottom, r0.top, r0.bottom) : ecart(r.left, r.right, r0.left, r0.right)) + 0.02 * Math.abs(c);
      if (sc < score) {
        score = sc;
        meilleur = e;
      }
    }
    if (meilleur) {
      poserFocus(meilleur);
      son("bouge");
    } else son("bord");
  };
  const appuyer = (b) => {
    if (!ouvert) return false;
    if (dialogue) {
      if (b === 2) dialogue.fin(-1);
      else if (b === 1 && focus) focus.click();
      else if (b >= 9) deplacer(b);
      return true;
    }
    if (b >= 9 && b <= 12) {
      if (focus?.dataset.glissiere != null && (b === 11 || b === 12)) {
        glissiereAuPas(focus, b === 12 ? 1 : -1);
        return true;
      }
      deplacer(b);
      return true;
    }
    if (document.activeElement?.tagName === "INPUT" && racine.contains(document.activeElement)) {
      const champ = document.activeElement;
      if (b === 1 || b === 2) {
        champ.blur();
        if (b === 1 && champ.classList.contains("cherche-cat")) chercherCatalogue(champ.value);
      }
      return true;
    }
    if (b === 1) {
      if (!focus) return true;
      if (focus.tagName === "INPUT") clavierSteam(focus);
      else focus.click();
      return true;
    }
    if (b === 2) {
      if (actionsDe) {
        fermerActions();
        son("retour");
      } else if (ecran === "editeur") quitterEditeur();
      else if (ecran === "sosies" || ecran === "catalogue") {
        son("retour");
        ouvrirAccueil();
      } else fermer();
      return true;
    }
    if (ecran === "accueil" && b === 6) {
      son("choisir");
      ouvrirCatalogue();
      return true;
    }
    if (ecran === "catalogue") {
      if (b === 5) {
        son("retour");
        ouvrirAccueil();
        return true;
      }
      if (b === 3) {
        const c = $(".cherche-cat");
        if (c) {
          poserFocus(c);
          clavierSteam(c);
        }
        return true;
      }
      if (b === 4) {
        ajouterDuCatalogue();
        return true;
      }
    }
    if (ecran === "editeur") {
      if (b === 3) {
        vueForcee = !(vueForcee ?? vueCorps);
        son(vueForcee ? "zoom-" : "zoom+");
        majZoom();
        return true;
      }
      if (b === 4) {
        terminer();
        return true;
      }
      if (b === 5 || b === 6) {
        son("onglet");
        choisirCat(ed.cat + (b === 5 ? -1 : 1));
        return true;
      }
    }
    if (ecran === "sosies") {
      if (b === 4) {
        son("theme");
        ouvrirSosies();
        poserFocus($(".grille-sosies .mii"));
        return true;
      }
      if (b === 5 || b === 6) {
        sosies.sexe = b === 5 ? 0 : 1;
        son("choisir");
        ouvrirSosies();
        return true;
      }
    }
    return true;
  };
  const clavierSteam = (champ) => {
    if (!window.__pcvClavier?.(champ)) champ.focus();
  };
  const majZoom = () => {
    const z = $(".rond.zoom > i");
    if (z) z.innerHTML = vueForcee ?? vueCorps ? ICONES.zoom : ICONES.dezoom;
  };
  const CLAVIER = { ArrowUp: 9, ArrowDown: 10, ArrowLeft: 11, ArrowRight: 12, Enter: 1, Escape: 2, Backspace: 2, x: 3, X: 3, y: 4, Y: 4, q: 5, Q: 5, e: 6, E: 6, PageUp: 5, PageDown: 6 };
  const auClavier = (e) => {
    if (!ouvert) return;
    if (e.target?.tagName === "INPUT" && racine.contains(e.target)) return;
    const k = CLAVIER[e.key];
    if (!k) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    racine.classList.add("clavier");
    if (k !== 2 || !e.repeat) appuyer(k);
  };
  const repeter = (el, faire) => {
    let t1 = 0, t2 = 0;
    const stop = () => {
      clearTimeout(t1);
      clearInterval(t2);
    };
    el.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      e.preventDefault();
      racine.classList.remove("clavier");
      poserFocus(el);
      faire();
      t1 = setTimeout(() => {
        t2 = setInterval(faire, 110);
      }, 420);
    });
    for (const n of ["pointerup", "pointerleave", "pointercancel"]) el.addEventListener(n, stop);
    el.addEventListener("click", (e) => {
      if (e.detail === 0) faire();
    });
  };
  const glisser = (el, faire) => {
    const f = (e) => {
      const r = el.getBoundingClientRect();
      faire(borne((e.clientX - r.left) / r.width, 0, 1));
    };
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      racine.classList.remove("clavier");
      try {
        el.setPointerCapture(e.pointerId);
      } catch (err) {
      }
      f(e);
      el.onpointermove = f;
    });
    el.addEventListener("pointerup", () => {
      el.onpointermove = null;
    });
  };
  const surPointeur = (e) => {
    pointeur.x = e.clientX;
    pointeur.y = e.clientY;
    pointeur.t = performance.now();
  };
  const demanderChoix = (texte, choix) => new Promise((ok) => {
    const voile = document.createElement("div");
    voile.className = "voile";
    voile.innerHTML = `<div class="dialogue verre"><p>${echapper(texte)}</p><div class="choix-d">${choix.map((c, i) => `<button data-nav data-r="${i}">${echapper(c)}</button>`).join("")}</div></div>`;
    racine.appendChild(voile);
    const avant2 = focus;
    const fin = (r) => {
      voile.remove();
      dialogue = null;
      poserFocus(avant2?.isConnected ? avant2 : null);
      if (r < 0) son("retour");
      ok(r);
    };
    dialogue = { el: voile, fin };
    voile.querySelectorAll("button").forEach((b) => {
      b.onclick = () => {
        son("choisir");
        fin(+b.dataset.r);
      };
    });
    voile.onclick = (e) => {
      if (e.target === voile) fin(-1);
    };
    poserFocus(voile.querySelector("button"));
  });
  const construire = (parent) => {
    racine = document.createElement("div");
    racine.id = "pcv-miimaker";
    racine.dataset.ecran = "accueil";
    racine.innerHTML = `<style>${CSS}</style>
      <div class="scene"><canvas></canvas><div class="bulle-scene verre" hidden></div><div class="plaque"></div>
        <button class="rond zoom verre" data-pour="editeur" hidden title="Zoom"><i>${ICONES.zoom}</i></button></div>
      <div class="titre"></div>
      <div class="onglets" data-pour="editeur" hidden></div>
      <div class="panneau verre" data-pour="accueil editeur catalogue"></div>
      <div class="sosies" data-pour="sosies" hidden></div>
      <div class="bas"></div>`;
    (parent || document.body).appendChild(racine);
    window.__pcvFond?.(racine);
    $(".rond.zoom").onclick = () => appuyer(3);
    const sc = $(".scene");
    sc.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      glisse = { x: e.clientX, yaw: yawVise };
      try {
        sc.setPointerCapture(e.pointerId);
      } catch (err) {
      }
    });
    sc.addEventListener("pointermove", (e) => {
      if (glisse) yawVise = glisse.yaw + (e.clientX - glisse.x) / sc.clientWidth * Math.PI * 1.6;
    });
    const lacher = () => {
      if (glisse) {
        glisse = null;
        lacheA = horloge;
      }
    };
    sc.addEventListener("pointerup", lacher);
    sc.addEventListener("pointercancel", lacher);
    racine.addEventListener("pointermove", surPointeur);
    racine.addEventListener("pointerdown", (e) => {
      surPointeur(e);
      racine.classList.remove("clavier");
    });
    window.addEventListener("keydown", auClavier, true);
    fins.push(() => window.removeEventListener("keydown", auClavier, true));
  };
  const image = (t) => {
    boucle = requestAnimationFrame(image);
    if (document.hidden) {
      avant = t;
      return;
    }
    const dt = Math.min(0.1, (t - (avant || t)) / 1e3);
    avant = t;
    horloge += dt;
    if (aRefaire && ed) {
      const o = aRefaire, t0 = performance.now();
      aRefaire = null;
      try {
        montrer(ed.ci, { moi: o.moi ?? ed.moi });
        mesures.refonte = Math.round(performance.now() - t0);
      } catch (e) {
        console.warn("Mii Maker : Mii refus\xE9", e);
      }
    }
    try {
      vivre(dt);
      dessiner(dt);
    } catch (e) {
      console.warn("Mii Maker : image", e);
    }
    if (file.length) pomper(vivant ? 9 : 14);
  };
  const montrerAbsent = (e) => {
    racine.dataset.ecran = "absent";
    ecran = "absent";
    racine.querySelectorAll("[data-pour]").forEach((x) => {
      x.hidden = true;
    });
    $(".titre").textContent = "Mii Maker";
    const a = document.createElement("div");
    a.className = "absent verre";
    a.innerHTML = `<b>${Tr("miimaker.mii_pas_installes")}</b><p>${Tr("miimaker.mii_pas_installes_texte")}</p>`;
    racine.appendChild(a);
    indices([[2, Tr("miimaker.fermer"), true]]);
    console.warn("Mii Maker :", e?.message || e);
  };
  const ouvrir = (o = {}) => ouvert ? fini.promesse : (window.__pcvNintendo?.exiger?.("mii") ?? Promise.resolve(false)).then((ok) => ok ? lancer(o) : null);
  const lancer = (o) => {
    if (ouvert) return fini.promesse;
    ouvert = true;
    dernier = null;
    let tenir;
    fini = { promesse: new Promise((ok) => {
      tenir = ok;
    }) };
    fini.tenir = tenir;
    construire(o.parent);
    racine.classList.add("clavier");
    (window.__pcvManette ||= {}).miiMaker = (b) => ouvert && appuyer(b);
    if (Array.isArray(window.__pcvOrdre) && !window.__pcvOrdre.includes("miiMaker")) window.__pcvOrdre.unshift("miiMaker");
    window.__pcvMusique?.("mii-maker-main");
    $(".titre").textContent = "Mii Maker";
    $(".bas").innerHTML = "";
    preparerMoteur(o.moteur ?? window.__pcvMiiMakerMoteur ?? moteurSteam).then(() => {
      if (!ouvert) return;
      installerTenue([]);
      const seance = fini;
      window.__pcvGardeRobe?.liste?.().then((l) => {
        if (ouvert && fini === seance) {
          installerTenue(l);
          vetirVivant();
        }
      }).catch(() => {
      });
      creerRendu();
      avant = 0;
      boucle = requestAnimationFrame(image);
      const e = o.ecran || "accueil";
      if (o.modifier) {
        const m = liste().find((x) => x.id === o.modifier);
        const ci = m && depuisStore(m.donnees);
        if (ci) return ouvrirEditeur(ci, { id: m.id, moi: m.moi });
      }
      if (e === "zero") {
        ouvrirAccueil();
        demanderZero();
      } else if (e === "sosies") ouvrirSosies();
      else if (e === "hasard") ouvrirEditeur(hasard(), { reaction: "surprise" });
      else ouvrirAccueil();
    }).catch((e) => {
      if (ouvert) montrerAbsent(e);
    });
    return fini.promesse;
  };
  const fermer = () => {
    if (!ouvert) return;
    ouvert = false;
    cancelAnimationFrame(boucle);
    boucle = 0;
    try {
      if (vivant) {
        vivant.mixer?.stopAllAction();
        devetir(vivant);
        vivant.cm.dispose();
      }
    } catch (e) {
    }
    vivant = null;
    file = [];
    fileTenue.length = 0;
    cache.clear();
    rt?.dispose();
    rt = null;
    ombre?.material.map?.dispose();
    if (rendu) {
      rendu.dispose();
      rendu.forceContextLoss();
      rendu = null;
    }
    for (const f of fins.splice(0)) {
      try {
        f();
      } catch (e) {
      }
    }
    racine?.remove();
    racine = null;
    focus = null;
    dialogue = null;
    ed = null;
    actionsDe = null;
    if (window.__pcvManette?.miiMaker) delete window.__pcvManette.miiMaker;
    if (Array.isArray(window.__pcvOrdre)) {
      const i = window.__pcvOrdre.indexOf("miiMaker");
      if (i >= 0) window.__pcvOrdre.splice(i, 1);
    }
    window.__pcvMusique?.(null);
    son("fermer");
    fini?.tenir(dernier);
    window.dispatchEvent(new Event("pcv-mii-maker-ferme"));
  };
  window.__pcvMiiMaker = {
    ouvrir,
    fermer,
    get ouvert() {
      return ouvert;
    },
    manette: (b) => ouvert && appuyer(b),
    liste,
    moi: () => liste().find((m) => m.moi) || null,
    choisirMoi,
    supprimer,
    dupliquer,
    exporter,
    importerFichier,
    CLE,
    retirer: () => {
      fermer();
    },
    // pour les bancs : raison de refus du moteur pour le Mii en cours (0 = accepté)
    diagnostic: () => {
      if (!ed || !moteur) return null;
      const M = moteur.M, p = M._malloc(TAILLE_CI);
      try {
        M.HEAPU8.set(ed.ci, p);
        return { raison: M._FFLiVerifyCharInfoWithReason(p, false), id: hex(ed.ci.subarray(ID, ID + ID_TAILLE)), champs: Object.fromEntries(Object.keys(POS).map((c) => [c, lireC(ed.ci, c)])) };
      } finally {
        M._free(p);
      }
    },
    // pour les bancs : état courant (tenue : celle de l'éditeur ; porte : ce que le Mii en direct porte vraiment)
    get etat() {
      return {
        ecran,
        cat: ed ? CATS[ed.cat].id : null,
        page: ed ? CATS[ed.cat].pages[ed.page].nom : null,
        file: file.length,
        cache: cache.size,
        focus: focus?.className || null,
        nom: ed ? nomDe(ed.ci) : null,
        tenue: ed ? ed.tenue.slice() : null,
        porte: vivant ? window.__pcvGardeRobe?.porte?.({ tete: vivant.cm, modele: vivant.modele || null }) || [] : [],
        ...mesures
      };
    }
  };
  return "Mii Maker pr\xEAt";
})();
