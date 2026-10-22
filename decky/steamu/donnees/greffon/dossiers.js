(() => {
  window.__pcvDossiersFin?.();
  const fins = [];
  window.__pcvDossiersFin = () => fins.splice(0).forEach((f) => {
    try {
      f();
    } catch (e) {
    }
  });
  const css = (s) => s.replace(/(-?\d*\.?\d+)u\b/g, "calc(var(--u) * $1)");
  const echap = (s) => String(s).replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
  const son = (n) => window.__pcvSon?.(n);
  const T = window.__pcvT || ((c) => c);
  const acc = () => window.__pcvGrille;
  const glyphe = (b) => {
    const [t, c, h] = window.__pcvTouche?.(b) || ["?", "var(--pcv-touche-neutre)"];
    return `<u style="background:${c}">${h ?? echap(t)}</u>`;
  };
  const svg = (d) => `<svg viewBox="0 0 24 24" width="62%" height="62%" fill="none" stroke="var(--pcv-sur-accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    dossier: svg('<path d="M3 7.5a2 2 0 0 1 2-2h4l2 2.2h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>'),
    decorer: '<svg viewBox="0 0 24 24" width="64%" height="64%"><path d="M12 2.6l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 16.9l-5.6 2.9 1.1-6.2L3 9.2l6.2-.9z" fill="var(--pcv-sur-accent)"/></svg>',
    nom: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    suppr: svg('<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 10.5v6M14 10.5v6"/>'),
    decoller: svg('<path d="M5 5h10l4 4v10H5z"/><path d="M15 5v4h4"/><path d="M9 13.5l2.5 2.5L16 11"/>')
  };
  const TEINTES = { dossier: "#3fb6ff, #1a8fe0", decorer: "#ffb35c, #ff7a1f", nom: "#7fd17f, #3aa64a", suppr: "#ff8a8a, #e5484d", decoller: "#c9a4ff, #8a5ce6" };
  const rond = (n, c = {}) => `<u style="background:radial-gradient(circle at 50% 35%, ${c.teinte || TEINTES[n]})">${c.svg ? svg(c.svg) : IC[n]}</u>`;
  const racine = document.createElement("div");
  racine.id = "pcv-dossiers";
  racine.hidden = true;
  racine.innerHTML = `<style>${css(`
    #pcv-dossiers { position: fixed; inset: 98u 0 0 0; z-index: 8620; font-family: var(--pcv-police); color: var(--pcv-texte); user-select: none; -webkit-user-select: none; }
    #pcv-dossiers[hidden] { display: none; }
    #pcv-dossiers * { box-sizing: border-box; }
    #pcv-dossiers button { font: inherit; color: inherit; border: 0; padding: 0; background: none; cursor: pointer; }
    #pcv-dossiers u { text-decoration: none; flex: none; display: inline-flex; align-items: center; justify-content: center; min-width: 26u; height: 26u; padding: 0 5u; border-radius: 13u;
      color: var(--pcv-sur-accent); font-size: 12u; font-weight: 900; }
    #pcv-dossiers .voile { position: absolute; inset: 0; background: rgba(30,40,60,0); transition: background .2s; }
    #pcv-dossiers.boite-ouverte .voile { background: rgba(30,40,60,.32); }
    
    #pcv-dossiers .menu { z-index: 1; position: fixed; left: 0; top: 0; min-width: 270u; padding: 8u; border-radius: 24u; display: none; flex-direction: column; gap: 6u;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 14u 34u rgba(30,50,80,.3); transform-origin: var(--ox, 0) 50%; }
    #pcv-dossiers .menu.on { display: flex; animation: pcvDosMenu .26s cubic-bezier(.3,1.5,.5,1) both; }
    @keyframes pcvDosMenu { from { opacity: 0; transform: scale(.7) } }
    #pcv-dossiers .menu button { display: flex; align-items: center; gap: 12u; height: 54u; padding: 0 20u 0 9u; border-radius: 18u; font-size: 19u; font-weight: 800; text-align: left; white-space: nowrap; }
    #pcv-dossiers .menu button u { width: 38u; height: 38u; border-radius: 50%; }
    #pcv-dossiers .menu button.k { background: var(--pcv-carte); box-shadow: 0 0 0 3u var(--pcv-anneau-c), 0 0 0 7u var(--pcv-cyan-plein); }
    
    #pcv-dossiers .carte { position: absolute; left: 50%; top: 150u; width: 600u; margin-left: -300u; padding: 24u 28u 22u; border-radius: 32u; display: none;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 20u 50u rgba(20,40,70,.35); }
    #pcv-dossiers .carte.on { display: block; animation: pcvDosCarte .3s cubic-bezier(.3,1.4,.5,1) both; }
    @keyframes pcvDosCarte { from { opacity: 0; transform: translateY(24u) scale(.94) } }
    #pcv-dossiers .carte.tremble { animation: pcvDosNon .3s; }
    @keyframes pcvDosNon { 25% { transform: translateX(-10u) } 75% { transform: translateX(10u) } }
    #pcv-dossiers .t { display: flex; align-items: center; gap: 12u; font-size: 24u; font-weight: 900; }
    #pcv-dossiers .t u { width: 42u; height: 42u; border-radius: 50%; }
    #pcv-dossiers .t span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #pcv-dossiers p { margin: 14u 0 0; font-size: 17u; font-weight: 700; color: var(--pcv-texte2); line-height: 1.45; }
    #pcv-dossiers input { display: block; width: 100%; height: 62u; margin-top: 18u; padding: 0 20u; border-radius: 18u; border: 0; outline: 0; font: inherit; font-size: 26u; font-weight: 800;
      color: var(--pcv-texte); background: var(--pcv-carte); box-shadow: inset 0 2u 5u rgb(from var(--pcv-ombre-c) r g b / .18), 0 0 0 3u color-mix(in srgb, var(--pcv-carte) 90%, transparent); user-select: text; -webkit-user-select: text; }
    #pcv-dossiers input:focus { box-shadow: inset 0 2u 5u rgb(from var(--pcv-ombre-c) r g b / .18), 0 0 0 3u var(--pcv-anneau-c), 0 0 0 7u var(--pcv-cyan-plein); }
    #pcv-dossiers .reste { margin-top: 8u; text-align: right; font-size: 14u; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-dossiers .bts { display: flex; justify-content: flex-end; gap: 12u; margin-top: 20u; }
    
    #pcv-dossiers .bts button { display: flex; align-items: center; gap: 9u; height: 50u; padding: 0 22u 0 10u; border-radius: 25u; font-size: 18u; font-weight: 900; color: var(--pcv-texte);
      background: var(--pcv-verre); box-shadow: inset 0 2u 0 var(--pcv-reflet-haut), inset 0 -3u 0 var(--pcv-reflet-bas), 0 3u 0 rgb(from var(--pcv-ombre-c) r g b / .22); }
    #pcv-dossiers .bts button.oui { background: var(--pcv-cyan); color: var(--pcv-sur-accent); box-shadow: inset 0 2u 0 rgba(255,255,255,.5), 0 3u 0 rgba(20,90,140,.35); }
    #pcv-dossiers .bts button.rouge { background: linear-gradient(180deg, #ff8a8a, #e5484d); box-shadow: inset 0 2u 0 rgba(255,255,255,.45), 0 3u 0 rgba(150,30,40,.35); }
    #pcv-dossiers .bts button.k { outline: 4u solid var(--pcv-anneau-c); outline-offset: 2u; box-shadow: 0 0 0 9u var(--pcv-cyan-plein); }
    
    #pcv-dossiers .carte.dispo { top: 110u; width: 990u; margin-left: -495u; transition: opacity .2s; }
    #pcv-dossiers.par-dessus .carte.dispo { opacity: 0; }   
    #pcv-dossiers .dispo .fen { overflow: hidden; margin: 10u -12u 0; padding: 10u 12u 6u; }
    #pcv-dossiers .dispo .rang { display: flex; gap: 14u; transition: transform .25s cubic-bezier(.3,1.2,.5,1); }
    #pcv-dossiers .dispo .vig { flex: none; width: 176u; display: flex; flex-direction: column; gap: 8u; }
    #pcv-dossiers .dispo .vig i { position: relative; display: block; width: 100%; height: 110u; border-radius: 16u; overflow: hidden; background: var(--pcv-carte); box-shadow: inset 0 2u 5u rgb(from var(--pcv-ombre-c) r g b / .18); transition: transform .15s; }
    #pcv-dossiers .dispo .vig.libre i { background: transparent; box-shadow: inset 0 0 0 3u color-mix(in srgb, var(--pcv-texte2) 35%, transparent); }
    #pcv-dossiers .dispo .vig img { display: block; width: 100%; height: 100%; object-fit: cover; }
    #pcv-dossiers .dispo .vig s { position: absolute; left: 6u; top: 6u; min-width: 24u; height: 24u; padding: 0 6u; border-radius: 12u; display: flex; align-items: center; justify-content: center;
      background: color-mix(in srgb, var(--pcv-texte) 60%, transparent); color: var(--pcv-carte); font-size: 13u; font-weight: 900; text-decoration: none; }
    #pcv-dossiers .dispo .vig em { position: absolute; right: 6u; bottom: 6u; padding: 2u 9u; border-radius: 10u; background: var(--pcv-cyan); color: var(--pcv-sur-accent); font-size: 12u; font-weight: 900; font-style: normal; }
    #pcv-dossiers .dispo .vig b { font-size: 16u; font-weight: 800; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #pcv-dossiers .dispo .vig.libre b { color: var(--pcv-texte2); }
    #pcv-dossiers .dispo .vig.k i { transform: scale(1.04); box-shadow: 0 0 0 3u var(--pcv-anneau-c), 0 0 0 7u var(--pcv-cyan-plein); }
    #pcv-dossiers .dispo .vig.attente i { animation: pcvDosAttente .7s ease-in-out infinite alternate; }
    @keyframes pcvDosAttente { to { opacity: .4 } }
    #pcv-dossiers .dispo p.info { min-height: 24u; margin-top: 8u; }
  `)}</style>
  <div class="voile"></div><div class="menu"></div>
  <div class="carte dispo"><div class="t">${rond("dossier", { svg: window.__pcvIcones.trace("dispositions") })}<span>${T("dispo.titre")}</span></div>
    <div class="fen"><div class="rang"></div></div><p class="info"></p><div class="bts leg"></div></div>
  <div class="carte nom"><div class="t">${rond("nom")}<span>Nom du dossier</span></div>
    <input type="text" spellcheck="false" autocomplete="off" enterkeyhint="done"><div class="reste"></div>
    <div class="bts"><button class="non"></button><button class="oui"></button></div></div>
  <div class="carte sup"><div class="t">${rond("suppr")}<span></span></div><p></p>
    <div class="bts"><button class="non"></button><button class="oui rouge"></button></div></div>`;
  document.body.appendChild(racine);
  fins.push(() => racine.remove());
  const $ = (s) => racine.querySelector(s), menuEl = $(".menu"), champ = $(".nom input");
  let ouvert = null;
  const fermer = (bruit = true) => {
    if (!ouvert) return;
    const sous = ouvert.dessous;
    ouvert = null;
    menuEl.classList.remove("on");
    racine.querySelectorAll(".carte").forEach((e) => e.classList.toggle("on", !!sous && e.classList.contains("dispo")));
    if (document.activeElement === champ) champ.blur();
    if (sous) {
      ouvert = sous;
      racine.classList.remove("par-dessus");
      if (bruit) son("retour");
      return;
    }
    racine.classList.remove("boite-ouverte");
    racine.hidden = true;
    if (bruit) son("retour");
  };
  const montrer = (o) => {
    ouvert = o;
    racine.hidden = false;
    racine.classList.toggle("par-dessus", !!o.dessous && o.genre !== "menu");
  };
  const dessinerMenu = () => menuEl.querySelectorAll("button").forEach((b, k) => b.classList.toggle("k", k === ouvert.k));
  const menu = (i) => {
    const a = acc();
    if (!a) return false;
    const d = a.dossier?.(), deco = !!window.__pcvDeco;
    return choix(i, [
      !d && deco && { ic: "decorer", nom: "D\xE9corer", faire: () => window.__pcvDeco.ouvrir({ case: i }) },
      !d && { ic: "dossier", nom: "Cr\xE9er un dossier", faire: () => creer(i) },
      d && { ic: "nom", nom: "Renommer le dossier", faire: () => renommer(d.id) },
      d?.ec && { ic: "decoller", nom: "D\xE9coller le badge", faire: () => a.decollerDossier?.(d.id) },
      // (le badge collé sur le dossier retourne dans la boîte)
      d && { ic: "suppr", nom: "Supprimer le dossier", faire: () => supprimer(d.id) }
    ].filter(Boolean));
  };
  const choix = (i, choix2, o = {}) => {
    const a = acc();
    if (!a || !choix2.length) return false;
    menuEl.innerHTML = choix2.map((c2, k) => `<button data-k="${k}">${rond(c2.ic, c2)}${echap(c2.nom)}</button>`).join("");
    montrer({ genre: "menu", choix: choix2, k: 0, dessous: o.dessous });
    dessinerMenu();
    const c = (o.pres || a.grille().children[i])?.getBoundingClientRect(), u = innerHeight / 800;
    menuEl.classList.add("on");
    const l = menuEl.offsetWidth, h = menuEl.offsetHeight, droite = !c || c.right + 14 * u + l < innerWidth - 16 * u;
    const x = c ? droite ? c.right + 14 * u : c.left - 14 * u - l : (innerWidth - l) / 2, y = c ? Math.min(Math.max(110 * u, c.top + c.height / 2 - h / 2), innerHeight - h - 20 * u) : 300 * u;
    menuEl.style.left = Math.max(16 * u, x) + "px";
    menuEl.style.top = y + "px";
    menuEl.style.setProperty("--ox", droite ? "0" : "100%");
    son("choisir");
    return true;
  };
  menuEl.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || ouvert?.genre !== "menu") return;
    const c = ouvert.choix[+b.dataset.k];
    fermer(false);
    c.faire();
  });
  const creer = (i) => {
    const a = acc();
    if (!a) return null;
    fermer(false);
    return a.creerDossier(i);
  };
  const clavier = () => {
    if (!window.__pcvClavier?.(champ)) champ.focus();
  };
  champ.addEventListener("click", clavier);
  const reste = () => {
    if (champ.value.length > champ.maxLength) champ.value = champ.value.slice(0, champ.maxLength);
    $(".nom .reste").textContent = `${champ.value.length} / ${champ.maxLength}`;
  };
  const renommer = (id, o) => {
    const d = o || acc()?.dossiers?.().find((x) => x.id === id);
    if (!d) return false;
    champ.maxLength = o?.max || acc().nomMax();
    champ.value = d.nom;
    reste();
    $(".nom .t span").textContent = o?.titre || "Nom du dossier";
    $(".nom .non").innerHTML = `${glyphe(2)}${o?.annuler || "Annuler"}`;
    $(".nom .oui").innerHTML = `${glyphe(1)}${o?.oui || "OK"}`;
    montrer({ genre: "nom", id, ok: o?.ok, dessous: o?.dessous });
    racine.classList.add("boite-ouverte");
    $(".carte.nom").classList.add("on");
    son("choisir");
    clavier();
    champ.select();
    return true;
  };
  const valider = () => {
    if (ouvert?.genre !== "nom") return;
    if (!(ouvert.ok ? ouvert.ok(champ.value.trim()) : acc()?.renommerDossier(ouvert.id, champ.value))) {
      const c = $(".carte.nom");
      c.classList.remove("tremble");
      void c.offsetWidth;
      c.classList.add("tremble");
      son("bord");
      return;
    }
    fermer(false);
    son("choisir");
  };
  champ.addEventListener("input", reste);
  $(".nom .oui").onclick = valider;
  $(".nom .non").onclick = () => fermer();
  const dessinerSup = () => [$(".sup .non"), $(".sup .oui")].forEach((b, k) => b.classList.toggle("k", k === ouvert.k));
  const demander = (o) => {
    $(".sup .t").firstElementChild.outerHTML = rond(o.ic || "suppr", o);
    $(".sup .t span").textContent = o.titre;
    $(".sup p").textContent = o.texte;
    $(".sup .non").innerHTML = `${glyphe(2)}${o.non}`;
    $(".sup .oui").innerHTML = `${glyphe(1)}${o.oui}`;
    $(".sup .oui").classList.toggle("rouge", o.rouge !== false);
    montrer({ genre: "sup", k: o.rouge === false ? 1 : 0, ok: o.ok, dessous: o.dessous });
    racine.classList.add("boite-ouverte");
    $(".carte.sup").classList.add("on");
    dessinerSup();
    son("choisir");
    return true;
  };
  const supprimer = (id) => {
    const d = acc()?.dossiers?.().find((x) => x.id === id);
    if (!d) return false;
    return demander({
      titre: `Supprimer \xAB ${d.nom} \xBB ?`,
      non: "Annuler",
      oui: "Supprimer",
      ok: () => acc()?.supprimerDossier(id),
      texte: d.n ? `${d.n === 1 ? "Ce qu'il contient revient" : `Les ${d.n} \xE9l\xE9ments qu'il contient reviennent`} sur l'accueil, rien n'est perdu.` : "Il est vide."
    });
  };
  const confirmer = () => {
    if (ouvert?.genre !== "sup") return;
    const o = ouvert;
    fermer(false);
    o.ok();
  };
  $(".sup .oui").onclick = confirmer;
  $(".sup .non").onclick = () => fermer();
  $(".voile").addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    fermer();
  });
  const PLACES = 10, NOM_MAX = 20;
  const appel = (m, ...a) => window.opener.DeckyBackend.call("loader/call_plugin_method", window.__pcvGreffon.nom, m, ...a);
  let DD = null, occupe = false;
  const P = { genre: "dispo", k: 0 };
  const actuelle = () => ({ ...acc().disposition(), theme: window.__pcvThemes?.actuel?.() || null });
  const empreinte = (d) => {
    let h = 0;
    const t = JSON.stringify([d.grille, d.zoom, d.theme]);
    for (let i = 0; i < t.length; i++) h = h * 31 + t.charCodeAt(i) | 0;
    return String(h);
  };
  const nomDe = (k) => DD.l[k]?.nom || T("dispo.nom_defaut", { n: k + 1 });
  const ecrireD = () => appel("dispositions_ecrire", DD).then((ok) => {
    if (!ok) throw new Error("dispositions_ecrire");
  });
  const enregistrer = async (k, nom) => {
    const d = actuelle(), ref = empreinte(d);
    d.img = await acc().apercu();
    d.nom = nom || nomDe(k);
    DD.l[k] = d;
    DD.courant = k;
    DD.ref = ref;
    await ecrireD();
  };
  const info = (t) => {
    $(".dispo .info").textContent = t || "";
  };
  const agirSur = async (k, f) => {
    occupe = true;
    vig(k)?.classList.add("attente");
    try {
      await f();
      return true;
    } catch (e) {
      console.error("dispositions", e);
      son("rate");
      info(T("dispo.erreur"));
      return false;
    } finally {
      occupe = false;
      vig(k)?.classList.remove("attente");
    }
  };
  const vig = (k) => $(".dispo .rang").children[k];
  const vignettes = () => {
    $(".dispo .rang").innerHTML = (DD?.l || []).map((d, k) => `<button class="vig${d ? "" : " libre"}" data-k="${k}"><i>${d?.img ? `<img src="${d.img}">` : ""}<s>${k + 1}</s>${d && k === DD.courant ? `<em>${T("dispo.en_cours")}</em>` : ""}</i><b>${echap(d ? d.nom : T("dispo.libre"))}</b></button>`).join("");
    choisirVig();
  };
  const choisirVig = () => {
    const k = P.k, plein = !!DD?.l[k];
    [...$(".dispo .rang").children].forEach((b, j) => b.classList.toggle("k", j === k));
    $(".dispo .rang").style.transform = `translateX(calc(var(--u) * ${-Math.max(0, Math.min(PLACES - 5, k - 2)) * 190}))`;
    $(".dispo .leg").innerHTML = `<button data-b="2">${glyphe(2)}${T("dispo.fermer")}</button>` + (!DD ? "" : (plein ? `<button data-b="4">${glyphe(4)}${T("dispo.options")}</button>` : "") + `<button data-b="1" class="oui">${glyphe(1)}${T(plein ? "dispo.charger" : "dispo.enregistrer")}</button>`);
  };
  const charger = (k) => agirSur(k, async () => {
    const d = DD.l[k], th = window.__pcvThemes;
    fermer(false);
    son("choisir");
    if (d.theme && th && d.theme !== th.actuel() && th.liste().some((t) => t.id === d.theme)) th.appliquer(d.theme);
    if (!acc().chargerDisposition(d)) throw new Error("grille");
    DD.courant = k;
    DD.ref = empreinte(actuelle());
    await ecrireD();
  });
  const enregistrerIci = (k) => agirSur(k, async () => {
    await enregistrer(k);
    vignettes();
    info(T("dispo.enregistree", { nom: nomDe(k) }));
    son("colle");
  });
  const aDispo = () => {
    const k = P.k, d = DD.l[k];
    info("");
    if (!d) return enregistrerIci(k);
    if (empreinte(actuelle()) === DD.ref && DD.l[DD.courant]) return charger(k);
    const ici = k !== DD.courant && DD.l[DD.courant] ? DD.courant : DD.l.findIndex((x) => !x);
    if (ici < 0) {
      const c = $(".carte.dispo");
      c.classList.remove("tremble");
      void c.offsetWidth;
      c.classList.add("tremble");
      son("rate");
      return info(T("dispo.plus_de_place"));
    }
    demander({
      ic: "dossier",
      svg: window.__pcvIcones.trace("enregistrer"),
      titre: T("dispo.change_titre"),
      texte: T("dispo.change_texte", { ici: nomDe(ici), nom: d.nom }),
      non: T("dispo.annuler"),
      oui: T("dispo.enregistrer_charger"),
      rouge: false,
      dessous: P,
      ok: () => agirSur(ici, () => enregistrer(ici)).then((ok) => ok && charger(k))
    });
  };
  const optionsDispo = () => {
    const k = P.k, d = DD.l[k], tr = window.__pcvIcones.trace;
    choix(-1, [
      { ic: "dossier", svg: tr("enregistrer"), nom: T("dispo.enregistrer_ici"), faire: () => demander({
        ic: "dossier",
        svg: tr("enregistrer"),
        titre: T("dispo.remplacer_titre", { nom: d.nom }),
        texte: T("dispo.remplacer_texte"),
        non: T("dispo.annuler"),
        oui: T("dispo.remplacer"),
        dessous: P,
        ok: () => enregistrerIci(k)
      }) },
      { ic: "nom", svg: tr("crayon"), nom: T("dispo.renommer"), faire: () => renommer(null, {
        nom: d.nom,
        max: NOM_MAX,
        titre: T("dispo.nom"),
        annuler: T("dispo.annuler"),
        oui: T("dispo.ok"),
        dessous: P,
        ok: (n) => {
          if (!n) return false;
          d.nom = n.slice(0, NOM_MAX);
          vignettes();
          agirSur(k, ecrireD);
          return true;
        }
      }) },
      { ic: "suppr", svg: tr("supprimer"), nom: T("dispo.supprimer"), faire: () => demander({
        titre: T("dispo.supprimer_titre", { nom: d.nom }),
        texte: T("dispo.supprimer_texte"),
        non: T("dispo.annuler"),
        oui: T("dispo.supprimer"),
        dessous: P,
        ok: () => {
          DD.l[k] = null;
          if (DD.courant === k) DD.courant = DD.ref = null;
          vignettes();
          agirSur(k, ecrireD);
        }
      }) }
    ], { pres: vig(k), dessous: P });
  };
  const dispositions = async () => {
    if (ouvert || occupe || !acc()?.apercu) return false;
    occupe = true;
    try {
      const r = await appel("dispositions_lire").catch(() => null);
      DD = r?.ok ? { courant: null, ref: null, ...r.d || {} } : null;
      if (DD) DD.l = Array.from({ length: PLACES }, (_, k) => DD.l?.[k] || null);
      P.k = DD?.courant ?? 0;
      montrer(P);
      racine.classList.add("boite-ouverte");
      $(".carte.dispo").classList.add("on");
      vignettes();
      info(DD ? "" : T("dispo.illisible"));
      son("choisir");
      if (DD && !r.d) {
        occupe = false;
        await agirSur(0, () => enregistrer(0, T("dispo.mon_accueil")));
        vignettes();
      }
    } finally {
      occupe = false;
    }
    return true;
  };
  $(".dispo .rang").addEventListener("click", (e) => {
    const b = e.target.closest(".vig");
    if (!b || ouvert !== P || occupe) return;
    if (+b.dataset.k === P.k) aDispo();
    else {
      P.k = +b.dataset.k;
      choisirVig();
      son("bouge");
    }
  });
  $(".dispo .leg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b && ouvert === P) touche(+b.dataset.b);
  });
  const touche = (b) => {
    if (!ouvert) return false;
    if (b === 2) {
      fermer();
      return true;
    }
    if (ouvert.genre === "menu") {
      if (b === 9 || b === 10) {
        const k = ouvert.k + (b === 10 ? 1 : -1);
        if (k < 0 || k >= ouvert.choix.length) son("bord");
        else {
          ouvert.k = k;
          dessinerMenu();
          son("bouge");
        }
      } else if (b === 1) {
        const c = ouvert.choix[ouvert.k];
        fermer(false);
        c.faire();
      }
      return true;
    }
    if (ouvert.genre === "nom") {
      if (b === 1) valider();
      else if (b === 3 || b === 4) clavier();
      return true;
    }
    if (ouvert.genre === "dispo") {
      if (occupe || !DD) return true;
      if (b === 11 || b === 12) {
        const k = ouvert.k + (b === 12 ? 1 : -1);
        if (k < 0 || k >= PLACES) son("bord");
        else {
          ouvert.k = k;
          choisirVig();
          son("bouge");
        }
      } else if (b === 1) aDispo();
      else if (b === 4 && DD.l[ouvert.k]) optionsDispo();
      return true;
    }
    if (b === 11 || b === 12) {
      const k = b === 12 ? 1 : 0;
      if (k !== ouvert.k) {
        ouvert.k = k;
        dessinerSup();
        son("bouge");
      } else son("bord");
    } else if (b === 1) {
      if (ouvert.k) confirmer();
      else fermer();
    }
    return true;
  };
  (window.__pcvManette ||= {}).dossiers = (b) => touche(b);
  const ordre = () => {
    const o = window.__pcvOrdre;
    if (!Array.isArray(o) || o.includes("dossiers")) return;
    const k = ["barre", "deco", "place", "console"].map((n) => o.indexOf(n)).find((x) => x >= 0);
    o.splice(k ?? o.length, 0, "dossiers");
  };
  const clavierPage = (e) => {
    if (!ouvert) return;
    const k = { ArrowUp: 9, ArrowDown: 10, ArrowLeft: 11, ArrowRight: 12, Enter: 1, Escape: 2 }[e.key];
    if (document.activeElement === champ && !(k === 1 || k === 2)) return;
    if (k) touche(k);
    e.stopImmediatePropagation();
    e.preventDefault();
  };
  window.addEventListener("keydown", clavierPage, true);
  fins.push(() => removeEventListener("keydown", clavierPage, true));
  document.querySelector("#pcv-console .pcv-creer-dossier")?.remove();
  const tic = setInterval(() => {
    ordre();
    const c = document.getElementById("pcv-console");
    if (ouvert && (!c || c.hidden)) fermer(false);
  }, 300);
  fins.push(() => {
    clearInterval(tic);
    fermer(false);
    const o = window.__pcvOrdre;
    if (Array.isArray(o) && o.includes("dossiers")) o.splice(o.indexOf("dossiers"), 1);
    delete window.__pcvManette?.dossiers;
  });
  ordre();
  window.__pcvDossiers = { menu, choix, creer, renommer, supprimer, dispositions, modal: () => !!ouvert, fermer: (bruit) => fermer(bruit), etat: () => ouvert && { genre: ouvert.genre, k: ouvert.k } };
  fins.push(() => {
    if (window.__pcvDossiers?.menu === menu) delete window.__pcvDossiers;
  });
  return "dossiers pr\xEAts";
})();
