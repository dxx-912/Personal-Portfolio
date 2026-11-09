import type { Entry } from './types';
import { profile } from './profile';

// Dorm room: everything professional. Keyed by interactable id (see src/rooms/dorm.ts).
// Never invent facts. Unknowns are "[TODO: ...]" and are listed in TODO_ASSETS.md.

export const dormContent: Record<string, Entry> = {
    mirror: {
        id: 'mirror',
        prompt: 'Mirror, about me',
        plainGroup: 'intro',
        title: "Hi, I'm Daniel",
        subtitle: '[TODO: confirm major] at UCLA',
        body: [
            "I'm interested in growth, tech, and startups.",
            '[TODO: 2 to 3 sentences of background and experience]'
        ],
        images: [{ alt: 'Headshot of Daniel Xing' }],
        links: profile.links
    },

    pinboard: {
        id: 'pinboard',
        prompt: 'Pin board, Hope For Hearing',
        plainGroup: 'projects',
        title: 'Hope For Hearing',
        subtitle: '[TODO: my role and the years]',
        body: [
            '[TODO: how it started. I met Roy on the subway, by chance. 2 to 4 sentences.]',
            '[TODO: what Hope For Hearing does and the impact so far]',
            '[TODO: what it taught me and why it shaped who I am today]'
        ],
        facts: [
            { label: 'Milestones', value: '[TODO: key milestones]' },
            { label: 'Stats', value: '[TODO: numbers worth showing]' }
        ],
        list: [{ title: 'Funding grants won', items: ['[TODO: grant names, and amounts if shareable]'] }],
        gallery: 'polaroid',
        images: [
            { alt: 'Hope For Hearing photo 1', caption: '[TODO: caption]' },
            { alt: 'Hope For Hearing photo 2', caption: '[TODO: caption]' },
            { alt: 'Hope For Hearing photo 3', caption: '[TODO: caption]' },
            { alt: 'Hope For Hearing photo 4', caption: '[TODO: caption]' }
        ]
    },

    laptop: {
        id: 'laptop',
        prompt: 'Laptop, projects',
        plainGroup: 'projects',
        title: 'Software projects',
        tabStyle: 'tabs',
        tabs: [
            {
                id: 'cold-email',
                title: 'Cold email automator',
                subtitle: '[TODO: my role and the stack]',
                body: [
                    '[TODO: what it is, 1 to 2 sentences]',
                    '[TODO: why I built it, 1 to 2 sentences]'
                ],
                links: [{ label: 'Open the live app', href: 'https://cold-email-automator-two.vercel.app/' }]
            },
            {
                id: 'saved-posts',
                title: 'Saved posts scroller',
                subtitle: '[TODO: my role and the stack]',
                body: [
                    '[TODO: what it is, 1 to 2 sentences]',
                    '[TODO: why I built it, 1 to 2 sentences]'
                ],
                links: [{ label: 'Open the live app', href: 'https://morning-scroller.vercel.app/' }]
            },
            {
                id: 'ateball',
                title: 'Ateball',
                subtitle: 'Creative Labs. [TODO: my role]',
                body: [
                    '[TODO: what Ateball is, 1 to 2 sentences]',
                    '[TODO: why I built it with Creative Labs]'
                ],
                gallery: 'viewer',
                images: [
                    { alt: 'Ateball UI screenshot 1' },
                    { alt: 'Ateball UI screenshot 2' },
                    { alt: 'Ateball UI screenshot 3' }
                ],
                links: [{ label: '[TODO: link to Ateball, if public]' }]
            }
        ]
    },

    trophy: {
        id: 'trophy',
        prompt: 'Trophy and binder, consulting',
        plainGroup: 'projects',
        title: 'Consulting',
        tabStyle: 'tabs',
        tabs: [
            {
                id: 'genesis',
                title: 'Genesis Alternative Ventures',
                subtitle: 'Project Manager',
                body: ['[TODO: the client, the problem, what my team did, the outcome]'],
                gallery: 'viewer',
                images: [
                    { alt: 'Genesis Alternative Ventures slide 1' },
                    { alt: 'Genesis Alternative Ventures slide 2' },
                    { alt: 'Genesis Alternative Ventures slide 3' }
                ]
            },
            {
                id: 'lek',
                title: 'L.E.K. Case Competition',
                subtitle: 'Winner',
                body: ['[TODO: the case, our recommendation, the year]'],
                gallery: 'viewer',
                images: [
                    { alt: 'L.E.K. Case Competition slide 1' },
                    { alt: 'L.E.K. Case Competition slide 2' },
                    { alt: 'L.E.K. Case Competition slide 3' }
                ]
            }
        ]
    },

    camera: {
        id: 'camera',
        prompt: 'Camera, club marketing',
        plainGroup: 'projects',
        title: 'Club marketing',
        tabStyle: 'tabs',
        tabs: [
            {
                id: 'dsp',
                title: 'DSP',
                subtitle: 'Delta Sigma Pi. [TODO: my role]',
                body: ['[TODO: what I did for DSP marketing]'],
                facts: [
                    { label: 'Skills used', value: '[TODO]' },
                    { label: 'Results', value: '[TODO: measurable results]' }
                ],
                gallery: 'grid',
                images: [
                    { alt: 'DSP Vogue campaign graphic 1', caption: 'Vogue campaign' },
                    { alt: 'DSP Vogue campaign graphic 2', caption: 'Vogue campaign' },
                    { alt: 'DSP Vogue campaign graphic 3', caption: 'Vogue campaign' },
                    { alt: 'DSP website screenshot', caption: 'Website build' }
                ],
                videos: [{ kind: 'youtube', title: 'DSP rush video' /* id: '[TODO]' */ }],
                links: [{ label: 'DSP website (the one I built)' /* href: '[TODO]' */ }]
            },
            {
                id: 'ibb',
                title: 'IBB',
                subtitle: 'International Business for Bruins. [TODO: my role]',
                body: ['[TODO: what I did for IBB marketing]'],
                facts: [
                    { label: 'Skills used', value: '[TODO]' },
                    { label: 'Results', value: '[TODO: measurable results]' }
                ],
                gallery: 'grid',
                images: [
                    { alt: 'IBB graphic 1' },
                    { alt: 'IBB graphic 2' },
                    { alt: 'IBB graphic 3' },
                    { alt: 'IBB website screenshot', caption: 'Website build' }
                ],
                videos: [{ kind: 'youtube', title: 'IBB rush video' /* id: '[TODO]' */ }],
                links: [{ label: 'IBB website (the one I built)' /* href: '[TODO]' */ }]
            }
        ]
    },

    pennants: {
        id: 'pennants',
        prompt: 'Pennants, student orgs',
        plainGroup: 'experience',
        title: 'Student orgs',
        subtitle: 'Pick a pennant.',
        tabStyle: 'pennants',
        tabs: [
            {
                id: 'sharpe',
                title: 'William F. Sharpe Fellows',
                subtitle: 'Technology Vice President',
                body: ['[TODO: one line on what the org is]']
            },
            {
                id: 'dsp-org',
                title: 'Delta Sigma Pi',
                subtitle: '[TODO: my role]',
                body: ['[TODO: one line on what the org is]']
            },
            {
                id: 'bea',
                title: 'Business in Entertainment Association',
                subtitle: '[TODO: confirm the exact official org name] [TODO: my role]',
                body: ['[TODO: one line on what the org is]']
            },
            {
                id: 'ibb-org',
                title: 'International Business for Bruins',
                subtitle: '[TODO: my role]',
                body: ['[TODO: one line on what the org is]']
            },
            {
                id: 'ubs',
                title: 'UBS Technology Committee',
                subtitle: '[TODO: my role]',
                body: ['[TODO: one line on what the org is]']
            },
            {
                id: 'reslife',
                title: 'UCLA ResLife',
                subtitle: 'Resident Assistant',
                body: ['[TODO: one line on what ResLife is]']
            }
        ]
    },

    drawers: {
        id: 'drawers',
        prompt: 'Drawers, education',
        plainGroup: 'education',
        title: 'Education',
        tabStyle: 'halves',
        tabs: [
            {
                id: 'ucla',
                title: 'UCLA',
                subtitle: '[TODO: confirm major]. Honours student.',
                images: [{ alt: 'Daniel in front of Royce Hall' }],
                list: [{
                    title: 'Courses',
                    items: [
                        'Advanced micro theory',
                        'Advanced macro theory',
                        'Intro to C++',
                        'Accounting fundamentals'
                    ]
                }]
            },
            {
                id: 'ucc',
                title: 'Upper Canada College',
                subtitle: 'International Baccalaureate Diploma',
                images: [
                    { alt: 'Graduating class throwing their hats' },
                    { alt: 'Daniel leading Business Club' },
                    { alt: 'Daniel leading Asian Heritage Club' }
                ],
                facts: [
                    { label: 'IB score', value: '40/45' },
                    { label: 'SAT', value: '1560' }
                ],
                list: [
                    { title: 'Higher level', items: ['Mathematics A&I', 'English L&L', 'Economics'] },
                    { title: 'Standard level', items: ['Mandarin B', 'Global Politics', 'ESS'] },
                    { title: 'Leadership', items: ['Business Club President', 'Asian Heritage Club President'] }
                ],
                body: ["Extended essay: the geopolitical implications of Taiwan's semiconductor industry."],
                links: [{ label: 'Read the extended essay' /* href: '[TODO]' */ }]
            }
        ]
    },

    closet: {
        id: 'closet',
        prompt: 'Closet, RA lanyard',
        plainGroup: 'experience',
        title: 'Resident Assistant',
        subtitle: 'UCLA ResLife',
        body: [
            "Why I do it: it saves money, and it's genuinely fun.",
            '[TODO: a sentence or two on what the job is like]'
        ],
        images: [{ alt: 'Daniel as an RA' }]
    }
};
