import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { ScoreBadge } from './ScoreBadge'

const meta = {
  component: ScoreBadge,
  parameters: {
    a11y: {
      config: {
        // Contraste do Figma mantido por decisão do dono; ver DECISIONS.md
        rules: [{ id: 'color-contrast', enabled: false }],
      },
    },
  },
} satisfies Meta<typeof ScoreBadge>

export default meta
type Story = StoryObj<typeof meta>

/** Abaixo de 50: vermelho. */
export const Low: Story = {
  args: { score: 48 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('48%')).toHaveAttribute('data-tone', 'low')
  },
}

/** 50, o primeiro valor amarelo. */
export const MidLowerBound: Story = {
  args: { score: 50 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('50%')).toHaveAttribute('data-tone', 'mid')
  },
}

/** 80 continua amarelo, como diz o enunciado (o Figma pinta de verde). */
export const MidUpperBound: Story = {
  args: { score: 80 },
  play: async ({ canvas }) => {
    const badge = canvas.getByText('80%')
    await expect(badge).toHaveAttribute('data-tone', 'mid')
    // O leitor de tela ouve o prefixo escondido junto com a nota.
    await expect(badge).toHaveTextContent('Nota média: 80%')
  },
}

/** Acima de 80: verde. */
export const High: Story = {
  args: { score: 81 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('81%')).toHaveAttribute('data-tone', 'high')
  },
}
