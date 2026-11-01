import type { Preview } from '@storybook/react-vite'

// Os mesmos estilos globais do main.tsx, para a story ficar igual à tela.
import '../src/styles/fonts'
import '../src/styles/tokens.css'
import '../src/styles/global.css'

const preview: Preview = {
  parameters: {
    // Uma violação do axe faz o teste da story falhar, não só aparecer no painel.
    a11y: { test: 'error' },
  },
}

export default preview
