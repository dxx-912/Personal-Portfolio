// HTML panels over the canvas. Real text, real links, keyboard and screen reader friendly.

import type { Entry, Section } from '../content/types';
import { ui } from '../content';
import { state } from '../state';
import { esc, rich, renderSection } from './render';
import { sfx } from '../audio';

let current: { root: HTMLElement; onClose?: () => void; prevFocus: Element | null } | null = null;

const sectionHtml = (s: Section, heading: number) =>
    renderSection(s, { mode: 'panel', heading, comingSoonImage: ui.todoImage, comingSoonVideo: ui.todoVideo });

export function isPanelOpen() { return current !== null; }

export function openPanel(entry: Entry, onClose?: () => void) {
    if (current) closePanel(true);
    const root = document.createElement('div');
    root.className = 'panel-backdrop';
    const titleId = `panel-title-${entry.id}`;
    const tabs = entry.tabs ?? [];
    const style = entry.tabStyle ?? 'tabs';

    let inner = '';
    if (tabs.length && style === 'halves') {
        inner = `<div class="halves">${tabs.map((t) => `<section class="half">${sectionHtml(t, 3)}</section>`).join('')}</div>`;
    } else if (tabs.length) {
        const tabButtons = tabs.map((t, i) => `
            <button role="tab" id="tab-${esc(t.id)}" aria-controls="tp-${esc(t.id)}" aria-selected="${i === 0}"
                tabindex="${i === 0 ? 0 : -1}" class="tab tab-${style}" data-i="${i}"${style === 'pennants' ? ` style="--pc: var(--pennant-${i % 6})"` : ''}>
                <span>${rich(t.title)}</span>
            </button>`).join('');
        const tabPanels = tabs.map((t, i) => `
            <div role="tabpanel" id="tp-${esc(t.id)}" aria-labelledby="tab-${esc(t.id)}" class="tabpanel" tabindex="0"${i === 0 ? '' : ' hidden'}>
                ${sectionHtml(t, 3)}
            </div>`).join('');
        inner = `<div class="tabs-wrap tabs-${style}"><div role="tablist" aria-label="${esc(entry.title)}" class="tablist">${tabButtons}</div><div class="tabpanels">${tabPanels}</div></div>`;
    }

    root.innerHTML = `
        <section class="panel panel-${style}" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
            <header class="panel-head">
                <h2 id="${titleId}">${rich(entry.title)}</h2>
                <button class="panel-close" aria-label="${esc(ui.close)}" title="${esc(ui.close)} (Esc)">✕</button>
            </header>
            <div class="panel-body">
                ${sectionHtml({ ...entry, title: entry.title }, 0)}
                ${inner}
            </div>
        </section>`;

    document.getElementById('ui-root')!.appendChild(root);
    current = { root, onClose, prevFocus: document.activeElement };
    state.setModal('panel');

    const panel = root.querySelector<HTMLElement>('.panel')!;
    root.addEventListener('pointerdown', (e) => { if (e.target === root) closePanel(); });
    root.querySelector('.panel-close')!.addEventListener('click', () => closePanel());
    root.addEventListener('keydown', (e) => onKey(e, panel));

    const tabEls = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    tabEls.forEach((btn) => btn.addEventListener('click', () => selectTab(root, Number(btn.dataset.i))));

    requestAnimationFrame(() => {
        root.classList.add('open');
        const focusTarget = tabEls[0] ?? root.querySelector<HTMLElement>('.panel-close');
        focusTarget?.focus({ preventScroll: true });
    });
    sfx('open');
}

function selectTab(root: HTMLElement, i: number) {
    const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    if (!tabs.length) return;
    const n = (i + tabs.length) % tabs.length;
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === n)); t.tabIndex = k === n ? 0 : -1; });
    panels.forEach((p, k) => { p.hidden = k !== n; });
    tabs[n].focus();
    root.querySelector('.panel-body')?.scrollTo({ top: 0 });
    sfx('tick');
}

function onKey(e: KeyboardEvent, panel: HTMLElement) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePanel(); return; }
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') === 'tab') {
        const i = Number(target.dataset.i);
        const vertical = target.classList.contains('tab-shelf');
        const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
        const next = vertical ? 'ArrowDown' : 'ArrowRight';
        if (e.key === next || e.key === (vertical ? 'ArrowRight' : 'ArrowDown')) { e.preventDefault(); selectTab(current!.root, i + 1); }
        if (e.key === prev || e.key === (vertical ? 'ArrowLeft' : 'ArrowUp')) { e.preventDefault(); selectTab(current!.root, i - 1); }
        if (e.key === 'Home') { e.preventDefault(); selectTab(current!.root, 0); }
        if (e.key === 'End') { e.preventDefault(); selectTab(current!.root, -1); }
    }
    if (e.key === 'Tab') {
        const focusables = [...panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), iframe, video, [tabindex]:not([tabindex="-1"]):not([hidden])'
        )].filter((el) => el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
}

export function closePanel(silent = false) {
    if (!current) return;
    const { root, onClose } = current;
    current = null;
    root.classList.remove('open');
    root.classList.add('closing');
    // Remove right away for state, let the CSS fade finish visually.
    window.setTimeout(() => root.remove(), 140);
    state.setModal(null);
    document.getElementById('game')?.querySelector('canvas')?.focus({ preventScroll: true });
    if (!silent) sfx('close');
    onClose?.();
}
