import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { parseListParams, useListParams } from './useListParams'

// O jsdom guarda a URL entre testes; cada teste começa na raiz, sem filtro.
beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('parseListParams', () => {
  it('usa os valores padrão quando a URL não tem parâmetros', () => {
    expect(parseListParams('')).toEqual({ format: 'ALL', search: '' })
  })

  it('lê o formato e a busca da URL', () => {
    expect(parseListParams('?format=MOVIE&search=naruto')).toEqual({
      format: 'MOVIE',
      search: 'naruto',
    })
  })

  it('cai em ALL quando o formato da URL não é um botão', () => {
    expect(parseListParams('?format=XYZ')).toEqual({ format: 'ALL', search: '' })
  })
})

describe('useListParams', () => {
  it('começa com o que já está na URL', () => {
    // Arrange
    window.history.replaceState(null, '', '/?format=OVA&search=eva')

    // Act
    const { result } = renderHook(() => useListParams())

    // Assert
    expect(result.current[0]).toEqual({ format: 'OVA', search: 'eva' })
  })

  it('escreve os filtros na URL e devolve o novo valor', () => {
    // Arrange
    const { result } = renderHook(() => useListParams())

    // Act
    act(() => result.current[1]({ format: 'MOVIE', search: 'naruto' }))

    // Assert
    expect(window.location.search).toBe('?format=MOVIE&search=naruto')
    expect(result.current[0]).toEqual({ format: 'MOVIE', search: 'naruto' })
  })

  it('não escreve os valores padrão e mantém o caminho limpo', () => {
    // Arrange
    window.history.replaceState(null, '', '/?format=TV')
    const { result } = renderHook(() => useListParams())

    // Act
    act(() => result.current[1]({ format: 'ALL', search: '   ' }))

    // Assert
    expect(window.location.href).toBe(`${window.location.origin}/`)
    expect(result.current[0]).toEqual({ format: 'ALL', search: '' })
  })

  it('tira os espaços das pontas da busca antes de escrever', () => {
    // Arrange
    const { result } = renderHook(() => useListParams())

    // Act
    act(() => result.current[1]({ format: 'ALL', search: '  one piece  ' }))

    // Assert
    expect(window.location.search).toBe('?search=one+piece')
    expect(result.current[0].search).toBe('one piece')
  })

  it('não cria entrada no histórico quando a URL não muda', () => {
    // Arrange
    const { result } = renderHook(() => useListParams())
    act(() => result.current[1]({ format: 'TV', search: '' }))
    const lengthBefore = window.history.length

    // Act
    act(() => result.current[1]({ format: 'TV', search: '' }))

    // Assert
    expect(window.history.length).toBe(lengthBefore)
  })

  it('volta ao valor anterior com o botão Voltar do navegador', async () => {
    // Arrange
    const { result } = renderHook(() => useListParams())
    act(() => result.current[1]({ format: 'MOVIE', search: '' }))
    act(() => result.current[1]({ format: 'TV', search: '' }))

    // Act
    act(() => window.history.back())

    // Assert: o jsdom dispara o popstate de forma assíncrona.
    await waitFor(() => expect(result.current[0].format).toBe('MOVIE'))
  })

  it('avisa todas as instâncias do hook quando uma delas muda a URL', () => {
    // Arrange
    const writer = renderHook(() => useListParams())
    const reader = renderHook(() => useListParams())

    // Act
    act(() => writer.result.current[1]({ format: 'SPECIAL', search: 'x' }))

    // Assert
    expect(reader.result.current[0]).toEqual({ format: 'SPECIAL', search: 'x' })
  })
})
