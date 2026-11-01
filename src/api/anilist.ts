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

/** Corpo da resposta da AniList, com sucesso ou com erro. */
interface AniListResponse {
  /** Dados pedidos. Falta ou vem `null` quando o pedido falhou. */
  data?: AniListData | null
  /** Erros do GraphQL. Pode vir junto com status HTTP de erro ou com 200. */
  errors?: AniListGraphQLError[]
}

/** O `data` da resposta. */
interface AniListData {
  /** A página pedida. `null` quando a query falhou. */
  Page: AniListPage | null
}

/** Um erro do GraphQL. */
interface AniListGraphQLError {
  /** Explicação do erro, em inglês, escrita pela AniList. */
  message: string
}

/** O `data.Page` da resposta. */
interface AniListPage {
  /** Dados de paginação. */
  pageInfo: AniListPageInfo | null
  /** Animes da página. O GraphQL permite a lista nula e item nulo na lista. */
  media: (AniListMedia | null)[] | null
}

/** Paginação da AniList. */
interface AniListPageInfo {
  /** Página devolvida, começando em 1. */
  currentPage: number | null
  /** `true` quando existe uma próxima página. */
  hasNextPage: boolean | null
}

// Exportado só para os mocks do MSW: assim, renomear um campo da query quebra o `tsc`
// também no mock. O resto do app usa `Anime`.
/** Um anime como a AniList devolve. */
export interface AniListMedia {
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
  /** Capa com 460 px de largura, a maior que a AniList tem. */
  extraLarge: string | null
  /** Cor média da capa em hex. */
  color: string | null
}

/** Falha de um pedido à AniList: erro HTTP, erro do GraphQL ou falha de rede. */
export class AniListError extends Error {
  /** Status HTTP. `undefined` quando o pedido nem teve resposta (falha de rede). */
  readonly status?: number

  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, options)
    this.name = 'AniListError'
    this.status = status
  }

  /**
   * Se vale repetir o pedido; o TanStack Query lê isto. Só ajuda se o problema for
   * passageiro: rede, limite de pedidos (429) ou servidor (5xx).
   */
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
    // Cancelado de propósito (o filtro mudou): cancelar não é falha, repassa como veio.
    if (signal?.aborted) throw error
    throw new AniListError('Não foi possível falar com a AniList.', undefined, { cause: error })
  }

  // Fronteira da API: o único `as` do cliente. Os tipos acima seguem a nulidade do
  // schema, então o resto do código trata cada campo que pode faltar. Corpo que não é
  // JSON (a página de erro de um proxy, por exemplo) vira `null`.
  const body = (await response.json().catch(() => null)) as AniListResponse | null

  const page = body?.data?.Page
  if (!response.ok || !page) {
    throw new AniListError(
      body?.errors?.[0]?.message ?? `A AniList respondeu com status ${response.status}.`,
      response.status,
    )
  }

  return {
    items: (page.media ?? []).filter((media) => media !== null).map(toAnime),
    page: page.pageInfo?.currentPage ?? request.page,
    hasNextPage: page.pageInfo?.hasNextPage === true,
  }
}

function toAnime(media: AniListMedia): Anime {
  return {
    id: media.id,
    // `||` e não `??`: romaji vazio também cai para o título preferido.
    title: media.title?.romaji || media.title?.userPreferred || '',
    // `extraLarge` (460 px) é a maior capa da AniList. As menores têm menos que os 280 px
    // do card mais estreito, então nunca servem.
    cover: {
      large: media.coverImage?.extraLarge ?? '',
      color: media.coverImage?.color ?? null,
    },
    genres: (media.genres ?? []).slice(0, 3),
    averageScore: media.averageScore,
  }
}
