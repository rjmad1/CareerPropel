import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { createAPIKey, listAPIKeys, revokeAPIKey } from '@/lib/security/apiKey'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { z } from 'zod'

// Mark as dynamic to prevent build-time static generation of protected endpoint
export const dynamic = 'force-dynamic'

const CreateAPIKeySchema = z.object({
  name: z.string().min(1).max(100),
  expiresIn: z.number().optional(), // Days until expiration
})

/**
 * GET /api/api-keys
 * List all API keys for the authenticated user
 * Protected: Requires authentication
 */
export async function GET(_request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()

    const apiKeys = await listAPIKeys(userEmail)

    // Don't send the actual key hashes to the client
    const safeKeys = apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      revokedAt: key.revokedAt,
      usageCount: key.usageCount,
    }))

    return successResponse(safeKeys)
  } catch (error) {
    const response = errorResponse(error)
    return response
  }
}

/**
 * POST /api/api-keys
 * Create a new API key for the authenticated user
 * Protected: Requires authentication
 * 
 * Request body:
 * - name: Name for the API key
 * - expiresIn: Optional days until expiration (default: 365)
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()

    const body = await request.json()

    // Validate request
    const validation = CreateAPIKeySchema.safeParse(body)
    if (!validation.success) {
      throw ApiErrors.VALIDATION_ERROR('Invalid API key creation data')
    }

    const { name, expiresIn } = validation.data

    // Create API key
    const result = await createAPIKey(
      userEmail,
      name,
      expiresIn ? expiresIn * 24 * 60 * 60 * 1000 : undefined
    )

    return successResponse(
      {
        id: result.id,
        name,
        key: result.key,
        prefix: result.key.substring(0, 10),
        message: 'Save your API key securely. You will not be able to see it again.',
      },
      201
    )
  } catch (error) {
    const response = errorResponse(error)
    return response
  }
}

/**
 * DELETE /api/api-keys
 * Revoke/delete an API key
 * Protected: Requires authentication
 * 
 * Query parameters:
 * - keyId: ID of the API key to revoke
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()
    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')

    if (!keyId) {
      throw ApiErrors.INVALID_REQUEST('keyId query parameter is required')
    }

    const success = await revokeAPIKey(userEmail, keyId)

    if (!success) {
      throw ApiErrors.FORBIDDEN('API key')
    }

    return successResponse({
      success: true,
      message: 'API key revoked successfully',
    })
  } catch (error) {
    const response = errorResponse(error)
    return response
  }
}
