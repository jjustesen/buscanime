import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { createQueryClient, type QueryDefaultsOverrides } from '../queryClient'

// Um QueryClient novo por teste, para um não ver o cache do outro, com a configuração do
// app. Sem novas tentativas: o teste de erro mostra a mensagem na hora, sem esperar os
// retries do app (a regra deles tem teste próprio, o de `shouldRetry`).
export function createTestQueryClient(overrides: QueryDefaultsOverrides = {}): QueryClient {
  return createQueryClient({ retry: false, ...overrides })
}

/** Props do `wrapper` que a Testing Library monta em volta do que o teste renderiza. */
interface WrapperProps {
  /** O que o teste renderiza (a página, ou o componente de teste do `renderHook`). */
  children: ReactNode
}

// Embrulha no provider do TanStack Query; serve de `wrapper` do `render` e do `renderHook`.
export function withClient(client: QueryClient) {
  return function Wrapper({ children }: WrapperProps) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

// Renderiza com um QueryClient novo. `overrides` troca opções do app só neste teste
// (`staleTime: 0` para simular cache vencido, por exemplo).
export function renderWithClient(ui: ReactElement, overrides?: QueryDefaultsOverrides) {
  return render(ui, { wrapper: withClient(createTestQueryClient(overrides)) })
}
