// Placeholder pixel art, painted at the final sprite sizes.
// Each painter draws one asset (all frames of a strip). The manifest decides sizes and whether to outline.
// When real art lands, set `url` on the manifest entry; these painters are then skipped.
//
// Third party art (album covers, posters, logos) is never drawn here. Those are image slots (see the
// manifest): the painters below only draw original abstract placeholders for them.

import {
    CAP_H, CHAR_FRAME, CAT_FRAME, FLOOR_H, FLOOR_W, FLOOR_X, FLOOR_Y, RIM_H, ROOM_H, ROOM_W, SIDE_W
} from '../config';
import { OUTLINE, Px, pixelText, pixelTextWidth, rng } from './paint';

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
const UCLA_BLUE = '#2f74b5', UCLA_BLUE_D = '#245a8e', UCLA_GOLD = '#f2c230';
const LEAF = '#4f9a5a', LEAF_D = '#3a7a46', LEAF_L = '#7cc47a', POT = '#c0673f', POT_D = '#94492a';

// ---------- rooms ----------

function paintRoom(pal: RoomPalette, floorKind: 'carpet' | 'wood', seed: number): Painter {
    return (p) => {
        const rand = rng(seed);
        // back wall face
        p.r(SIDE_W, CAP_H, FLOOR_W, FLOOR_Y - CAP_H, pal.wall);
        p.r(SIDE_W, CAP_H, FLOOR_W, 3, pal.wallShade);
        // faint wall texture
        for (let i = 0; i < 70; i++) {
            p.p(SIDE_W + Math.floor(rand() * FLOOR_W), CAP_H + 4 + Math.floor(rand() * (FLOOR_Y - CAP_H - 16)), pal.wallShade);
        }
        // wainscot and baseboard
        p.r(SIDE_W, FLOOR_Y - 10, FLOOR_W, 1, pal.capDark);
        p.r(SIDE_W, FLOOR_Y - 9, FLOOR_W, 9, pal.base);
        p.r(SIDE_W, FLOOR_Y - 2, FLOOR_W, 2, pal.capDark);

        // floor
        p.r(FLOOR_X, FLOOR_Y, FLOOR_W, FLOOR_H, pal.floor);
        if (floorKind === 'carpet') {
            for (let i = 0; i < 300; i++) {
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

/** Door in a side wall strip, drawn for the right wall (flip for the left). Warm light leaks through the gap. */
const doorSide: Painter = (p, w, h) => {
    p.r(0, 0, w, h, OUTLINE);
    p.r(1, 1, w - 2, h - 1, '#2a1c14');
    // door slab, slightly open: warm light in the gap
    p.r(1, 2, 5, h - 3, WOOD.mid);
    p.r(1, 2, 1, h - 3, WOOD.light);
    p.r(6, 2, 2, h - 3, '#ffd88a');
    p.r(8, 2, 1, h - 3, '#ffb85a');
    p.p(4, Math.floor(h / 2), '#e8c060');
    p.p(4, Math.floor(h / 2) + 1, '#e8c060');
    // floor sill with the light leaking under
    p.r(0, h - 3, w, 3, WOOD.dark);
    p.r(1, h - 2, w - 2, 1, '#ffd88a');
};

/** Unfound marker: a chunky bobbing arrow. */
const fxArrow: Painter = (p) => {
    const c = '#ffd447', l = '#fff4b0';
    p.r(0, 0, 9, 2, c); p.r(1, 2, 7, 1, c); p.r(2, 3, 5, 1, c); p.r(3, 4, 3, 1, c); p.p(4, 5, c);
    p.r(1, 0, 4, 1, l);
};

/** Small, quiet version of the unfound marker (used at a distance). */
const fxArrowSmall: Painter = (p) => {
    const c = '#ffd447';
    p.r(0, 0, 5, 1, c); p.r(1, 1, 3, 1, c); p.p(2, 2, c);
};

const sparkle: Painter = (p) => {
    // frame 0: small plus, frame 1: bigger star (used for confetti)
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

const fxHeart: Painter = (p) => {
    const c = '#ff6b8a';
    p.r(0, 1, 2, 2, c); p.r(3, 1, 2, 2, c); p.r(0, 2, 5, 1, c); p.r(1, 3, 3, 1, c); p.p(2, 4, c);
    p.p(1, 1, '#ffd0da');
};

const fxNote: Painter = (p) => {
    const c = '#fff6c8';
    p.r(3, 0, 1, 5, c); p.r(4, 0, 2, 1, c); p.p(5, 1, c); p.r(1, 4, 3, 2, c);
};

/** Wardrobe puff: two frames of a little cloud. */
const fxPuff: Painter = (p, w) => {
    const c = '#f4f1ea', d = '#cfc8bb';
    p.r(3, 4, 8, 4, c); p.r(2, 5, 10, 2, c); p.r(5, 2, 4, 2, c); p.r(4, 7, 6, 1, d);
    const q = p.at(w, 0);
    q.r(1, 3, 4, 4, c); q.r(8, 2, 5, 4, c); q.r(4, 6, 5, 3, c); q.p(2, 7, d); q.p(10, 6, d);
};

/** One fairy light bulb (tinted at runtime). */
const fxBulb: Painter = (p) => {
    p.r(1, 0, 1, 3, '#ffffff'); p.r(0, 1, 3, 1, '#ffffff');
};

/** Small pencil the cat knocks off the desk. */
const pencil: Painter = (p) => {
    p.r(0, 1, 6, 1, '#f2c230'); p.r(0, 0, 1, 2, '#e8a0a0'); p.p(6, 1, '#d9b48a'); p.p(7, 1, '#2a2b31');
};

/** Doormat in front of a side door (seen from above). */
const doormat: Painter = (p, w, h) => {
    p.box(0, 0, w, h, '#7a5236');
    p.r(2, 2, w - 4, h - 4, '#946644');
    for (let y = 3; y < h - 3; y += 3) p.r(3, y, w - 6, 1, '#7a5236');
};

/** Small hanging sign with an arrow. The words are a crisp label on top (see room labels). */
function signPainter(arrow: 'left' | 'right'): Painter {
    return (p, w, h) => {
        // strings
        p.p(4, 0, '#4a3a30'); p.p(w - 5, 0, '#4a3a30');
        p.box(0, 1, w, h - 1, '#e9d7b0');
        p.r(1, 2, w - 2, 1, '#f7ecd2');
        const ay = h - 4;
        const c = '#c8423b';
        // a clean pixel arrow: a short shaft and a solid triangle head
        const x0 = arrow === 'right' ? w - 10 : 3;
        if (arrow === 'right') {
            p.r(x0, ay, 4, 1, c);
            p.r(x0 + 4, ay - 2, 1, 5, c); p.r(x0 + 5, ay - 1, 1, 3, c); p.p(x0 + 6, ay, c);
        } else {
            p.r(x0 + 3, ay, 4, 1, c);
            p.r(x0 + 2, ay - 2, 1, 5, c); p.r(x0 + 1, ay - 1, 1, 3, c); p.p(x0, ay, c);
        }
    };
}

/** Wall clock face (hands are drawn live). */
const wallClock: Painter = (p) => {
    p.r(3, 0, 6, 12, OUTLINE); p.r(0, 3, 12, 6, OUTLINE); p.r(1, 1, 10, 10, OUTLINE);
    p.r(3, 1, 6, 10, '#fbf7ee'); p.r(1, 3, 10, 6, '#fbf7ee'); p.r(2, 2, 8, 8, '#fbf7ee');
    p.p(6, 2, '#5a5160'); p.p(6, 9, '#5a5160'); p.p(2, 6, '#5a5160'); p.p(9, 6, '#5a5160');
};

function plantPot(p: Px, x: number, y: number, w: number, h: number) {
    p.box(x, y, w, h, POT);
    p.r(x + 1, y + 1, w - 2, 1, '#d98a5f');
    p.r(x + 1, y + h - 2, w - 2, 1, POT_D);
}

// ---------- character ----------

type Dir = 'down' | 'up' | 'side';
type Pose = 'stand' | 'sit' | 'crouch' | 'hang' | 'cheer' | 'eat' | 'eatDown' | 'drink' | 'hold';

// Light warm East Asian complexion (checked against the photos and the warm, dim room lighting).
const SKIN = '#fde4cf', SKIN_D = '#f0c6a6', HAIR = '#2a1f24', HAIR_L = '#4d3b44', MOUTH = '#c48877', BLUSH = '#f6b8aa';
const TEE = '#f4f6fa', TEE_D = '#cfd5df';
const PANTS = '#2b2e44', SHOE = '#17131c';

/**
 * Daniel: curly permed hair (short sides, volume on top), warm skin, big smile, plain tee.
 * layer 'all' paints everything with a white tee; layer 'shirt' paints only the tee (for recolouring).
 */
function drawDaniel(p: Px, dir: Dir, bob: number, step: number, pose: Pose, layer: 'all' | 'shirt') {
    const all = layer === 'all';
    const R = (x: number, y: number, w: number, h: number, c: string, shirt = false) => { if (all || shirt) p.r(x, y, w, h, c); };
    const crouch = pose === 'crouch' ? 3 : 0;
    const hang = pose === 'hang';
    const y0 = 1 + bob + crouch + (hang ? 3 : 0);

    // legs
    if (pose === 'sit') {
        R(4, 17, 9, 2, PANTS); R(4, 19, 3, 1, SHOE); R(10, 19, 3, 1, SHOE);
    } else if (pose === 'crouch') {
        R(4, 18, 9, 2, PANTS); R(3, 20, 4, 1, SHOE); R(10, 20, 4, 1, SHOE);
    } else if (dir === 'side') {
        const fx = step === 1 ? 1 : step === 3 ? -1 : 0;
        R(6 + fx, 17, 3, 3, PANTS); R(6 + fx, 20, 4, 1, SHOE);
        R(8 - fx, 17, 3, 3, PANTS); R(8 - fx, 20, 4, 1, SHOE);
    } else {
        const lUp = step === 1 ? 1 : 0, rUp = step === 3 ? 1 : 0;
        R(5, 17, 3, 3 - lUp, PANTS); R(5, 20 - lUp, 3, 1, SHOE);
        R(9, 17, 3, 3 - rUp, PANTS); R(9, 20 - rUp, 3, 1, SHOE);
    }

    // body: plain tee
    const by = 12 + bob + crouch + (hang ? 1 : 0);
    const bh = (pose === 'sit' ? 5 : 5) - (bob && pose === 'stand' ? 0 : 0);
    if (dir === 'side' && pose === 'stand') {
        R(5, by, 7, bh, TEE, true); R(5, by, 1, bh, TEE_D, true);
        R(8, by + 1, 2, 2, TEE_D, true); // sleeve
        R(8, by + 3, 2, 2, SKIN); // arm
    } else {
        R(4, by, 9, bh, TEE, true);
        R(12, by, 1, bh, TEE_D, true); R(4, by + bh - 1, 9, 1, TEE_D, true);
        if (dir === 'down') R(7, by, 3, 1, SKIN); // neckline
        if (hang || pose === 'cheer') {
            // arms straight up
            R(3, by, 1, 1, TEE_D, true); R(13, by, 1, 1, TEE_D, true);
            R(3, 0, 1, by, SKIN); R(13, 0, 1, by, SKIN);
            R(2, 0, 2, 1, SKIN); R(13, 0, 2, 1, SKIN);
        } else if (pose === 'eat' || pose === 'eatDown' || pose === 'drink' || pose === 'hold') {
            R(3, by, 1, 2, TEE_D, true); R(3, by + 2, 1, 2, SKIN); // left arm down
            R(13, by, 1, 1, TEE_D, true); // right sleeve; the forearm and fork are drawn over the head below
        } else if (pose === 'crouch') {
            R(3, by, 1, 2, TEE_D, true); R(13, by, 1, 2, TEE_D, true);
            R(5, by + 3, 2, 1, SKIN); R(10, by + 3, 2, 1, SKIN); // hands forward
        } else {
            R(3, by, 1, 2, TEE_D, true); R(13, by, 1, 2, TEE_D, true); // short sleeves
            R(3, by + 2, 1, 2, SKIN); R(13, by + 2, 1, 2, SKIN);
        }
    }
    if (!all) return;

    // head: big and round, curly volume on top, short sides
    const hx = 2;
    if (dir === 'down') {
        p.r(hx + 1, y0 + 3, 11, 8, SKIN);
        p.r(hx + 1, y0 + 10, 11, 1, SKIN_D);
        // hair mass with a bumpy curly top
        p.r(hx, y0, 13, 4, HAIR);
        p.r(hx + 1, y0 - 1, 3, 1, HAIR); p.r(hx + 5, y0 - 1, 3, 1, HAIR); p.r(hx + 9, y0 - 1, 3, 1, HAIR);
        p.r(hx, y0 + 4, 1, 3, HAIR); p.r(hx + 12, y0 + 4, 1, 3, HAIR); // short sides
        // loose curls on the forehead
        p.p(hx + 2, y0 + 4, HAIR); p.p(hx + 5, y0 + 4, HAIR); p.p(hx + 8, y0 + 4, HAIR); p.p(hx + 10, y0 + 4, HAIR);
        p.p(hx + 2, y0 + 1, HAIR_L); p.p(hx + 6, y0, HAIR_L); p.p(hx + 10, y0 + 1, HAIR_L); p.p(hx + 4, y0 + 2, HAIR_L);
        // eyes as in the iteration 1 sprite: two small upright dark eyes
        p.r(hx + 3, y0 + 6, 1, 2, OUTLINE); p.r(hx + 9, y0 + 6, 1, 2, OUTLINE);
        // neutral closed mouth: a small line, no teeth, no smile
        p.r(hx + 5, y0 + 9, 3, 1, MOUTH);
        p.p(hx + 2, y0 + 8, BLUSH); p.p(hx + 10, y0 + 8, BLUSH);
    } else if (dir === 'up') {
        p.r(hx, y0, 13, 9, HAIR);
        p.r(hx + 1, y0 - 1, 3, 1, HAIR); p.r(hx + 5, y0 - 1, 3, 1, HAIR); p.r(hx + 9, y0 - 1, 3, 1, HAIR);
        p.p(hx + 3, y0 + 2, HAIR_L); p.p(hx + 7, y0 + 1, HAIR_L); p.p(hx + 10, y0 + 3, HAIR_L); p.p(hx + 5, y0 + 5, HAIR_L);
        p.r(hx + 2, y0 + 9, 9, 2, SKIN_D); // neck
        p.p(hx, y0 + 6, SKIN); p.p(hx + 12, y0 + 6, SKIN); // ears
    } else {
        p.r(hx + 5, y0 + 3, 8, 8, SKIN);
        p.r(hx + 5, y0 + 10, 8, 1, SKIN_D);
        p.r(hx + 1, y0, 11, 4, HAIR);
        p.r(hx + 2, y0 - 1, 3, 1, HAIR); p.r(hx + 6, y0 - 1, 3, 1, HAIR); p.p(hx + 10, y0 - 1, HAIR);
        p.r(hx + 1, y0 + 4, 4, 4, HAIR); // back of the head
        p.p(hx + 9, y0 + 4, HAIR); p.p(hx + 12, y0 + 4, HAIR);
        p.p(hx + 3, y0 + 1, HAIR_L); p.p(hx + 8, y0 + 1, HAIR_L);
        p.p(hx + 5, y0 + 6, SKIN_D); // ear
        p.r(hx + 10, y0 + 6, 1, 2, OUTLINE);
        p.r(hx + 10, y0 + 9, 2, 1, MOUTH);
        p.p(hx + 9, y0 + 8, BLUSH);
    }
    if (pose === 'eat') {
        // fork up to the mouth
        p.r(12, y0 + 10, 1, by - (y0 + 10) + 1, SKIN);
        p.r(10, y0 + 9, 2, 2, SKIN);
        p.r(8, y0 + 9, 2, 1, '#b7bfcc'); p.p(7, y0 + 8, '#b7bfcc');
    } else if (pose === 'eatDown') {
        // fork lowered, ready for the next bite
        p.r(13, by + 1, 1, 2, SKIN); p.r(11, by + 2, 2, 1, SKIN);
        p.r(10, by, 1, 3, '#b7bfcc');
    } else if (pose === 'drink') {
        // can tipped up to the mouth
        p.r(12, y0 + 10, 1, by - (y0 + 10) + 1, SKIN);
        p.r(11, y0 + 8, 2, 2, SKIN);
        p.r(7, y0 + 7, 5, 3, '#2b4a9a'); p.r(7, y0 + 7, 5, 1, '#4a6bc0'); p.r(9, y0 + 7, 2, 3, '#c9ced8');
        p.r(6, y0 + 8, 1, 1, '#9aa3b0'); // the open top at the lips
    } else if (pose === 'hold') {
        // arm down at the side, can in hand
        p.r(13, by + 1, 1, 2, SKIN);
        p.r(13, by + 3, 3, 5, '#2b4a9a'); p.r(13, by + 3, 3, 1, '#c9ced8'); p.r(13, by + 5, 3, 3, '#c9ced8'); p.p(13, by + 4, '#4a6bc0');
        p.r(13, by + 5, 1, 1, SKIN);
    }
}

/** Frame list for the character strip. Keep in sync with Boot's animations. */
export const DANIEL_FRAMES = {
    down: 0, up: 6, side: 12, // each: idle0, idle1, walk0..3
    sit: 18, crouch: 19, hang: 20, hangStrain: 21, cheer: 22, eat: 23, eatDown: 24, drink: 25, hold: 26
} as const;
export const DANIEL_FRAME_COUNT = 27;

function danielStrip(layer: 'all' | 'shirt'): Painter {
    return (p) => {
        const dirs: Dir[] = ['down', 'up', 'side'];
        dirs.forEach((dir, d) => {
            for (let f = 0; f < 6; f++) {
                const q = p.at((d * 6 + f) * CHAR_FRAME.w, 0);
                if (f < 2) drawDaniel(q, dir, f, 0, 'stand', layer);
                else drawDaniel(q, dir, f % 2 === 1 ? 1 : 0, f - 2, 'stand', layer);
            }
        });
        const at = (i: number) => p.at(i * CHAR_FRAME.w, 0);
        drawDaniel(at(DANIEL_FRAMES.sit), 'down', 0, 0, 'sit', layer);
        drawDaniel(at(DANIEL_FRAMES.crouch), 'down', 0, 0, 'crouch', layer);
        drawDaniel(at(DANIEL_FRAMES.hang), 'down', 0, 0, 'hang', layer);
        drawDaniel(at(DANIEL_FRAMES.hangStrain), 'down', 1, 0, 'hang', layer);
        drawDaniel(at(DANIEL_FRAMES.cheer), 'down', 0, 0, 'cheer', layer);
        drawDaniel(at(DANIEL_FRAMES.eat), 'down', 0, 0, 'eat', layer);
        drawDaniel(at(DANIEL_FRAMES.eatDown), 'down', 0, 0, 'eatDown', layer);
        drawDaniel(at(DANIEL_FRAMES.drink), 'down', 0, 0, 'drink', layer);
        drawDaniel(at(DANIEL_FRAMES.hold), 'down', 0, 0, 'hold', layer);
    };
}

/** Asleep: head on the pillow, blanket hump. Two breathing frames. */
/** Daniel asleep, head on the pillow, blanket breathing. `home` uses the green and blue plaid of the home bed. */
const sleeper = (home: boolean): Painter => (p) => {
    for (let f = 0; f < 2; f++) {
        const q = p.at(f * 30, 0);
        const rise = f;
        if (home) {
            for (let y = 5 - rise; y < 13; y++) for (let x = 10; x < 29; x++) {
                const vx = x % 8 < 2, hy = (y + rise) % 8 < 2;
                q.p(x, y, vx && hy ? '#244573' : vx || hy ? '#2f5a8f' : x % 8 === 5 ? '#6aa884' : '#3e7d5e');
            }
            q.r(10, 5 - rise, 19, 1, '#5d9a78');
        } else {
            q.r(10, 5 - rise, 19, 8 + rise, '#6c7fc0');
            q.r(10, 5 - rise, 19, 1, '#8a9ad2');
            q.r(14, 8, 1, 4, '#5a6aa8');
        }
        q.r(1, 2, 11, 10, HAIR);
        q.p(2, 1, HAIR); q.p(5, 1, HAIR); q.p(8, 1, HAIR); q.p(4, 3, HAIR_L); q.p(9, 2, HAIR_L);
        q.r(3, 5, 8, 6, SKIN);
        q.r(4, 7, 2, 1, OUTLINE);
        q.r(8, 7, 2, 1, OUTLINE);
        q.p(3, 5, HAIR); q.p(6, 5, HAIR); q.p(9, 5, HAIR);
        q.r(6, 9, 2, 1, MOUTH); // asleep: closed mouth
    }
};
const danielSleep = sleeper(false);
const danielSleepHome = sleeper(true);

// ---------- cat: fluffy cream and golden longhair, round face, green eyes ----------

const CAT = '#f3e2c0', CAT_G = '#d9a85c', CAT_D = '#c08a48', CAT_L = '#fff6e2', CAT_EYE = '#3faa55', CAT_NOSE = '#e79a9a';

/** Standing / walking, side view facing right with a 3/4 round face. */
function catStand(p: Px, tail: number, step: number, bat = false) {
    // fluffy tail
    if (tail === 0) { p.r(0, 3, 3, 5, CAT_G); p.r(1, 2, 2, 2, CAT); p.p(0, 2, CAT_G); }
    else { p.r(0, 5, 4, 3, CAT_G); p.r(0, 4, 2, 2, CAT); }
    // body with fluffy back and belly fringe
    p.r(3, 6, 10, 6, CAT);
    p.r(4, 5, 3, 1, CAT); p.r(8, 5, 3, 1, CAT);
    p.r(3, 9, 10, 2, CAT_G); p.r(4, 11, 8, 1, CAT_D);
    p.p(4, 12, CAT); p.p(7, 12, CAT); p.p(10, 12, CAT);
    // legs
    const a = step === 1 ? 1 : 0, b = step === 2 ? 1 : 0;
    p.r(4 + a, 12, 2, 2, CAT_L); p.r(10 - b, 12, 2, 2, CAT_L);
    if (bat) { p.r(15, 6, 2, 2, CAT_L); p.p(17, 5, CAT_L); }
    // round head
    p.r(10, 1, 7, 7, CAT); p.r(9, 2, 9, 5, CAT);
    p.p(10, 0, CAT_G); p.p(16, 0, CAT_G); p.p(11, 0, CAT_D); p.p(15, 0, CAT_D); // ears
    p.r(9, 5, 2, 2, CAT_G); p.r(16, 5, 2, 2, CAT_G); // golden cheeks
    p.r(11, 3, 2, 2, CAT_EYE); p.r(14, 3, 2, 2, CAT_EYE);
    p.p(11, 3, '#c9f5c9'); p.p(14, 3, '#c9f5c9');
    p.p(13, 5, CAT_NOSE);
    p.r(10, 7, 7, 1, CAT_L); // chin fluff
}

/** Sitting, facing the viewer. eyes: open or closed (petted). */
function catSit(p: Px, eyesClosed: boolean) {
    p.r(13, 9, 3, 4, CAT_G); p.r(12, 12, 4, 1, CAT_G); // tail wrapped
    p.r(4, 6, 10, 7, CAT); p.r(3, 8, 12, 4, CAT);
    p.r(6, 7, 6, 5, CAT_L); // chest fluff
    p.r(5, 12, 2, 1, CAT_L); p.r(11, 12, 2, 1, CAT_L);
    p.r(4, 0, 10, 7, CAT); p.r(3, 1, 12, 5, CAT);
    p.p(4, 0, CAT_D); p.p(13, 0, CAT_D); p.p(3, 0, CAT_G); p.p(14, 0, CAT_G);
    p.r(3, 4, 2, 2, CAT_G); p.r(13, 4, 2, 2, CAT_G);
    if (eyesClosed) { p.r(5, 3, 3, 1, OUTLINE); p.r(10, 3, 3, 1, OUTLINE); }
    else { p.r(5, 2, 3, 2, CAT_EYE); p.r(10, 2, 3, 2, CAT_EYE); p.p(5, 2, '#c9f5c9'); p.p(10, 2, '#c9f5c9'); }
    p.p(8, 4, CAT_NOSE); p.p(9, 4, CAT_NOSE);
}

/** Curled up asleep. */
function catCurl(p: Px, breathe: number) {
    p.r(2, 6 - breathe, 14, 7 + breathe, CAT); p.r(1, 8, 16, 4, CAT);
    p.r(3, 5 - breathe, 10, 1, CAT);
    p.r(2, 10, 14, 3, CAT_G); // tail around the front
    p.r(4, 11, 10, 1, CAT_D);
    p.r(11, 6 - breathe, 6, 5, CAT); // head tucked
    p.p(12, 5 - breathe, CAT_G); p.p(16, 5 - breathe, CAT_G);
    p.r(12, 8, 2, 1, OUTLINE); p.r(15, 8, 1, 1, OUTLINE);
    p.r(5, 7, 3, 1, CAT_L);
}

/** Strip: 0-1 idle, 2-3 walk, 4 sit, 5 sit eyes closed, 6-7 curled asleep, 8 bat paw. */
export const CAT_FRAMES = { idle: 0, walk: 2, sit: 4, petted: 5, sleep: 6, bat: 8 } as const;
export const CAT_FRAME_COUNT = 9;

const cat: Painter = (p) => {
    const at = (i: number) => p.at(i * CAT_FRAME.w, 0);
    catStand(at(0), 0, 0); catStand(at(1), 1, 0);
    catStand(at(2), 0, 1); catStand(at(3), 1, 2);
    catSit(at(4), false); catSit(at(5), true);
    catCurl(at(6), 0); catCurl(at(7), 1);
    catStand(at(8), 1, 0, true);
};

// ---------- image slot placeholders (original abstract patterns, no real artwork) ----------

function posterFrame(p: Px, w: number, h: number) {
    p.box(0, 0, w, h, '#f7f3ea');
}

const slotGraduation: Painter = (p, w, h) => {
    posterFrame(p, w, h);
    const cols = ['#e58bc9', '#b46cd6', '#f2a6d8', '#8a4fc0'];
    for (let y = 2; y < h - 2; y += 2) for (let x = 2; x < w - 2; x += 2) p.r(x, y, 2, 2, cols[((x * 3 + y * 5) >> 2) % cols.length]);
};
const slotDamn: Painter = (p, w, h) => {
    posterFrame(p, w, h);
    p.r(2, 2, w - 4, h - 4, '#d33a3a');
    for (let i = 0; i < 4; i++) p.r(3 + i * 3, 4 + i * 4, w - 6 - i * 6, 2, '#f4efe8');
};
const slotDuck: Painter = (p, w, h) => {
    posterFrame(p, w, h);
    p.r(2, 2, w - 4, h - 4, '#f7e27a');
    for (let y = 3; y < h - 3; y += 4) for (let x = 3 + ((y >> 2) % 2) * 2; x < w - 3; x += 4) p.r(x, y, 2, 2, '#fffaf0');
};
const slotEmpty: Painter = () => { /* hidden until the file exists */ };
const slotIgor: Painter = (p, w, h) => {
    posterFrame(p, w, h);
    p.r(2, 2, w - 4, h - 4, '#f4b6c4');
    for (let y = 4; y < h - 3; y += 5) p.r(3, y, w - 6, 2, '#e98aa2');
    p.r(Math.floor(w / 2) - 3, Math.floor(h / 2) - 3, 6, 6, '#fbe7a1');
};
const slotHome1: Painter = (p, w, h) => {
    posterFrame(p, w, h);
    p.r(2, 2, w - 4, h - 4, '#9fd3c7');
    for (let y = 4; y < h - 3; y += 4) for (let x = 2; x < w - 2; x++) p.p(x, y + Math.round(Math.sin(x / 2) * 1), '#3f8f86');
};
const slotHome2: Painter = (p, w, h) => {
    posterFrame(p, w, h);
    p.r(2, 2, w - 4, h - 4, '#f6c7a6');
    p.r(3, 4, w - 8, 6, '#e8875a'); p.r(6, 11, w - 9, 5, '#c95a3a'); p.r(3, h - 6, w - 6, 3, '#f2e3c6');
};
const slotHome3: Painter = (p, w, h) => {
    posterFrame(p, w, h);
    p.r(2, 2, w - 4, h - 4, '#cfe0f5');
    for (let i = 0; i < 4; i++) p.r(3 + i * 5, 3 + (i % 2) * 4, 4, h - 10, ['#2f5aa8', '#ffffff', '#5a86c8', '#24407e'][i]);
};

// ---------- dorm ----------

type TimeOfDay = 0 | 1 | 2; // day, sunset, night
const SKIES: Record<TimeOfDay, { top: string; bottom: string; building: string; trim: string; lit: string | null }> = {
    0: { top: '#8fc4ea', bottom: '#cfe8f6', building: '#b8644a', trim: '#8f4734', lit: null },
    1: { top: '#d9607a', bottom: '#f8b45e', building: '#6e3a3c', trim: '#542a2e', lit: null },
    2: { top: '#141a3c', bottom: '#2a3366', building: '#2b2238', trim: '#1d1728', lit: '#f6d27a' }
};

/** Window with a sunset view of two towers (original silhouette), a succulent on the sill. 3 frames: day, sunset, night. */
const dormWindow: Painter = (p, w, h) => {
    for (let f = 0 as TimeOfDay; f < 3; f = (f + 1) as TimeOfDay) {
        const q = p.at(f * w, 0);
        const s = SKIES[f];
        const gh = h - 9;
        q.box(0, 0, w, h - 5, '#3c2a22');
        // sky gradient in bands
        for (let y = 0; y < gh; y++) q.r(2, 2 + y, w - 4, 1, y < gh * 0.5 ? s.top : s.bottom);
        if (f === 2) [[6, 4], [14, 8], [40, 5], [33, 3], [22, 6]].forEach(([x, y]) => q.p(x, y, '#ffffff'));
        if (f === 1) q.r(28, 14, 6, 3, '#ffe3a0');
        // building silhouette: long hall with two towers
        const base = h - 7;
        q.r(2, base - 8, w - 4, 8, s.building);
        q.r(2, base - 9, w - 4, 1, s.trim);
        const tower = (x: number) => {
            q.r(x, base - 22, 7, 14, s.building);
            q.r(x + 1, base - 25, 5, 3, s.building);
            q.r(x + 2, base - 27, 3, 2, s.trim);
            q.p(x + 3, base - 28, s.trim);
            q.r(x + 2, base - 18, 3, 4, s.lit ?? s.trim); // arched opening
            q.r(x, base - 12, 7, 1, s.trim);
        };
        tower(11); tower(28);
        for (let x = 4; x < w - 4; x += 4) q.r(x, base - 5, 2, 3, s.lit && x % 8 === 0 ? s.lit : s.trim);
        // mullions
        q.r(Math.floor(w / 2) - 1, 2, 2, gh, '#3c2a22');
        q.r(2, Math.floor(gh / 2) + 1, w - 4, 1, '#3c2a22');
        // sill and succulent
        q.r(0, h - 5, w, 5, '#c9b596'); q.r(0, h - 5, w, 1, '#efe4cf');
        plantPot(q, 34, h - 9, 7, 5);
        q.r(35, h - 12, 5, 3, LEAF); q.p(34, h - 11, LEAF_L); q.p(40, h - 11, LEAF_L); q.p(37, h - 13, LEAF_L); q.p(37, h - 11, LEAF_D);
    }
};

/** One big UCLA pennant on a dowel: plain "UCLA" text in blue and gold, no logo. */
const dormPennant: Painter = (p, w, h) => {
    // dowel
    p.r(0, 1, w, 3, '#8f5f3d'); p.r(0, 1, w, 1, '#b07b50');
    p.r(0, 0, 3, 5, '#6b4429'); p.r(w - 3, 0, 3, 5, '#6b4429');
    // pennant: tall at the left, point at the right
    const H = h - 4, x0 = 3, x1 = w - 3;
    for (let x = x0; x <= x1; x++) {
        const half = Math.max(0.5, (H / 2) * (1 - (x - x0) / (x1 - x0)));
        const top = Math.round(4 + H / 2 - half), bot = Math.round(4 + H / 2 + half);
        p.r(x, top, 1, bot - top, UCLA_BLUE);
        p.p(x, top, UCLA_GOLD); p.p(x, bot - 1, UCLA_GOLD);
    }
    p.r(x0, 4, 3, H, UCLA_BLUE_D);
    p.r(x0 + 3, 4, 1, H, UCLA_GOLD);
    pixelText(p, 'UCLA', 9, 4 + Math.round(H / 2) - 5, UCLA_GOLD, 2);
};

/** Cork pin board styled as a to do list: a TO DO header card and sticky notes with ticked boxes. */
const dormTodo: Painter = (p, w, h) => {
    p.box(0, 0, w, h, WOOD.dark);
    p.r(2, 2, w - 4, h - 4, '#c69863');
    const rand = rng(7);
    for (let i = 0; i < 50; i++) p.p(2 + Math.floor(rand() * (w - 4)), 2 + Math.floor(rand() * (h - 4)), '#ad7f4d');
    // header card
    p.r(5, 3, w - 10, 8, '#fbf7ee');
    p.r(6, 10, w - 10, 1, 'rgba(60,30,10,0.3)');
    const label = 'TO DO';
    pixelText(p, label, Math.floor((w - pixelTextWidth(label)) / 2), 4, '#2a2130');
    p.p(7, 5, '#d33a3a'); p.p(w - 8, 5, '#d33a3a');
    // six sticky notes, each with a ticked checkbox
    const cols = ['#f7de6a', '#f2a6b8', '#a9d2f2', '#b5e3a6', '#f7de6a', '#f5b36a'];
    cols.forEach((c, i) => {
        const x = 5 + (i % 3) * 15, y = 13 + Math.floor(i / 3) * 12;
        p.r(x + 1, y + 1, 12, 10, 'rgba(60,30,10,0.3)');
        p.r(x, y, 12, 10, c);
        p.box(x + 1, y + 2, 4, 4, '#ffffff', '#2a2130');
        p.p(x + 2, y + 3, '#2f8a3a'); p.p(x + 3, y + 4, '#2f8a3a'); p.p(x + 4, y + 2, '#2f8a3a');
        p.r(x + 6, y + 3, 5, 1, '#5a5160'); p.r(x + 6, y + 6, 4, 1, '#5a5160'); p.r(x + 2, y + 8, 8, 1, '#5a5160');
        p.p(x + 6, y, '#d33a3a');
    });
};

/** Working desk against the back wall, with lived in clutter baked in. Interactive items are separate sprites. */
const dormDesk: Painter = (p, w, h) => {
    const topH = 46;
    p.box(0, 0, w, topH, WOOD.light);
    p.r(1, 1, w - 2, 3, WOOD.mid); // back edge
    p.r(1, topH - 3, w - 2, 2, '#c08a5c');
    // front face with a drawer and an open knee space
    p.box(0, topH - 1, w, h - topH - 2, WOOD.dark);
    p.box(w - 34, topH + 2, 30, 9, WOOD.mid);
    p.r(w - 22, topH + 6, 6, 1, '#e3b867');
    p.r(4, topH + 2, w - 42, h - topH - 6, '#3a2418');
    // LED strip glowing purple under the front edge
    p.r(1, h - 3, w - 2, 1, '#c792ff'); p.r(1, h - 2, w - 2, 1, '#8a4fd8');
    // clutter (muted, kept off the interactive items: laptop 7..29, binder 35..59, phone 65..75)
    // water bottle standing at the back left
    p.r(4, 4, 4, 2, '#3a3a46'); p.r(4, 6, 4, 13, '#7fc4e8'); p.r(3, 7, 1, 11, '#3f6f8f'); p.r(8, 7, 1, 11, '#3f6f8f');
    p.r(5, 8, 1, 8, '#c8ecff'); p.r(4, 18, 4, 1, '#3f6f8f');
    // baseball cap behind the laptop, brim pointing forward
    p.r(16, 10, 8, 1, '#24345a'); p.r(15, 11, 10, 4, '#2d3f6e'); p.r(17, 11, 3, 1, '#3e5590'); p.p(19, 10, '#e8be4a');
    p.r(14, 15, 12, 3, '#1f2c4f'); p.r(15, 17, 10, 1, '#16203a');
    // loose papers, front left
    p.r(2, 37, 12, 7, '#efe9dc'); p.r(4, 38, 9, 6, '#f7f3ea'); p.r(5, 40, 6, 1, '#b8ad9c'); p.r(5, 42, 5, 1, '#b8ad9c');
    // mug between the laptop and the binder
    p.box(29, 30, 6, 7, '#e9e4d6'); p.r(35, 32, 1, 3, '#e9e4d6'); p.r(30, 31, 4, 1, '#6b4429');
    // spiral notebook in front of the binder
    p.box(36, 37, 15, 8, '#d36a5a'); p.r(37, 39, 13, 1, '#e48a7a');
    for (let x = 37; x < 50; x += 2) p.p(x, 37, '#d8dce4');
    // pens
    p.r(53, 40, 7, 1, '#2a3a8a'); p.p(60, 40, '#e8e4dc'); p.r(54, 42, 6, 1, '#c8423b'); p.r(52, 44, 6, 1, '#2a2b31');
    // sticky notes stuck in front of the phone
    p.r(62, 38, 5, 5, '#f7de6a'); p.r(68, 39, 5, 5, '#f2a6b8'); p.r(63, 40, 3, 1, '#a08a3a');
    // wired earbuds with the cable trailing off the front edge
    p.r(79, 30, 2, 2, '#f4f4f4'); p.r(84, 31, 2, 2, '#f4f4f4');
    [[80, 32], [80, 33], [81, 34], [82, 35], [83, 35], [84, 34], [85, 33], [82, 36], [82, 37], [81, 38], [81, 39], [82, 40],
        [83, 41], [83, 42], [82, 43], [82, 44], [82, 45], [83, 46], [83, 47]].forEach(([x, y]) => p.p(x, y, '#e2e2e2'));
    // small plant at the back corner
    plantPot(p, 71, 10, 7, 6); p.r(72, 5, 5, 5, LEAF); p.p(71, 6, LEAF_L); p.p(77, 7, LEAF_L); p.p(74, 4, LEAF_L); p.p(74, 7, LEAF_D);
    // desk lamp (warm), right end
    p.box(84, 22, 9, 3, '#3a3a46');
    p.r(87, 10, 2, 12, '#3a3a46');
    p.r(82, 6, 10, 5, '#f1d175'); p.r(83, 7, 3, 3, '#fff1b8'); p.r(82, 11, 10, 1, '#c9a24a');
    // charging cable from the phone slot to the back
    [[70, 22], [71, 23], [72, 23], [73, 22], [74, 21], [75, 21], [76, 22], [77, 23], [78, 24]].forEach(([x, y]) => p.p(x, y, '#e9e4d6'));
};

const dormLaptop: Painter = (p, w, h) => {
    for (let f = 0; f < 2; f++) {
        const q = p.at(f * w, 0);
        q.box(1, 0, w - 2, h - 4, '#2a2e3a');
        q.r(3, 2, w - 6, h - 8, f ? '#66dccb' : '#5fd6c6');
        q.r(4, 3, 8, 1, '#c8fff5'); q.r(4, 5, 11, 1, '#9ef0e2'); q.r(4, 7, 6, 1, '#9ef0e2');
        if (f) q.r(11, 7, 1, 1, '#ffffff'); // blinking cursor
        q.box(0, h - 4, w, 4, '#8a93a3');
        q.r(2, h - 3, w - 4, 1, '#b7bfcc');
    }
};

/** Binder standing on the desk. Its label ("Consulting stuff") is a crisp text label. */
const dormBinder: Painter = (p, w, h) => {
    p.box(0, 0, w, h, '#2d4f8a');
    p.r(1, 1, 2, h - 2, '#22406f'); // spine side
    p.r(4, 1, w - 5, 1, '#4664a8');
    p.box(4, 3, w - 7, h - 7, '#f4efe2', '#22406f');
    p.r(2, h - 3, 1, 1, '#cfd5df'); p.r(2, 4, 1, 1, '#cfd5df');
};

/** Phone propped up on the desk. Its screen is the phone-screen image slot. */
const dormPhone: Painter = (p, w, h) => {
    p.box(0, 0, w, h - 2, '#1d1d24');
    const cols = ['#e58bc9', '#f7c46a', '#6fb8e8', '#9ad08a', '#f28a6a', '#b58ae0'];
    for (let i = 0; i < 6; i++) p.r(2 + (i % 2) * 3, 3 + Math.floor(i / 2) * 3, 2, 2, cols[i]);
    p.r(2, 2, w - 4, 1, '#f4f4f4');
    p.r(1, h - 2, w - 2, 2, '#4a4d57'); // stand
};

/** Narrower closet. The poster on its left door is a separate image slot sprite. A sleeve hangs out. */
const dormCloset: Painter = (p, w, h) => {
    p.box(0, 0, w, 8, WOOD.dark);
    p.r(1, 1, w - 2, 2, WOOD.light);
    p.box(0, 7, w, h - 7, WOOD.mid);
    const mid = Math.floor(w / 2);
    p.r(mid, 9, 1, h - 16, WOOD.deep);
    p.r(3, 10, 1, h - 20, WOOD.light);
    p.r(mid + 3, 10, 1, h - 20, WOOD.light);
    // handles sit below the duck poster
    const hy = 62;
    p.r(mid - 4, hy, 2, 8, '#e3b867'); p.r(mid - 4, hy, 1, 8, '#f3d48a');
    p.r(mid + 3, hy, 2, 8, '#e3b867'); p.r(mid + 3, hy, 1, 8, '#f3d48a');
    // RA lanyard looped over the right handle: two blue strands down to a clip and an ID tag
    const strap = '#2f74b5', strapL = '#5a9ad6';
    p.r(mid + 2, hy + 1, 1, 9, strap); p.r(mid + 5, hy + 1, 1, 9, strap); p.r(mid + 3, hy - 1, 2, 1, strap);
    p.p(mid + 2, hy + 3, strapL); p.p(mid + 5, hy + 6, strapL);
    p.r(mid + 3, hy + 10, 2, 1, strap); p.r(mid + 3, hy + 11, 2, 2, '#b7bfcc'); // clip
    const tx0 = mid - 2, ty0 = hy + 13;
    p.box(tx0, ty0, 13, 15, '#f7f5ee');
    p.r(tx0 + 1, ty0 + 1, 11, 3, UCLA_BLUE); p.r(tx0 + 5, ty0 + 2, 3, 1, '#1a1420'); // top band with the punch slot
    pixelText(p, 'RA', tx0 + 3, ty0 + 6, UCLA_BLUE_D);
    p.r(tx0 + 2, ty0 + 12, 9, 1, '#b7bfcc'); // name line
    p.r(1, h - 5, w - 2, 4, WOOD.deep);
};

const dormBeanbag: Painter = (p, w, h) => {
    const c = '#d2453c', d = '#a8322c', l = '#ec6a5c';
    p.r(4, 6, w - 8, h - 8, c); p.r(2, 9, w - 4, h - 13, c); p.r(7, 3, w - 14, 4, c);
    p.r(9, 5, w - 18, 7, l); // dent highlight
    p.r(11, 7, w - 22, 4, d);
    p.r(4, h - 4, w - 8, 2, d); p.r(2, h - 6, 2, 2, d); p.r(w - 4, h - 6, 2, 2, d);
    p.p(8, 4, '#f59a8e'); p.p(10, 3, '#f59a8e');
};

const dormFloorLamp: Painter = (p, w, h) => {
    p.r(1, 0, w - 2, 8, '#f6d77a'); p.r(0, 4, w, 4, '#f1d175'); p.r(2, 1, 3, 5, '#fff3c4');
    p.r(0, 8, w, 1, '#c9a24a');
    p.r(Math.floor(w / 2) - 1, 9, 2, h - 12, '#3a3a46');
    p.r(1, h - 3, w - 2, 3, '#2a2b31');
};

/** Compact bed. A UCLA hoodie laid flat (hood, sleeves, "UCLA" in gold) and a tan bear plush sit on it. */
const dormBed: Painter = (p, w, h) => {
    const topH = 44;
    p.box(0, 0, w, topH, WOOD.dark);
    p.r(2, 2, w - 4, topH - 4, '#e9e4f0');
    p.r(26, 2, w - 28, topH - 4, '#6c7fc0');
    p.r(26, 2, 2, topH - 4, '#8a9ad2');
    p.r(30, 30, w - 34, 1, '#5a6aa8');
    p.box(4, 6, 20, 30, '#f7f3ea');
    p.r(6, 8, 16, 2, '#ffffff');
    p.r(0, 0, 3, topH, WOOD.deep);
    // UCLA hoodie laid flat on the blanket: hood with drawstrings, sleeves flopped out, "UCLA" across the chest
    {
        const ox = 38, oy = 7, cx = ox + 16;
        const edge = '#16304f', blueL = '#4a8bc9', string = '#f4f1ea';
        const shape: [number, number, number, number][] = [
            [cx - 5, oy, 10, 1], [cx - 6, oy + 1, 12, 6], // hood
            [ox + 4, oy + 6, 24, 20] // body
        ];
        // sleeves angle down and out, one pixel per three rows
        for (let i = 0; i < 13; i++) {
            const s = Math.floor(i / 3);
            shape.push([ox - s, oy + 7 + i, 5, 1], [ox + 27 + s, oy + 7 + i, 5, 1]);
        }
        for (const [x, y, w2, h2] of shape) p.r(x - 1, y - 1, w2 + 2, h2 + 2, edge);
        for (const [x, y, w2, h2] of shape) p.r(x, y, w2, h2, UCLA_BLUE);
        // cuffs
        for (const i of [11, 12]) {
            const s = Math.floor(i / 3);
            p.r(ox - s, oy + 7 + i, 5, 1, UCLA_BLUE_D); p.r(ox + 27 + s, oy + 7 + i, 5, 1, UCLA_BLUE_D);
        }
        // hood opening and drawstrings
        p.r(cx - 4, oy + 2, 8, 4, UCLA_BLUE_D); p.r(cx - 3, oy + 3, 6, 2, '#1b4470');
        p.r(ox + 5, oy + 6, cx - 6 - (ox + 5), 1, blueL); p.r(cx + 6, oy + 6, ox + 27 - (cx + 6), 1, blueL); // shoulders
        p.r(cx - 2, oy + 6, 1, 3, string); p.r(cx + 1, oy + 6, 1, 3, string);
        // UCLA in gold with a soft shadow
        pixelText(p, 'UCLA', cx - 7, oy + 11, UCLA_BLUE_D);
        pixelText(p, 'UCLA', cx - 7, oy + 10, UCLA_GOLD);
        // kangaroo pocket
        p.r(ox + 9, oy + 17, 14, 6, '#2a69a6');
        p.r(ox + 9, oy + 17, 14, 1, UCLA_BLUE_D); p.r(ox + 9, oy + 17, 1, 6, UCLA_BLUE_D); p.r(ox + 22, oy + 17, 1, 6, UCLA_BLUE_D);
        // ribbed hem
        p.r(ox + 4, oy + 24, 24, 2, UCLA_BLUE_D);
        for (let x = ox + 5; x < ox + 28; x += 2) p.r(x, oy + 24, 1, 2, '#1e4d7c');
    }
    // tan bear plush, sitting near the wall end
    const bear = '#c99a62', bearD = '#a87a46';
    p.r(78, 7, 10, 9, bear); p.r(77, 6, 3, 3, bear); p.r(86, 6, 3, 3, bear);
    p.r(76, 15, 14, 9, bear); p.r(80, 17, 6, 5, '#e8c9a0');
    p.p(80, 10, OUTLINE); p.p(84, 10, OUTLINE); p.r(81, 12, 3, 2, '#e8c9a0'); p.p(82, 12, OUTLINE);
    p.r(76, 22, 4, 3, bearD); p.r(86, 22, 4, 3, bearD);
    // side
    p.box(0, topH - 1, w, h - topH + 1, '#5a3a26');
    p.r(1, topH, w - 2, 2, '#4a2f1f');
};

/** Shaggy round lilac rug: wavy fuzzy outline, tufts, pile strands, a visible front lip, and a soft shadow. */
const dormRug: Painter = (p, w, h) => {
    const rand = rng(57);
    const c = '#a99ac4', d = '#9282b2', dd = '#76689a', l = '#bcaed6', ll = '#d0c5e4';
    const cx = w / 2, cy = (h - 4) / 2, rx = w / 2 - 3, ry = (h - 4) / 2 - 2;
    // a wavy, fuzzy outline instead of a perfect ellipse
    const wob = (x: number, y: number) => {
        const a = Math.atan2((y - cy) / ry, (x - cx) / rx);
        return 0.022 * Math.sin(a * 11) + 0.018 * Math.sin(a * 23 + 1.3) + 0.014 * Math.sin(a * 37 + 0.4);
    };
    const inside = (x: number, y: number) => {
        const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
        return nx * nx + ny * ny <= (1 + wob(x, y)) ** 2;
    };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (inside(x, y)) {
            // soft volume: lighter toward the top left, darker toward the front
            const t = ((x - cx) / rx) * 0.35 + ((y - cy) / ry) * 0.85;
            p.p(x, y, t < -0.6 ? ll : t < -0.2 ? l : t < 0.5 ? c : d);
        } else if (inside(x, y - 1) && y > cy) {
            p.p(x, y, dd); // the front lip of the pile
        } else if (inside(x, y - 2) || inside(x - 1, y - 2)) {
            p.p(x, y, 'rgba(16, 14, 34, 0.3)'); // shadow on the carpet
        }
    }
    // shag: short strands, light tip over a darker root
    for (let i = 0; i < 700; i++) {
        const x = Math.floor(rand() * w), y = Math.floor(rand() * h);
        if (!inside(x, y) || !inside(x, y + 1)) continue;
        const front = (y - cy) / ry > 0.35;
        p.p(x, y, rand() < 0.5 ? (front ? c : ll) : l);
        p.p(x, y + 1, front ? dd : d);
    }
    // tufts poking out past the edge
    for (let k = 0; k < 140; k++) {
        const a = rand() * Math.PI * 2;
        const r = 1 + wob(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
        const x = Math.round(cx + Math.cos(a) * rx * r), y = Math.round(cy + Math.sin(a) * ry * r);
        const out = Math.sin(a) > 0.2 ? d : rand() < 0.5 ? l : c;
        p.p(x, y, out);
        if (rand() < 0.5) p.p(x + Math.sign(Math.cos(a)), y + (Math.sin(a) < 0 ? -1 : 0), out);
    }
};

/** Bigger dresser: black headphones and a potted plant baked on top (decor). */
const dormDresser: Painter = (p, w, h) => {
    const t = 8, topH = 22;
    // plant leaves rise above the top surface (drawn after the top, see below)
    // top surface
    p.box(0, t, w, topH, WOOD.light);
    p.r(1, t + topH - 3, w - 2, 2, '#c08a5c');
    // towel draped over the left edge, hanging down the front
    const towel = '#e48a6a', towelD = '#c46a4c', towelL = '#f2a888';
    p.r(1, t + 4, 8, 8, towel); p.r(1, t + 4, 8, 1, towelL); p.r(1, t + 9, 8, 1, towelD);
    p.r(1, t + 6, 8, 1, '#f4f1ea'); p.r(1, t + 8, 8, 1, '#f4f1ea'); // stripes
    // potted plant: a bushy fan of leaves sitting in the pot
    const px = w - 15, py = t + 6;
    p.r(px - 1, py - 8, 12, 9, LEAF); p.r(px + 1, py - 11, 8, 4, LEAF); p.r(px - 3, py - 5, 3, 4, LEAF_D); p.r(px + 10, py - 6, 3, 4, LEAF_D);
    p.r(px + 3, py - 13, 2, 3, LEAF_L); p.p(px, py - 7, LEAF_L); p.p(px + 8, py - 9, LEAF_L); p.p(px + 5, py - 5, LEAF_D); p.p(px + 2, py - 3, LEAF_D);
    plantPot(p, px, py, 10, 9);
    // student clutter, one cluster right of the shirt: red cup, a bag of chips, headphones, a green cap
    const ed = '#1a1420';
    // red party cup
    p.r(66, t + 3, 7, 1, ed); p.r(66, t + 4, 7, 9, '#d23a33'); p.r(67, t + 13, 5, 1, '#d23a33');
    p.r(66, t + 4, 7, 2, '#f4f1ea'); p.r(67, t + 6, 1, 6, '#ec6a5c'); p.r(65, t + 4, 1, 9, ed); p.r(73, t + 4, 1, 9, ed); p.r(66, t + 14, 7, 1, ed);
    // bag of chips with a crinkled top
    p.r(75, t + 5, 9, 11, '#f2c230'); p.r(75, t + 4, 9, 1, '#e3a820'); p.p(76, t + 3, '#e3a820'); p.p(79, t + 3, '#e3a820'); p.p(82, t + 3, '#e3a820');
    p.r(75, t + 9, 9, 3, '#d23a33'); p.r(77, t + 13, 5, 1, '#e3a820'); p.p(78, t + 7, '#fff3b0');
    p.r(74, t + 4, 1, 12, ed); p.r(84, t + 4, 1, 12, ed); p.r(75, t + 16, 9, 1, ed);
    // black over-ear headphones (decor)
    p.r(89, t + 6, 10, 2, '#2a2b31'); p.r(87, t + 7, 2, 6, '#2a2b31'); p.r(98, t + 7, 2, 6, '#2a2b31');
    p.box(85, t + 11, 5, 6, '#1d1d24'); p.box(97, t + 11, 5, 6, '#1d1d24');
    // a second baseball cap, green, leaning on the plant pot with the brim out front
    p.r(105, t + 15, 11, 5, '#3f7a4a'); p.r(107, t + 14, 7, 1, '#3f7a4a'); p.r(108, t + 15, 4, 1, '#5a9a64'); p.p(110, t + 14, '#2f5a38');
    p.r(102, t + 19, 10, 2, '#2f5a38'); // brim
    p.r(106, t + 13, 9, 1, ed); p.p(105, t + 14, ed); p.p(115, t + 14, ed); p.r(116, t + 15, 1, 5, ed);
    p.r(101, t + 19, 1, 2, ed); p.r(102, t + 21, 10, 1, ed); p.r(104, t + 15, 1, 4, ed);
    // front with four drawers
    p.box(0, t + topH - 1, w, h - t - topH + 1, WOOD.dark);
    const half = Math.floor(w / 2), fy = t + topH + 1, fh = Math.floor((h - fy - 4) / 2);
    for (let r = 0; r < 2; r++) {
        p.box(3, fy + r * (fh + 1), half - 4, fh, WOOD.mid);
        p.box(half + 1, fy + r * (fh + 1), half - 4, fh, WOOD.mid);
        p.r(Math.floor(half / 2) - 3, fy + r * (fh + 1) + Math.floor(fh / 2), 6, 2, '#e3b867');
        p.r(half + Math.floor(half / 2) - 3, fy + r * (fh + 1) + Math.floor(fh / 2), 6, 2, '#e3b867');
    }
    p.r(1, h - 3, w - 2, 2, WOOD.deep);
    // the towel's front half hangs over the top left drawer
    p.r(1, t + topH - 1, 8, 13, towel); p.r(1, t + topH + 3, 8, 1, '#f4f1ea'); p.r(1, t + topH + 5, 8, 1, '#f4f1ea'); p.r(1, t + topH + 8, 8, 1, towelL);
    p.r(1, t + topH + 11, 8, 1, towelD); p.r(8, t + topH - 1, 1, 13, towelD);
    p.r(1, t + topH + 12, 1, 2, towelL); p.r(4, t + topH + 12, 1, 2, towelL); p.r(7, t + topH + 12, 1, 2, towelL); // fringe
};

const dormGradcap: Painter = (p) => {
    p.r(1, 3, 14, 3, '#1d1d24'); p.r(3, 2, 10, 1, '#1d1d24'); p.r(3, 6, 10, 1, '#1d1d24');
    p.r(4, 3, 4, 1, '#3a3a46');
    p.r(4, 7, 8, 4, '#26262e');
    p.p(8, 4, '#f2c230'); p.r(13, 4, 1, 6, '#f2c230'); p.r(12, 10, 3, 2, '#f2c230');
};

/** A folded white T shirt: round collar, sleeves folded in, soft fabric shading. The print is text only. */
const dormShirt: Painter = (p, w, h) => {
    const white = '#f6f6f2', shade = '#dfe2e8', deep = '#c9ced8';
    // folded body, slightly narrower at the hem
    p.r(2, 3, w - 4, h - 4, white);
    p.r(3, h - 1, w - 6, 1, shade);
    // shoulders, with the folded sleeves tucked in at both sides
    p.r(1, 3, 4, 4, white); p.r(w - 5, 3, 4, 4, white);
    p.r(1, 6, 3, 1, shade); p.r(w - 4, 6, 3, 1, shade);
    p.p(4, 7, shade); p.p(5, 8, shade); p.p(w - 5, 7, shade); p.p(w - 6, 8, shade); // sleeve fold lines
    // round collar
    const cx = Math.floor(w / 2);
    p.r(cx - 4, 2, 8, 1, white); p.r(cx - 3, 3, 6, 2, deep); p.r(cx - 2, 3, 4, 1, '#b5bbc7');
    p.p(cx - 4, 3, shade); p.p(cx + 3, 3, shade);
    // soft fold shading
    p.r(2, h - 4, w - 4, 1, shade); p.r(w - 3, 4, 1, h - 6, shade); p.r(3, 9, 1, 3, shade);
    // the "Hope For Hearing" print is a crisp label on top (see the room's labels)
};

/** Mini fridge with a few magnets. Frame 1: door swung open to the left, lit inside, cans on the shelf. */
const dormFridge: Painter = (p, w, h) => {
    const bw = 22, ox = w - bw; // the body sits at the right; the strip on the left is room for the open door
    const can = (q: Px, x: number, y: number) => {
        q.r(x, y, 3, 6, '#2b4a9a'); q.r(x, y, 3, 1, '#c9ced8'); q.r(x, y + 3, 3, 3, '#c9ced8'); q.p(x, y + 1, '#4a6bc0');
    };
    const draw = (q: Px, open: boolean) => {
        q.box(ox, 0, bw, h, '#e9eef2');
        q.r(ox + 1, h - 2, bw - 2, 1, '#9aa3b0');
        const fz = Math.round(h * 0.34);
        if (!open) {
            q.r(ox + 1, 1, bw - 2, 1, '#ffffff');
            q.r(ox + 1, fz, bw - 2, 1, '#b9c2cc'); // freezer line
            q.r(ox + bw - 4, 3, 1, fz - 5, '#8c95a4'); q.r(ox + bw - 4, fz + 3, 1, 10, '#8c95a4'); // handles
            // magnets and a photo
            q.r(ox + 3, 4, 3, 2, '#d33a3a'); q.r(ox + 9, 5, 2, 2, '#f2c230');
            q.r(ox + 3, fz + 4, 6, 7, '#f7f3ea'); q.r(ox + 4, fz + 5, 4, 3, '#9fb8d6'); q.r(ox + 4, fz + 8, 4, 1, '#7a9a5a'); q.r(ox + 5, fz + 3, 2, 2, '#2f74b5');
            q.r(ox + 11, fz + 6, 2, 2, '#4f9a5a'); q.r(ox + 12, fz + 12, 3, 2, '#d33a3a');
            q.r(ox + 6, fz + 14, 7, 2, '#f7de6a'); // a sticky note
        } else {
            // lit inside: freezer box, two shelves, a row of cans, a takeout box and a carton
            q.r(ox + 1, 1, bw - 2, h - 3, '#fff3cc');
            q.r(ox + 2, 2, bw - 4, fz - 3, '#dfe6ee'); q.r(ox + 3, fz - 3, bw - 6, 1, '#b9c2cc'); // freezer box
            q.r(ox + 1, fz + 8, bw - 2, 1, '#c9ced8'); q.r(ox + 1, h - 8, bw - 2, 1, '#c9ced8'); // shelves
            for (let i = 0; i < 4; i++) can(q, ox + 3 + i * 4, fz + 2);
            q.r(ox + 3, h - 14, 8, 5, '#f4f1ea'); q.r(ox + 3, h - 14, 8, 1, '#c8423b'); // takeout box
            q.r(ox + 14, h - 15, 4, 6, '#f7f7f7'); q.r(ox + 14, h - 13, 4, 2, '#2f74b5'); // carton
            q.r(ox + 4, h - 7, 6, 4, '#8fc98a'); q.r(ox + 12, h - 6, 5, 3, '#f2c230'); // produce drawer
            // the door, swung open toward the viewer: a narrow panel with its own shelf
            q.box(ox - 7, 1, 8, h - 1, '#dfe5ea');
            q.r(ox - 6, 10, 6, 1, '#b9c2cc'); q.r(ox - 6, 20, 6, 1, '#b9c2cc');
            q.r(ox - 5, 6, 2, 4, '#c8423b'); q.r(ox - 3, 7, 2, 3, '#f2c230'); // condiment bottles
            q.r(ox - 5, 15, 2, 5, '#4f9a5a');
        }
    };
    draw(p, false);
    draw(p.at(w, 0), true);
};

/** Waste basket: wider at the top, ribbed, a dark bin bag folded over the rim, paper poking out, one ball that missed. */
const dormTrash: Painter = (p, w, h) => {
    const body = '#8c95a4', dark = '#6b7383', light = '#b7bfcc', bag = '#2a2b31', bagL = '#44464f';
    const top = 6, bw = w - 5; // the basket occupies x 0..bw, a stray paper ball sits to its right
    // tapered body: one pixel narrower every 4 rows toward the bottom
    for (let y = top; y < h; y++) {
        const inset = Math.floor((y - top) / 4);
        p.r(inset, y, bw - inset * 2, 1, body);
        p.p(inset, y, dark); p.p(bw - inset - 1, y, dark);
    }
    // vertical ribs
    for (let x = 3; x < bw - 3; x += 3) p.r(x, top + 3, 1, h - top - 4, dark);
    p.r(2, top + 3, 1, h - top - 6, light); // shine
    // black bin bag folded over the rim
    p.r(0, top - 1, bw, 3, bag); p.r(1, top - 1, bw - 2, 1, bagL); p.p(2, top + 2, bag); p.p(bw - 3, top + 2, bag);
    // crumpled paper poking out of the top
    p.r(2, 2, 4, 3, '#f4f1ea'); p.p(3, 3, '#cfc8bb'); p.p(4, 2, '#e2ddd2');
    p.r(6, 1, 3, 4, '#efe9dc'); p.p(7, 2, '#cfc8bb');
    p.r(bw - 4, 3, 3, 2, '#f7de6a'); // a yellow sticky note in there too
    // a paper ball that missed, on the floor beside it
    p.r(w - 4, h - 3, 3, 3, '#f4f1ea'); p.p(w - 3, h - 2, '#cfc8bb');
};

/** Laundry basket with clothes spilling over the top. */
const dormLaundry: Painter = (p, w, h) => {
    p.r(2, 7, w - 4, h - 7, '#c9b48a'); p.r(1, 6, w - 2, 2, '#b39b6c');
    for (let x = 3; x < w - 3; x += 3) p.r(x, 9, 1, h - 10, '#a88f62'); // wicker
    p.r(2, h - 2, w - 4, 1, '#8f7a52');
    // clothes heaped above the rim and spilling over the left side
    p.r(3, 2, 7, 5, '#3f5f8f'); p.r(8, 1, 7, 6, '#e8e6df'); p.r(14, 3, 5, 4, '#c8423b');
    p.r(5, 3, 3, 1, '#5a7aa8'); p.r(10, 2, 3, 1, '#ffffff');
    p.r(0, 6, 3, 6, '#3f5f8f'); p.r(0, 11, 2, 2, '#2f4a70'); // a sleeve hanging over the edge
};

/** A pair of sneakers. */
const dormSneakers: Painter = (p) => {
    const shoe = (x: number, y: number) => {
        p.r(x, y + 1, 6, 3, '#f4f4f4'); p.r(x + 1, y, 3, 1, '#f4f4f4'); p.r(x, y + 4, 7, 1, '#b9c2cc');
        p.r(x + 1, y + 2, 2, 1, '#2f74b5'); p.p(x + 4, y + 1, '#c9ced8');
    };
    shoe(0, 1); shoe(8, 0);
};

/** A small tote bag slumped on the floor. */
const dormBag: Painter = (p, w, h) => {
    p.r(1, 4, w - 2, h - 4, '#7a8a5a'); p.r(0, 6, w, h - 7, '#7a8a5a');
    p.r(2, 5, w - 4, 1, '#94a46e'); p.r(1, h - 2, w - 2, 1, '#5e6c44');
    p.r(3, 1, 1, 4, '#5e6c44'); p.r(w - 4, 1, 1, 4, '#5e6c44'); p.r(3, 0, w - 6, 1, '#5e6c44'); // handles
};

/** Wall hooks with a backpack hanging from one. */
const dormBackpack: Painter = (p, w, h) => {
    p.r(0, 1, w, 2, '#8f5f3d'); p.r(0, 1, w, 1, '#b07b50'); // hook rail
    p.p(3, 3, '#8c95a4'); p.p(w - 4, 3, '#8c95a4'); p.p(Math.floor(w / 2), 3, '#8c95a4');
    const x0 = Math.floor(w / 2) - 6;
    p.r(x0 + 4, 3, 1, 3, '#2a2b31'); p.r(x0 + 8, 3, 1, 3, '#2a2b31'); // straps over the hook
    p.r(x0 + 1, 6, 11, h - 7, '#c8423b'); p.r(x0, 8, 13, h - 10, '#c8423b');
    p.r(x0 + 2, 6, 9, 1, '#e06a5c');
    p.r(x0 + 2, 12, 9, 6, '#a8322c'); p.r(x0 + 3, 12, 7, 1, '#2a2b31'); // front pocket and zip
    p.r(x0 + 1, h - 2, 11, 1, '#8a2822');
};

/** Jeans tossed on the floor, legs splayed, a gold button at the waist. */
const dormJeans: Painter = (p) => {
    const jean = '#3f5f8f', jeanD = '#2f4a72', jeanL = '#5a7aa8';
    p.r(0, 1, 9, 5, jean); p.r(0, 1, 9, 1, jeanD); p.p(2, 1, '#e3b867'); // waist and button
    p.r(8, 2, 13, 3, jean); p.r(8, 3, 12, 1, jeanL); p.r(20, 2, 1, 3, jeanD); // one leg straight out
    p.r(6, 5, 4, 3, jean); p.r(8, 7, 7, 2, jean); p.r(14, 7, 1, 2, jeanD); // the other leg bent down
    p.r(1, 5, 5, 1, jeanD); p.r(10, 4, 3, 1, jeanD);
};

/** A white tee lying crumpled: clear T shape with both sleeves and a collar. */
const dormTeeFloor: Painter = (p) => {
    const tee = '#ecebe4', teeD = '#c9c6bd';
    p.r(4, 0, 8, 8, tee); p.r(0, 0, 4, 3, tee); p.r(12, 0, 4, 3, tee);
    p.r(0, 2, 4, 1, teeD); p.r(12, 2, 4, 1, teeD);
    p.p(6, 0, teeD); p.p(9, 0, teeD); p.r(7, 1, 2, 1, teeD); // collar
    p.r(5, 4, 3, 1, teeD); p.r(9, 6, 2, 1, teeD); p.r(4, 7, 8, 1, teeD);
};

/** A grey shirt balled up. */
const dormShirtBall: Painter = (p) => {
    p.r(1, 1, 8, 4, '#6b7686'); p.r(0, 2, 10, 2, '#6b7686'); p.r(2, 0, 5, 1, '#6b7686');
    p.r(2, 1, 3, 1, '#8590a0'); p.r(3, 3, 4, 1, '#55606f'); p.r(7, 2, 1, 2, '#55606f');
};

/** A lone sock: white with two red stripes. */
const dormSock: Painter = (p) => {
    const sock = '#f2f0ea', sockD = '#cfcabe';
    p.r(0, 4, 6, 2, sock); p.r(4, 0, 2, 5, sock); p.r(4, 0, 2, 1, '#c8423b'); p.r(4, 2, 2, 1, '#c8423b');
    p.p(0, 5, sockD); p.p(5, 5, sockD);
};

// ---------- home ----------

/** Three tier shelf: trophy and striped oar, three plaques, four upright books (titles are crisp labels). */
const homeShelf: Painter = (p, w, h) => {
    p.box(0, 0, w, h, PALE_WOOD.dark);
    p.r(1, 1, w - 2, 4, PALE_WOOD.light);
    const tiers = [6, 40, 74];
    const tierH = 32;
    tiers.forEach((ty) => {
        p.r(4, ty + 2, w - 8, tierH - 4, '#5a3e2a');
        p.r(3, ty + tierH - 2, w - 6, 3, PALE_WOOD.mid);
    });
    // top: trophy on the left
    const t = tiers[0];
    const gold = '#e8be4a', goldD = '#b88a24', goldL = '#fbe08e';
    p.r(9, t + 5, 13, 9, gold); p.r(11, t + 6, 3, 6, goldL);
    p.r(6, t + 6, 3, 5, gold); p.r(22, t + 6, 3, 5, gold);
    p.r(13, t + 14, 5, 3, goldD); p.r(14, t + 17, 3, 3, gold);
    p.box(9, t + 20, 13, 7, '#6b4429'); p.r(12, t + 22, 7, 2, goldL);
    // top: an oar blade seen face on (straight top edge, angled tip), blue and white vertical stripes, a bit of handle
    const blue = '#24407e', white = '#f4f4f4';
    const stripe = (x: number) => {
        const k = x - 30;
        return (k >= 6 && k <= 8) || (k >= 12 && k <= 19) || (k >= 22 && k <= 23) ? white : blue;
    };
    for (let x = 30; x <= 58; x++) {
        const top = t + 7 + Math.round((x - 30) * 0.12);
        const bottom = x < 50 ? t + 23 - Math.round((x - 30) * 0.05) : t + 22 - Math.round((x - 50) * 1.05);
        if (bottom <= top) continue;
        p.r(x, top, 1, bottom - top, stripe(x));
    }
    p.r(30, t + 7, 29, 1, '#16295a'); p.r(30, t + 7, 1, 16, '#16295a'); // crisp edge
    p.r(59, t + 10, 11, 3, '#2a2b31'); p.r(59, t + 10, 11, 1, '#4a4d57'); // the handle stub
    // top: a beach volleyball, bottom right of the tier
    const bx = 60, by = t + 21;
    p.r(bx + 2, by, 6, 10, '#f7f3e8'); p.r(bx, by + 2, 10, 6, '#f7f3e8'); p.r(bx + 1, by + 1, 8, 8, '#f7f3e8');
    p.r(bx + 1, by + 2, 3, 6, '#f2c230'); p.r(bx + 2, by + 1, 2, 1, '#f2c230');
    p.r(bx + 6, by + 1, 2, 4, '#2f74b5'); p.r(bx + 7, by + 3, 2, 3, '#2f74b5');
    p.r(bx + 4, by + 7, 4, 2, '#2f74b5'); p.p(bx + 3, by + 3, '#fffdf4');
    // middle: three plaques
    const m = tiers[1];
    [['#c9a24a', 7], ['#2f4a8a', 29], ['#7a2f2f', 51]].forEach(([c, x]) => {
        p.box(x as number, m + 5, 18, 22, '#6b4429');
        p.r((x as number) + 2, m + 7, 14, 18, c as string);
        p.r((x as number) + 4, m + 10, 10, 6, '#efe7d2');
        p.r((x as number) + 5, m + 19, 8, 1, '#efe7d2'); p.r((x as number) + 6, m + 21, 6, 1, '#efe7d2');
    });
    // bottom: four thinner books, centered: two lying flat in a stack, one upright, one leaning on it
    const b = tiers[2];
    const base = b + tierH - 2; // top of the shelf board
    const book = (x: number, y: number, w2: number, h2: number, c: string, d: string) => {
        p.box(x, y, w2, h2, c, OUTLINE);
        if (w2 > h2) { p.r(x + 2, y + 1, 1, h2 - 2, d); p.r(x + w2 - 3, y + 1, 1, h2 - 2, d); }
        else { p.r(x + 1, y + 2, w2 - 2, 1, d); p.r(x + 1, y + h2 - 3, w2 - 2, 1, d); }
    };
    book(13, base - 7, 28, 7, '#2f3f8a', '#22306a');        // Solo Levelling, flat
    book(15, base - 13, 24, 6, '#b8392f', '#8f2a22');       // Sweet Home, flat on top
    book(43, base - 27, 8, 27, '#3d5a3a', '#2a3f28');       // AOT, upright
    // Lookism leaning on AOT: each row shifts left as it rises
    for (let r = 0; r < 26; r++) {
        const y = base - 1 - r, x = 57 - Math.round(r * 0.25);
        p.p(x - 1, y, OUTLINE); p.r(x, y, 7, 1, '#1f1f26'); p.p(x + 7, y, OUTLINE);
        if (r === 2 || r === 23) p.r(x, y, 7, 1, '#36363f');
    }
    p.r(51, base - 27, 7, 1, OUTLINE);
};

const homeFloorPlant: Painter = (p, w, h) => {
    plantPot(p, 3, h - 10, w - 6, 10);
    p.r(4, 6, w - 8, h - 16, LEAF); p.r(2, 9, w - 4, h - 20, LEAF);
    p.r(6, 1, 4, 6, LEAF); p.r(1, 4, 4, 5, LEAF_D); p.r(w - 5, 3, 4, 6, LEAF_D);
    p.p(5, 2, LEAF_L); p.p(9, 5, LEAF_L); p.p(3, 10, LEAF_L); p.p(12, 9, LEAF_L); p.p(7, 12, LEAF_D);
    p.r(Math.floor(w / 2), 10, 1, h - 20, LEAF_D);
};

const TORONTO_SKY: Record<TimeOfDay, { top: string; bottom: string; city: string; lit: string | null }> = {
    0: { top: '#7fbde6', bottom: '#b5dcf3', city: '#5a6f8c', lit: null },
    1: { top: '#c95a7c', bottom: '#f6aa62', city: '#4a3550', lit: '#f6d27a' },
    2: { top: '#101632', bottom: '#222a55', city: '#1c2238', lit: '#f6e08f' }
};

/** Window with dark blue curtains, a Toronto skyline (generic tower and blocks), a plant on the sill. */
const homeWindow: Painter = (p, w, h) => {
    const curtain = '#22396b', curtainL = '#2f4c8a';
    for (let f = 0 as TimeOfDay; f < 3; f = (f + 1) as TimeOfDay) {
        const q = p.at(f * w, 0);
        const s = TORONTO_SKY[f];
        q.r(0, 0, w, 3, '#2a2b31');
        q.box(10, 3, w - 20, h - 7, '#2a2b31');
        const gh = h - 9;
        for (let y = 0; y < gh; y++) q.r(11, 4 + y, w - 22, 1, y < gh * 0.55 ? s.top : s.bottom);
        if (f === 2) [[16, 7], [30, 10], [52, 6], [60, 12]].forEach(([x, y]) => q.p(x, y, '#ffffff'));
        const base = h - 6;
        const bars: [number, number, number][] = [[12, 9, 10], [20, 6, 15], [26, 8, 8], [34, 5, 17], [45, 7, 12], [52, 9, 16], [60, 5, 9]];
        bars.forEach(([x, bw, bh]) => q.r(x, base - bh, bw, bh, s.city));
        // tall needle tower with a pod
        q.r(41, base - 31, 2, 31, s.city); q.r(39, base - 22, 6, 3, s.city); q.r(40, base - 25, 4, 2, s.city); q.p(41, base - 34, s.city); q.p(41, base - 33, s.city);
        if (s.lit) for (let i = 0; i < 12; i++) q.p(14 + i * 4, base - 3 - (i % 3) * 3, s.lit);
        q.r(Math.floor(w / 2) - 1, 4, 2, gh, '#2a2b31');
        // sill and a small plant
        q.r(8, h - 4, w - 16, 4, '#a9cfb6'); q.r(8, h - 4, w - 16, 1, '#e3f5e8');
        plantPot(q, 33, h - 9, 7, 5); q.r(34, h - 12, 5, 3, LEAF); q.p(33, h - 11, LEAF_L); q.p(39, h - 12, LEAF_L); q.p(36, h - 13, LEAF_L);
        // curtains
        q.box(0, 2, 12, h - 2, curtain); q.r(3, 3, 1, h - 5, curtainL); q.r(7, 3, 1, h - 5, curtainL);
        q.box(w - 12, 2, 12, h - 2, curtain); q.r(w - 9, 3, 1, h - 5, curtainL); q.r(w - 5, 3, 1, h - 5, curtainL);
    }
};

/** Hoodie on a wall hook. The chest is the hoodie-logo slot; until then a plain crisp "TORONTO" label sits there. */
const homeHoodie: Painter = (p, w, h) => {
    const c = '#3a3d46', d = '#2a2c33', l = '#4b4f5a';
    p.r(Math.floor(w / 2) - 1, 0, 3, 3, '#8c95a4'); // hook
    p.r(Math.floor(w / 2) - 4, 2, 8, 5, d); // hood
    p.r(4, 6, w - 8, h - 8, c); // body
    p.r(0, 8, 5, h - 12, c); p.r(w - 5, 8, 5, h - 12, c); // sleeves
    p.r(0, h - 5, 5, 2, d); p.r(w - 5, h - 5, 5, 2, d);
    p.r(5, 7, 1, h - 10, l);
    p.r(4, h - 3, w - 8, 2, d); // waistband
    p.r(8, h - 9, w - 16, 4, d); // pocket
    p.r(Math.floor(w / 2) - 2, 7, 1, 4, '#cfd5df'); p.r(Math.floor(w / 2) + 1, 7, 1, 4, '#cfd5df'); // strings
};

const homePullup: Painter = (p, w, h) => {
    p.box(6, 4, 6, h - 10, METAL.dark); p.r(7, 5, 1, h - 12, METAL.mid);
    p.box(w - 12, 4, 6, h - 10, METAL.dark); p.r(w - 11, 5, 1, h - 12, METAL.mid);
    p.box(1, 2, w - 2, 5, METAL.light); p.r(2, 3, w - 4, 1, '#e3e8ef');
    p.r(12, 30, 8, 3, METAL.dark); p.r(w - 20, 30, 8, 3, METAL.dark);
    p.box(0, h - 7, 18, 7, METAL.deep); p.box(w - 18, h - 7, 18, 7, METAL.deep);
};

/** Work table along the right wall, naturally messy. The speaker and camera are separate sprites. */
const homeTable: Painter = (p, w, h) => {
    const topH = 86;
    p.box(0, 0, w, topH, PALE_WOOD.light);
    p.r(1, 1, 2, topH - 2, PALE_WOOD.mid);
    p.r(1, topH - 3, w - 2, 2, '#e0b98b');
    // receipts and sticky notes (speaker sits at 6..36 x 5..27, camera at 24..42 x 38..52)
    p.r(5, 30, 9, 6, '#f7f3ea'); p.r(7, 31, 6, 1, '#b8ad9c'); p.r(7, 33, 5, 1, '#b8ad9c'); p.r(9, 34, 7, 4, '#efe9dc');
    p.r(42, 28, 6, 6, '#f7de6a'); p.r(46, 31, 6, 6, '#a9d2f2'); p.r(43, 30, 4, 1, '#a08a3a');
    // lens cap left beside the camera
    p.r(11, 41, 5, 5, '#16171c'); p.r(12, 42, 3, 3, '#2c2e36'); p.p(13, 43, '#4a4d57');
    // charging cable trailing from the speaker off the far edge
    [[37, 14], [38, 15], [39, 15], [40, 16], [41, 17], [42, 17], [43, 18], [44, 18], [45, 19], [46, 20], [47, 21], [47, 22],
        [48, 23], [49, 24], [50, 24], [51, 25], [52, 26], [53, 26], [54, 27]].forEach(([x, y]) => p.p(x, y, '#2a2b31'));
    // notebook with pencils across it
    p.box(5, 56, 18, 14, '#5e7e6b'); p.r(7, 57, 1, 12, '#3f5a49'); p.r(10, 60, 10, 1, '#8fae99');
    p.r(16, 62, 15, 1, '#f2c230'); p.p(31, 62, '#2a2b31'); p.p(15, 62, '#e8a0a0');
    p.r(19, 65, 14, 1, '#f2c230'); p.p(33, 65, '#2a2b31'); p.p(18, 65, '#e8a0a0');
    // mug with a pencil in it
    p.box(38, 66, 7, 8, '#3f6fb0'); p.r(45, 68, 2, 4, '#3f6fb0'); p.r(39, 67, 5, 1, '#2a4f86'); p.r(41, 61, 1, 6, '#f2c230');
    // small plant
    plantPot(p, 6, 77, 7, 6); p.r(6, 72, 7, 5, LEAF); p.p(5, 73, LEAF_L); p.p(13, 74, LEAF_L); p.p(9, 71, LEAF_L); p.p(9, 75, LEAF_D);
    p.box(0, topH - 1, w, 8, PALE_WOOD.dark);
    p.r(2, topH + 7, 5, h - topH - 7, PALE_WOOD.deep);
    p.r(w - 7, topH + 7, 5, h - topH - 7, PALE_WOOD.deep);
};

/** Big black speaker, set down at an angle (its right end turned away). The badge is the speaker-logo slot. */
const homeSpeaker: Painter = (p, w, h) => {
    const face = 24;
    const top = (x: number) => 6 - Math.floor(x * 0.13);
    // handle following the slant
    for (let x = 5; x < face - 5; x++) p.p(x, top(x) - 4, '#2a2b31');
    p.r(5, top(5) - 4, 1, 4, '#2a2b31'); p.r(face - 6, top(face - 6) - 4, 1, 4, '#2a2b31');
    // front face
    for (let x = 0; x < face; x++) { p.r(x, top(x), 1, 14, '#1b1c22'); p.p(x, top(x), '#34363f'); }
    // the side end turned away from us
    for (let x = face; x < w; x++) { const k = x - face; p.r(x, top(face) + Math.floor(k * 0.4), 1, 14 - Math.floor(k * 0.6), '#101116'); }
    const woofer = (cx: number) => {
        const cy = top(cx) + 7;
        p.r(cx - 3, cy - 3, 7, 7, '#0f1014'); p.r(cx - 4, cy - 2, 9, 5, '#0f1014');
        p.r(cx - 2, cy - 2, 5, 5, '#2c2e36'); p.r(cx - 1, cy - 1, 3, 3, '#3a3d46'); p.p(cx, cy, '#5a5d67');
    };
    woofer(6); woofer(17);
    p.r(10, 16, 4, 2, '#e5762f'); // plain orange badge
    void h;
};

/** Camera set down casually, its strap draped beside it. */
const homeCamera: Painter = (p, w, h) => {
    const strap = '#6b5242', strapD = '#4e3a2e';
    // strap looping out to the left and under
    [[2, 5], [1, 6], [0, 7], [0, 8], [1, 9], [1, 10], [2, 11], [3, 12], [4, 12]].forEach(([x, y]) => p.p(x, y, strap));
    p.r(4, h - 1, 9, 1, strap); p.r(13, h - 2, 3, 1, strapD); p.p(16, h - 3, strapD);
    p.r(6, 0, 5, 2, '#2a2b31');
    p.box(3, 2, 13, 10, '#2f3138');
    p.r(4, 3, 11, 2, '#4a4d57');
    p.box(6, 4, 7, 7, '#16171c');
    p.r(8, 6, 3, 3, '#4fa3e0');
    p.p(8, 6, '#bfe6ff');
    p.r(13, 4, 2, 1, '#d33a3a');
    void w;
};

/** Nightstand with a glowing lamp and a family photo frame (silhouettes until the photo slot is filled). */
const homeNightstand: Painter = (p, w, h) => {
    const topH = 16;
    p.box(0, topH - 1, w, h - topH + 1, PALE_WOOD.mid);
    p.box(3, topH + 3, w - 6, 10, PALE_WOOD.light);
    p.r(Math.floor(w / 2) - 3, topH + 7, 6, 2, '#6b4429');
    p.r(1, h - 3, w - 2, 2, PALE_WOOD.deep);
    p.box(0, 8, w, topH - 7, PALE_WOOD.light);
    // lamp, visibly lit
    p.r(3, 0, 11, 7, '#ffe48a'); p.r(4, 1, 4, 5, '#fffbe0'); p.r(3, 6, 11, 1, '#e8b84a');
    p.r(7, 7, 3, 3, '#3a3a46');
    // photo frame with people silhouettes
    p.box(18, 0, 15, 11, '#4e2f1c');
    p.r(19, 1, 13, 9, '#f1e7d6');
    const sil = '#9a8f86';
    [[20, 3, 3], [24, 2, 3], [28, 3, 3]].forEach(([x, y]) => { p.r(x, y + 1, 2, 2, sil); p.r(x - 0, y + 3, 3, 9 - y - 3, sil); });
    p.r(26, 6, 2, 1, sil); p.r(26, 7, 2, 3, sil);
};

/** Compact bed with two plush toys. */
const homeBed: Painter = (p, w, h) => {
    const topH = 30;
    p.box(0, 0, w, topH, '#5a3a26');
    // green and blue plaid blanket
    for (let y = 2; y < topH - 2; y++) {
        for (let x = 2; x < w - 2; x++) {
            const vx = x % 8 < 2, hy = y % 8 < 2;
            const c = vx && hy ? '#244573' : vx || hy ? '#2f5a8f' : x % 8 === 5 || y % 8 === 5 ? '#6aa884' : '#3e7d5e';
            p.p(x, y, c);
        }
    }
    p.r(2, 2, w - 4, 1, '#5d9a78');
    p.box(3, 3, 20, topH - 6, '#efe9da');
    p.r(5, 5, 16, 2, '#ffffff');
    p.r(0, 0, 3, topH, '#3d2617');
    // plush toys: a round bunny and a blue blob
    p.r(66, 6, 9, 8, '#f2ece2'); p.r(67, 2, 2, 5, '#f2ece2'); p.r(72, 2, 2, 5, '#f2ece2');
    p.p(68, 9, OUTLINE); p.p(72, 9, OUTLINE); p.p(70, 11, '#e79a9a');
    p.r(78, 7, 9, 8, '#8fb8e8'); p.r(79, 6, 7, 1, '#8fb8e8'); p.p(80, 10, OUTLINE); p.p(84, 10, OUTLINE); p.r(81, 12, 3, 1, '#5a7aa8');
    p.box(0, topH - 1, w, h - topH + 1, '#4a2f1f');
};

/** Front desk with drawers; a tiny cactus at the far end. */
const homeDesk: Painter = (p, w, h) => {
    const topH = 20;
    p.box(0, 0, w, topH, PALE_WOOD.light);
    p.r(1, topH - 3, w - 2, 2, '#e0b98b');
    p.box(0, topH - 1, w, h - topH + 1, PALE_WOOD.mid);
    const half = Math.floor(w / 2);
    p.box(3, topH + 2, half - 4, h - topH - 6, PALE_WOOD.light);
    p.box(half + 1, topH + 2, half - 4, h - topH - 6, PALE_WOOD.light);
    p.r(Math.floor(half / 2) - 3, topH + 9, 6, 2, '#6b4429');
    p.r(half + Math.floor(half / 2) - 3, topH + 9, 6, 2, '#6b4429');
    p.r(1, h - 3, w - 2, 2, PALE_WOOD.deep);
    // tiny cactus
    plantPot(p, w - 9, 8, 6, 5); p.r(w - 8, 3, 4, 6, '#5aa36a'); p.p(w - 9, 5, '#5aa36a'); p.p(w - 4, 4, '#5aa36a'); p.p(w - 7, 2, '#f2a6b8');
};

const homePiano: Painter = (p, w, h) => {
    p.box(0, 0, w, h, '#22232a');
    p.r(2, 5, w - 4, h - 7, '#f6f3ea');
    for (let x = 2; x < w - 2; x += 3) p.r(x, 5, 1, h - 7, '#c9c4b6');
    for (let x = 3; x < w - 3; x += 3) if (x % 21 !== 12) p.r(x + 1, 5, 2, 4, '#22232a');
    p.r(3, 2, 6, 1, '#4fa3e0'); p.r(w - 8, 2, 4, 1, '#d33a3a');
};

/** A large apple crisp pie with one slice served on a plate, fork beside it. */
/** A large apple crisp pie with one slice served on a plate, fork beside it.
 *  4 frames: the served slice is eaten bite by bite (frame 3 is an empty plate with crumbs). */
const homePie: Painter = (p, w, h) => {
    for (let f = 0; f < 4; f++) {
        const q = p.at(f * w, 0);
        const dish = '#e7e2d8';
        q.r(1, 3, 20, 12, dish); q.r(3, 2, 16, 14, dish);
        q.r(3, 4, 16, 10, '#d9a04a'); q.r(2, 6, 18, 6, '#d9a04a');
        const rand = rng(5);
        for (let i = 0; i < 40; i++) q.p(3 + Math.floor(rand() * 16), 4 + Math.floor(rand() * 10), rand() < 0.5 ? '#f2c57a' : '#b9772f');
        q.r(14, 8, 5, 4, '#8c5a2a'); q.r(16, 6, 3, 2, '#8c5a2a'); q.r(15, 9, 3, 2, '#e8d29a');
        // plate
        q.r(22, 6, 11, 9, '#f7f5f0'); q.r(23, 5, 9, 11, '#f7f5f0'); q.r(24, 7, 7, 7, '#e8e4dc');
        // the slice, smaller each frame
        const sw = [5, 3, 2, 0][f];
        if (sw) { q.r(25, 8, sw, 4, '#d9a04a'); q.r(25, 8, sw, 1, '#f2c57a'); q.r(26, 11, Math.max(1, sw - 2), 1, '#e8d29a'); }
        else { q.p(26, 10, '#d9a04a'); q.p(28, 9, '#f2c57a'); q.p(29, 11, '#b9772f'); }
        // fork
        q.r(w - 1, 6, 1, 9, '#b7bfcc'); q.r(w - 2, 5, 1, 3, '#b7bfcc');
        void h;
    }
};

/** A soft, fluffy beige rug with a shaggy edge. */
const homeRug: Painter = (p, w, h) => {
    const rand = rng(31);
    const base = '#e6d5b8', shade = '#d6c29f', light = '#f4ead8', edge = '#c9b28c';
    for (let x = 0; x < w; x++) {
        const t = 1 + Math.floor(rand() * 2), btm = h - 1 - Math.floor(rand() * 2);
        const inset = x < 4 || x > w - 5 ? 2 : 0;
        p.r(x, t + inset, 1, btm - t - inset * 2, base);
        p.p(x, t + inset, edge); p.p(x, btm - inset - 1, edge);
    }
    for (let i = 0; i < 260; i++) {
        const x = 2 + Math.floor(rand() * (w - 4)), y = 3 + Math.floor(rand() * (h - 6));
        p.p(x, y, rand() < 0.55 ? light : shade);
    }
    for (let x = 3; x < w - 3; x += 2) { if (rand() < 0.6) p.p(x, 0, edge); if (rand() < 0.6) p.p(x, h - 1, edge); }
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
    doorSide, doormat, signRight: signPainter('right'), signLeft: signPainter('left'), wallClock,
    fxArrow, fxArrowSmall, sparkle, fxZ, fxHeart, fxNote, fxPuff, fxBulb, pencil,
    daniel: danielStrip('all'), danielShirt: danielStrip('shirt'), danielSleep, danielSleepHome, cat,
    slotGraduation, slotDamn, slotDuck, slotIgor, slotEmpty, slotHome1, slotHome2, slotHome3,
    dormWindow, dormPennant, dormTodo, dormDesk, dormLaptop, dormBinder, dormPhone,
    dormCloset, dormBeanbag, dormFloorLamp, dormBed, dormRug, dormDresser, dormGradcap, dormShirt,
    dormFridge, dormTrash, dormLaundry, dormSneakers, dormBag, dormBackpack, dormJeans, dormTeeFloor, dormShirtBall, dormSock,
    homeShelf, homeFloorPlant, homeWindow, homeHoodie, homePullup, homeTable, homeSpeaker, homeCamera,
    homeNightstand, homeBed, homeDesk, homePiano, homePie, homeRug, homeLongboard
} satisfies Record<string, Painter>;
