// One observer for every scroll reveal. threshold 0 + a bottom margin, because an
// element taller than 10x the viewport would never reach a 10% threshold.
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
    });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

// static elements that reveal on scroll; the stylesheet does the animation
const REVEAL = 'h2.titulo, .section-lead, .project-toolbar, .archive, .terminal-card, .txt-sobre, .timeline li, .contact-card';

// call again after rendering new nodes
export function observeReveals(scope = document) {
    scope.querySelectorAll('[data-reveal]:not(.visible), .projeto-card:not(.visible)')
        .forEach(el => observer.observe(el));
}

export function initReveal() {
    document.querySelectorAll(REVEAL).forEach(el => el.setAttribute('data-reveal', ''));
    document.querySelectorAll('.timeline li').forEach((li, i) => li.style.setProperty('--delay', `${i * 80}ms`));
    observeReveals();
}
