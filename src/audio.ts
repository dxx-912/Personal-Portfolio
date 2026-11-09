// Tiny synthesized sounds. Muted by default; nothing plays unless the visitor turns sound on.
// Everything here is generated in the browser (no audio files), see public/assets/audio/CREDITS.md.

import { bus, state } from './state';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function ac(force = false): AudioContext | null {
    if (!state.sound && !force) return null;
    try {
        if (!ctx) {
            ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            master = ctx.createGain();
            master.gain.value = 0.9;
            master.connect(ctx.destination);
        }
        if (ctx.state === 'suspended') void ctx.resume();
        return ctx;
    } catch { return null; }
}

function noise(a: AudioContext) {
    if (noiseBuf) return noiseBuf;
    noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
}

function blip(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number, at = 0) {
    const a = ac();
    if (!a || !master) return;
    const t = a.currentTime + at;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
}

function hiss(dur: number, vol: number, filter: BiquadFilterType, freq: number, at = 0, dest?: AudioNode) {
    const a = ac();
    if (!a || !master) return;
    const t = a.currentTime + at;
    const s = a.createBufferSource();
    s.buffer = noise(a);
    const f = a.createBiquadFilter();
    f.type = filter; f.frequency.value = freq;
    const g = a.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(dest ?? master);
    s.start(t, Math.random());
    s.stop(t + dur + 0.02);
}

export type Sfx = 'open' | 'close' | 'tick' | 'found' | 'door' | 'wake' | 'meow' | 'purr' | 'puff' | 'shutter'
    | 'rep' | 'nice' | 'bump' | 'hop';

export function sfx(name: Sfx) {
    switch (name) {
        case 'open': blip(660, 0.08, 'square', 0.05); break;
        case 'close': blip(440, 0.07, 'square', 0.04); break;
        case 'tick': blip(880, 0.03, 'square', 0.03); break;
        case 'found': blip(784, 0.08, 'square', 0.05); blip(1046, 0.12, 'square', 0.05, undefined, 0.08); break;
        case 'door': blip(220, 0.18, 'triangle', 0.08, 110); break;
        case 'wake': blip(392, 0.12, 'triangle', 0.06, 784); break;
        case 'meow': blip(700, 0.12, 'sawtooth', 0.025, 980); blip(980, 0.28, 'sawtooth', 0.025, 560, 0.1); break;
        case 'purr': for (let i = 0; i < 8; i++) blip(48, 0.09, 'sawtooth', 0.04, 40, i * 0.1); break;
        case 'puff': hiss(0.25, 0.08, 'bandpass', 1800); break;
        case 'shutter': hiss(0.05, 0.12, 'highpass', 3000); hiss(0.06, 0.1, 'highpass', 2200, 0.07); break;
        case 'rep': blip(330 + Math.random() * 40, 0.06, 'square', 0.035); break;
        case 'nice': blip(523, 0.09, 'square', 0.05); blip(659, 0.09, 'square', 0.05, undefined, 0.09); blip(784, 0.16, 'square', 0.05, undefined, 0.18); break;
        case 'bump': blip(120, 0.08, 'triangle', 0.08, 80); break;
        case 'hop': blip(300, 0.08, 'square', 0.04, 600); break;
    }
}

/** Soft footstep. Carpet is a muffled thud, wood a brighter tap. */
export function step(surface: 'carpet' | 'wood') {
    if (surface === 'carpet') hiss(0.06, 0.05, 'lowpass', 500);
    else { hiss(0.04, 0.05, 'bandpass', 1400); blip(180, 0.04, 'triangle', 0.025, 140); }
}

// ---------- piano ----------

/** Soft synthesized piano-ish note. Returns false if sound is off. */
export function pianoNote(freq: number) {
    const a = ac();
    if (!a || !master) return false;
    const t = a.currentTime;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    const f = a.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 2400;
    [1, 2, 3].forEach((h, i) => {
        const o = a.createOscillator();
        o.type = i === 0 ? 'triangle' : 'sine';
        o.frequency.value = freq * h;
        const og = a.createGain();
        og.gain.value = [1, 0.35, 0.12][i];
        o.connect(og).connect(f);
        o.start(t); o.stop(t + 1.5);
    });
    f.connect(g).connect(master);
    return true;
}

// ---------- the speaker's EDM loop (original, generated here) ----------

let musicTimer = 0;
let musicOn = false;
let beatCb: ((beat: number) => void) | null = null;

/** Starts the loop. onBeat fires on every quarter note (for the speaker bump). */
export function startMusic(onBeat: (beat: number) => void) {
    const a = ac();
    if (!a || !master || musicOn) return false;
    musicOn = true;
    beatCb = onBeat;
    const bpm = 140, q = 60 / bpm, s16 = q / 4;
    let next = a.currentTime + 0.08, i = 0;
    const out = a.createGain();
    out.gain.value = 0.55;
    out.connect(master);
    const bass = [43.65, 43.65, 51.91, 38.89]; // F1, F1, G#1, D#1
    const tick = () => {
        if (!musicOn || !ctx) return;
        while (next < ctx.currentTime + 0.12) {
            const t = next, bar = Math.floor(i / 16) % 4, pos = i % 16;
            // half time kick and snare
            if (pos === 0 || pos === 10) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22); o.connect(g).connect(out); o.start(t); o.stop(t + 0.25); }
            if (pos === 8) { const sN = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); sN.buffer = noise(ctx); f.type = 'bandpass'; f.frequency.value = 1800; g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); sN.connect(f).connect(g).connect(out); sN.start(t, 0.3); sN.stop(t + 0.2); }
            if (pos % 2 === 1) { const sN = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); sN.buffer = noise(ctx); f.type = 'highpass'; f.frequency.value = 7000; g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04); sN.connect(f).connect(g).connect(out); sN.start(t, 0.7); sN.stop(t + 0.05); }
            // wobble bass, one note per bar
            if (pos === 0) {
                const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
                o.type = 'sawtooth'; o2.type = 'square'; o.frequency.value = bass[bar]; o2.frequency.value = bass[bar] * 1.005;
                f.type = 'lowpass'; f.frequency.value = 500; f.Q.value = 8;
                lfo.frequency.value = bar % 2 ? 6 / (q * 4) * 2 : 4 / (q * 4) * 2; lg.gain.value = 420;
                lfo.connect(lg).connect(f.frequency);
                g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.02); g.gain.setValueAtTime(0.22, t + q * 4 - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + q * 4);
                o.connect(f); o2.connect(f); f.connect(g).connect(out);
                [o, o2, lfo].forEach((n) => { n.start(t); n.stop(t + q * 4 + 0.02); });
            }
            // chord stab on the offbeat of bar 2 and 4
            if ((bar === 1 || bar === 3) && pos === 14) {
                [349.2, 415.3, 523.3].forEach((fr) => { const o = ctx!.createOscillator(), g = ctx!.createGain(); o.type = 'square'; o.frequency.value = fr; g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(g).connect(out); o.start(t); o.stop(t + 0.32); });
            }
            if (pos % 4 === 0) {
                const beat = Math.floor(i / 4);
                const delay = Math.max(0, (t - ctx.currentTime) * 1000);
                window.setTimeout(() => { if (musicOn) beatCb?.(beat); }, delay);
            }
            next += s16; i++;
        }
    };
    musicTimer = window.setInterval(tick, 25);
    tick();
    return true;
}

export function stopMusic() {
    musicOn = false;
    beatCb = null;
    window.clearInterval(musicTimer);
}

export const isMusicOn = () => musicOn;

// ---------- ambience ----------

let ambient: { stop: () => void } | null = null;

/** Quiet room tone: a dorm hum with distant campus noise, or rain at home. */
export function startAmbient(room: 'dorm' | 'home') {
    stopAmbient();
    const a = ac();
    if (!a || !master) return;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(room === 'dorm' ? 0.05 : 0.07, a.currentTime + 1.5);
    g.connect(master);
    const src = a.createBufferSource();
    src.buffer = noise(a); src.loop = true;
    const f = a.createBiquadFilter();
    const nodes: AudioScheduledSourceNode[] = [src];
    if (room === 'dorm') {
        f.type = 'lowpass'; f.frequency.value = 320;
        const hum = a.createOscillator(), hg = a.createGain();
        hum.frequency.value = 60; hg.gain.value = 0.15;
        hum.connect(hg).connect(g); hum.start(); nodes.push(hum);
    } else {
        f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 0.6;
    }
    src.connect(f).connect(g);
    src.start();
    // occasional distant sounds: campus chatter blips in the dorm, a creak at home
    const t = window.setInterval(() => {
        if (!state.sound) return;
        if (room === 'dorm') blip(900 + Math.random() * 400, 0.12, 'sine', 0.006, 700);
        else blip(90, 0.3, 'triangle', 0.012, 70);
    }, 7000);
    ambient = {
        stop: () => {
            window.clearInterval(t);
            try { g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.3); } catch { /* closed */ }
            nodes.forEach((n) => { try { n.stop(a.currentTime + 0.35); } catch { /* already stopped */ } });
        }
    };
}

export function stopAmbient() { ambient?.stop(); ambient = null; }

bus.on('sound', (on) => {
    if (!on) { stopMusic(); stopAmbient(); }
    else startAmbient(state.room);
});
