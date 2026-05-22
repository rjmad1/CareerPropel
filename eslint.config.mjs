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
    },
  },
];
