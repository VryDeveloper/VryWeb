// ── Loader ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        setTimeout(() => { loader.classList.add('hidden'); }, 1000);
    }
});

// ── Dark Mode ─────────────────────────────────────────────────────────────────
const $html = document.querySelector('html');
const $checkbox = document.querySelector('#chk');

const darkMode = localStorage.getItem('darkMode');
if (darkMode === 'true') {
    $html.classList.add('dark-mode');
    $checkbox.checked = true;
}

$checkbox.addEventListener('change', function () {
    $html.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', $html.classList.contains('dark-mode'));
});

// ── Language Toggle ───────────────────────────────────────────────────────────
let currentLang = localStorage.getItem('lang') || 'en';

function applyLang(lang) {
    document.querySelectorAll('[data-pt][data-en]').forEach(el => {
        el.innerHTML = el.getAttribute(`data-${lang}`);
    });
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'pt' ? '🇺🇸 EN' : '🇧🇷 PT';
    document.documentElement.lang = lang === 'pt' ? 'pt-br' : 'en';
    localStorage.setItem('lang', lang);
    currentLang = lang;
}

function toggleLang() {
    applyLang(currentLang === 'pt' ? 'en' : 'pt');
}

document.addEventListener('DOMContentLoaded', () => {
    applyLang(currentLang);
});

// ── Project View Controls ─────────────────────────────────────────────────────
const viewButtons = document.querySelectorAll('.view-btn');
const portfolioGrid = document.querySelector('.portfolio-grid');

viewButtons.forEach(button => {
    button.addEventListener('click', () => {
        viewButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        portfolioGrid.classList.toggle('list-view', button.dataset.view === 'list');
    });
});

// ── Scroll Animations ─────────────────────────────────────────────────────────
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
});

document.querySelectorAll('.habilidades-box').forEach(box => observer.observe(box));
document.querySelectorAll('.projeto-card').forEach(card => observer.observe(card));

const checkVisibleElements = () => {
    document.querySelectorAll('.fade-in, .habilidades-box, .projeto-card').forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            element.classList.add('visible');
        }
    });
};

window.addEventListener('load', checkVisibleElements);
window.addEventListener('scroll', checkVisibleElements);

// ── GitHub Stats ──────────────────────────────────────────────────────────────
async function fetchGitHubStats() {
    try {
        const username = 'VryDeveloper';

        // sem token — API pública, 60 req/hora por IP
        const response = await fetch(`https://api.github.com/users/${username}`);
        const data = await response.json();
        document.getElementById('repos').textContent = data.public_repos;

        const commitsResponse = await fetch(`https://api.github.com/users/${username}/events`);
        const commitsData = await commitsResponse.json();
        const commits = commitsData.filter(event => event.type === 'PushEvent').length;
        document.getElementById('commits').textContent = commits;

        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        const reposData = await reposResponse.json();
        const languages = new Set();
        reposData.forEach(repo => { if (repo.language) languages.add(repo.language); });
        document.getElementById('languages').textContent = languages.size;

        const activityList = document.getElementById('recent-activity');
        activityList.innerHTML = '';
        commitsData.slice(0, 5).forEach(event => {
            if (event.type === 'PushEvent') {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <i class="bi bi-git-commit"></i>
                    <p>Pushed to ${event.repo.name.split('/')[1]}</p>
                `;
                activityList.appendChild(item);
            }
        });

    } catch (error) {
        console.error('GitHub fetch error:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => { fetchGitHubStats(); });