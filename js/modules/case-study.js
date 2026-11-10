// Case study modal. The URL hash (#/p/<id>) is the single source of truth:
// opening sets the hash, the hashchange handler renders, Back closes it.
import { projects, categories, techs } from '../data/projects.js';
import { t } from './i18n.js';
import { esc, coverHTML, badgeHTML, reducedMotion } from './projects.js';

const dialog = document.getElementById('case-study');
const currentId = () => location.hash.match(/^#\/p\/([\w-]+)/)?.[1];
const byId = id => projects.find(p => p.id === id);

function section(title, body) {
    return body ? `<section class="case-section"><h3>// ${title}</h3>${body}</section>` : '';
}

function html(p) {
    const gallery = (p.gallery ?? []).map(name =>
        `<img src="assets/projects/${p.id}/${name}.webp" alt="" loading="lazy" decoding="async"${p.pixelated ? ' class="pixelated"' : ''}>`).join('');
    const cover = p.cover
        ? `<img src="${p.cover}" alt="${esc(t(p.title))}"${p.pixelated ? ' class="pixelated"' : ''}>`
        : coverHTML(p);
    const { repo, demo } = p.links ?? {};
    const metrics = (p.metrics ?? []).map(m => `<li><b>${esc(m.value)}</b>${esc(t(m.label))}</li>`).join('');
    const highlights = (t(p.highlights) ?? []).map(h => `<li>${esc(h)}</li>`).join('');
    const stack = p.stack.map(key =>
        `<span class="tech-chip"><i class="${techs[key].icon}" aria-hidden="true"></i>${techs[key].name}</span>`).join('');

    return `
        <header class="case-bar">
            <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
            <span class="case-path">~/projects/${p.id}.md</span>
            <button class="icon-btn" data-step="-1" aria-label="${t({ pt: 'Projeto anterior', en: 'Previous project' })}"><i class="bi bi-arrow-left"></i></button>
            <button class="icon-btn" data-step="1" aria-label="${t({ pt: 'Próximo projeto', en: 'Next project' })}"><i class="bi bi-arrow-right"></i></button>
            <button class="icon-btn" data-close aria-label="${t({ pt: 'Fechar', en: 'Close' })}"><i class="bi bi-x-lg"></i></button>
        </header>
        <div class="case-scroll">
            <div class="case-gallery">${cover}${gallery}</div>
            <div class="case-body">
                <div class="projeto-meta">${badgeHTML(p)}<span>${p.year} · ${p.categories.map(c => t(categories[c])).join(' · ')}</span></div>
                <h2 id="case-title">${esc(t(p.title))}</h2>
                <p class="case-lead">${esc(t(p.summary))}</p>
                <div class="case-links">
                    ${demo ? `<a class="btn-pill" href="${demo}" target="_blank" rel="noopener noreferrer"><i class="bi bi-box-arrow-up-right"></i> ${t({ pt: 'Abrir projeto', en: 'Open project' })}</a>` : ''}
                    ${repo ? `<a class="btn-pill btn-ghost" href="${repo}" target="_blank" rel="noopener noreferrer"><i class="bi bi-github"></i> ${t({ pt: 'Ver código', en: 'View code' })}</a>` : ''}
                    ${p.private ? `<span class="tag-private"><i class="bi bi-lock-fill"></i> ${t({ pt: 'Repositório privado', en: 'Private repository' })}</span>` : ''}
                </div>
                ${p.demoLogin ? `<p class="case-login"><i class="bi bi-key"></i> ${esc(t(p.demoLogin))}</p>` : ''}
                ${metrics ? `<ul class="case-metrics">${metrics}</ul>` : ''}
                ${section(t({ pt: 'o problema', en: 'the problem' }), p.problem && `<p>${esc(t(p.problem))}</p>`)}
                ${section(t({ pt: 'a solução', en: 'the solution' }), p.solution && `<p>${esc(t(p.solution))}</p>`)}
                ${section(t({ pt: 'destaques técnicos', en: 'technical highlights' }), highlights && `<ul class="case-highlights">${highlights}</ul>`)}
                ${section('stack', `<div class="tech-chips">${stack}</div>`)}
            </div>
        </div>`;
}

function show(p) {
    const apply = () => {
        dialog.innerHTML = html(p);
        if (!dialog.open) dialog.showModal();
        dialog.querySelector('.case-scroll').scrollTop = 0;
    };
    // the card's cover morphs into the modal's first image
    // only when a click opened it: a deep link on page load should not wait for a transition frame
    const cover = fromClick && !dialog.open && document.querySelector(`.projeto-card[data-id="${p.id}"] .img-port`);
    fromClick = false;
    if (!cover || !document.startViewTransition || reducedMotion()) return apply();
    cover.style.viewTransitionName = 'case-cover';
    document.startViewTransition(() => { cover.style.viewTransitionName = ''; apply(); });
}

function sync() {
    const p = byId(currentId());
    if (p) show(p);
    else if (dialog.open) dialog.close();
}

let fromClick = false;

export const openProject = id => { location.hash = `/p/${id}`; };

function step(delta) {
    const i = projects.findIndex(p => p.id === currentId());
    const next = projects[(i + delta + projects.length) % projects.length];
    // replace, so Back leaves the modal instead of walking through every project seen
    location.replace(`#/p/${next.id}`);
}

export function initCaseStudy() {
    document.addEventListener('click', e => {
        const opener = e.target.closest('[data-open]');
        if (opener) { fromClick = true; openProject(opener.dataset.open); }
    });

    dialog.addEventListener('click', e => {
        if (e.target === dialog || e.target.closest('[data-close]')) return dialog.close();
        const btn = e.target.closest('[data-step]');
        if (btn) step(Number(btn.dataset.step));
    });

    dialog.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
    });

    // closed by Esc / X / backdrop: drop the hash without adding a scroll jump
    dialog.addEventListener('close', () => {
        if (currentId()) history.pushState(null, '', location.pathname + location.search);
    });

    addEventListener('hashchange', sync);
    document.addEventListener('langchange', () => { if (dialog.open) sync(); });
    sync();
}
