// Content schema shared by the game panels and the /plain page.
// Any string may contain "[TODO: ...]" markers. They render as visible placeholders.

export interface ImageItem {
    /** Path under /media/..., WebP. Filled in automatically from photos/ (npm run photos). */
    src?: string;
    alt: string;
    caption?: string;
    /** Drop folder this photo comes from (scripts/photo-slots.json). Placeholders sharing a slot form one gallery. */
    slot?: string;
    width?: number;
    height?: number;
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

    // Case study fields. Written once here; the game panels and the portfolio view both show them.
    /** One line for a card face: what it is and the result. */
    summary?: string;
    /** Short name for tags and inventory boxes, e.g. "Sharpe Fellows, tech VP". */
    short?: string;
    /** Organization or context, e.g. "Creative Labs, UCLA". */
    org?: string;
    role?: string;
    team?: string;
    timeline?: string;
    problem?: string;
    whatIDid?: string;
    result?: string;
    tags?: string[];
    /** Hobbies: a one line fun fact (shown on the flip side of an inventory box). */
    funFact?: string;
    /** Big numbers that count up, e.g. 500+ members. */
    counters?: Counter[];
}

export interface Counter {
    value: number;
    /** Appended after the number, e.g. "+". */
    suffix?: string;
    label: string;
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
    /** The home phone (a bonus) shows this. */
    instagram: { handle: string; url: string };
    /** What Daniel says in a speech bubble right after waking up. */
    wakeLine: string;
    /** Thought bubbles when the visitor stands still for a while. */
    idleThoughts: string[];
    /** Portfolio view hero: what Daniel does and what he is looking for. */
    focus: string;
    /** Public site URL, for canonical and Open Graph tags. Leave empty until the domain is chosen. */
    siteUrl: string;
}
