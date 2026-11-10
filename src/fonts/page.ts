// Temporary /fonts comparison (CLAUDE.md 0.1 G). Renders one real game panel (Ateball) and one real
// quick view section in each font pairing, so Daniel can pick. Delete this folder once he has chosen.

import { dormContent } from '../content/dorm';
import { ui } from '../content/ui';
import { esc, rich, renderSection } from '../ui/render';
import { renderPortfolio } from '../portfolio/page';

export const PAIRINGS = [
    { id: 'A', name: 'A (default): Space Mono + Nunito', note: 'Space Mono for labels, nav, and subheadings; Nunito for paragraphs.' },
    { id: 'B', name: 'B: Space Grotesk', note: 'Space Grotesk for everything except the big headings.' },
    { id: 'C', name: 'C: IBM Plex Mono + Nunito', note: 'IBM Plex Mono for labels, nav, and subheadings; Nunito for paragraphs.' }
];

/** The shell: three pairings, each showing the game panel and the quick view side by side. */
export function renderFontsIndex(): string {
    return `
<header class="fx-head">
  <h1>Font pairings</h1>
  <p>Big headings stay Press Start 2P in all three. Pairing A ships today; switching is one line in <code>src/fonts.css</code>.</p>
</header>
${PAIRINGS.map((p) => `
<section class="fx-pair" id="pair-${p.id}" aria-labelledby="pair-${p.id}-h">
  <h2 id="pair-${p.id}-h">${esc(p.name)}</h2>
  <p>${esc(p.note)}</p>
  <div class="fx-frames">
    <figure><figcaption>Game panel: laptop, Ateball tab</figcaption>
      <iframe src="/fonts/game.html?pair=${p.id}" title="Game panel in pairing ${p.id}" loading="lazy"></iframe></figure>
    <figure><figcaption>Quick view: Selected work and the Ateball panel</figcaption>
      <iframe src="/fonts/quick.html?pair=${p.id}" title="Quick view in pairing ${p.id}" loading="lazy"></iframe></figure>
  </div>
</section>`).join('')}`;
}

const sec = (s: Parameters<typeof renderSection>[0], heading: number) =>
    renderSection(s, { mode: 'panel', heading, comingSoonImage: ui.todoImage, comingSoonVideo: ui.todoVideo });

/** The laptop panel as the game shows it, with the Ateball tab selected, plus a sample prompt. */
export function renderFontsGame(): string {
    const e = dormContent.laptop;
    const tabs = e.tabs ?? [];
    const sel = tabs.findIndex((t) => t.id === 'ateball');
    return `
<div class="fx-prompt prompt" style="position: static; transform: none; display: flex; margin: 0 0 16px;">
  <button type="button" class="chip chip-act"><kbd>E</kbd><span>Change outfit</span></button>
  <button type="button" class="chip chip-info"><kbd>F</kbd><span>Resident Assistant</span></button>
</div>
<section class="panel panel-tabs" aria-label="${esc(e.title)}">
  <header class="panel-head"><h2>${rich(e.title)}</h2><button class="panel-close" aria-label="Close">✕</button></header>
  <div class="panel-body">
    ${sec({ ...e, title: e.title }, 0)}
    <div class="tabs-wrap tabs-tabs">
      <div class="tablist">${tabs.map((t, i) => `<button class="tab tab-tabs" aria-selected="${i === sel}">${rich(t.title)}</button>`).join('')}</div>
      <div class="tabpanels"><div class="tabpanel">${sec(tabs[sel], 3)}</div></div>
    </div>
  </div>
</section>`;
}

/** The quick view's nav, Selected work, and the Ateball detail, as rendered on /portfolio. */
export function renderFontsQuick(): string {
    const r = renderPortfolio({ production: false });
    return `${r.parts.nav}<main id="main" class="dev">${r.parts.work}
<section class="details"><div class="wrap">${r.parts.detail('ateball')}</div></section></main>`;
}
