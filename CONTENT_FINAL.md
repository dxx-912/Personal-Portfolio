# CONTENT_FINAL.md: approved site content (content pass 1)

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
Each line is its own paragraph:
1. Hey I'm Daniel, thanks for visiting my portfolio :)
2. I'm a sophomore at UCLA right now majoring in economics and cognitive science, born and raised in Toronto.
3. I come from a pretty artistic background (spent my formative years in specialized art programs), so I hope to build and create in whatever I end up doing professionally, whether through the arts or technology.
4. I'm currently recruiting and hope to land product management, product marketing, or growth roles for the summer.

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
- **Business Competition Club, President** (Sep 2023 to May 2025): Led UCC's DECA and FBLA teams, growing membership by 400% through promotional videos and graphics (16,000+ impressions) and running weekly prep sessions, guest lectures, and a 1-on-1 mentorship system.
- **Asian Heritage & Culture Club, President** (Sep 2023 to May 2025): Led 40+ members in running school wide cultural events for Lunar New Year and AAPI Month, plus potlucks, karaoke nights, trivia tournaments, and performances, with promo content reaching 12,000+ impressions.
- Use these exact club names everywhere (not "Business Club" or "Asian Heritage Club").
- Photos: `photos/1 Dorm/07 Grad cap, Upper Canada College/` (hat toss and Asian Heritage folders are empty for now: keep placeholders).

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

Not filled in yet. Keep every home panel's current content and placeholders. Photo folders already exist under `photos/2 Home/` with the right names; wire whatever is inside them into the matching panels and keep placeholders for empty ones.

## 4. Quick view only

- Work card order: not decided; keep the current order.
- Inventory labels: Rowing, national champ · Piano, ARCT · Built a longboard · Fluffy · Photography · Baking · Music · Lift and sprint · Beach volleyball
- Fun facts: not provided; keep placeholders.

## 5. Decor and audio files

Daniel keeps optional decor images in `photos/3 Room decor (optional)/<slot folder>/`. Copy whatever is there into the matching slot path in `public/assets/decor/` (convert to PNG; the Instagram logo is `.avif`), and keep original placeholders for empty slots. Currently provided: hoodie logo (`stussy logo.jpg`), Instagram logo, poster P1 (`Kanye West Graduation .jpg`). Check every slot folder; more may have been added. Same third party art rules as CLAUDE.md section 5.4.

Audio: lofi MP3s in `public/assets/audio/lofi/`, Rachmaninoff in `public/assets/audio/featured/` (whatever is there).

## 6. Art and decisions

All pending: asset pack, character and cat commissions, spare work table slot, public launch date.
