import { recordProviderExecution, recordProviderRetry } from '@/lib/observability/metrics';
import { ProviderCircuitOpenError } from '@/lib/queue/retry-policy';
import { runtimeSettings } from '@/lib/runtime/settings';

type ProviderState = {
  consecutiveFailures: number;
  openUntil?: number;
  lastAttemptAt?: number;
};

const providerState = new Map<string, ProviderState>();

function getProviderState(providerId: string): ProviderState {
  const state = providerState.get(providerId) || { consecutiveFailures: 0 };
  providerState.set(providerId, state);
  return state;
}

function enforceCircuit(providerId: string) {
  const state = getProviderState(providerId);
  const now = Date.now();

  if (state.openUntil && state.openUntil > now) {
    throw new ProviderCircuitOpenError(`Provider circuit is open for ${providerId}`);
  }

  if (runtimeSettings.providerMinIntervalMs > 0 && state.lastAttemptAt) {
    const elapsed = now - state.lastAttemptAt;
    if (elapsed < runtimeSettings.providerMinIntervalMs) {
      throw new ProviderCircuitOpenError(`Provider ${providerId} rate limited by runtime guard`);
    }
  }

  state.lastAttemptAt = now;
}

function onProviderFailure(providerId: string) {
  const state = getProviderState(providerId);
  state.consecutiveFailures += 1;
  recordProviderRetry(providerId);

  if (state.consecutiveFailures >= runtimeSettings.providerCircuitBreakerThreshold) {
    state.openUntil = Date.now() + runtimeSettings.providerCircuitBreakerResetMs;
    state.consecutiveFailures = 0;
  }
}

function onProviderSuccess(providerId: string) {
  const state = getProviderState(providerId);
  state.consecutiveFailures = 0;
  state.openUntil = undefined;
}

export async function runWithProviderResilience<T>(
  providerId: string,
  operation: () => Promise<T>
): Promise<T> {
  enforceCircuit(providerId);
  const startedAt = Date.now();

  try {
    const result = await operation();
    onProviderSuccess(providerId);
    recordProviderExecution(providerId, Date.now() - startedAt, true);
    return result;
  } catch (error) {
    onProviderFailure(providerId);
    recordProviderExecution(providerId, Date.now() - startedAt, false);
    throw error;
  }
}

export async function* runStreamWithProviderResilience<T>(
  providerId: string,
  operation: () => AsyncIterable<T>
): AsyncIterable<T> {
  enforceCircuit(providerId);
  const startedAt = Date.now();

  try {
    for await (const chunk of operation()) {
      yield chunk;
    }
    onProviderSuccess(providerId);
    recordProviderExecution(providerId, Date.now() - startedAt, true);
  } catch (error) {
    onProviderFailure(providerId);
    recordProviderExecution(providerId, Date.now() - startedAt, false);
    throw error;
  }
}
