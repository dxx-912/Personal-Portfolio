import type { RoomDef } from './types';

// North York, Toronto (personal). See reference/home-layout.png.
// Tile units: floor is 20 x 9, rows -4..0 are the back wall face.

export const home: RoomDef = {
    key: 'home',
    background: 'room_home',
    props: [
        // floor decals
        { id: 'rug', texture: 'home_rug', x: 6.4, y: 3.3, layer: 'decal' },
        { id: 'doormat', texture: 'doormat', x: 0.05, y: 1.35, layer: 'decal', flipX: true },

        // back wall, left to right
        { id: 'shelf', texture: 'home_shelf', x: 2.9, y: -4.0, layer: 'floor', solid: { x: 2.9, y: 0, w: 4.75, h: 3.0 } },
        { id: 'plant', texture: 'home_plant', x: 7.9, y: -0.7, layer: 'floor', solid: { x: 8.1, y: 0.55, w: 0.6, h: 0.5 } },
        { id: 'window', texture: 'home_window', x: 9.2, y: -3.8, layer: 'wall' },
        // empty poster frames for Daniel's posters (image slots)
        { id: 'posterH1', texture: 'slot_poster_home_1', x: 0.55, y: -3.3, layer: 'wall' },
        { id: 'posterH2', texture: 'slot_poster_home_2', x: 7.95, y: -2.6, layer: 'wall' },
        { id: 'posterH3', texture: 'slot_poster_home_3', x: 17.35, y: -3.65, layer: 'wall' },
        { id: 'hoodie', texture: 'home_hoodie', x: 14.25, y: -3.4, layer: 'wall' },
        { id: 'pullup', texture: 'home_pullup', x: 16.3, y: -2.15, layer: 'floor', solid: { x: 16.3, y: 0.2, w: 3.6, h: 1.5 } },

        // right wall work table, reached from its left side
        { id: 'table', texture: 'home_table', x: 16.45, y: 2.85, layer: 'floor', solid: { x: 16.45, y: 3.0, w: 3.5, h: 5.95 } },
        { id: 'speaker', texture: 'home_speaker', x: 16.95, y: 3.2, layer: 'floor', on: 'table' },
        { id: 'camera', texture: 'home_camera', x: 17.95, y: 5.2, layer: 'floor', on: 'table' },
        // bonus: his phone, Instagram on the screen
        { id: 'phone', texture: 'home_phone', x: 18.0, y: 6.6, layer: 'floor', on: 'table' },
        // table clutter Fluffy can knock about (decor)
        { id: 'lenscap', texture: 'home_lenscap', x: 17.14, y: 5.45, layer: 'floor', on: 'table' },
        { id: 'notebook', texture: 'home_notebook', x: 16.7, y: 6.1, layer: 'floor', on: 'table' },
        { id: 'mug', texture: 'home_mug', x: 18.95, y: 6.75, layer: 'floor', on: 'table' },
        { id: 'tableplant', texture: 'home_tableplant', x: 16.76, y: 7.15, layer: 'floor', on: 'table' },

        // front left corner: nightstand above the pillow end, then the bed
        { id: 'nightstand', texture: 'home_nightstand', x: 0.15, y: 4.25, layer: 'floor', solid: { x: 0.15, y: 4.85, w: 2.25, h: 1.75 } },
        { id: 'glasses', texture: 'home_glasses', x: 1.15, y: 4.94, layer: 'floor', on: 'nightstand' },
        { id: 'bed', texture: 'home_bed', x: 0.1, y: 6.35, layer: 'floor', solid: { x: 0.1, y: 6.65, w: 6.25, h: 2.35 } },

        // front middle: desk with the piano and the pie
        { id: 'desk', texture: 'home_desk', x: 7.4, y: 5.6, layer: 'floor', solid: { x: 7.4, y: 6.0, w: 6.25, h: 2.95 } },
        { id: 'piano', texture: 'home_piano', x: 7.85, y: 5.55, layer: 'floor', on: 'desk' },
        { id: 'pie', texture: 'home_pie', x: 10.8, y: 5.6, layer: 'floor', on: 'desk' },
        { id: 'cactus', texture: 'home_cactus', x: 13.025, y: 5.725, layer: 'floor', on: 'desk' },
        { id: 'deskpencil', texture: 'pencil', x: 8.775, y: 6.54, layer: 'floor', on: 'desk' },

        // open lane: the longboard (never moves on its own)
        { id: 'longboard', texture: 'home_longboard', x: 11.4, y: 3.75, layer: 'floor', depthRow: 4.5 },

        // the sign by the door back to the dorm
        { id: 'sign', texture: 'sign_left', x: 0.05, y: 0.1, layer: 'floor', depthRow: 10 }
    ],
    interactables: [
        { id: 'window', target: 'window', spot: { x: 11.55, y: 0.6 }, facing: 'up', info: 'window' },
        { id: 'shelf', target: 'shelf', spot: { x: 5.3, y: 3.6 }, facing: 'up', info: 'shelf' },
        { id: 'pullup', target: 'pullup', spot: { x: 18.1, y: 2.35 }, facing: 'up', info: 'pullup', action: 'pullup' },
        { id: 'speaker', target: 'speaker', spot: { x: 15.95, y: 4.1 }, facing: 'right', info: 'speaker', action: 'music' },
        { id: 'camera', target: 'camera', spot: { x: 15.95, y: 5.85 }, facing: 'right', info: 'camera', action: 'snap' },
        { id: 'nightstand', target: 'nightstand', spot: { x: 3.2, y: 5.35 }, facing: 'left', info: 'nightstand' },
        { id: 'piano', target: 'piano', spot: { x: 9.1, y: 5.45 }, facing: 'down', info: 'piano', action: 'piano' },
        { id: 'pie', target: 'pie', spot: { x: 11.85, y: 5.45 }, facing: 'down', info: 'pie', action: 'eat' },
        { id: 'cat', target: 'cat', spot: { x: 0, y: 0 }, facing: 'down', info: 'cat', action: 'pet' },
        { id: 'longboard', target: 'longboard', spot: { x: 0, y: 0 }, facing: 'up', info: 'longboard', action: 'ride' },
        // E: sleep (lights down, Zs, the window moves on, Sleep back to 8/8)
        { id: 'bed', target: 'bed', spot: { x: 4.9, y: 6.3 }, facing: 'down', action: 'nap' },
        // bonus: E or F shows his Instagram handle (not one of the 19)
        { id: 'phone', target: 'phone', spot: { x: 15.95, y: 7.55 }, facing: 'right', action: 'phone' }
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
    fairy: { y: -3.85, x0: 0.15, x1: 16.2, colors: [0xffd890, 0xffc070, 0xffe0a8] },
    labels: [
        // book spines (shelf texture pixels): Solo Levelling flat 13..40 x 97..103, Sweet Home flat 15..38 x 91..96,
        // AOT upright 43..50 x 77..103, Lookism leaning left from (57..63, 103) to (51..57, 78)
        { on: 'shelf', x: 2.9 + 27 / 16, y: -4 + 100.5 / 16, text: 'Solo Levelling', size: 3, color: '#f4efe2', bold: true, ink: true },
        { on: 'shelf', x: 2.9 + 27 / 16, y: -4 + 94 / 16, text: 'Sweet Home', size: 3, color: '#f4efe2', bold: true, ink: true },
        { on: 'shelf', x: 2.9 + 47 / 16, y: -4 + 90.5 / 16, text: 'AOT', size: 3.4, color: '#f4efe2', angle: -90, bold: true, ink: true },
        { on: 'shelf', x: 2.9 + 57.375 / 16, y: -4 + 90.5 / 16, text: 'Lookism', size: 2.9, color: '#f2d36a', angle: -104, bold: true, ink: true },
        { on: 'hoodie', x: 15.125, y: -2.62, text: 'TORONTO', size: 2.6, color: '#f4efe2', bold: true, unlessSlot: 'hoodie-logo.png' },
        { on: 'sign', x: 1.05, y: 0.59, text: 'Back to\nUCLA', size: 4, color: '#3a2a20', bold: true }
    ],
    clock: { x: 8.45, y: -3.15 },
    catWaypoints: [
        { x: 8.4, y: 2.3 }, { x: 10.4, y: 2.6 }, { x: 13.4, y: 2.4 }, { x: 14.6, y: 4.8 },
        { x: 6.8, y: 4.5 }, { x: 10.3, y: 5.1 }, { x: 8.0, y: 4.0 }
    ],
    catNap: { at: { x: 2.9, y: 7.7 }, spot: { x: 3.0, y: 6.3 }, facing: 'down' },
    // Fluffy hops up here now and then and knocks the decor about (never the interactive items)
    perches: [
        { on: 'desk', from: { x: 13.3, y: 5.25 }, path: [{ x: 13.15, y: 6.66 }, { x: 8.1, y: 6.66 }] },
        { on: 'table', from: { x: 16.0, y: 2.6 }, path: [{ x: 17.0, y: 4.6 }, { x: 17.0, y: 7.95 }] },
        { on: 'nightstand', from: { x: 1.3, y: 4.05 }, path: [{ x: 0.6, y: 5.15 }, { x: 1.95, y: 5.15 }] }
    ],
    knockables: ['cactus', 'deskpencil', 'lenscap', 'notebook', 'mug', 'tableplant', 'glasses'],
    sleep: { x: 0.225, y: 6.725, home: true }
};
