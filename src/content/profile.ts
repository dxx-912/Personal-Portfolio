import type { Profile } from './types';
import decorFiles from 'virtual:decor-files';

// From Daniel (iteration 5 feedback). The logo is the instagram-logo image slot (section 5.4): only used once the file exists.
const instagram = {
    handle: '@dxx_912',
    url: 'https://www.instagram.com/dxx_912/',
    logo: decorFiles.includes('instagram-logo.png') ? '/assets/decor/instagram-logo.png' : undefined
};

/**
 * The major, in one place (CONTENT_FINAL.md 1.4). Daniel is double checking it against his resume,
 * which says Business Economics: change it here and everything follows.
 */
export const MAJOR = 'B.A. Economics, B.S. Cognitive Science';

// Contact details, HUD stats, and the little lines Daniel says (CONTENT_FINAL.md section 1).
export const profile: Profile = {
    name: 'Daniel Xing',
    tagline: 'UCLA sophomore. I like being creative.',
    location: 'UCLA, Los Angeles. From North York, Toronto.',
    links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dxing01/' },
        { label: 'Email', href: 'mailto:dxing01@ucla.edu' },
        { label: 'GitHub', href: 'https://github.com/dxx-912' },
        { label: 'Instagram', href: instagram.url, icon: instagram.logo },
        { label: 'Resume (PDF)', href: '/resume.pdf' }
    ],

    // HUD portrait stats. They start here on every visit and change in play (src/game/session.ts):
    // the fridge Red Bull fills Caffeine, Sleep drains over time and refills in bed. Creativity never moves.
    stats: [
        { label: 'Caffeine', value: 0, max: 7, color: '#d4493a' },
        { label: 'Sleep', value: 8, max: 8, color: '#8a96a5' },
        { label: 'Creativity', value: 200, max: 200, color: '#3d7fd4' }
    ],

    // The home phone card, the dorm phone panel, and the contact links show this.
    instagram,

    wakeLine: "Hey, I'm Daniel. Welcome to my dorm at UCLA.",

    idleThoughts: [
        'should probably do my readings',
        'where did I leave my charger?...',
        'I need to do my laundry',
        'hmm...',
        "I'm him",
        'I need to apply to more jobs...'
    ],

    focus: 'Looking for growth and PM roles for 2027.',

    // Public URL for canonical and Open Graph tags, e.g. 'https://example.com'. [TODO: custom domain]
    siteUrl: ''
};
