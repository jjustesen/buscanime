import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { respondNever } from '../../../test/mocks/handlers'
import { server } from '../../../test/mocks/server'
import type { ListParams } from '../types'
import { useAnimeList } from './useAnimeList'

const allFormats: ListParams = { format: 'ALL', search: '' }

// Um QueryClient novo por teste, para um não ver o cache do outro.
function renderUseAnimeList(params: ListParams) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return renderHook(() => useAnimeList(params), { wrapper })
}

describe('useAnimeList', () => {
  it('devolve a primeira página como lista pronta, com próxima página', async () => {
    // Act
    const { result } = renderUseAnimeList(allFormats)

    // Assert
    expect(result.current.status).toBe('pending')
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.animes).toHaveLength(12)
    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.loadMoreFailed).toBe(false)
    expect(result.current.refreshFailed).toBe(false)
  })

  it('"Ver mais" não roda enquanto outro pedido está no ar, para não cancelá-lo', async () => {
    // Arrange: a lista carregou e uma atualização ficou pendurada no servidor.
    const { result } = renderUseAnimeList(allFormats)
    await waitFor(() => expect(result.current.status).toBe('success'))
    let requests = 0
    server.use(respondNever())
    server.events.on('request:start', () => requests++)
    act(() => result.current.retry())
    await waitFor(() => expect(requests).toBe(1))

    // Act
    let loaded: boolean | undefined
    await act(async () => {
      loaded = await result.current.loadMore()
    })

    // Assert: nenhum pedido novo; a atualização segue no ar.
    expect(loaded).toBe(false)
    expect(requests).toBe(1)
    server.events.removeAllListeners()
  })
})
