(() => {
  window.__pcvCompteFin?.();
  const O = window.opener || window;
  const T = (c) => (window.__pcvT || ((x) => x))(c);
  window.__pcvAvantConnexion = () => {
    try {
      return O.SteamUIStore.WindowStore.GamepadUIMainWindowInstance.BViewingPreLoginRoute() === true;
    } catch (e) {
      return false;
    }
  };
  const PICTO_CONSOLE = [
    [/Valve.*(Jupiter|Galileo)/, "portable-deck"],
    [/Legion Go S|83L3|83N6|83Q2|83Q3/, "portable-legion-go-s"],
    [/Legion Go 2|83N0|83N1/, "portable-legion-go-2"],
    [/Legion Go|83E1/, "portable-legion-go"],
    [/RC73/, "portable-xbox-ally"],
    [/ROG Ally|RC71|RC72/, "portable-ally"],
    [/Claw|MS-1T/, "portable-claw"],
    [/AYA ?NEO/i, "portable-ayaneo"]
  ];
  window.__pcvPictoConsole = (dmi) => PICTO_CONSOLE.find(([r]) => r.test(dmi))?.[1];
  const NOMS_CONSOLE = {
    "portable-deck": "Steam Deck",
    "portable-legion-go-s": "Legion Go S",
    "portable-legion-go-2": "Legion Go 2",
    "portable-legion-go": "Legion Go",
    "portable-xbox-ally": "ROG Xbox Ally",
    "portable-ally": "ROG Ally",
    "portable-claw": "MSI Claw",
    "portable-ayaneo": "AYANEO"
  };
  let machine = null;
  window.__pcvNomMachine = async () => {
    try {
      machine = await O.DeckyBackend.call("loader/call_plugin_method", window.__pcvGreffon.nom, "machine") || machine;
    } catch (e) {
    }
    if (!machine) return null;
    const dmi = [machine.sys_vendor, machine.product_name, machine.product_version, machine.board_name].join(" ");
    const modele = NOMS_CONSOLE[window.__pcvPictoConsole(dmi)] || machine.product_version || machine.product_name || "";
    return [machine.systeme, modele].filter(Boolean).join(", ");
  };
  window.__pcvPiluleMachine = () => `<div class="pcv-pilule-machine"><svg viewBox="0 0 32 32" style="width:calc(var(--u) * 30);height:calc(var(--u) * 30);flex:none;filter:drop-shadow(0 3px 6px color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent))"><defs><linearGradient id="steamCyanP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd0ff"/><stop offset="1" stop-color="#1a9ae6"/></linearGradient></defs><circle cx="15.9" cy="15.9" r="15.6" fill="#fff"/><path d="M30.3213 15.9106C30.3213 23.8694 23.8694 30.3213 15.9106 30.3213C7.95186 30.3213 1.5 23.8694 1.5 15.9106C1.5 7.95186 7.95186 1.5 15.9106 1.5C23.8694 1.5 30.3213 7.95186 30.3213 15.9106Z" fill="url(#steamCyanP)"/><path d="M15.8869 1.5C8.30251 1.5 2.09194 7.37249 1.5 14.8379L9.23632 18.0524C9.89156 17.6009 10.6829 17.3401 11.5376 17.3401C11.6136 17.3401 11.6895 17.3433 11.7655 17.3465L15.2063 12.3325C15.2063 12.3102 15.2063 12.2848 15.2063 12.2625C15.2063 9.24838 17.65 6.79383 20.6509 6.79383C23.6517 6.79383 26.0954 9.24838 26.0954 12.2625C26.0954 15.2767 23.6517 17.7312 20.6509 17.7312C20.6097 17.7312 20.5686 17.7312 20.5274 17.728L15.6178 21.2477C15.621 21.3113 15.621 21.3781 15.621 21.4417C15.621 23.7055 13.7882 25.5464 11.5344 25.5464C9.55602 25.5464 7.90367 24.1283 7.52698 22.2493L1.99697 19.9505C3.70947 26.036 9.27747 30.5 15.8869 30.5C23.8606 30.5 30.3213 24.0075 30.3213 16.0016C30.3213 7.99249 23.8574 1.5 15.8869 1.5Z" fill="white"/><path d="M10.5469 23.5022L8.77423 22.7677C9.08761 23.4259 9.63206 23.9759 10.3538 24.278C11.9143 24.9298 13.7123 24.1858 14.3644 22.6183C14.6778 21.8584 14.6809 21.0222 14.3676 20.2623C14.0573 19.5024 13.4686 18.9079 12.712 18.5931C11.9618 18.2783 11.1578 18.291 10.4519 18.5581L12.2847 19.318C13.4369 19.8013 13.9814 21.1271 13.5002 22.2845C13.0191 23.4354 11.6991 23.9823 10.5469 23.5022Z" fill="white"/><path d="M24.2783 12.2628C24.2783 10.2533 22.6513 8.61908 20.6507 8.61908C18.6502 8.61908 17.0231 10.2533 17.0231 12.2628C17.0231 14.2722 18.6502 15.9064 20.6507 15.9064C22.6513 15.9064 24.2783 14.2722 24.2783 12.2628ZM17.9316 12.2564C17.9316 10.7461 19.1535 9.51887 20.657 9.51887C22.1638 9.51887 23.3825 10.743 23.3825 12.2564C23.3825 13.7698 22.1638 14.9939 20.657 14.9939C19.1503 14.9939 17.9316 13.7698 17.9316 12.2564Z" fill="white"/></svg><span class="nom-systeme">${T("connexion.systeme")}</span></div>`;
  if (!window.__pcvAvantConnexion()) return "compte : connect\xE9, rien \xE0 habiller";
  const ECRAN = "{{CachedUsers@UserList}}, {{PinPromptCtn@PinPromptMain}}";
  let hote = null;
  const suivre = () => {
    const la = !!document.querySelector(ECRAN);
    if (la && !hote) {
      hote = document.createElement("div");
      hote.id = "pcv-compte";
      hote.innerHTML = window.__pcvPiluleMachine();
      document.body.appendChild(hote);
      const h = hote;
      window.__pcvNomMachine().then((n) => {
        const e = h.querySelector(".nom-systeme");
        if (n && e) e.textContent = n;
      }).catch(() => {
      });
    } else if (!la && hote) {
      hote.remove();
      hote = null;
    }
    document.body.classList.toggle("pcv-compte-ouvert", !!hote);
    if (hote) window.__pcvFond?.(hote);
  };
  const minuteur = setInterval(suivre, 500);
  suivre();
  window.__pcvCompteFin = () => {
    clearInterval(minuteur);
    hote?.remove();
    document.body.classList.remove("pcv-compte-ouvert");
  };
  return "compte : habillage du choix du compte pr\xEAt";
})();
