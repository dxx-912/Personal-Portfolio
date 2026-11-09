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

// ---------- tiny 3x5 pixel font (uppercase, digits, a few symbols) ----------

const GLYPHS: Record<string, string> = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
    E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
    I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
    M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
    Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
    Y: '101101010010010', Z: '111001010100111',
    0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
    4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010',
    8: '111101111101111', 9: '111101111001110',
    ' ': '000000000000000', '-': '000000111000000', '.': '000000000000010', '>': '100010001010100',
    '<': '001010100010001', ',': '000000000010100', '!': '010010010000010'
};

/** Width in pixels of text drawn with pixelText at the given scale. */
export const pixelTextWidth = (text: string, scale = 1) => Math.max(0, text.length * 4 - 1) * scale;

/** Draws uppercase text with the 3x5 font. (x, y) is the top-left. */
export function pixelText(p: Px, text: string, x: number, y: number, color: string, scale = 1) {
    let cx = x;
    for (const ch of text.toUpperCase()) {
        const g = GLYPHS[ch] ?? GLYPHS[' '];
        for (let i = 0; i < 15; i++) {
            if (g[i] === '1') p.r(cx + (i % 3) * scale, y + Math.floor(i / 3) * scale, scale, scale, color);
        }
        cx += 4 * scale;
    }
}
