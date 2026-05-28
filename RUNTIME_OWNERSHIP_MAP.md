# Runtime Ownership Map

This document establishes definitive runtime boundaries and file ownership for the CareerPropel architecture.

---

## Web Runtime

The Web Runtime is responsible for serving the user interface, handling client API requests, and managing real-time Server-Sent Events (SSE) connections.

### Allowed
- **API Routes**: `src/app/api/**/*`
- **Authentication**: `src/lib/auth/*`
- **Realtime (SSE) Handler**: `src/lib/realtime/*`
- **UI Components**: `src/components/**/*`
- **Frontend State / Hooks**: `src/hooks/**/*`

### Forbidden
- **Long-Running AI Execution**: AI execution must be delegated to workers.
- **Queue Workers**: Direct BullMQ processor execution is prohibited.
- **Direct BullMQ Consumers**: Next.js api routes must not process queue jobs directly.

---

## Worker Runtime

The Worker Runtime processes background tasks, manages heavy AI generation/orchestration, and handles automated workflow retries.

### Allowed
- **Queue Consumers / Workers**: `src/lib/queue/workers.ts` and domain workers.
- **AI/LLM Execution**: Heavy orchestration, provider calls, prompt compilation.
- **Retries & DLQ**: Handling failed executions and routing to Dead Letter Queues.
- **Job Orchestration**: Coordinating job steps across workers.

### Forbidden
- **UI Imports**: Worker code must not import components or client-only modules.
- **App Router Imports**: Worker code must not import Next.js App Router context.
