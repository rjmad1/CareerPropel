import { recordProviderExecution, recordProviderRetry, recordProviderCircuitOpen } from '@/lib/observability/metrics';
import { recordProviderObservation } from '@/lib/observability/provider-health';
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
    recordProviderCircuitOpen(providerId);
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
    const durationMs = Date.now() - startedAt;
    onProviderSuccess(providerId);
    recordProviderExecution(providerId, durationMs, true);
    recordProviderObservation(providerId, durationMs, true);
    return result;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    onProviderFailure(providerId);
    recordProviderExecution(providerId, durationMs, false);
    recordProviderObservation(providerId, durationMs, false, {
      isTimeout: durationMs > 10_000,
    });
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
    const durationMs = Date.now() - startedAt;
    onProviderSuccess(providerId);
    recordProviderExecution(providerId, durationMs, true);
    recordProviderObservation(providerId, durationMs, true);
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    onProviderFailure(providerId);
    recordProviderExecution(providerId, durationMs, false);
    recordProviderObservation(providerId, durationMs, false, {
      isTimeout: durationMs > 10_000,
    });
    throw error;
  }
}
