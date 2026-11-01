import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('mostra o logo no header e o aviso de direitos no footer', () => {
    render(<App />)

    const header = screen.getByRole('banner')
    expect(within(header).getByRole('heading', { level: 1, name: 'BUSCANIME' })).toBeInTheDocument()

    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByText('TODOS OS DIREITOS RESERVADOS')).toBeInTheDocument()
  })
})
