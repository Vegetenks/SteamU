(() => {
  window.__pcvTelechUnifArreter?.();
  const B = window.__pcvBridge, cbs = window.__pcvTelechUnifCbs ||= /* @__PURE__ */ new Set();
  const VITE = 2e3, LENT = 3e4;
  let q = null, echecs = 0, minuterie = 0, enCours = false, arrete = false;
  const appid = (x) => B.unifideck?.id?.(x.store, x.game_id) ?? (B.unifideck?.charger(), x.title || x.id);
  const entree = (x) => ({ appid: appid(x), maj: !!x.is_update, unif: { store: x.store, game_id: x.game_id } });
  const file = () => {
    if (!q) return null;
    const c = q.current;
    return {
      cours: c ? {
        ...entree(c),
        pct: +c.progress || 0,
        reste: c.eta_seconds > 0 ? c.eta_seconds : -1,
        pause: false,
        fait: +c.downloaded_bytes || 0,
        total: +c.total_bytes || 0,
        vitesse: (+c.speed_mbps || 0) * 1048576
      } : null,
      suivants: (q.queued || []).map((x) => ({ ...entree(x), etat: "file" })),
      termines: (q.finished || []).filter((x) => x.status === "complete").map(appid)
    };
  };
  const dire = () => cbs.forEach((cb) => {
    try {
      cb();
    } catch (e) {
    }
  });
  const lire = async () => {
    clearTimeout(minuterie);
    minuterie = 0;
    if (arrete || enCours || !cbs.size) return;
    enCours = true;
    try {
      const r = await Promise.race([B.callPlugin("Unifideck", "get_download_queue"), new Promise((_, non) => setTimeout(() => non(new Error("pas de r\xE9ponse en 15 s")), 15e3))]);
      const d = r?.success === false ? null : r?.data ?? r;
      if (!d || typeof d !== "object") throw new Error("r\xE9ponse inattendue");
      if (arrete) return;
      echecs = 0;
      if (JSON.stringify(d) !== JSON.stringify(q)) {
        q = d;
        dire();
      }
    } catch (e) {
      if (!arrete && ++echecs >= 3 && q) {
        q = null;
        dire();
      }
    } finally {
      enCours = false;
      if (!arrete && echecs < 3 && cbs.size) minuterie = setTimeout(lire, (q?.current || q?.queued?.length) && !window.__pcvJeuDevant ? VITE : LENT);
    }
  };
  window.__pcvTelechUnifArreter = () => {
    arrete = true;
    clearTimeout(minuterie);
    minuterie = 0;
  };
  window.__pcvTelechUnif = {
    file,
    abonner: (cb) => {
      cbs.add(cb);
      if (!minuterie && !enCours && echecs < 3) lire();
      return { unregister: () => {
        cbs.delete(cb);
        if (!cbs.size) {
          clearTimeout(minuterie);
          minuterie = 0;
        }
      } };
    },
    relancer: () => {
      echecs = 0;
      lire();
    },
    annuler: (x) => B.callPlugin("Unifideck", "cancel_download", x.unif.store, x.unif.game_id).catch(() => {
    }).finally(lire)
  };
  if (cbs.size) lire();
  return "t\xE9l\xE9chargements d'Unifideck pr\xEAts";
})();
