// Content to HTML strings for the in-game panels. No DOM or Phaser imports here.
// No DOM or Phaser imports here: this also runs at build time.

import type { ImageItem, LinkItem, Section, VideoItem } from '../content/types';

export type RenderMode = 'panel' | 'plain';

export const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Escapes text and makes [TODO: ...] markers visible. */
export const rich = (s: string) =>
    esc(s).replace(/\[TODO[^\]]*\]/g, (m) => `<span class="todo">${m}</span>`);

const isTodo = (s?: string) => !s || s.includes('[TODO');

function renderImage(img: ImageItem, mode: RenderMode, comingSoon: string) {
    const cap = img.caption ? `<figcaption>${rich(img.caption)}</figcaption>` : '';
    if (img.src) {
        return `<figure class="media"><img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" decoding="async" />${cap}</figure>`;
    }
    const label = mode === 'panel' ? `${esc(img.alt)}<br><span class="todo">[TODO: ${esc(comingSoon.toLowerCase())}]</span>` : esc(img.alt);
    return `<figure class="media"><div class="ph-img" role="img" aria-label="${esc(img.alt)} (${esc(comingSoon.toLowerCase())})"><span>${label}</span></div>${cap}</figure>`;
}

function videoSrc(v: VideoItem): string | null {
    if (!v.id) return null;
    if (v.kind === 'youtube') return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?rel=0`;
    if (v.kind === 'spotify') return `https://open.spotify.com/embed/${v.id.split('/').map(encodeURIComponent).join('/')}`;
    return v.id;
}

function renderVideo(v: VideoItem, mode: RenderMode, comingSoon: string) {
    const src = videoSrc(v);
    if (!src) {
        return `<div class="ph-video" role="img" aria-label="${esc(v.title)} (${esc(comingSoon.toLowerCase())})"><span>${esc(v.title)}<br><span class="todo">[TODO: ${esc(comingSoon.toLowerCase())}]</span></span></div>`;
    }
    if (mode === 'plain') {
        const href = v.url ?? (v.kind === 'youtube' ? `https://www.youtube.com/watch?v=${encodeURIComponent(v.id!)}` : src);
        return `<p><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(v.title)}</a></p>`;
    }
    if (v.kind === 'mp4') {
        return `<video class="embed" src="${esc(src)}" controls preload="none" playsinline title="${esc(v.title)}"></video>`;
    }
    const ratio = v.kind === 'spotify' ? 'spotify' : 'video';
    // Built only when the panel opens, so third party embeds never load with the page.
    return `<div class="embed ${ratio}"><iframe src="${esc(src)}" title="${esc(v.title)}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
}

export function renderLink(l: LinkItem) {
    if (isTodo(l.href)) {
        return `<span class="link todo-link">${rich(l.label)} <span class="todo">[TODO: link]</span></span>`;
    }
    const href = esc(l.href!);
    if (l.download) return `<a class="link" href="${href}" download>${rich(l.label)}</a>`;
    const external = /^https?:/.test(l.href!);
    return `<a class="link" href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${rich(l.label)}${external ? ' <span aria-hidden="true">↗</span><span class="sr">(opens in a new tab)</span>' : ''}</a>`;
}

export interface RenderOpts {
    mode: RenderMode;
    /** Heading level for the section title, or 0 to skip the title. */
    heading: number;
    comingSoonImage: string;
    comingSoonVideo: string;
}

export function renderSection(s: Section, o: RenderOpts): string {
    const out: string[] = [];
    if (o.heading) {
        out.push(`<h${o.heading} class="sec-title">${rich(s.title)}</h${o.heading}>`);
    }
    if (s.subtitle) out.push(`<p class="subtitle">${rich(s.subtitle)}</p>`);
    s.body?.forEach((p) => out.push(`<p>${rich(p)}</p>`));
    const glance = [['Role', s.role], ['Team', s.team], ['Timeline', s.timeline]].filter(([, v]) => v) as [string, string][];
    const counters = (s.counters ?? []).map((c) => [c.label, `${c.value}${c.suffix ?? ''}`] as [string, string]);
    if (glance.length || counters.length) {
        out.push('<dl class="facts">');
        [...glance, ...counters].forEach(([k, v]) => out.push(`<div><dt>${rich(k)}</dt><dd>${rich(v)}</dd></div>`));
        out.push('</dl>');
    }
    ([['The problem', s.problem], ['What I did', s.whatIDid], ['Result', s.result]] as [string, string | undefined][])
        .forEach(([k, v]) => { if (v) out.push(`<p class="writeup"><strong>${rich(k)}.</strong> ${rich(v)}</p>`); });
    if (s.funFact) out.push(`<p class="fun-fact"><strong>Fun fact.</strong> ${rich(s.funFact)}</p>`);
    if (s.facts?.length) {
        out.push('<dl class="facts">');
        s.facts.forEach((f) => out.push(`<div><dt>${rich(f.label)}</dt><dd>${rich(f.value)}</dd></div>`));
        out.push('</dl>');
    }
    s.list?.forEach((l) => {
        if (l.title) out.push(`<h${Math.min(6, (o.heading || 2) + 1)} class="list-title">${rich(l.title)}</h${Math.min(6, (o.heading || 2) + 1)}>`);
        out.push(`<ul class="list">${l.items.map((i) => `<li>${rich(i)}</li>`).join('')}</ul>`);
    });
    if (s.images?.length) {
        const style = s.gallery ?? (s.images.length > 1 ? 'grid' : 'single');
        out.push(`<div class="gallery ${style}">${s.images.map((i) => renderImage(i, o.mode, o.comingSoonImage)).join('')}</div>`);
    }
    s.videos?.forEach((v) => out.push(renderVideo(v, o.mode, o.comingSoonVideo)));
    if (s.tags?.length) out.push(`<p class="tags">${s.tags.map((t) => `<span class="tag">${rich(t)}</span>`).join('')}</p>`);
    if (s.links?.length) out.push(`<p class="links">${s.links.map(renderLink).join('')}</p>`);
    return out.join('\n');
}
