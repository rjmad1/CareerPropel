import '../../../__mocks__/prisma'
import { prismaMock } from '../../../__mocks__/prisma'
import { generateAPIKey, hashAPIKey, createAPIKey, verifyAPIKey, revokeAPIKey, listAPIKeys } from '@/lib/security/apiKey'

jest.mock('@/lib/logging/auditLog', () => ({
  logSecurityEvent: jest.fn().mockResolvedValue(undefined),
  AuditAction: {
    API_KEY_CREATED: 'API_KEY_CREATED',
    API_KEY_REVOKED: 'API_KEY_REVOKED',
    API_KEY_USED: 'API_KEY_USED',
  },
}))

describe('generateAPIKey', () => {
  it('starts with "sk_"', () => {
    expect(generateAPIKey()).toMatch(/^sk_/)
  })

  it('generates a key of consistent length (sk_ + 64 hex chars = 67)', () => {
    const key = generateAPIKey()
    expect(key).toHaveLength(67) // 'sk_' (3) + 32 bytes as hex (64)
  })

  it('generates unique keys on each call', () => {
    const keys = new Set(Array.from({ length: 20 }, generateAPIKey))
    expect(keys.size).toBe(20)
  })
})

describe('hashAPIKey', () => {
  it('returns a 64-char hex SHA-256 hash', () => {
    const hash = hashAPIKey('sk_abc123')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]+$/)
  })

  it('is deterministic for the same input', () => {
    const key = 'sk_deterministic'
    expect(hashAPIKey(key)).toBe(hashAPIKey(key))
  })

  it('produces different hashes for different inputs', () => {
    expect(hashAPIKey('sk_aaa')).not.toBe(hashAPIKey('sk_bbb'))
  })
})

describe('createAPIKey', () => {
  const mockCreatedKey = {
    id: 'key-id-1',
    email: 'user@example.com',
    name: 'Test Key',
    keyHash: 'hash',
    prefix: 'sk_abc',
    expiresAt: null,
    lastUsedAt: null,
    createdAt: new Date(),
    revokedAt: null,
    usageCount: 0,
  }

  beforeEach(() => {
    prismaMock.apiKey.create.mockResolvedValue(mockCreatedKey as any)
  })

  it('returns a key starting with sk_ and an id', async () => {
    const { key, id } = await createAPIKey('user@example.com', 'Test Key')
    expect(key).toMatch(/^sk_/)
    expect(id).toBe('key-id-1')
  })

  it('calls prisma.apiKey.create with correct data', async () => {
    await createAPIKey('user@example.com', 'Test Key')
    expect(prismaMock.apiKey.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'user@example.com',
          name: 'Test Key',
        }),
      })
    )
  })

  it('sets expiresAt when expiresIn is provided', async () => {
    await createAPIKey('user@example.com', 'Expiring Key', 3600000) // 1 hour
    const call = prismaMock.apiKey.create.mock.calls[0][0]
    expect(call.data.expiresAt).toBeInstanceOf(Date)
    expect(call.data.expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('sets expiresAt to null when no expiry', async () => {
    await createAPIKey('user@example.com', 'No Expiry Key')
    const call = prismaMock.apiKey.create.mock.calls[0][0]
    expect(call.data.expiresAt).toBeNull()
  })
})

describe('listAPIKeys', () => {
  it('returns list of API key summaries', async () => {
    const mockKeys = [
      {
        id: 'key-1',
        name: 'Key 1',
        prefix: 'sk_abc',
        createdAt: new Date(),
        expiresAt: null,
        lastUsedAt: null,
        revokedAt: null,
        usageCount: 5,
      },
    ]
    prismaMock.apiKey.findMany.mockResolvedValue(mockKeys as any)

    const result = await listAPIKeys('user@example.com')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Key 1')
  })
})

describe('verifyAPIKey', () => {
  it('returns null when key not found', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValue(null)
    const result = await verifyAPIKey('sk_nonexistent')
    expect(result).toBeNull()
  })

  it('returns null when key is revoked', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValue({
      id: 'key-1',
      email: 'user@example.com',
      revokedAt: new Date(),
      expiresAt: null,
    } as any)
    const result = await verifyAPIKey('sk_revoked')
    expect(result).toBeNull()
  })

  it('returns null when key is expired', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValue({
      id: 'key-1',
      email: 'user@example.com',
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1000), // expired 1 second ago
    } as any)
    const result = await verifyAPIKey('sk_expired')
    expect(result).toBeNull()
  })

  it('returns email when key is valid', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValue({
      id: 'key-1',
      email: 'user@example.com',
      revokedAt: null,
      expiresAt: null,
    } as any)
    prismaMock.apiKey.update.mockResolvedValue({} as any)

    const result = await verifyAPIKey('sk_valid')
    expect(result).toBe('user@example.com')
  })

  it('increments usage count on successful verification', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValue({
      id: 'key-1',
      email: 'user@example.com',
      revokedAt: null,
      expiresAt: null,
    } as any)
    prismaMock.apiKey.update.mockResolvedValue({} as any)

    await verifyAPIKey('sk_valid')
    expect(prismaMock.apiKey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usageCount: { increment: 1 },
        }),
      })
    )
  })
})

describe('revokeAPIKey', () => {
  it('sets revokedAt and returns true', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValue({
      id: 'key-1',
      email: 'user@example.com',
      name: 'Test Key',
    } as any)
    prismaMock.apiKey.update.mockResolvedValue({} as any)

    const result = await revokeAPIKey('user@example.com', 'key-1')
    expect(result).toBe(true)
    expect(prismaMock.apiKey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      })
    )
  })

  it('throws when key not found', async () => {
    prismaMock.apiKey.findFirst.mockResolvedValue(null)
    await expect(revokeAPIKey('user@example.com', 'ghost-key')).rejects.toThrow('API key not found')
  })
})
