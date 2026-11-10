// HUD: About me portrait, minimap, found counter, sound and pause, prompts, bubbles, title cards,
// messages, pause menu, touch controls. All plain HTML over the canvas.

import { TOTAL_ITEMS, ABOUT_KEY, profile, ui, type RoomKey } from '../content';
import { isTouchDevice, prefersReducedMotion } from '../config';
import { bus, state } from '../state';
import { clearHeld, onAction, stick, trigger } from './input';
import { esc } from './render';
import { nowPlaying, sfx } from '../audio';

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

let promptEl: HTMLElement, msgEl: HTMLElement, toastEl: HTMLElement, counterEl: HTMLElement, titleEl: HTMLElement;
let portraitBtn: HTMLButtonElement, minimapEl: HTMLElement;
let toastTimer = 0, titleTimer = 0;
let pauseRoot: HTMLElement | null = null;
let actBtn: HTMLButtonElement | null = null, infoBtn: HTMLButtonElement | null = null;

export function initHud() {
    const root = $('#ui-root');
    root.insertAdjacentHTML('beforeend', `
        <div class="hud-top-left">
            <button class="portrait" hidden aria-label="${esc(ui.aboutButton)}" title="${esc(ui.aboutButton)}">
                <canvas class="face" width="16" height="13" aria-hidden="true"></canvas>
                <span class="stats">${profile.stats.map((s) => `
                    <span class="stat" data-stat="${esc(s.label)}" style="--c: ${esc(s.color)}; --f: ${Math.max(0, Math.min(1, s.value / s.max))}">
                        <span class="bar"></span><span class="txt">${esc(s.label)} ${s.value}/${s.max}</span>
                    </span>`).join('')}
                </span>
            </button>
        </div>
        <div class="hud-top-right">
            <div class="hud-row">
                <span class="counter" aria-live="polite" hidden></span>
                <button class="hud-btn sound-btn" aria-pressed="false"></button>
                <button class="hud-btn pause-btn" aria-label="Pause menu" title="Pause (P)">II</button>
            </div>
            <nav class="minimap" hidden aria-label="Map">
                <button class="mm-room" data-room="dorm"><span>UCLA</span></button>
                <span class="mm-door" aria-hidden="true"></span>
                <button class="mm-room" data-room="home"><span>Home</span></button>
            </nav>
        </div>
        <div class="title-card" aria-live="polite" hidden></div>
        <div class="prompt" hidden></div>
        <div class="message" role="status" aria-live="polite" hidden></div>
        <div class="toast" role="status" aria-live="polite" hidden></div>
        <div class="rotate-hint">${esc(ui.rotateHint)}</div>
    `);
    // The plain version link lives in index.html (works without JS). Tuck it under the portrait.
    // The quick view link sits top middle on its own; it steps aside while a room title card shows.
    const plain = document.querySelector<HTMLAnchorElement>('.plain-link');
    if (plain) {
        plain.textContent = ui.quickView;
        plain.href = ui.quickViewHref;
    }

    promptEl = $('.prompt');
    msgEl = $('.message');
    toastEl = $('.toast');
    counterEl = $('.counter');
    titleEl = $('.title-card');
    portraitBtn = $<HTMLButtonElement>('.portrait');
    minimapEl = $('.minimap');
    msgEl.addEventListener('click', () => { if (msgEl.classList.contains('wake')) trigger('act'); });

    promptEl.addEventListener('click', (e) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-a]');
        if (!b) return;
        e.stopPropagation();
        trigger(b.dataset.a as 'act' | 'info');
    });

    portraitBtn.addEventListener('click', () => { portraitBtn.blur(); trigger('about'); });
    minimapEl.addEventListener('click', (e) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.mm-room');
        if (!b) return;
        b.blur();
        if (b.dataset.room !== state.room) bus.emit('travel', undefined);
    });

    const soundBtn = $<HTMLButtonElement>('.sound-btn');
    const renderSound = () => {
        soundBtn.textContent = state.sound ? '♪ on' : '♪ off';
        soundBtn.setAttribute('aria-pressed', String(state.sound));
        soundBtn.setAttribute('aria-label', state.sound ? ui.soundOn : ui.soundOff);
        soundBtn.title = state.sound ? ui.soundOn : ui.soundOff;
    };
    renderSound();
    soundBtn.addEventListener('click', () => { state.setSound(!state.sound); sfx('tick'); soundBtn.blur(); });
    bus.on('sound', renderSound);

    $('.pause-btn').addEventListener('click', (e) => { (e.currentTarget as HTMLElement).blur(); openPause(); });

    bus.on('found', ({ count }) => { setFound(count); renderPortraitSeen(); });
    bus.on('modal', () => clearHeld());
    bus.on('room', renderMinimap);
    bus.on('awake', (a) => {
        [portraitBtn, minimapEl, counterEl].forEach((el) => { el.hidden = false; el.classList.toggle('is-off', !a); });
        if (a) renderPortraitSeen();
    });
    setFound(state.found.size);

    onAction((a) => {
        if (a === 'pause' && !state.modal) openPause();
        else if (a === 'escape' && state.modal === 'pause') closePause();
        else if (a === 'escape' && !state.modal && state.mode === 'free') openPause();
    });

    if (isTouchDevice()) initTouch(root);
}

export function setFound(n: number) {
    counterEl.innerHTML = `<span class="c-l">${esc(ui.foundLabel)}</span><span class="c-n">${n}/${TOTAL_ITEMS}</span>`;
    counterEl.setAttribute('aria-label', ui.found(n, TOTAL_ITEMS));
    counterEl.title = ui.found(n, TOTAL_ITEMS);
}

function renderPortraitSeen() {
    portraitBtn.classList.toggle('unseen', !state.found.has(ABOUT_KEY));
}

function renderMinimap(room: RoomKey) {
    minimapEl.querySelectorAll<HTMLElement>('.mm-room').forEach((b) => {
        const here = b.dataset.room === room;
        b.classList.toggle('here', here);
        b.setAttribute('aria-current', here ? 'location' : 'false');
        b.setAttribute('aria-label', here ? `${ui.roomTitles[b.dataset.room as RoomKey]} (you are here)` : `Go to ${ui.roomTitles[b.dataset.room as RoomKey]}`);
    });
}

/** Paints the HUD portrait from the character texture (its head), so final art shows up automatically. */
export function setPortrait(src: CanvasImageSource, sx: number, sy: number, sw: number, sh: number) {
    const c = portraitBtn.querySelector<HTMLCanvasElement>('canvas')!;
    c.width = sw; c.height = sh;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, sw, sh);
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
}

/** Once, on cramped screens: suggest the quick view, with both options. */
export function maybeSuggestQuickView() {
    const cramped = Math.min(window.innerWidth, window.innerHeight) < 500 || window.innerWidth < 700;
    if (!cramped) return;
    try {
        if (localStorage.getItem('dx-quickview-suggested')) return;
        localStorage.setItem('dx-quickview-suggested', '1');
    } catch { /* storage blocked: still show it once this visit */ }
    const el = document.createElement('div');
    el.className = 'suggest';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', ui.phoneSuggest);
    el.innerHTML = `<p>${esc(ui.phoneSuggest)}</p>
        <p class="suggest-btns"><a class="menu-btn" href="${esc(ui.quickViewHref)}">${esc(ui.phoneSuggestGo)}</a>
        <button type="button" class="menu-btn">${esc(ui.phoneSuggestStay)}</button></p>`;
    el.querySelector('button')!.addEventListener('click', () => el.remove());
    $('#ui-root').appendChild(el);
}

/** Room name banner that fades in and out. */
export function showTitle(text: string) {
    window.clearTimeout(titleTimer);
    titleEl.textContent = text;
    titleEl.hidden = false;
    titleEl.classList.remove('show');
    void titleEl.offsetWidth;
    titleEl.classList.add('show');
    document.body.classList.add('title-on');
    titleTimer = window.setTimeout(() => {
        titleEl.hidden = true;
        titleEl.classList.remove('show');
        document.body.classList.remove('title-on');
    }, prefersReducedMotion() ? 2200 : 3000);
}

/** Center message (wake prompt, controls tip). Pass null to hide. */
export function showMessage(text: string | null, className = '') {
    if (!text) { msgEl.hidden = true; return; }
    msgEl.className = `message ${className}`;
    msgEl.textContent = text;
    msgEl.hidden = false;
}

export interface PromptSpec {
    /** E verb, e.g. "Pet". */
    act?: string;
    /** F label, e.g. "About him". */
    info?: string;
    /** Door label: walking in (or clicking) goes through. */
    door?: string;
}

/** Floating key-cap prompt above the focused object, at page coordinates. Each chip is also a button. */
export function setPrompt(spec: PromptSpec | null, x = 0, y = 0) {
    setActionButtons(spec);
    if (!spec || (!spec.act && !spec.info && !spec.door)) { promptEl.hidden = true; return; }
    const key = `${spec.act ?? ''}|${spec.info ?? ''}|${spec.door ?? ''}`;
    if (promptEl.dataset.key !== key) {
        const touch = isTouchDevice();
        const chip = (a: 'act' | 'info', k: string, label: string) =>
            `<button type="button" class="chip chip-${a}" data-a="${a}" tabindex="-1">${touch ? '' : `<kbd>${esc(k)}</kbd>`}<span>${esc(label)}</span></button>`;
        promptEl.innerHTML = spec.door
            ? `<button type="button" class="chip chip-door" data-a="act" tabindex="-1"><span>${esc(spec.door)}</span></button>`
            : [
            spec.act ? chip('act', ui.keyAct, spec.act) : '',
            spec.info ? chip('info', ui.keyInfo, spec.info) : ''
        ].join('');
        promptEl.dataset.key = key;
    }
    // keep it on screen and never under the HUD corners
    const w = promptEl.offsetWidth || 120, ph = promptEl.offsetHeight || 34;
    const cx = Math.max(w / 2 + 8, Math.min(window.innerWidth - w / 2 - 8, x));
    let minY = ph + 8;
    document.querySelectorAll<HTMLElement>('.hud-top-left, .hud-top-right').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (cx + w / 2 > r.left && cx - w / 2 < r.right) minY = Math.max(minY, r.bottom + ph + 6);
    });
    const cy = Math.max(minY, Math.min(window.innerHeight - 8, y));
    promptEl.style.transform = `translate(${Math.round(cx)}px, ${Math.round(cy)}px) translate(-50%, -100%)`;
    promptEl.hidden = false;
}

export function toast(text: string, ms = 1800, button?: { label: string; onClick: () => void }) {
    toastEl.innerHTML = `<span>${esc(text)}</span>${button ? ` <button type="button" class="toast-btn">${esc(button.label)}</button>` : ''}`;
    toastEl.classList.toggle('has-btn', !!button);
    if (button) toastEl.querySelector('button')!.addEventListener('click', (e) => {
        (e.currentTarget as HTMLElement).blur();
        toastEl.hidden = true;
        button.onClick();
    });
    toastEl.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toastEl.hidden = true; }, ms);
}

// ---------- speech and thought bubbles (follow a world point; the scene repositions them) ----------

const bubbles = new Map<string, HTMLElement>();

export function showBubble(id: string, text: string, kind: 'speech' | 'thought' | 'small' | 'need' = 'speech') {
    let el = bubbles.get(id);
    if (!el) {
        el = document.createElement('div');
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        $('#ui-root').appendChild(el);
        bubbles.set(id, el);
    }
    el.className = `bubble bubble-${kind}`;
    el.textContent = text;
    el.hidden = false;
    return el;
}

export function moveBubble(id: string, x: number, y: number) {
    const el = bubbles.get(id);
    if (!el || el.hidden) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    const cx = Math.max(w / 2 + 6, Math.min(window.innerWidth - w / 2 - 6, x));
    // never cover the key prompt: if they would overlap, sit just above it
    if (id !== 'cat' && promptEl && !promptEl.hidden) {
        const r = promptEl.getBoundingClientRect();
        const overlap = cx - w / 2 < r.right && cx + w / 2 > r.left && y - h < r.bottom && y > r.top;
        if (overlap) y = r.top - 6;
    }
    el.style.transform = `translate(${Math.round(cx)}px, ${Math.round(y)}px) translate(-50%, -100%)`;
}

export function hideBubble(id: string) {
    const el = bubbles.get(id);
    if (el) el.hidden = true;
}

export const bubbleVisible = (id: string) => !!bubbles.get(id) && !bubbles.get(id)!.hidden;

// ---------- pause menu ----------

function openPause() {
    if (state.modal) return;
    pauseRoot = document.createElement('div');
    pauseRoot.className = 'panel-backdrop open';
    pauseRoot.innerHTML = `
        <section class="panel pause" role="dialog" aria-modal="true" aria-labelledby="pause-title">
            <header class="panel-head"><h2 id="pause-title">${esc(ui.pauseTitle)}</h2></header>
            <div class="panel-body pause-body">
                <button class="menu-btn" data-act="resume">${esc(ui.resume)}</button>
                <button class="menu-btn" data-act="sound">${esc(state.sound ? ui.soundOn : ui.soundOff)}</button>
                <a class="menu-btn" href="${esc(ui.quickViewHref)}">${esc(ui.quickView)}</a>
                <button class="menu-btn danger" data-act="reset">${esc(ui.startOver)}</button>
                ${nowPlaying() ? `<p class="now-playing">♪ ${esc(ui.nowPlaying(nowPlaying()!))}</p>` : ''}
                <p class="pause-hint">${esc(ui.hint)}</p>
            </div>
        </section>`;
    $('#ui-root').appendChild(pauseRoot);
    state.setModal('pause');
    pauseRoot.addEventListener('pointerdown', (e) => { if (e.target === pauseRoot) closePause(); });
    pauseRoot.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePause(); }
        if (e.key === 'Tab') {
            const f = [...pauseRoot!.querySelectorAll<HTMLElement>('.menu-btn')];
            const i = f.indexOf(document.activeElement as HTMLElement);
            if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
            else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        }
    });
    pauseRoot.querySelectorAll<HTMLButtonElement>('button[data-act]').forEach((b) => b.addEventListener('click', () => {
        const act = b.dataset.act;
        if (act === 'resume') closePause();
        if (act === 'sound') { state.setSound(!state.sound); b.textContent = state.sound ? ui.soundOn : ui.soundOff; sfx('tick'); }
        if (act === 'reset') { state.reset(); window.location.reload(); }
    }));
    pauseRoot.querySelector<HTMLElement>('.menu-btn')!.focus();
    sfx('open');
}

function closePause() {
    if (!pauseRoot) return;
    pauseRoot.remove();
    pauseRoot = null;
    state.setModal(null);
    document.querySelector<HTMLElement>('#game canvas')?.focus({ preventScroll: true });
}

// ---------- touch controls ----------

function initTouch(root: HTMLElement) {
    document.body.classList.add('touch');
    root.insertAdjacentHTML('beforeend', `
        <div class="joystick" aria-hidden="true"><div class="knob"></div></div>
        <div class="act-btns">
            <button class="act-btn act-e" data-a="act" disabled>${esc(ui.actButton)}</button>
            <button class="act-btn act-f" data-a="info" disabled>${esc(ui.infoButton)}</button>
        </div>
    `);
    const base = root.querySelector<HTMLElement>('.joystick')!;
    const knob = base.querySelector<HTMLElement>('.knob')!;
    let id: number | null = null;
    const R = 44;
    const move = (e: PointerEvent) => {
        const r = base.getBoundingClientRect();
        let dx = e.clientX - (r.left + r.width / 2);
        let dy = e.clientY - (r.top + r.height / 2);
        const len = Math.hypot(dx, dy);
        if (len > R) { dx = (dx / len) * R; dy = (dy / len) * R; }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        stick.x = dx / R; stick.y = dy / R;
    };
    const end = () => { id = null; stick.x = 0; stick.y = 0; knob.style.transform = ''; };
    base.addEventListener('pointerdown', (e) => {
        if (state.modal) return;
        id = e.pointerId; base.setPointerCapture(id); move(e); e.preventDefault();
    });
    base.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e); });
    base.addEventListener('pointerup', end);
    base.addEventListener('pointercancel', end);
    actBtn = root.querySelector<HTMLButtonElement>('.act-e');
    infoBtn = root.querySelector<HTMLButtonElement>('.act-f');
    [actBtn, infoBtn].forEach((b) => b!.addEventListener('click', (e) => {
        (e.currentTarget as HTMLElement).blur();
        if (!state.modal) trigger(b!.dataset.a as 'act' | 'info');
    }));
}

/** Labels the two mobile buttons with the current verbs; dims them when not applicable. */
export function setActionButtons(spec: PromptSpec | null) {
    if (!actBtn || !infoBtn) return;
    const a = spec?.act ?? spec?.door, f = spec?.info;
    if (actBtn.textContent !== (a ?? ui.actButton)) actBtn.textContent = a ?? ui.actButton;
    actBtn.disabled = !a;
    infoBtn.disabled = !f;
    infoBtn.setAttribute('aria-label', f ? `${ui.infoButton}: ${f}` : ui.infoButton);
}

/** During sleep, the act button wakes up. */
export function setWakeButton(on: boolean) {
    if (!actBtn) return;
    actBtn.disabled = !on;
    if (on) actBtn.textContent = ui.wakeTouch.split(' ')[0];
}

/** Show a HUD stat value. Going up flashes the bar (Red Bull, a nap); going down just slides it. */
export function setStat(label: string, value: number) {
    const s = profile.stats.find((x) => x.label === label);
    const el = document.querySelector<HTMLElement>(`.portrait .stat[data-stat="${label}"]`);
    if (!s || !el) return;
    const prev = Number(el.dataset.v ?? s.value);
    el.dataset.v = String(value);
    el.style.setProperty('--f', String(Math.max(0, Math.min(1, value / s.max))));
    const txt = el.querySelector('.txt');
    if (txt) txt.textContent = `${s.label} ${value}/${s.max}`;
    el.classList.toggle('low', label === 'Sleep' && value <= 2);
    if (value > prev) { el.classList.remove('refill'); void el.offsetWidth; el.classList.add('refill'); }
}
