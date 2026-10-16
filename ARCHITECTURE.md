# Architecture

SteamU is a [Decky Loader](https://decky.xyz) plugin. Decky runs its Python backend (`main.py`) alongside Steam
and exposes a small JS/TS frontend API inside Steam's own UI process. SteamU uses that frontend slot only for a
small quick-access panel (`decky/premium-clear-view/dist/index.js`); everything you actually see — the home
screen, menus, themes, the plaza, the casino, the Mii Maker — is injected straight into Steam's own UI windows
over the Chrome DevTools Protocol (CDP). That split is the core of how the plugin works, so it's covered first.

## 1. How the plugin gets into Steam's windows

Steam's gamepad UI (desktop config mode, SteamOS, Bazzite…) is a Chromium/CEF app. When it (or Decky) opens it
with remote debugging enabled, every window of that UI is a CDP "target" reachable at `http://127.0.0.1:8080/json`
on the machine itself. `py_modules/moteur.py` is a small polling loop (`boucle()`, started by `main.py` in a
background thread) that, roughly once a second:

1. **Finds `SharedJSContext`**, a hidden page all of Steam's windows share modules through, and the main window
   (titled `SP` on SteamOS/Bazzite, or containing `"Big"` elsewhere).
2. **Reads a "class map"** from `SharedJSContext` (`CARTE_JS`): it walks Steam's webpack module registry looking
   for objects whose values look like CSS class names, and keeps the ones that look like a readable-name →
   obfuscated-class dictionary. This map is what lets the theme survive a Steam UI update: the stylesheet and
   scripts never reference a real (and ever-changing) obfuscated class name directly.
3. **Compiles the stylesheet and every script** that use the placeholder syntax `{{Name@Neighbor}}` — "Neighbor"
   is any property known to live on the same object as "Name" in the class map, used to disambiguate — into real
   selectors (`compiler()`). Compiled output is cached by file mtime/size plus the class map's identity, so a
   quiet UI redraws nothing.
4. **Injects per window**, via `Runtime.evaluate`, a different list of scripts depending on which Steam window
   it's talking to:
   - `SCRIPTS_PRINCIPALE` — the main window: the home screen, library, themes, plaza, Mii Maker, casino, friends,
     notifications, music, settings… (almost every user-facing screen lives here).
   - `SCRIPTS_MENU` — the Steam-button HOME menu window (`MainMenu`).
   - `SCRIPTS_ACCES` — the quick-access (right-trigger) window (`QuickAccess`).
   - `SCRIPTS_BULLES` — Steam's notification toast window.
   Every list starts with `secours.js` (the safety net, §3) loaded first and independently of everything else.
   A script is only re-sent to a window once its own compiled version changes, tracked via a hash stashed on
   `window.__pcvScripts` inside that window.
5. **Injects a stylesheet into the Store/Community web views** the same way, plus a loading veil
   (`Page.addScriptToEvaluateOnNewDocument`) so the themed store CSS is already present before the page paints.
6. **Watches for a "fall"**: if a window it just themed gets replaced (Steam UI crash-reload) within a short
   window, or a script injection throws, that counts as one "fall" — see §3.

All of this only ever calls `Runtime.evaluate`/`Page.*` on `127.0.0.1` targets (`local()` rejects anything else)
and never clicks, navigates, or reads account data; it only paints.

## 2. i18n

`greffon/i18n.js` is loaded first in every window (right after the safety net) and defines
`window.__pcvT(key, vars)`. The dictionaries themselves live in `greffon/i18n/{fr,en,es}.json` and are embedded
verbatim into `i18n.js` by a small dev-side script, so the running plugin needs no extra network or file read to
translate a string; every other script calls `window.__pcvT` (importing from `window.opener` where needed) with
a fallback chain of current language → English → the raw key, so a missing translation never breaks a screen.
Steam's own UI language (`LocalizationManager`) picks which dictionary is active.

## 3. The safety net

SteamU is designed to never be able to brick Steam's UI beyond a restart:

- **`secours.js`** is injected first, in every window, independently of the rest of the plugin. It does two
  things only: (a) listens for L3+R3 (both stick clicks) held 4 seconds and, on trigger, tells the backend to
  enter "emergency stop" and reloads Steam's UI with no SteamU scripts at all; (b) records the window's own JS
  errors/unhandled rejections (capped at 200 entries) for the diagnostic report.
- **`moteur.Secours`** (in `moteur.py`, persisted to `secours.json` under Decky's settings folder) tracks
  "falls": the main window reloading unexpectedly soon after SteamU painted it, or an injection throwing. Three
  falls in a ten-minute window trip **safe mode**: nothing more is injected and Steam keeps its own interface
  until someone resumes it from the Decky quick-access panel. Safe mode and emergency stop both show a toast
  (via Decky's own toaster) explaining what happened and how to resume, localized to fr/en/es.
- **The Decky panel toggle** ("SteamU enabled", `dist/index.js`) lets you pause/resume manually the same way, and
  reflects the current state (enabled / paused-safety / paused-emergency / paused-manually).
- **Other-plugin conflict notice** (`py_modules/conflits.py`): on install/update, SteamU checks — read-only,
  never disabling anything — whether CSS Loader (by an active theme on disk, or its `<style>` tag already in a
  Steam window) or Game Glance is also installed, and shows a one-time toast plus a persistent notice in
  Settings → SteamU if so, since both can restyle the same windows SteamU does.
- **The diagnostic report** (`py_modules/diagnostic.py`, Settings → SteamU) bundles version info, recent logs,
  the safety-net history, recorded JS errors and which scripts loaded successfully into one zip in your Downloads
  folder — after scrubbing usernames, home folder, machine name, Steam account name/handle/SteamID/family group,
  serial numbers, machine IDs, and IP/MAC addresses from every string, so it's safe to attach to a bug report.

## 4. Main screens

| Screen | Entry point(s) | Notes |
|---|---|---|
| Home screen | `greffon/accueil.js` | Grid replacing Steam's library home; reads real library data only. |
| HOME menu (Steam button) | `greffon/menu-home.js`, `menu-pont.js`, `menus-commun.js` | Drawn over Steam's own `MainMenu` window; every action still runs Steam's real menu entry. Pauses the running game (SIGSTOP/SIGCONT of its process tree) while open. |
| Quick settings | `greffon/acces-rapide.js`, `menus-commun.js` | Drawn over the `QuickAccess` window; every control is still Steam's own setting (brightness, TDP, Wi-Fi, Bluetooth…). |
| Settings → SteamU page | `greffon/steamu.js` | Contributors, Import, "Your apps" status (Mii Maker/Casino/Badges/Sounds), Privacy toggles, Reset options, Appearance. |
| Themes | `greffon/themes.js`, `themeplaza.js`, `themezer.js` | Full day/night skins (wallpaper, accent colour, per-space backgrounds, sounds, music); `themeplaza.js`/`themezer.js` add community theme browsing (§6). |
| Plaza | `greffon/place.js` (2D fallback) / `place3d.js` (full 3D with real Mii) | Modeled on the Wii U's WaraWara Plaza. |
| Casino | `greffon/casino.js` (+ `casino-jeux.js`) | Badge-collecting mini-game. |
| Mii Maker | `greffon/mii-maker.js`, `mii-base.js`, `mii-qr.js`, `vrais-mii.js` | Drives a separately-loaded Mii rendering engine; see §7 — contains no Nintendo code or assets itself. |
| Music / lyrics | `greffon/medias.js`, `acces-rapide.js` lyrics tab, `py_modules/paroles.py` | Lyrics are fetched from LRCLIB only if the user opts in (Settings → SteamU → Privacy). |

## 5. The import tool

Users bring their own files; **SteamU bundles no Nintendo file of any kind** (no ROM, firmware, sound bank, or
3D model). `py_modules/importer.py` is the single entry point (Settings → SteamU → Import): the user points it
at one file, one folder (e.g. a copied 3DS SD card), or an archive, and it sorts everything **by content**, never
by file name — each registered recognizer inspects a header/size and claims or ignores a file. Recognized pieces
(a Mii database, console sound banks identified by audio fingerprint, 3DS container files opened with the
user's own console key, etc.) are decoded by format-specific helpers (`mii.py`, `badges.py`, `ctr.py`, `bch.py`,
`bcsar.py`, …) and written to a private, gitignored folder outside the plugin tree. Nothing is ever deleted —
superseded files are moved to a timestamped trash folder instead. None of this touches the network.

## 6. Community theme browsing

`themeplaza.py` and `themezer.py` let the Themes screen search and install community themes from ThemePlaza and
Themezer without scraping or bypassing anti-bot protection: requests go through a real, hidden Steam browser view
pointed at the actual site, and the Python side only ever receives a handful of safe, pre-built parameters (a
search string, a page number, an already-seen result ID) and revalidates every response (status, content type,
size) before converting it. If a site shows an anti-bot challenge, the hidden view is shown so a human can solve
it by hand. `infinimii.py` follows the same model for browsing community Mii QR codes.

## 7. The Mii Maker and the Mii rendering engine

`greffon/mii-maker.js` (plus `mii-base.js`, `mii-qr.js`, `vrais-mii.js`) implements the Mii Maker's UI and logic,
but it contains **no Nintendo code and bundles no Nintendo asset**. It expects a Mii rendering engine (Nintendo's
own FFL library and resource file) to be supplied separately by the user's own import, and checks for it before
doing anything — without it, it says so and never fabricates or imitates a Mii. See §5 for how those files reach
the plugin (always via the user's own import, keyed by content fingerprint, never bundled).

## 8. LED companion (`decky/steamu-led/`)

On a Lenovo Legion Go 2, the controller's vendor HID interface needed to set per-ring stick LED colours is only
writable as root. Rather than make the whole SteamU plugin (or Decky itself) run with more privilege than it
needs, `steamu-led` is a second, separate, root Decky plugin that does **only** this one thing:

- It listens on a Unix socket (`/run/steamu-led/led.sock`, directory owned by root/0755, socket owned by the
  Decky user/0600) for fixed-size (12 byte) binary messages: mode + RGB + brightness + speed, for the left and
  right stick independently. It accepts no shell commands, no file paths — just that one message shape — and
  rate-limits writes to the hardware.
- SteamU's own (non-root) `py_modules/lumiere.py` is the only thing that talks to that socket, deciding *what*
  colour to send (theme accent colour normally, the casino's own ambience while the casino screen is open,
  honouring the user's HueSync config if present) — it never touches the hardware directly.
- On unload, the socket is removed and the kernel's own single-colour LED control is handed back.

This keeps the privileged surface to "accept 12 fixed bytes, write them to the one HID report they describe" —
nothing path-, shell-, or network-shaped ever crosses into the root process.

## 9. Build, install, contribute

Both plugins are deliberately dependency-free: no `npm install`, no bundler. To turn either `decky/*` folder into
something Decky can install, zip the folder itself (containing `plugin.json`) at the root of the archive — see
the README's "Building from source". For day-to-day development, Decky Loader also picks up a plugin placed (or
symlinked) directly under its plugins folder with developer mode enabled, which avoids re-zipping on every edit.

Contributions are welcome, especially translations and fixes to non-French identifiers' surrounding English
comments (see the README's note on French identifiers). When touching `py_modules/moteur.py`'s injection lists
or `secours.js`, please keep the safety-net guarantees in §3 intact — that code is what stands between a bug and
an unusable Steam UI.
