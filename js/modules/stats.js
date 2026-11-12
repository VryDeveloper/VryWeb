// Public, anonymous visit counters through GoatCounter (no cookies, no personal data).
// The site code lives only in the <script data-goatcounter> tag of index.html.
// GoatCounter counts unique visitors, so each number reads as "people who…".
// count.js does not count on localhost, so local testing never inflates the numbers.
import { t } from './i18n.js';

const EVENTS = { command: 'terminal', play: 'snake', unlock: 'achievement' };   // vw:event type -> GoatCounter event
const COUNTERS = [
    ['TOTAL', 'bi-eye', { pt: 'visitantes', en: 'visitors' }],
    ['terminal', 'bi-terminal', { pt: 'usaram o terminal', en: 'used the terminal' }],
    ['snake', 'bi-controller', { pt: 'jogaram a cobrinha', en: 'played snake' }],
    ['achievement', 'bi-trophy', { pt: 'desbloquearam conquistas', en: 'unlocked achievements' }],
];

export function initStats() {
    const script = document.querySelector('script[data-goatcounter]');
    const box = document.getElementById('visit-stats');
    if (!script || !box) return;
    const base = script.dataset.goatcounter.replace(/\/count$/, '');

    // one event of each kind per page load is enough: GoatCounter counts visitors, not clicks
    const sent = new Set();
    const send = name => window.goatcounter?.count?.({ path: name, title: name, event: true });
    document.addEventListener('vw:event', e => {
        const name = EVENTS[e.detail.type];
        if (!name || sent.has(name)) return;
        sent.add(name);
        if (window.goatcounter?.count) send(name);
        else script.addEventListener('load', () => send(name), { once: true });
    });

    // the numbers load once the footer is near; a blocked or failed request hides the strip
    new IntersectionObserver(async ([entry], observer) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const get = path => fetch(`${base}/counter/${encodeURIComponent(path)}.json`)
            .then(r => (r.status === 404 ? { count: '0' } : r.ok ? r.json() : Promise.reject(r.status)));
        try {
            const counts = await Promise.all(COUNTERS.map(([path]) => get(path)));
            // the response goes into innerHTML: only a plain formatted number is accepted
            const num = c => (/^[\d\s.,  ]+$/.test(String(c.count)) ? String(c.count) : '—');
            const render = () => {
                box.querySelector('ul').innerHTML = COUNTERS.map(([, icon, label], i) =>
                    `<li><i class="bi ${icon}" aria-hidden="true"></i><b>${num(counts[i])}</b> ${t(label)}</li>`).join('');
            };
            render();
            document.addEventListener('langchange', render);
            box.hidden = false;
        } catch {
            box.hidden = true;
        }
    }, { rootMargin: '400px' }).observe(box.parentElement);   // the box itself is display:none until filled
}
