import { projects, categories, statuses, techs, techIcon } from '../data/projects.js';
import { t } from './i18n.js';
import { observeReveals } from './reveal.js';

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const MAX_ICONS = 6;
const grid = document.getElementById('project-grid');
const chips = document.getElementById('project-filters');
const archive = document.getElementById('project-archive');
const archiveList = document.getElementById('archive-list');
const archiveToggle = archive.querySelector('.archive-toggle');

// filter state mirrors the URL: ?f=<category> or ?t=<tech>
const params = new URLSearchParams(location.search);
const state = {
    cat: categories[params.get('f')] ? params.get('f') : 'all',
    tech: techs[params.get('t')] ? params.get('t') : null,
};
let rendered = false;

const matches = p =>
    (state.cat === 'all' || p.categories.includes(state.cat)) &&
    (!state.tech || p.stack.includes(state.tech));

export function coverHTML(p, { lazy = true } = {}) {
    if (p.cover) {
        return `<div class="img-port${p.pixelated ? ' pixelated' : ''}">
            <img src="${p.cover}" alt="${esc(t({ pt: 'Tela do projeto', en: 'Screenshot of' }))} ${esc(t(p.title))}" width="1200" height="750"${lazy ? ' loading="lazy"' : ''} decoding="async">
        </div>`;
    }
    return `<div class="img-port placeholder" aria-hidden="true">
        <i class="bi ${p.icon}"></i>${p.code ? `<code>${esc(p.code)}</code>` : ''}
    </div>`;
}

export function badgeHTML(p) {
    return statuses[p.status]
        ? `<span class="projeto-badge"><span class="pulse-dot"></span>${t(statuses[p.status])}</span>` : '';
}

export function linksHTML(p) {
    const { repo, demo } = p.links ?? {};
    const out = [];
    if (repo) out.push(`<a href="${repo}" target="_blank" rel="noopener noreferrer"><i class="bi bi-github"></i> GitHub</a>`);
    if (demo) out.push(`<a href="${demo}" target="_blank" rel="noopener noreferrer"><i class="bi bi-box-arrow-up-right"></i> ${t({ pt: 'Abrir', en: 'Live' })}</a>`);
    if (p.private) out.push(`<span class="tag-private"><i class="bi bi-lock-fill"></i> ${t({ pt: 'Repositório privado', en: 'Private repository' })}</span>`);
    return out.join('');
}

function stackHTML(p) {
    const shown = p.stack.slice(0, MAX_ICONS).map(techIcon).join('');
    const rest = p.stack.length - MAX_ICONS;
    return shown + (rest > 0 ? `<span class="tech-more">+${rest}</span>` : '');
}

function cardHTML(p, i) {
    const metrics = (p.metrics ?? []).slice(0, 2)
        .map(m => `<li><b>${esc(m.value)}</b>${esc(t(m.label))}</li>`).join('');
    return `
        <article class="projeto-card${p.tier === 'featured' ? ' featured' : ''}${rendered ? ' visible' : ''}"
                 data-id="${p.id}" style="--vt: p-${p.id}; --delay: ${(i % 3) * 90}ms">
            ${coverHTML(p)}
            <span class="projeto-year">${p.year}</span>
            <div class="projeto-info">
                <div class="projeto-meta">${badgeHTML(p)}<span>${p.categories.map(c => t(categories[c])).join(' · ')}</span></div>
                <h3><button class="card-open" data-open="${p.id}" aria-haspopup="dialog">${esc(t(p.title))}</button></h3>
                <p>${esc(t(p.summary))}</p>
                ${metrics ? `<ul class="projeto-metrics">${metrics}</ul>` : ''}
                ${p.tier === 'featured' ? `<ul class="case-highlights projeto-highlights">${t(p.highlights).slice(0, 3).map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
                <div class="tech-icons">${stackHTML(p)}</div>
                <div class="projeto-links">${linksHTML(p)}<span class="card-more">${t({ pt: 'Detalhes', en: 'Details' })} <i class="bi bi-arrow-right"></i></span></div>
            </div>
        </article>`;
}

function archiveItemHTML(p) {
    return `
        <div class="archive-item" data-id="${p.id}">
            <img src="${p.cover}" alt="" width="56" height="56" loading="lazy" decoding="async">
            <div>
                <h4><button class="card-open" data-open="${p.id}" aria-haspopup="dialog">${esc(t(p.title))}</button><small>${p.year}</small></h4>
                <p>${esc(t(p.summary))}</p>
            </div>
            <div class="tech-icons">${p.stack.map(techIcon).join('')}</div>
            <div class="projeto-links">${linksHTML(p)}</div>
        </div>`;
}

function renderChips() {
    const count = cat => projects.filter(p => cat === 'all' || p.categories.includes(cat)).length;
    const chip = (key, label) =>
        `<button class="chip" data-cat="${key}" aria-pressed="${!state.tech && state.cat === key}">${label} <span>${count(key)}</span></button>`;
    chips.innerHTML =
        chip('all', t({ pt: 'Todos', en: 'All' })) +
        Object.entries(categories).map(([key, label]) => chip(key, t(label))).join('') +
        (state.tech ? `<button class="chip" data-clear-tech aria-pressed="true"><i class="bi bi-x-lg"></i> ${techs[state.tech].name}</button>` : '');
}

function renderGrid() {
    const filtered = state.cat !== 'all' || !!state.tech;
    const list = projects.filter(matches);
    const main = list.filter(p => p.tier !== 'archive');
    const old = list.filter(p => p.tier === 'archive');

    grid.toggleAttribute('data-bento', !filtered);
    grid.innerHTML = main.map(cardHTML).join('') ||
        (old.length ? '' : `<p class="project-empty">${t({ pt: 'Nenhum projeto com esse filtro.', en: 'No projects match this filter.' })}</p>`);

    archive.hidden = !old.length;
    archiveList.innerHTML = old.map(archiveItemHTML).join('');
    document.getElementById('archive-label').textContent =
        t({ pt: `Projetos de estudo e mais antigos (${old.length})`, en: `Study and older projects (${old.length})` });
    // a filter that only hits archived projects should not look empty
    if (filtered && old.length) setArchive(true);

    document.getElementById('project-count').textContent =
        t({ pt: `${list.length} projeto${list.length === 1 ? '' : 's'}`, en: `${list.length} project${list.length === 1 ? '' : 's'}` });

    observeReveals(grid);
    rendered = true;
}

function setArchive(open) {
    archive.toggleAttribute('data-expanded', open);
    archiveToggle.setAttribute('aria-expanded', String(open));
    archiveList.inert = !open;
}

function syncURL() {
    const url = new URL(location.href);
    url.searchParams.delete('f'); url.searchParams.delete('t');
    if (state.tech) url.searchParams.set('t', state.tech);
    else if (state.cat !== 'all') url.searchParams.set('f', state.cat);
    history.replaceState(null, '', url);
}

export function setFilter({ cat = 'all', tech = null } = {}, { scroll = false } = {}) {
    Object.assign(state, { cat, tech });
    const apply = () => { renderChips(); renderGrid(); };
    syncURL();
    if (scroll) document.getElementById('projetos').scrollIntoView();

    if (!document.startViewTransition || reducedMotion()) return apply();
    // cards carry their view-transition-name only while this transition runs
    grid.classList.add('vt');
    document.startViewTransition(apply).finished.finally(() => grid.classList.remove('vt'));
}

export function initProjects() {
    renderChips();
    renderGrid();

    chips.addEventListener('click', e => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        setFilter(chip.hasAttribute('data-clear-tech') ? {} : { cat: chip.dataset.cat });
    });

    archiveToggle.addEventListener('click', () => setArchive(!archive.hasAttribute('data-expanded')));

    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === button));
            grid.classList.toggle('list-view', button.dataset.view === 'list');
        });
    });

    document.addEventListener('langchange', () => { renderChips(); renderGrid(); });
}
