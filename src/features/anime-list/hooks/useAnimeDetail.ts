import { useQuery } from '@tanstack/react-query'
import { fetchAnimeDetail } from '../../../api/anilist'
import type { AnimeDetail } from '../../../api/types'

/** O que a página de detalhes precisa saber do pedido. */
export interface AnimeDetailResult {
  /** `pending` enquanto carrega, `error` se falhou (inclusive ID que não existe). */
  status: 'pending' | 'error' | 'success'
  /** O anime, quando `status` é `success`. */
  anime: AnimeDetail | undefined
}

/** Busca um anime pelo ID da AniList. */
export function useAnimeDetail(id: number): AnimeDetailResult {
  // O ID na chave: cada anime tem o seu cache. O `signal` cancela o pedido se o usuário sair.
  const query = useQuery({
    queryKey: ['anime', 'detail', id],
    queryFn: ({ signal }) => fetchAnimeDetail(id, signal),
  })
  return { status: query.status, anime: query.data }
}
