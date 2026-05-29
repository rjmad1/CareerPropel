# CareerPropel — Enterprise-Grade Platform Documentation Book

> **Version**: 1.0.0-GA  
> **Classification**: Proprietary Enterprise Material  
> **Last Updated**: May 29, 2026  
> **Lead Architect**: Senior Product Architect & Business Analyst  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Ecosystem Overview](#2-ecosystem-overview)
3. [Information Architecture (IA)](#3-information-architecture-ia)
4. [User Personas](#4-user-personas)
5. [Stakeholder Analysis](#5-stakeholder-analysis)
6. [User Journey Maps](#6-user-journey-maps)
7. [Use Case Catalog](#7-use-case-catalog)
8. [Detailed Use Cases](#8-detailed-use-cases)
9. [Complete User Guide](#9-complete-user-guide)
10. [Role-Based Guides](#10-role-based-guides)
11. [Integration Architecture](#11-integration-architecture)
12. [Capability Matrix](#12-capability-matrix)
13. [Dependency Matrix](#13-dependency-matrix)
14. [Recommendations & Improvements](#14-recommendations--improvements)
15. [Documentation Gaps & Assumptions](#15-documentation-gaps--assumptions)
16. [Appendix](#16-appendix)

---

## 1. Executive Summary

**CareerPropel** (code-named `career-ops`) is an enterprise-grade, AI-native career management Software-as-a-Service (SaaS) platform. Designed for candidates navigating modern, highly competitive job markets, CareerPropel automates and orchestrates the entire job search lifecycle—from job discovery and applicant tracking to custom resume variant generation, AI-powered interview preparation, real-time campaign tracking, and salary negotiation.

Unlike traditional job boards or passive tracking sheets, CareerPropel acts as a **Career Operating System**. It combines a rich, multi-domain domain model (26 Prisma entities) with a dual real-time communications infrastructure (Socket.io WebSockets + Server-Sent Events with a Redis pub/sub bridge) and a pluggable multi-provider LLM Orchestration layer to deliver continuous, background agent executions on behalf of the user.

```
       ┌────────────────────────────────────────────────────────┐
       │             Candidate's Job Search Lifecycle           │
       └─────────────────────────┬──────────────────────────────┘
                                 │
     ┌───────────────────────────┼─────────────────────────────┐
     ▼                           ▼                             ▼
Job Discovery            Resume Optimization          Interview & Negotiation
- Multi-board Scrapers    - 14-stage Pipeline          - STAR Story bank
- Match scoring (>90%)    - Zod prompt safety          - Mock simulator feedback
```

### Strategic Objectives
*   **Minimize Time-to-Placement**: Optimize resume components, tailoring bullet points to specific ATS constraints in under 60 seconds.
*   **Scale Without Quality Loss**: Empower job seekers to execute highly customized application campaigns across multiple job roles while retaining perfect tracking.
*   **Enhance Interview Confidence**: Build simulated, role-specific interactive mock prep environments with instant NLP feedback loops and metrics preservation.
*   **Enforce Enterprise-Grade Security**: Protect user identities, PII, and credentials with strict Role-Based Access Control (RBAC), multi-factor authentication (2FA), API key hashing, and AES-256-GCM encryption.

---

## 2. Ecosystem Overview

CareerPropel is structured as a full-stack monolith utilizing **Next.js App Router** for routing, view rendering, and API surfaces, paired with a custom **Node.js sidecar server** for persistent Socket.io WebSocket connections and a **Redis-backed BullMQ execution queue** for background processes.

### 2.1 System Context Diagram
The diagram below maps the interaction boundaries of CareerPropel:

```
                    ┌──────────────────────────┐
                    │      Browser Client      │
                    │ (Zustand, React Query,   │
                    │   SSE EventSource, WS)   │
                    └──────┬────────────┬──────┘
                           │ HTTP REST  │ WebSocket (ws://)
                           │ & SSE      │ & heartbeats
                           ▼            ▼
             ┌────────────────────────────────────────┐
             │       Next.js Web / Socket Server      │
             │     (Embedded inside custom server.js) │
             └─────────────┬────────────┬─────────────┘
                           │            │
             ┌─────────────▼──┐      ┌──▼─────────────────┐
             │  PostgreSQL    │      │  Redis Pub/Sub     │
             │ (via Prisma)   │      │  & BullMQ Queues   │
             │ 26 Data Models │      │  Rate limiting state│
             └────────────────┘      └──────────┬─────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │ LLM Provider Gateway │
                                    │ (Anthropic, Nvidia    │
                                    │  NIM, Gemini, Groq)   │
                                    └───────────┬───────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │  External Web APIs    │
                                    │  - Resend (emails)    │
                                    │  - Google/Outlook Cal │
                                    │  - Playwright Spiders │
                                    └───────────────────────┘
```

### 2.2 High-Level Component Breakdown

#### A. Presentation & Client Layer (Browser)
*   **State Engines**: Zustand stores manage client-side state (`useJobStore` for jobs list, drag-and-drop state, and search parameters; `useUIStore` for sidebar toggles, panel slide-outs, modals, and theme states). TanStack React Query handles server-state synchronization with a 5-minute stale-time baseline.
*   **Real-time Handlers**: `useRealTime` and `useAgentRealTime` hooks subscribe to a unified EventSource SSE stream at `/api/agents/events`. Socket.io manages bidirectional WebSockets for job board updates and typing indicator metrics.

#### B. API Gateway & Middleware Layer (Next.js)
*   **Auth Gates**: NextAuth v4 handles standard cookie-based JWT sessions, email/password credentials, and Google/GitHub OAuth integrations. A fallback development bypass (`ALLOW_DEV_LOGIN`) is isolated from production.
*   **Security Scaffolding**: Middlewares enforce rate limits (via Redis Lua scripts), CORS controls (`CORS_ALLOWED_ORIGINS`), and Role-Based Access Controls (RBAC).

#### C. Real-Time sidecar & Event Bridge
*   **Socket/SSE Broker**: Built inside `server.js`. It subscribes to Redis pub/sub (`pmessage` pattern listening to `agent:*` and `queue:*`) and broadcasts status snapshots, logs, and progress changes to specific browser rooms (e.g. `user:${email}`).

#### D. Agent Operations & BullMQ Queue
*   **BullMQ Workers**: Decoupled asynchronously. The `start:worker` daemon processes enqueued prompt tailors, interview prep generation, and company research tasks. It executes prompt safety checks, LLM queries, and Zod output validations.
*   **Multi-Provider LLM Gateway**: Built via `orchestrator.ts` and `provider.ts`. Manages primary calls to Anthropic Claude alongside automated failover routes across Nvidia NIM, Gemini, Groq, OpenRouter, and local Ollama Mistral instances.

---

## 3. Information Architecture (IA)

### 3.1 Site Map & Navigation Hierarchy
CareerPropel utilizes a highly responsive sidebar layout. The URL path is treated as the canonical source of truth for the active workspace.

```
/ (Root Layout)
├── (auth)
│   ├── /login (with 2FA setup & bypass validation)
│   ├── /register
│   ├── /forgot-password
│   ├── /reset-password
│   └── /verify-email
├── /onboarding (Multi-step Profile Initialization)
├── /dashboard (Career OS Hub - metrics, active agents, upcoming interviews)
├── /jobs (14-stage Kanban & Split-pane Detail Workspaces)
│   └── ?stage=applied&sort=matchScore&job=cuid123
├── /interview-prep (STAR Preparation Workspace)
│   └── ?job=cuid123&tab=behavioral&story=storyIdabc
├── /resume-lab (Variant Management & Keyword Audits)
│   └── ?variant=variantIdxyz&doc=docId123&compare=true
├── /analytics (Metrics breakdowns: ROI, pipeline metrics, trajectories)
├── /documents (Document bank: resumes, cover letters)
├── /emails (Outreach generation tool)
├── /offers (Salary tracking and negotiating workspaces)
├── /calendar (OAuth dynamic Google & Outlook integration views)
├── /interviews (Historical logs and feedback scores)
├── /audit-logs (Security logs for admins)
├── /api-keys (Candidate custom API key management)
└── /settings
    ├── /account
    └── /security (2FA activation)
```

### 3.2 Functional Architecture

#### Module A: Jobs & Kanban Pipeline
*   **Purpose**: Track and manage job opportunities across a 14-stage pipeline.
*   **Target Users**: Candidates.
*   **Inputs**: Manual entry, public URL, or Playwright-imported job specs.
*   **Outputs**: Match score (%), prioritizations, activity records.
*   **Dependencies**: `Candidate` model, `prisma` client.
*   **Related Modules**: `Resume Lab` (variants associated per Job), `Interview Prep`.

#### Module B: Resume Lab & ATS Engine
*   **Purpose**: Parse, scoring, and tailor CV accomplishments to match target descriptions.
*   **Target Users**: Candidates, Support Team.
*   **Inputs**: PDF/DOCX binary uploads, job descriptions.
*   **Outputs**: Quantifiable keyword scores, customized PDF drafts.
*   **Dependencies**: `mammoth`, `pdf-parse`, `DOMPurify`, Anthropic SDK.
*   **Related Modules**: `Profile Intelligence` (syncs parsed credentials).

#### Module C: Interview Prep & Mock Simulator
*   **Purpose**: Dynamic question bank preparation, STAR story alignment, and simulated behavioral practice.
*   **Target Users**: Candidates.
*   **Inputs**: Interview details, STAR draft text fields.
*   **Outputs**: Confidence rating, timing feedback, model answers.
*   **Dependencies**: `useInterviewPrep` hook, SSE manager.

#### Module D: Agent Execution & Orchestration
*   **Purpose**: Running LLM agents concurrently under policy governance.
*   **Target Users**: Candidates, Admins, Support Engineers.
*   **Inputs**: `AgentPromptContext` payload.
*   **Outputs**: Token logs, cost tracking, structured JSON output.
*   **Dependencies**: Redis, BullMQ schedulers, LLM keys.

---

### 3.3 Data Architecture Overview (ERD Mapping)

CareerPropel's PostgreSQL database consists of 26 interconnected models. Below is the relational structure:

```
┌─────────────────┐        1:N        ┌────────────────┐
│   Candidate     ├──────────────────►│      Job       │
│  (Base Profile) │                   │ (14 Pipeline)  │
└────────┬────────┘                   └───────┬────────┘
         │                                    │ 1:1
         ├──────────────────────────┐         ▼
         │ 1:N                      │ 1:N ┌──────────────────┐
         ▼                          ├────►│  InterviewPrep   │
┌─────────────────┐                 │     │ (Question Banks) │
│ AgentExecution  │                 │     └────────┬─────────┘
│ (Queue Tasks)   │                 │ 1:N          │ 1:N
└────────┬────────┘                 ├─────────────►▼
         │ 1:N                      │     ┌──────────────────┐
         ▼                          │     │    StarStory     │
┌─────────────────┐                 │     │  (STAR Method)   │
│    EventLog     │                 │     └──────────────────┘
│ (Execution Logs)│                 ▼ 1:N
└─────────────────┘           ┌──────────────┐
                              │  AuditLog    │
                              │ (Security)   │
                              └──────────────┘
```

#### Major Entities & Ownership Models
1.  **Candidate**: Holds authentication credentials, preferences, 2FA status, and profile score. Owns all child elements.
2.  **Job**: Represents a single job application process. Linked to Candidate. Owns `JobActivity`, `Offer`, `Interview`, and `InterviewPrep`.
3.  **AgentExecution**: Tracks the life-cycle of background AI operations. Independent transactional entity mapped to a user email or ID. Owns `EventLog` and `ToolCall` records.
4.  **AuditLog**: System-owned immutable log for tracking actions (`LOGIN`, `API_KEY_CREATED`, `ROLE_UPDATED`, etc.) for security auditing.

---

### 3.4 Interaction Architecture (Sequential Flows)

#### Flow A: Real-Time SSE Agent Execution Tracking
The sequence diagram below represents how real-time agent statuses are pushed to the client during a tailored resume bullet task:

```
Browser Client         API /execute        BullMQ Queue        Agent Worker         Redis PubSub       Socket/SSE Server
     │                      │                    │                  │                    │                   │
     │──► POST /execute ───►│                    │                  │                    │                   │
     │    (Job & Resume)    │──► Enqueue job ───►│                  │                    │                   │
     │                      │    & create DB record                 │                    │                   │
     │◄── HTTP 202 ─────────│                                       │                    │                   │
     │    (Return executionId)                                      │                    │                   │
     │                                                              │                    │                   │
     │──► SSE Connect /api/agents/events ───────────────────────────┼────────────────────┼──────────────────►│
     │                                                              │                    │                   │
     │                                           │──► Claim job ───►│                    │                   │
     │                                           │    (running)     │──► Publish event ─►│                   │
     │                                           │                  │    "agent:running" │──► Forward event ─│
     │◄──────────────────────────────────────────┼──────────────────┼────────────────────┼─── "agent:running"│
     │                                                              │                    │                   │
     │                                                              │──► call Claude ───►│                   │
     │                                                              │◄── JSON output ────│                   │
     │                                                              │                    │                   │
     │                                                              │──► Validate Zod ──►│                   │
     │                                                              │──► Save to DB      │                   │
     │                                                              │──► Publish event ─►│                   │
     │                                                              │    "agent:complete"│──► Forward event ─│
     │◄──────────────────────────────────────────┼──────────────────┼────────────────────┼─── "agent:complete"
```

---

### 3.5 Governance Architecture

#### A. Role-Based Access Control (RBAC) Matrix
The RBAC engine evaluates actions via asynchronous database lookups inside `rbac.ts`.

| Role | Resource Scope | Permissions | Security Boundary |
|---|---|---|---|
| **SUPER_ADMIN** | Global Platform | `*` (All capabilities) | Bypasses all tenant constraints. |
| **PLATFORM_ADMIN**| Management | `users.*`, `flags.*`, `settings.scan` | Cannot view raw security audit records. |
| **SECURITY_ADMIN**| Security Audit | `audit.view`, `threat.read`, `2fa.enforce` | Isolated from editing features or variables. |
| **SUPPORT_ADMIN** | Operational | `jobs.read`, `agents.restart`, `logs.view`| Mapped strictly to support tickets. |
| **JOB_SEEKER** | Candidate | `jobs.self.*`, `agents.self.execute` | Strictly confined to personal tenant data. |

#### B. Feature Flag Governance
Feature gating is handled dynamically via the `FeatureFlag` database model. It supports 5 rollout strategies:
*   `all`: Active for all authenticated profiles globally.
*   `percentage`: Dynamic matching based on integer user hash modulo checks.
*   `allowlist`: Mapped to a specific array of `Candidate.id` entries.
*   `role_scoped`: Restricted to matching `RoleType` records.
*   `disabled`: Globally locked off at runtime.

---

## 4. User Personas

CareerPropel is documented for several distinct personas:

### 4.1 End Users (Candidate / Active Job Seeker)
*   **Persona Name**: Jordan Miller
*   **Role**: Active Job Seeker (Software Engineer focus)
*   **Responsibilities**: Tailoring applications, managing job hunt logistics, practicing interviews.
*   **Goals**: Secure a high-paying role, maintain consistent ATS scores, minimize manual template updates.
*   **Pain Points**: Highly repetitive customization requirements, lack of direct feedback on STAR stories, managing scheduling.
*   **Technical Proficiency**: Expert.
*   **Frequency of Use**: Daily (high interaction).
*   **Key Features**: Jobs Kanban, Resume Lab, STAR Story Bank, Interview Mock Workspace.
*   **Success Metrics**: ATS keyword matching rate >90%, click-to-offer duration <30 days.

### 4.2 Administrators & Managers (Security / Platform Admin)
*   **Persona Name**: Sarah Vance
*   **Role**: Security Operations Administrator
*   **Responsibilities**: Monitoring platform logins, auditing API rotations, tracing data egress.
*   **Goals**: Maintain zero-leak confidentiality, prevent brute force attacks, track API cost leaks.
*   **Pain Points**: Parsing large volumes of audit data, manual 2FA recovery, tracking unencrypted calendar credentials.
*   **Technical Proficiency**: Expert.
*   **Frequency of Use**: Weekly.
*   **Key Features**: Security Auditing logs, Threat Detection Alerts, User Capability Overrides.
*   **Success Metrics**: Zero security incidents, 100% compliance with 2FA enforcements.

### 4.3 Support & Operators (Technical Support Engineer)
*   **Persona Name**: Marcus Chen
*   **Role**: Tier-2 Platform Support Engineer
*   **Responsibilities**: Resolving failed agent executions, debugging calendar synchronizations, helping with document parsing issues.
*   **Goals**: Reduce customer ticket resolution time, easily trace failed BullMQ job parameters.
*   **Pain Points**: Technical logs are highly distributed; lack of clear insight when third-party APIs fail.
*   **Technical Proficiency**: Intermediate/Advanced.
*   **Frequency of Use**: Hourly.
*   **Key Features**: Event Log viewer, stuck job executors, AI Provider scan configs.
*   **Success Metrics**: Customer support ticket satisfaction >95%, average resolution time <15 minutes.

---

## 5. Stakeholder Analysis

A stakeholder analysis maps beneficiaries, operational teams, and product owners against their value expectations:

| Stakeholder Group | Interest / Role | Primary Value Drivers | Impact Level | Governance Involvement |
| :--- | :--- | :--- | :---: | :--- |
| **Job Seekers** | Primary Beneficiaries | High ATS match rates, streamlined application tracking, comprehensive interview preparation. | **CRITICAL** | Direct feedback loops, compliance audits. |
| **Platform Engineers**| System Owners | Minimum infrastructure costs, zero circular dependencies, high test coverage. | **HIGH** | Full CI/CD gating, PR governance rules. |
| **Security Board** | Risk Regulators | Zero PII data leakage to third-party LLMs, encrypted OAuth keys, complete audit logs. | **CRITICAL** | Strict review of `TwoFactorSecret` & API key hashes. |
| **Recruiting Partners**| Platform Users (Recruiter Role) | Highly structured candidate profiles, fast validation. | **MEDIUM** | Standard RBAC permissions mapping. |

---

## 6. User Journey Maps

### 6.1 Onboarding & Profile Setup (Journey 1)
```
[User signs up] ──► [Local file upload] ──► [mammoth/pdf-parse] ──► [LLM Skill Extraction] ──► [Completeness score]
```
1.  **Stage 1: Registration & 2FA Setup**: The user signs up via Email, sets up TOTP backup codes, and completes verification.
2.  **Stage 2: Document Upload**: The candidate drags-and-drops their raw .docx/.pdf base resume.
3.  **Stage 3: Background Analysis**: Backend triggers `/api/profile/extract`. In less than 2 seconds, deterministic parsers combine with an LLM prompt to map structural elements.
4.  **Stage 4: Completeness Display**: The UI calculates `ProfileScore` and populates the candidate's skill matrix.

### 6.2 Application & Tailoring Campaign (Journey 2)
1.  **Stage 1: Job Discovery**: Candidate inputs a URL (Greenhouse/LinkedIn). Playwright retrieves the job description.
2.  **Stage 2: Base Assessment**: The job card is created on the Kanban board. A matching agent yields a base fit score.
3.  **Stage 3: Trigger Optimization**: Candidate opens "Resume Lab" and requests optimization for "Bullet Points".
4.  **Stage 4: Event-driven Stream**: A BullMQ worker handles the prompt, executes safety rules, sanitizes templates, and streams progress updates.
5.  **Stage 5: Verification**: The refined bullet points are presented side-by-side. Quantifiable metrics are preserved, and the variant is stored in the database.

---

## 7. Use Case Catalog

| Code | Use Case Title | Primary Actor | Description | Mapped Module |
|---|---|---|---|---|
| **UC-001** | Account Registration & 2FA | Candidate | User signs up and registers Speakeasy-based 2FA tokens. | Auth Module |
| **UC-002** | Resume Parser Extraction | Candidate | Parse raw resume binaries using deterministic hybrid extractors. | Profile Module |
| **UC-003** | Job Importation & Scoring | Candidate | Parse and score external job links via Playwright web scrapers. | Jobs Module |
| **UC-004** | Resume Variant Customization | Candidate | Customize resume bullet points to target job keywords using AI. | Resume Module |
| **UC-005** | STAR Story Bank Assembly | Candidate | Write, assess, and store STAR experience narratives. | Prep Module |
| **UC-006** | Interactive Mock Prep | Candidate | Conduct real-time question preparation sessions. | Prep Module |
| **UC-007** | Custom API Key Provision | Candidate | Candidate creates prefix-indexed API key for developer access. | Security Module |
| **UC-008** | Multi-Provider Failover Scan| Admin | Admin updates provider API keys and checks model health. | Admin Module |
| **UC-009** | Security Log Inspection | Security Admin | View historical logins, impossible travel incidents, and threat logs.| Audit Module |
| **UC-010** | Continuous Appraisal Build | Candidate | Consolidate accomplishments into promotion dossiers. | Appraisal Module |

---

## 8. Detailed Use Cases

### UC-004: Resume Variant Customization
*   **Objective**: Generate a highly optimized variant of a base resume tailored to a specific job's keywords in < 60 seconds.
*   **Primary Actor**: Candidate
*   **Secondary Actors**: Anthropic Claude API (AI Provider)
*   **Preconditions**: Mapped `Candidate` profile exists, base resume document is uploaded, target `Job` description is parsed.
*   **Trigger**: Candidate clicks "Tailor Resume bullets" inside the Resume Lab workspace.

```
Candidate               Client App               API Route             BullMQ Worker          Anthropic API
    │                        │                       │                       │                      │
    │──► Tailor Resume ─────►│                       │                       │                      │
    │                        │──► POST /api/agents ─►│                       │                      │
    │                        │    /execute           │──► Enqueue Job ──────►│                      │
    │◄── 202 Accepted ───────│                       │                       │                      │
    │                                                                        │                      │
    │                                                                        │──► System Prompt ───►│
    │                                                                        │    & Context         │
    │                                                                        │◄── Optimized bullets─│
    │                                                                        │                      │
    │                                                                        │──► Save to DB        │
    │◄── Real-time SSE updates ──────────────────────────────────────────────│                      │
```

*   **Workflow**:
    1.  Candidate selects target job from split-pane panel.
    2.  System retrieves the parsed job keywords and the candidate's base resume.
    3.  System enqueues a `resume-tailor` agent task with priority weighting.
    4.  BullMQ Worker claims the job, checks `sanitizePrompt` rules, and requests an optimized structured JSON format from Anthropic.
    5.  The model optimizes bullet points, matching target keywords while keeping candidate metrics intact.
    6.  The worker validates the returned JSON, checks for hallucinated data, and updates the `ResumeVariant` DB record.
    7.  SSE stream pushes a `route_enter` update to client; client shows tailored bullets side-by-side.
*   **Alternative Flows (Exception Paths)**:
    *   *LLM Rate Limit (429)*: System catches the error, registers an execution warning log, updates `fallbackUsed = true`, and routes the prompt payload to the first healthy secondary LLM in the `orchestrator.ts` chain (Gemini 2.5).
    *   *Prompt Injection Detection*: The `promptSanitizer` regex triggers on user input. The execution is aborted immediately, status is updated to `failed`, and a HIGH-severity `AuditLog` is created.
*   **Business Rules**:
    *   Quantifiable metrics (e.g. `$2M sales`, `35% reduction`) MUST be preserved exactly and boldfaced.
    *   Hallucination check: Extracted skills must match the raw base resume profile.
*   **Success Criteria**: Mapped resume output matches at least 85% of target keywords; output is generated in under 60 seconds.

---

## 9. Complete User Guide

Welcome to the **CareerPropel User Manual**. This guide walks you through the day-to-day operations of the platform.

### 9.1 Getting Started & Authentication

#### Step 1: Account Creation
1. Navigate to the registration page.
2. Complete the signup form with your name, email, and password.
3. Check your inbox for a verification email. Click the verification link to activate your candidate record.

#### Step 2: Activating Two-Factor Authentication (2FA)
We enforce a secure environment. To activate Speakeasy-powered TOTP:
1. Log into your dashboard.
2. Navigate to `/settings/security`.
3. Scan the generated QR code using Google Authenticator, Duo, or any TOTP app.
4. Input the 6-digit confirmation code.
5. **IMPORTANT**: Store your generated backup codes in a safe place.

```
       ┌────────────────────────────────────────────────────────┐
       │             2FA Registration Workflow                  │
       └─────────────────────────┬──────────────────────────────┘
                                 │
     ┌───────────────────────────┼─────────────────────────────┐
     ▼                           ▼                             ▼
Scan QR Code             Enter 6-Digit Code            Save Backup Codes
- Authy / Google         - Verifies TOTP               - Recover account if
- Duo Authenticator      - Done in /settings           - phone is lost
```

---

### 9.2 Navigating the Jobs Kanban Pipeline

The `/jobs` workspace acts as your primary command center.

#### Using Filters & Sorts
*   **Board/List Toggle**: Use the top-right toggle to switch between a visual **Kanban board** and a tabular **List view**.
*   **Search**: Enter keywords into the search bar (`q` query param) to filter by company or job title instantly.
*   **Sort Options**: Sort opportunities dynamically by `date` added, `matchScore` %, or `company` name.
*   **Pipeline Stages**: Opportunities are organized across a 14-stage pipeline (from `sourced` to `accepted` or `rejected`).

#### Split-Panel Interaction
Clicking on any job card opens a dynamic side panel workspace:
*   **Match Analysis Tab**: Displays keyword alignments, missing skills, and overall fit score.
*   **Activities Tab**: Visual history of status changes, notes, and application touchpoints.
*   **Prep Workspace Tab**: Launch point for generating role-specific interview preparation kits.

---

### 9.3 Resume Lab Workspace & Keyword Audits

The `/resume-lab` workspace helps you build tailored resumes.

#### Managing Resumes
1.  Upload a baseline resume (PDF, DOCX) in the Document Bank.
2.  Open **Resume Lab**, select your base document, and click the target job card.
3.  Click **Run Optimization**. The page will show a progress indicator (0-100%).
4.  Once complete, a side-by-side view will show your base bullets compared to the optimized variant.

#### Troubleshooting Common Errors
*   **Error: "SSE stream connection lost"**: If real-time progress stops, the system's `useAgentRealTime` hook will automatically switch to a 5-second polling mechanism. Refresh the page to re-establish the primary SSE connection.
*   **Error: "Upload failed: file limit exceeded"**: Files must be under 5MB. Ensure your PDF does not contain large uncompressed media.

---

## 10. Role-Based Guides

### 10.1 Candidate Operational Playbook
Candidates focus on high-yield activities: job tracking, resume tailoring, and interview prep.

*   **Best Practice - Tailoring**: Never apply using a generic resume. Always run the `resume-tailor` agent, review keyword alignments, and export a role-specific resume variant.
*   **Best Practice - Preparation**: Prepare at least 3 STAR stories. Map each story to standard competencies (e.g. Leadership, Conflict Resolution) inside the preparation workspace to cover multiple potential interview scenarios.

---

### 10.2 System Administrator Operations Guide
Administrators manage system configurations, tenant settings, and provider setups.

#### Scanning AI Providers
1.  Navigate to `/settings/ai-providers`.
2.  Click **Scan Providers**. The system checks the response status, latency, and costs of your active APIs (Anthropic, NIM, Gemini).
3.  If Anthropic reports high latency, navigate to the provider settings, select the failover chain, and route high-priority agents to Google Gemini as a secondary provider.

```
       ┌────────────────────────────────────────────────────────┐
       │             Admin Provider Failover Scan               │
       └─────────────────────────┬──────────────────────────────┘
                                 │
     ┌───────────────────────────┼─────────────────────────────┐
     ▼                           ▼                             ▼
Scan Active APIs          Verify Latency / SLA          Toggle Routing
- Anthropic Claude        - Check if timeout > 55s      - Route agents to
- Nvidia NIM              - Monitor cost ceilings       - fallback provider
```

#### Auditing Threats & Permissions
1.  Open `/audit-logs`.
2.  Filter entries by `warning` or `critical` severity.
3.  If an **Impossible Travel** alert is logged (IP addresses change across geographic regions in <30 minutes):
    *   Temporarily suspend the candidate session.
    *   Trigger password reset and require 2FA re-verification.

---

## 11. Integration Architecture

CareerPropel is built with modular integration points. They are organized into four primary adapters:

### 11.1 AI Provider Gateway
*   **Primary Engine**: Anthropic Claude SDK (using `claude-3-5-sonnet-20241022`).
*   **Secondary Engine**: Nvidia NIM (serving Llama2 models via an OpenAI-compatible interface).
*   **Dynamic Orchestration**: Defined in `orchestrator.ts`. Evaluates API keys and routes tasks based on requirements (e.g. RESUME_OPTIMIZATION uses `gemini-2.5-flash` for fast responses, while ATS_OPTIMIZATION uses `groq-llama-3.1` for precise matching).

### 11.2 Scraping Engines (Playwright Sandbox)
To import job data safely and avoid IP blocks, the platform isolates Playwright web scrapers.
*   ** greenHouse.ts / indeed.ts / linkedin.ts / lever.ts / ashby.ts**: Pulls raw HTML, extracts target text elements, cleans CSS styles, and structures the metadata into structured JSON payloads.
*   **Resiliency**: Scrapers utilize random delay offsets, mock browser headers, and headless modes to prevent triggering anti-bot gates.

### 11.3 Calendar Sync Gateway (OAuth 2.0)
*   **Supported Platforms**: Google Calendar, Microsoft Outlook Calendar.
*   **Security Scaffolding**: Leverages `oauthState.ts` to prevent CSRF attacks. Candidate access and refresh tokens are securely stored in the `CalendarToken` model.
*   **Automatic Synchronization**: A background cron job checks active synchronization records daily. It pulls upcoming interviews, reconciles status changes, and schedules calendar events directly in the candidate's account.

---

## 12. Capability Matrix

This matrix maps core business objectives to specific technical components, illustrating how CareerPropel achieves its goals:

| Core Business Objective | Technical Enabler | Source Code Asset | Telemetry / Metric |
| :--- | :--- | :--- | :--- |
| **Increase Application Relevance** | Resume optimization agent using Anthropic LLM. | `src/lib/agents/executor.ts` | ATS Keyword score improvement %. |
| **Frictionless Application Tracking** | Drag-and-drop Kanban interface with ZStore caching. | `src/components/Kanban/KanbanBoard.tsx` | Drag-to-drop latency (<20ms). |
| **Mitigate Mock Interview Anxiety** | Real-time mock simulator with dynamic SSE feedback. | `src/hooks/useInterviewPrep.ts` | Complete session analytics & timing stats. |
| **Strict Account Integrity** | Multi-factor Speakeasy authentication & RBAC models. | `src/lib/security/rbac.ts` | 2FA coverage rate across admin accounts. |

---

## 13. Dependency Matrix

CareerPropel's stability depends on several external systems. This matrix documents how the platform behaves when a dependency goes down:

| Dependency | Purpose | Failure Mode | Resilience Strategy | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL Database** | Storage of all profile and application data. | Critical Outage (Platform down). | Fail-Closed. Database queries block gracefully with connection timeouts. | Trigger backup script immediately. |
| **Redis Server** | Pub/Sub event bridge, BullMQ queue, and rate limiting. | Real-time streams and limits disabled. | Fail-Open. Rate limit checks disable gracefully; client switches to DB polling. | Reconnect Redis; clear stuck background queues. |
| **Anthropic Claude API** | Main agent brain for tailoring resumes and prep. | Agent optimization fails. | Automated Failover. System switches to Google Gemini in the orchestrator chain. | Monitor orchestrator logs. |
| **Google/Outlook API** | Syncing interviews to personal calendars. | Synchronizations fail. | Log warning. Mapped OAuth credentials remain active; cron retries later. | Prompt user to re-authorize calendar connection. |
| **Resend Engine** | Sending authentication and notification emails. | System emails are delayed. | Enqueue emails. System retries sending emails when the API recovers. | Monitor email queue logs. |

---

## 14. Recommendations & Improvements

The following architectural updates are recommended to improve the system's scalability, performance, and security:

### A. Daily Cron Bottleneck
*   **Current State**: Background executions are triggered by a daily midnight cron (`vercel.json` calling `/api/agents/execute-pending`). Candidates may wait up to 24 hours for agent tasks to start.
*   **Proposed Fix**: Transition to a continuous, event-driven queue listener. Trigger background tasks immediately when enqueued, using BullMQ workers to process jobs in real time.

### B. Encrypting Calendar Tokens
*   **Current State**: Mapped Google and Outlook access/refresh tokens are stored as plaintext in the database (`CalendarToken` model). This exposes credentials if the database is compromised.
*   **Proposed Fix**: Encrypt calendar tokens using AES-256-GCM, aligning the credential storage with the secure encryption architecture used for AI provider API keys.

### C. Scaling Real-Time SSE Streams
*   **Current State**: Every client SSE connection to `/api/agents/events` opens a dedicated Redis subscriber client, consuming resources quickly under load.
*   **Proposed Fix**: Implement a shared, ref-counted dispatcher. Maintain a single Redis subscriber per Node.js server process and route events to matching client connections in memory.

---

## 15. Documentation Gaps & Assumptions

To maintain clear and accurate documentation, we explicitly track our assumptions and gaps where code verification is incomplete:

*   **Assumption 1: Server Infrastructure Allocation**: We assume the production Next.js application runs in a containerized environment (Docker/Kubernetes) with at least 1GB of memory. This is required to support concurrent Playwright scrapers and keep active Socket.io connections open.
*   **Assumption 2: Third-Party Data Handling**: We assume external LLM providers (Anthropic, Groq) honor the zero-data-retention headers sent in API requests, keeping user profile data private.
*   **Gap 1: Dynamic Scraper Selectors**: Scrapers targeting external job boards (LinkedIn, Indeed) rely on static HTML element selectors. Changes to these websites' structures may break parsing routes until selectors are updated in the code.

---

## 16. Appendix

### 16.1 Glossary
*   **ATS (Applicant Tracking System)**: Software used by recruiters to automatically screen, sort, and rank resumes based on keyword relevance.
*   **BullMQ**: A robust, Redis-backed queue system used to manage asynchronous tasks in Node.js applications.
*   **EventSource**: The standard web API used to establish Server-Sent Events (SSE) connections and stream real-time updates.
*   **JWT (JSON Web Token)**: A compact, URL-safe container used to securely transmit session information between clients and servers.
*   **RBAC (Role-Based Access Control)**: A security framework that restricts resource access based on assigned user roles.
*   **STAR Method**: An interview response technique structured around **S**ituation, **T**ask, **A**ction, and **R**esult.

### 16.2 Acronyms
*   **API**: Application Programming Interface
*   **2FA**: Two-Factor Authentication
*   **ERD**: Entity Relationship Diagram
*   **SaaS**: Software as a Service
*   **SSE**: Server-Sent Events
*   **TOTP**: Time-Based One-Time Password
*   **HTML**: HyperText Markup Language

### 16.3 Screen Index
*   `/dashboard`: Candidate overview dashboard.
*   `/jobs`: Kanban board pipeline tracking applications.
*   `/resume-lab`: Side-by-side resume optimization workspace.
*   `/interview-prep`: Star Story and Mock prep workspace.
*   `/settings/ai-providers`: Administrator dashboard for model keys and health checks.

### 16.4 Feature Index
*   **Resume Tailoring Engine**: Asynchronous keyword optimization processor.
*   **Real-time SSE Event Bridge**: Ref-counted Socket and EventSource connection broadcaster.
*   **Speakeasy 2FA Engine**: TOTP credential generator and authenticator.
*   **Playwright Job Scraper**: External scraper for job page metadata.
*   **RBAC Policy Middleware**: Security filter for API routes.
