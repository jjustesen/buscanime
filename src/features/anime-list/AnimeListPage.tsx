import { useRef } from 'react'
import styles from './AnimeListPage.module.css'
import { AnimeGrid } from './components/AnimeGrid'
import { FormatFilter } from './components/FormatFilter'
import { LoadMoreButton } from './components/LoadMoreButton'
import { SearchBar } from './components/SearchBar'
import { SkeletonGrid } from './components/SkeletonGrid'
import { StatusMessage, type StatusMessageProps } from './components/StatusMessage'
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
    const loaded = await list.loadMore()
    // Se falhou ou nem pediu, a lista não cresceu: esquece o foco, senão ele pularia para
    // um card na próxima vez que a lista mudasse (numa troca de filtro, por exemplo).
    if (!loaded) focusIndexRef.current = null
  }

  // Sem nada na tela, a lista nova carrega com esqueletos; com os cards do filtro
  // anterior na tela, eles ficam esmaecidos até os novos chegarem.
  const pending = list.status === 'pending'

  // Cada erro tem a sua mensagem: com cards na tela, dizer que "não deu para carregar os
  // animes" seria falso, e falar do "Ver mais" só faz sentido se foi ele que falhou.
  function messageStatus(): StatusMessageProps['status'] {
    if (list.loadMoreFailed) return 'loadMoreError'
    if (list.refreshFailed) return 'refreshError'
    return list.status
  }

  return (
    <div className={styles.page}>
      <FormatFilter value={params.format} onChange={(format) => setParams({ ...params, format })} />
      <SearchBar value={params.search} onSearch={(search) => setParams({ ...params, search })} />

      {pending && list.animes.length === 0 ? (
        <SkeletonGrid />
      ) : (
        list.animes.length > 0 && (
          <AnimeGrid animes={list.animes} busy={pending} focusIndexRef={focusIndexRef} />
        )
      )}

      <StatusMessage
        status={messageStatus()}
        count={list.animes.length}
        search={params.search}
        onRetry={list.retry}
        onClear={() => setParams({ ...params, search: '' })}
      />

      {list.hasNextPage && <LoadMoreButton loading={list.isLoadingMore} onClick={loadMore} />}
    </div>
  )
}
