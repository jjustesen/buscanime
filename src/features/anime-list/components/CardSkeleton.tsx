import styles from './CardSkeleton.module.css'

/**
 * Bloco cinza do tamanho do card, mostrado enquanto a página carrega. Fica escondido do
 * leitor de tela: quem avisa que está carregando é a lista, não cada bloco.
 */
export function CardSkeleton() {
  return <div className={styles.skeleton} aria-hidden="true" />
}
