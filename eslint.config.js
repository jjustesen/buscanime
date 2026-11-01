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
  globalIgnores(['dist', 'storybook-static', 'coverage', 'agent-kit']),
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
        { patterns: ['react', '**/features/**', '**/components/**'] },
      ],
    },
  },
  {
    files: ['src/components/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['**/features/**', '**/api/**'] }],
    },
  },
  {
    files: ['src/**/lib/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['react', 'react-dom'] }],
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
          publicOnly: false,
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
