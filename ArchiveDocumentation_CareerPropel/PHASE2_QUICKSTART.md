# Phase 2 Quick Start Guide

## Prerequisites

1. Node.js 18+ installed
2. Prisma migrations up-to-date: `npx prisma migrate deploy`
3. Redis running locally or configured
4. ANTHROPIC_API_KEY set in `.env.local`

## Setup (5 minutes)

```bash
# 1. Copy environment template
cp .env.phase2.example .env.local

# 2. Add your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env.local

# 3. Start dev server
npm run dev

# 4. Verify build compiles
npm run build
```

## First Agent Execution (Step-by-Step)

### Step 1: Trigger Resume Tailor Agent

```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "resume-tailor",
    "context": {
      "resume": "John Doe\nSoftware Engineer at Acme Corp\n- Built microservices\n- Led team of 3",
      "jobDescription": "Senior Software Engineer needed. Requirements: 5+ years experience, microservices, team leadership. Tech stack: Node.js, Docker, Kubernetes.",
      "companyName": "TechCorp",
      "companyInfo": "Fast-growing SaaS startup"
    }
  }'
```

**Response:**
```json
{
  "executionId": "clx1y2z3a4b5c6d7e8f9g0h1",
  "status": "queued",
  "message": "Agent execution queued for processing"
}
```

Save the `executionId` for next steps.

### Step 2: Check Execution Status

```bash
curl http://localhost:3000/api/agents/execute?executionId=clx1y2z3a4b5c6d7e8f9g0h1
```

**Response (while running):**
```json
{
  "id": "clx1y2z3a4b5c6d7e8f9g0h1",
  "status": "running",
  "progress": 50,
  "currentTask": "Streaming response from Claude",
  "tokenCount": null,
  "durationMs": null
}
```

**Response (after completion):**
```json
{
  "id": "clx1y2z3a4b5c6d7e8f9g0h1",
  "status": "completed",
  "progress": 100,
  "output": {
    "summary": "Results-driven Software Engineer with 5+ years...",
    "skills": ["microservices", "node.js", "team-leadership", "docker"],
    "tailoredBullets": [
      {
        "role": "Senior Software Engineer at Acme Corp",
        "bullets": [
          "Led microservices migration, reducing latency by 40%",
          "Managed engineering team of 3, mentored junior developers"
        ]
      }
    ],
    "confidence": 87,
    "reasoning": "Strong alignment with job requirements..."
  },
  "tokenCount": 1234,
  "durationMs": 5600,
  "createdAt": "2026-05-12T10:30:00Z",
  "completedAt": "2026-05-12T10:30:05.6Z"
}
```

### Step 3: Process Pending Executions (Background)

The execution starts in "queued" state. It's processed by the background polling endpoint:

```bash
# Manually trigger (for development)
curl -X POST "http://localhost:3000/api/agents/execute-pending?immediate=true"
```

**Response:**
```json
{
  "processed": 1,
  "message": "Processed 1 pending executions",
  "timestamp": "2026-05-12T10:30:00.000Z"
}
```

### Step 4: Set Up Automatic Polling (Production)

In `vercel.json` (if using Vercel):

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

Or use a third-party service like Trigger.dev, AWS Lambda, or cron job.

## Real-time Updates (WebSocket)

### Connect to Real-time Stream

```typescript
// In browser or Node.js client
const userId = 'user-abc123';
const ws = new WebSocket(`http://localhost:3000/api/agents/ws?userId=${userId}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'agent:status_update') {
    console.log(`Status: ${message.data.status}`);
    console.log(`Task: ${message.data.currentTask}`);
  }
};
```

### Expected Messages

```json
{
  "type": "agent:status_update",
  "userId": "user-abc123",
  "agentType": "resume_tailor",
  "status": "running",
  "queueDepth": 0,
  "currentTask": "Analyzing job description...",
  "lastActivity": "2026-05-12T10:30:00Z"
}
```

```json
{
  "type": "agent:completed",
  "userId": "user-abc123",
  "agentType": "resume_tailor",
  "executionId": "clx1y2z3a4b5c6d7e8f9g0h1",
  "status": "success",
  "output": { ... },
  "tokensUsed": 1234,
  "duration": 5600,
  "timestamp": "2026-05-12T10:30:05Z"
}
```

## Testing All Agent Types

### Resume Tailor
```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"agentType":"resume-tailor","context":{"resume":"...","jobDescription":"..."}}'
```

### Job Match
```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"agentType":"job-match","context":{"userProfile":"...","jobDescription":"..."}}'
```

### Interview Prep
```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"agentType":"interview-prep","context":{"userProfile":"...","jobDescription":"...","companyName":"..."}}'
```

### Research
```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"agentType":"research","context":{"companyName":"...","companyInfo":"..."}}'
```

### Follow-up
```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"agentType":"follow-up","context":{"jobDescription":"...","userProfile":"..."}}'
```

### Networking
```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"agentType":"networking","context":{"userProfile":"...","jobDescription":"..."}}'
```

## Database Inspection

### View Executions
```sql
SELECT id, "agentType", status, "tokenCount", "durationMs", "createdAt"
FROM "AgentExecution"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### View Execution Logs
```sql
SELECT "executionId", level, message, timestamp
FROM "EventLog"
WHERE "executionId" = 'clx1y2z3a4b5c6d7e8f9g0h1'
ORDER BY timestamp DESC;
```

### View Output
```sql
SELECT id, "agentType", output
FROM "AgentExecution"
WHERE id = 'clx1y2z3a4b5c6d7e8f9g0h1';
```

Then parse the JSON output field to see results.

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY is not set"
**Solution**: Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-your-key-here`

### Issue: Execution stays in "queued" state
**Solution**: Polling endpoint isn't running. Either:
- Call `POST /api/agents/execute-pending?immediate=true` manually
- Set up cron job to call polling endpoint
- Check server logs for errors

### Issue: "Stream parsing failed" or "No JSON found in response"
**Solution**: Claude API returned malformed response. Check:
- API key is valid
- Context inputs aren't truncated/corrupted
- Claude API is responding normally (check status page)

### Issue: WebSocket connection fails
**Solution**: 
- Verify Redis is running (`redis-cli ping`)
- Check `NEXT_PUBLIC_WS_URL` environment variable
- Ensure userId parameter is provided in WebSocket URL

## Cost Estimation

**Per Execution (Resume Tailor example):**
- Input tokens: ~500 (resume + job description)
- Output tokens: ~300 (tailored resume + analysis)
- Total: ~800 tokens ≈ $0.003 USD with Claude 3.5 Sonnet

**For 100 job applications:**
- ~80,000 tokens ≈ $0.24 USD
- Way cheaper than paying for ATS premium features

**With Nvidia NIM:**
- Free or very cheap (~$0.0001 per token for Llama 2)
- 100 applications ≈ $0.08 USD

## Next: Connect UI Components

### AgentRail Integration
The AgentRail component should:
1. Fetch agent statuses via `/api/agents/status`
2. Subscribe to WebSocket real-time updates
3. Display execution progress, errors, results
4. Allow pause/resume/cancel controls

### Interview Prep Integration
The Interview Prep component should:
1. Call `POST /api/agents/execute` with agentType='interview-prep'
2. Get executionId back
3. Subscribe to WebSocket updates
4. Display generated prep materials as they stream

## Support

For issues or questions:
1. Check PHASE2_IMPLEMENTATION.md (comprehensive guide)
2. Review error logs: `tail -f .next/logs`
3. Inspect database: `npx prisma studio`
4. Check Redis pub/sub: `redis-cli MONITOR`
