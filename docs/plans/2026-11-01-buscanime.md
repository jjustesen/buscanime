# BuscAnime Implementation Plan

> REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

## Useful context

Este é o desafio técnico de frontend da Winnin (`FRONTEND.md`). A entrega é avaliada
por fidelidade ao Figma, arquitetura, qualidade de engenharia (robustez, testes,
desempenho), qualidade de produto, maturidade e uso de IA. Na entrevista, o autor
precisa explicar cada linha e evoluir o projeto ao vivo, então o código deve ser
simples e direto.

O design e as decisões estão em `docs/plans/2026-11-01-buscanime-design.md`. As regras
de estrutura, tipos, testes, Storybook e idioma estão em `docs/CONVENTIONS.md`. Cores,
fontes e medidas exatas estão em `docs/figma/spec.md`. O print da tela está em
`docs/figma/desktop.png`. Leia os quatro antes de começar.

Lembretes das convenções que mais afetam este plano:
- Toda `interface`/`type` e cada prop têm comentário JSDoc (o lint cobra).
- Componentes de apresentação são testados por stories com `play`, não por `.test.tsx`.
- Estado visual sai em atributo (`data-tone`, `aria-pressed`), não em classe.
- Exports nomeados. Comentários em português, código em inglês.

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
npm run lint             # ESLint
npm run format:check     # Prettier (npm run format corrige)
npm run typecheck        # tsc -b
npm test                 # vitest run: projeto "unit" (jsdom) + projeto "storybook" (Chromium)
npm run test:unit        # só o projeto "unit", mais rápido no dia a dia
npm run build            # app em dist/ e Storybook em dist/storybook/
npm run size             # size-limit (roda depois do build)
npm run storybook        # Storybook em modo de desenvolvimento
```

O projeto "storybook" do Vitest precisa do Chromium do Playwright. Na primeira vez:
`npx playwright install chromium`.

## Pull request layout

Antes do PR1, o `main` recebe um commit inicial só com a documentação e a configuração
dos agentes (`FRONTEND.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.agents/`, `docs/`).
Esse commit no `main` precisa do OK do dono.

Os PRs são empilhados: cada um parte do anterior.

### PR1 feature/setup main: base do projeto
Motivation: Vite, TypeScript, lint (com fronteiras e JSDoc), testes, Storybook, tokens
do Figma, fonte, header, footer e CI prontos antes de qualquer funcionalidade.

### PR2 feature/anilist-client feature/setup: cliente da AniList
Motivation: a busca de dados isolada e testada, sem tela.

### PR3 feature/anime-card feature/anilist-client: card do anime
Motivation: o componente principal do Figma, testado sozinho.

### PR4 feature/anime-list feature/anime-card: página com filtro, busca e "Ver mais"
Motivation: junta tudo e entrega o pedido do enunciado.

### PR5 feature/polish feature/anime-list: responsivo, acessibilidade e desempenho
Motivation: o que o enunciado não pede, mas a avaliação cobra.

### PR6 feature/docs-deploy feature/polish: README, DECISIONS, AI_LOG e publicação
Motivation: a entrega final, com o app e o Storybook publicados e o Lighthouse medido
na versão publicada.

## Backwards compatibility

Não se aplica: projeto novo.

---

### Task 1: Base do projeto (PR1)
Status: COMPLETED

> **O que mudou na execução** (detalhes no `DECISIONS.md`): TypeScript 6.0 e ESLint 9
> (limites do typescript-eslint e do jsx-a11y), eslint-plugin-jsdoc 63 (Node 24.11),
> sem `.storybook/vitest.setup.ts` (o plugin do Storybook 10 já aplica o preview),
> `@size-limit/file` em vez do preset-app, fontes e tokens importados pelo
> `global.css` (sem `fonts.ts`), `tags: ['autodocs']` uma vez só no `preview.ts`,
> Prettier checado no CI, `msw` e `user-event` instalados só nas tasks que os usam.
> O código abaixo é o plano original.

#### Files
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`,
  `tsconfig.node.json`, `index.html`, `eslint.config.js`, `.prettierrc`,
  `.gitattributes`, `.size-limit.json`, `.github/workflows/ci.yml`
- Modify: `.gitignore` (somar `storybook-static/`)
- Create: `.storybook/main.ts`, `.storybook/preview.ts`, `.storybook/vitest.setup.ts`
- Create: `src/main.tsx`, `src/App.tsx`, `src/App.module.css`, `src/vite-env.d.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/fonts.ts`
- Create: `src/components/layout/Header.tsx`, `Header.module.css`, `Header.stories.tsx`
- Create: `src/components/layout/Footer.tsx`, `Footer.module.css`, `Footer.stories.tsx`
- Create: `src/components/layout/Logo.tsx`, `Logo.module.css`, `Logo.stories.tsx`
- Create: `src/test/setup.ts`
- Create: `README.md`, `DECISIONS.md`, `AI_LOG.md`
- Test: `src/App.test.tsx`

#### Pseudocode

Criar com `npm create vite@latest . -- --template react-ts` e depois instalar:

```bash
npm i @tanstack/react-query @fontsource/mulish
npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw size-limit @size-limit/preset-app prettier eslint-plugin-jsx-a11y eslint-config-prettier eslint-plugin-jsdoc
npm create storybook@latest -- --yes --features docs test a11y
```

O `create storybook` instala o Storybook 10 com `@storybook/react-vite`,
`@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-vitest`,
`@vitest/browser-playwright` e o Chromium. Confira o que ele gerou e apague as
stories de exemplo (`src/stories/`).

Scripts no `package.json`:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build && storybook build -o dist/storybook --quiet",
  "preview": "vite preview",
  "lint": "eslint .",
  "typecheck": "tsc -b",
  "test": "vitest run",
  "test:unit": "vitest run --project unit",
  "test:watch": "vitest --project unit",
  "size": "size-limit",
  "storybook": "storybook dev -p 6006"
}
```

`vite.config.ts` com dois projetos de teste:

```ts
test: {
  projects: [
    {
      extends: true,
      test: { name: 'unit', environment: 'jsdom', setupFiles: './src/test/setup.ts', include: ['src/**/*.test.{ts,tsx}'] },
    },
    {
      extends: true,
      plugins: [storybookTest({ configDir: '.storybook' })],
      test: {
        name: 'storybook',
        browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }] },
        setupFiles: ['.storybook/vitest.setup.ts'],
      },
    },
  ],
}
```

`.storybook/preview.ts` importa `src/styles/fonts.ts`, `tokens.css` e `global.css`
(os mesmos do `main.tsx`), e liga o axe para falhar o teste:
`parameters: { a11y: { test: 'error' } }`.

`.gitattributes`: `* text=auto eol=lf`, para o Windows não trocar as quebras de linha.

`eslint.config.js`, além do padrão do Vite (typescript-eslint, react-hooks) e do
`jsx-a11y`:

```js
// Fronteiras de docs/CONVENTIONS.md, seção 1
{ files: ['src/api/**'], rules: { 'no-restricted-imports': ['error', { patterns: ['react', '**/features/**', '**/components/**'] }] } },
{ files: ['src/components/**'], rules: { 'no-restricted-imports': ['error', { patterns: ['**/features/**', '**/api/**'] }] } },
{ files: ['src/**/lib/**'], rules: { 'no-restricted-imports': ['error', { patterns: ['react', 'react-dom'] }] } },
// Descrição em cada tipo e prop: docs/CONVENTIONS.md, seção 5
{
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/**/*.stories.tsx', 'src/**/*.test.{ts,tsx}'],
  plugins: { jsdoc },
  rules: {
    'jsdoc/require-jsdoc': ['error', { publicOnly: false, require: {}, contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSPropertySignature'] }],
  },
},
// Exports nomeados
{ files: ['src/**/*.{ts,tsx}'], ignores: ['src/**/*.stories.tsx'], rules: { 'no-restricted-exports': ['error', { restrictDefaultExports: { direct: true, named: true, defaultFrom: true, namedFrom: true, namespaceFrom: true } }] } },
eslintConfigPrettier,
```

Story de exemplo (padrão para todas):

```tsx
// Logo.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Logo } from './Logo'

const meta = { component: Logo, tags: ['autodocs'] } satisfies Meta<typeof Logo>
export default meta
type Story = StoryObj<typeof meta>

/** Tamanho usado no header (40 px). */
export const Large: Story = { args: { size: 'lg' } }
/** Tamanho usado no footer (24 px). */
export const Small: Story = { args: { size: 'sm' } }
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

`src/styles/fonts.ts` importa `@fontsource/mulish/latin-400.css`, `latin-600.css` e
`latin-700.css`. `src/main.tsx` importa `fonts.ts`, `tokens.css` e `global.css`, cria
o `QueryClient` e renderiza `<App />` dentro do `QueryClientProvider`.

`Logo` recebe `size: 'lg' | 'sm'` (40 px no header, 24 px no footer) e desenha
`BUSC<span>ANIME</span>`, com o span em `--color-warning`.

`App` = `<Header />` + `<main>` (vazio nesta task) + `<Footer />`.

CI (`.github/workflows/ci.yml`): Node 24, `npm ci`,
`npx playwright install --with-deps chromium`, lint, typecheck, test, build, size.

#### Step 1: Test-driven implementation
Teste em `src/App.test.tsx`: renderiza o App e encontra o logo no header (`banner`) e o
texto "TODOS OS DIREITOS RESERVADOS" no footer (`contentinfo`). Stories de `Logo`,
`Header` e `Footer`. Confirme que o lint pega as regras novas: um `export default`, uma
prop sem JSDoc e um import de `features/` dentro de `components/` precisam falhar
(teste à mão e desfaça). Rode `npm test` e `npm run lint`.

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
Status: COMPLETED

> **O que mudou na execução:** msw 3 usa `onUnhandledFrame`; `AniListError.status` é
> um campo comum (`erasableSyntaxOnly`); a resposta é tipada pelo schema e convertida
> uma vez, sem validação manual; `ANILIST_ENDPOINT`, `AnimePageVariables` e
> `AniListMedia` são exportados para os mocks. Detalhes no `DECISIONS.md`.

#### Files
- Create: `src/features/anime-list/lib/formats.ts`, `src/features/anime-list/types.ts`
- Create: `src/api/types.ts`, `src/api/queries.ts`, `src/api/anilist.ts`
- Create: `src/test/mocks/handlers.ts`, `src/test/mocks/server.ts`,
  `src/test/mocks/fixtures.ts`
- Modify: `src/test/setup.ts` (liga o servidor MSW)
- Test: `src/api/anilist.test.ts`

#### Pseudocode

Instalar o que esta task usa pela primeira vez: `npm i -D msw`.

**Quem é dono de quê:** `api/` não pode importar de `features/` (regra de lint da
Task 1). Por isso `api/` é dona do tipo `Format` (os formatos da AniList) e recebe
`format: Format | null`. A feature é dona do `'ALL'`, dos rótulos dos botões e do
`ListParams`; o `useAnimeList` (Task 5) converte `'ALL'` em `null`.

```ts
// api/types.ts (trecho)
/** Formatos de mídia da AniList que a tela filtra. */
export type Format = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC'

/** Pedido de uma página de animes à AniList. */
export interface AnimePageRequest {
  /** Página pedida, começando em 1. */
  page: number
  /** Formato filtrado, ou `null` para todos. */
  format: Format | null
  /** Texto buscado. String vazia significa "sem busca". */
  search: string
}
```

```ts
// features/anime-list/lib/formats.ts
import type { Format } from '../../../api/types'
export const FORMAT_OPTIONS = [
  { value: 'ALL', label: 'All Formats' },
  { value: 'TV', label: 'TV Show' },
  { value: 'MOVIE', label: 'Movie' },
  { value: 'TV_SHORT', label: 'TV Short' },
  { value: 'SPECIAL', label: 'Special' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'MUSIC', label: 'Music' },
] as const satisfies readonly FormatOption[]

/** Valor de um botão de formato: `ALL` (sem filtro) ou um formato da AniList. */
export type FormatFilter = 'ALL' | Format
/** Um botão de formato, com o texto exato do Figma. */
export interface FormatOption {
  /** Valor enviado ao escolher o botão. */
  value: FormatFilter
  /** Texto do botão, idêntico ao Figma. */
  label: string
}
export function isFormatFilter(value: string | null): value is FormatFilter
```

```ts
// features/anime-list/types.ts
/** Filtros da lista, espelhados na URL. */
export interface ListParams {
  /** Formato escolhido nos botões; `ALL` não filtra. */
  format: FormatFilter
  /** Texto buscado. String vazia significa "sem busca". */
  search: string
}
```

```ts
// types.ts — cada tipo e cada prop com JSDoc (docs/CONVENTIONS.md, seção 5)
/** Anime já convertido da resposta da AniList para o formato que a tela usa. */
export interface Anime {
  /** ID da AniList. Único, usado como `key` e para remover repetidos entre páginas. */
  id: number
  /** Título em romaji, como no Figma. Cai para `userPreferred` se vier vazio. */
  title: string
  /** Capa do anime em dois tamanhos, para o `srcset`. */
  cover: AnimeCover
  /** Até 3 gêneros, na ordem da AniList. Pode ser vazio. */
  genres: string[]
  /** Nota média de 0 a 100. `null` quando a AniList ainda não tem votos suficientes. */
  averageScore: number | null
}

/** Imagens da capa. A AniList não redimensiona, então usamos os tamanhos que ela tem. */
export interface AnimeCover {
  /** URL da capa com 230 px de largura (`coverImage.large` na API). */
  medium: string
  /** URL da capa com 460 px de largura (`coverImage.extraLarge` na API). */
  large: string
  /** Cor média da capa em hex, usada como fundo enquanto a imagem carrega. Pode faltar. */
  color: string | null
}

/** Uma página de resultados, já convertida. */
export interface AnimePage {
  /** Animes desta página, no máximo `PAGE_SIZE`. */
  items: Anime[]
  /** Número da página, começando em 1. */
  page: number
  /** `true` quando existe uma próxima página; controla o botão "Ver mais". */
  hasNextPage: boolean
}
```

O `jsdoc/require-jsdoc` também cobra propriedades de tipos escritos dentro de uma
assinatura (`params: { page: number }`). Por isso todo parâmetro de objeto usa um tipo
com nome, como o `AnimePageRequest`.

Os tipos crus da resposta da AniList (`AniListMedia`, `AniListPageResponse`) ficam
dentro de `anilist.ts`, não são exportados e também levam JSDoc.

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

export async function fetchAnimePage(request: AnimePageRequest, signal?: AbortSignal): Promise<AnimePage> {
  const search = request.search.trim()
  const variables = {
    page: request.page,
    perPage: PAGE_SIZE,
    search: search || null,
    format: request.format,
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
2 páginas de 12), filtrando por `format` e `search` das variáveis. `fixtures.ts`
também exporta animes prontos para as stories: `animeHighScore` (87),
`animeMidScore` (80), `animeLowScore` (48), `animeNoScore` (null), `animeLongTitle`,
`animeNoGenres` e `animeBrokenImage`. As capas das fixtures são arquivos locais em
`src/test/mocks/covers/`, para os testes e as stories não dependerem da internet. Os testes trocam o
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
Status: COMPLETED

> **O que mudou na execução:** sem `srcSet`/`sizes` (só a capa de 460 px; `cover.medium`
> saiu do tipo e da query); capa que falha deixa de ser renderizada e fica a cor média;
> `isolation: isolate` no card; `min-height` em vez de `height`; o `CardSkeleton` não
> tem `aria-hidden` (quem esconde é a grade de esqueletos da Task 5); o axe ignora o
> contraste só no selo da nota. Detalhes no `DECISIONS.md`.

#### Files
- Create: `src/features/anime-list/lib/scoreTone.ts`
- Create: `src/features/anime-list/components/AnimeCard.tsx`, `AnimeCard.module.css`
- Create: `src/features/anime-list/components/ScoreBadge.tsx`, `ScoreBadge.module.css`
- Create: `src/features/anime-list/components/CardSkeleton.tsx`, `CardSkeleton.module.css`
- Test: `src/features/anime-list/lib/scoreTone.test.ts`
- Test: `src/features/anime-list/components/AnimeCard.stories.tsx`
- Test: `src/features/anime-list/components/ScoreBadge.stories.tsx`
- Test: `src/features/anime-list/components/CardSkeleton.stories.tsx`

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
/** Props do selo de nota. */
export interface ScoreBadgeProps {
  /** Nota média de 0 a 100. A cor sai de `scoreTone`. */
  score: number
}
export function ScoreBadge({ score }: ScoreBadgeProps) {
  return (
    <span className={styles.badge} data-tone={scoreTone(score)}>
      <span className="visually-hidden">Nota média: </span>{score}%
    </span>
  )
}
// [data-tone='low'] { background: var(--color-danger) }
// [data-tone='mid'] { background: var(--color-warning) }
// [data-tone='high'] { background: var(--color-success) }
```

As stories do `ScoreBadge` e do `AnimeCard` desligam só a regra `color-contrast` do
axe, com o comentário: "Contraste do Figma mantido por decisão do dono; ver
DECISIONS.md". As outras regras do axe continuam valendo.

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
          <ul role="list" className={styles.genres} aria-label="Gêneros">
            {anime.genres.map((g) => <li key={g} className={styles.chip}>{g}</li>)}
          </ul>
        )}
      </div>
      {anime.averageScore !== null && <ScoreBadge score={anime.averageScore} />}
    </article>
  )
}
```

O `role="list"` explícito precisa de uma exceção no lint, adicionada nesta task:
`'jsx-a11y/no-redundant-roles': ['error', { ul: ['list'] }]`.

CSS do card (valores de `docs/figma/spec.md`): altura 270 px, `border-radius:
var(--radius-md)`, `overflow: hidden`, `position: relative`. O degradê é um `::after`
com `linear-gradient(180deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.17) 105%)`. O conteúdo fica
acima dele (`z-index: 1`), 28 px da esquerda e 23 px do topo. O título usa
`-webkit-line-clamp: 3`. O selo fica `position: absolute; right: 8px; bottom: 11px`.

`CardSkeleton`: um bloco de 270 px com `--radius-md`, fundo `--color-gray-light2` e
`aria-hidden`.

#### Step 1: Test-driven implementation
`scoreTone.test.ts` com `it.each`: 0 e 49 → `low`; 50 e 80 → `mid`; 81 e 100 → `high`.

`ScoreBadge.stories.tsx`: `Low` (48), `MidLowerBound` (50), `MidUpperBound` (80),
`High` (81). Cada uma tem um `play` que confere o texto ("80%") e o `data-tone`.

`AnimeCard.stories.tsx`, com as fixtures da Task 2 e um `play` em cada:
- `Default`: o título é um heading e cada gênero aparece;
- `MidScore`: nota 80 com `data-tone="mid"` e texto "80%";
- `NoScore`: sem selo;
- `LongTitle`: o título continua um heading só (o corte é visual);
- `NoGenres`: sem a lista de gêneros;
- `BrokenImage`: o card continua com título e cor de fundo;
- `HighPriority`: a imagem tem `loading="eager"` e `fetchpriority="high"`;
- `Lazy`: a imagem tem `loading="lazy"`.

`CardSkeleton.stories.tsx`: `Default`, com `play` que confere `aria-hidden`.

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
Status: COMPLETED

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
Status: COMPLETED

> **O que mudou na execução:** o `useAnimeList` devolve um modelo pequeno (não o
> objeto inteiro do TanStack); a chave do query é `['anime', 'list', params]`; o foco
> depois do "Ver mais" é controlado pela página e preso aos filtros; o botão usa
> `aria-disabled`; a barra de busca sincroniza com a URL durante o render (sem `key`);
> `createQueryClient` e `shouldRetry` compartilhados entre app e testes. Detalhes no
> `DECISIONS.md`.

#### Files
- Create: `src/features/anime-list/hooks/useAnimeList.ts`
- Create: `src/features/anime-list/AnimeListPage.tsx`, `AnimeListPage.module.css`
- Create: `src/features/anime-list/components/FormatFilter.tsx`, `FormatFilter.module.css`
- Create: `src/features/anime-list/components/SearchBar.tsx`, `SearchBar.module.css`
- Create: `src/features/anime-list/components/AnimeGrid.tsx`, `AnimeGrid.module.css`
- Create: `src/features/anime-list/components/LoadMoreButton.tsx`, `LoadMoreButton.module.css`
- Create: `src/features/anime-list/components/StatusMessage.tsx`, `StatusMessage.module.css`
- Create: um `.stories.tsx` ao lado de cada componente novo acima (`FormatFilter`,
  `SearchBar`, `AnimeGrid`, `LoadMoreButton`, `StatusMessage`)
- Create: `src/assets/icon-add.svg` (copiar de `docs/figma/icon-add.svg`)
- Modify: `src/main.tsx` (regra de `retry` no `QueryClient`)
- Modify: `src/App.tsx` (renderiza `AnimeListPage` dentro do `<main>`)
- Create: `src/test/renderWithClient.tsx` (renderiza com um `QueryClient` novo,
  `retry: false`)
- Modify: `src/App.test.tsx` (passa a usar `renderWithClient`, porque o App agora monta
  a página que usa o TanStack Query)
- Test: `src/features/anime-list/AnimeListPage.test.tsx`

Instalar o que esta task usa pela primeira vez: `npm i -D @testing-library/user-event`.

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
    queryFn: ({ pageParam, signal }) =>
      fetchAnimePage(
        { page: pageParam, search: params.search, format: params.format === 'ALL' ? null : params.format },
        signal,
      ),
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
// SearchBar.tsx — o texto digitado é estado local; só sobe no envio.
// Sem useEffect para sincronizar com a URL (o lint proíbe setState em efeito):
// a página renderiza <SearchBar key={params.search} ...>, então o botão voltar
// do navegador remonta o componente com o valor novo.
export function SearchBar({ initialValue, onSearch }: SearchBarProps) {
  const [text, setText] = useState(initialValue)
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
      <SearchBar key={params.search} initialValue={params.search} onSearch={(search) => setParams({ ...params, search })} />
      <StatusMessage status={list.status} count={list.animes.length} search={params.search}
        onRetry={() => list.refetch()} onClear={() => setParams({ ...params, search: '' })} />
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

`AnimeGrid`: `<ul role="list">` com `aria-busy={busy}` e `opacity: .5` quando `busy`.
O `role="list"` é proposital: o Safari com VoiceOver tira a semântica de lista de um
`ul` com `list-style: none`. Cada `<li>`
tem `tabIndex={-1}`. Num `useEffect` depois de os animes mudarem, se `focusIndex.current`
não for nulo, foca o `<li>` desse índice e zera o ref. Os 4 primeiros cards recebem
`priority="eager"` e o primeiro `"high"`. Cada `AnimeCard` usa `key={anime.id}`: o card
guarda se a capa falhou e conta com isso para não reaproveitar o estado entre animes.

`SkeletonGrid` (no mesmo arquivo da grade ou ao lado): 12 `CardSkeleton` dentro de um
contêiner com `aria-hidden="true"`. O leitor de tela fica sabendo do carregamento pelo
`StatusMessage`, não por 12 itens vazios.

`LoadMoreButton`: 48 px, `--color-warning`, `--radius-md`, ícone `icon-add.svg` (24 px,
`alt=""`) + "Ver mais" em 20 px SemiBold branco. Com `loading`, fica `disabled` e mostra
"Carregando...".

#### Step 1: Test-driven implementation
Stories com `play` (componentes de apresentação, com `fn()` do `storybook/test` nos
callbacks):
- `FormatFilter`: `AllSelected` e `MovieSelected`; o `play` clica em "OVA" e confere
  `onChange('OVA')`.
- `SearchBar`: `Empty` e `WithValue`; o `play` digita, aperta Enter e confere
  `onSearch` chamado uma vez com o texto; digitar sem enviar não chama `onSearch`.
- `AnimeGrid`: `Default` (12 cards) e `Busy` (`aria-busy="true"`).
- `LoadMoreButton`: `Idle` (clicar chama `onClick`) e `Loading` (desabilitado,
  "Carregando...").
- `StatusMessage`: `Loading`, `Empty` (clicar em "Limpar busca" chama `onClear`),
  `Error` (clicar em "Tentar de novo" chama `onRetry`) e `Loaded` (texto só para leitor
  de tela).

`StatusMessage` recebe props simples (`status`, `count`, `search`, `onRetry`,
`onClear`), não o objeto do query inteiro, para dar para montar as stories.

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
nome dele). O `npm run build` já gera o app em `dist/` e o Storybook em
`dist/storybook/`, então os dois saem no mesmo deploy: o app na raiz e o Storybook em
`/storybook/`. Conferir que as duas URLs abrem. Rodar o Lighthouse (mobile e desktop)
na URL do app e registrar Performance, Accessibility, Best Practices, LCP, CLS e INP no
`DECISIONS.md`. Colocar os dois links no topo do `README.md`.

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
