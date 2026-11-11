// Command registry. Each entry: { name, aliases?, hidden?, desc: {pt,en}, usage?, complete?(args), run(args, io, line) }.
import { t } from '../i18n.js';
import { commandName } from './lib.js';
import { loadGitHub, githubHTML } from '../github.js';
import { CV, downloadCV } from '../actions.js';

export const commands = [
    {
        name: 'help',
        aliases: ['ajuda', 'man'],
        desc: { pt: 'lista os comandos', en: 'list the commands' },
        complete: () => commands.filter(c => !c.hidden).map(c => c.name),
        run(args, io) {
            if (args[0]) {
                const command = findCommand(commandName(args[0]));
                if (!command) return io.print(t({ pt: `help: nenhum comando chamado ${args[0]}`, en: `help: no command named ${args[0]}` }), 'err');
                io.print(`/${command.label ?? command.name}  ${t(command.desc)}`);
                if (command.usage) io.print(t(command.usage), 'dim');
                if (command.aliases?.length) io.print(`${t({ pt: 'também', en: 'also' })}: ${command.aliases.join(', ')}`, 'dim');
                return;
            }
            io.print(t({ pt: 'Comandos disponíveis:', en: 'Available commands:' }));
            io.print('');
            for (const c of commands.filter(c => !c.hidden)) {
                const label = c.name === 'clear' ? 'clear' : `/${c.label ?? c.name}`;
                io.print(['  ', io.span(label.padEnd(15), 'k'), t(c.desc)]);
            }
            io.print('');
            io.print(t({ pt: 'Dica: Tab completa, ↑ repete, help <comando> explica.', en: 'Tip: Tab completes, ↑ repeats, help <command> explains.' }), 'dim');
        },
    },
    {
        name: 'resume',
        aliases: ['cv', 'curriculo'],
        desc: { pt: 'baixar meu currículo (PDF)', en: 'download my résumé (PDF)' },
        async run(args, io) {
            const size = fetch(CV, { method: 'HEAD' })
                .then(r => Number(r.headers.get('content-length')))
                .then(bytes => (bytes ? `${Math.round(bytes / 1024)} KB · PDF` : 'PDF'))
                .catch(() => 'PDF');
            io.print(t({ pt: 'Preparando curriculo.pdf...', en: 'Preparing resume.pdf...' }));
            // the bar is decoration: the file is small and starts downloading right after
            const bar = io.print('');
            for (let i = 0; i <= 20; i++) {
                bar.textContent = `[${'█'.repeat(i)}${'░'.repeat(20 - i)}] ${String(i * 5).padStart(3)}%`;
                await io.sleep(30);
            }
            bar.textContent += `  ·  ${await size}`;
            downloadCV();
            io.print(`✔ ${t({ pt: 'Download iniciado', en: 'Download started' })}: Victor Augusto - CV.pdf`, 'ok');
            io.print([`  ${t({ pt: 'Não começou?', en: "Didn't start?" })} → `, io.link(t({ pt: 'abrir o PDF no navegador', en: 'open the PDF in the browser' }), CV)], 'dim');
        },
    },
    {
        name: 'gh',
        aliases: ['github'],
        desc: { pt: 'meus dados no GitHub', en: 'my GitHub data' },
        async run(args, io) {
            const data = await loadGitHub().catch(() => null);
            if (!data) {
                // offline or rate limited: the summary that used to be static HTML
                io.print('→ Stack: TypeScript, C#/.NET, Python, Kotlin, Go, SQL', 'result');
                io.print(t({ pt: '→ Em produção: Kitsuy Store, Kitsuy Storage, Copec', en: '→ In production: Kitsuy Store, Kitsuy Storage, Copec' }), 'result');
                io.print(t({ pt: '→ Foco: testes automatizados, CI/CD, código limpo', en: '→ Focus: automated testing, CI/CD, clean code' }), 'result');
                return;
            }
            const out = document.createElement('div');
            out.innerHTML = githubHTML(data);
            io.block(out);
        },
    },
    {
        name: 'clear',
        desc: { pt: 'limpar a tela', en: 'clear the screen' },
        run: (args, io) => io.clear(),
    },
    {
        name: 'history',
        desc: { pt: 'comandos digitados', en: 'commands typed so far' },
        hidden: true,
        run(args, io) {
            const list = io.store.get('term-history', []);
            list.forEach((line, i) => io.print(`${String(i + 1).padStart(4)}  ${line}`));
        },
    },
];

export const findCommand = name => commands.find(c => c.name === name || c.aliases?.includes(name));

export const describe = c => t(c.desc);
