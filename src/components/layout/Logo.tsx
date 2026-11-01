import styles from './Logo.module.css'

/** Props do logo do BuscAnime. */
export interface LogoProps {
  /** `lg` é o tamanho do header (40 px); `sm` é o do footer (24 px). */
  size: 'lg' | 'sm'
}

/**
 * Logo em texto, como no Figma: "BUSC" herda a cor do texto de quem o usa e "ANIME" usa
 * `--color-warning`. As maiúsculas vêm do CSS, para o leitor de tela não soletrar.
 */
export function Logo({ size }: LogoProps) {
  return (
    <span className={styles.logo} data-size={size}>
      Busc<span className={styles.highlight}>anime</span>
    </span>
  )
}
