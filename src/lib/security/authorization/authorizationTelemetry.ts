/**
 * Authorization telemetry — structured decision logging and metrics emission.
 * Every authorization decision should flow through recordDecision().
 */

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { log } from '@/lib/logging/logger'

interface DecisionContext {
  actorId?: string
  actorEmail: string
  targetEmail?: string
  permission: string
  decision: 'allow' | 'deny'
  reason?: string
  resource?: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  correlationId?: string
  requestId?: string
  metadata?: Record<string, unknown>
}

// In-process counters — approximate; no guarantee across workers.
const _counters = {
  checks: 0,
  denials: 0,
  escalations: 0,
  impersonations: 0,
}

export function getAuthorizationMetrics() {
  return { ..._counters }
}

/**
 * Records a structured authorization decision to the AuthorizationAuditLog table.
 * Non-blocking — failures are swallowed to never impede the request path.
 */
export async function recordDecision(ctx: DecisionContext): Promise<void> {
  _counters.checks++
  if (ctx.decision === 'deny') _counters.denials++
  if (ctx.permission === 'users.impersonate') _counters.impersonations++
  if (ctx.permission.startsWith('rbac.')) _counters.escalations++

  try {
    await prisma.authorizationAuditLog.create({
      data: {
        actorId:       ctx.actorId,
        actorEmail:    ctx.actorEmail,
        targetEmail:   ctx.targetEmail,
        permission:    ctx.permission,
        decision:      ctx.decision,
        reason:        ctx.reason,
        resource:      ctx.resource,
        resourceId:    ctx.resourceId,
        ipAddress:     ctx.ipAddress,
        userAgent:     ctx.userAgent,
        correlationId: ctx.correlationId,
        requestId:     ctx.requestId,
        metadata:      ctx.metadata as Prisma.InputJsonValue | undefined,
      },
    })
  } catch (err) {
    // Never throw — telemetry failures must not block requests
    log.warn({ err }, '[AuthzTelemetry] Failed to persist authorization decision')
  }
}

/**
 * Emits a structured log entry without persisting to DB.
 * Use for high-frequency allow decisions where DB write would be excessive.
 */
export function logDecision(ctx: Omit<DecisionContext, 'actorId'>): void {
  _counters.checks++
  if (ctx.decision === 'deny') _counters.denials++
  log.info(
    { permission: ctx.permission, decision: ctx.decision, actor: ctx.actorEmail, reason: ctx.reason },
    '[Authz] Authorization decision'
  )
}
