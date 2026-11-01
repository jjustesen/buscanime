import styles from './Header.module.css'
import { Logo } from './Logo'

/** Faixa roxa do topo com o logo. O logo é o título principal (`h1`) da página. */
export function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <Logo size="lg" />
      </h1>
    </header>
  )
}
