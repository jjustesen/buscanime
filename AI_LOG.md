# Uso de IA

Este arquivo registra como a IA foi usada neste projeto: as ferramentas, como o
trabalho foi organizado e o que foi verificado, corrigido ou rejeitado. Ele é
atualizado ao fim de cada etapa.

## Resumo

- **Eu decidi; a IA propôs, executou e revisou.** Escolhi a base (Vite, CSS
  Modules), exigi JSDoc em todo tipo e Storybook para os componentes, decidi manter
  as cores do Figma e quando mesclar e publicar. A IA propôs alternativas com
  trade-offs, escreveu o plano e o código, e revisou o próprio trabalho.
- **Cada task passou por três agentes:** um implementa e dois revisam sem ter visto o
  código ser escrito (aderência ao plano e qualidade). As revisões acharam bugs reais
  nas Tasks 3, 4 e 5, cada um reproduzido por um teste que falhava antes da correção.
- **A IA errou, e os erros estão registrados:** uma premissa errada sobre a API
  (`format: null`), um `srcset` inútil no plano, um comando de shell que apagou o
  `node_modules`, testes que não testavam o que diziam. Todos foram pegos por
  revisão, teste ou conferência no navegador.
- **O que mais pegou erro:** abrir a página no navegador com a API real. O bug que
  escondia as notas passava em todos os testes, porque o mock repetia a premissa
  errada.

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
  Isso revelou o limite atual de **30 pedidos por minuto** (a documentação fala em
  90). A IA também concluiu que filtros nulos são ignorados, o que estava errado para
  o formato (ver a seção das Tasks 4 e 5). O plano passou a incluir cache de
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

### Tasks 4 e 5: estado na URL e página

- **Testes que provam que pegam o erro.** Nas duas tasks, os subagentes quebraram o
  código de propósito (tirar a proteção contra entrada repetida no histórico, tirar o
  `focus()` depois do "Ver mais", tirar a sincronia da busca) e confirmaram que os
  testes falham. Num desses casos, o próprio subagente descobriu que um teste de foco
  passava mesmo com o foco errado, e corrigiu o teste.
- **Uma afirmação da IA checada e rejeitada.** O subagente da Task 5 disse que só 1
  de 24 animes "em alta" tinha nota na API real, o que contrariaria o Figma (nota em
  todo card). Antes de levar isso a mim como decisão, o agente principal consultou a
  API: 11 de 12 animes da primeira página têm nota. A ordem "em alta" foi mantida.
  (Depois se viu que o subagente estava certo sobre a página; ver o último item.)
- **Mudança de plano justificada:** o plano previa remontar a barra de busca com
  `key`; o subagente viu no navegador que isso tirava o foco do campo ao apertar
  Enter, e usou o padrão do React de ajustar o estado durante o render.
- **A revisão de aderência ao plano achou uma lacuna:** nenhum teste da página
  conferia a cor da nota de ponta a ponta, um dos três requisitos do enunciado.
  Entrou um teste com notas baixa, média e alta vindas da API simulada.
- **A revisão de qualidade achou três bugs reais, reproduzidos com testes:**
  - **Foco no lugar errado:** trocar de filtro enquanto o "Ver mais" carregava podia
    jogar o foco para um card de outra lista. O foco agora é controlado só pela
    página e só se move se o filtro ainda for o mesmo.
  - **Foco perdido no "Ver mais":** com `disabled`, o navegador tirava o foco do
    botão enquanto carregava; se o pedido falhasse, o foco ia para o início da
    página. Isso não aparece no jsdom, só no navegador de verdade, então o teste
    roda numa story no Chromium.
  - **Mensagem de erro errada:** falhar ao atualizar uma lista já carregada mostrava
    "Clique em Ver mais", sem o botão na tela.
  - Também: o hook passou a devolver só o que a página usa (antes repassava o objeto
    inteiro do TanStack, o que re-renderizava a página à toa), e o app e os testes
    passaram a usar a mesma configuração do TanStack Query.
- **O que não segui:** a revisão sugeriu trocar os botões de formato por um grupo de
  rádio. Mantive os botões, porque é o que o Figma mostra, e registrei no
  `DECISIONS.md`.
- **Um bug que só apareceu com a API real.** Ao abrir a página no navegador, nenhum
  card tinha nota. O agente principal comparou pedidos direto na AniList e achou a
  causa: `format: null` não é ignorado, como a IA tinha concluído no começo; ele
  filtra animes sem formato definido (anúncios que ainda não estrearam, sem nota).
  Os testes não pegavam porque o mock tratava `null` como "todos". A correção: a
  chave `format` só é enviada quando há filtro, o teste do pedido passou a exigir
  isso (falhou antes da correção) e o mock passou a imitar a AniList de verdade.
  Isso também explica a afirmação "só 1 de 24 tem nota" do subagente da Task 5, que
  eu tinha rejeitado: ele olhou a página, eu olhei a API sem o `format: null`. Os dois
  viram coisas reais, e só comparar os pedidos mostrou a diferença.

### Task 6: telas menores, acessibilidade e desempenho

- **Medir antes de otimizar.** O subagente mediu um "Ver mais" com o Profiler do React
  no Chromium real (~11 ms), testou o `memo` só para comparar (~5 ms), desfez, e não
  adicionou porque ficou abaixo do limite combinado. O código de medição não foi
  commitado.
- **A revisão corrigiu a interpretação da medição**, não o número: o build de
  desenvolvimento com StrictMode exagera o custo, e a métrica que importa para um
  clique é o INP, não 16 ms. Os dois pontos foram para o `DECISIONS.md`.
- **Uma decisão do plano revertida pela revisão:** o plano (escrito pela IA) forçava
  4 colunas de 317 px a 1366 px. O subagente não fez isso, e o revisor calculou por
  quê: com a barra de rolagem do Windows, abriria 15 px de rolagem lateral.
- **O que a revisão pegou, e foi corrigido:**
  - Uma regra global de movimento reduzido com `!important` em tudo virou uma
    transição que só existe para quem não pediu menos movimento.
  - Uma linha de CSS que não fazia nada (`flex-shrink: 0` no botão) e dois
    comentários que ficaram desatualizados com a grade fluida.
  - Uma busca longa sem espaço (uma URL colada) abria rolagem lateral no celular.
- **Conferência visual:** prints em 1366, 1024, 768, 375 e 320 px, sem rolagem lateral
  em nenhuma largura, e o contorno de foco visível no card focado depois do "Ver mais".
- **Processo:** como a task mudou só CSS (2 commits), juntei as revisões de aderência
  ao plano e de qualidade numa só.
- **O que não segui:** nada da revisão foi rejeitado nesta task.

### Task 7: publicação e documentação

- **Mesclagem e publicação.** Com o meu OK, os PRs 1 a 5 entraram no `main` com
  commits de merge (sem squash), para o histórico real ficar visível. Eu conectei o
  repositório na Vercel; a IA não cria conta nem faz login.
- **Lighthouse na versão publicada**, rodado pela IA com o Chromium do Playwright. Os
  números e o que tirou pontos estão no `DECISIONS.md`. A partir deles, a IA achou
  duas correções baratas: o ícone da aba (um 404 no console) e o `preconnect` para a
  API e para o servidor das capas (o LCP no celular esperava 1,7 s até a capa
  começar a baixar).
- **Conferência manual:** app e Storybook publicados abertos no navegador, com dados
  reais.
- **Um problema de conta, resolvido por mim:** o primeiro repositório foi criado pela
  IA na conta errada do GitHub (a que estava ativa no `gh`). Apaguei e pedi para
  recriar na conta certa. A lição: confirmar a conta antes de qualquer ação que publica.
- **Medição depois da correção, com o resultado que deu.** Depois de publicar o ícone
  e o `preconnect`, a IA rodou o Lighthouse de novo (3 vezes no mobile). O ícone
  levou "boas práticas" a 100; o `preconnect` não mudou o LCP. O `DECISIONS.md`
  registra as duas coisas, em vez de só a que deu certo.
