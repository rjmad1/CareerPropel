/**
 * @deprecated RASUI-001 / RASUI-011 — THIS FILE IS DEPRECATED.
 *
 * The QueueWorker / JobQueue system in this file contained only stub
 * implementations returning hardcoded fake data. It was never wired to
 * production startup and operated completely independently of the real
 * agent executor.
 *
 * The single canonical agent execution path is:
 *   src/lib/agents/executor.ts → processPendingExecutions()
 *   ↓ scheduled via
 *   vercel.json cron → GET /api/agents/execute-pending
 *
 * This file is retained temporarily to avoid breaking any compile-time
 * imports. All worker methods now throw immediately to surface any remaining
 * callers that must be migrated. Delete this file after confirming zero callers.
 *
 * Audit finding: RASUI-001 (stub implementations return fake data silently)
 * Root cause eliminated: dual execution path removed; DB executor is canonical
 */

export class QueueWorker {
  async start(): Promise<never> {
    throw new Error(
      '[DEPRECATED] QueueWorker is no longer operational. ' +
      'Use processPendingExecutions() from src/lib/agents/executor.ts instead. ' +
      'See RASUI-001 remediation.'
    );
  }

  stop(): void {
    // no-op — nothing is running
  }
}

export function createQueueWorker(): QueueWorker {
  return new QueueWorker();
}
