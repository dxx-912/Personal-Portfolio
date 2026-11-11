// Mini basketball and wall hoop (iteration 5, group D6).
//
// Fake 3D: the ball has a floor position (x, y) and a height z. It is drawn at (x, y - z) with a shadow on the
// floor at (x, y) that shrinks as it rises. Shots follow a gravity arc toward the rim. The power needed depends
// on the distance: the meter shows a sweet spot window. Inside it the ball drops through; a little off rattles the
// rim; too little falls short; too much hits the backboard and rebounds. Then it bounces (restitution ~0.6),
// rolls with friction, bounces off walls and furniture footprints and rests wherever it ends up.

import Phaser from 'phaser';
import { FLOOR_H, FLOOR_W, FLOOR_X, FLOOR_Y } from '../config';
import type { Rect } from './nav';

const G = 430; // gravity, px/s^2
const BALL_R = 3;
const RIM_R = 5.5;
const HAND_Z = 14;
const RESTITUTION = 0.6;
/** Furniture footprints block the ball below this height. */
const FURNITURE_Z = 16;
/**
 * Sweet spot half width on the 0..1 meter: generous right under the hoop, narrowing steadily with distance,
 * tight from the far side of the room.
 */
const SWEET_NEAR = 0.17, SWEET_FAR = 0.03;

export type BallState = 'rest' | 'held' | 'air' | 'roll';

export interface HoopGeom {
    /** Rim centre on the floor plane and its height. */
    rimX: number; rimY: number; rimZ: number;
    /** Backboard front face (x) and its extent. */
    boardX: number; boardHalfY: number; boardZ0: number; boardZ1: number;
}

export interface BallHost {
    solids: Rect[];
    sound(name: 'swish' | 'clank' | 'bounce' | 'board'): void;
    onMake(): void;
    /** Called when the ball stops; return false to send it back to its home spot. */
    validRest(x: number, y: number): boolean;
    reducedMotion: boolean;
}

export class Basketball {
    readonly sprite: Phaser.GameObjects.Image;
    private shadow: Phaser.GameObjects.Ellipse;
    readonly hoop: Phaser.GameObjects.Sprite;
    state: BallState = 'rest';
    x: number; y: number; z = 0;
    private vx = 0; private vy = 0; private vz = 0;
    private airTime = 0;
    /** Below the rim plane after passing through it (a make), so it is not counted twice. */
    private through = false;
    makes = 0;
    attempts = 0;

    constructor(private scene: Phaser.Scene, readonly geom: HoopGeom, hoopAt: { x: number; y: number },
        private home: { x: number; y: number }, start: { x: number; y: number } | null, private host: BallHost) {
        this.hoop = scene.add.sprite(hoopAt.x, hoopAt.y, 'dorm_hoop', 0).setOrigin(0).setDepth(geom.rimY + 0.6);
        this.shadow = scene.add.ellipse(0, 0, 7, 3, 0x000000, 0.28).setDepth(0.6);
        this.sprite = scene.add.image(0, 0, 'bb_ball').setOrigin(0.5);
        const p = start ?? home;
        this.x = p.x; this.y = p.y;
        this.draw();
    }

    get canPickUp() { return this.state === 'rest'; }
    get moving() { return this.state === 'air' || this.state === 'roll'; }

    /** Feet position for picking it up. */
    pickupPoint() { return { x: this.x, y: this.y + 2 }; }

    hold(px: number, py: number, facing: 'up' | 'down' | 'left' | 'right') {
        this.state = 'held';
        this.vx = this.vy = this.vz = 0;
        const off = { down: [0, -8, 0.5], up: [0, -10, -0.5], left: [-6, -9, 0.5], right: [6, -9, 0.5] }[facing];
        this.x = px + off[0]; this.y = py;
        this.z = -off[1];
        this.sprite.setPosition(Math.round(this.x), Math.round(py + off[1])).setDepth(py + off[2]).setAngle(0);
        this.shadow.setVisible(false);
    }

    /** Let go at the feet: a small drop and bounce. */
    drop(px: number, py: number, facing: 'up' | 'down' | 'left' | 'right') {
        const d = { down: [0, 6], up: [0, -6], left: [-8, 0], right: [8, 0] }[facing];
        this.x = px + d[0]; this.y = py + d[1]; this.z = 9;
        this.vx = d[0] * 3; this.vy = d[1] * 3; this.vz = 0;
        this.state = 'air'; this.airTime = 0; this.through = false;
        this.clampToRoom();
    }

    /** Half width of the sweet spot from (px, py): wide up close, progressively smaller further away. */
    sweetWidth(px: number, py: number) {
        const d = Math.hypot(this.geom.rimX - px, this.geom.rimY - py);
        const t = Phaser.Math.Clamp((d - 12) / (FLOOR_W * 0.85 - 12), 0, 1);
        return Phaser.Math.Linear(SWEET_NEAR, SWEET_FAR, t);
    }

    /** Power that drops it in from (px, py): the middle of the sweet spot, for the meter. */
    sweetSpot(px: number, py: number) {
        const v = this.idealSpeed(Math.hypot(this.geom.rimX - px, this.geom.rimY - py), this.angleFor(px, py));
        return Phaser.Math.Clamp(v / this.maxSpeed(), 0.12, 0.92);
    }

    /**
     * Shoot from the feet position with meter power p (0..1). The error from the sweet spot sets where the arc
     * crosses the rim height: inside the rim, on the rim, short, or long into the backboard.
     */
    shoot(px: number, py: number, p: number) {
        const g = this.geom;
        const dx = g.rimX - px, dy = g.rimY - py;
        const d = Math.max(1, Math.hypot(dx, dy));
        const theta = this.angleFor(px, py);
        const delta = p - this.sweetSpot(px, py);
        const a = Math.abs(delta), sgn = Math.sign(delta) || 1;
        const SWEET = this.sweetWidth(px, py);
        // landing error along the shot line, in px past (+) or short of (-) the rim centre
        let e: number;
        if (a <= SWEET) e = (delta / SWEET) * 1.6 + (Math.random() - 0.5) * 0.8; // drops in
        else if (a <= SWEET * 2.2) e = sgn * (RIM_R - BALL_R + ((a - SWEET) / (SWEET * 1.2)) * (2 * BALL_R + 1)); // rim
        else if (sgn < 0) e = -(RIM_R + BALL_R + 2 + (a - SWEET * 2.2) * 160); // falls short
        else e = Math.min(20, RIM_R + BALL_R + 4 + (a - SWEET * 2.2) * 45); // long: into the backboard
        // the ball leaves the hands 4 px in front of the feet
        const R = Math.max(2, d - 4 + e);
        const v = Math.min(this.maxSpeed() * 1.1, this.idealSpeed(R, theta));
        const ux = dx / d, uy = dy / d;
        // a hair of sideways scatter so no two misses look identical
        const side = (Math.random() - 0.5) * (a <= SWEET ? 0.004 : 0.03);
        this.x = px + ux * 4; this.y = py + uy * 4; this.z = HAND_Z;
        this.vx = (ux - uy * side) * v * Math.cos(theta);
        this.vy = (uy + ux * side) * v * Math.cos(theta);
        this.vz = v * Math.sin(theta);
        this.state = 'air'; this.airTime = 0; this.through = false;
        this.attempts++;
    }

    respawn() {
        this.x = this.home.x; this.y = this.home.y; this.z = 0;
        this.vx = this.vy = this.vz = 0;
        this.state = 'rest';
        this.draw();
    }

    update(dtMs: number) {
        if (this.state === 'held') return;
        if (this.state === 'rest') { this.draw(); return; }
        // sub steps keep rim and board contacts reliable
        let left = Math.min(dtMs, 50) / 1000;
        while (left > 0) {
            const h = Math.min(left, 1 / 240);
            this.step(h);
            left -= h;
            if ((this.state as BallState) === 'rest') break;
        }
        this.airTime += dtMs;
        if (this.airTime > 9000) this.settle(); // never let it fidget forever
        this.draw();
    }

    private step(h: number) {
        const g = this.geom;
        const pz = this.z;
        const px = this.x;
        if (this.state === 'air') this.vz -= G * h;
        this.x += this.vx * h; this.y += this.vy * h; this.z += this.vz * h;

        // backboard (its front face) and the wall behind it
        const nearBoardY = Math.abs(this.y - g.rimY) <= g.boardHalfY;
        if (nearBoardY && this.z >= g.boardZ0 && this.z <= g.boardZ1 && this.x - BALL_R < g.boardX && px - BALL_R >= g.boardX - 0.01 && this.vx < 0) {
            this.x = g.boardX + BALL_R; this.vx = -this.vx * 0.78; this.vy *= 0.9;
            this.host.sound('board');
        }

        // rim plane, going down
        if (pz >= g.rimZ && this.z < g.rimZ && this.vz < 0) {
            const rx = this.x - g.rimX, ry = this.y - g.rimY;
            const dist = Math.hypot(rx, ry);
            if (dist < RIM_R - BALL_R + 0.5) {
                if (!this.through) {
                    this.through = true;
                    // the net catches it: most of the sideways speed goes, it drops out under the hoop
                    this.vx = this.vx * 0.15 + 12; this.vy *= 0.15; this.vz *= 0.5;
                    this.host.sound('swish');
                    this.host.onMake();
                }
            } else if (dist <= RIM_R + BALL_R) {
                // rim contact: bounce off the near point of the ring
                const nx = dist ? rx / dist : 1, ny = dist ? ry / dist : 0;
                const vn = this.vx * nx + this.vy * ny;
                // inside the ring moving out (back rim) or outside moving in (front rim): reflect that part
                const inside = dist < RIM_R;
                if ((inside && vn > 0) || (!inside && vn < 0)) { this.vx -= 1.6 * vn * nx; this.vy -= 1.6 * vn * ny; }
                this.vx *= 0.7; this.vy *= 0.7;
                this.vz = Math.abs(this.vz) * 0.42 + 20;
                this.z = g.rimZ + 0.5;
                this.vx += (Math.random() - 0.5) * 18; this.vy += (Math.random() - 0.5) * 10;
                this.host.sound('clank');
            }
        }

        // furniture footprints: low balls bounce off the sides; one dropping onto a top rolls off it
        if (this.z < FURNITURE_Z) {
            for (const s of this.host.solids) {
                if (this.x + BALL_R <= s.x || this.x - BALL_R >= s.x + s.w || this.y + BALL_R <= s.y || this.y - BALL_R >= s.y + s.h) continue;
                if (pz >= FURNITURE_Z && this.vz < 0) {
                    this.z = FURNITURE_Z; this.vz = Math.abs(this.vz) * 0.45 + 30;
                    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
                    const ex = (this.x < cx ? s.x - BALL_R - 1 : s.x + s.w + BALL_R + 1) - this.x;
                    const ey = (this.y < cy ? s.y - BALL_R - 1 : s.y + s.h + BALL_R + 1) - this.y;
                    if (Math.abs(ex) < Math.abs(ey)) this.vx = Math.sign(ex) * Math.max(Math.abs(this.vx), 45);
                    else this.vy = Math.sign(ey) * Math.max(Math.abs(this.vy), 45);
                    this.state = 'air';
                    this.host.sound('bounce');
                    continue;
                }
                const pl = this.x + BALL_R - s.x, pr = s.x + s.w - (this.x - BALL_R);
                const pt = this.y + BALL_R - s.y, pb = s.y + s.h - (this.y - BALL_R);
                const m = Math.min(pl, pr, pt, pb);
                if (m === pl) { this.x = s.x - BALL_R; this.vx = -Math.abs(this.vx) * RESTITUTION; }
                else if (m === pr) { this.x = s.x + s.w + BALL_R; this.vx = Math.abs(this.vx) * RESTITUTION; }
                else if (m === pt) { this.y = s.y - BALL_R; this.vy = -Math.abs(this.vy) * RESTITUTION; }
                else { this.y = s.y + s.h + BALL_R; this.vy = Math.abs(this.vy) * RESTITUTION; }
            }
        }

        // room walls (tall, so at any height)
        const x0 = FLOOR_X + BALL_R, x1 = FLOOR_X + FLOOR_W - BALL_R;
        const y0 = FLOOR_Y + BALL_R, y1 = FLOOR_Y + FLOOR_H - BALL_R;
        if (this.x < x0) { this.x = x0; this.vx = Math.abs(this.vx) * RESTITUTION; }
        if (this.x > x1) { this.x = x1; this.vx = -Math.abs(this.vx) * RESTITUTION; }
        if (this.y < y0) { this.y = y0; this.vy = Math.abs(this.vy) * RESTITUTION; }
        if (this.y > y1) { this.y = y1; this.vy = -Math.abs(this.vy) * RESTITUTION; }

        // floor
        if (this.z <= 0 && this.state === 'air') {
            this.z = 0;
            if (Math.abs(this.vz) > 34) {
                if (Math.abs(this.vz) > 50) this.host.sound('bounce');
                this.vz = -this.vz * RESTITUTION;
                this.vx *= 0.86; this.vy *= 0.86;
            } else { this.vz = 0; this.state = 'roll'; }
        }
        if (this.state === 'roll') {
            this.z = 0;
            const sp = Math.hypot(this.vx, this.vy);
            const ns = Math.max(0, sp * Math.exp(-1.4 * h) - 14 * h);
            if (ns < 2.5) { this.settle(); return; }
            this.vx *= ns / sp; this.vy *= ns / sp;
        }
    }

    /** Comes to rest. If that spot is no good (door approach, unreachable), it goes back home. */
    private settle() {
        this.vx = this.vy = this.vz = 0;
        this.z = 0;
        this.clampToRoom();
        this.state = 'rest';
        if (!Number.isFinite(this.x) || !Number.isFinite(this.y) || !this.host.validRest(this.x, this.y)) this.respawn();
    }

    private clampToRoom() {
        this.x = Phaser.Math.Clamp(this.x, FLOOR_X + BALL_R, FLOOR_X + FLOOR_W - BALL_R);
        this.y = Phaser.Math.Clamp(this.y, FLOOR_Y + BALL_R, FLOOR_Y + FLOOR_H - BALL_R);
    }

    private angleFor(px: number, py: number) {
        const d = Math.hypot(this.geom.rimX - px, this.geom.rimY - py);
        return Phaser.Math.DegToRad(d < 40 ? 68 : d < 90 ? 60 : 52);
    }

    /** Launch speed whose arc comes down through the rim height R px away. */
    private idealSpeed(R: number, theta: number) {
        const dh = this.geom.rimZ - HAND_Z;
        const c = Math.cos(theta);
        const den = 2 * c * c * (R * Math.tan(theta) - dh);
        return den > 0 ? Math.sqrt((G * R * R) / den) : 60;
    }

    /** Full meter: enough to reach the far corner of the room. */
    private maxSpeed() { return this.idealSpeed(FLOOR_W * 1.05, Phaser.Math.DegToRad(52)); }

    private draw() {
        const shadowScale = Phaser.Math.Clamp(1 - this.z / 60, 0.45, 1);
        this.shadow.setVisible(this.state !== 'held').setPosition(Math.round(this.x), Math.round(this.y) + 1)
            .setScale(shadowScale).setAlpha(0.28 * shadowScale);
        if (this.state === 'held') return;
        this.sprite.setPosition(Math.round(this.x), Math.round(this.y - this.z - BALL_R));
        // sort by the floor spot, except right around the hoop where the net must stay in front
        this.sprite.setDepth(this.y);
        if (this.moving && !this.host.reducedMotion) this.sprite.angle += (this.vx >= 0 ? 1 : -1) * Math.min(14, Math.hypot(this.vx, this.vy) / 14);
    }

    /** Net flick after a make. */
    swishNet() {
        this.hoop.setFrame(1);
        this.scene.time.delayedCall(260, () => this.hoop.setFrame(0));
    }

    destroy() { this.sprite.destroy(); this.shadow.destroy(); this.hoop.destroy(); }
}
