# BuscAnime

Página em React que lista animes da [AniList](https://anilist.co), com filtro por
formato e busca por texto. É o desafio técnico de frontend da Winnin (`FRONTEND.md`).

Stack: Vite, React 19, TypeScript, CSS Modules, TanStack Query, Vitest e Storybook.

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

- `docs/CONVENTIONS.md`: regras de estrutura, tipos, testes e estilo.
- `docs/figma/spec.md`: cores, fontes e medidas do Figma.
