-- AI Governance Phase 1: PromptVersion + AgentExecution provenance fields

-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "PromptVersion" (
    "id" TEXT NOT NULL,
    "capability" TEXT NOT NULL DEFAULT '',
    "agentType" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "template" TEXT NOT NULL DEFAULT '',
    "systemPrompt" TEXT,
    "systemHash" TEXT,
    "userPromptTemplate" TEXT,
    "userPromptHash" TEXT,
    "preprocessingVersion" TEXT DEFAULT '1.0.0',
    "sanitizerVersion" TEXT DEFAULT '1.0.0',
    "outputSchemaVersion" TEXT DEFAULT '1.0.0',
    "changelog" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canaryPercent" INTEGER,
    "createdBy" TEXT,
    "deprecatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "PromptVersion_agentType_isActive_idx" ON "PromptVersion"("agentType", "isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "PromptVersion_agentType_version_key" ON "PromptVersion"("agentType", "version");

-- AlterTable: add provenance + validation fields to AgentExecution (idempotent)
ALTER TABLE "AgentExecution"
    ADD COLUMN IF NOT EXISTS "promptVersionId" TEXT,
    ADD COLUMN IF NOT EXISTS "promptHash" TEXT,
    ADD COLUMN IF NOT EXISTS "modelId" TEXT,
    ADD COLUMN IF NOT EXISTS "provider" TEXT,
    ADD COLUMN IF NOT EXISTS "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "fallbackReason" TEXT,
    ADD COLUMN IF NOT EXISTS "sanitizerVersion" TEXT,
    ADD COLUMN IF NOT EXISTS "inputTokens" INTEGER,
    ADD COLUMN IF NOT EXISTS "outputTokens" INTEGER,
    ADD COLUMN IF NOT EXISTS "costUsd" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "validationPassed" BOOLEAN,
    ADD COLUMN IF NOT EXISTS "validationErrors" JSONB,
    ADD COLUMN IF NOT EXISTS "validationVersion" TEXT,
    ADD COLUMN IF NOT EXISTS "schemaValidated" BOOLEAN,
    ADD COLUMN IF NOT EXISTS "semanticValidated" BOOLEAN,
    ADD COLUMN IF NOT EXISTS "policyValidated" BOOLEAN;

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "AgentExecution_promptVersionId_idx" ON "AgentExecution"("promptVersionId");

-- AddForeignKey (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'AgentExecution_promptVersionId_fkey'
  ) THEN
    ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_promptVersionId_fkey"
        FOREIGN KEY ("promptVersionId") REFERENCES "PromptVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
