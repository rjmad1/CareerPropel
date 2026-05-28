# Durable Event Ledger & Replay Architecture

This document describes the append-only event ledger and safety mechanisms governing task replay and recovery in CareerPropel.

## 1. Execution Event Ledger Database Schema

To establish an immutable history of execution lifecycle transitions and prevent state drift, the `ExecutionEventLedger` model has been integrated into the database schema (`prisma/schema.prisma`):

```prisma
model ExecutionEventLedger {
  id             String   @id @default(cuid())
  eventId        String   @unique
  executionId    String
  eventType      String
  payload        Json
  traceId        String?
  spanId         String?
  correlationId  String?
  timestamp      DateTime @default(now())
  replayable     Boolean  @default(true)
  sourceRuntime  String
  
  @@index([executionId])
  @@index([correlationId])
  @@index([timestamp])
}
```

*   **No Foreign Keys**: To avoid blocking operational database tables and ensure high-throughput append performance, the ledger table is created with no foreign key references.
*   **Unique Indexing**: An index on `eventId` enforces absolute single-event entry, rejecting duplicates at the database level.
*   **Search Optimization**: Chronological indexes on `executionId`, `correlationId`, and `timestamp` ensure fast queries during replay safety analysis and audits.

---

## 2. Ledger Event Logger Service

An append-only database writer service is implemented in `src/lib/runtime/ledger.ts`. All worker pickups, queue event broadcasts, and lifecycle transitions log events directly:

```typescript
export async function logEventToLedger(input: LedgerEventInput): Promise<string>;
```

---

## 3. Replay Safety & Gap Verification

Before replaying any failed execution (e.g. via DLQ administration APIs), the system runs an eligibility assessment (`src/lib/observability/replay.ts`) using the event ledger as the primary source of truth:

1.  **State Verification**: Only terminal executions (`failed` or `completed`) can be replayed.
2.  **Sequence Gap Audits**: The ledger event stream is checked for chronological ordering. A warning or lockout is triggered if events are missing or out of sequence order (e.g., terminal events recorded before worker pickup).
3.  **Side-Effect Risks**: Executions referencing external communication integrations (`follow-up`, `networking`, `application`) are marked as high-risk, requiring operator approval.
4.  **Prior Replay Counts**: The replay count is loaded directly from the ledger. Multiple replays trigger a warning.
