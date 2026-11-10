# TODO: assets, copy, and decisions (iteration 2)

Everything the site still needs from Daniel. Every item here shows up on the site as a visible yellow `[TODO: ...]`, a striped "photo coming soon" box, or an original placeholder until it is filled.

- Copy lives in `src/content/` (`profile.ts`, `dorm.ts`, `home.ts`, `ui.ts`).
- **Photos: drag them into the matching folder in `photos/`, then run `npm run photos`.** Every photo listed below has its own folder there, in the same order. The script converts, resizes, and wires them in; see `photos/README.md`.
- Final art goes in `public/assets/<pack>/`. Then set `url` on the matching entry in `src/assets/manifest.ts` (keep `w`, `h`, `frames` matching the file).
- Decor images (posters, logos) go in `photos/3 Room decor (optional)/`. Restart `npm run dev` after adding one.

---

## Art and identity

- [ ] **itch.io asset pack:** link and license. It fixes the tile size (`TILE` in `src/config.ts`). Put its license in `public/assets/<pack>/LICENSE`.
- [ ] **Commissioned character sheet** (current placeholder frame is 16x22, `CHAR_FRAME` in `src/config.ts`): idle, walk in 4 directions, sleep, wake, sit, pet (crouch), ride longboard, pull up (hang and up), snap photo (optional), a small cheer for the completion moment. **The shirt must be on its own layer** (a second sheet with only the shirt, drawn in white or light grey) so the closet can recolour it. Look: East Asian young man, warm skin, big friendly smile, dark curly permed hair (short sides, curls on top, closer to the left photo in `reference/daniel-photos.png`), plain white tee, dark pants.
- [ ] **Cat sheet** (placeholder is 18x14): fluffy cream and golden longhair, round face, big green eyes. States: idle, walk, sit, sit with eyes closed (petted), curled up asleep, bat paw.
- [ ] **Final outfit colours** for the closet (now: white, black, UCLA blue, an orange graphic tee colour; `OUTFITS` in `src/game/Player.ts`).

## Decor images to provide (optional)

Never drawn by us. Until the file exists, an original abstract placeholder shows. Drop each into its folder in `photos/3 Room decor (optional)/` (it becomes the file below).

| File in `public/assets/decor/` | Where | Placeholder now |
|---|---|---|
| `poster-graduation.png` | Dorm wall above the desk, P1 | Pink and purple pixel pattern |
| `poster-damn.png` | Dorm wall above the desk, P2 | Red and white pattern |
| `poster-duck.png` | Dorm closet door, P3 | Yellow and white pattern |
| `poster-caricature.png` | Dorm wall, optional extra frame | Hidden until the file exists |
| `hoodie-logo.png` | Home hoodie on the wall hook, chest | Plain "TORONTO" text |
| `speaker-logo.png` | Home speaker badge | Small plain orange badge |
| `phone-screen.png` | Dorm phone screen | Grid of coloured squares |
| `family-photo.png` | Home nightstand photo frame | Outline silhouettes of people |

## Audio (`public/assets/audio/`, credits in `CREDITS.md` there)

- [ ] **PRIVATE ONLY: replace before public launch.** `lofi/Lofi Beats.mp3` and `featured/Rachmaninoff Piano Concerto No 2 Allegro Scherzando.mp3` have no license for public use. They play locally but are kept out of git, so the deployed site has no lofi and the speaker says "No track loaded yet" until licensed files are added. Fill in artist and source for each in `CREDITS.md`.
- [ ] **Coda start time:** the speaker starts the featured track at 10:12 (`featuredStart` in `src/content/music.ts`), just before the C major Maestoso. Confirm by ear.
- [ ] **Music panel:** a sentence on why you love it, and your dubstep playlist link (the lofi playlist is in).

## Little lines (`src/content/profile.ts`)

- [ ] **Wake up line.** Now: "Hey, I'm Daniel. Welcome to my dorm at UCLA." Confirm or replace.
- [ ] **HUD stat names and numbers.** Now: Caffeine 7/7, Sleep 2/6, Curiosity 200/200.
- [ ] **5 to 8 idle thoughts.** Now placeholders: "should probably do my readings", "what should I eat later...", "where did I leave my charger", "five more minutes", "hmm".

## Contact (`src/content/profile.ts`)

- [ ] One line tagline
- [ ] LinkedIn URL
- [ ] Email address to show publicly
- [ ] GitHub URL
- [ ] Resume PDF (put it at `public/media/resume/`)

---

## Dorm: Rieber Hall, UCLA (professional)

### 1. HUD portrait: About me (`dorm.about`)
- [ ] Confirm major wording (see "Wording to confirm")
- [ ] 2 to 3 sentences of background and experience
- [ ] Headshot

### 2. UCLA pennant: UCLA education (`dorm.pennant`)
- [ ] Confirm major wording
- [ ] Royce Hall photo

### 3. TO DO board: student orgs (`dorm.todo`)
- [ ] One line on each org: Sharpe Fellows, Delta Sigma Pi, the entertainment association, IBB, UBS Technology Committee, ResLife
- [ ] Your role in each (Sharpe Fellows is "Technology Vice President"; ResLife is "Resident Assistant")

### 4. Laptop: software projects (`dorm.laptop`)
- [ ] Cold email automator: what it is, why you built it, your role, the stack
- [ ] Saved posts scroller: what it is, why you built it, your role, the stack
- [ ] Ateball (Creative Labs): what it is, why you built it with CL, your role, link if public
- [ ] Ateball UI screenshots (3 slots)

### 5. "Consulting stuff" binder: consulting (`dorm.binder`)
- [ ] Genesis Alternative Ventures description (client, problem, what your team did, outcome)
- [ ] Genesis slide screenshots (3 slots)
- [ ] L.E.K. Case Competition description (the case, your recommendation, the year)
- [ ] L.E.K. slide screenshots (3 slots)

### 6. Phone: club marketing (`dorm.phone`)
- [ ] DSP: your role, description, skills used, measurable results
- [ ] DSP Vogue campaign graphics (3 slots) and website screenshot
- [ ] DSP rush video (YouTube id, or a compressed MP4)
- [ ] DSP website link
- [ ] IBB: your role, description, skills used, measurable results
- [ ] IBB graphics (3 slots) and website screenshot
- [ ] IBB rush video
- [ ] IBB website link

### 7. Grad cap: Upper Canada College (`dorm.gradcap`)
- [ ] UCC hat toss photo
- [ ] Business Club and Asian Heritage Club photos
- [ ] Extended essay link
- [ ] SAT proof: only if you want it shown (probably skip)

### 8. Closet: Resident Assistant (`dorm.closet`)
- [ ] A sentence or two on what the job is like
- [ ] RA photo

### 9. Hope For Hearing shirt (`dorm.shirt`)
- [ ] Role and years
- [ ] Founding story (meeting Roy on the subway), 2 to 4 sentences
- [ ] What it does and the impact so far
- [ ] What it taught you
- [ ] Milestones and stats
- [ ] Funding grants won (names, amounts if shareable)
- [ ] Gallery photos with captions (4 slots now; add as many as you like)

---

## Home: North York, Toronto (personal)

### 1. Window: North York (`home.window`)
- [ ] Names of the library and cafe (optional)
- [ ] Gallery photos (3 slots)

### 2. Shelf (`home.shelf`)
- [ ] Rowing: boat, year, a line on what it was like; trophy and oar photos (2 slots)
- [ ] Award plaque photos: DECA, FBLA CNLC, FBLA NLC (3 slots). Once these exist, the three pixel plaques get redrawn to look like the real ones.
- [ ] Favorite reads: done (plain text titles only, no franchise art)

### 3. Pull up tower: exercise (`home.pullup`)
- [ ] A line on why, or a current goal
- [ ] Photos or short clips: muscle up, trap bar deadlift, physique

### 4. Speaker: music (`home.speaker`)
- [ ] Why you love it, a sentence or two (dubstep, EDM, classical, R&B, hip hop)
- [ ] Dubstep playlist URL (the lofi playlist is linked and embedded)

### 5. Camera: photography (`home.camera`) *(new)*
- [ ] 2 to 3 sentences on why you love photography
- [ ] What you like to shoot, and with what
- [ ] A gallery of your own photos with captions (4 slots now)

### 6. Nightstand: family (`home.nightstand`)
- [ ] A few sentences about your parents and sister
- [ ] Family photos (3 slots), plus `family-photo.png` for the frame on the nightstand

### 7. Piano (`home.piano`)
- [ ] Exact ARCT credential name and a precise description (see "Wording to confirm")
- [ ] Recital photos (2 slots)

### 8. Apple crisp pie: baking and cooking (`home.pie`)
- [ ] Favourite things to make
- [ ] Food photos and photos of you cooking or baking (4 slots)

### 9. Cat (`home.cat`)
- [ ] His name
- [ ] How you got him
- [ ] His personality
- [ ] Photos (3 slots)

### 10. Longboard (`home.longboard`)
- [ ] Build process, 2 to 3 sentences
- [ ] How the battery got destroyed
- [ ] Build, soldering, and battery photos (3 slots)

---

## Portfolio view (`/portfolio`)

The quick view reads the same stories as the game, so filling an item above fills both. A production build hides any field that is still a TODO and prints the full list in the build log (`npm run build`). These are the extra fields the quick view uses (all in `src/content/dorm.ts` and `home.ts`, on the matching section):

- [ ] **Tagline** (`profile.tagline`) and confirm the hero line: "UCLA student building products, campaigns, and communities. Looking for product management roles in 2027." (`profile.focus`, from the mockup)
- [ ] **Work card order** (`cardOrder` in `src/content/portfolio.ts`). Draft: cold email automator, saved posts scroller, Ateball, Genesis, L.E.K., DSP and IBB.
- [ ] **For each work card** (cold email automator, saved posts scroller, Ateball, Genesis, L.E.K., DSP and IBB): `summary` (one line for the card face), `role`, `team`, `timeline`, `problem`, `whatIDid`, `result`, and 2 to 4 screenshots.
- [ ] **Confirm** Ateball role "Project manager" and Hope For Hearing role "Founder" (both from the spec).
- [ ] **Confirm the Hope For Hearing counters** "500+ members" and "12 institutions" are current (from the mockup), plus its `team`, `timeline`, `problem`, `whatIDid`, `result`, and a one line mission for the card.
- [ ] **Org tag names**: the entertainment association's exact name (shows as "BEA" for now).
- [ ] **Inventory labels** (`short` on each hobby): Rowing, national champ; Piano, ARCT; Built a longboard; Cat dad; Photography; Baking; Dubstep, EDM; Lift and sprint; North York; Family. Drafts, edit freely.
- [ ] **A one line fun fact for each hobby** (`funFact`): shown when a box flips over. Until then the flip shows a real line from the story where one exists.
- [ ] **Site URL** (`profile.siteUrl`) once the domain is chosen. Then canonical and absolute Open Graph URLs turn on.
- [ ] **Open Graph image**: `public/og/portfolio.png` is a screenshot of the hero today. Retake it once the headshot and tagline are in.
- [ ] Not shown in the quick view (in the game only): the award plaques and favorite reads on the shelf. Say if you want them as inventory boxes.

## Wording to confirm

- **Major.** The notes say "UCLA Economics major". You have also described a B.A. Business Economics and B.S. Cognitive Science double major. The site uses `[TODO: confirm major]` for now.
- **Org name.** The notes say "Business in Entertainment Association". Confirm the exact official name.
- **ARCT.** "Highest nonprofessional degree possible in Canada" is left out. Give the exact credential name and a verifiable description.
- **"We won the national rowing championship."** Kept as written. Consider naming the regatta or event and year so it reads as specific, not general.
- **"Honours student."** Kept from the notes. Confirm the exact program name if there is one.
- **Resident Assistant vs Residential Assistant.** The notes say "Residential", the spec says "Resident". The site uses "Resident Assistant". Use whatever UCLA calls it.
- **Solo Levelling.** Spelled the way you wrote it (the official English title is "Solo Leveling"). Your call.

## Consider adding (on the resume, not in the content notes)

Not added. Decide whether you want any of them. The work table's spare slot or a fourth laptop tab can hold them without changing the layout.

- NST internship (CEO's Office, 2026 Hong Kong Award Summit)
- LionChase investment banking analyst
- Bruin Finance Society senior editor
- Creative Labs project lead this quarter
- The NST summit site
- The IBB and DSP site rebuilds as projects in their own right

## Decisions

- [ ] Custom domain
- [ ] Whether to add any "Consider adding" items
- [ ] What goes in the spare work table slot (home)
- [ ] Final outfit colours for the closet
- [ ] Sound on or off by default (off, per spec)
