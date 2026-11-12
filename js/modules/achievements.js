// Achievements: small goals that reward exploring the site. Progress lives in
// localStorage only; stats.js just counts, anonymously, that someone unlocked one. Sources:
//   vw:event   from the terminal, git and the palette (events.js)
//   observed   theme (data-theme), language (langchange), case studies (#/p/<id>), Konami code
import { t } from './i18n.js';
import { toast } from './toast.js';
import { emit } from './events.js';

const KEY = 'vw-achievements';

export const ACHIEVEMENTS = [
    { id: 'hello',    icon: 'bi-terminal',        name: { pt: 'Hello, World', en: 'Hello, World' },                 hint: { pt: 'rode qualquer comando no terminal', en: 'run any command in the terminal' } },
    { id: 'rtfm',     icon: 'bi-book',            name: { pt: 'RTFM', en: 'RTFM' },                                 hint: { pt: 'leia o manual', en: 'read the manual' } },
    { id: 'resume',   icon: 'bi-file-earmark-person', name: { pt: 'Recrutador nível 1', en: 'Recruiter level 1' },  hint: { pt: 'baixe o currículo', en: 'download the résumé' } },
    { id: 'info',     icon: 'bi-person-vcard',    name: { pt: 'Ficha completa', en: 'Full profile' },               hint: { pt: 'peça minhas informações', en: 'ask for my details' } },
    { id: 'linkedin', icon: 'bi-linkedin',        name: { pt: 'Networking', en: 'Networking' },                     hint: { pt: 'conheça meu perfil profissional', en: 'see my professional profile' } },
    { id: 'commit',   icon: 'bi-git',             name: { pt: 'Primeiro commit', en: 'First commit' },              hint: { pt: 'deixe uma mensagem pelo terminal', en: 'leave a message through the terminal' } },
    { id: 'push',     icon: 'bi-rocket-takeoff',  name: { pt: 'Deploy em produção', en: 'Shipped to production' },  hint: { pt: 'envie o seu commit', en: 'push your commit' } },
    { id: 'curious',  icon: 'bi-search',          name: { pt: 'Curioso', en: 'Curious' },                           hint: { pt: 'abra 3 projetos diferentes', en: 'open 3 different projects' } },
    { id: 'theme',    icon: 'bi-circle-half',     name: { pt: 'Lado claro da força', en: 'Light side of the force' }, hint: { pt: 'troque o tema', en: 'switch the theme' } },
    { id: 'lang',     icon: 'bi-translate',       name: { pt: 'Poliglota', en: 'Polyglot' },                        hint: { pt: 'troque o idioma', en: 'switch the language' } },
    { id: 'palette',  icon: 'bi-command',         name: { pt: 'Power user', en: 'Power user' },                     hint: { pt: 'abra a paleta com Ctrl+K', en: 'open the palette with Ctrl+K' } },
    { id: 'hacker',   icon: 'bi-incognito',       name: { pt: 'Hacker', en: 'Hacker' },                             hint: { pt: 'ache 3 comandos escondidos no terminal', en: 'find 3 hidden terminal commands' } },
    { id: 'architect', icon: 'bi-bricks',         name: { pt: 'Arquiteto de stack', en: 'Stack architect' },        hint: { pt: 'complete o desafio "monte a stack" em Habilidades', en: 'finish a "build the stack" challenge in Skills' } },
    { id: 'throw',    icon: 'bi-wind',            name: { pt: 'Arremesso', en: 'Yeet' },                            hint: { pt: 'arremesse uma habilidade com força', en: 'throw a skill really hard' } },
    { id: 'snake',    icon: 'bi-grid-3x3-gap-fill', name: { pt: 'Cobrinha', en: 'Snake' },                       hint: { pt: 'coma 10 dias de commits no jogo da cobrinha', en: 'eat 10 days of commits in the snake game' } },
];

// terminal commands that unlock something by name
const BY_COMMAND = { help: 'rtfm', resume: 'resume', info: 'info', linkedin: 'linkedin' };
// other vw:event types that unlock something directly
const BY_EVENT = { commit: 'commit', push: 'push', palette: 'palette', stack: 'architect', throw: 'throw', snake: 'snake' };
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

function read() {
    try {
        const s = JSON.parse(localStorage.getItem(KEY));
        if (s && typeof s === 'object') return { unlocked: s.unlocked ?? {}, cases: s.cases ?? [], eggs: s.eggs ?? [] };
    } catch {}
    return { unlocked: {}, cases: [], eggs: [] };
}
let state = read();
const write = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

export const isUnlocked = id => id in state.unlocked;
export const progress = () => ({ done: Object.keys(state.unlocked).length, total: ACHIEVEMENTS.length, unlocked: { ...state.unlocked } });

function unlock(id) {
    if (isUnlocked(id) || !ACHIEVEMENTS.some(a => a.id === id)) return;
    state.unlocked[id] = Date.now();
    write();
    emit('unlock', { id });
    const a = ACHIEVEMENTS.find(x => x.id === id);
    const { done, total } = progress();
    toast(`🏆 ${t({ pt: 'Conquista desbloqueada', en: 'Achievement unlocked' })}: ${t(a.name)} · ${done}/${total}`);
    renderTrophy(true);
    if (dialog?.open) renderPanel();
    if (done === total) setTimeout(() => toast(t({ pt: '🎓 100%! Rode achievements no terminal para pegar o certificado.', en: '🎓 100%! Run achievements in the terminal to get your certificate.' })), 3000);
}

// keeps a set of distinct ids, unlocking `id` once it reaches `need`
function collect(list, value, need, id) {
    if (!list.includes(value)) { list.push(value); write(); }
    if (list.length >= need) unlock(id);
}

function onEvent({ detail }) {
    if (detail.type === 'command') {
        unlock('hello');
        if (BY_COMMAND[detail.name]) unlock(BY_COMMAND[detail.name]);
        if (detail.hidden) collect(state.eggs, detail.name, 3, 'hacker');
    } else if (BY_EVENT[detail.type]) {
        unlock(BY_EVENT[detail.type]);
    }
}

// ── trophy in the nav and the list panel ──────────────────────────
const button = document.getElementById('trophy');
const count = document.getElementById('trophy-count');
const dialog = document.getElementById('achievements');

function renderTrophy(bump = false) {
    if (!button) return;
    const { done, total } = progress();
    button.hidden = done === 0;          // shows up with the first achievement, so it is a surprise
    count.textContent = `${done}/${total}`;
    button.setAttribute('aria-label', t({ pt: `Conquistas: ${done} de ${total}`, en: `Achievements: ${done} of ${total}` }));
    if (bump && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        button.classList.remove('bump');
        void button.offsetWidth;
        button.classList.add('bump');
    }
}

function renderPanel() {
    const { done, total } = progress();
    const items = ACHIEVEMENTS.map(a => {
        const on = isUnlocked(a.id);
        const li = document.createElement('li');
        li.className = on ? 'on' : '';
        const icon = document.createElement('i');
        icon.className = `bi ${on ? a.icon : 'bi-lock-fill'}`;
        icon.setAttribute('aria-hidden', 'true');
        const text = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = on ? t(a.name) : '???';
        const hint = document.createElement('span');
        hint.textContent = t(a.hint);
        text.append(name, hint);
        li.append(icon, text);
        return li;
    });

    const head = document.createElement('header');
    const title = document.createElement('h2');
    title.id = 'ach-title';
    title.textContent = t({ pt: 'Conquistas', en: 'Achievements' });
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'ach-close';
    close.setAttribute('aria-label', t({ pt: 'Fechar', en: 'Close' }));
    close.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
    close.addEventListener('click', () => dialog.close());
    head.append(title, close);

    const bar = document.createElement('div');
    bar.className = 'ach-bar';
    bar.style.setProperty('--p', done / total);
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', 0);
    bar.setAttribute('aria-valuemax', total);
    bar.setAttribute('aria-valuenow', done);
    const label = document.createElement('p');
    label.className = 'ach-count';
    label.textContent = t({ pt: `${done} de ${total} desbloqueadas`, en: `${done} of ${total} unlocked` });

    const list = document.createElement('ul');
    list.append(...items);
    const foot = document.createElement('p');
    foot.className = 'ach-foot';
    foot.textContent = t({ pt: 'Dica: abra o terminal com ` e rode achievements.', en: 'Tip: open the terminal with ` and run achievements.' });

    dialog.replaceChildren(head, label, bar, list, foot);
}

export function openAchievements() {
    renderPanel();
    dialog.showModal();
}

export function initAchievements() {
    document.addEventListener('vw:event', onEvent);

    // theme: watched on <html>, whatever switched it (toggle, palette or terminal)
    let theme = document.documentElement.dataset.theme;
    new MutationObserver(() => {
        if (document.documentElement.dataset.theme !== theme) unlock('theme');
        theme = document.documentElement.dataset.theme;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    document.addEventListener('langchange', () => { unlock('lang'); renderTrophy(); });

    const caseFromHash = () => {
        const id = location.hash.match(/^#\/p\/([\w-]+)/)?.[1];
        if (id) collect(state.cases, id, 3, 'curious');
    };
    addEventListener('hashchange', caseFromHash);
    caseFromHash();

    let keys = [];
    document.addEventListener('keydown', e => {
        keys = [...keys, e.key.toLowerCase()].slice(-KONAMI.length);
        if (keys.join() === KONAMI.join()) unlock('hacker');
    });

    button?.addEventListener('click', openAchievements);
    dialog?.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    renderTrophy();
}
