import type { Entry } from './types';
import { profile } from './profile';

// All interface copy lives here, not in scenes.
export const ui = {
    wakeKeys: 'Press F to wake up',
    wakeTouch: 'Tap to wake up',
    controlsKeys: 'WASD to move. E to do things, F to learn more. The door on the right goes home.',
    controlsTouch: 'Use the stick or tap to walk. The door on the right goes home.',
    found: (n: number, total: number) => `Found ${n} of ${total}`,
    foundLabel: 'Found',
    /** Everything you can press E for (sleeping aside). They never count toward the 18. */
    secretsLabel: 'Secrets',
    secrets: (n: number, total: number) => `Secrets ${n} of ${total}`,
    secretFound: (name: string, n: number, total: number) => `Secret found: ${name} (${n}/${total})`,
    secretNames: {
        beanbag: 'Beanbag', closet: 'Outfit change', fridge: 'Red Bull', basketball: 'Basketball',
        pullup: 'Pull ups', speaker: 'Speaker', camera: 'Camera', piano: 'Piano', pie: 'Apple crisp',
        cat: 'Fluffy', longboard: 'Longboard', phone: 'Instagram'
    } as Record<string, string>,
    soundBtn: (on: boolean) => (on ? 'Sound on' : 'Sound off'),
    musicBtn: (on: boolean) => (on ? 'Music on' : 'Music off'),
    pauseBtn: 'Pause',

    /** The About me panel (src/ui/about.ts). The counts come from the item list and the secrets list. */
    about: {
        headline: "Hi, I'm Daniel.",
        howTitle: 'How to play',
        keys: [
            { keys: ['W', 'A', 'S', 'D'], label: 'Move' },
            { keys: ['F'], label: 'Learn more' },
            { keys: ['E'], label: 'Interact' },
            { keys: [], mouse: true, label: 'Click to walk' }
        ] as { keys: string[]; mouse?: boolean; label: string }[],
        /** Same, on phones and tablets: the joystick and the two round buttons. */
        touchKeys: [
            { keys: ['Joystick'], label: 'Move' },
            { keys: ['Info'], label: 'Learn more' },
            { keys: ['Do'], label: 'Interact' },
            { keys: [], label: 'Tap to walk' }
        ] as { keys: string[]; mouse?: boolean; label: string }[],
        rooms: 'UCLA dorm = professional stuff. Toronto bedroom = personal life.',
        counts: (stories: number, secrets: number, touch = false) => `Find all ${stories} items that represent me (${touch ? 'Info' : 'F'}) and ${secrets} interactions (${touch ? 'Do' : 'E'}) --> ex. Try shooting the basketball!`,
        recruiters: 'For any recruiters - check out the quick view version of this portfolio. Or play the full game if you have time.',
        start: 'Start exploring',
        quick: 'No time? Quick view'
    },

    /** E verbs, by action. */
    verbs: {
        sit: 'Sit',
        stand: 'Stand up',
        outfit: 'Change outfit',
        pullup: 'Pull ups',
        musicOn: 'Play music',
        musicOff: 'Stop music',
        eat: 'Eat',
        drink: 'Red Bull',
        nap: 'Sleep',
        snap: 'Snap photo',
        piano: 'Play',
        pet: 'Pet',
        ride: 'Ride',
        dismount: 'Hop off',
        goIn: 'Go in',
        pickup: 'Pick up',
        drop: 'Drop',
        shoot: 'Shoot (hold)',
        shootTouch: 'Shoot',
        dunk: 'Dunk',
        phone: 'Check phone'
    },
    /** Mobile button label for F. */
    infoButton: 'Info',
    actButton: 'Do',
    keyAct: 'E',
    keyInfo: 'F',
    keyDunk: 'R',

    doorToHome: 'Home, Toronto',
    doorToDorm: 'Back to UCLA',
    roomTitles: { dorm: 'Rieber Hall, UCLA', home: 'North York, Toronto' },
    minimapLabel: (room: string) => `Map. You are in ${room}. Click the other room to walk there.`,

    aboutButton: 'About me (I)',
    rotateHint: 'Turn your phone sideways for a bigger room.',
    /**
     * Link to the portfolio view (top left of the game and in the pause menu).
     * Alternatives: 'Recruiter mode (no game, promise)', 'Skip the game :(', 'In a rush? Read it instead'.
     */
    quickView: 'No time to play? Quick view',
    quickViewHref: '/portfolio',
    phoneSuggest: 'On a phone? The quick view might be comfier.',
    phoneSuggestGo: 'Quick view',
    phoneSuggestStay: 'Keep playing',
    pauseTitle: 'Paused',
    resume: 'Resume',
    soundOn: 'Sound: on',
    soundOff: 'Sound: off',
    soundIsOff: 'Sound is off.',
    musicOn: 'Music: on',
    musicOff: 'Music: off',
    noTrack: 'No track loaded yet',
    nowPlaying: (title: string) => `Now playing: ${title}`,
    turnSoundOn: 'Turn it on',
    startOver: 'Start over',
    close: 'Close',
    hint: 'H shows anything you have not found yet. I opens About me.',
    todoImage: 'Photo coming soon',
    todoVideo: 'Video coming soon',
    readMore: 'Read the whole story',
    loadVideo: 'Play video',

    ballHint: 'Hold Space, let go to shoot',
    ballHintTouch: 'Hold the button, let go to shoot',
    tally: (makes: number, attempts: number) => `${makes} for ${attempts}`,
    meow: 'meow',
    meowLoud: 'MEOW!',
    purr: 'prrr...',
    yum: 'yum!',
    drinkLine: 'Caffeine 7/7. Locked in.',
    napLine: 'Sleep 8/8. Fully recharged.',
    /** Little lines from the stats system (CONTENT_FINAL.md 1.3). They rotate in order. */
    needs: {
        caffeine: ['where can I get a Red Bull...', 'is there any Red Bull left?...'],
        tired: ["I'm so tired", 'I want to take a nap...'],
        mustSleep: 'I need to sleep'
    },
    pieGone: 'All gone. More next time.',
    pullupCount: (n: number) => `${n}`,
    pullupDone: (n: number) => (n > 0 ? `Nice! ${n} reps` : 'Maybe later'),
    pullupHint: 'Mash E!',
    pullupHintTouch: 'Tap fast!',
    outfitPuff: 'Fresh fit',
    /** Closet outfits, in the order the closet cycles them (src/game/Player.ts OUTFITS). */
    outfits: ['White tee', 'Black Stussy shirt', 'UCLA shirt', 'White tank top', 'Full suit'],
    snapSave: 'Save photo',
    snapTitle: 'Snapshot',
    pianoTitle: 'Piano',
    phoneTitle: 'Instagram',
    phoneLine: 'Come say hi on Instagram.',
    phoneOpen: 'Open Instagram',
    phoneInfo: 'Instagram',
    pianoHint: 'Click the keys, or play A S D F G H J K and the black keys W E T Y U (1 to 8 work too). Esc to stop.'
};

export const completion: Entry = {
    id: 'complete',
    prompt: '',
    plainGroup: 'intro',
    title: 'You found all 18',
    body: ["Thanks for exploring, let's connect sometime!"],
    links: profile.links
};
