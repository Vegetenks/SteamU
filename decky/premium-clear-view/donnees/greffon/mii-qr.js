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
  window.__pcvMiiQR = { dechiffrer, lireImage, depuisImage };
  return "mii-qr pr\xEAt";
})();
