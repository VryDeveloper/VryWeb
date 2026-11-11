// Command registry. Each entry: { name, aliases?, hidden?, desc: {pt,en}, usage?, complete?(args), run(args, io, line) }.
import { t, getLang } from '../i18n.js';
import { commandName } from './lib.js';
import { loadGitHub, githubHTML } from '../github.js';
import { CV, EMAIL, LINKEDIN, downloadCV, copyEmail } from '../actions.js';
import { projects } from '../../data/projects.js';

const LOGO = String.raw`
__      __
\ \    / /
 \ \  / /
  \ \/ /
   \  /
    \/`.slice(1);

// the same numbers as the hero, computed from the data
const stats = () => ({
    projects: projects.length,
    tests: projects.reduce((sum, p) => sum + (p.tests ?? 0), 0),
    live: projects.filter(p => p.status === 'production' || p.status === 'live').length,
});

const salvadorTime = () => new Intl.DateTimeFormat(getLang() === 'pt' ? 'pt-BR' : 'en', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Bahia',
}).format(new Date());

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
        name: 'info',
        aliases: ['whois', 'neofetch'],
        desc: { pt: 'ficha rápida para recrutadores', en: 'quick sheet for recruiters' },
        async run(args, io) {
            const n = stats();
            const facts = [
                [{ pt: 'Nome', en: 'Name' }, 'Victor Augusto'],
                [{ pt: 'Cargo', en: 'Role' }, { pt: 'Desenvolvedor Full Stack', en: 'Full Stack Developer' }],
                [{ pt: 'Local', en: 'Location' }, `Salvador, BA (UTC−3) · ${salvadorTime()} ${t({ pt: 'agora', en: 'now' })}`],
                [{ pt: 'Formação', en: 'Education' }, { pt: 'ADS — FIAP (2024–2026)', en: 'Systems Analysis & Dev. — FIAP (2024–2026)' }],
                [{ pt: 'Programando', en: 'Coding' }, { pt: 'desde 2023', en: 'since 2023' }],
                ['Stack', 'TypeScript, React, C#/.NET, Python, Go, SQL'],
                [{ pt: 'Projetos', en: 'Projects' }, t({ pt: `${n.projects} · ${n.tests} testes · ${n.live} em produção`, en: `${n.projects} · ${n.tests} tests · ${n.live} in production` })],
                [{ pt: 'Modelo', en: 'Work mode' }, { pt: 'presencial em Salvador ou remoto', en: 'on site in Salvador or remote' }],
                ['Status', io.span(t({ pt: '● disponível para vagas', en: '● open to roles' }), 'ok-text')],
                ['E-mail', [EMAIL, '   ', io.button(t({ pt: '[copiar]', en: '[copy]' }), copyEmail)]],
            ];

            const wrap = document.createElement('div');
            wrap.className = 'term-fetch';
            const logo = document.createElement('pre');
            logo.className = 'logo';
            logo.setAttribute('aria-hidden', 'true');
            logo.textContent = LOGO;
            const list = document.createElement('div');
            const line = (parts, cls) => {
                const p = document.createElement('p');
                p.className = `term-line ${cls ?? ''}`.trim();
                p.append(...[].concat(parts).map(part => (part instanceof Node ? part : document.createTextNode(part))));
                list.append(p);
            };
            line(io.span('victor@vryweb', 'h'));
            line('-------------', 'dim');
            wrap.append(logo, list);
            io.block(wrap);
            for (const [label, value] of facts) {
                line([io.span(`${t(label)}:`.padEnd(14), 'k'), ...[].concat(t(value))]);
                await io.sleep(35);
            }
            io.print('');
            io.print(t({ pt: 'Dica: /resume baixa o currículo · /git commit fala comigo', en: 'Tip: /resume downloads the résumé · /git commit talks to me' }), 'dim');
        },
    },
    {
        name: 'linkedin',
        aliases: ['bio', 'sobre', 'about'],
        desc: { pt: 'quem eu sou + LinkedIn', en: 'who I am + LinkedIn' },
        async run(args, io) {
            io.print(t({ pt: 'Abrindo perfil...', en: 'Opening profile...' }), 'dim');
            await io.sleep(250);
            io.print('');
            await io.lines([
                [io.span(t({ pt: 'Victor Augusto · Desenvolvedor Full Stack', en: 'Victor Augusto · Full Stack Developer' }), 'h')],
                [t({ pt: 'Salvador, BA · ADS pela FIAP', en: 'Salvador, Brazil · Systems Analysis & Dev., FIAP' })],
                [''],
                [t({
                    pt: 'Construo sistemas de ponta a ponta: banco, API, interface, deploy e CI. Já entreguei o site de um cliente (Copec), uma loja com pagamento real (Kitsuy Store) e projetos com suíte de testes que prova o que promete.',
                    en: 'I build systems end to end: database, API, interface, deploy and CI. I have shipped a client website (Copec), a store taking real payments (Kitsuy Store) and projects with test suites that prove what they promise.',
                })],
                [''],
            ], { delay: 60, cls: 'para' });
            // no automatic window.open: browsers block it and visitors hate it
            io.print(['→ linkedin.com/in/victor-augusto-79a5612b6  ', io.link(t({ pt: '[abrir]', en: '[open]' }), LINKEDIN)], 'para');
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
