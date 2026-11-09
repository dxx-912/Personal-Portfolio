import Phaser from 'phaser';
import {
    CAT_ZONE, FLOOR_H, FLOOR_W, FLOOR_X, FLOOR_Y, ROOM_H, ROOM_W, TILE, VIEW_MARGIN, ZONE_ENTER, ZONE_EXIT,
    isTouchDevice, prefersReducedMotion, tx, ty
} from '../config';
import { completion, contentKey, getEntry, ui, type Entry, type RoomKey } from '../content';
import { hlKey } from '../assets/manifest';
import { ROOMS } from '../rooms';
import type { DoorDef, InteractableDef, RoomDef } from '../rooms/types';
import { bus, state } from '../state';
import { Player, FACING_VEC } from '../game/Player';
import { Cat } from '../game/Cat';
import { NavGrid, type Pt, type Rect } from '../game/nav';
import { moveVector, onAction } from '../ui/input';
import { closePanel, openPanel } from '../ui/panel';
import { setPrompt, showCounter, showMessage, toast } from '../ui/hud';
import { sfx } from '../audio';

type Entry_ = 'sleep' | 'wake' | RoomKey;

interface Target {
    kind: 'item' | 'door';
    def?: InteractableDef;
    door?: DoorDef;
    /** Counted content key, e.g. "dorm.laptop". Null for decorative and doors. */
    key: string | null;
    sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
    hl?: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
    sparkle?: Phaser.GameObjects.Sprite;
    spot: Pt;
    prompt: string;
}

const DARK = 0x06050b;

export class Room extends Phaser.Scene {
    private def!: RoomDef;
    private entryMode!: Entry_;
    private player!: Player;
    private cat: Cat | null = null;
    private nav!: NavGrid;
    private solids: Rect[] = [];
    private sprites = new Map<string, Phaser.GameObjects.Image | Phaser.GameObjects.Sprite>();
    private targets: Target[] = [];
    private focus: Target | null = null;
    private sleeping = false;
    private busy = false; // waking, transitioning, or celebrating
    private darkness!: Phaser.GameObjects.RenderTexture;
    private cones: Phaser.GameObjects.Image[] = [];
    private coneTints: Phaser.GameObjects.Image[] = [];
    private glow: Phaser.GameObjects.Image | null = null;
    private sleepSprite: Phaser.GameObjects.Sprite | null = null;
    private zTimer: Phaser.Time.TimerEvent | null = null;
    private hintUntil = 0;
    private offs: (() => void)[] = [];
    private rm = false;

    constructor() { super('Room'); }

    init(data: { room: RoomKey; entry: Entry_ }) {
        this.def = ROOMS[data.room];
        this.entryMode = data.entry;
        state.room = data.room;
        this.solids = [];
        this.sprites.clear();
        this.targets = [];
        this.focus = null;
        this.cones = [];
        this.coneTints = [];
        this.glow = null;
        this.cat = null;
        this.sleepSprite = null;
        this.busy = false;
        this.sleeping = false;
        this.rm = prefersReducedMotion();
    }

    create() {
        this.cameras.main.setBackgroundColor('#06050b');
        this.add.image(0, 0, this.def.background).setOrigin(0).setDepth(0);
        this.buildProps();
        this.buildDoors();
        this.buildWalls();
        this.nav = new NavGrid(this.solids);
        this.buildLights();
        this.buildTargets();

        // player
        const arrival = this.arrivalPoint();
        this.player = new Player(this, arrival.x, arrival.y);
        this.player.face(arrival.facing);
        this.physics.add.collider(this.player.sprite, this.solidBodies());
        this.ensureFree();

        if (this.def.catWaypoints) this.cat = new Cat(this, this.def.catWaypoints);
        this.attachCatTarget();

        this.fitCamera();
        this.scale.on('resize', this.fitCamera, this);

        this.offs.push(onAction((a) => {
            if (a === 'interact') this.onInteract();
            if (a === 'hint') this.showHint();
        }));
        this.offs.push(bus.on('modal', (m) => { if (m) { this.player.cancelPath(); this.player.stop(); setPrompt(null); } }));
        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.events.once('shutdown', () => {
            this.offs.forEach((f) => f()); this.offs = [];
            this.scale.off('resize', this.fitCamera, this);
            this.zTimer?.remove();
            setPrompt(null);
        });

        if (this.entryMode === 'sleep' && this.def.sleep) this.enterSleep();
        else {
            this.setLight(0.2, 1, 0);
            showCounter(true);
            this.cameras.main.fadeIn(this.rm ? 80 : 260, 6, 5, 11);
        }
    }

    // ---------- building ----------

    private buildProps() {
        this.def.props.forEach((p, i) => {
            const img = this.add.image(tx(p.x), ty(p.y), p.texture).setOrigin(0);
            if (p.flipX) img.setFlipX(true);
            const bottom = ty(p.y) + img.height;
            img.setDepth(p.layer === 'wall' ? 1 + i * 0.001 : (p.depthRow !== undefined ? FLOOR_Y + p.depthRow * TILE : bottom));
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
            const img = this.add.image(d.side === 'right' ? x - 2 : x + 2, bottom + 2, 'door_side')
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
        this.wallRects = [];
        add(FLOOR_X - T, FLOOR_Y - T, FLOOR_W + 2 * T, T); // back
        add(FLOOR_X - T, FLOOR_Y + FLOOR_H, FLOOR_W + 2 * T, T); // front
        (['left', 'right'] as const).forEach((side) => {
            const x = side === 'left' ? FLOOR_X - T : FLOOR_X + FLOOR_W;
            const door = this.def.doors.find((d) => d.side === side);
            if (!door) { add(x, FLOOR_Y, T, FLOOR_H); return; }
            const { top, bottom } = this.doorPx(door);
            add(x, FLOOR_Y, T, top - FLOOR_Y);
            add(x, bottom, T, FLOOR_Y + FLOOR_H - bottom);
            // backstop a few pixels into the doorway
            add(side === 'left' ? x - 4 : x + 8, top, T, bottom - top);
        });
    }
    private wallRects: Rect[] = [];

    private solidBodies() {
        return [...this.solids, ...this.wallRects].map((r) => {
            const z = this.add.zone(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h);
            this.physics.add.existing(z, true);
            return z;
        });
    }

    private buildLights() {
        this.def.lights.forEach((l, i) => {
            const key = `cone-${this.def.key}-${i}`;
            if (!this.textures.exists(key)) this.makeConeTexture(key, l.poly.map((p) => ({ x: tx(p.x), y: ty(p.y) })));
            const tint = this.add.image(0, 0, key).setOrigin(0).setDepth(2).setBlendMode(Phaser.BlendModes.ADD).setTint(l.color);
            this.coneTints.push(tint);
            this.cones.push(this.make.image({ x: 0, y: 0, key, add: false }).setOrigin(0));
        });
        if (!this.textures.exists('glow')) this.makeGlowTexture();
        this.darkness = this.add.renderTexture(-VIEW_MARGIN, -VIEW_MARGIN, ROOM_W + VIEW_MARGIN * 2, ROOM_H + VIEW_MARGIN * 2)
            .setOrigin(0).setDepth(9000);
        if (!this.textures.exists('vignette')) this.makeVignette();
        this.add.image(ROOM_W / 2, ROOM_H / 2, 'vignette').setDepth(9100).setAlpha(0.85);
    }

    private makeConeTexture(key: string, poly: Pt[]) {
        const c = document.createElement('canvas');
        c.width = ROOM_W; c.height = ROOM_H;
        const ctx = c.getContext('2d')!;
        const minY = Math.min(...poly.map((p) => p.y)), maxY = Math.max(...poly.map((p) => p.y));
        const g = ctx.createLinearGradient(0, minY, 0, maxY);
        g.addColorStop(0, 'rgba(255,255,255,0.55)');
        g.addColorStop(1, 'rgba(255,255,255,0.08)');
        ctx.fillStyle = g;
        ctx.beginPath();
        poly.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.fill();
        this.textures.addCanvas(key, c);
    }

    private makeGlowTexture() {
        const s = 64;
        const c = document.createElement('canvas');
        c.width = s; c.height = s;
        const ctx = c.getContext('2d')!;
        const g = ctx.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, s);
        this.textures.addCanvas('glow', c);
    }

    private makeVignette() {
        const w = ROOM_W + VIEW_MARGIN * 2, h = ROOM_H + VIEW_MARGIN * 2;
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d')!;
        const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.62);
        g.addColorStop(0, 'rgba(6,5,11,0)');
        g.addColorStop(1, 'rgba(6,5,11,0.75)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        this.textures.addCanvas('vignette', c);
    }

    /** Darkness level (0 lit, 1 black), cone strength (0..1), glow around the sleeper (0..1). */
    private setLight(dark: number, cone: number, glow: number) {
        const rt = this.darkness;
        rt.clear();
        rt.fill(DARK, dark);
        this.cones.forEach((c) => { c.setAlpha(Math.min(1, cone * 1.6)); rt.erase(c, VIEW_MARGIN, VIEW_MARGIN); });
        if (glow > 0 && this.def.sleep) {
            this.glow ??= this.make.image({ x: 0, y: 0, key: 'glow', add: false });
            this.glow.setAlpha(glow).setScale(1.3);
            rt.erase(this.glow, tx(this.def.sleep.x + 0.9) + VIEW_MARGIN, ty(this.def.sleep.y + 0.4) + VIEW_MARGIN);
        }
        this.coneTints.forEach((t) => t.setAlpha(0.22 * cone));
    }

    private buildTargets() {
        const room = this.def.key;
        this.def.interactables.forEach((d) => {
            if (d.kind === 'cat') return; // attached after the cat exists
            const sprite = this.sprites.get(d.target);
            if (!sprite) throw new Error(`Interactable ${d.id} has no prop ${d.target}`);
            const counted = d.kind !== 'say';
            const entry = counted ? getEntry(room, d.id) : null;
            const t: Target = {
                kind: 'item', def: d, key: counted ? contentKey(room, d.id) : null, sprite,
                spot: { x: tx(d.spot.x), y: ty(d.spot.y) },
                prompt: entry ? entry.prompt : (d.prompt ?? '')
            };
            this.decorate(t);
            this.targets.push(t);
        });
        this.def.doors.forEach((door) => {
            const { x, top, bottom } = this.doorPx(door);
            const sprite = this.sprites.get(`door-${door.side}`)!;
            this.targets.push({
                kind: 'door', door, key: null, sprite,
                spot: { x: door.side === 'right' ? x - 9 : x + 9, y: Math.round((top + bottom) / 2) + 4 },
                prompt: door.to === 'home' ? ui.doorToHome : ui.doorToDorm
            });
        });
    }

    private attachCatTarget() {
        const d = this.def.interactables.find((i) => i.kind === 'cat');
        if (!d || !this.cat) return;
        const entry = getEntry(this.def.key, d.id);
        const t: Target = {
            kind: 'item', def: d, key: contentKey(this.def.key, d.id), sprite: this.cat.sprite,
            spot: { x: this.cat.x, y: this.cat.y }, prompt: entry.prompt
        };
        this.decorate(t);
        this.targets.push(t);
    }

    /** Highlight ring and discoverability sparkle. Decorative things never sparkle. */
    private decorate(t: Target) {
        const tex = t.sprite.texture.key;
        if (this.textures.exists(hlKey(tex))) {
            const hl = this.add.sprite(0, 0, hlKey(tex), 0).setVisible(false);
            t.hl = hl;
            this.syncHighlight(t);
        }
        if (t.key) {
            const b = t.sprite.getBounds();
            const sp = this.add.sprite(Math.round(b.centerX), Math.round(b.top) - 3, 'sparkle', 0).setDepth(8000);
            sp.anims.play({ key: 'sparkle', delay: Math.random() * 1500 });
            if (!this.rm && t.def?.kind !== 'cat') this.tweens.add({ targets: sp, y: sp.y - 2, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            t.sparkle = sp;
            this.refreshSeen(t);
        }
    }

    private refreshSeen(t: Target) {
        if (!t.sparkle || !t.key) return;
        const seen = state.found.has(t.key);
        t.sparkle.setAlpha(seen ? 0 : 1);
    }

    private syncHighlight(t: Target) {
        if (!t.hl) return;
        const s = t.sprite as Phaser.GameObjects.Sprite;
        t.hl.setPosition(s.x, s.y);
        t.hl.setOrigin(0, 0);
        t.hl.setDisplayOrigin(s.displayOriginX + 1, s.displayOriginY + 1);
        t.hl.setFlipX(s.flipX);
        if (s.frame && typeof s.frame.name === 'number' && t.hl instanceof Phaser.GameObjects.Sprite) t.hl.setFrame(s.frame.name);
        t.hl.setDepth(s.depth - 0.001);
    }

    private arrivalPoint() {
        const a = this.entryMode === 'sleep' ? this.def.arrivals.wake : this.def.arrivals[this.entryMode];
        const fallback = this.def.arrivals.wake ?? Object.values(this.def.arrivals)[0]!;
        const p = a ?? fallback;
        return { x: tx(p.x), y: ty(p.y), facing: p.facing };
    }

    /** Never trap the player: nudge to the nearest free spot if inside furniture. */
    private ensureFree() {
        if (this.nav.isFree(this.player.x, this.player.y)) return;
        const p = this.nav.nearestFreePoint({ x: this.player.x, y: this.player.y });
        this.player.teleport(p.x, p.y);
    }

    // ---------- camera ----------

    private fitCamera() {
        const cam = this.cameras.main;
        const w = this.scale.width, h = this.scale.height;
        const fit = Math.min(w / (ROOM_W + VIEW_MARGIN * 2), h / (ROOM_H + VIEW_MARGIN * 2 + 24));
        const zoom = fit >= 2 ? Math.floor(fit) : Math.max(0.5, fit);
        cam.setZoom(zoom);
        cam.centerOn(ROOM_W / 2, ROOM_H / 2);
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
        this.player.sprite.setVisible(false);
        const s = this.def.sleep!;
        this.sleepSprite = this.add.sprite(tx(s.x), ty(s.y), 'daniel_sleep', 0).setOrigin(0).setDepth(9050);
        this.sleepSprite.anims.play('sleep');
        this.setLight(0.97, 0, 0.55);
        this.zTimer = this.time.addEvent({ delay: 1100, loop: true, callback: () => this.puffZ() });
        this.puffZ();
        showCounter(false);
        showMessage(isTouchDevice() ? ui.wakeTouch : ui.wakeKeys, 'wake');
        this.cameras.main.fadeIn(this.rm ? 80 : 500, 6, 5, 11);
    }

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
        sfx('wake');
        const fast = this.rm;
        const sleeper = this.sleepSprite!;
        const level = { dark: 0.97, cone: 0, glow: 0.55 };
        const relight = () => this.setLight(level.dark, level.cone, level.glow);

        // 1. stir
        this.tweens.add({
            targets: sleeper, x: sleeper.x + 1, duration: 60, yoyo: true, repeat: fast ? 0 : 3,
            onComplete: () => {
                // 2. window light, then room light
                this.tweens.add({ targets: level, cone: 1, duration: fast ? 60 : 450, ease: 'Sine.easeIn', onUpdate: relight });
                this.tweens.add({
                    targets: level, dark: 0.2, glow: 0, delay: fast ? 0 : 380, duration: fast ? 100 : 650, ease: 'Sine.easeInOut',
                    onUpdate: relight, onComplete: relight
                });
                // 3. hop out of bed
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
                showCounter(true);
                showMessage(isTouchDevice() ? ui.controlsTouch : ui.controlsKeys, 'tip');
                this.time.delayedCall(4500, () => showMessage(null));
            }
        });
    }

    // ---------- input ----------

    private canAct() { return !this.sleeping && !this.busy && !state.modal; }

    private onInteract() {
        if (state.modal) return;
        if (this.sleeping) { this.wake(); return; }
        if (!this.canAct()) return;
        if (this.focus) this.activate(this.focus);
    }

    private hitTest(wx: number, wy: number): Target | null {
        const hits = this.targets.filter((t) => {
            const b = t.sprite.getBounds();
            Phaser.Geom.Rectangle.Inflate(b, 2, 2);
            return b.contains(wx, wy);
        });
        if (!hits.length) return null;
        // topmost first, then smallest (desk items beat the desk area around them)
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
        if (this.sleeping) { this.wake(); return; }
        if (!this.canAct()) return;
        const w = p.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
        const hit = this.hitTest(w.x, w.y);
        if (hit) { this.walkToTarget(hit); return; }
        if (w.x >= FLOOR_X && w.x <= FLOOR_X + FLOOR_W && w.y >= FLOOR_Y - 4 && w.y <= FLOOR_Y + FLOOR_H + 4) {
            const dest = this.nav.nearestFreePoint({ x: w.x, y: w.y + 2 });
            const path = this.nav.findPath({ x: this.player.x, y: this.player.y }, dest);
            if (path) this.player.walkTo(path);
            this.markClick(dest);
        }
    }

    private markClick(p: Pt) {
        if (this.rm) return;
        const r = this.add.rectangle(Math.round(p.x), Math.round(p.y) - 1, 5, 3).setStrokeStyle(1, 0xfff6c8).setDepth(3);
        this.tweens.add({ targets: r, alpha: 0, scale: 1.6, duration: 380, onComplete: () => r.destroy() });
    }

    private walkToTarget(t: Target) {
        let spot = t.spot;
        if (t.def?.kind === 'cat' && this.cat) {
            const side = this.player.x < this.cat.x ? -1 : 1;
            spot = this.nav.nearestFreePoint({ x: this.cat.x + side * 14, y: this.cat.y + 1 });
        }
        const path = this.nav.findPath({ x: this.player.x, y: this.player.y }, spot);
        if (!path) return;
        this.markClick(spot);
        this.player.walkTo(path, () => {
            if (t.kind === 'door') { this.goThrough(t.door!); return; }
            if (t.def?.kind === 'cat' && this.cat) {
                this.player.face(Math.abs(this.cat.x - this.player.x) > Math.abs(this.cat.y - this.player.y)
                    ? (this.cat.x > this.player.x ? 'right' : 'left') : (this.cat.y > this.player.y ? 'down' : 'up'));
            } else if (t.def) this.player.face(t.def.facing);
            this.activate(t);
        });
    }

    // ---------- interactions ----------

    private activate(t: Target) {
        if (t.kind === 'door') { this.goThrough(t.door!); return; }
        const d = t.def!;
        this.player.squash();
        this.bounce(t.sprite);
        sfx('tick');
        if (d.kind === 'say') {
            toast(ui[d.say as 'homeBed'] ?? '');
            return;
        }
        const entry = getEntry(this.def.key, d.id);
        if (d.kind === 'cat') {
            this.petCat();
            this.time.delayedCall(this.rm ? 0 : 500, () => this.open(t, entry));
            return;
        }
        this.open(t, entry);
    }

    private open(t: Target, entry: Entry) {
        const isNew = state.markFound(t.key!);
        if (isNew) sfx('found');
        this.refreshSeen(t);
        if (this.cat) this.cat.held = true;
        openPanel(entry, () => {
            if (this.cat) this.cat.held = false;
            if (state.allFound && !state.celebrated) this.celebrate();
        });
    }

    private bounce(o: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite) {
        if (this.rm) return;
        const y = o.y;
        this.tweens.add({ targets: o, y: y - 2, duration: 70, yoyo: true, ease: 'Quad.easeOut', onComplete: () => o.setY(y) });
    }

    private petCat() {
        if (!this.cat) return;
        sfx('meow');
        this.cat.held = true;
        for (let i = 0; i < (this.rm ? 1 : 4); i++) {
            const h = this.add.image(this.cat.x - 4 + i * 3, this.cat.y - 12, 'fx_heart').setDepth(8500);
            this.tweens.add({
                targets: h, y: h.y - 12 - i * 2, x: h.x + (i % 2 ? 3 : -3), alpha: 0, delay: i * 90, duration: 700,
                onComplete: () => h.destroy()
            });
        }
    }

    private celebrate() {
        state.celebrated = true;
        state.save();
        this.busy = true;
        const s = this.player.sprite;
        const y = s.y;
        if (!this.rm) {
            for (let i = 0; i < 14; i++) {
                const sp = this.add.sprite(s.x, s.y - 10, 'sparkle', 1).setDepth(8600).setTint([0xffe27a, 0x7fd1ff, 0xff8aa8, 0x9dffb0][i % 4]);
                const ang = (i / 14) * Math.PI * 2;
                this.tweens.add({ targets: sp, x: sp.x + Math.cos(ang) * 26, y: sp.y + Math.sin(ang) * 18 - 8, alpha: 0, duration: 900, ease: 'Quad.easeOut', onComplete: () => sp.destroy() });
            }
        }
        this.tweens.add({
            targets: s, y: y - 6, duration: 140, yoyo: true, repeat: this.rm ? 0 : 2, ease: 'Quad.easeOut',
            onComplete: () => {
                s.setY(y);
                this.busy = false;
                openPanel(completion);
            }
        });
    }

    private showHint() {
        if (!this.canAct()) return;
        this.hintUntil = this.time.now + 1600;
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

    update(_time: number, delta: number) {
        const dt = Math.min(delta, 50);
        const feet = { x: this.player.x, y: this.player.y };
        this.cat?.update(dt, feet);

        if (!this.canAct()) {
            if (!this.busy) { this.player.sprite.setVelocity(0, 0); }
            this.updateHighlights(null);
            if (!state.modal) setPrompt(null);
            return;
        }

        this.player.update(moveVector(), dt);
        // Arriving on a click-walk can open a panel or start a transition this frame.
        if (!this.canAct()) { setPrompt(null); this.updateHighlights(null); return; }
        this.checkDoors();
        const f = this.pickFocus();
        this.focus = f;
        this.updateHighlights(f);
        if (f) {
            // Above the object, or above the character's head if the object is lower (never over the face).
            const b = f.sprite.getBounds();
            const objTop = (f.kind === 'door' ? b.top + 6 : b.top) - (f.sparkle && f.sparkle.alpha > 0 ? 7 : 2);
            const headTop = this.player.sprite.getBounds().top - 2;
            const below = objTop > headTop;
            const p = this.toPage(below ? this.player.x : b.centerX, below ? headTop : objTop);
            setPrompt(f.prompt, p.x, p.y);
        } else setPrompt(null);
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

    /** Rule 1: one object, one standing spot, nearest wins, with hysteresis. Cat only if nothing static is in range. */
    private pickFocus(): Target | null {
        const px = this.player.x, py = this.player.y;
        const fv = FACING_VEC[this.player.facing];
        let best: Target | null = null, bestScore = Infinity, currentScore = Infinity;
        let catT: Target | null = null;
        for (const t of this.targets) {
            if (t.def?.kind === 'cat') { catT = t; continue; }
            const d = Math.hypot(t.spot.x - px, t.spot.y - py);
            const limit = t === this.focus ? ZONE_EXIT : ZONE_ENTER;
            if (d > limit) continue;
            // roughly facing: the object must not be behind the character
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
        if (best && this.focus && currentScore !== Infinity && best !== this.focus && bestScore > currentScore - 3) return this.focus;
        if (best) return best;
        if (catT && this.cat) {
            const d = Math.hypot(this.cat.x - px, this.cat.y - py);
            if (d <= (this.focus === catT ? CAT_ZONE + 4 : CAT_ZONE)) return catT;
        }
        return null;
    }

    private updateHighlights(focus: Target | null) {
        const hint = this.time.now < this.hintUntil;
        const blink = Math.floor(this.time.now / 160) % 2 === 0;
        for (const t of this.targets) {
            if (!t.hl) continue;
            if (t.def?.kind === 'cat') { t.spot = { x: this.cat!.x, y: this.cat!.y }; }
            this.syncHighlight(t);
            const unfound = t.key !== null && !state.found.has(t.key);
            const show = t === focus || (hint && unfound && blink);
            t.hl.setVisible(show);
            t.hl.setAlpha(t === focus ? (t.key && state.found.has(t.key) ? 0.7 : 1) : 0.8);
            if (t.sparkle && t.def?.kind === 'cat') {
                t.sparkle.setPosition(Math.round(this.cat!.x), Math.round(this.cat!.y) - 15);
            }
        }
    }
}
