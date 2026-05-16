import { NextRequest, NextResponse } from 'next/server'

// In-memory store for rate limiting (for development)
// In production, use Redis
const requestCounts = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // requests per window

/**
 * Rate limiter middleware
 * Tracks requests per IP address
 */
export function rateLimitMiddleware(request: NextRequest) {
  // Get client IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const now = Date.now()
  const record = requestCounts.get(ip)

  // Initialize or reset if window expired
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return null // Request allowed
  }

  // Increment counter
  record.count++

  // Check if limit exceeded
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return new NextResponse(
      JSON.stringify({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute allowed.`,
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        }
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
        }
      }
    )
  }

  return null // Request allowed
}

/**
 * Per-endpoint rate limiter with custom limits
 * Useful for protecting expensive operations
 */
export function createRateLimiter(maxRequests: number = 10, windowMs: number = 60000) {
  const store = new Map<string, { count: number; resetTime: number }>()

  return (request: NextRequest) => {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const now = Date.now()
    const record = store.get(ip)

    if (!record || now > record.resetTime) {
      store.set(ip, {
        count: 1,
        resetTime: now + windowMs
      })
      return null
    }

    record.count++

    if (record.count > maxRequests) {
      return new NextResponse(
        JSON.stringify({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${Math.ceil(windowMs / 1000)} seconds allowed.`,
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
          }
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
          }
        }
      )
    }

    return null
  }
}

/**
 * Clean up old entries periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key)
    }
  }
}, 60000) // Cleanup every minute
