import type { AssetKey } from '../assets/manifest';
import type { RoomKey } from '../content';

export type Facing = 'up' | 'down' | 'left' | 'right';

/** Tile units. Floor origin is (0, 0); negative rows are the back wall face. */
export interface TRect { x: number; y: number; w: number; h: number }
export interface TPoint { x: number; y: number }

export interface PropDef {
    id: string;
    texture: AssetKey;
    /** Top-left of the sprite, in tiles. */
    x: number;
    y: number;
    /**
     * wall: hangs on the back wall, behind everything on the floor.
     * decal: lies flat on the floor (rugs, mats), under everything that stands.
     * floor: stands on the floor and sorts by the bottom of its sprite (or depthRow).
     */
    layer: 'wall' | 'decal' | 'floor';
    /** Override the row used for y sorting. */
    depthRow?: number;
    /** Sits on this furniture (desk, dresser, table): always draws just above it. */
    on?: string;
    /** Floor collision box in tiles. Omit for non-solid things. */
    solid?: TRect;
    flipX?: boolean;
    /** Animation key to loop (e.g. a flickering screen). */
    anim?: string;
}

/** What E does. */
export type ActionKind = 'sit' | 'outfit' | 'pullup' | 'music' | 'snap' | 'piano' | 'pet' | 'ride';

export interface InteractableDef {
    /** Unique within the room. */
    id: string;
    /** Prop that highlights and receives clicks ('cat' for the cat). */
    target: string;
    /** Standing spot (feet position) in tiles. Ignored for moving things. */
    spot: TPoint;
    facing: Facing;
    /** F: content id in src/content/<room>.ts. Counts toward "Found X of 19". */
    info?: string;
    /** E: the action. */
    action?: ActionKind;
    /** Sit actions: where the character sits (feet, in tiles) and which way they face. */
    seat?: TPoint & { facing: Facing; pose?: 'edge' | 'sink' };
}

export interface DoorDef {
    side: 'left' | 'right';
    /** Opening, in rows. */
    rowTop: number;
    rowBottom: number;
    to: RoomKey;
}

export type LightDef =
    /** A beam on the floor (window light). Polygon in tiles. */
    | { kind: 'cone'; poly: TPoint[]; color: number; strength?: number }
    /** A round pool of warm light (lamps, LED strips). Centre in tiles, radius in pixels. */
    | { kind: 'glow'; x: number; y: number; r: number; color: number; strength?: number; sx?: number; sy?: number; flicker?: boolean };

export interface FairyLights {
    /** Row of the string (tiles, negative = on the back wall), from x0 to x1. */
    y: number;
    x0: number;
    x1: number;
    colors: number[];
}

/** Text drawn crisp at screen resolution on top of a prop (book spines, signs, labels). */
export interface LabelDef {
    /** Centre, in tiles. */
    x: number;
    y: number;
    text: string;
    /** Font size in world pixels. */
    size: number;
    color: string;
    /** Degrees, e.g. -90 for a book spine read bottom to top. */
    angle?: number;
    /** Sorts with this prop (draws just above it). */
    on: string;
    bold?: boolean;
    /** Hide this label once Daniel provides this decor slot file (the image replaces it). */
    unlessSlot?: string;
}

export interface RoomDef {
    key: RoomKey;
    background: AssetKey;
    props: PropDef[];
    interactables: InteractableDef[];
    doors: DoorDef[];
    /** Where the player lands when entering from another room, and when waking up. */
    arrivals: Partial<Record<RoomKey | 'wake', { x: number; y: number; facing: Facing }>>;
    lights: LightDef[];
    fairy?: FairyLights;
    labels?: LabelDef[];
    /** Wall clock centre in tiles (shows the visitor's local time). */
    clock?: TPoint;
    /** Bed pillow spot for the sleeping sprite (dorm only). */
    sleep?: TPoint;
    /** Open floor points the cat walks between (home only). */
    catWaypoints?: TPoint[];
    /** Where the cat naps (on the bed) and where you stand to pet him there. */
    catNap?: { at: TPoint; spot: TPoint; facing: Facing };
}
