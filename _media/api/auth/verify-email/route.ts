import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
  }

  const candidate = await prisma.candidate.findFirst({
    where: { emailVerificationToken: token },
  })

  if (!candidate) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
  }

  if (candidate.emailVerificationTokenExp && candidate.emailVerificationTokenExp < new Date()) {
    return NextResponse.redirect(new URL('/login?error=token_expired', request.url))
  }

  await prisma.candidate.update({
    where: { id: candidate.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExp: null,
    },
  })

  return NextResponse.redirect(new URL('/login?verified=1', request.url))
}
