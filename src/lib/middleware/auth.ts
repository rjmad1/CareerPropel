import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import { ApiErrors } from '@/lib/errors/ApiError'
import { authOptions } from '@/lib/auth'

export async function getAuthSession() {
  try {
    const session = await getServerSession(authOptions)
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
export async function requireAuth(_request: NextRequest) {
  return await getAuthSession()
}

export function checkOwnership(userId: string, resourceOwnerId: string) {
  if (userId !== resourceOwnerId) {
    throw ApiErrors.FORBIDDEN('resource')
  }
}

export function getUserIdFromSession(session: any): string {
  const userId = session?.user?.id
  if (!userId) {
    throw ApiErrors.UNAUTHORIZED()
  }
  return userId
}

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
