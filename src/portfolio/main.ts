// Portfolio view enhancements. The page is complete without this file (static HTML from page.ts);
// this adds motion (A1 to A9), the walking rail sprite, and the detail panels.

import '@fontsource/press-start-2p/latin-400.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import './tokens.css';
import './portfolio.css';
import { ASSETS } from '../assets/manifest';
import { makeCanvas, outlineRegion, Px } from '../assets/paint';
import { DANIEL_FRAMES } from '../assets/placeholders';
import { portfolioCopy as C } from '../content/portfolio';
import { profile, rollStat } from '../content/profile';
import { icon } from './icons';

const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

/** Analytics hook: listen for "dx:track" events (or define window.va) to count what recruiters open. */
function track(name: string, detail: Record<string, string> = {}) {
    window.dispatchEvent(new CustomEvent('dx:track', { detail: { name, ...detail } }));
    const va = (window as unknown as { va?: (e: string, d: unknown) => void }).va;
    va?.('event', { name, ...detail });
}

// ---------- sprites (painted by the game's own placeholder code, or the final art if it exists) ----------

interface Sheet { img: CanvasImageSource; w: number; h: number }
function sheet(key: 'daniel' | 'daniel_sleep'): Sheet {
    const def = ASSETS[key] as { w: number; h: number; frames?: number; url?: string; paint: (p: Px, w: number, h: number) => void };
    const frames = def.frames ?? 1;
    if (def.url) {
        const img = new Image();
        img.src = `/${def.url}`;
        return { img, w: def.w, h: def.h };
    }
    const [c, ctx] = makeCanvas(def.w * frames, def.h);
    def.paint(new Px(ctx), def.w, def.h);
    for (let f = 0; f < frames; f++) outlineRegion(ctx, f * def.w, 0, def.w, def.h);
    return { img: c, w: def.w, h: def.h };
}
const walk = sheet('daniel');
const sleep = sheet('daniel_sleep');

function drawFrame(canvas: HTMLCanvasElement, s: Sheet, frame: number) {
    if (canvas.width !== s.w) canvas.width = s.w;
    if (canvas.height !== s.h) canvas.height = s.h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, s.w, s.h);
    ctx.drawImage(s.img, frame * s.w, 0, s.w, s.h, 0, 0, s.w, s.h);
}

// ---------- A1: nav highlight and compact nav ----------

function initNav() {
    const nav = $('.nav')!;
    const links = new Map($$<HTMLAnchorElement>('[data-nav]').map((a) => [a.dataset.nav!, a]));
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            links.forEach((a, id) => { a.classList.toggle('active', id === e.target.id); if (id === e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('.sky').forEach((s) => io.observe(s));
    const hero = $('#morning')!;
    const onScroll = () => nav.classList.toggle('compact', window.scrollY > hero.offsetHeight * 0.5);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// ---------- A2: clocks tick up from the previous stamp ----------

function initClocks() {
    const clocks = $$<HTMLTimeElement>('time.clock');
    const fmt = (min: number) => {
        const h = Math.floor(min / 60) % 24, m = min % 60;
        return `${String(((h + 11) % 12) + 1).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
    };
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    clocks.forEach((c) => c.setAttribute('datetime', c.dataset.time!));
    if (rm) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            const el = e.target as HTMLTimeElement;
            const i = clocks.indexOf(el);
            if (i <= 0) return;
            const from = toMin(clocks[i - 1].dataset.time!), to = toMin(el.dataset.time!);
            const t0 = performance.now(), dur = 700;
            const tick = (now: number) => {
                const k = Math.min(1, (now - t0) / dur);
                const eased = 1 - Math.pow(1 - k, 3);
                el.textContent = fmt(Math.round((from + (to - from) * eased) / 5) * 5);
                if (k < 1) requestAnimationFrame(tick); else el.textContent = fmt(to);
            };
            requestAnimationFrame(tick);
        });
    }, { threshold: 1 });
    clocks.forEach((c) => io.observe(c));
}

// ---------- A3: hero headline types out like game dialogue (first load only) ----------

function initTyping() {
    const el = $('.hero-title .type');
    if (!el || rm) return;
    let seen = false;
    try { seen = sessionStorage.getItem('pv-typed') === '1'; sessionStorage.setItem('pv-typed', '1'); } catch { /* ignore */ }
    if (seen) return;
    const chars: HTMLElement[] = [];
    const walkNodes = (n: Node) => {
        [...n.childNodes].forEach((c) => {
            if (c.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                for (const ch of c.textContent ?? '') {
                    const s = document.createElement('span');
                    s.textContent = ch;
                    s.style.opacity = '0';
                    chars.push(s);
                    frag.appendChild(s);
                }
                c.replaceWith(frag);
            } else walkNodes(c);
        });
    };
    walkNodes(el);
    const step = Math.min(55, 850 / chars.length);
    chars.forEach((s, i) => setTimeout(() => { s.style.opacity = ''; }, 120 + i * step));
}

// ---------- A5: HUD portrait sprite (shown on hover, or as the portrait until a headshot exists) ----------

function initHud() {
    // Caffeine and Sleep re-roll on every visit (the static HTML holds the default values)
    $$('.stats li').forEach((li, i) => {
        const s = profile.stats[i];
        if (!s?.random) return;
        const v = rollStat(s);
        const l = $('.stat-l', li), bar = $('.bar', li);
        if (l) l.textContent = `${s.label.toUpperCase()} ${v}/${s.max}`;
        bar?.style.setProperty('--f', (v / s.max).toFixed(3));
    });
    const c = $<HTMLCanvasElement>('.shot-sprite');
    if (!c) return;
    const draw = () => drawFrame(c, walk, DANIEL_FRAMES.down);
    if (walk.img instanceof HTMLImageElement && !walk.img.complete) walk.img.onload = draw; else draw();
    if (rm) return;
    let f = 0;
    setInterval(() => { f = 1 - f; drawFrame(c, walk, DANIEL_FRAMES.down + f); }, 600);
}

// ---------- A6, A8: reveal cards and inventory as they scroll in (never hides what is already visible) ----------

function initReveals() {
    const els = $$('.reveal, .inv');
    const vh = window.innerHeight;
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            e.target.classList.add('in');
            requestAnimationFrame(() => e.target.classList.remove('pre'));
        });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => {
        if (el.getBoundingClientRect().top < vh * 0.92) return; // already on screen: leave it alone
        el.classList.add('pre');
        io.observe(el);
    });
}

// ---------- A7: counters count up ----------

function initCounters() {
    if (rm) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            const el = e.target as HTMLElement;
            const to = Number(el.dataset.count), suffix = el.dataset.suffix ?? '';
            const t0 = performance.now(), dur = 1100;
            const tick = (now: number) => {
                const k = Math.min(1, (now - t0) / dur);
                el.textContent = `${Math.round(to * (1 - Math.pow(1 - k, 3)))}${suffix}`;
                if (k < 1) requestAnimationFrame(tick);
            };
            el.textContent = `0${suffix}`;
            requestAnimationFrame(tick);
        });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach((el) => io.observe(el));
}

// ---------- org tags: one popover at a time ----------

function initOrgs() {
    const all = $$<HTMLDetailsElement>('details.org');
    all.forEach((d) => d.addEventListener('toggle', () => { if (d.open) all.forEach((o) => { if (o !== d) o.open = false; }); }));
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const open = all.find((d) => d.open);
        if (open) { open.open = false; open.querySelector('summary')?.focus(); }
    });
    document.addEventListener('click', (e) => { if (!(e.target as Element).closest('details.org')) all.forEach((d) => { d.open = false; }); });
}

// ---------- rail: Daniel walks down the day as you scroll, asleep by night ----------

function initRail() {
    const rail = $('.rail')!, c = $<HTMLCanvasElement>('.rail-sprite')!, bar = $('.progress span');
    const night = $('#night')!;
    const main = $('main')!;
    let frame = 0, lastY = window.scrollY, idleTimer = 0, asleep = false;
    const render = () => {
        const max = Math.max(1, (main.offsetTop + main.offsetHeight - ($('.details')?.offsetHeight ?? 0)) - window.innerHeight);
        const p = Math.min(1, Math.max(0, window.scrollY / max));
        bar?.style.setProperty('--p', p.toFixed(4));
        const line = rail.clientHeight - 70 - 24 - 44;
        if (!rm) c.style.setProperty('--y', `${Math.round(p * line)}px`);
        const nowAsleep = night.getBoundingClientRect().top < window.innerHeight * 0.45;
        rail.classList.toggle('on-night', night.getBoundingClientRect().top < 70 + p * line + 44);
        if (nowAsleep) {
            if (!asleep || rm) { c.style.width = '60px'; c.style.height = '28px'; }
            drawFrame(c, sleep, rm ? 0 : Math.floor(performance.now() / 900) % 2);
        } else {
            if (asleep) { c.style.width = ''; c.style.height = ''; }
            const moved = Math.abs(window.scrollY - lastY);
            if (!rm && moved > 0) frame = (frame + (moved > 14 ? 1 : 0)) % 4;
            drawFrame(c, walk, rm ? DANIEL_FRAMES.down : (moved > 0 ? DANIEL_FRAMES.down + 2 + frame : DANIEL_FRAMES.down));
        }
        asleep = nowAsleep;
        lastY = window.scrollY;
    };
    let queued = false;
    window.addEventListener('scroll', () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; render(); });
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(render, 140); // settle on the idle pose
    }, { passive: true });
    window.addEventListener('resize', render);
    if (walk.img instanceof HTMLImageElement) walk.img.addEventListener('load', render);
    render();
    if (!rm) setInterval(() => { if (asleep) render(); }, 900);
}

// ---------- inventory: tap flips first on touch, then opens ----------

function initInventory() {
    $$<HTMLAnchorElement>('.inv').forEach((a) => {
        a.addEventListener('pointerdown', (e) => { a.dataset.touch = e.pointerType === 'touch' ? '1' : ''; });
        a.addEventListener('click', (e) => {
            if (a.dataset.touch === '1' && !a.classList.contains('flipped')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                $$('.inv.flipped').forEach((x) => x.classList.remove('flipped'));
                a.classList.add('flipped');
            }
        }, true);
    });
}

// ---------- detail panels ----------

interface StripItem { id: string; group: string; n: string; title: string; label: string }

function initPanels() {
    const data = JSON.parse($('#pv-data')?.textContent ?? '{"items":[]}') as { items: StripItem[] };
    const items = data.items;
    const byId = new Map(items.map((i) => [i.id, i]));
    const root = document.createElement('div');
    root.className = 'pv-root';
    root.hidden = true;
    root.innerHTML = `
        <div class="pv-dim"></div>
        <div class="pv-dialog" role="dialog" aria-modal="true">
            <nav class="pv-strip" aria-label="${C.otherItems}"></nav>
            <div class="pv-panel">
                <div class="pv-grab" aria-hidden="true"></div>
                <button type="button" class="nb pv-close" aria-label="${C.close}">${icon('close')}</button>
                <div class="pv-scroll"></div>
                <nav class="pv-pn" aria-label="${C.prev} and ${C.next.toLowerCase()}">
                    <button type="button" class="nb pv-prev"></button>
                    <button type="button" class="nb pv-next"></button>
                </nav>
            </div>
        </div>`;
    document.body.appendChild(root);
    const dialog = $('.pv-dialog', root)!, panel = $('.pv-panel', root)!, scroll = $('.pv-scroll', root)!;
    const strip = $('.pv-strip', root)!, prevB = $<HTMLButtonElement>('.pv-prev', root)!, nextB = $<HTMLButtonElement>('.pv-next', root)!;
    let current: { id: string; article: HTMLElement; marker: Comment; card: HTMLElement | null; pushed: boolean } | null = null;
    let lightbox: HTMLElement | null = null;
    const mobile = () => window.matchMedia('(max-width: 700px)').matches;

    const siblings = (id: string) => { const g = byId.get(id)?.group; return items.filter((i) => i.group === g); };

    const place = (id: string) => {
        const article = document.getElementById(id);
        if (!article || !article.classList.contains('detail')) return false;
        if (current) { current.marker.replaceWith(current.article); }
        const marker = document.createComment(`detail:${id}`);
        article.replaceWith(marker);
        scroll.replaceChildren(article);
        scroll.scrollTop = 0;
        dialog.setAttribute('aria-labelledby', `${id}-title`);
        initGallery(article);
        const sibs = siblings(id);
        strip.innerHTML = sibs.map((s) => `<button type="button" class="pv-sib" data-go="${s.id}"${s.id === id ? ' aria-current="true"' : ''}>${s.n || s.label ? `<span class="px">${s.n || s.label}</span>` : ''}<span>${s.title}</span></button>`).join('');
        const i = sibs.findIndex((s) => s.id === id);
        const prev = sibs[i - 1], next = sibs[i + 1];
        prevB.hidden = !prev; nextB.hidden = !next;
        prevB.parentElement!.style.justifyContent = prev ? 'space-between' : 'flex-end';
        if (prev) { prevB.innerHTML = `${icon('arrowLeft')}<span>${prev.title}</span>`; prevB.dataset.go = prev.id; prevB.setAttribute('aria-label', `${C.prev}: ${prev.title}`); }
        if (next) { nextB.innerHTML = `<span>${next.title}</span>${icon('arrowRight')}`; nextB.dataset.go = next.id; nextB.setAttribute('aria-label', `${C.next}: ${next.title}`); }
        current = { id, article, marker, card: document.querySelector<HTMLElement>(`[data-item="${id}"]`), pushed: current?.pushed ?? false };
        return true;
    };

    const open = (id: string, opts: { push: boolean; animate: boolean }) => {
        const wasOpen = !!current;
        const card = document.querySelector<HTMLElement>(`[data-item="${id}"]`);
        if (!place(id)) return;
        if (!wasOpen) {
            root.hidden = false;
            root.classList.remove('closing');
            document.documentElement.style.overflow = 'hidden';
            if (opts.animate && !rm) expandFrom(card);
            else if (!rm) panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
            ($('.pv-close', root) as HTMLElement).focus({ preventScroll: true });
        } else if (!rm) {
            scroll.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        }
        if (opts.push) { history.pushState({ pv: id }, '', `#${id}`); current!.pushed = true; }
        else history.replaceState(history.state?.pv ? { pv: id } : null, '', `#${id}`);
        track('panel-open', { id });
    };

    const expandFrom = (card: HTMLElement | null) => {
        const to = panel.getBoundingClientRect();
        if (mobile() || !card) {
            panel.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
            return;
        }
        const from = card.getBoundingClientRect();
        panel.animate([
            { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})` },
            { transform: 'none' }
        ], { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        scroll.animate([{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }], { duration: 360 });
    };

    const close = (opts: { fromPop?: boolean } = {}) => {
        if (!current) return;
        const { card, marker, article, pushed } = current;
        current = null;
        closeLightbox();
        const finish = () => {
            root.hidden = true;
            marker.replaceWith(article);
            document.documentElement.style.overflow = '';
            card?.focus({ preventScroll: true });
        };
        if (!opts.fromPop) {
            if (pushed && history.state?.pv) { ignorePop = true; history.back(); }
            else history.replaceState(null, '', location.pathname + location.search);
        }
        if (rm) { finish(); return; }
        root.classList.add('closing');
        const to = panel.getBoundingClientRect();
        const from = card?.getBoundingClientRect();
        const visible = from && from.bottom > 0 && from.top < window.innerHeight;
        const anim = mobile() || !visible
            ? panel.animate([{ transform: 'none', opacity: 1 }, { transform: mobile() ? 'translateY(100%)' : 'scale(0.96)', opacity: mobile() ? 1 : 0 }], { duration: 240, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' })
            : panel.animate([{ transform: 'none' }, { transform: `translate(${from!.left - to.left}px, ${from!.top - to.top}px) scale(${from!.width / to.width}, ${from!.height / to.height})`, opacity: 0.4 }], { duration: 260, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
        anim.onfinish = finish;
    };

    let ignorePop = false;
    window.addEventListener('popstate', () => {
        if (ignorePop) { ignorePop = false; return; }
        const id = decodeURIComponent(location.hash.slice(1));
        if (byId.has(id)) {
            if (current?.id !== id) open(id, { push: false, animate: !current });
        } else if (current) close({ fromPop: true });
    });

    // cards and links into panels
    document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
        if (!a || root.contains(a)) return;
        const id = a.getAttribute('href')!.slice(1);
        if (!byId.has(id)) return;
        e.preventDefault();
        open(id, { push: true, animate: true });
    });
    root.addEventListener('click', (e) => {
        const t = e.target as Element;
        if (t.classList.contains('pv-dim') || t === dialog) { close(); return; }
        if (t.closest('.pv-close')) { close(); return; }
        const go = t.closest<HTMLElement>('[data-go]');
        if (go) { open(go.dataset.go!, { push: false, animate: false }); (go.classList.contains('pv-sib') ? go : go).focus(); }
        const zoom = t.closest<HTMLButtonElement>('[data-zoom]');
        if (zoom) openLightbox(zoom.dataset.zoom!, zoom.querySelector('img')?.alt ?? '');
    });
    // clicks on the empty area around the strip and panel close too
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

    root.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); if (lightbox) closeLightbox(); else close(); return; }
        if (e.key !== 'Tab') return;
        const f = $$<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), summary', lightbox ?? dialog)
            .filter((el) => el.offsetParent !== null && !el.closest('[hidden]'));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // mobile: swipe down on the sheet to close
    let drag: { y0: number; dy: number; id: number } | null = null;
    panel.addEventListener('pointerdown', (e) => {
        if (!mobile() || e.pointerType === 'mouse') return;
        const onGrab = (e.target as Element).closest('.pv-grab');
        if (!onGrab && scroll.scrollTop > 0) return;
        drag = { y0: e.clientY, dy: 0, id: e.pointerId };
    });
    panel.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        drag.dy = Math.max(0, e.clientY - drag.y0);
        if (drag.dy > 6) panel.style.transform = `translateY(${drag.dy}px)`;
    });
    const endDrag = () => {
        if (!drag) return;
        const dy = drag.dy;
        drag = null;
        if (dy > 110) { panel.style.transform = ''; close(); }
        else if (dy > 6) { panel.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 200, easing: 'ease-out' }); panel.style.transform = ''; }
    };
    panel.addEventListener('pointerup', endDrag);
    panel.addEventListener('pointercancel', endDrag);

    function openLightbox(src: string, alt: string) {
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-label', alt || C.enlarge);
        lightbox.innerHTML = `<img src="${src}" alt="${alt.replace(/"/g, '&quot;')}" /><button type="button" class="nb pv-close" aria-label="${C.close}">${icon('close')}</button>`;
        lightbox.addEventListener('click', () => closeLightbox());
        root.appendChild(lightbox);
        lightbox.querySelector<HTMLElement>('button')!.focus();
    }
    function closeLightbox() { lightbox?.remove(); lightbox = null; }

    // deep link on load
    const initial = decodeURIComponent(location.hash.slice(1));
    if (byId.has(initial)) open(initial, { push: false, animate: false });
}

/** Arrows, dots, keyboard arrows. Swipe is native scroll snapping. */
function initGallery(article: HTMLElement) {
    const gal = $('[data-gal]', article);
    if (!gal || gal.dataset.ready) return;
    gal.dataset.ready = '1';
    const track = $('.gal-track', gal)!;
    const slides = $$('.gal-slide', gal);
    const dots = $$<HTMLButtonElement>('.dot', gal);
    const prev = $<HTMLButtonElement>('.gal-prev', gal), next = $<HTMLButtonElement>('.gal-next', gal);
    const index = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth + 12));
    const go = (i: number) => track.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, i)) * (track.clientWidth + 12), behavior: rm ? 'auto' : 'smooth' });
    const sync = () => {
        const i = index();
        dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
        if (prev) prev.disabled = i <= 0;
        if (next) next.disabled = i >= slides.length - 1;
    };
    prev?.addEventListener('click', () => go(index() - 1));
    next?.addEventListener('click', () => go(index() + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    gal.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(index() + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(index() - 1); }
    });
    sync();
}

function initTracking() {
    $$<HTMLElement>('[data-track]').forEach((a) => a.addEventListener('click', () => track(a.dataset.track!)));
}

initNav();
initClocks();
initTyping();
initHud();
initReveals();
initCounters();
initOrgs();
initRail();
initInventory();
initPanels();
initTracking();
