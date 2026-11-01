import type { Ref } from 'react'
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
   * Ref para o `<ul>` da grade. A página usa para focar o primeiro card novo depois do
   * "Ver mais"; cada `<li>` aceita foco pelo código.
   */
  ref?: Ref<HTMLUListElement>
}

// Os 4 primeiros cards baixam já: no desktop são a primeira linha. No celular ocupam
// várias linhas, mas ficam dentro da distância em que o Chrome já carregaria as imagens
// "lazy". O primeiro card é o maior elemento da tela (LCP), então vem com prioridade alta.
function coverPriority(index: number): AnimeCardProps['priority'] {
  if (index === 0) return 'high'
  if (index < 4) return 'eager'
  return 'lazy'
}

/** Grade de cards do Figma. Esmaece enquanto `busy`. */
export function AnimeGrid({ animes, busy, ref }: AnimeGridProps) {
  return (
    <ul ref={ref} role="list" aria-label="Animes" aria-busy={busy} className={styles.grid}>
      {animes.map((anime, index) => (
        // tabIndex -1: o item pode receber foco pelo código, mas não entra no Tab.
        <li key={anime.id} tabIndex={-1} className={styles.item}>
          <AnimeCard anime={anime} priority={coverPriority(index)} />
        </li>
      ))}
    </ul>
  )
}
