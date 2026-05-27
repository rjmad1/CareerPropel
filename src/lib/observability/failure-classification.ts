/**
 * Deterministic failure taxonomy for CareerPropel.
 *
 * Every classified failure emits:
 *  - a FailureType (enum key for filtering/aggregation)
 *  - retryable flag (drives queue retry vs DLQ routing)
 *  - structured FailureMetadata for dashboards and incident diagnostics
 */

export type FailureType =
  | 'provider_timeout'
  | 'provider_rate_limit'
  | 'provider_circuit_open'
  | 'provider_api_error'
  | 'malformed_output'
  | 'validation_failure'
  | 'persistence_failure'
  | 'redis_disconnect'
  | 'auth_failure'
  | 'concurrency_limit'
  | 'execution_timeout'
  | 'execution_bug'
  | 'unknown';

export interface FailureMetadata {
  failureType: FailureType;
  retryable: boolean;
  /** Derived from error.message */
  reason: string;
  /** Original error class name */
  errorClass: string;
  /** ISO timestamp of classification */
  classifiedAt: string;
  /** Additional context from the call site */
  context?: Record<string, unknown>;
}

/** Retryability table — single source of truth */
const RETRYABILITY: Record<FailureType, boolean> = {
  provider_timeout:       true,
  provider_rate_limit:    true,
  provider_circuit_open:  true,
  provider_api_error:     true,
  malformed_output:       false, // conditional — must be overridden by caller when safe
  validation_failure:     false,
  persistence_failure:    true,  // conditional — DB transient errors often retryable
  redis_disconnect:       true,
  auth_failure:           false,
  concurrency_limit:      true,
  execution_timeout:      false, // timed-out executions must not re-run blindly
  execution_bug:          false,
  unknown:                false,
};

export function classifyError(
  error: unknown,
  context?: Record<string, unknown>
): FailureMetadata {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const errorClass = error instanceof Error ? error.constructor.name : 'UnknownError';

  const failureType = detectFailureType(message, errorClass);

  return {
    failureType,
    retryable: RETRYABILITY[failureType],
    reason: error instanceof Error ? error.message : String(error),
    errorClass,
    classifiedAt: new Date().toISOString(),
    context,
  };
}

function detectFailureType(message: string, errorClass: string): FailureType {
  // Named error classes take priority
  if (errorClass === 'ProviderCircuitOpenError') return 'provider_circuit_open';
  if (errorClass === 'ConcurrencyLimitError')    return 'concurrency_limit';
  if (errorClass === 'NonRetryableExecutionError') return 'execution_bug';

  // Message-based heuristics
  if (message.includes('timeout') || message.includes('timed out')) {
    if (message.includes('execution exceeded')) return 'execution_timeout';
    return 'provider_timeout';
  }
  if (message.includes('rate limit') || message.includes('429'))          return 'provider_rate_limit';
  if (message.includes('circuit'))                                          return 'provider_circuit_open';
  if (message.includes('redis') || message.includes('connection refused')) return 'redis_disconnect';
  if (message.includes('unauthorized') || message.includes('forbidden'))   return 'auth_failure';
  if (message.includes('prisma') || message.includes('database'))          return 'persistence_failure';
  if (message.includes('no json') || message.includes('parse'))            return 'malformed_output';
  if (message.includes('streaming failed'))                                 return 'provider_api_error';
  if (message.includes('invalid') || message.includes('validation'))       return 'validation_failure';

  return 'unknown';
}

/** Override retryability for conditional types (malformed_output, persistence_failure) */
export function overrideRetryability(
  metadata: FailureMetadata,
  retryable: boolean
): FailureMetadata {
  return { ...metadata, retryable };
}

export function isClassifiedRetryable(error: unknown): boolean {
  return classifyError(error).retryable;
}
