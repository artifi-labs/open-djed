import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import tsparser from '@typescript-eslint/parser'

export default [
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  prettierConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: [
      '**/*.d.ts',
      '**/*.config.js',
      '!**/eslint.config.js',
      '**/.react-router/**',
      '**/.vite/**/*',
      '**/*.js',
    ],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
      ],
      '@typescript-eslint/await-thenable': 'error',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: false }],
      '@typescript-eslint/no-misused-promises': ['error'],
      'no-constant-condition': 'off',
      'prefer-const': 'error',
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
].map((config) => ({
  ...config,
  ignores: [
    ...(config.ignores || []),
    '**/*.d.ts',
    '**/*.config.js',
    '!**/eslint.config.js',
    '**/.react-router/**',
    '**/.vite/**/*',
    '**/*.js',
  ],
}))
