import type { Entry, Section } from './types';
import { resolveSection, withMedia } from './media';

// Top shelf, "Sports". Two stories: the game's shelf tier shows both, the portfolio view shows each on its own.
export const rowing: Section = resolveSection({
    id: 'rowing',
    title: 'Rowing',
    short: 'Rowing, national champ',
    subtitle: 'High school varsity',
    body: [
        'Rowing: we won the national rowing championship.',
        '[TODO: boat, year, and a line on what rowing was like]'
    ],
    gallery: 'grid',
    images: [{ alt: 'Rowing photo 1', slot: 'shelf/rowing' }, { alt: 'Rowing photo 2', slot: 'shelf/rowing' }]
});

export const volleyball: Section = resolveSection({
    id: 'volleyball',
    title: 'Beach volleyball',
    short: 'Beach volleyball',
    subtitle: 'In my free time',
    body: [
        'Beach volleyball: I play it in my free time.',
        '[TODO: where you play, who with, and why you love it]'
    ],
    gallery: 'grid',
    images: [{ alt: 'Beach volleyball photo 1', slot: 'shelf/volleyball' }, { alt: 'Beach volleyball photo 2', slot: 'shelf/volleyball' }]
});

// Home bedroom (North York, Toronto): everything personal. Keyed by interactable id (see src/rooms/home.ts).
// Never invent facts. Unknowns are "[TODO: ...]" and are listed in TODO_ASSETS.md.

export const homeContent: Record<string, Entry> = withMedia({
    // 1. Window with the Toronto skyline
    window: {
        id: 'window',
        short: 'North York',
        prompt: 'North York',
        plainGroup: 'personal',
        title: 'North York',
        subtitle: 'Toronto',
        body: [
            'I was born and raised in North York, Toronto, and lived there for 18 years before I left for college.',
            'It means a lot to me. All through high school I went to the same library and the same cafe.',
            '[TODO: name the library and cafe, if you want]'
        ],
        gallery: 'grid',
        images: [
            { alt: 'North York photo 1', slot: 'window/gallery' },
            { alt: 'North York photo 2', slot: 'window/gallery' },
            { alt: 'North York photo 3', slot: 'window/gallery' }
        ]
    },

    // 2. Three tier shelf: rowing, awards, favorite reads
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
                body: [...rowing.body!, ...volleyball.body!],
                gallery: 'grid',
                images: [...rowing.images!, ...volleyball.images!]
            },
            {
                id: 'awards',
                title: 'Awards',
                subtitle: 'Middle shelf: three plaques',
                list: [{
                    items: [
                        'DECA Provincial Champion',
                        'FBLA Business Management National Champion at CNLC',
                        'FBLA International 6th Place at NLC'
                    ]
                }],
                gallery: 'grid',
                images: [
                    { alt: 'DECA Provincial Champion plaque', slot: 'shelf/deca' },
                    { alt: 'FBLA Business Management National Champion plaque', slot: 'shelf/fbla-cnlc' },
                    { alt: 'FBLA International 6th Place plaque', slot: 'shelf/fbla-nlc' }
                ]
            },
            {
                id: 'reads',
                title: 'Favorite reads',
                subtitle: 'Bottom shelf',
                list: [
                    { title: 'Anime', items: ['Attack on Titan'] },
                    { title: 'Webtoons', items: ['Lookism', 'Sweet Home', 'Solo Levelling'] }
                ]
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
            'I lift and sprint or run almost every day.',
            '[TODO: a line on why, or a current goal]'
        ],
        gallery: 'grid',
        images: [
            { alt: 'Muscle up', caption: 'Muscle up', slot: 'pullup/muscle-up' },
            { alt: 'Trap bar deadlift', caption: 'Trap bar deadlift', slot: 'pullup/deadlift' },
            { alt: 'Physique photo', slot: 'pullup/physique' }
        ]
    },

    // 4. Big black speaker (E toggles a short loop)
    speaker: {
        id: 'speaker',
        short: 'Music',
        prompt: 'Music',
        plainGroup: 'personal',
        title: 'Music',
        body: [
            'I listen to a bit of everything: dubstep, EDM, classical, R&B, and hip hop.',
            '[TODO: why you love it, and what you have on repeat right now]',
            "Press E at the speaker for one of my favourites: the coda of Rachmaninoff's Piano Concerto No. 2, played by Valentina Lisitsa."
        ],
        videos: [{ kind: 'spotify', title: 'My lofi playlist', id: 'playlist/0vvXsWCC9xrXsKd4FyS8kM', url: 'https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM' }],
        links: [
            { label: 'My lofi playlist on Spotify', href: 'https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM' },
            { label: 'My dubstep playlist on Spotify' /* href: '[TODO]' */ }
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
            '[TODO: 2 to 3 sentences on why you love photography]',
            '[TODO: what you like to shoot, and with what]'
        ],
        gallery: 'grid',
        images: [
            { alt: 'Photo by Daniel 1', caption: '[TODO: caption]', slot: 'camera/gallery' },
            { alt: 'Photo by Daniel 2', caption: '[TODO: caption]', slot: 'camera/gallery' },
            { alt: 'Photo by Daniel 3', caption: '[TODO: caption]', slot: 'camera/gallery' },
            { alt: 'Photo by Daniel 4', caption: '[TODO: caption]', slot: 'camera/gallery' }
        ]
    },

    // 6. Nightstand with the lamp and the family photo
    nightstand: {
        id: 'nightstand',
        short: 'Family',
        prompt: 'Family',
        plainGroup: 'personal',
        title: 'Family',
        body: ['[TODO: a few sentences about my parents and my sister]'],
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
        subtitle: '[TODO: exact RCM ARCT credential name]',
        body: [
            'I played piano for 12 years.',
            '[TODO: a precise, verifiable description of the ARCT credential]'
        ],
        gallery: 'grid',
        images: [{ alt: 'Recital photo 1', slot: 'piano/recitals' }, { alt: 'Recital photo 2', slot: 'piano/recitals' }]
    },

    // 8. Apple crisp pie with a slice served
    pie: {
        id: 'pie',
        short: 'Baking',
        prompt: 'Baking',
        plainGroup: 'personal',
        title: 'Baking and cooking',
        body: ['I love baking and cooking for my family.', '[TODO: favourite things to make]'],
        gallery: 'grid',
        images: [
            { alt: 'Food photo 1', slot: 'pie/food' },
            { alt: 'Food photo 2', slot: 'pie/food' },
            { alt: 'Daniel cooking', slot: 'pie/cooking' },
            { alt: 'Daniel baking', slot: 'pie/baking' }
        ]
    },

    // 9. The cat (E pets him)
    cat: {
        id: 'cat',
        short: 'Cat dad',
        prompt: 'About Fluffy',
        plainGroup: 'personal',
        title: 'About Fluffy',
        subtitle: 'Fluffy',
        body: [
            '[TODO: how we got him]',
            '[TODO: his personality]'
        ],
        gallery: 'grid',
        images: [{ alt: 'Cat photo 1', slot: 'cat/gallery' }, { alt: 'Cat photo 2', slot: 'cat/gallery' }, { alt: 'Cat photo 3', slot: 'cat/gallery' }]
    },

    // 10. Longboard (E rides it)
    longboard: {
        id: 'longboard',
        short: 'Built a longboard',
        prompt: 'The build',
        plainGroup: 'personal',
        title: 'Longboard build',
        body: [
            'I built this longboard. It was originally supposed to be electric.',
            '[TODO: the build process, 2 to 3 sentences]',
            '[TODO: how the battery got destroyed]'
        ],
        gallery: 'grid',
        images: [
            { alt: 'Building the longboard', slot: 'longboard/building' },
            { alt: 'Soldering', slot: 'longboard/soldering' },
            { alt: 'The destroyed battery', slot: 'longboard/battery' }
        ]
    }
});
