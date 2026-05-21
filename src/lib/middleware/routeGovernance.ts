/**
 * Centralized Route Governance Layer
 * 
 * Enforces security, authorization policies, rate limiting, and audit logging
 * globally across the platform.
 * 
 * Implements Phase 4: Authorization Governance Hardening.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserRoles } from '@/lib/security/rbac';
import { createRateLimiter } from '@/lib/middleware/rateLimiter';
import { logSecurityEvent, AuditAction } from '@/lib/logging/auditLog';
import { log } from '@/lib/logging/logger';

export type RouteClassification = 'public' | 'authenticated' | 'privileged' | 'internal';
export type RateLimitClass = 'standard' | 'heavy' | 'auth' | 'none';
export type AuditSensitivity = 'low' | 'medium' | 'high' | 'critical';
export type OwnershipModel = 'none' | 'candidate' | 'admin';

export interface RoutePolicy {
  classification: RouteClassification;
  roles?: string[];
  rateLimitClass: RateLimitClass;
  auditSensitivity: AuditSensitivity;
  ownershipModel?: OwnershipModel;
}

// Instantiate static rate limiters for performance
const rateLimiters = {
  standard: createRateLimiter(60, 60), // 60 req/min
  heavy: createRateLimiter(5, 60),     // 5 req/min
  auth: createRateLimiter(20, 60),     // 20 req/min
  none: null,
};

/**
 * Enforces a RoutePolicy on an incoming request.
 * Returns a NextResponse if the request is blocked, or null if it passes.
 */
export async function enforceRoutePolicy(
  request: NextRequest,
  policy: RoutePolicy,
  userId?: string,
  userEmail?: string
): Promise<NextResponse | null> {
  const { classification, roles, rateLimitClass, auditSensitivity } = policy;

  // 1. Enforce Rate Limiting
  const limiter = rateLimiters[rateLimitClass];
  if (limiter) {
    const rateLimitResult = await limiter(request);
    if (rateLimitResult) {
      log.warn(
        { ip: request.headers.get('x-forwarded-for') || 'unknown', rateLimitClass },
        '[Governance] Rate limit exceeded'
      );
      if (userEmail) {
        await logSecurityEvent(AuditAction.RATE_LIMIT_EXCEEDED, userEmail, {
          resource: request.nextUrl.pathname,
          severity: 'warning',
          status: 'failure',
          details: { rateLimitClass },
        });
      }
      return rateLimitResult;
    }
  }

  // 2. Enforce Classification Bounds
  if (classification === 'internal') {
    // Check for internal system secret or admin role
    const internalSecret = request.headers.get('x-internal-secret');
    const isAuthorizedInternal = internalSecret && internalSecret === process.env.INTERNAL_SYTEM_SECRET;
    
    if (!isAuthorizedInternal) {
      log.error({ pathname: request.nextUrl.pathname }, '[Governance] Blocked unauthorized internal access attempt');
      if (userEmail) {
        await logSecurityEvent(AuditAction.UNAUTHORIZED_ACCESS, userEmail, {
          resource: request.nextUrl.pathname,
          severity: 'critical',
          status: 'failure',
          details: { reason: 'Unauthorized access to internal endpoint' },
        });
      }
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied. Internal route.' } },
        { status: 403 }
      );
    }
  }

  // 3. Authenticated check
  if (classification !== 'public' && !userId) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in.' } },
      { status: 401 }
    );
  }

  // 4. Enforce Role Requirements (RBAC)
  if (roles && roles.length > 0 && userEmail) {
    const userRoles = await getUserRoles(userEmail);
    const hasRequiredRole = roles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      log.warn(
        { email: userEmail, requiredRoles: roles, actualRoles: userRoles, pathname: request.nextUrl.pathname },
        '[Governance] Role authorization check failed'
      );
      await logSecurityEvent(AuditAction.UNAUTHORIZED_ACCESS, userEmail, {
        resource: request.nextUrl.pathname,
        severity: 'error',
        status: 'failure',
        details: { reason: 'Missing required role', requiredRoles: roles, actualRoles: userRoles },
      });
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Forbidden. Insufficient permissions.' } },
        { status: 403 }
      );
    }
  }

  // 5. Audit Sensitive Actions
  if (auditSensitivity === 'high' || auditSensitivity === 'critical') {
    if (userEmail) {
      await logSecurityEvent(AuditAction.SETTINGS_UPDATED, userEmail, {
        resource: request.nextUrl.pathname,
        severity: auditSensitivity === 'critical' ? 'critical' : 'warning',
        status: 'success',
        details: { policyClassification: classification },
      });
    }
  }

  return null;
}
