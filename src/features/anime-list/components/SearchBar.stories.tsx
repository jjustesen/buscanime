import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { SearchBar } from './SearchBar'

const meta = {
  component: SearchBar,
  args: { value: '', onSearch: fn() },
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

/** Campo vazio, como no Figma. Digitar não busca; o Enter envia uma vez. */
export const Empty: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole('searchbox', { name: 'Buscar anime' })
    await expect(field).toHaveAttribute('placeholder', 'Digite algo aqui...')

    await userEvent.type(field, 'naruto')
    await expect(args.onSearch).not.toHaveBeenCalled()

    await userEvent.keyboard('{Enter}')
    await expect(args.onSearch).toHaveBeenCalledOnce()
    await expect(args.onSearch).toHaveBeenCalledWith('naruto')
  },
}

/** Com uma busca na URL: o campo já vem preenchido e "Buscar" envia o texto. */
export const WithValue: Story = {
  args: { value: 'one piece' },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('searchbox', { name: 'Buscar anime' })).toHaveValue('one piece')

    await userEvent.click(canvas.getByRole('button', { name: 'Buscar' }))

    await expect(args.onSearch).toHaveBeenCalledWith('one piece')
  },
}
