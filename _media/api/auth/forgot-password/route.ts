import { NextRequest } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'

export const dynamic = 'force-dynamic'

const schema = z.object({
  email: z.string().email(),
})

// Always returns the same success message to avoid leaking account existence
const SAFE_RESPONSE = { message: "If that email is registered, you'll receive a reset link shortly." }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)
    const normalizedEmail = email.toLowerCase().trim()

    const candidate = await prisma.candidate.findUnique({ where: { email: normalizedEmail } })

    if (candidate) {
      const passwordResetToken = crypto.randomBytes(32).toString('hex')
      const passwordResetTokenExp = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { passwordResetToken, passwordResetTokenExp },
      })

      sendPasswordResetEmail(normalizedEmail, candidate.name, passwordResetToken).catch((err) =>
        console.error('[ForgotPassword] Email send failed:', err)
      )
    }

    return successResponse(SAFE_RESPONSE)
  } catch (error) {
    return errorResponse(error)
  }
}
