(() => {
  window.__pcvManettesFin?.();
  const fins = [];
  window.__pcvManettesFin = () => fins.splice(0).forEach((f) => {
    try {
      f();
    } catch (e) {
    }
  });
  const O = window.opener || window, T = (k, v) => window.__pcvT?.(k, v) ?? k, I = window.__pcvIcones, son = (s) => window.__pcvSon?.(s);
  const In = () => O.SteamClient?.Input || window.SteamClient?.Input;
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const css = (s) => s.replace(/(-?\d*\.?\d+)u\b/g, "calc(var(--u) * $1)");
  const PLACES = 4, LB = 30, RB = 31, ATTENTE = 1500, VIBRE = 2200, PILULE = PLACES;
  const ORIGINE = [[262, 756], [358, 756], [440, 756], [520, 756]];
  const page = document.createElement("div");
  page.id = "pcv-manettes";
  page.hidden = true;
  page.innerHTML = `<style>${css(`
    #pcv-manettes { position: fixed; inset: 0; z-index: 8600; background: var(--pcv-fond-page); color: var(--pcv-texte); font-family: var(--pcv-police); font-weight: 800; user-select: none; --num-gris: #aab4c0;
      
      --gx: calc(50vw - 640u); --gy: calc((98u + 740u - 470u) / 2 - 108u); }
    #pcv-manettes :is(.fr, .oc, .aide) { margin: var(--gy) 0 0 var(--gx); }
    #pcv-manettes .aide { margin-left: 0; }
    #pcv-manettes[hidden] { display: none; }
    #pcv-manettes * { box-sizing: border-box; }
    #pcv-manettes svg:not(.pcv-pile-manette *) { display: block; flex: none; }
    #pcv-manettes .verre { background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    #pcv-manettes .fr { transition: transform .65s var(--pcv-panneau-courbe), opacity .35s, box-shadow .2s; }
    #pcv-manettes .depuis { transform: translate(calc(var(--dx) - var(--gx)), calc(var(--dy) - var(--gy))) scale(.22); opacity: 0; transition: none; }
    #pcv-manettes .fr { position: absolute; top: 108u; width: 280u; height: 470u; border-radius: 32u; }
    #pcv-manettes .fr.sel { box-shadow: var(--pcv-anneau-choisi); transform: scale(1.025); z-index: 2; }
    #pcv-manettes .tete { position: absolute; left: 16u; right: 18u; top: 14u; display: flex; align-items: center; justify-content: space-between; }
    #pcv-manettes .num { display: grid; place-items: center; width: 44u; height: 44u; border-radius: 50%; background: var(--pcv-cyan); color: #fff; font-size: 24u; font-weight: 900; box-shadow: var(--pcv-bombe); transition: background .3s; }
    #pcv-manettes .fr.vide .num { background: var(--num-gris); }
    #pcv-manettes .leds { display: inline-flex; gap: 5u; }
    #pcv-manettes .leds b { width: 8u; height: 8u; border-radius: 50%; background: var(--pcv-place-vide-dessin); box-shadow: inset 0 1u 1u rgba(0,0,0,.12); }
    #pcv-manettes .fr:not(.vide) .leds b.on { background: var(--pcv-vert); box-shadow: 0 0 5u rgb(from var(--pcv-vert) r g b / .7); }
    #pcv-manettes .creux { position: absolute; left: 14u; right: 14u; top: 70u; height: 270u; border-radius: 20u; box-shadow: inset 0 0 0 3u var(--pcv-place-vide); display: grid; place-items: center; }
    #pcv-manettes .creux svg { width: 190u; height: 190u; color: var(--pcv-place-vide-dessin); }
    
    #pcv-manettes .creux::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
      box-shadow: inset 0 0 0 3u var(--pcv-cyan-plein), 0 0 18u color-mix(in srgb, var(--pcv-cyan-plein) 25%, transparent); }
    #pcv-manettes .fr.attend .creux::after { animation: pcvManAttend 1.2s ease-in-out infinite; }
    @keyframes pcvManAttend { 50% { opacity: 1; } }
    #pcv-manettes .mot { position: absolute; left: 20u; right: 20u; top: 358u; display: grid; gap: 8u; text-align: center; color: var(--pcv-texte2); }
    #pcv-manettes .mot b { font-size: 21u; font-weight: 900; }
    #pcv-manettes .mot small { font-size: 16u; font-weight: 800; }
    #pcv-manettes .oc { position: absolute; left: 0; top: 178u; width: 252u; height: 386u; border-radius: 24u; z-index: 3; transition: translate .55s var(--pcv-panneau-courbe), transform .4s var(--pcv-panneau-courbe), opacity .3s; }
    
    #pcv-manettes .oc::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .25s;
      box-shadow: 0 0 0 4u var(--pcv-anneau-c), 0 0 0 9u var(--pcv-orange), 0 26u 40u rgb(30 50 80 / .3); }
    #pcv-manettes .oc.leve::after { opacity: 1; }
    #pcv-manettes .socle { position: relative; height: 270u; border-radius: 20u; background: var(--pcv-socle); box-shadow: var(--pcv-socle-ombre); display: grid; place-items: center; }
    #pcv-manettes .socle > svg { width: 220u; height: 220u; color: var(--pcv-accent); }   
    #pcv-manettes .nom { margin: 18u 8u 0; font-size: 22u; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #pcv-manettes .info { display: flex; align-items: center; gap: 8u; margin: 8u 8u 0; font-size: 15u; color: var(--pcv-texte2); }
    #pcv-manettes .cx { display: inline-flex; align-items: center; gap: 5u; margin-left: auto; }
    #pcv-manettes .cx svg { width: 17u; height: 17u; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    #pcv-manettes .info > svg { width: 24u; height: 24u; }
    #pcv-manettes .info .pcv-pile-manette { --pcv-etat-ico: 15u; display: flex; }   
    #pcv-manettes .info .pcv-pile-manette > * { background: none !important; box-shadow: none !important; padding: 0 !important; height: auto !important; min-height: 0 !important; margin: 0 !important; display: flex !important; align-items: center !important; }   
    #pcv-manettes .oc.leve { z-index: 6; background: var(--pcv-verre); transform: translateY(-12u) rotate(-2.5deg) scale(1.03); }
    #pcv-manettes .oc.leve .socle { box-shadow: none; }
    #pcv-manettes .oc.cible { transform: scale(.94); filter: saturate(.35); }
    #pcv-manettes .oc.cible :is(.nom, .info, .socle > svg) { opacity: .5; }
    #pcv-manettes .oc.parti { opacity: 0; transform: scale(.85); }
    #pcv-manettes .oc.pose { animation: pcvManPose .45s ease-out; }
    @keyframes pcvManPose { 35% { transform: translateY(6u) scale(.97); } }
    
    #pcv-manettes .oc.vibre .socle > svg { animation: pcvManVibre 1s infinite; }
    @keyframes pcvManVibre { 0%, 46%, 100% { transform: none; } 4%, 12% { transform: translateX(-3u) rotate(-2deg); } 8%, 16% { transform: translateX(3u) rotate(2deg); } 20% { transform: translateX(-2u); } 24% { transform: translateX(2u); } 28% { transform: translateX(-1u); } }
    #pcv-manettes .fr.vibre.vide .leds b.on { animation: pcvManClign .25s steps(1) infinite; }
    
    #pcv-manettes .fr.vibre:not(.vide) .leds b.on { position: relative; background: var(--pcv-place-vide-dessin); box-shadow: none; }
    #pcv-manettes .fr.vibre:not(.vide) .leds b.on::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--pcv-vert); box-shadow: 0 0 5u rgb(from var(--pcv-vert) r g b / .7);
      animation: pcvManClignC .25s steps(1) infinite; }
    @keyframes pcvManClignC { 50% { opacity: 0; } }
    @keyframes pcvManClign { 50% { background: var(--pcv-place-vide-dessin); box-shadow: none; } }
    #pcv-manettes .ondes { position: absolute; inset: 0; pointer-events: none; opacity: 0; }
    #pcv-manettes .ondes::before, #pcv-manettes .ondes::after { content: ""; position: absolute; top: 50%; width: 34u; height: 56u; margin-top: -28u; border: 4u solid transparent; border-radius: 50%; }
    #pcv-manettes .ondes::before { left: 6u; border-left-color: var(--pcv-cyan-plein); }
    #pcv-manettes .ondes::after { right: 6u; border-right-color: var(--pcv-cyan-plein); }
    #pcv-manettes .oc.vibre .ondes { animation: pcvManOndes 1s infinite; }
    @keyframes pcvManOndes { 0% { opacity: 0; transform: scale(.8); } 10%, 40% { opacity: 1; } 50%, 100% { opacity: 0; transform: scale(1.15); } }
    #pcv-manettes .aide { position: absolute; left: 50%; top: 606u; height: 58u; padding: 0 28u; border-radius: 99px; display: flex; align-items: center; gap: 10u; font-size: 21u; font-weight: 900; white-space: nowrap; transform: translateX(-50%); transition: opacity .3s, transform .4s var(--pcv-panneau-courbe); z-index: 5; }
    #pcv-manettes .aide:empty { opacity: 0; transform: translateX(-50%) translateY(12u); }
    #pcv-manettes .aide .pcv-touche { --taille: 34u; }
    #pcv-manettes .aide > svg { width: 30u; height: 30u; color: var(--pcv-accent); fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    #pcv-manettes .basg { position: absolute; left: 34u; bottom: 20u; height: 44u; padding: 0 20u 0 5u; border-radius: 99px; display: flex; align-items: center; gap: 10u; font-size: 17u; font-weight: 900; z-index: 5; cursor: pointer; }
    #pcv-manettes .basg > svg { width: 34u; height: 34u; padding: 4u; }
    #pcv-manettes .basg.sel { box-shadow: var(--pcv-anneau-choisi); }
    #pcv-manettes .pcv-legende { position: absolute; right: 34u; bottom: 20u; z-index: 5; }
  `)}</style><div class="pcv-titre-appli" style="--c-accueil:var(--pcv-orange)">${I.svg("manette", { classe: "ico" })}${esc(T("home.manettes_court"))}</div>
    ${[0, 1, 2, 3].map((i) => `<div class="fr verre vide" data-i="${i}" style="left:${css(50 + i * 300 + "u")};--dx:${css(ORIGINE[i][0] - (190 + i * 300) + "u")};--dy:${css(ORIGINE[i][1] - 358 + "u")}">
      <div class="tete"><span class="num">${i + 1}</span><span class="leds">${[0, 1, 2, 3].map((k) => `<b class="${k === i ? "on" : ""}"></b>`).join("")}</span></div>
      <div class="creux">${I.svg("manette-inconnue")}</div><div class="mot"><b></b><small></small></div></div>`).join("")}
    <div class="aide verre"></div>
    <div class="basg verre" data-i="${PILULE}">${I.svg("parametres")}${esc(T("manettes.reglages"))}</div>
    <div class="pcv-legende"></div>`;
  document.body.appendChild(page);
  window.__pcvFond?.(page);
  const frs = [...page.querySelectorAll(".fr")], aide = page.querySelector(".aide"), legende = page.querySelector(".pcv-legende");
  let liste = [], place = /* @__PURE__ */ new Map(), signature = "", attente = 0;
  const indice = (j) => j.c.nControllerIndex;
  const dans = (k) => liste.find((j) => place.get(indice(j)) === k);
  const relire = async () => {
    if (performance.now() < attente) return;
    const brut = await window.__pcvJoueurs?.(true) || [], virtuelle = brut.some((j) => j.integree && j.c.eControllerType === 100);
    const l = virtuelle ? brut.filter((j) => !j.integree || j.c.eControllerType === 100) : brut, s = JSON.stringify(l.map((j) => [indice(j), j.c.nXInputIndex, j.picto, j.c.ucBatteryLevel, j.c.strName]));
    if (s === signature || performance.now() < attente) return;
    signature = s;
    liste = l;
    place = new Map(l.map((j) => [indice(j), j.c.nXInputIndex]));
    peindre();
  };
  const echanger = (a, b) => {
    if (a === b) return;
    try {
      In()?.SwapControllerOrder(a, b);
    } catch (e) {
      return;
    }
    attente = performance.now() + ATTENTE;
    for (const [i, k] of place) place.set(i, k === a ? b : k === b ? a : k);
  };
  const cartes = /* @__PURE__ */ new Map();
  const pile = (j) => {
    const p = j.integree ? Math.round((window.__pcvBridge?.battery?.()?.percent ?? 1) * 100) : j.c.ucBatteryLevel;
    return `${window.__pcvEtat?.pileA(document, p) ?? I.svg("pile-manette", { niveau: Math.min(3, Math.floor(p / 25)) })}<span>${p} %</span>`;
  };
  const charge = (j) => j.integree || j.c.bWireless ? pile(j) : `<span class="cx" style="margin:0">${I.svg("prise")}${esc(T("manettes.branchee"))}</span>`;
  const liaison = (j) => j.integree ? [j.picto, T("manettes.integree")] : j.c.bBluetooth ? ["bluetooth", T("compte.bluetooth")] : j.c.bWireless ? ["wifi", T("manettes.sans_fil")] : ["prise", "USB"];
  const carte = (j) => {
    const [ic, mot] = liaison(j);
    return `<div class="socle">${I.svg(j.picto)}<i class="ondes"></i></div><div class="nom">${esc(j.integree && window.__pcvNomConsole?.(j.picto) || j.c.strName)}</div><div class="info">${charge(j)}<span class="cx">${I.svg(ic)}${esc(mot)}</span></div>`;
  };
  let sel = 0, mode = null, porte = null, ordre = null, vibre = null;
  const visible = (j) => mode !== "ordre" || ordre.pris.includes(indice(j));
  const peindre = () => {
    const vues = /* @__PURE__ */ new Set();
    for (const j of liste) {
      const i = indice(j), k = place.get(i);
      if (!(k >= 0 && k < PLACES)) continue;
      vues.add(i);
      let el = cartes.get(i), neuve = !el;
      if (neuve) {
        el = document.createElement("div");
        el.className = "oc";
        cartes.set(i, el);
        frs[PLACES - 1].after(el);
      }
      const h = carte(j);
      if (el.__pcvH !== h) {
        el.innerHTML = h;
        el.__pcvH = h;
      }
      const ici = mode !== "porte" ? k : porte.indice === i ? sel : k === sel ? porte.de : k;
      el.style.translate = css(64 + ici * 300 + "u");
      el.classList.toggle("leve", mode === "porte" && porte.indice === i);
      el.classList.toggle("cible", mode === "porte" && porte.indice !== i && k === sel);
      el.classList.toggle("parti", !visible(j));
      el.classList.toggle("vibre", vibre === i);
      if (neuve && !page.hidden) poser(el);
    }
    for (const [i, el] of cartes) if (!vues.has(i)) {
      el.remove();
      cartes.delete(i);
    }
    frs.forEach((fr, k) => {
      const j = dans(k), pleine = !!j && visible(j), attend = mode === "ordre" && !pleine;
      fr.classList.toggle("vide", !pleine);
      fr.classList.toggle("sel", sel === k && mode !== "porte");
      fr.classList.toggle("attend", attend && k === ordre.pris.length);
      fr.classList.toggle("vibre", !!j && vibre === indice(j));
      const [b, s] = pleine ? ["", ""] : attend ? [T("manettes.joueur", { n: k + 1 }), ""] : [T("manettes.libre"), T("manettes.appuie")];
      fr.querySelector(".mot b").textContent = b;
      fr.querySelector(".mot small").textContent = s;
    });
    page.querySelector(".basg").classList.toggle("sel", sel === PILULE);
    const t = (c) => I.touche(c), tous = mode === "ordre" && ordre.pris.length >= liste.filter((j) => place.get(indice(j)) >= 0).length;
    const a = mode === "porte" ? I.svg("manette") + T("manettes.aide_place", { a: t(1) }) : mode === "ordre" ? tous ? T("manettes.aide_fin", { a: t(1) }) : T("manettes.aide_ordre", { lb: t(5), rb: t(6) }) : "";
    if (aide.__pcvH !== a) {
      aide.innerHTML = a;
      aide.__pcvH = a;
    }
    const occupee = sel < PLACES && !!dans(sel);
    const l = mode === "porte" ? [[2, T("home.annuler")], [1, T("manettes.poser")]] : mode === "ordre" ? ordre.pris.length ? [[1, T("manettes.cest_bon")]] : [[2, T("home.annuler")]] : [[4, T("manettes.changer_ordre")], occupee && [3, T("manettes.identifier")], [2, T("touche.retour")], sel === PILULE ? [1, T("touche.choisir")] : occupee && [1, T("manettes.changer_place")]];
    I.poser(legende, window.__pcvLegendeDe?.(l.filter(Boolean)) || l.filter(Boolean));
  };
  const poser = (el) => {
    el.classList.remove("pose");
    void el.offsetWidth;
    el.classList.add("pose");
  };
  let vibreFin = 0;
  const identifier = () => {
    const j = dans(sel);
    if (!j) return son("bord");
    try {
      In()?.IdentifyController(indice(j));
    } catch (e) {
    }
    son("choisir");
    vibre = indice(j);
    clearTimeout(vibreFin);
    vibreFin = setTimeout(() => {
      vibre = null;
      peindre();
    }, VIBRE);
    peindre();
  };
  const prendre = () => {
    const j = dans(sel);
    if (!j) return son("bord");
    mode = "porte";
    porte = { indice: indice(j), de: sel };
    son("prendre");
    peindre();
  };
  const deposer = () => {
    const de = porte.de, el = cartes.get(porte.indice);
    mode = null;
    porte = null;
    echanger(de, sel);
    son("poser");
    peindre();
    if (el) poser(el);
  };
  let messages = null;
  const tenus = /* @__PURE__ */ new Map();
  const surMessage = (manette, source, appuye) => {
    if (mode !== "ordre" || page.hidden || source !== LB && source !== RB) return;
    const t = tenus.get(manette) || /* @__PURE__ */ new Set();
    if (appuye) t.add(source);
    else t.delete(source);
    tenus.set(manette, t);
    const j = liste.find((x) => indice(x) === manette);
    if (!j || !(t.has(LB) && t.has(RB)) || ordre.pris.includes(manette) || !(place.get(manette) >= 0)) return;
    const k = ordre.pris.length;
    if (k >= PLACES) return;
    ordre.echanges.push([place.get(manette), k]);
    echanger(place.get(manette), k);
    ordre.pris.push(manette);
    sel = k + 1 < PLACES ? k + 1 : k;
    son("poser");
    peindre();
    const el = cartes.get(manette);
    if (el) poser(el);
  };
  const ecouter = (oui) => {
    if (oui && !messages) try {
      messages = In()?.RegisterForControllerInputMessages(surMessage) || null;
    } catch (e) {
      messages = null;
    }
    if (!oui && messages) {
      try {
        messages.unregister();
      } catch (e) {
      }
      messages = null;
      tenus.clear();
    }
  };
  const changerOrdre = () => {
    mode = "ordre";
    ordre = { pris: [], echanges: [] };
    sel = 0;
    son("choisir");
    ecouter(true);
    peindre();
  };
  const finOrdre = (garder) => {
    if (!garder) for (const [a, b] of ordre.echanges.reverse()) echanger(b, a);
    else for (const j of liste) if (!ordre.pris.includes(indice(j)) && !j.integree && (j.c.bWireless || j.c.bBluetooth)) try {
      In()?.TurnOffController(indice(j));
    } catch (e) {
    }
    mode = null;
    ordre = null;
    ecouter(false);
    son(garder ? "choisir" : "retour");
    peindre();
  };
  const reglages = () => {
    son("choisir");
    montrer(false);
    window.__pcvBridge?.navigate("Controller");
  };
  const ROUTE_JEU = /^(\/routes)?\/(apprunning|library\/app\/)/;
  let suivi = 0, ouverture = 0, souhaite = false, routeJeu = null;
  const montrer = (oui) => {
    if (oui === souhaite) return;
    souhaite = oui;
    const tour = ++ouverture;
    if (!oui) {
      if (mode === "ordre") finOrdre(false);
      mode = null;
      porte = null;
      vibre = null;
      clearInterval(suivi);
      window.__pcvApparition?.(page, true);
      page.hidden = true;
      return;
    }
    window.__pcvBarreQuitter?.();
    sel = 0;
    mode = null;
    signature = "";
    const B = window.__pcvBridge, r = B?.page?.() || "";
    routeJeu = B?.runningApp?.() && ROUTE_JEU.test(r) ? r : null;
    if (routeJeu) B.revenirA("/library/home");
    relire().then(() => {
      if (tour !== ouverture) return;
      page.hidden = false;
      page.animate?.({ opacity: [0, 1] }, { duration: 350 });
      frs.forEach((el) => el.classList.add("depuis"));
      for (const [i, el] of cartes) {
        const k = place.get(i);
        el.style.setProperty("--dx", css(ORIGINE[k][0] - (190 + k * 300) + "u"));
        el.style.setProperty("--dy", css(ORIGINE[k][1] - 386 + "u"));
        el.classList.add("depuis");
      }
      void page.offsetWidth;
      requestAnimationFrame(() => page.querySelectorAll(".depuis").forEach((el) => el.classList.remove("depuis")));
    });
    clearInterval(suivi);
    suivi = setInterval(relire, 500);
  };
  fins.push(() => {
    souhaite = false;
    ouverture++;
    clearInterval(suivi);
    clearTimeout(vibreFin);
    ecouter(false);
    page.remove();
    delete window.__pcvManettes;
    delete window.__pcvManette?.manettes;
    delete window.__pcvLegendes?.manettes;
  });
  window.__pcvManettes = { ouvrir: () => montrer(true), fermer: () => montrer(false), ouvert: () => !page.hidden };
  (window.__pcvLegendes ||= {}).manettes = () => {
    if (!page.hidden) peindre();
  };
  const retour = () => {
    const r = routeJeu;
    routeJeu = null;
    son("retour");
    montrer(false);
    setTimeout(() => {
      const menu = () => {
        try {
          (window.__pcvMenus || O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore).OpenSideMenu(1);
        } catch (e) {
        }
      };
      if (r && window.__pcvBridge?.runningApp?.()) {
        window.__pcvBridge.revenirA(r);
        setTimeout(menu, 50);
      } else menu();
    }, 300);
  };
  page.addEventListener("click", (e) => {
    const el = e.target.closest?.("[data-i]");
    if (!el) return;
    const i = +el.dataset.i;
    if (i === PILULE) return reglages();
    if (mode === "ordre") return;
    if (sel !== i) {
      sel = i;
      son("bouge");
      return peindre();
    }
    window.__pcvManette.manettes(1);
  });
  (window.__pcvManette ||= {}).manettes = (b) => {
    if (page.hidden || window.__pcvDossiers?.modal?.()) return false;
    if (mode === "ordre") {
      if (b === 1 || b === 2) {
        if (ordre.pris.length) finOrdre(true);
        else if (b === 2) finOrdre(false);
        else son("bord");
      }
      return true;
    }
    if (b === 11 || b === 12) {
      const d = b === 12 ? 1 : -1, n = (sel === PILULE ? 0 : sel) + d;
      if (sel === PILULE || n < 0 || n >= PLACES) son("bord");
      else {
        sel = n;
        son("bouge");
        peindre();
      }
    } else if (b === 10 && mode !== "porte" && sel < PLACES) {
      sel = PILULE;
      son("bouge");
      peindre();
    } else if (b === 9 && sel === PILULE) {
      sel = 0;
      son("bouge");
      peindre();
    } else if (mode === "porte") {
      if (b === 1) deposer();
      else if (b === 2) {
        mode = null;
        porte = null;
        son("retour");
        peindre();
      } else son("bord");
    } else if (b === 1) {
      if (sel === PILULE) reglages();
      else prendre();
    } else if (b === 2) retour();
    else if (b === 3) identifier();
    else if (b === 4) changerOrdre();
    else son("bord");
    return true;
  };
  return "page Manettes pr\xEAte";
})();
