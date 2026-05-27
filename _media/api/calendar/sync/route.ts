import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { syncCalendarEvents, disconnect } from '@/lib/calendar/googleCalendar';
import { syncOutlookEvents, disconnectOutlook } from '@/lib/calendar/outlookCalendar';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/calendar/sync?provider=google|outlook
 * Pull latest events from the requested provider into the DB.
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const provider = new URL(request.url).searchParams.get('provider') ?? 'google';
    const candidate = await prisma.candidate.findUniqueOrThrow({ where: { email: userEmail }, select: { id: true } });

    const count =
      provider === 'outlook'
        ? await syncOutlookEvents(candidate.id)
        : await syncCalendarEvents(candidate.id);

    return successResponse({ synced: count, provider });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/calendar/sync?provider=google|outlook
 * Disconnect the given provider (removes tokens + events).
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const provider = new URL(request.url).searchParams.get('provider') ?? 'google';
    const candidate = await prisma.candidate.findUniqueOrThrow({ where: { email: userEmail }, select: { id: true } });

    if (provider === 'outlook') {
      await disconnectOutlook(candidate.id);
    } else {
      await disconnect(candidate.id);
    }
    return successResponse({ disconnected: true, provider });
  } catch (error) {
    return errorResponse(error);
  }
}
