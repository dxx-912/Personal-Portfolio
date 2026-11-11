# TODO: what the site still needs (after content pass 1)

Rewritten from `CONTENT_FINAL.md`. Only what is still missing is listed here; everything else is on the site.

How things show up until they are filled: in development (`npm run dev`) a missing line shows as a yellow `[TODO: ...]` and a missing photo as a striped "photo coming soon" box. A production build (`npm run build`) hides both, in the game and in the quick view, and prints the remaining TODOs in the build log.

- Copy lives in `src/content/` (`profile.ts`, `dorm.ts`, `home.ts`, `ui.ts`, `portfolio.ts`).
- **Photos:** drop them into the matching folder in `photos/`, then run `npm run photos` (it also runs with `npm run dev`). See `photos/README.md`.
- **Decor images** (posters, logos) go in `photos/3 Room decor (optional)/`. Restart `npm run dev` after adding one.

---

## Dorm (professional)

The dorm copy is done. Left:

- [ ] **Ateball quarter and year** (`timeline` on the Ateball tab in `src/content/dorm.ts`; now "12 weeks").
- [ ] **Hope For Hearing tone pass pending.** The founding story is in as written (with the dollar fixes). Do your own tone edit in `dorm.shirt.more` when ready.
- [ ] **Photos for empty folders:**
  - `1 Dorm/07 Grad cap, Upper Canada College/Graduating class hat toss (1 photo)`
  - `1 Dorm/07 Grad cap, Upper Canada College/You leading Asian Heritage & Culture Club (1 photo)`
  - `1 Dorm/09 Hope For Hearing shirt/Gallery (any number)`

## Home (personal): not filled in yet

Every home panel keeps its current copy and placeholders. The photo folders are ready under `photos/2 Home/`, all empty.

- [ ] **1. Window, North York:** names of the library and cafe (or keep them unnamed), a line or two on what home means to you. Gallery photos.
- [ ] **2. Shelf:** rowing (which crew, which championship, year, result), beach volleyball (how often, where, who with), the three plaques (event and year for each), a line on each favorite read. Photos: rowing trophy and oar, beach volleyball, the three plaques (once those exist, the pixel plaques get redrawn to match).
- [ ] **3. Pull up tower, exercise:** confirm "lifts and sprints or runs almost every day", a current goal or favorite lift. Photos or short clips: muscle up, trap bar deadlift, physique.
- [ ] **4. Speaker, music:** why music matters to you, a few favorite artists, your main Spotify playlist link (the lofi playlist is in).
- [ ] **5. Camera, photography:** how you got into it, what you like to shoot, which camera. 8 to 15 of your best photos.
- [ ] **6. Nightstand, family:** how you want to describe them, one line. Family photos (and `family-photo.png` for the frame).
- [ ] **7. Piano:** confirm 12 years, favorite piece, one line on what piano means to you. Recital photos. (The credential is in.)
- [ ] **8. Pie, baking and cooking:** signature things you make, one line. Food photos, you cooking, you baking.
- [ ] **9. Fluffy:** breed or description, age, how you got him, personality. Photos.
- [ ] **10. Longboard:** how the build went, what happened to the battery, what you learned, current state. Build, soldering, and battery photos.

## Quick view (`/portfolio`)

- [ ] **Work card order** (`cardOrder` in `src/content/portfolio.ts`). Undecided; the current order stays: Cold Outreach Automator, Saved posts scroller, Ateball, Genesis, L.E.K., DSP and IBB.
- [ ] **One fun fact per inventory box** (`funFact`, shown when a box flips): rowing, piano, longboard, Fluffy, photography, baking, music, exercise, beach volleyball (also North York and family, which stay as boxes).
- [ ] **Open Graph image:** `public/og/portfolio.png` is an old screenshot of the hero. Retake it now that the headshot and tagline are in.
- [ ] **Site URL** (`profile.siteUrl`) once the domain is chosen, for canonical and Open Graph URLs.

## Wording to confirm

- **Major.** The site says "B.A. Economics, B.S. Cognitive Science" (one constant, `MAJOR` in `src/content/profile.ts`). You are double checking it against your resume, which says Business Economics.
- **Hope For Hearing role.** The site calls you "Founder" (card label and role). The story credits Roy with the foundation; say if "Co-founder" fits better.

## Decor images (optional)

Never drawn by us; an original placeholder shows until the file exists. Drop each into its folder in `photos/3 Room decor (optional)/`. Still empty:

| File in `public/assets/decor/` | Where | Placeholder now |
|---|---|---|
| `can-logo.png` | The Red Bull can from the dorm fridge | Plain blue and silver can |
| `shirt-logo-ucla.png` | Chest of the UCLA shirt (closet outfit) | Plain "UCLA" in gold pixel text |
| `volleyball-logo.png` | Volleyball on the home shelf | No logo |
| `family-photo.png` | Home nightstand photo frame | Outline silhouettes of people |
| `poster-home-1.png`, `poster-home-2.png`, `poster-home-3.png` | Home wall frames | Abstract patterns in the home palette |
| `poster-caricature.png` | Not placed yet; say where you want it | Hidden until the file exists |

## Audio (`public/assets/audio/`, credits in `CREDITS.md`)

- [ ] **PRIVATE ONLY: replace before public launch.** `lofi/Lofi Beats.mp3` and `featured/Rachmaninoff Piano Concerto No 2 Allegro Scherzando.mp3` have no license for public use. Swap them for licensed tracks (or confirm you have the rights) before sharing the site publicly, and fill in artist and source in `CREDITS.md`.
- [ ] **Coda start time:** the speaker starts the featured track at 10:12 (`featuredStart` in `src/content/music.ts`). Confirm by ear.

## Art and decisions

- [ ] **itch.io asset pack** (link and license; fixes the tile size), or keep placeholders.
- [ ] **Character commission** (artist or platform, status). Sheet: idle, walk in 4 directions, sleep, wake, sit, pet (crouch), ride longboard, pull up, a small cheer, plus the closet outfits as overlay layers: the tee on its own layer (recoloured for the black Stussy and UCLA shirts), a white tank top, and a full suit. Placeholder frame is 16x22 (`CHAR_FRAME` in `src/config.ts`).
- [ ] **Cat commission** (same artist?): fluffy cream and golden longhair, round face, green eyes. Idle, walk, sit, sit with eyes closed, curled up asleep, bat paw.
- [ ] **Spare work table slot** at home: what goes there, or leave clutter.
- [ ] **Public launch date** and **custom domain**.
