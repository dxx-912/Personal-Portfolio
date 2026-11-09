// Tiny pixel painting helpers for placeholder art. Everything is integer pixels, no smoothing.

export type Ctx = CanvasRenderingContext2D;

export const OUTLINE = '#1a1420';

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false;
    return [c, ctx];
}

export class Px {
    constructor(public ctx: Ctx, public ox = 0, public oy = 0) {}
    at(ox: number, oy: number) { return new Px(this.ctx, ox, oy); }
    r(x: number, y: number, w: number, h: number, c: string) {
        this.ctx.fillStyle = c;
        this.ctx.fillRect(this.ox + Math.round(x), this.oy + Math.round(y), Math.round(w), Math.round(h));
    }
    p(x: number, y: number, c: string) { this.r(x, y, 1, 1, c); }
    /** Filled rect with a 1px border. */
    box(x: number, y: number, w: number, h: number, fill: string, border = OUTLINE) {
        this.r(x, y, w, h, border);
        this.r(x + 1, y + 1, w - 2, h - 2, fill);
    }
    clear(x: number, y: number, w: number, h: number) {
        this.ctx.clearRect(this.ox + x, this.oy + y, w, h);
    }
}

/** Deterministic pseudo random so placeholder speckles are stable between loads. */
export function rng(seed: number) {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

/**
 * Adds a 1px outline around every opaque pixel, inside the given region.
 * Transparent pixels that touch an opaque pixel (4 neighbours) become the outline colour.
 */
export function outlineRegion(ctx: Ctx, x0: number, y0: number, w: number, h: number, color = OUTLINE) {
    const img = ctx.getImageData(x0, y0, w, h);
    const d = img.data;
    const solid = (x: number, y: number) =>
        x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
    const marks: number[] = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (solid(x, y)) continue;
            if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) marks.push(x, y);
        }
    }
    const [r, g, b] = hexToRgb(color);
    for (let i = 0; i < marks.length; i += 2) {
        const k = (marks[i + 1] * w + marks[i]) * 4;
        d[k] = r; d[k + 1] = g; d[k + 2] = b; d[k + 3] = 255;
    }
    ctx.putImageData(img, x0, y0);
}

/** Builds a white ring texture (1px outside the opaque pixels) used as the focus highlight. */
export function highlightRing(src: CanvasImageSource, w: number, h: number, frames: number): HTMLCanvasElement {
    const fw = w + 2;
    const [c, ctx] = makeCanvas(fw * frames, h + 2);
    const [tmp, tctx] = makeCanvas(w * frames, h);
    tctx.drawImage(src, 0, 0);
    const srcData = tctx.getImageData(0, 0, w * frames, h).data;
    const out = ctx.createImageData(fw * frames, h + 2);
    for (let f = 0; f < frames; f++) {
        const solid = (x: number, y: number) =>
            x >= 0 && y >= 0 && x < w && y < h && srcData[(y * w * frames + f * w + x) * 4 + 3] > 0;
        for (let y = -1; y <= h; y++) {
            for (let x = -1; x <= w; x++) {
                if (solid(x, y)) continue;
                if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) {
                    const k = ((y + 1) * fw * frames + f * fw + (x + 1)) * 4;
                    out.data[k] = 255; out.data[k + 1] = 250; out.data[k + 2] = 220; out.data[k + 3] = 255;
                }
            }
        }
    }
    ctx.putImageData(out, 0, 0);
    void tmp;
    return c;
}

function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
