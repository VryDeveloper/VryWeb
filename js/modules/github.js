// Live data from GitHub's public API for the terminal's `gh` command.
// Unauthenticated calls are limited to 60/hour per IP, so the result is cached for
// 6 hours; on failure the command prints a static summary instead.
import { t, getLang } from './i18n.js';
import { esc } from './projects.js';

const USER = 'VryDeveloper';
const CACHE_KEY = 'gh-cache-v1';
const TTL = 6 * 60 * 60 * 1000;
const COLORS = ['var(--pal-1)', 'var(--pal-2)', 'var(--pal-3)', 'var(--pal-4)', 'var(--text-color-p)'];

export async function loadGitHub() {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && Date.now() - cached.at < TTL) return cached;
    } catch {}

    const get = async path => {
        const res = await fetch(`https://api.github.com${path}`, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error(`GitHub ${res.status}`);
        return res.json();
    };
    const [user, repos] = await Promise.all([
        get(`/users/${USER}`),
        get(`/users/${USER}/repos?per_page=100&sort=pushed`),
    ]);
    const data = {
        at: Date.now(),
        publicRepos: user.public_repos,
        repos: repos.filter(r => !r.fork && r.name !== USER).map(r => ({ name: r.name, url: r.html_url, language: r.language, pushed: r.pushed_at })),
    };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
    return data;
}

function relative(iso) {
    const rtf = new Intl.RelativeTimeFormat(getLang() === 'pt' ? 'pt-BR' : 'en', { numeric: 'auto' });
    const hours = (new Date(iso) - Date.now()) / 36e5;
    if (Math.abs(hours) < 24) return rtf.format(Math.round(hours), 'hour');
    const days = hours / 24;
    if (Math.abs(days) < 30) return rtf.format(Math.round(days), 'day');
    return rtf.format(Math.round(days / 30), 'month');
}

// every API string goes through esc() before it reaches innerHTML
export function githubHTML(data) {
    const line = body => `<p class="term-line result"><span class="arrow">→</span>${body}</p>`;
    const [latest] = data.repos;

    const counts = {};
    data.repos.forEach(r => { if (r.language) counts[r.language] = (counts[r.language] ?? 0) + 1; });
    const langs = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const recent = data.repos.slice(0, 3)
        .map(r => `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a>`).join(', ');

    return [
        line(t({ pt: `${data.publicRepos} repositórios públicos`, en: `${data.publicRepos} public repositories` })),
        latest ? line(`${t({ pt: 'último push', en: 'last push' })}: ${relative(latest.pushed)} <small>(${esc(latest.name)})</small>`) : '',
        line(`${t({ pt: 'atividade recente', en: 'recent activity' })}: ${recent}`),
        line(t({ pt: 'linguagens por repositório', en: 'languages by repository' })),
        `<div class="lang-bar" aria-hidden="true">${langs.map(([, n], i) => `<span style="--n:${n};--c:${COLORS[i]}"></span>`).join('')}</div>`,
        `<p class="lang-legend">${langs.map(([name, n], i) => `<span style="--c:${COLORS[i]}">${esc(name)} ${n}</span>`).join('')}</p>`,
    ].join('');
}
