// Dev only overlay (backquote): measured speed, frame rate, loop delta, focus, and speed modifiers.
// Loaded from main.ts behind import.meta.env.DEV, so it never ships in the production build.

import type Phaser from 'phaser';
import { session } from '../game/session';

interface RoomDebug {
    debugInfo(): {
        x: number; y: number; velocity: number; target: number;
        modifiers: { name: string; mult: number }[]; flags: string[];
    };
}

export function initDebug(game: Phaser.Game) {
    // tests fast-forward the stats clock through this
    (window as unknown as { __session: typeof session }).__session = session;
    const el = document.createElement('pre');
    el.className = 'debug-overlay';
    el.style.cssText = [
        'position:fixed', 'left:12px', 'bottom:12px', 'z-index:9999', 'margin:0', 'padding:8px 10px',
        'font:12px/1.45 ui-monospace,Menlo,monospace', 'color:#d7ffd9', 'background:rgba(0,0,0,0.78)',
        'border:1px solid #3b6', 'border-radius:4px', 'pointer-events:none', 'display:none', 'white-space:pre'
    ].join(';');
    document.body.appendChild(el);

    let on = false;
    // measured speed over a short window of real time, independent of the game clock
    const samples: { t: number; x: number; y: number }[] = [];

    window.addEventListener('keydown', (e) => {
        if (e.code !== 'Backquote' || e.metaKey || e.ctrlKey || e.altKey) return;
        on = !on;
        el.style.display = on ? 'block' : 'none';
    });

    const tick = () => {
        requestAnimationFrame(tick);
        const room = game.scene.getScene('Room') as unknown as RoomDebug | null;
        if (!room || !game.scene.isActive('Room') || !(room as unknown as { player?: unknown }).player) return;
        const info = room.debugInfo();
        const now = performance.now();
        samples.push({ t: now, x: info.x, y: info.y });
        while (samples.length > 2 && now - samples[0].t > 500) samples.shift();
        if (!on) return;
        const a = samples[0];
        const dtS = (now - a.t) / 1000;
        const measured = dtS > 0 ? Math.hypot(info.x - a.x, info.y - a.y) / dtS : 0;
        const loop = game.loop;
        const mods = info.modifiers.length ? info.modifiers.map((m) => `${m.name} x${m.mult}`).join(', ') : 'none';
        el.textContent = [
            `speed    ${measured.toFixed(0)} px/s measured, ${info.velocity.toFixed(0)} body, ${info.target.toFixed(0)} target`,
            `fps      ${loop.actualFps.toFixed(0)}  (raw dt ${loop.rawDelta.toFixed(1)} ms, game dt ${loop.delta.toFixed(1)} ms)`,
            `focus    ${document.hasFocus() ? 'yes' : 'no'}  loop.inFocus ${loop.inFocus}`,
            `mods     ${mods}`,
            `flags    ${info.flags.join(', ') || 'none'}`,
            `stats    caffeine ${session.caffeine}, sleep ${session.sleep} (next drop in ${Math.max(0, (90000 - session.sleepMs) / 1000).toFixed(0)}s), active ${(session.activeMs / 1000).toFixed(0)}s`
        ].join('\n');
    };
    requestAnimationFrame(tick);
}
