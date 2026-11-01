import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchAnimePage } from '../../../api/anilist'
import type { Anime } from '../../../api/types'
import { uniqueById } from '../lib/uniqueById'
import type { ListParams } from '../types'

/** O que a página precisa saber da lista de animes, sem a superfície inteira do TanStack Query. */
export interface AnimeList {
  /** Animes de todas as páginas carregadas, na ordem da tela e sem repetidos. */
  animes: Anime[]
  /**
   * `pending`: a lista dos filtros atuais ainda não chegou (inclusive quando os cards do
   * filtro anterior estão na tela, esmaecidos). `error`: o último pedido falhou.
   * `success`: a lista na tela é a dos filtros atuais.
   */
  status: 'pending' | 'error' | 'success'
  /** `true` quando a AniList diz que existe mais uma página. */
  hasNextPage: boolean
  /** `true` enquanto a próxima página ("Ver mais") carrega. */
  isLoadingMore: boolean
  /** `true` quando o último "Ver mais" falhou; os cards já carregados continuam. */
  loadMoreFailed: boolean
  /**
   * `true` quando a atualização de uma lista que já está na tela falhou (voltar a um filtro
   * com cache vencido, por exemplo). Os cards continuam; não é falha do "Ver mais".
   */
  refreshFailed: boolean
  /**
   * Pede a próxima página. Resolve `true` se ela chegou, `false` se falhou ou se não pediu
   * porque outro pedido ainda estava no ar.
   */
  loadMore: () => Promise<boolean>
  /** Pede de novo as páginas dos filtros atuais, depois de um erro. */
  retry: () => void
}

/** Busca as páginas de animes dos filtros atuais. Cada "Ver mais" soma uma página. */
export function useAnimeList(params: ListParams): AnimeList {
  const query = useInfiniteQuery({
    // Os filtros inteiros na chave: cada combinação tem o seu cache, e trocar o filtro
    // cancela o pedido da combinação anterior (o `signal` vai até o `fetch`).
    queryKey: ['anime', 'list', params],
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

  // Lidos aqui, no render, e não espalhados no retorno: o resultado do TanStack Query só
  // renderiza de novo quando muda um campo que foi lido, então ler só o necessário evita
  // renders à toa.
  const {
    data,
    status,
    isPlaceholderData,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = query

  // A ordem TRENDING muda entre um pedido e outro, então a página 2 pode repetir um anime
  // da página 1. `useMemo`: a página usa a lista como dependência de efeito (o foco do
  // "Ver mais"), então ela só pode mudar de referência quando os dados mudam.
  const animes = useMemo(() => uniqueById(data?.pages.flatMap((page) => page.items) ?? []), [data])

  return {
    animes,
    status: isPlaceholderData ? 'pending' : status,
    hasNextPage,
    isLoadingMore: isFetchingNextPage,
    loadMoreFailed: isFetchNextPageError,
    refreshFailed: isError && animes.length > 0 && !isFetchNextPageError,
    loadMore: async () => {
      // O `fetchNextPage` cancela o pedido que estiver no ar (uma atualização em segundo
      // plano, por exemplo). Melhor ignorar o clique do que perder essa atualização.
      if (isFetching) return false
      const result = await fetchNextPage()
      return !result.isError
    },
    retry: () => void refetch(),
  }
}
