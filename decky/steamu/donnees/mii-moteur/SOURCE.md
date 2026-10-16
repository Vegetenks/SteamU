# Mii engine: what is bundled here

Upstream: [FFL.js](https://github.com/ariankordi/FFL.js) by Arian Kordi, version v2.2.2,
commit `c74d1b94bf4e599fd3a9a16dd346c536dc798391`, license AGPL-3.0-only (see `LICENSE` in this folder).
FFL.js provides JavaScript/three.js bindings for FFL (Face Library), Nintendo's Mii rendering library, as decompiled
and ported by [AboodXD (aboood40091/ffl)](https://github.com/aboood40091/ffl).

## Bundled files (AGPL-3.0, Arian Kordi, no Nintendo code inside)

- `ffl.browser.js`: the FFL.js JavaScript bindings (dist/ffl.browser.js).
- `CTRShaderMaterial.browser.js`: 3DS-style lighting shader, derived from Citra's shader generator.
- `SampleShaderMaterial.browser.js`: Switch-style lighting shader, ported by FFL.js.
- `aides-ffl.js`: generated at build time (`outils/assembler_decky.sh`, `mii_moteur.aides()`) from the three helper
  modules in `sources/helpers/` (SkeletonScalingExtensions.js, ModelScaleDesc.js, BodyUtilities.js, AGPL-3.0,
  Arian Kordi). Do not edit it by hand: edit the sources and rebuild.

## Not bundled, and why

SteamU never downloads anything unless the user asks, and then only from the FFL.js project. The three files below
are installed with the "Install" button of the "Mii engine" area (Settings > SteamU > Import), which fetches them
from the official repository at the pinned commit above and checks their SHA-256 hashes, or they can be imported
like any other file. They are never redistributed here or in any public build, because their content goes beyond
what Arian Kordi's AGPL-3.0 can cover:

- `FFLShaderMaterial.browser.js` and `LUTShaderMaterial.browser.js` contain shader code copied verbatim with
  "Copyright (c) 2014 Nintendo Co., Ltd. All rights reserved." notices.
- `ffl-emscripten.js` embeds FFL compiled to WebAssembly from AboodXD's decompilation, which has no known license.

Once installed or imported, they live in `prive/mii/moteur/` and take precedence over anything bundled here.

The Mii face resource file (`AFLResHigh_2_3.dat`) and the body models are Nintendo data as well: every user imports
them from their own console.
