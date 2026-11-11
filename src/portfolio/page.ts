// Static HTML for /portfolio, rendered at build time (and on each dev request) from src/content.
// Everything is readable without JavaScript: cards link to anchored detail sections.
// In a production build, [TODO: ...] text is hidden gracefully and listed in the build log instead.

import { dormContent } from '../content/dorm';
import { profile } from '../content/profile';
import { itemsIn, portfolioCopy as C, type PortfolioItem, type PortfolioSection } from '../content/portfolio';
import type { ImageItem, LinkItem, Section } from '../content/types';
import { esc, linkIcon } from '../ui/render';
import { icon } from './icons';

const TODO_RE = /\[TODO[^\]]*\]/g;

export interface RenderResult {
    head: string;
    body: string;
    /** Every TODO left in the content shown on this page, for the build log. */
    todos: string[];
    /** Pieces of the page, for the temporary /fonts comparison. */
    parts: { nav: string; morning: string; work: string; evening: string; night: string; detail: (id: string) => string };
}

/** Which prev/next group a section's items belong to. */
export const groupOf = (s: PortfolioSection) => (s === 'leadership' || s === 'education' ? 'evening' : s);

export function renderPortfolio(opts: { production: boolean }): RenderResult {
    const prod = opts.production;
    const todos: string[] = [];

    /** Text with TODO handling: dev marks TODOs, production drops them (and their dangling punctuation). */
    const t = (s: string | undefined, where: string): string => {
        if (!s) return '';
        const found = s.match(TODO_RE);
        if (found) found.forEach((m) => todos.push(`${where}: ${m}`));
        if (!prod) return esc(s).replace(TODO_RE, (m) => `<span class="todo">${m}</span>`);
        const clean = s.replace(TODO_RE, ' ').replace(/\s{2,}/g, ' ').replace(/^[\s.,;:]+/, '').trim();
        return /[A-Za-z0-9]/.test(clean) ? esc(clean) : '';
    };
    /** A required field that is missing entirely: a TODO in dev, nothing in production. */
    const need = (s: string | undefined, where: string, what: string) => t(s ?? `[TODO: ${what}]`, where);
    /** A write up field, unless the story leaves it out on purpose (Section.omit). */
    const field = (s: Section, k: NonNullable<Section['omit']>[number], where: string, what: string = k) =>
        s.omit?.includes(k) ? '' : need(s[k], where, what);
    const num = (c: { value: number; prefix?: string; suffix?: string }) => `${c.prefix ?? ''}${c.value.toLocaleString('en-US')}${c.suffix ?? ''}`;

    const linkByLabel = (label: string) => profile.links.find((l) => l.label.toLowerCase().startsWith(label.toLowerCase()));
    const link = (l: LinkItem | undefined, text: string, cls: string, iconName?: Parameters<typeof icon>[0], where = 'contact') => {
        // the real logo when Daniel provided one (LinkedIn, Gmail, GitHub, Instagram), else the pixel icon
        const ic = l?.icon ? linkIcon(l, 'clink-ico') : iconName ? icon(iconName) : '';
        if (!l?.href || l.href.includes('[TODO')) {
            todos.push(`${where}: ${text} link`);
            return prod ? '' : `<span class="${cls} is-todo">${ic}<span>${esc(text)}</span> <span class="todo">[TODO: link]</span></span>`;
        }
        const ext = /^https?:/.test(l.href) || /\.pdf$/i.test(l.href);
        return `<a class="${cls}" href="${esc(l.href)}"${l.download ? ' download' : ''}${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${ic}<span>${esc(text)}</span>${ext ? '<span class="sr"> (opens in a new tab)</span>' : ''}</a>`;
    };

    const clock = (hhmm: string) => {
        const [h, m] = hhmm.split(':').map(Number);
        const h12 = ((h + 11) % 12) + 1;
        return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
    };
    const stamp = (id: keyof typeof C.sections) => {
        const s = C.sections[id];
        return `<p class="stamp px"><time class="clock" data-time="${s.time}">${clock(s.time)}</time>, ${esc(s.place)}</p>`;
    };

    const items = {
        work: itemsIn('work'), leadership: itemsIn('leadership'), education: itemsIn('education'), inventory: itemsIn('inventory')
    };
    const numbered = (i: PortfolioItem) => (i.portfolioSection === 'work' ? `[${String(i.cardOrder).padStart(2, '0')}] ` : '');
    const titleOf = (i: PortfolioItem) => i.title ?? i.section.title;
    const faceLine = (i: PortfolioItem) => {
        const s = i.section;
        const role = s.role && !(s.summary ?? '').startsWith(s.role) ? `${s.role}. ` : '';
        return t(`${role}${s.summary ?? '[TODO: one line summary]'}`, `${i.id} card`);
    };
    const tags = (list: string[] | undefined, where: string) =>
        list?.length ? `<span class="tags">${list.map((x) => t(x, where)).filter(Boolean).map((x) => `<span class="tag">${x}</span>`).join('')}</span>` : '';
    const more = `<span class="more" aria-hidden="true">${esc(C.viewMore)} ${icon('arrowRight')}</span>`;

    // ---------- head ----------

    const ogImage = `${profile.siteUrl}/og/portfolio.png`;
    const head = [
        `<title>${esc(C.pageTitle)}</title>`,
        `<meta name="description" content="${esc(C.description)}" />`,
        profile.siteUrl ? `<link rel="canonical" href="${esc(profile.siteUrl)}/portfolio" />` : '',
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="${esc(C.pageTitle)}" />`,
        `<meta property="og:description" content="${esc(C.description)}" />`,
        `<meta property="og:image" content="${esc(ogImage)}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        profile.siteUrl ? `<meta property="og:url" content="${esc(profile.siteUrl)}/portfolio" />` : '',
        `<meta name="twitter:card" content="summary_large_image" />`
    ].filter(Boolean).join('\n    ');
    if (!profile.siteUrl) todos.push('head: siteUrl for canonical and absolute Open Graph URLs');

    // ---------- nav ----------

    const nav = `
<a class="skip" href="#main">${esc(C.skip)}</a>
<header class="nav" id="top">
  <div class="nav-in">
    <a class="wordmark px" href="#morning">${esc(C.wordmark)}</a>
    <nav aria-label="Sections">
      <ul class="nav-links">
        ${C.nav.map((n) => `<li><a href="#${n.id}" data-nav="${n.id}">${icon(n.icon)}<span>${esc(n.label)}</span></a></li>`).join('')}
      </ul>
    </nav>
    <a class="nav-game" href="/" data-track="game-nav">${icon('gamepad')}<span>${esc(C.navGame)}</span></a>
  </div>
</header>
<div class="rail" aria-hidden="true"><span class="rail-line"></span><canvas class="rail-sprite" width="16" height="22"></canvas></div>
<div class="progress" aria-hidden="true"><span></span></div>`;

    // ---------- morning ----------

    const headshot: ImageItem | undefined = dormContent.about.images?.[0];
    const shot = headshot?.src
        ? `<img class="shot-img" src="${esc(headshot.src)}" alt="${esc(headshot.alt)}" width="${headshot.width ?? 320}" height="${headshot.height ?? 320}" fetchpriority="high" />`
        : prod ? `<span class="sr">${esc(C.headshotAlt)}</span>`
            : `<span class="shot-ph">${esc(C.headshotAlt)}<br><span class="todo">[TODO: headshot]</span></span>`;
    if (!headshot?.src) todos.push('hero: headshot photo');

    const lede = [t(profile.tagline, 'hero tagline'), t(profile.focus, 'hero focus')].filter(Boolean).join(' ');
    const morning = `
<section id="morning" class="sky sky-morning" aria-labelledby="hero-title">
  <div class="wrap">
    ${stamp('morning')}
    <div class="hero">
      <div class="hero-text">
        <h1 id="hero-title" class="px hero-title" aria-label="${esc(C.headline.join(' '))}"><span class="type" aria-hidden="true">${C.headline.map(esc).join('<br>')}</span><span class="caret" aria-hidden="true"></span></h1>
        <p class="lede">${lede}</p>
        <p class="btns">
          ${link(linkByLabel('Resume'), C.resume, 'btn', 'file', 'hero')}
          ${link(linkByLabel('LinkedIn'), C.linkedin, 'btn', 'linkedin', 'hero')}
          <a class="btn btn-primary shimmer" href="/" data-track="game-hero">${icon('gamepad')}<span>${esc(C.playGame)}</span></a>
        </p>
      </div>
      <aside class="hud card" aria-label="${esc(C.hudLabel)}">
        <div class="shot${headshot?.src ? ' has-img' : ''}">${shot}<canvas class="shot-sprite" width="16" height="22" aria-hidden="true"></canvas></div>
        <ul class="stats">
          ${profile.stats.map((s) => `<li><span class="px stat-l">${esc(s.label.toUpperCase())} ${s.value}/${s.max}</span><span class="bar" style="--c: ${esc(s.color)}; --f: ${Math.max(0, Math.min(1, s.value / s.max)).toFixed(3)}"><i></i></span></li>`).join('')}
        </ul>
      </aside>
    </div>
  </div>
</section>`;

    // ---------- work ----------

    const workCard = (i: PortfolioItem, n: number) => `
      <li><a class="card work-card reveal" href="#${i.id}" data-item="${i.id}" style="--i: ${n}">
        <span class="lbl px">${esc(numbered(i))}${esc(i.label ?? '')}</span>
        <h3 class="card-title">${esc(titleOf(i))}</h3>
        <span class="face">${faceLine(i)}</span>
        ${tags(i.section.tags, `${i.id} tags`)}
        ${more}
      </a></li>`;
    const work = `
<section id="work" class="sky sky-work" aria-labelledby="work-h">
  <div class="wrap">
    ${stamp('work')}
    <h2 id="work-h" class="px sec-h">${esc(C.sections.work.heading)}</h2>
    <ul class="grid work-grid" role="list">${items.work.map(workCard).join('')}</ul>
  </div>
</section>`;

    // ---------- evening ----------

    const counterHtml = (i: PortfolioItem) => (i.section.counters ?? []).map((c) =>
        `<span class="counter"><span class="num px" data-count="${c.value}" data-prefix="${esc(c.prefix ?? '')}" data-suffix="${esc(c.suffix ?? '')}">${esc(num(c))}</span><span class="num-l">${esc(c.label)}</span></span>`).join('');
    /** The card's small label: the role for student orgs, else the item's label. */
    const leadLabel = (i: PortfolioItem) => (i.kind === 'org' ? t(i.section.subtitle, `${i.id} role`) || esc(C.studentOrg) : esc(i.label ?? ''));
    const leadSlide = (i: PortfolioItem, n: number) => {
        const counters = counterHtml(i);
        return `
      <li class="lead-slide${n === 0 ? ' active' : ''}" id="lead-${i.id}" aria-roledescription="slide" aria-label="${n + 1} of ${items.leadership.length}">
        <a class="card lead-card${counters ? ' feature' : ''}" href="#${i.id}" data-item="${i.id}">
          <span class="feat-text">
            <span class="lbl px">${leadLabel(i)}</span>
            <h3 class="card-title">${esc(i.section.title)}</h3>
            <span class="face">${t(i.kind === 'org' ? i.section.body?.[0] : i.section.summary, `${i.id} card`)}</span>
            ${more}
          </span>
          ${counters ? `<span class="counters">${counters}</span>` : ''}
        </a>
      </li>`;
    };
    const leadTabs = items.leadership.map((i, n) =>
        `<a class="lead-tab" href="#lead-${i.id}" data-slide="${n}"${n === 0 ? ' aria-current="true"' : ''}>${t(i.section.short ?? i.section.title, `${i.id} label`)}</a>`).join('');
    const eduCard = (i: PortfolioItem, n: number) => `
      <li><a class="card edu-card reveal" href="#${i.id}" data-item="${i.id}" style="--i: ${n}">
        <span class="lbl px">${esc(i.label ?? '')}</span>
        <h3 class="card-title">${esc(titleOf(i))}</h3>
        <span class="face">${t(i.section.summary, `${i.id} card`)}</span>
        ${more}
      </a></li>`;
    const evening = `
<section id="evening" class="sky sky-evening" aria-labelledby="lead-h">
  <div class="wrap">
    ${stamp('evening')}
    <h2 id="lead-h" class="px sec-h">${esc(C.sections.evening.heading)}</h2>
    <div class="lead-gal reveal" data-lead aria-roledescription="carousel" aria-label="${esc(C.sections.evening.heading)}">
      <ul class="lead-track" role="list" tabindex="0">${items.leadership.map(leadSlide).join('')}</ul>
      <div class="lead-ctrl">
        <button type="button" class="nb lead-prev" aria-label="${esc(C.leadPrev)}" disabled>${icon('arrowLeft')}</button>
        <nav class="lead-tabs" aria-label="${esc(C.leadPick)}">${leadTabs}</nav>
        <button type="button" class="nb lead-next" aria-label="${esc(C.leadNext)}">${icon('arrowRight')}</button>
      </div>
    </div>
    <h2 class="px sec-h edu-h">${esc(C.sections.evening.education)}</h2>
    <ul class="grid edu-grid" role="list">${items.education.map(eduCard).join('')}</ul>
  </div>
</section>`;

    // ---------- night ----------

    const firstReal = (s: Section) => (s.body ?? []).find((b) => !b.includes('[TODO'));
    const invBox = (i: PortfolioItem, n: number) => {
        const s = i.section;
        const back = s.funFact ? t(s.funFact, `${i.id} fun fact`)
            : prod ? esc(firstReal(s) ?? C.flipFallback) : `${firstReal(s) ? esc(firstReal(s)!) + ' ' : ''}<span class="todo">[TODO: fun fact]</span>`;
        if (!s.funFact) todos.push(`${i.id}: fun fact`);
        return `
      <li><a class="inv" href="#${i.id}" data-item="${i.id}" style="--i: ${n}">
        <span class="inv-in">
          <span class="inv-front">${icon(i.icon ?? 'heart', 'pi inv-icon')}<span class="inv-l">${t(s.short ?? s.title, `${i.id} label`)}</span></span>
          <span class="inv-back" aria-hidden="true">${back}</span>
        </span>
      </a></li>`;
    };
    const night = `
<section id="night" class="sky sky-night" aria-labelledby="inv-h">
  <div class="stars" aria-hidden="true"></div>
  <div class="wrap">
    ${stamp('night')}
    <h2 id="inv-h" class="px sec-h">${esc(C.sections.night.heading)}</h2>
    <ul class="grid inv-grid" role="list">${items.inventory.map(invBox).join('')}</ul>
    <footer class="contact" id="contact">
      <h2 class="px talk">${esc(C.sections.night.contact)}<span class="caret" aria-hidden="true"></span></h2>
      <p class="contact-links">
        ${link(linkByLabel('Email'), C.email, 'clink', 'mail')}
        ${link(linkByLabel('LinkedIn'), C.linkedin, 'clink', 'linkedin')}
        ${link(linkByLabel('Resume'), C.resume, 'clink', 'file')}
        ${link(linkByLabel('GitHub'), C.github, 'clink', 'github')}
        ${link(linkByLabel('Instagram'), C.instagram, 'clink')}
        <a class="clink clink-game" href="/" data-track="game-footer">${icon('gamepad')}<span>${esc(C.game)}</span></a>
      </p>
    </footer>
  </div>
</section>`;

    // ---------- detail sections (the panels; anchored sections without JS) ----------

    const gallery = (imgs: ImageItem[] | undefined, where: string) => {
        const list = (imgs ?? []).filter((im) => prod ? !!im.src : true);
        (imgs ?? []).filter((im) => !im.src).forEach((im) => todos.push(`${where}: photo "${im.alt}"`));
        if (!list.length) return '';
        const slides = list.map((im, k) => `
          <li class="gal-slide" aria-label="${esc(C.galleryLabel(k + 1, list.length))}">
            ${im.src
                ? `<button type="button" class="gal-zoom" data-zoom="${esc(im.src)}" aria-label="${esc(C.enlarge)}: ${esc(im.alt)}"><img src="${esc(im.src)}" alt="${esc(im.alt)}" loading="lazy" decoding="async" width="${im.width ?? 800}" height="${im.height ?? 500}" /></button>`
                : `<div class="gal-ph"><span>${esc(im.alt)}</span><span class="todo">[TODO: photo coming soon]</span></div>`}
            ${im.caption ? `<p class="gal-cap">${t(im.caption, where)}</p>` : ''}
          </li>`).join('');
        return `
        <div class="gal" data-gal aria-label="Photos">
          <ul class="gal-track" tabindex="0">${slides}</ul>
          ${list.length > 1 ? `<div class="gal-ctrl">
            <button type="button" class="nb gal-prev" aria-label="Previous photo">${icon('arrowLeft')}</button>
            <span class="gal-dots">${list.map((_, k) => `<button type="button" class="dot" aria-label="${esc(C.galleryLabel(k + 1, list.length))}"${k === 0 ? ' aria-current="true"' : ''}></button>`).join('')}</span>
            <button type="button" class="nb gal-next" aria-label="Next photo">${icon('arrowRight')}</button>
          </div>` : ''}
        </div>`;
    };

    /** The long version of a story behind a "Read the whole story" expander. */
    const story = (s: Section, where: string, level: number) => {
        const m = s.more;
        if (!m) return '';
        const intro = (m.intro ?? []).map((b) => t(b, where)).filter(Boolean).map((b) => `<p>${b}</p>`).join('');
        const rest = m.body.map((b) => t(b, where)).filter(Boolean).map((b) => `<p>${b}</p>`).join('');
        if (!intro && !rest) return '';
        const head = m.title ? `<h${level} class="px story-title">${esc(m.title)}</h${level}>` : '';
        const more = rest ? `<details class="story-more"><summary class="px">${esc(m.label)}</summary>${rest}</details>` : '';
        return `<section class="story-box"${m.title ? ` aria-label="${esc(m.title)}"` : ''}>${head}<div class="story-scroll" tabindex="0">${intro}${more}</div></section>`;
    };
    /** A local MP4 (the DSP rush video): nothing loads or plays until it is clicked. */
    const video = (v: NonNullable<Section['videos']>[number]) => {
        const size = v.width && v.height ? ` width="${v.width}" height="${v.height}"` : '';
        return `<figure class="d-video"><video src="${esc(v.id!)}"${v.poster ? ` poster="${esc(v.poster)}"` : ''}${size} controls preload="none" playsinline aria-label="${esc(v.title)}"></video><figcaption>${esc(v.title)}</figcaption></figure>`;
    };
    const missingVideos = (s: Section, where: string) =>
        (s.videos ?? []).filter((v) => !v.id).forEach((v) => todos.push(`${where}: video "${v.title}"`));

    /** Body paragraphs, facts, lists, videos, links: whatever else the story has. */
    const extras = (s: Section, where: string, level = 4) => {
        const out: string[] = [];
        (s.body ?? []).forEach((b) => { const x = t(b, where); if (x) out.push(`<p>${x}</p>`); });
        (s.videos ?? []).filter((v) => v.kind === 'mp4' && v.id).forEach((v) => out.push(video(v)));
        if (s.facts?.length) {
            const rows = s.facts.map((f) => [t(f.label, where), t(f.value, where)]).filter(([, v]) => v);
            if (rows.length) out.push(`<dl class="facts">${rows.map(([k, v]) => `<div><dt class="px">${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`);
        }
        out.push(story(s, where, level + 1));
        (s.list ?? []).forEach((l) => {
            const lis = l.items.map((x) => t(x, where)).filter(Boolean);
            if (!lis.length) return;
            if (l.title) out.push(`<h${level + 1} class="px list-h">${t(l.title, where)}</h${level + 1}>`);
            if (l.style === 'chips') out.push(`<ul class="tags chips" role="list">${lis.map((x) => `<li class="tag">${x}</li>`).join('')}</ul>`);
            else if (l.style === 'plain') lis.forEach((x) => out.push(`<p>${x}</p>`));
            else out.push(`<ul class="list">${lis.map((x) => `<li>${x}</li>`).join('')}</ul>`);
        });
        const links = [
            ...(s.videos ?? []).filter((v) => v.kind !== 'mp4').map((v) => link(v.id ? { label: v.title, href: v.url ?? (v.kind === 'youtube' ? `https://www.youtube.com/watch?v=${v.id}` : v.id) } : undefined, v.title, 'btn btn-s', undefined, where)),
            ...(s.links ?? []).map((l) => link(l, l.label.replace(TODO_RE, '').trim() || 'Link', 'btn btn-s', undefined, where))
        ].filter(Boolean);
        if (links.length) out.push(`<p class="d-links">${links.join('')}</p>`);
        return out.join('\n');
    };

    const detail = (i: PortfolioItem) => {
        const s = i.section;
        const w = `${i.id} panel`;
        const isHobby = i.portfolioSection === 'inventory';
        const isCase = i.portfolioSection === 'work' || i.portfolioSection === 'leadership';
        const context = i.kind === 'org' ? ''
            : isCase ? [s.org, s.role].filter(Boolean).map((x) => t(x, w)).filter(Boolean).join('. ') + (s.org || s.role ? '.' : '')
            : t(s.subtitle, w);
        const parts: string[] = [];
        parts.push(`<header class="d-head">
          ${i.kind === 'org' ? `<p class="lbl px">${esc(C.studentOrg)}</p>` : i.label || numbered(i) ? `<p class="lbl px">${esc(numbered(i))}${esc(i.label ?? '')}</p>` : ''}
          <h3 class="px d-title" id="${i.id}-title">${esc(s.title)}</h3>
          ${context ? `<p class="d-context">${context}</p>` : ''}
        </header>`);
        // gather images from the story and its tabs (DSP and IBB)
        const imgs = [...(s.images ?? []), ...(s.tabs ?? []).flatMap((x) => x.images ?? [])];
        [s, ...(s.tabs ?? [])].forEach((x) => missingVideos(x, w));
        parts.push(gallery(imgs, w));
        if (i.kind === 'org') {
            const glance = [[C.glance.role, t(s.role ?? s.subtitle, w)], [C.glance.timeline, field(s, 'timeline', w)]].filter(([, v]) => v);
            if (glance.length) parts.push(`<dl class="glance">${glance.map(([k, v]) => `<div><dt class="px">${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>`);
            const what = (s.body ?? []).map((b) => t(b, w)).filter(Boolean);
            if (what.length) parts.push(`<div class="writeup"><h4 class="px wl">${esc(C.whatItIs)}</h4>${what.map((b) => `<p>${b}</p>`).join('')}</div>`);
            const did = field(s, 'whatIDid', w, 'what I did');
            if (did) parts.push(`<div class="writeup"><h4 class="px wl">${esc(C.writeup.whatIDid)}</h4><p>${did}</p></div>`);
        } else if (isCase) {
            const glance = (['role', 'team', 'timeline'] as const).map((k) => [C.glance[k], field(s, k, w)]).filter(([, v]) => v);
            if (glance.length) parts.push(`<dl class="glance">${glance.map(([k, v]) => `<div><dt class="px">${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>`);
            const counters = (s.counters ?? []).map((c) => `<div><dt class="px">${esc(c.label)}</dt><dd class="px num-s">${esc(num(c))}</dd></div>`).join('');
            if (counters) parts.push(`<dl class="glance glance-num">${counters}</dl>`);
            const write = [
                [C.writeup.problem, field(s, 'problem', w)],
                ...(s.notes ?? []).map((n) => [n.label, t(n.text, w)]),
                [C.writeup.whatIDid, field(s, 'whatIDid', w, 'what I did')],
                [C.writeup.result, field(s, 'result', w)]
            ].filter(([, v]) => v);
            if (write.length) parts.push(`<div class="writeup">${write.map(([k, v]) => `<h4 class="px wl">${esc(k)}</h4><p>${v}</p>`).join('')}</div>`);
        }
        if (isHobby) {
            const story = (s.body ?? []).map((b) => t(b, w)).filter(Boolean);
            if (story.length) parts.push(`<h4 class="px wl">${esc(C.story)}</h4>${story.map((b) => `<p>${b}</p>`).join('')}`);
            const ff = need(s.funFact, w, 'fun fact');
            if (ff) parts.push(`<div class="fun"><p class="px wl">${esc(C.funFact)}</p><p>${ff}</p></div>`);
            const rest = extras({ ...s, body: [] }, w);
            if (rest) parts.push(rest);
        } else if (i.kind !== 'org') {
            const rest = extras(s, w);
            if (rest) parts.push(`<div class="d-extra">${rest}</div>`);
            (s.tabs ?? []).forEach((tb) => {
                const r = extras({ ...tb }, `${w} ${tb.id}`, 5);
                const sub = t(tb.subtitle, `${w} ${tb.id}`).replace(/\n/g, '<br>');
                if (r || sub) parts.push(`<div class="d-sub"><h4 class="px wl">${esc(tb.title)}</h4>${sub ? `<p class="d-context">${sub}</p>` : ''}${r}</div>`);
            });
        }
        parts.push(tags(s.tags, w));
        const backId = isHobby ? 'night' : i.portfolioSection === 'work' ? 'work' : 'evening';
        parts.push(`<p class="d-back"><a href="#${backId}">${esc(C.backTo(C.sectionNames[i.portfolioSection]))}</a></p>`);
        return `<article class="detail" id="${i.id}" data-group="${groupOf(i.portfolioSection)}" aria-labelledby="${i.id}-title">${parts.join('\n')}</article>`;
    };

    const all = [...items.work, ...items.leadership, ...items.education, ...items.inventory];
    const details = `
<section class="details" id="details" aria-labelledby="details-h">
  <div class="wrap">
    <h2 id="details-h" class="px sec-h">${esc(C.moreDetail)}</h2>
    ${all.map(detail).join('\n')}
  </div>
</section>`;

    // Strip list for the panel (title per item, in group order). Read by the script.
    const strip = all.map((i) => ({
        id: i.id, group: groupOf(i.portfolioSection), n: numbered(i).trim(), label: i.kind === 'org' ? 'ORG' : i.label ?? '',
        title: (i.portfolioSection === 'inventory' || i.kind === 'org' ? i.section.short?.replace(/\[TODO[^\]]*\]/g, '').trim() : undefined) || titleOf(i)
    }));
    const data = `<script type="application/json" id="pv-data">${JSON.stringify({ items: strip }).replace(/</g, '\\u003c')}</script>`;

    const body = `${nav}
<main id="main"${prod ? "" : " class=\"dev\""}>
${morning}
${work}
${evening}
${night}
${details}
</main>
${data}`;

    const detailHtml = (id: string) => { const i = all.find((x) => x.id === id); return i ? detail(i) : ''; };
    return { head, body, todos, parts: { nav, morning, work, evening, night, detail: detailHtml } };
}
