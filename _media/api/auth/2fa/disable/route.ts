import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { disable2FA, verifyTOTPToken, is2FAEnabled } from '@/lib/security/twoFactor'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const DisableSchema = z.object({
  totpCode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit code'),
})

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for the authenticated user. Requires current TOTP code to confirm.
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()

    if (!(await is2FAEnabled(userEmail))) {
      throw ApiErrors.INVALID_REQUEST('2FA is not currently enabled')
    }

    const body = await request.json()
    const validation = DisableSchema.safeParse(body)
    if (!validation.success) {
      throw ApiErrors.VALIDATION_ERROR('Invalid request body')
    }

    const { totpCode } = validation.data

    // Fetch secret to verify the code before disabling
    const record = await prisma.twoFactorSecret.findUnique({
      where: { email: userEmail },
      select: { secret: true },
    })

    if (!record?.secret) {
      throw ApiErrors.INVALID_REQUEST('No 2FA record found')
    }

    if (!verifyTOTPToken(record.secret, totpCode)) {
      throw ApiErrors.INVALID_REQUEST('Invalid TOTP code — enter the code from your authenticator app')
    }

    await disable2FA(userEmail)

    return successResponse({ success: true, message: '2FA has been disabled.' })
  } catch (error) {
    return errorResponse(error)
  }
}
