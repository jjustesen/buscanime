import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import jsdoc from 'eslint-plugin-jsdoc'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  // Saídas de build (dist, storybook-static) e o kit de agentes, que não é código do app.
  globalIgnores(['dist', 'storybook-static', 'agent-kit']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: { globals: globals.browser },
    rules: {
      // docs/CONVENTIONS.md, seção 5: sem non-null assertion
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  storybook.configs['flat/recommended'],

  // Fronteiras de docs/CONVENTIONS.md, seção 1
  {
    files: ['src/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', '**/features/**', '**/components/**'],
              message:
                'docs/CONVENTIONS.md §1: api/ só fala com a AniList e converte os dados; não importa React, features/ nem components/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/**', '**/api/**'],
              message:
                'docs/CONVENTIONS.md §1: components/ recebe tudo por props; não importa features/ nem api/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/lib/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom'],
              message: 'docs/CONVENTIONS.md §1: lib/ só tem funções puras, sem React.',
            },
          ],
        },
      ],
    },
  },

  // Descrição em cada tipo e prop: docs/CONVENTIONS.md, seção 5
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.stories.tsx', 'src/**/*.test.{ts,tsx}'],
    plugins: { jsdoc },
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          // Sem fixer: o --fix inseriria um /** */ vazio, que passa na regra sem explicar nada.
          enableFixer: false,
          // Funções não entram: a regra cobra tipos e props, não cada função auxiliar.
          require: { FunctionDeclaration: false },
          contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSPropertySignature'],
        },
      ],
    },
  },

  // Exports nomeados: docs/CONVENTIONS.md, seção 2
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.stories.tsx'],
    rules: {
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
    },
  },

  eslintConfigPrettier,
])
