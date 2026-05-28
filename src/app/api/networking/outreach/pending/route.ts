import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { outreachRepository } from '@/domains/networking/repositories/outreachRepository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });
    }

    const pending = await outreachRepository.findPendingApproval(candidate.id);
    return NextResponse.json({ data: pending, total: pending.length });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: { message: e.message ?? 'Failed to fetch pending outreaches' } },
      { status: e.status ?? 500 },
    );
  }
}
