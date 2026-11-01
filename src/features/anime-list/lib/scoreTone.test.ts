import { describe, expect, it } from 'vitest'
import { scoreTone } from './scoreTone'

describe('scoreTone', () => {
  // Os dois lados de cada limite descrito no JSDoc de scoreTone.
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
