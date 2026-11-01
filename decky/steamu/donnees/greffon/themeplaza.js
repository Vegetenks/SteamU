(() => {
  window.__pcvThemePlazaFin?.();
  const fins = [];
  window.__pcvThemePlazaFin = () => {
    fins.splice(0).forEach((f) => {
      try {
        f();
      } catch (e) {
      }
    });
  };
  const T = window.__pcvT || ((c) => c);
  const O = window.opener || window;
  const appeler = (m, ...a) => {
    try {
      return (O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, m, ...a) ?? Promise.reject(new Error("Decky absent"));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const ETAPES = { telechargement: T("themeplaza.etape.telechargement"), verification: T("themeplaza.etape.verification"), images: T("themeplaza.etape.images"), musique: T("themeplaza.etape.musique"), rangement: T("themeplaza.etape.rangement"), agrandissement: T("themeplaza.etape.agrandissement"), fini: T("themeplaza.etape.installe"), erreur: T("themeplaza.etape.echec") };
  const M = window.__pcvThemePlazaMemoire ||= { apercus: /* @__PURE__ */ new Map() };
  let o = null, boite = null, etat = null, suivi = 0, enFile = [], enCours = 0;
  let vue = null, vuePrete = null, vueFin = 0, verif = null, essais = 0, attenteAp = false, garde = 0;
  const $ = (s) => boite?.querySelector(s);
  const installe = (id) => !!o?.importe(id);
  const ecoutes = /* @__PURE__ */ new Set(), avertir = () => ecoutes.forEach((f) => {
    try {
      f();
    } catch (e) {
    }
  });
  let tenue = false;
  const CSS = (U) => `
    .tpzb { position: fixed; inset: 0; z-index: 8800; background: rgba(0,0,0,.35); font-family: var(--pcv-police); color: var(--pcv-texte); }
    .tpzb .tpz-verif { position: absolute; left: ${U(48)}; top: ${U(80)}; width: ${U(1168)}; height: ${U(526)}; border-radius: ${U(28)}; padding: ${U(14)} ${U(18)}; box-sizing: border-box;
      display: flex; flex-direction: column; gap: ${U(10)}; background: #f4f7fb; box-shadow: var(--pcv-reflet), 0 ${U(16)} ${U(40)} rgba(0,0,0,.25); }
    .tpzb .tpz-tete { display: flex; align-items: center; gap: ${U(14)}; }
    .tpzb .tpz-msg { flex: 1; min-width: 0; font-size: ${U(14)}; font-weight: 700; color: #5b6676; line-height: 1.35; }
    .tpzb .tpz-msg b { display: block; font-size: ${U(19)}; font-weight: 900; color: var(--pcv-texte); }
    .tpzb .bt { flex: none; height: ${U(48)}; padding: 0 ${U(16)}; border-radius: ${U(24)}; display: flex; align-items: center; gap: ${U(6)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: ${U(15)}; font-weight: 800; cursor: pointer; }
    .tpzb .bt u { text-decoration: none; width: ${U(24)}; height: ${U(24)}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: #fff; color: var(--pcv-cyan-plein); }
    .tpzb .tpz-site { flex: 1; border-radius: ${U(16)}; background: #fff; box-shadow: inset 0 0 0 1px rgba(0,0,0,.1); display: flex; align-items: center; justify-content: center; font-size: ${U(15)}; font-weight: 800; color: #7a8494; }
  `;
  const apercu = (id) => M.apercus.get(id);
  const demander = (id) => {
    if (M.apercus.has(id) || enFile.includes(id)) return;
    enFile.push(id);
    pomper();
  };
  const pomper = () => {
    while (!attenteAp && enCours < 2 && enFile.length) {
      const id = enFile.shift();
      enCours++;
      assurerVue().then(() => appeler("themeplaza_apercu", id)).then((b64) => {
        if (b64?.verification || b64?.vue) {
          enFile.unshift(id);
          if (!attenteAp) {
            attenteAp = true;
            attendre(b64, () => {
              attenteAp = false;
              pomper();
            });
          }
          return;
        }
        if (typeof b64 !== "string" || !b64) return;
        const bin = atob(b64), oct = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) oct[i] = bin.charCodeAt(i);
        M.apercus.set(id, URL.createObjectURL(new Blob([oct], { type: "image/png" })));
        if (M.apercus.size > 150) {
          const [k, u] = M.apercus.entries().next().value;
          URL.revokeObjectURL(u);
          M.apercus.delete(k);
        }
        vueOk();
      }).catch(() => {
      }).finally(() => {
        enCours--;
        avertir();
        pomper();
      });
    }
  };
  const VUE_URL = "https://themeplaza.art/themes";
  const assurerVue = () => {
    clearTimeout(vueFin);
    if (vue) return vuePrete;
    if (!boite && !tenue) return Promise.resolve();
    const BV = O.SteamClient?.BrowserView;
    if (!BV?.Create) return Promise.resolve();
    try {
      vue = BV.Create({
        parentPopupBrowserID: window.SteamClient.Browser.GetBrowserID(),
        strUserAgentIdentifier: "Valve Steam Client",
        strInitialURL: VUE_URL,
        strName: "PCVThemePlaza",
        bOnlyAllowTrustedPopups: true
      });
    } catch (e) {
      vue = null;
      return Promise.resolve();
    }
    cacherVue();
    let pret;
    vuePrete = new Promise((r) => {
      pret = r;
      setTimeout(r, 15e3);
    });
    vue.on("finished-request", (url) => {
      pret();
      if (verif && /^https:\/\/themeplaza\.art\//.test(String(url))) setTimeout(() => verif && reessayer(), 600);
    });
    return vuePrete;
  };
  const cacherVue = () => {
    if (!vue) return;
    try {
      vue.SetVisible(false);
    } catch (e) {
    }
    try {
      vue.SetBounds(-4, -4, 1, 1);
    } catch (e) {
    }
  };
  const detruireVue = () => {
    clearTimeout(vueFin);
    if (!vue) return;
    cacherVue();
    const v = vue;
    vue = null;
    vuePrete = null;
    try {
      O.SteamClient.BrowserView.Destroy(v);
    } catch (e) {
    }
  };
  const lacher = () => {
    if (!boite && !tenue) {
      clearTimeout(vueFin);
      vueFin = setTimeout(detruireVue, 1500);
    }
  };
  const attendre = (r, reprendre) => {
    if (!r || !(r.verification || r.vue)) return false;
    if (r.verification) {
      montrerVerif(reprendre);
      return true;
    }
    if (essais++ >= 2) return false;
    if (vue) try {
      vue.LoadURL(VUE_URL);
    } catch (e) {
    }
    vuePrete = new Promise((ok) => setTimeout(ok, 4e3));
    assurerVue().then(reprendre);
    return true;
  };
  const vueOk = () => {
    essais = 0;
    if (verif) fermerVerif(false);
  };
  const placerVue = () => {
    const s = $(".tpz-site");
    if (!vue || !boite || !s) return;
    const b = s.getBoundingClientRect();
    vue.SetBounds(Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height));
  };
  const montrerVerif = (reprendre) => {
    (verif ||= { reprendre: [] }).reprendre.push(reprendre);
    if (!boite || verif.montre) return;
    verif.montre = true;
    o?.son("bord");
    assurerVue().then(() => {
      if (!vue || !boite) return;
      try {
        vue.LoadURL(VUE_URL);
      } catch (e) {
      }
      requestAnimationFrame(() => {
        placerVue();
        try {
          vue?.SetVisible(true);
        } catch (e) {
        }
      });
    });
    const menus = O.SteamUIStore?.WindowStore?.SteamUIWindows?.find?.((w) => w.BrowserWindow === window)?.MenuStore;
    let cache = false;
    clearInterval(garde);
    garde = setInterval(() => {
      if (!verif || !vue) return;
      const m = !!menus?.m_eOpenSideMenu;
      if (m !== cache) {
        cache = m;
        if (m) cacherVue();
        else {
          placerVue();
          try {
            vue.SetVisible(true);
          } catch (e) {
          }
        }
      }
    }, 250);
  };
  const fermerVerif = (parBouton) => {
    const v = verif;
    verif = null;
    clearInterval(garde);
    cacherVue();
    boite?.remove();
    boite = null;
    lacher();
    if (parBouton) {
      attenteAp = false;
      o?.son("bord");
    }
    v?.reprendre.forEach((f) => f());
  };
  const reessayer = () => {
    if (!verif) return;
    verif.reprendre.splice(0).forEach((f) => f());
  };
  window.addEventListener("resize", placerVue);
  fins.push(() => {
    window.removeEventListener("resize", placerVue);
    boite?.remove();
    boite = null;
    detruireVue();
  });
  const verifier = (fini) => {
    if (boite || !outils()) return;
    const U = o.U;
    if (!document.getElementById("pcv-tpz-css")) {
      const s = document.createElement("style");
      s.id = "pcv-tpz-css";
      s.textContent = CSS(U);
      document.head.appendChild(s);
    }
    boite = document.createElement("div");
    boite.className = "tpzb";
    boite.innerHTML = `<div class="tpz-verif"><div class="tpz-tete"><div class="tpz-msg"><b>${T("themeplaza.verif_titre", { site: "ThemePlaza" })}</b>${T("themeplaza.verif_texte")}</div>
        <div class="bt" data-v="reessayer"><u>${o.T(1)}</u>${T("themeplaza.reessayer")}</div><div class="bt" data-v="fermer"><u>${o.T(2)}</u>${T("dispo.fermer")}</div></div>
      <div class="tpz-site">${T("themeplaza.chargement", { site: "themeplaza.art" })}</div></div>`;
    document.body.appendChild(boite);
    $('[data-v="reessayer"]').onclick = () => {
      o.son("choisir");
      reessayer();
    };
    $('[data-v="fermer"]').onclick = () => fermerVerif(true);
    new ResizeObserver(placerVue).observe($(".tpz-site"));
    montrerVerif(fini);
  };
  const touche = (b) => {
    if (!boite) return false;
    if (b === 1) {
      o.son("choisir");
      reessayer();
    } else if (b === 2) fermerVerif(true);
    return true;
  };
  const installer = async (t) => {
    await o.charger();
    if (installe(t.id)) {
      o.appliquer("importe:themeplaza-" + t.id);
      o.son("theme");
      return;
    }
    if (etat && !["fini", "erreur", "repos"].includes(etat.etape)) return o.son("bord");
    let r;
    try {
      await assurerVue();
      r = await appeler("themeplaza_installer", t.id);
    } catch (e) {
      r = { erreur: T("commun.greffon_pas_redemarre") };
    }
    if (!r?.ok) {
      etat = { id: t.id, etape: "erreur", message: r?.erreur || "?" };
      avertir();
      return o.son("bord");
    }
    o.son("choisir");
    etat = { id: t.id, etape: "telechargement", pct: 0 };
    avertir();
    clearInterval(suivi);
    suivi = setInterval(async () => {
      try {
        etat = { ...await appeler("themeplaza_etat"), id: etat.id };
      } catch (e) {
        return;
      }
      if (etat.etape === "fini") {
        clearInterval(suivi);
        vueOk();
        o.son("theme");
        await o.charger();
      } else if (etat.etape === "erreur") {
        clearInterval(suivi);
        if (attendre(etat, () => {
          etat = null;
          installer(t);
        })) {
          etat = null;
          avertir();
          return;
        }
        o.son("bord");
      }
      avertir();
    }, 400);
  };
  fins.push(() => {
    clearInterval(suivi);
    clearInterval(garde);
    document.getElementById("pcv-tpz-css")?.remove();
  });
  const outils = () => o ||= window.__pcvThemes?.outils;
  const donnees = {
    nom: "3DS",
    ecrans: [T("themezer.ecran.ecran")],
    ETAPES,
    tenir: (oui) => {
      tenue = oui;
      if (!oui) lacher();
    },
    chercher: (texte, page, tri) => new Promise((fini) => {
      const essai = async () => {
        let r;
        try {
          await assurerVue();
          r = await appeler("themeplaza_recherche", texte, page, tri, false);
        } catch (e) {
          r = { erreur: T("commun.greffon_pas_redemarre") };
        }
        if (r?.verification && !boite) return fini({ verification: true });
        if (!attendre(r, essai)) {
          if (r && !r.vue) vueOk();
          fini(r?.vue ? { erreur: T("commun.pas_de_reponse") } : r);
        }
      };
      essai();
    }),
    apercu: (id) => {
      demander(id);
      return apercu(id);
    },
    installe: (id) => {
      outils();
      return installe(id);
    },
    theme: (id) => "importe:themeplaza-" + id,
    installer: (t) => {
      outils();
      return installer(t);
    },
    etat: (id) => etat?.id === id ? etat : null,
    ecouter: (f) => {
      ecoutes.add(f);
      return () => ecoutes.delete(f);
    }
  };
  window.__pcvThemePlaza = { donnees, verifier, touche };
  return "ThemePlaza pr\xEAt";
})();
