// data-theme on <html> is set before first paint by the inline script in <head>.
const root = document.documentElement;
const checkbox = document.querySelector('#chk');

function apply(theme) {
    root.dataset.theme = theme;
    if (checkbox) checkbox.checked = theme === 'light';
    try { localStorage.setItem('theme', theme); } catch {}
}

// The new theme opens as a circle growing from the toggle (View Transitions);
// browsers without it, and reduced-motion users, get a plain switch.
export function setTheme(theme) {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply(theme);

    const r = checkbox.getBoundingClientRect();
    root.style.setProperty('--tx', `${r.left + r.width / 2}px`);
    root.style.setProperty('--ty', `${r.top + r.height / 2}px`);
    root.classList.add('theme-vt');
    document.startViewTransition(() => apply(theme)).finished.finally(() => root.classList.remove('theme-vt'));
}

export const toggleTheme = () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light');

export function initTheme() {
    if (!checkbox) return;
    checkbox.checked = root.dataset.theme === 'light';
    checkbox.addEventListener('change', () => setTheme(checkbox.checked ? 'light' : 'dark'));
}
