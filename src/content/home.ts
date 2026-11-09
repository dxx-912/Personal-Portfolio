import type { Entry } from './types';

// Home bedroom: everything personal. Keyed by interactable id (see src/rooms/home.ts).
// Never invent facts. Unknowns are "[TODO: ...]" and are listed in TODO_ASSETS.md.

export const homeContent: Record<string, Entry> = {
    window: {
        id: 'window',
        prompt: 'Window, North York',
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
            { alt: 'North York photo 1' },
            { alt: 'North York photo 2' },
            { alt: 'North York photo 3' }
        ]
    },

    shelf: {
        id: 'shelf',
        prompt: 'Shelf, rowing, awards, anime',
        plainGroup: 'personal',
        title: 'The shelf',
        subtitle: 'Pick a tier.',
        tabStyle: 'shelf',
        tabs: [
            {
                id: 'rowing',
                title: 'Rowing',
                subtitle: 'High school varsity',
                body: [
                    'We won the national rowing championship.',
                    '[TODO: boat, year, and a line on what rowing was like]'
                ],
                gallery: 'grid',
                images: [{ alt: 'Rowing photo 1' }, { alt: 'Rowing photo 2' }]
            },
            {
                id: 'awards',
                title: 'Awards',
                subtitle: 'Three plaques',
                list: [{
                    items: [
                        'DECA Provincial Champion',
                        'FBLA Business Management National Champion at CNLC',
                        'FBLA International 6th Place at NLC'
                    ]
                }],
                gallery: 'grid',
                images: [
                    { alt: 'DECA Provincial Champion plaque' },
                    { alt: 'FBLA Business Management National Champion plaque' },
                    { alt: 'FBLA International 6th Place plaque' }
                ]
            },
            {
                id: 'anime',
                title: 'Anime and webtoons',
                subtitle: 'Favourites',
                list: [
                    { title: 'Anime', items: ['Attack on Titan'] },
                    { title: 'Webtoons', items: ['Sweet Home', 'Lookism', 'Solo Leveling'] }
                ]
            }
        ]
    },

    pullup: {
        id: 'pullup',
        prompt: 'Pull up tower, exercise',
        plainGroup: 'personal',
        title: 'Exercise',
        body: [
            'I lift and sprint or run almost every day.',
            '[TODO: a line on why, or a current goal]'
        ],
        gallery: 'grid',
        images: [
            { alt: 'Muscle up', caption: 'Muscle up' },
            { alt: 'Trap bar deadlift', caption: 'Trap bar deadlift' },
            { alt: 'Physique photo' }
        ]
    },

    laptop: {
        id: 'laptop',
        prompt: 'Laptop, acting',
        plainGroup: 'personal',
        title: 'Acting',
        body: [
            'I used to be a professional actor. My peak was acting in a music video with 70M views.',
            '[TODO: the song and artist, and my part in it]'
        ],
        videos: [{ kind: 'youtube', title: 'The music video' /* id: '[TODO: YouTube id]' */ }]
    },

    headphones: {
        id: 'headphones',
        prompt: 'Headphones, music',
        plainGroup: 'personal',
        title: 'Dubstep and EDM',
        body: ['I love dubstep and EDM.', '[TODO: why, in a sentence or two]'],
        videos: [{ kind: 'spotify', title: 'My dubstep playlist' /* id: 'playlist/[TODO]' */ }],
        links: [{ label: 'My dubstep playlist on Spotify' /* href: '[TODO]' */ }]
    },

    nightstand: {
        id: 'nightstand',
        prompt: 'Family photo',
        plainGroup: 'personal',
        title: 'Family',
        body: ['[TODO: a few sentences about my parents and my sister]'],
        gallery: 'grid',
        images: [
            { alt: 'Family photo 1' },
            { alt: 'Family photo 2' },
            { alt: 'Family photo 3' }
        ]
    },

    piano: {
        id: 'piano',
        prompt: 'Piano',
        plainGroup: 'personal',
        title: 'Piano',
        subtitle: '[TODO: exact RCM ARCT credential name]',
        body: [
            'I played piano for 12 years.',
            '[TODO: a precise, verifiable description of the ARCT credential]'
        ],
        gallery: 'grid',
        images: [{ alt: 'Recital photo 1' }, { alt: 'Recital photo 2' }]
    },

    baking: {
        id: 'baking',
        prompt: 'Baked goods, cooking',
        plainGroup: 'personal',
        title: 'Baking and cooking',
        body: ['I love baking and cooking for my family.', '[TODO: favourite things to make]'],
        gallery: 'grid',
        images: [
            { alt: 'Food photo 1' },
            { alt: 'Food photo 2' },
            { alt: 'Daniel cooking' },
            { alt: 'Daniel baking' }
        ]
    },

    cat: {
        id: 'cat',
        prompt: 'Cat',
        plainGroup: 'personal',
        title: 'My cat',
        subtitle: '[TODO: his name]',
        body: [
            '[TODO: how we got him]',
            '[TODO: his personality]'
        ],
        gallery: 'grid',
        images: [{ alt: 'Cat photo 1' }, { alt: 'Cat photo 2' }, { alt: 'Cat photo 3' }]
    },

    longboard: {
        id: 'longboard',
        prompt: 'Longboard',
        plainGroup: 'personal',
        title: 'Longboard build',
        body: [
            'I built this longboard. It was originally supposed to be electric.',
            '[TODO: the build process, 2 to 3 sentences]',
            '[TODO: how the battery got destroyed]'
        ],
        gallery: 'grid',
        images: [
            { alt: 'Building the longboard' },
            { alt: 'Soldering' },
            { alt: 'The destroyed battery' }
        ]
    }
};
