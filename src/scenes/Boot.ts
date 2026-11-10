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
            const slot = def.slot;
            const r = slot.rect ?? { x: 1, y: 1, w: def.w - 2, h: def.h - 2 };
            if (slot.hideIfMissing && !slot.rect) ctx.fillStyle = '#f7f3ea', ctx.fillRect(0, 0, def.w, def.h);
            const src = prepSlot(slotImg, slot.knockout ?? false, slot.fit === 'contain');
            const n = slot.sharp ?? 1;
            if (n > 1) {
                // drawn at n times the room's resolution and shown at 1/n scale, so words stay readable
                const [sc, sctx] = makeCanvas(r.w * n, r.h * n);
                drawSlot(sctx, src, 0, 0, r.w * n, r.h * n, slot.fit ?? 'cover');
                const st = this.textures.addCanvas(`${key}#sharp`, sc)!;
                st.setFilter(Phaser.Textures.FilterMode.LINEAR);
                st.customData = { x: r.x, y: r.y, n };
                if (!slot.knockout) ctx.fillStyle = '#111', ctx.fillRect(r.x, r.y, r.w, r.h);
            } else {
                drawSlot(ctx, src, r.x, r.y, r.w, r.h, slot.fit ?? 'cover');
            }
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
        a.create({ key: 'sleep_home', frames: a.generateFrameNumbers('daniel_sleep_home', { frames: [0, 1] }), frameRate: 1.2, repeat: -1 });
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
function drawSlot(ctx: CanvasRenderingContext2D, img: CanvasImageSource, x: number, y: number, w: number, h: number, fit: 'cover' | 'contain') {
    const iw = (img as HTMLImageElement).width, ih = (img as HTMLImageElement).height;
    if (!iw || !ih) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (fit === 'contain') {
        const s = Math.min(w / iw, h / ih);
        const dw = iw * s, dh = ih * s;
        ctx.drawImage(img, 0, 0, iw, ih, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    } else {
        const s = Math.max(w / iw, h / ih);
        const sw = w / s, sh = h / s;
        ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
    }
    ctx.imageSmoothingEnabled = false;
}

/**
 * Optional clean up before drawing: knockout turns a dark background see-through (alpha follows
 * brightness, so edges stay soft), trim crops to the part that differs from the background.
 */
function prepSlot(img: CanvasImageSource, knockout: boolean, trim: boolean): CanvasImageSource {
    if (!knockout && !trim) return img;
    const iw = (img as HTMLImageElement).width, ih = (img as HTMLImageElement).height;
    if (!iw || !ih) return img;
    const [c, x] = makeCanvas(iw, ih);
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, iw, ih);
    const px = d.data;
    const br = px[0], bg = px[1], bb = px[2]; // the top left pixel is the background colour
    let x0 = iw, y0 = ih, x1 = -1, y1 = -1;
    for (let i = 0; i < iw * ih; i++) {
        const o = i * 4;
        const diff = Math.max(Math.abs(px[o] - br), Math.abs(px[o + 1] - bg), Math.abs(px[o + 2] - bb));
        if (knockout) px[o + 3] = Math.round(Math.max(0, Math.min(1, (diff - 30) / 90)) * px[o + 3]);
        if (diff > 60) {
            const cx = i % iw, cy = (i / iw) | 0;
            if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
        }
    }
    x.putImageData(d, 0, 0);
    if (!trim || x1 < 0) return c;
    const pad = 2;
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(iw - 1, x1 + pad); y1 = Math.min(ih - 1, y1 + pad);
    const [t, tctx] = makeCanvas(x1 - x0 + 1, y1 - y0 + 1);
    tctx.drawImage(c, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 0, 0, x1 - x0 + 1, y1 - y0 + 1);
    return t;
}
