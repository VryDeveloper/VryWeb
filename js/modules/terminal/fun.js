// Hidden commands. Not in /help, not in Tab completion, not suggested on typos:
// /help only says they exist. Each one unlocks progress toward the "Hacker" achievement.
import { t } from '../i18n.js';
import { Cancel } from './shell.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function shake() {
    if (reduced()) return;
    const card = document.getElementById('terminal');
    card.classList.remove('term-shake');
    void card.offsetWidth;                 // restart the animation if it is already running
    card.classList.add('term-shake');
    card.addEventListener('animationend', () => card.classList.remove('term-shake'), { once: true });
}

async function sudo(args, io) {
    const wish = args.join(' ').toLowerCase();
    await io.prompt(t({ pt: `[sudo] senha para ${io.user}:`, en: `[sudo] password for ${io.user}:` }), { secret: true });
    if (wish === 'hire victor') {
        await io.lines([
            [io.span(t({ pt: '✔ Permissão concedida.', en: '✔ Permission granted.' }), 'ok-text')],
            t({ pt: 'Contratando victor... dependências: café, um time bom, problemas interessantes.', en: 'Hiring victor... dependencies: coffee, a good team, interesting problems.' }),
            [t({ pt: 'Próximo passo: ', en: 'Next step: ' }), io.span('git commit', 'k'), t({ pt: ' para falar comigo.', en: ' to talk to me.' })],
        ], { delay: 200 });
    } else {
        io.print(t({ pt: `${io.user} não está no arquivo sudoers. Este incidente será reportado. 😄`, en: `${io.user} is not in the sudoers file. This incident will be reported. 😄` }), 'err');
        io.print(t({ pt: 'Dica: tente sudo hire victor', en: 'Hint: try sudo hire victor' }), 'dim');
    }
}

function rm(args, io) {
    const flags = args.filter(a => a.startsWith('-')).join('');
    if (flags.includes('r') && flags.includes('f')) {
        shake();
        io.print(t({ pt: 'Boa tentativa. 😏 Este portfólio tem backup (e testes).', en: 'Nice try. 😏 This portfolio has backups (and tests).' }), 'err');
    } else {
        io.print(t({ pt: `rm: não foi possível remover '${args.at(-1) ?? ''}': permissão negada`, en: `rm: cannot remove '${args.at(-1) ?? ''}': permission denied` }), 'err');
    }
}

// the classic: getting into vim is easy, getting out is the joke
async function vim(args, io) {
    const file = args[0] ?? t({ pt: '[sem nome]', en: '[No Name]' });
    io.print(io.span(`"${file}" [${t({ pt: 'Novo', en: 'New' })}]`, 'k'));
    for (let i = 0; i < 5; i++) io.print('~', 'dim');
    io.print(t({ pt: '-- VIM -- digite :q e Enter para sair', en: '-- VIM -- type :q and Enter to quit' }), 'dim');
    for (let tries = 0; ; tries++) {
        let cmd;
        try {
            cmd = (await io.prompt(':')).trim().replace(/^:/, '');
        } catch (err) {
            if (!(err instanceof Cancel)) throw err;
            io.print(t({ pt: 'Digite  :q  e pressione Enter para sair do Vim', en: 'Type  :q  and press <Enter> to exit Vim' }), 'dim');
            continue;
        }
        if (['q', 'q!', 'wq', 'x', 'wq!'].includes(cmd)) {
            if (tries > 2) io.print(t({ pt: 'Você saiu do vim. Isso já vale uma vaga. 🏆', en: 'You escaped vim. That alone is worth a job offer. 🏆' }), 'ok');
            return;
        }
        io.print(`E492: ${t({ pt: 'Não é um comando do editor', en: 'Not an editor command' })}: ${cmd}`, 'err');
    }
}

function coffee(args, io) {
    io.print(t({ pt: '☕ Compilando café...', en: '☕ Compiling coffee...' }));
    io.print(t({ pt: "erro 418: I'm a teapot. Tente chá. 🫖", en: "error 418: I'm a teapot. Try tea. 🫖" }), 'err');
}

// green glyph rain over the terminal for a few seconds; Ctrl+C stops it
async function matrix(args, io) {
    if (reduced()) return io.print('Wake up, Neo...', 'ok');
    const body = document.getElementById('gh-terminal');
    const canvas = document.createElement('canvas');
    canvas.className = 'term-matrix';
    canvas.setAttribute('aria-hidden', 'true');
    body.append(canvas);
    const ctx = canvas.getContext('2d');
    const size = 14;
    canvas.width = body.clientWidth;
    canvas.height = body.clientHeight;
    canvas.style.top = `${body.scrollTop}px`;
    const drops = Array.from({ length: Math.ceil(canvas.width / size) }, () => Math.random() * -20);
    const glyphs = 'アカサタナハマヤラワ0123456789VRYWEB<>/{}';
    const end = performance.now() + 3500;
    try {
        while (performance.now() < end) {
            ctx.fillStyle = 'rgba(3,1,5,0.12)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4ade80';
            ctx.font = `${size}px monospace`;
            drops.forEach((y, i) => {
                ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, y * size);
                drops[i] = y * size > canvas.height && Math.random() > 0.95 ? 0 : y + 1;
            });
            await io.sleep(50);
        }
    } finally {
        canvas.remove();
    }
    io.print('Wake up, Neo...', 'ok');
}

const egg = (name, run, aliases) => ({ name, aliases, hidden: true, desc: { pt: '???', en: '???' }, run });

export const fun = [
    egg('sudo', sudo),
    egg('rm', rm),
    egg('vim', vim, ['vi', 'nano', 'emacs']),
    egg('coffee', coffee, ['cafe', 'café']),
    egg('make', (args, io) => (args[0] === 'coffee' || args[0] === 'cafe'
        ? coffee(args, io)
        : io.print(t({ pt: `make: *** Nenhuma regra para processar o alvo '${args[0] ?? ''}'.`, en: `make: *** No rule to make target '${args[0] ?? ''}'.` }), 'err'))),
    egg('matrix', matrix),
];
