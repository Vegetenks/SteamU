# Roadmap: performance

SteamU should feel the same on any hardware and any library size, and never get in the way of your games.
Issue #1 (Steam freezing with very large libraries) is fixed in v0.1.5. Here is what comes next.

## Already done, coming in the next build
- Tiles no longer flicker when changing the grid zoom or scrolling: a tile keeps its previous image until the new one is ready.
- Animated tile artwork (optional setting) no longer turns white or flickers: its video pauses off screen instead of being destroyed.
- The animated background no longer triggers needless work on every frame, and requests one frame per drawing.

## Next
1. **Only build the tiles near the screen.** Today every installed game gets a tile, even far off screen: with thousands of games and shortcuts, that weighs on memory. Tiles will be created a few screens ahead, in the direction you scroll, with their shape and colour first and the image right after, and kept for a while once built, so that even a fast touch scroll never shows empty tiles. This will be checked frame by frame on a simulated library of several thousand games before release.
2. **Lighter first start on huge libraries.** The first launch prepares a small copy of every artwork (they are cached afterwards). This work will be spread out and limited to what you are about to see.
3. **Lower CPU while the home screen is idle.** The animated background, animated tiles and Miis keep the screen busy. Options being evaluated: a calmer background frame rate, and pausing all animations after a while without input.
4. **Zero cost while you play.** While a game runs, the home screen is hidden and its animations stop. This will be measured in real games and kept as close to zero as possible.

## How to help
If SteamU is slow or unstable on your machine, open an issue and attach a diagnostic report (Quick Access → Decky → SteamU → *Diagnostic report*): it records your library size, Game Mode or Desktop Mode, and where the CPU goes.
