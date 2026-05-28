import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/admin/security/events — security-relevant audit events and denial spikes */
export async function GET(request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'threats.read', { actorId: userId })

    const { searchParams } = new URL(request.url)
    const hours = Math.min(168, parseInt(searchParams.get('hours') ?? '24', 10))
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    const [denials, escalations, impersonations, criticalAudit] = await Promise.all([
      // Authorization denials
      prisma.authorizationAuditLog.groupBy({
        by: ['actorEmail'],
        where: { decision: 'deny', createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: { _count: { actorEmail: 'desc' } },
        take: 20,
      }),
      // RBAC escalation attempts
      prisma.authorizationAuditLog.findMany({
        where: { permission: { startsWith: 'rbac.' }, decision: 'deny', createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      // Impersonation events
      prisma.authorizationAuditLog.findMany({
        where: { permission: 'users.impersonate', createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      // Critical AuditLog events
      prisma.auditLog.findMany({
        where: { severity: 'critical', createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ])

    return successResponse({
      period: { hours, since: since.toISOString() },
      denials: denials.map((d) => ({ actorEmail: d.actorEmail, count: d._count._all })),
      escalationAttempts: escalations,
      impersonations,
      criticalAuditEvents: criticalAudit,
    })
  } catch (err) {
    return errorResponse(err)
  }
}
