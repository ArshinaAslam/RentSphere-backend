/// <reference types="node" />
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // ── Ignore ─────────────────────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'logs/**', 'build/**'],
  },

  // ── Base JS + TypeScript ────────────────────────────────────────────────────
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // ── Main config ─────────────────────────────────────────────────────────────
  {
    files: ['src/**/*.ts'],

    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },

    plugins: {
      import: importPlugin,
      prettier,
    },

    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },

    rules: {
      // ── Prettier ───────────────────────────────────────────────────────────
      ...prettierConfig.rules,
      'prettier/prettier': 'error',

      // ── TypeScript strict ──────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      // ── Import order ───────────────────────────────────────────────────────
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',

      // ── General ────────────────────────────────────────────────────────────
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
);