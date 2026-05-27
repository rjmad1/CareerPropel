-- AI Governance Phase 1: PromptVersion + AgentExecution provenance fields

-- CreateTable
CREATE TABLE "PromptVersion" (
    "id" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "systemHash" TEXT NOT NULL,
    "userPromptTemplate" TEXT NOT NULL,
    "userPromptHash" TEXT NOT NULL,
    "preprocessingVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "sanitizerVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "outputSchemaVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "changelog" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canaryPercent" INTEGER,
    "createdBy" TEXT,
    "deprecatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptVersion_agentType_isActive_idx" ON "PromptVersion"("agentType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PromptVersion_agentType_version_key" ON "PromptVersion"("agentType", "version");

-- AlterTable: add provenance + validation fields to AgentExecution
ALTER TABLE "AgentExecution"
    ADD COLUMN "promptVersionId" TEXT,
    ADD COLUMN "promptHash" TEXT,
    ADD COLUMN "modelId" TEXT,
    ADD COLUMN "provider" TEXT,
    ADD COLUMN "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "fallbackReason" TEXT,
    ADD COLUMN "sanitizerVersion" TEXT,
    ADD COLUMN "inputTokens" INTEGER,
    ADD COLUMN "outputTokens" INTEGER,
    ADD COLUMN "costUsd" DOUBLE PRECISION,
    ADD COLUMN "validationPassed" BOOLEAN,
    ADD COLUMN "validationErrors" JSONB,
    ADD COLUMN "validationVersion" TEXT,
    ADD COLUMN "schemaValidated" BOOLEAN,
    ADD COLUMN "semanticValidated" BOOLEAN,
    ADD COLUMN "policyValidated" BOOLEAN;

-- CreateIndex
CREATE INDEX "AgentExecution_promptVersionId_idx" ON "AgentExecution"("promptVersionId");

-- AddForeignKey
ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_promptVersionId_fkey"
    FOREIGN KEY ("promptVersionId") REFERENCES "PromptVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
