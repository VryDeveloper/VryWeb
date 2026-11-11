// Snake on the real GitHub contribution grid: the green days are the food and the
// score is the commits eaten. Data: data/contributions.json (tools/contributions.sh,
// refreshed weekly by .github/workflows/contributions.yml).
import { t } from './i18n.js';
import { emit } from './events.js';

const ROWS = 7;
const TICK = 115;          // ms per step
const CELL_MIN = 9;        // px; on narrow screens the oldest weeks are dropped to keep cells tappable
const GOAL = 10;           // days eaten for the achievement
const DIRS = {
    arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1],
    arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0],
};

export function initSnake() {
    const root = document.getElementById('snake');
    if (!root) return;
    new IntersectionObserver(([e], observer) => {
        if (!e.isIntersecting) return;
        observer.disconnect();
        fetch('data/contributions.json')
            .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
            .then(data => start(root, data))
            .catch(() => { root.hidden = true; });
    }, { rootMargin: '300px' }).observe(root);
}

function start(root, data) {
    const board = root.querySelector('.snake-board');
    const score = root.querySelector('.snake-score');
    const play = root.querySelector('.snake-play');
    root.querySelector('.snake-total').textContent = data.total;
    const range = root.querySelector('.snake-range');

    let best = 0;
    try { best = +localStorage.getItem('snake-best') || 0; } catch {}

    let cols, food, cells, snake, dir, queued, eaten, days, timer = 0, state = 'idle';
    const at = (x, y) => cells[x * ROWS + y];

    // grid from the last `cols` weeks; days after today do not exist (void)
    function build() {
        const gap = 3;
        cols = Math.min(data.weeks.length, Math.floor((board.clientWidth + gap) / (CELL_MIN + gap)));
        const weeks = data.weeks.slice(-cols);
        food = weeks.map(w => Array.from({ length: ROWS }, (_, y) => (w[y] ? w[y][0] : -1)));
        board.style.setProperty('--cols', cols);
        board.replaceChildren(...weeks.flatMap(w => Array.from({ length: ROWS }, (_, y) => {
            const c = document.createElement('i');
            c.dataset.l = w[y] ? w[y][1] : 'x';
            return c;
        })));
        cells = [...board.children];
        range.textContent = cols < data.weeks.length ? t({ pt: ` · grid: últimas ${cols} semanas`, en: ` · grid: last ${cols} weeks` }) : '';
        board.setAttribute('aria-label', t({
            pt: `${data.total} contribuições no GitHub no último ano`,
            en: `${data.total} GitHub contributions in the last year`,
        }));
    }

    function text() {
        if (state === 'idle') return t({ pt: `recorde: ${best} commits`, en: `best: ${best} commits` });
        const n = (k, one, many) => `${k} ${k === 1 ? one : many}`;
        const now = t({ pt: `${n(eaten, 'commit', 'commits')} · ${n(days, 'dia', 'dias')}`, en: `${n(eaten, 'commit', 'commits')} · ${n(days, 'day', 'days')}` });
        if (state === 'over') return t({ pt: `Fim de jogo: ${now} (recorde ${best})`, en: `Game over: ${now} (best ${best})` });
        if (state === 'won') return t({ pt: `Comeu o ano inteiro: ${now}!`, en: `Ate the whole year: ${now}!` });
        if (state === 'paused') return t({ pt: `${now} · pausado`, en: `${now} · paused` });
        return now;
    }
    function render() {
        score.textContent = text();
        const label = state === 'playing' ? { pt: 'Pausar', en: 'Pause' }
            : state === 'paused' ? { pt: 'Continuar', en: 'Resume' }
            : state === 'idle' ? { pt: 'Jogar cobrinha', en: 'Play snake' } : { pt: 'Jogar de novo', en: 'Play again' };
        play.querySelector('span').textContent = t(label);
        play.querySelector('i').className = `bi ${state === 'playing' ? 'bi-pause-fill' : 'bi-controller'}`;
        root.classList.toggle('playing', state === 'playing');
    }

    function reset() {
        build();
        const y = 3, x0 = Math.max(0, Math.floor(cols / 2) - 2);
        snake = [[x0 + 2, y], [x0 + 1, y], [x0, y]];          // head first
        snake.forEach(([x, y], i) => { at(x, y).classList.add(i ? 's' : 'h'); food[x][y] = 0; });   // so "ate everything" stays reachable
        dir = [1, 0]; queued = null; eaten = 0; days = 0;
    }

    function step() {
        if (queued) { dir = queued; queued = null; }
        const [hx, hy] = snake[0];
        const x = (hx + dir[0] + cols) % cols, y = (hy + dir[1] + ROWS) % ROWS;   // edges wrap
        const grow = food[x][y] > 0;
        const tail = snake[snake.length - 1];
        // the tail cell frees up this step unless the snake grows
        if (snake.some(([sx, sy], i) => sx === x && sy === y && (grow || i < snake.length - 1))) return end('over');
        if (grow) {
            eaten += food[x][y];
            days++;
            food[x][y] = 0;
            at(x, y).dataset.l = 0;
            if (days === GOAL) emit('snake', { days });
        } else {
            snake.pop();
            at(...tail).classList.remove('s');
        }
        at(hx, hy).classList.replace('h', 's');
        snake.unshift([x, y]);
        at(x, y).classList.add('h');
        if (!food.some(col => col.some(n => n > 0))) return end('won');
        render();
    }

    function run(next) {
        clearInterval(timer);
        state = next;
        if (state === 'playing') timer = setInterval(step, TICK);
        render();
    }
    function end(how) {
        if (eaten > best) { best = eaten; try { localStorage.setItem('snake-best', best); } catch {} }
        run(how);
    }

    play.addEventListener('click', () => {
        if (state === 'playing') return run('paused');
        if (state !== 'paused') reset();
        run('playing');
    });

    function turn(d) {
        const cur = queued ?? dir;
        if (d[0] === -cur[0] && d[1] === -cur[1]) return;   // no reversing into yourself
        queued = d;
    }
    document.addEventListener('keydown', e => {
        if (state !== 'playing' && state !== 'paused') return;
        if (e.target.closest?.('input, textarea, [contenteditable]')) return;
        const key = e.key.toLowerCase();
        if (key === 'escape' || key === ' ') { e.preventDefault(); return run(state === 'playing' ? 'paused' : 'playing'); }
        if (state === 'playing' && DIRS[key]) { e.preventDefault(); turn(DIRS[key]); }
    });

    // swipe on the board (touch-action is off only while playing, so the page still scrolls otherwise)
    let from = null;
    board.addEventListener('pointerdown', e => { if (state === 'playing') from = [e.clientX, e.clientY]; });
    board.addEventListener('pointerup', e => {
        if (!from) return;
        const dx = e.clientX - from[0], dy = e.clientY - from[1];
        from = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
        turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
    });

    // pause when the board leaves the screen or the tab is hidden
    const pause = () => { if (state === 'playing') run('paused'); };
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) pause(); }).observe(board);
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

    // a resize between games rebuilds the grid; mid-game keeps it as it is
    new ResizeObserver(() => { if (state === 'idle' || state === 'over' || state === 'won') build(); }).observe(board);
    document.addEventListener('langchange', () => { render(); if (state !== 'playing' && state !== 'paused') build(); });

    build();
    render();
}
