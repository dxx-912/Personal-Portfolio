// Every texture the game uses, by stable key.
// To swap in final art: drop the file in public/assets/<pack>/ and set `url` on its entry.
// Keep w, h, and frames matching the file. No scene code needs to change.

import { CAT_FRAME, CHAR_FRAME, ROOM_H, ROOM_W } from '../config';
import { painters, type Painter } from './placeholders';

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
}

export const ASSETS = {
    // rooms
    room_dorm: { w: ROOM_W, h: ROOM_H, paint: painters.dormRoom, outline: false },
    room_home: { w: ROOM_W, h: ROOM_H, paint: painters.homeRoom, outline: false },
    door_side: { w: 10, h: 40, paint: painters.doorSide, outline: false, highlight: true },

    // characters
    daniel: { w: CHAR_FRAME.w, h: CHAR_FRAME.h, frames: 18, paint: painters.daniel, outline: true },
    daniel_sleep: { w: 30, h: 14, frames: 2, paint: painters.danielSleep, outline: true },
    cat: { w: CAT_FRAME.w, h: CAT_FRAME.h, frames: 4, paint: painters.cat, outline: true, highlight: true },

    // fx
    sparkle: { w: 7, h: 7, frames: 2, paint: painters.sparkle, outline: false },
    fx_z: { w: 5, h: 5, frames: 2, paint: painters.fxZ, outline: false },
    fx_heart: { w: 5, h: 5, paint: painters.fxHeart, outline: false },

    // dorm
    dorm_window: { w: 48, h: 36, paint: painters.dormWindow, outline: true },
    dorm_pennants: { w: 56, h: 14, paint: painters.dormPennants, outline: true, highlight: true },
    dorm_pinboard: { w: 64, h: 36, paint: painters.dormPinboard, outline: true, highlight: true },
    dorm_desk: { w: 96, h: 64, paint: painters.dormDesk, outline: true },
    dorm_laptop: { w: 22, h: 14, paint: painters.dormLaptop, outline: true, highlight: true },
    dorm_trophy: { w: 24, h: 20, paint: painters.dormTrophy, outline: true, highlight: true },
    dorm_camera: { w: 16, h: 12, paint: painters.dormCamera, outline: true, highlight: true },
    dorm_closet: { w: 80, h: 100, paint: painters.dormCloset, outline: true, highlight: true },
    dorm_drawers: { w: 96, h: 48, paint: painters.dormDrawers, outline: true, highlight: true },
    dorm_mirror: { w: 20, h: 64, paint: painters.dormMirror, outline: true, highlight: true },
    dorm_bed: { w: 96, h: 56, paint: painters.dormBed, outline: true },
    dorm_lamp: { w: 10, h: 24, paint: painters.dormLamp, outline: true },

    // home
    home_shelf: { w: 72, h: 100, paint: painters.homeShelf, outline: true, highlight: true },
    home_window: { w: 76, h: 40, paint: painters.homeWindow, outline: true, highlight: true },
    home_pullup: { w: 64, h: 84, paint: painters.homePullup, outline: true, highlight: true },
    home_table: { w: 56, h: 100, paint: painters.homeTable, outline: true },
    home_laptop: { w: 28, h: 16, paint: painters.homeLaptop, outline: true, highlight: true },
    home_headphones: { w: 18, h: 14, paint: painters.homeHeadphones, outline: true, highlight: true },
    home_nightstand: { w: 36, h: 40, paint: painters.homeNightstand, outline: true, highlight: true },
    home_bed: { w: 100, h: 40, paint: painters.homeBed, outline: true, highlight: true },
    home_desk: { w: 96, h: 48, paint: painters.homeDesk, outline: true },
    home_piano: { w: 40, h: 14, paint: painters.homePiano, outline: true, highlight: true },
    home_tray: { w: 26, h: 12, paint: painters.homeTray, outline: true, highlight: true },
    home_longboard: { w: 48, h: 12, paint: painters.homeLongboard, outline: true, highlight: true }
} satisfies Record<string, AssetDef>;

export type AssetKey = keyof typeof ASSETS;

export const hlKey = (key: string) => `${key}#hl`;
