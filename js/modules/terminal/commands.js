// Command registry. Each entry: { name, aliases?, hidden?, desc: {pt,en}, usage?, complete?(args), run(args, io, line) }.
import { t } from '../i18n.js';

export const commands = [
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
