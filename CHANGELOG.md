# Changelog

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
