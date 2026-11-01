import { scoreTone } from '../lib/scoreTone'
import styles from './ScoreBadge.module.css'

/** Props do selo de nota. */
export interface ScoreBadgeProps {
  /** Nota média de 0 a 100. A cor sai de `scoreTone`. */
  score: number
}

/** Selo com a nota em porcentagem, colorido pela faixa da nota (`data-tone`). */
export function ScoreBadge({ score }: ScoreBadgeProps) {
  return (
    <span className={styles.badge} data-tone={scoreTone(score)}>
      {/* Sem o prefixo, o leitor de tela leria só "80%", sem dizer do que é. */}
      <span className="visually-hidden">Nota média: </span>
      {score}%
    </span>
  )
}
