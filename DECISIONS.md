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
  - O custo cresce com o número de cards na tela.
  - Se o Lighthouse mobile apontar INP ruim, o `memo` no card é o primeiro passo.
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
- **Lighthouse na versão publicada** (Lighthouse 12, Chromium sem interface, antes
  do ícone da aba e do `preconnect`):

  | Perfil  | Desempenho | Acessibilidade | Boas práticas | SEO | LCP   | CLS   | TBT  |
  | ------- | ---------- | -------------- | ------------- | --- | ----- | ----- | ---- |
  | Mobile  | 87         | 96             | 96            | 100 | 4,0 s | 0,001 | 0 ms |
  | Desktop | 91         | 96             | 96            | 100 | 2,0 s | 0     | 0 ms |
  - **Acessibilidade 96:** a única falha é o contraste do "Ver mais" (branco sobre o
    amarelo do Figma), mantido por decisão (ver "Fidelidade ao Figma").
  - **Boas práticas 96:** um 404 no console, do ícone da aba que não existia. Já
    corrigido.
  - **LCP de 4 s no celular:** o maior elemento é a capa do primeiro card, e ela só é
    descoberta depois da resposta da API. Quase metade do tempo (1,7 s) era a espera
    até a capa começar a baixar. O `index.html` agora abre a conexão com a API e com
    o servidor das capas (`preconnect`) enquanto o JavaScript carrega. Resolver de
    vez pede a primeira página pronta no HTML (renderização no servidor ou no build),
    que é justamente o ganho do Next.js que troquei por simplicidade.

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

## Fora do escopo

- Página de detalhes do anime.
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
- Medir o "Ver mais" com a CPU limitada (como um celular) e decidir de novo sobre o
  `React.memo` no card.
- Corrigir o contraste do Figma (texto escuro sobre amarelo e verde), se o design
  permitir.
- Uma story para cada largura de tela (filtros quebrados, uma coluna), para o axe e
  a revisão verem os estados responsivos.
