/**
 * Worker service entry point.
 * Run with: npm run worker
 * Or in production: npm run worker:prod
 */

import 'dotenv/config';
import { log } from '@/lib/logging/logger';
import { getDeploymentMetadata } from '@/lib/deployment/metadata';
import { startWorker, drainAndCloseAgentWorker } from '@/lib/queue/worker';
import { startWorkflowWorker, drainAndCloseWorkflowWorker } from '@/lib/workflow/worker';

async function main() {
  const deployment = getDeploymentMetadata();
  log.info({ ...deployment }, 'CareerPropel Worker service starting');

  const { worker: agentWorker, workerId: agentWorkerId } = startWorker();
  log.info({ agentWorkerId }, 'Agent worker listening for jobs');

  const { worker: workflowWorker, workerId: workflowWorkerId } = startWorkflowWorker();
  log.info({ workflowWorkerId }, 'Workflow worker listening for jobs');

  // Coordinated shutdown: await both workers so neither races to exit first.
  const shutdown = async (signal: string) => {
    log.info({ signal }, 'Shutdown signal received — draining all workers');

    const results = await Promise.allSettled([
      drainAndCloseAgentWorker(agentWorker, agentWorkerId),
      drainAndCloseWorkflowWorker(workflowWorker, workflowWorkerId),
    ]);

    let exitCode = 0;
    for (const result of results) {
      if (result.status === 'rejected') {
        log.error({ err: result.reason }, 'Worker drain error during shutdown');
        exitCode = 1;
      }
    }

    log.info('All workers closed — exiting');
    process.exit(exitCode);
  };

  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT',  () => void shutdown('SIGINT'));
}

main().catch((err) => {
  log.error({ err }, 'Worker failed to start');
  process.exit(1);
});
