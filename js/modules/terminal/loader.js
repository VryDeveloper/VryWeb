// Loads the shell only when someone could use it: the terminal scrolling near the
// viewport, the ` shortcut, or the palette action. First paint does not pay for it.
let shell;
const load = () => (shell ??= import('./shell.js').then(async m => { await m.start(); return m; }));

export const openTerminal = () => load().then(m => m.openFull());

export function initTerminal() {
    const card = document.getElementById('terminal');
    if (!card) return;
    new IntersectionObserver(([entry], observer) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        load();
    }, { rootMargin: '200px' }).observe(card);

    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.target.matches?.('input, textarea, [contenteditable]')) return;
        // ` on US layouts; on Brazilian ABNT2 it is Shift+´, a dead key on the BracketLeft position
        const backtick = e.key === '`' || (e.key === 'Dead' && e.code === 'BracketLeft' && e.shiftKey);
        if (!backtick || document.querySelector('dialog[open]')) return;
        e.preventDefault();
        openTerminal();
    });
}
