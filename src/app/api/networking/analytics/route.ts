import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { engagementTrackingService } from '@/domains/networking/services/engagementTrackingService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });
    }

    const { searchParams } = req.nextUrl;
    const window = (searchParams.get('window') ?? '30d') as '7d' | '30d' | '90d';

    const [stats, replyRate7d, replyRate30d, replyRate90d, templatePerf, conversionRate] =
      await Promise.all([
        engagementTrackingService.getDashboardStats(candidate.id),
        engagementTrackingService.calculateReplyRate(candidate.id, '7d'),
        engagementTrackingService.calculateReplyRate(candidate.id, '30d'),
        engagementTrackingService.calculateReplyRate(candidate.id, '90d'),
        engagementTrackingService.getTemplatePerformance(candidate.id),
        engagementTrackingService.calculateConversionRate(candidate.id),
      ]);

    return NextResponse.json({
      data: {
        stats,
        replyRates: { '7d': replyRate7d, '30d': replyRate30d, '90d': replyRate90d },
        conversionRate,
        templatePerformance: templatePerf,
        window,
      },
    });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to fetch analytics' } },
      { status: e.status ?? 500 },
    );
  }
}
