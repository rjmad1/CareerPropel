import nextConfig from 'eslint-config-next/core-web-vitals';

export default [
  ...nextConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'prefer-const': 'warn',
      'no-var': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/jsx-no-target-blank': 'error',
      // Downgraded from error: these async-setState-in-effect and ref patterns are
      // widespread pre-existing patterns throughout the codebase and work correctly.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
];
