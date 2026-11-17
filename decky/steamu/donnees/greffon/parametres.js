(() => {
  const O = window.opener || window, B = () => window.__pcvBridge;
  const T = (k, v) => window.__pcvT?.(k, v) ?? k, son = (s) => window.__pcvSon?.(s);
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
  const plat = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
  const fibre = (e) => {
    const k = e && Object.keys(e).find((x) => x.startsWith("__reactFiber")), f = k && e[k];
    if (!f) return null;
    let r = f;
    while (r.return) r = r.return;
    return r.stateNode?.current === r || !f.alternate ? f : f.alternate;
  };
  const TUILES = '.PageListColumn [role=tab][id*="/settings/"]', LIGNE = "{{Field@FieldLabel}}";
  const chemin = () => B()?.page?.() || "";
  const cle = (t) => "/settings/" + t.id.split("/settings/")[1];
  const choisie = () => document.querySelector(`${TUILES}[aria-selected=true]`);
  const sousPage = () => {
    const t = choisie(), c = chemin();
    return !!t && c !== cle(t) && !/^\/settings\/?$/.test(c);
  };
  window.__pcvRangeeSuivi?.disconnect();
  document.getElementById("pcv-rangee-cadre")?.remove();
  let cadre = null, rangee = null, avantRangee = "";
  const sources = () => [document.getElementById("pcv-onglet-steamu"), ...document.querySelectorAll(TUILES)].filter((t) => t && t.dataset.pcvChoix !== "retirer");
  const nomsRelief = /* @__PURE__ */ new Map();
  const reliefTuiles = (paires) => {
    const I = "{{PageListItem_Icon@PageListItem_Title}}";
    const a = paires.map(([c, t]) => [c.querySelector(I), t.querySelector(I), t.id]).filter(([ic, source]) => ic && source && !ic.querySelector(".pcv-marque-relief")).map(([ic, source, id]) => {
      if (!nomsRelief.has(id)) nomsRelief.set(id, getComputedStyle(source).getPropertyValue("--pcv-param-icone").trim());
      return [ic, nomsRelief.get(id)];
    });
    for (const [ic, nom] of a) if (nom) ic.innerHTML = window.__pcvIcones.relief(nom, "var(--pcv-param-couleur)");
  };
  const recopier = () => {
    const col = document.querySelector(".PageListColumn:not(#pcv-rangee)");
    if (!col) return;
    const suivi = window.__pcvRangeeSuivi;
    if (!cadre?.isConnected || suivi?.col !== col) {
      cadre?.remove();
      cadre = document.createElement("div");
      cadre.id = "pcv-rangee-cadre";
      rangee = col.cloneNode(false);
      rangee.id = "pcv-rangee";
      rangee.append(col.firstElementChild.cloneNode(false));
      cadre.append(rangee);
      document.body.append(cadre);
      avantRangee = "";
      const g = window.__pcvPresentation.gestes({ ombre: rangee, balayer: (e, a) => {
        if (Math.abs(a.dx) > Math.abs(a.dy)) voisine(Math.round(-a.dx / (130 * innerHeight / 800)) || Math.sign(-a.dx));
      } });
      rangee.addEventListener("click", (e) => {
        if (!g.accepter(e)) return;
        const c = e.target.closest("[data-pcv-de]");
        if (c) allerA(c);
      });
      suivi?.disconnect();
      const o = window.__pcvRangeeSuivi = new MutationObserver(recopier);
      o.col = col;
      o.observe(col, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"], characterData: true });
    }
    if (!cadre.firstElementChild.matches(".pcv-titre-appli")) cadre.insertAdjacentHTML("afterbegin", window.__pcvTitreAppli?.("parametres") || "");
    const l = rangee.firstElementChild, src = sources(), sig = src.map((t) => t.id).join();
    if (sig !== avantRangee) {
      avantRangee = sig;
      l.replaceChildren(...src.map((t) => {
        const c = t.cloneNode(true);
        c.id = "pcv-r-" + t.id;
        c.dataset.pcvDe = t.id;
        c.setAttribute("role", "button");
        c.removeAttribute("aria-selected");
        c.removeAttribute("aria-controls");
        c.removeAttribute("tabindex");
        return c;
      }));
    }
    const v = rangee.__vise, attente = v && performance.now() - v.t < 1500 && !enCours(v.de);
    if (!attente) rangee.__vise = null;
    let active = null;
    const paires = [];
    for (const c of l.children) {
      const t = document.getElementById(c.dataset.pcvDe);
      if (!t) continue;
      const k = t.className.replace(/\s*\bgpfocus\S*/g, "");
      if (c.className !== k && !attente) c.className = k;
      if (c.style.display !== t.style.display) c.style.display = t.style.display;
      if (c.textContent !== t.textContent) c.replaceChildren(...t.cloneNode(true).childNodes);
      paires.push([c, t]);
      if (t.id === "pcv-onglet-steamu" ? window.__pcvSteamU?.ouvert?.() : t.getAttribute("aria-selected") === "true" && !window.__pcvSteamU?.ouvert?.()) active = c;
    }
    reliefTuiles(paires);
    const affiche = [...l.children].map((c) => c.style.display).join();
    if (!attente && active && (active !== rangee.__active || affiche !== rangee.__affiche)) {
      rangee.__active = active;
      rangee.__affiche = affiche;
      placer(active);
      curseur(false);
    }
  };
  const placer = (c) => {
    const l = [...rangee.firstElementChild.children].filter((x) => x.style.display !== "none" || x === c);
    window.__pcvPresentation?.rangee(l, l.indexOf(c));
  };
  const STEAMU = "pcv-onglet-steamu";
  const enCours = (de) => de === STEAMU ? !!window.__pcvSteamU?.ouvert?.() : !window.__pcvSteamU?.ouvert?.() && document.getElementById(de)?.getAttribute("aria-selected") === "true";
  const passer = (c) => {
    const a = rangee.__active;
    if (!a || a === c) return;
    const k = [...a.classList].filter((x) => !c.classList.contains(x) && !x.startsWith("gpfocus"));
    if (a.hasAttribute("data-pcv-vise")) {
      a.removeAttribute("data-pcv-vise");
      c.setAttribute("data-pcv-vise", "");
    }
    a.classList.remove(...k);
    c.classList.add(...k);
    rangee.__active = c;
    rangee.__vise = { de: c.dataset.pcvDe, t: performance.now() };
    placer(c);
  };
  const allerA = (c, s = "choisir") => {
    const t = document.getElementById(c.dataset.pcvDe);
    if (!t) return;
    if (s) son(s);
    passer(c);
    clearTimeout(rangee.__pose);
    rangee.__pose = setTimeout(() => {
      rangee.__vise = { de: c.dataset.pcvDe, t: performance.now() };
      if (t.id === STEAMU) return window.__pcvSteamU?.ouvrir?.();
      window.__pcvSteamU?.fermer?.();
      t.click();
    }, window.__pcvPanneau().duration);
  };
  const visibles = () => [...rangee?.firstElementChild.children || []].filter((c) => c.style.display !== "none");
  const nav = window.__pcvPresentation.onglets({
    rang: () => {
      const l = visibles();
      return [l.indexOf(rangee?.__vise ? l.find((c) => c.dataset.pcvDe === rangee.__vise.de) : rangee?.__active), l.length];
    },
    aller: (j) => allerA(visibles()[j], ""),
    revenir: () => versTuiles(),
    descendre: () => {
      const sp = sousPage();
      if (sp ? cibles().length : colonne.querySelectorAll(".onglet").length) {
        S.cur = 0;
        S.zone = sp ? "lignes" : "colonne";
        son("bouge");
        curseur();
      } else son("bord");
    }
  });
  const voisine = nav.voisine;
  const genre = (p) => typeof p?.onChange !== "function" ? null : typeof p.checked === "boolean" ? "inter" : Array.isArray(p.rgOptions) ? "liste" : typeof p.min === "number" && typeof p.max === "number" && typeof p.value === "number" ? "curseur" : null;
  const commandes = (l) => {
    for (let f = fibre(l)?.return, i = 0; f && i < 14 && typeof f.type !== "string"; f = f.return, i++) {
      const g = genre(f.memoizedProps);
      if (g) return [{ g, p: f.memoizedProps }];
    }
    const r = fibre(l), vus = /* @__PURE__ */ new Map();
    for (const e of l.querySelectorAll("*")) for (let f = fibre(e), i = 0; f && f !== r && i < 8; f = f.return, i++) {
      const g = genre(f.memoizedProps);
      if (g && !vus.has(f.memoizedProps.onChange)) vus.set(f.memoizedProps.onChange, { g, p: f.memoizedProps });
    }
    return [...vus.values()];
  };
  const typeNotif = (l) => {
    for (let f = fibre(l), i = 0; f && i < 8; f = f.return, i++) if (f.key != null && /^\d+$/.test(f.key)) return +f.key;
    return null;
  };
  const action = (l) => {
    for (let f = fibre(l)?.return, i = 0; f && i < 6 && typeof f.type !== "string"; f = f.return, i++) if (typeof f.memoizedProps?.onClick === "function" || typeof f.memoizedProps?.onActivate === "function") return true;
    return false;
  };
  const texte = (x, n = 0) => {
    if (x == null || x === false || n > 6) return "";
    if (typeof x === "string") return x[0] === "#" ? B()?.texteSteam?.(x.slice(1)) || x : x;
    if (typeof x === "number") return String(x);
    if (Array.isArray(x)) return x.map((y) => texte(y, n + 1)).filter(Boolean).join(" ");
    const p = x.props;
    if (!p) return "";
    return texte(p.children, n + 1) || texte(p.name, n + 1) || texte(Object.values(p).flatMap((v) => v && typeof v === "object" ? Object.entries(v) : []).find(([k]) => /LocalizationToken$/.test(k))?.[1], n + 1);
  };
  const ligneSteam = (l) => {
    const ren = l.querySelector("[data-pcv-renomme]"), d = l.querySelector("{{FieldChildrenInner@FieldIcon}}");
    let aide = plat(l.querySelector("{{FieldDescription@FieldLabel}}")?.textContent), lab = plat(l.querySelector("{{FieldLabel@FieldLeftColumn}}")?.textContent) || plat(l.textContent);
    if (aide && lab.endsWith(aide) && lab !== aide) lab = lab.slice(0, -aide.length).trim();
    if (aide === lab) aide = "";
    const man = l.querySelector("{{ControllerLabel@Dongle}}");
    if (man) {
      lab = plat(man.querySelector("{{Text@ControllerLabel}}")?.textContent) || lab;
      aide = plat(man.querySelector("{{Dongle@ControllerLabel}}")?.textContent);
    }
    const nom = ren?.dataset.pcvRenomme || l.dataset.pcvRenomme || lab, droite = ren && d?.contains(ren) ? lab : plat(d?.textContent);
    const x = { nom, aide, cle: l.dataset.pcvReglage || nom, dessin: man && (man.querySelector(":scope > .pcv-picto") || man.querySelector(":scope > svg"))?.outerHTML }, c = commandes(l);
    if (c.length > 1) {
      const n = typeNotif(l);
      return n == null ? { ...x, g: "steam" } : { ...x, g: "inter", aide: B()?.texteSteam?.("NotificationsSettings_Column_Notification") || aide, val: !!B()?.notifBulle?.(n), faire: () => B()?.basculerNotifBulle?.(n) };
    }
    if (c.length) {
      const { g, p } = c[0];
      if (g === "inter") return { ...x, g, val: p.checked, faire: () => p.onChange(!p.checked) };
      if (g === "curseur") return { ...x, g, min: p.min, max: p.max, pas: p.step || (p.max - p.min) / 20, val: p.value, faire: (v2) => {
        p.onChange(v2);
        p.onChangeComplete?.(v2);
      } };
      const o = p.rgOptions, k = o.findIndex((y) => y.data === p.selectedOption), noms = o.map((y) => plat(texte(y.label)) || String(y.data));
      const v = k >= 0 ? k : noms.findIndex((y) => y && droite.startsWith(y));
      return { ...x, g, val: v >= 0 ? noms[v] : droite, faire: () => window.__pcvDossiers?.liste?.({ ailleurs: true, titre: nom, choix: noms, v, ok: (i) => o[i] && p.onChange(o[i]) }) };
    }
    const r = l.matches("[role=radio]") ? l : l.querySelector("[role=radio]");
    if (r) return { ...x, g: "radio", val: r.getAttribute("aria-checked") === "true", faire: () => r.click() };
    const b = [...l.querySelectorAll(".DialogButton, button")];
    if (b.length > 1) return { ...x, g: "steam" };
    if (b.length) return { ...x, g: "bouton", val: plat(b[0].textContent) === nom ? "" : plat(b[0].textContent), faire: () => b[0].click() };
    const f = [...l.querySelectorAll(".Focusable, input, textarea")];
    if (action(l) || f.length === 1 && !f[0].matches("input, textarea")) return { ...x, g: "action", val: droite, faire: () => (action(l) ? l : f[0]).click() };
    if (f.length) return { ...x, g: "steam" };
    return { ...x, g: "texte", val: droite.startsWith(nom) ? "" : droite, nom: droite && nom.endsWith(droite) ? nom.slice(0, -droite.length) : nom };
  };
  const texteDe = (ids) => plat((ids || "").split(" ").map((i) => document.getElementById(i)?.textContent).filter(Boolean).join(" "));
  const horsLigne = (e) => {
    if (e.matches("[role=radio]")) {
      const ids = (e.getAttribute("aria-labelledby") || "").split(" ");
      if (ids.length < 2) return null;
      return { g: "radio", titre: ids.length > 1 ? texteDe(ids[0]) : "", nom: texteDe(ids[ids.length - 1]) || plat(e.textContent), aide: texteDe(e.getAttribute("aria-describedby")), cle: ids.join(), val: e.getAttribute("aria-checked") === "true", faire: () => e.click() };
    }
    if (e.parentElement?.parentElement?.querySelectorAll(".DialogButton").length > 1) return null;
    return { g: "bouton", nom: plat(e.textContent), aide: "", cle: plat(e.textContent), val: "", faire: () => e.click() };
  };
  const ligneVenue = (l) => {
    const [g] = (l.dataset.rendu || "").split(":"), lib = l.querySelector(".pcv-lib"), x = { nom: plat(lib?.firstChild?.textContent), aide: plat(lib?.querySelector("small")?.textContent), cle: l.dataset.rendu };
    if (g === "curseur") {
      const c = l.querySelector("input");
      return { ...x, g, min: 0, max: 100, pas: 5, val: +c.value, faire: (v2) => {
        c.value = v2;
        c.dispatchEvent(new Event("input", { bubbles: true }));
      } };
    }
    if (l.querySelector(".pcv-inter")) return { ...x, g: "inter", val: l.querySelector(".pcv-inter").classList.contains("pcv-oui"), faire: () => l.click() };
    const v = l.querySelector(".pcv-liste > span, .pcv-val");
    return { ...x, g: v?.matches(".pcv-val") || !v ? "bouton" : "liste", val: plat(v?.textContent || l.querySelector(".DialogButton")?.textContent), faire: () => l.click() };
  };
  const S = { zone: "tuiles", og: "", grp: 0, cur: 0, sous: "", dessin: "", dehors: null, manette: false, doigt: false, route: false, entre: "", entree: "" };
  const ecran = () => !!window.__pcvEcran?.ouvert?.();
  const ouvert = () => document.body.dataset.pcvPage === "parametres" && !window.__pcvSteamU?.ouvert?.() && !ecran();
  const STOCKAGE = "/settings/storage";
  const natif = () => /^\/settings\/controller\//.test(S.og);
  const couvre = () => ouvert() && !S.dehors && S.og !== STOCKAGE && !natif();
  const lignes = (av) => {
    const t = choisie();
    if (!t || cle(t) !== S.og) return null;
    const corps = window.__pcvReglages?.corps?.();
    if (!corps) return null;
    const out = [];
    let section = "", reste = false;
    const hote = corps.classList.contains("pcv-hote"), dehors = (e) => !hote && !e.closest("[data-pcv-choix], .pcv-bas"), titre = (s) => {
      if (s && s !== section) out.push({ g: "titre", nom: section = s });
    };
    for (const l of corps.querySelectorAll(`${LIGNE}[data-pcv-choix]:not([role=region]), .pcv-bas > .pcv-ligne, [role=radio], .DialogButton`)) {
      if (l.matches(".pcv-ligne")) {
        if (!av && l.dataset.rendu !== "avances") out.push(ligneVenue(l));
        continue;
      }
      if (!l.matches("[data-pcv-choix]")) {
        if (av || !dehors(l)) continue;
        const x2 = horsLigne(l);
        if (!x2) {
          reste = true;
          continue;
        }
        titre(x2.titre);
        out.push(x2);
        continue;
      }
      const c = l.dataset.pcvChoix;
      if (c === "retirer" || c === "deplacer" || c === "avances" !== av || corps.classList.contains("pcv-hote")) continue;
      const id = l.parentElement?.closest("[aria-labelledby]")?.getAttribute("aria-labelledby");
      const x = ligneSteam(l);
      if (x.g === "steam") {
        reste = true;
        continue;
      }
      titre(plat(id && document.getElementById(id)?.textContent));
      out.push(x);
    }
    reste ||= !av && [...corps.querySelectorAll(".Focusable")].some((e) => dehors(e) && !e.closest("[role=radio], .DialogButton") && !e.querySelector(".Focusable, button, [role=radio]"));
    if (reste) out.push({ g: "ouvrir", nom: T("parametres.dans_steam"), aide: T("parametres.dans_steam.aide"), cle: "steam", faire: () => ouvrirDehors() });
    return out;
  };
  const groupes = () => {
    const v = lignes(false);
    if (!v) return null;
    const g = [];
    let c = null;
    for (const x of v) if (x.g === "titre") {
      c = g.find((y) => y.nom === x.nom);
      if (!c) g.push(c = { nom: x.nom, l: [] });
    } else {
      if (!c) g.push(c = { nom: plat(choisie()?.textContent), l: [] });
      c.l.push(x);
    }
    if (g[0]?.nom === plat(choisie()?.textContent) && g[0].l.length === 1 && g[0].l[0].nom) {
      const n = plat(g[0].l[0].nom), t = B()?.texteSteam;
      g[0].nom = n === t?.("Settings_Language_Select") && t("LanguageSettings_Label") || n;
    }
    const ib = g.findIndex((x) => x.nom === B()?.texteSteam?.("Settings_Power_Battery_Title"));
    if (window.__pcvModes?.leviers && (ib >= 0 || S.og === "/settings/power")) g.splice(ib + 1 || Math.min(1, g.length), 0, rubriqueEco());
    const a = lignes(true);
    if (a?.some((x) => x.g !== "titre")) g.push({ nom: T("reglages.avances"), l: a });
    return g;
  };
  const NIVEAUX_ECO = ["legere", "normale", "maximale"];
  const DETAIL_ECO = [
    ["anim", "etoile", "var(--pcv-orange)"],
    ["place", "photo", "#2a8cff", 1],
    ["fond", "video", "var(--pcv-rouge)"],
    ["musique", "musique", "var(--pcv-rouge)"],
    ["apercus", "maison", "#2ab4d9", 1],
    ["tdp", "perf", "var(--pcv-orange)"],
    ["lum", "soleil", "#f5b301"],
    ["noir", "palette", "var(--pcv-touche-neutre)", 1],
    ["telech", "telech", "var(--pcv-vert)"],
    ["systeme", "wifi", "#4f8df7"]
  ];
  const PUCES_ECO = ["anim", "fond", "apercus", "lum", "place", "musique", "tdp", "telech", "systeme", "noir"];
  const RESUME_ECO = ["anim", "place", "musique", "fond", "apercus"], FEMININS_ECO = ["anim", "place", "musique"];
  const listeEco = (titre, choix, v, ok) => window.__pcvDossiers?.liste?.({ ailleurs: true, titre, choix: choix.map((c) => c[1]), v: Math.max(0, choix.findIndex((c) => c[0] === v)), ok: (i) => {
    if (choix[i]) ok(choix[i][0]);
    rafraichir();
  } });
  const detailEco = (oui) => {
    S.ecoDetail = oui;
    S.cur = 0;
    S.entre = ".contenu > *";
    contenu.scrollTop = 0;
    dessiner();
    curseur();
  };
  const rubriqueEco = () => {
    const M = window.__pcvModes, m = M.lire(), r = M.reglages(m), l = M.leviers(m), p = B()?.battery?.(), charge = !!p?.charging, w = { w: M.WATTS };
    const niveau = T("eco.niveau." + r.niveau), seuil = r.seuil ? T("eco.a_pct", { n: r.seuil }) : T("eco.jamais");
    const watts = (n) => n ? T("eco.w_max", { w: n }) : T("eco.celle_du_jeu"), ips = (n) => n ? T("eco.ips", { n }) : T("eco.sans_limite");
    const jeu = [l.jeuW && `${l.jeuW} W`, l.jeuIps && ips(l.jeuIps)].filter(Boolean).join(", ");
    const coupes = RESUME_ECO.filter((k) => l[k]).slice(0, 3), liste = coupes.map((k) => T("eco.r." + k)).join(", ").replace(/^./, (c) => c.toUpperCase());
    const ce = [coupes.length && T(coupes.every((k) => FEMININS_ECO.includes(k)) ? "eco.coupees" : "eco.coupes", { liste }), l.tdp && T("eco.w", w)].filter(Boolean).join(", ");
    const reste = !charge && window.__pcvEtat?.autonomie?.(p), nom = T("acces.economie");
    const x = { nom, eco: true, sous: charge ? T("eco.sous_charge") : m.economie ? T("eco.activee", { niveau }) : T("eco.desactivee_a", { seuil }) };
    x.l = S.ecoDetail ? [
      ...DETAIL_ECO.map(([k, ic, c, a]) => ({ g: "inter", p: [ic, c], nom: T("eco.l." + k, w), aide: a ? T("eco.l." + k + ".aide") : "", cle: "eco:" + k, val: !!l[k], faire: () => M.regler({ levier: { [k]: !l[k] } }) })),
      { g: "titre", nom: T("eco.en_jeu") },
      {
        g: "liste",
        p: ["manette", "var(--pcv-orange)"],
        nom: T("eco.puissance"),
        aide: l.tdp ? T("eco.puissance.aide", w) : "",
        cle: "eco:jeuW",
        val: watts(l.jeuW),
        faire: () => listeEco(T("eco.puissance"), [0, 12, 10, 8].map((n) => [n, watts(n)]), l.jeuW, (n) => M.regler({ levier: { jeuW: n } }))
      },
      {
        g: "liste",
        p: ["images", "#8b5cf6"],
        nom: T("eco.images"),
        aide: "",
        cle: "eco:jeuIps",
        val: ips(l.jeuIps),
        faire: () => listeEco(T("eco.images"), [0, 40, 30].map((n) => [n, ips(n)]), l.jeuIps, (n) => M.regler({ levier: { jeuIps: n } }))
      }
    ] : [
      {
        g: "resume",
        etat: charge ? "charge" : m.economie ? "actif" : "",
        nom: charge ? T("eco.charge") : m.economie ? T("eco.activee_titre") : nom,
        aide: charge ? T("eco.charge.aide") : m.economie ? ce : T("eco.desactivee_a", { seuil }),
        reste: reste && window.__pcvEtat.duree(reste),
        cle: "eco:on",
        val: !!m.economie,
        indispo: charge,
        faire: () => M.economie(!m.economie)
      },
      { g: "titre", nom: T("eco.niveau") },
      {
        g: "niveau",
        nom: T("eco.niveau"),
        aide: "",
        cle: "eco:niveau",
        choix: NIVEAUX_ECO.map((n) => T("eco.niveau." + n)),
        v: NIVEAUX_ECO.indexOf(r.niveau),
        faire: (i = (Math.max(0, NIVEAUX_ECO.indexOf(r.niveau)) + 1) % NIVEAUX_ECO.length) => M.regler({ niveau: NIVEAUX_ECO[i] })
      },
      { g: "puces", l: [...PUCES_ECO.map((k) => [T("eco.p." + k, w), !!l[k]]), [T("eco.jeux", { v: jeu || ips(0) }), !!jeu]] },
      {
        g: "liste",
        nom: T("eco.auto"),
        aide: "",
        cle: "eco:seuil",
        val: seuil,
        faire: () => listeEco(T("eco.auto_titre"), [0, 10, 15, 20, 30, 50].map((n) => [n, n ? T("eco.pct", { n }) : T("eco.jamais")]), r.seuil, (n) => M.regler({ seuil: n }))
      },
      { g: "inter", nom: T("eco.demander"), aide: "", cle: "eco:demander", val: !!r.demander, faire: () => M.regler({ demander: !r.demander }) },
      { g: "bouton", nom: T("eco.personnaliser"), aide: r.niveau === "perso" ? niveau : "", cle: "eco:perso", val: "", faire: () => detailEco(true) }
    ];
    return x;
  };
  const PICTOS = [
    ["Settings_Updates_Header", "mise-a-jour"],
    ["Settings_Beta_Participation", "trophee"],
    ["Settings_System_Header", "reglages"],
    ["LanguageSettings_Label", "monde"],
    ["Settings_System_About", "info"],
    ["Settings_System_Steam", "manette-steam"],
    ["Settings_System_Hardware", "portable"],
    ["Settings_Internet_Connected_Networks", "wifi"],
    ["Settings_Internet_Networks_Found", "recherche"],
    ["Settings_Bluetooth_Paired", "coche"],
    ["Settings_Display_DisplayScaling_ScalingForTVName", "tuiles-grandes"],
    ["Settings_Display_NightModeSection", "lune"],
    ["Settings_Power_Battery_Title", "alimentation"],
    ["Settings_System_Idle_OnBattery_Section", "pause"],
    ["Settings_System_Idle_PluggedIn_Section", "prise"],
    ["Settings_CEC_Header_Long", "ecran"],
    ["Audio_Header_Output", "volume"],
    ["Audio_Header_Voice", "micro"],
    ["Audio_Header_General", "reglages"],
    ["Settings_Keyboard_ActiveKeyboards", "monde"],
    ["LED_JoystickRing", "soleil"],
    ["Settings_Customization_StartupVideo", "video"],
    ["Settings_Customization_Screensaver", "lune"],
    ["Settings_ScreenReader_Section", "casque"],
    ["Settings_Security_LockScreenSection", "cadenas"],
    ["Settings_InGame_Hotkeys", "manette"],
    ["Settings_InGame_Screenshots", "album"],
    ["Settings_RemotePlay_DeviceName", "portable"],
    ["Settings_RemotePlay_AdvancedClientHeader", "outil"],
    ["Settings_Account_VAC_LearnMore", "aide"],
    ["AppProperties_GameRecording", "video"],
    ["Settings_Profiling_Title", "perf"],
    ["Settings_System_Devkit", "outil"],
    ["Settings_SteamPlay_SteamPlay", "lecture"],
    ["Settings_Developer_WiFi_Title", "wifi"],
    ["AppProperties_Customization_MiscSection", "plus"],
    ["Settings_System_SteamInput", "manette-steam"],
    ["GameInfoDialog_PlayerTime", "horloge"],
    ["GuidedTour_ParentalControls_Title_LGS", "bouclier"]
  ];
  const TEINTES = ["--c-aide", "--c-applis", "--c-confid", "--c-contrib", "--c-import"];
  const tuileIc = {};
  const pastille = (x, i) => {
    if (x.eco) return ["var(--pcv-vert)", "feuille"];
    const t = choisie(), m = i === 0 && x.nom === plat(t?.textContent) && t.querySelector("{{PageListItem_Icon@PageListItem_Title}}");
    const st = m && (tuileIc[S.og] ??= (({ maskImage, backgroundColor }) => ({ maskImage, backgroundColor }))(getComputedStyle(m, "::before")));
    if (st && st.maskImage !== "none") return [st.backgroundColor, `<b class="masque" style="--m:${esc(st.maskImage)}"></b>`];
    const p = PICTOS.find(([j]) => B()?.texteSteam?.(j) === x.nom)?.[1];
    return p ? [`var(${TEINTES[i % TEINTES.length]})`, p] : ["var(--c-autres)", "outil"];
  };
  document.getElementById("pcv-parametres")?.remove();
  document.getElementById("pcv-parametres-style")?.remove();
  const page = document.createElement("div");
  page.id = "pcv-parametres";
  page.hidden = true;
  page.innerHTML = `<div class="panneau"><div class="colonne"></div><div class="droite"><div class="fil" hidden></div><div class="contenu"></div></div></div>`;
  document.body.appendChild(page);
  const colonne = page.querySelector(".colonne"), fil = page.querySelector(".fil"), contenu = page.querySelector(".contenu");
  const P = "#pcv-parametres";
  const R = ":is(#pcv-rangee, [data-pcv-rangee])";
  document.head.insertAdjacentHTML("beforeend", `<style id="pcv-parametres-style">
    
    
    
    body[data-pcv-page=parametres] .PageListColumn:not(#pcv-rangee), body[data-pcv-page=parametres]:not([data-pcv-param=dehors]) .DialogContentTransition { display: none !important; }
    body:not([data-pcv-page=parametres]) #pcv-rangee-cadre, body[data-pcv-param=ecran] #pcv-rangee-cadre { display: none !important; }
    
    #pcv-rangee-cadre { --u: calc(100vh / 800); position: fixed; left: 0; right: 0; top: 0; height: calc(var(--u) * 330); z-index: 500; pointer-events: none; font-family: var(--pcv-police); }
    #pcv-rangee { pointer-events: auto; touch-action: pan-y; }
    
    ${R} > * { position: relative !important; overflow: clip !important; }   
    ${R} > * > * { position: absolute !important; left: 0 !important; top: calc(var(--u) * 16) !important; margin: 0 !important; width: calc(var(--u) * 150) !important; height: calc(var(--u) * 150) !important; border-radius: calc(var(--u) * 39) !important; will-change: transform; }
    ${R} {{PageListItem_Icon@PageListItem_Title}} { width: calc(var(--u) * 82) !important; height: calc(var(--u) * 82) !important; }
    ${R} {{PageListItem_Icon@PageListItem_Title}}::before { width: calc(var(--u) * 45); height: calc(var(--u) * 45); }
    ${R} {{PageListItem_Icon@PageListItem_Title}}:has(.pcv-marque-relief) { background: none !important; box-shadow: none !important; border-radius: 0 !important; }
    ${R} {{PageListItem_Icon@PageListItem_Title}}:has(.pcv-marque-relief)::before,
    ${R} .pcv-marque-relief::before, ${R} .pcv-marque-relief::after { content: none; }
    ${R} .pcv-marque-relief { --pcv-relief-taille: calc(var(--u) * 82); --pcv-relief-teinte: var(--pcv-relief-franc); }
    ${R} {{PageListItem_Icon@PageListItem_Title}} .pcv-marque-relief > svg { display: block !important; }
    ${R} {{PageListItem_Icon@PageListItem_Title}}:has(.pcv-marque-relief) > svg { display: none !important; }   
    
    ${R} [role=tab] > .pcv-icone-onglet { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
    ${R} [role=tab]:has(> .pcv-icone-onglet)::before, ${R} [role=tab]:has(> .pcv-icone-onglet)::after { content: none !important; }
    ${R} [role=tab] > div { display: contents !important; }   
    
    ${R} > {{PagedSettingsDialog_Title@PagedSettingsDialog_PageList}} { position: absolute !important; left: 0 !important; right: 0 !important; top: calc(var(--u) * -62) !important; height: calc(var(--u) * 40) !important;
      margin: 0 !important; padding: 0 calc(var(--u) * 200) !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important;
      font-size: calc(var(--u) * 22) !important; font-weight: 900 !important; color: var(--pcv-texte) !important; white-space: nowrap !important; text-overflow: ellipsis !important; }
    ${R} {{PageListItem_Title@PageListItem_Icon}} { display: block !important; position: absolute !important; top: calc(100% + var(--u) * 12) !important; left: 50% !important; transform: translateX(-50%) !important;
      width: max-content !important; font-size: calc(var(--u) * 22) !important; font-weight: 900 !important; color: var(--pcv-texte) !important; opacity: 0; }
    ${R} {{Active@PagedSettingsDialog_PageListItem}} {{PageListItem_Title@PageListItem_Icon}} { opacity: 1; }
    ${P} .droite { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: calc(var(--u) * 8); }
    ${P} :is(.colonne, .contenu) { scrollbar-width: none; } ${P} :is(.colonne, .contenu)::-webkit-scrollbar { display: none; }
    ${P} .pastille > .masque { display: block; width: 100%; height: 100%; background: currentColor; -webkit-mask: var(--m) center / contain no-repeat; mask: var(--m) center / contain no-repeat; }
    ${P} .fil { flex: none; display: flex; gap: calc(var(--u) * 8); padding: 0 calc(var(--u) * 8); font-size: calc(var(--u) * 15); font-weight: 900; color: var(--t2); }
    ${P} .fil b { color: var(--pcv-texte); } ${P} .fil[hidden] { display: none; }
    ${P} .contenu { gap: var(--pcv-ecart-choix); } ${P} .contenu > * { flex: none; }
    ${P} .ligne { height: auto; min-height: var(--pcv-ligne-h); border-radius: var(--pcv-ligne-rayon); padding: var(--pcv-ligne-marge);   
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); color: var(--pcv-texte); font-size: var(--pcv-ligne-texte); font-weight: 900; }
    ${P} .ligne .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--pcv-ligne-interligne); }
    ${P} .ligne .txt small { font-size: var(--pcv-ligne-petit); font-weight: 800; color: var(--t2); }
    ${P} .ligne .val { flex: none; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 800; color: var(--t2); }
    ${P} .ligne .val.btn { padding: calc(var(--u) * 8) calc(var(--u) * 18); border-radius: 999px; background: var(--pcv-creux, rgba(0,0,0,.06)); color: var(--pcv-texte); }
    ${P} .ligne .val.liste::after { content: ""; display: inline-block; margin-left: calc(var(--u) * 8); border: calc(var(--u) * 6) solid transparent; border-top-color: currentColor; transform: translateY(25%); }
    ${P} .ligne .chevron { flex: none; width: calc(var(--u) * 12); height: calc(var(--u) * 12); border: solid currentColor; border-width: calc(var(--u) * 3.5) calc(var(--u) * 3.5) 0 0; transform: rotate(45deg); margin-right: calc(var(--u) * 6); color: var(--t2); }
    ${P} .ligne.retour .chevron { transform: rotate(-135deg); }
    ${P} .ligne .coche { flex: none; width: calc(var(--u) * 30); height: calc(var(--u) * 30); border-radius: 50%; box-shadow: inset 0 0 0 calc(var(--u) * 3) var(--t2); }
    ${P} .ligne .coche.oui { background: var(--pcv-cyan); box-shadow: inset 0 0 0 calc(var(--u) * 8) color-mix(in srgb, var(--pcv-cyan-plein) 35%, #fff); }
    ${P} .ligne input[type=range] { flex: 0 0 34%; accent-color: var(--pcv-cyan-plein); }
    
    ${P} .dessin { flex: none; width: calc(var(--u) * 112); height: calc(var(--u) * 112); margin: calc(var(--u) * -14) 0; color: var(--pcv-orange); }
    ${P} .ligne:has(.dessin) { padding-left: calc(var(--u) * 14); } ${P} .ligne:has(.dessin) .txt { font-size: calc(var(--u) * 22); }
    ${P} .ligne:has(.dessin) .txt small { font-size: calc(var(--u) * 15); }
    ${P} .tete-manette { display: flex; align-items: center; gap: calc(var(--u) * 20); padding: 0 calc(var(--u) * 8); font-size: calc(var(--u) * 26); font-weight: 900; color: var(--pcv-texte); }
    ${P} .tete-manette .dessin { width: calc(var(--u) * 180); height: calc(var(--u) * 180); margin: calc(var(--u) * -28) 0; }
    ${P} .titre { margin: var(--pcv-intertitre-marge); font-size: var(--pcv-intertitre); font-weight: 900; color: var(--t2); }
    ${P} .titre:first-child { margin-top: 0; }
    
    ${P} .ligne .pastille.claire { width: var(--pcv-ligne-pastille); height: var(--pcv-ligne-pastille); padding: calc(var(--u) * 8); background: var(--pcv-pastille); color: var(--c); box-shadow: var(--pcv-pastille-ombre); }
    
    ${P} .ligne.resume { border-radius: calc(var(--u) * 26); gap: calc(var(--u) * 18); padding: calc(var(--u) * 14) calc(var(--u) * 22) calc(var(--u) * 14) calc(var(--u) * 16); }
    ${P} .ligne.resume.actif { background: linear-gradient(180deg, color-mix(in srgb, var(--pcv-vert) 6%, var(--pcv-verre-haut)), color-mix(in srgb, var(--pcv-vert) 13%, var(--pcv-verre-bas)));
      box-shadow: var(--pcv-reflet), 0 calc(var(--u) * 8) calc(var(--u) * 22) color-mix(in srgb, var(--pcv-vert) 18%, transparent), inset 0 0 0 calc(var(--u) * 2) color-mix(in srgb, var(--pcv-vert) 35%, transparent); }
    ${P} .resume .grosse-feuille { flex: none; width: calc(var(--u) * 64); height: calc(var(--u) * 64); border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--pcv-pastille); box-shadow: var(--pcv-pastille-ombre); color: var(--pcv-vert); }
    ${P} .resume .grosse-feuille svg { width: calc(var(--u) * 40); height: calc(var(--u) * 40); }
    ${P} .resume .grosse-feuille svg path:first-child { fill: currentColor; } ${P} .resume .grosse-feuille svg path + path { stroke: var(--pcv-sur-accent); stroke-width: 2; }
    ${P} .resume.charge .grosse-feuille { color: #d99600; } ${P} .resume.charge .grosse-feuille svg { width: calc(var(--u) * 34); height: calc(var(--u) * 34); }
    ${P} .resume .txt { gap: calc(var(--u) * 2); } ${P} .resume .txt b { font-size: calc(var(--u) * 21); font-weight: 900; }
    ${P} .resume .txt span { font-size: calc(var(--u) * 15); font-weight: 800; color: var(--t2); } ${P} .resume.actif .txt span { color: var(--pcv-vert-texte); }
    ${P} .resume .reste { flex: none; text-align: right; font-size: calc(var(--u) * 13); font-weight: 800; line-height: 1.15; color: var(--t2); }
    ${P} .resume .reste b { display: block; font-size: calc(var(--u) * 24); font-weight: 900; color: var(--pcv-texte); }
    ${P} .resume.charge .inter { opacity: .6; } ${P} .resume + .titre { margin-top: calc(var(--u) * 2); }
    
    ${P} .ligne.niveaux { display: flex; min-height: 0; gap: calc(var(--u) * 8); padding: calc(var(--u) * 6); border-radius: 999px; background: var(--pcv-creux); box-shadow: inset 0 calc(var(--u) * 2) calc(var(--u) * 4) rgba(40,60,90,.12); }
    ${P} .ligne.niveaux.f { box-shadow: inset 0 calc(var(--u) * 2) calc(var(--u) * 4) rgba(40,60,90,.12) !important; }
    ${P} .niveaux > span { flex: 1; text-align: center; padding: calc(var(--u) * 10) 0; border-radius: 999px; font-size: calc(var(--u) * 16); font-weight: 900; color: var(--t2); }
    ${P} .niveaux > .oui { background: var(--pcv-cyan); color: var(--pcv-sur-accent); box-shadow: 0 calc(var(--u) * 4) calc(var(--u) * 10) color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    ${P} .niveaux.f > .oui { box-shadow: 0 0 0 calc(var(--u) * 3) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * 7) var(--pcv-cyan-plein), 0 calc(var(--u) * 4) calc(var(--u) * 10) color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    
    ${P} .puces { display: flex; flex-wrap: wrap; gap: calc(var(--u) * 8); padding: calc(var(--u) * 2) calc(var(--u) * 4); }
    ${P} .puce { display: flex; align-items: center; gap: calc(var(--u) * 7); padding: calc(var(--u) * 6) calc(var(--u) * 12) calc(var(--u) * 6) calc(var(--u) * 7); border-radius: 999px; font-size: calc(var(--u) * 14); font-weight: 900; background: var(--pcv-carte); box-shadow: var(--pcv-reflet); }
    ${P} .puce i { font-style: normal; width: calc(var(--u) * 22); height: calc(var(--u) * 22); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: calc(var(--u) * 14); color: var(--pcv-sur-accent); background: var(--pcv-vert); }
    ${P} .puce.non { color: var(--pcv-texte3); } ${P} .puce.non i { background: color-mix(in srgb, var(--pcv-texte3) 45%, var(--pcv-carte)); }
  </style>`);
  let avantLignes = "", avantColonne = "", vues = [];
  const dessiner = () => {
    const sp = sousPage(), f = sp ? `${esc(plat(choisie()?.textContent))}<span>\u203A</span><b>${esc(S.sous)}</b>` : "";
    if (fil.innerHTML !== f) {
      fil.innerHTML = f;
      fil.hidden = !f;
    }
    if (S.doigt) return;
    let v, neuf = false;
    if (sp) v = lignes(false);
    else {
      const g = groupes();
      if (!g) return;
      const ie = S.ecoVoulu ? g.findIndex((x) => x.eco) : -1;
      if (ie >= 0) Object.assign(S, { ecoVoulu: false, grp: ie, cur: 0, zone: "lignes", manette: true });
      S.grp = Math.min(S.grp, g.length - 1);
      v = g[S.grp]?.l || [];
      const m = g.map((x, i) => window.__pcvOnglet("g:" + i, false, ...pastille(x, i), esc(x.nom), esc(x.sous ?? x.l.filter((y) => y.g !== "titre").slice(0, 2).map((y) => y.nom).join(", ")))).join("");
      if (m !== avantColonne) {
        colonne.innerHTML = avantColonne = m;
        neuf = true;
      }
      const ch = colonne.children[S.grp];
      if (neuf || !ch?.classList.contains("choisi")) {
        for (const e of colonne.children) e.classList.toggle("choisi", e === ch);
        curseur(false);
      }
    }
    if (!v) return;
    vues = v;
    const h = (sp && S.dessin ? `<div class="tete-manette"><span class="dessin">${S.dessin}</span><b>${esc(S.sous)}</b></div>` : "") + v.map(ligneHtml).join("");
    if (h !== avantLignes) {
      contenu.innerHTML = avantLignes = h;
      curseur(false);
      neuf = true;
    }
    if (S.entre) {
      window.__pcvPresentation.entrer(page, S.entree = S.entre);
      S.entre = "";
    } else if (neuf && S.entree) window.__pcvPresentation.entrer(page, S.entree, false, true);
    return true;
  };
  const ico = (n) => window.__pcvIcones?.svg(n, { attrs: 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"' }) || "";
  const ligneHtml = (x, i) => x.g === "titre" ? `<div class="titre">${esc(x.nom)}</div>` : x.g === "puces" ? `<div class="puces">${x.l.map(([t, on]) => `<span class="puce${on ? "" : " non"}"><i>${on ? "\u2713" : "\u2013"}</i>${esc(t)}</span>`).join("")}</div>` : x.g === "niveau" ? `<div class="ligne niveaux" data-a="l:${i}">${x.choix.map((c, k) => `<span data-i="${k}"${k === x.v ? ' class="oui"' : ""}>${esc(c)}</span>`).join("")}</div>` : x.g === "resume" ? `<button class="bouton ligne resume${x.etat ? " " + x.etat : ""}${x.val ? " oui" : ""}" data-a="l:${i}"><span class="grosse-feuille">${ico(x.etat === "charge" ? "eclair" : "feuille")}</span><span class="txt"><b>${esc(x.nom)}</b><span>${esc(x.aide)}</span></span>${x.reste ? `<span class="reste">${esc(T("eco.reste"))}<b>${esc(x.reste)}</b></span>` : ""}<span class="inter"></span></button>` : `<button class="bouton ligne${x.retour ? " retour" : ""}${x.g === "inter" && x.val ? " oui" : ""}" data-a="l:${i}">` + (x.p ? `<span class="pastille claire" style="--c:${x.p[1]}">${ico(x.p[0])}</span>` : "") + (x.dessin ? `<span class="dessin">${x.dessin}</span>` : "") + `<span class="txt">${esc(x.nom)}${x.aide ? `<small>${esc(x.aide)}</small>` : ""}</span>` + (x.g === "inter" ? `<span class="inter"></span>` : x.g === "curseur" ? `<input type="range" min="${x.min}" max="${x.max}" step="any" value="${x.val}" tabindex="-1">` : x.g === "liste" ? `<span class="val liste">${esc(x.val)}</span>` : x.g === "bouton" && x.val ? `<span class="val btn">${esc(x.val)}</span>` : x.g === "radio" ? `<span class="coche${x.val ? " oui" : ""}"></span>` : x.g === "ouvrir" || x.g === "bouton" ? `<i class="chevron"></i>` : x.val ? `<span class="val">${esc(x.val)}</span>` : "") + `</button>`;
  const cibles = () => [...contenu.querySelectorAll(".ligne")];
  const curseur = (suivre = true) => {
    [...page.querySelectorAll(".f, [data-pcv-vise]"), ...rangee?.querySelectorAll("[data-pcv-vise]") || []].forEach((e2) => {
      e2.classList.remove("f");
      e2.removeAttribute("data-pcv-vise");
    });
    const z = S.manette ? S.zone : "";
    if ((document.body.dataset.pcvParamZone || "") !== z) document.body.dataset.pcvParamZone = z;
    window.__pcvSteamLegende?.(S.manette && S.zone === "lignes" && cibles()[S.cur]?.classList.contains("niveaux") ? "eco-niveau" : "parametres");
    const autre = [window.__pcvSteamU, window.__pcvStockage].find((x) => x?.ouvert?.());
    if (autre ? autre.etat().zone === "onglet" : S.zone === "tuiles") rangee?.__active?.setAttribute("data-pcv-vise", "");
    if (autre || S.zone === "tuiles") return;
    const e = S.zone === "colonne" ? colonne.querySelector(".choisi") : cibles()[S.cur];
    if (!e) return;
    e.setAttribute("data-pcv-vise", "");
    if (!S.manette) return;
    e.classList.add("f");
    if (suivre) window.__pcvSuivre?.(e) || e.scrollIntoView({ block: "nearest" });
  };
  const choisirGroupe = (i) => {
    if (i === S.grp) return;
    S.grp = i;
    S.cur = 0;
    S.ecoDetail = false;
    S.entre = ".contenu > *";
    son("bouge");
    contenu.scrollTop = 0;
    dessiner();
  };
  const ligneDe = (e) => vues[+e.dataset.a.slice(2)];
  const ouvrirDehors = () => {
    son("choisir");
    S.dehors = chemin();
    maj();
  };
  const agir = (x, manette) => {
    if (!x) return;
    if (x.indispo) return son("bord");
    if (x.g === "curseur") return;
    if (x.g === "texte") return son("bord");
    if (x.g !== "ouvrir") son("choisir");
    if (x.g === "bouton" || x.g === "action") {
      S.sous = x.nom;
      S.dessin = x.dessin || "";
    }
    x.faire();
    if (x.g !== "ouvrir") [150, 500].forEach((ms) => setTimeout(dessiner, ms));
  };
  page.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b || e.target.matches("input")) return;
    S.manette = false;
    if (b.dataset.a.startsWith("g:")) {
      if (+b.dataset.a.slice(2) === S.grp && S.ecoDetail) return detailEco(false);
      choisirGroupe(+b.dataset.a.slice(2));
      S.zone = "colonne";
      curseur();
      return;
    }
    S.zone = "lignes";
    S.cur = cibles().indexOf(b);
    const x = ligneDe(b), k = e.target.closest("[data-i]");
    if (x?.g === "niveau" && k) {
      son("choisir");
      x.faire(+k.dataset.i);
      dessiner();
      curseur();
      return;
    }
    agir(x);
    curseur();
  });
  page.addEventListener("pointerdown", (e) => {
    if (e.target.matches("input")) S.doigt = true;
  });
  addEventListener("pointerup", () => {
    if (S.doigt) {
      S.doigt = false;
      setTimeout(dessiner, 300);
    }
  }, true);
  let envoi = null, envoiR = 0;
  page.addEventListener("input", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    envoi = [ligneDe(b), +e.target.value];
    envoiR ||= requestAnimationFrame(() => {
      envoiR = 0;
      envoi[0]?.faire(envoi[1]);
    });
  });
  const versTuiles = () => {
    S.zone = "tuiles";
    window.__pcvNoeud?.(choisie())?.BTakeFocus?.(4);
    curseur();
  };
  const vers = (z) => {
    S.zone = z;
    son(z === "lignes" ? "bouge" : "retour");
    curseur();
  };
  (window.__pcvManette ||= {}).parametres = (b) => {
    if (!ouvert() || S.og === STOCKAGE) return false;
    if (natif() && !S.dehors) {
      const p = [...document.querySelectorAll(".DialogContentTransition .Focusable")].filter((e) => e.getBoundingClientRect().height > 1), f = document.querySelector(".DialogContentTransition .gpfocus");
      if (!f) {
        S.zone = "tuiles";
        if (b === 10 || b === 1) {
          if (!p[0]) return son("bord"), true;
          S.manette = true;
          son("bouge");
          window.__pcvNoeud?.(p[0])?.BTakeFocus?.(4);
          return true;
        }
      } else {
        S.zone = "";
        S.manette = true;
        curseur();
        const h = f.getBoundingClientRect().top;
        if (b === 9 && !p.some((e) => e.getBoundingClientRect().bottom <= h + 1)) {
          son("bouge");
          versTuiles();
          return true;
        }
        if (b === 2 && !sousPage()) {
          son("retour");
          versTuiles();
          return true;
        }
        if ([1, 2, 9, 10, 11, 12].includes(b)) return false;
      }
    }
    if (S.dehors) {
      if (b !== 2 || sousPage()) return false;
      S.dehors = null;
      son("retour");
      maj();
      return true;
    }
    if ((b === 5 || b === 6) && rangee?.isConnected) return nav.tenir(b);
    if (b === 3 || b === 7 || b === 8) {
      son("bord");
      return true;
    }
    if (b < 1 || b > 2 && b < 9 || b > 12) return false;
    S.manette = true;
    const c = cibles(), sp = sousPage(), n = colonne.querySelectorAll(".onglet").length;
    if (S.zone === "tuiles") {
      if (b === 2) {
        son("retour");
        O.__pcvAller?.("accueil");
        return true;
      }
      if (!nav.dans(b)) son("bord");
      return true;
    }
    if (S.zone === "colonne") {
      if (b === 2 || b === 9 && S.grp === 0) {
        son("retour");
        versTuiles();
        return true;
      }
      if (b === 9 || b === 10) {
        const i = S.grp + (b === 10 ? 1 : -1);
        if (i >= 0 && i < n) {
          choisirGroupe(i);
          curseur();
        } else son("bord");
        return true;
      }
      if ((b === 12 || b === 1) && c.length) {
        S.cur = 0;
        vers("lignes");
        return true;
      }
      son("bord");
      return true;
    }
    const x = c[S.cur] && ligneDe(c[S.cur]);
    if (b === 2 && sp) {
      son("retour");
      B()?.revenirA?.(cle(choisie()));
      return true;
    }
    if (b === 2 && S.ecoDetail && x?.cle?.startsWith("eco:")) {
      son("retour");
      detailEco(false);
      return true;
    }
    if ((b === 11 || b === 12) && x?.g === "niveau") {
      const i = (x.v < 0 ? 1 : x.v) + (b === 12 ? 1 : -1);
      if (i < 0 || i >= x.choix.length) {
        son("bord");
        return true;
      }
      son("bouge");
      x.faire(i);
      dessiner();
      return true;
    }
    if (b === 2 || b === 11 && x?.g !== "curseur" && !sp) {
      vers("colonne");
      return true;
    }
    if (b === 9 || b === 10) {
      const i = S.cur + (b === 10 ? 1 : -1);
      if (i >= 0 && i < c.length) {
        S.cur = i;
        son("bouge");
        curseur();
      } else if (b === 9 && sp) {
        son("bouge");
        versTuiles();
      } else son("bord");
      return true;
    }
    if ((b === 11 || b === 12) && x?.g === "curseur") {
      const v = Math.max(x.min, Math.min(x.max, x.val + (b === 12 ? 1 : -1) * x.pas));
      x.faire(v);
      x.val = v;
      const r = c[S.cur].querySelector("input");
      if (r) r.value = v;
      son("bouge");
      setTimeout(dessiner, 300);
      return true;
    }
    if (b === 1) {
      window.__pcvAppui?.(c[S.cur]);
      agir(x, true);
      return true;
    }
    return true;
  };
  let sale = true, lu = 0;
  const maj = () => {
    const dejaLa = S.route;
    S.route = document.body.dataset.pcvPage === "parametres";
    const ENTREE = ".colonne > *, .contenu > *";
    if (S.route && !dejaLa) {
      S.grp = S.cur = 0;
      contenu.scrollTop = 0;
      sale = true;
    }
    if (S.dehors && (!ouvert() || /^\/settings\/[^/]+$/.test(chemin()) && chemin() !== S.dehors)) S.dehors = null;
    const t = choisie(), k = t ? cle(t) : "";
    if (k && k !== S.og) {
      sale = true;
      S.og = k;
      S.grp = S.cur = 0;
      avantLignes = "";
      if (S.zone === "lignes") S.zone = "colonne";
      if (dejaLa) S.entre = ENTREE;
    }
    if (!sousPage()) {
      if (S.sous && S.zone === "lignes") S.cur = 0;
      S.sous = S.dessin = "";
    }
    if (S.route) recopier();
    const c = couvre(), m = c ? "couvre" : S.dehors || ouvert() && natif() ? "dehors" : S.route && ecran() ? "ecran" : "";
    if ((document.body.dataset.pcvParam || "") !== m) document.body.dataset.pcvParam = m;
    if (c === page.hidden) {
      page.hidden = !c;
      if (c) {
        sale = true;
        avantLignes = "";
        S.zone = "tuiles";
        S.manette = false;
        curseur();
        if (dejaLa) S.entre = ENTREE;
      }
    }
    const t0 = performance.now();
    if (c && (sale || t0 - lu > 2e3) && dessiner()) {
      sale = false;
      lu = t0;
    }
    if (!c) window.__pcvStockage?.veiller?.();
  };
  const rafraichir = () => {
    sale = true;
    maj();
  };
  window.__pcvParametresQuitter?.();
  window.__pcvParametresQuitter = B()?.ecouterPages?.(() => requestAnimationFrame(rafraichir));
  clearInterval(window.__pcvParametresVeille);
  window.__pcvParametresVeille = setInterval(maj, 400);
  maj();
  const aller = (t) => {
    const c = t && rangee?.isConnected && rangee.querySelector(`[data-pcv-de="${CSS.escape(t.id)}"]`);
    if (c) allerA(c);
    return !!c;
  };
  const ouvrirEco = () => {
    Object.assign(S, { ecoVoulu: true, ecoDetail: false });
    B()?.navigate?.("Power");
    rafraichir();
  };
  window.__pcvParametres = { ouvert, couvre, etat: () => ({ ...S }), lignes: () => vues, rafraichir, rangee: () => rangee, voisine, aller, anneau: () => curseur(false), ouvrirEco };
  return "appli Param\xE8tres : pr\xEAte";
})();
