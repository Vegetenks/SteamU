# SteamU v0.1.10

**SteamU v0.1.10.** This is an early version for testers: expect bugs, and please report them.

SteamU turns Steam's Big Picture mode / Game Mode into a console interface inspired by the Wii U and 3DS home menus (home grid, HOME menu, quick settings, notifications, friends, plaza…).

### What's new in v0.1.10
- Home screen: Xbox Cloud Gaming games from Unifideck now appear as playable, with a small cloud showing they are streamed. Thanks @lieserlV (#10).
- Home screen: Unifideck games whose status is unknown (for example a GameVault server that is offline) are no longer shown as installed. Thanks @lieserlV (#10).

Already on v0.1.8 or later? SteamU offers this update by itself: a pinned notification appears, press Install.

### What's new in v0.1.9
- Launching a game from the home screen no longer goes through Steam's game page and its loading spinner: SteamU's launch screen stays until the game's first picture, and when the game closes you are back on the home screen (B no longer leads into Steam).
- Plaza: icons no longer disappear when the plaza is opened again quickly.
- Home screen: the Miis get the same fix (their clock no longer runs backwards when the screen opens).
- SteamU's own apps open with a 1 to 1.5 s launch screen.
- Home screen: games from Unifideck (Epic, GOG, Amazon...) that are not installed are recognised as such. Thanks @lieserlV (#7).

### What's new in v0.1.8
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

**v0.1.8 is the first version that can update itself.** Install it once from the zip below (or any later version); after that, SteamU tells you when a new version is out and installs it in one press.

### What's new in v0.1.7
- No more double sign-in screen: when Steam has just shown its own "Who's playing?" (and PIN), SteamU skips its welcome screen (#2).
- Settings → Storage: the selected game row is readable in light mode (#3), and the game list now fills the card (several games visible instead of one).
- Game logos no longer flicker on zoom changes and scrolling.
- While a game is in the foreground, SteamU pauses its home screen, Miis, animated background and animated tiles (about 100 frames per second of GPU time given back to the game).
- Lower idle CPU on the home screen with large libraries; below 8 W of TDP the animated background and animated tiles hold still.
- Changing the grid zoom quickly no longer stutters; at 5 to 8 rows, tiles no longer touch.
- Plaza: Miis talk much less, speech bubbles vary and come with long silences; a short fade between the plaza and the home screen.
- CSS Loader battery themes no longer mix with SteamU's battery icon; LEDs no longer cause a small hitch every 10 seconds.
- Updating SteamU without restarting Steam no longer breaks the top bar; play time on the game page is rounded to the minute.

### What's new in v0.1.6
- Tested on Bazzite KDE in Desktop Mode with Big Picture at login.
- SteamU now waits until Steam has finished signing in (account choice, PIN) before showing anything (#2).
- Light mode: Steam texts that stayed white on light backgrounds now follow the theme's text colour (#3).
- On a new home grid, system apps (Customize, casino…) come first; Settings → SteamU → Troubleshooting → *Move system apps back to the beginning* does it on an existing grid (#4).
- No battery shown on machines without one (#5).
- Library: the category row scrolls when there are many categories (Unifideck…), thanks to @lieserlV (#6).
- Tiles no longer flicker or turn blank on zoom changes and scrolling (logos may still flicker briefly).

### What's new in v0.1.5
- Main fix for issue #1: the home screen no longer decodes full-size game artwork. Each tile shows a copy shrunk to its on-screen size, made in a bounded queue (tiles on screen first) and kept between sessions. Custom and animated artwork (SteamGridDB, non-Steam shortcuts) is shrunk too; animated artwork shows its first frame. Large libraries (hundreds or thousands of games and shortcuts) no longer load everything at once.
- Startup is lighter, and SteamU stops loading right away when its crash safety triggers.
- Diagnostic report: also records your library size, Game Mode or Desktop Mode, and the crash-related lines of Steam's logs. If the home screen won't open, use the button from the Decky panel (Quick Access → Decky → SteamU → *Diagnostic report*).

### v0.1.4
- Diagnostic report: a ~35 s performance measurement on the home screen, repeated while hiding SteamU elements one at a time (issue #1).

### v0.1.3
- Main fix for the lag/crash of issue #1: when Steam renders without the GPU (software rendering), the animated background is kept still automatically (~170% of a CPU core at rest down to ~20%). With a GPU, nothing changes.
- The diagnostic report now says whether Steam renders with the GPU or in software.

### v0.1.2
- Home screen memory/CPU fix: tile entry animations are released once played (issue #1).

### v0.1.1
- SteamU no longer injects into Steam's desktop-mode windows, only Game Mode / Big Picture (issue #1).
- Faster return to the home screen.
- Notifications: delete one, "Clear all", buttons reachable with the D-pad.

Full list in [CHANGELOG.md](../CHANGELOG.md).

### Install
1. Download [SteamU-v0.1.10.zip](https://github.com/Vegetenks/SteamU/raw/main/release/SteamU-v0.1.10.zip).
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
