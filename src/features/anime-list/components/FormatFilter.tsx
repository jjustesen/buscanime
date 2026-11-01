import { FORMAT_OPTIONS, type FormatFilter as FormatFilterValue } from '../lib/formats'
import styles from './FormatFilter.module.css'

/** Props dos botões de formato. */
export interface FormatFilterProps {
  /** Formato escolhido agora; o botão dele fica marcado. */
  value: FormatFilterValue
  /** Chamado com o formato do botão clicado, mesmo que já seja o escolhido. */
  onChange: (format: FormatFilterValue) => void
}

/** Os 8 botões de formato do Figma. Só um fica marcado (`aria-pressed`). */
export function FormatFilter({ value, onChange }: FormatFilterProps) {
  return (
    <div role="group" aria-label="Filtrar por formato" className={styles.group}>
      {FORMAT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          // aria-pressed diz ao leitor de tela qual está marcado e é o mesmo atributo que o CSS usa.
          aria-pressed={option.value === value}
          className={styles.button}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
