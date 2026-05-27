import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { hasPermission } from '@/lib/security/rbac'
import { assignRoleToUser, removeRoleFromUser } from '@/lib/security/rbac'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Mark as dynamic to prevent build-time static generation of protected endpoint
export const dynamic = 'force-dynamic'

const AssignRoleSchema = z.object({
  email: z.string().email(),
  role: z.string().min(1),
})

/**
 * GET /api/admin/users
 * Get list of users with their roles
 * Protected: Requires authentication + 'users.manage' permission
 */
export async function GET(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()

    // Check admin permission
    const hasAdminPerms = await hasPermission(userEmail, 'users.manage')
    if (!hasAdminPerms) {
      throw ApiErrors.FORBIDDEN('user management')
    }

    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role') || undefined

    // Get all users
    let userRoles = await prisma.userRole.findMany({
      include: { role: true },
      orderBy: { grantedAt: 'desc' },
    })

    // Filter by role if specified
    if (roleFilter) {
      userRoles = userRoles.filter((ur: any) => ur.role.name === roleFilter)
    }

    // Group by email
    const usersByEmail: {
      [key: string]: { roles: string[]; grantedAt: Date[] }
    } = {}
    for (const ur of userRoles) {
      if (!usersByEmail[ur.email]) {
        usersByEmail[ur.email] = { roles: [], grantedAt: [] }
      }
      usersByEmail[ur.email].roles.push(ur.role.name)
      usersByEmail[ur.email].grantedAt.push(ur.grantedAt)
    }

    const users = Object.entries(usersByEmail).map(([email, data]) => ({
      email,
      roles: data.roles,
      roleCount: data.roles.length,
      lastUpdated: new Date(Math.max(...data.grantedAt.map((d) => d.getTime()))),
    }))

    return successResponse({
      total: users.length,
      users,
    })
  } catch (error) {
    const response = errorResponse(error)
    return response
  }
}

/**
 * POST /api/admin/users
 * Assign a role to a user
 * Protected: Requires authentication + 'roles.manage' permission
 * 
 * Request body:
 * - email: User email
 * - role: Role name (admin, recruiter, candidate)
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()

    // Check admin permission
    const hasAdminPerms = await hasPermission(userEmail, 'roles.manage')
    if (!hasAdminPerms) {
      throw ApiErrors.FORBIDDEN('role assignment')
    }

    const body = await request.json()

    // Validate request
    const validation = AssignRoleSchema.safeParse(body)
    if (!validation.success) {
      throw ApiErrors.VALIDATION_ERROR('Invalid role assignment data')
    }

    const { email, role } = validation.data

    // Assign role
    await assignRoleToUser(email, role, userEmail)

    return successResponse({
      success: true,
      message: `Role "${role}" assigned to ${email}`,
    })
  } catch (error) {
    const response = errorResponse(error)
    return response
  }
}

/**
 * DELETE /api/admin/users
 * Remove a role from a user
 * Protected: Requires authentication + 'roles.manage' permission
 * 
 * Query parameters:
 * - email: User email
 * - role: Role name to remove
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()

    // Check admin permission
    const hasAdminPerms = await hasPermission(userEmail, 'roles.manage')
    if (!hasAdminPerms) {
      throw ApiErrors.FORBIDDEN('role management')
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const role = searchParams.get('role')

    if (!email || !role) {
      throw ApiErrors.INVALID_REQUEST('email and role query parameters are required')
    }

    // Remove role
    await removeRoleFromUser(email, role)

    return successResponse({
      success: true,
      message: `Role "${role}" removed from ${email}`,
    })
  } catch (error) {
    const response = errorResponse(error)
    return response
  }
}
