jest.mock('@/lib/redis/redisClient', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
  },
}))

import { redis } from '@/lib/redis/redisClient'
import { generateCsrfToken, verifyCsrfToken, validateCsrfToken } from '@/lib/security/csrfToken'

const mockRedis = redis as any

describe('csrfToken', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateCsrfToken', () => {
    it('generates a hex token of length 64 (32 bytes)', async () => {
      mockRedis.setex.mockResolvedValue('OK')
      const token = await generateCsrfToken('session-123')
      expect(token).toHaveLength(64)
      expect(token).toMatch(/^[0-9a-f]+$/)
    })

    it('stores the hashed token in Redis with correct TTL', async () => {
      mockRedis.setex.mockResolvedValue('OK')
      await generateCsrfToken('session-123')
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'csrf:session-123',
        86400, // 24 hours
        expect.any(String)
      )
    })
  })

  describe('verifyCsrfToken', () => {
    it('returns false if no token is stored in Redis', async () => {
      mockRedis.get.mockResolvedValue(null)
      const result = await verifyCsrfToken('session-123', 'some-token')
      expect(result).toBe(false)
    })

    it('returns false if provided token is invalid', async () => {
      // Store mock hash
      mockRedis.get.mockResolvedValue('incorrecthash')
      const result = await verifyCsrfToken('session-123', 'some-token')
      expect(result).toBe(false)
    })

    it('returns true and consumes the token if provided token is valid', async () => {
      mockRedis.get.mockResolvedValue('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') // SHA-256 for empty string ''
      mockRedis.del.mockResolvedValue(1)

      const result = await verifyCsrfToken('session-123', '')
      expect(result).toBe(true)
      expect(mockRedis.del).toHaveBeenCalledWith('csrf:session-123')
    })
  })

  describe('validateCsrfToken', () => {
    it('returns false immediately if token is undefined', async () => {
      const result = await validateCsrfToken('session-123', undefined)
      expect(result).toBe(false)
      expect(mockRedis.get).not.toHaveBeenCalled()
    })

    it('calls verifyCsrfToken if token is provided', async () => {
      mockRedis.get.mockResolvedValue(null)
      const result = await validateCsrfToken('session-123', 'token-val')
      expect(result).toBe(false)
      expect(mockRedis.get).toHaveBeenCalledWith('csrf:session-123')
    })
  })
})
