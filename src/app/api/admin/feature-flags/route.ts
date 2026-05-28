import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/admin/feature-flags — list all feature flags */
export async function GET(_request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'system.feature-flags.manage', { actorId: userId })

    const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } })
    return successResponse({ flags })
  } catch (err) {
    return errorResponse(err)
  }
}
