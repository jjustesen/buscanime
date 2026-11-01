import addIcon from '../../../assets/icon-add.svg'
import styles from './LoadMoreButton.module.css'

/** Props do botão "Ver mais". */
export interface LoadMoreButtonProps {
  /** `true` enquanto a próxima página carrega: o botão fica desabilitado e avisa. */
  loading: boolean
  /** Pede a próxima página. */
  onClick: () => void
}

/** Botão "Ver mais" do Figma, com a largura da grade. */
export function LoadMoreButton({ loading, onClick }: LoadMoreButtonProps) {
  return (
    <button type="button" className={styles.button} disabled={loading} onClick={onClick}>
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
