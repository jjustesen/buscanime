import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { LoadMoreButton } from './LoadMoreButton'

const meta = {
  component: LoadMoreButton,
  args: { loading: false, onClick: fn() },
  parameters: {
    a11y: {
      config: {
        // Contraste do Figma mantido por decisão do dono (branco sobre amarelo, ~1,7:1);
        // ver DECISIONS.md.
        rules: [{ id: 'color-contrast', enabled: false }],
      },
    },
  },
} satisfies Meta<typeof LoadMoreButton>

export default meta
type Story = StoryObj<typeof meta>

/** Como no Figma: ícone e "Ver mais". Clicar pede a próxima página. */
export const Idle: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Ver mais' })
    await expect(button).toBeEnabled()

    await userEvent.click(button)

    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

/** Próxima página carregando: desabilitado e com "Carregando...". */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Carregando...' })).toBeDisabled()
  },
}
