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
  const TRIS = [["recents", T("themeplaza.recents")], ["telecharges", T("themeplaza.populaires")], ["aimes", T("themeplaza.aimes")]];
  const ETAPES = { telechargement: T("themeplaza.etape.telechargement"), verification: T("themeplaza.etape.verification"), images: T("themeplaza.etape.images"), musique: T("themeplaza.etape.musique"), rangement: T("themeplaza.etape.rangement"), agrandissement: T("themeplaza.etape.agrandissement"), fini: T("themeplaza.etape.installe"), erreur: T("themeplaza.etape.echec") };
  const M = window.__pcvThemePlazaMemoire ||= { texte: "", tri: "telecharges", musique: false, res: null, apercus: /* @__PURE__ */ new Map(), installes: {} };
  let racine = null, o = null, boite = null, ligne = -1, col = 0, actif = false, chargement = false, etat = null, suivi = 0, enFile = [], enCours = 0;
  let vue = null, vuePrete = null, vueFin = 0, verif = null, essais = 0, attenteAp = false, garde = 0;
  const themes = () => M.res?.themes || [];
  const $ = (s) => boite?.querySelector(s);
  const CSS = (U) => `
    .pcvth.tpz .etagere, .pcvth.tpz .vitrine, .pcvth.tpz .espaces, .pcvth.tpz .actions { display: none; }
    .tpzb { position: absolute; inset: 0; pointer-events: none; }
    .tpzb > * { pointer-events: auto; }
    .tpzb .barre { position: absolute; left: ${U(64)}; top: ${U(84)}; width: ${U(568)}; display: flex; gap: ${U(8)}; }
    .tpzb .champ { flex: 1; height: ${U(48)}; border-radius: ${U(24)}; display: flex; align-items: center; gap: ${U(8)}; padding: 0 ${U(16)} 0 ${U(8)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    .tpzb .champ i { flex: none; width: ${U(34)}; height: ${U(34)}; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 -3px 0 rgba(0,0,0,.08); }
    .tpzb .champ i svg { width: ${U(18)}; height: ${U(18)}; fill: none; stroke: #5b6676; stroke-width: 2.6; stroke-linecap: round; }
    .tpzb .champ input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: 800 ${U(17)} var(--pcv-police); color: var(--pcv-texte); }
    .tpzb .champ input::placeholder { color: #8a93a2; }
    .tpzb .bt { flex: none; height: ${U(48)}; padding: 0 ${U(16)}; border-radius: ${U(24)}; display: flex; align-items: center; gap: ${U(6)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: ${U(15)}; font-weight: 900; white-space: nowrap; }
    .tpzb .bt.on { background: var(--pcv-cyan-plein); color: #fff; }
    
    .tpzb .source { position: absolute; left: ${U(72)}; top: ${U(140)}; font-size: ${U(14)}; font-weight: 800; color: var(--pcv-texte2); white-space: nowrap; }
    
    .tpzb .grille { position: absolute; left: ${U(48)}; top: ${U(158)}; width: ${U(600)}; height: ${U(422)}; overflow-y: auto; overflow-x: hidden; padding: ${U(14)} ${U(16)} ${U(40)};
      scroll-padding: ${U(14)} 0 ${U(40)}; scrollbar-width: none; touch-action: pan-y; -webkit-mask: linear-gradient(180deg, transparent 0, #000 ${U(14)}, #000 calc(100% - ${U(30)}), transparent); mask: linear-gradient(180deg, transparent 0, #000 ${U(14)}, #000 calc(100% - ${U(30)}), transparent); }
    .tpzb .grille::-webkit-scrollbar { display: none; }
    .tpzb .rang { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: ${U(22)} ${U(20)}; }
    .tpzb .carte .vig { background: #dfe6ee center top / 100% 200% no-repeat; }
    .tpzb .carte .vig b { position: absolute; right: ${U(6)}; bottom: ${U(6)}; padding: ${U(2)} ${U(8)}; border-radius: ${U(10)}; background: rgba(255,255,255,.92); font-size: ${U(12)}; font-weight: 900; color: #3a4252; }
    .tpzb .carte .nm { flex-direction: column; align-items: flex-start; justify-content: center; gap: 0; height: ${U(50)}; line-height: 1.15; }
    .tpzb .carte .nm span { max-width: 100%; }
    .tpzb .carte .nm small { max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-size: ${U(12)}; font-weight: 800; color: #7a8494; }
    .tpzb .carte.porte::after { content: "\u2713"; }
    .tpzb .mot { grid-column: 1 / -1; padding: ${U(22)} ${U(24)}; border-radius: ${U(22)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: ${U(16)}; font-weight: 800; line-height: 1.5; }
    .tpzb .mot b { display: block; font-size: ${U(19)}; margin-bottom: ${U(4)}; }
    .tpzb .fiche { position: absolute; left: ${U(676)}; top: ${U(86)}; width: ${U(540)}; height: ${U(500)}; border-radius: ${U(28)}; padding: ${U(14)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); display: flex; gap: ${U(16)}; }
    .tpzb .ecrans { flex: none; width: ${U(262)}; height: 100%; border-radius: ${U(18)}; background: #2f3a4a center / contain no-repeat; box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); }
    .tpzb .infos { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: ${U(8)}; }
    .tpzb .infos h3 { margin: ${U(4)} 0 0; font-size: ${U(22)}; font-weight: 900; line-height: 1.15; overflow-wrap: anywhere; }
    .tpzb .infos .de { font-size: ${U(15)}; font-weight: 800; color: var(--pcv-cyan-plein); }
    .tpzb .infos p { margin: 0; font-size: ${U(14)}; font-weight: 700; line-height: 1.4; color: #5b6676; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow-wrap: anywhere; }
    .tpzb .infos .ch { display: flex; flex-wrap: wrap; gap: ${U(6)}; font-size: ${U(13)}; font-weight: 900; }
    .tpzb .infos .ch span { padding: ${U(3)} ${U(10)}; border-radius: ${U(12)}; background: rgba(120,135,155,.14); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tpzb .infos .credit { margin-top: auto; font-size: ${U(12)}; font-weight: 800; color: #7a8494; }
    .tpzb .installer { position: relative; overflow: hidden; height: ${U(56)}; border-radius: ${U(28)}; display: flex; align-items: center; justify-content: center; gap: ${U(10)}; background: var(--pcv-cyan); color: #fff; font-size: ${U(17)}; font-weight: 900; white-space: nowrap;
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), 0 ${U(8)} ${U(18)} color-mix(in srgb, var(--pcv-cyan-plein) 40%, transparent); }
    .tpzb .installer u { text-decoration: none; width: ${U(28)}; height: ${U(28)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #fff; color: var(--pcv-cyan-plein); font-size: ${U(13)}; font-weight: 900; z-index: 1; }
    .tpzb .installer span { z-index: 1; }
    .tpzb .installer em { position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: rgba(255,255,255,.28); transition: width .3s; }
    .tpzb .installer.ok { background: #2fbf71; }
    .tpzb .installer.ko { background: #e5484d; }
    .tpzb .installer.eteint { opacity: .45; }
    .tpzb .tpz-verif { position: absolute; left: ${U(48)}; top: ${U(80)}; width: ${U(1168)}; height: ${U(526)}; z-index: 5; border-radius: ${U(28)}; padding: ${U(14)} ${U(18)}; box-sizing: border-box;
      display: none; flex-direction: column; gap: ${U(10)}; background: #f4f7fb; box-shadow: var(--pcv-reflet), 0 ${U(16)} ${U(40)} rgba(0,0,0,.25); }
    .tpzb.verifie .tpz-verif { display: flex; }
    .tpzb.verifie > :not(.tpz-verif) { visibility: hidden; }
    .tpzb .tpz-verif .tpz-tete { display: flex; align-items: center; gap: ${U(14)}; }
    .tpzb .tpz-verif .tpz-msg { flex: 1; min-width: 0; font-size: ${U(14)}; font-weight: 700; color: #5b6676; line-height: 1.35; }
    .tpzb .tpz-verif .tpz-msg b { display: block; font-size: ${U(19)}; font-weight: 900; color: var(--pcv-texte); }
    .tpzb .tpz-verif .bt u { text-decoration: none; width: ${U(24)}; height: ${U(24)}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: #fff; color: var(--pcv-cyan-plein); font-size: ${U(12)}; }
    .tpzb .tpz-verif .tpz-site { flex: 1; border-radius: ${U(16)}; background: #fff; box-shadow: inset 0 0 0 1px rgba(0,0,0,.1); display: flex; align-items: center; justify-content: center; font-size: ${U(15)}; font-weight: 800; color: #8a93a2; }
  `;
  const poserCSS = (U) => {
    if (!document.getElementById("pcv-tpz-css")) {
      const s = document.createElement("style");
      s.id = "pcv-tpz-css";
      s.textContent = CSS(U);
      document.head.appendChild(s);
    }
  };
  const LOUPE = `<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>`;
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
        poserApercu(id);
        vueOk();
      }).catch(() => {
      }).finally(() => {
        enCours--;
        pomper();
      });
    }
  };
  const poserApercu = (id) => {
    if (!boite) return;
    const u = apercu(id);
    if (!u) return;
    boite.querySelectorAll(`.carte[data-id="${id}"] .vig`).forEach((v) => v.style.backgroundImage = `url("${u}")`);
    if (vu()?.id === id) $(".ecrans").style.backgroundImage = `url("${u}")`;
  };
  const VUE_URL = "https://themeplaza.art/themes";
  const assurerVue = () => {
    clearTimeout(vueFin);
    if (vue) return vuePrete;
    if (!boite) return Promise.resolve();
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
    const s = $(".tpz-verif .tpz-site");
    if (!vue || !verif || !s) return;
    const b = s.getBoundingClientRect();
    vue.SetBounds(Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height));
  };
  const montrerVerif = (reprendre) => {
    if (verif) {
      verif.reprendre.push(reprendre);
      return;
    }
    verif = { reprendre: [reprendre] };
    if (!boite) return;
    o.prendre();
    o.son("bord");
    marquer(true);
    boite.classList.add("verifie");
    if (vue) {
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
    }
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
    boite?.classList.remove("verifie");
    if (parBouton) {
      attenteAp = false;
      o?.son("bord");
      if (!M.res) dessinerGrille(`<b>ThemePlaza</b>${T("themeplaza.attend_verif")}`);
    } else v?.reprendre.forEach((f) => f());
  };
  const reessayer = () => {
    if (!verif) return;
    verif.reprendre.splice(0).forEach((f) => f());
  };
  window.addEventListener("resize", placerVue);
  fins.push(() => {
    window.removeEventListener("resize", placerVue);
    detruireVue();
  });
  const chercher = async (suite) => {
    if (chargement) return;
    chargement = true;
    const page = suite ? (M.res?.page || 0) + 1 : 1;
    if (!suite) {
      M.res = null;
      ligne = Math.min(ligne, 0);
      col = 0;
      dessinerGrille(`<b>${T("themeplaza.recherche_cours")}</b>${T("themeplaza.repond")}`);
    }
    let r;
    try {
      await assurerVue();
      r = await appeler("themeplaza_recherche", M.texte, page, M.tri, M.musique);
    } catch (e) {
      r = { erreur: T("commun.greffon_pas_redemarre") };
    }
    chargement = false;
    if (!boite) return;
    if (attendre(r, () => chercher(suite))) {
      if (!suite && r.verification) dessinerGrille(`<b>${T("themeplaza.etape.verification")}</b>${T("themeplaza.demande_verif")}`);
      return;
    }
    vueOk();
    if (!r || r.erreur) {
      if (!suite) dessinerGrille(`<b>${T("themeplaza.indisponible")}</b>${o.echap(r?.erreur || T("commun.pas_de_reponse"))}`);
      return;
    }
    M.res = suite && M.res ? { ...r, themes: [...M.res.themes, ...r.themes] } : r;
    dessinerGrille();
    if (!suite) fiche();
  };
  const carte = (t) => `<div class="carte pf${M.installes[t.id] || o.importe(t.id) ? " porte" : ""}" data-id="${o.echap(t.id)}" style="--a:var(--pcv-cyan-plein)"><div class="vig"${apercu(t.id) ? ` style="background-image:url('${apercu(t.id)}')"` : ""}>${t.musique ? "<b>\u266A</b>" : ""}</div>
    <div class="nm"><span>${o.echap(t.titre)}</span><small>${T("themeplaza.de_auteur", { auteur: o.echap(t.auteur || "?") })}</small></div></div>`;
  const dessinerGrille = (mot) => {
    if (!boite) return;
    const l = themes();
    $(".rang").innerHTML = mot ? `<div class="mot">${mot}</div>` : l.length ? l.map(carte).join("") : `<div class="mot"><b>${T("themeplaza.aucun_theme")}</b>${M.musique ? T("themeplaza.essaie_autre_mot_musique") : T("themeplaza.essaie_autre_mot")}</div>`;
    l.forEach((t) => demander(t.id));
    marquer(actif);
  };
  const vu = () => themes()[ligne >= 0 ? ligne * 3 + col : ligne === -2 ? M.dernier?.[1] ?? 0 : 0];
  const fiche = () => {
    const t = vu(), f = $(".fiche");
    if (!f) return;
    if (!t) {
      f.style.visibility = "hidden";
      return;
    }
    f.style.visibility = "";
    const e = etat?.id === t.id ? etat : null, fait = M.installes[t.id] || o.importe(t.id) || e?.etape === "fini";
    $(".ecrans").style.backgroundImage = apercu(t.id) ? `url("${apercu(t.id)}")` : "none";
    $(".infos h3").textContent = t.titre;
    $(".infos .de").textContent = T("themeplaza.de_auteur", { auteur: t.auteur || T("themeplaza.auteur_inconnu") });
    $(".infos p").textContent = t.description || "";
    $(".infos .ch").innerHTML = `<span>\u2B07 ${t.telechargements}</span><span>\u2665 ${t.aimes}</span>` + (t.musique ? `<span>\u266A ${o.echap(t.piste || T("themeplaza.musique_mot"))}</span>` : "");
    const b = $(".installer"), occupe = etat && !["fini", "erreur", "repos"].includes(etat.etape);
    b.classList.toggle("ok", !!fait);
    b.classList.toggle("ko", e?.etape === "erreur");
    b.classList.toggle("eteint", !!occupe && !e);
    b.querySelector("span").textContent = e && !["fini", "erreur"].includes(e.etape) ? `${ETAPES[e.etape] || "\u2026"} ${Math.round((e.pct || 0) * 100)} %` : e?.etape === "erreur" ? T("themeplaza.echec_message", { msg: e.message || "?" }) : fait ? T("themeplaza.appliquer") : T("themeplaza.installer");
    b.querySelector("em").style.width = e && !["fini", "erreur"].includes(e.etape) ? Math.round((e.pct || 0) * 100) + "%" : "0";
    demander(t.id);
  };
  const marquer = (a) => {
    actif = a;
    if (!boite) return;
    const bs = [$(".champ"), $('[data-b="tri"]'), $('[data-b="musique"]')];
    bs.forEach((x, i) => x.classList.toggle("sel", a && ligne < 0 && col === i));
    boite.querySelectorAll(".rang .carte").forEach((c, i) => c.classList.toggle("sel", a && ligne >= 0 && i === ligne * 3 + col));
    $(".installer").classList.toggle("sel", a && ligne === -2);
    boite.querySelector(".rang .sel")?.scrollIntoView?.({ block: "nearest" });
  };
  const barre = () => {
    $('[data-b="tri"]').innerHTML = `\u21C5 ${TRIS.find(([k]) => k === M.tri)[1]}`;
    $('[data-b="musique"]').classList.toggle("on", M.musique);
  };
  const installer = async (t = vu()) => {
    if (!t) return o.son("bord");
    if (M.installes[t.id] || o.importe(t.id) || etat?.id === t.id && etat.etape === "fini") {
      await o.charger();
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
      fiche();
      return o.son("bord");
    }
    o.son("choisir");
    etat = { id: t.id, etape: "telechargement", pct: 0 };
    fiche();
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
        M.installes[etat.id] = true;
        o.son("theme");
        await o.charger();
        dessinerGrille();
      } else if (etat.etape === "erreur") {
        clearInterval(suivi);
        if (attendre(etat, () => {
          etat = null;
          installer(t);
        })) {
          etat = null;
          fiche();
          return;
        }
        o.son("bord");
      }
      fiche();
    }, 400);
  };
  const ouvrirClavier = () => {
    const i = $(".champ input");
    if (!window.__pcvClavier?.(i)) i.focus();
  };
  const valider = () => {
    const i = $(".champ input");
    i.blur();
    if (i.value.trim() !== M.texte) {
      M.texte = i.value.trim().slice(0, 60);
      chercher();
    }
  };
  const appuyer = (i) => {
    if (i === 0) return ouvrirClavier();
    if (i === 1) {
      const k = TRIS.findIndex(([x]) => x === M.tri);
      M.tri = TRIS[(k + 1) % TRIS.length][0];
    } else M.musique = !M.musique;
    o.son("choisir");
    barre();
    chercher();
  };
  const tape = () => document.activeElement === $(".champ input");
  const touche = (b) => {
    if (!boite) return false;
    if (verif) {
      if (b === 1) reessayer();
      else if (b === 2) fermerVerif(true);
      return true;
    }
    if (tape() && b !== 5 && b !== 6) {
      if (b === 1) valider();
      else if (b === 2 || b === 10) {
        $(".champ input").blur();
        if (b === 10 && themes().length) {
          ligne = 0;
          col = 0;
          fiche();
        }
        marquer(true);
      }
      return true;
    }
    const n = themes().length, lignes = Math.ceil(n / 3);
    const bouge = () => {
      o.son("bouge");
      marquer(true);
      fiche();
      return true;
    };
    if (b === 1) {
      if (ligne === -1) appuyer(col);
      else installer();
      return true;
    }
    if (b === 5 || b === 6 || b === 2) return false;
    if (ligne === -2) {
      if (b === 11) {
        ligne = Math.max(0, Math.min(lignes - 1, M.dernier?.[0] ?? 0));
        col = (M.dernier?.[1] ?? 2) % 3;
        return bouge();
      }
      if (b === 10) return "bas";
      if (b === 9) {
        ligne = -1;
        col = 2;
        return bouge();
      }
      return true;
    }
    if (ligne === -1) {
      if (b === 11) {
        if (col === 0) {
          o.son("bord");
          return true;
        }
        col--;
        return bouge();
      }
      if (b === 12) {
        if (col === 2) {
          o.son("bord");
          return true;
        }
        col++;
        return bouge();
      }
      if (b === 9) return "haut";
      if (b === 10) {
        if (!n) return "bas";
        ligne = 0;
        col = Math.min(col, n - 1);
        return bouge();
      }
      return true;
    }
    const i = ligne * 3 + col;
    if (b === 11) {
      if (col === 0) {
        o.son("bord");
        return true;
      }
      col--;
    } else if (b === 12) {
      if (col === 2 || i === n - 1) {
        M.dernier = [ligne, i];
        ligne = -2;
        return bouge();
      }
      col++;
    } else if (b === 9) {
      ligne--;
      if (ligne < 0) col = Math.min(col, 2);
    } else if (b === 10) {
      if (ligne + 1 < lignes) {
        ligne++;
        col = Math.min(col, n - 1 - ligne * 3);
      } else if (M.res && M.res.page < M.res.pages) {
        chercher(true);
        return true;
      } else return "bas";
    } else return true;
    return bouge();
  };
  const monter = (r, outils) => {
    demonter();
    racine = r;
    o = outils;
    poserCSS(o.U);
    racine.classList.add("tpz");
    boite = document.createElement("div");
    boite.className = "tpzb";
    boite.innerHTML = `<div class="barre"><label class="champ pf"><i>${LOUPE}</i><input type="text" maxlength="60" spellcheck="false" placeholder="${T("themeplaza.chercher_theme")}"></label>
        <div class="bt pf" data-b="tri"></div><div class="bt pf" data-b="musique">\u266A ${T("themeplaza.avec_musique")}</div></div>
      <div class="source">${T("themeplaza.source")}</div><div class="grille"><div class="rang"></div></div>
      <div class="fiche"><div class="ecrans"></div><div class="infos"><h3></h3><div class="de"></div><p></p><div class="ch"></div>
        <div class="credit">Th\xE8me cr\xE9\xE9 par la communaut\xE9, h\xE9berg\xE9 sur ThemePlaza (themeplaza.art)</div>
        <div class="installer pf"><em></em><u>${o.T(1)}</u><span>Installer</span></div></div></div>
      <div class="tpz-verif"><div class="tpz-tete"><div class="tpz-msg"><b>ThemePlaza demande une v\xE9rification</b>Le site veut s'assurer qu'une personne est l\xE0 : fais sa v\xE9rification ci-dessous, au doigt, comme dans un navigateur. L'onglet reprend tout seul.</div>
        <div class="bt pf" data-v="reessayer"><u>${o.T(1)}</u>R\xE9essayer</div><div class="bt pf" data-v="fermer"><u>${o.T(2)}</u>Fermer</div></div>
        <div class="tpz-site">Chargement de themeplaza.art\u2026</div></div>`;
    racine.appendChild(boite);
    const champ = $(".champ input");
    champ.value = M.texte;
    champ.onfocus = () => {
      ligne = -1;
      col = 0;
      marquer(true);
    };
    $(".champ").onclick = () => {
      o.prendre();
      ligne = -1;
      col = 0;
      marquer(true);
      ouvrirClavier();
    };
    boite.querySelectorAll(".bt").forEach((x, i) => x.onclick = () => {
      o.prendre();
      ligne = -1;
      col = i + 1;
      marquer(true);
      appuyer(i + 1);
    });
    $(".rang").onclick = (e) => {
      const c = e.target.closest(".carte");
      if (!c) return;
      const i = [...$(".rang").children].indexOf(c);
      o.prendre();
      if (ligne >= 0 && i === ligne * 3 + col) return installer();
      ligne = Math.floor(i / 3);
      col = i % 3;
      o.son("bouge");
      marquer(true);
      fiche();
    };
    $(".installer").onclick = () => {
      o.prendre();
      installer();
    };
    $('[data-v="reessayer"]').onclick = () => {
      o.son("choisir");
      reessayer();
    };
    $('[data-v="fermer"]').onclick = () => fermerVerif(true);
    new ResizeObserver(placerVue).observe($(".tpz-verif .tpz-site"));
    assurerVue();
    $(".grille").onscroll = (e) => {
      const g = e.target;
      if (!chargement && M.res && M.res.page < M.res.pages && g.scrollTop + g.clientHeight > g.scrollHeight - 80) chercher(true);
    };
    barre();
    if (M.res) {
      dessinerGrille();
      fiche();
    } else chercher();
  };
  const demonter = () => {
    clearInterval(suivi);
    clearInterval(garde);
    verif = null;
    attenteAp = false;
    cacherVue();
    clearTimeout(vueFin);
    vueFin = setTimeout(detruireVue, 1500);
    enFile = [];
    boite?.remove();
    boite = null;
    racine?.classList.remove("tpz");
    racine = null;
  };
  const entrer = (d) => {
    if (d === "bas" && themes().length) {
      ligne = Math.ceil(themes().length / 3) - 1;
      col = 0;
    } else {
      ligne = -1;
      col = 0;
    }
    marquer(true);
    fiche();
  };
  const clavier = (e) => {
    if (!tape()) return;
    if (e.key === "Enter") {
      valider();
      e.preventDefault();
    } else if (e.key === "Escape") {
      $(".champ input").blur();
      marquer(true);
      e.preventDefault();
    }
    e.stopImmediatePropagation();
  };
  window.addEventListener("keydown", clavier, true);
  fins.push(() => window.removeEventListener("keydown", clavier, true));
  fins.push(() => {
    demonter();
    document.getElementById("pcv-tpz-css")?.remove();
  });
  window.__pcvThemePlaza = { monter, demonter, touche: (b) => touche(b), marquer: (a) => marquer(a), entrer, verifier: () => montrerVerif(() => {
  }), poserCSS, LOUPE };
  return "ThemePlaza pr\xEAt";
})();
