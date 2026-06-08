# CareerPropel

AI-native career management platform with autonomous job application automation.

---

## 1. Executive Summary

CareerPropel is a production-grade AI-assisted career management platform designed to automate the job search and application pipeline. It orchestrates multiple specialized autonomous agents to handle task analysis, profile tailoring, interview preparation, outreach, and analytics.

---

## 2. Core Technology Stack

- **Runtime Environment**: Node.js 20+ / Next.js 14 (App Router)
- **Database Layer**: PostgreSQL via Prisma ORM
- **Task Queue & Orchestration**: BullMQ backed by Redis
- **AI Providers**: Anthropic Claude API (primary) & NVIDIA NIM
- **Authentication**: NextAuth v4 (with 2FA / TOTP)
- **Frontend Architecture**: React 18, Material UI (MUI) v9, Tailwind CSS, Zustand
- **Real-Time Communication**: Server-Sent Events (SSE)

---

## 3. Platform Architecture & Processes

The application runs as three distinct Node.js runtime processes:

1. **Web Server** (`npm run start:web` / `src/bin/web.ts`)
   - Spawns the Next.js HTTP server.
   - Manages client Server-Sent Events (SSE) connections.
2. **Background Worker** (`npm run start:worker` / `src/bin/worker.ts`)
   - Powers the BullMQ execution worker.
   - Runs the main execution worker and 5 domain-specific background workers.
3. **Queue Scheduler** (`npm run start:scheduler` / `src/bin/scheduler.ts`)
   - Manages delayed jobs, cleanup, and stalled task processing.

---

## 4. Key Career Agents

CareerPropel implements 8 core product agents that run as BullMQ queue workers:

| Agent Key | Name | Rationale / Task |
|---|---|---|
| `resume-tailor` | Resume Tailor | Tailors resumes for a specific job description |
| `job-match` | Job Matcher | Computes alignment score across job dimensions |
| `application` | Application Agent | Automates job application submission workflows |
| `research` | Company Researcher | Synthesizes company news, culture, and red flags |
| `interview-prep` | Interview Prep | Generates STAR stories and likely interview questions |
| `networking` | Networking Agent | Drafts outreach strategies and cold messages |
| `follow-up` | Follow-up Agent | Drafts post-interview follow-ups and CTAs |
| `analytics` | Analytics Agent | Computes longitudinal pipeline metrics and health scores |

---

## 5. Directory & File Reference

Detailed repository mapping is available in [repo-index.md](file:///c:/Users/rajaj/CareerPropel/repo-index.md). High-level architecture details can be found in [ARCHITECTURE.md](file:///c:/Users/rajaj/CareerPropel/ARCHITECTURE.md). Coding standards are defined in [CODING_STANDARDS.md](file:///c:/Users/rajaj/CareerPropel/CODING_STANDARDS.md). Domain terms are in [DOMAIN_GLOSSARY.md](file:///c:/Users/rajaj/CareerPropel/DOMAIN_GLOSSARY.md).
