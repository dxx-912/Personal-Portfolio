import Phaser from 'phaser';
import decorFiles from 'virtual:decor-files';
import {
    CAT_ZONE, FLOOR_H, FLOOR_W, FLOOR_X, FLOOR_Y, RIDE_SPEED, ROOM_H, ROOM_W, TILE, ZONE_ENTER, ZONE_EXIT,
    isTouchDevice, prefersReducedMotion, tx, ty
} from '../config';
import { ABOUT_KEY, completion, contentKey, getEntry, profile, ui, type Entry, type RoomKey } from '../content';
import { hlKey } from '../assets/manifest';
import { DANIEL_FRAMES } from '../assets/placeholders';
import { ROOMS } from '../rooms';
import type { ActionKind, DoorDef, Facing, InteractableDef, LabelDef, RoomDef } from '../rooms/types';
import { bus, state, type GameMode } from '../state';
import { Player, FACING_VEC, OUTFITS } from '../game/Player';
import { Cat } from '../game/Cat';
import { Lighting } from '../game/Lighting';
import { NavGrid, type Pt, type Rect } from '../game/nav';
import { lastInputAt, markInput, moveVector, onAction, type Action } from '../ui/input';
import { closePanel, openPanel } from '../ui/panel';
import {
    hideBubble, maybeSuggestQuickView, moveBubble, setPortrait, setPrompt, setWakeButton, showBubble, showMessage, showTitle, toast,
    type PromptSpec
} from '../ui/hud';
import { flash, openPiano, openSnapshot } from '../ui/overlays';
import { featuredLevel, hasFeatured, isFeaturedOn, playFeatured, sfx, startAmbient, step, stopAmbient, stopFeatured } from '../audio';

type EntryMode = 'sleep' | 'wake' | RoomKey;
type Sprite = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

interface Target {
    kind: 'item' | 'door';
    def?: InteractableDef;
    door?: DoorDef;
    /** Counted content key, e.g. "dorm.laptop", when the item has an F panel. */
    key: string | null;
    sprite: Sprite;
    hl?: Phaser.GameObjects.Sprite;
    marker?: Phaser.GameObjects.Image;
    /** Bob phase, so arrows do not bounce in sync. */
    phase?: number;
    spot: Pt;
    facing: Facing;
}

const IDLE_THOUGHT_MS = 12000;

export class Room extends Phaser.Scene {
    private def!: RoomDef;
    private entryMode!: EntryMode;
    private player!: Player;
    private cat: Cat | null = null;
    private nav!: NavGrid;
    private solids: Rect[] = [];
    private wallRects: Rect[] = [];
    private sprites = new Map<string, Sprite>();
    private targets: Target[] = [];
    private focus: Target | null = null;
    /** After a click-walk to an item with both E and F, keep it focused so its two buttons stay up. */
    private pinned: Target | null = null;
    private sleeping = false;
    private busy = false;
    private mode: GameMode = 'free';
    private lighting!: Lighting;
    private sleepSprite: Phaser.GameObjects.Sprite | null = null;
    private zTimer: Phaser.Time.TimerEvent | null = null;
    private hintUntil = 0;
    private offs: (() => void)[] = [];
    private rm = false;
    private zoom = 1;
    private zoomBoost = 1;
    private camPos = { x: ROOM_W / 2, y: ROOM_H / 2 };
    private labels: Phaser.GameObjects.Text[] = [];
    private labelRes = 0;
    private clockG: Phaser.GameObjects.Graphics | null = null;
    private lastStepAt = 0;
    private thinkUntil = 0;
    private sayUntil = 0;
    private seat: Target | null = null;
    private pull = { reps: 0, busy: false, target: null as Target | null, timer: null as Phaser.Time.TimerEvent | null };
    private lastBump = 0;
    /** A key-cap prompt is showing above Daniel's head: bubbles stack above it. */
    private promptAtHead = false;
    private snapping = false;

    constructor() { super('Room'); }

    init(data: { room: RoomKey; entry: EntryMode }) {
        this.def = ROOMS[data.room];
        this.entryMode = data.entry;
        state.room = data.room;
        this.solids = [];
        this.wallRects = [];
        this.sprites.clear();
        this.targets = [];
        this.focus = null;
        this.pinned = null;
        this.cat = null;
        this.speakerY0 = null;
        this.pieEaten = false;
        this.sleepSprite = null;
        this.busy = false;
        this.sleeping = false;
        this.setMode('free');
        this.rm = prefersReducedMotion();
        this.labels = [];
        this.labelRes = 0;
        this.clockG = null;
        this.zoomBoost = 1;
        this.seat = null;
    }

    create() {
        this.cameras.main.setBackgroundColor('#06050b');
        this.add.image(0, 0, this.def.background).setOrigin(0).setDepth(0);
        this.buildProps();
        this.buildDoors();
        this.buildWalls();
        this.nav = new NavGrid(this.solids);
        this.lighting = new Lighting(this, this.def);
        this.sprites.forEach((s, id) => { if (id === 'window' && s instanceof Phaser.GameObjects.Image) s.setFrame(this.lighting.tod); });
        this.buildClock();

        const arrival = this.arrivalPoint();
        this.player = new Player(this, arrival.x, arrival.y, state.outfit);
        this.player.face(arrival.facing);
        this.physics.add.collider(this.player.sprite, this.solidBodies(), () => this.onBump());
        this.ensureFree();

        if (this.def.catWaypoints) { this.makeCat(); this.scheduleMeow(); }
        this.buildTargets();

        const src = this.textures.get('daniel').getSourceImage() as CanvasImageSource;
        setPortrait(src, 1, 0, 15, 13);

        this.fitCamera();
        this.scale.on('resize', this.fitCamera, this);
        document.fonts?.ready.then(() => { if (this.scene.isActive()) this.fitCamera(); });

        this.offs.push(onAction((a) => this.onAction(a)));
        this.offs.push(bus.on('modal', (m) => {
            if (m) { this.player.cancelPath(); if (this.mode === 'free' || this.mode === 'ride') this.player.stop(); setPrompt(null); }
        }));
        this.offs.push(bus.on('travel', () => this.travel()));
        this.offs.push(bus.on('awake', () => requestAnimationFrame(() => this.fitCamera())));
        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.events.once('shutdown', () => {
            this.offs.forEach((f) => f()); this.offs = [];
            this.scale.off('resize', this.fitCamera, this);
            this.zTimer?.remove();
            stopFeatured();
            stopAmbient();
            ['say', 'think', 'act', 'cat'].forEach(hideBubble);
            setPrompt(null);
        });

        bus.emit('room', this.def.key);
        if (this.entryMode === 'sleep' && this.def.sleep) this.enterSleep();
        else {
            this.lighting.lit();
            state.setAwake(true);
            this.cameras.main.fadeIn(this.rm ? 80 : 260, 6, 5, 11);
            showTitle(ui.roomTitles[this.def.key]);
            startAmbient(this.def.key);
            this.time.delayedCall(3000, maybeSuggestQuickView);
        }
    }

    private setMode(m: GameMode) { this.mode = m; state.mode = m; }

    // ---------- building ----------

    private buildProps() {
        this.def.props.forEach((p, i) => {
            const img: Sprite = p.anim
                ? this.add.sprite(tx(p.x), ty(p.y), p.texture, 0).setOrigin(0)
                : this.add.image(tx(p.x), ty(p.y), p.texture).setOrigin(0);
            if (p.anim && img instanceof Phaser.GameObjects.Sprite) img.anims.play({ key: p.anim, delay: Math.random() * 600 });
            if (p.flipX) img.setFlipX(true);
            const bottom = ty(p.y) + img.height;
            const on = p.on ? this.sprites.get(p.on) : undefined;
            const depth = p.layer === 'decal' ? 0.5 + i * 0.001
                : p.layer === 'wall' ? 1 + i * 0.001
                : on ? on.depth + 0.01 + i * 0.0001
                : (p.depthRow !== undefined ? FLOOR_Y + p.depthRow * TILE : bottom);
            img.setDepth(depth);
            this.sprites.set(p.id, img);
            if (p.solid) this.solids.push({ x: tx(p.solid.x), y: ty(p.solid.y), w: p.solid.w * TILE, h: p.solid.h * TILE });
        });
    }

    private doorPx(d: DoorDef) {
        const top = ty(d.rowTop), bottom = ty(d.rowBottom);
        const x = d.side === 'right' ? FLOOR_X + FLOOR_W : FLOOR_X;
        return { x, top, bottom };
    }

    private buildDoors() {
        this.def.doors.forEach((d) => {
            const { x, top, bottom } = this.doorPx(d);
            const img = this.add.sprite(d.side === 'right' ? x - 2 : x + 2, bottom + 2, 'door_side', 0)
                .setOrigin(d.side === 'right' ? 0 : 1, 1)
                .setFlipX(d.side === 'left');
            img.setDisplaySize(10, bottom - top + 10);
            img.setDepth(bottom - 0.5);
            this.sprites.set(`door-${d.side}`, img);
        });
    }

    private buildWalls() {
        const T = 16;
        const add = (x: number, y: number, w: number, h: number) => this.wallRects.push({ x, y, w, h });
        add(FLOOR_X - T, FLOOR_Y - T, FLOOR_W + 2 * T, T);
        add(FLOOR_X - T, FLOOR_Y + FLOOR_H, FLOOR_W + 2 * T, T);
        (['left', 'right'] as const).forEach((side) => {
            const x = side === 'left' ? FLOOR_X - T : FLOOR_X + FLOOR_W;
            const door = this.def.doors.find((d) => d.side === side);
            if (!door) { add(x, FLOOR_Y, T, FLOOR_H); return; }
            const { top, bottom } = this.doorPx(door);
            add(x, FLOOR_Y, T, top - FLOOR_Y);
            add(x, bottom, T, FLOOR_Y + FLOOR_H - bottom);
            add(side === 'left' ? x - 4 : x + 8, top, T, bottom - top);
        });
    }

    private solidBodies() {
        return [...this.solids, ...this.wallRects].map((r) => {
            const z = this.add.zone(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h);
            this.physics.add.existing(z, true);
            return z;
        });
    }

    private buildClock() {
        const c = this.def.clock;
        if (!c) return;
        const cx = tx(c.x), cy = ty(c.y);
        this.add.image(cx - 6, cy - 6, 'wall_clock').setOrigin(0).setDepth(1.5);
        this.clockG = this.add.graphics().setDepth(1.51);
        const draw = () => {
            const d = new Date();
            const g = this.clockG!;
            g.clear();
            const hand = (angle: number, len: number, color: number) => {
                g.fillStyle(color, 1);
                for (let i = 0; i <= len; i += 0.5) g.fillRect(Math.round(cx + Math.sin(angle) * i) - 0.5 + 0.5, Math.round(cy - Math.cos(angle) * i) - 0.5 + 0.5, 1, 1);
            };
            const m = d.getMinutes(), h = (d.getHours() % 12) + m / 60;
            hand((m / 60) * Math.PI * 2, 4, 0x2a2130);
            hand((h / 12) * Math.PI * 2, 2.5, 0xc8423b);
        };
        draw();
        this.time.addEvent({ delay: 5000, loop: true, callback: draw });
    }

    private makeCat() {
        const avoid = this.def.interactables.filter((i) => i.target !== 'cat' && i.target !== 'longboard').map((i) => ({ x: tx(i.spot.x), y: ty(i.spot.y) }));
        this.def.doors.forEach((d) => { const { x, top, bottom } = this.doorPx(d); avoid.push({ x: d.side === 'right' ? x - 12 : x + 12, y: (top + bottom) / 2 }); });
        const bed = this.sprites.get('bed');
        this.cat = new Cat(this, {
            waypoints: this.def.catWaypoints!, avoid, nap: this.def.catNap,
            bedDepth: bed?.depth,
            knock: this.def.key === 'home' ? { at: { x: tx(14.15), y: ty(5.8) }, onKnock: () => this.knockPencil() } : undefined
        });
    }

    /** A soft meow every 45 to 90 seconds while the visitor is in the home room (text bubble if sound is off). */
    private scheduleMeow() {
        this.time.delayedCall(45000 + Math.random() * 45000, () => {
            if (this.cat && !this.cat.onBed && !state.modal && !this.sleeping) {
                if (state.sound) sfx('meow');
                else showBubble('cat', ui.meow, 'small');
                this.time.delayedCall(1300, () => hideBubble('cat'));
            }
            this.scheduleMeow();
        });
    }

    private buildTargets() {
        const room = this.def.key;
        this.def.interactables.forEach((d) => {
            const sprite = d.target === 'cat' ? this.cat?.sprite : this.sprites.get(d.target);
            if (!sprite) { if (d.target !== 'cat') throw new Error(`Interactable ${d.id} has no prop ${d.target}`); return; }
            if (d.info) getEntry(room, d.info); // fail fast on missing content
            const t: Target = {
                kind: 'item', def: d, key: d.info ? contentKey(room, d.info) : null, sprite,
                spot: { x: tx(d.spot.x), y: ty(d.spot.y) }, facing: d.facing
            };
            if (d.target === 'longboard') this.updateBoardSpot(t);
            this.decorate(t);
            this.targets.push(t);
        });
        this.def.doors.forEach((door) => {
            const { x, top, bottom } = this.doorPx(door);
            this.targets.push({
                kind: 'door', door, key: null, sprite: this.sprites.get(`door-${door.side}`)!,
                spot: { x: door.side === 'right' ? x - 9 : x + 9, y: Math.round((top + bottom) / 2) + 4 },
                facing: door.side
            });
        });
    }

    /** Pulsing outline when focused; a bobbing arrow while an F item is still unfound. Decor never gets either. */
    private decorate(t: Target) {
        const tex = t.sprite.texture.key;
        if (this.textures.exists(hlKey(tex))) t.hl = this.add.sprite(0, 0, hlKey(tex), 0).setVisible(false);
        if (t.key) {
            t.marker = this.add.image(0, 0, 'fx_arrow_s').setDepth(8800).setOrigin(0.5, 1);
            t.phase = Math.random() * Math.PI * 2;
            this.refreshSeen(t);
        }
    }

    private refreshSeen(t: Target) {
        if (t.marker && t.key) t.marker.setVisible(!state.found.has(t.key));
    }

    private syncHighlight(t: Target) {
        if (!t.hl) return;
        const s = t.sprite as Phaser.GameObjects.Sprite;
        t.hl.setPosition(s.x, s.y);
        t.hl.setOrigin(0, 0);
        t.hl.setDisplayOrigin(s.displayOriginX + 1, s.displayOriginY + 1);
        t.hl.setFlipX(s.flipX);
        if (s.frame && typeof s.frame.name === 'number') t.hl.setFrame(s.frame.name);
        t.hl.setDepth(s.depth - 0.001);
    }

    private buildLabels() {
        const R = Math.max(1, Math.ceil(this.cameras.main.zoom));
        if (R === this.labelRes) return;
        this.labelRes = R;
        this.labels.forEach((l) => l.destroy());
        this.labels = [];
        (this.def.labels ?? []).forEach((l: LabelDef) => {
            if (l.unlessSlot && decorFiles.includes(l.unlessSlot)) return;
            const on = this.sprites.get(l.on);
            const t = this.add.text(tx(l.x), ty(l.y), l.text, {
                fontFamily: '"Pixelify Sans", ui-monospace, monospace', fontSize: `${l.size * R}px`,
                fontStyle: l.bold ? 'bold' : 'normal', color: l.color, align: 'center', lineSpacing: -l.size * R * 0.25
            }).setOrigin(0.5).setScale(1 / R).setAngle(l.angle ?? 0).setDepth((on?.depth ?? 2) + 0.02);
            this.labels.push(t);
        });
    }

    private arrivalPoint() {
        const a = this.entryMode === 'sleep' ? this.def.arrivals.wake : this.def.arrivals[this.entryMode];
        const p = a ?? this.def.arrivals.wake ?? Object.values(this.def.arrivals)[0]!;
        return { x: tx(p.x), y: ty(p.y), facing: p.facing };
    }

    /** Never trap the player: nudge to the nearest free spot if inside furniture. */
    private ensureFree() {
        if (this.nav.isFree(this.player.x, this.player.y)) return;
        const p = this.nav.nearestFreePoint({ x: this.player.x, y: this.player.y });
        this.player.teleport(p.x, p.y);
    }

    // ---------- camera ----------

    /** Where the camera sits when not leaning in (world centre), chosen by fitCamera. */
    private baseCenter = { x: ROOM_W / 2, y: ROOM_H / 2 };

    /**
     * The whole room is always visible (never cropped). Picks the biggest zoom, integer on big screens,
     * where the HUD boxes cover no interactive item, nudging the room down or sideways inside the spare space.
     */
    private fitCamera() {
        const w = this.scale.width, h = this.scale.height;
        const fit = Math.min(w / ROOM_W, h / ROOM_H);
        const hud = [...document.querySelectorAll<HTMLElement>('.hud-top-left > *, .hud-top-right > *')]
            .map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
        const canvas = this.game.canvas.getBoundingClientRect();
        const items = this.targets.map((t) => t.sprite.getBounds());
        const hits = (z: number, ox: number, oy: number) => items.some((b) => {
            const x = canvas.left + ox + b.x * z, y = canvas.top + oy + b.y * z, bw = b.width * z, bh = b.height * z;
            return hud.some((r) => x < r.right && x + bw > r.left && y < r.bottom && y + bh > r.top);
        });
        const steps: number[] = [];
        if (fit >= 3) for (let z = Math.floor(fit); z >= 2; z--) steps.push(z);
        else for (let z = Math.floor(fit * 8) / 8; z >= 0.5; z -= 0.125) steps.push(z);
        let chosen: { z: number; ox: number; oy: number } | null = null;
        for (const z of steps) {
            const sx = w - ROOM_W * z, sy = h - ROOM_H * z;
            const tries: [number, number][] = [];
            for (let dy = 0; dy <= sy / 2; dy += 4) for (const dx of [0, 8, -8, 16, -16, 32, -32]) if (Math.abs(dx) <= sx / 2) tries.push([dx, dy]);
            const ok = tries.find(([dx, dy]) => !hits(z, sx / 2 + dx, sy / 2 + dy));
            if (ok) { chosen = { z, ox: sx / 2 + ok[0], oy: sy / 2 + ok[1] }; break; }
        }
        if (!chosen) { const z = steps[0] ?? Math.max(0.5, fit); chosen = { z, ox: (w - ROOM_W * z) / 2, oy: (h - ROOM_H * z) / 2 }; }
        this.zoom = chosen.z;
        this.baseCenter = { x: (w / 2 - chosen.ox) / chosen.z, y: (h / 2 - chosen.oy) / chosen.z };
        this.cameras.main.setZoom(this.zoom * this.zoomBoost);
        this.updateCamera(0, true);
        this.buildLabels();
    }

    private updateCamera(dt: number, snap = false) {
        const cam = this.cameras.main;
        let tx_ = this.baseCenter.x, ty_ = this.baseCenter.y;
        if (this.zoomBoost > 1.001 && this.player) {
            // leaning in (sitting): follow Daniel, staying inside the room
            const vw = this.scale.width / cam.zoom, vh = this.scale.height / cam.zoom;
            const clampAxis = (p: number, view: number, size: number) =>
                view >= size ? size / 2 : Phaser.Math.Clamp(p, view / 2, size - view / 2);
            tx_ = clampAxis(this.player.x, vw, ROOM_W);
            ty_ = clampAxis(this.player.y - 12, vh, ROOM_H);
        }
        const k = snap ? 1 : 1 - Math.pow(0.88, dt / 16.7);
        this.camPos.x += (tx_ - this.camPos.x) * k;
        this.camPos.y += (ty_ - this.camPos.y) * k;
        cam.centerOn(Math.round(this.camPos.x * cam.zoom) / cam.zoom, Math.round(this.camPos.y * cam.zoom) / cam.zoom);
    }

    private easeZoom(boost: number) {
        if (this.rm) return;
        this.tweens.add({
            targets: this, zoomBoost: boost, duration: 500, ease: 'Sine.easeInOut',
            onUpdate: () => this.cameras.main.setZoom(this.zoom * this.zoomBoost),
            onComplete: () => this.cameras.main.setZoom(this.zoom * this.zoomBoost)
        });
    }

    /** World point to page coordinates (for HTML overlays). */
    private toPage(wx: number, wy: number) {
        const cam = this.cameras.main;
        const rect = this.game.canvas.getBoundingClientRect();
        const sx = rect.width / this.scale.width, sy = rect.height / this.scale.height;
        return {
            x: rect.left + (wx - cam.worldView.x) * cam.zoom * sx,
            y: rect.top + (wy - cam.worldView.y) * cam.zoom * sy
        };
    }

    // ---------- sleep and wake ----------

    private enterSleep() {
        this.sleeping = true;
        state.setAwake(false);
        setWakeButton(true);
        this.player.sprite.setVisible(false);
        const s = this.def.sleep!;
        this.sleepSprite = this.add.sprite(tx(s.x), ty(s.y), 'daniel_sleep', 0).setOrigin(0).setDepth(9050);
        this.sleepSprite.anims.play('sleep');
        this.lighting.set(0.97, 0, 0.55, this.sleeperAt());
        this.zTimer = this.time.addEvent({ delay: 1100, loop: true, callback: () => this.puffZ() });
        this.puffZ();
        showMessage(isTouchDevice() ? ui.wakeTouch : ui.wakeKeys, 'wake');
        this.cameras.main.fadeIn(this.rm ? 80 : 500, 6, 5, 11);
    }

    private sleeperAt() { const s = this.def.sleep!; return { x: tx(s.x + 0.9), y: ty(s.y + 0.4) }; }

    private puffZ() {
        if (!this.sleepSprite || this.rm) return;
        const z = this.add.sprite(this.sleepSprite.x + 8, this.sleepSprite.y, 'fx_z', Math.random() < 0.5 ? 0 : 1).setDepth(9060);
        this.tweens.add({
            targets: z, x: z.x + 8, y: z.y - 14, alpha: { from: 1, to: 0 }, duration: 1800, ease: 'Sine.easeOut',
            onComplete: () => z.destroy()
        });
    }

    private wake() {
        if (!this.sleeping || this.busy) return;
        this.sleeping = false;
        this.busy = true;
        this.zTimer?.remove();
        showMessage(null);
        setWakeButton(false);
        sfx('wake');
        const fast = this.rm;
        const sleeper = this.sleepSprite!;
        const target = this.lighting.baseDark;
        const level = { dark: 0.97, light: 0, glow: 0.55 };
        const relight = () => this.lighting.set(level.dark, level.light, level.glow, this.sleeperAt());
        this.tweens.add({
            targets: sleeper, x: sleeper.x + 1, duration: 60, yoyo: true, repeat: fast ? 0 : 3,
            onComplete: () => {
                // window light first, then the lamps and the room
                this.tweens.add({ targets: level, light: 0.6, duration: fast ? 60 : 450, ease: 'Sine.easeIn', onUpdate: relight });
                this.tweens.add({
                    targets: level, dark: target, light: 1, glow: 0, delay: fast ? 0 : 380, duration: fast ? 100 : 700, ease: 'Sine.easeInOut',
                    onUpdate: relight, onComplete: () => this.lighting.lit()
                });
                this.time.delayedCall(fast ? 50 : 300, () => this.hopOut(sleeper));
            }
        });
    }

    private hopOut(sleeper: Phaser.GameObjects.Sprite) {
        const from = { x: sleeper.x + 7, y: sleeper.y + 12 };
        const to = this.arrivalPoint();
        sleeper.destroy();
        this.sleepSprite = null;
        const p = this.player;
        p.teleport(from.x, from.y);
        p.sprite.setVisible(true).setDepth(9050);
        p.face('right');
        const prog = { t: 0 };
        this.tweens.add({
            targets: prog, t: 1, duration: this.rm ? 80 : 420, ease: 'Sine.easeInOut',
            onUpdate: () => {
                const x = from.x + (to.x - from.x) * prog.t;
                const y = from.y + (to.y - from.y) * prog.t - Math.sin(prog.t * Math.PI) * 10;
                p.sprite.setPosition(Math.round(x), Math.round(y));
            },
            onComplete: () => {
                p.teleport(to.x, to.y);
                p.face(to.facing);
                p.sprite.setDepth(to.y);
                this.ensureFree();
                state.woke = true;
                state.save();
                this.busy = false;
                state.setAwake(true);
                showTitle(ui.roomTitles[this.def.key]);
                this.say(profile.wakeLine, 5000);
                if (!state.seenTips) {
                    showMessage(isTouchDevice() ? ui.controlsTouch : ui.controlsKeys, 'tip');
                    this.time.delayedCall(7000, () => showMessage(null));
                    state.seenTips = true;
                    state.save();
                }
                this.pulseDoor();
                startAmbient(this.def.key);
                this.time.delayedCall(5500, maybeSuggestQuickView);
                markInput();
            }
        });
    }

    /** Draws the eye to the door once: the sign bobs, the light leak brightens. */
    private pulseDoor() {
        const door = this.def.doors[0];
        if (!door) return;
        const sign = this.sprites.get('sign');
        if (sign && !this.rm) this.tweens.add({ targets: sign, y: sign.y - 2, duration: 180, yoyo: true, repeat: 3, delay: 900 });
        this.time.delayedCall(900, () => this.lighting.pulse(door.side === 'right' ? 19.7 : 0.3, (door.rowTop + door.rowBottom) / 2));
    }

    private say(text: string, ms: number) {
        showBubble('say', text, 'speech');
        this.sayUntil = this.time.now + ms;
    }

    // ---------- input ----------

    private canAct() { return !this.sleeping && !this.busy && !state.modal; }

    private onAction(a: Action) {
        if (state.modal) return;
        if (a === 'about') { this.openAbout(); return; }
        if (a === 'hint') { if (this.canAct()) this.hintUntil = this.time.now + 1600; return; }
        if (a === 'konami') { this.flip(); return; }
        if (a === 'escape') {
            if (this.mode === 'sit') this.standUp();
            else if (this.mode === 'ride') this.dismount();
            else if (this.mode === 'pullup') this.endPullups();
            return;
        }
        if (a !== 'act' && a !== 'info') return;
        if (this.sleeping) { this.wake(); return; }
        if (!this.canAct()) return;
        if (this.mode === 'pullup') { if (a === 'act') this.rep(); return; }
        if (this.mode === 'sit') { if (a === 'act') this.standUp(); return; }
        if (this.mode === 'ride') { if (a === 'act') this.dismount(); return; }
        if (this.mode !== 'free') return;
        const t = this.focus;
        if (!t) return;
        if (t.kind === 'door') { this.goThrough(t.door!); return; }
        if (a === 'act' && t.def?.action) this.doAction(t, t.def.action);
        else if (a === 'info' && t.def?.info) this.openInfo(t);
    }

    private hitTest(wx: number, wy: number): Target | null {
        const hits = this.targets.filter((t) => {
            if (!t.sprite.visible) return false;
            const b = t.sprite.getBounds();
            Phaser.Geom.Rectangle.Inflate(b, 2, 2);
            return b.contains(wx, wy);
        });
        if (!hits.length) return null;
        // topmost first, then smallest (desk items beat the desk around them)
        hits.sort((a, b) => (b.sprite.depth - a.sprite.depth) || (a.sprite.width * a.sprite.height - b.sprite.width * b.sprite.height));
        return hits[0];
    }

    private onPointerMove(p: Phaser.Input.Pointer) {
        if (!this.canAct()) { this.input.setDefaultCursor(this.sleeping ? 'pointer' : 'default'); return; }
        const w = p.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
        this.input.setDefaultCursor(this.hitTest(w.x, w.y) ? 'pointer' : 'default');
    }

    private onPointerDown(p: Phaser.Input.Pointer) {
        if (state.modal) return;
        markInput();
        if (this.sleeping) { this.wake(); return; }
        if (!this.canAct()) return;
        if (this.mode === 'pullup') { this.rep(); return; }
        const w = p.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
        const hit = this.hitTest(w.x, w.y);
        if (this.mode === 'ride') {
            const onMe = this.player.sprite.getBounds().contains(w.x, w.y) || hit?.def?.target === 'longboard';
            if (onMe) { this.dismount(); return; }
            this.walkToPoint(w.x, w.y);
            return;
        }
        if (this.mode === 'sit') {
            if (hit === this.seat) { this.standUp(); return; }
            this.standUp();
        }
        if (this.mode !== 'free') return;
        this.pinned = null;
        if (hit) { this.walkToTarget(hit); return; }
        this.walkToPoint(w.x, w.y);
    }

    private walkToPoint(wx: number, wy: number) {
        if (wx < FLOOR_X || wx > FLOOR_X + FLOOR_W || wy < FLOOR_Y - 4 || wy > FLOOR_Y + FLOOR_H + 4) return;
        const dest = this.nav.nearestFreePoint({ x: wx, y: wy + 2 });
        const path = this.nav.findPath({ x: this.player.x, y: this.player.y }, dest);
        if (path) this.player.walkTo(path);
        this.markClick(dest);
    }

    private markClick(p: Pt) {
        if (this.rm) return;
        const r = this.add.rectangle(Math.round(p.x), Math.round(p.y) - 1, 5, 3).setStrokeStyle(1, 0xfff6c8).setDepth(3);
        this.tweens.add({ targets: r, alpha: 0, scale: 1.6, duration: 380, onComplete: () => r.destroy() });
    }

    private walkToTarget(t: Target) {
        let spot = t.spot;
        if (t.def?.target === 'cat' && this.cat) spot = this.nav.nearestFreePoint(this.cat.standingSpot(this.player.x).spot);
        const path = this.nav.findPath({ x: this.player.x, y: this.player.y }, spot);
        if (!path) return;
        this.markClick(spot);
        this.player.walkTo(path, () => this.arrive(t));
    }

    /** Click-walk arrival: one option, do it; two options, keep the item focused so both buttons show. */
    private arrive(t: Target) {
        if (t.kind === 'door') { this.goThrough(t.door!); return; }
        this.faceTarget(t);
        const d = t.def!;
        if (d.action && d.info) { this.pinned = t; return; }
        if (d.action) this.doAction(t, d.action);
        else if (d.info) this.openInfo(t);
    }

    private faceTarget(t: Target) {
        if (t.def?.target === 'cat' && this.cat) {
            const dx = this.cat.x - this.player.x, dy = this.cat.y - this.player.y;
            this.player.face(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        } else this.player.face(t.facing);
    }

    // ---------- F: panels ----------

    private openInfo(t: Target) {
        const d = t.def!;
        this.player.squash();
        this.bounce(t.sprite);
        sfx('tick');
        this.openEntry(getEntry(this.def.key, d.info!), t.key!, t);
    }

    private openAbout() {
        if (!state.awake || this.sleeping || this.busy) return;
        this.openEntry(getEntry('dorm', 'about'), ABOUT_KEY);
    }

    private openEntry(entry: Entry, key: string, t?: Target) {
        if (state.markFound(key)) sfx('found');
        if (t) this.refreshSeen(t);
        if (this.cat) this.cat.held = true;
        openPanel(entry, () => {
            if (this.cat) this.cat.held = false;
            if (state.allFound && !state.celebrated) this.celebrate();
        });
    }

    // ---------- E: actions ----------

    private verb(t: Target): string | undefined {
        const a = t.def?.action;
        if (!a) return undefined;
        if (a === 'music') return isFeaturedOn() ? ui.verbs.musicOff : ui.verbs.musicOn;
        const map: Record<Exclude<ActionKind, 'music'>, string> = {
            sit: ui.verbs.sit, outfit: ui.verbs.outfit, pullup: ui.verbs.pullup, snap: ui.verbs.snap,
            piano: ui.verbs.piano, pet: ui.verbs.pet, ride: ui.verbs.ride, eat: ui.verbs.eat
        };
        return map[a];
    }

    private doAction(t: Target, a: ActionKind) {
        this.pinned = null;
        switch (a) {
            case 'sit': this.sitDown(t); break;
            case 'outfit': this.changeOutfit(t); break;
            case 'pullup': this.startPullups(t); break;
            case 'music': this.toggleMusic(t); break;
            case 'snap': this.snapPhoto(t); break;
            case 'piano': this.playPiano(t); break;
            case 'pet': this.petCat(); break;
            case 'ride': this.mount(t); break;
            case 'eat': this.eatPie(t); break;
        }
    }

    private body() { return this.player.sprite.body as Phaser.Physics.Arcade.Body; }

    private sitDown(t: Target) {
        const seat = t.def?.seat;
        if (!seat) return;
        this.setMode('sit');
        this.seat = t;
        this.player.cancelPath();
        this.player.stop();
        this.body().enable = false;
        const sink = seat.pose === 'sink' ? 2 : 0;
        this.player.teleport(tx(seat.x), ty(seat.y) + sink);
        this.player.pose(DANIEL_FRAMES.sit);
        this.player.sprite.setDepth(t.sprite.depth + 1);
        if (!this.rm) this.tweens.add({ targets: t.sprite, scaleY: 0.96, duration: 90, yoyo: true });
        sfx('hop');
        this.easeZoom(1.12);
        markInput();
    }

    private standUp() {
        const t = this.seat;
        if (this.mode !== 'sit' || !t) return;
        this.seat = null;
        this.player.pose(null);
        this.player.teleport(t.spot.x, t.spot.y);
        this.body().enable = true;
        this.player.face(t.facing === 'up' ? 'down' : 'down');
        this.ensureFree();
        this.setMode('free');
        this.easeZoom(1);
        hideBubble('think');
    }

    private changeOutfit(t: Target) {
        state.outfit = (state.outfit + 1) % OUTFITS.length;
        state.save();
        this.player.setOutfit(state.outfit);
        this.player.squash();
        this.bounce(t.sprite);
        sfx('puff');
        const puff = this.add.sprite(this.player.x, this.player.y - 6, 'fx_puff', 0).setDepth(this.player.y + 1);
        puff.anims.play('puff');
        this.tweens.add({ targets: puff, alpha: 0, y: puff.y - 4, duration: 450, delay: 150, onComplete: () => puff.destroy() });
        showBubble('act', ui.outfitPuff, 'small');
        this.time.delayedCall(1200, () => { if (this.mode === 'free') hideBubble('act'); });
    }

    private startPullups(t: Target) {
        const tower = this.sprites.get('pullup');
        if (!tower) return;
        this.setMode('pullup');
        this.pull = { reps: 0, busy: false, target: t, timer: null };
        this.player.cancelPath();
        this.player.stop();
        this.body().enable = false;
        const barY = tower.y + 3;
        this.player.teleport(Math.round(tower.x + tower.width / 2), barY + 21);
        this.player.pose(DANIEL_FRAMES.hang);
        this.player.sprite.setDepth(tower.depth + 1);
        sfx('hop');
        showBubble('act', isTouchDevice() ? ui.pullupHintTouch : ui.pullupHint, 'small');
        this.pull.timer = this.time.delayedCall(5000, () => this.endPullups());
    }

    private rep() {
        if (this.mode !== 'pullup' || this.pull.busy) return;
        this.pull.busy = true;
        this.pull.reps++;
        sfx('rep');
        showBubble('act', ui.pullupCount(this.pull.reps), 'small');
        const s = this.player.sprite, y = s.y;
        this.player.pose(DANIEL_FRAMES.hangStrain);
        this.tweens.add({
            targets: s, y: y - 7, duration: 110, yoyo: true, ease: 'Quad.easeOut',
            onComplete: () => { s.setY(y); if (this.mode === 'pullup') this.player.pose(DANIEL_FRAMES.hang); this.pull.busy = false; }
        });
    }

    private endPullups() {
        if (this.mode !== 'pullup') return;
        this.pull.timer?.remove();
        const t = this.pull.target!;
        const reps = this.pull.reps;
        showBubble('act', ui.pullupDone(reps), 'small');
        if (reps > 0) sfx('nice');
        this.busy = true;
        this.time.delayedCall(350, () => {
            this.player.pose(null);
            this.player.teleport(t.spot.x, t.spot.y);
            this.body().enable = true;
            this.player.face('down');
            this.ensureFree();
            this.busy = false;
            this.setMode('free');
            this.time.delayedCall(1300, () => hideBubble('act'));
        });
    }

    private toggleMusic(t: Target) {
        this.bounce(t.sprite);
        if (!state.sound) {
            toast(ui.soundIsOff, 5000, { label: ui.turnSoundOn, onClick: () => { state.setSound(true); this.startSpeaker(); } });
            return;
        }
        if (isFeaturedOn()) { stopFeatured(); sfx('tick'); }
        else this.startSpeaker();
    }

    private startSpeaker() {
        if (!hasFeatured()) { toast(ui.noTrack, 2600); return; }
        playFeatured(() => undefined);
    }

    /** The speaker bumps to the real loudness of the music; notes float up on the loud bits. */
    private speakerY0: number | null = null;
    private lastNote = 0;
    private animateSpeaker(time: number) {
        const sp = this.sprites.get('speaker');
        if (!sp) return;
        this.speakerY0 ??= sp.y;
        if (!isFeaturedOn() || this.rm) { if (sp.y !== this.speakerY0) sp.setY(this.speakerY0).setScale(1); return; }
        const level = featuredLevel();
        sp.setY(this.speakerY0 - Math.round(level * 2));
        sp.setScale(1 + level * 0.06, 1);
        if (level > 0.55 && time - this.lastNote > 420) {
            this.lastNote = time;
            const n = this.add.image(sp.x + 4 + Math.random() * (sp.width - 8), sp.y, 'fx_note').setDepth(8600);
            this.tweens.add({ targets: n, y: n.y - 14, x: n.x + (Math.random() - 0.5) * 8, alpha: 0, duration: 1100, onComplete: () => n.destroy() });
        }
    }

    private snapPhoto(t: Target) {
        this.bounce(t.sprite);
        sfx('shutter');
        flash(this.rm);
        // hide game UI drawn in the canvas for the shot
        this.targets.forEach((x) => { x.hl?.setVisible(false); x.marker?.setVisible(false); });
        const cam = this.cameras.main;
        const r = {
            x: Math.max(0, Math.round((0 - cam.worldView.x) * cam.zoom)),
            y: Math.max(0, Math.round((0 - cam.worldView.y) * cam.zoom))
        };
        const w = Math.min(this.scale.width - r.x, Math.round((ROOM_W - Math.max(0, cam.worldView.x)) * cam.zoom));
        const h = Math.min(this.scale.height - r.y, Math.round((ROOM_H - Math.max(0, cam.worldView.y)) * cam.zoom));
        this.busy = true;
        this.snapping = true;
        this.game.renderer.snapshotArea(r.x, r.y, w, h, (img) => {
            this.snapping = false;
            this.busy = false;
            const el = img as HTMLImageElement;
            const go = () => openSnapshot(el.src, () => undefined);
            if (el.complete) go(); else el.onload = go;
        });
    }

    /** E at the pie: two seconds of bites (the slice shrinks), then "yum!". The slice is back next visit. */
    private pieEaten = false;
    private eatPie(t: Target) {
        if (this.pieEaten) { showBubble('act', ui.pieGone, 'small'); this.time.delayedCall(1600, () => hideBubble('act')); return; }
        const pie = t.sprite as Phaser.GameObjects.Image;
        this.busy = true;
        this.player.cancelPath();
        this.player.stop();
        this.player.face('down');
        let bite = 0;
        const bites = 7, every = 2000 / bites;
        this.time.addEvent({
            delay: every, repeat: bites - 1, callback: () => {
                bite++;
                this.player.pose(bite % 2 ? DANIEL_FRAMES.eat : DANIEL_FRAMES.eatDown);
                if (bite % 2) sfx('chomp');
                pie.setFrame(Math.min(3, Math.floor((bite / bites) * 4)));
            }
        });
        this.player.pose(DANIEL_FRAMES.eatDown);
        this.time.delayedCall(2000 + 60, () => {
            pie.setFrame(3);
            this.player.pose(null);
            this.player.face('down');
            this.pieEaten = true;
            this.busy = false;
            showBubble('act', ui.yum, 'speech');
            this.time.delayedCall(1700, () => hideBubble('act'));
        });
    }

    private playPiano(t: Target) {
        this.bounce(t.sprite);
        this.setMode('piano');
        openPiano(() => this.setMode('free'));
    }

    private petCat() {
        if (!this.cat) return;
        const t = this.targets.find((x) => x.def?.target === 'cat');
        if (t) this.faceTarget(t);
        const r = this.cat.pet();
        const cat = this.cat;
        this.player.pose(DANIEL_FRAMES.crouch);
        this.time.delayedCall(650, () => { if (this.mode === 'free') this.player.pose(null); });
        const hearts = r === 'asleep' ? 1 : (this.rm ? 1 : 4);
        for (let i = 0; i < hearts; i++) {
            const h = this.add.image(cat.x - 4 + i * 3, cat.y - 13, 'fx_heart').setDepth(8500);
            this.tweens.add({
                targets: h, y: h.y - 12 - i * 2, x: h.x + (i % 2 ? 3 : -3), alpha: 0, delay: i * 90, duration: 800,
                onComplete: () => h.destroy()
            });
        }
        if (r === 'asleep') { sfx('purr'); if (!state.sound) showBubble('cat', ui.purr, 'small'); }
        else { sfx('meow'); if (!state.sound) showBubble('cat', ui.meow, 'small'); }
        this.time.delayedCall(r === 'asleep' ? 2600 : 1300, () => hideBubble('cat'));
    }

    // ---------- longboard ----------

    private board() { return this.sprites.get('longboard'); }

    private updateBoardSpot(t: Target) {
        const b = this.board();
        if (!b) return;
        t.spot = this.nav.nearestFreePoint({ x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height + 7) });
    }

    private mount(t: Target) {
        const b = this.board();
        if (!b) return;
        this.player.cancelPath();
        this.player.stop();
        const on = this.nav.nearestFreePoint({ x: Math.round(b.x + b.width / 2), y: Math.round(b.y + 8) });
        this.busy = true;
        sfx('hop');
        const from = { x: this.player.x, y: this.player.y };
        const prog = { t: 0 };
        this.tweens.add({
            targets: prog, t: 1, duration: this.rm ? 60 : 260, ease: 'Sine.easeInOut',
            onUpdate: () => this.player.sprite.setPosition(
                Math.round(from.x + (on.x - from.x) * prog.t), Math.round(from.y + (on.y - from.y) * prog.t - Math.sin(prog.t * Math.PI) * 6)),
            onComplete: () => {
                this.player.teleport(on.x, on.y);
                this.body().setBounce(0.55, 0.55);
                this.busy = false;
                this.setMode('ride');
                if (t.marker) t.marker.setVisible(false);
            }
        });
    }

    private dismount() {
        if (this.mode !== 'ride') return;
        const b = this.board()!;
        this.body().setBounce(0, 0);
        this.player.stop();
        const off = this.nav.nearestFreePoint({ x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height + 8) });
        sfx('hop');
        this.player.teleport(off.x, off.y);
        this.player.face('up');
        this.setMode('free');
        const t = this.targets.find((x) => x.def?.target === 'longboard');
        if (t) { this.updateBoardSpot(t); this.refreshSeen(t); }
    }

    private onBump() {
        if (this.mode !== 'ride') return;
        const now = this.time.now;
        if (now - this.lastBump < 250) return;
        const v = this.body().velocity;
        if (Math.hypot(v.x, v.y) < 30) return;
        this.lastBump = now;
        sfx('bump');
        if (!this.rm) this.cameras.main.shake(80, 0.002);
    }

    // ---------- little extras ----------

    private bounce(o: Sprite) {
        if (this.rm || this.tweens.isTweening(o)) return;
        const y = o.y;
        this.tweens.add({ targets: o, y: y - 2, duration: 70, yoyo: true, ease: 'Quad.easeOut', onComplete: () => o.setY(y) });
    }

    private flip() {
        if (!this.canAct() || this.mode !== 'free') return;
        const s = this.player.sprite;
        sfx('hop');
        if (this.rm) return;
        this.busy = true;
        this.tweens.add({
            targets: s, angle: 360, duration: 520, ease: 'Sine.easeInOut',
            onComplete: () => { s.setAngle(0); this.busy = false; }
        });
        this.tweens.add({ targets: s, y: s.y - 10, duration: 260, yoyo: true, ease: 'Quad.easeOut' });
    }

    private knockPencil() {
        const p = this.add.image(tx(13.35), ty(5.95), 'pencil').setDepth(ty(9)).setOrigin(0.5);
        this.tweens.add({
            targets: p, x: tx(13.95), y: ty(6.6), angle: 200, duration: 420, ease: 'Quad.easeIn',
            onComplete: () => { p.setDepth(ty(6.6)); sfx('tick'); }
        });
    }

    private celebrate() {
        state.celebrated = true;
        state.save();
        this.busy = true;
        const s = this.player.sprite;
        const y = s.y;
        this.player.pose(DANIEL_FRAMES.cheer);
        if (!this.rm) {
            for (let i = 0; i < 18; i++) {
                const sp = this.add.sprite(s.x, s.y - 12, 'sparkle', 1).setDepth(8600).setTint([0xffe27a, 0x7fd1ff, 0xff8aa8, 0x9dffb0][i % 4]);
                const ang = (i / 18) * Math.PI * 2;
                this.tweens.add({ targets: sp, x: sp.x + Math.cos(ang) * 30, y: sp.y + Math.sin(ang) * 20 - 10, alpha: 0, duration: 1000, ease: 'Quad.easeOut', onComplete: () => sp.destroy() });
            }
        }
        sfx('nice');
        this.tweens.add({
            targets: s, y: y - 6, duration: 140, yoyo: true, repeat: this.rm ? 0 : 3, ease: 'Quad.easeOut',
            onComplete: () => {
                s.setY(y);
                this.player.pose(null);
                this.busy = false;
                openPanel(completion);
            }
        });
    }

    private travel() {
        if (!this.canAct()) return;
        if (this.mode === 'sit') this.standUp();
        if (this.mode === 'ride') this.dismount();
        if (this.mode !== 'free') return;
        const door = this.targets.find((t) => t.kind === 'door');
        if (door) this.walkToTarget(door);
    }

    private goThrough(door: DoorDef) {
        if (this.busy) return;
        this.busy = true;
        this.player.cancelPath();
        this.player.stop();
        setPrompt(null);
        closePanel(true);
        sfx('door');
        const cam = this.cameras.main;
        cam.fadeOut(this.rm ? 80 : 240, 6, 5, 11);
        cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.restart({ room: door.to, entry: this.def.key });
        });
    }

    // ---------- per frame ----------

    update(time: number, delta: number) {
        const dt = Math.min(delta, 50);
        const feet = { x: this.player.x, y: this.player.y, moving: this.player.moving };
        this.cat?.update(dt, feet);
        this.animateSpeaker(time);
        this.updateCamera(dt);
        this.updateBubbles();
        this.promptAtHead = false;

        if (!this.canAct()) {
            if (!this.busy && this.mode !== 'ride') this.player.sprite.setVelocity(0, 0);
            if (this.mode === 'ride' && state.modal) this.player.sprite.setVelocity(0, 0);
            this.updateHighlights(this.busy ? this.focus : null, time);
            if (!state.modal) setPrompt(null);
            return;
        }

        switch (this.mode) {
            case 'pullup':
                this.updateHighlights(null, time);
                this.promptAtPlayer({ act: ui.verbs.pullup });
                return;
            case 'sit': {
                const mv = moveVector();
                if (mv.x || mv.y) { this.standUp(); return; }
                this.updateHighlights(null, time);
                this.promptAtPlayer({ act: ui.verbs.stand });
                this.idleThoughts();
                return;
            }
            case 'ride': {
                this.player.update(moveVector(), dt, RIDE_SPEED, 0.07);
                const b = this.board()!;
                b.setPosition(Math.round(this.player.x - b.width / 2), Math.round(this.player.y - b.height + 3));
                b.setDepth(this.player.y - 0.5);
                if (this.cat && Math.hypot(this.cat.x - this.player.x, this.cat.y - this.player.y) < 24 && this.player.moving) this.cat.batAt(this.player.x);
                this.updateHighlights(null, time);
                this.promptAtPlayer({ act: ui.verbs.dismount });
                return;
            }
            case 'piano':
                return;
        }

        this.player.update(moveVector(), dt);
        if (!this.canAct()) { setPrompt(null); this.updateHighlights(null, time); return; }
        this.footsteps(time);
        this.checkDoors();
        const f = this.pickFocus();
        this.focus = f;
        this.updateHighlights(f, time);
        if (f) {
            const spec: PromptSpec = f.kind === 'door'
                ? { door: f.door!.side === 'right' ? `${ui.doorToHome} →` : `← ${ui.doorToDorm}` }
                : { act: this.verb(f), info: f.def?.info ? getEntry(this.def.key, f.def.info).prompt : undefined };
            const b = f.sprite.getBounds();
            const objTop = (f.kind === 'door' ? b.top + 6 : b.top) - 3;
            const headTop = this.player.sprite.getBounds().top - 2;
            // above the object; above Daniel's head if the object is lower, or very tall (closet, shelf)
            const useHead = objTop > headTop || headTop - objTop > 34;
            const p = this.toPage(useHead ? this.player.x : b.centerX, useHead ? headTop : objTop);
            setPrompt(spec, p.x, p.y);
            this.promptAtHead = useHead;
        } else setPrompt(null);
        this.idleThoughts();
    }

    private promptAtPlayer(spec: PromptSpec) {
        const p = this.toPage(this.player.x, this.player.sprite.getBounds().top - 2);
        setPrompt(spec, p.x, p.y);
        this.promptAtHead = true;
    }

    private updateBubbles() {
        const now = this.time.now;
        if (this.sayUntil && (now > this.sayUntil || this.player.moving)) { hideBubble('say'); this.sayUntil = 0; }
        if (this.thinkUntil && (now > this.thinkUntil || this.player.moving || state.modal)) { hideBubble('think'); this.thinkUntil = 0; }
        const head = this.toPage(this.player.x, this.player.sprite.getBounds().top - 2);
        if (this.promptAtHead) head.y -= 40;
        moveBubble('say', head.x, head.y);
        moveBubble('think', head.x, head.y);
        moveBubble('act', head.x, head.y);
        if (this.cat) { const c = this.toPage(this.cat.x, this.cat.y - 14); moveBubble('cat', c.x, c.y); }
    }

    private idleThoughts() {
        if (state.modal || this.busy || this.thinkUntil || this.sayUntil || !profile.idleThoughts.length) return;
        if (performance.now() - lastInputAt < IDLE_THOUGHT_MS) return;
        const line = profile.idleThoughts[Math.floor(Math.random() * profile.idleThoughts.length)];
        showBubble('think', line, 'thought');
        this.thinkUntil = this.time.now + 2800;
        markInput();
    }

    private footsteps(time: number) {
        if (!state.sound || !this.player.moving || time - this.lastStepAt < 300) return;
        this.lastStepAt = time;
        step(this.def.key === 'dorm' ? 'carpet' : 'wood');
    }

    private checkDoors() {
        if (this.busy) return;
        for (const door of this.def.doors) {
            const { top, bottom } = this.doorPx(door);
            const y = this.player.y;
            if (y < top || y > bottom + 2) continue;
            if (door.side === 'right' && this.player.x >= FLOOR_X + FLOOR_W - 1) { this.goThrough(door); return; }
            if (door.side === 'left' && this.player.x <= FLOOR_X + 1) { this.goThrough(door); return; }
        }
    }

    /** One item, one standing spot; nearest wins, with hysteresis. The cat only if nothing static is in range. */
    private pickFocus(): Target | null {
        const px = this.player.x, py = this.player.y;
        if (this.pinned) {
            const t = this.pinned;
            const d = t.def?.target === 'cat' && this.cat ? Math.hypot(this.cat.x - px, this.cat.y - py) : Math.hypot(t.spot.x - px, t.spot.y - py);
            if (d <= (t.def?.target === 'cat' ? CAT_ZONE + 6 : ZONE_EXIT)) return t;
            this.pinned = null;
        }
        const fv = FACING_VEC[this.player.facing];
        let best: Target | null = null, bestScore = Infinity, currentScore = Infinity;
        let catT: Target | null = null;
        for (const t of this.targets) {
            if (t.def?.target === 'cat') { catT = t; continue; }
            const d = Math.hypot(t.spot.x - px, t.spot.y - py);
            const limit = t === this.focus ? ZONE_EXIT : ZONE_ENTER;
            if (d > limit) continue;
            const b = t.sprite.getBounds();
            const ox = Phaser.Math.Clamp(px, b.left, b.right) - px;
            const oy = Phaser.Math.Clamp(py - 4, b.top, b.bottom) - (py - 4);
            const ol = Math.hypot(ox, oy) || 1;
            const dot = (ox * fv.x + oy * fv.y) / ol;
            if (t.kind !== 'door' && dot < -0.3) continue;
            const score = d - dot * 3;
            if (t === this.focus) currentScore = score;
            if (score < bestScore) { bestScore = score; best = t; }
        }
        if (best && this.focus && currentScore !== Infinity && best !== this.focus && bestScore > currentScore - 3) best = this.focus;
        // the cat wins only when he is nearer than any static item in range
        if (catT && this.cat) {
            const spotD = Math.hypot(catT.spot.x - px, catT.spot.y - py);
            const catD = this.cat.onBed ? spotD : Math.min(spotD, Math.hypot(this.cat.x - px, this.cat.y - py) - 6);
            const limit = this.cat.onBed ? (this.focus === catT ? ZONE_EXIT : ZONE_ENTER + 2) : (this.focus === catT ? CAT_ZONE - 2 : CAT_ZONE - 6);
            const bestD = best ? Math.hypot(best.spot.x - px, best.spot.y - py) : Infinity;
            if (catD <= limit && catD < bestD - (this.focus === catT ? -3 : 3)) return catT;
        }
        return best;
    }

    private updateHighlights(focus: Target | null, time: number) {
        const hint = time < this.hintUntil;
        const blink = Math.floor(time / 160) % 2 === 0;
        const pulse = 0.7 + 0.3 * Math.sin(time / 170);
        const near = (t: Target) => Math.hypot(t.spot.x - this.player.x, t.spot.y - this.player.y) < 56;
        const showMarkers = !this.sleeping && !this.snapping;
        for (const t of this.targets) {
            if (t.def?.target === 'cat' && this.cat) t.spot = this.cat.standingSpot(this.player.x).spot;
            if (t.hl) {
                this.syncHighlight(t);
                const unfound = t.key !== null && !state.found.has(t.key);
                t.hl.setVisible(t === focus || (hint && unfound && blink));
                t.hl.setAlpha(t === focus ? pulse : 0.85);
            }
            if (t.marker && t.marker.visible !== (!!t.key && !state.found.has(t.key) && !(t.def?.target === 'longboard' && this.mode === 'ride'))) this.refreshSeen(t);
            if (t.marker && (!showMarkers || t === focus)) t.marker.setVisible(false);
            if (t.marker?.visible) {
                const b = t.sprite.getBounds();
                const close = near(t) || hint;
                if (t.marker.texture.key !== (close ? 'fx_arrow' : 'fx_arrow_s')) t.marker.setTexture(close ? 'fx_arrow' : 'fx_arrow_s');
                t.marker.setAlpha(close ? 1 : 0.55);
                const bob = this.rm ? 0 : Math.round(Math.sin(time / (close ? 240 : 420) + (t.phase ?? 0)) * (close ? 1.5 : 1));
                t.marker.setPosition(Math.round(b.centerX), Math.round(b.top) - 2 + bob);
            }
        }
    }
}
