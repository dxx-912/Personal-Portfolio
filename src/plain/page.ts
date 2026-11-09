// Static HTML for /plain, rendered at build time from the same content files as the game.

import { content, profile, ui, type Entry, type PlainGroup, type RoomKey } from '../content';
import { esc, rich, renderLink, renderSection } from '../ui/render';

const GROUPS: { id: PlainGroup; title: string }[] = [
    { id: 'intro', title: 'About' },
    { id: 'projects', title: 'Projects and work' },
    { id: 'experience', title: 'Experience and student orgs' },
    { id: 'education', title: 'Education' },
    { id: 'personal', title: 'Outside work' }
];

const opts = (heading: number) => ({ mode: 'plain' as const, heading, comingSoonImage: ui.todoImage, comingSoonVideo: ui.todoVideo });

function renderEntry(e: Entry, room: RoomKey) {
    const tabs = (e.tabs ?? []).map((t) => `<section class="sub" id="${room}-${esc(e.id)}-${esc(t.id)}">${renderSection(t, opts(4))}</section>`).join('');
    const head = { ...e, title: e.plainTitle ?? e.title, subtitle: e.tabs?.length && e.tabStyle !== 'tabs' ? undefined : e.subtitle };
    return `<article class="entry" id="${room}-${esc(e.id)}">${renderSection(head, opts(3))}${tabs}</article>`;
}

export function renderPlainPage(): string {
    const entries = (Object.keys(content) as RoomKey[]).flatMap((room) =>
        Object.values(content[room]).map((e) => ({ e, room })));

    const sections = GROUPS.map((g) => {
        const items = entries.filter(({ e }) => e.plainGroup === g.id);
        if (!items.length) return '';
        return `<section class="group" id="${g.id}" aria-labelledby="h-${g.id}">
            <h2 id="h-${g.id}">${esc(g.title)}</h2>
            ${items.map(({ e, room }) => renderEntry(e, room)).join('\n')}
        </section>`;
    }).join('\n');

    const nav = GROUPS.map((g) => `<a href="#${g.id}">${esc(g.title)}</a>`).join('');

    return `
<header class="top">
    <p class="game-link"><a href="/">Play the pixel room version</a></p>
    <h1>${esc(profile.name)}</h1>
    <p class="tagline">${rich(profile.tagline)}</p>
    <p class="where">${rich(profile.location)}</p>
    <p class="links">${profile.links.map(renderLink).join('')}</p>
    <nav aria-label="Sections">${nav}<a href="#contact">Contact</a></nav>
</header>
<main>
${sections}
<section class="group" id="contact" aria-labelledby="h-contact">
    <h2 id="h-contact">Contact</h2>
    <p class="links">${profile.links.map(renderLink).join('')}</p>
</section>
</main>
<footer><p><a href="/">Back to the pixel room</a></p></footer>`;
}
