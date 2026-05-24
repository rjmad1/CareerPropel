-- CreateTable: MockInterviewSession (was in schema but never migrated)
CREATE TABLE IF NOT EXISTS "MockInterviewSession" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT,
    "sessionId" TEXT NOT NULL,
    "questions" JSONB,
    "responses" JSONB,
    "feedback" TEXT,
    "scores" JSONB,
    "strengths" TEXT[] NOT NULL DEFAULT '{}',
    "areasForImprovement" TEXT[] NOT NULL DEFAULT '{}',
    "suggestions" TEXT[] NOT NULL DEFAULT '{}',
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockInterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MockInterviewSession_candidateId_idx" ON "MockInterviewSession"("candidateId");
CREATE INDEX IF NOT EXISTS "MockInterviewSession_jobId_idx" ON "MockInterviewSession"("jobId");

-- AddForeignKey: MockInterviewSession.candidateId → Candidate (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'MockInterviewSession_candidateId_fkey'
  ) THEN
    ALTER TABLE "MockInterviewSession" ADD CONSTRAINT "MockInterviewSession_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey: MockInterviewSession.jobId → Job (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'MockInterviewSession_jobId_fkey'
  ) THEN
    ALTER TABLE "MockInterviewSession" ADD CONSTRAINT "MockInterviewSession_jobId_fkey"
      FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddUniqueConstraint: prevent duplicate sessions per candidate (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'MockInterviewSession_candidateId_sessionId_key'
  ) THEN
    ALTER TABLE "MockInterviewSession" ADD CONSTRAINT "MockInterviewSession_candidateId_sessionId_key"
      UNIQUE ("candidateId", "sessionId");
  END IF;
END $$;

-- AddColumn: AgentExecution.jobId for precise indexed queries (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'AgentExecution' AND column_name = 'jobId'
  ) THEN
    ALTER TABLE "AgentExecution" ADD COLUMN "jobId" TEXT;
  END IF;
END $$;

-- CreateIndex: AgentExecution.jobId (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'AgentExecution_jobId_idx'
  ) THEN
    CREATE INDEX "AgentExecution_jobId_idx" ON "AgentExecution"("jobId");
  END IF;
END $$;
