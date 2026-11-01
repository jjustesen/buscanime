import styles from './Footer.module.css'
import { Logo } from './Logo'

/** Faixa roxa do rodapé com o logo pequeno e o aviso de direitos. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <Logo size="sm" />
      <p className={styles.rights}>Todos os direitos reservados</p>
    </footer>
  )
}
