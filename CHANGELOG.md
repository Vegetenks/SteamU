# Changelog

## v0.1.6-test (2026-10-21)

Tested on a Bazzite KDE machine in Desktop Mode with Big Picture at login, like issue #1's reporter.

- Library: when there are many categories (Unifideck's GOG, Epic, Amazon… or your own collections), the tab row now scrolls horizontally and the selected tab is brought back to the centre. Based on a pull request by @lieserlV (#6).
- SteamU waits until Steam has finished signing in (account choice, PIN) before showing anything (#2).
- Light mode: Steam texts that stayed white on light backgrounds (Storage, account switcher…) now follow the theme's text colour (#3).
- On a new home grid, system apps (Customize, casino…) come before the games; Settings → SteamU → Troubleshooting can put them back at the start (#4).
- Machines without a battery no longer show a battery in the quick settings and status pills (#5).
- Tiles no longer flicker or turn blank when changing the zoom or scrolling; animated tiles no longer turn white. Game logos can still flicker briefly on zoom changes (being worked on).

## v0.1.5-test (2026-10-18)

- Main fix for issue #1: the home screen no longer decodes full-size game images. Every installed game is on the home grid, and each tile used to load its artwork at full size (heroes of 3840 × 1240, ~19 MB once decoded), with its fallback images stacked underneath. Custom artwork (non-Steam shortcuts, SteamGridDB) was never shrunk at all, and animated custom artwork (animated PNG/WebP) was decoded again at full size for every frame of its animation. With a large library, Chromium's image cache overflowed and kept re-decoding, until steamwebhelper fell over. Now:
  - each tile shows a copy shrunk to its on-screen size, made two at a time and kept between sessions;
  - only tiles on or near the screen are painted;
  - animated artwork shows its first frame (as before for Steam's own images).
  Measured on a Legion Go 2: 316 image decodes every 5 s on the home screen before, none after; GPU process time divided by ~9.
- All image work for the tiles (shrinking, checking logos and artwork, framing covers) now goes through one bounded queue, tiles on screen first. If an image can't be read, the tile uses its next fallback instead of the full-size original. Unused copies are released (32 MB budget), off-screen videos are unloaded, and a reloaded plugin stops its previous instance's work.
- Startup: SteamU no longer runs Steam's own modules just to find its CSS classes, and stops loading right away when its crash safety triggers. Music is only decoded when it starts playing.
- Optional animated tiles (off by default): an animated artwork plays as a small video made once, instead of being decoded at full size for every frame.
- Diagnostic report: now records the size of your library (installed games, non-Steam shortcuts, custom artwork), the state of the home grid, whether Steam runs in Game Mode or Desktop Mode, and the crash-related lines of Steam's own logs. Memory is now read in the Big Picture window.
- Diagnostic report: the performance results are also saved step by step in Downloads (steamu-performance-….json), so they survive if Steam crashes during the measurement; the report records which home screen (new or old) was measured.

## v0.1.4-test (2026-10-18)

- Diagnostic report: a ~35 s performance measurement on the home screen (CPU and memory per Steam process), repeated while hiding the animated background, the home grid and CSS animations one at a time, to pinpoint what loads the CPU on your machine (issue #1).
- The "Customize" bubble (Themes, Badges, Decorate) is now translated.

## v0.1.3-test (2026-10-18)

- Main fix for issue #1: when Steam renders without the GPU (software rendering: llvmpipe, SwiftShader…), the animated background is automatically kept still. Each of its frames forced a full-screen redraw on the CPU: measured ~170% of a CPU core at rest on the home screen, down to ~15-20%. With a GPU, nothing changes.
- The diagnostic report now tells how Steam renders (GPU or software).

## v0.1.2-test (2026-10-18)

- Home screen: the tile entry animations are released once played. The new home screen kept ~360 finished animations alive, one render layer per grid cell, which made memory and CPU climb, especially when Steam renders in software (issue #1).

## v0.1.1-test (2026-10-18)

- Fixed: SteamU no longer injects into Steam's desktop-mode windows (login, top menus); it only touches Game Mode / Big Picture (issue #1).
- Faster return to the home screen (the grid is no longer rebuilt every time).
- Notifications: delete one (Y or ✕), "Clear all", buttons reachable with the D-pad, a first-start "Import your Miis" notice.
- Game page: Y adds or removes the game from the home screen.
- One shared button legend across the interface.

## v0.1.0-test: first public test build (2026-10-16)

First public release of SteamU, exported from the private development tree and published under AGPL-3.0-or-later.
This is a **test** build: core screens are usable, some are still rough, and parts of the interface remain
French-only.

### Included
- `decky/steamu/`: the main plugin (home screen, HOME menu, quick settings, Settings → SteamU page,
  day/night themes, the plaza, the Mii Maker, a badge-collecting casino, music player with optional synced
  lyrics, and community theme browsing with ThemePlaza and Themezer).
- A safety net: an L3+R3 emergency stop, automatic safe mode after repeated crashes, a Decky on/off toggle, and
  a scrubbed diagnostic report generator.
- An import tool for bringing in your own console files (no Nintendo file is bundled, see `ARCHITECTURE.md`).

### Known limitations
- Built and tuned on a single device (Lenovo Legion Go 2, 1920×1200); other screen sizes may show layout issues.
- Several UI strings are still French-only (English/Spanish coverage is partial).
- No installer/updater beyond Decky's own "Install plugin from ZIP" yet.

### Privacy
No telemetry. The only outbound network calls are the explicitly opt-in or user-triggered ones documented in
`ARCHITECTURE.md` (community theme/Mii browsing, lyrics lookup, diagnostic report written locally only).
