import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { buildOutlookAuthUrl } from '@/lib/calendar/outlookCalendar';
import { generateOAuthState } from '@/lib/calendar/oauthState';
import { errorResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';

/** GET /api/calendar/authorize/outlook — redirect to Microsoft consent screen. */
export async function GET() {
  try {
    const { userEmail } = await getAuthContext();
    const state = generateOAuthState(userEmail);
    return NextResponse.redirect(buildOutlookAuthUrl(state));
  } catch (error) {
    return errorResponse(error);
  }
}
