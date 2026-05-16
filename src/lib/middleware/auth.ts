import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { ApiErrors } from '@/lib/errors/ApiError'

/**
 * Authentication Middleware
 * Validates user session and authorizes requests
 */

/**
 * Get authenticated session from request
 * Returns session or throws UNAUTHORIZED error
 */
export async function getAuthSession() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      throw ApiErrors.UNAUTHORIZED()
    }
    return session
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
      throw error
    }
    throw ApiErrors.UNAUTHORIZED()
  }
}

/**
 * Middleware wrapper for protected endpoints
 * Usage:
 *   const session = await requireAuth(request)
 */
export async function requireAuth(request: NextRequest) {
  return await getAuthSession()
}

/**
 * Check if user owns a resource
 * @param userId - User ID to check
 * @param resourceOwnerId - Owner ID of the resource
 * @throws FORBIDDEN if user doesn't own the resource
 */
export function checkOwnership(userId: string, resourceOwnerId: string) {
  if (userId !== resourceOwnerId) {
    throw ApiErrors.FORBIDDEN('resource')
  }
}

/**
 * Parse user ID from session
 * Returns user ID or throws UNAUTHORIZED
 */
export function getUserIdFromSession(session: any): string {
  const userId = session?.user?.id
  if (!userId) {
    throw ApiErrors.UNAUTHORIZED()
  }
  return userId
}

/**
 * Verify session and return user context
 * Useful for controller-like functions
 */
export async function getAuthContext() {
  const session = await getAuthSession()
  const userId = getUserIdFromSession(session)
  const userEmail = session.user?.email || ''

  return {
    userId,
    userEmail,
    session,
  }
}
