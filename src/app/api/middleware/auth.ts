import { NextRequest } from 'next/server';

/**
 * Extract user from request headers
 * Supports both JWT Bearer tokens and session cookies
 */
export async function getCurrentUser(req: NextRequest) {
  try {
    // Check for Authorization header (Bearer token)
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      // In a real app, verify JWT here
      // For now, extract user ID from token or session
      // This is a simplified implementation
      const userId = decodeUserIdFromToken(token);
      if (userId) {
        return { id: userId, email: `user-${userId}@example.com` };
      }
    }

    // Check for session cookie
    const sessionCookie = req.cookies.get('session')?.value;
    if (sessionCookie) {
      const userId = decodeUserIdFromToken(sessionCookie);
      if (userId) {
        return { id: userId, email: `user-${userId}@example.com` };
      }
    }

    // For development/testing: check for x-user-id header
    const devUserId = req.headers.get('x-user-id');
    if (devUserId) {
      return { id: devUserId, email: `user-${devUserId}@example.com` };
    }

    return null;
  } catch (error) {
    console.error('Error extracting user:', error);
    return null;
  }
}

/**
 * Verify user is authenticated
 * Returns user or throws 401
 */
export async function requireAuth(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }
  return user;
}

/**
 * Simple token decoder (for development)
 * In production, use proper JWT verification
 */
function decodeUserIdFromToken(token: string): string | null {
  try {
    // In a real implementation, verify JWT signature
    // For now, just handle test tokens
    if (token.startsWith('test-')) {
      return token.replace('test-', '');
    }
    // Try to parse as simple payload
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload.sub || payload.userId || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Custom error classes
 */
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends Error {
  details: Record<string, string[]>;

  constructor(message = 'Validation failed', details: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Verify user owns the resource
 */
export function verifyOwnership(resourceOwnerId: string, userId: string) {
  if (resourceOwnerId !== userId) {
    throw new ForbiddenError('You do not have access to this resource');
  }
}
