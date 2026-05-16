import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect all routes except login and auth endpoints
export function middleware(request: NextRequest) {
  // Get the session token from cookies
  const token = request.cookies.get('next-auth.session-token')?.value || 
                request.cookies.get('next-auth.jwt')?.value

  // Allow auth routes and login page
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // Redirect to login if no session token
  if (!token) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${request.nextUrl.pathname}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
