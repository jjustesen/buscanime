# BuscAnime Implementation Plan

> REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

## Useful context

Este é o desafio técnico de frontend da Winnin (`FRONTEND.md`). A entrega é avaliada
por fidelidade ao Figma, arquitetura, qualidade de engenharia (robustez, testes,
desempenho), qualidade de produto, maturidade e uso de IA. Na entrevista, o autor
precisa explicar cada linha e evoluir o projeto ao vivo, então o código deve ser
simples e direto.

O design e as decisões estão em `docs/plans/2026-11-01-buscanime-design.md`. Cores,
fontes e medidas exatas estão em `docs/figma/spec.md`. O print da tela está em
`docs/figma/desktop.png`. Leia os três antes de começar.

A API é a AniList (GraphQL, `POST https://graphql.anilist.co`), sem autenticação e com
CORS liberado. Ela limita a 30 pedidos por minuto e ignora argumentos nulos, então
`format: null` significa "todos os formatos".

O enunciado exige `AI_LOG.md` e `DECISIONS.md`. Atualize os dois ao fim de cada task,
com o que foi decidido, verificado, corrigido ou rejeitado.

## Goal

Uma página React fiel ao Figma que lista animes da AniList com filtro por formato,
busca por texto, "Ver mais" e nota colorida por faixa.

## Architecture

SPA com Vite. Filtro e busca vivem na URL (`useListParams`). Os dados vêm de um cliente
`fetch` fino (`fetchAnimePage`) chamado por um `useInfiniteQuery` do TanStack Query
(`useAnimeList`). Componentes de apresentação recebem dados prontos por props e usam
CSS Modules sobre variáveis CSS com os tokens do Figma.

## Domain model

```
Format: TV | TV_SHORT | MOVIE | SPECIAL | OVA | ONA | MUSIC
FormatFilter: ALL | Format
ListParams: format: FormatFilter, search: string ("" = sem busca)
Anime: id, title, cover { medium, large, color }, genres: string[], averageScore: number | null
ScoreTone: low (< 50) | mid (50 a 80) | high (> 80)
AnimePage: items: Anime[], page: number, hasNextPage: boolean
```

## Comandos do projeto

Criados na Task 1 e usados em todas as tasks:

```bash
npm run lint        # ESLint
npm run typecheck   # tsc -b
npm test            # vitest run
npm run build       # vite build
npm run size        # size-limit (roda depois do build)
```

## Pull request layout

Antes do PR1, o `main` recebe um commit inicial só com a documentação e a configuração
dos agentes (`FRONTEND.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.agents/`, `docs/`).
Esse commit no `main` precisa do OK do dono.

Os PRs são empilhados: cada um parte do anterior.

### PR1 feature/setup main: base do projeto
Motivation: Vite, TypeScript, lint, testes, tokens do Figma, fonte, header, footer e CI
prontos antes de qualquer funcionalidade.

### PR2 feature/anilist-client feature/setup: cliente da AniList
Motivation: a busca de dados isolada e testada, sem tela.

### PR3 feature/anime-card feature/anilist-client: card do anime
Motivation: o componente principal do Figma, testado sozinho.

### PR4 feature/anime-list feature/anime-card: página com filtro, busca e "Ver mais"
Motivation: junta tudo e entrega o pedido do enunciado.

### PR5 feature/polish feature/anime-list: responsivo, acessibilidade e desempenho
Motivation: o que o enunciado não pede, mas a avaliação cobra.

### PR6 feature/docs-deploy feature/polish: README, DECISIONS, AI_LOG e publicação
Motivation: a entrega final, com Lighthouse medido na versão publicada.

## Backwards compatibility

Não se aplica: projeto novo.

---

### Task 1: Base do projeto (PR1)
Status: TODO

#### Files
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`,
  `tsconfig.node.json`, `index.html`, `eslint.config.js`, `.prettierrc`, `.gitignore`,
  `.size-limit.json`, `.github/workflows/ci.yml`
- Create: `src/main.tsx`, `src/App.tsx`, `src/App.module.css`, `src/vite-env.d.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/components/layout/Header.tsx`, `Header.module.css`, `Footer.tsx`,
  `Footer.module.css`, `Logo.tsx`, `Logo.module.css`
- Create: `src/test/setup.ts`
- Create: `README.md`, `DECISIONS.md`, `AI_LOG.md`
- Test: `src/App.test.tsx`

#### Pseudocode

Criar com `npm create vite@latest . -- --template react-ts` e depois instalar:

```bash
npm i @tanstack/react-query @fontsource/mulish
npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw size-limit @size-limit/preset-app prettier eslint-plugin-jsx-a11y eslint-config-prettier
```

Scripts no `package.json`:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "typecheck": "tsc -b",
  "test": "vitest run",
  "test:watch": "vitest",
  "size": "size-limit"
}
```

`vite.config.ts` com o bloco de teste:

```ts
test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', css: { modules: { classNameStrategy: 'non-scoped' } } }
```

`.size-limit.json`:

```json
[{ "path": "dist/assets/*.js", "limit": "100 kB" }]
```

`src/styles/tokens.css` (nomes iguais às variáveis do Figma):

```css
:root {
  --color-primary: #6324c6;
  --color-primary-light1: #774dc5;
  --color-success: #01ada6;
  --color-warning: #ffb800;
  --color-danger: #e92151;
  --color-gray-light1: #c4cad4;
  --color-gray: #a7b0be;
  --color-gray-light2: #e2e5e9;
  --color-white: #ffffff;
  --font-family: 'Mulish', system-ui, sans-serif;
  --radius-sm: 4px;
  --radius-md: 8px;
  --content-width: 1316px;
}
```

`src/main.tsx` importa `@fontsource/mulish/latin-400.css`, `latin-600.css`,
`latin-700.css`, `tokens.css` e `global.css`, cria o `QueryClient` e renderiza `<App />`
dentro do `QueryClientProvider`.

`Logo` recebe `size: 'lg' | 'sm'` (40 px no header, 24 px no footer) e desenha
`BUSC<span>ANIME</span>`, com o span em `--color-warning`.

`App` = `<Header />` + `<main>` (vazio nesta task) + `<Footer />`.

CI (`.github/workflows/ci.yml`): Node 24, `npm ci`, lint, typecheck, test, build, size.

#### Step 1: Test-driven implementation
Teste em `src/App.test.tsx`: renderiza o App e encontra o logo no header (`banner`) e o
texto "TODOS OS DIREITOS RESERVADOS" no footer (`contentinfo`). Rode `npm test` e
`npm run lint`.

#### Step 2: Simplify the code
Use the simplify-code skill. Rerun the tests.

#### Step 3: Self-review the code
Launch a sub-agent with the requesting-code-review skill. Fix feedback and re-run.

FEEDBACK:
```
<fill in after subagent review>
```

#### Step 4: Commit
```bash
git add -A
git commit
```
Write the message to the commit rules in AGENTS.md.

#### Step 5: Create PR and iterate on CI results
Use the pull-request-manager and the ci-handler skills.

---

### Task 2: Cliente da AniList (PR2)
Status: TODO

#### Files
- Create: `src/features/anime-list/lib/formats.ts`
- Create: `src/api/types.ts`, `src/api/queries.ts`, `src/api/anilist.ts`
- Create: `src/test/mocks/handlers.ts`, `src/test/mocks/server.ts`,
  `src/test/mocks/fixtures.ts`
- Modify: `src/test/setup.ts` (liga o servidor MSW)
- Test: `src/api/anilist.test.ts`

#### Pseudocode

```ts
// formats.ts
export const FORMAT_OPTIONS = [
  { value: 'ALL', label: 'All Formats' },
  { value: 'TV', label: 'TV Show' },
  { value: 'MOVIE', label: 'Movie' },
  { value: 'TV_SHORT', label: 'TV Short' },
  { value: 'SPECIAL', label: 'Special' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'MUSIC', label: 'Music' },
] as const
export type FormatFilter = (typeof FORMAT_OPTIONS)[number]['value']
export function isFormatFilter(value: string | null): value is FormatFilter
```

```ts
// types.ts
export interface Anime {
  id: number
  title: string
  cover: { medium: string; large: string; color: string | null }
  genres: string[]
  averageScore: number | null
}
export interface AnimePage { items: Anime[]; page: number; hasNextPage: boolean }
export interface ListParams { format: FormatFilter; search: string }
```

```graphql
# queries.ts (exportado como string ANIME_PAGE_QUERY)
query AnimePage($page: Int, $perPage: Int, $search: String, $format: MediaFormat, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { currentPage hasNextPage }
    media(type: ANIME, isAdult: false, search: $search, format: $format, sort: $sort) {
      id
      title { romaji userPreferred }
      coverImage { large extraLarge color }
      genres
      averageScore
    }
  }
}
```

```ts
// anilist.ts
const ENDPOINT = 'https://graphql.anilist.co'
export const PAGE_SIZE = 12

export class AniListError extends Error {
  constructor(message: string, readonly status?: number) { super(message) }
  get retryable() { return this.status === undefined || this.status === 429 || this.status >= 500 }
}

export async function fetchAnimePage(params: ListParams & { page: number }, signal?: AbortSignal): Promise<AnimePage> {
  const search = params.search.trim()
  const variables = {
    page: params.page,
    perPage: PAGE_SIZE,
    search: search || null,
    format: params.format === 'ALL' ? null : params.format,
    sort: search ? ['SEARCH_MATCH'] : ['TRENDING_DESC'],
  }
  let response: Response
  try {
    response = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ query: ANIME_PAGE_QUERY, variables }), signal })
  } catch (error) {
    if (signal?.aborted) throw error            // cancelamento não vira erro de tela
    throw new AniListError('network')           // status undefined = rede, pode tentar de novo
  }
  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.data) throw new AniListError(body?.errors?.[0]?.message ?? 'http', response.status)
  const { pageInfo, media } = body.data.Page
  return {
    page: pageInfo.currentPage,
    hasNextPage: pageInfo.hasNextPage,
    items: media.map(toAnime),
  }
}

// medium = large (230w), large = extraLarge (460w) para o srcset
function toAnime(m): Anime {
  return {
    id: m.id,
    title: m.title.romaji ?? m.title.userPreferred,
    cover: { medium: m.coverImage.large, large: m.coverImage.extraLarge, color: m.coverImage.color },
    genres: m.genres.slice(0, 3),
    averageScore: m.averageScore,
  }
}
```

MSW: `handlers.ts` responde ao `POST` da AniList com `fixtures.ts` (24 animes falsos,
2 páginas de 12), filtrando por `format` e `search` das variáveis. Os testes trocam o
handler com `server.use(...)` para simular 429, 500 e lista vazia.

#### Step 1: Test-driven implementation
Testes em `src/api/anilist.test.ts`:
- sem busca, envia `sort: ['TRENDING_DESC']`, `format: null` e `search: null`;
- com busca "  naruto ", envia `search: 'naruto'` e `sort: ['SEARCH_MATCH']`;
- `format: 'MOVIE'` vai como `MOVIE`;
- converte a resposta para `Anime` e corta os gêneros em 3;
- 429 vira `AniListError` com `retryable === true`; 400 com `retryable === false`;
- `errors` do GraphQL com status 200 e sem `data` vira `AniListError`.

Rode `npm test` e `npm run lint`.

#### Step 2: Simplify the code
Use the simplify-code skill. Rerun the tests.

#### Step 3: Self-review the code
Launch a sub-agent with the requesting-code-review skill. Fix feedback and re-run.

FEEDBACK:
```
<fill in after subagent review>
```

#### Step 4: Commit
```bash
git add src/api src/features/anime-list/lib/formats.ts src/test
git commit
```

#### Step 5: Create stacked PR and iterate on CI results
Use the pull-request-manager and the ci-handler skills.

---

### Task 3: Card do anime (PR3)
Status: TODO

#### Files
- Create: `src/features/anime-list/lib/scoreTone.ts`
- Create: `src/features/anime-list/components/AnimeCard.tsx`, `AnimeCard.module.css`
- Create: `src/features/anime-list/components/ScoreBadge.tsx`, `ScoreBadge.module.css`
- Create: `src/features/anime-list/components/CardSkeleton.tsx`, `CardSkeleton.module.css`
- Test: `src/features/anime-list/lib/scoreTone.test.ts`
- Test: `src/features/anime-list/components/AnimeCard.test.tsx`

#### Pseudocode

```ts
// scoreTone.ts — regra do enunciado. O Figma pinta 80 de verde; o enunciado manda amarelo.
export type ScoreTone = 'low' | 'mid' | 'high'
export function scoreTone(score: number): ScoreTone {
  if (score < 50) return 'low'
  if (score <= 80) return 'mid'
  return 'high'
}
```

```tsx
// ScoreBadge.tsx
export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={`${styles.badge} ${styles[scoreTone(score)]}`}>
      <span className="visually-hidden">Nota média: </span>{score}%
    </span>
  )
}
// .low { background: var(--color-danger) } .mid { --color-warning } .high { --color-success }
```

```tsx
// AnimeCard.tsx
interface AnimeCardProps { anime: Anime; priority?: 'high' | 'eager' | 'lazy' }
export function AnimeCard({ anime, priority = 'lazy' }: AnimeCardProps) {
  return (
    <article className={styles.card} style={{ backgroundColor: anime.cover.color ?? undefined }}>
      <img className={styles.cover} alt="" src={anime.cover.large}
        srcSet={`${anime.cover.medium} 230w, ${anime.cover.large} 460w`}
        sizes="(max-width: 700px) 100vw, 317px"
        loading={priority === 'lazy' ? 'lazy' : 'eager'}
        fetchPriority={priority === 'high' ? 'high' : 'auto'}
        decoding="async" />
      <div className={styles.content}>
        <h2 className={styles.title}>{anime.title}</h2>
        {anime.genres.length > 0 && (
          <ul className={styles.genres} aria-label="Gêneros">
            {anime.genres.map((g) => <li key={g} className={styles.chip}>{g}</li>)}
          </ul>
        )}
      </div>
      {anime.averageScore !== null && <ScoreBadge score={anime.averageScore} />}
    </article>
  )
}
```

CSS do card (valores de `docs/figma/spec.md`): altura 270 px, `border-radius:
var(--radius-md)`, `overflow: hidden`, `position: relative`. O degradê é um `::after`
com `linear-gradient(180deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.17) 105%)`. O conteúdo fica
acima dele (`z-index: 1`), 28 px da esquerda e 23 px do topo. O título usa
`-webkit-line-clamp: 3`. O selo fica `position: absolute; right: 8px; bottom: 11px`.

`CardSkeleton`: um bloco de 270 px com `--radius-md`, fundo `--color-gray-light2` e
`aria-hidden`.

#### Step 1: Test-driven implementation
`scoreTone.test.ts` com `it.each`: 0 e 49 → `low`; 50 e 80 → `mid`; 81 e 100 → `high`.

`AnimeCard.test.tsx`:
- mostra o título como heading;
- mostra cada gênero;
- nota 80 tem a classe `mid` e o texto "80%";
- nota `null` não mostra selo;
- `priority="lazy"` gera `loading="lazy"`, `priority="high"` gera `loading="eager"` e
  `fetchpriority="high"`.

Rode `npm test` e `npm run lint`.

#### Step 2: Simplify the code
Use the simplify-code skill. Rerun the tests.

#### Step 3: Self-review the code
Launch a sub-agent with the requesting-code-review skill. Fix feedback and re-run.

FEEDBACK:
```
<fill in after subagent review>
```

#### Step 4: Commit
```bash
git add src/features/anime-list
git commit
```

#### Step 5: Create stacked PR and iterate on CI results
Use the pull-request-manager and the ci-handler skills.

---

### Task 4: Estado na URL (PR4)
Status: TODO

#### Files
- Create: `src/features/anime-list/hooks/useListParams.ts`
- Test: `src/features/anime-list/hooks/useListParams.test.ts`

#### Pseudocode

```ts
const listeners = new Set<() => void>()
function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener('popstate', cb)
  return () => { listeners.delete(cb); window.removeEventListener('popstate', cb) }
}
const getSnapshot = () => window.location.search

export function parseListParams(query: string): ListParams {
  const url = new URLSearchParams(query)
  const format = url.get('format')
  return { format: isFormatFilter(format) ? format : 'ALL', search: url.get('search') ?? '' }
}

export function useListParams(): [ListParams, (next: ListParams) => void] {
  const query = useSyncExternalStore(subscribe, getSnapshot)
  const params = useMemo(() => parseListParams(query), [query])
  const setParams = useCallback((next: ListParams) => {
    const url = new URLSearchParams()
    if (next.format !== 'ALL') url.set('format', next.format)
    if (next.search.trim()) url.set('search', next.search.trim())
    const qs = url.toString()
    window.history.pushState(null, '', qs ? `?${qs}` : window.location.pathname)
    listeners.forEach((cb) => cb())
  }, [])
  return [params, setParams]
}
```

`useMemo` aqui é necessário: sem ele, cada render criaria um objeto novo e a chave do
query mudaria sem motivo.

#### Step 1: Test-driven implementation
- `parseListParams('')` → `{ format: 'ALL', search: '' }`;
- `parseListParams('?format=MOVIE&search=naruto')` → `MOVIE` e `naruto`;
- formato inválido (`?format=XYZ`) cai em `ALL`;
- `setParams` atualiza `window.location.search` e o valor do hook;
- `history.back()` (dispara `popstate`) volta ao valor anterior.

Rode `npm test` e `npm run lint`.

#### Step 2: Simplify the code
Use the simplify-code skill. Rerun the tests.

#### Step 3: Self-review the code
Launch a sub-agent with the requesting-code-review skill. Fix feedback and re-run.

FEEDBACK:
```
<fill in after subagent review>
```

#### Step 4: Commit
```bash
git add src/features/anime-list/hooks
git commit
```

---

### Task 5: Página com filtro, busca e "Ver mais" (PR4)
Status: TODO

#### Files
- Create: `src/features/anime-list/hooks/useAnimeList.ts`
- Create: `src/features/anime-list/AnimeListPage.tsx`, `AnimeListPage.module.css`
- Create: `src/features/anime-list/components/FormatFilter.tsx`, `FormatFilter.module.css`
- Create: `src/features/anime-list/components/SearchBar.tsx`, `SearchBar.module.css`
- Create: `src/features/anime-list/components/AnimeGrid.tsx`, `AnimeGrid.module.css`
- Create: `src/features/anime-list/components/LoadMoreButton.tsx`, `LoadMoreButton.module.css`
- Create: `src/features/anime-list/components/StatusMessage.tsx`, `StatusMessage.module.css`
- Create: `src/assets/icon-add.svg` (copiar de `docs/figma/icon-add.svg`)
- Modify: `src/main.tsx` (regra de `retry` no `QueryClient`)
- Modify: `src/App.tsx` (renderiza `AnimeListPage` dentro do `<main>`)
- Test: `src/features/anime-list/AnimeListPage.test.tsx`

#### Pseudocode

```ts
// main.tsx
new QueryClient({ defaultOptions: { queries: {
  staleTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  retry: (count, error) => count < 2 && error instanceof AniListError && error.retryable,
} } })
```

```ts
// useAnimeList.ts
export function useAnimeList(params: ListParams) {
  const query = useInfiniteQuery({
    queryKey: ['anime', params.format, params.search],
    queryFn: ({ pageParam, signal }) => fetchAnimePage({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNextPage ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  })
  // A ordem TRENDING muda entre páginas, então um anime pode aparecer duas vezes.
  const animes = useMemo(() => uniqueById(query.data?.pages.flatMap((p) => p.items) ?? []), [query.data])
  return { ...query, animes }
}
```

```tsx
// FormatFilter.tsx
<div role="group" aria-label="Filtrar por formato" className={styles.group}>
  {FORMAT_OPTIONS.map((o) => (
    <button key={o.value} type="button" aria-pressed={o.value === value}
      className={styles.button} onClick={() => onChange(o.value)}>{o.label}</button>
  ))}
</div>
// [aria-pressed='true'] { background: var(--color-primary); color: var(--color-white) }
```

```tsx
// SearchBar.tsx — o texto digitado é estado local; só sobe no envio
export function SearchBar({ initialValue, onSearch }) {
  const [text, setText] = useState(initialValue)
  useEffect(() => setText(initialValue), [initialValue])   // botão voltar do navegador
  return (
    <form role="search" className={styles.form} onSubmit={(e) => { e.preventDefault(); onSearch(text) }}>
      <label htmlFor="search" className="visually-hidden">Buscar anime</label>
      <input id="search" type="search" placeholder="Digite algo aqui..." value={text}
        onChange={(e) => setText(e.target.value)} className={styles.input} />
      <button type="submit" className={styles.button}>Buscar</button>
    </form>
  )
}
```

```tsx
// AnimeListPage.tsx
export function AnimeListPage() {
  const [params, setParams] = useListParams()
  const list = useAnimeList(params)
  const firstNewIndex = useRef<number | null>(null)

  async function loadMore() {
    firstNewIndex.current = list.animes.length
    await list.fetchNextPage()
  }

  return (
    <>
      <FormatFilter value={params.format} onChange={(format) => setParams({ ...params, format })} />
      <SearchBar initialValue={params.search} onSearch={(search) => setParams({ ...params, search })} />
      <StatusMessage list={list} search={params.search} onClear={() => setParams({ ...params, search: '' })} />
      {list.animes.length > 0 && (
        <AnimeGrid animes={list.animes} busy={list.isPlaceholderData} focusIndex={firstNewIndex} />
      )}
      {list.isPending && <SkeletonGrid count={12} />}
      {list.hasNextPage && <LoadMoreButton loading={list.isFetchingNextPage} onClick={loadMore} />}
    </>
  )
}
```

`StatusMessage` cobre os estados fora do Figma, em uma região `aria-live="polite"`:
- `isError` sem dados: "Não foi possível carregar os animes." + botão "Tentar de novo"
  (`refetch`);
- sucesso com lista vazia: `Nenhum anime encontrado para "<search>".` + botão
  "Limpar busca";
- sucesso com itens: texto só para leitor de tela, "<n> animes carregados".

`AnimeGrid`: `<ul>` com `aria-busy={busy}` e `opacity: .5` quando `busy`. Cada `<li>`
tem `tabIndex={-1}`. Num `useEffect` depois de os animes mudarem, se `focusIndex.current`
não for nulo, foca o `<li>` desse índice e zera o ref. Os 4 primeiros cards recebem
`priority="eager"` e o primeiro `"high"`.

`LoadMoreButton`: 48 px, `--color-warning`, `--radius-md`, ícone `icon-add.svg` (24 px,
`alt=""`) + "Ver mais" em 20 px SemiBold branco. Com `loading`, fica `disabled` e mostra
"Carregando...".

#### Step 1: Test-driven implementation
Testes em `AnimeListPage.test.tsx`, com o MSW da Task 2 e um `QueryClient` novo por
teste (`retry: false`):
- mostra 12 cards da primeira página;
- clicar em "Movie" deixa o botão com `aria-pressed="true"`, a URL com
  `?format=MOVIE` e só filmes na lista;
- digitar "naruto" não faz pedido; clicar em "Buscar" (ou Enter) faz um pedido com
  `search: 'naruto'`;
- "Ver mais" soma 12 cards e foca o 13º; na última página o botão some;
- lista vazia mostra a mensagem e "Limpar busca" volta à lista;
- erro 500 mostra a mensagem; "Tentar de novo" com o handler normal mostra os cards;
- abrir a página em `?format=OVA&search=x` já começa com o filtro e o campo preenchidos.

Rode `npm test` e `npm run lint`.

#### Step 2: Simplify the code
Use the simplify-code skill. Rerun the tests.

#### Step 3: Self-review the code
Launch a sub-agent with the requesting-code-review skill. Fix feedback and re-run.

FEEDBACK:
```
<fill in after subagent review>
```

#### Step 4: Commit
```bash
git add src
git commit
```

#### Step 5: Create stacked PR and iterate on CI results
Use the pull-request-manager and the ci-handler skills. PR4 leva as Tasks 4 e 5.

---

### Task 6: Responsivo, acessibilidade e desempenho (PR5)
Status: TODO

#### Files
- Modify: os `.module.css` de `AnimeListPage`, `FormatFilter`, `SearchBar`, `AnimeGrid`
- Modify: `src/styles/global.css` (foco visível, `.visually-hidden`,
  `prefers-reduced-motion`)
- Modify: `DECISIONS.md` (medições)

#### Pseudocode

```css
/* AnimeGrid.module.css */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 21px 16px;
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: 25px;
}
@media (min-width: 1366px) { .grid { grid-template-columns: repeat(4, 317px); } }
```

- Filtros: `flex-wrap: wrap; justify-content: center`.
- Busca: largura máxima de 1012 px; o campo cresce (`flex: 1`).
- Foco: `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px }`.
- `prefers-reduced-motion`: sem transição de opacidade.

#### Step 1: Verificar no navegador
Rode `npm run build && npm run preview`. Confira em 1366, 1024, 768 e 375 px contra
`docs/figma/desktop.png`. Navegue só com teclado (Tab, Enter, Espaço). Com o React
Profiler, meça um "Ver mais" com 48 cards na tela. Se o render passar de 16 ms,
aplique `memo` no `AnimeCard` e meça de novo. Registre os números no `DECISIONS.md`
nos dois casos.

#### Step 2: Rodar a suíte
`npm run lint && npm run typecheck && npm test && npm run build && npm run size`.

#### Step 3: Self-review the code
Launch a sub-agent with the requesting-code-review skill. Fix feedback and re-run.

FEEDBACK:
```
<fill in after subagent review>
```

#### Step 4: Commit
```bash
git add src DECISIONS.md
git commit
```

#### Step 5: Create stacked PR and iterate on CI results
Use the pull-request-manager and the ci-handler skills.

---

### Task 7: Documentação e publicação (PR6)
Status: TODO

#### Files
- Modify: `README.md` (o que é, como rodar, como testar, link publicado)
- Modify: `DECISIONS.md` (decisões, trade-offs, o que ficou de fora, Lighthouse)
- Modify: `AI_LOG.md` (ferramentas, organização, o que foi verificado, corrigido e
  rejeitado)

#### Step 1: Publicar
Publicar na Vercel (o dono conecta o repositório; não criar conta nem fazer login em
nome dele). Rodar o Lighthouse (mobile e desktop) na URL publicada e registrar
Performance, Accessibility, Best Practices, LCP, CLS e INP no `DECISIONS.md`.

#### Step 2: Revisar os documentos
Use the writing skill. Confira o `README.md` seguindo os passos do zero em uma pasta
limpa (`git clone`, `npm ci`, `npm run dev`, `npm test`).

#### Step 3: Commit
```bash
git add README.md DECISIONS.md AI_LOG.md
git commit
```

#### Step 4: Create stacked PR
Use the pull-request-manager skill.

---

### Task 8: Verificação final
Status: TODO

Rode a suíte completa e mostre a saída:

```bash
npm run lint && npm run typecheck && npm test && npm run build && npm run size
```

Esperado: lint sem erros, typecheck sem erros, todos os testes passando, build gerado e
JavaScript abaixo de 100 kB gzip.
