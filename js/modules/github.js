// The terminal card "runs" a command and prints live data from GitHub's public API.
// Unauthenticated calls are limited to 60/hour per IP, so the result is cached for
// 6 hours, and any failure leaves the static lines from the HTML in place.
import { t, getLang } from './i18n.js';
import { esc } from './projects.js';

const USER = 'VryDeveloper';
const CACHE_KEY = 'gh-cache-v1';
const TTL = 6 * 60 * 60 * 1000;
const COLORS = ['var(--pal-1)', 'var(--pal-2)', 'var(--pal-3)', 'var(--pal-4)', 'var(--text-color-p)'];

async function load() {
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

function html(data) {
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

export function initGithub() {
    const terminal = document.getElementById('gh-terminal');
    const command = document.getElementById('gh-command');
    const output = document.getElementById('gh-output');
    let data = null;

    // start only when the terminal scrolls into view: no request for visitors who never get here
    new IntersectionObserver(async ([entry], io) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        const request = load().catch(() => null);
        const text = `gh api users/${USER} --jq .`;
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
            command.classList.add('typing');
            for (let i = 0; i <= text.length; i++) {
                command.textContent = text.slice(0, i);
                await new Promise(resolve => setTimeout(resolve, 28));
            }
            command.classList.remove('typing');
        }

        data = await request;
        if (!data) return;             // offline or rate limited: keep the static lines
        command.textContent = text;
        output.innerHTML = html(data);
    }, { threshold: 0.4 }).observe(terminal);

    document.addEventListener('langchange', () => { if (data) output.innerHTML = html(data); });
}
