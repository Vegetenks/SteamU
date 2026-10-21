((forcer) => {
  window.__pcvConnexionArreter?.();
  document.getElementById("pcv-connexion")?.remove();
  if (!forcer && sessionStorage.getItem("pcvConnexionVue")) return "d\xE9j\xE0 vue pendant cette session";
  const T = window.__pcvT || ((c) => c);
  const compteCourant = () => window.__pcvBridge?.compteCourant?.() ?? null;
  const resumeBibliotheque = () => window.__pcvBridge?.resumeBibliotheque?.() ?? { pret: false, nombreJeux: null };
  const compte = compteCourant(), bibliotheque = resumeBibliotheque();
  const pseudo = compte?.nom || "", nbJeux = bibliotheque.pret ? bibliotheque.nombreJeux : null;
  const jeuxTexte = (n) => n === 1 ? T("connexion.jeu_un", { n }) : T("connexion.jeu_plusieurs", { n });
  const avatar = compte?.avatar || "";
  const echappe = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const urlSure = (u2) => {
    const s = String(u2 ?? "").trim(), t = s.replace(/[\x00-\x20]/g, "");
    return echappe(!/^[a-z][a-z0-9+.-]*:/i.test(t) || /^(https?:|data:image\/|blob:)/i.test(t) ? s : "");
  };
  let teteMii = "";
  try {
    const moi = window.__pcvMiiBase?.moi?.();
    const c = moi && window.__pcvTeteCacheCle ? JSON.parse(localStorage.getItem(window.__pcvTeteCacheCle) || "null") : null;
    if (c && c.cle === moi.id + ":" + moi.donnees && c.url) teteMii = urlSure(c.url);
  } catch (e) {
  }
  const FANTOMES = [
    ["reglages", 60, 120, 90, -12],
    ["manette", 980, 70, 110, 10],
    ["boutique", 1120, 300, 80, -8],
    ["amis", 150, 360, 70, 6],
    ["medias", 760, 420, 76, -14],
    ["globe", 420, 60, 60, 12],
    ["cloche", 1150, 520, 64, 18],
    ["telech", 40, 540, 58, -6]
  ];
  const TRAITS = {
    reglages: window.__pcvIcones?.trace("parametres") || "",
    manette: '<path d="M7 8h10a5 5 0 0 1 4.8 6.3l-.8 3a2.5 2.5 0 0 1-4.3 1L15 16H9l-1.7 2.3a2.5 2.5 0 0 1-4.3-1l-.8-3A5 5 0 0 1 7 8z"/>',
    boutique: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    amis: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/>',
    medias: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    cloche: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    telech: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  const svg = (n, t, ep = 1.6) => `<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${ep}" stroke-linecap="round" stroke-linejoin="round">${TRAITS[n]}</svg>`;
  const u = (n) => `calc(var(--u) * ${n})`;
  const racine = document.createElement("div");
  racine.id = "pcv-connexion";
  let arrete = false, completer = 0, sortie = 0, attentePlace = 0, attenteDessus = 0, touche = null, manette = null;
  let sortieTerminee = false, placeTerminee = false;
  const vivant = () => !arrete && document.body.contains(racine);
  const retirerEntrees = () => {
    if (completer) {
      clearInterval(completer);
      completer = 0;
    }
    if (touche) window.removeEventListener("keydown", touche, true);
    if (window.__pcvManette?.connexion === manette) delete window.__pcvManette.connexion;
    const tuile = racine.querySelector(".tuile");
    if (tuile) tuile.onclick = null;
  };
  const arreter = () => {
    if (arrete) return;
    arrete = true;
    retirerEntrees();
    clearTimeout(sortie);
    clearTimeout(attentePlace);
    clearTimeout(attenteDessus);
    racine.remove();
    if (window.__pcvConnexionArreter === arreter) delete window.__pcvConnexionArreter;
  };
  const terminer = () => {
    if (sortieTerminee && placeTerminee) arreter();
  };
  racine.innerHTML = `<style>
    #pcv-connexion { position: fixed; inset: 0; z-index: 9800; overflow: hidden; font-family: var(--pcv-police); color: var(--pcv-texte);
      background: var(--pcv-fond-page); }   
    #pcv-connexion * { box-sizing: border-box; }
    #pcv-connexion .fantome { position: absolute; color: var(--pcv-filet); filter: blur(2.5px); animation: pcvFondu .6s ease-out 3.1s both; }
    #pcv-connexion .colline { position: absolute; left: -15vw; right: -15vw; top: ${u(520)}; height: ${u(600)}; border-radius: 50%; background: var(--pcv-verre);
      box-shadow: 0 ${u(-8)} ${u(40)} rgba(120,140,170,.18); z-index: 1; animation: pcvFondu .6s ease-out 3.1s both; }
    #pcv-connexion .intro { position: absolute; inset: 0; z-index: 1; pointer-events: none; transform-origin: 50% 52%;
      animation: pcvFond 1s cubic-bezier(.5,0,.2,1) 2.9s both; }
    #pcv-connexion .systeme { position: absolute; left: calc(var(--u) * 24); top: calc(var(--u) * 24); height: calc(var(--u) * 52); border-radius: calc(var(--u) * 26);
      padding: 0 calc(var(--u) * 20) 0 calc(var(--u) * 10); display: flex; align-items: center; gap: calc(var(--u) * 10); font-size: calc(var(--u) * 16); font-weight: 900; color: var(--pcv-texte2);
      background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    #pcv-connexion .intro svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    #pcv-connexion .intro #scene { animation: pcvApparait .7s cubic-bezier(.2,.9,.3,1.15) both; transform-origin: 640px 420px; }
    #pcv-connexion .intro #contenu-ecran { animation: pcvFondu .5s ease-out .9s both; }
    #pcv-connexion .intro #manette-gauche { animation: pcvDetacheG .8s cubic-bezier(.3,1.4,.5,1) 1.9s both; transform-box: fill-box; transform-origin: 100% 50%; }
    #pcv-connexion .intro #manette-droite { animation: pcvDetacheD .8s cubic-bezier(.3,1.4,.5,1) 1.9s both; transform-box: fill-box; transform-origin: 0% 50%; }
    #pcv-connexion .intro #tablette { animation: pcvSouleve .8s ease-out 2.1s both; }
    @keyframes pcvApparait { from { opacity: 0; transform: translateY(30px) scale(.9); } to { opacity: 1; transform: none; } }
    @keyframes pcvDetacheG { to { transform: translateX(-120px) rotate(-7deg); } }
    @keyframes pcvDetacheD { to { transform: translateX(120px) rotate(7deg); } }
    @keyframes pcvSouleve { to { transform: translateY(-10px); } }
    
    @keyframes pcvFond { to { transform: translateY(calc(var(--u) * 40)) scale(.82); opacity: 0; filter: blur(1px); visibility: hidden; } }
    #pcv-connexion .entree { position: absolute; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center; background: var(--pcv-fond-page);
      font-size: ${u(64)}; font-weight: 900; letter-spacing: -.02em; color: var(--pcv-texte2); animation: pcvSortie .3s ease-in 1.4s both; }
    #pcv-connexion .choix { position: absolute; inset: 0; z-index: 2; animation: pcvFondu .4s ease-out 3.3s both; }
    #pcv-connexion .ajouter { position: absolute; right: ${u(-30)}; top: ${u(24)}; height: ${u(52)}; border-radius: ${u(26)}; padding: 0 ${u(50)} 0 ${u(10)}; display: flex; align-items: center;
      gap: ${u(10)}; font-size: ${u(17)}; font-weight: 900; background: var(--pcv-verre); box-shadow: var(--pcv-reflet), var(--pcv-ombre); }
    #pcv-connexion .ajouter i { width: ${u(34)}; height: ${u(34)}; border-radius: 50%; background: var(--pcv-pastille); color: var(--pcv-texte2); display: flex; align-items: center; justify-content: center;
      box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.12); }
    #pcv-connexion .centre { position: absolute; left: 50%; top: ${u(150)}; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: ${u(18)}; }
    #pcv-connexion .bulle { position: relative; padding: ${u(10)} ${u(20)}; border-radius: ${u(20)}; font-size: ${u(17)}; font-weight: 900; background: var(--pcv-verre);
      box-shadow: var(--pcv-reflet), var(--pcv-ombre); animation: pcvFondu .2s ease-out 3.75s both; }
    #pcv-connexion .bulle::after { content: ""; position: absolute; left: 50%; bottom: ${u(-8)}; margin-left: ${u(-8)}; width: ${u(16)}; height: ${u(16)}; background: var(--pcv-creux); transform: rotate(45deg); border-radius: 3px; }
    #pcv-connexion button { all: unset; cursor: pointer; }
    #pcv-connexion .tuile { position: relative; width: ${u(118)}; height: ${u(118)}; border-radius: ${u(22)}; padding: ${u(6)}; background: var(--pcv-verre);
      box-shadow: inset 0 2px 0 var(--pcv-reflet-haut), 0 ${u(6)} ${u(16)} rgb(from var(--pcv-ombre-c) r g b / .2); }
    #pcv-connexion .tuile img { display: block; width: 100%; height: 100%; border-radius: ${u(16)}; object-fit: cover; }
    #pcv-connexion .tuile::after { content: ""; position: absolute; inset: ${u(-7)}; border-radius: ${u(27)}; border: ${u(5)} solid var(--pcv-cyan-plein); box-shadow: 0 0 0 2px var(--pcv-anneau-c); }
    #pcv-connexion .coins { position: absolute; inset: ${u(-7)}; border-radius: ${u(30)}; border: ${u(4)} solid #7fdcff; animation: pcvEclat .25s ease-out both; }
    #pcv-connexion .perso { position: absolute; left: ${u(70)}; top: ${u(540)}; width: ${u(70)}; height: ${u(70)}; border-radius: 50%; overflow: hidden;
      box-shadow: 0 0 0 ${u(4)} #fff, 0 4px 10px rgba(0,0,0,.18); }
    #pcv-connexion .perso img { display: block; width: 100%; height: 100%; object-fit: cover; }
    #pcv-connexion .infos { position: absolute; left: ${u(220)}; top: ${u(640)}; display: flex; align-items: center; gap: ${u(34)}; }
    #pcv-connexion .infos small { display: block; font-size: ${u(17)}; font-weight: 800; color: var(--pcv-texte2); }
    #pcv-connexion .infos b { font-size: ${u(24)}; font-weight: 900; color: var(--pcv-texte); }
    #pcv-connexion.part { animation: pcvSortie .3s ease-in .2s both; }
    @keyframes pcvFondu { from { opacity: 0 } to { opacity: 1 } }
    @keyframes pcvSortie { from { opacity: 1 } to { opacity: 0; visibility: hidden } }
    @keyframes pcvEclat { 0% { inset: ${u(-7)}; opacity: 1 } 100% { inset: ${u(-15)}; opacity: 0 } }
  </style>
  ${FANTOMES.map(([n, x, y, t, r]) => `<span class="fantome" style="left:${u(x)};top:${u(y)};transform:rotate(${r}deg)">${svg(n, `calc(var(--u) * ${t})`)}</span>`).join("")}
  <div class="colline"></div>
  <div class="choix">
    <div class="ajouter"><i>${svg("plus", "calc(var(--u) * 18)", 2.6)}</i>${T("connexion.ajouter_compte")}</div>
    <div class="systeme"><svg viewBox="0 0 32 32" style="width:calc(var(--u) * 30);height:calc(var(--u) * 30);flex:none;filter:drop-shadow(0 3px 6px color-mix(in srgb, var(--pcv-cyan-plein) 35%, transparent))"><defs><linearGradient id="steamCyanP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd0ff"/><stop offset="1" stop-color="#1a9ae6"/></linearGradient></defs><circle cx="15.9" cy="15.9" r="15.6" fill="#fff"/><path d="M30.3213 15.9106C30.3213 23.8694 23.8694 30.3213 15.9106 30.3213C7.95186 30.3213 1.5 23.8694 1.5 15.9106C1.5 7.95186 7.95186 1.5 15.9106 1.5C23.8694 1.5 30.3213 7.95186 30.3213 15.9106Z" fill="url(#steamCyanP)"/><path d="M15.8869 1.5C8.30251 1.5 2.09194 7.37249 1.5 14.8379L9.23632 18.0524C9.89156 17.6009 10.6829 17.3401 11.5376 17.3401C11.6136 17.3401 11.6895 17.3433 11.7655 17.3465L15.2063 12.3325C15.2063 12.3102 15.2063 12.2848 15.2063 12.2625C15.2063 9.24838 17.65 6.79383 20.6509 6.79383C23.6517 6.79383 26.0954 9.24838 26.0954 12.2625C26.0954 15.2767 23.6517 17.7312 20.6509 17.7312C20.6097 17.7312 20.5686 17.7312 20.5274 17.728L15.6178 21.2477C15.621 21.3113 15.621 21.3781 15.621 21.4417C15.621 23.7055 13.7882 25.5464 11.5344 25.5464C9.55602 25.5464 7.90367 24.1283 7.52698 22.2493L1.99697 19.9505C3.70947 26.036 9.27747 30.5 15.8869 30.5C23.8606 30.5 30.3213 24.0075 30.3213 16.0016C30.3213 7.99249 23.8574 1.5 15.8869 1.5Z" fill="white"/><path d="M10.5469 23.5022L8.77423 22.7677C9.08761 23.4259 9.63206 23.9759 10.3538 24.278C11.9143 24.9298 13.7123 24.1858 14.3644 22.6183C14.6778 21.8584 14.6809 21.0222 14.3676 20.2623C14.0573 19.5024 13.4686 18.9079 12.712 18.5931C11.9618 18.2783 11.1578 18.291 10.4519 18.5581L12.2847 19.318C13.4369 19.8013 13.9814 21.1271 13.5002 22.2845C13.0191 23.4354 11.6991 23.9823 10.5469 23.5022Z" fill="white"/><path d="M24.2783 12.2628C24.2783 10.2533 22.6513 8.61908 20.6507 8.61908C18.6502 8.61908 17.0231 10.2533 17.0231 12.2628C17.0231 14.2722 18.6502 15.9064 20.6507 15.9064C22.6513 15.9064 24.2783 14.2722 24.2783 12.2628ZM17.9316 12.2564C17.9316 10.7461 19.1535 9.51887 20.657 9.51887C22.1638 9.51887 23.3825 10.743 23.3825 12.2564C23.3825 13.7698 22.1638 14.9939 20.657 14.9939C19.1503 14.9939 17.9316 13.7698 17.9316 12.2564Z" fill="white"/></svg><span class="nom-systeme">${T("connexion.systeme")}</span></div>
    <div class="centre"><div class="bulle">${T("connexion.commencer_compte")}</div>
      <button class="tuile" aria-label="${echappe(T("connexion.commencer_aria", { pseudo }))}"><img data-pcv-avatar ${avatar ? `src="${urlSure(avatar)}"` : ""} alt=""></button></div>
    <div class="perso">${teteMii ? `<img src="${teteMii}" alt="">` : `<img data-pcv-avatar ${avatar ? `src="${urlSure(avatar)}"` : ""} alt="">`}</div>
    <div class="infos"><span><small>${T("connexion.pseudo_label")}</small><b data-pcv-pseudo>${echappe(pseudo)}</b></span><span style="width:2px;height:${u(56)};background:var(--pcv-texte2);opacity:.3"></span>
      <span><small>${T("connexion.bibliotheque_label")}</small><b style="color:var(--pcv-cyan-plein)" data-pcv-nbjeux>${nbJeux !== null ? jeuxTexte(nbJeux) : "\u2026"}</b></span></div>
  </div>
  <div class="intro"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
  <!-- La Legion Go 2 dessin\xE9e \xE0 la mani\xE8re des illustrations de la Wii U : plastique blanc, traits gris doux,
       ombres pastel. Dessin original d'apr\xE8s la forme de la console ; ni logo ni image de marque. -->
  <defs>
    <linearGradient id="plastique" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e7ecf2"/></linearGradient>
    <linearGradient id="plastique-sombre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f5f9"/><stop offset="1" stop-color="#d9e0e8"/></linearGradient>
    <linearGradient id="ecran" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f6ff"/><stop offset=".55" stop-color="#cfeaff"/><stop offset="1" stop-color="#bfe0fb"/></linearGradient>
    <radialGradient id="anneau" cx=".5" cy=".5" r=".5"><stop offset=".72" stop-color="#9fe3ff" stop-opacity="0"/><stop offset=".8" stop-color="#5fd0ff"/><stop offset="1" stop-color="#2fb8ff" stop-opacity=".2"/></radialGradient>
    <filter id="ombre" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#3c5578" flood-opacity=".16"/></filter>
    <g id="stick">
      <circle r="40" fill="url(#anneau)"/>
      <circle r="34" fill="none" stroke="#7fdcff" stroke-width="4"/>
      <circle r="27" fill="url(#plastique-sombre)" stroke="#aab6c4" stroke-width="2.5"/>
      <circle r="16" fill="#f6f8fb" stroke="#c4cdd8" stroke-width="2"/>
    </g>
    <g id="petit-btn"><rect x="-14" y="-5" width="28" height="10" rx="5" fill="#e3e9f0" stroke="#aab6c4" stroke-width="2"/></g>
  </defs>

  <!-- ombre au sol -->
  <g id="scene"><ellipse cx="640" cy="668" rx="520" ry="26" fill="#3c5578" opacity=".10"/>

  <!-- manette gauche -->
  <g id="manette-gauche" filter="url(#ombre)">
    <path d="M318 196 C 250 196 196 214 176 262 C 152 322 146 430 150 520 C 154 590 178 636 230 650 C 262 658 300 656 318 646 Z"
          fill="url(#plastique)" stroke="#aab6c4" stroke-width="3" stroke-linejoin="round"/>
    <path d="M300 214 L 300 630" stroke="#d3dbe4" stroke-width="2" fill="none"/>
    <path d="M206 214 C 232 205 262 203 284 204" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".9" fill="none"/>
    <use href="#stick" x="234" y="300"/>
    <!-- croix directionnelle -->
    <g transform="translate(234 420)">
      <circle r="44" fill="#eef2f6" stroke="#c4cdd8" stroke-width="2"/>
      <path d="M-12 -34 h24 v22 h22 v24 h-22 v22 h-24 v-22 h-22 v-24 h22 z" fill="url(#plastique-sombre)" stroke="#9aa7b6" stroke-width="2.5" stroke-linejoin="round"/>
    </g>
    <use href="#petit-btn" x="234" y="510"/><use href="#petit-btn" x="234" y="540"/>
    <circle cx="280" cy="238" r="7" fill="#e3e9f0" stroke="#aab6c4" stroke-width="2"/><circle cx="280" cy="584" r="7" fill="#e3e9f0" stroke="#aab6c4" stroke-width="2"/>
  </g>

  <!-- manette droite -->
  <g id="manette-droite" filter="url(#ombre)">
    <path d="M962 196 C 1030 196 1084 214 1104 262 C 1128 322 1134 430 1130 520 C 1126 590 1102 636 1050 650 C 1018 658 980 656 962 646 Z"
          fill="url(#plastique)" stroke="#aab6c4" stroke-width="3" stroke-linejoin="round"/>
    <path d="M980 214 L 980 630" stroke="#d3dbe4" stroke-width="2" fill="none"/>
    <path d="M996 214 C 1022 205 1052 203 1074 206" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".9" fill="none"/>
    <!-- boutons Y X B A -->
    <g font-family="Nunito, sans-serif" font-weight="900" font-size="16" text-anchor="middle" fill="#7d8a9a">
      <g transform="translate(1046 250)"><circle r="15" fill="url(#plastique-sombre)" stroke="#9aa7b6" stroke-width="2.2"/><text y="6">Y</text></g>
      <g transform="translate(1018 278)"><circle r="15" fill="url(#plastique-sombre)" stroke="#9aa7b6" stroke-width="2.2"/><text y="6">X</text></g>
      <g transform="translate(1074 278)"><circle r="15" fill="url(#plastique-sombre)" stroke="#9aa7b6" stroke-width="2.2"/><text y="6">B</text></g>
      <g transform="translate(1046 306)"><circle r="15" fill="url(#plastique-sombre)" stroke="#9aa7b6" stroke-width="2.2"/><text y="6">A</text></g>
    </g>
    <use href="#stick" x="1046" y="410"/>
    <!-- pav\xE9 tactile -->
    <rect x="1006" y="482" width="80" height="84" rx="16" fill="#eef2f6" stroke="#aab6c4" stroke-width="2.5"/>
    <circle cx="1000" cy="238" r="7" fill="#e3e9f0" stroke="#aab6c4" stroke-width="2"/><circle cx="1000" cy="584" r="7" fill="#e3e9f0" stroke="#aab6c4" stroke-width="2"/>
  </g>

  <!-- la tablette (\xE9cran) -->
  <g id="tablette" filter="url(#ombre)">
    <rect x="318" y="196" width="644" height="452" rx="22" fill="url(#plastique)" stroke="#aab6c4" stroke-width="3"/>
    <rect x="852" y="186" width="34" height="12" rx="4" fill="#dfe6ee" stroke="#aab6c4" stroke-width="2"/>
    <rect x="896" y="186" width="34" height="12" rx="4" fill="#dfe6ee" stroke="#aab6c4" stroke-width="2"/>
    <rect x="346" y="222" width="588" height="400" rx="10" fill="#3b4656"/>
    <rect x="354" y="230" width="572" height="384" rx="6" fill="url(#ecran)"/>
    <path d="M354 230 h300 l-120 384 h-180 z" fill="#ffffff" opacity=".22"/>
    <g id="contenu-ecran">
      <defs><linearGradient id="steamCyan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd0ff"/><stop offset="1" stop-color="#1a9ae6"/></linearGradient></defs>
      <g transform="translate(608 296) scale(2)"><circle cx="15.9" cy="15.9" r="15.6" fill="#fff"/><path d="M30.3213 15.9106C30.3213 23.8694 23.8694 30.3213 15.9106 30.3213C7.95186 30.3213 1.5 23.8694 1.5 15.9106C1.5 7.95186 7.95186 1.5 15.9106 1.5C23.8694 1.5 30.3213 7.95186 30.3213 15.9106Z" fill="url(#steamCyan)"/><path d="M15.8869 1.5C8.30251 1.5 2.09194 7.37249 1.5 14.8379L9.23632 18.0524C9.89156 17.6009 10.6829 17.3401 11.5376 17.3401C11.6136 17.3401 11.6895 17.3433 11.7655 17.3465L15.2063 12.3325C15.2063 12.3102 15.2063 12.2848 15.2063 12.2625C15.2063 9.24838 17.65 6.79383 20.6509 6.79383C23.6517 6.79383 26.0954 9.24838 26.0954 12.2625C26.0954 15.2767 23.6517 17.7312 20.6509 17.7312C20.6097 17.7312 20.5686 17.7312 20.5274 17.728L15.6178 21.2477C15.621 21.3113 15.621 21.3781 15.621 21.4417C15.621 23.7055 13.7882 25.5464 11.5344 25.5464C9.55602 25.5464 7.90367 24.1283 7.52698 22.2493L1.99697 19.9505C3.70947 26.036 9.27747 30.5 15.8869 30.5C23.8606 30.5 30.3213 24.0075 30.3213 16.0016C30.3213 7.99249 23.8574 1.5 15.8869 1.5Z" fill="white"/><path d="M10.5469 23.5022L8.77423 22.7677C9.08761 23.4259 9.63206 23.9759 10.3538 24.278C11.9143 24.9298 13.7123 24.1858 14.3644 22.6183C14.6778 21.8584 14.6809 21.0222 14.3676 20.2623C14.0573 19.5024 13.4686 18.9079 12.712 18.5931C11.9618 18.2783 11.1578 18.291 10.4519 18.5581L12.2847 19.318C13.4369 19.8013 13.9814 21.1271 13.5002 22.2845C13.0191 23.4354 11.6991 23.9823 10.5469 23.5022Z" fill="white"/><path d="M24.2783 12.2628C24.2783 10.2533 22.6513 8.61908 20.6507 8.61908C18.6502 8.61908 17.0231 10.2533 17.0231 12.2628C17.0231 14.2722 18.6502 15.9064 20.6507 15.9064C22.6513 15.9064 24.2783 14.2722 24.2783 12.2628ZM17.9316 12.2564C17.9316 10.7461 19.1535 9.51887 20.657 9.51887C22.1638 9.51887 23.3825 10.743 23.3825 12.2564C23.3825 13.7698 22.1638 14.9939 20.657 14.9939C19.1503 14.9939 17.9316 13.7698 17.9316 12.2564Z" fill="white"/></g>
      <text x="640" y="420" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="54" fill="#8c97a6" letter-spacing="-1">Steam<tspan fill="#2fb8ff">OS</tspan></text>
      <text x="640" y="462" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="24" fill="#a3adba">${echappe(T("connexion.bienvenue"))}</text>
    </g>
  </g>
</g></svg>
</div>`;
  document.body.appendChild(racine);
  window.__pcvConnexionArreter = arreter;
  window.__pcvNomMachine?.().then((n) => {
    if (!vivant()) return;
    const e = racine.querySelector(".nom-systeme");
    if (n && e) e.textContent = n;
  }).catch(() => {
  });
  const valider = () => {
    if (!vivant() || racine.classList.contains("part")) return;
    sessionStorage.setItem("pcvConnexionVue", "1");
    const c = document.createElement("span");
    c.className = "coins";
    racine.querySelector(".tuile").appendChild(c);
    racine.classList.add("part");
    retirerEntrees();
    window.__pcvBridge?.ouvrirAccueil?.();
    if (arrete) return;
    let essais = 0;
    const versPlace = () => {
      if (arrete) return;
      if (window.__pcvPlace3D) {
        window.__pcvPlaceMontrer?.(true);
        placeTerminee = true;
        terminer();
      } else if (++essais < 12) attentePlace = setTimeout(versPlace, 250);
      else {
        placeTerminee = true;
        terminer();
      }
    };
    attentePlace = setTimeout(versPlace, 250);
    sortie = setTimeout(() => {
      if (arrete) return;
      racine.remove();
      sortieTerminee = true;
      terminer();
    }, 600);
  };
  touche = (e) => {
    if (!vivant()) {
      arreter();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      valider();
      e.stopPropagation();
      e.preventDefault();
    }
  };
  racine.querySelector(".tuile").onclick = valider;
  window.addEventListener("keydown", touche, true);
  manette = (b) => {
    if (!vivant()) {
      arreter();
      return false;
    }
    if (racine.style.visibility === "hidden") return false;
    if (b === 1) valider();
    return true;
  };
  (window.__pcvManette ||= {}).connexion = manette;
  racine.style.visibility = "hidden";
  const montrer = () => {
    if (!vivant()) return;
    if (window.__pcvBridge?.steamDessus?.()) {
      attenteDessus = setTimeout(montrer, 250);
      return;
    }
    racine.style.visibility = "";
  };
  Promise.resolve(window.__pcvBridge?.choixCompteAuDemarrage?.()).catch(() => false).then((choisi) => {
    if (!vivant()) return;
    if (choisi) valider();
    else montrer();
  });
  completer = setInterval(() => {
    if (!vivant()) return arreter();
    const p = compteCourant(), b = resumeBibliotheque();
    if (p) {
      racine.querySelectorAll("[data-pcv-pseudo]").forEach((e) => {
        e.textContent = p.nom;
      });
      racine.querySelectorAll("[data-pcv-avatar]").forEach((e) => {
        if (!p.avatar) e.removeAttribute("src");
        else if (e.getAttribute("src") !== p.avatar) e.src = p.avatar;
      });
      racine.querySelector(".tuile").setAttribute("aria-label", T("connexion.commencer_aria", { pseudo: p.nom }));
    }
    if (b.pret) racine.querySelectorAll("[data-pcv-nbjeux]").forEach((e) => {
      e.textContent = jeuxTexte(b.nombreJeux);
    });
    if (p && b.pret) {
      clearInterval(completer);
      completer = 0;
    }
  }, 300);
  return "connexion affich\xE9e";
})(window.__pcvForcerConnexion);
