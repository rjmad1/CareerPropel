import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'
import { invalidateUserCache } from '@/lib/security/authorization/authorizationCache'
import { logAuditEvent, AuditAction } from '@/lib/logging/auditLog'

export const dynamic = 'force-dynamic'

const AssignmentBody = z.object({
  roleId: z.string(),
  permissionId: z.string(),
  op: z.enum(['add', 'remove']),
})

/** PATCH /api/admin/rbac/assignments — add or remove a permission from a role */
export async function PATCH(request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'rbac.permissions.assign', { actorId: userId })

    const body = await request.json()
    const parsed = AssignmentBody.safeParse(body)
    if (!parsed.success) throw ApiErrors.VALIDATION_ERROR('Invalid assignment payload')

    const { roleId, permissionId, op } = parsed.data

    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (!role) throw ApiErrors.NOT_FOUND('role')

    const perm = await prisma.permission.findUnique({ where: { id: permissionId } })
    if (!perm) throw ApiErrors.NOT_FOUND('permission')

    if (role.immutableSystemRole && perm.systemProtected) {
      throw ApiErrors.FORBIDDEN('Cannot modify protected system role permissions')
    }

    if (op === 'add') {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      })
    } else {
      await prisma.rolePermission.deleteMany({ where: { roleId, permissionId } })
    }

    // Invalidate cache for all users holding this role
    const affected = await prisma.userRole.findMany({ where: { roleId, isActive: true } })
    await Promise.all(affected.map((ur) => invalidateUserCache(ur.email)))

    await logAuditEvent({
      email: userEmail,
      action: AuditAction.PERMISSION_GRANTED,
      resourceType: 'role_permission',
      resourceId: roleId,
      changes: { roleName: role.name, permissionName: perm.name, op },
      status: 'SUCCESS',
    })

    return successResponse({ success: true, role: role.name, permission: perm.name, op })
  } catch (err) {
    return errorResponse(err)
  }
}
