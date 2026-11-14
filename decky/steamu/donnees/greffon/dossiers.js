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
  const svg = (d) => `<svg viewBox="0 0 24 24" width="62%" height="62%" fill="none" stroke="var(--pcv-sur-accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    dossier: svg('<path d="M3 7.5a2 2 0 0 1 2-2h4l2 2.2h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>'),
    decorer: '<svg viewBox="0 0 24 24" width="64%" height="64%"><path d="M12 2.6l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 16.9l-5.6 2.9 1.1-6.2L3 9.2l6.2-.9z" fill="var(--pcv-sur-accent)"/></svg>',
    nom: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    suppr: svg('<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 10.5v6M14 10.5v6"/>'),
    decoller: svg('<path d="M5 5h10l4 4v10H5z"/><path d="M15 5v4h4"/><path d="M9 13.5l2.5 2.5L16 11"/>')
  };
  const GRIS = "#c3ccd8, #8f9bab";
  const TEINTES = { dossier: "#3fb6ff, #1a8fe0", decorer: "#ffb35c, #ff7a1f", nom: "#7fd17f, #3aa64a", suppr: GRIS, decoller: "#c9a4ff, #8a5ce6", reglages: GRIS };
  const rond = (n, c = {}) => `<u style="background:radial-gradient(circle at 50% 35%, ${c.teinte || TEINTES[n]})">${c.svg ? svg(c.svg) : IC[n]}</u>`;
  const racine = document.createElement("div");
  racine.id = "pcv-dossiers";
  racine.hidden = true;
  racine.innerHTML = `<style>${css(`
    
    #pcv-dossiers { position: fixed; inset: 98u 0 0 0; z-index: 8720; font-family: var(--pcv-police); color: var(--pcv-texte); user-select: none; -webkit-user-select: none; }
    #pcv-dossiers[hidden] { display: none; }
    #pcv-dossiers * { box-sizing: border-box; }
    #pcv-dossiers button { font: inherit; color: inherit; border: 0; padding: 0; background: none; cursor: pointer; }
    #pcv-dossiers u { text-decoration: none; flex: none; display: inline-flex; align-items: center; justify-content: center; min-width: 26u; height: 26u; padding: 0 5u; border-radius: 13u;
      color: var(--pcv-sur-accent); font-size: 12u; font-weight: 900; }
    #pcv-dossiers .voile { position: absolute; inset: 0; background: var(--pcv-voile-fenetre); opacity: 0; transition: opacity .2s; }   
    #pcv-dossiers.boite-ouverte .voile { opacity: 1; }
    
    #pcv-dossiers .menu { z-index: 1; position: fixed; left: 0; top: 0; min-width: 270u; padding: 8u; border-radius: 24u; display: none; flex-direction: column; gap: 6u;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 14u 34u rgba(30,50,80,.3); transform-origin: var(--ox, 0) var(--oy, 50%); }
    #pcv-dossiers .menu.on { display: flex; animation: pcvDosMenu .26s cubic-bezier(.3,1.5,.5,1) both; }
    @keyframes pcvDosMenu { from { opacity: 0; transform: scale(.7) } }
    #pcv-dossiers .menu button { display: flex; align-items: center; gap: 12u; height: 54u; padding: 0 20u 0 9u; border-radius: 18u; font-size: 19u; font-weight: 800; text-align: left; white-space: nowrap; }
    #pcv-dossiers .menu button u { width: 38u; height: 38u; border-radius: 50%; }
    #pcv-dossiers .menu .leg-bulle { margin-top: 4u; }
    
    #pcv-dossiers .leg-bas { position: fixed; right: 34u; bottom: 24u; z-index: 2; }
    html.pcv-question .pcv-legende { visibility: hidden; } html.pcv-question #pcv-dossiers .pcv-legende { visibility: visible; }
    #pcv-dossiers .menu button.k { background: var(--pcv-carte); box-shadow: 0 0 0 3u var(--pcv-anneau-c), 0 0 0 7u var(--pcv-cyan-plein); }
    
    
    #pcv-dossiers .carte { position: absolute; left: 50%; top: -98u; bottom: 0; height: fit-content; margin: auto 0 auto -300u; width: 600u; padding: 24u 28u 22u; border-radius: 32u; display: none;
      background: var(--pcv-fenetre-fond); box-shadow: var(--pcv-reflet), 0 20u 50u rgba(20,40,70,.35); }
    #pcv-dossiers .carte.on { display: block; }   
    #pcv-dossiers .carte.tremble { animation: pcvDosNon .3s; }
    @keyframes pcvDosNon { 25% { transform: translateX(-10u) } 75% { transform: translateX(10u) } }
    #pcv-dossiers .t { display: flex; align-items: center; gap: 12u; font-size: 24u; font-weight: 900; }
    #pcv-dossiers .t u { width: 42u; height: 42u; border-radius: 50%; }
    #pcv-dossiers .t span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #pcv-dossiers p:empty { display: none; }
    #pcv-dossiers p { margin: 14u 0 0; font-size: 17u; font-weight: 700; color: var(--pcv-texte2); line-height: 1.45; }
    #pcv-dossiers input { display: block; width: 100%; height: 62u; margin-top: 18u; padding: 0 20u; border-radius: 18u; border: 0; outline: 0; font: inherit; font-size: 26u; font-weight: 800;
      color: var(--pcv-texte); background: var(--pcv-carte); box-shadow: inset 0 2u 5u rgb(from var(--pcv-ombre-c) r g b / .18), 0 0 0 3u color-mix(in srgb, var(--pcv-carte) 90%, transparent); user-select: text; -webkit-user-select: text; }
    #pcv-dossiers input:focus { box-shadow: inset 0 2u 5u rgb(from var(--pcv-ombre-c) r g b / .18), 0 0 0 3u var(--pcv-anneau-c), 0 0 0 7u var(--pcv-cyan-plein); }
    #pcv-dossiers .reste { margin-top: 8u; text-align: right; font-size: 14u; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-dossiers .bts { display: flex; justify-content: flex-end; gap: 12u; margin-top: 20u; }
    
    #pcv-dossiers .bts button { display: flex; align-items: center; gap: 9u; height: 56u; padding: 0 30u; border-radius: 28u; font-size: 19u; font-weight: 900; color: var(--pcv-texte);
      background: var(--pcv-verre); box-shadow: inset 0 2u 0 var(--pcv-reflet-haut), inset 0 -3u 0 var(--pcv-reflet-bas), 0 3u 0 rgb(from var(--pcv-ombre-c) r g b / .22); }
    #pcv-dossiers .bts button { white-space: nowrap; } #pcv-dossiers .bts button[hidden] { display: none; }
    #pcv-dossiers .carte.sup.trois { width: 760u; margin-left: -380u; }   
    #pcv-dossiers .bts button.plein { background: var(--pcv-cyan); color: var(--pcv-sur-accent); box-shadow: inset 0 2u 0 rgba(255,255,255,.5), 0 3u 0 rgba(20,90,140,.35); }
    
    #pcv-dossiers .carte.liste { left: 0; right: 0; width: fit-content; min-width: 380u; max-width: 640u; max-height: calc(100% - 140u); margin: auto; padding: 18u; flex-direction: column; }
    #pcv-dossiers .carte.liste.on { display: flex; }
    #pcv-dossiers .liste .t { font-size: 20u; margin: 0 0 4u 8u; }
    #pcv-dossiers .liste .elts { display: flex; flex-direction: column; gap: 8u; min-height: 0; overflow-y: auto; scrollbar-width: none; padding: 8u; margin: 0 -8u -8u; }
    #pcv-dossiers .liste .elts button { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 18u; height: 50u; padding: 0 18u; border-radius: 25u;
      font-size: 18u; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet); }
    #pcv-dossiers .liste .elts i { font-style: normal; visibility: hidden; }
    #pcv-dossiers .liste .elts button[disabled] { opacity: .5; }
    #pcv-dossiers .liste .elts .oui { color: var(--pcv-cyan-plein); } #pcv-dossiers .liste .elts .oui i { visibility: visible; }
    #pcv-dossiers .liste .elts button.k, #pcv-dossiers .bts button.k { outline: 4u solid var(--pcv-anneau-c); outline-offset: 2u; box-shadow: 0 0 0 9u var(--pcv-cyan-plein); }
    
    #pcv-dossiers .carte.dispo { width: 990u; margin-left: -495u; transition: opacity .2s; }
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
  <div class="carte pcv-fenetre dispo"><div class="t">${rond("dossier", { svg: window.__pcvIcones.trace("dispositions") })}<span>${T("dispo.titre")}</span></div>
    <div class="fen"><div class="rang"></div></div><p class="info"></p><div class="bts leg"></div></div>
  <div class="carte pcv-fenetre nom"><div class="t">${rond("nom")}<span>${T("dossier.nom")}</span></div>
    <input type="text" spellcheck="false" autocomplete="off" enterkeyhint="done"><div class="reste"></div>
    <div class="bts"><button class="clav"></button><button class="non"></button><button class="oui plein"></button></div></div>
  <div class="carte pcv-fenetre sup"><div class="t">${rond("suppr")}<span></span></div><p></p>
    <div class="bts"><button class="non"></button><button class="alt" hidden></button><button class="oui"></button></div></div>
  <div class="carte pcv-fenetre liste"><div class="t"></div><div class="elts"></div></div><div class="pcv-legende leg-bas"></div>`;
  document.body.appendChild(racine);
  fins.push(() => {
    racine.remove();
    document.documentElement.classList.remove("pcv-question");
    document.body.classList.remove("pcv-dossiers-ouvert");
  });
  const $ = (s) => racine.querySelector(s), menuEl = $(".menu"), champ = $(".nom input");
  let ouvert = null;
  const legendeBas = (l) => {
    $(".leg-bas").innerHTML = l ? window.__pcvIcones.legende(l) : "";
    document.documentElement.classList.toggle("pcv-question", !!l || !!window.__pcvSpotPassFenetre?.ouvert?.());
  };
  const fermer = (bruit = true) => {
    if (!ouvert) return;
    if (ouvert.genre === "nom") window.__pcvClavierCacher?.();
    const sous = ouvert.dessous;
    window.__pcvApparition(sous ? racine.querySelector(".carte.on:not(.dispo)") : racine, true, ".carte.on");
    ouvert = null;
    menuEl.classList.remove("on");
    racine.querySelectorAll(".carte").forEach((e) => e.classList.toggle("on", !!sous && e.classList.contains("dispo")));
    if (document.activeElement === champ) champ.blur();
    legendeBas(null);
    if (sous) {
      ouvert = sous;
      racine.classList.remove("par-dessus");
      if (sous === P) choisirVig();
      if (bruit) son("retour");
      return;
    }
    racine.classList.remove("boite-ouverte");
    racine.hidden = true;
    document.body.classList.remove("pcv-dossiers-ouvert");
    if (bruit) son("retour");
  };
  const couleurAppli = () => {
    const a = [...document.querySelectorAll(".pcv-appli")].find((x) => x !== racine && x.getClientRects().length);
    racine.classList.toggle("pcv-appli", !!a);
    racine.style.setProperty("--pcv-appli-couleur", a ? a.style.getPropertyValue("--pcv-appli-couleur") : "");
    window.__pcvFenetreAppli?.(racine);
  };
  const montrer = (o) => {
    ouvert = o;
    couleurAppli();
    racine.hidden = false;
    document.body.classList.add("pcv-dossiers-ouvert");
    racine.classList.toggle("par-dessus", !!o.dessous && o.genre !== "menu");
  };
  const dessinerMenu = () => menuEl.querySelectorAll("button").forEach((b, k) => b.classList.toggle("k", k === ouvert.k));
  const menu = (i) => {
    const a = acc();
    if (!a) return false;
    const d = a.dossier?.(), deco = !!window.__pcvDeco;
    return choix(i, [
      !d && deco && { ic: "decorer", nom: T("perso.decorer"), faire: () => window.__pcvDeco.ouvrir({ case: i }) },
      a.peutRetirerCase?.(i) && { ic: "suppr", nom: T("console.retirer_case"), faire: () => a.retirerCase(i) },
      !d && { ic: "dossier", nom: T("dossier.creer"), faire: () => creer(i) },
      d && { ic: "nom", nom: T("dossier.renommer"), faire: () => renommer(d.id) },
      d?.ec && { ic: "decoller", nom: T("console.decoller_badge"), faire: () => a.decollerDossier?.(d.id) },
      // (le badge collé sur le dossier retourne dans la boîte)
      d && { ic: "suppr", nom: T("dossier.supprimer"), faire: () => supprimer(d.id) }
    ].filter(Boolean));
  };
  const choix = (i, choix2, o = {}) => {
    const a = acc();
    if (!a && !o.pres || !choix2.length) return false;
    menuEl.innerHTML = choix2.map((c2, k) => `<button data-k="${k}">${rond(c2.ic, c2)}${echap(c2.nom)}</button>`).join("") + `<div class="pcv-legende leg-bulle">${window.__pcvIcones.legende([[1, T("touche.choisir")], [2, T("touche.retour")]])}</div>`;
    legendeBas(null);
    montrer({ genre: "menu", choix: choix2, k: 0, dessous: o.dessous, ailleurs: o.ailleurs });
    dessinerMenu();
    const c = (o.pres || a.grille().children[i])?.getBoundingClientRect(), u = innerHeight / 800;
    menuEl.classList.add("on");
    const l = menuEl.offsetWidth, h = menuEl.offsetHeight, droite = !c || c.right + 14 * u + l < innerWidth - 16 * u, sous = o.sous && c;
    const x = sous ? Math.min(c.left + c.width / 2 - l / 2, innerWidth - l - 16 * u) : c ? droite ? c.right + 14 * u : c.left - 14 * u - l : (innerWidth - l) / 2, y = sous ? c.bottom + 10 * u : c ? Math.min(Math.max(110 * u, c.top + c.height / 2 - h / 2), innerHeight - h - 20 * u) : 300 * u;
    menuEl.style.left = Math.max(16 * u, x) + "px";
    menuEl.style.top = y + "px";
    menuEl.style.setProperty("--ox", sous ? "50%" : droite ? "0" : "100%");
    menuEl.style.setProperty("--oy", sous ? "0" : "50%");
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
    $(".nom .t span").textContent = o?.titre || T("dossier.nom");
    $(".nom .clav").textContent = T("dossier.clavier");
    $(".nom .non").textContent = o?.annuler || T("dispo.annuler");
    $(".nom .oui").textContent = o?.oui || T("dispo.ok");
    montrer({ genre: "nom", id, ok: o?.ok, dessous: o?.dessous, ailleurs: o?.ailleurs, k: 2 });
    racine.classList.add("boite-ouverte");
    $(".carte.nom").classList.add("on");
    window.__pcvApparition($(".carte.nom"));
    dessinerNom();
    son("choisir");
    clavier();
    champ.select();
    return true;
  };
  const boutonsNom = () => [$(".nom .clav"), $(".nom .non"), $(".nom .oui")];
  const dessinerNom = () => {
    const l = boutonsNom();
    l.forEach((b, k) => b.classList.toggle("k", k === ouvert.k));
    legendeBas([[3, l[0].textContent], [2, l[1].textContent], ...ouvert.k ? [[1, l[ouvert.k].textContent]] : []]);
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
  $(".nom .clav").onclick = clavier;
  const dessinerSup = () => {
    const l = [$(".sup .non"), ...ouvert.autre ? [$(".sup .alt")] : [], $(".sup .oui")], t = [ouvert.non, ...ouvert.autre ? [ouvert.autre.texte] : [], ouvert.oui];
    $(".sup .alt").hidden = !ouvert.autre;
    $(".carte.sup").classList.toggle("trois", !!ouvert.autre);
    ouvert.n = l.length;
    l.forEach((b, k) => {
      b.classList.toggle("k", k === ouvert.k);
      b.classList.toggle("plein", k === ouvert.plein);
      b.textContent = t[k];
    });
    legendeBas(ouvert.k ? [[2, ouvert.non], [1, t[ouvert.k]]] : [[1, ouvert.non]]);
  };
  const demander = (o) => {
    $(".sup .t").firstElementChild.outerHTML = rond(o.ic || "suppr", o);
    $(".sup .t span").textContent = o.titre;
    $(".sup p").textContent = o.texte;
    const k = o.danger === false ? o.autre ? 2 : 1 : 0;
    montrer({ genre: "sup", k, plein: k, ok: o.ok, autre: o.autre, dessous: o.dessous, ailleurs: o.ailleurs, non: o.non, oui: o.oui });
    racine.classList.add("boite-ouverte");
    $(".carte.sup").classList.add("on");
    window.__pcvApparition($(".carte.sup"));
    dessinerSup();
    son("choisir");
    return true;
  };
  const supprimer = (id) => {
    const d = acc()?.dossiers?.().find((x) => x.id === id);
    if (!d) return false;
    return demander({
      titre: T("dispo.supprimer_titre", { nom: d.nom }),
      non: T("dispo.annuler"),
      oui: T("dispo.supprimer"),
      ok: () => acc()?.supprimerDossier(id),
      texte: d.n ? d.n === 1 ? T("dossier.contenu_un") : T("dossier.contenu_n", { n: d.n }) : T("dossier.vide")
    });
  };
  const confirmer = (autre) => {
    if (ouvert?.genre !== "sup") return;
    const o = ouvert;
    fermer(false);
    (autre ? o.autre.ok : o.ok)();
  };
  $(".sup .oui").onclick = () => confirmer();
  $(".sup .alt").onclick = () => confirmer(true);
  $(".sup .non").onclick = () => fermer();
  const dessinerListe = () => {
    const l = $(".liste .elts").children;
    [...l].forEach((b, k) => b.classList.toggle("k", k === ouvert.k));
    l[ouvert.k]?.scrollIntoView({ block: "nearest" });
  };
  const liste = (o) => {
    if (!o.choix?.length) return false;
    $(".liste .t").innerHTML = `${o.ic || o.svg ? rond(o.ic || "reglages", o) : ""}<span>${echap(o.titre)}</span>`;
    $(".liste .elts").innerHTML = o.choix.map((c, k) => `<button data-k="${k}"${k === o.v || o.coches?.includes(k) ? ' class="oui"' : ""}${o.grises?.includes(k) ? " disabled" : ""}>${echap(c)}<i>\u2713</i></button>`).join("");
    legendeBas([[2, T("touche.retour")], [1, T("touche.choisir")]]);
    montrer({ genre: "liste", k: Math.max(0, o.v ?? 0), n: o.choix.length, ok: o.ok, grises: o.grises, dessous: o.dessous, ailleurs: o.ailleurs });
    racine.classList.add("boite-ouverte");
    $(".carte.liste").classList.add("on");
    window.__pcvApparition($(".carte.liste"));
    dessinerListe();
    son("choisir");
    return true;
  };
  const prendre = (k) => {
    if (ouvert?.genre !== "liste") return;
    if (ouvert.grises?.includes(k)) return son("bord");
    const o = ouvert;
    fermer(false);
    son("choisir");
    o.ok(k);
  };
  $(".liste .elts").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) prendre(+b.dataset.k);
  });
  window.__pcvDerriere($(".voile"), () => fermer());
  const PLACES = 10, NOM_MAX = 20;
  const appel = (m, ...a) => window.opener.DeckyBackend.call("loader/call_plugin_method", window.__pcvGreffon.nom, m, ...a);
  let DD = null, occupe = false;
  const P = { genre: "dispo", k: 0, bt: -1 };
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
    [...$(".dispo .rang").children].forEach((b, j) => b.classList.toggle("k", j === k && !(P.bt >= 0)));
    $(".dispo .rang").style.transform = `translateX(calc(var(--u) * ${-Math.max(0, Math.min(PLACES - 5, k - 2)) * 190}))`;
    const l = [DD && plein && [3, T("touche.options")], [2, T("touche.retour")], DD && [1, T(plein ? "dispo.charger" : "dispo.enregistrer")]].filter(Boolean);
    if (P.bt >= l.length) P.bt = l.length - 1;
    $(".dispo .leg").innerHTML = l.map(([b, t], j) => `<button data-b="${b}" class="${b === 1 ? "plein" : ""}${j === P.bt ? " k" : ""}">${t}</button>`).join("");
    legendeBas(l);
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
      danger: false,
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
      P.bt = -1;
      montrer(P);
      racine.classList.add("boite-ouverte");
      $(".carte.dispo").classList.add("on");
      window.__pcvApparition($(".carte.dispo"));
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
      if (b === 11 || b === 12) {
        const k = ouvert.k + (b === 12 ? 1 : -1);
        if (k < 0 || k > 2) son("bord");
        else {
          ouvert.k = k;
          dessinerNom();
          son("bouge");
        }
      } else if (b === 1) [clavier, () => fermer(), valider][ouvert.k]();
      else if (b === 3) clavier();
      else son("bord");
      return true;
    }
    if (ouvert.genre === "dispo") {
      if (occupe || !DD) return true;
      const bts = [...$(".dispo .leg").children];
      if (ouvert.bt >= 0) {
        if (b === 11 || b === 12) {
          const j = ouvert.bt + (b === 12 ? 1 : -1);
          if (j < 0 || j >= bts.length) son("bord");
          else {
            ouvert.bt = j;
            choisirVig();
            son("bouge");
          }
        } else if (b === 9) {
          ouvert.bt = -1;
          choisirVig();
          son("bouge");
        } else if (b === 1) {
          const v = +bts[ouvert.bt].dataset.b;
          ouvert.bt = -1;
          choisirVig();
          if (v !== 1) return touche(v);
          aDispo();
        } else if (b === 3 && DD.l[ouvert.k]) optionsDispo();
        else son("bord");
        return true;
      }
      if (b === 10 && bts.length) {
        ouvert.bt = bts.length - 1;
        choisirVig();
        son("bouge");
      } else if (b === 11 || b === 12) {
        const k = ouvert.k + (b === 12 ? 1 : -1);
        if (k < 0 || k >= PLACES) son("bord");
        else {
          ouvert.k = k;
          choisirVig();
          son("bouge");
        }
      } else if (b === 1) aDispo();
      else if (b === 3 && DD.l[ouvert.k]) optionsDispo();
      else son("bord");
      return true;
    }
    if (ouvert.genre === "liste") {
      if (b === 9 || b === 10) {
        const k = ouvert.k + (b === 10 ? 1 : -1);
        if (k < 0 || k >= ouvert.n) son("bord");
        else {
          ouvert.k = k;
          dessinerListe();
          son("bouge");
        }
      } else if (b === 1) prendre(ouvert.k);
      else son("bord");
      return true;
    }
    if (b === 11 || b === 12) {
      const k = ouvert.k + (b === 12 ? 1 : -1);
      if (k >= 0 && k < ouvert.n) {
        ouvert.k = k;
        dessinerSup();
        son("bouge");
      } else son("bord");
    } else if (b === 1) {
      if (!ouvert.k) fermer();
      else confirmer(ouvert.k < ouvert.n - 1);
    }
    return true;
  };
  (window.__pcvManette ||= {}).dossiers = (b) => touche(b);
  const ordre = () => {
    const o = window.__pcvOrdre;
    if (!Array.isArray(o) || o[0] === "dossiers") return;
    if (o.includes("dossiers")) o.splice(o.indexOf("dossiers"), 1);
    o.unshift("dossiers");
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
    if (ouvert && !ouvert.ailleurs && (!c || c.hidden)) fermer(false);
  }, 300);
  fins.push(() => {
    clearInterval(tic);
    fermer(false);
    const o = window.__pcvOrdre;
    if (Array.isArray(o) && o.includes("dossiers")) o.splice(o.indexOf("dossiers"), 1);
    delete window.__pcvManette?.dossiers;
  });
  ordre();
  window.__pcvDossiers = { menu, choix, demander, liste, creer, renommer, supprimer, dispositions, modal: () => !!ouvert, fermer: (bruit) => fermer(bruit), etat: () => ouvert && { genre: ouvert.genre, k: ouvert.k } };
  fins.push(() => {
    if (window.__pcvDossiers?.menu === menu) delete window.__pcvDossiers;
  });
  return "dossiers pr\xEAts";
})();
