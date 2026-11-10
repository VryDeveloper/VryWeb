# VryWeb — portfólio de Victor Augusto

**▶ [vrydeveloper.github.io/VryWeb](https://vrydeveloper.github.io/VryWeb/)**

Meu portfólio: projetos com estudo de caso, habilidades contadas a partir dos próprios projetos e contato.
Feito com **HTML, CSS e JavaScript puros**: sem framework, sem etapa de build e sem nenhuma dependência de JavaScript.

## O que tem aqui

| | |
|---|---|
| **Projetos em bento grid** | Três destaques e uma grade filtrável por categoria ou tecnologia. A troca de filtro é animada com a View Transitions API e fica na URL (`?f=ai`, `?t=go`) |
| **Estudo de caso** | Cada projeto abre num `<dialog>` nativo com problema, solução, destaques, métricas e galeria. Tem link direto (`#/p/salao-jade`) e navegação pelas setas |
| **Paleta de comandos** | `Ctrl+K` (ou `/`) busca projetos, tecnologias, seções e ações, com busca fuzzy escrita à mão |
| **Skills derivadas dos dados** | Cada tecnologia mostra em quantos projetos foi usada; clicar filtra os projetos |
| **GitHub ao vivo** | O terminal busca dados da API pública do GitHub, com cache de 6 h e uma versão estática se a API falhar |
| **Hero** | Canvas 2D com luzes que seguem o ponteiro, cartão de código que se digita e contadores calculados a partir dos dados |
| **Tema e idioma** | Claro/escuro com revelação circular, PT/EN em todo o conteúdo. O primeiro acesso segue o sistema e o navegador |
| **Acessibilidade** | Navegação por teclado, foco visível, `prefers-reduced-motion` respeitado em toda animação, link para pular ao conteúdo |

## Como funciona

Todos os projetos vivem em **um arquivo de dados**, [`js/data/projects.js`](js/data/projects.js), com os textos em português e inglês.
Os cards, o estudo de caso, as skills, a paleta de comandos e os números do hero leem desse arquivo.
Para adicionar um projeto, basta acrescentar um objeto ali e colocar as imagens em `assets/projects/<id>/`.

```
index.html              esqueleto e conteúdo estático (hero, sobre, contato)
css/
  tokens.css            paleta, fontes, curvas e durações; tema claro
  base.css              reset, tipografia, utilitários
  components.css        botões, paleta de comandos, toast
  sections.css          nav, hero, skills, GitHub, sobre, contato, rodapé
  projects.css          grade, cards, arquivo, estudo de caso
  motion.css            keyframes, reveals, transição de tema, movimento reduzido
js/
  main.js               ponto de entrada
  data/projects.js      projetos, tecnologias e categorias
  modules/
    i18n.js             idioma (data-pt / data-en no HTML, t() nos dados)
    theme.js            tema com transição circular
    nav.js              menu mobile, seção ativa, barra de progresso
    reveal.js           um IntersectionObserver para todos os reveals
    projects.js         render, filtros, URL
    case-study.js       modal com deep link
    skills.js           skills e marquee
    github.js           dados ao vivo do GitHub
    palette.js          paleta de comandos
    hero-canvas.js      fundo interativo do hero
    typewriter.js       cartão de código que se digita
    fx.js               spotlight, tilt, botões magnéticos, contadores
    toast.js
assets/projects/<id>/   capas e galerias em WebP
```

Algumas decisões:

- **Sem listener de scroll.** Reveals, seção ativa, nav compacta e o botão do WhatsApp usam `IntersectionObserver`. A barra de progresso e a linha do tempo usam animações ligadas ao scroll em CSS (`animation-timeline`), com um fallback em `requestAnimationFrame` só onde o navegador não suporta.
- **Animações só em `transform`, `opacity`, `translate` e `clip-path`.** O canvas do hero é desenhado em 1/10 da resolução e ampliado pelo CSS, o que dá o desfoque de graça, e para quando sai da tela.
- **Nada quebra sem suporte.** View Transitions, popover e scroll timelines são melhorias progressivas: sem elas o site troca de estado direto.

## Rodando localmente

Módulos ES não carregam por `file://`, então é preciso um servidor estático qualquer:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Tecnologias

HTML5 · CSS3 · JavaScript (ES modules) · [Bootstrap Icons](https://icons.getbootstrap.com/) e [Devicon](https://devicon.dev/) via CDN (fontes de ícones) · Google Fonts (Space Grotesk, JetBrains Mono)

## Contato

- LinkedIn: [Victor Augusto](https://www.linkedin.com/in/victor-augusto-79a5612b6/)
- GitHub: [VryDeveloper](https://github.com/VryDeveloper)
- E-mail: victor.092.augusto@gmail.com
