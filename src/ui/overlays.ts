// Small interactive overlays: the playable piano and the camera snapshot polaroid.

import { ui } from '../content';
import { state } from '../state';
import { duck, pianoNote, sfx } from '../audio';
import { openOverlay } from './panel';
import { esc } from './render';

// One octave, C4 to C5. Number keys 1 to 8 play the white keys.
const WHITE = [
    { n: 'C', f: 261.63 }, { n: 'D', f: 293.66 }, { n: 'E', f: 329.63 }, { n: 'F', f: 349.23 },
    { n: 'G', f: 392.0 }, { n: 'A', f: 440.0 }, { n: 'B', f: 493.88 }, { n: 'C', f: 523.25 }
];
// Black keys sit after these white key indexes.
const BLACK = [{ after: 0, f: 277.18 }, { after: 1, f: 311.13 }, { after: 3, f: 369.99 }, { after: 4, f: 415.3 }, { after: 5, f: 466.16 }];

export function openPiano(onClose: () => void) {
    const soundRow = () => state.sound ? '' : `<p class="sound-off">${esc(ui.soundIsOff)} <button type="button" class="link sound-on">${esc(ui.turnSoundOn)}</button></p>`;
    const body = `
        <p class="piano-hint">${esc(ui.pianoHint)}</p>
        <div class="sound-row">${soundRow()}</div>
        <div class="keys" role="group" aria-label="Piano keys">
            ${WHITE.map((k, i) => `<button type="button" class="key white" data-f="${k.f}" aria-label="${k.n}${i === 7 ? ' (high)' : ''}, key ${i + 1}"><span>${i + 1}</span></button>`).join('')}
            ${BLACK.map((k) => `<button type="button" class="key black" data-f="${k.f}" style="--at: ${k.after + 1}" aria-label="Sharp after ${WHITE[k.after].n}"></button>`).join('')}
        </div>`;
    duck('piano', true);
    const root = openOverlay({
        title: ui.pianoTitle, className: 'piano', body, onClose: () => { duck('piano', false); onClose(); }, focus: '.key.white',
        onKey: (e) => {
            const n = Number(e.key);
            if (n >= 1 && n <= 8) {
                e.preventDefault();
                play(root.querySelectorAll<HTMLButtonElement>('.key.white')[n - 1]);
                return true;
            }
            return false;
        }
    });
    const play = (b: HTMLButtonElement) => {
        pianoNote(Number(b.dataset.f));
        b.classList.add('down');
        window.setTimeout(() => b.classList.remove('down'), 160);
    };
    root.querySelectorAll<HTMLButtonElement>('.key').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); play(b); }));
    root.querySelectorAll<HTMLButtonElement>('.key').forEach((b) => b.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(b); }
    }));
    const wireSound = () => root.querySelector('.sound-on')?.addEventListener('click', () => {
        state.setSound(true);
        root.querySelector('.sound-row')!.innerHTML = soundRow();
        sfx('tick');
        root.querySelector<HTMLElement>('.key.white')?.focus();
    });
    wireSound();
}

/** Shows the snapshot as a polaroid with a save button. */
export function openSnapshot(dataUrl: string, onClose: () => void) {
    const stamp = new Date();
    const name = `daniels-room-${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, '0')}${String(stamp.getDate()).padStart(2, '0')}.png`;
    openOverlay({
        title: ui.snapTitle, className: 'snapshot', onClose, focus: '.save',
        body: `
            <figure class="polaroid">
                <img src="${esc(dataUrl)}" alt="A snapshot of the room as it looks right now" />
                <figcaption>${esc(stamp.toLocaleDateString())}</figcaption>
            </figure>
            <p class="links"><a class="link save" href="${esc(dataUrl)}" download="${esc(name)}">${esc(ui.snapSave)}</a></p>`
    });
}

/** Full screen white flash for the camera. */
export function flash(reduced: boolean) {
    const el = document.createElement('div');
    el.className = `flash${reduced ? ' soft' : ''}`;
    document.getElementById('ui-root')!.appendChild(el);
    window.setTimeout(() => el.remove(), 450);
}
