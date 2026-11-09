// Single source of truth for sizes. When the final art pack is chosen, its tile size goes here.

export const TILE = 16;

/** Floor size in tiles. Floor is about 2.2 times as wide as it is deep. */
export const FLOOR_COLS = 20;
export const FLOOR_ROWS = 9;

/** Back wall face height in tiles (about 45% of floor depth). */
export const WALL_ROWS = 4;

/** Thin strips around the room, in pixels. */
export const SIDE_W = 8;
export const CAP_H = 8;
export const RIM_H = 8;

export const FLOOR_X = SIDE_W;
export const FLOOR_Y = CAP_H + WALL_ROWS * TILE;
export const FLOOR_W = FLOOR_COLS * TILE;
export const FLOOR_H = FLOOR_ROWS * TILE;

export const ROOM_W = SIDE_W * 2 + FLOOR_W;
export const ROOM_H = FLOOR_Y + FLOOR_H + RIM_H;

/** Dark margin kept around the room when choosing a zoom level (world pixels). */
export const VIEW_MARGIN = 14;

/** Character sprite frame and its foot collider. */
export const CHAR_FRAME = { w: 16, h: 22 };
export const CHAR_BODY = { w: 10, h: 6 };
export const CAT_FRAME = { w: 16, h: 12 };

export const WALK_SPEED = 72;
export const CAT_SPEED = 18;

/** Interaction zone radii (pixels, measured at the feet). Exit > enter gives hysteresis. */
export const ZONE_ENTER = 13;
export const ZONE_EXIT = 18;
export const CAT_ZONE = 20;

/** Path grid cell size for click to walk. */
export const NAV_CELL = 8;

/** Tile coordinates (floor origin, rows can be negative for the back wall) to world pixels. */
export const tx = (col: number) => Math.round(FLOOR_X + col * TILE);
export const ty = (row: number) => Math.round(FLOOR_Y + row * TILE);

export const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const isTouchDevice = () =>
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window);
