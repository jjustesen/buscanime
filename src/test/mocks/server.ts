import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Servidor do MSW para os testes do Vitest (projeto "unit", no Node).
export const server = setupServer(...handlers)
