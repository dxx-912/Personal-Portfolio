// Grid pathfinding for click and tap to walk. Positions are feet positions in world pixels.

import { CHAR_BODY, FLOOR_H, FLOOR_W, FLOOR_X, FLOOR_Y, NAV_CELL } from '../config';

export interface Rect { x: number; y: number; w: number; h: number }
export interface Pt { x: number; y: number }

export const bodyAt = (fx: number, fy: number): Rect =>
    ({ x: fx - CHAR_BODY.w / 2, y: fy - CHAR_BODY.h, w: CHAR_BODY.w, h: CHAR_BODY.h });

export const overlaps = (a: Rect, b: Rect) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export class NavGrid {
    readonly cols = Math.floor(FLOOR_W / NAV_CELL);
    readonly rows = Math.floor(FLOOR_H / NAV_CELL);
    private open: Uint8Array;

    constructor(private solids: Rect[]) {
        this.open = new Uint8Array(this.cols * this.rows);
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const p = this.center(c, r);
                this.open[r * this.cols + c] = this.isFree(p.x, p.y) ? 1 : 0;
            }
        }
    }

    /** True if the character's feet box at (fx, fy) is inside the floor and touches no furniture. */
    isFree(fx: number, fy: number) {
        const b = bodyAt(fx, fy);
        if (b.x < FLOOR_X || b.y < FLOOR_Y || b.x + b.w > FLOOR_X + FLOOR_W || b.y + b.h > FLOOR_Y + FLOOR_H) return false;
        return !this.solids.some((s) => overlaps(b, s));
    }

    /** Feet position for a cell: horizontally centered, at the bottom of the cell. */
    center(c: number, r: number): Pt {
        return { x: FLOOR_X + c * NAV_CELL + NAV_CELL / 2, y: FLOOR_Y + r * NAV_CELL + NAV_CELL - 1 };
    }

    cellOf(p: Pt) {
        return {
            c: Math.max(0, Math.min(this.cols - 1, Math.floor((p.x - FLOOR_X) / NAV_CELL))),
            r: Math.max(0, Math.min(this.rows - 1, Math.floor((p.y - FLOOR_Y) / NAV_CELL)))
        };
    }

    private ok(c: number, r: number) {
        return c >= 0 && r >= 0 && c < this.cols && r < this.rows && this.open[r * this.cols + c] === 1;
    }

    /** Nearest open cell to a point (breadth-first ring search). */
    nearestOpen(p: Pt): { c: number; r: number } | null {
        const start = this.cellOf(p);
        if (this.ok(start.c, start.r)) return start;
        let best: { c: number; r: number } | null = null;
        let bestD = Infinity;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this.ok(c, r)) continue;
                const q = this.center(c, r);
                const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
                if (d < bestD) { bestD = d; best = { c, r }; }
            }
        }
        return best;
    }

    /** Nearest free feet position to p (exact if p itself is free). */
    nearestFreePoint(p: Pt): Pt {
        if (this.isFree(p.x, p.y)) return p;
        const n = this.nearestOpen(p);
        return n ? this.center(n.c, n.r) : p;
    }

    /** A* over 8 neighbours with no corner cutting. Returns waypoints ending exactly at `to` if it is free. */
    findPath(from: Pt, to: Pt): Pt[] | null {
        const s = this.nearestOpen(from);
        const g = this.nearestOpen(to);
        if (!s || !g) return null;
        const N = this.cols * this.rows;
        const idx = (c: number, r: number) => r * this.cols + c;
        const gScore = new Float32Array(N).fill(Infinity);
        const fScore = new Float32Array(N).fill(Infinity);
        const came = new Int32Array(N).fill(-1);
        const closed = new Uint8Array(N);
        const openList: number[] = [];
        const h = (c: number, r: number) => {
            const dx = Math.abs(c - g.c), dy = Math.abs(r - g.r);
            return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
        };
        const si = idx(s.c, s.r);
        gScore[si] = 0; fScore[si] = h(s.c, s.r); openList.push(si);
        const gi = idx(g.c, g.r);
        while (openList.length) {
            let bi = 0;
            for (let i = 1; i < openList.length; i++) if (fScore[openList[i]] < fScore[openList[bi]]) bi = i;
            const cur = openList.splice(bi, 1)[0];
            if (cur === gi) break;
            closed[cur] = 1;
            const cc = cur % this.cols, cr = Math.floor(cur / this.cols);
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (!dr && !dc) continue;
                    const nc = cc + dc, nr = cr + dr;
                    if (!this.ok(nc, nr)) continue;
                    if (dc && dr && (!this.ok(cc + dc, cr) || !this.ok(cc, cr + dr))) continue;
                    const ni = idx(nc, nr);
                    if (closed[ni]) continue;
                    const t = gScore[cur] + (dc && dr ? Math.SQRT2 : 1);
                    if (t < gScore[ni]) {
                        came[ni] = cur; gScore[ni] = t; fScore[ni] = t + h(nc, nr);
                        if (!openList.includes(ni)) openList.push(ni);
                    }
                }
            }
        }
        if (came[gi] === -1 && gi !== si) return null;
        const cells: number[] = [];
        for (let i = gi; i !== -1; i = came[i]) { cells.push(i); if (i === si) break; }
        cells.reverse();
        const raw: Pt[] = [from, ...cells.map((i) => this.center(i % this.cols, Math.floor(i / this.cols)))];
        if (this.isFree(to.x, to.y)) raw.push(to);
        // String pulling: from each anchor, jump to the farthest waypoint with a clear straight line.
        const out: Pt[] = [];
        let a = 0;
        while (a < raw.length - 1) {
            let j = raw.length - 1;
            while (j > a + 1 && !this.clearLine(raw[a], raw[j])) j--;
            out.push(raw[j]);
            a = j;
        }
        return out;
    }

    clearLine(a: Pt, b: Pt) {
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.ceil(d / 3);
        for (let i = 0; i <= steps; i++) {
            const t = steps ? i / steps : 0;
            if (!this.isFree(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
        }
        return true;
    }
}
