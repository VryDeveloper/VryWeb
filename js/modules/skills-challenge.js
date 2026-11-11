// "Build the stack": a strip across the top of the playground names a real project;
// pills released over it count as answers. Right ones go into the strip, wrong ones
// are thrown back. Finishing a stack unlocks an achievement and offers the project.
import { projects, techs } from '../data/projects.js';
import { t } from './i18n.js';
import { openProject } from './case-study.js';
import { emit } from './events.js';

// real projects with a stack short enough to be fun (4 to 8 techs), Kitsuy Store first
const ORDER = ['kitsuy-store', 'copec', 'kanban-go', 'vryauth', 'linkpulse', 'esg-inteligentes', 'kitsuy-storage', 'figure-radar', 'whatsapp-saas'];
const CHALLENGES = ORDER.map(id => projects.find(p => p.id === id)).filter(p => p && p.stack.length >= 4 && p.stack.length <= 8);

export function initChallenge(play, physics) {
    const band = document.createElement('div');
    band.className = 'stack-band';
    band.setAttribute('aria-live', 'polite');
    play.prepend(band);                   // first child: pills are painted above it

    let index = 0, got = [], misses = 0, done = false, note = null;
    const current = () => CHALLENGES[index];

    function render() {
        const p = current();
        band.replaceChildren();
        const head = document.createElement('p');
        head.className = 'stack-title';
        if (done) {
            head.textContent = t({ pt: `✔ Stack da ${t(p.title)} completa!`, en: `✔ ${t(p.title)} stack complete!` });
        } else {
            head.append(
                t({ pt: '🎯 Arraste para cá a stack da ', en: '🎯 Drag here the stack of ' }),
                Object.assign(document.createElement('strong'), { textContent: t(p.title) }),
                Object.assign(document.createElement('span'), { className: 'stack-count', textContent: ` ${got.length}/${p.stack.length}` }),
            );
        }
        const chips = document.createElement('div');
        chips.className = 'stack-chips';
        for (const key of got) {
            const chip = document.createElement('span');
            chip.className = 'stack-chip';
            chip.innerHTML = `<i class="${techs[key].icon}" aria-hidden="true"></i>`;
            chip.append(techs[key].name);
            chips.append(chip);
        }
        const actions = document.createElement('div');
        actions.className = 'stack-actions';
        if (done) actions.append(button(t({ pt: 'Ver projeto', en: 'See project' }), () => openProject(p.id), true));
        actions.append(button(done ? t({ pt: 'Próximo desafio', en: 'Next challenge' }) : t({ pt: 'Trocar', en: 'Skip' }), next));
        band.append(head, chips, actions);
        if (note) band.append(Object.assign(document.createElement('p'), { className: 'stack-note', textContent: note }));
    }

    function button(label, onClick, primary = false) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `stack-btn${primary ? ' primary' : ''}`;
        b.textContent = label;
        b.addEventListener('click', onClick);
        return b;
    }

    function next() {
        physics.restore(got);
        index = (index + 1) % CHALLENGES.length;
        got = []; misses = 0; done = false; note = null;
        render();
    }

    // briefly lights up one missing pill after two wrong tries
    function hint() {
        const missing = current().stack.find(k => !got.includes(k));
        const el = play.querySelector(`.pill[data-tech="${missing}"]`);
        if (!el) return;
        el.classList.add('hint');
        setTimeout(() => el.classList.remove('hint'), 2400);
    }

    function onDrop(key, body, point) {
        if (done || point.y > band.offsetHeight + 8) return;   // released outside the strip
        const p = current();
        if (got.includes(key)) return;
        if (p.stack.includes(key)) {
            got.push(key);
            physics.remove(key);
            note = null;
            if (got.length === p.stack.length) {
                done = true;
                emit('stack', { id: p.id });
            }
        } else {
            physics.reject(key, { x: point.x, y: 0 });
            misses++;
            note = t({ pt: `${techs[key].name} não está nesse projeto.`, en: `${techs[key].name} is not in this project.` });
            band.classList.remove('wrong');
            void band.offsetWidth;
            band.classList.add('wrong');
            if (misses % 2 === 0) hint();
        }
        render();
    }

    document.addEventListener('langchange', render);
    render();
    return { onDrop };
}
