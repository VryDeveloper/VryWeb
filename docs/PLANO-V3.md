# VryWeb v3: diagnóstico e plano de implementação

> Documento de handoff. Quem implementa (Fable) deve ler inteiro antes de mexer em código.
> Branch de trabalho: `feat/portfolio-v3`. Escrito em 2026-11-09.

---

## 1. Diagnóstico: como o site está hoje

### Stack e estrutura
- Site estático puro: `index.html` (517 linhas), `css/style.css` (1145), `js/script.js` (84). Sem build, sem framework, sem dependência JS.
- CDN: Google Fonts (Space Grotesk + JetBrains Mono), Bootstrap Icons 1.11.3, Devicon 2.16.0.
- `scripts/javascript.js` é código morto (não é referenciado no HTML). Apagar.

### Identidade visual (MANTER)
| Token | Valor | Uso |
|---|---|---|
| `--body-bg` | `#030105` | fundo quase preto, tom roxo |
| `--body-bg-alt` | `#0b0714` | cards de código/terminal |
| `--grad` | magenta `#fa00ff` → azul `#000bff` → roxo `#8b00ff` → `#b200b6` | botões, bordas, títulos |
| `--pal-1..4` | `#fa00ff` `#5b8cff` `#b388ff` `#d946ef` | papéis de "syntax highlight" (string, keyword, property, comment) |
| `--glass-bg` / `--glass-border` | branco 5% / 10% | glassmorphism |
| Fontes | Space Grotesk (display/texto), JetBrains Mono (meta, código, labels) | |

Linguagem visual já estabelecida, e o v3 deve **ampliar, não substituir**:
- **Metáfora de editor/terminal**: card `profile.ts` no hero, eyebrows `// ~/projects`, card de terminal do GitHub, `$ whoami`.
- **Glass**: nav em pílula flutuante com blur, cards translúcidos com borda em gradiente no hover (mask-composite).
- **Motion atual**: reveal-up em cascata no hero, gradiente animado no nome, cursor piscando, cards subindo no scroll, shimmer nos botões, float no CTA.
- Tema claro existente e i18n PT/EN via `data-pt` / `data-en`.
- `prefers-reduced-motion` já é respeitado. Manter esse padrão em toda animação nova.

### Pontos fortes
- Paleta tokenizada em variáveis CSS, fácil de estender.
- Projetos já separados em camadas (destaque / produção / aprendizado).
- Kitsuy Store bem descrito (fala de problema resolvido, não só de stack).

### Problemas encontrados

**Conteúdo (o mais grave pra conseguir emprego)**
1. Os projetos mais fortes não estão no site: **Salão Jade, VryGraphic, LinkPulse, VryHive, VryAuth (JWT API), Kanban em Go, bot WhatsApp SaaS, Figure Radar, jogo de sobrevivência em Unity.**
2. A seção "aprendizado" é dominada por calculadoras de IMC e juros. O recrutador julga pelo projeto mais fraco que vê. Elas devem ir para um arquivo colapsado.
3. Kitsuy Storage aparece como "repositório privado", mas o repo `VryDeveloper/Kitsuy-Storage` está **público** no GitHub. Linkar.
4. A seção "Sobre" não fala de você; é um "obrigado por visitar". Falta história, formação, o que você busca.
5. Não existe seção de contato de verdade (só footer + botão do LinkedIn).

**Bugs**
6. Link do GitHub na seção Sobre e no README aponta para `github.com/VictorVryDev`; o perfil certo é `VryDeveloper`.
7. Classe `.dark-mode` na verdade liga o **tema claro**. Nome invertido, confunde manutenção. Renomear para `data-theme="light|dark"` no `<html>`.
8. `type="image/x0icon"` no favicon (typo). Usar `image/png`.
9. Menu mobile fecha em qualquer clique dentro dele (listener no container todo).
10. `* { cursor: default }` mata o cursor de texto e de seleção no site inteiro.
11. Scroll suave duplicado: `html { scroll-behavior }` + script inline com `preventDefault`. O script quebra o hash na URL. Remover o script.

**Performance / qualidade**
12. `checkVisibleElements` roda `getBoundingClientRect` em todos os cards **a cada evento de scroll**. O IntersectionObserver já faz isso. Remover.
13. Loader com `setTimeout` fixo de 1s atrasa o LCP em todo carregamento.
14. Sem Open Graph / Twitter card: link no LinkedIn aparece sem preview. Sem JSON-LD.
15. Imagens PNG/JPG grandes sem `loading="lazy"`, sem `width/height`, como `background-image` (não acessível, não lazy).
16. Projetos hard-coded no HTML com cada texto duplicado em `data-pt`/`data-en`/conteúdo. Adicionar 10 projetos assim triplica o HTML.
17. Skills usam ícones `bi-filetype-*` genéricos (React aparece como "jsx", Node como "js"), enquanto os cards usam Devicon. Inconsistente.
18. Botões de idioma/tema ficam fixos **fora** da nav, sobrepostos no mobile.

---

## 2. Princípios do v3

1. **Continua sem build e sem framework.** HTML + CSS + JS com ES modules nativos (`<script type="module">`). Isso é argumento de venda: "tudo isso sem biblioteca". Hospedagem estática segue funcionando.
2. **Zero dependência nova de JS.** Usar plataforma: IntersectionObserver, View Transitions API, `<dialog>`, CSS scroll-driven animations (`animation-timeline: view()`) com `@supports`, Canvas 2D, Clipboard API, `fetch`.
3. **Mantém a paleta e as fontes.** Todo elemento novo usa os tokens existentes. Novos tokens só derivados dos atuais.
4. **Conteúdo orientado a recrutador**: cada projeto responde "qual era o problema difícil e como provei que resolvi" (testes, métricas, produção).
5. **Toda animação nova**: só `transform`/`opacity`/`filter`, pausa fora da tela, desliga com `prefers-reduced-motion`.

---

## 3. Arquitetura de arquivos alvo

```
index.html                 # esqueleto + conteúdo estático (hero, sobre, contato)
css/
  tokens.css               # :root e [data-theme="light"] (extraído do style.css atual)
  base.css                 # reset, tipografia, layout, utilitários
  components.css           # botões, cards, chips, dialog, toast, palette
  sections.css             # hero, projetos, skills, github, sobre, contato, footer
  motion.css               # keyframes, reveals, scroll-driven, reduced-motion
js/
  main.js                  # entry: importa e inicializa módulos
  data/projects.js         # FONTE ÚNICA dos projetos (ver schema abaixo)
  data/i18n.js             # strings de UI que não estão no HTML (labels, toasts)
  modules/i18n.js          # applyLang, t(), evento 'langchange'
  modules/theme.js         # tema + transição circular
  modules/nav.js           # menu mobile, seção ativa, barra de progresso
  modules/reveal.js        # IntersectionObserver único para reveals
  modules/hero-canvas.js   # fundo interativo do hero
  modules/typewriter.js    # card profile.ts se digitando
  modules/projects.js      # render, filtros, view transitions
  modules/case-study.js    # <dialog> de estudo de caso + deep link
  modules/palette.js       # command palette Ctrl+K
  modules/github.js        # dados ao vivo da API do GitHub
  modules/skills.js        # skills derivadas dos projetos
  modules/fx.js            # tilt, spotlight, magnetic, count-up
  modules/toast.js
assets/projects/<id>/      # capas e galerias em .webp
```

O split do CSS pode ser feito de forma mecânica (copiar blocos de `style.css` já separados pelos comentários `═══`). Não reescrever estilos que funcionam.

### Schema de `js/data/projects.js`
```js
export const projects = [
  {
    id: 'salao-jade',                 // usado em URL #/p/salao-jade
    title: 'Salão Jade',
    year: 2026,
    tier: 'featured',                 // featured | main | archive
    categories: ['fullstack'],        // fullstack | backend | ai | mobile | games | web
    status: 'live',                   // live | production | wip | archived
    cover: 'assets/projects/salao-jade/cover.webp',
    gallery: ['…/agenda.webp', '…/admin.webp'],
    icon: 'bi-cup-hot-fill',          // fallback quando não tem capa
    stack: ['nextjs', 'react', 'typescript', 'postgresql', 'prisma', 'tailwindcss', 'playwright'],
    metrics: [{ value: 51, label: { pt: 'testes', en: 'tests' } }],
    summary: { pt: '…', en: '…' },    // 1-2 frases pro card
    problem: { pt: '…', en: '…' },    // estudo de caso
    solution: { pt: '…', en: '…' },
    highlights: { pt: ['…'], en: ['…'] },
    links: { repo: 'https://github.com/…', demo: 'https://…' },
    private: false,
  },
];
```
`stack` usa chaves de um mapa `techs` no mesmo arquivo: `{ nextjs: { name: 'Next.js', devicon: 'devicon-nextjs-plain', color: false } }`. As skills e os ícones dos cards saem desse mapa, sem duplicar.

---

## 4. Lineup de projetos

Textos de base estão nos READMEs de cada repo local em `C:\Users\vryar\Dev\projetos\<pasta>`. Ler o README antes de escrever o card; **não inventar números**.

### Destaques (bento grid, 3 cards grandes)
| Projeto | Pasta / repo | Por que é destaque | Números reais |
|---|---|---|---|
| **Salão Jade** | `salao-jade` · `VryDeveloper/salao-jade` (público) · demo `salao-jade.vercel.app` | Reserva concorrente resolvida com transação e trava no Postgres, **provada por teste** (10 pedidos simultâneos → exatamente 4 reservas). Auth feita à mão (argon2id). WebGL2, View Transitions | 47 testes unit/banco + 4 e2e, ~3.900 linhas TS, CI |
| **Kitsuy Store** | `../kitsuy/kitsuy-otaku-landingpage` · `kitsuy-store-realese` | E-commerce **em produção** com pagamentos reais | 91 commits; texto atual do card já é bom |
| **VryGraphic** | `VryGraphic` · `VryDeveloper/VryGraphic` (público) | Finanças pessoais com cálculos no PostgreSQL, agente com Claude API, monorepo, Docker | 124 testes, CI. **Sem link de demo** (decidido): só o repo |

### Principais (grid filtrável)
| Projeto | Repo | Categoria | Ponto forte |
|---|---|---|---|
| **LinkPulse** | `linkpulse` (público) | fullstack | Encurtador com analytics geográfico; geo roda depois da resposta com `after()` do Next 16; cadeia de provedores com fallback; filtro de bots; LGPD |
| **VryHive** | `vryhive` (**sem remote**) | ai | Orquestrador multi-agente: planejador → ondas paralelas → integrador, roteamento por papel × esforço, failover |
| **Bot WhatsApp SaaS** | `websocket-claude` (privado) | ai, backend | Multi-tenant na Meta Cloud API + Claude, SQLite, API admin, medição de uso, 14 testes |
| **VryAuth (JWT API)** | `jwt-api` · `JWT-API` | backend | Access + refresh token, Prisma, Postgres, Docker, interface web |
| **Kanban em Go** | `veritas-crud` · `crud-go-TaskManager` | backend, fullstack | Go só com biblioteca padrão + React, drag and drop nativo |
| **ESG Inteligentes** | já no site | backend | manter texto atual |
| **Kitsuy Storage** | `Kitsuy-Storage` (**agora público**) | fullstack | manter texto, trocar "privado" pelo link |
| **Copec** | já no site | web | cliente real, site no ar |
| **Figure Radar** | `figure-radar` (sem git) | ai, web | Agregador de lançamentos com scraping, filtros e IA que gera legenda de post |
| **Jogo de sobrevivência** | `jogo-sobrevivencia` (privado, Unity) | games | 36 etapas, biomas, chefes, vila com NPCs. Pede GIF/print |
| **VryBot** | já no site | ai | manter |

### Arquivo (colapsado em "Ver mais projetos")
Rock Paper Scissors, CMeter, Calculadora de IMC, Calculadora de Juros, Fintech Java. Card compacto, sem capa grande.

### NÃO incluir
- `ai-jobsearch`: é fork de projeto de outra pessoa. Não é seu.
- Scripts pequenos (autolol, shutdown, acceptlol…).

### Imagens
Copiar e converter para `.webp` (qualidade ~80, largura máx. 1200px):
- `salao-jade/docs/screenshots/{agenda,admin,reservas,agenda-mobile}.jpg` + `demo.gif` (converter para `.webm`/`.mp4` em loop mudo, muito menor que GIF)
- `VryGraphic/docs/screenshots/{01-visao-geral,02-transacoes,05-agente,08-celular}.png` + `barra-de-comando.gif`
- `linkpulse/docs/{home,grafico,consentimento-gps}.png`
- Capas existentes em `assets/`.
- Sem screenshot (VryHive, bot WhatsApp, JWT, Kanban, jogo): usar o placeholder atual melhorado (ver 5.4) até o Victor mandar prints.

---

## 5. Features, por seção

### 5.1 Navegação
- Nav em pílula continua. **Mover idioma e tema para dentro da pílula** (corrige sobreposição no mobile).
- **Barra de progresso de leitura** de 2px com `--grad` na borda inferior da pílula. CSS `animation-timeline: scroll()` com fallback via JS (`scaleX`).
- **Seção ativa** destacada no menu (IntersectionObserver), com um "pill indicator" que desliza entre os links (`transform`, não `left`).
- Nav encolhe levemente depois de 80px de scroll (classe `is-scrolled`).
- Botão "⌘K" discreto na pílula que abre a command palette.
- Menu mobile: fechar só em clique em link/overlay/botão X ou `Esc`; `inert` no conteúdo de fundo quando aberto.

### 5.2 Hero
- **Fundo interativo em Canvas 2D** (`hero-canvas.js`): 3 a 4 "orbes" de luz com as cores `--pal-*`, blur forte via composição, que seguem o ponteiro com inércia (lerp) e respiram sozinhas. Sobreposto ao dot grid que já existe. Regras: `devicePixelRatio` limitado a 2, pausar com IntersectionObserver quando o hero sai da tela e com `visibilitychange`, frame estático em reduced-motion.
- **Card `profile.ts` se digitando**: o código existente é digitado linha a linha na primeira carga (~1,8s total). Depois o array `stack` vai trocando itens (TypeScript → Go → C# → Python…) com efeito de apagar/digitar. O HTML final já fica no DOM para SEO e leitores de tela; a animação só controla visibilidade. Respeitar reduced-motion (mostra pronto).
- Tilt 3D do card passa a seguir o mouse (hoje é fixo em -8deg), suave, máx. 8deg.
- **Faixa de números** abaixo do texto, com count-up quando entra na tela: `N projetos publicados · 175+ testes automatizados · 3 apps em produção`. Calcular a partir de `projects.js` (soma de `metrics` com label de testes, contagem de `status: 'production'|'live'`), não escrever número fixo.
- Nome continua com o gradiente animado. Adicionar split por letra com stagger na entrada (só na primeira carga).
- Dois CTAs: "Ver projetos" (primário, gradiente, **magnético**: segue o cursor alguns px) e "Baixar CV" (secundário, glass).
- Badge "Disponível para vagas" com o `pulse-dot` que já existe.
- Remover o loader com delay fixo. Se quiser manter uma intro, que seja ≤400ms e só na primeira visita da sessão (`sessionStorage`).

### 5.3 Projetos (a seção principal)
- **Bento grid de destaques**: 3 cards, o primeiro ocupando 2 colunas. Capa com `<img loading="lazy">` (não `background-image`), vídeo em loop mudo no hover para quem tem demo gravada (`preload="none"`, carrega no primeiro hover).
- **Chips de filtro**: Todos · Full-stack · Back-end · IA & Automação · Mobile · Games · Web. Contador em cada chip. Filtragem animada com **View Transitions API** (`document.startViewTransition`, `view-transition-name` por card); fallback FLIP manual com `transform` se não houver suporte. Filtro vai para a URL (`?f=ai`).
- Manter o toggle grid/lista que já existe.
- **Efeitos de card** (`fx.js`):
  - *Spotlight*: gradiente radial da cor `--accent` seguindo o cursor dentro do card (variáveis `--mx`/`--my`), combinado com a borda em gradiente que já existe.
  - *Tilt* leve (máx. 6deg) só em `pointer: fine`.
  - Ícones de stack com tooltip do nome.
- Cada card mostra: título, ano, badge de status (`EM PRODUÇÃO`, `NO AR`, `EM DESENVOLVIMENTO`), resumo, até 2 métricas em fonte mono (ex.: `51 testes`, `124 testes`), stack, links. Card inteiro clicável abre o estudo de caso; os links internos com `stopPropagation`.
- **Placeholder melhorado** para quem não tem imagem: fundo `--body-bg-alt`, ícone grande, e um mini "trecho de código" decorativo em mono com cores `--pal-*` (ex.: assinatura de função do projeto). Fica coerente com o hero.
- "Ver mais projetos" expande o arquivo com animação de altura (`grid-template-rows: 0fr → 1fr`).

### 5.4 Estudo de caso (modal)
- `<dialog>` nativo (foco e `Esc` já vêm de graça). Abre com view transition a partir do card (a capa "voa" para o topo do modal via `view-transition-name` compartilhado).
- Estrutura: capa/galeria → badges → **Problema** → **Solução** → **Destaques técnicos** (lista) → métricas → stack → links (Repo, Demo, e credenciais demo quando existirem, ex.: Salão Jade).
- Deep link `#/p/<id>`: abrir a URL com hash abre o modal; fechar volta o hash. Botões anterior/próximo e setas do teclado navegam entre projetos.
- Galeria com scroll-snap horizontal, sem lib.

### 5.5 Command palette (Ctrl+K / ⌘K / `/`)
Feature-assinatura: conversa com a metáfora de editor e é a primeira coisa que um dev testa.
- `<dialog>` com input e lista. Busca fuzzy simples (subsequência + pontuação; ~30 linhas, sem lib) em: projetos (título, stack, categoria), seções, ações.
- Ações: alternar tema, alternar idioma, baixar CV, copiar e-mail (toast "copiado"), abrir GitHub/LinkedIn, filtrar projetos por tecnologia ("ver projetos com Go").
- Navegação por ↑ ↓ Enter, `aria-activedescendant`, `role="listbox"`.
- Easter egg barato: digitar `sudo hire victor` mostra um toast/confete com as cores da paleta e o botão de contato. Opcional, só se sobrar tempo.

### 5.6 Skills
- Trocar os 4 boxes por **grupos derivados de `projects.js`**: cada tecnologia mostra o ícone Devicon colorido e quantos projetos usam ("TypeScript · 7 projetos"). Clicar filtra a seção de projetos e rola até ela. Prova que a skill foi usada de verdade.
- Grupos: Linguagens · Front-end · Back-end & Dados · DevOps & Qualidade (Docker, GitHub Actions, Vitest, Playwright, xUnit) · IA (Claude API, Gemini, agentes).
- Uma **marquee** infinita e lenta de ícones entre o hero e os projetos (CSS puro, `mask-image` nas bordas, pausa no hover e em reduced-motion).

### 5.7 GitHub ao vivo
- Manter o card de terminal, mas ele "executa" de verdade: ao entrar na tela, digita o comando e imprime a saída buscada em `https://api.github.com/users/VryDeveloper` e `/users/VryDeveloper/repos?per_page=100&sort=pushed`.
- Saída: repos públicos, último push (tempo relativo com `Intl.RelativeTimeFormat`), top 3 repos recém-atualizados com link, e uma **barra de linguagens** (agregar `language` dos repos, barra segmentada com as cores `--pal-*`).
- Cache em `localStorage` por 6h (o limite sem token é 60 req/h por IP). Em erro ou rate limit: mostrar a saída estática atual. Nunca quebrar a seção. Envolver `localStorage` em try/catch.

### 5.8 Sobre (reescrever)
- Layout em 2 colunas: texto curto em primeira pessoa + **timeline vertical** (linha em `--grad` que "se desenha" com o scroll via `animation-timeline: view()`, pontos com `pulse-dot`).
- Conteúdo da timeline (fatos confirmados pelo Victor em 2026-11-09):
  - **2023**: começa a programar.
  - **2024**: entra na **FIAP** (Faculdade de Informática e Administração Paulista, São Paulo). Primeiros projetos web e mobile (Rock Paper Scissors, apps Kotlin).
  - **Freelas**: **Copec** (site institucional no ar, primeiro cliente) e trabalhos de **automação** para clientes. Não citar nomes de clientes de automação.
  - **Kitsuy Store** em produção (primeiro e-commerce com pagamento real).
  - **2026**: conclui a FIAP. Projetos com testes automatizados e CI (Salão Jade, VryGraphic, LinkPulse).
  - Ano exato do Copec e da Kitsuy: tirar do primeiro commit dos repos (`git log --reverse`). Curso: **Análise e Desenvolvimento de Sistemas (ADS)** na FIAP.
- Texto curto em primeira pessoa: desenvolvedor full stack em **Salvador, BA**, formado pela FIAP, com freelas reais e projetos que provam o que dizem com testes. Não inventar fatos além desses.
- Sem foto (decidido). O peso visual da coluna vem da timeline.

### 5.9 Contato (seção nova, substitui o "Let's work together" flutuante)
- Card glass grande com título no estilo do hero, e-mail com **botão copiar** (Clipboard API + toast), LinkedIn, GitHub, WhatsApp, CV.
- Linha em mono: "Salvador, BA · hh:mm agora" (relógio local via `Intl.DateTimeFormat`, timezone `America/Bahia`). Mencionar "aberto a remoto".
- Botão flutuante do WhatsApp: manter, mas só aparece depois que o hero sai da tela.
- Sem formulário (precisaria de backend ou serviço de terceiros).

### 5.10 Tema e idioma
- `data-theme` no `<html>`, setado por um script inline mínimo no `<head>` (evita flash). Primeira visita segue `prefers-color-scheme`.
- Troca de tema com **revelação circular** a partir do botão: View Transitions + `clip-path: circle()` animado em `::view-transition-new(root)`. Fallback: troca direta.
- i18n: `modules/i18n.js` mantém o mecanismo `data-pt`/`data-en` do HTML e expõe `t(obj)` para o conteúdo vindo de `projects.js`. Emite evento `langchange`; módulos que renderizam (projetos, palette, github) re-renderizam ao ouvir. Atualizar `<html lang>` e `<title>`.

### 5.11 Motion global
- Um único IntersectionObserver em `reveal.js` com `data-reveal="up|fade|scale"` e `data-reveal-delay`. Remover o listener de scroll antigo.
- Títulos de seção: eyebrow `// ~/path` digitado ao entrar; palavras do h2 com stagger.
- Parallax sutil nas capas dentro dos cards com `animation-timeline: view()` dentro de `@supports`.
- Curvas: padronizar em tokens `--ease-out: cubic-bezier(.22,1,.36,1)` e `--ease-spring: cubic-bezier(.34,1.56,.64,1)`; durações `--dur-1: 150ms`, `--dur-2: 300ms`, `--dur-3: 600ms`.
- `@media (prefers-reduced-motion: reduce)`: desligar canvas, typewriter, marquee, tilt, spotlight, parallax e view transitions (`::view-transition-group(*) { animation: none }`). Reveals viram fade simples.

---

## 6. Qualidade (o que um revisor técnico vai checar)
- **Lighthouse ≥ 95** em Performance, Acessibilidade, Boas práticas e SEO (mobile). Registrar o resultado no README.
- `<head>`: Open Graph + Twitter card com imagem `assets/og.png` 1200×630 (gerar com a paleta: nome + "Full Stack Developer" + gradiente), `canonical`, JSON-LD `Person` com `sameAs` (GitHub, LinkedIn).
- Fontes com `display=swap` (já tem) e preload só da Space Grotesk.
- Todas as imagens com `width`/`height`, `loading="lazy"` (exceto acima da dobra), `alt` descritivo, `decoding="async"`.
- Acessibilidade: ordem de foco lógica, `:focus-visible` (já existe), contraste AA nos dois temas (conferir `--text-color-p` sobre glass no tema claro), `aria-pressed` nos chips, `aria-live="polite"` no contador de resultados e nos toasts, skip link "Pular para o conteúdo".
- Sem erro no console. Sem `will-change` permanente em dezenas de elementos (hoje tem em quase todo card; aplicar só durante interação).
- `target="_blank"` com `rel="noopener noreferrer"` em todos os links externos.
- README atualizado: features novas, arquitetura de módulos, "sem framework / sem dependência", print e GIF do site.

---

## 7. Ordem de implementação (fases com critério de pronto)

**Fase 0: limpeza (pequena, primeiro commit)**
Corrigir bugs 6–12 da seção 1, apagar `scripts/javascript.js`, renomear tema para `data-theme`, mover toggles para a nav.
*Pronto quando*: site idêntico visualmente, sem listener de scroll, link do GitHub certo.

**Fase 1: arquitetura**
Split do CSS, ES modules, `projects.js` + `techs`, `i18n.js`. Renderizar os projetos atuais a partir dos dados.
*Pronto quando*: seção de projetos renderizada 100% por JS, PT/EN funcionando, visual igual ao de hoje.

**Fase 2: conteúdo**
Lineup da seção 4, imagens em webp, textos a partir dos READMEs (problema/solução/destaques).
*Pronto quando*: todos os projetos da tabela presentes nos dois idiomas, sem número inventado.

**Fase 3: projetos interativos**
Bento, filtros com View Transitions, efeitos de card, estudo de caso com deep link, arquivo colapsável.

**Fase 4: hero e nav**
Canvas, typewriter, tilt por mouse, count-up, CTAs magnéticos, barra de progresso, seção ativa.

**Fase 5: command palette + skills derivadas + GitHub ao vivo**

**Fase 6: sobre, contato, tema circular, motion global**

**Fase 7: qualidade**
Meta/OG/JSON-LD, Lighthouse, a11y, teste nos dois temas × dois idiomas × mobile (375px) e desktop, reduced-motion ligado, README.

Um commit por item lógico, mensagens no padrão que o repo já usa (`feat:`, `fix:`, `perf:`, `content:`, `redesign:`).

### Verificação manual a cada fase
Abrir com um servidor estático (`npx serve .` ou `python -m http.server`; ES modules não funcionam via `file://`). Checar: console limpo, 375px sem scroll horizontal, tema claro legível, PT/EN trocando tudo, teclado navegando por tudo.

---

## 8. Decisões

### Já decididas (2026-11-09)
1. **Repos privados ou sem remote** (VryHive, bot WhatsApp, jogo Unity, Figure Radar): **mostrar como privado**. Card e estudo de caso completos, `private: true`, sem link de repo, com a tag "Repositório privado" que já existe (`.tag-private`).
2. **Hospedagem**: GitHub Pages em `https://vrydeveloper.github.io/VryWeb/`. Usar essa URL no `canonical`, `og:url` e JSON-LD. Todos os caminhos de assets e módulos devem ser **relativos** (`./js/…`), porque o site roda em subpasta `/VryWeb/`.
3. **WhatsApp**: o botão flutuante fica, mas só aparece depois que o hero sai da tela (já descrito em 5.9).
4. **Foto no Sobre**: sem foto. Só texto e timeline.

5. **Timeline e cidade**: respondido, ver 5.8 e 5.9 (FIAP 2024–2026, programa desde 2023, Salvador/BA, freelas Copec + automação).

6. **Curso**: Análise e Desenvolvimento de Sistemas. **VryGraphic**: sem demo, só link do repo.

### Ainda aberta (não bloqueia)
7. Prints ou GIFs dos projetos sem imagem (principalmente o jogo e o VryHive).
