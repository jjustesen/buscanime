import { delay, http, HttpResponse, type PathParams } from 'msw'
import {
  ANILIST_ENDPOINT,
  type AniListMedia,
  type AnimeDetailVariables,
  type AnimePageVariables,
} from '../../api/anilist'
import type { Anime } from '../../api/types'
import { animeFixtures, fixtureDescription } from './fixtures'

/** Corpo do `POST` que o `fetchAnimePage` manda à AniList. */
interface AnimePageRequestBody {
  /** Texto da query GraphQL. O mock não lê; só existe uma query no app. */
  query: string
  /** Variáveis da query: página, busca, formato e ordem. */
  variables: AnimePageVariables
}

// Monta a resposta no formato da AniList, para o teste passar pela conversão de verdade.
function pageResponse(media: (AniListMedia | null)[], currentPage = 1, hasNextPage = false) {
  return { data: { Page: { pageInfo: { currentPage, hasNextPage }, media } } }
}

// O caminho inverso do `toAnime` de anilist.ts: de `Anime` para o formato cru da API.
function toAniListMedia(anime: Anime): AniListMedia {
  return {
    id: anime.id,
    title: { romaji: anime.title, userPreferred: anime.title },
    coverImage: { extraLarge: anime.cover.large, color: anime.cover.color },
    genres: anime.genres,
    averageScore: anime.averageScore,
  }
}

// Filtra as fixtures como a AniList faria: formato exato e busca no título, sem
// diferenciar maiúsculas. Depois corta a página pedida. Sem a chave `format`, vale
// qualquer formato; `format: null` só casa com "sem formato", que nenhuma fixture tem.
function fixturePage({ page, perPage, format, search }: AnimePageVariables) {
  const term = search?.toLowerCase()
  const matches = animeFixtures.filter(
    (fixture) =>
      (format === undefined || fixture.format === format) &&
      (!term || fixture.anime.title.toLowerCase().includes(term)),
  )
  const start = (page - 1) * perPage
  const media = matches
    .slice(start, start + perPage)
    .map((fixture) => toAniListMedia(fixture.anime))
  return pageResponse(media, page, start + perPage < matches.length)
}

// As duas queries do app vão para o mesmo endereço; o nome da operação diz qual é.
function isDetailQuery(query: string) {
  return query.includes('query AnimeDetail')
}

// Base dos handlers de lista: responde ao POST da AniList com o corpo já tipado. Pedido de
// detalhes não é daqui: devolve `undefined` e o MSW segue para o próximo handler.
function anilist(resolve: (variables: AnimePageVariables) => Response | Promise<Response>) {
  return http.post<PathParams, AnimePageRequestBody>(ANILIST_ENDPOINT, async ({ request }) => {
    // Cópia: o corpo só pode ser lido uma vez, e o outro handler também o lê.
    const body = await request.clone().json()
    if (isDetailQuery(body.query)) return undefined
    return resolve(body.variables)
  })
}

/** Corpo do `POST` da query de detalhes. */
interface AnimeDetailRequestBody {
  /** Texto da query GraphQL; o mock só olha o nome da operação. */
  query: string
  /** Variáveis da query: o ID do anime. */
  variables: AnimeDetailVariables
}

// Detalhes de um anime das fixtures, pelo ID, com sinopse. ID que não existe responde como
// a AniList: status 404 e `data.Media` nulo.
function animeDetail() {
  return http.post<PathParams, AnimeDetailRequestBody>(ANILIST_ENDPOINT, async ({ request }) => {
    // Cópia: o corpo só pode ser lido uma vez, e o outro handler também o lê.
    const body = await request.clone().json()
    if (!isDetailQuery(body.query)) return undefined
    const fixture = animeFixtures.find(({ anime }) => anime.id === body.variables.id)
    if (!fixture) {
      return HttpResponse.json(
        { data: { Media: null }, errors: [{ message: 'Not Found.', status: 404 }] },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      data: {
        Media: { ...toAniListMedia(fixture.anime), description: fixtureDescription(fixture.anime) },
      },
    })
  })
}

// Handlers padrão: as 24 fixtures, filtradas e paginadas, e os detalhes de cada uma.
export const handlers = [
  anilist((variables) => HttpResponse.json(fixturePage(variables))),
  animeDetail(),
]

// Os helpers abaixo trocam o handler num teste: `server.use(respondWithStatus(429))`.

// Responde como o padrão e entrega as variáveis recebidas, para o teste conferir o pedido.
export function captureVariables(onRequest: (variables: AnimePageVariables) => void) {
  return anilist((variables) => {
    onRequest(variables)
    return HttpResponse.json(fixturePage(variables))
  })
}

// Erro HTTP (429, 500, 400...). Sem `body`, usa o corpo de erro que a AniList manda;
// com `body`, responde esse texto cru (a página HTML de um proxy, por exemplo).
export function respondWithStatus(status: number, body?: string) {
  return anilist(() =>
    body === undefined
      ? HttpResponse.json(
          { data: null, errors: [{ message: `HTTP ${status}`, status }] },
          { status },
        )
      : new HttpResponse(body, { status, headers: { 'Content-Type': 'text/html' } }),
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
export function respondWithMedia(media: (AniListMedia | null)[]) {
  return anilist(() => HttpResponse.json(pageResponse(media)))
}

// Várias páginas escolhidas pelo teste: o pedido da página n recebe `pages[n - 1]`. Serve
// para simular a AniList repetindo um anime entre páginas.
export function respondWithPages(pages: Anime[][]) {
  return anilist(({ page }) =>
    HttpResponse.json(
      pageResponse((pages[page - 1] ?? []).map(toAniListMedia), page, page < pages.length),
    ),
  )
}

// Falha de rede: o `fetch` rejeita sem resposta nenhuma.
export function respondWithNetworkError() {
  return anilist(() => HttpResponse.error())
}

// A resposta nunca chega: serve para o teste cancelar o pedido no meio. Não passa pelo
// `anilist` porque não lê o corpo nem devolve `Response`.
export function respondNever() {
  return http.post(ANILIST_ENDPOINT, () => delay('infinite'))
}

// A página `page` nunca responde; as outras respondem como o padrão, mas sempre dizendo que
// há uma próxima página. Serve para deixar o "Ver mais" pendurado em qualquer filtro, mesmo
// num formato que nas fixtures cabe numa página só.
export function respondNeverOnPage(page: number) {
  return anilist(async (variables) => {
    if (variables.page === page) await delay('infinite')
    const body = fixturePage(variables)
    body.data.Page.pageInfo.hasNextPage = true
    return HttpResponse.json(body)
  })
}

// Responde como o padrão, mas só depois que `gate` resolver: o teste decide quando a
// resposta chega e confere a tela no meio do caminho.
export function respondAfter(gate: Promise<void>) {
  return anilist(async (variables) => {
    await gate
    return HttpResponse.json(fixturePage(variables))
  })
}
