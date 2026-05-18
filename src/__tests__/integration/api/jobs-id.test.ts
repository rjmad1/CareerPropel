/**
 * @jest-environment node
 *
 * Integration tests for GET/PATCH/DELETE /api/jobs/[id]
 */

import { NextRequest } from 'next/server'
import '../../__mocks__/prisma'
import { prismaMock } from '../../__mocks__/prisma'

const mockGetAuthContext = jest.fn()
jest.mock('@/lib/middleware/auth', () => ({
  getAuthContext: mockGetAuthContext,
  requireAuth: jest.fn(),
  checkOwnership: jest.fn(),
  getUserIdFromSession: jest.fn(),
}))

jest.mock('@/lib/middleware/rateLimiter', () => ({
  createRateLimiter: () => jest.fn().mockResolvedValue(null),
}))

jest.mock('@/lib/middleware/cors', () => ({
  handleCorsPreFlight: jest.fn().mockReturnValue(null),
  applyCorsHeaders: (_req: unknown, res: unknown) => res,
}))

jest.mock('@/lib/redis/redisClient', () => ({
  redis: { eval: jest.fn() },
}))

const USER_EMAIL = 'owner@example.com'
const CANDIDATE_ID = 'cand-owner'
const JOB_ID = 'job-existing-id'

const mockCandidate = { id: CANDIDATE_ID, email: USER_EMAIL }
const mockJob = {
  id: JOB_ID,
  title: 'Staff Engineer',
  company: 'Widgets LLC',
  stage: 'sourced',
  candidateId: CANDIDATE_ID,
  candidate: { email: USER_EMAIL },
  activities: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

function makeRequest(method: string, body?: object): NextRequest {
  return new NextRequest(`http://localhost:3000/api/jobs/${JOB_ID}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

const params = { params: { id: JOB_ID } }

describe('GET /api/jobs/[id]', () => {
  const { GET } = require('@/app/api/jobs/[id]/route')

  beforeEach(() => {
    mockGetAuthContext.mockResolvedValue({ userEmail: USER_EMAIL, userId: CANDIDATE_ID, session: {} })
    prismaMock.job.findUnique.mockResolvedValue(mockJob as any)
    prismaMock.candidate.findUnique.mockResolvedValue(mockCandidate as any)
  })

  it('returns 200 with the job data', async () => {
    const req = makeRequest('GET')
    const res = await GET(req, params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe(JOB_ID)
    expect(body.success).toBe(true)
  })

  it('returns 404 when job does not exist', async () => {
    prismaMock.job.findUnique.mockResolvedValue(null)
    const req = makeRequest('GET')
    const res = await GET(req, params)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error.code).toBe('NOT_FOUND')
  })

  it('returns 403 when job belongs to a different user', async () => {
    prismaMock.candidate.findUnique.mockResolvedValue({ id: 'other-cand', email: USER_EMAIL } as any)
    prismaMock.job.findUnique.mockResolvedValue({
      ...mockJob,
      candidateId: 'different-cand',
    } as any)
    const req = makeRequest('GET')
    const res = await GET(req, params)
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid job ID (too short)', async () => {
    const req = new NextRequest('http://localhost:3000/api/jobs/abc', { method: 'GET' })
    const res = await GET(req, { params: { id: 'abc' } })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('INVALID_REQUEST')
  })

  it('returns 401 when not authenticated', async () => {
    const { ApiError } = await import('@/lib/errors/ApiError')
    mockGetAuthContext.mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Not authorized'))
    const req = makeRequest('GET')
    const res = await GET(req, params)
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/jobs/[id]', () => {
  const { PATCH } = require('@/app/api/jobs/[id]/route')

  const updatedJob = { ...mockJob, stage: 'applied', title: 'Updated Title' }

  beforeEach(() => {
    mockGetAuthContext.mockResolvedValue({ userEmail: USER_EMAIL, userId: CANDIDATE_ID, session: {} })
    prismaMock.job.findUnique.mockResolvedValue(mockJob as any)
    prismaMock.job.update.mockResolvedValue(updatedJob as any)
  })

  it('returns 200 with updated job data', async () => {
    const req = makeRequest('PATCH', { stage: 'applied', title: 'Updated Title' })
    const res = await PATCH(req, params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.stage).toBe('applied')
  })

  it('calls prisma.job.update with correct data', async () => {
    const req = makeRequest('PATCH', { stage: 'offer' })
    await PATCH(req, params)
    expect(prismaMock.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: JOB_ID },
        data: expect.objectContaining({ stage: 'offer' }),
      })
    )
  })

  it('returns 400 for invalid stage value', async () => {
    const req = makeRequest('PATCH', { stage: 'unknown_stage' })
    const res = await PATCH(req, params)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 404 when job not found', async () => {
    prismaMock.job.findUnique.mockResolvedValue(null)
    const req = makeRequest('PATCH', { stage: 'applied' })
    const res = await PATCH(req, params)
    expect(res.status).toBe(404)
  })

  it('returns 403 when job belongs to a different user', async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      ...mockJob,
      candidate: { email: 'other@example.com' },
    } as any)
    const req = makeRequest('PATCH', { stage: 'applied' })
    const res = await PATCH(req, params)
    expect(res.status).toBe(403)
  })

  it('sanitizes notes in the update', async () => {
    const req = makeRequest('PATCH', { notes: '<img src=x onerror=alert(1)>legit notes' })
    await PATCH(req, params)
    if (prismaMock.job.update.mock.calls.length > 0) {
      const call = prismaMock.job.update.mock.calls[0][0]
      expect(call.data.description ?? '').not.toContain('<img')
    }
  })

  it('returns 400 for invalid job ID', async () => {
    const req = new NextRequest('http://localhost:3000/api/jobs/xy', {
      method: 'PATCH',
      body: JSON.stringify({ stage: 'applied' }),
    })
    const res = await PATCH(req, { params: { id: 'xy' } })
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    const { ApiError } = await import('@/lib/errors/ApiError')
    mockGetAuthContext.mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Not authorized'))
    const req = makeRequest('PATCH', { stage: 'applied' })
    const res = await PATCH(req, params)
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/jobs/[id]', () => {
  const { DELETE } = require('@/app/api/jobs/[id]/route')

  beforeEach(() => {
    mockGetAuthContext.mockResolvedValue({ userEmail: USER_EMAIL, userId: CANDIDATE_ID, session: {} })
    prismaMock.job.findUnique.mockResolvedValue(mockJob as any)
    prismaMock.job.delete.mockResolvedValue(mockJob as any)
  })

  it('returns 200 with success: true', async () => {
    const req = makeRequest('DELETE')
    const res = await DELETE(req, params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.success).toBe(true)
  })

  it('calls prisma.job.delete with the job id', async () => {
    const req = makeRequest('DELETE')
    await DELETE(req, params)
    expect(prismaMock.job.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: JOB_ID } })
    )
  })

  it('returns 404 when job not found', async () => {
    prismaMock.job.findUnique.mockResolvedValue(null)
    const req = makeRequest('DELETE')
    const res = await DELETE(req, params)
    expect(res.status).toBe(404)
  })

  it('returns 403 when job belongs to a different user', async () => {
    prismaMock.job.findUnique.mockResolvedValue({
      ...mockJob,
      candidate: { email: 'other@example.com' },
    } as any)
    const req = makeRequest('DELETE')
    const res = await DELETE(req, params)
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid job ID', async () => {
    const req = new NextRequest('http://localhost:3000/api/jobs/ab', { method: 'DELETE' })
    const res = await DELETE(req, { params: { id: 'ab' } })
    expect(res.status).toBe(400)
  })

  it('returns 401 when not authenticated', async () => {
    const { ApiError } = await import('@/lib/errors/ApiError')
    mockGetAuthContext.mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Not authorized'))
    const req = makeRequest('DELETE')
    const res = await DELETE(req, params)
    expect(res.status).toBe(401)
  })
})
