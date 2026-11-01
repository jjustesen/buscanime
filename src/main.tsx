import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AniListError } from './api/anilist'
// Antes do App: assim o reset e os tokens vêm antes do CSS dos componentes no build.
import './styles/global.css'
import { App } from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Voltar a um filtro já visto nos últimos 5 minutos usa o cache, sem novo pedido.
      staleTime: 5 * 60_000,
      // A AniList limita a 30 pedidos por minuto; trocar de aba não precisa buscar de novo.
      refetchOnWindowFocus: false,
      // Até 2 novas tentativas, só quando o erro é passageiro (rede, 429 ou 5xx). Um erro
      // 400 ou do GraphQL daria o mesmo resultado de novo.
      retry: (failureCount, error) =>
        failureCount < 2 && error instanceof AniListError && error.retryable,
    },
  },
})

const root = document.getElementById('root')
if (!root) throw new Error('Elemento #root não encontrado no index.html')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
