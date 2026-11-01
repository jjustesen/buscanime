import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

// Renderiza com um QueryClient novo, para um teste não ver o cache do outro. Sem novas
// tentativas: o teste de erro mostra a mensagem na hora, sem esperar os retries do app.
export function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}
