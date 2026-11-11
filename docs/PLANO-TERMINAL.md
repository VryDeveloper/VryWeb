# VryWeb: terminal interativo e camada de jogo

> Documento de handoff. Quem implementar deve ler este documento inteiro e a seção 9 de `PLANO-V3.md` antes de mexer no código.
> Branch: `feat/terminal`. Escrito em 2026-11-11.
> Regras herdadas do v3: sem dependências, ES modules nativos, caminhos relativos (GitHub Pages), PT/EN, `prefers-reduced-motion`, nunca inventar números.

## 1. Objetivo

O visitante pode **digitar** no site. Um terminal que parece de verdade, com comandos pré-definidos, mostra que você sabe front-end e prende a atenção do recrutador.

O terminal também é um atalho para o que o recrutador quer:
- currículo
- dados de contato
- LinkedIn
- uma mensagem pronta no seu WhatsApp

Comandos que o usuário pediu:

| Comando | O que faz |
|---|---|
| `/help` | lista todos os comandos |
| `/resume` | mostra o link do currículo e baixa o PDF |
| `/info` | ficha do candidato para o recrutador |
| `/linkedin` | resumo de quem você é + link do LinkedIn |
| `/git commit` | "commit" falso que monta uma mensagem para o recrutador te mandar no WhatsApp |

## 2. Onde o terminal fica

**Decisão: a seção `#github` vira o terminal interativo.** Ela já tem a barra com as três bolinhas, o prompt `$` e a animação de digitação. Hoje é só decorativa.

Como fica:
1. **Na carga, nada muda para quem só rola a página.** O comando `gh profile view VryDeveloper` se digita sozinho como hoje e os dados do GitHub aparecem.
2. **Quando a animação acaba, aparece uma linha de prompt com cursor piscando**, mais uma dica apagada: `digite /help ou toque num comando ↓`.
3. **Clicar em qualquer lugar do terminal foca o input.**
4. **Botão de tela cheia na barra (`⤢`):** abre o mesmo terminal em um `<dialog>` grande. É o mesmo nó DOM, movido para dentro do dialog, então o histórico continua.
5. **Atalho global:** a tecla `` ` `` (crase), quando nenhum input está focado, abre o terminal em tela cheia. A paleta `Ctrl+K` ganha a ação "Abrir terminal".

Por que não um terminal flutuante novo: seria um segundo elemento fixo na tela, além do botão do WhatsApp, e duplicaria o card que já existe.

O `github.js` atual vira o comando `gh` (seção 4.3). O texto estático do HTML continua como fallback sem JS.

## 3. Interface: "idêntica a um terminal real"

### 3.1 Visual
- **Fonte:** JetBrains Mono (já carregada), linha de 1.6, fundo do `.terminal-card` atual.
- **Prompt colorido:** `visitante@vryweb:~$`, com `visitante` em `--pal-2`, `vryweb` em `--pal-1` e `~` em `--pal-3`.
  - Depois do `git config` do commit (4.5), o prompt passa a mostrar o nome do recrutador: `ana@vryweb:~$`.
- **Cursor em bloco (`█`) piscando**, desenhado por CSS sobre um `<input>` real com `caret-color: transparent`. Com `prefers-reduced-motion`, o cursor não pisca.
- **Mensagem de boas-vindas** no estilo MOTD:
  ```
  VryWeb OS 3.0 (tty1) — último login: hoje, de Salvador, BA
  Digite /help para ver os comandos.
  ```
- **Cores da saída:**
  - erros em `#ff6b6b`
  - sucesso em verde (`--green-term`, novo token, o mesmo verde da bolinha)
  - links sublinhados e clicáveis
- **Rolagem:** o terminal tem altura fixa (`min(70vh, 520px)` em tela cheia, `360px` inline) e rola até o fim a cada saída.

### 3.2 Comportamento de shell
Isso é o que faz parecer de verdade:

| Tecla | Ação |
|---|---|
| `Enter` | executa |
| `↑` / `↓` | navega no histórico (salvo em `localStorage`, últimos 50) |
| `Tab` | autocompleta comando ou argumento; com várias opções, lista todas, como no bash |
| `Ctrl+L` | limpa a tela (`clear` também) |
| `Ctrl+C` | cancela o comando ou o prompt interativo e imprime `^C` |
| `Esc` | sai da tela cheia |

- **Comando desconhecido:**
  ```
  vryweb: comando não encontrado: hlep
  Você quis dizer /help?
  ```
  A sugestão usa distância de Levenshtein ≤ 2.
- **Barra opcional:** `/help`, `help`, `/HELP ` funcionam igual. O comando é normalizado (trim, minúsculas, `/` inicial opcional). No `/help`, os comandos aparecem com a barra, como você pediu.
- **Saídas que "rodam":** linhas que levam tempo aparecem uma a uma (30–60 ms entre linhas), como um processo real. Com reduced motion, tudo aparece de uma vez.

### 3.3 Celular
Digitar comando no celular é ruim, então embaixo do terminal fica uma fileira de **chips tocáveis**: `/help` `/resume` `/info` `/linkedin` `/git commit`.
- Tocar no chip "digita" o comando no prompt (animação rápida) e executa.
- No desktop os chips também aparecem, menores. Eles ensinam que o terminal é interativo.

### 3.4 Acessibilidade
- O input real tem `aria-label="Terminal: digite um comando"`.
- A saída é `role="log"` com `aria-live="polite"`, para o leitor de tela anunciar as respostas.
- Links e botões da saída são `<a>`/`<button>` de verdade, alcançáveis por Tab. Para isso, o Tab só autocompleta quando o input tem texto; com o input vazio, ele navega normalmente.
- O terminal não prende o foco quando está inline. Em tela cheia, o `<dialog>` cuida disso.

## 4. Comandos

Todo texto de saída é PT/EN via `t({pt, en})`.

### 4.1 `/help`
```
Comandos disponíveis:

  /resume        baixar meu currículo (PDF)
  /info          ficha rápida para recrutadores
  /linkedin      quem eu sou + LinkedIn
  /git commit    me mandar uma mensagem no WhatsApp
  /projects      listar projetos           (open <projeto> para abrir)
  /gh            meus dados no GitHub
  /theme         alternar tema claro/escuro
  /lang          trocar idioma pt/en
  clear          limpar a tela

Dica: Tab completa, ↑ repete. Há comandos escondidos. 👀
```
- Os quatro primeiros são os seus. Os outros reaproveitam código que já existe.
- `help <comando>` mostra o uso detalhado de um comando.

### 4.2 `/resume`
```
$ /resume
Preparando curriculo.pdf...
[████████████████████] 100%  ·  PDF
✔ Download iniciado: Victor Augusto - CV.pdf
  Não começou? → assets/curriculo.pdf (abrir no navegador)
```
- A barra de progresso é **falsa e rápida** (≈600 ms) e mostra o tamanho do arquivo de verdade. O tamanho vem de um `HEAD` com `Content-Length`; se o HEAD falhar, mostra só "PDF".
- Reaproveita `downloadCV()` de `palette.js`, que vai mudar de arquivo (seção 6).
- No iOS, o atributo `download` pode só abrir o PDF, por isso o link de fallback fica visível.

### 4.3 `/info`
Ficha de candidato em formato de "manifesto", alinhada como `neofetch`. À esquerda vai o logo em ASCII (pequeno, ~8 linhas); à direita, os dados:
```
victor@vryweb
-------------
Nome:         Victor Augusto
Cargo:        Desenvolvedor Full Stack
Local:        Salvador, BA (UTC−3) · 14:32 agora
Formação:     ADS — FIAP (2024–2026)
Programando:  desde 2023
Stack:        TypeScript, React, C#/.NET, Python, Go, SQL
Projetos:     19 · 189 testes · 4 em produção
Modelo:       presencial em Salvador ou remoto
Status:       ● disponível para vagas
E-mail:       victor.092.augusto@gmail.com   [copiar]
```
- Os números vêm de `projects.js`, os mesmos do hero, nunca escritos à mão.
- A hora vem do `tick()` de `main.js`.
- `[copiar]` reaproveita `copyEmail()`.
- Abaixo da ficha: `Dica: /resume baixa o currículo · /git commit fala comigo`.
- No celular, sem espaço para o ASCII, ele some (`@media` ≤ 600px).

### 4.4 `/linkedin`
```
$ /linkedin
Abrindo perfil...

  Victor Augusto · Desenvolvedor Full Stack
  Salvador, BA · ADS pela FIAP

  Construo sistemas de ponta a ponta: banco, API, interface,
  deploy e CI. Já entreguei o site de um cliente (Copec),
  uma loja com pagamento real (Kitsuy Store) e projetos com
  suíte de testes que prova o que promete.

  → linkedin.com/in/victor-augusto-79a5612b6  [abrir]
```
- O texto sai da bio do "Sobre", resumida. Revise o texto final (seção 8).
- **Não abre a aba sozinho.** Pop-up automático é bloqueado e irrita. O link `[abrir]` recebe o foco, então um `Enter` abre.

### 4.5 `/git commit`: o comando principal
A ideia: o recrutador "commita" uma mensagem para você e o `push` abre o WhatsApp com tudo preenchido.

Fluxo, com prompts interativos que esperam a resposta:
```
$ /git commit
hint: primeiro, quem é você? (Ctrl+C cancela)
? Seu nome: Ana Souza
? Empresa: Acme
? Assunto: (1) Vaga  (2) Freela  (3) Só um oi    › 1
? Mensagem: Vi seu portfólio e quero conversar sobre uma vaga de dev full stack.

[main 3f9a2c1] Vaga: Ana Souza (Acme)
 1 file changed, 1 insertion(+)
 create mode 100644 mensagens/ana-souza.txt

✔ Commit salvo. Rode git push para me enviar no WhatsApp.
$ git push
Enumerating objects: 1, done.
Writing objects: 100% (1/1), done.
To wa.me/5531996588742
 * [new branch]  ana-souza -> victor
✔ Abrindo o WhatsApp...
```

Detalhes:
- **Atalho de uma linha:** `git commit -m "mensagem"` pula a pergunta da mensagem. Ainda pede nome e empresa, se não existirem do `git config` anterior.
- **Nome do recrutador:** depois da primeira resposta, o prompt passa a ser `ana@vryweb:~$`. Guardado em `localStorage` (`term-user`), então numa próxima visita aparece `Bem-vinda de volta, Ana`. Não inferir gênero: use "Bem-vindo(a) de volta" ou só "Olá de novo, Ana".
- **Hash do commit:** 7 caracteres hex derivados do texto (hash simples), então o mesmo texto gera o mesmo hash.
- **"Salvando a mensagem":**
  - **Rascunho:** o texto vai para `localStorage` (`term-commits`) a cada resposta. Se o recrutador fechar a aba no meio, `git status` mostra o rascunho e `git commit` retoma de onde parou.
  - **Commit:** `git log` lista os commits que ele fez. `git log` sem commits mostra os commits reais do portfólio (texto fixo com os 5 últimos marcos, não chamada à API).
- **`git push`:** monta o texto e abre `https://wa.me/5531996588742?text=<encodeURIComponent(...)>` em nova aba.
  - Abre só por ação do usuário: o `Enter` do `git push` é um gesto, então o `window.open` não é bloqueado.
  - Também aparece um botão `[abrir WhatsApp]` como fallback.
  - Texto enviado:
    ```
    Olá, Victor! Vim pelo seu portfólio.
    Nome: Ana Souza · Empresa: Acme
    Assunto: Vaga
    Vi seu portfólio e quero conversar sobre uma vaga de dev full stack.
    — enviado via git push 3f9a2c1 😄
    ```
- **Depois do push, o terminal sugere o próximo passo:** `Também pode me escrever: victor.092.augusto@gmail.com [copiar]`.
- **Validação:** nome e mensagem não podem ser vazios (`error: empty commit message`, como o git real). Cada campo tem limite de 500 caracteres.
- **Nada sai do navegador** até o push. Não há backend, e o texto só vai para o WhatsApp quando o próprio visitante clica.
- **Erros de git que dão realismo:**
  - `git` sozinho mostra o uso.
  - `git add .` responde `nada para adicionar, use git commit`.
  - `git push` sem commit dá `error: nothing to push. Rode git commit primeiro`.

### 4.6 Comandos extras
Custo baixo, porque reaproveitam código:

| Comando | Faz | Reaproveita |
|---|---|---|
| `/projects` (`ls projetos`) | lista os projetos em colunas, coloridos por status | `projects` de `data/projects.js` |
| `open <id>` / `cat <id>` | abre o estudo de caso (Tab completa os ids) | `openProject()` |
| `/gh` | o `gh profile view` atual | `github.js` |
| `/theme`, `/lang` | alternam tema e idioma | `toggleTheme`, `toggleLang` |
| `whoami` | `visitante`, ou o nome do recrutador | — |
| `pwd`, `ls`, `cd <seção>` | `cd projetos` rola até a seção | `scrollIntoView` |
| `date` | hora em Salvador | `Intl.DateTimeFormat` |
| `history` | histórico numerado | — |
| `exit` | fecha a tela cheia / tira o foco | — |

### 4.7 Comandos escondidos (easter eggs)
Não aparecem no `/help`, só a dica "há comandos escondidos":
- `sudo hire victor`: o mesmo easter egg da paleta, com `[sudo] senha para recrutador: ********` e depois `Permissão concedida.` e o atalho para `/git commit`.
- `rm -rf /`: `Boa tentativa. 😏 Este portfólio tem backup.` e um efeito de "tremida" de 300 ms, desligado com reduced motion.
- `vim`: abre "vim" e só sai com `:q`. Piada clássica, uma tela só.
- `coffee` / `make coffee`: `☕ Compilando café... erro 418: I'm a teapot`.
- `matrix`: chuva de caracteres verdes por 3 s no canvas do terminal, desligada com reduced motion.
- `konami`: a sequência ↑↑↓↓←→←→BA em qualquer lugar do site libera uma conquista (seção 5).

## 5. Camada de jogo: conquistas (proposta)

Você pediu para gamificar e engajar. A proposta é **um** sistema simples, que conversa com o terminal, em vez de vários minijogos.

- **Conquistas desbloqueáveis.** Ao fazer certas coisas, aparece um toast no estilo "achievement" (ícone + título + `+1`), usando o `toast.js` existente.
- **Contador discreto na nav:** um ícone de troféu com `3/12`, que abre um painel com a lista (as bloqueadas aparecem como `???` com uma dica).
- **Comando `achievements`** no terminal: mostra a lista com barra de progresso.
- **Tudo em `localStorage`** (`vw-achievements`), sem backend.
- **Ao completar 100%:** o terminal imprime um "certificado" em ASCII com a data e um botão para compartilhar no LinkedIn. O link do LinkedIn usa `share-offsite` apenas com a URL do portfólio.

Conquistas iniciais (12). Cada uma é detectada por um evento que o site já tem ou que é fácil emitir:

| # | Nome | Como desbloqueia |
|---|---|---|
| 1 | Hello, World | rodar o primeiro comando |
| 2 | RTFM | rodar `/help` |
| 3 | Recrutador nível 1 | rodar `/resume` |
| 4 | Ficha completa | rodar `/info` |
| 5 | Networking | rodar `/linkedin` |
| 6 | Primeiro commit | concluir `/git commit` |
| 7 | Deploy em produção | concluir `git push` |
| 8 | Curioso | abrir 3 estudos de caso diferentes |
| 9 | Lado claro da força | trocar o tema |
| 10 | Poliglota | trocar o idioma |
| 11 | Power user | abrir a paleta com `Ctrl+K` |
| 12 | Hacker | achar 3 comandos escondidos (ou o Konami) |

Implementação: um módulo `achievements.js` que ouve um evento `vw:event` no `document`. Os módulos só disparam `dispatchEvent(new CustomEvent('vw:event', {detail: 'theme'}))`, sem conhecer as conquistas.

**Fica fora agora:** minijogos (snake no terminal, etc.) e ranking online, que precisaria de backend. Dá para adicionar depois como comando (`snake`) sem mudar a arquitetura.

## 6. Arquitetura

```
js/modules/terminal/
  shell.js        núcleo: input, histórico, Tab, Ctrl+C/L, render da saída, io.prompt()
  commands.js     registro de comandos { name, aliases, hidden, desc{pt,en}, complete(), run(args, io) }
  git.js          o fluxo git commit / push / log / status (o maior comando, isolado)
  fun.js          comandos escondidos
js/modules/achievements.js
js/modules/actions.js   copyEmail, downloadCV, openWhatsApp (tirados de palette.js para serem compartilhados)
css/terminal.css
```

- **A interface `io` que cada comando recebe:**
  - `print(textoOuNó, {cls})`
  - `printLines(array, {delay})`
  - `link(label, href)`
  - `button(label, fn)`
  - `prompt(pergunta, {choices})` → `Promise<string>`, rejeita com Ctrl+C
  - `clear()`
  - `signal` (AbortSignal do Ctrl+C)
- **Saída sempre por `textContent`/nós DOM**, nunca `innerHTML` com texto do usuário. O nome e a mensagem do recrutador são entrada não confiável.
- **Carregamento preguiçoso:** `main.js` só importa `terminal/shell.js` com `import()` quando a seção `#github` entra na tela, no primeiro foco ou na primeira crase. O peso inicial da página não muda, e isso importa porque a performance já está abaixo da meta.
- **`github.js`:** a parte de busca + cache vira uma função exportada `loadGitHub()`, usada pelo comando `gh`. A animação de digitação da carga passa a ser o primeiro comando executado pelo shell.

## 7. Fases (um commit por item)

**Fase 1: shell**
1. `actions.js`: extrair `copyEmail`, `downloadCV` e `openWhatsApp` de `palette.js` (sem mudar comportamento).
2. `terminal.css` + markup: prompt, cursor em bloco, chips, botão de tela cheia.
3. `shell.js`: input, Enter, histórico ↑↓, `clear`, Ctrl+L/C, comando desconhecido com sugestão.
4. Tab completion.
5. `github.js` vira o comando `gh` e a animação inicial roda pelo shell.
6. Tela cheia em `<dialog>`, atalho da crase e ação na paleta.

**Fase 2: comandos do usuário**
7. `/help`.
8. `/resume`.
9. `/info`.
10. `/linkedin`.
11. `/git commit` + `git push` + `git log` / `git status` + rascunho no `localStorage`.

**Fase 3: extras**
12. Comandos extras da 4.6.
13. Comandos escondidos da 4.7.

**Fase 4: conquistas**
14. `achievements.js` + eventos `vw:event` nos módulos.
15. Troféu na nav + painel + comando `achievements` + certificado.

**Fase 5: verificação**
16. Testes manuais:
    - desktop, 375 px, tema claro, PT/EN, reduced motion, só teclado, leitor de tela (NVDA)
    - Lighthouse sem regressão (o terminal é lazy)
    - `git push` abre o WhatsApp com o texto certo no celular de verdade

**Testes automatizados:** o projeto não tem nenhum hoje. Para a lógica pura (parser de comando, Levenshtein, hash do commit, montagem do texto do WhatsApp), fazer um `tests/terminal.test.html` que roda `console.assert` no navegador. Sem dependência.

## 8. Decisões abertas (preciso das suas respostas)

1. **Texto do `/linkedin`:** o resumo da 4.4 está bom ou você quer escrever o seu?
2. **Campo "Status" do `/info`:** posso mostrar "disponível para vagas"? E o modelo "presencial em Salvador ou remoto", tirado do "Sobre", está certo? Aceita híbrido?
3. **Número do WhatsApp:** o site usa `5531996588742` (DDD 31, MG). Continua esse?
4. **Conquistas:** quer o troféu visível na nav, ou prefere que as conquistas sejam totalmente escondidas até a primeira aparecer?
5. **Escopo:** fazer só as fases 1–2 (os seus comandos) primeiro e publicar, ou tudo de uma vez?
