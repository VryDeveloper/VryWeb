// `git commit` writes a message to Victor; `git push` opens WhatsApp with it.
// Answers are saved after every prompt, so a closed tab resumes where it stopped.
// Nothing leaves the browser until the visitor runs `git push` themselves.
import { t } from '../i18n.js';
import { EMAIL, whatsappURL, WHATSAPP, copyEmail } from '../actions.js';
import { shortHash, slug } from './lib.js';

const KEY = 'term-git';
const MAX = 500;
const SUBJECTS = [
    { pt: 'Vaga', en: 'Job opening' },
    { pt: 'Freela', en: 'Freelance' },
    { pt: 'Só um oi', en: 'Just saying hi' },
];

const load = io => io.store.get(KEY, { draft: null, author: null, commits: [] });
const save = (io, state) => io.store.set(KEY, state);

// pure: the text that lands in WhatsApp (exported for tests)
export function whatsappText({ name, company, subject, message, hash }, lang = 'pt') {
    const pt = lang === 'pt';
    return [
        pt ? 'Olá, Victor! Vim pelo seu portfólio.' : 'Hi Victor! I found you through your portfolio.',
        `${pt ? 'Nome' : 'Name'}: ${name}${company ? ` · ${pt ? 'Empresa' : 'Company'}: ${company}` : ''}`,
        `${pt ? 'Assunto' : 'Subject'}: ${subject}`,
        '',
        message,
        '',
        `— ${pt ? 'enviado via' : 'sent via'} git push ${hash} 😄`,
    ].join('\n');
}

// pure: pulls -m "message" out of the arguments
export function parseMessageFlag(args) {
    const i = args.findIndex(a => a === '-m' || a === '--message');
    return i === -1 ? null : (args[i + 1] ?? '');
}

async function ask(io, question, { required = false, error } = {}) {
    for (;;) {
        const answer = (await io.prompt(question)).trim().slice(0, MAX);
        if (answer || !required) return answer;
        io.print(error, 'err');
    }
}

async function commit(args, io) {
    const state = load(io);
    const flag = parseMessageFlag(args);
    const draft = state.draft ?? {};
    const keep = () => { state.draft = draft; save(io, state); };

    if (state.draft) io.print(t({ pt: 'hint: retomando o rascunho que você começou antes.', en: 'hint: resuming the draft you started earlier.' }), 'dim');
    else if (state.author) io.print(t({ pt: 'hint: Ctrl+C cancela, o rascunho fica salvo.', en: 'hint: Ctrl+C cancels, the draft is kept.' }), 'dim');
    else io.print(t({ pt: 'hint: primeiro, quem é você? (Ctrl+C cancela, o rascunho fica salvo)', en: 'hint: first, who are you? (Ctrl+C cancels, the draft is kept)' }), 'dim');

    // a returning recruiter is not asked again, like a saved git config
    if (!draft.name && state.author) {
        Object.assign(draft, state.author);
        io.print(`Author: ${draft.name}${draft.company ? ` <${draft.company}>` : ''}`, 'dim');
    }
    if (!draft.name) {
        draft.name = await ask(io, t({ pt: '? Seu nome:', en: '? Your name:' }), {
            required: true, error: t({ pt: 'error: o nome não pode ficar vazio', en: 'error: name cannot be empty' }),
        });
        io.setUser(draft.name);
        keep();
    }
    if (draft.company === undefined) {
        draft.company = await ask(io, t({ pt: '? Empresa (opcional):', en: '? Company (optional):' }));
        keep();
    }
    if (!draft.subject) {
        const options = SUBJECTS.map((s, i) => `(${i + 1}) ${t(s)}`).join('  ');
        const answer = await ask(io, t({ pt: `? Assunto: ${options} ›`, en: `? Subject: ${options} ›` }));
        const index = Number(answer) - 1;
        const typed = SUBJECTS.findIndex(s => [s.pt, s.en].some(v => v.toLowerCase() === answer.toLowerCase()));
        draft.subject = t(SUBJECTS[index] ?? SUBJECTS[typed] ?? (answer ? { pt: answer, en: answer } : SUBJECTS[0]));
        keep();
    }
    if (flag !== null) draft.message = flag.trim().slice(0, MAX);
    if (!draft.message) {
        draft.message = await ask(io, t({ pt: '? Mensagem:', en: '? Message:' }));
        if (!draft.message) {
            keep();
            io.print(t({ pt: 'Abortando o commit: mensagem vazia.', en: 'Aborting commit due to empty commit message.' }), 'err');
            return;
        }
    }

    const hash = shortHash(`${draft.name}|${draft.company}|${draft.subject}|${draft.message}`);
    const file = `mensagens/${slug(draft.name)}.txt`;
    state.commits.push({ ...draft, hash, at: Date.now(), pushed: false });
    state.author = { name: draft.name, company: draft.company };
    state.draft = null;
    save(io, state);

    io.print('');
    await io.lines([
        `[main ${hash}] ${draft.subject}: ${draft.name}${draft.company ? ` (${draft.company})` : ''}`,
        ' 1 file changed, 1 insertion(+)',
        ` create mode 100644 ${file}`,
    ], { delay: 80 });
    io.print('');
    io.print([`✔ ${t({ pt: 'Commit salvo. Rode', en: 'Commit saved. Run' })} `, io.span('git push', 'k'), ` ${t({ pt: 'para me enviar no WhatsApp.', en: 'to send it to me on WhatsApp.' })}`], 'ok');
}

async function push(args, io) {
    const state = load(io);
    const pending = state.commits.filter(c => !c.pushed).at(-1);
    if (!pending) {
        io.print(t({ pt: 'error: nada para enviar. Rode git commit primeiro.', en: 'error: nothing to push. Run git commit first.' }), 'err');
        return;
    }
    const url = whatsappURL(whatsappText(pending, t({ pt: 'pt', en: 'en' })));
    await io.lines([
        'Enumerating objects: 1, done.',
        'Writing objects: 100% (1/1), done.',
        `To wa.me/${WHATSAPP}`,
        ` * [new branch]      ${slug(pending.name)} -> victor`,
    ], { delay: 90 });
    pending.pushed = true;
    save(io, state);
    io.print(`✔ ${t({ pt: 'Abrindo o WhatsApp...', en: 'Opening WhatsApp...' })}`, 'ok');
    // still within the Enter's user activation, so the popup is allowed; the link below covers stricter browsers
    window.open(url, '_blank', 'noopener');
    io.print([`  ${t({ pt: 'Não abriu?', en: "Didn't open?" })} `, io.link(t({ pt: '[abrir WhatsApp]', en: '[open WhatsApp]' }), url)], 'dim');
    io.print([`${t({ pt: 'Também pode me escrever:', en: 'You can also email me:' })} ${EMAIL} `, io.button(t({ pt: '[copiar]', en: '[copy]' }), copyEmail)], 'dim');
}

// the portfolio's own history, shown when the visitor has not committed anything yet
const MILESTONES = [
    { year: 2026, msg: { pt: 'feat: formatura, testes e CI', en: 'feat: graduation, tests and CI' } },
    { year: 2025, msg: { pt: 'deploy: Kitsuy Store em produção', en: 'deploy: Kitsuy Store in production' } },
    { year: 2025, msg: { pt: 'feat: primeiro cliente (Copec)', en: 'feat: first client (Copec)' } },
    { year: 2024, msg: { pt: 'chore: início em ADS na FIAP', en: 'chore: started Systems Analysis at FIAP' } },
    { year: 2023, msg: { pt: 'init: primeiras linhas de código', en: 'init: first lines of code' } },
];

function log(args, io) {
    const { commits } = load(io);
    if (!commits.length) {
        for (const m of MILESTONES) {
            const text = t(m.msg);
            io.print([io.span(shortHash(text), 'v'), ` (${m.year}) ${text}`]);
        }
        io.print('');
        io.print(t({ pt: 'Seu commit ainda não está aqui. git commit resolve isso.', en: 'Your commit is not here yet. git commit fixes that.' }), 'dim');
        return;
    }
    const date = new Intl.DateTimeFormat(t({ pt: 'pt-BR', en: 'en' }), { dateStyle: 'medium', timeStyle: 'short' });
    for (const c of [...commits].reverse()) {
        io.print([io.span(`commit ${c.hash}`, 'v'), c.pushed ? ' (origin/victor)' : ` (HEAD -> main)`]);
        io.print(`Author: ${c.name}${c.company ? ` <${c.company}>` : ''}`);
        io.print(`Date:   ${date.format(c.at)}`);
        io.print('');
        io.print(`    ${c.subject}: ${c.message}`);
        io.print('');
    }
}

function status(args, io) {
    const { draft, commits } = load(io);
    const ahead = commits.filter(c => !c.pushed).length;
    io.print(t({ pt: 'No ramo main', en: 'On branch main' }));
    if (ahead) io.print(t({ pt: `Seu ramo está ${ahead} commit(s) à frente de origin/victor. (use git push)`, en: `Your branch is ahead of 'origin/victor' by ${ahead} commit(s). (use git push)` }));
    if (draft) {
        const filled = ['name', 'company', 'subject', 'message'].filter(k => draft[k]).join(', ');
        io.print(t({ pt: 'Mudanças a commitar:', en: 'Changes to be committed:' }));
        io.print(`        ${t({ pt: 'rascunho', en: 'draft' })}:   mensagens/${slug(draft.name ?? 'rascunho')}.txt  (${filled || '—'})`, 'ok');
        io.print(t({ pt: '(rode git commit para continuar)', en: '(run git commit to continue)' }), 'dim');
    } else if (!ahead) {
        io.print(t({ pt: 'nada a commitar, árvore de trabalho limpa', en: 'nothing to commit, working tree clean' }));
    }
}

const SUB = { commit, push, log, status };

export const gitCommand = {
    name: 'git',
    label: 'git commit',
    desc: { pt: 'me mandar uma mensagem no WhatsApp', en: 'send me a message on WhatsApp' },
    usage: {
        pt: 'git commit [-m "mensagem"]  ·  git push  ·  git log  ·  git status',
        en: 'git commit [-m "message"]  ·  git push  ·  git log  ·  git status',
    },
    complete: args => (args.length ? [] : Object.keys(SUB)),
    async run(args, io) {
        const [sub, ...rest] = args;
        if (SUB[sub]) return SUB[sub](rest, io);
        if (sub === 'add') return io.print(t({ pt: 'nada para adicionar: aqui tudo já está staged. Use git commit.', en: 'nothing to add: everything is already staged here. Use git commit.' }), 'dim');
        if (sub) io.print(t({ pt: `git: '${sub}' não é um comando do git.`, en: `git: '${sub}' is not a git command.` }), 'err');
        io.print(t(this.usage), 'dim');
    },
};
