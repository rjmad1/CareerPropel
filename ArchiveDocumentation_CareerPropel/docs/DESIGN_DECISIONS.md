# Design Decisions & Architectural Rationale

## Core Platform Decisions

### 1. AI-Native Interaction Model
**Decision:** Agents as first-class UI citizens with full visibility into execution.

**Rationale:**
- Career optimization requires multiple simultaneous autonomous tasks
- Users need transparency into agent reasoning for trust
- Real-time progress visibility reduces anxiety
- Explainability enables human oversight and intervention

**Tradeoff:**
- More complex UI state management vs. better user control
- Chose: Complexity is worth the user control benefit

**Implementation:**
- AgentRail component with status, progress, logs
- Real-time WebSocket updates with polling fallback
- Expandable execution timeline with tool details

---

### 2. Kanban/Swimlane Over Traditional ATS
**Decision:** Job application pipeline as 13-stage Kanban, not spreadsheet.

**Rationale:**
- Visual workflow reduces cognitive load (scanning vs. scrolling)
- Drag/drop enables rapid organization
- Column headers show stage distribution at a glance
- Analogy to Linear/Jira familiar to power users

**Tradeoff:**
- Less flexible filtering vs. faster decision-making
- Chose: Speed is more valuable than flexibility for core workflow

**Implementation:**
- Center swimlane with draggable cards
- Each stage shows count and status summary
- Quick-expand modal for details without leaving board
- Keyboard navigation (j/k to move between columns)

---

### 3. Three-Column Operational Dashboard
**Decision:** Agent Rail (L) + Kanban (C) + Context Panel (R) layout.

**Rationale:**
- Agent Rail: Operational transparency (what's running)
- Kanban: Pipeline visibility (where things are)
- Context: Detailed workspace (what matters now)
- Mirrors Linear's split-pane design with operational focus

**Tradeoff:**
- Takes up desktop width vs. balanced information density
- Chose: 27" monitor is standard for power users

**Implementation:**
- Fixed left/right width, flexible center
- Context panel tabs for different views
- State sync between all three panes
- Responsive: stacks on mobile, hides right pane on tablet

---

### 4. Profile Intelligence Over Simple Notes
**Decision:** Continuous semantic extraction, completeness scoring, gap detection.

**Rationale:**
- Resume quality is biggest lever for interview rate
- Extraction identifies gaps systematically
- Completeness scoring gamifies improvement
- Recommendations prioritize highest-impact actions

**Tradeoff:**
- Complex system vs. simple text fields
- Chose: Leverage AI to automate career optimization

**Implementation:**
- Document parser with confidence scores
- 8-category completeness framework
- Recommendation engine with ROI estimates
- Entity deduplication and relationship tracking

---

### 5. Asynchronous Agents Without Blocking
**Decision:** All heavy tasks run in background; UI never blocks.

**Rationale:**
- Resume tailoring: 5 minutes (unacceptable to block UI)
- Interview prep generation: 10 minutes
- Job matching: 2 minutes
- Users expect responsiveness (sub-100ms)

**Tradeoff:**
- More complex state management vs. responsive UX
- Chose: UX responsiveness is non-negotiable

**Implementation:**
- Agent execution model with polling/WebSocket
- Optimistic updates on client
- Status badges update in real-time
- User can see progress without waiting

---

### 6. Interview Prep as Unified Experience
**Decision:** Single InterviewPrep model with 6 components (not separate apps).

**Rationale:**
- Interview success requires integrated prep
- STAR stories inform behavioral + company research
- Resume alignment prevents mismatches
- Company research informs technical questions

**Tradeoff:**
- Complex data model vs. cohesive experience
- Chose: Integration prevents blind spots

**Implementation:**
- InterviewPrep model with related CompanyResearch, RoleBreakdown, StarStory
- Tabs for different prep aspects
- AI generates all components from job + resume
- User customization for each component

---

## Technical Decisions

### 7. Next.js App Router Over Pages Router
**Decision:** Use Next.js 13+ App Router with server/client components.

**Rationale:**
- Server components reduce JS bundle size
- Better TypeScript inference on server
- Streaming for faster initial paint
- API routes co-located with app routes

**Tradeoff:**
- Slightly steeper learning curve vs. simpler Pages Router
- Chose: Performance benefits worth the learning curve

**Implementation:**
- Server components for data fetching
- Client components with 'use client' where needed
- App-routed API endpoints in src/app/api/
- Middleware for authentication

---

### 8. Prisma ORM for Database Access
**Decision:** Use Prisma for type-safe database queries.

**Rationale:**
- Automatic migrations from schema changes
- Type safety for database queries (catch bugs at compile time)
- Prisma Studio for visual database inspection
- Query builder prevents SQL injection

**Tradeoff:**
- More abstraction than raw SQL vs. automatic optimization
- Chose: Type safety and developer experience

**Implementation:**
- Single source of truth: prisma/schema.prisma
- npx prisma generate creates TypeScript types
- Service layer uses generated Prisma client
- Migration docs in docs/schema/

---

### 9. PostgreSQL for Relational Data
**Decision:** PostgreSQL 14+ for production database.

**Rationale:**
- Strong ACID guarantees (critical for application state)
- JSON support for semi-structured data (metadata, recommendations)
- Full-text search for job descriptions
- Mature, widely supported, excellent Django/Node.js integration

**Tradeoff:**
- Setup complexity vs. better guarantees than SQLite
- Chose: Production reliability > development simplicity

**Implementation:**
- 20+ models with foreign key relationships
- Indexes optimized for Kanban/timeline queries
- JSON columns for metadata and recommendations
- Daily backups with point-in-time recovery

---

### 10. WebSocket + Polling for Real-Time Updates
**Decision:** WebSocket primary, automatic fallback to polling.

**Rationale:**
- WebSocket: Low latency, bidirectional
- Polling: Simple, no infrastructure overhead, works everywhere
- Fallback ensures connectivity even behind restrictive firewalls

**Tradeoff:**
- Two implementation paths vs. simple HTTP polling
- Chose: Reliability + UX for most users

**Implementation:**
- useRealTime hook abstracts both transports
- Subscribe/unsubscribe pattern
- Event batching to prevent UI thrashing
- 2-second polling interval if WebSocket unavailable

---

### 11. React Query for Server State
**Decision:** Use TanStack Query for remote data synchronization.

**Rationale:**
- Automatic request deduplication
- Built-in caching with TTL strategy
- Background refetching
- Optimistic updates

**Tradeoff:**
- External dependency vs. manual fetch management
- Chose: Significantly simpler state management

**Implementation:**
- useQuery for GET endpoints
- useMutation for POST/PUT/DELETE
- Cache TTL: 5 min for jobs, 15 min for profile, 30 sec for executions
- Pagination support with keepPreviousData

---

### 12. Tailwind CSS for Styling
**Decision:** Utility-first CSS with Tailwind.

**Rationale:**
- Rapid component styling without context switching
- Consistent design system
- Tree-shaking removes unused styles
- Dark mode support built-in

**Tradeoff:**
- Larger HTML class lists vs. faster development
- Chose: Developer velocity

**Implementation:**
- Custom color palette aligned with agent status colors
- Responsive breakpoints (mobile, tablet, desktop)
- Dark mode for theme consistency
- Custom components for common patterns

---

### 13. TypeScript for Type Safety
**Decision:** 100% TypeScript, strict mode enabled.

**Rationale:**
- Catch bugs at compile time (agent configs, API contracts)
- Self-documenting code
- Refactoring safety
- IDE autocomplete significantly faster development

**Tradeoff:**
- Setup overhead vs. correctness
- Chose: Type safety for complex domain

**Implementation:**
- tsconfig.json with strict: true
- Interfaces for all major data structures
- Branded types for IDs (JobId, ExecutionId, etc.)
- npm run type-check in CI/CD

---

## Data Architecture Decisions

### 14. Completeness Scoring Algorithm
**Decision:** 8-category weighted average (0-100 scale).

**Rationale:**
- Personal info (10%) — baseline profile quality
- Resume (15%) — primary resume quality driver
- Skills (20%) — job matching correlation
- Experience (20%) — recruiter evaluation
- Education (10%) — baseline qualification
- Goals (10%) — strategic fit
- Portfolio (10%) — differentiation
- Certifications (5%) — specialty proof

**Tradeoff:**
- Weights are somewhat arbitrary vs. data-driven
- Chose: Reasonable heuristics, tune with user feedback

**Formula:**
```
totalScore = sum(categoryScore * weight) for all 8 categories
```

---

### 15. ProfileEntity Extraction Confidence
**Decision:** Confidence 0-1 tracks extraction certainty.

**Rationale:**
- 0.95-1.0: Direct extraction from text
- 0.75-0.94: Inferred from context
- 0.50-0.74: Fuzzy matched/ambiguous
- 1.0: User-provided/manual

**Tradeoff:**
- More granular than binary vs. complexity
- Chose: Enables filtering low-confidence entities

**Implementation:**
- Display badges for confidence level
- Filter options (e.g., show >0.8 confidence only)
- Recommendations focus on high-confidence gaps

---

### 16. Agent Execution Event Logging
**Decision:** Three-level event capture: AgentExecution → ToolCall → EventLog.

**Rationale:**
- AgentExecution: High-level task state
- ToolCall: Individual tool metrics (duration, tokens)
- EventLog: Detailed execution trace (INFO/WARN/ERROR/DEBUG)

**Tradeoff:**
- More granular than execution-only vs. debugging capability
- Chose: Explainability requires detailed traces

**Implementation:**
- EventLog entries streamed in real-time
- 100-entry limit per agent (memory efficient)
- Retention: 30 days online, 90 days archived

---

## User Experience Decisions

### 17. Drag/Drop for Job Movement
**Decision:** Full drag/drop support between Kanban columns.

**Rationale:**
- Fast reorganization (power user affordance)
- Clear visual feedback
- Reversible (undo capability)

**Tradeoff:**
- Touch-friendly vs. desktop-optimized
- Chose: Desktop power users are primary audience

**Implementation:**
- React Beautiful DnD library
- Stage validation (prevent invalid transitions)
- Optimistic update on client
- API call on drop (with error recovery)

---

### 18. Context Panel Over Modal for Details
**Decision:** Persistent right panel instead of modal overlays.

**Rationale:**
- Maintains Kanban context visibility
- Side-by-side comparison with other cards
- Tab switching without reopening
- Scroll while reading details

**Tradeoff:**
- Uses horizontal space vs. immersive focus
- Chose: Context preservation is critical

**Implementation:**
- Fixed right column
- Responsive: hidden on tablet, full on desktop
- Close button + state persistence
- Tabs for different views

---

### 19. Recommendation Grouping by Priority
**Decision:** Sort recommendations by impact (high → medium → low).

**Rationale:**
- Users can act on highest-impact items first
- Avoids decision paralysis
- Creates quick wins (e.g., "Add LinkedIn link")

**Tradeoff:**
- Top recommendations same for all users vs. personalization
- Chose: Simplicity wins initially

**Implementation:**
- Priority: high/medium/low based on impact
- Icons and color coding
- Estimated time for expectation setting
- Action links to direct users

---

### 20. Real-Time Status Over Polling User
**Decision:** Agent status updates push to UI; user doesn't need to refresh.

**Rationale:**
- Reduces user anxiety about background tasks
- Enables reactive features (e.g., auto-advance to next stage)
- Matches SaaS expectations

**Tradeoff:**
- WebSocket infrastructure vs. simpler HTTP polling
- Chose: UX is worth the infrastructure

**Implementation:**
- EventSource or WebSocket subscription
- Fallback to 2s polling if unavailable
- Badge with "offline" indicator
- Queue updates for replay on reconnect

---

## Security & Privacy Decisions

### 21. OAuth2 Authentication
**Decision:** OAuth2 for SSO; no password storage.

**Rationale:**
- Reduces password breach risk
- Single source of truth (GitHub, Google)
- Familiar to developers

**Tradeoff:**
- Dependency on third-party auth vs. zero dependencies
- Chose: Industry standard with proven security

**Implementation:**
- NextAuth.js for OAuth2 flow
- JWT tokens in httpOnly cookies
- Token refresh before expiry
- CSRF protection on state-changing routes

---

### 22. Resume Encryption at Rest (Future)
**Decision:** Future phase: encrypt sensitive documents.

**Rationale:**
- Resumes contain sensitive information (salary history, personal details)
- Server breach exposes all resumes without encryption
- Encryption adds security layer

**Tradeoff:**
- Performance overhead vs. data protection
- Chosen for Phase 2

**Implementation:**
- AES-256 encryption for Document.url
- Key management via AWS KMS (or similar)
- User-owned keys prevent even admin access

---

### 23. GDPR Compliance
**Decision:** Support full data deletion; retain logs for 90 days max.

**Rationale:**
- GDPR "right to be forgotten"
- EventLog retention: 30 days online, 90 days archived max
- Cascade deletes on Candidate deletion

**Tradeoff:**
- No indefinite audit trail vs. legal compliance
- Chose: Compliance is mandatory

**Implementation:**
- Cascade delete triggers via Prisma
- Archive script for old EventLogs
- Deletion verification emails
- Documented retention policy

---

## Performance Decisions

### 24. Virtualization for Large Lists
**Decision:** Virtualize job cards, agent logs, entity lists.

**Rationale:**
- Power user with 100+ jobs can't load all cards at once
- Only visible cards render (40 cards * 200px ≠ 2000px DOM)
- Scroll performance stays constant

**Tradeoff:**
- Library dependency vs. smooth performance
- Chose: windowing library (react-window) is worth it

**Implementation:**
- VirtualList for job columns (estimated row height 200px)
- VirtualList for agent logs (estimated height 40px)
- Pagination with cursor for infinite scroll

---

### 25. Caching Strategy by Entity Type
**Decision:** Tiered cache TTLs by data volatility.

**Rationale:**
- Profile data: 15 min (user updates manually)
- Job list: 5 min (new jobs posted hourly)
- Agent execution: 30 sec (real-time updates)
- Interview prep: 1 hour (stable until job changes)

**Tradeoff:**
- Stale data window vs. network efficiency
- Chose: Acceptable staleness for performance

**Implementation:**
- React Query useQuery with staleTime config
- Manual revalidation on mutation
- Background refetch on browser focus
- User-triggered refresh button

---

## Scaling Decisions (Future)

### 26. Database Sharding Strategy
**Decision:** Shard by candidateId for Phase 2+ multi-tenant.

**Rationale:**
- Each user's data is independent
- Natural sharding key (all queries filter by candidateId)
- Enables geographic distribution

**Tradeoff:**
- Complex routing logic vs. scalability
- Chosen for future phases

---

### 27. Message Queue for Agent Execution
**Decision:** RabbitMQ/AWS SQS for Phase 2 distributed agents.

**Rationale:**
- Decouple agent submission from execution
- Enable horizontal scaling of agent workers
- Fair queuing between candidates

**Tradeoff:**
- Infrastructure complexity vs. unlimited throughput
- Chosen for enterprise scale

---

## Summary

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| Interaction Model | AI-native agents | Transparency & control |
| Layout | 3-column dashboard | Information density |
| Job Pipeline | 13-stage Kanban | Visual workflow clarity |
| Profile | Intelligent extraction | Systematic gap detection |
| Execution | Asynchronous background | UI responsiveness |
| Framework | Next.js App Router | Performance & TypeScript |
| Database | PostgreSQL + Prisma | Type safety & ACID |
| Realtime | WebSocket + polling | Reliability |
| Auth | OAuth2 | Security |
| Styling | Tailwind CSS | Developer velocity |

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System overview
- [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) — Timeline and sequencing
- [API_DESIGN.md](./API_DESIGN.md) — API contracts
