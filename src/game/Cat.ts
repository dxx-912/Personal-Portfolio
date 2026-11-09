import Phaser from 'phaser';
import { CAT_SPEED, tx, ty } from '../config';
import type { TPoint } from '../rooms/types';
import type { Pt } from './nav';

/** Wanders between open floor waypoints. Pauses when the player is close. Never collides. */
export class Cat {
    readonly sprite: Phaser.GameObjects.Sprite;
    private points: Pt[];
    private target: Pt | null = null;
    private wait = 1500;
    private lastIndex = 0;
    held = false; // frozen while being petted or while a panel is open

    constructor(scene: Phaser.Scene, waypoints: TPoint[]) {
        this.points = waypoints.map((p) => ({ x: tx(p.x), y: ty(p.y) }));
        const start = this.points[0];
        this.sprite = scene.add.sprite(start.x, start.y, 'cat', 0).setOrigin(0.5, 1);
        this.sprite.anims.play('cat-idle');
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    update(dt: number, player: Pt) {
        this.sprite.setDepth(this.y);
        const near = Math.hypot(player.x - this.x, player.y - this.y) < 28;
        if (this.held || near) {
            if (near) this.sprite.setFlipX(player.x < this.x);
            this.idle();
            return;
        }
        if (!this.target) {
            this.wait -= dt;
            if (this.wait <= 0) {
                let i = Math.floor(Math.random() * this.points.length);
                if (i === this.lastIndex) i = (i + 1) % this.points.length;
                this.lastIndex = i;
                this.target = this.points[i];
            }
            this.idle();
            return;
        }
        const dx = this.target.x - this.x, dy = this.target.y - this.y;
        const d = Math.hypot(dx, dy);
        const step = (CAT_SPEED * dt) / 1000;
        if (d <= step) {
            this.sprite.setPosition(this.target.x, this.target.y);
            this.target = null;
            this.wait = 1800 + Math.random() * 3500;
            return;
        }
        this.sprite.setPosition(this.x + (dx / d) * step, this.y + (dy / d) * step);
        this.sprite.setFlipX(dx < 0);
        this.sprite.anims.play('cat-walk', true);
    }

    private idle() { this.sprite.anims.play('cat-idle', true); }
}
