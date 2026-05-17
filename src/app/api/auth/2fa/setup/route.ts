import { NextRequest } from 'next/server'
import { getAuthContext } from '@/lib/middleware/auth'
import { generateTOTPSecret, generateBackupCodes } from '@/lib/security/twoFactor'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/2fa/setup
 * Generate TOTP secret and backup codes for 2FA setup
 * Protected: Requires authentication
 * 
 * Returns:
 * - qrCode: Data URL for QR code
 * - secret: Base32 encoded secret (for manual entry)
 * - backupCodes: Array of backup codes
 */
export async function POST(_request: NextRequest) {
  try {
    // Require authentication
    const { userEmail } = await getAuthContext()

    // Generate TOTP secret
    const { secret, qrCode } = await generateTOTPSecret(userEmail)
    
    // Generate backup codes
    const backupCodes = generateBackupCodes(10)

    return successResponse({
      secret,
      qrCode,
      backupCodes,
      message: 'Scan the QR code with your authenticator app, or enter the secret manually',
    })
  } catch (error) {
    const response = errorResponse(error)
    return response
  }
}
