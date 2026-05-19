import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, saveTokens, syncCalendarEvents } from '@/lib/calendar/googleCalendar';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/calendar/callback?code=...&state=...
 * Google redirects here after the user grants consent.
 * Exchanges the code for tokens, persists them, then kicks off an initial sync.
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

  try {
    const userEmail = Buffer.from(state, 'base64').toString('utf-8');

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
  } catch (err: any) {
    console.error('[Calendar callback]', err);
    return NextResponse.redirect(
      `${baseUrl}/calendar?error=${encodeURIComponent(err?.message ?? 'unknown')}`
    );
  }
}
