# BuscAnime

Página em React que lista animes da [AniList](https://anilist.co), com filtro por
formato, busca por texto e a nota de cada anime colorida por faixa. É o desafio técnico
de frontend da Winnin (`FRONTEND.md`).

- **App publicado:** https://buscanime-six.vercel.app/
- **Storybook publicado** (todos os estados dos componentes, inclusive os que o Figma
  não mostra): https://buscanime-six.vercel.app/storybook/

Stack: Vite, React 19, TypeScript, CSS Modules, TanStack Query, Vitest e Storybook.

## O que a página faz

- Lista os animes em alta na AniList, 12 por vez, com "Ver mais".
- Filtra por formato (All Formats, TV Show, Movie, TV Short, Special, OVA, ONA, Music).
- Busca por texto ao clicar em "Buscar" ou apertar Enter.
- Mostra a nota média em cada card: abaixo de 50 vermelho, de 50 a 80 amarelo, acima
  de 80 verde.
- Guarda filtro e busca na URL: recarregar mantém, o link pode ser compartilhado e o
  botão voltar funciona.
- Tem estados de carregando, vazio e erro, funciona do celular ao desktop e pode ser
  usada só com teclado e com leitor de tela.

## Requisitos

- Node 24 e npm 11.

## Instalar

```bash
npm install
```

## Rodar

```bash
npm run dev
```

Abre em `http://localhost:5173`.

## Testar

Na primeira vez, baixe o Chromium que roda as stories como testes:

```bash
npx playwright install chromium
```

Depois:

```bash
npm test            # todos os testes: "unit" (jsdom) e "storybook" (Chromium, com axe)
npm run test:unit   # só os testes "unit", mais rápido no dia a dia
npm run lint        # ESLint, incluindo as regras de docs/CONVENTIONS.md
npm run typecheck   # TypeScript
```

## Storybook

```bash
npm run storybook
```

Abre em `http://localhost:6006`.

## Build

```bash
npm run build       # app em dist/ e Storybook em dist/storybook/
npm run preview     # serve o build do app
npm run size        # confere o JavaScript do app (limite de 100 kB gzip); rode depois do build
```

## Documentação

- `DECISIONS.md`: decisões técnicas, trade-offs, o que entrou além do pedido, o que
  ficou de fora e o que eu faria com mais tempo.
- `AI_LOG.md`: como a IA foi usada.
- `docs/plans/`: o design e o plano de implementação, escritos antes do código.
- `docs/CONVENTIONS.md`: regras de estrutura, tipos, testes e estilo.
- `docs/figma/spec.md`: cores, fontes e medidas do Figma.

## Estrutura

```
src/
├── api/                    cliente da AniList (query, conversão, erros)
├── features/anime-list/    a lista e a página de detalhes: componentes, hooks e funções puras
├── components/layout/      header, footer e logo
├── styles/                 tokens do Figma e CSS global
├── test/                   setup, API simulada (MSW) e fixtures
├── queryClient.ts          configuração do TanStack Query (app e testes)
└── main.tsx, App.tsx
```

### Onde estão os testes

| O quê                                                                          | Arquivo                                              | Onde roda                     |
| ------------------------------------------------------------------------------ | ---------------------------------------------------- | ----------------------------- |
| Componentes (card, selo, filtros, busca, grade, "Ver mais", mensagens, layout) | `*.stories.tsx`, função `play` de cada story         | Vitest no Chromium, com o axe |
| Funções puras, hooks e o cliente da AniList                                    | `*.test.ts(x)`                                       | Vitest no jsdom               |
| A página inteira, com a API simulada (MSW)                                     | `AnimeListPage.test.tsx`, `AnimeDetailPage.test.tsx` | Vitest no jsdom               |

Os componentes não têm `*.test.tsx` próprio: o teste deles é a story, que roda como
teste no `npm test` e no CI. Assim cada estado é escrito uma vez e serve de
documentação e de teste. O porquê está em `DECISIONS.md`.

## Uso de IA

Usei IA (Claude Code) em todo o projeto. Como o trabalho foi organizado, o que foi
verificado e o que foi corrigido ou rejeitado está em `AI_LOG.md`. As regras que os
agentes seguiram estão em `AGENTS.md`, `CLAUDE.md`, `docs/CONVENTIONS.md` e
`.claude/`.
