import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { networkingAgent } from '@/domains/networking/agents/networkingAgent';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });
    }

    const body = await req.json();
    const { jobId, company, jobTitle, location, description, maxOutreachDrafts } = body;

    if (!company?.trim() || !jobTitle?.trim()) {
      return NextResponse.json(
        { error: { message: 'company and jobTitle are required' } },
        { status: 400 },
      );
    }

    const result = await networkingAgent.orchestrate({
      candidateId: candidate.id,
      jobId,
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      location,
      description,
      maxOutreachDrafts,
    });

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Orchestration failed' } },
      { status: e.status ?? 500 },
    );
  }
}
