(() => {
  const CLE = Uint8Array.from("59FC817E6446EA6190347B20E9BDCE52".match(/../g), (h) => parseInt(h, 16));
  const POS_NONCE = 12, NONCE = 8, CHIFFRE = 88, MAC = 16;
  let cles = null;
  const S = () => {
    const s = globalThis.crypto?.subtle;
    if (!s) throw new Error("mii-qr : WebCrypto indisponible (page non s\xE9curis\xE9e ?)");
    return s;
  };
  const preparer = () => cles ||= Promise.all(["AES-CTR", "AES-CBC"].map((n) => S().importKey("raw", CLE, { name: n }, false, ["encrypt", "decrypt"]))).then(([ctr, cbc]) => ({ ctr, cbc }));
  const compteur = (n12, i) => {
    const a = new Uint8Array(16);
    a[0] = 2;
    a.set(n12, 1);
    a[13] = i >> 16;
    a[14] = i >> 8 & 255;
    a[15] = i & 255;
    return a;
  };
  const crc16 = (d, n) => {
    let c = 0;
    for (let i = 0; i < n; i++) {
      c ^= d[i] << 8;
      for (let k = 0; k < 8; k++) c = c & 32768 ? (c << 1 ^ 4129) & 65535 : c << 1 & 65535;
    }
    return c;
  };
  const dechiffrer = async (q) => {
    q = q instanceof Uint8Array ? q : new Uint8Array(q);
    if (q.length < NONCE + CHIFFRE + MAC) throw new Error("mii-qr : QR trop court (" + q.length + " octets) : pas un Mii");
    const { ctr, cbc } = await preparer(), n12 = new Uint8Array(12);
    n12.set(q.subarray(0, NONCE));
    const clair = new Uint8Array(await S().decrypt({ name: "AES-CTR", counter: compteur(n12, 1), length: 24 }, ctr, q.subarray(NONCE, NONCE + CHIFFRE)));
    const m = new Uint8Array(16 + 96);
    m[0] = 58;
    m.set(n12, 1);
    m[15] = 96;
    m.set(clair, 16);
    const cbcSortie = new Uint8Array(await S().encrypt({ name: "AES-CBC", iv: new Uint8Array(16) }, cbc, m));
    const s0 = new Uint8Array(await S().encrypt({ name: "AES-CTR", counter: compteur(n12, 0), length: 24 }, ctr, new Uint8Array(16)));
    const t = cbcSortie.subarray(m.length - 16, m.length), mac = q.subarray(NONCE + CHIFFRE, NONCE + CHIFFRE + MAC);
    let ecart = 0;
    for (let i = 0; i < 16; i++) ecart |= t[i] ^ s0[i] ^ mac[i];
    if (ecart) throw new Error("mii-qr : MAC fausse : ce QR n'est pas un Mii de la 3DS ou de la Wii U");
    const d = new Uint8Array(96);
    d.set(clair.subarray(0, POS_NONCE));
    d.set(q.subarray(0, NONCE), POS_NONCE);
    d.set(clair.subarray(POS_NONCE, CHIFFRE), POS_NONCE + NONCE);
    if (crc16(d, 94) !== (d[94] << 8 | d[95])) throw new Error("mii-qr : CRC faux");
    return d;
  };
  const lireImage = async (src) => {
    const lire = window.jsQR;
    if (!lire) throw new Error("mii-qr : lecteur de QR (vendor/jsqr.js) absent");
    if (src instanceof Blob) src = await createImageBitmap(src);
    const w0 = src.naturalWidth || src.width, h0 = src.naturalHeight || src.height;
    for (const cote of [Math.max(w0, h0), 800, 1200, 500]) {
      const f = Math.min(4, cote / Math.max(w0, h0)), w = Math.round(w0 * f), h = Math.round(h0 * f);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.fillStyle = "#fff";
      g.fillRect(0, 0, w, h);
      g.imageSmoothingEnabled = f < 1;
      g.drawImage(src, 0, 0, w, h);
      const r = lire(g.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "attemptBoth" });
      if (r?.binaryData?.length) return Uint8Array.from(r.binaryData);
    }
    throw new Error("mii-qr : aucun QR code lisible dans cette image");
  };
  const depuisImage = async (src) => dechiffrer(await lireImage(src));
  const MARGE = 2, H_MAX = 10;
  const FONCE = "oklch(from var(--pcv-cyan-plein, #2fb8ff) min(l, .4) min(c, .14) h)", FOND = "oklch(from var(--pcv-cyan-plein, #2fb8ff) .975 .012 h)", PICTO = "oklch(from var(--pcv-cyan-plein, #2fb8ff) min(l, .62) c h)";
  const U = '<path d="M33 29L33 51C33 63 40 70 50 70C60 70 67 63 67 51L67 29" fill="none" stroke="currentColor" stroke-width="11.5" stroke-linecap="round"/>';
  const genererSvg = (texte, picto) => {
    const Q = window.qrcodegen?.QrCode;
    if (!Q) throw new Error("mii-qr : g\xE9n\xE9rateur de QR (vendor/qrcodegen.js) absent");
    let q = Q.encodeText(texte, Q.Ecc.HIGH);
    if (q.version > H_MAX) q = Q.encodeText(texte, Q.Ecc.LOW);
    const n = q.size, T = n + 2 * MARGE, L = q.version > H_MAX ? 0 : Math.ceil(n * 0.22) | 1, l0 = (n - L) / 2;
    const repere = (x, y) => (x < 7 || x >= n - 7) && y < 7 || x < 7 && y >= n - 7;
    const centre = (x, y) => L && x >= l0 - 1 && x < l0 + L + 1 && y >= l0 - 1 && y < l0 + L + 1;
    let libre = L > 0;
    for (let y = 0; libre && y < n; y++) for (let x = 0; x < n; x++) if (centre(x, y) && q.isFunctionModule(x, y)) {
      libre = false;
      break;
    }
    let d = "";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.getModule(x, y) && !repere(x, y) && !(libre && centre(x, y)))
      d += `M${x + MARGE + 0.36},${y + MARGE + 0.06}h.28a.3.3 0 0 1 .3.3v.28a.3.3 0 0 1-.3.3h-.28a.3.3 0 0 1-.3-.3v-.28a.3.3 0 0 1 .3-.3z`;
    const reperes = [[0, 0], [n - 7, 0], [0, n - 7]].map(([x, y]) => `<rect x="${x + MARGE + 0.5}" y="${y + MARGE + 0.5}" width="6" height="6" rx="1.6" fill="none" stroke-width="1" style="stroke:${FONCE}"/><rect x="${x + MARGE + 2}" y="${y + MARGE + 2}" width="3" height="3" rx=".8"/>`).join("");
    const trace = picto && window.__pcvIcones?.trace?.(picto), C = L * 0.92, c0 = MARGE + (n - C) / 2;
    const dessin = !libre ? "" : `<rect x="${c0}" y="${c0}" width="${C}" height="${C}" rx="${C * 0.22}" fill="#fff" stroke-width=".25" style="stroke:${FONCE}"/>` + (trace ? `<g transform="translate(${c0 + C * 0.2} ${c0 + C * 0.2}) scale(${C * 0.6 / 24})" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${trace}</g>` : `<g transform="translate(${c0} ${c0}) scale(${C / 84}) translate(-8 -8)">${U}</g>`);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${T}" style="color:${PICTO}"><rect width="${T}" height="${T}" rx="${MARGE}" style="fill:${FOND}"/><g style="fill:${FONCE}"><path d="${d}"/>${reperes}</g>${dessin}</svg>`;
  };
  window.__pcvMiiQR = { dechiffrer, lireImage, depuisImage, genererSvg };
  return "mii-qr pr\xEAt";
})();
