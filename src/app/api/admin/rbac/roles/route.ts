import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/admin/rbac/roles — list all roles with their permission counts */
export async function GET(_request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'rbac.roles.read', { actorId: userId })

    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userRoles: true } },
      },
      orderBy: { priority: 'asc' },
    })

    return successResponse({
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        roleType: r.roleType,
        immutableSystemRole: r.immutableSystemRole,
        priority: r.priority,
        environmentScope: r.environmentScope,
        permissions: r.permissions.map((rp) => rp.permission.name),
        userCount: r._count.userRoles,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    })
  } catch (err) {
    return errorResponse(err)
  }
}
