import type { Preview } from '@storybook/react-vite'

// O mesmo CSS global do main.tsx, para a story ficar igual à tela.
import '../src/styles/global.css'

const preview: Preview = {
  // Gera a página de documentação de todo componente, sem repetir a tag em cada meta.
  tags: ['autodocs'],
  parameters: {
    // Uma violação do axe faz o teste da story falhar, não só aparecer no painel.
    a11y: { test: 'error' },
  },
}

export default preview
