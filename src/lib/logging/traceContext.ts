/**
 * Tracing Context Provider using AsyncLocalStorage
 * 
 * Implements Phase 5: Structured correlation context propagation across the entire
 * system. Automatically carries correlation IDs across APIs, database transactions,
 * queues, and background workers.
 */

import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

export interface TraceStore {
  correlationId: string;
}

export const traceStore = new AsyncLocalStorage<TraceStore>();

/**
 * Runs a function with an active tracing context.
 * Generates a new correlation ID if not provided.
 */
export function runWithTrace<T>(correlationId: string | undefined, fn: () => T): T {
  const cid = correlationId || uuidv4();
  return traceStore.run({ correlationId: cid }, fn);
}

/**
 * Retrieves the current active correlation ID.
 */
export function getCorrelationId(): string | undefined {
  return traceStore.getStore()?.correlationId;
}
