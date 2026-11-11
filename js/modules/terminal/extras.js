// Shell builtins that reuse what the site already does: list and open projects,
// switch theme and language, move around the page. `quiet` keeps them out of /help
// but still completable; `hidden` (fun.js) also hides them from Tab and typo hints.
import { t, toggleLang, getLang } from '../i18n.js';
import { toggleTheme } from '../theme.js';
import { openProject } from '../case-study.js';
import { projects, statuses } from '../../data/projects.js';

const ids = () => projects.map(p => p.id);

// cd targets: Portuguese and English names for each section
const SECTIONS = {
    inicio: 'inicio', home: 'inicio', '~': 'inicio',
    projetos: 'projetos', projects: 'projetos',
    habilidades: 'habilidades', skills: 'habilidades',
    github: 'github',
    sobre: 'sobre', about: 'sobre',
    contato: 'contato', contact: 'contato',
};

function listProjects(io) {
    const width = Math.max(...ids().map(id => id.length)) + 2;
    for (const p of projects) {
        const status = p.status ? io.span(t(statuses[p.status]).toLowerCase(), p.status === 'wip' ? 'dim' : 'ok-text') : io.span(p.private ? t({ pt: 'privado', en: 'private' }) : '', 'dim');
        io.print([io.span(p.id.padEnd(width), 'k'), `${p.year}  `, status]);
    }
    io.print('');
    io.print(t({ pt: `${projects.length} projetos · open <projeto> abre os detalhes (Tab completa)`, en: `${projects.length} projects · open <project> shows the details (Tab completes)` }), 'dim');
}

export const extras = [
    {
        name: 'projects',
        aliases: ['projetos'],
        desc: { pt: 'listar projetos (open <projeto> abre)', en: 'list projects (open <project> opens one)' },
        run: (args, io) => listProjects(io),
    },
    {
        name: 'open',
        aliases: ['cat'],
        quiet: true,
        desc: { pt: 'abrir um projeto', en: 'open a project' },
        usage: { pt: 'open <projeto>   ex.: open salao-jade', en: 'open <project>   e.g. open salao-jade' },
        complete: args => (args.length ? [] : ids()),
        run(args, io) {
            const id = (args[0] ?? '').toLowerCase().replace(/\/$/, '');
            if (!id) return io.print(t(this.usage), 'dim');
            const project = projects.find(p => p.id === id || t(p.title).toLowerCase() === id);
            if (!project) return io.print(t({ pt: `open: ${id}: projeto não encontrado. Rode /projects.`, en: `open: ${id}: no such project. Run /projects.` }), 'err');
            io.print(`→ ${t(project.title)}`, 'ok');
            io.closeFull();
            openProject(project.id);
        },
    },
    {
        name: 'theme',
        aliases: ['tema'],
        desc: { pt: 'alternar tema claro/escuro', en: 'toggle light/dark theme' },
        run(args, io) {
            toggleTheme();
            io.print(`theme: ${document.documentElement.dataset.theme}`, 'ok');
        },
    },
    {
        name: 'lang',
        aliases: ['idioma'],
        desc: { pt: 'trocar idioma pt/en', en: 'switch language pt/en' },
        run(args, io) {
            const want = (args[0] ?? '').toLowerCase();
            if (want !== getLang()) toggleLang();
            io.print(t({ pt: 'idioma: português', en: 'language: English' }), 'ok');
        },
    },
    {
        name: 'ls',
        quiet: true,
        desc: { pt: 'listar o conteúdo', en: 'list contents' },
        complete: args => (args.length ? [] : ['projetos/']),
        run(args, io) {
            if (/^proje(tos|cts)\/?$/.test(args[0] ?? '')) return listProjects(io);
            io.print([
                ...['projetos/', 'habilidades/', 'github/', 'sobre/', 'contato/'].map(d => io.span(`${d}  `, 'k')),
                'curriculo.pdf',
            ]);
        },
    },
    {
        name: 'cd',
        quiet: true,
        desc: { pt: 'ir para uma seção', en: 'go to a section' },
        complete: args => (args.length ? [] : ['projetos', 'habilidades', 'github', 'sobre', 'contato']),
        run(args, io) {
            const target = (args[0] ?? '~').toLowerCase().replace(/\/$/, '');
            const id = SECTIONS[target];
            if (!id) return io.print(t({ pt: `cd: ${target}: diretório não encontrado`, en: `cd: ${target}: no such directory` }), 'err');
            io.closeFull();
            document.getElementById(id).scrollIntoView();
        },
    },
    {
        name: 'pwd',
        quiet: true,
        desc: { pt: 'diretório atual', en: 'current directory' },
        run: (args, io) => io.print(`/home/${io.user}`),
    },
    {
        name: 'whoami',
        quiet: true,
        desc: { pt: 'quem é você', en: 'who you are' },
        run: (args, io) => io.print(io.user),
    },
    {
        name: 'date',
        quiet: true,
        desc: { pt: 'data e hora em Salvador', en: 'date and time in Salvador' },
        run(args, io) {
            io.print(new Intl.DateTimeFormat(getLang() === 'pt' ? 'pt-BR' : 'en', {
                dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Bahia',
            }).format(new Date()) + ' (Salvador, BA)');
        },
    },
    {
        name: 'exit',
        quiet: true,
        desc: { pt: 'fechar a tela cheia', en: 'leave full screen' },
        run(args, io) {
            io.print('logout', 'dim');
            io.closeFull();
            document.activeElement?.blur();
        },
    },
];
