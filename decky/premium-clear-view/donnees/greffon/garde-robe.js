(() => {
  const T = window.THREE, avant = window.__pcvGardeRobe;
  avant?.retirer?.();
  if (!T) return "garde-robe : three.js absent";
  const DOSSIER = "garde-robe/", CLE = "pcv-mii-tenues", VERSION = 1;
  const CATEGORIES = ["chapeau", "visage", "haut", "accessoire", "bas"];
  const CACHES = { aucun: 0, haut: 1, tout: 2 };
  const ID = /^\w[\w.-]*$/;
  const ANCRES = { cou: ["chest", "head"], torse: ["chest", "chest"], bassin: ["hip", "hip"] };
  const PARTIES = { haut: /^body_/, bas: /^legs_/ };
  const TYPE = { tete: 5, corps: 9 };
  const FORMES = /* @__PURE__ */ new Set([3, 4, 5]);
  const fins = [];
  const lire = async (chemin, type = "application/octet-stream", dossier = DOSSIER) => {
    const c = dossier + chemin, url = await window.__pcvRessource?.(c, type);
    if (!url) throw new Error("garde-robe : prive/" + c + " absent");
    try {
      return await (await fetch(url)).arrayBuffer();
    } finally {
      URL.revokeObjectURL(url);
      if (window.__pcvBlobs?.[c] === url) delete window.__pcvBlobs[c];
    }
  };
  const lireJSON = async (chemin, dossier) => JSON.parse(new TextDecoder().decode(await lire(chemin, "application/json", dossier)));
  const vec3 = (v, d) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite) ? v.slice() : d.slice();
  const valider = (a, id) => {
    if (!a || typeof a !== "object") throw new Error("article.json illisible");
    if (a.id !== id) throw new Error(`id \xAB ${a.id} \xBB \u2260 dossier \xAB ${id} \xBB`);
    if (!CATEGORIES.includes(a.categorie)) throw new Error("cat\xE9gorie inconnue : " + a.categorie);
    if (typeof a.fichier !== "string" || !a.fichier || a.fichier.includes("..")) throw new Error("fichier manquant");
    if (typeof a.attache !== "string" || !a.attache) throw new Error("attache manquante");
    const teinte = a.teinte === "favorite" || /^#[0-9a-f]{6}$/i.test(a.teinte ?? "") ? a.teinte : null;
    return Object.freeze({
      id,
      nom: String(a.nom || id),
      categorie: a.categorie,
      fichier: a.fichier,
      attache: a.attache,
      position: vec3(a.position, [0, 0, 0]),
      rotation: vec3(a.rotation, [0, 0, 0]),
      echelle: Number.isFinite(a.echelle) && a.echelle > 0 ? a.echelle : 1,
      teinte,
      cache_cheveux: a.cache_cheveux in CACHES ? a.cache_cheveux : "aucun",
      remplace: a.remplace in PARTIES ? a.remplace : null,
      auteur: a.auteur ? String(a.auteur) : "",
      source: a.source ? String(a.source) : ""
    });
  };
  let catalogue = null, lus = null, sansIndex = 0;
  const modeles = avant?.modeles instanceof Map ? avant.modeles : /* @__PURE__ */ new Map();
  const prets = avant?.prets instanceof Map ? avant.prets : /* @__PURE__ */ new Map();
  const liste = (o = {}) => {
    if (o.relire) {
      catalogue = lus = null;
      modeles.clear();
      prets.clear();
    } else if (catalogue && sansIndex && performance.now() > sansIndex) catalogue = null;
    return catalogue ||= (async () => {
      const ids = /* @__PURE__ */ new Set();
      let indexLu = false;
      try {
        for (const id of (await lireJSON("index.json")).articles || []) if (typeof id === "string" && ID.test(id)) ids.add(id);
        indexLu = true;
      } catch (e) {
      }
      try {
        for (const n of await window.__pcvListe?.(DOSSIER.slice(0, -1)) || []) if (n.endsWith("/") && ID.test(n.slice(0, -1))) {
          ids.add(n.slice(0, -1));
          indexLu = true;
        }
      } catch (e) {
      }
      sansIndex = indexLu ? 0 : performance.now() + 3e4;
      const l = (await Promise.all([...ids].map((id) => lireJSON(id + "/article.json").then((a) => valider(a, id)).catch((e) => {
        console.warn("garde-robe : article " + id + " ignor\xE9 :", e.message || e);
        return null;
      })))).filter(Boolean);
      return lus = l.sort((a, b) => CATEGORIES.indexOf(a.categorie) - CATEGORIES.indexOf(b.categorie) || a.nom.localeCompare(b.nom, "fr"));
    })().catch((e) => {
      catalogue = null;
      throw e;
    });
  };
  const horsCatalogue = avant?.horsCatalogue instanceof Map ? avant.horsCatalogue : /* @__PURE__ */ new Map();
  const inscrire = async (dossier, ids = []) => {
    if (typeof dossier !== "string" || !/^\w[\w-]*\/$/.test(dossier)) throw new Error("garde-robe : dossier invalide");
    const ok = await Promise.all(ids.filter((id) => typeof id === "string" && ID.test(id)).map(async (id) => {
      if (horsCatalogue.get(id)?.dossier === dossier) return id;
      try {
        horsCatalogue.set(id, { dossier, article: valider(await lireJSON(id + "/article.json", dossier), id) });
        return id;
      } catch (e) {
        console.warn("garde-robe : article " + id + " ignor\xE9 :", e.message || e);
        return null;
      }
    }));
    return ok.filter(Boolean);
  };
  const uris = (buf) => {
    const o = new Uint8Array(buf);
    let json;
    if (o[0] === 103 && o[1] === 108 && o[2] === 84 && o[3] === 70) {
      const n = new DataView(buf).getUint32(12, true);
      json = new TextDecoder().decode(o.subarray(20, 20 + n));
    } else json = new TextDecoder().decode(o);
    try {
      const j = JSON.parse(json);
      return [...j.buffers || [], ...j.images || []].map((x) => x.uri).filter((u) => u && !u.startsWith("data:"));
    } catch (e) {
      return [];
    }
  };
  const analyser = async (buf, id, dossier) => {
    const E = window.__pcvESM;
    if (!E?.GLTFLoader) throw new Error("garde-robe : greffon/vendor/three-gltf.js absent");
    const adresses = {};
    for (const u of uris(buf)) {
      const b = await lire(id + "/" + decodeURIComponent(u), /\.png$/i.test(u) ? "image/png" : /\.jpe?g$/i.test(u) ? "image/jpeg" : void 0, dossier);
      adresses[u] = URL.createObjectURL(new Blob([b]));
    }
    const gestion = new T.LoadingManager();
    gestion.setURLModifier((u) => adresses[u] || adresses[u.replace(/^.*\//, "")] || u);
    try {
      return await new Promise((ok, ko) => new E.GLTFLoader(gestion).parse(buf, "", ok, ko));
    } finally {
      for (const u of Object.values(adresses)) URL.revokeObjectURL(u);
    }
  };
  const charger = (id) => {
    if (modeles.has(id)) return modeles.get(id);
    const p = (async () => {
      const r = horsCatalogue.get(id), article = r ? r.article : (await liste()).find((a) => a.id === id);
      if (!article) throw new Error("garde-robe : article inconnu : " + id);
      const gltf = await analyser(await lire(id + "/" + article.fichier, /\.glb$/i.test(article.fichier) ? "model/gltf-binary" : "model/gltf+json", r?.dossier), id, r?.dossier);
      gltf.scene.traverse((x) => {
        for (const m of [].concat(x.material || [])) if (m.map) {
          m.map.colorSpace = T.NoColorSpace;
          m.map.needsUpdate = true;
        }
      });
      return { article, gltf };
    })();
    modeles.set(id, p);
    p.then((r) => {
      if (modeles.get(id) === p) prets.set(id, r);
    }, () => modeles.delete(id));
    return p;
  };
  const brute = (hex) => new T.Color().setHex(hex, T.LinearSRGBColorSpace);
  const teintable = (m) => m.userData?.teintable ?? (/teint/i.test(m.name || "") || null);
  const lab = (rgb) => {
    const [R, G, B] = rgb.map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4), f = (t) => t > 8856e-6 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
    const X = f((0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.9505), Y = f(0.2126 * R + 0.7152 * G + 0.0722 * B), Z = f((0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.089);
    return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
  };
  let preferees = null;
  const ligneProche = (rgb, M) => {
    if (!preferees && M?._FFLGetFavoriteColor) {
      const p = M._malloc(16);
      try {
        preferees = Array.from({ length: 12 }, (_, i) => {
          M._FFLGetFavoriteColor(p, i);
          return lab(Array.from(M.HEAPF32.subarray(p / 4, p / 4 + 3)));
        });
      } finally {
        M._free(p);
      }
    }
    if (!preferees) return 0;
    const c = lab(rgb);
    let k = 0, d = Infinity;
    preferees.forEach((q, i) => {
      const e = (q[0] - c[0]) ** 2 + (q[1] - c[1]) ** 2 + (q[2] - c[2]) ** 2;
      if (e < d) {
        d = e;
        k = i;
      }
    });
    return k;
  };
  const moyenne = (tex) => tex.userData.pcvMoyenne ||= (() => {
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 32;
      const x = c.getContext("2d");
      x.drawImage(tex.image, 0, 0, 32, 32);
      const d = x.getImageData(0, 0, 32, 32).data, s = [0, 0, 0];
      let n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const h = Math.max(d[i], d[i + 1], d[i + 2]), b = Math.min(d[i], d[i + 1], d[i + 2]);
        if (!h || (h - b) / h < 0.3) continue;
        for (let k = 0; k < 3; k++) s[k] += d[i + k] / 255;
        n++;
      }
      return n ? s.map((v) => v / n) : [1, 1, 1];
    } catch (e) {
      return [1, 1, 1];
    }
  })();
  const COULEURS0 = { facelineColor: 0, favoriteColor: 0, hairColor: 0, beardColor: 0, pantsColor: 0 };
  const deSaCouleur = (teinte, cm) => !!cm?.favoriteColor && teinte.equals(cm.favoriteColor);
  const habillerMateriau = (src, Mat, teinte, toutTeint, type, cm) => {
    const teint = !!teinte && (teintable(src) ?? toutTeint), m = new Mat({ side: src.side ?? T.FrontSide }), tex = src.map || null;
    if ("modulateMode" in Mat.prototype) {
      m.modulateMode = tex ? teint ? 5 : 1 : 0;
      m.modulateType = type;
    }
    if (tex) m.map = tex;
    m.color = teint ? teinte.clone() : tex ? new T.Color(1, 1, 1) : brute(src.color ? src.color.getHex() : 16777215);
    if ("colorInfo" in Mat.prototype) {
      const M = cm?._module || window.__pcvMii3D?.ffl?.module, favori = cm?.charInfo?.favoriteColor;
      m.colorInfo = { ...cm?.getColorInfo?.() || COULEURS0, favoriteColor: teint && deSaCouleur(teinte, cm) && favori != null ? favori : ligneProche(tex && !teint ? moyenne(tex) : m.color.toArray(), M) };
      if (tex && m.uniforms?.u_SpecularFactorA) m.uniforms.u_SpecularFactorA.value *= 0.5;
    }
    if (src.transparent || src.opacity < 1) {
      m.transparent = true;
      m.opacity = src.opacity;
      m.depthWrite = src.depthWrite;
    }
    return m;
  };
  const teinteDe = (a, cm) => a.teinte === "favorite" ? cm?.favoriteColor?.clone?.() ?? brute(13770260) : a.teinte ? brute(parseInt(a.teinte.slice(1), 16)) : null;
  const instance = (gltf, a, Mat, teinte, type, cm) => {
    const E = window.__pcvESM, racine = (E.clone || ((s) => s.clone(true)))(gltf.scene), mats = /* @__PURE__ */ new Map();
    let marques = false;
    gltf.scene.traverse((x) => {
      for (const m of [].concat(x.material || [])) if (teintable(m)) marques = true;
    });
    racine.traverse((x) => {
      if (!x.isMesh) return;
      x.frustumCulled = false;
      const un = (m) => mats.get(m) || mats.set(m, habillerMateriau(m, Mat, teinte, !marques, type, cm)).get(m);
      x.material = Array.isArray(x.material) ? x.material.map(un) : un(x.material);
    });
    return { racine, materiaux: [...mats.values()] };
  };
  const RAD = Math.PI / 180;
  const os = (sq, nom) => sq.bones.findIndex((b) => b.name === nom);
  const squelette = (modele, nom) => {
    let r = null;
    modele?.traverse((x) => {
      if (!r && x.isSkinnedMesh && !x.userData.pcvArticle && os(x.skeleton, nom) >= 0 && x.skeleton.attach) r = x.skeleton;
    });
    return r;
  };
  const poser = (piece, a, cm, modele) => {
    const g = new T.Group();
    g.name = "pcv-article:" + a.id;
    g.position.fromArray(a.position);
    g.rotation.set(a.rotation[0] * RAD, a.rotation[1] * RAD, a.rotation[2] * RAD);
    g.scale.setScalar(a.echelle);
    const peaux = [];
    piece.traverse((x) => {
      if (x.isSkinnedMesh) peaux.push(x);
    });
    const osDuCorps = new Map((peaux.length && squelette(modele, "chest")?.bones || []).map((b) => [b.name, b]));
    for (const p of peaux) {
      const b = p.skeleton.bones.map((x) => osDuCorps.get(x.name));
      p.removeFromParent();
      if (!modele || b.some((x) => !x)) continue;
      p.bind(new T.Skeleton(b, p.skeleton.boneInverses), p.bindMatrix);
      modele.add(p);
    }
    g.add(piece);
    const retirerPeaux = () => peaux.forEach((p) => {
      p.removeFromParent();
      p.skeleton.dispose();
    });
    if (a.attache === "tete") {
      cm.meshes.add(g);
      return () => {
        g.removeFromParent();
        retirerPeaux();
      };
    }
    const [suivi, ancre] = ANCRES[a.attache] || [a.attache, a.attache], sq = squelette(modele, suivi);
    if (!sq) {
      retirerPeaux();
      return null;
    }
    const support = new T.Group(), calage = new T.Group(), pA = new T.Vector3().setFromMatrixPosition(sq.boneInverses[os(sq, ancre)].clone().invert());
    calage.matrixAutoUpdate = false;
    calage.matrix.copy(sq.boneInverses[os(sq, suivi)]).multiply(new T.Matrix4().makeTranslation(pA.x, pA.y, pA.z));
    support.add(calage);
    calage.add(g);
    modele.add(support);
    sq.attach(support, suivi, true);
    return () => {
      sq.detach(support);
      support.removeFromParent();
      retirerPeaux();
    };
  };
  const coiffer = (cm, niveau, etat) => {
    for (const x of etat.caches) x.visible = true;
    for (const x of etat.pris) {
      x.removeFromParent();
      x.geometry.dispose();
      [].concat(x.material).forEach((m) => m.dispose());
    }
    etat.caches = [];
    etat.pris = [];
    const F = window.FFLjs;
    if (!niveau || !F || !cm.meshes) return;
    let pris = [];
    try {
      const h = new F.CharModel({ module: cm._module }, cm._data, { resolution: 64, allExpressionFlag: F.makeExpressionFlag([F.FFLExpression.NORMAL]), modelFlag: F.FFLModelFlag.HAT }, cm._materialClass, null, false);
      for (const x of [...h.meshes.children]) {
        const t = x.geometry?.userData?.modulateType;
        if (t === 3 || niveau === 1 && FORMES.has(t)) {
          h.meshes.remove(x);
          pris.push(x);
        }
      }
      h.dispose();
    } catch (e) {
      console.warn("garde-robe : pas de coiffure sous chapeau", e);
      pris = [];
    }
    for (const x of cm.meshes.children) if (x.isMesh && FORMES.has(x.geometry?.userData?.modulateType)) {
      x.visible = false;
      etat.caches.push(x);
    }
    for (const x of pris) {
      x.frustumCulled = false;
      cm.meshes.add(x);
    }
    etat.pris = pris;
  };
  const parties = (mii) => {
    const cm = mii?.tete || mii?.cm || null, modele = mii?.modele || mii?.corps?.model || null;
    if (!cm?.meshes) throw new Error("garde-robe : Mii sans t\xEAte de FFL");
    return { cm, modele, et: cm.meshes.userData.pcvTenue ||= { portes: [], cheveux: { caches: [], pris: [] } }, ec: modele ? modele.userData.pcvTenue ||= { portes: [], caches: [] } : null };
  };
  const enlever = (P, id, retouche = true) => {
    for (const e of [P.et, P.ec]) {
      if (!e) continue;
      for (const p of e.portes.filter((p2) => id == null || p2.id === id)) {
        p.retirer?.();
        p.materiaux.forEach((m) => m.dispose());
      }
      e.portes = e.portes.filter((p) => id != null && p.id !== id);
    }
    if (retouche) retoucher(P);
  };
  const retoucher = (P) => {
    const portes = [...P.et.portes, ...P.ec?.portes || []];
    const niveau = Math.max(0, ...portes.map((p) => CACHES[p.article.cache_cheveux]));
    if (niveau !== (P.et.niveau || 0)) {
      coiffer(P.cm, niveau, P.et.cheveux);
      P.et.niveau = niveau;
    }
    if (P.ec) {
      for (const m of P.ec.caches) m.visible = true;
      P.ec.caches = [];
      for (const r of new Set(portes.map((p) => p.article.remplace).filter(Boolean)))
        P.modele.traverse((x) => {
          if (x.isSkinnedMesh && PARTIES[r].test(x.name) && !x.userData.pcvArticle) for (const m of [].concat(x.material)) {
            m.visible = false;
            P.ec.caches.push(m);
          }
        });
    }
  };
  const porte = (mii) => {
    try {
      const P = parties(mii);
      return [...P.et.portes, ...P.ec?.portes || []].map((p) => p.id);
    } catch (e) {
      return [];
    }
  };
  const deshabiller = (mii, id = null) => {
    const P = parties(mii);
    enlever(P, id);
  };
  const trier = (charges) => {
    const garde = /* @__PURE__ */ new Map();
    for (const c of charges) {
      const a = c.article, k = a.categorie === "accessoire" ? "accessoire:" + a.id : a.categorie;
      garde.delete(k);
      garde.set(k, c);
    }
    return [...garde.values()];
  };
  const vetirAvec = (mii, charges) => {
    const P = parties(mii);
    enlever(P, null, false);
    const Mat = P.cm._materialClass || window.FFLShaderMaterial;
    for (const { article: a, gltf } of trier(charges)) {
      const surTete = a.attache === "tete", e = surTete ? P.et : P.ec;
      if (!e) continue;
      const { racine, materiaux } = instance(gltf, a, Mat, teinteDe(a, P.cm), surTete ? TYPE.tete : TYPE.corps, P.cm);
      racine.traverse((x) => {
        x.userData.pcvArticle = a.id;
      });
      let retirer = null;
      try {
        retirer = poser(racine, a, P.cm, P.modele);
      } catch (err) {
        console.warn("garde-robe : " + a.id + " non pos\xE9", err);
      }
      if (!retirer) {
        materiaux.forEach((m) => m.dispose());
        continue;
      }
      e.portes.push({ id: a.id, article: a, retirer, materiaux });
    }
    retoucher(P);
    return porte(mii);
  };
  const habiller = (mii, ids = []) => {
    try {
      const P0 = parties(mii), jeton = P0.et.jeton = (P0.et.jeton || 0) + 1, voulus = [...new Set(ids)];
      if (voulus.every((id) => prets.has(id) || lus && !lus.some((a) => a.id === id) && !horsCatalogue.has(id)))
        return Promise.resolve(vetirAvec(mii, voulus.map((id) => prets.get(id)).filter(Boolean)));
      return (async () => {
        const charges = (await Promise.all(voulus.map((id) => charger(id).catch((e) => {
          console.warn("garde-robe :", e.message || e);
          return null;
        })))).filter(Boolean);
        if (!P0.cm.meshes) return [];
        if (P0.et.jeton !== jeton) return porte(mii);
        return vetirAvec(mii, charges);
      })();
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const lireTenues = () => {
    try {
      const t = JSON.parse(localStorage.getItem(CLE) || "null");
      return t && typeof t.mii === "object" && t.mii ? t : { version: VERSION, mii: {} };
    } catch (e) {
      return { version: VERSION, mii: {} };
    }
  };
  const tenue = (miiId) => miiId == null ? [] : [...lireTenues().mii[miiId] || []].filter((x) => typeof x === "string");
  const definirTenue = (miiId, ids = []) => {
    if (miiId == null) return [];
    const t = lireTenues(), l = [...new Set((ids || []).filter((x) => typeof x === "string"))];
    if (l.length) t.mii[miiId] = l;
    else delete t.mii[miiId];
    try {
      localStorage.setItem(CLE, JSON.stringify(t));
    } catch (e) {
      console.warn("garde-robe : tenue non enregistr\xE9e", e);
    }
    window.dispatchEvent(new CustomEvent("pcv-mii-tenues", { detail: { id: miiId, ids: l } }));
    return l;
  };
  const octets = (d) => {
    if (d instanceof Uint8Array) return d;
    if (d instanceof ArrayBuffer) return new Uint8Array(d);
    const s = String(d ?? "").trim();
    return /^[0-9a-f]+$/i.test(s) && !(s.length % 2) ? Uint8Array.from({ length: s.length >> 1 }, (_, i) => parseInt(s.substr(i * 2, 2), 16)) : Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  };
  const cleDe = (d) => {
    try {
      const o = octets(d);
      return Array.from(o.length >= 288 ? o.subarray(264, 274) : o.subarray(12, 22), (b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      return null;
    }
  };
  const idDe = (donnees) => {
    const c = cleDe(donnees);
    if (!c || /^0+$/.test(c)) return null;
    const l = window.__pcvMiiBase?.liste?.() || window.__pcvMiiMaker?.liste?.() || [];
    return l.find((m) => cleDe(m.donnees) === c)?.id ?? null;
  };
  const suivis = avant?.suivis instanceof Set ? avant.suivis : /* @__PURE__ */ new Set();
  const vetir = (m, id, ids) => {
    const l = ids ?? tenue(id);
    if (!l.length && !porte(m).length) return;
    const faire = () => m.tete?.meshes ? habiller(m, l) : null;
    (lus ? faire() || Promise.resolve() : liste().then(faire)).catch((e) => console.warn("garde-robe : Mii non habill\xE9", e));
  };
  const precharger = () => {
    for (const id of new Set(Object.values(lireTenues().mii).flat())) if (typeof id === "string") charger(id).catch(() => {
    });
  };
  const envelopper = () => {
    const A = window.__pcvMii3D;
    if (!A?.vrais || A.creer.pcvGardeRobe) return;
    const creer = A.creer, enveloppe = (o = {}) => {
      const m = creer(o), liberer = m.liberer;
      let suivi = null;
      m.liberer = () => {
        suivis.delete(suivi);
        try {
          if (porte(m).length) deshabiller(m);
        } catch (e) {
        }
        return liberer();
      };
      if (o.tenue === false || o.donnees == null && !Array.isArray(o.tenue)) return m;
      const id = idDe(o.donnees ?? m.charInfo);
      if (Array.isArray(o.tenue)) vetir(m, id, o.tenue);
      else if (id != null) {
        suivis.add(suivi = { ref: new WeakRef(m), id });
        vetir(m, id);
      }
      if (suivis.size > 64) {
        for (const s of [...suivis]) if (!s.ref.deref()?.tete?.meshes) suivis.delete(s);
      }
      return m;
    };
    enveloppe.pcvGardeRobe = creer;
    A.creer = enveloppe;
    precharger();
  };
  const changee = (e) => {
    for (const s of [...suivis]) {
      const m = s.ref.deref();
      if (!m?.tete?.meshes) {
        suivis.delete(s);
        continue;
      }
      if (s.id === e.detail?.id) vetir(m, s.id);
    }
  };
  envelopper();
  window.addEventListener("pcv-vrais-mii", envelopper);
  window.addEventListener("pcv-mii-tenues", changee);
  fins.push(() => {
    window.removeEventListener("pcv-vrais-mii", envelopper);
    window.removeEventListener("pcv-mii-tenues", changee);
    const A = window.__pcvMii3D;
    if (A?.creer?.pcvGardeRobe) A.creer = A.creer.pcvGardeRobe;
  });
  const baisserBras = (racine) => {
    racine.updateMatrixWorld(true);
    for (const [haut, bas] of [["arm_l1", "arm_l2"], ["arm_r1", "arm_r2"]]) {
      const o = racine.getObjectByName(haut), e = racine.getObjectByName(bas);
      if (!o?.isBone || !e) continue;
      const d = e.getWorldPosition(new T.Vector3()).sub(o.getWorldPosition(new T.Vector3())).normalize();
      const vise = new T.Vector3(Math.sign(d.x) * 0.28, -1, 0).normalize(), q = new T.Quaternion().setFromUnitVectors(d, vise);
      o.quaternion.copy(o.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q).multiply(o.getWorldQuaternion(new T.Quaternion())));
      o.updateMatrixWorld(true);
    }
  };
  const apercu = async (id, o = {}) => {
    const { article: a, gltf } = await charger(id), rendu = o.rendu;
    if (!rendu) throw new Error("garde-robe : apercu() demande le rendu");
    const Mat = o.materiau || window.FFLShaderMaterial, teinte = a.teinte === "favorite" ? o.teinte || brute(2647240) : teinteDe(a);
    const { racine, materiaux } = instance(gltf, a, Mat, teinte, a.attache === "tete" ? TYPE.tete : TYPE.corps, null);
    const s = new T.Scene(), g = new T.Group();
    g.add(racine);
    s.add(g);
    g.rotation.y = o.cap ?? -0.55;
    const squelettes = /* @__PURE__ */ new Set();
    racine.traverse((x2) => {
      if (x2.isSkinnedMesh) squelettes.add(x2.skeleton);
    });
    if (squelettes.size) baisserBras(racine);
    g.updateMatrixWorld(true);
    for (const k of squelettes) k.update();
    const b = new T.Box3().setFromObject(racine), c = b.getCenter(new T.Vector3()), r = Math.max(1e-3, b.getSize(new T.Vector3()).length() / 2);
    const n = o.taille || 256, cam = new T.PerspectiveCamera(20, 1, r * 0.1, r * 20), d = r / Math.sin(10 * RAD) * 0.8;
    cam.position.copy(c).addScaledVector(new T.Vector3(0, 0.36, 1).normalize(), d);
    cam.lookAt(c);
    const rt = new T.WebGLRenderTarget(n, n, { samples: 4 }), px = new Uint8Array(n * n * 4), avant2 = rendu.getRenderTarget();
    const fond = rendu.getClearColor(new T.Color()), alpha = rendu.getClearAlpha();
    try {
      rendu.setRenderTarget(rt);
      rendu.setClearColor(0, 0);
      rendu.clear();
      rendu.render(s, cam);
      rendu.readRenderTargetPixels(rt, 0, 0, n, n, px);
    } finally {
      rendu.setRenderTarget(avant2);
      rendu.setClearColor(fond, alpha);
      rt.dispose();
      materiaux.forEach((m) => m.dispose());
      for (const k of squelettes) k.dispose();
    }
    const toile = document.createElement("canvas");
    toile.width = toile.height = n;
    const x = toile.getContext("2d"), img = x.createImageData(n, n);
    for (let y = 0; y < n; y++) img.data.set(px.subarray((n - 1 - y) * n * 4, (n - y) * n * 4), y * n * 4);
    x.putImageData(img, 0, 0);
    return toile;
  };
  window.__pcvGardeRobe = {
    liste,
    charger,
    inscrire,
    horsCatalogue,
    habiller,
    deshabiller,
    porte,
    tenue,
    definirTenue,
    idDe,
    apercu,
    CATEGORIES,
    version: VERSION,
    suivis,
    modeles,
    prets,
    retirer: () => {
      for (const f of fins.splice(0)) {
        try {
          f();
        } catch (e) {
        }
      }
    }
  };
  return "garde-robe pr\xEAte";
})();
