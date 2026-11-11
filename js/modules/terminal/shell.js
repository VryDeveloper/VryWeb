// The shell: reads a line, finds the command, hands it an `io` object to print with.
// Everything printed goes through textContent or DOM nodes: visitors type here, and
// the recruiter's name and message must never reach innerHTML.
import { t } from '../i18n.js';
import { tokenize, commandName, suggest, commonPrefix } from './lib.js';
import { commands, findCommand } from './commands.js';

const card = document.getElementById('terminal');
const body = document.getElementById('gh-terminal');
const log = document.getElementById('term-log');
const form = document.getElementById('term-form');
const input = document.getElementById('term-input');
const field = input.parentElement;
const promptEl = document.getElementById('term-prompt');
const title = document.getElementById('term-title');
const chips = document.getElementById('term-chips');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

const HISTORY_KEY = 'term-history';
const USER_KEY = 'term-user';

export class Cancel extends Error {}

const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
};

let history = store.get(HISTORY_KEY, []);
let historyIndex = history.length;
let draft = '';
let busy = false;
let ask = null;            // pending io.prompt(): { question, resolve, reject }
let controller = null;     // aborted by Ctrl+C while a command runs

// ── output ───────────────────────────────────────────────────────
function node(part) {
    if (part instanceof Node) return part;
    return document.createTextNode(String(part ?? ''));
}

function span(text, cls) {
    const el = document.createElement('span');
    if (cls) el.className = cls;
    el.textContent = text;
    return el;
}

const scrollDown = () => { body.scrollTop = body.scrollHeight; };

function print(parts = '', cls = '') {
    const p = document.createElement('p');
    p.className = `term-line ${cls}`.trim();
    for (const part of [].concat(parts)) p.append(node(part));
    log.append(p);
    scrollDown();
    return p;
}

function promptNodes(user = getUser()) {
    return [span(user, 'u'), '@', span('vryweb', 'h'), ':', span('~', 'd'), '$'];
}

function echo(text, label) {
    const p = print([], 'term-echo');
    const prefix = span('', 'p');
    if (label) prefix.textContent = label;
    else prefix.append(...promptNodes());
    p.append(prefix, ' ', span(text, 'cmd'));
    return p;
}

function sleep(ms, signal) {
    if (reduced.matches) ms = 0;
    return new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(new Cancel());
        const id = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => { clearTimeout(id); reject(new Cancel()); }, { once: true });
    });
}

// ── identity: the prompt shows the recruiter's name after /git commit asks for it ──
export const getUser = () => store.get(USER_KEY, null) ?? t({ pt: 'visitante', en: 'guest' });

export function setUser(name) {
    const user = name.trim().split(/\s+/)[0].toLowerCase().replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 20);
    if (!user) return;
    store.set(USER_KEY, user);
    renderPrompt();
}

function renderPrompt() {
    if (ask) {
        promptEl.textContent = ask.question;
        promptEl.classList.add('ask');
    } else {
        promptEl.replaceChildren(...(busy ? [] : promptNodes()));
        promptEl.classList.remove('ask');
    }
    title.textContent = `${getUser()}@vryweb: ~`;
}

// ── the io object every command receives ─────────────────────────
const io = {
    print,
    span,
    // a whole element (lists, bars) appended as-is
    block(el) { log.append(el); scrollDown(); return el; },
    store,
    get signal() { return controller?.signal; },
    sleep: ms => sleep(ms, controller?.signal),

    async lines(list, { delay = 45, cls = '' } = {}) {
        for (const parts of list) {
            print(parts, cls);
            await sleep(delay, controller?.signal);
        }
    },

    link(label, href, { download } = {}) {
        const a = document.createElement('a');
        a.className = 'term-link';
        a.textContent = label;
        a.href = href;
        if (download) a.download = download;
        else if (/^https?:/.test(href)) Object.assign(a, { target: '_blank', rel: 'noopener noreferrer' });
        return a;
    },

    button(label, onClick) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'term-btn';
        b.textContent = label;
        b.addEventListener('click', onClick);
        return b;
    },

    // waits for the visitor's next line; Ctrl+C rejects with Cancel
    prompt(question) {
        return new Promise((resolve, reject) => {
            ask = { question, resolve, reject };
            renderPrompt();
            input.focus({ preventScroll: true });
            scrollDown();
        });
    },

    clear() { log.replaceChildren(); },
    get user() { return getUser(); },
    setUser,
};

// ── running a line ───────────────────────────────────────────────
export async function execute(raw) {
    if (ask) {
        const pending = ask;
        ask = null;
        echo(raw, pending.question);
        renderPrompt();
        pending.resolve(raw);
        return;
    }
    if (busy) return;

    const line = raw.trim();
    echo(raw);
    if (!line) return;

    if (history.at(-1) !== line) history = [...history, line].slice(-50);
    store.set(HISTORY_KEY, history);
    historyIndex = history.length;

    const [first, ...args] = tokenize(line);
    const name = commandName(first);
    const command = findCommand(name);
    if (!command) {
        print(t({ pt: `vryweb: comando não encontrado: ${name}`, en: `vryweb: command not found: ${name}` }), 'err');
        const guess = suggest(name, commands.filter(c => !c.hidden).flatMap(c => [c.name, ...(c.aliases ?? [])]));
        if (guess) print(t({ pt: `Você quis dizer /${guess}?`, en: `Did you mean /${guess}?` }), 'dim');
        return;
    }

    busy = true;
    controller = new AbortController();
    renderPrompt();
    try {
        await command.run(args, io, line);
    } catch (err) {
        if (!(err instanceof Cancel)) {
            print(`${name}: ${err.message}`, 'err');
            console.error(err);
        }
    } finally {
        busy = false;
        ask = null;
        controller = null;
        renderPrompt();
        scrollDown();
    }
}

function cancel() {
    if (ask) {
        echo(`${input.value}^C`, ask.question);
        const pending = ask;
        ask = null;
        input.value = '';
        pending.reject(new Cancel());
    } else if (busy) {
        print('^C', 'dim');
        controller?.abort();
    } else {
        echo(`${input.value}^C`);
        input.value = '';
    }
    updateCursor();
}

// ── input handling ───────────────────────────────────────────────
function updateCursor() {
    field.classList.toggle('overflow', input.scrollWidth > input.clientWidth);
    field.style.setProperty('--col', input.selectionStart ?? input.value.length);
}

function recall(step) {
    if (!history.length) return;
    if (historyIndex === history.length) draft = input.value;
    historyIndex = Math.max(0, Math.min(history.length, historyIndex + step));
    input.value = historyIndex === history.length ? draft : history[historyIndex];
    requestAnimationFrame(() => { input.setSelectionRange(input.value.length, input.value.length); updateCursor(); });
}

// types a command into the prompt, then runs it (used by the chips and the intro)
export async function type(text, { delay = 40 } = {}) {
    if (busy && !ask) return;
    input.value = '';
    for (const ch of text) {
        input.value += ch;
        updateCursor();
        await sleep(delay);
    }
    input.value = '';
    updateCursor();
    await execute(text);
}

// Tab: complete the command name, or the argument when the command offers candidates.
// One match fills it in; several extend to their common prefix, then list on a second Tab.
function complete() {
    const value = input.value;
    const words = value.split(/\s+/);
    const partial = words.at(-1);
    let candidates;
    if (words.length === 1) {
        const slash = partial.startsWith('/') ? '/' : '';
        const name = commandName(partial);
        candidates = commands.filter(c => !c.hidden).flatMap(c => [c.name, ...(c.aliases ?? [])])
            .filter(n => n.startsWith(name)).map(n => slash + n);
    } else {
        const command = findCommand(commandName(words[0]));
        candidates = (command?.complete?.(words.slice(1, -1)) ?? []).filter(c => c.startsWith(partial));
    }
    candidates = [...new Set(candidates)].sort();
    if (!candidates.length) return;

    const head = value.slice(0, value.length - partial.length);
    if (candidates.length === 1) {
        input.value = `${head}${candidates[0]} `;
    } else {
        const prefix = commonPrefix(candidates);
        if (prefix.length > partial.length) input.value = head + prefix;
        else {
            echo(value);
            print(candidates.join('   '), 'dim');
        }
    }
    updateCursor();
}

function onKeydown(e) {
    const key = e.key.toLowerCase();
    if (e.ctrlKey && key === 'c' && !input.value.slice(input.selectionStart, input.selectionEnd)) {
        e.preventDefault();
        cancel();
    } else if (e.ctrlKey && key === 'l') {
        e.preventDefault();
        io.clear();
    } else if (e.key === 'Tab' && input.value.trim() && !ask && !e.shiftKey) {
        // with an empty prompt Tab keeps moving focus, so links in the output stay reachable
        e.preventDefault();
        complete();
    } else if (e.key === 'ArrowUp' && !ask) {
        e.preventDefault();
        recall(-1);
    } else if (e.key === 'ArrowDown' && !ask) {
        e.preventDefault();
        recall(1);
    }
}

// ── full screen: the same card moves into a <dialog>, so history and state come along ──
const dialog = document.getElementById('term-dialog');
const fullButton = document.getElementById('term-full');
const home = document.createComment('terminal');

function setFullLabel(open) {
    const label = open ? { pt: 'Sair da tela cheia', en: 'Exit full screen' } : { pt: 'Abrir terminal em tela cheia', en: 'Open terminal full screen' };
    fullButton.setAttribute('aria-label', t(label));
    fullButton.dataset.ariaPt = label.pt;
    fullButton.dataset.ariaEn = label.en;
    fullButton.querySelector('i').className = `bi ${open ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'}`;
}

export function openFull() {
    if (dialog.open) return input.focus();
    card.before(home);
    dialog.append(card);
    dialog.showModal();
    setFullLabel(true);
    scrollDown();
    input.focus({ preventScroll: true });
}

export const closeFull = () => { if (dialog.open) dialog.close(); };

dialog.addEventListener('close', () => {
    home.replaceWith(card);
    setFullLabel(false);
});
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

let started = false;

export async function start() {
    if (started) return;
    started = true;

    body.classList.add('live');
    form.hidden = false;
    chips.hidden = false;
    fullButton.hidden = false;
    fullButton.addEventListener('click', () => (dialog.open ? closeFull() : openFull()));
    renderPrompt();
    input.placeholder = t({ pt: 'digite /help ou toque num comando ↓', en: 'type /help or tap a command ↓' });

    form.addEventListener('submit', e => {
        e.preventDefault();
        const value = input.value;
        input.value = '';
        input.placeholder = '';
        updateCursor();
        execute(value);
    });
    input.addEventListener('keydown', onKeydown);
    for (const type of ['input', 'keyup', 'click', 'select', 'focus']) input.addEventListener(type, updateCursor);

    // clicking anywhere in the terminal focuses the prompt, unless the visitor is selecting text
    body.addEventListener('click', e => {
        if (e.target.closest('a, button') || !getSelection().isCollapsed) return;
        input.focus({ preventScroll: true });
    });

    chips.addEventListener('click', e => {
        const chip = e.target.closest('[data-cmd]');
        if (chip) { input.placeholder = ''; type(chip.dataset.cmd, { delay: 25 }); }
    });

    document.addEventListener('langchange', () => {
        renderPrompt();
        if (input.placeholder) input.placeholder = t({ pt: 'digite /help ou toque num comando ↓', en: 'type /help or tap a command ↓' });
    });

    log.replaceChildren();
    print(t({ pt: 'VryWeb OS 3.0 (tty1) — último login: hoje, de Salvador, BA', en: 'VryWeb OS 3.0 (tty1) — last login: today, from Salvador, BA' }), 'dim');
    print(t({ pt: 'Digite /help para ver os comandos.', en: 'Type /help to see the commands.' }), 'dim');
    print('');

    // the intro types `gh` once the terminal is actually on screen, unless the visitor got there first
    new IntersectionObserver(([entry], observer) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (!input.value && !busy && !history.length) type('gh profile view VryDeveloper', { delay: 28 });
        else if (!input.value && !busy) execute('gh profile view VryDeveloper');
    }, { threshold: 0.4 }).observe(card);
}
