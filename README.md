# Daniel Xing: pixel room portfolio

A portfolio that plays like a tiny top down room game. Wake up in a UCLA dorm (professional), walk through the door to a childhood bedroom in North York (personal). E does things (pet the cat, ride the longboard, do pull ups), F opens the story behind them. A fast, no game portfolio view lives at `/portfolio` (`/plain` redirects there).

Spec and design record: [`CLAUDE.md`](CLAUDE.md). What is still missing: [`TODO_ASSETS.md`](TODO_ASSETS.md).

## Run it

```bash
npm install
npm run dev       # http://localhost:8080 (and /portfolio)
npm run build     # type check + production build to dist/
npm run preview   # serve the production build
```

Node 20+. Deploys to Vercel as a static site (`vercel.json`).

## Where things live

| To change | Edit |
|---|---|
| Any text on the site | `src/content/*.ts` (`profile.ts`, `dorm.ts`, `home.ts`, `ui.ts`) |
| Photos and videos | `public/media/<item-id>/`, then set `src` in the content file |
| Furniture positions, standing spots, doors | `src/rooms/dorm.ts`, `src/rooms/home.ts` (tile units) |
| Art | `public/assets/<pack>/`, then set `url` in `src/assets/manifest.ts` |
| Posters, logos, the family photo frame | Drop the file in `public/assets/decor/` (names in its README) |
| Wake up line, HUD stats, idle thoughts | `src/content/profile.ts` |
| Portfolio view order, labels, icons, page copy | `src/content/portfolio.ts` (the stories themselves stay in `dorm.ts` and `home.ts`) |
| Portfolio view colours, type, spacing, motion | `src/portfolio/tokens.css` |
| Tile size, sprite sizes, speeds | `src/config.ts` |

Placeholder art is painted in code (`src/assets/placeholders.ts`) at the final sprite sizes. When a manifest entry has a `url`, the file is loaded instead and the placeholder is skipped.

## Controls

WASD or arrows to move. E (or Space) does the object's action, F (or Enter) opens its panel. I opens About me. Click or tap anything to walk to it; items with both options show two buttons. H outlines things you have not found yet. P or Esc for the pause menu. On touch devices: joystick bottom left, two labeled buttons bottom right.

## Portfolio view (`/portfolio`)

Spec: [`PORTFOLIO_VIEW.md`](PORTFOLIO_VIEW.md). The page is rendered to static HTML at build time from `src/content/`, so it works with JavaScript off; `src/portfolio/main.ts` adds the motion and the detail panels. Every card opens a panel with a shareable link, e.g. `/portfolio#ateball`.

Production builds hide any field still marked `[TODO: ...]` and print the list in the build log. Dev (`npm run dev`) shows them highlighted.

Analytics hook: panel opens and game link clicks dispatch a `dx:track` event on `window` (and call `window.va` if Vercel Analytics is added), so any analytics tool can count them.
