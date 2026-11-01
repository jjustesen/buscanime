import addIcon from '../../../assets/icon-add.svg'
import styles from './LoadMoreButton.module.css'

/** Props do botão "Ver mais". */
export interface LoadMoreButtonProps {
  /**
   * `true` enquanto a próxima página carrega: o botão mostra "Carregando...", fica marcado
   * como desabilitado (`aria-disabled`) e ignora cliques, mas continua com o foco.
   */
  loading: boolean
  /** Pede a próxima página. Não é chamado enquanto `loading`. */
  onClick: () => void
}

/** Botão "Ver mais" do Figma, com a largura da grade. */
export function LoadMoreButton({ loading, onClick }: LoadMoreButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      // `aria-disabled`, não `disabled`: um botão desabilitado perde o foco, e o navegador o
      // joga para o início da página no meio da lista. Por isso o clique é ignorado à mão.
      aria-disabled={loading}
      onClick={() => {
        if (!loading) onClick()
      }}
    >
      {loading ? (
        'Carregando...'
      ) : (
        <>
          {/* alt vazio: o ícone é decorativo, o texto já diz o que o botão faz. */}
          <img src={addIcon} alt="" width={30} height={24} loading="lazy" />
          Ver mais
        </>
      )}
    </button>
  )
}
