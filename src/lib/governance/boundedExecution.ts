/**
 * Bounded Execution Primitives
 * Execution isolation, context propagation, recursion prevention,
 * TTL enforcement, concurrency governance.
 */

import { createLogger } from '@/lib/logging/logger';

const log = createLogger({ component: 'bounded-execution' });

// ─── Execution Context Propagation ───────────────────────────────────────────

export interface ExecutionBoundary {
  /** Root trace ID for the entire workflow */
  traceId: string;
  /** Current execution depth (0 = top-level) */
  depth: number;
  /** Max allowed depth before recursion is blocked */
  maxDepth: number;
  /** Execution start time (Unix ms) */
  startedAt: number;
  /** TTL in ms from startedAt */
  ttlMs: number;
  /** IDs of ancestor executions (prevents circular invocation) */
  ancestorIds: string[];
  /** User ID owning this trace */
  userId: string;
  /** Budget remaining in tokens */
  tokenBudgetRemaining: number;
  /** Whether this execution is isolated (cannot spawn children) */
  isolated: boolean;
}

export function createExecutionBoundary(opts: {
  traceId: string;
  userId: string;
  ttlMs?: number;
  maxDepth?: number;
  tokenBudget?: number;
}): ExecutionBoundary {
  return {
    traceId: opts.traceId,
    depth: 0,
    maxDepth: opts.maxDepth ?? 3,
    startedAt: Date.now(),
    ttlMs: opts.ttlMs ?? 900_000,
    ancestorIds: [],
    userId: opts.userId,
    tokenBudgetRemaining: opts.tokenBudget ?? 16384,
    isolated: false,
  };
}

export function deriveChildBoundary(
  parent: ExecutionBoundary,
  childExecutionId: string,
): ExecutionBoundary {
  return {
    ...parent,
    depth: parent.depth + 1,
    ancestorIds: [...parent.ancestorIds, childExecutionId],
    tokenBudgetRemaining: parent.tokenBudgetRemaining,
  };
}

// ─── TTL Check ────────────────────────────────────────────────────────────────

export function isBoundaryExpired(boundary: ExecutionBoundary): boolean {
  return Date.now() - boundary.startedAt > boundary.ttlMs;
}

export function getRemainingTtlMs(boundary: ExecutionBoundary): number {
  return Math.max(0, boundary.ttlMs - (Date.now() - boundary.startedAt));
}

// ─── Recursion Prevention ─────────────────────────────────────────────────────

export class RecursionDepthError extends Error {
  constructor(depth: number, maxDepth: number, traceId: string) {
    super(`Execution depth ${depth} exceeds max ${maxDepth} in trace ${traceId}`);
    this.name = 'RecursionDepthError';
  }
}

export class CircularExecutionError extends Error {
  constructor(executionId: string, traceId: string) {
    super(`Circular execution detected: ${executionId} already in ancestor chain for trace ${traceId}`);
    this.name = 'CircularExecutionError';
  }
}

export class TtlExpiredError extends Error {
  constructor(traceId: string, ttlMs: number) {
    super(`Execution TTL of ${ttlMs}ms expired for trace ${traceId}`);
    this.name = 'TtlExpiredError';
  }
}

export class TokenBudgetExhaustedError extends Error {
  constructor(requested: number, remaining: number, traceId: string) {
    super(`Token budget exhausted: requested ${requested}, remaining ${remaining} in trace ${traceId}`);
    this.name = 'TokenBudgetExhaustedError';
  }
}

/** Validates that a child execution is allowed within the given boundary. Throws on violation. */
export function assertBoundaryAllowsChild(
  boundary: ExecutionBoundary,
  childExecutionId: string,
  estimatedTokens?: number,
): void {
  if (isBoundaryExpired(boundary)) {
    throw new TtlExpiredError(boundary.traceId, boundary.ttlMs);
  }

  if (boundary.depth >= boundary.maxDepth) {
    throw new RecursionDepthError(boundary.depth, boundary.maxDepth, boundary.traceId);
  }

  if (boundary.ancestorIds.includes(childExecutionId)) {
    throw new CircularExecutionError(childExecutionId, boundary.traceId);
  }

  if (boundary.isolated) {
    throw new Error(`Isolated execution cannot spawn children (trace: ${boundary.traceId})`);
  }

  if (estimatedTokens !== undefined && estimatedTokens > boundary.tokenBudgetRemaining) {
    throw new TokenBudgetExhaustedError(estimatedTokens, boundary.tokenBudgetRemaining, boundary.traceId);
  }
}

// ─── In-memory concurrency registry ──────────────────────────────────────────
// Simple in-process store for per-user execution counts.
// In production, this should be backed by Redis (see queue/concurrency.ts for BullMQ version).

const userExecutionCounts = new Map<string, number>();

export function incrementUserExecutionCount(userId: string): number {
  const current = userExecutionCounts.get(userId) ?? 0;
  userExecutionCounts.set(userId, current + 1);
  return current + 1;
}

export function decrementUserExecutionCount(userId: string): void {
  const current = userExecutionCounts.get(userId) ?? 0;
  userExecutionCounts.set(userId, Math.max(0, current - 1));
}

export function getUserExecutionCount(userId: string): number {
  return userExecutionCounts.get(userId) ?? 0;
}

// ─── Execution isolation wrapper ──────────────────────────────────────────────

/**
 * Runs fn within a TTL-bounded, depth-checked execution context.
 * Automatically decrements the user concurrency count on exit.
 */
export async function runWithBoundary<T>(
  boundary: ExecutionBoundary,
  fn: (boundary: ExecutionBoundary) => Promise<T>,
): Promise<T> {
  if (isBoundaryExpired(boundary)) {
    throw new TtlExpiredError(boundary.traceId, boundary.ttlMs);
  }

  incrementUserExecutionCount(boundary.userId);
  const timeout = getRemainingTtlMs(boundary);

  let timeoutHandle: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new TtlExpiredError(boundary.traceId, boundary.ttlMs)),
      timeout
    );
  });

  try {
    const result = await Promise.race([fn(boundary), timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutHandle);
    decrementUserExecutionCount(boundary.userId);
    log.debug({ traceId: boundary.traceId, depth: boundary.depth }, 'Execution boundary released');
  }
}
