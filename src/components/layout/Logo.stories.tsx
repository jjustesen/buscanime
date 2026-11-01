import type { Meta, StoryObj } from '@storybook/react-vite'
import { Logo } from './Logo'

const meta = {
  component: Logo,
  tags: ['autodocs'],
  // O logo é branco: sem o fundo roxo do header, ele some e o axe acusa contraste.
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--color-primary)', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

/** Tamanho usado no header (40 px). */
export const Large: Story = { args: { size: 'lg' } }

/** Tamanho usado no footer (24 px). */
export const Small: Story = { args: { size: 'sm' } }
