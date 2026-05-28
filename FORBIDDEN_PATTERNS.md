# Forbidden Patterns Registry

This document lists design patterns and API calls that are strictly prohibited in the CareerPropel repository to maintain architectural determinism and prevent resource leaks.

---

## Prohibited Patterns

### 1. Direct Redis Instantiation
- **Forbidden**: `new Redis(...)` outside of `src/lib/redis/redisClient.ts` or `src/infrastructure/redis/factory.ts`.
- **Reason**: Creates untracked Redis connections, causing connection starvation in serverless environments.
- **Alternative**: Import and use the shared `redisClient` or `getRedisConnection()`.

### 2. Inline AI Execution in Web Runtime
- **Forbidden**: Running `streamLLM(...)` or `executeAgent(...)` inside Next.js API handlers or frontend hooks.
- **Reason**: Blocks HTTP request threads, risks timeout limits, and bypasses concurrency rate limiting.
- **Alternative**: Enqueue the execution via the BullMQ `executionQueue` and process inside the Worker runtime.

### 3. Per-Client Redis Subscriptions
- **Forbidden**: Direct Redis subscription clients (`redis.subscribe(...)`) instantiated per HTTP client.
- **Reason**: Creates a new connection per browser tab, leading to rapid Redis connection exhaustion.
- **Alternative**: Use the shared subscriber (`src/lib/realtime/sharedSubscriber.ts`) which multiplexes a single Redis channel to multiple SSE client connections.

### 4. Socket.IO Architecture
- **Forbidden**: Importing `socket.io`, `socket.io-client`, or using `useSocket` hooks.
- **Reason**: WebSocket infrastructure has been deprecated in favor of lighter and serverless-friendly Server-Sent Events (SSE).
- **Alternative**: Use SSE (`EventSource`) for real-time updates.

### 5. Legacy Workflow Runtime Resurrection
- **Forbidden**: Referencing or importing from `src/lib/workflow/worker.ts` or `src/lib/workflow/scheduler.ts` (which are deleted).
- **Reason**: Workflows have been fully migrated to BullMQ execution workers.
- **Alternative**: Use BullMQ queues for all execution pipelines.

### 6. Direct LLM Provider Access Outside Orchestrator
- **Forbidden**: Importing Nvidia NIM or Anthropic API client wrappers directly inside components.
- **Reason**: Bypasses input safety, rate limits, governance filters, and cost tracking.
- **Alternative**: Route queries through `src/lib/llm/provider.ts` and use the governance engine.
