try {
  window.__pcvAbonnementJeuDevant?.unregister?.();
} catch (e) {
}
try {
  const S = (window.opener || window).SteamClient;
  window.__pcvAbonnementJeuDevant = S?.System?.UI?.RegisterForFocusChangeEvents?.((e) => {
    const id = Number(e?.focusedApp?.appid) >>> 0, devant = !!id && id !== 769 && id === Number(window.__pcvBridge?.runningApp()?.appid) >>> 0;
    if (devant !== !!window.__pcvJeuDevant) {
      window.__pcvJeuDevant = devant;
      window.dispatchEvent(new CustomEvent("pcv-jeu-devant", { detail: devant }));
    }
  });
} catch (e) {
}
try {
  window.__pcvAbonnementFin?.unregister?.();
} catch (e) {
}
try {
  const O = window.opener || window;
  O.__pcvOutilsFinis ||= /* @__PURE__ */ new Set();
  window.__pcvAbonnementFin = O.SteamClient?.GameSessions?.RegisterForAppLifetimeNotifications?.((n) => {
    const id = Number(n?.unAppID);
    if (n?.bRunning) O.__pcvOutilsFinis.delete(id);
    else if (window.__pcvBridge?.unifideck?.outil?.(id)) O.__pcvOutilsFinis.add(id);
  });
} catch (e) {
}
{
  const PALIERS = [
    { fondPas: 0, fondEchelle: 1, miiLisse: true, miiBasse: false, miiIps: 0, videos: true },
    { fondPas: 66, fondEchelle: 1, miiLisse: false, miiBasse: false, miiIps: 0, videos: true },
    { fondPas: 66, fondEchelle: 0.5, miiLisse: false, miiBasse: true, miiIps: 0, videos: true },
    { fondPas: 100, fondEchelle: 0.5, miiLisse: false, miiBasse: true, miiIps: 30, videos: false }
  ];
  const QUALITE = { fenetre: 1e3, descente: 2, remontee: 8, haut: 1.18, marge: 0.65, grace: 2e3 };
  const ATTENTE_MAX = 12e4;
  const juger = (e, t, m, trop, large, sature, n) => {
    const p = e.palier, aller = (q, essai) => {
      e.sens = q - p;
      e.palier = q;
      e.change = t;
      e.avant = essai ? m : 0;
      e.lentes = e.fluides = 0;
      return true;
    };
    if (t < e.grace || t - e.change < QUALITE.fenetre * 1.5) {
      e.lentes = e.fluides = 0;
      return false;
    }
    e.lentes = trop ? e.lentes + 1 : 0;
    e.fluides = large ? e.fluides + 1 : 0;
    if (e.sens > 0 ? !trop : e.fluides >= QUALITE.descente) e.avant = 0;
    if (e.lentes >= QUALITE.descente) {
      if (e.avant && e.sens < 0 && (m > e.avant * 1.05 || sature)) {
        e.hausseApres = t + e.reessai;
        e.reessai = Math.min(ATTENTE_MAX, e.reessai * 2);
        return aller(p + 1);
      }
      if (e.avant && e.sens > 0 && m > e.avant * 0.95 && !sature) {
        e.interdit = p;
        e.interditJusqua = t + ATTENTE_MAX;
        return aller(p - 1);
      }
      if (e.avant && e.sens < 0) {
        e.interdit = p + 1;
        e.interditJusqua = t + ATTENTE_MAX;
        e.avant = 0;
      }
      if (p < (t < e.interditJusqua && !sature ? e.interdit - 1 : n - 1)) return aller(p + 1, true);
      if (p > 0 && t >= e.hausseApres && !sature) return aller(p - 1, true);
    } else if (e.fluides >= QUALITE.remontee && p > 0 && t >= e.hausseApres) return aller(p - 1, true);
    return false;
  };
  const etatQualite = (palier = 0) => ({ palier, lentes: 0, fluides: 0, change: -1e9, avant: 0, sens: 0, grace: 0, interdit: 0, interditJusqua: 0, reessai: 15e3, hausseApres: 0 });
  const C = { ...etatQualite(), force: null, ecran: 1e3 / 60, voulu: 0, eu: 0, travail: 0, n: 0, t0: 0, tp: -1e9, bilan: null };
  window.__pcvCharge = {
    PALIERS,
    QUALITE,
    juger,
    etatQualite,
    palier: () => C.force ?? C.palier,
    reglage: () => PALIERS[C.force ?? C.palier],
    bilan: () => C.bilan,
    forcer: (p) => C.force = p == null ? null : Math.max(0, Math.min(PALIERS.length - 1, p | 0)),
    // mesures sur le banc
    // une boucle vient de dessiner : t, l'heure de l'image ; voulu, l'intervalle visé (0 : chaque image de l'écran) ;
    // eu, l'intervalle réel depuis sa précédente image ; travail, les ms de calcul de celle-ci
    noter(t, voulu, eu, travail = 0) {
      if (!(eu > 0) || eu > 250) return;
      if (!voulu && eu > 1e3 / 240) C.ecran = Math.min(C.ecran, eu);
      if (t - C.tp > QUALITE.fenetre) {
        C.voulu = C.eu = C.travail = C.n = 0;
        C.t0 = t;
      }
      C.tp = t;
      C.voulu += voulu || C.ecran;
      C.eu += eu;
      C.travail += travail;
      C.n++;
      if (t - C.t0 < QUALITE.fenetre) return;
      C.t0 = t;
      const lent = C.eu / C.voulu, calcul = C.travail / C.n;
      const sature = calcul > C.ecran * 0.9, trop = lent > QUALITE.haut || sature, large = lent <= 1.08 && calcul < C.ecran * QUALITE.marge;
      if (juger(C, t, lent, trop, large, sature, PALIERS.length)) try {
        window.dispatchEvent(new CustomEvent("pcv-charge", { detail: C.palier }));
      } catch (e) {
      }
      C.bilan = { palier: C.palier, ecranMs: +C.ecran.toFixed(2), lenteur: +lent.toFixed(2), calculMs: +calcul.toFixed(2), images: C.n };
      C.voulu = C.eu = C.travail = C.n = 0;
    }
  };
}
window.__pcvPanneau = /* @__PURE__ */ (() => {
  const vus = /* @__PURE__ */ new WeakMap();
  return (doc = document) => {
    let j = vus.get(doc);
    if (!j) {
      const cs = getComputedStyle(doc.documentElement), t = cs.getPropertyValue("--pcv-panneau-duree").trim();
      vus.set(doc, j = { duration: parseFloat(t) * (t.endsWith("ms") ? 1 : 1e3) || 300, easing: cs.getPropertyValue("--pcv-panneau-courbe").trim() || "ease-out" });
    }
    return j;
  };
})();
window.__pcvRapide = 120;
window.__pcvReduit = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
window.__pcvTenir = (b, pas) => {
  const TENUE = { attente: 380, pas: 220, min: 70, acc: 0.8 };
  clearTimeout(window.__pcvTenue?.m);
  window.__pcvTenue = null;
  if (!pas()) return;
  const t = window.__pcvTenue = { b }, suite = (ms) => {
    t.m = setTimeout(() => {
      if (window.__pcvTenue === t && pas()) suite(Math.max(TENUE.min, ms === TENUE.attente ? TENUE.pas : ms * TENUE.acc));
    }, ms);
  };
  suite(TENUE.attente);
};
window.__pcvTenirMot = (b, min = 14, haut = false) => {
  b.style.fontSize = "";
  let t = parseFloat(getComputedStyle(b).fontSize);
  while ((b.scrollWidth > b.clientWidth + 1 || haut && b.scrollHeight > b.clientHeight + 1) && t > min) b.style.fontSize = --t + "px";
};
if (!window.__pcvTenueEcoute) {
  window.__pcvTenueEcoute = true;
  const lacher = (e) => {
    const t = window.__pcvTenue;
    if (t && e.type === "vgp_onbuttonup" === (e.detail?.button === t.b)) {
      clearTimeout(t.m);
      window.__pcvTenue = null;
    }
  };
  window.addEventListener?.("vgp_onbuttonup", lacher, true);
  window.addEventListener?.("vgp_onbuttondown", lacher, true);
}
window.__pcvVoile = /* @__PURE__ */ (() => {
  const ouvertes = /* @__PURE__ */ new Set();
  return (cle, oui) => {
    ouvertes[oui ? "add" : "delete"](cle);
    document.documentElement.classList.toggle("pcv-voile", ouvertes.size > 0);
  };
})();
if (!window.__pcvDerriere) {
  const GARDE_MS = 350;
  let garde = null;
  const avaler = (e) => {
    if (!garde) return;
    const t = performance.now();
    if (t > garde.fin) {
      garde = null;
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    if ((e.type === "pointerup" || e.type === "pointercancel") && e.pointerId === garde.id) garde.fin = t + GARDE_MS;
  };
  for (const t of ["pointerdown", "pointerup", "pointercancel", "mousedown", "mouseup", "click", "touchend", "contextmenu"]) window.addEventListener?.(t, avaler, true);
  window.__pcvDerriere = (voile, fermer) => voile.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    garde = { id: e.pointerId, fin: performance.now() + 5e3 };
    fermer();
  });
}
window.__pcvApparition = /* @__PURE__ */ (() => {
  let j;
  return (el, sortie = false, boite, fin) => {
    if (!el?.animate || !el.isConnected) return fin?.();
    el.__pcvSortie?.cancel();
    el.__pcvSortie = null;
    j ||= window.__pcvPanneau(el.ownerDocument);
    let x = el;
    if (sortie && !fin) {
      x = el.cloneNode(true);
      x.inert = true;
      x.style.pointerEvents = "none";
      x.querySelectorAll("style").forEach((s2) => s2.remove());
      if (el.parentElement?.classList.contains("BasicUI")) el.parentElement.append(x);
      else el.after(x);
      x.getAnimations({ subtree: true }).forEach((a2) => a2.cancel());
      const toiles = el.querySelectorAll("canvas");
      x.querySelectorAll("canvas").forEach((c, i) => {
        try {
          c.getContext("2d").drawImage(toiles[i], 0, 0);
        } catch (e) {
        }
      });
    }
    const reduit = window.__pcvReduit(), o = { ...reduit ? { duration: window.__pcvRapide, easing: "ease-out" } : j, fill: sortie ? "forwards" : "none" };
    const s = !reduit && (boite && x.querySelector(boite) || x).animate({ scale: sortie ? [1, 0.94] : [0.94, 1] }, o), a = x.animate({ opacity: sortie ? [1, 0] : [0, 1] }, o);
    if (!sortie) return;
    const annuler = () => {
      a.cancel();
      s && s.cancel();
      el.__pcvSortie = null;
    };
    if (fin) el.__pcvSortie = { cancel: annuler };
    a.onfinish = () => {
      if (x !== el) return x.remove();
      fin();
      annuler();
    };
    return x;
  };
})();
{
  let aTenue = false, tenu = null, relache = null, pointeur = null;
  const enfoncer = (el, r) => {
    if (relache?.anime || pointeur?.anime || aTenue && tenu) return () => {
    };
    if (tenu?.el === el) return tenu;
    tenu?.();
    if (relache) relache.anime = true;
    if (pointeur) pointeur.anime = true;
    let zone = null;
    const poserZone = () => {
      if (!r || zone || fait) return;
      zone = document.createElement("span");
      zone.setAttribute("popover", "manual");
      zone.setAttribute("aria-hidden", "true");
      zone.style.cssText = `all:initial!important;position:fixed!important;opacity:0!important;left:${r.left}px!important;top:${r.top}px!important;width:${r.width}px!important;height:${r.height}px!important;`;
      el.appendChild(zone);
      zone.showPopover();
    };
    const a = el.animate({ scale: [1, 0.93] }, { duration: window.__pcvRapide, easing: "ease-in", fill: "forwards", composite: "add" });
    let fait = false;
    const haut = () => {
      if (fait) return;
      fait = true;
      if (tenu === haut) tenu = null;
      a.onfinish = () => {
        a.onfinish = () => {
          a.cancel();
          zone?.remove();
        };
        a.reverse();
      };
      if (a.playState === "finished") a.onfinish();
    };
    haut.el = el;
    haut.zone = poserZone;
    return tenu = haut;
  };
  window.__pcvAppui = (el) => {
    if (!el?.animate) return;
    const haut = enfoncer(el);
    setTimeout(() => {
      if (!aTenue) haut();
    }, window.__pcvRapide);
  };
  const notre = (p) => {
    const alim = p[0]?.closest?.("[data-pcv-alim] .contextMenuItem");
    if (alim) return alim;
    const b = p[0]?.closest?.("button, [data-a], [role=button], .pf, #pcv-console .cel[data-i], .pcv-legende > [data-b]");
    return b && !b.closest(".pcvc") && p.some((n) => n.id?.startsWith?.("pcv")) ? b : null;
  };
  const PAS = 8;
  let glisseA = -1e9, rendre = null;
  const listes = (e) => {
    rendre?.();
    const p = e.composedPath();
    if (e.pointerType !== "touch" || !p.some((n) => n.id?.startsWith?.("pcv"))) return;
    const l = p.filter((n) => n.nodeType === 1 && !n.style.pointerEvents && getComputedStyle(n).pointerEvents === "none" && /auto|scroll/.test(getComputedStyle(n).overflow));
    if (!l.length) return;
    l.forEach((n) => n.style.pointerEvents = "auto");
    let defile = false;
    const vu = (v) => {
      if (l.includes(v.target)) defile = true;
    }, leve = () => {
      if (!defile) rendre?.();
    }, fini = (v) => {
      if (l.includes(v.target)) rendre?.();
    };
    const ev = [["scroll", vu], ["touchend", leve], ["touchcancel", leve], ["scrollend", fini]];
    ev.forEach(([t, f]) => window.addEventListener(t, f, true));
    rendre = () => {
      rendre = null;
      l.forEach((n) => n.style.removeProperty("pointer-events"));
      ev.forEach(([t, f]) => window.removeEventListener(t, f, true));
    };
  };
  const CONTENU = "quickaccess_content_", dansContenu = (p) => p.some((n) => n.id?.startsWith?.(CONTENU));
  const suivreContenu = (e) => {
    const x = e.clientX, y = e.clientY;
    let loin = false;
    const m = (v) => {
      if (v.pointerId === e.pointerId && Math.hypot(v.clientX - x, v.clientY - y) > PAS) loin = true;
    };
    const f = (v) => {
      if (v.pointerId !== e.pointerId) return;
      if (loin) glisseA = v.timeStamp;
      for (const [t, g] of l) window.removeEventListener(t, g, true);
    };
    const l = [["pointermove", m], ["pointerup", f], ["pointercancel", f]];
    for (const [t, g] of l) window.addEventListener(t, g, true);
  };
  const appui = (e) => {
    listes(e);
    const p = e.composedPath(), b = notre(p);
    if (e.pointerType === "touch" && (dansContenu(p) || !b && p.some((n) => n.id?.startsWith?.("pcv")))) suivreContenu(e);
    if (!b?.animate || e.isPrimary === false) return;
    const suivi = {};
    pointeur = suivi;
    if (e.pointerType === "touch") e.preventDefault();
    const r = b.getBoundingClientRect(), haut = enfoncer(b, e.pointerType === "touch" && !e.composedPath()[0]?.matches?.("input, select, textarea") ? r : null), x = e.clientX, y = e.clientY;
    const glisse = (m) => {
      if (m.pointerId !== e.pointerId) return;
      const loin = Math.hypot(m.clientX - x, m.clientY - y) > PAS;
      if (loin) suivi.glisse = true;
      if (loin || m.clientX < r.left || m.clientX > r.right || m.clientY < r.top || m.clientY > r.bottom) haut();
    };
    const fin = (m) => {
      if (m.pointerId !== e.pointerId) return;
      if (suivi.glisse) glisseA = m.timeStamp;
      else if (m.type === "pointerup") haut.zone?.();
      haut();
      window.removeEventListener("pointermove", glisse, true);
      window.removeEventListener("pointerup", fin, true);
      window.removeEventListener("pointercancel", fin, true);
      setTimeout(() => {
        if (pointeur === suivi) pointeur = null;
      }, 0);
    };
    window.addEventListener("pointermove", glisse, true);
    window.addEventListener("pointerup", fin, true);
    window.addEventListener("pointercancel", fin, true);
  };
  const clic = (e) => {
    if (e.detail && e.isTrusted && e.timeStamp - glisseA < 400 && (notre(e.composedPath()) || e.composedPath().some((n) => n.id?.startsWith?.("pcv")) || dansContenu(e.composedPath()))) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }
    if (!e.detail) {
      const b = notre(e.composedPath());
      if (b) window.__pcvAppui(b);
    }
  };
  let attente = null;
  window.__pcvVise = () => {
    const FOCUS = ".f, .foc, .pcv-f, .pcv-sel, #pcv-console .entete button.choisi, .k, .sur-action, .mm-focus, [data-pcv-vise]", SEL = `:is(${FOCUS}, .sel, .pcv-legende > [data-b="1"])`, vues = /* @__PURE__ */ new Set();
    const barre = window.__pcvBarreVise?.();
    if (barre) vues.add(barre);
    for (const h of document.querySelectorAll('[id^="pcv"]')) for (const x of [...h.matches?.(SEL) ? [h] : [], ...h.querySelectorAll(SEL), ...h.shadowRoot?.querySelectorAll(SEL) || []]) vues.add(x);
    const visibles = [...vues].filter((x) => {
      const r = x.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let el = document.elementFromPoint(cx, cy);
      while (el?.shadowRoot) {
        const f = el.shadowRoot.elementFromPoint(cx, cy);
        if (!f || f === el) break;
        el = f;
      }
      return !!el && (el === x || x.contains(el));
    });
    return visibles.includes(barre) ? barre : visibles.filter((x) => x.matches(FOCUS)).pop() || visibles.filter((x) => x.matches(".sel")).pop() || visibles.pop() || null;
  };
  window.__pcvAuRelacher = (faire, el) => {
    attente = faire;
    if (!faire) tenu?.();
    else if (el?.animate) enfoncer(el);
  };
  const bouton = (e) => {
    const b = e.detail?.button, bas = e.type === "vgp_onbuttondown";
    if (b !== 1) {
      if (bas && attente) window.__pcvAuRelacher(null);
      return;
    }
    if (bas) pointeur = null;
    aTenue = bas;
    if (bas) return;
    const f = attente;
    attente = null;
    relache = { anime: !!tenu };
    try {
      tenu?.();
      f?.();
    } finally {
      relache = null;
    }
  };
  const sansMenuNavigateur = (e) => e.preventDefault();
  window.__pcvAppuiFin?.();
  if (!window.__pcvAvantConnexion?.()) {
    window.addEventListener?.("pointerdown", appui, true);
    window.addEventListener?.("click", clic, true);
    window.addEventListener?.("contextmenu", sansMenuNavigateur, true);
    window.addEventListener?.("vgp_onbuttondown", bouton, true);
    window.addEventListener?.("vgp_onbuttonup", bouton, true);
  }
  window.__pcvAppuiFin = () => {
    rendre?.();
    window.removeEventListener("pointerdown", appui, true);
    window.removeEventListener("click", clic, true);
    window.removeEventListener("contextmenu", sansMenuNavigateur, true);
    window.removeEventListener("vgp_onbuttondown", bouton, true);
    window.removeEventListener("vgp_onbuttonup", bouton, true);
  };
}
window.__pcvBridge = (() => {
  const O = window.opener || window;
  const req = () => O.__pcvReq ||= (() => {
    if (!O.webpackChunksteamui) return void 0;
    let r;
    O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv-bridge")], {}, (q) => {
      r = q;
    }]);
    return r;
  })();
  const found = O.__pcvModules ||= {};
  const manquants = O.__pcvModulesManquants ||= /* @__PURE__ */ new Map(), ATTENTE_MODULE = 1e3;
  const findModule = (key, signature, test) => {
    if (found[key] != null) return found[key];
    const maintenant = Date.now();
    if (maintenant - (manquants.get(key) ?? -Infinity) < ATTENTE_MODULE) return null;
    manquants.set(key, maintenant);
    const r = req();
    if (!r) return null;
    for (const id of Object.keys(r.m)) {
      if (!String(r.m[id]).includes(signature)) continue;
      let x;
      try {
        x = r(id);
      } catch (e) {
        continue;
      }
      if (!x || typeof x !== "object") continue;
      for (const v of Object.values(x)) {
        try {
          if (test(v, x)) {
            manquants.delete(key);
            return found[key] = v;
          }
        } catch (e) {
        }
      }
    }
    return null;
  };
  const globalStore = (name) => {
    if (O[name]) return O[name];
    const cle = "global:" + name, maintenant = Date.now();
    if (maintenant - (manquants.get(cle) ?? -Infinity) < ATTENTE_MODULE) return void 0;
    manquants.set(cle, maintenant);
    const r = req();
    if (!r) return void 0;
    for (const id of Object.keys(r.m)) {
      if (!String(r.m[id]).includes("window." + name + "=")) continue;
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
            if (O[name]) return O[name];
          }
        } catch (e) {
        }
      }
    }
    return O[name];
  };
  const bt = () => findModule("bt", "SetDiscovering", (v) => typeof v?.SetDiscovering === "function" && typeof v?.Pair === "function" && typeof v?.GetDeviceDetails === "function");
  const settingsWriter = () => findModule("settingsWriter", "BinaryWriter", (f) => typeof f === "function" && /BinaryWriter[\s\S]*SetSetting\(/.test(String(f)));
  const clientSettings = () => globalStore("settingsStore")?.m_ClientSettings;
  const menuStore = () => {
    try {
      return O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.MenuStore;
    } catch (e) {
      return null;
    }
  };
  const navigator_ = () => {
    try {
      return O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.m_Navigator;
    } catch (e) {
      return null;
    }
  };
  return {
    // Contrats pour nos écrans : données simples, jamais un objet observable de Steam ni son DOM.
    // null signifie « profil pas encore disponible » ; un avatar vide est une valeur valide.
    compteCourant: () => {
      try {
        const p = O.g_FriendsUIApp?.FriendStore?.self?.persona;
        if (!p || typeof p.m_strPlayerName !== "string" || !p.m_strPlayerName) return null;
        return {
          nom: p.m_strPlayerName,
          avatar: typeof p.avatar_url_full === "string" && p.avatar_url_full || typeof p.avatar_url_medium === "string" && p.avatar_url_medium || ""
        };
      } catch (e) {
        return null;
      }
    },
    // Présence des données seulement : aucun nom, identifiant ou URL dans le diagnostic du démarrage.
    etatCompte: () => {
      try {
        const f = O.g_FriendsUIApp?.FriendStore, p = f?.self?.persona;
        return {
          amis: !!f,
          soi: !!f?.self,
          profil: !!p,
          nom: !!p?.m_strPlayerName,
          avatar: !!(p?.avatar_url_full || p?.avatar_url_medium)
        };
      } catch (e) {
        return { erreur: true };
      }
    },
    // Ne rien lire avant collectionsFromStorage : Steam mémorise l'erreur de calcul. Une bibliothèque vide est prête.
    // Le nombre est celui de la Bibliothèque (jeux et raccourcis, console.js) : visibleApps suit le filtre de Steam (83 sur 164, 28/10).
    resumeBibliotheque: () => {
      try {
        if (!O.collectionStore?.collectionsFromStorage) return { pret: false, nombreJeux: null };
        const n = window.__pcvJeux?.apps?.().size;
        return Number.isSafeInteger(n) && n >= 0 ? { pret: true, nombreJeux: n } : { pret: false, nombreJeux: null };
      } catch (e) {
        return { pret: false, nombreJeux: null };
      }
    },
    // Changements de fiches (raccourcis compris) et d'installation ; nettoyage à chaque réinjection.
    // (16/11, diagnostic.py) chaque évènement est compté par source : sa fréquence se lit dans un rapport (__pcvBiblioFreq)
    ecouterBibliotheque: (cb) => {
      const a = [], f = window.__pcvBiblioFreq ||= { total: 0, depuis: Date.now(), recents: [], sources: {} };
      const compte = (s) => (...x) => {
        const t = Date.now();
        f.total++;
        f.sources[s] = (f.sources[s] || 0) + 1;
        f.recents.push(t);
        if (f.recents.length > 600) f.recents.splice(0, 300);
        return cb(...x);
      };
      try {
        a.push(O.SteamClient.Apps.RegisterForAppOverviewChanges(compte("fiches")));
      } catch (e) {
      }
      try {
        a.push(O.SteamClient.Downloads.RegisterForDownloadOverview(compte("telechargements")));
      } catch (e) {
      }
      try {
        a.push(O.downloadsStore.RegisterForDownloadItemsUpdate(compte("elements")));
      } catch (e) {
      }
      return { unregister: () => a.forEach((x) => {
        try {
          x?.unregister ? x.unregister() : x?.Unregister?.();
        } catch (e) {
        }
      }) };
    },
    // Adaptation provisoire à l'hôte Steam : la vue n'a pas à connaître ses routes.
    // (21/10) le TDP réglé dans les réglages rapides, en watts ; null sans limite (automatique) ou sans SteamOS
    limiteTdp: () => {
      try {
        const c = O.settingsStore?.m_ClientSettings;
        return c?.steamos_tdp_limit_enabled && c.steamos_tdp_limit > 0 ? c.steamos_tdp_limit : null;
      } catch (e) {
        return null;
      }
    },
    // (21/10) Steam a-t-il un écran par-dessus (astuces de premier lancement, fenêtre, menu, clavier, verrouillage) ?
    // La règle est celle de barre-haut.js (__pcvSteamDessus), qui rend déjà les touches à Steam dans ce cas
    steamDessus: () => {
      try {
        return !!window.__pcvSteamDessus?.();
      } catch (e) {
        return false;
      }
    },
    // (21/10) Steam demande-t-il « Qui joue ? » à chaque lancement ? (réglage de son écran de choix de compte ; 0 = oui,
    // relevé sur Steam, 1 = non) → Promise<boolean>, false si la fonction manque
    choixCompteAuDemarrage: () => {
      try {
        const u = O.SteamClient?.User;
        return typeof u?.GetStartupUserChooserState === "function" ? Promise.resolve(u.GetStartupUserChooserState()).then((e) => e === 0).catch(() => false) : Promise.resolve(false);
      } catch (e) {
        return Promise.resolve(false);
      }
    },
    // (appelée sur son objet : détachée, elle ne répondait pas)
    // (11/11, l'auteur) « Ajouter un compte » : l'appel exact du « Ajouter un compte » de Steam (son « Changer de compte »,
    // onNewUser) : Steam redémarre sur sa connexion ; le compte mémorisé reste dans sa liste (B y revient), rien n'est oublié
    // (à la différence de SignOutAndRestart, qui efface l'identification)
    ajouterCompte: () => {
      try {
        O.SteamClient.User.RestartToLoginScreen();
      } catch (e) {
      }
    },
    // (22/10) l'historique des pages de Steam (m_history de sa fenêtre principale) : page() la page actuelle, dans ses
    // propres termes ; revenirA(p) y revient SANS empiler une page de plus : comme B si la page d'avant est p, sinon en
    // remplaçant l'actuelle (lancement d'un jeu, console.js : Steam y empile la page du jeu)
    page: () => {
      try {
        return O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.m_history?.location?.pathname ?? O.location.pathname;
      } catch (e) {
        return "";
      }
    },
    revenirA: (p) => {
      try {
        const w = O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance, h = w.m_history;
        if (!h) return void w.NavigateBack?.();
        if (h.location?.pathname === p) return;
        if (h.entries?.[h.index - 1]?.pathname === p) h.goBack();
        else h.replace(p);
      } catch (e) {
      }
    },
    // (22/10) suivre les changements de page de Steam (f(page) dans ses propres termes) → fonction qui arrête le suivi
    ecouterPages: (f) => {
      try {
        return O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.m_history.listen((l) => f(l.pathname));
      } catch (e) {
        return () => {
        };
      }
    },
    // (22/10) un jeu pas installé ici : la fenêtre d'installation de Steam (choix du disque), sans passer par sa page
    // Steam exige aussi la source ("0", comme son bouton Installer) ; sans elle, aucun assistant ni erreur.
    installer: (appid) => {
      try {
        O.SteamClient.Installs.OpenInstallWizard([+appid], "0");
        return true;
      } catch (e) {
        return false;
      }
    },
    // (22/10, idée de lieserlV, PR #7 du dépôt public) Unifideck range les jeux de ses boutiques (Epic, GOG, Amazon…) dans
    // Steam en raccourcis non Steam, installés ou non : pour Steam ils sont tous là. Unifideck sait lesquels le sont (RPC
    // get_all_unifideck_games, la source de ses propres onglets) : on le lui demande. LA source de l'accueil, de la
    // bibliothèque et de sa page du jeu (console.js, installe()).
    // etat(a) : true / false selon Unifideck ; null : pas un de ses jeux, ou Unifideck absent (le raccourci reste
    // « installé », comme avant). version() change avec un état (l'accueil se refait). charger(force) : relu au plus
    // toutes les 30 s ; 3 échecs de suite (Unifideck absent), plus aucun appel jusqu'à un événement d'Unifideck.
    // L'état vit sur la fenêtre principale (O.__pcvUnifideck, lisible pour un diagnostic sur la console)
    // (26/10, PR #10 de lieserlV) Les jeux Xbox Cloud d'Unifideck (tag TAG_NUAGE) se jouent en streaming : jamais
    // « installés » pour lui, toujours jouables. etat(a) les dit donc vrais, nuage(a) dit lesquels (l'accueil y met le
    // nuage). Un raccourci reconnu à son lanceur mais absent de la liste d'Unifideck (GameVault hors ligne) : pas installé.
    // (11/11, PR #27 de lieserlV) Unifideck 0.8 : une ligne Xbox peut porter xcloud ET TAG_PC, le même jeu se streame ou
    // s'installe. Tant qu'il n'est pas installé, il reste jouable en streaming ; installé, il se lance en local : plus du nuage.
    unifideck: (() => {
      const TAG_NUAGE = "xcloud", TAG_PC = "xbox_pc", LANCEUR = "unifideck-launcher", REVOIR_LANCEUR = 1e4;
      const u = O.__pcvUnifideck ||= { jeux: /* @__PURE__ */ new Map(), ok: false, version: 0, enCours: false, rejouer: false, dernier: 0, echecs: 0, erreur: "" };
      u.nuage ||= /* @__PURE__ */ new Set();
      u.pc ||= /* @__PURE__ */ new Set();
      const formes = (id) => {
        const n = Number(id);
        return !Number.isFinite(n) ? [] : n < 0 ? [n, n + 4294967296] : n > 2147483647 ? [n, n - 4294967296] : [n];
      };
      const appliquer = (l) => {
        const m = /* @__PURE__ */ new Map(), nuage = /* @__PURE__ */ new Set(), pc = /* @__PURE__ */ new Set(), ids = /* @__PURE__ */ new Map();
        for (const g of l) if (g && g.app_id != null && g.store && g.store !== "steam") {
          ids.set(g.store + ":" + g.store_game_id, Number(g.app_id) >>> 0);
          const tags = Array.isArray(g.tags) ? g.tags.map((t) => String(t).toLowerCase()) : [];
          const estPC = tags.includes(TAG_PC), cloud = tags.includes(TAG_NUAGE) && !(estPC && g.installed);
          for (const id of formes(g.app_id)) {
            m.set(id, !!g.installed || cloud);
            if (cloud) nuage.add(id);
            if (estPC) pc.add(id);
          }
        }
        const meme = (a, b) => a.size === b.size && [...a].every((k) => b.has(k));
        const dbl = window.__pcvDoublons?.grouper(l) || null;
        if (m.size !== u.jeux.size || !meme(nuage, u.nuage) || !meme(pc, u.pc) || dbl?.sig !== u.dbl?.sig || [...m].some(([k, v]) => u.jeux.get(k) !== v)) u.version++;
        Object.assign(u, { jeux: m, nuage, pc, dbl, ids, ok: true, echecs: 0, erreur: "" });
      };
      const rate = (e) => {
        u.erreur = e;
        if (++u.echecs === 3) u.version++;
      };
      const lire = async () => {
        u.enCours = true;
        u.dernier = Date.now();
        try {
          const r = await Promise.race([window.__pcvBridge.callPlugin("Unifideck", "get_all_unifideck_games"), new Promise((_, non) => setTimeout(() => non(new Error("pas de r\xE9ponse en 15 s")), 15e3))]);
          const l = Array.isArray(r) ? r : r?.success === false ? null : r?.data;
          if (Array.isArray(l)) appliquer(l);
          else rate("r\xE9ponse inattendue : " + String(JSON.stringify(r)).slice(0, 200));
        } catch (e) {
          rate(String(e?.message || e));
        } finally {
          u.enCours = false;
          if (u.rejouer) {
            u.rejouer = false;
            charger(true);
          }
        }
      };
      const surEvenement = (e) => {
        const d = e?.detail;
        if (d && d.appId != null && typeof d.isInstalled === "boolean") for (const id of formes(d.appId)) {
          if (d.isInstalled && u.pc.has(id) && u.nuage.delete(id)) u.version++;
          const v = d.isInstalled || u.nuage.has(id);
          if (u.jeux.get(id) !== v) {
            u.jeux.set(id, v);
            u.version++;
          }
        }
        charger(true);
      };
      const charger = (force = false) => {
        if (O.__pcvUnifideckEv !== surEvenement) {
          for (const n of ["unifideck-sync-completed", "unifideck-game-state-changed"]) {
            O.removeEventListener(n, O.__pcvUnifideckEv);
            O.addEventListener(n, surEvenement);
          }
          O.__pcvUnifideckEv = surEvenement;
        }
        if (!O.DeckyBackend?.call) {
          if (u.echecs < 3) rate("Decky absent");
          return;
        }
        if (u.enCours) {
          if (force) u.rejouer = true;
          return;
        }
        if (force || u.echecs < 3 && Date.now() - u.dernier >= (u.ok ? 3e4 : 5e3)) lire();
      };
      const vus = /* @__PURE__ */ new Map();
      const lanceur = (a) => {
        const m = vus.get(a.appid), t = Date.now();
        if (m && (m.v || t - m.t < REVOIR_LANCEUR)) return m.v;
        let v = false;
        try {
          v = String(O.appDetailsStore?.GetAppDetails?.(a.appid)?.strShortcutExe || "").includes(LANCEUR);
        } catch (e) {
        }
        if (v && m) u.version++;
        vus.set(a.appid, { v, t });
        return v;
      };
      const OUTIL = /(?:^|\s)[a-z]+:[a-z-]+-(?:auth|store)(?:-temp)?(?:-\d{10,})?(?=\s|$)/i;
      const outil = (id) => {
        try {
          return OUTIL.test(O.appDetailsStore?.GetAppDetails?.(+id)?.strLaunchOptions || "") || O.appStore?.GetAppOverviewByAppID?.(+id)?.display_name === LANCEUR;
        } catch (e) {
          return false;
        }
      };
      return {
        charger,
        formes,
        outil,
        version: () => u.version,
        id: (store, jeu) => u.ids?.get(store + ":" + jeu),
        nuage: (a) => u.nuage.has(Number(a.appid)),
        etat: (a) => {
          charger();
          const v = u.jeux.get(Number(a.appid));
          return v !== void 0 ? v : (u.ok || u.echecs < 3) && lanceur(a) ? false : null;
        }
      };
    })(),
    ouvrirAccueil: () => {
      try {
        if (!/^\/routes\/library\/home/.test(O.location?.pathname || "")) O.__pcvAller?.(1);
      } catch (e) {
      }
    },
    // the app running in the foreground (null if none) ; appOverview() : its full card (name, playtime, images...)
    runningApp: () => {
      try {
        return O.SteamUIStore.RunningApps.find((a) => !O.__pcvOutilsFinis?.has(+a.appid)) || null;
      } catch (e) {
        return null;
      }
    },
    outilFini: (appid) => !!O.__pcvOutilsFinis?.has(+appid),
    // la page « jeu en cours » de Steam (celle de « Reprendre ») : sa fenêtre passe devant dès qu'elle existe
    allerAuJeuEnCours: () => {
      try {
        O.SteamUIStore.NavigateToRunningApp();
      } catch (e) {
      }
    },
    // (13/11) le magasin des performances de Steam (limite d'images), trouvé comme dans acces-rapide.js (même clé, même cache)
    perf: () => findModule("perf", "SetGameSpecificProfileEnabled", (v) => typeof v?.Get === "function" && typeof v.Get()?.SetFPSLimit === "function")?.Get(),
    appOverview: (appid) => {
      try {
        return O.appStore.GetAppOverviewByAppID(appid) || null;
      } catch (e) {
        return null;
      }
    },
    // 0 = no side menu open, 1 = HOME menu, 2 = Quick Access (Steam's own enum, read only)
    menuState: () => {
      try {
        return menuStore()?.m_eOpenSideMenu || 0;
      } catch (e) {
        return 0;
      }
    },
    closeMenus: () => {
      try {
        menuStore()?.CloseSideMenus();
      } catch (e) {
      }
    },
    // switches the tab shown inside the Quick Access side menu (0..N, Steam's own tab indices)
    openQuickAccessTab: (index) => {
      try {
        menuStore()?.OpenQuickAccessMenu(+index);
      } catch (e) {
      }
    },
    closeApp: (gameId) => {
      try {
        O.SteamClient.Apps.TerminateApp(gameId, false);
      } catch (e) {
      }
    },
    // brings a running app's window to the front (used for "open the app" from a notification/media player card)
    resumeApp: (appid) => {
      try {
        const id = String(appid), a = O.SteamClient.Apps;
        if (typeof a.RaiseWindowForGame === "function") return a.RaiseWindowForGame(id);
        return a.NavigateToRunningApp?.(id);
      } catch (e) {
      }
    },
    // a page of Steam's own Settings ("Internet", "Display", "Controller"...)
    navigate: (page) => {
      try {
        navigator_()?.Settings(page);
      } catch (e) {
      }
    },
    // (11/11) Un greffon dont l'entrée du menu de Steam n'est pas une page mais un lanceur : sa route fait NavigateBack()
    // tout de suite, puis ouvre sa vue 100 ms plus tard. Steamcord (route /discord, vue .sc-xv-side) : au second lancement
    // la vue ne venait pas (correctif repris de la contribution « Steamcord shortcut », lieserlV). NavigateBack est
    // neutralisé le temps que la vue s'ouvre (DFL est le même objet pour tous les greffons), puis rendu, et c'est nous qui
    // revenons ; vue absente après 900 ms : retour et nouvel essai, trois au plus (Steamcord ignore un appel tant que sa
    // vue est ouverte). Les autres greffons s'ouvrent par leur vraie entrée du menu (menu-pont.js, __pcvAller).
    lanceurs: { "/discord": ".sc-xv-side" },
    ouvrirLanceur: (route) => {
      const vueSel = window.__pcvBridge.lanceurs[route];
      let nav;
      try {
        nav = O.DFL.Navigation;
      } catch (e) {
      }
      if (!nav || !vueSel) return;
      const retour = () => {
        try {
          nav.NavigateBack();
        } catch (e) {
        }
      };
      const surRoute = () => O.location.pathname.endsWith("/routes" + route);
      const vue = () => {
        const docs = [O.document];
        try {
          docs.push(O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.BrowserWindow.document);
        } catch (e) {
        }
        return docs.some((d) => !!d?.querySelector(vueSel));
      };
      const essayer = (n) => {
        const origine = nav.NavigateBack;
        let garde = false;
        try {
          nav.NavigateBack = () => {
          };
          garde = true;
        } catch (e) {
        }
        try {
          nav.Navigate(route);
        } catch (e) {
        }
        setTimeout(() => {
          const ok = vue();
          try {
            if (garde) nav.NavigateBack = origine;
          } catch (e) {
          }
          if (surRoute()) retour();
          if (!ok && n < 3) setTimeout(() => essayer(n + 1), 600);
        }, 900);
      };
      if (surRoute()) {
        retour();
        return void setTimeout(() => essayer(1), 400);
      }
      essayer(1);
    },
    // (29/10, Paramètres lot 1, reglages.js) un réglage du client, lu et écrit comme Steam le fait (CMsgClientSettings) ;
    // le texte d'un jeton de traduction de Steam dans sa langue ; les jeux masqués (nombre, et leur collection)
    modeAvion: () => {
      const s = globalStore("SystemStoragStore")?.AirplaneModeEnabled;
      return !!(s?.Value ?? s?.m_currentValue);
    },
    reglageClient: (nom) => {
      try {
        return clientSettings()?.[nom];
      } catch (e) {
        return void 0;
      }
    },
    ecrireReglageClient: (nom, v) => {
      try {
        settingsWriter()?.(nom, v);
      } catch (e) {
      }
    },
    texteSteam: (jeton) => {
      try {
        return O.LocalizationManager?.m_mapTokens?.get(jeton);
      } catch (e) {
        return void 0;
      }
    },
    jeuxMasques: () => {
      try {
        return O.collectionStore?.GetCollection?.("hidden")?.allApps?.length ?? null;
      } catch (e) {
        return null;
      }
    },
    ouvrirJeuxMasques: () => {
      try {
        navigator_()?.Collection("hidden");
      } catch (e) {
      }
    },
    // (29/10, Paramètres lot 2) comme Steam : un réglage des contacts (Format 24 heures) ; la bulle d'une notification (bit 8
    // de ses cibles, la colonne « bulle de notification ») ; un bouton « Gérer » du Magasin (ses préférences, à une ancre) ;
    // « Ajouter un jeu » (la fenêtre du code produit)
    reglageAmi: (nom) => {
      try {
        return globalStore("settingsStore")?.friendSettings?.[nom];
      } catch (e) {
        return void 0;
      }
    },
    ecrireReglageAmi: (nom, v) => {
      try {
        globalStore("settingsStore")?.UpdateFriendSetting(nom, v);
      } catch (e) {
      }
    },
    notifBulle: (type) => {
      try {
        return !!(globalStore("settingsStore")?.notificationPreferences?.find((x) => x.notification_type === type)?.notification_targets & 8);
      } catch (e) {
        return false;
      }
    },
    basculerNotifBulle: (type) => {
      try {
        globalStore("settingsStore")?.ToggleNotificationPreference(type, 8);
      } catch (e) {
      }
    },
    ouvrirPrefsMagasin: (ancre) => {
      try {
        navigator_()?.SteamWeb(O.urlStore.ResolveURL("SteamPreferences") + "#" + ancre);
      } catch (e) {
      }
    },
    activerProduit: () => {
      try {
        findModule("activer", "#Settings_Library_ProdKey_Info_Title", (f) => typeof f === "function" && /^function\b/.test(String(f)) && String(f).length < 120)?.(window);
      } catch (e) {
      }
    },
    // (29/10) l'aperçu de l'écran de veille choisi : ce que fait le bouton « Prévisualiser » de Steam (Personnalisation)
    apercuVeille: () => {
      try {
        findModule("veille", "ForceScreensaver", (v) => typeof v?.ForceScreensaver === "function")?.ForceScreensaver({ enabled: true });
      } catch (e) {
      }
    },
    controllerConfig: (appid) => {
      try {
        navigator_()?.ControllerConfigurator?.Main(appid);
      } catch (e) {
      }
    },
    // the controllers Steam currently knows about (raw list, as ControllerStore gives it)
    controllers: () => {
      try {
        return [...O.ControllerStore?.m_controllerList || []];
      } catch (e) {
        return [];
      }
    },
    // our own persona (name, avatar) : used for the "me" pill of the HOME menu
    friends: () => {
      try {
        return O.g_FriendsUIApp.FriendStore.self.persona || null;
      } catch (e) {
        return null;
      }
    },
    // #21 : cache sur la fenêtre principale, conservé quand QuickAccess est recréée.
    // Le suivi commun de l'horloge relit ceci ; aucun nouveau minuteur ni sondage par écran.
    battery: () => {
      const r = O.__pcvBatterieSysteme ||= { t: -Infinity, enCours: false, etat: null, dernier: null };
      let p;
      try {
        p = globalStore("SystemPowerStore");
      } catch (e) {
      }
      const steam = p?.m_bHasBattery === true && Number.isFinite(p.m_flBatteryLevel) && p.m_flBatteryLevel >= 0 && p.m_flBatteryLevel <= 1;
      const sansTemps = steam && !(p.m_eBatteryTimeConfidence === 1 && p.m_nBatterySecondsRemaining > 0) && p.m_eACState !== 2;
      if (steam && !sansTemps) return r.dernier = {
        present: true,
        percent: p.m_flBatteryLevel,
        charging: p.m_eACState === 2,
        acState: p.m_eACState,
        batteryState: p.m_eBatteryState,
        secondsRemaining: p.m_nBatterySecondsRemaining,
        confidence: p.m_eBatteryTimeConfidence
      };
      if (!r.enCours && Date.now() - r.t >= (r.etat ? 3e4 : 5e3)) {
        r.t = Date.now();
        r.enCours = true;
        Promise.resolve().then(() => Promise.race([
          window.__pcvBridge.callPlugin(window.__pcvGreffon.nom, "batterie"),
          new Promise((_, non) => {
            r.delai = O.setTimeout(() => non(new Error("batterie sans r\xE9ponse")), 4e3);
          })
        ])).then((b) => {
          r.etat = b?.etat || null;
          if (r.etat) r.dernier = r.etat;
        }).catch(() => {
          r.etat = null;
        }).finally(() => {
          O.clearTimeout(r.delai);
          r.enCours = false;
        });
      }
      if (sansTemps) return r.dernier = {
        present: true,
        percent: p.m_flBatteryLevel,
        charging: false,
        acState: p.m_eACState,
        batteryState: p.m_eBatteryState,
        secondsRemaining: r.etat?.secondsRemaining || 0,
        confidence: r.etat?.secondsRemaining > 0 ? 1 : p.m_eBatteryTimeConfidence
      };
      return r.dernier;
    },
    // calls cb on every battery change ; returns the subscription Steam gives (call .unregister() on it to stop)
    onBattery: (cb) => {
      try {
        return O.SteamClient.System.RegisterForBatteryStateChanges(cb);
      } catch (e) {
        return null;
      }
    },
    // simple connectivity (the Wi-Fi network LIST/scan/connect stays direct in acces-rapide.js : a much bigger surface)
    // filaire : la connexion qui porte la route par défaut est un appareil câblé (etype 1 ; 2 = Wi-Fi, 3 = boucle locale ;
    // estate 5 = connecté), lu dans la liste des points d'accès de Steam, en lecture seule
    network: () => {
      const S = globalStore("SystemNetworkStore");
      let filaire = false;
      if (typeof S?.hasNetworkConnection !== "boolean" || !S.hasNetworkConnection && !S.m_mapNetworkAccessPoints?.size) {
        const r = O.__pcvReseauSysteme ||= { t: -Infinity, enCours: false, etat: null };
        if (!r.enCours && Date.now() - r.t >= 5e3) {
          r.t = Date.now();
          r.enCours = true;
          Promise.resolve().then(() => O.DeckyBackend?.call("loader/call_plugin_method", window.__pcvGreffon.nom, "reseau")).then((etat) => {
            r.etat = etat;
          }).catch(() => {
          }).finally(() => {
            r.enCours = false;
          });
        }
        return r.etat || { connected: false, filaire: false, wifi: "" };
      }
      try {
        filaire = [...S.m_mapNetworkAccessPoints.values()].some(({ m_DeviceInfo: d }) => d?.etype === 1 && d.estate === 5 && d.ip4?.is_default_route);
      } catch (e) {
      }
      return { connected: !!S?.hasNetworkConnection, filaire, wifi: S?.accessPoints?.find((a) => a.type === 2 && a.isConnected)?.displayName || "" };
    },
    bluetooth: {
      state: async () => {
        const S = bt();
        if (!S) return null;
        try {
          return (await S.GetState({})).Body().toObject();
        } catch (e) {
          return null;
        }
      },
      deviceDetails: async (id) => {
        const S = bt();
        if (!S) return null;
        try {
          return (await S.GetDeviceDetails({ id })).Body().toObject().device || null;
        } catch (e) {
          return null;
        }
      },
      setDiscovering: (enabled) => {
        try {
          bt()?.SetDiscovering({ enabled });
        } catch (e) {
        }
      },
      pair: (id) => bt()?.Pair({ device: id }),
      cancelPair: (id) => bt()?.CancelPair({ device: id }),
      connect: (id) => bt()?.Connect({ device: id }),
      disconnect: (id) => bt()?.Disconnect({ device: id }),
      forget: (id) => bt()?.Forget({ device: id }),
      isEnabled: () => !!clientSettings()?.system_bluetooth_enabled,
      setEnabled: (v) => {
        try {
          settingsWriter()?.("system_bluetooth_enabled", v);
        } catch (e) {
        }
      }
    },
    // ── un jeu, pour le panneau et la page du jeu de la bibliothèque (bibliotheque.js). Les fonctions qui MODIFIENT
    // (⚠) ne sont appelées qu'après une confirmation à l'écran ; jamais en essai sur le compte de l'auteur ──
    // (développeurs, éditeurs, résumé : ceux que Steam montre dans sa bibliothèque ; demandés au premier appel, vides
    // jusqu'à leur arrivée)
    infosJeu: (appid) => {
      try {
        const S = O.appDetailsStore, a = S?.GetAssociations?.(appid), d = S?.GetDescriptions?.(appid), n = (l) => (l || []).map((x) => x?.strName).filter(Boolean);
        return { dev: n(a?.rgDevelopers), editeur: n(a?.rgPublishers), resume: d?.strSnippet || "", pret: !!a };
      } catch (e) {
        return { dev: [], editeur: [], resume: "", pret: true };
      }
    },
    // la commande d'un raccourci (exécutable et options), et les options de lancement d'un jeu Steam
    commande: (appid) => {
      try {
        const d = O.appDetailsStore.GetAppDetails(appid);
        return { exe: d?.strShortcutExe || "", options: d?.strShortcutLaunchOptions || "", lancement: d?.strLaunchOptions || "" };
      } catch (e) {
        return { exe: "", options: "", lancement: "" };
      }
    },
    pageBoutique: (appid) => {
      try {
        O.SteamClient.Apps.ShowStore(appid);
      } catch (e) {
      }
    },
    // Même composant et même ouverture que le portrait de la bibliothèque Steam : Decky patche ce composant.
    menuJeuSteam: (appid, ancre) => {
      const overview = O.appStore?.GetAppOverviewByAppID(+appid);
      if (!overview || !ancre) return false;
      const signature = "GetPrimaryActionMenuItem";
      const menu = findModule("libraryContextMenu", signature, (v) => typeof v === "function" && /navigator:.*instance:/.test(String(v)));
      const options = findModule("libraryContextOptions", signature, (v) => typeof v === "function" && String(v).includes("LibraryContextMenu"));
      const ouvrir = findModule("showContextMenu", "CreateContextMenuInstance", (v) => typeof v === "function" && String(v).includes(".CreateContextMenuInstance("));
      const element = findModule("reactCreateElement", "react.transitional.element", (v, x) => v === x.createElement && typeof x.useState === "function");
      if (!menu || !options || !ouvrir || !element) return false;
      return !!ouvrir(element(menu, { overview, client: "mostavailable", launchSource: 1e3, bInGamepadUI: true, ownerWindow: window }), ancre, options());
    },
    // (06/11, #22) « Toutes les propriétés de Steam » : en Big Picture, la page Propriétés de Steam (son navigateur) ; la fenêtre
    // de bureau (OpenAppSettingsDialog) ne s'ouvre plus dans ce mode
    proprietesSteam: (appid) => {
      try {
        const n = navigator_();
        if (n?.AppProperties) return n.AppProperties(+appid);
        O.SteamClient.Apps.OpenAppSettingsDialog(appid, "");
      } catch (e) {
      }
    },
    estFavori: (appid) => {
      try {
        return !!O.collectionStore.BIsFavorite(appid);
      } catch (e) {
        return false;
      }
    },
    estMasque: (appid) => {
      try {
        return !!O.collectionStore.BIsHidden(appid);
      } catch (e) {
        return false;
      }
    },
    verifier: (appid) => {
      try {
        O.SteamClient.Apps.VerifyApp(appid);
      } catch (e) {
      }
    },
    // ⚠
    favori: (appid, oui) => {
      try {
        O.collectionStore.SetAppsAsFavorite([appid], !!oui);
      } catch (e) {
      }
    },
    // ⚠ compte
    masquer: (appid, oui) => {
      try {
        O.collectionStore.SetAppsAsHidden([appid], !!oui);
      } catch (e) {
      }
    },
    // ⚠ compte
    desinstaller: (appid) => {
      try {
        O.SteamClient.URL.ExecuteSteamURL("steam://uninstall/" + appid);
      } catch (e) {
      }
    },
    // ⚠ (Steam demande encore)
    retirerRaccourci: (appid) => {
      try {
        O.SteamClient.Apps.RemoveShortcut(appid);
      } catch (e) {
      }
    },
    // ⚠ compte
    // les autres PC du foyer où le jeu est installé (Remote Play) : [{ clientid, nom }] ; diffuser() y lance le jeu en
    // streaming, comme le bouton de Steam (Apps.StreamGame(appid, clientid, -1))
    autresPC: (appid) => {
      try {
        return (O.appStore.GetAppOverviewByAppID(appid)?.per_client_data || []).filter((p) => p.clientid !== "0" && p.installed).map((p) => ({ clientid: p.clientid, nom: p.client_name || "" }));
      } catch (e) {
        return [];
      }
    },
    diffuser: (appid, clientid) => {
      try {
        O.SteamClient.Apps.StreamGame(appid, clientid, -1);
      } catch (e) {
      }
    },
    // les succès du joueur : [{ strName, strDescription, strImage, bAchieved, rtUnlocked, bHidden… }] (vide si aucun)
    // (11/11, PR #27 de lieserlV) Steam n'a rien pour un raccourci : si c'est un jeu d'Unifideck (GOG, Epic, Xbox), ses
    // succès viennent de lui (get_game_achievements), rendus dans la MÊME forme que ceux de Steam
    succes: async (appid) => {
      let l = [];
      try {
        const r = await O.SteamClient.Apps.GetMyAchievementsForApp(String(appid));
        l = (typeof r === "string" ? JSON.parse(r) : r)?.data?.rgAchievements || [];
      } catch (e) {
      }
      return l.length ? l : window.__pcvBridge.succesUnifideck(appid);
    },
    succesUnifideck: async (appid) => {
      try {
        const B = window.__pcvBridge, a = { appid: Number(appid) };
        if (!(a.appid > 0) || B.unifideck.etat(a) == null) return [];
        const donnee = (r2) => r2 && typeof r2 === "object" && !Array.isArray(r2) && "success" in r2 && "data" in r2 ? r2.data : r2;
        const n = a.appid, formes = n > 2147483647 ? [n, n - 4294967296] : [n];
        let info = null;
        for (const f of formes) {
          const d = donnee(await B.callPlugin("Unifideck", "get_game_info", f));
          if (d && typeof d === "object" && (d.store_game_id || d.id)) {
            info = d;
            break;
          }
        }
        if (!info || !["gog", "epic", "microsoft"].includes(String(info.store))) return [];
        const r = await B.callPlugin("Unifideck", "get_game_achievements", String(info.store), String(info.store_game_id ?? info.id));
        const l = r && r.success === false ? null : donnee(r)?.achievements;
        return !Array.isArray(l) ? [] : l.map((x) => ({
          strID: String(x.key || ""),
          strName: String(x.name || ""),
          strDescription: String(x.description || ""),
          strImage: String((x.unlocked ? x.image_unlocked : x.image_locked || x.image_unlocked) || ""),
          bAchieved: !!x.unlocked,
          rtUnlocked: Math.round(+x.unlocked_at || 0),
          bHidden: !!x.hidden
        }));
      } catch (e) {
        return [];
      }
    },
    // (22/10) les succès d'un ami dans un jeu que le joueur possède (même forme que succes ; vide si Steam refuse :
    // jeu non possédé, profil privé). Lecture seule.
    succesAmi: async (appid, id) => {
      try {
        const r = await O.SteamClient.Apps.GetFriendAchievementsForApp(String(appid), String(id));
        const j = typeof r === "string" ? JSON.parse(r) : r;
        return j?.result === 1 ? j.data?.rgAchievements || [] : [];
      } catch (e) {
        return [];
      }
    },
    // (22/10) ses amis, pour les bulles de la place : [{ id, nom, enLigne, appid, jeu, presence, avatar }] (appid 0 hors jeu ;
    // presence : le texte que Steam montre sous son nom, « En mission », vide sans). Rien n'est rangé.
    amis: () => {
      try {
        return [...O.g_FriendsUIApp.FriendStore.all_friends].filter((f) => f.persona).map((f) => {
          const p = f.persona, a = p.m_unGamePlayedAppID || 0;
          return {
            id: p.m_steamid?.ConvertTo64BitString?.() || "",
            nom: f.display_name || p.m_strPlayerName || "",
            enLigne: p.m_ePersonaState > 0,
            appid: a,
            jeu: a ? f.current_game_name || "" : "",
            presence: a ? String(f.current_game_rich_presence || p.m_strGameExtraInfo || "") : "",
            avatar: p.avatar_url_medium || ""
          };
        });
      } catch (e) {
        return [];
      }
    },
    // ── les téléchargements de CETTE console (page Téléchargements, tuiles de l'accueil : telechargements.js) ──
    // Le client « 0 » de downloadsStore seulement : la file des autres PC du compte (Steam la montre aussi) n'est jamais
    // lue ni touchée. file() → { cours: { appid, pct, reste (s, -1 inconnu), pause, maj, fait, total (octets), vitesse (o/s) } | null,
    // suivants: [{ appid, etat: "file" | "pause" | "prevu", maj, quand (prévu : l'heure de Steam, en s) }], termines: [appid…] } ; abonner(cb) : cb à chaque
    // changement, par les abonnements de Steam (aucune minuterie) → { unregister }. Les actions sont celles des boutons de
    // la page de Steam (mêmes appels, même client « 0 »). Banc : window.__pcvTelechBanc (même forme) remplace Steam.
    telech: /* @__PURE__ */ (() => {
      const D = () => O.SteamClient.Downloads, S = () => O.downloadsStore, BANC = () => window.__pcvTelechBanc;
      const pctDe = (x) => x.update_type_info?.find((u) => u.has_update)?.overall_percent_complete || 0;
      const ETAPE = () => findModule("etapeTelech", "k_EAppUpdateProgress_Download", (v) => typeof v?.k_EAppUpdateProgress_Download === "number")?.k_EAppUpdateProgress_Download;
      const octets = (progress) => {
        const p = progress?.[ETAPE()];
        return p ? [+p.bytes_in_progress || 0, +p.bytes_total || 0] : [0, 0];
      };
      const reprendre = (x) => {
        if (x?.queue_index === 0 && S().LocalDownloadOverview?.paused) D().EnableAllDownloads(true, "0");
      };
      return {
        file: () => {
          if (BANC()) return BANC().file();
          try {
            const s = S(), l = s.m_DownloadItems?.get("0") || [], ov = s.LocalDownloadOverview || {}, maj = (x) => !!x.buildid;
            const file = l.filter((x) => x.queue_index !== -1 && !x.deferred_time && !x.completed).sort((a, b) => a.queue_index - b.queue_index);
            const c = l.find((x) => x.appid === ov.update_appid) || (ov.paused ? file[0] : null);
            const cours = c ? {
              appid: c.appid,
              pct: c.appid === ov.update_appid ? ov.overall_percent_complete : pctDe(c),
              reste: c.appid === ov.update_appid ? ov.overall_estimated_time_remaining_sec : -1,
              pause: !!ov.paused,
              maj: maj(c),
              vitesse: c.appid === ov.update_appid ? +ov.update_network_bytes_per_second || 0 : 0
            } : null;
            if (cours) [cours.fait, cours.total] = octets(c.appid === ov.update_appid ? ov.progress : c.update_type_info?.find((u) => u.has_update)?.progress);
            const vus = new Set(cours ? [cours.appid] : []);
            const suivants = [
              ...file.map((x) => ({ x, etat: "file" })),
              ...l.filter((x) => !x.active && !x.completed && x.queue_index === -1 && !x.deferred_time).map((x) => ({ x, etat: "pause" })),
              ...l.filter((x) => x.queue_index === -1 && x.deferred_time && !x.completed).sort((a, b) => a.deferred_time - b.deferred_time).map((x) => ({ x, etat: "prevu" }))
            ].filter(({ x }) => !vus.has(x.appid) && vus.add(x.appid)).map(({ x, etat }) => ({ appid: x.appid, etat, maj: maj(x), ...etat === "prevu" ? { quand: +x.deferred_time || 0 } : {} }));
            const termines = [...new Set([...l.filter((x) => x.completed).sort((a, b) => b.completed_time - a.completed_time), ...s.RecentlyCompleted || []].map((x) => x.appid))].filter((id) => !vus.has(id)).slice(0, 12);
            return { cours, suivants, termines };
          } catch (e) {
            return null;
          }
        },
        abonner: (cb) => {
          if (BANC()) return BANC().abonner(cb);
          const a = [];
          try {
            a.push(D().RegisterForDownloadOverview(() => cb()));
          } catch (e) {
          }
          try {
            a.push(S().RegisterForDownloadItemsUpdate(() => cb()));
          } catch (e) {
          }
          return { unregister: () => a.forEach((x) => {
            try {
              x?.unregister ? x.unregister() : x?.Unregister?.();
            } catch (e) {
            }
          }) };
        },
        // pause de toute la file (le bouton Pause de Steam), reprise
        pause: (oui) => {
          if (BANC()) return BANC().pause(oui);
          try {
            D().EnableAllDownloads(!oui, "0");
          } catch (e) {
          }
        },
        // en tête de file (le glisser de Steam vers la première place), et la file relancée si elle était en pause
        premier: (appid) => {
          if (BANC()) return BANC().premier(appid);
          try {
            D().SetQueueIndex(appid, 0, "0");
            if (S().LocalDownloadOverview?.paused) D().EnableAllDownloads(true, "0");
          } catch (e) {
          }
        },
        // retiré de la file (le X de Steam : les fichiers déjà téléchargés restent, Steam les reprend plus tard)
        retirer: (appid) => {
          if (BANC()) return BANC().retirer(appid);
          try {
            const x = S().m_DownloadItems?.get("0")?.find((y) => y.appid === appid);
            D().RemoveFromDownloadList(appid, "0");
            reprendre(x);
          } catch (e) {
          }
        },
        // (21/11) « Tout mettre à jour » : chaque jeu arrêté ou prévu, dans l'ordre de la file ; les boutons Reprendre
        // (ResumeAppUpdate) et Mettre à jour (QueueAppUpdate) de la page de Steam, puis la file relancée si elle était en pause
        tout: (l) => {
          if (BANC()) return BANC().tout?.(l);
          try {
            for (const x of l) x.etat === "prevu" ? D().QueueAppUpdate(x.appid, "0") : D().ResumeAppUpdate(x.appid, "0");
            if (l.length && S().LocalDownloadOverview?.paused) D().EnableAllDownloads(true, "0");
          } catch (e) {
          }
        },
        // les réglages des téléchargements de Steam (le même lien que sa page Téléchargements)
        reglages: () => {
          try {
            O.SteamClient.URL.ExecuteSteamURL("steam://settings/downloads");
          } catch (e) {
          }
        }
      };
    })(),
    // a Decky plugin method (loader/call_plugin_method) : pluginName defaults to SteamU's own greffon
    callPlugin: (pluginName, method, ...args) => O.DeckyBackend?.call("loader/call_plugin_method", pluginName, method, ...args) ?? Promise.reject(new Error("Decky absent"))
  };
})();
(() => {
  if (typeof document === "undefined") return;
  window.__pcvModes?.arreter();
  const O = window.opener || window, CLE = "pcv-modes", WATTS = 5;
  const lire = () => {
    try {
      return JSON.parse(O.localStorage.getItem(CLE)) || {};
    } catch (e) {
      return {};
    }
  };
  const client = () => ({ steamos_tdp_limit: window.__pcvBridge.reglageClient("steamos_tdp_limit"), steamos_tdp_limit_enabled: window.__pcvBridge.reglageClient("steamos_tdp_limit_enabled") });
  const reglage = (k, v) => window.__pcvBridge.ecrireReglageClient(k, v);
  const tdp = (watts, enabled) => {
    if (watts !== void 0) reglage("steamos_tdp_limit", watts);
    reglage("steamos_tdp_limit_enabled", enabled);
  };
  let signature = "";
  const LEGERE = { anim: true, fond: true, apercus: true, lum: true, place: false, musique: false, tdp: false, telech: false, systeme: false, noir: false, jeuW: 0, jeuIps: 0 };
  const NORMALE = { ...LEGERE, place: true, musique: true, tdp: true, telech: true, systeme: true, jeuW: 12, jeuIps: 30 };
  const NIVEAUX = { legere: LEGERE, normale: NORMALE, maximale: { ...NORMALE, noir: true, jeuW: 8 } };
  const ECO = { niveau: "normale", seuil: 20, demander: true };
  const reglages = (m = lire()) => ({ ...ECO, ...m.eco });
  const leviers = (m = lire()) => {
    const r = reglages(m);
    return r.niveau === "perso" ? { ...NORMALE, ...r.leviers } : NIVEAUX[r.niveau] || NORMALE;
  };
  const coupe = (k, m = lire()) => !!m.economie && !!leviers(m)[k];
  const appliquer = () => {
    const m = lire(), sig = JSON.stringify(m);
    if (sig === signature) return;
    signature = sig;
    document.documentElement.classList.toggle("pcv-sans-mouvement", coupe("anim", m));
    document.documentElement.toggleAttribute("data-pcv-npd", !!m.npd);
    if (coupe("anim", m)) for (const a of document.getAnimations()) {
      if (a.effect?.target?.closest?.('[id^="pcv-"], [class^="pcv-"]')) {
        try {
          a.finish();
        } catch (e) {
          a.cancel();
        }
      }
    }
    window.dispatchEvent(new CustomEvent("pcv-modes", { detail: m }));
  };
  const sauver = (m) => {
    O.localStorage.setItem(CLE, JSON.stringify(m));
    appliquer();
  };
  const CRAN_LUMIERE = 0.1, B = () => window.__pcvBridge, SC = () => O.SteamClient, T = (k, v) => window.__pcvT?.(k, v) ?? k;
  const principale = () => {
    try {
      return O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.m_BrowserWindow === window;
    } catch (e) {
      return O === window;
    }
  };
  const systeme = (methode, ...a) => {
    try {
      return B().callPlugin(window.__pcvGreffon.nom, methode, ...a).catch(() => null);
    } catch (e) {
      return Promise.resolve(null);
    }
  };
  const telechPause = () => O.downloadsStore?.LocalDownloadOverview?.paused;
  const luminosite = () => new Promise((ok) => {
    let h = null, fini = false;
    const fin = (v) => {
      if (fini) return;
      fini = true;
      ok(v);
      try {
        h?.unregister();
      } catch (e) {
      }
    };
    try {
      h = SC().System.Display.RegisterForBrightnessChanges((b) => fin(b?.flBrightness));
      if (fini) h?.unregister();
    } catch (e) {
      fin(void 0);
    }
    setTimeout(() => fin(void 0), 1e3);
  });
  const poserLuminosite = (v) => {
    try {
      SC().System.Display.SetBrightness(v);
    } catch (e) {
    }
  };
  const SHADERS = "enable_shader_background_processing";
  const LEVIERS = {
    telech: (on, m) => {
      const a = m.avant;
      if (on) {
        if (telechPause() === false) {
          a.telech = true;
          B().telech?.pause(true);
        }
        if (B().reglageClient(SHADERS) === true) {
          a.shaders = true;
          reglage(SHADERS, false);
        }
        return;
      }
      if (a.telech && telechPause() === true) B().telech?.pause(false);
      if (a.shaders && B().reglageClient(SHADERS) === false) reglage(SHADERS, true);
      delete a.telech;
      delete a.shaders;
    },
    lum: (on, m) => {
      if (on) return void luminosite().then((v) => {
        const n = lire();
        if (!coupe("lum", n) || typeof v !== "number") return;
        n.avant.lum = [v, Math.max(CRAN_LUMIERE, +(v - CRAN_LUMIERE).toFixed(3))];
        sauver(n);
        poserLuminosite(n.avant.lum[1]);
      });
      const a = m.avant.lum;
      delete m.avant.lum;
      if (a) luminosite().then((v) => {
        if (typeof v === "number" && Math.abs(v - a[1]) < 0.01) poserLuminosite(a[0]);
      });
    },
    // les cœurs, le Wi-Fi et les LED (main.py) : le mode y commence et y finit toujours (reprise, limite tenue) ; le levier
    // touché pendant le mode, appliqué ou rendu sans finir le mode
    systeme: (on, m, pendant) => {
      if (pendant) systeme("economie_leviers", on);
    }
  };
  const enJeu = () => !!B().runningApp?.();
  const piloter = () => {
    const m = lire();
    if (!m.economie || !m.avant) return;
    const l = leviers(m), a = m.avant, c = client(), x = enJeu() ? l.jeuW : l.tdp ? WATTS : 0, w = x && !(a.enabled && a.watts <= x) ? x : null;
    const attendu = m.pose ?? (a.enabled ? a.watts : null), actuel = c.steamos_tdp_limit_enabled ? c.steamos_tdp_limit : null;
    if (w === attendu || actuel !== attendu) return;
    if (w) tdp(w, true);
    else tdp(a.watts, a.enabled);
    m.pose = w;
    sauver(m);
  };
  const images = () => {
    const p = B().perf?.(), s = p?.msgSettingsPerApp;
    if (!s) return;
    const m = lire(), id = enJeu() ? B().runningApp().appid : 0, n = m.economie && id ? leviers(m).jeuIps : 0;
    const choix = (p.msgLimits?.fps_limit_options || []).filter(Boolean), sous = choix.filter((v) => v <= n);
    const voulu = !n ? 0 : sous.length ? Math.max(...sous) : choix.length ? Math.min(...choix) : n, lim = s.is_fps_limit_enabled ? s.fps_limit : 0, r = m.ips;
    if (r && (r.appid !== id || r.fps !== voulu)) {
      if (lim === r.fps && (!id || id === r.appid)) {
        p.SetFPSLimitEnabled(r.avant > 0);
        if (r.avant) p.SetFPSLimit(false, r.avant);
      } else if (!id) return;
      delete m.ips;
      return sauver(m);
    }
    if (voulu && !r && !(lim && lim <= voulu)) {
      m.ips = { appid: id, fps: voulu, avant: lim };
      p.SetFPSLimitEnabled(true);
      p.SetFPSLimit(false, voulu);
      sauver(m);
    }
  };
  const auto = () => {
    const m = lire(), b = B().battery?.();
    if (!b?.present) return;
    if (b.charging) {
      if (m.auto) {
        delete m.auto;
        sauver(m);
      }
      return;
    }
    const r = reglages(m);
    if (m.economie || m.auto || !r.seuil || b.percent * 100 > r.seuil) return;
    if (r.demander && (enJeu() || !window.__pcvDossiers?.demander)) return;
    m.auto = true;
    sauver(m);
    if (!r.demander) return window.__pcvModes.economie(true);
    window.__pcvDossiers.demander({
      ic: "nom",
      svg: window.__pcvIcones?.trace?.("feuille"),
      titre: T("eco.question", { n: r.seuil }),
      texte: "",
      danger: false,
      ailleurs: true,
      non: T("eco.plus_tard"),
      oui: T("eco.activer"),
      ok: () => window.__pcvModes.economie(true)
    });
  };
  window.__pcvModes = {
    lire,
    appliquer,
    tdp,
    coupe,
    leviers,
    reglages,
    NIVEAUX,
    WATTS,
    // (07/11, l'auteur) comme Android : jamais d'économie quand la console charge ; elle se coupe au branchement
    economie: (on) => {
      const m = lire();
      if (!!m.economie === on || on && enCharge()) return;
      if (on) {
        const c2 = client(), l = leviers(m);
        m.avant = { watts: c2.steamos_tdp_limit, enabled: !!c2.steamos_tdp_limit_enabled };
        delete m.pose;
        m.economie = true;
        for (const k in LEVIERS) if (l[k]) LEVIERS[k](true, m);
        systeme("economie_systeme", true, !!l.systeme);
        sauver(m);
        piloter();
        setTimeout(() => tenir(), 2e3);
        return;
      }
      const c = client();
      if (m.avant) {
        if (m.pose != null && c.steamos_tdp_limit_enabled && c.steamos_tdp_limit === m.pose) tdp(m.avant.watts, m.avant.enabled);
        for (const k in LEVIERS) LEVIERS[k](false, m);
      }
      systeme("economie_systeme", false);
      delete m.avant;
      delete m.pose;
      m.economie = false;
      sauver(m);
      images();
    },
    // (13/11) les réglages de la page (parametres.js) : un niveau, un détail (le niveau passe à « perso »), le seuil, la
    // question ; pendant le mode, chaque levier de la console qui change entre ou rend le sien tout de suite
    regler: (o) => {
      const m = lire(), avant = leviers(m), r = reglages(m);
      if (o.levier) {
        m.eco = { ...r, niveau: "perso", leviers: { ...avant, ...o.levier } };
      } else m.eco = { ...r, ...o };
      if (o.seuil !== void 0) delete m.auto;
      const apres = leviers(m);
      if (m.economie && m.avant) {
        for (const k in LEVIERS) if (!avant[k] !== !apres[k]) LEVIERS[k](!!apres[k], m, true);
      }
      sauver(m);
      piloter();
      images();
    },
    npd: (on) => {
      sauver({ ...lire(), npd: on });
    },
    avion: () => {
      const s = window.__pcvBridge.modeAvion();
      return !!s;
    },
    arreter: () => {
      clearInterval(suivi);
      window.removeEventListener("storage", appliquer);
    }
  };
  const proto = globalThis.Element?.prototype;
  if (proto && !proto.__pcvAnimate) {
    proto.__pcvAnimate = proto.animate;
    proto.animate = function(images2, options) {
      const hote = this.getRootNode()?.host;
      if (window.__pcvModes?.coupe("anim") && (this.closest('[id^="pcv-"], [class^="pcv-"]') || hote?.closest('[id^="pcv-"]'))) options = { ...typeof options === "number" ? {} : options, duration: 0, delay: 0, iterations: 1 };
      return proto.__pcvAnimate.call(this, images2, options);
    };
  }
  window.addEventListener("storage", appliquer);
  const enCharge = () => {
    try {
      return !!window.__pcvBridge.battery()?.charging;
    } catch (e) {
      return false;
    }
  };
  const tenir = () => {
    const c = client(), m = lire();
    if (principale() && m.economie && m.pose && c.steamos_tdp_limit_enabled && c.steamos_tdp_limit === m.pose) systeme("economie_tdp", m.pose);
  };
  let tics = 0;
  const suivi = setInterval(() => {
    if (lire().economie && enCharge()) window.__pcvModes.economie(false);
    appliquer();
    if (principale()) {
      piloter();
      images();
      auto();
    }
    if (++tics % 20 === 0) tenir();
  }, 500);
  appliquer();
  if (principale() && lire().economie) systeme("economie_actif").then((actif) => {
    if (actif === false) window.__pcvModes.economie(false);
  });
})();
window.__pcvEtat = {
  // (15/10 soir) l'autonomie n'est montrée que si Steam en est sûr (confiance 1) et qu'elle reste plausible (moins de 20 h) ;
  // sa durée arrondie à 5 min sur le TOTAL (« 1 h 60 » ne peut plus sortir) ; (13/11) partagées avec les Paramètres
  autonomie: (p) => p?.confidence === 1 && p.secondsRemaining > 0 && p.secondsRemaining < 20 * 3600 ? p.secondsRemaining : 0,
  duree: (s) => {
    const t = Math.round(s / 300) * 5, hh = Math.floor(t / 60), mm = t % 60;
    return hh ? `${hh} h ${String(mm).padStart(2, "0")}` : `${mm} min`;
  },
  html: (cl = "", style = "") => `<div class="pilule verre etat ${cl}"${style ? ` style="${style}"` : ""}>${window.__pcvIcones.svg("wifi", { classe: "ico" })}<span class="pile" hidden></span><span class="pcv-mode-npd" hidden>${window.__pcvIcones.svg("interdit")}</span><span class="heure"></span></div>`,
  // (22/10, l'auteur : « une seule batterie ») la pile d'une manette = le MÊME dessin que la pile du système, déjà posée
  // par peindre() dans racine, remplie à pct % ; null tant qu'elle n'y est pas (machine sans batterie, avant peindre())
  // (tout l'élément de la pile, pas seulement son svg : son dessin est celui du thème, theme-wiiu.src.css, .pcv-pile-manette)
  pileA: (racine, pct) => {
    const m = racine.querySelector(".pilule.etat .pile > *");
    if (!m?.querySelector("svg svg rect")) return null;
    const c = m.cloneNode(true);
    c.querySelectorAll(".pcv-pct, .pcv-eclair, .pcv-mode-feuille").forEach((x) => x.remove());
    c.querySelector("svg svg rect").setAttribute("width", Math.max(0, Math.min(100, pct)) + "%");
    return `<span class="pile pcv-pile-manette">${c.outerHTML}</span>`;
  },
  peindre: (racine, s) => {
    const B = window.__pcvBridge, d = racine.ownerDocument;
    try {
      const n = B.network(), f = n.filaire ? "filaire" : window.__pcvModes.avion() ? "avion" : "wifi";
      racine.querySelectorAll(".pilule.etat .ico").forEach((i) => {
        if (i.dataset.ico !== f) {
          i.insertAdjacentHTML("beforebegin", window.__pcvIcones.svg(f, { classe: "ico" }));
          const j = i.previousElementSibling;
          i.remove();
          i = j;
        }
        i.classList.toggle("coupe", !n.connected && f !== "avion");
      });
    } catch (e) {
    }
    const cloner = () => {
      const c = s.cloneNode(true);
      c.querySelectorAll("*").forEach((x) => {
        if (!x.children.length && /%/.test(x.textContent)) x.remove();
      });
      for (const n of c.querySelectorAll("[class]")) if (!n.matches("{{BatteryIcon@LegacySizing}}")) n.removeAttribute("class");
      return c;
    };
    const b = B.battery();
    const classesPile = (selecteur) => (selecteur.match(/\.[\w-]+/g) || []).map((c) => c.slice(1)).join(" ");
    const secours = b?.present ? `<div class="${classesPile("{{HeaderItem@Header}}{{BatteryIcon@HeaderItem}}")}"><div><div class="${classesPile("{{BatteryIcon@LegacySizing}}")} pcv-pile-rect"><svg viewBox="0 0 48 36"><svg x="6" y="12" width="27" height="12"><rect width="${Math.round(b.percent * 100)}%" height="100%"/></svg></svg></div></div></div>` : "";
    const sig = s ? s.outerHTML : secours;
    racine.querySelectorAll(".pile").forEach((p) => {
      if (p.__pcvSrc === sig) return;
      p.__pcvSrc = sig;
      if (s) p.replaceChildren(cloner());
      else p.innerHTML = secours;
    });
    try {
      const b2 = B.battery(), charge = b2?.present && b2.charging;
      racine.querySelectorAll(".pilule.etat > .pile").forEach((p) => {
        p.hidden = b2?.present !== true;
      });
      for (const svg of racine.querySelectorAll('.pile svg:is([viewBox="0 0 48 36"], [viewBox="0 0 42 36"])')) {
        const r = svg.parentElement, e = r.querySelector(".pcv-eclair");
        if (charge && !e) r.appendChild(Object.assign(d.createElement("div"), { className: "pcv-eclair" }));
        else if (!charge && e) e.remove();
        const f = r.querySelector(".pcv-mode-feuille"), eco = !charge && !!window.__pcvModes?.lire().economie;
        if (eco && !f) r.insertAdjacentHTML("beforeend", `<span class="pcv-mode-feuille">${window.__pcvIcones.svg("feuille")}</span>`);
        else if (!eco && f) f.remove();
      }
      for (const r of racine.querySelectorAll(".pilule.etat .pile > :not(.pcv-mode-feuille)")) {
        let p = r.querySelector(":scope > .pcv-pct");
        if (!b2?.present) p?.remove();
        else {
          if (!p) r.prepend(p = Object.assign(d.createElement("div"), { className: "pcv-pct" }));
          const t = Math.round(b2.percent * 100) + "%";
          if (p.textContent !== t) p.textContent = t;
        }
      }
    } catch (e) {
    }
    const modes = window.__pcvModes?.lire() || {};
    racine.querySelectorAll(".pcv-mode-npd").forEach((e) => {
      e.hidden = !modes.npd;
    });
    window.__pcvEtat.heure(racine);
  },
  // (l'heure au format de Steam : « 8:04 », pas « 08:04 » ; seule, à l'ouverture d'un menu préparé, menus-commun.js)
  // (12/11) heureDe(t) : une heure au même format, aussi pour l'heure de réception des notifications (notifs.js)
  heureDe: (t = Date.now()) => new Date(t).toTimeString().slice(0, 5).replace(/^0/, ""),
  heure: (racine) => {
    const t = window.__pcvEtat.heureDe();
    racine.querySelectorAll(".pilule.etat .heure").forEach((e) => {
      if (e.textContent !== t) e.textContent = t;
    });
  },
  // (26/10) les trois pastilles (accueil, menu HOME, réglages rapides) relisent la même source, au même instant : à chaque
  // seconde pile de l'horloge, l'heure, et la batterie de Steam (SystemPowerStore, B.battery) ; pourcentage ou charge
  // changés : peindreTout() (le dessin de la pile est recloné). Avant, chacune se repeignait à son rythme (abonnement de
  // Steam espacé, 30 s, ouverture du menu) : 27 % ici, 28 % là. Rend de quoi arrêter.
  suivre: (racine, peindreTout) => {
    let t = 0, vu = "";
    const tic = () => {
      window.__pcvEtat.heure(racine);
      try {
        const b = window.__pcvBridge.battery(), n = window.__pcvBridge.network(), k = [b ? Math.round(b.percent * 100) + ":" + !!b.charging + ":" + b.present : "", n.connected, n.filaire, window.__pcvModes.avion(), JSON.stringify(window.__pcvModes.lire())].join(":");
        if (k !== vu) {
          if (vu) peindreTout();
          vu = k;
        }
      } catch (e) {
      }
      t = setTimeout(tic, 1e3 - Date.now() % 1e3 + 20);
    };
    tic();
    return Object.assign(() => clearTimeout(t), { maintenant: () => {
      clearTimeout(t);
      tic();
    } });
  }
};
window.__pcvHomeIcones = (() => {
  const O = window.opener || window, CLE = "pcv-home-raccourcis";
  const MAX_GREFFONS = 3;
  const VERROUILLEES = ["aller:accueil", "aller:parametres"];
  const SYSTEME = [
    ["aller:accueil", "spaces.accueil.nom", "accueil", "#5fd0ff, #1a9ae6"],
    ["aller:bibliotheque", "spaces.bibliotheque.nom", "bibliotheque", "bibliotheque"],
    ["appli:eshop", "spaces.boutique.nom", "boutique", "eshop"],
    ["amis", "spaces.amis.nom", "amis", "#5fe39a, #22a85f"],
    ["notifs", "spaces.notifs.nom", "notifications", "#ff7a7e, #e5484d"],
    ["appli:album", "place.mediatheque", "album", "album"],
    ["aller:telechargements", "home.telechargements", "telechargements", "telechargements"],
    ["aller:parametres", "spaces.parametres.nom", "parametres", "parametres", "var(--pcv-parametres-dessin)"]
  ];
  const fond = (f, applis) => (/^(#|var|hsl)/.test(f) ? f : applis?.[f]?.fond || "#c5cdd8, #8b9098").split(/,(?![^(]*\))/).map((x) => x.trim());
  const lire = () => {
    try {
      const m = JSON.parse(O.localStorage.getItem(CLE));
      return m && typeof m === "object" ? m : {};
    } catch (e) {
      return {};
    }
  };
  const sauver = (m) => {
    try {
      O.localStorage.setItem(CLE, JSON.stringify(m));
    } catch (e) {
    }
  };
  const G = "greffon:", route = (id) => id.slice(G.length);
  const ordre = (m = lire()) => {
    const r = (m.ordre || []).filter((a) => a.startsWith(G) ? !!m.greffons?.[route(a)] : SYSTEME.some((s) => s[0] === a));
    SYSTEME.forEach(([a], k) => {
      if (r.includes(a)) return;
      const apres = SYSTEME.slice(k + 1).map((s) => r.indexOf(s[0])).find((i) => i >= 0);
      r.splice(apres ?? r.length, 0, a);
    });
    return r;
  };
  const epingles = (m = lire()) => ordre(m).filter((a) => a.startsWith(G));
  const rangee = (m = lire()) => ordre(m).filter((a) => a.startsWith(G) ? m.greffons[route(a)].present : !(m.retires || []).includes(a));
  const changer = (f) => {
    const m = lire();
    m.greffons ||= {};
    f(m);
    sauver(m);
    return m;
  };
  const couleur = (g) => g?.couleur || `hsl(${[...String(g?.nom || "")].reduce((h, c) => h * 31 + c.charCodeAt(0) >>> 0, 7) % 12 * 30 + 15} 72% 50%)`;
  return {
    MAX_GREFFONS,
    VERROUILLEES,
    SYSTEME,
    fond,
    lire,
    ordre,
    epingles,
    rangee,
    couleur,
    route,
    id: (r) => G + r,
    // menu-pont.js : les greffons vus dans le menu de Steam ([{ route, nom, svg }]) ; les autres, connus, sont absents
    signaler: (liste) => {
      const m = lire(), g = m.greffons ||= {}, avant = JSON.stringify(g);
      for (const r in g) g[r].present = false;
      for (const x of liste) g[x.route] = { ...g[x.route], nom: x.nom, svg: x.svg, present: true };
      if (JSON.stringify(g) !== avant) sauver(m);
    },
    // les greffons présents à qui la question n'a pas encore été posée
    aDemander: (m = lire()) => Object.keys(m.greffons || {}).filter((r) => m.greffons[r].present && !m.greffons[r].repondu),
    repondre: (r) => changer((m) => {
      if (m.greffons[r]) m.greffons[r].repondu = true;
    }),
    colorer: (r, c) => changer((m) => {
      if (m.greffons[r]) m.greffons[r].couleur = c;
    }),
    // épingler : le greffon arrive juste avant Paramètres (puis se déplace) ; refusé au-delà de la limite
    epingler: (r, oui) => {
      const m = lire(), o = ordre(m), a = G + r;
      if (!m.greffons?.[r]) return false;
      if (!oui) {
        m.ordre = o.filter((x) => x !== a);
        sauver(m);
        return true;
      }
      if (o.includes(a)) return true;
      if (epingles(m).length >= MAX_GREFFONS) return false;
      const p = o.indexOf("aller:parametres");
      o.splice(p < 0 ? o.length : p, 0, a);
      m.ordre = o;
      m.greffons[r].repondu = true;
      sauver(m);
      return true;
    },
    // une icône système : retirée ou remise (jamais une verrouillée)
    basculer: (a) => {
      if (VERROUILLEES.includes(a)) return false;
      changer((m) => {
        const r = new Set(m.retires);
        r.has(a) ? r.delete(a) : r.add(a);
        m.retires = [...r];
      });
      return true;
    },
    // le rangement d'une liste d'icônes montrées (Paramètres > SteamU > Menu HOME en colonne, le menu HOME en rangée) : celui
    // de la grille de l'accueil (console.js : prendre, échanger avec la voisine, poser ; rien n'est enregistré avant la
    // pose, annuler remet tout). l : les icônes montrées, dans l'ordre ; i : celle qu'on prend. À la pose, elles reprennent
    // les places qu'elles avaient dans l'ordre complet : les icônes cachées (retirées, greffon absent) ne bougent pas
    rangement: (l, i) => {
      const r = {
        l: [...l],
        i,
        depart: i,
        bouger: (d) => {
          const n = r.i + d;
          if (n < 0 || n >= r.l.length) return false;
          [r.l[r.i], r.l[n]] = [r.l[n], r.l[r.i]];
          r.i = n;
          return true;
        },
        poser: () => changer((m) => {
          const o = ordre(m), k = [...r.l];
          m.ordre = o.map((a) => r.l.includes(a) ? k.shift() : a);
        })
      };
      return r;
    }
  };
})();
{
  const D = window.document;
  if (D) {
    window.__pcvScQuitter = (ev) => {
      try {
        const s = ev.target.closest?.(".ModalOverlayContent")?.querySelector(".sc-xv-side .sc-xv-foot .sc-xv-item > span"), t = window.__pcvT?.("acces.sc_quitter");
        if (s && !s.childElementCount && t && t !== "acces.sc_quitter" && s.textContent !== t) s.textContent = t;
      } catch (e) {
      }
    };
    D.addEventListener("focusin", window.__pcvScQuitter, true);
  }
}
(() => {
  const O = window.opener || window, dessins = /* @__PURE__ */ new WeakMap(), marques = /* @__PURE__ */ new WeakMap();
  const liste = (masques = false) => {
    try {
      const L = O.DeckyPluginLoader, s = L.deckyState, tous = s._plugins?.length ? s._plugins : L.plugins || [];
      const par = new Map(tous.map((p) => [p.name, p])), ordre = [...new Set(s._pluginOrder || [])].filter((n) => par.has(n));
      return [...ordre, ...tous.map((p) => p.name).filter((n) => !ordre.includes(n))].filter((n) => masques || !(s._hiddenPlugins || []).includes(n)).map((n) => par.get(n));
    } catch (e) {
      return [];
    }
  };
  const dessin = (p) => {
    if (dessins.has(p)) return dessins.get(p);
    let s = "";
    try {
      const creer = O.__pcvCreerRacine ||= (() => {
        const req = O.__pcvReq ||= (() => {
          let r2;
          O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
            r2 = q;
          }]);
          return r2;
        })();
        for (const id of Object.keys(req.m)) {
          const s2 = req.m[id].toString();
          if (s2.length > 5e4 && s2.includes("react.dev/errors") && s2.includes("createRoot") && req(id).createRoot) return req(id).createRoot;
        }
      })();
      const div = document.createElement("div"), r = creer(div);
      try {
        O.SP_REACTDOM.flushSync(() => r.render(p.icon));
        s = div.innerHTML;
      } finally {
        r.unmount();
      }
    } catch (e) {
    }
    dessins.set(p, s);
    return s;
  };
  const signaler = () => window.dispatchEvent(new CustomEvent("pcv-decky-icones"));
  const marque = (p) => {
    if (marques.has(p)) return marques.get(p);
    const h = [...p.name].reduce((v, c) => v * 31 + c.codePointAt(0) >>> 0, 0);
    const m = { couleur: `hsl(${h % 360} 62% 43%)`, svg: "", masque: "", initiale: [...p.name.trim()][0] || "?" };
    marques.set(p, m);
    const div = document.createElement("div");
    div.innerHTML = dessin(p);
    const svg = div.querySelector("svg");
    if (svg) {
      svg.querySelectorAll("script,foreignObject,image,use,style,animate,animateTransform").forEach((n) => n.remove());
      for (const n of [svg, ...svg.querySelectorAll("*")]) for (const a of [...n.attributes]) {
        if (/^on|href|style|class|id/i.test(a.name)) n.removeAttribute(a.name);
        else if ((a.name === "fill" || a.name === "stroke") && a.value !== "none") n.setAttribute(a.name, "currentColor");
      }
      const f = svg.getAttribute("fill"), t = svg.getAttribute("stroke"), e = svg.getAttribute("stroke-width");
      svg.setAttribute("style", `fill:${f === "none" ? "none" : "currentColor"};stroke:${t && t !== "none" ? "currentColor" : "none"}${e ? `;stroke-width:${parseFloat(e) || 0}` : ""}`);
      if (svg.childElementCount) m.svg = svg.outerHTML;
    }
    const image = div.querySelector("img")?.getAttribute("src") || p.image;
    if (typeof image === "string" && image) {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = async () => {
        try {
          const c = document.createElement("canvas");
          c.width = c.height = 48;
          const x = c.getContext("2d", { willReadFrequently: true });
          x.drawImage(im, 0, 0, 48, 48);
          const pixels = x.getImageData(0, 0, 48, 48).data;
          let poids = 0, r = 0, g = 0, b = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            const v = (Math.max(...pixels.slice(i, i + 3)) - Math.min(...pixels.slice(i, i + 3))) * pixels[i + 3];
            poids += v;
            r += pixels[i] * v;
            g += pixels[i + 1] * v;
            b += pixels[i + 2] * v;
          }
          if (poids) m.couleur = `rgb(${Math.round(r / poids)} ${Math.round(g / poids)} ${Math.round(b / poids)})`;
          if (!m.svg) {
            const blob = await new Promise((ok) => c.toBlob(ok));
            m.masque = await window.__pcvIcones.pochoirLogo(blob) || "";
          }
          signaler();
        } catch (e) {
        }
      };
      im.src = image;
    }
    return m;
  };
  const relief = (p) => {
    const m = marque(p), I = window.__pcvIcones;
    const initiale = document.createElement("span");
    initiale.textContent = m.initiale;
    const dessin2 = m.svg || (m.masque ? `<svg viewBox="0 0 24 24"><foreignObject width="24" height="24"><span xmlns="http://www.w3.org/1999/xhtml" class="pcv-greffon-silhouette" style="--pcv-greffon-masque:url('${m.masque}')"></span></foreignObject></svg>` : `<svg viewBox="0 0 24 24"><text x="12" y="17" text-anchor="middle" fill="currentColor" stroke="none">${initiale.innerHTML}</text></svg>`);
    const tuile = I.relief(dessin2, m.couleur).replace('pcv-marque-relief"', 'pcv-marque-relief pcv-marque-greffon"');
    return tuile.slice(0, -7) + `<b class="pcv-prise-debut">${I.svg("prise")}</b><b class="pcv-prise-fin">${I.svg("prise")}</b></span>`;
  };
  window.__pcvDecky = { liste, dessin, marque, relief, pret: () => !!O.DeckyPluginLoader?.deckyState };
})();
