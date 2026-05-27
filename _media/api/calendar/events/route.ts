import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { isConnected } from '@/lib/calendar/googleCalendar';
import { isOutlookConnected } from '@/lib/calendar/outlookCalendar';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/calendar/events
 * Returns stored CalendarEvent rows for the authenticated user,
 * plus connection status for Google and Outlook.
 */
export async function GET() {
  try {
    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return successResponse({ events: [], googleConnected: false, outlookConnected: false });
    }

    const [googleConnected, outlookConnected, events] = await Promise.all([
      isConnected(candidate.id),
      isOutlookConnected(candidate.id),
      prisma.calendarEvent.findMany({
        where: {
          candidateId: candidate.id,
          startAt: { gte: new Date() },
        },
        orderBy: { startAt: 'asc' },
        take: 100,
      }),
    ]);

    return successResponse({ events, googleConnected, outlookConnected });
  } catch (error) {
    return errorResponse(error);
  }
}
