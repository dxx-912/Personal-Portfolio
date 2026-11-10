// Keyboard and virtual joystick state. Our own handler (not Phaser's) so that
// panels and buttons keep normal keyboard behaviour while the game ignores input.

import { state } from '../state';

const held = new Set<string>();
/** act = E (do something), info = F (learn more). */
export type Action = 'act' | 'info' | 'pause' | 'escape' | 'about' | 'hint' | 'konami';
const listeners = new Set<(a: Action) => void>();

const MOVE: Record<string, string> = {
    KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right'
};

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiAt = 0;

/** Joystick vector from touch controls, each axis -1..1. */
export const stick = { x: 0, y: 0 };

/** Time of the last movement input, for idle thoughts. */
export let lastInputAt = performance.now();
/** Time of the last real key, click or tap (never reset by the game itself). Cancels Daniel's walk to bed. */
export let userInputAt = performance.now();

function isFormish(t: EventTarget | null) {
    const el = t as HTMLElement | null;
    if (!el || !el.tagName) return false;
    return ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'IFRAME', 'VIDEO'].includes(el.tagName) || el.isContentEditable;
}

export function initInput() {
    window.addEventListener('pointerdown', () => { userInputAt = performance.now(); }, true);
    window.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        userInputAt = performance.now();
        // Panels and overlays handle their own keys (Esc, Tab, number keys...).
        if (state.modal === 'panel') return;
        if (state.modal === 'pause') {
            if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); emit('escape'); }
            return;
        }
        if (isFormish(e.target) && (e.code === 'Enter' || e.code === 'Space')) return;
        lastInputAt = performance.now();
        trackKonami(e.code);
        const dir = MOVE[e.code];
        if (dir) { held.add(dir); e.preventDefault(); return; }
        if (e.repeat) return;
        switch (e.code) {
            case 'KeyE': case 'Space':
                e.preventDefault(); emit('act'); break;
            case 'KeyF': case 'Enter': case 'NumpadEnter':
                e.preventDefault(); emit('info'); break;
            case 'KeyP':
                e.preventDefault(); emit('pause'); break;
            case 'Escape':
                e.preventDefault(); emit('escape'); break;
            case 'KeyI':
                emit('about'); break;
            case 'KeyH':
                emit('hint'); break;
        }
    });
    window.addEventListener('keyup', (e) => { const d = MOVE[e.code]; if (d) held.delete(d); });
    window.addEventListener('blur', clearHeld);
}

function trackKonami(code: string) {
    if (code === KONAMI[konamiAt]) {
        konamiAt++;
        if (konamiAt === KONAMI.length) { konamiAt = 0; emit('konami'); }
    } else konamiAt = code === KONAMI[0] ? 1 : 0;
}

function emit(a: Action) { listeners.forEach((fn) => fn(a)); }

export function onAction(fn: (a: Action) => void) { listeners.add(fn); return () => listeners.delete(fn); }

/** Fire an action from on-screen buttons. */
export function trigger(a: Action) { lastInputAt = userInputAt = performance.now(); emit(a); }

export function clearHeld() { held.clear(); stick.x = 0; stick.y = 0; }

export function markInput() { lastInputAt = performance.now(); }

/** Movement vector from keys or joystick, normalized to length <= 1. */
export function moveVector(): { x: number; y: number } {
    let x = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0) + stick.x;
    let y = (held.has('down') ? 1 : 0) - (held.has('up') ? 1 : 0) + stick.y;
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    if (len < 0.2) return { x: 0, y: 0 };
    return { x, y };
}
