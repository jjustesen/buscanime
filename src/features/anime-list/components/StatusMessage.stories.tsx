import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { StatusMessage } from './StatusMessage'

const meta = {
  component: StatusMessage,
  args: {
    status: 'success',
    count: 12,
    formatLabel: 'All Formats',
    search: '',
    onRetry: fn(),
    onClear: fn(),
  },
} satisfies Meta<typeof StatusMessage>

export default meta
type Story = StoryObj<typeof meta>

/** Primeira página carregando: só o leitor de tela ouve; a tela mostra os esqueletos. */
export const Loading: Story = {
  args: { status: 'pending', count: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Carregando animes...')).toHaveClass('visually-hidden')
  },
}

/** Busca sem resultado: mensagem com o texto buscado e "Limpar busca". */
export const Empty: Story = {
  args: { count: 0, search: 'naruto' },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText('Nenhum anime encontrado para "naruto".')).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Limpar busca' }))

    await expect(args.onClear).toHaveBeenCalledOnce()
  },
}

/** Formato sem nenhum anime e sem busca: não há o que limpar, então não há botão. */
export const EmptyWithoutSearch: Story = {
  args: { count: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Nenhum anime encontrado neste formato.')).toBeVisible()
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
  },
}

/** Erro sem nenhum card na tela: mensagem e "Tentar de novo". */
export const Error: Story = {
  args: { status: 'error', count: 0 },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText('Não foi possível carregar os animes.')).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Tentar de novo' }))

    await expect(args.onRetry).toHaveBeenCalledOnce()
  },
}

/** Erro no "Ver mais": os cards ficam e o próprio "Ver mais" tenta de novo. */
export const LoadMoreError: Story = {
  args: { status: 'loadMoreError', count: 12 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Não foi possível carregar mais animes/)).toBeVisible()
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
  },
}

/** Falha ao atualizar uma lista que já está na tela: os cards ficam, e dá para tentar de novo. */
export const RefreshError: Story = {
  args: { status: 'refreshError', count: 24 },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText('Não foi possível atualizar a lista.')).toBeVisible()
    await expect(canvas.queryByText(/Ver mais/)).not.toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: 'Tentar de novo' }))

    await expect(args.onRetry).toHaveBeenCalledOnce()
  },
}

/**
 * Lista carregada: a contagem é só para o leitor de tela. O formato no texto faz trocar
 * entre duas listas de 12 também mudar o anúncio.
 */
export const Loaded: Story = {
  args: { formatLabel: 'TV Show' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('12 animes de TV Show carregados')).toHaveClass('visually-hidden')
  },
}

/** Lista carregada de uma busca: o texto buscado também entra no anúncio. */
export const LoadedWithSearch: Story = {
  args: { count: 1, search: 'naruto' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('1 anime de All Formats para "naruto" carregado')).toHaveClass(
      'visually-hidden',
    )
  },
}
