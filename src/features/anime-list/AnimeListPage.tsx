import { useEffect, useRef } from 'react'
import styles from './AnimeListPage.module.css'
import { AnimeGrid } from './components/AnimeGrid'
import { FormatFilter } from './components/FormatFilter'
import { LoadMoreButton } from './components/LoadMoreButton'
import { SearchBar } from './components/SearchBar'
import { SkeletonGrid } from './components/SkeletonGrid'
import { StatusMessage, type StatusMessageProps } from './components/StatusMessage'
import { useAnimeList } from './hooks/useAnimeList'
import { useListParams } from './hooks/useListParams'
import { navigate } from './hooks/useRoute'
import { formatLabel } from './lib/formats'
import { animePath } from './lib/route'
import type { ListParams } from './types'

/** Card que deve receber o foco quando a página pedida pelo "Ver mais" chegar. */
interface PendingFocus {
  /** Filtros de quando o botão foi clicado. Se mudaram, a lista na tela é outra. */
  params: ListParams
  /** Índice do primeiro card novo: o tamanho da lista antes do clique. */
  index: number
}

/** A lista de animes: filtro por formato, busca, grade de cards e "Ver mais". */
export function AnimeListPage() {
  const [params, setParams] = useListParams()
  const list = useAnimeList(params)
  const gridRef = useRef<HTMLUListElement>(null)
  // O card que deve receber o foco quando a página do "Ver mais" chegar, junto com os
  // filtros de quando o botão foi clicado. Ref, não estado: mudar o valor não muda a tela.
  const pendingFocus = useRef<PendingFocus | null>(null)

  async function loadMore() {
    const target: PendingFocus = { params, index: list.animes.length }
    pendingFocus.current = target
    const loaded = await list.loadMore()
    // Se falhou ou nem pediu, a lista não cresceu: esquece o foco, senão ele pularia para
    // um card na próxima vez que a lista mudasse (numa atualização, por exemplo).
    if (!loaded && pendingFocus.current === target) pendingFocus.current = null
  }

  // Depois do "Ver mais", o foco vai para o primeiro card novo: quem usa teclado ou leitor
  // de tela continua de onde a lista cresceu, em vez de voltar ao botão. Se o filtro mudou
  // antes da página chegar, a lista na tela é outra, e o foco fica onde o usuário o deixou.
  // Comparar por referência basta: o `useMemo` do `useListParams` dá aos filtros a mesma
  // identidade enquanto a query string não muda.
  useEffect(() => {
    const target = pendingFocus.current
    if (target === null) return
    pendingFocus.current = null
    if (target.params !== params) return
    const item = gridRef.current?.children.item(target.index)
    if (item instanceof HTMLElement) item.focus()
  }, [list.animes, params])

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
          <AnimeGrid
            ref={gridRef}
            animes={list.animes}
            busy={pending}
            onOpen={(id) => navigate(animePath(id))}
          />
        )
      )}

      <StatusMessage
        status={messageStatus()}
        count={list.animes.length}
        formatLabel={formatLabel(params.format)}
        search={params.search}
        onRetry={list.retry}
        onClear={() => setParams({ ...params, search: '' })}
      />

      {list.hasNextPage && <LoadMoreButton loading={list.isLoadingMore} onClick={loadMore} />}
    </div>
  )
}
