-- CreateTable: Accomplishment
-- Stores continuous career wins, quantified STAR moments, and staged review material.
CREATE TABLE IF NOT EXISTS "Accomplishment" (
    "id"          TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "date"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category"    TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metrics"     TEXT,
    "starContext" TEXT,
    "visibility"  TEXT NOT NULL DEFAULT 'private',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accomplishment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Accomplishment_candidateId_idx" ON "Accomplishment"("candidateId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Accomplishment_candidateId_fkey'
  ) THEN
    ALTER TABLE "Accomplishment" ADD CONSTRAINT "Accomplishment_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable: AppraisalSession
-- Persists AI-compiled self-evaluation and promotion business case drafts.
CREATE TABLE IF NOT EXISTS "AppraisalSession" (
    "id"          TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "startDate"   TIMESTAMP(3) NOT NULL,
    "endDate"     TIMESTAMP(3) NOT NULL,
    "status"      TEXT NOT NULL DEFAULT 'draft',
    "selfReview"  TEXT,
    "impactDraft" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppraisalSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AppraisalSession_candidateId_idx" ON "AppraisalSession"("candidateId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'AppraisalSession_candidateId_fkey'
  ) THEN
    ALTER TABLE "AppraisalSession" ADD CONSTRAINT "AppraisalSession_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
