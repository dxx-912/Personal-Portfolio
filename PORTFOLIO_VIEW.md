# PORTFOLIO_VIEW.md: the "no time to play" portfolio

This file specs the non game version of Daniel's portfolio. It replaces the current `/plain` page. Read it together with `CLAUDE.md` (same content system, same writing rules). Open `reference/portfolio-view-mockup.html` in a browser (or screenshot it with Playwright) before building: it is the approved draft of the page and the project detail panel.

Build this after iteration 2 of the game (CLAUDE.md section 14) is finished and pushed, so the two efforts do not fight over `src/content/`.

---

## 1. What this is and why

Most recruiters will give the site 30 to 60 seconds. This view is for them: a fast, polished, scrolling portfolio that would pass as a top 10% portfolio on its own, while still clearly belonging to the same brand as the game. It emphasizes professional work, with one compact section on personal interests.

It is **not** a plain fallback anymore. The bar: cohesive branding, signature animation, nothing that looks like default browser styling.

Inspiration: https://jin-kim-portfolio.vercel.app/ for its cohesive branding and polished animation, not its structure. Use Playwright to open it and study how its motion feels (timing, easing, reveal style) and borrow the quality bar, not the design.

---

## 2. Name, route, and links

- **Route:** `/portfolio`. Keep `/plain` as a redirect to `/portfolio` so old links work.
- **Link label in the game** (top left, replacing "Plain version"): **"No time to play? Quick view"** (no sad face). Keep the label in one content constant.
- **Link back to the game** from the portfolio view: the hero button "Play the game version", a gamepad link in the footer, and the nav bar.
- On small screens where the game is cramped, the game shows a gentle one time suggestion: "On a phone? The quick view might be comfier," with both options.

---

## 3. Concept: a day in Daniel's life

The page scrolls from morning to night. Each section is a time of day with a clock stamp, and the page background shifts through the sky (sunrise, noon, sunset, night) as you scroll. A small pixel Daniel walks down a rail on the left edge as you scroll, showing progress through the day, and is asleep by the night section.

The creative layer lives entirely in the background and the margins. Content is always readable, never hidden behind a click, never delayed by an animation. A recruiter who never scrolls still gets name, focus, resume, and LinkedIn from the first screen.

### Section order (top to bottom)
| Section | Clock stamp | Background | Content |
|---|---|---|---|
| Nav bar | none | `#1a1626` | Name wordmark; time of day jump links: Morning, Work, Evening, Night |
| Morning (hero) | "07:30 AM, Rieber Hall" | Sunrise peach `#fde6c8` | Typed headline "Hi, I'm Daniel.", tagline, focus line, buttons (Resume, LinkedIn, Play the game version), HUD card (headshot plus joke stat bars) |
| Work | "12:00 PM, At work" | Noon sky `#bfe0f5` | "Selected work": numbered cards [01] to [06], each opens a detail panel |
| Evening | "06:00 PM, After class" | Sunset orange `#f7b98a` | "Leadership": Hope For Hearing feature with counters; org tags; "Education": UCLA and Upper Canada College cards |
| Night | "11:00 PM, Off the clock" | Night navy `#141a33` with stars | "Inventory": hobby item boxes (flip on hover, open a panel on click); "Let's talk." contact footer |

### Work cards (order and content)
Order is a draft for Daniel to confirm. Lead with product work for product management recruiting.
| Card | Label | Title | Face line |
|---|---|---|---|
| [01] | SOFTWARE | Cold Outreach Automator | what it does, why built, result; live link |
| [02] | SOFTWARE | Saved posts scroller | what it does, why built `[TODO]`; live link |
| [03] | PRODUCT | Ateball, Creative Labs | Project manager. result `[TODO]` |
| [04] | CONSULTING | Genesis Alternative Ventures | Project manager. scope, result `[TODO]` |
| [05] | CASE COMP | L.E.K. Case Competition | 3rd place finalist out of 50+ teams. Case and answer from CONTENT_FINAL.md |
| [06] | MARKETING | DSP and IBB | Campaigns, rush videos, website rebuilds. metrics `[TODO]` |

Each card face must stand on its own: title, role, one line result, two or three tags. Clicking is optional depth.

### Evening content
- Hope For Hearing feature card: the scale line in the past tense ("At its peak, Hope For Hearing grew to 500+ members across 12 high school chapters in Canada."); counters 500+ members, 12 high school chapters, $25,000+ raised, 50+ events; click opens its detail panel (short story plus "Read the whole story").
- Org tags: Sharpe Fellows (tech VP), Delta Sigma Pi, IBB, Business in Entertainment Association, UBS Tech Committee, ResLife RA. Each tag opens a small popover with a one line description and role.
- Education: UCLA (major `[TODO: confirm]`, honours student) and Upper Canada College (IB Diploma 40/45, SAT 1560). Each card opens a detail panel with the full education content.

### Night content (inventory)
Item boxes with labels from `CONTENT_FINAL.md`: Rowing, national champ; Piano, ARCT; Built a longboard; Fluffy; Photography; Baking; Music; Lift and sprint; Beach volleyball. Plus North York and family as two more boxes or as part of the footer story, Claude Code's call. Acting is removed everywhere. Honour of Kings is not included.

---

## 4. Detail panels (click for more)

Every work card, the Hope For Hearing card, the education cards, and every inventory box opens a detail panel. Open `reference/portfolio-view-mockup.html` (second mockup) for the approved layout.

**Project panel layout (top to bottom):**
1. Label (e.g. "[03] PRODUCT"), title, one line context (org, role), close button.
2. Gallery: 2 to 4 images, arrows, dots, keyboard arrows, swipe on touch, click to enlarge. Images load only when the panel opens.
3. Three at a glance boxes: Role, Team, Timeline.
4. Three part write up: The problem, What I did, Result.
5. Tags and links (live site, slides, video).
6. Previous and next buttons to move between projects without closing.

**Hobby panel:** same shell, lighter: gallery, a short story, one "fun fact" box instead of role, team, timeline.

**Behavior:**
- Opening: the clicked card expands into the panel (shared element style transition, about 300ms), the page behind dims, and the URL updates to `/portfolio#<item-id>` so any panel can be linked directly. Loading a URL with a hash opens that panel.
- Desktop: panel slides over the right side with a narrow strip of sibling cards on the left (current one highlighted yellow). Mobile: full screen sheet, swipe down to close, no side strip, previous and next stay at the bottom.
- Closing: X button, Esc, clicking the dimmed area, or the browser back button. The panel shrinks back into its card. Focus returns to the card.
- Accessible: real dialog semantics, focus trapped inside while open, all controls keyboard reachable, visible focus styles.
- Hover hint on clickable cards: a small "View more" label with an arrow.

---

## 5. Branding and visual system

One cohesive identity shared with the game. Pixel styling as accent, not as costume.

- **Type:** Press Start 2P only for big headings, the hero headline, and big numbers. Everything else follows CLAUDE.md section 0.1 G: default pairing Space Mono (labels, nav, subheadings) plus Nunito (paragraphs), switchable via one token after Daniel picks from `/fonts`. No pixel fonts for body text, and no plain corporate sans. Self host with `font-display: swap`.
- **Shapes:** hard 2px outlines in `#1a1626`, square corners, offset block shadows with no blur (`4px 4px 0 #1a1626`). Cards on `#fffdf7`.
- **Color:** the sky colors carry the mood per section (table in section 3). UCLA blue `#2774ae` is the main accent (primary button). Section accents: `#185fa5` day, `#993c1d` evening, `#85b7eb` night, `#f6c94a` for highlights and the active nav item. HUD bar colors match the game: red `#d4493a`, grey `#8a96a5`, blue `#3d7fd4`.
- **Imagery:** real screenshots and photos inside a 2px outlined frame. The pixel sprite of Daniel and the game's palette tie everything back to the game. Reuse game sprites from `src/assets/manifest.ts` where possible.
- **Voice:** first person, plain, direct, a little playful in labels ("Off the clock", "Inventory"), never in the facts. No long dash characters anywhere.

Put all colors, font sizes, spacing, shadow, and motion values in one tokens file (CSS custom properties) so the whole view can be retuned in one place.

---

## 6. Animation spec

Pins A1 to A9 refer to `reference/portfolio-view-mockup.html`.

| Pin | Element | Motion |
|---|---|---|
| A1 | Nav bar | The section currently in view highlights its icon in yellow; clicking a link smooth scrolls to that section. Nav compacts slightly after the hero. |
| A2 | Sky and clock | Background blends continuously between section colors as you scroll (not hard cuts). Each clock stamp ticks up from the previous time when its section enters view. |
| A3 | Hero headline | Types out letter by letter like game dialogue with a blinking cursor, first load only, under 1 second total. |
| A4 | Buttons | Press down into their shadow on hover and active. "Play the game version" has a slow shimmer sweep. |
| A5 | HUD card | Stat bars fill on load; Sleep stops at 2/6. Hovering the headshot swaps it for the idle pixel sprite. |
| A6 | Work cards | Stagger in (slide up and fade) as they enter view. Hover lifts the card and grows its shadow; the [0X] label flickers once. |
| A7 | Hope For Hearing | Counters count up from 0 when in view. |
| A8 | Inventory | Boxes pop in one by one like a game menu. Hover or tap flips a box to a one line fun fact; click opens its panel. Stars twinkle slowly in the background. |
| A9 | Footer | "Let's talk." gets a blinking cursor; the game link pulses gently. |
| Rail | Walking sprite | Pixel Daniel walks down the left rail in step with scroll progress, using the walk cycle frames; switches to a sleeping pose in the night section. Hidden on narrow phones or moved to a thin top progress bar. |
| Panels | Detail panels | Card to panel expand and collapse (section 4), gallery slides, dim backdrop fade. |

Rules for all motion:
- Content is never delayed: text is in the DOM and readable immediately; animations only enhance it.
- Use transforms and opacity only (no layout thrashing); 60 fps on a mid range laptop and a phone.
- Prefer CSS and the Web Animations API with IntersectionObserver. Scroll linked effects may use CSS scroll driven animations with a small JS fallback. A small library is fine if it clearly pays for itself; no heavy frameworks.
- `prefers-reduced-motion`: replace everything with simple fades, use fixed per section colors, freeze the sprite, no typing, no counters (show final numbers), no shimmer, no twinkle.

---

## 7. Content and data

- Read everything from `src/content/`, the same source the game panels use, so each story is written once.
- Extend the content types as needed for this view: `summary` (card face line), `role`, `team`, `timeline`, `problem`, `whatIDid`, `result`, `tags`, `gallery` (images with alt text), `links`, `funFact` (hobbies), `cardOrder`, and a `portfolioSection` (work, leadership, education, inventory).
- Never invent facts. Missing fields render clear `[TODO: ...]` placeholders in development and are listed in `TODO_ASSETS.md` under a "Portfolio view" heading. In a production build, hide empty fields gracefully instead of showing TODO text, and log them at build time.
- Open items: work card order and fun facts (see `TODO_ASSETS.md`). Settled: tagline, inventory labels, Hope For Hearing scale, the major (one constant), the entertainment association's name.

---

## 8. Quality bar

- **Speed:** under 1 second to usable on throttled 4G; Lighthouse performance and accessibility 95+. Images WebP, lazy loaded, sized. Fonts self hosted and subset.
- **Works without JavaScript:** all content readable with JS disabled (panels can fall back to anchored sections).
- **Responsive:** looks intentional at 375px, 768px, 1280px, and 1920px. Work cards go to one column on phones.
- **Accessibility:** semantic headings in order, alt text everywhere, WCAG AA contrast on every sky color (check the sunset and noon sections carefully), keyboard navigable, visible focus.
- **SEO and sharing:** title, description, Open Graph image (a screenshot of the hero), canonical URL.
- **Analytics hooks (optional):** count panel opens and game link clicks so Daniel can see what recruiters look at.

---

## 9. Build order and definition of done

1. Tokens file, fonts, page skeleton with all sections and real content from `src/content/`. Route `/portfolio`, `/plain` redirect, renamed game link.
2. Static styling to match the mockup at all breakpoints.
3. Detail panels with deep links, gallery, previous and next, mobile sheet.
4. Animations A1 to A9, the walking sprite, panel transitions, reduced motion version.
5. Performance, accessibility, no JS fallback, SEO tags.
6. Verify with Playwright: screenshots at 375, 768, 1280 px for every section and at least three open panels; a reduced motion pass; compare against the mockup; fix anything that looks default or unstyled. Update `TODO_ASSETS.md`. Commit and push.

**Done means:** a recruiter can learn who Daniel is, what he has built, and how to reach him within 30 seconds on a phone or laptop; every card opens a detailed panel with a shareable link; the page feels unmistakably like the game's brand; nothing looks like default styling; it is fast and accessible.

---

## 10. Iteration 4 changes (current work)

These are approved and override anything above that conflicts.

1. **Link label:** "No time to play? Quick view" with no sad face, in the game and anywhere else it appears.
2. **Fonts:** subheadings, descriptions, card text, panel text, and the Morning, Work, Evening, Night, and Play nav all move to the pairing in CLAUDE.md section 0.1 G. They currently look like default browser text and do not match the brand. Labels and nav in Space Mono can be small caps style with letter spacing; paragraphs in Nunito at 17 to 18px.
3. **Leadership (evening section) becomes a swipeable card gallery,** styled and behaving like "Selected work": a horizontal row of cards that scrolls or swipes, with arrow buttons on desktop, snap points, and a peek of the next card. Every card opens a detail panel exactly like the work panels (section 4), with a deep link.
   - Order: William F. Sharpe Fellows, technology vice president, first; then the other orgs (Delta Sigma Pi, IBB, Business in Entertainment Association, UBS Technology Committee, UCLA ResLife RA); **Hope For Hearing last**, as the largest card in the gallery with its counters, so it reads as the closing highlight.
   - The separate org tag row goes away (the cards replace it). Education stays below the gallery.
4. **Remove the footer line** "Same stories as the game, minus the walking."
5. **More dynamic animation, tastefully:** gallery cards drift in with a slight stagger and settle; the active card in a gallery scales up a touch; section headings slide in with a short underline draw; inventory items wobble once on hover; panel images fade and scale in; the nav indicator slides between items instead of jumping. Keep every effect short (under 400ms), never block reading, and keep the reduced motion versions.
6. **Sports:** add beach volleyball to the inventory (night section) with its own panel `[TODO content]`.
7. **Music:** the music inventory item now reads "Music" and covers dubstep, EDM, classical, R&B, and hip hop.
8. Re verify with Playwright at 375, 768, and 1280 px after the changes.
