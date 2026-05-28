import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { campaignRepository } from '@/domains/networking/repositories/campaignRepository';

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
    const campaigns = await campaignRepository.findAll(candidate.id, {
      status: searchParams.get('status') ?? undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0,
    });

    return NextResponse.json({ data: campaigns });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to fetch campaigns' } },
      { status: e.status ?? 500 },
    );
  }
}

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
    const { jobId, company, objective } = body;

    if (!company?.trim() || !objective?.trim()) {
      return NextResponse.json(
        { error: { message: 'company and objective are required' } },
        { status: 400 },
      );
    }

    const campaign = await campaignRepository.create({
      candidateId: candidate.id,
      jobId: jobId || undefined,
      company: company.trim(),
      objective: objective.trim(),
    });

    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to create campaign' } },
      { status: e.status ?? 500 },
    );
  }
}
