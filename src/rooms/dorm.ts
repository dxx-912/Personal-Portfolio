import type { RoomDef } from './types';

// UCLA dorm (professional). See reference/dorm-layout.png.
// Tile units: floor is 20 x 9, rows -4..0 are the back wall face.
// Standing spots are feet positions. Keep at least ~1.5 character widths in every walkway.

export const dorm: RoomDef = {
    key: 'dorm',
    background: 'room_dorm',
    props: [
        // back wall, left to right
        { id: 'window', texture: 'dorm_window', x: 0.5, y: -3.5, layer: 'wall' },
        { id: 'pennants', texture: 'dorm_pennants', x: 0.25, y: -3.75, layer: 'wall' },
        { id: 'pinboard', texture: 'dorm_pinboard', x: 4.25, y: -3.5, layer: 'wall' },
        { id: 'desk', texture: 'dorm_desk', x: 8, y: -1, layer: 'floor', solid: { x: 8, y: 0, w: 6, h: 3 } },
        { id: 'laptop', texture: 'dorm_laptop', x: 8.3, y: 0.3, layer: 'floor', depthRow: 3.01 },
        { id: 'trophy', texture: 'dorm_trophy', x: 10.25, y: -0.15, layer: 'floor', depthRow: 3.01 },
        { id: 'camera', texture: 'dorm_camera', x: 12.5, y: 0.6, layer: 'floor', depthRow: 3.01 },
        { id: 'closet', texture: 'dorm_closet', x: 14.5, y: -3.75, layer: 'floor', solid: { x: 14.5, y: 0, w: 5, h: 2.5 } },
        // front left
        { id: 'mirror', texture: 'dorm_mirror', x: 0.25, y: 4.5, layer: 'floor', solid: { x: 0.25, y: 4.5, w: 1.25, h: 4 } },
        { id: 'bed', texture: 'dorm_bed', x: 2, y: 5.5, layer: 'floor', solid: { x: 2, y: 5.75, w: 6, h: 3.25 } },
        // front right, away from the door
        { id: 'drawers', texture: 'dorm_drawers', x: 12, y: 6, layer: 'floor', solid: { x: 12, y: 6.25, w: 6, h: 2.75 } }
    ],
    interactables: [
        { id: 'mirror', kind: 'panel', target: 'mirror', spot: { x: 0.95, y: 4.35 }, facing: 'down' },
        { id: 'pinboard', kind: 'panel', target: 'pinboard', spot: { x: 6.25, y: 0.6 }, facing: 'up' },
        { id: 'laptop', kind: 'panel', target: 'laptop', spot: { x: 9, y: 3.55 }, facing: 'up' },
        { id: 'trophy', kind: 'panel', target: 'trophy', spot: { x: 11, y: 3.55 }, facing: 'up' },
        { id: 'camera', kind: 'panel', target: 'camera', spot: { x: 13, y: 3.55 }, facing: 'up' },
        { id: 'pennants', kind: 'panel', target: 'pennants', spot: { x: 2, y: 0.6 }, facing: 'up' },
        { id: 'drawers', kind: 'panel', target: 'drawers', spot: { x: 15, y: 5.9 }, facing: 'down' },
        { id: 'closet', kind: 'panel', target: 'closet', spot: { x: 17, y: 3.05 }, facing: 'up' }
    ],
    doors: [{ side: 'right', rowTop: 3.5, rowBottom: 5.5, to: 'home' }],
    arrivals: {
        wake: { x: 4.75, y: 5.1, facing: 'down' },
        home: { x: 18.9, y: 4.9, facing: 'left' }
    },
    lights: [
        { poly: [{ x: 0.6, y: 0 }, { x: 3.4, y: 0 }, { x: 4.6, y: 3.6 }, { x: 1.0, y: 3.6 }], color: 0xfff0c0 }
    ],
    sleep: { x: 2.1, y: 6.0 }
};
