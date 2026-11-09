// Tiny synthesized sounds. Muted by default; nothing plays unless the visitor turns sound on.

import { state } from './state';

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
    if (!state.sound) return null;
    try {
        ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        if (ctx.state === 'suspended') void ctx.resume();
        return ctx;
    } catch { return null; }
}

function blip(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
    const a = ac();
    if (!a) return;
    const t = a.currentTime;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
}

export type Sfx = 'open' | 'close' | 'tick' | 'found' | 'door' | 'wake' | 'meow';

export function sfx(name: Sfx) {
    switch (name) {
        case 'open': blip(660, 0.08, 'square', 0.05); break;
        case 'close': blip(440, 0.07, 'square', 0.04); break;
        case 'tick': blip(880, 0.03, 'square', 0.03); break;
        case 'found': blip(784, 0.08, 'square', 0.05); setTimeout(() => blip(1046, 0.12, 'square', 0.05), 80); break;
        case 'door': blip(220, 0.18, 'triangle', 0.08, 110); break;
        case 'wake': blip(392, 0.12, 'triangle', 0.06, 784); break;
        case 'meow': blip(900, 0.25, 'sawtooth', 0.03, 520); break;
    }
}
