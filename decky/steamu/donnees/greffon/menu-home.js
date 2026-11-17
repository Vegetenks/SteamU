(() => {
  window.__pcvHomeFin?.();
  const { O, principale, devant, esc, flouSuspendre, brute, apresEntree, floue, ico, pastille, etat, bouton, ecran } = window.__pcvPE, d = document;
  const B = window.__pcvBridge;
  const T = (k, f, vars) => {
    try {
      return (window.__pcvT || principale().m_BrowserWindow.__pcvT)?.(k, vars) ?? f;
    } catch (x) {
      return f;
    }
  };
  const PLACE_VIDE = "manette-inconnue";
  const H = window.__pcvHomeIcones;
  const applis = () => {
    const m = H.lire();
    return H.rangee(m).map((a) => {
      const s = H.SYSTEME.find((x) => x[0] === a);
      if (s) return [a, T(s[1], ""), s[2], s[3], s[4]];
      const g = m.greffons[H.route(a)], c = H.couleur(g);
      return [a, g.nom, g.svg || "prise", c + ", " + c];
    });
  };
  let APPLIS = applis();
  const icones = () => APPLIS.map(([a, n, p, , dessin], i) => `<div class="icone entre" style="--d:${(0.22 + i * 0.03).toFixed(2)}s" data-a="${esc(a)}">${window.__pcvIcones.relief(p, "var(--pcv-email-bas)", dessin)}<span class="nom">${esc(n)}</span></div>`).join("");
  const fondDe = (f) => {
    let F = {};
    try {
      F = principale().m_BrowserWindow.__pcvApplis || {};
    } catch (x) {
    }
    return H.fond(f, F);
  };
  const peindreFonds = () => e.racine.querySelectorAll(".icone").forEach((el, i) => {
    const [haut, bas] = fondDe(APPLIS[i][3]);
    el.style.setProperty("--pcv-email-haut", haut);
    el.style.setProperty("--pcv-email-bas", bas);
  });
  const ajuster = () => {
    const l = [...e.racine.querySelectorAll(".icones .icone")].filter((x) => getComputedStyle(x).display !== "none");
    e.$(".icones").classList.toggle("serre", l.length > 9);
    const noms = l.map((x) => x.querySelector(".nom"));
    noms.forEach((n) => window.__pcvTenirMot(n));
    const t = Math.min(...noms.map((n) => parseFloat(getComputedStyle(n).fontSize)));
    noms.forEach((n) => {
      n.style.fontSize = t + "px";
    });
  };
  const son = (g) => {
    try {
      principale().m_BrowserWindow.__pcvSon?.(g);
    } catch (x) {
    }
  };
  const rangerIcone = (el) => el.matches(".icones .icone") && { verbe: T("touche.deplacer", "D\xE9placer"), poser: (ordre) => {
    H.rangement(ordre, 0).poser();
    APPLIS = applis();
  } };
  const html = `<div class="pilule verre moi entre" style="--d:.15s" data-a="amis"><span class="photo"></span><div><b class="pseudo"></b><small>\u25CF ${T("home.en_ligne", "En ligne")}</small></div></div>
    <div class="pilule verre titre entre" style="--d:.15s">${ico("accueil")}${T("home.titre_menu", "Menu HOME")}</div>${etat()}
    <div class="jeu verre entre"><div class="instantane"><div class="enpause">${ico("pause")}${T("home.en_pause", "En pause")}</div><div class="logo"></div></div>
      <div class="infos"><div class="sur">${T("home.sur", "Logiciel en cours")}</div><h1></h1><div class="temps"><span>${ico("horloge")}<b class="session"></b></span><small class="total"></small></div></div></div>
    <div class="actions">
      <div class="bouton reprendre entre" style="--d:.08s" data-a="reprendre">${pastille("lecture")}${T("home.reprendre", "Reprendre")}</div>
      ${bouton("controleur", "", 0.12, "var(--c-manette)", "manette", `<div>${T("home.controleur", "Contr\xF4leur")}<small>${T("home.controleur.aide", "param\xE8tres de ce jeu")}</small></div>`)}
      ${bouton("fiche", "", 0.16, "var(--c-medias)", "info", `<div>${T("home.fiche_titre", "Fiche du jeu")}<small>${T("home.fiche.aide", "guides, notes, infos")}</small></div>`)}
      ${bouton("fermer", "quitter", 0.2, "", "sortie", T("home.fermer", "Fermer le logiciel"))}</div>
    <div class="aucun"><p class="entre" style="--d:.06s">${T("home.aucun_jeu", "Aucun jeu en cours.")}</p><div class="choix-h">
      ${bouton("aller:accueil", "", 0.1, "var(--c-accueil)", "accueil", T("home.accueil", "Accueil"))}
      ${bouton("mode-emploi", "", 0.14, "var(--c-param)", "aide", `<div>${T("home.mode_emploi", "Mode d'emploi")}<small>${T("home.mode_emploi.aide", "l'aide de SteamU")}</small></div>`)}</div></div>
    <div class="icones">${icones()}</div><p class="rangement pcv-aide-rangement" hidden></p>
    <div class="bas-g"><div class="pilule verre alim entre" style="--d:.46s" data-a="aller:alimentation">${pastille("alimentation")}${T("home.alimentation", "Alimentation")}</div>
      <div class="joueurs entre" style="--d:.46s" data-a="manettes">${[1, 2, 3, 4].map((n) => `<span class="joueur vide"><b>${n}</b>${ico(PLACE_VIDE)}<i></i></span>`).join("")}</div></div>
    <div class="voile fermer" hidden><div class="fenetre verre pcv-fenetre"><span class="pastille grosse">${ico("sortie")}</span><h2></h2><p>${T("home.fermer_perte", "Les donn\xE9es non sauvegard\xE9es seront perdues.")}</p>
      <div class="choix">${bouton("fermer-ok", "", 0, "var(--c-quitter)", "sortie", T("home.fermer", "Fermer le logiciel"))}${bouton("retour", "premier", 0, "var(--c-accueil)", "fleche", T("home.annuler", "Annuler"))}</div></div></div>
    <div class="voile fiche" hidden><div class="fenetre verre pcv-fenetre"><h2>${T("home.fiche_titre", "Fiche du jeu")}</h2><div class="choix"></div></div></div>`;
  const FICHE = { details: [T("home.fiche.infos", "Infos"), "info", "var(--c-medias)"], guides: [T("home.fiche.guides", "Guides"), "livre"], notes: [T("home.fiche.notes", "Notes"), "crayon"], recording: [T("home.fiche.enregistrements", "Enregistrements"), "video"] };
  const DEJA = /* @__PURE__ */ new Set(["resume", "controller-settings", "exit"]);
  const { IMG, CDN, perso, debut } = window.__pcvJeuOutils;
  const premiere = (l) => new Promise((ok) => {
    const un = (k) => {
      if (k >= l.length) return ok(null);
      const im = new Image();
      im.onload = () => ok(im);
      im.onerror = () => un(k + 1);
      im.src = new URL(l[k], "https://steamloopback.host/").href;
    };
    un(0);
  });
  const reduites = {};
  const reduire = async (im, max) => {
    const b = await (await fetch(im.src)).blob();
    const r = await createImageBitmap(b, { resizeWidth: max, resizeHeight: Math.round(im.naturalHeight * max / im.naturalWidth), resizeQuality: "high" });
    const c = d.createElement("canvas");
    c.width = r.width;
    c.height = r.height;
    c.getContext("2d").drawImage(r, 0, 0);
    r.close();
    return new Promise((ok, non) => c.toBlob((x) => x ? ok(URL.createObjectURL(x)) : non(), "image/png"));
  };
  const poserImage = (v, l, max) => {
    d.documentElement.style.removeProperty(v);
    premiere(l).then(async (im) => {
      if (!im) return;
      let u = im.src;
      if (max && im.naturalWidth > max) try {
        u = await reduire(im, max);
        URL.revokeObjectURL(reduites[v]);
        reduites[v] = u;
      } catch (x) {
      }
      d.documentElement.style.setProperty(v, `url(${JSON.stringify(u)})`);
    });
  };
  const duree = (min) => {
    const m = Math.max(0, Math.round(min)), hh = Math.floor(m / 60);
    return hh ? `${hh} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`;
  };
  const jeu = () => {
    try {
      const a = B.runningApp();
      return a && (B.appOverview(a.appid) || a);
    } catch (x) {
      return null;
    }
  };
  const appli = () => {
    try {
      return principale().m_BrowserWindow.__pcvEcran?.appli?.() || null;
    } catch (x) {
      return null;
    }
  };
  const peindreAppli = (p) => {
    appVue = null;
    e.$("h1").textContent = p.nom;
    e.$(".session").textContent = e.$(".total").textContent = "";
    e.$(".fermer h2").textContent = T("home.fermer_titre", "Fermer {nom} ?", { nom: p.nom });
    e.$(".logo").innerHTML = p.html;
    d.documentElement.style.removeProperty("--pcv-home-logo");
    vignetteImage(`linear-gradient(160deg, ${p.fond})`);
  };
  let appVue = null;
  const peindreJeu = (a) => {
    const $ = e.$;
    $(".session").textContent = T("home.lance_depuis", "lanc\xE9 depuis {duree}", { duree: duree((Date.now() / 1e3 - debut(a)) / 60) });
    const total = +a.minutes_playtime_forever;
    $(".total").textContent = total > 0 ? T("home.temps_total", "{temps} au total", { temps: duree(total) }) : "";
    if (appVue === a.appid) return;
    appVue = a.appid;
    $(".logo").textContent = "";
    $("h1").textContent = (a.display_name || "").replace(/\s*:\s+/, " :\n");
    $(".fermer h2").textContent = T("home.fermer_titre", "Fermer {nom} ?", { nom: a.display_name || T("home.logiciel", "le logiciel") });
    poserImage("--pcv-home-logo", [...perso("GetCustomLogoImageURLs", a), IMG(a.appid, "logo.png"), CDN(a.appid, "logo.png")], LOGO_MAX);
  };
  const LOGO_MAX = 640;
  const etatPause = (gele) => {
    const a = jeu();
    e.racine.classList.toggle("continue", gele === false);
    e.$(".enpause").innerHTML = gele === null ? "" : gele === false ? `${ico("lecture")}${T("home.continue", "Le jeu continue")}` : `${ico("pause")}${T("home.en_pause", "En pause")}`;
    e.racine.classList.toggle("sans-y", !O.__pcvPauseActive?.());
    e.$(".pause-txt").textContent = a && O.__pcvPauseJamais?.(a.appid) ? T("home.pause_mettre", "Mettre en pause") : T("home.pause_laisser", "Laisser tourner");
  };
  const basculerPause = async () => {
    const a = jeu();
    if (!a || !O.__pcvPauseActive?.() || e.racine.querySelector(".voile:not([hidden])")) return;
    const libre = !O.__pcvPauseJamais(a.appid);
    O.__pcvPauseExempter(a.appid, libre);
    son("choisir");
    etatPause(null);
    if (!libre) {
      couper();
      return figer(a.appid);
    }
    await O.__pcvJeuReprendre?.(true);
    fige(false);
    etatPause(false);
    enDirect(a);
  };
  const SEUIL_IPS = 55, SEUIL_EFFONDRE = 20, PALIERS_IPS = [30, 15, 8, 4], ATTENTE_DIRECT_MS = 2e3, EN_VOL = 2;
  let direct = null, directs = 0;
  const apercu = (m, ...a) => B.callPlugin(window.__pcvGreffon.nom, m, ...a).catch(() => null);
  const garder = (im) => {
    if (!im?.vu || !menuOuvert()) return;
    image = { w: im.width, h: im.height };
    im.toBlob((b) => b && d.documentElement.style.setProperty("--pcv-home-image", `url(${JSON.stringify(URL.createObjectURL(b))})`), "image/jpeg", 0.9);
  };
  const etatApercu = (x) => {
    const w = window.opener || window;
    w.__pcvHomeApercuEtat = { ...w.__pcvHomeApercuEtat, ...x, t: Date.now() };
  };
  const couper = () => {
    directs++;
    etatApercu({ direct: false });
    e.racine.classList.remove("en-direct");
    garder(direct);
    direct = null;
    d.querySelectorAll("canvas.direct").forEach((x) => x.remove());
  };
  const noire = (im) => {
    const c = d.createElement("canvas");
    c.width = 16;
    c.height = 9;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(im, 0, 0, 16, 9);
    return x.getImageData(0, 0, 16, 9).data.every((v, i) => i % 4 === 3 || v < 4);
  };
  const enDirect = async (a) => {
    couper();
    if (econome()) return;
    const n = ++directs, u = await apercu("apercu");
    if (u) O.__pcvApercu ||= u.replace(/\/direct$/, "");
    await apresEntree();
    if (n !== directs || !u || !menuOuvert() || e.racine.classList.contains("fige")) {
      if (n === directs) couper();
      return;
    }
    const im = direct = Object.assign(d.createElement("canvas"), { className: "direct" });
    e.$(".instantane").prepend(im);
    const r = e.$(".instantane").getBoundingClientRect(), cible = { w: Math.round(r.width * devicePixelRatio) || 730, h: Math.round(r.height * devicePixelRatio) || 410 };
    let palier = 0, demandes = 0, peinte = 0;
    for (let v = 0; v < EN_VOL; v++) (async () => {
      while (n === directs) {
        const t = performance.now(), m = ++demandes;
        try {
          if (await brute(`${u}?l=${cible.w}`, im, () => n === directs && m > peinte && (peinte = m), cible)) im.vu = true;
        } catch (x) {
          if (n === directs) couper();
          return;
        }
        await new Promise((ok) => setTimeout(ok, EN_VOL * 1e3 / PALIERS_IPS[palier] - (performance.now() - t)));
      }
    })();
    const t0 = performance.now();
    let vu = false, juge = false, lent = 0, t1 = 0, k = 0;
    const veiller = (t) => {
      if (n !== directs) return;
      if (!vu) {
        if (im.vu) {
          if (noire(im)) return couper();
          vu = true;
          t1 = t;
          e.racine.classList.add("en-direct");
          d.querySelectorAll(".instantane canvas.brute:not(.flou)").forEach((x) => x.remove());
        } else if (t - t0 > ATTENTE_DIRECT_MS) return couper();
      } else if (++k, t - t1 >= 1e3) {
        const ips = k * 1e3 / (t - t1);
        etatApercu({ direct: true, ips: Math.round(ips), palier, vise: PALIERS_IPS[palier], econome: eco });
        lent = juge && ips < (palier < PALIERS_IPS.length - 1 ? SEUIL_IPS : SEUIL_EFFONDRE) ? lent + 1 : 0;
        if (lent >= (palier === PALIERS_IPS.length - 1 ? 2 : 1)) {
          if (palier === PALIERS_IPS.length - 1) return couper();
          palier++;
          lent = 0;
          juge = false;
        } else juge = true;
        t1 = t;
        k = 0;
      }
      requestAnimationFrame(veiller);
    };
    requestAnimationFrame(veiller);
  };
  const vignette = (a) => {
    const n = ++vignettes;
    image = null;
    eco = econome();
    if (econome()) {
      heros(a);
      e.entrer();
      return Promise.resolve();
    }
    const ancienne = O.__pcvPhotoJeu?.appid === a.appid ? O.__pcvPhotoJeu : null, vieille = ancienne?.net;
    vignetteImage(vieille && `url(${JSON.stringify(vieille)})`, ancienne?.flou);
    d.querySelectorAll(".instantane canvas.brute").forEach((x) => x.remove());
    const poser = (p) => {
      if (n === vignettes && p.net) vignetteImage(`url(${JSON.stringify(p.net)})`, p.flou);
    };
    return e.fondJeu(true).then((p) => {
      if (!p) throw 0;
      if (n !== vignettes) return;
      if (!p.pret) {
        poser(p);
        return retrecir(p.net);
      }
      if (!p.toile) return p.pret.then(() => {
        if (!p.net) throw 0;
        poser(p);
        retrecir(p.net);
      });
      const fl = Object.assign(floue(p.toile), { className: "brute flou" });
      p.toile.className = "brute";
      e.$(".instantane").append(fl, p.toile);
      retrecir(p.toile);
      p.pret.then(() => {
        if (!p.net) return;
        const j = new Image();
        j.src = p.net;
        return j.decode().catch(() => {
        }).then(() => {
          poser(p);
          requestAnimationFrame(() => requestAnimationFrame(() => {
            for (const x of [fl, p.toile]) if (x.classList.contains("brute")) x.remove();
          }));
        });
      });
    }).catch(() => {
      if (n !== vignettes) return;
      image = null;
      if (!vieille && !devant()) heros(a);
      e.entrer();
    });
  };
  const heros = (a) => {
    vignetteImage();
    poserImage("--pcv-home-image", [...perso("GetCustomHeroImageURLs", a), IMG(a.appid, "library_hero.jpg"), CDN(a.appid, "library_hero.jpg")]);
  };
  const vignetteImage = (image2, flou2) => {
    const s = d.documentElement.style;
    if (image2) s.setProperty("--pcv-home-image", image2);
    else s.removeProperty("--pcv-home-image");
    if (flou2) {
      s.setProperty("--pcv-home-flou", `url(${JSON.stringify(flou2)})`);
      s.setProperty("--pcv-home-taille", "contain");
    } else {
      s.removeProperty("--pcv-home-flou");
      s.removeProperty("--pcv-home-taille");
    }
  };
  let vignettes = 0, image = null;
  const econome = () => !!window.__pcvModes?.coupe("apercus");
  let eco = false;
  const surModes = () => {
    const a = jeu();
    if (!menuOuvert() || !a || eco === econome()) return;
    eco = econome();
    couper();
    vignette(a).then(() => {
      if (!eco && !e.racine.classList.contains("fige")) enDirect(a);
    });
  };
  addEventListener("pcv-modes", surModes);
  const menuOuvert = () => B.menuState() === 1;
  const fige = (oui) => e.racine.classList.toggle("fige", oui);
  const figer = async (appid) => {
    let gele = false;
    try {
      if (!menuOuvert()) return;
      const pid = await O.__pcvPidJeu(appid);
      if (!pid) return;
      if (O.__pcvHomePid === pid || await O.__pcvJeuFige(pid)) {
        O.__pcvHomePid = pid;
        return void (gele = true);
      }
      if (!O.__pcvPauseActive() || O.__pcvPauseJamais(appid) || await O.__pcvAMprisActif?.(appid)) return;
      if (d.visibilityState !== "visible" || !menuOuvert()) return;
      await O.__pcvPauser(pid).catch(() => {
      });
      gele = !!await O.__pcvJeuFige(pid);
    } catch (x) {
    } finally {
      fige(gele);
      if (menuOuvert()) etatPause(gele);
      if (d.visibilityState !== "visible" || !menuOuvert()) relacher();
    }
  };
  let attente = 0, W = null;
  const relacher = () => {
    W?.clearInterval(attente);
    try {
      W = principale().m_BrowserWindow;
    } catch (x) {
      W = window;
    }
    attente = W.setInterval(() => {
      if (menuOuvert() || !jeu()) return W.clearInterval(attente);
      if (O.__pcvJeuDevant?.()) {
        W.clearInterval(attente);
        O.__pcvJeuReprendre?.();
      }
    }, 50);
  };
  const fermerMenu = () => B.closeMenus();
  const entree = async (cle) => await window.__pcvJeuEntree?.(cle) || null;
  const page = (f) => {
    O.__pcvAller?.("accueil");
    setTimeout(() => {
      try {
        principale().m_BrowserWindow[f]?.(true);
      } catch (x) {
      }
    }, 400);
  };
  const reprendreJeu = () => {
    const p = !jeu() && appli();
    if (p) {
      p.reprendre?.();
      return fermerMenu();
    }
    return jeu() ? entree("resume").then((el) => {
      if (el) return el.click();
      O.__pcvAller?.("appli");
      fermerMenu();
    }) : fermerMenu();
  };
  const ZOOM_MS = 300, SURECHELLE_MAX = 1.02;
  const FONDU_FIN = 0.8;
  const scene = d.createElement("div");
  scene.className = "pcv-pe pcv-zoom";
  scene.innerHTML = '<div class="zoom"><i></i></div><b class="fz"></b>';
  d.body.appendChild(scene);
  const placerZoom = () => {
    const R = e.racine, z = scene.firstChild, j = e.$(".jeu"), s = e.$(".instantane");
    Object.assign(scene.style, { zoom: R.style.zoom, width: R.style.width, height: R.style.height });
    const g = { x: j.offsetLeft + s.offsetLeft, y: j.offsetTop + s.offsetTop, w: s.offsetWidth, h: s.offsetHeight, W: R.offsetWidth, H: R.offsetHeight };
    Object.assign(z.style, { left: g.x + "px", top: g.y + "px", width: g.w + "px", height: g.h + "px" });
    Object.assign(z.firstChild.style, { width: g.W + "px", height: g.H + "px" });
    z.firstChild.style.transform = `translateY(${(g.h - g.H * g.w / g.W) / 2}px) scale(${g.w / g.W})`;
    return g;
  };
  const flou = (oui) => flouSuspendre(!oui);
  const nette = (g, im = image) => {
    if (!im?.w || !im.h) return 1;
    const ecran2 = innerWidth * devicePixelRatio / g.W, couvre = Math.max(g.W / im.w, g.H / im.h);
    return Math.min(1, Math.max(FONDU_FIN, (g.W / (couvre * ecran2) * SURECHELLE_MAX - g.w) / (g.W - g.w)));
  };
  let attenteEntree = 0;
  const retrecir = (src) => {
    const attend = e.racine.classList.contains("attente");
    if (attend) clearTimeout(attenteEntree);
    const poser = (iw, ih) => {
      image = { w: iw, h: ih };
      if (!attend || !e.racine.classList.contains("attente")) return;
      try {
        const { x, y, w, h: ht, W: W2, H: H2 } = placerZoom(), z = scene.firstChild, i = z.firstChild, sx = W2 / w, sy = H2 / ht, k = w / W2, dy = (ht - H2 * k) / 2;
        const copies = src.getContext ? [Object.assign(floue(src), { className: "direct flou" }), Object.assign(d.createElement("canvas"), { className: "direct", width: iw, height: ih })] : [];
        copies[1]?.getContext("2d").drawImage(src, 0, 0);
        i.append(...copies);
        scene.style.opacity = 1;
        const o = { duration: ZOOM_MS, easing: "cubic-bezier(.3,.9,.3,1)", fill: "forwards" };
        const a = z.animate([{ transform: `translate(${-x}px, ${-y}px) scale(${sx}, ${sy})`, borderRadius: "0" }, { transform: "none", borderRadius: "30px" }], o);
        zooms.push(a, i.animate([{ transform: `scale(${1 / sx}, ${1 / sy})` }, { transform: `translateY(${dy}px) scale(${k})` }], o));
        const p = Math.min(FONDU_FIN, nette({ w, W: W2, H: H2 }));
        zooms.push(scene.animate([{ opacity: 0 }, { opacity: 0, offset: 1 - p }, { opacity: 1, offset: Math.min(1, 1.2 - p) }, { opacity: 1 }], { ...o, fill: "none" }));
        const ranger = () => copies.forEach((c) => c.remove());
        a.finished.then(() => {
          scene.style.opacity = 0;
          ranger();
        }, ranger);
      } catch (x) {
      }
      e.entrer();
    };
    if (src.getContext) return poser(src.width, src.height);
    const im = new Image();
    im.onload = im.onerror = () => poser(im.naturalWidth, im.naturalHeight);
    im.src = src;
  };
  let sortie = 0;
  const agrandirPuisReprendre = () => {
    if (sortie) return;
    sortie = setTimeout(() => {
      sortie = 0;
      O.__pcvJeuReprendre?.();
      reprendreJeu();
    }, ZOOM_MS);
    try {
      if (!e.racine.classList.contains("en-jeu")) return;
      flou(false);
      const { x, y, w, h: ht, W: W2, H: H2 } = placerZoom(), z = scene.firstChild, i = z.firstChild, sx = W2 / w, sy = H2 / ht, k = w / W2, dy = (ht - H2 * k) / 2;
      const o = { duration: ZOOM_MS, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards" };
      const vive = direct && e.racine.classList.contains("en-direct"), b = !vive && e.$(".instantane canvas.brute"), p = nette({ w, W: W2, H: H2 }, vive ? { w: direct.width, h: direct.height } : image);
      if (vive && p > 0) i.appendChild(direct);
      else if (b && p > 0) {
        const fl = e.$(".instantane canvas.brute.flou");
        if (fl) {
          fl.className = "direct flou";
          i.appendChild(fl);
        }
        b.className = "direct";
        i.appendChild(b);
      }
      scene.style.opacity = 1;
      scene.style.setProperty("--pcv-jeu-flou", e.racine.style.getPropertyValue("--pcv-jeu-flou") || "var(--pcv-home-image)");
      scene.classList.add("reprise");
      zooms.push(
        scene.lastChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, fill: "forwards" }),
        scene.lastChild.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ZOOM_MS, fill: "forwards", pseudoElement: "::after" })
      );
      zooms.push(
        z.animate([{ transform: "none", borderRadius: "30px" }, { transform: `translate(${-x}px, ${-y}px) scale(${sx}, ${sy})`, borderRadius: "0" }], o),
        i.animate([{ transform: `translateY(${dy}px) scale(${k})` }, { transform: `scale(${1 / sx}, ${1 / sy})` }], o)
      );
      zooms.push(scene.animate([{ opacity: 1 }, { opacity: 1, offset: Math.min(p, FONDU_FIN) }, { opacity: 0 }], o));
      e.racine.classList.add("sortie");
    } catch (x) {
    }
  };
  const zooms = [];
  const remettre = () => {
    clearTimeout(sortie);
    sortie = 0;
    flou(true);
    scene.style.opacity = 0;
    scene.classList.remove("reprise");
    e.racine.classList.remove("sortie");
    zooms.splice(0).forEach((a) => a.cancel());
    [...e.racine.getAnimations(), ...scene.getAnimations({ subtree: true })].forEach((a) => a.cancel());
  };
  const ouvrirFiche = async () => {
    const l = (await window.__pcvJeuEntrees?.() || []).filter((x) => !DEJA.has(x.cle));
    e.$(".fiche .choix").innerHTML = l.map((x, i) => {
      const [nom, p, c] = FICHE[x.cle] || [x.el.textContent.trim(), "fleche"];
      return bouton("jeu:" + esc(x.cle), i ? "" : "premier", 0, c || "var(--c-manette)", p, esc(nom));
    }).join("");
    e.ouvrirVoile(e.$(".voile.fiche"));
  };
  const fermerJeu = async () => {
    const a = jeu();
    if (!a) {
      const p = appli();
      if (p) {
        fermerMenu();
        p.fermer();
      }
      return;
    }
    try {
      const pid = await O.__pcvPidJeu(a.appid);
      if (pid && await O.__pcvJeuFige(pid)) O.__pcvHomePid = pid;
    } catch (x) {
    }
    if (!await Promise.race([O.__pcvJeuReprendre?.() ?? true, new Promise((r) => setTimeout(() => r(false), 4e3))])) return e.bulle(T("home.jeu_bloque", "Le jeu ne r\xE9pond pas : il n'a pas pu \xEAtre repris pour \xEAtre ferm\xE9."));
    fermerMenu();
    B.closeApp(a.GetGameID?.() || a.m_gameid || String(a.appid));
    try {
      principale().m_BrowserWindow.__pcvFermerJeu?.(a.appid);
    } catch (x) {
    }
  };
  const peindreManettes = async () => {
    let l = [];
    try {
      l = await principale().m_BrowserWindow.__pcvJoueurs() || [];
    } catch (x) {
    }
    e.racine.querySelectorAll(".joueur").forEach((el, i) => {
      const m = l[i]?.c;
      el.classList.toggle("vide", !m);
      el.title = m?.strName || "";
      el.querySelector("svg").outerHTML = window.__pcvIcones.svg(l[i]?.picto || PLACE_VIDE, { classe: "ico" });
      el.querySelector("i").innerHTML = m ? window.__pcvEtat.pileA(e.racine, m.ucBatteryLevel ?? 100) ?? window.__pcvIcones.svg("pile-manette", { classe: "ico", niveau: Math.min(3, Math.floor((m.ucBatteryLevel ?? 100) / 25)) }) : "";
    });
  };
  const e = ecran({
    id: "pcv-home",
    html,
    premier: ".reprendre, .aucun .bouton, .icone",
    // B ramène au jeu s'il était à l'écran ; sinon il referme le menu, on reste où l'on était (comme Steam)
    // (17/10) de la barre du haut (profil), ▼ va au premier bouton (Reprendre, ou Accueil s'il n'y a pas d'appli) : le
    // voisin géométrique, qui pénalise l'écart de côté, préférait l'icône Accueil, juste dessous, au large Reprendre
    // (11/11, l'auteur) ▼ depuis Accueil : l'icône la plus à gauche ; depuis Mode d'emploi : la plus à droite (pas Téléchargements, sous lui)
    touche: (b) => {
      if (b === 4) basculerPause();
    },
    ranger: rangerIcone,
    voisin: (f, dx, dy) => {
      if (!(dy > 0)) return void 0;
      if (f.matches(".moi")) return [...e.racine.querySelectorAll(".reprendre, .aucun .bouton")].find((x) => x.offsetWidth) || void 0;
      if (!f.matches(".aucun .bouton")) return void 0;
      const ic = [...e.racine.querySelectorAll(".icones .icone")].filter((x) => x.offsetWidth), b = [...e.racine.querySelectorAll(".aucun .bouton")];
      return (b.indexOf(f) === 0 ? ic[0] : ic.at(-1)) || void 0;
    },
    legende: () => devant() && T("home.retour_jeu", "Retour au jeu"),
    retour: () => devant() ? agrandirPuisReprendre() : fermerMenu(),
    agir: (k, v) => {
      if (k === "pause") return basculerPause();
      if (k === "reprendre") return agrandirPuisReprendre();
      if (k === "appli") {
        if (appli()?.cle === v) return fermerMenu();
        O.__pcvAller?.("accueil");
        return setTimeout(() => {
          try {
            principale().m_BrowserWindow.__pcvLancement?.ouvrirAppli(v);
          } catch (x) {
          }
        }, 400);
      }
      if (k === "aller" && v === "accueil") {
        try {
          return principale().m_BrowserWindow.__pcvEcran.accueil();
        } catch (x) {
          return O.__pcvAller?.(v);
        }
      }
      if (k === "aller") return O.__pcvAller?.(v);
      if (k === "greffon") {
        if (!B.lanceurs[v]) return O.__pcvAller?.(v);
        fermerMenu();
        return setTimeout(() => B.ouvrirLanceur(v), 300);
      }
      if (k === "mode-emploi") {
        fermerMenu();
        return setTimeout(() => {
          try {
            principale().m_BrowserWindow.__pcvBienvenue?.guide();
          } catch (x) {
          }
        }, 300);
      }
      if (k === "manettes") {
        const p = principale().m_BrowserWindow.__pcvManettes;
        if (p) p.ouvrir();
        else B.navigate("Controller");
        return fermerMenu();
      }
      if (k === "controleur") {
        B.controllerConfig(jeu().appid);
        return fermerMenu();
      }
      if (k === "jeu") {
        e.fermerVoiles();
        return entree(v).then((el) => {
          if (!el) return;
          el.click();
          if (v !== "details") e.sous();
        });
      }
      if (k === "amis") return page("__pcvAmisMontrer");
      if (k === "notifs") return page("__pcvNotifsMontrer");
      if (k === "fiche") return ouvrirFiche();
      if (k === "fermer") return e.ouvrirVoile(e.$(".voile.fermer"));
      if (k === "fermer-ok") {
        e.fermerVoiles();
        return fermerJeu();
      }
    },
    // (hors jeu, le fond est l'accueil derrière, photographié et flouté comme le jeu : menus-commun.js, fondJeu)
    ouvrir: () => {
      const l = applis();
      if (JSON.stringify(l) !== JSON.stringify(APPLIS)) {
        APPLIS = l;
        e.$(".icones").innerHTML = icones();
      }
      remettre();
      peindreFonds();
      peindreManettes();
      const a = jeu(), p = !a && appli();
      e.racine.classList.toggle("en-jeu", !!a);
      e.racine.classList.toggle("en-appli", !!p);
      fige(false);
      etatPause(null);
      ajuster();
      requestAnimationFrame(ajuster);
      if (p) {
        peindreAppli(p);
        e.fondJeu();
      } else if (a) {
        peindreJeu(a);
        Promise.allSettled([vignette(a), figer(a.appid)]).then(() => enDirect(a));
        requestAnimationFrame(placerZoom);
      } else e.fondJeu();
    },
    // (le menu se ferme : la scène de l'agrandissement s'efface tout de suite, avant que la fenêtre ne soit cachée ; sauf
    // après « Reprendre » : l'image du jeu reste jusqu'à ce que la fenêtre soit cachée et le jeu derrière, jamais une
    // fenêtre vide entre les deux — vue noire à 394 ms sur la planche du 15/10 ; remettre() l'efface à la réouverture)
    avantFermer: () => {
      if (!scene.classList.contains("reprise")) scene.style.opacity = 0;
    },
    // en jeu, et le jeu à l'écran : le menu attend la capture (retrecir), 0,9 s au plus
    // (lot 17) hors jeu, rien à capturer ni à figer : le menu préparé à la fermeture se montre tel quel à l'appui, et se
    // repeint juste après la première image (menus-commun.js)
    differer: () => !jeu() && !appli() && !e.racine.matches(".en-jeu, .en-appli, .sortie"),
    attendre: () => {
      if (!jeu() || !devant() || econome()) return false;
      clearTimeout(attenteEntree);
      attenteEntree = setTimeout(() => e.entrer(), 900);
      return true;
    },
    minute: () => {
      const a = jeu();
      if (a) peindreJeu(a);
    },
    fermer: () => {
      couper();
      relacher();
      flou(true);
    }
  });
  e.racine.querySelector('.legende [data-a="retour"]').insertAdjacentHTML("beforebegin", `<div class="pilule verre pause-leg" data-a="pause"><span class="tch" data-t="4">${window.__pcvIcones?.touche?.(4) || ""}</span><span class="pause-txt"></span></div>`);
  e.demarrer();
  addEventListener("resize", ajuster);
  window.__pcvHomeFin = () => {
    clearTimeout(sortie);
    removeEventListener("pcv-modes", surModes);
    removeEventListener("resize", ajuster);
    couper();
    scene.remove();
    e.fin();
    W?.clearInterval(attente);
    if (O.__pcvJeuDevant?.()) O.__pcvJeuReprendre?.();
  };
})();
