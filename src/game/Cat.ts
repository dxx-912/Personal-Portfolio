import Phaser from 'phaser';
import { CAT_SPEED, tx, ty } from '../config';
import { CAT_FRAMES } from '../assets/placeholders';
import type { TPoint, Facing } from '../rooms/types';
import type { Pt } from './nav';

type CatState = 'idle' | 'walk' | 'follow' | 'toBed' | 'hop' | 'nap' | 'petted' | 'bat' | 'knock';

export interface CatOpts {
    waypoints: TPoint[];
    /** Standing spots and door approaches the cat should not loiter on (pixels). */
    avoid: Pt[];
    nap?: { at: TPoint; spot: TPoint; facing: Facing };
    /** Where the cat goes to swat something off the desk, and what happens then. */
    knock?: { at: Pt; onKnock: () => void };
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
    private untilKnock: number;
    private knocked = false;
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
        this.untilKnock = 55000 + Math.random() * 30000;
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get onBed() { return this.st === 'nap'; }

    /** Where the player stands to pet him. */
    standingSpot(playerX: number): { spot: Pt; facing: Facing } {
        if (this.onBed && this.nap) return { spot: this.nap.spot, facing: this.nap.facing };
        const side = playerX < this.x ? -1 : 1;
        return { spot: { x: this.x + side * 14, y: this.y + 1 }, facing: side < 0 ? 'right' : 'left' };
    }

    /** Pet him. Returns whether he was asleep. */
    pet(): 'awake' | 'asleep' {
        if (this.st === 'nap') {
            this.scene.tweens.add({ targets: this.sprite, scaleY: 0.92, duration: 120, yoyo: true });
            return 'asleep';
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
        if (this.st === 'nap' || this.st === 'petted' || this.st === 'bat' || this.st === 'hop') return;
        this.st = 'bat';
        this.timer = 450;
        this.sprite.anims.stop();
        this.sprite.setFlipX(x < this.x);
        this.sprite.setFrame(CAT_FRAMES.bat);
    }

    update(dt: number, player: Pt & { moving: boolean }) {
        if (this.st !== 'nap' && this.st !== 'hop') this.sprite.setDepth(this.y);
        if (this.held) { if (this.st !== 'nap') this.idleAnim(); return; }
        const dPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        this.timer -= dt;
        this.untilNap -= dt;
        this.untilKnock -= dt;

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
            case 'knock':
                if (this.timer <= 0) { this.st = 'idle'; this.timer = 1500; this.idleAnim(); }
                return;
        }

        // pause near the player (unless following)
        if (this.st !== 'follow' && dPlayer < 26) {
            this.target = null;
            this.sprite.setFlipX(player.x < this.x);
            if (this.st === 'walk' || this.st === 'toBed') this.st = 'idle';
            this.sitAnim();
            return;
        }

        if (this.st === 'idle') {
            this.idleAnim();
            if (this.timer > 0) return;
            // choose what to do next
            if (this.untilNap <= 0 && this.nap) { this.st = 'toBed'; this.target = this.nap.spot; return; }
            if (!this.knocked && this.opts.knock && this.untilKnock <= 0) { this.st = 'toBed'; this.target = this.opts.knock.at; return; }
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
            if (this.st === 'toBed' && this.opts.knock && t === this.opts.knock.at) { this.doKnock(); return; }
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

    private doKnock() {
        this.st = 'knock';
        this.knocked = true;
        this.timer = 1200;
        this.sprite.anims.stop();
        this.sprite.setFlipX(true);
        this.sprite.setFrame(CAT_FRAMES.bat);
        this.scene.time.delayedCall(250, () => this.opts.knock?.onKnock());
    }

    private idleAnim() { if (this.sprite.anims.currentAnim?.key !== 'cat-idle' || !this.sprite.anims.isPlaying) this.sprite.anims.play('cat-idle', true); }
    private sitAnim() { this.sprite.anims.stop(); this.sprite.setFrame(CAT_FRAMES.sit); }
}
