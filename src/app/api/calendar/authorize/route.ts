import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { buildAuthUrl } from '@/lib/calendar/googleCalendar';
import { errorResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';

/**
 * GET /api/calendar/authorize
 * Redirects the authenticated user to Google's OAuth2 consent screen.
 * The `state` param carries the userEmail so the callback can retrieve it.
 */
export async function GET() {
  try {
    const { userEmail } = await getAuthContext();
    const state = Buffer.from(userEmail).toString('base64');
    const url = buildAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (error) {
    return errorResponse(error);
  }
}
