import { checkOwnership, getUserIdFromSession } from '@/lib/middleware/auth'
import { ApiError } from '@/lib/errors/ApiError'

// Mock next-auth and the auth options
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

describe('checkOwnership', () => {
  it('does not throw when userId matches resourceOwnerId', () => {
    expect(() => checkOwnership('user-1', 'user-1')).not.toThrow()
  })

  it('throws FORBIDDEN ApiError when userId does not match resourceOwnerId', () => {
    expect(() => checkOwnership('user-1', 'user-2')).toThrow(ApiError)
  })

  it('thrown error has statusCode 403', () => {
    try {
      checkOwnership('a', 'b')
      fail('expected error')
    } catch (err) {
      expect((err as ApiError).statusCode).toBe(403)
      expect((err as ApiError).code).toBe('FORBIDDEN')
    }
  })
})

describe('getUserIdFromSession', () => {
  it('returns userId when present in session', () => {
    const session = { user: { id: 'user-123', email: 'user@example.com' } }
    expect(getUserIdFromSession(session)).toBe('user-123')
  })

  it('throws UNAUTHORIZED when session has no user id', () => {
    const session = { user: { email: 'user@example.com' } }
    expect(() => getUserIdFromSession(session)).toThrow(ApiError)
  })

  it('throws UNAUTHORIZED when session is null', () => {
    expect(() => getUserIdFromSession(null)).toThrow(ApiError)
  })

  it('throws UNAUTHORIZED when session.user is undefined', () => {
    expect(() => getUserIdFromSession({})).toThrow(ApiError)
  })

  it('thrown UNAUTHORIZED error has statusCode 401', () => {
    try {
      getUserIdFromSession(null)
    } catch (err) {
      expect((err as ApiError).statusCode).toBe(401)
      expect((err as ApiError).code).toBe('UNAUTHORIZED')
    }
  })
})
