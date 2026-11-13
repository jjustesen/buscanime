import { describe, expect, it } from 'vitest'
import { animePath, parseRoute } from './route'

describe('parseRoute', () => {
  it('a raiz é a lista', () => {
    expect(parseRoute('/')).toEqual({ name: 'list' })
  })

  it('/anime/<id> é a página de detalhes, com ou sem barra no fim', () => {
    expect(parseRoute('/anime/16498')).toEqual({ name: 'detail', id: 16498 })
    expect(parseRoute('/anime/16498/')).toEqual({ name: 'detail', id: 16498 })
  })

  it('caminho desconhecido ou com ID que não é número cai na lista', () => {
    expect(parseRoute('/anime/abc')).toEqual({ name: 'list' })
    expect(parseRoute('/anime/')).toEqual({ name: 'list' })
    expect(parseRoute('/outra-coisa')).toEqual({ name: 'list' })
  })

  it('animePath é o inverso de parseRoute', () => {
    expect(parseRoute(animePath(42))).toEqual({ name: 'detail', id: 42 })
  })
})
