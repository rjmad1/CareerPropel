-- Runtime Modernization: extend AgentExecution, ToolCall, EventLog
-- AgentExecution table already exists from reconcile_domain_model; use ADD COLUMN IF NOT EXISTS

-- Extend AgentExecution with queue/runtime fields
ALTER TABLE "AgentExecution"
    ADD COLUMN IF NOT EXISTS "jobId" TEXT,
    ADD COLUMN IF NOT EXISTS "queueJobId" TEXT,
    ADD COLUMN IF NOT EXISTS "currentTask" TEXT,
    ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "providerId" TEXT,
    ADD COLUMN IF NOT EXISTS "requestId" TEXT,
    ADD COLUMN IF NOT EXISTS "correlationId" TEXT,
    ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Extend ToolCall with additional tracking fields
ALTER TABLE "ToolCall"
    ADD COLUMN IF NOT EXISTS "toolName" TEXT,
    ADD COLUMN IF NOT EXISTS "durationMs" INTEGER,
    ADD COLUMN IF NOT EXISTS "tokens" INTEGER;

-- Extend EventLog if table already exists; otherwise create it fresh
CREATE TABLE IF NOT EXISTS "EventLog" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for Job → AgentExecution if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'AgentExecution_jobId_fkey'
  ) THEN
    ALTER TABLE "AgentExecution"
    ADD CONSTRAINT "AgentExecution_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "Job"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "AgentExecution_queueJobId_idx" ON "AgentExecution"("queueJobId");
CREATE INDEX IF NOT EXISTS "AgentExecution_agentType_createdAt_idx" ON "AgentExecution"("agentType", "createdAt");
CREATE INDEX IF NOT EXISTS "ToolCall_toolName_idx" ON "ToolCall"("toolName");
CREATE INDEX IF NOT EXISTS "EventLog_executionId_timestamp_idx" ON "EventLog"("executionId", "timestamp");
CREATE INDEX IF NOT EXISTS "EventLog_level_timestamp_idx" ON "EventLog"("level", "timestamp");

-- EventLog FK (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'EventLog_executionId_fkey'
  ) THEN
    ALTER TABLE "EventLog"
    ADD CONSTRAINT "EventLog_executionId_fkey"
    FOREIGN KEY ("executionId") REFERENCES "AgentExecution"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
