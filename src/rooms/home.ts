import type { RoomDef } from './types';

// North York, Toronto (personal). See reference/home-layout.png.
// Tile units: floor is 20 x 9, rows -4..0 are the back wall face.

// Bottom shelf books: centres in tiles (the shelf sprite starts at x 2.9, y -4).
const book = (px: number, h: number) => ({ x: 2.9 + (px + 6) / 16, y: -4 + (104 - h / 2) / 16 });

export const home: RoomDef = {
    key: 'home',
    background: 'room_home',
    props: [
        // floor decals
        { id: 'rug', texture: 'home_rug', x: 7.0, y: 3.3, layer: 'decal' },
        { id: 'doormat', texture: 'doormat', x: 0.05, y: 1.35, layer: 'decal', flipX: true },

        // back wall, left to right
        { id: 'shelf', texture: 'home_shelf', x: 2.9, y: -4.0, layer: 'floor', solid: { x: 2.9, y: 0, w: 4.75, h: 3.0 } },
        { id: 'plant', texture: 'home_plant', x: 7.9, y: -0.7, layer: 'floor', solid: { x: 8.1, y: 0.55, w: 0.6, h: 0.5 } },
        { id: 'window', texture: 'home_window', x: 9.2, y: -3.8, layer: 'wall' },
        { id: 'hoodie', texture: 'home_hoodie', x: 14.25, y: -3.4, layer: 'wall' },
        { id: 'pullup', texture: 'home_pullup', x: 16.3, y: -2.15, layer: 'floor', solid: { x: 16.3, y: 0.2, w: 3.6, h: 1.5 } },

        // right wall work table, reached from its left side
        { id: 'table', texture: 'home_table', x: 16.45, y: 2.85, layer: 'floor', solid: { x: 16.45, y: 3.0, w: 3.5, h: 5.95 } },
        { id: 'speaker', texture: 'home_speaker', x: 17.2, y: 3.3, layer: 'floor', on: 'table' },
        { id: 'camera', texture: 'home_camera', x: 17.75, y: 5.3, layer: 'floor', on: 'table' },

        // front left corner: nightstand above the pillow end, then the bed
        { id: 'nightstand', texture: 'home_nightstand', x: 0.15, y: 4.25, layer: 'floor', solid: { x: 0.15, y: 4.85, w: 2.25, h: 1.75 } },
        { id: 'bed', texture: 'home_bed', x: 0.1, y: 6.35, layer: 'floor', solid: { x: 0.1, y: 6.65, w: 6.25, h: 2.35 } },

        // front middle: desk with the piano and the pie
        { id: 'desk', texture: 'home_desk', x: 7.4, y: 5.6, layer: 'floor', solid: { x: 7.4, y: 6.0, w: 6.25, h: 2.95 } },
        { id: 'piano', texture: 'home_piano', x: 7.85, y: 5.55, layer: 'floor', on: 'desk' },
        { id: 'pie', texture: 'home_pie', x: 10.8, y: 5.6, layer: 'floor', on: 'desk' },

        // open lane: the longboard (never moves on its own)
        { id: 'longboard', texture: 'home_longboard', x: 11.4, y: 3.75, layer: 'floor', depthRow: 4.5 },

        // the sign by the door back to the dorm
        { id: 'sign', texture: 'sign_left', x: 0.05, y: 0.35, layer: 'floor', depthRow: 1.3 }
    ],
    interactables: [
        { id: 'window', target: 'window', spot: { x: 11.55, y: 0.6 }, facing: 'up', info: 'window' },
        { id: 'shelf', target: 'shelf', spot: { x: 5.3, y: 3.6 }, facing: 'up', info: 'shelf' },
        { id: 'pullup', target: 'pullup', spot: { x: 18.1, y: 2.35 }, facing: 'up', info: 'pullup', action: 'pullup' },
        { id: 'speaker', target: 'speaker', spot: { x: 15.95, y: 4.1 }, facing: 'right', info: 'speaker', action: 'music' },
        { id: 'camera', target: 'camera', spot: { x: 15.95, y: 5.85 }, facing: 'right', info: 'camera', action: 'snap' },
        { id: 'nightstand', target: 'nightstand', spot: { x: 3.2, y: 5.35 }, facing: 'left', info: 'nightstand' },
        { id: 'piano', target: 'piano', spot: { x: 9.1, y: 5.45 }, facing: 'down', info: 'piano', action: 'piano' },
        { id: 'pie', target: 'pie', spot: { x: 11.85, y: 5.45 }, facing: 'down', info: 'pie' },
        { id: 'cat', target: 'cat', spot: { x: 0, y: 0 }, facing: 'down', info: 'cat', action: 'pet' },
        { id: 'longboard', target: 'longboard', spot: { x: 0, y: 0 }, facing: 'up', info: 'longboard', action: 'ride' },
        {
            id: 'bed', target: 'bed', spot: { x: 4.9, y: 6.3 }, facing: 'down', action: 'sit',
            seat: { x: 4.75, y: 7.55, facing: 'down', pose: 'edge' }
        }
    ],
    doors: [{ side: 'left', rowTop: 1.25, rowBottom: 3.25, to: 'dorm' }],
    arrivals: {
        dorm: { x: 1.1, y: 2.6, facing: 'right' }
    },
    lights: [
        { kind: 'cone', poly: [{ x: 9.9, y: 0 }, { x: 13.3, y: 0 }, { x: 14.3, y: 3.6 }, { x: 9.0, y: 3.6 }], color: 0xfff0c0 },
        { kind: 'glow', x: 0.7, y: 4.35, r: 50, color: 0xffc870, strength: 0.95 },
        { kind: 'glow', x: 0.15, y: 2.25, r: 24, color: 0xffc070, strength: 0.9, sx: 0.8, sy: 1.5 }
    ],
    fairy: { y: -3.85, x0: 0.15, x1: 16.2, colors: [0xfff0c0, 0xffd27a, 0xfff6e0] },
    labels: [
        { on: 'shelf', ...book(8, 26), text: 'AOT', size: 4, color: '#f4efe2', angle: -90, bold: true },
        { on: 'shelf', ...book(21, 29), text: 'Lookism', size: 3.2, color: '#f2d36a', angle: -90, bold: true },
        { on: 'shelf', ...book(34, 27), text: 'Sweet Home', size: 3.1, color: '#f4efe2', angle: -90, bold: true },
        { on: 'shelf', ...book(47, 29), text: 'Solo Levelling', size: 2.9, color: '#f4efe2', angle: -90, bold: true },
        { on: 'hoodie', x: 15.125, y: -2.62, text: 'TORONTO', size: 2.6, color: '#f4efe2', bold: true, unlessSlot: 'hoodie-logo.png' },
        { on: 'sign', x: 1.03, y: 0.84, text: 'Back to\nUCLA', size: 3, color: '#3a2a20', bold: true }
    ],
    clock: { x: 8.45, y: -3.15 },
    catWaypoints: [
        { x: 8.4, y: 2.3 }, { x: 10.4, y: 2.6 }, { x: 13.4, y: 2.4 }, { x: 14.6, y: 4.8 },
        { x: 6.8, y: 4.5 }, { x: 10.3, y: 5.1 }, { x: 8.0, y: 4.0 }
    ],
    catNap: { at: { x: 2.9, y: 7.7 }, spot: { x: 3.0, y: 6.3 }, facing: 'down' }
};
