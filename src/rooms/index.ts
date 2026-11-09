import type { RoomKey } from '../content';
import { dorm } from './dorm';
import { home } from './home';
import type { RoomDef } from './types';

export const ROOMS: Record<RoomKey, RoomDef> = { dorm, home };
export type * from './types';
