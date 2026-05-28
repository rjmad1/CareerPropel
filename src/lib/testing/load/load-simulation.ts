import { enqueueExecution } from '@/lib/queue/queues';
import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import crypto from 'crypto';

const loadLogger = createLogger({ component: 'scale-simulation-harness' });

async function run10xQueueSpike(totalJobs = 100) {
  loadLogger.info({ totalJobs }, '🚀 Simulating 10x Queue Spike workload...');
  
  const userId = 'soak-user@careerpropel.co';
  const enqueues = [];

  const start = Date.now();

  for (let i = 0; i < totalJobs; i++) {
    const executionId = `exec_spike_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Create DB entry first
    await prisma.agentExecution.create({
      data: {
        id: executionId,
        userId,
        agentType: 'role-intelligence',
        status: 'queued',
        queuedAt: new Date(),
      },
    });

    const promise = enqueueExecution({
      executionId,
      userId,
      agentType: 'role-intelligence',
      promptContext: { jobId: 'test-job-id' },
      requestId: `req_${crypto.randomUUID()}`,
      correlationId: `corr_spike_${Date.now()}`,
      submittedAt: new Date().toISOString(),
    });

    enqueues.push(promise);
  }

  await Promise.all(enqueues);
  const elapsed = Date.now() - start;

  loadLogger.info(
    { elapsedMs: elapsed, avgMs: Number((elapsed / totalJobs).toFixed(2)) },
    '✅ 10x Queue Spike simulation enqueued successfully.'
  );
}

async function runReplayStorm(concurrency = 30) {
  loadLogger.info({ concurrency }, '⚡ Simulating Replay Storm workload...');
  
  const sampleExecutions = await prisma.agentExecution.findMany({
    take: concurrency,
    select: { id: true, userId: true, correlationId: true, agentType: true },
  });

  if (sampleExecutions.length === 0) {
    loadLogger.warn('No executions found in database to replay. Enqueueing first.');
    await run10xQueueSpike(concurrency);
    return;
  }

  const start = Date.now();
  const replays = [];

  for (const ex of sampleExecutions) {
    const executionId = `exec_replay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    await prisma.agentExecution.create({
      data: {
        id: executionId,
        userId: ex.userId,
        agentType: ex.agentType,
        status: 'queued',
        queuedAt: new Date(),
      },
    });

    const p = enqueueExecution({
      executionId,
      userId: ex.userId,
      agentType: ex.agentType,
      promptContext: { jobId: 'test-job-id', originalExecutionId: ex.id },
      requestId: `req_${crypto.randomUUID()}`,
      correlationId: `corr_replay_${Date.now()}`,
      submittedAt: new Date().toISOString(),
    });

    replays.push(p);
  }

  await Promise.all(replays);
  const elapsed = Date.now() - start;

  loadLogger.info(
    { elapsedMs: elapsed, avgMs: Number((elapsed / concurrency).toFixed(2)) },
    '✅ Replay Storm simulation completed successfully.'
  );
}

async function main() {
  const args = process.argv.slice(2);
  const totalJobs = args.includes('--total-jobs') ? parseInt(args[args.indexOf('--total-jobs') + 1], 10) : 50;

  console.log('--- STARTING CONTROLLED SCALE SIMULATION RUN ---');

  if (args.includes('--replay-storm')) {
    await runReplayStorm(totalJobs);
  } else {
    await run10xQueueSpike(totalJobs);
  }

  console.log('\n--- SCALE SIMULATION COMPLETED ---');
  process.exit(0);
}

if (require.main === module) {
  void main().catch((err) => {
    loadLogger.error({ err }, 'Error during load simulation');
    process.exit(1);
  });
}
