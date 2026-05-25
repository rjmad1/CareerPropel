import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { pauseWorkflow } from '@/lib/workflow/engine';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userEmail } = await getAuthContext();
    const c = await prisma.candidate.findUnique({ where: { email: userEmail }, select: { id: true } });
    if (!c) return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });

    await pauseWorkflow(params.id, c.id);
    return NextResponse.json({ data: { paused: true } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to pause workflow' } },
      { status: err.status ?? 500 },
    );
  }
}
