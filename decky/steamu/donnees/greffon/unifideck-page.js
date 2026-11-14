(() => {
  const O = window.opener || window, CLE = "pcv-groupe-doublons";
  const ORDRE = ["steam", "epic", "gog", "amazon", "ubisoft", "battlenet", "microsoft", "gamevault", "itch"];
  const XBOX_ONE = /\bxbox\s+one(?:\s+(?:edition|version))?\s*$/i;
  const rang = (b) => {
    const k = ORDRE.indexOf(b);
    return k < 0 ? 1e9 : k;
  };
  const formes = (id) => window.__pcvBridge?.unifideck?.formes(id) || [];
  const ov = (k) => {
    try {
      return O.appStore?.GetAppOverviewByAppID?.(k);
    } catch (e) {
      return null;
    }
  };
  const grouper = (l) => {
    const grp = /* @__PURE__ */ new Map(), rev = /* @__PURE__ */ new Map(), pairs = /* @__PURE__ */ new Map(), groupes = /* @__PURE__ */ new Map(), lignes = [];
    for (const g of l) if (g && g.app_id != null && g.store && g.store !== "steam") {
      const steam = /* @__PURE__ */ new Map();
      for (const v of Array.isArray(g.steam_versions) ? g.steam_versions : []) if (Number(v?.app_id) > 0) steam.set(Number(v.app_id), v.edition_label ? String(v.edition_label) : "");
      if (Number(g.steam_owned_app_id) > 0 && !steam.has(Number(g.steam_owned_app_id))) steam.set(Number(g.steam_owned_app_id), g.steam_owned_edition_label ? String(g.steam_owned_edition_label) : "");
      const e = {
        id: Number(g.app_id),
        store: String(g.store),
        titre: String(g.title || ""),
        edition: g.edition_label ? String(g.edition_label) : "",
        inst: !!g.installed,
        groupe: g.dedupe_group_id ? String(g.dedupe_group_id) : "",
        steam,
        primaire: true
      };
      e.membres = [e];
      lignes.push(e);
      if (e.groupe) (groupes.get(e.groupe) || groupes.set(e.groupe, []).get(e.groupe)).push(e);
    }
    for (const membres of groupes.values()) {
      const steam = /* @__PURE__ */ new Map();
      for (const e of membres) for (const [k, v] of e.steam) if (!steam.has(k)) steam.set(k, v);
      const premiere = [...membres].sort((x, y) => rang(x.store) - rang(y.store))[0], memes = membres.filter((x) => x.store === premiere.store);
      const prim = membres.find((x) => x.inst) || memes.find((x) => !XBOX_ONE.test(x.titre)) || memes[0];
      for (const e of membres) Object.assign(e, { membres, steam, primaire: e === prim });
    }
    for (const e of lignes) {
      for (const id of formes(e.id)) grp.set(id, e);
      for (const k of e.steam.keys()) if (!rev.has(k)) rev.set(k, e);
      if (e.steam.size > 1) for (const k of e.steam.keys()) pairs.set(k, [...e.steam.keys()]);
    }
    const sig = lignes.map((e) => [e.id, e.groupe, e.primaire ? 1 : 0, e.inst ? 1 : 0, e.edition, [...e.steam.keys()].join("+")].join(":")).sort().join("|");
    return { grp, rev, pairs, sig, dispo: lignes.some((e) => e.membres.length > 1 || e.steam.size > 0) };
  };
  const etat = () => {
    const u = O.__pcvUnifideck;
    return u?.ok && u.dbl || null;
  };
  const disponible = () => !!etat()?.dispo;
  const actif = () => {
    try {
      return JSON.parse(localStorage.getItem(CLE)) === true && disponible();
    } catch (e) {
      return false;
    }
  };
  const doublons = (a) => {
    const d = etat(), id = Number(a?.appid), e = d && (d.grp.get(id) || d.rev.get(id));
    if (!e) return [];
    const l = e.membres.map((x) => ({ appid: x.id, store: x.store, titre: x.titre, edition: x.edition, inst: x.inst, steam: false, soi: formes(x.id).includes(id) }));
    for (const [k, ed] of e.steam) l.push({ appid: k, store: "steam", titre: e.titre, edition: ed, inst: ov(k)?.installed === true, steam: true, soi: k === id });
    return l.length > 1 ? l : [];
  };
  const masque = (a) => {
    const d = etat(), id = Number(a?.appid);
    if (!d) return false;
    const e = d.grp.get(id);
    if (e) return !e.inst && ([...e.steam.keys()].some((k) => ov(k)) || !e.primaire);
    const p = d.pairs.get(id);
    if (p && p.length > 1 && !ov(id)?.installed) return (p.find((k) => ov(k)?.installed) ?? Math.max(...p)) !== id;
    return false;
  };
  window.__pcvDoublons = { grouper, disponible, actif, doublons, masque, cle: CLE };
})();
