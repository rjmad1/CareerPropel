import { redis } from '@/lib/redis/redisClient';
import { runtimeSettings } from '@/lib/runtime/settings';

const SLOT_TTL_SECONDS = Math.max(
  Math.ceil(runtimeSettings.executionTimeoutMs / 1000) + 60,
  300
);

function getUserSlotKey(userId: string) {
  return `queue:slots:user:${userId}`;
}

function getAgentSlotKey(agentType: string) {
  return `queue:slots:agent:${agentType}`;
}

async function acquireSlot(key: string, value: string, limit: number): Promise<boolean> {
  const multi = redis.multi();
  multi.sadd(key, value);
  multi.scard(key);
  multi.expire(key, SLOT_TTL_SECONDS);
  const results = await multi.exec();
  const count = Number(results?.[1]?.[1] || 0);

  if (count > limit) {
    await redis.srem(key, value);
    return false;
  }

  return true;
}

export async function acquireExecutionSlots(
  userId: string,
  agentType: string,
  executionId: string
) {
  const userAcquired = await acquireSlot(
    getUserSlotKey(userId),
    executionId,
    runtimeSettings.userConcurrencyLimit
  );

  if (!userAcquired) {
    return false;
  }

  const agentAcquired = await acquireSlot(
    getAgentSlotKey(agentType),
    executionId,
    runtimeSettings.agentConcurrencyLimit
  );

  if (!agentAcquired) {
    await redis.srem(getUserSlotKey(userId), executionId);
    return false;
  }

  return true;
}

export async function releaseExecutionSlots(userId: string, agentType: string, executionId: string) {
  await redis
    .multi()
    .srem(getUserSlotKey(userId), executionId)
    .srem(getAgentSlotKey(agentType), executionId)
    .exec();
}
