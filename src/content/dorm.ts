import type { Entry } from './types';
import { MAJOR, profile } from './profile';
import { withMedia } from './media';

// Dorm room (Rieber Hall, UCLA): everything professional. Keyed by item id (see src/rooms/dorm.ts).
// Copy comes from CONTENT_FINAL.md (section 2). Never invent facts. Unknowns are "[TODO: ...]"
// (shown in development, hidden in production builds) and are listed in TODO_ASSETS.md.

export const dormContent: Record<string, Entry> = withMedia({
    // 1. HUD portrait (top left of the screen, not in the room). Opens with a click or I.
    about: {
        id: 'about',
        prompt: 'About me',
        plainGroup: 'intro',
        title: 'About me',
        subtitle: profile.tagline,
        body: [
            "Hey I'm Daniel, thanks for visiting my portfolio :)",
            "I'm a sophomore at UCLA right now majoring in economics and cognitive science, born and raised in Toronto.",
            "I come from a pretty artistic background (spent my formative years in specialized art programs), so I hope to build and create in whatever I end up doing professionally, whether through the arts or technology.",
            "I'm currently recruiting and hope to land product management, product marketing, or growth roles for the summer."
        ],
        // The headshot comes first: the quick view uses it as the hero photo.
        // one row of equal photos across the panel, each captioned with its file name
        gallery: 'row',
        images: [
            { alt: 'Headshot of Daniel Xing', caption: 'Professional Headshot', slot: 'about/headshot' },
            { alt: 'Daniel outside of class', caption: 'Me with my caricature', slot: 'about/photos' },
            { alt: 'Daniel outside of class', caption: 'Me, my sister, and my cat', slot: 'about/photos' }
        ],
        links: profile.links
    },

    // 2. Big UCLA pennant
    pennant: {
        id: 'pennant',
        prompt: 'UCLA',
        plainGroup: 'education',
        title: 'UCLA',
        subtitle: `${MAJOR}. College Honours Student.`,
        summary: `${MAJOR}. GPA 3.72. Expected graduation June 2029.`,
        facts: [
            { label: 'Major', value: MAJOR },
            { label: 'Expected graduation', value: 'June 2029' },
            { label: 'Honours', value: 'College Honours Student' }
        ],
        list: [{
            title: 'Coursework',
            items: [
                'Microeconomic theory',
                'Macroeconomic theory',
                'Intro to C++',
                'Accounting principles'
            ]
        }],
        // five photos stacked, each the full width of the panel
        gallery: 'stack',
        images: [
            { alt: 'Daniel and friends at UCLA', slot: 'pennant/friends' },
            { alt: 'Daniel and friends at UCLA', slot: 'pennant/friends' },
            { alt: 'Daniel and friends at UCLA', slot: 'pennant/friends' }
        ]
    },

    // 3. TO DO pin board: student orgs, one sticky note each (also the quick view leadership gallery)
    todo: {
        id: 'todo',
        prompt: 'Student orgs',
        plainGroup: 'experience',
        title: 'Student org leadership',
        plainTitle: 'Student orgs',
        subtitle: 'Pick a sticky note.',
        tabStyle: 'notes',
        tabs: [
            {
                id: 'sharpe',
                short: 'Sharpe Fellows',
                title: 'William F. Sharpe Fellows',
                subtitle: 'Technology Track Vice President',
                role: 'Technology Track Vice President',
                omit: ['timeline', 'whatIDid'],
                hideGlance: true,
                body: ["Fellowship providing UCLA's top business students with mentorship, resources, and professional development."]
            },
            {
                id: 'dsp-org',
                short: 'Delta Sigma Pi',
                title: 'Delta Sigma Pi, Xi Omicron Chapter',
                subtitle: 'Director of Marketing',
                role: 'Director of Marketing',
                omit: ['timeline', 'whatIDid'],
                hideGlance: true,
                body: ["UCLA chapter of the nation's leading co-ed professional business fraternity, developing members through professional events, leadership, and service."]
            },
            {
                id: 'ibb-org',
                short: 'IBB',
                title: 'International Business for Bruins',
                subtitle: 'Director of Marketing',
                role: 'Director of Marketing',
                omit: ['timeline', 'whatIDid'],
                hideGlance: true,
                body: ['Consulting club providing members with professional development, real client work, and a network in international business.']
            },
            {
                id: 'bea',
                short: 'BEA',
                title: 'Business in Entertainment Association',
                subtitle: 'Director of Digital Media',
                role: 'Director of Digital Media',
                omit: ['timeline', 'whatIDid'],
                hideGlance: true,
                body: ['Club connecting UCLA students to careers in the business of entertainment through panels, networking events, and premieres.']
            },
            {
                id: 'ubs',
                short: 'UBS Tech Committee',
                title: 'UBS Technology Committee',
                subtitle: 'Committee Member',
                role: 'Committee Member',
                omit: ['timeline', 'whatIDid'],
                hideGlance: true,
                body: ["Committee of UCLA's largest student organization that runs events and recruiting programs at the intersection of tech and business."]
            },
            {
                id: 'reslife',
                short: 'ResLife RA',
                title: 'UCLA Residential Life',
                subtitle: 'Resident Assistant at Rieber Hall South, Floor 6',
                role: 'Resident Assistant at Rieber Hall South, Floor 6',
                omit: ['timeline', 'whatIDid'],
                hideGlance: true,
                body: ['Campus department that manages, programs, and supports the student living communities across "The Hill" and University Apartments.']
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
                title: 'Cold Outreach Automator',
                subtitle: 'Solo project',
                summary: 'Personalized cold emails from your own Gmail. 7 users so far, 650+ emails sent.',
                tags: ['Builder', 'Live'],
                omit: ['role', 'team', 'timeline', 'problem', 'whatIDid'],
                notes: [
                    { label: 'What it does', text: "Sends personalized cold emails from your own Gmail. Import a contact list, approve contacts, write one template, and it schedules sends and follow-ups on each contact's local time." },
                    { label: 'Why I built it', text: "Didn't want to pay for Apollo.io, so I built my own version." },
                    { label: 'Built with', text: 'Next.js, React, TypeScript, Supabase (Postgres, Auth), Vercel, Google Apps Script, Google OAuth, Claude Code' }
                ],
                result: '7 users so far with over 650 emails sent.',
                gallery: 'stack',
                images: [
                    { alt: 'Cold Outreach Automator screenshot', slot: 'laptop/cold-email' },
                    { alt: 'Cold Outreach Automator screenshot', slot: 'laptop/cold-email' }
                ],
                links: [{ label: 'Open the live app', href: 'https://cold-email-automator-two.vercel.app/' }]
            },
            {
                id: 'saved-posts',
                title: 'Saved posts scroller',
                subtitle: 'Solo project',
                summary: 'Turns your Instagram saved posts into a daily feed you actually revisit.',
                tags: ['Builder', 'Live'],
                omit: ['role', 'team', 'timeline', 'problem', 'whatIDid'],
                notes: [
                    { label: 'What it does', text: 'Turns your Instagram saved posts into a daily feed. Upload your saves export, and it reshuffles them every day into a scrollable feed you can filter by category.' },
                    { label: 'Why I built it', text: 'I save a lot of posts on Instagram but never go back to them. I wanted a way to actually revisit them, without the noise of the main app. I also save a lot of motivational reels that I can scroll through every morning to start my day.' },
                    { label: 'Built with', text: 'React, TypeScript, Vite, Tailwind, IndexedDB, Vercel, Claude Code' }
                ],
                result: 'I start every morning quite motivated now. Shared with friends and family; good feedback so far.',
                gallery: 'viewer',
                images: [
                    { alt: 'Saved posts scroller screenshot', slot: 'laptop/saved-posts' },
                    { alt: 'Saved posts scroller screenshot', slot: 'laptop/saved-posts' }
                ],
                links: [{ label: 'Open the live app', href: 'https://morning-scroller.vercel.app/' }]
            },
            {
                id: 'ateball',
                title: 'Ateball',
                subtitle: 'Creative Labs. Project Manager.',
                org: 'Creative Labs',
                role: 'Project Manager',
                team: '12 people across design, frontend, and backend',
                timeline: '12 weeks [TODO: quarter and year]',
                hideGlance: true,
                summary: 'Led a 12-person team from zero to one over 12 weeks.',
                tags: ['PM'],
                problem: 'Everyone always has opinions on everything, especially when a friend group has to decide where to eat out together. All of a sudden, people are "okay with anything" and end up going to Raising Cane\'s for the nth time. Built this app to fix this problem.',
                whatIDid: 'Led a 12-person team from zero to one over 12 weeks, running two to three syncs a week across design, frontend, and backend.',
                result: "Although we didn't finish the entire application on time, this was my first time building a tech product end-to-end and a great experience leading multiple teams toward one goal.",
                gallery: 'viewer',
                images: [
                    { alt: 'Ateball UI screenshot', slot: 'laptop/ateball' },
                    { alt: 'Ateball UI screenshot', slot: 'laptop/ateball' },
                    { alt: 'Ateball UI screenshot', slot: 'laptop/ateball' }
                ]
            }
        ]
    },

    // 5. Binder (Consulting)
    binder: {
        id: 'binder',
        prompt: 'Consulting',
        plainGroup: 'projects',
        title: 'Consulting',
        tabStyle: 'tabs',
        tabs: [
            {
                id: 'lek',
                title: 'L.E.K. Case Competition',
                subtitle: 'With Shakti Widjonarko, Kenneth Lee, Aaron Teng, and Ashlyn Bi. 3rd place finalist out of 50+ teams.',
                team: '5 people (with Shakti Widjonarko, Kenneth Lee, Aaron Teng, Ashlyn Bi)',
                timeline: 'Spring 2026',
                hideGlance: true,
                summary: '3rd place finalist out of 50+ teams.',
                tags: ['3rd Place'],
                omit: ['role', 'whatIDid'],
                problem: 'CorVista, a cardiology EMR software company, had to choose its next growth move: build a data analytics product on top of its existing cardiology records, or enter the cardiac surgery software market.',
                notes: [
                    { label: 'Our answer', text: 'Sequence it. Launch data analytics first, as a 4-month build sold as an upsell to existing clinic customers before private equity rollups lock them into competitors. Then use that cash flow and those relationships to enter cardiac surgery, which is a larger but harder market with no purpose-built competitor today.' }
                ],
                result: '3rd place finalist out of 50+ teams.',
                gallery: 'viewer',
                images: [
                    { alt: 'L.E.K. Case Competition slide', slot: 'binder/lek' },
                    { alt: 'L.E.K. Case Competition slide', slot: 'binder/lek' },
                    { alt: 'L.E.K. Case Competition slide', slot: 'binder/lek' }
                ]
            },
            {
                // No "what I did" and no result (CONTENT_FINAL.md). Slides added by Daniel.
                id: 'genesis',
                title: 'Genesis Alternative Ventures',
                subtitle: 'Project manager, through International Business for Bruins',
                role: 'Project manager (through International Business for Bruins)',
                team: '6 people',
                timeline: 'Spring quarter 2026',
                hideGlance: true,
                summary: 'Whether and how a Southeast Asian venture debt fund should expand its credit products.',
                omit: ['whatIDid', 'result'],
                problem: 'Genesis Alternative Ventures, a Southeast Asian venture debt fund, wanted to know whether and how to expand the credit products in its Fund III across Southeast Asia, without cannibalizing its existing business.',
                gallery: 'viewer',
                images: [
                    { alt: 'Genesis Alternative Ventures slide', slot: 'binder/genesis' },
                    { alt: 'Genesis Alternative Ventures slide', slot: 'binder/genesis' },
                    { alt: 'Genesis Alternative Ventures slide', slot: 'binder/genesis' }
                ]
            }
        ]
    },

    // 6. Phone on the desk. The DSP and IBB website rebuilds live here, not as separate projects.
    phone: {
        id: 'phone',
        prompt: 'Club marketing',
        plainGroup: 'projects',
        title: 'Club marketing',
        tabStyle: 'tabs',
        short: 'DSP and IBB',
        summary: 'Rush campaign with 350K+ views, a rush video with 110K+ organic views, and two club websites.',
        tags: ['Brand', 'Web'],
        omit: ['role', 'team', 'timeline', 'problem', 'whatIDid', 'result'],
        tabs: [
            {
                id: 'dsp',
                title: 'DSP',
                subtitle: 'Delta Sigma Pi. Director of Marketing.',
                body: ["Ran the chapter's Fall 2026 rush marketing: designed the Vogue-themed photoshoot campaign, the rush video, and a rebuilt chapter website."],
                list: [{
                    title: 'Results',
                    items: [
                        'Vogue themed rush campaign: 350K+ views, 800+ interactions, 18% follower growth.',
                        'Rush video: 110K+ organic views, 2K+ interactions.',
                        'Chapter website: 3K+ visitors in its first 30 days.'
                    ]
                }],
                gallery: 'grid',
                images: [
                    { alt: 'DSP Vogue campaign graphic', caption: 'Main Graphic', slot: 'phone/dsp-vogue' },
                    { alt: 'DSP Vogue campaign graphic', caption: 'Rush Schedule 1', slot: 'phone/dsp-vogue' },
                    { alt: 'DSP Vogue campaign graphic', caption: 'Rush Schedule 2', slot: 'phone/dsp-vogue' },
                    { alt: 'DSP Vogue campaign graphic', caption: 'Offers Graphic', slot: 'phone/dsp-vogue' },
                    { alt: 'Delta Sigma Pi chapter website', caption: 'Website build', slot: 'phone/dsp-website', wide: true }
                ],
                videos: [{ kind: 'mp4', title: 'DSP rush video', slot: 'phone/dsp-rush', url: 'https://www.instagram.com/p/DdsWVwHBf9C/' }],
                links: [
                    { label: 'Rush video on Instagram', href: 'https://www.instagram.com/p/DdsWVwHBf9C/' },
                    { label: 'ucladsp.com (the site I built)', href: 'https://ucladsp.com' }
                ]
            },
            {
                id: 'ibb',
                title: 'IBB',
                subtitle: 'International Business for Bruins. Director of Marketing.',
                body: ["Rebuilt the club's brand identity (logo, fonts, color palette), produced recruitment and event content, and shipped a new club website to showcase offerings and drive recruitment."],
                list: [{
                    title: 'Results',
                    items: [
                        'Recruitment and event content reaching 80K+ views.',
                        'New brand identity and website launched.'
                    ]
                }],
                gallery: 'grid',
                images: [
                    { alt: 'IBB graphic', slot: 'phone/ibb-graphics' },
                    { alt: 'IBB graphic', slot: 'phone/ibb-graphics' },
                    { alt: 'IBB graphic', slot: 'phone/ibb-graphics' },
                    { alt: 'International Business for Bruins website', caption: 'Website build', slot: 'phone/ibb-website', wide: true }
                ],
                links: [{ label: 'ibbatucla.com (the site I built)', href: 'https://ibbatucla.com' }]
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
            { label: 'IB Diploma', value: '40/45' },
            { label: 'SAT', value: '1560' }
        ],
        list: [
            {
                title: 'Leadership',
                items: [
                    "Business Competition Club, President (Sep 2023 to May 2025). Led UCC's DECA and FBLA teams, growing membership by 400% through promotional videos and graphics (16,000+ impressions) and running weekly prep sessions, guest lectures, and a 1-on-1 mentorship system.",
                    'Asian Heritage & Culture Club, President (Sep 2023 to May 2025). Led 40+ members in running school wide cultural events for Lunar New Year and AAPI Month, plus potlucks, karaoke nights, trivia tournaments, and performances, with promo content reaching 12,000+ impressions.'
                ]
            }
        ],
        body: [
            'Higher Levels: Mathematics (A&I), English (L&L), Economics',
            'Standard Levels: Mandarin B, Global Politics, ESS',
            "Extended essay: Economic and Geopolitical Implications of Taiwan's Semiconductor Industry."
        ],
        links: [{ label: 'Read the extended essay', href: 'https://drive.google.com/file/d/14pv1NG7O9NHQkYhc4oL-PvGsY7-hgb9g/view?usp=sharing' }],
        gallery: 'grid',
        images: [
            { alt: 'Graduating class throwing their hats', slot: 'gradcap/hat-toss' },
            { alt: 'Daniel leading the Business Competition Club', slot: 'gradcap/business-club' },
            { alt: 'Daniel leading the Asian Heritage & Culture Club', slot: 'gradcap/asian-heritage-club' }
        ]
    },

    // 8. Closet (E changes outfit)
    closet: {
        id: 'closet',
        prompt: 'Resident Assistant',
        plainGroup: 'experience',
        title: 'Resident Assistant',
        subtitle: 'Rieber Hall South, Floor 6',
        body: [
            'Supporting 98 residents: I handle conflicts, policy issues, and emergencies, organize programming, and help run move-in and orientation. I get a free single and free food in return, which is great cause UCLA has free food.'
        ],
        gallery: 'row',
        images: [{ alt: 'Daniel as a Resident Assistant', slot: 'closet/ra' }]
    },

    // 9. Folded "Hope For Hearing" shirt on the dresser
    shirt: {
        id: 'shirt',
        prompt: 'Hope For Hearing',
        plainGroup: 'projects',
        title: 'Hope For Hearing',
        // [TODO: confirm "Founder" (the story credits Roy with the foundation)]
        role: 'Founder',
        summary: 'At its peak, Hope For Hearing grew to 500+ members across 12 high school chapters in Canada.',
        omit: ['team', 'timeline', 'problem', 'whatIDid', 'result'],
        counters: [
            { value: 500, suffix: '+', label: 'members' },
            { value: 12, label: 'high school chapters' },
            { value: 25000, prefix: '$', suffix: '+', label: 'raised for charity' },
            { value: 50, suffix: '+', label: 'events' }
        ],
        body: [
            'Raising awareness of hearing loss and the stigma surrounding it, as well as raising funding for cochlear implant research.',
            'At its peak, Hope For Hearing grew to 500+ members across 12 high school chapters in Canada.'
        ],
        more: {
            title: 'The founding story',
            intro: [
                'I was walking from school to the subway one random day when I met this guy called Roy Feng. It was mid-winter, and I forgot to bring my coat, so I was freezing. He offered his coat to me, and we started chatting.',
                'I was in grade 10; he was a year older and in his first year of the IB program. He started pitching me this idea for his CAS project (volunteer service project IB kids have to do), something about doing some charity work for hearing loss, since he had mild tinnitus. He asked me if I wanted to help out.'
            ],
            label: 'Read the whole story',
            body: [
                "Seemed interesting, and Roy seemed like a cool, nice dude who just offered me his coat in the middle of Toronto's shitty ass weather. My father also had hearing loss, so this mattered to me personally as well.",
                "We started texting and planning how to raise funds, and settled on spamming snack stands and running a big music night centered around hearing loss awareness. Admittedly, Roy did probably 90% of the work at first and got together a big team that comprised mostly his friends who were all older than me. By the end of the year, we had raised over $3,000 for Sunnybrook Hospital's cochlear implant R&D department.",
                "Over the summer, I went to a STEM summer program called SHAD Canada. Great experience, but my big takeaway from that camp was that people were hella struggling to fulfill Ontario's 40-hour volunteer requirement. Coincidentally, Roy had also prefaced that he was going to be a lot busier going into his senior year with college apps and the hellfire that IB DP 2 is.",
                'Naturally, I started thinking about the possibility of replicating everything we did at my high school, but across multiple schools. This would not only scale our impact tenfold, but also give people a chance to take on leadership roles at their school for extracurricular experience or simply earn volunteer hours.',
                'As such, I started doing heavy outreach. I DMed every possible person I could think of through Instagram, Discord, LinkedIn, any platform, cold-messaged and got ghosted a million times, and posted graphics everywhere. I ended up with over 30 people interested in starting a chapter. Oops.',
                'I had now dug myself into a shithole, too much food on my plate, too much to chew on, whatever other sayings are out there. But it was through this I developed the most as a leader: the whole scenario taught me how to manage and lead what was now hundreds of people across the country toward one mission. I learned how to deal with unthinkable problems that inevitably arise, how to handle conflicts between chapter heads, and how to mentor chapter heads to organize their own events, etc. I had to deal with school administrators, public officials, immature high school students, corporate HRs, and just a whole bunch of BS that you genuinely cannot even make up that came my way.',
                'But I loved it. The busyness of maintaining a self-running system I could confidently say, "I built this shit from the ground up," was incredibly satisfying (mostly ground up; Roy built the foundation, which is the hardest part tbh). The confidence I had walking up onto any stage to present Hope For Hearing was profound. The recognition I had across the entirety of Toronto walking into any school with a chapter was crazy tuff.',
                'In other words, I was straight aura farming precisely because of how difficult it was to start, build, scale, and maintain such a huge, complex organization.',
                'Not only did we raise over $25,000 for charity and win over $3,500 in funding grants, but we also helped hundreds of students meet their 40-hour volunteer requirement, gave 24 chapter heads invaluable leadership experience they\'ll carry for the rest of their lives, and genuinely raised awareness about hearing loss. The number of conversations I had with people who had shared experiences of knowing somebody with hearing loss has permanently changed how I listen and empathize with others.',
                "Now, as I look back on this whole experience, I realize how much Hope For Hearing has shaped me as a person, a friend, a leader, and a visionary. But at the end of the day, none of this would have happened without that one act of kindness from Roy offering me his coat that one random day. And for that, I'll be quite indebted to Roy for a long-ass time."
            ]
        },
        facts: [
            { label: 'Won in funding grants', value: '$3,500+' }
        ],
        list: [
            {
                title: 'Milestones',
                items: [
                    'Dec 2022: Founded in Toronto (Roy meets Daniel at Davisville Station)',
                    'Jan 2023: Partnered officially with Sunnybrook Hospital',
                    'Sep 2023: Partnered officially with CHHA (Canadian Hard of Hearing Association)',
                    'Dec 2023: Reached the $10,000 fundraising goal',
                    'Aug 2024: Expanded to 12 official high school chapters across Canada',
                    'Jun 2025: Passed $25,000 raised'
                ]
            },
            {
                title: 'Funding grants won',
                items: [
                    'Youth Impact Challenge, $1,000',
                    'Ingenious+ Youth Innovation Award, $1,000',
                    'IdeAction Global Pitch Competition, $1,500'
                ]
            }
        ],
        links: [{ label: 'Hope For Hearing on Instagram', href: 'https://www.instagram.com/hopeforhearing/' }],
        // wide photos full width; the two tall ones side by side
        gallery: 'stack',
        images: [
            { alt: 'Hope For Hearing photo', slot: 'shirt/gallery' },
            { alt: 'Hope For Hearing photo', slot: 'shirt/gallery' },
            { alt: 'Hope For Hearing photo', slot: 'shirt/gallery' },
            { alt: 'Hope For Hearing photo', slot: 'shirt/gallery' }
        ]
    }
});
