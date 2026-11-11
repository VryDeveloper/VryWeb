// Pure helpers for the terminal, kept free of the DOM so tests/terminal.test.html can run them.

// Splits a command line into words, keeping "quoted strings" and 'single quotes' together.
export function tokenize(line) {
    const words = [];
    const re = /"([^"]*)"?|'([^']*)'?|(\S+)/g;
    let m;
    while ((m = re.exec(line))) words.push(m[1] ?? m[2] ?? m[3]);
    return words;
}

// "/HELP" and "help" are the same command
export const commandName = word => (word ?? '').replace(/^\/+/, '').toLowerCase();

export function levenshtein(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        let prev = row[0];
        row[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const tmp = row[j];
            row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }
    return row[b.length];
}

// closest known name within 2 edits, or null
export function suggest(word, names) {
    let best = null, bestD = 3;
    for (const name of names) {
        const d = levenshtein(word, name);
        if (d < bestD) { best = name; bestD = d; }
    }
    return best;
}

// Longest prefix shared by all candidates, for Tab completion.
export function commonPrefix(list) {
    if (!list.length) return '';
    let prefix = list[0];
    for (const s of list) while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
    return prefix;
}

// 7 hex chars derived from the text, so the same commit always gets the same hash
export function shortHash(text) {
    let h = 0x811c9dc5;                              // FNV-1a
    for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 0x01000193) >>> 0;
    return h.toString(16).padStart(8, '0').slice(0, 7);
}

export const slug = text => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mensagem';
