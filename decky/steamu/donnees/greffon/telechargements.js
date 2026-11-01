(() => {
  window.__pcvTelechArreter?.();
  document.getElementById("pcv-telech")?.remove();
  document.getElementById("pcv-telech-decor")?.remove();
  document.body.classList.remove("pcv-telech-fen");
  try {
    window.__pcvTelechAbo?.unregister();
  } catch (x) {
  }
  const O = window.opener, B = window.__pcvBridge, I = window.__pcvIcones, ico = (n) => I.svg(n), u = (n) => `calc(var(--u) * ${n})`;
  const T = (k, v) => window.__pcvT ? window.__pcvT(k, v) : k;
  const e = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ROUTE = /^\/routes\/library\/downloads/;
  const TUILES = { grand: [196, 30], rang: [120, 22], fen: [170, 20], mini: [70, 16] };
  const fausse = () => {
    const cbs = /* @__PURE__ */ new Set();
    let f = null;
    const prendre = () => {
      if (f) return f;
      const J = window.__pcvJeux;
      if (!J) return { cours: null, suivants: [], termines: [] };
      const vus = [...document.querySelectorAll("#pcv-console .cel.jeu > .im")].map((im) => im.__pcvJeu?.appid).filter(Boolean);
      const ids = [.../* @__PURE__ */ new Set([...vus, ...[...J.apps().values()].filter((a) => !J.raccourci(a)).map((a) => a.appid)])];
      return f = {
        cours: ids[0] ? { appid: ids[0], pct: 58, reste: 1560, pause: false, maj: true, fait: 264e8, total: 456e8, vitesse: 123e5 } : null,
        suivants: [
          ...ids.slice(1, 5).map((appid, i2) => ({ appid, etat: i2 === 3 ? "prevu" : "file", maj: i2 % 2 === 0, ...i2 === 3 ? { quand: Math.ceil(Date.now() / 36e5 + 3) * 3600 } : {} })),
          { appid: 1391110, etat: "file", maj: true }
        ],
        // (un outil de Steam, sans jaquette : Steam Linux Runtime 2.0)
        termines: ids.slice(5, 8)
      };
    };
    const dire = () => cbs.forEach((cb) => cb());
    const suivant = (x) => {
      const n = x.suivants.findIndex((y) => y.etat === "file");
      if (n < 0) return null;
      const [s] = x.suivants.splice(n, 1);
      return { appid: s.appid, pct: 0, reste: -1, pause: false, maj: s.maj, fait: 0, total: 82e8, vitesse: 0 };
    };
    return {
      file: () => structuredClone(prendre()),
      abonner: (cb) => {
        cbs.add(cb);
        cb();
        return { unregister: () => cbs.delete(cb) };
      },
      pause: (oui) => {
        const c = prendre().cours;
        if (c) {
          c.pause = oui;
          c.vitesse = oui ? 0 : 123e5;
        }
        dire();
      },
      premier: (appid) => {
        const x = prendre(), s = x.suivants.find((y) => y.appid === appid);
        if (!s) return;
        x.suivants = x.suivants.filter((y) => y !== s);
        if (x.cours) x.suivants.unshift({ appid: x.cours.appid, etat: "file", maj: x.cours.maj });
        x.cours = { appid, pct: 0, reste: -1, pause: false, maj: s.maj, fait: 0, total: 82e8, vitesse: 0 };
        dire();
      },
      retirer: (appid) => {
        const x = prendre();
        if (x.cours?.appid === appid) x.cours = suivant(x);
        else x.suivants = x.suivants.filter((y) => y.appid !== appid);
        dire();
      }
    };
  };
  let F = { cours: null, suivants: [], termines: [] }, cle = "";
  const etatDe = (appid) => F.cours?.appid === appid ? F.cours : F.suivants.find((x) => x.appid === appid) || null;
  const appDe = (id) => window.__pcvJeux?.apps().get(id) || B.appOverview(id);
  const duree = (s) => {
    const m = Math.max(1, Math.round(s / 60));
    return m < 60 ? T("telech.min", { n: m }) : T("telech.heures", { h: Math.floor(m / 60), m: String(m % 60).padStart(2, "0") });
  };
  const resteDe = (c) => c.pause ? T("telech.en_pause") : c.reste > 0 ? T("telech.reste", { temps: duree(c.reste) }) : T("telech.en_cours");
  const loc = () => window.__pcvLocale?.() || "fr-FR";
  const taille = (o) => o >= 1e9 ? T("biblio.go", { n: (o / 1e9).toLocaleString(loc(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }) : T("biblio.mo", { n: Math.max(1, Math.round(o / 1e6)).toLocaleString(loc()) });
  const chiffresDe = (c) => {
    const p = T("telech.pct", { n: Math.round(c.pct) });
    return c.total > 0 ? T("telech.quantite", { pct: p, fait: taille(c.fait), total: taille(c.total) }) : p;
  };
  const vitesseDe = (c) => c.pause || !(c.vitesse > 0) ? "" : T("telech.vitesse", { n: (c.vitesse / 1e6).toLocaleString(loc(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) });
  const prevuDe = (x) => x.quand > 0 ? T("telech.prevu_a", { h: new Date(x.quand * 1e3).toLocaleTimeString(loc(), { hour: "numeric", ...new Date(x.quand * 1e3).getMinutes() ? { minute: "2-digit" } : {} }) }) : T("telech.prevue");
  const avancement = (c) => `<div class="avance"><span class="bulle verre"><span class="pastille">${ico(c.pause ? "pause" : "horloge")}</span><span class="reste">${e(resteDe(c))}</span></span><span class="qte">${e(chiffresDe(c))}</span><span class="puce gris vit"${vitesseDe(c) ? "" : " hidden"}><i>${ico("telechargements")}</i><span>${e(vitesseDe(c))}</span></span></div>`;
  const decor = (appid) => {
    const x = etatDe(appid);
    if (!x) return "";
    if (x === F.cours) return `<i class="pcv-dl${x.pause ? " pause" : ""}" style="--pct:${Math.round(x.pct)}%"><b><i></i></b></i>`;
    return `<i class="pcv-dl-coin">${ico(x.etat === "prevu" ? "calendrier" : x.etat === "pause" ? "pause" : "horloge")}</i>`;
  };
  const DECOR = (p) => `${p} .cel .im > .pcv-dl { position: absolute; inset: 0; z-index: 1; border-radius: inherit; background: rgb(0 0 0 / .32); pointer-events: none; }
    ${p} .cel .im > .pcv-dl > b { position: absolute; left: 12%; right: 12%; bottom: 11%; height: 7.5%; min-height: 5px; border-radius: 99px; overflow: hidden;
      background: rgb(255 255 255 / .85); box-shadow: 0 0 0 2px var(--pcv-lisere), 0 2px 6px rgb(0 0 0 / .35); }
    ${p} .cel .im > .pcv-dl > b > i { position: absolute; left: 0; top: 0; bottom: 0; width: var(--pct); border-radius: inherit; background: var(--pcv-cyan); box-shadow: inset 0 2px 0 rgb(255 255 255 / .35); }
    ${p} .cel .im > .pcv-dl.pause > b > i { background: var(--pcv-touche-neutre); }
    ${p} .cel .im > .pcv-dl-coin { position: absolute; right: 7%; bottom: 6%; z-index: 2; width: 26%; aspect-ratio: 1; color: #fff; filter: drop-shadow(0 1px 2px rgb(0 0 0 / .6)); pointer-events: none; }
    ${p} .cel .im > :is(.pcv-dl, .pcv-dl-coin) ~ .nuage { display: none; }   
    ${p} .cel .im > .pcv-dl-coin svg { display: block; width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }`;
  document.head.insertAdjacentHTML("beforeend", `<style id="pcv-telech-decor">${DECOR("#pcv-console")}
    body.pcv-telech-fen #pcv-console :is(.bas, .zoom) { visibility: hidden; }</style>`);
  const tuiles = () => {
    const g = document.querySelector("#pcv-console .grille");
    if (!g) return;
    for (const x of g.querySelectorAll(".im > :is(.pcv-dl, .pcv-dl-coin)")) x.remove();
    if (F.cours || F.suivants.length) for (const im of g.querySelectorAll(".cel.jeu > .im")) {
      const d = decor(im.__pcvJeu?.appid);
      if (d) im.insertAdjacentHTML("afterbegin", d);
    }
  };
  const racine = document.createElement("div");
  racine.id = "pcv-telech";
  racine.hidden = true;
  const ombre = racine.attachShadow({ mode: "open" });
  ombre.innerHTML = `<style class="emprunt"></style><style>
    :host { position: fixed; inset: 0; z-index: 8550; font-family: var(--pcv-police); color: var(--pcv-texte); overflow: hidden; }
    
    :host(.fen-ouverte) { z-index: 9100; }   
    
    #pcv-telech-fond { position: absolute; inset: 0; background: var(--pcv-fond-page); }
    #pcv-telech-fond:has(+ .page[hidden]) { display: none; }
    .page { position: absolute; inset: 0; z-index: 0; }
    [hidden] { display: none !important; }
    * { box-sizing: border-box; }
    button { all: unset; box-sizing: border-box; cursor: pointer; }
    svg[data-ico] { width: 1em; height: 1em; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; flex: none; }
    .verre { background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    .pastille { flex: none; border-radius: 50%; background: var(--pcv-pastille); box-shadow: var(--pcv-pastille-ombre); display: flex; align-items: center; justify-content: center; color: var(--pcv-cyan-plein); }
    .cel { width: calc(var(--u) * var(--c)); height: calc(var(--u) * var(--c)); flex: none; }
    ${DECOR("")}
    .legende-bas { position: absolute; right: ${u(28)}; bottom: ${u(16)}; left: ${u(28)}; }
    .titre { position: absolute; left: ${u(28)}; bottom: ${u(16)}; }
    .titre small { margin-left: ${u(8)}; color: var(--pcv-texte2); }
    .titre svg { font-size: ${u(22)}; color: var(--pcv-cyan-plein); }
    .etageres { position: absolute; left: ${u(40)}; right: 0; top: ${u(92)}; display: flex; flex-direction: column; gap: ${u(20)}; }
    h3 { margin: 0 0 ${u(10)}; height: ${u(34)}; display: flex; align-items: center; gap: ${u(10)}; font-size: ${u(19)}; font-weight: 900; white-space: nowrap; }
    h3 .pastille { width: ${u(34)}; height: ${u(34)}; font-size: ${u(18)}; }
    h3 > small { font-size: ${u(15)}; font-weight: 800; color: var(--pcv-texte2); }
    h3 .nom { margin-left: ${u(6)}; padding: ${u(5)} ${u(14)}; border-radius: ${u(14)}; background: var(--pcv-bulle); color: var(--pcv-sur-accent); font-size: ${u(15)}; font-weight: 900; }
    .rang { display: flex; gap: calc(var(--u) * var(--g)); transition: transform .25s ease-out; touch-action: pan-y; }   
    .courant { display: flex; align-items: center; gap: ${u(34)}; }
    .infos { display: flex; flex-direction: column; align-items: flex-start; gap: ${u(16)}; min-width: 0; }
    h2 { margin: 0; font-size: ${u(30)}; font-weight: 900; max-width: ${u(820)}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ligne { display: flex; gap: ${u(14)}; align-items: center; margin-top: ${u(6)}; }
    .bulle { position: relative; display: inline-flex; align-items: center; gap: ${u(10)}; padding: ${u(9)} ${u(18)} ${u(9)} ${u(9)}; border-radius: ${u(24)}; font-size: ${u(19)}; font-weight: 900; white-space: nowrap; }
    .bulle::after { content: ""; position: absolute; top: ${u(-7)}; left: ${u(30)}; width: ${u(16)}; height: ${u(16)}; background: var(--pcv-carte); transform: rotate(45deg); border-radius: 3px; }
    .bulle .pastille { position: relative; z-index: 1; width: ${u(36)}; height: ${u(36)}; font-size: ${u(19)}; }
    .bulle span { position: relative; z-index: 1; }
    .avance { display: flex; flex-wrap: wrap; align-items: center; gap: ${u(10)} ${u(16)}; }
    .qte { font-size: ${u(19)}; font-weight: 900; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .vit { font-variant-numeric: tabular-nums; }
    .puce { height: ${u(38)}; border-radius: ${u(19)}; padding: 0 ${u(16)} 0 ${u(5)}; display: inline-flex; align-items: center; gap: ${u(9)}; font-size: ${u(15)}; font-weight: 900; white-space: nowrap;
      background: var(--pcv-pastille); box-shadow: var(--pcv-pastille-ombre); }
    .puce i { width: ${u(28)}; height: ${u(28)}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${u(15)}; color: var(--pcv-sur-accent); background: var(--pcv-cyan-plein); flex: none; }
    .puce.gris i { background: var(--pcv-touche-neutre); }
    
    .pcv-pe { position: relative; width: auto; height: auto; overflow: visible; contain: none; z-index: auto; display: flex; gap: 20px; align-items: center; }
    .pcv-pe .bouton, .pcv-pe .bouton.reprendre { flex: none; }   
    .pcv-pe .bouton.reprendre svg[data-ico="pause"] { stroke-width: 3; }   
    
    .cel.app .im.nomme > .pcv-dl-coin { bottom: auto; top: 6%; }
    .cel.app .im.nomme > .pcv-dl-coin svg { width: 100%; height: 100%; }
    :host-context(body.pcv-barre-main) .pcv-pe .bouton.f { box-shadow: var(--reflet), var(--ombre); }
    :host-context(body.pcv-barre-main) .pcv-pe .bouton.reprendre.f { box-shadow: var(--pcv-bombe), var(--curseur-ombre); }
    .vide { display: flex; align-items: center; gap: ${u(24)}; height: ${u(214)}; padding-left: ${u(4)}; }
    .vide > .pastille { width: ${u(110)}; height: ${u(110)}; font-size: ${u(52)}; }
    .vide h2 { margin: 0 0 ${u(8)}; font-size: ${u(28)}; }
    .vide p { margin: 0 0 ${u(18)}; font-size: ${u(17)}; font-weight: 800; color: var(--pcv-texte2); }
    .voile { position: absolute; inset: 0; background: var(--pcv-voile-fenetre); }
    .fen { position: absolute; left: 50%; top: 0; bottom: 0; height: fit-content; margin: auto 0; transform: translateX(-50%);    width: ${u(760)}; border-radius: ${u(32)}; padding: ${u(30)} ${u(34)} ${u(28)};
      background: var(--pcv-fenetre-fond); box-shadow: var(--pcv-reflet), 0 ${u(22)} ${u(50)} rgb(0 0 0 / .35); }
    .fen .haut-f { display: flex; gap: ${u(30)}; align-items: center; }
    .fen h2 { font-size: ${u(28)}; max-width: ${u(480)}; }
    .fen .infos { gap: ${u(14)}; flex: 1; }
    .fen .boutons { margin-top: ${u(26)}; justify-content: center; }
    .fen .suite { margin-top: ${u(26)}; padding-top: ${u(18)}; border-top: 2px solid var(--pcv-filet); }
  </style><div id="pcv-telech-fond"></div><div class="page" hidden></div><div class="couche-fen" hidden></div>`;
  document.body.appendChild(racine);
  const $ = (s) => ombre.querySelector(s), pageEl = $(".page"), fenEl = $(".couche-fen");
  let U = innerHeight / 800, CS = {};
  const emprunter = () => {
    const em = $(".emprunt");
    if (em.textContent) return;
    const theme = [...document.styleSheets].flatMap((f) => {
      try {
        return [...f.cssRules];
      } catch (x) {
        return [];
      }
    }).filter((r2) => /^\.pcv-(touche|legende|fenetre)\b/.test(r2.selectorText || ""));
    const accueil = [...document.querySelector("#pcv-console > style")?.sheet?.cssRules || []].filter((r2) => /\.(cel|chem)\b/.test(r2.selectorText || "") && !/#pcv-console[.:[]/.test(r2.selectorText)).map((r2) => r2.cssText.replace(/body\.pcv-zone-jaquettes #pcv-console/g, ":host-context(body:not(.pcv-barre-main))").replace(/body:not\(\.pcv-zone-jaquettes\) #pcv-console/g, ":host-context(body.pcv-barre-main)").replace(/(html\[[^\]]*\]) #pcv-console/g, ":host-context($1)").replace(/#pcv-console/g, ":host"));
    const biblio = [...document.getElementById("pcv-biblio-d")?.shadowRoot?.querySelector("style:not(.emprunt)")?.sheet?.cssRules || []].filter((r2) => /^\.cel\.app\b/.test(r2.selectorText || ""));
    const home = [...document.styleSheets].flatMap((f) => {
      try {
        return [...f.cssRules];
      } catch (x) {
        return [];
      }
    }).filter((r2) => /^(?:\.pcv-pe|#pcv-home)(?:$| \*$| svg\.ico$| \.(?:verre|pastille|f:not\(\.icone\))$| \.bouton\b)/.test(r2.selectorText || "")).map((r2) => r2.cssText.replace(/#pcv-home/g, ".pcv-pe"));
    em.textContent = theme.map((r2) => r2.cssText).concat(accueil, biblio.map((r2) => r2.cssText), home).join("\n");
  };
  const boutons = (l, k, cl = "") => `<div class="pcv-pe ${cl}" style="zoom:${(U * 800 / 1200).toFixed(4)}">` + l.map((b, j) => `<div class="bouton verre${b.principal ? " reprendre" : ""}${b.danger ? " quitter" : ""}${j === k ? " f" : ""}" data-a="${b.a}"><span class="pastille"${b.c ? ` style="color:${b.c}"` : ""}>${I.svg(b.ic, { classe: "ico" })}</span>${e(b.nom)}</div>`).join("") + `</div>`;
  const coter = () => {
    U = innerHeight / 800;
    CS = Object.fromEntries(Object.entries(TUILES).map(([k, [c, g]]) => [k, Object.entries(window.__pcvJeux.cotes(c, g)).map(([n, v]) => `--${n}:${+(+v).toFixed(3)}`).join(";")]));
  };
  const tuile = (appid, taille2, attrs = "") => {
    const c = TUILES[taille2][0];
    return window.__pcvJeux?.apps().has(appid) ? `<div class="cel jeu" ${attrs}><div class="im" data-p="${appid}" data-c="${c}">${decor(appid)}</div></div>` : `<div class="cel app" ${attrs}><div class="im${c > 60 ? " nomme" : ""}" style="--fond:${window.__pcvFondRepli?.(0)}">${decor(appid)}${ico("reglages")}${c > 60 ? `<b>${e(nomDe(appid))}</b>` : ""}</div></div>`;
  };
  const peindre = (r2) => {
    for (const im of r2.querySelectorAll(".im[data-p]")) {
      const a = appDe(+im.dataset.p);
      if (a) try {
        window.__pcvJeux.peindre(im, a, +im.dataset.c);
      } catch (x) {
      }
    }
  };
  (window.__pcvLegendes ||= {}).telech = () => {
    if (document.body.dataset.pcvPage === "telechargements") legende();
  };
  let derniereLegende = [];
  const legende = (l = derniereLegende) => {
    const el = ombre.querySelector(fen != null ? ".fen-leg" : ".page .legende-bas");
    derniereLegende = l;
    if (el) el.innerHTML = I.legende(window.__pcvLegendeDe(l));
  };
  const btsDe = (x, page) => x === F.cours ? [
    { a: "pause", ic: x.pause ? "lecture" : "pause", nom: T(x.pause ? "telech.reprendre" : "telech.pause"), principal: true },
    { a: "annuler", ic: "supprimer", nom: T("telech.annuler"), danger: true },
    ...page ? [{ a: "reglages", ic: "reglages", nom: T("telech.reglages"), c: "var(--c-param)" }] : []
  ] : [{ a: "premier", ic: "telechargements", nom: T("telech.premier"), principal: true }, { a: "retirer", ic: "supprimer", nom: T("telech.retirer"), danger: true }];
  let vue = false, casse = false, rangs = [], r = 0, i = 0, bt = 0;
  const pas = () => TUILES.rang[0] + TUILES.rang[1], parEcran = () => Math.max(1, Math.floor((innerWidth / U - 80) / pas()));
  const decaler = (r2, d) => {
    decal.set(rangs[r2].cle, d);
    const rg = pageEl.querySelector(`[data-r="${r2}"] .rang`);
    if (rg) rg.style.transform = d ? `translateX(calc(var(--u) * ${-d * pas()}))` : "";
  };
  const decal = /* @__PURE__ */ new Map();
  const nomDe = (id) => appDe(id)?.display_name || "";
  const rendrePage = () => {
    const c = F.cours, choisi = rangs[r]?.l[i];
    rangs = [
      ...c ? [{ cle: "cours", l: [c.appid] }] : [],
      ...F.suivants.length ? [{ cle: "suivants", l: F.suivants.map((x) => x.appid) }] : [],
      ...F.termines.length ? [{ cle: "termines", l: F.termines }] : []
    ];
    if (!c && !F.suivants.length) rangs.unshift({ cle: "vide", l: [0] });
    r = Math.max(0, rangs.findIndex((g) => g.l.includes(choisi)));
    i = Math.max(0, rangs[r].l.indexOf(choisi));
    const et = (k, ic, titre, n, corps) => `<section data-r="${k}"><h3><span class="pastille">${ico(ic)}</span>${e(titre)}${n ? `<small>${n}</small>` : ""}</h3>${corps}</section>`;
    pageEl.innerHTML = `<div class="etageres">` + rangs.map((g, k) => g.cle === "vide" ? `<section class="vide" data-r="${k}"><span class="pastille">${ico("telechargements")}</span><div><h2>${e(T("telech.rien"))}</h2><p>${e(T("telech.rien_aide"))}</p>` + boutons([{ a: "biblio", ic: "bibliotheque", nom: T("spaces.bibliotheque.nom"), principal: true }], 0) + `</div></section>` : g.cle === "cours" ? et(k, "telechargements", T("telech.en_cours"), 0, `<div class="courant" style="${CS.grand}">${tuile(c.appid, "grand", `data-k="${k}" data-j="0"`)}<div class="infos"><h2>${e(nomDe(c.appid))}</h2>${avancement(c)}` + boutons(btsDe(c, true), -1, "ligne") + `</div></div>`) : et(
      k,
      g.cle === "suivants" ? "horloge" : "manette",
      T(g.cle === "suivants" ? "telech.a_suivre" : "telech.termine"),
      g.cle === "suivants" ? g.l.length : 0,
      `<div class="rang" style="${CS.rang}">` + g.l.map((id, j) => tuile(id, "rang", `data-k="${k}" data-j="${j}"`)).join("") + `</div>`
    )).join("") + `</div><div class="titre pcv-legende"><span>${ico("telechargements")}${e(T("barre.telechargements"))}${F.suivants.length ? `<small>${e(T("telech.n_suivre", { n: F.suivants.length }))}</small>` : ""}</span></div><div class="legende-bas pcv-legende"></div>`;
    peindre(pageEl);
    marquer();
  };
  const marquer = () => {
    const g = rangs[r];
    if (!g) return;
    for (const x2 of pageEl.querySelectorAll(".sel, .f")) x2.classList.remove("sel", "f");
    for (const x2 of pageEl.querySelectorAll("h3 .nom")) x2.remove();
    const s = pageEl.querySelector(`[data-k="${r}"][data-j="${i}"]`);
    s?.classList.add("sel");
    if (g.cle === "vide" || g.cle === "cours") pageEl.querySelectorAll(`[data-r="${r}"] .bouton`)[g.cle === "cours" ? bt : 0]?.classList.add("f");
    const x = g.cle === "suivants" ? F.suivants[i] : null;
    if (g.cle === "suivants" || g.cle === "termines") {
      pageEl.querySelector(`[data-r="${r}"] h3`)?.insertAdjacentHTML("beforeend", `<span class="nom">${e(nomDe(g.l[i]))}</span>` + (x?.etat === "prevu" ? `<span class="puce nom"><i>${ico("calendrier")}</i>${e(prevuDe(x))}</span>` : ""));
      const n = parEcran();
      let d = decal.get(g.cle) || 0;
      d = Math.max(Math.min(d, i), i - n + 1);
      decaler(r, d);
    }
    legende([
      [1, g.cle === "vide" ? T("spaces.bibliotheque.nom") : g.cle === "cours" ? btsDe(F.cours, true)[bt].nom : x ? T("telech.premier") : T("biblio.jouer")],
      ...g.cle === "vide" ? [] : [[3, g.cle === "termines" ? T("console.page_jeu") : T("biblio.options")]],
      [2, T("biblio.retour")]
    ]);
  };
  const confirmer = (a, appid) => {
    const nom = nomDe(appid), oui = T(a === "annuler" ? "telech.annuler" : "telech.retirer");
    if (!window.__pcvDossiers?.demander?.({
      titre: T(a === "annuler" ? "telech.annuler_titre" : "telech.retirer_titre"),
      texte: T(a === "annuler" ? "telech.annuler_texte" : "telech.retirer_texte", { nom }),
      non: T("telech.garder"),
      oui,
      ok: () => {
        window.__pcvSon?.("choisir");
        a === "annuler" ? B.telech.retirer(F.cours?.appid) : B.telech.retirer(appid);
      },
      ailleurs: true
    })) window.__pcvSon?.("bord");
  };
  const options = (g, appid) => {
    const el = pageEl.querySelector(".cel.sel") || pageEl;
    const l = [
      g.cle === "cours" && { ic: "suppr", nom: T("telech.annuler"), faire: () => confirmer("annuler", appid) },
      g.cle === "suivants" && { ic: "suppr", nom: T("telech.retirer"), faire: () => confirmer("retirer", appid) },
      { ic: "reglages", svg: I.trace("reglages"), nom: T("telech.reglages"), faire: () => agir("reglages") }
    ].filter(Boolean);
    if (!window.__pcvDossiers?.choix(-1, l, { pres: el, ailleurs: true })) agir("reglages");
  };
  const agir = (a, appid) => {
    if (a === "annuler" || a === "retirer") return confirmer(a, appid);
    const t = B.telech;
    window.__pcvSon?.("choisir");
    if (a === "pause") t.pause(!F.cours?.pause);
    else if (a === "premier") t.premier(appid);
    else if (a === "reglages") t.reglages();
    else if (a === "biblio") O.__pcvAller?.(2);
    else if (a === "jouer") {
      const j = appDe(appid);
      if (j) window.__pcvJeux.jouer(j, pageEl.querySelector(".cel.sel"));
    }
  };
  const agirPage = (b) => {
    const g = rangs[r];
    if (!g) return;
    if (b === 3 && g.cle !== "vide") return g.cle === "termines" ? window.__pcvPageJeu?.(g.l[i], null, "telechargements") || window.__pcvJeux?.ouvrir?.(g.l[i]) : options(g, g.l[i]);
    if (b !== 1) return window.__pcvSon?.("bord");
    if (g.cle === "vide") return agir("biblio");
    if (g.cle === "cours") return agir(btsDe(F.cours, true)[bt].a, g.l[i]);
    if (g.cle === "suivants") return agir("premier", g.l[i]);
    agir("jouer", g.l[i]);
  };
  let fen = null, fbt = 0;
  const rendreFen = () => {
    const x = etatDe(fen);
    if (!x) return fermerFen();
    const c = x === F.cours, avant = c ? F.suivants : [F.cours, ...F.suivants.slice(0, F.suivants.indexOf(x))].filter(Boolean);
    const n = F.suivants.filter((y) => y.etat === "file").indexOf(x) + 1 + (F.cours ? 1 : 0);
    const rang = x.etat === "prevu" ? `<span class="puce"><i>${ico("calendrier")}</i>${e(prevuDe(x))}</span>` : x.etat === "pause" ? `<span class="puce gris"><i>${ico("pause")}</i>${e(T("telech.arretee"))}</span>` : `<span class="puce"><i>${ico("horloge")}</i>${e(n === 1 ? T("telech.rang1") : T("telech.rang", { n }))}</span>`;
    const l = btsDe(x, false);
    fenEl.innerHTML = `<div class="voile"></div><div class="fen pcv-fenetre"><div class="haut-f" style="${CS.fen}">${tuile(fen, "fen")}<div class="infos"><h2>${e(nomDe(fen))}</h2>` + (c ? avancement(x) : rang + `<span class="puce gris"><i>${ico("telechargements")}</i>${e(T(x.maj ? "telech.maj" : "telech.installation"))}</span>`) + `</div></div>` + boutons(l, fbt, "boutons") + (avant.length ? `<div class="suite"><h3><span class="pastille">${ico("horloge")}</span>${e(T(c ? "telech.ensuite" : "telech.avant_lui"))}<small>${avant.length}</small></h3><div class="rang" style="${CS.mini}">${avant.slice(0, 8).map((z) => tuile(z.appid, "mini")).join("")}</div></div>` : "") + `</div><div class="legende-bas pcv-legende fen-leg"></div>`;
    peindre(fenEl);
    legende([[1, l[fbt].nom], ...fbt ? [] : [[3, l[1].nom]], [2, T("biblio.retour")]]);
  };
  const ouvrirFen = (appid) => {
    if (!etatDe(appid)) return false;
    try {
      emprunter();
      coter();
      fen = appid;
      fbt = 0;
      fenEl.hidden = false;
      racine.classList.add("fen-ouverte");
      document.body.classList.add("pcv-telech-fen");
      window.__pcvVoile?.("telech", true);
      rendreFen();
      window.__pcvApparition(fenEl, false, ".fen");
      montrerRacine();
      window.__pcvSon?.("choisir");
      return true;
    } catch (x) {
      console.error("t\xE9l\xE9chargements : fen\xEAtre", x);
      fermerFen();
      return false;
    }
  };
  const fermerFen = () => {
    if (fen != null) window.__pcvApparition(fenEl, true, ".fen");
    fen = null;
    fenEl.hidden = true;
    fenEl.innerHTML = "";
    racine.classList.remove("fen-ouverte");
    document.body.classList.remove("pcv-telech-fen");
    window.__pcvVoile?.("telech", false);
    montrerRacine();
  };
  const agirFen = (b) => {
    const x = etatDe(fen);
    if (!x) return fermerFen();
    const l = btsDe(x, false), id = fen;
    if (b === 11 || b === 12) {
      const k = fbt + (b === 12 ? 1 : -1);
      if (k >= 0 && k < l.length) {
        fbt = k;
        rendreFen();
      }
    } else if (b === 1 || b === 3) {
      const a = l[b === 3 ? 1 : fbt].a;
      if (a !== "pause") fermerFen();
      agir(a, id);
    } else if (b === 2) fermerFen();
    else window.__pcvSon?.("bord");
  };
  const montrerRacine = () => {
    const h = !(vue || fen != null);
    if (h ? racine.hidden || racine.__pcvSortie : !racine.hidden && !racine.__pcvSortie) return;
    if (h) return window.__pcvApparition(racine, true, null, () => {
      racine.hidden = true;
      if (!vue) {
        pageEl.hidden = true;
        pageEl.innerHTML = "";
      }
    });
    racine.hidden = false;
    if (vue) window.__pcvApparition(racine);
    else racine.__pcvSortie?.cancel();
  };
  const lire = () => {
    const f = B.telech.file() || { cours: null, suivants: [], termines: [] }, J = window.__pcvJeux;
    if (J) f.termines = f.termines.filter((id) => J.apps().has(id));
    return f;
  };
  const pilule = () => {
    const d = document.querySelector("#pcv-barre .rond.telech .detail"), c = F.cours;
    if (!d) return;
    if (!c) {
      d.innerHTML = "";
      return;
    }
    const J = window.__pcvJeux, jeu = J?.apps().has(c.appid);
    d.innerHTML = `<span class="mini"${jeu ? "" : ` style="--fond:${window.__pcvFondRepli?.(0)}"`}>${jeu ? "" : ico("reglages")}</span><span class="txt"><b>${e(nomDe(c.appid))}</b><small><span class="qte">${e(chiffresDe(c))}</span> <span class="vit">${e(vitesseDe(c))}</span></small></span>`;
    if (jeu) try {
      J.peindre(d.firstChild, J.apps().get(c.appid), 38);
    } catch (x) {
    }
  };
  const maj = () => {
    F = lire();
    if (window.__pcvTelechBanc) window.__pcvTelechFactice = F.cours ? { pct: F.cours.pct, pause: F.cours.pause } : void 0;
    const k = JSON.stringify([F.cours?.appid, F.cours?.pause, F.suivants, F.termines]);
    if (k !== cle) {
      cle = k;
      tuiles();
      pilule();
      if (vue) rendrePage();
      if (fen != null) rendreFen();
      window.__pcvLegende?.();
      return;
    }
    const c = F.cours;
    if (!c) return;
    for (const b of [...document.querySelectorAll("#pcv-console .pcv-dl"), ...ombre.querySelectorAll(".pcv-dl")]) b.style.setProperty("--pct", Math.round(c.pct) + "%");
    for (const s of ombre.querySelectorAll(".reste")) s.textContent = resteDe(c);
    for (const s of [...ombre.querySelectorAll(".qte"), ...document.querySelectorAll("#pcv-barre .rond.telech .qte")]) s.textContent = chiffresDe(c);
    for (const s of ombre.querySelectorAll(".vit")) {
      const v2 = vitesseDe(c);
      s.hidden = !v2;
      s.lastChild.textContent = v2;
    }
    const v = document.querySelector("#pcv-barre .rond.telech .vit");
    if (v) v.textContent = vitesseDe(c);
  };
  let demande = 0, route = 0;
  window.__pcvTelechArreter = () => {
    cancelAnimationFrame(demande);
    clearTimeout(route);
  };
  const changer = () => {
    if (!demande) demande = requestAnimationFrame(() => {
      demande = 0;
      try {
        maj();
      } catch (x) {
        console.error("t\xE9l\xE9chargements", x);
      }
    });
  };
  const abonner = () => {
    try {
      window.__pcvTelechAbo?.unregister();
    } catch (x) {
    }
    cle = "";
    window.__pcvTelechAbo = B.telech.abonner(changer);
  };
  let banc = false;
  try {
    banc = !!JSON.parse(localStorage.getItem("pcv-banc-telech"));
  } catch (x) {
  }
  if (banc) window.__pcvTelechBanc = fausse();
  else if (window.__pcvTelechBanc) {
    delete window.__pcvTelechBanc;
    delete window.__pcvTelechFactice;
  }
  abonner();
  const voir = () => {
    if (fen != null && (window.__pcvJeuDevant || !/^\/routes\/library\/home/.test(O.location.pathname))) fermerFen();
    let ancienne = false;
    try {
      ancienne = String(localStorage.getItem("pcv-interface")).includes("ancienne");
    } catch (x) {
    }
    const oui = !casse && ROUTE.test(O.location.pathname) && !ancienne && !window.__pcvJeuDevant && !!window.__pcvJeux;
    if (oui === vue) return;
    vue = oui;
    if (oui) try {
      emprunter();
      coter();
      decal.clear();
      F = lire();
      pageEl.hidden = false;
      window.__pcvFond?.($("#pcv-telech-fond"));
      rendrePage();
    } catch (x) {
      console.error("t\xE9l\xE9chargements SteamU : repli sur la page de Steam", x);
      casse = true;
      vue = false;
    }
    if (!vue && (fen != null || racine.hidden)) {
      pageEl.hidden = true;
      pageEl.innerHTML = "";
    }
    montrerRacine();
  };
  if (O.navigation) {
    O.navigation.removeEventListener("currententrychange", O.__pcvTelechNav);
    O.navigation.addEventListener("currententrychange", O.__pcvTelechNav = () => {
      clearTimeout(route);
      route = setTimeout(voir, 0);
    });
  }
  removeEventListener("pcv-jeu-devant", window.__pcvTelechDevant);
  addEventListener("pcv-jeu-devant", window.__pcvTelechDevant = voir);
  removeEventListener("resize", window.__pcvTelechTaille);
  addEventListener("resize", window.__pcvTelechTaille = () => {
    if (racine.hidden) return;
    coter();
    if (vue) rendrePage();
    if (fen != null) rendreFen();
  });
  voir();
  (window.__pcvManette ||= {}).telech = (b) => {
    if (b === 1 && !racine.hidden) window.__pcvAppui((fen != null ? fenEl : pageEl).querySelector(".bouton.f") || pageEl.querySelector(".cel.sel"));
    if (fen != null) {
      agirFen(b);
      return true;
    }
    if (!vue) return false;
    const g = rangs[r];
    if (!g) return true;
    if (b === 9) {
      if (r === 0) {
        window.__pcvBarreEntrer?.(marquer);
        return true;
      }
      r--;
    } else if (b === 10) {
      if (r >= rangs.length - 1) return true;
      r++;
    } else if ((b === 11 || b === 12) && g.cle === "cours") {
      const k = bt + (b === 12 ? 1 : -1);
      if (k < 0 || k >= btsDe(F.cours, true).length) return true;
      bt = k;
    } else if (b === 11) {
      if (i <= 0) return true;
      i--;
    } else if (b === 12) {
      if (i >= g.l.length - 1) return true;
      i++;
    } else if (b === 2) {
      O.__pcvAller?.(1);
      return true;
    } else {
      agirPage(b);
      return true;
    }
    i = Math.min(i, rangs[r].l.length - 1);
    marquer();
    return true;
  };
  let glisse = null;
  ombre.addEventListener("pointerdown", (x) => {
    const k = +x.target.closest(".rang")?.closest("[data-r]")?.dataset.r, g = rangs[k];
    glisse = g?.cle === "suivants" || g?.cle === "termines" ? { x: x.clientX, k, d0: decal.get(g.cle) || 0, bouge: false } : null;
  });
  ombre.addEventListener("pointermove", (x) => {
    const s = glisse;
    if (!s) return;
    const dx = (x.clientX - s.x) / U;
    if (!s.bouge && Math.abs(dx) < 12) return;
    s.bouge = true;
    decaler(s.k, Math.max(0, Math.min(rangs[s.k].l.length - parEcran(), s.d0 - Math.round(dx / pas()))));
  });
  ombre.addEventListener("click", (x) => {
    const t = x.target;
    if (glisse?.bouge) {
      glisse = null;
      return;
    }
    if (fen != null) {
      const a2 = t.closest("[data-a]");
      if (a2) {
        fbt = [...a2.parentElement.children].indexOf(a2);
        agirFen(1);
      } else if (t.closest(".voile")) fermerFen();
      return;
    }
    const a = t.closest("[data-a]");
    if (a) return agir(a.dataset.a, F.cours?.appid);
    const c = t.closest("[data-k][data-j]");
    if (!c) return;
    r = +c.dataset.k;
    i = +c.dataset.j;
    bt = 0;
    marquer();
    agirPage(1);
  });
  window.__pcvTelech = {
    tuiles,
    ouvrir: ouvrirFen,
    dans: (appid) => !!etatDe(appid),
    banc: (oui) => {
      try {
        localStorage.setItem("pcv-banc-telech", oui ? "1" : "0");
      } catch (x) {
      }
      if (oui) window.__pcvTelechBanc = fausse();
      else {
        delete window.__pcvTelechBanc;
        delete window.__pcvTelechFactice;
      }
      abonner();
    }
  };
  return "t\xE9l\xE9chargements pr\xEAts";
})();
