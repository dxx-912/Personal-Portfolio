import Phaser from 'phaser';
import { CAT_SPEED, tx, ty } from '../config';
import { CAT_FRAMES } from '../assets/placeholders';
import type { TPoint, Facing } from '../rooms/types';
import type { Pt } from './nav';

type CatState = 'idle' | 'walk' | 'follow' | 'toBed' | 'hop' | 'nap' | 'petted' | 'bat' | 'toPerch' | 'perch';

/** A furniture top Fluffy can hop onto (world pixels). */
export interface Perch { on: string; from: Pt; path: [Pt, Pt]; depth: number }

export interface CatOpts {
    waypoints: TPoint[];
    /** Standing spots and door approaches the cat should not loiter on (pixels). */
    avoid: Pt[];
    nap?: { at: TPoint; spot: TPoint; facing: Facing };
    /** Furniture tops he jumps onto now and then. */
    perches?: Perch[];
    /**
     * Called every frame while he is up on a perch. Return the x of a decor item to swat at (the room then
     * nudges it along or knocks it off), or null.
     */
    onPerch?: (on: string, x: number, y: number, dt: number) => number | null;
    /** A free floor point near a world point (where to stand to pet him while he is up on furniture). */
    freeNear?: (p: Pt) => Pt;
    /** Depth for the cat while it naps on the bed. */
    bedDepth?: number;
}

/**
 * The cat: wanders on open floor, pauses near the player, sometimes follows for a bit,
 * naps on the bed now and then, sits and closes his eyes when petted, bats at a passing longboard.
 */
export class Cat {
    readonly sprite: Phaser.GameObjects.Sprite;
    private points: Pt[];
    private nap: { at: Pt; spot: Pt; facing: Facing } | null;
    private target: Pt | null = null;
    private st: CatState = 'idle';
    private timer = 1500;
    private lastIndex = 0;
    private untilNap: number;
    private untilPerch: number;
    private perch: Perch | null = null;
    private perchLeft = 0;
    private perchPause = 0;
    private perchGoal: Pt | null = null;
    private followLeft = 0;
    held = false; // frozen while a panel is open

    constructor(private scene: Phaser.Scene, private opts: CatOpts) {
        const avoidR = 18;
        this.points = opts.waypoints.map((p) => ({ x: tx(p.x), y: ty(p.y) }))
            .filter((p) => opts.avoid.every((a) => Math.hypot(a.x - p.x, a.y - p.y) > avoidR));
        this.nap = opts.nap ? {
            at: { x: tx(opts.nap.at.x), y: ty(opts.nap.at.y) },
            spot: { x: tx(opts.nap.spot.x), y: ty(opts.nap.spot.y) }, facing: opts.nap.facing
        } : null;
        const start = this.points[0];
        this.sprite = scene.add.sprite(start.x, start.y, 'cat', 0).setOrigin(0.5, 1);
        this.sprite.anims.play('cat-idle');
        this.untilNap = 35000 + Math.random() * 25000;
        this.untilPerch = 25000 + Math.random() * 20000;
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get onBed() { return this.st === 'nap'; }
    /** Up on the bed or on furniture: petted from the floor beside it. */
    get elevated() { return this.st === 'nap' || this.st === 'perch' || (this.st === 'hop' && !!this.perch); }
    get perchedOn() { return this.st === 'perch' ? this.perch?.on ?? null : null; }

    /** Where the player stands to pet him. */
    standingSpot(playerX: number): { spot: Pt; facing: Facing } {
        if (this.onBed && this.nap) return { spot: this.nap.spot, facing: this.nap.facing };
        if (this.elevated && this.perch && this.opts.freeNear) {
            const spot = this.opts.freeNear({ x: this.x, y: this.y });
            const dx = this.x - spot.x, dy = this.y - spot.y;
            return { spot, facing: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up') };
        }
        const side = playerX < this.x ? -1 : 1;
        return { spot: { x: this.x + side * 14, y: this.y + 1 }, facing: side < 0 ? 'right' : 'left' };
    }

    /** Pet him. Returns whether he was asleep. */
    pet(): 'awake' | 'asleep' {
        if (this.st === 'nap') {
            this.scene.tweens.add({ targets: this.sprite, scaleY: 0.92, duration: 120, yoyo: true });
            return 'asleep';
        }
        if (this.st === 'perch') {
            // sits and closes his eyes up there, then carries on
            this.perchPause = 1800;
            this.perchGoal = null;
            this.sprite.anims.stop();
            this.sprite.setFrame(CAT_FRAMES.petted);
            return 'awake';
        }
        this.st = 'petted';
        this.timer = 1800;
        this.target = null;
        this.sprite.anims.stop();
        this.sprite.setFrame(CAT_FRAMES.petted);
        return 'awake';
    }

    /** A longboard rolled past: bat a paw at it. */
    batAt(x: number) {
        if (this.st === 'nap' || this.st === 'petted' || this.st === 'bat' || this.st === 'hop' || this.st === 'perch') return;
        this.st = 'bat';
        this.timer = 450;
        this.sprite.anims.stop();
        this.sprite.setFlipX(x < this.x);
        this.sprite.setFrame(CAT_FRAMES.bat);
    }

    update(dt: number, player: Pt & { moving: boolean }) {
        if (this.st === 'perch' && this.perch) this.sprite.setDepth(this.perch.depth);
        else if (this.st !== 'nap' && this.st !== 'hop') this.sprite.setDepth(this.y);
        if (this.held) { if (this.st !== 'nap' && this.st !== 'perch') this.idleAnim(); return; }
        const dPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        this.timer -= dt;
        this.untilNap -= dt;
        this.untilPerch -= dt;

        switch (this.st) {
            case 'petted':
                if (this.timer <= 0) { this.st = 'idle'; this.timer = 1500; this.sprite.setFrame(CAT_FRAMES.sit); }
                return;
            case 'bat':
                if (this.timer <= 0) { this.st = 'idle'; this.timer = 800; this.idleAnim(); }
                return;
            case 'hop':
                return; // tween in progress
            case 'nap':
                if (this.timer <= 0) this.wakeFromNap();
                return;
            case 'perch':
                this.updatePerch(dt);
                return;
        }

        // pause near the player while idling or wandering (a cat on his way to a nap does not stop)
        if ((this.st === 'idle' || this.st === 'walk') && dPlayer < 26) {
            this.target = null;
            this.sprite.setFlipX(player.x < this.x);
            this.st = 'idle';
            this.timer = Math.max(this.timer, 600);
            this.sitAnim();
            return;
        }

        if (this.st === 'idle') {
            this.idleAnim();
            if (this.timer > 0) return;
            // choose what to do next
            if (this.untilNap <= 0 && this.nap) { this.st = 'toBed'; this.target = this.nap.spot; return; }
            if (this.untilPerch <= 0 && this.opts.perches?.length) {
                const list = this.opts.perches;
                this.perch = list[Math.floor(Math.random() * list.length)];
                this.st = 'toPerch';
                this.target = this.perch.from;
                return;
            }
            if (player.moving && dPlayer < 70 && Math.random() < 0.35) { this.st = 'follow'; this.followLeft = 4000; return; }
            let i = Math.floor(Math.random() * this.points.length);
            if (i === this.lastIndex) i = (i + 1) % this.points.length;
            this.lastIndex = i;
            this.target = this.points[i];
            this.st = 'walk';
            return;
        }

        if (this.st === 'follow') {
            this.followLeft -= dt;
            if (this.followLeft <= 0) { this.st = 'idle'; this.timer = 2000; return; }
            if (dPlayer > 20) this.stepToward({ x: player.x - Math.sign(player.x - this.x) * 16, y: player.y }, dt, 1.6);
            else { this.sitAnim(); this.sprite.setFlipX(player.x < this.x); }
            return;
        }

        if (!this.target) { this.st = 'idle'; return; }
        if (this.stepToward(this.target, dt)) {
            const t = this.target;
            this.target = null;
            if (this.st === 'toBed' && this.nap && t === this.nap.spot) { this.hopOnBed(); return; }
            if (this.st === 'toPerch' && this.perch) { this.hopUp(); return; }
            this.st = 'idle';
            this.timer = 1800 + Math.random() * 3500;
        }
    }

    /** Returns true on arrival. */
    private stepToward(p: Pt, dt: number, speedMul = 1) {
        const dx = p.x - this.x, dy = p.y - this.y;
        const d = Math.hypot(dx, dy);
        const step = (CAT_SPEED * speedMul * dt) / 1000;
        if (d <= step) { this.sprite.setPosition(p.x, p.y); return true; }
        this.sprite.setPosition(this.x + (dx / d) * step, this.y + (dy / d) * step);
        this.sprite.setFlipX(dx < 0);
        this.sprite.anims.play('cat-walk', true);
        return false;
    }

    private hopOnBed() {
        if (!this.nap) return;
        this.st = 'hop';
        const from = { x: this.x, y: this.y }, to = this.nap.at;
        const prog = { t: 0 };
        this.sprite.setDepth((this.opts.bedDepth ?? to.y) + 1);
        this.scene.tweens.add({
            targets: prog, t: 1, duration: 420, ease: 'Sine.easeInOut',
            onUpdate: () => this.sprite.setPosition(
                Math.round(from.x + (to.x - from.x) * prog.t),
                Math.round(from.y + (to.y - from.y) * prog.t - Math.sin(prog.t * Math.PI) * 10)),
            onComplete: () => {
                this.st = 'nap';
                this.timer = 22000 + Math.random() * 18000;
                this.sprite.anims.play('cat-sleep', true);
            }
        });
    }

    private wakeFromNap() {
        if (!this.nap) return;
        this.st = 'hop';
        const from = { x: this.x, y: this.y }, to = this.nap.spot;
        const prog = { t: 0 };
        this.sprite.anims.play('cat-idle', true);
        this.scene.tweens.add({
            targets: prog, t: 1, duration: 380, ease: 'Sine.easeInOut',
            onUpdate: () => this.sprite.setPosition(
                Math.round(from.x + (to.x - from.x) * prog.t),
                Math.round(from.y + (to.y - from.y) * prog.t - Math.sin(prog.t * Math.PI) * 8)),
            onComplete: () => {
                this.sprite.setDepth(this.y);
                this.st = 'idle';
                this.timer = 1500;
                this.untilNap = 50000 + Math.random() * 30000;
            }
        });
    }

    /** A small arc from where he stands to a point, then `done`. */
    private hopTo(to: Pt, ms: number, lift: number, depth: number | null, done: () => void) {
        this.st = 'hop';
        const from = { x: this.x, y: this.y };
        const prog = { t: 0 };
        this.sprite.anims.play('cat-idle', true);
        this.sprite.setFlipX(to.x < from.x);
        this.scene.tweens.add({
            targets: prog, t: 1, duration: ms, ease: 'Sine.easeInOut',
            onUpdate: () => {
                if (depth !== null && prog.t > 0.45) this.sprite.setDepth(depth);
                this.sprite.setPosition(
                    Math.round(from.x + (to.x - from.x) * prog.t),
                    Math.round(from.y + (to.y - from.y) * prog.t - Math.sin(prog.t * Math.PI) * lift));
            },
            onComplete: done
        });
    }

    /** Up onto the furniture: he stays 25 to 40 seconds, strolling along the top. */
    private hopUp() {
        const p = this.perch!;
        this.hopTo(p.path[0], 420, 14, p.depth, () => {
            this.st = 'perch';
            this.perchLeft = 25000 + Math.random() * 15000;
            this.perchPause = 800;
            this.perchGoal = null;
        });
    }

    private hopDown() {
        const p = this.perch!;
        this.hopTo(p.from, 380, 10, null, () => {
            this.sprite.setDepth(this.y);
            this.perch = null;
            this.st = 'idle';
            this.timer = 1500;
            this.untilPerch = 50000 + Math.random() * 40000;
        });
    }

    private updatePerch(dt: number) {
        const p = this.perch!;
        this.perchLeft -= dt;
        if (this.perchLeft <= 0) { this.hopDown(); return; }
        const swat = this.opts.onPerch?.(p.on, this.x, this.y, dt) ?? null;
        if (swat !== null) {
            // bat a paw at it
            this.perchPause = 900;
            this.perchGoal = null;
            this.sprite.anims.stop();
            this.sprite.setFlipX(swat < this.x);
            this.sprite.setFrame(CAT_FRAMES.bat);
            return;
        }
        if (this.perchPause > 0) {
            this.perchPause -= dt;
            if (this.perchPause <= 0) this.sitAnim();
            return;
        }
        if (!this.perchGoal) {
            const t = Math.random();
            const [a, b] = p.path;
            this.perchGoal = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        }
        if (this.stepToward(this.perchGoal, dt, 0.8)) {
            this.perchGoal = null;
            this.perchPause = 1200 + Math.random() * 2600;
            this.sitAnim();
        }
    }

    private idleAnim() { if (this.sprite.anims.currentAnim?.key !== 'cat-idle' || !this.sprite.anims.isPlaying) this.sprite.anims.play('cat-idle', true); }
    private sitAnim() { this.sprite.anims.stop(); this.sprite.setFrame(CAT_FRAMES.sit); }
}
