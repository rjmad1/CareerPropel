/**
 * Capability resolver — assembles the effective permission set for a user.
 *
 * Resolution order (matches policyEngine evaluation):
 *   1. SUPER_ADMIN wildcard (short-circuits everything)
 *   2. Explicit deny overrides  (UserCapabilityOverride effect=deny)
 *   3. Explicit allow overrides (UserCapabilityOverride effect=allow)
 *   4. Role-derived permissions (active, non-expired UserRoles → permissions)
 *   5. Default deny
 */

import { prisma } from '@/lib/db'
import { WILDCARD_PERMISSION } from './permissionRegistry'
import {
  getCachedPermissions, setCachedPermissions,
  getCachedSuperAdmin, setCachedSuperAdmin,
} from './authorizationCache'

export interface ResolvedCapabilities {
  permissions: string[]    // effective granted permissions
  isSuperAdmin: boolean
  deniedPermissions: string[]
}

export async function resolveCapabilities(userEmail: string, userId?: string): Promise<ResolvedCapabilities> {
  // 1. Check super-admin cache
  const cachedSuper = await getCachedSuperAdmin(userEmail)
  if (cachedSuper === true) {
    return { permissions: [WILDCARD_PERMISSION], isSuperAdmin: true, deniedPermissions: [] }
  }

  // 2. Check permission cache
  if (cachedSuper === false) {
    const cached = await getCachedPermissions(userEmail)
    if (cached) {
      return { permissions: cached, isSuperAdmin: false, deniedPermissions: [] }
    }
  }

  const now = new Date()

  // 3. Load active roles (non-expired)
  const userRoles = await prisma.userRole.findMany({
    where: {
      email: userEmail,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  })

  // Check for SUPER_ADMIN role
  const isSuperAdmin = userRoles.some((ur) => ur.role.roleType === 'SUPER_ADMIN')
  if (isSuperAdmin) {
    await setCachedSuperAdmin(userEmail, true)
    return { permissions: [WILDCARD_PERMISSION], isSuperAdmin: true, deniedPermissions: [] }
  }

  // 4. Collect role-derived permissions
  const rolePermissions = new Set<string>()
  for (const ur of userRoles) {
    for (const rp of ur.role.permissions) {
      rolePermissions.add(rp.permission.name)
    }
  }

  // 5. Apply per-user overrides (if userId provided)
  const deniedSet = new Set<string>()
  if (userId) {
    const overrides = await prisma.userCapabilityOverride.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      include: { permission: true },
    })

    for (const ov of overrides) {
      if (ov.effect === 'deny') {
        rolePermissions.delete(ov.permission.name)
        deniedSet.add(ov.permission.name)
      } else {
        rolePermissions.add(ov.permission.name)
      }
    }
  }

  const permissions = Array.from(rolePermissions)
  await setCachedSuperAdmin(userEmail, false)
  await setCachedPermissions(userEmail, permissions)

  return { permissions, isSuperAdmin: false, deniedPermissions: Array.from(deniedSet) }
}

/** Checks if the given permission is in the resolved set (respects wildcard). */
export function hasCapability(resolved: ResolvedCapabilities, permission: string): boolean {
  if (resolved.isSuperAdmin || resolved.permissions.includes(WILDCARD_PERMISSION)) return true
  if (resolved.deniedPermissions.includes(permission)) return false
  return resolved.permissions.includes(permission)
}
