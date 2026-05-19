import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAuthContext } from '@/lib/middleware/auth'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { ApiErrors } from '@/lib/errors/ApiError'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 300 * 1024 // 300 KB

const schema = z.object({
  avatarDataUrl: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext()
    const body = await request.json()
    const { avatarDataUrl } = schema.parse(body)

    if (!avatarDataUrl.startsWith('data:image/')) {
      throw ApiErrors.VALIDATION_ERROR('avatarDataUrl must be an image data URL')
    }

    // Rough byte size check (base64 encodes ~4/3 raw bytes)
    const base64Part = avatarDataUrl.split(',')[1] ?? ''
    const approxBytes = Math.ceil((base64Part.length * 3) / 4)
    if (approxBytes > MAX_BYTES) {
      throw ApiErrors.VALIDATION_ERROR('Image must be under 300 KB')
    }

    await prisma.candidate.update({
      where: { email: userEmail },
      data: { avatarUrl: avatarDataUrl },
    })

    return successResponse({ avatarUrl: avatarDataUrl })
  } catch (error) {
    return errorResponse(error)
  }
}
