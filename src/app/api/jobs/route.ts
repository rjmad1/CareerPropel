import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { CreateJobInputSchema, JobFilterSchema } from '@/lib/validations/job'
import { ApiErrors } from '@/lib/errors/ApiError'
import { successResponse, errorResponse } from '@/lib/utils/apiResponse'
import { sanitizeUserFeedback } from '@/lib/safety/promptSanitizer'
import { getAuthContext } from '@/lib/middleware/auth'
import { createRateLimiter } from '@/lib/middleware/rateLimiter'
import { handleCorsPreFlight, applyCorsHeaders } from '@/lib/middleware/cors'

const prisma = new PrismaClient()

// Rate limiters for different operations
const getJobsLimiter = createRateLimiter(100, 60000) // 100 per minute
const createJobLimiter = createRateLimiter(20, 60000) // 20 per minute

/**
 * GET /api/jobs
 * Retrieve all jobs with optional filtering
 * Protected: Requires authentication
 * Rate Limited: 100 requests per minute per IP
 * Returns only jobs belonging to the authenticated user
 */
export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCorsPreFlight(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = getJobsLimiter(request)
  if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse)
  try {
    // Require authentication
    const { userEmail } = await getAuthContext()

    const { searchParams } = new URL(request.url)

    // Validate and parse query parameters
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

    // Get user's candidate profile
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
    })

    if (!candidate) {
      // User has no jobs yet
      return successResponse([])
    }

    // Build query - only user's jobs
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

/**
 * POST /api/jobs
 * Create a new job
 * Protected: Requires authentication
 * Rate Limited: 20 requests per minute per IP
 * CSRF Protected: Requires valid CSRF token (optional in dev)
 * Job will be created for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCorsPreFlight(request)
    if (corsResponse) return corsResponse

    // Apply rate limiting
    const rateLimitResponse = createJobLimiter(request)
    if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse)

    // Require authentication
    const { userEmail } = await getAuthContext()

    const body = await request.json()

    // Validate request body with Zod
    const validation = CreateJobInputSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      const message = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${msgs?.[0]}`)
        .join('; ')
      throw ApiErrors.VALIDATION_ERROR(message)
    }

    const { title, company, url, notes, stage } = validation.data

    // Sanitize user input
    const sanitizedNotes = notes ? sanitizeUserFeedback(notes) : null

    // Get or create candidate profile for authenticated user
    let candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
    })

    if (!candidate) {
      // Create candidate profile for new user
      candidate = await prisma.candidate.create({
        data: {
          email: userEmail,
          name: userEmail.split('@')[0], // Use email prefix as default name
        },
      })
    }

    // Create job in database
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
