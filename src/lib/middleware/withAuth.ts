/**
 * Authentication Route Handler Wrapper
 *
 * Provides a typed `withAuth()` higher-order function that enforces
 * authentication before any route handler logic runs.
 *
 * RASUI-009 remediation:
 * - Eliminates the class of "missed-auth" bugs where individual route
 *   handlers forget to call getAuthContext() before accessing user data.
 * - Centralises the authentication contract in one place.
 * - Returns consistent structured 401 JSON responses.
 *
 * Usage:
 *   export const GET = withAuth(async (request, authContext) => {
 *     const { userId, userEmail } = authContext;
 *     // handler logic here — auth is guaranteed
 *     return NextResponse.json({ data: ... });
 *   });
 *
 * The wrapper calls getAuthContext() before the handler. If the session
 * is missing or invalid, it returns a 401 JSON response without invoking
 * the handler — preventing any accidental data access.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { log } from '@/lib/logging/logger';

type AuthContext = Awaited<ReturnType<typeof getAuthContext>>;

type AuthenticatedHandler = (
  request: NextRequest,
  auth: AuthContext,
  params?: Record<string, string | string[]>
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a Next.js App Router route handler with authentication enforcement.
 * The wrapped handler only runs if a valid session exists.
 *
 * @param handler - The route handler function that receives the authenticated
 *                  context as its second argument.
 * @returns A Next.js compatible route handler that enforces authentication.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async function authenticatedRoute(
    request: NextRequest,
    context?: { params?: Record<string, string | string[]> }
  ): Promise<NextResponse> {
    try {
      const auth = await getAuthContext();

      return await handler(request, auth, context?.params);
    } catch (error: any) {
      // getAuthContext() throws when the session is missing or invalid.
      // Return a consistent 401 JSON response.
      const isAuthError =
        error?.message?.includes('Unauthorized') ||
        error?.message?.includes('Not authenticated') ||
        error?.code === 'UNAUTHORIZED';

      if (isAuthError) {
        return NextResponse.json(
          {
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required. Please sign in.',
            },
          },
          { status: 401 }
        );
      }

      // Unexpected error — log and rethrow so the Next.js error boundary handles it
      log.error({ err: error }, '[withAuth] Unexpected error during auth check');
      throw error;
    }
  };
}
