import type { Entry } from './types';
import { profile } from './profile';
import { withMedia } from './media';

// Dorm room (Rieber Hall, UCLA): everything professional. Keyed by item id (see src/rooms/dorm.ts).
// Never invent facts. Unknowns are "[TODO: ...]" and are listed in TODO_ASSETS.md.

export const dormContent: Record<string, Entry> = withMedia({
    // 1. HUD portrait (top left of the screen, not in the room). Opens with a click or I.
    about: {
        id: 'about',
        prompt: 'About me',
        plainGroup: 'intro',
        title: "Hi, I'm Daniel",
        subtitle: '[TODO: confirm major] at UCLA',
        body: [
            "I'm interested in growth, tech, and startups.",
            '[TODO: 2 to 3 sentences of background and experience]'
        ],
        images: [{ alt: 'Headshot of Daniel Xing', slot: 'about/headshot' }],
        links: profile.links
    },

    // 2. Big UCLA pennant
    pennant: {
        id: 'pennant',
        prompt: 'UCLA',
        plainGroup: 'education',
        title: 'UCLA',
        subtitle: '[TODO: confirm major]. Honours student.',
        summary: '[TODO: confirm major]. Honours student.',
        images: [{ alt: 'Daniel in front of Royce Hall', slot: 'pennant/royce-hall' }],
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

    // 3. TO DO pin board: student orgs, one sticky note each
    todo: {
        id: 'todo',
        prompt: 'Student orgs',
        plainGroup: 'experience',
        title: 'To do: student orgs',
        plainTitle: 'Student orgs',
        subtitle: 'Pick a sticky note.',
        tabStyle: 'notes',
        tabs: [
            {
                id: 'sharpe',
                short: 'Sharpe Fellows, tech VP',
                title: 'William F. Sharpe Fellows',
                subtitle: 'Technology Vice President',
                body: ['[TODO: one line on what the org is]']
            },
            {
                id: 'dsp-org',
                short: 'Delta Sigma Pi',
                title: 'Delta Sigma Pi',
                subtitle: '[TODO: my role]',
                body: ['[TODO: one line on what the org is]']
            },
            {
                id: 'bea',
                short: 'BEA [TODO: confirm name]',
                title: 'Business in Entertainment Association',
                subtitle: '[TODO: confirm the exact official org name] [TODO: my role]',
                body: ['[TODO: one line on what the org is]']
            },
            {
                id: 'ibb-org',
                short: 'IBB',
                title: 'International Business for Bruins',
                subtitle: '[TODO: my role]',
                body: ['[TODO: one line on what the org is]']
            },
            {
                id: 'ubs',
                short: 'UBS Tech Committee',
                title: 'UBS Technology Committee',
                subtitle: '[TODO: my role]',
                body: ['[TODO: one line on what the org is]']
            },
            {
                id: 'reslife',
                short: 'ResLife RA',
                title: 'UCLA ResLife',
                subtitle: 'Resident Assistant',
                body: ['[TODO: one line on what ResLife is]']
            }
        ]
    },

    // 4. Laptop on the desk
    laptop: {
        id: 'laptop',
        prompt: 'Projects',
        plainGroup: 'projects',
        title: 'Software projects',
        tabStyle: 'tabs',
        tabs: [
            {
                id: 'cold-email',
                title: 'Cold email automator',
                summary: '[TODO: what it does, why I built it]',
                tags: ['Builder', 'Live'],
                subtitle: '[TODO: my role and the stack]',
                body: [
                    '[TODO: what it is, 1 to 2 sentences]',
                    '[TODO: why I built it, 1 to 2 sentences]'
                ],
                gallery: 'viewer',
                images: [
                    { alt: 'Cold email automator screenshot 1', slot: 'laptop/cold-email' },
                    { alt: 'Cold email automator screenshot 2', slot: 'laptop/cold-email' }
                ],
                links: [{ label: 'Open the live app', href: 'https://cold-email-automator-two.vercel.app/' }]
            },
            {
                id: 'saved-posts',
                title: 'Saved posts scroller',
                summary: '[TODO: what it does, why I built it]',
                tags: ['Builder', 'Live'],
                subtitle: '[TODO: my role and the stack]',
                body: [
                    '[TODO: what it is, 1 to 2 sentences]',
                    '[TODO: why I built it, 1 to 2 sentences]'
                ],
                gallery: 'viewer',
                images: [
                    { alt: 'Saved posts scroller screenshot 1', slot: 'laptop/saved-posts' },
                    { alt: 'Saved posts scroller screenshot 2', slot: 'laptop/saved-posts' }
                ],
                links: [{ label: 'Open the live app', href: 'https://morning-scroller.vercel.app/' }]
            },
            {
                id: 'ateball',
                title: 'Ateball',
                subtitle: 'Creative Labs. Project manager.',
                org: 'Creative Labs, UCLA',
                role: 'Project manager',
                summary: '[TODO: one line result]',
                tags: ['PM'],
                body: [
                    '[TODO: what Ateball is, 1 to 2 sentences]',
                    '[TODO: why I built it with Creative Labs]'
                ],
                gallery: 'viewer',
                images: [
                    { alt: 'Ateball UI screenshot 1', slot: 'laptop/ateball' },
                    { alt: 'Ateball UI screenshot 2', slot: 'laptop/ateball' },
                    { alt: 'Ateball UI screenshot 3', slot: 'laptop/ateball' }
                ],
                links: [{ label: '[TODO: link to Ateball, if public]' }]
            }
        ]
    },

    // 5. Binder labeled "Consulting stuff"
    binder: {
        id: 'binder',
        prompt: 'Consulting',
        plainGroup: 'projects',
        title: 'Consulting',
        tabStyle: 'tabs',
        tabs: [
            {
                id: 'genesis',
                title: 'Genesis Alternative Ventures',
                subtitle: 'Project Manager',
                role: 'Project manager',
                summary: '[TODO: scope, result]',
                tags: ['Slides'],
                body: ['[TODO: the client, the problem, what my team did, the outcome]'],
                gallery: 'viewer',
                images: [
                    { alt: 'Genesis Alternative Ventures slide 1', slot: 'binder/genesis' },
                    { alt: 'Genesis Alternative Ventures slide 2', slot: 'binder/genesis' },
                    { alt: 'Genesis Alternative Ventures slide 3', slot: 'binder/genesis' }
                ]
            },
            {
                id: 'lek',
                title: 'L.E.K. Case Competition',
                subtitle: 'Winner',
                summary: 'Winner. [TODO: the problem and our answer]',
                tags: ['Winner'],
                body: ['[TODO: the case, our recommendation, the year]'],
                gallery: 'viewer',
                images: [
                    { alt: 'L.E.K. Case Competition slide 1', slot: 'binder/lek' },
                    { alt: 'L.E.K. Case Competition slide 2', slot: 'binder/lek' },
                    { alt: 'L.E.K. Case Competition slide 3', slot: 'binder/lek' }
                ]
            }
        ]
    },

    // 6. Phone with a feed on screen
    phone: {
        id: 'phone',
        prompt: 'Club marketing',
        plainGroup: 'projects',
        title: 'Club marketing',
        tabStyle: 'phone',
        short: 'DSP and IBB',
        summary: 'Campaigns, rush videos, website rebuilds. [TODO: metrics]',
        tags: ['Brand', 'Web'],
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
                    { alt: 'DSP Vogue campaign graphic 1', caption: 'Vogue campaign', slot: 'phone/dsp-vogue' },
                    { alt: 'DSP Vogue campaign graphic 2', caption: 'Vogue campaign', slot: 'phone/dsp-vogue' },
                    { alt: 'DSP Vogue campaign graphic 3', caption: 'Vogue campaign', slot: 'phone/dsp-vogue' },
                    { alt: 'DSP website screenshot', caption: 'Website build', slot: 'phone/dsp-website' }
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
                    { alt: 'IBB graphic 1', slot: 'phone/ibb-graphics' },
                    { alt: 'IBB graphic 2', slot: 'phone/ibb-graphics' },
                    { alt: 'IBB graphic 3', slot: 'phone/ibb-graphics' },
                    { alt: 'IBB website screenshot', caption: 'Website build', slot: 'phone/ibb-website' }
                ],
                videos: [{ kind: 'youtube', title: 'IBB rush video' /* id: '[TODO]' */ }],
                links: [{ label: 'IBB website (the one I built)' /* href: '[TODO]' */ }]
            }
        ]
    },

    // 7. Grad cap on the dresser: high school only
    gradcap: {
        id: 'gradcap',
        prompt: 'High school',
        plainGroup: 'education',
        title: 'Upper Canada College',
        subtitle: 'International Baccalaureate Diploma',
        summary: 'IB Diploma 40/45. SAT 1560.',
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
        links: [{ label: 'Read the extended essay' /* href: '[TODO]' */ }],
        gallery: 'grid',
        images: [
            { alt: 'Graduating class throwing their hats', slot: 'gradcap/hat-toss' },
            { alt: 'Daniel leading Business Club', slot: 'gradcap/business-club' },
            { alt: 'Daniel leading Asian Heritage Club', slot: 'gradcap/asian-heritage-club' }
        ]
    },

    // 8. Closet (E changes outfit)
    closet: {
        id: 'closet',
        prompt: 'Resident Assistant',
        plainGroup: 'experience',
        title: 'Resident Assistant',
        subtitle: 'UCLA ResLife',
        body: [
            "Why I do it: it saves money, and it's genuinely fun.",
            '[TODO: a sentence or two on what the job is like]'
        ],
        images: [{ alt: 'Daniel as an RA', slot: 'closet/ra' }]
    },

    // 9. Folded "Hope For Hearing" shirt on the dresser
    shirt: {
        id: 'shirt',
        prompt: 'Hope For Hearing',
        plainGroup: 'projects',
        title: 'Hope For Hearing',
        subtitle: 'Founder. [TODO: the years]',
        role: 'Founder',
        summary: 'Started after meeting Roy on the subway. [TODO: mission line]',
        // From the approved portfolio mockup. [TODO: Daniel to confirm these are current]
        counters: [
            { value: 500, suffix: '+', label: 'members' },
            { value: 12, label: 'institutions' }
        ],
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
            { alt: 'Hope For Hearing photo 1', caption: '[TODO: caption]', slot: 'shirt/gallery' },
            { alt: 'Hope For Hearing photo 2', caption: '[TODO: caption]', slot: 'shirt/gallery' },
            { alt: 'Hope For Hearing photo 3', caption: '[TODO: caption]', slot: 'shirt/gallery' },
            { alt: 'Hope For Hearing photo 4', caption: '[TODO: caption]', slot: 'shirt/gallery' }
        ]
    }
});
