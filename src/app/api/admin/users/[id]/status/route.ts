import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'
import { logAuditEvent, AuditAction } from '@/lib/logging/auditLog'

export const dynamic = 'force-dynamic'

const StatusBody = z.object({
  action: z.enum(['disable', 'enable']),
  justification: z.string().optional(),
})

/** PATCH /api/admin/users/[id]/status — enable or disable a user account */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'users.disable', { actorId: userId })

    const body = await request.json()
    const parsed = StatusBody.safeParse(body)
    if (!parsed.success) throw ApiErrors.VALIDATION_ERROR('Invalid status payload')

    const { action, justification } = parsed.data

    const target = await prisma.candidate.findUnique({ where: { id: params.id } })
    if (!target) throw ApiErrors.NOT_FOUND('user')

    // Self-disable guard
    if (target.id === userId) throw ApiErrors.FORBIDDEN('Cannot disable your own account')

    // Toggle email verification as a proxy for active/disabled state
    const emailVerified = action === 'enable'
    await prisma.candidate.update({ where: { id: params.id }, data: { emailVerified } })

    await logAuditEvent({
      email: userEmail,
      action: AuditAction.SETTINGS_UPDATED,
      resourceType: 'candidate',
      resourceId: params.id,
      changes: { op: action, targetEmail: target.email, justification },
      status: 'SUCCESS',
    })

    return successResponse({ success: true, message: `Account ${action}d for ${target.email}` })
  } catch (err) {
    return errorResponse(err)
  }
}
