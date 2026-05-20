-- Migration: RASUI-012 State Machine Enum Conversion
-- Generated: 2026-05-21
-- Purpose: Convert unconstrained String fields to PostgreSQL enums for DB-level
--          state machine integrity (prevents invalid state values from being persisted)
--
-- APPLY WITH: npx prisma migrate dev --name rasui012_state_machine_enums
-- OR manually execute this SQL on your PostgreSQL database.
--
-- IMPORTANT: Run this migration during a maintenance window. The ALTER COLUMN
-- operations below require a brief table lock on each affected table.
-- Estimated downtime: < 5 seconds per table on typical dataset sizes.
--
-- ROLLBACK: See rollback section at bottom of this file.

-- ── Step 1: Create PostgreSQL enum types ────────────────────────────────────

CREATE TYPE "JobStage" AS ENUM (
  'sourced',
  'interested',
  'resume_tailoring',
  'applied',
  'recruiter_screen',
  'hiring_manager',
  'technical_interview',
  'system_design',
  'behavioral',
  'final_round',
  'offer',
  'negotiation',
  'rejected',
  'archived'
);

CREATE TYPE "AgentExecutionStatus" AS ENUM (
  'queued',
  'running',
  'completed',
  'failed'
);

CREATE TYPE "InterviewStatus" AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'rescheduled'
);

CREATE TYPE "OfferStatus" AS ENUM (
  'pending',
  'received',
  'accepted',
  'rejected',
  'negotiating'
);

CREATE TYPE "SkillProficiency" AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

-- ── Step 2: Convert columns to use enum types ────────────────────────────────
-- Uses USING clause to cast existing string values to the enum type.
-- Any row with an invalid stage value will fail here — fix data before migrating.

ALTER TABLE "Job"
  ALTER COLUMN "stage" TYPE "JobStage" USING "stage"::"JobStage";

ALTER TABLE "AgentExecution"
  ALTER COLUMN "status" TYPE "AgentExecutionStatus" USING "status"::"AgentExecutionStatus";

ALTER TABLE "Interview"
  ALTER COLUMN "status" TYPE "InterviewStatus" USING "status"::"InterviewStatus";

ALTER TABLE "Offer"
  ALTER COLUMN "status" TYPE "OfferStatus" USING "status"::"OfferStatus";

ALTER TABLE "Skill"
  ALTER COLUMN "proficiency" TYPE "SkillProficiency" USING "proficiency"::"SkillProficiency";

-- ── Step 3: Update default values to use enum syntax ────────────────────────

ALTER TABLE "Job" ALTER COLUMN "stage" SET DEFAULT 'sourced'::"JobStage";
ALTER TABLE "AgentExecution" ALTER COLUMN "status" SET DEFAULT 'queued'::"AgentExecutionStatus";
ALTER TABLE "Interview" ALTER COLUMN "status" SET DEFAULT 'scheduled'::"InterviewStatus";
ALTER TABLE "Offer" ALTER COLUMN "status" SET DEFAULT 'pending'::"OfferStatus";
ALTER TABLE "Skill" ALTER COLUMN "proficiency" SET DEFAULT 'beginner'::"SkillProficiency";

-- ── ROLLBACK SCRIPT ──────────────────────────────────────────────────────────
-- Execute the following to revert to string columns:
--
-- ALTER TABLE "Job" ALTER COLUMN "stage" TYPE TEXT USING "stage"::TEXT;
-- ALTER TABLE "AgentExecution" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;
-- ALTER TABLE "Interview" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;
-- ALTER TABLE "Offer" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;
-- ALTER TABLE "Skill" ALTER COLUMN "proficiency" TYPE TEXT USING "proficiency"::TEXT;
--
-- DROP TYPE "JobStage";
-- DROP TYPE "AgentExecutionStatus";
-- DROP TYPE "InterviewStatus";
-- DROP TYPE "OfferStatus";
-- DROP TYPE "SkillProficiency";
