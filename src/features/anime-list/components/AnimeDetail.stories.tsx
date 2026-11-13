import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { animeDetailHighScore, animeDetailNoDescription } from '../../../test/mocks/fixtures'
import { AnimeDetail } from './AnimeDetail'

const meta = {
  component: AnimeDetail,
  args: { anime: animeDetailHighScore },
  parameters: {
    a11y: {
      // Mesma exceção do card: o contraste do selo de nota vem do Figma (DECISIONS.md).
      config: {
        rules: [{ id: 'color-contrast', selector: '*:not([data-tone]):not([data-tone] *)' }],
      },
    },
  },
} satisfies Meta<typeof AnimeDetail>

export default meta
type Story = StoryObj<typeof meta>

/** Capa, título, gêneros, nota e sinopse. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(
      animeDetailHighScore.title,
    )
    await expect(canvas.getByText(/Segundo parágrafo/)).toBeVisible()
  },
}

/** Sem nota e sem sinopse: as duas partes somem. */
export const NoScoreNoDescription: Story = {
  args: { anime: animeDetailNoDescription },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Nota média/)).not.toBeInTheDocument()
    await expect(canvas.queryByText(/Segundo parágrafo/)).not.toBeInTheDocument()
  },
}
