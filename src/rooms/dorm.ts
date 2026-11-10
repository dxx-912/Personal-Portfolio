import type { RoomDef } from './types';

// Rieber Hall, UCLA (professional). See reference/dorm-layout.png.
// Tile units: floor is 20 x 9, rows -4..0 are the back wall face.
// Standing spots are feet positions. Keep at least ~1.5 character widths in every walkway.

export const dorm: RoomDef = {
    key: 'dorm',
    background: 'room_dorm',
    props: [
        // floor decals
        { id: 'rug', texture: 'dorm_rug', x: 4.4, y: 3.6, layer: 'decal' },
        { id: 'doormat', texture: 'doormat', x: 18.7, y: 3.5, layer: 'decal' },

        // back wall, left to right
        { id: 'window', texture: 'dorm_window', x: 0.4, y: -3.55, layer: 'wall' },
        { id: 'pennant', texture: 'dorm_pennant', x: 3.25, y: -3.5, layer: 'wall' },
        { id: 'todo', texture: 'dorm_todo', x: 7.5, y: -3.55, layer: 'wall' },
        // three posters above the desk: Graduation, DAMN, IGOR
        { id: 'poster1', texture: 'slot_poster_graduation', x: 12.3, y: -3.5, layer: 'wall' },
        { id: 'poster2', texture: 'slot_poster_damn', x: 13.65, y: -3.6, layer: 'wall' },
        { id: 'poster4', texture: 'slot_poster_igor', x: 15.0, y: -3.5, layer: 'wall' },

        // working desk against the back wall, three items on it
        { id: 'desk', texture: 'dorm_desk', x: 10.3, y: -1.3, layer: 'floor', solid: { x: 10.3, y: 0, w: 6, h: 2.95 } },
        { id: 'laptop', texture: 'dorm_laptop', x: 10.75, y: 0.1, layer: 'floor', on: 'desk', anim: 'laptop-screen' },
        { id: 'binder', texture: 'dorm_binder', x: 12.5, y: -0.15, layer: 'floor', on: 'desk' },
        { id: 'phone', texture: 'dorm_phone', x: 14.35, y: 0.05, layer: 'floor', on: 'desk' },

        // closet in the back right corner, poster P3 taped to its door
        { id: 'closet', texture: 'dorm_closet', x: 16.45, y: -4.0, layer: 'floor', solid: { x: 16.45, y: 0, w: 3.5, h: 2.5 } },
        // the duck poster taped to the wardrobe's left door (the seam, handles, and sleeve stay visible)
        { id: 'poster3', texture: 'slot_poster_duck', x: 16.52, y: -3.45, layer: 'floor', on: 'closet' },

        // top left: beanbag in the window light
        { id: 'beanbag', texture: 'dorm_beanbag', x: 0.2, y: 0.55, layer: 'floor', solid: { x: 0.35, y: 1.45, w: 2.7, h: 1.3 } },
        // lived in corner: mini fridge, trash bin, laundry basket
        { id: 'fridge', texture: 'dorm_fridge', x: 3.35, y: -0.6, layer: 'floor', solid: { x: 3.4, y: 0.35, w: 0.95, h: 0.6 } },
        { id: 'trash', texture: 'dorm_trash', x: 6.45, y: -0.05, layer: 'floor', solid: { x: 6.5, y: 0.55, w: 0.8, h: 0.5 } },
        { id: 'laundry', texture: 'dorm_laundry', x: 0.12, y: 3.85, layer: 'floor', solid: { x: 0.2, y: 4.35, w: 1.2, h: 0.6 } },
        // backpack on wall hooks, under the clock and above the desk
        { id: 'backpack', texture: 'dorm_backpack', x: 10.8, y: -2.6, layer: 'wall' },

        // front left: floor lamp, then the bed (spawn)
        { id: 'lamp', texture: 'dorm_floorlamp', x: 0.35, y: 5.3, layer: 'floor', solid: { x: 0, y: 5.25, w: 1.55, h: 3.75 } },
        { id: 'bed', texture: 'dorm_bed', x: 1.6, y: 5.6, layer: 'floor', solid: { x: 1.6, y: 6.0, w: 6, h: 3 } },

        // a little mess between the bed and the dresser (off every path)
        { id: 'clothes', texture: 'dorm_clothes', x: 7.9, y: 7.8, layer: 'floor' },
        { id: 'bag', texture: 'dorm_bag', x: 9.85, y: 8.15, layer: 'floor' },
        // sneakers by the door, below its approach
        { id: 'sneakers', texture: 'dorm_sneakers', x: 18.55, y: 5.75, layer: 'floor' },

        // front right: the bigger dresser with the grad cap and the Hope For Hearing shirt
        { id: 'dresser', texture: 'dorm_dresser', x: 10.55, y: 5.1, layer: 'floor', solid: { x: 10.55, y: 5.85, w: 7, h: 3.1 } },
        { id: 'gradcap', texture: 'dorm_gradcap', x: 11.15, y: 5.6, layer: 'floor', on: 'dresser' },
        { id: 'shirt', texture: 'dorm_shirt', x: 12.85, y: 5.7, layer: 'floor', on: 'dresser' },

        // the sign by the door home
        { id: 'sign', texture: 'sign_right', x: 18.35, y: 2.55, layer: 'floor', depthRow: 3.4 }
    ],
    interactables: [
        { id: 'pennant', target: 'pennant', spot: { x: 5.2, y: 0.6 }, facing: 'up', info: 'pennant' },
        { id: 'todo', target: 'todo', spot: { x: 9.1, y: 0.6 }, facing: 'up', info: 'todo' },
        { id: 'laptop', target: 'laptop', spot: { x: 11.45, y: 3.55 }, facing: 'up', info: 'laptop' },
        { id: 'binder', target: 'binder', spot: { x: 13.25, y: 3.55 }, facing: 'up', info: 'binder' },
        { id: 'phone', target: 'phone', spot: { x: 14.7, y: 3.55 }, facing: 'up', info: 'phone' },
        { id: 'closet', target: 'closet', spot: { x: 17.35, y: 3.15 }, facing: 'up', info: 'closet', action: 'outfit' },
        { id: 'gradcap', target: 'gradcap', spot: { x: 11.65, y: 5.5 }, facing: 'down', info: 'gradcap' },
        { id: 'shirt', target: 'shirt', spot: { x: 13.55, y: 5.5 }, facing: 'down', info: 'shirt' },
        {
            id: 'beanbag', target: 'beanbag', spot: { x: 1.7, y: 3.5 }, facing: 'up', action: 'sit',
            seat: { x: 1.7, y: 2.2, facing: 'down', pose: 'sink' }
        },
        {
            id: 'bed', target: 'bed', spot: { x: 5.0, y: 5.55 }, facing: 'down', action: 'sit',
            seat: { x: 5.0, y: 7.0, facing: 'down', pose: 'edge' }
        }
    ],
    doors: [{ side: 'right', rowTop: 3.45, rowBottom: 5.45, to: 'home' }],
    arrivals: {
        wake: { x: 6.6, y: 5.35, facing: 'down' },
        home: { x: 18.9, y: 4.7, facing: 'left' }
    },
    lights: [
        { kind: 'cone', poly: [{ x: 0.6, y: 0 }, { x: 3.3, y: 0 }, { x: 4.6, y: 3.4 }, { x: 1.2, y: 3.4 }], color: 0xffe2b0 },
        { kind: 'glow', x: 0.75, y: 5.55, r: 56, color: 0xffc070, strength: 0.95 },
        { kind: 'glow', x: 15.6, y: -0.6, r: 40, color: 0xffd080, strength: 0.8 },
        { kind: 'glow', x: 13.3, y: 3.0, r: 44, color: 0xa060ff, strength: 0.7, sx: 2.3, sy: 0.45 },
        { kind: 'glow', x: 19.85, y: 4.45, r: 24, color: 0xffc070, strength: 0.9, sx: 0.8, sy: 1.5 }
    ],
    fairy: { y: -3.82, x0: 0.15, x1: 16.3, colors: [0xffc070, 0xff9a5a, 0xffd890, 0xffae78] },
    labels: [
        { on: 'binder', x: 13.25, y: 0.36, text: 'Consulting\nstuff', size: 2.6, color: '#2a2130', bold: true },
        { on: 'shirt', x: 13.6, y: 6.43, text: 'Hope For Hearing', size: 1.9, color: '#2f5aa8', bold: true },
        { on: 'sign', x: 19.0, y: 3.04, text: 'Home,\nToronto', size: 3, color: '#3a2a20', bold: true }
    ],
    clock: { x: 11.35, y: -3.1 },
    sleep: { x: 1.75, y: 6.05 }
};
