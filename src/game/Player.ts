import Phaser from 'phaser';
import { CHAR_BODY, CHAR_FRAME, WALK_SPEED } from '../config';
import type { Facing } from '../rooms/types';
import type { Pt } from './nav';

export const FACING_VEC: Record<Facing, Pt> = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
};

/** Shirt colours the closet cycles through: white tee, black, UCLA blue, a graphic tee colour. */
export const OUTFITS = [0xffffff, 0x34363f, 0x3a78c0, 0xe0703a];

/**
 * Daniel. The body sprite has physics; the shirt is a second sprite on top that copies its frame,
 * so outfits are a tint on the shirt layer (and final art can ship the shirt as its own sheet).
 */
export class Player {
    readonly sprite: Phaser.Physics.Arcade.Sprite;
    readonly shirt: Phaser.GameObjects.Sprite;
    facing: Facing = 'down';
    /** A fixed frame (sitting, hanging) instead of the walk and idle animations. */
    private posed: number | null = null;
    private path: Pt[] = [];
    private onArrive: (() => void) | null = null;
    private stuckTime = 0;
    private lastPos = { x: 0, y: 0 };

    constructor(private scene: Phaser.Scene, x: number, y: number, outfit = 0) {
        this.sprite = scene.physics.add.sprite(x, y, 'daniel', 0);
        this.sprite.setOrigin(0.5, 1);
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.setSize(CHAR_BODY.w, CHAR_BODY.h, false);
        body.setOffset((CHAR_FRAME.w - CHAR_BODY.w) / 2, CHAR_FRAME.h - CHAR_BODY.h);
        this.shirt = scene.add.sprite(x, y, 'daniel_shirt', 0).setOrigin(0.5, 1);
        this.setOutfit(outfit);
        this.face('down');
        scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.sync, this);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.sync, this));
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get walkingPath() { return this.path.length > 0; }
    get moving() { const b = this.sprite.body as Phaser.Physics.Arcade.Body; return Math.hypot(b.velocity.x, b.velocity.y) > 8; }

    setOutfit(i: number) { this.shirt.setTint(OUTFITS[i % OUTFITS.length]); }

    /** Keeps the shirt layer glued to the body (position, frame, flip, scale, depth, visibility). */
    sync() {
        const s = this.sprite;
        this.shirt.setPosition(s.x, s.y);
        this.shirt.setFrame(s.frame.name);
        this.shirt.setFlipX(s.flipX);
        this.shirt.setScale(s.scaleX, s.scaleY);
        this.shirt.setAngle(s.angle);
        this.shirt.setDepth(s.depth + 0.001);
        this.shirt.setVisible(s.visible);
        this.shirt.setAlpha(s.alpha);
    }

    face(f: Facing) {
        this.facing = f;
        if (this.posed === null) this.playIdle();
    }

    /** Hold a fixed frame (sit, crouch, hang, cheer). Pass null to go back to normal animations. */
    pose(frame: number | null) {
        this.posed = frame;
        if (frame === null) { this.playIdle(); return; }
        this.sprite.anims.stop();
        this.sprite.setFlipX(false);
        this.sprite.setFrame(frame);
    }

    get isPosed() { return this.posed !== null; }

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
        if (this.posed === null) this.playIdle();
    }

    /**
     * Movement for this frame from an input vector (keys or stick) or the current path.
     * `accel` (0..1 per frame at 60fps) gives the longboard its glide; 1 means instant.
     */
    update(input: Pt, dt: number, speed = WALK_SPEED, accel = 1) {
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
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
            const moved = Math.hypot(this.x - this.lastPos.x, this.y - this.lastPos.y);
            this.stuckTime = moved < 0.2 ? this.stuckTime + dt : 0;
            if (this.stuckTime > 500) { this.cancelPath(); this.stop(); return; }
        }
        this.lastPos = { x: this.x, y: this.y };
        if (accel < 1) {
            // glide: ease the current velocity toward the target, coast when there is no input
            const k = 1 - Math.pow(1 - accel, dt / 16.7);
            vx = body.velocity.x + (vx - body.velocity.x) * k;
            vy = body.velocity.y + (vy - body.velocity.y) * k;
            if (Math.hypot(vx, vy) < 4 && !input.x && !input.y) { vx = 0; vy = 0; }
        }
        this.sprite.setVelocity(vx, vy);
        const intent = input.x || input.y ? input : { x: vx, y: vy };
        if (intent.x || intent.y) {
            if (Math.abs(intent.x) > Math.abs(intent.y) * 1.05) this.facing = intent.x > 0 ? 'right' : 'left';
            else this.facing = intent.y > 0 ? 'down' : 'up';
        }
        if (this.posed === null) {
            if ((vx || vy) && accel === 1) this.playWalk();
            else this.playIdle();
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
