# TODO: assets, copy, and decisions

Everything the site still needs from Daniel. Every item here shows up on the site as a visible yellow `[TODO: ...]` or a striped "photo coming soon" box until it is filled.

- Copy lives in `src/content/` (`profile.ts`, `dorm.ts`, `home.ts`, `ui.ts`).
- Photos go in `public/media/<item-id>/` as WebP, at most about 1600px on the long edge. Then set `src: '/media/<item-id>/<file>.webp'` on the matching image in the content file.
- Final art goes in `public/assets/<pack>/`. Then set `url` on the matching entry in `src/assets/manifest.ts` (keep `w`, `h`, `frames` matching the file).

---

## Art and identity

- [ ] **itch.io asset pack:** link and license. It fixes the tile size (`TILE` in `src/config.ts`). Put its license in `public/assets/<pack>/LICENSE`.
- [ ] **Commissioned character sheet:** idle, walk in 4 directions, sleeping, waking, riding the longboard, pull up. Current placeholder frame is 16x22 (`CHAR_FRAME` in `src/config.ts`).
- [ ] **Cat sprite:** idle, walk, sit, pet reaction. Current placeholder is 16x12.
- [ ] **Reference photos for the artist:** front, side, and back of Daniel.

## Contact (`src/content/profile.ts`)

- [ ] One line tagline
- [ ] LinkedIn URL
- [ ] Email address to show publicly
- [ ] GitHub URL
- [ ] Resume PDF (put it at `public/media/resume/`)

---

## Dorm (professional)

### 1. Mirror: intro (`dorm.mirror`)
- [ ] Confirm major wording (see "Wording to confirm")
- [ ] 2 to 3 sentences of background and experience
- [ ] Headshot

### 2. Pin board: Hope For Hearing (`dorm.pinboard`)
- [ ] Role and years
- [ ] Founding story (meeting Roy on the subway), 2 to 4 sentences
- [ ] What it does and the impact so far
- [ ] What it taught you
- [ ] Milestones and stats
- [ ] Funding grants won (names, amounts if shareable)
- [ ] Gallery photos with captions (4 slots now; add as many as you like)

### 3. Laptop: software projects (`dorm.laptop`)
- [ ] Cold email automator: what it is, why you built it, your role, the stack
- [ ] Saved posts scroller: what it is, why you built it, your role, the stack
- [ ] Ateball (Creative Labs): what it is, why you built it with CL, your role, link if public
- [ ] Ateball UI screenshots (3 slots)

### 4. Trophy and binder: consulting (`dorm.trophy`)
- [ ] Genesis Alternative Ventures description (client, problem, what your team did, outcome)
- [ ] Genesis slide screenshots (3 slots)
- [ ] L.E.K. Case Competition description (the case, your recommendation, the year)
- [ ] L.E.K. slide screenshots (3 slots)

### 5. Camera: club marketing (`dorm.camera`)
- [ ] DSP: your role, description, skills used, measurable results
- [ ] DSP Vogue campaign graphics (3 slots) and website screenshot
- [ ] DSP rush video (YouTube id, or a compressed MP4)
- [ ] DSP website link
- [ ] IBB: your role, description, skills used, measurable results
- [ ] IBB graphics (3 slots) and website screenshot
- [ ] IBB rush video
- [ ] IBB website link

### 6. Pennants: student orgs (`dorm.pennants`)
- [ ] One line on each org: Sharpe Fellows, Delta Sigma Pi, the entertainment association, IBB, UBS Technology Committee, ResLife
- [ ] Your role in each (Sharpe Fellows is already "Technology Vice President"; ResLife is "Resident Assistant")

### 7. Drawers: education (`dorm.drawers`)
- [ ] Confirm major wording
- [ ] Royce Hall photo
- [ ] UCC hat toss photo
- [ ] Business Club and Asian Heritage Club photos
- [ ] Extended essay link
- [ ] SAT proof: only if you want it shown (probably skip)

### 8. Closet: Resident Assistant (`dorm.closet`)
- [ ] A sentence or two on what the job is like
- [ ] RA photo

---

## Home (personal)

### 1. Window: North York (`home.window`)
- [ ] Names of the library and cafe (optional)
- [ ] Gallery photos (3 slots)

### 2. Shelf (`home.shelf`)
- [ ] Rowing: boat, year, a line on what it was like; photos (2 slots)
- [ ] Award plaque photos: DECA, FBLA CNLC, FBLA NLC (3 slots)
- [ ] Anime and webtoons: done (text titles only, no franchise art)

### 3. Pull up tower: exercise (`home.pullup`)
- [ ] A line on why, or a current goal
- [ ] Photos or short clips: muscle up, trap bar deadlift, physique

### 4. Laptop with clapperboard: acting (`home.laptop`)
- [ ] The music video's YouTube URL (the 70M views must link to it)
- [ ] Song and artist, and your part in it

### 5. Headphones: dubstep and EDM (`home.headphones`)
- [ ] Why you love it, a sentence or two
- [ ] Spotify playlist URL (and its id for the embed)

### 6. Nightstand: family (`home.nightstand`)
- [ ] A few sentences about your parents and sister
- [ ] Family photos (3 slots)

### 7. Piano (`home.piano`)
- [ ] Exact ARCT credential name and a precise description (see "Wording to confirm")
- [ ] Recital photos (2 slots)

### 8. Baked goods: baking and cooking (`home.baking`)
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

## Wording to confirm

- **Major.** The notes say "UCLA Economics major". You have also described a B.A. Business Economics and B.S. Cognitive Science double major. The site uses `[TODO: confirm major]` for now.
- **Org name.** The notes say "Business in Entertainment Association". Confirm the exact official name.
- **ARCT.** "Highest nonprofessional degree possible in Canada" is left out. Give the exact credential name and a verifiable description.
- **"70M views."** Kept as written. Tie it to the linked video so it is verifiable.
- **"We won the national rowing championship."** Kept as written. Consider naming the regatta or event and year so it reads as specific, not general.
- **"Honours student."** Kept from the notes. Confirm the exact program name if there is one.
- **Resident Assistant vs Residential Assistant.** The notes say "Residential", the spec says "Resident". The site uses "Resident Assistant". Use whatever UCLA calls it.
- **Solo Leveling.** The notes spell it "solo levelling". The site uses the official English title.

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
- [ ] Sound on or off by default (currently off, per spec)
- [ ] Mirror vs lamp in the dorm (mirror now, so the intro is reached first)
