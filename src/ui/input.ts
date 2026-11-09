// Keyboard and virtual joystick state. Our own handler (not Phaser's) so that
// panels and buttons keep normal keyboard behaviour while the game ignores input.

import { state } from '../state';

const held = new Set<string>();
type Action = 'interact' | 'pause' | 'hint' | 'escape';
const listeners = new Set<(a: Action) => void>();

const MOVE: Record<string, string> = {
    KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right'
};

/** Joystick vector from touch controls, each axis -1..1. */
export const stick = { x: 0, y: 0 };

function isFormish(t: EventTarget | null) {
    const el = t as HTMLElement | null;
    if (!el || !el.tagName) return false;
    return ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'IFRAME', 'VIDEO'].includes(el.tagName) || el.isContentEditable;
}

export function initInput() {
    window.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        // Pause / escape work when no panel is open (panels handle their own Esc).
        if (state.modal === 'panel') return;
        if (state.modal === 'pause') {
            if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); emit('escape'); }
            return;
        }
        if (isFormish(e.target) && (e.code === 'Enter' || e.code === 'Space')) return;
        const dir = MOVE[e.code];
        if (dir) { held.add(dir); e.preventDefault(); return; }
        if (e.repeat) return;
        switch (e.code) {
            case 'KeyF': case 'KeyE': case 'Space': case 'Enter': case 'NumpadEnter':
                e.preventDefault(); emit('interact'); break;
            case 'KeyP': case 'Escape':
                e.preventDefault(); emit('pause'); break;
            case 'KeyH':
                emit('hint'); break;
        }
    });
    window.addEventListener('keyup', (e) => { const d = MOVE[e.code]; if (d) held.delete(d); });
    window.addEventListener('blur', clearHeld);
}

function emit(a: Action) { listeners.forEach((fn) => fn(a)); }

export function onAction(fn: (a: Action) => void) { listeners.add(fn); return () => listeners.delete(fn); }

/** Fire an action from on-screen buttons. */
export function trigger(a: Action) { emit(a); }

export function clearHeld() { held.clear(); stick.x = 0; stick.y = 0; }

/** Movement vector from keys or joystick, normalized to length <= 1. */
export function moveVector(): { x: number; y: number } {
    let x = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0) + stick.x;
    let y = (held.has('down') ? 1 : 0) - (held.has('up') ? 1 : 0) + stick.y;
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    if (len < 0.2) return { x: 0, y: 0 };
    return { x, y };
}
