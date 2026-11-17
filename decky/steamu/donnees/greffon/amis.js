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
    texte: (s) => String(s ?? "").replace(/\[\/?[a-z]+[^\]]*\]/gi, "").trim(),
    // un message sans ses balises BBCode
    // (12/11) ajouter un ami, comme la liste d'amis de Steam (friendsui, relue sur le client le 12/11) : le code ami est le
    // numéro de compte ; SendFriendInviteBySteamID envoie la demande, ou accepte celle qu'il nous a faite (son « Accepter »
    // : SendFriendInvite, le même appel). Rend { eResult, eFriendRelationship } de Steam, ou false
    id64: (acc) => String(76561197960265728n + BigInt(acc)),
    // un code ami tapé ou collé : le numéro (ou le SteamID à 17 chiffres), ou un lien d'invitation ou de profil (s.team/p/…,
    // steamcommunity.com/user/…, /profiles/…) ; le code court d'un lien : le numéro en hexadécimal, chaque chiffre une des
    // seize lettres de Steam, coupé en deux par un tiret
    LETTRES: "bcdfghjkmnpqrtvw",
    code: (t) => {
      const s = String(t ?? "").replace(/\s+/g, ""), l = /(?:s\.team\/p|\/user)\/([bcdfghjkmnpqrtvw]+-?[bcdfghjkmnpqrtvw]*)/i.exec(s), p = /\/profiles\/(\d{17})/.exec(s)?.[1] || /^7656\d{13}$/.test(s) && s;
      const n = l ? parseInt(l[1].toLowerCase().replace("-", "").replace(/./g, (c) => S.LETTRES.indexOf(c).toString(16)), 16) : p ? Number(BigInt(p) - 76561197960265728n) : /^\d{1,10}$/.test(s) ? +s : 0;
      return n > 0 && n < 2 ** 32 ? n : null;
    },
    court: (acc) => {
      const h = acc.toString(16).replace(/./g, (c) => S.LETTRES[parseInt(c, 16)]), m = h.length >> 1;
      return h.length > 3 ? h.slice(0, m) + "-" + h.slice(m) : h;
    },
    peutAjouter: () => typeof FA()?.FriendStore?.SendFriendInviteBySteamID === "function",
    ajouter: async (acc) => {
      const F = FA()?.FriendStore;
      if (!S.peutAjouter() || !(acc > 0) || acc === F.self?.accountid || F.GetPlayer?.(acc)?.efriendrelationship === 3) return false;
      try {
        return await F.SendFriendInviteBySteamID(S.id64(acc));
      } catch (e) {
        return false;
      }
    },
    // le jeton de ton lien d'invitation (UserAccount.GetFriendInviteTokens, le service de Steam trouvé dans ses modules à son
    // nom) ; aucun valide : Steam en crée un, comme sa page « Ajouter un ami ». "" si le service manque
    jeton: async () => {
      try {
        const svc = O.__pcvInvitations ||= (() => {
          const r = req();
          for (const id of Object.keys(r.m)) if (r.m[id].toString().includes("UserAccount.GetFriendInviteTokens#1")) {
            const s = Object.values(r(id)).find((x) => typeof x?.GetFriendInviteTokens === "function");
            if (s) return s;
          }
        })();
        const t = FA().FriendStore.m_CMInterface.GetServiceTransport(), v = (await svc.GetFriendInviteTokens(t, {})).Body().toObject().tokens?.find((x) => x.valid);
        return v?.invite_token || (await svc.CreateFriendInviteToken(t, { invite_duration: String(30 * 86400) })).Body().toObject().invite_token || "";
      } catch (e) {
        return "";
      }
    }
  };
  const req = () => O.__pcvReq ||= (() => {
    let r;
    O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
      r = q;
    }]);
    return r;
  })();
  const heure = (rt) => {
    if (!rt) return "";
    const d = new Date(rt * 1e3), j = Math.round(((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0) - new Date(rt * 1e3).setHours(0, 0, 0, 0)) / 864e5);
    return j <= 0 ? d.toLocaleTimeString(L(), { hour: "2-digit", minute: "2-digit" }) : j === 1 ? T("accueil.hier") : d.toLocaleDateString(L(), { day: "numeric", month: "short" });
  };
  const CRANS = [{ col: 3, gap: 26, av: 110, nom: 26, et: 19 }, { col: 4, gap: 23, av: 90, nom: 22, et: 17 }, { col: 6, gap: 18, av: 77, nom: 19, et: 15 }, { col: 8, gap: 15, av: 82, nom: 17, et: 13 }];
  const ONGLETS = ["en-ligne", "tous", "demandes", "disc", "ajouter"], CLE_CRAN = "pcv-amis-zoom";
  const racine = document.createElement("div");
  racine.id = "pcv-amis";
  racine.hidden = true;
  let cran = (() => {
    try {
      const z = JSON.parse(localStorage.getItem(CLE_CRAN));
      return Number.isInteger(z) && z >= 0 && z < CRANS.length ? z : 1;
    } catch (e) {
      return 1;
    }
  })();
  const P = window.__pcvPresentation;
  racine.innerHTML = `<style>
    #pcv-amis { position: fixed; inset: 0; padding: ${u(96)} 0 ${u(P.LEGENDE)}; box-sizing: border-box;   
      z-index: 8600; font-family: var(--pcv-police); color: var(--pcv-texte); display: flex; flex-direction: column;
      background: var(--pcv-fond-page); }
    #pcv-amis[hidden], #pcv-amis [hidden] { display: none !important; }
    #pcv-amis * { box-sizing: border-box; }
    #pcv-amis button { all: unset; cursor: pointer; box-sizing: border-box; }
    #pcv-amis svg[data-ico] { fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; flex: none; }
    #pcv-amis .tete { display: flex; justify-content: space-between; align-items: center; padding: ${u(4)} ${u(44)} 0; }
    #pcv-amis h2 { margin: 0; font-size: ${u(26)}; font-weight: 900; }
    #pcv-amis .onglets { display: flex; gap: ${u(10)}; }
    #pcv-amis .onglet { min-height: ${u(52)}; padding: ${u(9)} ${u(20)}; border-radius: ${u(26)}; font-size: ${u(15)}; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .13); }
    #pcv-amis .onglet.actif { background: var(--pcv-cyan); color: var(--pcv-sur-accent);
      box-shadow: inset 0 6px 10px -4px rgba(255,255,255,.45), inset 0 -6px 10px -6px rgba(0,40,90,.25), 0 ${u(8)} ${u(20)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-amis .onglet { display: inline-flex; align-items: center; gap: ${u(8)}; }
    
    #pcv-amis .onglet em { font-style: normal; padding: 0 ${u(8)}; border-radius: ${u(12)}; font-size: ${u(13)}; background: var(--pcv-creux); color: var(--pcv-texte2); }
    #pcv-amis .onglet.actif em { background: color-mix(in srgb, var(--pcv-sur-accent) 30%, transparent); color: inherit; }
    #pcv-amis .onglet em.rouge { background: var(--pcv-rouge); color: var(--pcv-sur-accent); }
    #pcv-amis .onglet svg { width: ${u(18)}; height: ${u(18)}; }
    
    #pcv-amis .grille { display: grid; grid-template-columns: repeat(var(--col), minmax(0, 1fr)); align-content: start; padding: 0 ${u(58)};
      flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; overscroll-behavior: contain; ${P.fondus} }
    ${CRANS.map((c, k) => `#pcv-amis .grille[data-z="${k}"] { --col: ${c.col}; gap: ${u(c.gap)}; --av: ${u(c.av)}; --nom: ${u(c.nom)}; --et: ${u(c.et)}; }`).join("\n    ")}
    #pcv-amis .grille[data-z="3"] { padding-top: calc(${u(P.FONDU_HAUT)} + ${u(59)}); }   
    #pcv-amis .ami { position: relative; min-width: 0; border-radius: ${u(20)}; padding: ${u(17)} ${u(10)}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${u(8)};
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet);
      transition: transform .12s, opacity var(--pcv-panneau-duree); }
    
    #pcv-amis .ami::before, #pcv-amis .ami::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; transition: opacity .12s; }
    #pcv-amis .ami::before { box-shadow: 0 ${u(6)} ${u(18)} rgb(from var(--pcv-ombre-c) r g b / .12); }
    #pcv-amis .ami::after { opacity: 0; box-shadow: 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} color-mix(in srgb, var(--pcv-cyan-plein) 20%, transparent), 0 ${u(14)} ${u(28)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    body:not(.pcv-barre-main) #pcv-amis .ami.sel::before, #pcv-amis .ami:focus-visible::before { opacity: 0; }
    body:not(.pcv-barre-main) #pcv-amis .ami.sel::after, #pcv-amis .ami:focus-visible::after { opacity: 1; }
    #pcv-amis .grille .ami { aspect-ratio: 1; }
    #pcv-amis .grille[data-z="0"] .ami { gap: ${u(12)}; }
    #pcv-amis .grille[data-z="3"] .ami { padding: ${u(12)} ${u(6)}; }
    
    body:not(.pcv-barre-main) #pcv-amis :is(.ami, .conv, .msg.choix, .champ).sel, #pcv-amis .ami:focus-visible { transform: translateY(${u(-3)}); z-index: 2; }
    body:not(.pcv-barre-main) #pcv-amis :is(.conv, .msg.choix, .champ).sel {
      box-shadow: var(--pcv-reflet), 0 0 0 ${u(4)} var(--pcv-anneau-c), 0 0 0 ${u(9)} var(--pcv-cyan-plein), 0 0 0 ${u(17)} color-mix(in srgb, var(--pcv-cyan-plein) 20%, transparent), 0 ${u(14)} ${u(28)} color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent); }
    #pcv-amis .av { position: relative; flex: none; width: var(--av, ${u(84)}); height: var(--av, ${u(84)}); transition: width .25s, height .25s; }
    #pcv-amis .av img { width: 100%; height: 100%; border-radius: 50%; display: block; object-fit: cover; background: var(--pcv-creux); box-shadow: 0 0 0 ${u(4.5)} var(--pcv-lisere), 0 ${u(5)} ${u(13)} rgb(from var(--pcv-ombre-c) r g b / .22); }
    #pcv-amis :is(.ami.parti, .ami.envoyee) img { filter: saturate(.55); }
    #pcv-amis .av i { position: absolute; right: 0; bottom: 0; width: 28%; height: 28%; border-radius: 50%; box-shadow: 0 0 0 ${u(3.8)} var(--pcv-lisere); }
    #pcv-amis .ami .nom { font-size: var(--nom, ${u(17)}); font-weight: 900; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #pcv-amis .ami small { font-size: var(--et, ${u(13)}); font-weight: 800; color: var(--pcv-texte2); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #pcv-amis :is(.ami.joue small, .etat-jeu) { color: var(--pcv-vert); }
    #pcv-amis .ami.recue small { color: var(--pcv-rouge-texte); }
    #pcv-amis .ami.envoyee { opacity: .62; }
    
    #pcv-amis .partie { display: flex; align-items: center; gap: ${u(12)}; }
    #pcv-amis .ami .partie { display: none; width: 100%; gap: ${u(9)}; }
    #pcv-amis .grille[data-z="0"] .partie { display: flex; }
    #pcv-amis .capsule { width: ${u(100)}; height: ${u(47)}; border-radius: ${u(10)}; background: var(--pcv-creux) center / cover; flex: none;
      box-shadow: 0 0 0 ${u(3)} var(--pcv-lisere), 0 ${u(4)} ${u(10)} rgb(from var(--pcv-ombre-c) r g b / .2); }
    #pcv-amis .ami .capsule { flex: 1; min-width: 0; width: auto; height: ${u(59)}; border-radius: ${u(11.5)}; }
    #pcv-amis .rej { display: inline-flex; align-items: center; gap: ${u(5)}; padding: ${u(4.5)} ${u(10)} ${u(4.5)} ${u(4.5)}; border-radius: ${u(20)}; font-size: ${u(14.7)}; font-weight: 900; font-style: normal; white-space: nowrap;
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(3)} ${u(8)} rgb(from var(--pcv-ombre-c) r g b / .15); }
    #pcv-amis .prive { font-size: ${u(14)}; font-weight: 800; color: var(--pcv-texte2); font-style: normal; white-space: nowrap; }
    #pcv-amis .grille[data-z="0"] .joue small, #pcv-amis .grille:is([data-z="2"], [data-z="3"]) :is(small, .dchoix), #pcv-amis .grille[data-z="3"] .nom { display: none; }
    
    #pcv-amis .dchoix { display: flex; gap: ${u(6)}; margin-top: ${u(2.6)}; transition: opacity var(--pcv-panneau-duree); }
    #pcv-amis .dchoix span, #pcv-amis .rej { --taille: ${u(23)}; }
    #pcv-amis .dchoix span { display: flex; align-items: center; gap: ${u(4.5)}; padding: ${u(3.8)} ${u(9)} ${u(3.8)} ${u(3.8)}; border-radius: ${u(14)}; font-size: ${u(13.4)}; font-weight: 900; white-space: nowrap; background: var(--pcv-creux); }
    #pcv-amis :is(.dchoix, .rej) .pcv-touche { --taille: inherit; }
    #pcv-amis .ok { position: absolute; top: ${u(-12.8)}; left: 50%; z-index: 3; display: flex; align-items: center; gap: ${u(5)}; padding: ${u(4.5)} ${u(12.8)}; border-radius: ${u(14)};
      font-size: ${u(14.7)}; font-weight: 900; white-space: nowrap; color: var(--pcv-sur-accent); background: var(--pcv-vert); box-shadow: 0 ${u(3.8)} ${u(11.5)} color-mix(in srgb, var(--pcv-vert) 40%, transparent);
      opacity: 0; transform: translateX(-50%) scale(.5); transition: opacity var(--pcv-panneau-duree) var(--pcv-panneau-courbe), transform var(--pcv-panneau-duree) var(--pcv-panneau-courbe); }
    #pcv-amis .ok svg { width: ${u(16.6)}; height: ${u(16.6)}; }
    #pcv-amis .fait .ok { opacity: 1; transform: translateX(-50%) scale(1); }
    #pcv-amis .fait .dchoix { opacity: .3; }
    
    #pcv-amis .ami .etiq-g { display: none; left: 50%; bottom: calc(100% + ${u(19)}); max-width: none; }
    body:not(.pcv-barre-main) #pcv-amis .grille[data-z="3"] .ami.sel .etiq-g { display: block; }
    #pcv-amis .vide { grid-column: 1 / -1; padding: ${u(22)}; border-radius: ${u(22)}; border: 2px dashed rgba(150,170,195,.45); font-size: ${u(16)}; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-amis .zoom { transition: opacity .2s; }
    
    #pcv-amis .ajouter { position: absolute; inset: ${u(158)} ${u(44)} ${u(110)}; display: grid; grid-template-columns: ${u(333)} 1fr; gap: ${u(23)}; }
    #pcv-amis .ajouter .panneau { display: flex; flex-direction: column; gap: ${u(12.8)}; padding: ${u(23)}; min-height: 0; }
    #pcv-amis .titreg { font-size: ${u(15.4)}; font-weight: 900; letter-spacing: .08em; color: var(--pcv-texte2); text-transform: uppercase; }
    #pcv-amis .code { font-size: ${u(33)}; font-weight: 900; letter-spacing: .06em; color: var(--pcv-cyan-plein); white-space: nowrap; }
    #pcv-amis .qr { width: ${u(141)}; height: ${u(141)}; padding: ${u(10)}; border-radius: ${u(15.4)}; background: #fff; box-shadow: 0 0 0 ${u(3.2)} var(--pcv-lisere); overflow-wrap: anywhere; font-size: ${u(11)}; color: #000; }   
    #pcv-amis .qr svg { width: 100%; height: 100%; display: block; }
    #pcv-amis .aide { font-size: ${u(15.4)}; font-weight: 800; color: var(--pcv-texte2); line-height: 1.35; }
    #pcv-amis .champ { position: relative; flex: none; height: ${u(59)}; border-radius: ${u(30)}; background: var(--pcv-creux); display: flex; align-items: center; gap: ${u(12.8)}; padding: 0 ${u(20.5)};
      font-size: ${u(27)}; font-weight: 900; letter-spacing: .05em; white-space: nowrap; overflow: hidden; transition: box-shadow .12s, transform .12s; }
    #pcv-amis .champ svg { width: ${u(25.6)}; height: ${u(25.6)}; flex: none; color: var(--pcv-texte2); }
    #pcv-amis .champ .vide { all: unset; color: var(--pcv-texte3); }
    #pcv-amis .champ .car { display: none; width: ${u(3.2)}; height: ${u(31)}; background: var(--pcv-cyan-plein); animation: pcvAmisClignote 1s steps(1) infinite; }
    #pcv-amis .champ.saisit .car { display: block; }
    @keyframes pcvAmisClignote { 50% { opacity: 0; } }
    #pcv-amis .clavier-aide { display: inline-flex; align-items: center; gap: ${u(7.7)}; font-size: ${u(14.7)}; font-weight: 800; color: var(--pcv-texte2); opacity: 0; transition: opacity .2s; }
    #pcv-amis .champ.saisit + .clavier-aide { opacity: 1; }
    #pcv-amis .clavier-aide svg { width: ${u(23)}; height: ${u(23)}; }
    #pcv-amis .res { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-content: start; gap: ${u(20.5)}; padding: ${u(20)}; margin: 0 ${u(-12)}; flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none;
      --av: ${u(82)}; --nom: ${u(20.5)}; --et: ${u(15.4)}; }   
    #pcv-amis .res .dchoix { display: none; }
    #pcv-amis .res .ami::before { box-shadow: 0 0 0 ${u(2.6)} var(--pcv-lisere); }
    #pcv-amis .saisie { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
    
    #pcv-amis .disc { position: absolute; inset: ${u(158)} ${u(44)} ${u(110)}; display: flex; gap: ${u(24)}; }
    #pcv-amis .panneau { border-radius: ${u(34)}; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); padding: ${u(18)}; overflow: hidden; }
    #pcv-amis .convs { width: ${u(400)}; flex: none; display: flex; flex-direction: column; gap: ${u(6)}; overflow-y: auto; }
    #pcv-amis .conv { display: flex; align-items: center; gap: ${u(14)}; padding: ${u(10)} ${u(14)}; border-radius: ${u(22)}; }
    #pcv-amis :is(.conv, .fil) { --av: ${u(56)}; }
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
    #pcv-amis .msg .photo { display: block; max-width: ${u(320)}; max-height: ${u(200)}; border-radius: ${u(14)}; box-shadow: var(--pcv-ombre); }
    #pcv-amis .msg .t span { white-space: normal; color: var(--pcv-texte); }
    #pcv-amis .msg.inv, #pcv-amis .msg.ecrire { max-width: none; }
    #pcv-amis .msg .capsule { width: ${u(130)}; height: ${u(61)}; }
    #pcv-amis .msg .btn { padding: ${u(10)} ${u(20)}; border-radius: ${u(22)}; font-size: ${u(16)}; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), 0 ${u(3)} ${u(8)} rgb(from var(--pcv-ombre-c) r g b / .15); }
    #pcv-amis .msg .btn.cyan { background: var(--pcv-cyan); color: var(--pcv-sur-accent); }
    #pcv-amis .msg .clavier { width: ${u(56)}; height: ${u(56)}; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; background: var(--pcv-cyan); color: var(--pcv-sur-accent); }
    #pcv-amis .msg .clavier svg { width: 50%; height: 50%; }
  </style>
  <style class="communs"></style>
  <div class="tete"><h2>${T("spaces.amis.nom")}</h2><div class="onglets">${ONGLETS.map((o) => `<button class="onglet" data-onglet="${o}"></button>`).join("")}</div></div>
  <div class="grille" data-z="${cran}"></div><div class="disc" hidden><div class="panneau convs"></div><div class="panneau fil"></div></div>
  <div class="ajouter" hidden><div class="panneau"><span class="titreg">${T("amis.ton_code")}</span><span class="code"></span><div class="qr"></div><span class="aide">${T("amis.qr_aide")}</span></div>
    <div class="panneau"><span class="titreg">${T("amis.son_code")}</span><div class="champ">${window.__pcvIcones?.svg?.("recherche") || ""}<span class="val"></span><span class="car"></span><input class="saisie" type="text" maxlength="200"></div>
      <span class="clavier-aide">${window.__pcvIcones?.svg?.("clavier") || ""}${T("amis.clavier")}</span><div class="res"></div></div></div>
  <div class="zoom"></div>`;
  document.body.appendChild(racine);
  window.__pcvFond?.(racine);
  const legende = document.createElement("div");
  legende.id = "pcv-amis-legende";
  legende.className = "pcv-legende";
  racine.appendChild(legende);
  let derniereLegende = null;
  const ecrireLegende = () => {
    const it = vue === "disc" ? elemsDisc()[dsel] : null, x = liste[sel], onglets = [13, T("touche.onglets")];
    const l = vue === "disc" ? [
      [2, T("touche.retour")],
      [4, T("social.nouvelle")],
      it?.dataset.inv ? [3, T("social.plus_tard")] : S.peutInviter() && partenaire && [3, T("social.inviter")],
      it?.dataset.inv ? [1, T("social.rejoindre")] : it?.classList.contains("ecrire") ? [1, T("social.ecrire")] : it && [1, T("console.ouvrir")],
      onglets
    ] : vue === "ajouter" ? [(asel < 0 || genre(resultats[asel]?.f || {}) !== "envoyee") && [1, T(asel < 0 ? "social.ecrire" : resultats[asel] && genre(resultats[asel].f) === "recue" ? "amis.accepter" : "amis.envoyer")], [2, T("touche.retour")], onglets] : [
      x && x.genre !== "envoyee" && !faits.has(x.f.accountid) && [1, T(x.genre === "recue" ? "amis.accepter" : x.genre === "nouveau" ? "amis.ajouter" : "console.ouvrir")],
      x?.genre === "recue" ? [3, T("social.plus_tard")] : S.peutRejoindre(x?.p) && [3, T("social.rejoindre")],
      [2, T(texte.trim() ? "biblio.effacer" : "touche.retour")],
      onglets,
      onglet !== "demandes" && [4, T("touche.rechercher")]
    ];
    const html = window.__pcvIcones.legende(window.__pcvLegendeDe(l));
    if (derniereLegende !== html) {
      derniereLegende = html;
      legende.innerHTML = html;
    }
  };
  (window.__pcvLegendes ||= {}).amis = () => {
    if (!racine.hidden) ecrireLegende();
  };
  const tuile = (p, i, o = {}) => {
    const g = o.genre || "ami", K = window.__pcvIcones, puce = (b, mot) => `<span>${K?.touche?.(b) || ""}${mot}</span>`;
    return `<button class="ami${g !== "ami" ? " " + g : p.m_unGamePlayedAppID ? " joue" : p.m_ePersonaState === 0 ? " parti" : ""}${o.fait ? " fait" : ""}" data-i="${i}">
      <span class="av"><img src="${echappe(urlSure(p.avatar_url_medium))}" alt="" loading="lazy">${g === "ami" ? `<i style="background:${COULEUR(p)}"></i>` : ""}</span><b class="nom">${echappe(p.m_strPlayerName)}</b><small>${echappe(o.sous || (g === "recue" ? T("amis.demande_recue") : g === "envoyee" ? T("amis.demande_attend") : p.m_unGamePlayedAppID ? jeuNom(p.m_unGamePlayedAppID, p) : ligne(p)))}</small>${g === "ami" && p.m_unGamePlayedAppID ? `<span class="partie"><i class="capsule" data-jeu="${+p.m_unGamePlayedAppID}" style="background-image:${S.capsule(p.m_unGamePlayedAppID)}"></i>${S.peutRejoindre(p) ? `<em class="rej">${K?.touche?.(3) || ""}${T("social.rejoindre")}</em>` : `<em class="prive">${T("social.prive")}</em>`}</span>` : ""}${g === "recue" ? `<span class="dchoix">${puce(1, T("amis.accepter"))}${puce(3, T("social.plus_tard"))}</span><span class="ok">${K?.svg?.("coche") || ""}${T("amis.vous_etes_amis")}</span>` : g === "nouveau" ? `<span class="dchoix">${puce(1, T("amis.ajouter"))}</span><span class="ok">${K?.svg?.("envoi") || ""}${T("amis.envoyee")}</span>` : ""}<span class="etiq-g">${echappe(p.m_strPlayerName)}</span></button>`;
  };
  let vue = "liste", onglet = "tous", liste = [], sel = 0, texte = "", contenuGrille = null, choisir = false;
  let croises = null;
  const genre = (f) => f.efriendrelationship === 2 ? "recue" : f.efriendrelationship === 4 ? "envoyee" : "nouveau";
  const personnes = (t) => {
    const F = fs(), q = window.__pcvPlat(String(t ?? "").trim()), code = S.code(t), vus = /* @__PURE__ */ new Map(), moi = F.self?.accountid;
    if (!q) return [];
    const garder = (x, c) => {
      if (!x?.persona || x.accountid === moi || vus.has(x.accountid) || x.efriendrelationship === 3) return;
      vus.set(x.accountid, { f: x, p: x.persona, code: c });
    };
    if (code) {
      const x = F.GetPlayer?.(code);
      x?.LoadIfNecessary?.();
      if (x?.persona?.m_bInitialized) garder(x, code);
    }
    if (!croises) {
      croises = [];
      Promise.resolve(O.SteamClient?.Friends?.GetCoplayData?.()).then((d) => {
        croises = [...d?.currentUsers || [], ...d?.recentUsers || []].map((x) => x.accountid);
      }).catch(() => {
      });
    }
    const G = F.m_FriendGroupStore, connus = [...G?.incoming_invites_group?.member_list || [], ...G?.outgoing_invites_group?.member_list || [], ...F.m_mapPlayerCache?.values?.() || [], ...croises.map((a) => F.GetPlayer?.(a))];
    for (const x of connus) {
      x?.LoadIfNecessary?.();
      if (window.__pcvPlat(x?.persona?.m_strPlayerName || "").includes(q)) garder(x);
    }
    return [...vus.values()].slice(0, 24);
  };
  const faits = /* @__PURE__ */ new Set(), acceptes = /* @__PURE__ */ new Map();
  const demander = async (f) => {
    const acc = f?.accountid;
    if (!acc || faits.has(acc) || !S.peutAjouter()) return void window.__pcvSon?.("bord");
    faits.add(acc);
    if (f.efriendrelationship === 2) acceptes.set(acc, f);
    rafraichir();
    const r = await S.ajouter(acc);
    if (r?.eResult !== 1) {
      faits.delete(acc);
      acceptes.delete(acc);
      window.__pcvSon?.("bord");
    }
    rafraichir();
  };
  const groupe = (n) => String(n ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const remplir = () => {
    const F = fs(), G = F.m_FriendGroupStore, tous = [...F.all_friends].map((f) => ({ f, p: f.persona, genre: "ami" })).filter((x) => x.p);
    const enLigne = tous.filter((x) => x.p.m_ePersonaState > 0), recues = (G?.incoming_invites_group?.member_list || []).filter((f) => !acceptes.has(f.accountid));
    const nb = { "en-ligne": enLigne.length, tous: tous.length, demandes: recues.length };
    for (const b of racine.querySelectorAll("[data-onglet]")) {
      const k = b.dataset.onglet, n = nb[k];
      const h = (k === "ajouter" ? window.__pcvIcones?.svg?.("plus") || "" : "") + T(k === "disc" ? "social.discussions" : "amis.onglet_" + k.replace("-", "_")) + (n === void 0 || k === "demandes" && !n ? "" : `<em${k === "demandes" ? ' class="rouge"' : ""}>${n}</em>`);
      if (b.__pcvH !== h) b.innerHTML = b.__pcvH = h;
      b.classList.toggle("actif", k === onglet);
    }
    const q = window.__pcvPlat(texte.trim()), code = S.code(texte), avec = (o) => (x) => ({ f: x, p: x.persona, genre: o }), avant = liste.map((x) => x.f.accountid);
    const rang = (x) => {
      const k = avant.indexOf(x.f.accountid);
      return k < 0 ? Infinity : k;
    };
    liste = onglet === "demandes" ? [...recues, ...acceptes.values()].map(avec("recue")).concat((G?.outgoing_invites_group?.member_list || []).map(avec("envoyee"))).filter((x) => x.p).sort((a, b) => rang(a) - rang(b)) : (onglet === "tous" ? tous : enLigne).filter((x) => !q || window.__pcvPlat(x.p.m_strPlayerName || "").includes(q) || x.f.accountid === code).sort((a, b) => !!b.p.m_unGamePlayedAppID - !!a.p.m_unGamePlayedAppID || (b.p.m_ePersonaState > 0) - (a.p.m_ePersonaState > 0) || (b.p.m_rtLastSeenOnline || 0) - (a.p.m_rtLastSeenOnline || 0)).concat(choisir ? [] : personnes(texte).map((x) => ({ ...x, genre: genre(x.f) })));
    sel = Math.min(sel, Math.max(0, liste.length - 1));
    const html = liste.length ? liste.map((x, i) => tuile(x.p, i, { genre: x.genre, sous: x.code && T("amis.code", { code: groupe(x.code) }), fait: faits.has(x.f.accountid) })).join("") : `<div class="vide">${T(onglet === "demandes" ? "amis.aucune_demande" : "amis.aucun")}</div>`;
    if (contenuGrille !== html) {
      contenuGrille = html;
      racine.querySelector(".grille").innerHTML = html;
      S.peindre(racine.querySelector(".grille"));
    }
    marquer();
  };
  const marquer = () => racine.querySelectorAll(".grille .ami").forEach((a, i) => a.classList.toggle("sel", i === sel));
  const ouvrir = (i) => {
    const x = liste[i], f = x?.f;
    if (!f) return;
    if (x.genre === "envoyee") return void window.__pcvSon?.("bord");
    if (x.genre !== "ami") return void demander(f);
    if (choisir) {
      discussion(f.accountid);
      return;
    }
    montrer(false);
    window.__pcvProfilMontrer?.(true, f);
  };
  let texteAjout = "", resultats = [], asel = -1, lien = "";
  const dessinerQR = () => {
    const q = racine.querySelector(".qr");
    try {
      q.innerHTML = window.__pcvMiiQR.genererSvg(lien, "amis");
    } catch (e) {
      q.textContent = lien;
    }
  };
  const invitation = () => {
    const acc = fs().self?.accountid;
    if (lien || !acc) return;
    lien = `https://s.team/p/${S.court(acc)}`;
    dessinerQR();
    S.jeton().then((j) => {
      if (j) {
        lien += "/" + encodeURIComponent(j);
        dessinerQR();
      }
    });
  };
  const peindreAjout = () => {
    const aj = racine.querySelector(".ajouter"), code = groupe(fs().self?.accountid), val = aj.querySelector(".val");
    if (aj.querySelector(".code").textContent !== code) aj.querySelector(".code").textContent = code;
    invitation();
    const v = texteAjout ? echappe(texteAjout) : `<span class="vide">${T("amis.code_ou_nom")}</span>`;
    if (val.innerHTML !== v) val.innerHTML = v;
    resultats = personnes(texteAjout);
    asel = Math.min(asel, resultats.length - 1);
    const h = resultats.map((x, i) => tuile(x.p, i, { genre: genre(x.f), sous: x.code && T("amis.code", { code: groupe(x.code) }), fait: faits.has(x.f.accountid) })).join("") || (texteAjout.trim() ? `<div class="vide">${T("amis.personne")}</div>` : ""), res = aj.querySelector(".res");
    if (res.__pcvH !== h) res.innerHTML = res.__pcvH = h;
    marquerAjout();
  };
  const marquerAjout = () => {
    racine.querySelector(".champ").classList.toggle("sel", asel < 0);
    racine.querySelectorAll(".res .ami").forEach((a, i) => a.classList.toggle("sel", i === asel));
    racine.querySelector(".res .ami.sel")?.scrollIntoView?.({ block: "nearest" });
    ecrireLegende();
  };
  const envoyerA = (i) => {
    const f = resultats[i]?.f;
    if (f && genre(f) !== "envoyee") demander(f);
    else window.__pcvSon?.("bord");
  };
  const ecrireAjout = () => {
    const i = racine.querySelector(".ajouter .saisie");
    i.value = texteAjout;
    if (!window.__pcvClavier?.(i)) i.focus();
  };
  {
    const i = racine.querySelector(".ajouter .saisie"), champ = racine.querySelector(".champ");
    i.addEventListener("input", () => {
      texteAjout = i.value;
      asel = -1;
      peindreAjout();
    });
    i.addEventListener("focus", () => champ.classList.add("saisit"));
    i.addEventListener("blur", () => champ.classList.remove("saisit"));
    i.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      i.blur();
      if (resultats.length) {
        asel = 0;
        marquerAjout();
      }
    });
  }
  const rafraichir = () => vue === "ajouter" ? peindreAjout() : remplir();
  let zoomer = null;
  const barreZoom = (n) => {
    const z = racine.querySelector(".zoom"), h = window.__pcvIcones.zoom(CRANS.length, n, [5, 6]);
    if (z.__pcvH !== h) z.innerHTML = z.__pcvH = h;
  };
  const zoom = (d) => (zoomer ||= window.__pcvJeux.crans({ cran: () => cran, max: () => CRANS.length - 1, barre: barreZoom, aller: (n) => {
    const g = racine.querySelector(".grille"), t = [...g.children], avant = t.map((e) => e.getBoundingClientRect());
    cran = n;
    g.dataset.z = n;
    barreZoom(n);
    try {
      localStorage.setItem(CLE_CRAN, n);
    } catch (e) {
    }
    window.__pcvJeux.glisser(t, avant);
    g.querySelector(".ami.sel")?.scrollIntoView?.({ block: "nearest" });
  } }))(d);
  const ongletVers = (o) => {
    window.__pcvSon?.("onglet");
    if (o === "disc") {
      discussion(partenaire);
      return;
    }
    onglet = o;
    vue = o === "ajouter" ? "ajouter" : "liste";
    choisir = false;
    sel = 0;
    asel = -1;
    racine.querySelector(".grille").scrollTop = 0;
    afficherVue();
  };
  (window.__pcvVue ||= {}).amis = () => {
    if (racine.hidden || document.body.classList.contains("pcv-barre-main")) return false;
    ongletVers(ONGLETS[(ONGLETS.indexOf(vue === "liste" ? onglet : vue) + 1) % ONGLETS.length]);
    return true;
  };
  let partenaire = 0, dsel = -1, signature = "";
  const chats = () => {
    try {
      return FA().ChatStore.FriendChatStore.GetFriendChatsByLastChatTime().filter((c) => c?.chat_partner);
    } catch (e) {
      return [];
    }
  };
  const imageDe = (t) => {
    const x = /^\s*\[img\b[^\]]*?\bsrc="?(https:\/\/images\.steamusercontent\.com\/[^\s"\]]+)"?(?:[^\]]*?\bthumbnail_src="?(https:\/\/images\.steamusercontent\.com\/[^\s"\]]+))?/.exec(t || "");
    return x ? x[2] || x[1] : null;
  };
  {
    const sys = O.SteamClient?.System, copier = sys?.CopyFilesToClipboard;
    if (copier && !copier.__pcv) {
      const f = (l, ...a) => {
        O.__pcvDerniereCopie = { chemin: String([].concat(l)[0] || ""), t: Date.now() };
        return copier.call(sys, l, ...a);
      };
      f.__pcv = true;
      sys.CopyFilesToClipboard = f;
    }
  }
  const CONTEXTE_CONSOLE = { m_unPID: 0, m_nBrowserID: -1, m_unAppID: 0, m_eUIMode: 4 };
  const envoyerImage = async (c, url, nom, appid) => {
    try {
      const fichier = new File([await (await fetch(url)).blob()], nom, { type: /\.png$/i.test(nom) ? "image/png" : "image/jpeg" });
      const UI = O.g_FriendsUIApp.UIStore, MS = O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore, ouvrir2 = MS.OpenSideMenu, basculer = MS.ToggleSideMenu;
      MS.OpenSideMenu = MS.ToggleSideMenu = () => {
      };
      try {
        const vue2 = Object.getPrototypeOf(UI).ShowAndOrActivateChat.call(UI, [...UI.m_mapChatBrowserContexts.values()][0]?.m_browserContext || CONTEXTE_CONSOLE, c, true);
        await vue2.m_fileUploadManager.SetImageFileToUpload(fichier, { info: { unAssociatedAppID: appid } });
        await vue2.UploadFile();
        setTimeout(() => {
          signature = "";
          peindreDisc();
        }, 800);
      } finally {
        setTimeout(() => {
          MS.OpenSideMenu = ouvrir2;
          MS.ToggleSideMenu = basculer;
        }, 1e3);
      }
    } catch (x) {
      console.warn("amis : image non envoy\xE9e", x);
      window.__pcvSon?.("bord");
    }
  };
  const dernier = (c) => {
    const m = c.GetLastMessage?.();
    if (imageDe(m)) return T("social.image");
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
      return `<div class="msg${lui ? "" : " moi"}">${avatar(q || p)}<span class="t"><b>${lui ? echappe(p.m_strPlayerName) : T("social.toi")} <time>${heure(m.rtTimestamp)}</time></b>${imageDe(m.strMessage) ? `<img class="photo" src="${echappe(imageDe(m.strMessage))}" alt="">` : `<span>${echappe(inv ? T("social.invitation_a", { jeu: jeuNom(inv.appID) }) : S.texte(m.strMessage))}</span>`}</span></div>`;
    };
    fil.innerHTML = `<div class="qui">${avatar(p)}<span><b>${echappe(p.m_strPlayerName)}</b><span class="pastille${p.m_unGamePlayedAppID ? " etat-jeu" : ""}">\u25CF ${echappe(ligne(p))}</span></span></div>${msgs.map(bulle).join("")}
      ${S.peutEcrire(c) ? `<div class="msg ecrire choix"><span class="clavier">${window.__pcvIcones?.svg?.("clavier", { attrs: 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' }) || ""}</span><span class="t"><b>${T("social.ecrire_a", { nom: echappe(p.m_strPlayerName) })}</b><span>${T("social.clavier")}</span></span><input class="saisie" type="text" maxlength="2000"></div>` : ""}`;
    S.peindre(fil);
    fil.querySelector(".saisie")?.addEventListener("paste", (e) => {
      const d = O.__pcvDerniereCopie, x = d && Date.now() - d.t < 36e5 && /\/760\/remote\/(\d+)\/screenshots\/([^/]+\.(?:jpe?g|png))$/i.exec(d.chemin);
      if (!x || ![...e.clipboardData?.types || []].includes("text/uri-list")) return;
      e.preventDefault();
      envoyerImage(c, `https://steamloopback.host/screenshots/${x[1]}/screenshots/${x[2]}`, x[2], +x[1]);
    });
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
    vue = onglet = "disc";
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
  const VUES = { liste: ".grille > *", disc: ".disc > *", ajouter: ".ajouter > *" };
  const afficherVue = () => {
    racine.querySelector(".grille").hidden = racine.querySelector(".zoom").hidden = vue !== "liste";
    racine.querySelector(".disc").hidden = vue !== "disc";
    racine.querySelector(".ajouter").hidden = vue !== "ajouter";
    remplir();
    if (vue === "disc") peindreDisc();
    else if (vue === "ajouter") peindreAjout();
    else barreZoom(cran);
    ecrireLegende();
    P.montrerVue(racine, VUES[vue]);
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
      const communs = racine.querySelector("style.communs");
      if (!communs.textContent) communs.textContent = P.cssGrille("#pcv-amis");
      if (racine.hidden && mode !== "retour") {
        if (mode !== "disc") onglet = "tous";
        sel = 0;
        asel = -1;
        texte = texteAjout = "";
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
    const o = e.target.closest("[data-onglet]");
    if (o) {
      ongletVers(o.dataset.onglet);
      return;
    }
    const z = e.target.closest(".zoom [data-z]");
    if (z) {
      zoom(+z.dataset.z);
      return;
    }
    if (vue === "disc") {
      const a2 = e.target.closest("[data-act]"), el = e.target.closest(".conv, .msg.choix");
      if (el) {
        poserDisc(elemsDisc().indexOf(el));
        agirDisc(el, a2?.dataset.act === "plus-tard" ? 3 : 1);
      }
      return;
    }
    if (vue === "ajouter") {
      if (e.target.closest(".champ")) {
        asel = -1;
        marquerAjout();
        ecrireAjout();
        return;
      }
      const r = e.target.closest(".res .ami");
      if (r) {
        asel = +r.dataset.i;
        marquerAjout();
        envoyerA(asel);
      }
      return;
    }
    const a = e.target.closest(".grille .ami");
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
  const loupe = () => racine.hidden || vue !== "liste" ? null : {
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
    const r = vue === "disc" ? toucheDisc(b) : vue === "ajouter" ? toucheAjout(b) : touche(b);
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
      onglet = "tous";
      choisir = true;
      afficherVue();
    } else if (b === 5 || b === 6) window.__pcvSon?.("bord");
    else if (b === 3) {
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
  const toucheAjout = (b) => {
    if (racine.hidden) return false;
    const n = resultats.length, c = 3;
    if (b === 2) montrer(false);
    else if (b === 1) {
      if (asel < 0) ecrireAjout();
      else envoyerA(asel);
    } else if (b === 9 && asel < 0) window.__pcvBarreEntrer?.(ecrireLegende);
    else if (b === 9) {
      asel = asel < c ? -1 : asel - c;
      marquerAjout();
    } else if (b === 10 && n) {
      asel = asel < 0 ? 0 : Math.min(n - 1, asel + c);
      marquerAjout();
    } else if (b === 11 && asel > 0 || b === 12 && asel >= 0 && asel < n - 1) {
      asel += b === 12 ? 1 : -1;
      marquerAjout();
    } else if (b >= 3 && b <= 12) window.__pcvSon?.("bord");
    return true;
  };
  const touche = (b) => {
    if (racine.hidden) return false;
    const n = liste.length, c = CRANS[cran].col, x = liste[sel];
    if (b === 11) sel = Math.max(0, sel - 1);
    else if (b === 12) sel = Math.min(n - 1, sel + 1);
    else if (b === 9 && sel < c) {
      window.__pcvBarreEntrer?.(ecrireLegende);
      return true;
    } else if (b === 9) sel = Math.max(0, sel - c);
    else if (b === 10) sel = Math.min(n - 1, sel + c);
    else if (b === 5 || b === 6) {
      zoom(b === 6 ? 1 : -1);
      return true;
    } else if (b === 1 && n) {
      ouvrir(sel);
      return true;
    } else if (b === 3 && x?.genre === "recue") {
      if (sel < n - 1) sel++;
      else return true;
    } else if (b === 3) {
      if (!S.rejoindre(x?.p)) window.__pcvSon?.("bord");
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
    racine.querySelector(".grille .ami.sel")?.scrollIntoView({ block: "nearest" });
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
        ami: f.accountid,
        // (13/11 : gardé dans l'historique, la discussion s'ouvre encore après un rechargement)
        touches: [[2, T("social.plus_tard"), () => inv.DismissInvite()], [1, T("social.rejoindre"), () => inv.AcceptGameInvite()]]
      }, 15e3);
      if (!montree) setTimeout(essayer, 2e3);
    };
    essayer();
  };
  try {
    const r = req();
    let P2 = O.__pcvChatAmi;
    if (!P2) for (const id of Object.keys(r.m)) {
      if (!r.m[id].toString().includes("AckChatMsgOnServer(")) continue;
      P2 = Object.values(r(id)).find((x) => typeof x?.prototype?.OnReceivedNewMessage === "function" && x.prototype.AckChatMsgOnServer)?.prototype;
      if (P2) break;
    }
    if (P2) {
      O.__pcvChatAmi = P2;
      P2.__pcvRecevoir = recevoir;
      if (!P2.__pcvOrig) {
        P2.__pcvOrig = P2.OnReceivedNewMessage;
        P2.OnReceivedNewMessage = function(m, ...r2) {
          const v = P2.__pcvOrig.call(this, m, ...r2);
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
    if (racine.hidden || ++tic % 5) return;
    if (vue === "disc") {
      const k = dsel;
      peindreDisc();
      poserDisc(k);
    } else if (vue === "ajouter" ? texteAjout.trim() : texte.trim() || onglet === "demandes") rafraichir();
  }, 200);
  return "amis pr\xEAt";
})();
