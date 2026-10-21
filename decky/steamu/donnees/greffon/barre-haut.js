(() => {
  document.getElementById("pcv-barre")?.remove();
  const T = window.__pcvT || ((c) => c);
  const racine = document.createElement("div");
  racine.id = "pcv-barre";
  const style = document.createElement("style");
  style.textContent = `
    
    [id="virtual keyboard"] { z-index: 9800 !important; }
    
    html.pcv-clavier .BasicUI { z-index: auto !important; }
    
    html.pcv-steam-modale .BasicUI { z-index: auto !important; }
    
    html.pcv-steam-verrou :is(body, .BasicUI) > [id^="pcv-"]:not(#pcv-toasts) { visibility: hidden !important; }
    
    html:is(.pcv-steam-verrou, .pcv-steam-modale):not(#pcv-rien) [data-pcvc-sous] { visibility: inherit !important; }
    #pcv-barre { position: fixed; inset: 0 0 auto 0; height: 0; z-index: 9000; font-family: var(--pcv-police); }
    #pcv-barre button { all: unset; box-sizing: border-box; cursor: pointer; }
    #pcv-barre .rond { position: fixed; top: calc(var(--u) * 20); width: calc(var(--u) * 56); height: calc(var(--u) * 56); border-radius: 50%;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); display: flex; align-items: center; justify-content: center; }
    #pcv-barre .rond::before { content: ""; position: absolute; width: calc(var(--u) * 40); height: calc(var(--u) * 40); border-radius: 50%;
      background: var(--pcv-pastille); box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); }
    #pcv-barre .rond i { position: relative; width: calc(var(--u) * 22); height: calc(var(--u) * 22);
      -webkit-mask: var(--m) center / contain no-repeat; mask: var(--m) center / contain no-repeat; background: var(--c); }
    
    :root { --pcv-biseau-dy: -1.5px; }
    #pcv-barre .rond:active { transform: scale(.93); }
    
    #pcv-barre .rond.loupe { justify-content: flex-start; overflow: hidden; border-radius: calc(var(--u) * 28); padding-left: calc(var(--u) * 17); gap: calc(var(--u) * 21);
      transition: width .22s cubic-bezier(.2,.8,.2,1), box-shadow .12s !important; }
    #pcv-barre .rond.loupe::before { left: calc(var(--u) * 8); top: calc(var(--u) * 8); }
    #pcv-barre .rond.loupe i, #pcv-barre .rond.loupe .invite { flex: none; }   
    #pcv-barre .rond.loupe .invite { position: relative; white-space: nowrap; font-size: calc(var(--u) * 17); font-weight: 800; color: var(--pcv-texte2); opacity: 0; transition: opacity .12s; }
    body.pcv-loupe-active #pcv-barre .rond.loupe { width: calc(var(--u) * 412);
      box-shadow: var(--pcv-reflet), 0 0 0 calc(var(--u) * 4) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * 8) var(--pcv-cyan-plein), 0 calc(var(--u) * 12) calc(var(--u) * 26) color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    body.pcv-loupe-active #pcv-barre .rond.loupe .invite { opacity: 1; transition-delay: .12s; }
    #pcv-barre .rond.pcv-sel, #pcv-bascule.pcv-sel { background: var(--pcv-cyan, linear-gradient(180deg, #5fd0ff, #1a9ae6)) !important; transform: scale(1.08) !important;
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), 0 0 0 calc(var(--u) * 4) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * 8) var(--pcv-cyan-plein), 0 calc(var(--u) * 10) calc(var(--u) * 24) color-mix(in srgb, var(--pcv-cyan-plein) 45%, transparent) !important; }
    
    #pcv-bascule { display: none !important; }
    
    #header_profile.pcv-sel .avatarHolder, #header_profile.pcv-sel img {
      box-shadow: 0 0 0 calc(var(--u) * 4) var(--pcv-anneau-c), 0 0 0 calc(var(--u) * 8) var(--pcv-cyan-plein), 0 calc(var(--u) * 10) calc(var(--u) * 24) color-mix(in srgb, var(--pcv-cyan-plein) 45%, transparent) !important; }
    
    html.pcv-avatar-mii #header_profile img { content: var(--pcv-tete-mii); background: var(--pcv-creux); object-fit: cover; object-position: 50% 40%; }
    
    #pcv-barre .rond.telech { --pcv-telech-c: #1a9ae6; }
    #pcv-barre .rond.telech[hidden] { display: none; }
    #pcv-barre .rond.telech .anneau { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); pointer-events: none; }
    #pcv-barre .rond.telech .anneau circle { fill: none; stroke-width: 4; }
    #pcv-barre .rond.telech .piste { stroke: var(--pcv-filet); }
    #pcv-barre .rond.telech .plein { stroke: var(--pcv-telech-c); stroke-linecap: round; transition: stroke-dasharray .4s ease; }
    #pcv-barre .rond.telech.pause { --pcv-telech-c: #8b9098; }
    #pcv-barre .rond.telech.pcv-sel .piste { stroke: color-mix(in srgb, var(--pcv-carte) 35%, transparent); }
    #pcv-barre .rond.telech.pcv-sel .plein { stroke: var(--pcv-sur-accent); }
    
    #pcv-barre .etat { position: fixed; top: calc(var(--u) * 24); right: calc(var(--u) * 24); height: var(--pcv-etat-h);
      border-radius: calc(var(--pcv-etat-h) / 2); display: flex; align-items: center; padding: 0 calc(var(--u) * 6) 0 0;
      background: var(--pcv-verre); box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), inset 0 -2px 0 var(--pcv-reflet-bas), var(--pcv-ombre);
      color: var(--pcv-texte); font-size: var(--pcv-etat-texte); font-weight: 800; }
    #pcv-barre .etat > * { flex: none; }
    #pcv-barre .etat .ico { width: var(--pcv-etat-ico); height: var(--pcv-etat-ico); margin: 0 calc(var(--u) * 10) 0 calc(var(--u) * 18); color: var(--pcv-texte); }
    #pcv-barre .etat .ico.coupe { opacity: .3; }
    #pcv-barre .etat .sep { width: 2px; align-self: stretch; background: var(--pcv-bord); }
    #pcv-barre .etat .heure { padding: 0 calc(var(--u) * 7) 0 0; font-size: var(--pcv-etat-chiffres); font-weight: var(--pcv-etat-chiffres-graisse); line-height: 1; }
    #pcv-barre .etat .pile { display: flex; align-items: center; gap: calc(var(--u) * 5); margin: 0 calc(var(--u) * 9) 0 calc(var(--u) * 12); }
  `;
  racine.appendChild(style);
  {
    const b = document.createElement("button");
    b.className = "rond loupe";
    b.dataset.pcvRond = "loupe";
    b.dataset.pcvNom = T("barre.rechercher");
    b.setAttribute("aria-label", T("barre.rechercher"));
    b.style.left = "calc(var(--u) * 24)";
    b.innerHTML = `<i data-ico-masque="recherche" style="--c:var(--pcv-texte2)"></i><span class="invite">${T("barre.rechercher")}</span>`;
    b.onclick = () => {
      window.__pcvProfilMontrer?.(false);
      if (window.__pcvEcran?.ouvert?.()) {
        window.__pcvVersLoupe = true;
        window.__pcvEcran.fermer();
      }
      const i = document.querySelector("#header ._17M8gvakqjyaw_cLo6ntdl input, #header [class*=SearchAndTitleContainer] input");
      if (!i) return;
      window.__pcvNoeud?.(i)?.BTakeFocus?.(4);
      i.focus();
      i.click();
    };
    racine.appendChild(b);
  }
  {
    const b = document.createElement("button");
    b.className = "rond";
    b.dataset.pcvRond = "amis";
    b.dataset.pcvNom = T("spaces.amis.nom");
    b.setAttribute("aria-label", T("spaces.amis.nom"));
    b.style.left = "calc(var(--u) * 90)";
    b.innerHTML = '<i data-ico-masque="amis" style="--c:var(--pcv-vert)"></i>';
    b.onclick = () => {
      window.__pcvProfilMontrer?.(false);
      const p = document.getElementById("pcv-amis");
      window.__pcvAmisMontrer?.(!!p?.hidden);
    };
    racine.appendChild(b);
  }
  {
    const b = document.createElement("button");
    b.className = "rond";
    b.dataset.pcvRond = "notifs";
    b.dataset.pcvNom = T("spaces.notifs.nom");
    b.setAttribute("aria-label", T("spaces.notifs.nom"));
    b.style.left = "calc(var(--u) * 156)";
    b.innerHTML = '<i data-ico-masque="notifications" style="--c:var(--pcv-rouge)"></i>';
    b.onclick = () => {
      window.__pcvProfilMontrer?.(false);
      const p = document.getElementById("pcv-notifs");
      window.__pcvNotifsMontrer?.(!!p?.hidden);
    };
    racine.appendChild(b);
  }
  {
    const b = document.createElement("button");
    b.className = "rond profil";
    b.dataset.pcvRond = "profil";
    b.dataset.pcvNom = T("spaces.profil.nom");
    b.setAttribute("aria-label", T("spaces.profil.nom"));
    b.style.left = "calc(var(--u) * 222)";
    b.innerHTML = '<img alt="">';
    b.onclick = () => {
      window.__pcvAmisMontrer?.(false);
      window.__pcvNotifsMontrer?.(false);
      const p = document.getElementById("pcv-profil");
      window.__pcvProfilMontrer?.(!p || p.hidden);
    };
    racine.appendChild(b);
  }
  {
    const b = document.createElement("button");
    b.className = "rond telech";
    b.hidden = true;
    b.dataset.pcvNom = T("barre.telechargements");
    b.setAttribute("aria-label", T("barre.telechargements"));
    b.style.left = "calc(var(--u) * 288)";
    b.innerHTML = '<svg class="anneau" viewBox="0 0 56 56" aria-hidden="true"><circle class="piste" cx="28" cy="28" r="24.5"/><circle class="plein" cx="28" cy="28" r="24.5" pathLength="100" stroke-dasharray="0 100"/></svg><i data-ico-masque="telechargements" style="--c:var(--pcv-telech-c)"></i>';
    const origine = () => document.querySelector("{{HeaderItem@Header}} > {{HeaderDownloadContainer@Header}}")?.parentElement;
    b.onclick = () => {
      window.__pcvProfilMontrer?.(false);
      const o = origine();
      if (o) o.click();
      else try {
        requis(75380).SteamUIStore.Navigate("/library/downloads");
      } catch (e) {
      }
    };
    racine.appendChild(b);
    let avant = "";
    window.__pcvTelechMaj = () => {
      let vu = false, pct = 0, pause = false;
      const f = window.__pcvTelechFactice;
      if (f) {
        vu = true;
        pct = +f.pct || 0;
        pause = !!f.pause;
      } else try {
        const o = window.opener.downloadsStore?.LocalDownloadOverview;
        if (o?.update_appid) {
          vu = true;
          pct = +o.overall_percent_complete || 0;
          pause = !!o.paused;
        }
      } catch (e) {
      }
      pct = Math.max(0, Math.min(100, Math.round(pct)));
      const cle = vu + ":" + pct + ":" + pause;
      if (cle === avant) return;
      avant = cle;
      b.hidden = !vu;
      b.classList.toggle("pause", pause);
      b.querySelector(".plein").setAttribute("stroke-dasharray", pct + " 100");
      const nom = vu ? T("barre.telechargements_etat", { etat: pause ? T("barre.en_pause") : pct + " %" }) : T("barre.telechargements");
      b.dataset.pcvNom = nom;
      b.setAttribute("aria-label", nom);
    };
  }
  {
    const I = window.__pcvIcones, B = window.__pcvBridge;
    const etat = document.createElement("div");
    etat.className = "pilule verre etat";
    etat.innerHTML = `${I.svg("wifi", { classe: "ico" })}<span class="sep"></span><span class="pile" hidden></span><span class="heure"></span>`;
    racine.appendChild(etat);
    const peindreEtatAccueil = () => {
      try {
        etat.querySelector(".ico").classList.toggle("coupe", !B.network().connected);
      } catch (e) {
      }
      try {
        const s = [...document.querySelectorAll("{{HeaderItem@Header}}{{BatteryIcon@HeaderItem}}")].find((x) => !x.closest(".pile"));
        etat.querySelector(".pile").replaceChildren(...s ? [s.cloneNode(true)] : []);
      } catch (e) {
      }
      try {
        const b = B.battery(), charge = b?.present && b.charging;
        etat.querySelector(".pile").hidden = b?.present !== true;
        for (const svg of etat.querySelectorAll('.pile svg:is([viewBox="0 0 48 36"], [viewBox="0 0 42 36"])')) {
          const r = svg.parentElement, ec = r.querySelector(".pcv-eclair");
          if (charge && !ec) r.appendChild(Object.assign(document.createElement("div"), { className: "pcv-eclair" }));
          else if (!charge && ec) ec.remove();
        }
        for (const r of etat.querySelectorAll(".pile > *")) {
          let p = r.querySelector(":scope > .pcv-pct");
          if (!b?.present) p?.remove();
          else {
            if (!p) r.prepend(p = Object.assign(document.createElement("div"), { className: "pcv-pct" }));
            p.textContent = Math.round(b.percent * 100) + "%";
          }
        }
      } catch (e) {
      }
      etat.querySelector(".heure").textContent = (/* @__PURE__ */ new Date()).toTimeString().slice(0, 5).replace(/^0/, "");
    };
    clearInterval(window.__pcvEtatAccueil);
    try {
      window.__pcvEtatAccueilAbo?.unregister();
    } catch (e) {
    }
    peindreEtatAccueil();
    window.__pcvEtatAccueil = setInterval(peindreEtatAccueil, 3e4);
    try {
      window.__pcvEtatAccueilAbo = B.onBattery(peindreEtatAccueil);
    } catch (e) {
    }
  }
  racine.addEventListener("click", (e) => {
    if (!e.target.closest?.('[data-pcv-rond="amis"]')) window.__pcvAmisMontrer?.(false);
    if (!e.target.closest?.('[data-pcv-rond="notifs"]')) window.__pcvNotifsMontrer?.(false);
  }, true);
  window.__pcvIcones?.rafraichir(racine);
  document.body.appendChild(racine);
  {
    const O = window.opener, delai = (ms) => new Promise((_, non) => setTimeout(() => non(new Error("d\xE9lai")), ms));
    const appel = (m, ...a) => O.DeckyBackend?.call("loader/call_plugin_method", "Pause Games", m, ...a) ?? Promise.reject(new Error("Decky absent"));
    const pg = O.__pcvPg = (m, ...a) => Promise.race([appel(m, ...a), delai(4e3)]);
    const appidJeu = () => window.__pcvBridge.runningApp()?.appid || 0;
    O.__pcvJeuDevant = () => {
      try {
        const a = appidJeu();
        return !!a && O.FocusedAppWindowStore.GetFocusedAppID() === a && !O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore.m_eOpenSideMenu;
      } catch (e) {
        return false;
      }
    };
    O.__pcvPauser = (pid) => {
      O.__pcvHomePid = pid;
      const p = O.__pcvPauseEnVol = appel("pause", pid).catch(() => {
      });
      p.finally(() => {
        if (O.__pcvPauseEnVol === p) O.__pcvPauseEnVol = null;
      });
      return Promise.race([p, delai(4e3)]);
    };
    let veille = 0;
    O.__pcvJeuReprendre = (parLaGarde) => {
      if (!parLaGarde) veille = Date.now() + 1e4;
      if (O.__pcvReprise) return O.__pcvReprise;
      const p = O.__pcvReprise = (async () => {
        for (let i = 0; i < 10; i++) {
          if (O.__pcvPauseEnVol) {
            await Promise.race([O.__pcvPauseEnVol, new Promise((r) => setTimeout(r, 2e3))]);
            continue;
          }
          try {
            const a = appidJeu(), pid = O.__pcvHomePid || a && await pg("pid_from_appid", a);
            if (!pid) return true;
            if (await pg("is_paused", pid)) await pg("resume", pid);
            if (!await pg("is_paused", pid)) {
              if (O.__pcvHomePid === pid) O.__pcvHomePid = 0;
              return true;
            }
          } catch (e) {
          }
          await new Promise((r) => setTimeout(r, 2e3));
        }
        return false;
      })();
      p.finally(() => {
        if (O.__pcvReprise === p) O.__pcvReprise = null;
      });
      return p;
    };
    clearInterval(window.__pcvGardePause);
    let depuis = 0, tic = 0;
    window.__pcvGardePause = setInterval(() => {
      if (O.__pcvHomePid && !appidJeu()) O.__pcvHomePid = 0;
      const devant = O.__pcvJeuDevant();
      if (O.__pcvHomePid && !devant && !O.__pcvReprise && !O.__pcvPauseEnVol && ++tic % 2 === 0) {
        const pid = O.__pcvHomePid;
        pg("is_paused", pid).then((oui) => {
          if (!oui && O.__pcvHomePid === pid && !O.__pcvReprise && !O.__pcvJeuDevant()) O.__pcvPauser(pid);
        }).catch(() => {
        });
      }
      if (!devant || !(O.__pcvHomePid || Date.now() < veille)) {
        depuis = 0;
        return;
      }
      depuis ||= Date.now();
      if (Date.now() - depuis > 1e3) O.__pcvJeuReprendre(true);
    }, 500);
    window.__pcvGardePauseFin = () => clearInterval(window.__pcvGardePause);
    const appelPCV = (m, ...a) => O.DeckyBackend?.call("loader/call_plugin_method", window.__pcvGreffon.nom, m, ...a) ?? Promise.reject();
    const memeJeu = O.__pcvMemeJeu = (j, a) => {
      try {
        const n = BigInt(j);
        return String(n > 0xFFFFFFFFn ? n >> 32n : n) === String(a);
      } catch (e) {
        return false;
      }
    };
    O.__pcvAMprisActif = async (appid) => {
      try {
        const l = await appelPCV("lecteurs").catch(() => []) || [];
        if (l.some((x) => memeJeu(x.jeu, appid))) return true;
        const pid = await pg("pid_from_appid", appid).catch(() => 0);
        return !!pid && l.some((x) => x.pid === pid);
      } catch (e) {
        return false;
      }
    };
    let videoFigee = null;
    clearInterval(window.__pcvGardeNet);
    window.__pcvGardeNet = setInterval(async () => {
      const a = appidJeu();
      if (!a) return void (videoFigee = null);
      appelPCV("plein_ecran", a).catch(() => {
      });
      const devant = O.__pcvJeuDevant();
      if (devant) {
        if (!videoFigee) return;
        const nom = videoFigee;
        videoFigee = null;
        appelPCV("lecteur", nom, "jouer").catch(() => {
        });
        return;
      }
      if (videoFigee) return;
      try {
        const l = await appelPCV("lecteurs").catch(() => null) || [];
        const miens = l.filter((x) => memeJeu(x.jeu, a));
        if (miens.some((x) => x.statut === "Playing" && !x.video) && !((await pg("load_settings"))?.noAutoPauseSet || []).includes(+a)) {
          await pg("add_no_auto_pause_set", +a);
          try {
            const L = O.DeckyPluginLoader, p = L?.plugins?.find((x) => x.name === "Pause Games");
            if (p) L.importPlugin(p.name, p.version);
          } catch (e) {
          }
        }
        if (!miens.length && !((await pg("load_settings"))?.noAutoPauseSet || []).includes(a)) return;
        const lu = miens.find((x) => x.statut === "Playing" && x.video);
        if (lu) {
          videoFigee = lu.nom;
          appelPCV("lecteur", lu.nom, "pause").catch(() => {
          });
        }
      } catch (e) {
      }
    }, 500);
    window.__pcvGardeNetFin = () => clearInterval(window.__pcvGardeNet);
  }
  clearInterval(window.__pcvSuivi);
  const PAGES = [
    ["compte", /^\/routes\/account/],
    ["recherche", /^\/routes\/search/],
    ["apropos", /^\/routes\/about/],
    ["invitations", /^\/routes\/invites/],
    ["couleurs", /^\/routes\/colorsettings/],
    ["manette", /^\/routes\/controller/],
    ["clavier", /^\/routes\/keyboard/],
    ["atelier", /^\/routes\/workshop/],
    ["succes", /^\/routes\/library\/app\/\d+\/achievements/],
    ["configurateur", /^\/routes\/app\/\d+\/controllerconfigurator/],
    ["accueil", /^\/routes\/library\/home/],
    ["telechargements", /^\/routes\/library\/downloads/],
    ["fiche", /^\/routes\/library\/app/],
    ["bibliotheque", /^\/routes\/library/],
    ["parametres", /^\/routes\/settings/],
    ["magasin", /^\/routes\/store/],
    ["web", /^\/routes\/steamweb/],
    ["amis", /^\/routes\/friends/],
    ["medias", /^\/routes\/media/]
  ];
  const pageDe = (p) => (PAGES.find(([, re]) => re.test(p)) || ["autre"])[0];
  window.__pcvTeteMii = async (octets) => {
    const T2 = window.THREE, V = window.__pcvVraisMii?.etat;
    if (!T2 || !V) throw new Error("t\xEAte du Mii : moteur des Mii pas pr\xEAt");
    const { F, ffl } = V, X = F.FFLExpression, cv = document.createElement("canvas");
    cv.width = cv.height = 160;
    const rendu = new T2.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
    let cm = null;
    try {
      rendu.outputColorSpace = T2.LinearSRGBColorSpace;
      rendu.setClearColor(0, 0);
      const desc = { resolution: 256, allExpressionFlag: F.makeExpressionFlag([X.NORMAL]), modelFlag: F.FFLModelFlag.NORMAL }, Mat = window.FFLShaderMaterial;
      const tete = (verifier) => {
        const c = new F.CharModel(ffl, octets, desc, Mat, null, verifier);
        c.initTextures(rendu, Mat);
        return c;
      };
      try {
        cm = tete(true);
      } catch (e) {
        if (!(e instanceof F.FFLiVerifyReasonException)) throw e;
        cm = tete(false);
      }
      const s = new T2.Scene();
      s.add(cm.meshes);
      const cam = F.ModelIcon.getCamera();
      cam.setViewOffset(1e3, 1e3, 150, 125, 710, 710);
      cam.updateProjectionMatrix();
      rendu.render(s, cam);
      return cv.toDataURL("image/png");
    } finally {
      try {
        cm?.dispose();
      } catch (e) {
      }
      rendu.dispose();
      rendu.forceContextLoss();
    }
  };
  let teteCle = window.__pcvTeteCle || "", teteURL = window.__pcvTeteURL || "", teteEnCours = false;
  const IMAGE_PROFIL = window.__pcvImageProfil = "pcv-image-profil";
  const TETE_CACHE = window.__pcvTeteCacheCle = "pcv-mii-tete-cache";
  const teteMoi = () => {
    const moi = window.__pcvMiiBase?.moi?.(), cle = moi ? moi.id + ":" + moi.donnees : "";
    if (cle !== teteCle && !teteEnCours) {
      if (!cle) {
        teteCle = window.__pcvTeteCle = "";
        teteURL = window.__pcvTeteURL = "";
      } else if (window.__pcvVraisMii?.etat) {
        teteEnCours = true;
        window.__pcvTeteMii(window.__pcvMiiBase.octets(moi.id)).then((u) => {
          teteURL = window.__pcvTeteURL = u;
          try {
            localStorage.setItem(TETE_CACHE, JSON.stringify({ cle, url: u }));
          } catch (e) {
          }
        }, (e) => {
          teteURL = "";
          console.warn("t\xEAte du Mii", e);
        }).finally(() => {
          teteCle = window.__pcvTeteCle = cle;
          teteEnCours = false;
        });
      }
    }
    let choix = "mii";
    try {
      choix = localStorage.getItem(IMAGE_PROFIL) || choix;
    } catch (e) {
    }
    const mii = choix === "mii" && !!teteURL && cle === teteCle, h = document.documentElement;
    const fond = mii ? `url("${teteURL}")` : "";
    if (h.style.getPropertyValue("--pcv-tete-mii") !== fond) h.style.setProperty("--pcv-tete-mii", fond);
    if (h.classList.contains("pcv-avatar-mii") !== mii) h.classList.toggle("pcv-avatar-mii", mii);
    const av = document.querySelector("#header_profile img")?.src, r = document.querySelector("#pcv-barre .rond.profil img");
    if (r && av && r.getAttribute("src") !== av) r.setAttribute("src", av);
  };
  const oy = () => {
    const O = window.opener;
    if (O.__pcvOy !== void 0) return O.__pcvOy;
    let t = null;
    const r = requis.req();
    for (const id of Object.keys(r.m)) {
      if (!String(r.m[id]).includes("GetShowingLockScreen")) continue;
      let x;
      try {
        x = r(id);
      } catch (e) {
        continue;
      }
      t = Object.values(x || {}).find((v) => {
        try {
          return typeof v?.GetShowingLockScreen === "function";
        } catch (e) {
          return false;
        }
      });
      if (t) break;
    }
    return O.__pcvOy = t || null;
  };
  const pavePin = () => {
    const vus = /* @__PURE__ */ new Set();
    for (const b of document.querySelectorAll("button, [role=button], .Focusable")) {
      const t = b.textContent.trim();
      if (t.length === 1 && t >= "0" && t <= "9" && b.getClientRects().length) {
        vus.add(t);
        if (vus.size === 10) return true;
      }
    }
    return [...document.querySelectorAll("input[type=password]")].some((i) => i.getClientRects().length > 0);
  };
  const verrou = () => {
    try {
      return !!oy().GetShowingLockScreen() && pavePin();
    } catch (e) {
      return false;
    }
  };
  const modale = () => [...document.querySelectorAll(".FullModalOverlay, .ModalPosition, [role=dialog], .contextMenu")].some((e) => e.getClientRects().length > 0);
  const requis = (n) => requis.req()(n);
  requis.req = () => window.opener.__pcvReq ||= (() => {
    let r;
    window.opener.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
      r = q;
    }]);
    return r;
  })();
  window.__pcvClavier = (champ2) => {
    if (!champ2) return false;
    if (document.activeElement !== champ2) champ2.focus();
    try {
      const V = (window.__pcvW ||= requis(75380).SteamUIStore.WindowStore.GamepadUIMainWindowInstance).VirtualKeyboardManager;
      const ecrire = (t) => {
        const v = champ2.value, a = champ2.selectionStart ?? v.length, b = champ2.selectionEnd ?? a;
        let n, c;
        if (t === "Backspace") {
          if (a === b && !a) return;
          n = v.slice(0, a === b ? a - 1 : a) + v.slice(b);
          c = a === b ? a - 1 : a;
        } else {
          const max = champ2.maxLength > 0 ? champ2.maxLength : 1e4;
          t = t.slice(0, Math.max(0, max - (v.length - (b - a))));
          if (!t) return;
          n = v.slice(0, a) + t + v.slice(b);
          c = a + t.length;
        }
        champ2.value = n;
        champ2.setSelectionRange?.(c, c);
        champ2.dispatchEvent(new Event("input", { bubbles: true }));
      };
      window.__pcvClavierAbo ||= V.IsShowingVirtualKeyboard.Subscribe((v) => document.documentElement.classList.toggle("pcv-clavier", !!v));
      document.documentElement.classList.add("pcv-clavier");
      const ref = V.CreateVirtualKeyboardRef({
        BIsElementValidForInput: () => champ2.isConnected && document.activeElement === champ2,
        onTextEntered: (t) => {
          if (!champ2.isConnected) return;
          if (t === "Enter") {
            ref.HideVirtualKeyboard();
            champ2.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true, cancelable: true }));
            return;
          }
          if (t === "ArrowLeft" || t === "ArrowRight") {
            const p = Math.max(0, Math.min(champ2.value.length, (champ2.selectionStart ?? 0) + (t === "ArrowLeft" ? -1 : 1)));
            champ2.setSelectionRange?.(p, p);
            return;
          }
          if (t === "Backspace" || t.length && !/^(Tab|Arrow|Escape)/.test(t)) ecrire(t);
        }
      });
      ref.ShowVirtualKeyboard();
      return true;
    } catch (e) {
      return false;
    }
  };
  const suivre = () => {
    const p = window.opener.location.pathname;
    const page = pageDe(p);
    if (document.body.dataset.pcvPage !== page) document.body.dataset.pcvPage = page;
    teteMoi();
    window.__pcvTelechMaj?.();
    for (const l of document.querySelectorAll("[role=tablist]")) {
      const oui = !!l.querySelector(':scope > [role=tab][id*="/properties/"]'), c = l.closest(".PageListColumn");
      if (l.hasAttribute("data-pcv-proprietes") !== oui) l.toggleAttribute("data-pcv-proprietes", oui);
      if (c && c.hasAttribute("data-pcv-proprietes") !== oui) c.toggleAttribute("data-pcv-proprietes", oui);
    }
    {
      const m = !!window.__pcvMenuOuvert?.();
      if (document.body.classList.contains("pcv-menu-ouvert") !== m) document.body.classList.toggle("pcv-menu-ouvert", m);
    }
    for (const h of document.querySelectorAll("{{HeaderItem@Header}}")) {
      const oui = !!h.querySelector(":scope > {{ControllerBatteryImgContainer@Header}}") || !h.firstElementChild && !h.matches("{{Clock@Header}}, {{NotificationsIcon@Header}}");
      if (h.hasAttribute("data-pcv-masque") !== oui) h.toggleAttribute("data-pcv-masque", oui);
    }
    const ui = document.querySelector(".BasicUI");
    {
      const h = document.documentElement.classList, v = verrou(), m = modale();
      if (h.contains("pcv-steam-verrou") !== v) h.toggle("pcv-steam-verrou", v);
      if (h.contains("pcv-steam-modale") !== m) h.toggle("pcv-steam-modale", m);
    }
    if (ui) for (const id of ["pcv-accueil", "pcv-console", "pcv-themes", "pcv-badges", "pcv-profil", "pcv-amis", "pcv-notifs", "pcv-place", "pcv-bascule", "pcv-barre", "pcv-bulle-nom"]) {
      const el = document.getElementById(id);
      if (el && el.parentElement !== ui) ui.appendChild(el);
    }
    try {
      window.__pcvMenus ||= requis(75380).SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore;
      const m = window.__pcvMenus, ouvert = m.m_eOpenSideMenu === 2;
      racine.querySelectorAll(".rond").forEach((b) => b.classList.toggle(
        "actif",
        (ouvert && m.m_eQuickAccessTab === 0 || document.getElementById("pcv-notifs")?.hidden === false) && b.dataset.pcvRond === "notifs" || b.dataset.pcvRond === "amis" && document.getElementById("pcv-amis")?.hidden === false
      ));
    } catch (e) {
    }
    try {
      const c = oy().MostRecentlyActiveController, t = c?.eControllerType, h = document.documentElement.dataset;
      const f = familleTouches(c, t);
      if (h.pcvManette !== f) h.pcvManette = f;
      const inverse = !c?.bNintendoLayout !== !c?.bUseReversedLayout;
      if ("pcvInverse" in h !== inverse) {
        if (inverse) h.pcvInverse = "";
        else delete h.pcvInverse;
      }
    } catch (e) {
    }
    const champ2 = document.querySelector("._17M8gvakqjyaw_cLo6ntdl input");
    const rechercheTxt = T("barre.rechercher");
    if (champ2 && champ2.placeholder !== rechercheTxt) champ2.placeholder = rechercheTxt;
  };
  const PASTILLE_NEUTRE = "var(--pcv-touche-neutre)", PASTILLE_PS = "var(--pcv-touche-ps)";
  const TOUCHE_MENU = '<svg viewBox="0 0 24 24" style="width:1.1em;height:1.1em" fill="none" stroke="var(--pcv-sur-accent)" stroke-width="2.6" stroke-linecap="round"><path d="M6 7.5h12M6 12h12M6 16.5h12"/></svg>';
  const TOUCHES = {
    xbox: { 1: ["A", "#2fbf71"], 2: ["B", "#e5484d"], 3: ["X", "#2a8cff"], 4: ["Y", "#e0a100"], 5: ["LB", PASTILLE_NEUTRE], 6: ["RB", PASTILLE_NEUTRE] },
    ps: { 1: ["\u2715", "#6f9bff"], 2: ["\u25CB", "#ff6b6b"], 3: ["\u25A1", "#e58ad6"], 4: ["\u25B3", "#3ec7a6"], 5: ["L1", PASTILLE_NEUTRE], 6: ["R1", PASTILLE_NEUTRE] },
    nintendo: { 1: ["A", PASTILLE_NEUTRE], 2: ["B", PASTILLE_NEUTRE], 3: ["X", PASTILLE_NEUTRE], 4: ["Y", PASTILLE_NEUTRE], 5: ["L", PASTILLE_NEUTRE], 6: ["R", PASTILLE_NEUTRE] },
    deck: { 1: ["A", PASTILLE_NEUTRE], 2: ["B", PASTILLE_NEUTRE], 3: ["X", PASTILLE_NEUTRE], 4: ["Y", PASTILLE_NEUTRE], 5: ["L1", PASTILLE_NEUTRE], 6: ["R1", PASTILLE_NEUTRE] }
  };
  const ECHANGE = { 1: 2, 2: 1, 3: 4, 4: 3 };
  const PS = {
    1: ["\u2715", "#7fb0ff", '<path d="M6.9 6.9l10.2 10.2M17.1 6.9L6.9 17.1"/>'],
    2: ["\u25CB", "#ff6b74", '<circle cx="12" cy="12" r="5.9"/>'],
    3: ["\u25A1", "#f08fd2", '<rect x="6.5" y="6.5" width="11" height="11" rx=".9"/>'],
    4: ["\u25B3", "#3fd3a6", '<path d="M12 5.3l6.8 11.6H5.2z"/>']
  };
  const dessinPS = (n) => `<svg viewBox="0 0 24 24" style="width:1.55em;height:1.55em;display:inline-block;vertical-align:-.4em;flex:none" fill="none" stroke="${PS[n][1]}" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" aria-label="${PS[n][0]}">${PS[n][2]}</svg>`;
  const echapT = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  let appareil = window.__pcvAppareil || null;
  if (!appareil) window.opener?.SteamClient?.System?.GetSystemInfo?.().then((s) => {
    appareil = window.__pcvAppareil = s;
  }, () => {
  });
  const consoleLenovo = () => /lenovo/i.test(appareil?.sProductVendor || "") && /Ryzen.*Z\d/i.test(appareil?.sCPUName || "");
  const integreeInputPlumber = () => {
    try {
      return (window.opener.ControllerStore.m_controllerList || []).some((x) => x.eControllerType === 100);
    } catch (e) {
      return false;
    }
  };
  const emulee = (c) => !integreeInputPlumber() && (c?.strChipID === "12345678" || /1970/.test(c?.strFirmwareBuildTime || ""));
  const familleTouches = (c, t) => {
    let choix = "auto";
    try {
      choix = JSON.parse(localStorage.getItem("pcv-touches")) || "auto";
    } catch (e) {
    }
    if (TOUCHES[choix]) return choix;
    const ps = [33, 34, 45, 47, 48].includes(t);
    if (ps && consoleLenovo() && emulee(c)) return "xbox";
    return ps ? "ps" : [38, 39, 40, 41, 51].includes(t) || c?.bNintendoLayout ? "nintendo" : t === 4 ? "deck" : "xbox";
  };
  const PICTO_TYPE = {
    1: "manette-steam",
    2: "manette-steam",
    3: "manette-steam",
    10: "manette-steam",
    31: "manette-xbox",
    32: "manette-xbox",
    46: "manette-xbox",
    33: "manette-ps4",
    34: "manette-ps4",
    47: "manette-ps4",
    45: "manette-ps5",
    48: "manette-ps5-edge",
    38: "manette-pro",
    51: "manette-pro-2",
    50: "manette-8bitdo",
    39: "joycon-g",
    40: "joycon-d",
    41: "joycons",
    4: "integree",
    100: "integree"
  };
  const PICTO_USB = [
    [/^045e:/, "manette-xbox"],
    [/^054c:(05c4|09cc|0ba0)$/, "manette-ps4"],
    [/^054c:0ce6$/, "manette-ps5"],
    [/^054c:0df2$/, "manette-ps5-edge"],
    [/^057e:2009$/, "manette-pro"],
    [/^057e:2006$/, "joycon-g"],
    [/^057e:2007$/, "joycon-d"],
    [/^057e:2008$/, "joycons"],
    [/^057e:2069$/, "manette-pro-2"],
    [/^057e:2067$/, "joycon2-g"],
    [/^057e:2066$/, "joycon2-d"],
    [/^057e:2068$/, "joycons2"],
    [/^2dc8:/, "manette-8bitdo"],
    [/^28de:(1102|1142)$/, "manette-steam"],
    [/^28de:(1205|12fb)$/, "integree"],
    [/^17ef:/, "integree"]
  ];
  const PICTO_NOM = [
    [/handheld/i, "integree"],
    [/xbox/i, "manette-xbox"],
    [/dualsense edge/i, "manette-ps5-edge"],
    [/dualsense/i, "manette-ps5"],
    [/dualshock|ps4/i, "manette-ps4"],
    [/8bitdo/i, "manette-8bitdo"],
    [/pro controller/i, "manette-pro"],
    [/joy-?con/i, "joycons"]
  ];
  const PICTO_CONSOLE = [
    [/Valve.*(Jupiter|Galileo)/, "portable-deck"],
    [/Legion Go S|83L3|83N6|83Q2|83Q3/, "portable-legion-go-s"],
    [/Legion Go 2|83N0|83N1/, "portable-legion-go-2"],
    [/Legion Go|83E1/, "portable-legion-go"],
    [/RC73/, "portable-xbox-ally"],
    [/ROG Ally|RC71|RC72/, "portable-ally"],
    [/Claw|MS-1T/, "portable-claw"],
    [/AYA ?NEO/i, "portable-ayaneo"]
  ];
  let machine = null;
  window.__pcvJoueurs = async () => {
    try {
      machine = await window.opener.DeckyBackend.call("loader/call_plugin_method", window.__pcvGreffon.nom, "machine") || machine;
    } catch (e) {
    }
    let mode = "auto";
    try {
      mode = JSON.parse(localStorage.getItem("pcv-mode-console")) || "auto";
    } catch (e) {
    }
    if (mode === "auto") mode = machine?.ecran || "portable";
    const dmi = machine ? [machine.sys_vendor, machine.product_name, machine.product_version, machine.board_name].join(" ") : "";
    const portable = PICTO_CONSOLE.find(([r]) => r.test(dmi))?.[1] || "portable", hex = (n) => (+n || 0).toString(16).padStart(4, "0");
    const l = window.__pcvBridge.controllers();
    return l.sort((a, b) => (a.nXInputIndex < 0) - (b.nXInputIndex < 0) || a.nXInputIndex - b.nXInputIndex).map((c) => {
      const usb = hex(c.unVendorID) + ":" + hex(c.unProductID);
      const p = emulee(c) ? "integree" : PICTO_USB.find(([r]) => r.test(usb))?.[1] || PICTO_TYPE[c.eControllerType] || PICTO_NOM.find(([r]) => r.test(c.strName || ""))?.[1] || "manette-inconnue";
      return p !== "integree" ? { c, picto: p } : { c, picto: portable, integree: true };
    }).filter((j, i, l2) => !(j.integree && mode === "tele" && (!DETACHABLES[j.picto] || attachees()) && l2.some((x) => !x.integree))).map((j) => j.integree && DETACHABLES[j.picto] && (mode === "tele" ? !attachees() : detachee()) ? { ...j, picto: DETACHABLES[j.picto] } : j);
  };
  const NOMS_CONSOLE = {
    "portable-deck": "Steam Deck",
    "portable-legion-go-s": "Legion Go S",
    "portable-legion-go-2": "Legion Go 2",
    "portable-legion-go": "Legion Go",
    "portable-xbox-ally": "ROG Xbox Ally",
    "portable-ally": "ROG Ally",
    "portable-claw": "MSI Claw",
    "portable-ayaneo": "AYANEO"
  };
  window.__pcvNomMachine = async () => {
    try {
      machine = await window.opener.DeckyBackend.call("loader/call_plugin_method", window.__pcvGreffon.nom, "machine") || machine;
    } catch (e) {
    }
    if (!machine) return null;
    const dmi = [machine.sys_vendor, machine.product_name, machine.product_version, machine.board_name].join(" ");
    const modele = NOMS_CONSOLE[PICTO_CONSOLE.find(([r]) => r.test(dmi))?.[1]] || machine.product_version || machine.product_name || "";
    return [machine.systeme, modele].filter(Boolean).join(", ");
  };
  const DETACHABLES = { "portable-legion-go": "manettes-legion-go", "portable-legion-go-2": "manettes-legion-go-2" };
  const attachees = () => machine?.legion?.left === "attached" && machine?.legion?.right === "attached";
  const detachee = () => [machine?.legion?.left, machine?.legion?.right].includes("detached");
  window.__pcvTouche = (code) => {
    const h = document.documentElement.dataset, k = "pcvInverse" in h ? ECHANGE[code] || code : code;
    if (k === 13 || k === 14) {
      if (h.pcvManette === "nintendo") {
        const t3 = k === 13 ? "\u2212" : "+";
        return [t3, PASTILLE_NEUTRE, t3];
      }
      const ps = h.pcvManette === "ps", t2 = k === 13 ? ps ? "Create" : "View" : "\u2261";
      const html = k === 14 ? TOUCHE_MENU : window.__pcvIcones?.svg?.(ps ? "creer" : "vue", { attrs: 'style="width:1.1em;height:1.1em" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"' });
      return [t2, ps ? PASTILLE_PS : PASTILLE_NEUTRE, html || echapT(t2)];
    }
    if (h.pcvManette === "ps" && PS[k]) return [PS[k][0], PASTILLE_PS, dessinPS(k)];
    const [t, c] = (TOUCHES[h.pcvManette] || TOUCHES.xbox)[k] || ["?", PASTILLE_NEUTRE];
    return [t, c, echapT(t)];
  };
  suivre();
  window.__pcvSuivi = setInterval(suivre, 250);
  {
    const O = window.opener;
    document.getElementById("pcv-rideau")?.remove();
    cancelAnimationFrame(window.__pcvRideauBoucle);
    clearInterval(window.__pcvRideauSuivi);
    O.navigation?.removeEventListener("currententrychange", O.__pcvRideauNav);
    removeEventListener("pagehide", window.__pcvRideauFin);
    const r = document.createElement("div");
    r.id = "pcv-rideau";
    r.style.cssText = "position:fixed;inset:calc(var(--u) * 98) 0 0 0;z-index:8450;pointer-events:none;background:var(--pcv-fond-page);opacity:0";
    document.body.appendChild(r);
    let chemin = O.location.pathname, page = pageDe(chemin);
    const veiller = () => {
      const p = O.location.pathname;
      if (p === chemin) return;
      chemin = p;
      const suite = pageDe(p), memePage = suite === page;
      page = suite;
      document.body.dataset.pcvPage = page;
      if (memePage) return;
      r.getAnimations().forEach((a) => a.cancel());
      r.animate([{ opacity: 1 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 380, easing: "ease-out" });
    };
    if (O.navigation) {
      O.navigation.addEventListener("currententrychange", O.__pcvRideauNav = veiller);
      addEventListener("pagehide", window.__pcvRideauFin = () => O.navigation.removeEventListener("currententrychange", veiller));
    } else window.__pcvRideauSuivi = setInterval(veiller, 80);
  }
  if (!window.__pcvFlechesParam) {
    window.__pcvFlechesParam = true;
    document.addEventListener("click", (e) => {
      if (document.body.dataset.pcvPage !== "parametres") return;
      const u = innerHeight / 800, dans = (x) => Math.hypot(e.clientX - x, e.clientY - 154 * u) <= 30 * u;
      const sens = dans(120 * u) ? -1 : dans(innerWidth - 120 * u) ? 1 : 0;
      if (!sens) return;
      window.__pcvPageVoisine?.(sens, false);
      e.stopPropagation();
      e.preventDefault();
    }, true);
  }
  window.__pcvPageVoisine = (sens, curseur = true) => {
    const su = window.__pcvSteamU, pages = [...document.querySelectorAll('.PageListColumn [role=tab][id*="/settings/"]')];
    const i = su?.ouvert() ? -1 : pages.findIndex((p) => p.getAttribute("aria-selected") === "true");
    if (i + sens === -1 && su && !su.ouvert()) {
      su.ouvrir();
      return true;
    }
    const cible = pages[i + sens];
    if (!cible) {
      window.__pcvSon?.("bord");
      return true;
    }
    su?.fermer();
    cible.click();
    cible.scrollIntoView?.({ inline: "center", behavior: "smooth", block: "nearest" });
    if (curseur) window.__pcvNoeud?.(cible)?.BTakeFocus?.(4);
    return true;
  };
  {
    const defileur = (el) => {
      for (let p = el?.parentElement; p && p !== document.body; p = p.parentElement) {
        const st = getComputedStyle(p);
        if (/auto|scroll/.test(st.overflowY) && p.scrollHeight > p.clientHeight + 1) return p;
      }
      return null;
    };
    const suivis = /* @__PURE__ */ new WeakMap();
    window.__pcvSuivre = (el) => {
      const s = defileur(el);
      if (!s) return false;
      const e = suivis.get(s) || { cible: s.scrollTop, anim: 0 };
      suivis.set(s, e);
      const marge = 80 * innerHeight / 800, r = el.getBoundingClientRect(), y = s.scrollTop;
      const haut = r.top - s.getBoundingClientRect().top + y;
      let c = e.anim ? e.cible : y;
      if (r.height + 2 * marge > s.clientHeight || haut - marge < c) c = haut - marge;
      else if (haut + r.height + marge - s.clientHeight > c) c = haut + r.height + marge - s.clientHeight;
      e.cible = Math.max(0, Math.min(c, s.scrollHeight - s.clientHeight));
      if (!e.anim) {
        let t = performance.now(), pos = y;
        const pas = (n) => {
          pos += (e.cible - pos) * (1 - Math.exp(-Math.min(50, n - t) / 35));
          t = n;
          if (Math.abs(e.cible - pos) < 0.5) pos = e.cible;
          s.scrollTop = pos;
          e.anim = pos === e.cible ? 0 : requestAnimationFrame(pas);
        };
        e.anim = requestAnimationFrame(pas);
      }
      return true;
    };
    const crochet = (J) => document.body.dataset.pcvPage === "parametres" && J?.Element?.closest?.(".DialogContentTransition") ? window.__pcvSuivre(J.Element) : false;
    const brancher = () => {
      let p = window.__pcvNoeud?.(document.querySelector(".Focusable"));
      while (p && !Object.hasOwn(p, "SetDOMFocusAndScroll")) p = Object.getPrototypeOf(p);
      if (!p) return void setTimeout(brancher, 1e3);
      const avant = window.__pcvSDFS ||= p.SetDOMFocusAndScroll;
      p.SetDOMFocusAndScroll = function(...a) {
        for (let x = this; x; x = x.Parent) if (x.m_Properties && (x === this || x.m_Properties.scrollIntoViewWhenChildFocused)) x.m_Properties.fnScrollIntoViewHandler ||= crochet;
        return avant.apply(this, a);
      };
    };
    setTimeout(brancher, 0);
  }
  {
    const noeud = (el) => {
      const k = el && Object.keys(el).find((x) => x.startsWith("__reactFiber"));
      if (!k) return null;
      for (let f = el[k]; f; f = f.return) for (const p of [f.memoizedProps, f.pendingProps]) if (p?.node && typeof p.node.BTakeFocus === "function") return p.node;
      return null;
    };
    window.__pcvNoeud = noeud;
    const visibles = (sel, dans) => [...(dans || document).querySelectorAll(sel)].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.height > 0 && r.width > 0;
    });
    (window.__pcvManette ||= {}).fiche = (b) => {
      if (b === 4 && document.body.dataset.pcvPage === "fiche") {
        const bt = document.querySelector(".pcv-accueil");
        if (bt) {
          bt.click();
          window.__pcvSon?.("choisir");
          return true;
        }
      }
      if (document.body.dataset.pcvPage !== "fiche" || b < 9 || b > 12) return false;
      const f = document.querySelector(".gpfocus");
      if (!f) return false;
      const onglet = document.querySelector("[id$=WhatsNew]");
      if (!onglet) return false;
      const choisi = onglet.parentElement.querySelector("[role=tab][aria-selected=true]") || onglet;
      if (f === onglet && choisi === onglet && b === 10) return true;
      if (!visible(f)) {
        const n = noeud(choisi);
        if (n) {
          n.BTakeFocus(4);
          return true;
        }
      }
      return false;
    };
    const visible = (el, defile = false) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      let libre = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const st = getComputedStyle(p);
        if (st.display === "none" || st.visibility === "hidden" || +st.opacity === 0) return false;
        if (libre) continue;
        if (defile && /auto|scroll/.test(st.overflowY) && p.scrollHeight > p.clientHeight + 1) {
          libre = true;
          continue;
        }
        if (st.overflow !== "visible") {
          const q = p.getBoundingClientRect();
          if (q.width < 2 || q.height < 2 || q.bottom <= r.top || q.top >= r.bottom || q.right <= r.left || q.left >= r.right) return false;
        }
      }
      return libre || !(r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth);
    };
    (window.__pcvManette ||= {}).garde = (b) => {
      if (b < 9 || b > 12) return false;
      const avant = document.querySelector(".gpfocus");
      if (!avant) return false;
      if (!visible(avant)) return false;
      let essais = 0;
      const verifier = () => {
        const g = document.querySelector(".gpfocus");
        if (!g || g === avant) {
          if (++essais < 6) setTimeout(verifier, 75);
          return;
        }
        if (visible(g, true)) return;
        const ra = avant.getBoundingClientRect(), cx = ra.left + ra.width / 2, cy = ra.top + ra.height / 2;
        let meilleur = null, dmin = 1e9;
        for (const e of document.querySelectorAll(".Focusable, [role=tab], [role=button], .DialogButton, button")) {
          if (e === avant || e.contains(avant) || avant.contains(e) || e.closest("[id^=pcv-]")) continue;
          const r = e.getBoundingClientRect();
          if (r.width < 8 || r.height < 8 || r.width > innerWidth * 0.9) continue;
          const ex = r.left + r.width / 2, ey = r.top + r.height / 2, dx = ex - cx, dy = ey - cy;
          const dans = b === 10 ? dy > ra.height / 2 : b === 9 ? dy < -ra.height / 2 : b === 12 ? dx > ra.width / 2 : dx < -ra.width / 2;
          if (!dans || !visible(e) || !noeud(e)) continue;
          const d = b === 9 || b === 10 ? Math.abs(dy) + Math.abs(dx) * 0.5 : Math.abs(dx) + Math.abs(dy) * 0.5;
          if (d < dmin) {
            dmin = d;
            meilleur = e;
          }
        }
        const n = noeud(meilleur) || noeud(avant);
        if (n) n.BTakeFocus(4);
      };
      setTimeout(verifier, 60);
      return false;
    };
    (window.__pcvManette ||= {}).pages = (b) => {
      if ((b === 5 || b === 6) && document.body.dataset.pcvPage === "parametres" && document.querySelector('.PageListColumn [role=tab][id*="/settings/"]'))
        return window.__pcvPageVoisine(b === 6 ? 1 : -1);
      let f = null;
      try {
        window.__pcvNav ||= oy().NavigationManager;
        f = window.__pcvNav.GetActiveNavTree()?.GetLastFocusedNode()?.Element || null;
      } catch (e) {
      }
      if (!f || !document.contains(f)) f = document.querySelector(".gpfocus");
      const tuile = f ? f.closest(".PageListColumn [role=tab]") : visibles(".PageListColumn [role=tab][aria-selected=true]")[0];
      if (!f && !tuile) return false;
      if (tuile && b === 10) {
        const c = visibles(".DialogContentTransition")[0];
        if (!c) return false;
        const SEL = ".Focusable, .DialogButton, button";
        const premier = visibles(SEL, c).filter((e) => !visibles(SEL, e).length).sort((a, z) => a.getBoundingClientRect().top - z.getBoundingClientRect().top)[0];
        const n = noeud(premier) || noeud(c);
        if (n) {
          n.BTakeFocus(4);
          return true;
        }
        return false;
      }
      const contenu = f?.closest(".DialogContentTransition");
      if (!contenu || !document.querySelector(".PageListColumn [role=tab]")) return false;
      if (b === 2 || b === 9) {
        if (b === 9) {
          const t0 = f.getBoundingClientRect().top;
          if (visibles(".Focusable, .DialogButton, button", contenu).some((e) => !e.contains(f) && !f.contains(e) && e.getBoundingClientRect().bottom <= t0 + 2)) return false;
        }
        const t = visibles(".PageListColumn [role=tab][aria-selected=true]")[0];
        const n = noeud(t);
        if (n) {
          n.BTakeFocus(4);
          return true;
        }
      }
      return false;
    };
  }
  const appuyer = (el) => el?.animate?.(
    [{ transform: "scale(1)" }, { transform: "scale(.86)", offset: 0.35 }, { transform: "scale(1.08)", offset: 0.7 }, { transform: "scale(1)" }],
    { duration: 260, easing: "ease-out" }
  );
  racine.addEventListener("pointerdown", (e) => appuyer(e.target.closest?.(".rond, #pcv-bascule")));
  const champ = () => document.querySelector("#header ._17M8gvakqjyaw_cLo6ntdl input, #header [class*=SearchAndTitleContainer] input");
  const loupe = () => {
    const l = document.querySelector("{{SearchAndTitleContainer@SearchBox}}"), b = document.body.classList, i = champ();
    const nous = b.contains("pcv-zone-jaquettes") || b.contains("pcv-barre-nav") || !!window.__pcvEcran?.ouvert?.();
    const v = !!l && !nous && (l.matches(":hover, .gpfocuswithin, .gpfocus") || !!i && document.activeElement === i && !!i.value);
    if (b.contains("pcv-loupe-active") !== v) b.toggle("pcv-loupe-active", v);
  };
  for (const t of ["focusin", "focusout", "pointerover", "pointerout"]) document.removeEventListener(t, window.__pcvLoupeEcoute, true);
  let loupeDemandee = false;
  window.__pcvLoupeEcoute = () => {
    if (!loupeDemandee) {
      loupeDemandee = true;
      requestAnimationFrame(() => {
        loupeDemandee = false;
        loupe();
      });
    }
  };
  for (const t of ["focusin", "focusout", "pointerover", "pointerout"]) document.addEventListener(t, window.__pcvLoupeEcoute, true);
  clearInterval(window.__pcvLoupeSuivi);
  window.__pcvLoupeSuivi = setInterval(loupe, 120);
  window.__pcvLoupeClasses?.disconnect();
  (window.__pcvLoupeClasses = new MutationObserver(window.__pcvLoupeEcoute)).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  {
    let curs = -1;
    const cibles = () => [...document.querySelectorAll("#pcv-barre .rond:not(.loupe), #pcv-bascule" + (window.__pcvEcran?.ouvert?.() ? ", #pcv-barre .rond.loupe" : ""))].filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 8 && !b.hidden && !b.closest("[hidden]");
    }).sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    const marquer = () => {
      document.querySelectorAll(".pcv-sel").forEach((x) => x.classList.remove("pcv-sel"));
      document.body.classList.toggle("pcv-barre-nav", curs >= 0);
      if (curs >= 0) cibles()[curs]?.classList.add("pcv-sel");
      window.__pcvLegende?.();
    };
    window.__pcvBarreQuitter = () => {
      curs = -1;
      marquer();
    };
    document.body.classList.remove("pcv-barre-nav");
    window.__pcvBarreEntrer = (nom) => {
      const l = cibles(), i = l.findIndex((x) => x.dataset.pcvRond === nom);
      curs = Math.max(0, i);
      marquer();
    };
    (window.__pcvManette ||= {}).barre = (b) => {
      const place = document.getElementById("pcv-place");
      if (place && !place.hidden) {
        if (curs >= 0) {
          curs = -1;
          marquer();
        }
        return false;
      }
      const loupe2 = document.querySelector("#header .gpfocus")?.closest("._17M8gvakqjyaw_cLo6ntdl");
      if (curs < 0) {
        if (window.__pcvZone === "jaquettes" && document.body.dataset.pcvPage === "accueil") return false;
        if (loupe2 && b === 12) {
          curs = 0;
          marquer();
          return true;
        }
        return false;
      }
      if (!loupe2 && !window.__pcvEcran?.ouvert?.()) {
        curs = -1;
        marquer();
        return false;
      }
      const l = cibles();
      if (curs > l.length - 1) curs = l.length - 1;
      if (b === 12) {
        if (curs < l.length - 1) {
          curs++;
          marquer();
        }
        return true;
      }
      if (b === 11) {
        curs--;
        marquer();
        return true;
      }
      if (b === 1) {
        const el = l[curs];
        curs = -1;
        marquer();
        appuyer(el);
        el?.click();
        return true;
      }
      if (b === 2 || b === 10) {
        curs = -1;
        marquer();
        return b === 2 && document.body.dataset.pcvPage !== "accueil";
      }
      return true;
    };
  }
  window.__pcvOrdre = ["perso", "fiche", "garde", "connexion", "choixJeu", "profil", "amis", "notifs", "pages", "barre", "deco", "place", "console", "accueil"];
  {
    const table = window.__pcvManette?.__brute || Object.assign({}, window.__pcvManette || {});
    const menuOuvert = window.__pcvMenuOuvert = () => {
      try {
        return !!window.__pcvMenus?.m_eOpenSideMenu;
      } catch (e) {
        return false;
      }
    };
    const clavierOuvert = () => {
      try {
        return !!window.__pcvW?.VirtualKeyboardManager?.IsShowingVirtualKeyboard?.Value;
      } catch (e) {
        return false;
      }
    };
    const steamDessus = window.__pcvSteamDessus = () => menuOuvert() || clavierOuvert() || verrou() || modale();
    window.__pcvManette = new Proxy(table, { get: (t, k) => k === "__brute" ? t : typeof t[k] === "function" ? (b) => b >= 1 && b <= 12 && (k === "alim" || !steamDessus()) ? t[k](b) : false : t[k] });
  }
  window.removeEventListener("vgp_onbuttondown", window.__pcvHorsJeu, true);
  window.addEventListener("vgp_onbuttondown", window.__pcvHorsJeu = (e) => {
    const b = e.detail?.button;
    if (b >= 13 && b <= 26 && window.__pcvEcran?.ouvert?.() && !window.__pcvSteamDessus()) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);
  if (!window.__pcvAiguillage) {
    window.__pcvAiguillage = true;
    const prendre = (e) => {
      const b = e.detail?.button, m = window.__pcvManette || {};
      if (!(b >= 1 && b <= 12)) return;
      try {
        if (window.__pcvMenus?.m_eOpenSideMenu) return;
      } catch (e2) {
      }
      const son = window.__pcvSonAvant?.(b);
      for (const nom of window.__pcvOrdre) if (m[nom]?.(b)) {
        e.stopPropagation();
        e.preventDefault();
        window.__pcvSonApres?.(b, nom, son);
        return;
      }
    };
    window.addEventListener("vgp_onbuttondown", prendre, true);
  }
  clearInterval(window.__pcvQamSuivi);
  window.__pcvQamSuivi = setInterval(() => {
    try {
      window.__pcvW ||= requis(75380).SteamUIStore.WindowStore.GamepadUIMainWindowInstance;
      const arbres = window.__pcvW.m_FocusNavContext?.m_rgGamepadNavigationTrees || [];
      const transparent = /bazzite|steamos|chimera|holo/i.test(appareil?.sOSName || "");
      for (const x of [window, ...arbres.map((a) => a.m_window)]) try {
        const h = x.document.documentElement;
        if ("pcvTransparent" in h.dataset !== transparent) {
          if (transparent) h.dataset.pcvTransparent = "";
          else delete h.dataset.pcvTransparent;
        }
      } catch (e) {
      }
      const w = arbres.map((a) => a.m_window).find((x) => {
        try {
          return /^QuickAccess/.test(x.document.title);
        } catch (e) {
          return false;
        }
      });
      const th = w?.document.getElementById("theme-clair");
      if (th && w.__pcvLarge !== th.dataset.v) {
        th.textContent = th.textContent.replaceAll("@media (max-width: 900px)", "@media all");
        w.__pcvLarge = th.dataset.v;
      }
      const VERSION = 6;
      if (!w || w.__pcvQamV === VERSION) return;
      if (!w.__pcvManette) w.__pcvQamFrais = true;
      w.__pcvManetteVieux = !w.__pcvQamFrais;
      w.__pcvManette = true;
      w.__pcvQamV = VERSION;
      const d = w.document, curseur = () => d.querySelector(".gpfocus");
      const noeud = (el) => {
        const k = el && Object.keys(el).find((x) => x.startsWith("__reactFiber"));
        if (!k) return null;
        for (let f = el[k]; f; f = f.return) for (const p of [f.memoizedProps, f.pendingProps]) if (p?.node && typeof p.node.BTakeFocus === "function") return p.node;
        return null;
      };
      const vis = (e) => {
        const r = e.getBoundingClientRect(), z = parseFloat(w.getComputedStyle(d.documentElement).zoom) || 1;
        return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < w.innerHeight / z;
      };
      const choisi = () => d.querySelector("[id^=quickaccess_tab_][aria-selected=true]");
      let retenu = null;
      if (w.__pcvManetteVieux) {
        clearInterval(w.__pcvQamRetenu);
        w.__pcvQamRetenu = setInterval(() => {
          const f = d.querySelector(".gpfocus");
          if (f && !f.closest("[id^=quickaccess_tab_]")) retenu = d.querySelector("[id^=quickaccess_tab_][aria-selected=true]");
        }, 200);
      }
      w.addEventListener("vgp_onbuttondown", (ev) => {
        const b = ev.detail?.button;
        if (b < 9 || b > 12 || w.__pcvQamV !== VERSION) return;
        if (ev.defaultPrevented) {
          if (b === 9 && retenu) {
            const r = retenu;
            setTimeout(() => {
              const t0 = d.querySelector("[id^=quickaccess_tab_]");
              if (r !== t0 && r.isConnected && d.querySelector(".gpfocus") === t0) {
                r.click();
                noeud(r)?.BTakeFocus(4);
              }
            }, 0);
          }
          return;
        }
        const f = curseur();
        if (!f) return;
        const onglets = [...d.querySelectorAll("[id^=quickaccess_tab_]")].filter(vis);
        if (!vis(f) && !f.closest("[id^=quickaccess_tab_]")) {
          const n = noeud(choisi() || onglets[0]);
          if (n) {
            n.BTakeFocus(4);
            ev.stopPropagation();
            ev.preventDefault();
          }
          return;
        }
        const onglet = f.closest("[id^=quickaccess_tab_]");
        if (!onglet && (b === 11 || b === 12) && f.closest("#quickaccess_content_3, [aria-labelledby=quickaccess_tab_3], .tab_Friends, .friendsui-container")) {
          const i = onglets.indexOf(choisi()) + (b === 12 ? 1 : -1);
          if (onglets[i]) {
            onglets[i].click();
            noeud(onglets[i])?.BTakeFocus(4);
          }
          ev.stopPropagation();
          ev.preventDefault();
          return;
        }
        const stop = () => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        if (onglet) {
          if (b === 11 || b === 12) {
            const i = onglets.indexOf(onglet) + (b === 12 ? 1 : -1);
            if (onglets[i]) {
              onglets[i].click();
              noeud(onglets[i])?.BTakeFocus(4);
            }
            stop();
            return;
          }
          if (b === 9) {
            stop();
            return;
          }
          if (b === 10) {
            const c = [...d.querySelectorAll(".Focusable, button, [role=button]")].filter((e) => vis(e) && !e.closest("[id^=quickaccess_tab_]") && !e.querySelector(".Focusable")).sort((a, z) => a.getBoundingClientRect().top - z.getBoundingClientRect().top)[0];
            const n = noeud(c);
            if (n) {
              n.BTakeFocus(4);
              stop();
            }
            return;
          }
        } else if (b === 9) {
          const t0 = f.getBoundingClientRect().top;
          const dessus = [...d.querySelectorAll(".Focusable, button, [role=button]")].some((e) => vis(e) && !e.closest("[id^=quickaccess_tab_]") && !e.querySelector("[id^=quickaccess_tab_]") && !e.contains(f) && !f.contains(e) && e.getBoundingClientRect().bottom <= t0 + 2);
          if (!dessus) {
            const actif = choisi() || onglets[0];
            const n = noeud(actif);
            if (n) {
              n.BTakeFocus(4);
              stop();
            }
          }
        }
      }, true);
    } catch (e) {
    }
  }, 1e3);
  if (!window.__pcvFond) {
    const SYM = [
      "M6 9h12a5 5 0 0 1 4.8 6.3l-.8 3a2.5 2.5 0 0 1-4.3 1L16 17H8l-1.7 2.3a2.5 2.5 0 0 1-4.3-1l-.8-3A5 5 0 0 1 6 9z",
      "M5 9h14l-1.2 11.5a1.5 1.5 0 0 1-1.5 1.5H7.7a1.5 1.5 0 0 1-1.5-1.5zM9 9V7a3 3 0 0 1 6 0v2",
      "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0zM16.5 10a3 3 0 1 0 0-6M17 14a5.5 5.5 0 0 1 4.5 6",
      "M14 4l-7 8 7 8v-4.5c4 0 6.5 1.5 8 4.5-.5-5.5-3.5-9-8-9.5z",
      "M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
      "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z",
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20",
      "M9 18V6l11-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z",
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM6.5 8.5a6 6 0 0 1 4-3.5"
    ];
    const cuire = (d, flou, bulle) => {
      const c = document.createElement("canvas");
      c.width = c.height = 96;
      const x = c.getContext("2d");
      x.filter = `blur(${flou}px)`;
      x.translate(12, 12);
      x.scale(3, 3);
      const p = new Path2D(d);
      x.lineJoin = x.lineCap = "round";
      x.fillStyle = bulle ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.6)";
      x.fill(p);
      x.strokeStyle = "rgba(255,255,255,.95)";
      x.lineWidth = 1.4;
      x.translate(-0.5, -0.6);
      x.stroke(p);
      x.translate(0.5, 1.2);
      x.strokeStyle = bulle ? "#d3dbd6" : "#c4cec8";
      x.lineWidth = 0.9;
      x.stroke(p);
      return c;
    };
    let sprites = null;
    window.__pcvFond = (hote) => {
      if (!hote || hote.querySelector(":scope > canvas.pcv-fond")) return;
      sprites ||= SYM.map((d, i) => [1.2, 2.4, 3.6].map((f) => cuire(d, f, i === SYM.length - 1)));
      const cv = document.createElement("canvas");
      cv.className = "pcv-fond";
      cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none";
      hote.style.isolation = "isolate";
      hote.prepend(cv);
      const x = cv.getContext("2d"), objets = [];
      for (let i = 0; i < 30; i++) {
        const bulle = i >= 20, prof = i * 53 % 100 / 100;
        objets.push({
          s: sprites[bulle ? SYM.length - 1 : i % (SYM.length - 1)][prof > 0.66 ? 0 : prof > 0.33 ? 1 : 2],
          t: bulle ? 18 + i * 29 % 40 : 60 + i * 37 % 80,
          x: i * 211 % 1400,
          y: i * 137 % 900,
          v: 0.01 + prof * 0.018,
          r: i * 47 % 360,
          vr: (i % 2 ? 1 : -1) * (4e-3 + i % 5 * 15e-4),
          a: 0.14 + prof * 0.18
        });
      }
      let der = 0;
      const tour = (t) => {
        if (!cv.isConnected) return;
        requestAnimationFrame(tour);
        if (t - der < 33 || hote.hidden || document.hidden) return;
        const dt = Math.min(100, t - der);
        der = t;
        const W = cv.clientWidth, H = cv.clientHeight;
        if (!W) return;
        if (cv.width !== W) {
          cv.width = W;
          cv.height = H;
        }
        x.clearRect(0, 0, W, H);
        const k = W / 1280;
        for (const o of objets) {
          o.x += o.v * dt;
          o.y -= o.v * dt * 0.6;
          o.r += o.vr * dt;
          if (o.x > 1350) o.x = -o.t;
          if (o.y < -o.t) o.y = 880;
          const T2 = o.t * k;
          x.save();
          x.globalAlpha = o.a;
          x.translate(o.x * k, o.y * k);
          x.rotate(o.r * Math.PI / 180);
          x.drawImage(o.s, -T2 / 2, -T2 / 2, T2, T2);
          x.restore();
        }
      };
      requestAnimationFrame(tour);
    };
  }
  if (!window.__pcvLoupeClic) {
    window.__pcvLoupeClic = true;
    document.addEventListener("click", (e) => {
      const c = e.target.closest?.("._17M8gvakqjyaw_cLo6ntdl");
      const i = c?.querySelector("input");
      if (i && !window.__pcvClavier?.(i)) i.focus();
    }, true);
  }
  if (!document.getElementById("pcv-bulle-nom")) {
    const st = document.createElement("style");
    st.id = "pcv-bulle-nom-style";
    st.textContent = `#pcv-bulle-nom { position: fixed; z-index: 99999; transform: translateX(-50%); pointer-events: none; opacity: 0; transition: opacity .15s;
        padding: calc(var(--u) * 6) calc(var(--u) * 16); border-radius: calc(var(--u) * 15); background: var(--pcv-bulle); color: var(--pcv-sur-accent);
        font: 900 calc(var(--u) * 15) var(--pcv-police); white-space: nowrap; box-shadow: 0 calc(var(--u) * 6) calc(var(--u) * 14) rgba(0,0,0,.18); }
      #pcv-bulle-nom.vu { opacity: 1; }
      #pcv-bulle-nom::before { content: ""; position: absolute; left: 50%; top: calc(var(--u) * -6); margin-left: calc(var(--u) * -7);
        border: calc(var(--u) * 7) solid transparent; border-top: 0; border-bottom-color: var(--pcv-bulle); }`;
    document.head.appendChild(st);
    const bulle = document.createElement("div");
    bulle.id = "pcv-bulle-nom";
    document.body.appendChild(bulle);
    let minuterie;
    document.addEventListener("mouseover", (e) => {
      const el = e.target.closest?.("[data-pcv-nom]");
      if (!el) {
        bulle.classList.remove("vu");
        return;
      }
      const r = el.getBoundingClientRect();
      bulle.textContent = el.dataset.pcvNom;
      bulle.style.left = r.left + r.width / 2 + "px";
      bulle.style.top = r.bottom + innerHeight / 800 * 12 + "px";
      bulle.classList.add("vu");
      clearTimeout(minuterie);
      minuterie = setTimeout(() => bulle.classList.remove("vu"), 3500);
    }, true);
  }
  {
    (window.__pcvDoigtFins || []).forEach((f) => {
      try {
        f();
      } catch (e) {
      }
    });
    const fins = window.__pcvDoigtFins = [];
    const BORD = 32;
    window.__pcvBordDoigt = BORD;
    const GARDE_MS = 1100;
    const SEUIL = 10;
    const FIN_MS = 260;
    const FIN_COURBE = "cubic-bezier(.2,.8,.3,1)";
    const MENU = 1, ACCES = 2;
    const CARTE = { [MENU]: "{{Menu@ItemOuter}}", [ACCES]: "{{QuickAccessMenu@PanelOuterNav}}" };
    const PE = { [MENU]: "pcv-home", [ACCES]: "pcv-ar" };
    const carte = (geste) => geste.W.document.getElementById(PE[geste.cote]) || geste.W.document.querySelector(CARTE[geste.cote]);
    const NOM = { [MENU]: /^MainMenu/, [ACCES]: /^QuickAccess/ };
    const VERRE = "{{BackgroundGlass@Blur}}", VISIBLE = "{{Visible@BackgroundGlass}}";
    const PLEIN_ECRAN = "#pcv-place, .pcvc, .pcv-casino, .pcv-arcade";
    const NON_GLISSE = "{{SliderControl@SliderTrack}}, {{ToggleRail@ToggleSwitch}}, input, textarea, .pcv-pe .piste";
    const menus = () => window.__pcvMenus ||= requis(75380).SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore;
    const fenetre = (cote) => {
      try {
        window.__pcvW ||= requis(75380).SteamUIStore.WindowStore.GamepadUIMainWindowInstance;
        return window.__pcvW.m_FocusNavContext.m_rgGamepadNavigationTrees.map((a) => a.m_window).find((w) => {
          try {
            return NOM[cote].test(w.name);
          } catch (e) {
            return false;
          }
        });
      } catch (e) {
        return null;
      }
    };
    const ecranX = (e) => e.screenX - screenX;
    const ELAN = 0.45;
    const fraction = (mode, sens, x0, x, larg) => Math.max(0, Math.min(1, (mode === "ouvrir" ? 0 : 1) + sens * (x - x0) / larg));
    const vitesse = (trace, sens, tFin) => {
      if (trace.length < 2) return 0;
      const [t0, x0] = trace[0], [t1, x1] = trace[trace.length - 1];
      return t1 > t0 && tFin - t1 < 100 ? (x1 - x0) / (t1 - t0) * sens : 0;
    };
    const decider = (p, v, annule) => annule ? p > 0.5 : v > ELAN ? true : v < -ELAN ? false : p > 0.5;
    const heure = (e, W0) => e.timeStamp + (W0 ? W0.performance.timeOrigin - performance.timeOrigin : 0);
    let g = null, image = 0, nettoyage = 0, lache = 0, tGeste = -1e9;
    const JOURNAL = "pcv-doigt-journal", JOURNAL_MAX = 200;
    let journal = [], ecrire = 0;
    try {
      journal = JSON.parse(localStorage.getItem(JOURNAL)) || [];
    } catch (x) {
    }
    const noter = (...a) => {
      journal.push([Date.now(), ...a]);
      if (journal.length > JOURNAL_MAX) journal.splice(0, journal.length - JOURNAL_MAX);
      ecrire ||= setTimeout(() => {
        ecrire = 0;
        try {
          localStorage.setItem(JOURNAL, JSON.stringify(journal));
        } catch (x) {
        }
      }, 1500);
    };
    window.__pcvDoigtJournal = () => journal;
    const garder = () => {
      let m;
      try {
        m = menus();
      } catch (x) {
        return;
      }
      if (!m || m.__pcvGarde === fins) return;
      const basculer = Object.getPrototypeOf(m).ToggleSideMenu;
      m.__pcvGarde = fins;
      m.ToggleSideMenu = function(n, force) {
        if (force === void 0) {
          if (g?.pris || performance.now() - tGeste < GARDE_MS) {
            noter("bascule-ignoree", n, this.m_eOpenSideMenu, Math.round(performance.now() - tGeste));
            return;
          }
          noter("bascule", n, this.m_eOpenSideMenu);
        }
        return basculer.call(this, n, force);
      };
      fins.push(() => {
        if (m.__pcvGarde === fins) {
          delete m.ToggleSideMenu;
          delete m.__pcvGarde;
        }
      });
    };
    const nettoyer = (geste, verres = geste.verres) => {
      if (geste.c?.id) {
        geste.c.classList.remove("glisse");
        for (const p of ["--pcv-glisse", "--pcv-glisse-p", "--pcv-glisse-t"]) geste.c.style.removeProperty(p);
      }
      for (const el of geste.c ? [geste.c, geste.c.parentElement, geste.c.parentElement?.parentElement] : []) for (const p of ["transform", "transition", "will-change", "overflow"]) el?.style.removeProperty(p);
      for (const v of verres || []) {
        v.style.removeProperty("opacity");
        v.style.removeProperty("transition");
      }
    };
    const mesurer = (geste) => {
      const W = geste.W, c = geste.c, cle = W.innerWidth + "x" + W.innerHeight;
      if (geste.cote !== MENU || !c || c.id || geste.cleE === cle || W.innerWidth < 50) return;
      geste.cleE = cle;
      geste.E = Math.max(...[...c.parentElement.children].map((k) => k.offsetLeft + k.offsetWidth));
    };
    const course = (geste) => geste.cote === MENU && !geste.c?.id ? (geste.E || 0) * geste.zoom : geste.W.innerWidth > 50 ? geste.W.innerWidth : 0;
    const poser = (geste, p, ms) => {
      const c = geste.c ||= carte(geste);
      const t = ms ? `transform ${ms}ms ${FIN_COURBE}` : "none";
      if (c?.id) {
        c.classList.add("glisse");
        geste.L ||= c.offsetWidth;
        c.style.setProperty("--pcv-glisse", ((p - 1) * geste.sens * geste.L).toFixed(1) + "px");
        c.style.setProperty("--pcv-glisse-p", p.toFixed(3));
        c.style.setProperty("--pcv-glisse-t", (ms || 0) + "ms");
      } else if (c) {
        const el = geste.cote === MENU && !c.id ? c.parentElement : c;
        if (el !== c) c.style.setProperty("transition", "none", "important");
        el.parentElement?.style.setProperty("overflow", "clip", "important");
        el.style.setProperty("will-change", "transform");
        el.style.setProperty("transition", t, "important");
        el.style.setProperty("transform", c.id ? `translateX(${((p - 1) * geste.sens * 100).toFixed(2)}%)` : geste.cote === MENU ? `translateX(${((p - 1) * (geste.E || 1e4)).toFixed(1)}px)` : `translateX(${((1 - p) * 100 / geste.zoom).toFixed(2)}vw)`, "important");
      }
      for (const v of geste.verres) {
        v.style.setProperty("transition", ms ? `opacity ${ms}ms ${FIN_COURBE}` : "none", "important");
        v.style.setProperty("opacity", p.toFixed(3), "important");
      }
    };
    const avancer = () => {
      image = 0;
      if (!g?.pris) return;
      if (!trouver(g)) {
        image = requestAnimationFrame(avancer);
        return;
      }
      if (g.mode === "ouvrir" && !g.marque) {
        g.marque = true;
        g.W.__pcvParDoigt = Date.now();
      }
      g.c ||= carte(g);
      mesurer(g);
      const larg = course(g);
      if (!larg) {
        image = requestAnimationFrame(avancer);
        return;
      }
      g.p = fraction(g.mode, g.sens, g.x0, g.x, larg);
      poser(g, g.p, 0);
    };
    const trouver = (geste) => {
      if (geste.W) return true;
      geste.W = fenetre(geste.cote);
      if (!geste.W) return false;
      try {
        geste.zoom = parseFloat(geste.W.getComputedStyle(geste.W.document.documentElement).zoom) || 1;
      } catch (x) {
        geste.zoom = 1;
      }
      if (geste.W.__pcvDoigt !== fins) {
        geste.W.__pcvDoigt = fins;
        ecouter(geste.W, geste.W);
      }
      return true;
    };
    const prendre = (e) => {
      const m = menus();
      g.W = null;
      g.zoom = 1;
      trouver(g);
      if (!g.W && g.mode === "fermer") {
        g = null;
        return;
      }
      clearTimeout(nettoyage);
      g.pris = true;
      g.trace = [];
      tGeste = g.t0;
      noter("pris", g.cote, g.mode, Math.round(g.x0));
      try {
        e.target.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerId: e.pointerId, pointerType: "touch", isPrimary: true }));
      } catch (x) {
      }
      g.verres = [...document.querySelectorAll(VERRE)].filter((v) => v.matches(VISIBLE) === (g.mode === "fermer"));
      if (g.mode === "ouvrir") {
        if (g.W) {
          g.marque = true;
          g.W.__pcvParDoigt = Date.now();
          poser(g, 0, 0);
        }
        m.OpenSideMenu(g.cote);
        if (m.m_eOpenSideMenu !== g.cote) {
          noter("refus", m.m_eOpenSideMenu);
          if (g.W) nettoyer(g);
          g = null;
          tGeste = -1e9;
          return;
        }
      }
      requestAnimationFrame(() => {
        if (!g?.pris || g.mode !== "ouvrir") return;
        nettoyer({}, g.verres.filter((v) => !v.matches(VISIBLE)));
        g.verres = g.verres.filter((v) => v.matches(VISIBLE));
      });
    };
    const bas = (e, W0) => {
      if (e.button > 0 || !e.isTrusted) return;
      if (g && !g.pris) g = null;
      if (g) return;
      let m;
      try {
        m = menus();
      } catch (x2) {
        return;
      }
      const ouvert = m.m_eOpenSideMenu, x = ecranX(e);
      let cote, mode;
      if (ouvert) {
        if (ouvert !== MENU && ouvert !== ACCES) return;
        if (W0 && e.target.closest?.(NON_GLISSE)) return;
        cote = ouvert;
        mode = "fermer";
      } else {
        if (W0) return;
        cote = x < BORD ? MENU : x > innerWidth - BORD ? ACCES : 0;
        if (!cote) return;
        if (document.elementFromPoint(e.clientX, e.clientY)?.closest(PLEIN_ECRAN)) {
          noter("bas-plein-ecran", e.pointerType, Math.round(x));
          return;
        }
        mode = "ouvrir";
      }
      g = { cote, mode, sens: cote === MENU ? 1 : -1, id: e.pointerId, W0, x0: x, y0: e.clientY, x, p: mode === "ouvrir" ? 0 : 1, t0: performance.now() };
      noter("bas", e.pointerType, Math.round(x), Math.round(e.clientY), e.isPrimary ? 1 : 0, mode);
    };
    const bouge = (e, W0) => {
      if (!g || !e.isTrusted || W0 !== g.W0 || e.pointerId !== g.id) return;
      const x = ecranX(e);
      if (!g.pris) {
        const dx = x - g.x0, dy = e.clientY - g.y0;
        if (Math.hypot(dx, dy) < SEUIL) return;
        if (Math.abs(dx) > Math.abs(dy) * 1.2 && dx * g.sens * (g.mode === "ouvrir" ? 1 : -1) > 0) prendre(e);
        else {
          g = null;
          return;
        }
        if (!g) return;
      }
      e.stopPropagation();
      g.x = x;
      const t = heure(e, W0);
      g.trace.push([t, x]);
      while (g.trace.length > 2 && t - g.trace[0][0] > 100) g.trace.shift();
      image ||= requestAnimationFrame(avancer);
    };
    const haut = (e, W0) => {
      if (!g || !e.isTrusted || W0 === g.W0 && e.pointerId !== g.id) return;
      const geste = g;
      g = null;
      if (!geste.pris) return;
      lache = Date.now();
      e.stopPropagation();
      cancelAnimationFrame(image);
      image = 0;
      const v = vitesse(geste.trace, geste.sens, heure(e, W0));
      const ouvrir = decider(geste.p, v, e.type === "pointercancel");
      const but = ouvrir ? 1 : 0, ms = Math.round(Math.max(90, Math.abs(but - geste.p) * FIN_MS));
      noter("lache", e.type === "pointercancel" ? "annule" : "", Math.round(geste.p * 100), +v.toFixed(2), ouvrir ? "ouvre" : "ferme", W0 ? String(W0.name).slice(0, 12) : "principale", e.pointerType);
      if (!geste.W) {
        if (!ouvrir && menus().m_eOpenSideMenu === geste.cote) menus().CloseSideMenus();
        return;
      }
      mesurer(geste);
      poser(geste, but, ms);
      nettoyage = setTimeout(() => {
        const m = menus();
        if (!ouvrir && m.m_eOpenSideMenu === geste.cote) m.CloseSideMenus();
        if (ouvrir) nettoyer(geste);
        else nettoyage = setTimeout(() => nettoyer(geste), 400);
      }, ms + 20);
    };
    const toucher = (e) => {
      if (g?.pris && e.cancelable) e.preventDefault();
    };
    let survol = 0;
    const survoler = (e) => {
      if (e.pointerType === "touch" || e.buttons || g) return;
      const x = e.clientX;
      if ((x < BORD * 3 || x > innerWidth - BORD * 3) && e.timeStamp - survol > 600) {
        survol = e.timeStamp;
        noter("survol", e.pointerType, Math.round(x), Math.round(e.clientY));
      }
    };
    window.addEventListener("pointermove", survoler, { capture: true, passive: true });
    fins.push(() => window.removeEventListener("pointermove", survoler, { capture: true }));
    const ecouter = (W, W0) => {
      const h = [
        ["pointerdown", (e) => bas(e, W0)],
        ["pointermove", (e) => bouge(e, W0)],
        ["pointerup", (e) => haut(e, W0)],
        ["pointercancel", (e) => haut(e, W0)],
        ["touchmove", toucher],
        ["click", (e) => {
          if (g?.pris || Date.now() - lache < 300) {
            e.stopPropagation();
            e.preventDefault();
          }
        }]
      ];
      for (const [t, f] of h) W.addEventListener(t, f, { capture: true, passive: t === "pointermove" });
      fins.push(() => {
        for (const [t, f] of h) W.removeEventListener(t, f, { capture: true });
      });
    };
    ecouter(window, null);
    const brancher = () => {
      for (const cote of [MENU, ACCES]) {
        const W = fenetre(cote);
        if (W && W.__pcvDoigt !== fins) {
          W.__pcvDoigt = fins;
          ecouter(W, W);
        }
      }
    };
    brancher();
    garder();
    const suivi = setInterval(() => {
      brancher();
      garder();
    }, 1e3);
    fins.push(() => clearInterval(suivi));
  }
  {
    (window.__pcvOsdFins || []).forEach((f) => {
      try {
        f();
      } catch (e) {
      }
    });
    const fins = window.__pcvOsdFins = [];
    const O = window.opener, I = window.__pcvIcones;
    const magasin = (nom) => {
      if (O[nom]) return O[nom];
      const r = O.__pcvReq ||= (() => {
        let q;
        O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (x) => {
          q = x;
        }]);
        return q;
      })();
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
    document.getElementById("pcv-osd")?.remove();
    const osd = document.createElement("div");
    osd.id = "pcv-osd";
    osd.innerHTML = '<span class="ico-o"></span><span class="barre"><i></i><u></u></span><b></b>';
    document.body.appendChild(osd);
    fins.push(() => osd.remove());
    const audio = () => {
      if (O.__pcvModules?.audio) return O.__pcvModules.audio;
      const r = O.__pcvReq;
      if (!r) return null;
      for (const id of Object.keys(r.m)) {
        if (!String(r.m[id]).includes("m_mapAudioDevices")) continue;
        let x;
        try {
          x = r(id);
        } catch (e) {
          continue;
        }
        for (const v of Object.values(x || {})) if (typeof v?.m_mapAudioDevices?.get === "function") return (O.__pcvModules ||= {}).audio = v;
      }
      return null;
    };
    const sortie = () => {
      const a = audio();
      return a?.m_mapAudioDevices.get(a.m_activeOutputDeviceId);
    };
    const SORTIE = 1;
    let cache = 0, sorte = "", icone = "", touche = false;
    const peindreIcone = (v) => {
      const n = sorte === "volume" ? v > 1e-3 ? "volume" : "volume-coupe" : "soleil";
      if (icone !== n) {
        icone = n;
        osd.querySelector(".ico-o").innerHTML = I?.svg(n, { classe: "ico" }) || "";
      }
    };
    const garder = (ms) => {
      clearTimeout(cache);
      cache = setTimeout(() => {
        if (!touche) osd.classList.remove("vu", "large");
      }, ms);
    };
    const montrer = (s, v) => {
      try {
        if (O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore.m_eOpenSideMenu) return;
      } catch (e) {
      }
      if (v == null || isNaN(v)) return;
      sorte = s;
      peindreIcone(v);
      osd.style.setProperty("--f", Math.max(0, Math.min(1, v)).toFixed(3));
      osd.querySelector("b").textContent = Math.round(v * 100) + " %";
      osd.classList.add("vu");
      garder(osd.classList.contains("large") ? 3e3 : 1600);
    };
    const ecrireValeur = (v) => {
      v = Math.max(0, Math.min(1, v));
      if (sorte === "volume") sortie()?.setDeviceVolume(SORTIE, v);
      else magasin("SystemStoragStore").SetDisplayBrightness(v);
      montrer(sorte, v);
    };
    let avantMuet = null, envoi = 0, attente = null;
    const ecrireLimite = (v) => {
      attente = v;
      if (envoi) return;
      envoi = setTimeout(() => {
        envoi = 0;
        if (attente != null) ecrireValeur(attente);
        attente = null;
      }, 60);
    };
    const position = (ev, el) => {
      const k = document.documentElement.getBoundingClientRect().width / innerWidth || 1, r = el.getBoundingClientRect();
      return (ev.clientX * k - r.left) / r.width;
    };
    osd.addEventListener("pointerdown", (ev) => {
      if (!osd.classList.contains("vu")) return;
      ev.stopPropagation();
      touche = true;
      osd.classList.add("large");
      clearTimeout(cache);
      if (ev.target.closest(".ico-o")) {
        if (sorte !== "volume") return;
        const v = sortie()?.getDeviceVolume(SORTIE) ?? 0;
        if (v > 1e-3) {
          avantMuet = v;
          ecrireValeur(0);
        } else ecrireValeur(avantMuet || 0.5);
        return;
      }
      const b = osd.querySelector(".barre");
      try {
        osd.setPointerCapture(ev.pointerId);
      } catch (x) {
      }
      const suivre2 = (e) => {
        ecrireLimite(position(e, b));
      };
      suivre2(ev);
      osd.onpointermove = suivre2;
      osd.onpointerup = osd.onpointercancel = (e) => {
        osd.onpointermove = osd.onpointerup = osd.onpointercancel = null;
        if (e.type === "pointerup") {
          clearTimeout(envoi);
          envoi = 0;
          ecrireValeur(position(e, b));
        }
        touche = false;
        garder(3e3);
      };
    });
    osd.addEventListener("pointerup", () => {
      touche = false;
      garder(3e3);
    });
    let dev = null, abo = null, dernier = null;
    const brancherSon = () => {
      const d = sortie();
      if (!d || d === dev) return;
      abo?.Unregister?.();
      dev = d;
      dernier = d.getDeviceVolume(SORTIE);
      abo = d.m_VolumeChangedSubscribable?.Register(() => {
        const v = d.getDeviceVolume(SORTIE);
        if (v !== dernier) {
          dernier = v;
          montrer("volume", v);
        }
      });
    };
    brancherSon();
    const suiviSon = setInterval(brancherSon, 5e3);
    fins.push(() => {
      clearInterval(suiviSon);
      abo?.Unregister?.();
    });
    try {
      const B = magasin("SystemStoragStore").DisplayBrightness, a = B.Subscribe((v) => montrer("luminosite", typeof v === "number" ? v : B.Value));
      fins.push(() => {
        try {
          (a?.Unsubscribe || a?.Unregister)?.call(a);
        } catch (e) {
        }
      });
    } catch (e) {
    }
    window.__pcvOsd = { montrer };
  }
  return "barre pos\xE9e";
})();
