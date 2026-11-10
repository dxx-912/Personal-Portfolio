// Small interactive overlays: the playable piano and the camera snapshot polaroid.

import { profile, ui } from '../content';
import { state } from '../state';
import { duck, pianoNote, sfx } from '../audio';
import { openOverlay } from './panel';
import { esc } from './render';

// One octave, C4 to C5, on the standard computer piano layout: A S D F G H J K play the white keys,
// W E T Y U the black keys. Number keys 1 to 8 still play the white keys too.
const WHITE = [
    { n: 'C', f: 261.63, k: 'A' }, { n: 'D', f: 293.66, k: 'S' }, { n: 'E', f: 329.63, k: 'D' }, { n: 'F', f: 349.23, k: 'F' },
    { n: 'G', f: 392.0, k: 'G' }, { n: 'A', f: 440.0, k: 'H' }, { n: 'B', f: 493.88, k: 'J' }, { n: 'C', f: 523.25, k: 'K' }
];
// Black keys sit after these white key indexes.
const BLACK = [
    { after: 0, f: 277.18, n: 'C sharp', k: 'W' }, { after: 1, f: 311.13, n: 'D sharp', k: 'E' }, { after: 3, f: 369.99, n: 'F sharp', k: 'T' },
    { after: 4, f: 415.3, n: 'G sharp', k: 'Y' }, { after: 5, f: 466.16, n: 'A sharp', k: 'U' }
];

export function openPiano(onClose: () => void) {
    const soundRow = () => state.sound ? '' : `<p class="sound-off">${esc(ui.soundIsOff)} <button type="button" class="link sound-on">${esc(ui.turnSoundOn)}</button></p>`;
    const body = `
        <p class="piano-hint">${esc(ui.pianoHint)}</p>
        <div class="sound-row">${soundRow()}</div>
        <div class="keys" role="group" aria-label="Piano keys">
            ${WHITE.map((k, i) => `<button type="button" class="key white" data-f="${k.f}" data-k="${k.k}" aria-label="${k.n}${i === 7 ? ' (high)' : ''}, key ${k.k} or ${i + 1}"><span class="kl">${k.k}</span><span class="kn">${i + 1}</span></button>`).join('')}
            ${BLACK.map((k) => `<button type="button" class="key black" data-f="${k.f}" data-k="${k.k}" style="--at: ${k.after + 1}" aria-label="${k.n}, key ${k.k}"><span class="kl">${k.k}</span></button>`).join('')}
        </div>`;
    duck('piano', true);
    const root = openOverlay({
        title: ui.pianoTitle, className: 'piano', body, onClose: () => { duck('piano', false); onClose(); }, focus: '.key.white',
        onKey: (e) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return false;
            const n = Number(e.key);
            if (n >= 1 && n <= 8) {
                e.preventDefault();
                if (!e.repeat) play(root.querySelectorAll<HTMLButtonElement>('.key.white')[n - 1]);
                return true;
            }
            const letter = e.code.startsWith('Key') ? e.code.slice(3) : '';
            const b = letter ? root.querySelector<HTMLButtonElement>(`.key[data-k="${letter}"]`) : null;
            if (b) { e.preventDefault(); if (!e.repeat) play(b); return true; }
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

/** The home phone: a small card with Daniel's Instagram handle and a link out. */
export function openPhoneCard(logoUrl: string | null, onClose: () => void) {
    const ig = profile.instagram;
    openOverlay({
        title: ui.phoneTitle, className: 'phonecard', onClose, focus: '.ig-link',
        body: `
            <div class="ig-card">
                ${logoUrl ? `<img class="ig-logo" src="${esc(logoUrl)}" alt="" width="56" height="56" />` : '<span class="ig-logo ig-ph" aria-hidden="true"></span>'}
                <p class="ig-handle">${esc(ig.handle)}</p>
                <p class="ig-line">${esc(ui.phoneLine)}</p>
                <p class="links"><a class="link ig-link" href="${esc(ig.url)}" target="_blank" rel="noopener noreferrer">${esc(ui.phoneOpen)}</a></p>
            </div>`
    });
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
