import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/middleware/withAuth';
import { pauseWorkflow } from '@/lib/workflow/engine';

export const dynamic = 'force-dynamic';

export const POST = withAuth(
  async (_req: NextRequest, auth, params) => {
    try {
      const id = params?.id as string;
      const { userEmail } = auth;
      const c = await prisma.candidate.findUnique({ where: { email: userEmail }, select: { id: true } });
      if (!c) return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });

      await pauseWorkflow(id, c.id);
      return NextResponse.json({ data: { paused: true } });
    } catch (err: any) {
      return NextResponse.json(
        { error: { message: err.message ?? 'Failed to pause workflow' } },
        { status: err.status ?? 500 },
      );
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'medium',
  }
);

