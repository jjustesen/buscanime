import styles from './App.module.css'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { AnimeDetailPage } from './features/anime-list/AnimeDetailPage'
import { AnimeListPage } from './features/anime-list/AnimeListPage'
import { useRoute } from './features/anime-list/hooks/useRoute'

/** Moldura da página: header, footer e, no meio, a lista ou os detalhes conforme a URL. */
export function App() {
  const route = useRoute()
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        {route.name === 'detail' ? <AnimeDetailPage id={route.id} /> : <AnimeListPage />}
      </main>
      <Footer />
    </div>
  )
}
