import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/middleware/withAuth';
import { getCandidate } from '@/lib/route-helpers/candidate';
import { createWorkflow } from '@/lib/workflow/engine';
import { VALID_WORKFLOW_STATUSES, type WorkflowStatus } from '@/lib/workflow/types';

export const dynamic = 'force-dynamic';

export const GET = withAuth(
  async (req: NextRequest, auth) => {
    try {
      const { userEmail } = auth;
      const candidate = await getCandidate(userEmail);

      const { searchParams } = req.nextUrl;
      const rawStatus = searchParams.get('status') ?? undefined;
      const jobId = searchParams.get('jobId') ?? undefined;
      const limit = Math.min(Number.parseInt(searchParams.get('limit') ?? '20', 10), 100);
      const offset = Number.parseInt(searchParams.get('offset') ?? '0', 10);

      // Validate status against the canonical enum values imported from types
      const status: WorkflowStatus | undefined =
        rawStatus && (VALID_WORKFLOW_STATUSES as readonly string[]).includes(rawStatus)
          ? (rawStatus as WorkflowStatus)
          : undefined;

      if (rawStatus && !status) {
        return NextResponse.json(
          { error: { message: `Invalid status. Must be one of: ${VALID_WORKFLOW_STATUSES.join(', ')}` } },
          { status: 400 },
        );
      }

      const where = {
        candidateId: candidate.id,
        ...(status ? { status } : {}),
        ...(jobId ? { jobId } : {}),
      };

      const [executions, total] = await Promise.all([
        prisma.workflowExecution.findMany({
          where,
          include: {
            definition: { select: { name: true, displayName: true } },
            steps: { select: { stepKey: true, stepIndex: true, status: true, stepType: true, startedAt: true, completedAt: true } },
            _count: { select: { approvals: { where: { decision: null } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.workflowExecution.count({ where }),
      ]);

      return NextResponse.json({ data: executions, total, limit, offset });
    } catch (err: any) {
      return NextResponse.json(
        { error: { message: err.message ?? 'Failed to list workflows' } },
        { status: err.status ?? 500 },
      );
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'low',
  }
);

export const POST = withAuth(
  async (req: NextRequest, auth) => {
    try {
      const { userEmail } = auth;
      const candidate = await getCandidate(userEmail);

      const body = await req.json();
      const { templateId, jobId } = body;

      if (!templateId || typeof templateId !== 'string') {
        return NextResponse.json({ error: { message: 'templateId is required' } }, { status: 400 });
      }

      if (jobId != null && typeof jobId !== 'string') {
        return NextResponse.json({ error: { message: 'jobId must be a string' } }, { status: 400 });
      }

      const workflowId = await createWorkflow({
        templateId,
        candidateId: candidate.id,
        userId: userEmail,
        jobId: jobId ?? undefined,
        triggeredBy: 'user',
      });

      return NextResponse.json({ data: { workflowId } }, { status: 201 });
    } catch (err: any) {
      return NextResponse.json(
        { error: { message: err.message ?? 'Failed to create workflow' } },
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

