import { useEffect, useRef, type RefObject } from 'react'
import type { Anime } from '../../../api/types'
import { AnimeCard, type AnimeCardProps } from './AnimeCard'
import styles from './AnimeGrid.module.css'

/** Props da grade de cards. */
export interface AnimeGridProps {
  /** Animes na ordem da tela, sem repetidos (o `id` é a `key` de cada card). */
  animes: Anime[]
  /** `true` enquanto os cards na tela são do filtro anterior e os novos ainda não chegaram. */
  busy: boolean
  /**
   * Índice do card que deve receber o foco quando a lista mudar, ou `null` para não mexer
   * no foco. A página escreve aqui antes do "Ver mais"; a grade foca e volta a `null`.
   */
  focusIndexRef: RefObject<number | null>
}

// A primeira linha (4 cards) é a primeira dobra no Figma: baixa já. O primeiro card é o
// maior elemento da tela (LCP), então vem com prioridade alta.
function coverPriority(index: number): AnimeCardProps['priority'] {
  if (index === 0) return 'high'
  if (index < 4) return 'eager'
  return 'lazy'
}

/** Grade de cards do Figma. Esmaece enquanto `busy`. */
export function AnimeGrid({ animes, busy, focusIndexRef }: AnimeGridProps) {
  const listRef = useRef<HTMLUListElement>(null)

  // Depois do "Ver mais", o foco vai para o primeiro card novo: quem usa teclado ou leitor
  // de tela continua de onde a lista cresceu, em vez de voltar ao botão.
  useEffect(() => {
    const index = focusIndexRef.current
    if (index === null) return
    focusIndexRef.current = null
    const item = listRef.current?.children.item(index)
    if (item instanceof HTMLElement) item.focus()
  }, [animes, focusIndexRef])

  return (
    <ul ref={listRef} role="list" aria-label="Animes" aria-busy={busy} className={styles.grid}>
      {animes.map((anime, index) => (
        // tabIndex -1: o item pode receber foco pelo código, mas não entra no Tab.
        <li key={anime.id} tabIndex={-1} className={styles.item}>
          <AnimeCard anime={anime} priority={coverPriority(index)} />
        </li>
      ))}
    </ul>
  )
}
