import { useRef } from 'react'
import styles from './AnimeListPage.module.css'
import { AnimeGrid } from './components/AnimeGrid'
import { FormatFilter } from './components/FormatFilter'
import { LoadMoreButton } from './components/LoadMoreButton'
import { SearchBar } from './components/SearchBar'
import { SkeletonGrid } from './components/SkeletonGrid'
import { StatusMessage } from './components/StatusMessage'
import { useAnimeList } from './hooks/useAnimeList'
import { useListParams } from './hooks/useListParams'

/** A lista de animes: filtro por formato, busca, grade de cards e "Ver mais". */
export function AnimeListPage() {
  const [params, setParams] = useListParams()
  const list = useAnimeList(params)
  // Índice do primeiro card novo do "Ver mais"; a grade o foca quando a lista crescer.
  const focusIndexRef = useRef<number | null>(null)

  async function loadMore() {
    focusIndexRef.current = list.animes.length
    const result = await list.fetchNextPage()
    // Se falhou, a lista não cresceu: esquece o foco, senão ele pularia para um card na
    // próxima vez que a lista mudasse (numa troca de filtro, por exemplo).
    if (result.isError) focusIndexRef.current = null
  }

  return (
    <div className={styles.page}>
      <FormatFilter value={params.format} onChange={(format) => setParams({ ...params, format })} />
      <SearchBar value={params.search} onSearch={(search) => setParams({ ...params, search })} />

      {list.isPending ? (
        <SkeletonGrid />
      ) : (
        list.animes.length > 0 && (
          <AnimeGrid
            animes={list.animes}
            busy={list.isPlaceholderData}
            focusIndexRef={focusIndexRef}
          />
        )
      )}

      <StatusMessage
        // Com os cards do filtro anterior na tela, a lista nova ainda está carregando.
        status={list.isPlaceholderData ? 'pending' : list.status}
        count={list.animes.length}
        search={params.search}
        onRetry={() => list.refetch()}
        onClear={() => setParams({ ...params, search: '' })}
      />

      {list.hasNextPage && <LoadMoreButton loading={list.isFetchingNextPage} onClick={loadMore} />}
    </div>
  )
}
