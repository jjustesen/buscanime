import { PAGE_SIZE } from '../../../api/anilist'
// A mesma grade dos cards, para os esqueletos ocuparem o lugar exato deles.
import styles from './AnimeGrid.module.css'
import { CardSkeleton } from './CardSkeleton'

/**
 * Uma página de esqueletos enquanto a primeira página carrega. Fica escondida do leitor
 * de tela: quem avisa que está carregando é o `StatusMessage`, não 12 itens vazios.
 */
export function SkeletonGrid() {
  return (
    <div aria-hidden="true" className={styles.grid}>
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}
