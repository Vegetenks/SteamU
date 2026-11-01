(() => {
  document.getElementById("pcv-amis")?.remove();
  clearInterval(window.__pcvAmisSuivi);
  const O = window.opener;
  const u = (n) => `calc(var(--u) * ${n})`;
  const FA = () => O.g_FriendsUIApp;
  const fs = () => FA().FriendStore;
  const COULEUR = (p) => p.m_unGamePlayedAppID ? "var(--pcv-vert)" : p.m_ePersonaState === 0 ? "#aab4c2" : p.m_ePersonaState === 1 ? "#1a9ae6" : "#e0a100";
  const T = (k, v) => window.__pcvT?.(k, v) ?? k;
  const L = () => window.__pcvLocale?.() || "fr-FR";
  const depuis = (t) => {
    if (!t) return T("etat.hors_ligne");
    const m = Math.floor((Date.now() / 1e3 - t) / 60);
    return m < 60 ? T("amis.vu_min", { n: Math.max(1, m) }) : m < 2880 ? T("amis.vu_h", { n: Math.floor(m / 60) }) : T("amis.vu_jours", { n: Math.floor(m / 1440) });
  };
  const jeuNom = (appid, p) => p?.m_unGamePlayedAppID === +appid && p.GetCurrentGameName?.() || O.appStore.GetAppOverviewByAppID?.(appid)?.display_name || FA()?.m_AppInfoStore?.GetAppInfo?.(+appid)?.m_strName || p?.m_strGameExtraInfo || T("amis.un_jeu");
  const ligne = (p) => p.m_unGamePlayedAppID ? T("amis.joue_a", { jeu: jeuNom(p.m_unGamePlayedAppID, p) }) : p.m_ePersonaState === 1 ? T("home.en_ligne") : p.m_ePersonaState > 1 ? T("etat.absent") : depuis(p.m_rtLastSeenOnline);
  const echappe = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const urlSure = (u2) => {
    const s = String(u2 ?? "").trim(), t = s.replace(/[\x00-\x20]/g, "");
    return !/^[a-z][a-z0-9+.-]*:/i.test(t) || /^(https?:|data:image\/|blob:)/i.test(t) ? s : "";
  };
  const S = window.__pcvSocial = {
    COULEUR,
    ligne,
    jeuNom,
    echappe,
    urlSure,
    // l'en-tête du jeu (aussi un jeu que l'on n'a pas : le CDN en second fond)
    capsule: (appid) => `url('https://steamloopback.host/assets/${+appid}/header.jpg'),url('https://shared.steamstatic.com/store_item_assets/steam/apps/${+appid}/header.jpg')`,
    // puis le peintre des tuiles (__pcvJeux.peindre) sur chaque [data-jeu] : un jeu récent n'a plus d'en-tête au nom fixe
    // sur le CDN, son image publique vient de la fiche de la boutique (greffon Python eshop_jeux, comme l'eShop)
    peindre: (racine2) => {
      const J = window.__pcvJeux, appel = (m, ...a) => O.DeckyBackend?.call("loader/call_plugin_method", window.__pcvGreffon?.nom, m, ...a);
      if (!J?.peindre) return;
      for (const el of racine2.querySelectorAll("[data-jeu]")) {
        const id = +el.dataset.jeu;
        if (!id || el.__pcvJeuPeint === id) continue;
        el.__pcvJeuPeint = id;
        const R = window.__pcvReplisJeux ||= /* @__PURE__ */ new Map();
        if (!R.has(id)) R.set(id, Promise.resolve(O.SteamClient.User.GetIPCountry()).then((r) => appel("eshop_jeux", "fiche", String(typeof r === "string" ? r : r?.strCountryCode || "").toLowerCase(), window.__pcvLangue?.() || "fr", id)).then((d) => d?.donnees?.image || "").catch(() => ""));
        R.get(id).then((repli) => {
          if (el.isConnected) J.peindre(el, { appid: id, app_type: 1 }, 150, false, { repli, charger: (u2) => appel("eshop_image", u2) });
        });
      }
    },
    // partie ouverte : drapeau « joignable », salon ou serveur (persona.is_in_joinable_game, le test de son menu « Rejoindre »)
    rejoignable: (p) => !!(p?.m_unGamePlayedAppID && p.is_in_joinable_game),
    // la même adresse que Steam (JoinGame de son menu d'ami) : un salon → joinlobby, sinon rungame et la chaîne « connect »
    adresse: (p) => {
      const a = p.m_unGamePlayedAppID, id = p.m_steamid?.ConvertTo64BitString?.(), l = p.is_in_valid_lobby && p.m_game_lobby_id, c = p.connect_string;
      return l ? `steam://joinlobby/${a}/${l}/${id}` : `steam://rungame/${a}/${id}` + (c ? "/" + encodeURIComponent(c) : "");
    },
    peutRejoindre: (p) => S.rejoignable(p) && typeof O.SteamClient?.URL?.ExecuteSteamURL === "function",
    rejoindre: (p) => {
      if (!S.peutRejoindre(p)) return false;
      O.SteamClient.URL.ExecuteSteamURL(S.adresse(p));
      return true;
    },
    // inviter : comme le menu d'ami de Steam (son salon, sinon la chaîne connect s'il est dans ce jeu) ; un jeu où l'on
    // n'est pas encore part sans chaîne, l'ami lancera le jeu
    peutInviter: () => typeof FA()?.FriendStore?.InviteToGame === "function",
    inviter: (f, appid) => {
      const F = FA()?.FriendStore, moi = F?.self?.persona, ici = moi?.m_unGamePlayedAppID === +appid;
      if (!S.peutInviter() || !f || !+appid) return false;
      if (ici && moi.is_in_valid_lobby && typeof F.InviteToLobby === "function") F.InviteToLobby(f, +appid, moi.m_game_lobby_id);
      else F.InviteToGame(f, +appid, ici ? moi.connect_string || "" : "");
      return true;
    },
    profilSteam: (p) => O.SteamClient.URL.ExecuteSteamURL(`steam://url/SteamIDPage/${p.m_steamid?.ConvertTo64BitString?.()}`),
    chat: (accountid) => {
      try {
        return FA().ChatStore.FriendChatStore.GetFriendChat(accountid, true);
      } catch (e) {
        return null;
      }
    },
    peutEcrire: (c) => typeof c?.SendChatMessage === "function",
    // une invitation dans un message « [gameinvite appid=… connect=…] » ou « [lobbyinvite appid=… lobbyid=…] » : l'objet
    // invitation de Steam (GameInviteStore, celui de sa discussion : AcceptGameInvite, DismissInvite, bOld…)
    invitation: (m) => {
      const x = /^\s*\[(game|lobby)invite\b([^\]]*)\]/.exec(m?.strMessage || "");
      if (!x) return null;
      const a = {};
      x[2].replace(/(\w+)=(?:"([^"]*)"|([^\s"]+))/g, (_, k, v, w) => {
        a[k] = v ?? w;
      });
      const g = FA()?.ChatStore?.GameInviteStore;
      if (typeof g?.RegisterGameInvite !== "function" || !+a.appid) return null;
      return x[1] === "lobby" ? g.RegisterGameInvite(m.unAccountID, m.rtTimestamp, +a.appid, "", "", a.lobbyid) : g.RegisterGameInvite(m.unAccountID, m.rtTimestamp, +a.appid, a.connect || "", a.remoteplay || "", void 0);
    },
    texte: (s) => String(s ?? "").replace(/\[\/?[a-z]+[^\]]*\]/gi, "").trim()
    // un message sans ses balises BBCode
  };
  const heure = (rt) => {
    if (!rt) return "";
    const d = new Date(rt * 1e3), j = Math.round(((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0) - new Date(rt * 1e3).setHours(0, 0, 0, 0)) / 864e5);
    return j <= 0 ? d.toLocaleTimeString(L(), { hour: "2-digit", minute: "2-digit" }) : j === 1 ? T("accueil.hier") : d.toLocaleDateString(L(), { day: "numeric", month: "short" });
  };
  const racine = document.createElement("div");
  racine.id = "pcv-amis";
  racine.hidden = true;
  const P = window.__pcvPresentation;
  racine.innerHTML = `<style>
    #pcv-amis { position: fixed; inset: 0; padding: ${u(96)} 0 ${u(P.LEGENDE)}; box-sizing: border-box;   
      z-index: 8600; font-family: var(--pcv-police); color: var(--pcv-texte); display: flex; flex-direction: column;
      background: var(--pcv-fond-page); }
    #pcv-amis[hidden], #pcv-amis [hidden] { display: none !important; }
    #pcv-amis * { box-sizing: border-box; }
    #pcv-amis button { all: unset; cursor: pointer; box-sizing: border-box; }
    #pcv-amis .tete { display: flex; justify-content: space-between; align-items: center; padding: ${u(4)} ${u(44)} 0; }
    #pcv-amis h2 { margin: 0; font-size: ${u(26)}; font-weight: 900; }
    #pcv-amis .onglets { display: flex; gap: ${u(10)}; }
    #pcv-amis .onglet { min-height: ${u(52)}; padding: ${u(9)} ${u(20)}; border-radius: ${u(26)}; font-size: ${u(15)}; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); }
    #pcv-amis .onglet.actif { background: var(--pcv-cyan); color: var(--pcv-sur-accent);
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 ${u(8)} ${u(20)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-amis .grille { display: grid; grid-template-columns: repeat(4, 1fr); align-content: start; gap: ${u(22)}; padding: 0 ${u(44)};
      flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; overscroll-behavior: contain; ${P.fondus} }
    #pcv-amis .ami { border-radius: ${u(26)}; padding: ${u(16)}; display: flex; flex-direction: column; align-items: center; gap: ${u(10)};
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); transition: box-shadow .12s, transform .12s; }
    
    body:not(.pcv-barre-main) #pcv-amis :is(.ami, .conv, .msg.choix).sel, #pcv-amis .ami:focus-visible { transform: translateY(${u(-3)});
      box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} color-mix(in srgb, var(--pcv-cyan-plein) 20%, transparent), 0 ${u(14)} ${u(28)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-amis .av { position: relative; flex: none; }
    #pcv-amis .av img { width: ${u(84)}; height: ${u(84)}; border-radius: 50%; display: block; object-fit: cover; background: var(--pcv-creux); box-shadow: 0 0 0 ${u(4)} var(--pcv-lisere), 0 ${u(6)} ${u(14)} rgb(from var(--pcv-ombre-c) r g b / .22); }
    #pcv-amis .ami.parti img { filter: saturate(.7); }
    #pcv-amis .av i { position: absolute; right: ${u(2)}; bottom: ${u(2)}; width: ${u(18)}; height: ${u(18)}; border-radius: 50%; box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere); }
    #pcv-amis .ami b { font-size: ${u(17)}; font-weight: 900; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #pcv-amis .ami small { font-size: ${u(13)}; font-weight: 800; color: var(--pcv-texte2); text-align: center; }
    #pcv-amis :is(.ami.joue small, .etat-jeu) { color: var(--pcv-vert); }
    
    #pcv-amis .partie { display: flex; align-items: center; gap: ${u(12)}; }
    #pcv-amis .capsule { width: ${u(100)}; height: ${u(47)}; border-radius: ${u(10)}; background: var(--pcv-creux) center / cover; flex: none;
      box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere), 0 ${u(4)} ${u(10)} rgb(from var(--pcv-ombre-c) r g b / .2); }
    #pcv-amis .rej { display: inline-flex; align-items: center; gap: ${u(6)}; padding: ${u(6)} ${u(14)}; border-radius: ${u(20)}; font-size: ${u(14)}; font-weight: 900; font-style: normal;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(3)} ${u(8)} rgb(from var(--pcv-ombre-c) r g b / .15); }
    #pcv-amis .prive { font-size: ${u(13)}; font-weight: 800; color: var(--pcv-texte2); font-style: normal; }
    #pcv-amis .vide { grid-column: 1 / -1; padding: ${u(22)}; border-radius: ${u(22)}; border: 2px dashed rgba(150,170,195,.45); font-size: ${u(16)}; font-weight: 800; color: var(--pcv-texte2); }
    
    #pcv-amis .disc { position: absolute; inset: ${u(158)} ${u(44)} ${u(110)}; display: flex; gap: ${u(24)}; }
    #pcv-amis .panneau { border-radius: ${u(34)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); padding: ${u(18)}; overflow: hidden; }
    #pcv-amis .convs { width: ${u(400)}; flex: none; display: flex; flex-direction: column; gap: ${u(6)}; overflow-y: auto; }
    #pcv-amis .conv { display: flex; align-items: center; gap: ${u(14)}; padding: ${u(10)} ${u(14)}; border-radius: ${u(22)}; }
    #pcv-amis .conv .av img, #pcv-amis .fil .av img { width: ${u(56)}; height: ${u(56)}; }
    #pcv-amis :is(.conv, .fil) .av i { width: ${u(14)}; height: ${u(14)}; right: 0; bottom: 0; }
    #pcv-amis .conv .t, #pcv-amis .msg .t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: ${u(4)}; }
    #pcv-amis :is(.conv, .msg) b { font-size: ${u(16)}; font-weight: 900; color: var(--pcv-texte); }   
    #pcv-amis :is(.conv, .msg) span { font-size: ${u(14)}; font-weight: 800; color: var(--pcv-texte2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #pcv-amis :is(.conv, .msg) time { font-size: ${u(13)}; font-weight: 800; color: var(--pcv-texte2); align-self: flex-start; margin-left: ${u(6)}; }
    #pcv-amis .fil { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: ${u(12)}; padding: ${u(22)}; }
    #pcv-amis .fil .qui { display: flex; align-items: center; gap: ${u(16)}; margin-bottom: auto; }
    #pcv-amis .fil .qui b { font-size: ${u(26)}; font-weight: 900; display: block; }
    #pcv-amis .pastille { display: inline-block; margin-top: ${u(6)}; padding: ${u(4)} ${u(12)}; border-radius: ${u(16)}; font-size: ${u(14)}; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(3)} ${u(8)} rgb(from var(--pcv-ombre-c) r g b / .13); }
    #pcv-amis .msg { display: flex; align-items: center; gap: ${u(14)}; padding: ${u(12)} ${u(18)}; border-radius: ${u(24)}; max-width: 80%;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); }
    #pcv-amis .msg.moi { align-self: flex-end; flex-direction: row-reverse; text-align: right; }
    #pcv-amis .msg.moi .t { align-items: flex-end; }
    #pcv-amis .msg .t span { white-space: normal; color: var(--pcv-texte); }
    #pcv-amis .msg.inv, #pcv-amis .msg.ecrire { max-width: none; }
    #pcv-amis .msg .capsule { width: ${u(130)}; height: ${u(61)}; }
    #pcv-amis .msg .btn { padding: ${u(10)} ${u(20)}; border-radius: ${u(22)}; font-size: ${u(16)}; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(3)} ${u(8)} rgb(from var(--pcv-ombre-c) r g b / .15); }
    #pcv-amis .msg .btn.cyan { background: var(--pcv-cyan); color: var(--pcv-sur-accent); }
    #pcv-amis .msg .clavier { width: ${u(56)}; height: ${u(56)}; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; background: var(--pcv-cyan); color: var(--pcv-sur-accent); }
    #pcv-amis .msg .clavier svg { width: 50%; height: 50%; }
    #pcv-amis .msg .saisie { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
  </style>
  <div class="tete"><h2>${T("spaces.amis.nom")}</h2><div class="onglets"><button class="onglet" data-onglet="en-ligne"></button><button class="onglet" data-onglet="tous"></button><button class="onglet nouvelle" hidden>${T("social.nouvelle")}</button></div></div>
  <div class="grille"></div><div class="disc" hidden><div class="panneau convs"></div><div class="panneau fil"></div></div>`;
  document.body.appendChild(racine);
  window.__pcvFond?.(racine);
  const legende = document.createElement("div");
  legende.id = "pcv-amis-legende";
  legende.className = "pcv-legende";
  racine.appendChild(legende);
  let derniereLegende = null;
  const ecrireLegende = () => {
    const it = vue === "disc" ? elemsDisc()[dsel] : null;
    const l = vue === "disc" ? [
      [2, T("touche.retour")],
      [4, T("social.nouvelle")],
      it?.dataset.inv ? [3, T("social.plus_tard")] : S.peutInviter() && partenaire && [3, T("social.inviter")],
      it?.dataset.inv ? [1, T("social.rejoindre")] : it?.classList.contains("ecrire") ? [1, T("social.ecrire")] : it && [1, T("console.ouvrir")]
    ] : [liste.length && [1, T("console.ouvrir")], S.peutRejoindre(liste[sel]?.p) && [3, T("social.rejoindre")], [2, T(texte.trim() ? "biblio.effacer" : "touche.retour")], [[5, 6], T("touche.onglets")], [4, T("touche.rechercher")]];
    const html = window.__pcvIcones.legende(window.__pcvLegendeDe(l));
    if (derniereLegende !== html) {
      derniereLegende = html;
      legende.innerHTML = html;
    }
  };
  (window.__pcvLegendes ||= {}).amis = () => {
    if (!racine.hidden) ecrireLegende();
  };
  const tuile = (p, i) => `<button class="ami${p.m_unGamePlayedAppID ? " joue" : p.m_ePersonaState === 0 ? " parti" : ""}" data-i="${i}">
      <span class="av"><img src="${echappe(urlSure(p.avatar_url_medium))}" alt=""><i style="background:${COULEUR(p)}"></i></span><b>${echappe(p.m_strPlayerName)}</b><small>${echappe(ligne(p))}</small>${p.m_unGamePlayedAppID ? `<span class="partie"><i class="capsule" data-jeu="${+p.m_unGamePlayedAppID}" style="background-image:${S.capsule(p.m_unGamePlayedAppID)}"></i>${S.peutRejoindre(p) ? `<em class="rej">${T("social.rejoindre")}</em>` : `<em class="prive">${T("social.prive")}</em>`}</span>` : ""}</button>`;
  let vue = "liste", onglet = "tous", liste = [], sel = 0, texte = "", contenuGrille = null, choisir = false;
  const remplir = () => {
    const tous = [...fs().all_friends].map((f) => ({ f, p: f.persona })).filter((x) => x.p);
    const enLigne = tous.filter((x) => x.p.m_ePersonaState > 0);
    for (const [k, n] of [["en-ligne", enLigne.length], ["tous", tous.length]]) {
      const b = racine.querySelector(`[data-onglet="${k}"]`), libelle = T("amis.onglet_" + k.replace("-", "_"), { n });
      if (b.textContent !== libelle) b.textContent = libelle;
    }
    racine.querySelectorAll(".onglet").forEach((b) => b.classList.toggle("actif", b.dataset.onglet === onglet));
    const q = window.__pcvPlat(texte.trim());
    liste = (onglet === "tous" ? tous : enLigne).filter((x) => !q || window.__pcvPlat(x.p.m_strPlayerName || "").includes(q)).sort((a, b) => !!b.p.m_unGamePlayedAppID - !!a.p.m_unGamePlayedAppID || (b.p.m_ePersonaState > 0) - (a.p.m_ePersonaState > 0) || (b.p.m_rtLastSeenOnline || 0) - (a.p.m_rtLastSeenOnline || 0));
    sel = Math.min(sel, Math.max(0, liste.length - 1));
    const html = liste.length ? liste.map(({ p }, i) => tuile(p, i)).join("") : `<div class="vide">${T("amis.aucun")}</div>`;
    if (contenuGrille !== html) {
      contenuGrille = html;
      racine.querySelector(".grille").innerHTML = html;
      S.peindre(racine.querySelector(".grille"));
    }
    marquer();
  };
  const marquer = () => racine.querySelectorAll(".ami").forEach((a, i) => a.classList.toggle("sel", i === sel));
  const ouvrir = (i) => {
    const f = liste[i]?.f;
    if (!f) return;
    if (choisir) {
      discussion(f.accountid);
      return;
    }
    montrer(false);
    window.__pcvProfilMontrer?.(true, f);
  };
  let partenaire = 0, dsel = -1, signature = "";
  const chats = () => {
    try {
      return FA().ChatStore.FriendChatStore.GetFriendChatsByLastChatTime().filter((c) => c?.chat_partner);
    } catch (e) {
      return [];
    }
  };
  const dernier = (c) => {
    const m = c.GetLastMessage?.();
    const inv = /^\s*\[(game|lobby)invite\b[^\]]*appid="?(\d+)/.exec(m || "");
    return inv ? T("social.invitation_a", { jeu: jeuNom(+inv[2]) }) : S.texte(m);
  };
  const avatar = (p) => `<span class="av"><img src="${echappe(urlSure(p.avatar_url_medium))}" alt=""><i style="background:${COULEUR(p)}"></i></span>`;
  const peindreDisc = () => {
    const tout = chats(), F = FA().FriendStore, ami = partenaire && F.GetFriend?.(partenaire), moi = F.self?.persona, convs = racine.querySelector(".convs");
    if (ami && !tout.some((c2) => c2.chat_partner.accountid === partenaire)) {
      const c2 = S.chat(partenaire);
      if (c2?.chat_partner) tout.unshift(c2);
    }
    const h = tout.length ? tout.map((c2) => {
      const p2 = c2.chat_partner.persona;
      return `<button class="conv" data-ami="${c2.chat_partner.accountid}">${avatar(p2)}<span class="t"><b>${echappe(p2.m_strPlayerName)}</b><span>${echappe(dernier(c2))}</span></span><time>${heure(FA().ChatStore.FriendChatStore.GetFriendLastChatTime(c2.chat_partner.accountid))}</time></button>`;
    }).join("") : `<div class="vide">${T("social.aucune_discussion")}</div>`;
    if (convs.__pcvHtml !== h) convs.innerHTML = convs.__pcvHtml = h;
    const fil = racine.querySelector(".fil");
    if (!ami) {
      fil.innerHTML = "";
      signature = "";
      return;
    }
    const saisie = fil.querySelector(".saisie");
    if (saisie && saisie === document.activeElement) return;
    const c = S.chat(partenaire), p = ami.persona, msgs = (c?.chat_messages || []).slice(-4);
    const sig = partenaire + ":" + msgs.map((m) => m.rtTimestamp + "." + m.unOrdinal).join(",");
    if (sig === signature && fil.innerHTML) return;
    signature = sig;
    const bulle = (m) => {
      const inv = S.invitation(m), lui = m.unAccountID !== F.self?.accountid, q = lui ? p : moi;
      if (inv && lui) return `<div class="msg inv${inv.bAccepted || inv.bDismissed || inv.bOld ? "" : " choix"}" data-inv="${m.rtTimestamp}">${avatar(p)}<span class="t"><b>${T("social.invite_titre", { nom: echappe(p.m_strPlayerName) })} <time>${heure(m.rtTimestamp)}</time></b><span>${echappe(jeuNom(inv.appID) + (inv.connectString || inv.lobbyID ? T("social.partie_ouverte") : ""))}</span></span>
        <i class="capsule" data-jeu="${+inv.appID}" style="background-image:${S.capsule(inv.appID)}"></i>${inv.bAccepted || inv.bDismissed || inv.bOld ? "" : `<button class="btn cyan" data-act="accepter">${T("social.rejoindre")}</button><button class="btn" data-act="plus-tard">${T("social.plus_tard")}</button>`}</div>`;
      return `<div class="msg${lui ? "" : " moi"}">${avatar(q || p)}<span class="t"><b>${lui ? echappe(p.m_strPlayerName) : T("social.toi")} <time>${heure(m.rtTimestamp)}</time></b><span>${echappe(inv ? T("social.invitation_a", { jeu: jeuNom(inv.appID) }) : S.texte(m.strMessage))}</span></span></div>`;
    };
    fil.innerHTML = `<div class="qui">${avatar(p)}<span><b>${echappe(p.m_strPlayerName)}</b><span class="pastille${p.m_unGamePlayedAppID ? " etat-jeu" : ""}">\u25CF ${echappe(ligne(p))}</span></span></div>${msgs.map(bulle).join("")}
      ${S.peutEcrire(c) ? `<div class="msg ecrire choix"><span class="clavier">${window.__pcvIcones?.svg?.("clavier", { attrs: 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' }) || ""}</span><span class="t"><b>${T("social.ecrire_a", { nom: echappe(p.m_strPlayerName) })}</b><span>${T("social.clavier")}</span></span><input class="saisie" type="text" maxlength="2000"></div>` : ""}`;
    S.peindre(fil);
    fil.querySelector(".saisie")?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const t = e.target.value.trim();
      if (!t) return;
      e.target.value = "";
      c.SendChatMessage(t);
      setTimeout(() => {
        signature = "";
        peindreDisc();
      }, 400);
    });
  };
  const elemsDisc = () => [...racine.querySelectorAll(".conv, .msg.choix")];
  const poserDisc = (i) => {
    const l = elemsDisc();
    dsel = Math.max(0, Math.min(l.length - 1, i));
    l.forEach((e, k) => e.classList.toggle("sel", k === dsel));
    l[dsel]?.scrollIntoView?.({ block: "nearest" });
    ecrireLegende();
  };
  const discussion = (id) => {
    const tout = chats();
    partenaire = id || tout[0]?.chat_partner.accountid || 0;
    vue = "disc";
    choisir = false;
    signature = "";
    const c = partenaire && S.chat(partenaire);
    try {
      c?.LoadChatLogs?.()?.then?.(() => {
        signature = "";
        if (vue === "disc") peindreDisc();
      });
    } catch (e) {
    }
    if (racine.hidden) montrer(true, "disc");
    else afficherVue();
    const l = elemsDisc(), k = l.findIndex((e) => e.classList.contains("ecrire"));
    poserDisc(k >= 0 ? k : 0);
  };
  const afficherVue = () => {
    const d = vue === "disc";
    racine.querySelector("h2").textContent = T(d ? "social.discussions" : "spaces.amis.nom");
    racine.querySelector(".grille").hidden = d;
    racine.querySelector(".disc").hidden = !d;
    racine.querySelectorAll("[data-onglet]").forEach((b) => {
      b.hidden = d;
    });
    racine.querySelector(".nouvelle").hidden = !d;
    if (d) peindreDisc();
    else remplir();
    ecrireLegende();
    P.montrerVue(racine, d ? ".disc > *" : ".grille > *");
  };
  const agirDisc = (el, b = 1) => {
    if (!el) return;
    if (el.dataset.ami) {
      discussion(+el.dataset.ami);
      return;
    }
    const c = S.chat(partenaire), m = el.dataset.inv && c?.chat_messages?.find((x) => String(x.rtTimestamp) === el.dataset.inv), inv = m && S.invitation(m);
    if (inv) {
      if (b === 1) {
        montrer(false);
        inv.AcceptGameInvite();
      } else inv.DismissInvite();
      signature = "";
      peindreDisc();
      return;
    }
    if (el.classList.contains("ecrire")) {
      const i = el.querySelector(".saisie");
      if (!window.__pcvClavier?.(i)) i?.focus();
    }
  };
  const montrer = (oui, mode) => {
    if (oui) {
      window.__pcvBarreQuitter?.();
      if (mode !== "disc") {
        vue = "liste";
        choisir = false;
      }
      if (racine.hidden && mode !== "retour") {
        onglet = "tous";
        sel = 0;
        texte = "";
        racine.querySelector(".grille").scrollTop = 0;
      }
      afficherVue();
    }
    const entre = oui && racine.hidden;
    if (!oui) P.montrerVue(racine, "");
    if (!oui && !racine.hidden) window.__pcvApparition(racine, true);
    racine.hidden = !oui;
    if (entre) window.__pcvApparition(racine);
  };
  racine.addEventListener("click", (e) => {
    if (vue === "disc") {
      if (e.target.closest(".nouvelle")) {
        vue = "liste";
        choisir = true;
        afficherVue();
        return;
      }
      const a2 = e.target.closest("[data-act]"), el = e.target.closest(".conv, .msg.choix");
      if (el) {
        poserDisc(elemsDisc().indexOf(el));
        agirDisc(el, a2?.dataset.act === "plus-tard" ? 3 : 1);
      }
      return;
    }
    const o = e.target.closest("[data-onglet]");
    if (o) {
      onglet = o.dataset.onglet;
      sel = 0;
      remplir();
      ecrireLegende();
      return;
    }
    const a = e.target.closest(".ami");
    if (!a) return;
    sel = +a.dataset.i;
    marquer();
    if (e.target.closest(".rej")) S.rejoindre(liste[sel].p);
    else ouvrir(sel);
  });
  window.__pcvAmisMontrer = montrer;
  window.__pcvAmisDiscussion = (id) => {
    window.__pcvProfilMontrer?.(false);
    window.__pcvNotifsMontrer?.(false);
    discussion(id);
  };
  const loupe = () => racine.hidden || vue === "disc" ? null : {
    texte,
    invite: T("amis.chercher_invite"),
    chercher: (t) => {
      texte = t;
      sel = 0;
      remplir();
      ecrireLegende();
    }
  };
  (window.__pcvLoupes ||= {}).amis = loupe;
  (window.__pcvManette ||= {}).amis = (b) => {
    const r = vue === "disc" ? toucheDisc(b) : touche(b);
    if (!racine.hidden) ecrireLegende();
    return r;
  };
  const toucheDisc = (b) => {
    if (racine.hidden) return false;
    const l = elemsDisc(), e = l[dsel], gauche = !!e?.classList.contains("conv");
    if (b === 2) {
      montrer(false);
      return true;
    }
    if (b === 1) agirDisc(e, 1);
    else if (b === 3 && e?.dataset.inv) agirDisc(e, 3);
    else if (b === 4) {
      vue = "liste";
      choisir = true;
      afficherVue();
    } else if (b === 3) {
      const f = partenaire && FA().FriendStore.GetFriend?.(partenaire);
      if (f && S.peutInviter()) {
        montrer(false);
        window.__pcvProfilMontrer?.(true, f, "inviter");
      } else window.__pcvSon?.("bord");
    } else if (b === 9 || b === 10) {
      const k = dsel + (b === 10 ? 1 : -1);
      if (l[k] && l[k].classList.contains("conv") === gauche) {
        poserDisc(k);
        window.__pcvSon?.("bouge");
      } else if (b === 9) window.__pcvBarreEntrer?.(ecrireLegende);
      else window.__pcvSon?.("bord");
    } else if (b === 11 || b === 12) {
      const k = b === 12 && gauche ? l.length - 1 : b === 11 && !gauche ? Math.max(0, l.findIndex((x) => x.dataset.ami === String(partenaire))) : -1;
      if (k >= 0 && l[k] && l[k] !== e) {
        poserDisc(k);
        window.__pcvSon?.("bouge");
      } else window.__pcvSon?.("bord");
    }
    return true;
  };
  const touche = (b) => {
    if (racine.hidden) return false;
    const n = liste.length;
    if (b === 11) sel = Math.max(0, sel - 1);
    else if (b === 12) sel = Math.min(n - 1, sel + 1);
    else if (b === 9 && sel < 4) {
      window.__pcvBarreEntrer?.(ecrireLegende);
      return true;
    } else if (b === 9) sel = Math.max(0, sel - 4);
    else if (b === 10) sel = Math.min(n - 1, sel + 4);
    else if (b === 5 || b === 6) {
      onglet = onglet === "tous" ? "en-ligne" : "tous";
      sel = 0;
    } else if (b === 1 && n) {
      ouvrir(sel);
      return true;
    } else if (b === 3) {
      if (!S.rejoindre(liste[sel]?.p)) window.__pcvSon?.("bord");
      return true;
    } else if (b === 4) {
      window.__pcvBarreEntrer?.(ecrireLegende);
      window.__pcvBarreChercher?.();
      return true;
    } else if (b === 2) {
      if (texte.trim()) texte = "";
      else if (choisir) {
        discussion(partenaire);
        return true;
      } else {
        montrer(false);
        return true;
      }
    } else return true;
    remplir();
    racine.querySelector(".ami.sel")?.scrollIntoView({ block: "nearest" });
    return true;
  };
  const enJeu = () => {
    try {
      return (O.SteamUIStore?.RunningApps?.length || 0) > 0;
    } catch (e) {
      return false;
    }
  };
  const recevoir = (chat, m) => {
    if (!m || m.BIsLocalEcho?.() || m.unAccountID === chat?.self?.accountid) return;
    const inv = S.invitation(m), f = chat?.chat_partner;
    if (!inv || !f || inv.bOld) return;
    const p = f.persona, fin = Date.now() + 10 * 6e4;
    window.__pcvInvitationVue = { nom: p.m_strPlayerName, jeu: jeuNom(inv.appID), t: Date.now() };
    const essayer = async () => {
      if (inv.bAccepted || inv.bDismissed || inv.bOld || Date.now() > fin || enJeu()) return;
      const montree = await window.__pcvBulleRond?.("amis", {
        img: urlSure(p.avatar_url_medium),
        titre: T("social.invite_titre", { nom: p.m_strPlayerName }),
        ligne: jeuNom(inv.appID) + (inv.connectString || inv.lobbyID ? T("social.partie_ouverte") : ""),
        vignette: S.capsule(inv.appID),
        agir: () => window.__pcvAmisDiscussion(f.accountid),
        touches: [[2, T("social.plus_tard"), () => inv.DismissInvite()], [1, T("social.rejoindre"), () => inv.AcceptGameInvite()]]
      }, 15e3);
      if (!montree) setTimeout(essayer, 2e3);
    };
    essayer();
  };
  try {
    const req = O.__pcvReq ||= (() => {
      let r;
      O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
        r = q;
      }]);
      return r;
    })();
    let P2 = O.__pcvChatAmi;
    if (!P2) for (const id of Object.keys(req.m)) {
      if (!req.m[id].toString().includes("AckChatMsgOnServer(")) continue;
      P2 = Object.values(req(id)).find((x) => typeof x?.prototype?.OnReceivedNewMessage === "function" && x.prototype.AckChatMsgOnServer)?.prototype;
      if (P2) break;
    }
    if (P2) {
      O.__pcvChatAmi = P2;
      P2.__pcvRecevoir = recevoir;
      if (!P2.__pcvOrig) {
        P2.__pcvOrig = P2.OnReceivedNewMessage;
        P2.OnReceivedNewMessage = function(m, ...r) {
          const v = P2.__pcvOrig.call(this, m, ...r);
          try {
            P2.__pcvRecevoir?.(this, m);
          } catch (e) {
          }
          return v;
        };
      }
    }
  } catch (e) {
    console.warn("Amis : invitations non suivies", e);
  }
  let route = O.location.pathname, tic = 0;
  window.__pcvAmisSuivi = setInterval(() => {
    if (O.location.pathname !== route) {
      route = O.location.pathname;
      montrer(false);
    }
    if (vue === "disc" && !racine.hidden && ++tic % 5 === 0) {
      const k = dsel;
      peindreDisc();
      poserDisc(k);
    }
  }, 200);
  return "amis pr\xEAt";
})();
