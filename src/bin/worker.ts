/**
 * Worker service entry point.
 * Run with: npm run worker
 * Or in production: npm run worker:prod
 */

import 'dotenv/config';
import { log } from '@/lib/logging/logger';
import { getDeploymentMetadata } from '@/lib/deployment/metadata';
import { startWorker } from '@/lib/queue/worker';

async function main() {
  const deployment = getDeploymentMetadata();
  log.info({ ...deployment }, 'CareerPropel Worker service starting');

  startWorker();
  log.info('Worker listening for jobs');
}

main().catch((err) => {
  log.error({ err }, 'Worker failed to start');
  process.exit(1);
});
