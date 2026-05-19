import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
  }).optional(),
})

export async function GET(_request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        location: true,
        summary: true,
        avatarUrl: true,
        emailVerified: true,
        preferences: true,
        createdAt: true,
      },
    })
    return successResponse(candidate)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()
    const body = await request.json()
    const data = updateSchema.parse(body)

    const candidate = await prisma.candidate.update({
      where: { email: userEmail },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        location: true,
        summary: true,
        avatarUrl: true,
        emailVerified: true,
        preferences: true,
      },
    })

    return successResponse(candidate)
  } catch (error) {
    return errorResponse(error)
  }
}
