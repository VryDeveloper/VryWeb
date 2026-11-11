# VryWeb: habilidades com física

> Branch `feat/skills-physics`. Escrito em 2026-11-11.
> Decisão do Victor: usar **Matter.js** (é a primeira dependência de JS do site). Ela é carregada sob demanda, só quando a seção chega perto da tela.

## O que é

A seção "Habilidades" vira um espaço com gravidade.
- **Cada tecnologia é uma pílula** (ícone + nome). O tamanho cresce com o número de projetos que a usam.
- **Quando a seção aparece, as pílulas caem e se empilham.**
- **O visitante pode arrastar e arremessar** as pílulas.
- **Clicar sem arrastar filtra os projetos**, como antes.

## Desafio: "monte a stack"

- **Uma caixa no canto pede a stack de um projeto real**, por exemplo: "arraste as tecnologias da Kitsuy Store (0/7)".
- **Pílula certa:** entra na caixa.
- **Pílula errada:** é arremessada de volta, e o visitante vê a mensagem "X não está nesse projeto".
- **Stack completa:**
  - aparece a conquista "Arquiteto de stack";
  - aparece um botão para ver o projeto;
  - aparece um botão para o próximo desafio.
- **Projetos do desafio:** só os destaques e os principais com 4 a 8 tecnologias, para não cansar.

Troquei as caixas por categoria da proposta original por este desafio. São 6 categorias, e várias tecnologias caberiam em mais de uma, o que frustraria quem joga. O desafio também liga cada habilidade a um projeto, e isso é o que o recrutador quer ver.

## Decisões técnicas

- **As pílulas são `<button>` de verdade, posicionados pela física com `transform`.** O texto fica nítido, os ícones Devicon continuam, e teclado e leitor de tela funcionam.
- **O arrastar é próprio, com Pointer Events e um `Constraint` do Matter**, em vez do `MouseConstraint`. O `MouseConstraint` captura a roda do mouse e o toque, e isso travaria a rolagem da página no celular. Assim só a pílula tem `touch-action: none`: tocar no espaço vazio continua rolando a página.
- **A física roda só com a seção na tela e com a aba visível.** Os corpos dormem quando param de se mexer.
- **Matter.js 0.20.0 vem do cdnjs** com `integrity` (SRI).
- **Fallbacks para a grade antiga (lista por categoria):**
  - se o CDN falhar;
  - com `prefers-reduced-motion`;
  - pelo botão "ver como lista".
- **Conquistas novas:** "Arquiteto de stack" (completar um desafio) e "Arremesso" (jogar uma pílula com força). O total passa de 12 para 14.

## Commits

1. este plano
2. espaço com física: queda, arrastar, arremessar, clique filtra, alternar com a lista
3. desafio "monte a stack" + botão chacoalhar + conquistas
4. ajustes de verificação (celular, tema claro, movimento reduzido)
