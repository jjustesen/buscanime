import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import type { AnimePageVariables } from '../../api/anilist'
import { animeFixtures } from '../../test/mocks/fixtures'
import { captureVariables, respondWithPages, respondWithStatus } from '../../test/mocks/handlers'
import { server } from '../../test/mocks/server'
import { renderWithClient } from '../../test/renderWithClient'
import { AnimeListPage } from './AnimeListPage'

// O título de cada card é um h2, então contar os h2 é contar os cards.
function cardTitles() {
  return screen.queryAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
}

function fixtureTitles(from: number, to: number) {
  return animeFixtures.slice(from, to).map((fixture) => fixture.anime.title)
}

// O jsdom guarda a URL entre testes; cada teste começa na raiz, sem filtro.
beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('AnimeListPage', () => {
  it('mostra os esqueletos e depois os 12 cards da primeira página', async () => {
    renderWithClient(<AnimeListPage />)

    expect(screen.getByText('Carregando animes...')).toBeInTheDocument()
    expect(await screen.findByText('12 animes carregados')).toBeInTheDocument()
    expect(cardTitles()).toEqual(fixtureTitles(0, 12))
  })

  it('filtra por formato: marca o botão, escreve na URL e mostra só aquele formato', async () => {
    const user = userEvent.setup()
    renderWithClient(<AnimeListPage />)
    await screen.findByText('12 animes carregados')

    await user.click(screen.getByRole('button', { name: 'Movie' }))

    expect(screen.getByRole('button', { name: 'Movie' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All Formats' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(window.location.search).toBe('?format=MOVIE')
    expect(await screen.findByText('5 animes carregados')).toBeInTheDocument()
    const movies = animeFixtures.filter((fixture) => fixture.format === 'MOVIE')
    expect(cardTitles()).toEqual(movies.map((fixture) => fixture.anime.title))
  })

  it('digitar não faz pedido; só o botão "Buscar" envia a busca', async () => {
    const sent: AnimePageVariables[] = []
    server.use(captureVariables((variables) => sent.push(variables)))
    const user = userEvent.setup()
    renderWithClient(<AnimeListPage />)
    await screen.findByText('12 animes carregados')

    await user.type(screen.getByRole('searchbox', { name: 'Buscar anime' }), 'naruto')
    expect(sent).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() => expect(sent).toHaveLength(2))
    expect(sent[1]).toMatchObject({ search: 'naruto', page: 1 })
    expect(window.location.search).toBe('?search=naruto')
  })

  it('Enter envia a busca e o foco continua no campo', async () => {
    const user = userEvent.setup()
    renderWithClient(<AnimeListPage />)
    await screen.findByText('12 animes carregados')
    const field = screen.getByRole('searchbox', { name: 'Buscar anime' })

    await user.type(field, 'Hoshi{Enter}')

    expect(await screen.findByText('3 animes carregados')).toBeInTheDocument()
    expect(field).toHaveFocus()
  })

  it('"Ver mais" soma 12 cards, foca o 13º e some na última página', async () => {
    const user = userEvent.setup()
    renderWithClient(<AnimeListPage />)
    await screen.findByText('12 animes carregados')

    await user.click(screen.getByRole('button', { name: 'Ver mais' }))

    expect(await screen.findByText('24 animes carregados')).toBeInTheDocument()
    expect(cardTitles()).toEqual(fixtureTitles(0, 24))
    const thirteenth = screen.getByRole('heading', { name: animeFixtures[12].anime.title })
    await waitFor(() => expect(thirteenth.closest('li')).toHaveFocus())
    expect(screen.queryByRole('button', { name: 'Ver mais' })).not.toBeInTheDocument()
  })

  it('não repete um anime que a AniList devolve de novo na página seguinte', async () => {
    const animes = animeFixtures.map((fixture) => fixture.anime)
    // A página 2 começa com o último anime da página 1, como a ordem TRENDING pode fazer.
    server.use(respondWithPages([animes.slice(0, 12), animes.slice(11, 14)]))
    const user = userEvent.setup()
    renderWithClient(<AnimeListPage />)
    await screen.findByText('12 animes carregados')

    await user.click(screen.getByRole('button', { name: 'Ver mais' }))

    expect(await screen.findByText('14 animes carregados')).toBeInTheDocument()
    expect(cardTitles()).toEqual(fixtureTitles(0, 14))
    // O foco vai para o primeiro card realmente novo, não para o repetido.
    const firstNew = screen.getByRole('heading', { name: animes[12].title })
    await waitFor(() => expect(firstNew.closest('li')).toHaveFocus())
  })

  it('erro no "Ver mais" mantém os cards e deixa tentar de novo pelo mesmo botão', async () => {
    const user = userEvent.setup()
    renderWithClient(<AnimeListPage />)
    await screen.findByText('12 animes carregados')
    server.use(respondWithStatus(500))

    await user.click(screen.getByRole('button', { name: 'Ver mais' }))

    expect(await screen.findByText(/Não foi possível carregar mais animes/)).toBeInTheDocument()
    expect(cardTitles()).toEqual(fixtureTitles(0, 12))

    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Ver mais' }))

    expect(await screen.findByText('24 animes carregados')).toBeInTheDocument()
  })

  it('falha ao atualizar uma lista na tela mantém os cards e não fala do "Ver mais"', async () => {
    // Cache vencido na hora: voltar a um filtro já visto pede a lista de novo.
    const user = userEvent.setup()
    renderWithClient(<AnimeListPage />, { staleTime: 0 })
    await screen.findByText('12 animes carregados')
    await user.click(screen.getByRole('button', { name: 'Ver mais' }))
    await screen.findByText('24 animes carregados')
    await user.click(screen.getByRole('button', { name: 'Movie' }))
    await screen.findByText('5 animes carregados')
    server.use(respondWithStatus(500))

    await user.click(screen.getByRole('button', { name: 'All Formats' }))

    expect(await screen.findByText('Não foi possível atualizar a lista.')).toBeInTheDocument()
    expect(screen.queryByText(/Ver mais/)).not.toBeInTheDocument()
    expect(cardTitles()).toEqual(fixtureTitles(0, 24))

    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByText('24 animes carregados')).toBeInTheDocument()
    expect(screen.queryByText('Não foi possível atualizar a lista.')).not.toBeInTheDocument()
  })

  it('lista vazia mostra a mensagem, e "Limpar busca" volta à lista', async () => {
    window.history.replaceState(null, '', '/?search=zzz')
    const user = userEvent.setup()
    renderWithClient(<AnimeListPage />)

    expect(await screen.findByText('Nenhum anime encontrado para "zzz".')).toBeInTheDocument()
    expect(cardTitles()).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Limpar busca' }))

    expect(await screen.findByText('12 animes carregados')).toBeInTheDocument()
    expect(window.location.search).toBe('')
    expect(screen.getByRole('searchbox', { name: 'Buscar anime' })).toHaveValue('')
  })

  it('erro mostra a mensagem, e "Tentar de novo" carrega os cards', async () => {
    server.use(respondWithStatus(500))
    const user = userEvent.setup()
    renderWithClient(<AnimeListPage />)

    expect(await screen.findByText('Não foi possível carregar os animes.')).toBeInTheDocument()

    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByText('12 animes carregados')).toBeInTheDocument()
  })

  it('abrir a página com filtro e busca na URL já começa com os dois preenchidos', () => {
    window.history.replaceState(null, '', '/?format=OVA&search=x')

    renderWithClient(<AnimeListPage />)

    expect(screen.getByRole('button', { name: 'OVA' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('searchbox', { name: 'Buscar anime' })).toHaveValue('x')
  })

  it('o Voltar do navegador devolve o campo de busca ao valor anterior', async () => {
    const user = userEvent.setup()
    renderWithClient(<AnimeListPage />)
    await screen.findByText('12 animes carregados')
    const field = screen.getByRole('searchbox', { name: 'Buscar anime' })
    await user.type(field, 'Hoshi{Enter}')
    await screen.findByText('3 animes carregados')

    act(() => window.history.back())

    await waitFor(() => expect(field).toHaveValue(''))
    expect(await screen.findByText('12 animes carregados')).toBeInTheDocument()
  })
})
