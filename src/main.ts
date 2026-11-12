import Phaser from 'phaser';
import './fonts.css';
import './ui/styles.css';
import { Boot } from './scenes/Boot';
import { Room } from './scenes/Room';
import { initHud } from './ui/hud';
import { initInput } from './ui/input';
import { initEmailCopy } from './ui/copyEmail';

initInput();
initHud();
initEmailCopy();

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#06050b',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    input: { keyboard: false },
    // Phaser's delta smoothing caps every frame at 1/60 s while the window is unfocused and for
    // 120 frames after any focus or tab change. Below 60 fps that runs the whole game clock (and
    // walking) in slow motion. Use the real frame time; Room.update clamps its own logic step.
    fps: { smoothStep: false },
    scene: [Boot, Room]
});

game.events.once(Phaser.Core.Events.READY, () => {
    const canvas = game.canvas;
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-hidden', 'true');
});

// Handy for debugging in the console.
(window as unknown as { __game: Phaser.Game }).__game = game;

// Backquote toggles a speed and frame rate overlay in dev builds only.
if (import.meta.env.DEV) import('./ui/debug').then((m) => m.initDebug(game));
