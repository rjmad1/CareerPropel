import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { requirePermission } from '@/lib/security/authorization/middleware';
import { getProviderHealthReport } from '@/lib/observability/provider-health';
import { enqueueExecution } from '@/lib/queue/queues';
import { transitionExecutionState } from '@/lib/runtime/execution-state-machine';
import { logAuditEvent, AuditAction } from '@/lib/logging/auditLog';
import { startTraceSpan } from '@/lib/observability/tracing';

export const dynamic = 'force-dynamic';

const replayRequestSchema = z.object({
  executionId: z.string().min(1, 'executionId is required'),
  dryRun: z.boolean().optional().default(false),
  justification: z.string().optional().default('Operator manual replay'),
});

type FailureClass =
  | 'TRANSIENT'
  | 'PROVIDER_FAILURE'
  | 'VALIDATION_FAILURE'
  | 'TIMEOUT'
  | 'SCHEMA_DRIFT'
  | 'RATE_LIMIT'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN';

export async function POST(request: NextRequest) {
  const trace = startTraceSpan('dlq.replay-operation');
  
  try {
    const { userEmail, userId } = await getAuthContext();
    await requirePermission(userEmail, 'queue.replay', { actorId: userId });

    const body = await request.json();
    const parsed = replayRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { executionId, dryRun, justification } = parsed.data;
    trace.addEvent('validated_input', { executionId, dryRun });

    // 1. Fetch execution details
    const execution = await prisma.agentExecution.findUnique({
      where: { id: executionId },
      include: { eventLogs: { orderBy: { timestamp: 'desc' }, take: 1 } },
    });

    if (!execution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    // 2. Classify Failure taxonomy
    let classification: FailureClass = 'UNKNOWN';
    const errMessage = execution.errorMessage || '';
    
    if (errMessage.includes('timeout') || errMessage.includes('timed out')) {
      classification = 'TIMEOUT';
    } else if (errMessage.includes('rate limit') || errMessage.includes('429')) {
      classification = 'RATE_LIMIT';
    } else if (errMessage.includes('circuit') || errMessage.includes('provider degraded')) {
      classification = 'PROVIDER_FAILURE';
    } else if (errMessage.includes('validation') || errMessage.includes('passed: false')) {
      classification = 'VALIDATION_FAILURE';
    } else if (errMessage.includes('prisma') || errMessage.includes('database') || errMessage.includes('redis')) {
      classification = 'TRANSIENT';
    } else if (errMessage.includes('parse') || errMessage.includes('malformed') || errMessage.includes('schema')) {
      classification = 'SCHEMA_DRIFT';
    } else if (errMessage.includes('bug') || errMessage.includes('null pointer') || errMessage.includes('undefined')) {
      classification = 'INTERNAL_ERROR';
    }

    trace.addEvent('classified_failure', { classification, errorMessage: errMessage });

    // 3. Replay Governance Checks
    const governance = {
      isReplayable: true,
      checks: {
        providerHealthy: true,
        recencyGatePassed: true,
        idempotencyVerified: true,
        userQuotaPassed: true,
      },
      providerReport: null as any,
      reason: [] as string[],
    };

    // Check A: Provider Health
    const providerId = execution.providerId || 'anthropic';
    const healthReport = getProviderHealthReport(providerId);
    governance.providerReport = healthReport;
    if (healthReport.status === 'critical' || healthReport.degradationScore >= 80) {
      governance.checks.providerHealthy = false;
      governance.isReplayable = false;
      governance.reason.push(`LLM Provider '${providerId}' is degraded (${healthReport.status}, score: ${healthReport.degradationScore})`);
    }

    // Check B: Recency Gate (prevent replaying runs older than 24 hours to avoid stale actions)
    const runAgeMs = Date.now() - execution.createdAt.getTime();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    if (runAgeMs > twentyFourHoursMs) {
      governance.checks.recencyGatePassed = false;
      governance.isReplayable = false;
      governance.reason.push(`Execution age (${Math.round(runAgeMs / 3600000)}h) exceeds the 24-hour relevance gate`);
    }

    // Check C: Idempotency & Concurrency Duplicate prevention
    if (execution.status === 'running' || execution.status === 'queued') {
      governance.checks.idempotencyVerified = false;
      governance.isReplayable = false;
      governance.reason.push(`Execution is already in progress (current status: ${execution.status})`);
    }

    // Check D: User execution daily budget limit (cap at 100 per day)
    const userEmailKey = execution.userId;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const dailyRuns = await prisma.agentExecution.count({
      where: {
        userId: userEmailKey,
        createdAt: { gte: startOfToday },
        status: { in: ['completed', 'running', 'queued'] },
      },
    });

    if (dailyRuns >= 100) {
      governance.checks.userQuotaPassed = false;
      governance.isReplayable = false;
      governance.reason.push(`User daily execution quota exceeded (${dailyRuns}/100)`);
    }

    trace.addEvent('governance_check_complete', { isReplayable: governance.isReplayable, reasons: governance.reason });

    // If dry run, respond with checks and classification immediately
    if (dryRun) {
      await logAuditEvent({
        email: userEmail,
        action: AuditAction.SETTINGS_UPDATED,
        resourceType: 'agent_execution',
        resourceId: executionId,
        changes: { op: 'replay_dry_run', classification, governance },
        status: 'SUCCESS',
      });
      trace.end({ dryRun: true, isReplayable: governance.isReplayable });
      return NextResponse.json({
        dryRun: true,
        isReplayable: governance.isReplayable && governance.reason.length === 0,
        classification,
        governance,
      });
    }

    // Reject replay if governance fails
    if (!governance.isReplayable) {
      trace.end({ isReplayable: false, reasons: governance.reason });
      return NextResponse.json({
        isReplayable: false,
        error: `DLQ replay rejected: ${governance.reason.join('; ')}`,
        classification,
        governance,
      }, { status: 422 });
    }

    // 4. Atomic Transition to Queued
    await transitionExecutionState(executionId, 'queued', {
      actor: userEmail,
      justification,
      correlationId: execution.correlationId || undefined,
      requestId: execution.requestId || undefined,
      userId: execution.userId,
    });

    // 5. Enqueue back to BullMQ
    const promptContext: Record<string, string | undefined> = {};
    if (execution.input) {
      try {
        const rawInput = JSON.parse(execution.input);
        for (const [k, v] of Object.entries(rawInput)) {
          promptContext[k] = v !== null && v !== undefined ? String(v) : undefined;
        }
      } catch {
        // Fallback context parsing
      }
    }

    await enqueueExecution({
      executionId: execution.id,
      userId: execution.userId,
      agentType: execution.agentType,
      promptContext,
      requestId: execution.requestId || crypto.randomUUID(),
      correlationId: execution.correlationId || crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      jobId: execution.jobId || undefined,
    });

    // Update metadata on execution record
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        errorMessage: null,
        retryCount: { increment: 1 },
        queuedAt: new Date(),
        executionSource: 'retry',
      },
    });

    await logAuditEvent({
      email: userEmail,
      action: AuditAction.SETTINGS_UPDATED,
      resourceType: 'agent_execution',
      resourceId: executionId,
      changes: { op: 'replay_execution', previousStatus: execution.status, justification },
      status: 'SUCCESS',
    });

    trace.end({ success: true });
    return NextResponse.json({
      success: true,
      message: 'Execution successfully validated and enqueued for replay',
      executionId,
      classification,
      governance,
    });

  } catch (err: any) {
    trace.end({ error: err.message });
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Internal server error',
    }, { status: 500 });
  }
}
