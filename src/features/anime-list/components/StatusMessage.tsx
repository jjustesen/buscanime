import styles from './StatusMessage.module.css'

/** Props da mensagem de estado da lista. */
export interface StatusMessageProps {
  /**
   * Estado da lista. `pending`: carregando a primeira página ou trocando de filtro.
   * `error`: o último pedido falhou. `success`: a lista na tela está atualizada.
   */
  status: 'pending' | 'error' | 'success'
  /** Quantos animes estão na tela. */
  count: number
  /** Busca atual, para a mensagem de lista vazia. String vazia quando não há busca. */
  search: string
  /** Pede a primeira página de novo, depois de um erro sem nenhum card na tela. */
  onRetry: () => void
  /** Limpa a busca, quando ela não encontrou nada. */
  onClear: () => void
}

/**
 * Os estados que o Figma não mostra: carregando, erro e vazio. Fica numa região
 * `aria-live`, então o leitor de tela também ouve quantos animes carregaram.
 */
export function StatusMessage({ status, count, search, onRetry, onClear }: StatusMessageProps) {
  // Carregando e carregado têm só texto para o leitor de tela; os esqueletos e os cards já
  // mostram o estado. Nesses casos a região sai do fluxo, para não abrir um vão na página.
  const screenReaderOnly = status === 'pending' || (status === 'success' && count > 0)

  return (
    // A região existe sempre: o leitor de tela só anuncia mudanças de uma região que já
    // estava na página.
    <div aria-live="polite" data-screen-reader-only={screenReaderOnly} className={styles.status}>
      {status === 'pending' && <p className="visually-hidden">Carregando animes...</p>}

      {status === 'success' && count > 0 && (
        <p className="visually-hidden">
          {count === 1 ? '1 anime carregado' : `${count} animes carregados`}
        </p>
      )}

      {status === 'error' && count === 0 && (
        <>
          <p>Não foi possível carregar os animes.</p>
          <button type="button" className={styles.button} onClick={onRetry}>
            Tentar de novo
          </button>
        </>
      )}

      {/* Erro no "Ver mais": os cards ficam, e o próprio "Ver mais", logo abaixo, tenta
          de novo. Um segundo botão faria a mesma coisa. */}
      {status === 'error' && count > 0 && (
        <p>Não foi possível carregar mais animes. Clique em “Ver mais” para tentar de novo.</p>
      )}

      {status === 'success' && count === 0 && (
        <>
          <p>
            {search
              ? `Nenhum anime encontrado para "${search}".`
              : 'Nenhum anime encontrado neste formato.'}
          </p>
          {search && (
            <button type="button" className={styles.button} onClick={onClear}>
              Limpar busca
            </button>
          )}
        </>
      )}
    </div>
  )
}
