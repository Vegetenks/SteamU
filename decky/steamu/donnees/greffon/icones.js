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
  const KENNEY = "matrix(.46 0 0 .46 -2.72 -2.72)";
  const kenney = (...d) => P(d.map((x) => `<path fill-rule="evenodd" transform="${KENNEY}" d="${x}"/>`).join(""));
  const MAN = { stick: 1.3, croix: 1.15, croixEp: 0.42, bouton: 0.42, ecart: 0.9, pave: 1.2, pastille: 1.5 };
  const f2 = (v) => +v.toFixed(2);
  const rond = (x, y, r) => `M${f2(x - r)} ${f2(y)}a${r} ${r} 0 1 0 ${f2(2 * r)} 0a${r} ${r} 0 1 0 ${f2(-2 * r)} 0Z`;
  const boite = (x1, y1, x2, y2, r) => `M${f2(x1 + r)} ${f2(y1)}H${f2(x2 - r)}a${r} ${r} 0 0 1 ${r} ${r}V${f2(y2 - r)}a${r} ${r} 0 0 1 ${-r} ${r}H${f2(x1 + r)}a${r} ${r} 0 0 1 ${-r} ${-r}V${f2(y1 + r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
  const croix = (x, y, l, e) => `M${f2(x - e)} ${f2(y - l)}h${f2(2 * e)}v${f2(l - e)}h${f2(l - e)}v${f2(2 * e)}h${f2(e - l)}v${f2(l - e)}h${f2(-2 * e)}v${f2(e - l)}h${f2(e - l)}v${f2(-2 * e)}h${f2(l - e)}Z`;
  const CMD = {
    s: (x, y, r = MAN.stick) => rond(x, y, r),
    c: (x, y, l = MAN.croix) => croix(x, y, l, MAN.croixEp),
    b: (x, y) => [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([i, j]) => rond(x + i * MAN.ecart, y + j * MAN.ecart, MAN.bouton)).join(""),
    p: (x, y, h = MAN.pave) => boite(x - h, y - h, x + h, y + h, 0.4),
    o: (x, y, r = MAN.pastille, l = MAN.croix * 0.8) => rond(x, y, r) + croix(x, y, l, MAN.croixEp),
    r: boite,
    // a : un stick dans son anneau (lumineux sur les Legion, les Ally) ; f : une grille de haut-parleur, n fentes
    d: (x, y, n = 4, k = 0.5) => Array.from({ length: n }, (_, i) => {
      const x0 = f2(x + (i - (n - 1) / 2) * 0.5 + k / 2 - 0.1);
      return `M${x0} ${f2(y - 0.7)}h.22L${f2(x0 + 0.22 - k)} ${f2(y + 0.7)}h-.22Z`;
    }).join(""),
    a: (x, y, r, n) => rond(x, y, r) + rond(x, y, n),
    f: (x, y, n = 4) => Array.from({ length: n }, (_, i) => boite(f2(x + (i - (n - 1) / 2) * 0.45 - 0.1), y - 0.65, f2(x + (i - (n - 1) / 2) * 0.45 + 0.1), y + 0.65, 0.1)).join(""),
    g: (x, y, r = MAN.bouton) => rond(x, y, r),
    m: (x, y) => boite(x - 0.6, y - 0.24, x + 0.6, y + 0.24, 0.24),
    "+": (x, y) => croix(x, y, 0.7, 0.24),
    B: (x, y, e, r) => [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([i, j]) => rond(x + i * e, y + j * e, r)).join("")
  };
  const portable = (corps, ...cmd) => P(`<path fill-rule="evenodd" d="${[].concat(corps).join("")}${cmd.map(([k, ...v]) => CMD[k](...v)).join("")}"/>`);
  const legion = ({ g, d, y1, y2, ecran, cg, cd }) => portable([g, boite(3.85, y1, 20.15, y2, 0.4), d], ["r", ...ecran, 0.3], ...cg, ...cd);
  const DETACHEES = { k: 2, jour: 0.35 };
  const detachees = ({ g, d, cg, cd }) => {
    const { k, jour } = DETACHEES, cmd = (l) => l.map(([c, ...v]) => CMD[c](...v)).join("");
    return P(`<path fill-rule="evenodd" transform="translate(12 12) scale(${k}) translate(${-3.6 - jour} -12)" d="${g}${cmd(cg)}"/><path fill-rule="evenodd" transform="translate(12 12) scale(${k}) translate(${-20.4 + jour} -12)" d="${d}${cmd(cd)}"/>`);
  };
  const LEGION1 = {
    g: "M3.7 6.76H.8Q.1 6.76.1 7.46V15.9L1.43 17.23H3.7Z",
    d: "M20.3 6.76H23.2Q23.9 6.76 23.9 7.46V15.9L22.57 17.23H20.3Z",
    y1: 6.76,
    y2: 17.23,
    ecran: [4.4, 7.3, 19.6, 16.66],
    cg: [["s", 1.3, 9, 0.95], ["c", 2.35, 11.1, 0.95], ["m", 2.35, 13.45], ["m", 2.35, 14.55]],
    cd: [["B", 22.6, 9.15, 0.73, 0.3], ["s", 21.4, 11.15, 0.95], ["p", 21.7, 13.55, 1.1]]
  };
  const LEGION2 = {
    g: "M3.6 6.45H1.6C.6 6.45.1 7.3.1 8.6V15C.1 16.6 1 17.55 2.4 17.55H3.6Z",
    d: "M20.4 6.45H22.4C23.4 6.45 23.9 7.3 23.9 8.6V15C23.9 16.6 23 17.55 21.6 17.55H20.4Z",
    y1: 6.4,
    y2: 17.6,
    ecran: [4.2, 7.1, 19.8, 16.8],
    cg: [["a", 1.6, 9, 1.15, 0.8], ["o", 2.3, 11.45, 0.95, 0.72], ["m", 2.35, 13.45], ["m", 2.35, 14.5]],
    cd: [["B", 22.3, 9, 0.73, 0.32], ["a", 21.75, 11.45, 1.15, 0.8], ["p", 21.75, 13.75, 0.95]]
  };
  const JC = { h1: 22, l1: 7.74, r1: 3.6, h2: 23.6, l2: 7.9, r2: 3.7 };
  const jcG = (x, n) => {
    const h = JC["h" + n], l = JC["l" + n], r = JC["r" + n], y = 12 - h / 2;
    return `M${f2(x + l)} ${y}H${f2(x + r)}A${r} ${r} 0 0 0 ${x} ${f2(y + r)}V${f2(y + h - r)}A${r} ${r} 0 0 0 ${f2(x + r)} ${f2(y + h)}H${f2(x + l)}Z`;
  };
  const jcD = (x, n) => {
    const h = JC["h" + n], l = JC["l" + n], r = JC["r" + n], y = 12 - h / 2;
    return `M${x} ${y}H${f2(x + l - r)}A${r} ${r} 0 0 1 ${f2(x + l)} ${f2(y + r)}V${f2(y + h - r)}A${r} ${r} 0 0 1 ${f2(x + l - r)} ${f2(y + h)}H${x}Z`;
  };
  const jc1G = (x) => [jcG(x, 1), ["r", x + 6.85, 2.2, x + 7.25, 21.8, 0.2], ["m", x + 5.4, 3], ["s", x + 3.7, 6.8, 1.9], ["B", x + 3.7, 12.2, 1.3, 0.6], ["p", x + 4.6, 16.8, 0.55]];
  const jc1D = (x) => [jcD(x, 1), ["r", x + 0.5, 2.2, x + 0.9, 21.8, 0.2], ["+", x + 2.3, 3], ["B", x + 4, 6.8, 1.3, 0.6], ["s", x + 4, 12.2, 1.9], ["g", x + 3, 16.8, 0.62]];
  const jc2G = (x) => [jcG(x, 2), ["r", x + 7.05, 1.4, x + 7.45, 22.6, 0.2], ["m", x + 5.5, 2.1], ["s", x + 3.85, 6.4, 1.95], ["B", x + 3.85, 12.2, 1.3, 0.6], ["p", x + 4.75, 17.2, 0.55]];
  const jc2D = (x) => [jcD(x, 2), ["r", x + 0.45, 1.4, x + 0.85, 22.6, 0.2], ["+", x + 2.4, 2.1], ["B", x + 4.05, 6.4, 1.3, 0.6], ["s", x + 4.05, 12.2, 1.95], ["g", x + 3.1, 17.2, 0.62], ["g", x + 3.1, 19, 0.5]];
  const joycons = (...l) => {
    const corps = l.map((x) => x[0]), cmd = l.flatMap((x) => x.slice(1));
    return portable(corps, ...cmd);
  };
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
    // les vraies manettes (16/10) : silhouettes de Kenney (CC0)
    "manette-xbox": kenney("M25 31 L25 33 23 33 23 35 25 35 25 37 27 37 27 35 29 35 29 33 27 33 27 31 25 31 M39 34 Q39 32.75 38.15 31.85 37.3 31 36 31 34.75 31 33.9 31.85 33 32.75 33 34 33 35.25 33.9 36.15 34.75 37 36 37 37.3 37 38.15 36.15 39 35.25 39 34 M41 27 Q41 26.15 40.4 25.55 39.85 25 39 25 38.15 25 37.6 25.55 37 26.15 37 27 37 27.8 37.6 28.4 38.15 29 39 29 39.85 29 40.4 28.4 41 27.8 41 27 M34 22 Q34 21.15 33.45 20.55 32.85 20 32 20 31.15 20 30.6 20.55 30 21.15 30 22 30 22.85 30.6 23.45 31.15 24 32 24 32.85 24 33.45 23.45 34 22.85 34 22 M24 25.5 Q24 24.05 23 23 22 22 20.5 22 19.05 22 18.05 23 17 24.05 17 25.5 17 26.95 18.05 28 19.05 29 20.5 29 22 29 23 28 24 26.95 24 25.5 M45 31 Q45 30.15 44.4 29.55 43.85 29 43 29 42.15 29 41.6 29.55 41 30.15 41 31 41 31.8 41.6 32.4 42.15 33 43 33 43.85 33 44.4 32.4 45 31.8 45 31 M49 27 Q49 26.15 48.4 25.55 47.85 25 47 25 46.15 25 45.6 25.55 45 26.15 45 27 45 27.8 45.6 28.4 46.15 29 47 29 47.85 29 48.4 28.4 49 27.8 49 27 M45 23 Q45 22.15 44.4 21.55 43.85 21 43 21 42.15 21 41.6 21.55 41 22.15 41 23 41 23.8 41.6 24.4 42.15 25 43 25 43.85 25 44.4 24.4 45 23.8 45 23 M23.55 39.45 Q21.15 39.35 19.6 41.55 L15.1 47.4 Q14.15 48.5 13.2 49 9.45 48.35 8.7 45.75 7.55 41.85 8.3 37.5 9.7 30.8 12.15 24.45 14 19.1 15.2 19 L15.5 17.95 Q15.75 17.05 18.15 16.1 L21.05 15.2 Q23 14.8 23.75 15.2 25.1 16 25.85 16 L38.1 16 Q38.85 16 40.25 15.2 41 14.8 42.95 15.2 L45.8 16.1 Q48.25 17.05 48.5 17.95 L48.8 19 Q50 19.1 51.85 24.45 54.3 30.8 55.7 37.5 56.45 41.85 55.3 45.75 54.5 48.35 50.8 49 49.85 48.5 48.85 47.4 46.55 44.75 44.4 41.55 42.85 39.35 40.4 39.45 L23.55 39.45"),
    "manette-ps4": kenney("M26 18 Q24 18 24 20 L24 25.5 Q24 27.5 26 27.5 L38 27.5 Q40 27.5 40 25.5 L40 20 Q40 18 38 18 L26 18M43 32 Q43 30.75 42.2 29.85 41.3 29 40 29 38.75 29 37.9 29.85 37 30.75 37 32 37 33.3 37.9 34.2 38.75 35 40 35 41.3 35 42.2 34.2 43 33.3 43 32M45 26.5 Q45 25.85 44.55 25.4 44.15 25 43.5 25 42.85 25 42.45 25.4 42 25.85 42 26.5 42 27.1 42.45 27.55 42.85 28 43.5 28 L44.55 27.55 Q45 27.1 45 26.5M48 29.5 Q48 28.85 47.55 28.4 47.15 28 46.5 28 45.85 28 45.45 28.4 45 28.85 45 29.5 45 30.1 45.45 30.55 45.85 31 46.5 31 L47.55 30.55 48 29.5M51 26.5 Q51 25.85 50.55 25.4 50.15 25 49.5 25 48.85 25 48.45 25.4 48 25.85 48 26.5 48 27.1 48.45 27.55 48.85 28 49.5 28 50.15 28 50.55 27.55 L51 26.5M48 23.5 Q48 22.85 47.55 22.4 47.15 22 46.5 22 45.85 22 45.45 22.4 45 22.85 45 23.5 45 24.1 45.45 24.55 45.85 25 46.5 25 L47.55 24.55 48 23.5M39.5 17.45 Q40.05 17.45 40.2 17.75 L41.4 17.75 Q43 17.8 43.35 17.25 L43.7 17.25 43.7 16.65 Q44.9 15.95 46.8 16 48.5 16 49.7 16.65 L49.7 17.25 50.3 17.55 Q51.9 19.65 53.05 23.05 L54.95 30.65 Q55.8 34.45 55.95 38.85 56.25 42 54.75 44.25 53.5 46.15 50.75 46 48.4 45.8 47.35 44.15 L45.35 40.5 43.75 35.8 42.85 35.25 Q41.4 36.7 39.4 36.5 37.8 36.5 36.25 35.2 L27.75 35.2 Q26.2 36.5 24.6 36.5 22.6 36.7 21.15 35.25 20.45 35.4 20.25 35.8 L18.65 40.5 16.6 44.15 Q15.6 45.8 13.25 46 10.5 46.15 9.25 44.25 7.75 42 8.05 38.85 8.2 34.45 9.05 30.65 L10.95 23.05 Q12.1 19.65 13.7 17.55 L14.3 17.25 14.3 16.65 Q15.45 16 17.2 16 19.1 15.95 20.3 16.65 L20.3 17.25 20.65 17.25 Q21 17.8 22.6 17.75 L23.8 17.75 Q23.9 17.45 24.5 17.45 L39.5 17.45M23 24 L21 24 19 26 21 28 23 28 23 24M16 21 L16 23 18 25 20 23 20 21 16 21M27 32 Q27 30.75 26.2 29.85 25.3 29 24 29 22.75 29 21.9 29.85 21 30.75 21 32 21 33.3 21.9 34.2 22.75 35 24 35 25.3 35 26.2 34.2 27 33.3 27 32M16 31 L20 31 20 29 18 27 16 29 16 31M13 24 L13 28 15 28 17 26 15 24 13 24"),
    "manette-ps5-edge": kenney("M39.45 20.5 Q40 18 37.35 18 L26.7 18 Q24 18 24.55 20.5 L25.65 25.4 Q26 27 28 27 L36 27 Q38 27 38.35 25.4 L39.45 20.5 M42 32 Q42 30.75 41.2 29.85 40.3 29 39 29 37.75 29 36.9 29.85 36 30.75 36 32 36 33.3 36.9 34.2 37.75 35 39 35 40.3 35 41.2 34.2 42 33.3 42 32 M45 26.5 Q45 25.85 44.55 25.4 44.15 25 43.5 25 42.85 25 42.45 25.4 42 25.85 42 26.5 42 27.1 42.45 27.55 42.85 28 43.5 28 L44.55 27.55 Q45 27.1 45 26.5 M48 29.5 Q48 28.85 47.55 28.4 47.15 28 46.5 28 45.85 28 45.45 28.4 45 28.85 45 29.5 45 30.1 45.45 30.55 45.85 31 46.5 31 L47.55 30.55 48 29.5 M51 26.5 Q51 25.85 50.55 25.4 50.15 25 49.5 25 48.85 25 48.45 25.4 48 25.85 48 26.5 48 27.1 48.45 27.55 48.85 28 49.5 28 50.15 28 50.55 27.55 L51 26.5 M48 23.5 Q48 22.85 47.55 22.4 47.15 22 46.5 22 45.85 22 45.45 22.4 45 22.85 45 23.5 45 24.1 45.45 24.55 45.85 25 46.5 25 L47.55 24.55 48 23.5 M32 16.4 L43.15 17.2 43.7 17.1 43.85 16.2 46.8 16.05 Q48.55 16.35 50 17.3 L50.15 18.25 50.9 18.45 Q53.25 23.25 54.65 28.5 55.55 32.3 55.9 36.35 56.25 40.1 55.45 43.75 55.15 46.05 52.9 47.4 L49.45 48 Q48.95 47.9 48.6 47.1 L46.7 42.45 Q45.8 39.85 44.2 37.6 43.5 36.65 41.6 36.6 L40.6 36.75 40.55 36.75 37.5 36.95 26.5 36.95 23.45 36.75 23.4 36.75 22.4 36.6 Q20.5 36.65 19.8 37.6 18.2 39.85 17.3 42.45 L15.4 47.1 Q15.05 47.9 14.55 48 L11.1 47.4 Q8.85 46.05 8.55 43.75 7.75 40.1 8.1 36.35 8.45 32.3 9.35 28.5 10.75 23.25 13.1 18.45 L13.85 18.25 14 17.3 Q15.45 16.35 17.2 16.05 L20.15 16.2 20.3 17.1 20.85 17.2 32 16.4 M23 24 L21 24 19 26 21 28 23 28 23 24 M16 21 L16 23 18 25 20 23 20 21 16 21 M28 32 Q28 30.75 27.2 29.85 26.3 29 25 29 23.75 29 22.9 29.85 22 30.75 22 32 22 33.3 22.9 34.2 23.75 35 25 35 26.3 35 27.2 34.2 28 33.3 28 32 M16 31 L20 31 20 29 18 27 16 29 16 31 M13 24 L13 28 15 28 17 26 15 24 13 24M23.4 37.7 L26.6 37.7 Q27.5 37.7 27.5 38.6 27.5 39.5 26.6 39.5 L23.4 39.5 Q22.5 39.5 22.5 38.6 22.5 37.7 23.4 37.7M37.4 37.7 L40.6 37.7 Q41.5 37.7 41.5 38.6 41.5 39.5 40.6 39.5 L37.4 39.5 Q36.5 39.5 36.5 38.6 36.5 37.7 37.4 37.7"),
    "manette-ps5": kenney("M39.45 20.5 Q40 18 37.35 18 L26.7 18 Q24 18 24.55 20.5 L25.65 25.4 Q26 27 28 27 L36 27 Q38 27 38.35 25.4 L39.45 20.5 M42 32 Q42 30.75 41.2 29.85 40.3 29 39 29 37.75 29 36.9 29.85 36 30.75 36 32 36 33.3 36.9 34.2 37.75 35 39 35 40.3 35 41.2 34.2 42 33.3 42 32 M45 26.5 Q45 25.85 44.55 25.4 44.15 25 43.5 25 42.85 25 42.45 25.4 42 25.85 42 26.5 42 27.1 42.45 27.55 42.85 28 43.5 28 L44.55 27.55 Q45 27.1 45 26.5 M48 29.5 Q48 28.85 47.55 28.4 47.15 28 46.5 28 45.85 28 45.45 28.4 45 28.85 45 29.5 45 30.1 45.45 30.55 45.85 31 46.5 31 L47.55 30.55 48 29.5 M51 26.5 Q51 25.85 50.55 25.4 50.15 25 49.5 25 48.85 25 48.45 25.4 48 25.85 48 26.5 48 27.1 48.45 27.55 48.85 28 49.5 28 50.15 28 50.55 27.55 L51 26.5 M48 23.5 Q48 22.85 47.55 22.4 47.15 22 46.5 22 45.85 22 45.45 22.4 45 22.85 45 23.5 45 24.1 45.45 24.55 45.85 25 46.5 25 L47.55 24.55 48 23.5 M32 16.4 L43.15 17.2 43.7 17.1 43.85 16.2 46.8 16.05 Q48.55 16.35 50 17.3 L50.15 18.25 50.9 18.45 Q53.25 23.25 54.65 28.5 55.55 32.3 55.9 36.35 56.25 40.1 55.45 43.75 55.15 46.05 52.9 47.4 L49.45 48 Q48.95 47.9 48.6 47.1 L46.7 42.45 Q45.8 39.85 44.2 37.6 43.5 36.65 41.6 36.6 L40.6 36.75 40.55 36.75 37.5 36.95 26.5 36.95 23.45 36.75 23.4 36.75 22.4 36.6 Q20.5 36.65 19.8 37.6 18.2 39.85 17.3 42.45 L15.4 47.1 Q15.05 47.9 14.55 48 L11.1 47.4 Q8.85 46.05 8.55 43.75 7.75 40.1 8.1 36.35 8.45 32.3 9.35 28.5 10.75 23.25 13.1 18.45 L13.85 18.25 14 17.3 Q15.45 16.35 17.2 16.05 L20.15 16.2 20.3 17.1 20.85 17.2 32 16.4 M23 24 L21 24 19 26 21 28 23 28 23 24 M16 21 L16 23 18 25 20 23 20 21 16 21 M28 32 Q28 30.75 27.2 29.85 26.3 29 25 29 23.75 29 22.9 29.85 22 30.75 22 32 22 33.3 22.9 34.2 23.75 35 25 35 26.3 35 27.2 34.2 28 33.3 28 32 M16 31 L20 31 20 29 18 27 16 29 16 31 M13 24 L13 28 15 28 17 26 15 24 13 24"),
    "manette-pro": kenney("M24.3 15.75 L39.7 15.75 Q40.7 15.3 41.7 15 47.05 14.9 49.85 17.35 L50.8 18.9 51.25 19.1 52.05 20.15 Q54.05 27.3 55.4 36.6 56.3 41.6 55.85 44.45 55.1 46.95 52.55 47.85 50.35 48.4 48.75 46.8 L45.65 41.25 Q44.5 38.05 42 38.25 L32 38.25 32 38.2 22 38.25 Q19.5 38.05 18.3 41.25 L15.2 46.8 Q13.65 48.35 11.45 47.85 8.9 46.95 8.15 44.45 7.7 41.6 8.6 36.6 9.95 27.3 11.95 20.15 L12.75 19.1 13.2 18.9 14.15 17.3 Q16.95 14.85 22.3 15 L24.3 15.75M24 29 L24 31 22 31 22 33 24 33 24 35 26 35 26 33 28 33 28 31 26 31 26 29 24 29M41 32 Q41 30.75 40.1 29.85 39.25 29 38 29 36.75 29 35.85 29.85 35 30.75 35 32 35 33.2 35.85 34.05 36.75 35 38 35 39.25 35 40.1 34.05 41 33.2 41 32M22 24 Q22 22.75 21.1 21.85 20.25 21 19 21 17.75 21 16.85 21.85 16 22.75 16 24 16 25.2 16.85 26.05 17.75 27 19 27 20.25 27 21.1 26.05 22 25.2 22 24M43 25 Q43 24.15 42.4 23.55 41.85 23 41 23 40.15 23 39.55 23.55 39 24.15 39 25 39 25.85 39.55 26.4 40.15 27 41 27 41.85 27 42.4 26.4 43 25.85 43 25M47 29 Q47 28.15 46.4 27.55 45.85 27 45 27 44.15 27 43.55 27.55 43 28.15 43 29 43 29.85 43.55 30.4 44.15 31 45 31 45.85 31 46.4 30.4 47 29.85 47 29M51 25 Q51 24.15 50.4 23.55 49.85 23 49 23 48.15 23 47.55 23.55 47 24.15 47 25 47 25.85 47.55 26.4 48.15 27 49 27 49.85 27 50.4 26.4 51 25.85 51 25M47 21 Q47 20.15 46.4 19.55 45.85 19 45 19 44.15 19 43.55 19.55 43 20.15 43 21 43 21.85 43.55 22.4 44.15 23 45 23 45.85 23 46.4 22.4 47 21.85 47 21"),
    "manette-pro-2": kenney("M21.55 38.9 Q20.05 38.9 19.4 40.5 L16.2 46.75 Q14.4 49.7 11.65 48.8 8.05 47.55 8 43 8.85 33.25 10.8 23.75 11.8 19.2 13.2 18.3 14.3 15.45 18.05 14.5 22.25 13.45 24.7 14.6 L39.3 14.6 Q41.75 13.45 45.95 14.5 49.7 15.45 50.85 18.3 52.2 19.2 53.2 23.75 55.15 33.25 56 43 55.95 47.55 52.35 48.8 49.6 49.7 47.8 46.75 L44.6 40.5 Q43.95 38.9 42.45 38.9 L21.55 38.9M24 29 L24 31 22 31 22 33 24 33 24 35 26 35 26 33 28 33 28 31 26 31 26 29 24 29M41 32 Q41 30.75 40.1 29.85 39.25 29 38 29 36.75 29 35.85 29.85 35 30.75 35 32 35 33.2 35.85 34.05 36.75 35 38 35 39.25 35 40.1 34.05 41 33.2 41 32M22 24 Q22 22.75 21.1 21.85 20.25 21 19 21 17.75 21 16.85 21.85 16 22.75 16 24 16 25.2 16.85 26.05 17.75 27 19 27 20.25 27 21.1 26.05 22 25.2 22 24M43 25 Q43 24.15 42.4 23.55 41.85 23 41 23 40.15 23 39.55 23.55 39 24.15 39 25 39 25.85 39.55 26.4 40.15 27 41 27 41.85 27 42.4 26.4 43 25.85 43 25M47 29 Q47 28.15 46.4 27.55 45.85 27 45 27 44.15 27 43.55 27.55 43 28.15 43 29 43 29.85 43.55 30.4 44.15 31 45 31 45.85 31 46.4 30.4 47 29.85 47 29M51 25 Q51 24.15 50.4 23.55 49.85 23 49 23 48.15 23 47.55 23.55 47 24.15 47 25 47 25.85 47.55 26.4 48.15 27 49 27 49.85 27 50.4 26.4 51 25.85 51 25M47 21 Q47 20.15 46.4 19.55 45.85 19 45 19 44.15 19 43.55 19.55 43 20.15 43 21 43 21.85 43.55 22.4 44.15 23 45 23 45.85 23 46.4 22.4 47 21.85 47 21M30.8 26A1.2 1.2 0 1 0 33.2 26A1.2 1.2 0 1 0 30.8 26Z"),
    "manette-8bitdo": kenney("M15.32 19.21 Q16.65 18.52 18.23 18.18 19.81 17.8 21.44 17.84 L42.97 17.84 Q46.23 17.88 49.03 19.36 51.79 20.88 52.81 23.16 L53.52 25.63 56.33 38.82 Q56.58 39.61 56.38 40.37 56.12 41.21 55.41 41.78 54.54 42.58 53.11 42.84 L50.46 42.65 Q49.85 42.5 49.19 42.05 L48.06 41.21 44.6 38.63 41.18 36.08 22.82 36.08 15.02 41.89 Q14.35 42.46 13.38 42.73 L11.45 42.88 Q9.71 42.81 8.54 41.74 7.37 40.68 7.52 39.42 L10.73 24.45 Q11.09 22.86 12.31 21.49 13.49 20.12 15.32 19.21M17.9 20.4 L17.9 23.6 14.7 23.6 14.7 26.8 17.9 26.8 17.9 30 21.1 30 21.1 26.8 24.3 26.8 24.3 23.6 21.1 23.6 21.1 20.4 17.9 20.4M42.8 25.2 Q42.8 24.48 42.29 23.97 41.82 23.5 41.1 23.5 40.38 23.5 39.87 23.97 39.4 24.48 39.4 25.2 39.4 25.92 39.87 26.39 40.38 26.9 41.1 26.9 41.82 26.9 42.29 26.39 42.8 25.92 42.8 25.2M46.2 28.6 Q46.2 27.88 45.69 27.37 45.22 26.9 44.5 26.9 43.78 26.9 43.27 27.37 42.8 27.88 42.8 28.6 42.8 29.32 43.27 29.79 43.78 30.3 44.5 30.3 45.22 30.3 45.69 29.79 46.2 29.32 46.2 28.6M49.6 25.2 Q49.6 24.48 49.09 23.97 48.62 23.5 47.9 23.5 47.18 23.5 46.67 23.97 46.2 24.48 46.2 25.2 46.2 25.92 46.67 26.39 47.18 26.9 47.9 26.9 48.62 26.9 49.09 26.39 49.6 25.92 49.6 25.2M46.2 21.8 Q46.2 21.08 45.69 20.57 45.22 20.1 44.5 20.1 43.78 20.1 43.27 20.57 42.8 21.08 42.8 21.8 42.8 22.52 43.27 22.99 43.78 23.5 44.5 23.5 45.22 23.5 45.69 22.99 46.2 22.52 46.2 21.8M23.8 32A2.7 2.7 0 1 0 29.2 32A2.7 2.7 0 1 0 23.8 32ZM34.8 32A2.7 2.7 0 1 0 40.2 32A2.7 2.7 0 1 0 34.8 32ZM28.8 24.0L30.400000000000002 24.0A0.6 0.6 0 0 1 30.400000000000002 25.200000000000003L28.8 25.200000000000003A0.6 0.6 0 0 1 28.8 24.0ZM33.6 24.0L35.199999999999996 24.0A0.6 0.6 0 0 1 35.199999999999996 25.200000000000003L33.6 25.200000000000003A0.6 0.6 0 0 1 33.6 24.0Z"),
    "manette-steam": kenney("M29 32.5 Q29 31.45 28.25 30.75 27.55 30 26.5 30 25.45 30 24.75 30.75 24 31.45 24 32.5 24 33.55 24.75 34.3 25.45 35 26.5 35 27.55 35 28.25 34.3 29 33.55 29 32.5 M39 35.5 Q39 34.9 38.55 34.45 38.15 34 37.5 34 36.85 34 36.45 34.45 36 34.9 36 35.5 36 36.15 36.45 36.6 36.85 37 37.5 37 38.15 37 38.55 36.6 L39 35.5 M36 32.5 Q36 31.9 35.55 31.45 35.15 31 34.5 31 33.85 31 33.45 31.45 33 31.9 33 32.5 33 33.15 33.45 33.6 33.85 34 34.5 34 35.15 34 35.55 33.6 36 33.15 36 32.5 M39 29.5 Q39 28.9 38.55 28.45 38.15 28 37.5 28 36.85 28 36.45 28.45 36 28.9 36 29.5 36 30.15 36.45 30.6 36.85 31 37.5 31 38.15 31 38.55 30.6 L39 29.5 M24 25 Q24 22.9 22.55 21.45 21.1 20 19 20 16.95 20 15.5 21.45 14 22.9 14 25 14 27.1 15.5 28.55 16.95 30 19 30 21.1 30 22.55 28.55 24 27.1 24 25 M42 32.5 Q42 31.9 41.55 31.45 41.15 31 40.5 31 39.85 31 39.45 31.45 39 31.9 39 32.5 39 33.15 39.45 33.6 39.85 34 40.5 34 41.15 34 41.55 33.6 42 33.15 42 32.5 M50 25 Q50 22.9 48.55 21.45 47.1 20 45 20 42.95 20 41.5 21.45 40 22.9 40 25 40 27.1 41.5 28.55 42.95 30 45 30 47.1 30 48.55 28.55 50 27.1 50 25 M26.5 38.55 Q23.3 38.6 22.2 40.3 L18.35 47.4 Q17 49.6 14.1 48.8 10.5 47.5 8.95 44.7 7.75 41.95 8.1 37.9 8.6 33.85 9.4 30 10.35 25.6 11.85 21.7 L12.65 19.65 Q12.95 17.9 14.45 16.9 15.7 16.05 19.3 16 L22.5 16 Q23.1 16 23.3 16.35 L40.7 16.35 Q40.9 16 41.55 16 L44.7 16 Q48.3 16.05 49.55 16.9 51.05 17.9 51.35 19.65 L52.15 21.7 Q53.7 25.6 54.6 30 L55.95 37.9 Q56.25 41.95 55.05 44.7 53.55 47.5 49.9 48.8 47.05 49.6 45.65 47.4 L41.85 40.3 Q40.75 38.6 37.55 38.55 L26.5 38.55"),
    "joycon-g": joycons(jc1G(8.13)),
    "joycon-d": joycons(jc1D(8.13)),
    joycons: joycons(jc1G(3.8), jc1D(12.46)),
    "joycon2-g": joycons(jc2G(8.05)),
    "joycon2-d": joycons(jc2D(8.05)),
    joycons2: joycons(jc2G(3.65), jc2D(12.45)),
    "manette-inconnue": kenney("M15.65 15.8 Q16.95 14.9 18.5 14.45 20.05 13.95 21.65 14 L42.75 14 Q45.95 14.05 48.7 16 51.4 18 52.4 21 L53.1 24.25 55.85 41.6 Q56.1 42.65 55.9 43.65 55.65 44.75 54.95 45.5 54.1 46.55 52.7 46.9 L50.1 46.65 Q49.5 46.45 48.85 45.85 L47.75 44.75 44.35 41.35 41 38 23 38 15.35 45.65 Q14.7 46.4 13.75 46.75 L11.85 46.95 Q10.15 46.85 9 45.45 7.85 44.05 8 42.4 L11.15 22.7 Q11.5 20.6 12.7 18.8 13.85 17 15.65 15.8 M40 27 Q40 26.15 39.4 25.55 38.85 25 38 25 37.15 25 36.55 25.55 36 26.15 36 27 36 27.85 36.55 28.4 37.15 29 38 29 38.85 29 39.4 28.4 40 27.85 40 27 M20 21 L20 25 16 25 16 29 20 29 20 33 24 33 24 29 28 29 28 25 24 25 24 21 20 21 M44 31 Q44 30.15 43.4 29.55 42.85 29 42 29 41.15 29 40.55 29.55 40 30.15 40 31 40 31.85 40.55 32.4 41.15 33 42 33 42.85 33 43.4 32.4 44 31.85 44 31 M48 27 Q48 26.15 47.4 25.55 46.85 25 46 25 45.15 25 44.55 25.55 44 26.15 44 27 44 27.85 44.55 28.4 45.15 29 46 29 46.85 29 47.4 28.4 48 27.85 48 27 M44 23 Q44 22.15 43.4 21.55 42.85 21 42 21 41.15 21 40.55 21.55 40 22.15 40 23 40 23.85 40.55 24.4 41.15 25 42 25 42.85 25 43.4 24.4 44 23.85 44 23"),
    // les consoles portables (leur manette intégrée), d'après leur photo de face ; « portable » : une console inconnue
    portable: portable(boite(0.5, 7, 23.5, 17, 2.2), ["r", 5.8, 7.8, 18.2, 16.2, 0.35], ["s", 3, 10.6], ["s", 21, 10.6]),
    "portable-legion-go": legion(LEGION1),
    "portable-legion-go-2": legion(LEGION2),
    "manettes-legion-go": detachees(LEGION1),
    "manettes-legion-go-2": detachees(LEGION2),
    // Legion Go S (photo du guide Lenovo) : fine en haut, elle s'élargit en s'arrondissant vers le bas ; le cadre noir de
    // l'écran sur toute la hauteur ; sticks dans leur anneau, croix sur un disque, grilles de haut-parleur en diagonale
    "portable-legion-go-s": portable(
      "M2.6 7.1H21.4C22.5 7.1 22.9 7.6 23.1 8.4L23.8 13.6C24 16 23.2 17.2 21.6 17.2H2.4C.8 17.2 0 16 .2 13.6L.9 8.4C1.1 7.6 1.5 7.1 2.6 7.1Z",
      ["r", 4.75, 7.35, 19.25, 16.95, 0.3],
      ["a", 2.6, 9.55, 1.05, 0.75],
      ["o", 3.15, 12.1, 1.1, 0.8],
      ["d", 3.2, 15.2],
      ["B", 21.4, 9.5, 0.73, 0.35],
      ["a", 20.9, 12, 1.05, 0.75],
      ["p", 20.9, 14, 0.45],
      ["d", 20.9, 15.2]
    ),
    "portable-deck": portable(
      "M2.6 7.5H21.4C23 7.5 23.8 8.5 23.8 10V14.6C23.8 16.2 23 17.1 21.6 17.1C20.6 17.1 20 16.6 19.3 16.4H4.7C4 16.6 3.4 17.1 2.4 17.1C1 17.1.2 16.2.2 14.6V10C.2 8.5 1 7.5 2.6 7.5Z",
      // (les grands pavés tactiles carrés sous les sticks : ce qui fait reconnaître la Deck)
      ["r", 5.8, 8.2, 18.2, 15.7, 0.35],
      ["c", 1.35, 9.5],
      ["s", 4, 9.6],
      ["p", 3.9, 13.7, 1.55],
      ["b", 22.55, 9.5],
      ["s", 20, 9.6],
      ["p", 20.1, 13.7, 1.55]
    ),
    // ROG Ally (photo de face ASUS) : coins peu arrondis, côtés droits, le cadre noir de l'écran sur toute la hauteur ;
    // stick gauche dans son anneau en haut au bord, croix sur un disque noir, grilles de haut-parleur en fentes
    "portable-ally": portable(
      "M1 7.3H23Q23.8 7.3 23.8 8.1V15.7Q23.8 16.9 22.6 16.9H1.4Q.2 16.9.2 15.7V8.1Q.2 7.3 1 7.3Z",
      ["r", 4.9, 7.55, 19.3, 16.7, 0.25],
      ["a", 1.95, 9.2, 1.05, 0.8],
      ["o", 3.4, 11.15, 1, 0.75],
      ["f", 3.7, 14.5],
      ["B", 21.8, 9.3, 0.62, 0.36],
      ["a", 20.95, 11.5, 1.05, 0.8],
      ["f", 20.4, 14.3]
    ),
    // ROG Xbox Ally (photo de face, cotes relevées sur une grille) : grandes poignées arrondies qui descendent sous le
    // cadre de l'écran ; à gauche stick dans son anneau au bord, bouton Xbox, croix sur un disque, grille ; à droite
    // boutons au bord, stick dans son anneau plus à l'intérieur, grille
    "portable-xbox-ally": portable(
      "M1.3 7.1H22.7C23.5 7.1 23.9 7.7 23.9 8.6V14.6C23.9 16.4 23 17.1 21.8 17.1C20.9 17.1 20.2 16.7 19.6 16.4L19.4 16.85H4.6L4.4 16.4C3.8 16.7 3.1 17.1 2.2 17.1C1 17.1.1 16.4.1 14.6V8.6C.1 7.7.5 7.1 1.3 7.1Z",
      ["r", 5.1, 8.1, 18.9, 15.95, 0.25],
      ["a", 1.65, 9.6, 1.15, 0.8],
      ["g", 3.25, 8.95, 0.38],
      ["o", 3.3, 11.35, 1.1, 0.8],
      ["d", 3.65, 14.1],
      ["B", 22.2, 9.25, 0.85, 0.4],
      ["a", 20.65, 11.25, 1.15, 0.8],
      ["d", 20.3, 14.1]
    ),
    "portable-claw": portable(
      "M2.4 7H21.6C23.2 7 23.8 8 23.8 9.6V16.4C23.8 17.8 23 18.6 21.8 18.6C20.8 18.6 20.2 18 19.6 17.4H4.4C3.8 18 3.2 18.6 2.2 18.6C1 18.6.2 17.8.2 16.4V9.6C.2 8 .8 7 2.4 7Z",
      ["r", 5.8, 7.8, 18.2, 16.6, 0.35],
      ["s", 2.6, 9.4],
      ["o", 3.6, 13.6],
      ["b", 21.4, 9.2],
      ["s", 20.4, 13.3]
    ),
    "portable-ayaneo": portable(boite(0.3, 6.9, 23.7, 17.1, 3.2), ["r", 6.2, 7.6, 17.8, 16.4, 0.35], ["s", 3.2, 9.5], ["c", 3.2, 13.4], ["b", 20.8, 9.4], ["s", 20.8, 13.4]),
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
    recherche: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    // (16/10) les deux bouts de la barre du zoom de l'accueil : grandes tuiles (LB) et beaucoup de petites (RB)
    "tuiles-grandes": P('<rect x="4" y="4" width="16" height="16" rx="4.5"/>'),
    "tuiles-petites": P('<rect x="3.5" y="3.5" width="5" height="5" rx="1.4"/><rect x="9.5" y="3.5" width="5" height="5" rx="1.4"/><rect x="15.5" y="3.5" width="5" height="5" rx="1.4"/><rect x="3.5" y="9.5" width="5" height="5" rx="1.4"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.4"/><rect x="15.5" y="9.5" width="5" height="5" rx="1.4"/><rect x="3.5" y="15.5" width="5" height="5" rx="1.4"/><rect x="9.5" y="15.5" width="5" height="5" rx="1.4"/><rect x="15.5" y="15.5" width="5" height="5" rx="1.4"/>'),
    // la loupe de la barre (16/10 : plus de copie dans la feuille de style)
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
    // la pile d'une manette (barre des joueurs du menu HOME) : quatre barres, remplies selon sa charge (niveau 0 à 3 : une à
    // quatre barres ; les autres restent pâles)
    "pile-manette": (niveau = 3) => '<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10.5v3"/>' + [0, 1, 2, 3].map((i) => `<rect x="${4.2 + i * 3.6}" y="9.2" width="2.6" height="5.6" rx=".6" fill="currentColor" stroke="none"${i > niveau ? ' opacity=".25"' : ""}/>`).join(""),
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
    supprimer: '<path d="M4.5 7h15"/><path d="M9.5 7V4.8A1.8 1.8 0 0 1 11.3 3h1.4a1.8 1.8 0 0 1 1.8 1.8V7"/><path d="M6.3 7l1 12a1.8 1.8 0 0 0 1.8 1.7h5.8a1.8 1.8 0 0 0 1.8-1.7l1-12"/><path d="M10 11v6M14 11v6"/>',
    // les dispositions de l'accueil (dossiers.js) : le panneau, et « Enregistrer ici » ; les touches qui l'ouvrent dans la
    // légende de l'accueil (console.js) : Vue (Xbox, Deck : deux carrés l'un sur l'autre) et Créer (DualSense)
    dispositions: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><rect x="6.5" y="7.5" width="4" height="4" rx="1"/><rect x="13.5" y="7.5" width="4" height="4" rx="1"/><rect x="6.5" y="13" width="4" height="4" rx="1"/>',
    enregistrer: '<path d="M12 3.5v10M7.5 9.5L12 14l4.5-4.5"/><path d="M4 15.5v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    vue: '<rect x="3.5" y="3.5" width="11" height="11" rx="2.2"/><path d="M9.5 17.5v1a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1"/>',
    creer: '<path d="M12 3.5v4M6 5.5l2.4 2.6M18 5.5l-2.4 2.6"/><rect x="5" y="12" width="14" height="8" rx="4"/>'
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
    if (r === document) for (const n of ["parametres", "recherche"]) document.documentElement.style.setProperty("--pcv-masque-" + n, masque(n));
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
  rafraichir(document);
})();
