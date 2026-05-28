/**
 * Redis-backed authorization cache.
 * TTL is intentionally short (60s) — correctness beats cache efficiency.
 * All invalidation paths must be called on role/permission/override mutations.
 */

import { log } from '@/lib/logging/logger'

const CACHE_TTL_SECONDS = 60
const PREFIX_PERMS = 'authz:perms:'
const PREFIX_SUPER = 'authz:super:'
const PREFIX_FLAGS = 'authz:flags:'

function getRedis() {
  // Lazy import to avoid module-load issues in environments without Redis
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('ioredis') as typeof import('ioredis')
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
  if (!url) return null
  try {
    return new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 })
  } catch {
    return null
  }
}

let _redis: ReturnType<typeof getRedis> | undefined

function redis() {
  if (_redis === undefined) _redis = getRedis()
  return _redis
}

export async function getCachedPermissions(userEmail: string): Promise<string[] | null> {
  try {
    const r = redis()
    if (!r) return null
    const raw = await r.get(`${PREFIX_PERMS}${userEmail}`)
    if (!raw) return null
    return JSON.parse(raw) as string[]
  } catch (err) {
    log.warn({ err }, '[AuthzCache] Redis get failed, bypassing cache')
    return null
  }
}

export async function setCachedPermissions(userEmail: string, permissions: string[]): Promise<void> {
  try {
    const r = redis()
    if (!r) return
    await r.setex(`${PREFIX_PERMS}${userEmail}`, CACHE_TTL_SECONDS, JSON.stringify(permissions))
  } catch (err) {
    log.warn({ err }, '[AuthzCache] Redis set failed')
  }
}

export async function getCachedSuperAdmin(userEmail: string): Promise<boolean | null> {
  try {
    const r = redis()
    if (!r) return null
    const val = await r.get(`${PREFIX_SUPER}${userEmail}`)
    if (val === null) return null
    return val === '1'
  } catch {
    return null
  }
}

export async function setCachedSuperAdmin(userEmail: string, isSuperAdmin: boolean): Promise<void> {
  try {
    const r = redis()
    if (!r) return
    await r.setex(`${PREFIX_SUPER}${userEmail}`, CACHE_TTL_SECONDS, isSuperAdmin ? '1' : '0')
  } catch (err) {
    log.warn({ err }, '[AuthzCache] Redis super-admin cache set failed')
  }
}

export async function getCachedFeatureFlag(key: string): Promise<boolean | null> {
  try {
    const r = redis()
    if (!r) return null
    const val = await r.get(`${PREFIX_FLAGS}${key}`)
    if (val === null) return null
    return val === '1'
  } catch {
    return null
  }
}

export async function setCachedFeatureFlag(key: string, enabled: boolean): Promise<void> {
  try {
    const r = redis()
    if (!r) return
    await r.setex(`${PREFIX_FLAGS}${key}`, CACHE_TTL_SECONDS, enabled ? '1' : '0')
  } catch (err) {
    log.warn({ err }, '[AuthzCache] Redis feature-flag cache set failed')
  }
}

/** Invalidate all cached authorization state for a user. Call on any role/override change. */
export async function invalidateUserCache(userEmail: string): Promise<void> {
  try {
    const r = redis()
    if (!r) return
    await r.del(`${PREFIX_PERMS}${userEmail}`, `${PREFIX_SUPER}${userEmail}`)
  } catch (err) {
    log.warn({ err }, '[AuthzCache] Cache invalidation failed')
  }
}

/** Invalidate a specific feature flag cache entry. Call on flag updates. */
export async function invalidateFeatureFlagCache(key: string): Promise<void> {
  try {
    const r = redis()
    if (!r) return
    await r.del(`${PREFIX_FLAGS}${key}`)
  } catch (err) {
    log.warn({ err }, '[AuthzCache] Feature flag cache invalidation failed')
  }
}
