# Changelog

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
