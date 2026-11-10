// Soft light orbs behind the hero that drift on their own and lean toward the pointer.
// Drawn on a canvas 1/10th the size of the hero and stretched by CSS: the upscale
// gives the blur for free, and each frame fills only a few thousand pixels.
const DOWNSCALE = 10;

// the palette's four accents (tokens.css --pal-*), as rgb
const ORBS = [
    { rgb: '250,0,255',  x: 0.72, y: 0.30, r: 0.34, follow: 0.07, pull: 0.55, speed: 0.00021, phase: 0.0 },
    { rgb: '91,140,255', x: 0.30, y: 0.62, r: 0.40, follow: 0.04, pull: 0.30, speed: 0.00016, phase: 2.1 },
    { rgb: '139,0,255',  x: 0.55, y: 0.50, r: 0.46, follow: 0.024, pull: 0.18, speed: 0.00012, phase: 4.2 },
    { rgb: '217,70,239', x: 0.86, y: 0.72, r: 0.26, follow: 0.10, pull: 0.70, speed: 0.00026, phase: 1.3 },
];

export function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    const hero = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const orbs = ORBS.map(o => ({ ...o, cx: o.x, cy: o.y }));
    const pointer = { x: 0.5, y: 0.5, active: false };
    let visible = true, raf = 0;

    function resize() {
        canvas.width = Math.max(1, Math.round(hero.clientWidth / DOWNSCALE));
        canvas.height = Math.max(1, Math.round(hero.clientHeight / DOWNSCALE));
    }

    function draw(time) {
        const { width: w, height: h } = canvas;
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (const o of orbs) {
            // home position wanders in a slow ellipse; the pointer pulls it part of the way
            const homeX = o.x + Math.cos(time * o.speed + o.phase) * 0.08;
            const homeY = o.y + Math.sin(time * o.speed * 1.3 + o.phase) * 0.10;
            const targetX = pointer.active ? homeX + (pointer.x - homeX) * o.pull : homeX;
            const targetY = pointer.active ? homeY + (pointer.y - homeY) * o.pull : homeY;
            o.cx += (targetX - o.cx) * o.follow;
            o.cy += (targetY - o.cy) * o.follow;

            const radius = o.r * Math.max(w, h);
            const g = ctx.createRadialGradient(o.cx * w, o.cy * h, 0, o.cx * w, o.cy * h, radius);
            g.addColorStop(0, `rgba(${o.rgb},0.55)`);
            g.addColorStop(1, `rgba(${o.rgb},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
        }
    }

    // slow, blurry light does not need 60fps: draw every other frame
    let skip = false;
    function loop(time) {
        if (!(skip = !skip)) draw(time);
        raf = requestAnimationFrame(loop);
    }

    // run only while the hero is on screen, the tab is visible and motion is allowed
    function update() {
        cancelAnimationFrame(raf);
        if (reduced.matches) return draw(0);
        if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    }

    hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width;
        pointer.y = (e.clientY - r.top) / r.height;
        pointer.active = true;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.active = false; });

    new ResizeObserver(() => { resize(); if (reduced.matches) draw(0); }).observe(hero);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(hero);
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);

    resize();
    update();
}
