import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import {
  animeBrokenImage,
  animeHighScore,
  animeLongTitle,
  animeMidScore,
  animeNoGenres,
  animeNoScore,
} from '../../../test/mocks/fixtures'
import { AnimeCard } from './AnimeCard'

const meta = {
  component: AnimeCard,
  // O card ocupa a largura de quem o usa. Aqui ele tem a largura de uma coluna do Figma.
  decorators: [
    (Story) => (
      <div style={{ width: 317 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: {
      config: {
        // Contraste do Figma mantido por decisão do dono; ver DECISIONS.md
        rules: [{ id: 'color-contrast', enabled: false }],
      },
    },
  },
} satisfies Meta<typeof AnimeCard>

export default meta
type Story = StoryObj<typeof meta>

/** Card como no Figma: título, até 3 gêneros e nota acima de 80. */
export const Default: Story = {
  args: { anime: animeHighScore },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Hoshi no Kaze' })).toBeVisible()
    const list = within(canvas.getByRole('list', { name: 'Gêneros' }))
    await expect(list.getAllByRole('listitem')).toHaveLength(3)
    for (const genre of animeHighScore.genres) {
      await expect(list.getByText(genre)).toBeVisible()
    }
    await expect(canvas.getByText('87%')).toHaveAttribute('data-tone', 'high')
  },
}

/** Nota 80: amarela, como diz o enunciado. */
export const MidScore: Story = {
  args: { anime: animeMidScore },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('80%')).toHaveAttribute('data-tone', 'mid')
  },
}

/** Sem nota na AniList: o selo não aparece. */
export const NoScore: Story = {
  args: { anime: animeNoScore },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: animeNoScore.title })).toBeVisible()
    await expect(canvas.queryByText(/nota média/i)).not.toBeInTheDocument()
  },
}

/** Título longo: o CSS corta em 3 linhas, mas o texto inteiro continua no heading. */
export const LongTitle: Story = {
  args: { anime: animeLongTitle },
  play: async ({ canvas }) => {
    const headings = canvas.getAllByRole('heading')
    await expect(headings).toHaveLength(1)
    await expect(headings[0]).toHaveTextContent(animeLongTitle.title)
  },
}

/** Sem gêneros: a lista não é renderizada vazia. */
export const NoGenres: Story = {
  args: { anime: animeNoGenres },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument()
  },
}

/** Capa que não carrega: fica a cor média da capa atrás do título. */
export const BrokenImage: Story = {
  args: { anime: animeBrokenImage },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Kowareta Gazou' })).toBeVisible()
    // #e46b50, a cor da fixture.
    await expect(canvas.getByRole('article')).toHaveStyle({
      backgroundColor: 'rgb(228, 107, 80)',
    })
  },
}

/** Primeiro card da tela (LCP): baixa já e com prioridade alta. */
export const HighPriority: Story = {
  args: { anime: animeHighScore, priority: 'high' },
  play: async ({ canvas }) => {
    // alt="" dá à capa o papel "presentation".
    const cover = canvas.getByRole('presentation')
    await expect(cover).toHaveAttribute('loading', 'eager')
    // O React 19 escreve a prop fetchPriority como o atributo fetchpriority.
    await expect(cover).toHaveAttribute('fetchpriority', 'high')
  },
}

/** Card abaixo da dobra: a capa só baixa perto de aparecer. */
export const Lazy: Story = {
  args: { anime: animeHighScore, priority: 'lazy' },
  play: async ({ canvas }) => {
    const cover = canvas.getByRole('presentation')
    await expect(cover).toHaveAttribute('loading', 'lazy')
    await expect(cover).toHaveAttribute('fetchpriority', 'auto')
  },
}
