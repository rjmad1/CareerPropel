import { prisma } from "@/lib/db"
import { createHash, randomBytes } from 'crypto'
import { logSecurityEvent, AuditAction } from '@/lib/logging/auditLog'

export function generateAPIKey(): string {
  return 'sk_' + randomBytes(32).toString('hex')
}

export function hashAPIKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export async function createAPIKey(
  email: string,
  name: string,
  expiresIn?: number
): Promise<{ key: string; id: string }> {
  const key = generateAPIKey()
  const keyHash = hashAPIKey(key)
  const prefix = key.slice(0, 7) // 'sk_' + 4 chars
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : null

  const apiKey = await prisma.apiKey.create({
    data: {
      email,
      name,
      keyHash,
      prefix,
      expiresAt,
      lastUsedAt: null,
    },
  })

  await logSecurityEvent(AuditAction.API_KEY_CREATED, email, {
    resource: 'API_KEY',
    resourceId: apiKey.id,
    details: { name, expiresAt },
  })

  return { key, id: apiKey.id }
}

export async function getAPIKey(email: string, keyId: string): Promise<{
  id: string; name: string; createdAt: Date; expiresAt: Date | null; lastUsedAt: Date | null
} | null> {
  return prisma.apiKey.findFirst({
    where: { id: keyId, email },
    select: { id: true, name: true, createdAt: true, expiresAt: true, lastUsedAt: true },
  })
}

export async function listAPIKeys(email: string): Promise<Array<{
  id: string; name: string; prefix: string; createdAt: Date; expiresAt: Date | null; lastUsedAt: Date | null; revokedAt: Date | null; usageCount: number;
}>> {
  return prisma.apiKey.findMany({
    where: { email },
    select: { id: true, name: true, prefix: true, createdAt: true, expiresAt: true, lastUsedAt: true, revokedAt: true, usageCount: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function verifyAPIKey(key: string): Promise<string | null> {
  const keyHash = hashAPIKey(key)

  const apiKey = await prisma.apiKey.findFirst({
    where: { keyHash },
    select: { id: true, email: true, expiresAt: true, revokedAt: true },
  })

  if (!apiKey) return null
  if (apiKey.revokedAt) return null
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) return null

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
  })

  await logSecurityEvent(AuditAction.API_KEY_USED, apiKey.email, {
    resource: 'API_KEY',
    resourceId: apiKey.id,
  })

  return apiKey.email
}

export async function revokeAPIKey(email: string, keyId: string): Promise<boolean> {
  const apiKey = await prisma.apiKey.findFirst({ where: { id: keyId, email } })
  if (!apiKey) throw new Error('API key not found')

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  })

  await logSecurityEvent(AuditAction.API_KEY_REVOKED, email, {
    resource: 'API_KEY',
    resourceId: keyId,
    details: { name: apiKey.name },
  })

  return true
}

export async function revokeAllAPIKeys(email: string): Promise<number> {
  const result = await prisma.apiKey.updateMany({
    where: { email, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  await logSecurityEvent(AuditAction.API_KEY_REVOKED, email, {
    details: { revokedAll: true, count: result.count },
  })

  return result.count
}

export async function rotateAPIKey(
  email: string,
  keyId: string
): Promise<{ newKey: string; newId: string }> {
  const oldKey = await getAPIKey(email, keyId)
  if (!oldKey) throw new Error('API key not found')

  const { key: newKey, id: newId } = await createAPIKey(
    email,
    `${oldKey.name} (rotated)`,
    oldKey.expiresAt ? oldKey.expiresAt.getTime() - Date.now() : undefined
  )

  await revokeAPIKey(email, keyId)

  return { newKey, newId }
}

export async function cleanupExpiredKeys(): Promise<number> {
  const result = await prisma.apiKey.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
  console.log(`[CLEANUP] Removed ${result.count} expired API keys`)
  return result.count
}
