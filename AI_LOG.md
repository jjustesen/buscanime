# Uso de IA

Este arquivo registra como a IA foi usada neste projeto: as ferramentas, como o
trabalho foi organizado e o que foi verificado, corrigido ou rejeitado. Ele é
atualizado ao fim de cada etapa.

## Ferramentas

- **Claude Code** (app desktop), com o modelo Claude Opus, como agente principal.
  Ele conduz o planejamento, divide o trabalho e revisa.
- **Subagentes do Claude Code**: um subagente novo implementa cada task do plano, e
  outros revisam o resultado sem ter visto o código sendo escrito.
- **agent-kit**: um conjunto de regras (`AGENTS.md`) e skills (`.claude/skills/`) que
  define o fluxo: brainstorm, design, plano, implementação task a task, revisão,
  verificação e PR. Está no repositório porque é o contexto que a IA recebeu.
- **Figma MCP**: leitura das cores, fontes e medidas exatas do design.
- **Navegador embutido do Claude**: primeira leitura do Figma, antes de o MCP ter
  acesso.

## Como o trabalho foi organizado

1. **Configuração do agent-kit só no projeto.** O `setup.sh` do kit cria links na
   configuração global (`~/.claude`) e vale para todos os projetos. Optei por copiar
   os arquivos para dentro do repositório: o enunciado pede que o arquivo de
   instruções esteja no repositório, e links simbólicos são frágeis no Windows.
2. **Brainstorm antes do código.** Discuti com a IA a arquitetura, as bibliotecas, a
   estrutura de pastas, desempenho e testes. Cada escolha teve alternativas e
   trade-offs. Escolhi Vite em vez de Next e CSS Modules em vez de Tailwind
   (motivos no `DECISIONS.md`).
3. **Design e plano escritos** (`docs/plans/`), com o plano dividido em 6 PRs
   empilhados.
4. **Convenções antes do código** (`docs/CONVENTIONS.md`). Pedi regras explícitas
   para evitar que cada task saísse de um jeito. Acrescentei duas exigências minhas:
   JSDoc em todo tipo e prop, e Storybook para testar os componentes. Sempre que
   possível, a regra virou regra de lint, para o CI cobrar em vez de depender de
   memória.
5. **Implementação por task**, cada uma num branch e num PR, com revisão por
   subagente antes do commit final.

## O que foi verificado, corrigido ou rejeitado

### Antes do código

- **Figma sem acesso pelo MCP.** O MCP do Figma exige permissão de edição. A IA
  primeiro leu o design por prints no navegador. Depois duplicei o arquivo para a
  minha conta e o MCP passou a ler os valores exatos, salvos em
  `docs/figma/spec.md` para não depender do Figma de novo.
- **Divergência no Figma.** O card com nota 80% está verde no Figma, mas o enunciado
  diz "de 50 a 80, amarelo". Os outros 11 cards seguem o enunciado. Decidi seguir o
  enunciado.
- **Contraste de cor.** A IA calculou o contraste das cores do Figma pela WCAG: o
  texto das notas sobre amarelo fica em ~1,4:1 e o "Ver mais" em ~1,7:1 (o mínimo
  para texto grande é 3:1). Ela recomendou escurecer o texto. **Rejeitei** a
  recomendação e mantive o Figma, porque o enunciado manda reproduzi-lo; o problema
  ficou registrado no `DECISIONS.md`.
- **API testada antes de planejar.** A IA rodou a query real na AniList com `curl`.
  Isso confirmou que filtros nulos são ignorados e revelou o limite atual de **30
  pedidos por minuto** (a documentação fala em 90). O plano passou a incluir cache de
  5 minutos e nova tentativa no erro 429.
- **Repetidos no "Ver mais".** A IA notou que, com a ordem "em alta", a lista muda
  entre páginas e o mesmo anime pode voltar. O plano remove repetidos pelo `id`.
- **Hook do agent-kit no Windows.** Os testes do hook do kit falharam (22 erros)
  porque o script chama `python3`, que no Windows é só um atalho da Microsoft Store.
  O hook do projeto passou a chamar `python` direto e foi testado à mão.

### Task 1: base do projeto

- **Quem fez o quê.** Um subagente implementou a task a partir do plano. Outros dois,
  sem ter visto o código sendo escrito, revisaram: um conferiu se o plano foi
  seguido, o outro avaliou a qualidade. Um quarto subagente aplicou as correções.
- **O lint foi testado, não presumido.** O implementador e o revisor quebraram de
  propósito cada regra das convenções (`export default`, prop sem JSDoc, import
  proibido entre pastas, `!`) e confirmaram que o ESLint falha em cada caso.
- **O axe foi testado.** Tirar o fundo roxo da story do logo fez o teste falhar por
  contraste, o que prova que acessibilidade quebra o teste de verdade.
- **Versões ajustadas à realidade.** O plano previa as versões mais novas, mas
  typescript-eslint ainda não aceita TypeScript 7, jsx-a11y não aceita ESLint 10 e
  eslint-plugin-jsdoc 65 exige um Node mais novo que o instalado. O implementador
  fixou versões compatíveis em vez de forçar a instalação.
- **O que a revisão de qualidade pegou, e foi corrigido:**
  - **O plano brigava com o lint.** Três trechos das tasks seguintes teriam falhado
    no lint: a pasta `api/` importando um tipo da feature, propriedades sem JSDoc
    dentro de assinaturas e um `setState` dentro de `useEffect`. Corrigi o plano
    antes de chegar lá: `api/` passou a ser dona do tipo `Format`, os parâmetros
    ganharam tipos com nome, e a busca usa `key` em vez de efeito.
  - **A regra de JSDoc podia ser burlada:** o `--fix` inseria `/** */` vazio.
    A correção automática foi desligada.
  - **Prettier instalado e nunca rodado:** agora roda no CI.
  - **`@size-limit/preset-app` baixava um segundo Chromium** para medir um tempo que
    nada usava. Trocado por `@size-limit/file`.
  - **Acessibilidade:** a altura fixa do header e do footer passou a `min-height`
    (zoom de texto). O reset global de listas saiu, porque o VoiceOver no Safari tira
    a semântica de lista; as listas vão usar `role="list"`. O texto em caixa alta
    passou a ser caixa normal com `text-transform`, para o leitor de tela não
    soletrar.
  - **O teste do App repetia o que as stories já testavam** e iria quebrar na Task 5.
    Agora ele confere só os três marcos da página (header, main, footer).
  - **Dependências instaladas antes da hora** (`msw`, `user-event`) saíram e voltam
    nas tasks que as usam.
  - **Um erro silencioso achado na correção:** o TypeScript ignora pastas que começam
    com ponto quando elas aparecem só pelo nome no `include`. Os arquivos de
    `.storybook/` nunca tinham passado pelo typecheck. Agora passam.
- **O que não segui:** nada da revisão foi rejeitado nesta task.
- **Histórico:** um commit intermediário de correção (`8fc64b5`) não passa no
  typecheck sozinho, porque a remoção de um arquivo entrou um commit antes da hora. O
  commit seguinte corrige. Deixei como está em vez de reescrever o histórico.
- **O primeiro CI falhou no GitHub**, e não localmente: o `package-lock.json` gerado
  no Windows (npm 11.6) não tinha dois pacotes que o `npm ci` do Linux exige
  (`@emnapi/core` e `@emnapi/runtime`). Regenerei o lockfile com o npm 11.21 e
  conferi com `npm ci --dry-run` nas duas versões antes de reenviar.

### Task 2: cliente da AniList

- **Teste antes do código.** O subagente escreveu os 16 testes do cliente contra uma
  função vazia, viu os 16 falharem pelo motivo esperado e só então implementou.
- **A API foi conferida de novo** com uma chamada real, para os mocks (MSW)
  devolverem exatamente o formato da AniList. Os testes passam pela conversão de
  verdade, sem mockar o `fetch`.
- **Nome de opção conferido no código da biblioteca.** O subagente usou
  `onUnhandledFrame` no msw, e não o `onUnhandledRequest` que eu conhecia. O revisor
  confirmou no código do msw 3 instalado que a opção mudou de nome e que um pedido
  sem simulação é recusado, em vez de sair para a internet.
- **O que a revisão de qualidade pegou, e foi corrigido:**
  - **Validação pela metade.** A resposta da API era checada por fora, depois
    convertida com um `as unknown as` e checada de novo por dentro. Três camadas para
    o mesmo problema, difíceis de explicar. Ficou um tipo que copia o schema da
    AniList (com o que ele permite ser nulo) e uma conversão só, na fronteira.
  - **Um teste não protegia a decisão que dizia proteger:** o teste do título
    reserva usava `null`, mas a decisão era sobre o romaji vazio (`''`). Agora testa
    os dois casos.
  - **Um comentário estava errado:** dizia que um pedido sem simulação falha o teste,
    mas o cliente trata a recusa como falha de rede. O comentário foi corrigido, e o
    erro original passou a ser guardado (`cause`) para facilitar a depuração.
  - **Resposta que não é JSON** (uma página de erro de proxy) não tinha teste. Agora
    tem.
  - Os mocks passaram a usar o tipo da resposta da AniList, para que renomear um
    campo da query quebre o typecheck em vez de passar em silêncio.
- **O que não segui:** nada da revisão foi rejeitado nesta task.

### Task 3: card do anime

- **O CI do PR2 quebrou pelo mesmo motivo do PR1** (lockfile do npm 11.6). Na segunda
  vez, a correção virou regra nas convenções: dependências se instalam com
  `npx npm@11.21.1` e se confere com `npm ci --dry-run` antes de enviar.
- **Um erro da própria IA.** Ao ler o log do CI, o agente principal escreveu um
  `grep` com crases entre aspas duplas. O shell executou o que estava entre as crases,
  um `npm ci` local, que apagou parte do `node_modules` e travou num arquivo preso
  por um `vite preview` esquecido por um subagente. Nada foi enviado. Encerrei o
  servidor, a IA reinstalou e conferiu que nada faltava, e a regra "nunca use crases
  dentro de aspas duplas" entrou nas convenções.
- **Medição contra o Figma.** O subagente mediu o card no Storybook gerado: 317 × 270,
  conteúdo a 28/23 px, etiquetas e selo nas posições do Figma.
- **O que a revisão de qualidade pegou, e foi corrigido:**
  - **`srcset` que não fazia nada.** O plano (escrito pela IA) previa duas capas
    (230 e 460 px). A revisão calculou que nenhum card fica com menos de 280 px, então
    o navegador sempre escolheria a de 460 px, e o `sizes` ainda estava errado para a
    grade fluida. Ficou uma capa só, e a de 230 px saiu da query.
  - **Um teste que falharia por acaso.** A story da capa quebrada procurava a imagem
    depois de ela já poder ter sumido. Agora espera a imagem sair da tela, sem
    depender do tempo de rede.
  - **Capa quebrada mais simples:** em vez de estado + atributo + regra de CSS, a
    imagem que falha deixa de ser renderizada.
  - **`z-index` vazando** para fora do card (atrapalharia um filtro fixo no topo).
    Resolvido com `isolation: isolate`.
  - **Acessibilidade:** altura mínima no card (zoom de texto não corta), e o
    `aria-hidden` dos esqueletos foi para a grade, onde de fato esconde a lista.
  - **O axe estava desligado no card inteiro** para o contraste. Agora ignora só o
    selo da nota e continua checando as etiquetas de gênero, que estão no limite
    (4,55:1).
- **O que não segui:** nada da revisão foi rejeitado nesta task.
- **Um teste que não testava nada, achado na correção.** Ao restringir a exceção do
  axe ao selo da nota, o subagente descobriu que as etiquetas de gênero nunca tinham
  sido checadas: o degradê do card (um `::after`) deixava o axe sem conseguir medir o
  texto, e ele marcava tudo como "incompleto", o que não falha o teste. Ele provou
  com uma etiqueta de cor ruim de propósito (a story passava) e corrigiu com a opção
  `ignorePseudo`. Agora a etiqueta ruim faz 8 de 9 stories falharem.
