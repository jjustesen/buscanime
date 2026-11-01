import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchAnimePage } from '../../../api/anilist'
import { uniqueById } from '../lib/uniqueById'
import type { ListParams } from '../types'

// Busca as páginas de animes dos filtros atuais. Cada "Ver mais" soma uma página.
export function useAnimeList(params: ListParams) {
  const query = useInfiniteQuery({
    // Filtro e busca na chave: cada combinação tem o seu cache, e trocar o filtro
    // cancela o pedido da combinação anterior (o `signal` vai até o `fetch`).
    queryKey: ['anime', params.format, params.search],
    queryFn: ({ pageParam, signal }) =>
      fetchAnimePage(
        {
          page: pageParam,
          // `ALL` é um botão da tela; para a AniList, "todos os formatos" é `null`.
          format: params.format === 'ALL' ? null : params.format,
          search: params.search,
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    // Ao trocar o filtro, os cards antigos ficam na tela (esmaecidos) até os novos chegarem.
    placeholderData: keepPreviousData,
  })

  // A ordem TRENDING muda entre um pedido e outro, então a página 2 pode repetir um anime
  // da página 1. `useMemo`: a grade usa a lista como dependência de efeito (o foco do
  // "Ver mais"), então ela só pode mudar de referência quando os dados mudam.
  const animes = useMemo(
    () => uniqueById(query.data?.pages.flatMap((page) => page.items) ?? []),
    [query.data],
  )

  return { ...query, animes }
}
