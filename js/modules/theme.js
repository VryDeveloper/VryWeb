// data-theme on <html> is set before first paint by the inline script in <head>.
const root = document.documentElement;
const checkbox = document.querySelector('#chk');

export function setTheme(theme) {
    root.dataset.theme = theme;
    if (checkbox) checkbox.checked = theme === 'light';
    try { localStorage.setItem('theme', theme); } catch {}
}

export const toggleTheme = () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light');

export function initTheme() {
    if (!checkbox) return;
    checkbox.checked = root.dataset.theme === 'light';
    checkbox.addEventListener('change', () => setTheme(checkbox.checked ? 'light' : 'dark'));
}
