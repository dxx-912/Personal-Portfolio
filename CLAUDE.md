# CLAUDE.md: Daniel Xing's pixel room portfolio

Read this whole file before writing code. It is the spec, the design record, and the working agreement for this repo. Images referenced here live in `reference/`. Markdown does not render them for you, so open each one with the Read tool when a section points to it.

---

## 1. The vision in one paragraph

A personal portfolio that plays like a tiny Soul Knight style game. The visitor loads into a dark dorm room where only a pixel version of Daniel is visible, asleep in bed. A prompt says "Press F to wake up." The lights fade up and reveal his UCLA dorm room, which holds everything professional. A door on the right wall leads to his childhood bedroom in North York, Toronto, which holds everything personal. The visitor walks with WASD, presses F near objects, and each object opens a pixel styled panel with real content: projects, experience, photos, videos, links. The goal is memorability for recruiters (product management, 2027 cycle) without ever making the facts hard to reach.

Priority order when trade offs come up:
1. It works and the content is easy to reach (functional portfolio first).
2. It feels like Soul Knight (art, motion, feedback, cozy room vibe).
3. It resembles Daniel's real rooms (nice to have, never at the cost of 1 or 2).

---

## 2. How to work in this repo

### Your latitude
Daniel wants you to have creative freedom on implementation and precision on content and structure.

| You decide | Fixed by this file (ask before changing) |
|---|---|
| Code architecture, file layout inside `src/`, state management | Two rooms only, and which room holds which items (section 7) |
| Tile size, exact pixel dimensions, camera scale | Which furniture exists and which wall it sits on (section 6) |
| Animation timing, easing, particles, screen polish | The interaction rules in section 8 |
| Panel visual design within the pixel style | Controls (section 9) and the plain version link |
| Placeholder art style | Content text: never invent facts (section 11) |
| Sound design (muted by default) | No ripped Soul Knight assets, ever |

If something in this file is impossible or clearly worse in practice, build the closest good version, then tell Daniel what you changed and why in your summary. Do not stall waiting for approval on reversible choices.

### Working method
1. Plan first: read this file, look at every image in `reference/`, then write a short plan (phases, files) before coding.
2. Build in the phases in section 13. Finish and verify each phase before starting the next. Commit at the end of each phase with a clear message.
3. Verify visually. Run the dev server and look at the game in a browser (use a browser tool or Playwright screenshots if available). Reading code is not enough for layout, depth sorting, and overlap bugs.
4. Everything content related goes through the data files in `src/content/` (section 11). No copy hardcoded inside scenes.
5. Every missing asset gets a visible placeholder plus an entry in `TODO_ASSETS.md` (section 14). Never block on missing photos or art.
6. Keep the bundle lean: no heavy UI frameworks inside the game unless they clearly pay for themselves.

---

## 3. Tech stack

- Phaser 3 + TypeScript + Vite. Start from the official template `phaserjs/template-vite-ts`.
- Arcade Physics for movement and collision.
- Rooms: either Tiled JSON maps (preferred, so Daniel can move furniture himself later in the free Tiled editor) or a typed layout config. Your call, but furniture positions must live in data, not scattered through scene code.
- Hosting: Vercel, static build.
- Node 20+.
- Optional MCP: if an Aseprite MCP server is connected, use it for recoloring, slicing, editing, and exporting sprite sheets. Do not attempt the final hero character with it. Commissioned or pack art will replace placeholders.
- Optional skill: a Phaser skill may be installed under `.claude/skills/`. Use it if present, but this file wins on any conflict.

---

## 4. Art direction: Soul Knight, specifically

Open `reference/soul-knight-lobby-reference.png`. This is the target look and camera.

What to copy in spirit (never copy the actual assets):
- **Camera:** three quarter top down. The floor is seen from above, but the back wall is drawn as a tall vertical face you can see, hang things on, and stand in front of. Side walls are thin strips. The front wall is a thin rim. This is the core of the look.
- **Characters:** small and chunky, big head, roughly 16x16 to 32x32 pixels. A one pixel dark outline around every sprite.
- **Rendering:** pixel perfect. Integer scaling only, `pixelArt: true`, `roundPixels: true`, no smoothing, no subpixel jitter.
- **Lighting:** dark room with warm pools of light. Soul Knight rooms are moody, so use a dark vignette and light cones from windows and lamps. The wake up sequence is the showcase of this.
- **Life:** constant small motion. Idle bobbing, screen flicker on laptops, dust in the light beam, the cat wandering, a blinking cursor.
- **Feedback:** small squash on interact, a sparkle or bounce on interactables, a soft click sound, a quick panel pop in.
- **Palette:** limited per room. Saturated accent colors against muted walls and floors.

### Soul Knight lobby lessons (why the rooms work the way they do)
Soul Knight's hub (the living room, with garden plots outside and a cellar in some versions) is the closest model for this portfolio, because it is a small cozy space where every object does something.
- The hub is one room where you walk up to things (heroes, a handbook beside the chest, machines) and interact. Our rooms do the same: every meaningful object is a door into content.
- The garden plots outside are a separate small zone with their own purpose. Our second room plays this role: a distinct space with a distinct theme, reached by walking.
- The cellar or basement is a place where you place items for display. Our trophy shelf and pin board follow this "collection on display" idea.
- Lobbies are full of small easter eggs and ambient life (critters walking by, objects that react when poked). Our cat, the longboard, and hidden extras (section 10) follow this.

Further visual reference (links for Daniel or for you to read; do not download or embed their images in the build):
- Living room overview: https://www.yekbot.com/soul-knight-living-room-walkthrough/
- Lobby easter eggs and ambient details (Prequel ocean lobby): https://itemlevel.net/soul-knight-prequel-ocean-lobby-features-easter-eggs-season-1/
- Basement used as a display space (Prequel): https://itemlevel.net/?p=165437

### Asset strategy
- Phase 1 uses placeholder art you make yourself: simple pixel shapes in the correct palette, sized like the final sprites. It should already look intentional.
- Final art will come from one itch.io asset pack (Daniel's choice, pending) plus a commissioned character sheet. The pack's tile size (16 or 32) is the source of truth once chosen. Write the code so that tile size and sprite frame sizes come from one config file.
- Every asset is loaded by a stable key from one manifest file (for example `src/assets/manifest.ts`). Swapping placeholder for final art must mean replacing files, not code.
- Keep each pack's license file in `public/assets/<pack>/LICENSE`. Add credits in the plain version page footer if the license requires it.
- Never use ripped Soul Knight sprites, music, or fonts. Do not draw Honour of Kings, Attack on Titan, Solo Leveling, or other franchise characters or logos. Use generic shapes and plain text titles instead.

---

## 5. Experience flow

1. **Loading:** a tiny pixel loading bar or a dark screen with a blinking "zzz". Keep it under about 2 seconds on a normal connection.
2. **Sleep state:** the dorm is pitch black except for Daniel asleep in bed (slow two frame breathing loop, floating "Z"s). A prompt reads "Press F to wake up". On touch devices it says "Tap to wake up". It also accepts click, Space, and Enter.
3. **Wake up:** the character stirs, the lights fade up over about 1 second (light cone from the window first, then room light), and the character hops out of bed to the open floor beside the bed. A small tooltip shows the controls once: "WASD to move, F to interact".
4. **Dorm:** free exploration. A discreet counter in a corner reads "Found 0 of 18".
5. **Door transition:** walking into the right wall door triggers a short fade or pixel wipe, then the character appears at the left door of the home room facing in. Walking back reverses it. No loading screen between rooms.
6. **Home:** free exploration.
7. **Completion:** when all 18 are found, a small celebratory moment (confetti, or the character does a little dance) plus a "Thanks for exploring, let's talk" panel with contact links.

The "Plain version" link (section 9) is visible during all of these steps, including before waking up.

Returning visitors: remember "woke up already" and the found set in `localStorage` (wrapped in try/catch). Offer a small "Start over" button in the pause menu. Optional: skip the sleep state automatically on return visits.

---

## 6. Room specifications

### Dorm (professional)
Open `reference/dorm-layout.png` (final layout) and `reference/dorm-original-sketch.jpg` (Daniel's rough sketch, for context only).

![Dorm layout](reference/dorm-layout.png)

- **Size:** cozy, deliberately small. The floor is about 2.25 times as wide as it is deep. The back wall face is about 45% of the floor depth tall. At 16 pixel tiles, that is roughly 20 by 9 floor tiles. Tune for a cozy feel at 16:9 with a little dark margin around the room.
- **Walls:** light beige (around `#ecdfc6`, cap `#c9b596`). Daniel pins things on his real walls, so the back wall reads as a pin friendly surface.
- **Floor:** carpet (muted blue grey around `#6f7a8f` with sparse darker speckles), not tiles.
- **Back wall, left to right:** window with a light cone falling onto the floor and a pennant string across its top (item 6); cork pin board with open floor directly in front of it (item 2); a squarish desk pushed fully against the back wall with three spaced item slots (items 3, 4, 5); a wide closet (item 8).
- **Left side, front:** a standing mirror (item 1) beside the bed. It replaced a floor lamp. A small lamp glow can still exist as decoration.
- **Front left:** a compact single bed. It is deliberately smaller than real life so it does not eat the room. It is the spawn point.
- **Front right:** low drawers kept away from the right wall so the door approach stays clear (item 7).
- **Right wall:** the door to home, centered between the closet and the drawers, with nothing overlapping it.

### Home bedroom (personal)
Open `reference/home-layout.png` and `reference/home-original-sketch.jpg`.

![Home layout](reference/home-layout.png)

- **Size:** same footprint as the dorm.
- **Walls:** light pastel green (around `#d3ecda`, cap `#a9cfb6`).
- **Floor:** warm wood planks (around `#8a6244`).
- **Back wall, left to right:** a tall three tier wooden shelf (item 2); a window with dark blue curtains (`#22396b`) showing a Toronto skyline (item 1); a freestanding pull up tower in the top right corner (item 3).
- **Right wall:** a work table running along the wall (vertical orientation), reached from its left side. It holds the laptop (item 4), headphones (item 5), and one spare slot.
- **Front left corner:** a compact bed, decorative here. A nightstand sits directly above the bed at the pillow end (on Daniel's left when lying in it). It holds a lamp and a family photo frame (item 6).
- **Front, between the bed and the work table:** desk and drawers with a digital piano (item 7) and a tray of baked goods (item 8).
- **Left wall:** the door back to the dorm, placed evenly between the back wall and the nightstand. Nothing overlaps it.
- **Open floor:** the middle lane, where the longboard (item 10) is parked and the cat (item 9) wanders. Keep it clear.
- No wall shelves floating above furniture in either room (they create ambiguous interactions; see section 8).

---

## 7. Interactables (18 total)

Each object has exactly one standing spot (the yellow numbers in the layout images) unless noted. Content comes from `reference/content-outline.pdf` and `src/content/`.

### Dorm (professional)
| # | Object | Interaction | Panel content |
|---|---|---|---|
| Start | Bed | Wake up sequence | (none) |
| 1 | Standing mirror | F, panel | **Intro.** Headshot shown as the reflection. Who Daniel is and what he is interested in (growth, tech, startups), a short background, links (LinkedIn, email, resume download). Designed as the first thing a visitor reaches. |
| 2 | Cork pin board | F, panel with gallery | **Hope For Hearing.** Milestones and stats, impact, the founding story (meeting Roy on the subway), funding grants won, what it taught him, and a photo gallery styled as pinned polaroids. |
| 3 | Laptop on desk | F, panel with tabs | **Software projects.** Tabs: Cold email automator (live link https://cold-email-automator-two.vercel.app/), Saved posts scroller (live link https://morning-scroller.vercel.app/), Ateball at Creative Labs (UI screenshots). Each tab: what it is, why he built it, his role, and a link. Links open in a new tab. |
| 4 | Trophy and binder on desk | F, panel with tabs | **Consulting.** Genesis Alternative Ventures (Project Manager) and the L.E.K. Case Competition win. Each has a description and slide screenshots in a small image viewer. |
| 5 | Camera on desk | F, panel with tabs | **Club marketing.** Tabs DSP and IBB. Each: description, skills used, measurable results, graphics grid (DSP: Vogue campaign), rush video, and website build (screenshots plus a link out; do not iframe the live site). |
| 6 | Pennant string over window | F, close up of pennants | **Student orgs.** One pennant each: William F. Sharpe Fellows (technology vice president), Delta Sigma Pi, the entertainment association (exact name pending, see section 12), International Business for Bruins, UBS Technology Committee, UCLA ResLife. Selecting a pennant shows a one line description of the org and Daniel's role. |
| 7 | Drawers with grad cap, diploma, textbooks | F, close up with two halves | **Education.** UCLA half: major (exact wording pending), Royce Hall photo, courses (advanced micro theory, advanced macro theory, intro to C++, accounting fundamentals), honours student. Upper Canada College half: IB Diploma, hat toss photo, 40/45, 1560 SAT, HL Math A&I, English L&L, Economics; SL Mandarin B, Global Politics, ESS; extended essay on the geopolitical implications of Taiwan's semiconductor industry (link); Business Club President and Asian Heritage Club President with photos. |
| 8 | Closet with RA lanyard | F, panel | **Resident Assistant.** Photo, and why: it saves money and it is genuinely fun. |
| | Right door | Walk into it | Transition to home |

### Home (personal)
| # | Object | Interaction | Panel content |
|---|---|---|---|
| 1 | Window (Toronto skyline) | F, panel with gallery | **North York.** 18 years there, the same library and cafe throughout high school, and a gallery. |
| 2 | Three tier shelf | F, then a shelf close up where each tier item is selectable | Top tier: **rowing** trophy and oars (high school varsity, national championship, photos). Middle tier: three separate **award plaques** (DECA Provincial Champion; FBLA Business Management National Champion at CNLC; FBLA International 6th place at NLC), each with a photo where available. Bottom tier: **anime and webtoons** shelf (Attack on Titan; Sweet Home, Lookism, Solo Leveling), plain spines with text titles only. |
| 3 | Pull up tower | F, a mini game, then a panel | **Exercise.** Mini game: press F repeatedly (or tap) to do reps with a counter and a little strain animation, capped at a few seconds. Then: lifts and sprints or runs almost every day, plus photos and videos (muscle up, trap bar deadlift, physique). |
| 4 | Laptop with clapperboard | F, panel | **Acting.** Former professional actor, peak was a music video with 70M views. Embed the YouTube video using the privacy enhanced `youtube-nocookie.com` domain, and load it only after the panel opens. |
| 5 | Headphones | F, plays a short loop and opens a panel | **Dubstep and EDM.** Why he loves it, plus a Spotify playlist link (or Spotify embed, loaded only on open). |
| 6 | Nightstand with family photo | F, panel with gallery | **Family.** Parents and sister, and a gallery. |
| 7 | Digital piano | F, panel with playable keys | **Piano.** Twelve years of piano, RCM ARCT Diploma (wording pending, see section 12), and recital photos. A one octave playable keyboard (mouse, touch, or number keys) with soft synthesized tones is the fun part. |
| 8 | Baked goods tray | F, panel with gallery | **Baking and cooking.** Cooks and bakes for his family, with food photos and photos of him cooking. |
| 9 | Cat | F (pet, heart particles, meow), then a panel | **Cat.** Photos, how they got him, his name, his personality. |
| 10 | Longboard | F to ride, F again to get off and open a panel | **Longboard build.** Originally meant to be electric, the build process, soldering photos, and the battery that got destroyed. |
| | Left door | Walk into it | Transition to dorm |
| | Work table spare slot | Empty for now | Reserved (candidate: longboard parts as a second entry to item 10, or a future item). Do not count it toward 18. |
| | Bed (home) | Decorative | Optional easter egg: F says "Not tired yet." |

Honour of Kings was intentionally removed. Do not add it.

---

## 8. Interaction system rules (non negotiable)

These came from walking through every way a visitor could get confused or stuck.

1. **One object, one standing spot.** An interactable is active only when the character is within its standing zone (about one tile) and roughly facing it. Only the nearest active object highlights. Use a small hysteresis so the highlight does not flicker between two neighbors.
2. **Prompt label names the thing.** Show "F: Laptop, projects" style labels above the highlighted object, never a bare "Press F".
3. **No stacked choices.** Items stacked vertically (shelf tiers, things on a wall above a desk) are never separate floor interactables. The furniture is one interactable that opens a close up view, where the visitor picks the item with mouse, touch, or arrow keys. This applies to the shelf (home 2), the pennants (dorm 6), and the drawers (dorm 7).
4. **Wall items need floor in front.** Anything on the back wall must have walkable floor directly in front of it. If something sits on the wall above furniture, it belongs to that furniture's interaction.
5. **Surface spacing.** No more than three items per desk or table. They must be at least one character width apart, each with its own standing spot. The work table is reached from the left, so its items run top to bottom.
6. **Walkways.** Every gap the character must pass through is at least about 1.5 character widths. Collision boxes are the furniture footprint on the floor, not the full sprite height, so the character can stand right up against the front edge of a desk.
7. **Doors stay clear.** No furniture or collision box overlaps a door or its approach tile. Door triggers fire on walking in, not on F, but F also works.
8. **Depth sorting.** Y sort every sprite (character, cat, longboard, furniture) by its foot position. Tall objects (closet, shelf, pull up tower) only stand against the back wall, so the character never disappears behind them. Verify this visually.
9. **Moving things.** The cat wanders on a simple waypoint or random walk limited to open floor, avoids standing spots and door approaches, pauses when the player is close, and only becomes the active interactable when no static object is nearer. The longboard never moves on its own.
10. **Modes.** While riding the longboard: faster movement with gentle acceleration and coasting, bump into furniture with a small bounce (no damage, no getting stuck), all other interactions disabled, and F dismounts. Dismount opens the build story the first time only; afterwards there is a small "read the story" prompt.
11. **Panels pause the game.** When a panel is open, movement stops, game input is ignored, and Esc, clicking outside, or the X closes it. Focus returns to the game on close. Panels are keyboard navigable (Tab, arrows, Enter) and scroll inside themselves if long.
12. **Discoverability.** Interactables have a subtle idle sparkle or bounce until visited, then a dimmer "seen" state. Decorative objects never glow. Found counter "Found X of 18" in a corner. An optional hint key (H) briefly outlines any unfound object.
13. **Click to walk.** Clicking or tapping an interactable makes the character walk there (simple pathfinding on the tile grid) and opens it on arrival. Clicking empty floor walks there. Many recruiters will never touch the keyboard.
14. **Never trap the player.** No soft locks: the spawn, the door arrivals, and the dismount positions are always on free tiles. If the character ends up inside a collider, nudge them out.

---

## 9. Controls, accessibility, and devices

- **Move:** WASD and arrow keys. **Interact:** F, plus E, Space, and Enter as aliases. **Close:** Esc. **Pause menu:** P or Esc when no panel is open (sound toggle, start over, plain version).
- **Mobile:** a virtual joystick bottom left, an interact button bottom right (Soul Knight's own mobile layout, visible in the reference image), and tap to walk. Test portrait and landscape. In portrait, show the room letterboxed or invite rotation; either way the plain version link stays reachable.
- **Plain version:** a persistent, small, clearly labeled "Plain version" link (top corner) to `/plain`. This is a fast, normal HTML page that renders all the same content from `src/content/` (intro, projects, experience, education, personal, contact, resume download). Build it as part of phase 1, not as an afterthought. It also serves screen reader users and SEO.
- **Accessibility:** panels use real HTML (DOM overlay over the canvas) for readable text, selectable links, and screen reader support. Respect `prefers-reduced-motion` by cutting screen shake, particles, and long fades. Text in panels is at least 16px equivalent. Contrast passes WCAG AA.
- **Audio:** muted by default with a visible speaker toggle. Browsers block sound until a user gesture; the first F press or click counts, so unmute only if the visitor turns sound on. Videos never autoplay with sound before a click.
- **Resize:** the game scales to fit the window at integer multiples where possible, with dark letterboxing.

---

## 10. Polish and extras (after the core works)

- Window light changes with the visitor's local time (day, sunset, night).
- A real time clock somewhere in the dorm (LA time) and in home (Toronto time).
- Footsteps that change sound on carpet versus wood.
- Easter eggs: the Konami code makes the character do a flip; poking the home bed; the cat knocking something off the desk now and then.
- Completion celebration (section 5).
- Open Graph image: a screenshot of the lit dorm room for link previews.

---

## 11. Content system and writing rules

- All content lives in typed data files under `src/content/` (for example `dorm.ts`, `home.ts`, `profile.ts`), keyed by interactable id. Scenes and panels only read from them. `/plain` reads the same files.
- Every content entry supports: title, subtitle or role, body paragraphs, a list of facts or stats, images (with alt text), video embeds, and external links.
- Media goes in `public/media/<item-id>/`. Images are WebP, at most about 1600px on the long edge, and lazy loaded when the panel opens.
- **Never invent facts, numbers, dates, names, or quotes.** Where content is missing, write a clearly marked placeholder like `[TODO: 2 to 3 sentences on why you built the cold email automator]` and list it in `TODO_ASSETS.md`.
- Voice: first person, plain, direct, no buzzwords. Daniel dislikes the long dash character, so do not use it anywhere in user facing copy.
- Flag overclaiming. If a phrase in the source notes could read as an exaggeration, keep it as written but list it under "Wording to confirm" in `TODO_ASSETS.md`.

---

## 12. Known caveats and decisions to confirm

These are already known. Use the safest wording until Daniel confirms.

- **Major wording:** the content notes say "UCLA Economics major", but Daniel has also described himself as a B.A. Business Economics and B.S. Cognitive Science double major. Use a `[TODO: confirm major]` placeholder in the intro and education panels.
- **Org name:** the notes say "Business in Entertainment Association". Confirm the exact official name before shipping.
- **ARCT wording:** "highest nonprofessional degree possible in Canada" should be replaced with the exact credential name and a precise, verifiable description. Placeholder until confirmed.
- **"70M views":** keep the number tied to the specific video and link it, so it is verifiable.
- **Items on the resume that are not in the content notes:** NST internship (CEO's Office, 2026 Hong Kong Award Summit), LionChase investment banking analyst, Bruin Finance Society senior editor, Creative Labs project lead this quarter, the NST summit site, and the IBB and DSP site rebuilds as projects in their own right. Do not add them unasked. List them in `TODO_ASSETS.md` under "Consider adding" so Daniel can decide. The work table spare slot or a fourth tab on the laptop could hold them without changing the layout.
- **Mirror versus lamp:** the dorm mirror replaced a lamp so the intro is the first thing reached. Easy to swap back if Daniel prefers.
- **Spare work table slot:** reserved, see section 7.
- **Third party embeds** (YouTube, Spotify) load only after a panel opens, to protect load time and privacy.

---

## 13. Build phases and definition of done

### Phase 1: Skeleton and flow (do this first, in one pass)
- Scaffold from the official template; folders for `src/scenes`, `src/content`, `src/ui`, `src/assets`, `public/assets`, `public/media`.
- Placeholder art for every piece of furniture and every interactable, in each room's palette, at final sizes.
- Both rooms laid out per section 6, with collisions, y sorting, and the door transitions.
- Sleep state and wake up sequence (section 5).
- Movement, the interaction system (section 8, all rules), click to walk, panels, the found counter.
- All 18 interactables wired to content entries, with placeholders where content is missing.
- The `/plain` page.
- Mobile controls.
- `TODO_ASSETS.md` generated.

**Done means:** a visitor can wake up, visit all 18 items in both rooms with the keyboard, the mouse only, and touch only; every panel opens and closes; nothing overlaps a door; the character is never hidden behind furniture; `/plain` shows everything; `npm run build` passes with no type errors; a production build loads quickly.

### Phase 2: Special interactions
The longboard ride, the cat AI, the pull up mini game, the playable piano, the headphones audio loop, the shelf, pennant, and drawer close ups.

### Phase 3: Juice
Light cones, ambient motion, particles, sounds, the completion moment, reduced motion handling.

### Phase 4: Art swap (needs Daniel's assets)
Replace placeholders with the chosen pack and the commissioned character. Recolor to the room palettes. If an Aseprite MCP is available, use it for slicing, recoloring, and exporting.

### Phase 5: Content fill and ship
Fill real copy and media, resolve every TODO, run a Lighthouse pass (performance, accessibility), set the Open Graph tags, deploy to Vercel.

---

## 14. The gap: what this first prompt delivers versus what the final portfolio needs

**What a first Claude Code session can deliver from this file alone:** phase 1, and likely much of phase 2. That means a fully playable, correctly laid out two room game with placeholder art, all interactions working, all panels wired with the content already in `reference/content-outline.pdf`, a working `/plain` page, and a clear list of everything missing.

**What Daniel still needs to provide** (track all of this in `TODO_ASSETS.md`, grouped by interactable):

Art and identity
- The chosen itch.io asset pack (link plus license), which fixes the tile size.
- The commissioned character sprite sheet: idle, walk in four directions, sleeping, waking, riding the longboard, pull up. The cat sprite (idle, walk, sit, pet reaction) as well.
- Front, side, and back photos of himself for the artist.

Content (copy)
- Intro paragraph and a one line tagline.
- For each software project: what it is, why he built it, his role, and the stack (2 to 4 sentences each).
- Genesis Alternative Ventures and L.E.K. descriptions.
- DSP and IBB marketing descriptions, skills used, and measurable results.
- Hope For Hearing milestones, stats, grants (names and amounts if shareable), the Roy story, and lessons learned.
- RA blurb, org one liners, North York, family, cat (name and story), rowing, awards, exercise, piano, music, baking, and acting blurbs.
- Confirmations from section 12.

Media
- Headshot; Royce Hall photo; UCC hat toss photo; club leadership photos; SAT proof only if he wants it shown (optional, probably skip).
- Ateball UI screenshots; consulting slide screenshots; DSP and IBB graphics, rush videos (hosted on YouTube or as compressed MP4), website screenshots.
- Hope For Hearing gallery; RA photo; North York gallery; family gallery; cat photos; rowing photos; award plaque photos; exercise photos or short clips; recital photos; food photos; longboard build and soldering photos.
- Links: resume PDF, LinkedIn, email, GitHub, extended essay, Spotify playlist, music video URL.

Decisions
- Custom domain.
- Whether to add the "Consider adding" items from section 12.
- What goes in the spare work table slot.
- Sound on or off by default (spec says off).

---

## 15. Reference files

| File | What it is |
|---|---|
| `reference/dorm-layout.png` / `.svg` | Final dorm layout, three quarter view, numbered standing spots |
| `reference/home-layout.png` / `.svg` | Final home layout, three quarter view, numbered standing spots |
| `reference/dorm-original-sketch.jpg` | Daniel's rough top down sketch of his real dorm (context only) |
| `reference/home-original-sketch.jpg` | Daniel's rough top down sketch of his real home bedroom (context only) |
| `reference/soul-knight-lobby-reference.png` | Soul Knight screenshot supplied by Daniel: camera angle, scale, lighting, and UI reference. Do not ship it or trace it. |
| `reference/content-outline.pdf` | Daniel's full content outline for both rooms |

The layout images are the source of truth for which furniture exists and where it sits relative to the walls and the other furniture. They are not pixel exact. Adjust sizes as needed to satisfy section 8.
