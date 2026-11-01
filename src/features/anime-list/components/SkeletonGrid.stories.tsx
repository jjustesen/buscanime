import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { SkeletonGrid } from './SkeletonGrid'

const meta = {
  component: SkeletonGrid,
} satisfies Meta<typeof SkeletonGrid>

export default meta
type Story = StoryObj<typeof meta>

/** Primeira página carregando: 12 esqueletos, escondidos do leitor de tela. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Escondida do leitor de tela, a grade não tem papel para buscar: vai pelo atributo.
    const grid = canvasElement.querySelector('[aria-hidden="true"]')
    await expect(grid).not.toBeNull()
    await expect(grid?.children).toHaveLength(12)
  },
}
