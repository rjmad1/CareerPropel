import { getProviderHealthReport } from '@/lib/observability/provider-health';
import { recordProviderExecution } from '@/lib/observability/metrics';
import { createLogger } from '@/lib/logging/logger';

const probeLogger = createLogger({ component: 'provider-probe' });

export interface ProviderProbeResult {
  status: 'healthy' | 'degraded' | 'critical';
  latencyMs: number;
  providerId: string;
  message?: string;
}

/**
 * Validates downstream LLM provider auth and connection integrity.
 */
export async function runProviderProbe(providerId = 'anthropic'): Promise<ProviderProbeResult> {
  const t0 = performance.now();
  
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key || key.trim() === '') {
      throw new Error('API key is empty or missing');
    }

    const health = getProviderHealthReport(providerId);
    const latencyMs = Math.round(performance.now() - t0);

    // Record probe duration in metrics store
    recordProviderExecution(providerId, latencyMs, true);

    if (health.status === 'critical') {
      return {
        status: 'critical',
        latencyMs,
        providerId,
        message: 'Downstream provider health report shows CRITICAL status (outage active)',
      };
    }

    if (health.status === 'warning') {
      return {
        status: 'degraded',
        latencyMs,
        providerId,
        message: 'Downstream provider is DEGRADED (high failure rate or latency warnings)',
      };
    }

    return {
      status: 'healthy',
      latencyMs,
      providerId,
    };
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - t0);
    recordProviderExecution(providerId, latencyMs, false);
    
    probeLogger.error({ err: error, providerId }, 'Provider probe failed');
    return {
      status: 'critical',
      latencyMs,
      providerId,
      message: error.message || 'Provider connectivity failed',
    };
  }
}
