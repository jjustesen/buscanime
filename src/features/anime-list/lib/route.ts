/** Página que a URL pede. */
export type Route =
  | {
      /** A lista de animes, na raiz. Qualquer caminho desconhecido cai aqui também. */
      name: 'list'
    }
  | {
      /** A página de detalhes de um anime. */
      name: 'detail'
      /** ID da AniList, tirado do caminho `/anime/<id>`. */
      id: number
    }

// Lê o caminho da URL (`window.location.pathname`) e diz qual página mostrar.
export function parseRoute(pathname: string): Route {
  const match = /^\/anime\/(\d+)\/?$/.exec(pathname)
  return match ? { name: 'detail', id: Number(match[1]) } : { name: 'list' }
}

// Caminho da página de detalhes de um anime. É o inverso de `parseRoute`.
export function animePath(id: number): string {
  return `/anime/${id}`
}
