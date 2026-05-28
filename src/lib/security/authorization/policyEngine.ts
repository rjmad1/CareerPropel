/**
 * Policy engine — evaluates complex permission logic.
 * Implements the layered resolution model; delegates to capabilityResolver for the base set.
 *
 * Resolution order:
 *   1. SUPER_ADMIN bypass
 *   2. Explicit deny overrides
 *   3. Explicit allow overrides
 *   4. Role-derived permissions
 *   5. Ownership checks (for self-scoped resources)
 *   6. Default deny
 */

import { resolveCapabilities, hasCapability } from './capabilityResolver'
import { isResourceOwner } from './ownershipEvaluator'
import { recordDecision } from './authorizationTelemetry'

export interface PolicyContext {
  actorId?: string
  actorEmail: string
  permission: string
  resource?: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  correlationId?: string
  /** Skip DB audit log for high-frequency read checks */
  skipAuditLog?: boolean
}

export interface PolicyResult {
  allowed: boolean
  reason: string
  isSuperAdmin: boolean
}

export async function evaluate(ctx: PolicyContext): Promise<PolicyResult> {
  const resolved = await resolveCapabilities(ctx.actorEmail, ctx.actorId)

  // 1. Super-admin bypass
  if (resolved.isSuperAdmin) {
    if (!ctx.skipAuditLog) {
      await recordDecision({ ...ctx, decision: 'allow', reason: 'super_admin_bypass' })
    }
    return { allowed: true, reason: 'super_admin_bypass', isSuperAdmin: true }
  }

  // 2–4. Check capability set (includes deny overrides)
  if (hasCapability(resolved, ctx.permission)) {
    // 5. For resource-scoped reads on owned resources, enforce ownership if no admin perm
    if (ctx.resourceId && ctx.resource && ctx.actorId) {
      const ownerPerm = `${ctx.resource}.manage`
      const hasManage = hasCapability(resolved, ownerPerm) || hasCapability(resolved, 'system.admin.access')
      if (!hasManage) {
        const owns = await isResourceOwner({ actorId: ctx.actorId, resource: ctx.resource, resourceId: ctx.resourceId })
        if (!owns) {
          if (!ctx.skipAuditLog) {
            await recordDecision({ ...ctx, decision: 'deny', reason: 'not_owner' })
          }
          return { allowed: false, reason: 'not_owner', isSuperAdmin: false }
        }
      }
    }

    if (!ctx.skipAuditLog) {
      await recordDecision({ ...ctx, decision: 'allow', reason: 'role_permission' })
    }
    return { allowed: true, reason: 'role_permission', isSuperAdmin: false }
  }

  // 6. Default deny
  if (!ctx.skipAuditLog) {
    await recordDecision({ ...ctx, decision: 'deny', reason: 'no_matching_permission' })
  }
  return { allowed: false, reason: 'no_matching_permission', isSuperAdmin: false }
}

/** Convenience: evaluates multiple permissions with AND semantics. */
export async function evaluateAll(ctx: PolicyContext, permissions: string[]): Promise<PolicyResult> {
  for (const perm of permissions) {
    const result = await evaluate({ ...ctx, permission: perm })
    if (!result.allowed) return result
  }
  return { allowed: true, reason: 'all_permissions_granted', isSuperAdmin: false }
}

/** Convenience: evaluates multiple permissions with OR semantics. */
export async function evaluateAny(ctx: PolicyContext, permissions: string[]): Promise<PolicyResult> {
  for (const perm of permissions) {
    const result = await evaluate({ ...ctx, permission: perm, skipAuditLog: true })
    if (result.allowed) {
      if (!ctx.skipAuditLog) {
        await recordDecision({ ...ctx, permission: permissions.join('|'), decision: 'allow', reason: 'any_permission_granted' })
      }
      return result
    }
  }
  if (!ctx.skipAuditLog) {
    await recordDecision({ ...ctx, permission: permissions.join('|'), decision: 'deny', reason: 'no_matching_permission' })
  }
  return { allowed: false, reason: 'no_matching_permission', isSuperAdmin: false }
}
