/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server'
import { applyCorsHeaders, handleCorsPreFlight, withCors } from '@/lib/middleware/cors'

function makeRequest(method: string, origin: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/test', {
    method,
    headers: { origin },
  })
}

function makeResponse(): NextResponse {
  return NextResponse.json({ ok: true })
}

describe('applyCorsHeaders', () => {
  it('adds CORS method header to response', () => {
    const req = makeRequest('GET', 'http://localhost:3000')
    const res = makeResponse()
    const result = applyCorsHeaders(req, res)
    expect(result.headers.get('Access-Control-Allow-Methods')).toBeTruthy()
  })

  it('adds Access-Control-Allow-Credentials header', () => {
    const req = makeRequest('GET', 'http://localhost:3000')
    const res = makeResponse()
    const result = applyCorsHeaders(req, res)
    expect(result.headers.get('Access-Control-Allow-Credentials')).toBe('true')
  })

  it('sets Access-Control-Allow-Origin for allowed origin', () => {
    const req = makeRequest('GET', 'http://localhost:3000')
    const res = makeResponse()
    const result = applyCorsHeaders(req, res)
    const origin = result.headers.get('Access-Control-Allow-Origin')
    expect(origin).toBeTruthy()
  })

  it('returns the response object', () => {
    const req = makeRequest('GET', 'http://localhost:3000')
    const res = makeResponse()
    const result = applyCorsHeaders(req, res)
    expect(result).toBeInstanceOf(NextResponse)
  })

  it('adds Access-Control-Allow-Headers', () => {
    const req = makeRequest('GET', 'http://localhost:3000')
    const res = makeResponse()
    const result = applyCorsHeaders(req, res)
    expect(result.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type')
  })
})

describe('handleCorsPreFlight', () => {
  it('returns null for non-OPTIONS request', () => {
    const req = makeRequest('GET', 'http://localhost:3000')
    expect(handleCorsPreFlight(req)).toBeNull()
  })

  it('returns null for POST request', () => {
    const req = makeRequest('POST', 'http://localhost:3000')
    expect(handleCorsPreFlight(req)).toBeNull()
  })

  it('returns 204 NextResponse for OPTIONS request', () => {
    const req = makeRequest('OPTIONS', 'http://localhost:3000')
    const result = handleCorsPreFlight(req)
    expect(result).not.toBeNull()
    expect(result?.status).toBe(204)
  })

  it('includes CORS headers in OPTIONS response', () => {
    const req = makeRequest('OPTIONS', 'http://localhost:3000')
    const result = handleCorsPreFlight(req)!
    expect(result.headers.get('Access-Control-Allow-Methods')).toBeTruthy()
  })

  it('sets Access-Control-Allow-Origin for allowed origin in OPTIONS', () => {
    const req = makeRequest('OPTIONS', 'http://localhost:3000')
    const result = handleCorsPreFlight(req)!
    const allowOrigin = result.headers.get('Access-Control-Allow-Origin')
    expect(allowOrigin).toBeTruthy()
  })

  it('does not set Access-Control-Allow-Origin for disallowed origin', () => {
    const req = makeRequest('OPTIONS', 'https://evil.example.com')
    const result = handleCorsPreFlight(req)!
    const allowOrigin = result.headers.get('Access-Control-Allow-Origin')
    // Should not echo back the evil origin
    expect(allowOrigin).not.toBe('https://evil.example.com')
  })

  it('sets Access-Control-Max-Age header', () => {
    const req = makeRequest('OPTIONS', 'http://localhost:3000')
    const result = handleCorsPreFlight(req)!
    expect(result.headers.get('Access-Control-Max-Age')).toBe('86400')
  })
})

describe('withCors', () => {
  it('calls handler and applies CORS headers for non-OPTIONS', async () => {
    const handler = jest.fn().mockResolvedValue(NextResponse.json({ ok: true }))
    const wrapped = withCors(handler)
    const req = makeRequest('GET', 'http://localhost:3000')
    const res = await wrapped(req)
    expect(handler).toHaveBeenCalledWith(req)
    expect(res.headers.get('Access-Control-Allow-Methods')).toBeTruthy()
  })

  it('handles OPTIONS preflight without calling handler', async () => {
    const handler = jest.fn()
    const wrapped = withCors(handler)
    const req = makeRequest('OPTIONS', 'http://localhost:3000')
    const res = await wrapped(req)
    expect(handler).not.toHaveBeenCalled()
    expect(res.status).toBe(204)
  })
})
