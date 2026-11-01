import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

// O conteúdo do header e do footer já é testado nas stories; aqui só a moldura da página.
describe('App', () => {
  it('monta as três regiões da página: header, conteúdo e footer', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
