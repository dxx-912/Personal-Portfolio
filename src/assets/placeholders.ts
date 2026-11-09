// Placeholder pixel art, painted at the final sprite sizes.
// Each painter draws one asset. The manifest decides sizes and whether to outline.
// When real art lands, set `url` on the manifest entry; these painters are then skipped.

import {
    CAP_H, CHAR_FRAME, CAT_FRAME, FLOOR_H, FLOOR_W, FLOOR_X, FLOOR_Y, RIM_H, ROOM_H, ROOM_W, SIDE_W
} from '../config';
import { OUTLINE, Px, rng } from './paint';

export type Painter = (p: Px, w: number, h: number) => void;

// ---------- palettes ----------

export interface RoomPalette {
    wall: string; wallShade: string; base: string; cap: string; capDark: string;
    floor: string; floorDark: string; floorLight: string;
}

export const DORM_PAL: RoomPalette = {
    wall: '#ecdfc6', wallShade: '#dccdb0', base: '#d2bf9c', cap: '#c9b596', capDark: '#a8936f',
    floor: '#6f7a8f', floorDark: '#5d6679', floorLight: '#7c879c'
};

export const HOME_PAL: RoomPalette = {
    wall: '#d3ecda', wallShade: '#c2e0cb', base: '#b5d7c0', cap: '#a9cfb6', capDark: '#86b294',
    floor: '#8a6244', floorDark: '#6e4c33', floorLight: '#98704f'
};

const WOOD = { light: '#b07b50', mid: '#8f5f3d', dark: '#6b4429', deep: '#4e2f1c' };
const PALE_WOOD = { light: '#d0a476', mid: '#b88a5a', dark: '#94683f', deep: '#6d4a2b' };
const METAL = { light: '#b7bfcc', mid: '#8c95a4', dark: '#4a505d', deep: '#2c3039' };

// ---------- rooms ----------

function paintRoom(pal: RoomPalette, floorKind: 'carpet' | 'wood', seed: number): Painter {
    return (p) => {
        const rand = rng(seed);
        // back wall face
        p.r(SIDE_W, CAP_H, FLOOR_W, FLOOR_Y - CAP_H, pal.wall);
        p.r(SIDE_W, CAP_H, FLOOR_W, 3, pal.wallShade);
        // wainscot and baseboard
        p.r(SIDE_W, FLOOR_Y - 10, FLOOR_W, 1, pal.capDark);
        p.r(SIDE_W, FLOOR_Y - 9, FLOOR_W, 9, pal.base);
        p.r(SIDE_W, FLOOR_Y - 2, FLOOR_W, 2, pal.capDark);

        // floor
        p.r(FLOOR_X, FLOOR_Y, FLOOR_W, FLOOR_H, pal.floor);
        if (floorKind === 'carpet') {
            for (let i = 0; i < 260; i++) {
                const x = FLOOR_X + Math.floor(rand() * FLOOR_W);
                const y = FLOOR_Y + Math.floor(rand() * FLOOR_H);
                p.p(x, y, rand() < 0.75 ? pal.floorDark : pal.floorLight);
            }
        } else {
            const plankH = 8;
            for (let row = 0; row * plankH < FLOOR_H; row++) {
                const y = FLOOR_Y + row * plankH;
                const offset = (row * 37) % 56;
                for (let x = FLOOR_X - offset; x < FLOOR_X + FLOOR_W; x += 56) {
                    const x0 = Math.max(FLOOR_X, x);
                    const x1 = Math.min(FLOOR_X + FLOOR_W, x + 56);
                    const tone = rand();
                    if (tone < 0.3) p.r(x0, y, x1 - x0, plankH, pal.floorLight);
                    if (x > FLOOR_X) p.r(x, y, 1, plankH, pal.floorDark);
                    // grain
                    for (let g = 0; g < 3; g++) {
                        const gx = x0 + Math.floor(rand() * Math.max(1, x1 - x0 - 6));
                        p.r(gx, y + 2 + Math.floor(rand() * 4), 4, 1, pal.floorDark);
                    }
                }
                p.r(FLOOR_X, y + plankH - 1, FLOOR_W, 1, pal.floorDark);
            }
        }
        // contact shadow under the back wall
        p.ctx.fillStyle = 'rgba(10, 8, 20, 0.28)';
        p.ctx.fillRect(FLOOR_X, FLOOR_Y, FLOOR_W, 3);

        // top cap, side strips, front rim
        p.r(0, 0, ROOM_W, CAP_H, pal.cap);
        p.r(0, CAP_H - 1, ROOM_W, 1, pal.capDark);
        p.r(0, 0, SIDE_W, ROOM_H, pal.cap);
        p.r(ROOM_W - SIDE_W, 0, SIDE_W, ROOM_H, pal.cap);
        p.r(SIDE_W - 1, CAP_H, 1, ROOM_H - CAP_H - RIM_H, pal.capDark);
        p.r(ROOM_W - SIDE_W, CAP_H, 1, ROOM_H - CAP_H - RIM_H, pal.capDark);
        p.r(0, ROOM_H - RIM_H, ROOM_W, RIM_H, pal.cap);
        p.r(SIDE_W - 1, ROOM_H - RIM_H, FLOOR_W + 2, 1, pal.capDark);
        // outer edge
        p.r(0, 0, ROOM_W, 1, OUTLINE);
        p.r(0, ROOM_H - 1, ROOM_W, 1, OUTLINE);
        p.r(0, 0, 1, ROOM_H, OUTLINE);
        p.r(ROOM_W - 1, 0, 1, ROOM_H, OUTLINE);
    };
}

// ---------- shared bits ----------

/** Door in a side wall strip, drawn for the right wall (flip for the left). */
const doorSide: Painter = (p, w, h) => {
    p.r(0, 0, w, h, OUTLINE);
    p.r(1, 1, w - 2, h - 1, '#0d0b12');
    // door slab, open inward
    p.r(1, 2, 4, h - 3, WOOD.mid);
    p.r(1, 2, 1, h - 3, WOOD.light);
    p.p(3, Math.floor(h / 2), '#e8c060');
    // floor sill
    p.r(0, h - 2, w, 2, WOOD.dark);
};

const sparkle: Painter = (p) => {
    // frame 0: small plus, frame 1: bigger star
    const c = '#fff6c8';
    p.p(3, 2, c); p.p(2, 3, c); p.p(3, 3, '#ffffff'); p.p(4, 3, c); p.p(3, 4, c);
    const q = p.at(7, 0);
    q.r(3, 0, 1, 7, c); q.r(0, 3, 7, 1, c);
    q.r(2, 2, 3, 3, '#ffffff');
};

/** Floating sleep "z", two sizes. */
const fxZ: Painter = (p) => {
    const c = '#e8ecff';
    p.r(0, 0, 4, 1, c); p.p(2, 1, c); p.p(1, 2, c); p.r(0, 3, 4, 1, c);
    const q = p.at(5, 0);
    q.r(0, 0, 5, 1, c); q.p(3, 1, c); q.p(2, 2, c); q.p(1, 3, c); q.r(0, 4, 5, 1, c);
};

/** Small heart for petting the cat. */
const fxHeart: Painter = (p) => {
    const c = '#ff6b8a';
    p.r(0, 1, 2, 2, c); p.r(3, 1, 2, 2, c); p.r(0, 2, 5, 1, c); p.r(1, 3, 3, 1, c); p.p(2, 4, c);
    p.p(1, 1, '#ffd0da');
};

// ---------- character ----------

type Dir = 'down' | 'up' | 'side';

const SKIN = '#f1c39b', SKIN_D = '#d9a27a', HAIR = '#231c26', HAIR_L = '#3a2f3f';
const HOODIE = '#3d6fa8', HOODIE_D = '#2c5383', HOODIE_L = '#5689c2';
const PANTS = '#2b2e44', SHOE = '#17131c';

function drawDaniel(p: Px, dir: Dir, bob: number, step: number) {
    const y0 = 1 + bob;
    // legs (step: 0 rest, 1 left forward, 2 rest, 3 right forward)
    const lUp = step === 1 ? 1 : 0;
    const rUp = step === 3 ? 1 : 0;
    if (dir === 'side') {
        const fx = step === 1 ? 1 : step === 3 ? -1 : 0;
        p.r(6 + fx, 17, 3, 3, PANTS); p.r(6 + fx, 20, 4, 1, SHOE);
        p.r(8 - fx, 17, 3, 3, PANTS); p.r(8 - fx, 20, 4, 1, SHOE);
    } else {
        p.r(5, 17, 3, 3 - lUp, PANTS); p.r(5, 20 - lUp, 3, 1, SHOE);
        p.r(9, 17, 3, 3 - rUp, PANTS); p.r(9, 20 - rUp, 3, 1, SHOE);
    }
    // body
    const by = 11 + bob;
    if (dir === 'side') {
        p.r(5, by, 7, 6 - bob, HOODIE);
        p.r(5, by, 1, 6 - bob, HOODIE_D);
        p.r(8, by + 1, 2, 4, HOODIE_D); // arm
        p.p(9, by + 5 - bob, SKIN);
    } else {
        p.r(4, by, 9, 6 - bob, HOODIE);
        p.r(4, by, 1, 6 - bob, HOODIE_D);
        p.r(12, by, 1, 6 - bob, HOODIE_D);
        p.r(3, by + 1, 1, 4, HOODIE_D);
        p.r(13, by + 1, 1, 4, HOODIE_D);
        p.p(3, by + 5 - bob, SKIN); p.p(13, by + 5 - bob, SKIN);
        if (dir === 'down') {
            p.r(7, by, 3, 1, HOODIE_L); // collar
            p.r(6, by + 3, 5, 1, HOODIE_L); // pocket line
        }
    }
    // head (big, chunky)
    const hx = 2;
    p.r(hx, y0, 13, 10, HAIR);
    if (dir === 'down') {
        p.r(hx + 1, y0 + 4, 11, 6, SKIN);
        p.r(hx + 1, y0 + 9, 11, 1, SKIN_D);
        p.r(hx + 2, y0 + 3, 4, 2, HAIR); // fringe
        p.r(hx + 7, y0 + 3, 4, 1, HAIR);
        p.r(hx + 3, y0 + 6, 1, 2, OUTLINE);
        p.r(hx + 9, y0 + 6, 1, 2, OUTLINE);
        p.p(hx + 2, y0 + 8, '#f2a59b');
        p.p(hx + 10, y0 + 8, '#f2a59b');
        p.r(hx + 1, y0 + 1, 3, 1, HAIR_L);
    } else if (dir === 'up') {
        p.r(hx + 2, y0 + 1, 4, 1, HAIR_L);
        p.r(hx + 1, y0 + 9, 11, 1, SKIN_D); // neck
    } else {
        p.r(hx + 6, y0 + 4, 7, 6, SKIN);
        p.r(hx + 6, y0 + 3, 5, 2, HAIR);
        p.r(hx + 10, y0 + 6, 1, 2, OUTLINE);
        p.p(hx + 12, y0 + 7, SKIN_D);
        p.p(hx + 4, y0 + 6, SKIN_D); // ear
        p.r(hx + 1, y0 + 1, 4, 1, HAIR_L);
    }
}

/** 18 frames in a strip: for each of down, up, side: idle0, idle1, walk0..3. */
const daniel: Painter = (p) => {
    const dirs: Dir[] = ['down', 'up', 'side'];
    dirs.forEach((dir, d) => {
        for (let f = 0; f < 6; f++) {
            const q = p.at((d * 6 + f) * CHAR_FRAME.w, 0);
            if (f < 2) drawDaniel(q, dir, f, 0);
            else drawDaniel(q, dir, f % 2 === 1 ? 1 : 0, f - 2);
        }
    });
};

/** Asleep: head on the pillow, blanket hump. Two breathing frames. */
const danielSleep: Painter = (p) => {
    for (let f = 0; f < 2; f++) {
        const q = p.at(f * 30, 0);
        const rise = f;
        q.r(10, 5 - rise, 19, 8 + rise, '#6c7fc0');
        q.r(10, 5 - rise, 19, 1, '#8a9ad2');
        q.r(14, 8, 1, 4, '#5a6aa8');
        q.r(1, 2, 11, 10, HAIR);
        q.r(3, 5, 8, 6, SKIN);
        q.r(4, 7, 2, 1, OUTLINE);
        q.r(8, 7, 2, 1, OUTLINE);
        q.r(3, 4, 4, 2, HAIR);
    }
};

// ---------- cat ----------

const CAT = '#e5994a', CAT_D = '#b9702f', CAT_L = '#f6c27f';

function drawCat(p: Px, tail: number, step: number) {
    // body
    p.r(3, 5, 9, 5, CAT);
    p.r(4, 6, 1, 3, CAT_D); p.r(7, 5, 1, 3, CAT_D);
    p.r(4, 9, 7, 1, CAT_L);
    // legs
    const a = step === 1 ? 1 : 0, b = step === 2 ? 1 : 0;
    p.r(4 + a, 10, 1, 1, CAT_D); p.r(10 - b, 10, 1, 1, CAT_D);
    // head
    p.r(10, 2, 5, 5, CAT);
    p.p(10, 1, CAT); p.p(14, 1, CAT);
    p.p(11, 4, OUTLINE); p.p(13, 4, OUTLINE);
    p.p(12, 5, '#f2a59b');
    // tail
    if (tail === 0) { p.r(1, 3, 2, 1, CAT); p.r(1, 2, 1, 2, CAT); }
    else { p.r(0, 5, 3, 1, CAT); p.p(0, 4, CAT); }
}

const cat: Painter = (p) => {
    drawCat(p.at(0, 0), 0, 0);
    drawCat(p.at(CAT_FRAME.w, 0), 1, 0);
    drawCat(p.at(CAT_FRAME.w * 2, 0), 0, 1);
    drawCat(p.at(CAT_FRAME.w * 3, 0), 1, 2);
};

// ---------- dorm furniture ----------

const dormWindow: Painter = (p, w, h) => {
    p.box(0, 0, w, h - 3, '#3c2a22');
    p.r(2, 2, w - 4, h - 7, '#9fd0ee');
    p.r(2, 2, w - 4, 4, '#c3e4f6');
    p.r(4, 8, 2, 8, '#d9f0fb'); p.r(6, 8, 1, 4, '#d9f0fb');
    p.r(Math.floor(w / 2) - 1, 2, 2, h - 7, '#3c2a22');
    p.r(2, Math.floor((h - 3) / 2), w - 4, 1, '#3c2a22');
    // sill
    p.r(-0, h - 4, w, 4, '#c9b596');
    p.r(0, h - 4, w, 1, '#efe4cf');
};

const PENNANT_COLORS = ['#2f4f8f', '#e8b83a', '#c8423b', '#3f8a5a', '#7a4fa0', '#d9733a'];

const dormPennants: Painter = (p, w) => {
    // sagging string
    for (let x = 0; x < w; x++) {
        const sag = Math.round(Math.sin((x / (w - 1)) * Math.PI) * 2);
        p.p(x, 1 + sag, '#4a3a30');
    }
    PENNANT_COLORS.forEach((c, i) => {
        const x = 2 + i * 9;
        const sag = Math.round(Math.sin(((x + 3) / (w - 1)) * Math.PI) * 2);
        for (let r = 0; r < 9; r++) {
            const half = Math.max(0, 3 - Math.floor(r / 3));
            p.r(x + 3 - half, 2 + sag + r, half * 2 + 1, 1, c);
        }
        p.p(x + 3, 3 + sag, '#ffffff');
    });
};

const dormPinboard: Painter = (p, w, h) => {
    p.box(0, 0, w, h, WOOD.dark);
    p.r(2, 2, w - 4, h - 4, '#c69863');
    const rand = rng(7);
    for (let i = 0; i < 60; i++) p.p(2 + Math.floor(rand() * (w - 4)), 2 + Math.floor(rand() * (h - 4)), '#ad7f4d');
    const papers: [number, number, number, number, string][] = [
        [5, 4, 13, 11, '#f7f3ea'], [21, 5, 15, 11, '#eab5a8'], [40, 4, 12, 15, '#a9c8ea'],
        [7, 19, 15, 11, '#f1d175'], [27, 20, 12, 11, '#f7f3ea'], [44, 22, 14, 9, '#bfe3c4']
    ];
    papers.forEach(([x, y, pw, ph, c]) => {
        p.r(x + 1, y + 1, pw, ph, 'rgba(60,30,10,0.35)');
        p.r(x, y, pw, ph, c);
        p.r(x + 2, y + 4, pw - 4, 1, '#b8ad9c');
        p.r(x + 2, y + 6, pw - 6, 1, '#b8ad9c');
        p.r(x + Math.floor(pw / 2), y, 2, 2, '#d33a3a');
    });
};

const dormDesk: Painter = (p, w, h) => {
    const topH = 42;
    p.box(0, 0, w, topH, WOOD.light);
    p.r(1, 1, w - 2, 3, WOOD.mid); // back edge against the wall
    p.r(1, topH - 3, w - 2, 2, '#c08a5c');
    // front face with two drawers
    p.box(0, topH - 1, w, h - topH + 1, WOOD.dark);
    const half = Math.floor(w / 2);
    p.box(3, topH + 2, half - 4, h - topH - 6, WOOD.mid);
    p.box(half + 1, topH + 2, half - 4, h - topH - 6, WOOD.mid);
    p.r(Math.floor(half / 2) - 3, topH + 8, 6, 2, '#e3b867');
    p.r(half + Math.floor(half / 2) - 3, topH + 8, 6, 2, '#e3b867');
    p.r(1, h - 3, w - 2, 2, WOOD.deep);
};

const dormLaptop: Painter = (p, w, h) => {
    p.box(1, 0, w - 2, h - 4, '#2a2e3a');
    p.r(3, 2, w - 6, h - 8, '#5fd6c6');
    p.r(4, 3, 8, 1, '#c8fff5'); p.r(4, 5, 11, 1, '#9ef0e2'); p.r(4, 7, 6, 1, '#9ef0e2');
    p.box(0, h - 4, w, 4, '#8a93a3');
    p.r(2, h - 3, w - 4, 1, '#b7bfcc');
};

const dormTrophy: Painter = (p) => {
    // binder
    p.box(0, 6, 8, 14, '#2f4a8a');
    p.r(2, 9, 4, 3, '#e9e4d6');
    p.r(1, 7, 1, 12, '#4664a8');
    // trophy
    const gold = '#e8be4a', goldD = '#b88a24', goldL = '#fbe08e';
    p.r(11, 1, 11, 7, gold);
    p.r(12, 2, 2, 4, goldL);
    p.r(9, 2, 2, 4, gold); p.r(22, 2, 2, 4, gold);
    p.r(13, 8, 7, 2, goldD);
    p.r(15, 10, 3, 4, gold);
    p.r(12, 14, 9, 2, goldD);
    p.box(11, 16, 11, 4, '#5a3a26');
};

const dormCamera: Painter = (p, w, h) => {
    p.r(3, 0, 5, 2, '#2a2b31');
    p.box(0, 2, w, h - 2, '#2f3138');
    p.r(1, 3, w - 2, 2, '#4a4d57');
    p.box(5, 4, 7, 7, '#16171c');
    p.r(7, 6, 3, 3, '#4fa3e0');
    p.p(7, 6, '#bfe6ff');
    p.r(w - 4, 4, 2, 1, '#d33a3a');
};

const dormCloset: Painter = (p, w, h) => {
    p.box(0, 0, w, 8, WOOD.dark);
    p.r(1, 1, w - 2, 2, WOOD.light);
    p.box(0, 7, w, h - 7, WOOD.mid);
    const mid = Math.floor(w / 2);
    p.r(mid, 9, 1, h - 16, WOOD.deep);
    p.r(3, 10, 1, h - 20, WOOD.light);
    p.r(mid + 3, 10, 1, h - 20, WOOD.light);
    // handles
    p.r(mid - 5, 46, 2, 8, '#e3b867');
    p.r(mid + 4, 46, 2, 8, '#e3b867');
    // RA lanyard hanging from the right handle
    const cord = '#3f6fd0';
    for (let i = 0; i < 10; i++) { p.p(mid + 5 + Math.floor(i / 3), 48 + i, cord); p.p(mid + 13 - Math.floor(i / 3), 48 + i, cord); }
    p.r(mid + 6, 44, 1, 4, cord); p.r(mid + 12, 44, 1, 4, cord);
    p.box(mid + 6, 58, 7, 9, '#f7f3ea');
    p.r(mid + 8, 60, 3, 2, '#3f6fd0');
    p.r(mid + 7, 63, 5, 1, '#9a9a9a');
    // kick plate
    p.r(1, h - 5, w - 2, 4, WOOD.deep);
};

const dormDrawers: Painter = (p, w, h) => {
    const topH = 20;
    p.box(0, 0, w, topH, WOOD.light);
    p.r(1, topH - 3, w - 2, 2, '#c08a5c');
    // grad cap
    p.r(8, 6, 16, 4, '#1d1d24'); p.r(12, 10, 8, 4, '#1d1d24');
    p.r(15, 7, 2, 1, '#3a3a46'); p.r(22, 8, 1, 6, '#e8be4a');
    // diploma
    p.box(36, 4, 22, 13, '#f7f3ea');
    p.r(40, 8, 14, 1, '#c9a24a'); p.r(42, 11, 10, 1, '#b8ad9c');
    // textbooks
    p.box(66, 5, 20, 6, '#c8423b'); p.box(67, 10, 18, 6, '#3f6fb0');
    p.r(68, 7, 14, 1, '#f1d175');
    // front face
    p.box(0, topH - 1, w, h - topH + 1, WOOD.dark);
    const half = Math.floor(w / 2);
    p.box(3, topH + 2, half - 4, h - topH - 6, WOOD.mid);
    p.box(half + 1, topH + 2, half - 4, h - topH - 6, WOOD.mid);
    p.r(Math.floor(half / 2) - 3, topH + 9, 6, 2, '#e3b867');
    p.r(half + Math.floor(half / 2) - 3, topH + 9, 6, 2, '#e3b867');
    p.r(1, h - 3, w - 2, 2, WOOD.deep);
};

const dormMirror: Painter = (p, w, h) => {
    p.box(1, 0, w - 2, h - 4, WOOD.mid);
    p.r(3, 2, w - 6, h - 8, '#bfe2f2');
    p.r(4, 4, 2, 10, '#ffffff'); p.r(6, 4, 1, 5, '#ffffff');
    p.r(3, h - 14, w - 6, 8, '#a6d0e6');
    p.r(0, h - 4, 5, 4, WOOD.dark); p.r(w - 5, h - 4, 5, 4, WOOD.dark);
};

const dormBed: Painter = (p, w, h) => {
    const topH = 44;
    p.box(0, 0, w, topH, WOOD.dark);
    // mattress
    p.r(2, 2, w - 4, topH - 4, '#e9e4f0');
    // blanket (right side)
    p.r(26, 2, w - 28, topH - 4, '#6c7fc0');
    p.r(26, 2, 2, topH - 4, '#8a9ad2');
    p.r(30, 18, w - 34, 1, '#5a6aa8');
    // pillow
    p.box(4, 6, 20, 30, '#f7f3ea');
    p.r(6, 8, 16, 2, '#ffffff');
    // headboard
    p.r(0, 0, 3, topH, WOOD.deep);
    // side
    p.box(0, topH - 1, w, h - topH + 1, '#5a3a26');
    p.r(1, topH, w - 2, 2, '#4a2f1f');
};

const dormLamp: Painter = (p, w, h) => {
    p.r(2, 0, w - 4, 6, '#f1d175'); p.r(3, 1, 2, 4, '#fff1b8');
    p.r(Math.floor(w / 2) - 1, 6, 2, h - 9, '#3a3a46');
    p.r(1, h - 3, w - 2, 3, '#2a2b31');
};

// ---------- home furniture ----------

const homeShelf: Painter = (p, w, h) => {
    p.box(0, 0, w, h, PALE_WOOD.dark);
    p.r(1, 1, w - 2, 4, PALE_WOOD.light);
    const tiers = [6, 37, 68];
    const tierH = 27;
    tiers.forEach((ty) => {
        p.r(5, ty + 2, w - 10, tierH - 4, '#5a3e2a');
        p.r(4, ty + tierH - 2, w - 8, 3, PALE_WOOD.mid);
    });
    // top: trophy + oars
    const t = tiers[0];
    p.r(10, t + 5, 2, 18, '#e8dcc0'); p.r(9, t + 4, 4, 4, '#e8dcc0');
    p.r(w - 12, t + 5, 2, 18, '#e8dcc0'); p.r(w - 13, t + 4, 4, 4, '#e8dcc0');
    p.r(26, t + 6, 20, 9, '#e8be4a'); p.r(28, t + 7, 3, 6, '#fbe08e');
    p.r(32, t + 15, 8, 4, '#b88a24'); p.box(28, t + 19, 16, 5, '#6b4429');
    // middle: three plaques
    const m = tiers[1];
    [['#c9a24a', 9], ['#2f4a8a', 29], ['#2f4a8a', 49]].forEach(([c, x]) => {
        p.box(x as number, m + 5, 14, 17, c as string);
        p.r((x as number) + 3, m + 9, 8, 6, '#efe7d2');
        p.r((x as number) + 4, m + 17, 6, 1, '#efe7d2');
    });
    // bottom: book spines
    const b = tiers[2];
    ['#c8423b', '#e2c35a', '#3f6fb0', '#4f9a6a', '#f2eee4', '#7a4fa0', '#d9733a'].forEach((c, i) => {
        const bh = 18 + ((i * 3) % 4);
        p.r(8 + i * 8, b + tierH - 2 - bh, 7, bh, c);
        p.r(9 + i * 8, b + tierH - bh + 1, 5, 1, 'rgba(0,0,0,0.25)');
    });
};

const homeWindow: Painter = (p, w, h) => {
    const curtain = '#22396b', curtainL = '#2f4c8a';
    // rod
    p.r(0, 0, w, 3, '#2a2b31');
    // glass and skyline
    p.box(10, 3, w - 20, h - 7, '#2a2b31');
    p.r(11, 4, w - 22, h - 9, '#86c3e8');
    p.r(11, 4, w - 22, 6, '#a8d6f2');
    const sky = '#4d6380';
    const base = h - 6;
    const bars: [number, number, number][] = [[12, 9, 10], [20, 6, 14], [26, 8, 7], [34, 5, 16], [44, 7, 11], [50, 9, 15], [58, 6, 9]];
    bars.forEach(([x, bw, bh]) => p.r(x, base - bh, bw, bh, sky));
    // tall spire with a pod
    p.r(41, base - 28, 2, 28, sky); p.r(39, base - 20, 6, 3, sky); p.p(41, base - 31, sky); p.p(41, base - 30, sky);
    for (let i = 0; i < 10; i++) p.p(14 + i * 5, base - 4 - (i % 3) * 2, '#f6e08f');
    p.r(Math.floor(w / 2) - 1, 4, 2, h - 9, '#2a2b31');
    // sill
    p.r(8, h - 4, w - 16, 4, '#a9cfb6'); p.r(8, h - 4, w - 16, 1, '#e3f5e8');
    // curtains
    p.box(0, 2, 12, h - 2, curtain); p.r(3, 3, 1, h - 5, curtainL); p.r(7, 3, 1, h - 5, curtainL);
    p.box(w - 12, 2, 12, h - 2, curtain); p.r(w - 9, 3, 1, h - 5, curtainL); p.r(w - 5, 3, 1, h - 5, curtainL);
};

const homePullup: Painter = (p, w, h) => {
    // posts
    p.box(6, 4, 6, h - 10, METAL.dark); p.r(7, 5, 1, h - 12, METAL.mid);
    p.box(w - 12, 4, 6, h - 10, METAL.dark); p.r(w - 11, 5, 1, h - 12, METAL.mid);
    // bar
    p.box(1, 2, w - 2, 5, METAL.light); p.r(2, 3, w - 4, 1, '#e3e8ef');
    // dip handles
    p.r(12, 34, 8, 3, METAL.dark); p.r(w - 20, 34, 8, 3, METAL.dark);
    // feet
    p.box(0, h - 7, 18, 7, METAL.deep); p.box(w - 18, h - 7, 18, 7, METAL.deep);
};

const homeTable: Painter = (p, w, h) => {
    const topH = 86;
    p.box(0, 0, w, topH, PALE_WOOD.light);
    p.r(1, 1, 2, topH - 2, PALE_WOOD.mid);
    p.r(1, topH - 3, w - 2, 2, '#e0b98b');
    // spare slot (reserved): dashed outline
    const sy = 62, sx = 14, sw = 30, sh = 14;
    for (let x = sx; x < sx + sw; x += 3) { p.p(x, sy, '#fff8e8'); p.p(x, sy + sh, '#fff8e8'); }
    for (let y = sy; y <= sy + sh; y += 3) { p.p(sx, y, '#fff8e8'); p.p(sx + sw - 1, y, '#fff8e8'); }
    // front edge and legs
    p.box(0, topH - 1, w, 8, PALE_WOOD.dark);
    p.r(2, topH + 7, 5, h - topH - 7, PALE_WOOD.deep);
    p.r(w - 7, topH + 7, 5, h - topH - 7, PALE_WOOD.deep);
};

const homeLaptop: Painter = (p, _w, h) => {
    const lw = 20;
    p.box(1, 0, lw - 2, h - 4, '#2a2e3a');
    p.r(3, 2, lw - 6, h - 8, '#d84a4a');
    p.r(8, 4, 1, 5, '#ffffff'); p.r(9, 5, 1, 3, '#ffffff'); p.r(10, 6, 1, 1, '#ffffff');
    p.box(0, h - 4, lw, 4, '#8a93a3');
    // clapperboard
    p.box(lw + 1, 6, 7, 8, '#1d1d24');
    p.r(lw + 1, 3, 7, 3, '#f2f2f2');
    p.p(lw + 2, 4, '#1d1d24'); p.p(lw + 4, 4, '#1d1d24'); p.p(lw + 6, 4, '#1d1d24');
    p.r(lw + 3, 9, 3, 1, '#9a9a9a');
};

const homeHeadphones: Painter = (p, w, h) => {
    const band = '#2a2b31';
    p.r(4, 0, w - 8, 2, band);
    p.r(3, 1, 2, 4, band); p.r(w - 5, 1, 2, 4, band);
    p.box(1, 5, 6, h - 5, '#3f6fd0'); p.r(2, 6, 2, 3, '#7aa3ef');
    p.box(w - 7, 5, 6, h - 5, '#3f6fd0'); p.r(w - 6, 6, 2, 3, '#7aa3ef');
};

const homeNightstand: Painter = (p, w, h) => {
    const topH = 16;
    // body
    p.box(0, topH - 1, w, h - topH + 1, PALE_WOOD.mid);
    p.box(3, topH + 3, w - 6, 10, PALE_WOOD.light);
    p.r(Math.floor(w / 2) - 3, topH + 7, 6, 2, '#6b4429');
    p.r(1, h - 3, w - 2, 2, PALE_WOOD.deep);
    p.box(0, 8, w, topH - 7, PALE_WOOD.light);
    // lamp
    p.r(5, 0, 9, 6, '#f1d175'); p.r(6, 1, 2, 4, '#fff1b8');
    p.r(8, 6, 3, 4, '#3a3a46');
    // family photo frame
    p.box(20, 0, 11, 11, '#4e2f1c');
    p.r(22, 2, 7, 7, '#eab5a8');
    p.r(23, 4, 2, 2, '#8f5f3d'); p.r(26, 3, 2, 3, '#8f5f3d');
};

const homeBed: Painter = (p, w, h) => {
    const topH = 30;
    p.box(0, 0, w, topH, '#5a3a26');
    p.r(2, 2, w - 4, topH - 4, '#c75c4a');
    p.r(2, 2, w - 4, 2, '#dc7a66');
    p.r(30, 12, w - 34, 1, '#a94a3a');
    p.box(3, 3, 20, topH - 6, '#efe9da');
    p.r(5, 5, 16, 2, '#ffffff');
    p.r(0, 0, 3, topH, '#3d2617');
    p.box(0, topH - 1, w, h - topH + 1, '#4a2f1f');
};

const homeDesk: Painter = (p, w, h) => {
    const topH = 18;
    p.box(0, 0, w, topH, PALE_WOOD.light);
    p.r(1, topH - 3, w - 2, 2, '#e0b98b');
    p.box(0, topH - 1, w, h - topH + 1, PALE_WOOD.mid);
    const half = Math.floor(w / 2);
    p.box(3, topH + 2, half - 4, h - topH - 6, PALE_WOOD.light);
    p.box(half + 1, topH + 2, half - 4, h - topH - 6, PALE_WOOD.light);
    p.r(Math.floor(half / 2) - 3, topH + 9, 6, 2, '#6b4429');
    p.r(half + Math.floor(half / 2) - 3, topH + 9, 6, 2, '#6b4429');
    p.r(1, h - 3, w - 2, 2, PALE_WOOD.deep);
};

const homePiano: Painter = (p, w, h) => {
    p.box(0, 0, w, h, '#22232a');
    p.r(2, 5, w - 4, h - 7, '#f6f3ea');
    for (let x = 2; x < w - 2; x += 3) p.r(x, 5, 1, h - 7, '#c9c4b6');
    for (let x = 3; x < w - 3; x += 3) if (x % 21 !== 12) p.r(x + 1, 5, 2, 4, '#22232a');
    p.r(3, 2, 6, 1, '#4fa3e0'); p.r(w - 8, 2, 4, 1, '#d33a3a');
};

const homeTray: Painter = (p, w, h) => {
    p.box(0, h - 5, w, 5, '#c9ced8');
    p.r(1, h - 4, w - 2, 1, '#eef1f6');
    p.box(2, 2, 9, h - 6, '#e5a04f'); p.r(4, 3, 4, 2, '#f6c27f');
    p.box(13, 1, 10, h - 5, '#f2c4cc'); p.r(13, 1, 10, 2, '#d84a5a');
};

const homeLongboard: Painter = (p, w, h) => {
    p.box(2, 2, w - 4, h - 6, '#1f8a8a');
    p.r(3, 3, w - 6, 1, '#3fb7b0');
    p.r(6, 4, w - 12, h - 9, '#173c3f');
    p.r(0, 4, 2, h - 9, '#1f8a8a'); p.r(w - 2, 4, 2, h - 9, '#1f8a8a');
    p.box(6, h - 4, 6, 4, '#2a2b31'); p.box(w - 12, h - 4, 6, 4, '#2a2b31');
};

// ---------- exports ----------

export const painters = {
    dormRoom: paintRoom(DORM_PAL, 'carpet', 11),
    homeRoom: paintRoom(HOME_PAL, 'wood', 23),
    doorSide, sparkle, fxZ, fxHeart, daniel, danielSleep, cat,
    dormWindow, dormPennants, dormPinboard, dormDesk, dormLaptop, dormTrophy, dormCamera,
    dormCloset, dormDrawers, dormMirror, dormBed, dormLamp,
    homeShelf, homeWindow, homePullup, homeTable, homeLaptop, homeHeadphones, homeNightstand,
    homeBed, homeDesk, homePiano, homeTray, homeLongboard
} satisfies Record<string, Painter>;

export { PENNANT_COLORS };
