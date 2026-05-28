const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customConfig = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/__tests__/integration/**/*.test.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

module.exports = createJestConfig(customConfig)
