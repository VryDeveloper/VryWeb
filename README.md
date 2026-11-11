# VryWeb — portfólio de Victor Augusto

**▶ [vrydeveloper.github.io/VryWeb](https://vrydeveloper.github.io/VryWeb/)**

Meu portfólio tem projetos com estudo de caso, habilidades contadas a partir dos próprios projetos, um terminal de verdade e alguns jogos escondidos no caminho.
É feito com **HTML, CSS e JavaScript puros**, sem framework e sem etapa de build. A única biblioteca de JavaScript é a Matter.js, carregada só quando a seção de habilidades aparece.

**Lighthouse (mobile, site publicado):** Performance 97–99, Acessibilidade 100, Boas práticas 100, SEO 100.

## O que tem aqui

| | |
|---|---|
| **Projetos em bento grid** | A Kitsuy Store em destaque e uma grade filtrável por categoria ou tecnologia. A troca de filtro é animada com a View Transitions API e fica na URL (`?f=ai`, `?t=go`) |
| **Estudo de caso** | Cada projeto abre num `<dialog>` nativo com problema, solução, destaques, métricas e galeria. Tem link direto (`#/p/kitsuy-store`) e navegação pelas setas |
| **Terminal interativo** | Na seção GitHub. Comandos: `/help`, `/resume` (baixa o CV), `/info`, `/linkedin`, `projects`, `open`, `theme`, `lang` e mais. O `/git commit -m "..."` vira uma mensagem para mim no WhatsApp. Tem histórico, autocompletar com Tab, sugestão de comando parecido e alguns comandos escondidos |
| **Habilidades com física** | Cada tecnologia é uma pílula que cai, empilha e pode ser arrastada e arremessada (Matter.js). O desafio "monte a stack" pede a stack de um projeto real. Clicar numa pílula filtra os projetos, e "ver como lista" volta para a grade |
| **Cobrinha no grid do GitHub** | O jogo da cobrinha roda em cima do meu grid real de contribuições do último ano. Os dias com commit são a comida, e a pontuação soma os commits comidos |
| **15 conquistas** | Pequenos objetivos que premiam quem explora o site: rodar comandos, trocar tema e idioma, abrir projetos, o código Konami... O progresso fica só no navegador e, a 100%, o terminal gera um certificado |
| **Paleta de comandos** | `Ctrl+K` (ou `/`) busca projetos, tecnologias, seções e ações, com busca fuzzy escrita à mão |
| **Hero** | Canvas 2D com luzes que seguem o ponteiro, cartão de código que se digita e contadores calculados a partir dos dados |
| **Tema e idioma** | Claro/escuro com revelação circular e PT/EN em todo o conteúdo. O primeiro acesso segue o sistema e o navegador |
| **Acessibilidade** | Navegação por teclado, foco visível, link para pular ao conteúdo e `prefers-reduced-motion` respeitado. Com movimento reduzido, as habilidades aparecem como lista |

## Como funciona

Todos os projetos vivem em **um arquivo de dados**, [`js/data/projects.js`](js/data/projects.js), com os textos em português e inglês.
Os cards, o estudo de caso, as habilidades, o desafio da stack, a paleta, o terminal e os números do hero leem desse arquivo, então nenhum número é digitado à mão.
Para adicionar um projeto, basta acrescentar um objeto ali e colocar as imagens em `assets/projects/<id>/`.

```
index.html                 esqueleto e conteúdo estático (hero, sobre, contato)
css/
  tokens.css               paleta, fontes (auto-hospedadas), curvas e durações; tema claro
  icons.css                gerado: só os ícones que o site usa
  base.css · components.css · sections.css · projects.css · terminal.css · motion.css
js/
  main.js                  ponto de entrada
  data/projects.js         projetos, tecnologias e categorias
  modules/
    projects.js · case-study.js · palette.js · nav.js · theme.js · i18n.js · reveal.js
    skills.js              habilidades (lista) e troca para o modo física
    skills-physics.js      Matter.js: queda, arrastar, arremessar
    skills-challenge.js    desafio "monte a stack"
    snake.js               cobrinha no grid de contribuições
    achievements.js        conquistas (escutam eventos de events.js)
    github.js              dados ao vivo da API pública do GitHub, com cache de 6 h
    terminal/              shell, comandos, git, extras e easter eggs (carregado sob demanda)
    hero-canvas.js · typewriter.js · fx.js · toast.js · actions.js · events.js
data/contributions.json    meu grid de contribuições (atualizado toda segunda por uma GitHub Action)
tools/
  subset-icons.py          gera icons.css e as fontes de ícones só com o que é usado
  contributions.sh         gera data/contributions.json pela GraphQL API do GitHub
tests/terminal.test.html   testes do terminal (abrir no navegador)
assets/                    imagens em WebP, fontes woff2, CV
```

Algumas decisões:

- **Pouco peso no primeiro carregamento.** As fontes de ícones completas pesavam 709 KB e o site usa 85 ícones. Agora são subconjuntos de 13 KB, gerados por script. As fontes de texto ficam no próprio site, com preload. O terminal, a Matter.js e o grid de contribuições só carregam quando a seção chega perto da tela.
- **Nada chama API de terceiros para funcionar.** O grid da cobrinha vem de um JSON do próprio repositório, que uma Action atualiza toda semana. A Matter.js vem do cdnjs com SRI e, se falhar, as habilidades aparecem como lista.
- **Sem listener de scroll.** Reveals, seção ativa, nav compacta e pausas automáticas (física, cobrinha) usam `IntersectionObserver`. A barra de progresso e a linha do tempo usam animações ligadas ao scroll em CSS (`animation-timeline`).
- **Rolagem no celular preservada.** As pílulas e a cobrinha usam Pointer Events próprios, e o toque só é capturado onde precisa, então a página continua rolando.
- **Nada quebra sem suporte.** View Transitions, popover e scroll timelines são melhorias progressivas: sem elas, o site troca de estado direto.

## Rodando localmente

Módulos ES não carregam por `file://`, então é preciso um servidor estático qualquer:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`. Os testes do terminal ficam em `http://localhost:8000/tests/terminal.test.html`.

Depois de usar um ícone novo, gere os ícones de novo (requer `pip install fonttools brotli`):

```bash
python tools/subset-icons.py
```

## Tecnologias

HTML5 · CSS3 · JavaScript (ES modules) · [Matter.js](https://brm.io/matter-js/) · [Bootstrap Icons](https://icons.getbootstrap.com/) e [Devicon](https://devicon.dev/) (subconjuntos auto-hospedados) · Space Grotesk e JetBrains Mono (auto-hospedadas) · GitHub Pages e GitHub Actions

## Contato

- LinkedIn: [Victor Augusto](https://www.linkedin.com/in/victor-augusto-79a5612b6/)
- GitHub: [VryDeveloper](https://github.com/VryDeveloper)
- E-mail: victor.092.augusto@gmail.com
