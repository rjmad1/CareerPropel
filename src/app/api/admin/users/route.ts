import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { requirePermission } from '@/lib/security/authorization/middleware'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const AssignRoleSchema = z.object({
  email: z.string().email(),
  role: z.string().min(1),
})

/**
 * GET /api/admin/users
 * Returns candidates with their active roles — supports search and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'users.read', { actorId: userId })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10))
    const limit  = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10))

    const where = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' as const } }, { name: { contains: search, mode: 'insensitive' as const } }] }
      : {}

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        select: {
          id: true, email: true, name: true, emailVerified: true, createdAt: true,
          jobs: { select: { id: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.candidate.count({ where }),
    ])

    // Fetch active roles for these users
    const emails = candidates.map((c) => c.email)
    const userRoles = await prisma.userRole.findMany({
      where: { email: { in: emails }, isActive: true },
      include: { role: true },
    })

    const rolesByEmail: Record<string, string[]> = {}
    for (const ur of userRoles) {
      if (!rolesByEmail[ur.email]) rolesByEmail[ur.email] = []
      rolesByEmail[ur.email].push(ur.role.name)
    }

    const users = candidates.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      emailVerified: c.emailVerified,
      createdAt: c.createdAt,
      roles: rolesByEmail[c.email] ?? [],
    }))

    return successResponse({ total, page, limit, users })
  } catch (err) {
    return errorResponse(err)
  }
}

/**
 * POST /api/admin/users — legacy: assign a role to a user by email
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'rbac.users.assign', { actorId: userId })

    const body = await request.json()
    const parsed = AssignRoleSchema.safeParse(body)
    if (!parsed.success) throw ApiErrors.VALIDATION_ERROR('email and role required')

    const { email, role } = parsed.data
    const { assignRole } = await import('@/lib/security/authorization/authorizationService')
    await assignRole(email, role, userEmail)

    return successResponse({ success: true, message: `Role "${role}" assigned to ${email}` })
  } catch (err) {
    return errorResponse(err)
  }
}

/**
 * DELETE /api/admin/users — legacy: revoke a role from a user
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userEmail, userId } = await getAuthContext()
    await requirePermission(userEmail, 'rbac.users.assign', { actorId: userId })

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const role  = searchParams.get('role')
    if (!email || !role) throw ApiErrors.INVALID_REQUEST('email and role query parameters required')

    const { revokeRole } = await import('@/lib/security/authorization/authorizationService')
    await revokeRole(email, role, userEmail)

    return successResponse({ success: true, message: `Role "${role}" revoked from ${email}` })
  } catch (err) {
    return errorResponse(err)
  }
}
