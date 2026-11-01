import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Footer } from './Footer'

const meta = {
  component: Footer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

/** Footer do Figma: logo pequeno e o aviso de direitos. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('contentinfo')).toBeVisible()
    await expect(canvas.getByText('TODOS OS DIREITOS RESERVADOS')).toBeVisible()
  },
}
