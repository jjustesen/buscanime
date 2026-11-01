import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Header } from './Header'

const meta = {
  component: Header,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

/** Header do Figma: o logo é o título principal da página. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('banner')).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 1, name: /buscanime/i })).toBeVisible()
  },
}
