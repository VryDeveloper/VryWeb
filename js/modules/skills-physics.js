// Skills as physical pills: they drop in, pile up, can be dragged and thrown.
// The pills are real <button>s moved with transforms; Matter.js only does the maths.
// Dragging is our own (Pointer Events + a Constraint) instead of Matter's MouseConstraint,
// which grabs wheel and touch events and would stop the page from scrolling on phones.
import { emit } from './events.js';

const SRC = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.min.js';
const SRI = 'sha384-ZRKYEXtLBVeqs9z1WxyeKutCqnkqolS/r1EUWuoUpG4ZKbnRAIXnHhHdnNuiB6CL';
const STEP = 1000 / 60;
const WALL = 400;            // thick walls so fast throws do not tunnel through
const THROW_SPEED = 28;      // px per step that counts as a real throw

function loadMatter() {
    if (window.Matter) return Promise.resolve(window.Matter);
    return new Promise((resolve, reject) => {
        const s = Object.assign(document.createElement('script'), { src: SRC, integrity: SRI, crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' });
        s.onload = () => (window.Matter ? resolve(window.Matter) : reject(new Error('Matter missing')));
        s.onerror = () => reject(new Error('Matter failed to load'));
        document.head.append(s);
    });
}

/**
 * play:    the container (position: relative, fixed height)
 * items:   [{ key, name, icon, n, group, title }]
 * onPick:  called with a key when a pill is clicked (not dragged)
 * onDrop:  called with (key, body, point) when a dragged pill is released
 */
export async function startPhysics({ play, items, onPick, onDrop = () => {} }) {
    const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = await loadMatter();

    const engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 1;
    const world = engine.world;
    let W = play.clientWidth, H = play.clientHeight;

    // floor, side walls and a ceiling far above, so thrown pills come back down; rebuilt on resize
    let walls = [];
    function placeWalls() {
        Composite.remove(world, walls);
        const sideH = H + 1400 + WALL, sideY = (H + WALL - 1400) / 2;
        walls = [
            Bodies.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, { isStatic: true }),
            Bodies.rectangle(-WALL / 2, sideY, WALL, sideH, { isStatic: true }),
            Bodies.rectangle(W + WALL / 2, sideY, WALL, sideH, { isStatic: true }),
            Bodies.rectangle(W / 2, -1400 - WALL / 2, W + WALL * 2, WALL, { isStatic: true }),
        ];
        Composite.add(world, walls);
    }
    placeWalls();

    // ── pills ──────────────────────────────────────────────────
    const small = W < 820;
    const pills = items.map(item => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'pill';
        el.dataset.tech = item.key;
        el.dataset.group = item.group;
        el.title = item.title;
        // bigger when more projects use it
        el.style.fontSize = `${Math.min(small ? 15 : 18, (small ? 11.5 : 12.5) + item.n * (small ? 0.5 : 0.8))}px`;
        el.innerHTML = `<i class="${item.icon}" aria-hidden="true"></i><span></span><b></b>`;
        el.querySelector('span').textContent = item.name;
        el.querySelector('b').textContent = item.n;
        el.style.visibility = 'hidden';
        play.append(el);
        return { item, el, body: null, w: 0, h: 0 };
    });

    function spawn(p, x, y) {
        p.w = p.el.offsetWidth;
        p.h = p.el.offsetHeight;
        p.body = Bodies.rectangle(x, y, p.w, p.h, {
            chamfer: { radius: p.h / 2 },
            restitution: 0.35, friction: 0.4, frictionAir: 0.012, density: 0.0016,
            angle: (Math.random() - 0.5) * 0.6,
        });
        Composite.add(world, p.body);
        p.el.style.visibility = '';
    }

    const randX = p => p.w / 2 + Math.random() * Math.max(1, W - p.w);
    function drop(list, gap = 70) {
        list.forEach((p, i) => setTimeout(() => {
            p.w = p.el.offsetWidth;
            spawn(p, randX(p), -40 - Math.random() * 120);
        }, i * gap));
    }

    function sync() {
        for (const p of pills) {
            if (!p.body || (p.body.isSleeping && !p.dirty)) continue;
            const { x, y } = p.body.position;
            p.el.style.transform = `translate(${x - p.w / 2}px, ${y - p.h / 2}px) rotate(${p.body.angle}rad)`;
            p.dirty = false;
        }
    }

    // ── loop: runs only while visible ───────────────────────────
    let raf = 0, last = 0, acc = 0, visible = false;
    function frame(now) {
        acc += Math.min(100, now - (last || now));
        last = now;
        while (acc >= STEP) { Engine.update(engine, STEP); acc -= STEP; }
        sync();
        raf = requestAnimationFrame(frame);
    }
    function run() {
        cancelAnimationFrame(raf);
        last = 0;
        if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(play);
    document.addEventListener('visibilitychange', run);

    // anything that escaped (very fast throw, resize) goes back to the top
    setInterval(() => {
        for (const p of pills) {
            if (!p.body) continue;
            const { x, y } = p.body.position;
            if (x < -100 || x > W + 100 || y > H + 100) {
                Body.setPosition(p.body, { x: randX(p), y: -60 });
                Body.setVelocity(p.body, { x: 0, y: 0 });
            }
        }
    }, 1000);

    new ResizeObserver(() => {
        const w = play.clientWidth, h = play.clientHeight;
        if (!w || !h || (w === W && h === H)) return;
        W = w; H = h;
        placeWalls();
        for (const p of pills) if (p.body) { Sleeping.set(p.body, false); p.dirty = true; }
    }).observe(play);

    // ── drag and throw ─────────────────────────────────────────
    let drag = null;
    const local = e => {
        const r = play.getBoundingClientRect();
        return { x: Math.max(0, Math.min(W, e.clientX - r.left)), y: Math.max(-300, Math.min(H, e.clientY - r.top)) };
    };

    play.addEventListener('pointerdown', e => {
        const el = e.target.closest('.pill');
        const p = el && pills.find(x => x.el === el);
        if (!p?.body || e.button > 0) return;
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        const at = local(e);
        const { x, y } = p.body.position;
        // pointB is relative to the body's centre, unrotated: undo the current angle
        const cos = Math.cos(-p.body.angle), sin = Math.sin(-p.body.angle);
        const dx = at.x - x, dy = at.y - y;
        const constraint = Constraint.create({
            pointA: at, bodyB: p.body,
            pointB: { x: dx * cos - dy * sin, y: dx * sin + dy * cos },
            stiffness: 0.18, damping: 0.08, length: 0,
        });
        Composite.add(world, constraint);
        Sleeping.set(p.body, false);
        drag = { p, constraint, start: at, t: performance.now(), moved: 0, id: e.pointerId };
        el.classList.add('grabbed');
    });

    play.addEventListener('pointermove', e => {
        if (!drag || e.pointerId !== drag.id) return;
        const at = local(e);
        drag.constraint.pointA = at;
        drag.moved = Math.max(drag.moved, Math.hypot(at.x - drag.start.x, at.y - drag.start.y));
    });

    // cancelled: the browser took the gesture over (a vertical scroll on a phone), so it is never a click
    function release(e, cancelled = false) {
        if (!drag || e.pointerId !== drag.id) return;
        const { p, constraint, moved, t } = drag;
        drag = null;
        Composite.remove(world, constraint);
        p.el.classList.remove('grabbed');
        if (cancelled) return;
        if (moved < 6 && performance.now() - t < 400) return onPick(p.item.key);
        const speed = Math.hypot(p.body.velocity.x, p.body.velocity.y);
        if (speed > THROW_SPEED) emit('throw');
        onDrop(p.item.key, p.body, local(e));
    }
    play.addEventListener('pointerup', release);
    play.addEventListener('pointercancel', e => release(e, true));

    // keyboard: Enter/Space on a focused pill fires click with detail 0
    play.addEventListener('click', e => {
        const el = e.target.closest('.pill');
        if (el && e.detail === 0) onPick(el.dataset.tech);
    });

    drop(pills);

    return {
        pills,
        // every pill jumps; asleep ones are woken first
        shake() {
            for (const p of pills) {
                if (!p.body) continue;
                Sleeping.set(p.body, false);
                Body.setVelocity(p.body, { x: (Math.random() - 0.5) * 16, y: -10 - Math.random() * 12 });
                Body.setAngularVelocity(p.body, (Math.random() - 0.5) * 0.3);
            }
        },
        // takes a pill out of the world (it went into the challenge box)
        remove(key) {
            const p = pills.find(x => x.item.key === key);
            if (!p?.body) return;
            Composite.remove(world, p.body);
            p.body = null;
            p.el.style.visibility = 'hidden';
        },
        // puts pills back, falling from the top
        restore(keys) { drop(pills.filter(p => keys.includes(p.item.key) && !p.body), 60); },
        // throws a pill away from a point (wrong answer)
        reject(key, from) {
            const p = pills.find(x => x.item.key === key);
            if (!p?.body) return;
            const dir = Math.sign(p.body.position.x - from.x) || -1;
            Sleeping.set(p.body, false);
            Body.setVelocity(p.body, { x: dir * 14, y: -16 });
        },
        setTitles(fn) { for (const p of pills) p.el.title = fn(p.item); },
        get size() { return { W, H }; },
    };
}
