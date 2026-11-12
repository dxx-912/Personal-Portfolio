import type { RoomDef } from './types';

// Rieber Hall, UCLA (professional). See reference/dorm-layout.png.
// Tile units: floor is 20 x 9, rows -4..0 are the back wall face.
// Standing spots are feet positions. Keep at least ~1.5 character widths in every walkway.

export const dorm: RoomDef = {
    key: 'dorm',
    background: 'room_dorm',
    props: [
        // floor decals
        { id: 'rug', texture: 'dorm_rug', x: 3.575, y: 2.0, layer: 'decal' },
        { id: 'doormat', texture: 'doormat', x: 18.7, y: 3.5, layer: 'decal' },

        // back wall, left to right
        { id: 'window', texture: 'dorm_window', x: 0.4, y: -3.55, layer: 'wall' },
        { id: 'pennant', texture: 'dorm_pennant', x: 3.25, y: -3.5, layer: 'wall' },
        { id: 'todo', texture: 'dorm_todo', x: 7.5, y: -3.55, layer: 'wall' },
        // Daniel's caricature, framed under the pennant's tip (hidden until the image exists)
        { id: 'caricature', texture: 'slot_poster_caricature', x: 6.0, y: -2.05, layer: 'wall' },
        // three posters above the desk: Graduation, DAMN, IGOR
        { id: 'poster1', texture: 'slot_poster_graduation', x: 12.3, y: -3.5, layer: 'wall' },
        { id: 'poster2', texture: 'slot_poster_damn', x: 13.65, y: -3.6, layer: 'wall' },
        { id: 'poster4', texture: 'slot_poster_igor', x: 15.0, y: -3.5, layer: 'wall' },

        // working desk against the back wall, three items on it
        { id: 'desk', texture: 'dorm_desk', x: 10.3, y: -1.3, layer: 'floor', solid: { x: 10.3, y: 0, w: 6, h: 2.95 } },
        { id: 'laptop', texture: 'dorm_laptop', x: 10.75, y: 0.1, layer: 'floor', on: 'desk', anim: 'laptop-screen' },
        { id: 'binder', texture: 'dorm_binder', x: 12.5, y: -0.15, layer: 'floor', on: 'desk' },
        { id: 'phone', texture: 'dorm_phone', x: 14.29, y: -0.2, layer: 'floor', on: 'desk' },

        // closet in the back right corner, poster P3 taped to its door
        { id: 'closet', texture: 'dorm_closet', x: 16.45, y: -4.0, layer: 'floor', solid: { x: 16.45, y: 0, w: 3.5, h: 2.5 } },
        // the duck poster taped across the top of the wardrobe doors (the handles and the RA lanyard stay visible below)
        { id: 'poster3', texture: 'slot_poster_duck', x: 17.075, y: -3.45, layer: 'floor', on: 'closet' },

        // top left: beanbag in the window light
        // (moved right in iteration 5 so the wall hoop has the left wall to itself)
        { id: 'beanbag', texture: 'dorm_beanbag', x: 0.95, y: 0.55, layer: 'floor', solid: { x: 1.1, y: 1.45, w: 2.7, h: 1.3 } },
        // lived in corner: mini fridge, trash bin, laundry basket
        { id: 'fridge', texture: 'dorm_fridge', x: 3.45, y: -0.975, layer: 'floor', solid: { x: 4.0, y: 0.35, w: 1.2, h: 0.65 } },
        { id: 'trash', texture: 'dorm_trash', x: 6.45, y: -0.05, layer: 'floor', solid: { x: 6.5, y: 0.55, w: 0.8, h: 0.5 } },
        { id: 'laundry', texture: 'dorm_laundry', x: 0.12, y: 3.85, layer: 'floor', solid: { x: 0.2, y: 4.35, w: 1.2, h: 0.6 } },
        // backpack on wall hooks, under the clock and above the desk
        { id: 'backpack', texture: 'dorm_backpack', x: 10.8, y: -2.6, layer: 'wall' },

        // front left: floor lamp, then the bed (spawn)
        { id: 'lamp', texture: 'dorm_floorlamp', x: 0.35, y: 5.3, layer: 'floor', solid: { x: 0, y: 5.25, w: 1.55, h: 3.75 } },
        { id: 'bed', texture: 'dorm_bed', x: 1.6, y: 5.6, layer: 'floor', solid: { x: 1.6, y: 6.0, w: 6, h: 3 } },

        // clothes scattered between the bed and the dresser (off every path)
        { id: 'tee-floor', texture: 'dorm_tee_floor', x: 7.75, y: 6.45, layer: 'decal' },
        { id: 'shirt-ball', texture: 'dorm_shirt_ball', x: 9.55, y: 6.95, layer: 'decal' },
        { id: 'jeans', texture: 'dorm_jeans', x: 8.2, y: 7.95, layer: 'decal' },
        { id: 'sock1', texture: 'dorm_sock', x: 7.8, y: 8.5, layer: 'decal' },
        { id: 'sock2', texture: 'dorm_sock', x: 9.95, y: 7.55, layer: 'decal', flipX: true },
        { id: 'bag', texture: 'dorm_bag', x: 9.65, y: 8.3, layer: 'floor' },
        // sneakers by the door, below its approach
        { id: 'sneakers', texture: 'dorm_sneakers', x: 18.75, y: 5.75, layer: 'floor' },

        // front right: the bigger dresser with the grad cap and the Hope For Hearing shirt
        { id: 'dresser', texture: 'dorm_dresser', x: 10.55, y: 5.1, layer: 'floor', solid: { x: 10.55, y: 5.85, w: 8, h: 3.1 } },
        { id: 'gradcap', texture: 'dorm_gradcap', x: 11.15, y: 5.6, layer: 'floor', on: 'dresser' },
        { id: 'shirt', texture: 'dorm_shirt', x: 12.85, y: 5.7, layer: 'floor', on: 'dresser' },

        // the sign by the door home; drawn above everything on the floor so Daniel never covers it
        { id: 'sign', texture: 'sign_right', x: 17.97, y: 2.3, layer: 'floor', depthRow: 10 }
    ],
    interactables: [
        { id: 'pennant', target: 'pennant', spot: { x: 5.7, y: 0.6 }, facing: 'up', info: 'pennant' },
        { id: 'todo', target: 'todo', spot: { x: 9.1, y: 0.6 }, facing: 'up', info: 'todo' },
        { id: 'laptop', target: 'laptop', spot: { x: 11.45, y: 3.55 }, facing: 'up', info: 'laptop' },
        { id: 'binder', target: 'binder', spot: { x: 13.25, y: 3.55 }, facing: 'up', info: 'binder' },
        { id: 'phone', target: 'phone', spot: { x: 14.7, y: 3.55 }, facing: 'up', info: 'phone' },
        { id: 'closet', target: 'closet', spot: { x: 17.35, y: 3.15 }, facing: 'up', info: 'closet', action: 'outfit' },
        { id: 'gradcap', target: 'gradcap', spot: { x: 11.65, y: 5.5 }, facing: 'down', info: 'gradcap' },
        { id: 'shirt', target: 'shirt', spot: { x: 13.55, y: 5.5 }, facing: 'down', info: 'shirt' },
        { id: 'fridge', target: 'fridge', spot: { x: 4.65, y: 1.75 }, facing: 'up', action: 'drink' },
        {
            id: 'beanbag', target: 'beanbag', spot: { x: 2.45, y: 3.5 }, facing: 'up', action: 'sit',
            seat: { x: 2.45, y: 2.2, facing: 'down', pose: 'sink' }
        },
        // bonus: the mini basketball (moves around; its spot follows it)
        { id: 'ball', target: 'ball', spot: { x: 0, y: 0 }, facing: 'left', action: 'pickup' },
        // E: sleep (lights down, Zs, the window moves on, Sleep back to 8/8)
        { id: 'bed', target: 'bed', spot: { x: 5.0, y: 5.55 }, facing: 'down', action: 'nap' }
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
        { on: 'shirt', x: 13.6, y: 6.25, text: 'Hope For\nHearing', size: 3.3, color: '#2f5aa8', bold: true },
        { on: 'sign', x: 18.97, y: 2.79, text: 'Home,\nToronto', size: 4, color: '#3a2a20', bold: true }
    ],
    clock: { x: 11.35, y: -3.1 },
    // left wall, between the beanbag and the laundry basket
    hoop: { rimRow: 3.45, home: { x: 1.4, y: 3.6 } },
    sleep: { x: 1.75, y: 6.05 }
};
