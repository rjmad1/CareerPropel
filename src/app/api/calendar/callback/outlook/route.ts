import { NextRequest, NextResponse } from 'next/server';
import { exchangeOutlookCode, saveOutlookTokens, syncOutlookEvents } from '@/lib/calendar/outlookCalendar';
import { verifyOAuthState } from '@/lib/calendar/oauthState';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/calendar/callback/outlook — Microsoft redirects here after consent. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${base}/calendar?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${base}/calendar?error=missing_params`);
  }

  const userEmail = verifyOAuthState(state);
  if (!userEmail) {
    return NextResponse.redirect(`${base}/calendar?error=invalid_state`);
  }

  try {
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail }, select: { id: true } });
    if (!candidate) return NextResponse.redirect(`${base}/calendar?error=user_not_found`);

    const tokens = await exchangeOutlookCode(code);
    await saveOutlookTokens(candidate.id, tokens);
    await syncOutlookEvents(candidate.id);

    return NextResponse.redirect(`${base}/calendar?connected=outlook`);
  } catch (err: unknown) {
    console.error('[Outlook callback]', err);
    return NextResponse.redirect(`${base}/calendar?error=callback_failed`);
  }
}
