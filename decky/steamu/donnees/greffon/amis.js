(() => {
  document.getElementById("pcv-amis")?.remove();
  clearInterval(window.__pcvAmisSuivi);
  const O = window.opener;
  const u = (n) => `calc(var(--u) * ${n})`;
  const fs = () => O.g_FriendsUIApp.FriendStore;
  const COULEUR = (p) => p.m_unGamePlayedAppID ? "var(--pcv-vert)" : p.m_ePersonaState === 0 ? "#aab4c2" : p.m_ePersonaState === 1 ? "#1a9ae6" : "#e0a100";
  const T = (k, v) => window.__pcvT?.(k, v) ?? k;
  const depuis = (t) => {
    if (!t) return T("etat.hors_ligne");
    const m = Math.floor((Date.now() / 1e3 - t) / 60);
    return m < 60 ? T("amis.vu_min", { n: Math.max(1, m) }) : m < 2880 ? T("amis.vu_h", { n: Math.floor(m / 60) }) : T("amis.vu_jours", { n: Math.floor(m / 1440) });
  };
  const ligne = (p) => p.m_unGamePlayedAppID ? T("amis.joue_a", { jeu: O.appStore.GetAppOverviewByAppID?.(p.m_unGamePlayedAppID)?.display_name || p.m_strGameExtraInfo || T("amis.un_jeu") }) : p.m_ePersonaState === 1 ? T("home.en_ligne") : p.m_ePersonaState > 1 ? T("etat.absent") : depuis(p.m_rtLastSeenOnline);
  const echappe = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const urlSure = (u2) => {
    const s = String(u2 ?? "").trim(), t = s.replace(/[\x00-\x20]/g, "");
    return !/^[a-z][a-z0-9+.-]*:/i.test(t) || /^(https?:|data:image\/|blob:)/i.test(t) ? s : "";
  };
  const racine = document.createElement("div");
  racine.id = "pcv-amis";
  racine.hidden = true;
  racine.innerHTML = `<style>
    #pcv-amis { position: fixed; inset: 0; padding-top: ${u(96)}; box-sizing: border-box;   
      z-index: 8600; font-family: var(--pcv-police); color: var(--pcv-texte); overflow-y: auto;
      background: var(--pcv-fond-page); animation: pcvAmisEntree .3s cubic-bezier(.2,.8,.2,1); }
    #pcv-amis[hidden] { display: none; }
    @keyframes pcvAmisEntree { from { opacity: 0; transform: translateY(${u(10)}) } to { opacity: 1; transform: none } }
    #pcv-amis * { box-sizing: border-box; }
    #pcv-amis button { all: unset; cursor: pointer; box-sizing: border-box; }
    #pcv-amis .tete { display: flex; justify-content: space-between; align-items: center; padding: ${u(4)} ${u(44)} ${u(16)}; }
    #pcv-amis h2 { margin: 0; font-size: ${u(26)}; font-weight: 900; }
    #pcv-amis .onglets { display: flex; gap: ${u(10)}; }
    #pcv-amis .onglet { padding: ${u(9)} ${u(18)}; border-radius: ${u(20)}; font-size: ${u(15)}; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); }
    #pcv-amis .onglet.actif { background: var(--pcv-cyan); color: var(--pcv-sur-accent);
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 ${u(8)} ${u(20)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-amis .grille { display: grid; grid-template-columns: repeat(4, 1fr); gap: ${u(22)}; padding: 0 ${u(44)} ${u(30)}; }
    #pcv-amis .ami { border-radius: ${u(26)}; padding: ${u(16)}; display: flex; flex-direction: column; align-items: center; gap: ${u(10)};
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); transition: box-shadow .12s, transform .12s; }
    
    body:not(.pcv-barre-nav) #pcv-amis .ami.sel, #pcv-amis .ami:focus-visible { transform: translateY(${u(-3)});
      box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} color-mix(in srgb, var(--pcv-cyan-plein) 20%, transparent), 0 ${u(14)} ${u(28)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-amis .av { position: relative; }
    #pcv-amis .av img { width: ${u(84)}; height: ${u(84)}; border-radius: 50%; display: block; object-fit: cover; background: var(--pcv-creux); box-shadow: 0 0 0 ${u(4)} var(--pcv-lisere), 0 ${u(6)} ${u(14)} rgb(from var(--pcv-ombre-c) r g b / .22); }
    #pcv-amis .ami.parti img { filter: saturate(.7); }
    #pcv-amis .av i { position: absolute; right: ${u(2)}; bottom: ${u(2)}; width: ${u(18)}; height: ${u(18)}; border-radius: 50%; box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere); }
    #pcv-amis .ami b { font-size: ${u(17)}; font-weight: 900; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #pcv-amis .ami small { font-size: ${u(13)}; font-weight: 800; color: var(--pcv-texte2); text-align: center; }
    #pcv-amis .ami.joue small { color: var(--pcv-vert); }
    #pcv-amis .vide { grid-column: 1 / -1; padding: ${u(22)}; border-radius: ${u(22)}; border: 2px dashed rgba(150,170,195,.45); font-size: ${u(16)}; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-amis .voile { position: fixed; inset: 0; background: var(--pcv-voile); backdrop-filter: blur(3px); z-index: 2; }
    #pcv-amis .carte { position: fixed; left: 50%; top: 50%; transform: translate(-50%,-50%); width: ${u(560)}; z-index: 3; border-radius: ${u(34)}; padding: ${u(26)} ${u(28)};
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); display: flex; flex-direction: column; gap: ${u(18)}; }
    #pcv-amis .carte .haut { display: flex; align-items: center; gap: ${u(16)}; }
    #pcv-amis .carte img { width: ${u(76)}; height: ${u(76)}; border-radius: 50%; box-shadow: 0 0 0 ${u(4)} var(--pcv-lisere), 0 4px 10px rgba(0,0,0,.15); }
    #pcv-amis .carte b { display: block; font-size: ${u(24)}; font-weight: 900; }
    #pcv-amis .carte small { font-size: ${u(15)}; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-amis .carte .actions { display: flex; gap: ${u(12)}; }
    #pcv-amis .carte .actions button { flex: 1; text-align: center; padding: ${u(14)} 0; border-radius: ${u(24)}; font-size: ${u(17)}; font-weight: 900;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(4)} ${u(12)} rgb(from var(--pcv-ombre-c) r g b / .15); }
    #pcv-amis .carte .actions button.cyan { background: var(--pcv-cyan); color: var(--pcv-sur-accent);
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 ${u(8)} ${u(20)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
  </style>
  <div class="tete"><h2>${T("spaces.amis.nom")}</h2><div class="onglets"><button class="onglet" data-onglet="en-ligne"></button><button class="onglet" data-onglet="tous"></button></div></div>
  <div class="grille"></div><div class="carte-zone"></div>`;
  document.body.appendChild(racine);
  window.__pcvFond?.(racine);
  let onglet = "tous", liste = [], sel = 0;
  const remplir = () => {
    const tous = [...fs().all_friends].map((f) => ({ f, p: f.persona })).filter((x) => x.p);
    const enLigne = tous.filter((x) => x.p.m_ePersonaState > 0);
    racine.querySelector('[data-onglet="en-ligne"]').textContent = T("amis.onglet_en_ligne", { n: enLigne.length });
    racine.querySelector('[data-onglet="tous"]').textContent = T("amis.onglet_tous", { n: tous.length });
    racine.querySelectorAll(".onglet").forEach((b) => b.classList.toggle("actif", b.dataset.onglet === onglet));
    liste = (onglet === "tous" ? tous : enLigne).sort((a, b) => !!b.p.m_unGamePlayedAppID - !!a.p.m_unGamePlayedAppID || (b.p.m_ePersonaState > 0) - (a.p.m_ePersonaState > 0) || (b.p.m_rtLastSeenOnline || 0) - (a.p.m_rtLastSeenOnline || 0));
    sel = Math.min(sel, Math.max(0, liste.length - 1));
    racine.querySelector(".grille").innerHTML = liste.length ? liste.map(({ p }, i) => `<button class="ami${p.m_unGamePlayedAppID ? " joue" : p.m_ePersonaState === 0 ? " parti" : ""}${i === sel ? " sel" : ""}" data-i="${i}">
      <span class="av"><img src="${echappe(urlSure(p.avatar_url_medium))}" alt=""><i style="background:${COULEUR(p)}"></i></span><b>${echappe(p.m_strPlayerName)}</b><small>${echappe(ligne(p))}</small></button>`).join("") : `<div class="vide">${T("amis.aucun")}</div>`;
  };
  const carte = (i) => {
    const { p } = liste[i], z = racine.querySelector(".carte-zone"), id = p.m_steamid?.ConvertTo64BitString?.();
    z.innerHTML = `<div class="voile"></div><div class="carte"><div class="haut"><img src="${echappe(urlSure(p.avatar_url_full || p.avatar_url_medium))}" alt="">
      <span><b>${echappe(p.m_strPlayerName)}</b><small>${echappe(ligne(p))}</small></span></div>
      <div class="actions"><button class="cyan" data-act="ecrire">${T("amis.ecrire")}</button><button data-act="profil">${T("amis.voir_profil")}</button><button data-act="fermer">${T("dispo.fermer")}</button></div></div>`;
    const fermer = () => {
      z.innerHTML = "";
    };
    z.querySelector(".voile").onclick = fermer;
    z.querySelector('[data-act="fermer"]').onclick = fermer;
    z.querySelector('[data-act="profil"]').onclick = () => {
      fermer();
      montrer(false);
      O.SteamClient.URL.ExecuteSteamURL(`steam://url/SteamIDPage/${id}`);
    };
    z.querySelector('[data-act="ecrire"]').onclick = () => {
      fermer();
      montrer(false);
      O.SteamClient.URL.ExecuteSteamURL(`steam://friends/message/${id}`);
    };
  };
  const montrer = (oui) => {
    if (oui) {
      racine.querySelector(".carte-zone").innerHTML = "";
      remplir();
    }
    racine.hidden = !oui;
  };
  racine.addEventListener("click", (e) => {
    const o = e.target.closest("[data-onglet]");
    if (o) {
      onglet = o.dataset.onglet;
      sel = 0;
      remplir();
      return;
    }
    const a = e.target.closest(".ami");
    if (a) {
      sel = +a.dataset.i;
      remplir();
      carte(sel);
    }
  });
  window.__pcvAmisMontrer = montrer;
  (window.__pcvManette ||= {}).amis = (b) => {
    if (racine.hidden || document.body.classList.contains("pcv-barre-nav")) return false;
    const z = racine.querySelector(".carte-zone");
    if (z.innerHTML) {
      if (b === 2) z.innerHTML = "";
      else if (b === 1) z.querySelector(".cyan")?.click();
      return true;
    }
    const n = liste.length;
    if (b === 11) sel = Math.max(0, sel - 1);
    else if (b === 12) sel = Math.min(n - 1, sel + 1);
    else if (b === 9 && sel < 4) {
      window.__pcvBarreEntrer?.("amis");
      return true;
    } else if (b === 9) sel = Math.max(0, sel - 4);
    else if (b === 10) sel = Math.min(n - 1, sel + 4);
    else if (b === 5 || b === 6) {
      onglet = onglet === "tous" ? "en-ligne" : "tous";
      sel = 0;
    } else if (b === 1 && n) {
      remplir();
      carte(sel);
      return true;
    } else if (b === 2) {
      montrer(false);
      return true;
    } else return true;
    remplir();
    racine.querySelector(".ami.sel")?.scrollIntoView({ block: "nearest" });
    return true;
  };
  let route = O.location.pathname;
  window.__pcvAmisSuivi = setInterval(() => {
    if (O.location.pathname !== route) {
      route = O.location.pathname;
      montrer(false);
    }
  }, 200);
  return "amis pr\xEAt";
})();
