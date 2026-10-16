# SteamU

SteamU is a [Decky Loader](https://decky.xyz) plugin that gives Steam's Big Picture / gamepad UI a warm,
Wii U / 3DS-inspired makeover: a grid home screen, a HOME menu, full-screen quick settings, a set of complete
themes (day and night), a music player, a "plaza" screen, a Mii Maker, a badge-collecting casino mini-game, and
more. It is still labelled `v0.1.0-test`: expect rough edges, and please open an issue if something looks wrong.

This repository ships two plugins, built straight from the private development tree and stripped of comments and
any personal data before each release (see "Building from source" below):

- **`decky/steamu/`**: the main plugin, listed as "SteamU" in Decky.
- **`decky/steamu-led/`**: an optional companion plugin that gives the two stick rings of a Lenovo Legion Go 2
  their own colour, tied to the active theme. Not needed on other handhelds.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for how the plugin works internally.

## What works out of the box

Grid home screen, HOME menu, quick settings, themes (light/grey/black variants), the music player, notifications,
and SteamU's own original sounds and music. No extra files needed.

## What needs YOUR OWN files

Real Miis, the Mii Maker, the casino and badges, and Nintendo console sounds all need files that **you** import
from hardware **you** own. SteamU bundles **no Nintendo file of any kind**: no ROM, no firmware, no sound bank,
no 3D model. Settings → SteamU → Import explains exactly what it recognises and what is still missing. Importing
is entirely optional; nothing else depends on it.

## Install

**Prerequisites**: [Decky Loader](https://decky.xyz) installed, and Steam running in Game Mode / Big Picture
(that's the UI SteamU themes; it won't do anything in desktop-mode Steam).

1. **Enable Decky's Developer mode**: open the Decky menu (the plug icon next to Quick Access) → Settings →
   General → turn on "Developer mode".
2. **Install the plugin**: still in Decky, open the new Developer tab, then either:
   - **From a zip**: "Install Plugin from ZIP File" → pick `SteamU-v<version>.zip` (built from
     `decky/steamu/`, see "Building from source" below, or downloaded from a GitHub Release once one
     exists); or
   - **From a URL**: "Install from URL" → paste the direct link to the `SteamU-v<version>.zip` asset of a
     GitHub Release.
   Repeat with `SteamU-LED-Legion-Go-2-v<version>.zip` **only if you have a Lenovo Legion Go 2** and want the LED companion. Decky will ask for
   confirmation since it runs as **root**; that's expected and explained in `ARCHITECTURE.md` (§8): it's a tiny,
   separate plugin that only accepts a fixed 12-byte colour message on a local socket, so SteamU itself never
   needs elevated privileges.
3. **First launch**: restart Steam if the interface doesn't change right away (Steam → Power → Restart Steam, or
   just exit and relaunch).

**Updating**: repeat the install step with the new zip/URL. It replaces the old version in place, no need to
uninstall first.

**Upgrading from "Premium Clear View"** (SteamU's former name in Decky): install `SteamU-v<version>.zip`, then
remove "Premium Clear View" in Decky and restart Steam. SteamU copies your imports and settings from the old
plugin's folders on first start and leaves the old ones untouched as a backup. While both are installed, SteamU
waits and shows a reminder instead of running on top of the old plugin.

**Uninstalling cleanly**: Decky menu → Developer tab (or the plugin list) → remove "SteamU" (and
"SteamU LED" if installed). This also removes the startup video SteamU installs; nothing else on your system is
touched.

## Known conflicts

SteamU restyles Steam's Big Picture UI by injecting its own stylesheet and scripts into Steam's windows. Any
other plugin doing the same thing to the same windows can visually clash with it. SteamU detects the two it
knows about and shows a one-time notice (Settings → SteamU) when it sees them installed. It never disables
anything on its own, it just tells you:

- **CSS Loader (SDH-CssLoader)**: if you have a CSS Loader theme active on Big Picture, turn it off (or disable
  SteamU): running both at once gives unpredictable results, not a crash.
- **Game Glance**: its game-page replacement and "Spotlight Home" can cover the same screens as SteamU's game
  page and home screen; turn those off in Game Glance while using SteamU.
- **Other Big Picture skin/theme plugins or home-screen replacers SteamU doesn't know about yet**: same advice,
  use one at a time. Please open an issue naming the plugin so it can be added to the detector.

## Building from source

Both plugins are plain, unbundled JS/Python: no `npm install` or build step is required. To produce an
installable zip from either folder:

```sh
cd decky
zip -r SteamU.zip steamu   # or steamu-led
```

Decky's "Install plugin from ZIP" expects the plugin folder (containing `plugin.json`) at the root of the zip.

## If Steam misbehaves

- **Emergency stop**: hold L3 + R3 (click both sticks) for 4 seconds on any Steam screen. SteamU stops and Steam
  reloads its own original interface until the next restart.
- **Turn SteamU off from Decky**: the plugin's own quick-access panel has an "SteamU enabled" switch.
- **Diagnostic report**: Settings → SteamU → the plugin can write a zip to your Downloads folder with logs and
  version info for a bug report; it scrubs usernames, account names/IDs, serial numbers, and IP/MAC addresses
  before writing anything (see `py_modules/diagnostic.py`).
- To go back entirely: uninstall the plugin from Decky.

## Identifiers are mostly French

The development team is French-speaking, and most function/variable names, and the code comments that existed
before this export stripped them, were written in French. Pull requests that keep existing French identifiers
(rather than renaming wholesale) and add English comments are very welcome; full renaming is a larger
conversation best had in an issue first.

## Status and scope

This is a hobby project, built and tested on a single device (Lenovo Legion Go 2, 1920×1200) and a handful of
testers' Steam Decks. Expect some screens to look better on one screen size than another, and some strings to
still be French-only. No telemetry, no analytics, no network calls beyond the few documented, opt-in integrations
described in `ARCHITECTURE.md`.

## License

AGPL-3.0-or-later, see [`LICENSE`](LICENSE). Third-party code bundled for convenience (a DBus client, a
WebSocket client, a screen-colour sampler) keeps its own license notice in its own files/folder.
