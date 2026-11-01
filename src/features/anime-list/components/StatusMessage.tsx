import styles from './StatusMessage.module.css'

/** Props da mensagem de estado da lista. */
export interface StatusMessageProps {
  /**
   * Estado da lista. `pending`: carregando a primeira página ou trocando de filtro.
   * `error`: o pedido falhou e não há nenhum card na tela. `loadMoreError`: o "Ver mais"
   * falhou; os cards ficam. `refreshError`: a atualização de uma lista que já está na
   * tela falhou; os cards ficam. `success`: a lista na tela está atualizada.
   */
  status: 'pending' | 'error' | 'loadMoreError' | 'refreshError' | 'success'
  /** Quantos animes estão na tela. */
  count: number
  /** Texto do botão do formato escolhido ("TV Show"), para o anúncio dizer qual lista carregou. */
  formatLabel: string
  /**
   * Busca atual, para o anúncio da lista carregada e a mensagem de lista vazia. String
   * vazia quando não há busca.
   */
  search: string
  /** Pede a lista de novo, depois de um erro sem cards ou de uma atualização que falhou. */
  onRetry: () => void
  /** Limpa a busca, quando ela não encontrou nada. */
  onClear: () => void
}

/**
 * Os estados que o Figma não mostra: carregando, erro e vazio. Fica numa região
 * `aria-live`, então o leitor de tela também ouve quantos animes carregaram.
 */
export function StatusMessage({
  status,
  count,
  formatLabel,
  search,
  onRetry,
  onClear,
}: StatusMessageProps) {
  // Carregando e carregado têm só texto para o leitor de tela; os esqueletos e os cards já
  // mostram o estado. Nesses casos a região sai do fluxo, para não abrir um vão na página.
  const screenReaderOnly = status === 'pending' || (status === 'success' && count > 0)

  // O formato e a busca no texto: a região só é anunciada quando o texto muda, então trocar
  // entre duas listas de 12 animes, sem esse contexto, passaria calado.
  const context = search ? `de ${formatLabel} para "${search}"` : `de ${formatLabel}`
  const loaded =
    count === 1 ? `1 anime ${context} carregado` : `${count} animes ${context} carregados`

  return (
    // A região existe sempre: o leitor de tela só anuncia mudanças de uma região que já
    // estava na página.
    <div aria-live="polite" data-screen-reader-only={screenReaderOnly} className={styles.status}>
      {status === 'pending' && <p className="visually-hidden">Carregando animes...</p>}

      {status === 'success' && count > 0 && <p className="visually-hidden">{loaded}</p>}

      {status === 'error' && (
        <>
          <p>Não foi possível carregar os animes.</p>
          <button type="button" className={styles.button} onClick={onRetry}>
            Tentar de novo
          </button>
        </>
      )}

      {/* Erro no "Ver mais": os cards ficam, e o próprio "Ver mais", logo abaixo, tenta
          de novo. Um segundo botão faria a mesma coisa. */}
      {status === 'loadMoreError' && (
        <p>Não foi possível carregar mais animes. Clique em “Ver mais” para tentar de novo.</p>
      )}

      {/* A lista na tela continua valendo, só não foi atualizada: os cards ficam, e o
          "Tentar de novo" pede a lista inteira de novo. */}
      {status === 'refreshError' && (
        <>
          <p>Não foi possível atualizar a lista.</p>
          <button type="button" className={styles.button} onClick={onRetry}>
            Tentar de novo
          </button>
        </>
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
