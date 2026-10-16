(() => {
  window.__pcvIconesFin?.();
  const O = window.opener || window;
  const P = (d) => `<g fill="currentColor" stroke="none">${d}</g>`;
  const WIFI_EP = 5, WIFI_POINT = 4;
  const arcWifi = (r) => {
    const k = Math.SQRT1_2, ri = r - WIFI_EP, x = (v) => v.toFixed(2);
    return `M${x(18 - r * k)} ${x(28.5 - r * k)} A${r} ${r} 0 0 1 ${x(18 + r * k)} ${x(28.5 - r * k)} L${x(18 + ri * k)} ${x(28.5 - ri * k)} A${ri} ${ri} 0 0 0 ${x(18 - ri * k)} ${x(28.5 - ri * k)} Z`;
  };
  const WIFI = [`M${18 - WIFI_POINT} 28.5a${WIFI_POINT} ${WIFI_POINT} 0 1 0 ${2 * WIFI_POINT} 0a${WIFI_POINT} ${WIFI_POINT} 0 1 0 ${-2 * WIFI_POINT} 0Z`, arcWifi(11), arcWifi(18), arcWifi(25)];
  WIFI.forEach((d, i) => document.documentElement.style.setProperty("--pcv-wifi-d" + i, `path("${d}")`));
  const D = {
    accueil: P('<path d="M12 3.2 2.7 10.5c-.6.5-.3 1.5.5 1.5H5v8a1 1 0 0 0 1 1h4.2v-6h3.6v6H18a1 1 0 0 0 1-1v-8h1.8c.8 0 1.1-1 .5-1.5z"/>'),
    bibliotheque: P('<rect x="3.5" y="3.5" width="7.6" height="7.6" rx="2"/><rect x="12.9" y="3.5" width="7.6" height="7.6" rx="2"/><rect x="3.5" y="12.9" width="7.6" height="7.6" rx="2"/><rect x="12.9" y="12.9" width="7.6" height="7.6" rx="2"/>'),
    boutique: P('<path fill-rule="evenodd" d="M8 7.5a4 4 0 0 1 8 0h2.3c.5 0 .9.4 1 .9l1 11.5c0 .6-.4 1.1-1 1.1H4.7c-.6 0-1-.5-1-1.1l1-11.5c.1-.5.5-.9 1-.9zm2 0a2 2 0 0 1 4 0z"/>'),
    amis: P('<circle cx="9" cy="7.8" r="3.7"/><path d="M2.4 20.2a6.6 6.6 0 0 1 13.2 0z"/><circle cx="17.2" cy="8.8" r="2.9"/><path d="M15.6 13.8a5.6 5.6 0 0 1 6 6.4h-4.3a8.3 8.3 0 0 0-1.7-6.4z"/>'),
    notifications: P('<path d="M12 2.3c.9 0 1.6.7 1.6 1.6v.6a6.6 6.6 0 0 1 5 6.4v4.6l1.8 2.3c.4.5 0 1.3-.6 1.3H4.2c-.6 0-1-.8-.6-1.3l1.8-2.3v-4.6a6.6 6.6 0 0 1 5-6.4v-.6c0-.9.7-1.6 1.6-1.6z"/><path d="M9.4 20.3h5.2a2.6 2.6 0 0 1-5.2 0z"/>'),
    album: P('<path fill-rule="evenodd" d="M6.2 3.8h11.6a3 3 0 0 1 3 3v10.4a3 3 0 0 1-3 3H6.2a3 3 0 0 1-3-3V6.8a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v10.4a1 1 0 0 0 1 1h11.6a1 1 0 0 0 1-1V6.8a1 1 0 0 0-1-1z"/><circle cx="9" cy="9.6" r="2"/><path d="M6.3 17.2l4.6-4.6 3 3 2.2-2.1 2.6 3.7z"/>'),
    telechargements: P('<path d="M10.4 2.8h3.2v8.1h3.3c.5 0 .8.6.4 1L12.4 17c-.2.3-.6.3-.8 0l-4.9-5.1c-.4-.4-.1-1 .4-1h3.3z"/><path d="M3.6 16.4h3.2v2h10.4v-2h3.2v3.8c0 .5-.4.9-.9.9H4.5a.9.9 0 0 1-.9-.9z"/>'),
    parametres: P('<path fill-rule="evenodd" d="M10.3 2h3.4l.5 2.6 1.7.7 2.2-1.5 2.4 2.4-1.5 2.2.7 1.7 2.6.5v3.4l-2.6.5-.7 1.7 1.5 2.2-2.4 2.4-2.2-1.5-1.7.7-.5 2.6h-3.4l-.5-2.6-1.7-.7-2.2 1.5-2.4-2.4 1.5-2.2-.7-1.7L2 13.7v-3.4l2.6-.5.7-1.7-1.5-2.2 2.4-2.4 2.2 1.5 1.7-.7zM12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2z"/>'),
    perso: P('<path fill-rule="evenodd" d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.7-1.3-.7-2.1 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3zM7.5 9.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zM11 5.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zm4.6 1.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/>'),
    miimaker: P('<path fill-rule="evenodd" d="M12 3c4.4 0 7.5 3.2 7.5 7.6 0 4.9-3.4 8.9-7.5 8.9s-7.5-4-7.5-8.9C4.5 6.2 7.6 3 12 3zM9.3 9.6a1.1 1.4 0 1 0 0 2.8 1.1 1.4 0 0 0 0-2.8zm5.4 0a1.1 1.4 0 1 0 0 2.8 1.1 1.4 0 0 0 0-2.8zM9.4 14.6c1.5 1.3 3.7 1.3 5.2 0l.7.8c-1.9 1.8-4.7 1.8-6.6 0z"/>'),
    // le casino : une pièce dorée à « L » vert, comme celles du casino de Luigi (aplats seulement : un dégradé SVG nommé,
    // répété dans chaque tuile, disparaît quand sa première copie est cachée)
    casino: '<circle cx="12" cy="12" r="9.2" fill="#e9b52f" stroke="#fff" stroke-width="1.6"/><circle cx="11" cy="10.6" r="6.6" fill="#f6d466" stroke="none"/><path d="M10 7.2v9.3h5" fill="none" stroke="#2ea84a" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
    alimentation: '<path d="M12 3v9"/><path d="M6.3 7.3a8 8 0 1 0 11.4 0"/>',
    manette: '<path d="M7 8h10a5 5 0 0 1 4.8 6.3l-.8 3a2.5 2.5 0 0 1-4.3 1L15 16H9l-1.7 2.3a2.5 2.5 0 0 1-4.3-1l-.8-3A5 5 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3"/>',
    // taille d'un jeu (fiche d'un raccourci Switch, greffon/fiche.js) : un disque
    disque: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 15h.01M11 15h6"/>',
    // date de sortie (fiche d'un raccourci Switch) : un calendrier
    calendrier: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    // genre (fiche d'un raccourci Switch) : une étiquette
    tag: '<path d="M12.6 3.4 20 10.8a2 2 0 0 1 0 2.8l-6.4 6.4a2 2 0 0 1-2.8 0L3.4 12.6V5.4A2 2 0 0 1 5.4 3.4z"/><circle cx="8.6" cy="8.6" r="1.4" fill="currentColor" stroke="none"/>',
    // classification d'âge (PEGI, fiche d'un raccourci Switch) : un bouclier
    bouclier: '<path d="M12 3.3 19 6v6c0 4.6-3 7.6-7 8.7-4-1.1-7-4.1-7-8.7V6z"/><path d="M12 8v4.5M12 16h.01"/>',
    // repli « en anglais » (fiche d'un raccourci Switch, langue manquante) : un globe
    monde: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    lecture: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',
    // le lecteur de musique (réglages rapides v2, page Musique) : piste précédente, piste suivante
    precedent: '<path d="M6 5v14"/><path d="M18 5.5v13L9 12z" fill="currentColor"/>',
    suivant: '<path d="M18 5v14"/><path d="M6 5.5v13L15 12z" fill="currentColor"/>',
    horloge: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".7" fill="currentColor"/>',
    sortie: '<path d="M13.5 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20h7"/><path d="M10 12h10M16.5 8.5 20 12l-3.5 3.5"/>',
    fleche: '<path d="M9 5l7 7-7 7"/>',
    livre: '<path d="M3 5.5c3-1.3 6-1.3 9 .5 3-1.8 6-1.8 9-.5V19c-3-1.3-6-1.3-9 .5-3-1.8-6-1.8-9-.5z"/><path d="M12 6v13.5"/>',
    crayon: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10.5l5-3v9l-5-3"/>',
    reglages: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    soleil: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6"/><path d="M18 6.5a8 8 0 0 1 0 11"/>',
    // le son coupé (OSD du volume, barre-haut.js) : le haut-parleur barré
    "volume-coupe": '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9.5l5 5M20.5 9.5l-5 5"/>',
    micro: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>',
    casque: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6" rx="1.5"/>',
    ecran: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    // Wi-Fi (règle de l'auteur) : un éventail de trois arcs et un point, rempli selon la force du signal (niveau 0 à 3 :
    // les arcs au-delà restent pâles) ; jamais des barres de réseau mobile
    wifi: (niveau = 3) => '<g fill="currentColor" stroke="none" transform="scale(.6667)">' + WIFI.map((d, i) => `<path d="${d}"${i > niveau ? ' opacity=".28"' : ""}/>`).join("") + "</g>",
    bluetooth: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
    avion: '<path d="M10.5 3.5a1.5 1.5 0 0 1 3 0V9l7.5 4.5v2L13.5 13v4.5l2.5 2v1.5l-4-1-4 1V19.5l2.5-2V13L3 15.5v-2L10.5 9z"/>',
    silence: '<path d="M6 16V11a6 6 0 0 1 9.5-4.9M18 10.5V16l1.5 2H8"/><path d="M10 20.5a2 2 0 0 0 4 0"/><path d="M3.5 3.5l17 17"/>',
    lune: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    perf: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-6"/>',
    musique: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    // (onglet Paroles de la page Musique et page SteamU, Confidentialité : dessins de banc/maquette-paroles/index.html)
    paroles: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2z"/><path d="M8 8.3h8M8 11.6h5"/>',
    cadenas: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    clavier: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h1M9.5 10h1M13 10h1M16.5 10h1M7 14h10"/>',
    aide: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><circle cx="12" cy="17" r=".9"/>',
    prise: '<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>',
    epingle: '<path d="M9 3h6l-1 6 3.5 3.5V14h-11v-1.5L10 9z"/><path d="M12 14v7"/>',
    // poubelle (en-tête d'un dossier ouvert, console.js : Supprimer) — même langage que crayon/sortie/epingle, jamais un
    // simple caractère Unicode (revue de propreté du 15/10, point 2/10 : les quatre boutons de l'en-tête doivent se
    // ressembler, sans reprendre un badge de touche déjà montré dans la légende du bas)
    supprimer: '<path d="M4.5 7h15"/><path d="M9.5 7V4.8A1.8 1.8 0 0 1 11.3 3h1.4a1.8 1.8 0 0 1 1.8 1.8V7"/><path d="M6.3 7l1 12a1.8 1.8 0 0 0 1.8 1.7h5.8a1.8 1.8 0 0 0 1.8-1.7l1-12"/><path d="M10 11v6M14 11v6"/>'
  };
  const trace = (n, niveau) => typeof D[n] === "function" ? D[n](Number.isInteger(+niveau) && niveau !== "" && niveau != null ? Math.max(0, Math.min(3, +niveau)) : void 0) : D[n] || "";
  const image = (n) => {
    const t = O.__pcvIconesTheme?.[n];
    return t && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(t.url) ? t : null;
  };
  const habit = (t) => t.teinte ? `-webkit-mask:url("${t.url}") center/contain no-repeat;mask:url("${t.url}") center/contain no-repeat;background:currentColor` : `background:url("${t.url}") center/contain no-repeat`;
  const svg = (n, o = {}) => {
    const t = image(n);
    return `<svg${o.classe ? ` class="${o.classe}"` : ""} viewBox="0 0 24 24" data-ico="${n}"${o.niveau != null ? ` data-niveau="${+o.niveau | 0}"` : ""}${o.attrs ? " " + o.attrs : ""}${t ? ` style='${habit(t)}'` : ""}>${t ? "" : trace(n, o.niveau)}</svg>`;
  };
  const masque = (n, ep = 2.4) => {
    const t = image(n);
    if (t) return `url("${t.url}")`;
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="${ep}" stroke-linecap="round" stroke-linejoin="round">${trace(n)}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  };
  const rafraichir = (r = document) => {
    for (const el of r.querySelectorAll("svg[data-ico]")) {
      const t = image(el.dataset.ico);
      if (t) {
        el.setAttribute("style", habit(t));
        el.innerHTML = "";
      } else {
        el.removeAttribute("style");
        el.innerHTML = trace(el.dataset.ico, el.dataset.niveau);
      }
    }
    for (const el of r.querySelectorAll("[data-ico-masque]")) el.style.setProperty("--m", masque(el.dataset.icoMasque, +el.dataset.icoEp || 2.4));
  };
  const MAX = 256 * 1024;
  let jeton = 0;
  const lire = async (u) => {
    const b = await (await fetch(u)).blob();
    if (b.size > MAX || !/^image\/(png|jpeg|webp)$/.test(b.type)) return null;
    const url = await new Promise((ok, non) => {
      const f = new FileReader();
      f.onload = () => ok(f.result);
      f.onerror = non;
      f.readAsDataURL(b);
    });
    let teinte = false;
    try {
      const im = await createImageBitmap(b), c = document.createElement("canvas");
      c.width = c.height = 32;
      const x = c.getContext("2d", { willReadFrequently: true });
      x.drawImage(im, 0, 0, 32, 32);
      im.close();
      const p = x.getImageData(0, 0, 32, 32).data;
      let op = 0, sat = 0;
      for (let i = 0; i < p.length; i += 4) if (p[i + 3] > 128) {
        const M = Math.max(p[i], p[i + 1], p[i + 2]), m = Math.min(p[i], p[i + 1], p[i + 2]);
        op++;
        sat += M ? (M - m) / M : 0;
      }
      teinte = op > 0 && sat / op < 0.2;
    } catch (e) {
    }
    return { url, teinte };
  };
  const theme = async (images = {}) => {
    const j = ++jeton, res = {};
    for (const [n, u] of Object.entries(images)) if (D[n] && typeof u === "string") try {
      const t = await lire(u);
      if (t) res[n] = t;
    } catch (e) {
    }
    if (j !== jeton) return;
    const avant = JSON.stringify(O.__pcvIconesTheme || {});
    if (avant === JSON.stringify(res)) return;
    O.__pcvIconesTheme = res;
    O.dispatchEvent(new Event("pcv-icones"));
  };
  const maj = () => rafraichir(document);
  O.addEventListener("pcv-icones", maj);
  const fin = () => O.removeEventListener("pcv-icones", maj);
  window.addEventListener("pagehide", fin);
  window.__pcvIconesFin = () => {
    fin();
    window.removeEventListener("pagehide", fin);
  };
  window.__pcvIcones = { svg, trace, masque, rafraichir, theme, existe: (n) => !!D[n] };
})();
