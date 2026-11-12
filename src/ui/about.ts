// The About me panel (HUD portrait, item 1). It opens right after the wake up, so it is laid out to be
// read in a couple of seconds without scrolling: headshot and intro, links, how to play, then two buttons.

import type { Entry, LinkItem } from '../content/types';
import { TOTAL_ITEMS, ui } from '../content';
import { SECRETS } from '../state';
import { esc, rich } from './render';

/** Small pixel icons drawn as SVG squares (crisp at any zoom). */
const pixelSvg = (rows: string[], cls: string) => {
    const w = rows[0].length, h = rows.length;
    const rects = rows.flatMap((r, y) => [...r].map((c, x) => (c === '#' ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : ''))).join('');
    return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" aria-hidden="true" shape-rendering="crispEdges">${rects}</svg>`;
};

const DOC_ICON = pixelSvg([
    '######..',
    '#....##.',
    '#....###',
    '#......#',
    '#.####.#',
    '#......#',
    '#.####.#',
    '#......#',
    '#.###..#',
    '########'
], 'ab-ico');

const MOUSE_ICON = pixelSvg([
    '..####..',
    '.#..#.#.',
    '#...#..#',
    '#...#..#',
    '#######.',
    '#......#',
    '#......#',
    '#......#',
    '.#....#.',
    '..####..'
], 'ab-mouse');

const linkBtn = (l: LinkItem, primary: boolean) => {
    if (!l.href) return '';
    const external = /^https?:/.test(l.href) || /\.pdf$/i.test(l.href);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    const icon = primary ? DOC_ICON : l.icon ? `<img class="ab-ico" src="${esc(l.icon)}" alt="" width="18" height="18" />` : '';
    return `<a class="ab-btn ${primary ? 'ab-primary' : 'ab-secondary'}" href="${esc(l.href)}"${attrs}>${icon}<span>${esc(l.label)}</span></a>`;
};

const keys = (k: string[]) => k.map((c) => `<kbd class="ab-key">${esc(c)}</kbd>`).join('');

export function aboutHtml(entry: Entry) {
    const a = ui.about;
    const shot = entry.images?.[0];
    const links = entry.links ?? [];
    const resume = links.find((l) => /resume/i.test(l.label));
    const others = links.filter((l) => l !== resume);

    const photo = shot?.src
        ? `<img class="ab-shot" src="${esc(shot.src)}" alt="${esc(shot.alt)}" width="160" height="160" />`
        : `<div class="ab-shot ab-shot-ph" role="img" aria-label="${esc(shot?.alt ?? 'Headshot')}"></div>`;

    const howTo = a.keys.map((k) => `
        <li class="ab-how-item">
            <span class="ab-keys">${k.mouse ? MOUSE_ICON : keys(k.keys)}</span>
            <span class="ab-how-l">${esc(k.label)}</span>
        </li>`).join('');

    return `
        <div class="ab-top">
            ${photo}
            <div class="ab-intro">
                <p class="ab-hi">${esc(a.headline)}</p>
                ${(entry.body ?? []).map((p) => `<p class="ab-text">${rich(p)}</p>`).join('')}
                ${entry.callout ? `<p class="ab-callout">${rich(entry.callout)}</p>` : ''}
                <div class="ab-links">
                    ${resume ? linkBtn(resume, true) : ''}
                    ${others.map((l) => linkBtn(l, false)).join('')}
                </div>
            </div>
        </div>
        <div class="ab-how" aria-labelledby="ab-how-h">
            <h3 id="ab-how-h" class="ab-how-h">${esc(a.howTitle)}</h3>
            <ul class="ab-how-row">${howTo}</ul>
            <p class="ab-line">${esc(a.rooms)}</p>
            <p class="ab-line">${esc(a.counts(TOTAL_ITEMS, SECRETS.length))}</p>
        </div>`;
}

export function aboutFooterHtml() {
    const a = ui.about;
    return `
        <footer class="ab-foot">
            <a class="ab-btn ab-secondary ab-quick" href="/portfolio">${esc(a.quick)}</a>
            <button type="button" class="ab-btn ab-primary ab-start">${esc(a.start)}</button>
        </footer>`;
}
