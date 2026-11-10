// Static copy lives in the HTML as data-pt / data-en; data-driven copy is { pt, en }
// objects resolved with t(). Modules that render listen for 'langchange'.
let lang;
try { lang = localStorage.getItem('lang'); } catch {}
lang ||= navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';

export const getLang = () => lang;

export const t = v => (v && typeof v === 'object' && !Array.isArray(v) && ('pt' in v || 'en' in v)) ? (v[lang] ?? v.en) : v;

export function applyLang(next = lang) {
    lang = next;
    document.querySelectorAll('[data-pt][data-en]').forEach(el => {
        el.innerHTML = el.getAttribute(`data-${lang}`);
    });
    document.querySelectorAll('[data-aria-pt]').forEach(el => {
        el.setAttribute('aria-label', el.getAttribute(`data-aria-${lang}`));
    });
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'pt' ? 'EN' : 'PT';
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    try { localStorage.setItem('lang', lang); } catch {}
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

export const toggleLang = () => applyLang(lang === 'pt' ? 'en' : 'pt');

export function initI18n() {
    document.getElementById('lang-toggle')?.addEventListener('click', toggleLang);
    applyLang();
}
