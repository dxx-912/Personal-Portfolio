import Phaser from 'phaser';
import { CHAR_BODY, CHAR_FRAME, WALK_SPEED } from '../config';
import type { Facing } from '../rooms/types';
import type { Pt } from './nav';

export const FACING_VEC: Record<Facing, Pt> = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
};

export class Player {
    readonly sprite: Phaser.Physics.Arcade.Sprite;
    facing: Facing = 'down';
    private path: Pt[] = [];
    private onArrive: (() => void) | null = null;
    private stuckTime = 0;
    private lastPos = { x: 0, y: 0 };

    constructor(private scene: Phaser.Scene, x: number, y: number) {
        this.sprite = scene.physics.add.sprite(x, y, 'daniel', 0);
        this.sprite.setOrigin(0.5, 1);
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.setSize(CHAR_BODY.w, CHAR_BODY.h, false);
        body.setOffset((CHAR_FRAME.w - CHAR_BODY.w) / 2, CHAR_FRAME.h - CHAR_BODY.h);
        this.face('down');
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get walkingPath() { return this.path.length > 0; }

    face(f: Facing) {
        this.facing = f;
        this.playIdle();
    }

    teleport(x: number, y: number) {
        this.sprite.body!.reset(x, y);
        this.sprite.setPosition(x, y);
    }

    walkTo(path: Pt[], onArrive?: () => void) {
        this.path = path.slice();
        this.onArrive = onArrive ?? null;
        this.stuckTime = 0;
    }

    cancelPath() { this.path = []; this.onArrive = null; }

    stop() {
        this.sprite.setVelocity(0, 0);
        this.playIdle();
    }

    /** Movement for this frame from an input vector (keys or stick) or the current path. */
    update(input: Pt, dt: number, speed = WALK_SPEED) {
        let vx = 0, vy = 0;
        if (input.x || input.y) {
            this.cancelPath();
            vx = input.x * speed; vy = input.y * speed;
        } else if (this.path.length) {
            const target = this.path[0];
            const dx = target.x - this.x, dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            const step = (speed * dt) / 1000;
            if (d <= Math.max(1, step)) {
                this.teleport(target.x, target.y);
                this.path.shift();
                if (!this.path.length) {
                    this.sprite.setVelocity(0, 0);
                    this.playIdle();
                    const cb = this.onArrive; this.onArrive = null;
                    cb?.();
                    return;
                }
            } else {
                vx = (dx / d) * speed; vy = (dy / d) * speed;
            }
            // Give up if blocked for a while (should not happen with a valid path).
            const moved = Math.hypot(this.x - this.lastPos.x, this.y - this.lastPos.y);
            this.stuckTime = moved < 0.2 ? this.stuckTime + dt : 0;
            if (this.stuckTime > 500) { this.cancelPath(); this.stop(); return; }
        }
        this.lastPos = { x: this.x, y: this.y };
        this.sprite.setVelocity(vx, vy);
        if (vx || vy) {
            if (Math.abs(vx) > Math.abs(vy) * 1.05) this.facing = vx > 0 ? 'right' : 'left';
            else this.facing = vy > 0 ? 'down' : 'up';
            this.playWalk();
        } else {
            this.playIdle();
        }
        this.sprite.setDepth(this.y);
    }

    private animDir() { return this.facing === 'left' || this.facing === 'right' ? 'side' : this.facing; }

    private playIdle() {
        this.sprite.setFlipX(this.facing === 'left');
        this.sprite.anims.play(`idle-${this.animDir()}`, true);
    }

    private playWalk() {
        this.sprite.setFlipX(this.facing === 'left');
        this.sprite.anims.play(`walk-${this.animDir()}`, true);
    }

    /** Little squash when interacting. */
    squash() {
        this.scene.tweens.add({ targets: this.sprite, scaleX: 1.15, scaleY: 0.87, duration: 70, yoyo: true, ease: 'Quad.easeOut' });
    }
}
