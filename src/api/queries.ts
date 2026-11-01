// Uma página de animes. A AniList ignora argumento nulo, então `search: null` e
// `format: null` significam "sem filtro". `isAdult: false` tira o conteúdo adulto.
export const ANIME_PAGE_QUERY = `
  query AnimePage($page: Int, $perPage: Int, $search: String, $format: MediaFormat, $sort: [MediaSort]) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media(type: ANIME, isAdult: false, search: $search, format: $format, sort: $sort) {
        id
        title {
          romaji
          userPreferred
        }
        coverImage {
          extraLarge
          color
        }
        genres
        averageScore
      }
    }
  }
`
