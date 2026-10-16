(() => {
  window.__pcvHomeFin?.();
  const { O, principale, devant, esc, flouSuspendre, flouCoupe, flouCoupeFin, ico, pastille, etat, bouton, ecran } = window.__pcvPE, d = document;
  const menus = () => principale().MenuStore;
  const T = (k, f, vars) => {
    try {
      return principale().m_BrowserWindow.__pcvT?.(k, vars) ?? f;
    } catch (x) {
      return f;
    }
  };
  const APPLIS = [
    ["aller:accueil", T("spaces.accueil.nom", "Accueil"), "accueil", "#5fd0ff, #1a9ae6"],
    ["aller:bibliotheque", T("spaces.bibliotheque.nom", "Biblioth\xE8que"), "bibliotheque", "bibliotheque"],
    ["aller:magasin", T("spaces.boutique.nom", "Boutique"), "boutique", "boutique"],
    ["amis", T("spaces.amis.nom", "Amis"), "amis", "#5fe39a, #22a85f"],
    ["notifs", T("spaces.notifs.nom", "Notifications"), "notifications", "#ff7a7e, #e5484d"],
    ["aller:medias", T("home.captures", "Captures"), "album", "album"],
    ["aller:telechargements", T("home.telechargements", "T\xE9l\xE9chargements"), "telechargements", "#4fdce8, #1597b8"],
    ["aller:parametres", T("spaces.parametres.nom", "Param\xE8tres"), "parametres", "parametres"]
  ];
  const peindreFonds = () => {
    let F = {};
    try {
      F = principale().m_BrowserWindow.__pcvFondsApplis || {};
    } catch (x) {
    }
    e.racine.querySelectorAll(".icone").forEach((el, i) => {
      const f = APPLIS[i][3];
      el.style.setProperty("--fond", f.startsWith("#") ? f : F[f] || "#c5cdd8, #8b9098");
    });
  };
  const html = `<div class="pilule verre moi entre" style="--d:.15s" data-a="amis"><span class="photo"></span><div><b class="pseudo"></b><small>\u25CF ${T("home.en_ligne", "En ligne")}</small></div></div>
    <div class="pilule verre titre entre" style="--d:.15s">${ico("accueil")}${T("home.titre_menu", "Menu HOME")}</div>${etat(false)}
    <div class="jeu verre entre"><div class="instantane"><div class="enpause">${ico("pause")}${T("home.en_pause", "En pause")}</div><div class="logo"></div></div>
      <div class="infos"><div class="sur">${T("home.sur", "Logiciel en cours")}</div><h1></h1><div class="temps"><span>${ico("horloge")}<b class="session"></b></span><small class="total"></small></div></div></div>
    <div class="actions">
      <div class="bouton reprendre entre" style="--d:.08s" data-a="reprendre">${pastille("lecture")}${T("home.reprendre", "Continuer")}</div>
      ${bouton("controleur", "", 0.12, "var(--c-manette)", "manette", `<div>${T("home.controleur", "Contr\xF4leur")}<small>${T("home.controleur.aide", "param\xE8tres de ce jeu")}</small></div>`)}
      ${bouton("fiche", "", 0.16, "var(--c-medias)", "info", `<div>${T("home.fiche_titre", "Fiche du jeu")}<small>${T("home.fiche.aide", "guides, notes, infos")}</small></div>`)}
      ${bouton("fermer", "quitter", 0.2, "", "sortie", T("home.fermer", "Fermer le logiciel"))}</div>
    <div class="aucun"><p class="entre" style="--d:.06s">${T("home.aucun_jeu", "Aucun jeu en cours.")}</p><div class="choix-h">
      ${bouton("aller:accueil", "", 0.1, "var(--c-accueil)", "accueil", T("home.accueil", "Accueil"))}
      ${bouton("mode-emploi", "", 0.14, "var(--c-param)", "aide", `<div>${T("home.mode_emploi", "Mode d'emploi")}<small>${T("home.mode_emploi.aide", "l'aide de SteamU")}</small></div>`)}</div></div>
    <div class="pilule verre manettes entre" style="--d:.15s" data-a="manettes"><span class="liste-m"></span>${T("home.manettes", "Param\xE8tres des manettes")}</div>
    <div class="icones">${APPLIS.map(([a, n, p, f], i) => `<div class="icone entre" style="--d:${(0.22 + i * 0.03).toFixed(2)}s" data-a="${a}">${pastille(p)}${n}</div>`).join("")}</div>
    <div class="pilule verre alim entre" style="--d:.46s" data-a="aller:alimentation">${pastille("alimentation")}${T("home.alimentation", "Alimentation")}</div>
    <div class="voile fermer" hidden><div class="fenetre verre"><span class="pastille grosse">${ico("sortie")}</span><h2></h2><p>${T("home.fermer_perte", "Les donn\xE9es non sauvegard\xE9es seront perdues.")}</p>
      <div class="choix">${bouton("fermer-ok", "", 0, "var(--c-quitter)", "sortie", T("home.fermer", "Fermer le logiciel"))}${bouton("retour", "premier", 0, "var(--c-accueil)", "fleche", T("home.annuler", "Annuler"))}</div></div></div>
    <div class="voile fiche" hidden><div class="fenetre verre"><h2>${T("home.fiche_titre", "Fiche du jeu")}</h2><div class="choix"></div></div></div>`;
  const FICHE = { details: [T("home.fiche.infos", "Infos"), "info", "var(--c-medias)"], guides: [T("home.fiche.guides", "Guides"), "livre"], notes: [T("home.fiche.notes", "Notes"), "crayon"], recording: [T("home.fiche.enregistrements", "Enregistrements"), "video"] };
  const DEJA = /* @__PURE__ */ new Set(["resume", "controller-settings", "exit"]);
  const { IMG, CDN, perso, debut } = window.__pcvJeuOutils;
  const premiere = (l) => new Promise((ok) => {
    const un = (k) => {
      if (k >= l.length) return ok(null);
      const im = new Image();
      im.onload = () => ok(im.src);
      im.onerror = () => un(k + 1);
      im.src = new URL(l[k], "https://steamloopback.host/").href;
    };
    un(0);
  });
  const poserImage = (v, l) => {
    d.documentElement.style.removeProperty(v);
    premiere(l).then((u) => u && d.documentElement.style.setProperty(v, `url(${JSON.stringify(u)})`));
  };
  const duree = (min) => {
    const m = Math.max(0, Math.round(min)), hh = Math.floor(m / 60);
    return hh ? `${hh} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`;
  };
  const jeu = () => {
    try {
      const a = O.SteamUIStore.MainRunningApp;
      return a && (O.appStore.GetAppOverviewByAppID(a.appid) || a);
    } catch (x) {
      return null;
    }
  };
  let appVue = null;
  const peindreJeu = (a) => {
    const $ = e.$;
    $(".session").textContent = T("home.lance_depuis", "lanc\xE9 depuis {duree}", { duree: duree((Date.now() / 1e3 - debut(a)) / 60) });
    const total = +a.minutes_playtime_forever;
    $(".total").textContent = total > 0 ? T("home.temps_total", "{temps} au total", { temps: duree(total) }) : "";
    if (appVue === a.appid) return;
    appVue = a.appid;
    $("h1").textContent = (a.display_name || "").replace(/\s*:\s+/, " :\n");
    $(".fermer h2").textContent = T("home.fermer_titre", "Fermer {nom} ?", { nom: a.display_name || T("home.logiciel", "le logiciel") });
    poserImage("--pcv-home-logo", [...perso("GetCustomLogoImageURLs", a), IMG(a.appid, "logo.png"), CDN(a.appid, "logo.png")]);
  };
  let vivant = 0, enVol = false;
  const suivreVivant = () => {
    clearInterval(vivant);
    vivant = setInterval(async () => {
      if (enVol || d.visibilityState !== "visible" || e.racine.classList.contains("fige")) return;
      enVol = true;
      try {
        const u = await O.DeckyBackend?.call("loader/call_plugin_method", "Premium Clear View", "instantane");
        if (u && d.visibilityState === "visible" && !e.racine.classList.contains("fige")) d.documentElement.style.setProperty("--pcv-home-image", `url(${JSON.stringify(u)})`);
      } catch (x) {
      } finally {
        enVol = false;
      }
    }, 600);
  };
  const vignette = (a) => {
    const n = ++vignettes;
    (devant() ? flouCoupe().then(() => e.fondJeu(true)).finally(flouCoupeFin) : Promise.reject()).then((p) => {
      if (!p) throw 0;
      if (n === vignettes) {
        d.documentElement.style.setProperty("--pcv-home-image", `url(${JSON.stringify(p.net)})`);
        retrecir(p.net);
      }
    }).catch(() => {
      if (n !== vignettes) return;
      poserImage("--pcv-home-image", [...perso("GetCustomHeroImageURLs", a), IMG(a.appid, "library_hero.jpg"), CDN(a.appid, "library_hero.jpg")]);
      e.entrer();
    });
  };
  let vignettes = 0;
  const menuOuvert = () => {
    try {
      return menus().m_eOpenSideMenu === 1;
    } catch (x) {
      return false;
    }
  };
  const fige = (oui) => e.racine.classList.toggle("fige", oui);
  const figer = async (appid) => {
    const pg = O.__pcvPg;
    try {
      if (!pg) return;
      if (!menuOuvert()) return;
      if (((await pg("load_settings"))?.noAutoPauseSet || []).includes(Number(appid))) return;
      if (await O.__pcvAMprisActif?.(appid)) return;
      const pid = await pg("pid_from_appid", appid);
      if (!pid) return;
      if (O.__pcvHomePid === pid || await pg("is_paused", pid)) {
        O.__pcvHomePid = pid;
        fige(true);
        return;
      }
      if (d.visibilityState !== "visible" || !menuOuvert()) return;
      await O.__pcvPauser(pid).catch(() => {
      });
      fige(!!await pg("is_paused", pid));
    } catch (x) {
    } finally {
      if (d.visibilityState !== "visible" || !menuOuvert()) relacher();
    }
  };
  let attente = 0;
  const relacher = () => {
    clearInterval(attente);
    attente = setInterval(() => {
      if (d.visibilityState === "visible") return clearInterval(attente);
      if (O.__pcvJeuDevant?.()) {
        clearInterval(attente);
        O.__pcvJeuReprendre?.();
      }
    }, 300);
  };
  const fermerMenu = () => {
    try {
      menus().CloseSideMenus();
    } catch (x) {
    }
  };
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
  const reprendreJeu = () => O.__pcvPerso?.casinoSuspendu?.() ? (O.__pcvPerso.casino(), fermerMenu()) : jeu() ? entree("resume").then((el) => {
    if (el) return el.click();
    O.__pcvAller?.("appli");
    fermerMenu();
  }) : fermerMenu();
  const ZOOM_MS = 300;
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
  let attenteEntree = 0;
  const retrecir = (url) => {
    if (!e.racine.classList.contains("attente")) return;
    clearTimeout(attenteEntree);
    const im = new Image();
    im.onload = im.onerror = () => {
      if (!e.racine.classList.contains("attente")) return;
      try {
        const { x, y, w, h: ht, W, H } = placerZoom(), z = scene.firstChild, i = z.firstChild, sx = W / w, sy = H / ht, k = w / W, dy = (ht - H * k) / 2;
        i.style.backgroundImage = `url(${JSON.stringify(url)})`;
        scene.style.opacity = 1;
        const o = { duration: ZOOM_MS, easing: "cubic-bezier(.3,.9,.3,1)", fill: "forwards" };
        const a = z.animate([{ transform: `translate(${-x}px, ${-y}px) scale(${sx}, ${sy})`, borderRadius: "0" }, { transform: "none", borderRadius: "30px" }], o);
        zooms.push(a, i.animate([{ transform: `scale(${1 / sx}, ${1 / sy})` }, { transform: `translateY(${dy}px) scale(${k})` }], o));
        a.finished.then(() => {
          scene.style.opacity = 0;
          i.style.removeProperty("background-image");
        }, () => {
        });
      } catch (x) {
      }
      e.entrer();
    };
    im.src = url;
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
      const { x, y, w, h: ht, W, H } = placerZoom(), z = scene.firstChild, i = z.firstChild, sx = W / w, sy = H / ht, k = w / W, dy = (ht - H * k) / 2;
      const o = { duration: ZOOM_MS, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards" };
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
    if (!a) return;
    try {
      const pid = await O.__pcvPg?.("pid_from_appid", a.appid);
      if (pid && await O.__pcvPg("is_paused", pid)) O.__pcvHomePid = pid;
    } catch (x) {
    }
    if (!await Promise.race([O.__pcvJeuReprendre?.() ?? true, new Promise((r) => setTimeout(() => r(false), 4e3))])) return e.bulle(T("home.jeu_bloque", "Le jeu ne r\xE9pond pas : il n'a pas pu \xEAtre repris pour \xEAtre ferm\xE9."));
    fermerMenu();
    try {
      O.SteamClient.Apps.TerminateApp(a.GetGameID?.() || a.m_gameid || String(a.appid), false);
    } catch (x) {
    }
  };
  const peindreManettes = () => {
    let n = 0;
    try {
      n = (O.ControllerStore.m_controllerList || []).length;
    } catch (x) {
    }
    e.$(".liste-m").innerHTML = Array.from({ length: Math.max(1, n) }, () => ico("manette")).join("");
  };
  const e = ecran({
    id: "pcv-home",
    html,
    premier: ".reprendre, .aucun .bouton, .icone",
    // B ramène au jeu s'il était à l'écran ; sinon il referme le menu, on reste où l'on était (comme Steam)
    legende: () => devant() && T("home.retour_jeu", "Retour au jeu"),
    retour: () => devant() ? agrandirPuisReprendre() : fermerMenu(),
    agir: (k, v) => {
      if (k === "reprendre") return agrandirPuisReprendre();
      if (k === "aller") return O.__pcvAller?.(v);
      if (k === "mode-emploi") {
        fermerMenu();
        return setTimeout(() => {
          try {
            principale().m_BrowserWindow.__pcvSteamU?.ouvrir();
          } catch (x) {
          }
        }, 300);
      }
      if (k === "manettes") {
        fermerMenu();
        try {
          principale().m_Navigator.Settings("Controller");
        } catch (x) {
        }
        return;
      }
      if (k === "controleur") {
        try {
          principale().m_Navigator.ControllerConfigurator.Main(jeu().appid);
        } catch (x) {
        }
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
    // (15/10) le casino de Luigi suspendu (perso.js) n'a ni instantané ni temps de jeu à montrer comme un vrai jeu : la
    // classe casino-suspendu (theme-wiiu.src.css, section 38) ne sort que le bouton Reprendre, pas toute la carte « jeu »
    ouvrir: () => {
      remettre();
      peindreFonds();
      peindreManettes();
      const a = jeu(), susp = !a && !!O.__pcvPerso?.casinoSuspendu?.();
      e.racine.classList.toggle("en-jeu", !!a);
      e.racine.classList.toggle("casino-suspendu", susp);
      fige(false);
      if (a) {
        peindreJeu(a);
        vignette(a);
        figer(a.appid);
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
    attendre: () => {
      if (!jeu() || !devant()) return false;
      clearTimeout(attenteEntree);
      attenteEntree = setTimeout(() => e.entrer(), 900);
      return true;
    },
    minute: () => {
      const a = jeu();
      if (a) peindreJeu(a);
    },
    fermer: () => {
      clearInterval(vivant);
      relacher();
      flou(true);
    }
  });
  e.demarrer();
  window.__pcvHomeFin = () => {
    clearTimeout(sortie);
    scene.remove();
    e.fin();
    clearInterval(attente);
    if (O.__pcvJeuDevant?.()) O.__pcvJeuReprendre?.();
  };
})();
