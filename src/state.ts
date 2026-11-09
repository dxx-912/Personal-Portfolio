import { TOTAL_ITEMS, type RoomKey } from './content';

const STORAGE_KEY = 'dx-portfolio-v2';
/** Iteration 1 save: only "woke" and "sound" carry over (item ids changed). */
const OLD_KEY = 'dx-portfolio-v1';

interface Saved {
    woke: boolean;
    found: string[];
    sound: boolean;
    celebrated: boolean;
    outfit: number;
    seenTips: boolean;
}

type Listener<T> = (payload: T) => void;

/** What the player is doing. HUD reads this to decide what Esc does. */
export type GameMode = 'free' | 'sit' | 'ride' | 'pullup' | 'piano' | 'busy';

interface BusEvents {
    found: { key: string; count: number; isNew: boolean };
    sound: boolean;
    modal: 'panel' | 'pause' | null;
    reset: void;
    room: RoomKey;
    awake: boolean;
    /** Minimap click: walk to the door into the other room. */
    travel: void;
}

class Bus {
    private map = new Map<string, Set<Listener<unknown>>>();
    on<K extends keyof BusEvents>(name: K, fn: Listener<BusEvents[K]>) {
        if (!this.map.has(name)) this.map.set(name, new Set());
        this.map.get(name)!.add(fn as Listener<unknown>);
        return () => this.map.get(name)!.delete(fn as Listener<unknown>);
    }
    emit<K extends keyof BusEvents>(name: K, payload: BusEvents[K]) {
        this.map.get(name)?.forEach((fn) => fn(payload));
    }
}

export const bus = new Bus();

class GameState {
    woke = false;
    found = new Set<string>();
    sound = false;
    celebrated = false;
    outfit = 0;
    seenTips = false;
    /** Which modal is open, if any. The game ignores input while one is. */
    modal: 'panel' | 'pause' | null = null;
    mode: GameMode = 'free';
    room: RoomKey = 'dorm';
    /** True once the visitor is awake in this session (HUD shows then). */
    awake = false;

    constructor() { this.load(); }

    private load() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const s = JSON.parse(raw) as Partial<Saved>;
                this.woke = !!s.woke;
                this.found = new Set(Array.isArray(s.found) ? s.found : []);
                this.sound = !!s.sound;
                this.celebrated = !!s.celebrated;
                this.outfit = Number.isInteger(s.outfit) ? s.outfit! : 0;
                this.seenTips = !!s.seenTips;
                return;
            }
            const old = window.localStorage.getItem(OLD_KEY);
            if (old) {
                const s = JSON.parse(old) as Partial<Saved>;
                this.woke = !!s.woke;
                this.sound = !!s.sound;
            }
        } catch { /* storage unavailable: start fresh */ }
    }

    save() {
        try {
            const s: Saved = {
                woke: this.woke, found: [...this.found], sound: this.sound, celebrated: this.celebrated,
                outfit: this.outfit, seenTips: this.seenTips
            };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        } catch { /* ignore */ }
    }

    markFound(key: string) {
        const isNew = !this.found.has(key);
        if (isNew) { this.found.add(key); this.save(); }
        bus.emit('found', { key, count: this.found.size, isNew });
        return isNew;
    }

    get allFound() { return this.found.size >= TOTAL_ITEMS; }

    setSound(on: boolean) { this.sound = on; this.save(); bus.emit('sound', on); }

    setModal(m: 'panel' | 'pause' | null) { this.modal = m; bus.emit('modal', m); }

    setAwake(a: boolean) { this.awake = a; bus.emit('awake', a); }

    reset() {
        this.woke = false;
        this.found.clear();
        this.celebrated = false;
        this.outfit = 0;
        this.seenTips = false;
        this.save();
        bus.emit('reset', undefined);
    }
}

export const state = new GameState();
