/**
 * Authorization middleware — HOF wrappers for Next.js App Router route handlers.
 *
 * Usage:
 *   export const POST = withAuthorization('agents.execute', async (req, ctx) => { ... })
 *   export const GET  = withAuthorization(['jobs.read', 'jobs.manage'], handler, { any: true })
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ApiErrors } from '@/lib/errors/ApiError'
import { evaluate, evaluateAny, evaluateAll } from './policyEngine'
import { isSuperAdmin } from './authorizationService'

export interface AuthorizedContext {
  actorId: string
  actorEmail: string
  isSuperAdmin: boolean
  request: NextRequest
  params?: Record<string, string>
}

type RouteHandler = (ctx: AuthorizedContext) => Promise<NextResponse | Response>

interface WithAuthorizationOptions {
  /** If true, actor must hold ANY of the permissions (OR). Default is ALL (AND). */
  any?: boolean
  /** If true, super-admin check is skipped (use for non-sensitive reads). Default false. */
  skipSuperAdminShortCircuit?: boolean
}

/**
 * Wraps a route handler with centralized authorization enforcement.
 * Extracts session, evaluates permission(s), and passes authorized context to the handler.
 */
export function withAuthorization(
  permissions: string | string[],
  handler: RouteHandler,
  opts: WithAuthorizationOptions = {}
) {
  return async (request: NextRequest, routeContext?: { params?: Record<string, string> }): Promise<NextResponse | Response> => {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
      }

      const actorEmail = session.user.email
      const actorId    = session.user.id ?? actorEmail

      const permArray = Array.isArray(permissions) ? permissions : [permissions]
      const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      const userAgent = request.headers.get('user-agent') ?? undefined
      const correlationId = request.headers.get('x-correlation-id') ?? undefined

      const baseCtx = { actorId, actorEmail, ipAddress, userAgent, correlationId }

      let result: { allowed: boolean; reason: string; isSuperAdmin: boolean }

      if (permArray.length === 1) {
        result = await evaluate({ ...baseCtx, permission: permArray[0] })
      } else if (opts.any) {
        result = await evaluateAny({ ...baseCtx, permission: permArray[0] }, permArray)
      } else {
        result = await evaluateAll({ ...baseCtx, permission: permArray[0] }, permArray)
      }

      if (!result.allowed) {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: `Permission denied: ${permArray.join(', ')}` } },
          { status: 403 }
        )
      }

      const authorizedCtx: AuthorizedContext = {
        actorId,
        actorEmail,
        isSuperAdmin: result.isSuperAdmin,
        request,
        params: routeContext?.params,
      }

      return await handler(authorizedCtx)
    } catch (err) {
      const apiErr = err as { statusCode?: number; code?: string; message?: string }
      if (apiErr.statusCode) {
        return NextResponse.json(
          { error: { code: apiErr.code, message: apiErr.message } },
          { status: apiErr.statusCode }
        )
      }
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
        { status: 500 }
      )
    }
  }
}

/**
 * Enforces a single permission for the current session within an existing route.
 * Throws ApiError 403 if the check fails — use inside try/catch route handlers.
 */
export async function requirePermission(
  actorEmail: string,
  permission: string,
  opts?: { actorId?: string; resource?: string; resourceId?: string }
): Promise<void> {
  const result = await evaluate({
    actorEmail,
    permission,
    actorId: opts?.actorId,
    resource: opts?.resource,
    resourceId: opts?.resourceId,
  })
  if (!result.allowed) throw ApiErrors.FORBIDDEN(permission)
}

/**
 * Enforces that the actor holds at least one of the given permissions.
 * Throws ApiError 403 if none match.
 */
export async function requireAnyPermission(
  actorEmail: string,
  permissions: string[],
  opts?: { actorId?: string }
): Promise<void> {
  const result = await evaluateAny(
    { actorEmail, permission: permissions[0], actorId: opts?.actorId },
    permissions
  )
  if (!result.allowed) throw ApiErrors.FORBIDDEN(permissions.join('|'))
}

/**
 * Enforces super-admin access. Throws ApiError 403 if the actor is not a super-admin.
 */
export async function requireSuperAdmin(actorEmail: string): Promise<void> {
  const superAdmin = await isSuperAdmin(actorEmail)
  if (!superAdmin) throw ApiErrors.FORBIDDEN('super_admin')
}
