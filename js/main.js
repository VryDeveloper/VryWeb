import { initI18n } from './modules/i18n.js';
import { initTheme } from './modules/theme.js';
import { initNav } from './modules/nav.js';
import { initReveal } from './modules/reveal.js';
import { initProjects } from './modules/projects.js';

initTheme();
initNav();
initI18n();
initReveal();
initProjects();

// loader: gone as soon as the module graph has run, no fixed delay
document.querySelector('.loader')?.classList.add('hidden');
