import { projects } from './data/projects.js';
import { initI18n, getLang } from './modules/i18n.js';
import { initTheme } from './modules/theme.js';
import { initNav } from './modules/nav.js';
import { initReveal } from './modules/reveal.js';
import { initProjects } from './modules/projects.js';
import { initCaseStudy } from './modules/case-study.js';
import { initSkills } from './modules/skills.js';
import { initGithub } from './modules/github.js';
import { initPalette } from './modules/palette.js';
import { copyEmail } from './modules/actions.js';
import { initHeroCanvas } from './modules/hero-canvas.js';
import { initTypewriter } from './modules/typewriter.js';
import { initFx, initCountUp } from './modules/fx.js';

// hero numbers come from the data, never typed by hand
const stats = {
    projects: projects.length,
    tests: projects.reduce((sum, p) => sum + (p.tests ?? 0), 0),
    live: projects.filter(p => p.status === 'production' || p.status === 'live').length,
};
document.querySelectorAll('[data-stat]').forEach(el => { el.dataset.count = stats[el.dataset.stat]; });

// local time in Salvador, for whoever is deciding when to call
const clock = document.getElementById('local-time');
function tick() {
    clock.textContent = new Intl.DateTimeFormat(getLang() === 'pt' ? 'pt-BR' : 'en', {
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Bahia',
    }).format(new Date());
}
tick();
setInterval(tick, 30_000);
document.addEventListener('langchange', tick);

document.getElementById('copy-email').addEventListener('click', copyEmail);

initI18n();
initTheme();
initNav();
initProjects();
initSkills();
initReveal();
initCaseStudy();
initGithub();
initPalette();
initHeroCanvas();
initTypewriter();
initFx();
initCountUp();
