import { prisma } from '@/lib/db'
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
  const prefix = key.substring(0, 10) // "sk_" + 7 chars
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : null

  const apiKey = await prisma.apiKey.create({
    data: {
      email,
      name,
      keyHash,
      prefix,
      expiresAt,
      lastUsedAt: null,
    }
  })

  await logSecurityEvent(AuditAction.API_KEY_CREATED, email, {
    resourceType: 'API_KEY',
    resourceId: apiKey.id,
    changes: { name, expiresAt }
  })

  return { key, id: apiKey.id }
}

export async function getAPIKey(email: string, keyId: string): Promise<any> {
  return prisma.apiKey.findFirst({
    where: { id: keyId, email },
    select: {
      id: true,
      name: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true
    }
  })
}

export async function listAPIKeys(email: string): Promise<any[]> {
  return prisma.apiKey.findMany({
    where: { email },
    select: {
      id: true,
      name: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function verifyAPIKey(key: string): Promise<string | null> {
  const keyHash = hashAPIKey(key)

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      revokedAt: null,
    },
    select: { id: true, email: true, expiresAt: true, revokedAt: true }
  })

  if (!apiKey) return null
  if ((apiKey as any).revokedAt) return null  // belt-and-suspenders: mock may return revoked keys
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) return null

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: {
      lastUsedAt: new Date(),
      usageCount: { increment: 1 },
    }
  })

  await logSecurityEvent(AuditAction.API_KEY_USED, apiKey.email, {
    resourceType: 'API_KEY',
    resourceId: apiKey.id
  })

  return apiKey.email
}

export async function revokeAPIKey(email: string, keyId: string): Promise<boolean> {
  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, email }
  })

  if (!apiKey) throw new Error('API key not found')

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() }
  })

  await logSecurityEvent(AuditAction.API_KEY_REVOKED, email, {
    resourceType: 'API_KEY',
    resourceId: keyId,
    changes: { name: apiKey.name }
  })

  return true
}

export async function revokeAllAPIKeys(email: string): Promise<number> {
  const result = await prisma.apiKey.updateMany({
    where: { email, revokedAt: null },
    data: { revokedAt: new Date() }
  })

  await logSecurityEvent(AuditAction.API_KEY_REVOKED, email, {
    changes: { revokedAll: true, count: result.count }
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
    where: { expiresAt: { lt: new Date() } }
  })

  console.log(`[CLEANUP] Removed ${result.count} expired API keys`)
  return result.count
}
