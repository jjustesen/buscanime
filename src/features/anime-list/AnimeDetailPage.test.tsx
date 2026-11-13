import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { animeHighScore } from '../../test/mocks/fixtures'
import { renderWithClient } from '../../test/renderWithClient'
import { AnimeDetailPage } from './AnimeDetailPage'

beforeEach(() => {
  window.history.replaceState(null, '', `/anime/${animeHighScore.id}`)
})

describe('AnimeDetailPage', () => {
  it('mostra carregando e depois título, gêneros, nota e sinopse do anime', async () => {
    renderWithClient(<AnimeDetailPage id={animeHighScore.id} />)

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(animeHighScore.title)
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(
      animeHighScore.genres,
    )
    expect(screen.getByText(`${animeHighScore.averageScore}%`)).toBeInTheDocument()
    expect(screen.getByText(/Segundo parágrafo da sinopse/)).toBeInTheDocument()
  })

  it('manda o foco para o título quando o anime chega', async () => {
    renderWithClient(<AnimeDetailPage id={animeHighScore.id} />)

    expect(await screen.findByRole('heading', { level: 1 })).toHaveFocus()
  })

  it('avisa quando o anime não existe', async () => {
    renderWithClient(<AnimeDetailPage id={999999} />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar')
  })

  it('"Voltar para a lista" leva para a raiz', async () => {
    const user = userEvent.setup()
    renderWithClient(<AnimeDetailPage id={animeHighScore.id} />)

    await user.click(screen.getByRole('link', { name: 'Voltar para a lista' }))

    expect(window.location.pathname).toBe('/')
  })
})
