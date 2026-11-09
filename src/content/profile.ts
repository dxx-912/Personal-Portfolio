import type { Profile } from './types';

// Contact details. Leave href empty until confirmed; it renders as a visible TODO.
export const profile: Profile = {
    name: 'Daniel Xing',
    tagline: '[TODO: one line tagline]',
    location: 'UCLA, Los Angeles. From North York, Toronto.',
    links: [
        { label: 'LinkedIn' /* href: '[TODO: LinkedIn URL]' */ },
        { label: 'Email' /* href: 'mailto:[TODO]' */ },
        { label: 'GitHub' /* href: '[TODO: GitHub URL]' */ },
        { label: 'Resume (PDF)', download: true /* href: '/media/resume/daniel-xing-resume.pdf' */ }
    ]
};
