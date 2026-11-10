// Single source of truth for projects and technologies.
// Cards, case studies, skills, the command palette and the hero counters all read from here.

// icon: a devicon class (add " colored" for the brand color) or a bootstrap-icons class.
// group: lang | front | back | quality | ai | platform
export const techs = {
    typescript:    { name: 'TypeScript',     icon: 'devicon-typescript-plain colored',    group: 'lang' },
    javascript:    { name: 'JavaScript',     icon: 'devicon-javascript-plain colored',    group: 'lang' },
    python:        { name: 'Python',         icon: 'devicon-python-plain colored',        group: 'lang' },
    csharp:        { name: 'C#',             icon: 'devicon-csharp-plain colored',        group: 'lang' },
    go:            { name: 'Go',             icon: 'devicon-go-plain colored',            group: 'lang' },
    kotlin:        { name: 'Kotlin',         icon: 'devicon-kotlin-plain colored',        group: 'lang' },
    java:          { name: 'Java',           icon: 'devicon-java-plain colored',          group: 'lang' },
    html:          { name: 'HTML5',          icon: 'devicon-html5-plain colored',         group: 'lang' },
    css:           { name: 'CSS3',           icon: 'devicon-css3-plain colored',          group: 'lang' },

    react:         { name: 'React',          icon: 'devicon-react-original colored',      group: 'front' },
    nextjs:        { name: 'Next.js',        icon: 'devicon-nextjs-plain',                group: 'front' },
    vite:          { name: 'Vite',           icon: 'devicon-vitejs-plain colored',        group: 'front' },
    tailwind:      { name: 'Tailwind CSS',   icon: 'devicon-tailwindcss-plain colored',   group: 'front' },
    leaflet:       { name: 'Leaflet',        icon: 'bi bi-geo-alt-fill',                  group: 'front' },

    nodejs:        { name: 'Node.js',        icon: 'devicon-nodejs-plain colored',        group: 'back' },
    express:       { name: 'Express',        icon: 'devicon-express-original',            group: 'back' },
    dotnet:        { name: '.NET / EF Core', icon: 'devicon-dotnetcore-plain colored',    group: 'back' },
    postgresql:    { name: 'PostgreSQL',     icon: 'devicon-postgresql-plain colored',    group: 'back' },
    prisma:        { name: 'Prisma',         icon: 'devicon-prisma-original',             group: 'back' },
    sqlite:        { name: 'SQLite',         icon: 'devicon-sqlite-plain colored',        group: 'back' },
    firebase:      { name: 'Firebase',       icon: 'devicon-firebase-plain colored',      group: 'back' },
    supabase:      { name: 'Supabase',       icon: 'devicon-supabase-plain colored',      group: 'back' },
    oracle:        { name: 'Oracle DB',      icon: 'devicon-oracle-original colored',     group: 'back' },
    zod:           { name: 'Zod',            icon: 'bi bi-shield-check',                  group: 'back' },

    docker:        { name: 'Docker',         icon: 'devicon-docker-plain colored',        group: 'quality' },
    githubactions: { name: 'GitHub Actions', icon: 'devicon-githubactions-plain colored', group: 'quality' },
    vitest:        { name: 'Vitest',         icon: 'devicon-vitest-plain colored',        group: 'quality' },
    playwright:    { name: 'Playwright',     icon: 'devicon-playwright-plain colored',    group: 'quality' },
    xunit:         { name: 'xUnit',          icon: 'bi bi-check2-square',                 group: 'quality' },
    vercel:        { name: 'Vercel',         icon: 'devicon-vercel-original',             group: 'quality' },

    claude:        { name: 'Claude API',     icon: 'bi bi-stars',                         group: 'ai' },
    gemini:        { name: 'Gemini API',     icon: 'devicon-google-plain colored',        group: 'ai' },
    llmrouting:    { name: 'LLM routing',    icon: 'bi bi-diagram-3-fill',                group: 'ai' },

    android:       { name: 'Android',        icon: 'devicon-android-plain colored',       group: 'platform' },
    unity:         { name: 'Unity',          icon: 'devicon-unity-plain',                 group: 'platform' },
    discord:       { name: 'Discord',        icon: 'devicon-discordjs-plain colored',     group: 'platform' },
    whatsapp:      { name: 'WhatsApp Cloud API', icon: 'bi bi-whatsapp',                  group: 'platform' },
};

export const techGroups = {
    lang:     { pt: 'Linguagens',          en: 'Languages' },
    front:    { pt: 'Front-end',           en: 'Front-end' },
    back:     { pt: 'Back-end & Dados',    en: 'Back-end & Data' },
    quality:  { pt: 'DevOps & Qualidade',  en: 'DevOps & Quality' },
    ai:       { pt: 'IA',                  en: 'AI' },
    platform: { pt: 'Plataformas',         en: 'Platforms' },
};

export const categories = {
    fullstack: { pt: 'Full-stack',       en: 'Full-stack' },
    backend:   { pt: 'Back-end',         en: 'Back-end' },
    ai:        { pt: 'IA & Automação',   en: 'AI & Automation' },
    mobile:    { pt: 'Mobile',           en: 'Mobile' },
    games:     { pt: 'Games',            en: 'Games' },
    web:       { pt: 'Web',              en: 'Web' },
};

// status: production (real users) | live (public demo) | wip | done
export const statuses = {
    production: { pt: 'EM PRODUÇÃO',        en: 'IN PRODUCTION' },
    live:       { pt: 'DEMO NO AR',         en: 'LIVE DEMO' },
    wip:        { pt: 'EM DESENVOLVIMENTO', en: 'IN DEVELOPMENT' },
};

// tier: featured | main | archive
export const projects = [
    {
        id: 'kitsuy-store',
        title: 'Kitsuy Store',
        year: 2025,
        tier: 'featured',
        categories: ['fullstack'],
        status: 'production',
        icon: 'bi-bag-check-fill',
        stack: ['react', 'typescript', 'vite', 'firebase', 'zod', 'vitest', 'vercel'],
        summary: {
            pt: 'E-commerce em produção com pagamentos reais via MercadoPago e um endurecimento de segurança próprio: estoque que não vende duas vezes, pedidos que expiram sozinhos e API protegida contra abuso.',
            en: 'E-commerce in production with real payments through MercadoPago and its own security hardening: stock that never sells twice, orders that expire on their own and an API protected against abuse.',
        },
        problem: {
            pt: 'Uma loja de verdade recebe dinheiro de verdade. Dois clientes não podem comprar a última unidade ao mesmo tempo, um pedido abandonado não pode prender estoque para sempre e nenhuma entrada do usuário pode ser confiada.',
            en: 'A real store takes real money. Two customers cannot buy the last unit at the same time, an abandoned order cannot hold stock forever, and no user input can be trusted.',
        },
        solution: {
            pt: 'Transações atômicas no Firestore decidem quem fica com o estoque. Um Cron Job na Vercel expira pedidos pendentes e devolve os itens. Toda entrada passa por Zod e as rotas têm limite de requisições com Upstash.',
            en: 'Atomic Firestore transactions decide who gets the stock. A Vercel Cron Job expires pending orders and returns the items. Every input goes through Zod and the routes are rate limited with Upstash.',
        },
        highlights: {
            pt: [
                'Transações atômicas no Firestore contra overselling',
                'Expiração automática de pedidos pendentes via Vercel Cron Jobs',
                'Validação de entrada com Zod e rate limiting com Upstash',
                'Checkout com MercadoPago',
            ],
            en: [
                'Atomic Firestore transactions against overselling',
                'Automatic expiration of pending orders via Vercel Cron Jobs',
                'Input validation with Zod and rate limiting with Upstash',
                'Checkout with MercadoPago',
            ],
        },
        links: {
            repo: 'https://github.com/VryDeveloper/kitsuy-store-realese',
            demo: 'https://kitsuy-store-realese.vercel.app',
        },
    },
    {
        id: 'kitsuy-storage',
        title: 'Kitsuy Storage',
        year: 2026,
        tier: 'main',
        categories: ['fullstack'],
        status: 'production',
        icon: 'bi-hdd-stack-fill',
        stack: ['react', 'typescript', 'vite', 'supabase'],
        summary: {
            pt: 'Painel administrativo interno da Kitsuy para gestão de pedidos e precificação, com upload de imagens e calculadora de preço com taxa de conversão.',
            en: 'Kitsuy\'s internal admin panel for order management and pricing, with image uploads and a price calculator with exchange rate.',
        },
        problem: {
            pt: 'A operação da loja dependia de planilhas: pedidos, custo de importação e preço final eram calculados à mão.',
            en: 'The store ran on spreadsheets: orders, import cost and final price were all calculated by hand.',
        },
        solution: {
            pt: 'Um painel próprio em React com Supabase. O acesso é controlado por Row-Level Security no banco, então a regra de quem vê o quê não depende do front-end.',
            en: 'A dedicated React panel on Supabase. Access is enforced by Row-Level Security in the database, so who sees what does not depend on the front-end.',
        },
        highlights: {
            pt: [
                'Autenticação com Row-Level Security (RLS) no Supabase',
                'Upload de imagens via Supabase Storage',
                'Calculadora de precificação com taxa de conversão (Wise)',
                'Modo escuro',
            ],
            en: [
                'Authentication with Row-Level Security (RLS) on Supabase',
                'Image uploads via Supabase Storage',
                'Pricing calculator with a Wise exchange-rate field',
                'Dark mode',
            ],
        },
        links: { repo: 'https://github.com/VryDeveloper/Kitsuy-Storage' },
    },
    {
        id: 'copec',
        title: 'Copec',
        year: 2025,
        tier: 'main',
        categories: ['web'],
        status: 'production',
        cover: 'assets/projeto-copec.jpg',
        stack: ['nextjs', 'react', 'typescript', 'tailwind'],
        summary: {
            pt: 'Site institucional no ar para a Copec, feito como freelance: apresentação da empresa, catálogo de produtos e serviços, com mapa integrado.',
            en: 'Live company website for Copec, built as a freelance job: company presentation, product and service catalog, with an integrated map.',
        },
        highlights: {
            pt: ['Primeiro cliente como freelancer', 'Next.js com Tailwind CSS', 'Integração com a Google Maps API'],
            en: ['First freelance client', 'Next.js with Tailwind CSS', 'Google Maps API integration'],
        },
        links: { demo: 'https://acoscopec.com' },
    },
    {
        id: 'esg-inteligentes',
        title: 'ESG Inteligentes',
        year: 2025,
        tier: 'main',
        categories: ['backend'],
        icon: 'bi-lightning-charge-fill',
        code: 'app.MapGet("/api/consumo", …)',
        stack: ['csharp', 'dotnet', 'postgresql', 'docker', 'githubactions', 'xunit'],
        summary: {
            pt: 'API REST para monitoramento de consumo energético com métricas ESG, com testes automatizados, Docker e pipeline de CI/CD.',
            en: 'REST API for energy consumption monitoring with ESG metrics, with automated tests, Docker and a CI/CD pipeline.',
        },
        highlights: {
            pt: [
                'Persistência com Entity Framework Core e PostgreSQL',
                'Testes automatizados com xUnit',
                'Pipeline de CI/CD no GitHub Actions',
                'Containerização com Docker e documentação via Swagger',
            ],
            en: [
                'Persistence with Entity Framework Core and PostgreSQL',
                'Automated tests with xUnit',
                'CI/CD pipeline on GitHub Actions',
                'Docker containerization and Swagger documentation',
            ],
        },
        links: { repo: 'https://github.com/VryDeveloper/ESGInteligentes' },
    },
    {
        id: 'vrybot',
        title: 'VryBot',
        year: 2024,
        tier: 'main',
        categories: ['ai'],
        cover: 'assets/projeto-vrybot.png',
        stack: ['python', 'gemini', 'discord'],
        summary: {
            pt: 'Bot para Discord com IA, integrado à API do Gemini para responder em tempo real dentro do servidor.',
            en: 'AI-powered Discord bot, integrated with the Gemini API to answer in real time inside the server.',
        },
        links: { repo: 'https://github.com/VryDeveloper/VryBot' },
    },
    {
        id: 'rock-paper-scissors',
        title: 'Rock Paper Scissors',
        year: 2025,
        tier: 'archive',
        categories: ['web', 'games'],
        cover: 'assets/projeto1.png',
        stack: ['html', 'css', 'javascript'],
        summary: {
            pt: 'Pedra, papel e tesoura com interface temática de Minecraft e mecânicas de clicker game.',
            en: 'Rock Paper Scissors with a Minecraft-themed interface and clicker game mechanics.',
        },
        links: {
            repo: 'https://github.com/VryDeveloper/Rock-Paper-Scissors',
            demo: 'https://vrydeveloper.github.io/Rock-Paper-Scissors/',
        },
    },
    {
        id: 'cmeter',
        title: 'CMeter',
        year: 2025,
        tier: 'archive',
        categories: ['mobile'],
        cover: 'assets/projeto-CMeter.PNG',
        stack: ['kotlin', 'android', 'firebase'],
        summary: {
            pt: 'App Android que calcula a pegada de carbono a partir do consumo de energia e das distâncias percorridas.',
            en: 'Android app that calculates a carbon footprint from energy consumption and distances traveled.',
        },
        links: { repo: 'https://github.com/VryDeveloper/CMeter' },
    },
    {
        id: 'calculadora-imc',
        title: { pt: 'Calculadora de IMC', en: 'BMI Calculator' },
        year: 2025,
        tier: 'archive',
        categories: ['mobile'],
        cover: 'assets/projeto-calimc.png',
        stack: ['kotlin', 'android'],
        summary: {
            pt: 'App Android que calcula o IMC a partir do peso e da altura.',
            en: 'Android app that calculates BMI from weight and height.',
        },
        links: { repo: 'https://github.com/VryDeveloper/Calculadora-IMC' },
    },
    {
        id: 'calculadora-juros',
        title: { pt: 'Calculadora de Juros', en: 'Interest Calculator' },
        year: 2025,
        tier: 'archive',
        categories: ['mobile'],
        cover: 'assets/projeto-caljuros.PNG',
        stack: ['kotlin', 'android'],
        summary: {
            pt: 'App Android que calcula juros a partir do valor, da taxa e do tempo.',
            en: 'Android app that calculates interest from principal, rate and time.',
        },
        links: { repo: 'https://github.com/VryDeveloper/Calculadora-de-Juros' },
    },
    {
        id: 'fintech-java',
        title: 'Fintech Java',
        year: 2024,
        tier: 'archive',
        categories: ['backend'],
        cover: 'assets/projeto-fintech.png',
        stack: ['java', 'oracle'],
        summary: {
            pt: 'Projeto de estudo de POO em Java com autenticação, DAOs e banco de dados Oracle.',
            en: 'OOP study project in Java with authentication, DAOs and an Oracle database.',
        },
        links: { repo: 'https://github.com/VryDeveloper/Classes-Fintech---JAVA' },
    },
];

export const techIcon = key => {
    const tech = techs[key];
    return `<i class="${tech.icon}" title="${tech.name}" aria-label="${tech.name}" role="img"></i>`;
};
