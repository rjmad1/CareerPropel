import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { campaignRepository } from '@/domains/networking/repositories/campaignRepository';

export const dynamic = 'force-dynamic';

export async function GET(
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

    const campaign = await campaignRepository.findById(id);
    if (!campaign || campaign.candidateId !== candidate.id) {
      return NextResponse.json({ error: { message: 'Campaign not found' } }, { status: 404 });
    }

    const stats = await campaignRepository.getStats(id);
    return NextResponse.json({ data: { ...campaign, stats } });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to fetch campaign' } },
      { status: e.status ?? 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
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

    const campaign = await campaignRepository.findById(id);
    if (!campaign || campaign.candidateId !== candidate.id) {
      return NextResponse.json({ error: { message: 'Campaign not found' } }, { status: 404 });
    }

    const { status } = await req.json();
    const updated = await campaignRepository.updateStatus(id, status);
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to update campaign' } },
      { status: e.status ?? 500 },
    );
  }
}
