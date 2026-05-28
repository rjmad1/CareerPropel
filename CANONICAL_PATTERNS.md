# Canonical Patterns Registry

This document serves as the source of truth for standard codebase patterns in CareerPropel. Use these blueprints to implement features.

---

## 1. Queue Enqueue Pattern

To enqueue a background execution task:
```typescript
import { getExecutionQueue } from '@/lib/queue/queues';

const queue = getExecutionQueue();
await queue.add('process-job', {
  executionId,
  payload,
}, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: true,
  removeOnFail: false,
});
```

---

## 2. SSE Subscription Pattern

Establishing a real-time event stream:
```typescript
import { sseManager } from '@/lib/realtime/sse-manager';

export async function GET(req: Request, { params }: { params: { executionId: string } }) {
  const stream = new ReadableStream({
    start(controller) {
      const onEvent = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };
      
      sseManager.subscribe(params.executionId, onEvent);
      
      req.signal.addEventListener('abort', () => {
        sseManager.unsubscribe(params.executionId, onEvent);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## 3. Redis Access Pattern

Always request Redis instances from the client factory:
```typescript
import { redisClient } from '@/lib/redis/redisClient';

// Get active value
const cached = await redisClient.get(`execution:${id}:status`);

// Set with expiration (always use TTL)
await redisClient.set(`execution:${id}:status`, 'running', 'EX', 3600);
```

---

## 4. Logging Pattern

Always write logs with the contextual logger:
```typescript
import { logger } from '@/lib/logging/logger';

const contextLogger = logger.child({ executionId, userId });
contextLogger.info('Starting agent execution process');
contextLogger.error({ err }, 'Failed to fetch job description');
```

---

## 5. Retry Handling Pattern

Handle errors using standard retry limits in workers:
```typescript
import { NonRetryableError } from '@/lib/queue/retry-policy';

try {
  await executeStep();
} catch (error) {
  if (error instanceof InvalidPayloadError) {
    // Immediately fail and move to DLQ without retrying
    throw new NonRetryableError('Payload was invalid');
  }
  throw error; // Let BullMQ perform backoff retry
}
```
