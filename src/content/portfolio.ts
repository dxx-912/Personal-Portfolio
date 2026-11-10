// The "no time to play" portfolio view (/portfolio). See PORTFOLIO_VIEW.md.
// Stories are not written here: each item points at the same section the game panel uses.
// This file only decides order, labels, icons, and the page's own copy.

import { dormContent } from './dorm';
import { homeContent } from './home';
import type { Entry, Section } from './types';

export type PortfolioSection = 'work' | 'leadership' | 'education' | 'inventory';

export type PixelIconName =
    | 'sun' | 'briefcase' | 'sunset' | 'moon' | 'trophy' | 'piano' | 'board' | 'cat' | 'camera' | 'pie'
    | 'headphones' | 'barbell' | 'house' | 'heart' | 'mail' | 'linkedin' | 'file' | 'gamepad' | 'github'
    | 'arrowLeft' | 'arrowRight' | 'close' | 'expand';

export interface PortfolioItem {
    /** URL hash: /portfolio#<id>. */
    id: string;
    portfolioSection: PortfolioSection;
    /** Order within its section. [TODO: Daniel to confirm the work card order] */
    cardOrder: number;
    /** Small pixel label on the card, e.g. "SOFTWARE". */
    label?: string;
    /** Card title when it differs from the story's title. */
    title?: string;
    icon?: PixelIconName;
    /** The shared story (the same object the game panel renders). */
    section: Section & { tabs?: Section[] };
}

const tab = (entry: Entry, id: string): Section => {
    const t = entry.tabs?.find((x) => x.id === id);
    if (!t) throw new Error(`Missing tab ${entry.id}.${id}`);
    return t;
};

export const portfolioItems: PortfolioItem[] = [
    // Work: lead with product work for product management recruiting (draft order)
    { id: 'cold-email', portfolioSection: 'work', cardOrder: 1, label: 'SOFTWARE', section: tab(dormContent.laptop, 'cold-email') },
    { id: 'saved-posts', portfolioSection: 'work', cardOrder: 2, label: 'SOFTWARE', section: tab(dormContent.laptop, 'saved-posts') },
    { id: 'ateball', portfolioSection: 'work', cardOrder: 3, label: 'PRODUCT', title: 'Ateball, Creative Labs', section: tab(dormContent.laptop, 'ateball') },
    { id: 'genesis', portfolioSection: 'work', cardOrder: 4, label: 'CONSULTING', section: tab(dormContent.binder, 'genesis') },
    { id: 'lek', portfolioSection: 'work', cardOrder: 5, label: 'CASE COMP', section: tab(dormContent.binder, 'lek') },
    { id: 'marketing', portfolioSection: 'work', cardOrder: 6, label: 'MARKETING', title: 'DSP and IBB', section: dormContent.phone },

    // Leadership and education
    { id: 'hope-for-hearing', portfolioSection: 'leadership', cardOrder: 1, label: 'FOUNDER', section: dormContent.shirt },
    { id: 'ucla', portfolioSection: 'education', cardOrder: 1, label: 'UNIVERSITY', section: dormContent.pennant },
    { id: 'ucc', portfolioSection: 'education', cardOrder: 2, label: 'HIGH SCHOOL', section: dormContent.gradcap },

    // Inventory: hobbies (labels are drafts)
    { id: 'rowing', portfolioSection: 'inventory', cardOrder: 1, icon: 'trophy', section: tab(homeContent.shelf, 'rowing') },
    { id: 'piano', portfolioSection: 'inventory', cardOrder: 2, icon: 'piano', section: homeContent.piano },
    { id: 'longboard', portfolioSection: 'inventory', cardOrder: 3, icon: 'board', section: homeContent.longboard },
    { id: 'cat', portfolioSection: 'inventory', cardOrder: 4, icon: 'cat', section: homeContent.cat },
    { id: 'photography', portfolioSection: 'inventory', cardOrder: 5, icon: 'camera', section: homeContent.camera },
    { id: 'baking', portfolioSection: 'inventory', cardOrder: 6, icon: 'pie', section: homeContent.pie },
    { id: 'edm', portfolioSection: 'inventory', cardOrder: 7, icon: 'headphones', section: homeContent.speaker },
    { id: 'lifting', portfolioSection: 'inventory', cardOrder: 8, icon: 'barbell', section: homeContent.pullup },
    { id: 'north-york', portfolioSection: 'inventory', cardOrder: 9, icon: 'house', section: homeContent.window },
    { id: 'family', portfolioSection: 'inventory', cardOrder: 10, icon: 'heart', section: homeContent.nightstand }
];

export const itemsIn = (s: PortfolioSection) =>
    portfolioItems.filter((i) => i.portfolioSection === s).sort((a, b) => a.cardOrder - b.cardOrder);

/** The student orgs shown as tags in the evening section. */
export const orgTags: Section[] = dormContent.todo.tabs ?? [];

export const portfolioCopy = {
    pageTitle: 'Daniel Xing | Portfolio',
    description: "Daniel Xing's portfolio: product, software, consulting, and marketing work at UCLA, plus a little about life outside work.",
    wordmark: 'DANIEL XING',
    skip: 'Skip to content',
    nav: [
        { id: 'morning', label: 'Morning', icon: 'sun' },
        { id: 'work', label: 'Work', icon: 'briefcase' },
        { id: 'evening', label: 'Evening', icon: 'sunset' },
        { id: 'night', label: 'Night', icon: 'moon' }
    ] as { id: string; label: string; icon: PixelIconName }[],
    navGame: 'Play',
    sections: {
        morning: { time: '07:30', place: 'Rieber Hall' },
        work: { time: '12:00', place: 'At work', heading: 'Selected work' },
        evening: { time: '18:00', place: 'After class', heading: 'Leadership', education: 'Education', orgs: 'Student orgs' },
        night: { time: '23:00', place: 'Off the clock', heading: 'Inventory', contact: "Let's talk." }
    },
    headline: ["Hi, I'm", 'Daniel.'],
    hudLabel: 'Daniel at a glance',
    headshotAlt: 'Headshot of Daniel Xing',
    playGame: 'Play the game version',
    resume: 'Resume',
    linkedin: 'LinkedIn',
    email: 'Email',
    github: 'GitHub',
    game: 'Game',
    viewMore: 'View more',
    flipHint: 'Tap again to open',
    flipFallback: 'Open for the story',
    glance: { role: 'Role', team: 'Team', timeline: 'Timeline' },
    writeup: { problem: 'The problem', whatIDid: 'What I did', result: 'Result' },
    funFact: 'Fun fact',
    story: 'The story',
    moreDetail: 'More detail',
    backTo: (section: string) => `Back to ${section}`,
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
    enlarge: 'Enlarge photo',
    galleryLabel: (n: number, of: number) => `Photo ${n} of ${of}`,
    otherItems: 'Other items',
    footerNote: 'Same stories as the game, minus the walking.',
    sectionNames: { work: 'Selected work', leadership: 'Leadership', education: 'Education', inventory: 'Inventory' } as Record<PortfolioSection, string>
};
