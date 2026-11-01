import { useState } from 'react'
import type { Anime } from '../../../api/types'
import styles from './AnimeCard.module.css'
import { ScoreBadge } from './ScoreBadge'

/** Props do card de um anime. */
export interface AnimeCardProps {
  /** Anime já convertido da AniList. */
  anime: Anime
  /**
   * Quando baixar a capa. `high`: imagem principal da primeira dobra (LCP), baixa já e
   * com prioridade. `eager`: baixa já, sem prioridade extra. `lazy` (padrão): só perto
   * de aparecer na tela.
   */
  priority?: 'high' | 'eager' | 'lazy'
}

/** Card do Figma: capa com degradê, título, gêneros e selo de nota. */
export function AnimeCard({ anime, priority = 'lazy' }: AnimeCardProps) {
  // O Chrome desenha um ícone de imagem quebrada no canto do card. Se a capa falhar,
  // ela sai da tela e fica só a cor de fundo. A grade usa `key={anime.id}`, então outro
  // anime monta outro card: a flag não precisa voltar a `false`.
  const [coverFailed, setCoverFailed] = useState(false)

  return (
    // A cor média da capa vem do dado: é o fundo enquanto a imagem carrega ou se ela quebrar.
    <article className={styles.card} style={{ backgroundColor: anime.cover.color ?? undefined }}>
      {/* alt vazio: a capa é decorativa, o título já diz qual é o anime. */}
      {!coverFailed && (
        <img
          className={styles.cover}
          alt=""
          src={anime.cover.large}
          srcSet={`${anime.cover.medium} 230w, ${anime.cover.large} 460w`}
          sizes="(max-width: 700px) 100vw, 317px"
          loading={priority === 'lazy' ? 'lazy' : 'eager'}
          fetchPriority={priority === 'high' ? 'high' : 'auto'}
          decoding="async"
          onError={() => setCoverFailed(true)}
        />
      )}
      <div className={styles.content}>
        <h2 className={styles.title}>{anime.title}</h2>
        {anime.genres.length > 0 && (
          <ul role="list" className={styles.genres} aria-label="Gêneros">
            {anime.genres.map((genre) => (
              <li key={genre} className={styles.chip}>
                {genre}
              </li>
            ))}
          </ul>
        )}
      </div>
      {anime.averageScore !== null && (
        <div className={styles.score}>
          <ScoreBadge score={anime.averageScore} />
        </div>
      )}
    </article>
  )
}
