# Decisões técnicas

Este arquivo registra as decisões, os trade-offs, o que entrou além do pedido e o que
ficou de fora. O design completo está em `docs/plans/2026-11-01-buscanime-design.md`
e as regras de código em `docs/CONVENTIONS.md`.

## Base e bibliotecas

| Tema         | Escolha                                      | Por quê                                                                                                                                          | O que se perde                                                                    |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Base         | Vite + React 19 + TypeScript strict          | Uma tela só, API pública chamada do navegador, sem necessidade de SEO. Menos conceitos (Server Components, cache do Next) e testes mais simples. | A primeira página não vem pronta do servidor. Cards esqueleto compensam a espera. |
| Estilo       | CSS Modules + variáveis CSS                  | Zero dependência. Os tokens do Figma viram variáveis com os mesmos nomes. JSX limpo.                                                             | Mais arquivos que no Tailwind e escrita um pouco mais lenta.                      |
| Dados        | TanStack Query                               | Cache, cancelamento de pedidos, estados de carregando/erro e paginação (`useInfiniteQuery`) sem reinventar.                                      | ~13 kB gzip a mais no bundle.                                                     |
| GraphQL      | `fetch` puro                                 | É uma query só. Apollo ou urql pesariam muito para isso.                                                                                         | Sem cache normalizado, que aqui não faz falta.                                    |
| Tipos da API | Escritos à mão, com JSDoc                    | Poucos campos.                                                                                                                                   | Podem divergir do schema. Com mais tempo: graphql-codegen.                        |
| Testes       | Vitest + Testing Library + MSW               | Testam o comportamento, sem depender da internet.                                                                                                | —                                                                                 |
| Componentes  | Storybook 10 + `addon-vitest` + `addon-a11y` | Cada estado visível e testado: renderização, interação e acessibilidade (axe). Publicado junto com o app.                                        | CI 1 a 2 minutos mais lento (instala o Chromium).                                 |

### Testes de componente são as stories

Os componentes de apresentação não têm `*.test.tsx` próprio. O teste deles é a
story: cada `*.stories.tsx` tem uma função `play` que renderiza o componente e
verifica o comportamento com as mesmas ferramentas da Testing Library
(`getByRole`, `userEvent`, `expect`). O `@storybook/addon-vitest` transforma cada
story em um teste do Vitest, que roda no `npm test` e no CI, com o axe checando
acessibilidade em cada uma.

- **Por que assim:** cada estado do componente é escrito uma vez e serve para duas
  coisas, a documentação visual (o Storybook publicado) e o teste. Com `*.test.tsx`
  separados, o mesmo comportamento seria testado em dois lugares.
- **Por que no Chromium e não no jsdom:** o navegador real pegou dois problemas que o
  jsdom esconde: o foco que sumia do "Ver mais" com `disabled` e o ícone de imagem
  quebrada no card.
- **O custo:** o `npm run test:unit` (rápido, jsdom) não roda as stories; para elas é
  o `npm test`. Funções puras, hooks, o cliente da API e a página inteira (com a API
  simulada) continuam em `*.test.ts(x)`.
- **Alternativa considerada:** rodar as mesmas stories também no jsdom com
  `composeStories`, gerando arquivos `*.test.tsx` sem reescrever testes. Não fiz:
  é uma camada a mais para explicar, e os testes de foco teriam de ser pulados no
  jsdom.

## Ferramentas e versões

| O quê                        | Escolha                                                                    | Por quê                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                   | 6.0, não 7                                                                 | O typescript-eslint ainda só aceita TypeScript abaixo de 6.1.                                                               |
| ESLint                       | 9, não 10                                                                  | O eslint-plugin-jsx-a11y ainda só aceita até o ESLint 9.                                                                    |
| eslint-plugin-jsdoc          | 63, não 65                                                                 | A versão 65 exige Node 24.15, e o projeto roda no 24.11. A regra usada é a mesma.                                           |
| Setup do Storybook no Vitest | Sem `vitest.setup.ts`                                                      | O plugin do Storybook 10 já aplica as configurações do `preview.ts` nos testes.                                             |
| size-limit                   | `@size-limit/file`, medindo gzip                                           | O orçamento é de tamanho. O preset-app baixava um Chromium só para medir tempo de execução.                                 |
| Regras no lint               | Fronteiras de pasta, JSDoc em tipos e props, sem `export default`, sem `!` | Regra que o CI cobra não depende de memória. A correção automática do JSDoc fica desligada para não gerar comentário vazio. |
| Formatação                   | Prettier checado no CI                                                     | Evita diffs de formatação entre os PRs empilhados.                                                                          |

## Dados da AniList

- **`api/` é dona dos tipos que a API usa** (`Format`, `AnimePageRequest`) e a
  feature importa de lá. O `'ALL'` dos botões é da tela; o cliente recebe `null`.
- **Uma conversão só, na fronteira.** A resposta é tipada como o schema da AniList
  (com os campos que podem vir nulos) e convertida uma vez para `Anime`. Um corpo que
  não é JSON vira erro com o status HTTP.
- **Erros:** uma classe só (`AniListError`). Falha de rede, 429 e 5xx podem ser
  tentados de novo; os outros não. Cancelar um pedido (trocar o filtro no meio) não
  é erro.
- **Título:** romaji, como no Figma. Se vier vazio ou nulo, usa o `userPreferred`.
- **Mensagens de erro em português**, mas a tela mostra um texto fixo, não a
  mensagem da API.
- **msw 3:** a opção para recusar pedidos sem simulação agora se chama
  `onUnhandledFrame`.
- **Exportados só para os mocks:** `ANILIST_ENDPOINT`, `AnimePageVariables` e o tipo
  cru `AniListMedia`. Assim os mocks usam o mesmo endereço e o mesmo formato do
  cliente, e o typecheck pega uma mudança na query.

## Card

- **Uma capa só (460 px), sem `srcset`.** A AniList não redimensiona imagens; os
  tamanhos que ela tem são 100, 230 e 460 px de largura. O card mais estreito tem
  270 px (tela de 320 px), então a de 230 px nunca seria a escolhida pelo navegador.
- **Prioridade da imagem por uma prop só** (`priority: 'high' | 'eager' | 'lazy'`):
  os 4 primeiros cards carregam na hora, o primeiro com prioridade alta (é o maior
  elemento da primeira tela), o resto sob demanda. Uma prop evita combinações sem
  sentido, como "lazy" com prioridade alta. No celular esses 4 cards ocupam várias
  linhas, mas não vale ajustar: o Chrome já carrega imagens "lazy" a até 1250 px da
  tela, então o ganho seria só no Safari e pediria código para contar colunas.
- **Capa que falha some**, e fica a cor média da capa (`coverImage.color`) ou um cinza.
  Sem isso, o Chrome desenha o ícone de imagem quebrada no canto do card.
- **Degradê com cores literais** no CSS do card: não é variável do Figma e só existe
  ali.
- **Altura mínima de 270 px**, não fixa: com zoom só de texto, o conteúdo não é
  cortado.

## Página

- **Busca no envio, não a cada tecla.** O Figma tem o botão "Buscar", e a AniList
  limita a 30 pedidos por minuto. O texto digitado é estado local da barra; só vai
  para a URL ao enviar (botão ou Enter).
- **A barra de busca sincroniza com a URL durante o render**, sem `useEffect` e sem
  remontar o campo (padrão da documentação do React para ajustar estado quando uma
  prop muda). O plano previa remontar com `key`, mas isso tirava o foco do campo ao
  apertar Enter.
- **Botões de formato com `aria-pressed`**, não um grupo de rádio. O Figma mostra
  botões; um grupo de rádio pede navegação por setas, mais código para pouco ganho.
- **"Ver mais":**
  - O botão continua focável enquanto carrega (`aria-disabled`, não `disabled`).
    Com `disabled`, o navegador joga o foco para o início da página.
  - Depois de carregar, o foco vai para o primeiro card novo. O foco só é movido se
    o filtro ainda for o mesmo de quando o botão foi clicado.
  - Se falhar, os cards ficam e o próprio botão serve para tentar de novo.
- **Erros diferentes, mensagens diferentes:** erro sem cards mostra a mensagem com
  "Tentar de novo"; erro ao carregar mais fala do "Ver mais"; erro ao atualizar uma
  lista que já está na tela mantém os cards e diz que não deu para atualizar.
- **Repetidos removidos pelo `id`:** com a ordem "em alta", um anime pode mudar de
  página entre um pedido e outro.
- **Ao trocar de filtro, os cards antigos ficam esmaecidos** (`aria-busy`) até os
  novos chegarem, em vez de piscar o esqueleto. O esmaecer tem uma transição de
  0,2 s (não está no Figma, que não tem esse estado), desligada para quem pede menos
  movimento ao sistema.

## Telas menores e desempenho

- **Grade fluida sem breakpoints:** `repeat(auto-fill, minmax(min(280px, 100%), 1fr))`
  com largura máxima de 1316 px. Dá 4 colunas de 317 px a 1366 px, como no Figma, e
  3, 2 e 1 coluna em telas menores. O `min()` deixa a coluna única caber em 320 px.
  - O plano previa forçar 4 × 317 px a partir de 1366 px. Não fiz: a largura da
    janela inclui a barra de rolagem, e com a barra clássica do Windows (15 px) isso
    abriria 15 px de rolagem lateral. Com essa barra, os cards ficam com ~313 px.
- **Filtros quebram linha** e a busca ocupa a largura toda em telas estreitas; o
  botão "Buscar" mantém os 86 px. Sem rolagem lateral até 320 px.
- **Sem link de "pular para o conteúdo":** o header é só o logo, a página tem o
  marco `main` e não há menu repetido; do topo até o primeiro card são 10 paradas de
  Tab (8 filtros, o campo e o botão).
- **Sem `React.memo`, porque a medição não pediu.** Com o Profiler do React no
  Chromium (build de desenvolvimento, com StrictMode), um "Ver mais" de 48 para 60
  cards levou ~11 ms (mediana de 7 rodadas); com `memo` no card, ~5 ms. O limite do
  plano era 16 ms, e a convenção só aceita `memo` com motivo medido.
  - O build de desenvolvimento com StrictMode exagera o custo; em produção deve ser
    bem menor.
  - Um celular fraco é ~4 vezes mais lento, o que pode passar de 16 ms. Mesmo assim,
    o que importa para o clique é o INP (bom até 200 ms), muito acima disso.
- **Medição com muitos cards (build de produção).** Para conferir as ressalvas acima,
  medi o tempo do clique em "Ver mais" até a tela atualizar (Event Timing do
  Chromium, a base do INP) com 48 a 960 cards na tela, CPU normal e 4 vezes mais
  lenta (como o Lighthouse simula um celular), com e sem `memo` no card. Página
  temporária com os dados falsos dos testes, sem rede; mediana de 3 rodadas de 5
  cliques.

  | Cards na tela | CPU normal | CPU 4× | CPU 4×, com `memo` |
  | ------------- | ---------- | ------ | ------------------ |
  | 48            | 24 ms      | 40 ms  | 40 ms              |
  | 120           | 24 ms      | 48 ms  | 40 ms              |
  | 240           | 24 ms      | 64 ms  | 48 ms              |
  | 480           | 24 ms      | 104 ms | 88 ms              |
  | 960           | 32 ms      | 216 ms | 160 ms             |
  - Com a CPU normal, 24 ms é o piso da medição (próximo quadro e arredondamento do
    Chromium), não custo dos cards.
  - De 120 a 240 cards (10 a 20 cliques em "Ver mais"), o pior caso é 64 ms num
    celular lento, um terço do limite. O `memo` economiza 8 a 16 ms ali: não vale.
  - Com 960 cards no celular lento, o clique passa de 200 ms. O `memo` corta a parte
    do React (de 61 para 13 ms), mas o clique ainda leva 160 ms, porque o resto é o
    navegador calculando o layout e desenhando quase mil cards. Isso só a
    virtualização (desenhar só os cards visíveis) resolveria.
  - **Decisão: sem `memo` e sem virtualização.** Se um dia a lista crescer a esse
    ponto, a ordem é `memo` no card, depois medir `content-visibility: auto` nos
    itens, e só então virtualizar.

- **Leitor de tela:** uma região `aria-live` anuncia carregando, vazio, erro e
  "N animes de <formato> carregados". O contexto no texto garante que trocar entre
  duas listas de 12 itens também seja anunciado.
- **Exceções do axe:** além do selo da nota, o contraste fica desligado nas stories
  do "Ver mais" (branco sobre amarelo do Figma, ~1,7:1) e da grade esmaecida
  (conteúdo antigo com opacidade 0,5, marcado como `aria-busy`).
- **Uma configuração do TanStack Query** (`createQueryClient`) para o app e para os
  testes, que só desligam as novas tentativas. A regra de nova tentativa
  (`shouldRetry`) tem teste próprio.

## Publicação e Lighthouse

- **Vercel**, a partir do `main`. O mesmo build gera o app (`/`) e o Storybook
  (`/storybook/`).
- **Lighthouse na versão publicada** (Lighthouse 12, Chromium sem interface), antes e
  depois do ícone da aba e do `preconnect`. Mobile depois: mediana de 3 execuções.

  | Perfil          | Desempenho | Acessibilidade | Boas práticas | SEO | LCP   | CLS   | TBT  |
  | --------------- | ---------- | -------------- | ------------- | --- | ----- | ----- | ---- |
  | Mobile, antes   | 87         | 96             | 96            | 100 | 4,0 s | 0,001 | 0 ms |
  | Mobile, depois  | 87         | 96             | 100           | 100 | 4,1 s | 0,001 | 0 ms |
  | Desktop, antes  | 91         | 96             | 96            | 100 | 2,0 s | 0     | 0 ms |
  | Desktop, depois | 87         | 96             | 100           | 100 | 2,4 s | 0     | 0 ms |
  - **Acessibilidade 96:** a única falha é o contraste do "Ver mais" (branco sobre o
    amarelo do Figma), mantido por decisão (ver "Fidelidade ao Figma").
  - **Boas práticas 96 → 100:** era um 404 no console, do ícone da aba que não
    existia.
  - **LCP de ~4 s no celular:** o maior elemento é a capa do primeiro card, e ela só
    é descoberta depois da resposta da API. Quase metade do tempo (1,7 s) era a
    espera até a capa começar a baixar. O `preconnect` para a API e para o servidor
    das capas **não mudou o LCP de forma mensurável** (4,0–4,1 s nas três execuções),
    e a diferença no desktop está dentro da variação entre execuções. Deixei o
    `preconnect` porque não custa nada, mas o gargalo é a ordem: HTML, JavaScript,
    API e só então a capa. Resolver pede a primeira página pronta no HTML
    (renderização no servidor ou no build), que é justamente o ganho do Next.js que
    troquei por simplicidade.

## Estado

- **Filtro e busca na URL.** Recarregar mantém o filtro, o link pode ser
  compartilhado e o botão voltar funciona. Um hook pequeno (`useListParams`) evita
  incluir um roteador para uma tela só.
- **Dados da API só no cache do TanStack Query**, nunca copiados para `useState`.
- **O texto digitado é estado local** da barra de busca e só vai para a URL ao enviar.
  Isso segue o botão "Buscar" do Figma e evita re-renderizar a grade a cada tecla.

## Fidelidade ao Figma

- **Nota 80 em amarelo.** O Figma pinta 80% de verde, mas o enunciado diz "de 50 a
  80, amarelo", e os outros 11 cards do Figma seguem o enunciado. A regra fica numa
  função só (`scoreTone`).
- **Contraste mantido como no Figma.** Medido pela WCAG:

  | Elemento                              | Contraste | Mínimo AA |
  | ------------------------------------- | --------- | --------- |
  | Texto da nota sobre amarelo `#FFB800` | ~1,4:1    | 3:1       |
  | Texto da nota sobre verde `#01ADA6`   | ~2,2:1    | 3:1       |
  | "Ver mais" branco sobre amarelo       | ~1,7:1    | 3:1       |
  | Texto de exemplo da busca `#A7B0BE`   | ~2,2:1    | 4,5:1     |

  Mantive as cores porque o enunciado manda reproduzir o Figma. A correção sugerida é
  usar texto escuro sobre amarelo e verde, sem mexer nos fundos. Nas stories, a regra
  `color-contrast` do axe fica desligada só para o selo da nota. No card, ela continua
  valendo para as etiquetas de gênero, com a opção `ignorePseudo`: sem ela, o degradê
  do card (um `::after`) deixava o axe sem conseguir medir nenhum texto, e as
  etiquetas nunca eram checadas de verdade. O título sobre a capa continua sem
  checagem automática, porque o axe não mede texto sobre imagem.

- **Ordem padrão "em alta" (`TRENDING_DESC`)**, porque os animes do Figma são os que
  estavam em alta quando o design foi feito. Com busca, a ordem é por relevância
  (`SEARCH_MATCH`).

## Além do pedido

- **Acessibilidade de base:** marcos de página (header, main, footer), um `h1`, foco
  visível, `lang="pt-BR"`, altura mínima em vez de fixa nas faixas (zoom de texto),
  caixa alta feita por CSS (o leitor de tela não soletra) e listas com `role="list"`.
- **Axe em todas as stories:** uma violação de acessibilidade falha o teste.
- **Convenções escritas e checadas pelo lint** (`docs/CONVENTIONS.md`).
- **Storybook publicado** com todos os estados que o Figma não mostra.
- **Estado na URL**, com o botão voltar funcionando.
- **Layout do celular ao desktop**, sem rolagem lateral até 320 px.
- **Foco e leitor de tela:** o foco vai para o primeiro card novo depois do "Ver
  mais", e uma região `aria-live` anuncia carregando, vazio, erro e a contagem.
- **Erros tratados por tipo**, com nova tentativa automática para falha de rede, 429
  e 5xx.
- **CI no GitHub Actions:** lint, Prettier, typecheck, testes (jsdom e Chromium),
  build e limite de tamanho do JavaScript (100 kB gzip; hoje ~82 kB).

## Página de detalhes

Pedida depois do desafio, sem tela no Figma. O layout é simples e usa só os tokens e
componentes que já existem (`ScoreBadge`, e o `GenreList`, tirado do card para servir às
duas telas).

- **Rota feita à mão, sem biblioteca.** O app tem duas páginas (`/` e `/anime/<id>`).
  `useRoute` segue o mesmo desenho do `useListParams` (`pushState` mais `popstate`).
  Uma biblioteca de rotas custaria 15 a 20 kB gzip, e o limite é 100 kB (hoje 83).
- **Fica na feature `anime-list`**, por pedido do dono, e não numa feature nova. Assim a
  página usa o `ScoreBadge` sem quebrar a regra de uma feature não importar de outra.
- **"Ver detalhes" é um link (`<a href>`), não um botão**, porque muda de página: abre em
  nova aba com Ctrl ou botão do meio, e o leitor de tela anuncia "link". O nome inclui o
  título, para os 12 links da lista serem distintos. O fundo é roxo sólido: o fim do
  degradê do card é claro, e branco sobre a capa não passa no contraste.
- **Consulta por ID** (`ANIME_DETAIL_QUERY`). A sinopse chega com `<br>` e `<i>`;
  `cleanDescription` troca quebras por linha e tira as outras tags. O texto vai para a
  tela como texto (o React escapa), nunca como HTML.
- **Gêneros:** a página mostra todos; o card continua com 3.
- **Estados mínimos, de propósito:** "Carregando..." e uma mensagem de erro. Não há
  tela própria para ID inexistente, sem sinopse longa ou capa quebrada além do
  básico. O erro 404 da AniList cai na mesma mensagem.
- **Vercel:** `vercel.json` manda `/anime/*` para o `index.html`, senão abrir ou
  recarregar um link de detalhes dá 404.
- **"Voltar para a lista" leva à raiz**, sem filtro. O botão Voltar do navegador
  mantém o filtro e a busca, porque eles moram na URL.

## Fora do escopo

- Modo escuro.
- Busca enquanto digita (o Figma tem botão "Buscar").
- Testes E2E com Playwright.

## O que faria com mais tempo

- graphql-codegen para gerar os tipos a partir do schema da AniList.
- Testes E2E com Playwright no deploy de preview.
- Lighthouse CI em cada PR.
- Respeitar o `Retry-After` da AniList no erro 429. Hoje a nova tentativa usa o
  intervalo padrão (1 s e 2 s), que provavelmente bate no mesmo limite.
- Pré-renderizar a primeira página no build ou no servidor, para o LCP do celular
  não depender da resposta da API.
- Corrigir o contraste do Figma (texto escuro sobre amarelo e verde), se o design
  permitir.
- Uma story para cada largura de tela (filtros quebrados, uma coluna), para o axe e
  a revisão verem os estados responsivos.
