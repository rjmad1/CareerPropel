import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { handleApprovalDecision } from '@/lib/workflow/engine';
import type { ApprovalDecision, ApprovalPayload } from '@/lib/workflow/types';

export const dynamic = 'force-dynamic';

const VALID_DECISIONS: ApprovalDecision[] = ['approved', 'rejected', 'modified'];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userEmail } = await getAuthContext();
    const c = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!c) return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });

    const body = await req.json();
    const { decision, note, modifiedPayload } = body as {
      decision: ApprovalDecision;
      note?: string;
      modifiedPayload?: ApprovalPayload;
    };

    if (!decision || !VALID_DECISIONS.includes(decision)) {
      return NextResponse.json(
        { error: { message: `decision must be one of: ${VALID_DECISIONS.join(', ')}` } },
        { status: 400 },
      );
    }

    await handleApprovalDecision(params.id, c.id, decision, note, modifiedPayload);

    return NextResponse.json({ data: { recorded: true, decision } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to record decision' } },
      { status: err.status ?? 500 },
    );
  }
}
