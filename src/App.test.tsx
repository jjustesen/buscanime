import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { renderWithClient } from './test/renderWithClient'

// O conteúdo do header e do footer já é testado nas stories; aqui só a moldura da página.
// `renderWithClient` porque o App monta a página da lista, que busca com o TanStack Query.
describe('App', () => {
  it('monta as três regiões da página: header, conteúdo e footer', () => {
    renderWithClient(<App />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
