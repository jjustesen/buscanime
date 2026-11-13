import styles from './AnimeDetailPage.module.css'
import { AnimeDetail } from './components/AnimeDetail'
import { useAnimeDetail } from './hooks/useAnimeDetail'
import { navigate } from './hooks/useRoute'

/** Props da página de detalhes. */
export interface AnimeDetailPageProps {
  /** ID da AniList do anime, tirado da URL. */
  id: number
}

/** A página de um anime: link para voltar à lista e o conteúdo (capa, título, gêneros, sinopse). */
export function AnimeDetailPage({ id }: AnimeDetailPageProps) {
  const { status, anime } = useAnimeDetail(id)

  return (
    <div className={styles.page}>
      {/* Link real para a raiz: com clique simples vira navegação interna. */}
      <a
        className={styles.back}
        href="/"
        onClick={(event) => {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return
          event.preventDefault()
          navigate('/')
        }}
      >
        Voltar para a lista
      </a>

      {status === 'pending' && <p role="status">Carregando...</p>}
      {status === 'error' && <p role="alert">Não foi possível carregar este anime.</p>}
      {anime && <AnimeDetail anime={anime} />}
    </div>
  )
}
