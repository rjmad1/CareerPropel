import '@testing-library/jest-dom'

// Silence console.error/warn in tests unless needed
const originalError = console.error
const originalWarn = console.warn

beforeEach(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterEach(() => {
  console.error = originalError
  console.warn = originalWarn
  jest.clearAllMocks()
})
