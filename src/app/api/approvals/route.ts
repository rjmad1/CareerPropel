import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { getPendingApprovals } from '@/lib/workflow/approval-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userEmail } = await getAuthContext();
    const c = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!c) return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });

    const approvals = await getPendingApprovals(c.id);
    return NextResponse.json({ data: approvals, total: approvals.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to fetch pending approvals' } },
      { status: err.status ?? 500 },
    );
  }
}
