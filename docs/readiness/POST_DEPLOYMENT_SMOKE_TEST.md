# Post-Deployment Smoke Test Protocol

This document details the step-by-step verification procedures that must be run on the staging or production environment following a deployment.

---

## 1. Resume Upload & Parse Check
Verify that the Layer 1 (deterministic) and Layer 2 (AI enrichment) parsers work under production conditions.

- **Action**: Go to `/profile` or use the API client to upload a standard PDF resume.
- **Expected Results**:
  1. Upload completes with HTTP status `200`.
  2. The parser outputs the parsed text buffer (`[Parser] Parsing uploaded file...`).
  3. LLM semantic enrichment succeeds, yielding structured entities (STAR achievements and technical skills).
  4. If the LLM provider degrades, verify that the system fails-open gracefully to Layer 1 local deterministic extraction.

---

## 2. ATS Match Engine
Verify that the job alignment and matching logic works.

- **Action**: Navigate to a job page `/jobs/[id]` and trigger a Match Scoring.
- **Expected Results**:
  1. System triggers matching against the user's parsed profile.
  2. Match scoring yields detailed percentage score, skill gap breakdown, and tailored application advice.
  3. API response comes back in `< 2.5s` (governed by the API latency budget).

---

## 3. Queue Pipeline & Worker Processing
Confirm that BullMQ is successfully processing tasks across partitions.

- **Action**: Trigger a long-running tailing execution (e.g. tailoring a resume or generating interview preparation guides).
- **Expected Results**:
  1. The task is successfully routed to the appropriate BullMQ partition (`high-priority`, `standard`, `heavy`, `maintenance`).
  2. The Worker process consumes the job from Redis and starts execution.
  3. Worker logs confirm startup, execution, and closure of the job context without memory leaks.
  4. The job completes and moves to the BullMQ `completed` state.

---

## 4. SSE (Server-Sent Events) Status Streams
Verify real-time updates are streamed to the client interface.

- **Action**: Open the Developer Console (`Network` tab) while running an execution.
- **Expected Results**:
  1. The browser opens a persistent SSE connection to `/api/agent/execution/[executionId]/subscribe`.
  2. The server successfully streams state transitions (`queued` -> `running` -> `completed`).
  3. If the connection drops, reconnecting with a `Last-Event-ID` header correctly replays missed events from the Redis buffer.

---

## 5. Event Ledger Writes
Verify transaction security and operational audit trails.

- **Action**: Check the database logs or query the `EventLog` table for the smoke test execution ID.
- **Expected Results**:
  1. Structured logs for the state machine transitions exist in the database.
  2. Metadata containing the old state, new state, actor (`test-runner`), and timestamp are fully populated.
  3. Verify that illegal transitions (e.g. attempting to jump from `completed` directly to `failed`) are blocked at the database level and log transition faults.
