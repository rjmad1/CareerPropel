import { NextRequest } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'

export const dynamic = 'force-dynamic'

const schema = z.object({
  password: z.string().optional(),
})

export async function DELETE(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()
    const body = await request.json().catch(() => ({}))
    const { password } = schema.parse(body)

    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } })
    if (!candidate) throw ApiErrors.NOT_FOUND('account')

    // Require password confirmation for credential accounts
    if (candidate.passwordHash) {
      if (!password) throw ApiErrors.VALIDATION_ERROR('Password is required to delete your account')
      const valid = await bcrypt.compare(password, candidate.passwordHash)
      if (!valid) throw ApiErrors.INVALID_REQUEST('Incorrect password')
    }

    // Cascade deletes all related records via Prisma schema relations
    await prisma.candidate.delete({ where: { id: candidate.id } })

    return successResponse({ message: 'Account deleted successfully' })
  } catch (error) {
    return errorResponse(error)
  }
}
