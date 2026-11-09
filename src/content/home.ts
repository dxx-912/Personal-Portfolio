import type { Entry } from './types';

// Home bedroom (North York, Toronto): everything personal. Keyed by interactable id (see src/rooms/home.ts).
// Never invent facts. Unknowns are "[TODO: ...]" and are listed in TODO_ASSETS.md.

export const homeContent: Record<string, Entry> = {
    // 1. Window with the Toronto skyline
    window: {
        id: 'window',
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
            { alt: 'North York photo 1' },
            { alt: 'North York photo 2' },
            { alt: 'North York photo 3' }
        ]
    },

    // 2. Three tier shelf: rowing, awards, favorite reads
    shelf: {
        id: 'shelf',
        prompt: 'The shelf',
        plainGroup: 'personal',
        title: 'The shelf',
        plainTitle: 'Rowing, awards, and favorite reads',
        subtitle: 'Pick a tier.',
        tabStyle: 'shelf',
        tabs: [
            {
                id: 'rowing',
                title: 'Rowing',
                subtitle: 'High school varsity. Top shelf: the trophy and the oar.',
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
                    { alt: 'DECA Provincial Champion plaque' },
                    { alt: 'FBLA Business Management National Champion plaque' },
                    { alt: 'FBLA International 6th Place plaque' }
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
        prompt: 'Exercise',
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

    // 4. Big black speaker (E toggles a short loop)
    speaker: {
        id: 'speaker',
        prompt: 'Music',
        plainGroup: 'personal',
        title: 'Dubstep and EDM',
        body: ['I love dubstep and EDM.', '[TODO: why, in a sentence or two]'],
        videos: [{ kind: 'spotify', title: 'My dubstep playlist' /* id: 'playlist/[TODO]' */ }],
        links: [{ label: 'My dubstep playlist on Spotify' /* href: '[TODO]' */ }]
    },

    // 5. Camera on the work table (E snaps a photo of the room)
    camera: {
        id: 'camera',
        prompt: 'Photography',
        plainGroup: 'personal',
        title: 'Photography',
        body: [
            '[TODO: 2 to 3 sentences on why you love photography]',
            '[TODO: what you like to shoot, and with what]'
        ],
        gallery: 'grid',
        images: [
            { alt: 'Photo by Daniel 1', caption: '[TODO: caption]' },
            { alt: 'Photo by Daniel 2', caption: '[TODO: caption]' },
            { alt: 'Photo by Daniel 3', caption: '[TODO: caption]' },
            { alt: 'Photo by Daniel 4', caption: '[TODO: caption]' }
        ]
    },

    // 6. Nightstand with the lamp and the family photo
    nightstand: {
        id: 'nightstand',
        prompt: 'Family',
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

    // 7. Digital piano (E plays it)
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

    // 8. Apple crisp pie with a slice served
    pie: {
        id: 'pie',
        prompt: 'Baking',
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

    // 9. The cat (E pets him)
    cat: {
        id: 'cat',
        prompt: 'About him',
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

    // 10. Longboard (E rides it)
    longboard: {
        id: 'longboard',
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
            { alt: 'Building the longboard' },
            { alt: 'Soldering' },
            { alt: 'The destroyed battery' }
        ]
    }
};
