import { PrismaClient } from '@prisma/client'
import { randomBytes, createHmac } from 'crypto'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const speakeasy = require('speakeasy') as any
import QRCode from 'qrcode'

const prisma = new PrismaClient()

// ============================================================================
// TOTP Setup
// ============================================================================

export async function generateTOTPSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `CareerPropel (${email})`,
    issuer: 'CareerPropel',
    length: 32
  })

  const qrCode = await QRCode.toDataURL(secret.otpauth_url)

  return {
    secret: secret.base32,
    qrCode,
    backupCodes: generateBackupCodes()
  }
}

export function verifyTOTPToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2
  })
}

// ============================================================================
// Backup Codes
// ============================================================================

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = randomBytes(3)
      .toString('hex')
      .toUpperCase()
      .match(/.{1,3}/g)
      ?.join('-')
    if (code) codes.push(code)
  }
  return codes
}

export function hashBackupCode(code: string): string {
  return createHmac('sha256', process.env.NEXTAUTH_SECRET || 'secret')
    .update(code.replace(/-/g, ''))
    .digest('hex')
}

export async function verifyBackupCode(email: string, code: string): Promise<boolean> {
  const twoFa = await prisma.twoFactorSecret.findUnique({
    where: { email },
    select: { backupCodes: true }
  })

  if (!twoFa) return false

  const codeHash = hashBackupCode(code)
  const idx = twoFa.backupCodes.indexOf(codeHash)
  if (idx === -1) return false

  // Remove used code from array
  const remaining = [...twoFa.backupCodes]
  remaining.splice(idx, 1)
  await prisma.twoFactorSecret.update({
    where: { email },
    data: { backupCodes: remaining }
  })

  return true
}

// ============================================================================
// Enable/Disable 2FA
// ============================================================================

export async function enable2FA(
  email: string,
  totpSecret: string,
  backupCodes: string[]
): Promise<boolean> {
  try {
    const hashedCodes = backupCodes.map(hashBackupCode)

    await prisma.twoFactorSecret.upsert({
      where: { email },
      update: {
        secret: totpSecret,
        backupCodes: hashedCodes,
        enabled: true,
        enabledAt: new Date(),
      },
      create: {
        email,
        secret: totpSecret,
        backupCodes: hashedCodes,
        enabled: true,
        enabledAt: new Date(),
      }
    })

    await logSecurityEvent('2FA_ENABLED', email, { method: 'TOTP' })
    return true
  } catch (error) {
    console.error('Enable 2FA error:', error)
    return false
  }
}

export async function disable2FA(email: string): Promise<boolean> {
  try {
    await prisma.twoFactorSecret.update({
      where: { email },
      data: {
        enabled: false,
        backupCodes: [],
      }
    })

    await logSecurityEvent('2FA_DISABLED', email, {})
    return true
  } catch (error) {
    console.error('Disable 2FA error:', error)
    return false
  }
}

export async function is2FAEnabled(email: string): Promise<boolean> {
  const twoFa = await prisma.twoFactorSecret.findUnique({
    where: { email },
    select: { enabled: true }
  })

  return twoFa?.enabled ?? false
}

// ============================================================================
// 2FA Session Management
// ============================================================================

export async function create2FASession(email: string): Promise<string> {
  const sessionId = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  ;(global as any).twoFASessions = (global as any).twoFASessions || new Map()
  ;(global as any).twoFASessions.set(sessionId, { email, expiresAt, verified: false })

  return sessionId
}

export async function verify2FASession(
  sessionId: string,
  totpCode: string,
  backupCode?: string
): Promise<boolean> {
  ;(global as any).twoFASessions = (global as any).twoFASessions || new Map()
  const session = (global as any).twoFASessions.get(sessionId)

  if (!session || new Date() > session.expiresAt) return false

  const twoFa = await prisma.twoFactorSecret.findUnique({
    where: { email: session.email },
    select: { secret: true, enabled: true }
  })

  if (!twoFa?.enabled) return false

  let isValid = false

  if (totpCode && twoFa.secret) {
    isValid = verifyTOTPToken(twoFa.secret, totpCode)
  }

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

export function is2FASessionVerified(sessionId: string): boolean {
  ;(global as any).twoFASessions = (global as any).twoFASessions || new Map()
  const session = (global as any).twoFASessions.get(sessionId)

  if (!session || new Date() > session.expiresAt) return false
  return session.verified === true
}

// ============================================================================
// Helper: Security Event Logging
// ============================================================================

async function logSecurityEvent(eventType: string, email: string, metadata: any): Promise<void> {
  console.log(`[SECURITY] ${eventType} - ${email}`, metadata)
}
