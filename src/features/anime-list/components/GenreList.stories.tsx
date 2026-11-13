import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { GenreList } from './GenreList'

const meta = {
  component: GenreList,
  args: { genres: ['Action', 'Adventure', 'Fantasy'] },
  // Fundo roxo como no card, só para os chips aparecerem como no Figma.
  decorators: [
    (Story) => (
      <div style={{ padding: 16, background: '#333' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GenreList>

export default meta
type Story = StoryObj<typeof meta>

/** Os chips de gênero, um por item da lista. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
  },
}

/** Sem gêneros nada é desenhado. */
export const Empty: Story = {
  args: { genres: [] },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument()
  },
}
