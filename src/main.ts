import Phaser from 'phaser';
import './fonts.css';
import './ui/styles.css';
import { Boot } from './scenes/Boot';
import { Room } from './scenes/Room';
import { initHud } from './ui/hud';
import { initInput } from './ui/input';

initInput();
initHud();

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
    scene: [Boot, Room]
});

game.events.once(Phaser.Core.Events.READY, () => {
    const canvas = game.canvas;
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-hidden', 'true');
});

// Handy for debugging in the console.
(window as unknown as { __game: Phaser.Game }).__game = game;
