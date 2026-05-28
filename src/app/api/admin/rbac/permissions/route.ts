import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/admin/rbac/permissions — list all permissions grouped by resource */
export async function GET(_request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'rbac.roles.read', { actorId: userId })

    const permissions = await prisma.permission.findMany({
      include: {
        roles: { include: { role: true } },
      },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    })

    // Group by resource
    const grouped: Record<string, typeof permissions> = {}
    for (const p of permissions) {
      if (!grouped[p.resource]) grouped[p.resource] = []
      grouped[p.resource].push(p)
    }

    return successResponse({
      total: permissions.length,
      byResource: Object.entries(grouped).map(([resource, perms]) => ({
        resource,
        permissions: perms.map((p) => ({
          id: p.id,
          name: p.name,
          action: p.action,
          description: p.description,
          systemProtected: p.systemProtected,
          roles: p.roles.map((rp) => rp.role.name),
        })),
      })),
    })
  } catch (err) {
    return errorResponse(err)
  }
}
