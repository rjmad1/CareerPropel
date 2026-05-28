import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'
import { getAuthorizationMetrics } from '@/lib/security/authorization/authorizationTelemetry'

export const dynamic = 'force-dynamic'

/** GET /api/admin/runtime/health — runtime health overview for the admin console */
export async function GET(_request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'system.health.read', { actorId: userId })

    const [
      activeExecutions,
      failedExecutions,
      queuedExecutions,
      recentErrors,
      activeWorkflows,
    ] = await Promise.all([
      prisma.agentExecution.count({ where: { status: 'running' } }),
      prisma.agentExecution.count({ where: { status: 'failed' } }),
      prisma.agentExecution.count({ where: { status: 'queued' } }),
      prisma.agentExecution.count({
        where: { status: 'failed', createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
      }),
      prisma.workflowExecution.count({ where: { status: { in: ['running', 'queued'] } } }),
    ])

    const authzMetrics = getAuthorizationMetrics()

    return successResponse({
      runtime: {
        activeExecutions,
        failedExecutions,
        queuedExecutions,
        recentErrors,
        activeWorkflows,
      },
      authorization: authzMetrics,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return errorResponse(err)
  }
}
