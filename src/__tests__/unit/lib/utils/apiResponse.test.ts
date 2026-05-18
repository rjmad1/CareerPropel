/**
 * @jest-environment node
 */
import { successResponse, errorResponse, handleApiRequest } from '@/lib/utils/apiResponse'
import { ApiError, ApiErrors } from '@/lib/errors/ApiError'
import { ZodError, z } from 'zod'

describe('successResponse', () => {
  it('returns a response with success: true', async () => {
    const res = successResponse({ id: '1', name: 'test' })
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('includes the data in the response body', async () => {
    const data = { jobs: [{ id: 'job-1' }] }
    const res = successResponse(data)
    const body = await res.json()
    expect(body.data).toEqual(data)
  })

  it('defaults to 200 status code', () => {
    const res = successResponse({})
    expect(res.status).toBe(200)
  })

  it('accepts custom status code', () => {
    const res = successResponse({}, 201)
    expect(res.status).toBe(201)
  })

  it('handles null data', async () => {
    const res = successResponse(null)
    const body = await res.json()
    expect(body.data).toBeNull()
    expect(body.success).toBe(true)
  })

  it('handles array data', async () => {
    const res = successResponse([1, 2, 3])
    const body = await res.json()
    expect(body.data).toEqual([1, 2, 3])
  })
})

describe('errorResponse', () => {
  it('handles ApiError correctly', async () => {
    const err = ApiErrors.NOT_FOUND('job')
    const res = errorResponse(err)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error.code).toBe('NOT_FOUND')
  })

  it('handles ZodError by returning 400 VALIDATION_ERROR', async () => {
    const schema = z.object({ name: z.string().min(1) })
    const result = schema.safeParse({ name: '' })
    const zodErr = (result as any).error as ZodError
    const res = errorResponse(zodErr)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('handles generic Error as 500 INTERNAL_ERROR', async () => {
    const err = new Error('Something broke')
    const res = errorResponse(err)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('handles unknown error as 500', async () => {
    const res = errorResponse('some string error')
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('overrides status code when explicitly provided', async () => {
    const err = ApiErrors.NOT_FOUND('job')
    const res = errorResponse(err, 422)
    expect(res.status).toBe(422)
  })

  it('calls ApiError.log()', async () => {
    const err = new ApiError(400, 'TEST', 'test error')
    const logSpy = jest.spyOn(err, 'log')
    errorResponse(err)
    expect(logSpy).toHaveBeenCalled()
  })
})

describe('handleApiRequest', () => {
  it('returns successResponse when handler resolves', async () => {
    const handler = jest.fn().mockResolvedValue({ id: 'result' })
    const res = await handleApiRequest(handler)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual({ id: 'result' })
  })

  it('returns errorResponse when handler throws ApiError', async () => {
    const handler = jest.fn().mockRejectedValue(ApiErrors.UNAUTHORIZED())
    const res = await handleApiRequest(handler)
    expect(res.status).toBe(401)
  })

  it('returns errorResponse when handler throws generic Error', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('boom'))
    const res = await handleApiRequest(handler)
    expect(res.status).toBe(500)
  })

  it('uses custom successStatus when provided', async () => {
    const handler = jest.fn().mockResolvedValue({ created: true })
    const res = await handleApiRequest(handler, 201)
    expect(res.status).toBe(201)
  })

  it('calls the handler exactly once', async () => {
    const handler = jest.fn().mockResolvedValue(null)
    await handleApiRequest(handler)
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
