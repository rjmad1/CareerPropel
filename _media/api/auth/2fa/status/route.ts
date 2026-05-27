import { getAuthContext } from '@/lib/middleware/auth'
import { is2FAEnabled } from '@/lib/security/twoFactor'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'

export const dynamic = 'force-dynamic'

/** GET /api/auth/2fa/status — returns whether 2FA is currently enabled */
export async function GET() {
  try {
    const { userEmail } = await getAuthContext()
    const enabled = await is2FAEnabled(userEmail)
    return successResponse({ enabled })
  } catch (error) {
    return errorResponse(error)
  }
}
