import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { PrismaClient } from '@prisma/client'

// Mark as dynamic to prevent build-time static generation of protected endpoint
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

/**
 * GET /api/audit-logs
 * Get audit logs for the authenticated user
 * Protected: Requires authentication
 * 
 * Query parameters:
 * - action: Filter by action type
 * - resource: Filter by resource
 * - severity: Filter by severity (info, warning, error, critical)
 * - limit: Number of logs to return (default: 50, max: 500)
 * - offset: Offset for pagination (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()
    const { searchParams } = new URL(request.url)

    const action = searchParams.get('action') || undefined
    const resource = searchParams.get('resource') || undefined
    const severity = searchParams.get('severity') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    const where: any = { email: userEmail }
    if (action) where.action = action
    if (resource) where.resource = resource
    if (severity) where.severity = severity

    // Get audit logs for this user
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const total = await prisma.auditLog.count({ where })

    return successResponse({
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    const response = errorResponse(error)
    return response
  }
}
