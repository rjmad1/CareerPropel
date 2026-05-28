import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { UpdateJobInputSchema } from '@/lib/validations/job'
import { ApiErrors } from '@/lib/errors/ApiError'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { sanitizeUserFeedback } from '@/lib/safety/promptSanitizer'
import { getAuthContext } from '@/lib/middleware/auth'
import { createRateLimiter } from '@/lib/middleware/rateLimiter'
import { handleCorsPreFlight, applyCorsHeaders } from '@/lib/middleware/cors'
import { recordConversionOutcome } from '@/lib/scoring/telemetry'



// Rate limiters for individual job operations
const getJobLimiter = createRateLimiter(100, 60) // 100 per minute
const updateJobLimiter = createRateLimiter(30, 60) // 30 per minute
const deleteJobLimiter = createRateLimiter(30, 60) // 30 per minute

/**
 * GET /api/jobs/[id]
 * Retrieve a specific job by ID
 * Protected: Requires authentication
 * Authorization: User must own the job
 * Rate Limited: 100 requests per minute
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCorsPreFlight(request)
    if (corsResponse) return corsResponse

    // Apply rate limiting
    const rateLimitResponse = await getJobLimiter(request)
    if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse)

    // Require authentication
    const { userEmail } = await getAuthContext()

    const { id } = params

    // Validate ID format (basic check)
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

    // Check ownership: User can only view their own jobs
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

/**
 * PATCH /api/jobs/[id]
 * Update a specific job
 * Protected: Requires authentication
 * Authorization: User must own the job
 * Rate Limited: 30 requests per minute
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCorsPreFlight(request)
    if (corsResponse) return corsResponse

    // Apply rate limiting
    const rateLimitResponse = await updateJobLimiter(request)
    if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse)

    // Require authentication
    const { userEmail } = await getAuthContext()

    const { id } = params

    // Validate ID format
    if (!id || id.length < 5) {
      throw ApiErrors.INVALID_REQUEST('Invalid job ID format')
    }

    const body = await request.json()

    // Validate request body with Zod
    const validation = UpdateJobInputSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      const message = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${msgs?.[0]}`)
        .join('; ')
      throw ApiErrors.VALIDATION_ERROR(message)
    }

    const { title, company, url, stage, notes } = validation.data

    // Check job exists first
    const existingJob = await prisma.job.findUnique({
      where: { id },
      include: { candidate: true },
    })

    if (!existingJob) {
      throw ApiErrors.NOT_FOUND('job')
    }

    // Check ownership: User can only update their own jobs
    if (existingJob.candidate.email !== userEmail) {
      throw ApiErrors.FORBIDDEN('job')
    }

    // Prepare update data with sanitization
    const updateData: Record<string, string | null> = {}
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

    // Record conversion outcome telemetry if stage is changing
    if (stage !== undefined && stage !== existingJob.stage) {
      let outcome: 'progressed' | 'rejected' | 'offer' | null = null
      if (stage === 'offer' || stage === 'negotiation') {
        outcome = 'offer'
      } else if ([
        'recruiter_screen',
        'hiring_manager',
        'technical_interview',
        'system_design',
        'behavioral',
        'final_round'
      ].includes(stage)) {
        outcome = 'progressed'
      } else if (stage === 'rejected') {
        outcome = 'rejected'
      }

      if (outcome) {
        // Record conversion outcome asynchronously to avoid blocking the API response
        recordConversionOutcome(existingJob.candidate.id, id, stage, outcome).catch((err) => {
          console.error('[Telemetry] Error recording conversion outcome:', err)
        })
      }
    }

    const response = successResponse(job)
    return applyCorsHeaders(request, response)
  } catch (error) {
    const response = errorResponse(error)
    return applyCorsHeaders(request, response)
  }
}

/**
 * DELETE /api/jobs/[id]
 * Delete a specific job
 * Protected: Requires authentication
 * Authorization: User must own the job
 * Rate Limited: 30 requests per minute
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCorsPreFlight(request)
    if (corsResponse) return corsResponse

    // Apply rate limiting
    const rateLimitResponse = await deleteJobLimiter(request)
    if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse)

    // Require authentication
    const { userEmail } = await getAuthContext()

    const { id } = params

    // Validate ID format
    if (!id || id.length < 5) {
      throw ApiErrors.INVALID_REQUEST('Invalid job ID format')
    }

    // Check job exists first
    const job = await prisma.job.findUnique({
      where: { id },
      include: { candidate: true },
    })

    if (!job) {
      throw ApiErrors.NOT_FOUND('job')
    }

    // Check ownership: User can only delete their own jobs
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
