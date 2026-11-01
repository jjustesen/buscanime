import { describe, expect, it } from 'vitest'
import { scoreTone } from './scoreTone'

describe('scoreTone', () => {
  // Os limites do enunciado: abaixo de 50, de 50 a 80 e acima de 80.
  it.each([
    [0, 'low'],
    [49, 'low'],
    [50, 'mid'],
    [80, 'mid'],
    [81, 'high'],
    [100, 'high'],
  ])('nota %i vira %s', (score, tone) => {
    expect(scoreTone(score)).toBe(tone)
  })
})
