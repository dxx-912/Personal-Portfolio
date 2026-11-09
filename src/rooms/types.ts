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
    /** 'wall' draws behind everything on the floor. 'floor' sorts by the bottom of its sprite (or depthRow). */
    layer: 'wall' | 'floor';
    /** Override the row used for y sorting (things sitting on a desk use the desk's bottom). */
    depthRow?: number;
    /** Floor collision box in tiles. Omit for non-solid things. */
    solid?: TRect;
    flipX?: boolean;
}

export type InteractKind =
    | 'panel'      // opens a content panel
    | 'cat'        // moving, panel after a pet
    | 'longboard'  // ride (phase 2), panel
    | 'say';       // decorative easter egg: shows a speech bubble, not counted

export interface InteractableDef {
    /** Content id (src/content/<room>.ts). For 'say', any unique id. */
    id: string;
    kind: InteractKind;
    /** Prop that highlights and receives clicks. */
    target: string;
    /** Standing spot (feet position) in tiles. Ignored for the cat. */
    spot: TPoint;
    facing: Facing;
    /** Text for 'say' interactables. */
    say?: string;
    /** Label for 'say' prompts (others come from content). */
    prompt?: string;
}

export interface DoorDef {
    side: 'left' | 'right';
    /** Opening, in rows. */
    rowTop: number;
    rowBottom: number;
    to: RoomKey;
}

export interface LightDef {
    /** Floor polygon in tiles. */
    poly: TPoint[];
    color: number;
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
    /** Bed pillow spot for the sleeping sprite (dorm only). */
    sleep?: TPoint;
    /** Open floor points the cat walks between (home only). */
    catWaypoints?: TPoint[];
}
