import Phaser from 'phaser';
import decorFiles from 'virtual:decor-files';
import {
    CAT_ZONE, FLOOR_H, FLOOR_W, FLOOR_X, FLOOR_Y, RIDE_SPEED, ROOM_H, ROOM_W, TILE, WALK_SPEED, ZONE_ENTER, ZONE_EXIT,
    isTouchDevice, prefersReducedMotion, tx, ty
} from '../config';
import { ABOUT_KEY, completion, contentKey, getEntry, profile, ui, type Entry, type RoomKey } from '../content';
import { hlKey } from '../assets/manifest';
import { DANIEL_FRAMES } from '../assets/placeholders';
import { ROOMS } from '../rooms';
import type { ActionKind, DoorDef, Facing, InteractableDef, LabelDef, RoomDef } from '../rooms/types';
import { bus, SECRETS, state, type GameMode, type SecretKey } from '../state';
import { Player, FACING_VEC, OUTFITS } from '../game/Player';
import { Cat } from '../game/Cat';
import { Lighting } from '../game/Lighting';
import { NavGrid, type Pt, type Rect } from '../game/nav';
import { chargeHeld, lastInputAt, markInput, moveVector, onAction, setChargeCapture, userInputAt, type Action } from '../ui/input';
import { Basketball } from '../game/Basketball';
import { CAFFEINE_BOOST, CAFFEINE_MAX, SLEEP_MAX, SLEEP_TICK_MS, hintGap, session } from '../game/session';
import type { TimeOfDay } from '../game/Lighting';
import { closePanel, openPanel } from '../ui/panel';
import {
    setStat, hideBubble, maybeSuggestQuickView, moveBubble, setPortrait, setPrompt, setWakeButton, showBubble, showMessage, showTitle, toast,
    type PromptSpec
} from '../ui/hud';
import { flash, openPhoneCard, openPiano, openSnapshot } from '../ui/overlays';
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
    /** In bed for a nap (stats clock stops). */
    private napping = false;
    /** When Daniel set off for bed by himself at Sleep 0 (0 = not walking there). */
    private autoBedAt = 0;
    private needUntil = 0;
    /** Soft glow on the fridge (Red Bull hints) or a bed (tired). */
    private beacons = new Map<Target, Phaser.GameObjects.Image>();
    /** Dorm mini basketball (group D6). */
    private ball: Basketball | null = null;
    private charge = { on: false, p: 0, sweet: 0.5, width: 0.1 };
    private meter: Phaser.GameObjects.Graphics | null = null;
    private tallyText: Phaser.GameObjects.Text | null = null;

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
        this.napping = false;
        this.autoBedAt = 0;
        this.needUntil = 0;
        this.beacons = new Map();
        this.ball = null;
        this.perchMs = 0;
        this.nextKnockMs = 12000 + Math.random() * 13000;
        this.fallen = new Set();
        this.charge = { on: false, p: 0, sweet: 0.5, width: 0.1 };
        this.meter = null;
        this.tallyText = null;
        setChargeCapture(false);
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
        if (this.def.hoop) this.makeBall();
        this.buildTargets();

        const src = this.textures.get('daniel').getSourceImage() as CanvasImageSource;
        setPortrait(src, 1, 0, 15, 13);

        this.fitCamera();
        this.scale.on('resize', this.fitCamera, this);
        document.fonts?.ready.then(() => { if (this.scene.isActive()) this.fitCamera(); });

        this.offs.push(onAction((a) => this.onAction(a)));
        this.offs.push(bus.on('modal', (m) => {
            if (m) {
                this.player.cancelPath(); this.autoBedAt = 0;
                if (this.mode === 'free' || this.mode === 'ride') this.player.stop();
                setPrompt(null);
                // bubbles never sit over a panel
                hideBubble('say'); hideBubble('need'); this.sayUntil = 0; this.needUntil = 0;
            }
        }));
        this.offs.push(bus.on('travel', () => this.travel()));
        this.offs.push(bus.on('awake', () => requestAnimationFrame(() => this.fitCamera())));
        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.events.once('shutdown', () => {
            this.offs.forEach((f) => f()); this.offs = [];
            this.scale.off('resize', this.fitCamera, this);
            this.zTimer?.remove();
            // the ball stays where it came to rest for the rest of the visit (home if it was held or flying)
            if (this.ball) session.ball = this.ball.state === 'rest' ? { x: this.ball.x, y: this.ball.y } : null;
            setChargeCapture(false);
            stopFeatured();
            stopAmbient();
            ['say', 'think', 'act', 'cat', 'need'].forEach(hideBubble);
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
            // slots with words (duck poster, hoodie logo) get a sharper copy of the image laid over the pixels
            const sharpKey = `${p.texture}#sharp`;
            if (this.textures.exists(sharpKey)) {
                const sd = this.textures.get(sharpKey).customData as { x: number; y: number; n: number };
                this.add.image(img.x + sd.x, img.y + sd.y, sharpKey).setOrigin(0).setScale(1 / sd.n).setDepth(depth + 0.00005);
            }
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
        const perches = (this.def.perches ?? []).map((p) => ({
            on: p.on, from: { x: tx(p.from.x), y: ty(p.from.y) },
            path: [{ x: tx(p.path[0].x), y: ty(p.path[0].y) }, { x: tx(p.path[1].x), y: ty(p.path[1].y) }] as [Pt, Pt],
            depth: (this.sprites.get(p.on)?.depth ?? 0) + 0.05
        }));
        this.cat = new Cat(this, {
            waypoints: this.def.catWaypoints!, avoid, nap: this.def.catNap,
            bedDepth: bed?.depth,
            perches,
            onPerch: (on, x, y, dt) => this.mischief(on, x, y, dt),
            freeNear: (p) => this.nav.nearestFreePoint(p)
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
            if (l.ink) this.inkCentre(t, l.text);
            this.labels.push(t);
        });
        this.buildTally(R);
    }

    /**
     * Moves the pivot from the font box centre to the centre of the letters themselves (fonts leave room for
     * accents and descenders), so a title sits exactly in the middle of its spine at any angle.
     */
    private inkCentre(t: Phaser.GameObjects.Text, text: string) {
        const ctx = t.context;
        t.style.syncFont(t.canvas, ctx);
        const m = ctx.measureText(text);
        const fm = t.getTextMetrics();
        const w = t.width, h = t.height;
        if (!w || !h) return;
        // the text is drawn left aligned from padding 0 with its baseline at fm.ascent
        const inkCx = (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
        const inkCy = fm.ascent + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2;
        t.setOrigin(Phaser.Math.Clamp(inkCx / w, 0, 1), Phaser.Math.Clamp(inkCy / h, 0, 1));
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
        const hud = [...document.querySelectorAll<HTMLElement>('.hud-top-left > *, .hud-top-right > *, .plain-link')]
            .map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
        const canvas = this.game.canvas.getBoundingClientRect();
        const items = this.targets.map((t) => t.sprite.getBounds());
        // the right hand button column never sits over the room at all (iteration 5); the rest only must not cover items
        const col = document.querySelector('.hud-top-right')?.getBoundingClientRect();
        // a few px of air, and room for the camera's whole pixel rounding
        const column = col && new DOMRect(col.left - 8, col.top, col.width + 8, col.height);
        const room = { x: 0, y: 0, width: ROOM_W, height: ROOM_H };
        const over = (b: { x: number; y: number; width: number; height: number }, z: number, ox: number, oy: number, rs: DOMRect[]) => {
            const x = canvas.left + ox + b.x * z, y = canvas.top + oy + b.y * z, bw = b.width * z, bh = b.height * z;
            return rs.some((r) => x < r.right && x + bw > r.left && y < r.bottom && y + bh > r.top);
        };
        const hits = (z: number, ox: number, oy: number) =>
            items.some((b) => over(b, z, ox, oy, hud)) || (!!column && column.width > 0 && over(room, z, ox, oy, [column]));
        const steps: number[] = [];
        if (fit >= 3) for (let z = Math.floor(fit); z >= 2; z--) steps.push(z);
        else for (let z = Math.floor(fit * 8) / 8; z >= 0.5; z -= 0.125) steps.push(z);
        let chosen: { z: number; ox: number; oy: number } | null = null;
        for (const z of steps) {
            const sx = w - ROOM_W * z, sy = h - ROOM_H * z;
            const tries: [number, number][] = [];
            // nearest to centred first, in 2 px steps sideways, so the room slides only as far as it must
            const dxs: number[] = [0];
            for (let k = 2; k <= sx / 2; k += 2) dxs.push(-k, k);
            for (let dy = 0; dy <= sy / 2; dy += 4) for (const dx of dxs) tries.push([dx, dy]);
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
            else if (this.mode === 'ball') this.dropBall();
            return;
        }
        if (a === 'dunk') { if (this.mode === 'ball' && this.canAct()) this.dunk(); return; }
        if (a !== 'act' && a !== 'info') return;
        if (this.sleeping) { this.wake(); return; }
        if (!this.canAct()) return;
        if (this.mode === 'pullup') { if (a === 'act') this.rep(); return; }
        if (this.mode === 'sit') { if (a === 'act') this.standUp(); return; }
        if (this.mode === 'ride') { if (a === 'act') this.dismount(); return; }
        if (this.mode === 'ball') { this.dropBall(); return; }
        if (this.mode !== 'free') return;
        const t = this.focus;
        if (!t) return;
        if (t.kind === 'door') { this.goThrough(t.door!); return; }
        if (a === 'act' && t.def?.action) this.doAction(t, t.def.action);
        else if (a === 'info' && t.def?.info) this.openInfo(t);
        else if (a === 'info' && t.def?.action === 'phone') this.openPhone(t);
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
        if (this.mode === 'ball') { if (!this.charge.on) this.walkToPoint(w.x, w.y); return; }
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
            piano: ui.verbs.piano, pet: ui.verbs.pet, ride: ui.verbs.ride, eat: ui.verbs.eat, drink: ui.verbs.drink, nap: ui.verbs.nap,
            pickup: ui.verbs.pickup, phone: ui.verbs.phone
        };
        return map[a];
    }

    private doAction(t: Target, a: ActionKind) {
        this.pinned = null;
        // every E action counts toward Secrets the first time, except sleeping
        const id = t.def?.id === 'ball' ? 'basketball' : t.def?.id;
        if (a !== 'nap' && id && (SECRETS as readonly string[]).includes(id)) state.markSecret(id as SecretKey);
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
            case 'drink': this.drinkRedBull(t); break;
            case 'nap': this.napInBed(t); break;
            case 'pickup': this.pickUpBall(); break;
            case 'phone': this.openPhone(t); break;
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
        showBubble('act', ui.outfits[state.outfit] ?? ui.outfitPuff, 'small');
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

    /**
     * E at either bed: lights down, a short sleep with Zs, the window moves on to the next time of day,
     * then the intro wake up. Sleep fills back to 8/8.
     */
    private napInBed(t: Target) {
        const s = this.def.sleep;
        if (!s) { this.sitDown(t); return; }
        const fast = this.rm;
        this.busy = true;
        this.napping = true;
        this.autoBedAt = 0;
        this.player.cancelPath();
        this.player.stop();
        ['say', 'think', 'need'].forEach(hideBubble);
        this.sayUntil = this.needUntil = 0;
        const level = { dark: this.lighting.baseDark, light: 1, glow: 0 };
        const relight = () => this.lighting.set(level.dark, level.light, level.glow, this.sleeperAt());
        // lights down
        this.tweens.add({ targets: level, dark: 0.97, light: 0, glow: 0.55, duration: fast ? 80 : 700, ease: 'Sine.easeInOut', onUpdate: relight });
        let sleeper: Phaser.GameObjects.Sprite | null = null;
        this.time.delayedCall(fast ? 40 : 380, () => {
            this.player.sprite.setVisible(false);
            sleeper = this.add.sprite(tx(s.x), ty(s.y), s.home ? 'daniel_sleep_home' : 'daniel_sleep', 0).setOrigin(0).setDepth(9050);
            sleeper.anims.play(s.home ? 'sleep_home' : 'sleep');
            this.sleepSprite = sleeper;
            this.puffZ();
            this.zTimer = this.time.addEvent({ delay: 700, loop: true, callback: () => this.puffZ() });
        });
        // wake up the same way as the intro: a wiggle, the window light, then the lamps, then hop out
        this.time.delayedCall(fast ? 300 : 2400, () => {
            this.zTimer?.remove();
            if (!sleeper) return;
            const sl = sleeper;
            // time passes while he sleeps: the window and its light move on one step
            session.todShift++;
            this.lighting.setTod(((this.lighting.tod + 1) % 3) as TimeOfDay);
            const win = this.sprites.get('window');
            if (win instanceof Phaser.GameObjects.Image) win.setFrame(this.lighting.tod);
            relight();
            sfx('wake');
            this.tweens.add({
                targets: sl, x: sl.x + 1, duration: 60, yoyo: true, repeat: fast ? 0 : 3,
                onComplete: () => {
                    this.tweens.add({ targets: level, light: 0.6, duration: fast ? 60 : 450, ease: 'Sine.easeIn', onUpdate: relight });
                    this.tweens.add({
                        targets: level, dark: this.lighting.baseDark, light: 1, glow: 0, delay: fast ? 0 : 380, duration: fast ? 100 : 700,
                        ease: 'Sine.easeInOut', onUpdate: relight, onComplete: () => this.lighting.lit()
                    });
                    this.time.delayedCall(fast ? 50 : 300, () => this.hopOutTo(sl, { x: t.spot.x, y: t.spot.y, facing: 'down' }, () => {
                        this.busy = false;
                        this.napping = false;
                        session.sleep = SLEEP_MAX;
                        session.sleepMs = 0;
                        session.tiredHints = 0;
                        setStat('Sleep', session.sleep);
                        this.sayNeed(ui.napLine, 2600);
                        markInput();
                    }));
                }
            });
        });
    }

    /** Hop from the sleep sprite to a floor point (used by the nap). */
    private hopOutTo(sleeper: Phaser.GameObjects.Sprite, to: { x: number; y: number; facing: Facing }, done: () => void) {
        const from = { x: sleeper.x + 7, y: sleeper.y + 12 };
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
                done();
            }
        });
    }

    /** E at the fridge: open it, grab a Red Bull, drink, and Caffeine fills back to the top. */
    private drinkRedBull(t: Target) {
        const fridge = t.sprite as Phaser.GameObjects.Image;
        this.busy = true;
        this.player.cancelPath();
        this.player.stop();
        this.player.face('up');
        fridge.setFrame(1);
        sfx('open');
        this.time.delayedCall(600, () => {
            fridge.setFrame(0);
            sfx('close');
            this.player.face('down');
            this.player.pose(DANIEL_FRAMES.hold);
        });
        this.time.delayedCall(950, () => { sfx('can'); this.showCan(); });
        let sip = 0;
        this.time.delayedCall(1250, () => this.time.addEvent({
            delay: 280, repeat: 5, callback: () => {
                sip++;
                this.player.pose(sip % 2 ? DANIEL_FRAMES.drink : DANIEL_FRAMES.hold);
                if (sip % 2) sfx('gulp');
            }
        }));
        this.time.delayedCall(1250 + 280 * 6 + 200, () => {
            this.player.pose(null);
            this.player.face('down');
            this.busy = false;
            // Caffeine 7/7 for the rest of the visit, and he walks 30% faster (speedModifiers)
            session.caffeine = CAFFEINE_MAX;
            setStat('Caffeine', session.caffeine);
            state.markSecret('fridge');
            this.starBurst();
            this.sayNeed(ui.drinkLine, 2200);
        });
    }

    /** The can pops up above his head for a moment (it carries the can-logo slot), then he drinks. */
    private showCan() {
        const s = this.player.sprite;
        const img = this.add.image(s.x, s.y - 24, 'redbull_can').setOrigin(0.5, 1).setDepth(9075);
        const sharpKey = 'redbull_can#sharp';
        const parts: Phaser.GameObjects.Image[] = [img];
        if (this.textures.exists(sharpKey)) {
            const sd = this.textures.get(sharpKey).customData as { x: number; y: number; n: number };
            parts.push(this.add.image(img.x - 4 + sd.x, img.y - 14 + sd.y, sharpKey).setOrigin(0).setScale(1 / sd.n).setDepth(9076));
        }
        if (this.rm) { this.time.delayedCall(700, () => parts.forEach((p) => p.destroy())); return; }
        parts.forEach((p) => { p.y += 4; p.setAlpha(0); });
        this.tweens.add({ targets: parts, y: '-=4', alpha: 1, duration: 160, ease: 'Back.easeOut' });
        this.tweens.add({ targets: parts, alpha: 0, delay: 650, duration: 200, onComplete: () => parts.forEach((p) => p.destroy()) });
    }

    /** A short burst of pixel stars off Daniel (the Red Bull kicking in). */
    private starBurst() {
        const s = this.player.sprite;
        const n = this.rm ? 4 : 12;
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + Math.random() * 0.3;
            const r = 14 + Math.random() * 8;
            const st = this.add.sprite(s.x, s.y - 12, 'sparkle', i % 2).setDepth(9070)
                .setTint([0xfff3b0, 0xffd447, 0xffffff, 0x9fd8ff][i % 4]);
            this.tweens.add({
                targets: st, x: st.x + Math.cos(a) * r, y: st.y + Math.sin(a) * r * 0.75 - 4, alpha: { from: 1, to: 0 },
                scale: { from: 1, to: 0.6 }, duration: this.rm ? 300 : 650 + Math.random() * 200, ease: 'Quad.easeOut',
                onComplete: () => st.destroy()
            });
        }
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

    // ---------- mini basketball (bonus, group D6) ----------

    private makeBall() {
        const h = this.def.hoop!;
        const rimY = ty(h.rimRow), rimZ = 22;
        // hoop texture: backboard strip x 0..3 (rows 0..30 = heights rimZ+16 down to rimZ), rim centre at (11.5, 23)
        const at = { x: FLOOR_X - 2, y: Math.round(rimY - rimZ - 23) };
        const geom = {
            rimX: at.x + 11.5, rimY, rimZ,
            boardX: at.x + 4, boardHalfY: 7, boardZ0: rimZ - 3, boardZ1: rimZ + 16
        };
        const home = this.nav.nearestFreePoint({ x: tx(h.home.x), y: ty(h.home.y) });
        this.ball = new Basketball(this, geom, at, home, session.ball, {
            solids: this.solids,
            reducedMotion: this.rm,
            sound: (n) => { if (state.sound) sfx(n); },
            onMake: () => this.onBasket(),
            validRest: (x, y) => this.ballRestOk(x, y)
        });
        this.sprites.set('ball', this.ball.sprite);
        if (session.ball && !this.ballRestOk(session.ball.x, session.ball.y)) this.ball.respawn();
    }

    /** A resting ball must be reachable, off every door approach, and not inside furniture. */
    private ballRestOk(x: number, y: number) {
        for (const d of this.def.doors) {
            const { x: dx, top, bottom } = this.doorPx(d);
            const ax = d.side === 'right' ? dx - 16 : dx + 16;
            if (Math.abs(x - ax) < 22 && y > top - 8 && y < bottom + 10) return false;
        }
        if (this.solids.some((s) => x > s.x - 2 && x < s.x + s.w + 2 && y > s.y - 2 && y < s.y + s.h + 2)) return false;
        const spot = this.nav.nearestFreePoint({ x, y: y + 2 });
        if (Math.hypot(spot.x - x, spot.y - y) > 11) return false;
        return !!this.nav.findPath({ x: this.player.x, y: this.player.y }, spot);
    }

    private onBasket() {
        const b = this.ball!;
        b.makes++;
        session.makes = b.makes;
        b.swishNet();
        this.updateTally();
        if (!this.rm) {
            for (let i = 0; i < 6; i++) {
                const sp = this.add.sprite(b.geom.rimX, b.geom.rimY - b.geom.rimZ, 'sparkle', i % 2).setDepth(9070).setTint(0xffd447);
                const a = -Math.PI / 2 + (i - 2.5) * 0.45;
                this.tweens.add({ targets: sp, x: sp.x + Math.cos(a) * 12, y: sp.y + Math.sin(a) * 10, alpha: 0, duration: 500, onComplete: () => sp.destroy() });
            }
        }
        state.markSecret('basketball');
    }

    private buildTally(R: number) {
        this.tallyText?.destroy();
        this.tallyText = null;
        if (!this.ball) return;
        const g = this.ball.geom;
        // on the wall just above the backboard
        this.tallyText = this.add.text(g.rimX - 2, g.rimY - g.rimZ - 27, '', {
            fontFamily: '"Pixelify Sans", ui-monospace, monospace', fontSize: `${4 * R}px`, fontStyle: 'bold',
            color: '#fff6e0', stroke: '#1a1420', strokeThickness: R
        }).setOrigin(0.5, 1).setScale(1 / R).setDepth(8700);
        this.updateTally();
    }

    private updateTally() {
        const b = this.ball;
        if (!b || !this.tallyText) return;
        b.makes = session.makes; b.attempts = session.attempts;
        this.tallyText.setText(ui.tally(b.makes, b.attempts)).setVisible(b.attempts > 0);
    }

    private pickUpBall() {
        const b = this.ball;
        if (!b || !b.canPickUp) return;
        this.player.cancelPath();
        this.player.stop();
        this.setMode('ball');
        setChargeCapture(true);
        this.charge = { on: false, p: 0, sweet: 0.5, width: 0.1 };
        b.hold(this.player.x, this.player.y, this.player.facing);
        sfx('hop');
        showBubble('act', isTouchDevice() ? ui.ballHintTouch : ui.ballHint, 'small');
        this.time.delayedCall(2600, () => hideBubble('act'));
    }

    private endBallMode() {
        setChargeCapture(false);
        this.charge.on = false;
        this.meter?.clear();
        this.setMode('free');
    }

    private dropBall() {
        if (this.mode !== 'ball' || !this.ball) return;
        this.endBallMode();
        this.ball.drop(this.player.x, this.player.y, this.player.facing);
        hideBubble('act');
    }

    /** Holding the ball: walk around, hold Space (or the touch button) to charge, release to shoot. */
    private updateBallMode(dt: number) {
        const b = this.ball!;
        const held = chargeHeld();
        if (held && !this.charge.on) {
            this.charge = { on: true, p: 0, sweet: b.sweetSpot(this.player.x, this.player.y), width: b.sweetWidth(this.player.x, this.player.y) };
            hideBubble('act');
        }
        if (this.charge.on) {
            this.player.update({ x: 0, y: 0 }, dt, this.walkSpeed());
            const dx = b.geom.rimX - this.player.x, dy = b.geom.rimY - this.player.y;
            this.player.face(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
            this.charge.p = Math.min(1, this.charge.p + dt / 1000);
            this.drawMeter();
            if (!held) this.shootBall();
        } else {
            this.player.update(moveVector(), dt, this.walkSpeed());
        }
        if (this.mode === 'ball') b.hold(this.player.x, this.player.y, this.player.facing);
        this.checkDoors();
        this.updateHighlights(null, this.time.now);
        const extra = !this.charge.on && b.canDunk(this.player.x, this.player.y)
            ? { key: ui.keyDunk, label: ui.verbs.dunk, action: 'dunk' as const } : undefined;
        this.promptAtPlayer(isTouchDevice()
            ? { hold: { key: 'Space', label: ui.verbs.shootTouch }, info: ui.verbs.drop, extra }
            : { hold: { key: 'Space', label: ui.verbs.shoot }, act: ui.verbs.drop, extra });
    }

    /**
     * R near the hoop: Daniel jumps with the ball overhead, carries it up over the rim, slams it through and
     * lands where he took off. Like the pull ups, the body is switched off while the sprite moves, so the jump
     * can never push him into a wall or furniture.
     */
    private dunk() {
        const b = this.ball;
        if (!b || this.charge.on || !b.canDunk(this.player.x, this.player.y)) return;
        const g = b.geom;
        const x0 = this.player.x, y0 = this.player.y;
        this.endBallMode();
        hideBubble('act');
        setPrompt(null);
        this.busy = true;
        this.player.cancelPath();
        this.player.stop();
        const dx = g.rimX - x0;
        this.player.face(Math.abs(dx) > Math.abs(g.rimY - y0) ? (dx > 0 ? 'right' : 'left') : 'up');
        this.body().enable = false;
        this.player.pose(DANIEL_FRAMES.cheer);
        this.player.squash();
        sfx('hop');
        const s = this.player.sprite;
        const lift = { h: 0, k: 0 };
        const place = () => {
            s.setY(y0 - lift.h);
            // the ball rides above his hands, then over to the rim
            const hx = x0, hz = 22 + lift.h;
            b.carry(Phaser.Math.Linear(hx, g.rimX, lift.k), Phaser.Math.Linear(y0, g.rimY, lift.k),
                Phaser.Math.Linear(hz, g.rimZ + 6, lift.k), y0 + 1);
        };
        place();
        this.tweens.add({
            targets: lift, h: 16, k: 1, duration: this.rm ? 120 : 280, ease: 'Quad.easeOut', onUpdate: place,
            onComplete: () => {
                b.dunk();
                session.attempts = b.attempts;
                this.updateTally();
                this.player.pose(DANIEL_FRAMES.hang);
                this.tweens.add({
                    targets: lift, h: 0, delay: this.rm ? 60 : 180, duration: this.rm ? 120 : 240, ease: 'Quad.easeIn',
                    onUpdate: () => s.setY(y0 - lift.h),
                    onComplete: () => {
                        this.player.pose(null);
                        this.player.teleport(x0, y0);
                        this.body().enable = true;
                        this.player.squash();
                        sfx('hop');
                        this.busy = false;
                        this.setMode('free');
                    }
                });
            }
        });
    }

    private shootBall() {
        const b = this.ball!;
        const p = this.charge.p;
        this.endBallMode();
        b.shoot(this.player.x, this.player.y, p);
        session.attempts = b.attempts;
        this.updateTally();
        this.player.pose(DANIEL_FRAMES.cheer);
        sfx('hop');
        this.time.delayedCall(260, () => { if (this.mode === 'free') this.player.pose(null); });
    }

    /** The power meter beside Daniel: a gold fill and the green sweet spot window for this distance. */
    private drawMeter() {
        this.meter ??= this.add.graphics().setDepth(9080);
        const g = this.meter;
        const H = 18, W = 4;
        const x = Math.round(this.player.x + 10), y = Math.round(this.player.y - 24);
        g.clear();
        g.fillStyle(0x1a1420, 1).fillRect(x - 1, y - 1, W + 2, H + 2);
        g.fillStyle(0x3a3346, 1).fillRect(x, y, W, H);
        const s0 = Math.max(0, this.charge.sweet - this.charge.width), s1 = Math.min(1, this.charge.sweet + this.charge.width);
        g.fillStyle(0x5fd16a, 1).fillRect(x, Math.round(y + H - s1 * H), W, Math.max(1, Math.round((s1 - s0) * H)));
        const fh = Math.round(this.charge.p * H);
        g.fillStyle(0xffd447, 0.9).fillRect(x + 1, y + H - fh, W - 2, fh);
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

    // ---------- Fluffy's mischief (group E9) ----------

    private perchMs = 0;
    private nextKnockMs = 12000 + Math.random() * 13000;
    private fallen = new Set<string>();

    /**
     * While Fluffy is up on furniture: about one knock every minute or two. Returns the x of the decor item he
     * swats at, if one is in reach and a knock is due. Only `knockables` (decor) ever move.
     */
    private mischief(on: string, x: number, y: number, dt: number): number | null {
        this.perchMs += dt;
        if (this.perchMs < this.nextKnockMs || state.modal) return null;
        const ids = (this.def.knockables ?? []).filter((id) => !this.fallen.has(id) && this.def.props.find((p) => p.id === id)?.on === on);
        for (const id of ids) {
            const s = this.sprites.get(id);
            if (!s || this.tweens.isTweening(s)) continue;
            const cx = s.x + s.displayWidth / 2, by = s.y + s.displayHeight;
            if (Math.abs(cx - x) > 11 || Math.abs(by - y) > 15) continue;
            this.nextKnockMs = this.perchMs + 60000 + Math.random() * 60000;
            const dir = cx >= x ? 1 : -1;
            this.time.delayedCall(220, () => this.knockItem(id, s, on, dir));
            return cx;
        }
        return null;
    }

    /** Push it off onto a safe floor spot, or (if there is none, or sometimes) just nudge it along the top. */
    private knockItem(id: string, s: Sprite, on: string, dir: number) {
        const land = Math.random() < 0.75 ? this.landingSpot(s) : null;
        if (!land) {
            const top = this.sprites.get(on)!;
            const nx = Phaser.Math.Clamp(s.x + dir * (4 + Math.random() * 4), top.x + 2, top.x + top.displayWidth - s.displayWidth - 2);
            this.tweens.add({ targets: s, x: Math.round(nx), duration: 220, ease: 'Quad.easeOut' });
            this.tweens.add({ targets: s, y: s.y - 2, duration: 110, yoyo: true });
            sfx('tick');
            return;
        }
        this.fallen.add(id);
        const from = { x: s.x, y: s.y }, to = { x: Math.round(land.x - s.displayWidth / 2), y: Math.round(land.y - s.displayHeight) };
        const prog = { t: 0 };
        s.setDepth(9000 - 1);
        this.tweens.add({
            targets: prog, t: 1, duration: this.rm ? 120 : 480, ease: 'Quad.easeIn',
            onUpdate: () => {
                s.setPosition(Math.round(from.x + (to.x - from.x) * prog.t), Math.round(from.y + (to.y - from.y) * prog.t - Math.sin(prog.t * Math.PI) * 8));
                s.setAngle(prog.t * dir * 70);
            },
            onComplete: () => {
                s.setDepth(land.y);
                sfx('bump');
                if (!this.rm) this.tweens.add({ targets: s, y: s.y - 2, duration: 90, yoyo: true, ease: 'Quad.easeOut' });
            }
        });
    }

    /**
     * A floor spot for a knocked off item: on the floor, out of furniture, close to furniture (so not out in a
     * walkway), at least 20 px from every standing spot and well clear of door approaches. Null if none nearby.
     */
    private landingSpot(s: Sprite): Pt | null {
        const cx = s.x + s.displayWidth / 2, by = s.y + s.displayHeight;
        const spots = this.targets.filter((t) => t.kind === 'item' && t.def?.target !== 'cat' && t.def?.target !== 'longboard').map((t) => t.spot);
        const doors = this.def.doors.map((d) => { const { x, top, bottom } = this.doorPx(d); return { x: d.side === 'right' ? x - 16 : x + 16, y: (top + bottom) / 2 }; });
        const nearSolid = (x: number, y: number) => Math.min(...this.solids.map((r) =>
            Math.hypot(Math.max(r.x - x, 0, x - (r.x + r.w)), Math.max(r.y - y, 0, y - (r.y + r.h)))));
        let best: Pt | null = null, bestD = Infinity;
        for (let dy = -44; dy <= 48; dy += 3) for (let dx = -44; dx <= 44; dx += 3) {
            const x = cx + dx, y = by + dy;
            if (x < FLOOR_X + 5 || x > FLOOR_X + FLOOR_W - 5 || y < FLOOR_Y + 6 || y > FLOOR_Y + FLOOR_H - 2) continue;
            if (this.solids.some((r) => x > r.x - 5 && x < r.x + r.w + 5 && y > r.y - 2 && y < r.y + r.h + 3)) continue;
            if (spots.some((p) => Math.hypot(p.x - x, p.y - y) < 20)) continue;
            if (doors.some((p) => Math.abs(p.x - x) < 30 && Math.abs(p.y - y) < 36)) continue;
            if (nearSolid(x, y) > 14) continue;
            const d = Math.hypot(dx, dy);
            if (d < bestD) { bestD = d; best = { x, y }; }
        }
        return best;
    }

    private openPhone(t: Target) {
        this.bounce(t.sprite);
        sfx('tick');
        state.markSecret('phone');
        if (this.cat) this.cat.held = true;
        const logo = profile.instagram.logo ?? null;
        openPhoneCard(logo, () => { if (this.cat) this.cat.held = false; });
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
        if (this.mode === 'ball') { this.endBallMode(); this.ball?.respawn(); }
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
        if (this.ball && !state.modal) this.ball.update(dt);
        this.animateSpeaker(time);
        this.updateCamera(dt);
        this.tickNeeds(dt);
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
            case 'ball':
                this.updateBallMode(dt);
                return;
        }

        this.player.update(moveVector(), dt, this.walkSpeed());
        if (!this.canAct()) { setPrompt(null); this.updateHighlights(null, time); return; }
        this.footsteps(time);
        this.checkDoors();
        const f = this.pickFocus();
        this.focus = f;
        this.updateHighlights(f, time);
        if (f && f.kind === 'door') {
            // the sign already says where it goes: a short "E Go in" beside Daniel, on the room side, clear of the sign
            const right = f.door!.side === 'right';
            const p = this.toPage(this.player.x + (right ? -9 : 9), this.player.y - 6);
            setPrompt({ act: ui.verbs.goIn }, p.x, p.y, right ? 'end' : 'start');
            this.promptAtHead = false;
        } else if (f) {
            const spec: PromptSpec = {
                act: this.verb(f),
                info: f.def?.info ? getEntry(this.def.key, f.def.info).prompt : f.def?.action === 'phone' ? ui.phoneInfo : undefined
            };
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

    // ---------- stats: Caffeine, Sleep (iteration 5, group B) ----------

    /** Say a short stats line in a small bubble just above Daniel's head. */
    private sayNeed(text: string, ms = 3200) {
        showBubble('need', text, 'need');
        this.needUntil = this.time.now + ms;
        session.lastLineAt = session.activeMs;
    }

    /** Free to talk: awake, no panel, no mode, not mid action. */
    private canChat() {
        return state.awake && !state.modal && !this.sleeping && !this.busy && this.mode === 'free' && !this.sayUntil && !this.needUntil;
    }

    /**
     * Runs every frame. Counts active play (no panel open; a hidden tab pauses the whole loop), drains Sleep,
     * says the Red Bull and tired lines, keeps the glows in sync, and walks Daniel to bed at Sleep 0 when idle.
     */
    private tickNeeds(dt: number) {
        const active = state.awake && !state.modal && !this.sleeping && !this.napping;
        if (active) {
            session.activeMs += dt;
            session.sleepMs += dt;
            if (session.sleepMs >= SLEEP_TICK_MS && session.sleep > 0) {
                session.sleepMs = 0;
                session.sleep--;
                setStat('Sleep', session.sleep);
                if (session.sleep === 2) session.nextTiredHintAt = session.activeMs + 4000;
                if (session.sleep === 0 && this.canChat()) this.sayNeed(ui.needs.mustSleep);
            }
        }
        const roomy = session.activeMs - session.lastLineAt > 8000;
        if (active && roomy && this.canChat()) {
            if (!session.caffeinated && session.caffeineHints < 4 && session.activeMs >= session.nextCaffeineHintAt) {
                const lines = ui.needs.caffeine;
                this.sayNeed(lines[session.caffeineHints % lines.length]);
                session.caffeineHints++;
                session.nextCaffeineHintAt = session.activeMs + hintGap();
            } else if (session.tired && session.tiredHints < 4 && session.activeMs >= session.nextTiredHintAt) {
                const lines = ui.needs.tired;
                this.sayNeed(lines[session.tiredHints % lines.length]);
                session.tiredHints++;
                session.nextTiredHintAt = session.activeMs + hintGap();
            }
        }
        this.syncBeacons();
        this.autoBed();
    }

    private bedTarget() { return this.targets.find((t) => t.def?.action === 'nap') ?? null; }

    /** At Sleep 0, once the visitor has left the controls alone for 3 seconds, Daniel heads to bed by himself. */
    private autoBed() {
        const now = performance.now();
        if (this.autoBedAt) {
            // any key, click or tap gives control straight back; he tries again after the next idle stretch
            if (userInputAt > this.autoBedAt || state.modal) { this.autoBedAt = 0; this.player.cancelPath(); this.player.stop(); }
            else if (!this.player.walkingPath && !this.napping && !this.busy) this.autoBedAt = 0;
            return;
        }
        if (session.sleep > 0 || !state.awake || state.modal || this.sleeping || this.busy || this.mode !== 'free') return;
        if (now - userInputAt < 3000 || this.player.walkingPath) return;
        const bed = this.bedTarget();
        if (!bed) return;
        this.autoBedAt = now;
        if (!this.needUntil) this.sayNeed(ui.needs.mustSleep, 2200);
        const path = this.nav.findPath({ x: this.player.x, y: this.player.y }, bed.spot);
        if (!path) { this.autoBedAt = 0; return; }
        this.player.walkTo(path, () => { this.autoBedAt = 0; this.faceTarget(bed); this.doAction(bed, 'nap'); });
    }

    /** Soft pulsing glow: the fridge after the first Red Bull hint until he drinks; the bed while Sleep is low. */
    private syncBeacons() {
        const want = new Set<Target>();
        const fridge = this.targets.find((t) => t.def?.action === 'drink');
        if (fridge && session.fridgeGlow) want.add(fridge);
        const bed = this.bedTarget();
        if (bed && session.tired && !this.napping) want.add(bed);
        for (const [t, g] of this.beacons) if (!want.has(t)) { g.destroy(); this.beacons.delete(t); }
        for (const t of want) {
            if (this.beacons.has(t)) continue;
            const b = t.sprite.getBounds();
            const g = this.add.image(b.centerX, b.centerY, 'glow').setDepth(9001).setBlendMode(Phaser.BlendModes.ADD)
                .setTint(0xffc860).setScale((b.width + 24) / 36, (b.height + 20) / 36).setAlpha(0.22);
            if (!this.rm) this.tweens.add({ targets: g, alpha: 0.5, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.beacons.set(t, g);
        }
        const hide = this.sleeping || this.napping;
        for (const g of this.beacons.values()) g.setVisible(!hide);
    }

    /** Every multiplier on walking speed lives here, so the debug overlay can list them. */
    speedModifiers(): { name: string; mult: number }[] {
        return session.caffeinated ? [{ name: 'caffeine', mult: CAFFEINE_BOOST }] : [];
    }

    walkSpeed() {
        return this.speedModifiers().reduce((s, m) => s * m.mult, WALK_SPEED);
    }

    /** For the dev overlay: what is currently shaping movement. */
    debugInfo() {
        const b = this.player.sprite.body as Phaser.Physics.Arcade.Body;
        const flags = [
            this.mode !== 'free' ? `mode ${this.mode}` : '',
            this.busy ? 'busy' : '', this.sleeping ? 'asleep' : '', state.modal ? `modal ${state.modal}` : '',
            this.player.walkingPath ? 'click-walk' : '', this.player.isPosed ? 'posed' : ''
        ].filter(Boolean);
        return {
            x: this.player.x, y: this.player.y,
            velocity: Math.hypot(b.velocity.x, b.velocity.y),
            target: this.mode === 'ride' ? RIDE_SPEED : this.walkSpeed(),
            modifiers: this.speedModifiers(), flags
        };
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
        if (this.needUntil && (now > this.needUntil || state.modal || this.napping)) { hideBubble('need'); this.needUntil = 0; }
        const head = this.toPage(this.player.x, this.player.sprite.getBounds().top - 2);
        if (this.promptAtHead) head.y -= 40;
        moveBubble('say', head.x, head.y);
        moveBubble('think', head.x, head.y);
        moveBubble('act', head.x, head.y);
        moveBubble('need', head.x, head.y);
        if (this.cat) { const c = this.toPage(this.cat.x, this.cat.y - 14); moveBubble('cat', c.x, c.y); }
    }

    private idleThoughts() {
        if (state.modal || this.busy || this.thinkUntil || this.sayUntil || this.needUntil || this.autoBedAt || !profile.idleThoughts.length) return;
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
            if (t.def?.target === 'ball' && !this.ball?.canPickUp) continue;
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
            const up = this.cat.elevated;
            const catD = up ? spotD : Math.min(spotD, Math.hypot(this.cat.x - px, this.cat.y - py) - 6);
            const limit = up ? (this.focus === catT ? ZONE_EXIT : ZONE_ENTER + 2) : (this.focus === catT ? CAT_ZONE - 2 : CAT_ZONE - 6);
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
            if (t.def?.target === 'ball' && this.ball) t.spot = this.ball.pickupPoint();
            const beacon = this.beacons.has(t);
            if (t.hl) {
                this.syncHighlight(t);
                const unfound = t.key !== null && !state.found.has(t.key);
                t.hl.setVisible(t === focus || (hint && unfound && blink) || (beacon && showMarkers));
                t.hl.setAlpha(t === focus ? pulse : hint && unfound ? 0.85 : 0.5 + 0.25 * Math.sin(time / 420));
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
