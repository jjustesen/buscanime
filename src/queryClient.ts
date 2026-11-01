import { QueryClient, type DefaultOptions } from '@tanstack/react-query'
import { shouldRetry } from './api/anilist'

/** Opções de query que um chamador troca por cima das do app (os testes, por exemplo). */
export type QueryDefaultsOverrides = NonNullable<DefaultOptions['queries']>

// A configuração do TanStack Query do app, num lugar só: o `main.tsx` usa como está, e os
// testes trocam só o que precisam (desligar as novas tentativas), para testar o resto da
// configuração de verdade.
export function createQueryClient(overrides: QueryDefaultsOverrides = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Voltar a um filtro já visto nos últimos 5 minutos usa o cache, sem novo pedido.
        staleTime: 5 * 60_000,
        // A AniList limita a 30 pedidos por minuto; trocar de aba não precisa buscar de novo.
        refetchOnWindowFocus: false,
        retry: shouldRetry,
        ...overrides,
      },
    },
  })
}
