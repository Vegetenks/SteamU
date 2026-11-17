# SteamU sounds

## Music: temcandoanything (CC BY 4.0)

The menu ambiences, the app music, the login, welcome and boot tracks are **modified versions** of tracks from
**The Soundtrack Of Frutiger Aero** (2024, https://temcandoanything.bandcamp.com/album/the-soundtrack-of-frutiger-aero)
and **The Soundtrack Of Frutiger Aero 2** (2025, https://temcandoanything.bandcamp.com/album/the-soundtrack-of-frutiger-aero-2)
by **temcandoanything** (https://temcandoanything.bandcamp.com), used with the artist's written permission
(9 November 2026) under the **Creative Commons Attribution 4.0 International** license (CC BY 4.0,
https://creativecommons.org/licenses/by/4.0/). The artist does not endorse SteamU or these changes.

Source files: the 16-bit, 44.1 kHz stereo FLAC files bought from Bandcamp. Each track's Ogg file keeps the original
title, artist, album, year and track number in its tags.

### Changes made by SteamU, in every music file

- **Sound effect removed.** Each track has a short sound effect (a rising "whoosh" glissando, about 2.5 s) layered
  over the music. SteamU removes it without touching the rest, in one of three ways (positions per file below,
  in seconds of the original track, rounded to 0.1 s; one bar = 4 beats):
  - *start trimmed*: the track starts at the first bar after the effect; a 0.4 s fade-in is added;
  - *end trimmed*: the track ends at the last bar before the effect (no fade-out);
  - *bars cut*: the bars between two positions are removed, and the two sides joined with an 80 ms crossfade (each
    side overlaps the join by 40 ms). The cut is chosen so the music on both sides of the join matches.
- **Loudness**: normalized to -20 LUFS integrated, true peak -1.5 dBTP, loudness range 11 LU (EBU R128, FFmpeg
  `loudnorm` in single pass, which can lightly even out the dynamics).
- **Encoding**: Ogg Vorbis, quality 4 (about 128 kbit/s), 44.1 kHz stereo (lossy).

No other change: no pitch or tempo change, no remix, no added sound, no other edit.

### File by file

| File | Track (album, track number) | Specific changes |
|---|---|---|
| ambiance-1 | Home (*The Soundtrack Of Frutiger Aero*, 2) | start trimmed: starts at 8.1 (effect at 2.9); 104.7 s of 112.8 s kept |
| ambiance-2 | Home (*The Soundtrack Of Frutiger Aero*, 2) | identical copy of ambiance-1 |
| ambiance-3 | frutiger aero (*The Soundtrack Of Frutiger Aero*, 11; also the bonus track 12 of *The Soundtrack Of Frutiger Aero 2*) | bars cut: 2.8 to 13.6 removed (effect at 8.2); 91.9 s of 102.7 s kept |
| ambiance-4 | Frutiger GUI (*The Soundtrack Of Frutiger Aero 2*, 5) | bars cut: 73.9 to 87.2 removed (effect at 77.6); 158.8 s of 172.1 s kept |
| ambiance-5 | Our Promised Future (*The Soundtrack Of Frutiger Aero 2*, 1) | bars cut: 4.6 to 36.6 removed (effect at 5.5); 93.4 s of 125.3 s kept |
| connexion | Our Promised Future (*The Soundtrack Of Frutiger Aero 2*, 1) | same audio as ambiance-5 (same changes, encoded separately) |
| notifs-bienvenue | Your New System (Welcome) (*The Soundtrack Of Frutiger Aero 2*, 2) | bars cut: 4.6 to 22.5 removed (effect at 10.3); 102.2 s of 120.0 s kept |
| place | Vector Flower Garden (*The Soundtrack Of Frutiger Aero 2*, 10) | start trimmed: starts at 3.7 (effect at 0.6); 136.2 s of 139.9 s kept |
| miimaker | Tropical Groove (*The Soundtrack Of Frutiger Aero*, 5) | start trimmed: starts at 6.5 (effect at 2.5); 143.1 s of 149.6 s kept |
| themes | Helvetica Aqua Aero (*The Soundtrack Of Frutiger Aero*, 8) | bars cut: 113.8 to 127.2 removed (effect at 122.5); 122.9 s of 136.2 s kept |
| boutique | Electronic Shop (*The Soundtrack Of Frutiger Aero*, 10) | start trimmed: starts at 7.1 (effect at 1.5); 115.5 s of 122.5 s kept |
| parametres | Settings (*The Soundtrack Of Frutiger Aero*, 9) | bars cut: 9.1 to 32.1 removed (effect at 20.5); 121.6 s of 144.6 s kept |
| notifs | Thank You For Your Purchase (*The Soundtrack Of Frutiger Aero*, 3) | start trimmed: starts at 7.5 (effect at 1.6); 109.1 s of 116.6 s kept |
| amis | Wired Or Wireless (*The Soundtrack Of Frutiger Aero 2*, 3) | start trimmed: starts at 5.7 (effect at 1.6); 127.7 s of 133.3 s kept |
| bibliotheque | Technozen Catalog (*The Soundtrack Of Frutiger Aero 2*, 9) | bars cut: 16.0 to 31.6 removed (effect at 19.6); 119.9 s of 135.5 s kept |
| medias | Photo Gallery (*The Soundtrack Of Frutiger Aero 2*, 8) | end trimmed: ends at 114.7 (effect at 116.2); 114.8 s of 128.0 s kept |
| telechargements | Data Transfer (*The Soundtrack Of Frutiger Aero 2*, 4) | bars cut: 11.2 to 32.8 removed (effect at 19.5); 164.0 s of 185.5 s kept |
| profil | Resort (*The Soundtrack Of Frutiger Aero*, 6) | start trimmed: starts at 7.7 (effect at 1.6); 112.3 s of 120.0 s kept |
| fiche | Save Data (*The Soundtrack Of Frutiger Aero*, 4) | bars cut: 4.7 to 19.9 removed (effect at 15.3); 133.2 s of 148.4 s kept |
| garde-robe | Pink And Glitter (*The Soundtrack Of Frutiger Aero 2*, 6) | start trimmed: starts at 4.9 (effect at 1.4); 136.2 s of 141.0 s kept |
| perso | Loading Time (*The Soundtrack Of Frutiger Aero*, 7) | start trimmed: starts at 8.4 (effect at 3.1); 115.9 s of 124.2 s kept |
| demarrage | Our Promised Future (*The Soundtrack Of Frutiger Aero 2*, 1) | **adapted into a new ambient pad** (none of the changes above): the excerpt from 40.0 to about 52.6 s is time-stretched about 10 times to 2 minutes (overlapping 0.6 s windows with random phases, "paulstretch" method), then low-pass filtered at 6 kHz, faded in over 3 s and out over 4 s, normalized to -24 LUFS (true peak -3 dBTP), encoded to MP3 then to Ogg Vorbis quality 4 at 48 kHz stereo |

Tracks not used: System Setup, Music Library (feat. Kasane Teto), Electronic Shop II.

### How SteamU plays them

The files are played as they are: each one repeats from its end to its start, the volume follows the player's
setting, and SteamU crossfades between two screens' music. Nothing else is changed while playing.

## Interface sounds: original

The interface sounds were **synthesized from scratch** for SteamU (Python, numpy and scipy, encoded to Ogg Vorbis
with ffmpeg). No samples, no sound banks, nothing from Nintendo or any other third party.

## What is here

- **10 interface sounds** ("pop and bubbles" set): cursor, confirm, back, open, close, tab, error, notification,
  success, lock. Very short and dry (cursor 75 ms, most under 0.25 s).

## How it was made

- Equal temperament, A4 = 440 Hz, C major; interface sounds use only the pentatonic scale.
- Envelopes: 1.5 ms half-cosine attack, exponential decay, 10 ms fade-out, silence padding so the Ogg codec never
  clicks at the edges; 25 to 30 Hz high-pass.
- Monophonic bass with 15 ms attack and 25 ms release, encoded at q6, to avoid uneven or crackling low notes.
- All melodies were written for SteamU and deliberately kept away from Nintendo's themes (different meters, keys and
  harmony).

## Checks (on the decoded files)

Peaks between -14.1 and -2.7 dBFS, no DC offset, clean first and last samples, every strong spectral peak within
11 cents of a scale note, and loop seams smaller than 99.9% of neighbouring sample steps.

## License

Interface sounds: original work made for SteamU, released with SteamU under the AGPL-3.0.
Music: temcandoanything, CC BY 4.0 (see above).
