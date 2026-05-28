# API Contract Matrix

This document lists all active, production-ready system routes, request payload schemas, response contracts, queue payloads, and SSE updates. All interfaces must adhere strictly to these defined contracts.

---

## 1. Domain API Routes

### A. Execute Agent
- **Endpoint**: `POST /api/agents/execute`
- **Authentication**: JWT Session Cookie (`next-auth.session-token`) or ApiKey (`Authorization: Bearer sk_...`)
- **Request Headers**:
  - `x-request-id` (string, optional)
  - `x-correlation-id` (string, optional)
- **Request Body (Zod validated)**:
  ```json
  {
    "agentType": "resume-tailor | job-match | interview-prep | research | follow-up | networking",
    "context": {
      "resume": "string (optional)",
      "jobDescription": "string (optional)",
      "companyName": "string (optional)"
    },
    "jobId": "string (optional)"
  }
  ```
- **Response Contracts**:
  - `202 Accepted` (Enqueued):
    ```json
    {
      "executionId": "string",
      "queueJobId": "string",
      "status": "queued",
      "message": "string"
    }
    ```
  - `400 Bad Request` (Cost ceiling exceeded or invalid inputs):
    ```json
    { "error": "Projected cost exceeds ceiling" }
    ```
  - `429 Too Many Requests` (Rate limit or concurrency ceiling hit):
    ```json
    { "error": "Rate limit exceeded" }
    ```

### B. Execution Query
- **Endpoint**: `GET /api/agent/execution/[executionId]`
- **Response Contract (`200 OK`)**:
  ```json
  {
    "id": "string",
    "userId": "string",
    "agentType": "string",
    "status": "queued | running | paused | completed | failed | interrupted",
    "progress": 0,
    "output": {},
    "tokenCount": 0,
    "durationMs": 0,
    "errorMessage": "string (null)",
    "createdAt": "ISO-8601",
    "recentLogs": [
      {
        "level": "INFO | WARN | ERROR",
        "message": "string",
        "timestamp": "ISO-8601"
      }
    ]
  }
  ```

---

## 2. Server-Sent Events (SSE) Broadcast Contract

### SSE Stream Endpoint
- **Endpoint**: `GET /api/agent/execution/[executionId]/subscribe`
- **Transport**: HTTP/1.1 `text/event-stream` with Chunked Transfer Encoding
- **Emit Channel Events**:
  1. `retry: 5000\n\n` (Initial stream configuration retry time)
  2. `event: execution:update` (Emitted on state transitions or progress change)
     ```json
     {
       "id": "string",
       "status": "queued | running | paused | completed | failed",
       "progress": 50,
       "currentTask": "Tailoring section 2",
       "errorMessage": null
     }
     ```
  3. `event: log:new` (Emitted whenever a sub-agent posts operational progress)
     ```json
     {
       "level": "INFO | WARN | ERROR",
       "message": "Updating key achievements",
       "timestamp": "ISO-8601"
     }
     ```
  4. `event: heartbeat` (Emitted every 10 seconds to maintain connection)
     ```json
     {
       "executionId": "string",
       "timestamp": "ISO-8601"
     }
     ```

---

## 3. Operator Operations API (Private Gateway)

### A. Dead-Letter Queue (DLQ) Inspector
- **Endpoint**: `GET /api/ops/dlq`
- **Access Gating**: `SUPER_ADMIN` or `SECURITY_ADMIN` roles only
- **Response Contract (`200 OK`)**:
  ```json
  {
    "counts": { "waiting": 0, "active": 0, "failed": 0 },
    "items": [
      {
        "dlqJobId": "string",
        "executionId": "string",
        "queueJobId": "string",
        "agentType": "string",
        "failedAt": "ISO-8601",
        "reason": "string",
        "attemptsMade": 3,
        "replay": {
          "eligibility": "eligible | conditional | ineligible",
          "retryable": true,
          "sideEffectRisk": false,
          "duplicateRisk": false,
          "reasons": []
        }
      }
    ],
    "timestamp": "ISO-8601"
  }
  ```

### B. DLQ Replay Trigger
- **Endpoint**: `POST /api/ops/dlq/replay`
- **Request Body**:
  ```json
  {
    "executionId": "string",
    "force": false
  }
  ```
- **Response Contract (`200 OK` successfully re-enqueued)**:
  ```json
  {
    "replayExecutionId": "string",
    "originalExecutionId": "string",
    "status": "queued",
    "forced": false
  }
  ```
