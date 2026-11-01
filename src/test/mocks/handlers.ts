import { http, HttpResponse, type PathParams } from 'msw'
import { ANILIST_ENDPOINT, type AnimePageVariables } from '../../api/anilist'
import type { Anime } from '../../api/types'
import { animeFixtures } from './fixtures'

/** Corpo do `POST` que o `fetchAnimePage` manda à AniList. */
export interface AnimePageRequestBody {
  /** Texto da query GraphQL. O mock não lê; só existe uma query no app. */
  query: string
  /** Variáveis da query: página, busca, formato e ordem. */
  variables: AnimePageVariables
}

// Monta a resposta no formato da AniList, para o teste passar pela conversão de verdade.
export function pageResponse(media: unknown[], currentPage = 1, hasNextPage = false) {
  return { data: { Page: { pageInfo: { currentPage, hasNextPage }, media } } }
}

// O caminho inverso do `toAnime` de anilist.ts: de `Anime` para o formato cru da API.
function toAniListMedia(anime: Anime) {
  return {
    id: anime.id,
    title: { romaji: anime.title, userPreferred: anime.title },
    coverImage: {
      large: anime.cover.medium,
      extraLarge: anime.cover.large,
      color: anime.cover.color,
    },
    genres: anime.genres,
    averageScore: anime.averageScore,
  }
}

// Filtra as fixtures como a AniList faria: formato exato e busca no título, sem
// diferenciar maiúsculas. Depois corta a página pedida.
function fixturePage({ page, perPage, format, search }: AnimePageVariables) {
  const term = search?.toLowerCase()
  const matches = animeFixtures.filter(
    (fixture) =>
      (format === null || fixture.format === format) &&
      (!term || fixture.anime.title.toLowerCase().includes(term)),
  )
  const start = (page - 1) * perPage
  const media = matches
    .slice(start, start + perPage)
    .map((fixture) => toAniListMedia(fixture.anime))
  return pageResponse(media, page, start + perPage < matches.length)
}

// Base dos handlers abaixo: responde ao POST da AniList com o corpo já tipado.
function anilist(resolve: (variables: AnimePageVariables) => Response | Promise<Response>) {
  return http.post<PathParams, AnimePageRequestBody>(ANILIST_ENDPOINT, async ({ request }) => {
    const body = await request.json()
    return resolve(body.variables)
  })
}

// Handler padrão: as 24 fixtures, filtradas e paginadas.
export const handlers = [anilist((variables) => HttpResponse.json(fixturePage(variables)))]

// Os helpers abaixo trocam o handler num teste: `server.use(respondWithStatus(429))`.

// Responde como o padrão e entrega as variáveis recebidas, para o teste conferir o pedido.
export function captureVariables(onRequest: (variables: AnimePageVariables) => void) {
  return anilist((variables) => {
    onRequest(variables)
    return HttpResponse.json(fixturePage(variables))
  })
}

// Erro HTTP (429, 500, 400...) com o corpo de erro que a AniList usa.
export function respondWithStatus(status: number) {
  return anilist(() =>
    HttpResponse.json({ data: null, errors: [{ message: `HTTP ${status}`, status }] }, { status }),
  )
}

// Erro do GraphQL: status 200, sem `data` e com `errors`.
export function respondWithGraphQLErrors(message: string) {
  return anilist(() => HttpResponse.json({ data: null, errors: [{ message }] }))
}

// Busca sem resultado.
export function respondWithEmptyList() {
  return anilist(() => HttpResponse.json(pageResponse([])))
}

// Uma página com animes crus escolhidos pelo teste (campos nulos, gêneros demais...).
export function respondWithMedia(media: unknown[]) {
  return anilist(() => HttpResponse.json(pageResponse(media)))
}

// Falha de rede: o `fetch` rejeita sem resposta nenhuma.
export function respondWithNetworkError() {
  return anilist(() => HttpResponse.error())
}
