import { NextRequest } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'

export const dynamic = 'force-dynamic'

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmNewPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
})

export async function PUT(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()
    const body = await request.json()
    const { currentPassword, newPassword } = schema.parse(body)

    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } })
    if (!candidate) throw ApiErrors.NOT_FOUND('account')

    if (!candidate.passwordHash) {
      throw ApiErrors.INVALID_REQUEST('This account uses OAuth login and does not have a password.')
    }

    const valid = await bcrypt.compare(currentPassword, candidate.passwordHash)
    if (!valid) throw ApiErrors.INVALID_REQUEST('Current password is incorrect')

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.candidate.update({
      where: { id: candidate.id },
      data: { passwordHash },
    })

    return successResponse({ message: 'Password updated successfully' })
  } catch (error) {
    return errorResponse(error)
  }
}
