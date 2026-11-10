import { projects, statuses, techIcon } from '../data/projects.js';
import { t } from './i18n.js';
import { observeReveals } from './reveal.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function coverHTML(p) {
    if (p.cover) return `<div class="img-port" style="background-image: url(${p.cover})"></div>`;
    return `<div class="img-port placeholder" role="img" aria-label="${esc(t(p.title))}"><i class="bi ${p.icon}"></i></div>`;
}

function linksHTML(p) {
    const { repo, demo } = p.links ?? {};
    const out = [];
    if (repo) out.push(`<a href="${repo}" target="_blank" rel="noopener noreferrer"><i class="bi bi-github"></i> GitHub</a>`);
    if (demo) out.push(`<a href="${demo}" target="_blank" rel="noopener noreferrer"><i class="bi bi-link-45deg"></i> ${t({ pt: 'Abrir', en: 'Open' })}</a>`);
    if (p.private) out.push(`<span class="tag-private">${t({ pt: 'Repositório privado', en: 'Private repository' })}</span>`);
    return out.join('');
}

export function cardHTML(p) {
    const badge = statuses[p.status]
        ? `<div class="projeto-badge"><span class="pulse-dot"></span><span>${t(statuses[p.status])}</span></div>` : '';
    return `
        <article class="projeto-card${p.tier === 'featured' ? ' featured' : ''}" data-id="${p.id}">
            ${coverHTML(p)}
            <div class="projeto-info">
                ${p.tier === 'featured' ? badge : ''}
                <h3>${esc(t(p.title))}</h3>
                <p>${esc(t(p.summary))}</p>
                <div class="tech-icons">${p.stack.map(techIcon).join('')}</div>
                <div class="projeto-links">${linksHTML(p)}</div>
            </div>
        </article>`;
}

function render() {
    const root = document.querySelector('.portfolio-grid');
    const tier = name => projects.filter(p => p.tier === name).map(cardHTML).join('');
    root.innerHTML = `
        <div class="featured-wrap">${tier('featured')}</div>
        <h3 class="categoria-titulo produto">${t({ pt: 'Projetos principais', en: 'Main projects' })}</h3>
        <div class="flex">${tier('main')}</div>
        <h3 class="categoria-titulo">${t({ pt: 'Projetos de aprendizado', en: 'Learning projects' })}</h3>
        <div class="flex">${tier('archive')}</div>`;
    observeReveals(root);
}

export function initProjects() {
    render();
    document.addEventListener('langchange', render);
}
