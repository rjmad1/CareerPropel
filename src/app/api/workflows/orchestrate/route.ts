import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { getCandidate } from '@/lib/route-helpers/candidate';
import { IngestionEngine } from '@/lib/orchestration/ingestion';
import { Arbitrator } from '@/lib/orchestration/arbitrator';

export const dynamic = 'force-dynamic';

export const POST = withAuth(
  async (req: NextRequest, auth) => {
    try {
      const { userEmail } = auth;
      const candidate = await getCandidate(userEmail);

      const body = await req.json();
      const { title, jobId, customContext } = body;

      if (!title || typeof title !== 'string') {
        return NextResponse.json({ error: { message: 'title is required' } }, { status: 400 });
      }

      if (jobId != null && typeof jobId !== 'string') {
        return NextResponse.json({ error: { message: 'jobId must be a string' } }, { status: 400 });
      }

      // 1. Expand the vague user prompt into a structured Dynamic DAG
      const ingestionResult = await IngestionEngine.expandIntent(
        title,
        userEmail,
        customContext
      );

      // 2. Initialize and queue the execution in the background
      const workflowId = await Arbitrator.initializeWorkflow(
        ingestionResult,
        candidate.id,
        userEmail,
        jobId ?? undefined
      );

      return NextResponse.json({
        data: {
          workflowId,
          expandedContext: ingestionResult.expandedContext,
          domain: ingestionResult.domain,
          predictedComplexity: ingestionResult.predictedComplexity,
          initialPriorityScore: ingestionResult.initialPriorityScore,
          dag: ingestionResult.dag,
        }
      }, { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Orchestration pipeline execution failed';
      const status = (err as { status?: number }).status ?? 500;
      return NextResponse.json({ error: { message } }, { status });
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'medium',
  }
);
