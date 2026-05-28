# Runtime Topology

This document maps the process boundaries and active runtimes of the CareerPropel application.

```mermaid
graph TD
    User([User Browser]) -->|HTTPS / SSE| Web[Web Runtime: Next.js Server]
    Web -->|Enqueue Jobs| Queue[(BullMQ Redis)]
    Worker[Worker Runtime: Background Consumer] -->|Process Jobs| Queue
    Worker -->|Execute AI| LLM[LLM Providers: Anthropic / NVIDIA NIM]
    Scheduler[Scheduler Runtime: Daemon] -->|Monitor & State Loop| Queue
```

---

## Process Boundaries

| Runtime | Entrypoint | Process Type | Primary Duty | Concurrency / Scaling |
|---|---|---|---|---|
| **Web** | `src/bin/web.ts` | Next.js Server | Serve pages, REST APIs, and multiplex SSE | Horizontally scale behind load balancer |
| **Worker** | `src/bin/worker.ts` | Node.js Worker | Execute BullMQ processors, call LLMs, run domain tasks | Scale based on queue backlogs |
| **Scheduler** | `src/bin/scheduler.ts` | Node.js Daemon | Transition delayed/stalled jobs in BullMQ | Single active replica (active-passive) |
