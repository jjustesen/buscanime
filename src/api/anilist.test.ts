import { describe, expect, it } from 'vitest'
import {
  captureVariables,
  respondNever,
  respondWithEmptyList,
  respondWithGraphQLErrors,
  respondWithMedia,
  respondWithNetworkError,
  respondWithStatus,
} from '../test/mocks/handlers'
import { server } from '../test/mocks/server'
import { AniListError, fetchAnimePage, shouldRetry, type AnimePageVariables } from './anilist'
import type { AnimePageRequest } from './types'

const firstPage: AnimePageRequest = { page: 1, format: null, search: '' }

// Roda o pedido e devolve as variáveis que chegaram ao "servidor".
async function sentVariables(request: AnimePageRequest): Promise<AnimePageVariables | undefined> {
  let sent: AnimePageVariables | undefined
  server.use(captureVariables((variables) => (sent = variables)))
  await fetchAnimePage(request)
  return sent
}

describe('fetchAnimePage: o pedido', () => {
  it('sem busca, pede os animes em alta, sem filtro de formato nem de texto', async () => {
    const sent = await sentVariables(firstPage)

    // Sem a chave `format`: na AniList, `format: null` não é "todos os formatos", é
    // "só animes sem formato" (anúncios que ainda não estrearam, sem nota).
    expect(sent).toEqual({
      page: 1,
      perPage: 12,
      search: null,
      sort: ['TRENDING_DESC'],
    })
  })

  it('com busca, tira os espaços das pontas e ordena por relevância', async () => {
    const sent = await sentVariables({ ...firstPage, search: '  naruto ' })

    expect(sent).toMatchObject({ search: 'naruto', sort: ['SEARCH_MATCH'] })
  })

  it('busca só com espaços vale como sem busca', async () => {
    const sent = await sentVariables({ ...firstPage, search: '   ' })

    expect(sent).toMatchObject({ search: null, sort: ['TRENDING_DESC'] })
  })

  it('manda o formato escolhido', async () => {
    const sent = await sentVariables({ ...firstPage, format: 'MOVIE' })

    expect(sent).toMatchObject({ format: 'MOVIE' })
  })
})

describe('fetchAnimePage: a resposta', () => {
  it('converte o anime da AniList para o formato da tela', async () => {
    server.use(
      respondWithMedia([
        {
          id: 42,
          title: { romaji: 'Sousou no Frieren', userPreferred: 'Frieren' },
          coverImage: { extraLarge: 'large.jpg', color: '#e4a15d' },
          genres: ['Adventure', 'Drama', 'Fantasy', 'Slice of Life', 'Comedy'],
          averageScore: 91,
        },
      ]),
    )

    const result = await fetchAnimePage(firstPage)

    expect(result.items).toEqual([
      {
        id: 42,
        title: 'Sousou no Frieren',
        cover: { large: 'large.jpg', color: '#e4a15d' },
        genres: ['Adventure', 'Drama', 'Fantasy'],
        averageScore: 91,
      },
    ])
  })

  // `||` e não `??` no cliente: string vazia também conta como "sem romaji".
  it.each([null, ''])('usa o título userPreferred quando o romaji vem %j', async (romaji) => {
    server.use(
      respondWithMedia([
        {
          id: 1,
          title: { romaji, userPreferred: 'Frieren' },
          coverImage: { extraLarge: 'b.jpg', color: null },
          genres: [],
          averageScore: null,
        },
      ]),
    )

    const result = await fetchAnimePage(firstPage)

    expect(result.items[0]).toMatchObject({ title: 'Frieren', averageScore: null })
  })

  it('aguenta campos opcionais nulos sem quebrar', async () => {
    server.use(
      respondWithMedia([
        { id: 7, title: null, coverImage: null, genres: null, averageScore: null },
        null,
      ]),
    )

    const result = await fetchAnimePage(firstPage)

    expect(result.items).toEqual([
      {
        id: 7,
        title: '',
        cover: { large: '', color: null },
        genres: [],
        averageScore: null,
      },
    ])
  })

  it('devolve a página e o hasNextPage que a AniList informou', async () => {
    const first = await fetchAnimePage(firstPage)
    const second = await fetchAnimePage({ ...firstPage, page: 2 })

    expect(first).toMatchObject({ page: 1, hasNextPage: true })
    expect(second).toMatchObject({ page: 2, hasNextPage: false })
  })

  it('devolve uma página vazia quando nada foi encontrado', async () => {
    server.use(respondWithEmptyList())

    const result = await fetchAnimePage({ ...firstPage, search: 'xyz' })

    expect(result).toEqual({ items: [], page: 1, hasNextPage: false })
  })
})

describe('fetchAnimePage: os erros', () => {
  it.each([429, 500, 503])(
    'status %i vira um AniListError que vale tentar de novo',
    async (status) => {
      server.use(respondWithStatus(status))

      const error = await fetchAnimePage(firstPage).catch((e: unknown) => e)

      expect(error).toBeInstanceOf(AniListError)
      expect(error).toMatchObject({ status, retryable: true })
    },
  )

  it('status 400 vira um AniListError que não adianta repetir', async () => {
    server.use(respondWithStatus(400))

    const error = await fetchAnimePage(firstPage).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(AniListError)
    expect(error).toMatchObject({ status: 400, retryable: false })
  })

  it('erro do GraphQL com status 200 e sem data vira AniListError com a mensagem', async () => {
    server.use(respondWithGraphQLErrors('Invalid format'))

    const error = await fetchAnimePage(firstPage).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(AniListError)
    expect(error).toMatchObject({ message: 'Invalid format', status: 200, retryable: false })
  })

  it('falha de rede vira um AniListError sem status, que vale tentar de novo', async () => {
    server.use(respondWithNetworkError())

    const error = await fetchAnimePage(firstPage).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(AniListError)
    expect(error).toMatchObject({ status: undefined, retryable: true })
  })

  it('corpo de erro que não é JSON vira AniListError pelo status', async () => {
    server.use(respondWithStatus(502, '<html>Bad Gateway</html>'))

    const error = await fetchAnimePage(firstPage).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(AniListError)
    expect(error).toMatchObject({ status: 502, retryable: true })
  })

  it('pedido cancelado repassa o erro de cancelamento, sem virar AniListError', async () => {
    // A resposta nunca chega; o teste cancela o pedido no meio.
    server.use(respondNever())
    const controller = new AbortController()

    const pending = fetchAnimePage(firstPage, controller.signal).catch((e: unknown) => e)
    controller.abort()
    const error = await pending

    expect(error).not.toBeInstanceOf(AniListError)
    expect(error).toMatchObject({ name: 'AbortError' })
  })
})

describe('shouldRetry', () => {
  // `failureCount` é quantas vezes o pedido já falhou antes desta: 0 na primeira falha.
  it.each([
    ['falha de rede', new AniListError('rede')],
    ['429', new AniListError('limite', 429)],
    ['500', new AniListError('servidor', 500)],
    ['503', new AniListError('servidor', 503)],
  ])('%s: tenta de novo até 2 vezes', (_, error) => {
    expect(shouldRetry(0, error)).toBe(true)
    expect(shouldRetry(1, error)).toBe(true)
    expect(shouldRetry(2, error)).toBe(false)
  })

  it.each([
    ['400', new AniListError('pedido inválido', 400)],
    ['erro do GraphQL com status 200', new AniListError('Invalid format', 200)],
    ['erro que não é da AniList', new TypeError('bug no código')],
  ])('%s: nunca tenta de novo', (_, error) => {
    expect(shouldRetry(0, error)).toBe(false)
  })
})
