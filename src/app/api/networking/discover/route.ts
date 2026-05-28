import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { enqueueDiscovery } from '@/domains/networking/workers/discoveryWorker';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });
    }

    const body = await req.json();
    const { jobId, company, jobTitle, location, description } = body;

    if (!company?.trim() || !jobTitle?.trim()) {
      return NextResponse.json(
        { error: { message: 'company and jobTitle are required' } },
        { status: 400 },
      );
    }

    const job = await enqueueDiscovery({
      candidateId: candidate.id,
      userId,
      jobId: jobId ?? '',
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      location: location?.trim(),
      description: description?.trim(),
    });

    return NextResponse.json(
      { data: { queueJobId: job.id, status: 'queued', company, jobTitle } },
      { status: 202 },
    );
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to queue discovery' } },
      { status: e.status ?? 500 },
    );
  }
}
