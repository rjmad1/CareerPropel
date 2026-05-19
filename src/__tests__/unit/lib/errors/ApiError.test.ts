import { ApiError, ApiErrors } from '@/lib/errors/ApiError'

describe('ApiError', () => {
  describe('constructor', () => {
    it('sets statusCode, code, and message', () => {
      const err = new ApiError(404, 'NOT_FOUND', 'Resource not found')
      expect(err.statusCode).toBe(404)
      expect(err.code).toBe('NOT_FOUND')
      expect(err.message).toBe('Resource not found')
      expect(err.name).toBe('ApiError')
    })

    it('stores optional internalError', () => {
      const cause = new Error('DB error')
      const err = new ApiError(500, 'DB_ERROR', 'Database failed', cause)
      expect(err.internalError).toBe(cause)
    })

    it('is an instance of Error', () => {
      const err = new ApiError(400, 'BAD', 'bad')
      expect(err).toBeInstanceOf(Error)
    })
  })

  describe('toJSON', () => {
    const setNodeEnv = (value: string) =>
      Object.defineProperty(process.env, 'NODE_ENV', { value, configurable: true, writable: true })

    beforeEach(() => {
      setNodeEnv('test')
    })

    it('returns the code and message', () => {
      const err = new ApiError(400, 'VALIDATION_ERROR', 'Invalid input')
      const json = err.toJSON()
      expect(json.error.code).toBe('VALIDATION_ERROR')
      expect(json.error.message).toBe('Invalid input')
    })

    it('does not include details when includeDetails is false', () => {
      const cause = new Error('internal')
      const err = new ApiError(500, 'INTERNAL', 'failed', cause)
      const json = err.toJSON(false)
      expect(json.error.details).toBeUndefined()
    })

    it('does not include details in non-development environment', () => {
      const originalEnv = process.env.NODE_ENV
      setNodeEnv('production')
      const cause = new Error('internal')
      const err = new ApiError(500, 'INTERNAL', 'failed', cause)
      const json = err.toJSON(true)
      expect(json.error.details).toBeUndefined()
      setNodeEnv(originalEnv ?? 'test')
    })

    it('includes details in development with includeDetails=true and internalError', () => {
      const originalEnv = process.env.NODE_ENV
      setNodeEnv('development')
      const cause = new Error('db connection failed')
      const err = new ApiError(500, 'DB_ERROR', 'Database error', cause)
      const json = err.toJSON(true)
      expect(json.error.details).toBeDefined()
      expect(json.error.details?.internal).toContain('db connection failed')
      setNodeEnv(originalEnv ?? 'test')
    })
  })

  describe('log', () => {
    it('calls console.error', () => {
      const err = new ApiError(500, 'ERROR', 'test error')
      err.log()
      expect(console.error).toHaveBeenCalled()
    })
  })
})

describe('ApiErrors factory', () => {
  it('VALIDATION_ERROR returns 400 with details', () => {
    const err = ApiErrors.VALIDATION_ERROR('field is required')
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.message).toContain('field is required')
  })

  it('UNAUTHORIZED returns 401', () => {
    const err = ApiErrors.UNAUTHORIZED()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('FORBIDDEN returns 403 with resource name', () => {
    const err = ApiErrors.FORBIDDEN('job')
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
    expect(err.message).toContain('job')
  })

  it('FORBIDDEN uses default resource when none provided', () => {
    const err = ApiErrors.FORBIDDEN()
    expect(err.message).toContain('resource')
  })

  it('NOT_FOUND returns 404 with resource name', () => {
    const err = ApiErrors.NOT_FOUND('interview')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toContain('interview')
  })

  it('CONFLICT returns 409', () => {
    const err = ApiErrors.CONFLICT('email already exists')
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe('CONFLICT')
    expect(err.message).toContain('email already exists')
  })

  it('RATE_LIMIT returns 429', () => {
    const err = ApiErrors.RATE_LIMIT()
    expect(err.statusCode).toBe(429)
    expect(err.code).toBe('RATE_LIMIT_EXCEEDED')
  })

  it('INTERNAL_ERROR returns 500', () => {
    const err = ApiErrors.INTERNAL_ERROR()
    expect(err.statusCode).toBe(500)
    expect(err.code).toBe('INTERNAL_ERROR')
  })

  it('INTERNAL_ERROR stores internalError', () => {
    const cause = new Error('crash')
    const err = ApiErrors.INTERNAL_ERROR(cause)
    expect(err.internalError).toBe(cause)
  })

  it('DATABASE_ERROR returns 500', () => {
    const err = ApiErrors.DATABASE_ERROR()
    expect(err.statusCode).toBe(500)
    expect(err.code).toBe('DATABASE_ERROR')
  })

  it('INVALID_REQUEST returns 400', () => {
    const err = ApiErrors.INVALID_REQUEST('missing field')
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('INVALID_REQUEST')
    expect(err.message).toContain('missing field')
  })
})
