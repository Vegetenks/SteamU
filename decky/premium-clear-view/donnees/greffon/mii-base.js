(() => {
  const CLE = "pcv-mii", CLE_OUBLIES = "pcv-mii-oublies", VERSION = 1;
  const TAILLE = 96, COEUR = 92, SANS_AUTEUR = 72;
  window.__pcvMiiBaseFin?.();
  const fins = [];
  window.__pcvMiiBaseFin = () => {
    for (const f of fins.splice(0)) f();
  };
  const hexa = (o) => Array.from(o, (b) => b.toString(16).padStart(2, "0")).join("");
  const deHex = (s) => Uint8Array.from({ length: s.length >> 1 }, (_, i) => parseInt(s.substr(i * 2, 2), 16));
  const b64 = (o) => {
    let s = "";
    for (const b of o) s += String.fromCharCode(b);
    return btoa(s);
  };
  const deB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const versOctets = (d) => {
    if (d instanceof Uint8Array) return d;
    if (d instanceof ArrayBuffer) return new Uint8Array(d);
    const s = String(d ?? "").trim();
    return /^[0-9a-f]+$/i.test(s) && !(s.length % 2) ? deHex(s) : deB64(s);
  };
  const crc16 = (d, n) => {
    let c = 0;
    for (let i = 0; i < n; i++) {
      c ^= d[i] << 8;
      for (let k = 0; k < 8; k++) c = c & 32768 ? (c << 1 ^ 4129) & 65535 : c << 1 & 65535;
    }
    return c;
  };
  const crcBon = (d) => crc16(d, 94) === (d[94] << 8 | d[95]);
  const poserCRC = (d) => {
    const c = crc16(d, 94);
    d[94] = c >> 8;
    d[95] = c & 255;
    return d;
  };
  const completer = (d) => {
    const s = new Uint8Array(TAILLE);
    s.set(d.subarray(0, d.length >= COEUR ? COEUR : SANS_AUTEUR));
    return poserCRC(s);
  };
  const CHAMPS = [
    ["pageIndex", 2, 1, 0, 4, 0, 9],
    ["slotIndex", 2, 1, 4, 4, 0, 9],
    ["deviceOrigin", 3, 1, 4, 3, 1, 7],
    ["gender", 24, 2, 0, 1, 0, 1],
    ["birthMonth", 24, 2, 1, 4, 0, 12],
    ["birthDay", 24, 2, 5, 5, 0, 31],
    ["favoriteColor", 24, 2, 10, 4, 0, 11],
    ["height", 46, 1, 0, 8, 0, 128],
    ["build", 47, 1, 0, 8, 0, 128],
    ["faceType", 48, 1, 1, 4, 0, 11],
    ["skinColor", 48, 1, 5, 3, 0, 7],
    ["wrinklesType", 49, 1, 0, 4, 0, 11],
    ["makeupType", 49, 1, 4, 4, 0, 11],
    ["hairType", 50, 1, 0, 8, 0, 131],
    ["hairColor", 51, 1, 0, 3, 0, 7],
    ["eyeType", 52, 4, 0, 6, 0, 59],
    ["eyeColor", 52, 4, 6, 3, 0, 5],
    ["eyeScale", 52, 4, 9, 4, 0, 7],
    ["eyeVerticalStretch", 52, 4, 13, 3, 0, 6],
    ["eyeRotation", 52, 4, 16, 5, 0, 7],
    ["eyeSpacing", 52, 4, 21, 4, 0, 12],
    ["eyeYPosition", 52, 4, 25, 5, 0, 18],
    ["eyebrowType", 56, 4, 0, 5, 0, 27],
    ["eyebrowColor", 56, 4, 5, 3, 0, 7],
    ["eyebrowScale", 56, 4, 8, 4, 0, 8],
    ["eyebrowVerticalStretch", 56, 4, 12, 3, 0, 6],
    ["eyebrowRotation", 56, 4, 16, 5, 0, 11],
    ["eyebrowSpacing", 56, 4, 21, 4, 0, 12],
    ["eyebrowYPosition", 56, 4, 25, 5, 3, 18],
    ["noseType", 60, 2, 0, 5, 0, 17],
    ["noseScale", 60, 2, 5, 4, 0, 8],
    ["noseYPosition", 60, 2, 9, 5, 0, 18],
    ["mouthType", 62, 2, 0, 6, 0, 35],
    ["mouthColor", 62, 2, 6, 3, 0, 4],
    ["mouthScale", 62, 2, 9, 4, 0, 8],
    ["mouthHorizontalStretch", 62, 2, 13, 3, 0, 6],
    ["mouthYPosition", 64, 1, 0, 5, 0, 18],
    ["mustacheType", 64, 1, 5, 3, 0, 5],
    ["beardType", 66, 2, 0, 3, 0, 5],
    ["facialHairColor", 66, 2, 3, 3, 0, 7],
    ["mustacheScale", 66, 2, 6, 4, 0, 8],
    ["mustacheYPosition", 66, 2, 10, 5, 0, 16],
    ["glassesType", 68, 2, 0, 4, 0, 8],
    ["glassesColor", 68, 2, 4, 3, 0, 5],
    ["glassesScale", 68, 2, 7, 4, 0, 7],
    ["glassesYPosition", 68, 2, 11, 5, 0, 20],
    ["moleScale", 70, 2, 1, 4, 0, 8],
    ["moleXPosition", 70, 2, 5, 5, 0, 16],
    ["moleYPosition", 70, 2, 10, 5, 0, 30]
  ];
  const champ = (d, [, off, larg, bit, n]) => {
    let v = 0;
    for (let i = larg - 1; i >= 0; i--) v = v * 256 + d[off + i];
    return Math.floor(v / 2 ** bit) % 2 ** n;
  };
  const JOURS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const INTERDITS = /* @__PURE__ */ new Set([37, 92]);
  const nomMauvais = (d, off) => {
    for (let i = 0; i < 10 && off + 2 * i + 1 < d.length; i++) {
      const k = d[off + 2 * i] | d[off + 2 * i + 1] << 8;
      if (!k) return false;
      if (INTERDITS.has(k)) return true;
    }
    return false;
  };
  const defauts = (d, complet = true) => {
    if (complet ? d.length !== TAILLE : d.length < SANS_AUTEUR || d.length > TAILLE) return [`${d.length} octets au lieu de ${complet ? 96 : "72 \xE0 96"} : ce n'est pas un Mii de la 3DS ou de la Wii U`];
    const l = [];
    for (const c of CHAMPS) {
      const v = champ(d, c);
      if (v < c[5] || v > c[6]) l.push(`${c[0]} = ${v} hors de la plage ${c[5]}-${c[6]}`);
    }
    const mois = champ(d, CHAMPS[4]), jour = champ(d, CHAMPS[5]);
    if (!mois !== !jour || mois && jour > JOURS[mois]) l.push(`anniversaire impossible (${jour}/${mois})`);
    if (!(d[26] | d[27])) l.push("surnom vide");
    if (nomMauvais(d, 26) || nomMauvais(d, 72)) l.push("\xAB % \xBB ou \xAB \\ \xBB dans un nom");
    if (!(d[12] & 128) && !(d[12] & 32) && !(d[48] & 1)) l.push(!(d[12] | d[13] | d[14] | d[15]) ? "Mii ID nul : poser l'identifiant de cr\xE9ation (createID) avant la conversion" : "Mii sp\xE9cial dont le partage n'est pas d\xE9sactiv\xE9");
    if (d.length === TAILLE && !crcBon(d)) l.push("CRC faux");
    return l;
  };
  const exiger = (d) => {
    const l = defauts(d);
    if (l.length) throw new Error("pcv-mii : Mii refus\xE9 : " + l.join(" ; "));
    return d;
  };
  const texte = (d, off) => {
    let s = "";
    for (let i = 0; i < 10 && off + 2 * i + 1 < d.length; i++) {
      const k = d[off + 2 * i] | d[off + 2 * i + 1] << 8;
      if (!k) break;
      s += String.fromCharCode(k);
    }
    return s;
  };
  const EPOQUE = Date.UTC(2010, 0, 1);
  const lecture = (d) => {
    const v = d[24] | d[25] << 8, id = (d[12] << 24 | d[13] << 16 | d[14] << 8 | d[15]) >>> 0;
    return {
      nom: texte(d, 26),
      sexe: v & 1,
      couleur: v >> 10 & 15,
      special: !(id >>> 31),
      createur: texte(d, 72),
      creeLe: new Date(EPOQUE + (id & 268435455) * 2e3).toISOString().slice(0, 19),
      cle: hexa(d.subarray(12, 22))
    };
  };
  const cleDe = (b) => hexa(deB64(b).subarray(12, 22));
  const nouvelId = (d, prises) => {
    const s = d.slice();
    let t = Math.floor((Date.now() - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4 - EPOQUE) / 2e3);
    do {
      t = t + 1 & 268435455;
      s[12] = (s[12] & 240 || 144) | t >>> 24;
      s[13] = t >>> 16 & 255;
      s[14] = t >>> 8 & 255;
      s[15] = t & 255;
    } while (prises.has(hexa(s.subarray(12, 22))));
    return poserCRC(s);
  };
  const lireLS = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const charger = () => {
    const b = lireLS(CLE, null), r = b && typeof b === "object" ? b : {};
    const mii = (Array.isArray(r.mii) ? r.mii : []).filter((e) => e && typeof e.id === "string" && typeof e.donnees === "string");
    return { ...r, version: VERSION, moi: mii.some((e) => e.id === r.moi) ? r.moi : null, mii };
  };
  const prevenir = (raison, id = null) => window.dispatchEvent(new CustomEvent("pcv-mii-base", { detail: { raison, id } }));
  const ecrire = (b, raison, id) => {
    try {
      localStorage.setItem(CLE, JSON.stringify(b));
    } catch (e) {
      console.warn("pcv-mii : stockage impossible", e);
      return false;
    }
    prevenir(raison, id);
    return true;
  };
  const ailleurs = (e) => {
    if (e.type !== "storage" || e.key === CLE) prevenir("ailleurs");
  };
  window.addEventListener("storage", ailleurs);
  window.addEventListener("pcv-mii", ailleurs);
  fins.push(() => {
    window.removeEventListener("storage", ailleurs);
    window.removeEventListener("pcv-mii", ailleurs);
  });
  const ORIGINES = { cree: "Cr\xE9\xE9 ici", "3ds-qr": "QR de la 3DS", "3ds-cfl": "Mii Maker de la 3DS", "3ds-recu": "Re\xE7u sur la 3DS", wiiu: "Wii U", fichier: "Fichier", infinimii: "InfiniMii" };
  const pantalon = (e, b) => e.id === b.moi ? "rouge" : lecture(deB64(e.donnees)).special ? "or" : e.origine === "3ds-recu" ? "bleu" : "gris";
  const publique = (e, b) => {
    const d = deB64(e.donnees), l = lecture(d);
    return {
      id: e.id,
      nom: l.nom,
      sexe: l.sexe,
      couleur: l.couleur,
      donnees: e.donnees,
      moi: e.id === b.moi,
      origine: e.origine || "cree",
      pantalon: pantalon(e, b),
      special: l.special,
      createur: l.createur,
      creeLe: l.creeLe,
      ajoute: e.cree ?? null,
      modifie: e.modifie ?? null,
      retouche: !!e.original && e.original !== e.donnees,
      partiel: !!e.partiel,
      source: e.source || null
    };
  };
  const nouvelleCle = () => "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const trouver = (b, id) => b.mii.find((e) => e.id === id) || null;
  const sourceSure = (s) => s && typeof s === "object" ? Object.fromEntries(["site", "mii", "nom", "auteur", "lien"].filter((k) => typeof s[k] === "string" && s[k]).map((k) => [k, s[k].slice(0, 120)])) : null;
  const ajouter = (donnees, origine = "cree", source = null) => {
    const d = exiger(versOctets(donnees)), d64 = b64(d), b = charger(), cle = hexa(d.subarray(12, 22)), t = Date.now();
    const meme = b.mii.find((e2) => e2.donnees === d64) || b.mii.find((e2) => cleDe(e2.donnees) === cle);
    if (meme) {
      if (meme.donnees !== d64) {
        meme.donnees = d64;
        meme.modifie = t;
        ecrire(b, "modif", meme.id);
      }
      return meme.id;
    }
    const e = { id: nouvelleCle(), donnees: d64, cree: t, modifie: t, origine: ORIGINES[origine] ? origine : "cree" };
    if (e.origine !== "cree") e.original = d64;
    const s = sourceSure(source);
    if (s && Object.keys(s).length) e.source = s;
    b.mii.push(e);
    ecrire(b, "ajout", e.id);
    return e.id;
  };
  const modifier = (id, donnees) => {
    const d = exiger(versOctets(donnees)), b = charger(), e = trouver(b, id);
    if (!e) throw new Error("pcv-mii : Mii inconnu " + id);
    e.donnees = b64(d);
    e.modifie = Date.now();
    ecrire(b, "modif", id);
    return id;
  };
  const retablir = (id) => {
    const b = charger(), e = trouver(b, id);
    if (!e?.original || e.original === e.donnees) return false;
    e.donnees = e.original;
    e.modifie = Date.now();
    ecrire(b, "retabli", id);
    return true;
  };
  const copier = (id) => {
    const b = charger(), e = trouver(b, id);
    if (!e) return null;
    const t = Date.now();
    const c = { id: nouvelleCle(), donnees: b64(nouvelId(deB64(e.donnees), new Set(b.mii.map((x) => cleDe(x.donnees))))), cree: t, modifie: t, origine: "cree", source: { copieDe: id } };
    b.mii.splice(b.mii.indexOf(e) + 1, 0, c);
    ecrire(b, "copie", c.id);
    return c.id;
  };
  const supprimer = (id) => {
    const b = charger(), i = b.mii.findIndex((e2) => e2.id === id);
    if (i < 0) return false;
    const [e] = b.mii.splice(i, 1);
    if (b.moi === id) b.moi = null;
    if ((e.origine || "cree") !== "cree") {
      const o = new Set(lireLS(CLE_OUBLIES, []));
      o.add(cleDe(e.original || e.donnees));
      try {
        localStorage.setItem(CLE_OUBLIES, JSON.stringify([...o]));
      } catch (err) {
      }
    }
    ecrire(b, "suppression", id);
    return true;
  };
  const definirMoi = (id) => {
    const b = charger();
    if (id != null && !trouver(b, id)) return false;
    b.moi = id ?? null;
    ecrire(b, "moi", b.moi);
    return true;
  };
  const origineDe = (f) => {
    const n = f.source?.nature || "", s = f.source?.section || "";
    return /FFL_ODB|Wii U/i.test(n) ? "wiiu" : /CFL_DB/.test(n) ? /CFOG|Mii Maker/.test(s) ? "3ds-cfl" : "3ds-recu" : /QR/.test(n) ? "3ds-qr" : "fichier";
  };
  const importerFiches = (fiches, meta = {}, b = charger(), bilan = { ajoutes: 0, mis_a_jour: 0, deja: 0, oublies: 0, refuses: 0, moi: null, fichiers: 0, erreurs: [] }) => {
    const oublies = new Set(lireLS(CLE_OUBLIES, [])), avant = oublies.size;
    for (const f of [].concat(fiches ?? [])) {
      if (!f || typeof f !== "object" || !/^pcv-mii-\d+$/.test(f._format || "")) continue;
      const brut = f.donnees_3ds?.hex || f.donnees_3ds?.base64 || f.donnees_partielles_hex, qui = `${meta.fichier || "?"} \xAB ${f.nom ?? "?"} \xBB`;
      let d;
      try {
        d = versOctets(brut);
      } catch (e2) {
        d = new Uint8Array(0);
      }
      const l = defauts(d, false);
      if (l.length) {
        bilan.refuses++;
        bilan.erreurs.push(`${qui} : ${l.join(" ; ")}`);
        continue;
      }
      const partiel = d.length !== TAILLE;
      if (partiel) d = completer(d);
      const d64 = b64(d), cle = hexa(d.subarray(12, 22));
      if (oublies.has(cle)) {
        if (!meta.tout) {
          bilan.oublies++;
          continue;
        }
        oublies.delete(cle);
      }
      const origine = origineDe(f), source = { fichier: meta.fichier || null, nature: f.source?.nature || null, section: f.source?.section || null, entree: f.source?.entree ?? null };
      const deja = b.mii.find((e2) => e2.donnees === d64 || e2.original === d64) || b.mii.find((e2) => (e2.origine || "cree") !== "cree" && cleDe(e2.original || e2.donnees) === cle);
      let e = deja;
      if (deja) {
        const retouche = deja.original && deja.original !== deja.donnees;
        if (deja.original !== d64 && deja.donnees !== d64 && !(partiel && !deja.partiel) && !retouche) {
          deja.donnees = deja.original = d64;
          deja.modifie = Date.now();
          deja.source = source;
          if (!partiel) delete deja.partiel;
          bilan.mis_a_jour++;
        } else if (origine === "3ds-cfl" && /^3ds-(recu|qr)$/.test(deja.origine)) bilan.mis_a_jour++;
        else bilan.deja++;
        if (origine === "3ds-cfl" && /^3ds-(recu|qr)$/.test(deja.origine)) {
          deja.origine = origine;
          deja.source = source;
        }
      } else {
        const t = Date.now();
        e = { id: nouvelleCle(), donnees: d64, original: d64, cree: t, modifie: t, origine, source };
        if (partiel) e.partiel = true;
        b.mii.push(e);
        bilan.ajoutes++;
      }
      if (f.source?.mii_personnel_probable && !b.moi) {
        b.moi = e.id;
        bilan.moi = e.id;
      }
    }
    if (oublies.size !== avant) try {
      localStorage.setItem(CLE_OUBLIES, JSON.stringify([...oublies]));
    } catch (e) {
    }
    return bilan;
  };
  const enTexte = (x) => typeof x === "string" ? x : new TextDecoder().decode(x);
  const STEAM = {
    liste: (dossier) => window.__pcvListe ? window.__pcvListe(dossier) : Promise.reject(new Error("sons.js absent (__pcvListe)")),
    lire: async (chemin) => {
      const u = await window.__pcvRessource?.(chemin, "application/json");
      if (!u) throw new Error("illisible : prive/" + chemin);
      try {
        return await (await fetch(u)).text();
      } finally {
        URL.revokeObjectURL(u);
        if (window.__pcvBlobs?.[chemin] === u) delete window.__pcvBlobs[chemin];
      }
    }
  };
  const DOSSIERS = ["mii", "mii/cfl_db"], HORS = /* @__PURE__ */ new Set(["index.json", "palettes.json", "PROVENANCE.json"]);
  let enCours = null;
  const importer = (o = {}) => enCours ||= (async () => {
    const liste = o.liste || STEAM.liste, lire = o.lire || STEAM.lire, b = charger();
    const bilan = { ajoutes: 0, mis_a_jour: 0, deja: 0, oublies: 0, refuses: 0, moi: null, fichiers: 0, erreurs: [] };
    for (const dossier of DOSSIERS) {
      let noms = [];
      try {
        noms = await liste(dossier) || [];
      } catch (e) {
        bilan.erreurs.push(`${dossier} : ${e.message || e}`);
      }
      for (const n of noms) {
        if (!/\.json$/i.test(n) || HORS.has(n)) continue;
        const chemin = dossier + "/" + n;
        try {
          importerFiches(JSON.parse(enTexte(await lire(chemin))), { fichier: chemin, tout: o.tout }, b, bilan);
          bilan.fichiers++;
        } catch (e) {
          bilan.erreurs.push(`${chemin} : ${e.message || e}`);
        }
      }
    }
    if (bilan.ajoutes || bilan.mis_a_jour || bilan.moi) ecrire(b, "import", null);
    return bilan;
  })().finally(() => {
    enCours = null;
  });
  window.__pcvMiiBase = {
    version: VERSION,
    cle: CLE,
    ORIGINES,
    liste: () => {
      const b = charger();
      return [...b.mii].sort((x, y) => (y.id === b.moi) - (x.id === b.moi)).map((e) => publique(e, b));
    },
    get: (id) => {
      const b = charger(), e = trouver(b, id);
      return e ? publique(e, b) : null;
    },
    moi: () => {
      const b = charger(), e = trouver(b, b.moi);
      return e ? publique(e, b) : null;
    },
    octets: (id) => {
      const e = trouver(charger(), id);
      return e ? deB64(e.donnees) : null;
    },
    original: (id) => {
      const e = trouver(charger(), id);
      return e ? deB64(e.original || e.donnees) : null;
    },
    pantalon: (id) => {
      const b = charger(), e = trouver(b, id);
      return e ? pantalon(e, b) : null;
    },
    valider: (donnees) => {
      try {
        return defauts(versOctets(donnees));
      } catch (e) {
        return ["donn\xE9es illisibles"];
      }
    },
    ajouter,
    modifier,
    retablir,
    copier,
    supprimer,
    definirMoi,
    importer,
    importerFiches: (fiches, meta = {}) => {
      const b = charger(), bilan = importerFiches(fiches, meta, b);
      if (bilan.ajoutes || bilan.mis_a_jour || bilan.moi) ecrire(b, "import", null);
      return bilan;
    }
  };
  if (window.opener?.SteamClient && window.__pcvMiiBaseImporte !== "fait") {
    let essais = 0;
    const auto = () => {
      if (!window.__pcvListe) {
        if (++essais < 20) window.__pcvMiiBaseAttente = setTimeout(auto, 1500);
        return;
      }
      window.__pcvMiiBaseImporte = "fait";
      importer().then((r) => (r.ajoutes || r.mis_a_jour) && console.info("pcv-mii : import", r));
    };
    window.__pcvMiiBaseAttente = setTimeout(auto, 2e3);
    fins.push(() => clearTimeout(window.__pcvMiiBaseAttente));
  }
  return `gestionnaire des Mii : ${charger().mii.length} Mii`;
})();
