import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { hasPermission } from '@/lib/security/rbac'
import { getSuspiciousActivitySummary } from '@/lib/security/threatDetection'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { PrismaClient } from '@prisma/client'

// Mark as dynamic to prevent build-time static generation of protected endpoint
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

/**
 * GET /api/admin/threats
 * Get threat alerts and suspicious activity for users
 * Protected: Requires authentication + 'security.manage' permission
 * 
 * Query parameters:
 * - email: Filter by user email (optional, shows all if not specified but requires admin)
 * - minRiskScore: Only show users with risk score >= this value
 */
export async function GET(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()

    // Check admin permission
    const hasAdminPerms = await hasPermission(userEmail, 'security.manage')
    if (!hasAdminPerms) {
      throw ApiErrors.FORBIDDEN('threat data')
    }

    const { searchParams } = new URL(request.url)
    const targetEmail = searchParams.get('email') || undefined
    const minRiskScore = parseInt(searchParams.get('minRiskScore') || '0')

    if (targetEmail) {
      // Get threats for specific user
      const { alerts, riskScore } = await getSuspiciousActivitySummary(targetEmail)

      return successResponse({
        email: targetEmail,
        riskScore,
        alerts,
      })
    } else {
      // Get threats for all users with high risk scores
      const allUsers = await prisma.candidate.findMany({
        select: { email: true },
      })

      const usersWithThreats = []

      for (const user of allUsers) {
        const { alerts, riskScore } = await getSuspiciousActivitySummary(
          user.email
        )

        if (riskScore >= minRiskScore && alerts.length > 0) {
          usersWithThreats.push({
            email: user.email,
            riskScore,
            alertCount: alerts.length,
            alerts,
          })
        }
      }

      // Sort by risk score descending
      usersWithThreats.sort((a, b) => b.riskScore - a.riskScore)

      return successResponse({
        summary: {
          totalUsersScanned: allUsers.length,
          usersWithAlerts: usersWithThreats.length,
          highRiskCount: usersWithThreats.filter((u) => u.riskScore >= 70).length,
          criticalCount: usersWithThreats.filter((u) => u.riskScore >= 90).length,
        },
        users: usersWithThreats,
      })
    }
  } catch (error) {
    const response = errorResponse(error)
    return response
  }
}
