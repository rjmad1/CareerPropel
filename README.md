# Career-Ops: AI-Native Career Operating System

Career-Ops is an autonomous job application orchestration platform that transforms career development into a visual, operationally transparent workflow.

**Key Features:**
- 🤖 Real-time agent visibility (resume tailoring, job matching, interview prep)
- 🎯 Kanban pipeline with 13 application stages
- 📊 Profile intelligence with completeness scoring and gap detection
- 🎬 AI-assisted interview preparation with STAR stories and company research
- 🔄 Asynchronous background automation with full transparency
- 🚀 Built for power users seeking control and explainability

## Quick Links

### Core Documentation
- **[System Architecture](./docs/ARCHITECTURE.md)** — High-level system overview, data flows, real-time patterns
- **[API Design](./docs/API_DESIGN.md)** — Complete API endpoint reference with examples
- **[Design Decisions](./docs/DESIGN_DECISIONS.md)** — Architectural rationale and tradeoffs
- **[Implementation Roadmap](./docs/IMPLEMENTATION_ROADMAP.md)** — Timeline, milestones, and future phases

### Detailed Architecture
- **[Agent System](./docs/architecture/AGENT_SYSTEM.md)** — Agent types, execution model, real-time updates
- **[Profile Intelligence](./docs/architecture/PROFILE_INTELLIGENCE.md)** — Extraction, completeness scoring, recommendations
- **[Database Schema](./docs/schema/DATABASE_SCHEMA.md)** — 20+ models, relationships, indexes

### Developer Guide
- **[Setup Guide](./docs/development/SETUP_GUIDE.md)** — Local development environment setup
- **[Component Patterns](./docs/development/COMPONENT_PATTERNS.md)** — React component architecture
- **[Hook Patterns](./docs/development/HOOK_PATTERNS.md)** — Custom hook best practices

## Project Status

**Week 6 Implementation: In Progress** 🔄

### Completed ✅
- AgentRail UI with real-time status, progress bars, and logs
- Profile Intelligence UI with completeness scoring and recommendations
- API scaffolding for all 8 agent types
- Integrated dashboard (3-column layout)
- Real-time state management (WebSocket + polling)
- 30+ React components and custom hooks
- Complete TypeScript type definitions
- API endpoint design

### In Progress 🔄
- Database integration (Prisma migrations)
- Claude API integration for content generation
- Profile document extraction
- Interview prep generation
- Real WebSocket server setup

### Planned 📋
- Phase 2: Interview simulation, cover letter generation, auto-application
- Phase 3: Networking CRM, offer negotiation, analytics

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│  Agent Rail (L) │ Kanban Board (C) │ Context Panel (R)          │
├─────────────────────────────────────────────────────────────────┤
│                      API Layer (Next.js Routes)                  │
├─────────────────────────────────────────────────────────────────┤
│              PostgreSQL + Prisma (20+ models)                    │
├─────────────────────────────────────────────────────────────────┤
│     Claude API + Background Agent Execution + WebSocket         │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend:** React 18, Next.js 13+ (App Router), TypeScript
- **State Management:** React Query, Recoil (planned)
- **Styling:** Tailwind CSS
- **Real-time:** WebSocket + polling fallback
- **Database:** PostgreSQL 14+ with Prisma ORM
- **LLM:** Claude API (resume, interview prep, extraction)
- **Auth:** OAuth2 (NextAuth.js)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Docker)
- Claude API key

### Quick Setup
```bash
# Clone repository
git clone https://github.com/santifer/career-ops.git
cd career-ops

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with DATABASE_URL, CLAUDE_API_KEY, etc.

# Setup database
npx prisma migrate dev
npx prisma generate

# Start dev server
npm run dev
```

**Full setup guide:** [docs/development/SETUP_GUIDE.md](./docs/development/SETUP_GUIDE.md)

## Core Concepts

### Agent Rail
Real-time visibility into background task execution. Each agent shows:
- Current status (idle, running, completed, failed, paused)
- Progress bar (0-100%)
- Current task description
- Queue depth and tokens used
- Confidence score
- Expandable logs with timestamps

**Agent Types:**
- Resume Tailor → Customize resume for job
- Job Matcher → Score job relevance
- Application Agent → Generate application
- Research Agent → Gather company intelligence
- Interview Prep Agent → Generate prep materials
- Networking Agent → Identify connections (Phase 2)
- Follow-up Agent → Manage outreach (Phase 2)
- Analytics Agent → Track success metrics

### Kanban Pipeline
13-stage job application workflow:
```
Sourced → Interested → Resume Tailoring → Applied → Recruiter Screen
→ Hiring Manager → Technical Interview → System Design → Behavioral
→ Final Round → Offer → Negotiation → Rejected/Archived
```

Each job shows:
- Company and title
- Match score (0-100%)
- Current stage
- AI confidence
- Next action
- Blockers/risks

### Profile Intelligence
Continuous semantic extraction and completeness scoring:
- **8-category scoring:** Personal info, resume, skills, experience, education, goals, portfolio, certifications
- **Entity extraction:** Skills, achievements, education from documents
- **Recommendations:** Prioritized improvements with impact estimates
- **Gap detection:** Skill gaps compared to target jobs

## API Overview

**Main Endpoints:**

Agent Management:
```
GET    /api/agent/executions              # List all executions
GET    /api/agent/execution/:executionId  # Get execution details
PUT    /api/agent/execution/:executionId  # Pause/resume/cancel
```

Profile Management:
```
GET    /api/profile                       # Get complete profile
GET    /api/profile/completeness          # Get completeness scores
GET    /api/profile/entities              # Get extracted entities
POST   /api/profile/ats-check             # Analyze for ATS
```

Job Management:
```
GET    /api/jobs                          # List jobs
POST   /api/jobs                          # Create job
GET    /api/jobs/:jobId                   # Get job details
PATCH  /api/jobs/:jobId                   # Update job
```

**Full API reference:** [docs/API_DESIGN.md](./docs/API_DESIGN.md)

## Component Hierarchy

```
IntegratedDashboard
├── AgentRail (left swimlane)
│   ├── AgentCard (compact view)
│   │   ├── StatusBadge
│   │   ├── ProgressBar
│   │   └── ControlButtons
│   └── [Expanded agent detail]
│       ├── AgentCard (expanded)
│       ├── AgentExecutionTimeline
│       │   └── ToolCall details
│       └── AgentLog list
├── KanbanBoard (center swimlane)
│   ├── KanbanColumn (per stage)
│   │   └── JobCard (draggable)
│   │       ├── Metadata badges
│   │       ├── Match score
│   │       └── Quick actions
│   └── [Drag/drop orchestration]
└── ContextPanel (right swimlane)
    ├── JobDetails tab
    ├── ResumeAlignment tab
    ├── ProfileIntelligence tab
    ├── InterviewReadiness tab
    ├── CompanyResearch tab
    └── ActivityTimeline tab
```

## Key Hooks

- **useAgentExecution** — Manage single execution with real-time updates
- **useAgentRealTime** — Global agent status management
- **useProfile** — Profile data with debounced saves
- **useProfileCompletion** — Completeness tracking and milestones
- **useRealTime** — WebSocket + polling abstraction

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build
npm run type-check   # TypeScript type-checking
npm run lint         # ESLint
npm test             # Run tests
npm run test:e2e     # End-to-end tests
```

**Database:**
```bash
npx prisma migrate dev        # Create and run migration
npx prisma studio             # Open Prisma GUI
npx prisma generate           # Generate Prisma client
npx prisma db push            # Push schema to database
```

## Project Structure

```
career-ops/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Dashboard page
│   │   └── page.tsx         # Home page
│   ├── components/           # React components
│   │   ├── Agent/           # AgentRail components
│   │   ├── Profile/         # Profile components
│   │   ├── Kanban/          # Kanban components
│   │   ├── CareerOS/        # Integrated dashboard
│   │   └── ui/              # Base UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Service layer
│   │   ├── agent/           # Agent services
│   │   ├── profile/         # Profile services
│   │   └── websocket/       # Real-time utilities
│   └── types/                # TypeScript types
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md      # System overview
│   ├── API_DESIGN.md        # API reference
│   ├── DESIGN_DECISIONS.md  # Design rationale
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── architecture/        # Detailed docs
│   ├── schema/              # Schema docs
│   ├── development/         # Developer guides
│   └── future/              # Future roadmap
├── tests/                    # Test files
└── public/                   # Static assets
```

## Testing

```bash
# Unit tests
npm test

# Component tests
npm test -- components/Agent/AgentCard.test.tsx

# E2E tests
npm run test:e2e

# Coverage report
npm test -- --coverage
```

## Performance Targets

- API response time: <200ms p95
- Agent execution updates: <2s real-time
- Page load: <3s (lighthouse)
- Bundle size: <100KB (gzipped)

## Known Limitations

- **Database:** Prisma migrations pending (schema defined, not wired)
- **Claude API:** Integration scaffolded, not connected
- **WebSocket:** Server architecture placeholder
- **Interview Prep:** Generation logic designed, not implemented
- **Mobile:** Optimized for desktop (1920px+)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT

## Contact

- GitHub Issues: [career-ops/issues](https://github.com/santifer/career-ops/issues)
- Email: rajajeevankumar@gmail.com

---

**For detailed information:**
- Architecture decisions: [docs/DESIGN_DECISIONS.md](./docs/DESIGN_DECISIONS.md)
- Setup and development: [docs/development/SETUP_GUIDE.md](./docs/development/SETUP_GUIDE.md)
- API reference: [docs/API_DESIGN.md](./docs/API_DESIGN.md)
- System overview: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
