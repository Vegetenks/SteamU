(() => {
  window.__pcvMediatheque?.detruire();
  const O = window.opener || window, I = window.__pcvIcones, P = window.__pcvPresentation;
  const T = (k, v) => window.__pcvT?.("mediatheque." + k, v) || k;
  const e = P.echapper, ico = (n) => I.svg(n), u = (n) => `calc(var(--u) * ${n})`;
  let jeux = [], toutes = [], lignes = [], titreG = "", vision = -1, listeVision = [], erreur = "", chargement = false;
  const adresse = (s) => /^(https?|data|blob):/.test(s.strUrl || "") ? s.strUrl : "https://steamloopback.host/" + String(s.strUrl || "").replace(/^\/+/, "");
  const appidDe = (g) => {
    try {
      return /^\d{11,}$/.test(g) ? Number(BigInt(g) >> 32n) : +g;
    } catch (x) {
      return 0;
    }
  };
  const appDe = (g) => {
    try {
      const a = appidDe(g);
      return O.appStore.GetAppOverviewByAppID(a) || a < 16777216 && (O.appStore.allApps || []).find((x) => x.app_type === 1073741824 && (x.appid & 16777215) === a) || null;
    } catch (x) {
      return null;
    }
  };
  const lire = async () => {
    const S2 = O.SteamClient?.Screenshots;
    if (!S2?.GetAllAppsLocalScreenshotsCount) throw Error("Steam");
    const n = await S2.GetAllAppsLocalScreenshotsCount(), l = [];
    for (let i = 0; i < n; i += 1e3) l.push(...await S2.GetAllAppsLocalScreenshotsRange(i, Math.min(n - 1, i + 999)) || []);
    return l.filter((s) => s?.strUrl).map((s) => ({ ...s, id: s.strGameID + ":" + s.hHandle })).sort((a, b) => (b.nCreated || 0) - (a.nCreated || 0));
  };
  const CLIENT_STEAM = 7;
  const grouper = (l) => {
    const par = /* @__PURE__ */ new Map();
    for (const s of l) {
      const g = String(s.strGameID);
      if (!par.has(g)) {
        const a = appDe(g), steam2 = !a && appidDe(g) === CLIENT_STEAM;
        par.set(g, { id: g, a, steam: steam2, nom: a?.display_name || s.strShortcutName || T(steam2 ? "steam" : "jeu_inconnu"), l: [] });
      }
      par.get(g).l.push(s);
    }
    return [...par.values()];
  };
  const date = (s) => s.nCreated ? new Date(s.nCreated * 1e3).toLocaleString(window.__pcvLangue?.() || void 0, { dateStyle: "long", timeStyle: "short" }) : "";
  const capture = (s, c, attrs = "") => `<div class="cel" aria-label="${e(date(s))}" ${attrs}><div class="im cap"><img loading="lazy" decoding="async" alt="" src="${e(adresse(s))}"></div></div>`;
  const jaquette = (j, c, attrs = "") => `<div class="cel jeu" aria-label="${e(j.nom)}" ${attrs}>${j.a ? `<div class="im" data-p="${e(j.id)}" data-c="${c}"></div>` : `<div class="im nomme" style="--fond:${window.__pcvFondRepli?.(appidDe(j.id) % 360)}">${P.repliTuile(j.nom, ico(j.steam ? "bibliotheque" : "album"), c)}</div>`}</div>`;
  const peindreJaquettes = () => {
    for (const im of m.ombre.querySelectorAll(".im[data-p]:not([data-appid])")) {
      const j = jeux.find((x) => x.id === im.dataset.p);
      if (j?.a) window.__pcvJeux?.peindre(im, j.a, +im.dataset.c);
    }
  };
  const message = () => chargement ? T("chargement") : erreur || (!toutes.length ? T("aucune") : "");
  const peindreVision = () => {
    const s = listeVision[vision];
    if (!s) return;
    const j = jeux.find((x) => x.id === String(s.strGameID));
    m.$(".menus").innerHTML = `<div class="visionneuse" role="dialog" aria-label="${e(T("visionneuse"))}"><img alt="" src="${e(adresse(s))}"><div class="infos-v"><span>${e(j?.nom || "")}</span><small>${e(date(s))}</small><small>${vision + 1} / ${listeVision.length}</small></div><button class="fleche-v g verre" data-v="-1" aria-label="${e(T("precedente"))}">${ico("fleche")}</button><button class="fleche-v d verre" data-v="1" aria-label="${e(T("suivante"))}">${ico("fleche")}</button></div>`;
    m.legende();
  };
  const autre = (d) => {
    const i = vision + d;
    if (i < 0 || i >= listeVision.length) return window.__pcvSon?.("bord");
    vision = i;
    peindreVision();
  };
  const fermerVision = () => {
    if (vision < 0) return;
    vision = -1;
    m.calque = null;
    window.__pcvApparition?.(m.$(".menus"), true, ".visionneuse");
    m.$(".menus").innerHTML = "";
    m.legende();
    m.marquer();
  };
  const calque = {
    touche: (b) => {
      if (b === 2) fermerVision();
      else if (b === 3) options(listeVision[vision]);
      else if (b === 11 || b === 5) autre(-1);
      else if (b === 12 || b === 6) autre(1);
      else window.__pcvSon?.("bord");
    },
    fermer: fermerVision,
    legende: () => [[[5, 6], T("precedente_suivante")], [3, T("options")], [2, T("fermer")]]
  };
  const voir = (l, i) => {
    const premiere = vision < 0;
    listeVision = l;
    vision = Math.max(0, Math.min(l.length - 1, i));
    m.calque = calque;
    peindreVision();
    if (premiere) window.__pcvApparition?.(m.$(".menus"), false, ".visionneuse");
  };
  const steam = (motif, test) => {
    try {
      const r = O.__pcvReq ||= (() => {
        let q;
        O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (x) => {
          q = x;
        }]);
        return q;
      })();
      for (const id of Object.keys(r.m)) {
        if (!String(r.m[id]).includes(motif)) continue;
        for (const v of Object.values(r(id) || {})) if (test(v)) return v;
      }
    } catch (x) {
    }
    return null;
  };
  const versSteam = () => steam("strShortcutName", (v) => typeof v === "function" && /type:"screenshot"/.test(String(v)));
  const feuilleDePartage = () => steam("ScreenshotUploader_SaveImage", (v) => typeof v === "function" && /showConfirmationOverride/.test(String(v)));
  const S = () => O.SteamClient.Screenshots, ou = () => m.$(".cel.sel, .visionneuse img") || document.body;
  const appel = (methode, ...a) => window.__pcvBridge.callPlugin(window.__pcvGreffon.nom, methode, ...a);
  let finPartage = 0, suiviPartage = 0, avalerMenu = false;
  const envoyerQuandPrete = (tab, essais = 50) => {
    const vue = tab?.GetChatView?.(), p = vue?.m_fileUploadManager?.m_fileUploadProps;
    if (p?.file && p.eUploadState === 1) {
      vue.UploadFile().catch?.(() => {
      });
      m.fermer();
      window.__pcvAmisDiscussion?.(vue.chat?.chat_partner?.accountid);
    } else if (essais > 0) setTimeout(() => envoyerQuandPrete(tab, essais - 1), 100);
  };
  const detournerChat = () => {
    const MS = O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore, ouvrir2 = MS.OpenSideMenu, UI = O.g_FriendsUIApp.UIStore, montrerChat = UI.ShowAndOrActivateChat;
    if (!montrerChat.__pcvPartage) {
      const g = function(...a) {
        const partage = Date.now() < finPartage;
        avalerMenu = partage;
        try {
          const t = montrerChat.apply(this, a);
          if (partage) {
            finPartage = 0;
            envoyerQuandPrete(t);
          }
          return t;
        } finally {
          avalerMenu = false;
        }
      };
      g.__pcvPartage = true;
      UI.ShowAndOrActivateChat = g;
    }
    if (!ouvrir2.__pcvPartage) {
      const f = function(menu, ...a) {
        if (menu === 2 && avalerMenu) return;
        return ouvrir2.call(this, menu, ...a);
      };
      f.__pcvPartage = true;
      MS.OpenSideMenu = f;
    }
    clearInterval(suiviPartage);
    finPartage = Date.now() + 5e3;
    suiviPartage = setInterval(() => {
      if (document.querySelector(".BasicUIContextMenu")) finPartage = Date.now() + 5e3;
      else if (Date.now() > finPartage) clearInterval(suiviPartage);
    }, 250);
  };
  const partager = (s) => {
    const R = O.SP_REACT, conv = versSteam(), hook = feuilleDePartage();
    if (!R || !conv || !hook) return window.__pcvSon?.("bord");
    const capture2 = conv(s), el = ou(), Lanceur = () => {
      const ouvrir2 = hook();
      R.useEffect(() => {
        ouvrir2(capture2, el);
      }, []);
      return null;
    };
    detournerChat();
    O.DFL.showContextMenu(R.createElement(Lanceur), el);
  };
  const enregistrer = async (s) => {
    let r = null;
    try {
      r = await appel("enregistrer_capture", await S().GetLocalScreenshotPath(s.strGameID, s.hHandle));
    } catch (x) {
    }
    window.__pcvBulleGrande?.({ svg: ico(r?.fichier ? "telechargements" : "info"), titre: T(r?.fichier ? "enregistree" : "pas_enregistree"), ligne: r?.fichier ? T("dans_telechargements", { f: r.fichier }) : "" });
  };
  const supprimer = (s) => {
    const R = O.SP_REACT, D = O.DFL;
    D.showModal(R.createElement(D.ConfirmModal, {
      strTitle: T("supprimer_titre"),
      strDescription: T("supprimer_texte"),
      strOKButtonText: T("supprimer"),
      onOK: async () => {
        const ok = await S().DeleteLocalScreenshot(s.strGameID, s.hHandle).catch(() => false);
        if (ok === false) return window.__pcvBulleGrande?.({ svg: ico("info"), titre: T("pas_supprimee"), ligne: "" });
        if (vision >= 0) fermerVision();
        lignes = lignes.filter((x) => x.id !== s.id);
        listeVision = listeVision.filter((x) => x.id !== s.id);
        charger();
      }
    }));
  };
  const options = (s) => {
    if (!s?.hHandle && s?.hHandle !== 0) return window.__pcvSon?.("bord");
    const R = O.SP_REACT, D = O.DFL;
    if (!R || !D?.showContextMenu) return window.__pcvSon?.("bord");
    const item = (mot, f) => R.createElement(D.MenuItem, { onSelected: f }, mot);
    D.showContextMenu(R.createElement(
      D.Menu,
      { label: T("options") },
      vision < 0 && item(T("afficher"), () => voir(lignes.length ? lignes : listeVision, Math.max(0, lignes.indexOf(s)))),
      item(T("partager"), () => partager(s)),
      item(T("enregistrer"), () => enregistrer(s)),
      item(T("supprimer"), () => supprimer(s))
    ), ou());
  };
  const ouvrirGrille = (l, titre, porte = false) => {
    lignes = l;
    titreG = titre;
    m.ouvrirGrille(titre, porte);
  };
  const m = P.magasin({
    id: "pcv-medias",
    nom: "medias",
    cle: (x) => x.l ? "jeu-" + x.id : x.id,
    tuile: (x, c, attrs) => x.l ? jaquette(x, c, attrs) : capture(x, c, attrs),
    style: `
    .cap { overflow:hidden;background:var(--pcv-creux); } .cap img { width:100%;height:100%;object-fit:cover;display:block; }
    .visionneuse { position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${u(14)};padding:${u(92)} ${u(40)} ${u(80)};background:rgba(8,12,20,.92); }
    .visionneuse img { max-width:100%;max-height:100%;min-height:0;object-fit:contain;border-radius:${u(12)};box-shadow:0 ${u(10)} ${u(40)} rgba(0,0,0,.5); }
    .visionneuse .infos-v { display:flex;gap:${u(14)};align-items:center;color:#fff;font-weight:800;font-size:${u(16)}; } .visionneuse .infos-v small { opacity:.7; }
    .visionneuse .fleche-v { position:absolute;top:50%;transform:translateY(-50%);width:${u(64)};height:${u(64)};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${u(28)};color:var(--pcv-texte); }
    .visionneuse .fleche-v.g { left:${u(24)}; } .visionneuse .fleche-v.g svg { transform:scaleX(-1); } .visionneuse .fleche-v.d { right:${u(24)}; }`,
    // la porte : toutes les captures ; une étagère par jeu (sa jaquette, puis ses captures), du plus récent
    porte: () => ({ liste: toutes, titre: T("toutes"), nombre: T("nb", { n: toutes.length }), ouvrir: () => ouvrirGrille(toutes, T("toutes"), true) }),
    avant: () => message() ? `<div class="message">${e(message())}</div>` : "",
    etageres: () => jeux.map((j) => ({
      cle: j.id,
      titre: j.nom,
      icone: "album",
      nombre: j.l.length,
      items: [j, ...j.l],
      toutNombre: j.l.length,
      ouvrir: (x, _l, i) => x.l ? ouvrirGrille(j.l, j.nom) : voir(j.l, i - 1),
      page: (x) => x.l ? ouvrirGrille(j.l, j.nom) : options(x),
      tout: () => ouvrirGrille(j.l, j.nom)
    })),
    peindre: () => peindreJaquettes(),
    grille: {
      onglets: () => [{ cle: titreG, nom: titreG, n: lignes.length }],
      liste: () => lignes,
      nom: (s) => e(date(s || {})),
      message: () => message() || T("aucune"),
      ouvrir: (_s, i) => voir(lignes, i),
      page: (s) => options(s)
    },
    libelles: () => ({ a: T("voir"), x: T("options") }),
    clic: (x) => {
      if (vision < 0) return false;
      const t = x.target.closest?.("[data-v], .visionneuse");
      if (t?.dataset.v) autre(+t.dataset.v);
      else if (t) fermerVision();
      return true;
    }
  });
  const charger = async () => {
    chargement = true;
    erreur = "";
    m.rendre();
    try {
      toutes = await lire();
      jeux = grouper(toutes);
    } catch (x) {
      erreur = T("indisponible");
      toutes = [];
      jeux = [];
    }
    chargement = false;
    m.rendre();
  };
  const ouvrir = (r = null) => {
    m.auRetour = r;
    m.debut();
    vision = -1;
    m.calque = null;
    m.$(".menus").innerHTML = "";
    m.montrer();
    charger();
  };
  window.__pcvMediatheque = { ouvrir, ouvert: m.ouvert, fermer: m.fermer, detruire: m.detruire };
  return "album pr\xEAt";
})();
