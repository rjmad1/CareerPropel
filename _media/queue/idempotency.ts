import { createHash } from 'crypto';
import { redis } from '@/lib/redis/redisClient';
import { log } from '@/lib/logging/logger';

const PAYLOAD_SIZE_LIMIT = 10_000; // 10 KB

// Recursively sort object keys so JSON serialisation is deterministic.
function deepSort(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepSort);
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as object).sort()) {
      sorted[key] = deepSort((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export function generateIdempotencyKey(
  userId: string,
  agentType: string,
  payload: Record<string, unknown>,
): string {
  const serialised = JSON.stringify(deepSort(payload));
  if (serialised.length > PAYLOAD_SIZE_LIMIT) {
    throw new Error(
      `Idempotency payload exceeds ${PAYLOAD_SIZE_LIMIT} byte limit (got ${serialised.length} bytes). Reduce context size.`,
    );
  }
  const input = `${agentType}::${serialised}`;
  const hash = createHash('sha256').update(input).digest('hex');
  return `idempotency:${userId}:${hash}`;
}

export async function checkIdempotency(key: string): Promise<string | null> {
  try {
    const cached = await (redis as any).get(key);
    if (cached) {
      log.info({ key }, 'Idempotency cache hit — returning existing execution');
      return cached as string;
    }
    return null;
  } catch (err) {
    log.error({ err, key }, 'Idempotency cache read failed — proceeding without deduplication');
    return null;
  }
}

export async function storeIdempotency(
  key: string,
  executionId: string,
  ttlSeconds = 86400,
): Promise<void> {
  try {
    await (redis as any).setex(key, ttlSeconds, executionId);
    log.info({ key, executionId, ttlSeconds }, 'Idempotency key stored');
  } catch (err) {
    log.error({ err, key }, 'Failed to store idempotency key');
  }
}

export async function clearIdempotency(key: string): Promise<void> {
  try {
    await (redis as any).del(key);
    log.info({ key }, 'Idempotency key cleared');
  } catch (err) {
    log.error({ err, key }, 'Failed to clear idempotency key');
  }
}
