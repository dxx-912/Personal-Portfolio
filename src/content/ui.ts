import type { Entry } from './types';
import { profile } from './profile';

// All interface copy lives here, not in scenes.
export const ui = {
    wakeKeys: 'Press F to wake up',
    wakeTouch: 'Tap to wake up',
    controlsKeys: 'WASD to move. E to do things, F to learn more. The door on the right goes home.',
    controlsTouch: 'Use the stick or tap to walk. The door on the right goes home.',
    found: (n: number, total: number) => `Found ${n} of ${total}`,

    /** E verbs, by action. */
    verbs: {
        sit: 'Sit',
        stand: 'Stand up',
        outfit: 'Change outfit',
        pullup: 'Pull ups',
        musicOn: 'Play music',
        musicOff: 'Stop music',
        snap: 'Snap photo',
        piano: 'Play',
        pet: 'Pet',
        ride: 'Ride',
        dismount: 'Hop off'
    },
    /** Mobile button label for F. */
    infoButton: 'Info',
    actButton: 'Do',
    keyAct: 'E',
    keyInfo: 'F',

    doorToHome: 'Home, Toronto',
    doorToDorm: 'Back to UCLA',
    roomTitles: { dorm: 'Rieber Hall, UCLA', home: 'North York, Toronto' },
    minimapLabel: (room: string) => `Map. You are in ${room}. Click the other room to walk there.`,

    aboutButton: 'About me (I)',
    rotateHint: 'Turn your phone sideways for a bigger room.',
    plainVersion: 'Plain version',
    pauseTitle: 'Paused',
    resume: 'Resume',
    soundOn: 'Sound: on',
    soundOff: 'Sound: off',
    soundIsOff: 'Sound is off.',
    turnSoundOn: 'Turn it on',
    startOver: 'Start over',
    close: 'Close',
    hint: 'H shows anything you have not found yet. I opens About me.',
    todoImage: 'Photo coming soon',
    todoVideo: 'Video coming soon',
    loadVideo: 'Play video',

    meow: 'meow',
    purr: 'prrr...',
    pullupCount: (n: number) => `${n}`,
    pullupDone: (n: number) => (n > 0 ? `Nice! ${n} reps` : 'Maybe later'),
    pullupHint: 'Mash E!',
    pullupHintTouch: 'Tap fast!',
    outfitPuff: 'Fresh fit',
    snapSave: 'Save photo',
    snapTitle: 'Snapshot',
    pianoTitle: 'Piano',
    pianoHint: 'Click the keys, or press 1 to 8. Esc to stop.',
    readStory: 'Read the story',
    homeBedBusy: 'Not tired yet.'
};

export const completion: Entry = {
    id: 'complete',
    prompt: '',
    plainGroup: 'intro',
    title: "Thanks for exploring, let's talk",
    body: ["You found all 19. I'd love to hear from you."],
    links: profile.links
};
