# Changelog

## v0.1.9 (2026-10-22)

- Launching a game from the home screen no longer goes through Steam's game page and its loading spinner: SteamU's launch screen stays until the game's first picture, and when the game closes you are back on the home screen (B no longer leads into Steam).
- Plaza: icons no longer disappear when the plaza is opened again quickly.
- Home screen: the Miis get the same fix (their clock no longer runs backwards when the screen opens).
- SteamU's own apps open with a 1 to 1.5 s launch screen.
- Home screen: games from Unifideck (Epic, GOG, Amazon...) that are not installed are recognised as such. Thanks @lieserlV (#7).

## v0.1.8 (2026-10-22)

- SteamU can now update itself from GitHub. When a new version is out, a pinned notification appears; "See more" shows what's new, and "Install" installs it through Decky.
- You can turn off the update check in Settings, SteamU, Privacy.
- If SteamU's safety net has to stop it, a short crash report is saved in your Downloads folder by itself, and a notification tells you about it the next time it starts.
- Crash reports now include Decky's log.
- HOME Menu: "Close Software" works again without the Pause Games plugin (reported on a ROG Ally).
- Resetting SteamU and "Erase everything" now ask you to pick between two real buttons, with "Cancel" chosen first: pressing A twice no longer erases everything.
- Themes, "Delete theme": B cancels the request instead of closing the panel, and the A key is drawn on the chosen button.
- HOME Menu and quick settings: they no longer leave work running in the background once closed, and the paused game's picture no longer takes memory afterwards.
- Resuming a game no longer resumes it twice in a row.
- Texts that stayed in French are now translated: HOME Menu, quick settings, friends, your page, notifications, folders, game page, themes, arcade, casino, Mii Maker, plaza and credits.
- Dates and times follow Steam's language.

## v0.1.7-test (2026-10-21)

- Settings → Storage: the game list now fills the card (drives and usage bar are more compact), so several games are visible instead of one.
- Light mode, Settings → Storage: the selected game row was unreadable (Steam's dark grey background under dark text); it now uses SteamU's highlight (#3).
- Plaza: Miis talk much less, speech bubbles vary (never the same twice in a row) and come with long silences, like on the Wii U.
- Plaza: a short fade between the plaza and the home screen; the full opening animation plays only once per session.
- LEDs: no more small hitch every 10 seconds (reading the theme colour no longer touches the page).
- Status pill: CSS Loader battery themes (e.g. "Mobile Battery Theme") no longer mix with SteamU's battery icon.
- Updating SteamU without restarting Steam no longer breaks the top bar.
- Game page: play time is rounded to the minute (non-Steam shortcuts showed "16 h 53.60000000000002").
- Changing the grid zoom quickly no longer stutters: tile sizes and the animated background are measured once per change instead of on every tile and every frame.
- At 5 to 8 rows, tiles no longer touch each other: the gap between them stays at 10% of a tile step instead of shrinking to 6.5%.
- When Steam has just shown its own account chooser ("Who's playing?", and the PIN) at startup, SteamU no longer shows its welcome screen on top: you land on the home screen directly. With automatic sign-in, the welcome screen is unchanged.
- Game logos no longer flicker on zoom changes and scrolling: the previous logo stays underneath until the new one is drawn.
- On the very first Big Picture launch, Steam's own tips ("Welcome to Big Picture", "Steam Menu"…) no longer appear underneath SteamU's welcome screen: it waits until Steam has nothing on top.
- While a game is in the foreground, SteamU's home screen, Miis, animated background and animated tiles are paused: the Steam window no longer redraws behind the game (it was taking about 100 frames per second of GPU time from the game).
- Large libraries: the home screen no longer watches every tile on every frame, which lowers idle CPU with thousands of games.
- Small power budgets: below 8 W of TDP (quick settings), the animated background stays still and animated tiles show their first frame; they come back as soon as the TDP is raised or set to automatic.

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
