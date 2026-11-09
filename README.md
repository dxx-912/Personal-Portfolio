# Daniel Xing: pixel room portfolio

A portfolio that plays like a tiny top down room game. Wake up in a UCLA dorm (professional), walk through the door to a childhood bedroom in North York (personal). E does things (pet the cat, ride the longboard, do pull ups), F opens the story behind them. A plain HTML version lives at `/plain`.

Spec and design record: [`CLAUDE.md`](CLAUDE.md). What is still missing: [`TODO_ASSETS.md`](TODO_ASSETS.md).

## Run it

```bash
npm install
npm run dev       # http://localhost:8080 (and /plain)
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
| Tile size, sprite sizes, speeds | `src/config.ts` |

Placeholder art is painted in code (`src/assets/placeholders.ts`) at the final sprite sizes. When a manifest entry has a `url`, the file is loaded instead and the placeholder is skipped.

## Controls

WASD or arrows to move. E (or Space) does the object's action, F (or Enter) opens its panel. I opens About me. Click or tap anything to walk to it; items with both options show two buttons. H outlines things you have not found yet. P or Esc for the pause menu. On touch devices: joystick bottom left, two labeled buttons bottom right.
