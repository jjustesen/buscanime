// Uma página de animes. `search: null` significa "sem busca"; o formato, quando não
// há filtro, nem é enviado (ver fetchAnimePage). `isAdult: false` tira o conteúdo adulto.
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

// Um anime só, pelo ID. `asHtml: false` pede texto sem HTML, mas a AniList ainda deixa
// `<br>` e `<i>` no meio; a limpeza final fica em `cleanDescription` (anilist.ts).
export const ANIME_DETAIL_QUERY = `
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
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
      description(asHtml: false)
    }
  }
`
