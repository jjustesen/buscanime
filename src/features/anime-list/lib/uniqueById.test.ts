import { describe, expect, it } from 'vitest'
import { uniqueById } from './uniqueById'

describe('uniqueById', () => {
  it('mantém a lista como está quando não há repetidos', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]

    expect(uniqueById(items)).toEqual(items)
  })

  it('tira os repetidos e mantém a primeira vez que cada id aparece', () => {
    const items = [
      { id: 1, page: 1 },
      { id: 2, page: 1 },
      { id: 1, page: 2 },
      { id: 3, page: 2 },
    ]

    expect(uniqueById(items)).toEqual([
      { id: 1, page: 1 },
      { id: 2, page: 1 },
      { id: 3, page: 2 },
    ])
  })

  it('devolve uma lista vazia para uma lista vazia', () => {
    expect(uniqueById([])).toEqual([])
  })
})
