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
        if (arrow === 'right') { p.r(w - 7, ay, 4, 1, c); p.p(w - 4, ay - 1, c); p.p(w - 4, ay + 1, c); p.p(w - 3, ay, c); }
        else { p.r(3, ay, 4, 1, c); p.p(3, ay - 1, c); p.p(3, ay + 1, c); p.p(2, ay, c); }
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
type Pose = 'stand' | 'sit' | 'crouch' | 'hang' | 'cheer' | 'eat' | 'eatDown';

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
        } else if (pose === 'eat' || pose === 'eatDown') {
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
    }
}

/** Frame list for the character strip. Keep in sync with Boot's animations. */
export const DANIEL_FRAMES = {
    down: 0, up: 6, side: 12, // each: idle0, idle1, walk0..3
    sit: 18, crouch: 19, hang: 20, hangStrain: 21, cheer: 22, eat: 23, eatDown: 24
} as const;
export const DANIEL_FRAME_COUNT = 25;

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
    };
}

/** Asleep: head on the pillow, blanket hump. Two breathing frames. */
const danielSleep: Painter = (p) => {
    for (let f = 0; f < 2; f++) {
        const q = p.at(f * 30, 0);
        const rise = f;
        q.r(10, 5 - rise, 19, 8 + rise, '#6c7fc0');
        q.r(10, 5 - rise, 19, 1, '#8a9ad2');
        q.r(14, 8, 1, 4, '#5a6aa8');
        q.r(1, 2, 11, 10, HAIR);
        q.p(2, 1, HAIR); q.p(5, 1, HAIR); q.p(8, 1, HAIR); q.p(4, 3, HAIR_L); q.p(9, 2, HAIR_L);
        q.r(3, 5, 8, 6, SKIN);
        q.r(4, 7, 2, 1, OUTLINE);
        q.r(8, 7, 2, 1, OUTLINE);
        q.p(3, 5, HAIR); q.p(6, 5, HAIR); q.p(9, 5, HAIR);
        q.r(6, 9, 2, 1, MOUTH); // asleep: closed mouth
    }
};

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
    // clutter (muted, kept off the interactive items)
    // loose papers and a notebook
    p.r(4, 28, 12, 8, '#efe9dc'); p.r(6, 30, 9, 8, '#f7f3ea'); p.r(7, 32, 6, 1, '#b8ad9c'); p.r(7, 34, 5, 1, '#b8ad9c');
    p.box(34, 30, 13, 10, '#5e7e6b'); p.r(36, 31, 1, 8, '#3f5a49');
    // pens
    p.r(49, 36, 7, 1, '#2a3a8a'); p.r(50, 38, 6, 1, '#c8423b');
    // mug with a little steam gap
    p.box(26, 24, 6, 7, '#e9e4d6'); p.r(32, 26, 2, 3, '#e9e4d6'); p.r(27, 25, 4, 1, '#6b4429');
    // sticky notes stuck to the desk edge
    p.r(58, 32, 5, 5, '#f7de6a'); p.r(64, 33, 5, 5, '#f2a6b8');
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
    p.r(mid - 4, 50, 2, 8, '#e3b867');
    p.r(mid + 3, 50, 2, 8, '#e3b867');
    // sleeve hanging out between the doors
    p.r(mid - 1, 40, 3, 22, '#3f6fd0'); p.r(mid - 1, 40, 1, 22, '#5a8ae6'); p.r(mid - 1, 62, 3, 3, '#2f5aa8'); // cuff
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

/** Compact bed. A UCLA hoodie (blue, gold chest stripe) and a tan bear plush sit on it. */
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
    // UCLA hoodie tossed on the blanket
    p.box(44, 14, 22, 15, UCLA_BLUE);
    p.r(40, 16, 5, 9, UCLA_BLUE); p.r(65, 17, 5, 8, UCLA_BLUE); // sleeves
    p.r(51, 12, 8, 4, UCLA_BLUE_D); // hood
    p.r(46, 19, 18, 2, UCLA_GOLD); // chest stripe
    p.r(53, 23, 4, 4, UCLA_BLUE_D); // pocket
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

const dormRug: Painter = (p, w, h) => {
    const c = '#a99ac4', d = '#8f80ae', l = '#bfb2d6';
    const cx = w / 2, cy = h / 2;
    for (let y = 0; y < h; y++) {
        const t = (y + 0.5 - cy) / cy;
        const half = Math.round((w / 2) * Math.sqrt(Math.max(0, 1 - t * t)));
        if (half <= 0) continue;
        p.r(Math.round(cx - half), y, half * 2, 1, c);
        const inner = Math.round(half * 0.72);
        if (Math.abs(t) < 0.72) { p.p(Math.round(cx - inner), y, l); p.p(Math.round(cx + inner) - 1, y, l); }
        p.p(Math.round(cx - half), y, d); p.p(Math.round(cx + half) - 1, y, d);
    }
    p.r(Math.round(cx - w * 0.36), Math.round(cy - h * 0.36), 1, 1, l);
};

/** Bigger dresser: black headphones and a potted plant baked on top (decor). */
const dormDresser: Painter = (p, w, h) => {
    const t = 8, topH = 22;
    // plant leaves rise above the top surface (drawn after the top, see below)
    // top surface
    p.box(0, t, w, topH, WOOD.light);
    p.r(1, t + topH - 3, w - 2, 2, '#c08a5c');
    // potted plant: a bushy fan of leaves sitting in the pot
    const px = w - 16, py = t + 6;
    p.r(px - 1, py - 8, 12, 9, LEAF); p.r(px + 1, py - 11, 8, 4, LEAF); p.r(px - 3, py - 5, 3, 4, LEAF_D); p.r(px + 10, py - 6, 3, 4, LEAF_D);
    p.r(px + 3, py - 13, 2, 3, LEAF_L); p.p(px, py - 7, LEAF_L); p.p(px + 8, py - 9, LEAF_L); p.p(px + 5, py - 5, LEAF_D); p.p(px + 2, py - 3, LEAF_D);
    plantPot(p, px, py, 10, 9);
    // black over-ear headphones (decor)
    p.r(70, t + 6, 12, 2, '#2a2b31'); p.r(69, t + 7, 2, 6, '#2a2b31'); p.r(81, t + 7, 2, 6, '#2a2b31');
    p.box(67, t + 11, 5, 6, '#1d1d24'); p.box(80, t + 11, 5, 6, '#1d1d24');
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
};

const dormGradcap: Painter = (p) => {
    p.r(1, 3, 14, 3, '#1d1d24'); p.r(3, 2, 10, 1, '#1d1d24'); p.r(3, 6, 10, 1, '#1d1d24');
    p.r(4, 3, 4, 1, '#3a3a46');
    p.r(4, 7, 8, 4, '#26262e');
    p.p(8, 4, '#f2c230'); p.r(13, 4, 1, 6, '#f2c230'); p.r(12, 10, 3, 2, '#f2c230');
};

/** Folded white "Hope For Hearing" shirt. */
const dormShirt: Painter = (p, w, h) => {
    p.box(0, 1, w, h - 1, '#f7f7f4', '#9aa0aa');
    p.r(1, 2, w - 2, 1, '#ffffff');
    p.r(1, h - 2, w - 2, 1, '#d8dce4');
    p.r(Math.floor(w / 2) - 3, 1, 6, 1, '#d8dce4'); // collar fold
    pixelText(p, 'H4H', Math.floor((w - pixelTextWidth('H4H')) / 2), 4, '#2f5aa8');
};

/** A small pile of clothes and a lone sock. */
const dormClothes: Painter = (p) => {
    p.r(1, 5, 14, 6, '#55606f'); p.r(3, 3, 10, 3, '#55606f'); p.r(4, 4, 4, 2, '#6b7686');
    p.r(9, 6, 10, 5, '#3f5f8f'); p.r(10, 6, 7, 1, '#5a7aa8');
    p.r(5, 8, 7, 3, '#e8e6df');
    // sock
    p.r(24, 8, 6, 2, '#f2f0ea'); p.r(28, 6, 2, 3, '#f2f0ea'); p.r(24, 8, 1, 2, '#c8423b');
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
    // top: blue and white striped oar to the right, leaning
    for (let i = 0; i < 40; i++) {
        const x = 30 + i, y = t + 27 - Math.round(i * 0.5);
        p.r(x, y, 1, 2, Math.floor(i / 4) % 2 ? '#2f5aa8' : '#f4f4f4');
    }
    p.r(64, t + 3, 7, 6, '#2f5aa8'); p.r(66, t + 4, 3, 4, '#f4f4f4'); p.r(70, t + 2, 2, 7, '#2f5aa8');
    // middle: three plaques
    const m = tiers[1];
    [['#c9a24a', 7], ['#2f4a8a', 29], ['#7a2f2f', 51]].forEach(([c, x]) => {
        p.box(x as number, m + 5, 18, 22, '#6b4429');
        p.r((x as number) + 2, m + 7, 14, 18, c as string);
        p.r((x as number) + 4, m + 10, 10, 6, '#efe7d2');
        p.r((x as number) + 5, m + 19, 8, 1, '#efe7d2'); p.r((x as number) + 6, m + 21, 6, 1, '#efe7d2');
    });
    // bottom: four books standing upright
    const b = tiers[2];
    const books: [number, number, string, string][] = [
        [8, 26, '#3d5a3a', '#2a3f28'], [21, 29, '#1f1f26', '#36363f'], [34, 27, '#b8392f', '#8f2a22'], [47, 29, '#2f3f8a', '#22306a']
    ];
    books.forEach(([x, bh, c, d]) => {
        const top = b + tierH - 2 - bh;
        p.box(x, top, 12, bh, c, OUTLINE);
        p.r(x + 1, top + 2, 10, 1, d); p.r(x + 1, top + bh - 4, 10, 1, d);
        p.r(x + 1, top + 1, 1, bh - 2, 'rgba(255,255,255,0.18)');
    });
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

const homeTable: Painter = (p, w, h) => {
    const topH = 86;
    p.box(0, 0, w, topH, PALE_WOOD.light);
    p.r(1, 1, 2, topH - 2, PALE_WOOD.mid);
    p.r(1, topH - 3, w - 2, 2, '#e0b98b');
    // spare slot (reserved): dashed outline
    const sy = 64, sx = 14, sw = 30, sh = 14;
    for (let x = sx; x < sx + sw; x += 3) { p.p(x, sy, '#fff8e8'); p.p(x, sy + sh, '#fff8e8'); }
    for (let y = sy; y <= sy + sh; y += 3) { p.p(sx, y, '#fff8e8'); p.p(sx + sw - 1, y, '#fff8e8'); }
    p.box(0, topH - 1, w, 8, PALE_WOOD.dark);
    p.r(2, topH + 7, 5, h - topH - 7, PALE_WOOD.deep);
    p.r(w - 7, topH + 7, 5, h - topH - 7, PALE_WOOD.deep);
};

/** Big black speaker with two woofers and a handle. The badge is the speaker-logo slot. */
const homeSpeaker: Painter = (p, w, h) => {
    p.r(6, 0, w - 12, 2, '#2a2b31'); p.r(5, 1, 2, 4, '#2a2b31'); p.r(w - 7, 1, 2, 4, '#2a2b31'); // handle
    p.box(0, 4, w, h - 4, '#1b1c22');
    p.r(1, 5, w - 2, 1, '#34363f');
    const woofer = (cx: number) => {
        const cy = 4 + Math.floor((h - 4) / 2);
        p.r(cx - 4, cy - 3, 8, 7, '#0f1014'); p.r(cx - 3, cy - 4, 6, 9, '#0f1014');
        p.r(cx - 2, cy - 2, 4, 5, '#2c2e36'); p.r(cx - 1, cy - 1, 2, 2, '#4a4d57');
    };
    woofer(7); woofer(w - 8);
    p.r(Math.floor(w / 2) - 2, h - 4, 4, 2, '#e5762f'); // plain orange badge
};

const homeCamera: Painter = (p, w, h) => {
    p.r(3, 0, 5, 2, '#2a2b31');
    p.box(0, 2, w, h - 2, '#2f3138');
    p.r(1, 3, w - 2, 2, '#4a4d57');
    p.box(4, 4, 7, 7, '#16171c');
    p.r(6, 6, 3, 3, '#4fa3e0');
    p.p(6, 6, '#bfe6ff');
    p.r(w - 3, 4, 2, 1, '#d33a3a');
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
    p.r(2, 2, w - 4, topH - 4, '#c75c4a');
    p.r(2, 2, w - 4, 2, '#dc7a66');
    p.r(30, 18, w - 34, 1, '#a94a3a');
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

const homeRug: Painter = (p, w, h) => {
    p.box(0, 0, w, h, '#a8865e');
    p.r(2, 2, w - 4, h - 4, '#c7a77a');
    p.r(4, 4, w - 8, h - 8, '#b8956a');
    for (let x = 8; x < w - 8; x += 8) p.r(x, Math.floor(h / 2), 4, 1, '#d8bf94');
    for (let x = 1; x < w; x += 3) { p.p(x, 0, '#e8dcc0'); p.p(x, h - 1, '#e8dcc0'); }
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
    fxArrow, sparkle, fxZ, fxHeart, fxNote, fxPuff, fxBulb, pencil,
    daniel: danielStrip('all'), danielShirt: danielStrip('shirt'), danielSleep, cat,
    slotGraduation, slotDamn, slotDuck, slotEmpty,
    dormWindow, dormPennant, dormTodo, dormDesk, dormLaptop, dormBinder, dormPhone,
    dormCloset, dormBeanbag, dormFloorLamp, dormBed, dormRug, dormDresser, dormGradcap, dormShirt, dormClothes,
    homeShelf, homeFloorPlant, homeWindow, homeHoodie, homePullup, homeTable, homeSpeaker, homeCamera,
    homeNightstand, homeBed, homeDesk, homePiano, homePie, homeRug, homeLongboard
} satisfies Record<string, Painter>;
