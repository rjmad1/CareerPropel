import { prisma } from '@/lib/db';

export type FunnelName = 'resume' | 'job' | 'interview' | 'appraisal' | 'networking';
export type FunnelStatus = 'viewed' | 'started' | 'submitted' | 'completed' | 'failed' | 'abandoned';

/**
 * Persists a funnel event tracking user progression in the database.
 * Designed defensively to ensure telemetry failures never block core execution.
 */
export async function trackFunnelEvent(
  email: string,
  funnel: FunnelName,
  step: string,
  status: FunnelStatus,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await prisma.productFunnelMetric.create({
      data: {
        email,
        funnel,
        step,
        status,
        metadata: metadata || undefined,
      },
    });

    console.log(`[FUNNEL] Event logged - Funnel: ${funnel}, Step: ${step}, Status: ${status}, Email: ${email}`);
  } catch (error) {
    // Fail silently: Telemetry failures must never disrupt core request performance or uptime
    console.error('[trackFunnelEvent] Telemetry persistence failed:', error);
  }
}

/**
 * Explicitly records user funnel abandonment.
 */
export async function trackAbandonment(
  email: string,
  funnel: FunnelName,
  step: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackFunnelEvent(email, funnel, step, 'abandoned', metadata);
}
