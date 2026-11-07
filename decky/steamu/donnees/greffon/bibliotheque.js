(() => {
  document.getElementById("pcv-biblio")?.remove();
  clearInterval(window.__pcvBiblio);
  const AVATAR = document.querySelector("#header_profile img")?.src || "";
  const racine = document.createElement("div");
  racine.id = "pcv-biblio";
  racine.innerHTML = `<style>
    
    #pcv-biblio .etiq, #pcv-biblio .bulle { pointer-events: none; }
    #pcv-biblio .etiq { position: fixed; z-index: 8000; transform: translateX(-50%); padding: calc(var(--u) * 4) calc(var(--u) * 12);
      border-radius: calc(var(--u) * 12); background: var(--pcv-bulle); color: var(--pcv-sur-accent); font: 900 calc(var(--u) * 13) var(--pcv-police); white-space: nowrap; }
    #pcv-biblio .bulle { position: fixed; z-index: 8000; display: flex; align-items: center; gap: calc(var(--u) * 10);
      padding: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 10) calc(var(--u) * 10); border-radius: calc(var(--u) * 22);
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); color: var(--pcv-texte);
      font: 800 calc(var(--u) * 15) var(--pcv-police); white-space: nowrap; animation: pcvBulle .3s ease-out both; transform-origin: calc(var(--u) * 30) 0; }
    #pcv-biblio .bulle::after { content: ""; position: absolute; top: calc(var(--u) * -8); left: calc(var(--u) * 34); width: calc(var(--u) * 18); height: calc(var(--u) * 18);
      background: var(--pcv-carte); transform: rotate(45deg); border-radius: 3px; }
    #pcv-biblio .bulle img { position: relative; z-index: 1; width: calc(var(--u) * 38); height: calc(var(--u) * 38); border-radius: 50%; box-shadow: inset 0 -3px 0 rgba(0,0,0,.08); }
    #pcv-biblio .bulle span { position: relative; z-index: 1; }
    @keyframes pcvBulle { 0% { opacity: 0; transform: scale(.5); } 70% { opacity: 1; transform: scale(1.04); } 100% { transform: scale(1); } }
    #pcv-biblio [hidden] { display: none !important; }   
  </style><div class="etiq" hidden></div><div class="bulle" hidden><img alt=""><span></span></div>`;
  document.body.appendChild(racine);
  const etiq = racine.querySelector(".etiq"), bulle = racine.querySelector(".bulle");
  bulle.querySelector("img").src = AVATAR;
  const appDe = (el) => {
    const k = Object.keys(el).find((x) => x.startsWith("__reactFiber"));
    for (let f = el[k], i = 0; f && i < 15; i++, f = f.return) if (f.memoizedProps?.app?.appid) return f.memoizedProps.app;
    return null;
  };
  const Tb = (k, v) => window.__pcvT?.(k, v) ?? k;
  const duree = (min) => (min = Math.round(min || 0), !min) ? Tb("biblio.jamais") : min < 60 ? Tb("biblio.min", { n: min }) : Tb("biblio.heures", { h: Math.floor(min / 60), m: String(min % 60).padStart(2, "0") });
  const date = (rt) => rt ? new Date(rt * 1e3).toLocaleDateString(window.__pcvLocale?.() || "fr-FR", { day: "numeric", month: "short" }) : "";
  let dernier = null;
  const nouvelle = () => document.getElementById("pcv-biblio-d")?.hidden === false;
  window.__pcvBiblio = setInterval(() => {
    const p = window.opener?.location.pathname || "";
    const focus = /^\/routes\/library\/?$|^\/routes\/library\/(?:collection|tab)/.test(p) ? document.querySelector("._3vHkmRShhzwd67_MtEq8-n .gpfocus") : null;
    let menuOuvert = false;
    try {
      const req = window.opener.__pcvReq ||= (() => {
        let r2;
        window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
          r2 = q;
        }]);
        return r2;
      })();
      menuOuvert = req(75380).SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore.IsAnySideMenuVisible();
    } catch (e) {
    }
    const app = !menuOuvert && focus && !nouvelle() && appDe(focus);
    if (!app) {
      if (!etiq.hidden) etiq.hidden = true;
      if (!bulle.hidden) bulle.hidden = true;
      dernier = null;
      return;
    }
    const r = focus.getBoundingClientRect(), u = innerHeight / 800;
    etiq.style.left = r.left + r.width / 2 + "px";
    etiq.style.top = r.bottom - 6 * u + "px";
    bulle.style.left = r.left - 6 * u + "px";
    bulle.style.top = r.bottom + 32 * u + "px";
    if (dernier !== app.appid) {
      dernier = app.appid;
      etiq.textContent = app.display_name;
      const t = duree(app.minutes_playtime_forever), d = date(app.rt_last_time_played);
      bulle.querySelector("span").textContent = d ? Tb("biblio.temps_der", { temps: t, date: d }) : t;
      bulle.style.animation = "none";
      void bulle.offsetWidth;
      bulle.style.animation = "";
    }
    if (etiq.hidden) etiq.hidden = false;
    if (bulle.hidden) bulle.hidden = false;
  }, 120);
  document.removeEventListener("focusin", window.__pcvOngletCentre, true);
  document.addEventListener("focusin", window.__pcvOngletCentre = (e) => {
    if (document.body.dataset.pcvPage !== "bibliotheque") return;
    for (let p = e.target.parentElement; p && p !== document.body; p = p.parentElement) {
      if (p.scrollWidth > p.clientWidth + 1 && p.scrollHeight <= p.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(p).overflowX)) {
        e.target.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
        return;
      }
    }
  }, true);
  document.getElementById("pcv-trier")?.remove();
  const trier = document.createElement("button");
  trier.id = "pcv-trier";
  const T = (k, f) => window.__pcvT?.(k) ?? f;
  trier.dataset.pcvNom = T("biblio.trier_nom", "Trier la biblioth\xE8que");
  trier.innerHTML = "<i></i>" + T("biblio.trier", "Trier");
  trier.hidden = true;
  trier.onclick = () => window.__pcvEnvoyer(4);
  const st = document.createElement("style");
  st.textContent = `
    #pcv-trier { all: unset; position: fixed; z-index: 8100; right: calc(var(--u) * 24); top: calc(var(--u) * 91); height: calc(var(--u) * 42); padding: 0 calc(var(--u) * 18) 0 calc(var(--u) * 6);
      display: flex; align-items: center; gap: calc(var(--u) * 8); border-radius: calc(var(--u) * 23); cursor: pointer; font: 900 calc(var(--u) * 15) var(--pcv-police); color: var(--pcv-texte);
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    #pcv-trier[hidden] { display: none; }
    #pcv-trier:hover { box-shadow: var(--pcv-reflet), 0 0 0 calc(var(--u) * 4) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * 8) var(--pcv-cyan-plein); }
    #pcv-trier i { width: calc(var(--u) * 34); height: calc(var(--u) * 34); border-radius: 50%; background: var(--pcv-pastille) center / 55% no-repeat
      url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%235b6676%22%20stroke-width%3D%222.6%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M4%206h16M7%2012h10M10%2018h4%22%2F%3E%3C%2Fsvg%3E");
      box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); }`;
  trier.appendChild(st);
  document.body.appendChild(trier);
  clearInterval(window.__pcvTrierSuivi);
  window.__pcvTrierSuivi = setInterval(() => {
    const cache = nouvelle() || !/^\/routes\/library\/?$|^\/routes\/library\/(?:collection|tab)/.test(window.opener?.location.pathname || "");
    if (trier.hidden !== cache) trier.hidden = cache;
  }, 250);
  {
    document.getElementById("pcv-biblio-d")?.remove();
    clearInterval(window.__pcvBiblioDSuivi);
    window.__pcvBiblioMagasin?.detruire();
    const O = window.opener, I = window.__pcvIcones, ico = (n) => I.svg(n), P = window.__pcvPresentation;
    const T2 = (k, v) => window.__pcvT ? window.__pcvT(k, v) : k;
    const e = P.echapper;
    const ROUTE = /^\/routes\/library\/?$|^\/routes\/library\/(?:collection|tab)/;
    const BOUTIQUES = { steam: "Steam", epic: "Epic", gog: "GOG", amazon: "Amazon", ubisoft: "Ubisoft", battlenet: "Battle.net", itchio: "itch.io", xbox: "Xbox", gamevault: "GameVault" };
    const SOURCES = [...Object.keys(BOUTIQUES), "emu", "autre"];
    const EMULATEURS = [
      ["eden", "Eden", "Nintendo Switch"],
      ["ryujinx", "Ryujinx", "Nintendo Switch"],
      ["yuzu", "Yuzu", "Nintendo Switch"],
      ["suyu", "Suyu", "Nintendo Switch"],
      ["sudachi", "Sudachi", "Nintendo Switch"],
      ["citron", "Citron", "Nintendo Switch"],
      ["azahar", "Azahar", "Nintendo 3DS"],
      ["citra", "Citra", "Nintendo 3DS"],
      ["lime3ds", "Lime3DS", "Nintendo 3DS"],
      ["melonds", "melonDS", "Nintendo DS"],
      ["desmume", "DeSmuME", "Nintendo DS"],
      ["dolphin", "Dolphin", "GameCube, Wii"],
      ["cemu", "Cemu", "Wii U"],
      ["mgba", "mGBA", "Game Boy Advance"],
      ["duckstation", "DuckStation", "PlayStation"],
      ["pcsx2", "PCSX2", "PlayStation 2"],
      ["rpcs3", "RPCS3", "PlayStation 3"],
      ["ppsspp", "PPSSPP", "PSP"],
      ["xemu", "xemu", "Xbox"],
      ["flycast", "Flycast", "Dreamcast"],
      ["retroarch", "RetroArch", ""]
    ].map(([k, nom, c]) => [new RegExp("\\b" + k, "i"), nom, c]);
    const sourceDe = (exe, options) => {
      const t = exe + " " + options;
      const b = /(?:^|[\s"])(epic|gog|amazon|ubisoft|battlenet|itchio|xbox|gamevault):[^\s"]/i.exec(options) || /(?:^|[\s"])(epic|gog|amazon|ubisoft|battlenet|itchio|xbox|gamevault):[^\s"]/i.exec(exe);
      if (b) return { src: b[1].toLowerCase(), lanceur: "Unifideck" };
      if (/heroic/i.test(t)) {
        const s = /\bgog\b/i.test(t) ? "gog" : /legendary|\bepic\b/i.test(t) ? "epic" : /\bnile\b|amazon/i.test(t) ? "amazon" : "autre";
        return { src: s, lanceur: "Heroic" };
      }
      const m2 = EMULATEURS.find(([re]) => re.test(t));
      if (m2) {
        const f = t.match(/[^\/\\"']+\.(?!(?:sh|appimage|exe|desktop|bat|hgl)\b)[a-z0-9]{2,4}(?=["'\s]|$)/gi);
        return { src: "emu", emu: m2, fichier: f ? f[f.length - 1] : "" };
      }
      return { src: "autre" };
    };
    const nomSource = (s) => s === "emu" ? T2("biblio.emulateurs") : s === "autre" ? T2("biblio.non_steam") : BOUTIQUES[s];
    const marque = (g) => g.emu ? g.emu[1] : nomSource(g.src);
    const picto = (g) => g.src === "emu" ? "manette" : "bibliotheque";
    const duree2 = (m2) => (m2 = Math.round(m2 || 0), !m2) ? T2("biblio.jamais") : m2 < 60 ? T2("biblio.min", { n: m2 }) : T2("biblio.heures", { h: Math.floor(m2 / 60), m: String(m2 % 60).padStart(2, "0") });
    const loc = () => window.__pcvLocale?.() || "fr-FR";
    const nb = (n) => T2(new Intl.PluralRules(loc()).select(n) === "one" ? "biblio.un_jeu" : "biblio.jeux", { n: n.toLocaleString(loc()) });
    const taille = (o) => o >= 1e9 ? T2("biblio.go", { n: (o / 1e9).toLocaleString(loc(), { maximumFractionDigits: 1 }) }) : T2("biblio.mo", { n: Math.max(1, Math.round(o / 1e6)) });
    const banc = (i) => {
      const r = i % 20;
      if (r < 11) {
        const m2 = EMULATEURS[[0, 0, 6, 9][i % 4]];
        return { src: "emu", emu: m2, fichier: `rom ${i + 1}.${["nsp", "nsp", "3ds", "nds"][i % 4]}`, img: false, inst: true };
      }
      if (r < 16) return { src: "epic", lanceur: "Unifideck", img: i % 3 > 0, inst: i % 4 === 0 };
      if (r < 19) return { src: "gog", lanceur: "Heroic", img: i % 2 > 0, inst: i % 3 === 0 };
      return { src: "autre", img: false, inst: true };
    };
    let tous = [], filtres = [], bases = [], manquants = [], enDetails = false, casse = false, parId = /* @__PURE__ */ new Map();
    const { lettreDe } = window.__pcvPresentation;
    const charger = () => {
      const J = window.__pcvJeux, coll2 = new Intl.Collator(loc(), { numeric: true, sensitivity: "base" });
      manquants = [];
      tous = [...J.apps().values()].map((a) => {
        const id = a.appid, nom = a.display_name || "", cle = (a.sort_as || nom).toLowerCase();
        let g = { src: "steam", emu: null, lanceur: "", fichier: "", img: !J.sansImage(a), inst: J.installe(a) };
        if (J.banc && id >= J.banc) g = { ...g, ...banc(id - J.banc) };
        else if (J.raccourci(a)) {
          const d = O.appDetailsStore?.GetAppDetails?.(id);
          if (!d) manquants.push(id);
          g = { ...g, ...sourceDe(d?.strShortcutExe || "", d?.strShortcutLaunchOptions || "") };
        }
        return {
          ...g,
          a,
          id,
          nom,
          cle,
          l: lettreDe(cle),
          min: a.minutes_playtime_forever || 0,
          der: a.rt_last_time_played || 0,
          taille: g.inst && +a.size_on_disk || 0,
          d: [-40, -20, 0, 20, 40][[...nom].reduce((h, c) => h + c.charCodeAt(0), 0) % 5]
        };
      }).sort((x, y) => coll2.compare(x.cle, y.cle));
      parId = new Map(tous.map((g) => [g.id, g]));
      const par = (test) => tous.filter(test);
      const cols = (O.collectionStore?.userCollections || []).filter((c) => !/^(local-install|uncategorized|type-|hidden)/.test(c.id)).map((c) => {
        const ids = new Set((c.allApps || []).map((a) => a.appid));
        return { cle: "c:" + c.id, nom: c.displayName, ic: "epingle", col: true, l: par((g) => ids.has(g.id)), garder: c.bIsEditable && !c.bIsDynamic };
      }).filter((f) => f.l.length || f.garder);
      const sources = SOURCES.map((s) => ({ cle: s, nom: nomSource(s), ic: picto({ src: s }), l: par((g) => g.src === s) })).filter((f) => f.l.length);
      filtres = [{ cle: "tous", nom: T2("biblio.tous"), ic: "bibliotheque", l: tous }, { cle: "installes", nom: T2("biblio.installes"), ic: "disque", l: par((g) => g.inst) }, ...sources, ...cols];
      const recents = par((g) => g.der).sort((x, y) => y.der - x.der);
      bases = [
        ...recents.length ? [{ cle: "recents", nom: T2("biblio.recents"), ic: "horloge", l: recents, vus: recents }] : [],
        ...[...sources, ...cols].map((f) => ({ ...f, vus: [...f.l].sort((x, y) => y.inst - x.inst || y.der - x.der) }))
      ];
    };
    const demanderDetails = async () => {
      if (enDetails || !manquants.length) return;
      enDetails = true;
      const l = [...manquants];
      await Promise.all(Array.from({ length: 6 }, async () => {
        while (l.length) {
          try {
            await O.appDetailsStore.RequestAppDetails(l.pop());
          } catch (x) {
          }
        }
      }));
      enDetails = false;
      if (!m.racine.hidden) {
        charger();
        remettre();
        m.rendre();
      }
    };
    const fond = (g) => window.__pcvFondRepli(g.d);
    const tuile = (g, c, attrs = "") => `<div class="cel ${g.img ? "jeu" : "app"}${g.inst ? "" : " absent"}" aria-label="${e(g.nom)}" ${attrs}>` + (g.img ? `<div class="im" data-p="${g.id}" data-c="${c}">` : `<div class="im${c > 60 ? " nomme" : ""}" style="--fond:${fond(g)}">${window.__pcvPresentation.repliTuile(g.nom, ico(picto(g)), c)}`) + (g.inst ? "" : `<i class="nuage">${ico("telechargements")}</i>`) + `</div></div>`;
    const peindreDans = (r, petite = false) => {
      for (const im of r.querySelectorAll(".im[data-p]")) {
        const g = parId.get(+im.dataset.p);
        if (g) window.__pcvJeux.peindre(im, g.a, +im.dataset.c, petite);
      }
    };
    window.__pcvTuilesAilleurs = (id) => m.racine.hidden ? [] : m.ombre.querySelectorAll(id == null ? ".im[data-appid], .pcv-anim-dessus, video.pcv-anim" : `.im[data-appid="${id}"]`);
    const proches = new IntersectionObserver((l) => {
      for (const x of l) if (x.isIntersecting) {
        proches.unobserve(x.target);
        const g = parId.get(+x.target.dataset.p);
        if (g && !m.racine.hidden && x.target.isConnected) window.__pcvJeux.peindre(x.target, g.a, +x.target.dataset.c);
      }
    }, { root: null, rootMargin: "100px" });
    let aPeindre = [], tPeindre = 0;
    const peindreAttente = () => {
      clearTimeout(tPeindre);
      tPeindre = setTimeout(() => {
        for (const el of aPeindre) if (el.isConnected) peindreDans(el);
        aPeindre = [];
      }, 180);
    };
    const peindre = (rangs) => {
      if (rangs) {
        for (const el of rangs) {
          peindreDans(el, m.vite);
          if (m.vite) {
            aPeindre = aPeindre.filter((r) => r.isConnected);
            aPeindre.push(el);
          }
        }
        if (m.vite) peindreAttente();
        return;
      }
      proches.disconnect();
      for (const im of m.ombre.querySelectorAll(".bloc-etageres .im[data-p]:not([data-appid]), .vue-page .im[data-p]:not([data-appid])")) proches.observe(im);
    };
    const motA = (g) => T2(!g ? "biblio.choisir" : g.inst ? "biblio.jouer" : "biblio.installer");
    const TRIS = [["nom", "biblio.tri_nom"], ["recent", "biblio.tri_recent"], ["temps", "biblio.tri_temps"]];
    let tri = "nom", seulInst = false, coll = null, menu = null;
    const plat = (t) => window.__pcvPlat(t);
    const filtrer = (l, sansColl = false) => {
      const q = plat(m.texte.trim());
      return l.filter((g) => (!q || (g.p ??= plat(g.nom)).includes(q)) && (!seulInst || g.inst) && (!coll || sansColl || coll.ids.has(g.id)));
    };
    const calculer = (f) => {
      let l = filtrer(f.l);
      if (tri === "recent") l = [...l].sort((x, y) => y.der - x.der);
      else if (tri === "temps") l = [...l].sort((x, y) => y.min - x.min);
      return l;
    };
    const ongletsDe = () => {
      const sans = !!coll?.col, l = [filtres[0], ...filtres.filter((f) => SOURCES.includes(f.cle)), ...filtres.filter((f) => f.col)].map((f) => ({ cle: f.cle, nom: f.nom, n: filtrer(f.l, sans).length }));
      return [{ cle: "+", menu: "nouvelle", nom: T2("biblio.col_nouvelle"), icone: ico("plus") }, ...(m.texte.trim() ? l.filter((o, i) => !i || o.n) : l).map((o) => ({ ...o, n: o.n.toLocaleString(loc()) }))];
    };
    const choisirOnglet = (k) => {
      const f = filtres.find((x) => x.cle === k);
      if (f?.col) coll = { ...f, ids: new Set(f.l.map((g) => g.id)) };
      else if (coll?.col) coll = null;
    };
    const triTexte = () => [T2(TRIS.find(([k]) => k === tri)[1]), seulInst ? T2("biblio.installes") : ""].filter(Boolean).join(", ");
    const ouvrirGrille = (f, porte = false) => {
      seulInst = false;
      tri = f.cle === "recents" ? "recent" : "nom";
      coll = f.col || f.cle === "recents" ? { ...f, ids: new Set(f.l.map((g) => g.id)) } : null;
      m.ouvrirGrille(SOURCES.includes(f.cle) || f.col ? f.cle : "tous", porte);
    };
    const refiltrer = () => {
      if (!ongletsDe().some((o) => o.cle === m.onglet)) m.onglet = "tous";
      m.rendreGrille();
    };
    const jouer = (g, el) => {
      if (!g) return;
      if (g.inst) window.__pcvJeux.jouer(g.a, el);
      else window.__pcvJeux.installer(g.a);
    };
    const loinDe = (g) => g && !g.inst ? window.__pcvBridge?.autresPC?.(g.id)?.[0] || null : null;
    const SUCCES = /* @__PURE__ */ new Map();
    const succesDe = (g, fait) => {
      if (g.src !== "steam" || g.emu || window.__pcvJeux.raccourci(g.a)) return null;
      if (SUCCES.has(g.id)) return SUCCES.get(g.id);
      SUCCES.set(g.id, null);
      window.__pcvBridge?.succes?.(g.id).then((l) => {
        SUCCES.set(g.id, l.length ? { n: l.filter((x) => x.bAchieved).length, t: l.length, l } : 0);
        fait();
      });
      return null;
    };
    const BOUTIQUE = /* @__PURE__ */ new Map();
    let attenteB = 0;
    const boutiqueDe = (g, fait) => {
      if (g.src !== "steam" || window.__pcvJeux.raccourci(g.a) || BOUTIQUE.has(g.id) || window.__pcvJeux.banc && g.id >= window.__pcvJeux.banc) return;
      clearTimeout(attenteB);
      attenteB = setTimeout(() => {
        if (m.fiche !== g || BOUTIQUE.has(g.id)) return;
        BOUTIQUE.set(g.id, null);
        O.DeckyBackend?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "fiche_boutique", g.id, loc().slice(0, 2)).then((r) => {
          BOUTIQUE.set(g.id, r || {});
          fait();
        }, () => BOUTIQUE.delete(g.id));
      }, 400);
    };
    const fondCSS = (l) => l.filter(Boolean).map((x) => `url('${String(x).replace(/["'()\\\s]/g, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))}')`).join(",");
    const fermerMenu = () => {
      if (!menu) return;
      menu = null;
      m.calque = null;
      m.$(".menus").innerHTML = "";
      window.__pcvVoile?.("tri", false);
      m.$(".puce-f .menu")?.remove();
      m.dessinerOnglets();
      m.legende();
    };
    const confirmer = (action, faire, ic = "reglages") => {
      if (!window.__pcvDossiers?.demander?.({
        ic,
        svg: ic === "suppr" ? "" : window.__pcvIcones.trace(ic),
        titre: T2("biblio.confirmer", { action }),
        texte: "",
        non: T2("biblio.annuler"),
        oui: action,
        ailleurs: true,
        ok: () => {
          faire();
          if (m.vue === "fiche") m.rendreFiche();
        }
      })) window.__pcvSon?.("bord");
    };
    const CS = () => O.collectionStore;
    const majCols = () => {
      charger();
      remettre();
      if (coll?.col) {
        const k = coll.cle, f = filtres.find((x) => x.cle === k);
        coll = f ? { ...f, ids: new Set(f.l.map((g) => g.id)) } : null;
        if (!f && m.onglet === k) {
          m.onglet = "tous";
          m.og = -1;
        }
      }
      m.rendre();
      if (m.vue === "grille") m.dessinerOnglets?.();
    };
    const nomLibre = (n, c = null) => !!n && !CS().BIsSystemCollectionName(n) && CS().GetUserCollectionsByName(n).every((x) => x === c);
    const nomCol = (o) => window.__pcvDossiers?.renommer?.(null, { max: 64, annuler: T2("biblio.annuler"), ailleurs: true, ...o });
    const nouvelleCol = (g = null) => nomCol({
      nom: "",
      titre: T2("biblio.col_nouvelle"),
      oui: T2("biblio.col_creer"),
      ok: (n) => {
        if (!nomLibre(n)) return false;
        CS().NewUnsavedCollection(n, void 0, g ? [g.a] : []).Save().finally(majCols);
        return true;
      }
    });
    const editables = () => (CS()?.userCollections || []).filter((c) => c.bIsEditable);
    const rangerDans = (g) => {
      const l = editables();
      if (!window.__pcvDossiers?.liste?.({
        ailleurs: true,
        svg: window.__pcvIcones.trace("epingle"),
        titre: T2("biblio.col_ajouter"),
        v: -1,
        choix: [T2("biblio.col_nouvelle_l"), ...l.map((c) => c.bIsDynamic ? T2("biblio.col_auto", { nom: c.displayName }) : c.displayName)],
        coches: l.flatMap((c, i) => c.apps.has(g.id) ? [i + 1] : []),
        grises: l.flatMap((c, i) => c.bIsDynamic ? [i + 1] : []),
        ok: (k) => {
          if (!k) return nouvelleCol(g);
          const c = l[k - 1];
          if (c.apps.has(g.id)) c.RemoveApps([g.a]);
          else c.AddApps([g.a]);
          majCols();
        }
      })) window.__pcvSon?.("bord");
    };
    const plusCol = (f) => {
      const c = f.col ? CS()?.GetCollection?.(f.cle.slice(2)) : null, tr = window.__pcvIcones.trace, k = COULEURS.ranger + ", " + COULEURS.ranger;
      window.__pcvDossiers?.choix?.(null, [
        { svg: tr("plus"), teinte: k, nom: T2("biblio.col_nouvelle"), faire: () => nouvelleCol() },
        c?.bIsEditable && { svg: tr("crayon"), teinte: k, nom: T2("biblio.col_renommer"), faire: () => nomCol({
          nom: c.displayName,
          titre: T2("biblio.col_renommer"),
          oui: T2("biblio.col_ok"),
          ok: (n) => {
            if (!nomLibre(n, c)) return false;
            c.displayName = n;
            c.Save().finally(majCols);
            return true;
          }
        }) },
        c?.bIsDeletable && { svg: tr("supprimer"), teinte: GRIS + ", " + GRIS, nom: T2("biblio.col_supprimer"), faire: () => window.__pcvDossiers.demander({
          ic: "suppr",
          titre: T2("biblio.col_supprimer_titre", { nom: c.displayName }),
          texte: T2("biblio.col_supprimer_texte"),
          non: T2("biblio.col_garder"),
          oui: T2("biblio.col_supprimer"),
          ailleurs: true,
          ok: () => c.Delete().finally(majCols)
        }) }
      ].filter(Boolean), { pres: m.courant(), sous: m.vue === "grille", ailleurs: true });
    };
    const menuRangee = (k) => k === "nouvelle" ? nouvelleCol() : ouvrirMenu();
    const ongletX = (k) => {
      const f = filtres.find((x) => x.cle === k && x.garder);
      return f ? [T2("biblio.collections"), () => plusCol(f)] : null;
    };
    const ouvrirMenu = () => {
      if (menu) return fermerMenu();
      const cols = filtres.filter((f) => f.col), ids = (f) => new Set(f.l.map((g) => g.id));
      const lignes = [
        ...TRIS.map(([k, c], i) => ({ sep: i ? "" : T2("biblio.trier"), nom: T2(c), coche: tri === k, val: () => {
          tri = k;
        } })),
        { sep: T2("biblio.afficher"), nom: T2("biblio.seul_installes"), n: T2(seulInst ? "biblio.oui" : "biblio.non"), val: () => {
          seulInst = !seulInst;
        } },
        ...cols.map((f, i) => ({ sep: i ? "" : T2("biblio.collections"), nom: f.nom, n: f.l.length.toLocaleString(loc()), coche: coll?.cle === f.cle, val: () => {
          coll = coll?.cle === f.cle ? null : { ...f, ids: ids(f) };
          m.onglet = coll ? f.cle : "tous";
        } })),
        { sep: cols.length ? "" : T2("biblio.collections"), nom: T2("biblio.col_nouvelle_l"), val: () => nouvelleCol() }
      ];
      menu = { lignes, st: 0, i: Math.max(0, lignes.findIndex((x) => x.coche)) };
      m.calque = {
        fermer: fermerMenu,
        legende: () => [[1, T2("biblio.choisir")], [2, T2("biblio.fermer")]],
        touche: (b) => {
          const n = menu.lignes.length;
          if (b === 9 || b === 10) {
            menu.i = (menu.i + (b === 10 ? 1 : -1) + n) % n;
            marquerMenu();
          } else if (b === 1) validerMenu(menu.i);
          else if (b === 2) fermerMenu();
          else window.__pcvSon?.("bord");
        }
      };
      m.dessinerOnglets();
      m.$(".menus").innerHTML = `<div class="voile"></div>`;
      window.__pcvVoile?.("tri", true);
      m.$(".puce-f").insertAdjacentHTML("beforeend", `<div class="menu pcv-fenetre">` + lignes.map((x, i) => (x.sep ? `<div class="sep">${e(x.sep)}</div>` : "") + `<div class="ligne${x.coche ? " coche" : ""}" data-m="${i}"><span class="n">${e(x.nom)}</span>${x.n != null ? `<small>${e(x.n)}</small>` : ""}</div>`).join("") + `</div>`);
      window.__pcvApparition(m.$(".puce-f .menu"));
      marquerMenu();
      m.legende();
    };
    const marquerMenu = () => {
      const l = m.$(".menu"), U = innerHeight / 800;
      l.querySelectorAll(".ligne").forEach((x, i) => x.classList.toggle("choisi", i === menu.i));
      const y = (10 + menu.i * 42 + 30 * menu.lignes.slice(0, menu.i + 1).filter((x) => x.sep).length) * U, haut = 540 * U;
      if (y < menu.st) l.scrollTop = menu.st = y;
      else if (y + 42 * U > menu.st + haut) l.scrollTop = menu.st = y + 42 * U - haut;
    };
    const validerMenu = (i) => {
      const v = menu.lignes[i].val;
      fermerMenu();
      v?.();
      m.rendreGrille();
    };
    const PB = () => window.__pcvBridge;
    let retourMenuSteam = false;
    const plusOptions = (g) => {
      if (PB().menuJeuSteam(g.id, m.$(".carrousel .cel.sel"))) retourMenuSteam = true;
      else window.__pcvSon?.("bord");
    };
    const romDe = (g) => !!g.emu || window.__pcvJeux.raccourci(g.a);
    const GRIS = "#8b94a3", COULEURS = {
      jouer: "var(--pcv-vert)",
      infos: "#1a9ae6",
      succes: "var(--pcv-orange)",
      manette: "#5b6676",
      proprietes: "#2a6fe0",
      emulateur: "#6d4fd6",
      ranger: "#14b8a6",
      masquer: GRIS,
      desinstaller: GRIS,
      retirer: GRIS
    };
    const rubriquesDe = (g) => {
      const rom = romDe(g);
      return [
        ["jouer", loinDe(g) ? "nuage" : g.inst ? "lecture" : "telechargements"],
        ...rom ? [] : [["infos", "info"]],
        // (un raccourci : Steam n'en sait rien)
        ...SUCCES.get(g.id) ? [["succes", "trophee"]] : [],
        ["manette", "manette"],
        rom ? ["emulateur", "disque"] : ["proprietes", "reglages"],
        ["ranger", "epingle"],
        ["masquer", "masquer"],
        ...rom ? [["retirer", "supprimer"]] : g.inst ? [["desinstaller", "supprimer"]] : []
      ];
    };
    const NOMS = {
      infos: "biblio.r_infos",
      succes: "biblio.r_succes",
      manette: "biblio.r_manette",
      proprietes: "biblio.r_proprietes",
      emulateur: "biblio.r_emulateur",
      ranger: "biblio.r_ranger",
      masquer: "biblio.r_masquer",
      desinstaller: "biblio.r_desinstaller",
      retirer: "biblio.r_retirer"
    };
    const motJouer = (g) => loinDe(g) ? T2("biblio.streaming") : motA(g);
    const faireJouer = () => {
      const g = m.fiche, loin = loinDe(g);
      if (loin) PB().diffuser(g.id, loin.clientid);
      else jouer(g, m.$(".carrousel .cel.sel"));
    };
    const rubrique = () => rubriquesDe(m.fiche)[m.rubrique]?.[0] || "jouer";
    const rg = (ic, t, s, droite = "", f = null) => `<${f ? `button class="rg verre act" data-a="${m.action(f)}"` : `div class="rg verre"`} style="--k:${COULEURS[rubrique()]}"><span class="pastille">${ico(ic)}</span><div class="t"><b>${e(t)}</b>${s ? `<small>${e(s)}</small>` : ""}</div>${droite}</${f ? "button" : "div"}>`;
    const val = (t, cl = "") => `<span class="val ${cl}">${e(t)}</span>`;
    const inter = (oui) => `<span class="inter${oui ? "" : " non"}"></span>`;
    const date2 = (rt, o) => new Date(rt * 1e3).toLocaleDateString(loc(), o);
    const CONTENUS = {
      // la bannière (une capture du jeu, sinon son décor), le Mii et le temps de jeu, le gros A ; dessous les captures, ou
      // pour un jeu installé sur un autre PC seulement, l'installation ici
      jouer: (g) => {
        const b = BOUTIQUE.get(g.id) || {}, caps = b.captures || [], loin = loinDe(g);
        return `<div class="banniere" style="background-image:${fondCSS([b.banniere, ...window.__pcvJeux.hero(g.a)])}"></div><div class="sous-b"><div class="bulle-r"><img class="mii-r" src="${e(window.__pcvImageMoi?.() || "")}" alt=""><span><b>${e(duree2(g.min))}</b>${g.der ? `<small>${e(T2("biblio.der_le", { date: date2(g.der) }))}</small>` : ""}</span></div><button class="gros-r" data-jouer>${e(motJouer(g))}</button></div>` + (loin ? rg("telechargements", T2("biblio.installer_ici"), T2("biblio.sur_pc", { pc: loin.nom }), val(T2("biblio.installer")), () => window.__pcvJeux.installer(g.a)) : caps.length > 1 ? `<div class="tete-r">${e(T2("biblio.captures"))}<small>${e(T2("biblio.captures_s"))}</small></div><div class="caps">${caps.slice(1, 4).map((c) => `<img src="${e(c)}" alt="">`).join("")}</div>` : "");
      },
      // l'image du jeu en fond, le résumé et les pastilles dans un verre
      infos: (g) => {
        const inf = PB().infosJeu(g.id), b = BOUTIQUE.get(g.id) || {}, sortie = g.a.rt_original_release_date;
        if (!inf.pret) setTimeout(() => {
          if (m.fiche === g && rubrique() === "infos") m.rendreFiche();
        }, 900);
        const puces = [
          ["info", inf.dev[0]],
          ["tag", inf.editeur[0]],
          ["calendrier", sortie && T2("biblio.sorti_le", { date: date2(sortie, { day: "numeric", month: "short", year: "numeric" }) })],
          ...(b.genres || []).map((x) => ["bibliotheque", x]),
          ["monde", b.langues && T2("biblio.langues", { n: b.langues })],
          ["manette", b.manette && T2(b.manette === "full" ? "biblio.manette_complete" : "biblio.manette_partielle")]
        ].filter((x) => x[1]);
        return `<div class="fond-r" style="background-image:${fondCSS([(b.captures || [])[2] || b.banniere, ...window.__pcvJeux.hero(g.a)])}"></div><div class="verre-r">` + (inf.resume ? `<p class="resume">${e(inf.resume)}</p>` : "") + `<div class="puces-r">${puces.map(([i, t]) => `<span class="puce-r">${ico(i)}${e(t)}</span>`).join("")}</div></div>`;
      },
      // l'anneau de progression, les badges en tuiles (les obtenus, du plus récent au plus ancien, puis les cadenas), le dernier obtenu
      succes: (g) => {
        const s = SUCCES.get(g.id);
        if (!s) return "";
        const obtenus = s.l.filter((x) => x.bAchieved).sort((x, y) => y.rtUnlocked - x.rtUnlocked), der = obtenus[0];
        const badges = [...obtenus.map((x) => `<span class="bad"><img src="${e(x.strImage)}" alt=""></span>`), ...Array(s.t - s.n).fill(`<span class="bad clos">${ico("cadenas")}</span>`)].slice(0, 15);
        return `<div class="d2-succes"><div class="anneau-r" style="--p:${(s.n / s.t * 100).toFixed(1)}"><span><b>${s.n}</b><small>${e(T2("biblio.sur_t", { t: s.t }))}</small></span></div><div class="tuiles-s">${badges.join("")}</div></div>` + (der ? `<div class="succes-r verre"><img src="${e(der.strImage)}" alt=""><span><small>${e(T2("biblio.dernier_succes"))}</small><b>${e(der.strName)}</b><i>${e(der.strDescription)}</i></span></div>` : "");
      },
      manette: (g) => rg("manette", T2("biblio.manette_b"), T2("biblio.manette_t"), val(T2("biblio.ouvrir")), () => PB().controllerConfig(g.id)),
      proprietes: (g) => {
        const c = PB().commande(g.id);
        return rg("clavier", T2("biblio.options_l"), T2("biblio.options_s"), val(c.lancement || T2("biblio.aucune"), "code")) + (g.inst ? rg("bouclier", T2("biblio.verifier"), T2("biblio.verifier_s"), val(T2("biblio.verifier_b")), () => confirmer(T2("biblio.verifier"), () => PB().verifier(g.id))) : "") + rg("boutique", T2("biblio.boutique"), "", val(T2("biblio.ouvrir")), () => PB().pageBoutique(g.id)) + rg("reglages", T2("jeu.plus_options"), "", val(T2("biblio.ouvrir")), () => plusOptions(g)) + rg("reglages", T2("biblio.proprietes_steam"), T2("biblio.proprietes_s"), val(T2("biblio.ouvrir")), () => PB().proprietesSteam(g.id));
      },
      emulateur: (g) => {
        const c = PB().commande(g.id);
        return (g.emu ? rg("manette", T2("biblio.emulateur_t"), g.emu[2] || "", val(g.emu[1])) : "") + (g.fichier ? rg("disque", T2("biblio.fichier"), g.fichier) : "") + (c.exe ? rg("prise", T2("biblio.commande"), "", val(c.exe, "code")) : "") + rg("clavier", T2("biblio.options_l"), T2("biblio.options_r"), val(c.options || T2("biblio.aucune"), "code")) + rg("reglages", T2("jeu.plus_options"), "", val(T2("biblio.ouvrir")), () => plusOptions(g)) + rg("reglages", T2("biblio.proprietes_steam"), T2("biblio.proprietes_r"), val(T2("biblio.ouvrir")), () => PB().proprietesSteam(g.id));
      },
      ranger: (g) => {
        const acc = !!window.__pcvJeux.surAccueil?.(g.id), fav = PB().estFavori(g.id);
        return rg("accueil", T2("biblio.sur_accueil"), "", inter(acc), () => {
          window.__pcvJeux.mettreAccueil?.(g.id, !acc);
          m.rendreFiche();
        }) + rg("epingle", T2("biblio.favoris"), "", inter(fav), () => confirmer(T2("biblio.favoris") + " : " + T2(fav ? "biblio.non" : "biblio.oui"), () => PB().favori(g.id, !fav))) + rg("bibliotheque", T2("biblio.col_ajouter"), editables().filter((c) => c.apps.has(g.id)).map((c) => c.displayName).join(", ") || T2("biblio.aucune"), val(T2("biblio.choisir")), () => rangerDans(g));
      },
      masquer: (g) => {
        const m2 = PB().estMasque(g.id);
        return rg("masquer", T2("biblio.masquer_t"), T2("biblio.masquer_s"), inter(m2), () => confirmer(T2(m2 ? "biblio.demasquer" : "biblio.masquer_t"), () => PB().masquer(g.id, !m2)));
      },
      desinstaller: (g) => rg("supprimer", T2("biblio.desinstaller_t"), g.taille ? taille(g.taille) : "", val(T2("biblio.r_desinstaller")), () => confirmer(T2("biblio.r_desinstaller"), () => PB().desinstaller(g.id), "suppr")),
      retirer: (g) => rg("supprimer", T2("biblio.retirer_t"), "", val(T2("biblio.retirer_b")), () => confirmer(T2("biblio.r_retirer"), () => PB().retirerRaccourci(g.id), "suppr"))
    };
    const RICHES = /* @__PURE__ */ new Set(["jouer", "infos", "succes"]);
    const origineDe = () => {
      const r = m.retour || {};
      return r.origine === "accueil" ? T2("spaces.accueil.nom") : r.origine === "place" ? T2("spaces.place.nom") : r.origine === "telechargements" ? T2("barre.telechargements") : r.vue === "etageres" ? T2("biblio.etagere_de", { nom: r.etagere || "" }) : coll?.nom || (r.onglet === "tous" || !r.onglet ? T2("biblio.toute") : filtres.find((f) => f.cle === r.onglet)?.nom || T2("biblio.toute"));
    };
    const ouvrirPage = (g, l, depuis = null) => m.ouvrirFiche(g, l, depuis);
    const quitterPage = () => {
      retourMenuSteam = false;
      const r = m.retour?.origine;
      if (!["accueil", "place", "telechargements"].includes(r)) return false;
      m.vue = "etageres";
      m.fiche = null;
      m.$(".vue-page").hidden = m.$(".page").hidden = true;
      if (r === "telechargements") {
        window.__pcvBridge?.revenirA?.("/library/downloads");
        return true;
      }
      if (r === "place") {
        const t0 = Date.now(), k = setInterval(() => {
          const ici = /^\/routes\/library\/home/.test(O.location.pathname);
          if (ici || Date.now() - t0 > 3e3) {
            clearInterval(k);
            if (ici) window.__pcvPlaceMontrer?.(true);
          }
        }, 50);
      }
      O.__pcvAller?.(1);
      return true;
    };
    const jeuIci = () => {
      const g = m.courant()?.dataset?.g;
      return g ? parId.get(+g.split(":").pop()) : null;
    };
    const m = window.__pcvBiblioMagasin = P.magasin({
      id: "pcv-biblio-d",
      nom: "biblio",
      z: 8600,
      sansTexte: true,
      cle: (g) => g.id,
      tuile,
      peindre,
      // la porte « Toute la bibliothèque » : les trois derniers jeux joués (avec une image), en éventail comme la maquette
      porte: () => ({ liste: [...tous].filter((g) => g.img).sort((x, y) => y.der - x.der), titre: T2("biblio.toute"), nombre: nb(tous.length), ouvrir: () => ouvrirGrille(filtres[0], true) }),
      etageres: () => bases.map((f) => ({
        cle: f.cle,
        titre: f.nom,
        icone: f.ic,
        nombre: f.cle === "recents" ? "" : nb(f.l.length),
        items: f.vus,
        toutNombre: f.l.length.toLocaleString(loc()),
        ouvrir: (g, _l, _i, el) => jouer(g, el),
        page: (g, l) => ouvrirPage(g, l, { etagere: f.nom }),
        tout: () => ouvrirGrille(f),
        toutPage: () => plusCol(f),
        toujours: f.col,
        vide: `<div class="message">${e(T2("biblio.col_vide"))}</div>`
      })),
      grille: {
        onglets: ongletsDe,
        liste: () => calculer(filtres.find((f) => f.cle === m.onglet) || filtres[0]),
        cle: () => [tri, seulInst, coll?.cle].join("|"),
        nom: (g) => g ? `${e(g.nom)}<small>${e(duree2(g.min))}</small>` : "",
        message: () => T2("biblio.aucun"),
        nomOnglets: () => T2("biblio.source"),
        // (25/10, l'auteur) le rail reste affiché quel que soit le tri ; une lettre repasse la grille en tri par nom, le jeu choisi gardé
        rail: {
          visible: () => !m.texte.trim(),
          preparer: () => {
            if (tri === "nom") return;
            tri = "nom";
            m.rendreGrille();
          },
          rang: (n, t) => e(T2("biblio.rang", { n: n.toLocaleString(loc()), t: t.toLocaleString(loc()) }))
        },
        puce: () => `<button class="puce-f verre${menu ? " ouvert" : ""}" data-menu="trier">${e(T2("biblio.tri"))} <small>${e(triTexte())}</small><span class="chevron">${ico("fleche")}</span></button>`,
        menu: menuRangee,
        choisir: choisirOnglet,
        ongletX,
        ouvrir: (g, _i, el) => jouer(g, el),
        page: (g) => ouvrirPage(g, m.lignes),
        effacer: () => {
          if (!m.texte.trim()) return false;
          m.texte = "";
          refiltrer();
          return true;
        }
      },
      // (B : d'abord la recherche, puis les étagères)
      fiche: {
        rubriques: (g) => rubriquesDe(g).map(([k, ic]) => [k, ic, k === "jouer" ? motJouer(g) : T2(NOMS[k]), COULEURS[k]]),
        contenu: (g, k) => CONTENUS[k || "jouer"](g),
        classe: (k) => RICHES.has(k) ? "riche" : "",
        touche: (b) => {
          if (b !== 3) return false;
          plusOptions(m.fiche);
          return true;
        },
        agir: () => faireJouer(),
        quitter: quitterPage,
        voisins: () => T2("biblio.prec_suiv"),
        page: (g, n, t) => {
          const r = m.retour?.origine;
          return `${ico(r === "telechargements" ? "telechargements" : r === "accueil" || r === "place" ? "accueil" : g.emu ? "manette" : "bibliotheque")}${e(origineDe())}<small>${e(T2("biblio.rang", { n: n.toLocaleString(loc()), t: t.toLocaleString(loc()) }))}</small>`;
        },
        ouverte: (g) => {
          succesDe(g, () => {
            if (m.fiche === g) m.rendreFiche();
          });
          boutiqueDe(g, () => {
            if (m.fiche === g && ["jouer", "infos"].includes(rubrique())) m.rendreFiche();
          });
        }
      },
      // A dit ce qu'il fera : Jouer, Installer (pas installé ici), Ouvrir (la porte), Tout voir ; X la page du jeu (Options)
      libelles: (m2) => {
        if (m2.vue === "fiche") return { a: !m2.dedans && m2.rubrique === 0 ? motJouer(m2.fiche) : T2("biblio.choisir"), x: T2("jeu.plus_options") };
        const g = m2.vue === "grille" ? m2.lignes[m2.sel] : jeuIci();
        if (g) return { a: motA(g), x: T2("biblio.options") };
        return { a: m2.vue === "grille" ? motA({ inst: true }) : T2(m2.courant() === m2.porte ? "biblio.ouvrir" : "biblio.tout_voir"), x: m2.courant()?.dataset?.g?.startsWith("tout-") ? T2("biblio.options") : "" };
      },
      // la recherche : la loupe de la barre du haut (barre-haut.js, le registre __pcvLoupes), la même qu'ailleurs ; ce
      // qu'on y tape filtre la grille au fil de la frappe (depuis les étagères : Tous) ; champ vide = tout
      loupe: () => window.__pcvEcran?.ouvert?.() ? null : { texte: m.texte, invite: T2("biblio.chercher_invite"), chercher: (t) => {
        m.texte = t;
        if (m.vue !== "grille") return ouvrirGrille(filtres[0]);
        refiltrer();
      } },
      clic: (x) => {
        const t = x.target;
        if (menu) {
          const l = t.closest?.("[data-m]");
          if (l) validerMenu(+l.dataset.m);
          else if (t.closest?.(".voile, [data-menu]")) fermerMenu();
          return !!(l || t.closest?.(".voile, [data-menu]"));
        }
        if (t.closest?.(".gros-r[data-jouer]")) {
          faireJouer();
          return true;
        }
        return false;
      },
      ferme: () => {
        fermerMenu();
        proches.disconnect();
      }
    });
    const { racine: racine2 } = m;
    if (window.__pcvBiblioStart) window.removeEventListener("vgp_onbuttondown", window.__pcvBiblioStart, true);
    const remettre = () => {
      if (!m.fiche) return;
      m.fiche = parId.get(m.fiche.id) || m.fiche;
      m.voisins = m.voisins.map((g) => parId.get(g.id)).filter(Boolean);
      if (!m.voisins.length) m.voisins = [m.fiche];
    };
    const montrer = (garder) => {
      try {
        charger();
        remettre();
        if (!garder) {
          m.vue = "etageres";
          m.sel = 1;
          m.texte = "";
          m.fiche = null;
          m.$(".etageres").scrollTop = 0;
        }
        const g = attente && Date.now() - attente.t < 3e3 ? parId.get(attente.id) : null, l = g ? attente.ids.map((i) => parId.get(i)).filter(Boolean) : [], depuis = attente?.retour;
        attente = null;
        m.montrer(false);
        if (g) ouvrirPage(g, l.includes(g) ? l : [g], { vue: "etageres", origine: depuis });
        demanderDetails();
      } catch (x) {
        console.error("biblioth\xE8que SteamU : repli sur celle de Steam", x);
        casse = true;
        racine2.hidden = true;
      }
    };
    let attente = null;
    window.__pcvPageJeu = (id, ids, retour = "accueil") => {
      let ancienne = false;
      try {
        ancienne = String(localStorage.getItem("pcv-interface")).includes("ancienne");
      } catch (x) {
      }
      if (casse || ancienne || !O.__pcvAller) return false;
      attente = { id: +id, ids: ids || [+id], t: Date.now(), retour };
      O.__pcvAller(2);
      return true;
    };
    let route = "";
    const suivi = () => {
      const p = O.location.pathname;
      let ancienne = false;
      try {
        ancienne = String(localStorage.getItem("pcv-interface")).includes("ancienne");
      } catch (x) {
      }
      const voir = !casse && ROUTE.test(p) && !ancienne && !window.__pcvJeuDevant && !!window.__pcvJeux && !window.__pcvEcran?.ouvert?.();
      if (voir === racine2.hidden) {
        if (voir) {
          montrer(retourMenuSteam || route === p || /^\/routes\/(library\/app|apprunning)/.test(route));
          retourMenuSteam = false;
        } else m.cacher();
      }
      route = p;
    };
    window.__pcvBiblioDSuivi = setInterval(suivi, 200);
    O.navigation?.removeEventListener("currententrychange", O.__pcvBiblioDNav);
    O.navigation?.addEventListener("currententrychange", O.__pcvBiblioDNav = () => setTimeout(suivi, 0));
  }
  return "biblioth\xE8que pr\xEAte";
})();
