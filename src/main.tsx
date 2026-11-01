import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Antes do App: assim o reset e os tokens vêm antes do CSS dos componentes no build.
import './styles/global.css'
import { App } from './App'

const queryClient = new QueryClient()

const root = document.getElementById('root')
if (!root) throw new Error('Elemento #root não encontrado no index.html')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
