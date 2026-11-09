// Content schema shared by the game panels and the /plain page.
// Any string may contain "[TODO: ...]" markers. They render as visible placeholders.

export interface ImageItem {
    /** Path under /media/<item-id>/..., WebP preferred. Omit until the file exists. */
    src?: string;
    alt: string;
    caption?: string;
}

export interface VideoItem {
    kind: 'youtube' | 'spotify' | 'mp4';
    title: string;
    /** YouTube video id, Spotify embed path (e.g. "playlist/abc"), or MP4 path. Omit until known. */
    id?: string;
    /** Public page to link to (for the plain page and as a fallback). */
    url?: string;
}

export interface LinkItem {
    label: string;
    /** Omit until known; renders as a TODO. */
    href?: string;
    download?: boolean;
}

export interface Fact {
    label: string;
    value: string;
}

export interface Section {
    id: string;
    title: string;
    subtitle?: string;
    body?: string[];
    facts?: Fact[];
    list?: { title?: string; items: string[] }[];
    images?: ImageItem[];
    /** How images are laid out. */
    gallery?: 'grid' | 'polaroid' | 'viewer';
    videos?: VideoItem[];
    links?: LinkItem[];
}

/**
 * How an entry's tabs look in the panel.
 * tabs: plain tabs. notes: sticky notes on a TO DO board. shelf: three shelf tiers. phone: a phone feed.
 */
export type TabStyle = 'tabs' | 'notes' | 'shelf' | 'phone';

export interface Entry extends Section {
    /** Short label after "F" in the in-game prompt, e.g. "UCLA" or "About him". */
    prompt: string;
    /** Where this lives on /plain. */
    plainGroup: PlainGroup;
    /** Title on /plain when the in-game title only makes sense in the room. */
    plainTitle?: string;
    tabs?: Section[];
    tabStyle?: TabStyle;
}

export type PlainGroup = 'intro' | 'education' | 'projects' | 'experience' | 'personal';

export interface HudStat {
    label: string;
    value: number;
    max: number;
    /** Bar colour. */
    color: string;
}

export interface Profile {
    name: string;
    tagline: string;
    location: string;
    links: LinkItem[];
    /** Joke stat bars beside the HUD portrait. */
    stats: HudStat[];
    /** What Daniel says in a speech bubble right after waking up. */
    wakeLine: string;
    /** Thought bubbles when the visitor stands still for a while. */
    idleThoughts: string[];
}
