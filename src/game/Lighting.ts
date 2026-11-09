import Phaser from 'phaser';
import { FLOOR_X, ROOM_H, ROOM_W, VIEW_MARGIN, prefersReducedMotion, tx, ty } from '../config';
import type { LightDef, RoomDef } from '../rooms/types';

const DARK = 0x06050b;

export type TimeOfDay = 0 | 1 | 2; // day, sunset, night

/** Visitor's local time decides the window view and how bright the room is. */
export function timeOfDay(d = new Date()): TimeOfDay {
    const h = d.getHours() + d.getMinutes() / 60;
    if (h >= 7 && h < 17) return 0;
    if ((h >= 17 && h < 20) || (h >= 6 && h < 7)) return 1;
    return 2;
}

const BASE_DARK: Record<TimeOfDay, number> = { 0: 0.24, 1: 0.32, 2: 0.42 };
const CONE: Record<TimeOfDay, { color: number; strength: number }> = {
    0: { color: 0xfff0c0, strength: 1 },
    1: { color: 0xffb070, strength: 0.9 },
    2: { color: 0x9fb4ff, strength: 0.45 }
};

/**
 * Layered warm light: a dim base (darkness overlay) with holes cut by every light source,
 * plus soft additive colour pools. Fairy lights twinkle. Cheap enough for phones.
 */
export class Lighting {
    readonly tod: TimeOfDay;
    private rt: Phaser.GameObjects.RenderTexture;
    private erasers: { img: Phaser.GameObjects.Image; x: number; y: number; strength: number }[] = [];
    private pools: { img: Phaser.GameObjects.Image; base: number }[] = [];
    private sleeper: Phaser.GameObjects.Image | null = null;
    private bulbs: Phaser.GameObjects.Image[] = [];
    private rm = prefersReducedMotion();

    constructor(private scene: Phaser.Scene, private def: RoomDef) {
        this.tod = timeOfDay();
        if (!scene.textures.exists('glow')) makeGlowTexture(scene);
        if (!scene.textures.exists('vignette')) makeVignette(scene);
        def.lights.forEach((l, i) => this.addLight(l, i));
        if (def.fairy) this.addFairy(def.fairy);
        this.rt = scene.add.renderTexture(-VIEW_MARGIN, -VIEW_MARGIN, ROOM_W + VIEW_MARGIN * 2, ROOM_H + VIEW_MARGIN * 2)
            .setOrigin(0).setDepth(9000);
        scene.add.image(ROOM_W / 2, ROOM_H / 2, 'vignette').setDepth(9100).setAlpha(0.8);
    }

    private addLight(l: LightDef, i: number) {
        const s = this.scene;
        if (l.kind === 'cone') {
            const key = `cone-${this.def.key}-${i}`;
            if (!s.textures.exists(key)) makeConeTexture(s, key, l.poly.map((p) => ({ x: tx(p.x), y: ty(p.y) })));
            const c = CONE[this.tod];
            const strength = (l.strength ?? 1) * c.strength;
            const pool = s.add.image(0, 0, key).setOrigin(0).setDepth(2).setBlendMode(Phaser.BlendModes.ADD).setTint(c.color);
            this.pools.push({ img: pool, base: 0.24 * strength });
            this.erasers.push({ img: s.make.image({ x: 0, y: 0, key, add: false }).setOrigin(0), x: 0, y: 0, strength });
        } else {
            const x = tx(l.x), y = ty(l.y);
            const sc = (l.r * 2) / 64;
            const img = s.make.image({ x: 0, y: 0, key: 'glow', add: false }).setScale(sc * (l.sx ?? 1), sc * (l.sy ?? 1));
            this.erasers.push({ img, x, y, strength: l.strength ?? 1 });
            const pool = s.add.image(x, y, 'glow').setScale(sc * (l.sx ?? 1) * 0.9, sc * (l.sy ?? 1) * 0.9)
                .setDepth(8990).setBlendMode(Phaser.BlendModes.ADD).setTint(l.color);
            this.pools.push({ img: pool, base: 0.2 * (l.strength ?? 1) });
        }
    }

    private addFairy(f: NonNullable<RoomDef['fairy']>) {
        const s = this.scene;
        const x0 = tx(f.x0), x1 = tx(f.x1), y = ty(f.y);
        const g = s.add.graphics().setDepth(1.9);
        g.lineStyle(1, 0x4a3a30, 1);
        const sag = (x: number) => y + Math.round(Math.abs(Math.sin(((x - x0) / 40) * Math.PI)) * 3);
        g.beginPath(); g.moveTo(x0, sag(x0));
        for (let x = x0; x <= x1; x += 2) g.lineTo(x, sag(x));
        g.strokePath();
        let k = 0;
        for (let x = x0 + 4; x < x1; x += 11, k++) {
            const b = s.add.image(x, sag(x) + 2, 'fx_bulb').setDepth(1.95).setTint(f.colors[k % f.colors.length]);
            this.bulbs.push(b);
            const pool = s.add.image(x, sag(x) + 2, 'glow').setScale(0.16).setDepth(1.96)
                .setBlendMode(Phaser.BlendModes.ADD).setTint(f.colors[k % f.colors.length]);
            this.pools.push({ img: pool, base: 0.25 });
            if (!this.rm) {
                s.tweens.add({
                    targets: [b, pool], alpha: { from: 1, to: 0.35 }, duration: 600 + Math.random() * 900,
                    yoyo: true, repeat: -1, delay: Math.random() * 1500, ease: 'Sine.easeInOut'
                });
            }
        }
        // a soft band of light along the top of the wall
        const cx = (x0 + x1) / 2;
        const band = s.make.image({ x: 0, y: 0, key: 'glow', add: false }).setScale((x1 - x0) / 64 * 0.9, 0.5);
        this.erasers.push({ img: band, x: cx, y: y + 4, strength: 0.55 });
    }

    /** Darkness 0 (fully lit) .. 1 (black); light 0..1 scales every source; glow lights the sleeper. */
    set(dark: number, light: number, sleeperGlow = 0, sleeperAt?: { x: number; y: number }) {
        const rt = this.rt;
        rt.clear();
        rt.fill(DARK, dark);
        for (const e of this.erasers) {
            e.img.setAlpha(Math.min(1, light * e.strength * (dark > 0.6 ? 1.4 : 1)));
            rt.erase(e.img, e.x + VIEW_MARGIN, e.y + VIEW_MARGIN);
        }
        if (sleeperGlow > 0 && sleeperAt) {
            this.sleeper ??= this.scene.make.image({ x: 0, y: 0, key: 'glow', add: false });
            this.sleeper.setAlpha(sleeperGlow).setScale(1.3);
            rt.erase(this.sleeper, sleeperAt.x + VIEW_MARGIN, sleeperAt.y + VIEW_MARGIN);
        }
        this.pools.forEach((p) => {
            p.img.setVisible(light > 0.05);
            if (!this.scene.tweens.isTweening(p.img)) p.img.setAlpha(p.base * light);
        });
        this.bulbs.forEach((b) => b.setVisible(light > 0.05));
    }

    /** The normal lit room for the visitor's time of day. */
    lit() { this.set(BASE_DARK[this.tod], 1); }

    get baseDark() { return BASE_DARK[this.tod]; }

    /** A brief extra glow at a point (door pulse). */
    pulse(x: number, y: number, color = 0xffc070) {
        if (this.rm) return;
        const p = this.scene.add.image(tx(x), ty(y), 'glow').setScale(1.2).setDepth(8995).setBlendMode(Phaser.BlendModes.ADD)
            .setTint(color).setAlpha(0);
        this.scene.tweens.add({ targets: p, alpha: 0.55, duration: 380, yoyo: true, repeat: 1, onComplete: () => p.destroy() });
    }

    get floorX() { return FLOOR_X; }
}

function makeConeTexture(scene: Phaser.Scene, key: string, poly: { x: number; y: number }[]) {
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
    scene.textures.addCanvas(key, c);
}

function makeGlowTexture(scene: Phaser.Scene) {
    const s = 64;
    const c = document.createElement('canvas');
    c.width = s; c.height = s;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    scene.textures.addCanvas('glow', c);
}

function makeVignette(scene: Phaser.Scene) {
    const w = ROOM_W + VIEW_MARGIN * 2, h = ROOM_H + VIEW_MARGIN * 2;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.5, w / 2, h / 2, w * 0.62);
    g.addColorStop(0, 'rgba(6,5,11,0)');
    g.addColorStop(1, 'rgba(6,5,11,0.7)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    scene.textures.addCanvas('vignette', c);
}
