import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './mocks/server'

// O MSW responde no lugar da AniList. Um pedido sem handler é recusado e aparece no log,
// em vez de sair para a internet; o `fetchAnimePage` trata essa recusa como falha de rede.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
// Desfaz os `server.use(...)` de cada teste.
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Sem `globals: true` no Vitest, a Testing Library não limpa a tela sozinha entre testes.
afterEach(cleanup)
