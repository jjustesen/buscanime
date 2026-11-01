# BuscAnime: design

Data: 2026-11-01. Enunciado em `FRONTEND.md`. Medidas e cores do Figma em
`docs/figma/spec.md`.

## O que vamos construir

Uma página que lista animes da API AniList, fiel ao Figma. A pessoa filtra por formato,
busca por texto e carrega mais resultados com "Ver mais". Cada card mostra capa, título,
até 3 gêneros e a nota (`averageScore`) com cor por faixa.

## Decisões tomadas

| Tema | Decisão | Motivo curto |
|---|---|---|
| Base | Vite + React 19 + TypeScript strict | Uma tela, API pública chamada do navegador, sem SEO. Menos conceitos para defender. |
| Estilo | CSS Modules + variáveis CSS (`tokens.css`) | Zero dependência. Os tokens do Figma viram variáveis com o mesmo nome. |
| Dados | TanStack Query (`useInfiniteQuery`) + `fetch` | Cache, cancelamento, estados de carregando e erro, paginação do "Ver mais". |
| Tipos da API | Escritos à mão | Uma query, poucos campos. graphql-codegen fica para "com mais tempo". |
| Estado | Filtro e busca na URL; texto digitado é estado local | Link compartilhável, voltar funciona, digitar não re-renderiza a grade. |
| Testes | Vitest + Testing Library + MSW | Testa como a pessoa usa a tela, sem depender da internet. |
| Componentes | Storybook 10 + `addon-vitest` + `addon-a11y`, publicado em `/storybook/` | Cada estado do componente visível e testado (render, interação e axe). |
| Convenções | `docs/CONVENTIONS.md`, checadas pelo ESLint quando possível | Fronteiras de pasta, JSDoc em todo tipo, exports nomeados, idioma. |
| Desempenho | `size-limit` no CI e Lighthouse na versão publicada | Prova com números, não com "deve estar rápido". |
| Publicação | Vercel | Funciona com Vite sem configuração. |
| Fonte | `@fontsource/mulish` (400, 600, 700, latin) | Fonte dentro do projeto, sem Google Fonts. |

## Decisões sobre o Figma

1. **Seguir o Figma nas cores**, mesmo com contraste baixo nas notas e no "Ver mais".
   O problema e os números ficam registrados no `DECISIONS.md`, com a correção sugerida
   (texto escuro sobre amarelo e verde).
2. **Nota 80 fica amarela**, como manda o enunciado ("de 50 a 80, amarelo"). O card de
   80% verde no Figma contradiz a regra escrita, e os outros 11 cards seguem a regra.
   A regra fica numa função só (`scoreTone`), então mudar é uma linha.
3. **Ordem padrão: `TRENDING_DESC`.** Os animes do Figma são os que estavam em alta
   quando o design foi feito, não os mais populares de todos os tempos. Com busca, a
   ordem passa a ser `SEARCH_MATCH`.
4. **Título em romaji** (`title.romaji`), como no Figma. Se vier vazio, usa
   `title.userPreferred`.

## Modelo de domínio

```
Format: TV | TV_SHORT | MOVIE | SPECIAL | OVA | ONA | MUSIC
FormatFilter: "ALL" ou um Format
ListParams: format (FormatFilter), search (texto, pode ser vazio)
Anime: id, title, coverImage (url média, url grande, cor média), genres (lista), averageScore (0 a 100 ou nulo)
ScoreTone: low (< 50) | mid (50 a 80) | high (> 80)   (nota nula: sem selo)
AnimePage: animes, hasNextPage, page
```

Botões do Figma para formatos da AniList:

| Botão | Valor |
|---|---|
| All Formats | sem filtro |
| TV Show | `TV` |
| Movie | `MOVIE` |
| TV Short | `TV_SHORT` |
| Special | `SPECIAL` |
| OVA | `OVA` |
| ONA | `ONA` |
| Music | `MUSIC` |

## Fluxo de dados

```
URL (?format=MOVIE&search=naruto)
  -> useListParams() lê e escreve a URL (history.pushState + evento popstate)
  -> useAnimeList(params) = useInfiniteQuery(["anime", format, search])
       -> fetchAnimePage({ page, perPage: 12, format, search, sort })
       -> POST https://graphql.anilist.co
  -> AnimeListPage desenha: FormatFilter, SearchBar, AnimeGrid, LoadMoreButton
"Ver mais" -> fetchNextPage() -> página seguinte, somada às anteriores
```

- `placeholderData: keepPreviousData`: ao trocar o filtro, os cards antigos ficam
  (esmaecidos) até os novos chegarem.
- `staleTime: 5 min`: voltar a um filtro já visto não refaz o pedido.
- Tentar de novo: até 2 vezes, só em erro de rede, 5xx ou 429. A AniList hoje limita
  a 30 pedidos por minuto (header `X-RateLimit-Limit: 30`).
- O pedido é cancelado (`AbortSignal`) quando a chave muda.

## Componentes

```
App
├── Header                    logo em texto
├── AnimeListPage
│   ├── FormatFilter          8 botões com aria-pressed
│   ├── SearchBar             <form role="search">, input com label, botão Buscar
│   ├── ResultsStatus         região aria-live com a contagem ou o estado
│   ├── AnimeGrid             <ul> de cards, ou CardSkeleton x12, EmptyState, ErrorState
│   │   └── AnimeCard         capa, degradê, título (3 linhas), GenreChips, ScoreBadge
│   └── LoadMoreButton        some quando hasNextPage é falso
└── Footer
```

## Estados fora do Figma

- **Carregando a primeira página:** 12 cards esqueleto do tamanho real.
- **Carregando "Ver mais":** botão desabilitado com "Carregando...".
- **Trocando filtro:** cards antigos esmaecidos (`aria-busy`).
- **Sem resultado:** "Nenhum anime encontrado para "<busca>"." e botão para limpar.
- **Erro:** mensagem e botão "Tentar de novo".
- **Nota nula:** o selo não aparece. Mostrar "–" seria inventar um dado.
- **Imagem que falha:** fica a cor média da capa (`coverImage.color`) como fundo.
- **Telas menores:** a grade usa `repeat(auto-fill, minmax(280px, 1fr))` com máximo de
  1316 px. Os filtros quebram linha. A busca ocupa a largura toda.

## Acessibilidade

- Filtros: `<button aria-pressed>` dentro de um grupo com rótulo "Filtrar por formato".
- Busca: `<label>` visualmente oculto, Enter envia.
- Cards: `<ul>/<li>`, título em `<h2>`, imagem com `alt=""` (o título já está no card),
  nota com texto para leitor de tela ("Nota média: 80%").
- Depois do "Ver mais", o foco vai para o primeiro card novo.
- Foco visível em todos os controles.

## Desempenho

- Imagens: `srcset` com `large` (230w) e `extraLarge` (460w), `sizes` pela coluna.
  A primeira linha (4 cards) usa `loading="eager"` e o primeiro card
  `fetchpriority="high"`. O resto usa `loading="lazy"`. O card tem altura fixa, então a
  tela não pula.
- Sem `memo` por padrão. Medir com o React Profiler depois de vários "Ver mais" e
  aplicar `React.memo` no `AnimeCard` só se aparecer custo.
- Sem code splitting e sem virtualização: é uma tela só e a lista cresce por clique.
- `size-limit`: orçamento de 100 kB gzip para o JavaScript, checado no CI.
- Lighthouse: rodar na versão publicada e registrar as notas no `DECISIONS.md`.

## Testes

- `scoreTone`: 0, 49, 50, 80, 81 e 100.
- `useListParams`: lê a URL inicial, escreve, reage ao botão voltar.
- `fetchAnimePage`: monta as variáveis certas, converte a resposta, trata 429, 500 e
  erro do GraphQL.
- Componentes de apresentação: stories com `play` e axe. No `AnimeCard`: título, até 3
  gêneros, cor da nota, sem selo quando a nota é nula, título longo, imagem quebrada.
- Página com a API simulada (MSW): carrega, filtra, busca, "Ver mais", sem resultado,
  erro e "Tentar de novo", digitar não dispara pedido.

## Fora do escopo

- Página de detalhes do anime.
- Modo escuro.
- Busca enquanto digita.
- Testes E2E com Playwright (vai para "com mais tempo").
