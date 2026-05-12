# Phase 2: Claude API Integration & Agent Orchestration

## Overview

Phase 2 implements a production-grade agent execution system that:
- Integrates Claude API (Anthropic or Nvidia NIM) with configurable provider switching
- Executes agents asynchronously with background polling
- Streams Claude responses in real-time to the UI
- Publishes execution events via Redis pub/sub
- Maintains comprehensive execution state in Prisma
- Scales to handle concurrent user workloads

## Architecture

### Layers

```
┌─────────────────────────────────────────────────┐
│ UI Components (AgentRail, Interview Prep, etc)  │
├─────────────────────────────────────────────────┤
│ WebSocket Layer (Redis pub/sub integration)     │
├─────────────────────────────────────────────────┤
│ API Routes (/agents/execute, /agents/execute-pending)
├─────────────────────────────────────────────────┤
│ Executor Engine (async execution, streaming)    │
├─────────────────────────────────────────────────┤
│ LLM Provider Abstraction (Anthropic, NIM)       │
├─────────────────────────────────────────────────┤
│ Prisma Database (execution state persistence)   │
└─────────────────────────────────────────────────┘
```

## Key Files

### Core Files Created

1. **`src/lib/llm/provider.ts`** — LLM provider abstraction layer
   - Configurable provider switching (Anthropic / Nvidia NIM)
   - Unified interface: `callLLM()` and `streamLLM()`
   - Environment-driven provider selection

2. **`src/lib/llm/anthropic.ts`** — Anthropic API provider implementation
   - Streaming and non-streaming Claude API calls
   - Token usage tracking
   - Error handling and retry logic

3. **`src/lib/llm/nvidia-nim.ts`** — Nvidia NIM provider (template)
   - Ready for economical/free inference setup
   - OpenAI-compatible API integration
   - Stream parsing for NIM responses

4. **`src/lib/agents/prompts.ts`** — Agent type → prompt mapping
   - Specialized system prompts for 6 agent types
   - Dynamic user prompt building with context injection
   - Agent types: resume-tailor, job-match, interview-prep, research, follow-up, networking

5. **`src/lib/agents/executor.ts`** — Core execution engine
   - Asynchronous agent execution with streaming
   - Database persistence of execution state
   - Error handling and recovery
   - Token counting and duration tracking

6. **`src/lib/agents/redis-integration.ts`** — Phase 2 → Legacy event bridge
   - Maps Phase 2 execution model to existing Redis event system
   - Publishes agent:started, agent:completed, agent:status events
   - Maintains compatibility with existing WebSocket infrastructure

7. **`src/app/api/agents/execute/route.ts`** — Trigger endpoint
   - POST: Create and queue new agent execution
   - GET: Fetch execution status and results

8. **`src/app/api/agents/execute-pending/route.ts`** — Background polling
   - GET: Poll and process queued executions (cron-callable)
   - POST: Synchronous execution for testing

9. **`src/lib/websocket/broadcast.ts`** — In-memory connection manager
   - Register/unregister user WebSocket connections
   - Broadcast events to connected clients
   - Connection health monitoring

## Configuration

### Environment Variables

Copy `.env.phase2.example` to `.env.local` and configure:

```bash
# LLM Provider (default: anthropic)
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Agent Execution
MAX_CONCURRENT_AGENTS_PER_USER=5
AGENT_EXECUTION_TIMEOUT_MS=300000

# Background Polling
EXECUTOR_POLLING_INTERVAL_MS=5000
EXECUTOR_BATCH_SIZE=5

# WebSocket
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

### Switching to Nvidia NIM

When ready to use Nvidia NIM for economical inference:

```bash
LLM_PROVIDER=nvidia-nim
NIM_API_KEY=your-nvidia-api-key
NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NIM_MODEL=meta/llama2-70b-chat
```

No code changes required—provider is swapped via environment variable.

## Usage

### Triggering an Agent Execution

```typescript
// Client-side
const response = await fetch('/api/agents/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentType: 'resume-tailor',
    context: {
      resume: '...',
      jobDescription: '...',
      companyName: 'Acme Corp',
    },
  }),
});

const { executionId } = await response.json();
// Subscribe to real-time updates via WebSocket
```

### Background Polling (Cron)

Configure in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/agents/execute-pending",
      "schedule": "*/5 * * * * *"
    }
  ]
}
```

Or trigger manually for testing:

```bash
curl -X POST "http://localhost:3000/api/agents/execute-pending?immediate=true"
```

### Real-time Status Updates

Events published to Redis channels:

```typescript
// Clients listening to Redis pub/sub
// Will receive:
{
  type: 'agent:started',
  userId: '...',
  agentType: 'resume_tailor', // Legacy type names
  executionId: '...',
}

{
  type: 'agent:completed',
  userId: '...',
  agentType: 'resume_tailor',
  executionId: '...',
  status: 'success',
  output: { ... },
  tokensUsed: 1234,
  duration: 5600,
}
```

## Agent Types & Specializations

### Resume Tailor Agent
**Purpose**: Optimize resume for specific job opportunities
**Input**: Resume, job description, company info
**Output**: Tailored professional summary, skills, bullet points, confidence score

### Job Match Agent
**Purpose**: Evaluate alignment between candidate and job
**Input**: Candidate profile, job description
**Output**: Overall score (0-100), dimensional scores, strengths/gaps, recommendation

### Interview Prep Agent
**Purpose**: Generate comprehensive interview preparation
**Input**: Role, company, candidate background, previous interviews
**Output**: Company overview, likely questions, STAR stories, technical topics, talking points

### Research Agent
**Purpose**: Gather and synthesize company intelligence
**Input**: Company name, company info, job description
**Output**: Culture summary, leadership, competitive position, red flags, growth trajectory

### Follow-up Agent
**Purpose**: Generate personalized follow-up communications
**Input**: Interview summary, candidate profile
**Output**: Email templates, subject lines, follow-up sequence, personalization tips

### Networking Agent
**Purpose**: Identify and prioritize networking opportunities
**Input**: Candidate background, target role/industry
**Output**: Network analysis, outreach strategy, conversation starters, follow-up sequence

## Execution State Machine

```
QUEUED
  ↓
RUNNING
  ├─ (streaming from Claude API)
  ├─ (persisting tokens/events)
  ↓
COMPLETED (success)
  └─ Output stored as JSON

FAILED (error during execution)
  └─ Error message persisted

PAUSED (user initiated pause)
  ↓
RUNNING (user resumes)
  ↓
COMPLETED
```

## Database Schema

### AgentExecution
```prisma
model AgentExecution {
  id           String    @id @default(cuid())
  userId       String
  agentType    String    // 'resume-tailor', 'job-match', etc.
  status       String    // 'queued', 'running', 'completed', 'failed', 'paused'
  input        String?   // JSON context for execution
  output       String?   // JSON results from Claude
  tokenCount   Int?      // Tokens used in this execution
  durationMs   Int?      // Total execution time
  errorMessage String?   // If status is 'failed'
  createdAt    DateTime  @default(now())
  startedAt    DateTime?
  completedAt  DateTime?
  eventLogs    EventLog[]
}

model EventLog {
  id          String    @id @default(cuid())
  executionId String
  level       String    // 'INFO', 'WARN', 'ERROR'
  message     String
  metadata    Json?
  timestamp   DateTime  @default(now())
  execution   AgentExecution @relation(fields: [executionId], references: [id], onDelete: Cascade)
}
```

## Error Handling & Recovery

### Timeout Handling
- Default: 5 minutes per execution
- Configurable via `AGENT_EXECUTION_TIMEOUT_MS`
- Marks execution as failed with timeout message

### Concurrent Execution Limits
- Max 5 agents per user (configurable)
- Prevents resource exhaustion
- Queued executions wait for slots

### Parsing Failures
- If Claude response isn't valid JSON, raw response stored
- Warning logged but execution marked complete
- UI can handle raw vs. structured output

### Network Failures
- Connection drops don't orphan executions
- Database record persists through reconnects
- Polling retries on next cycle

### Provider Failover
- Currently supports Anthropic (primary) and Nvidia NIM
- Can add OpenAI, Claude (local), etc. without touching executor
- Provider configured at startup, not swappable per-execution

## Performance Optimization

### Streaming vs. Buffering
- Default: Stream tokens to database immediately
- Reason: Better UX, early error detection, reduced memory
- Alternative: Buffer all tokens, parse once (slower UX)

### Token Counting
- Anthropic: Native token count in API response
- Nvidia NIM: Approximate count via token-counter package
- Both stored in AgentExecution.tokenCount

### Concurrency Strategy
- Database polling: Simple, scales to ~100 users
- Future: Migrate to Trigger.dev for 1000+ users
- Current setup: 5-second polling interval, batch size 5

## Monitoring & Observability

### EventLog Table
Every execution step logged:
```
INFO: Agent execution queued
INFO: Agent execution started
INFO: Streaming... (50 tokens)
INFO: Streaming... (100 tokens)
INFO: Agent execution completed successfully
```

### Metrics
- Token count per execution
- Duration per execution
- Success/failure ratio per agent type
- Queue depth per user

## Testing Checklist

### Setup
- [ ] Configure `.env.local` with ANTHROPIC_API_KEY
- [ ] Run `npm run build` (should compile clean)
- [ ] Run `npm run dev`

### Manual Testing
- [ ] POST /api/agents/execute with resume-tailor agent
- [ ] GET /api/agents/execute?executionId=xxx to fetch status
- [ ] POST /api/agents/execute-pending?immediate=true to process
- [ ] Verify output in database (SELECT * FROM "AgentExecution")
- [ ] Verify EventLog entries created

### Integration Testing
- [ ] Connect UI component to WebSocket
- [ ] Trigger execution, verify real-time status updates
- [ ] Test agent type: resume-tailor (should work end-to-end)
- [ ] Test error handling: invalid context, timeout

### Next Steps
- [ ] Implement remaining agent types (job-match, interview-prep, research)
- [ ] Wire up AgentRail component to execution endpoints
- [ ] Add token budget tracking and daily limits
- [ ] Implement retry logic for failed executions
- [ ] Migrate to Trigger.dev for production scaling

## FAQ

**Q: Can I use Nvidia NIM right now?**
A: Yes. Set `LLM_PROVIDER=nvidia-nim` and configure `NIM_API_KEY`. Code path already implemented.

**Q: How do I test without hitting Claude API?**
A: Mock the `getLLMProvider()` function in tests, return hardcoded responses.

**Q: What happens if an execution is still running when I restart the server?**
A: Execution record remains in 'running' state. On next polling cycle, it will be reprocessed. Consider adding a heartbeat check before retrying.

**Q: Can I pause/resume executions?**
A: Yes. API routes exist in phase-1: PATCH /api/agent/execution/[id]/pause, PATCH /api/agent/execution/[id]/resume.

**Q: How do I reduce token usage?**
A: Use cheaper models (NIM), reduce maxTokens per execution, or add token budget limits (Phase 3 feature).

**Q: Will this handle 1000 concurrent users?**
A: Currently: No. Scales to ~100 users with database polling. Phase 4: Migrate to Trigger.dev for 1000+ users.

## Next Phase Roadmap

### Phase 3: Cost Management & Advanced Features
- [ ] Token budget limits per user
- [ ] Execution cost tracking
- [ ] Retry logic with exponential backoff
- [ ] Agent composition (agents calling agents)

### Phase 4: Production Scaling
- [ ] Migrate from database polling to Trigger.dev
- [ ] Add execution priority queuing
- [ ] Implement rate limiting per user
- [ ] Add metrics/monitoring dashboard

### Phase 5: Intelligence Layer
- [ ] Caching of agent outputs
- [ ] Multi-turn agent conversations
- [ ] Agent marketplace (community agents)
- [ ] A/B testing framework for prompts
