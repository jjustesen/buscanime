import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { animeFixtures } from '../../../test/mocks/fixtures'
import { AnimeGrid } from './AnimeGrid'

// Uma página: os 12 primeiros animes das fixtures.
const firstPage = animeFixtures.slice(0, 12).map((fixture) => fixture.anime)

const meta = {
  component: AnimeGrid,
  args: { animes: firstPage, busy: false, onOpen: fn() },
  parameters: {
    a11y: {
      // As mesmas exceções das stories do AnimeCard, pelos mesmos motivos (DECISIONS.md):
      // contraste do Figma mantido só no selo de nota, e o degradê do card ignorado.
      config: {
        rules: [{ id: 'color-contrast', selector: '*:not([data-tone]):not([data-tone] *)' }],
      },
      options: { checks: { 'color-contrast': { options: { ignorePseudo: true } } } },
    },
  },
} satisfies Meta<typeof AnimeGrid>

export default meta
type Story = StoryObj<typeof meta>

/** Uma página de 12 cards; só a primeira linha baixa a capa na hora. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('list', { name: 'Animes' })
    await expect(grid).toHaveAttribute('aria-busy', 'false')
    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(12)
    const covers = canvas.getAllByRole('presentation')
    await expect(covers[0]).toHaveAttribute('fetchpriority', 'high')
    await expect(covers[3]).toHaveAttribute('loading', 'eager')
    await expect(covers[4]).toHaveAttribute('loading', 'lazy')
  },
}

/** Trocando o filtro: os cards antigos ficam esmaecidos até os novos chegarem. */
export const Busy: Story = {
  args: { busy: true },
  parameters: {
    a11y: {
      config: {
        // Os cards esmaecidos são do filtro anterior e vão sair da tela; o contraste baixo
        // é o aviso visual de que estão desatualizados (aria-busy avisa o leitor de tela).
        // A WCAG não cobra contraste de interface inativa. Ver DECISIONS.md.
        rules: [{ id: 'color-contrast', enabled: false }],
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list', { name: 'Animes' })).toHaveAttribute('aria-busy', 'true')
  },
}
