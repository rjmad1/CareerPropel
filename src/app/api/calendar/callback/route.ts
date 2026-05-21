import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, saveTokens, syncCalendarEvents } from '@/lib/calendar/googleCalendar';
import { verifyOAuthState } from '@/lib/calendar/oauthState';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/calendar/callback?code=...&state=...
 * Google redirects here after the user grants consent.
 * Verifies the HMAC-signed state before exchanging the auth code.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${baseUrl}/calendar?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/calendar?error=missing_params`);
  }

  const userEmail = verifyOAuthState(state);
  if (!userEmail) {
    return NextResponse.redirect(`${baseUrl}/calendar?error=invalid_state`);
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.redirect(`${baseUrl}/calendar?error=user_not_found`);
    }

    const tokens = await exchangeCode(code);
    await saveTokens(candidate.id, tokens);
    await syncCalendarEvents(candidate.id);

    return NextResponse.redirect(`${baseUrl}/calendar?connected=true`);
  } catch (err: unknown) {
    console.error('[Calendar callback]', err);
    return NextResponse.redirect(`${baseUrl}/calendar?error=callback_failed`);
  }
}
