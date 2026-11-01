import { describe, expect, it } from 'vitest'
import { isFormatFilter } from './formats'

describe('isFormatFilter', () => {
  it.each(['ALL', 'MOVIE', 'TV_SHORT'])('aceita o valor de um botão (%s)', (value) => {
    expect(isFormatFilter(value)).toBe(true)
  })

  it.each(['XYZ', 'movie', ''])('recusa um texto que não é botão (%j)', (value) => {
    expect(isFormatFilter(value)).toBe(false)
  })

  it('recusa null (parâmetro ausente na URL)', () => {
    expect(isFormatFilter(null)).toBe(false)
  })
})
