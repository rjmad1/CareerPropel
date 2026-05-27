/**
 * Tracing Context Provider using AsyncLocalStorage
 * 
 * Implements Phase 5: Structured correlation context propagation across the entire
 * system. Automatically carries correlation IDs across APIs, database transactions,
 * queues, and background workers.
 */

let traceStoreInstance: any;

if (typeof window === 'undefined') {
  try {
    const { AsyncLocalStorage } = require('async_hooks');
    traceStoreInstance = new AsyncLocalStorage();
  } catch (e) {
    // Fallback if async_hooks is unavailable
  }
}

export interface TraceStore {
  correlationId: string;
}

export const traceStore = traceStoreInstance || {
  run<T>(_store: TraceStore, fn: () => T): T {
    return fn();
  },
  getStore() {
    return undefined;
  }
};

/**
 * Runs a function with an active tracing context.
 * Generates a new correlation ID if not provided.
 */
export function runWithTrace<T>(correlationId: string | undefined, fn: () => T): T {
  const cid = correlationId || generateUUID();
  return traceStore.run({ correlationId: cid }, fn);
}

/**
 * Retrieves the current active correlation ID.
 */
export function getCorrelationId(): string | undefined {
  return traceStore.getStore()?.correlationId;
}

/**
 * Safe cross-platform UUID generator.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto is not available
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
