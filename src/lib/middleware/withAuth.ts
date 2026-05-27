import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { log } from '@/lib/logging/logger';
import { RoutePolicy, enforceRoutePolicy } from './routeGovernance';
import { runWithTrace } from '@/lib/logging/traceContext';

type AuthContext = Awaited<ReturnType<typeof getAuthContext>>;

type AuthenticatedHandler = (
  request: NextRequest,
  auth: AuthContext,
  params?: Record<string, string | string[]>
) => Promise<Response> | Response;

/**
 * Wraps a Next.js App Router route handler with centralized route governance enforcement.
 * Enforces authentication, RBAC role restrictions, rate limiting, and audit logging.
 *
 * @param handler - The route handler function.
 * @param policy - The governance policy containing classification, roles, and rate limit rules.
 * @returns A Next.js compatible route handler that enforces the policy.
 */
export function withAuth(handler: AuthenticatedHandler, policy: RoutePolicy) {
  return async function authenticatedRoute(
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<Response> {
    const correlationId = request.headers.get('x-correlation-id') || request.headers.get('x-request-id') || undefined;


    return runWithTrace(correlationId, async () => {
      let auth: AuthContext = { userId: '', userEmail: '', session: null as any };
      let isAuthenticated = false;

      try {
        auth = await getAuthContext();
        isAuthenticated = true;
      } catch (error: any) {
        if (policy.classification !== 'public') {
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

          log.error({ err: error }, '[withAuth] Unexpected error during auth check');
          throw error;
        }
      }

      try {
        // Enforce the centralized route governance policy
        const governanceBlockedResponse = await enforceRoutePolicy(
          request,
          policy,
          isAuthenticated ? auth.userId : undefined,
          isAuthenticated ? auth.userEmail : undefined
        );

        if (governanceBlockedResponse) {
          return governanceBlockedResponse;
        }

        // Execute actual handler — await params for Next.js 16 compatibility
        const params = context?.params ? await context.params : {};
        return await handler(request, auth, params);
      } catch (error: any) {
        log.error({ err: error, path: request.nextUrl.pathname }, '[withAuth] Route handler execution crashed');
        return NextResponse.json(
          {
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message || 'An unexpected error occurred.',
            },
          },
          { status: 500 }
        );
      }
    });
  };
}

