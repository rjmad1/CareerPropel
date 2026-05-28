import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { contactRepository } from '@/domains/networking/repositories/contactRepository';

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
    const result = await contactRepository.findAll(candidate.id, {
      contactType: searchParams.get('contactType') ?? undefined,
      recruiterType: searchParams.get('recruiterType') ?? undefined,
      minScore: searchParams.get('minScore') ? parseFloat(searchParams.get('minScore')!) : undefined,
      company: searchParams.get('company') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to fetch networking contacts' } },
      { status: e.status ?? 500 },
    );
  }
}
