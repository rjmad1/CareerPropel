import { NextRequest } from 'next/server';
import { getExecutionQueue, getDeadLetterQueue } from '@/lib/queue/queues';
import { getAllProviderHealthReports } from '@/lib/observability/provider-health';
import { getMetricsSnapshot } from '@/lib/observability/metrics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Simple token authorization check (Bearer token from environment if configured)
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.METRICS_SCRAPER_TOKEN;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const lines: string[] = [];

  try {
    const execQueue = getExecutionQueue();
    const dlq = getDeadLetterQueue();

    // 1. Fetch Queue Statuses
    const [execCounts, dlqCounts, waitingJobs] = await Promise.all([
      execQueue.getJobCounts('active', 'waiting', 'delayed', 'failed', 'completed'),
      dlq.getJobCounts('waiting', 'active', 'failed'),
      execQueue.getJobs(['waiting'], 0, 1, false),
    ]);

    const execActive = execCounts.active ?? 0;
    const execWaiting = execCounts.waiting ?? 0;
    const execDelayed = execCounts.delayed ?? 0;
    const execFailed = execCounts.failed ?? 0;
    const execCompleted = execCounts.completed ?? 0;

    const dlqDepth = (dlqCounts.waiting ?? 0) + (dlqCounts.active ?? 0) + (dlqCounts.failed ?? 0);

    const oldestWaitingAgeSeconds =
      waitingJobs.length > 0 && waitingJobs[0].timestamp
        ? (Date.now() - waitingJobs[0].timestamp) / 1000
        : 0;

    // Queue depth metrics
    lines.push('# HELP career_propel_queue_depth Number of jobs currently in the execution queue');
    lines.push('# TYPE career_propel_queue_depth gauge');
    lines.push(`career_propel_queue_depth{status="active"} ${execActive}`);
    lines.push(`career_propel_queue_depth{status="waiting"} ${execWaiting}`);
    lines.push(`career_propel_queue_depth{status="delayed"} ${execDelayed}`);
    lines.push(`career_propel_queue_depth{status="failed"} ${execFailed}`);
    lines.push(`career_propel_queue_depth{status="completed"} ${execCompleted}`);
    lines.push('');

    // DLQ metrics
    lines.push('# HELP career_propel_dlq_depth Number of failed jobs routed to the Dead-Letter Queue');
    lines.push('# TYPE career_propel_dlq_depth gauge');
    lines.push(`career_propel_dlq_depth ${dlqDepth}`);
    lines.push('');

    // Oldest queue job age
    lines.push('# HELP career_propel_queue_oldest_waiting_age_seconds Age of the oldest waiting job in the queue');
    lines.push('# TYPE career_propel_queue_oldest_waiting_age_seconds gauge');
    lines.push(`career_propel_queue_oldest_waiting_age_seconds ${oldestWaitingAgeSeconds.toFixed(3)}`);
    lines.push('');

    // 2. Fetch Provider Metrics
    const providerReports = getAllProviderHealthReports();
    const metricsSnapshot = await getMetricsSnapshot();

    lines.push('# HELP career_propel_provider_degradation_score Degradation score of the LLM provider (0-100)');
    lines.push('# TYPE career_propel_provider_degradation_score gauge');
    providerReports.forEach((r) => {
      lines.push(`career_propel_provider_degradation_score{provider="${r.providerId}"} ${r.degradationScore}`);
    });
    lines.push('');

    lines.push('# HELP career_propel_provider_failure_ratio Ratio of failed requests to the LLM provider');
    lines.push('# TYPE career_propel_provider_failure_ratio gauge');
    providerReports.forEach((r) => {
      lines.push(`career_propel_provider_failure_ratio{provider="${r.providerId}"} ${r.failureRate}`);
    });
    lines.push('');

    lines.push('# HELP career_propel_provider_latency_p95_seconds P95 response latency of the provider in seconds');
    lines.push('# TYPE career_propel_provider_latency_p95_seconds gauge');
    providerReports.forEach((r) => {
      const latencySec = r.p95LatencyMs / 1000;
      lines.push(`career_propel_provider_latency_p95_seconds{provider="${r.providerId}"} ${latencySec.toFixed(3)}`);
    });
    lines.push('');

    lines.push('# HELP career_propel_provider_circuit_breaker_state Circuit breaker state (0=closed, 1=half-open, 2=open)');
    lines.push('# TYPE career_propel_provider_circuit_breaker_state gauge');
    providerReports.forEach((r) => {
      const stateVal = r.status === 'healthy' ? 0 : r.status === 'warning' ? 1 : 2;
      lines.push(`career_propel_provider_circuit_breaker_state{provider="${r.providerId}"} ${stateVal}`);
    });
    lines.push('');

    // 3. Concurrency Saturation metrics
    const totalActiveConcurrency = metricsSnapshot.concurrency.totalActive;
    lines.push('# HELP career_propel_worker_concurrency_saturation Number of concurrent execution slots filled');
    lines.push('# TYPE career_propel_worker_concurrency_saturation gauge');
    lines.push(`career_propel_worker_concurrency_saturation ${totalActiveConcurrency}`);
    lines.push('');

    // 4. Memory usage and runtime stats
    const memory = process.memoryUsage();
    lines.push('# HELP career_propel_process_memory_rss_bytes Resident Set Size (RSS) memory usage');
    lines.push('# TYPE career_propel_process_memory_rss_bytes gauge');
    lines.push(`career_propel_process_memory_rss_bytes ${memory.rss}`);
    lines.push('');

    lines.push('# HELP career_propel_process_memory_heap_total_bytes Total allocated heap memory');
    lines.push('# TYPE career_propel_process_memory_heap_total_bytes gauge');
    lines.push(`career_propel_process_memory_heap_total_bytes ${memory.heapTotal}`);
    lines.push('');

    lines.push('# HELP career_propel_process_memory_heap_used_bytes Used heap memory');
    lines.push('# TYPE career_propel_process_memory_heap_used_bytes gauge');
    lines.push(`career_propel_process_memory_heap_used_bytes ${memory.heapUsed}`);
    lines.push('');

    // Process uptime
    const uptimeSeconds = process.uptime();
    lines.push('# HELP career_propel_worker_uptime_seconds Time since process launch in seconds');
    lines.push('# TYPE career_propel_worker_uptime_seconds counter');
    lines.push(`career_propel_worker_uptime_seconds ${uptimeSeconds.toFixed(1)}`);
    lines.push('');

    // SSE connection count
    const activeStreams = metricsSnapshot.sse.activeStreams;
    lines.push('# HELP career_propel_sse_active_streams Number of active SSE connection streams');
    lines.push('# TYPE career_propel_sse_active_streams gauge');
    lines.push(`career_propel_sse_active_streams ${activeStreams}`);
    lines.push('');

  } catch (err: any) {
    lines.push(`# ERROR: Failed to collect metrics: ${err.message}`);
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
