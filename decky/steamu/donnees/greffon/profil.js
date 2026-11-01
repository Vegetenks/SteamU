(() => {
  document.getElementById("pcv-profil")?.remove();
  clearInterval(window.__pcvProfilSuivi);
  window.__pcvProfilMiiFin?.();
  const O = window.opener;
  const TUILE = 96;
  const u = (n) => `calc(var(--u) * ${n})`;
  const persona = () => {
    try {
      return O.g_FriendsUIApp.FriendStore.self.persona;
    } catch (e) {
      return null;
    }
  };
  const avatarDe = () => document.querySelector("#header_profile img")?.src || persona()?.avatar_url_full || persona()?.avatar_url_medium || "";
  const echap = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const T = (k, v) => window.__pcvT?.(k, v) ?? k, L = () => window.__pcvLocale?.() || "fr-FR";
  const jour = (rt) => {
    const j = Math.floor((Date.now() / 1e3 - rt) / 86400);
    return j <= 0 ? T("accueil.aujourdhui") : j === 1 ? T("accueil.hier") : new Date(rt * 1e3).toLocaleDateString(L(), { day: "numeric", month: "short" });
  };
  const ETATS = { 0: [T("etat.hors_ligne"), "#8b9098"], 1: [T("home.en_ligne"), "#2fbf71"], 2: [T("etat.occupe"), "#e5484d"], 3: [T("etat.absent"), "#e0a100"], 4: [T("etat.absent"), "#e0a100"], 7: [T("etat.invisible"), "#8b9098"] };
  const ICO = {
    amis: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.2 5 2.6 5 5.8"/>',
    reglages: window.__pcvIcones?.trace("parametres") || "",
    manette: window.__pcvIcones?.trace("manette") || "",
    chevron: '<path d="M9 5l7 7-7 7"/>',
    visage: '<circle cx="12" cy="12" r="9"/><path d="M9 10v1M15 10v1M8.5 15c1.9 1.6 5.1 1.6 7 0"/>'
  };
  const svg = (n, t, c) => `<svg style="width:${t};height:${t};flex:none" viewBox="0 0 24 24" color="${c}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICO[n]}</svg>`;
  const racine = document.createElement("div");
  racine.id = "pcv-profil";
  racine.hidden = true;
  racine.innerHTML = `<style>
    #pcv-profil { position: fixed; inset: ${u(96)} 0 0 0;   
      box-shadow: 0 ${u(-96)} 0 0 var(--pcv-creux); z-index: 8600; font-family: var(--pcv-police); color: var(--pcv-texte);
      background: var(--pcv-fond-page); }
    #pcv-profil[hidden] { display: none; }
    #pcv-profil * { box-sizing: border-box; }
    #pcv-profil button { all: unset; cursor: pointer; box-sizing: border-box; }
    #pcv-profil .v { position: absolute; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); border-radius: ${u(34)}; }
    #pcv-profil .v-in { background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); }
    #pcv-profil .gauche { left: ${u(24)}; top: 0; width: ${u(400)}; bottom: ${u(24)}; padding: ${u(28)}; display: flex; flex-direction: column; align-items: center; gap: ${u(14)}; }
    #pcv-profil .grand { width: ${u(150)}; height: ${u(150)}; border-radius: 50%; object-fit: cover; background: var(--pcv-creux);
      box-shadow: 0 0 0 ${u(7)} var(--pcv-lisere), 0 0 0 ${u(13)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent), 0 ${u(16)} ${u(34)} rgb(from var(--pcv-ombre-c) r g b / .25); }
    #pcv-profil canvas.grand { display: block; }           
    #pcv-profil .mii-vivant[hidden] { display: none; }
    #pcv-profil .pseudo { font-size: ${u(30)}; font-weight: 900; margin-top: ${u(8)}; color: var(--pcv-texte); }   
    #pcv-profil .etat { padding: ${u(8)} ${u(18)}; border-radius: ${u(20)}; font-size: ${u(15)}; font-weight: 900; }
    #pcv-profil .chiffres { display: grid; grid-template-columns: 1fr 1fr; gap: ${u(12)}; width: 100%; margin-top: ${u(10)}; }
    #pcv-profil .chiffre { border-radius: ${u(24)}; padding: ${u(16)} ${u(20)}; display: flex; flex-direction: column; gap: ${u(2)}; }
    #pcv-profil .chiffre b { font-size: ${u(30)}; font-weight: 900; }
    #pcv-profil .chiffre span, #pcv-profil .action small { font-size: ${u(14)}; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-profil .actions { margin-top: auto; width: 100%; display: flex; flex-direction: column; gap: ${u(10)}; }
    #pcv-profil .action { border-radius: ${u(22)}; padding: ${u(12)} ${u(16)}; display: flex; align-items: center; gap: ${u(12)}; }
    #pcv-profil .action .p { width: ${u(40)}; height: ${u(40)}; border-radius: 50%; background: var(--pcv-pastille); display: flex; align-items: center; justify-content: center; flex: none;
      box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); }
    #pcv-profil .action b { display: block; font-size: ${u(16)}; font-weight: 900; }
    #pcv-profil .action .t { flex: 1; }
    body:not(.pcv-barre-main) #pcv-profil :is(.action, .jeu):is(:focus-visible, .sel) { box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(8)} var(--pcv-cyan-plein), 0 ${u(12)} ${u(26)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-profil .bloc { left: ${u(448)}; right: ${u(24)}; padding: ${u(22)} ${u(26)}; }
    #pcv-profil .bloc h3 { margin: 0; font-size: ${u(20)}; font-weight: 900; }
    #pcv-profil .rangee { display: flex; gap: ${u(26)}; margin-top: ${u(16)}; }
    #pcv-profil .jeu { display: flex; flex-direction: column; align-items: center; gap: ${u(8)}; width: ${u(116)}; border-radius: ${u(18)}; }
    #pcv-profil .jeu i { width: ${u(TUILE)}; height: ${u(TUILE)}; border-radius: calc(var(--u) * var(--arr, 18)); background: var(--pcv-creux) center / cover; box-shadow: 0 0 0 ${u(4)} var(--pcv-lisere), 0 ${u(10)} ${u(22)} rgba(0,0,0,.3); }
    #pcv-profil .jeu b { font-size: ${u(13)}; font-weight: 900; text-align: center; line-height: 1.2; }
    #pcv-profil .jeu small { font-size: ${u(12)}; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-profil .maintenant { display: flex; align-items: center; gap: ${u(26)}; margin-top: ${u(16)}; }
    #pcv-profil .maintenant i { width: ${u(330)}; height: ${u(154)}; border-radius: ${u(18)}; flex: none; background: var(--pcv-creux) center / cover; box-shadow: 0 0 0 ${u(4)} var(--pcv-lisere), 0 ${u(10)} ${u(22)} rgba(0,0,0,.3); }
    #pcv-profil .maintenant b { display: block; font-size: ${u(28)}; font-weight: 900; margin-bottom: ${u(10)}; }
    #pcv-profil .maintenant small { display: block; font-size: ${u(16)}; font-weight: 800; color: var(--pcv-texte2); line-height: 1.4; }
    #pcv-profil .maintenant .ouverte { color: var(--pcv-vert); }
    #pcv-profil .action .cap { width: ${u(60)}; height: ${u(34)}; border-radius: ${u(8)}; background: var(--pcv-creux) center / cover; flex: none; }
  </style>
  <div class="v gauche">
    <img class="grand steam" alt="">
    <canvas class="grand mii-vivant" hidden aria-hidden="true"></canvas>
    <span class="pseudo"></span>
    <span class="v-in etat"></span>
    <div class="chiffres"><div class="v-in chiffre"><b class="nb" style="color:#1a9ae6"></b><span class="l1"></span></div><div class="v-in chiffre"><b class="heures" style="color:#ff8a1f"></b><span class="l2"></span></div></div>
    <div class="actions">
      <button class="v-in action" data-aller="profil"><span class="p">${svg("amis", u(20), "var(--pcv-vert)")}</span><span class="t"><b>${T("profil.steam")}</b><small>${T("profil.steam_sous")}</small></span>${svg("chevron", u(18), "#66758a")}</button>
      <button class="v-in action" data-aller="compte"><span class="p">${svg("reglages", u(20), "#8b9098")}</span><span class="t"><b>${T("profil.compte")}</b><small>${T("profil.compte_sous")}</small></span>${svg("chevron", u(18), "#66758a")}</button>
      <button class="v-in action" data-image><span class="p">${svg("visage", u(20), "var(--pcv-cyan-plein)")}</span><span class="t"><b>${T("profil.image")}</b><small class="image-profil"></small></span>${svg("chevron", u(18), "#66758a")}</button>
    </div>
  </div>
  <div class="v bloc" style="top:0;height:${u(300)}"><h3 class="t1"></h3><div class="rangee recents"></div></div>
  <div class="v bloc" style="top:${u(322)};bottom:${u(24)}"><h3 class="t2"></h3><div class="rangee longues"></div></div>`;
  document.body.appendChild(racine);
  window.__pcvFond?.(racine);
  const legende = document.createElement("div");
  legende.id = "pcv-profil-legende";
  legende.className = "pcv-legende";
  racine.appendChild(legende);
  const appDe = (e) => {
    try {
      return e?.dataset.app && O.appStore.GetAppOverviewByAppID(+e.dataset.app);
    } catch (x) {
      return null;
    }
  };
  const ecrireLegende = () => {
    const e = elems()[sel], a = appDe(e);
    legende.innerHTML = window.__pcvIcones.legende(window.__pcvLegendeDe(ami ? [[3, T("ficheami.profil_steam")], [2, T("touche.retour")], e && [1, a ? T(inviter ? "social.inviter" : window.__pcvJeux?.installe?.(a) ? "accueil.jouer" : "biblio.installer") : e.querySelector("b")?.textContent || T("console.ouvrir")]] : a ? [[1, T(window.__pcvJeux?.installe?.(a) ? "accueil.jouer" : "biblio.installer")], [3, T("console.page_jeu")], [2, T("touche.retour")]] : [e && [1, T("console.ouvrir")], [2, T("touche.retour")]]));
  };
  (window.__pcvLegendes ||= {}).profil = () => {
    if (!racine.hidden) ecrireLegende();
  };
  const imageProfil = () => {
    let v = "mii";
    try {
      v = localStorage.getItem(window.__pcvImageProfil) || v;
    } catch (e) {
    }
    return v;
  };
  const ecrireImage = () => {
    const mii = imageProfil() === "mii", sans = mii && !window.__pcvMiiBase?.moi?.();
    racine.querySelector(".image-profil").textContent = mii ? sans ? T("profil.mon_mii_sans") : T("profil.mon_mii") : T("profil.avatar");
  };
  const MV = (() => {
    const T2 = window.THREE;
    let rendu = null, scene = null, cam = null, acteur = null, cle = "", raf = 0, dernier = 0, prochain = 0;
    const canevas = () => racine.querySelector(".mii-vivant");
    const disponible = () => !!(T2 && window.__pcvMii3D?.vrais && window.__pcvNintendo?.mii);
    const preparer = () => {
      if (rendu) return true;
      const cv = canevas();
      if (!cv) return false;
      try {
        rendu = new T2.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
      } catch (e) {
        return false;
      }
      rendu.setClearColor(0, 0);
      scene = new T2.Scene();
      window.__pcvMii3D.eclairer(scene);
      cam = new T2.PerspectiveCamera(22, 1, 0.05, 50);
      const haut = 1.25, bas = -0.05, cible = (haut + bas) / 2;
      cam.position.set(0, cible, (haut - bas) / 2 / Math.tan(cam.fov * Math.PI / 360));
      cam.lookAt(0, cible, 0);
      return true;
    };
    const tailler = () => {
      const cv = canevas();
      if (!cv || !rendu) return;
      const r = cv.getBoundingClientRect();
      if (!r.width || !r.height) return;
      rendu.setPixelRatio(Math.min(2, devicePixelRatio || 1));
      rendu.setSize(r.width, r.height, false);
      cam.aspect = r.width / r.height;
      cam.updateProjectionMatrix();
    };
    const image = (t) => {
      const dt = Math.min(0.1, dernier ? (t - dernier) / 1e3 : 0);
      dernier = t;
      if (t > prochain) {
        acteur.jouer("saluer", { redemarrer: true });
        prochain = t + 8e3 + Math.random() * 1e4;
      } else if (acteur.anim === "saluer" && acteur.t > 1.3) acteur.jouer("repos");
      acteur.maj(dt);
      rendu.render(scene, cam);
      raf = requestAnimationFrame(image);
    };
    const demarrer = (moi) => {
      if (!disponible() || !moi || !preparer()) return false;
      const c = moi.id + ":" + moi.donnees;
      if (c !== cle) {
        try {
          const a = window.__pcvMii3D.creer({ donnees: moi.donnees, pantalon: moi.pantalon, rendu });
          acteur?.liberer();
          acteur = a;
          scene.add(acteur.objet);
          cle = c;
        } catch (e) {
          console.warn("Ta page : Mii vivant", e);
          return false;
        }
      }
      tailler();
      requestAnimationFrame(tailler);
      if (!raf) {
        dernier = 0;
        prochain = performance.now() + 2e3 + Math.random() * 4e3;
        raf = requestAnimationFrame(image);
      }
      return true;
    };
    const arreter = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const detruire = () => {
      arreter();
      acteur?.liberer();
      acteur = null;
      cle = "";
      try {
        rendu?.dispose();
        rendu?.forceContextLoss();
      } catch (e) {
      }
      rendu = null;
    };
    return { demarrer, arreter, detruire };
  })();
  window.__pcvProfilMiiFin = MV.detruire;
  const appliquerAvatar = () => {
    const vivant = imageProfil() === "mii" && MV.demarrer(window.__pcvMiiBase?.moi?.());
    racine.querySelector(".steam").hidden = vivant;
    racine.querySelector(".mii-vivant").hidden = !vivant;
    if (!vivant) {
      MV.arreter();
      racine.querySelector(".steam").src = avatarDe();
    }
  };
  let ami = null, inviter = false, jeton = 0;
  const ACTIONS_MOI = racine.querySelector(".actions").innerHTML;
  const action = (k, ico, titre, sous) => `<button class="v-in action" data-ami="${k}">${ico.startsWith("<i") ? ico : `<span class="p">${ico}</span>`}<span class="t"><b>${titre}</b><small>${echap(sous)}</small></span>${svg("chevron", u(18), "#66758a")}</button>`;
  const remplirAmi = () => {
    const S = window.__pcvSocial, f = ami, p = f.persona, g = p.m_unGamePlayedAppID, moi = ++jeton;
    MV.arreter();
    racine.querySelector(".mii-vivant").hidden = true;
    const im = racine.querySelector(".steam");
    im.hidden = false;
    im.src = S.urlSure(p.avatar_url_full || p.avatar_url_medium);
    racine.querySelector(".pseudo").textContent = p.m_strPlayerName || "";
    const e = racine.querySelector(".etat");
    e.textContent = "\u25CF " + S.ligne(p);
    e.style.color = S.COULEUR(p);
    racine.querySelector(".l1").textContent = T("ficheami.communs");
    racine.querySelector(".l2").textContent = T("ficheami.ensemble_recemment");
    racine.querySelector(".nb").textContent = racine.querySelector(".heures").textContent = "\u2026";
    const chat = S.chat(f.accountid);
    racine.querySelector(".actions").innerHTML = (S.peutRejoindre(p) ? action("rejoindre", `<i class="cap" data-jeu="${+g}" style="background-image:${S.capsule(g)}"></i>`, T("ficheami.rejoindre_partie"), T("ficheami.partie_ouverte", { jeu: S.jeuNom(g, p) })) : "") + (S.peutEcrire(chat) ? action("discuter", svg("amis", u(20), "var(--pcv-vert)"), T("ficheami.discuter"), chat?.GetLastMessage?.() ? S.texte(chat.GetLastMessage()) : T("ficheami.discuter_sous")) : "") + (S.peutInviter() ? action("inviter", svg("manette", u(20), "var(--pcv-vert)"), T("ficheami.inviter"), T("ficheami.inviter_sous")) : "");
    racine.querySelector(".t1").textContent = T("ficheami.maintenant");
    racine.querySelector(".recents").innerHTML = `<div class="maintenant">${g ? `<i data-jeu="${+g}" style="background-image:${S.capsule(g)}"></i>` : ""}<span><b>${echap(g ? S.jeuNom(g, p) : S.ligne(p))}</b>${g && p.GetCurrentGameStatus?.() ? `<small>${echap(p.GetCurrentGameStatus())}</small>` : ""}${g ? `<small class="${S.rejoignable(p) ? "ouverte" : ""}">${T(S.rejoignable(p) ? "ficheami.ouverte_long" : "social.prive")}</small>` : ""}</span></div>`;
    S.peindre(racine);
    racine.querySelector(".t2").textContent = T(inviter ? "ficheami.choisir_jeu" : "ficheami.communs_titre");
    racine.querySelector(".longues").innerHTML = "";
    const mes = (O.appStore.allApps || []).filter((a) => a.app_type === 1 && a.minutes_playtime_forever > 0);
    const qui = (a) => O.SteamClient?.Apps?.GetFriendsWhoPlay ? O.SteamClient.Apps.GetFriendsWhoPlay(a.appid).catch(() => []) : Promise.resolve([]);
    Promise.all([Promise.all(mes.map(qui)), Promise.resolve(O.SteamClient?.Friends?.GetCoplayData?.()).catch(() => null)]).then(([joueurs, co]) => {
      if (moi !== jeton || ami !== f) return;
      const ensemble = /* @__PURE__ */ new Map();
      for (const c of [...co?.recentUsers || [], ...co?.currentUsers || []]) if (c.accountid === f.accountid) ensemble.set(c.appid, c.rtTimePlayed ?? 0);
      const communs = mes.filter((a, i) => (joueurs[i] || []).includes(f.steamid64)).sort((a, b) => ensemble.has(b.appid) - ensemble.has(a.appid) || (b.rt_last_time_played || 0) - (a.rt_last_time_played || 0));
      racine.querySelector(".nb").textContent = communs.length;
      racine.querySelector(".heures").textContent = ensemble.size;
      const bas = (a) => !ensemble.has(a.appid) ? "" : !ensemble.get(a.appid) ? T("ficheami.ensemble_maintenant") : ((q) => T(/\d/.test(q) ? "ficheami.ensemble_le" : "ficheami.ensemble_jour", { quand: q.toLocaleLowerCase(L()) }))(jour(ensemble.get(a.appid)));
      const l = communs.length ? communs : inviter ? [...mes].sort((a, b) => (b.rt_last_time_played || 0) - (a.rt_last_time_played || 0)) : [];
      racine.querySelector(".longues").innerHTML = l.slice(0, 6).map((a) => tuile(a, communs.length ? bas(a) : jour(a.rt_last_time_played))).join("");
      peindreTuiles();
      if (inviter) poser(Math.max(0, elems().findIndex((x) => x.matches(".jeu"))));
      else ecrireLegende();
    });
  };
  const remplir = () => {
    if (ami) {
      remplirAmi();
      return;
    }
    const ac = racine.querySelector(".actions");
    if (ac.innerHTML !== ACTIONS_MOI) ac.innerHTML = ACTIONS_MOI;
    racine.querySelector(".l1").textContent = T("profil.jeux");
    racine.querySelector(".l2").textContent = T("profil.heures_total");
    racine.querySelector(".t1").textContent = T("profil.recents");
    racine.querySelector(".t2").textContent = T("profil.longues");
    ecrireImage();
    appliquerAvatar();
    const p = persona(), jeux = (O.appStore.allApps || []).filter((a) => a.app_type === 1);
    racine.querySelector(".pseudo").textContent = p?.m_strPlayerName || "";
    const [libelle, couleur] = ETATS[p?.m_ePersonaState] || ETATS[1];
    const e = racine.querySelector(".etat");
    e.textContent = "\u25CF " + libelle;
    e.style.color = couleur;
    racine.querySelector(".nb").textContent = window.__pcvBridge?.resumeBibliotheque?.().nombreJeux ?? jeux.length;
    racine.querySelector(".heures").textContent = Math.round(jeux.reduce((s, a) => s + (a.minutes_playtime_forever || 0), 0) / 60).toLocaleString(L()) + " h";
    racine.querySelector(".recents").innerHTML = jeux.filter((a) => a.rt_last_time_played).sort((a, b) => b.rt_last_time_played - a.rt_last_time_played).slice(0, 6).map((a) => tuile(a, jour(a.rt_last_time_played))).join("");
    racine.querySelector(".longues").innerHTML = [...jeux].sort((a, b) => (b.minutes_playtime_forever || 0) - (a.minutes_playtime_forever || 0)).slice(0, 6).map((a) => tuile(a, Math.round(a.minutes_playtime_forever / 60) + " h")).join("");
    peindreTuiles();
  };
  const tuile = (a, bas) => `<button class="jeu" data-app="${echap(a.appid)}"><i></i><b>${echap(a.display_name)}</b><small>${echap(bas)}</small></button>`;
  const peindreTuiles = () => {
    const J = window.__pcvJeux;
    if (!J?.peindre) return;
    racine.style.setProperty("--arr", J.cotes(TUILE, 0).arr);
    racine.querySelectorAll(".jeu i").forEach((i) => {
      const a = appDe(i.parentNode);
      if (a) J.peindre(i, a, TUILE);
    });
  };
  const montrer = (oui, f = null, mode) => {
    if (oui) {
      ami = f;
      inviter = !!f && mode === "inviter";
      remplir();
    } else MV.arreter();
    const entre = oui && racine.hidden;
    if (!oui && !racine.hidden) window.__pcvApparition(racine, true);
    racine.hidden = !oui;
    if (entre) window.__pcvApparition(racine);
    if (oui) {
      window.__pcvBarreQuitter?.();
      requestAnimationFrame(() => window.__pcvProfilPremier?.());
    }
  };
  const activerJeu = (el, page = false) => {
    const a = appDe(el);
    if (!a) return;
    if (ami && inviter && !page) {
      if (window.__pcvSocial.inviter(ami, a.appid)) {
        window.__pcvSon?.("choisir");
        el.querySelector("small").textContent = T("ficheami.invitation_envoyee");
        inviter = false;
        racine.querySelector(".t2").textContent = T("ficheami.communs_titre");
        ecrireLegende();
      } else window.__pcvSon?.("bord");
      return;
    }
    montrer(false);
    if (page) window.__pcvPageJeu?.(el.dataset.app);
    else window.__pcvJeux?.jouer(a, el);
  };
  let appui = null;
  const annulerAppui = () => {
    clearTimeout(appui?.minute);
  };
  racine.addEventListener("pointerdown", (e) => {
    annulerAppui();
    const el = e.target.closest("[data-app]");
    appui = { x: e.clientX, y: e.clientY, bloque: false };
    if (el) {
      el.setPointerCapture?.(e.pointerId);
      appui.minute = setTimeout(() => {
        appui.bloque = true;
        activerJeu(el, true);
      }, 500);
    }
  });
  racine.addEventListener("pointermove", (e) => {
    if (appui && Math.hypot(e.clientX - appui.x, e.clientY - appui.y) > 12 * innerHeight / 800) {
      annulerAppui();
      appui.bloque = true;
    }
  });
  racine.addEventListener("pointercancel", () => {
    annulerAppui();
    if (appui) appui.bloque = true;
  });
  racine.addEventListener("pointerup", annulerAppui);
  racine.addEventListener("click", (e) => {
    const j = e.target.closest("[data-app]");
    if (j) {
      annulerAppui();
      if (!appui?.bloque || e.detail === 0) activerJeu(j);
      appui = null;
      return;
    }
    const k = e.target.closest("[data-ami]")?.dataset.ami;
    if (k === "inviter") {
      inviter = true;
      remplir();
      return;
    }
    if (k) {
      const f = ami;
      montrer(false);
      if (k === "rejoindre") window.__pcvSocial.rejoindre(f.persona);
      else window.__pcvAmisDiscussion?.(f.accountid);
      return;
    }
    if (e.target.closest("[data-image]")) {
      try {
        localStorage.setItem(window.__pcvImageProfil, imageProfil() === "mii" ? "avatar" : "mii");
      } catch (x) {
      }
      ecrireImage();
      appliquerAvatar();
      return;
    }
    const a = e.target.closest("[data-aller]");
    if (!a) return;
    montrer(false);
    if (a.dataset.aller === "profil") O.SteamClient.URL.ExecuteSteamURL("steam://url/SteamIDMyProfile");
    else window.__pcvVersCompte?.();
  });
  if (!window.__pcvAvatarClic) {
    window.__pcvAvatarClic = true;
    document.addEventListener("click", (e) => {
      if (e.target.closest?.("#pcv-barre")) window.__pcvProfilMontrer?.(false);
      if (!e.target.closest?.("#header_profile") || window.__pcvLaisserPasser) return;
      e.stopPropagation();
      e.preventDefault();
      window.__pcvProfilMontrer?.(true);
    }, true);
  }
  window.__pcvVersCompte = () => {
    window.__pcvLaisserPasser = true;
    document.querySelector("#header_profile")?.click();
    window.__pcvLaisserPasser = false;
  };
  window.__pcvProfilMontrer = montrer;
  let route = O.location.pathname;
  window.__pcvProfilSuivi = setInterval(() => {
    if (O.location.pathname !== route) {
      route = O.location.pathname;
      montrer(false);
    }
  }, 200);
  let sel = -1;
  const elems = () => [...racine.querySelectorAll(".action, .jeu")].filter((e) => e.getBoundingClientRect().width > 0);
  const poser = (i) => {
    racine.querySelectorAll(".sel").forEach((x) => x.classList.remove("sel"));
    sel = i;
    const e = elems()[i];
    if (e) {
      e.classList.add("sel");
      e.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    }
    ecrireLegende();
  };
  window.__pcvProfilPremier = () => poser(0);
  (window.__pcvManette ||= {}).profil = (b) => {
    if (racine.hidden) return false;
    if (b === 2) {
      const f = ami;
      montrer(false);
      if (f) window.__pcvAmisMontrer?.(true, "retour");
      return true;
    }
    if (b === 3 && ami) {
      const f = ami;
      montrer(false);
      window.__pcvSocial.profilSteam(f.persona);
      return true;
    }
    const l = elems();
    if (!l.length) return true;
    if (sel < 0 || sel >= l.length) {
      poser(0);
      return true;
    }
    const jeu = appDe(l[sel]);
    if ((b === 1 || b === 3) && jeu) {
      activerJeu(l[sel], b === 3);
      return true;
    }
    if (b === 1) {
      l[sel].click();
      return true;
    }
    if (b === 3) {
      window.__pcvSon?.("bord");
      return true;
    }
    if (b < 9 || b > 12) return true;
    const a = l[sel].getBoundingClientRect();
    let m = -1, sc = Infinity;
    l.forEach((e, i) => {
      if (i === sel) return;
      const r = e.getBoundingClientRect(), dx = r.left + r.width / 2 - a.left - a.width / 2, dy = r.top + r.height / 2 - a.top - a.height / 2;
      const ok = b === 9 ? r.bottom <= a.top + 4 : b === 10 ? r.top >= a.bottom - 4 : b === 11 ? r.right <= a.left + 4 : r.left >= a.right - 4;
      if (!ok) return;
      const s = b <= 10 ? Math.abs(dy) + 2 * Math.abs(dx) : Math.abs(dx) + 2 * Math.abs(dy);
      if (s < sc) {
        sc = s;
        m = i;
      }
    });
    if (m >= 0) {
      poser(m);
      window.__pcvSon?.("bouge");
    } else if (b === 9) window.__pcvBarreEntrer?.(ecrireLegende);
    return true;
  };
  return "profil pr\xEAt";
})();
