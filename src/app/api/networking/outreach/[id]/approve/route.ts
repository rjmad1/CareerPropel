import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { outreachRepository } from '@/domains/networking/repositories/outreachRepository';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userEmail } = await getAuthContext();
    const { id } = await params;

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });
    }

    // Verify ownership
    const outreach = await prisma.outreach.findUnique({
      where: { id },
      include: { campaign: { select: { candidateId: true } } },
    });
    if (!outreach || outreach.campaign.candidateId !== candidate.id) {
      return NextResponse.json({ error: { message: 'Outreach not found' } }, { status: 404 });
    }
    if (outreach.status !== 'DRAFT') {
      return NextResponse.json(
        { error: { message: `Cannot approve outreach with status ${outreach.status}` } },
        { status: 400 },
      );
    }

    const approved = await outreachRepository.approve(id, userEmail);
    return NextResponse.json({ data: approved });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to approve outreach' } },
      { status: e.status ?? 500 },
    );
  }
}
