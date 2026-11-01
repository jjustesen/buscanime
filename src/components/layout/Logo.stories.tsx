import type { Meta, StoryObj } from '@storybook/react-vite'
import { Logo } from './Logo'

const meta = {
  component: Logo,
  // O logo herda a cor do texto. O decorator faz o papel do header (fundo roxo, texto branco):
  // sem ele o logo fica sobre fundo branco e o axe acusa contraste.
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--color-primary)', color: 'var(--color-white)', padding: 16 }}>
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
