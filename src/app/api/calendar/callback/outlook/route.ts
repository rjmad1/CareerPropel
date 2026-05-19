import { NextRequest, NextResponse } from 'next/server';
import { exchangeOutlookCode, saveOutlookTokens, syncOutlookEvents } from '@/lib/calendar/outlookCalendar';
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

  try {
    const userEmail = Buffer.from(state, 'base64').toString('utf-8');
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail }, select: { id: true } });
    if (!candidate) return NextResponse.redirect(`${base}/calendar?error=user_not_found`);

    const tokens = await exchangeOutlookCode(code);
    await saveOutlookTokens(candidate.id, tokens);
    await syncOutlookEvents(candidate.id);

    return NextResponse.redirect(`${base}/calendar?connected=outlook`);
  } catch (err: any) {
    return NextResponse.redirect(`${base}/calendar?error=${encodeURIComponent(err?.message ?? 'unknown')}`);
  }
}
