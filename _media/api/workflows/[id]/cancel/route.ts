import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { cancelWorkflow } from '@/lib/workflow/engine';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userEmail } = await getAuthContext();
    const c = await prisma.candidate.findUnique({ where: { email: userEmail }, select: { id: true } });
    if (!c) return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    await cancelWorkflow(params.id, c.id, body.reason);
    return NextResponse.json({ data: { cancelled: true } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to cancel workflow' } },
      { status: err.status ?? 500 },
    );
  }
}
