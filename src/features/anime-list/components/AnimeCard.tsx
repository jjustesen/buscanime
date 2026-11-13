import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { Anime } from '../../../api/types'
import { animePath } from '../lib/route'
import styles from './AnimeCard.module.css'
import { GenreList } from './GenreList'
import { ScoreBadge } from './ScoreBadge'

/** Props do card de um anime. */
export interface AnimeCardProps {
  /** Anime já convertido da AniList. */
  anime: Anime
  /**
   * Chamado quando o usuário clica em "Ver detalhes" para abrir na mesma aba. Clique com
   * Ctrl, Cmd, Shift ou botão do meio não chama: o navegador abre o `href` como sempre.
   */
  onOpen: (id: number) => void
  /**
   * Quando baixar a capa. `high`: imagem principal da primeira dobra (LCP), baixa já e
   * com prioridade. `eager`: baixa já, sem prioridade extra. `lazy` (padrão): só perto
   * de aparecer na tela.
   */
  priority?: 'high' | 'eager' | 'lazy'
}

/** Card do Figma: capa com degradê, título, gêneros e selo de nota. */
export function AnimeCard({ anime, onOpen, priority = 'lazy' }: AnimeCardProps) {
  // O Chrome desenha um ícone de imagem quebrada no canto do card. Se a capa falhar,
  // ela sai da tela e fica só a cor de fundo. A grade usa `key={anime.id}`, então outro
  // anime monta outro card: a flag não precisa voltar a `false`.
  const [coverFailed, setCoverFailed] = useState(false)

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Só o clique simples vira navegação interna. Os outros ficam com o navegador (nova aba).
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return
    event.preventDefault()
    onOpen(anime.id)
  }

  return (
    // A cor média da capa vem do dado: é o fundo enquanto a imagem carrega ou se ela quebrar.
    <article className={styles.card} style={{ backgroundColor: anime.cover.color ?? undefined }}>
      {/* alt vazio: a capa é decorativa, o título já diz qual é o anime. */}
      {!coverFailed && (
        <img
          className={styles.cover}
          alt=""
          src={anime.cover.large}
          loading={priority === 'lazy' ? 'lazy' : 'eager'}
          fetchPriority={priority === 'high' ? 'high' : 'auto'}
          decoding="async"
          onError={() => setCoverFailed(true)}
        />
      )}
      <div className={styles.content}>
        <h2 className={styles.title}>{anime.title}</h2>
        <GenreList genres={anime.genres} />
      </div>
      {/* É um link (muda de página), não um botão. O nome inclui o título para o leitor de
          tela distinguir os 12 "Ver detalhes" da lista. */}
      <a className={styles.details} href={animePath(anime.id)} onClick={handleClick}>
        Ver detalhes <span className="visually-hidden">de {anime.title}</span>
      </a>
      {anime.averageScore !== null && (
        <div className={styles.score}>
          <ScoreBadge score={anime.averageScore} />
        </div>
      )}
    </article>
  )
}
