# SteamU original sounds

Everything in this folder was **synthesized from scratch** for SteamU (Python, numpy and scipy, encoded to Ogg Vorbis
with ffmpeg). No samples, no sound banks, nothing from Nintendo or any other third party.

## What is here

- **10 interface sounds** ("pop and bubbles" set): cursor, confirm, back, open, close, tab, error, notification,
  success, lock. Very short and dry (cursor 75 ms, most under 0.25 s).
- **5 menu ambiences** and **14 app music loops** (20 to 32 s each): soft pads, muted bass, marimba, bells, felt
  piano, vibraphone, guitar and soft flute. Each loop is seamless: the reverb tail is folded back onto the start.

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

Original work made for SteamU, released with SteamU under the AGPL-3.0. No third-party sources or license
dependencies.
