// Every texture the game uses, by stable key.
// To swap in final art: drop the file in public/assets/<pack>/ and set `url` on its entry.
// Keep w, h, and frames matching the file. No scene code needs to change.
//
// Image slots: entries with `slot` render a file Daniel provides in public/assets/decor/ (album
// covers, posters, logos, photos). We never draw that artwork ourselves. Until the file exists,
// the painter draws an original abstract placeholder.

import { CAT_FRAME, CHAR_FRAME, ROOM_H, ROOM_W } from '../config';
import { CAT_FRAME_COUNT, DANIEL_FRAME_COUNT, painters, type Painter } from './placeholders';

export interface SlotDef {
    /** File name inside public/assets/decor/. */
    file: string;
    /** Where the image goes inside the frame (pixels). Defaults to the frame minus a 1px border. */
    rect?: { x: number; y: number; w: number; h: number };
    /** Draw nothing at all until the file exists (optional extras). */
    hideIfMissing?: boolean;
    /**
     * Render the image this many times sharper than the room's pixels, as an overlay on top of the
     * sprite. For slots whose words must stay legible (the duck poster, the hoodie logo).
     */
    sharp?: number;
    /** 'cover' (default) fills the rect and crops; 'contain' trims the background and fits the whole image. */
    fit?: 'cover' | 'contain';
    /** Treat the image's dark background as see-through (a white logo on black prints straight onto fabric). */
    knockout?: boolean;
}

export interface AssetDef {
    /** Frame size in pixels. Sheets are a single horizontal strip of `frames` frames. */
    w: number;
    h: number;
    frames?: number;
    /** Final art file under public/, e.g. 'assets/pack/desk.png'. Omit to use the placeholder painter. */
    url?: string;
    paint: Painter;
    /** Add a 1px dark outline to the placeholder (sprites yes, room backgrounds no). */
    outline?: boolean;
    /** Generate a focus highlight ring texture (`<key>#hl`) for interactables. */
    highlight?: boolean;
    slot?: SlotDef;
}

const CHAR = { w: CHAR_FRAME.w, h: CHAR_FRAME.h, frames: DANIEL_FRAME_COUNT };

export const ASSETS = {
    // rooms and shared bits
    room_dorm: { w: ROOM_W, h: ROOM_H, paint: painters.dormRoom, outline: false },
    room_home: { w: ROOM_W, h: ROOM_H, paint: painters.homeRoom, outline: false },
    door_side: { w: 10, h: 40, paint: painters.doorSide, outline: false, highlight: true },
    doormat: { w: 20, h: 30, paint: painters.doormat, outline: false },
    sign_right: { w: 32, h: 20, paint: painters.signRight, outline: true },
    sign_left: { w: 32, h: 20, paint: painters.signLeft, outline: true },
    wall_clock: { w: 12, h: 12, paint: painters.wallClock, outline: false },
    pencil: { w: 8, h: 3, paint: painters.pencil, outline: false },

    // characters (the shirt is its own layer so outfits can be recoloured)
    daniel: { ...CHAR, paint: painters.daniel, outline: true },
    daniel_shirt: { ...CHAR, paint: painters.danielShirt, outline: false },
    // closet outfits with their own shapes (drawn over the base sprite like the shirt layer)
    daniel_tank: { ...CHAR, paint: painters.danielTank, outline: false },
    daniel_suit: { ...CHAR, paint: painters.danielSuit, outline: false },
    // shirt logos (image slots, white logos on a dark ground print through knockout); shown on the chest
    // the Stussy print goes on the back of the shirt, so it gets the wider back area
    shirt_logo_stussy: { w: 7, h: 4, paint: painters.empty, outline: false, slot: { file: 'shirt-logo-stussy.png', rect: { x: 0, y: 0, w: 7, h: 4 }, sharp: 6, fit: 'contain', knockout: true } },
    shirt_logo_ucla: { w: 5, h: 3, paint: painters.empty, outline: false, slot: { file: 'shirt-logo-ucla.png', rect: { x: 0, y: 0, w: 5, h: 3 }, sharp: 6, fit: 'contain', knockout: true } },
    daniel_sleep: { w: 30, h: 14, frames: 2, paint: painters.danielSleep, outline: true },
    daniel_sleep_home: { w: 30, h: 14, frames: 2, paint: painters.danielSleepHome, outline: true },
    cat: { w: CAT_FRAME.w, h: CAT_FRAME.h, frames: CAT_FRAME_COUNT, paint: painters.cat, outline: true, highlight: true },

    // fx
    fx_arrow: { w: 9, h: 6, paint: painters.fxArrow, outline: true },
    fx_arrow_s: { w: 5, h: 3, paint: painters.fxArrowSmall, outline: true },
    sparkle: { w: 7, h: 7, frames: 2, paint: painters.sparkle, outline: false },
    fx_z: { w: 5, h: 5, frames: 2, paint: painters.fxZ, outline: false },
    fx_heart: { w: 5, h: 5, paint: painters.fxHeart, outline: false },
    fx_note: { w: 6, h: 6, paint: painters.fxNote, outline: true },
    fx_puff: { w: 14, h: 10, frames: 2, paint: painters.fxPuff, outline: false },
    fx_bulb: { w: 3, h: 3, paint: painters.fxBulb, outline: false },

    // image slots (see the note at the top)
    slot_poster_graduation: { w: 18, h: 24, paint: painters.slotGraduation, outline: true, slot: { file: 'poster-graduation.png' } },
    slot_poster_damn: { w: 18, h: 24, paint: painters.slotDamn, outline: true, slot: { file: 'poster-damn.png' } },
    slot_poster_duck: { w: 36, h: 48, paint: painters.slotDuck, outline: true, slot: { file: 'poster-duck.png', sharp: 4 } },
    slot_poster_igor: { w: 18, h: 24, paint: painters.slotIgor, outline: true, slot: { file: 'poster-igor.png' } },
    slot_poster_home_1: { w: 32, h: 18, paint: painters.slotHome1, outline: true, slot: { file: 'poster-home-1.png', sharp: 4 } },
    slot_poster_home_2: { w: 18, h: 18, paint: painters.slotHome2, outline: true, slot: { file: 'poster-home-2.png', sharp: 4 } },
    slot_poster_home_3: { w: 26, h: 18, paint: painters.slotHome3, outline: true, slot: { file: 'poster-home-3.png', sharp: 4 } },
    slot_poster_caricature: { w: 16, h: 20, paint: painters.slotEmpty, outline: true, slot: { file: 'poster-caricature.png', hideIfMissing: true } },

    // dorm
    dorm_window: { w: 48, h: 42, frames: 3, paint: painters.dormWindow, outline: true },
    dorm_pennant: { w: 64, h: 34, paint: painters.dormPennant, outline: true, highlight: true },
    dorm_todo: { w: 52, h: 38, paint: painters.dormTodo, outline: true, highlight: true },
    dorm_desk: { w: 96, h: 68, paint: painters.dormDesk, outline: true },
    dorm_laptop: { w: 22, h: 14, frames: 2, paint: painters.dormLaptop, outline: true, highlight: true },
    dorm_binder: { w: 24, h: 18, paint: painters.dormBinder, outline: true, highlight: true },
    // phone screens show the instagram-logo slot (iteration 5); sharp so the logo stays crisp at a tiny size
    dorm_phone: {
        w: 12, h: 18, paint: painters.dormPhone, outline: true, highlight: true,
        slot: { file: 'instagram-logo.png', rect: { x: 2, y: 4, w: 8, h: 8 }, sharp: 4, fit: 'contain' }
    },
    dorm_closet: { w: 56, h: 104, paint: painters.dormCloset, outline: true, highlight: true },
    dorm_beanbag: { w: 48, h: 38, paint: painters.dormBeanbag, outline: true, highlight: true },
    dorm_floorlamp: { w: 12, h: 56, paint: painters.dormFloorLamp, outline: true },
    dorm_bed: { w: 96, h: 54, paint: painters.dormBed, outline: true, highlight: true },
    dorm_rug: { w: 96, h: 46, paint: painters.dormRug, outline: false },
    dorm_dresser: { w: 128, h: 62, paint: painters.dormDresser, outline: true },
    dorm_gradcap: { w: 16, h: 13, paint: painters.dormGradcap, outline: true, highlight: true },
    dorm_shirt: { w: 24, h: 15, paint: painters.dormShirt, outline: true, highlight: true },
    dorm_jeans: { w: 21, h: 9, paint: painters.dormJeans, outline: true },
    dorm_tee_floor: { w: 16, h: 8, paint: painters.dormTeeFloor, outline: true },
    dorm_shirt_ball: { w: 10, h: 5, paint: painters.dormShirtBall, outline: true },
    dorm_sock: { w: 6, h: 6, paint: painters.dormSock, outline: true },
    dorm_fridge: { w: 30, h: 32, frames: 2, paint: painters.dormFridge, outline: true, highlight: true },
    bb_ball: { w: 7, h: 7, paint: painters.bbBall, outline: true, highlight: true },
    redbull_can: {
        w: 8, h: 14, paint: painters.redbullCan, outline: true,
        slot: { file: 'can-logo.png', rect: { x: 1, y: 3, w: 6, h: 8 }, sharp: 4, fit: 'contain' }
    },
    dorm_hoop: { w: 18, h: 35, frames: 2, paint: painters.dormHoop, outline: true },
    dorm_trash: { w: 18, h: 18, paint: painters.dormTrash, outline: true },
    dorm_laundry: { w: 22, h: 18, paint: painters.dormLaundry, outline: true },
    dorm_sneakers: { w: 15, h: 6, paint: painters.dormSneakers, outline: true },
    dorm_bag: { w: 14, h: 10, paint: painters.dormBag, outline: true },
    dorm_backpack: { w: 18, h: 24, paint: painters.dormBackpack, outline: true },

    // home
    home_shelf: {
        w: 76, h: 112, paint: painters.homeShelf, outline: true, highlight: true,
        slot: { file: 'volleyball-logo.png', rect: { x: 61, y: 27, w: 7, h: 5 }, sharp: 4, fit: 'contain', knockout: true }
    },
    home_plant: { w: 16, h: 28, paint: painters.homeFloorPlant, outline: true },
    home_window: { w: 76, h: 46, frames: 3, paint: painters.homeWindow, outline: true, highlight: true },
    home_hoodie: {
        w: 28, h: 30, paint: painters.homeHoodie, outline: true,
        slot: { file: 'hoodie-logo.png', rect: { x: 6, y: 8, w: 16, h: 18 }, sharp: 4, fit: 'contain', knockout: true }
    },
    home_pullup: { w: 58, h: 62, paint: painters.homePullup, outline: true, highlight: true },
    home_table: { w: 56, h: 98, paint: painters.homeTable, outline: true },
    home_speaker: {
        w: 25, h: 18, paint: painters.homeSpeaker, outline: true, highlight: true,
        slot: { file: 'speaker-logo.png', rect: { x: 8, y: 13, w: 5, h: 2 } }
    },
    home_phone: {
        w: 12, h: 18, paint: painters.homePhone, outline: true, highlight: true,
        slot: { file: 'instagram-logo.png', rect: { x: 2, y: 4, w: 8, h: 8 }, sharp: 4, fit: 'contain' }
    },
    home_notebook: { w: 18, h: 14, paint: painters.homeNotebook, outline: true },
    home_mug: { w: 9, h: 13, paint: painters.homeMug, outline: true },
    home_tableplant: { w: 9, h: 12, paint: painters.homeTablePlant, outline: true },
    home_lenscap: { w: 5, h: 5, paint: painters.homeLensCap, outline: true },
    home_cactus: { w: 6, h: 11, paint: painters.homeCactus, outline: true },
    home_glasses: { w: 7, h: 3, paint: painters.homeGlasses, outline: false },
    home_camera: { w: 18, h: 14, paint: painters.homeCamera, outline: true, highlight: true },
    home_nightstand: {
        w: 36, h: 38, paint: painters.homeNightstand, outline: true, highlight: true,
        slot: { file: 'family-photo.png', rect: { x: 19, y: 1, w: 13, h: 9 } }
    },
    home_bed: { w: 100, h: 42, paint: painters.homeBed, outline: true, highlight: true },
    home_desk: { w: 100, h: 54, paint: painters.homeDesk, outline: true },
    home_piano: { w: 40, h: 14, paint: painters.homePiano, outline: true, highlight: true },
    home_pie: { w: 34, h: 17, frames: 4, paint: painters.homePie, outline: true, highlight: true },
    home_rug: { w: 152, h: 24, paint: painters.homeRug, outline: false },
    home_longboard: { w: 48, h: 12, paint: painters.homeLongboard, outline: true, highlight: true }
} satisfies Record<string, AssetDef>;

export type AssetKey = keyof typeof ASSETS;

export const hlKey = (key: string) => `${key}#hl`;
export const slotKey = (file: string) => `slot:${file}`;
