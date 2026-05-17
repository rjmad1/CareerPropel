import { prisma } from "@/lib/db"
import { createHash, randomBytes } from 'crypto'
import { logSecurityEvent, AuditAction } from '@/lib/logging/auditLog'


/**
 * API Key Management
 * Allows users to create API keys for programmatic access
 */

/**
 * Generate new API key
 * Format: sk_live_xxxxxxxxxxxx (32 random bytes)
 */
export function generateAPIKey(): string {
  return 'sk_' + randomBytes(32).toString('hex')
}

/**
 * Hash API key for secure storage
 */
export function hashAPIKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Create new API key for user
 */
export async function createAPIKey(
  email: string,
  name: string,
  expiresIn?: number // milliseconds, undefined = no expiration
): Promise<{ key: string; id: string }> {
  const candidate = await prisma.candidate.findUnique({
    where: { email },
    select: { id: true }
  })

  if (!candidate) {
    throw new Error('User not found')
  }

  const key = generateAPIKey()
  const keyHash = hashAPIKey(key)
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : null

  const apiKey = await prisma.apiKey.create({
    data: {
      candidateId: candidate.id,
      name,
      keyHash,
      expiresAt,
      lastUsedAt: null,
      createdAt: new Date()
    }
  })

  // Log security event
  await logSecurityEvent(AuditAction.API_KEY_CREATED, email, {
    resourceType: 'API_KEY',
    resourceId: apiKey.id,
    changes: { name, expiresAt }
  })

  return {
    key, // Only return once!
    id: apiKey.id
  }
}

/**
 * Get API key details (without revealing the key)
 */
export async function getAPIKey(email: string, keyId: string): Promise<any> {
  const candidate = await prisma.candidate.findUnique({
    where: { email },
    select: { id: true }
  })

  if (!candidate) {
    throw new Error('User not found')
  }

  return prisma.apiKey.findFirst({
    where: {
      id: keyId,
      candidateId: candidate.id
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true
    }
  })
}

/**
 * List all API keys for user
 */
export async function listAPIKeys(email: string): Promise<any[]> {
  const candidate = await prisma.candidate.findUnique({
    where: { email },
    select: { id: true }
  })

  if (!candidate) {
    throw new Error('User not found')
  }

  return prisma.apiKey.findMany({
    where: { candidateId: candidate.id },
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

/**
 * Verify API key
 * Returns email if valid, null otherwise
 */
export async function verifyAPIKey(key: string): Promise<string | null> {
  const keyHash = hashAPIKey(key)

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      candidate: {
        twoFactorEnabled: true // Only allow for verified accounts
      }
    },
    include: { candidate: { select: { email: true } } }
  })

  if (!apiKey) {
    return null
  }

  // Check if key is expired
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
    return null
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() }
  })

  // Log usage
  await logSecurityEvent(AuditAction.API_KEY_USED, apiKey.candidate.email, {
    resourceType: 'API_KEY',
    resourceId: apiKey.id
  })

  return apiKey.candidate.email
}

/**
 * Revoke API key
 */
export async function revokeAPIKey(email: string, keyId: string): Promise<boolean> {
  const candidate = await prisma.candidate.findUnique({
    where: { email },
    select: { id: true }
  })

  if (!candidate) {
    throw new Error('User not found')
  }

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: keyId,
      candidateId: candidate.id
    }
  })

  if (!apiKey) {
    throw new Error('API key not found')
  }

  await prisma.apiKey.delete({
    where: { id: keyId }
  })

  // Log security event
  await logSecurityEvent(AuditAction.API_KEY_REVOKED, email, {
    resourceType: 'API_KEY',
    resourceId: keyId,
    changes: { name: apiKey.name }
  })

  return true
}

/**
 * Revoke all API keys for user
 * Useful when account is compromised
 */
export async function revokeAllAPIKeys(email: string): Promise<number> {
  const candidate = await prisma.candidate.findUnique({
    where: { email },
    select: { id: true }
  })

  if (!candidate) {
    throw new Error('User not found')
  }

  const result = await prisma.apiKey.deleteMany({
    where: { candidateId: candidate.id }
  })

  // Log security event
  await logSecurityEvent(AuditAction.API_KEY_REVOKED, email, {
    changes: { revokedAll: true, count: result.count }
  })

  return result.count
}

/**
 * Rotate API key
 * Creates new key and revokes old one
 */
export async function rotateAPIKey(
  email: string,
  keyId: string
): Promise<{ newKey: string; newId: string }> {
  const oldKey = await getAPIKey(email, keyId)
  if (!oldKey) {
    throw new Error('API key not found')
  }

  // Create new key
  const { key: newKey, id: newId } = await createAPIKey(
    email,
    `${oldKey.name} (rotated)`,
    oldKey.expiresAt ? oldKey.expiresAt.getTime() - Date.now() : undefined
  )

  // Revoke old key
  await revokeAPIKey(email, keyId)

  return { newKey, newId }
}

/**
 * Cleanup expired API keys
 * Call periodically
 */
export async function cleanupExpiredKeys(): Promise<number> {
  const result = await prisma.apiKey.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })

  console.log(`[CLEANUP] Removed ${result.count} expired API keys`)
  return result.count
}
