# Phase 2: API Integration & Agent Execution

This document describes the complete Phase 2 API integration for Career-Ops, including agent execution endpoints, LLM provider abstraction, and data fetching hooks.

## Architecture Overview

```
Frontend (React Components)
        |
Domain Hooks (useJob, useInterviewPrep, etc)
        |
Agent Execution Client (/lib/api/agent-client.ts)
        |
Agent API Routes (/api/agents/execute, /api/agents/execute-pending)
        |
Agent Executor (/lib/agents/executor.ts)
        |
LLM Provider (Anthropic or Nvidia NIM)
        |
Claude API or Nvidia NIM API
```

## LLM Provider Configuration

### Anthropic (Default)

Set in `.env.local`:
```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxx
```

### Nvidia NIM (Economical/Free Inference)

To use Nvidia NIM for economical inference:

```
LLM_PROVIDER=nvidia-nim
NIM_API_KEY=your-nvidia-api-key
NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NIM_MODEL=meta/llama2-70b-chat
```

Benefits of Nvidia NIM:
- Free or significantly cheaper inference compared to Claude API
- OpenAI-compatible API interface
- Supports various open-source models (Llama 2, Mistral, etc.)
- Easy provider switching without code changes

Setup:
1. Get API key from https://developer.nvidia.com/nim
2. Choose model from available options
3. Set environment variables
4. System automatically switches provider

## API Integration Layer

### Agent Execution Client

Handles communication with agent execution endpoints:

```typescript
import { getAgentClient } from '@/lib/api/agent-client';

const client = getAgentClient();

// Trigger agent execution
const execution = await client.executeAgent({
  agentType: 'interview-prep',
  context: {
    role: 'Senior Software Engineer',
    company: 'TechCorp',
    jobId: 'job-123',
  },
});

// Wait for completion with polling
const result = await client.waitForCompletion(execution.executionId);
console.log(result.output);
```

### Agent API Endpoints

- POST /api/agents/execute: Trigger new agent execution
- GET /api/agents/execute?executionId=xxx: Check execution status
- GET /api/agents/execute-pending: Background polling endpoint

### Job Data Endpoints

- GET /api/jobs: List all jobs for current user
- GET /api/jobs/[id]: Fetch single job with full details
- GET /api/jobs/[id]/activities: Fetch activity log
- GET /api/jobs/[id]/interviews: Fetch interviews

## Domain Hooks

All domain hooks now use the API and agent execution system:

### useJob(jobId)
Fetches job details from `/api/jobs/[id]`

### useJobs()
Fetches all jobs from `/api/jobs`

### useInterviewPrep(jobId, job)
Triggers interview-prep agent and returns AI-generated preparation

### useJobActivities(jobId)
Fetches activity log from `/api/jobs/[id]/activities`

### useInterviews(jobId)
Fetches interviews from `/api/jobs/[id]/interviews`

## Agent Types

Six agent types handle different career tasks:

| Agent Type | Purpose |
|---|---|
| resume-tailor | Customize resume for job |
| job-match | Score job fit |
| interview-prep | Generate interview prep |
| research | Research company/role |
| follow-up | Generate follow-up messages |
| networking | Generate outreach messages |

## Error Handling

Provider Fallback: If Anthropic API fails, system logs error and returns to user.

Polling Timeout: If agent doesn't complete within 60s, error is thrown.

Input Validation: Invalid agentType returns 400 error.

## Vercel Cron Setup

Background polling is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/agents/execute-pending",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

## Development Testing

Local Testing:

```bash
# 1. Start dev server
npm run dev

# 2. Trigger agent execution
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"agentType": "interview-prep", "context": {"role": "Senior Engineer", "company": "TechCorp"}}'

# 3. Check status
curl http://localhost:3000/api/agents/execute?executionId=clx1y2z3...

# 4. Process pending
curl -X POST "http://localhost:3000/api/agents/execute-pending?immediate=true"
```

## Key Files

- LLM Provider: `/lib/llm/provider.ts`
- Executor Engine: `/lib/agents/executor.ts`
- Agent Prompts: `/lib/agents/prompts.ts`
- API Client: `/lib/api/agent-client.ts`
- Domain Hooks: `/domains/jobs/hooks/`
- API Routes: `/app/api/agents/` and `/app/api/jobs/`

## Next Steps (Phase 3)

- Implement mutation hooks (create/update/delete operations)
- Add execution history and replay capability
- Implement cost tracking and budgets per user
- Add agent composition (chaining multiple agents)
- Implement WebSocket real-time updates
- Add execution cost insights dashboard
