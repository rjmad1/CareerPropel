/**
 * Authorization service — canonical entry point for all permission checks.
 * All API routes, middleware, and queue workers must use this service.
 * NEVER check permissions inline; always delegate here.
 *
 * Also handles seeding the permission/role registry into the database.
 */

import { prisma } from '@/lib/db'
import { evaluate, evaluateAll, evaluateAny, PolicyContext } from './policyEngine'
import { resolveCapabilities } from './capabilityResolver'
import { invalidateUserCache } from './authorizationCache'
import { PERMISSION_REGISTRY } from './permissionRegistry'
import { SYSTEM_ROLES } from './roleRegistry'
import { log } from '@/lib/logging/logger'

export { evaluate, evaluateAll, evaluateAny }
export type { PolicyContext }

// ─── Core Authorization API ──────────────────────────────────────────────────

/** Check a single permission for the current actor. */
export async function can(
  actorEmail: string,
  permission: string,
  opts?: { actorId?: string; resource?: string; resourceId?: string; skipAuditLog?: boolean }
): Promise<boolean> {
  const result = await evaluate({
    actorEmail,
    permission,
    actorId: opts?.actorId,
    resource: opts?.resource,
    resourceId: opts?.resourceId,
    skipAuditLog: opts?.skipAuditLog ?? true,
  })
  return result.allowed
}

/** Throws 403 if the actor does not hold the permission. */
export async function requireCan(
  actorEmail: string,
  permission: string,
  opts?: { actorId?: string; resource?: string; resourceId?: string }
): Promise<void> {
  const result = await evaluate({ actorEmail, permission, actorId: opts?.actorId, resource: opts?.resource, resourceId: opts?.resourceId })
  if (!result.allowed) {
    const { ApiErrors } = await import('@/lib/errors/ApiError')
    throw ApiErrors.FORBIDDEN(permission)
  }
}

/** Returns true if the actor is a SUPER_ADMIN. */
export async function isSuperAdmin(actorEmail: string): Promise<boolean> {
  const resolved = await resolveCapabilities(actorEmail)
  return resolved.isSuperAdmin
}

/** Returns the full effective permission set for the actor. */
export async function getEffectivePermissions(actorEmail: string, actorId?: string): Promise<string[]> {
  const resolved = await resolveCapabilities(actorEmail, actorId)
  return resolved.permissions
}

// ─── Role Administration ─────────────────────────────────────────────────────

export async function assignRole(
  email: string,
  roleName: string,
  grantedBy: string,
  opts?: { expiresAt?: Date; justification?: string }
): Promise<void> {
  const role = await prisma.role.findUnique({ where: { name: roleName } })
  if (!role) throw new Error(`Role "${roleName}" not found`)

  await prisma.userRole.upsert({
    where: { email_roleId: { email, roleId: role.id } },
    update: { isActive: true, grantedBy, grantedAt: new Date(), revokedAt: null, revokedBy: null, expiresAt: opts?.expiresAt, justification: opts?.justification },
    create: { email, roleId: role.id, grantedBy, expiresAt: opts?.expiresAt, justification: opts?.justification },
  })

  await invalidateUserCache(email)
}

export async function revokeRole(
  email: string,
  roleName: string,
  revokedBy: string,
  justification?: string
): Promise<void> {
  const role = await prisma.role.findUnique({ where: { name: roleName } })
  if (!role) throw new Error(`Role "${roleName}" not found`)

  await prisma.userRole.updateMany({
    where: { email, roleId: role.id },
    data: { isActive: false, revokedBy, revokedAt: new Date(), justification },
  })

  await invalidateUserCache(email)
}

// ─── Feature Flag Evaluation ─────────────────────────────────────────────────

export async function isFeatureEnabled(
  key: string,
  opts?: { userId?: string; userEmail?: string; userRoles?: string[] }
): Promise<boolean> {
  const { getCachedFeatureFlag, setCachedFeatureFlag } = await import('./authorizationCache')
  const cached = await getCachedFeatureFlag(key)
  if (cached !== null) return cached

  const flag = await prisma.featureFlag.findUnique({ where: { key } })
  if (!flag || !flag.enabled) {
    await setCachedFeatureFlag(key, false)
    return false
  }

  let result = false
  switch (flag.rolloutStrategy) {
    case 'all':
      result = true
      break
    case 'disabled':
      result = false
      break
    case 'allowlist':
      result = !!opts?.userId && flag.allowedUserIds.includes(opts.userId)
      break
    case 'role_scoped':
      result = !!opts?.userRoles && flag.allowedRoles.some((r) => opts.userRoles!.includes(r))
      break
    case 'percentage': {
      if (!opts?.userId) { result = false; break }
      // Deterministic hash bucketing — same user always gets same bucket
      const hash = opts.userId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
      result = (hash % 100) < (flag.rolloutPercent ?? 0)
      break
    }
    default:
      result = false
  }

  await setCachedFeatureFlag(key, result)
  return result
}

// ─── Database Seeding ────────────────────────────────────────────────────────

/**
 * Seed (upsert) all canonical permissions and system roles into the database.
 * Idempotent — safe to run on every startup.
 */
export async function seedAuthorizationRegistry(): Promise<void> {
  try {
    // Upsert permissions
    for (const perm of PERMISSION_REGISTRY) {
      await prisma.permission.upsert({
        where: { name: perm.key },
        update: { description: perm.description, resource: perm.resource, action: perm.action, systemProtected: perm.systemProtected },
        create: {
          name: perm.key,
          description: perm.description,
          resource: perm.resource,
          action: perm.action,
          systemProtected: perm.systemProtected,
        },
      })
    }

    // Upsert roles + permissions
    for (const roleDef of SYSTEM_ROLES) {
      const role = await prisma.role.upsert({
        where: { name: roleDef.name },
        update: {
          description: roleDef.description,
          roleType: roleDef.roleType,
          immutableSystemRole: roleDef.immutableSystemRole,
          priority: roleDef.priority,
        },
        create: {
          name: roleDef.name,
          description: roleDef.description,
          roleType: roleDef.roleType,
          immutableSystemRole: roleDef.immutableSystemRole,
          priority: roleDef.priority,
        },
      })

      if (roleDef.permissions[0] === '*') continue // Wildcard — no specific DB links needed

      const permRecords = await prisma.permission.findMany({
        where: { name: { in: roleDef.permissions } },
      })

      for (const perm of permRecords) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        })
      }
    }

    log.info('[AuthzService] Permission/role registry seeded successfully')
  } catch (err) {
    log.error({ err }, '[AuthzService] Failed to seed authorization registry')
    throw err
  }
}
