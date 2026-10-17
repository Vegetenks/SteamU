(() => {
  window.__pcvThemesFin?.();
  const Tr = window.__pcvT || ((c) => c);
  const fins = [];
  window.__pcvThemesFin = () => {
    fins.splice(0).forEach((f) => {
      try {
        f();
      } catch (e) {
      }
    });
  };
  const O = window.opener || window;
  const lire = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const ecrire = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
    }
  };
  const U = (n) => `calc(var(--u) * ${+n.toFixed(2)})`;
  const son = (n) => window.__pcvSon?.(n);
  const echap = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const icoSuppr = () => `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="width:60%;height:60%">${window.__pcvIcones?.trace("supprimer") || ""}</svg>`;
  const SYMBOLES = {
    manette: "M6 9h12a5 5 0 0 1 4.8 6.3l-.8 3a2.5 2.5 0 0 1-4.3 1L16 17H8l-1.7 2.3a2.5 2.5 0 0 1-4.3-1l-.8-3A5 5 0 0 1 6 9z",
    sac: "M5 8h14l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20.5zM8.6 8V6.6a3.4 3.4 0 0 1 6.8 0V8h-1.8V6.6a1.6 1.6 0 0 0-3.2 0V8z",
    personnes: "M9 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM2.5 20.5a6.5 6.5 0 0 1 13 0zM16.5 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM17 13.2a5.5 5.5 0 0 1 4.5 7.3h-4.4a8.4 8.4 0 0 0-2.5-6.8 5.4 5.4 0 0 1 2.4-.5z",
    reponse: "M14 4l-7 8 7 8v-4.5c4 0 6.5 1.5 8 4.5-.5-5.5-3.5-9-8-9.5z",
    bulle: "M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8.5L7 21v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    alerte: "M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8.5L7 21v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM11 6.6h2v5.6h-2zm0 7h2v2h-2z",
    etoile: "M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z",
    note: "M9 5.5 20 3v12.2a3 3 0 1 1-2-2.8V7.3l-7 1.6v8.3a3 3 0 1 1-2-2.8z",
    rond: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
    coeur: "M12 20.5S3.5 15.4 2.6 10C2 6.6 4.2 4 7.2 4c2 0 3.6 1.1 4.8 2.9C13.2 5.1 14.8 4 16.8 4c3 0 5.2 2.6 4.6 6-.9 5.4-9.4 10.5-9.4 10.5z",
    piece: "M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM12 4.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8zM12 5.9a6.1 6.1 0 1 0 0 12.2 6.1 6.1 0 0 0 0-12.2z",
    etiquette: "M3 12.6V4.5A1.5 1.5 0 0 1 4.5 3h8.1l8.4 8.4-9.6 9.6zM7.5 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
    sourire: "M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM8.6 8.3a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zm6.8 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zM7.2 13.4h9.6a4.8 4.8 0 0 1-9.6 0z",
    cloche: "M12 2.8a1.4 1.4 0 0 1 1.4 1.4v.6a6.2 6.2 0 0 1 4.8 6.2v4.2l1.8 2.4H4l1.8-2.4V11a6.2 6.2 0 0 1 4.8-6.2v-.6A1.4 1.4 0 0 1 12 2.8zM9.8 19.2h4.4a2.2 2.2 0 0 1-4.4 0z",
    enveloppe: "M3.5 5.5h17A1.5 1.5 0 0 1 22 7v10a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17V7a1.5 1.5 0 0 1 1.5-1.5zM4 7.6v1l8 5.4 8-5.4v-1l-8 5.2z",
    cle: "M14.7 3.3a5 5 0 0 0-5.4 6.6L3.4 15.8a2 2 0 0 0 2.8 2.8l5.9-5.9a5 5 0 0 0 6.6-5.4l-3 3-2.8-.6-.6-2.8z",
    curseurs: "M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3zM14 4.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6zM8 9.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6zM16 14.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z",
    tete: "M12 3c4.4 0 7.5 3.2 7.5 7.6 0 4.9-3.4 8.9-7.5 8.9s-7.5-4-7.5-8.9C4.5 6.2 7.6 3 12 3zM9.3 9.6a1.1 1.4 0 1 0 0 2.8 1.1 1.4 0 0 0 0-2.8zm5.4 0a1.1 1.4 0 1 0 0 2.8 1.1 1.4 0 0 0 0-2.8zM9.4 14.6c1.5 1.3 3.7 1.3 5.2 0l.7.8c-1.9 1.8-4.7 1.8-6.6 0z",
    appareil: "M4 7h3.2l1.6-2.2h6.4L16.8 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM12 9.3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    photo: "M3 5h18v14H3zM5 7v10h14V7zM6.5 15.5l3.3-4.3 2.4 2.9 2.6-3.4 2.7 4.8zM8.4 8.3a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z",
    etincelle: "M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z",
    pinceau: "M19.5 3.2a1.3 1.3 0 0 1 1.8 1.8l-8.2 9.2-2.8-2.8zM9.4 12.5l2.6 2.6c-.3 2.9-2.4 5.2-6.9 5.6.9-1.2 1.1-2.5 1.2-3.8.1-2.4 1.4-4.1 3.1-4.4z",
    palette: "M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.7-1.3-.7-2.1 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3zM7.5 9.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zM11 5.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zm4.6 1.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z",
    goutte: "M12 2.5s6.5 7.2 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 9.7 12 2.5 12 2.5z",
    badge: "M12 2.5a6.8 6.8 0 1 1 0 13.6 6.8 6.8 0 0 1 0-13.6zM8.3 15.6 6.8 21.5l5.2-2.6 5.2 2.6-1.5-5.9a8.4 8.4 0 0 1-7.4 0z",
    disque: "M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM12 9.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2z",
    cartouche: "M6 3h9l3 3v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM7.5 11.5h9v7h-9z",
    play: "M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM10 7.8v8.4l6.4-4.2z",
    trophee: "M7 3h10v2h3.5v2.2a4.5 4.5 0 0 1-4.1 4.4 5 5 0 0 1-3.4 2.8V17h3v3.5H8V17h3v-2.6a5 5 0 0 1-3.4-2.8A4.5 4.5 0 0 1 3.5 7.2V5H7zM5.4 7v.2a2.6 2.6 0 0 0 1.7 2.4A8 8 0 0 1 7 8.3V7zM18.6 7H17v1.3a8 8 0 0 1-.1 1.3 2.6 2.6 0 0 0 1.7-2.4z",
    feuille: "M20 4c-9.5 0-15 4.5-15 11 0 1.4.3 2.7.9 3.8L4 21l1.4 1.2 2-2.2c1.2.7 2.6 1 4.1 1 6.4 0 8.5-7.8 8.5-17z",
    lune: "M15.5 3a8.5 8.5 0 1 0 5.5 14.8A9 9 0 0 1 15.5 3z",
    luigi: "M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM9.2 6.8h2.6v7.4h4.4v2.6h-7z",
    maison: "M12 3.2 2.5 11.3h2.7V20h5.3v-5.5h3V20h5.3v-8.7h2.7z",
    fantome: "M12 3a7 7 0 0 1 7 7v10.5l-2.3-1.8-2.4 1.8-2.3-1.8-2.3 1.8-2.4-1.8L5 20.5V10a7 7 0 0 1 7-7zM9.5 8.6a1.3 1.6 0 1 0 0 3.2 1.3 1.6 0 0 0 0-3.2zm5 0a1.3 1.6 0 1 0 0 3.2 1.3 1.6 0 0 0 0-3.2z",
    eclair: "M13.5 2 4.5 13.5h6L9.5 22l9-11.5h-6z"
  };
  SYMBOLES.engrenage = (() => {
    let d = "";
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * 2 * Math.PI;
      for (const [r, da] of [[7.8, -0.3], [10.4, -0.17], [10.4, 0.17], [7.8, 0.3]]) d += (d ? "L" : "M") + (12 + r * Math.cos(a + da)).toFixed(2) + " " + (12 + r * Math.sin(a + da)).toFixed(2);
    }
    return d + "zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z";
  })();
  SYMBOLES.fleur = (() => {
    let d = "";
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * 2 * Math.PI - Math.PI / 2, x = 12 + 5.4 * Math.cos(a), y = 12 + 5.4 * Math.sin(a);
      d += `M${x.toFixed(2)} ${(y - 4.2).toFixed(2)}a4.2 4.2 0 1 0 .01 0z`;
    }
    return d + "M12 9.2a2.8 2.8 0 1 0 .01 0z";
  })();
  const PLEIN = /* @__PURE__ */ new Set(["fleur"]);
  const ESPACES = {
    accueil: { nom: Tr("spaces.accueil.nom"), hotes: ["pcv-console", "pcv-accueil"], pages: ["accueil"] },
    bibliotheque: { nom: Tr("spaces.bibliotheque.nom"), pages: ["bibliotheque", "telechargements", "recherche"], symboles: ["cartouche", "disque", "manette", "etoile"] },
    fiche: { nom: Tr("spaces.fiche.nom"), pages: ["fiche", "succes"], symboles: ["play", "trophee", "etoile", "manette"] },
    parametres: { nom: Tr("spaces.parametres.nom"), pages: ["parametres", "couleurs", "manette", "clavier", "configurateur", "apropos"], symboles: ["engrenage", "cle", "curseurs"] },
    boutique: { nom: Tr("spaces.boutique.nom"), pages: ["magasin", "web", "atelier"], symboles: ["sac", "piece", "etiquette", "etoile"] },
    amis: { nom: Tr("spaces.amis.nom"), pages: ["amis", "invitations"], hotes: ["pcv-amis"], symboles: ["sourire", "personnes", "coeur"] },
    notifs: { nom: Tr("spaces.notifs.nom"), hotes: ["pcv-notifs"], symboles: ["cloche", "alerte", "enveloppe"] },
    profil: { nom: Tr("spaces.profil.nom"), hotes: ["pcv-profil"], symboles: ["tete", "etoile", "coeur"] },
    medias: { nom: Tr("spaces.medias.nom"), pages: ["medias"], symboles: ["appareil", "photo", "etincelle"] },
    place: { nom: Tr("spaces.place.nom"), hotes: ["pcv-place"], symboles: ["tete", "bulle", "coeur"] },
    themes: { nom: Tr("spaces.themes.nom"), hotes: ["pcv-themes"], symboles: ["pinceau", "palette", "goutte", "etoile"] },
    badges: { nom: Tr("spaces.badges.nom"), hotes: ["pcv-badges"], symboles: ["badge", "etoile", "piece", "etincelle"] }
  };
  const espaceDePage = (p) => Object.keys(ESPACES).find((e) => ESPACES[e].pages?.includes(p));
  const P = (fond, motif, texture) => ({ fond: fond.split(" "), motif, texture: texture ? texture.split(" ") : null });
  const FAMILLES = {
    // Wii U : blanc nacré, symboles de verre flous ; chaque application garde une pointe de sa couleur
    wiiu: {
      nom: Tr("families.wiiu.nom"),
      style: "verre",
      verre: ["#ffffff", "#f1f5fa"],
      ombre: "0 8px 22px rgb(from var(--pcv-ombre-c) r g b / .16)",
      symboles: ["manette", "sac", "personnes", "reponse", "bulle", "etoile", "note", "disque"],
      apps: {
        bibliotheque: P("#fbfcfd #f0f3f6 #e0e6ec", "#a9b8c7"),
        fiche: P("#fbfdfe #edf4f8 #d9e7f0", "#9dbbd0"),
        parametres: P("#f8fbfe #e7f0f8 #cfdfee", "#93afc9"),
        boutique: P("#fffcf7 #fdf0e0 #f7d9b6", "#e6a76a"),
        // eShop : orange
        amis: P("#fffdf5 #fcf2da #f5dda9", "#d9a94f"),
        notifs: P("#f7fcfe #e3f4fa #c6e6f2", "#6fb8d3"),
        // liste d'amis : orangé ; notifications : bleu Wii U
        profil: P("#f9fdfa #e9f6ee #cdebd8", "#87c39c"),
        medias: P("#fafbfe #ecf0fa #d5dbf2", "#97a2d2"),
        // Mii Maker / Miiverse : vert ; album : bleu
        place: P("#fbfdff #e9f3fc #d1e5f7", "#8fb8de"),
        themes: P("#fffafc #fbe9f1 #f3cddd", "#de90b3"),
        // place : ciel ; boutique de thèmes : rose
        badges: P("#fffcf2 #fff0d8 #ffd8e4", "#eb9fb3")
        // Badge Arcade : rose et jaune
      }
    },
    // 3DS : aplats, petites textures et symboles nets qui défilent lentement (comme les thèmes du menu HOME)
    "3ds": {
      nom: Tr("families.ds3.nom"),
      style: "plat",
      verre: ["#ffffff", "#f2f3f5"],
      ombre: "0 6px 14px rgb(from var(--pcv-ombre-c) r g b / .2)",
      symboles: ["cartouche", "etoile", "note", "manette"],
      apps: {
        bibliotheque: P("#f8f9fa #eceff2", "#d3dae1", "grille #e4e8ec"),
        fiche: P("#ffffff #edf0f3", "#d5dce4", "rayures #f3f5f7"),
        parametres: P("#f6f7f8 #e8ebee", "#c6d0da", "rayures #eef1f4"),
        boutique: P("#fffaf2 #ffeedb", "#ffc28a", "rayures #fff3e5"),
        amis: P("#fff9ee #ffedd3", "#ffbd6c", "vichy #ffe5c0"),
        notifs: P("#f4fbf4 #e2f4e3", "#9fd7a5", "rayures #ecf8ed"),
        profil: P("#fffef4 #f6f5e2", "#d8d3a0", "pois #efedcf"),
        medias: P("#f6f8fb #e7ebf3", "#b8c3d9", "grille #e2e7f0"),
        place: P("#eef8ff #ddf1d6", "#a3d196", "pois #e5f4df"),
        themes: P("#fff6fa #ffe6ef", "#ff9fc4", "pois #ffe1ed"),
        badges: P("#fff9e9 #ffe5ee", "#ffafc8", "rayures #fff3cc")
      }
    }
  };
  const THEMES = [
    { id: "verre", ambiance: 1, cat: "wiiu", nom: Tr("themes.verre.nom"), sous: Tr("themes.verre.sous"), accent: "#2fb8ff", fond: P("#fcfdfc #f3f5f3 #e7ebe8", "#b9c5be") },
    { id: "wiiu-ciel", ambiance: 2, cat: "wiiu", nom: Tr("themes.ciel.nom"), sous: Tr("themes.ciel.sous"), accent: "#1fa2e6", fond: P("#f7fbff #e2effb #c8def3", "#9cc1e2"), symboles: ["tete", "bulle", "coeur", "etoile", "reponse"] },
    { id: "wiiu-miiverse", ambiance: 2, cat: "wiiu", nom: Tr("themes.miiverse.nom"), sous: Tr("themes.miiverse.sous"), accent: "#3fb53a", fond: P("#f9fdf6 #e7f5e0 #cce8bf", "#9fcf90"), symboles: ["bulle", "coeur", "tete", "etoile", "reponse"] },
    { id: "wiiu-peche", ambiance: 1, cat: "wiiu", nom: Tr("themes.peche.nom"), sous: Tr("themes.peche.sous"), accent: "#ff8a5c", fond: P("#fffaf6 #fdeadf #f5cdb8", "#e4a48a"), verre: ["#ffffff", "#fdf2ec"] },
    { id: "wiiu-deluxe", ambiance: 3, cat: "wiiu", nom: Tr("themes.deluxe.nom"), sous: Tr("themes.deluxe.sous"), accent: "#2fb8ff", sombre: true, fond: P("#4b5363 #2e3440 #1a1e26", "#7d889b") },
    { id: "3ds-blanc", ambiance: 4, cat: "3ds", nom: Tr("themes.blanc.nom"), sous: Tr("themes.blanc.sous"), accent: "#1a9fe0", fond: P("#ffffff #eceff1", "#d6dce2", "grille #e5e9ec") },
    { id: "3ds-aqua", ambiance: 4, cat: "3ds", nom: Tr("themes.aqua.nom"), sous: Tr("themes.aqua.sous"), accent: "#13a3c6", fond: P("#eefafd #d5f0f6", "#8fd2e2", "vichy #c8e9f1"), symboles: ["etoile", "coeur", "note"] },
    { id: "3ds-rouge", ambiance: 4, cat: "3ds", nom: Tr("themes.rouge.nom"), sous: Tr("themes.rouge.sous"), accent: "#e5393f", fond: P("#ffeeed #ffd3d0", "#ff9c96", "rayures #ffe3e1"), symboles: ["etoile", "manette", "note"] },
    { id: "rose", ambiance: 5, cat: "3ds", nom: Tr("themes.rose.nom"), sous: Tr("themes.rose.sous"), accent: "#ff5f95", fond: P("#ffe4ed #ffc9db", "#ffffff", "pois #fff2f6"), symboles: ["coeur", "etoile"], verre: ["#ffffff", "#fff1f6"] },
    { id: "herbe", ambiance: 5, cat: "3ds", nom: Tr("themes.herbe.nom"), sous: Tr("themes.herbe.sous"), accent: "#2fae6c", fond: P("#d8f1d4 #abddaf", "#ffffff", "pois #e9f7e5"), symboles: ["fleur", "feuille"], verre: ["#fffef8", "#f1f7e9"] },
    { id: "3ds-spectres", ambiance: 3, cat: "3ds", nom: Tr("themes.spectres.nom"), sous: Tr("themes.spectres.sous"), accent: "#7d55e8", accent2: "#33cbbb", illustration: "spectres", fond: P("#6a55c4 #4a3a9e", "#b9a8f5") },
    { id: "3ds-jardin", ambiance: 5, cat: "3ds", nom: Tr("themes.jardin.nom"), sous: Tr("themes.jardin.sous"), accent: "#2f9e4f", accent2: "#ff8fb2", illustration: "jardin", fond: P("#b6e39f #7cc56e", "#ffffff") },
    { id: "luigi", ambiance: 5, cat: "3ds", nom: Tr("themes.luigi.nom"), sous: Tr("themes.luigi.sous"), accent: "#1f7a2e", fond: P("#86d18c #62bb6b", "#ffffff", "pois #95d79a"), symboles: ["luigi"] },
    { id: "bois", ambiance: 3, cat: "couleurs", partout: true, style: "plat", nom: Tr("themes.bois.nom"), sous: Tr("themes.bois.sous"), accent: "#e48a1a", fond: P("#ddb079 #c79358", "#efd2a6", "planches #b9844c"), symboles: ["feuille", "maison"], verre: ["#fffaf0", "#f3e4c8"] },
    {
      id: "nuit",
      ambiance: 3,
      cat: "couleurs",
      partout: true,
      style: "verre",
      nom: Tr("themes.nuit.nom"),
      sous: Tr("themes.nuit.sous"),
      accent: "#8a63ff",
      sombre: true,
      fond: P("#3b4560 #262d3d #161a24", "#a3aee6", "etoiles #ffffff"),
      clair: P("#efeef8 #dedff1 #c7c9e6", "#a3a8db", "etoiles #ffffff"),
      symboles: ["etoile", "lune", "etincelle"],
      verre: ["#ffffff", "#eef0f9"]
    },
    { id: "ocean", ambiance: 2, cat: "couleurs", partout: true, style: "verre", nom: Tr("themes.ocean.nom"), sous: Tr("themes.ocean.sous"), accent: "#1f9bd1", fond: P("#f2fbff #d5eef9 #b3dff2", "#79bfdf", "bulles #ffffff"), symboles: ["goutte", "rond", "etoile"], verre: ["#ffffff", "#eef7fc"] },
    { id: "citron", ambiance: 5, cat: "couleurs", partout: true, style: "plat", nom: Tr("themes.citron.nom"), sous: Tr("themes.citron.sous"), accent: "#e09d00", fond: P("#fffbe4 #fff0b5", "#ffd955", "pois #fff6cd"), symboles: ["etoile", "rond"], verre: ["#fffffb", "#fbf6e0"] },
    { id: "lavande", ambiance: 1, cat: "couleurs", partout: true, style: "verre", nom: Tr("themes.lavande.nom"), sous: Tr("themes.lavande.sous"), accent: "#9a6cf0", fond: P("#fcf9ff #eee7fc #dbcdf6", "#b39ee4"), symboles: ["fleur", "etoile", "coeur"], verre: ["#ffffff", "#f5f1fd"] },
    { id: "menthe", ambiance: 4, cat: "couleurs", partout: true, style: "plat", nom: Tr("themes.menthe.nom"), sous: Tr("themes.menthe.sous"), accent: "#1fb38a", fond: P("#ecfbf4 #d2f2e4", "#91dabb", "vichy #c9efdd"), symboles: ["feuille", "etoile", "coeur"], verre: ["#ffffff", "#eefaf4"] }
  ];
  const familleDe = (t) => t.famille || (t.cat === "wiiu" ? "wiiu" : t.cat === "3ds" ? "3ds" : t.style === "plat" ? "3ds" : "wiiu");
  THEMES.forEach((t) => {
    t.famille = familleDe(t);
    t.style ||= FAMILLES[t.famille].style;
  });
  const CATS = [["wiiu", Tr("categories.wiiu")], ["3ds", Tr("categories.ds3")], ["couleurs", Tr("categories.couleurs")], ["fonds", Tr("categories.fonds")], ["importes", Tr("categories.importes")], ["themeplaza", Tr("categories.themeplaza")], ["tz-wiiu", Tr("categories.tz_wiiu")], ["tz-switch", Tr("categories.tz_switch")]];
  const urls = {};
  const TYPES = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", avif: "image/avif", mp3: "audio/mpeg", ogg: "audio/ogg", json: "application/json" };
  const typeDe = (c) => TYPES[c.split(".").pop().toLowerCase()] || "application/octet-stream";
  const enCharge = {};
  const urlDe = (chemin) => {
    if (!chemin) return Promise.resolve(null);
    if (urls[chemin]) return Promise.resolve(urls[chemin]);
    return enCharge[chemin] ||= Promise.resolve(window.__pcvRessource?.(chemin, typeDe(chemin))).then((x) => urls[chemin] = x || null).catch(() => null);
  };
  let pistes = null, mesFonds = [], importes = [];
  const joli = (n) => n.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());
  const accents = lire("pcv-fonds-accents", {});
  const secours = (f) => THEMES.find((t) => t.id === (f === "wiiu" ? "verre" : "3ds-blanc")).fond;
  const themeFond = (nom) => ({ id: "fond:" + nom, cat: "fonds", famille: "wiiu", style: "verre", nom: joli(nom), sous: "fond personnel", accent: accents[nom] || "#2fb8ff", image: "fonds/" + nom, fichier: nom, fond: secours("wiiu") });
  const couleurSure = (c, d) => typeof c === "string" && /^#[0-9a-f]{3,8}$/i.test(c) ? c : d;
  const fichierTz = (f) => typeof f === "string" && /^themezer\/[\w-]+\.(png|jpe?g|webp)$/i.test(f) ? "themes/" + f : void 0;
  const ICONES_THEME = ["parametres", "album", "boutique", "manette", "alimentation", "notifications", "dossier", "dossier-ouvert"];
  const fichierIc = (f) => typeof f === "string" && /^(themezer\/)?[\w-]+\.(png|jpe?g|webp)$/i.test(f) ? "themes/" + f : void 0;
  const iconesDe = (o) => Object.fromEntries(ICONES_THEME.filter((a) => fichierIc(o?.[a])).map((a) => [a, fichierIc(o[a])]));
  const themeImporte = (id, j = {}) => {
    const f = j.famille === "wiiu" ? "wiiu" : "3ds", tz = j.source === "Themezer";
    const auto = !couleurSure(j.accent);
    return {
      id: "importe:" + id,
      cat: "importes",
      famille: f,
      style: FAMILLES[f].style,
      nom: j.nom || joli(id),
      sous: j.sous || "th\xE8me import\xE9",
      accent: /^hsl\(\d{1,3} 72% 50%\)$/.test(accents["importe:" + id]) ? accents["importe:" + id] : couleurSure(j.accent, "#ff5f95"),
      // (la teinte tirée de l'image, une fois calculée, prime : curseur terne ou étranger) accentAuto: auto, accent2: couleurSure(j.accent2),
      // Themezer : fond « télé » (motif répété s'il l'est sur la Wii U) et fond « manette » (GamePad) gardés séparés, plaque
      // de verre sous la grille de l'accueil, icônes des applis (Switch)
      ...tz ? { tele: fichierTz(j.tele), teleMotif: !!j.teleMotif, manette: fichierTz(j.manette), plaque: true, sons: j.origine === "switch" ? "switch" : void 0 } : {},
      icones: iconesDe(j.icones),
      haut: j.haut && "themes/" + j.haut,
      bas: j.bas && "themes/" + j.bas,
      image: j.image && "themes/" + j.image,
      couleur: couleurSure(j.couleur),
      musiques: j.musique ? { accueil: "themes/" + j.musique } : {},
      verre: Array.isArray(j.verre) && j.verre.length === 2 && j.verre.every((c) => couleurSure(c)) ? j.verre : void 0,
      fond: secours(f)
    };
  };
  const lireImportes = async (noms) => {
    const groupes = {};
    for (const n of noms) {
      const m = n.match(/^(.+?)(?:-(haut|bas|apercu|dossier|dossier-ouvert))?\.([a-z0-9]+)$/i);
      if (m) (groupes[m[1]] ||= {})[(m[2] ? "-" + m[2] : "") + "." + m[3].toLowerCase()] = n;
    }
    const res = [];
    for (const [id, g] of Object.entries(groupes)) {
      let j = null;
      if (g[".json"]) try {
        j = JSON.parse(await (await fetch(await urlDe("themes/" + g[".json"]), { cache: "no-store" })).text());
      } catch (e) {
        j = null;
      }
      if (!j) {
        const im = (k) => ["png", "jpg", "jpeg", "webp"].map((x) => g[k + "." + x]).find(Boolean);
        j = { haut: im("-haut"), bas: im("-bas"), image: im(""), musique: g[".ogg"] || g[".mp3"] };
        if (!j.haut && !j.bas && !j.image && !j.musique) continue;
      }
      res.push(themeImporte(id, j));
    }
    return res;
  };
  const listes = window.__pcvThemesListes ||= { p: null };
  const charger = (forcer) => {
    if (!listes.p || forcer) listes.p = Promise.all(["fonds", "themes", "sons"].map((d) => Promise.resolve(window.__pcvListe?.(d)).then((x) => x || []).catch(() => []))).then(async ([f, th, s]) => ({ fonds: f, themes: await lireImportes(th), sons: s }));
    return listes.p.then((l) => {
      if (!l.sons.length) {
        if (listes.p) listes.p = null;
        if (!listes.relance && (listes.essais = (listes.essais || 0) + 1) <= 8)
          listes.relance = setTimeout(() => {
            listes.relance = 0;
            if (!fini) charger().then(() => musique());
          }, 1500 * listes.essais);
      } else listes.essais = 0;
      pistes = l.sons.length ? l.sons : null;
      mesFonds = l.fonds.filter((n) => /\.(jpe?g|png|webp|gif|avif)$/i.test(n)).map(themeFond);
      importes = l.themes;
      const voulu = lire("pcv-theme", "verre");
      if (courant && !essai && courant.id !== voulu && tous().some((t) => t.id === voulu)) appliquer(voulu);
      return l;
    });
  };
  const svgURI = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  const alea = (g) => () => (g = Math.imul(g, 1664525) + 1013904223 >>> 0) / 4294967296;
  const graine = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const TEXTURES = {
    // tuile de 240 : chaque période divise 240, la tuile se raccorde sans couture (étoiles et bulles : tirées au hasard, toute taille)
    pois: (c) => {
      let s = "";
      for (let y = 0; y < 240; y += 60) for (let x = 0; x < 240; x += 60) s += `<circle cx="${x + 15}" cy="${y + 15}" r="5.5"/><circle cx="${x + 45}" cy="${y + 45}" r="5.5"/>`;
      return `<g fill="${c}">${s}</g>`;
    },
    vichy: (c) => {
      let s = "";
      for (let k = 0; k < 240; k += 48) s += `<rect x="0" y="${k}" width="240" height="24"/><rect x="${k}" y="0" width="24" height="240"/>`;
      return `<g fill="${c}" fill-opacity=".5">${s}</g>`;
    },
    rayures: (c) => {
      let s = "";
      for (let k = -240; k < 480; k += 40) s += `M${k} 0h20l-240 240h-20z`;
      return `<path fill="${c}" d="${s}"/>`;
    },
    grille: (c) => {
      let s = "";
      for (let k = 20; k < 240; k += 40) s += `M${k} 0v240M0 ${k}h240`;
      return `<path stroke="${c}" stroke-width="2" fill="none" d="${s}"/>`;
    },
    planches: (c) => {
      let s = "";
      for (let k = 0; k < 240; k += 60) s += `<rect x="${k}" width="60" height="240" fill="${c}" fill-opacity="${k % 120 ? 0.28 : 0}"/><rect x="${k + 57}" width="3" height="240" fill="#7a4c22" fill-opacity=".22"/><path d="M${k + 18} 0c4 60-4 120 2 240M${k + 38} 0c-5 80 5 150-1 240" stroke="#7a4c22" stroke-opacity=".08" stroke-width="2" fill="none"/>`;
      return s;
    },
    etoiles: (c, r, l = 240, h = 240) => {
      let s = "";
      for (let i = 0; i < l * h / 2600; i++) s += `<circle cx="${(r() * l).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(0.7 + r() * 1.3).toFixed(1)}" fill-opacity="${(0.35 + r() * 0.55).toFixed(2)}"/>`;
      return `<g fill="${c}">${s}</g>`;
    },
    bulles: (c, r, l = 240, h = 240) => {
      let s = "";
      for (let i = 0; i < l * h / 9e3; i++) {
        const x = 20 + r() * (l - 40), y = 20 + r() * (h - 40), rr = 5 + r() * 10;
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}"/>`;
      }
      return `<g fill="${c}" fill-opacity=".18" stroke="${c}" stroke-opacity=".6" stroke-width="1.2">${s}</g>`;
    }
  };
  const tuile = (style2, pal, symboles, g, sombre) => {
    const r = alea(g), sy = symboles.length ? symboles : ["etoile"];
    const sym = (n2, x, y, s2, rot) => `<path fill-rule="${PLEIN.has(n2) ? "nonzero" : "evenodd"}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)} ${12 * s2} ${12 * s2}) scale(${s2.toFixed(2)})" d="${SYMBOLES[n2] || SYMBOLES.etoile}"/>`;
    const enSvg = (l, h, corps) => corps && `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${h}" viewBox="0 0 ${l} ${h}">${corps}</svg>`;
    if (style2 === "plat") {
      const tex2 = pal.texture && TEXTURES[pal.texture[0]] ? TEXTURES[pal.texture[0]](pal.texture[1], r) : "";
      const places = [[22, 20], [134, 64], [40, 138], [150, 166]].map(([x, y], i) => ({ n: sy[i % sy.length], x: x + r() * 14, y: y + r() * 10, s: 1.75 + r() * 0.45, rot: -18 + r() * 36 }));
      const s2 = places.map((p) => sym(p.n, p.x, p.y, p.s, p.rot)).join("");
      return { l: 240, h: 240, places, svg: enSvg(240, 240, `${tex2}<g fill="${pal.motif}" fill-opacity=".62">${s2}</g>`), texture: enSvg(240, 240, tex2) };
    }
    const tex = pal.texture && ["etoiles", "bulles"].includes(pal.texture[0]) ? TEXTURES[pal.texture[0]](pal.texture[1], r, 640, 480) : "";
    const vides = /* @__PURE__ */ new Set([Math.floor(r() * 12), Math.floor(r() * 12), Math.floor(r() * 12)]);
    let s = "", n = g % sy.length;
    for (let c = 0; c < 12; c++) if (!vides.has(c)) {
      const t = 2 + r() * 1.4;
      s += sym(sy[n++ % sy.length], c % 4 * 160 + 8 + r() * (150 - 24 * t), Math.floor(c / 4) * 160 + 8 + r() * (150 - 24 * t), t, -28 + r() * 56);
    }
    const b = [0, 1, 2, 3, 4].map(() => `<circle cx="${(20 + r() * 600).toFixed(0)}" cy="${(20 + r() * 440).toFixed(0)}" r="${(6 + r() * 10).toFixed(0)}"/>`).join("");
    return { l: 640, h: 480, texture: enSvg(640, 480, tex), svg: enSvg(640, 480, `<defs><filter id="f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.3"/></filter></defs>${tex}<g filter="url(#f)" opacity="${sombre ? 0.4 : 0.7}" fill="${pal.verre || "#fff"}" fill-opacity=".62" stroke="${pal.motif}" stroke-opacity=".75" stroke-width=".55">${s}${b}</g>`) };
  };
  const apparenceSombre = () => {
    const a = document.documentElement.dataset.pcvApparence;
    return a === "gris" || a === "noir" ? a : null;
  };
  const enHsl = (c) => {
    const q = /^hsl\(([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\)$/.exec(String(c).trim());
    if (q) return [+q[1], q[2] / 100, q[3] / 100];
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c).trim());
    if (!m) return null;
    const h = m[1].length === 3 ? [...m[1]].map((x) => x + x).join("") : m[1], [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const M = Math.max(r, g, b), n = Math.min(r, g, b), l = (M + n) / 2, d = M - n;
    let hu = 0;
    if (d) hu = M === r ? (g - b) / d % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(hu * 60 + 360) % 360, d ? d / (1 - Math.abs(2 * l - 1)) : 0, l];
  };
  const estFaible = (c) => {
    const x = enHsl(c);
    if (!x) return true;
    const [, s, l] = x;
    return l < 0.18 || s < 0.15;
  };
  const teinte = (c, l, smax) => {
    const x = enHsl(c);
    if (!x) return c;
    const s = Math.min(smax, x[1] < 0.08 ? x[1] : x[1] * 0.85 + 0.06);
    return `hsl(${x[0].toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(1)}%)`;
  };
  const PALETTE_SOMBRE = { gris: { fond: [0.2, 0.15, 0.105], motif: 0.42, texture: 0.27, verre: 0.3, smax: 0.5 }, noir: { fond: [0, 0, 0], motif: 0.24, texture: 0.1, verre: 0.14, smax: 0.55 } };
  const CONTRASTE_ACCENT = 3.6;
  const accentSombre = (c) => {
    const x = enHsl(c);
    if (!x) return c;
    const s = x[1] * 0.85;
    const lum = (l2) => {
      const k = s * Math.min(l2, 1 - l2), f = (n) => {
        const m = (n + x[0] / 30) % 12, v = l2 - k * Math.max(-1, Math.min(m - 3, 9 - m, 1));
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(0) + 0.7152 * f(8) + 0.0722 * f(4);
    };
    let l = Math.min(x[2], 0.5);
    while (l > 0.25 && 1.05 / (lum(l) + 0.05) < CONTRASTE_ACCENT) l -= 0.01;
    return `hsl(${x[0].toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%)`;
  };
  const sombrir = (pal, a) => {
    const k = PALETTE_SOMBRE[a];
    return {
      fond: pal.fond.map((c, i) => a === "noir" ? "#000" : teinte(c, k.fond[Math.min(i, 2)], k.smax)),
      motif: teinte(pal.motif, k.motif, k.smax),
      texture: pal.texture ? [pal.texture[0], teinte(pal.texture[1], k.texture, k.smax)] : null,
      verre: teinte(pal.motif, k.verre, k.smax),
      sombre: true
    };
  };
  const voileImage = (t, a) => {
    const c = teinte(t.accent || "#2fb8ff", a === "noir" ? 0.03 : 0.09, 0.45).replace(")", a === "noir" ? " / .9)" : " / .78)");
    return `linear-gradient(${c}, ${c})`;
  };
  const paletteDe = (t, e) => {
    const p = paletteClaire(t, e), a = apparenceSombre();
    return a ? sombrir(aImage(t) && e !== "accueil" ? { ...p, fond: t.fond.fond } : p, a) : p;
  };
  const paletteClaire = (t, e) => e === "accueil" ? t.fond : aImage(t) ? { fond: t.fond.fond.map((c) => `color-mix(in srgb, ${c} 28%, #fff)`), motif: t.accent2 || t.accent, texture: null } : t.partout ? t.clair || t.fond : FAMILLES[t.famille].apps[e] || FAMILLES[t.famille].apps.bibliotheque;
  const styleDe = (t, e) => e !== "accueil" && aImage(t) ? "verre" : e === "accueil" || t.partout ? t.style : FAMILLES[t.famille].style;
  const symbolesDe = (t, e) => e === "accueil" ? t.symboles || FAMILLES[t.famille].symboles : ESPACES[e].symboles;
  const sombreDe = (t, e) => !!apparenceSombre() || !!t.sombre && (e === "accueil" || !t.clair && t.partout);
  const aImage = (t) => !!(t.image || t.haut || t.bas || t.tele || t.manette || t.illustration);
  const fichiersImage = (t) => [t.image, t.haut, t.bas, t.tele, t.manette, ...Object.values(t.icones || {})].filter(Boolean);
  const img = (c) => c && (!anime() && fixes[c] || urls[c]) || null;
  const sourceAccueil = (t) => t.illustration ? illustration(t) : nets[t.id] || img(t.haut) || img(t.image) || img(t.tele) || img(t.manette) || img(t.bas);
  const sourceDouce = (t) => t.illustration ? illustration(t) : img(t.bas) || img(t.manette) || img(t.haut) || img(t.image) || img(t.tele);
  const plaqueDe = (t) => !t.plaque ? null : img(t.manette) ? `linear-gradient(rgba(255,255,255,.12), rgba(255,255,255,.12)), url("${img(t.manette)}") center / cover no-repeat` : typeof doux[t.id] === "string" ? "transparent" : null;
  const tuiles = /* @__PURE__ */ new Map();
  const fondsDe = (t, e, o = {}) => {
    const k = o.k || 1, fx = o.fixe === false ? "" : " fixed";
    if (e === "accueil" && aImage(t)) {
      const i = o.reduit ? reduits[t.id] : sourceAccueil(t), motif2 = !o.reduit && t.teleMotif && i === img(t.tele);
      const a = !o.reduit && apparenceSombre(), vl = a ? voileImage(t, a) + fx + ", " : "";
      const v = `${vl}${i ? `url("${i}") ${motif2 ? `0 0 / ${U(MOTIF_TELE * (o.k || 1))} auto repeat` : "center / cover no-repeat"}${fx}, ` : ""}${t.couleur || paletteDe(t, e).fond[1]}`;
      return { base: v, complet: v, style: "image" };
    }
    const pal = paletteDe(t, e), st = styleDe(t, e), cle = t.id + "|" + e;
    const cache = cle + "|" + t.famille + "|" + st + "|" + apparenceSombre();
    if (!tuiles.has(cache)) tuiles.set(cache, tuile(st, pal, symbolesDe(t, e), graine(cle), sombreDe(t, e)));
    const tu = tuiles.get(cache);
    tu.uri ||= svgURI(tu.svg);
    if (tu.texture) tu.uriTexture ||= svgURI(tu.texture);
    const taille = `0 0 / ${U(tu.l * k)} ${U(tu.h * k)} repeat${fx}`, motif = `${tu.uri} ${taille}`, texture = tu.texture ? `${tu.uriTexture} ${taille}, ` : "";
    const d = aImage(t) && typeof doux[t.id] === "string" ? doux[t.id] : null;
    const sa = apparenceSombre();
    const base = d ? `${sa ? voileImage(t, sa) : "linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,.36))"}${fx}, url("${d}") center / cover no-repeat${fx}, ${pal.fond[1]}` : st === "verre" ? `radial-gradient(120% 95% at 55% 42%, ${pal.fond[0]} 0%, ${pal.fond[1]} 50%, ${pal.fond[2] || pal.fond[1]} 100%)${fx}` : `linear-gradient(180deg, ${pal.fond[0]}, ${pal.fond[1]})${fx}`;
    return { base: texture + base, complet: `${motif}, ${base}`, tuile: tu, style: st, pal };
  };
  const doux = {}, sombres = {}, reduits = {}, prepares = {}, nets = {}, fixes = {};
  const MOTIF_TELE = 340;
  const NET_LARGEUR = 1600;
  const grossir = async (src) => {
    const im = await createImageBitmap(await (await fetch(src)).blob());
    try {
      if (im.width >= NET_LARGEUR / 2) return null;
      const k = Math.ceil(NET_LARGEUR / im.width), x = toile(im.width * k, im.height * k);
      x.imageSmoothingEnabled = false;
      x.drawImage(im, 0, 0, x.canvas.width, x.canvas.height);
      return await new Promise((ok) => x.canvas.toBlob((b) => ok(b ? URL.createObjectURL(b) : null), "image/png"));
    } finally {
      im.close();
    }
  };
  const appeler = (m, ...a) => {
    try {
      return (O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, m, ...a) ?? Promise.reject(new Error("Decky absent"));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const versionHD = async (t) => {
    const n = t.haut?.replace(/^themes\//, "");
    if (!n || n.includes("/")) return null;
    const hd = await appeler("theme_hd", n).catch(() => null);
    return typeof hd === "string" && /^hd\/[^/]+-hd\.png$/.test(hd) ? urlDe("themes/" + hd) : null;
  };
  let file = Promise.resolve();
  const toile = (l, h) => {
    const c = document.createElement("canvas");
    c.width = l;
    c.height = h;
    return c.getContext("2d", { willReadFrequently: true });
  };
  const couvrir = (x, im, marge = 1) => {
    const l = x.canvas.width, h = x.canvas.height, w = im.naturalWidth || im.width || l, hh = im.naturalHeight || im.height || h, s = Math.max(l / w, h / hh) * marge;
    x.drawImage(im, (l - w * s) / 2, (h - hh * s) / 2, w * s, hh * s);
  };
  const decoder = async (src, vecteur) => {
    if (!vecteur) try {
      return await createImageBitmap(await (await fetch(src)).blob(), { resizeWidth: 1024, resizeQuality: "medium" });
    } catch (e) {
    }
    const i = new Image();
    i.src = src;
    await i.decode();
    return i;
  };
  const enBlob = (x, q) => new Promise((ok) => x.canvas.toBlob((b) => ok(b ? URL.createObjectURL(b) : null), "image/jpeg", q));
  const traiterImages = async (t) => {
    await Promise.all(fichiersImage(t).map(urlDe));
    for (const c of [t.tele, t.manette]) if (c && /\.webp$/i.test(c) && urls[c] && !fixes[c]) try {
      const im = await createImageBitmap(await (await fetch(urls[c])).blob());
      const x = toile(im.width, im.height);
      x.drawImage(im, 0, 0);
      im.close();
      fixes[c] = await new Promise((ok) => x.canvas.toBlob((b2) => ok(b2 ? URL.createObjectURL(b2) : null), "image/png"));
    } catch (e) {
    }
    const sd = sourceDouce(t), sa = sourceAccueil(t), vecteur = !!t.illustration;
    let a = null, b = null;
    try {
      if (sd) {
        a = await decoder(sd, vecteur);
        const x = toile(480, 300);
        x.filter = "blur(10px)";
        couvrir(x, a, 1.12);
        x.filter = "none";
        try {
          const px = x.getImageData(0, 0, 480, 300).data;
          let l = 0;
          for (let p = 0; p < px.length; p += 400) l += px[p] * 0.3 + px[p + 1] * 0.59 + px[p + 2] * 0.11;
          sombres[t.id] = l / (px.length / 400) / 255 < 0.35;
        } catch (e) {
        }
        x.fillStyle = "#fff";
        x.globalAlpha = sombres[t.id] ? 0.72 : 0.22;
        x.fillRect(0, 0, 480, 300);
        if (sombres[t.id]) {
          x.fillStyle = t.accent;
          x.globalAlpha = 0.1;
          x.fillRect(0, 0, 480, 300);
        }
        doux[t.id] = await enBlob(x, 0.86);
      }
      if (sa && t.cat === "importes" && !vecteur) try {
        nets[t.id] = await versionHD(t) || await grossir(sa);
        if (nets[t.id]) reduits[t.id] = nets[t.id];
      } catch (e) {
      }
      if (sa && t.cat === "importes" && reduits[t.id] && !fini && !(accents[t.id] && !estFaible(accents[t.id]))) {
        b = sa === sd ? a : await decoder(sa, vecteur);
        if (t.accentAuto || estFaible(t.accent) || etrangere(t.accent, b)) accentDe(t, b);
      }
      if (sa && !reduits[t.id]) {
        b = sa === sd ? a : await decoder(sa, vecteur);
        const x = toile(800, 500);
        couvrir(x, b);
        reduits[t.id] = await enBlob(x, 0.85);
        const cle = t.fichier || t.id, dejaBon = accents[cle] && !estFaible(accents[cle]);
        if ((t.fichier || t.accentAuto || estFaible(t.accent) || t.cat === "importes" && etrangere(t.accent, b)) && !dejaBon && !fini) accentDe(t, b);
      }
    } catch (e) {
    } finally {
      a?.close?.();
      if (b !== a) b?.close?.();
    }
    if (doux[t.id] === void 0) doux[t.id] = null;
  };
  let fini = false;
  fins.push(() => {
    fini = true;
  });
  const chargerImages = (t) => prepares[t.id] ||= file = file.then(() => fini || traiterImages(t)).catch(() => {
  });
  const ILLUSTRATIONS = {
    spectres: {
      fond: ["#5a46b4", "#3c2c8c"],
      taches: ["#8b74e6", "#47c9c0", "#c98ee6", "#2e2378"],
      trait: "#241a62",
      couleurs: ["#9f8cf0", "#55dccb", "#f4a8d8", "#c5b6fa", "#ffe3a3", "#7b64d8"],
      symboles: ["fantome", "lune", "etoile", "fleur", "eclair", "coeur", "fantome", "goutte"],
      petits: ["etincelle", "etoile", "coeur"],
      clair: "#fff2c4"
    },
    jardin: {
      fond: ["#a6dc8d", "#6fbf62"],
      taches: ["#d7f2b6", "#57a94e", "#f6e6a0", "#8ccf74"],
      trait: "#3a7d38",
      couleurs: ["#ffffff", "#ffc9dd", "#fff1a1", "#ff9fbd", "#c7f0b0", "#ffd88c"],
      symboles: ["fleur", "feuille", "fleur", "coeur", "etoile", "goutte", "fleur"],
      petits: ["etincelle", "fleur", "etoile"],
      clair: "#ffffff"
    }
  };
  const illus = {};
  const illustration = (t) => {
    if (illus[t.id]) return illus[t.id];
    const I = ILLUSTRATIONS[t.illustration], r = alea(graine(t.illustration));
    const sym = (n, x, y, taille, rot, attr) => {
      const k = taille / 24;
      return `<path ${attr} fill-rule="${PLEIN.has(n) ? "nonzero" : "evenodd"}" transform="translate(${(x - taille / 2).toFixed(1)} ${(y - taille / 2).toFixed(1)}) rotate(${rot.toFixed(0)} ${taille / 2} ${taille / 2}) scale(${k.toFixed(3)})" d="${SYMBOLES[n]}"/>`;
    };
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${I.fond[0]}"/><stop offset="1" stop-color="${I.fond[1]}"/></linearGradient><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter></defs><rect width="1280" height="800" fill="url(#g)"/><g filter="url(#b)" opacity=".7">`;
    for (let i = 0; i < 9; i++) s += `<circle cx="${(r() * 1280).toFixed(0)}" cy="${(r() * 800).toFixed(0)}" r="${(110 + r() * 170).toFixed(0)}" fill="${I.taches[i % I.taches.length]}"/>`;
    s += "</g>";
    for (let y = 0; y < 6; y++) for (let x = 0; x < 9; x++) {
      const t2 = 70 + r() * 80, n = I.symboles[(x * 3 + y * 5 + Math.floor(r() * 3)) % I.symboles.length];
      s += sym(n, x * 160 + y % 2 * 80 - 20 + r() * 50, y * 150 + 20 + r() * 50, t2, -30 + r() * 60, `fill="${I.couleurs[Math.floor(r() * I.couleurs.length)]}" stroke="${I.trait}" stroke-width="${(1.1 * 24 / t2 * 2.4).toFixed(2)}" stroke-linejoin="round"`);
    }
    for (let i = 0; i < 70; i++) {
      const t2 = 10 + r() * 18;
      s += sym(I.petits[i % I.petits.length], r() * 1280, r() * 800, t2, r() * 90, `fill="${I.clair}" fill-opacity="${(0.5 + r() * 0.5).toFixed(2)}"`);
    }
    s += "</svg>";
    return illus[t.id] = URL.createObjectURL(new Blob([s], { type: "image/svg+xml" }));
  };
  const tous = () => [...THEMES, ...mesFonds, ...importes];
  const trouver = (id) => tous().find((t) => t.id === id) || (/^fond:/.test(id) ? Object.assign(themeFond(id.slice(5)), { provisoire: true }) : /^importe:/.test(id) ? Object.assign(themeImporte(id.slice(8)), { provisoire: true }) : null);
  let courant = null, essai = null;
  const style = document.createElement("style");
  style.id = "pcv-themes-style";
  document.head.appendChild(style);
  fins.push(() => style.remove());
  const ROUGE_RESERVE = { debut: 330, fin: 12, satMin: 0.35, lumMax: 0.72 };
  const accentEstRouge = (c) => {
    const x = enHsl(c);
    if (!x) return false;
    const [h, s, l] = x;
    return s >= ROUGE_RESERVE.satMin && l <= ROUGE_RESERVE.lumMax && (h >= ROUGE_RESERVE.debut || h <= ROUGE_RESERVE.fin);
  };
  const variables = (t) => {
    const F = FAMILLES[t.famille], v = t.verre || F.verre, A = apparenceSombre() ? accentSombre(t.accent) : t.accent;
    const batAccent = accentEstRouge(A) ? t.accent2 || "var(--pcv-texte2)" : A;
    let css = `html:root:root { --pcv-cyan-plein: ${A}; --pcv-accent: ${A}; --pcv-cyan: linear-gradient(180deg, color-mix(in srgb, ${A} 60%, #fff), ${A});
      --pcv-accent2: ${t.accent2 || `color-mix(in srgb, ${A} 82%, #fff)`}; --pcv-bat-accent: ${batAccent};
      --pcv-verre: linear-gradient(180deg, ${v[0]} 0%, ${v[1]} 100%); --pcv-ombre: ${F.ombre};`;
    for (const e of Object.keys(ESPACES)) {
      const f = fondsDe(t, e);
      css += `
  --pcv-fond-${e}: ${f.complet}; --pcv-fond-${e}-base: ${f.base};`;
    }
    const pl = plaqueDe(t);
    if (pl) css += `
  --pcv-plaque: ${pl};`;
    const ic = iconesPretes(t);
    if (ic.dossier) css += `
  --pcv-dossier-ferme: url("${ic.dossier}");${ic["dossier-ouvert"] ? ` --pcv-dossier-ouvert: url("${ic["dossier-ouvert"]}");` : ""}`;
    css += `
  --pcv-fond-page: var(--pcv-fond-bibliotheque); }
`;
    for (const [e, d] of Object.entries(ESPACES)) {
      if (d.pages) css += `${d.pages.map((p) => `body[data-pcv-page="${p}"]`).join(", ")} { --pcv-fond-page: var(--pcv-fond-${e}); }
`;
      for (const h of d.hotes || []) css += `#${h} { --pcv-fond-page: var(--pcv-fond-${e}); } #${h}.pcv-fond-vivant { --pcv-fond-page: var(--pcv-fond-${e}-base); }
`;
    }
    return css;
  };
  const iconesPretes = (t) => Object.fromEntries(Object.entries(t.icones || {}).filter(([, f]) => urls[f]).map(([n, f]) => [n, urls[f]]));
  const poserIcones = (t) => {
    const ic = iconesPretes(t), D = document.documentElement.dataset;
    if (ic.dossier) D.pcvDossier = "image";
    else delete D.pcvDossier;
    window.__pcvIcones?.theme(ic);
  };
  const appliquer = (id, enEssai = false) => {
    const t = trouver(id) || THEMES[0];
    courant = t;
    if (!enEssai) {
      ecrire("pcv-theme", t.id);
      essai = null;
    }
    style.textContent = variables(t);
    poserIcones(t);
    const D = document.documentElement.dataset;
    D.pcvTheme = t.id;
    D.pcvFamille = t.famille;
    D.pcvFond = aImage(t) ? "image" : "motif";
    if (t.plaque) D.pcvPlaque = "oui";
    else delete D.pcvPlaque;
    if (t.provisoire) charger().then(() => {
      if (courant !== t) return;
      const v = tous().find((x) => x.id === t.id);
      appliquer(v ? v.id : "verre", enEssai || !v);
    });
    else if (aImage(t)) {
      const maj = () => {
        if (courant !== t) return;
        const css = variables(t);
        if (style.textContent !== css) {
          style.textContent = css;
          poserIcones(t);
          verifier();
        }
      };
      Promise.all(fichiersImage(t).map(urlDe)).then(maj);
      chargerImages(t).then(maj);
    }
    window.dispatchEvent(new CustomEvent("pcv-theme", { detail: { id: t.id, famille: t.famille, essai: !!enEssai, sombre: !!t.sombre } }));
    verifier();
    musique();
    return t.id;
  };
  const teintes = (im) => {
    const x = toile(32, 32);
    x.drawImage(im, 0, 0, 32, 32);
    const d = x.getImageData(0, 0, 32, 32).data, poids = new Array(12).fill(0), somme = new Array(12).fill(0);
    for (let p = 0; p < d.length; p += 4) {
      const [R, G, B] = [d[p] / 255, d[p + 1] / 255, d[p + 2] / 255], mx = Math.max(R, G, B), mn = Math.min(R, G, B), s = mx ? (mx - mn) / mx : 0;
      if (s < 0.12 || mx < 0.2) continue;
      let h = mx === mn ? 0 : mx === R ? (G - B) / (mx - mn) : mx === G ? 2 + (B - R) / (mx - mn) : 4 + (R - G) / (mx - mn);
      h = (h * 60 + 360) % 360;
      const k = Math.floor(h / 30), w = s * mx;
      poids[k] += w;
      somme[k] += h * w;
    }
    return { poids, somme };
  };
  const etrangere = (c, im) => {
    const x = enHsl(c);
    if (!x) return false;
    const { poids } = teintes(im), tot = poids.reduce((a, b) => a + b, 0);
    return tot > 0 && poids[Math.floor(x[0] / 30) % 12] / tot < 0.08;
  };
  const accentDe = (t, im) => {
    try {
      const { poids, somme } = teintes(im);
      const k = poids.indexOf(Math.max(...poids));
      if (!poids[k]) return;
      const a = accents[t.fichier || t.id] = `hsl(${Math.round(somme[k] / poids[k])} 72% 50%)`;
      ecrire("pcv-fonds-accents", accents);
      for (const o of [t, courant, vu, ...mesFonds, ...importes]) if (o?.id === t.id) o.accent = a;
      if (courant?.id === t.id) appliquer(t.id, !!essai);
    } catch (e) {
    }
  };
  const decors = /* @__PURE__ */ new Set();
  const anime = () => lire("pcv-fond-anime", true);
  const HOTES = Object.values(ESPACES).flatMap((d) => d.hotes || []);
  const SEL_HOTES = HOTES.map((h) => "#" + h).join(", ") + ", .pcv-panneau";
  const visible = (h) => {
    if (document.hidden || h.hidden || !h.isConnected || h.classList.contains("pcvth-essai")) return false;
    const r = h.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    for (let e = h; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.visibility === "hidden" || +s.opacity < 0.05) return false;
    }
    const el = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height * 0.55).find((x) => !x.closest(".pcvth-essai")), autre = el?.closest(SEL_HOTES);
    return !autre || autre === h || h.contains(autre) || autre.contains(h);
  };
  const pleine = (h) => {
    const r = h.getBoundingClientRect(), u = innerHeight / 800;
    return r.left <= 1 && r.right >= innerWidth - 1 && r.bottom >= innerHeight - 1 && r.top > 0 && r.top <= 99 * u;
  };
  const sprites = /* @__PURE__ */ new Map();
  const lutin = (cle, cote, dessin) => {
    if (!sprites.has(cle)) {
      const c = document.createElement("canvas");
      c.width = c.height = Math.max(4, Math.ceil(cote));
      dessin(c.getContext("2d"), c.width);
      sprites.set(cle, c);
    }
    return sprites.get(cle);
  };
  const cuire = (nom, flou, lisere, verre = "#fff") => lutin(`v${nom}${flou}${lisere}${verre}`, 96, (x) => {
    x.filter = `blur(${flou}px)`;
    x.translate(12, 12);
    x.scale(3, 3);
    const p = new Path2D(SYMBOLES[nom] || SYMBOLES.etoile), regle = PLEIN.has(nom) ? "nonzero" : "evenodd";
    x.lineJoin = x.lineCap = "round";
    x.fillStyle = verre;
    x.globalAlpha = nom === "rond" ? 0.35 : 0.62;
    x.fill(p, regle);
    x.strokeStyle = verre;
    x.globalAlpha = 0.95;
    x.lineWidth = 1.3;
    x.translate(-0.5, -0.6);
    x.stroke(p);
    x.translate(0.5, 1.2);
    x.globalAlpha = 1;
    x.strokeStyle = lisere;
    x.lineWidth = 0.8;
    x.stroke(p);
  });
  const aplat = (nom, couleur, taille, rot) => lutin(`p${nom}${couleur}${Math.round(taille)}${Math.round(rot)}`, taille * 1.45 + 4, (x, c) => {
    x.translate(c / 2, c / 2);
    x.rotate(rot * Math.PI / 180);
    x.scale(taille / 24, taille / 24);
    x.translate(-12, -12);
    x.fillStyle = couleur;
    x.globalAlpha = 0.62;
    x.fill(new Path2D(SYMBOLES[nom] || SYMBOLES.etoile), PLEIN.has(nom) ? "nonzero" : "evenodd");
  });
  const eclat = () => lutin("eclat", 64, (x) => {
    x.shadowColor = "rgba(255,255,255,.9)";
    x.shadowBlur = 10;
    x.fillStyle = "#fff";
    x.translate(12, 12);
    x.scale(5 / 3, 5 / 3);
    x.fill(new Path2D(SYMBOLES.etincelle));
  });
  const espaceDeDecor = (d) => d.espace || Object.keys(ESPACES).find((x) => ESPACES[x].hotes?.includes(d.hote.id)) || espaceDePage(document.body.dataset.pcvPage) || "accueil";
  const preparer = (d, t, e, K) => {
    d.objets = [];
    d.places = null;
    const st = e === "accueil" && aImage(t) ? t.image ? "bulles" : "etincelles" : styleDe(t, e), r = alea(graine(t.id + e + "decor")), pal = paletteDe(t, e);
    d.style = st;
    if (st === "plat") {
      const f = fondsDe(t, e);
      d.tl = f.tuile.l * K;
      d.th = f.tuile.h * K;
      d.places = f.tuile.places.map((p) => {
        const taille = 24 * p.s * K, sp = aplat(p.n, pal.motif, taille, p.rot);
        return { sp, x: p.x * K + taille / 2 - sp.width / 2, y: p.y * K + taille / 2 - sp.height / 2 };
      });
      const tuile2 = document.createElement("canvas");
      tuile2.width = Math.max(1, Math.ceil(d.tl));
      tuile2.height = Math.max(1, Math.ceil(d.th));
      const xt = tuile2.getContext("2d");
      for (const p of d.places) xt.drawImage(p.sp, p.x, p.y);
      d.motif = tuile2;
      return;
    }
    if (st === "etincelles") {
      for (let i = 0; i < 16; i++) d.objets.push({ s: eclat(), t: 14 + r() * 22, x: r() * 1300, y: r() * 820, v: 4e-3 + r() * 6e-3, r: 0, vr: 0, a: 0.55 + r() * 0.4, tw: r() * 6, ws: 15e-4 + r() * 2e-3 });
      return;
    }
    const sombre = sombreDe(t, e), sy = st === "bulles" ? [] : symbolesDe(t, e), nb = st === "bulles" ? 0 : 22;
    for (let i = 0; i < nb + 8; i++) {
      const bulle = i >= nb, prof = r(), nom = bulle ? "rond" : sy[i % sy.length];
      d.objets.push({
        s: cuire(nom, prof > 0.66 ? 1.2 : prof > 0.33 ? 2.4 : 3.6, pal.motif, pal.verre),
        t: bulle ? 18 + r() * 40 : 60 + r() * 80,
        x: (i % 6 + r()) * 1400 / 6 - 60,
        y: r() * 900,
        v: 0.01 + prof * 0.018,
        r: r() * 360,
        vr: (r() < 0.5 ? 1 : -1) * (4e-3 + r() * 6e-3),
        a: (sombre ? 0.12 : 0.2) + prof * (sombre ? 0.14 : 0.22)
      });
    }
  };
  const dessiner = (d, dt) => {
    const t = d.theme?.() || courant;
    if (!t) return;
    const e = espaceDeDecor(d), W = d.cv.clientWidth, H = d.cv.clientHeight;
    if (!W || !H) return;
    const K = d.apercu ? W / 1280 : innerHeight / 800, cle = `${t.id}|${e}|${W}x${H}|${typeof doux[t.id]}|${document.documentElement.dataset.pcvApparence}`;
    if (cle !== d.cle) {
      d.cle = cle;
      d.cv.width = W;
      d.cv.height = H;
      preparer(d, t, e, K);
      d.force = d.apercu ? 1 : +getComputedStyle(document.documentElement).getPropertyValue("--pcv-decor") || 1;
    }
    if (!d.apercu) d.hote.classList.add("pcv-fond-vivant");
    const x = d.x;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, W, H);
    x.globalAlpha = d.force;
    if (d.places) {
      d.ox = ((d.ox || 0) + dt * 0.014 * K) % d.tl;
      d.oy = ((d.oy || 0) + dt * 9e-3 * K) % d.th;
      const motif = x.createPattern(d.motif, "repeat");
      motif.setTransform(new DOMMatrix().translate(d.ox, -d.oy));
      x.fillStyle = motif;
      x.fillRect(0, 0, W, H);
      return;
    }
    const k = W / 1280;
    for (const o of d.objets) {
      o.x += o.v * dt;
      o.y -= o.v * dt * 0.6;
      o.r += o.vr * dt;
      if (o.x > 1350) o.x = -o.t;
      if (o.y < -o.t) o.y = 880;
      const T2 = o.t * k;
      x.save();
      x.globalAlpha = d.force * (o.tw === void 0 ? o.a : o.a * (0.5 + 0.5 * Math.sin(o.tw += dt * o.ws)));
      x.translate(o.x * k, o.y * k);
      x.rotate(o.r * Math.PI / 180);
      x.drawImage(o.s, -T2 / 2, -T2 / 2, T2, T2);
      x.restore();
    }
  };
  let boucleId = 0, attente = 0;
  const boucle = (t) => {
    boucleId = 0;
    let actif = false, prochaine = Infinity;
    const vivant = anime();
    for (const d of decors) {
      if (!d.cv.isConnected) {
        decors.delete(d);
        d.hote.classList.remove("pcv-fond-vivant");
        continue;
      }
      if (t - d.verif > 500 || d.vu === void 0) {
        d.verif = t;
        d.vu = vivant && visible(d.hote);
        d.cv.style.display = vivant ? "" : "none";
        if (!vivant) d.hote.classList.remove("pcv-fond-vivant");
        const p = !d.apercu && pleine(d.hote);
        if (p !== d.plein) {
          d.plein = p;
          d.cv.classList.toggle("pcv-fond-plein", p);
          d.cle = "";
        }
      }
      if (!d.vu) continue;
      actif = true;
      if (t - d.der >= 33) {
        const dt = Math.min(100, t - (d.der || t - 33));
        d.der = t;
        dessiner(d, dt);
      }
      prochaine = Math.min(prochaine, d.der + 33);
    }
    if (decors.size) {
      const att = actif ? prochaine - performance.now() - 12 : 500;
      if (att < 4) boucleId = requestAnimationFrame(boucle);
      else attente = setTimeout(() => {
        attente = 0;
        boucleId = requestAnimationFrame(boucle);
      }, att);
    }
  };
  const relancer = () => {
    if (!boucleId && !attente) boucleId = requestAnimationFrame(boucle);
  };
  const verifier = () => {
    decors.forEach((d) => {
      d.cle = "";
      d.vu = void 0;
    });
    relancer();
  };
  fins.push(() => {
    cancelAnimationFrame(boucleId);
    clearTimeout(attente);
    decors.clear();
  });
  const monter = (hote2, o = {}) => {
    if (!hote2) return null;
    hote2.querySelector(":scope > .pcv-fond")?.remove();
    const cv = document.createElement("canvas");
    cv.className = "pcv-fond";
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none";
    hote2.style.isolation = "isolate";
    hote2.prepend(cv);
    const d = { hote: hote2, cv, x: cv.getContext("2d"), espace: o.espace, theme: o.theme, apercu: o.apercu, cle: "", verif: 0, der: 0 };
    decors.add(d);
    relancer();
    return d;
  };
  const monFond = (hote2) => {
    if (hote2 && !hote2.querySelector(":scope > .pcv-fond")) monter(hote2);
  };
  monFond.pcvThemes = true;
  const MUSIQUES = {
    wiiu: {
      accueil: ["wiiu-menu", "home-menu"],
      parametres: ["wiiu-parametres", "initial-setup"],
      boutique: ["wiiu-eshop", "eshop-main"],
      amis: ["wiiu-amis"],
      notifs: ["wiiu-notifications"],
      profil: ["wiiu-mii-maker", "mii-maker-main"],
      medias: ["wiiu-album"],
      place: ["wiiu-place"],
      themes: ["theme-shop"],
      badges: ["badge-arcade"]
    },
    "3ds": {
      accueil: ["home-menu"],
      parametres: ["parametres-3ds", "initial-setup"],
      boutique: ["eshop-main"],
      amis: ["liste-amis"],
      notifs: ["notifications"],
      profil: ["mii-maker-main"],
      medias: ["appareil-photo"],
      place: ["streetpass"],
      themes: ["theme-shop"],
      badges: ["badge-arcade"]
    }
  };
  const piste = (nom) => {
    const f = pistes ? pistes.find((p) => p.replace(/\.[^.]+$/, "") === nom) : sysPresents?.has("sons/" + nom + ".mp3") && nom + ".mp3";
    return f ? "sons/" + f : null;
  };
  let demandee = null;
  const consoleDe = (t) => t?.sons || t?.famille;
  const familleSons = (t = courant) => window.__pcvFamilleSons ? window.__pcvFamilleSons(consoleDe(t)) : consoleDe(t);
  let sysPresents = null, sysLecture = null, sysEssai = 0;
  const lireSys = () => {
    if (sysPresents || sysLecture || !window.__pcvSonsPresents || Date.now() - sysEssai < 5e3) return;
    sysEssai = Date.now();
    sysLecture = Promise.resolve(window.__pcvSonsPresents()).then((s) => {
      sysLecture = null;
      if (s?.size) {
        sysPresents = s;
        musique();
      }
    }, () => {
      sysLecture = null;
    });
  };
  const systeme = (chemin) => chemin && sysPresents?.has("sons/" + chemin) ? "sons/" + chemin : null;
  const ECRANS_SONS = { "garde-robe": ['pcv-miimaker[data-ecran="editeur"][data-cat="tenue"]'], miimaker: ["pcv-miimaker"], perso: ["pcv-deco"], connexion: ["pcv-connexion"] }, PAGES_SONS = ["telechargements"];
  const musiqueDe = (page, t = courant) => {
    const sys = window.__pcvSonsSysteme?.[familleSons(t)]?.musiques;
    const e = ESPACES[page] || ECRANS_SONS[page] || PAGES_SONS.includes(page) ? page : espaceDePage(page);
    if (!e || !t) return void 0;
    const pack = () => window.__pcvPackMusique?.(e, t.ambiance);
    if (!ESPACES[e]) return systeme(sys?.[e]) || pack() || musiqueDe(espaceDePage(e) || "accueil", t);
    const propre = t.musiques?.[e] ?? (["bibliotheque", "fiche"].includes(e) ? t.musiques?.accueil : void 0);
    if (propre) return propre;
    if (["place", "badges"].includes(e) && demandee === false) return null;
    if (["place", "badges"].includes(e) && demandee) {
      const d = sys && demandee in sys ? systeme(sys[demandee]) : piste(demandee) || (demandee.includes("/") ? "sons/" + demandee + ".mp3" : null);
      if (d) return d;
    }
    const c = systeme(sys?.[e]) || sys && (MUSIQUES[t.famille]?.[e] || []).map(piste).find(Boolean) || pack();
    if (c) return c;
    return e === "accueil" ? null : musiqueDe("accueil", t);
  };
  const L = window.__pcvThemesLecteurs ||= [new Audio(), new Audio()];
  L.forEach((a) => {
    a.loop = true;
    a.preload = "auto";
    if (a.paused) a.volume = 0;
  });
  const etat = window.__pcvThemesMusique ||= { actif: 0, enCours: null, positions: {}, jeton: 0 };
  const cibles = /* @__PURE__ */ new Map(), FONDU = 1400;
  const volMusique = () => lire("pcv-volume-musique", 0.3);
  let fonduId = 0;
  const viser = (a, v) => {
    cibles.set(a, v);
    if (!fonduId) fonduId = setInterval(() => {
      for (const [l, c] of cibles) {
        const pas = 50 / FONDU * Math.max(0.05, volMusique());
        l.volume = Math.max(0, Math.min(1, l.volume + Math.sign(c - l.volume) * Math.min(pas, Math.abs(c - l.volume))));
        if (Math.abs(l.volume - c) < 1e-3) {
          cibles.delete(l);
          if (c === 0) {
            l.pause();
          }
        }
      }
      if (!cibles.size) {
        clearInterval(fonduId);
        fonduId = 0;
      }
    }, 50);
  };
  fins.push(() => {
    clearInterval(fonduId);
    fonduId = 0;
  });
  const changer = async (chemin) => {
    if (chemin === etat.enCours) {
      const a = L[etat.actif];
      if (!chemin || etat.charge || a.dataset.chemin !== chemin) return;
      if (a.paused) a.play().catch(() => {
      });
      const v = volMusique();
      if ((cibles.has(a) ? cibles.get(a) : a.volume) !== v) viser(a, v);
      return;
    }
    const j = ++etat.jeton;
    etat.enCours = chemin;
    etat.charge = false;
    for (const a of L) {
      if (a.dataset.chemin && !a.paused) etat.positions[a.dataset.chemin] = a.currentTime;
      if (!a.paused) viser(a, 0);
    }
    if (!chemin) return;
    etat.charge = true;
    const u = await urlDe(chemin);
    if (j !== etat.jeton) return;
    etat.charge = false;
    if (!u) return;
    const neuf = L.find((a) => a.dataset.chemin === chemin) || L.find((a) => a.paused) || (L[0].volume <= L[1].volume ? L[0] : L[1]);
    etat.actif = L.indexOf(neuf);
    if (neuf.dataset.chemin !== chemin) {
      neuf.pause();
      neuf.src = u;
      neuf.dataset.chemin = chemin;
      try {
        neuf.currentTime = etat.positions[chemin] || 0;
      } catch (e) {
      }
    }
    if (neuf.paused) neuf.volume = 0;
    neuf.play().catch(() => {
    });
    viser(neuf, volMusique());
  };
  let mediasMuets = false;
  const suivreMedias = setInterval(async () => {
    let v = false;
    try {
      const a = O.SteamUIStore?.MainRunningApp?.appid;
      if (a) {
        const l = (await appeler("lecteurs").catch(() => null) || []).filter((x) => O.__pcvMemeJeu?.(x.jeu, a));
        v = l.length > 0 && !l.some((x) => x.statut === "Playing");
      }
    } catch (e) {
    }
    if (v !== mediasMuets) {
      mediasMuets = v;
      musique();
    }
  }, 2e3);
  fins.push(() => clearInterval(suivreMedias));
  const jeuEnCours = () => {
    try {
      return !!O.SteamUIStore?.MainRunningApp && !mediasMuets;
    } catch (e) {
      return false;
    }
  };
  const ouvertEl = (id) => {
    const el = document.querySelector("#" + id);
    return !!el && !el.hidden && (!el.matches(".pcv-panneau, .pcvth-hote") || el.classList.contains("on")) && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const espaceActuel = () => {
    if (ouvert && !essai) return "themes";
    for (const e of ["themes", "badges", "place", "profil", "notifs", "amis"]) if ((!essai || e !== "themes") && ESPACES[e].hotes.some(ouvertEl)) return e;
    for (const e in ECRANS_SONS) if (ECRANS_SONS[e].some(ouvertEl)) return e;
    const p = document.body.dataset.pcvPage;
    return PAGES_SONS.includes(p) ? p : espaceDePage(p);
  };
  let ecoute = null;
  let prechargee = null, ecranSon = null;
  const musique = () => {
    if (!courant) return;
    const ec = espaceActuel();
    if (ec !== ecranSon) {
      ecranSon = ec;
      son("ouverture");
    }
    lireSys();
    const fs = familleSons();
    if (fs !== prechargee && window.__pcvPrechargerSons) {
      prechargee = fs;
      window.__pcvPrechargerSons(fs);
    }
    const libre = !document.hidden && !jeuEnCours() && !document.documentElement.classList.contains("pcv-ouvert-home");
    const voulu = !libre ? null : ecoute !== null ? ecoute : !lire("pcv-musique", false) ? null : musiqueDe(ec);
    if (voulu !== void 0) changer(voulu);
  };
  const maMusique = (p) => {
    demandee = p === false ? false : p || null;
    musique();
  };
  maMusique.pcvThemes = true;
  let sonOrigine = null;
  const vraiSon = (nom, vol) => {
    const b = window.__pcvSonsSysteme?.[familleSons()]?.bruitages;
    if (!b) return false;
    const e = espaceActuel();
    for (const n of [nom, ...window.__pcvSonsProches?.[nom] || []]) {
      const s = b[e]?.[n] || b.commun?.[n];
      if (s && sysPresents?.has("sons/" + (s.f || s))) return !!window.__pcvEchantillon?.(s, vol);
    }
    return false;
  };
  const monSon = (nom) => {
    const vol = +lire("pcv-bruitages", 1) || 0;
    if (vol > 0 && !vraiSon(nom, vol)) sonOrigine?.(nom);
  };
  monSon.pcvThemes = true;
  const pictoReg = (d) => `<svg viewBox="0 0 24 24" width="62%" height="62%" fill="none" stroke="#5b6676" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const APPARENCES = { clair: Tr("themes.app_clair"), gris: Tr("themes.app_gris"), noir: Tr("themes.app_noir"), auto: Tr("themes.app_auto") };
  const REGLAGES = [
    { cle: "pcv-musique", def: false, ic: pictoReg('<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'), nom: Tr("themes.reg.musique"), val: (v) => v ? Tr("steamu.app.oui") : Tr("steamu.app.non"), suivant: (v) => !v },
    { cle: "pcv-volume-musique", def: 0.3, ic: pictoReg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'), nom: Tr("themes.reg.volume"), niveaux: [0.15, 0.3, 0.5, 0.75] },
    { cle: "pcv-bruitages", def: 1, ic: pictoReg('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'), nom: Tr("themes.reg.bruitages"), niveaux: [0, 0.4, 0.7, 1] },
    { cle: "pcv-fond-anime", def: true, ic: pictoReg('<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>'), nom: Tr("themes.reg.fond_anime"), val: (v) => v ? Tr("steamu.app.oui") : Tr("steamu.app.non"), suivant: (v) => !v },
    // l'apparence (apparence.js) : Clair, Gris, Noir ou Automatique (sa règle : onglet SteamU des Paramètres)
    {
      cle: "pcv-apparence",
      def: "clair",
      ic: pictoReg('<path d="M12 3a9 9 0 1 0 0 18z" fill="currentColor"/><circle cx="12" cy="12" r="9"/>'),
      nom: Tr("themes.reg.apparence"),
      val: (v) => APPARENCES[v] || APPARENCES.clair,
      suivant: (v) => {
        const k = Object.keys(APPARENCES);
        return k[(k.indexOf(v) + 1) % k.length];
      }
    },
    // sons (sons.js, __pcvSonsReglage) : le pack SteamU, ou les vrais sons de la console de la famille du thème (repli sur le
    // pack, emplacement par emplacement) ; « theme » par défaut : la console si ses sons sont importés, sinon SteamU
    {
      cle: "pcv-sons-famille",
      def: "theme",
      nom: Tr("themes.reg.sons"),
      get bulle() {
        return window.__pcvSonsReglage?.nom(consoleDe(courant));
      },
      ic: pictoReg('<path d="M3.5 12h1.5M7.5 8.5v7M11.5 5v14M15.5 8v8M19.5 10.5v3"/>'),
      val: (v) => window.__pcvSonsReglage?.val(v, consoleDe(courant)) ?? "SteamU",
      suivant: (v) => window.__pcvSonsReglage?.suivant(v, consoleDe(courant)) ?? v
    }
  ];
  const PLAQUE = { cote: 30, haut: -12, bas: -10, rayon: 30, fondu: 18 };
  const CSS = `
    #pcv-themes.pcvth-hote { position: fixed; inset: ${U(98)} 0 0 0; z-index: 8600; background: var(--pcv-fond-page); opacity: 0; pointer-events: none; transform: scale(1.03); transition: opacity .22s, transform .22s; }
    #pcv-themes.pcvth-hote.on { opacity: 1; pointer-events: auto; transform: none; }
    
    .pcvth-essai { background: transparent !important; }
    .pcvth-essai > .pcv-fond { display: none; }
    
    canvas.pcv-fond.pcv-fond-plein { position: fixed !important; inset: 0 !important; background: linear-gradient(transparent, transparent), var(--pcv-fond-page); }
    
    html[data-pcv-plaque] #pcv-console:not(.dans-dossier) .zone {
      -webkit-mask: linear-gradient(to right, transparent ${U(PLAQUE.cote)}, #000 ${U(PLAQUE.cote + PLAQUE.fondu)}, #000 calc(100% - ${U(PLAQUE.cote + PLAQUE.fondu)}), transparent calc(100% - ${U(PLAQUE.cote)})); }
    html[data-pcv-plaque] #pcv-console::before { content: ""; position: absolute; z-index: 0;  left: ${U(PLAQUE.cote)}; right: ${U(PLAQUE.cote)};
      top: calc(var(--pcv-zone-haut) + ${U(PLAQUE.haut)}); height: calc(var(--pcv-zone-h) - ${U(PLAQUE.haut + PLAQUE.bas)});
      border-radius: ${U(PLAQUE.rayon)}; background: var(--pcv-plaque, none); pointer-events: none; transition: opacity .25s;
      box-shadow: 0 0 0 ${U(2)} rgba(255,255,255,.55), 0 0 ${U(40)} ${U(4)} color-mix(in srgb, var(--pcv-accent) 55%, transparent), 0 ${U(16)} ${U(40)} rgba(0,0,0,.28); }
    html[data-pcv-plaque] #pcv-console.dans-dossier::before { opacity: 0; }
    .pcvth { position: absolute; inset: 0; z-index: 2; font-family: var(--pcv-police); color: var(--pcv-texte); user-select: none; -webkit-user-select: none; isolation: isolate; }
    .pcvth * { box-sizing: border-box; }
    .pcvth .pf { cursor: pointer; transition: transform .1s, box-shadow .1s; }
    .pcvth .sel { box-shadow: 0 0 0 ${U(4)} #fff, 0 0 0 ${U(9)} var(--pcv-cyan-plein), 0 ${U(10)} ${U(24)} rgba(0,0,0,.22) !important; transform: scale(1.04); z-index: 2; }
    .pcvth .tete { position: absolute; left: ${U(64)}; top: ${U(10)}; height: ${U(56)}; display: flex; align-items: center; gap: ${U(12)}; padding: 0 ${U(22)} 0 ${U(7)};
      border-radius: ${U(28)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: ${U(26)}; font-weight: 900; }
    .pcvth .tete i { width: ${U(42)}; height: ${U(42)}; border-radius: 50%; background: #fff; box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); display: flex; align-items: center; justify-content: center; }
    .pcvth .tete i::before { content: ""; width: ${U(24)}; height: ${U(24)}; background: #ff5f95; -webkit-mask: var(--m) center / contain no-repeat; mask: var(--m) center / contain no-repeat; }
    
    .pcvth .onglets { position: absolute; left: ${U(250)}; top: ${U(14)}; height: ${U(48)}; max-width: calc(100vw - ${U(274)}); display: flex; align-items: center; gap: ${U(4)}; padding: ${U(4)}; border-radius: ${U(24)};
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    .pcvth .onglets b { height: ${U(40)}; padding: 0 ${U(11)}; border-radius: ${U(20)}; display: flex; align-items: center; gap: ${U(6)}; font-size: ${U(15)}; font-weight: 800; white-space: nowrap; }
    .pcvth .onglets b small { min-width: ${U(20)}; height: ${U(20)}; padding: 0 ${U(5)}; border-radius: ${U(10)}; background: rgba(120,135,155,.16); font-size: ${U(11)}; font-weight: 900; display: flex; align-items: center; justify-content: center; }
    
    .pcvth .onglets .defile { position: relative; flex: 0 1 auto; min-width: 0; display: flex; align-items: center; gap: ${U(4)}; overflow-x: auto; scrollbar-width: none; touch-action: pan-x; scroll-behavior: smooth;
      padding: ${U(12)} ${U(10)}; margin: ${U(-12)} 0; }
    .pcvth .onglets .defile.deborde { -webkit-mask: linear-gradient(90deg, transparent, #000 ${U(14)}, #000 calc(100% - ${U(14)}), transparent); mask: linear-gradient(90deg, transparent, #000 ${U(14)}, #000 calc(100% - ${U(14)}), transparent); }
    .pcvth .onglets .defile::-webkit-scrollbar { display: none; }
    .pcvth .onglets b.actif { background: var(--pcv-cyan); color: var(--pcv-sur-accent); }   
    .pcvth .onglets b.actif small { background: rgba(255,255,255,.22); }
    .pcvth .onglets b.sel { transform: none; background: var(--pcv-cyan-plein); color: #fff; }
    .pcvth .onglets u { text-decoration: none; height: ${U(26)}; padding: 0 ${U(8)}; border-radius: ${U(13)}; display: flex; align-items: center; background: radial-gradient(circle at 50% 35%, #5c6678, #2f3a4a); color: #fff; font-size: ${U(11)}; font-weight: 900; }
    
    .pcvth .etagere { position: absolute; left: ${U(48)}; top: ${U(80)}; width: ${U(600)}; height: ${U(500)}; overflow-y: auto; overflow-x: hidden; padding: ${U(14)} ${U(16)} ${U(40)};
      scroll-padding: ${U(14)} 0 ${U(40)}; scrollbar-width: none; touch-action: pan-y; -webkit-mask: linear-gradient(180deg, transparent 0, #000 ${U(14)}, #000 calc(100% - ${U(30)}), transparent); mask: linear-gradient(180deg, transparent 0, #000 ${U(14)}, #000 calc(100% - ${U(30)}), transparent); }
    .pcvth .etagere::-webkit-scrollbar { display: none; }
    
    .pcvth .chapeau { margin: 0 ${U(6)} ${U(14)}; font-size: ${U(16)}; font-weight: 800; color: var(--pcv-texte2); }
    .pcvth .chapeau:empty { display: none; }
    .pcvth .rail { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: ${U(22)} ${U(20)}; }   
    .pcvth .carte { position: relative; border-radius: ${U(22)}; padding: ${U(6)} ${U(6)} 0; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    .pcvth .carte .vig { position: relative; height: ${U(108)}; border-radius: ${U(17)}; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); }
    .pcvth .vig .mp { position: absolute; left: 50%; top: ${U(8)}; width: ${U(56)}; height: ${U(10)}; margin-left: ${U(-28)}; border-radius: ${U(5)}; background: rgba(255,255,255,.9); box-shadow: 0 1px 2px rgba(0,0,0,.12); }
    .pcvth .vig .mr { position: absolute; top: ${U(7)}; width: ${U(12)}; height: ${U(12)}; border-radius: 50%; background: rgba(255,255,255,.9); box-shadow: 0 1px 2px rgba(0,0,0,.12); }
    .pcvth .vig .mt { position: absolute; top: ${U(36)}; width: ${U(42)}; height: ${U(42)}; border-radius: ${U(9)}; padding: ${U(2)}; background: rgba(255,255,255,.95); box-shadow: 0 ${U(3)} ${U(6)} rgba(0,0,0,.16); }
    .pcvth .vig .mt i { display: block; width: 100%; height: 100%; border-radius: ${U(7)}; background: #dfe6ee center 18% / cover; }
    .pcvth .vig .mt:first-of-type { box-shadow: 0 0 0 ${U(2)} #fff, 0 0 0 ${U(4)} var(--a); }
    .pcvth .vig .mt.p { width: ${U(26)}; height: ${U(26)}; border-radius: ${U(5)}; padding: ${U(1.5)}; box-shadow: 0 1px 2px rgba(0,0,0,.2); }
    .pcvth .vig .mt.p i { border-radius: ${U(4)}; }
    .pcvth .vig .mt.p:first-of-type { box-shadow: 0 0 0 ${U(1.5)} #fff, 0 0 0 ${U(3)} var(--a); }
    .pcvth .carte .nm { display: flex; align-items: center; justify-content: space-between; gap: ${U(6)}; height: ${U(38)}; padding: 0 ${U(8)}; font-size: ${U(15)}; font-weight: 900; white-space: nowrap; }
    .pcvth .carte .nm span { overflow: hidden; text-overflow: ellipsis; }
    .pcvth .carte .nm i { flex: none; width: ${U(14)}; height: ${U(14)}; border-radius: 50%; background: var(--a); box-shadow: 0 0 0 ${U(2)} #fff, 0 1px 3px rgba(0,0,0,.25); }
    .pcvth .carte.porte::after { content: "\u2713"; position: absolute; right: ${U(12)}; top: ${U(12)}; width: ${U(28)}; height: ${U(28)}; border-radius: 50%; background: #2fbf71; color: #fff;
      display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: ${U(16)}; box-shadow: 0 0 0 ${U(3)} #fff; }
    .pcvth .vide { grid-column: 1 / -1; padding: ${U(22)} ${U(24)}; border-radius: ${U(22)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: ${U(16)}; font-weight: 800; line-height: 1.5; }
    .pcvth .vide b { display: block; font-size: ${U(19)}; margin-bottom: ${U(6)}; }
    .pcvth .vide code { font: 800 ${U(14)} var(--pcv-police); padding: ${U(2)} ${U(8)}; border-radius: ${U(8)}; background: rgba(120,135,155,.14); }
    .pcvth .vitrine { position: absolute; left: ${U(676)}; top: ${U(86)}; width: ${U(540)}; height: ${U(338)}; border-radius: ${U(28)}; padding: ${U(7)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    .pcvth .ecran { position: relative; width: 100%; height: 100%; border-radius: ${U(22)}; overflow: hidden; isolation: isolate; }
    .pcvth .mini { position: absolute; left: 0; top: 0; width: ${U(1280)}; height: ${U(800)}; transform-origin: 0 0; pointer-events: none; }
    .pcvth .mini .rd { position: absolute; top: ${U(20)}; width: ${U(56)}; height: ${U(56)}; border-radius: 50%; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    .pcvth .mini .rd::before { content: ""; position: absolute; inset: ${U(8)}; border-radius: 50%; background: #fff; box-shadow: inset 0 -3px 0 rgba(0,0,0,.08); }
    .pcvth .mini .rd i { position: absolute; inset: ${U(17)}; border-radius: 50%; background: var(--c); opacity: .85; }
    .pcvth .mini .ti { position: absolute; left: ${U(64)}; top: ${U(108)}; font-size: ${U(28)}; font-weight: 900; color: var(--a); text-shadow: 0 1px 0 rgba(255,255,255,.7); white-space: nowrap; }
    .pcvth .mini .tu { position: absolute; top: ${U(158)}; width: ${U(250)}; height: ${U(250)}; border-radius: ${U(45)}; padding: ${U(10)}; background: var(--pcv-verre);
      box-shadow: inset 0 3px 1px #fff, inset 0 -6px 10px rgba(140,160,185,.25), 0 0 0 2px rgba(255,255,255,.8), 0 ${U(10)} ${U(20)} rgba(0,0,0,.16); }
    .pcvth .mini .tu i { display: block; width: 100%; height: 100%; border-radius: ${U(37)}; background: #dfe6ee center 18% / cover; }
    
    .pcvth .mini .tu.s { box-shadow: inset 0 3px 1px #fff, 0 0 0 ${U(5)} #fff, 0 0 0 ${U(10)} var(--a); transform: scale(1.05); transition: transform .3s, box-shadow .3s; }
    .pcvth .mini .tu.p { width: ${U(104)}; height: ${U(104)}; border-radius: ${U(16)}; padding: ${U(5)}; background: #fff; box-shadow: 0 ${U(3)} ${U(6)} rgba(0,0,0,.22); }
    .pcvth .mini .tu.p i { border-radius: ${U(11)}; }
    .pcvth .mini .tu.p.s { box-shadow: 0 0 0 ${U(4)} #fff, 0 0 0 ${U(9)} var(--a), 0 ${U(6)} ${U(14)} rgba(0,0,0,.25); transform: scale(1.08); }
    .pcvth .mini .bu { position: absolute; top: ${U(452)}; height: ${U(54)}; padding: 0 ${U(22)} 0 ${U(8)}; border-radius: ${U(27)}; display: flex; align-items: center; gap: ${U(10)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: ${U(17)}; font-weight: 800; color: var(--pcv-texte); white-space: nowrap; }
    .pcvth .mini .bu i { width: ${U(38)}; height: ${U(38)}; border-radius: 50%; background: var(--k); }
    .pcvth .mini .zo, .pcvth .mini .bs { position: absolute; bottom: ${U(24)}; height: ${U(46)}; border-radius: ${U(23)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    .pcvth .vitrine .nom { position: absolute; left: ${U(20)}; bottom: ${U(18)}; z-index: 3; display: flex; align-items: baseline; gap: ${U(10)}; padding: ${U(8)} ${U(18)}; border-radius: ${U(20)}; background: color-mix(in srgb, var(--pcv-carte) 94%, transparent);
      box-shadow: 0 ${U(4)} ${U(12)} rgba(0,0,0,.14); font-size: ${U(22)}; font-weight: 900; color: var(--pcv-texte); max-width: calc(100% - ${U(150)}); white-space: nowrap; overflow: hidden; }
    .pcvth .vitrine .nom small { font-size: ${U(14)}; font-weight: 800; color: var(--pcv-texte2); overflow: hidden; text-overflow: ellipsis; }
    .pcvth .vitrine .fam { position: absolute; right: ${U(20)}; bottom: ${U(18)}; z-index: 3; padding: ${U(8)} ${U(14)}; border-radius: ${U(18)}; background: var(--a); color: #fff; font-size: ${U(14)}; font-weight: 900; box-shadow: 0 0 0 ${U(3)} #fff, 0 ${U(4)} ${U(12)} rgba(0,0,0,.16); }
    .pcvth .vitrine .note { position: absolute; right: ${U(20)}; top: ${U(70)}; z-index: 3; display: none; align-items: center; gap: ${U(8)}; padding: ${U(6)} ${U(14)} ${U(6)} ${U(8)}; border-radius: ${U(18)}; background: rgba(255,255,255,.94); font-size: ${U(14)}; font-weight: 900; color: #3a4252; }
    .pcvth .vitrine .note.on { display: flex; }
    .pcvth .vitrine .note i { display: flex; gap: ${U(2)}; align-items: flex-end; height: ${U(16)}; }
    
    .pcvth .vitrine .note i b { width: ${U(3)}; height: 100%; background: var(--a); border-radius: ${U(2)}; transform-origin: bottom; animation: pcvthEq .8s ease-in-out infinite alternate; }
    .pcvth .vitrine .note i b:nth-child(2) { animation-delay: -.3s; } .pcvth .vitrine .note i b:nth-child(3) { animation-delay: -.55s; }
    @keyframes pcvthEq { from { transform: scaleY(.2) } to { transform: none } }
    .pcvth .espaces { position: absolute; left: ${U(676)}; top: ${U(438)}; width: ${U(540)}; display: grid; grid-template-columns: repeat(6, 1fr); gap: ${U(10)}; }
    .pcvth .esp { text-align: center; font-size: ${U(12)}; font-weight: 900; color: var(--pcv-texte); }
    .pcvth .esp i { display: block; height: ${U(50)}; border-radius: ${U(14)}; box-shadow: inset 0 0 0 ${U(3)} var(--pcv-lisere), 0 ${U(4)} ${U(10)} rgba(0,0,0,.14); margin-bottom: ${U(5)}; }
    
    .pcvth .esp span { display: inline-block; padding: ${U(1)} ${U(7)}; border-radius: ${U(8)}; background: var(--pcv-verre); white-space: nowrap; }
    .pcvth .actions { position: absolute; left: ${U(676)}; top: ${U(524)}; width: ${U(540)}; display: flex; gap: ${U(12)}; }
    .pcvth .act { flex: 1; height: ${U(56)}; border-radius: ${U(28)}; display: flex; align-items: center; justify-content: center; gap: ${U(10)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: ${U(17)}; font-weight: 900; white-space: nowrap; }
    .pcvth .act u { text-decoration: none; width: ${U(28)}; height: ${U(28)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 35%, #5c6678, #2f3a4a); color: #fff; font-size: ${U(13)}; font-weight: 900; }
    .pcvth .act.plein { background: var(--pcv-cyan); color: #fff; box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), 0 ${U(8)} ${U(18)} color-mix(in srgb, var(--pcv-cyan-plein) 40%, transparent); }
    .pcvth .act.plein u { background: #fff; color: var(--pcv-cyan-plein); }
    .pcvth .act.eteint { opacity: .45; }
    
    .pcvth .reglages { position: absolute; left: ${U(24)}; top: ${U(590)}; display: grid; grid-template-columns: repeat(3, auto); gap: ${U(6)}; }
    .pcvth .reg { height: ${U(42)}; padding: 0 ${U(14)} 0 ${U(5)}; border-radius: ${U(21)}; display: flex; align-items: center; gap: ${U(6)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: ${U(14)}; font-weight: 800; white-space: nowrap; }
    .pcvth .reg > i { width: ${U(32)}; height: ${U(32)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-style: normal; background: #eef2f6; font-size: ${U(17)}; }
    .pcvth .reg em { font-style: normal; color: var(--pcv-cyan-plein); font-weight: 900; }
    .pcvth .reg .nv { display: flex; gap: ${U(3)}; align-items: flex-end; height: ${U(18)}; }
    .pcvth .reg .nv b { width: ${U(6)}; border-radius: ${U(2)}; background: #d3dae2; }
    .pcvth .reg .nv b.on { background: var(--pcv-cyan-plein); }
    .pcvth .retour { position: absolute; right: ${U(24)}; top: ${U(615)}; height: ${U(40)}; display: flex; align-items: center; gap: ${U(8)}; padding: 0 ${U(16)} 0 ${U(6)}; border-radius: ${U(20)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: ${U(15)}; font-weight: 800; }
    .pcvth .retour u { text-decoration: none; width: ${U(28)}; height: ${U(28)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 35%, #5c6678, #2f3a4a); color: #fff; font-size: ${U(13)}; font-weight: 900; }
    .pcvth .bandeau { position: absolute; left: 50%; bottom: ${U(28)}; transform: translate(-50%, ${U(20)}); opacity: 0; pointer-events: none; display: flex; align-items: center; gap: ${U(14)}; padding: ${U(8)} ${U(10)} ${U(8)} ${U(24)};
      border-radius: ${U(32)}; background: rgba(255,255,255,.97); box-shadow: 0 ${U(12)} ${U(30)} rgba(0,0,0,.25), 0 0 0 ${U(4)} var(--pcv-cyan-plein); font-size: ${U(18)}; font-weight: 900; color: #3a4252; transition: opacity .2s, transform .25s cubic-bezier(.3,1.5,.5,1); white-space: nowrap; }
    .pcvth .bandeau small { color: #7a8494; font-size: ${U(14)}; }
    .pcvth .bandeau .act { flex: none; padding: 0 ${U(20)} 0 ${U(10)}; height: ${U(46)}; }
    .pcvth.essai > :not(.bandeau) { opacity: 0; pointer-events: none; }
    .pcvth.essai { background: none; pointer-events: none; }
    .pcvth.essai .bandeau { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }
    .pcvth > :not(.bandeau) { transition: opacity .25s; }
    
    .pcvth .act.rouge { flex: none; width: ${U(56)}; background: linear-gradient(180deg, #ff8a8a, #e5484d); color: #fff; box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.35), 0 ${U(8)} ${U(18)} rgba(229,72,77,.4); }
    .pcvth .act.rouge u { width: ${U(36)}; height: ${U(36)}; background: rgba(255,255,255,.3); }
    .pcvth .act[hidden] { display: none; }
    
    .pcvth .sup { position: absolute; inset: 0; z-index: 6; display: none; }
    .pcvth .sup.on { display: block; }
    .pcvth .sup .voile { position: absolute; inset: 0; background: rgba(20,28,44,.45); }
    .pcvth .sup .boite { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: ${U(560)}; padding: ${U(26)} ${U(30)} ${U(24)};
      border-radius: ${U(30)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${U(20)} ${U(50)} rgba(20,40,70,.35);
      animation: pcvthSup .25s cubic-bezier(.3,1.4,.5,1) both; }
    @keyframes pcvthSup { from { opacity: 0; transform: translate(-50%, -50%) scale(.94) } }
    .pcvth .sup .t { display: flex; align-items: center; gap: ${U(12)}; font-size: ${U(22)}; font-weight: 900; }
    .pcvth .sup .t u { width: ${U(42)}; height: ${U(42)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 35%, #ff8a8a, #e5484d); flex: none; }
    .pcvth .sup p { margin: ${U(14)} 0 0; font-size: ${U(16)}; font-weight: 700; color: var(--pcv-texte2); line-height: 1.45; }
    .pcvth .sup .bts { display: flex; justify-content: flex-end; gap: ${U(12)}; margin-top: ${U(20)}; }
    .pcvth .sup button { all: unset; cursor: pointer; display: flex; align-items: center; gap: ${U(9)}; height: ${U(50)}; padding: 0 ${U(22)} 0 ${U(10)}; border-radius: ${U(25)}; font-size: ${U(16)}; font-weight: 900; color: var(--pcv-texte);
      background: var(--pcv-carte); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 -3px 0 var(--pcv-reflet-bas), 0 3px 0 rgba(0,0,0,.18); }
    .pcvth .sup button u { text-decoration: none; width: ${U(28)}; height: ${U(28)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 35%, #5c6678, #2f3a4a); color: #fff; font-size: ${U(13)}; font-weight: 900; }
    .pcvth .sup button.oui { background: linear-gradient(180deg, #ff8a8a, #e5484d); color: #fff; }
    .pcvth .sup button.sel { box-shadow: 0 0 0 ${U(4)} #fff, 0 0 0 ${U(9)} var(--pcv-cyan-plein) !important; }
  `;
  const ui = document.createElement("style");
  ui.id = "pcv-themes-ui";
  ui.textContent = CSS;
  document.head.appendChild(ui);
  fins.push(() => ui.remove());
  const MASQUE_PINCEAU = svgURI(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="${SYMBOLES.palette}"/></svg>`);
  let ouvert = false, autonome = false, hote = null, racine = null, cat = "wiiu", sel = 0, zone = "grille", asel = 2, rsel = 0, vu = null, tour = 0, tourId = 0, caches = [];
  let suppr = null, supSel = 0;
  const nomsActions = () => ["ecouter", "essayer", "appliquer", ...cat === "importes" ? ["supprimer"] : []];
  const $ = (s) => racine?.querySelector(s);
  const IMG = (id, f) => `https://steamloopback.host/assets/${id}/${f}`;
  const jeux = () => {
    try {
      return (O.appStore?.allApps || []).filter((a) => a.app_type === 1 && a.rt_last_time_played).sort((a, b) => b.rt_last_time_played - a.rt_last_time_played).slice(0, 4).map((g) => {
        let v = "";
        try {
          v = O.appStore.GetVerticalCapsuleURLForApp(g) || "";
        } catch (e) {
        }
        return { nom: g.display_name, im: [v, IMG(g.appid, "library_600x900.jpg")].filter(Boolean).map((x) => `url('${String(x).replace(/['\\\n\r]/g, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))}')`).join(",") };
      });
    } catch (e) {
      return [];
    }
  };
  const dans = (c) => c === "fonds" ? mesFonds : c === "importes" ? importes : THEMES.filter((t) => t.cat === c);
  const vignette = (t, k) => fondsDe(t, "accueil", { k, fixe: false, reduit: true }).complet;
  const VIDES_3DS = [4, 7, 12, 15, 20, 22, 25];
  const carte = (t, jx2) => `<div class="carte pf${t.id === courant?.id ? " porte" : ""}" style="--a:${echap(t.accent)}"><div class="vig" style="background:${echap(vignette(t, 0.16))}">
      <span class="mr" style="left:${U(10)}"></span><span class="mr" style="left:${U(26)}"></span><span class="mp"></span>
      ${t.famille === "3ds" ? [...Array(10).keys()].filter((i) => ![3, 8].includes(i)).map((i) => `<span class="mt p" style="left:${U(12 + i % 5 * 31)};top:${U(34 + Math.floor(i / 5) * 31)}"><i style="background-image:${echap(jx2[i % 4]?.im || "none")}"></i></span>`).join("") : [0, 1, 2].map((i) => `<span class="mt" style="left:${U(12 + i * 52)}"><i style="background-image:${echap(jx2[i]?.im || "none")}"></i></span>`).join("")}</div>
      <div class="nm"><span>${echap(t.nom)}</span><i></i></div></div>`;
  const VIDES = {
    fonds: `<b>${Tr("themes.fonds_titre")}</b>${Tr("themes.fonds_texte", { donnees: window.__pcvGreffon?.donnees })}`,
    importes: `<b>${Tr("categories.importes")}</b>${Tr("themes.importes_texte", { donnees: window.__pcvGreffon?.donnees })}`
  };
  const ESP_APERCU = ["boutique", "amis", "notifs", "parametres", "medias", "profil"];
  const reglageHTML = (r) => {
    const v = lire(r.cle, r.def);
    const val = r.niveaux ? `<span class="nv">${r.niveaux.slice(1).map((n, i) => `<b class="${v >= n - 1e-3 ? "on" : ""}" style="height:${40 + i * 30}%"></b>`).join("")}</span>${r.cle === "pcv-bruitages" && !(v > 0) ? `<em>${Tr("steamu.app.non")}</em>` : ""}` : `<em>${r.val(v)}</em>`;
    return `<div class="reg pf" data-pcv-nom="${r.bulle ?? r.nom}"><i>${r.ic}</i><span class="nm">${r.nom} :</span> ${val}</div>`;
  };
  const reglages = () => REGLAGES;
  const rendreReglages = () => {
    $(".reglages").innerHTML = reglages().map(reglageHTML).join("");
  };
  let jx = [];
  const construire = () => {
    racine = document.createElement("div");
    racine.className = "pcvth";
    racine.innerHTML = `<div class="tete"><i style="--m:${echap(MASQUE_PINCEAU)}"></i>${echap(Tr("themes.titre"))}</div><div class="onglets"></div>
      <div class="etagere"><div class="chapeau"></div><div class="rail"></div></div>
      <div class="vitrine"><div class="ecran"><div class="mini"></div></div><div class="note"><i><b></b><b></b><b></b></i>Musique du th\xE8me</div><div class="nom"></div><div class="fam"></div></div>
      <div class="espaces"></div>
      <div class="actions"><div class="act pf" data-a="ecouter"><u>${T(3)}</u><span>${echap(Tr("themes.ecouter"))}</span></div><div class="act pf" data-a="essayer"><u>${T(4)}</u>${echap(Tr("themes.essayer"))}</div><div class="act pf plein" data-a="appliquer"><u>${T(1)}</u>${echap(Tr("themes.appliquer"))}</div><div class="act pf rouge" data-a="supprimer" hidden aria-label="${echap(Tr("themes.supprimer"))}" data-pcv-nom="${echap(Tr("themes.supprimer"))}"><u>${icoSuppr()}</u></div></div>
      <div class="reglages"></div><div class="retour pf"><u>${T(2)}</u>${Tr("themes.revenir")}</div>
      <div class="bandeau"><span class="bn"></span><div class="act pf" data-b="garder"><u>${T(1)}</u>${Tr("themes.garder")}</div><div class="act pf" data-b="annuler"><u>${T(2)}</u>${Tr("themes.revenir")}</div></div>
      <div class="sup"><div class="voile"></div><div class="boite"><div class="t"><u>${icoSuppr()}</u><span></span></div><p></p>
        <div class="bts"><button class="non pf"><u>${T(2)}</u>${echap(Tr("themes.annuler"))}</button><button class="oui pf"><u>${T(1)}</u>${echap(Tr("themes.supprimer"))}</button></div></div></div>`;
    racine.querySelector(".onglets").onclick = (e) => {
      const b = e.target.closest("b[data-cat]");
      if (b) {
        zone = "onglets";
        changerCat(b.dataset.cat);
        marquer();
      }
    };
    racine.querySelector(".rail").onclick = (e) => {
      const c = e.target.closest(".carte");
      if (!c) return;
      const i = [...$(".rail").children].indexOf(c);
      if (zone === "grille" && i === sel) return action("appliquer");
      zone = "grille";
      sel = i;
      regarder();
      son("bouge");
    };
    racine.querySelector(".actions").onclick = (e) => {
      const a = e.target.closest("[data-a]");
      if (a) {
        zone = "actions";
        asel = [...$(".actions").children].indexOf(a);
        marquer();
        action(a.dataset.a);
      }
    };
    racine.querySelector(".reglages").onclick = (e) => {
      const r = e.target.closest(".reg");
      if (r) {
        zone = "reglages";
        rsel = [...$(".reglages").children].indexOf(r);
        basculer();
      }
    };
    racine.querySelector(".retour").onclick = () => {
      if (autonome) {
        fermer();
        son("retour");
      } else window.__pcvPerso?.fermer?.();
    };
    racine.querySelector(".bandeau").onclick = (e) => {
      const b = e.target.closest("[data-b]");
      if (b) b.dataset.b === "garder" ? garder() : annulerEssai();
    };
    racine.querySelector(".sup .voile").onclick = () => supprimerAnnuler();
    racine.querySelector(".sup .non").onclick = () => supprimerAnnuler();
    racine.querySelector(".sup .oui").onclick = () => supprimerConfirmer();
    caches = [...hote.children].filter((c) => c.tagName !== "STYLE" && !c.matches(".pcv-fond") && c.style.visibility !== "hidden");
    caches.forEach((c) => c.style.visibility = "hidden");
    hote.appendChild(racine);
    monter($(".ecran"), { espace: "accueil", theme: () => vu, apercu: true });
  };
  const RONDS = [["#5b6676", 24], ["#2fbf71", 90], ["#e5484d", 156], ["#1a9ae6", 222]];
  const vitrine = () => {
    const t = vu;
    if (!t || !racine) return;
    const e = $(".ecran"), m = $(".mini"), s = e.clientWidth / (innerHeight / 800 * 1280) || 0.42;
    e.style.background = vignette(t, s);
    m.style.transform = `scale(${s})`;
    const v = t.verre || FAMILLES[t.famille].verre;
    for (const el of [e, $(".vitrine")]) {
      el.style.setProperty("--a", t.accent);
    }
    if (apparenceSombre()) {
      m.style.removeProperty("--pcv-verre");
      m.style.removeProperty("--pcv-ombre");
    } else {
      m.style.setProperty("--pcv-verre", `linear-gradient(180deg, ${v[0]}, ${v[1]})`);
      m.style.setProperty("--pcv-ombre", FAMILLES[t.famille].ombre);
    }
    m.style.setProperty("--a2", t.accent2 || t.accent);
    if (m.dataset.famille !== t.famille) {
      m.dataset.famille = t.famille;
      m.innerHTML = RONDS.map(([c, l]) => `<span class="rd" style="left:${U(l)};--c:${c}"><i></i></span>`).join("") + `<span class="ti">${echap(jx[tour % Math.max(1, Math.min(3, jx.length))]?.nom || Tr("themes.ma_console"))}</span>` + (t.famille === "3ds" ? [...Array(27).keys()].filter((i) => !VIDES_3DS.includes(i)).map((i, n) => `<span class="tu p${n === tour % 3 ? " s" : ""}" style="left:${U(64 + Math.floor(i / 3) * 124)};top:${U(150 + i % 3 * 124)}"><i style="background-image:${echap(jx[i * 7 % Math.max(1, jx.length)]?.im || "none")}"></i></span>`).join("") : [0, 1, 2, 3].map((i) => `<span class="tu${i === tour % 3 ? " s" : ""}" style="left:${U(64 + i * 284)}"><i style="background-image:${echap(jx[i]?.im || "none")}"></i></span>`).join("") + `<span class="bu" style="left:${U(64)}"><i style="--k:#e3f5ff"></i>${Tr("themes.heures_jeu_exemple")}</span><span class="bu" style="left:${U(290)}"><i style="--k:#fff3cf"></i>${Tr("themes.succes_obtenu")}</span><span class="zo" style="left:${U(34)};width:${U(200)}"></span><span class="bs" style="right:${U(34)};width:${U(360)}"></span>`);
    }
    $(".nom").innerHTML = `${echap(t.nom)}<small>${echap(t.sous || "")}</small>`;
    $(".fam").textContent = FAMILLES[t.famille].nom;
    const esp = $(".espaces");
    if (!esp.firstChild) esp.innerHTML = ESP_APERCU.map((x) => `<div class="esp"><i></i><span>${ESPACES[x].nom}</span></div>`).join("");
    [...esp.children].forEach((d, i) => {
      d.firstChild.style.background = fondsDe(t, ESP_APERCU[i], { k: 0.22, fixe: false }).complet;
    });
    majEcoute();
  };
  const majEcoute = () => {
    if (!racine) return;
    $('[data-a="ecouter"] span').textContent = ecoute !== null ? Tr("themes.arreter") : Tr("themes.ecouter");
    const n = $(".note");
    n.classList.toggle("on", ecoute !== null);
    n.lastChild.textContent = ecoute ? Tr("themes.musique_du_theme") : Tr("themes.pas_musique");
  };
  const marquer = () => {
    if (!racine) return;
    $(".onglets").querySelectorAll("b[data-cat]").forEach((b) => b.classList.toggle("sel", zone === "onglets" && b.dataset.cat === cat));
    $(".rail").querySelectorAll(".carte").forEach((c, i) => c.classList.toggle("sel", zone === "grille" && i === sel));
    if (SITES[cat]) site()?.marquer(zone === "grille");
    [...$(".reglages").children].forEach((r, i) => r.classList.toggle("sel", zone === "reglages" && i === rsel));
    [...$(".actions").children].forEach((a, i) => a.classList.toggle("sel", zone === "actions" && i === asel));
    $(".rail .sel")?.scrollIntoView?.({ block: "nearest" });
  };
  const SITES = { themeplaza: () => window.__pcvThemePlaza, "tz-wiiu": () => window.__pcvThemezer?.wiiu, "tz-switch": () => window.__pcvThemezer?.switch };
  const site = () => SITES[cat]?.();
  const demonterSites = (sauf) => {
    for (const c in SITES) if (c !== sauf) SITES[c]()?.demonter();
  };
  const OUTILS_TP = {
    U,
    echap,
    son,
    T: (c) => T(c),
    charger: () => charger(true).then(() => {
      if (racine) {
        dessinerOnglets();
        marquer();
      }
    }),
    // le compte des thèmes importés suit
    appliquer: (id) => {
      appliquer(id);
    },
    prendre: () => {
      zone = "grille";
      marquer();
    },
    importe: (num) => importes.some((t) => t.id === "importe:themeplaza-" + num),
    importeId: (id) => importes.some((t) => t.id === "importe:" + id)
  };
  const dessinerOnglets = () => {
    $(".onglets").innerHTML = `<u>${T(5)}</u><span class="defile">` + CATS.map(([c, n]) => `<b data-cat="${c}" class="pf${c === cat ? " actif" : ""}">${n}${c === "fonds" || c === "importes" ? `<small>${dans(c).length}</small>` : ""}</b>`).join("") + `</span><u>${T(6)}</u>`;
    const d = $(".onglets .defile"), a = d.querySelector(".actif");
    d.classList.toggle("deborde", d.scrollWidth > d.clientWidth + 1);
    if (!a) return;
    if (a.offsetLeft < d.scrollLeft + 10) d.scrollLeft = a.offsetLeft - 10;
    else if (a.offsetLeft + a.offsetWidth > d.scrollLeft + d.clientWidth - 10) d.scrollLeft = a.offsetLeft + a.offsetWidth - d.clientWidth + 10;
  };
  const dessinerPanneau = () => {
    if (!racine) return;
    const liste = dans(cat);
    dessinerOnglets();
    $(".chapeau").textContent = cat === "couleurs" ? Tr("themes.couleurs_texte") : "";
    $(".rail").innerHTML = liste.length ? liste.map((t) => carte(t, jx)).join("") : `<div class="vide">${VIDES[cat] || ""}</div>`;
    rendreReglages();
    const sa = $('.actions [data-a="supprimer"]');
    if (sa) sa.hidden = cat !== "importes";
    asel = Math.min(asel, nomsActions().length - 1);
    demonterSites(cat);
    if (SITES[cat]) {
      const s = site();
      if (s) s.monter(racine, OUTILS_TP);
      else $(".rail").innerHTML = `<div class="vide"><b>${echap(CATS.find(([c]) => c === cat)[1])}</b>${Tr("themes.script_pas_charge")}</div>`;
      marquer();
      return;
    }
    [...$(".actions").children].forEach((a) => a.classList.toggle("eteint", !liste.length));
    for (const t of liste) if (aImage(t) && doux[t.id] === void 0) chargerImages(t).then(() => rafraichir(t.id));
    marquer();
    vitrine();
  };
  const aRafraichir = /* @__PURE__ */ new Set();
  let rafraichirId = 0;
  const rafraichir = (id) => {
    aRafraichir.add(id);
    rafraichirId ||= requestAnimationFrame(() => {
      rafraichirId = 0;
      const ids = new Set(aRafraichir);
      aRafraichir.clear();
      if (!racine) return;
      const l = dans(cat);
      $(".rail").querySelectorAll(".carte").forEach((c, i) => {
        const t = l[i];
        if (t && ids.has(t.id)) {
          c.style.setProperty("--a", t.accent);
          c.querySelector(".vig").style.background = vignette(t, 0.16);
        }
      });
      if (vu && ids.has(vu.id)) vitrine();
    });
  };
  const regarder = (tout) => {
    const l = dans(cat), avant = vu;
    vu = l[Math.max(0, Math.min(sel, l.length - 1))] || vu || courant;
    if (ecoute !== null) {
      ecoute = musiqueDe("accueil", vu) || "";
      musique();
    }
    if (tout) return dessinerPanneau();
    marquer();
    if (vu !== avant) vitrine();
  };
  const changerCat = (c) => {
    if (c === cat) return;
    cat = c;
    sel = 0;
    const l = dans(cat), i = l.findIndex((t) => t.id === courant?.id);
    if (i >= 0) sel = i;
    son("onglet");
    regarder(true);
  };
  const basculer = () => {
    const r = reglages()[rsel];
    if (!r) return rendreReglages();
    const v = lire(r.cle, r.def);
    const n = r.niveaux ? r.niveaux[(r.niveaux.findIndex((x) => Math.abs(x - v) < 1e-3) + 1) % r.niveaux.length] : r.suivant(v);
    ecrire(r.cle, n);
    if (r.cle === "pcv-apparence") window.__pcvApparence?.choisir(n);
    if (r.cle === "pcv-volume-musique") L.forEach((a) => {
      if (!a.paused && cibles.get(a) !== 0) viser(a, n);
    });
    musique();
    son("choisir");
    if (racine) {
      rendreReglages();
      marquer();
    }
  };
  const action = (a) => {
    if (!vu || !dans(cat).length) return son("bord");
    if (a === "appliquer") {
      appliquer(vu.id);
      son("theme");
      dessinerPanneau();
    } else if (a === "essayer") {
      essai = { avant: courant.id };
      appliquer(vu.id, true);
      entrerEssai();
      son("choisir");
    } else if (a === "ecouter") {
      if (ecoute !== null) {
        ecoute = null;
        son("retour");
      } else {
        ecoute = musiqueDe("accueil", vu) || "";
        son("choisir");
      }
      musique();
      majEcoute();
    } else if (a === "supprimer" && cat === "importes") supprimerDemander(vu);
  };
  const appelerBackend = (methode, ...a) => Promise.race([
    (O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, methode, ...a) ?? Promise.reject(new Error("Decky absent")),
    new Promise((_, non) => setTimeout(() => non(new Error("d\xE9lai")), 8e3))
  ]).catch((e) => ({ erreur: String(e?.message || e) }));
  const dessinerSup = () => {
    if (!suppr || !racine) return;
    $(".sup .t span").textContent = Tr("themes.supprimer_titre", { nom: suppr.nom });
    $(".sup p").textContent = Tr("themes.supprimer_texte");
    $(".sup .non").classList.toggle("sel", supSel === 0);
    $(".sup .oui").classList.toggle("sel", supSel === 1);
  };
  const supprimerDemander = (t) => {
    suppr = { id: t.id.replace(/^importe:/, ""), nom: t.nom };
    supSel = 0;
    dessinerSup();
    $(".sup").classList.add("on");
    son("choisir");
  };
  const supprimerAnnuler = () => {
    if (!suppr) return;
    suppr = null;
    $(".sup")?.classList.remove("on");
    son("retour");
  };
  const supprimerConfirmer = async () => {
    if (!suppr) return;
    const id = suppr.id;
    $(".sup")?.classList.remove("on");
    suppr = null;
    const r = await appelerBackend("theme_supprimer", id);
    if (r?.erreur) {
      son("bord");
      return;
    }
    if (courant?.id === "importe:" + id) appliquer("verre");
    await charger(true);
    if (racine) {
      const l = dans(cat);
      if (!l.length) vu = null;
      sel = Math.max(0, Math.min(sel, l.length - 1));
      regarder(true);
    }
    son("retour");
  };
  const entrerEssai = () => {
    racine.classList.add("essai");
    hote.classList.add("pcvth-essai");
    $(".bn").innerHTML = `Essai : ${echap(vu.nom)} <small>(${FAMILLES[vu.famille].nom})</small>`;
    ecoute = null;
    musique();
    majEcoute();
  };
  const sortirEssai = () => {
    racine?.classList.remove("essai");
    hote?.classList.remove("pcvth-essai");
  };
  const garder = () => {
    sortirEssai();
    appliquer(vu.id);
    son("theme");
    dessinerPanneau();
  };
  const annulerEssai = () => {
    if (!essai) return;
    const a = essai.avant;
    essai = null;
    sortirEssai();
    appliquer(a);
    son("retour");
    dessinerPanneau();
  };
  const T = (code) => {
    const r = window.__pcvTouche?.(code) || ["?"];
    return r[2] ?? echap(r[0]);
  };
  const ouvrir = (conteneur) => {
    if (ouvert) fermer();
    autonome = !conteneur;
    hote = conteneur || document.getElementById("pcv-themes");
    if (!hote) {
      hote = document.createElement("div");
      hote.id = "pcv-themes";
      hote.className = "pcvth-hote";
      document.body.appendChild(hote);
    }
    if (autonome) {
      hote.hidden = false;
      const h = hote;
      requestAnimationFrame(() => {
        if (ouvert && hote === h) h.classList.add("on");
      });
    }
    ouvert = true;
    zone = "grille";
    ecoute = null;
    jx = jeux();
    window.__pcvBarreQuitter?.();
    cat = courant.cat;
    const l = dans(cat);
    sel = Math.max(0, l.findIndex((t) => t.id === courant.id));
    vu = l[sel] || courant;
    construire();
    monFond(hote);
    dessinerPanneau();
    clearInterval(tourId);
    tour = 0;
    tourId = setInterval(() => {
      if (!racine || essai) return;
      tour++;
      racine.querySelectorAll(".mini .tu").forEach((x, i) => x.classList.toggle("s", i === tour % 3));
      const ti = $(".mini .ti");
      if (ti && jx.length) ti.textContent = jx[tour % Math.min(3, jx.length)]?.nom || "";
    }, 2600);
    charger(true).then(() => {
      if (!ouvert) return;
      const l2 = dans(cat);
      const i = l2.findIndex((t) => t.id === courant.id);
      if (i >= 0 && sel === 0) sel = i;
      regarder(true);
    });
    if (autonome) son("choisir");
    musique();
    return true;
  };
  const fermer = () => {
    if (!ouvert) return false;
    if (essai) {
      const a = essai.avant;
      essai = null;
      appliquer(a);
    }
    sortirEssai();
    ouvert = false;
    ecoute = null;
    clearInterval(tourId);
    demonterSites();
    racine?.remove();
    racine = null;
    caches.forEach((c) => c.style.visibility = "");
    caches = [];
    if (autonome && hote) hote.classList.remove("on");
    if (autonome) window.__pcvPerso?.rendreZone?.();
    musique();
    return true;
  };
  fins.push(() => fermer());
  const touche = (b) => {
    if (!ouvert) return false;
    if (essai) {
      if (b === 1) garder();
      else if (b === 2) annulerEssai();
      return true;
    }
    if (suppr) {
      if (b === 11 || b === 12) {
        const k = b === 12 ? 1 : 0;
        if (k !== supSel) {
          supSel = k;
          dessinerSup();
          son("bouge");
        } else son("bord");
        return true;
      }
      if (b === 1) {
        supSel ? supprimerConfirmer() : supprimerAnnuler();
        return true;
      }
      if (b === 2) {
        supprimerAnnuler();
        return true;
      }
      return true;
    }
    if (SITES[cat] && zone === "grille") {
      const r = site()?.touche(b);
      if (r === "haut" || r === "bas") {
        zone = r === "haut" ? "onglets" : "reglages";
        son("bouge");
        marquer();
        return true;
      }
      if (r) return true;
    }
    if (b === 2) return false;
    if (b === 5 || b === 6) {
      const i = CATS.findIndex(([c]) => c === cat), n2 = CATS[(i + (b === 6 ? 1 : CATS.length - 1)) % CATS.length][0];
      changerCat(n2);
      return true;
    }
    if (b === 3) {
      action("ecouter");
      return true;
    }
    if (b === 4) {
      action("essayer");
      return true;
    }
    const l = dans(cat), n = l.length, col = sel % 3;
    const bouge = () => {
      son("bouge");
      marquer();
      return true;
    };
    if (zone === "onglets") {
      if (b === 11 || b === 12) {
        const i = CATS.findIndex(([c]) => c === cat), j = i + (b === 12 ? 1 : -1);
        if (j < 0 || j >= CATS.length) {
          son("bord");
          return true;
        }
        changerCat(CATS[j][0]);
        return true;
      }
      if (b === 10 || b === 1) {
        zone = n || SITES[cat] ? "grille" : "reglages";
        if (SITES[cat]) site()?.entrer("haut");
        return bouge();
      }
      son("bord");
      return true;
    }
    if (zone === "grille") {
      if (b === 1) {
        action("appliquer");
        return true;
      }
      if (!n) {
        if (b === 9) zone = "onglets";
        else if (b === 10) zone = "reglages";
        else {
          son("bord");
          return true;
        }
        return bouge();
      }
      if (b === 11) {
        if (col === 0) {
          son("bord");
          return true;
        }
        sel--;
      } else if (b === 12) {
        if (col === 2 || sel === n - 1) {
          zone = "actions";
          return bouge();
        }
        sel++;
      } else if (b === 9) {
        if (sel < 3) {
          zone = "onglets";
          return bouge();
        }
        sel -= 3;
      } else if (b === 10) {
        if (sel + 3 < n) sel += 3;
        else if (Math.floor(sel / 3) < Math.floor((n - 1) / 3)) sel = n - 1;
        else {
          zone = "reglages";
          return bouge();
        }
      } else return true;
      son("bouge");
      regarder();
      return true;
    }
    if (zone === "actions") {
      if (b === 1) {
        action(nomsActions()[asel]);
        return true;
      }
      if (b === 11) {
        if (asel === 0) zone = "grille";
        else asel--;
        return bouge();
      }
      if (b === 12) {
        if (asel === nomsActions().length - 1) {
          son("bord");
          return true;
        }
        asel++;
        return bouge();
      }
      if (b === 9) {
        zone = "grille";
        return bouge();
      }
      if (b === 10) {
        zone = "reglages";
        rsel = 2;
        return bouge();
      }
      return true;
    }
    if (zone === "reglages") {
      if (b === 1) {
        basculer();
        return true;
      }
      if (b === 11) {
        if (rsel % 3 === 0) {
          son("bord");
          return true;
        }
        rsel--;
        return bouge();
      }
      if (b === 12) {
        if (rsel % 3 === 2 || rsel === reglages().length - 1) {
          son("bord");
          return true;
        }
        rsel++;
        return bouge();
      }
      if (b === 10) {
        if (rsel + 3 >= reglages().length) {
          son("bord");
          return true;
        }
        rsel += 3;
        return bouge();
      }
      if (b === 9 && rsel >= 3) {
        rsel -= 3;
        return bouge();
      }
      if (b === 9 && SITES[cat]) {
        zone = "grille";
        site()?.entrer("bas");
        return bouge();
      }
      if (b === 9) {
        zone = rsel === 2 ? "actions" : "grille";
        if (zone !== "grille") return bouge();
        sel = Math.max(0, Math.min(n - 1, Math.floor((n - 1) / 3) * 3 + Math.min(2, rsel)));
        son("bouge");
        regarder();
        return true;
      }
      return true;
    }
    return true;
  };
  const brancher = () => {
    if (!window.__pcvSon?.pcvThemes) {
      sonOrigine = window.__pcvSon || null;
      window.__pcvSon = monSon;
    } else if (window.__pcvSon !== monSon) {
      sonOrigine = window.__pcvSon.origine || null;
      window.__pcvSon = monSon;
    }
    monSon.origine = sonOrigine;
    if (window.__pcvMusique !== maMusique) {
      maMusique.origine = window.__pcvMusique?.pcvThemes ? window.__pcvMusique.origine : window.__pcvMusique;
      window.__pcvMusique = maMusique;
    }
    if (window.__pcvLecteur && !window.__pcvLecteur.paused) window.__pcvLecteur.pause();
    if (window.__pcvFond !== monFond) window.__pcvFond = monFond;
    (window.__pcvManette ||= {}).themes = (b) => {
      if (!ouvert || !autonome) return false;
      if (b === 2 && !essai) {
        fermer();
        son("retour");
        return true;
      }
      return touche(b);
    };
    if (Array.isArray(window.__pcvOrdre) && !window.__pcvOrdre.includes("themes")) window.__pcvOrdre.unshift("themes");
  };
  const remonter = () => document.querySelectorAll(".pcv-fond").forEach((c) => {
    const h = c.parentElement;
    if (h && ![...decors].some((d) => d.cv === c)) {
      c.remove();
      monter(h);
    }
  });
  if (window.__pcvTouchesThemes) window.removeEventListener("keydown", window.__pcvTouchesThemes, true);
  window.addEventListener("keydown", window.__pcvTouchesThemes = (e) => {
    if (!ouvert || !autonome || document.activeElement?.matches?.("input,textarea")) return;
    const k = { ArrowLeft: 11, ArrowRight: 12, ArrowUp: 9, ArrowDown: 10, Enter: 1, Escape: 2, x: 3, X: 3, y: 4, Y: 4, PageUp: 5, PageDown: 6, q: 5, e: 6 }[e.key];
    if (k && window.__pcvManette.themes(k)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
  fins.push(() => window.removeEventListener("keydown", window.__pcvTouchesThemes, true));
  const ECRANS_IDS = /* @__PURE__ */ new Set([...HOTES, "pcv-miimaker", "pcv-deco", "pcv-connexion"]);
  let ecranId = 0;
  const surEcran = (ms) => {
    if (ecranId) return;
    for (const m of ms) {
      const c = m.target;
      if (c === document.body || c === document.documentElement || ECRANS_IDS.has(c.id) || c.classList?.contains("pcv-panneau") || [...m.addedNodes, ...m.removedNodes].some((n) => ECRANS_IDS.has(n.id) || n.classList?.contains("pcv-panneau"))) {
        ecranId = requestAnimationFrame(() => {
          ecranId = 0;
          musique();
        });
        return;
      }
    }
  };
  const obs = new MutationObserver(surEcran);
  obs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-pcv-page", "hidden", "class", "data-ecran", "data-cat"] });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  let tic = 0;
  const suivi = setInterval(() => {
    brancher();
    remonter();
    if (++tic % 5 === 0) musique();
  }, 400);
  fins.push(() => {
    clearInterval(suivi);
    obs.disconnect();
    cancelAnimationFrame(ecranId);
  });
  const visibilite = () => musique();
  document.addEventListener("visibilitychange", visibilite);
  fins.push(() => document.removeEventListener("visibilitychange", visibilite));
  fins.push(() => {
    if (window.__pcvSon === monSon) window.__pcvSon = sonOrigine;
    if (window.__pcvMusique === maMusique) window.__pcvMusique = maMusique.origine;
  });
  brancher();
  appliquer(lire("pcv-theme", "verre"));
  remonter();
  charger().then(() => musique());
  const surApparence = () => {
    if (!courant) return;
    style.textContent = variables(courant);
    poserIcones(courant);
    verifier();
  };
  window.addEventListener("pcv-apparence", surApparence);
  fins.push(() => window.removeEventListener("pcv-apparence", surApparence));
  window.__pcvThemes = {
    appliquer: (id) => appliquer(id),
    actuel: () => courant?.id,
    sombre: () => !!courant?.sombre,
    ouvrir,
    fermer,
    touche,
    musiqueDe: (page) => musiqueDe(page),
    // pour les autres scripts : fond CSS d'un espace (ex. la place 3D, la boutique), et le catalogue complet
    // (echelle : version réduite, attachée à sa boîte, pour une vignette)
    fondDe: (espace, id, echelle) => {
      const t = id ? trouver(id) : courant;
      return t && ESPACES[espace] ? fondsDe(t, espace, echelle ? { k: echelle, fixe: false } : {}).complet : null;
    },
    liste: () => tous().map((t) => ({ id: t.id, nom: t.nom, cat: t.cat, famille: t.famille, accent: t.accent })),
    // le fond « télé » d'un thème Themezer Wii U (sinon rien) : décor de la place des Mii (place3d.js)
    teleActuel: () => courant?.tele ? img(courant.tele) : null,
    manetteActuel: () => courant?.manette ? img(courant.manette) : null
  };
  return "th\xE8mes pr\xEAts";
})();
