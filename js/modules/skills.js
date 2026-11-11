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
                    return `<button class="skill" data-tech="${key}" title="${title(key)}"><i class="${techs[key].icon}" aria-hidden="true"></i>${techs[key].name}<b>${n}</b></button>`;
                }).join('')}</div>
            </div>`;
    }).join('');
    if (first) observeReveals(grid);
}

const title = key => {
    const n = usage(key);
    return t({ pt: `Ver ${n} projeto${n > 1 ? 's' : ''} com ${techs[key].name}`, en: `See ${n} project${n > 1 ? 's' : ''} using ${techs[key].name}` });
};
const pick = key => setFilter({ tech: key }, { scroll: true });

// The physics playground replaces the grid once Matter.js loads. The grid stays for
// reduced motion, a failed CDN, and anyone who presses "view as list".
function initPlayground(grid) {
    const section = document.getElementById('habilidades');
    const play = document.getElementById('skills-play');
    const toolbar = document.getElementById('skills-toolbar');
    const mode = document.getElementById('skills-mode');
    if (!play || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let physics = null;
    function setMode(list) {
        grid.hidden = !list;
        play.hidden = list;
        mode.querySelector('i').className = `bi ${list ? 'bi-joystick' : 'bi-list-ul'}`;
        const label = list ? { pt: 'Modo física', en: 'Physics mode' } : { pt: 'Ver como lista', en: 'View as list' };
        const span = mode.querySelector('span');
        span.dataset.pt = label.pt;
        span.dataset.en = label.en;
        span.textContent = t(label);
    }
    mode.addEventListener('click', () => setMode(!play.hidden));

    new IntersectionObserver(async ([entry], observer) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        play.hidden = false;                 // laid out before the pills are measured
        try {
            const { startPhysics } = await import('./skills-physics.js');
            physics = await startPhysics({
                play,
                items: used.map(key => ({ key, name: techs[key].name, icon: techs[key].icon, group: techs[key].group, n: usage(key), title: title(key) })),
                onPick: pick,
            });
            grid.hidden = true;
            toolbar.hidden = false;
        } catch (err) {
            console.warn('skills physics unavailable, keeping the list', err);
            play.hidden = true;
        }
    }, { rootMargin: '300px' }).observe(section);

    document.addEventListener('langchange', () => physics?.setTitles(item => title(item.key)));
}

export function initSkills() {
    const grid = document.getElementById('skills-grid');
    render(grid, true);
    document.addEventListener('langchange', () => render(grid, false));
    grid.addEventListener('click', e => {
        const skill = e.target.closest('.skill');
        if (skill) pick(skill.dataset.tech);
    });
    initPlayground(grid);

    // marquee: the list twice, so translateX(-50%) loops seamlessly
    const item = (key, dup) => `<span${dup ? ' data-dup' : ''}><i class="${techs[key].icon}"></i>${techs[key].name}</span>`;
    document.getElementById('tech-marquee').innerHTML =
        used.map(k => item(k, false)).join('') + used.map(k => item(k, true)).join('');
}
