// One observer for every scroll reveal. threshold 0 + a bottom margin, because a
// section taller than 10x the viewport would never reach a 10% threshold.
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
    });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

// call again after rendering new nodes
export function observeReveals(scope = document) {
    scope.querySelectorAll('.fade-in:not(.visible), .habilidades-box:not(.visible), .projeto-card:not(.visible)')
        .forEach(el => observer.observe(el));
}

export function initReveal() {
    document.querySelectorAll('main > section').forEach(s => s.classList.add('fade-in'));
    observeReveals();
}
