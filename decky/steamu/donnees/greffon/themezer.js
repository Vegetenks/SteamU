(() => {
  window.__pcvThemezerFin?.();
  const fins = [];
  window.__pcvThemezerFin = () => {
    fins.splice(0).forEach((f) => {
      try {
        f();
      } catch (e) {
      }
    });
  };
  const T = window.__pcvT || ((c) => c);
  const O = window.opener || window;
  const appeler = (m, ...a) => {
    try {
      return (O?.DeckyBackend || window.DeckyBackend)?.call("loader/call_plugin_method", window.__pcvGreffon.nom, m, ...a) ?? Promise.reject(new Error("Decky absent"));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const TRIS = [["telecharges", T("themezer.populaires")], ["recents", T("themezer.recents")], ["tendance", T("themezer.tendance")], ["aimes", T("themezer.aimes")]];
  const ETAPES = { telechargement: T("themezer.etape.telechargement"), tele: T("themezer.etape.fond_tele"), manette: T("themezer.etape.fond_gamepad"), musique: T("themezer.etape.musique"), icones: T("themezer.etape.icones"), rangement: T("themezer.etape.rangement"), fini: T("themezer.etape.installe"), erreur: T("themezer.etape.echec") };
  const CONSOLES = {
    wiiu: { nom: "Wii U", ecrans: [T("themezer.ecran.tele"), "GamePad"], apporte: T("themezer.apporte_wiiu") },
    switch: { nom: "Switch", ecrans: [T("themezer.ecran.ecran")], apporte: T("themezer.apporte_switch") }
  };
  const CSS = (U) => `
    .tzb .ecrans { display: flex; flex-direction: column; gap: ${U(10)}; justify-content: center; background: none; box-shadow: none; }
    .tzb .ecrans .ec { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: ${U(14)}; background: #2f3a4a center / cover no-repeat; box-shadow: inset 0 0 0 1px rgba(0,0,0,.08), 0 ${U(4)} ${U(10)} rgba(0,0,0,.14); }
    .tzb .ecrans .ec span { position: absolute; left: ${U(8)}; bottom: ${U(6)}; padding: ${U(1)} ${U(8)}; border-radius: ${U(8)}; background: rgba(255,255,255,.9); font-size: ${U(11)}; font-weight: 900; color: #3a4252; }
    .tzb .carte .vig { background: #dfe6ee center / cover no-repeat; }
    .tzb .infos .apporte { font-size: ${U(12)}; font-weight: 700; line-height: 1.35; color: #7a8494; }
  `;
  const creer = (cle) => {
    const C = CONSOLES[cle];
    const M = (window.__pcvThemezerMemoire ||= {})[cle] ||= { texte: "", tri: "telecharges", res: null, apercus: /* @__PURE__ */ new Map(), installes: {} };
    let racine = null, o = null, boite = null, ligne = -1, col = 0, actif = false, chargement = false, etat = null, suivi = 0, enFile = [], enCours = 0;
    const themes = () => M.res?.themes || [];
    const $ = (s) => boite?.querySelector(s);
    const ident = (id) => `themezer-${cle}-${id}`;
    const installe = (id) => M.installes[id] || o?.importeId(ident(id));
    const demander = (id, ecran = 0) => {
      const k = id + ":" + ecran;
      if (M.apercus.has(k) || enFile.includes(k)) return;
      enFile.push(k);
      pomper();
    };
    const pomper = () => {
      while (enCours < 2 && enFile.length) {
        const k = enFile.shift(), [id, ecran] = k.split(":");
        enCours++;
        appeler("themezer_apercu", cle, id, +ecran).then((r) => {
          if (!r || typeof r.b64 !== "string" || !/^image\/(webp|jpeg|png)$/.test(r.type)) {
            M.apercus.set(k, null);
            return;
          }
          const bin = atob(r.b64), oct = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) oct[i] = bin.charCodeAt(i);
          M.apercus.set(k, URL.createObjectURL(new Blob([oct], { type: r.type })));
          if (M.apercus.size > 200) {
            const [k0, u] = M.apercus.entries().next().value;
            if (u) URL.revokeObjectURL(u);
            M.apercus.delete(k0);
          }
          poserApercu(id);
        }).catch(() => {
        }).finally(() => {
          enCours--;
          pomper();
        });
      }
    };
    const apercu = (id, ecran = 0) => M.apercus.get(id + ":" + ecran);
    const poserApercu = (id) => {
      if (!boite) return;
      const u = apercu(id);
      if (u) boite.querySelectorAll(`.carte[data-id="${id}"] .vig`).forEach((v) => v.style.backgroundImage = `url("${u}")`);
      if (vu()?.id === id) fiche();
    };
    const chercher = async (suite) => {
      if (chargement) return;
      chargement = true;
      const page = suite ? (M.res?.page || 0) + 1 : 1;
      if (!suite) {
        M.res = null;
        ligne = Math.min(ligne, 0);
        col = 0;
        dessinerGrille(`<b>${T("themeplaza.recherche_cours")}</b>${T("themezer.repond")}`);
      }
      let r;
      try {
        r = await appeler("themezer_recherche", cle, M.texte, page, M.tri);
      } catch (e) {
        r = { erreur: T("commun.greffon_pas_redemarre") };
      }
      chargement = false;
      if (!boite) return;
      if (!r || r.erreur || !Array.isArray(r.themes)) {
        if (!suite) dessinerGrille(`<b>${T("themezer.indisponible")}</b>${o.echap(r?.erreur || T("commun.pas_de_reponse"))}. ${T("themezer.themes_restent")}`);
        return;
      }
      M.res = suite && M.res ? { ...r, themes: [...M.res.themes, ...r.themes] } : r;
      dessinerGrille();
      if (!suite) fiche();
    };
    const carte = (t) => `<div class="carte pf${installe(t.id) ? " porte" : ""}" data-id="${o.echap(t.id)}" style="--a:var(--pcv-cyan-plein)"><div class="vig"${apercu(t.id) ? ` style="background-image:url('${apercu(t.id)}')"` : ""}>${t.musique ? "<b>\u266A</b>" : ""}</div>
      <div class="nm"><span>${o.echap(t.titre)}</span><small>${T("themeplaza.de_auteur", { auteur: o.echap(t.auteur || "?") })}</small></div></div>`;
    const dessinerGrille = (mot) => {
      if (!boite) return;
      const l = themes();
      $(".rang").innerHTML = mot ? `<div class="mot">${mot}</div>` : l.length ? l.map(carte).join("") : `<div class="mot"><b>${T("themeplaza.aucun_theme")}</b>${T("themeplaza.essaie_autre_mot")}</div>`;
      l.forEach((t) => demander(t.id));
      marquer(actif);
    };
    const vu = () => themes()[ligne >= 0 ? ligne * 3 + col : ligne === -2 ? M.dernier?.[1] ?? 0 : 0];
    const fiche = () => {
      const t = vu(), f = $(".fiche");
      if (!f) return;
      if (!t) {
        f.style.visibility = "hidden";
        return;
      }
      f.style.visibility = "";
      const e = etat?.id === t.id ? etat : null, fait = installe(t.id) || e?.etape === "fini";
      const ecrans = Math.max(1, Math.min(t.ecrans || 1, C.ecrans.length));
      for (let i = 0; i < ecrans; i++) demander(t.id, i);
      $(".ecrans").innerHTML = [...Array(ecrans).keys()].map((i) => `<div class="ec"${apercu(t.id, i) ? ` style="background-image:url('${apercu(t.id, i)}')"` : ""}><span>${C.ecrans[i]}</span></div>`).join("");
      $(".infos h3").textContent = t.titre;
      $(".infos .de").textContent = T("themeplaza.de_auteur", { auteur: t.auteur || T("themeplaza.auteur_inconnu") });
      $(".infos p").textContent = t.description || "";
      $(".infos .ch").innerHTML = `<span>\u2B07 ${t.telechargements}</span><span>\u2665 ${t.aimes}</span>` + (t.musique ? `<span>\u266A ${o.echap(t.piste || T("themeplaza.musique_mot"))}</span>` : "") + (t.anime ? `<span>${T("themezer.anime")}</span>` : "");
      const b = $(".installer"), occupe = etat && !["fini", "erreur", "repos"].includes(etat.etape);
      b.classList.toggle("ok", !!fait);
      b.classList.toggle("ko", e?.etape === "erreur");
      b.classList.toggle("eteint", !!occupe && !e);
      b.querySelector("span").textContent = e && !["fini", "erreur"].includes(e.etape) ? `${ETAPES[e.etape] || "\u2026"} ${Math.round((e.pct || 0) * 100)} %` : e?.etape === "erreur" ? T("themeplaza.echec_message", { msg: e.message || "?" }) : fait ? T("themeplaza.appliquer") : T("themeplaza.installer");
      b.querySelector("em").style.width = e && !["fini", "erreur"].includes(e.etape) ? Math.round((e.pct || 0) * 100) + "%" : "0";
    };
    const marquer = (a) => {
      actif = a;
      if (!boite) return;
      [$(".champ"), $('[data-b="tri"]')].forEach((x, i) => x.classList.toggle("sel", a && ligne === -1 && col === i));
      boite.querySelectorAll(".rang .carte").forEach((c, i) => c.classList.toggle("sel", a && ligne >= 0 && i === ligne * 3 + col));
      $(".installer").classList.toggle("sel", a && ligne === -2);
      boite.querySelector(".rang .sel")?.scrollIntoView?.({ block: "nearest" });
    };
    const barre = () => {
      $('[data-b="tri"]').innerHTML = `\u21C5 ${TRIS.find(([k]) => k === M.tri)[1]}`;
    };
    const installer = async (t = vu()) => {
      if (!t) return o.son("bord");
      if (installe(t.id) || etat?.id === t.id && etat.etape === "fini") {
        await o.charger();
        o.appliquer("importe:" + ident(t.id));
        o.son("theme");
        return;
      }
      if (etat && !["fini", "erreur", "repos"].includes(etat.etape)) return o.son("bord");
      let r;
      try {
        r = await appeler("themezer_installer", cle, t.id);
      } catch (e) {
        r = { erreur: T("commun.greffon_pas_redemarre") };
      }
      if (!r?.ok) {
        etat = { id: t.id, etape: "erreur", message: r?.erreur || "?" };
        fiche();
        return o.son("bord");
      }
      o.son("choisir");
      etat = { id: t.id, etape: "telechargement", pct: 0 };
      fiche();
      clearInterval(suivi);
      suivi = setInterval(async () => {
        try {
          etat = { ...await appeler("themezer_etat"), id: etat.id };
        } catch (e) {
          return;
        }
        if (etat.etape === "fini") {
          clearInterval(suivi);
          M.installes[etat.id] = true;
          o.son("theme");
          await o.charger();
          dessinerGrille();
        } else if (etat.etape === "erreur") {
          clearInterval(suivi);
          o.son("bord");
        }
        fiche();
      }, 400);
    };
    const ouvrirClavier = () => {
      const i = $(".champ input");
      if (!window.__pcvClavier?.(i)) i.focus();
    };
    const valider = () => {
      const i = $(".champ input");
      i.blur();
      if (i.value.trim() !== M.texte) {
        M.texte = i.value.trim().slice(0, 60);
        chercher();
      }
    };
    const appuyer = (i) => {
      if (i === 0) return ouvrirClavier();
      const k = TRIS.findIndex(([x]) => x === M.tri);
      M.tri = TRIS[(k + 1) % TRIS.length][0];
      o.son("choisir");
      barre();
      chercher();
    };
    const tape = () => document.activeElement === $(".champ input");
    const touche = (b) => {
      if (!boite) return false;
      if (tape()) {
        if (b === 1) valider();
        else if (b === 2 || b === 10) {
          $(".champ input").blur();
          if (b === 10 && themes().length) {
            ligne = 0;
            col = 0;
            fiche();
          }
          marquer(true);
        }
        return true;
      }
      const n = themes().length, lignes = Math.ceil(n / 3);
      const bouge = () => {
        o.son("bouge");
        marquer(true);
        fiche();
        return true;
      };
      if (b === 1) {
        if (ligne === -1) appuyer(col);
        else installer();
        return true;
      }
      if (b === 5 || b === 6 || b === 2) return false;
      if (ligne === -2) {
        if (b === 11) {
          ligne = Math.max(0, Math.min(lignes - 1, M.dernier?.[0] ?? 0));
          col = (M.dernier?.[1] ?? 2) % 3;
          return bouge();
        }
        if (b === 10) return "bas";
        if (b === 9) {
          ligne = -1;
          col = 1;
          return bouge();
        }
        return true;
      }
      if (ligne === -1) {
        if (b === 11) {
          if (col === 0) {
            o.son("bord");
            return true;
          }
          col--;
          return bouge();
        }
        if (b === 12) {
          if (col === 1) {
            o.son("bord");
            return true;
          }
          col++;
          return bouge();
        }
        if (b === 9) return "haut";
        if (b === 10) {
          if (!n) return "bas";
          ligne = 0;
          col = Math.min(col, n - 1);
          return bouge();
        }
        return true;
      }
      const i = ligne * 3 + col;
      if (b === 11) {
        if (col === 0) {
          o.son("bord");
          return true;
        }
        col--;
      } else if (b === 12) {
        if (col === 2 || i === n - 1) {
          M.dernier = [ligne, i];
          ligne = -2;
          return bouge();
        }
        col++;
      } else if (b === 9) {
        ligne--;
        if (ligne < 0) col = Math.min(col, 1);
      } else if (b === 10) {
        if (ligne + 1 < lignes) {
          ligne++;
          col = Math.min(col, n - 1 - ligne * 3);
        } else if (M.res && M.res.page < M.res.pages) {
          chercher(true);
          return true;
        } else return "bas";
      } else return true;
      return bouge();
    };
    const monter = (r, outils) => {
      demonter();
      racine = r;
      o = outils;
      const TP = window.__pcvThemePlaza;
      TP?.poserCSS?.(o.U);
      if (!document.getElementById("pcv-tz-css")) {
        const s = document.createElement("style");
        s.id = "pcv-tz-css";
        s.textContent = CSS(o.U);
        document.head.appendChild(s);
      }
      racine.classList.add("tpz");
      boite = document.createElement("div");
      boite.className = "tpzb tzb";
      boite.innerHTML = `<div class="barre"><label class="champ pf"><i>${TP?.LOUPE || ""}</i><input type="text" maxlength="60" spellcheck="false" placeholder="${T("themezer.chercher_theme", { console: C.nom })}"></label>
          <div class="bt pf" data-b="tri"></div></div>
        <div class="grille"><div class="rang"></div></div>
        <div class="fiche"><div class="ecrans"></div><div class="infos"><h3></h3><div class="de"></div><p></p><div class="ch"></div>
          <div class="apporte">${o.echap(C.apporte)}</div>
          <div class="credit">Th\xE8me cr\xE9\xE9 par la communaut\xE9, h\xE9berg\xE9 sur Themezer (themezer.net)</div>
          <div class="installer pf"><em></em><u>${o.T(1)}</u><span>Installer</span></div></div></div>`;
      racine.appendChild(boite);
      const champ = $(".champ input");
      champ.value = M.texte;
      champ.onfocus = () => {
        ligne = -1;
        col = 0;
        marquer(true);
      };
      $(".champ").onclick = () => {
        o.prendre();
        ligne = -1;
        col = 0;
        marquer(true);
        ouvrirClavier();
      };
      $('[data-b="tri"]').onclick = () => {
        o.prendre();
        ligne = -1;
        col = 1;
        marquer(true);
        appuyer(1);
      };
      $(".rang").onclick = (e) => {
        const c = e.target.closest(".carte");
        if (!c) return;
        const i = [...$(".rang").children].indexOf(c);
        o.prendre();
        if (ligne >= 0 && i === ligne * 3 + col) return installer();
        ligne = Math.floor(i / 3);
        col = i % 3;
        o.son("bouge");
        marquer(true);
        fiche();
      };
      $(".installer").onclick = () => {
        o.prendre();
        installer();
      };
      $(".grille").onscroll = (e) => {
        const g = e.target;
        if (!chargement && M.res && M.res.page < M.res.pages && g.scrollTop + g.clientHeight > g.scrollHeight - 80) chercher(true);
      };
      barre();
      if (M.res) {
        dessinerGrille();
        fiche();
      } else chercher();
    };
    const demonter = () => {
      clearInterval(suivi);
      enFile = [];
      boite?.remove();
      boite = null;
      if (racine && !racine.querySelector(".tpzb")) racine.classList.remove("tpz");
      racine = null;
    };
    const entrer = (d) => {
      if (d === "bas" && themes().length) {
        ligne = Math.ceil(themes().length / 3) - 1;
        col = 0;
      } else {
        ligne = -1;
        col = 0;
      }
      marquer(true);
      fiche();
    };
    const clavier = (e) => {
      if (!tape()) return;
      if (e.key === "Enter") {
        valider();
        e.preventDefault();
      } else if (e.key === "Escape") {
        $(".champ input").blur();
        marquer(true);
        e.preventDefault();
      }
      e.stopImmediatePropagation();
    };
    window.addEventListener("keydown", clavier, true);
    fins.push(() => window.removeEventListener("keydown", clavier, true));
    fins.push(() => demonter());
    return { monter, demonter, touche, marquer: (a) => marquer(a), entrer };
  };
  window.__pcvThemezer = { wiiu: creer("wiiu"), switch: creer("switch") };
  fins.push(() => document.getElementById("pcv-tz-css")?.remove());
  return "Themezer pr\xEAt";
})();
