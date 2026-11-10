// Game audio. Muted by default; nothing plays unless the visitor turns sound on.
// Short sounds are synthesized in the browser; music comes from public/assets/audio/ (see CREDITS.md).

import audioFiles from 'virtual:audio-files';
import { music } from './content/music';
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

export type Sfx = 'can' | 'gulp' | 'open' | 'close' | 'tick' | 'found' | 'door' | 'wake' | 'meow' | 'purr' | 'puff' | 'shutter'
    | 'rep' | 'nice' | 'bump' | 'hop' | 'chomp' | 'swish' | 'clank' | 'bounce' | 'board';

export function sfx(name: Sfx) {
    switch (name) {
        case 'open': blip(660, 0.08, 'square', 0.05); break;
        case 'close': blip(440, 0.07, 'square', 0.04); break;
        case 'tick': blip(880, 0.03, 'square', 0.03); break;
        case 'found': blip(784, 0.08, 'square', 0.05); blip(1046, 0.12, 'square', 0.05, undefined, 0.08); break;
        case 'door': blip(220, 0.18, 'triangle', 0.08, 110); break;
        case 'wake': blip(392, 0.12, 'triangle', 0.06, 784); break;
        case 'meow': blip(700, 0.12, 'sawtooth', 0.025, 980); blip(980, 0.28, 'sawtooth', 0.025, 560, 0.1); break;
        case 'purr': purr(2.6); break;
        case 'chomp': hiss(0.07, 0.06, 'bandpass', 900); blip(140, 0.05, 'triangle', 0.03, 110); break;
        case 'puff': hiss(0.25, 0.08, 'bandpass', 1800); break;
        case 'shutter': hiss(0.05, 0.12, 'highpass', 3000); hiss(0.06, 0.1, 'highpass', 2200, 0.07); break;
        case 'rep': blip(330 + Math.random() * 40, 0.06, 'square', 0.035); break;
        case 'nice': blip(523, 0.09, 'square', 0.05); blip(659, 0.09, 'square', 0.05, undefined, 0.09); blip(784, 0.16, 'square', 0.05, undefined, 0.18); break;
        case 'bump': blip(120, 0.08, 'triangle', 0.08, 80); break;
        case 'hop': blip(300, 0.08, 'square', 0.04, 600); break;
        case 'can': blip(1400, 0.02, 'square', 0.03, 900); hiss(0.35, 0.07, 'highpass', 2600, 0.03); break;
        case 'gulp': blip(170, 0.09, 'sine', 0.07, 110); break;
        case 'swish': hiss(0.22, 0.09, 'bandpass', 2400); hiss(0.18, 0.06, 'bandpass', 1500, 0.06); break;
        case 'clank': blip(1240, 0.06, 'square', 0.03, 1180); blip(1860, 0.09, 'triangle', 0.035, undefined, 0.01); break;
        case 'bounce': blip(150, 0.07, 'sine', 0.09, 95); break;
        case 'board': blip(230, 0.06, 'triangle', 0.07, 170); hiss(0.04, 0.04, 'lowpass', 900); break;
    }
}

/** A soft purr loop: a low rumble pulsing about 25 times a second. */
function purr(seconds: number) {
    const a = ac();
    if (!a || !master) return;
    const t = a.currentTime;
    const o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
    o.type = 'sawtooth'; o.frequency.value = 46;
    f.type = 'lowpass'; f.frequency.value = 280;
    lfo.frequency.value = 24; lg.gain.value = 0.025;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.03, t + 0.3);
    g.gain.setValueAtTime(0.03, t + seconds - 0.5);
    g.gain.linearRampToValueAtTime(0.0001, t + seconds);
    lfo.connect(lg).connect(g.gain);
    o.connect(f).connect(g).connect(master);
    [o, lfo].forEach((n) => { n.start(t); n.stop(t + seconds + 0.05); });
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

// ---------- music files: background lofi and the speaker's featured track ----------
// Played through <audio> elements routed into Web Audio, so volume and ducking also work on iOS.

const trackName = (url: string) => decodeURIComponent(url.split('/').pop() ?? '').replace(/\.[a-z0-9]+$/i, '');

interface Track { el: HTMLAudioElement; gain: GainNode; url: string }

function makeTrack(a: AudioContext, url: string, dest: AudioNode): Track {
    const el = new Audio();
    el.preload = 'auto';
    el.src = url;
    const gain = a.createGain();
    gain.gain.value = 0;
    a.createMediaElementSource(el).connect(gain).connect(dest);
    return { el, gain, url };
}

let lofiBus: GainNode | null = null;
let lofi: Track | null = null;
let lofiQueue: string[] = [];
let lofiLast = '';
let lofiFading = false;
const ducks = new Set<string>();

function lofiTarget() { return music.lofiVolume * (ducks.size ? music.duckTo : 1); }

function nextLofiUrl(): string | null {
    const all = audioFiles.lofi.map((f) => `/assets/audio/lofi/${encodeURIComponent(f)}`);
    if (!all.length) return null;
    if (!lofiQueue.length) {
        lofiQueue = [...all].sort(() => Math.random() - 0.5);
        if (lofiQueue.length > 1 && lofiQueue[0] === lofiLast) lofiQueue.push(lofiQueue.shift()!);
    }
    lofiLast = lofiQueue.shift()!;
    return lofiLast;
}

/** Starts (or resumes) the shuffled lofi. Safe to call often; browsers may need a click first. */
export function startLofi() {
    const a = ac();
    if (!a || !master) return;
    if (!lofiBus) { lofiBus = a.createGain(); lofiBus.gain.value = lofiTarget(); lofiBus.connect(master); }
    if (lofi) { void lofi.el.play().catch(() => undefined); return; }
    const url = nextLofiUrl();
    if (!url) return;
    playLofi(url, true);
}

function playLofi(url: string, first: boolean) {
    const a = ctx!;
    const t = makeTrack(a, url, lofiBus!);
    const single = audioFiles.lofi.length === 1;
    t.el.addEventListener('loadedmetadata', () => {
        // long mixes start somewhere random so every visit sounds different
        if ((first || single) && t.el.duration > 600) t.el.currentTime = Math.random() * (t.el.duration - 300);
    }, { once: true });
    t.el.addEventListener('timeupdate', () => {
        if (lofi !== t || lofiFading || !t.el.duration) return;
        if (t.el.duration - t.el.currentTime < music.crossfade) crossfadeLofi();
    });
    t.el.addEventListener('ended', () => { if (lofi === t) crossfadeLofi(); });
    const now = a.currentTime;
    t.gain.gain.setValueAtTime(0, now);
    t.gain.gain.linearRampToValueAtTime(1, now + (first ? 2 : music.crossfade));
    void t.el.play().catch(() => undefined);
    lofi = t;
    bus.emit('track', trackName(url));
}

function crossfadeLofi() {
    if (!ctx || !lofi) return;
    lofiFading = true;
    const old = lofi;
    const now = ctx.currentTime;
    old.gain.gain.cancelScheduledValues(now);
    old.gain.gain.setValueAtTime(old.gain.gain.value, now);
    old.gain.gain.linearRampToValueAtTime(0, now + music.crossfade);
    window.setTimeout(() => { old.el.pause(); old.el.removeAttribute('src'); old.el.load(); }, music.crossfade * 1000 + 200);
    const url = nextLofiUrl();
    if (url) playLofi(url, false);
    lofiFading = false;
}

export function pauseLofi() { lofi?.el.pause(); }

/** Current lofi track title, for the pause menu. */
export const nowPlaying = () => (lofi && state.sound ? trackName(lofi.url) : null);

/** Lofi drops to near silence while any source is active (speaker, piano, video). */
export function duck(source: string, on: boolean) {
    if (on) ducks.add(source); else ducks.delete(source);
    if (!ctx || !lofiBus) return;
    const now = ctx.currentTime;
    lofiBus.gain.cancelScheduledValues(now);
    lofiBus.gain.setValueAtTime(lofiBus.gain.value, now);
    lofiBus.gain.linearRampToValueAtTime(lofiTarget(), now + (on ? 0.6 : 2.5));
}

// featured track (the speaker)
let featured: Track | null = null;
let analyser: AnalyserNode | null = null;
let levels: Uint8Array | null = null;
let onFeaturedEnd: (() => void) | null = null;

export const hasFeatured = () => audioFiles.featured.length > 0;
export const isFeaturedOn = () => !!featured && !featured.el.paused;

/** Plays the speaker's track. Returns false if sound is off or there is no file. */
export function playFeatured(onEnd: () => void): boolean {
    const a = ac();
    if (!a || !master || !hasFeatured()) return false;
    stopFeatured();
    analyser ??= a.createAnalyser();
    analyser.fftSize = 512;
    analyser.connect(master);
    levels = new Uint8Array(analyser.frequencyBinCount);
    const url = `/assets/audio/featured/${encodeURIComponent(audioFiles.featured[0])}`;
    const t = makeTrack(a, url, analyser);
    t.el.addEventListener('loadedmetadata', () => {
        if (t.el.duration > music.featuredStart + 10) t.el.currentTime = music.featuredStart;
    }, { once: true });
    t.el.addEventListener('ended', () => { stopFeatured(); onEnd(); });
    t.gain.gain.setValueAtTime(0, a.currentTime);
    t.gain.gain.linearRampToValueAtTime(music.featuredVolume, a.currentTime + 1.2);
    void t.el.play().catch(() => undefined);
    featured = t;
    onFeaturedEnd = onEnd;
    duck('speaker', true);
    return true;
}

export function stopFeatured() {
    if (!featured) return;
    const t = featured;
    featured = null;
    if (ctx) {
        const now = ctx.currentTime;
        t.gain.gain.cancelScheduledValues(now);
        t.gain.gain.setValueAtTime(t.gain.gain.value, now);
        t.gain.gain.linearRampToValueAtTime(0, now + 0.6);
    }
    window.setTimeout(() => { t.el.pause(); t.el.removeAttribute('src'); t.el.load(); }, 700);
    duck('speaker', false);
    const cb = onFeaturedEnd; onFeaturedEnd = null;
    void cb;
}

/** Loudness of the featured track right now, 0..1 (drives the speaker bump). */
export function featuredLevel(): number {
    if (!analyser || !levels || !featured) return 0;
    analyser.getByteFrequencyData(levels as Uint8Array<ArrayBuffer>);
    let sum = 0;
    const n = Math.min(24, levels.length); // low end: the bass and the orchestra's weight
    for (let i = 1; i < n; i++) sum += levels[i];
    return Math.min(1, sum / (n - 1) / 200);
}

// ---------- ambience ----------

let ambient: { stop: () => void } | null = null;

/** Quiet room tone: a soft hum and distant campus blips in the dorm. Home has none (no white noise). */
export function startAmbient(room: 'dorm' | 'home') {
    stopAmbient();
    const a = ac();
    if (!a || !master || room !== 'dorm') return;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.035, a.currentTime + 1.5);
    g.connect(master);
    const src = a.createBufferSource();
    src.buffer = noise(a); src.loop = true;
    const f = a.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 260;
    const hum = a.createOscillator(), hg = a.createGain();
    hum.frequency.value = 60; hg.gain.value = 0.15;
    hum.connect(hg).connect(g); hum.start();
    src.connect(f).connect(g);
    src.start();
    const nodes: AudioScheduledSourceNode[] = [src, hum];
    const t = window.setInterval(() => { if (state.sound) blip(900 + Math.random() * 400, 0.12, 'sine', 0.006, 700); }, 7000);
    ambient = {
        stop: () => {
            window.clearInterval(t);
            try { g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.3); } catch { /* closed */ }
            nodes.forEach((n) => { try { n.stop(a.currentTime + 0.35); } catch { /* already stopped */ } });
        }
    };
}

export function stopAmbient() { ambient?.stop(); ambient = null; }

if (import.meta.env.DEV) {
    (window as unknown as { __audio: unknown }).__audio = {
        nowPlaying, isFeaturedOn, featuredLevel, ducks, lofiGain: () => lofiBus?.gain.value, el: () => lofi?.el, featuredEl: () => featured?.el
    };
}

// Browsers only allow audio after a click or key press: retry the lofi on the first one.
['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, () => { if (state.sound) startLofi(); }, { passive: true }));

bus.on('sound', (on) => {
    if (!on) { stopFeatured(); pauseLofi(); stopAmbient(); }
    else { startAmbient(state.room); startLofi(); }
});
