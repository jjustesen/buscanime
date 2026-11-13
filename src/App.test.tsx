import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { renderWithClient } from './test/renderWithClient'

// O conteúdo do header e do footer já é testado nas stories; aqui só a moldura da página.
// `renderWithClient` porque o App monta a página da lista, que busca com o TanStack Query.
beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('App', () => {
  it('monta as três regiões da página: header, conteúdo e footer', () => {
    renderWithClient(<App />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('mostra os detalhes quando a URL é /anime/<id>', async () => {
    window.history.replaceState(null, '', '/anime/1')
    renderWithClient(<App />)

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
