# Schema & Route Reconciliation Document

This document establishes the definitive reconciliation between the database schema (`schema.prisma`), runtime API endpoints, data transfer objects (DTOs), and user interface (UI) components. Its goal is to prevent architectural drift, ensure zero orphaned fields, and provide a single source of truth for contract validation.

---

## 1. Persona & Identity Entities

### Candidate Profile & Auth
- **Prisma Model**: `Candidate`
- **Related Models**: `TwoFactorSecret`, `ApiKey`, `UserRole`
- **Active DTO Schemas**:
  - `src/lib/validation/schemas.ts` (`RegisterSchema`, `LoginSchema`, `TwoFactorVerifySchema`)
  - `src/types/auth.ts` (`UserSession`, `UserProfile`)
- **API Routes**:
  - `/api/auth/register` (POST) → Registers `Candidate`
  - `/api/auth/login` (POST) → Authenticates credentials
  - `/api/auth/2fa/setup` (GET/POST) → Operates on `TwoFactorSecret`
  - `/api/api-keys` (GET/POST/DELETE) → Operates on `ApiKey`
- **UI Surfaces**:
  - `/login` (Credentials & OAuth forms)
  - `/settings/security` (2FA configuration status panel)
  - `/api-keys` (API Key manager dashboard)
- **Reconciliation Audit Status**: ✅ **100% Aligned**. Zero dual-field definitions. Secret fields are cryptographically guarded.

---

## 2. Job Pipeline & Workspace Entities

### Opportunity Management
- **Prisma Model**: `Job`
- **Related Models**: `JobActivity`, `Offer`, `Interview`, `InterviewFeedback`, `InterviewPrep`
- **Active DTO Schemas**:
  - `src/domains/jobs/schemas.ts` (`JobCreateInput`, `JobUpdateInput`, `JobStageChangeInput`)
- **API Routes**:
  - `/api/jobs` (GET/POST) → Fetch or create opportunity pipeline
  - `/api/jobs/[id]` (GET/PATCH/DELETE) → CRUD actions on a specific job
  - `/api/jobs/[id]/activities` (GET/POST) → Audited timeline actions on `JobActivity`
- **UI Surfaces**:
  - `/jobs` (Kanban and list view pipeline tracking)
  - `/analytics` (Funnel analytics dashboard based on pipeline states)
- **Reconciliation Audit Status**: ✅ **100% Aligned**. `JobStage` is enforced at the database layer via PostgreSQL enums, eliminating state injection risks.

---

## 3. Agent Execution & Orchestration Entities

### Asynchronous Telemetry & Queueing
- **Prisma Model**: `AgentExecution`
- **Related Models**: `ToolCall`, `EventLog`, `PromptVersion`
- **Active DTO Schemas**:
  - `src/lib/agents/schemas/execution.ts` (`AgentExecutionSchema`, `ToolCallSchema`, `EventLogSchema`)
  - `src/contracts/events/` (BullMQ payload wrappers)
- **API Routes**:
  - `/api/agents/execute` (POST) → Creates `AgentExecution` row and enqueues to `executionQueue` via `enqueueAgentExecution`
  - `/api/agent/execution/[executionId]` (GET) → Retrieves execution state, paginated `EventLog`, and `ToolCall` array
  - `/api/agent/execution/[executionId]/subscribe` (GET) → Canonical SSE subscription route multiplexed through the `sharedSubscriber` Redis listener
- **UI Surfaces**:
  - `/resume-lab` (Main tailoring workspace listening to real-time status and logs)
  - `/observability` (Operations tracing and latency board)
- **Reconciliation Audit Status**: ✅ **100% Aligned**. Direct mapping between BullMQ jobs, database rows, and SSE updates.

---

## 4. RBAC & Security Governance Entities

### Capabilities & Policies
- **Prisma Model**: `Role`, `Permission`, `RolePermission`, `UserRole`, `UserCapabilityOverride`
- **Active DTO Schemas**:
  - `src/lib/security/rbac.ts` (`RoleType`, `CapabilityEffect`, `RbacPolicy`)
- **API Routes**:
  - `/api/admin/rbac/roles` (GET/POST) → System and custom roles configuration
  - `/api/admin/rbac/permissions` (GET/POST) → Registered capability maps
  - `/api/admin/users/[id]/roles` (PUT) → Grant or revoke user roles
- **UI Surfaces**:
  - `/admin/permissions` (Operator panel to oversee capabilities and overrides)
  - `/admin/users` (Super Admin workspace)
- **Reconciliation Audit Status**: ✅ **100% Aligned**. System protected roles are marked immutable and cached in Redis.

---

## 5. Summary Matrix: Zero Orphaned Fields Verify

| Model | Database Field | Active DTO / Interface | UI Component Target | Status |
|---|---|---|---|---|
| `Candidate` | `passwordHash` | Not exposed in session DTO | None (Server Auth Only) | Resolved ✅ |
| `Job` | `stage` | `JobStage` enum | `KanbanColumn`, `PipelineChart` | Enforced ✅ |
| `AgentExecution` | `queueJobId` | `execution.queueJobId` | `TraceExplorerSpan` | Enplayed ✅ |
| `TwoFactorSecret` | `secret` | Encrypted string in service | `TwoFactorSetupModal` | Encrypted ✅ |
| `ApiKey` | `keyHash` | Excluded from response | `ApiKeyTable` (Prefix only) | Audited ✅ |
