import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/middleware/withAuth'
import { createAPIKey, listAPIKeys, revokeAPIKey } from '@/lib/security/apiKey'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateAPIKeySchema = z.object({
  name: z.string().min(1).max(100),
  expiresIn: z.number().optional(), // Days until expiration
})

/**
 * GET /api/api-keys
 * List all API keys for the authenticated user
 */
export const GET = withAuth(
  async (_request: NextRequest, auth) => {
    try {
      const { userEmail } = auth;
      const apiKeys = await listAPIKeys(userEmail);

      const safeKeys = apiKeys.map((key) => ({
        id: key.id,
        name: key.name,
        prefix: key.prefix,
        createdAt: key.createdAt,
        expiresAt: key.expiresAt,
        lastUsedAt: key.lastUsedAt,
        revokedAt: key.revokedAt,
        usageCount: key.usageCount,
      }));

      return successResponse(safeKeys);
    } catch (error) {
      return errorResponse(error);
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'medium',
  }
);

/**
 * POST /api/api-keys
 * Create a new API key for the authenticated user
 */
export const POST = withAuth(
  async (request: NextRequest, auth) => {
    try {
      const { userEmail } = auth;
      const body = await request.json();

      const validation = CreateAPIKeySchema.safeParse(body);
      if (!validation.success) {
        throw ApiErrors.VALIDATION_ERROR('Invalid API key creation data');
      }

      const { name, expiresIn } = validation.data;

      const result = await createAPIKey(
        userEmail,
        name,
        expiresIn ? expiresIn * 24 * 60 * 60 * 1000 : undefined
      );

      return successResponse(
        {
          id: result.id,
          name,
          key: result.key,
          prefix: result.key.substring(0, 10),
          message: 'Save your API key securely. You will not be able to see it again.',
        },
        201
      );
    } catch (error) {
      return errorResponse(error);
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'critical',
  }
);

/**
 * DELETE /api/api-keys
 * Revoke/delete an API key
 */
export const DELETE = withAuth(
  async (request: NextRequest, auth) => {
    try {
      const { userEmail } = auth;
      const { searchParams } = new URL(request.url);
      const keyId = searchParams.get('keyId');

      if (!keyId) {
        throw ApiErrors.INVALID_REQUEST('keyId query parameter is required');
      }

      const success = await revokeAPIKey(userEmail, keyId);

      if (!success) {
        throw ApiErrors.FORBIDDEN('API key');
      }

      return successResponse({
        success: true,
        message: 'API key revoked successfully',
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'critical',
  }
);
