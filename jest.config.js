const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/__tests__/unit/**/*.test.{ts,tsx}',
    '<rootDir>/src/__tests__/regression/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Integration tests require live DB/Redis — run via test:integration
    '/src/__tests__/integration/',
  ],
  collectCoverageFrom: [
    'src/lib/security/{apiKey,csrfToken,objectGuards,rbac,sanitizeContent}.ts',
    'src/lib/safety/**/*.ts',
    'src/lib/scoring/scoringEngine.ts',
    'src/lib/navigation/{analytics,breadcrumbs,deep-link,routes,state}.ts',
    'src/lib/utils/apiResponse.ts',
    'src/lib/validation/schemas.ts',
    'src/lib/validations/job.ts',
    'src/lib/errors/ApiError.ts',
    'src/lib/middleware/cors.ts',
  ],
  // Coverage thresholds reflect target engineering standards of 80%+.
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
}

module.exports = createJestConfig(customConfig)
