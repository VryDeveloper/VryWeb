// Command palette (Ctrl/Cmd+K or "/"): jump to a section, open a project,
// filter by technology, or run an action. Native <dialog>, no library.
import { projects, techs, categories } from '../data/projects.js';
import { t, toggleLang } from './i18n.js';
import { toggleTheme } from './theme.js';
import { setFilter, esc } from './projects.js';
import { openProject } from './case-study.js';
import { toast } from './toast.js';
import { copyEmail, downloadCV, openURL, LINKEDIN, GITHUB } from './actions.js';
import { openTerminal } from './terminal/loader.js';
import { emit } from './events.js';

const dialog = document.getElementById('palette');
const input = document.getElementById('palette-query');
const list = document.getElementById('palette-list');
let results = [], selected = 0;

const go = id => document.getElementById(id).scrollIntoView();

// rebuilt on every open, so labels follow the current language
function buildItems() {
    const group = {
        go:      t({ pt: 'Ir para', en: 'Go to' }),
        action:  t({ pt: 'Ações', en: 'Actions' }),
        project: t({ pt: 'Projetos', en: 'Projects' }),
        tech:    t({ pt: 'Filtrar por tecnologia', en: 'Filter by technology' }),
    };
    const section = (id, icon, label) => ({ group: group.go, icon, label: t(label), run: () => go(id) });
    return [
        section('inicio', 'bi-house', { pt: 'Início', en: 'Home' }),
        section('projetos', 'bi-grid', { pt: 'Projetos', en: 'Projects' }),
        section('habilidades', 'bi-cpu', { pt: 'Habilidades', en: 'Skills' }),
        section('github', 'bi-github', { pt: 'GitHub', en: 'GitHub' }),
        section('sobre', 'bi-person', { pt: 'Sobre', en: 'About' }),
        section('contato', 'bi-envelope', { pt: 'Contato', en: 'Contact' }),

        { group: group.action, icon: 'bi-terminal', label: t({ pt: 'Abrir terminal', en: 'Open terminal' }), hint: '`', run: openTerminal },
        { group: group.action, icon: 'bi-circle-half', label: t({ pt: 'Alternar tema claro/escuro', en: 'Toggle light/dark theme' }), run: toggleTheme },
        { group: group.action, icon: 'bi-translate', label: t({ pt: 'Switch to English', en: 'Mudar para português' }), run: toggleLang },
        { group: group.action, icon: 'bi-copy', label: t({ pt: 'Copiar e-mail', en: 'Copy email' }), run: copyEmail },
        { group: group.action, icon: 'bi-download', label: t({ pt: 'Baixar CV', en: 'Download CV' }), run: downloadCV },
        { group: group.action, icon: 'bi-linkedin', label: t({ pt: 'Abrir LinkedIn', en: 'Open LinkedIn' }), run: () => openURL(LINKEDIN) },
        { group: group.action, icon: 'bi-github', label: t({ pt: 'Abrir perfil no GitHub', en: 'Open GitHub profile' }), run: () => openURL(GITHUB) },

        ...projects.map(p => ({
            group: group.project, icon: 'bi-folder2-open', label: t(p.title),
            // stack and categories are searchable but not shown
            keywords: [...p.stack.map(k => techs[k].name), ...p.categories.map(c => t(categories[c]))].join(' '),
            hint: String(p.year),
            run: () => openProject(p.id),
        })),

        ...Object.entries(techs)
            .map(([key, tech]) => ({ key, tech, n: projects.filter(p => p.stack.includes(key)).length }))
            .filter(({ n }) => n)
            .map(({ key, tech, n }) => ({
                group: group.tech, icon: 'bi-funnel',
                label: t({ pt: `Projetos com ${tech.name}`, en: `Projects using ${tech.name}` }),
                hint: String(n),
                run: () => setFilter({ tech: key }, { scroll: true }),
            })),
    ];
}

// Subsequence match. Consecutive hits and word starts score higher; -1 means no match.
function fuzzy(query, text) {
    // an exact substring beats any scattered match; a whole word beats a fragment
    const at = text.indexOf(query);
    if (at !== -1) {
        const wordStart = at === 0 || text[at - 1] === ' ';
        const wordEnd = at + query.length === text.length || text[at + query.length] === ' ';
        return 100 + (wordStart ? 20 : 0) + (wordEnd ? 20 : 0) - text.length * 0.01;
    }
    let score = 0, ti = 0, streak = 0;
    for (const ch of query) {
        const found = text.indexOf(ch, ti);
        if (found === -1) return -1;
        streak = found === ti ? streak + 1 : 0;
        score += 1 + streak * 2 + (found === 0 || text[found - 1] === ' ' ? 3 : 0);
        ti = found + 1;
    }
    return score - text.length * 0.01;
}

const norm = s => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

function search(items, raw) {
    const q = norm(raw.trim());
    if (!q) return items;
    if (q === 'sudo hire victor') {
        return [{
            group: 'sudo', icon: 'bi-rocket-takeoff', label: t({ pt: 'Permissão concedida. Falar com o Victor', en: 'Permission granted. Talk to Victor' }),
            run: () => { go('contato'); toast('✓ hire --candidate victor: ok'); },
        }];
    }
    return items
        .map(item => ({ item, score: Math.max(fuzzy(q, norm(item.label)), fuzzy(q, norm(item.keywords ?? '')) - 4) }))
        .filter(r => r.score > -1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map(r => r.item);
}

let items = [];

function render() {
    results = search(items, input.value);
    selected = Math.min(selected, Math.max(0, results.length - 1));
    const grouped = !input.value.trim();
    let lastGroup = null;
    list.innerHTML = results.map((item, i) => {
        const header = grouped && item.group !== lastGroup ? `<li class="palette-group" role="presentation">${esc(item.group)}</li>` : '';
        lastGroup = item.group;
        return `${header}<li class="palette-item" id="palette-opt-${i}" role="option" data-index="${i}" aria-selected="${i === selected}">
            <i class="bi ${item.icon}" aria-hidden="true"></i>${esc(item.label)}
            <small>${esc(grouped ? (item.hint ?? '') : item.group)}</small>
        </li>`;
    }).join('') || `<li class="palette-empty" role="presentation">${t({ pt: 'Nada encontrado', en: 'Nothing found' })}</li>`;
    input.setAttribute('aria-activedescendant', results.length ? `palette-opt-${selected}` : '');
}

function select(index) {
    if (!results.length) return;
    selected = (index + results.length) % results.length;
    list.querySelectorAll('.palette-item').forEach((el, i) => el.setAttribute('aria-selected', i === selected));
    list.querySelector(`#palette-opt-${selected}`)?.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', `palette-opt-${selected}`);
}

function run(index) {
    const item = results[index];
    if (!item) return;
    dialog.close();
    item.run();
}

export function openPalette() {
    if (dialog.open) return;
    items = buildItems();
    input.value = '';
    input.placeholder = t({ pt: 'Buscar projetos, tecnologias, ações…', en: 'Search projects, technologies, actions…' });
    selected = 0;
    render();
    dialog.showModal();
    emit('palette');
}

export function initPalette() {
    const opener = document.getElementById('palette-open');
    if (/Mac|iPhone|iPad/.test(navigator.platform)) opener.querySelector('kbd').textContent = '⌘K';
    opener.addEventListener('click', openPalette);

    document.addEventListener('keydown', e => {
        const typing = e.target.matches?.('input, textarea, [contenteditable]');
        if ((e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey)) {
            e.preventDefault();
            openPalette();
        }
    });

    input.addEventListener('input', () => { selected = 0; render(); });
    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); select(selected + 1); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); select(selected - 1); }
        if (e.key === 'Enter')     { e.preventDefault(); run(selected); }
    });

    list.addEventListener('click', e => {
        const item = e.target.closest('.palette-item');
        if (item) run(Number(item.dataset.index));
    });
    list.addEventListener('pointermove', e => {
        const item = e.target.closest('.palette-item');
        if (item && Number(item.dataset.index) !== selected) select(Number(item.dataset.index));
    });
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
}
