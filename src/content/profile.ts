import type { Profile } from './types';

// Contact details, HUD stats, and the little lines Daniel says.
// Leave href empty until confirmed; it renders as a visible TODO.
export const profile: Profile = {
    name: 'Daniel Xing',
    tagline: '[TODO: one line tagline]',
    location: 'UCLA, Los Angeles. From North York, Toronto.',
    links: [
        { label: 'LinkedIn' /* href: '[TODO: LinkedIn URL]' */ },
        { label: 'Email' /* href: 'mailto:[TODO]' */ },
        { label: 'GitHub' /* href: '[TODO: GitHub URL]' */ },
        { label: 'Resume (PDF)', download: true /* href: '/media/resume/daniel-xing-resume.pdf' */ }
    ],

    // Joke stats for the HUD portrait. [TODO: Daniel to pick the names and numbers]
    stats: [
        { label: 'Caffeine', value: 7, max: 7, color: '#d4493a' },
        { label: 'Sleep', value: 2, max: 6, color: '#8a96a5' },
        { label: 'Curiosity', value: 200, max: 200, color: '#3d7fd4' }
    ],

    // [TODO: Daniel to confirm the line]
    wakeLine: "Hey, I'm Daniel. Welcome to my dorm at UCLA.",

    // Placeholders until Daniel writes his own. [TODO: Daniel to write 5 to 8 lines]
    idleThoughts: [
        'should probably do my readings',
        'what should I eat later...',
        'where did I leave my charger',
        'five more minutes',
        'hmm'
    ],

    // Portfolio view hero line, from the approved mockup. [TODO: Daniel to confirm]
    focus: 'UCLA student building products, campaigns, and communities. Looking for product management roles in 2027.',

    // Public URL for canonical and Open Graph tags, e.g. 'https://example.com'. [TODO: custom domain]
    siteUrl: ''
};
