import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/admin/runtime/queues — queue depth and recent execution telemetry */
export async function GET(_request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'queue.read', { actorId: userId })

    const [queuedByType, recentFailed, stalled] = await Promise.all([
      prisma.agentExecution.groupBy({
        by: ['agentType', 'status'],
        _count: { _all: true },
        where: { status: { in: ['queued', 'running', 'paused'] } },
      }),
      prisma.agentExecution.findMany({
        where: { status: 'failed', createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        select: { id: true, agentType: true, userId: true, errorMessage: true, failureClassification: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      // Stalled: running but no heartbeat in >10 min
      prisma.agentExecution.findMany({
        where: {
          status: 'running',
          updatedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) },
        },
        select: { id: true, agentType: true, userId: true, startedAt: true, updatedAt: true },
        take: 20,
      }),
    ])

    return successResponse({
      depth: queuedByType.map((g) => ({
        agentType: g.agentType,
        status: g.status,
        count: g._count._all,
      })),
      recentFailed,
      stalled,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return errorResponse(err)
  }
}
