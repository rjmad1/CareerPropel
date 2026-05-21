/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom'
import fs from 'fs'
import path from 'path'

// Load .env and .env.local manually before other initializations
const loadEnvFile = (filename: string) => {
  try {
    const envPath = path.resolve(process.cwd(), filename)
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      envContent.split('\n').forEach((line) => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=')
          const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
          if (key && val && !process.env[key]) {
            process.env[key] = val
          }
        }
      })
    }
  } catch (e) {
    console.warn(`Failed to load ${filename}:`, e)
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

// Fallback defaults for testing environment
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://career_user:career_pass@localhost:5433/career_propel_dev'
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3001'
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'a'.repeat(32)
process.env.BACKUP_CODE_HMAC_SECRET = process.env.BACKUP_CODE_HMAC_SECRET || 'b'.repeat(32)

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
