# Agent System Architecture

## Overview

The Agent System is the autonomous orchestration layer that executes background tasks for resume tailoring, job matching, application generation, interview preparation, and other career development activities. Agents operate asynchronously, with full real-time visibility in the UI.

## Agent Types & Responsibilities

### 1. Resume Tailor Agent
**Purpose:** Customize resume for specific job opportunities.

**Inputs:**
- Base resume (ProfileData or Document)
- Job description (from Job model)
- Resume fragments (ResumeFragment cache)
- Previous tailored versions

**Process:**
1. Extract key requirements from job description
2. Map resume skills/achievements to job requirements
3. Call Claude API to generate tailored resume
4. Identify gaps and highlight relevant achievements
5. Create resume version in Document model

**Outputs:**
- Tailored resume document
- Match analysis (which skills highlighted)
- Gap analysis
- Confidence score (0-1)

**Success Criteria:**
- Resume includes all key job requirements
- ATS compatibility maintained
- Confidence score > 0.8

### 2. Job Matching Agent
**Purpose:** Score job relevance to candidate profile.

**Inputs:**
- Job description
- Candidate profile (skills, experience, goals)
- Historical application data (success patterns)

**Process:**
1. Extract role requirements and nice-to-haves
2. Compare with candidate skill set
3. Evaluate career stage alignment
4. Assess cultural/compensation fit
5. Generate match score (0-100)

**Outputs:**
- Match score (0-100)
- Recommendation (apply/maybe/skip)
- Reasoning (which skills match, what's missing)
- Application ROI estimate

**Success Criteria:**
- Score correlates with user success (offers received)
- Recommendations improve application efficiency
- Coverage of all skill dimensions

### 3. Application Agent
**Purpose:** Generate and submit job applications.

**Inputs:**
- Tailored resume
- Job description
- Cover letter template
- Application history
- Recruiter info (if available)

**Process:**
1. Generate personalized cover letter
2. Prepare application materials
3. Extract key information for form submission
4. Record submission in Job model
5. Set follow-up reminders

**Outputs:**
- Cover letter document
- Application confirmation
- Follow-up timeline
- Application ID (for tracking)

**Success Criteria:**
- Application accepted by ATS
- Recruiter contact established within 5 days
- No duplicate applications

### 4. Research Agent
**Purpose:** Gather company intelligence and role analysis.

**Inputs:**
- Company name
- Job description
- Interview date (if scheduled)

**Process:**
1. Search public company data (funding, news, culture)
2. Identify recent tech stack and projects
3. Find common interview patterns
4. Extract salary ranges from public data
5. Summarize competitive landscape

**Outputs:**
- CompanyResearch model:
  - Industry, size, funding status
  - Culture summary
  - Technical stack
  - Recent news and hiring trends
  - Salary benchmarks

**Success Criteria:**
- Data accuracy verified against LinkedIn, Crunchbase
- Relevance to interview preparation
- Actionable insights

### 5. Interview Prep Agent
**Purpose:** Generate comprehensive interview preparation.

**Inputs:**
- Job description
- Resume (resume alignment)
- Company research
- Resume projects (for STAR stories)
- Career history

**Process:**
1. Call Claude API to extract STAR stories from resume
2. Generate technical preparation guide
3. Synthesize company-specific talking points
4. Predict likely interview questions
5. Create compensation discussion guide
6. Identify red flags to address

**Outputs:**
- InterviewPrep model:
  - STAR stories (behavioral examples)
  - RoleBreakdown (seniority, responsibilities)
  - TechnicalPrep (concepts to review)
  - CompanyResearch integration
  - Confidence score

**Success Criteria:**
- STAR stories are credible and job-relevant
- Technical topics match job requirements
- Interview success rate >50%

### 6. Networking Agent
**Purpose:** Identify and engage relevant networking opportunities.

**Inputs:**
- Target companies
- Candidate profile
- LinkedIn connections (future)

**Process:**
1. Identify employees at target companies
2. Find mutual connections
3. Suggest warm introduction angles
4. Track engagement timeline

**Outputs:**
- Networking recommendations
- Engagement templates
- Follow-up schedule

**Status:** Planned for Phase 2

### 7. Follow-up Agent
**Purpose:** Manage application follow-ups and recruiter outreach.

**Inputs:**
- Job applications
- Last recruiter contact date
- Email templates
- Calendar (for optimal timing)

**Process:**
1. Identify jobs needing follow-ups (7, 14, 30 days)
2. Generate personalized follow-up message
3. Suggest optimal timing
4. Track follow-up effectiveness

**Outputs:**
- Follow-up recommendations
- Draft messages
- Success metrics (follow-up ROI)

**Status:** Planned for Phase 2

### 8. Analytics Agent
**Purpose:** Analyze application pipeline and success patterns.

**Inputs:**
- All job applications
- Interview outcomes
- Offer data
- Time investment

**Process:**
1. Calculate success rates by company/industry
2. Identify top-performing resume versions
3. Measure time-to-offer metrics
4. Detect patterns in rejections
5. Forecast offer probability

**Outputs:**
- Dashboard metrics
- ROI analytics
- Recommendations for optimization
- Trend forecasting

## Agent Execution Model

### State Machine

```
    ┌─────────┐
    │  IDLE   │ (initial state, waiting to run)
    └────┬────┘
         │ Start execution
         ▼
    ┌──────────┐
    │ RUNNING  │ (actively executing)
    └─┬──────┬─┘
      │      │
      │      └──────────────────────┐
      │                             │ Pause
      │                      ┌──────▼──┐
      │                      │ PAUSED   │
      │                      └──────┬───┘
      │                             │ Resume
      │             ┌───────────────┘
      │             │
      ▼             ▼
    ┌──────────┐  ┌──────────────┐
    │COMPLETED │  │ FAILED       │
    │          │  │ (with error) │
    └──────────┘  └──────────────┘
         ▲
         │ Cleanup/Logging
         └─────────────────────────
```

### Execution Lifecycle

**1. Initialization**
- Create AgentExecution record
- Set status to "idle"
- Initialize queue and token counter
- Store initial configuration

**2. Start**
- Transition status to "running"
- Record startedAt timestamp
- Begin first tool call

**3. Execution**
- Loop through tool calls
- For each tool:
  - Record ToolCall entry
  - Execute tool
  - Capture output/error
  - Log execution event (EventLog)
  - Update token count
  - Update progress percentage
- Batch updates every 100ms

**4. Completion**
- Set completedAt timestamp
- Calculate final duration
- Transition status to "completed"
- Trigger follow-up actions (resume version caching, etc.)
- Emit completion event

**5. Error Handling**
- Catch tool execution errors
- Log error to EventLog with full stack trace
- Increment retry counter
- Decide: retry or mark failed
- Notify user if manual intervention needed

**6. Cleanup**
- Store final metrics (token usage, duration)
- Archive old ToolCall outputs (keep only recent)
- Update related entities (Job, ProfileEntity, etc.)
- Emit cleanup event

## Real-time Update Architecture

### WebSocket Subscription Pattern

```typescript
// Frontend hook
useAgentExecution(executionId) {
  useEffect(() => {
    // Try WebSocket first
    const unsubscribe = subscribeToExecution(executionId, (update) => {
      // Update React state
      setExecution(prev => ({...prev, ...update}))
    });

    // Fallback to polling if WebSocket fails
    const fallbackUnsubscribe = subscribeWithPolling(executionId, {
      interval: 2000,
      maxDuration: 30000
    });

    return () => {
      unsubscribe?.();
      fallbackUnsubscribe?.();
    };
  }, [executionId]);
}
```

### Event Types

**agent:status** — Execution status change
```json
{
  "type": "agent:status",
  "data": {
    "id": "exec_123",
    "status": "running",
    "progress": 45,
    "currentTask": "Generating tailored resume",
    "updatedAt": "2026-05-10T14:30:00Z"
  }
}
```

**agent:log** — New log entry
```json
{
  "type": "agent:log",
  "data": {
    "executionId": "exec_123",
    "id": "log_456",
    "level": "INFO",
    "message": "Calling Claude API to generate resume",
    "timestamp": "2026-05-10T14:30:15Z"
  }
}
```

**agent:tool-call** — Tool execution result
```json
{
  "type": "agent:tool-call",
  "data": {
    "executionId": "exec_123",
    "toolCallId": "tool_789",
    "toolName": "generate_resume",
    "status": "success",
    "duration": 3500,
    "tokens": 620
  }
}
```

**agent:error** — Execution error
```json
{
  "type": "agent:error",
  "data": {
    "executionId": "exec_123",
    "level": "ERROR",
    "message": "API rate limit exceeded",
    "error": "429 Too Many Requests"
  }
}
```

### Polling Fallback

If WebSocket unavailable:
- Poll `/api/agent/execution/{executionId}` every 2 seconds
- Max 15 polls (30 seconds) before giving up
- Show "offline mode" indicator
- Queue updates locally
- Replay on reconnection

## Tool Call Execution

### Structure

```typescript
interface ToolCall {
  id: string;                    // unique ID
  executionId: string;           // parent execution
  toolName: string;              // which tool
  status: 'pending' | 'running' | 'success' | 'failed';
  input: Record<string, any>;    // arguments
  output?: Record<string, any>;  // result
  error?: string;                // error message
  startedAt: Date;
  completedAt?: Date;
  duration?: number;             // milliseconds
  tokens?: number;               // tokens used
  metadata?: Record<string, any>;
}
```

### Execution Flow

```
1. Create ToolCall record (status: pending)
2. Call tool with input
3. Update status to "running"
4. Capture output
5. Update status to "success"
6. Store output and duration
7. Emit tool-call event
8. Return output to agent logic
```

### Tool Library

**Available Tools (Mock/Real):**

| Tool Name | Purpose | Input | Output |
|-----------|---------|-------|--------|
| `generate_resume` | Create tailored resume | jobId, baseResume | tailoredResume, analysis |
| `extract_skills` | Parse skills from resume | documentId | skills[], confidence |
| `extract_achievements` | Extract achievements | documentId | achievements[] |
| `score_job_match` | Rate job relevance | jobId, candidateProfile | matchScore, reasoning |
| `generate_cover_letter` | Create cover letter | jobId, resume | coverLetter, tone |
| `search_company_info` | Get company data | companyName | company data |
| `predict_questions` | Forecast interview questions | jobDescription, role | questions[] |
| `extract_star_stories` | Find STAR stories in resume | resume, role | stories[] |
| `validate_ats` | Check ATS compatibility | resume | score, issues[] |
| `estimate_salary` | Get salary benchmarks | role, location, company | salaryMin, salaryMax |

## Error Handling & Recovery

### Retry Strategy

**Transient Errors (auto-retry):**
- Network timeouts → Retry with exponential backoff (1s, 2s, 4s, 8s)
- Rate limits (429) → Retry after Rate-Limit-Reset header
- Temporary service unavailable (503) → Retry up to 3 times

**Permanent Errors (no retry):**
- Invalid input (400) → Log and fail
- Authentication errors (401, 403) → Fail
- Resource not found (404) → Fail
- Bad tool implementation → Fail with detailed error

### Human Intervention

**Escalation Triggers:**
1. 3+ consecutive tool failures
2. Invalid output (validation failed)
3. User cancellation request
4. Confidence score too low (<0.5)
5. Hallucination detected (contradictory output)

**Intervention Options:**
- **Resume Tailor:** Review/edit generated resume before applying
- **Job Match:** Override score, provide feedback for improvement
- **Application:** Preview message before sending
- **Interview Prep:** Correct STAR stories, add custom notes

## Performance Metrics

### Tracking

Each execution tracks:
- **Latency:** startedAt → completedAt (total duration)
- **Tool latency:** Per-tool execution time
- **Token usage:** Total and per-tool
- **Success rate:** Completed / Total executions
- **Error rate:** Failed / Total executions
- **Quality:** Confidence scores, user feedback

### Optimization

**Target SLAs:**
- Resume tailoring: <5 minutes
- Job matching: <2 minutes
- Interview prep: <10 minutes
- Application generation: <2 minutes

**Optimization Strategies:**
- Parallel tool execution (where independent)
- Caching (resume versions, company data)
- Batch API calls (multiple entities in one request)
- Streaming for long-running tasks

## Integration with Frontend

### Component Display

**AgentCard Component:**
```tsx
<AgentCard
  agent={agent}
  isCompact={true}
  isSelected={selectedId === agent.id}
  onSelect={() => setSelectedId(agent.id)}
/>
// Shows: name, status, progress bar, confidence, current task
```

**AgentExecutionTimeline Component:**
```tsx
<AgentExecutionTimeline
  execution={execution}
  expanded={expandedExecution === execution.id}
  onExpand={() => setExpandedExecution(execution.id)}
/>
// Shows: tool calls, duration bars, input/output, errors
```

**AgentLog Component:**
```tsx
<AgentLog log={log} />
// Shows: timestamp, level, message, expandable data
```

### State Management Hook

```tsx
const {
  execution,     // Current execution
  toolCalls,     // All tool calls
  logs,          // Execution logs
  status,        // Current status
  error,         // Any error
  progress,      // 0-100
  pause,         // () => Promise
  resume,        // () => Promise
  cancel,        // () => Promise
} = useAgentExecution(executionId);
```

## Database Models

### AgentExecution
```prisma
model AgentExecution {
  id            String      @id @default(cuid())
  candidateId   String
  jobId         String?
  agentType     String
  
  status        String      @default("idle")
  startedAt     DateTime?
  completedAt   DateTime?
  duration      Int?
  
  currentTask   String?
  progress      Int         @default(0)
  
  tokenUsage    Int?
  errorMessage  String?
  metadata      Json?
  
  toolCalls     ToolCall[]
  eventLogs     EventLog[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  candidate     Candidate   @relation(fields: [candidateId], references: [id])
  job           Job?        @relation(fields: [jobId], references: [id])
  
  @@index([candidateId])
  @@index([agentType])
  @@index([status])
}
```

### ToolCall
```prisma
model ToolCall {
  id          String      @id @default(cuid())
  executionId String
  toolName    String
  
  status      String      @default("pending")
  input       Json?
  output      Json?
  error       String?
  
  startedAt   DateTime    @default(now())
  completedAt DateTime?
  duration    Int?
  tokens      Int?
  metadata    Json?
  
  execution   AgentExecution @relation(fields: [executionId], references: [id])
  
  @@index([executionId])
  @@index([toolName])
}
```

### EventLog
```prisma
model EventLog {
  id          String      @id @default(cuid())
  executionId String
  level       String      // INFO, WARN, ERROR, DEBUG
  message     String
  data        Json?
  timestamp   DateTime    @default(now())
  
  execution   AgentExecution @relation(fields: [executionId], references: [id])
  
  @@index([executionId])
  @@index([level])
}
```

## Configuration

### Agent Configs

```typescript
export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  'resume-tailor': {
    name: 'Resume Tailor',
    color: '#3B82F6',       // blue
    timeout: 300000,        // 5 min
    retryPolicy: { maxRetries: 3, backoff: 'exponential' },
    queueDepth: 10,
  },
  'job-match': {
    name: 'Job Matcher',
    color: '#8B5CF6',       // purple
    timeout: 120000,        // 2 min
    retryPolicy: { maxRetries: 2, backoff: 'exponential' },
    queueDepth: 20,
  },
  // ... other agents
};
```

## See Also

- [ARCHITECTURE.md](../ARCHITECTURE.md) — System overview
- [API Design](../API_DESIGN.md) — Agent API endpoints
- [Profile Intelligence](./PROFILE_INTELLIGENCE.md) — Profile system
