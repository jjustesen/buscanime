import styles from './CardSkeleton.module.css'

/**
 * Bloco cinza do tamanho do card, mostrado enquanto a página carrega. Não se esconde
 * do leitor de tela sozinho: a grade esconde a lista inteira de esqueletos e avisa,
 * ela mesma, que está carregando.
 */
export function CardSkeleton() {
  return <div className={styles.skeleton} />
}
