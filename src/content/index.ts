import { dormContent } from './dorm';
import { homeContent } from './home';
import type { Entry } from './types';

export type RoomKey = 'dorm' | 'home';

export const content: Record<RoomKey, Record<string, Entry>> = {
    dorm: dormContent,
    home: homeContent
};

export const contentKey = (room: RoomKey, id: string) => `${room}.${id}`;

export function getEntry(room: RoomKey, id: string): Entry {
    const e = content[room][id];
    if (!e) throw new Error(`Missing content entry ${room}.${id}`);
    return e;
}

/** Every counted interactable, in display order. */
export const allEntryKeys: string[] = (Object.keys(content) as RoomKey[]).flatMap(
    (room) => Object.keys(content[room]).map((id) => contentKey(room, id))
);

export const TOTAL_ITEMS = allEntryKeys.length; // 18

export { profile } from './profile';
export { ui, completion } from './ui';
export type * from './types';
