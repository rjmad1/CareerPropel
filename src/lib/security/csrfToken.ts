import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { redis } from '@/lib/redis/redisClient'

const TOKEN_TTL = 24 * 60 * 60 // 24 hours in seconds
const TOKEN_LENGTH = 32 // bytes

function hashToken(token: string): Buffer {
  return createHash('sha256').update(token).digest()
}

export async function generateCsrfToken(sessionId: string): Promise<string> {
  const token = randomBytes(TOKEN_LENGTH).toString('hex')
  const tokenHash = hashToken(token).toString('hex')
  await redis.setex(`csrf:${sessionId}`, TOKEN_TTL, tokenHash)
  return token
}

export async function verifyCsrfToken(sessionId: string, providedToken: string): Promise<boolean> {
  const stored = await redis.get(`csrf:${sessionId}`)
  if (!stored) return false

  const providedHash = hashToken(providedToken)
  const storedHash = Buffer.from(stored, 'hex')
  // Constant-time compare prevents timing attacks on hash enumeration
  const isValid = providedHash.length === storedHash.length &&
    timingSafeEqual(providedHash, storedHash)

  if (isValid) {
    await redis.del(`csrf:${sessionId}`) // one-time use
  }

  return isValid
}

export async function validateCsrfToken(
  sessionId: string,
  token: string | undefined
): Promise<boolean> {
  if (!token) return false
  return verifyCsrfToken(sessionId, token)
}
