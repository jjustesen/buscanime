import { useId, useState } from 'react'
import styles from './SearchBar.module.css'

/** Props da barra de busca. */
export interface SearchBarProps {
  /** Busca atual (a da URL). Quando muda por fora, como no Voltar do navegador, o campo segue. */
  value: string
  /** Chamado ao enviar (botão "Buscar" ou Enter) com o texto do campo, sem tratar. */
  onSearch: (text: string) => void
}

/** Campo de busca e botão "Buscar" do Figma. Digitar não busca; só enviar. */
export function SearchBar({ value, onSearch }: SearchBarProps) {
  const inputId = useId()
  // O texto digitado é estado local: só sobe para a URL ao enviar.
  const [text, setText] = useState(value)
  // Quando a busca muda por fora (Voltar, "Limpar busca"), o campo mostra o valor novo.
  // Ajustar durante o render, como a documentação do React recomenda, evita um efeito;
  // remontar com `key` também funcionaria, mas tiraria o foco de quem acabou de dar Enter.
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setText(value)
  }

  return (
    <form
      role="search"
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        onSearch(text)
      }}
    >
      <label htmlFor={inputId} className="visually-hidden">
        Buscar anime
      </label>
      <input
        id={inputId}
        type="search"
        className={styles.input}
        placeholder="Digite algo aqui..."
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button type="submit" className={styles.button}>
        Buscar
      </button>
    </form>
  )
}
