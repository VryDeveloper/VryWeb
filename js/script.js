// Loader
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1000);
    }
});

// Controles de Visualização de Projetos
const viewButtons = document.querySelectorAll('.view-btn');
const portfolioGrid = document.querySelector('.portfolio-grid');

viewButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        viewButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        // Update view
        portfolioGrid.classList.toggle('list-view', button.dataset.view === 'list');
    });
});

// Animações de Scroll
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Adiciona a classe fade-in aos elementos que devem ser animados
document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
});

// Observa os cards de habilidades
document.querySelectorAll('.habilidades-box').forEach(box => {
    observer.observe(box);
});

// Observa os cards de projetos
document.querySelectorAll('.projeto-card').forEach(card => {
    observer.observe(card);
});

// Executa uma vez ao carregar a página para verificar elementos visíveis
const checkVisibleElements = () => {
    document.querySelectorAll('.fade-in, .habilidades-box, .projeto-card').forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            element.classList.add('visible');
        }
    });
};

// Verifica elementos visíveis ao carregar a página
window.addEventListener('load', checkVisibleElements);

// Verifica elementos visíveis durante a rolagem
window.addEventListener('scroll', checkVisibleElements);

// GitHub Stats
async function fetchGitHubStats() {
    try {
        const username = 'VryDeveloper';
        const response = await fetch(`https://api.github.com/users/${username}`);
        const data = await response.json();
        
        // Atualiza as estatísticas básicas
        document.getElementById('repos').textContent = data.public_repos;
        
        // Busca os commits (requer autenticação)
        const commitsResponse = await fetch(`https://api.github.com/users/${username}/events`);
        const commitsData = await commitsResponse.json();
        const commits = commitsData.filter(event => event.type === 'PushEvent').length;
        document.getElementById('commits').textContent = commits;
        
        // Busca as linguagens mais usadas
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
        const reposData = await reposResponse.json();
        const languages = new Set();
        for (const repo of reposData) {
            if (repo.language) {
                languages.add(repo.language);
            }
        }
        document.getElementById('languages').textContent = languages.size;
        
        // Atualiza a atividade recente
        const activityList = document.getElementById('recent-activity');
        activityList.innerHTML = '';
        
        commitsData.slice(0, 5).forEach(event => {
            if (event.type === 'PushEvent') {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <i class="bi bi-git-commit"></i>
                    <p>Commit em ${event.repo.name.split('/')[1]}</p>
                `;
                activityList.appendChild(activityItem);
            }
        });
    } catch (error) {
        console.error('Erro ao buscar dados do GitHub:', error);
    }
}

// Chama a função quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    fetchGitHubStats();
}); 