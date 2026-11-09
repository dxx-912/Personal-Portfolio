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

export type TabStyle = 'tabs' | 'pennants' | 'shelf' | 'halves';

export interface Entry extends Section {
    /** Label after "F: " in the in-game prompt, e.g. "Laptop, projects". */
    prompt: string;
    /** Where this lives on /plain. */
    plainGroup: PlainGroup;
    tabs?: Section[];
    tabStyle?: TabStyle;
}

export type PlainGroup = 'intro' | 'projects' | 'experience' | 'education' | 'personal';

export interface Profile {
    name: string;
    tagline: string;
    location: string;
    links: LinkItem[];
}
