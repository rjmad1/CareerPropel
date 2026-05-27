# Operations

## Health Endpoints

- `/live`: process liveness
- `/ready`: Redis and PostgreSQL readiness
- `/health`: readiness plus queue and in-memory metrics snapshot

## Logs

- Logger: Pino
- Correlation fields:
  - `requestId`
  - `correlationId`
  - `executionId`
  - `queueJobId`
  - `agentType`

Secrets and queue payloads are redacted before logging.

## Failure Handling

- Retryable errors: network, timeout, rate limit, temporary provider failures
- Non-retryable errors: explicit permanent execution failures
- Terminal failures go to `agent-execution-dlq`

## Routine Checks

1. Hit `/health` and confirm queue counts are moving.
2. Confirm worker logs show heartbeat and execution pickup.
3. Inspect dead-letter queue depth.
4. Verify SSE clients receive heartbeats and execution transitions.

## Incident Response

- Queue backup:
  - Pause web enqueue traffic if a provider outage causes runaway retries.
- Worker instability:
  - Roll workers; BullMQ will recover uncompleted jobs.
- Redis instability:
  - Check reconnect loops in logs and ready status on `/ready`.
- Database instability:
  - Expect `/ready` to fail and execution state persistence to stop.

## Manual Replay

Replay from the dead-letter queue only after reviewing:

- failure reason
- side-effect safety
- provider health
- duplicate risk
