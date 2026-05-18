import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis/redisClient'

const RATE_LIMIT_WINDOW = 60
const RATE_LIMIT_MAX_REQUESTS = 100

// Atomically increments counter; sets TTL only on first increment to avoid a
// race where INCR succeeds but EXPIRE never runs (e.g. process crash between calls).
const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local window = tonumber(ARGV[1])
local current = redis.call('INCR', key)
if current == 1 then
  redis.call('EXPIRE', key, window)
end
local ttl = redis.call('TTL', key)
return {current, ttl}
`

async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSecs: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  const result = await redis.eval(RATE_LIMIT_SCRIPT, 1, key, String(windowSecs)) as [number, number]
  const [count, ttl] = result
  return { allowed: count <= maxRequests, retryAfter: Math.max(ttl, 1) }
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function rateLimitResponse(maxRequests: number, windowSecs: number, retryAfter: number): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSecs} seconds allowed.`,
        retryAfter,
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  )
}

export async function rateLimitMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const ip = clientIp(request)
  const { allowed, retryAfter } = await checkRateLimit(
    `rl:global:${ip}`,
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW
  )
  if (!allowed) {
    return rateLimitResponse(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW, retryAfter)
  }
  return null
}

export function createRateLimiter(maxRequests: number = 10, windowSecs: number = 60) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = clientIp(request)
    const { allowed, retryAfter } = await checkRateLimit(
      `rl:custom:${maxRequests}:${windowSecs}:${ip}`,
      maxRequests,
      windowSecs
    )
    if (!allowed) {
      return rateLimitResponse(maxRequests, windowSecs, retryAfter)
    }
    return null
  }
}
