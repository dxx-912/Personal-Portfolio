import type { Entry } from './types';
import { profile } from './profile';

// All interface copy lives here, not in scenes.
export const ui = {
    wakeKeys: 'Press F to wake up',
    wakeTouch: 'Tap to wake up',
    controlsKeys: 'WASD to move, F to interact. Or click anything.',
    controlsTouch: 'Use the stick to move, or tap anything to walk to it.',
    found: (n: number, total: number) => `Found ${n} of ${total}`,
    promptKey: 'F',
    promptTouch: 'Tap',
    doorToHome: 'Door, to home',
    doorToDorm: 'Door, to the dorm',
    homeBed: 'Not tired yet.',
    rotateHint: 'Turn your phone sideways for a bigger room.',
    plainVersion: 'Plain version',
    pauseTitle: 'Paused',
    resume: 'Resume',
    soundOn: 'Sound: on',
    soundOff: 'Sound: off',
    startOver: 'Start over',
    close: 'Close',
    hint: 'H shows anything you have not found yet.',
    todoImage: 'Photo coming soon',
    todoVideo: 'Video coming soon',
    loadVideo: 'Play video',
    roomNames: { dorm: 'UCLA dorm', home: 'Home, North York' }
};

export const completion: Entry = {
    id: 'complete',
    prompt: '',
    plainGroup: 'intro',
    title: "Thanks for exploring, let's talk",
    body: ["You found all 18. I'd love to hear from you."],
    links: profile.links
};
