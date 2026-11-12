# TODO: what the site still needs (after content pass 2)

Rewritten from `CONTENT_FINAL.md` after content pass 2 (home side). Only what is still missing is listed here; everything else is on the site.

How things show up until they are filled: in development (`npm run dev`) a missing line shows as a yellow `[TODO: ...]` and a missing photo as a striped "photo coming soon" box. A production build (`npm run build`) hides both, in the game and in the quick view, and prints the remaining TODOs in the build log.

- Copy lives in `src/content/` (`profile.ts`, `dorm.ts`, `home.ts`, `ui.ts`, `portfolio.ts`).
- **Photos:** drop them into the matching folder in `photos/`, then run `npm run photos` (it also runs with `npm run dev`). See `photos/README.md`.
- **Decor images** (posters, logos) go in `photos/3 Room decor (optional)/`. Restart `npm run dev` after adding one.

---

## Dorm (professional)

- [ ] **Ateball quarter and year** (`timeline` on the Ateball tab in `src/content/dorm.ts`; now "12 weeks").
- [ ] **Hope For Hearing tone pass pending.** The founding story is in as written. Do your own tone edit in `dorm.shirt.more` when ready.
- [ ] **Photos for empty folders:**
  - `1 Dorm/07 Grad cap, Upper Canada College/Graduating class hat toss (1 photo)`
  - `1 Dorm/07 Grad cap, Upper Canada College/You leading Asian Heritage & Culture Club (1 photo)`

## Home (personal)

All home copy is in (content pass 2). Left:

- [ ] **Beach volleyball:** a description if you want one (for now the line is your fun fact), and photos (the folder and photo slot were removed at your request; say when you want them back).
- [ ] **Family photos:** `2 Home/06 Nightstand, family/Gallery (any number)`, plus `family-photo.png` for the nightstand frame (see Decor images).
- [ ] **Longboard photos:** `2 Home/10 Longboard/` (Building it, Soldering, The destroyed battery).
- [ ] **Tone pass pending: baking and longboard.** Both are in as you wrote them (light spelling and grammar fixes only). Edit `home.pie` and `home.longboard` in `src/content/home.ts` when ready.

## Quick view (`/portfolio`)

- [ ] **Open Graph image:** `public/og/portfolio.png` is an old screenshot of the hero. Retake it now that the headshot and tagline are in.
- [ ] **Site URL** (`profile.siteUrl`) once the domain is chosen, for canonical and Open Graph URLs.

## Wording to confirm

- **Major.** The site says "B.A. Economics, B.S. Cognitive Science" (one constant, `MAJOR` in `src/content/profile.ts`). You are double checking it against your resume, which says Business Economics.

## Decor images (optional)

Never drawn by us; an original placeholder shows until the file exists. Drop each into its folder in `photos/3 Room decor (optional)/`. Still empty:

| File in `public/assets/decor/` | Where | Placeholder now |
|---|---|---|
| `can-logo.png` | The Red Bull can from the dorm fridge | Plain blue and silver can |
| `shirt-logo-ucla.png` | Chest of the UCLA shirt (closet outfit) | Plain "UCLA" in gold pixel text |
| `volleyball-logo.png` | Volleyball on the home shelf | No logo |
| `family-photo.png` | Home nightstand photo frame | Outline silhouettes of people |
| `poster-caricature.png` | Not placed yet; say where you want it | Hidden until the file exists |

## Audio (`public/assets/audio/`, credits in `CREDITS.md`)

- [ ] **PRIVATE ONLY: replace before public launch.** `lofi/Lofi Beats.mp3` and `featured/Rachmaninoff Piano Concerto No 2 Allegro Scherzando.mp3` have no license for public use. Swap them for licensed tracks (or confirm you have the rights) before sharing the site publicly, and fill in artist and source in `CREDITS.md`.
- [ ] **Rachmaninoff start time:** the speaker starts the featured track at 10:12 (`featuredStart` in `src/content/music.ts`). Confirm by ear.

## Art and decisions

- [ ] **itch.io asset pack** (link and license; fixes the tile size), or keep placeholders.
- [ ] **Character commission** (artist or platform, status). Sheet: idle, walk in 4 directions, sleep, wake, sit, pet (crouch), ride longboard, pull up, a small cheer, plus the closet outfits as overlay layers: the tee on its own layer (recoloured for the black Stussy and UCLA shirts), a white tank top, and a full suit. Placeholder frame is 16x22 (`CHAR_FRAME` in `src/config.ts`).
- [ ] **Cat commission** (same artist?): fluffy cream and golden longhair, round face, green eyes. Idle, walk, sit, sit with eyes closed, curled up asleep, bat paw.
- [ ] **Spare work table slot** at home: what goes there, or leave clutter.
- [ ] **Public launch date** and **custom domain**.
