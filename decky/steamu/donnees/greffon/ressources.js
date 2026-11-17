(() => {
  if (window.__pcvRessource?.appeler) return "ressources reprises";
  const O = window.opener;
  const appeler = (methode, ...args) => Promise.race([
    (O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, methode, ...args) ?? Promise.reject("Decky absent"),
    new Promise((_, non) => setTimeout(() => non("Decky muet"), 4e3))
  ]);
  const octets = (b64) => {
    const bin = atob(b64), oct = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) oct[i] = bin.charCodeAt(i);
    return oct;
  };
  const TRANCHE = 256 * 1024;
  const morceaux = async (chemin) => {
    let t;
    try {
      t = await appeler("tranche", chemin, 0, TRANCHE);
    } catch (e) {
      const b64 = await appeler("ressource", chemin);
      return b64 ? [octets(b64)] : null;
    }
    const m = [];
    let lu = 0;
    while (t?.b64) {
      const o = octets(t.b64);
      m.push(o);
      lu += o.length;
      if (lu >= t.taille) return m;
      t = await appeler("tranche", chemin, lu, TRANCHE);
    }
    return null;
  };
  const typeContenu = (m, type) => {
    if (!type?.startsWith("audio/")) return type;
    const o = m[0], tete = String.fromCharCode(...o.subarray(0, 4));
    if (tete === "RIFF") return "audio/wav";
    if (tete === "OggS") return "audio/ogg";
    if (tete === "fLaC") return "audio/flac";
    if (String.fromCharCode(...o.subarray(4, 8)) === "ftyp") return "audio/mp4";
    if (o[0] === 26 && o[1] === 69 && o[2] === 223 && o[3] === 163) return "audio/webm";
    if (o[0] === 255 && (o[1] & 246) === 240) return "audio/aac";
    if (tete.startsWith("ID3") || o[0] === 255 && (o[1] & 224) === 224) return "audio/mpeg";
    return type;
  };
  const urls = window.__pcvBlobs ||= {}, enCours = {};
  const blob = async (chemin, type) => urls[chemin] || (enCours[chemin] ||= morceaux(chemin).then((m) => m && (urls[chemin] ||= URL.createObjectURL(new Blob(m, { type: typeContenu(m, type) })))).finally(() => delete enCours[chemin]));
  blob.appeler = appeler;
  window.__pcvRessource = blob;
  window.__pcvListe = (dossier) => appeler("liste", dossier).catch(() => []);
  return "ressources pr\xEAtes";
})();
