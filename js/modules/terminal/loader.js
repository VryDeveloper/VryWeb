// Loads the shell only when someone could use it: the terminal scrolling near the
// viewport, the ` shortcut, or the palette action. First paint does not pay for it.
const load = () => import('./shell.js').then(async shell => { await shell.start(); return shell; });

export function initTerminal() {
    const card = document.getElementById('terminal');
    if (!card) return;
    new IntersectionObserver(([entry], observer) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        load();
    }, { rootMargin: '200px' }).observe(card);
}
