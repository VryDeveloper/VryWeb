import { initI18n } from './modules/i18n.js';
import { initTheme } from './modules/theme.js';
import { initNav } from './modules/nav.js';
import { initReveal } from './modules/reveal.js';

initTheme();
initNav();
initI18n();
initReveal();

// view toggle (grid / list)
const grid = document.querySelector('.portfolio-grid');
document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === button));
        grid.classList.toggle('list-view', button.dataset.view === 'list');
    });
});

// loader: gone as soon as the module graph has run, no fixed delay
document.querySelector('.loader')?.classList.add('hidden');
