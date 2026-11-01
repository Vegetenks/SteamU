(() => {
  window.__pcvBoutique?.detruire();
  const O = window.opener || window, P = window.__pcvPresentation, I = window.__pcvIcones;
  const T = (k, v) => window.__pcvT("boutique." + k, v);
  const e = P.echapper;
  const u = (n) => `calc(var(--u) * ${n})`, ico = (n) => I.svg(n);
  const appel = (m2, ...args) => O.DeckyBackend.call("loader/call_plugin_method", window.__pcvGreffon.nom, m2, ...args);
  const RAYONS = ["new_releases", "top_sellers", "coming_soon", "specials"];
  const SOUHAITS = [
    ["souhaits", "epingle", null],
    ["souhaits_nom", "livre", (a, b) => a.nom.localeCompare(b.nom)],
    ["souhaits_prix", "tag", (a, b) => (a.prix?.cents ?? 1e12) - (b.prix?.cents ?? 1e12)],
    ["souhaits_promo", "boutique", (a, b) => (b.prix?.reduction || 0) - (a.prix?.reduction || 0)],
    ["souhaits_date", "calendrier", (a, b) => b.ajout - a.ajout]
  ];
  const CATEGORIES = [
    ["solo", "miimaker"],
    ["multi", "amis"],
    ["coop", "manette"],
    ["aventure", "monde"],
    ["rpg", "livre"],
    ["simulation", "reglages"]
  ];
  const CATS = CATEGORIES.map(([k]) => k);
  const region = async () => {
    const r = await O.SteamClient.User.GetIPCountry();
    const pays = typeof r === "string" ? r : r?.strCountryCode;
    if (!/^[a-z]{2}$/i.test(pays || "")) throw Error("region");
    return { pays: pays.toLowerCase(), langue: window.__pcvLangue() };
  };
  let universActif = null, choixEntree = 0, catalogue = null, jeux = [], enteteFaite = "";
  let contexte = null, details = /* @__PURE__ */ new Map(), demandes = /* @__PURE__ */ new Map(), sousPage = "", captureFiche = 0;
  let erreur = "", chargement = false, mort = false, session = 0, rechercheId = 0, delaiRecherche = 0, galerie = -1, pageVedette = 0, actionVedette = 0, defilement = 0, pauseVedette = false;
  let commandesVideo = null, apercuVideo = null, attenteVideo = true, videoGalerie = null, lecteurGalerie = null, shakaPromesse = null;
  let trouves = null, rechercheTout = 0, retourGrille = "";
  let souhaits = null;
  const services = /* @__PURE__ */ new Map();
  const service = (signature, methode) => services.get(signature) || services.set(signature, (() => {
    const req = O.__pcvReq ||= (() => {
      let r;
      O.webpackChunksteamui.push([[/* @__PURE__ */ Symbol("pcv")], {}, (q) => {
        r = q;
      }]);
      return r;
    })();
    for (const id of Object.keys(req.m)) if (String(req.m[id]).includes(signature)) {
      const W = Object.values(req(id)).find((x) => x?.[methode]);
      if (W) return W;
    }
    throw Error(signature);
  })()).get(signature);
  const serviceSouhaits = () => service("Wishlist.GetWishlistSortedFiltered#1", "RemoveFromWishlist");
  const MASQUES_STEAM = [3, 4], bits = (l) => l.reduce((x, d) => x | 1 << d - 1, 0);
  let masque = bits(MASQUES_STEAM), masqueLu = null;
  const lireMasque = () => masqueLu ||= (async () => {
    try {
      const r = await service("Store.GetStorePreferences#1", "GetStorePreferences").GetStorePreferences(O.App.m_cm.m_ServiceTransport, {});
      const l = r.GetEResult() === 1 && r.Body().toObject().content_descriptor_preferences?.content_descriptors_to_exclude;
      if (Array.isArray(l)) masque = bits(l.map((x) => +x.content_descriptorid).filter((d) => d >= 1 && d <= 5));
    } catch (_) {
    }
  })();
  const lireSouhaits = async (c) => {
    const r = await serviceSouhaits().GetWishlistSortedFiltered(O.App.m_cm.m_ServiceTransport, {
      steamid: O.App.m_CurrentUser.strSteamID,
      page_size: 2e3,
      context: { language: await O.SteamClient.Settings.GetCurrentLanguage(), country_code: c.pays.toUpperCase() },
      data_request: { include_assets: true }
    });
    if (r.GetEResult() !== 1) throw Error("souhaits");
    return (r.Body().toObject().items || []).filter((i) => i.store_item?.name).map(({ appid, date_added, store_item: s }) => {
      const b = s.best_purchase_option, a = s.assets;
      const gratuit = s.is_free || b && +b.final_price_in_cents === 0;
      return {
        id: appid,
        nom: s.name,
        ajout: date_added || 0,
        image: a?.header && a.asset_url_format ? "https://shared.steamstatic.com/store_item_assets/" + a.asset_url_format.replace("${FILENAME}", a.header) : "",
        prix: gratuit ? { actuel: T("gratuit"), avant: b?.formatted_original_price || "", reduction: b?.discount_pct || 0, cents: 0 } : b?.formatted_final_price ? { actuel: b.formatted_final_price, avant: b.formatted_original_price || "", reduction: b.discount_pct || 0, cents: +b.final_price_in_cents } : null
      };
    });
  };
  const changerSouhait = (p, retirer) => {
    if (!window.__pcvDossiers?.demander?.({
      ailleurs: true,
      svg: I.trace("epingle"),
      teinte: "color-mix(in srgb, var(--pcv-cyan-plein) 60%, #fff), var(--pcv-cyan-plein)",
      non: T("annuler"),
      titre: T(retirer ? "souhaits_retirer_titre" : "souhaits_ajouter_titre"),
      texte: T(retirer ? "souhaits_retirer_texte" : "souhaits_ajouter_texte", { nom: p.nom }),
      oui: T(retirer ? "souhaits_retirer_oui" : "souhaits_ajouter_oui"),
      ok: async () => {
        try {
          const r = await serviceSouhaits()[retirer ? "RemoveFromWishlist" : "AddToWishlist"](O.App.m_cm.m_ServiceTransport, { appid: p.id });
          if (r.GetEResult() !== 1) throw Error("souhaits");
          souhaits = await lireSouhaits(contexte);
        } catch (_) {
          window.__pcvSon?.("erreur");
        }
        m.rendre();
      }
    })) window.__pcvSon?.("bord");
  };
  const { cotes } = P;
  const tailleRayon = () => P.cransEtageres()[m.zE ?? 2];
  const image = (url, format = "") => `data-image="${e(url)}"${format ? ` data-format="${format}"` : ""}`;
  const barre = (prix) => prix.reduction && prix.avant ? `<s>${e(prix.avant)}</s>` : "";
  const tuile = (p, c, attrs = "") => `<button class="cel jeu" aria-label="${e(p.nom)}" ${attrs}><span class="im nomme" style="--fond:${window.__pcvFondRepli(p.id % 360)}" data-p="${p.id}" data-c="${c}" data-repli="${e(p.image || imagesCatalogue.get(p.id) || "")}">${p.nom ? `<b class="pcv-nom">${e(p.nom)}</b>` : ""}</span>${p.prix ? `<span class="prix-discret prix-tuile">${e(p.prix.actuel)}${barre(p.prix)}</span>` : ""}</button>`;
  const ajouter = (faire) => m.action(faire);
  const bouton = (nom, ic, faire, classe = "og verre") => `<button class="${classe}" aria-label="${e(nom)}" data-a="${ajouter(faire)}">${ic ? ico(ic) : ""}${classe.includes("commande") ? "" : e(nom)}</button>`;
  const estSouhaits = () => SOUHAITS.some(([k]) => k === m.onglet);
  const message = () => estSouhaits() ? !souhaits ? T(souhaits === null && !erreur ? "chargement" : "souhaits_indisponible") : !souhaits.length ? T("souhaits_vide") : "" : m.vue === "grille" && !m.texte.trim() && (m.onglet === "tous" || CATS.includes(m.onglet)) ? complet.jeux.length ? "" : complet.etat === "construction" ? T("catalogue_construction") : complet.etat === "erreur" ? T("hors_ligne") : T("chargement") : chargement ? T("chargement") : erreur || (!jeux.length ? T("vide") : "");
  const obtenir = async (action, appid = 0, terme = "", start = 0) => {
    const d = await appel("eshop_jeux", action, contexte.pays, contexte.langue, appid, terme, start);
    if (!d || d.erreur) throw Error("Steam");
    return d;
  };
  const detail = (p) => {
    if (details.has(p.id)) return Promise.resolve(details.get(p.id));
    if (demandes.has(p.id)) return demandes.get(p.id);
    const generation = session;
    const promesse = obtenir("fiche", p.id).then((r) => {
      const d = r.donnees?.exclu ? null : r.donnees;
      if (d !== null && !d?.id) throw Error("fiche");
      if (generation === session) {
        details.set(p.id, d);
        if (details.size > 100) details.delete(details.keys().next().value);
      }
      return d;
    }).finally(() => {
      if (demandes.get(p.id) === promesse) demandes.delete(p.id);
    });
    demandes.set(p.id, promesse);
    return promesse;
  };
  const admissible = (p) => details.get(p.id) !== null && !((p.d ?? descripteurs.get(p.id)) & masque);
  const medias = () => {
    const d = details.get(m.fiche?.id);
    return [...d?.captures || [], ...d?.videos || []];
  };
  const choixVedettes = () => [...new Map(RAYONS.map((k) => catalogue?.[k]?.find(admissible)).filter((p) => p && admissible(p)).map((p) => [p.id, p])).values()].slice(0, 3);
  const vedetteCourante = () => choixVedettes()[pageVedette] || jeux.find(admissible);
  const modes = (d) => (d?.modes || []).filter((m2) => ["1", "2", "9", "24", "27", "38", "39"].includes(m2.id)).map((m2) => `<span class="mode-jeu">${ico("manette")}${e(m2.nom)}</span>`).join("");
  const contenuVedette = () => {
    const p = vedetteCourante();
    if (!p) return "";
    const d = details.get(p.id);
    return `<div class="vedette-couche"><div class="vedette-image" ${image(banniere(p), "panorama")}></div><div class="vedette-texte"><span class="surtitre">${e(T("selection_steam"))}</span><h2>${e(p.nom)}</h2>${d?.description ? `<p>${e(d.description)}</p>${P.mentionAnglais(d.description_anglaise)}` : ""}<button class="decouvrir verre" data-a="${actionVedette}">${e(T("decouvrir"))}${ico("fleche")}</button></div></div>`;
  };
  const banniere = (p) => details.get(p.id)?.captures[0]?.grande || p.image;
  const arreterVedette = () => {
    clearInterval(defilement);
    defilement = 0;
  };
  const anticiperVedette = () => {
    const p = vedetteCourante(), generation = session;
    if (!p || details.has(p.id)) return;
    if (demandes.size) return;
    detail(p).then((d) => {
      if (generation !== session || m.vue !== "etageres") return;
      if (!d) {
        m.rendre();
        anticiperVedette();
      } else if (vedetteCourante()?.id === p.id) peindreVedette();
      else anticiperVedette();
    }).catch(() => {
    });
  };
  let tourVedette = 0;
  const peindreVedette = async () => {
    if (racine.hidden || m.vue !== "etageres") return;
    const contenu = $(".vedette-contenu"), tour = ++tourVedette, anciennes = [...contenu.children];
    anciennes.forEach((x) => {
      x.inert = true;
      x.querySelectorAll("[data-a]").forEach((b) => b.removeAttribute("data-a"));
    });
    contenu.insertAdjacentHTML("beforeend", contenuVedette());
    const nouvelle = contenu.lastElementChild;
    nouvelle.style.opacity = "0";
    ombre.querySelectorAll("[data-page-vedette]").forEach((el) => {
      const on = +el.dataset.pageVedette === pageVedette;
      el.classList.toggle("on", on);
      el.setAttribute("aria-pressed", String(on));
    });
    m.marquer();
    await imagerie.preparer(nouvelle.querySelectorAll("[data-image]"));
    if (tour !== tourVedette || !nouvelle.isConnected) return;
    nouvelle.style.opacity = "";
    if (anciennes.length && !window.__pcvReduit()) {
      anciennes.forEach((x) => x.querySelector(".vedette-texte")?.animate({ opacity: [1, 0] }, { duration: 160, fill: "forwards" }));
      nouvelle.querySelector(".vedette-texte")?.animate({ opacity: [0, 0, 1], offset: [0, 0.4, 1] }, { duration: 400, easing: "ease-out" });
      await nouvelle.animate({ opacity: [0, 1], transform: ["translateX(2%)", "none"] }, { duration: 400, easing: "ease-out" }).finished.catch(() => {
      });
    }
    if (tour === tourVedette) anciennes.forEach((x) => x.remove());
  };
  const avancerVedette = (n, absolu = false) => {
    const choix = choixVedettes();
    if (!choix.length) return;
    pageVedette = ((absolu ? n : pageVedette + n) + choix.length) % choix.length;
    peindreVedette();
    anticiperVedette();
  };
  const lancerVedette = () => {
    arreterVedette();
    if (pauseVedette || m.vue !== "etageres" || racine.hidden || document.hidden || window.__pcvReduit() || choixVedettes().length < 2) return;
    defilement = setInterval(() => {
      if ($(".etageres").scrollTop > innerHeight * 0.55 || $(".vedette .sur-action") || $(".vedette")?.matches(":hover, :focus-within")) return;
      avancerVedette(1);
    }, 8e3);
  };
  const basculerVedette = () => {
    pauseVedette = !pauseVedette;
    if (pauseVedette) arreterVedette();
    else lancerVedette();
    const b = $(".pause-vedette");
    b.innerHTML = ico(pauseVedette ? "lecture" : "pause");
    b.setAttribute("aria-label", T(pauseVedette ? "defiler" : "pause"));
  };
  const jeuxVitrine = () => [...new Map(RAYONS.flatMap((k) => catalogue?.[k] || []).map((p) => [p.id, p])).values()];
  const rendreEntree = (ajouter2) => {
    entree.innerHTML = [["jeux", "manette", "orange", lancerJeux], ["plugins", "prise", "c-telech", () => univers("plugins")], ["themes", "nuancier", "vert", () => univers("themes")]].map(([k, ic, couleur, faire], i) => `<button class="pcv-choix-relief" data-a="${ajouter2(() => {
      choixEntree = i;
      faire();
    })}">${I.relief(ic, couleur)}<span>${e(T(k))}</span></button>`).join("");
  };
  const avantAccueil = () => {
    actionVedette = ajouter(() => ouvrirFiche(vedetteCourante(), jeux));
    return `<div class="message" role="status">${e(message())}</div><header class="entete-jeux"><h1>${e(T("prochaine_aventure"))}</h1></header>` + (vedetteCourante() ? `<section class="vedette verre" aria-label="${e(T("vedettes"))}" aria-roledescription="${e(T("carrousel"))}"><div class="vedette-contenu">${contenuVedette()}</div><div class="commandes-vedette verre">${bouton(T("precedent"), "precedent", () => avancerVedette(-1), "commande")}${choixVedettes().map((p, i) => `<button class="commande point${i === pageVedette ? " on" : ""}" data-page-vedette="${i}" data-a="${ajouter(() => avancerVedette(i, true))}" aria-label="${e(p.nom)}" aria-pressed="${i === pageVedette}"><span></span></button>`).join("")}${bouton(T(pauseVedette ? "defiler" : "pause"), pauseVedette ? "lecture" : "pause", basculerVedette, "commande pause-vedette")}${bouton(T("suivant"), "fleche", () => avancerVedette(1), "commande")}</div></section>` : "") + `<section class="rayon"><h3><span class="pastille">${ico("bibliotheque")}</span>${e(T("comment_jouer"))}</h3><nav class="categories-jeux" aria-label="${e(T("categories"))}">${CATEGORIES.map(([k, ic]) => `<button class="categorie-jeu verre" data-g="categorie-${k}" data-a="${ajouter(() => ouvrirGrille(k))}">${I.relief(ic, "orange")}<span>${e(T(k))}</span></button>`).join("")}</nav></section>`;
  };
  const etageresAccueil = () => [...souhaits ? ["souhaits"] : [], ...RAYONS].map((k) => {
    const l = (k === "souhaits" ? souhaits : catalogue?.[k] || []).filter(admissible);
    return {
      cle: k,
      titre: T(k === "souhaits" ? "ma_liste" : k),
      icone: k === "souhaits" ? "epingle" : "bibliotheque",
      items: l,
      ouvrir: (p) => ouvrirFiche(p, l),
      tout: () => ouvrirGrille(k),
      toujours: true,
      vide: `<div class="message" role="status">${e(T(k === "souhaits" ? "souhaits_vide" : "vide"))}</div>`
    };
  });
  const ailleurs = (nom, x = null, l = null) => {
    universActif = nom;
    cacher();
    const r = () => {
      universActif = null;
      montrer();
    };
    if (nom === "plugins") window.__pcvEshop.ouvrir(x?.nom ?? null, r, m.texte);
    else window.__pcvEshopThemes.ouvrirDepuis(r, m.texte, x, l);
  };
  const SORTES = [
    ["jeux", "manette", (p) => p.id, (p, c, a) => tuile(p, c, a), (p, l) => ouvrirFiche(p, l), () => {
      retourGrille = m.texte;
      rechercher(m.texte);
    }],
    ["plugins", "prise", (p) => p.nom, (p, c, a) => `<button class="cel" aria-label="${e(p.nom)}" ${a}><span class="im nomme" style="--fond:${window.__pcvEshop.fond(p)}"${p.image ? ` data-image="${e(p.image)}"` : ""}>${P.repliTuile(p.nom, ico("prise"), c)}</span></button>`, (p) => ailleurs("plugins", p), () => ailleurs("plugins")],
    ["themes", "nuancier", (t) => t.site + ":" + t.id, (t, c, a) => window.__pcvEshopThemes.tuile(t, c, a), (t, l) => ailleurs("themes", t, l), () => ailleurs("themes")]
  ];
  const etageresResultats = () => SORTES.map(([k, ic, id, peindre, ouvrirUn, toutVoir]) => {
    const l = k === "jeux" ? trouves[k]?.filter(admissible) : trouves[k];
    return {
      cle: k,
      titre: T(k),
      icone: ic,
      nombre: l?.length ?? "",
      items: l || [],
      id,
      tuile: peindre,
      ouvrir: (x) => ouvrirUn(x, l),
      tout: toutVoir,
      vide: `<div class="message" role="status">${e(T(l ? "aucun" : "recherche_en_cours"))}</div>`
    };
  });
  const chercherTout = (mot) => {
    m.texte = mot.slice(0, 80);
    clearTimeout(delaiRecherche);
    const id = ++rechercheTout, texte = m.texte;
    if (!texte.trim()) {
      m.vue = "entree";
      m.sel = choixEntree;
      return m.rendre();
    }
    m.vue = "resultats";
    m.sel = 0;
    $(".etageres").scrollTop = 0;
    trouves = { jeux: null, plugins: null, themes: null };
    m.rendre();
    const premier = () => $(".etageres .piste [data-a]")?.dataset.a;
    const poser = (k, v) => {
      if (id !== rechercheTout) return;
      const auDebut = premier() == m.sel;
      trouves[k] = Array.isArray(v) ? v : [];
      if (m.vue === "resultats") {
        m.rendre();
        if (auDebut && premier() != null) {
          m.sel = +premier();
          m.marquer();
        }
      }
    };
    delaiRecherche = setTimeout(() => {
      (async () => {
        contexte ||= await region();
        return (await obtenir("recherche", 0, texte)).donnees;
      })().then((v) => poser("jeux", v), () => poser("jeux", []));
      Promise.resolve(window.__pcvEshop?.chercher(texte)).then((v) => poser("plugins", v), () => poser("plugins", []));
      Promise.resolve(window.__pcvEshopThemes?.chercher(texte, () => window.__pcvEshopThemes.peindre(m.ombre))).then((v) => poser("themes", v), () => poser("themes", []));
    }, 300);
  };
  const options = () => estSouhaits() ? SOUHAITS.map(([k]) => k) : m.texte.trim() ? ["tous", ...CATEGORIES.map(([k]) => k)] : ["tous", ...RAYONS, ...CATEGORIES.map(([k]) => k)];
  const parNom = (a, b) => (P.lettreDe(a.nom) !== "#") - (P.lettreDe(b.nom) !== "#") || String(a.nom ?? "").localeCompare(String(b.nom ?? ""));
  const liste = () => (estSouhaits() ? ((l, tri) => tri ? l.sort(tri) : l)((souhaits || []).slice(), SOUHAITS.find(([k]) => k === m.onglet)[2]) : m.texte.trim() && m.onglet === "tous" ? jeux : m.onglet === "tous" ? complet.jeux : CATS.includes(m.onglet) ? ((ids) => complet.jeux.filter((p) => p.c & 1 << CATS.indexOf(m.onglet) && (!ids || ids.has(p.id))))(m.texte.trim() && new Set(jeux.map((p) => p.id))) : (catalogue?.[m.onglet] || []).slice().sort(parNom)).filter(admissible);
  const enCours = () => !m.texte.trim() && (m.onglet === "tous" || CATS.includes(m.onglet)) && (complet.partiel || complet.etat === "construction") && complet.jeux.length;
  const entete = () => {
    const nombre = m.lignes.length, cle = [m.onglet, m.texte, nombre, enCours() && complet.fait].join("|");
    if (cle === enteteFaite) return;
    enteteFaite = cle;
    const typeCategorie = CATEGORIES.find(([k]) => k === m.onglet), texte = m.texte;
    enteteCatalogue.innerHTML = `${I.relief(texte.trim() ? "recherche" : typeCategorie?.[1] || (estSouhaits() ? "epingle" : "bibliotheque"), "orange")}<div><h1>${e(T(texte.trim() ? "resultats" : m.onglet === "tous" ? "tous_jeux" : estSouhaits() ? "ma_liste" : m.onglet))}</h1><p>${e(texte.trim() ? T("resultats_pour", { texte, n: m.lignes.length }) : nombre == null ? "" : T(estSouhaits() ? "souhaits_nombre" : "nombre_jeux", { n: nombre.toLocaleString(contexte?.langue) }))}</p>${enCours() ? `<small>${e(T("catalogue_partiel", { n: complet.fait || 0 }))}</small>` : ""}</div>`;
  };
  const onglets = () => options().map((k) => ({ cle: k, nom: T(k), icone: CATEGORIES.some(([c]) => c === k) ? I.relief(CATEGORIES.find(([c]) => c === k)[1], "orange") : ico(SOUHAITS.find(([s]) => s === k)?.[1] || (k === "tous" ? "bibliotheque" : "boutique")) }));
  const rendreAchat = (p, d) => `<div class="achat-scene"><section class="achat-jeu">${tuile(p, tailleRayon().c, `style="${cotes(tailleRayon().c)}"`)}<span class="surtitre">${e(T("acheter"))}</span><h2>${e(p.nom)}</h2><p>${e(T(d.materiel ? "retrouver_materiel" : "retrouver_jeu"))}</p></section><section class="destination-achat verre"><span class="surtitre">${e(T("boutique_officielle"))}</span><div class="boutique-directe">${I.relief("boutique", "orange")}<h3>Steam</h3></div><div class="prix-discret">${e(d.gratuit ? T("gratuit") : d.prix.actuel || T(d.bientot ? "prix_sur_steam" : "non_disponible"))}${barre(d.prix)}</div>${bouton(T("ouvrir_boutique"), "boutique", () => O.SteamClient.URL.ExecuteSteamURL(`steam://store/${p.id}`), "gros-r")}<p>${e(T(d.materiel ? "ouvrir_steam" : d.bientot ? "jeu_a_venir" : "ouvrir_steam"))}</p></section></div>`;
  const contenuFiche = (p) => {
    const d = details.get(p.id);
    if (sousPage === "achat" && d) return rendreAchat(p, d);
    if (sousPage === "description" && d) return `<header class="titre-fiche"><h1 class="nom-jeu">${e(p.nom)}</h1>${bouton(T("retour"), "precedent", () => changerSousPage(""))}</header><p class="description-longue">${e(d.detail || d.description)}</p>${P.mentionAnglais(d.detail ? d.detail_anglais : d.description_anglaise)}`;
    const captures = medias(), numero = Math.min(captureFiche, Math.max(0, captures.length - 1));
    const grandeImage = `<span class="capture-principale" ${image(captures[numero]?.petite && captures[numero]?.nom != null ? captures[numero].petite : captures[numero]?.grande || p.image, "panorama")}></span>`;
    const grande = captures.length ? `<button class="banniere" aria-label="${e(T("agrandir"))}" data-a="${ajouter(() => ouvrirGalerie(captureFiche))}">${grandeImage}${captures[numero]?.nom != null ? `<span class="marque-video">${ico("lecture")}</span>` : ""}<span class="indication-zoom verre">${ico("recherche")}${e(T("agrandir"))}</span></button>` : `<div class="banniere">${grandeImage}</div>`;
    const miniatures = captures.length ? `<div class="caps">${captures.map((s, i) => `<button class="verre${i === numero ? " on" : ""}" aria-label="${e(s.nom || T("capture", { n: i + 1 }))}" aria-pressed="${i === numero}" data-capture="${i}" data-a="${ajouter(() => {
      choisirCapture(i);
      ouvrirGalerie(i);
    })}" ${image(s.petite || s.grande, "miniature")}>${s.nom != null ? `<span class="marque-video">${ico("lecture")}</span>` : ""}</button>`).join("")}</div>` : "";
    const acheter = d ? bouton(T(d.materiel ? "ou_acheter" : "acheter"), "boutique", () => changerSousPage("achat"), "gros-r") : "";
    const dansListe = souhaits && souhaits.some((s) => s.id === p.id), souhait = d && souhaits ? bouton(T(dansListe ? "souhaits_retirer" : "souhaits_ajouter"), "epingle", () => changerSouhait(p, dansListe)) : "";
    const infos = d ? `<div class="genres-jeu">${d.genres.map((g) => `<span>${e(g.nom)}</span>`).join("")}</div><p class="resume">${e(d.description)}</p>${P.mentionAnglais(d.description_anglaise)}<div class="modes-jeu">${modes(d)}</div><dl class="metadonnees">${[["sortie", d.date], ["developpeurs", d.developpeurs.join(", ")], ["editeurs", d.editeurs.join(", ")]].filter(([, v]) => v).map(([k, v]) => `<div><dt>${e(T(k))}</dt><dd>${e(v)}</dd></div>`).join("")}</dl>${d.note || d.avis ? `<div class="notes-jeu">${d.note ? `<span class="note-critique" aria-label="${e(T("note", { n: d.note }))}"><b>${e(d.note)}</b><small>/ 100<br>Metacritic</small></span>` : ""}${d.avis ? `<span>${e(T("avis_steam", { n: d.avis.toLocaleString(contexte.langue) }))}</span>` : ""}</div>` : ""}${bouton(T("description"), "fleche", () => changerSousPage("description"))}` : `<p class="message" role="status">${e(erreur || (details.has(p.id) ? T("fiche_indisponible") : T("chargement")))}</p>`;
    return `<header class="titre-fiche"><h1 class="nom-jeu">${e(p.nom)}</h1>${souhait}${acheter}</header><div class="detail-jeu"><section class="galerie-jeu" aria-label="${e(T("captures"))}">${grande}${miniatures}</section><section class="description-fiche">${infos}</section></div>`;
  };
  const choisirCapture = (i, calme) => {
    const s = medias()[i];
    if (!s) return;
    captureFiche = i;
    $(".capture-principale").dataset.image = s.nom != null ? s.petite : s.grande;
    $(".banniere .marque-video")?.remove();
    if (s.nom != null) $(".banniere").insertAdjacentHTML("beforeend", `<span class="marque-video">${ico("lecture")}</span>`);
    ombre.querySelectorAll("[data-capture]").forEach((el) => {
      const on = +el.dataset.capture === i;
      el.classList.toggle("on", on);
      el.setAttribute("aria-pressed", String(on));
      if (on) el.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "smooth" });
    });
    observerImages();
    if (!calme) m.marquer();
  };
  const croixFiche = (b) => {
    const c = $(".contenu"), tete = [...c.querySelectorAll(".titre-fiche [data-a]")], G = c.querySelector(".banniere[data-a]"), caps = [...c.querySelectorAll(".caps [data-a]")], M = c.querySelector(".description-fiche [data-a]"), ici = c.querySelector(`[data-a="${m.sel}"]`), i = tete.indexOf(ici), j = caps.indexOf(ici);
    const capture = caps.find((x) => x.classList.contains("on")) || caps[0];
    const v = i >= 0 ? { 11: tete[i - 1], 12: tete[i + 1], 10: M || G }[b] : ici && ici === G ? { 9: tete[0], 10: capture, 12: M || tete.at(-1) }[b] : j >= 0 ? { 9: G || tete[0], 11: caps[j - 1], 12: caps[j + 1] || M }[b] : ici && ici === M ? { 9: tete[0], 11: capture || G }[b] : tete[0] || G || capture || M;
    if (!v) {
      if (b === 9) window.__pcvBarreEntrer?.(m.marquer);
      else window.__pcvSon?.("bord");
      return true;
    }
    m.sel = +v.dataset.a;
    m.marquer();
    m.legende();
    return true;
  };
  let choixFiche = 0;
  const changerSousPage = (nom) => {
    if (nom) choixFiche = m.sel;
    sousPage = nom;
    m.sel = nom ? 0 : choixFiche;
    $(".contenu").scrollTop = 0;
    m.rendreFiche();
  };
  const ouvrirGrille = (k) => m.ouvrirGrille(k);
  const choisir = (k) => {
    arreterVedette();
    if (!m.texte.trim()) {
      rechercheId++;
      clearTimeout(delaiRecherche);
      chargement = false;
    }
    if (k === "tous" || CATS.includes(k)) chargerCatalogue();
  };
  const ouvrirFiche = (p, listeVoisins) => {
    if (!p) return;
    arreterVedette();
    sousPage = "";
    captureFiche = 0;
    erreur = "";
    m.ouvrirFiche(p, listeVoisins);
  };
  const chargerFiche = async (p) => {
    if (details.has(p.id)) return;
    const generation = session;
    try {
      await detail(p);
    } catch (_) {
      if (generation === session && m.fiche?.id === p.id) erreur = T("fiche_indisponible");
    }
    if (generation === session && m.vue === "fiche" && m.fiche.id === p.id) {
      m.voisins = m.voisins.filter((v) => admissible(v) || v.id === p.id);
      m.rendreFiche();
    }
  };
  const vues = { entree: { zone: null, rendre: (ajouter2) => rendreEntree(ajouter2) } };
  const m = P.magasin({
    id: "pcv-eshop-unifie",
    nom: "boutique",
    cle: (p) => p.id,
    tuile,
    style: `
    .entree { position:absolute;inset:${u(140)} ${u(80)} ${u(100)};display:flex;align-items:center;justify-content:center;gap:${u(48)}; }
    
    :host .cel.jeu .im { display:flex;align-items:center;justify-content:center;overflow:hidden;background-image:var(--fond); }
    .im > svg { width:45%;height:45%;color:var(--pcv-sur-accent); }
    
    .etageres, .vue-page .contenu { touch-action:pan-x pan-y; }
    
    .banniere, .galerie-image, .caps { touch-action:pan-y; }
    .entete-jeux, .titre-fiche { display:flex;align-items:center;justify-content:space-between;gap:${u(24)};margin-bottom:${u(20)}; }   
    h1, h2, p { margin:0; } .entete-jeux h1 { font-size:${u(28)};line-height:1.2; }
    .og { font-weight:900; }
    .vedette + .rayon { margin-top:${u(22)}; }
    .og svg { font-size:${u(20)}; }
    .vedette { position:relative;height:${u(300)};border-radius:${u(28)};padding:${u(6)}; }
    .vedette-contenu { height:100%;border-radius:${u(23)};overflow:hidden;position:relative; }
    .vedette-couche { position:absolute;inset:0; }
    .vedette-image { position:absolute;inset:0;background:var(--pcv-creux); }
    .vedette-image img { width:100%;height:100%;object-fit:cover; }
    .vedette-image::after { content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--pcv-carte) 8%,color-mix(in srgb,var(--pcv-carte) 94%,transparent) 24%,transparent 76%); }
    .vedette-texte { position:relative;width:54%;height:100%;padding:${u(20)} ${u(30)};display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:${u(8)}; }
    .surtitre { color:var(--pcv-orange);font-size:${u(13)};font-weight:900; }
    .vedette-texte > * { flex:none;max-width:100%; }
    .vedette-texte > small { font-size:${u(13)};line-height:1.3; }
    .vedette h2 { font-size:${u(30)};font-weight:900;line-height:1.15;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
    .vedette-texte p { font-size:${u(16)};line-height:1.45;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
    .decouvrir { display:flex;align-items:center;gap:${u(9)};min-height:${u(38)};padding:0 ${u(12)};border-radius:${u(20)};font-size:${u(16)};font-weight:900; }
    .commandes-vedette { position:absolute;right:${u(18)};bottom:${u(18)};display:flex;align-items:center;padding:${u(3)};gap:${u(4)};border-radius:${u(28)}; }
    .commande { width:${u(36)};height:${u(36)};display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:${u(18)}; }
    .point span { width:${u(8)};height:${u(8)};border-radius:${u(6)};background:var(--pcv-texte2); }
    .point.on span { width:${u(20)};background:var(--pcv-cyan-plein); }
    .categories-jeux { display:flex;gap:${u(12)};padding:${u(7)}; }
    .categorie-jeu { flex:1;min-width:0;min-height:${u(62)};display:flex;align-items:center;gap:${u(8)};border-radius:${u(19)};padding:${u(5)} ${u(8)} ${u(5)} ${u(5)};font-size:${u(14)};font-weight:900;line-height:1.2; }
    .categorie-jeu .pcv-marque-relief { --pcv-relief-taille:${u(46)}; }
    
    .categorie-jeu { container-type:inline-size; } .categorie-jeu span:last-child { overflow-wrap:anywhere;font-size:min(${u(14)}, (100cqi - ${u(54)}) / 6.4); }
    .vue-page .carrousel { top:${u(88)};height:${u(150)}; }
    .vue-page .carrousel .cel { top:${u(12)}; }
    .vue-page .fleche-c { top:${u(132)}; }
    .vue-page .carte { left:${u(40)};right:${u(40)};top:${u(250)};bottom:${u(88)};padding:0;background:none;box-shadow:none;border-radius:0;display:block;overflow:visible; }
    .vue-page .contenu { height:calc(100% + 2 * var(--pcv-marge-ombre));display:block; }   
    .titre-fiche { min-height:${u(58)}; }
    .titre-fiche .nom-jeu { min-width:0;flex:1;overflow-wrap:anywhere;position:static;text-align:left;font-size:${u(29)};font-weight:900;line-height:1.15;white-space:normal;overflow:visible; }
    .detail-jeu { display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:${u(28)};align-items:start; }
    .detail-jeu > * { min-width:0; } .description-fiche { font-size:${u(16)};font-weight:800; }
    .genres-jeu { display:flex;flex-wrap:wrap;gap:${u(12)};margin-bottom:${u(12)};font-size:${u(13)}; }
    .genres-jeu span { border-bottom:${u(2)} solid var(--pcv-orange);padding-bottom:${u(5)}; }
    .resume { line-height:1.48;white-space:pre-wrap; }
    .modes-jeu { display:flex;flex-wrap:wrap;gap:${u(10)} ${u(16)};margin:${u(10)} 0; }
    .mode-jeu { display:inline-flex;align-items:center;gap:${u(6)};font-size:${u(13)};font-weight:900; }
    .mode-jeu svg { color:var(--pcv-orange);font-size:${u(17)}; }
    .metadonnees { display:grid;gap:${u(7)};font-size:${u(13)};margin:${u(17)} 0; }
    .metadonnees > div { display:grid;grid-template-columns:${u(95)} minmax(0,1fr);gap:${u(10)}; }
    .metadonnees dt { color:var(--pcv-texte2); } .metadonnees dd { margin:0;font-weight:900;overflow-wrap:anywhere; }
    .notes-jeu { display:flex;align-items:center;flex-wrap:wrap;gap:${u(16)};padding:${u(12)} 0;border-top:1px solid color-mix(in srgb,var(--pcv-orange) 28%,transparent);font-size:${u(12)}; }
    .note-critique { display:flex;align-items:center;gap:${u(7)}; } .note-critique b { font-size:${u(28)};color:var(--pcv-orange); }
    .note-critique small { font-size:${u(11)}; }
    .banniere { position:relative;display:block;width:100%;height:auto;aspect-ratio:2.45;overflow:hidden;padding:${u(5)};border-radius:${u(24)};background:var(--pcv-verre);box-shadow:var(--pcv-reflet),var(--pcv-ombre); }
    .capture-principale { display:block;width:100%;height:100%;overflow:hidden;border-radius:${u(19)};background:var(--pcv-creux); }
    .capture-principale img { width:100%;height:100%;object-fit:cover; }
    .indication-zoom { position:absolute;right:${u(14)};bottom:${u(14)};display:flex;align-items:center;gap:${u(7)};padding:${u(7)} ${u(12)};border-radius:${u(24)};font-size:${u(13)};font-weight:900; }
    
    .caps { padding:var(--pcv-marge-ombre);margin:calc(${u(15)} - var(--pcv-marge-ombre)) calc(${u(7)} - var(--pcv-marge-ombre)) calc(${u(7)} - var(--pcv-marge-ombre));overflow-x:auto;scrollbar-width:none;gap:${u(12)};pointer-events:none;
      scroll-padding-inline:var(--pcv-marge-ombre);clip-path:inset(0 calc(var(--pcv-marge-ombre) - ${u(12)})); } .caps > * { pointer-events:auto; }   
    .caps button { flex:0 0 calc((100% - ${u(36)}) / 4);height:auto;aspect-ratio:2.45;border-radius:${u(14)};padding:${u(3)};overflow:hidden; }
    .caps button img { width:100%;height:100%;object-fit:cover;box-shadow:none;display:block;border-radius:${u(11)}; }
    .caps button { position:relative; } .marque-video { position:absolute;inset:0;display:grid;place-items:center;color:var(--pcv-sur-accent);font-size:${u(32)};pointer-events:none; }
    
    .caps .on::after { content:"";position:absolute;left:35%;right:35%;bottom:${u(8)};height:${u(5)};border-radius:${u(3)};background:var(--pcv-cyan-plein);box-shadow:0 0 0 ${u(2)} var(--pcv-anneau-c); }
    .vue-page .contenu > .achat-scene { padding:${u(8)}; }
    .gros-r { font-size:${u(18)};height:${u(54)};padding:0 ${u(24)};gap:${u(12)};box-shadow:var(--pcv-bombe),var(--pcv-ombre); }
    .gros-r svg { font-size:${u(22)}; }
    
    .banniere.sur-action, .gros-r.sur-action { box-shadow:var(--pcv-reflet),var(--pcv-curseur); }
    .description-longue { white-space:pre-wrap;line-height:1.55;font-size:${u(17)};max-width:${u(900)}; }
    .description-fiche .og { margin-top:${u(8)};font-size:${u(14)}; }
    .achat-scene { display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:${u(64)};align-items:center;min-height:${u(380)};max-width:${u(980)};margin:auto; }
    .achat-jeu h2 { margin:${u(16)} 0 ${u(10)};font-size:${u(30)};line-height:1.15; }
    .achat-jeu > .cel { margin-bottom:${u(20)};display:block; }
    .achat-jeu p, .destination-achat p { color:var(--pcv-texte2);font-size:${u(15)};line-height:1.5; }
    .destination-achat { padding:${u(30)};border-radius:${u(28)}; }
    .destination-achat h3 { margin:0;font-size:${u(27)}; }
    .boutique-directe { display:flex;align-items:center;gap:${u(20)};margin:${u(20)} 0; }
    .boutique-directe .pcv-marque-relief { --pcv-relief-taille:${u(64)}; }
    .prix-discret { margin-bottom:${u(24)};font-size:${u(18)};font-weight:900; } .prix-discret s { color:var(--pcv-texte2);font-size:${u(14)};margin-left:${u(10)}; }
    
    .prix-tuile { display:none; } :is(.grille-g, .etagere) .prix-tuile { display:block;position:absolute;right:4%;bottom:4%;z-index:2;margin:0;padding:calc(var(--u) * var(--c) * .02) calc(var(--u) * var(--c) * .05);border-radius:calc(var(--u) * var(--c) * .06);
      background:var(--pcv-pastille);box-shadow:var(--pcv-pastille-ombre);font-size:calc(var(--u) * var(--c) * .105);white-space:nowrap; }
    :is(.grille-g, .etagere) .prix-tuile s { font-size:.8em;margin-left:.4em; }
    .titre-fiche h1 { margin-right:auto; }
    .destination-achat .gros-r { display:flex;justify-content:center; } .destination-achat > p { margin-top:${u(18)}; }
    .entete-catalogue { position:absolute;left:${u(44)};right:${u(44)};top:${u(104)};display:flex;align-items:center;gap:${u(18)}; }
    .entete-catalogue .pcv-marque-relief { --pcv-relief-taille:${u(60)}; }
    .entete-catalogue h1 { font-size:${u(28)};line-height:1.2; } .entete-catalogue p { margin-top:${u(6)};font-size:${u(15)};color:var(--pcv-texte2); }
    .entete-catalogue small { display:block;margin-top:${u(4)};font-size:${u(12)};color:var(--pcv-texte2); }
    .vue-grille .onglets { top:${u(188)};left:${u(47)};right:${u(40)};height:${u(58)}; }
    .vue-grille .og-l { gap:${u(10)}; }   
    .vue-grille .og { flex:none;display:flex;align-items:center;gap:${u(8)};height:${u(42)};font-size:${u(14)}; }
    .vue-grille .grille-g { top:${u(254)};bottom:${u(88)}; }
    .vue-grille .rail { top:${u(264)};bottom:${u(88)}; }
    .galerie { position:absolute;inset:${u(112)} ${u(80)} ${u(40)};z-index:20;display:flex;flex-direction:column;align-items:center;gap:${u(16)};padding:${u(20)};border-radius:${u(28)};background:var(--pcv-carte); }
    .galerie-image { flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center; }
    .galerie-image { position:relative;overflow:hidden;background:var(--pcv-creux);border-radius:${u(18)}; }
    .commandes-video { position:absolute;left:${u(20)};right:${u(20)};bottom:${u(12)};display:flex;align-items:center;gap:${u(14)};padding:${u(10)};border-radius:${u(18)};background:var(--pcv-carte); }
    .commandes-video button { font-size:${u(24)};display:flex; } .commandes-video input { flex:1;min-width:0;height:${u(4)};appearance:none;background:linear-gradient(90deg,var(--pcv-orange) var(--progression,0%),var(--pcv-creux) var(--progression,0%));border-radius:${u(2)};cursor:pointer; }
    .commandes-video input::-webkit-slider-thumb { appearance:none;width:${u(12)};height:${u(12)};border-radius:50%;background:var(--pcv-orange); }
    .apercu-video { position:absolute;inset:0;pointer-events:none;display:grid;place-items:center;background:var(--pcv-creux); }
    .apercu-video img { position:absolute;inset:0;width:100%;height:100%;object-fit:contain; }
    .apercu-video span { position:relative;padding:${u(12)};border-radius:${u(18)};background:var(--pcv-carte);font-size:${u(18)}; }
    .galerie-image video { max-width:100%;max-height:100%; } .galerie-image img { max-width:100%;max-height:100%;object-fit:contain; } .galerie-actions { display:flex;gap:${u(16)}; }
`,
    autres: vues,
    porte: (vue) => vue === "etageres" ? { liste: jeux.filter(admissible), titre: T("tous_jeux"), nombre: T("selection_steam"), ouvrir: () => {
      ouvrirGrille("tous");
      P.ouvrirPorte(m.ombre);
    } } : null,
    avant: (vue) => vue === "resultats" ? `<header class="entete-jeux"><h1>${e(T("resultats_tout", { texte: m.texte.trim() }))}</h1></header>` : avantAccueil(),
    etageres: (vue) => vue === "resultats" ? etageresResultats() : etageresAccueil(),
    deplacer: (b, ici) => deplacer(b, ici),
    peindre: (l) => observerImages(l),
    // B des étagères : l'accueil et les résultats remontent aux trois rubriques ; celles-ci ferment la boutique
    retour: () => {
      if (m.vue === "entree") return false;
      entrer();
      return true;
    },
    grille: {
      onglets,
      choisir,
      liste,
      entete,
      message,
      bandeau: true,
      ouvrir: (p) => ouvrirFiche(p, m.lignes),
      nomOnglets: () => T(estSouhaits() ? "trier" : "categories"),
      // (30/10) le rail partout où la grille est par nom : « Tous les jeux », chaque catégorie, chaque rayon
      rail: { visible: () => !m.texte.trim() && (!estSouhaits() || m.onglet === "souhaits_nom") },
      // B de la grille : les résultats de la recherche des trois rubriques d'où l'on vient, sinon l'accueil des jeux
      quitter: () => {
        m.rail.annuler();
        rechercheId++;
        clearTimeout(delaiRecherche);
        if (retourGrille) {
          m.texte = retourGrille;
          retourGrille = "";
          m.vue = "resultats";
          m.sel = 0;
          m.rendre();
          return true;
        }
        m.texte = "";
        m.onglet = "tous";
        jeux = jeuxVitrine();
        return false;
      }
    },
    fiche: {
      rubriques: null,
      contenu: contenuFiche,
      ouverte: (p) => {
        erreur = "";
        chargerFiche(p);
      },
      carrousel: [[92, 26], 126],
      page: (p, n, t) => `${ico("boutique")}${e(T("jeux"))}<small>${n} / ${t}</small>`,
      voisins: () => T("voisins"),
      quitter: () => {
        if (!sousPage) return false;
        changerSousPage("");
        return true;
      },
      touche: (b) => {
        if (b === 3 && !sousPage) {
          ouvrirGalerie(captureFiche);
          return true;
        }
        if (!sousPage && b >= 9 && b <= 12) return croixFiche(b);
        if (sousPage === "description" && (b === 9 || b === 10)) {
          $(".contenu").scrollBy({ top: (b === 10 ? 1 : -1) * innerHeight / 3, behavior: "auto" });
          return true;
        }
        return false;
      }
    },
    libelles: (m2) => ({ a: m2.vue === "fiche" ? T("choisir") : null, x: m2.vue === "fiche" && !sousPage && medias().length ? T("agrandir") : null }),
    apres: (vue) => {
      racine.dataset.ecran = estSouhaits() && (vue === "grille" || vue === "fiche") ? "souhaits" : "";
      if (vue === "etageres") {
        if (!defilement) lancerVedette();
      } else arreterVedette();
    },
    loupe: () => m.vue === "entree" || m.vue === "resultats" ? { texte: m.vue === "entree" ? "" : m.texte, invite: T("chercher_tout"), chercher: chercherTout } : { texte: m.texte, invite: T("chercher"), chercher: rechercher },
    clic: (x) => {
      if (galerie < 0) return false;
      const t = x.target.closest?.("[data-g]");
      if (!t) return true;
      if (t.dataset.g === "son" && videoGalerie) {
        videoGalerie.muted = !videoGalerie.muted;
        actualiserVideo();
        m.legende();
      } else if (t.dataset.g === "lecture") basculerVideo();
      else if (t.dataset.g === "fermer") fermerGalerie();
      else ouvrirGalerie(galerie + +t.dataset.g);
      return true;
    },
    // (01/11, l'auteur) la sélection posée sur une vignette montre sa capture en grand, sans l'ouvrir
    choixFiche: (el) => {
      const c = el?.dataset.capture;
      if (c != null && +c !== captureFiche) choisirCapture(+c, true);
    },
    balayer: (x, a) => {
      if (m.vue !== "fiche" || !a.target.closest?.(".banniere, .galerie-image, .caps") || Math.abs(a.dx) <= Math.abs(a.dy)) return;
      const sens = a.dx < 0 ? 1 : -1;
      if (galerie >= 0) ouvrirGalerie(galerie + sens);
      else {
        const n = medias().length;
        if (n) choisirCapture((captureFiche + sens + n) % n);
      }
    },
    ferme: () => {
      session++;
      rechercheId++;
      clearTimeout(delaiRecherche);
      clearTimeout(attenteCatalogue);
      arreterVedette();
      proches.disconnect();
      imagerie.liberer();
      $(".bloc-etageres").style.visibility = "";
      demandes.clear();
    }
  });
  const { racine, ombre, $ } = m;
  $(".colonne").remove();
  $(".nom-jeu").remove();
  const enteteCatalogue = document.createElement("header");
  enteteCatalogue.className = "entete-catalogue";
  $(".vue-grille").appendChild(enteteCatalogue);
  const entree = vues.entree.zone = document.createElement("div");
  entree.className = "entree";
  ombre.appendChild(entree);
  const imagerie = P.images({ racine, ombre, charger: (url) => appel("eshop_image", url) });
  const CDN_STEAM = /^https:\/\/(shared|cdn)\.(akamai\.|fastly\.|cloudflare\.)?steamstatic\.com\//;
  const imagesTuile = (el) => ({ repli: el.dataset.repli, charger: (url) => CDN_STEAM.test(url) ? Promise.resolve({ image: url }) : appel("eshop_image", url) });
  const jeuDe = (el) => ({ appid: +el.dataset.p, app_type: 1, display_name: el.parentElement?.getAttribute("aria-label") || "" });
  const proches = new IntersectionObserver((entrees) => {
    for (const x of entrees) if (x.isIntersecting) {
      const el = x.target;
      proches.unobserve(el);
      if (racine.hidden || !el.isConnected) continue;
      window.__pcvJeux.peindre(
        el,
        jeuDe(el),
        +el.dataset.c,
        false,
        imagesTuile(el)
      );
    }
  }, { root: null, rootMargin: "100px" });
  const imagesCatalogue = /* @__PURE__ */ new Map();
  const demanderImages = (els) => {
    const ids = [...new Set(els.map((el) => +el.dataset.p))].filter((id) => !imagesCatalogue.has(id)).slice(0, 60);
    ids.forEach((id) => imagesCatalogue.set(id, ""));
    if (!ids.length) return;
    obtenir("images", 0, ids.join(",")).then((r) => {
      for (const [id, url] of Object.entries(r.donnees || {})) imagesCatalogue.set(+id, url);
    }, () => {
    }).finally(() => {
      if (racine.hidden) return;
      for (const el of els) if (el.isConnected) {
        el.dataset.repli = imagesCatalogue.get(+el.dataset.p) || "";
        proches.observe(el);
      }
    });
  };
  const observerImages = (nouveaux) => {
    imagerie.observer(nouveaux || void 0);
    proches.disconnect();
    const sans = [];
    ombre.querySelectorAll(".im[data-p]").forEach((el) => {
      if (el.dataset.appid) return;
      if (el.dataset.repli || imagesCatalogue.get(+el.dataset.p)) proches.observe(el);
      else sans.push(el);
    });
    if (sans.length) demanderImages(sans);
  };
  const preparerPremierEcran = () => {
    const tuiles = P.premierEcran($(".etageres"), ombre.querySelectorAll(".im[data-p]"), m.porte);
    const panoramas = P.premierEcran($(".etageres"), ombre.querySelectorAll("[data-image]"));
    return Promise.all([imagerie.preparer(panoramas), ...tuiles.map((el) => window.__pcvJeux.preparer(
      el,
      jeuDe(el),
      +el.dataset.c,
      imagesTuile(el)
    ))]);
  };
  let resteAccueil = null;
  const preparerReste = () => {
    if (resteAccueil?.generation === session) return resteAccueil.promesse;
    const generation = session;
    const promesse = (async () => {
      for (const el of ombre.querySelectorAll(".bloc-etageres .im[data-p]")) {
        if (mort || generation !== session || racine.hidden) return;
        if (el.isConnected && !el.dataset.appid) await window.__pcvJeux.preparer(el, jeuDe(el), +el.dataset.c, imagesTuile(el));
      }
    })();
    resteAccueil = { generation, promesse };
    return promesse;
  };
  window.__pcvTuilesBoutique = (id) => racine.hidden ? [] : ombre.querySelectorAll(id == null ? ".im[data-appid], .pcv-anim-dessus, video.pcv-anim" : `.im[data-appid="${id}"]`);
  let vitrinePreparee = null, preparationBoutique = null;
  const chargerVitrine = async () => {
    const c = await region().catch(() => {
      throw Error("region");
    });
    const [r, s] = await Promise.all([appel("eshop_jeux", "vitrine", c.pays, c.langue), lireSouhaits(c).catch(() => false), lireMasque()]);
    if (!r || r.erreur) throw Error("Steam");
    return { contexte: c, reponse: r, souhaits: s };
  };
  let complet = { etat: "absent", jeux: [], version: "", fait: 0, total: 0 }, attenteCatalogue = 0, lectureCatalogue = null, descripteurs = /* @__PURE__ */ new Map();
  const chargerCatalogue = () => lectureCatalogue ||= (async () => {
    clearTimeout(attenteCatalogue);
    try {
      contexte ||= await region();
      const r = (await obtenir("catalogue", 0, complet.version)).donnees;
      if (typeof r.jeux === "string") {
        complet.jeux = r.jeux ? r.jeux.split("\n").map((l) => {
          const [id, lt, nom, d, c] = l.split("	");
          return { id: +id, l: lt, nom, d: +d, c: +c };
        }) : [];
        descripteurs = new Map(complet.jeux.map((p) => [p.id, p.d]));
      }
      Object.assign(complet, { etat: r.etat, version: r.version || complet.version, fait: r.fait, total: r.total, partiel: !!r.partiel });
    } catch (_) {
      complet.etat = "erreur";
    } finally {
      lectureCatalogue = null;
    }
    if (complet.etat === "construction" || complet.partiel) attenteCatalogue = setTimeout(() => {
      if (!racine.hidden) chargerCatalogue();
    }, complet.jeux.length ? 15e3 : 3e3);
    if (!racine.hidden && m.vue === "grille" && (CATS.includes(m.onglet) || m.onglet === "tous" && !m.texte.trim())) m.rendreGrille();
  })();
  const poserVitrine = ({ contexte: c, reponse: r, souhaits: s }) => {
    souhaits = s;
    if (contexte?.pays !== c.pays || contexte?.langue !== c.langue) details.clear();
    contexte = c;
    catalogue = r.donnees;
    jeux = [...new Map(RAYONS.flatMap((k) => catalogue[k] || []).map((p) => [p.id, p])).values()];
    erreur = r.ancien ? T("hors_ligne") : "";
    chargement = false;
  };
  const preparerVedette = async (generation) => {
    const choix = choixVedettes();
    if (!choix.length) return;
    const fiches = await Promise.all(choix.map((p) => detail(p).catch(() => void 0)));
    if (mort || generation !== session || !["entree", "etageres"].includes(m.vue)) return;
    if (fiches.includes(null)) {
      if (m.vue === "etageres") m.rendre();
      else m.preparerEtageres();
      return preparerVedette(generation);
    }
    const contenu = $(".vedette-contenu");
    if (!contenu) return;
    contenu.innerHTML = contenuVedette();
    contenu.insertAdjacentHTML("beforeend", `<div hidden>${choix.filter((p) => p !== vedetteCourante()).map((p) => `<div ${image(banniere(p), "panorama")}></div>`).join("")}</div>`);
    await imagerie.preparer(contenu.querySelectorAll("[data-image]"));
  };
  const preparerBoutique = () => {
    if (preparationBoutique?.generation === session) return preparationBoutique.promesse;
    const generation = session;
    const promesse = (async () => {
      const v = await chargerVitrine();
      vitrinePreparee = { ...v, generation };
      if (mort || generation !== session || m.vue !== "entree") return;
      details.clear();
      poserVitrine(v);
      pageVedette = 0;
      const bloc = $(".bloc-etageres");
      bloc.style.visibility = "hidden";
      bloc.hidden = false;
      $(".etageres").scrollTop = 0;
      try {
        m.preparerEtageres();
        await Promise.all([preparerPremierEcran(), preparerVedette(generation)]);
      } finally {
        if (generation === session) {
          bloc.style.visibility = "";
          if (m.vue === "entree") bloc.hidden = true;
        }
      }
    })();
    preparationBoutique = { generation, promesse };
    return promesse;
  };
  const premieresEtageres = () => Promise.all([...ombre.querySelectorAll(".bloc-etageres .etagere")].slice(0, 2).flatMap((s) => [...s.querySelectorAll(".im[data-p]")]).filter((el) => !el.dataset.appid).map((el) => window.__pcvJeux.preparer(el, jeuDe(el), +el.dataset.c, imagesTuile(el))));
  (window.__pcvPreparer ||= {}).eshop = () => Promise.allSettled([
    preparerBoutique().then(async () => {
      await premieresEtageres();
      preparerReste();
    }),
    window.__pcvEshop.preparer(),
    window.__pcvThemes.preparerBoutique(),
    window.__pcvEshopThemes?.preparer(),
    lireMasque(),
    chargerCatalogue()
  ]);
  const lancerJeux = () => chargerJeux();
  const chargerJeux = async () => {
    session++;
    const generation = session;
    m.vue = "etageres";
    m.sel = 0;
    m.texte = "";
    m.onglet = "tous";
    catalogue = null;
    jeux = [];
    demandes.clear();
    pageVedette = 0;
    pauseVedette = false;
    $(".etageres").scrollTop = 0;
    $(".bloc-etageres").style.visibility = "";
    erreur = "";
    chargement = true;
    m.rendre();
    try {
      await preparationBoutique?.promesse.catch(() => {
      });
      const preparee = vitrinePreparee?.generation === generation - 1 && vitrinePreparee.contexte.langue === window.__pcvLangue() ? vitrinePreparee : null;
      const v = preparee || await chargerVitrine();
      vitrinePreparee = null;
      if (generation !== session) return;
      if (!preparee) details.clear();
      poserVitrine(v);
      m.rendre();
      await Promise.all([preparerPremierEcran(), preparerVedette(generation)]);
      if (generation !== session) return;
      preparerReste();
      anticiperVedette();
      lancerVedette();
    } catch (e2) {
      if (generation === session) {
        erreur = T(e2.message === "region" ? "region_indisponible" : "hors_ligne");
        chargement = false;
        m.rendre();
      }
    }
  };
  const rechercher = (mot) => {
    m.rail.annuler();
    const id = ++rechercheId, generation = session;
    clearTimeout(delaiRecherche);
    arreterVedette();
    const texte = m.texte = mot.slice(0, 80);
    m.vue = "grille";
    m.onglet = "tous";
    m.sel = 0;
    m.og = -1;
    $(".grille-g").scrollTop = 0;
    if (!texte.trim()) {
      chargement = false;
      jeux = jeuxVitrine();
      m.rendre();
      return;
    }
    jeux = [];
    erreur = "";
    chargement = true;
    m.rendre();
    delaiRecherche = setTimeout(async () => {
      try {
        const r = await obtenir("recherche", 0, texte);
        if (id !== rechercheId || generation !== session) return;
        jeux = r.donnees;
        erreur = r.ancien ? T("hors_ligne") : "";
      } catch (_) {
        if (id !== rechercheId || generation !== session) return;
        erreur = T("hors_ligne");
      }
      chargement = false;
      if (m.vue === "grille") m.rendre();
    }, 300);
  };
  const chargerShaka = () => window.shaka ? Promise.resolve(window.shaka) : shakaPromesse ||= (async () => {
    const texte = await appel("script_greffon", "shaka");
    if (typeof texte !== "string") throw Error("Shaka absent");
    const url = URL.createObjectURL(new Blob([`(function (exports, module, define) {
${texte}
}).call(window);`], { type: "text/javascript" }));
    try {
      await new Promise((ok, ko) => {
        const script = document.createElement("script");
        script.src = url;
        script.onload = () => {
          script.remove();
          ok();
        };
        script.onerror = () => {
          script.remove();
          ko(Error("Shaka refus\xE9"));
        };
        document.head.appendChild(script);
      });
    } finally {
      URL.revokeObjectURL(url);
    }
    if (!window.shaka) throw Error("Shaka non charg\xE9");
    window.shaka.polyfill.installAll();
    return window.shaka;
  })().catch((e2) => {
    shakaPromesse = null;
    throw e2;
  });
  const libererVideo = () => {
    const v = videoGalerie;
    videoGalerie = null;
    commandesVideo = apercuVideo = null;
    if (lecteurGalerie) {
      const lecteur = lecteurGalerie;
      lecteurGalerie = null;
      lecteur.destroy().catch(() => {
      });
    }
    if (v) {
      v.pause();
      v.removeAttribute("src");
      v.load();
      window.__pcvThemes.attenuer(false);
    }
  };
  const actualiserVideo = () => {
    const v = videoGalerie;
    if (!v || !commandesVideo) return;
    apercuVideo.hidden = !attenteVideo;
    commandesVideo.querySelector('[data-g="lecture"]').innerHTML = ico(v.paused ? "lecture" : "pause");
    commandesVideo.querySelector('[data-g="lecture"]').setAttribute("aria-label", T(v.paused ? "video_lecture" : "pause"));
    commandesVideo.querySelector('[data-g="son"]').innerHTML = ico(v.muted ? "volume-coupe" : "volume");
    commandesVideo.querySelector('[data-g="son"]').setAttribute("aria-label", T(v.muted ? "video_son" : "video_muette"));
    const p = commandesVideo.querySelector("input");
    p.disabled = !Number.isFinite(v.duration) || v.duration <= 0;
    p.value = p.disabled ? 0 : 100 * v.currentTime / v.duration;
    p.style.setProperty("--progression", p.value + "%");
  };
  const basculerVideo = () => {
    if (!videoGalerie) return;
    if (videoGalerie.paused) videoGalerie.play().catch(() => {
    });
    else videoGalerie.pause();
    actualiserVideo();
    m.legende();
  };
  const lireVideo = async (v, media, cadre) => {
    const indisponible = () => {
      if (videoGalerie === v) {
        libererVideo();
        cadre.textContent = T("video_indisponible");
        m.legende();
      }
    };
    for (const n of ["play", "pause", "ended", "error", "waiting", "seeking", "canplay", "playing", "timeupdate", "volumechange", "durationchange"]) v.addEventListener(n, () => {
      if (videoGalerie !== v) return;
      if (n === "error") return indisponible();
      if (["play", "pause", "ended"].includes(n)) window.__pcvThemes.attenuer(n === "play");
      if (["waiting", "seeking"].includes(n)) attenteVideo = true;
      else if (["canplay", "playing"].includes(n)) attenteVideo = false;
      actualiserVideo();
      m.legende();
    });
    try {
      const mse = window.MediaSource || window.ManagedMediaSource;
      const source = media.sources?.find((s) => mse?.isTypeSupported(s.codec));
      if (!source) throw Error("codec incompatible");
      const autorisee = (url) => {
        const u2 = new URL(url);
        return u2.protocol === "https:" && !u2.username && !u2.password && (!u2.port || u2.port === "443") && media.hotes?.includes(u2.hostname);
      };
      if (!autorisee(source.url)) throw Error("h\xF4te vid\xE9o refus\xE9");
      if (source.type.startsWith("video/")) {
        v.src = source.url;
        v.play().catch(() => {
        });
        return;
      }
      const shaka = await chargerShaka();
      if (videoGalerie !== v) return;
      if (!shaka.Player.isBrowserSupported()) throw Error("MSE incompatible");
      const lecteur = lecteurGalerie = new shaka.Player();
      lecteur.addEventListener("error", (e2) => {
        if (e2.detail.severity === shaka.util.Error.Severity.CRITICAL) indisponible();
      });
      lecteur.getNetworkingEngine().registerRequestFilter((_type, requete) => {
        if (!requete.uris.every(autorisee)) throw Error("h\xF4te vid\xE9o refus\xE9");
      });
      await lecteur.attach(v);
      if (videoGalerie !== v) return;
      await lecteur.load(source.url);
      if (videoGalerie === v) v.play().catch(() => {
      });
    } catch (_) {
      indisponible();
    }
  };
  const ouvrirGalerie = (i) => {
    const captures = medias();
    if (!captures.length) return;
    const premiere = galerie < 0;
    galerie = (i + captures.length) % captures.length;
    if (premiere) $(".menus").innerHTML = `<div class="voile"></div><div class="galerie"><div class="galerie-image"></div><div class="galerie-actions"><button class="og verre" data-g="-1">${ico("precedent")}${e(T("precedent"))}</button><button class="og verre" data-g="fermer">${e(T("fermer"))}</button><button class="og verre" data-g="1">${e(T("suivant"))}${ico("fleche")}</button></div></div>`;
    libererVideo();
    const media = captures[galerie], cadre = $(".galerie-image");
    cadre.innerHTML = "";
    if (media.nom != null) {
      delete cadre.dataset.image;
      const v = document.createElement("video");
      videoGalerie = v;
      attenteVideo = true;
      v.muted = true;
      v.controls = false;
      v.playsInline = true;
      v.preload = "metadata";
      cadre.appendChild(v);
      apercuVideo = document.createElement("div");
      apercuVideo.className = "apercu-video";
      apercuVideo.dataset.image = media.petite;
      apercuVideo.dataset.format = "galerie";
      apercuVideo.innerHTML = `<span role="status">${e(T("chargement"))}</span>`;
      cadre.appendChild(apercuVideo);
      commandesVideo = document.createElement("div");
      commandesVideo.className = "commandes-video";
      commandesVideo.innerHTML = `<button data-g="lecture"></button><input type="range" min="0" max="100" step="0.1" value="0" aria-label="${e(T("video_progression"))}"><button data-g="son"></button>`;
      commandesVideo.addEventListener("input", (x) => {
        if (videoGalerie === v && Number.isFinite(v.duration) && v.duration > 0) v.currentTime = Math.max(0, Math.min(100, Number(x.target.value))) * v.duration / 100;
      });
      cadre.appendChild(commandesVideo);
      actualiserVideo();
      observerImages();
      lireVideo(v, media, cadre);
    } else {
      cadre.dataset.image = media.grande;
      cadre.dataset.format = "galerie";
      observerImages();
    }
    if (premiere) {
      m.calque = calque;
      window.__pcvApparition?.($(".menus"), false, ".galerie");
      window.__pcvVoile?.("galerie", true);
    }
    m.legende();
  };
  const fermerGalerie = () => {
    if (galerie < 0) return;
    libererVideo();
    window.__pcvApparition?.($(".menus"), true, ".galerie");
    window.__pcvVoile?.("galerie", false);
    galerie = -1;
    m.calque = null;
    $(".menus").innerHTML = "";
    observerImages();
    m.legende();
  };
  const calque = {
    fermer: fermerGalerie,
    touche: (b) => {
      if (b === 1 && videoGalerie) {
        videoGalerie.muted = !videoGalerie.muted;
        actualiserVideo();
        m.legende();
      } else if (b === 3 && videoGalerie) basculerVideo();
      else if (b === 2) fermerGalerie();
      else if ((b === 7 || b === 8) && videoGalerie) {
        videoGalerie.currentTime = Math.max(0, videoGalerie.currentTime + (b === 8 ? 10 : -10));
        actualiserVideo();
      } else if ([5, 6, 11, 12].includes(b)) ouvrirGalerie(galerie + ([6, 12].includes(b) ? 1 : -1));
      else window.__pcvSon?.("bord");
    },
    legende: () => [[[5, 6], T("captures")], ...videoGalerie ? [[1, T(videoGalerie.muted ? "video_son" : "video_muette")], [3, T(videoGalerie.paused ? "video_lecture" : "pause")], [[7, 8], T("video_10s")]] : [], [2, T("fermer")]]
  };
  const deplacer = (b, ici) => {
    if (m.vue !== "etageres" || !ici) return null;
    const vers = (s) => $(".etageres .piste").querySelector(s);
    return ici.closest(".vedette") ? b === 10 ? vers(".categories-jeux [data-a]") : b === 12 && ici.closest(".vedette-texte") ? vers(".commandes-vedette .on") || vers(".commandes-vedette [data-a]") : b === 9 && ici.closest(".commandes-vedette") ? vers(".vedette-texte [data-a]") : null : b === 9 && ici.closest(".categories-jeux") ? vers(".vedette-texte [data-a]") : null;
  };
  const montrer = () => m.montrer();
  const cacher = () => m.cacher();
  const entrer = () => {
    universActif = null;
    retourGrille = "";
    m.cacher();
    m.vue = "entree";
    m.sel = choixEntree;
    galerie = -1;
    window.__pcvVoile?.("galerie", false);
    $(".menus").innerHTML = "";
    m.montrer();
  };
  const univers = (nom, fiche = null) => {
    universActif = nom;
    m.cacher();
    if (nom === "plugins") window.__pcvEshop.ouvrir(fiche, entrer);
    else window.__pcvEshopThemes.ouvrir(entrer);
  };
  const fermer = (revenir = true) => {
    if (window.__pcvEshop?.ouvert()) window.__pcvEshop.fermer(false);
    if (window.__pcvEshopThemes?.ouvert()) window.__pcvEshopThemes.fermer(false);
    m.fermer(revenir);
  };
  const clavier = (x) => {
    if (racine.hidden || document.activeElement?.matches?.("input,textarea")) return;
    const b = { ArrowLeft: 11, ArrowRight: 12, ArrowUp: 9, ArrowDown: 10, Enter: 1, Escape: 2, y: 4, Y: 4, x: 3, X: 3, PageUp: 5, PageDown: 6 }[x.key];
    if (!b) return;
    const evenement = { detail: { button: b }, stopPropagation() {
    }, preventDefault() {
    } };
    window.__pcvPrendre?.(evenement);
    x.stopImmediatePropagation();
    x.preventDefault();
  };
  addEventListener("keydown", clavier, true);
  const visibilite = () => {
    if (document.hidden) arreterVedette();
    else lancerVedette();
  };
  document.addEventListener("visibilitychange", visibilite);
  window.__pcvBoutique = {
    ouvrir: () => {
      choixEntree = 0;
      entrer();
    },
    // (31/10) rouverte, elle repart sur Jeux : rien de la visite d'avant
    ouvrirPlugin: (nom) => {
      choixEntree = 1;
      univers("plugins", nom);
    },
    ouvrirSouhaits: () => {
      choixEntree = 0;
      entrer();
      chargerJeux();
      ouvrirGrille("souhaits");
    },
    ouvert: () => m.ouvert() || !!window.__pcvEshop?.ouvert() || !!window.__pcvEshopThemes?.ouvert(),
    fermer,
    detruire: () => {
      mort = true;
      if (universActif === "plugins") window.__pcvEshop?.fermer(false);
      else if (universActif === "themes") window.__pcvEshopThemes?.fermer(false);
      m.detruire();
      imagerie.detruire();
      removeEventListener("keydown", clavier, true);
      document.removeEventListener("visibilitychange", visibilite);
      delete window.__pcvPreparer.eshop;
      delete window.__pcvTuilesBoutique;
    }
  };
})();
