import { prisma } from "@/lib/db"
import { redis } from "@/lib/redis/redisClient"
import { randomBytes, createHmac } from 'node:crypto'
import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'

const TWO_FA_SESSION_TTL = 5 * 60 // 5 minutes in seconds

// ─── HMAC key for backup codes ────────────────────────────────────────────────
// Uses a dedicated secret so NEXTAUTH_SECRET can be rotated independently.
function getBackupCodeHmacKey(): string {
  const key = process.env.BACKUP_CODE_HMAC_SECRET
  if (!key) throw new Error('BACKUP_CODE_HMAC_SECRET environment variable is required')
  return key
}

// ─── TOTP Setup ───────────────────────────────────────────────────────────────

export async function generateTOTPSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `CareerPropel (${email})`,
    issuer: 'CareerPropel',
    length: 32,
  })

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

  return {
    secret: secret.base32,
    qrCode,
    backupCodes: generateBackupCodes(),
  }
}

export function verifyTOTPToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  })
}

// ─── Backup Codes ─────────────────────────────────────────────────────────────

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    // 10 bytes = 80 bits of entropy; formatted as XXXXX-XXXXX-XXXXX-XXXXX
    const hex = randomBytes(10).toString('hex').toUpperCase()
    const code = hex.match(/.{1,5}/g)!.join('-')
    codes.push(code)
  }
  return codes
}

export function hashBackupCode(code: string): string {
  return createHmac('sha256', getBackupCodeHmacKey())
    .update(code.replaceAll('-', ''))
    .digest('hex')
}

// Verify and consume a backup code (single-use: removes it from the stored array).
export async function verifyBackupCode(email: string, code: string): Promise<boolean> {
  const record = await prisma.twoFactorSecret.findUnique({
    where: { email },
    select: { backupCodes: true },
  })
  if (!record) return false

  const codeHash = hashBackupCode(code)
  const idx = record.backupCodes.indexOf(codeHash)
  if (idx === -1) return false

  const remaining = record.backupCodes.filter((_, i) => i !== idx)
  await prisma.twoFactorSecret.update({
    where: { email },
    data: { backupCodes: remaining },
  })
  return true
}

// ─── Enable / Disable 2FA ─────────────────────────────────────────────────────

export async function enable2FA(
  email: string,
  totpSecret: string,
  backupCodes: string[]
): Promise<boolean> {
  try {
    const hashedCodes = backupCodes.map(hashBackupCode)
    await prisma.twoFactorSecret.upsert({
      where: { email },
      update: { secret: totpSecret, backupCodes: hashedCodes, enabled: true, enabledAt: new Date() },
      create: { email, secret: totpSecret, backupCodes: hashedCodes, enabled: true, enabledAt: new Date() },
    })
    return true
  } catch (error) {
    console.error('Enable 2FA error:', error)
    return false
  }
}

export async function disable2FA(email: string): Promise<boolean> {
  try {
    await prisma.twoFactorSecret.upsert({
      where: { email },
      update: { enabled: false, backupCodes: [] },
      create: { email, secret: '', backupCodes: [], enabled: false },
    })
    return true
  } catch (error) {
    console.error('Disable 2FA error:', error)
    return false
  }
}

export async function is2FAEnabled(email: string): Promise<boolean> {
  const record = await prisma.twoFactorSecret.findUnique({
    where: { email },
    select: { enabled: true },
  })
  return record?.enabled ?? false
}

// ─── 2FA Sessions (Redis-backed) ──────────────────────────────────────────────

interface TwoFASession {
  email: string
  verified: boolean
  createdAt: number
}

export async function create2FASession(email: string): Promise<string> {
  const sessionId = randomBytes(32).toString('hex')
  const session: TwoFASession = { email, verified: false, createdAt: Date.now() }
  await redis.setex(`2fa:session:${sessionId}`, TWO_FA_SESSION_TTL, JSON.stringify(session))
  return sessionId
}

async function get2FASession(sessionId: string): Promise<TwoFASession | null> {
  const data = await redis.get(`2fa:session:${sessionId}`)
  return data ? (JSON.parse(data) as TwoFASession) : null
}

export async function verify2FASession(
  sessionId: string,
  totpCode: string,
  backupCode?: string
): Promise<boolean> {
  const session = await get2FASession(sessionId)
  if (!session) return false

  const record = await prisma.twoFactorSecret.findUnique({
    where: { email: session.email },
    select: { secret: true, enabled: true },
  })

  if (!record?.enabled) return false

  let isValid = false

  if (totpCode && record.secret) {
    isValid = verifyTOTPToken(record.secret, totpCode)
  }

  if (!isValid && backupCode) {
    isValid = await verifyBackupCode(session.email, backupCode)
  }

  if (isValid) {
    const updated: TwoFASession = { ...session, verified: true }
    const ttl = await redis.ttl(`2fa:session:${sessionId}`)
    await redis.setex(`2fa:session:${sessionId}`, Math.max(ttl, 1), JSON.stringify(updated))
  }

  return isValid
}

export async function is2FASessionVerified(sessionId: string): Promise<boolean> {
  const session = await get2FASession(sessionId)
  return session?.verified === true
}
