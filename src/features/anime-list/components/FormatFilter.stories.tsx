import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { FormatFilter } from './FormatFilter'

const meta = {
  component: FormatFilter,
  args: { value: 'ALL', onChange: fn() },
} satisfies Meta<typeof FormatFilter>

export default meta
type Story = StoryObj<typeof meta>

/** Estado inicial, como no Figma: "All Formats" marcado. */
export const AllSelected: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Filtrar por formato' })
    await expect(group).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'All Formats' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await userEvent.click(canvas.getByRole('button', { name: 'OVA' }))

    await expect(args.onChange).toHaveBeenCalledWith('OVA')
  },
}

/** "Movie" marcado: só um botão fica pressionado por vez. */
export const MovieSelected: Story = {
  args: { value: 'MOVIE' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Movie' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const pressed = canvas
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-pressed') === 'true')
    await expect(pressed).toHaveLength(1)
  },
}
