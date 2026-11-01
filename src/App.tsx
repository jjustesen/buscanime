import styles from './App.module.css'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { AnimeListPage } from './features/anime-list/AnimeListPage'

/** Moldura da página: header, conteúdo e footer. */
export function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <AnimeListPage />
      </main>
      <Footer />
    </div>
  )
}
