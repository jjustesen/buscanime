import { useMemo, useSyncExternalStore } from 'react'
import { parseRoute, type Route } from '../lib/route'

// Mesmo desenho do `useListParams`: o `pushState` não dispara `popstate`, então quem muda
// o caminho por aqui avisa os ouvintes à mão.
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('popstate', onChange)
  }
}

function getSnapshot() {
  return window.location.pathname
}

// Vai para outro caminho sem recarregar a página. O Voltar do navegador funciona porque
// cada chamada cria uma entrada no histórico.
export function navigate(path: string) {
  if (path === window.location.pathname) return
  window.history.pushState(null, '', path)
  listeners.forEach((listener) => listener())
}

// Qual página a URL pede. Sem biblioteca de rotas: o app tem duas páginas só.
export function useRoute(): Route {
  const pathname = useSyncExternalStore(subscribe, getSnapshot)
  // `useMemo` para o objeto ter a mesma identidade enquanto o caminho não muda.
  return useMemo(() => parseRoute(pathname), [pathname])
}
