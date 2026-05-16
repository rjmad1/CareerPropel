import { createHash, randomBytes } from 'crypto'

// In-memory store for CSRF tokens (in production, use Redis with expiration)
const csrfTokens = new Map<string, { token: string; createdAt: number }>()

const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // 24 hours
const TOKEN_LENGTH = 32 // bytes

/**
 * Generate a new CSRF token
 * Should be called when rendering forms
 */
export function generateCsrfToken(sessionId: string): string {
  // Generate random token
  const token = randomBytes(TOKEN_LENGTH).toString('hex')
  const tokenHash = hashToken(token)

  // Store token with expiration
  csrfTokens.set(sessionId, {
    token: tokenHash,
    createdAt: Date.now()
  })

  return token
}

/**
 * Verify a CSRF token
 * Should be called before processing form submissions
 */
export function verifyCsrfToken(sessionId: string, providedToken: string): boolean {
  const stored = csrfTokens.get(sessionId)

  if (!stored) {
    return false
  }

  // Check expiration
  if (Date.now() - stored.createdAt > TOKEN_EXPIRATION) {
    csrfTokens.delete(sessionId)
    return false
  }

  // Compare tokens (hash the provided token to compare)
  const providedHash = hashToken(providedToken)
  const isValid = providedHash === stored.token

  // Delete token after verification (one-time use)
  if (isValid) {
    csrfTokens.delete(sessionId)
  }

  return isValid
}

/**
 * Hash a token for secure storage
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Clean up expired tokens periodically
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of csrfTokens.entries()) {
    if (now - value.createdAt > TOKEN_EXPIRATION) {
      csrfTokens.delete(key)
    }
  }
}, 60 * 60 * 1000) // Cleanup every hour

/**
 * Middleware to check CSRF token on state-changing requests
 */
export function validateCsrfToken(sessionId: string, token: string | undefined): boolean {
  if (!token) {
    return false
  }

  return verifyCsrfToken(sessionId, token)
}
