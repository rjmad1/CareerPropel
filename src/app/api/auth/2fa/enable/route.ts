import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { enable2FA, verifyTOTPToken } from '@/lib/security/twoFactor'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { z } from 'zod'

// Mark as dynamic to prevent build-time static generation of protected endpoint
export const dynamic = 'force-dynamic'

const Enable2FASchema = z.object({
  secret: z.string().min(10),
  totpCode: z.string().regex(/^\d{6}$/),
  backupCodes: z.array(z.string()),
})

/**
 * POST /api/auth/2fa/enable
 * Enable 2FA for the authenticated user
 * Protected: Requires authentication
 * 
 * Request body:
 * - secret: TOTP secret from setup
 * - totpCode: 6-digit code from authenticator app
 * - backupCodes: Array of backup codes from setup
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { userEmail } = await getAuthContext()

    const body = await request.json()

    // Validate request
    const validation = Enable2FASchema.safeParse(body)
    if (!validation.success) {
      throw ApiErrors.VALIDATION_ERROR('Invalid 2FA setup data')
    }

    const { secret, totpCode, backupCodes } = validation.data

    // Verify the TOTP code is correct
    if (!verifyTOTPToken(secret, totpCode)) {
      throw ApiErrors.INVALID_REQUEST('Invalid TOTP code')
    }

    // Enable 2FA in database
    await enable2FA(userEmail, secret, backupCodes)

    return successResponse({
      success: true,
      message: '2FA enabled successfully. Save your backup codes in a secure location.',
    })
  } catch (error) {
    const response = errorResponse(error)
    return response
  }
}
