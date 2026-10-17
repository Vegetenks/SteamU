(() => {
  window.__pcvDecoFin?.();
  const fins = [];
  window.__pcvDecoFin = () => fins.splice(0).forEach((f) => {
    try {
      f();
    } catch (e) {
    }
  });
  const lire = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  const ecrire = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
    }
  };
  const css = (s) => s.replace(/(-?\d*\.?\d+)u\b/g, "calc(var(--u) * $1)");
  const echap = (s) => String(s).replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
  const son = (n) => window.__pcvSon?.(n);
  const acc = () => window.__pcvGrille, arc = () => window.__pcvArcade;
  const U = () => innerHeight / 800;
  const RANGEES = { min: 4, max: 8, cle: "pcv-deco-rangees", depart: 5 };
  const PALIER = 10;
  const racine = document.createElement("div");
  racine.id = "pcv-deco";
  racine.hidden = true;
  racine.innerHTML = `<style>${css(`
    #pcv-deco { position: fixed; inset: 98u 0 0 0; z-index: 8510; pointer-events: none; font-family: var(--pcv-police); color: var(--pcv-texte);
      user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
    #pcv-deco[hidden] { display: none; }
    #pcv-deco.cache { visibility: hidden; }
    #pcv-deco * { box-sizing: border-box; }
    #pcv-deco img { -webkit-user-drag: none; }
    #pcv-deco button { font: inherit; color: inherit; border: 0; padding: 0; background: none; cursor: pointer; }
    #pcv-deco u { text-decoration: none; flex: none; display: inline-flex; align-items: center; justify-content: center; min-width: 26u; height: 26u; padding: 0 5u; border-radius: 13u;
      background: radial-gradient(circle at 50% 35%, #5c6678, #2f3a4a); color: var(--pcv-sur-accent); font-size: 12u; font-weight: 900; }
    
    #pcv-deco .tiroir { position: absolute; left: 14u; right: 14u; bottom: 0; height: 166u; pointer-events: auto; border-radius: 34u 34u 0 0;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 -6u 28u rgba(40,60,95,.22); transform: translateY(104%); transition: transform .42s cubic-bezier(.3,1.15,.5,1), box-shadow .2s; }
    #pcv-deco.on .tiroir { transform: none; }
    #pcv-deco .tiroir.depot { box-shadow: var(--pcv-reflet), 0 0 0 5u var(--pcv-anneau-c), 0 0 0 10u #ff8a1f, 0 -6u 34u rgba(255,138,31,.45); }
    #pcv-deco .poignee { position: absolute; left: 50%; top: 7u; width: 60u; height: 6u; margin-left: -30u; border-radius: 3u; background: rgba(120,135,155,.35); }
    #pcv-deco .haut { position: absolute; left: 16u; right: 16u; top: 15u; height: 48u; display: flex; align-items: center; gap: 10u; }
    #pcv-deco .onglets { position: relative; flex: 1; min-width: 0; height: 100%; display: flex; align-items: center; gap: 8u; overflow-x: auto; scrollbar-width: none; touch-action: pan-x; padding: 0 4u; }
    #pcv-deco .onglets::-webkit-scrollbar, #pcv-deco .bande::-webkit-scrollbar { display: none; }
    #pcv-deco .ong { flex: none; display: flex; align-items: center; gap: 8u; height: 40u; padding: 0 14u 0 5u; border-radius: 20u; background: color-mix(in srgb, var(--pcv-carte) 55%, transparent);
      box-shadow: inset 0 0 0 1.5u color-mix(in srgb, var(--pcv-carte) 80%, transparent); font-size: 15u; font-weight: 800; white-space: nowrap; cursor: pointer; }
    #pcv-deco .ong img { width: 30u; height: 30u; border-radius: 9u; background: var(--pcv-creux); object-fit: contain; }
    #pcv-deco .ong small { color: var(--pcv-texte2); font-size: 13u; font-weight: 800; }
    #pcv-deco .ong.on { background: var(--pcv-cyan); color: var(--pcv-sur-accent); box-shadow: inset 0 2u 0 rgba(255,255,255,.45), 0 3u 0 rgba(0,0,0,.12); }
    #pcv-deco .ong.on small { color: rgba(255,255,255,.88); }
    
    #pcv-deco .bt { flex: none; display: flex; align-items: center; gap: 8u; height: 42u; padding: 0 16u 0 7u; border-radius: 21u; font-size: 15u; font-weight: 900; white-space: nowrap;
      
      background: var(--pcv-verre); box-shadow: inset 0 2u 0 var(--pcv-reflet-haut), inset 0 -3u 0 var(--pcv-reflet-bas), 0 3u 0 rgb(from var(--pcv-ombre-c) r g b / .22), 0 6u 12u rgb(from var(--pcv-ombre-c) r g b / .14); color: var(--pcv-texte); }
    #pcv-deco .bt:active { transform: translateY(2u); box-shadow: inset 0 2u 0 var(--pcv-reflet-haut), 0 1u 0 rgb(from var(--pcv-ombre-c) r g b / .22); }
    #pcv-deco .bt.fin { background: var(--pcv-cyan); color: var(--pcv-sur-accent); box-shadow: inset 0 2u 0 rgba(255,255,255,.5), inset 0 -3u 0 rgba(0,0,0,.12), 0 3u 0 rgba(20,90,140,.35), 0 6u 12u rgba(30,120,190,.2); }
    #pcv-deco .zm { flex: none; display: flex; align-items: center; gap: 6u; height: 42u; padding: 0 6u; border-radius: 21u; background: color-mix(in srgb, var(--pcv-carte) 50%, transparent); font-size: 13u; font-weight: 900; color: var(--pcv-texte2); }
    #pcv-deco .zm button { width: 32u; height: 32u; border-radius: 50%; font-size: 18u; font-weight: 900; color: var(--pcv-texte);
      background: var(--pcv-verre); box-shadow: inset 0 2u 0 var(--pcv-reflet-haut), 0 2u 0 rgb(from var(--pcv-ombre-c) r g b / .25); }
    #pcv-deco .bande { position: absolute; left: 0; right: 0; top: 66u; bottom: 0; display: flex; align-items: center; gap: 12u; padding: 0 24u 4u; overflow-x: auto; overflow-y: hidden;
      scrollbar-width: none; touch-action: pan-x; }
    #pcv-deco .it { flex: none; position: relative; width: 80u; height: 80u; border-radius: 18u; display: flex; align-items: center; justify-content: center; cursor: grab; touch-action: pan-x;
      background: color-mix(in srgb, var(--pcv-carte) 42%, transparent); box-shadow: inset 0 0 0 2u color-mix(in srgb, var(--pcv-carte) 75%, transparent); transition: transform .15s; }
    #pcv-deco .it.large { width: 170u; }
    #pcv-deco .it img { pointer-events: none; object-fit: contain; image-rendering: pixelated; filter: drop-shadow(0 3u 3u rgba(0,0,0,.25)); }
    #pcv-deco .it em { position: absolute; right: -5u; top: -5u; min-width: 30u; height: 24u; padding: 0 7u; border-radius: 12u; background: #ff8a1f; color: var(--pcv-sur-accent); font-style: normal;
      font-size: 13u; font-weight: 900; display: flex; align-items: center; justify-content: center; box-shadow: 0 2u 0 rgba(0,0,0,.15); }
    #pcv-deco .it.zero img { opacity: .35; filter: grayscale(1); } #pcv-deco .it.zero em { background: #9aa4b2; }
    #pcv-deco .it .tag { position: absolute; left: 50%; bottom: -6u; transform: translateX(-50%); padding: 1u 7u; border-radius: 8u; background: #8a63ff; color: var(--pcv-sur-accent); font-size: 10u; font-weight: 900; white-space: nowrap; }
    #pcv-deco .it .tag.mo { background: var(--pcv-texte2); }
    #pcv-deco .it.main { background: var(--pcv-carte); transform: translateY(-5u); box-shadow: 0 0 0 4u var(--pcv-anneau-c), 0 0 0 8u var(--pcv-cyan-plein), 0 8u 16u rgba(30,120,190,.3); }
    #pcv-deco.manette .it.choisi { box-shadow: 0 0 0 4u var(--pcv-anneau-c), 0 0 0 8u #ff8a1f; }
    #pcv-deco .vide-p { margin: 0 auto; padding: 0 20u; text-align: center; font-size: 16u; font-weight: 800; color: var(--pcv-texte2); }
    
    #pcv-deco .aide { position: absolute; right: 24u; top: 6u; display: flex; align-items: center; gap: 10u; height: 42u; padding: 0 18u 0 8u; border-radius: 21u;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); font-size: 15u; font-weight: 800; white-space: nowrap; opacity: 0; transition: opacity .25s; }
    #pcv-deco.on .aide { opacity: 1; }
    #pcv-deco .aide img { width: 32u; height: 32u; object-fit: contain; }
    #pcv-deco .aide b { color: var(--pcv-cyan-plein); font-weight: 900; }
    
    #pcv-deco .fl { position: absolute; top: 240u; width: 40u; height: 110u; border-radius: 20u; pointer-events: auto; display: flex; align-items: center; justify-content: center;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); opacity: .82; font-size: 30u; font-weight: 900; color: var(--pcv-texte2); }
    #pcv-deco .fl.g { left: 8u; } #pcv-deco .fl.d { right: 8u; }
    
    #pcv-deco .empreinte, #pcv-deco .choix-b { position: fixed; left: 0; top: 0; pointer-events: none; border-radius: 10u; }
    
    #pcv-deco .empreinte { z-index: 6; background: rgba(70,220,120,.22) center / contain no-repeat; box-shadow: inset 0 0 0 3u #3ddc84, 0 0 14u rgba(61,220,132,.6); }
    #pcv-deco .empreinte.non { background-color: rgba(255,80,80,.24); box-shadow: inset 0 0 0 3u #ff5a5a, 0 0 14u rgba(255,90,90,.6); }
    #pcv-deco .empreinte.dos { background-color: rgba(255,138,31,.22); box-shadow: inset 0 0 0 4u #ff8a1f, 0 0 18u rgba(255,138,31,.7); }   
    #pcv-deco .fantome { position: fixed; left: 0; top: 0; pointer-events: none; z-index: 5; background: center / contain no-repeat; filter: drop-shadow(0 12u 12u rgba(0,0,0,.35)); }
    #pcv-deco .choix-b { box-shadow: 0 0 0 3u var(--pcv-anneau-c), 0 0 0 6u var(--pcv-cyan-plein); }
    #pcv-deco .choix-b button { position: absolute; right: -16u; top: -16u; width: 36u; height: 36u; border-radius: 50%; pointer-events: auto; color: var(--pcv-sur-accent); font-size: 18u; font-weight: 900;
      background: radial-gradient(circle at 50% 35%, #ff8a8a, #e5484d); box-shadow: 0 0 0 3u var(--pcv-anneau-c), 0 3u 6u rgba(0,0,0,.25); }
    #pcv-deco [hidden] { display: none !important; }
    
    
    html[data-pcv-famille="3ds"] body.pcv-deco #pcv-console .cel.vide:not(.couverte):not(.sel):not(:has(.bdg)) { outline: 1.5u dashed rgba(255,255,255,.5);
      outline-offset: calc(var(--u) * var(--bo) * -1); box-shadow: inset 0 0 0 1u rgba(40,55,80,.14); }
    body.pcv-deco #pcv-console .bas, body.pcv-deco #pcv-console .zoom, body.pcv-deco #pcv-console .etat, body.pcv-deco #pcv-console .passants { visibility: hidden; }
  `)}</style>
  <div class="aide"></div>
  <button class="fl g" aria-label="D\xE9filer \xE0 gauche">\u2039</button><button class="fl d" aria-label="D\xE9filer \xE0 droite">\u203A</button>
  <div class="empreinte" hidden></div>
  <div class="choix-b" hidden><button aria-label="Retirer ce badge">\u2715</button></div>
  <div class="tiroir"><div class="poignee"></div>
    <div class="haut"><div class="onglets"></div>
      <div class="zm"><button data-z="-1" aria-label="Moins de rang\xE9es">\u2212</button><span></span><button data-z="1" aria-label="Plus de rang\xE9es">+</button></div>
      <button class="bt place"><u data-touche="4"></u>+ de place</button>
      <button class="bt fin"><u data-touche="2"></u>Termin\xE9</button></div>
    <div class="bande"></div></div>
  <div class="fantome" hidden></div>`;
  document.body.appendChild(racine);
  fins.push(() => racine.remove());
  const $ = (s) => racine.querySelector(s), bande = $(".bande"), tiroir = $(".tiroir");
  let actif = false, zone = "palette", manette = false, ong = 0, it = 0, choisie = -1, chargement = null;
  let main = null;
  let porte = null;
  let geste = null;
  let series = [], ex = {}, poses = {};
  let grilleOuverte = null;
  const accueilVisible = () => {
    const r = document.getElementById("pcv-console");
    return !!r && !r.hidden && !!acc();
  };
  const catalogue = async () => {
    const A = arc(), idx = A?.charger ? await A.charger().catch(() => null) : null;
    ex = A?.exemplaires?.() || {};
    series = [];
    for (const s of idx?.series || []) {
      const items2 = [];
      for (const f of s.lots || []) {
        const id = `${s.id}/${f}`;
        if (!s.tailles?.[f] && !(ex[id] > 0)) continue;
        const inf = A.info(id);
        if (!inf) continue;
        const p = inf.morceaux;
        if (!p) {
          if (ex[id] > 0) items2.push({ id, w: inf.colonnes, h: inf.rangees, nom: inf.nom });
          continue;
        }
        const tous = p.every((x) => ex[x] > 0);
        if (tous) items2.push({ id, w: inf.colonnes, h: inf.rangees, morceaux: p, nom: inf.nom });
        p.forEach((x, k) => {
          if (ex[x] > 0) items2.push({ id: x, w: 1, h: 1, morceau: { k, sur: p.length }, freres: tous ? p : null, nom: inf.nom });
        });
      }
      if (items2.length) series.push({ s, items: items2 });
    }
    ong = Math.min(ong, Math.max(0, series.length - 1));
  };
  const compter = () => {
    poses = {};
    const A = arc(), a = acc();
    for (const c of a?.tout?.() || a?.cases() || []) {
      if (c.bd == null) continue;
      const p = c.bt && c.bt[0] * c.bt[1] > 1 ? A?.info?.(c.bd)?.morceaux : null;
      for (const x of p || [c.bd]) poses[x] = (poses[x] || 0) + 1;
    }
  };
  const reste = (id) => Math.max(0, (ex[id] || 0) - (poses[id] || 0));
  const nombre = (o) => o.morceaux ? Math.min(...o.morceaux.map(reste)) : reste(o.id) - (o.freres ? Math.min(...o.freres.map(reste)) : 0);
  const items = () => series[ong]?.items || [];
  const G = () => {
    const a = acc(), g = a?.grille();
    if (!g?.isConnected || !g.offsetParent) return null;
    const z = a.zoom(), u = U(), zr = g.offsetParent.getBoundingClientRect(), p = (z.c + z.g) * u;
    return { a, z, p, e: z.g * u, x0: zr.left + g.offsetLeft - Math.max(0, a.decal()) * p, y0: zr.top + g.offsetTop };
  };
  const ancre = (x, y, w = 1, h = 1) => {
    const g = G();
    if (!g) return -1;
    const cx = (x - g.x0 + g.e / 2) / g.p, cy = (y - g.y0 + g.e / 2) / g.p;
    if (cy < -0.4 || cy > g.z.r + 0.4) return -1;
    const col = Math.round(cx - w / 2), row = Math.max(0, Math.min(g.z.r - h, Math.round(cy - h / 2)));
    return col < 0 ? -1 : col * g.z.r + row;
  };
  const rectDe = (i, w = 1, h = 1) => {
    const g = G();
    if (!g) return null;
    const r = g.z.r, col = Math.floor(i / r), row = i % r, m = g.a.bord(), [l, hh] = g.a.boite(w, h);
    return { x: g.x0 + col * g.p + m, y: g.y0 + row * g.p + m, l, h: hh };
  };
  const dossierSous = (x, y) => {
    const a = acc(), i = ancre(x, y);
    return i >= 0 && !a.dossier?.() && a.cases()[i]?.dossier ? i : -1;
  };
  const peutPoser = (i, w, h) => {
    const a = acc(), r = a.zoom().r, n = a.cases().length;
    if (i < 0 || i % r + h > r) return false;
    for (let dc = 0; dc < w; dc++) for (let dr = 0; dr < h; dr++) {
      const k = i + dc * r + dr;
      if (k < n && !a.libre(k)) return false;
    }
    return true;
  };
  const ancreDe = (i) => acc().couvertes().get(i) ?? i;
  const bdDe = (c) => c?.bd ?? c?.ec?.bd;
  const ancreCurseur = (o) => {
    const a = acc(), r = a.zoom().r, s = a.sel(), row = s % r;
    return s - row + Math.max(0, Math.min(row, r - o.h));
  };
  const poser = (i, id, w, h) => {
    const r = acc().zoom().r, fin = i + (w - 1) * r + h;
    acc().changer((l) => {
      while (l.length < fin) l.push({ vide: 1 });
      l[i].bd = id;
      l[i].bt = [w, h];
    });
  };
  const retirer = (i) => acc().changer((l) => {
    l[i].bd = null;
    delete l[i].bt;
  });
  const allonger = (n) => {
    const r = acc().zoom().r;
    if (acc().cases().length >= n * r) return;
    acc().changer((l) => {
      while (l.length < n * r) l.push({ vide: 1 });
    });
  };
  const colonnes = () => Math.ceil(acc().cases().length / acc().zoom().r);
  const deLaPlace = () => {
    const a = acc(), l = a.cases(), r = a.zoom().r;
    let der = 0;
    l.forEach((c, i) => {
      if (!c.vide || c.bd != null) der = i;
    });
    allonger(Math.floor(der / r) + 3 + a.visibles());
  };
  const plusDePlace = () => {
    const a = acc(), avant = colonnes();
    allonger(avant + Math.max(3, a.visibles() - 3));
    a.defiler(Math.max(a.decal(), avant - Math.floor(a.visibles() / 2)));
    if (manette) {
      const i = avant * a.zoom().r;
      a.choisir(i);
      voir(i);
    }
    son("zoom+");
    apres();
  };
  const defiler = (d) => {
    const a = acc(), v = a.decal();
    if (d > 0 && a.defiler(v + d) === v) {
      allonger(colonnes() + d);
      a.defiler(v + d);
    } else a.defiler(v + d);
    apres();
  };
  const voir = (i) => {
    const a = acc(), col = Math.floor(i / a.zoom().r), d = a.decal(), v = a.visibles();
    if (col < d + 1) a.defiler(col - 1);
    else if (col > d + v - 2) a.defiler(col - v + 2);
  };
  const adresse = (id) => window.__pcvBadgeURL?.(id) || "";
  let observateur = null;
  const imageDe = (img, id) => Promise.resolve(window.__pcvRessource?.("badges/" + id, "image/png")).then((u) => {
    if (u) img.src = u;
  }).catch(() => {
  });
  const dessinerOnglets = () => {
    const o = $(".onglets");
    o.innerHTML = series.map(({ s }, i) => `<button class="ong${i === ong ? " on" : ""}" data-i="${i}">${s.icone ? `<img data-id="${echap(s.id + "/" + s.icone)}" alt="" draggable="false">` : ""}${echap(s.nom)} <small>${echap(s.sous || "")}</small></button>`).join("");
    o.querySelectorAll("img[data-id]").forEach((im) => imageDe(im, im.dataset.id));
    montrer(o, o.querySelector(".ong.on"));
  };
  const montrer = (zone2, e) => {
    if (!e) return;
    const g = e.offsetLeft - zone2.scrollLeft;
    if (g < 20) zone2.scrollLeft = e.offsetLeft - 20;
    else if (g + e.offsetWidth > zone2.clientWidth - 20) zone2.scrollLeft = e.offsetLeft + e.offsetWidth - zone2.clientWidth + 20;
  };
  const dessinerBande = () => {
    observateur?.disconnect();
    it = Math.min(it, Math.max(0, items().length - 1));
    if (chargement) {
      bande.innerHTML = `<div class="vide-p">La bo\xEEte \xE0 badges s'ouvre\u2026</div>`;
      return;
    }
    if (!series.length) {
      bande.innerHTML = `<div class="vide-p">Pas encore de badges \xE0 poser : gagne-les \xE0 l'arcade (bouton Badges), ils t'attendront ici.</div>`;
      return;
    }
    bande.innerHTML = items().map((o, k) => {
      const large = o.w > o.h, bw = large ? 170 : 80, s = Math.min((bw - 14) / o.w, 66 / o.h);
      return `<div class="it${large ? " large" : ""}" data-k="${k}" data-id="${echap(o.id)}"><img alt="" draggable="false" style="width:calc(var(--u) * ${(o.w * s).toFixed(1)});height:calc(var(--u) * ${(o.h * s).toFixed(1)})">` + (o.morceaux ? `<span class="tag">${o.w}\xD7${o.h}</span>` : o.morceau ? `<span class="tag mo">morceau ${o.morceau.k + 1}/${o.morceau.sur}</span>` : "") + `<em></em></div>`;
    }).join("");
    observateur = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const k = +e.target.dataset.k, im = e.target.querySelector("img");
      if (items()[k] && !im.src) imageDe(im, items()[k].id);
      observateur.unobserve(e.target);
    }), { root: bande, rootMargin: "300px" });
    bande.querySelectorAll(".it").forEach((e) => observateur.observe(e));
    majNombres();
  };
  fins.push(() => observateur?.disconnect());
  const majNombres = () => bande.querySelectorAll(".it").forEach((e) => {
    const o = items()[+e.dataset.k];
    if (!o) return;
    const n = nombre(o);
    e.querySelector("em").textContent = "\xD7" + n;
    e.classList.toggle("zero", n <= 0);
    e.hidden = !!o.freres && n <= 0;
    e.classList.toggle("main", main?.o === o);
    e.classList.toggle("choisi", zone === "palette" && +e.dataset.k === it);
  });
  const montrerItem = () => montrer(bande, bande.querySelector(`.it[data-k="${it}"]`));
  const choisirSerie = (i) => {
    if (!series.length) return son("bord");
    ong = (i + series.length) % series.length;
    it = 0;
    bande.scrollLeft = 0;
    dessinerOnglets();
    dessinerBande();
    son("onglet");
    majAide();
  };
  const majZoom = () => {
    const z = acc()?.zoom();
    if (z) $(".zm span").textContent = `${z.r} rang\xE9es`;
  };
  const majTouches = () => racine.querySelectorAll("u[data-touche]").forEach((e) => {
    const [t, c, h] = window.__pcvTouche?.(+e.dataset.touche) || ["?", "#5b6676"];
    if (h) e.innerHTML = h;
    else e.textContent = t;
    e.style.background = c;
  });
  const glyphe = (b) => {
    const [t, c, h] = window.__pcvTouche?.(b) || ["?", "#5b6676"];
    return `<u style="background:${c}">${h ?? echap(t)}</u>`;
  };
  const majAide = () => {
    const el = $(".aide");
    let h;
    if (porte) h = manette ? `${glyphe(1)} le poser ${glyphe(3)} le rendre \xE0 la bo\xEEte ${glyphe(2)} le remettre` : "Pose-le sur des cases libres. Dans le tiroir, il retourne dans ta bo\xEEte";
    else if (main) {
      const u = adresse(main.o.id), n = nombre(main.o);
      h = `${u ? `<img src="${u}" alt="">` : ""}<b>\xD7${n}</b> en main : ${manette ? `${glyphe(1)} sur une case libre ${glyphe(2)} le reposer` : "touche ou balaie les cases libres, retouche-le dans le tiroir pour le reposer"}`;
    } else if (chargement) h = "La bo\xEEte \xE0 badges s'ouvre\u2026";
    else if (!series.length) h = "D\xE9coration : glisse les badges pos\xE9s, \u2715 pour les rendre \xE0 la bo\xEEte";
    else h = manette ? `${glyphe(1)} prendre un badge ${glyphe(5)} ${glyphe(6)} s\xE9ries ${glyphe(2)} terminer` : "Glisse un badge du tiroir vers une case libre, ou touche-le pour en poser en s\xE9rie";
    el.innerHTML = h;
  };
  const placer = (el, R) => {
    el.style.transform = `translate(${R.x}px, ${R.y}px)`;
    el.style.width = R.l + "px";
    el.style.height = R.h + "px";
  };
  const majSelection = () => {
    const el = $(".choix-b"), c = choisie >= 0 && acc()?.cases()[choisie];
    if (!actif || !c || bdDe(c) == null || geste?.leve || porte) {
      el.hidden = true;
      if (!c || bdDe(c) == null) choisie = -1;
      return;
    }
    const R = rectDe(choisie, ...c.bt || [1, 1]);
    if (!R) return;
    el.hidden = false;
    placer(el, R);
  };
  const empreinte = (i, o, dos = false) => {
    const el = $(".empreinte");
    if (i < 0 || !o) {
      el.hidden = true;
      return;
    }
    const R = rectDe(i, dos ? 1 : o.w, dos ? 1 : o.h);
    if (!R) return;
    el.hidden = false;
    placer(el, R);
    el.classList.toggle("dos", dos);
    el.classList.toggle("non", !dos && !peutPoser(i, o.w, o.h));
    const u = geste?.leve || dos ? "" : adresse(o.id);
    el.style.backgroundImage = u ? `url("${u}")` : "none";
    if (u) acc().habiller(el, o.id, R.l, R.h);
  };
  const viser = (x, y, o) => {
    const d = dossierSous(x, y);
    return d >= 0 ? empreinte(d, o, true) : empreinte(ancre(x, y, o.w, o.h), o);
  };
  const majEmpreinte = () => {
    if (geste?.leve) return;
    const o = porte || main?.o;
    if (!o || !actif) return empreinte(-1);
    if (manette && zone === "grille") {
      const s = acc().sel();
      return acc().cases()[s]?.dossier && !acc().dossier?.() ? empreinte(s, o, true) : empreinte(ancreCurseur(o), o);
    }
    if (survol) return viser(survol.x, survol.y, o);
    empreinte(-1);
  };
  let survol = null;
  const apres = () => {
    if (!actif) return;
    compter();
    majNombres();
    majSelection();
    majEmpreinte();
    majAide();
    majZoom();
    if (main && nombre(main.o) <= 0) {
      main = null;
      majNombres();
      majAide();
    }
  };
  const prendreEnMain = (o) => {
    if (!o) return;
    if (nombre(o) <= 0) {
      son("bord");
      return;
    }
    main = { o };
    son("prendre");
    apres();
  };
  const lacherMain = () => {
    if (!main) return;
    main = null;
    son("retour");
    apres();
  };
  const tamponner = (i) => {
    const o = main?.o;
    if (!o || nombre(o) <= 0 || !peutPoser(i, o.w, o.h)) return false;
    poser(i, o.id, o.w, o.h);
    acc().choisir(i);
    choisie = -1;
    son("colle");
    apres();
    return true;
  };
  const rendre = (i) => {
    const an = ancreDe(i), c = acc().cases()[an];
    if (c?.dossier) {
      if (!acc().decoller?.(an)) return son("bord");
    } else if (c?.bd == null) return son("bord");
    else retirer(an);
    choisie = -1;
    son("retour");
    apres();
  };
  const lever = (an) => {
    const c = acc().cases()[an];
    if (c?.dossier) {
      const e = acc().decoller?.(an);
      if (!e) return false;
      porte = { id: e.bd, w: e.bt?.[0] || 1, h: e.bt?.[1] || 1, de: an, dos: true };
      choisie = -1;
      son("prendre");
      return true;
    }
    if (c?.bd == null) return false;
    porte = { id: c.bd, w: c.bt?.[0] || 1, h: c.bt?.[1] || 1, de: an };
    retirer(an);
    choisie = -1;
    son("prendre");
    return true;
  };
  const ranger = (j, o) => {
    if (!porte && nombre(o) <= 0) return son("bord"), false;
    if (!acc().deposer?.(j, { vide: 1, bd: o.id, bt: [o.w, o.h] })) return son("bord"), false;
    choisie = -1;
    son("colle");
    return true;
  };
  const reposerPorte = () => {
    if (!porte) return;
    const p = porte;
    porte = null;
    if (p.dos) acc().deposer?.(p.de, { vide: 1, bd: p.id, bt: [p.w, p.h] }, true);
    else if (peutPoser(p.de, p.w, p.h)) poser(p.de, p.id, p.w, p.h);
  };
  const fantome = $(".fantome");
  const montrerFantome = (o, src) => {
    if (!G()) return;
    const [l, h] = acc().boite(o.w, o.h).map((x) => x * 1.06);
    fantome.style.width = l + "px";
    fantome.style.height = h + "px";
    fantome.style.backgroundImage = src ? `url("${src}")` : "none";
    acc().habiller(fantome, o.id, l, h);
    fantome.hidden = false;
  };
  const sousTiroir = (y) => y > tiroir.getBoundingClientRect().top;
  const traine = () => {
    const o = porte || geste.o, x = geste.x - geste.ox, y = geste.y - geste.oy;
    fantome.style.transform = `translate(${x - fantome.offsetWidth / 2}px, ${y - fantome.offsetHeight / 2}px)`;
    const rentre = sousTiroir(geste.y);
    tiroir.classList.toggle("depot", rentre && !!porte);
    if (rentre) empreinte(-1);
    else viser(x, y, o);
    bordure();
  };
  const peindre = () => {
    const o = main?.o, p = G()?.p;
    if (!o || !p) return;
    const n = Math.max(1, Math.ceil(Math.hypot(geste.x - geste.px, geste.y - geste.py) / (p / 3)));
    for (let k = 1; k <= n && main; k++) {
      const i = ancre(geste.px + (geste.x - geste.px) * k / n, geste.py + (geste.y - geste.py) * k / n, o.w, o.h);
      if (i < 0 || geste.faites.has(i)) continue;
      geste.faites.add(i);
      if (tamponner(i)) geste.pose = true;
    }
    geste.px = geste.x;
    geste.py = geste.y;
    bordure();
  };
  let bordT = 0;
  const sens = () => {
    const u = U();
    return !geste || sousTiroir(geste.y) ? 0 : geste.x < 70 * u ? -1 : geste.x > innerWidth - 70 * u ? 1 : 0;
  };
  const bordure = () => {
    if (bordT || !sens()) return;
    bordT = setInterval(() => {
      const s = sens();
      if (!s || geste?.type !== "peindre" && !geste?.leve) {
        clearInterval(bordT);
        bordT = 0;
        return;
      }
      defiler(s);
      if (geste.type === "peindre") {
        geste.faites.clear();
        geste.px = geste.x;
        geste.py = geste.y;
        peindre();
      } else traine();
    }, 330);
  };
  fins.push(() => clearInterval(bordT));
  const panoramique = () => {
    const g = acc().grille(), p = G()?.p;
    if (!p) return;
    g.style.transition = "none";
    g.style.transform = `translateX(${-geste.decal0 * p + geste.x - geste.x0}px)`;
    $(".choix-b").hidden = true;
    $(".empreinte").hidden = true;
  };
  const finPanoramique = () => {
    const g = acc().grille(), p = G()?.p;
    g.style.transition = "";
    if (p) acc().defiler(Math.round(geste.decal0 - (geste.x - geste.x0) / p));
    apres();
  };
  const bas = (e) => {
    if (!actif || e.button > 0 || !e.target.closest?.("#pcv-console")) return;
    e.stopPropagation();
    if (geste) {
      if (!e.isPrimary) return;
      abandon();
    }
    if (porte) {
      reposerPorte();
      apres();
    }
    window.__pcvBarreQuitter?.();
    manette = false;
    racine.classList.remove("manette");
    survol = null;
    const a = acc(), i = ancre(e.clientX, e.clientY), an = i >= 0 && i < a.cases().length ? ancreDe(i) : -1, bd = an >= 0 ? bdDe(a.cases()[an]) : null;
    const suite = bd != null && main?.o.id === bd;
    const type = bd != null && !suite ? "badge" : main && i >= 0 && (suite || i >= a.cases().length || a.libre(i)) ? "peindre" : "glisse";
    geste = { type, id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, i, an, decal0: Math.max(0, a.decal()), loin: false, faites: /* @__PURE__ */ new Set(), ox: 0, oy: 0 };
    if (type === "badge") {
      const R = rectDe(an, ...a.cases()[an].bt || [1, 1]);
      geste.ox = e.clientX - (R.x + R.l / 2);
      geste.oy = e.clientY - (R.y + R.h / 2);
    }
    if (type === "peindre") peindre();
  };
  document.addEventListener("pointerdown", bas, true);
  fins.push(() => document.removeEventListener("pointerdown", bas, true));
  bande.addEventListener("pointerdown", (e) => {
    if (!actif || e.button > 0) return;
    if (geste) {
      if (!e.isPrimary) return;
      abandon();
    }
    if (porte) {
      reposerPorte();
      apres();
    }
    const el = e.target.closest(".it");
    manette = false;
    racine.classList.remove("manette");
    survol = null;
    geste = {
      type: "palette",
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      x: e.clientX,
      y: e.clientY,
      o: el ? items()[+el.dataset.k] : null,
      el,
      s0: bande.scrollLeft,
      souris: e.pointerType === "mouse",
      loin: false,
      ox: 0,
      oy: 0
    };
    if (geste.souris) e.preventDefault();
  });
  const bouge = (e) => {
    if (!geste || e.pointerId !== geste.id) {
      if (actif && e.pointerType === "mouse" && !geste && (main || porte)) {
        survol = e.target.closest?.("#pcv-console") ? { x: e.clientX, y: e.clientY } : null;
        majEmpreinte();
      }
      return;
    }
    geste.x = e.clientX;
    geste.y = e.clientY;
    const dx = geste.x - geste.x0, dy = geste.y - geste.y0;
    if (!geste.loin && Math.hypot(dx, dy) > PALIER) geste.loin = true;
    if (geste.type === "glisse") {
      if (geste.loin) panoramique();
    } else if (geste.type === "peindre") peindre();
    else if (geste.type === "badge") {
      if (geste.loin && !geste.leve) {
        if (!lever(geste.an)) {
          geste = null;
          return;
        }
        geste.leve = true;
        montrerFantome(porte, adresse(porte.id));
        majAide();
      }
      if (geste.leve) traine();
    } else if (geste.type === "palette") {
      if (!geste.leve && !geste.defile && geste.loin) {
        if (geste.o && -dy > Math.abs(dx)) {
          if (nombre(geste.o) <= 0) {
            son("bord");
            geste.type = "fini";
            return;
          }
          geste.leve = true;
          montrerFantome(geste.o, geste.el?.querySelector("img")?.src || adresse(geste.o.id));
          son("prendre");
        } else if (geste.souris) geste.defile = true;
      }
      if (geste.defile) bande.scrollLeft = geste.s0 - dx;
      if (geste.leve) traine();
    }
  };
  const finGeste = () => {
    clearInterval(bordT);
    bordT = 0;
    fantome.hidden = true;
    tiroir.classList.remove("depot");
    geste = null;
  };
  const haut = (e) => {
    const g = geste;
    if (!g || e.pointerId !== g.id) return;
    if (e.pointerType === "mouse" && e.target.closest?.("#pcv-console")) survol = { x: e.clientX, y: e.clientY };
    if (g.type === "glisse") {
      if (g.loin) finPanoramique();
      else if (g.i >= 0 && g.i < acc().cases().length) {
        acc().choisir(g.i);
        choisie = -1;
        son("bouge");
      }
    } else if (g.type === "badge" && !g.leve || g.type === "peindre" && !g.pose && !g.loin && bdDe(acc().cases()[g.an]) != null) {
      acc().choisir(g.an);
      choisie = g.an;
      son("bouge");
    } else if (g.type === "peindre") {
      if (!g.pose && !g.loin) son("bord");
    } else if (g.type === "palette" && !g.leve) {
      if (!g.loin && g.o) {
        if (main?.o === g.o) lacherMain();
        else prendreEnMain(g.o);
      }
    } else if (g.leve) {
      const o = porte || g.o, x = g.x - g.ox, y = g.y - g.oy, rentre = sousTiroir(g.y), i = rentre ? -1 : ancre(x, y, o.w, o.h), dos = rentre ? -1 : dossierSous(x, y);
      if (rentre) {
        if (porte) {
          porte = null;
          son("retour");
        }
      } else if (dos >= 0) {
        if (ranger(dos, o)) {
          if (porte) porte = null;
          else main = { o };
        } else reposerPorte();
      } else if (i >= 0 && peutPoser(i, o.w, o.h) && (porte || nombre(o) > 0)) {
        poser(i, o.id, o.w, o.h);
        acc().choisir(i);
        son(porte ? "poser" : "colle");
        if (porte) porte = null;
        else main = { o };
      } else {
        son("bord");
        reposerPorte();
      }
    }
    finGeste();
    apres();
  };
  const abandon = () => {
    if (geste.type === "glisse" && geste.loin) finPanoramique();
    reposerPorte();
    finGeste();
    apres();
  };
  const perdu = (e) => {
    if (geste && e.pointerId === geste.id) abandon();
  };
  window.addEventListener("pointermove", bouge);
  window.addEventListener("pointerup", haut);
  window.addEventListener("pointercancel", perdu);
  fins.push(() => {
    removeEventListener("pointermove", bouge);
    removeEventListener("pointerup", haut);
    removeEventListener("pointercancel", perdu);
  });
  let molette = 0;
  const tourne = (e) => {
    if (!actif) return;
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (e.target.closest?.("#pcv-deco .bande, #pcv-deco .onglets")) {
      e.target.closest(".bande, .onglets").scrollLeft += d;
      e.preventDefault();
      return;
    }
    if (!e.target.closest?.("#pcv-console") || performance.now() - molette < 120) return;
    molette = performance.now();
    defiler(Math.sign(d));
  };
  window.addEventListener("wheel", tourne, { passive: false });
  fins.push(() => removeEventListener("wheel", tourne));
  racine.addEventListener("contextmenu", (e) => e.preventDefault());
  $(".onglets").addEventListener("click", (e) => {
    const b = e.target.closest(".ong");
    if (b) choisirSerie(+b.dataset.i);
  });
  $(".fl.g").onclick = () => {
    defiler(-Math.max(1, acc().visibles() - 2));
    son("bouge");
  };
  $(".fl.d").onclick = () => {
    defiler(Math.max(1, acc().visibles() - 2));
    son("bouge");
  };
  $(".bt.place").onclick = () => plusDePlace();
  $(".bt.fin").onclick = () => fermer();
  $(".choix-b button").onclick = () => rendre(choisie);
  racine.querySelectorAll(".zm button").forEach((b) => b.onclick = () => zoomer(+b.dataset.z));
  addEventListener("resize", apres);
  fins.push(() => removeEventListener("resize", apres));
  const zoomer = (d) => {
    const a = acc(), Z = a.zooms(), n = a.zoom().i + d;
    if (!Z[n] || Z[n].r < RANGEES.min || Z[n].r > RANGEES.max) return son("bord");
    a.zoomer(d);
    ecrire(RANGEES.cle, Z[n].r);
    deLaPlace();
    apres();
  };
  const bougerCurseur = (b) => {
    const a = acc(), r = a.zoom().r, s = a.sel(), row = s % r;
    let n = s;
    if (b === 11) n = s - r;
    else if (b === 12) n = s + r;
    else if (b === 9) {
      if (row === 0) return son("bord");
      n = s - 1;
    } else if (b === 10) {
      if (row === r - 1) {
        zone = "palette";
        son("bouge");
        return apres();
      }
      n = s + 1;
    }
    if (n < 0) return son("bord");
    if (n >= a.cases().length) allonger(Math.floor(n / r) + 1);
    a.choisir(n);
    voir(n);
    choisie = bdDe(a.cases()[ancreDe(n)]) != null ? ancreDe(n) : -1;
    son("bouge");
    apres();
  };
  const touche = (b) => {
    if (!actif || b < 1 || b > 12) return false;
    if (!manette) {
      manette = true;
      racine.classList.add("manette");
    }
    const a = acc();
    if (b === 2) {
      if (porte) {
        reposerPorte();
        son("retour");
        apres();
      } else if (main) lacherMain();
      else fermer();
      return true;
    }
    if (b === 5 || b === 6) {
      choisirSerie(ong + (b === 6 ? 1 : -1));
      return true;
    }
    if (b === 4) {
      plusDePlace();
      return true;
    }
    if (zone === "palette") {
      const l = items(), pas = (d) => {
        let k = it;
        do
          k += d;
        while (bande.querySelector(`.it[data-k="${k}"]`)?.hidden);
        return k;
      };
      if (b === 11 || b === 12) {
        const k = pas(b === 12 ? 1 : -1);
        if (k < 0 || k >= l.length) return son("bord"), true;
        it = k;
        montrerItem();
        son("bouge");
      } else if (b === 1) {
        if (!l[it] || nombre(l[it]) <= 0) return son("bord"), true;
        main = { o: l[it] };
        zone = "grille";
        son("prendre");
        voir(a.sel());
      } else if (b === 9) {
        zone = "grille";
        son("bouge");
        voir(a.sel());
      } else son("bord");
      apres();
      return true;
    }
    if (b >= 9) {
      bougerCurseur(b);
      return true;
    }
    const s = a.sel();
    if (b === 1) {
      const dos = a.cases()[s]?.dossier && !a.dossier?.();
      if (dos && (porte || main)) {
        if (ranger(s, porte || main.o) && porte) porte = null;
      } else if (porte) {
        const k = ancreCurseur(porte);
        if (!peutPoser(k, porte.w, porte.h)) return son("bord"), true;
        poser(k, porte.id, porte.w, porte.h);
        porte = null;
        son("poser");
      } else if (main) {
        if (!tamponner(ancreCurseur(main.o))) son("bord");
      } else if (bdDe(a.cases()[ancreDe(s)]) != null) {
        const an = ancreDe(s);
        lever(an);
        a.choisir(an);
      } else son("bord");
      apres();
      return true;
    }
    if (b === 3) {
      if (porte) {
        porte = null;
        son("retour");
        apres();
      } else rendre(s);
      return true;
    }
    return true;
  };
  const attendre = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const ouvrir = async (o = {}) => {
    for (let k = 0; k < 25 && !(accueilVisible() && !acc().recouvert()); k++) await attendre(150);
    if (!accueilVisible() || acc().recouvert()) {
      son("bord");
      return false;
    }
    if (!actif) {
      actif = true;
      zone = "palette";
      main = null;
      porte = null;
      choisie = -1;
      it = 0;
      survol = null;
      const a = acc();
      if (a.dossier?.()) {
        a.fermerDossier();
        o = { ...o, case: void 0 };
      }
      a.decoration(true);
      grilleOuverte = a;
      const Z = a.zooms(), voulu = Math.max(RANGEES.min, Math.min(RANGEES.max, +lire(RANGEES.cle, RANGEES.depart) || RANGEES.depart)), zi = Z.findIndex((z) => z.r === voulu);
      if (zi >= 0 && zi !== a.zoom().i) a.zoomer(zi - a.zoom().i);
      deLaPlace();
      const premiere = a.cases().findIndex((x, i) => a.libre(i));
      const c = o.case != null && o.case < a.cases().length ? o.case : o.badge && premiere >= 0 ? premiere : a.sel();
      a.choisir(c);
      voir(c);
      document.body.classList.add("pcv-deco");
      racine.hidden = false;
      majTouches();
      void racine.offsetWidth;
      racine.classList.add("on");
      son("choisir");
      chargement = catalogue();
      dessinerOnglets();
      dessinerBande();
      apres();
      try {
        await chargement;
      } catch (e) {
        series = [];
      }
      chargement = null;
      if (!actif) return true;
      dessinerOnglets();
      dessinerBande();
      apres();
    } else if (chargement) await chargement.catch(() => {
    });
    if (o.badge) {
      const de = arc()?.info?.(o.badge)?.morceau?.de, dispo = (id) => series.some((x) => x.items.some((y) => y.id === id && nombre(y) > 0));
      const voulu = !dispo(o.badge) && de && dispo(de) ? de : o.badge;
      const s = series.findIndex((x) => x.items.some((y) => y.id === voulu));
      if (s >= 0) {
        if (s !== ong) {
          ong = s;
          dessinerOnglets();
          dessinerBande();
        }
        it = items().findIndex((y) => y.id === voulu);
        montrerItem();
        prendreEnMain(items()[it]);
        if (main) zone = "grille";
        apres();
      } else son("bord");
    }
    return true;
  };
  const fermer = (silence) => {
    if (!actif) return;
    const meme = !!acc() && acc() === grilleOuverte;
    if (meme) reposerPorte();
    porte = null;
    clearInterval(bordT);
    bordT = 0;
    geste = null;
    main = null;
    choisie = -1;
    survol = null;
    actif = false;
    fantome.hidden = true;
    $(".empreinte").hidden = true;
    $(".choix-b").hidden = true;
    racine.classList.remove("on", "manette");
    document.body.classList.remove("pcv-deco");
    setTimeout(() => {
      if (!actif) racine.hidden = true;
    }, 450);
    if (meme) grilleOuverte.decoration(false);
    grilleOuverte = null;
    if (!silence) son("retour");
  };
  fins.push(() => {
    if (actif) fermer(true);
    document.body.classList.remove("pcv-deco");
  });
  (window.__pcvManette ||= {}).deco = (b) => actif && accueilVisible() && !acc().recouvert() ? touche(b) : false;
  const ordre = () => {
    const o = window.__pcvOrdre;
    if (!Array.isArray(o) || o.includes("deco")) return;
    const k = o.indexOf("place");
    o.splice(k < 0 ? o.length : k, 0, "deco");
  };
  const clavier = (e) => {
    if (!actif || !accueilVisible() || acc().recouvert() || document.activeElement?.matches?.("input,textarea")) return;
    if (e.key === "-" || e.key === "+") zoomer(e.key === "+" ? 1 : -1);
    else {
      const k = { ArrowLeft: 11, ArrowRight: 12, ArrowUp: 9, ArrowDown: 10, Enter: 1, Escape: 2, x: 3, y: 4, q: 5, PageUp: 5, e: 6, PageDown: 6 }[e.key];
      if (!k || !touche(k)) return;
    }
    e.stopImmediatePropagation();
    e.preventDefault();
  };
  window.addEventListener("keydown", clavier, true);
  fins.push(() => removeEventListener("keydown", clavier, true));
  document.querySelector("#pcv-console .pcv-decorer")?.remove();
  const tic = setInterval(() => {
    ordre();
    if (actif && (!accueilVisible() || acc() !== grilleOuverte)) fermer(true);
    racine.classList.toggle("cache", actif && !!acc()?.recouvert());
  }, 300);
  fins.push(() => {
    clearInterval(tic);
    document.querySelector("#pcv-console .pcv-decorer")?.remove();
    const o = window.__pcvOrdre;
    if (Array.isArray(o) && o.includes("deco")) o.splice(o.indexOf("deco"), 1);
    delete window.__pcvManette?.deco;
  });
  ordre();
  window.__pcvDeco = {
    ouvrir,
    fermer: () => fermer(),
    actif: () => actif,
    touche,
    etat: () => ({ actif, zone, ong, it, main: main?.o.id || null, porte: porte?.id || null, series: series.map((x) => x.s.id), choisie })
  };
  return "d\xE9coration pr\xEAte";
})();
