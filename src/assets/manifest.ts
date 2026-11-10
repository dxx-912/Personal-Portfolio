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
    sign_right: { w: 26, h: 16, paint: painters.signRight, outline: true },
    sign_left: { w: 26, h: 16, paint: painters.signLeft, outline: true },
    wall_clock: { w: 12, h: 12, paint: painters.wallClock, outline: false },
    pencil: { w: 8, h: 3, paint: painters.pencil, outline: false },

    // characters (the shirt is its own layer so outfits can be recoloured)
    daniel: { ...CHAR, paint: painters.daniel, outline: true },
    daniel_shirt: { ...CHAR, paint: painters.danielShirt, outline: false },
    daniel_sleep: { w: 30, h: 14, frames: 2, paint: painters.danielSleep, outline: true },
    cat: { w: CAT_FRAME.w, h: CAT_FRAME.h, frames: CAT_FRAME_COUNT, paint: painters.cat, outline: true, highlight: true },

    // fx
    fx_arrow: { w: 9, h: 6, paint: painters.fxArrow, outline: true },
    sparkle: { w: 7, h: 7, frames: 2, paint: painters.sparkle, outline: false },
    fx_z: { w: 5, h: 5, frames: 2, paint: painters.fxZ, outline: false },
    fx_heart: { w: 5, h: 5, paint: painters.fxHeart, outline: false },
    fx_note: { w: 6, h: 6, paint: painters.fxNote, outline: true },
    fx_puff: { w: 14, h: 10, frames: 2, paint: painters.fxPuff, outline: false },
    fx_bulb: { w: 3, h: 3, paint: painters.fxBulb, outline: false },

    // image slots (see the note at the top)
    slot_poster_graduation: { w: 18, h: 24, paint: painters.slotGraduation, outline: true, slot: { file: 'poster-graduation.png' } },
    slot_poster_damn: { w: 18, h: 24, paint: painters.slotDamn, outline: true, slot: { file: 'poster-damn.png' } },
    slot_poster_duck: { w: 16, h: 20, paint: painters.slotDuck, outline: true, slot: { file: 'poster-duck.png' } },
    slot_poster_caricature: { w: 16, h: 20, paint: painters.slotEmpty, outline: true, slot: { file: 'poster-caricature.png', hideIfMissing: true } },

    // dorm
    dorm_window: { w: 48, h: 42, frames: 3, paint: painters.dormWindow, outline: true },
    dorm_pennant: { w: 64, h: 34, paint: painters.dormPennant, outline: true, highlight: true },
    dorm_todo: { w: 52, h: 38, paint: painters.dormTodo, outline: true, highlight: true },
    dorm_desk: { w: 96, h: 68, paint: painters.dormDesk, outline: true },
    dorm_laptop: { w: 22, h: 14, frames: 2, paint: painters.dormLaptop, outline: true, highlight: true },
    dorm_binder: { w: 24, h: 18, paint: painters.dormBinder, outline: true, highlight: true },
    dorm_phone: {
        w: 10, h: 14, paint: painters.dormPhone, outline: true, highlight: true,
        slot: { file: 'phone-screen.png', rect: { x: 2, y: 2, w: 6, h: 9 } }
    },
    dorm_closet: { w: 56, h: 104, paint: painters.dormCloset, outline: true, highlight: true },
    dorm_beanbag: { w: 48, h: 38, paint: painters.dormBeanbag, outline: true, highlight: true },
    dorm_floorlamp: { w: 12, h: 56, paint: painters.dormFloorLamp, outline: true },
    dorm_bed: { w: 96, h: 54, paint: painters.dormBed, outline: true, highlight: true },
    dorm_rug: { w: 92, h: 40, paint: painters.dormRug, outline: false },
    dorm_dresser: { w: 112, h: 62, paint: painters.dormDresser, outline: true },
    dorm_gradcap: { w: 16, h: 13, paint: painters.dormGradcap, outline: true, highlight: true },
    dorm_shirt: { w: 24, h: 15, paint: painters.dormShirt, outline: true, highlight: true },
    dorm_clothes: { w: 31, h: 12, paint: painters.dormClothes, outline: true },
    dorm_fridge: { w: 16, h: 26, paint: painters.dormFridge, outline: true },
    dorm_trash: { w: 12, h: 14, paint: painters.dormTrash, outline: true },
    dorm_laundry: { w: 22, h: 18, paint: painters.dormLaundry, outline: true },
    dorm_sneakers: { w: 15, h: 6, paint: painters.dormSneakers, outline: true },
    dorm_bag: { w: 14, h: 10, paint: painters.dormBag, outline: true },
    dorm_backpack: { w: 18, h: 24, paint: painters.dormBackpack, outline: true },

    // home
    home_shelf: { w: 76, h: 112, paint: painters.homeShelf, outline: true, highlight: true },
    home_plant: { w: 16, h: 28, paint: painters.homeFloorPlant, outline: true },
    home_window: { w: 76, h: 46, frames: 3, paint: painters.homeWindow, outline: true, highlight: true },
    home_hoodie: {
        w: 28, h: 30, paint: painters.homeHoodie, outline: true,
        slot: { file: 'hoodie-logo.png', rect: { x: 7, y: 9, w: 14, h: 8 } }
    },
    home_pullup: { w: 58, h: 62, paint: painters.homePullup, outline: true, highlight: true },
    home_table: { w: 56, h: 98, paint: painters.homeTable, outline: true },
    home_speaker: {
        w: 30, h: 20, paint: painters.homeSpeaker, outline: true, highlight: true,
        slot: { file: 'speaker-logo.png', rect: { x: 12, y: 15, w: 6, h: 3 } }
    },
    home_camera: { w: 14, h: 11, paint: painters.homeCamera, outline: true, highlight: true },
    home_nightstand: {
        w: 36, h: 38, paint: painters.homeNightstand, outline: true, highlight: true,
        slot: { file: 'family-photo.png', rect: { x: 19, y: 1, w: 13, h: 9 } }
    },
    home_bed: { w: 100, h: 42, paint: painters.homeBed, outline: true, highlight: true },
    home_desk: { w: 100, h: 54, paint: painters.homeDesk, outline: true },
    home_piano: { w: 40, h: 14, paint: painters.homePiano, outline: true, highlight: true },
    home_pie: { w: 34, h: 17, frames: 4, paint: painters.homePie, outline: true, highlight: true },
    home_rug: { w: 132, h: 24, paint: painters.homeRug, outline: false },
    home_longboard: { w: 48, h: 12, paint: painters.homeLongboard, outline: true, highlight: true }
} satisfies Record<string, AssetDef>;

export type AssetKey = keyof typeof ASSETS;

export const hlKey = (key: string) => `${key}#hl`;
export const slotKey = (file: string) => `slot:${file}`;
