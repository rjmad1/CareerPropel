import { PrismaClient } from '@prisma/client'
import { randomBytes, createHmac } from 'crypto'
import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'

const prisma = new PrismaClient()

/**
 * Two-Factor Authentication (2FA) Implementation
 * Supports:
 * - TOTP (Time-based One-Time Password) - Google Authenticator, Authy
 * - Backup codes for account recovery
 */

// ============================================================================
// TOTP Setup
// ============================================================================

/**
 * Generate TOTP secret for user
 * Returns QR code and secret
 */
export async function generateTOTPSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `CareerPropel (${email})`,
    issuer: 'CareerPropel',
    length: 32
  })

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

  return {
    secret: secret.base32,
    qrCode,
    backupCodes: generateBackupCodes()
  }
}

/**
 * Verify TOTP token
 */
export function verifyTOTPToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow ±2 30-second windows for clock drift
  })
}

// ============================================================================
// Backup Codes
// ============================================================================

/**
 * Generate 10 backup codes
 * Each code is used once and deleted after use
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    // Generate 6-character codes: XXX-XXX
    const code = randomBytes(3)
      .toString('hex')
      .toUpperCase()
      .match(/.{1,3}/g)
      ?.join('-')
    if (code) codes.push(code)
  }
  return codes
}

/**
 * Hash backup code for secure storage
 */
export function hashBackupCode(code: string): string {
  return createHmac('sha256', process.env.NEXTAUTH_SECRET || 'secret')
    .update(code.replace(/-/g, ''))
    .digest('hex')
}

/**
 * Verify backup code
 * Returns true and deletes code if valid
 */
export async function verifyBackupCode(email: string, code: string): Promise<boolean> {
  const candidate = await prisma.candidate.findUnique({
    where: { email },
    include: { backupCodes: true }
  })

  if (!candidate) return false

  const codeHash = hashBackupCode(code)
  const backupCode = candidate.backupCodes.find(bc => bc.code === codeHash && !bc.used)

  if (!backupCode) return false

  // Mark as used (don't delete, keep audit trail)
  await prisma.backupCode.update({
    where: { id: backupCode.id },
    data: { used: true, usedAt: new Date() }
  })

  return true
}

// ============================================================================
// Enable/Disable 2FA
// ============================================================================

/**
 * Enable 2FA for user
 * Stores TOTP secret and backup codes
 */
export async function enable2FA(
  email: string,
  totpSecret: string,
  backupCodes: string[]
): Promise<boolean> {
  try {
    const candidate = await prisma.candidate.update({
      where: { email },
      data: {
        twoFactorEnabled: true,
        totpSecret: totpSecret,
        backupCodes: {
          deleteMany: {}, // Remove old codes
          create: backupCodes.map(code => ({
            code: hashBackupCode(code),
            used: false
          }))
        }
      }
    })

    // Log security event
    await logSecurityEvent('2FA_ENABLED', email, {
      method: 'TOTP'
    })

    return true
  } catch (error) {
    console.error('Enable 2FA error:', error)
    return false
  }
}

/**
 * Disable 2FA for user
 */
export async function disable2FA(email: string): Promise<boolean> {
  try {
    await prisma.candidate.update({
      where: { email },
      data: {
        twoFactorEnabled: false,
        totpSecret: null,
        backupCodes: {
          deleteMany: {}
        }
      }
    })

    // Log security event
    await logSecurityEvent('2FA_DISABLED', email, {})

    return true
  } catch (error) {
    console.error('Disable 2FA error:', error)
    return false
  }
}

/**
 * Check if user has 2FA enabled
 */
export async function is2FAEnabled(email: string): Promise<boolean> {
  const candidate = await prisma.candidate.findUnique({
    where: { email },
    select: { twoFactorEnabled: true }
  })

  return candidate?.twoFactorEnabled || false
}

// ============================================================================
// 2FA Session Management
// ============================================================================

/**
 * Create temporary 2FA verification session
 * User must verify 2FA code within 5 minutes
 */
export async function create2FASession(email: string): Promise<string> {
  const sessionId = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  // Store in temporary store (in production use Redis)
  global.twoFASessions = global.twoFASessions || new Map()
  global.twoFASessions.set(sessionId, {
    email,
    expiresAt,
    verified: false
  })

  return sessionId
}

/**
 * Verify 2FA code and mark session as verified
 */
export async function verify2FASession(
  sessionId: string,
  totpCode: string,
  backupCode?: string
): Promise<boolean> {
  global.twoFASessions = global.twoFASessions || new Map()
  const session = global.twoFASessions.get(sessionId)

  if (!session || new Date() > session.expiresAt) {
    return false
  }

  const candidate = await prisma.candidate.findUnique({
    where: { email: session.email },
    select: { totpSecret: true, twoFactorEnabled: true }
  })

  if (!candidate?.twoFactorEnabled) {
    return false
  }

  let isValid = false

  // Try TOTP code first
  if (totpCode && candidate.totpSecret) {
    isValid = verifyTOTPToken(candidate.totpSecret, totpCode)
  }

  // Try backup code if TOTP failed
  if (!isValid && backupCode) {
    isValid = await verifyBackupCode(session.email, backupCode)
  }

  if (isValid) {
    session.verified = true
    await logSecurityEvent('2FA_VERIFIED', session.email, {
      method: backupCode ? 'BACKUP_CODE' : 'TOTP'
    })
  } else {
    await logSecurityEvent('2FA_FAILED', session.email, {
      method: backupCode ? 'BACKUP_CODE' : 'TOTP'
    })
  }

  return isValid
}

/**
 * Check if 2FA session is verified
 */
export function is2FASessionVerified(sessionId: string): boolean {
  global.twoFASessions = global.twoFASessions || new Map()
  const session = global.twoFASessions.get(sessionId)

  if (!session || new Date() > session.expiresAt) {
    return false
  }

  return session.verified === true
}

// ============================================================================
// Helper: Security Event Logging
// ============================================================================

/**
 * Log security events for audit trail
 */
async function logSecurityEvent(
  eventType: string,
  email: string,
  metadata: any
): Promise<void> {
  // This integrates with audit logging (Phase 3)
  console.log(`[SECURITY] ${eventType} - ${email}`, metadata)
}
