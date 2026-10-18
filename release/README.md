# SteamU v0.1.2 (test build)

**SteamU v0.1.2 (test build).** This is an early version for testers: expect bugs, and please report them.

SteamU turns Steam's Big Picture mode / Game Mode into a console interface inspired by the Wii U and 3DS home menus (home grid, HOME menu, quick settings, notifications, friends, plaza…).

### What's new in v0.1.2
- Home screen memory/CPU fix: tile entry animations are released once played (issue #1).

### v0.1.1
- SteamU no longer injects into Steam's desktop-mode windows, only Game Mode / Big Picture (issue #1).
- Faster return to the home screen.
- Notifications: delete one, "Clear all", buttons reachable with the D-pad.

Full list in [CHANGELOG.md](../CHANGELOG.md).

### Install
1. Download [SteamU-v0.1.2-test.zip](https://github.com/Vegetenks/SteamU/raw/main/release/SteamU-v0.1.2-test.zip).
2. In Decky Loader: Settings → Developer → *Install plugin from ZIP file*, pick the zip.
3. Restart Steam (or the console). The SteamU welcome screen appears: press A.

### Your Miis
SteamU ships no Nintendo files. Without them, the plaza stays empty and a notification "Import your Miis" appears on first start: press *See more* to open the import page (Settings → SteamU → Import), which explains how to bring your own files.

### Known issues
- Steam's own Library and game pages still overlap in places (tabs over game covers, header pills under the top bar).
- A game added to the home screen is not selected when you come back to the home screen.
- The full-screen menus (HOME, quick settings) don't use the new shared button legend yet.
- Non-Steam shortcuts show their raw file name where Steam does.

Please report anything else you find (screenshots welcome) in the GitHub issues.
