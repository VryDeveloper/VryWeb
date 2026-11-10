// Pointer-driven effects. All of them only write CSS custom properties or a
// transform, and none run for touch input or reduced motion.
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const enabled = () => fine.matches && !reduced.matches;

// Spotlight + tilt for cards. Delegated, so cards re-rendered by a filter keep working.
function initCards(container, selector, maxTilt) {
    let current = null;
    const reset = () => {
        current?.style.removeProperty('--rx');
        current?.style.removeProperty('--ry');
        current = null;
    };
    container.addEventListener('pointermove', e => {
        if (!enabled()) return;
        const card = e.target.closest(selector);
        if (card !== current) reset();
        if (!card) return;
        current = card;
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        // tilt scales down on big cards so the edges never travel far
        const k = maxTilt * Math.min(1, 360 / r.width);
        card.style.setProperty('--ry', `${((x / r.width) - 0.5) * 2 * k}deg`);
        card.style.setProperty('--rx', `${(0.5 - (y / r.height)) * 2 * k}deg`);
    });
    container.addEventListener('pointerleave', reset);
}

// Buttons that lean toward the cursor.
function initMagnetic() {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
        el.addEventListener('pointermove', e => {
            if (!enabled()) return;
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * 0.25;
            const y = (e.clientY - r.top - r.height / 2) * 0.35;
            el.style.transform = `translate(${x}px, ${y}px)`;
        });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
}

// Numbers that count up the first time they scroll into view.
export function initCountUp(scope = document) {
    const io = new IntersectionObserver(entries => {
        entries.forEach(({ isIntersecting, target }) => {
            if (!isIntersecting) return;
            io.unobserve(target);
            const end = Number(target.dataset.count);
            if (reduced.matches) { target.textContent = end; return; }
            const start = performance.now(), dur = 1400;
            const tick = now => {
                const p = Math.min(1, (now - start) / dur);
                target.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    }, { threshold: 0.6 });
    scope.querySelectorAll('[data-count]').forEach(el => io.observe(el));
}

// The hero code card leans toward the pointer anywhere over the hero.
function initHeroTilt() {
    const hero = document.getElementById('inicio');
    const card = document.getElementById('hero-code');
    hero.addEventListener('pointermove', e => {
        if (!enabled()) return;
        const r = hero.getBoundingClientRect();
        card.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 14}deg`);
        card.style.setProperty('--rx', `${(0.5 - (e.clientY - r.top) / r.height) * 10}deg`);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
        card.style.removeProperty('--ry');
        card.style.removeProperty('--rx');
    });
}

export function initFx() {
    initCards(document.getElementById('project-grid'), '.projeto-card', 5);
    initHeroTilt();
    initMagnetic();
}
