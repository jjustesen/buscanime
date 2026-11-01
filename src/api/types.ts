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

/** Anime já convertido da resposta da AniList para o formato que a tela usa. */
export interface Anime {
  /** ID da AniList. Único, usado como `key` e para remover repetidos entre páginas. */
  id: number
  /** Título em romaji, como no Figma. Cai para `userPreferred` se vier vazio. */
  title: string
  /** Capa do anime e a cor média dela. */
  cover: AnimeCover
  /** Até 3 gêneros, na ordem da AniList. Pode ser vazio. */
  genres: string[]
  /** Nota média de 0 a 100. `null` quando a AniList ainda não tem votos suficientes. */
  averageScore: number | null
}

/**
 * Capa do anime. A AniList não redimensiona e todo card da grade tem pelo menos 280 px,
 * então só a maior capa serve.
 */
export interface AnimeCover {
  /**
   * URL da capa com 460 px de largura (`coverImage.extraLarge` na API), a maior que a
   * AniList tem.
   */
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
