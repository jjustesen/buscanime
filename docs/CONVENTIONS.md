# Convenções do projeto

Estas regras valem para quem escreve código aqui, pessoa ou agente. Elas existem para
que duas tasks feitas em momentos diferentes pareçam escritas pela mesma mão. Quando
uma regra pode ser checada por ferramenta, ela está no ESLint e quebra o CI.

Se uma regra atrapalhar um caso real, não a ignore em silêncio: registre a exceção no
`DECISIONS.md` e deixe um comentário no código explicando o porquê.

## 1. Estrutura e fronteiras

```
src/
├── main.tsx, App.tsx       monta a aplicação
├── api/                    fala com a AniList
├── features/<nome>/        uma funcionalidade inteira
│   ├── <Nome>Page.tsx      a página da funcionalidade
│   ├── components/         componentes só desta funcionalidade
│   ├── hooks/              hooks desta funcionalidade
│   └── lib/                funções puras desta funcionalidade
├── components/             componentes compartilhados (layout, UI)
├── styles/                 tokens.css e global.css
└── test/                   setup e mocks (MSW)
```

As dependências andam em uma direção só:

```
App → features/ → components/ → styles/
          ↓
         api/
```

- `api/` não importa React nem nada de `features/` ou `components/`. Ela converte a
  resposta da AniList para os tipos do domínio (`Anime`). O formato da API nunca chega
  a um componente.
- Uma feature não importa de outra. O que for compartilhado sobe para `components/`
  ou para um `lib/` na raiz.
- `components/` não importa de `features/` nem de `api/`.
- `lib/` só tem funções puras: sem React, sem `fetch`, sem `window`.
- Checado por `no-restricted-imports` no ESLint.

## 2. Componentes

- Um componente por arquivo, com o mesmo nome do arquivo, em PascalCase
  (`AnimeCard.tsx`).
- Export nomeado (`export function AnimeCard`). Sem `export default`, exceto onde a
  ferramenta exige (configs e o `meta` das stories).
- Ao lado do componente ficam o CSS (`AnimeCard.module.css`) e as stories
  (`AnimeCard.stories.tsx`).
- Props em `interface <Nome>Props`, com descrição em cada prop (seção 5).
- Só a página e os hooks buscam dados. Componentes de apresentação recebem tudo por
  props e avisam mudanças por callbacks (`onChange`, `onSearch`).
- Sem `style={}` inline, exceto para valor que vem do dado (a cor média da capa).

## 3. Estilo

- CSS Modules. Classes em camelCase (`.scoreBadge`).
- Cores, fontes, raios e larguras vêm de `src/styles/tokens.css`, com os nomes das
  variáveis do Figma. Nada de cor ou fonte solta. Uma medida que só existe num lugar
  (a altura de 270 px do card) pode ficar no próprio módulo.
- Estado visual sai em atributo, não em classe montada por string: `data-tone="mid"`,
  `aria-pressed="true"`, `aria-busy="true"`. O CSS e os testes usam o mesmo atributo.
- Valores de referência: `docs/figma/spec.md`.

## 4. Estado

| Tipo de estado | Onde mora | Nunca |
|---|---|---|
| Filtro e busca | URL, via `useListParams` | copiar para `useState` |
| Dados da API | TanStack Query | copiar para `useState` ou Context |
| UI local (texto digitado) | `useState` no componente | subir sem necessidade |

Sem Context e sem store global. Se surgir a necessidade, ela entra no `DECISIONS.md`
antes do código.

## 5. TypeScript

- `strict`. Sem `any`: o que vem de fora entra como `unknown` e é convertido.
- `as` só na fronteira da API, com comentário.
- Sem non-null assertion (`!`).
- Uniões de strings em vez de `enum` (`'low' | 'mid' | 'high'`).
- **Toda `interface`, todo `type` de objeto e cada uma das suas propriedades têm um
  comentário JSDoc.** O comentário diz o significado e os casos especiais, não repete
  o nome. O Storybook usa esses comentários na tabela de props. Checado por
  `jsdoc/require-jsdoc`.

```ts
/** Anime já convertido da resposta da AniList para o formato que a tela usa. */
export interface Anime {
  /** ID da AniList. Único, usado como `key` e para remover repetidos entre páginas. */
  id: number
  /** Nota média de 0 a 100. `null` quando a AniList ainda não tem votos suficientes. */
  averageScore: number | null
}
```

## 6. Testes

| O quê | Como se testa | Arquivo |
|---|---|---|
| Componentes de apresentação | Stories, com `play` para interações | `X.stories.tsx` |
| Funções puras, cliente da API, hooks | Vitest | `x.test.ts` |
| Página inteira com a API simulada | Vitest + Testing Library + MSW | `XPage.test.tsx` |

- Testar comportamento, não implementação. Buscar por papel, rótulo e texto
  (`getByRole`, `getByLabelText`, `getByText`), nunca por classe CSS.
- A rede é sempre simulada com MSW. Não mockar módulos internos do projeto.
- Padrão Arrange / Act / Assert.
- Todo bug corrigido ganha um teste que falhava antes da correção.

## 7. Storybook

- Todo componente de `components/` e `features/*/components/` tem stories.
- Uma story por estado visual, incluindo os que o Figma não mostra (carregando, vazio,
  erro, nota nula, título longo, imagem quebrada).
- Os dados das stories vêm de `src/test/mocks/fixtures.ts`, os mesmos dos testes.
- As stories rodam como testes (`@storybook/addon-vitest`) e passam pelo axe
  (`@storybook/addon-a11y`). Desligar uma regra do axe exige comentário na story e
  registro no `DECISIONS.md`.
- `tags: ['autodocs']` em todo `meta`, para gerar a página de documentação.

## 8. Desempenho e acessibilidade

- `memo`, `useMemo` e `useCallback` só com motivo escrito em comentário: uma medição
  do Profiler, ou uma referência que precisa ser estável (chave de query, dependência
  de efeito).
- HTML semântico primeiro (`button`, `ul`, `h2`, `form`). ARIA só onde o HTML não
  basta. O lint do `jsx-a11y` precisa passar.
- Imagens sempre com `alt` (vazio quando decorativa), `loading` e tamanho reservado.
- Dependência nova de produção só com justificativa no `DECISIONS.md` e o
  `size-limit` passando.

## 9. Idioma e textos

- Código (variáveis, funções, arquivos, tipos) em inglês.
- Comentários, documentação, commits e PRs em português.
- Textos da tela que estão no Figma ficam idênticos, inclusive a mistura de idiomas
  ("All Formats", "Buscar", "Ver mais"). Textos novos (erro, vazio, carregando, leitor
  de tela) em português.
- Comentário explica o porquê, não o quê.

## 10. Fluxo de trabalho

- Uma task do plano é um branch `feature/<nome>` e um PR. Commits pequenos.
- Antes de dizer que terminou, rodar e mostrar a saída de
  `npm run lint && npm run typecheck && npm test && npm run build && npm run size`
  (skill `verify`).
- Ao fim de cada task, atualizar o `AI_LOG.md` (o que a IA gerou, o que foi
  verificado, corrigido ou rejeitado) e o `DECISIONS.md` quando houver decisão.
- Divergência com o Figma ou com o enunciado: parar e perguntar ao dono.
