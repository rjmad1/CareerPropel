import { partitionedQueues } from '@/lib/queue/queues';
import { redis } from '@/lib/redis/redisClient';
import { createLogger } from '@/lib/logging/logger';
import { getDeploymentMetadata } from '@/lib/deployment/metadata';

const deployLogger = createLogger({ component: 'deployment-orchestrator' });

const ACTIVE_VERSION_KEY = 'deployment:active-version';
const DRAIN_MODE_KEY = 'deployment:drain-mode';
const QUEUE_PAUSE_KEY = 'deployment:queue-pause';

export interface DeploymentStatus {
  activeVersion: string;
  drainMode: boolean;
  queuePause: boolean;
  meta: any;
}

export async function getDeploymentStatus(): Promise<DeploymentStatus> {
  const activeVersion = (await redis.get(ACTIVE_VERSION_KEY)) || getDeploymentMetadata().deploymentVersion;
  const drainMode = (await redis.get(DRAIN_MODE_KEY)) === 'true';
  const queuePause = (await redis.get(QUEUE_PAUSE_KEY)) === 'true';
  const meta = getDeploymentMetadata();

  return { activeVersion, drainMode, queuePause, meta };
}

/**
 * Enable/Disable worker drain mode.
 * When enabled, workers will finish their in-flight jobs but will not pick up new jobs.
 */
export async function setDrainMode(enabled: boolean): Promise<void> {
  deployLogger.info({ enabled }, `Setting worker drain mode: ${enabled}`);
  await redis.set(DRAIN_MODE_KEY, String(enabled));
  // Publish event so active workers in other processes can detect drain mode change
  await redis.publish('deployment:events', JSON.stringify({ type: 'drain-mode', enabled }));
}

/**
 * Enable/Disable queue pause mode.
 * When enabled, all partitioned queues are paused globally.
 */
export async function setQueuePauseMode(enabled: boolean): Promise<void> {
  deployLogger.info({ enabled }, `Setting queue pause mode: ${enabled}`);
  await redis.set(QUEUE_PAUSE_KEY, String(enabled));
  
  await Promise.all(
    Object.entries(partitionedQueues).map(async ([name, q]) => {
      if (enabled) {
        deployLogger.info({ queueName: name }, `Pausing queue: ${name}`);
        await q.pause();
      } else {
        deployLogger.info({ queueName: name }, `Resuming queue: ${name}`);
        await q.resume();
      }
    })
  );
  
  await redis.publish('deployment:events', JSON.stringify({ type: 'queue-pause', enabled }));
}

/**
 * Gets the total count of active (inflight) jobs across all partitions.
 */
export async function getInflightExecutionsCount(): Promise<number> {
  let inflightCount = 0;
  for (const [_, q] of Object.entries(partitionedQueues)) {
    const counts = await q.getJobCounts('active');
    inflightCount += counts.active ?? 0;
  }
  return inflightCount;
}

/**
 * Sets the active deployment version globally.
 */
export async function setActiveVersion(version: string): Promise<void> {
  deployLogger.info({ version }, `Updating active deployment version to: ${version}`);
  await redis.set(ACTIVE_VERSION_KEY, version);
  await redis.publish('deployment:events', JSON.stringify({ type: 'version-update', version }));
}

/**
 * Rollback hook: handles rolling back to a previous stable version.
 */
export async function triggerRollback(previousVersion: string): Promise<void> {
  deployLogger.warn({ previousVersion }, `🚨 ROLLBACK TRIGGERED to version: ${previousVersion}`);
  await setActiveVersion(previousVersion);
  await setDrainMode(false);
  await setQueuePauseMode(false);
  await redis.publish('deployment:events', JSON.stringify({ type: 'rollback', previousVersion }));
}
