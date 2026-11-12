// Content to HTML strings for the in-game panels. No DOM or Phaser imports here.
// No DOM or Phaser imports here: this also runs at build time.

import type { ImageItem, LinkItem, Section, VideoItem } from '../content/types';

export type RenderMode = 'panel' | 'plain';

export const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const TODO_RE = /\[TODO[^\]]*\]/g;

/**
 * Production builds hide [TODO: ...] markers (and anything that is only a placeholder), the way the
 * quick view does. Development shows them highlighted so they are easy to spot.
 */
const HIDE_TODOS: boolean = (() => { try { return !!import.meta.env?.PROD; } catch { return false; } })();

/** Text without its TODO markers and their dangling punctuation ('' when nothing real is left). */
export const dropTodos = (s: string) => {
    const clean = s.replace(TODO_RE, ' ').replace(/\s{2,}/g, ' ').replace(/^[\s.,;:]+/, '').replace(/\s+([.,;:])/g, '$1').trim();
    return /[A-Za-z0-9]/.test(clean) ? clean : '';
};

/** Escapes text and makes [TODO: ...] markers visible (or drops them in production). */
export const rich = (s: string) =>
    HIDE_TODOS ? esc(dropTodos(s)) : esc(s).replace(TODO_RE, (m) => `<span class="todo">${m}</span>`);

const isTodo = (s?: string) => !s || s.includes('[TODO');
/** True when a piece of text would render as nothing (all TODO in production). */
const blank = (s?: string) => !s || (HIDE_TODOS && !dropTodos(s));

function renderImage(img: ImageItem, mode: RenderMode, comingSoon: string) {
    if (!img.src && HIDE_TODOS) return '';
    const cap = !blank(img.caption) ? `<figcaption>${rich(img.caption!)}</figcaption>` : '';
    if (img.src) {
        const size = img.width && img.height ? ` width="${img.width}" height="${img.height}"` : '';
        const tall = img.width && img.height && img.height / img.width >= 0.85;
        const pic = `<img src="${esc(img.src)}" alt="${esc(img.alt)}"${size} loading="lazy" decoding="async" />`;
        const body = img.href ? `<a class="media-link" href="${esc(img.href)}" target="_blank" rel="noopener noreferrer" title="Open ${esc(img.href.replace(/^https?:\/\//, ''))}">${pic}</a>` : pic;
        return `<figure class="media${img.wide ? ' wide' : ''}${tall ? ' tall' : ''}">${body}${cap}</figure>`;
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

function renderVideo(v: VideoItem, mode: RenderMode, comingSoon: string, inGallery = false) {
    const src = videoSrc(v);
    if (!src) {
        if (HIDE_TODOS) return '';
        return `<div class="ph-video" role="img" aria-label="${esc(v.title)} (${esc(comingSoon.toLowerCase())})"><span>${esc(v.title)}<br><span class="todo">[TODO: ${esc(comingSoon.toLowerCase())}]</span></span></div>`;
    }
    if (mode === 'plain') {
        const href = v.url ?? (v.kind === 'youtube' ? `https://www.youtube.com/watch?v=${encodeURIComponent(v.id!)}` : src);
        return `<p><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(v.title)}</a></p>`;
    }
    if (v.kind === 'mp4') {
        // nothing loads or plays until clicked; the poster frame stands in until then
        const poster = v.poster ? ` poster="${esc(v.poster)}"` : '';
        const size = v.width && v.height ? ` width="${v.width}" height="${v.height}"` : '';
        // tall (phone) videos keep their own shape instead of filling the width with black bars
        const tall = !inGallery && v.width && v.height && v.height > v.width ? ` style="width: min(100%, calc(60vh * ${v.width} / ${v.height}))"` : '';
        return `<figure class="media video${inGallery ? ' in-gallery' : ''}"${tall}><video class="embed mp4" src="${esc(src)}"${poster}${size} controls preload="none" playsinline aria-label="${esc(v.title)}"></video><figcaption>${esc(v.title)}</figcaption></figure>`;
    }
    const ratio = v.kind === 'spotify' ? 'spotify' : 'video';
    // Built only when the panel opens, so third party embeds never load with the page.
    return `<div class="embed ${ratio}"><iframe src="${esc(src)}" title="${esc(v.title)}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
}

/** A link's optional image icon (decorative, so empty alt). */
export const linkIcon = (l: LinkItem, cls = 'link-ico') =>
    l.icon ? `<img class="${cls}" src="${esc(l.icon)}" alt="" width="18" height="18" loading="lazy" decoding="async" />` : '';

export function renderLink(l: LinkItem) {
    if (isTodo(l.href)) {
        if (HIDE_TODOS) return '';
        return `<span class="link todo-link">${rich(l.label)} <span class="todo">[TODO: link]</span></span>`;
    }
    const href = esc(l.href!);
    const ico = linkIcon(l);
    if (l.download) return `<a class="link" href="${href}" download>${ico}${rich(l.label)}</a>`;
    // external sites and PDFs (the resume) open in a new tab so the game keeps its place
    const external = /^https?:/.test(l.href!) || /\.pdf$/i.test(l.href!);
    return `<a class="link" href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${ico}${rich(l.label)}${external ? ' <span aria-hidden="true">↗</span><span class="sr">(opens in a new tab)</span>' : ''}</a>`;
}

/** A numbered recital program: "Composer, Piece" with the composer in bold (items are already escaped). */
export const setlist = (items: string[]) =>
    `<ol class="setlist">${items.map((x) => {
        const k = x.indexOf(', ');
        return `<li><p>${k > 0 ? `<strong>${x.slice(0, k)}</strong><span>${x.slice(k + 2)}</span>` : x}</p></li>`;
    }).join('')}</ol>`;

/** The long story in its own bordered, scrollable box (opening paragraphs, then the rest behind an expander). */
function storyBox(s: Section, level: number): string {
    const m = s.more;
    if (!m) return '';
    const intro = (m.intro ?? []).filter((p) => !blank(p)).map((p) => `<p>${rich(p)}</p>`).join('');
    const rest = m.body.filter((p) => !blank(p)).map((p) => `<p>${rich(p)}</p>`).join('');
    if (!intro && !rest) return '';
    const head = m.title ? `<h${level} class="story-title">${rich(m.title)}</h${level}>` : '';
    const more = rest ? `<details class="story-more"><summary>${rich(m.label)}</summary>${rest}</details>` : '';
    return `<section class="story-box"${m.title ? ` aria-label="${esc(m.title)}"` : ''}>${head}<div class="story-scroll" tabindex="0">${intro}${more}</div></section>`;
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
    const omit = new Set(s.omit ?? []);
    if (o.heading) {
        out.push(`<h${o.heading} class="sec-title">${rich(s.title)}</h${o.heading}>`);
    }
    // a subtitle may run over a few lines (separated by \n)
    if (!blank(s.subtitle)) out.push(`<p class="subtitle">${s.subtitle!.split('\n').map(rich).join('<br>')}</p>`);
    const links = (s.links ?? []).map(renderLink).filter(Boolean);
    if (s.linksTop && links.length) out.push(`<p class="links links-top">${links.join('')}</p>`);
    s.body?.forEach((p) => { if (!blank(p)) out.push(`<p>${rich(p)}</p>`); });
    const glance = ([['Role', 'role'], ['Team', 'team'], ['Timeline', 'timeline']] as const)
        .filter(([, k]) => !s.hideGlance && !omit.has(k) && !blank(s[k])).map(([label, k]) => [label, s[k]!] as [string, string]);
    const counters = (s.counters ?? []).map((c) => [c.label, `${c.prefix ?? ''}${c.value.toLocaleString('en-US')}${c.suffix ?? ''}`] as [string, string]);
    // role, team, timeline, counters, and facts share one grid of tiles; a multiple of three tiles
    // lines up as rows of three, all the same size
    const tiles = [...glance, ...counters, ...(s.facts ?? []).filter((f) => !blank(f.value)).map((f) => [f.label, f.value] as [string, string])];
    if (tiles.length) {
        out.push(`<dl class="facts${tiles.length % 3 === 0 ? ' facts-3' : ''}">`);
        tiles.forEach(([k, v]) => out.push(`<div><dt>${rich(k)}</dt><dd>${rich(v)}</dd></div>`));
        out.push('</dl>');
    }
    const writeup: [string, string | undefined][] = [
        ...(omit.has('problem') ? [] : [['The problem', s.problem]] as [string, string | undefined][]),
        ...(s.notes ?? []).map((n) => [n.label, n.text] as [string, string]),
        ...(omit.has('whatIDid') ? [] : [['What I did', s.whatIDid]] as [string, string | undefined][]),
        ...(omit.has('result') ? [] : [['Result', s.result]] as [string, string | undefined][])
    ];
    writeup.forEach(([k, v]) => { if (!blank(v)) out.push(`<p class="writeup"><strong>${rich(k)}.</strong> ${rich(v!)}</p>`); });
    const story = storyBox(s, Math.min(6, (o.heading || 2) + 1));
    if (story) out.push(story);
    s.list?.forEach((l) => {
        const items = l.items.filter((i) => !blank(i));
        if (!items.length) return;
        const h = Math.min(6, (o.heading || 2) + 1);
        if (l.title) out.push(`<h${h} class="list-title">${rich(l.title)}</h${h}>`);
        if (l.style === 'chips') out.push(`<ul class="chips">${items.map((i) => `<li class="tag">${rich(i)}</li>`).join('')}</ul>`);
        else if (l.style === 'plain') items.forEach((i) => out.push(`<p class="list-plain">${rich(i)}</p>`));
        else if (l.style === 'setlist') out.push(setlist(items.map(rich)));
        else out.push(`<ul class="list">${items.map((i) => `<li>${rich(i)}</li>`).join('')}</ul>`);
    });
    // a sideways 'scroll' gallery keeps wide images (website screenshots) out of the row, full width below it
    const scrollWide = s.gallery === 'scroll' ? (s.images ?? []).filter((i) => i.wide) : [];
    // videos marked inGallery lead the photo row (not on the plain page, where videos are links)
    const galleryVideos = o.mode === 'plain' ? [] : (s.videos ?? []).filter((v) => v.inGallery && v.kind === 'mp4' && videoSrc(v));
    const imgs = [
        ...galleryVideos.map((v) => renderVideo(v, o.mode, o.comingSoonVideo, true)),
        ...(s.images ?? []).filter((i) => !scrollWide.includes(i)).map((i) => renderImage(i, o.mode, o.comingSoonImage))
    ].filter(Boolean);
    const wideImgs = scrollWide.map((i) => renderImage(i, o.mode, o.comingSoonImage)).filter(Boolean);
    if (imgs.length) {
        if (s.galleryTitle) {
            const h = Math.min(6, (o.heading || 2) + 1);
            out.push(`<h${h} class="list-title">${rich(s.galleryTitle)}</h${h}>`);
        }
        // more than three photos always scroll sideways (decks keep their slide viewer)
        const style = imgs.length > 3 && s.gallery !== 'slides' && s.gallery !== 'viewer' ? 'scroll'
            : s.gallery ?? (imgs.length > 1 ? 'grid' : 'single');
        const h = style === 'scroll' && s.galleryHeight ? ` style="--h: ${s.galleryHeight}px"` : '';
        out.push(`<div class="gallery ${style}"${h}>${imgs.join('')}</div>`);
    }
    if (wideImgs.length) out.push(`<div class="gallery full">${wideImgs.join('')}</div>`);
    s.videos?.filter((v) => !galleryVideos.includes(v)).forEach((v) => out.push(renderVideo(v, o.mode, o.comingSoonVideo)));
    const tags = s.hideTags ? [] : (s.tags ?? []).filter((t) => !blank(t));
    if (tags.length) out.push(`<p class="tags">${tags.map((t) => `<span class="tag">${rich(t)}</span>`).join('')}</p>`);
    if (!s.linksTop && links.length) out.push(`<p class="links">${links.join('')}</p>`);
    return out.join('\n');
}
