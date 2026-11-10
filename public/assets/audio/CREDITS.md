# Audio credits

Every file in `lofi/` and `featured/` must be listed below with its title, artist, source, and license.
The build prints a warning for any file that is missing here.

Files marked **PRIVATE ONLY** have no license for public use. Daniel chose to publish them on the deployed
site while it is shared privately. Replace them with licensed tracks (or tracks Daniel has permission to use)
before a public launch.

## Music files

| File | Title | Artist | Source | License |
|---|---|---|---|---|
| `lofi/Lofi Beats.mp3` | Lofi Beats (a 65 minute mix) | [TODO: artist or channel] | [TODO: where it came from] | **PRIVATE ONLY: replace before public launch** |
| `featured/Rachmaninoff Piano Concerto No 2 Allegro Scherzando.mp3` | Piano Concerto No. 2 in C minor, Op. 18: III. Allegro scherzando (the speaker plays from the C major coda) | Sergei Rachmaninoff (composer, public domain); Valentina Lisitsa (piano); [TODO: orchestra and conductor] | [TODO: where it came from] | **PRIVATE ONLY: replace before public launch** (the composition is public domain, this recording is not) |

To add a track: drop it in `lofi/` (shuffled in the background) or `featured/` (the speaker plays the first
file), add a row above, and restart `npm run dev`. Lofi titles in the pause menu come from the file name.

## Synthesized sounds

Generated live in the browser with the Web Audio API (`src/audio.ts`); no files, no third party licenses.

| Sound | Source |
|---|---|
| Interface clicks, panel open and close, found chime, door, wake up | Self made (oscillators) |
| Footsteps (carpet in the dorm, wood at home) | Self made (filtered noise) |
| Cat meow and purr | Self made (oscillators) |
| Piano notes | Self made (additive synthesis) |
| Dorm room tone (soft hum, distant campus blips) | Self made (filtered noise and oscillators) |
