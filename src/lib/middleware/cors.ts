import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
].filter(Boolean)

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
  'Access-Control-Max-Age': '86400', // 24 hours
}

export function applyCorsHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get('origin') || ''

  const isAllowed = ALLOWED_ORIGINS.some(allowedOrigin => {
    if (allowedOrigin === '*') return true
    return origin === allowedOrigin || 
           origin.startsWith(allowedOrigin.replace('http://', '').replace('https://', ''))
  })

  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
  }

  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export function handleCorsPreFlight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin') || ''

    const isAllowed = ALLOWED_ORIGINS.some(allowedOrigin => {
      if (allowedOrigin === '*') return true
      return origin === allowedOrigin
    })

    const response = new NextResponse(null, { status: 204 })

    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }

    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  return null
}

export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const preFlightResponse = handleCorsPreFlight(request)
    if (preFlightResponse) return preFlightResponse

    const response = await handler(request)
    return applyCorsHeaders(request, response)
  }
}
