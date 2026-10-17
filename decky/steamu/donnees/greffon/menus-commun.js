window.__pcvPE = (() => {
  const O = window.opener, d = document, h = d.documentElement;
  const principale = () => O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance;
  const T = (k, vars) => {
    try {
      return principale().m_BrowserWindow.__pcvT?.(k, vars);
    } catch (e) {
      return null;
    }
  };
  (() => {
    try {
      const Tc = T;
      const V = {
        "--pcv-txt-aucun-telech": Tc("css.aucun_telechargement"),
        "--pcv-txt-alimentation": Tc("home.alimentation"),
        "--pcv-txt-en-ligne": Tc("home.en_ligne"),
        "--pcv-txt-mediatheque": Tc("place.mediatheque"),
        "--pcv-txt-choisir-jeu": Tc("css.choisir_jeu"),
        "--pcv-txt-filtrer": Tc("css.filtrer"),
        "--pcv-txt-boutique": Tc("spaces.boutique.nom"),
        "--pcv-txt-amis-discussions": Tc("css.amis_discussions"),
        "--pcv-txt-continuer": Tc("home.reprendre"),
        "--pcv-txt-reglages-rapides": Tc("acces.titre"),
        "--pcv-txt-notifications": Tc("spaces.notifs.nom"),
        "--pcv-txt-amis": Tc("spaces.amis.nom"),
        "--pcv-txt-performances": Tc("acces.performances"),
        "--pcv-txt-musique": Tc("acces.musique"),
        "--pcv-txt-aide": Tc("acces.aide"),
        "--pcv-txt-luminosite": Tc("acces.luminosite"),
        "--pcv-txt-desactive": Tc("acces.desactive"),
        "--pcv-txt-active": Tc("acces.active"),
        "--pcv-txt-volume": Tc("acces.volume"),
        "--pcv-txt-micro": Tc("acces.micro"),
        "--pcv-txt-mode-avion": Tc("acces.mode_avion"),
        "--pcv-txt-connecte": Tc("acces.connecte_statut")
      };
      for (const k in V) if (V[k]) h.style.setProperty(k, JSON.stringify(V[k]));
    } catch (e) {
    }
  })();
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const req = () => O.__pcvReq ||= (() => {
    let r;
    O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
      r = q;
    }]);
    return r;
  })();
  const magasin = (nom) => {
    if (O[nom]) return O[nom];
    const r = req();
    if (!r) return void 0;
    for (const id of Object.keys(r.m)) {
      if (!String(r.m[id]).includes("window." + nom + "=")) continue;
      let x;
      try {
        x = r(id);
      } catch (e) {
        continue;
      }
      for (const v of Object.values(x || {})) {
        try {
          if (typeof v?.Get === "function" && "s_Singleton" in v) {
            v.Get();
            if (O[nom]) return O[nom];
          }
        } catch (e) {
        }
      }
    }
    return O[nom];
  };
  const trouves = O.__pcvModules ||= {};
  const module = (cle, motif, test) => {
    if (cle in trouves) return trouves[cle];
    const r = req();
    for (const id of Object.keys(r.m)) {
      if (!String(r.m[id]).includes(motif)) continue;
      let x;
      try {
        x = r(id);
      } catch (e) {
        continue;
      }
      if (!x || typeof x !== "object") continue;
      for (const v of Object.values(x)) {
        try {
          if (test(v)) return trouves[cle] = v;
        } catch (e) {
        }
      }
    }
    return trouves[cle] = null;
  };
  const flou = () => module("flou", "SetForceSuppressBlur", (v) => typeof v?.SetForceSuppressBlur === "function" && typeof v?.SetBlurEnabled === "function");
  const gamescope = () => module("gamescope", "SetBlurParams", (v) => typeof v?.SetBlurParams === "function" && typeof v?.GetState === "function");
  const FLOU = (mode) => ({ mode, radius: 32, fade_duration_ms: 300 });
  const unOuvert = () => Object.values(O.__pcvFlouFen || {}).some(Boolean);
  const flouter = (id, oui) => {
    (O.__pcvFlouFen ||= {})[id] = oui;
    const g = gamescope();
    if (!g) return false;
    try {
      g.SetBlurParams(FLOU(unOuvert() ? 2 : 0));
    } catch (e) {
    }
    return true;
  };
  const flouSuspendre = (oui) => {
    try {
      gamescope()?.SetBlurParams(FLOU(oui || !unOuvert() ? 0 : 2));
    } catch (e) {
    }
  };
  let coupeT = 0;
  const flouCoupe = () => {
    const c = () => {
      try {
        gamescope()?.SetBlurParams({ mode: 0, radius: 32, fade_duration_ms: 0 });
      } catch (e) {
      }
    };
    c();
    clearInterval(coupeT);
    coupeT = setInterval(c, 20);
    setTimeout(() => clearInterval(coupeT), 3e3);
    return new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(ok, 30))));
  };
  const flouCoupeFin = () => clearInterval(coupeT);
  const devant = () => {
    try {
      return !!window.__pcvBridge.runningApp() && !!principale().m_BrowserWindow.document.querySelector("{{TransparentBackground@BasicHome}}");
    } catch (e) {
      return false;
    }
  };
  const FLOU_MAQUETTE = 12, LARGEUR_FOND = 480;
  const photo = () => Promise.race([
    O.DeckyBackend?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "instantane") ?? Promise.reject(),
    new Promise((_, non) => setTimeout(non, 6e3))
  ]).then((u) => {
    if (!u) throw 0;
    const im = new Image();
    im.src = u;
    return im.decode().then(() => im);
  }).then((im) => {
    const W = im.naturalWidth, H = im.naturalHeight, R = 4, sw = Math.ceil(W / R), sh = Math.ceil(H / R), c = d.createElement("canvas");
    c.width = sw;
    c.height = sh;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(im, 0, 0, sw, sh);
    const px = x.getImageData(0, 0, sw, sh).data;
    const noir = (X, Y) => {
      const i = (Y * sw + X) * 4;
      return px[i] < 8 && px[i + 1] < 8 && px[i + 2] < 8;
    };
    const bande = (max, pt) => {
      let k2 = 0;
      while (k2 < max && [...Array(16)].every((_, j) => pt(k2, j))) k2++;
      return k2;
    };
    const rang = (k2, j) => noir(Math.floor(j * (sw - 1) / 15), k2), rangBas = (k2, j) => noir(Math.floor(j * (sw - 1) / 15), sh - 1 - k2);
    const col = (k2, j) => noir(k2, Math.floor(j * (sh - 1) / 15)), colD = (k2, j) => noir(sw - 1 - k2, Math.floor(j * (sh - 1) / 15));
    let [t, b, g, dr] = [bande(sh / 3, rang), bande(sh / 3, rangBas), bande(sw / 3, col), bande(sw / 3, colD)];
    if (Math.abs(t - b) > 1) t = b = 0;
    if (Math.abs(g - dr) > 1) g = dr = 0;
    if (t) {
      t = (t + 1) * R;
      b = (b + 1) * R;
    }
    if (g) {
      g = (g + 1) * R;
      dr = (dr + 1) * R;
    }
    const w = W - g - dr, hh = H - t - b, net = d.createElement("canvas");
    net.width = w;
    net.height = hh;
    net.getContext("2d").drawImage(im, g, t, w, hh, 0, 0, w, hh);
    const f = d.createElement("canvas"), fw = f.width = LARGEUR_FOND, fh = f.height = LARGEUR_FOND * 1200 / 1920, k = Math.max(fw / w, fh / hh) * 1.04, fx = f.getContext("2d");
    fx.filter = `blur(${FLOU_MAQUETTE * LARGEUR_FOND / 1920}px) saturate(1.05)`;
    fx.drawImage(net, (fw - w * k) / 2, (fh - hh * k) / 2, w * k, hh * k);
    const blob = (cv, q) => new Promise((ok) => cv.toBlob((b2) => ok(URL.createObjectURL(b2)), "image/jpeg", q));
    return Promise.all([blob(net, 0.9), blob(f, 0.85)]).then(([n, fl]) => {
      adresses.forEach((u) => URL.revokeObjectURL(u));
      adresses = [n, fl];
      return { net: n, flou: fl, bande: t / H };
    });
  });
  let adresses = [];
  const I = window.__pcvIcones;
  const ico = (n) => I.svg(n, { classe: "ico" });
  const pastille = (n, c) => `<span class="pastille"${c ? ` style="color:${c}"` : ""}>${ico(n)}</span>`;
  const pile = (cl = "") => `<span class="pile ${cl}" id="header"></span>`;
  const etat = () => `<div class="pilule verre etat entre" style="--d:.15s">${ico("wifi")}<span class="sep"></span>${pile()}<span class="heure"></span></div>`;
  const bouton = (a, cl, dl, c, p, texte) => `<div class="bouton verre ${cl} entre" style="--d:${dl}s" data-a="${a}">${pastille(p, c)}${texte}</div>`;
  const liste = (e, cfg) => {
    const racine = e.racine, id = "liste-" + cfg.cle, depuis = e.focus();
    let v = racine.querySelector(`[data-liste="${id}"]`);
    if (!v) {
      v = d.createElement("div");
      v.className = "voile liste";
      v.dataset.liste = id;
      v.innerHTML = `<div class="fenetre-liste verre"><div class="entete-liste">${pastille(cfg.p, cfg.c)}<span>${esc(cfg.titre)}</span></div><div class="liste-panneau defile"></div></div>`;
      racine.appendChild(v);
    }
    const actuelle = cfg.lire();
    v.querySelector(".liste-panneau").innerHTML = cfg.choix.map((x) => `<div class="elt-liste${x.valeur === actuelle ? " oui premier" : ""}" data-a="liste-choix:${id}:${esc(String(x.valeur))}">${esc(x.texte)}<span class="coche">\u2713</span></div>`).join("");
    v.__pcvCfg = cfg;
    v.__pcvDepuis = depuis;
    e.ouvrirVoile(v);
  };
  const listeChoisir = (e, idEtValeur) => {
    const i = idEtValeur.indexOf(":"), id = idEtValeur.slice(0, i), val = idEtValeur.slice(i + 1);
    const v = e.racine.querySelector(`[data-liste="${id}"]`);
    if (!v) return;
    try {
      v.__pcvCfg?.ecrire(val);
    } catch (x) {
    }
    const depuis = v.__pcvDepuis;
    v.hidden = true;
    if ([...e.racine.querySelectorAll(".voile:not([hidden])")].length) return e.premier();
    if (depuis?.isConnected && depuis.getBoundingClientRect().width) e.poser(depuis);
    else e.premier();
  };
  const ecran = (o) => {
    const racine = d.createElement("div");
    racine.id = o.id;
    racine.className = "pcv-pe";
    racine.hidden = true;
    racine.innerHTML = `<div class="fond"></div><div class="nacre"></div>${o.html}<div class="legende entre" style="--d:.46s"><div class="pilule verre" data-a="retour"><span class="touche b">B</span><span class="retour"></span></div><div class="pilule verre y-leg" data-a="y"><span class="touche y">Y</span><span class="y-txt">${T("menus.reglages") || "R\xE9glages"}</span></div><div class="pilule verre epaules-leg"><span class="touche epaule">LB</span><span class="touche epaule">RB</span>${T("menus.morceau") || "Morceau"}</div><div class="pilule verre epaules-leg"><span class="touche epaule">LT</span><span class="touche epaule">RT</span>${T("menus.lecteur") || "Lecteur"}</div><div class="pilule verre x-leg" data-a="x"><span class="touche x">X</span><span class="x-txt">${T("acces.pause_legende") || "Pause"}</span></div><div class="pilule verre"><span class="touche a">A</span>OK</div></div>`;
    d.body.appendChild(racine);
    try {
      const ms = principale().MenuStore, mien = o.id === "pcv-home" ? 1 : 2, v = ms.__pcvVideurs ||= {};
      v[mien] = (suite) => {
        if (racine.hidden || d.visibilityState !== "visible") return suite();
        racine.classList.add("attente");
        let fait = false;
        const go = () => {
          if (!fait) {
            fait = true;
            suite();
          }
        };
        requestAnimationFrame(() => requestAnimationFrame(go));
        setTimeout(go, 120);
      };
      if (!ms.__pcvOrig) {
        const orig = ms.__pcvOrig = { CloseSideMenus: ms.CloseSideMenus, ToggleSideMenu: ms.ToggleSideMenu, OpenSideMenu: ms.OpenSideMenu };
        const habille = (nom, ferme) => function(...a) {
          const cur = ms.m_eOpenSideMenu, f = ms.__pcvVideurs?.[cur];
          if (cur && ferme(cur, a[0], a[1]) && f) return f(() => orig[nom].apply(this, a));
          return orig[nom].apply(this, a);
        };
        ms.CloseSideMenus = habille("CloseSideMenus", () => true);
        ms.ToggleSideMenu = habille("ToggleSideMenu", (cur, x, forcer) => x === cur && !forcer);
        ms.OpenSideMenu = habille("OpenSideMenu", (cur, x) => x !== cur);
      }
    } catch (e) {
    }
    const $ = (s) => racine.querySelector(s), voile = () => [...racine.querySelectorAll(".voile:not([hidden])")].pop() || null;
    const fermerVoiles = () => racine.querySelectorAll(".voile").forEach((v) => {
      v.hidden = true;
    });
    const echelle = () => {
      const z = parseFloat(getComputedStyle(h).zoom) || 1, k = Math.min(innerWidth / 1920, innerHeight / 1200);
      racine.style.zoom = k / z;
      racine.style.width = innerWidth / k + "px";
      racine.style.height = innerHeight / k + "px";
    };
    const peindreEtat = () => {
      try {
        const D = principale().m_BrowserWindow.document, sel = "#header {{HeaderItem@Header}}{{BatteryIcon@HeaderItem}}";
        let s = D.querySelector(sel);
        if (!s) for (const w of principale().m_FocusNavContext.m_rgGamepadNavigationTrees.map((a) => a.m_window)) {
          try {
            if (/^QuickAccess/.test(w.name)) s = [...w.document.querySelectorAll(sel)].find((x) => !x.closest(".pile"));
          } catch (e) {
          }
          if (s) break;
        }
        h.classList.toggle("pcv-bat-bas", D.documentElement.classList.contains("pcv-bat-bas"));
        h.dataset.pcvApparence = D.documentElement.dataset.pcvApparence || "clair";
        const cs = getComputedStyle(D.documentElement);
        for (const v of ["--pcv-accent", "--pcv-accent2", "--pcv-cyan", "--pcv-cyan-plein"]) {
          const ac = cs.getPropertyValue(v).trim();
          if (ac) racine.style.setProperty(v, ac);
          else racine.style.removeProperty(v);
        }
        const bac = getComputedStyle(D.documentElement).getPropertyValue("--pcv-bat-accent").trim();
        if (bac) racine.style.setProperty("--pcv-bat-accent", bac);
        else racine.style.removeProperty("--pcv-bat-accent");
        racine.querySelectorAll(".pile").forEach((p) => p.replaceChildren(...s ? [s.cloneNode(true)] : []));
      } catch (e) {
      }
      try {
        const B = window.__pcvBridge.battery(), charge = B?.present && B.charging;
        for (const svg of racine.querySelectorAll('.pile svg:is([viewBox="0 0 48 36"], [viewBox="0 0 42 36"])')) {
          const r = svg.parentElement, e = r.querySelector(".pcv-eclair");
          if (charge && !e) r.appendChild(Object.assign(d.createElement("div"), { className: "pcv-eclair" }));
          else if (!charge && e) e.remove();
        }
        for (const r of racine.querySelectorAll(".etat .pile > *")) {
          let p = r.querySelector(":scope > .pcv-pct");
          if (!B?.present) p?.remove();
          else {
            if (!p) r.prepend(p = Object.assign(d.createElement("div"), { className: "pcv-pct" }));
            p.textContent = Math.round(B.percent * 100) + "%";
          }
        }
      } catch (e) {
      }
      try {
        const co = window.__pcvBridge.network().connected;
        racine.querySelectorAll(".etat .ico").forEach((i) => i.classList.toggle("coupe", !co));
      } catch (e) {
      }
      racine.querySelectorAll(".heure").forEach((e) => {
        e.textContent = (/* @__PURE__ */ new Date()).toTimeString().slice(0, 5).replace(/^0/, "");
      });
      try {
        const pers = window.__pcvBridge.friends();
        racine.querySelectorAll(".pseudo").forEach((e) => {
          e.textContent = pers?.m_strPlayerName || "";
        });
        const tete = getComputedStyle(principale().m_BrowserWindow.document.documentElement).getPropertyValue("--pcv-tete-mii").trim();
        racine.style.setProperty("--pcv-pe-tete", tete || `url(${JSON.stringify(pers?.avatar_url_full || pers?.avatar_url_medium || "")})`);
      } catch (e) {
      }
    };
    let focus = null;
    const zone = () => voile() || racine;
    const visible = (e) => e.getBoundingClientRect().width > 0;
    const legende = () => {
      $(".retour").textContent = !voile() && o.legende?.() || T("menus.retour") || "Retour";
      const y = focus?.dataset.y;
      $(".y-leg").classList.toggle("montre", !!y && !voile());
      if (y) $(".y-txt").textContent = focus.dataset.yNom || T("menus.reglages") || "R\xE9glages";
    };
    let doigt = false;
    const poser = (el) => {
      focus?.classList.remove("f");
      focus = el || null;
      if (!doigt) focus?.classList.add("f");
      const dl = focus?.closest(":is(.droite, .defile)");
      if (dl) {
        if (focus === dl.querySelector("[data-a]")) dl.scrollTop = 0;
        else focus.scrollIntoView({ block: "nearest" });
      }
      legende();
      o.focus?.(focus);
    };
    const premier = () => poser([...zone().querySelectorAll(voile() ? ".premier" : o.premier)].find(visible));
    const bouger = ([dx, dy]) => {
      if (!focus || !zone().contains(focus) || !visible(focus)) return premier();
      const impose = o.voisin?.(focus, dx, dy);
      if (impose !== void 0) return impose && poser(impose);
      const a = focus.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
      let mieux = null, score = Infinity;
      for (const e of zone().querySelectorAll("[data-a]")) {
        if (e === focus || e.closest(".legende") || e.contains(focus) || focus.contains(e)) continue;
        const b = e.getBoundingClientRect();
        if (!b.width) continue;
        if (dx > 0 && b.left < a.right - 8 || dx < 0 && b.right > a.left + 8 || dy > 0 && b.top < a.bottom - 8 || dy < 0 && b.bottom > a.top + 8) continue;
        const bx = b.left + b.width / 2, by = b.top + b.height / 2, s = (bx - ax) * dx + (by - ay) * dy + 2.2 * Math.abs((bx - ax) * dy + (by - ay) * dx);
        if (s < score) {
          score = s;
          mieux = e;
        }
      }
      if (mieux) poser(mieux);
    };
    const agir = (el) => {
      const a = el?.dataset.a;
      if (!a) return;
      if (a === "retour") return retour();
      if (a === "y") return focus?.dataset.y && o.y?.(focus);
      if (a === "x") return o.touche?.(3, focus);
      const i = a.indexOf(":");
      o.agir(i < 0 ? a : a.slice(0, i), i < 0 ? "" : a.slice(i + 1), el);
    };
    let avant = null;
    const ouvrirVoile = (v) => {
      if (!voile()) avant = focus;
      v.hidden = false;
      premier();
    };
    const retour = () => {
      if (o.avantRetour?.()) return;
      if (voile()) {
        voile().hidden = true;
        if (!voile() && avant && visible(avant)) return poser(avant);
        return premier();
      }
      o.retour();
    };
    let long = 0, annule = false, x0 = 0, y0 = 0;
    const appuyer = (el) => el?.animate?.(
      [{ transform: "scale(1)" }, { transform: "scale(.93)", offset: 0.35 }, { transform: "scale(1.03)", offset: 0.7 }, { transform: "scale(1)" }],
      { duration: 260, easing: "ease-out", composite: "add" }
    );
    racine.addEventListener("pointerdown", (ev) => {
      if (!doigt) {
        doigt = true;
        focus?.classList.remove("f");
      }
      appuyer(ev.target.closest("[data-a]"));
      const el = ev.target.closest("[data-y]");
      clearTimeout(long);
      annule = false;
      x0 = ev.clientX;
      y0 = ev.clientY;
      if (el) long = setTimeout(() => {
        annule = true;
        poser(el);
        o.y?.(el);
      }, 600);
    });
    racine.addEventListener("pointermove", (ev) => {
      if (!annule && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 12 && ev.buttons) {
        annule = true;
        clearTimeout(long);
      }
    });
    racine.addEventListener("pointerup", () => clearTimeout(long));
    racine.addEventListener("pointercancel", () => clearTimeout(long));
    const versScene = (ev) => {
      const R = racine.getBoundingClientRect(), k = R.width / innerWidth || 1;
      return { x: R.left + ev.clientX * k, y: R.top + ev.clientY * k };
    };
    let defile = null;
    racine.addEventListener("pointerdown", (ev) => {
      const l = ev.pointerType !== "touch" && ev.target.closest(".defile");
      defile = l ? { l, y: versScene(ev).y, s: l.scrollTop, id: ev.pointerId } : null;
    });
    racine.addEventListener("pointermove", (ev) => {
      if (!defile || ev.pointerId !== defile.id || !ev.buttons) return;
      defile.l.scrollTop = defile.s - (versScene(ev).y - defile.y);
    });
    racine.addEventListener("pointerup", () => {
      defile = null;
    });
    racine.addEventListener("pointercancel", () => {
      defile = null;
    });
    racine.addEventListener("click", (ev) => {
      if (annule) return;
      const el = ev.target.closest("[data-a]");
      if (!el) return;
      if (!el.closest(".legende")) poser(el);
      agir(el);
    });
    const DIRS = { 9: [0, -1], 10: [0, 1], 11: [-1, 0], 12: [1, 0] };
    const touche = (ev) => {
      const b = ev.detail?.button;
      if (racine.hidden || !(b >= 1 && b <= 14) || o.laisser?.(b)) return;
      ev.stopImmediatePropagation();
      ev.preventDefault();
      if (doigt) {
        doigt = false;
        focus?.classList.add("f");
        if (DIRS[b]) return;
      }
      if ((b === 11 || b === 12) && focus && o.pas?.(focus, b === 12 ? 1 : -1)) return;
      if (DIRS[b]) bouger(DIRS[b]);
      else if (b === 1) {
        appuyer(focus);
        agir(focus);
      } else if (b === 2) retour();
      else if (b === 4 && focus?.dataset.y) o.y?.(focus);
      else o.touche?.(b, focus);
    };
    window.addEventListener("vgp_onbuttondown", touche, true);
    let minute = 0, vider = 0;
    let sonne = false;
    const sonMenu = (vu) => {
      if (vu === sonne) return;
      sonne = vu;
      try {
        principale().m_BrowserWindow.__pcvSon?.(vu ? "home-ouvre" : "home-ferme");
      } catch (e) {
      }
    };
    const tour = () => {
      const vu = d.visibilityState === "visible";
      sonMenu(vu);
      try {
        principale().m_BrowserWindow.document.documentElement.classList.toggle("pcv-ouvert-" + o.id.slice(4), vu);
      } catch (e) {
      }
      delete h.dataset.pcvPeSous;
      if (!vu) flouter(o.id, false);
      if (!vu) {
        clearInterval(vider);
        racine.classList.add("attente");
        racine.hidden = true;
        delete h.dataset.pcvPe;
        racine.classList.remove("anim", "masque-ouverture");
        fermerVoiles();
        clearInterval(minute);
        o.fermer?.();
        clearTimeout(apres);
        apres = setTimeout(() => {
          let m = 1;
          try {
            m = principale().MenuStore.m_eOpenSideMenu;
          } catch (e) {
          }
          if (d.visibilityState !== "visible" && !m) fondJeu();
        }, 400);
        return;
      }
      let dv = false;
      try {
        dv = devant();
        racine.classList.toggle("devant", dv);
        racine.classList.remove("photo");
        photos++;
        o.ouvrir?.();
      } catch (e) {
        console.error("pcv", o.id, e);
      }
      peindreEtat();
      echelle();
      fermerVoiles();
      doigt = Date.now() - (window.__pcvParDoigt || 0) < 1500;
      window.__pcvParDoigt = 0;
      if (!doigt) racine.classList.add("masque-ouverture");
      racine.classList.remove("anim");
      racine.hidden = false;
      h.dataset.pcvPe = "";
      entre = false;
      premier();
      clearInterval(minute);
      minute = setInterval(() => {
        o.minute?.();
        peindreEtat();
      }, 3e4);
      clearInterval(vider);
      vider = setInterval(() => {
        let m = 0;
        try {
          m = principale().MenuStore.m_eOpenSideMenu;
        } catch (e) {
        }
        if (m !== (o.id === "pcv-home" ? 1 : 2)) {
          clearInterval(vider);
          racine.classList.add("attente");
          o.avantFermer?.();
        }
      }, 50);
      racine.classList.toggle("attente", !!o.attendre?.());
      if (!racine.classList.contains("attente")) entrer(dv);
    };
    let entre = false;
    const entrer = (dv = devant()) => {
      if (entre || d.visibilityState !== "visible") return;
      entre = true;
      racine.classList.remove("attente");
      try {
        flouCoupeFin();
        flouter(o.id, false);
        racine.classList.add("repli");
        fondJeu(false, true);
      } catch (e) {
      }
      if (!doigt) {
        racine.classList.remove("anim");
        void racine.offsetWidth;
        racine.classList.add("anim");
      }
      racine.classList.remove("masque-ouverture");
    };
    const poserPhoto = (p) => {
      racine.style.setProperty("--pcv-jeu-flou", `url(${JSON.stringify(p.flou)})`);
      racine.style.setProperty("--pcv-bande", (p.bande * 100).toFixed(2) + "%");
      racine.classList.toggle("bandes", p.bande > 0);
      racine.classList.add("photo");
    };
    const appid = () => window.__pcvBridge.runningApp()?.appid || 0;
    const enData = async (u) => {
      const b = await (await fetch(u)).blob();
      return new Promise((ok) => {
        const f = new FileReader();
        f.onload = () => ok(f.result);
        f.readAsDataURL(b);
      });
    };
    let photos = 0, enCours = null, apres = 0;
    const fondJeu = (sansFlou, garder) => {
      const a = devant() ? appid() : 0, vieille = O.__pcvPhotoJeu?.appid === a ? O.__pcvPhotoJeu : null;
      if (!a) {
        delete O.__pcvPhotoJeu;
        racine.classList.remove("photo", "bandes");
        return Promise.resolve(null);
      }
      if (!a && O.__pcvPhotoJeu?.appid) delete O.__pcvPhotoJeu;
      if (vieille) poserPhoto(vieille);
      else racine.classList.remove("photo");
      if (garder) return Promise.resolve(vieille);
      if (enCours) return enCours;
      const n = ++photos;
      return enCours = photo().then(async (p) => {
        if (n !== photos) return null;
        if (!(p.bande === 0 && vieille?.bande > 0)) try {
          O.__pcvPhotoJeu = { appid: a, bande: p.bande, flou: await enData(p.flou), net: sansFlou ? await enData(p.net) : vieille?.net };
        } catch (e) {
        }
        poserPhoto(p);
        return p;
      }, () => null).finally(() => {
        enCours = null;
      });
    };
    const sous = () => {
      racine.hidden = true;
      delete h.dataset.pcvPe;
      h.dataset.pcvPeSous = "";
    };
    const fin = () => {
      d.removeEventListener("visibilitychange", tour);
      removeEventListener("resize", echelle);
      window.removeEventListener("vgp_onbuttondown", touche, true);
      clearInterval(minute);
      clearTimeout(long);
      clearTimeout(tb);
      try {
        pileAbo?.unregister();
      } catch (e) {
      }
      flouter(o.id, false);
      racine.remove();
      delete h.dataset.pcvPe;
      delete h.dataset.pcvPeSous;
    };
    d.addEventListener("visibilitychange", tour);
    addEventListener("resize", echelle);
    let pileAbo = null;
    try {
      pileAbo = window.__pcvBridge.onBattery(() => {
        if (!racine.hidden) peindreEtat();
      });
    } catch (e) {
    }
    let tb = 0;
    const bulle = (texte) => {
      let b = $(".bulle");
      if (!b) {
        b = d.createElement("div");
        b.className = "bulle";
        racine.appendChild(b);
      }
      b.textContent = texte;
      b.classList.add("vue");
      clearTimeout(tb);
      tb = setTimeout(() => b.classList.remove("vue"), 2600);
    };
    return { racine, $, voile, ouvrirVoile, fermerVoiles, premier, poser, legende, bulle, focus: () => focus, auDoigt: () => doigt, sous, fin, demarrer: tour, entrer, fondJeu, versScene };
  };
  return { O, principale, devant, esc, req, module, magasin, flou, flouSuspendre, flouCoupe, flouCoupeFin, photo, ico, pastille, pile, etat, bouton, liste, listeChoisir, ecran };
})();
