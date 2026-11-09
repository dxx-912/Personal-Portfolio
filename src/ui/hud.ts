// HUD: found counter, sound and pause buttons, prompt label, messages, pause menu, touch controls.

import { TOTAL_ITEMS, ui } from '../content';
import { isTouchDevice } from '../config';
import { bus, state } from '../state';
import { clearHeld, onAction, stick, trigger } from './input';
import { esc } from './render';
import { sfx } from '../audio';

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

let promptEl: HTMLElement, msgEl: HTMLElement, toastEl: HTMLElement, counterEl: HTMLElement;
let toastTimer = 0;
let pauseRoot: HTMLElement | null = null;

export function initHud() {
    const root = $('#ui-root');
    root.insertAdjacentHTML('beforeend', `
        <div class="hud-top-right">
            <span class="counter" aria-live="polite" hidden></span>
            <button class="hud-btn sound-btn" aria-pressed="false"></button>
            <button class="hud-btn pause-btn" aria-label="Pause menu" title="Pause (P)">II</button>
        </div>
        <div class="prompt" aria-hidden="true" hidden></div>
        <div class="message" role="status" aria-live="polite" hidden></div>
        <div class="toast" role="status" aria-live="polite" hidden></div>
        <div class="rotate-hint">${esc(ui.rotateHint)}</div>
    `);
    promptEl = $('.prompt');
    msgEl = $('.message');
    toastEl = $('.toast');
    counterEl = $('.counter');
    msgEl.addEventListener('click', () => { if (msgEl.classList.contains('wake')) trigger('interact'); });

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

    bus.on('found', ({ count }) => setFound(count));
    bus.on('modal', () => clearHeld());
    setFound(state.found.size);

    onAction((a) => {
        if (a === 'pause' && !state.modal) openPause();
        else if (a === 'escape' && state.modal === 'pause') closePause();
    });

    if (isTouchDevice()) initTouch(root);
}

export function setFound(n: number) {
    counterEl.textContent = ui.found(n, TOTAL_ITEMS);
}

export function showCounter(show: boolean) { counterEl.hidden = !show; }

/** Center message (wake prompt, controls tip). Pass null to hide. */
export function showMessage(text: string | null, className = '') {
    if (!text) { msgEl.hidden = true; return; }
    msgEl.className = `message ${className}`;
    msgEl.textContent = text;
    msgEl.hidden = false;
}

/** Floating label above the focused object, at page coordinates. */
export function setPrompt(text: string | null, x = 0, y = 0) {
    if (!text) { promptEl.hidden = true; return; }
    if (promptEl.dataset.text !== text) {
        const key = isTouchDevice() ? ui.promptTouch : ui.promptKey;
        promptEl.innerHTML = `<kbd>${esc(key)}</kbd> ${esc(text)}`;
        promptEl.dataset.text = text;
    }
    promptEl.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%)`;
    promptEl.hidden = false;
}

export function toast(text: string, ms = 1800) {
    toastEl.textContent = text;
    toastEl.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toastEl.hidden = true; }, ms);
}

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
                <a class="menu-btn" href="/plain">${esc(ui.plainVersion)}</a>
                <button class="menu-btn danger" data-act="reset">${esc(ui.startOver)}</button>
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
        <button class="act-btn" aria-label="Interact">F</button>
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
    root.querySelector<HTMLElement>('.act-btn')!.addEventListener('click', (e) => {
        (e.currentTarget as HTMLElement).blur();
        if (!state.modal) trigger('interact');
    });
}
