(() => {
  window.__pcvThemezerFin?.();
  const fins = [];
  window.__pcvThemezerFin = () => {
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
  const ETAPES = { telechargement: T("themezer.etape.telechargement"), tele: T("themezer.etape.fond_tele"), manette: T("themezer.etape.fond_gamepad"), musique: T("themezer.etape.musique"), icones: T("themezer.etape.icones"), rangement: T("themezer.etape.rangement"), fini: T("themezer.etape.installe"), erreur: T("themezer.etape.echec") };
  const CONSOLES = {
    wiiu: { nom: "Wii U", ecrans: [T("themezer.ecran.tele"), "GamePad"], apporte: T("themezer.apporte_wiiu") },
    switch: { nom: "Switch", ecrans: [T("themezer.ecran.ecran")], apporte: T("themezer.apporte_switch") }
  };
  const creer = (cle) => {
    const C = CONSOLES[cle];
    const M = (window.__pcvThemezerMemoire ||= {})[cle] ||= { apercus: /* @__PURE__ */ new Map() };
    let o = null, etat = null, suivi = 0, enFile = [], enCours = 0;
    const enAttente = /* @__PURE__ */ new Set();
    const ecoutes = /* @__PURE__ */ new Set(), avertir = () => ecoutes.forEach((f) => {
      try {
        f();
      } catch (e) {
      }
    });
    const ident = (id) => `themezer-${cle}-${id}`;
    const installe = (id) => !!o?.importeId(ident(id));
    const demander = (id, ecran = 0) => {
      const k = id + ":" + ecran;
      if (M.apercus.has(k) || enAttente.has(k)) return;
      enAttente.add(k);
      enFile.push(k);
      pomper();
    };
    const pomper = () => {
      while (enCours < 2 && enFile.length) {
        const k = enFile.shift(), [id, ecran] = k.split(":");
        enCours++;
        appeler("themezer_apercu", cle, id, +ecran).then((r) => {
          if (!r || typeof r.b64 !== "string" || !/^image\/(webp|jpeg|png)$/.test(r.type)) {
            M.apercus.set(k, null);
            return;
          }
          const bin = atob(r.b64), oct = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) oct[i] = bin.charCodeAt(i);
          M.apercus.set(k, URL.createObjectURL(new Blob([oct], { type: r.type })));
          if (M.apercus.size > 200) {
            const [k0, u] = M.apercus.entries().next().value;
            if (u) URL.revokeObjectURL(u);
            M.apercus.delete(k0);
          }
        }).catch(() => {
        }).finally(() => {
          enAttente.delete(k);
          enCours--;
          avertir();
          pomper();
        });
      }
    };
    const apercu = (id, ecran = 0) => M.apercus.get(id + ":" + ecran);
    const installer = async (t) => {
      await o.charger();
      if (installe(t.id)) {
        o.appliquer("importe:" + ident(t.id));
        o.son("theme");
        return;
      }
      if (etat && !["fini", "erreur", "repos"].includes(etat.etape)) return o.son("bord");
      let r;
      try {
        r = await appeler("themezer_installer", cle, t.id);
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
          etat = { ...await appeler("themezer_etat"), id: etat.id };
        } catch (e) {
          return;
        }
        if (etat.etape === "fini") {
          clearInterval(suivi);
          o.son("theme");
          await o.charger();
        } else if (etat.etape === "erreur") {
          clearInterval(suivi);
          o.son("bord");
        }
        avertir();
      }, 400);
    };
    fins.push(() => clearInterval(suivi));
    const outils = () => o ||= window.__pcvThemes?.outils;
    const donnees = {
      nom: C.nom,
      ecrans: C.ecrans,
      apporte: C.apporte,
      ETAPES,
      chercher: async (texte, page, tri) => {
        try {
          return await appeler("themezer_recherche", cle, texte, page, tri);
        } catch (e) {
          return { erreur: T("commun.greffon_pas_redemarre") };
        }
      },
      apercu: (id, ecran = 0) => {
        demander(id, ecran);
        return apercu(id, ecran);
      },
      installe: (id) => {
        outils();
        return installe(id);
      },
      theme: (id) => "importe:" + ident(id),
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
    return { donnees };
  };
  window.__pcvThemezer = { wiiu: creer("wiiu"), switch: creer("switch") };
  return "Themezer pr\xEAt";
})();
