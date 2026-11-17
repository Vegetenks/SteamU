(() => {
  const steam = ":is({{LoadingWrapper@Throbber}}, .SteamLogoThrobber)", dessin = `${steam} > div`;
  const web = ":is(.throbber, .LoadingThrobber)", barres = `${web} > div`;
  const plein = "{{SpinnerLoaderContainer@LoadingStatus}}:has(> img)", image = `${plein} > img`;
  const pre = "{{ThreeDots@PreloadThrobber}}", dot = `${pre} > {{Dot@PreloadThrobber}}`;
  const svg = "svg{{Spinner@SpinnerSpokeFade}}", chemins = `${svg} > path:nth-child(-n+3)`;
  const css = `
    .pcv-points, ${steam}, ${pre}, ${web}, ${plein} { --pcv-point: 1.5vh; --pcv-points-couleur: var(--pcv-cyan-plein); }
    .pcv-points, ${pre} { position: relative; display: inline-block; width: calc(var(--pcv-point) * 5); height: calc(var(--pcv-point) * 2.6); vertical-align: middle; flex: none; }
    .pcv-points > i, ${dot}, ${chemins}, ${dessin}::before, ${dessin}::after, ${dessin} > :first-child, ${barres}, ${image}, ${plein}::before, ${plein}::after {
      position: absolute !important; top: 50% !important; left: 50% !important;
      width: var(--pcv-point) !important; height: var(--pcv-point) !important;
      margin: calc(var(--pcv-point) * -.5) !important; border: 0 !important; border-radius: 50% !important;
      background: var(--pcv-points-couleur) !important; box-shadow: none !important;
      animation: pcv-saut 1.1s ease-in-out infinite !important; animation-delay: .15s !important; }
    .pcv-points > i:first-child, ${dot}:first-child, ${chemins}:first-child, ${dessin}::before, ${barres}:first-child, ${plein}::before { left: calc(50% - var(--pcv-point) * 2) !important; animation-delay: 0s !important; }
    .pcv-points > i:last-child, ${dot}:last-child, ${chemins}:nth-child(3), ${dessin}::after, ${barres}:last-child, ${plein}::after { left: calc(50% + var(--pcv-point) * 2) !important; animation-delay: .3s !important; }
    ${steam}, ${web}, ${plein} { --pcv-point: clamp(3px, 1.5vh, 14px); }
    ${web}:not(.throbber_fixed, .throbber_absolute), ${plein} { position: relative; }
    ${plein} { height: calc(var(--pcv-point) * 2.6); }
    ${steam}{{throbber_small@LoadingWrapper}}, .throbber_small { --pcv-point: 4px; }
    ${steam}{{throbber_medium@LoadingWrapper}} { --pcv-point: 8px; }
    ${dessin}::before, ${dessin}::after, ${plein}::before, ${plein}::after { content: ""; }
    ${dessin} { position: relative !important; animation: none !important; transform: none !important; filter: none !important; }
    ${dessin} > :first-child, ${image} { object-fit: none; object-position: 99999px 99999px; filter: none !important; }
    ${dessin} > :first-child > *, ${dessin} > :not(:first-child) { display: none !important; }
    ${pre} { animation: none !important; }
    {{PreloadThrobber@ThreeDots}} ${steam} { display: none !important; }
    ${svg} { --pcv-point: 6px; animation: none !important; color: var(--pcv-cyan-plein) !important; }
    ${chemins} { d: path("M15 18a3 3 0 1 0 6 0a3 3 0 1 0-6 0"); fill: currentColor; }
    ${chemins}:first-child { translate: -12px 0; }
    ${chemins}:nth-child(3) { translate: 12px 0; }
    ${svg} > path:nth-child(n+4) { display: none !important; }
    .pcv-attente-cercle { animation: none !important; transform: none !important; border-color: transparent !important; }
    .pcv-attente-cercle > .pcv-points { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); text-indent: 0; }
    @keyframes pcv-saut { 0%, 60%, 100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(calc(var(--pcv-point) * -.8)); opacity: 1; } }
    @keyframes pcv-paraitre { to { opacity: 1; } }
  `;
  const html = () => '<span class="pcv-points" aria-hidden="true"><i></i><i></i><i></i></span>';
  window.__pcvChargement = { css, html };
  const style = document.getElementById("pcv-chargement-css") || document.createElement("style");
  style.id = "pcv-chargement-css";
  style.textContent = css;
  if (!style.isConnected) (document.head || document.documentElement).appendChild(style);
})();
