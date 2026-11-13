import styles from './GenreList.module.css'

/** Props da lista de gêneros. */
export interface GenreListProps {
  /** Gêneros a mostrar. Lista vazia não desenha nada. */
  genres: string[]
}

/** Chips de gênero do Figma, usados no card e na página de detalhes. */
export function GenreList({ genres }: GenreListProps) {
  if (genres.length === 0) return null
  return (
    <ul role="list" className={styles.genres} aria-label="Gêneros">
      {genres.map((genre) => (
        <li key={genre} className={styles.chip}>
          {genre}
        </li>
      ))}
    </ul>
  )
}
