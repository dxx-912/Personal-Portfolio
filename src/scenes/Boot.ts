import Phaser from 'phaser';
import decorFiles from 'virtual:decor-files';
import { ASSETS, hlKey, slotKey, type AssetDef, type AssetKey } from '../assets/manifest';
import { highlightRing, makeCanvas, outlineRegion, Px } from '../assets/paint';
import { CAT_FRAMES, DANIEL_FRAMES } from '../assets/placeholders';
import { state } from '../state';

const defs = ASSETS as Record<AssetKey, AssetDef>;
const hasFile = (file: string) => decorFiles.includes(file);

/** Loads final art files where they exist, paints placeholders for the rest, composes image slots. */
export class Boot extends Phaser.Scene {
    constructor() { super('Boot'); }

    preload() {
        for (const [key, def] of Object.entries(defs)) {
            if (def.url) {
                if (def.frames && def.frames > 1) this.load.spritesheet(key, def.url, { frameWidth: def.w, frameHeight: def.h });
                else this.load.image(key, def.url);
            }
            if (def.slot && hasFile(def.slot.file)) this.load.image(slotKey(def.slot.file), `assets/decor/${def.slot.file}`);
        }
    }

    async create() {
        for (const [key, def] of Object.entries(defs)) {
            const frames = def.frames ?? 1;
            if (!def.url) this.paint(key, def, frames);
            if (def.highlight) this.makeHighlight(key, def, frames);
        }
        this.makeAnims();
        // Crisp labels (book spines, signs) use the pixel web font. Wait briefly for it, never long.
        try {
            await Promise.race([
                document.fonts.load('600 16px "Pixelify Sans"'),
                new Promise((r) => setTimeout(r, 700))
            ]);
        } catch { /* fall back to the default font */ }
        document.getElementById('loading')?.remove();
        this.scene.start('Room', { room: 'dorm', entry: state.woke ? 'wake' : 'sleep' });
    }

    private paint(key: string, def: AssetDef, frames: number) {
        const [canvas, ctx] = makeCanvas(def.w * frames, def.h);
        const slotImg = def.slot && this.textures.exists(slotKey(def.slot.file))
            ? this.textures.get(slotKey(def.slot.file)).getSourceImage() as CanvasImageSource : null;
        if (!(def.slot?.hideIfMissing && !slotImg)) def.paint(new Px(ctx), def.w, def.h);
        if (slotImg && def.slot) {
            const r = def.slot.rect ?? { x: 1, y: 1, w: def.w - 2, h: def.h - 2 };
            if (def.slot.hideIfMissing && !def.slot.rect) ctx.fillStyle = '#f7f3ea', ctx.fillRect(0, 0, def.w, def.h);
            drawCover(ctx, slotImg, r.x, r.y, r.w, r.h);
        }
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
        (['down', 'up', 'side'] as const).forEach((d) => {
            const base = DANIEL_FRAMES[d];
            for (const sheet of ['daniel', 'daniel_shirt']) {
                const pre = sheet === 'daniel' ? '' : 'shirt-';
                a.create({ key: `${pre}idle-${d}`, frames: a.generateFrameNumbers(sheet, { frames: [base, base + 1] }), frameRate: 2, repeat: -1 });
                a.create({ key: `${pre}walk-${d}`, frames: a.generateFrameNumbers(sheet, { frames: [base + 2, base + 3, base + 4, base + 5] }), frameRate: 9, repeat: -1 });
            }
        });
        a.create({ key: 'sleep', frames: a.generateFrameNumbers('daniel_sleep', { frames: [0, 1] }), frameRate: 1.2, repeat: -1 });
        a.create({ key: 'cat-idle', frames: a.generateFrameNumbers('cat', { frames: [CAT_FRAMES.idle, CAT_FRAMES.idle + 1] }), frameRate: 1.5, repeat: -1 });
        a.create({ key: 'cat-walk', frames: a.generateFrameNumbers('cat', { frames: [CAT_FRAMES.walk, CAT_FRAMES.walk + 1] }), frameRate: 6, repeat: -1 });
        a.create({ key: 'cat-sleep', frames: a.generateFrameNumbers('cat', { frames: [CAT_FRAMES.sleep, CAT_FRAMES.sleep + 1] }), frameRate: 0.8, repeat: -1 });
        a.create({ key: 'laptop-screen', frames: a.generateFrameNumbers('dorm_laptop', { frames: [0, 1] }), frameRate: 1.6, repeat: -1 });
        a.create({ key: 'puff', frames: a.generateFrameNumbers('fx_puff', { frames: [0, 1] }), frameRate: 8, repeat: 0 });
    }
}

/**
 * Scales an image down to cover the slot, centre cropped. Averaging (not nearest neighbour) on the way
 * down keeps tiny slots from turning into noise; the result is still drawn as hard pixels in game.
 */
function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource, x: number, y: number, w: number, h: number) {
    const iw = (img as HTMLImageElement).width, ih = (img as HTMLImageElement).height;
    if (!iw || !ih) return;
    const s = Math.max(w / iw, h / ih);
    const sw = w / s, sh = h / s;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
    ctx.imageSmoothingEnabled = false;
}
