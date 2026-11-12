// Email links never open a mail app: clicking one copies the address and shows a small "copied" note.
// Works for every mailto: link on the game page and on /portfolio (delegated, so panels are covered too).

let timer = 0;

function note(text: string) {
    let el = document.getElementById('email-copied');
    if (!el) {
        el = document.createElement('div');
        el.id = 'email-copied';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:9999;pointer-events:none;' +
            'font:700 15px "Space Mono",ui-monospace,monospace;color:#2a1c12;background:#fffdf7;padding:9px 16px;' +
            'border:2px solid #2a1c12;box-shadow:3px 3px 0 #2a1c12;transition:opacity .2s;opacity:0;max-width:calc(100vw - 32px);text-align:center;';
        document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = '1';
    window.clearTimeout(timer);
    timer = window.setTimeout(() => { el!.style.opacity = '0'; }, 2200);
}

async function copy(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch { /* ignore */ }
        ta.remove();
        return ok;
    }
}

export function initEmailCopy() {
    document.addEventListener('click', (e) => {
        const a = (e.target as Element | null)?.closest?.('a[href^="mailto:"]') as HTMLAnchorElement | null;
        if (!a) return;
        e.preventDefault();
        const addr = a.getAttribute('href')!.replace(/^mailto:/i, '').split('?')[0];
        void copy(addr).then((ok) => note(ok ? `Email copied: ${addr}` : `Email: ${addr}`));
    }, true);
}
