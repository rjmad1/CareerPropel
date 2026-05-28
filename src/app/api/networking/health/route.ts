import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await getAuthContext();

    const [contactCount, campaignCount, outreachCount] = await Promise.all([
      prisma.contact.count(),
      prisma.outreachCampaign.count(),
      prisma.outreach.count(),
    ]);

    return NextResponse.json({
      status: 'ok',
      domain: 'networking',
      counts: { contacts: contactCount, campaigns: campaignCount, outreaches: outreachCount },
      queues: {
        discovery: 'networking-discovery',
        enrichment: 'networking-enrichment',
        outreachGeneration: 'outreach-generation',
        followup: 'followup-orchestration',
        engagement: 'engagement-tracking',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Health check failed' } },
      { status: e.status ?? 500 },
    );
  }
}
