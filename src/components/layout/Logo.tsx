import styles from './Logo.module.css'

/** Props do logo do BuscAnime. */
export interface LogoProps {
  /** `lg` é o tamanho do header (40 px); `sm` é o do footer (24 px). */
  size: 'lg' | 'sm'
}

/** Logo em texto, como no Figma: "BUSC" na cor do texto e "ANIME" em amarelo. */
export function Logo({ size }: LogoProps) {
  return (
    <span className={styles.logo} data-size={size}>
      BUSC<span className={styles.highlight}>ANIME</span>
    </span>
  )
}
