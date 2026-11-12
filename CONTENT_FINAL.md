# CONTENT_FINAL.md: approved site content (content passes 1 and 2)

This is the single source of truth for site copy. It replaces `CONTENT_INTAKE.md`. Daniel's original filled intake is at `reference/content-intake-filled.pdf` for context; where the two differ, this file wins (it includes his later decisions).

Rules: use this text as written (light grammar fixes only, never new facts). Anything shown as `[TODO]` stays a visible placeholder in development, is hidden gracefully in production builds, and is listed in `TODO_ASSETS.md`. Never use the long dash character in site copy.

---

## 1. Global

### 1.1 Basics
- Name: Daniel Xing
- Tagline: UCLA sophomore. I like being creative.
- Focus line: Looking for growth and PM roles for 2027.
- Email (public): dxing01@ucla.edu
- LinkedIn: https://www.linkedin.com/in/dxing01/
- GitHub: https://github.com/dxx-912
- Instagram: @dxx_912 (https://www.instagram.com/dxx_912/)
- Resume: `public/resume.pdf` (already in place). Every Resume button links to `/resume.pdf`.
- Custom domain: decide later.

### 1.2 About me (HUD portrait panel, item 1)
Paragraphs:
1. Hey I'm Daniel, thanks for visiting my portfolio :)
2. I'm a sophomore at UCLA right now majoring in economics and cognitive science, born and raised in Toronto.
3. I come from a pretty artistic background (spent my formative years in specialized art programs), so I hope to build and create in whatever I end up doing professionally, whether through the arts or technology. I'm currently recruiting and hope to land product management, product marketing, or growth roles for 2027.

Navigating this portfolio (bullets):
- UCLA dorm showcases my professional side: projects, experiences, student orgs., education, etc.
- Toronto bedroom showcases my personal life: hobbies, interests, sports, what makes me, me.
- Press F to learn more about one of 18 items that represent my professional and personal stories (this HUD panel is one).
- Press E to interact with an object. There are 18 total things you can interact with (solely for fun; e.g., try shooting the basketball!).
- If you're a recruiter and want to quickly scan over everything, press the "Quick View" button.
- Have fun! Reach out to me for any feedback :)

The panel opens on its own on a first visit, right after Daniel wakes up.

Photos: `photos/1 Dorm/01 About me (HUD portrait)/HUD Photos/` (2 photos) plus `photos/Professional Headshot.png` as the HUD portrait source and the panel headshot.

### 1.3 Game dialogue
- Wake up line: Hey, I'm Daniel. Welcome to my dorm at UCLA.
- Idle thoughts: "should probably do my readings" · "where did I leave my charger?..." · "I need to do my laundry" · "hmm..." · "I'm him" · "I need to apply to more jobs..."
- Red Bull hints: "where can I get a Red Bull..." · "is there any Red Bull left?..."
- Tired lines: "I'm so tired" · "I want to take a nap..."
- Completion message: Thanks for exploring, let's connect sometime!

### 1.4 Facts
- Major (as Daniel wrote it): B.A. Economics, B.S. Cognitive Science. `[Daniel is double checking this against his resume, which says Business Economics. Keep it in one constant so it changes in one place.]`
- Honours: College Honours Student
- GPA: 3.72
- Entertainment association: Business in Entertainment Association
- Piano credential: The Associate Diploma (ARCT) in Piano Performance and Harmony
- Hope For Hearing scale, always in the past tense: "At its peak, Hope For Hearing grew to 500+ members across 12 high school chapters in Canada."
- Not on the site: NST, LionChase, Bruin Finance Society, Creative Labs project lead. Remove them from "Consider adding" in `TODO_ASSETS.md`.
- The DSP and IBB website rebuilds are NOT separate projects; they live inside the club marketing panel (section 2.5).

---

## 2. Dorm (professional)

### 2.1 UCLA education (pennant, item 2)
- Major: see 1.4
- GPA: 3.72
- Expected graduation: June 2029
- Coursework: microeconomic theory, macroeconomic theory, intro to C++, accounting principles
- College Honours Student
- Photos: `photos/1 Dorm/02 UCLA pennant/me and friends at UCLA/` (3). No Royce Hall photo; use these.

### 2.2 Student orgs (TO DO pin board, item 3; leadership gallery in the quick view)
| Org | What it is | Role |
|---|---|---|
| William F. Sharpe Fellows | Fellowship providing UCLA's top business students with mentorship, resources, and professional development. | Technology Track Vice President |
| Delta Sigma Pi, Xi Omicron Chapter | UCLA chapter of the nation's leading co-ed professional business fraternity, developing members through professional events, leadership, and service. | Director of Marketing |
| International Business for Bruins | Consulting club providing members with professional development, real client work, and a network in international business. | Director of Marketing |
| Business in Entertainment Association | Club connecting UCLA students to careers in the business of entertainment through panels, networking events, and premieres. | Director of Digital Media |
| UBS Technology Committee | Committee of UCLA's largest student organization that runs events and recruiting programs at the intersection of tech and business. | Committee Member |
| UCLA Residential Life | Campus department that manages, programs, and supports the student living communities across "The Hill" and University Apartments. | Resident Assistant at Rieber Hall South, Floor 6 |

Quick view leadership gallery order: Sharpe Fellows first, then DSP, IBB, BEA, UBS Technology Committee, ResLife, and Hope For Hearing last as the largest card.

### 2.3 Software projects (laptop, item 4)
**Cold Outreach Automator** (use this name everywhere) · `photos/1 Dorm/04 Laptop, software projects/Cold email automator screenshots (2 to 4)/`
- Live link: https://cold-email-automator-two.vercel.app/
- What it does: Sends personalized cold emails from your own Gmail. Import a contact list, approve contacts, write one template, and it schedules sends and follow-ups on each contact's local time.
- Why I built it: Didn't want to pay for Apollo.io, so I built my own version.
- Built with: Next.js, React, TypeScript, Supabase (Postgres, Auth), Vercel, Google Apps Script, Google OAuth, Claude Code
- Result: 7 users so far with over 650 emails sent.
- Solo project (no team line).

**Saved posts scroller** · `photos/1 Dorm/04 Laptop, software projects/Saved posts scroller screenshots (2 to 4)/`
- Live link: https://morning-scroller.vercel.app/
- What it does: Turns your Instagram saved posts into a daily feed. Upload your saves export, and it reshuffles them every day into a scrollable feed you can filter by category.
- Why I built it: I save a lot of posts on Instagram but never go back to them. I wanted a way to actually revisit them, without the noise of the main app. I also save a lot of motivational reels that I can scroll through every morning to start my day.
- Built with: React, TypeScript, Vite, Tailwind, IndexedDB, Vercel, Claude Code
- Result: I start every morning quite motivated now. Shared with friends and family; good feedback so far.
- Solo project (no team line).

**Ateball, Creative Labs** · `photos/1 Dorm/04 Laptop, software projects/Ateball UI screenshots (2 to 4)/`
- Role: Project Manager
- Team: 12 people across design, frontend, and backend. Timeline: 12 weeks `[TODO: quarter and year]`
- The problem: Everyone always has opinions on everything, especially when a friend group has to decide where to eat out together. All of a sudden, people are "okay with anything" and end up going to Raising Cane's for the nth time. Built this app to fix this problem.
- What I did: Led a 12-person team from zero to one over 12 weeks, running two to three syncs a week across design, frontend, and backend.
- Result: Although we didn't finish the entire application on time, this was my first time building a tech product end-to-end and a great experience leading multiple teams toward one goal.
- No link.

### 2.4 Consulting (binder, item 5)
**Genesis Alternative Ventures** (no slides: NDA; no photo gallery)
- Role: Project manager (through International Business for Bruins)
- Team and timeline: 6 people / spring quarter 2026
- The problem: Genesis Alternative Ventures, a Southeast Asian venture debt fund, wanted to know whether and how to expand the credit products in its Fund III across Southeast Asia, without cannibalizing its existing business.
- No "what I did" and no "result" lines on this card.

**L.E.K. Case Competition** · slide deck PDF in `photos/1 Dorm/05 Binder, consulting/LEK Case Competition slides (2 to 4)/`. Render 3 to 4 slides as gallery images (best: the two market sizing slides and the prioritization slide; skip appendix and references).
- Result: 3rd place finalist out of 50+ teams. Replace every "win", "winner", or "Winner" for L.E.K. anywhere in the codebase, both md specs, and `/portfolio`.
- Team and date: 5 people (with Shakti Widjonarko, Kenneth Lee, Aaron Teng, Ashlyn Bi) / spring 2026
- The case: CorVista, a cardiology EMR software company, had to choose its next growth move: build a data analytics product on top of its existing cardiology records, or enter the cardiac surgery software market.
- Our answer: Sequence it. Launch data analytics first, as a 4-month build sold as an upsell to existing clinic customers before private equity rollups lock them into competitors. Then use that cash flow and those relationships to enter cardiac surgery, which is a larger but harder market with no purpose-built competitor today.
- No "what I did on the team" line.

### 2.5 Club marketing (phone, item 6)
**Delta Sigma Pi** · `photos/1 Dorm/06 Phone, club marketing/`
- Role: Director of Marketing
- What I did: Ran the chapter's Fall 2026 rush marketing: designed the Vogue-themed photoshoot campaign, the rush video, and a rebuilt chapter website.
- Results: Vogue themed rush campaign: 350K+ views, 800+ interactions, 18% follower growth. Rush video: 110K+ organic views, 2K+ interactions. Chapter website: 3K+ visitors in its first 30 days.
- Rush video: `rush video.mp4` sits inside the "DSP Vogue campaign graphics" folder. It is the rush video, not a graphic: compress it and use it in the rush video slot (click to play, muted until clicked). Also link the post: https://www.instagram.com/p/DdsWVwHBf9C/
- Website: https://ucladsp.com (screenshot in "DSP website screenshot")

**International Business for Bruins** · `photos/1 Dorm/06 Phone, club marketing/IBB graphics (3 or more)/`
- Role: Director of Marketing
- What I did: Rebuilt the club's brand identity (logo, fonts, color palette), produced recruitment and event content, and shipped a new club website to showcase offerings and drive recruitment.
- Results: Recruitment and event content reaching 80K+ views. New brand identity and website launched.
- No rush video.
- Website: https://ibbatucla.com (screenshot in "IBB website screenshot")

### 2.6 Upper Canada College (grad cap, item 7)
- IB Diploma 40/45 · SAT 1560
- HL: Mathematics A&I, English L&L, Economics. SL: Mandarin B, Global Politics, ESS.
- Extended essay: Economic and Geopolitical Implications of Taiwan's Semiconductor Industry. Link: https://drive.google.com/file/d/14pv1NG7O9NHQkYhc4oL-PvGsY7-hgb9g/view?usp=sharing
- **Business Competition Club, President**: Led UCC's DECA and FBLA teams, growing membership by 400% through promotional videos and graphics (16,000+ impressions) and running weekly prep sessions, guest lectures, and a 1-on-1 mentorship system.
- **Asian Heritage & Culture Club, President**: Led 40+ members in running school wide cultural events for Lunar New Year and AAPI Month, plus potlucks, karaoke nights, trivia tournaments, and performances, with promo content reaching 12,000+ impressions.
- Use these exact club names everywhere (not "Business Club" or "Asian Heritage Club").
- Photos: `photos/1 Dorm/07 Grad cap, Upper Canada College/` (hat toss folder is empty for now: keep its placeholder; the Asian Heritage & Culture Club has no photo, placeholder removed).

### 2.7 Resident Assistant (closet, item 8)
- Title: Resident Assistant, Rieber Hall South, Floor 6 (use "Resident Assistant", not "Residential Assistant")
- Text: Supporting 98 residents: I handle conflicts, policy issues, and emergencies, organize programming, and help run move-in and orientation. I get a free single and free food in return, which is great cause UCLA has free food.
- Photo: `photos/1 Dorm/08 Closet, Resident Assistant/You as an RA (1 photo)/`
- **Closet outfits (E action), replacing the earlier color list:** default white tee, black Stussy shirt, UCLA-branded shirt, white tank top, full suit. The tee recolors are cheap; the tank top and suit need their own sprite art (new shapes), which is approved. Persist the choice. Any logo on the Stussy shirt uses an image slot, never a drawn logo.

### 2.8 Hope For Hearing (shirt, item 9)
- Mission: Raising awareness of hearing loss and the stigma surrounding it, as well as raising funding for cochlear implant research.
- Scale (past tense): At its peak, Hope For Hearing grew to 500+ members across 12 high school chapters in Canada.
- Stats: $25,000+ raised for charity · $3,500+ won in funding grants · 50+ events · 24 chapter heads
- Milestones:
  - Dec 2022: Founded in Toronto (Roy meets Daniel at Davisville Station)
  - Jan 2023: Partnered officially with Sunnybrook Hospital
  - Sep 2023: Partnered officially with CHHA (Canadian Hard of Hearing Association)
  - Dec 2023: Reached the $10,000 fundraising goal
  - Aug 2024: Expanded to 12 official high school chapters across Canada
  - Jun 2025: Passed $25,000 raised
- Grants: Youth Impact Challenge, $1,000 · Ingenious+ Youth Innovation Award, $1,000 · IdeAction Global Pitch Competition, $1,500
- Link: https://www.instagram.com/hopeforhearing/ (the website is offline; do not link it)
- Gallery: `photos/1 Dorm/09 Hope For Hearing shirt/Gallery (any number)/` (empty for now: keep placeholders)
- **The founding story:** use the full text in `reference/content-intake-filled.pdf` (pages 6 to 8, "Founding story"), with these fixes only: "raised over $3,000", "raise over $25,000", "win over $3,500". Daniel will do his own tone edit later. In the panel and the quick view detail panel, show a short version first (the first two paragraphs, ending at "He asked me if I wanted to help out.") followed by a "Read the whole story" expander with the full text. Mark "tone pass pending" in `TODO_ASSETS.md`.

---

## 3. Home (personal)

Use Daniel's text as written (his casual voice is intentional). Light fixes only: spelling, grammar, and the typos noted inline. Long stories show a short version first, then a "Read the whole story" expander, same pattern as Hope For Hearing. Mark "tone pass pending" in `TODO_ASSETS.md` for the baking and longboard text.

### 3.1 Shelf, Sports tier (rowing and beach volleyball)
- Rowing: Rowed for two years on my high school's junior varsity team. Seats 1 and 2 (bow pair); can row port and starboard.
- Gold medals:
  - CSSRA National Championships, Novice 8+
  - Mother's Day Regatta, Novice 8+
  - Mother's Day Regatta, Junior 8+
  - South Niagara Invitational, Novice 8+
  - South Niagara Invitational, Junior 8+
- Correct every older line that says "varsity" or implies a senior national title: it is junior varsity, and the national gold is the CSSRA Novice 8+.
- Beach volleyball: no description; use the fun fact (section 4) as its line. Photos `[TODO]`.

### 3.2 Shelf, Awards tier
- DECA Provincial Champion, Marketing Communications Series
- FBLA National Champion (CNLC), Business Management
- FBLA International 6th place (NLC), Business Management
- **New fourth award:** Gold Service Tie, for completing 200+ volunteer hours. Add a small folded tie (gold) on the middle tier next to the three plaques, as its own selectable award. No photo (Daniel removed the placeholder).
- Plaque photos are in `photos/2 Home/02 Shelf/` (one folder per plaque).

### 3.3 Shelf, Reading tier
- Attack on Titan: Have only watched one anime ever. It was AOT, and I loved it.
- Lookism: Been reading this webtoon every Sunday for over 10 years. The first ~200 episodes were really good.
- Sweet Home: Insanely good character development. I've reread it maybe 8 times now and tear up every time at the ending.
- Solo Levelling: Super fun power fantasy story with a pretty interesting plot.
- Photos: `photos/2 Home/02 Shelf/Animes/`

### 3.4 Pull up tower: Exercise
- Text: Currently trying to stick to a pretty intense routine: push, pull, legs, chest and back, arms, rest, sprints or long runs. Not the most consistent, but I'm getting there. Currently trying to hit 2 plates before the end of 2026 and learn a handstand.
- PRs: Bench 205 lbs · Trap bar deadlift 365 lbs · 5 km in 19:27 · Unlocked the muscle up and the elbow lever.
- Show the PRs as small stat tiles. Replace the old "lifts and sprints almost every day" line everywhere.

### 3.5 Speaker: Music
- Text: I love music and actually want to learn production one day. My favourite genres are definitely classical, dubstep, and hip hop.
- Top artists (according to Spotify): Rachmaninoff, Chopin, Kanye, Tyler, the Creator, Keshi, wave to earth.
- Also love: Sullivan King, Wooli, Riot, Knock2, Fakemink.
- Dubstep playlist: https://open.spotify.com/playlist/6u0kVAzcws3L14vrUz6ZqC (strip the `?si=` tracking parameter)
- Keep the lofi playlist link too.
- Artist names are plain text only: no album art, logos, or photos of the artists.

### 3.6 Camera: Photography
- Text: I love photography. Life moves so fast; time passes in the blink of an eye, but photography can capture a moment in its purest form. I use my parents' old Canon EOS Rebel and like taking well composed photos when travelling. I have hundreds of photos from travelling across China and Japan, but they haven't been colour graded in Lightroom yet. Check out some of my work below!
- Gallery: `photos/2 Home/05 Camera, photography/Photos you took (any number)`

### 3.7 Nightstand: Family
- Text: My parents immigrated from China in 2002 and met at Queen's University. My sister is in her first year of high school and has been juggling a ton of extracurriculars.
- Gallery: `photos/2 Home/06 Nightstand, family/Gallery (any number)` (empty: keep placeholders). Frame photo slot unchanged.

### 3.8 Piano
- Text: Played piano for 12 years, from age 4 to 16, when I completed my ARCT diploma.
- Credential: The Associate Diploma (ARCT) in Piano Performance and Harmony
- My ARCT program (lists A to F), shown as a small "setlist":
  - Bach, Partita in A minor (Fantasia, Sarabande, Gigue)
  - Beethoven, Pathétique Sonata
  - Chopin, Grande Valse Brillante
  - Debussy, Reflets dans l'eau
  - Tan Dun, Eight Memories in Watercolor
- Recital photos are in.

### 3.9 Pie: Baking and cooking
- Text: I'm a big back and I love eating, so naturally I love cooking and baking as well. I have a fire apple crisp recipe I make multiple times a year. I also make coke chicken and Thai curry chicken pretty often. Apart from that, I can cook up most simple dishes. Fried rice with whatever BS is in my fridge is my go to.
- Photos are in.

### 3.10 Fluffy
- Panel title: About Fluffy. Breed: British longhair. Age: 6. With the family since 2021.
- Text: British longhair that we got back in 2021, in the middle of COVID. Funny because my mom was super against pets up until Fluffy, and now she loves him more than me, I swear. This cat is extremely fat, greedy, and selectively stupid. Typically, Fluffy is very ignorant and quiet, but he'll immediately start screaming and pull out every trick he knows for food. Generally he's very social and loves loafing or sleeping around people, but doesn't like prolonged physical touch. Fluffy is 6 years old now and fatter than ever.
- Game behavior tie ins (small, optional, nice): Fluffy meows louder and follows Daniel if he walks near the pie; petting him for more than a couple of seconds makes him walk away. Keep it subtle.
- Photos are in.

### 3.11 Longboard
- Short version: After getting no internship offers for my freshman summer, I decided to build something difficult, useful, and interesting: an electric longboard. I ended up with a fully functional longboard that rides really smoothly, and a fried motor and battery.
- Full story: Daniel's text in `reference/content-todo-filled.pdf` (pages 3 to 4, section 2.11), with only these fixes: "that rides really smoothly" (not "that's rides"), "idiocy" (not "idiocracy"), "splice" or "join" instead of "meld". Keep everything else, including his tone, for his own later edit.
- Link: "My Master Google Doc" https://docs.google.com/document/d/1GeFjlEI0BBgI-yIhaeFw6F2dBhx2u-wVWmrTyLuOT_o/edit?usp=sharing (open in a new tab).
- Current state: built and rideable as a regular longboard; the electric part is unfinished.
- Photos: `photos/2 Home/10 Longboard/` (keep placeholders for empty folders).

## 4. Quick view only

- Work card order: 1 Cold Outreach Automator · 2 Saved posts scroller · 3 DSP and IBB marketing · 4 Ateball · 5 L.E.K. · 6 Genesis
- Inventory labels: Rowing, national champ · Piano, ARCT · Built a longboard · Fluffy · Photography · Baking · Music · Lift and sprint · Beach volleyball · Family
- Fun facts (shown when a box flips):
  - Rowing: Won the national championships! (Novice 8+, CSSRA)
  - Piano: I have the ARCT diploma in Piano Performance.
  - Longboard: Originally supposed to be electric, before I put a hole in my table.
  - Fluffy: Fat and stupid.
  - Photography: Check out my photography from Asia!
  - Baking: I can cook up the best apple crisp you'll ever have.
  - Music: My top 2 genres are classical and dubstep.
  - Exercise: Trap bar deadlift 365 lbs, bench 205 lbs.
  - Beach volleyball: I larp this. I'm terrible, but I love to play.
  - Family: My #1 fans and supporters.

## 5. Decor and audio files

Daniel keeps optional decor images in `photos/3 Room decor (optional)/<slot folder>/`. Copy whatever is there into the matching slot path in `public/assets/decor/` (convert to PNG; the Instagram logo is `.avif`), and keep original placeholders for empty slots. Currently provided: hoodie logo (`stussy logo.jpg`), Instagram logo, poster P1 (`Kanye West Graduation .jpg`). Check every slot folder; more may have been added. Same third party art rules as CLAUDE.md section 5.4.

Audio: lofi MP3s in `public/assets/audio/lofi/`, Rachmaninoff in `public/assets/audio/featured/` (whatever is there).

## 6. Art and decisions

All pending: asset pack, character and cat commissions, spare work table slot, public launch date.
