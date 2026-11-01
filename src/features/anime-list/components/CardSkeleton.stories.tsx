import type { Meta, StoryObj } from '@storybook/react-vite'
import { CardSkeleton } from './CardSkeleton'

const meta = {
  component: CardSkeleton,
  // Como o card, o esqueleto ocupa a largura de quem o usa: aqui, uma coluna do Figma.
  decorators: [
    (Story) => (
      <div style={{ width: 317 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CardSkeleton>

export default meta
type Story = StoryObj<typeof meta>

/** Bloco do tamanho do card, enquanto a página carrega. */
export const Default: Story = {}
