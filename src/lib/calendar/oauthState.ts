/**
 * HMAC-signed OAuth state parameter utilities.
 *
 * Replaces the previous base64(email) scheme, which was unsigned and
 * trivially forgeable. A forged state allowed an attacker to link their
 * Google/Outlook account to any victim's CareerPropel account.
 *
 * State format:  <emailB64url>.<timestamp>.<hmac>
 *   emailB64url — base64url-encoded user email
 *   timestamp   — ms since epoch (string), used to enforce a 15-minute TTL
 *   hmac        — HMAC-SHA256(emailB64url.timestamp, NEXTAUTH_SECRET), base64url
 *
 * The NEXTAUTH_SECRET is used as the signing key so no extra env var is needed.
 */

import { createHmac, timingSafeEqual } from 'crypto'

const STATE_TTL_MS = 15 * 60 * 1000 // 15 minutes

function signingKey(): string {
  const key = process.env.NEXTAUTH_SECRET
  if (!key) throw new Error('NEXTAUTH_SECRET is required for OAuth state signing')
  return key
}

export function generateOAuthState(userEmail: string): string {
  const emailB64 = Buffer.from(userEmail).toString('base64url')
  const ts = Date.now().toString()
  const payload = `${emailB64}.${ts}`
  const sig = createHmac('sha256', signingKey()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

/**
 * Verifies the HMAC signature and TTL of an OAuth state parameter.
 * Returns the user email if valid, or null if forged / expired.
 */
export function verifyOAuthState(state: string): string | null {
  try {
    const parts = state.split('.')
    if (parts.length !== 3) return null
    const [emailB64, ts, sig] = parts
    const payload = `${emailB64}.${ts}`
    const expectedSig = createHmac('sha256', signingKey()).update(payload).digest('base64url')

    const sigBuf = Buffer.from(sig, 'base64url')
    const expectedBuf = Buffer.from(expectedSig, 'base64url')
    if (sigBuf.length !== expectedBuf.length) return null
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null

    const age = Date.now() - parseInt(ts, 10)
    if (isNaN(age) || age > STATE_TTL_MS || age < 0) return null

    return Buffer.from(emailB64, 'base64url').toString('utf-8')
  } catch {
    return null
  }
}
