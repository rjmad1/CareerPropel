import { NextRequest } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'

export const dynamic = 'force-dynamic'

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = schema.parse(body)

    const candidate = await prisma.candidate.findFirst({
      where: { passwordResetToken: token },
    })

    if (!candidate) {
      throw ApiErrors.INVALID_REQUEST('Invalid or expired reset link')
    }
    if (candidate.passwordResetTokenExp && candidate.passwordResetTokenExp < new Date()) {
      throw ApiErrors.INVALID_REQUEST('Reset link has expired. Please request a new one.')
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExp: null,
      },
    })

    return successResponse({ message: 'Password updated. You can now sign in.' })
  } catch (error) {
    return errorResponse(error)
  }
}
