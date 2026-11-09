import type { RoomDef } from './types';

// Childhood bedroom in North York (personal). See reference/home-layout.png.
// Tile units: floor is 20 x 9, rows -4..0 are the back wall face.

export const home: RoomDef = {
    key: 'home',
    background: 'room_home',
    props: [
        // back wall, left to right
        { id: 'shelf', texture: 'home_shelf', x: 3, y: -3.75, layer: 'floor', solid: { x: 3, y: 0, w: 4.5, h: 2.5 } },
        { id: 'window', texture: 'home_window', x: 9, y: -3.75, layer: 'wall' },
        { id: 'pullup', texture: 'home_pullup', x: 15.75, y: -3.5, layer: 'floor', solid: { x: 15.75, y: 0, w: 4, h: 1.75 } },
        // right wall work table (reached from its left side)
        { id: 'table', texture: 'home_table', x: 16.5, y: 2.75, layer: 'floor', solid: { x: 16.5, y: 3, w: 3.5, h: 6 } },
        { id: 'laptop', texture: 'home_laptop', x: 17.0, y: 3.2, layer: 'floor', depthRow: 9.01 },
        { id: 'headphones', texture: 'home_headphones', x: 17.6, y: 5.2, layer: 'floor', depthRow: 9.01 },
        // front left corner
        { id: 'nightstand', texture: 'home_nightstand', x: 0, y: 4.0, layer: 'floor', solid: { x: 0, y: 4.25, w: 2.25, h: 2.25 } },
        { id: 'bed', texture: 'home_bed', x: 0, y: 6.5, layer: 'floor', solid: { x: 0, y: 6.6, w: 6.25, h: 2.4 } },
        // front, between the bed and the work table
        { id: 'desk', texture: 'home_desk', x: 7.5, y: 6, layer: 'floor', solid: { x: 7.5, y: 6.25, w: 6, h: 2.75 } },
        { id: 'piano', texture: 'home_piano', x: 7.9, y: 6.05, layer: 'floor', depthRow: 9.01 },
        { id: 'tray', texture: 'home_tray', x: 11.4, y: 6.15, layer: 'floor', depthRow: 9.01 },
        // open floor
        { id: 'longboard', texture: 'home_longboard', x: 11.5, y: 4.0, layer: 'floor', depthRow: 4.6 }
    ],
    interactables: [
        { id: 'window', kind: 'panel', target: 'window', spot: { x: 11.4, y: 0.6 }, facing: 'up' },
        { id: 'shelf', kind: 'panel', target: 'shelf', spot: { x: 5.25, y: 3.05 }, facing: 'up' },
        { id: 'pullup', kind: 'panel', target: 'pullup', spot: { x: 17.75, y: 2.6 }, facing: 'up' },
        { id: 'laptop', kind: 'panel', target: 'laptop', spot: { x: 15.55, y: 4.0 }, facing: 'right' },
        { id: 'headphones', kind: 'panel', target: 'headphones', spot: { x: 15.55, y: 5.95 }, facing: 'right' },
        { id: 'nightstand', kind: 'panel', target: 'nightstand', spot: { x: 3.0, y: 5.45 }, facing: 'left' },
        { id: 'piano', kind: 'panel', target: 'piano', spot: { x: 9.15, y: 5.9 }, facing: 'down' },
        { id: 'baking', kind: 'panel', target: 'tray', spot: { x: 12.2, y: 5.9 }, facing: 'down' },
        { id: 'cat', kind: 'cat', target: 'cat', spot: { x: 0, y: 0 }, facing: 'down' },
        { id: 'longboard', kind: 'longboard', target: 'longboard', spot: { x: 13, y: 3.55 }, facing: 'down' },
        { id: 'bed', kind: 'say', target: 'bed', spot: { x: 4.6, y: 6.35 }, facing: 'down', prompt: 'Bed', say: 'homeBed' }
    ],
    doors: [{ side: 'left', rowTop: 1, rowBottom: 3, to: 'dorm' }],
    arrivals: {
        dorm: { x: 1.1, y: 2.4, facing: 'right' }
    },
    lights: [
        { poly: [{ x: 9.7, y: 0 }, { x: 13.0, y: 0 }, { x: 14.0, y: 3.9 }, { x: 8.9, y: 3.9 }], color: 0xfff0c0 }
    ],
    catWaypoints: [
        { x: 7.9, y: 3.5 }, { x: 9.7, y: 2.3 }, { x: 10.6, y: 4.6 }, { x: 13.9, y: 2.1 },
        { x: 7.3, y: 4.9 }, { x: 14.3, y: 5.2 }, { x: 8.6, y: 1.4 }
    ]
};
