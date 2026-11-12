// HTML panels over the canvas. Real text, real links, keyboard and screen reader friendly.
// Also hosts small overlays (piano keyboard, snapshot) that pause the game the same way.

import type { Entry, Section } from '../content/types';
import { ui } from '../content';
import { state } from '../state';
import { esc, rich, renderSection } from './render';
import { duck, sfx } from '../audio';

interface Open {
    root: HTMLElement;
    onClose?: () => void;
    onKey?: (e: KeyboardEvent) => boolean | void;
    cleanup?: () => void;
}
let current: Open | null = null;

const sectionHtml = (s: Section, heading: number) =>
    renderSection(s, { mode: 'panel', heading, comingSoonImage: ui.todoImage, comingSoonVideo: ui.todoVideo });

export function isPanelOpen() { return current !== null; }

function tabsHtml(entry: Entry) {
    const tabs = entry.tabs ?? [];
    if (!tabs.length) return '';
    const style = entry.tabStyle ?? 'tabs';
    const open = Math.max(0, tabs.findIndex((t) => t.id === entry.defaultTab));
    const tabButtons = tabs.map((t, i) => `
        <button role="tab" id="tab-${esc(t.id)}" aria-controls="tp-${esc(t.id)}" aria-selected="${i === open}"
            tabindex="${i === open ? 0 : -1}" class="tab tab-${style}" data-i="${i}" style="--i: ${i}">
            ${style === 'notes' ? '<span class="check" aria-hidden="true">✓</span>' : ''}<span>${rich(t.title)}</span>
        </button>`).join('');
    const tabPanels = tabs.map((t, i) => `
        <div role="tabpanel" id="tp-${esc(t.id)}" aria-labelledby="tab-${esc(t.id)}" class="tabpanel" tabindex="0"${i === open ? '' : ' hidden'}>
            ${sectionHtml(t, 3)}
        </div>`).join('');
    return `<div class="tabs-wrap tabs-${style}"><div role="tablist" aria-label="${esc(entry.title)}" class="tablist">${tabButtons}</div><div class="tabpanels">${tabPanels}</div></div>`;
}

function mount(html: string, open: Omit<Open, 'root'>, focusSel?: string) {
    open = { ...open };
    if (current) closePanel(true);
    const root = document.createElement('div');
    root.className = 'panel-backdrop';
    root.innerHTML = html;
    document.getElementById('ui-root')!.appendChild(root);
    current = { root, ...open };
    const cur = current;
    state.setModal('panel');
    root.addEventListener('pointerdown', (e) => { if (e.target === root) closePanel(); });
    root.querySelector('.panel-close')?.addEventListener('click', () => closePanel());
    root.addEventListener('keydown', (e) => onKey(e, root));
    // duck the lofi while a video in this panel plays (MP4 events, or focus moving into an embed)
    root.addEventListener('play', (e) => { if ((e.target as HTMLElement).tagName === 'VIDEO') duck('video', true); }, true);
    root.addEventListener('pause', (e) => { if ((e.target as HTMLElement).tagName === 'VIDEO') duck('video', false); }, true);
    const onBlur = () => window.setTimeout(() => { if (document.activeElement?.tagName === 'IFRAME' && root.contains(document.activeElement)) duck('video', true); }, 0);
    window.addEventListener('blur', onBlur);
    cur.cleanup = () => { window.removeEventListener('blur', onBlur); duck('video', false); };
    requestAnimationFrame(() => {
        root.classList.add('open');
        const f = (focusSel && root.querySelector<HTMLElement>(focusSel)) || root.querySelector<HTMLElement>('.panel-close');
        f?.focus({ preventScroll: true });
    });
    sfx('open');
    return root;
}

export function openPanel(entry: Entry, onClose?: () => void) {
    const style = entry.tabStyle ?? 'tabs';
    const titleId = `panel-title-${entry.id}`;
    // only a few lines of text: no tabs, photos, videos, or long story
    const compact = !entry.tabs?.length && !entry.images?.some((i) => i.src) && !entry.videos?.length && !entry.more
        && (entry.body ?? []).join(' ').length < 400;
    const root = mount(`
        <section class="panel panel-${style} panel-id-${esc(entry.id)}${compact ? ' panel-compact' : ''}" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
            <header class="panel-head">
                <h2 id="${titleId}">${rich(entry.title)}</h2>
                <button class="panel-close" aria-label="${esc(ui.close)}" title="${esc(ui.close)} (Esc)">✕</button>
            </header>
            <div class="panel-body">
                ${sectionHtml({ ...entry, title: entry.title, tags: entry.tabs?.length ? undefined : entry.tags }, 0)}
                ${tabsHtml(entry)}
            </div>
        </section>`, { onClose }, '[role="tab"][aria-selected="true"]');
    root.querySelectorAll<HTMLButtonElement>('[role="tab"]').forEach((btn) =>
        btn.addEventListener('click', () => selectTab(root, Number(btn.dataset.i))));
}

/** A custom overlay (piano, snapshot). `body` is trusted HTML built by our code. */
export function openOverlay(opts: {
    title: string; className: string; body: string;
    onClose?: () => void; onKey?: (e: KeyboardEvent) => boolean | void; focus?: string;
}) {
    const id = `ov-${opts.className}`;
    return mount(`
        <section class="panel ${esc(opts.className)}" role="dialog" aria-modal="true" aria-labelledby="${id}">
            <header class="panel-head">
                <h2 id="${id}">${esc(opts.title)}</h2>
                <button class="panel-close" aria-label="${esc(ui.close)}" title="${esc(ui.close)} (Esc)">✕</button>
            </header>
            <div class="panel-body">${opts.body}</div>
        </section>`, { onClose: opts.onClose, onKey: opts.onKey }, opts.focus);
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

function onKey(e: KeyboardEvent, root: HTMLElement) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePanel(); return; }
    if (current?.onKey?.(e)) return;
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') === 'tab') {
        const i = Number(target.dataset.i);
        const vertical = target.classList.contains('tab-shelf');
        const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
        const next = vertical ? 'ArrowDown' : 'ArrowRight';
        if (e.key === next || e.key === (vertical ? 'ArrowRight' : 'ArrowDown')) { e.preventDefault(); selectTab(root, i + 1); }
        if (e.key === prev || e.key === (vertical ? 'ArrowLeft' : 'ArrowUp')) { e.preventDefault(); selectTab(root, i - 1); }
        if (e.key === 'Home') { e.preventDefault(); selectTab(root, 0); }
        if (e.key === 'End') { e.preventDefault(); selectTab(root, -1); }
    }
    if (e.key === 'Tab') {
        const panel = root.querySelector<HTMLElement>('.panel')!;
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
    const { root, onClose, cleanup } = current;
    current = null;
    cleanup?.();
    root.classList.remove('open');
    root.classList.add('closing');
    // Remove right away for state, let the CSS fade finish visually.
    window.setTimeout(() => root.remove(), 140);
    state.setModal(null);
    document.getElementById('game')?.querySelector('canvas')?.focus({ preventScroll: true });
    if (!silent) sfx('close');
    onClose?.();
}
