import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'
import { logAuditEvent, AuditAction } from '@/lib/logging/auditLog'
import { transitionExecutionState } from '@/lib/runtime/execution-state-machine'

export const dynamic = 'force-dynamic'

const ReplayBody = z.object({
  executionId: z.string(),
  justification: z.string().optional(),
})

/** POST /api/admin/runtime/replay — re-queue a failed or dead-letter execution */
export async function POST(request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'queue.replay', { actorId: userId })

    const body = await request.json()
    const parsed = ReplayBody.safeParse(body)
    if (!parsed.success) throw ApiErrors.VALIDATION_ERROR('executionId required')

    const { executionId, justification } = parsed.data

    const execution = await prisma.agentExecution.findUnique({ where: { id: executionId } })
    if (!execution) throw ApiErrors.NOT_FOUND('execution')
    if (execution.status !== 'failed' && execution.status !== 'interrupted') {
      throw ApiErrors.INVALID_REQUEST('Only failed or interrupted executions can be replayed')
    }

    // Reset to queued state for worker pickup via state machine
    await transitionExecutionState(executionId, 'queued', {
      actor: userEmail,
      justification: justification || 'Admin manual replay trigger',
      correlationId: execution.correlationId || undefined,
      requestId: execution.requestId || undefined,
      userId: execution.userId,
    });

    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        errorMessage: null,
        retryCount: { increment: 1 },
        queuedAt: new Date(),
        executionSource: 'retry',
      },
    })

    await logAuditEvent({
      email: userEmail,
      action: AuditAction.SETTINGS_UPDATED,
      resourceType: 'agent_execution',
      resourceId: executionId,
      changes: { op: 'replay', previousStatus: execution.status, justification },
      status: 'SUCCESS',
    })

    return successResponse({ success: true, executionId, message: 'Execution re-queued for replay' })
  } catch (err) {
    return errorResponse(err)
  }
}
