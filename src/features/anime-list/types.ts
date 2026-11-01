import type { FormatFilter } from './lib/formats'

/** Filtros da lista, espelhados na URL. */
export interface ListParams {
  /** Formato escolhido nos botões; `ALL` não filtra. */
  format: FormatFilter
  /** Texto buscado. String vazia significa "sem busca". */
  search: string
}
