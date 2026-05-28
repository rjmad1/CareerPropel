import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { assignRole, revokeRole, getEffectivePermissions } from '@/lib/security/authorization/authorizationService'
import { prisma } from '@/lib/db'
import { logAuditEvent, AuditAction } from '@/lib/logging/auditLog'

export const dynamic = 'force-dynamic'

const AssignRoleBody = z.object({
  roleName: z.string().min(1),
  expiresAt: z.string().datetime().optional(),
  justification: z.string().optional(),
})

const RevokeRoleBody = z.object({
  roleName: z.string().min(1),
  justification: z.string().optional(),
})

/** PATCH /api/admin/users/[id]/roles — assign or revoke roles for a user */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'rbac.users.assign', { actorId: userId })

    const body = await request.json()
    const { action, ...rest } = body as { action: 'assign' | 'revoke'; [k: string]: unknown }

    const targetCandidate = await prisma.candidate.findUnique({ where: { id } })
    if (!targetCandidate) throw ApiErrors.NOT_FOUND('user')

    if (action === 'assign') {
      const parsed = AssignRoleBody.safeParse(rest)
      if (!parsed.success) throw ApiErrors.VALIDATION_ERROR('Invalid assign payload')

      const { roleName, expiresAt, justification } = parsed.data

      // Privilege escalation guard: non-super-admins cannot assign SUPER_ADMIN
      const perms = await getEffectivePermissions(userEmail, userId)
      const isSuperAdmin = perms.includes('*')
      if (!isSuperAdmin && roleName === 'SUPER_ADMIN') {
        throw ApiErrors.FORBIDDEN('super_admin assignment')
      }

      await assignRole(targetCandidate.email, roleName, userEmail, {
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        justification,
      })

      await logAuditEvent({
        email: userEmail,
        action: AuditAction.ROLE_CHANGED,
        resourceType: 'user_role',
        resourceId: id,
        changes: { targetEmail: targetCandidate.email, roleName, op: 'assign', justification },
        status: 'SUCCESS',
      })

      return successResponse({ success: true, message: `Role "${roleName}" assigned to ${targetCandidate.email}` })
    }

    if (action === 'revoke') {
      const parsed = RevokeRoleBody.safeParse(rest)
      if (!parsed.success) throw ApiErrors.VALIDATION_ERROR('Invalid revoke payload')

      const { roleName, justification } = parsed.data
      await revokeRole(targetCandidate.email, roleName, userEmail, justification)

      await logAuditEvent({
        email: userEmail,
        action: AuditAction.ROLE_CHANGED,
        resourceType: 'user_role',
        resourceId: id,
        changes: { targetEmail: targetCandidate.email, roleName, op: 'revoke', justification },
        status: 'SUCCESS',
      })

      return successResponse({ success: true, message: `Role "${roleName}" revoked from ${targetCandidate.email}` })
    }

    throw ApiErrors.INVALID_REQUEST('action must be "assign" or "revoke"')
  } catch (err) {
    return errorResponse(err)
  }
}
