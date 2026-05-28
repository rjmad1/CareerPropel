import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/admin/audit — paginated authorization audit log */
export async function GET(request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'audit.read', { actorId: userId })

    const { searchParams } = new URL(request.url)
    const page    = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10))
    const limit   = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10))
    const actor   = searchParams.get('actor')  ?? undefined
    const perm    = searchParams.get('perm')   ?? undefined
    const decision = searchParams.get('decision') as 'allow' | 'deny' | undefined

    const where = {
      ...(actor    ? { actorEmail: { contains: actor, mode: 'insensitive' as const } } : {}),
      ...(perm     ? { permission: { contains: perm } } : {}),
      ...(decision ? { decision } : {}),
    }

    const [logs, total] = await Promise.all([
      prisma.authorizationAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.authorizationAuditLog.count({ where }),
    ])

    return successResponse({ total, page, limit, logs })
  } catch (err) {
    return errorResponse(err)
  }
}
