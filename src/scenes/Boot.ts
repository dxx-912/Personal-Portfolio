import Phaser from 'phaser';
import { ASSETS, hlKey, type AssetDef, type AssetKey } from '../assets/manifest';
import { highlightRing, makeCanvas, outlineRegion, Px } from '../assets/paint';
import { state } from '../state';

const defs = ASSETS as Record<AssetKey, AssetDef>;

/** Loads final art files where they exist, paints placeholders for the rest. */
export class Boot extends Phaser.Scene {
    constructor() { super('Boot'); }

    preload() {
        for (const [key, def] of Object.entries(defs)) {
            if (!def.url) continue;
            if (def.frames && def.frames > 1) {
                this.load.spritesheet(key, def.url, { frameWidth: def.w, frameHeight: def.h });
            } else {
                this.load.image(key, def.url);
            }
        }
    }

    create() {
        for (const [key, def] of Object.entries(defs)) {
            const frames = def.frames ?? 1;
            if (!def.url) this.paint(key, def, frames);
            if (def.highlight) this.makeHighlight(key, def, frames);
        }
        this.makeAnims();
        document.getElementById('loading')?.remove();
        this.scene.start('Room', { room: 'dorm', entry: state.woke ? 'wake' : 'sleep' });
    }

    private paint(key: string, def: AssetDef, frames: number) {
        const [canvas, ctx] = makeCanvas(def.w * frames, def.h);
        def.paint(new Px(ctx), def.w, def.h);
        if (def.outline) for (let f = 0; f < frames; f++) outlineRegion(ctx, f * def.w, 0, def.w, def.h);
        const tex = this.textures.addCanvas(key, canvas)!;
        if (frames > 1) for (let f = 0; f < frames; f++) tex.add(f, 0, f * def.w, 0, def.w, def.h);
    }

    private makeHighlight(key: string, def: AssetDef, frames: number) {
        const src = this.textures.get(key).getSourceImage() as CanvasImageSource;
        const ring = highlightRing(src, def.w, def.h, frames);
        const tex = this.textures.addCanvas(hlKey(key), ring)!;
        if (frames > 1) for (let f = 0; f < frames; f++) tex.add(f, 0, f * (def.w + 2), 0, def.w + 2, def.h + 2);
    }

    private makeAnims() {
        const a = this.anims;
        const dirs = ['down', 'up', 'side'];
        dirs.forEach((d, i) => {
            const base = i * 6;
            a.create({ key: `idle-${d}`, frames: a.generateFrameNumbers('daniel', { frames: [base, base + 1] }), frameRate: 2, repeat: -1 });
            a.create({ key: `walk-${d}`, frames: a.generateFrameNumbers('daniel', { frames: [base + 2, base + 3, base + 4, base + 5] }), frameRate: 9, repeat: -1 });
        });
        a.create({ key: 'sleep', frames: a.generateFrameNumbers('daniel_sleep', { frames: [0, 1] }), frameRate: 1.2, repeat: -1 });
        a.create({ key: 'cat-idle', frames: a.generateFrameNumbers('cat', { frames: [0, 1] }), frameRate: 1.5, repeat: -1 });
        a.create({ key: 'cat-walk', frames: a.generateFrameNumbers('cat', { frames: [2, 3] }), frameRate: 6, repeat: -1 });
        a.create({ key: 'sparkle', frames: a.generateFrameNumbers('sparkle', { frames: [0, 1, 0] }), frameRate: 3, repeat: -1, repeatDelay: 900 });
    }
}
