/**
 * @jest-environment node
 *
 * Integration tests for GET /api/jobs and POST /api/jobs
 * Mocks: prisma, auth middleware, rate limiter, cors
 */

import { NextRequest } from 'next/server'
import '../../__mocks__/prisma'
import { prismaMock } from '../../__mocks__/prisma'

// Auth middleware mock
const mockGetAuthContext = jest.fn()
jest.mock('@/lib/middleware/auth', () => ({
  getAuthContext: mockGetAuthContext,
  requireAuth: jest.fn(),
  checkOwnership: jest.fn(),
  getUserIdFromSession: jest.fn(),
}))

// Rate limiter - always allow by default
jest.mock('@/lib/middleware/rateLimiter', () => ({
  createRateLimiter: () => jest.fn().mockResolvedValue(null),
  rateLimitMiddleware: jest.fn().mockResolvedValue(null),
}))

// CORS - passthrough
jest.mock('@/lib/middleware/cors', () => ({
  handleCorsPreFlight: jest.fn().mockReturnValue(null),
  applyCorsHeaders: (_req: unknown, res: unknown) => res,
  withCors: (handler: unknown) => handler,
}))

// Redis (used by rate limiter if not mocked at higher level)
jest.mock('@/lib/redis/redisClient', () => ({
  redis: { eval: jest.fn() },
}))

const USER_EMAIL = 'test@example.com'
const CANDIDATE_ID = 'cand-1'

const mockCandidate = { id: CANDIDATE_ID, email: USER_EMAIL, name: 'Test User' }

function makeRequest(method: string, body?: object, searchParams?: string): NextRequest {
  const url = `http://localhost:3000/api/jobs${searchParams ? '?' + searchParams : ''}`
  return new NextRequest(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('GET /api/jobs', () => {
  const { GET } = require('@/app/api/jobs/route')

  beforeEach(() => {
    mockGetAuthContext.mockResolvedValue({ userEmail: USER_EMAIL, userId: CANDIDATE_ID, session: {} })
    prismaMock.candidate.findUnique.mockResolvedValue(mockCandidate as any)
    prismaMock.job.findMany.mockResolvedValue([])
  })

  it('returns 200 with empty array when no jobs', async () => {
    const req = makeRequest('GET')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual([])
    expect(body.success).toBe(true)
  })

  it('returns 200 with jobs list', async () => {
    const mockJobs = [
      { id: 'job-1', title: 'Engineer', company: 'Acme', stage: 'sourced', activities: [] },
      { id: 'job-2', title: 'Manager', company: 'Beta', stage: 'applied', activities: [] },
    ]
    prismaMock.job.findMany.mockResolvedValue(mockJobs as any)

    const req = makeRequest('GET')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveLength(2)
  })

  it('returns empty array when candidate profile does not exist', async () => {
    prismaMock.candidate.findUnique.mockResolvedValue(null)
    const req = makeRequest('GET')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual([])
  })

  it('returns 401 when not authenticated', async () => {
    const { ApiError } = await import('@/lib/errors/ApiError')
    mockGetAuthContext.mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Not authorized'))
    const req = makeRequest('GET')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('filters jobs by company query param', async () => {
    prismaMock.job.findMany.mockResolvedValue([
      { id: 'job-1', company: 'Acme', activities: [] },
    ] as any)

    const req = makeRequest('GET', undefined, 'company=Acme')
    await GET(req)

    expect(prismaMock.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          company: expect.objectContaining({ contains: 'Acme' }),
        }),
      })
    )
  })

  it('filters jobs by stage query param', async () => {
    prismaMock.job.findMany.mockResolvedValue([])

    const req = makeRequest('GET', undefined, 'stage=applied')
    await GET(req)

    expect(prismaMock.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ stage: 'applied' }),
      })
    )
  })
})

describe('POST /api/jobs', () => {
  const { POST } = require('@/app/api/jobs/route')

  const validBody = {
    title: 'Software Engineer',
    company: 'Acme Corp',
  }

  const mockCreatedJob = {
    id: 'job-new',
    title: 'Software Engineer',
    company: 'Acme Corp',
    stage: 'sourced',
    candidateId: CANDIDATE_ID,
    activities: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockGetAuthContext.mockResolvedValue({ userEmail: USER_EMAIL, userId: CANDIDATE_ID, session: {} })
    prismaMock.candidate.findUnique.mockResolvedValue(mockCandidate as any)
    prismaMock.job.create.mockResolvedValue(mockCreatedJob as any)
  })

  it('creates a job and returns 201', async () => {
    const req = makeRequest('POST', validBody)
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.id).toBe('job-new')
    expect(body.success).toBe(true)
  })

  it('creates a candidate profile if one does not exist', async () => {
    prismaMock.candidate.findUnique.mockResolvedValue(null)
    prismaMock.candidate.create.mockResolvedValue(mockCandidate as any)

    const req = makeRequest('POST', validBody)
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(prismaMock.candidate.create).toHaveBeenCalled()
  })

  it('calls prisma.job.create with correct data', async () => {
    const req = makeRequest('POST', { ...validBody, stage: 'applied' })
    await POST(req)
    expect(prismaMock.job.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Software Engineer',
          company: 'Acme Corp',
          stage: 'applied',
          candidateId: CANDIDATE_ID,
        }),
      })
    )
  })

  it('returns 400 for missing title', async () => {
    const req = makeRequest('POST', { company: 'Acme Corp' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for missing company', async () => {
    const req = makeRequest('POST', { title: 'Engineer' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid URL', async () => {
    const req = makeRequest('POST', { ...validBody, url: 'not-a-url' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('sanitizes notes before saving', async () => {
    const req = makeRequest('POST', {
      ...validBody,
      notes: '<script>alert("xss")</script>Great role',
    })
    await POST(req)
    const call = prismaMock.job.create.mock.calls[0][0]
    expect(call.data.description).not.toContain('<script>')
  })

  it('returns 401 when not authenticated', async () => {
    const { ApiError } = await import('@/lib/errors/ApiError')
    mockGetAuthContext.mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Not authorized'))
    const req = makeRequest('POST', validBody)
    const res = await POST(req)
    expect(res.status).toBe(401)
  })
})
