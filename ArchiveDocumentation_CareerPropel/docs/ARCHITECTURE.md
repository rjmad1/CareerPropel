# CareerPropel: System Architecture

## Overview

CareerPropel is an AI-native, autonomous job application orchestration platform designed as an operational "Career Operating System." The frontend transforms the backend agentic system into a highly visual, Kanban-based career management platform with real-time agent visibility, profile intelligence, and AI-generated interview preparation.

**Key Principles:**
- AI-native interaction model (agents are first-class citizens)
- Operational transparency (users see agent execution, reasoning, and confidence)
- Asynchronous automation (background agents execute without blocking UI)
- High information density (Kanban + swimlanes + context panels)
- Progressive enrichment (profile improves continuously via semantic extraction)

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Agent Rail     │  │  Kanban Board    │  │ Context Panel│  │
│  │  (Swimlane 1)    │  │  (Swimlane 2)    │  │ (Swimlane 3) │  │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤  │
│  │ • Agent status   │  │ • Job pipeline   │  │ • Job detail │  │
│  │ • Progress bars  │  │ • Stage columns  │  │ • Resume tab │  │
│  │ • Logs/errors    │  │ • Card actions   │  │ • Profile    │  │
│  │ • Execution time │  │ • Quick actions  │  │ • Metrics    │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
│         ↓ Real-time updates (WebSocket + polling fallback)      │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                      API Layer (Next.js Routes)                  │
├─────────────────────────────────────────────────────────────────┤
│  /api/agent/*          /api/profile/*         /api/jobs/*       │
│  /api/interview/*      /api/documents/*       /api/analytics/*  │
│                                                                   │
│         ↓ Service layer + optimistic updates                    │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                    Database Layer (Prisma)                       │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL with 20+ models:                                     │
│  • Candidate, Job, Skill, Achievement, Document                │
│  • ProfileEntity, ExtractionLog, ProfileScore                  │
│  • AgentExecution, ToolCall, EventLog                          │
│  • InterviewPrep, StarStory, CompanyResearch, RoleBreakdown    │
│                                                                   │
│         ↓ Background agents (async tasks)                       │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│          AI/LLM Layer (Claude API + Integrations)               │
├─────────────────────────────────────────────────────────────────┤
│  • Resume tailoring & generation                                │
│  • Job matching & scoring                                       │
│  • Interview prep generation                                    │
│  • Profile entity extraction                                    │
│  • Company research synthesis                                   │
│  • Career narrative generation                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Agent Rail (Left Swimlane)
Real-time visibility into background agent execution.

**Agents:**
- Resume Tailor Agent
- Job Matching Agent
- Application Agent
- Research Agent
- Interview Prep Agent
- Networking Agent
- Follow-up Agent
- Analytics Agent

**Status Indicators:**
- Idle (gray)
- Running (blue with progress bar)
- Waiting (yellow)
- Completed (green)
- Failed (red)
- Paused (orange)

**Display Elements:**
- Agent name and icon
- Status badge
- Progress bar (0-100%)
- Current task description
- Queue depth
- Tokens used
- Confidence score
- Last activity timestamp
- Control buttons (pause, resume, cancel)
- Expandable logs with timestamps

**Real-time Updates:**
- WebSocket connection for instant updates
- Fallback to 2-second polling if WebSocket unavailable
- Event batching to prevent UI thrashing
- Automatic reconnection with exponential backoff

### 2. Kanban Board (Center Swimlane)
Job application pipeline with 13 stages.

**Pipeline Stages:**
1. Sourced - Job discovered, not yet reviewed
2. Interested - Candidate interested, ready to apply
3. Resume Tailoring - Resume being customized for job
4. Applied - Application submitted
5. Recruiter Screen - Recruiter reviewing application
6. Hiring Manager - Hiring manager review stage
7. Technical Interview - First technical round
8. System Design - System design interview (if applicable)
9. Behavioral - Behavioral/competency interview
10. Final Round - Final interview(s) with senior stakeholders
11. Offer - Offer received
12. Negotiation - Offer negotiation in progress
13. Rejected / Archived - Application rejected or archived

**Job Card Display:**
- Company logo/name
- Job title
- Match score (0-100%)
- Application date
- Current stage
- Interview status
- Resume version
- Recruiter engagement status
- Compensation estimate
- Priority level (high/medium/low)
- AI confidence (0-100%)
- Next action recommendation
- Risk/blocker alerts
- Quick action buttons (expand, star, snooze)

**Interactions:**
- Drag/drop between columns
- Quick-expand modal for details
- Right-click context menu
- Keyboard shortcuts (j/k to navigate, enter to expand)
- Bulk actions (archive, prioritize)

### 3. Context Panel (Right Swimlane)
Detailed view of selected job with tabs.

**Tabs:**
- Job Details (description, requirements, compensation)
- Resume Alignment (resume version, tailoring progress)
- Profile Intelligence (relevant skills, gaps, recommendations)
- Interview Readiness (prep status, STAR stories, technical prep)
- Company Research (culture, tech stack, recent news)
- Activity Timeline (all actions and updates)
- Metrics (application ROI, success probability)

**Features:**
- Real-time sync with selected job
- Expandable/collapsible sections
- AI-generated insights and recommendations
- Risk alerts and warnings
- Quick action buttons

## Data Flow Architecture

### Job Ingestion Flow
```
Job URL/Description → Parser → Job Model (DB)
    ↓
Job Matching Agent → Match Score + Recommendation
    ↓
Display in "Sourced" column → User reviews
    ↓
User interest → Move to "Interested"
```

### Resume Tailoring Flow
```
Job Description → Resume Tailor Agent
    ↓
Claude API (resume generation) → Tailored Resume Version
    ↓
Store in DB → Display in job card
    ↓
User review/approve → Ready for Application Agent
```

### Application Generation Flow
```
Tailored Resume + Job + Cover Letter Template → Application Agent
    ↓
Claude API (application customization) → Submission Data
    ↓
User preview/approval → Submit to job board
    ↓
Move to "Applied" stage
```

### Interview Prep Generation Flow
```
Job + Resume + Company Research → Interview Prep Agent
    ↓
Claude API (multi-part generation):
  • STAR story extraction from resume
  • Technical concept review
  • Company-specific talking points
  • Likely interview questions
  • Compensation discussion guide
    ↓
Store as InterviewPrep model → Display in context panel
```

### Profile Intelligence Flow
```
Resume/Cover Letter/LinkedIn → Document Parser
    ↓
Extract ProfileEntity (skills, achievements, experience)
    ↓
Store with confidence scores + source tracking
    ↓
Calculate ProfileScore (8-segment completeness)
    ↓
Generate Recommendations (high-priority improvements)
    ↓
Display in Profile Intelligence section
```

## Real-time Update Mechanism

### WebSocket Subscription Pattern
```typescript
// Subscribe to agent status updates
subscribe('agent:status', (message) => {
  // Update agent state in real-time
});

// Subscribe to agent logs
subscribe('agent:log', (message) => {
  // Append to log list (keep last 100)
});

// Polling fallback (if WebSocket unavailable)
pollAgentExecution(executionId, {
  interval: 2000, // 2 seconds
  maxDuration: 30000 // 30 seconds max
});
```

### Event Batching Strategy
- Collect updates for 100ms
- Apply batch updates to React state
- Prevents re-render thrashing with high-frequency updates
- Maintains perceived real-time responsiveness

## State Management Architecture

### Global State (Recoil/Context)
- Agents (all agent statuses)
- Current Job (selected job for context panel)
- User Profile (profile completeness, skills, achievements)
- Notifications (unread count, toast queue)
- Filters (stage filters, search term, priority filters)

### Local Component State
- Expanded logs (UI preference)
- Modal open/close state
- Form field values (with debounced save)
- Scroll position (for each swimlane)

### Server State (React Query)
- Job list (paginated, with stage caching)
- Agent executions (paginated, with log pagination)
- Profile entities (with filter caching)
- Interview prep documents

## Performance Optimization Strategy

### Virtualization
- Virtualize job cards in each Kanban column (render only visible cards)
- Virtualize log entries in Agent Rail
- Pagination for entity lists (100 items per page)

### Caching
- Profile data: 15-minute TTL
- Job list: 5-minute TTL
- Agent execution: 30-second TTL (due to frequent updates)
- Interview prep: 1-hour TTL (stable data)

### Code Splitting
- Dashboard (main entry point): 150KB
- Interview Prep workspace: 80KB
- Profile Editor: 60KB
- Analytics: 50KB

### Image Optimization
- Company logos: WebP with PNG fallback
- Compress to <50KB per image
- Lazy-load in context panel

## Scalability Considerations

### Current Constraints
- Single candidate per session
- Up to 100 concurrent jobs (reasonable for power user)
- Up to 8 concurrent agents (by design)
- Polling interval: 2 seconds (16 requests/minute per agent)

### Future Scaling (Phase 2)
- Multi-candidate workspaces (team hiring managers)
- Shared job applications (with collaboration features)
- Distributed agent execution (message queue)
- WebSocket cluster with load balancing
- Read replicas for analytics queries

### Database Scaling
- Index on (candidateId, createdAt) for timeline queries
- Index on (jobId, stage) for Kanban queries
- Partition ProfileEntity by candidateId (sharding key)
- Archive old AgentExecution records after 90 days

## Error Handling & Recovery

### Agent Failures
- Transient errors: auto-retry with exponential backoff (1s, 2s, 4s)
- Persistent errors: escalate to user with manual retry option
- Halted agents: display red badge with error message
- User override: pause/resume/cancel agent execution

### Network Failures
- WebSocket disconnect: switch to polling automatically
- Polling failure: show "offline" mode with queued updates
- Reconnection: replay queued actions on reconnect

### UI Error Boundaries
- Component-level error catch (prevents full page crash)
- Fallback UI for each swimlane
- User-initiated recovery actions

## Security & Privacy

### Authentication
- OAuth2 with GitHub/Google (or email magic links)
- JWT tokens stored in httpOnly cookies
- Token refresh before expiry
- CSRF protection on all state-changing routes

### Data Privacy
- Resume/cover letters encrypted at rest (future phase)
- No third-party script injection (strict CSP)
- Audit trail for all agent actions
- GDPR deletion support (cascade delete)

### Permissions
- Candidate owns all their data
- Agents operate with same permissions as user
- Future: role-based access (collaborative hiring managers)

## See Also

- [API Design](./API_DESIGN.md) — Complete API endpoint reference
- [Agent System](./architecture/AGENT_SYSTEM.md) — Agent orchestration details
- [Profile Intelligence](./architecture/PROFILE_INTELLIGENCE.md) — Profile system design
- [Database Schema](./schema/DATABASE_SCHEMA.md) — Prisma schema explanation
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) — Timeline and sequencing
