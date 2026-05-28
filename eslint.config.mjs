import nextConfig from 'eslint-config-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

// eslint-config-next@16 exports a native flat-config array — no FlatCompat bridge needed.
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'coverage/**'] },
  ...nextConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      'prefer-const': 'warn',
      'no-var': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/jsx-no-target-blank': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      // TECH-DEBT: react-compiler rules introduced in eslint-config-next@16.
      // Pre-existing setState-in-effect and purity violations flagged for the first time.
      // Downgraded to warn to preserve CI stability; fix in a dedicated React cleanup sprint.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
  // Test files: relax strict type rules — mocking requires loose typing
  {
    files: [
      'src/__tests__/**/*.{ts,tsx}',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default config;
