-- Migration: RASUI-012 State Machine Enum Conversion
-- Generated: 2026-05-21
-- Purpose: Convert unconstrained String fields to PostgreSQL enums for DB-level
--          state machine integrity (prevents invalid state values from being persisted)

-- ── Step 1: Create PostgreSQL enum types ────────────────────────────────────

DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AgentExecutionStatus" AS ENUM (
    'queued',
    'running',
    'completed',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "InterviewStatus" AS ENUM (
    'scheduled',
    'completed',
    'cancelled',
    'rescheduled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OfferStatus" AS ENUM (
    'pending',
    'received',
    'accepted',
    'rejected',
    'negotiating'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "SkillProficiency" AS ENUM (
    'beginner',
    'intermediate',
    'advanced',
    'expert'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── Step 2: Drop default values ─────────────────────────────────────────────

ALTER TABLE "Job" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "AgentExecution" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Interview" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Offer" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Skill" ALTER COLUMN "proficiency" DROP DEFAULT;

-- ── Step 2.5: Pre-migration validation for enum values ───────────────────────

DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  -- Validate Job.stage
  SELECT COUNT(*) INTO invalid_count FROM "Job" WHERE "stage" IS NOT NULL AND "stage" NOT IN ('sourced', 'interested', 'resume_tailoring', 'applied', 'recruiter_screen', 'hiring_manager', 'technical_interview', 'system_design', 'behavioral', 'final_round', 'offer', 'negotiation', 'rejected', 'archived');
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Job table contains % invalid stage values not in JobStage enum', invalid_count;
  END IF;

  -- Validate AgentExecution.status
  SELECT COUNT(*) INTO invalid_count FROM "AgentExecution" WHERE "status" IS NOT NULL AND "status" NOT IN ('queued', 'running', 'completed', 'failed');
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'AgentExecution table contains % invalid status values not in AgentExecutionStatus enum', invalid_count;
  END IF;

  -- Validate Interview.status
  SELECT COUNT(*) INTO invalid_count FROM "Interview" WHERE "status" IS NOT NULL AND "status" NOT IN ('scheduled', 'completed', 'cancelled', 'rescheduled');
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Interview table contains % invalid status values not in InterviewStatus enum', invalid_count;
  END IF;

  -- Validate Offer.status
  SELECT COUNT(*) INTO invalid_count FROM "Offer" WHERE "status" IS NOT NULL AND "status" NOT IN ('pending', 'received', 'accepted', 'rejected', 'negotiating');
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Offer table contains % invalid status values not in OfferStatus enum', invalid_count;
  END IF;

  -- Validate Skill.proficiency
  SELECT COUNT(*) INTO invalid_count FROM "Skill" WHERE "proficiency" IS NOT NULL AND "proficiency" NOT IN ('beginner', 'intermediate', 'advanced', 'expert');
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Skill table contains % invalid proficiency values not in SkillProficiency enum', invalid_count;
  END IF;
END $$;

-- ── Step 3: Convert columns to use enum types ────────────────────────────────

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

-- ── Step 4: Update default values to use enum syntax ────────────────────────

ALTER TABLE "Job" ALTER COLUMN "stage" SET DEFAULT 'sourced'::"JobStage";
ALTER TABLE "AgentExecution" ALTER COLUMN "status" SET DEFAULT 'queued'::"AgentExecutionStatus";
ALTER TABLE "Interview" ALTER COLUMN "status" SET DEFAULT 'scheduled'::"InterviewStatus";
ALTER TABLE "Offer" ALTER COLUMN "status" SET DEFAULT 'pending'::"OfferStatus";
ALTER TABLE "Skill" ALTER COLUMN "proficiency" SET DEFAULT 'beginner'::"SkillProficiency";
