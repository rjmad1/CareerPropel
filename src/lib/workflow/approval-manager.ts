import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis/redisClient';
import type { ApprovalActionType, ApprovalDecision, ApprovalPayload } from './types';

export interface CreateApprovalParams {
  workflowId: string;
  stepKey: string;
  candidateId: string;
  actionType: ApprovalActionType;
  payload: ApprovalPayload;
  rationale?: string;
  expiresInHours?: number;
}

const APPROVAL_CHANNEL = (candidateId: string) => `workflow:approvals:${candidateId}`;

/**
 * Create a new approval request and notify the user via Redis pub/sub.
 */
export async function createApprovalRequest(
  params: CreateApprovalParams,
): Promise<string> {
  const { workflowId, stepKey, candidateId, actionType, payload, expiresInHours = 72 } = params;
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const approval = await prisma.approvalRequest.create({
    data: {
      workflowId,
      stepKey,
      candidateId,
      actionType,
      payload: payload as unknown as import('@prisma/client').Prisma.InputJsonValue,
      expiresAt,
    },
  });

  // Notify via Redis for real-time UI updates
  try {
    await redis.publish(
      APPROVAL_CHANNEL(candidateId),
      JSON.stringify({
        type: 'approval:created',
        approvalId: approval.id,
        workflowId,
        actionType,
        stepKey,
        timestamp: new Date(),
      }),
    );
  } catch {
    // Non-fatal — approval record was created
  }

  return approval.id;
}

/**
 * Get all pending approvals for a candidate.
 */
export async function getPendingApprovals(candidateId: string) {
  return prisma.approvalRequest.findMany({
    where: {
      candidateId,
      decision: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      workflow: {
        select: {
          id: true,
          status: true,
          definition: { select: { displayName: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Record a decision on an approval request.
 * Returns the updated approval record.
 */
export async function recordApprovalDecision(
  approvalId: string,
  candidateId: string,
  decision: ApprovalDecision,
  note?: string,
  modifiedPayload?: ApprovalPayload,
) {
  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalId },
    select: { id: true, candidateId: true, decision: true, workflowId: true },
  });

  if (!approval) throw Object.assign(new Error('Approval not found'), { status: 404 });
  if (approval.candidateId !== candidateId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  if (approval.decision !== null) throw Object.assign(new Error('Already decided'), { status: 409 });

  const updated = await prisma.approvalRequest.update({
    where: { id: approvalId },
    data: {
      decision,
      decisionNote: note ?? null,
      modifiedPayload: modifiedPayload ? (modifiedPayload as unknown as import('@prisma/client').Prisma.InputJsonValue) : undefined,
      decidedAt: new Date(),
    },
  });

  // Notify workflow to resume
  try {
    await redis.publish(
      APPROVAL_CHANNEL(candidateId),
      JSON.stringify({
        type: 'approval:decided',
        approvalId,
        workflowId: approval.workflowId,
        decision,
        timestamp: new Date(),
      }),
    );
  } catch {
    // Non-fatal
  }

  return updated;
}

/**
 * Expire stale approvals. Call periodically from the scheduler.
 */
export async function expireStaleApprovals(): Promise<number> {
  const result = await prisma.approvalRequest.updateMany({
    where: {
      decision: null,
      expiresAt: { lt: new Date() },
    },
    data: {
      decision: 'rejected',
      decisionNote: 'Auto-expired: no decision within time limit',
      decidedAt: new Date(),
    },
  });
  return result.count;
}
