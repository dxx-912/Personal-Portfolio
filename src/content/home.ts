import type { Entry, Section } from './types';
import { resolveSection, withMedia } from './media';

// Copy from CONTENT_FINAL.md sections 3 and 4 (content pass 2). Daniel's casual voice is intentional:
// only spelling, grammar, and the fixes listed there. Fun facts show on the quick view's flipped boxes only.

// Top shelf, "Sports". Two stories: the game's shelf tier shows both, the portfolio view shows each on its own.
export const rowing: Section = resolveSection({
    id: 'rowing',
    title: 'Rowing',
    short: 'Rowing, national champ',
    subtitle: 'High school junior varsity',
    body: ["Rowed for two years on my high school's junior varsity team. Seats 1 and 2 (bow pair); can row port and starboard."],
    list: [{
        title: 'Gold medals',
        items: [
            'CSSRA National Championships, Novice 8+',
            "Mother's Day Regatta, Novice 8+",
            "Mother's Day Regatta, Junior 8+",
            'South Niagara Invitational, Novice 8+',
            'South Niagara Invitational, Junior 8+'
        ]
    }],
    funFact: 'Won the national championships! (Novice 8+, CSSRA)',
    gallery: 'grid',
    images: [{ alt: 'Rowing photo 1', slot: 'shelf/rowing', captionFromFile: true }, { alt: 'Rowing photo 2', slot: 'shelf/rowing', captionFromFile: true }],
    videos: [{ kind: 'mp4', title: '"The Senator" crew that won nationals (I\'m bow seat)', slot: 'shelf/rowing-video', inGallery: true }]
});

const volleyballLine = "I larp this. I'm terrible, but I love to play.";

export const volleyball: Section = resolveSection({
    id: 'volleyball',
    title: 'Beach volleyball',
    short: 'Beach volleyball',
    subtitle: 'In my free time',
    body: [volleyballLine],
    funFact: volleyballLine
});

// Home bedroom (North York, Toronto): everything personal. Keyed by interactable id (see src/rooms/home.ts).
// Never invent facts. Unknowns are "[TODO: ...]" and are listed in TODO_ASSETS.md.

export const homeContent: Record<string, Entry> = withMedia({
    // 2. Three tier shelf: sports, awards, favorite reads
    shelf: {
        id: 'shelf',
        prompt: 'The shelf',
        plainGroup: 'personal',
        title: 'The shelf',
        plainTitle: 'Sports, awards, and favorite reads',
        subtitle: 'Pick a tier.',
        tabStyle: 'shelf',
        tabs: [
            {
                id: 'sports',
                title: 'Sports',
                subtitle: 'Top shelf: the rowing trophy, the oar blade, and a beach volleyball.',
                body: rowing.body,
                list: [...rowing.list!, { title: 'Beach volleyball', style: 'plain', items: [volleyballLine] }],
                gallery: 'grid',
                images: rowing.images,
                videos: rowing.videos
            },
            {
                id: 'awards',
                title: 'Awards',
                subtitle: 'Middle shelf: three plaques and a gold tie',
                list: [{
                    items: [
                        'DECA Provincial Champion, Marketing Communications Series',
                        'FBLA National Champion (CNLC), Business Management',
                        'FBLA International 6th place (NLC), Business Management',
                        'Gold Service Tie, for completing 200+ volunteer hours'
                    ]
                }],
                gallery: 'grid',
                images: [
                    { alt: 'DECA Provincial Champion plaque', slot: 'shelf/deca', captionFromFile: true },
                    { alt: 'FBLA Business Management National Champion plaque', slot: 'shelf/fbla-cnlc', captionFromFile: true },
                    { alt: 'FBLA International 6th Place plaque', slot: 'shelf/fbla-nlc', captionFromFile: true }
                ]
            },
            {
                id: 'reads',
                title: 'Favorite reads',
                subtitle: 'Bottom shelf',
                list: [
                    { title: 'Anime', style: 'plain', items: ['Attack on Titan: Have only watched one anime ever. It was AOT, and I loved it.'] },
                    {
                        title: 'Webtoons',
                        style: 'plain',
                        items: [
                            'Lookism: Been reading this webtoon every Sunday for over 10 years. The first ~200 episodes were really good.',
                            "Sweet Home: Insanely good character development. I've reread it maybe 8 times now and tear up every time at the ending.",
                            'Solo Levelling: Super fun power fantasy story with a pretty interesting plot.'
                        ]
                    }
                ],
                gallery: 'grid',
                images: [{ alt: 'Daniel recreating a scene from Attack on Titan', slot: 'shelf/anime', captionFromFile: true }]
            }
        ]
    },

    // 3. Pull up tower (E does pull ups)
    pullup: {
        id: 'pullup',
        short: 'Lift and sprint',
        prompt: 'Exercise',
        plainGroup: 'personal',
        title: 'Exercise',
        body: [
            "Currently trying to stick to a pretty intense routine: push, pull, legs, chest and back, arms, rest, sprints or long runs. Not the most consistent, but I'm getting there.",
            'Currently trying to hit 2 plates before the end of 2026 and learn a handstand.'
        ],
        // PRs as small stat tiles
        facts: [
            { label: 'Bench', value: '205 lbs' },
            { label: 'Trap bar deadlift', value: '365 lbs' },
            { label: '5 km', value: '19:27' },
            { label: 'Unlocked', value: 'Muscle up, elbow lever' }
        ],
        funFact: 'Trap bar deadlift 365 lbs, bench 205 lbs.',
        gallery: 'scroll',
        images: [{ alt: 'Physique photo', slot: 'pullup/physique', captionFromFile: true }],
        videos: [
            { kind: 'mp4', title: 'Got my first muscle up freshman year', slot: 'pullup/muscle-up', inGallery: true },
            { kind: 'mp4', title: '365 lbs trap bar deadlift PR (senior year, I\'m washed now)', slot: 'pullup/deadlift', inGallery: true }
        ]
    },

    // 4. Big black speaker (E plays the featured track)
    speaker: {
        id: 'speaker',
        short: 'Music',
        prompt: 'Music',
        plainGroup: 'personal',
        title: 'Music',
        body: [
            'I love music and actually want to learn production one day. My favourite genres are definitely classical, dubstep, and hip hop.',
            "Press E at the speaker for one of my favourites: the coda of Rachmaninoff's Piano Concerto No. 2, played by Valentina Lisitsa."
        ],
        // artist names as plain text only: no album art, logos, or photos of the artists
        list: [
            { title: 'Top artists (according to Spotify)', style: 'chips', items: ['Rachmaninoff', 'Chopin', 'Kanye', 'Tyler, the Creator', 'Keshi', 'wave to earth'] },
            { title: 'Also love', style: 'chips', items: ['Sullivan King', 'Wooli', 'Riot', 'Knock2', 'Fakemink'] }
        ],
        funFact: 'My top 2 genres are classical and dubstep.',
        videos: [{ kind: 'spotify', title: 'My lofi playlist', id: 'playlist/0vvXsWCC9xrXsKd4FyS8kM', url: 'https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM' }],
        links: [
            { label: 'My dubstep playlist on Spotify', href: 'https://open.spotify.com/playlist/6u0kVAzcws3L14vrUz6ZqC' },
            { label: 'My lofi playlist on Spotify', href: 'https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM' }
        ]
    },

    // 5. Camera on the work table (E snaps a photo of the room)
    camera: {
        id: 'camera',
        short: 'Photography',
        prompt: 'Photography',
        plainGroup: 'personal',
        title: 'Photography',
        body: [
            'I love photography. Life moves so fast; time passes in the blink of an eye, but photography can capture a moment in its purest form.',
            "I use my parents' old Canon EOS Rebel and like taking well composed photos when travelling. I have hundreds of photos from travelling across China and Japan, but they haven't been colour graded in Lightroom yet. Check out some of my work below!"
        ],
        funFact: 'Check out my photography from Asia!',
        gallery: 'grid',
        images: [
            { alt: 'Photo by Daniel 1', slot: 'camera/gallery', captionFromFile: true },
            { alt: 'Photo by Daniel 2', slot: 'camera/gallery', captionFromFile: true },
            { alt: 'Photo by Daniel 3', slot: 'camera/gallery', captionFromFile: true }
        ]
    },

    // 6. Nightstand with the lamp and the family photo
    nightstand: {
        id: 'nightstand',
        short: 'Family',
        prompt: 'Family',
        plainGroup: 'personal',
        title: 'Family',
        body: [
            "My parents immigrated from China in 2002 and met at Queen's University. My sister is in her first year of high school and has been juggling a ton of extracurriculars."
        ],
        funFact: 'My #1 fans and supporters.',
        gallery: 'grid',
        images: [
            { alt: 'Family photo 1', slot: 'nightstand/gallery' },
            { alt: 'Family photo 2', slot: 'nightstand/gallery' },
            { alt: 'Family photo 3', slot: 'nightstand/gallery' }
        ]
    },

    // 7. Digital piano (E plays it)
    piano: {
        id: 'piano',
        short: 'Piano, ARCT',
        prompt: 'Piano',
        plainGroup: 'personal',
        title: 'Piano',
        subtitle: 'The Associate Diploma (ARCT) in Piano Performance and Harmony',
        body: ['Played piano for 12 years, from age 4 to 16, when I completed my ARCT diploma.'],
        list: [{
            title: 'My ARCT program',
            style: 'setlist',
            items: [
                'Bach, Partita in A minor (Fantasia, Sarabande, Gigue)',
                'Beethoven, Pathétique Sonata',
                'Chopin, Grande Valse Brillante',
                "Debussy, Reflets dans l'eau",
                'Tan Dun, Eight Memories in Watercolor'
            ]
        }],
        funFact: 'I have the ARCT diploma in Piano Performance.',
        gallery: 'grid',
        images: [{ alt: 'Recital photo 1', slot: 'piano/recitals', captionFromFile: true }, { alt: 'Recital photo 2', slot: 'piano/recitals', captionFromFile: true }]
    },

    // 8. Apple crisp pie with a slice served
    pie: {
        id: 'pie',
        short: 'Baking',
        prompt: 'Baking',
        plainGroup: 'personal',
        title: 'Baking and cooking',
        body: [
            "I'm a big back and I love eating, so naturally I love cooking and baking as well. I have a fire apple crisp recipe I make multiple times a year. I also make coke chicken and Thai curry chicken pretty often.",
            'Apart from that, I can cook up most simple dishes. Fried rice with whatever BS is in my fridge is my go to.'
        ],
        funFact: "I can cook up the best apple crisp you'll ever have.",
        gallery: 'scroll',
        images: [
            { alt: 'Food photo 1', slot: 'pie/food', captionFromFile: true },
            { alt: 'Food photo 2', slot: 'pie/food', captionFromFile: true }
        ]
    },

    // 9. The cat (E pets him)
    cat: {
        id: 'cat',
        short: 'Fluffy',
        prompt: 'About Fluffy',
        plainGroup: 'personal',
        title: 'About Fluffy',
        body: [
            'British longhair that we got back in 2021, in the middle of COVID. Funny because my mom was super against pets up until Fluffy, and now she loves him more than me, I swear.',
            "This cat is extremely fat, greedy, and selectively stupid. Typically, Fluffy is very ignorant and quiet, but he'll immediately start screaming and pull out every trick he knows for food. Generally he's very social and loves loafing or sleeping around people, but doesn't like prolonged physical touch. Fluffy is 6 years old now and fatter than ever."
        ],
        funFact: 'Fat and stupid.',
        gallery: 'grid',
        images: [{ alt: 'Cat photo 1', slot: 'cat/gallery' }, { alt: 'Cat photo 2', slot: 'cat/gallery' }, { alt: 'Cat photo 3', slot: 'cat/gallery' }]
    },

    // 10. Longboard (E rides it). Short version first, the full story behind "Read the whole story".
    longboard: {
        id: 'longboard',
        short: 'Built a longboard',
        prompt: 'The build',
        plainGroup: 'personal',
        title: 'Longboard build',
        // the story opens with its first two paragraphs; the rest sits behind "Read the whole story"
        more: {
            title: 'The build',
            intro: [
                'After receiving NO internship offers for my freshman summer, I decided not to chud around and build something that was 1. difficult, 2. useful, 3. interesting.',
                'Consequently, I decided to build an electric longboard. It was useful for getting to class at UCLA and was also pretty interesting. Unfortunately, this shit was way too difficult. I spent a full week sourcing every single part I needed with the endless list of required compatible specifications, primarily from Chinese manufacturers. I also travelled across every end of Toronto to source the different longboard parts I needed.'
            ],
            label: 'Read the whole story',
            body: [
                'I actually ended up building a fully functional longboard that rides really smoothly. Unfortunately, the specs between the motor and battery did not end up being compatible, so I decided to learn how to solder off YouTube, cut the wiring, and splice them myself.',
                'This was a terrible mistake.',
                "With a charged battery and fully exposed wires, I think I short-circuited the wiring, which burned a mark on my table and absolutely fried the motor and battery. I'm really lucky it didn't burn my skin, because I was holding the wires when it happened.",
                "Subsequently, my mom got really mad at my idiocy and told me to stop before I burn the house down. I'm still hoping to finish this project someday, since I have a really intuitive understanding of how electric longboards work inside out now (check out the Master Google Doc I used for this project below), but this time I'll be sure to source more legitimate parts. At least I have a pretty sick longboard now."
            ]
        },
        links: [{ label: 'My Master Google Doc', href: 'https://docs.google.com/document/d/1GeFjlEI0BBgI-yIhaeFw6F2dBhx2u-wVWmrTyLuOT_o/edit?usp=sharing' }],
        funFact: 'Originally supposed to be electric, before I put a hole in my table.',
        gallery: 'grid',
        images: [
            { alt: 'Building the longboard', slot: 'longboard/building' },
            { alt: 'Soldering', slot: 'longboard/soldering' },
            { alt: 'The destroyed battery', slot: 'longboard/battery' }
        ]
    }
});
