import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { UpdateJobInputSchema } from '@/lib/validations/job'
import { ApiErrors } from '@/lib/errors/ApiError'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { sanitizeUserFeedback } from '@/lib/safety/promptSanitizer'
import { getAuthContext } from '@/lib/middleware/auth'
import { createRateLimiter } from '@/lib/middleware/rateLimiter'
import { handleCorsPreFlight, applyCorsHeaders } from '@/lib/middleware/cors'

export const dynamic = 'force-dynamic'

const getJobLimiter = createRateLimiter(100, 60)
const updateJobLimiter = createRateLimiter(30, 60)
const deleteJobLimiter = createRateLimiter(30, 60)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const corsResponse = handleCorsPreFlight(request)
    if (corsResponse) return corsResponse

    const rateLimitResponse = await getJobLimiter(request)
    if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse)

    const { userEmail } = await getAuthContext()

    const { id } = await context.params

    if (!id || id.length < 5) {
      throw ApiErrors.INVALID_REQUEST('Invalid job ID format')
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: { activities: true },
    })

    if (!job) {
      throw ApiErrors.NOT_FOUND('job')
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
    })

    if (!candidate || job.candidateId !== candidate.id) {
      throw ApiErrors.FORBIDDEN('job')
    }

    const response = successResponse(job)
    return applyCorsHeaders(request, response)
  } catch (error) {
    const response = errorResponse(error)
    return applyCorsHeaders(request, response)
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const corsResponse = handleCorsPreFlight(request)
    if (corsResponse) return corsResponse

    const rateLimitResponse = await updateJobLimiter(request)
    if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse)

    const { userEmail } = await getAuthContext()

    const { id } = await context.params

    if (!id || id.length < 5) {
      throw ApiErrors.INVALID_REQUEST('Invalid job ID format')
    }

    const body = await request.json()

    const validation = UpdateJobInputSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      const message = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${msgs?.[0]}`)
        .join('; ')
      throw ApiErrors.VALIDATION_ERROR(message)
    }

    const { title, company, url, stage, notes } = validation.data

    const existingJob = await prisma.job.findUnique({
      where: { id },
      include: { candidate: true },
    })

    if (!existingJob) {
      throw ApiErrors.NOT_FOUND('job')
    }

    if (existingJob.candidate.email !== userEmail) {
      throw ApiErrors.FORBIDDEN('job')
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (company !== undefined) updateData.company = company
    if (url !== undefined) updateData.url = url
    if (stage !== undefined) updateData.stage = stage
    if (notes !== undefined) {
      updateData.description = notes ? sanitizeUserFeedback(notes) : null
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: { activities: true },
    })

    const response = successResponse(job)
    return applyCorsHeaders(request, response)
  } catch (error) {
    const response = errorResponse(error)
    return applyCorsHeaders(request, response)
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const corsResponse = handleCorsPreFlight(request)
    if (corsResponse) return corsResponse

    const rateLimitResponse = await deleteJobLimiter(request)
    if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse)

    const { userEmail } = await getAuthContext()

    const { id } = await context.params

    if (!id || id.length < 5) {
      throw ApiErrors.INVALID_REQUEST('Invalid job ID format')
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: { candidate: true },
    })

    if (!job) {
      throw ApiErrors.NOT_FOUND('job')
    }

    if (job.candidate.email !== userEmail) {
      throw ApiErrors.FORBIDDEN('job')
    }

    await prisma.job.delete({
      where: { id },
    })

    const response = successResponse({ success: true })
    return applyCorsHeaders(request, response)
  } catch (error) {
    const response = errorResponse(error)
    return applyCorsHeaders(request, response)
  }
}
