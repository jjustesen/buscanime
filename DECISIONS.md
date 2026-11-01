# Decisões técnicas

Este arquivo registra as decisões, os trade-offs, o que entrou além do pedido e o que
ficou de fora. O design completo está em `docs/plans/2026-11-01-buscanime-design.md`
e as regras de código em `docs/CONVENTIONS.md`.

## Base e bibliotecas

| Tema         | Escolha                                      | Por quê                                                                                                                                          | O que se perde                                                                    |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Base         | Vite + React 19 + TypeScript strict          | Uma tela só, API pública chamada do navegador, sem necessidade de SEO. Menos conceitos (Server Components, cache do Next) e testes mais simples. | A primeira página não vem pronta do servidor. Cards esqueleto compensam a espera. |
| Estilo       | CSS Modules + variáveis CSS                  | Zero dependência. Os tokens do Figma viram variáveis com os mesmos nomes. JSX limpo.                                                             | Mais arquivos que no Tailwind e escrita um pouco mais lenta.                      |
| Dados        | TanStack Query                               | Cache, cancelamento de pedidos, estados de carregando/erro e paginação (`useInfiniteQuery`) sem reinventar.                                      | ~13 kB gzip a mais no bundle.                                                     |
| GraphQL      | `fetch` puro                                 | É uma query só. Apollo ou urql pesariam muito para isso.                                                                                         | Sem cache normalizado, que aqui não faz falta.                                    |
| Tipos da API | Escritos à mão, com JSDoc                    | Poucos campos.                                                                                                                                   | Podem divergir do schema. Com mais tempo: graphql-codegen.                        |
| Testes       | Vitest + Testing Library + MSW               | Testam o comportamento, sem depender da internet.                                                                                                | —                                                                                 |
| Componentes  | Storybook 10 + `addon-vitest` + `addon-a11y` | Cada estado visível e testado: renderização, interação e acessibilidade (axe). Publicado junto com o app.                                        | CI 1 a 2 minutos mais lento (instala o Chromium).                                 |

## Ferramentas e versões

| O quê                        | Escolha                                                                    | Por quê                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                   | 6.0, não 7                                                                 | O typescript-eslint ainda só aceita TypeScript abaixo de 6.1.                                                               |
| ESLint                       | 9, não 10                                                                  | O eslint-plugin-jsx-a11y ainda só aceita até o ESLint 9.                                                                    |
| eslint-plugin-jsdoc          | 63, não 65                                                                 | A versão 65 exige Node 24.15, e o projeto roda no 24.11. A regra usada é a mesma.                                           |
| Setup do Storybook no Vitest | Sem `vitest.setup.ts`                                                      | O plugin do Storybook 10 já aplica as configurações do `preview.ts` nos testes.                                             |
| size-limit                   | `@size-limit/file`, medindo gzip                                           | O orçamento é de tamanho. O preset-app baixava um Chromium só para medir tempo de execução.                                 |
| Regras no lint               | Fronteiras de pasta, JSDoc em tipos e props, sem `export default`, sem `!` | Regra que o CI cobra não depende de memória. A correção automática do JSDoc fica desligada para não gerar comentário vazio. |
| Formatação                   | Prettier checado no CI                                                     | Evita diffs de formatação entre os PRs empilhados.                                                                          |

## Estado

- **Filtro e busca na URL.** Recarregar mantém o filtro, o link pode ser
  compartilhado e o botão voltar funciona. Um hook pequeno (`useListParams`) evita
  incluir um roteador para uma tela só.
- **Dados da API só no cache do TanStack Query**, nunca copiados para `useState`.
- **O texto digitado é estado local** da barra de busca e só vai para a URL ao enviar.
  Isso segue o botão "Buscar" do Figma e evita re-renderizar a grade a cada tecla.

## Fidelidade ao Figma

- **Nota 80 em amarelo.** O Figma pinta 80% de verde, mas o enunciado diz "de 50 a
  80, amarelo", e os outros 11 cards do Figma seguem o enunciado. A regra fica numa
  função só (`scoreTone`).
- **Contraste mantido como no Figma.** Medido pela WCAG:

  | Elemento                              | Contraste | Mínimo AA |
  | ------------------------------------- | --------- | --------- |
  | Texto da nota sobre amarelo `#FFB800` | ~1,4:1    | 3:1       |
  | Texto da nota sobre verde `#01ADA6`   | ~2,2:1    | 3:1       |
  | "Ver mais" branco sobre amarelo       | ~1,7:1    | 3:1       |
  | Texto de exemplo da busca `#A7B0BE`   | ~2,2:1    | 4,5:1     |

  Mantive as cores porque o enunciado manda reproduzir o Figma. A correção sugerida é
  usar texto escuro sobre amarelo e verde, sem mexer nos fundos. Nas stories, só a
  regra `color-contrast` do axe fica desligada, e só nesses componentes.

- **Ordem padrão "em alta" (`TRENDING_DESC`)**, porque os animes do Figma são os que
  estavam em alta quando o design foi feito. Com busca, a ordem é por relevância
  (`SEARCH_MATCH`).

## Além do pedido

- **Acessibilidade de base:** marcos de página (header, main, footer), um `h1`, foco
  visível, `lang="pt-BR"`, altura mínima em vez de fixa nas faixas (zoom de texto),
  caixa alta feita por CSS (o leitor de tela não soletra) e listas com `role="list"`.
- **Axe em todas as stories:** uma violação de acessibilidade falha o teste.
- **Convenções escritas e checadas pelo lint** (`docs/CONVENTIONS.md`).

## Fora do escopo

- Página de detalhes do anime.
- Modo escuro.
- Busca enquanto digita (o Figma tem botão "Buscar").
- Testes E2E com Playwright.

## O que faria com mais tempo

- graphql-codegen para gerar os tipos a partir do schema da AniList.
- Testes E2E com Playwright no deploy de preview.
- Lighthouse CI em cada PR.
