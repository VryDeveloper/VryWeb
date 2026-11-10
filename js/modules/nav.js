export function initNav() {
    const nav = document.getElementById('nav');
    const main = document.querySelector('main');

    // ── mobile menu ──
    const btnMenu = document.getElementById('btn-abrir-menu');
    const menuMobile = document.getElementById('menu-mobile');

    function setMenu(open) {
        menuMobile.classList.toggle('abrir-menu', open);
        btnMenu.setAttribute('aria-expanded', String(open));
        main.inert = open;
    }

    btnMenu.addEventListener('click', () => setMenu(true));
    document.getElementById('overlay-menu-mobile').addEventListener('click', () => setMenu(false));
    // close only on a link or the X button, not on any click inside the panel
    menuMobile.addEventListener('click', e => { if (e.target.closest('a, .btn-fechar')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    // ── compact pill after the first 80px: a sentinel, not a scroll listener ──
    new IntersectionObserver(([entry]) => nav.classList.toggle('is-scrolled', !entry.isIntersecting))
        .observe(document.getElementById('top-sentinel'));

    // ── active section + sliding indicator ──
    const list = document.getElementById('nav-links');
    const indicator = list.querySelector('.nav-indicator');
    const links = [...list.querySelectorAll('a')];
    const linkFor = id => links.find(a => a.getAttribute('href') === `#${id}`);
    let active = null;

    function moveIndicator() {
        indicator.style.setProperty('--o', active ? 1 : 0);
        if (!active) return;
        indicator.style.setProperty('--x', `${active.offsetLeft}px`);
        indicator.style.setProperty('--w', `${active.offsetWidth}px`);
    }

    function setActive(link) {
        active = link ?? null;
        links.forEach(a => a === active ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
        moveIndicator();
    }

    // a section is "active" while it crosses a thin band in the middle of the viewport
    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) setActive(linkFor(entry.target.dataset.nav ?? entry.target.id)); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section').forEach(s => spy.observe(s));

    addEventListener('resize', moveIndicator);
    document.addEventListener('langchange', moveIndicator);
    document.fonts?.ready.then(moveIndicator);

    // ── reading progress: CSS scroll timeline where it exists, one rAF-throttled listener otherwise ──
    if (!CSS.supports('animation-timeline: scroll()')) {
        const bar = nav.querySelector('.nav-progress');
        let queued = false;
        addEventListener('scroll', () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                const max = document.documentElement.scrollHeight - innerHeight;
                bar.style.setProperty('--progress', max > 0 ? scrollY / max : 0);
                queued = false;
            });
        }, { passive: true });
    }

    // ── WhatsApp button only after the hero has left the screen ──
    const fab = document.getElementById('whatsapp-fab');
    new IntersectionObserver(([entry]) => fab.classList.toggle('show', !entry.isIntersecting))
        .observe(document.getElementById('inicio'));
}
