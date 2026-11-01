import { ANIME_PAGE_QUERY } from './queries'
import type { Anime, AnimePage, AnimePageRequest, Format } from './types'

export const ANILIST_ENDPOINT = 'https://graphql.anilist.co'

// 12 cards por página, como no Figma.
export const PAGE_SIZE = 12

/** Variáveis da `ANIME_PAGE_QUERY`, como vão no corpo do pedido. O mock do MSW lê as mesmas. */
export interface AnimePageVariables {
  /** Página pedida, começando em 1. */
  page: number
  /** Animes por página; sempre `PAGE_SIZE`. */
  perPage: number
  /** Texto buscado, sem espaços nas pontas, ou `null` para não buscar. */
  search: string | null
  /** Formato filtrado, ou `null` para todos. */
  format: Format | null
  /** Ordem: em alta sem busca, relevância com busca. */
  sort: MediaSort[]
}

/** Ordens da AniList que o app usa. */
type MediaSort = 'TRENDING_DESC' | 'SEARCH_MATCH'

// Tipos crus da resposta. Seguem o schema da AniList, onde quase todo campo pode vir
// nulo. Ficam aqui dentro: o formato da API não sai de api/.

/** O `data.Page` da resposta. */
interface AniListPage {
  /** Dados de paginação. */
  pageInfo: AniListPageInfo
  /** Animes da página. O GraphQL permite item nulo na lista. */
  media: (AniListMedia | null)[]
}

/** Paginação da AniList. */
interface AniListPageInfo {
  /** Página devolvida, começando em 1. */
  currentPage: number | null
  /** `true` quando existe uma próxima página. */
  hasNextPage: boolean | null
}

/** Um anime como a AniList devolve. */
interface AniListMedia {
  /** ID da AniList; o único campo que o schema garante não nulo. */
  id: number
  /** Títulos em mais de uma língua. */
  title: AniListTitle | null
  /** URLs da capa em tamanhos fixos, mais a cor média. */
  coverImage: AniListCoverImage | null
  /** Gêneros, sem limite de quantidade. */
  genres: string[] | null
  /** Nota média de 0 a 100. */
  averageScore: number | null
}

/** Títulos que a query pede. */
interface AniListTitle {
  /** Título em romaji, o que o Figma mostra. */
  romaji: string | null
  /** Título na língua que o usuário da AniList prefere; serve de reserva. */
  userPreferred: string | null
}

/** Capa que a query pede. */
interface AniListCoverImage {
  /** Capa com 230 px de largura. */
  large: string | null
  /** Capa com 460 px de largura. */
  extraLarge: string | null
  /** Cor média da capa em hex. */
  color: string | null
}

// Erro que a tela mostra. `retryable` diz ao TanStack Query se vale repetir o pedido.
export class AniListError extends Error {
  // Status HTTP. `undefined` quando o pedido nem teve resposta (falha de rede).
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AniListError'
    this.status = status
  }

  // Repetir só ajuda se o problema for passageiro: rede, limite de pedidos ou servidor.
  get retryable(): boolean {
    return this.status === undefined || this.status === 429 || this.status >= 500
  }
}

export async function fetchAnimePage(
  request: AnimePageRequest,
  signal?: AbortSignal,
): Promise<AnimePage> {
  const search = request.search.trim()
  const variables: AnimePageVariables = {
    page: request.page,
    perPage: PAGE_SIZE,
    // A AniList ignora argumento nulo, então `null` quer dizer "sem busca".
    search: search || null,
    format: request.format,
    sort: search ? ['SEARCH_MATCH'] : ['TRENDING_DESC'],
  }

  let response: Response
  try {
    response = await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: ANIME_PAGE_QUERY, variables }),
      signal,
    })
  } catch (error) {
    // Cancelado de propósito (o filtro mudou): não é erro de tela, repassa como veio.
    if (signal?.aborted) throw error
    throw new AniListError('Não foi possível falar com a AniList.')
  }

  const body: unknown = await response.json().catch((error: unknown) => {
    if (signal?.aborted) throw error
    // Corpo que não é JSON (a página de erro de um proxy, por exemplo).
    return null
  })

  const page = readPage(body)
  if (!response.ok || page === null) {
    const message = readErrorMessage(body) ?? `A AniList respondeu com status ${response.status}.`
    throw new AniListError(message, response.status)
  }

  return {
    items: page.media.filter((media) => media !== null).map(toAnime),
    page: page.pageInfo.currentPage ?? request.page,
    hasNextPage: page.pageInfo.hasNextPage === true,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// Confere a estrutura de fora (`data.Page` com `pageInfo` e `media`) e devolve `null`
// se ela não estiver lá, como numa resposta de erro.
function readPage(body: unknown): AniListPage | null {
  const data = isRecord(body) ? body.data : null
  const page = isRecord(data) ? data.Page : null
  if (!isRecord(page) || !isRecord(page.pageInfo) || !Array.isArray(page.media)) return null
  // Fronteira da API: a estrutura foi conferida acima; os campos de cada anime podem vir
  // nulos e o `toAnime` trata cada um.
  return page as unknown as AniListPage
}

// A AniList explica o erro em `errors[0].message`, com status HTTP ou sem.
function readErrorMessage(body: unknown): string | null {
  const errors = isRecord(body) ? body.errors : null
  const first: unknown = Array.isArray(errors) ? errors[0] : null
  return isRecord(first) && typeof first.message === 'string' ? first.message : null
}

function toAnime(media: AniListMedia): Anime {
  return {
    id: media.id,
    // `||` e não `??`: romaji vazio também cai para o título preferido.
    title: media.title?.romaji || media.title?.userPreferred || '',
    // A AniList não redimensiona: `large` tem 230 px e `extraLarge` 460 px.
    cover: {
      medium: media.coverImage?.large ?? '',
      large: media.coverImage?.extraLarge ?? '',
      color: media.coverImage?.color ?? null,
    },
    genres: (media.genres ?? []).slice(0, 3),
    averageScore: media.averageScore ?? null,
  }
}
