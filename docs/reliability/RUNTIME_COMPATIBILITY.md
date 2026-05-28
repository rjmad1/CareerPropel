# Distributed Runtime Compatibility & Startup Gates

This document outlines the validation rules, boot gates, and leadership lease patterns implemented in Phase 3 to safeguard CareerPropel deployments.

## 1. Startup Compatibility Verifier

To prevent version mismatch, schema drift, or contract corruption across multiple scaling pods/nodes, a runtime compatibility checker gate executes at early-boot (`src/lib/runtime/compatibility/index.ts`):

*   **Database Schema Alignment Check**: Attempts a query against `ExecutionEventLedger` to ensure table migration and Prisma clients are fully generated and aligned.
*   **Node.js Version Requirement Check**: Asserts the process environment is running Node.js `>= v18.0.0` for ESM modules, async local storage context, and thread safety.
*   **Queue Payload Contract Check**: Evaluates a mock payload structure against the Zod schema (`executionJobDataSchema` in `src/contracts/queue/jobs.ts`) to verify JSON serialization contract backward compatibility.

If any of these check boundaries fail, the verifier registers errors, outputs failure diagnostics, and aborts startup with `process.exit(1)`.

---

## 2. Scheduler Distributed Leadership Election

To prevent duplicate job sweeps, split-brain conflicts, or redundant queue cleanup loops, the scheduler process is protected by a distributed lease manager (`src/lib/queue/scheduler.ts`):

*   **Redis-Backed Lease Lock**: A lease key (`career-propel:scheduler-leader`) is claimed using Redis set options `NX` and a TTL of 10 seconds.
*   **Heartbeat Lease Renewal**: The leader instance runs a background lease-extension timer every 3 seconds to update the lock TTL.
*   **Auto-Failover / Demotion**: If the leader node crashes or loses network connectivity to Redis, the lock lease expires. Any hot standby node will automatically attempt to acquire the lock and promote itself to active leader within 10 seconds.
*   **Active Sweep Suspension**: Secondary nodes operate in passive standby mode, automatically suspending database sweeps and worker audits when they are not in the leader state.
