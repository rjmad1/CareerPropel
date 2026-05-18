import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateJobInputSchema, JobFilterSchema } from '@/lib/validations/job'
import { ApiErrors } from '@/lib/errors/ApiError'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { sanitizeUserFeedback } from '@/lib/safety/promptSanitizer'
import { getAuthContext } from '@/lib/middleware/auth'
import { createRateLimiter } from '@/lib/middleware/rateLimiter'
import { handleCorsPreFlight, applyCorsHeaders } from '@/lib/middleware/cors'

export const dynamic = 'force-dynamic'

const getJobsLimiter = createRateLimiter(100, 60000)
const createJobLimiter = createRateLimiter(20, 60000)

export async function GET(request: NextRequest) {
  const corsResponse = handleCorsPreFlight(request)
  if (corsResponse) return corsResponse

  const rateLimitResponse = await getJobsLimiter(request)
  if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse)
  try {
    const { userEmail } = await getAuthContext()

    const { searchParams } = new URL(request.url)

    const filters = JobFilterSchema.safeParse({
      company: searchParams.get('company') || undefined,
      search: searchParams.get('search') || undefined,
      stage: searchParams.get('stage') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortDir: searchParams.get('sortDir') || undefined,
    })

    if (!filters.success) {
      throw ApiErrors.VALIDATION_ERROR('Invalid filter parameters')
    }

    const { company, search, stage } = filters.data

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
    })

    if (!candidate) {
      return successResponse([])
    }

    const where: any = {
      candidateId: candidate.id,
    }

    if (company) {
      where.company = { contains: company, mode: 'insensitive' }
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (stage) {
      where.stage = stage
    }

    const jobs = await prisma.job.findMany({
      where,
      include: { activities: true },
      orderBy: { createdAt: 'desc' },
    })

    const response = successResponse(jobs)
    return applyCorsHeaders(request, response)
  } catch (error) {
    const response = errorResponse(error)
    return applyCorsHeaders(request, response)
  }
}

export async function POST(request: NextRequest) {
  try {
    const corsResponse = handleCorsPreFlight(request)
    if (corsResponse) return corsResponse

    const rateLimitResponse = await createJobLimiter(request)
    if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse)

    const { userEmail } = await getAuthContext()

    const body = await request.json()

    const validation = CreateJobInputSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      const message = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${msgs?.[0]}`)
        .join('; ')
      throw ApiErrors.VALIDATION_ERROR(message)
    }

    const { title, company, url, notes, stage } = validation.data

    const sanitizedNotes = notes ? sanitizeUserFeedback(notes) : null

    let candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
    })

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          email: userEmail,
          name: userEmail.split('@')[0],
        },
      })
    }

    const job = await prisma.job.create({
      data: {
        title,
        company,
        url: url || null,
        description: sanitizedNotes,
        stage,
        candidateId: candidate.id,
      },
      include: { activities: true },
    })

    const response = successResponse(job, 201)
    return applyCorsHeaders(request, response)
  } catch (error) {
    const response = errorResponse(error)
    return applyCorsHeaders(request, response)
  }
}
