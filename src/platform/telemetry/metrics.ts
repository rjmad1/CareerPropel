import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('career-propel');

// ── Metrics Definitions ──────────────────────────────────────────────────────

// Latencies (Histograms)
export const queueLatency = meter.createHistogram('career_propel_queue_latency_ms', {
  description: 'Duration of queue jobs from submission to completion',
  unit: 'ms',
});

export const workerLatency = meter.createHistogram('career_propel_worker_latency_ms', {
  description: 'Execution duration of background workers',
  unit: 'ms',
});

export const providerLatency = meter.createHistogram('career_propel_provider_latency_ms', {
  description: 'Execution duration of LLM provider calls',
  unit: 'ms',
});

// Counters & Gauges (UpDown Counters)
export const workerRetries = meter.createCounter('career_propel_worker_retries_total', {
  description: 'Number of times a worker retries a job',
});

export const providerRetries = meter.createCounter('career_propel_provider_retries_total', {
  description: 'Number of times an LLM provider call is retried',
});

export const providerCircuitOpens = meter.createCounter('career_propel_provider_circuit_opens_total', {
  description: 'Number of times an LLM provider circuit breaker opens',
});

export const activeConcurrency = meter.createUpDownCounter('career_propel_active_concurrency', {
  description: 'Active agent execution concurrency',
});

export const sseActiveStreams = meter.createUpDownCounter('career_propel_sse_active_streams', {
  description: 'Active SSE streaming connections',
});

export const sseDisconnects = meter.createCounter('career_propel_sse_disconnects_total', {
  description: 'Total number of SSE stream disconnects',
});

export const sseHeartbeatFailures = meter.createCounter('career_propel_sse_heartbeat_failures_total', {
  description: 'Total number of SSE heartbeat failures',
});

export const dlqDepth = meter.createUpDownCounter('career_propel_dlq_depth', {
  description: 'Number of jobs currently in the Dead Letter Queue',
});

export const onboardingCompletions = meter.createCounter('career_propel_onboarding_completions_total', {
  description: 'Number of user onboarding completions',
});

export const resumeUploads = meter.createCounter('career_propel_resume_uploads_total', {
  description: 'Number of resume uploads',
});

export const aiExtractions = meter.createCounter('career_propel_ai_extractions_total', {
  description: 'Number of AI capabilities extracted',
});
