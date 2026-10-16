(() => {
  document.getElementById("pcv-profil")?.remove();
  clearInterval(window.__pcvProfilSuivi);
  window.__pcvProfilMiiFin?.();
  const O = window.opener;
  const IMG = (id, f) => `https://steamloopback.host/assets/${id}/${f}`;
  const CDN = (id, f) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${id}/${f}`;
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
  const jour = (rt) => {
    const j = Math.floor((Date.now() / 1e3 - rt) / 86400);
    return j <= 0 ? "aujourd'hui" : j === 1 ? "hier" : new Date(rt * 1e3).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };
  const ETATS = { 0: ["Hors ligne", "#8b9098"], 1: ["En ligne", "#2fbf71"], 2: ["Occup\xE9", "#e5484d"], 3: ["Absent", "#e0a100"], 4: ["Absent", "#e0a100"], 7: ["Invisible", "#8b9098"] };
  const ICO = {
    amis: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.2 5 2.6 5 5.8"/>',
    reglages: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    chevron: '<path d="M9 5l7 7-7 7"/>',
    visage: '<circle cx="12" cy="12" r="9"/><path d="M9 10v1M15 10v1M8.5 15c1.9 1.6 5.1 1.6 7 0"/>'
  };
  const svg = (n, t, c) => `<svg style="width:${t};height:${t};flex:none" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICO[n]}</svg>`;
  const racine = document.createElement("div");
  racine.id = "pcv-profil";
  racine.hidden = true;
  racine.innerHTML = `<style>
    #pcv-profil { position: fixed; inset: ${u(96)} 0 0 0;   
      box-shadow: 0 ${u(-96)} 0 0 var(--pcv-creux); z-index: 8600; font-family: var(--pcv-police); color: var(--pcv-texte);
      background: var(--pcv-fond-page); animation: pcvProfilEntree .3s cubic-bezier(.2,.8,.2,1); }
    #pcv-profil[hidden] { display: none; }
    @keyframes pcvProfilEntree { from { opacity: 0; transform: translateY(${u(10)}) } to { opacity: 1; transform: none } }
    #pcv-profil * { box-sizing: border-box; }
    #pcv-profil button { all: unset; cursor: pointer; box-sizing: border-box; }
    #pcv-profil .v { position: absolute; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); border-radius: ${u(34)}; }
    #pcv-profil .v-in { background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(var(--pcv-ombre-rgb) / .13); }
    #pcv-profil .gauche { left: ${u(24)}; top: 0; width: ${u(400)}; bottom: ${u(24)}; padding: ${u(28)}; display: flex; flex-direction: column; align-items: center; gap: ${u(14)}; }
    #pcv-profil .grand { width: ${u(150)}; height: ${u(150)}; border-radius: 50%; object-fit: cover; background: var(--pcv-creux);
      box-shadow: 0 0 0 ${u(7)} var(--pcv-lisere), 0 0 0 ${u(13)} rgba(47,184,255,.35), 0 ${u(16)} ${u(34)} rgb(var(--pcv-ombre-rgb) / .25); }
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
    #pcv-profil :is(.action, .jeu):hover, #pcv-profil :is(.action, .jeu):focus-visible { box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(8)} var(--pcv-cyan-plein), 0 ${u(12)} ${u(26)} rgba(47,184,255,.35); }
    #pcv-profil .bloc { left: ${u(448)}; right: ${u(24)}; padding: ${u(22)} ${u(26)}; }
    #pcv-profil .bloc h3 { margin: 0; font-size: ${u(20)}; font-weight: 900; }
    #pcv-profil .rangee { display: flex; gap: ${u(26)}; margin-top: ${u(16)}; }
    #pcv-profil .jeu { display: flex; flex-direction: column; align-items: center; gap: ${u(8)}; width: ${u(116)}; border-radius: ${u(18)}; }
    #pcv-profil .jeu i { width: ${u(96)}; height: ${u(144)}; border-radius: ${u(18)}; background: var(--pcv-creux) center / cover; box-shadow: 0 0 0 ${u(4)} var(--pcv-lisere), 0 ${u(10)} ${u(22)} rgba(0,0,0,.3); }
    #pcv-profil .jeu b { font-size: ${u(13)}; font-weight: 900; text-align: center; line-height: 1.2; }
    #pcv-profil .jeu small { font-size: ${u(12)}; font-weight: 800; color: var(--pcv-texte2); }
  </style>
  <div class="v gauche">
    <img class="grand steam" alt="">
    <canvas class="grand mii-vivant" hidden aria-hidden="true"></canvas>
    <span class="pseudo"></span>
    <span class="v-in etat"></span>
    <div class="chiffres"><div class="v-in chiffre"><b class="nb" style="color:#1a9ae6"></b><span>jeux</span></div><div class="v-in chiffre"><b class="heures" style="color:#ff8a1f"></b><span>de jeu au total</span></div></div>
    <div class="actions">
      <button class="v-in action" data-aller="profil"><span class="p">${svg("amis", u(20), "var(--pcv-vert)")}</span><span class="t"><b>Afficher mon profil Steam</b><small>Vitrine, badges, commentaires</small></span>${svg("chevron", u(18), "#66758a")}</button>
      <button class="v-in action" data-aller="compte"><span class="p">${svg("reglages", u(20), "#8b9098")}</span><span class="t"><b>Compte et confidentialit\xE9</b><small>Fonds, s\xE9curit\xE9, d\xE9connexion\u2026</small></span>${svg("chevron", u(18), "#66758a")}</button>
      <button class="v-in action" data-image><span class="p">${svg("visage", u(20), "var(--pcv-cyan-plein)")}</span><span class="t"><b>Image du profil</b><small class="image-profil"></small></span>${svg("chevron", u(18), "#66758a")}</button>
    </div>
  </div>
  <div class="v bloc" style="top:0;height:${u(300)}"><h3>Jou\xE9 r\xE9cemment</h3><div class="rangee recents"></div></div>
  <div class="v bloc" style="top:${u(322)};bottom:${u(24)}"><h3>Tes plus longues parties</h3><div class="rangee longues"></div></div>`;
  document.body.appendChild(racine);
  window.__pcvFond?.(racine);
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
    racine.querySelector(".image-profil").textContent = mii ? sans ? "Mon Mii (aucun Mii \xAB c'est moi \xBB : avatar Steam)" : "Mon Mii" : "Avatar Steam";
  };
  const MV = (() => {
    const T = window.THREE;
    let rendu = null, scene = null, cam = null, acteur = null, cle = "", raf = 0, dernier = 0, prochain = 0;
    const canevas = () => racine.querySelector(".mii-vivant");
    const disponible = () => !!(T && window.__pcvMii3D?.vrais && window.__pcvNintendo?.mii);
    const preparer = () => {
      if (rendu) return true;
      const cv = canevas();
      if (!cv) return false;
      try {
        rendu = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
      } catch (e) {
        return false;
      }
      rendu.setClearColor(0, 0);
      scene = new T.Scene();
      window.__pcvMii3D.eclairer(scene);
      cam = new T.PerspectiveCamera(22, 1, 0.05, 50);
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
  const remplir = () => {
    ecrireImage();
    appliquerAvatar();
    const p = persona(), jeux = (O.appStore.allApps || []).filter((a) => a.app_type === 1);
    racine.querySelector(".pseudo").textContent = p?.m_strPlayerName || "";
    const [libelle, couleur] = ETATS[p?.m_ePersonaState] || ETATS[1];
    const e = racine.querySelector(".etat");
    e.textContent = "\u25CF " + libelle;
    e.style.color = couleur;
    racine.querySelector(".nb").textContent = (() => {
      try {
        return O.collectionStore?.collectionsFromStorage ? O.collectionStore.allGamesCollection.visibleApps.length : 0;
      } catch (e2) {
        return jeux.length;
      }
    })();
    racine.querySelector(".heures").textContent = Math.round(jeux.reduce((s, a) => s + (a.minutes_playtime_forever || 0), 0) / 60).toLocaleString("fr-FR") + " h";
    const tuile = (a, bas) => `<button class="jeu" data-app="${echap(a.appid)}"><i style="background-image:${echap([IMG(a.appid, "library_600x900.jpg"), (() => {
      try {
        return O.appStore.GetVerticalCapsuleURLForApp(a) || "";
      } catch (e2) {
        return "";
      }
    })(), CDN(a.appid, "library_600x900.jpg")].filter(Boolean).map((x) => `url('${String(x).replace(/['\\\n\r]/g, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))}')`).join(","))}"></i><b>${echap(a.display_name)}</b><small>${echap(bas)}</small></button>`;
    racine.querySelector(".recents").innerHTML = jeux.filter((a) => a.rt_last_time_played).sort((a, b) => b.rt_last_time_played - a.rt_last_time_played).slice(0, 6).map((a) => tuile(a, jour(a.rt_last_time_played))).join("");
    racine.querySelector(".longues").innerHTML = [...jeux].sort((a, b) => (b.minutes_playtime_forever || 0) - (a.minutes_playtime_forever || 0)).slice(0, 6).map((a) => tuile(a, Math.round(a.minutes_playtime_forever / 60) + " h")).join("");
  };
  const montrer = (oui) => {
    if (oui) remplir();
    else MV.arreter();
    racine.hidden = !oui;
  };
  racine.addEventListener("click", (e) => {
    const j = e.target.closest("[data-app]");
    if (j) {
      montrer(false);
      O.SteamClient.URL.ExecuteSteamURL(`steam://nav/games/details/${j.dataset.app}`);
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
  (window.__pcvManette ||= {}).profil = (b) => {
    if (racine.hidden) return false;
    if (b === 2) {
      montrer(false);
      return true;
    }
    return b === 10;
  };
  return "profil pr\xEAt";
})();
