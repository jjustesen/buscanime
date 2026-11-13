import { useEffect, useRef, useState } from 'react'
import type { AnimeDetail as AnimeDetailData } from '../../../api/types'
import styles from './AnimeDetail.module.css'
import { GenreList } from './GenreList'
import { ScoreBadge } from './ScoreBadge'

/** Props do conteúdo da página de detalhes. */
export interface AnimeDetailProps {
  /** Anime já convertido, com a sinopse. */
  anime: AnimeDetailData
}

/** Capa, título, gêneros, nota e sinopse de um anime. */
export function AnimeDetail({ anime }: AnimeDetailProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  // Mesmo motivo do card: capa quebrada sai da tela e fica a cor de fundo.
  const [coverFailed, setCoverFailed] = useState(false)

  // Ao abrir a página, o foco vai para o título: o leitor de tela anuncia onde o usuário
  // chegou, e a tela rola para o topo se o clique veio do meio da lista.
  useEffect(() => titleRef.current?.focus(), [])

  return (
    <article className={styles.detail}>
      <div className={styles.cover} style={{ backgroundColor: anime.cover.color ?? undefined }}>
        {!coverFailed && (
          // alt vazio: o título logo ao lado já diz qual é o anime.
          <img
            alt=""
            src={anime.cover.large}
            width={460}
            height={650}
            decoding="async"
            onError={() => setCoverFailed(true)}
          />
        )}
      </div>
      <div className={styles.info}>
        <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
          {anime.title}
        </h1>
        <GenreList genres={anime.genres} />
        {anime.averageScore !== null && <ScoreBadge score={anime.averageScore} />}
        {anime.description && <p className={styles.description}>{anime.description}</p>}
      </div>
    </article>
  )
}
