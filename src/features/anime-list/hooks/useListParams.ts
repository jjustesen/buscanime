import { useMemo, useSyncExternalStore } from 'react'
import { isFormatFilter } from '../lib/formats'
import type { ListParams } from '../types'

// O `pushState` não dispara `popstate`, então quem muda a URL por aqui avisa estes
// ouvintes à mão. O conjunto é do módulo para que todas as instâncias do hook vejam a mudança.
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('popstate', onChange)
  }
}

// Uma string é comparada por valor, então o React só renderiza de novo quando a URL muda.
function getSnapshot() {
  return window.location.search
}

// Lê os filtros de uma query string. O que vier inválido ou faltando vira o valor padrão.
// A busca perde os espaços das pontas também aqui: um link editado à mão não pode virar
// uma busca diferente da que o campo enviaria.
export function parseListParams(query: string): ListParams {
  const url = new URLSearchParams(query)
  const format = url.get('format')
  return {
    format: isFormatFilter(format) ? format : 'ALL',
    search: (url.get('search') ?? '').trim(),
  }
}

// Reescreve a query string inteira com os filtros: um parâmetro que não seja filtro some.
function setParams(next: ListParams) {
  // Só os valores diferentes do padrão vão para a URL, para ela ficar curta.
  const url = new URLSearchParams()
  if (next.format !== 'ALL') url.set('format', next.format)
  const search = next.search.trim()
  if (search) url.set('search', search)

  const qs = url.toString()
  // Sem isso, buscar o mesmo texto duas vezes criaria uma entrada repetida no histórico.
  if (qs === window.location.search.slice(1)) return

  // Com a query vazia, o caminho sozinho limpa o `?` da URL.
  window.history.pushState(null, '', qs ? `?${qs}` : window.location.pathname)
  listeners.forEach((listener) => listener())
}

// Filtro e busca moram na URL: o link pode ser compartilhado e o Voltar do navegador funciona.
export function useListParams(): [ListParams, (next: ListParams) => void] {
  const query = useSyncExternalStore(subscribe, getSnapshot)

  // `useMemo` mantém a referência estável enquanto a query string não muda: os filtros
  // entram na chave da query e nas dependências de efeito, e um objeto novo a cada render
  // buscaria de novo.
  const params = useMemo(() => parseListParams(query), [query])

  return [params, setParams]
}
