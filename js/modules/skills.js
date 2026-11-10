// Skills are not a hand-written list: each technology is counted from the projects
// that actually use it, and clicking one filters the projects section.
import { projects, techs, techGroups } from '../data/projects.js';
import { t } from './i18n.js';
import { setFilter } from './projects.js';
import { observeReveals } from './reveal.js';

const usage = key => projects.filter(p => p.stack.includes(key)).length;
const used = Object.keys(techs).filter(usage).sort((a, b) => usage(b) - usage(a));

function render(grid, first) {
    grid.innerHTML = Object.entries(techGroups).map(([group, label], i) => {
        const items = used.filter(key => techs[key].group === group);
        if (!items.length) return '';
        return `
            <div class="skill-group${first ? '' : ' visible'}" data-reveal style="--delay: ${(i % 3) * 90}ms">
                <h3>// ${t(label).toLowerCase()}</h3>
                <div class="skill-list">${items.map(key => {
                    const n = usage(key);
                    const title = t({ pt: `Ver ${n} projeto${n > 1 ? 's' : ''} com ${techs[key].name}`, en: `See ${n} project${n > 1 ? 's' : ''} using ${techs[key].name}` });
                    return `<button class="skill" data-tech="${key}" title="${title}"><i class="${techs[key].icon}" aria-hidden="true"></i>${techs[key].name}<b>${n}</b></button>`;
                }).join('')}</div>
            </div>`;
    }).join('');
    if (first) observeReveals(grid);
}

export function initSkills() {
    const grid = document.getElementById('skills-grid');
    render(grid, true);
    document.addEventListener('langchange', () => render(grid, false));
    grid.addEventListener('click', e => {
        const skill = e.target.closest('.skill');
        if (skill) setFilter({ tech: skill.dataset.tech }, { scroll: true });
    });

    // marquee: the list twice, so translateX(-50%) loops seamlessly
    const item = (key, dup) => `<span${dup ? ' data-dup' : ''}><i class="${techs[key].icon}"></i>${techs[key].name}</span>`;
    document.getElementById('tech-marquee').innerHTML =
        used.map(k => item(k, false)).join('') + used.map(k => item(k, true)).join('');
}
